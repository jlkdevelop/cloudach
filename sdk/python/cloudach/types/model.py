"""Types for model responses."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass
class Model:
    id: str
    object: str
    created: int
    owned_by: str

    @classmethod
    def from_dict(cls, d: dict) -> "Model":
        return cls(
            id=d.get("id", ""),
            object=d.get("object", "model"),
            created=d.get("created", 0),
            owned_by=d.get("owned_by", ""),
        )


@dataclass
class ModelList:
    object: str
    data: List[Model]

    @classmethod
    def from_dict(cls, d: dict) -> "ModelList":
        return cls(
            object=d.get("object", "list"),
            data=[Model.from_dict(m) for m in d.get("data", [])],
        )
