# Data Preparation for Fine-Tuning

High-quality training data is the single biggest driver of fine-tune quality. This guide covers format requirements, collection strategies, cleaning, and evaluation.

---

## Data format

Cloudach fine-tuning uses the **chat JSONL format**. Each line is a self-contained conversation:

```jsonl
{"messages": [{"role": "system", "content": "..."}, {"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
```

### Roles

| Role | Required | Purpose |
|---|---|---|
| `system` | No | Persona, instructions, context injected at the start |
| `user` | Yes | The human turn(s) |
| `assistant` | Yes | The model turn(s) you want the model to learn |

Multi-turn conversations are supported — alternate `user` and `assistant` as many times as needed. The model trains on all `assistant` turns.

---

## Volume guidelines

More data is better, but quality matters more than quantity.

| Task type | Minimum | Sweet spot | Diminishing returns |
|---|---|---|---|
| Tone / style adjustment | 100 | 200 – 500 | > 1,000 |
| Domain Q&A | 200 | 500 – 2,000 | > 5,000 |
| Classification / routing | 100 | 300 – 1,000 | > 3,000 |
| Structured output (JSON) | 150 | 500 – 1,500 | > 4,000 |
| Complex reasoning | 500 | 1,000 – 5,000 | > 10,000 |

---

## Collecting training data

### Option 1 — Scrape your existing logs

If you already have a chat application, export real user–assistant conversations and filter for high-quality exchanges:

```python
import json

good_examples = []
with open("chat_logs.jsonl") as f:
    for line in f:
        ex = json.loads(line)
        # Keep only thumbs-up rated conversations
        if ex.get("rating") == "positive":
            good_examples.append({
                "messages": ex["messages"]
            })

with open("training_data.jsonl", "w") as out:
    for ex in good_examples:
        out.write(json.dumps(ex) + "\n")
```

### Option 2 — Synthetic generation

Use a strong base model to generate training examples from seed data, then review manually:

```python
import openai

client = openai.OpenAI(
    api_key="YOUR_CLOUDACH_API_KEY",
    base_url="https://api.cloudach.com/v1"
)

seeds = [
    "How do I cancel my subscription?",
    "Where can I find my invoice?",
    "I was charged twice — what do I do?",
]

examples = []
for question in seeds:
    resp = client.chat.completions.create(
        model="llama3-70b",
        messages=[
            {"role": "system", "content": "Generate a helpful, concise customer support response for Acme Corp. Be friendly and professional. Give a direct answer, then offer next steps."},
            {"role": "user", "content": question}
        ]
    )
    answer = resp.choices[0].message.content
    examples.append({
        "messages": [
            {"role": "system", "content": "You are a helpful customer support agent for Acme Corp."},
            {"role": "user", "content": question},
            {"role": "assistant", "content": answer}
        ]
    })

with open("synthetic_data.jsonl", "w") as f:
    for ex in examples:
        f.write(json.dumps(ex) + "\n")
```

> Always review synthetic data before training. Remove hallucinations, wrong facts, or off-brand phrasing.

### Option 3 — Human annotation

For highest quality, use a tool like Label Studio or Argilla to have annotators write ideal responses to real user queries. This is slower but produces the best fine-tune results.

---

## Cleaning your dataset

### Validate format

```bash
python -c "
import sys, json
errors = 0
with open('training_data.jsonl') as f:
    for i, line in enumerate(f, 1):
        try:
            obj = json.loads(line)
            assert 'messages' in obj, 'missing messages key'
            roles = [m['role'] for m in obj['messages']]
            assert 'user' in roles, 'no user turn'
            assert 'assistant' in roles, 'no assistant turn'
        except Exception as e:
            print(f'Line {i}: {e}')
            errors += 1
print(f'Done. {errors} errors found.')
"
```

### Token count check

Cloudach truncates examples longer than 4,096 tokens. Check your distribution first:

```python
import json
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("meta-llama/Meta-Llama-3-8B")

lengths = []
with open("training_data.jsonl") as f:
    for line in f:
        ex = json.loads(line)
        text = " ".join(m["content"] for m in ex["messages"])
        lengths.append(len(tokenizer.encode(text)))

print(f"Min: {min(lengths)}, Max: {max(lengths)}, Avg: {sum(lengths)/len(lengths):.0f}")
over_limit = sum(1 for l in lengths if l > 4096)
print(f"Examples over 4096 tokens: {over_limit} ({over_limit/len(lengths)*100:.1f}%)")
```

### Deduplicate

Remove near-duplicate examples to avoid overfitting to specific phrasings:

```python
import json, hashlib

seen = set()
deduped = []
with open("training_data.jsonl") as f:
    for line in f:
        ex = json.loads(line)
        # Hash on user turns only
        user_text = " ".join(m["content"] for m in ex["messages"] if m["role"] == "user")
        key = hashlib.md5(user_text.lower().strip().encode()).hexdigest()
        if key not in seen:
            seen.add(key)
            deduped.append(ex)

print(f"Removed {len(seen) - len(deduped)} duplicates. {len(deduped)} examples remaining.")
with open("training_data_deduped.jsonl", "w") as f:
    for ex in deduped:
        f.write(json.dumps(ex) + "\n")
```

---

## Train / validation split

Hold out 10 % of your data as a validation set. Pass it as `validation_file` when creating the job — Cloudach will report validation loss so you can detect overfitting.

```python
import json, random

with open("training_data_deduped.jsonl") as f:
    examples = [json.loads(l) for l in f]

random.shuffle(examples)
split = int(len(examples) * 0.9)
train, val = examples[:split], examples[split:]

with open("train.jsonl", "w") as f:
    for ex in train: f.write(json.dumps(ex) + "\n")

with open("val.jsonl", "w") as f:
    for ex in val: f.write(json.dumps(ex) + "\n")

print(f"Train: {len(train)}, Validation: {len(val)}")
```

---

## Best practices

### Do
- Write `assistant` turns in the exact tone and format you want the model to use in production
- Include a consistent `system` prompt in every example — the same one you'll use at inference time
- Cover edge cases: unanswerable questions, ambiguous inputs, refusal scenarios
- Balance your dataset: if one category has 10× more examples than others, the model will favour it
- Review 50–100 examples manually before upload

### Don't
- Mix response styles (e.g. bullet points in some examples, prose in others) unless that is intentional
- Include personally identifiable information (PII) — strip emails, phone numbers, names
- Use the same example verbatim more than 3 times
- Leave empty `assistant` turns (the model will learn to output nothing)
- Include HTML/markdown formatting in `assistant` turns unless your app renders it

---

## Sample dataset

A ready-to-use customer support dataset (50 examples) is available at [`docs/examples/fine-tuning/sample_dataset.jsonl`](./examples/fine-tuning/sample_dataset.jsonl). Use it to:

- Test the upload and job creation workflow end-to-end
- Understand the expected JSONL structure
- Bootstrap a customer support fine-tune (add your own examples on top)

---

## See also

- [Fine-Tuning Guide](./fine-tuning.md) — upload, job creation, inference
- [Models](./models.md) — base model specs and LoRA rank options
