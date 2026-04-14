# Cloudach Python SDK

Official Python client for the [Cloudach](https://cloudach.com) inference API.
OpenAI-compatible method signatures — drop-in replacement for most use-cases.

## Installation

```bash
pip install cloudach
```

## Quickstart

```python
from cloudach import Cloudach

client = Cloudach(api_key="sk-cloudach-...")

# Chat completion
response = client.chat.completions.create(
    model="llama3-8b",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain quantum entanglement in one sentence."},
    ],
)
print(response.choices[0].message.content)
```

## Streaming

```python
stream = client.chat.completions.create(
    model="llama3-70b",
    messages=[{"role": "user", "content": "Write a short poem about the ocean."}],
    stream=True,
)

for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)
print()
```

## List models

```python
models = client.models.list()
for model in models.data:
    print(model.id, model.owned_by)
```

## Retrieve a model

```python
model = client.models.retrieve("llama3-8b")
print(model.id)
```

## Configuration

| Parameter  | Environment variable   | Default                       |
|------------|------------------------|-------------------------------|
| `api_key`  | `CLOUDACH_API_KEY`     | *(required)*                  |
| `base_url` | `CLOUDACH_BASE_URL`    | `https://api.cloudach.com`    |
| `timeout`  | —                      | `60` seconds                  |

```python
client = Cloudach(
    api_key="sk-cloudach-...",
    base_url="http://localhost:8080",  # point at a local gateway
    timeout=30,
)
```

## Error handling

```python
from cloudach import AuthenticationError, RateLimitError, APIError

try:
    response = client.chat.completions.create(
        model="llama3-8b",
        messages=[{"role": "user", "content": "Hello"}],
    )
except AuthenticationError:
    print("Check your API key.")
except RateLimitError:
    print("Rate limit hit — back off and retry.")
except APIError as e:
    print(f"API error {e.status_code}: {e}")
```

## Available models

| Model ID          | Parameters | Context window |
|-------------------|------------|----------------|
| `llama3-8b`       | 8 B        | 8 192          |
| `llama3-70b`      | 70 B       | 8 192          |
| `llama31-8b`      | 8 B        | 131 072        |
| `llama31-70b`     | 70 B       | 131 072        |
| `mistral-7b`      | 7 B        | 32 768         |
| `mixtral-8x7b`    | 47 B (MoE) | 32 768         |
| `deepseek-r1-7b`  | 7 B        | 65 536         |
| `deepseek-r1-70b` | 70 B       | 65 536         |
| `qwen25-7b`       | 7 B        | 131 072        |
| `qwen25-72b`      | 72 B       | 131 072        |
| `phi3-mini`       | 3.8 B      | 4 096          |
| `phi3-medium`     | 14 B       | 4 096          |
| `codellama-7b`    | 7 B        | 16 384         |
| `codellama-13b`   | 13 B       | 16 384         |
| `codellama-34b`   | 34 B       | 16 384         |

## License

MIT
