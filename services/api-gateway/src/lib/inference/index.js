'use strict';

const { LocalInferenceBackend } = require('./LocalInferenceBackend');
const { AwsInferenceBackend }   = require('./AwsInferenceBackend');

/**
 * getBackend() — factory that reads INFERENCE_BACKEND env var and returns
 * the appropriate InferenceBackend instance.
 *
 * INFERENCE_BACKEND=local  → LocalInferenceBackend (vLLM/Ollama/mock)
 * INFERENCE_BACKEND=aws    → AwsInferenceBackend (auto-falls-back to local if AWS vars absent)
 * (unset)                  → LocalInferenceBackend (safe default)
 *
 * The instance is a singleton — created once at startup, reused for all requests.
 */
let _instance = null;

function getBackend() {
  if (_instance) return _instance;

  const mode = (process.env.INFERENCE_BACKEND || 'local').toLowerCase();

  if (mode === 'aws') {
    _instance = new AwsInferenceBackend();
  } else {
    _instance = new LocalInferenceBackend();
  }

  return _instance;
}

/** Reset singleton — only needed in tests */
function _resetBackend() {
  _instance = null;
}

module.exports = { getBackend, _resetBackend, LocalInferenceBackend, AwsInferenceBackend };
