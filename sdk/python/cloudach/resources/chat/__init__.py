"""Chat resource namespace."""

from .completions import CompletionsResource


class ChatResource:
    def __init__(self, client) -> None:
        self.completions = CompletionsResource(client)


__all__ = ["ChatResource", "CompletionsResource"]
