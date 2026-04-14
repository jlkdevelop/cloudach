'use strict';

/**
 * Per-model pricing (USD per 1M tokens) — mirrors the CLO-14 Startup tier.
 * Input (prompt) and output (completion) priced separately.
 */
const PRICING = {
  'llama3-8b':    { inputPerM: 0.08, outputPerM: 0.10 },
  'mistral-7b':   { inputPerM: 0.08, outputPerM: 0.10 },
  'llama3-70b':   { inputPerM: 0.65, outputPerM: 0.80 },
  'mixtral-8x7b': { inputPerM: 0.95, outputPerM: 1.20 },
  'codellama-13b':{ inputPerM: 0.20, outputPerM: 0.25 },
  'gemma-7b':     { inputPerM: 0.08, outputPerM: 0.10 },
};

const DEFAULT_PRICING = { inputPerM: 0.10, outputPerM: 0.10 };

/**
 * Calculate the estimated cost (USD) for a single request.
 *
 * @param {string} model
 * @param {number} promptTokens
 * @param {number} completionTokens
 * @returns {number} cost in USD (8 decimal places of precision)
 */
function calculateCost(model, promptTokens, completionTokens) {
  const p = PRICING[model] || DEFAULT_PRICING;
  const inputCost  = (promptTokens     / 1_000_000) * p.inputPerM;
  const outputCost = (completionTokens / 1_000_000) * p.outputPerM;
  return inputCost + outputCost;
}

/**
 * Get pricing config for a model (useful for display / audit).
 */
function getPricing(model) {
  return PRICING[model] || DEFAULT_PRICING;
}

/**
 * Get the billing period (month) that a given date falls in.
 * Returns { start: Date, end: Date } for the first and last day of the month.
 */
function getBillingPeriod(date = new Date()) {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  const end   = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));
  return { start, end };
}

module.exports = { calculateCost, getPricing, getBillingPeriod, PRICING };
