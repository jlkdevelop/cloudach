# Quickstart: Zero to First API Call in 5 Minutes

Cloudach is an OpenAI-compatible LLM API. If you've used OpenAI, you already know how to use Cloudach — just point your client at `https://api.cloudach.com/v1` with your Cloudach API key.

---

## Step 1 — Get an API key

1. Sign up at [cloudach.com](https://cloudach.com)
2. Open the **Dashboard** → **API Keys**
3. Click **Create key**, give it a name, and copy the key

Your key looks like: `sk-cloudach-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

> **Important:** The raw key is shown only once. Store it somewhere safe (a password manager or a `.env` file that's gitignored).

---

## Step 2 — Make your first API call

### curl

```bash
curl https://api.cloudach.com/v1/chat/completions \
  -H "Authorization: Bearer $CLOUDACH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3-8b",
    "messages": [
      {"role": "user", "content": "Say hello in one sentence."}
    ]
  }'
```

Expected response:

```json
{
  "id": "chatcmpl-...",
  "object": "chat.completion",
  "created": 1712000000,
  "model": "llama3-8b",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! I'm happy to greet you today."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 15,
    "completion_tokens": 12,
    "total_tokens": 27
  }
}
```

---

## Step 3 — Use an SDK

Because Cloudach is OpenAI-compatible, you can use the official OpenAI SDK by changing two lines: the `base_url` and the `api_key`.

### Python

```bash
pip install openai
```

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://api.cloudach.com/v1",
    api_key="sk-cloudach-your-key-here",
)

response = client.chat.completions.create(
    model="llama3-8b",
    messages=[{"role": "user", "content": "Say hello in one sentence."}],
)

print(response.choices[0].message.content)
```

### Node.js

```bash
npm install openai
```

> **Note:** These snippets use ES module syntax (`import`) and top-level `await`. Make sure your `package.json` contains `"type": "module"` before running with `node`.

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.cloudach.com/v1",
  apiKey: "sk-cloudach-your-key-here",
});

const response = await client.chat.completions.create({
  model: "llama3-8b",
  messages: [{ role: "user", content: "Say hello in one sentence." }],
});

console.log(response.choices[0].message.content);
```

### Go

```bash
go get github.com/sashabaranov/go-openai
```

```go
package main

import (
    "context"
    "fmt"
    openai "github.com/sashabaranov/go-openai"
)

func main() {
    config := openai.DefaultConfig("sk-cloudach-your-key-here")
    config.BaseURL = "https://api.cloudach.com/v1"
    client := openai.NewClientWithConfig(config)

    resp, err := client.CreateChatCompletion(
        context.Background(),
        openai.ChatCompletionRequest{
            Model: "llama3-8b",
            Messages: []openai.ChatCompletionMessage{
                {Role: openai.ChatMessageRoleUser, Content: "Say hello in one sentence."},
            },
        },
    )
    if err != nil {
        panic(err)
    }
    fmt.Println(resp.Choices[0].Message.Content)
}
```

---

## What's next?

- [Available models](./models.md) — full model list and capabilities
- [Authentication](./authentication.md) — API key scoping, rotation, and best practices
- [Rate limits](./rate-limits.md) — default limits and how to handle 429s
- [Examples](./examples/) — streaming, system prompts, legacy completions
