// ─── Request types ───────────────────────────────────────────────────────────

export type Role = "system" | "user" | "assistant";

export interface MessageParam {
  role: Role;
  content: string;
}

export interface ChatCompletionCreateParams {
  model: string;
  messages: MessageParam[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stop?: string | string[];
  [key: string]: unknown;
}

// ─── Response types ───────────────────────────────────────────────────────────

export interface CompletionUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface ChatCompletionMessage {
  role: Role;
  content: string;
}

export interface ChatCompletionChoice {
  index: number;
  message: ChatCompletionMessage;
  finish_reason: string | null;
}

export interface ChatCompletion {
  id: string;
  object: "chat.completion";
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage?: CompletionUsage;
}

// ─── Streaming types ──────────────────────────────────────────────────────────

export interface ChatCompletionDelta {
  role?: Role;
  content?: string;
}

export interface ChatCompletionChunkChoice {
  index: number;
  delta: ChatCompletionDelta;
  finish_reason: string | null;
}

export interface ChatCompletionChunk {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  model: string;
  choices: ChatCompletionChunkChoice[];
}

// ─── Model types ──────────────────────────────────────────────────────────────

export interface Model {
  id: string;
  object: "model";
  created: number;
  owned_by: string;
}

export interface ModelList {
  object: "list";
  data: Model[];
}

// ─── Error types ──────────────────────────────────────────────────────────────

export interface APIErrorBody {
  error?: {
    message: string;
    type?: string;
    param?: string;
    code?: string;
  };
}
