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
