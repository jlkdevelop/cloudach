"""Types for chat completion responses."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class CompletionUsage:
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

    @classmethod
    def from_dict(cls, d: dict) -> "CompletionUsage":
        return cls(
            prompt_tokens=d.get("prompt_tokens", 0),
            completion_tokens=d.get("completion_tokens", 0),
            total_tokens=d.get("total_tokens", 0),
        )


@dataclass
class ChatCompletionMessage:
    role: str
    content: str

    @classmethod
    def from_dict(cls, d: dict) -> "ChatCompletionMessage":
        return cls(role=d.get("role", ""), content=d.get("content", ""))


@dataclass
class ChatCompletionChoice:
    index: int
    message: ChatCompletionMessage
    finish_reason: Optional[str]

    @classmethod
    def from_dict(cls, d: dict) -> "ChatCompletionChoice":
        return cls(
            index=d.get("index", 0),
            message=ChatCompletionMessage.from_dict(d.get("message", {})),
            finish_reason=d.get("finish_reason"),
        )


@dataclass
class ChatCompletion:
    id: str
    object: str
    created: int
    model: str
    choices: List[ChatCompletionChoice]
    usage: Optional[CompletionUsage]

    @classmethod
    def from_dict(cls, d: dict) -> "ChatCompletion":
        return cls(
            id=d.get("id", ""),
            object=d.get("object", "chat.completion"),
            created=d.get("created", 0),
            model=d.get("model", ""),
            choices=[ChatCompletionChoice.from_dict(c) for c in d.get("choices", [])],
            usage=CompletionUsage.from_dict(d["usage"]) if d.get("usage") else None,
        )


@dataclass
class ChatCompletionDelta:
    role: Optional[str]
    content: Optional[str]

    @classmethod
    def from_dict(cls, d: dict) -> "ChatCompletionDelta":
        return cls(role=d.get("role"), content=d.get("content"))


@dataclass
class ChatCompletionChunkChoice:
    index: int
    delta: ChatCompletionDelta
    finish_reason: Optional[str]

    @classmethod
    def from_dict(cls, d: dict) -> "ChatCompletionChunkChoice":
        return cls(
            index=d.get("index", 0),
            delta=ChatCompletionDelta.from_dict(d.get("delta", {})),
            finish_reason=d.get("finish_reason"),
        )


@dataclass
class ChatCompletionChunk:
    id: str
    object: str
    created: int
    model: str
    choices: List[ChatCompletionChunkChoice]

    @classmethod
    def from_dict(cls, d: dict) -> "ChatCompletionChunk":
        return cls(
            id=d.get("id", ""),
            object=d.get("object", "chat.completion.chunk"),
            created=d.get("created", 0),
            model=d.get("model", ""),
            choices=[ChatCompletionChunkChoice.from_dict(c) for c in d.get("choices", [])],
        )
