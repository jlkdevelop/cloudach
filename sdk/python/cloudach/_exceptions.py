"""Cloudach SDK exception hierarchy."""

from __future__ import annotations

from typing import Any


class CloudachError(Exception):
    """Base exception for all Cloudach SDK errors."""


class APIConnectionError(CloudachError):
    """Raised when the SDK cannot reach the API."""

    def __init__(self, message: str, *, request: Any = None) -> None:
        super().__init__(message)
        self.request = request


class APIError(CloudachError):
    """Raised when the API returns a non-2xx response."""

    def __init__(self, message: str, *, status_code: int, body: Any = None) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.body = body

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(status_code={self.status_code}, message={str(self)!r})"


class AuthenticationError(APIError):
    """Raised on 401 responses — invalid or missing API key."""


class PermissionDeniedError(APIError):
    """Raised on 403 responses — API key lacks permission for the requested resource."""


class NotFoundError(APIError):
    """Raised on 404 responses."""


class RateLimitError(APIError):
    """Raised on 429 responses."""
