'use strict';

const http = require('http');
const https = require('https');

const DEFAULT_BASE_URL = process.env.VLLM_BASE_URL || 'http://vllm-mock:8000';

/**
 * Forward a request body to a vLLM-compatible backend and pipe the response back.
 *
 * Handles both streaming (SSE) and non-streaming JSON responses.
 * Returns a Promise that resolves to { usage } so callers can track tokens.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {string} vllmPath    - e.g. '/v1/chat/completions'
 * @param {object} [bodyOverrides] - extra fields merged into the request body
 * @param {string} [baseUrl]   - override the backend base URL (defaults to VLLM_BASE_URL env)
 */
function proxyToVllm(req, res, vllmPath, bodyOverrides = {}, baseUrl = DEFAULT_BASE_URL) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(baseUrl);
    const isHttps = parsed.protocol === 'https:';
    const transport = isHttps ? https : http;

    const body = JSON.stringify({ ...req.body, ...bodyOverrides });

    const options = {
      hostname: parsed.hostname,
      port: parsed.port || (isHttps ? 443 : 80),
      path: vllmPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        Accept: req.body?.stream ? 'text/event-stream' : 'application/json',
      },
    };

    const upstream = transport.request(options, (upstreamRes) => {
      // Copy status + headers
      res.status(upstreamRes.statusCode);
      for (const [k, v] of Object.entries(upstreamRes.headers)) {
        // Skip hop-by-hop headers
        if (['connection', 'keep-alive', 'transfer-encoding'].includes(k.toLowerCase())) continue;
        res.set(k, v);
      }

      if (req.body?.stream) {
        // Streaming: pipe SSE directly to client, capture usage from the final chunk
        let usage = null;
        let buffer = '';

        upstreamRes.on('data', (chunk) => {
          buffer += chunk.toString();
          // Flush each SSE event as it arrives
          const lines = buffer.split('\n');
          buffer = lines.pop(); // keep incomplete last line
          for (const line of lines) {
            res.write(line + '\n');
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.usage) usage = data.usage;
              } catch (_) {}
            }
          }
        });

        upstreamRes.on('end', () => {
          if (buffer) res.write(buffer);
          res.end();
          resolve({ usage });
        });

        upstreamRes.on('error', reject);
      } else {
        // Non-streaming: buffer full response then forward
        const chunks = [];
        upstreamRes.on('data', (c) => chunks.push(c));
        upstreamRes.on('end', () => {
          const raw = Buffer.concat(chunks);
          res.send(raw);
          let usage = null;
          try {
            const parsed2 = JSON.parse(raw.toString());
            usage = parsed2.usage ?? null;
          } catch (_) {}
          resolve({ usage });
        });
        upstreamRes.on('error', reject);
      }
    });

    upstream.on('error', (err) => {
      if (!res.headersSent) {
        res.status(502).json({ error: { message: 'Upstream model server unavailable.', type: 'api_error' } });
      }
      reject(err);
    });

    upstream.write(body);
    upstream.end();
  });
}

module.exports = { proxyToVllm };
