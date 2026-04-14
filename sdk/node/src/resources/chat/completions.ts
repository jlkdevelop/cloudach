import * as https from "https";
import * as http from "http";
import type { Cloudach } from "../../client";
import type {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionCreateParams,
} from "../../types";
import { APIConnectionError, makeAPIError } from "../../errors";

// Overload signatures for strict stream typing
export interface CompletionsResource {
  create(
    params: ChatCompletionCreateParams & { stream: true },
  ): AsyncIterable<ChatCompletionChunk>;
  create(
    params: ChatCompletionCreateParams & { stream?: false },
  ): Promise<ChatCompletion>;
  create(
    params: ChatCompletionCreateParams,
  ): Promise<ChatCompletion> | AsyncIterable<ChatCompletionChunk>;
}

export class CompletionsResource {
  constructor(private readonly client: Cloudach) {}

  create(
    params: ChatCompletionCreateParams & { stream: true },
  ): AsyncIterable<ChatCompletionChunk>;
  create(
    params: ChatCompletionCreateParams & { stream?: false },
  ): Promise<ChatCompletion>;
  create(
    params: ChatCompletionCreateParams,
  ): Promise<ChatCompletion> | AsyncIterable<ChatCompletionChunk> {
    if (params.stream) {
      return this._stream(params);
    }
    return this.client._post<ChatCompletion>("/v1/chat/completions", params);
  }

  private async *_stream(
    params: ChatCompletionCreateParams,
  ): AsyncIterable<ChatCompletionChunk> {
    const body = JSON.stringify(params);
    const url = new URL(this.client.baseUrl + "/v1/chat/completions");
    const isHttps = url.protocol === "https:";
    const transport = isHttps ? https : http;

    const chunks: AsyncIterable<ChatCompletionChunk> = await new Promise(
      (resolve, reject) => {
        const req = transport.request(
          {
            hostname: url.hostname,
            port: url.port || (isHttps ? 443 : 80),
            path: url.pathname + url.search,
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.client.apiKey}`,
              "Content-Type": "application/json",
              Accept: "text/event-stream",
              "Content-Length": Buffer.byteLength(body),
            },
          },
          (res) => {
            const statusCode = res.statusCode ?? 500;
            if (statusCode >= 400) {
              let rawBody = "";
              res.on("data", (d: Buffer) => (rawBody += d.toString()));
              res.on("end", () => {
                let parsed: unknown;
                try {
                  parsed = JSON.parse(rawBody);
                } catch {
                  parsed = null;
                }
                reject(makeAPIError(statusCode, parsed as never));
              });
              return;
            }
            // Return an async generator that consumes the SSE stream
            resolve(parseSSEStream(res));
          },
        );

        req.on("error", (err: Error) => {
          reject(new APIConnectionError(`Connection error: ${err.message}`, err));
        });

        req.setTimeout(this.client.timeout, () => {
          req.destroy();
          reject(new APIConnectionError("Request timed out"));
        });

        req.write(body);
        req.end();
      },
    );

    yield* chunks;
  }
}

async function* parseSSEStream(
  stream: NodeJS.ReadableStream,
): AsyncIterable<ChatCompletionChunk> {
  let buffer = "";
  for await (const raw of stream) {
    buffer += (raw as Buffer).toString();
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === "data: [DONE]") continue;
      if (trimmed.startsWith("data: ")) {
        const payload = trimmed.slice(6);
        try {
          yield JSON.parse(payload) as ChatCompletionChunk;
        } catch {
          // skip malformed SSE lines
        }
      }
    }
  }
}
