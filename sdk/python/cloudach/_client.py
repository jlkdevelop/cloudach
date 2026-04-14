"""Cloudach API client."""

from __future__ import annotations

import os
from typing import Any, Dict, Optional

import httpx

from ._exceptions import (
    APIConnectionError,
    APIError,
    AuthenticationError,
    NotFoundError,
    PermissionDeniedError,
    RateLimitError,
)
from .resources.chat import ChatResource
from .resources.models import ModelsResource

DEFAULT_BASE_URL = "https://api.cloudach.com"
DEFAULT_TIMEOUT = 60.0


class Cloudach:
    """Synchronous Cloudach API client.

    Args:
        api_key: Your ``sk-cloudach-*`` API key. Falls back to the
            ``CLOUDACH_API_KEY`` environment variable.
        base_url: Override the API base URL (useful for local testing).
        timeout: HTTP timeout in seconds (default: 60).

    Example::

        from cloudach import Cloudach

        client = Cloudach(api_key="sk-cloudach-...")
        response = client.chat.completions.create(
            model="llama3-8b",
            messages=[{"role": "user", "content": "Hello!"}],
        )
        print(response.choices[0].message.content)
    """

    def __init__(
        self,
        *,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: float = DEFAULT_TIMEOUT,
    ) -> None:
        resolved_key = api_key or os.environ.get("CLOUDACH_API_KEY")
        if not resolved_key:
            raise ValueError(
                "No API key provided. Pass api_key=... or set the CLOUDACH_API_KEY "
                "environment variable."
            )
        self.api_key: str = resolved_key
        self.base_url: str = (base_url or os.environ.get("CLOUDACH_BASE_URL") or DEFAULT_BASE_URL).rstrip("/")
        self.timeout: float = timeout

        # Resource namespaces — mirrors the OpenAI client layout
        self.chat = ChatResource(self)
        self.models = ModelsResource(self)

    # ------------------------------------------------------------------
    # Internal HTTP helpers
    # ------------------------------------------------------------------

    @property
    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

    def _get(self, path: str) -> Any:
        url = self.base_url + path
        try:
            resp = httpx.get(url, headers=self._headers, timeout=self.timeout)
        except httpx.RequestError as exc:
            raise APIConnectionError(f"Connection error: {exc}") from exc
        self._raise_for_status(resp)
        return resp.json()

    def _post(self, path: str, body: dict) -> Any:
        url = self.base_url + path
        try:
            resp = httpx.post(url, headers=self._headers, json=body, timeout=self.timeout)
        except httpx.RequestError as exc:
            raise APIConnectionError(f"Connection error: {exc}") from exc
        self._raise_for_status(resp)
        return resp.json()

    @staticmethod
    def _raise_for_status(resp: httpx.Response) -> None:
        if resp.status_code < 400:
            return
        try:
            body = resp.json()
            message = body.get("error", {}).get("message", resp.text)
        except Exception:
            body = None
            message = resp.text

        status = resp.status_code
        if status == 401:
            raise AuthenticationError(message, status_code=status, body=body)
        if status == 403:
            raise PermissionDeniedError(message, status_code=status, body=body)
        if status == 404:
            raise NotFoundError(message, status_code=status, body=body)
        if status == 429:
            raise RateLimitError(message, status_code=status, body=body)
        raise APIError(message, status_code=status, body=body)
