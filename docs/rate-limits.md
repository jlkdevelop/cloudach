# Rate Limits

Cloudach enforces rate limits to ensure fair usage across all customers.

---

## Default limits

| Limit | Default | Notes |
|-------|---------|-------|
| Requests per minute (RPM) | 60 | Per API key |
| Tokens per day (TPD) | 1 000 000 | Per user account |

---

## Per-key overrides

When you create an API key in the dashboard, you can set a custom `rate_limit_rpm` for that key. This is useful for:

- **Restricting** a key used in an untrusted environment
- **Increasing** the limit for a high-throughput integration (contact us to raise limits above the default)

---

## Rate limit errors

When you exceed the RPM limit, you receive a `429` response:

```json
{
  "error": {
    "message": "Rate limit exceeded: 60 requests per minute.",
    "type": "requests",
    "code": "rate_limit_exceeded"
  }
}
```

The response also includes a `Retry-After: 60` header indicating the number of seconds to wait before retrying.

---

## Handling 429s in your code

### Python (with exponential backoff)

```python
import time
import openai

client = openai.OpenAI(
    base_url="https://api.cloudach.com/v1",
    api_key="sk-cloudach-your-key-here",
)

def chat_with_retry(messages, model="llama3-8b", max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.chat.completions.create(model=model, messages=messages)
        except openai.RateLimitError as e:
            if attempt == max_retries - 1:
                raise
            wait = 2 ** attempt  # 1s, 2s, 4s
            print(f"Rate limited. Waiting {wait}s...")
            time.sleep(wait)
```

### Node.js

```javascript
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.cloudach.com/v1",
  apiKey: "sk-cloudach-your-key-here",
});

async function chatWithRetry(messages, model = "llama3-8b", maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await client.chat.completions.create({ model, messages });
    } catch (err) {
      if (err instanceof OpenAI.RateLimitError && attempt < maxRetries - 1) {
        const wait = Math.pow(2, attempt) * 1000;
        console.log(`Rate limited. Waiting ${wait}ms...`);
        await new Promise((r) => setTimeout(r, wait));
      } else {
        throw err;
      }
    }
  }
}
```

---

## Need higher limits?

Contact us at [support@cloudach.com](mailto:support@cloudach.com) to discuss enterprise limits.
