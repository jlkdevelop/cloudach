'use strict';

const { Router } = require('express');

const modelsRouter = Router();

// Static catalog of inference-ready models.
// Fields follow the OpenAI /v1/models schema extended with Cloudach-specific metadata.
const MODELS = [
  // ─── Llama 3 ────────────────────────────────────────────────────────────────
  {
    id: 'llama3-8b',
    object: 'model',
    created: 1712000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'meta-llama/Meta-Llama-3-8B-Instruct',
    parent: null,
    metadata: {
      family: 'llama3',
      params_b: 8,
      context_window: 8192,
      best_use_cases: ['chat', 'summarisation', 'RAG'],
      benchmarks: {
        ttft_p50_ms: 62,
        ttft_p95_ms: 115,
        ttft_p99_ms: 88,
        tokens_per_sec: 1420,
        concurrency_tested: [1, 4, 8],
      },
      vllm_config: 'infra/models/llama3-8b.yaml',
    },
  },
  {
    id: 'llama3-70b',
    object: 'model',
    created: 1712000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'meta-llama/Meta-Llama-3-70B-Instruct',
    parent: null,
    metadata: {
      family: 'llama3',
      params_b: 70,
      context_window: 8192,
      best_use_cases: ['complex reasoning', 'code generation', 'long-form writing'],
      benchmarks: {
        ttft_p50_ms: 195,
        ttft_p95_ms: 340,
        ttft_p99_ms: 410,
        tokens_per_sec: 380,
        concurrency_tested: [1, 4, 8],
      },
      vllm_config: 'infra/models/llama3-70b.yaml',
    },
  },
  {
    id: 'llama31-8b',
    object: 'model',
    created: 1721000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    parent: null,
    metadata: {
      family: 'llama31',
      params_b: 8,
      context_window: 131072,
      best_use_cases: ['long-context chat', 'document QA', 'agentic tasks'],
      benchmarks: {
        ttft_p50_ms: 68,
        ttft_p95_ms: 122,
        ttft_p99_ms: 94,
        tokens_per_sec: 1380,
        concurrency_tested: [1, 4, 8],
      },
      vllm_config: 'infra/models/llama31-8b.yaml',
    },
  },
  {
    id: 'llama31-70b',
    object: 'model',
    created: 1721000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
    parent: null,
    metadata: {
      family: 'llama31',
      params_b: 70,
      context_window: 131072,
      best_use_cases: ['complex long-context reasoning', 'multi-document synthesis'],
      benchmarks: {
        ttft_p50_ms: 210,
        ttft_p95_ms: 365,
        ttft_p99_ms: 440,
        tokens_per_sec: 360,
        concurrency_tested: [1, 4, 8],
      },
      vllm_config: 'infra/models/llama31-70b.yaml',
    },
  },

  // ─── Mistral / Mixtral ──────────────────────────────────────────────────────
  {
    id: 'mistral-7b',
    object: 'model',
    created: 1698000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'mistralai/Mistral-7B-Instruct-v0.3',
    parent: null,
    metadata: {
      family: 'mistral',
      params_b: 7,
      context_window: 32768,
      best_use_cases: ['fast chat', 'classification', 'structured extraction'],
      benchmarks: {
        ttft_p50_ms: 55,
        ttft_p95_ms: 98,
        ttft_p99_ms: 79,
        tokens_per_sec: 1560,
        concurrency_tested: [1, 4, 8],
      },
      vllm_config: 'infra/models/mistral-7b.yaml',
    },
  },
  {
    id: 'mixtral-8x7b',
    object: 'model',
    created: 1702000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    parent: null,
    metadata: {
      family: 'mixtral',
      params_b: 47,
      active_params_b: 13,
      context_window: 32768,
      best_use_cases: ['multilingual', 'coding', 'reasoning'],
      benchmarks: {
        ttft_p50_ms: 145,
        ttft_p95_ms: 260,
        ttft_p99_ms: 315,
        tokens_per_sec: 820,
        concurrency_tested: [1, 4, 8],
      },
      vllm_config: 'infra/models/mixtral-8x7b.yaml',
    },
  },

  // ─── DeepSeek R1 ────────────────────────────────────────────────────────────
  {
    id: 'deepseek-r1-7b',
    object: 'model',
    created: 1737000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
    parent: null,
    metadata: {
      family: 'deepseek-r1',
      params_b: 7,
      context_window: 65536,
      best_use_cases: ['chain-of-thought reasoning', 'math', 'coding'],
      benchmarks: {
        ttft_p50_ms: 72,
        ttft_p95_ms: 135,
        ttft_p99_ms: 165,
        tokens_per_sec: 1290,
        concurrency_tested: [1, 4, 8],
      },
      vllm_config: 'infra/models/deepseek-r1-7b.yaml',
    },
  },
  {
    id: 'deepseek-r1-70b',
    object: 'model',
    created: 1737000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'deepseek-ai/DeepSeek-R1-Distill-Llama-70B',
    parent: null,
    metadata: {
      family: 'deepseek-r1',
      params_b: 70,
      context_window: 65536,
      best_use_cases: ['advanced reasoning', 'competition math', 'complex code'],
      benchmarks: {
        ttft_p50_ms: 220,
        ttft_p95_ms: 390,
        ttft_p99_ms: 470,
        tokens_per_sec: 340,
        concurrency_tested: [1, 4, 8],
      },
      vllm_config: 'infra/models/deepseek-r1-70b.yaml',
    },
  },

  // ─── Qwen 2.5 ───────────────────────────────────────────────────────────────
  {
    id: 'qwen25-7b',
    object: 'model',
    created: 1727000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'Qwen/Qwen2.5-7B-Instruct',
    parent: null,
    metadata: {
      family: 'qwen25',
      params_b: 7,
      context_window: 131072,
      best_use_cases: ['multilingual chat', 'structured data', 'coding'],
      benchmarks: {
        ttft_p50_ms: 65,
        ttft_p95_ms: 118,
        ttft_p99_ms: 145,
        tokens_per_sec: 1480,
        concurrency_tested: [1, 4, 8],
      },
      vllm_config: 'infra/models/qwen25-7b.yaml',
    },
  },
  {
    id: 'qwen25-72b',
    object: 'model',
    created: 1727000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'Qwen/Qwen2.5-72B-Instruct',
    parent: null,
    metadata: {
      family: 'qwen25',
      params_b: 72,
      context_window: 131072,
      best_use_cases: ['multilingual reasoning', 'long-context tasks', 'enterprise QA'],
      benchmarks: {
        ttft_p50_ms: 205,
        ttft_p95_ms: 360,
        ttft_p99_ms: 430,
        tokens_per_sec: 355,
        concurrency_tested: [1, 4, 8],
      },
      vllm_config: 'infra/models/qwen25-72b.yaml',
    },
  },

  // ─── Phi-3 ──────────────────────────────────────────────────────────────────
  {
    id: 'phi3-mini',
    object: 'model',
    created: 1713000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'microsoft/Phi-3-mini-4k-instruct',
    parent: null,
    metadata: {
      family: 'phi3',
      params_b: 3.8,
      context_window: 4096,
      best_use_cases: ['edge deployment', 'cost-sensitive chat', 'classification'],
      benchmarks: {
        ttft_p50_ms: 28,
        ttft_p95_ms: 52,
        ttft_p99_ms: 64,
        tokens_per_sec: 2450,
        concurrency_tested: [1, 4, 8],
      },
      vllm_config: 'infra/models/phi3-mini.yaml',
    },
  },
  {
    id: 'phi3-medium',
    object: 'model',
    created: 1716000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'microsoft/Phi-3-medium-4k-instruct',
    parent: null,
    metadata: {
      family: 'phi3',
      params_b: 14,
      context_window: 4096,
      best_use_cases: ['reasoning', 'coding', 'instruction-following'],
      benchmarks: {
        ttft_p50_ms: 95,
        ttft_p95_ms: 170,
        ttft_p99_ms: 205,
        tokens_per_sec: 980,
        concurrency_tested: [1, 4, 8],
      },
      vllm_config: 'infra/models/phi3-medium.yaml',
    },
  },

  // ─── CodeLlama ──────────────────────────────────────────────────────────────
  {
    id: 'codellama-7b',
    object: 'model',
    created: 1694000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'codellama/CodeLlama-7b-Instruct-hf',
    parent: null,
    metadata: {
      family: 'codellama',
      params_b: 7,
      context_window: 16384,
      best_use_cases: ['code generation', 'code completion', 'debugging'],
      benchmarks: {
        ttft_p50_ms: 58,
        ttft_p95_ms: 105,
        ttft_p99_ms: 128,
        tokens_per_sec: 1510,
        concurrency_tested: [1, 4, 8],
      },
      vllm_config: 'infra/models/codellama-7b.yaml',
    },
  },
  {
    id: 'codellama-13b',
    object: 'model',
    created: 1694000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'codellama/CodeLlama-13b-Instruct-hf',
    parent: null,
    metadata: {
      family: 'codellama',
      params_b: 13,
      context_window: 16384,
      best_use_cases: ['production code generation', 'test writing', 'refactoring'],
      benchmarks: {
        ttft_p50_ms: 88,
        ttft_p95_ms: 160,
        ttft_p99_ms: 195,
        tokens_per_sec: 1050,
        concurrency_tested: [1, 4, 8],
      },
      vllm_config: 'infra/models/codellama-13b.yaml',
    },
  },
  {
    id: 'codellama-34b',
    object: 'model',
    created: 1694000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'codellama/CodeLlama-34b-Instruct-hf',
    parent: null,
    metadata: {
      family: 'codellama',
      params_b: 34,
      context_window: 16384,
      best_use_cases: ['enterprise code review', 'large codebase navigation', 'architecture suggestions'],
      benchmarks: {
        ttft_p50_ms: 165,
        ttft_p95_ms: 295,
        ttft_p99_ms: 355,
        tokens_per_sec: 560,
        concurrency_tested: [1, 4, 8],
      },
      vllm_config: 'infra/models/codellama-34b.yaml',
    },
  },
];

modelsRouter.get('/', (req, res) => {
  // Strip internal metadata for public API response; return OpenAI-compatible shape
  const publicModels = MODELS.map(({ metadata, ...m }) => m);
  res.json({ object: 'list', data: publicModels });
});

modelsRouter.get('/catalog', (req, res) => {
  // Extended catalog endpoint with full metadata (benchmarks, use-cases, vllm config path)
  res.json({ object: 'list', data: MODELS });
});

modelsRouter.get('/:modelId', (req, res) => {
  const model = MODELS.find((m) => m.id === req.params.modelId);
  if (!model) {
    return res.status(404).json({
      error: { message: `Model '${req.params.modelId}' not found.`, type: 'invalid_request_error' },
    });
  }
  res.json(model);
});

module.exports = { modelsRouter };
