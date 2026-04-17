/**
 * Schema for the in-app integrations page (/admin/integrations).
 * Single source of truth for which env vars belong to which integration,
 * how to label them, and how strict format validation should be.
 */

export const INTEGRATIONS = {
  stripe: {
    label: 'Stripe',
    docHref: 'https://github.com/jlkdevelop/cloudach/blob/main/docs/setup/stripe.md',
    fields: [
      {
        envName: 'STRIPE_SECRET_KEY',
        label: 'Secret API key',
        placeholder: 'sk_test_… or sk_live_…',
        required: true,
        sensitive: true,
        validate: v => /^sk_(test|live)_[A-Za-z0-9]{20,}$/.test(v),
        validationHint: 'Starts with sk_test_ or sk_live_ followed by ≥20 alphanumeric chars.',
      },
      {
        envName: 'STRIPE_WEBHOOK_SECRET',
        label: 'Webhook signing secret',
        placeholder: 'whsec_…',
        required: true,
        sensitive: true,
        validate: v => /^whsec_[A-Za-z0-9]{20,}$/.test(v),
        validationHint: 'Starts with whsec_ followed by ≥20 alphanumeric chars.',
      },
      {
        envName: 'STRIPE_PRICE_ID_PRO',
        label: 'Pro tier price ID',
        placeholder: 'price_…',
        required: false,
        sensitive: false,
        validate: v => /^price_[A-Za-z0-9]{14,}$/.test(v),
        validationHint: 'Starts with price_ followed by ≥14 alphanumeric chars.',
      },
      {
        envName: 'STRIPE_PRICE_ID_ENTERPRISE',
        label: 'Business tier price ID',
        placeholder: 'price_…',
        required: false,
        sensitive: false,
        validate: v => /^price_[A-Za-z0-9]{14,}$/.test(v),
        validationHint: 'Starts with price_ followed by ≥14 alphanumeric chars. (DB key still says ENTERPRISE per Phase 2 §6 deferred rename.)',
      },
    ],
  },
  aws: {
    label: 'AWS',
    docHref: 'https://github.com/jlkdevelop/cloudach/blob/main/docs/setup/aws.md',
    fields: [
      {
        envName: 'AWS_ACCESS_KEY_ID',
        label: 'Access key ID',
        placeholder: 'AKIA… or ASIA…',
        required: true,
        sensitive: true,
        validate: v => /^(AKIA|ASIA)[A-Z0-9]{16}$/.test(v),
        validationHint: 'AKIA-prefixed (long-lived) or ASIA-prefixed (temporary), 20 chars total.',
      },
      {
        envName: 'AWS_SECRET_ACCESS_KEY',
        label: 'Secret access key',
        placeholder: '40-char secret',
        required: true,
        sensitive: true,
        validate: v => /^[A-Za-z0-9/+=]{40}$/.test(v),
        validationHint: '40 chars, base64 alphabet (A-Z, a-z, 0-9, /, +, =).',
      },
      {
        envName: 'AWS_REGION',
        label: 'Region',
        placeholder: 'us-east-1',
        required: true,
        sensitive: false,
        validate: v => /^[a-z]{2}-[a-z]+-\d$/.test(v),
        validationHint: 'AWS region slug (e.g. us-east-1, eu-west-1).',
      },
      {
        envName: 'INFERENCE_BACKEND',
        label: 'Inference backend',
        placeholder: 'aws',
        required: false,
        sensitive: false,
        validate: v => v === 'aws' || v === 'local',
        validationHint: 'Set to "aws" once the GPU instance is up; leave as "local" until then.',
      },
    ],
  },
};

export function getIntegration(provider) {
  return INTEGRATIONS[provider] || null;
}

export function listProviders() {
  return Object.keys(INTEGRATIONS);
}

/**
 * All env var names this feature can manage. Used to filter the Vercel
 * env list down to integration-related entries.
 */
export function allManagedEnvNames() {
  return Object.values(INTEGRATIONS).flatMap(integ => integ.fields.map(f => f.envName));
}
