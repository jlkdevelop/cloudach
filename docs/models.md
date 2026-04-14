# Models

Cloudach hosts open-source LLMs on our GPU infrastructure. All models are served through the same OpenAI-compatible API.

---

## Available models

| Model ID | Description | Context window |
|----------|-------------|----------------|
| `llama3-8b` | Meta Llama 3 8B Instruct — fast, efficient, great for most tasks | 8 192 tokens |
| `llama3-70b` | Meta Llama 3 70B Instruct — higher quality, slower | 8 192 tokens |
| `mistral-7b` | Mistral 7B Instruct — fast with strong reasoning | 32 768 tokens |
| `mixtral-8x7b` | Mixtral 8×7B MoE — high quality, mixture-of-experts architecture | 32 768 tokens |
| `codellama-13b` | Code Llama 13B — optimised for code generation and explanation | 16 384 tokens |
| `gemma-7b` | Google Gemma 7B — compact, multilingual | 8 192 tokens |

> **Currently live on our GPU cluster:** `llama3-8b`. Other models are available and will be fully live as we scale the fleet. Contact us if you need a specific model urgently.

---

## List models via API

```bash
curl https://api.cloudach.com/v1/models \
  -H "Authorization: Bearer $CLOUDACH_API_KEY"
```

Response:

```json
{
  "object": "list",
  "data": [
    {
      "id": "llama3-8b",
      "object": "model",
      "created": 1712000000,
      "owned_by": "cloudach"
    }
  ]
}
```

---

## Get a specific model

```bash
curl https://api.cloudach.com/v1/models/llama3-8b \
  -H "Authorization: Bearer $CLOUDACH_API_KEY"
```

---

## Choosing a model

- **Default / general use:** `llama3-8b` — low latency, good quality, most cost-efficient
- **Higher quality responses:** `llama3-70b` or `mixtral-8x7b`
- **Code generation:** `codellama-13b`
- **Long context (up to 32K tokens):** `mistral-7b` or `mixtral-8x7b`

For a full decision tree, use case matrix, benchmark comparisons, and cost-performance tradeoffs, see the **[Model Selection Guide](./model-selection-guide.md)**.

---

## Fine-tuning support

You can fine-tune base models to adapt them to your domain, tone, or task. Cloudach uses LoRA (Low-Rank Adaptation) and serves the resulting adapters on vLLM with no extra inference latency.

| Model ID | Fine-tuning method | LoRA rank options |
|---|---|---|
| `llama3-8b` | Full fine-tune + LoRA | 8, 16, 32, 64 |
| `llama3-70b` | LoRA only | 8, 16, 32 |
| `llama31-8b` | Full fine-tune + LoRA | 8, 16, 32, 64 |
| `llama31-70b` | LoRA only | 8, 16, 32 |
| `mistral-7b` | Full fine-tune + LoRA | 8, 16, 32, 64 |
| `mixtral-8x7b` | LoRA only | 8, 16, 32 |

> **Recommended starting point:** `llama3-8b` with LoRA rank 16. Only move to a larger model if the 8B fine-tune doesn't meet your quality bar — there is a 5–8× cost difference.

See the [Fine-Tuning Guide](./fine-tuning.md) for the full workflow: dataset format, upload, job creation, monitoring, and inference.
