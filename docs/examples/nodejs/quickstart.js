/**
 * Cloudach Node.js Quickstart
 * Requires: npm install openai
 * Run: CLOUDACH_API_KEY=sk-cloudach-... node quickstart.js
 */

import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.cloudach.com/v1",
  apiKey: process.env.CLOUDACH_API_KEY,
});

const response = await client.chat.completions.create({
  model: "llama3-8b",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "What is the capital of France?" },
  ],
});

console.log(response.choices[0].message.content);
// → "The capital of France is Paris."
console.log(`Tokens used: ${response.usage.total_tokens}`);
