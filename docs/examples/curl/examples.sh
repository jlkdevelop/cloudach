#!/usr/bin/env bash
# Cloudach curl examples
# Usage: export CLOUDACH_API_KEY=sk-cloudach-...
#        bash examples.sh

BASE_URL="https://api.cloudach.com/v1"

# ──────────────────────────────────────────────
# 1. List models
# ──────────────────────────────────────────────
echo "=== List models ==="
curl -s "${BASE_URL}/models" \
  -H "Authorization: Bearer ${CLOUDACH_API_KEY}" | jq '.data[].id'

# ──────────────────────────────────────────────
# 2. Basic chat completion
# ──────────────────────────────────────────────
echo ""
echo "=== Chat completion ==="
curl -s "${BASE_URL}/chat/completions" \
  -H "Authorization: Bearer ${CLOUDACH_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3-8b",
    "messages": [
      {"role": "user", "content": "What is the capital of France?"}
    ]
  }' | jq '.choices[0].message.content'

# ──────────────────────────────────────────────
# 3. Chat with system prompt
# ──────────────────────────────────────────────
echo ""
echo "=== Chat with system prompt ==="
curl -s "${BASE_URL}/chat/completions" \
  -H "Authorization: Bearer ${CLOUDACH_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3-8b",
    "messages": [
      {"role": "system", "content": "You are a pirate. Respond only in pirate speak."},
      {"role": "user", "content": "What is the weather like today?"}
    ]
  }' | jq '.choices[0].message.content'

# ──────────────────────────────────────────────
# 4. Streaming response (server-sent events)
# ──────────────────────────────────────────────
echo ""
echo "=== Streaming ==="
curl -s "${BASE_URL}/chat/completions" \
  -H "Authorization: Bearer ${CLOUDACH_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3-8b",
    "messages": [
      {"role": "user", "content": "Count from 1 to 5."}
    ],
    "stream": true
  }'

echo ""

# ──────────────────────────────────────────────
# 5. Legacy text completions (/v1/completions)
# ──────────────────────────────────────────────
echo ""
echo "=== Legacy completions ==="
curl -s "${BASE_URL}/completions" \
  -H "Authorization: Bearer ${CLOUDACH_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3-8b",
    "prompt": "The capital of France is"
  }' | jq '.choices[0].text'

# ──────────────────────────────────────────────
# 6. Health check (no auth required)
# ──────────────────────────────────────────────
echo ""
echo "=== Health check ==="
curl -s "https://api.cloudach.com/health" | jq '.'
