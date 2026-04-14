import { requireAuth } from '../../../lib/auth';
import { getDb } from '../../../lib/db';

export const config = {
  api: {
    bodyParser: true,
    externalResolver: true,
  },
};

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { model, messages, systemPrompt, temperature, maxTokens, topP, stopSequences } = req.body || {};

  if (!model) return res.status(400).json({ error: 'model is required' });
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages must be a non-empty array' });
  }

  const db = getDb();
  const userId = req.session.sub;

  // Verify model exists in catalog
  const catalogResult = await db.query(
    'SELECT model_id, display_name FROM model_catalog WHERE model_id = $1',
    [model]
  );
  if (!catalogResult.rows.length) {
    return res.status(404).json({ error: 'Model not found in catalog' });
  }

  // Set up SSE streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  const inferenceUrl = process.env.CLOUDACH_INFERENCE_URL || 'https://api.cloudach.com/v1';
  const serviceKey = process.env.CLOUDACH_SERVICE_KEY;

  // Build messages array
  const chatMessages = [];
  if (systemPrompt && systemPrompt.trim()) {
    chatMessages.push({ role: 'system', content: systemPrompt.trim() });
  }
  chatMessages.push(...messages);

  const requestBody = {
    model,
    messages: chatMessages,
    stream: true,
    temperature: temperature ?? 0.7,
    max_tokens: maxTokens ?? 1024,
    top_p: topP ?? 1,
    stream_options: { include_usage: true },
  };
  if (Array.isArray(stopSequences) && stopSequences.filter(Boolean).length) {
    requestBody.stop = stopSequences.filter(Boolean);
  }

  const startTime = Date.now();

  try {
    if (serviceKey) {
      // Real upstream API call
      let upstream;
      try {
        upstream = await fetch(`${inferenceUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify(requestBody),
        });
      } catch {
        res.write(`data: ${JSON.stringify({ error: 'Could not reach inference endpoint.' })}\n\n`);
        res.end();
        return;
      }

      if (!upstream.ok) {
        const errText = await upstream.text().catch(() => '');
        res.write(`data: ${JSON.stringify({ error: `Inference API error (${upstream.status}): ${errText.slice(0, 200)}` })}\n\n`);
        res.end();
        return;
      }

      // Stream chunks through
      let promptTokens = 0;
      let completionTokens = 0;
      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete last line

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data:')) continue;
          const data = trimmed.slice(5).trim();
          if (data === '[DONE]') {
            res.write(`data: [DONE]\n\n`);
          } else {
            try {
              const parsed = JSON.parse(data);
              if (parsed.usage) {
                promptTokens = parsed.usage.prompt_tokens ?? 0;
                completionTokens = parsed.usage.completion_tokens ?? 0;
              }
              res.write(`data: ${data}\n\n`);
            } catch {
              // skip malformed chunk
            }
          }
        }
      }

      // Log usage (fire-and-forget)
      const latencyMs = Date.now() - startTime;
      db.query(
        `INSERT INTO usage_logs
           (user_id, api_key_id, model, prompt_tokens, completion_tokens, total_tokens, latency_ms, status_code)
         VALUES ($1, NULL, $2, $3, $4, $5, $6, 200)`,
        [userId, model, promptTokens, completionTokens, promptTokens + completionTokens, latencyMs]
      ).catch(() => {});
    } else {
      // Demo mode — simulate streaming
      await simulateStream(res, model, chatMessages);

      // Log simulated usage
      const latencyMs = Date.now() - startTime;
      db.query(
        `INSERT INTO usage_logs
           (user_id, api_key_id, model, prompt_tokens, completion_tokens, total_tokens, latency_ms, status_code)
         VALUES ($1, NULL, $2, $3, $4, $5, $6, 200)`,
        [userId, model, 48, 120, 168, latencyMs]
      ).catch(() => {});
    }
  } catch (err) {
    console.error('[playground] stream error:', err);
    try {
      res.write(`data: ${JSON.stringify({ error: 'Streaming error. Please try again.' })}\n\n`);
    } catch {
      // response already closed
    }
  }

  res.end();
});

async function simulateStream(res, model, messages) {
  const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  const responseText = buildDemoResponse(model, lastUserMsg);
  const words = responseText.split(' ');
  const id = `chatcmpl-playground-${Date.now()}`;

  for (let i = 0; i < words.length; i++) {
    const content = i === 0 ? words[i] : ' ' + words[i];
    const isLast = i === words.length - 1;
    const chunk = {
      id,
      object: 'chat.completion.chunk',
      model,
      choices: [{
        index: 0,
        delta: { content },
        finish_reason: isLast ? 'stop' : null,
      }],
    };
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    await sleep(40 + Math.random() * 25);
  }

  // Final chunk with usage
  const usageChunk = {
    id,
    object: 'chat.completion.chunk',
    model,
    choices: [{ index: 0, delta: {}, finish_reason: 'stop' }],
    usage: { prompt_tokens: 48, completion_tokens: words.length, total_tokens: 48 + words.length },
  };
  res.write(`data: ${JSON.stringify(usageChunk)}\n\n`);
  res.write(`data: [DONE]\n\n`);
}

function buildDemoResponse(model, userMessage) {
  const preview = userMessage.length > 80 ? userMessage.slice(0, 80) + '…' : userMessage;
  return (
    `I'm running on the ${model} model via Cloudach. You said: "${preview}". ` +
    `This is a live demo of the API Playground — responses are streamed token-by-token just like production. ` +
    `You can adjust temperature to control creativity, max tokens to set an output ceiling, and top-p for nucleus sampling. ` +
    `Try the "Copy as code" button to generate a ready-to-use curl, Python, or Node.js snippet for this exact request. ` +
    `When you're ready to integrate, grab an API key from the API Keys page and point your application at https://api.cloudach.com/v1.`
  );
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
