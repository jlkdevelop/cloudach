"""
Cloudach Python — Streaming Chat
Requires: pip install openai
"""

import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.cloudach.com/v1",
    api_key=os.environ["CLOUDACH_API_KEY"],
)

stream = client.chat.completions.create(
    model="llama3-8b",
    messages=[{"role": "user", "content": "Count from 1 to 10 slowly."}],
    stream=True,
)

for chunk in stream:
    delta = chunk.choices[0].delta.content
    if delta:
        print(delta, end="", flush=True)

print()  # newline after stream ends
