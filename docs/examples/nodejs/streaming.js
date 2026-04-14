/**
 * Cloudach Node.js — Streaming Chat
 * Requires: npm install openai
 * Run: CLOUDACH_API_KEY=sk-cloudach-... node streaming.js
 */

import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.cloudach.com/v1",
  apiKey: process.env.CLOUDACH_API_KEY,
});

const stream = await client.chat.completions.create({
  model: "llama3-8b",
  messages: [{ role: "user", content: "Count from 1 to 10 slowly." }],
  stream: true,
});

for await (const chunk of stream) {
  const delta = chunk.choices[0]?.delta?.content;
  if (delta) process.stdout.write(delta);
}

process.stdout.write("\n");
