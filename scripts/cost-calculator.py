#!/usr/bin/env python3
"""
Cloudach GPU Cost Calculator

Interactive calculator for estimating monthly infrastructure costs across
on-demand, spot, and reserved GPU instances with real-time pricing.

Supports GCP (current cluster) and AWS (future/comparison).

Usage:
    python scripts/cost-calculator.py                      # interactive mode
    python scripts/cost-calculator.py --scenario staging   # preset scenario
    python scripts/cost-calculator.py --scenario production-light
    python scripts/cost-calculator.py --scenario production-mid
    python scripts/cost-calculator.py --scenario enterprise
    python scripts/cost-calculator.py --json               # JSON output for all scenarios

Prerequisites:
    pip install rich
"""

import argparse
import json
import sys
from dataclasses import dataclass

try:
    from rich.console import Console
    from rich.table import Table
    from rich.panel import Panel
    from rich import box
except ImportError:
    print("Install dependencies first: pip install rich")
    sys.exit(1)

console = Console()


# ---------------------------------------------------------------------------
# Pricing catalog (April 2026)
# ---------------------------------------------------------------------------

PRICING = {
    "gcp": {
        "g2-standard-8":  {"gpu": "L4 ×1",  "on_demand": 0.897,  "spot": 0.269,  "reserved_1yr": 0.574},
        "g2-standard-16": {"gpu": "L4 ×1",  "on_demand": 1.117,  "spot": 0.335,  "reserved_1yr": 0.715},
        "g2-standard-24": {"gpu": "L4 ×2",  "on_demand": 1.783,  "spot": 0.535,  "reserved_1yr": 1.141},
        "g2-standard-48": {"gpu": "L4 ×4",  "on_demand": 3.503,  "spot": 1.051,  "reserved_1yr": 2.242},
    },
    "aws": {
        "g6.2xlarge":    {"gpu": "L4 ×1",   "on_demand": 0.8236, "spot": 0.2471, "reserved_1yr": 0.5264},
        "g6.12xlarge":   {"gpu": "L4 ×4",   "on_demand": 3.3958, "spot": 1.0187, "reserved_1yr": 2.1732},
        "g6.48xlarge":   {"gpu": "L4 ×8",   "on_demand": 13.3523,"spot": 4.0057, "reserved_1yr": 8.5455},
        "g5.2xlarge":    {"gpu": "A10G ×1", "on_demand": 1.2120, "spot": 0.3636, "reserved_1yr": 0.7757},
        "g5.12xlarge":   {"gpu": "A10G ×4", "on_demand": 5.6720, "spot": 1.7016, "reserved_1yr": 3.6301},
        "p4d.24xlarge":  {"gpu": "A100 ×8", "on_demand": 32.7726,"spot": 0.0,    "reserved_1yr": 22.1040},
    },
}

# Fixed infra (GKE control plane, system nodes, LB, Postgres, Redis)
FIXED_INFRA_PER_MONTH = 171.36  # $0.238/hr × 24 × 30

# Batch discount factor applied to spot for committed batch workloads
BATCH_SPOT_EFFICIENCY = 0.95  # 5% less efficient than real-time due to job overhead


# ---------------------------------------------------------------------------
# Scenarios
# ---------------------------------------------------------------------------

@dataclass
class Scenario:
    name: str
    description: str
    provider: str
    instance_type: str
    on_demand_replicas: int
    spot_replicas: int
    reserved_replicas: int
    active_hours_per_day: float   # for GPU cost; fixed infra is always 24hr
    batch_tokens_per_month: int   # 0 = no batch workload
    note: str = ""


PRESETS = {
    "staging": Scenario(
        name="Staging",
        description="Dev/test environment. Single L4, scale-to-zero via KEDA.",
        provider="gcp",
        instance_type="g2-standard-8",
        on_demand_replicas=1,
        spot_replicas=0,
        reserved_replicas=0,
        active_hours_per_day=8,
        batch_tokens_per_month=0,
        note="GPU active only during business hours (8hr/day). Scale-to-zero reduces staging GPU cost ~73% vs always-on.",
    ),
    "production-light": Scenario(
        name="Production Light",
        description="1–10 customers, low traffic. 1 on-demand + spot burst.",
        provider="gcp",
        instance_type="g2-standard-8",
        on_demand_replicas=1,
        spot_replicas=1,
        reserved_replicas=0,
        active_hours_per_day=24,
        batch_tokens_per_month=0,
        note="1 on-demand baseline (always warm) + 1 spot burst active ~4hr/day average.",
    ),
    "production-mid": Scenario(
        name="Production Mid-Tier",
        description="~50 customers, 500M tokens/month. Reserved + spot burst.",
        provider="gcp",
        instance_type="g2-standard-8",
        on_demand_replicas=0,
        spot_replicas=2,
        reserved_replicas=2,
        active_hours_per_day=24,
        batch_tokens_per_month=200_000_000,
        note="2 reserved instances for steady traffic + 2 spot for peak burst. Batch: 200M tokens/month off-peak.",
    ),
    "enterprise": Scenario(
        name="Enterprise",
        description="Dedicated tenant cluster, 70B model. 2× g2-standard-24 (2 L4 each).",
        provider="gcp",
        instance_type="g2-standard-24",
        on_demand_replicas=2,
        spot_replicas=0,
        reserved_replicas=0,
        active_hours_per_day=24,
        batch_tokens_per_month=0,
        note="Dedicated GPU nodes for enterprise SLA. Tensor-parallel across 2 nodes for Llama 3 70B.",
    ),
    "aws-comparison": Scenario(
        name="AWS Comparison (g6.2xlarge)",
        description="Equivalent to g2-standard-8. On-demand + spot burst.",
        provider="aws",
        instance_type="g6.2xlarge",
        on_demand_replicas=1,
        spot_replicas=1,
        reserved_replicas=0,
        active_hours_per_day=24,
        batch_tokens_per_month=0,
        note="AWS g6.2xlarge with L4 GPU. Reserved 1yr: $0.5264/hr (~36% savings vs on-demand).",
    ),
}


# ---------------------------------------------------------------------------
# Calculation engine
# ---------------------------------------------------------------------------

def calculate_monthly(scenario: Scenario) -> dict:
    prices = PRICING[scenario.provider][scenario.instance_type]

    # GPU costs
    od_hours = scenario.on_demand_replicas * scenario.active_hours_per_day * 30
    spot_hours = scenario.spot_replicas * scenario.active_hours_per_day * 30
    rsv_hours = scenario.reserved_replicas * 24 * 30  # reserved = always billed

    gpu_on_demand = od_hours * prices["on_demand"]
    gpu_spot = spot_hours * prices["spot"]
    gpu_reserved = rsv_hours * prices["reserved_1yr"]
    gpu_total = gpu_on_demand + gpu_spot + gpu_reserved

    total = gpu_total + FIXED_INFRA_PER_MONTH

    # Batch cost estimate (spot instances, off-peak window)
    batch_cost = 0.0
    if scenario.batch_tokens_per_month > 0:
        # Assume 500 tokens/sec per replica at 70% util in batch mode
        tps_batch = 500 * BATCH_SPOT_EFFICIENCY
        batch_hrs = scenario.batch_tokens_per_month / (tps_batch * 3600)
        batch_cost = batch_hrs * prices["spot"]
        total += batch_cost

    return {
        "gpu_on_demand_usd": round(gpu_on_demand, 2),
        "gpu_spot_usd": round(gpu_spot, 2),
        "gpu_reserved_usd": round(gpu_reserved, 2),
        "gpu_total_usd": round(gpu_total, 2),
        "batch_cost_usd": round(batch_cost, 2),
        "fixed_infra_usd": round(FIXED_INFRA_PER_MONTH, 2),
        "total_monthly_usd": round(total, 2),
    }


def all_on_demand_cost(scenario: Scenario) -> float:
    prices = PRICING[scenario.provider][scenario.instance_type]
    total_replicas = scenario.on_demand_replicas + scenario.spot_replicas + scenario.reserved_replicas
    hours = total_replicas * scenario.active_hours_per_day * 30
    return hours * prices["on_demand"] + FIXED_INFRA_PER_MONTH


# ---------------------------------------------------------------------------
# Display
# ---------------------------------------------------------------------------

def print_scenario(scenario: Scenario) -> None:
    calc = calculate_monthly(scenario)
    prices = PRICING[scenario.provider][scenario.instance_type]
    total_replicas = scenario.on_demand_replicas + scenario.spot_replicas + scenario.reserved_replicas

    # Cost breakdown panel
    lines = [
        f"[bold]{scenario.name}[/bold]",
        f"[dim]{scenario.description}[/dim]",
        "",
        f"  Instance        : {scenario.provider.upper()} {scenario.instance_type} ({prices['gpu']})",
        f"  On-demand pods  : {scenario.on_demand_replicas}  × ${prices['on_demand']:.4f}/hr",
        f"  Spot pods       : {scenario.spot_replicas}  × ${prices['spot']:.4f}/hr",
        f"  Reserved pods   : {scenario.reserved_replicas}  × ${prices['reserved_1yr']:.4f}/hr (1yr CUD)",
        f"  Active hrs/day  : {scenario.active_hours_per_day:.0f}hr",
        "",
        "[bold]Monthly Cost Breakdown[/bold]",
        f"  GPU on-demand   : ${calc['gpu_on_demand_usd']:>8,.2f}",
        f"  GPU spot        : ${calc['gpu_spot_usd']:>8,.2f}",
        f"  GPU reserved    : ${calc['gpu_reserved_usd']:>8,.2f}",
    ]
    if calc["batch_cost_usd"] > 0:
        lines.append(f"  Batch workload  : ${calc['batch_cost_usd']:>8,.2f}")
    lines += [
        f"  Fixed infra     : ${calc['fixed_infra_usd']:>8,.2f}",
        "  " + "─" * 32,
        f"  [bold green]TOTAL           : ${calc['total_monthly_usd']:>8,.2f}/mo[/bold green]",
    ]

    if total_replicas > 0:
        all_od = all_on_demand_cost(scenario)
        savings = all_od - calc["total_monthly_usd"]
        if savings > 1:
            lines.append(f"  [dim]Savings vs all on-demand: ${savings:,.0f}/mo ({savings/all_od*100:.0f}%)[/dim]")

    if scenario.note:
        lines += ["", f"[dim italic]{scenario.note}[/dim italic]"]

    console.print(Panel("\n".join(lines), border_style="blue", padding=(0, 1)))


def print_comparison_table(scenarios: dict) -> None:
    table = Table(
        title="Monthly Cost Comparison — All Scenarios",
        box=box.ROUNDED,
        header_style="bold cyan",
    )
    table.add_column("Scenario", min_width=25)
    table.add_column("Instance", min_width=16)
    table.add_column("OD", justify="right")
    table.add_column("Spot", justify="right")
    table.add_column("Rsv", justify="right")
    table.add_column("Active hr/d", justify="right")
    table.add_column("GPU $/mo", justify="right")
    table.add_column("Total $/mo", justify="right", style="bold")

    sorted_scenarios = sorted(scenarios.items(), key=lambda kv: calculate_monthly(kv[1])["total_monthly_usd"])

    for key, s in sorted_scenarios:
        calc = calculate_monthly(s)
        table.add_row(
            s.name,
            f"{s.provider.upper()} {s.instance_type}",
            str(s.on_demand_replicas),
            str(s.spot_replicas),
            str(s.reserved_replicas),
            f"{s.active_hours_per_day:.0f}",
            f"${calc['gpu_total_usd']:,.0f}",
            f"${calc['total_monthly_usd']:,.0f}",
        )
    console.print(table)


# ---------------------------------------------------------------------------
# Interactive mode
# ---------------------------------------------------------------------------

def interactive_mode() -> None:
    console.rule("[bold cyan]Cloudach GPU Cost Calculator — Interactive Mode[/bold cyan]")
    console.print("Enter your cluster configuration. Press Enter to accept defaults.\n")

    provider = console.input("[cyan]Provider (gcp/aws) [gcp]:[/cyan] ").strip() or "gcp"
    if provider not in PRICING:
        console.print(f"[red]Unknown provider. Choose: {', '.join(PRICING.keys())}[/red]")
        sys.exit(1)

    instances = list(PRICING[provider].keys())
    console.print(f"Available instances: {', '.join(instances)}")
    default_inst = instances[0]
    instance_type = console.input(f"[cyan]Instance type [{default_inst}]:[/cyan] ").strip() or default_inst
    if instance_type not in PRICING[provider]:
        console.print(f"[red]Unknown instance. Available: {', '.join(instances)}[/red]")
        sys.exit(1)

    od  = int(console.input("[cyan]On-demand replicas [1]:[/cyan] ").strip() or "1")
    sp  = int(console.input("[cyan]Spot replicas [0]:[/cyan] ").strip() or "0")
    rsv = int(console.input("[cyan]Reserved replicas [0]:[/cyan] ").strip() or "0")
    hrs = float(console.input("[cyan]Active GPU hours/day [24]:[/cyan] ").strip() or "24")
    batch = int(console.input("[cyan]Batch tokens/month (0 = none) [0]:[/cyan] ").strip() or "0")

    s = Scenario(
        name="Custom Configuration",
        description="User-defined cluster parameters",
        provider=provider,
        instance_type=instance_type,
        on_demand_replicas=od,
        spot_replicas=sp,
        reserved_replicas=rsv,
        active_hours_per_day=hrs,
        batch_tokens_per_month=batch,
    )
    console.print()
    print_scenario(s)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="Cloudach GPU Cost Calculator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument(
        "--scenario",
        choices=list(PRESETS.keys()) + ["all"],
        default=None,
        help=f"Preset scenario. One of: {', '.join(PRESETS.keys())}, all",
    )
    p.add_argument("--json", action="store_true", dest="output_json",
                   help="Output JSON for all preset scenarios")
    return p


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()

    if args.output_json:
        out = {}
        for key, s in PRESETS.items():
            out[key] = {**calculate_monthly(s), "name": s.name, "description": s.description}
        print(json.dumps(out, indent=2))
        return

    if args.scenario is None:
        # Default: show comparison table + detailed staging
        print_comparison_table(PRESETS)
        console.print()
        print_scenario(PRESETS["staging"])
        console.print(
            "\n[dim]Run with --scenario <name> for full details. "
            "Use --json to export all scenarios as JSON.[/dim]"
        )
        return

    if args.scenario == "all":
        print_comparison_table(PRESETS)
        console.print()
        for s in PRESETS.values():
            print_scenario(s)
            console.print()
        return

    print_scenario(PRESETS[args.scenario])


if __name__ == "__main__":
    main()
