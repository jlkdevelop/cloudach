import type { APIErrorBody } from "./types";

export class CloudachError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CloudachError";
  }
}

export class APIConnectionError extends CloudachError {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "APIConnectionError";
  }
}

export class APIError extends CloudachError {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: APIErrorBody | null = null,
  ) {
    super(message);
    this.name = "APIError";
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string, body: APIErrorBody | null = null) {
    super(message, 401, body);
    this.name = "AuthenticationError";
  }
}

export class PermissionDeniedError extends APIError {
  constructor(message: string, body: APIErrorBody | null = null) {
    super(message, 403, body);
    this.name = "PermissionDeniedError";
  }
}

export class NotFoundError extends APIError {
  constructor(message: string, body: APIErrorBody | null = null) {
    super(message, 404, body);
    this.name = "NotFoundError";
  }
}

export class RateLimitError extends APIError {
  constructor(message: string, body: APIErrorBody | null = null) {
    super(message, 429, body);
    this.name = "RateLimitError";
  }
}

export function makeAPIError(status: number, body: APIErrorBody | null): APIError {
  const message = body?.error?.message ?? "Unknown API error";
  switch (status) {
    case 401:
      return new AuthenticationError(message, body);
    case 403:
      return new PermissionDeniedError(message, body);
    case 404:
      return new NotFoundError(message, body);
    case 429:
      return new RateLimitError(message, body);
    default:
      return new APIError(message, status, body);
  }
}
