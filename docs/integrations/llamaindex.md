# LlamaIndex Integration

Use Cloudach as the LLM backend for LlamaIndex (formerly GPT Index). Because Cloudach is OpenAI-compatible, you can use the `OpenAI` LLM class from `llama-index-llms-openai` by pointing `api_base` at `https://api.cloudach.com/v1` and supplying your Cloudach API key.

---

## Install

```bash
pip install llama-index llama-index-llms-openai
```

---

## Environment setup

```bash
export CLOUDACH_API_KEY="sk-cloudach-YOUR_KEY"
```

---

## Basic completion

```python
from llama_index.llms.openai import OpenAI

llm = OpenAI(
    model="llama3-70b",
    api_key="sk-cloudach-YOUR_KEY",
    api_base="https://api.cloudach.com/v1",
    temperature=0.7,
)

response = llm.complete("The first programming language was")
print(response.text)
# Output: " Fortran, developed in the 1950s by IBM."
```

---

## Chat messages

```python
from llama_index.llms.openai import OpenAI
from llama_index.core.llms import ChatMessage, MessageRole

llm = OpenAI(
    model="llama3-70b",
    api_key="sk-cloudach-YOUR_KEY",
    api_base="https://api.cloudach.com/v1",
)

messages = [
    ChatMessage(role=MessageRole.SYSTEM, content="You are a helpful assistant."),
    ChatMessage(role=MessageRole.USER, content="What is retrieval-augmented generation?"),
]

response = llm.chat(messages)
print(response.message.content)
```

---

## Streaming

```python
from llama_index.llms.openai import OpenAI

llm = OpenAI(
    model="llama3-70b",
    api_key="sk-cloudach-YOUR_KEY",
    api_base="https://api.cloudach.com/v1",
)

stream = llm.stream_complete("Explain vector databases in plain English:")
for chunk in stream:
    print(chunk.delta, end="", flush=True)
print()
```

---

## Use as the global default LLM

Set Cloudach as the default LLM for all LlamaIndex operations in your session:

```python
from llama_index.core import Settings
from llama_index.llms.openai import OpenAI

Settings.llm = OpenAI(
    model="llama3-70b",
    api_key="sk-cloudach-YOUR_KEY",
    api_base="https://api.cloudach.com/v1",
    temperature=0.1,  # lower temperature = more deterministic for RAG
)
```

---

## Query engine with a document index

Build a simple RAG pipeline backed by Cloudach:

```python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings
from llama_index.llms.openai import OpenAI
from llama_index.embeddings.openai import OpenAIEmbedding

# Point both LLM and embedder at Cloudach
# Note: use an embedding model your Cloudach plan supports,
# or swap in a local embedder (e.g. llama-index-embeddings-huggingface)
Settings.llm = OpenAI(
    model="llama3-70b",
    api_key="sk-cloudach-YOUR_KEY",
    api_base="https://api.cloudach.com/v1",
    temperature=0.1,
)

# If Cloudach does not yet expose an embeddings endpoint,
# use a local HuggingFace embedder instead:
#   pip install llama-index-embeddings-huggingface
#   from llama_index.embeddings.huggingface import HuggingFaceEmbedding
#   Settings.embed_model = HuggingFaceEmbedding(model_name="BAAI/bge-small-en-v1.5")

# Load documents from a local folder
documents = SimpleDirectoryReader("./data").load_data()

# Build the index
index = VectorStoreIndex.from_documents(documents)

# Query
query_engine = index.as_query_engine()
response = query_engine.query("What are the main topics covered in these documents?")
print(response)
```

---

## Complete working script

Save as `cloudach_llamaindex.py` and run with `python cloudach_llamaindex.py`.

```python
#!/usr/bin/env python3
"""Cloudach + LlamaIndex integration example (no local files required).

Install:
    pip install llama-index llama-index-llms-openai

Run:
    CLOUDACH_API_KEY=sk-cloudach-YOUR_KEY python cloudach_llamaindex.py
"""
import os
from llama_index.core import Settings
from llama_index.llms.openai import OpenAI
from llama_index.core.llms import ChatMessage, MessageRole

# ── Configure ──────────────────────────────────────────────────────────────
llm = OpenAI(
    model="llama3-70b",
    api_key=os.environ["CLOUDACH_API_KEY"],
    api_base="https://api.cloudach.com/v1",
    temperature=0.7,
)
Settings.llm = llm

# ── Completion ──────────────────────────────────────────────────────────────
print("=== Completion ===")
response = llm.complete("List three benefits of open-source LLMs:")
print(response.text)

# ── Chat ────────────────────────────────────────────────────────────────────
print("\n=== Chat ===")
messages = [
    ChatMessage(role=MessageRole.SYSTEM, content="You are a concise technical assistant."),
    ChatMessage(role=MessageRole.USER, content="What is the difference between RAG and fine-tuning?"),
]
chat_response = llm.chat(messages)
print(chat_response.message.content)

# ── Streaming completion ────────────────────────────────────────────────────
print("\n=== Streaming ===")
stream = llm.stream_complete("Explain embeddings in 2 sentences:")
for chunk in stream:
    print(chunk.delta, end="", flush=True)
print()
```

---

## Available models

| Model ID       | Context | Best for                              |
| -------------- | ------- | ------------------------------------- |
| `llama3-8b`    | 8K      | Fast responses, high-volume pipelines |
| `llama3-70b`   | 8K      | Complex reasoning, RAG synthesis      |
| `mistral-7b`   | 32K     | Long documents, large context windows |
| `mixtral-8x7b` | 32K     | Highest accuracy, complex tasks       |

---

## What's next

- [Quickstart](../quickstart.md) — API basics and first call
- [LangChain integration](./langchain.md) — use Cloudach in LangChain chains and agents
- [Rate limits](../rate-limits.md) — understand quotas and how to handle 429s
- [Models](../models.md) — full model list and context windows
