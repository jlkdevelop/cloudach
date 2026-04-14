'use strict';

const { InferenceBackend } = require('./InferenceBackend');
const { LocalInferenceBackend } = require('./LocalInferenceBackend');

/**
 * AwsInferenceBackend — routes requests to a GPU instance on AWS.
 *
 * Configuration (from environment):
 *   AWS_REGION          — e.g. "us-east-1"
 *   AWS_GPU_INSTANCE_ID — EC2 instance ID running vLLM (e.g. "i-0abc123def456")
 *   AWS_API_ENDPOINT    — Full HTTPS URL of the inference endpoint (e.g. "https://my-endpoint.example.com")
 *
 * If any of the required AWS env vars are absent this backend falls back to
 * the LocalInferenceBackend automatically, so the platform degrades gracefully
 * when AWS is not connected.
 *
 * TODO (when AWS is connected):
 *   1. Replace _callAws() with real SigV4-signed requests to AWS_API_ENDPOINT
 *   2. Implement token-streaming by piping the SSE response from the EC2 endpoint
 *   3. Add CloudWatch metrics emission on each request (latency, token counts)
 *   4. Add circuit breaker: on 3 consecutive 502s, flip to localFallback for 60s
 */
class AwsInferenceBackend extends InferenceBackend {
  constructor() {
    super();

    this.region   = process.env.AWS_REGION;
    this.instanceId = process.env.AWS_GPU_INSTANCE_ID;
    this.endpoint = process.env.AWS_API_ENDPOINT;

    this._isConfigured = !!(this.region && this.endpoint);

    if (!this._isConfigured) {
      // Fall back to local backend — no AWS env vars set
      this._local = new LocalInferenceBackend();
    }
  }

  async chat(req, res, model) {
    if (!this._isConfigured) return this._local.chat(req, res, model);

    // TODO: replace stub with real AWS inference call
    // Steps:
    //   1. Sign request with AWS SigV4 using AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY
    //   2. POST to `${this.endpoint}/v1/chat/completions` with req.body
    //   3. Stream the SSE response back to `res` (same format as LocalInferenceBackend)
    //   4. Parse final usage chunk and return { usage }
    res.status(503).json({
      error: {
        message: 'AWS inference backend is not yet connected. Set INFERENCE_BACKEND=local to use the local backend.',
        type: 'api_error',
      },
    });
    return { usage: null };
  }

  async completions(req, res, model) {
    if (!this._isConfigured) return this._local.completions(req, res, model);

    // TODO: mirror same AWS call as chat() but to /v1/completions
    res.status(503).json({
      error: {
        message: 'AWS inference backend is not yet connected.',
        type: 'api_error',
      },
    });
    return { usage: null };
  }

  async getModels() {
    if (!this._isConfigured) return this._local.getModels();

    // TODO: call `${this.endpoint}/v1/models` with SigV4 auth
    // For now return a known static model list (same as mock)
    return [
      { id: 'llama3-8b',  object: 'model', created: 1712000000, owned_by: 'cloudach' },
      { id: 'llama3-70b', object: 'model', created: 1712000000, owned_by: 'cloudach' },
    ];
  }

  get name() {
    if (!this._isConfigured) return `aws(fallback→local)`;
    return `aws(${this.region}/${this.instanceId || 'endpoint'})`;
  }
}

module.exports = { AwsInferenceBackend };
