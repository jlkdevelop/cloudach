"""Chat completions resource — wraps POST /v1/chat/completions."""

from __future__ import annotations

import json
from typing import TYPE_CHECKING, Generator, Iterable, List, Optional, Union, overload

from ...types.chat_completion import (
    ChatCompletion,
    ChatCompletionChunk,
    ChatCompletionMessage,
)

if TYPE_CHECKING:
    from ..._client import Cloudach

# Type alias for message dicts
MessageParam = Union[dict, ChatCompletionMessage]


class CompletionsResource:
    def __init__(self, client: "Cloudach") -> None:
        self._client = client

    @overload
    def create(
        self,
        *,
        model: str,
        messages: List[MessageParam],
        stream: "Literal[False]" = ...,
        temperature: Optional[float] = ...,
        max_tokens: Optional[int] = ...,
        top_p: Optional[float] = ...,
        stop: Optional[Union[str, List[str]]] = ...,
    ) -> ChatCompletion: ...

    @overload
    def create(
        self,
        *,
        model: str,
        messages: List[MessageParam],
        stream: "Literal[True]",
        temperature: Optional[float] = ...,
        max_tokens: Optional[int] = ...,
        top_p: Optional[float] = ...,
        stop: Optional[Union[str, List[str]]] = ...,
    ) -> Generator[ChatCompletionChunk, None, None]: ...

    def create(
        self,
        *,
        model: str,
        messages: List[MessageParam],
        stream: bool = False,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        top_p: Optional[float] = None,
        stop: Optional[Union[str, List[str]]] = None,
        **kwargs,
    ) -> Union[ChatCompletion, Generator[ChatCompletionChunk, None, None]]:
        """Create a chat completion.

        Args:
            model: ID of the model to use (e.g. ``"llama3-8b"``).
            messages: List of message dicts with ``role`` and ``content`` keys,
                or :class:`ChatCompletionMessage` instances.
            stream: If ``True``, returns a generator that yields
                :class:`ChatCompletionChunk` objects as they arrive.
            temperature: Sampling temperature between 0 and 2.
            max_tokens: Maximum number of tokens to generate.
            top_p: Nucleus sampling probability mass.
            stop: Stop sequence(s) to halt generation.

        Returns:
            :class:`ChatCompletion` (non-streaming) or a generator of
            :class:`ChatCompletionChunk` (streaming).
        """
        body: dict = {"model": model, "messages": self._normalise_messages(messages)}
        if stream:
            body["stream"] = True
        if temperature is not None:
            body["temperature"] = temperature
        if max_tokens is not None:
            body["max_tokens"] = max_tokens
        if top_p is not None:
            body["top_p"] = top_p
        if stop is not None:
            body["stop"] = stop
        body.update(kwargs)

        if stream:
            return self._stream(body)
        data = self._client._post("/v1/chat/completions", body)
        return ChatCompletion.from_dict(data)

    def _normalise_messages(self, messages: List[MessageParam]) -> List[dict]:
        result = []
        for m in messages:
            if isinstance(m, ChatCompletionMessage):
                result.append({"role": m.role, "content": m.content})
            else:
                result.append(m)
        return result

    def _stream(self, body: dict) -> Generator[ChatCompletionChunk, None, None]:
        import httpx

        client = self._client
        url = client.base_url.rstrip("/") + "/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {client.api_key}",
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
        }

        with httpx.stream("POST", url, headers=headers, json=body, timeout=client.timeout) as resp:
            client._raise_for_status(resp)
            for line in resp.iter_lines():
                line = line.strip()
                if not line or line == "data: [DONE]":
                    continue
                if line.startswith("data: "):
                    payload = line[6:]
                    try:
                        chunk_data = json.loads(payload)
                    except json.JSONDecodeError:
                        continue
                    yield ChatCompletionChunk.from_dict(chunk_data)
