"""Models resource — wraps /v1/models endpoints."""

from __future__ import annotations

from typing import TYPE_CHECKING

from ..types.model import Model, ModelList

if TYPE_CHECKING:
    from .._client import Cloudach


class ModelsResource:
    def __init__(self, client: "Cloudach") -> None:
        self._client = client

    def list(self) -> ModelList:
        """Return the list of available models.

        Returns:
            ModelList: Object containing a list of Model instances.
        """
        data = self._client._get("/v1/models")
        return ModelList.from_dict(data)

    def retrieve(self, model_id: str) -> Model:
        """Retrieve a single model by ID.

        Args:
            model_id: The model identifier (e.g. ``"llama3-8b"``).

        Returns:
            Model: The requested model object.
        """
        data = self._client._get(f"/v1/models/{model_id}")
        return Model.from_dict(data)
