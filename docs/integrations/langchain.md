# LangChain Integration

Use Cloudach as a drop-in LLM backend in LangChain. Because Cloudach is OpenAI-compatible, you can use `ChatOpenAI` from `langchain-openai` with two configuration changes: point `openai_api_base` at `https://api.cloudach.com/v1` and supply your Cloudach API key.

---

## Install

```bash
pip install langchain langchain-openai
```

---

## Environment setup

```bash
export CLOUDACH_API_KEY="sk-cloudach-YOUR_KEY"
```

---

## Basic usage

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage

llm = ChatOpenAI(
    model="llama3-70b",
    openai_api_key="sk-cloudach-YOUR_KEY",
    openai_api_base="https://api.cloudach.com/v1",
    temperature=0.7,
)

messages = [
    SystemMessage(content="You are a helpful assistant."),
    HumanMessage(content="What is the capital of France?"),
]

response = llm.invoke(messages)
print(response.content)
# Output: "The capital of France is Paris."
```

---

## Using environment variables

If `OPENAI_API_KEY` and `OPENAI_API_BASE` are set, LangChain picks them up automatically. To avoid overwriting a real OpenAI key, pass them explicitly or use a custom env var:

```python
import os
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="llama3-8b",
    openai_api_key=os.environ["CLOUDACH_API_KEY"],
    openai_api_base="https://api.cloudach.com/v1",
)
```

---

## Streaming

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

llm = ChatOpenAI(
    model="llama3-70b",
    openai_api_key="sk-cloudach-YOUR_KEY",
    openai_api_base="https://api.cloudach.com/v1",
    streaming=True,
)

for chunk in llm.stream([HumanMessage(content="Write a haiku about open source software.")]):
    print(chunk.content, end="", flush=True)
print()
```

---

## LangChain Expression Language (LCEL)

Build a simple prompt-model-parser chain:

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

llm = ChatOpenAI(
    model="llama3-70b",
    openai_api_key="sk-cloudach-YOUR_KEY",
    openai_api_base="https://api.cloudach.com/v1",
)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a concise technical writer. Answer in 2–3 sentences."),
    ("human", "{question}"),
])

chain = prompt | llm | StrOutputParser()

answer = chain.invoke({"question": "What is retrieval-augmented generation?"})
print(answer)
```

---

## Streaming with LCEL

```python
for token in chain.stream({"question": "Explain LLM temperature in plain English."}):
    print(token, end="", flush=True)
print()
```

---

## Complete working script

Save as `cloudach_langchain.py` and run with `python cloudach_langchain.py`.

```python
#!/usr/bin/env python3
"""Cloudach + LangChain integration example.

Install:
    pip install langchain langchain-openai

Run:
    CLOUDACH_API_KEY=sk-cloudach-YOUR_KEY python cloudach_langchain.py
"""
import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# ── Configure ──────────────────────────────────────────────────────────────
llm = ChatOpenAI(
    model="llama3-70b",
    openai_api_key=os.environ["CLOUDACH_API_KEY"],
    openai_api_base="https://api.cloudach.com/v1",
    temperature=0.7,
    streaming=True,
)

# ── Build a chain ──────────────────────────────────────────────────────────
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant. Be concise and direct."),
    ("human", "{question}"),
])

chain = prompt | llm | StrOutputParser()

# ── Run it ──────────────────────────────────────────────────────────────────
def main():
    questions = [
        "What makes Llama 3 different from GPT-4?",
        "Give me a Python one-liner to flatten a list of lists.",
        "Explain tokens in 30 words.",
    ]

    for q in questions:
        print(f"\nQ: {q}\nA: ", end="", flush=True)
        for token in chain.stream({"question": q}):
            print(token, end="", flush=True)
        print()

if __name__ == "__main__":
    main()
```

---

## Available models

| Model ID       | Context | Best for                              |
| -------------- | ------- | ------------------------------------- |
| `llama3-8b`    | 8K      | Fast responses, high-volume pipelines |
| `llama3-70b`   | 8K      | Complex reasoning, nuanced answers    |
| `mistral-7b`   | 32K     | Long documents, code generation       |
| `mixtral-8x7b` | 32K     | Highest accuracy, complex tasks       |

---

## What's next

- [Quickstart](../quickstart.md) — API basics and first call
- [LlamaIndex integration](./llamaindex.md) — use Cloudach as an index LLM backend
- [Rate limits](../rate-limits.md) — understand quotas and how to handle 429s
- [Models](../models.md) — full model list and context windows
