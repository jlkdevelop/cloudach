'use strict';

/**
 * InferenceBackend — contract all backends must implement.
 *
 * Every backend handles proxying a request to the underlying model server
 * and returning usage metadata so the metering layer can record token counts.
 *
 * Subclasses override the abstract methods below.
 */
class InferenceBackend {
  /**
   * Handle POST /v1/chat/completions
   *
   * @param {import('express').Request}  req  - Express request (body already parsed)
   * @param {import('express').Response} res  - Express response
   * @param {string} model                    - Validated model id
   * @returns {Promise<{ usage: { prompt_tokens: number, completion_tokens: number } | null }>}
   */
  async chat(req, res, model) { // eslint-disable-line no-unused-vars
    throw new Error('InferenceBackend.chat() must be implemented by subclass');
  }

  /**
   * Handle POST /v1/completions
   *
   * @param {import('express').Request}  req
   * @param {import('express').Response} res
   * @param {string} model
   * @returns {Promise<{ usage: { prompt_tokens: number, completion_tokens: number } | null }>}
   */
  async completions(req, res, model) { // eslint-disable-line no-unused-vars
    throw new Error('InferenceBackend.completions() must be implemented by subclass');
  }

  /**
   * Return available models list (OpenAI /v1/models format).
   *
   * @returns {Promise<Array<{ id: string, object: string, created: number, owned_by: string }>>}
   */
  async getModels() {
    throw new Error('InferenceBackend.getModels() must be implemented by subclass');
  }

  /**
   * Human-readable name for this backend (used in logs/health endpoint).
   * @returns {string}
   */
  get name() {
    return this.constructor.name;
  }
}

module.exports = { InferenceBackend };
