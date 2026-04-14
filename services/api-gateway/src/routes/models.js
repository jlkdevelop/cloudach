'use strict';

const { Router } = require('express');

const modelsRouter = Router();

// Static list of served models.  In future this can be driven by a DB table.
const MODELS = [
  {
    id: 'llama3-8b',
    object: 'model',
    created: 1712000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'meta-llama/Meta-Llama-3-8B-Instruct',
    parent: null,
  },
  {
    id: 'llama3-70b',
    object: 'model',
    created: 1712000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'meta-llama/Meta-Llama-3-70B-Instruct',
    parent: null,
  },
  {
    id: 'llama31-8b',
    object: 'model',
    created: 1722000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
    parent: null,
  },
  {
    id: 'llama31-70b',
    object: 'model',
    created: 1722000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
    parent: null,
  },
  {
    id: 'mistral-7b',
    object: 'model',
    created: 1700000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'mistralai/Mistral-7B-Instruct-v0.3',
    parent: null,
  },
  {
    id: 'mixtral-8x7b',
    object: 'model',
    created: 1704000000,
    owned_by: 'cloudach',
    permission: [],
    root: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    parent: null,
  },
];

modelsRouter.get('/', (req, res) => {
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
