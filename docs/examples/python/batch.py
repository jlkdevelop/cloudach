"""
Cloudach Batch Inference — Python Example
Requires: pip install requests

Demonstrates:
  1. Submitting a batch of chat completion requests
  2. Polling for completion
  3. Downloading and parsing JSONL results

Run:
  export CLOUDACH_API_KEY=sk-cloudach-...
  python batch.py
"""

import json
import os
import time

import requests

API_KEY = os.environ["CLOUDACH_API_KEY"]
BASE_URL = "https://api.cloudach.com/v1"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}


def submit_batch(model: str, requests_payload: list, completion_window: str = "24h") -> dict:
    resp = requests.post(
        f"{BASE_URL}/batches",
        headers=HEADERS,
        json={
            "model": model,
            "requests": requests_payload,
            "completion_window": completion_window,
        },
    )
    resp.raise_for_status()
    return resp.json()


def get_batch(batch_id: str) -> dict:
    resp = requests.get(f"{BASE_URL}/batches/{batch_id}", headers=HEADERS)
    resp.raise_for_status()
    return resp.json()


def poll_until_done(batch_id: str, poll_interval: int = 30) -> dict:
    """Poll until the batch completes. Returns the final batch object."""
    while True:
        batch = get_batch(batch_id)
        status = batch["status"]
        pct = batch.get("progress_pct", 0)
        print(
            f"  [{status}] {pct}% — {batch['completed_count']}/{batch['request_count']} complete"
            + (f", {batch['failed_count']} failed" if batch["failed_count"] else "")
        )

        if status == "completed":
            return batch
        if status in ("failed", "cancelled", "expired"):
            raise RuntimeError(
                f"Batch ended with status '{status}'. Error: {batch.get('error')}"
            )

        time.sleep(poll_interval)


def download_results(batch_id: str) -> list[dict]:
    """Download JSONL results and parse into a list of result objects."""
    resp = requests.get(f"{BASE_URL}/batches/{batch_id}/results", headers=HEADERS)
    resp.raise_for_status()
    return [json.loads(line) for line in resp.text.strip().splitlines()]


def main():
    # --- Build requests ---
    # Example: sentiment classification on product reviews
    reviews = [
        "Absolutely love this product — works perfectly and arrived early!",
        "Completely broke after two days. Very disappointed.",
        "It's okay, does what it says but nothing special.",
        "Best purchase I've made this year. Highly recommended.",
        "Packaging was damaged and the item smelled strange.",
    ]

    requests_payload = [
        {
            "custom_id": f"review-{i:04d}",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a sentiment classifier. Reply with exactly one word: positive, negative, or neutral.",
                },
                {
                    "role": "user",
                    "content": review,
                },
            ],
        }
        for i, review in enumerate(reviews)
    ]

    # --- Submit ---
    print(f"Submitting batch of {len(requests_payload)} requests...")
    batch = submit_batch("llama3-8b", requests_payload, completion_window="24h")
    batch_id = batch["id"]
    print(f"  Batch ID: {batch_id}")
    print(f"  Estimated cost: ${batch['cost_estimate_usd']:.6f}")
    print(f"  Estimated completion: {batch['estimated_completion']}")

    # --- Poll ---
    print("\nPolling for completion (30s interval)...")
    poll_until_done(batch_id, poll_interval=30)

    # --- Download results ---
    print("\nDownloading results...")
    results = download_results(batch_id)

    # Build a lookup by custom_id for easy access
    results_by_id = {r["custom_id"]: r for r in results}

    print("\n--- Sentiment Results ---")
    for i, review in enumerate(reviews):
        custom_id = f"review-{i:04d}"
        row = results_by_id.get(custom_id)
        if row is None:
            sentiment = "MISSING"
        elif row["error"]:
            sentiment = f"ERROR: {row['error']['message']}"
        else:
            sentiment = row["response"]["choices"][0]["message"]["content"].strip()
        print(f"  {custom_id}: {sentiment!r:12} — {review[:60]}")


if __name__ == "__main__":
    main()
