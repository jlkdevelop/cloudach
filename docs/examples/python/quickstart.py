"""
Cloudach Python Quickstart
Requires: pip install openai
"""

import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.cloudach.com/v1",
    api_key=os.environ["CLOUDACH_API_KEY"],
)

# --- Chat completions ---
response = client.chat.completions.create(
    model="llama3-8b",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "What is the capital of France?"},
    ],
)

print(response.choices[0].message.content)
# → "The capital of France is Paris."
print(f"Tokens used: {response.usage.total_tokens}")
