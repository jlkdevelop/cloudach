#!/usr/bin/env python3
"""
Cloudach vLLM Benchmark — measures TTFT, throughput, and GPU utilization.

Usage:
    python scripts/benchmark_vllm.py --base-url http://api.cloudach.com/v1 \
        --api-key sk-cloudach-xxx --concurrency 1 4 8 16 --duration 60

Prerequisites:
    pip install httpx pydantic rich

The script hits /v1/chat/completions with streaming enabled and captures:
  - Time to First Token (TTFT) per request
  - End-to-end latency per request
  - Output token throughput (tokens/sec)
  - GPU utilization via vLLM /metrics (Prometheus text format) if accessible
"""

import argparse
import asyncio
import json
import statistics
import sys
import time
from dataclasses import dataclass, field
from typing import Optional

try:
    import httpx
    from rich.console import Console
    from rich.table import Table
except ImportError:
    print("Install dependencies first: pip install httpx rich")
    sys.exit(1)

console = Console()

PROMPTS = [
    "Explain quantum entanglement in simple terms.",
    "Write a Python function to find all prime numbers up to n using the Sieve of Eratosthenes.",
    "What are the key differences between supervised and unsupervised learning?",
    "Summarize the French Revolution in three sentences.",
    "Give me a recipe for a simple lemon pasta.",
]


@dataclass
class RequestResult:
    ttft_s: float          # seconds to first token
    total_s: float         # end-to-end latency
    output_tokens: int
    prompt_tokens: int
    error: Optional[str] = None

    @property
    def tokens_per_sec(self) -> float:
        if self.total_s <= 0:
            return 0
        return self.output_tokens / self.total_s


@dataclass
class BenchmarkStats:
    concurrency: int
    duration_s: float
    results: list[RequestResult] = field(default_factory=list)

    def successful(self):
        return [r for r in self.results if not r.error]

    def error_count(self):
        return sum(1 for r in self.results if r.error)

    def ttft_p50(self):
        v = [r.ttft_s for r in self.successful()]
        return statistics.median(v) if v else 0

    def ttft_p99(self):
        v = sorted(r.ttft_s for r in self.successful())
        if not v:
            return 0
        idx = int(len(v) * 0.99)
        return v[min(idx, len(v) - 1)]

    def latency_p50(self):
        v = [r.total_s for r in self.successful()]
        return statistics.median(v) if v else 0

    def latency_p99(self):
        v = sorted(r.total_s for r in self.successful())
        if not v:
            return 0
        idx = int(len(v) * 0.99)
        return v[min(idx, len(v) - 1)]

    def total_output_tokens(self):
        return sum(r.output_tokens for r in self.successful())

    def throughput_tps(self):
        if self.duration_s <= 0:
            return 0
        return self.total_output_tokens() / self.duration_s

    def rps(self):
        if self.duration_s <= 0:
            return 0
        return len(self.successful()) / self.duration_s


async def single_request(client: httpx.AsyncClient, base_url: str, api_key: str, model: str) -> RequestResult:
    prompt = PROMPTS[int(time.time() * 1000) % len(PROMPTS)]
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 256,
        "stream": True,
        "stream_options": {"include_usage": True},
    }
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}

    t_start = time.perf_counter()
    ttft = None
    output_tokens = 0
    prompt_tokens = 0
    error = None

    try:
        async with client.stream(
            "POST",
            f"{base_url}/chat/completions",
            json=payload,
            headers=headers,
            timeout=60.0,
        ) as resp:
            if resp.status_code != 200:
                body = await resp.aread()
                return RequestResult(
                    ttft_s=0, total_s=time.perf_counter() - t_start,
                    output_tokens=0, prompt_tokens=0,
                    error=f"HTTP {resp.status_code}: {body[:200].decode(errors='replace')}",
                )

            async for line in resp.aiter_lines():
                if not line.startswith("data: "):
                    continue
                data_str = line[6:]
                if data_str == "[DONE]":
                    break
                try:
                    data = json.loads(data_str)
                except json.JSONDecodeError:
                    continue

                # TTFT = time we receive first content delta
                if ttft is None:
                    delta = data.get("choices", [{}])[0].get("delta", {})
                    if delta.get("content"):
                        ttft = time.perf_counter() - t_start

                # Count tokens from streaming usage (final chunk)
                if data.get("usage"):
                    output_tokens = data["usage"].get("completion_tokens", 0)
                    prompt_tokens = data["usage"].get("prompt_tokens", 0)

    except Exception as exc:
        error = str(exc)

    total_s = time.perf_counter() - t_start
    return RequestResult(
        ttft_s=ttft or total_s,
        total_s=total_s,
        output_tokens=output_tokens,
        prompt_tokens=prompt_tokens,
        error=error,
    )


async def run_workers(base_url: str, api_key: str, model: str, concurrency: int, duration_s: float) -> BenchmarkStats:
    stats = BenchmarkStats(concurrency=concurrency, duration_s=duration_s)
    deadline = time.perf_counter() + duration_s

    async with httpx.AsyncClient(http2=True) as client:
        async def worker():
            while time.perf_counter() < deadline:
                result = await single_request(client, base_url, api_key, model)
                stats.results.append(result)

        await asyncio.gather(*[worker() for _ in range(concurrency)])

    return stats


async def fetch_gpu_utilization(vllm_metrics_url: str) -> Optional[dict]:
    """
    Parse vLLM Prometheus /metrics to extract GPU KV cache usage and request queue depth.
    """
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(vllm_metrics_url, timeout=5.0)
            if resp.status_code != 200:
                return None
            text = resp.text
            metrics = {}
            for line in text.splitlines():
                if line.startswith("#"):
                    continue
                if "gpu_cache_usage_perc" in line:
                    metrics["gpu_kv_cache_pct"] = float(line.split()[-1]) * 100
                elif "num_requests_running" in line and not line.startswith("#"):
                    metrics["requests_running"] = float(line.split()[-1])
                elif "num_requests_waiting" in line and not line.startswith("#"):
                    metrics["requests_waiting"] = float(line.split()[-1])
            return metrics
    except Exception:
        return None


def print_results(all_stats: list[BenchmarkStats], gpu_metrics: Optional[dict]):
    table = Table(title="Cloudach vLLM Benchmark Results", show_header=True, header_style="bold magenta")
    table.add_column("Concurrency", justify="right")
    table.add_column("Requests", justify="right")
    table.add_column("Errors", justify="right")
    table.add_column("RPS", justify="right")
    table.add_column("TTFT p50 (ms)", justify="right")
    table.add_column("TTFT p99 (ms)", justify="right")
    table.add_column("Latency p50 (ms)", justify="right")
    table.add_column("Latency p99 (ms)", justify="right")
    table.add_column("Throughput (tok/s)", justify="right")

    for s in all_stats:
        table.add_row(
            str(s.concurrency),
            str(len(s.results)),
            str(s.error_count()),
            f"{s.rps():.2f}",
            f"{s.ttft_p50() * 1000:.0f}",
            f"{s.ttft_p99() * 1000:.0f}",
            f"{s.latency_p50() * 1000:.0f}",
            f"{s.latency_p99() * 1000:.0f}",
            f"{s.throughput_tps():.0f}",
        )

    console.print(table)

    if gpu_metrics:
        console.print("\n[bold]GPU / vLLM Runtime Metrics[/bold]")
        if "gpu_kv_cache_pct" in gpu_metrics:
            console.print(f"  GPU KV Cache Usage: {gpu_metrics['gpu_kv_cache_pct']:.1f}%")
        if "requests_running" in gpu_metrics:
            console.print(f"  Requests Running:   {int(gpu_metrics['requests_running'])}")
        if "requests_waiting" in gpu_metrics:
            console.print(f"  Requests Waiting:   {int(gpu_metrics['requests_waiting'])}")
    else:
        console.print("\n[dim]GPU metrics unavailable (--vllm-metrics-url not set or unreachable)[/dim]")


async def main():
    parser = argparse.ArgumentParser(description="Cloudach vLLM benchmark")
    parser.add_argument("--base-url", default="http://localhost:8080/v1", help="API gateway base URL")
    parser.add_argument("--api-key", required=True, help="Cloudach API key (sk-cloudach-...)")
    parser.add_argument("--model", default="llama3-8b", help="Model ID to benchmark")
    parser.add_argument("--concurrency", type=int, nargs="+", default=[1, 4, 8], help="Concurrency levels to test")
    parser.add_argument("--duration", type=int, default=30, help="Seconds per concurrency level")
    parser.add_argument("--vllm-metrics-url", default=None, help="Direct vLLM /metrics URL (e.g. http://vllm-svc:8000/metrics)")
    args = parser.parse_args()

    console.print(f"[bold green]Cloudach vLLM Benchmark[/bold green]")
    console.print(f"  Base URL:    {args.base_url}")
    console.print(f"  Model:       {args.model}")
    console.print(f"  Concurrency: {args.concurrency}")
    console.print(f"  Duration:    {args.duration}s per level\n")

    all_stats = []
    for c in args.concurrency:
        console.print(f"[yellow]Running concurrency={c} for {args.duration}s ...[/yellow]")
        stats = await run_workers(args.base_url, args.api_key, args.model, c, args.duration)
        all_stats.append(stats)
        console.print(f"  Done: {len(stats.results)} requests, {stats.error_count()} errors")

    gpu_metrics = None
    if args.vllm_metrics_url:
        gpu_metrics = await fetch_gpu_utilization(args.vllm_metrics_url)

    print_results(all_stats, gpu_metrics)


if __name__ == "__main__":
    asyncio.run(main())
