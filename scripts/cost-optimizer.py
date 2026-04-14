#!/usr/bin/env python3
"""
Cloudach GPU Cost Optimization Engine

Analyzes cluster utilization metrics and recommends the optimal mix of
on-demand, spot, and reserved GPU instances to minimize cost while meeting
SLO requirements.

Usage:
    python scripts/cost-optimizer.py --help
    python scripts/cost-optimizer.py --daily-active-hours 8 --peak-rps 20
    python scripts/cost-optimizer.py --mode advisor  # interactive
    python scripts/cost-optimizer.py --mode batch --avg-tokens-per-day 500000000

Prerequisites:
    pip install rich tabulate
"""

import argparse
import json
import sys
from dataclasses import dataclass, field
from typing import Optional

try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich.text import Text
except ImportError:
    print("Install dependencies first: pip install rich")
    sys.exit(1)

console = Console()


# ---------------------------------------------------------------------------
# Instance catalog — GCP L4 (current cluster) + AWS (future/comparison)
# ---------------------------------------------------------------------------

@dataclass
class GPUInstance:
    provider: str
    name: str
    gpu_model: str
    gpu_count: int
    vcpu: int
    ram_gb: int
    on_demand_usd_hr: float
    reserved_1yr_usd_hr: float   # 0 if no reservation available
    spot_usd_hr: float            # 0 if spot not viable for this class
    tokens_per_sec: int           # vLLM throughput at 70% GPU util, 8B model


GCP_L4_INSTANCES = [
    GPUInstance("GCP", "g2-standard-8",  "L4", 1, 8,  32,  0.8970, 0.5740, 0.2691, 1200),
    GPUInstance("GCP", "g2-standard-16", "L4", 1, 16, 64,  1.1170, 0.7150, 0.3351, 1200),
    GPUInstance("GCP", "g2-standard-24", "L4", 2, 24, 96,  1.7830, 1.1410, 0.5349, 2400),
    GPUInstance("GCP", "g2-standard-48", "L4", 4, 48, 192, 3.5030, 2.2420, 1.0509, 4800),
]

AWS_GPU_INSTANCES = [
    GPUInstance("AWS", "g6.2xlarge",   "L4",   1, 8,   32,   0.8236, 0.5264, 0.2471, 1200),
    GPUInstance("AWS", "g6.12xlarge",  "L4",   4, 48,  192,  3.3958, 2.1732, 1.0187, 4800),
    GPUInstance("AWS", "g6.48xlarge",  "L4",   8, 192, 768, 13.3523, 8.5455, 4.0057, 9600),
    GPUInstance("AWS", "p4d.24xlarge", "A100", 8, 96, 1152, 32.7726, 22.1040, 0.0,  18000),
    GPUInstance("AWS", "g5.2xlarge",   "A10G", 1, 8,   32,   1.2120, 0.7757, 0.3636, 1400),
    GPUInstance("AWS", "g5.12xlarge",  "A10G", 4, 48,  192,  5.6720, 3.6301, 1.7016, 5600),
]

# Fixed infrastructure costs (always-on, not GPU)
FIXED_INFRA_USD_HR = 0.238  # GKE control plane + system nodes + LB + Postgres + Redis


# ---------------------------------------------------------------------------
# Cost scenarios
# ---------------------------------------------------------------------------

@dataclass
class ClusterScenario:
    name: str
    description: str
    on_demand_count: int
    spot_count: int
    reserved_count: int
    instance: GPUInstance
    active_hours_per_day: float = 24.0

    @property
    def total_instances(self) -> int:
        return self.on_demand_count + self.spot_count + self.reserved_count

    def hourly_cost(self) -> float:
        od = self.on_demand_count * self.instance.on_demand_usd_hr
        sp = self.spot_count * self.instance.spot_usd_hr
        rs = self.reserved_count * self.instance.reserved_1yr_usd_hr
        return od + sp + rs + FIXED_INFRA_USD_HR

    def monthly_cost(self, active_hrs_per_day: Optional[float] = None) -> float:
        hrs = active_hrs_per_day or self.active_hours_per_day
        gpu_cost = (
            self.on_demand_count * self.instance.on_demand_usd_hr * hrs * 30
            + self.spot_count * self.instance.spot_usd_hr * hrs * 30
            + self.reserved_count * self.instance.reserved_1yr_usd_hr * 24 * 30
        )
        return gpu_cost + FIXED_INFRA_USD_HR * 24 * 30

    def peak_throughput_tps(self) -> int:
        return self.total_instances * self.instance.tokens_per_sec

    def cost_per_million_tokens(self, utilization: float = 0.70) -> float:
        tokens_per_hr = self.peak_throughput_tps() * 3600 * utilization
        if tokens_per_hr == 0:
            return float("inf")
        return self.hourly_cost() / (tokens_per_hr / 1_000_000)


# ---------------------------------------------------------------------------
# Recommendation engine
# ---------------------------------------------------------------------------

@dataclass
class WorkloadProfile:
    daily_active_hours: float     # hours/day the GPU is under significant load
    peak_rps: int                 # peak requests per second
    avg_tokens_per_request: int   # combined input+output
    slo_ttft_ms: int              # p99 TTFT SLO
    workload_type: str            # "realtime" | "batch" | "mixed"
    monthly_token_budget: int     # 0 = no budget constraint
    interruption_tolerance: str   # "none" | "low" | "medium" | "high"


def recommend(profile: WorkloadProfile, instance: GPUInstance) -> list[ClusterScenario]:
    """
    Generate ranked cluster configurations for the given workload profile.
    Returns scenarios sorted by monthly cost (cheapest first).
    """
    scenarios = []

    # Compute minimum replicas needed for peak RPS
    tokens_per_sec_needed = profile.peak_rps * profile.avg_tokens_per_request
    min_replicas = max(1, -(-tokens_per_sec_needed // instance.tokens_per_sec))  # ceiling div

    if profile.interruption_tolerance == "none":
        # All on-demand: maximum reliability
        scenarios.append(ClusterScenario(
            name="All On-Demand",
            description="Zero spot exposure. Best for production with strict SLOs.",
            on_demand_count=min_replicas,
            spot_count=0,
            reserved_count=0,
            instance=instance,
            active_hours_per_day=profile.daily_active_hours,
        ))
        # Reserved baseline, on-demand burst
        if profile.daily_active_hours >= 18:
            scenarios.append(ClusterScenario(
                name="Reserved Baseline + On-Demand Burst",
                description="Reserved for steady traffic; on-demand for burst. Best at high utilization.",
                on_demand_count=max(0, min_replicas - 1),
                spot_count=0,
                reserved_count=min(1, min_replicas),
                instance=instance,
                active_hours_per_day=profile.daily_active_hours,
            ))

    elif profile.interruption_tolerance in ("low", "medium"):
        # 1 on-demand baseline + spot burst
        burst = max(0, min_replicas - 1)
        scenarios.append(ClusterScenario(
            name="1 On-Demand + Spot Burst",
            description="On-demand baseline prevents cold start on first request. Spot reduces burst cost ~70%.",
            on_demand_count=1,
            spot_count=burst,
            reserved_count=0,
            instance=instance,
            active_hours_per_day=profile.daily_active_hours,
        ))
        # All on-demand as fallback comparison
        scenarios.append(ClusterScenario(
            name="All On-Demand (Baseline Comparison)",
            description="Reference: no spot exposure.",
            on_demand_count=min_replicas,
            spot_count=0,
            reserved_count=0,
            instance=instance,
            active_hours_per_day=profile.daily_active_hours,
        ))

    elif profile.interruption_tolerance == "high":
        # All spot (batch / dev use)
        scenarios.append(ClusterScenario(
            name="All Spot",
            description="Maximum savings. Tolerate 2–5% hourly preemption risk. Suitable for batch only.",
            on_demand_count=0,
            spot_count=min_replicas,
            reserved_count=0,
            instance=instance,
            active_hours_per_day=profile.daily_active_hours,
        ))
        scenarios.append(ClusterScenario(
            name="1 On-Demand + Spot Workers",
            description="Minimal on-demand anchor; remaining capacity on spot.",
            on_demand_count=1,
            spot_count=max(0, min_replicas - 1),
            reserved_count=0,
            instance=instance,
            active_hours_per_day=profile.daily_active_hours,
        ))

    # KEDA scale-to-zero variant (only meaningful for low daily hours)
    if profile.daily_active_hours < 16:
        base = scenarios[0] if scenarios else ClusterScenario(
            name="",
            description="",
            on_demand_count=min_replicas,
            spot_count=0,
            reserved_count=0,
            instance=instance,
        )
        scenarios.insert(0, ClusterScenario(
            name="KEDA Scale-to-Zero",
            description=f"GPU pods scale to 0 when idle. Active ~{profile.daily_active_hours:.0f} hrs/day.",
            on_demand_count=base.on_demand_count,
            spot_count=base.spot_count,
            reserved_count=base.reserved_count,
            instance=instance,
            active_hours_per_day=profile.daily_active_hours,
        ))

    return sorted(scenarios, key=lambda s: s.monthly_cost())


# ---------------------------------------------------------------------------
# Output helpers
# ---------------------------------------------------------------------------

def print_scenario_table(scenarios: list[ClusterScenario], profile: WorkloadProfile) -> None:
    table = Table(
        title="Cluster Cost Scenarios",
        show_header=True,
        header_style="bold cyan",
    )
    table.add_column("Scenario", style="bold white", min_width=30)
    table.add_column("OD", justify="right")
    table.add_column("Spot", justify="right")
    table.add_column("Rsv", justify="right")
    table.add_column("$/hr", justify="right")
    table.add_column("$/mo", justify="right", style="bold")
    table.add_column("Pk TPS", justify="right")
    table.add_column("$/1M tok", justify="right")

    cheapest_cost = min(s.monthly_cost() for s in scenarios)
    most_expensive = max(s.monthly_cost() for s in scenarios)

    for s in scenarios:
        monthly = s.monthly_cost()
        savings = ""
        if monthly == cheapest_cost and monthly < most_expensive:
            name_display = f"[green]{s.name} ✓[/green]"
        else:
            pct = ((monthly - cheapest_cost) / cheapest_cost * 100) if cheapest_cost > 0 else 0
            name_display = f"{s.name} (+{pct:.0f}%)"

        table.add_row(
            name_display,
            str(s.on_demand_count),
            str(s.spot_count),
            str(s.reserved_count),
            f"${s.hourly_cost():.3f}",
            f"${monthly:,.0f}",
            f"{s.peak_throughput_tps():,}",
            f"${s.cost_per_million_tokens():.4f}",
        )
    console.print(table)


def print_recommendation(scenarios: list[ClusterScenario], profile: WorkloadProfile) -> None:
    best = scenarios[0]
    if len(scenarios) > 1:
        worst = max(scenarios, key=lambda s: s.monthly_cost())
        savings_vs_worst = worst.monthly_cost() - best.monthly_cost()
        savings_pct = savings_vs_worst / worst.monthly_cost() * 100 if worst.monthly_cost() > 0 else 0
    else:
        savings_vs_worst = 0
        savings_pct = 0

    lines = [
        f"[bold green]Recommended:[/bold green] {best.name}",
        f"[dim]{best.description}[/dim]",
        "",
        f"  On-demand replicas : {best.on_demand_count}",
        f"  Spot replicas      : {best.spot_count}",
        f"  Reserved replicas  : {best.reserved_count}",
        f"  Instance type      : {best.instance.name} ({best.instance.gpu_model})",
        f"  Est. monthly cost  : ${best.monthly_cost():,.0f}/mo",
        f"  Peak throughput    : {best.peak_throughput_tps():,} tok/s",
        f"  Cost per 1M tokens : ${best.cost_per_million_tokens():.4f}",
    ]
    if savings_vs_worst > 0:
        lines.append(f"  Savings vs worst   : ${savings_vs_worst:,.0f}/mo ({savings_pct:.0f}%)")

    console.print(Panel("\n".join(lines), title="[bold]Cost Optimization Recommendation[/bold]", border_style="green"))


def print_spot_risk(profile: WorkloadProfile) -> None:
    risk_table = Table(title="Spot Interruption Risk Assessment", header_style="bold yellow")
    risk_table.add_column("Risk Factor", style="bold")
    risk_table.add_column("Assessment")
    risk_table.add_column("Mitigation")

    risk_table.add_row(
        "Preemption frequency",
        "~2–5% per hour for L4/A10G in us-central1",
        "Keep ≥1 on-demand baseline pod",
    )
    risk_table.add_row(
        "Model reload latency",
        "~90s cold start; ~30s with PVC model cache",
        "Pre-warm PVC; KEDA activation delay buffer",
    )
    risk_table.add_row(
        "SLO impact on preemption",
        f"p99 TTFT SLO: {profile.slo_ttft_ms}ms — requests in-flight fail",
        "Client retry with exponential backoff",
    )
    risk_table.add_row(
        "Spot availability zones",
        "May vary; request multiple AZs",
        "Node affinity: spread across AZs",
    )
    risk_table.add_row(
        "Interruption notice",
        "GCP: 30s; AWS: 2min Spot Interruption Notice",
        "Drain in-flight requests; KEDA detects loss",
    )

    if profile.workload_type == "batch":
        risk_table.add_row(
            "Batch job checkpoint",
            "Non-real-time: tolerate restarts",
            "Checkpoint every N tokens; resume on restart",
        )
    console.print(risk_table)


# ---------------------------------------------------------------------------
# Batch inference analysis
# ---------------------------------------------------------------------------

def batch_analysis(tokens_per_day: int, instance: GPUInstance) -> None:
    console.rule("[bold blue]Batch Inference Cost Analysis[/bold blue]")

    # Batch jobs run during off-peak hours (assume 6hr window)
    batch_window_hrs = 6
    tokens_per_hr_needed = tokens_per_day / batch_window_hrs
    replicas_needed = max(1, int(tokens_per_hr_needed / (instance.tokens_per_sec * 3600)) + 1)

    table = Table(title=f"Batch Job: {tokens_per_day:,} tokens/day on {instance.name}", header_style="bold")
    table.add_column("Configuration")
    table.add_column("Replicas", justify="right")
    table.add_column("Window (hr)", justify="right")
    table.add_column("Cost/run ($)", justify="right")
    table.add_column("Cost/day ($)", justify="right")
    table.add_column("Cost/1M tok ($)", justify="right")

    configs = [
        ("On-demand only",         replicas_needed, 0,                instance.on_demand_usd_hr),
        ("All spot",               replicas_needed, 0,                instance.spot_usd_hr),
        ("Reserved (1yr commit)",  replicas_needed, 0,                instance.reserved_1yr_usd_hr),
        ("1 on-demand + spot",     max(1, replicas_needed - 1), 1,    instance.spot_usd_hr),
    ]

    for name, reps, od_count, rate in configs:
        if name == "1 on-demand + spot":
            run_cost = (od_count * instance.on_demand_usd_hr + reps * rate) * batch_window_hrs
        else:
            run_cost = reps * rate * batch_window_hrs
        cost_per_day = run_cost + FIXED_INFRA_USD_HR * 24
        cost_per_M = run_cost / (tokens_per_day / 1_000_000)
        table.add_row(name, str(reps), str(batch_window_hrs), f"${run_cost:.2f}",
                      f"${cost_per_day:.2f}", f"${cost_per_M:.4f}")

    console.print(table)
    console.print(
        f"\n[dim]Assumes {batch_window_hrs}hr batch window, "
        f"{instance.tokens_per_sec:,} tok/s/replica at 70% utilization.[/dim]\n"
    )


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="Cloudach GPU Cost Optimization Engine",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument("--mode", choices=["advisor", "batch", "compare"], default="advisor",
                   help="Operation mode (default: advisor)")
    p.add_argument("--provider", choices=["gcp", "aws"], default="gcp",
                   help="Cloud provider for instance catalog (default: gcp)")
    p.add_argument("--instance", default="g2-standard-8",
                   help="Instance type (default: g2-standard-8)")
    p.add_argument("--daily-active-hours", type=float, default=8.0,
                   help="Hours/day the GPU is under significant load (default: 8)")
    p.add_argument("--peak-rps", type=int, default=5,
                   help="Peak requests per second (default: 5)")
    p.add_argument("--avg-tokens-per-request", type=int, default=600,
                   help="Avg combined input+output tokens per request (default: 600)")
    p.add_argument("--slo-ttft-ms", type=int, default=2000,
                   help="p99 TTFT SLO in milliseconds (default: 2000)")
    p.add_argument("--workload-type", choices=["realtime", "batch", "mixed"], default="realtime",
                   help="Workload type for risk scoring (default: realtime)")
    p.add_argument("--interruption-tolerance",
                   choices=["none", "low", "medium", "high"], default="low",
                   help="Spot interruption tolerance (default: low)")
    p.add_argument("--avg-tokens-per-day", type=int, default=0,
                   help="Batch mode: total tokens to process per day (0 = skip batch analysis)")
    p.add_argument("--json", action="store_true", dest="output_json",
                   help="Output JSON instead of rich tables")
    return p


def find_instance(provider: str, name: str) -> GPUInstance:
    catalog = GCP_L4_INSTANCES if provider == "gcp" else AWS_GPU_INSTANCES
    for inst in catalog:
        if inst.name == name:
            return inst
    available = ", ".join(i.name for i in catalog)
    console.print(f"[red]Unknown instance '{name}'. Available for {provider}: {available}[/red]")
    sys.exit(1)


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    instance = find_instance(args.provider, args.instance)

    profile = WorkloadProfile(
        daily_active_hours=args.daily_active_hours,
        peak_rps=args.peak_rps,
        avg_tokens_per_request=args.avg_tokens_per_request,
        slo_ttft_ms=args.slo_ttft_ms,
        workload_type=args.workload_type,
        monthly_token_budget=0,
        interruption_tolerance=args.interruption_tolerance,
    )

    console.rule(f"[bold cyan]Cloudach GPU Cost Optimizer — {instance.name} ({instance.gpu_model})[/bold cyan]")
    console.print(f"  Provider        : {instance.provider}")
    console.print(f"  Workload type   : {profile.workload_type}")
    console.print(f"  Peak RPS        : {profile.peak_rps}")
    console.print(f"  Daily GPU hours : {profile.daily_active_hours}")
    console.print(f"  Interruption OK : {profile.interruption_tolerance}")
    console.print()

    scenarios = recommend(profile, instance)

    if args.output_json:
        output = []
        for s in scenarios:
            output.append({
                "name": s.name,
                "on_demand_count": s.on_demand_count,
                "spot_count": s.spot_count,
                "reserved_count": s.reserved_count,
                "hourly_usd": round(s.hourly_cost(), 4),
                "monthly_usd": round(s.monthly_cost(), 2),
                "peak_tps": s.peak_throughput_tps(),
                "cost_per_million_tokens": round(s.cost_per_million_tokens(), 5),
            })
        print(json.dumps({"scenarios": output, "recommended": output[0]}, indent=2))
        return

    print_scenario_table(scenarios, profile)
    console.print()
    print_recommendation(scenarios, profile)
    console.print()
    print_spot_risk(profile)

    if args.avg_tokens_per_day > 0:
        console.print()
        batch_analysis(args.avg_tokens_per_day, instance)

    if args.mode == "compare":
        console.rule("[bold]Instance Comparison[/bold]")
        all_instances = GCP_L4_INSTANCES + AWS_GPU_INSTANCES
        comp_table = Table(title="All GPU Instances — Single Replica, 8hr/day", header_style="bold")
        comp_table.add_column("Provider")
        comp_table.add_column("Instance")
        comp_table.add_column("GPU")
        comp_table.add_column("On-Demand $/hr", justify="right")
        comp_table.add_column("Spot $/hr", justify="right")
        comp_table.add_column("Reserved $/hr", justify="right")
        comp_table.add_column("TPS", justify="right")
        comp_table.add_column("$/mo (8hr OD)", justify="right")
        for inst in sorted(all_instances, key=lambda i: i.on_demand_usd_hr):
            monthly = inst.on_demand_usd_hr * 8 * 30 + FIXED_INFRA_USD_HR * 24 * 30
            comp_table.add_row(
                inst.provider, inst.name, inst.gpu_model,
                f"${inst.on_demand_usd_hr:.4f}",
                f"${inst.spot_usd_hr:.4f}" if inst.spot_usd_hr > 0 else "N/A",
                f"${inst.reserved_1yr_usd_hr:.4f}" if inst.reserved_1yr_usd_hr > 0 else "N/A",
                f"{inst.tokens_per_sec:,}",
                f"${monthly:,.0f}",
            )
        console.print(comp_table)


if __name__ == "__main__":
    main()
