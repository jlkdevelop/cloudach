"""
Cloudach Python — List available models
Requires: pip install openai
"""

import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.cloudach.com/v1",
    api_key=os.environ["CLOUDACH_API_KEY"],
)

models = client.models.list()
for model in models.data:
    print(f"{model.id}  (owned by: {model.owned_by})")
