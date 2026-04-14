# Cloudach Node.js SDK

Official TypeScript/Node.js client for the [Cloudach](https://cloudach.com) inference API.
OpenAI-compatible method signatures — drop-in replacement for most use-cases.
Zero runtime dependencies.

## Installation

```bash
npm install cloudach
# or
yarn add cloudach
```

## Quickstart

```ts
import { Cloudach } from "cloudach";

const client = new Cloudach({ apiKey: "sk-cloudach-..." });

// Chat completion
const response = await client.chat.completions.create({
  model: "llama3-8b",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Explain quantum entanglement in one sentence." },
  ],
});

console.log(response.choices[0].message.content);
```

## Streaming

```ts
const stream = client.chat.completions.create({
  model: "llama3-70b",
  messages: [{ role: "user", content: "Write a short poem about the ocean." }],
  stream: true,
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta.content;
  if (delta) process.stdout.write(delta);
}
console.log();
```

## List models

```ts
const { data: models } = await client.models.list();
for (const model of models) {
  console.log(model.id, model.owned_by);
}
```

## Retrieve a model

```ts
const model = await client.models.retrieve("llama3-8b");
console.log(model.id);
```

## Configuration

| Option     | Environment variable   | Default                       |
|------------|------------------------|-------------------------------|
| `apiKey`   | `CLOUDACH_API_KEY`     | *(required)*                  |
| `baseUrl`  | `CLOUDACH_BASE_URL`    | `https://api.cloudach.com`    |
| `timeout`  | —                      | `60000` ms                    |

```ts
const client = new Cloudach({
  apiKey: "sk-cloudach-...",
  baseUrl: "http://localhost:8080", // point at a local gateway
  timeout: 30_000,
});
```

## Error handling

```ts
import {
  Cloudach,
  AuthenticationError,
  RateLimitError,
  APIError,
} from "cloudach";

try {
  const response = await client.chat.completions.create({
    model: "llama3-8b",
    messages: [{ role: "user", content: "Hello" }],
  });
} catch (err) {
  if (err instanceof AuthenticationError) {
    console.error("Check your API key.");
  } else if (err instanceof RateLimitError) {
    console.error("Rate limit hit — back off and retry.");
  } else if (err instanceof APIError) {
    console.error(`API error ${err.status}: ${err.message}`);
  } else {
    throw err;
  }
}
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

## Requirements

- Node.js 18+
- No runtime dependencies

## License

MIT
