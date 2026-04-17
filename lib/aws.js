/**
 * AWS configuration detection helpers.
 *
 * This module is the Next.js / admin-panel side of the AWS integration. The
 * actual inference proxying lives in
 * `services/api-gateway/src/lib/inference/AwsInferenceBackend.js`, which has
 * its own env-var contract for the gateway runtime.
 *
 * The admin panel uses these helpers to surface configured/not-configured
 * state without ever instantiating the AWS SDK or making API calls. CloudWatch
 * billing queries (for monthly cost estimate) will land in a follow-up once
 * AWS credentials are present.
 */

/**
 * True when the minimum env vars to talk to AWS are set. Per CLO-1
 * directive 2026-04-17, the admin panel surfaces 'configured/not configured'
 * based on AWS_REGION + AWS_ACCESS_KEY_ID presence.
 */
export function isAwsConfigured() {
  return Boolean(process.env.AWS_REGION) && Boolean(process.env.AWS_ACCESS_KEY_ID);
}

/**
 * Returns the env-derived view of the AWS configuration without reaching
 * any AWS API. Safe to call from any context — never throws, never blocks.
 *
 * The shape is intentionally flat so it can be JSON-serialized into the
 * admin overview API response and consumed by the AdminPanel UI.
 */
export function getAwsConfig() {
  const region = process.env.AWS_REGION || null;
  const inferenceBackend = (process.env.INFERENCE_BACKEND || 'local').toLowerCase();
  const apiEndpoint = process.env.AWS_API_ENDPOINT || null;
  const gpuInstanceId = process.env.AWS_GPU_INSTANCE_ID || null;

  return {
    configured: isAwsConfigured(),
    region,
    inferenceBackend,
    apiEndpoint,
    gpuInstanceId,
    gpuInstanceConfigured: Boolean(gpuInstanceId),
    // monthlyCostCents stays null until the CloudWatch billing API
    // integration lands — needs the AWS SDK + a Cost Explorer query
    // run server-side with real credentials.
    monthlyCostCents: null,
  };
}
