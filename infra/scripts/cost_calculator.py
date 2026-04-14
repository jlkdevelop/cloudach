#!/usr/bin/env python3
"""
Cloudach AWS Cost Calculator
Usage: python3 cost_calculator.py [--requests-per-day N] [--model MODEL]
                                  [--avg-input-tokens N] [--avg-output-tokens N]
                                  [--environment ENV]

Given daily request volume and model type, estimates monthly AWS infrastructure cost.
"""

import argparse
import math


# ---------------------------------------------------------------------------
# GPU Instance pricing (us-east-1, April 2026)
# ---------------------------------------------------------------------------
GPU_INSTANCES = {
    "g4dn.xlarge": {
        "gpu": "NVIDIA T4 (16 GB VRAM)",
        "vcpu": 4,
        "ram_gb": 16,
        "on_demand_usd_hr": 0.526,
        "spot_usd_hr": 0.158,        # ~70% savings typical
        "max_concurrent_requests": 8,  # rule-of-thumb for 8B model
    },
    "g5.xlarge": {
        "gpu": "NVIDIA A10G (24 GB VRAM)",
        "vcpu": 4,
        "ram_gb": 16,
        "on_demand_usd_hr": 1.006,
        "spot_usd_hr": 0.302,
        "max_concurrent_requests": 16,
    },
    "g5.2xlarge": {
        "gpu": "NVIDIA A10G (24 GB VRAM)",
        "vcpu": 8,
        "ram_gb": 32,
        "on_demand_usd_hr": 1.212,
        "spot_usd_hr": 0.364,
        "max_concurrent_requests": 24,
    },
    "p3.2xlarge": {
        "gpu": "NVIDIA V100 (16 GB VRAM)",
        "vcpu": 8,
        "ram_gb": 61,
        "on_demand_usd_hr": 3.06,
        "spot_usd_hr": 0.918,
        "max_concurrent_requests": 12,
    },
}

# ---------------------------------------------------------------------------
# Model profiles — GPU memory requirements and throughput characteristics
# ---------------------------------------------------------------------------
MODELS = {
    "llama3-8b": {
        "display": "Meta Llama 3 8B Instruct",
        "vram_gb": 16,
        "recommended_instance": "g4dn.xlarge",
        "tokens_per_second_per_gpu": 80,   # approximate sustained throughput
        "context_window": 8192,
    },
    "llama3-70b": {
        "display": "Meta Llama 3 70B Instruct",
        "vram_gb": 40,
        "recommended_instance": "g5.2xlarge",
        "tokens_per_second_per_gpu": 20,
        "context_window": 8192,
        "tensor_parallel": 2,              # needs 2 GPUs
    },
    "mistral-7b": {
        "display": "Mistral 7B Instruct",
        "vram_gb": 14,
        "recommended_instance": "g4dn.xlarge",
        "tokens_per_second_per_gpu": 90,
        "context_window": 32768,
    },
    "mixtral-8x7b": {
        "display": "Mixtral 8x7B MoE",
        "vram_gb": 48,
        "recommended_instance": "g5.2xlarge",
        "tokens_per_second_per_gpu": 35,
        "context_window": 32768,
        "tensor_parallel": 2,
    },
}

# ---------------------------------------------------------------------------
# Fixed infrastructure costs (monthly, us-east-1, April 2026)
# ---------------------------------------------------------------------------
FIXED_COSTS = {
    "eks_control_plane":      73.00,
    "nat_gateway_3az":        98.28,   # $0.045/hr × 3 × 730h + data
    "alb":                    18.00,
    "efs_50gb":               16.00,
    "cloudwatch_basic":       20.00,
    "ecr_storage":             5.00,
}

CPU_NODE_COST = {
    "t3.large_spot_2nodes_monthly": 60.00,   # 2 × $0.041/hr × 730h
}

RDS_COSTS = {
    "db.t4g.medium_multiaz": 115.00,
    "db.r7g.large_multiaz":  410.00,
}

REDIS_COSTS = {
    "cache.t3.small_1node":   27.00,
    "cache.t3.small_2nodes":  54.00,
    "cache.r7g.large_2nodes": 212.00,
}

S3_PER_GB_MONTH = 0.023
DATA_TRANSFER_PER_GB = 0.09


# ---------------------------------------------------------------------------
# Calculator logic
# ---------------------------------------------------------------------------

def calculate(
    requests_per_day: int,
    model_key: str,
    avg_input_tokens: int,
    avg_output_tokens: int,
    environment: str,
    spot_fraction: float,
):
    model = MODELS[model_key]
    instance_key = model["recommended_instance"]
    instance = GPU_INSTANCES[instance_key]

    tensor_parallel = model.get("tensor_parallel", 1)
    tokens_per_request = avg_input_tokens + avg_output_tokens
    tokens_per_second = model["tokens_per_second_per_gpu"] / tensor_parallel

    # How many seconds does one request take?
    seconds_per_request = avg_output_tokens / tokens_per_second

    # Peak throughput of one GPU pod (concurrent requests × output tokens/s)
    max_concurrent = instance["max_concurrent_requests"] // tensor_parallel
    pod_throughput_req_per_sec = max_concurrent / seconds_per_request

    # Average requests per second (assume 10:1 peak:average ratio, 16h active window)
    active_hours_per_day = 16
    avg_req_per_sec = requests_per_day / (active_hours_per_day * 3600)
    peak_req_per_sec = avg_req_per_sec * 3.0   # 3× peak factor

    # GPU pods needed at peak
    pods_needed = math.ceil(peak_req_per_sec / pod_throughput_req_per_sec)
    pods_needed = max(pods_needed, 1)

    # GPU nodes needed (1 pod per node; 2 nodes per tensor-parallel model)
    gpu_nodes = pods_needed * tensor_parallel

    # Monthly GPU cost (mix of spot and on-demand)
    # Assume average utilisation: 50% of the day nodes are live (KEDA scale-to-zero)
    effective_utilisation = 0.5 if environment == "staging" else 0.7
    gpu_hours_per_month = gpu_nodes * 730 * effective_utilisation

    spot_hours = gpu_hours_per_month * spot_fraction
    od_hours = gpu_hours_per_month * (1 - spot_fraction)

    gpu_cost = (spot_hours * instance["spot_usd_hr"] +
                od_hours * instance["on_demand_usd_hr"])

    # S3 model storage
    s3_model_gb = model["vram_gb"] * 1.1  # weights slightly larger than VRAM footprint
    s3_cost = s3_model_gb * S3_PER_GB_MONTH

    # Outbound data transfer
    output_bytes_per_day = requests_per_day * avg_output_tokens * 4  # ~4 bytes/token
    output_gb_per_month = (output_bytes_per_day * 30) / (1024 ** 3)
    transfer_cost = output_gb_per_month * DATA_TRANSFER_PER_GB

    # RDS and Redis (env-dependent)
    if environment == "staging":
        rds_cost = RDS_COSTS["db.t4g.medium_multiaz"]
        redis_cost = REDIS_COSTS["cache.t3.small_1node"]
    else:
        rds_cost = RDS_COSTS["db.r7g.large_multiaz"]
        redis_cost = REDIS_COSTS["cache.r7g.large_2nodes"]

    # Sum up
    fixed_total = sum(FIXED_COSTS.values())
    cpu_nodes = CPU_NODE_COST["t3.large_spot_2nodes_monthly"]
    total = fixed_total + cpu_nodes + gpu_cost + rds_cost + redis_cost + s3_cost + transfer_cost

    # Token pricing — what you need to charge to cover infra
    total_tokens_per_month = requests_per_day * 30 * tokens_per_request
    break_even_per_million = (total / total_tokens_per_month) * 1_000_000 if total_tokens_per_month > 0 else 0

    return {
        "model": model["display"],
        "instance_type": instance_key,
        "gpu_spec": instance["gpu"],
        "tensor_parallel": tensor_parallel,
        "gpu_nodes_at_peak": gpu_nodes,
        "avg_requests_per_second": avg_req_per_sec,
        "peak_requests_per_second": peak_req_per_sec,
        "seconds_per_request": seconds_per_request,
        "effective_gpu_utilisation_pct": effective_utilisation * 100,
        "costs": {
            "fixed_infra": fixed_total,
            "cpu_nodes": cpu_nodes,
            "gpu_compute": gpu_cost,
            "rds": rds_cost,
            "redis": redis_cost,
            "s3_model_storage": s3_cost,
            "data_transfer": transfer_cost,
            "total_monthly_usd": total,
        },
        "tokens_per_month": total_tokens_per_month,
        "break_even_per_million_tokens_usd": break_even_per_million,
    }


def print_report(result: dict, requests_per_day: int, avg_input: int, avg_output: int):
    print("\n" + "=" * 62)
    print("  Cloudach AWS Cost Estimate")
    print("=" * 62)
    print(f"  Model         : {result['model']}")
    print(f"  Instance      : {result['instance_type']}  ({result['gpu_spec']})")
    print(f"  Tensor ||     : {result['tensor_parallel']} GPU(s) per pod")
    print(f"  Requests/day  : {requests_per_day:,}")
    print(f"  Avg input tok : {avg_input}")
    print(f"  Avg output tok: {avg_output}")
    print(f"  Avg req/s     : {result['avg_requests_per_second']:.2f}")
    print(f"  Peak req/s    : {result['peak_requests_per_second']:.2f}")
    print(f"  Sec/request   : {result['seconds_per_request']:.1f} s")
    print(f"  GPU nodes peak: {result['gpu_nodes_at_peak']}")
    print(f"  GPU utilisation: {result['effective_gpu_utilisation_pct']:.0f}% (avg)")
    print("-" * 62)
    print("  Monthly cost breakdown:")
    c = result["costs"]
    print(f"    Fixed infra (EKS, ALB, NAT, EFS, CW)  : ${c['fixed_infra']:>8.2f}")
    print(f"    CPU nodes (2 × t3.large spot)          : ${c['cpu_nodes']:>8.2f}")
    print(f"    GPU compute                            : ${c['gpu_compute']:>8.2f}")
    print(f"    RDS Aurora                             : ${c['rds']:>8.2f}")
    print(f"    ElastiCache Redis                      : ${c['redis']:>8.2f}")
    print(f"    S3 model storage                       : ${c['s3_model_storage']:>8.2f}")
    print(f"    Data transfer                          : ${c['data_transfer']:>8.2f}")
    print(f"    ─────────────────────────────────────────────────")
    print(f"    TOTAL / month                          : ${c['total_monthly_usd']:>8.2f}")
    print("-" * 62)
    mtok = result["tokens_per_month"] / 1_000_000
    print(f"  Total tokens/month : {mtok:,.1f}M")
    print(f"  Break-even price   : ${result['break_even_per_million_tokens_usd']:.2f} / M tokens")
    print("=" * 62 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Estimate monthly AWS cost for a Cloudach deployment."
    )
    parser.add_argument("--requests-per-day", type=int, default=10_000,
                        help="Average API requests per day (default: 10000)")
    parser.add_argument("--model", choices=list(MODELS.keys()), default="llama3-8b",
                        help="Model to serve (default: llama3-8b)")
    parser.add_argument("--avg-input-tokens", type=int, default=256,
                        help="Average input tokens per request (default: 256)")
    parser.add_argument("--avg-output-tokens", type=int, default=512,
                        help="Average output tokens per request (default: 512)")
    parser.add_argument("--environment", choices=["staging", "production"], default="staging",
                        help="Target environment (default: staging)")
    parser.add_argument("--spot-fraction", type=float, default=0.7,
                        help="Fraction of GPU nodes on spot pricing (default: 0.7)")
    parser.add_argument("--list-models", action="store_true",
                        help="Print available models and exit")
    parser.add_argument("--list-instances", action="store_true",
                        help="Print GPU instance pricing table and exit")

    args = parser.parse_args()

    if args.list_models:
        print("\nAvailable models:")
        for k, v in MODELS.items():
            tp = v.get("tensor_parallel", 1)
            print(f"  {k:<20} {v['display']}  ({v['vram_gb']} GB VRAM, {tp}× GPU)")
        print()
        return

    if args.list_instances:
        print("\nGPU instance pricing (us-east-1):")
        print(f"  {'Instance':<20} {'GPU':<30} {'On-Demand':>12} {'Spot (avg)':>12}")
        print("  " + "-" * 76)
        for k, v in GPU_INSTANCES.items():
            print(f"  {k:<20} {v['gpu']:<30} ${v['on_demand_usd_hr']:>9.3f}/hr  ${v['spot_usd_hr']:>9.3f}/hr")
        print()
        return

    result = calculate(
        requests_per_day=args.requests_per_day,
        model_key=args.model,
        avg_input_tokens=args.avg_input_tokens,
        avg_output_tokens=args.avg_output_tokens,
        environment=args.environment,
        spot_fraction=args.spot_fraction,
    )
    print_report(result, args.requests_per_day, args.avg_input_tokens, args.avg_output_tokens)


if __name__ == "__main__":
    main()
