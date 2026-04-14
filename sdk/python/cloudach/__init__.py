"""Cloudach Python SDK — official client for the Cloudach inference API."""

from ._client import Cloudach
from ._exceptions import (
    CloudachError,
    APIError,
    AuthenticationError,
    PermissionDeniedError,
    NotFoundError,
    RateLimitError,
    APIConnectionError,
)

__all__ = [
    "Cloudach",
    "CloudachError",
    "APIError",
    "AuthenticationError",
    "PermissionDeniedError",
    "NotFoundError",
    "RateLimitError",
    "APIConnectionError",
]

__version__ = "0.1.0"
