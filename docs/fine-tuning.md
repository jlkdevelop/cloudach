# Fine-Tuning Guide

Fine-tuning lets you adapt a base model to your domain, tone, or task using your own labelled examples. Cloudach exposes fine-tuning through a simple REST API and serves the resulting LoRA adapters on top of vLLM with zero extra latency.

---

## Supported base models

| Model ID | Parameters | Fine-tuning support | LoRA rank options |
|---|---|---|---|
| `llama3-8b` | 8B | Full fine-tune + LoRA | 8, 16, 32, 64 |
| `llama3-70b` | 70B | LoRA only | 8, 16, 32 |
| `llama31-8b` | 8B | Full fine-tune + LoRA | 8, 16, 32, 64 |
| `llama31-70b` | 70B | LoRA only | 8, 16, 32 |
| `mistral-7b` | 7B | Full fine-tune + LoRA | 8, 16, 32, 64 |
| `mixtral-8x7b` | 8×7B | LoRA only | 8, 16, 32 |

> Full fine-tuning updates all weights and produces a standalone model. LoRA fine-tuning trains lightweight adapter weights (~0.1–1% of model size) that are merged at inference time — recommended for most use cases.

---

## Workflow overview

```
1. Prepare dataset  →  JSONL, ≥ 100 examples
2. Upload dataset   →  POST /v1/fine-tuning/datasets
3. Create job       →  POST /v1/fine-tuning/jobs
4. Monitor job      →  GET  /v1/fine-tuning/jobs/{id}
5. Deploy adapter   →  automatic on job completion
6. Inference        →  POST /v1/chat/completions  (model = your fine-tuned model id)
```

---

## Step 1 — Prepare your dataset

Cloudach uses the **chat format** (same as OpenAI fine-tuning). Each line of your `.jsonl` file must be a JSON object with a `messages` array:

```jsonl
{"messages": [{"role": "system", "content": "You are a helpful customer support agent for Acme Corp."}, {"role": "user", "content": "How do I reset my password?"}, {"role": "assistant", "content": "Go to Settings → Security → Reset password, then follow the email link. The link expires after 24 hours."}]}
{"messages": [{"role": "user", "content": "What is your return policy?"}, {"role": "assistant", "content": "We accept returns within 30 days of purchase. Items must be unopened and in original packaging. Contact support@acme.com to initiate a return."}]}
```

### Requirements

| Parameter | Minimum | Recommended |
|---|---|---|
| Examples | 100 | 500 – 5,000 |
| File size | — | ≤ 500 MB |
| Format | JSONL (UTF-8) | — |
| Turns per example | 1 | 1 – 8 |
| Tokens per example | — | ≤ 4,096 |

See [Data Preparation Guide](./data-preparation.md) for best practices and a sample dataset.

---

## Step 2 — Upload dataset

```bash
curl https://api.cloudach.com/v1/fine-tuning/datasets \
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \
  -F "file=@my_dataset.jsonl" \
  -F "purpose=fine-tune"
```

Response:

```json
{
  "id": "ds-8f3a2b1c",
  "object": "dataset",
  "filename": "my_dataset.jsonl",
  "bytes": 142891,
  "line_count": 523,
  "created_at": 1712000000,
  "status": "processed"
}
```

---

## Step 3 — Create a fine-tuning job

### LoRA fine-tune (recommended)

```bash
curl https://api.cloudach.com/v1/fine-tuning/jobs \
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3-8b",
    "training_file": "ds-8f3a2b1c",
    "method": {
      "type": "lora",
      "lora": {
        "rank": 16,
        "alpha": 32,
        "target_modules": ["q_proj", "v_proj"],
        "dropout": 0.05
      }
    },
    "hyperparameters": {
      "n_epochs": 3,
      "batch_size": 16,
      "learning_rate_multiplier": 1.0
    },
    "suffix": "my-support-bot"
  }'
```

### Full fine-tune (8B models only)

```bash
curl https://api.cloudach.com/v1/fine-tuning/jobs \
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3-8b",
    "training_file": "ds-8f3a2b1c",
    "method": { "type": "full" },
    "hyperparameters": {
      "n_epochs": 2,
      "batch_size": 8,
      "learning_rate_multiplier": 0.5
    },
    "suffix": "my-full-model"
  }'
```

### Job parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `model` | string | — | Base model ID |
| `training_file` | string | — | Dataset ID from upload step |
| `method.type` | `lora` \| `full` | `lora` | Training method |
| `lora.rank` | integer | `16` | LoRA rank (higher = more capacity, more cost) |
| `lora.alpha` | integer | `2 × rank` | LoRA scaling factor |
| `lora.target_modules` | array | `["q_proj","v_proj"]` | Which weight matrices to train |
| `lora.dropout` | float | `0.05` | Regularisation dropout |
| `n_epochs` | integer | `3` | Training passes over the dataset |
| `batch_size` | integer | `16` | Examples per gradient step |
| `learning_rate_multiplier` | float | `1.0` | Scales the base learning rate |
| `suffix` | string | — | Appended to the model ID in deployment |
| `validation_file` | string | — | Optional held-out dataset ID |

---

## Step 4 — Monitor the job

```bash
curl https://api.cloudach.com/v1/fine-tuning/jobs/ftjob-a1b2c3 \
  -H "Authorization: Bearer $CLOUDACH_API_KEY"
```

```json
{
  "id": "ftjob-a1b2c3",
  "object": "fine_tuning.job",
  "model": "llama3-8b",
  "fine_tuned_model": null,
  "status": "running",
  "trained_tokens": 48200,
  "estimated_finish": 1712003600,
  "created_at": 1712001200,
  "events": [
    { "step": 0,   "train_loss": 2.41, "train_mean_token_accuracy": 0.42 },
    { "step": 100, "train_loss": 1.18, "train_mean_token_accuracy": 0.71 }
  ]
}
```

### Job statuses

| Status | Meaning |
|---|---|
| `queued` | Waiting for a GPU slot |
| `running` | Training in progress |
| `succeeded` | Adapter deployed, model ready |
| `failed` | See `error` field for details |
| `cancelled` | Cancelled by user |

### List all jobs

```bash
curl "https://api.cloudach.com/v1/fine-tuning/jobs?limit=20" \
  -H "Authorization: Bearer $CLOUDACH_API_KEY"
```

### Stream events

```bash
curl "https://api.cloudach.com/v1/fine-tuning/jobs/ftjob-a1b2c3/events?stream=true" \
  -H "Authorization: Bearer $CLOUDACH_API_KEY"
```

---

## Step 5 — Run inference with your model

When status is `succeeded`, `fine_tuned_model` contains your deployed model ID, e.g. `llama3-8b:ft:my-support-bot:ftjob-a1b2c3`. Use it exactly like any other model:

```bash
curl https://api.cloudach.com/v1/chat/completions \
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3-8b:ft:my-support-bot:ftjob-a1b2c3",
    "messages": [
      {"role": "user", "content": "What is your return policy?"}
    ]
  }'
```

---

## LoRA adapter internals (vLLM)

Cloudach serving uses **vLLM with LoRA multi-adapter support**. Here is what happens under the hood:

1. When your job completes, the LoRA adapter weights (`adapter_config.json` + `adapter_model.safetensors`) are stored in our object store.
2. When your model receives its first request, vLLM loads the base model once and registers the adapter with `--enable-lora`. Adapter loading adds < 50 ms to the first request (warm thereafter).
3. Multiple LoRA adapters for the same base model can be served concurrently using vLLM's `--max-loras` pool — you are billed only for the base model GPU hours plus a small adapter hosting fee.
4. Adapter weights are swapped per-request using vLLM's `lora_request` mechanism, enabling zero-overhead sharing of the base model across many fine-tuned variants.

### Loading a custom adapter (self-hosted vLLM)

If you self-host vLLM and want to load a Cloudach-trained adapter on your own infrastructure, download the adapter and pass it to vLLM:

```bash
# Download adapter
curl "https://api.cloudach.com/v1/fine-tuning/jobs/ftjob-a1b2c3/download" \
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \
  -o my_adapter.tar.gz

tar -xzf my_adapter.tar.gz -C ./adapters/my-support-bot/
```

```bash
# Start vLLM with LoRA enabled
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Meta-Llama-3-8B-Instruct \
  --enable-lora \
  --lora-modules my-support-bot=./adapters/my-support-bot \
  --max-loras 4 \
  --max-lora-rank 64
```

Then target the adapter by name:

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "my-support-bot", "messages": [...]}'
```

---

## Cancel a job

```bash
curl -X POST "https://api.cloudach.com/v1/fine-tuning/jobs/ftjob-a1b2c3/cancel" \
  -H "Authorization: Bearer $CLOUDACH_API_KEY"
```

---

## Delete a fine-tuned model

```bash
curl -X DELETE "https://api.cloudach.com/v1/models/llama3-8b:ft:my-support-bot:ftjob-a1b2c3" \
  -H "Authorization: Bearer $CLOUDACH_API_KEY"
```

---

## Pricing

Fine-tuning is billed in two parts:

| Component | Price |
|---|---|
| Training (LoRA) | $0.003 / 1K training tokens |
| Training (Full) | $0.008 / 1K training tokens |
| Adapter hosting | $2 / adapter / month |
| Inference | Same as base model rate |

Training tokens = examples × average tokens per example × epochs.

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `dataset_too_small` | Fewer than 100 examples | Add more examples |
| `invalid_format` | JSONL malformed | Validate each line with `jq` |
| `context_length_exceeded` | Example > 4 096 tokens | Truncate or split examples |
| `insufficient_quota` | Free tier limit | Upgrade or contact sales |
| `base_model_unavailable` | Model not accepting jobs | Check status page |

---

## See also

- [Data Preparation Guide](./data-preparation.md) — best practices and sample dataset
- [Models](./models.md) — base model specs
- [Quickstart](./quickstart.md) — general API introduction
