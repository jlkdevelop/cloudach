import * as https from "https";
import * as http from "http";
import { ChatResource } from "./resources/chat/index";
import { ModelsResource } from "./resources/models";
import { APIConnectionError, makeAPIError } from "./errors";
import type { APIErrorBody } from "./types";

const DEFAULT_BASE_URL = "https://api.cloudach.com";
const DEFAULT_TIMEOUT_MS = 60_000;

export interface CloudachOptions {
  /** Your `sk-cloudach-*` API key. Falls back to `CLOUDACH_API_KEY` env var. */
  apiKey?: string;
  /** Override the API base URL (useful for local testing). */
  baseUrl?: string;
  /** HTTP timeout in milliseconds (default: 60 000). */
  timeout?: number;
}

/**
 * Cloudach API client.
 *
 * @example
 * ```ts
 * import { Cloudach } from "cloudach";
 *
 * const client = new Cloudach({ apiKey: "sk-cloudach-..." });
 *
 * const response = await client.chat.completions.create({
 *   model: "llama3-8b",
 *   messages: [{ role: "user", content: "Hello!" }],
 * });
 * console.log(response.choices[0].message.content);
 * ```
 */
export class Cloudach {
  readonly apiKey: string;
  readonly baseUrl: string;
  readonly timeout: number;

  /** Chat completion resource — `client.chat.completions.create(...)` */
  readonly chat: ChatResource;
  /** Models resource — `client.models.list()` / `client.models.retrieve(id)` */
  readonly models: ModelsResource;

  constructor(options: CloudachOptions = {}) {
    const resolvedKey =
      options.apiKey ?? process.env["CLOUDACH_API_KEY"] ?? "";
    if (!resolvedKey) {
      throw new Error(
        'No API key provided. Pass { apiKey: "sk-cloudach-..." } or set the ' +
          "CLOUDACH_API_KEY environment variable.",
      );
    }
    this.apiKey = resolvedKey;
    this.baseUrl = (
      options.baseUrl ??
      process.env["CLOUDACH_BASE_URL"] ??
      DEFAULT_BASE_URL
    ).replace(/\/$/, "");
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT_MS;

    this.chat = new ChatResource(this);
    this.models = new ModelsResource(this);
  }

  // ─── Internal HTTP helpers ─────────────────────────────────────────────────

  _get<T>(path: string): Promise<T> {
    return this._request<T>("GET", path, undefined);
  }

  _post<T>(path: string, body: unknown): Promise<T> {
    return this._request<T>("POST", path, body);
  }

  private _request<T>(method: string, path: string, body: unknown): Promise<T> {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path);
      const isHttps = url.protocol === "https:";
      const transport = isHttps ? https : http;
      const bodyStr = body !== undefined ? JSON.stringify(body) : undefined;

      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      };
      if (bodyStr !== undefined) {
        headers["Content-Length"] = String(Buffer.byteLength(bodyStr));
      }

      const req = transport.request(
        {
          hostname: url.hostname,
          port: url.port || (isHttps ? 443 : 80),
          path: url.pathname + url.search,
          method,
          headers,
        },
        (res) => {
          let raw = "";
          res.on("data", (chunk: Buffer) => (raw += chunk.toString()));
          res.on("end", () => {
            const statusCode = res.statusCode ?? 500;
            let parsed: unknown;
            try {
              parsed = JSON.parse(raw);
            } catch {
              parsed = null;
            }
            if (statusCode >= 400) {
              reject(makeAPIError(statusCode, parsed as APIErrorBody | null));
            } else {
              resolve(parsed as T);
            }
          });
        },
      );

      req.on("error", (err: Error) => {
        reject(new APIConnectionError(`Connection error: ${err.message}`, err));
      });

      req.setTimeout(this.timeout, () => {
        req.destroy();
        reject(new APIConnectionError("Request timed out"));
      });

      if (bodyStr !== undefined) req.write(bodyStr);
      req.end();
    });
  }
}
