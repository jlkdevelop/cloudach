# Batch Inference API

> Process thousands of requests asynchronously at **50% off real-time pricing**.

---

## Overview

The Batch Inference API lets you submit large volumes of LLM requests as a single job. Instead of sending requests one-by-one and paying real-time rates, you submit a batch and Cloudach processes it during off-peak windows using spot GPUs — passing those savings on to you.

**When to use batch:**

| Use case | Batch? |
|---|---|
| Chatbot / real-time assistant | No |
| Document classification at scale | **Yes** |
| Dataset annotation / labeling | **Yes** |
| Fine-tuning dataset generation | **Yes** |
| Offline evaluation / scoring | **Yes** |
| Embedding generation at scale | **Yes** |
| Scheduled report enrichment | **Yes** |

---

## Pricing

Batch jobs are priced at **50% off** the equivalent real-time rate, thanks to spot GPU scheduling and higher utilization.

| Model | Real-time ($/1M tokens) | Batch ($/1M tokens) |
|---|---|---|
| llama3-8b | $0.20 | **$0.10** |
| llama3-70b | $0.60 | **$0.30** |
| mistral-7b | $0.16 | **$0.08** |
| mixtral-8x7b | $0.48 | **$0.24** |
| codellama-13b | $0.22 | **$0.11** |
| gemma-7b | $0.16 | **$0.08** |

See [batch-inference-pricing.md](./batch-inference-pricing.md) for committed-tier and volume discount rates.

---

## Completion Windows

Choose the SLA that fits your workload:

| `completion_window` | Turnaround | Use case |
|---|---|---|
| `24h` | Within 24 hours | Maximum cost savings, non-urgent jobs |
| `4h` | Within 4 hours | Same-day pipelines |
| `1h` | Within 1 hour | Near-real-time batch jobs |

---

## Endpoints

### Submit a batch

```
POST /v1/batches
Authorization: Bearer sk-cloudach-xxx
Content-Type: application/json
```

**Request body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `model` | string | Yes | Model ID (e.g. `llama3-8b`) |
| `requests` | array | Yes | Array of request objects (max 50,000) |
| `requests[].custom_id` | string | Yes | Your identifier for each request — returned in results |
| `requests[].messages` | array | Yes | OpenAI-compatible messages array |
| `completion_window` | string | No | `24h` (default), `4h`, or `1h` |
| `output_format` | string | No | `jsonl` (default) or `csv` |

**Example:**

```bash
curl https://api.cloudach.com/v1/batches \
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3-8b",
    "completion_window": "24h",
    "requests": [
      {
        "custom_id": "doc-001",
        "messages": [{"role": "user", "content": "Classify this review as positive or negative: Great product!"}]
      },
      {
        "custom_id": "doc-002",
        "messages": [{"role": "user", "content": "Classify this review as positive or negative: Terrible, broke on day one."}]
      }
    ]
  }'
```

**Response (202 Accepted):**

```json
{
  "id": "3f8a1c2d-4b5e-6f7a-8b9c-0d1e2f3a4b5c",
  "object": "batch",
  "status": "queued",
  "model": "llama3-8b",
  "completion_window": "24h",
  "output_format": "jsonl",
  "request_count": 2,
  "completed_count": 0,
  "failed_count": 0,
  "estimated_completion": "2026-04-15T08:00:00Z",
  "cost_estimate_usd": 0.000025,
  "created_at": "2026-04-14T10:00:00Z"
}
```

---

### Get batch status

```
GET /v1/batches/{batch_id}
Authorization: Bearer sk-cloudach-xxx
```

**Response:**

```json
{
  "id": "3f8a1c2d-4b5e-6f7a-8b9c-0d1e2f3a4b5c",
  "object": "batch",
  "status": "processing",
  "model": "llama3-8b",
  "completion_window": "24h",
  "output_format": "jsonl",
  "request_count": 2000,
  "completed_count": 843,
  "failed_count": 2,
  "progress_pct": 42,
  "cost_estimate_usd": 0.025,
  "error": null,
  "created_at": "2026-04-14T10:00:00Z",
  "started_at": "2026-04-14T10:05:00Z",
  "completed_at": null,
  "expires_at": "2026-04-21T10:00:00Z"
}
```

**Batch statuses:**

| Status | Description |
|---|---|
| `queued` | Job accepted, waiting for a processing slot |
| `validating` | Requests are being validated |
| `processing` | Actively running inference |
| `completed` | All requests finished — results available |
| `failed` | Job failed entirely — see `error` field |
| `cancelled` | Job was cancelled by the user |
| `expired` | Job was not retrieved within the retention window (7 days) |

---

### List batches

```
GET /v1/batches?limit=20&after={batch_id}
Authorization: Bearer sk-cloudach-xxx
```

Returns a paginated list of your batch jobs, newest first.

**Response:**

```json
{
  "object": "list",
  "data": [
    { "id": "...", "status": "completed", ... },
    { "id": "...", "status": "queued", ... }
  ],
  "has_more": false,
  "first_id": "...",
  "last_id": "..."
}
```

---

### Download results

```
GET /v1/batches/{batch_id}/results
Authorization: Bearer sk-cloudach-xxx
```

Only available when `status` is `completed`. Returns JSONL by default (or CSV if `output_format` was `csv`).

**JSONL result format (one JSON object per line):**

```jsonl
{"custom_id":"doc-001","response":{"id":"chatcmpl-...","model":"llama3-8b","choices":[{"message":{"role":"assistant","content":"Positive"},"finish_reason":"stop"}],"usage":{"prompt_tokens":28,"completion_tokens":1}},"error":null}
{"custom_id":"doc-002","response":{"id":"chatcmpl-...","model":"llama3-8b","choices":[{"message":{"role":"assistant","content":"Negative"},"finish_reason":"stop"}],"usage":{"prompt_tokens":31,"completion_tokens":1}},"error":null}
```

Each line contains:
- `custom_id` — your original identifier, for row matching
- `response` — the full chat completion response (or `null` on error)
- `error` — error object (or `null` on success)

---

### Cancel a batch

```
DELETE /v1/batches/{batch_id}
Authorization: Bearer sk-cloudach-xxx
```

Cancels a `queued`, `validating`, or `processing` batch. Returns the updated batch object.

---

## Python Example

```python
"""
Cloudach Batch Inference — Python
Requires: pip install openai requests
"""
import os
import time
import json
import requests

API_KEY = os.environ["CLOUDACH_API_KEY"]
BASE_URL = "https://api.cloudach.com/v1"
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
}

# --- Step 1: Build requests ---
documents = [
    "The product quality is outstanding, highly recommend!",
    "Arrived broken and customer service was unhelpful.",
    "Average product, nothing special but gets the job done.",
]

requests_payload = [
    {
        "custom_id": f"doc-{i:04d}",
        "messages": [
            {
                "role": "user",
                "content": f"Classify the sentiment as positive, negative, or neutral: {doc}",
            }
        ],
    }
    for i, doc in enumerate(documents)
]

# --- Step 2: Submit batch ---
resp = requests.post(
    f"{BASE_URL}/batches",
    headers=HEADERS,
    json={
        "model": "llama3-8b",
        "requests": requests_payload,
        "completion_window": "24h",
    },
)
resp.raise_for_status()
batch = resp.json()
batch_id = batch["id"]
print(f"Batch submitted: {batch_id} ({batch['request_count']} requests)")
print(f"Estimated cost: ${batch['cost_estimate_usd']:.6f}")

# --- Step 3: Poll for completion ---
while True:
    resp = requests.get(f"{BASE_URL}/batches/{batch_id}", headers=HEADERS)
    resp.raise_for_status()
    batch = resp.json()
    status = batch["status"]
    pct = batch.get("progress_pct", 0)
    print(f"Status: {status} ({pct}% complete, {batch['completed_count']}/{batch['request_count']})")

    if status == "completed":
        break
    if status in ("failed", "cancelled", "expired"):
        raise RuntimeError(f"Batch ended with status: {status}. Error: {batch.get('error')}")

    time.sleep(30)  # poll every 30 seconds

# --- Step 4: Download and parse results ---
resp = requests.get(f"{BASE_URL}/batches/{batch_id}/results", headers=HEADERS)
resp.raise_for_status()

results = {}
for line in resp.text.strip().splitlines():
    row = json.loads(line)
    if row["error"]:
        results[row["custom_id"]] = f"ERROR: {row['error']['message']}"
    else:
        results[row["custom_id"]] = row["response"]["choices"][0]["message"]["content"]

for custom_id, sentiment in results.items():
    print(f"{custom_id}: {sentiment}")
```

---

## Node.js Example

```javascript
/**
 * Cloudach Batch Inference — Node.js
 * Run: CLOUDACH_API_KEY=sk-cloudach-... node batch.js
 */

const BASE_URL = "https://api.cloudach.com/v1";
const HEADERS = {
  Authorization: `Bearer ${process.env.CLOUDACH_API_KEY}`,
  "Content-Type": "application/json",
};

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...HEADERS, ...options.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(err.error?.message ?? res.statusText);
  }
  return res;
}

// --- Step 1: Build requests ---
const documents = [
  "The product quality is outstanding, highly recommend!",
  "Arrived broken and customer service was unhelpful.",
  "Average product, nothing special but gets the job done.",
];

const requests = documents.map((doc, i) => ({
  custom_id: `doc-${String(i).padStart(4, "0")}`,
  messages: [
    {
      role: "user",
      content: `Classify the sentiment as positive, negative, or neutral: ${doc}`,
    },
  ],
}));

// --- Step 2: Submit batch ---
const submitRes = await apiFetch("/batches", {
  method: "POST",
  body: JSON.stringify({
    model: "llama3-8b",
    requests,
    completion_window: "24h",
  }),
});
const batch = await submitRes.json();
const batchId = batch.id;
console.log(`Batch submitted: ${batchId} (${batch.request_count} requests)`);
console.log(`Estimated cost: $${batch.cost_estimate_usd.toFixed(6)}`);

// --- Step 3: Poll for completion ---
async function pollUntilDone(id, intervalMs = 30_000) {
  while (true) {
    const res = await apiFetch(`/batches/${id}`);
    const b = await res.json();
    console.log(`Status: ${b.status} (${b.progress_pct ?? 0}% — ${b.completed_count}/${b.request_count})`);

    if (b.status === "completed") return b;
    if (["failed", "cancelled", "expired"].includes(b.status)) {
      throw new Error(`Batch ended with status: ${b.status}. Error: ${JSON.stringify(b.error)}`);
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

await pollUntilDone(batchId);

// --- Step 4: Download and parse results ---
const resultsRes = await apiFetch(`/batches/${batchId}/results`);
const jsonl = await resultsRes.text();

const results = {};
for (const line of jsonl.trim().split("\n")) {
  const row = JSON.parse(line);
  if (row.error) {
    results[row.custom_id] = `ERROR: ${row.error.message}`;
  } else {
    results[row.custom_id] = row.response.choices[0].message.content;
  }
}

for (const [customId, sentiment] of Object.entries(results)) {
  console.log(`${customId}: ${sentiment}`);
}
```

---

## Large Batches (File API)

For batches exceeding 50,000 requests, use the file-based path to avoid payload size limits:

```bash
# 1. Upload your JSONL input file
curl -X POST https://api.cloudach.com/v1/files \
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \
  -F "file=@batch_input.jsonl" \
  -F "purpose=batch"
# Response: {"file_id": "file_xyz789"}

# 2. Submit batch referencing the file
curl -X POST https://api.cloudach.com/v1/batches \
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "llama3-8b", "input_file_id": "file_xyz789", "completion_window": "24h"}'
```

Input JSONL format:

```jsonl
{"custom_id": "r1", "messages": [{"role": "user", "content": "..."}]}
{"custom_id": "r2", "messages": [{"role": "user", "content": "..."}]}
```

---

## Error Handling

Individual request failures are captured per-row in the results — a failed request does not abort the entire batch. Each result row's `error` field is `null` on success or contains `{"message": "..."}` on failure.

A batch-level failure (all requests fail, or an infrastructure error) sets the top-level `status` to `failed` and populates the `error` field on the batch object.

---

## Limits

| Limit | Value |
|---|---|
| Max requests per batch (inline) | 50,000 |
| Results retention | 7 days after completion |
| Max batches in flight (per user) | 10 |
| Minimum completion window | `1h` |

---

## Related

- [Batch Inference Pricing](./batch-inference-pricing.md) — cost model, committed tiers, infrastructure breakdown
- [Rate Limits](./rate-limits.md)
- [Authentication](./authentication.md)
