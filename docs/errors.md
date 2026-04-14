# API Error Reference

Cloudach uses the OpenAI error schema for all error responses. Every error body follows this shape:

```json
{
  "error": {
    "message": "Human-readable description of the error.",
    "type": "error_type_string",
    "code": "machine_readable_code",
    "param": "field_name_if_applicable"
  }
}
```

`param` is only present when the error is tied to a specific request field (e.g. `model`, `messages`, `temperature`).

---

## Error codes at a glance

| HTTP | `type` | `code` | Cause | Fix |
|------|--------|--------|-------|-----|
| 400 | `invalid_request_error` | `invalid_request` | Malformed JSON body | Fix your request body |
| 400 | `invalid_request_error` | `missing_required_param` | `model` or `messages` missing | Add required fields |
| 400 | `invalid_request_error` | `invalid_param_value` | `temperature` out of range, empty `messages`, etc. | Validate param values |
| 400 | `invalid_request_error` | `context_length_exceeded` | Prompt + max_tokens > model context limit | Shorten prompt or reduce max_tokens |
| 401 | `invalid_request_error` | `missing_credentials` | No `Authorization` header | Add `Authorization: Bearer <key>` |
| 401 | `authentication_error` | `invalid_api_key` | Key is wrong, expired, or revoked | Check key in dashboard |
| 403 | `permission_error` | `insufficient_quota` | Monthly token cap reached on current plan | Upgrade plan or wait for reset |
| 404 | `invalid_request_error` | `model_not_found` | Model ID not recognised | Call `GET /v1/models` for valid IDs |
| 404 | `invalid_request_error` | `not_found` | Route does not exist | Check the base URL and path |
| 413 | `invalid_request_error` | `request_too_large` | Request body > 1 MB | Reduce payload size |
| 429 | `requests` | `rate_limit_exceeded` | RPM limit hit for this API key | Wait for `Retry-After` seconds, then retry |
| 429 | `tokens` | `rate_limit_exceeded` | TPD limit hit for this API key | Wait until midnight UTC for reset |
| 500 | `api_error` | `internal_server_error` | Unexpected server fault | Retry with exponential backoff; contact support if persistent |
| 502 | `api_error` | `model_backend_unavailable` | Inference backend is down or overloaded | Retry with exponential backoff |
| 503 | `api_error` | `service_unavailable` | Planned or unplanned maintenance | Check [status.cloudach.com](https://status.cloudach.com) |

---

## 400 — Bad Request

### Malformed JSON

```json
{
  "error": {
    "message": "Could not parse request body as JSON.",
    "type": "invalid_request_error",
    "code": "invalid_request"
  }
}
```

**Fix:** Ensure the body is valid JSON and the `Content-Type: application/json` header is set.

### Missing required field

```json
{
  "error": {
    "message": "Missing required parameter: 'messages'.",
    "type": "invalid_request_error",
    "code": "missing_required_param",
    "param": "messages"
  }
}
```

**Fix:** Include both `model` (string) and `messages` (non-empty array) in every chat completion request.

### Invalid parameter value

```json
{
  "error": {
    "message": "Invalid value for 'temperature': must be between 0 and 2.",
    "type": "invalid_request_error",
    "code": "invalid_param_value",
    "param": "temperature"
  }
}
```

**Fix:** Keep `temperature` in `[0.0, 2.0]`. Keep `max_tokens` ≥ 1.

### Context length exceeded

```json
{
  "error": {
    "message": "This model's maximum context length is 8192 tokens, but your request has 9500 tokens (8100 prompt + 1400 max_tokens). Shorten your messages or reduce max_tokens.",
    "type": "invalid_request_error",
    "code": "context_length_exceeded"
  }
}
```

**Fix:** Trim conversation history, summarise earlier turns, or switch to a model with a larger context window (e.g. `llama31-70b` with 128 K context).

---

## 401 — Unauthorised

### Missing credentials

```json
{
  "error": {
    "message": "Missing credentials. Include 'Authorization: Bearer <api-key>'.",
    "type": "invalid_request_error",
    "code": "missing_credentials"
  }
}
```

### Invalid or revoked key

```json
{
  "error": {
    "message": "Invalid or revoked API key.",
    "type": "authentication_error",
    "code": "invalid_api_key"
  }
}
```

**Fix:** Verify the key in the [API keys dashboard](https://app.cloudach.com/dashboard/api-keys). Keys are shown only once at creation; if lost, rotate the key and update your environment variables.

---

## 403 — Forbidden

### Quota exhausted

```json
{
  "error": {
    "message": "You have exceeded your monthly token quota. Upgrade your plan or wait for the quota to reset.",
    "type": "permission_error",
    "code": "insufficient_quota"
  }
}
```

**Fix:** Upgrade your plan from the dashboard or contact [sales@cloudach.com](mailto:sales@cloudach.com).

---

## 404 — Not Found

### Unknown model

```json
{
  "error": {
    "message": "The model 'gpt-4' does not exist or you do not have access to it.",
    "type": "invalid_request_error",
    "code": "model_not_found",
    "param": "model"
  }
}
```

**Fix:** Call `GET /v1/models` to retrieve valid model IDs (e.g. `llama3-8b`, `mistral-7b`).

### Unknown route

```json
{
  "error": {
    "message": "Not found.",
    "type": "invalid_request_error",
    "code": "not_found"
  }
}
```

**Fix:** Confirm the endpoint path and base URL (`https://api.cloudach.com/v1`).

---

## 413 — Request Too Large

```json
{
  "error": {
    "message": "Request body too large. Maximum allowed size is 1 MB.",
    "type": "invalid_request_error",
    "code": "request_too_large"
  }
}
```

**Fix:** Reduce the size of the `messages` array. For large documents, chunk input before sending.

---

## 429 — Too Many Requests

### RPM limit exceeded

```json
{
  "error": {
    "message": "Rate limit exceeded: 60 requests per minute.",
    "type": "requests",
    "code": "rate_limit_exceeded"
  }
}
```

Response headers when rate-limited:

| Header | Example | Meaning |
|--------|---------|---------|
| `Retry-After` | `60` | Seconds before the window resets |
| `X-RateLimit-Limit-Requests` | `60` | Your RPM ceiling |
| `X-RateLimit-Remaining-Requests` | `0` | Requests left in this window |
| `X-RateLimit-Reset-Requests` | `2026-04-14T12:01:00Z` | UTC timestamp when window resets |

### Daily token limit exceeded

```json
{
  "error": {
    "message": "You have exceeded your daily token limit of 1,000,000 tokens. Tokens reset at midnight UTC.",
    "type": "tokens",
    "code": "rate_limit_exceeded"
  }
}
```

**Distinguish RPM vs TPD errors** by checking the `type` field: `"requests"` = RPM, `"tokens"` = TPD.

---

## 500 — Internal Server Error

```json
{
  "error": {
    "message": "An internal server error occurred. Please retry your request.",
    "type": "api_error",
    "code": "internal_server_error"
  }
}
```

**Fix:** Retry with exponential backoff. If the error persists across multiple retries, contact [support@cloudach.com](mailto:support@cloudach.com) with the request timestamp and your API key prefix.

---

## 502 — Bad Gateway

```json
{
  "error": {
    "message": "The model backend is temporarily unavailable. Please retry your request.",
    "type": "api_error",
    "code": "model_backend_unavailable"
  }
}
```

**Fix:** Retry with exponential backoff. Check [status.cloudach.com](https://status.cloudach.com) for ongoing incidents.

---

## 503 — Service Unavailable

```json
{
  "error": {
    "message": "Service temporarily unavailable due to maintenance.",
    "type": "api_error",
    "code": "service_unavailable"
  }
}
```

**Fix:** Monitor [status.cloudach.com](https://status.cloudach.com) and retry once the incident resolves.

---

## Streaming error handling

When `"stream": true`, the API sends newline-delimited `data:` events. Errors can occur in two places:

### 1. Before the stream starts (HTTP error)

If the request is invalid (bad auth, rate limit, malformed body), the response has a non-200 status and a normal JSON error body — no `data:` events are sent. Handle this the same as a non-streaming error.

```python
try:
    stream = client.chat.completions.create(
        model="llama3-8b",
        messages=[{"role": "user", "content": "Hello"}],
        stream=True,
    )
except openai.AuthenticationError as e:
    print("Auth failed:", e)
except openai.RateLimitError as e:
    print("Rate limited:", e)
```

### 2. Mid-stream error (stream interrupted)

If the backend fails after the stream has started, the `data:` sequence is cut short. The final event is an error object instead of `[DONE]`:

```
data: {"id":"chatcmpl-abc","choices":[{"delta":{"content":"The answer"},"index":0}]}

data: {"error": {"message": "Stream interrupted by server.", "type": "api_error", "code": "stream_error"}}
```

The stream will then close. You will **not** receive `data: [DONE]`.

**Python — detecting mid-stream errors:**

```python
from openai import OpenAI

client = OpenAI(api_key="sk-cloudach-YOUR_KEY", base_url="https://api.cloudach.com/v1")

collected = []
try:
    stream = client.chat.completions.create(
        model="llama3-8b",
        messages=[{"role": "user", "content": "Tell me a story."}],
        stream=True,
    )
    for chunk in stream:
        delta = chunk.choices[0].delta.content or ""
        collected.append(delta)
        print(delta, end="", flush=True)
except openai.APIStatusError as e:
    # Covers mid-stream 5xx errors surfaced by the SDK
    print(f"\nStream error ({e.status_code}): {e.message}")
    # Optionally retry the full request
```

**Node.js — detecting mid-stream errors:**

```javascript
import OpenAI from "openai";

const client = new OpenAI({ apiKey: "sk-cloudach-YOUR_KEY", baseURL: "https://api.cloudach.com/v1" });

const collected = [];
try {
  const stream = await client.chat.completions.create({
    model: "llama3-8b",
    messages: [{ role: "user", content: "Tell me a story." }],
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? "";
    collected.push(delta);
    process.stdout.write(delta);
  }
} catch (err) {
  if (err instanceof OpenAI.APIError) {
    console.error(`\nStream error (${err.status}): ${err.message}`);
    // Retry full request here if needed
  } else {
    throw err;
  }
}
```

**Network-level interruptions** (TCP reset, proxy timeout) surface as connection errors from the underlying HTTP client, not as API error JSON. Always wrap stream consumption in a try/catch and implement a retry strategy.

---

## Retry guidance — exponential backoff

Retry on `429`, `500`, `502`, and `503`. Do **not** retry on `400`, `401`, `403`, or `404` — those indicate a bug in the request.

### Python

```python
import time
from openai import OpenAI, RateLimitError, APIStatusError

client = OpenAI(api_key="sk-cloudach-YOUR_KEY", base_url="https://api.cloudach.com/v1")

RETRYABLE = {429, 500, 502, 503}

def chat_with_backoff(messages, model="llama3-8b", max_retries=5):
    for attempt in range(max_retries):
        try:
            return client.chat.completions.create(model=model, messages=messages)
        except APIStatusError as e:
            if e.status_code not in RETRYABLE or attempt == max_retries - 1:
                raise
            # Respect Retry-After when present (rate limits), otherwise exponential backoff
            retry_after = e.response.headers.get("Retry-After")
            wait = float(retry_after) if retry_after else (2 ** attempt)
            print(f"Attempt {attempt + 1} failed ({e.status_code}). Retrying in {wait}s...")
            time.sleep(wait)
```

### Node.js

```javascript
import OpenAI from "openai";

const client = new OpenAI({ apiKey: "sk-cloudach-YOUR_KEY", baseURL: "https://api.cloudach.com/v1" });

const RETRYABLE = new Set([429, 500, 502, 503]);

async function chatWithBackoff(messages, model = "llama3-8b", maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await client.chat.completions.create({ model, messages });
    } catch (err) {
      if (!(err instanceof OpenAI.APIError) || !RETRYABLE.has(err.status) || attempt === maxRetries - 1) {
        throw err;
      }
      // Respect Retry-After header when present
      const retryAfter = err.headers?.["retry-after"];
      const wait = retryAfter ? parseFloat(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
      console.log(`Attempt ${attempt + 1} failed (${err.status}). Retrying in ${wait}ms...`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}
```

**Backoff schedule (no `Retry-After`):**

| Attempt | Wait |
|---------|------|
| 1 | 1 s |
| 2 | 2 s |
| 3 | 4 s |
| 4 | 8 s |
| 5 | 16 s |

Add ±10% random jitter to avoid thundering-herd problems when many clients retry simultaneously.

---

## Checking API status

Live status, incident history, and scheduled maintenance windows:
[status.cloudach.com](https://status.cloudach.com)

For support: [support@cloudach.com](mailto:support@cloudach.com)
