'use strict';

const { InferenceBackend } = require('./InferenceBackend');
const { proxyToVllm } = require('../vllmProxy');

/**
 * LocalInferenceBackend — delegates to vLLM or the vllm-mock Docker service.
 *
 * The target URL is read from VLLM_BASE_URL (set in docker-compose).
 * In production (pre-AWS), this points to a real Ollama or vLLM container.
 * In local dev, it points to the vllm-mock Node server.
 */
class LocalInferenceBackend extends InferenceBackend {
  /**
   * @param {string} [baseUrl] - Override for the backend base URL (default: VLLM_BASE_URL env)
   */
  constructor(baseUrl) {
    super();
    this.baseUrl = baseUrl || process.env.VLLM_BASE_URL || 'http://vllm-mock:8000';
  }

  async chat(req, res, _model) {
    return proxyToVllm(req, res, '/v1/chat/completions', {}, this.baseUrl);
  }

  async completions(req, res, _model) {
    return proxyToVllm(req, res, '/v1/completions', {}, this.baseUrl);
  }

  async getModels() {
    // Fetch from the local vLLM/mock server
    const url = `${this.baseUrl}/v1/models`;
    try {
      const resp = await fetch(url);
      if (!resp.ok) return [];
      const data = await resp.json();
      return data.data || [];
    } catch {
      return [];
    }
  }

  get name() {
    return `local(${this.baseUrl})`;
  }
}

module.exports = { LocalInferenceBackend };
