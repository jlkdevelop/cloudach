import Stripe from 'stripe';
import { requireAdmin } from '../../../../../lib/auth';
import { stsGetCallerIdentity } from '../../../../../lib/aws-sts';

/**
 * POST /api/admin/integrations/{provider}/test
 *
 * Probes a *unsaved* candidate value against the provider's API to verify
 * it's valid before the operator commits to saving it as an env var.
 *
 * Body shape varies per provider:
 *   stripe: { secretKey: 'sk_test_…' }
 *   aws:    { accessKeyId: 'AKIA…', secretAccessKey: '…', region?: 'us-east-1' }
 *
 * Response: { ok: boolean, message: string, details?: object }
 *
 * Never persists anything. Never logs the secret. Stripe / STS errors get
 * surfaced verbatim so the operator can debug the credential.
 */
export default requireAdmin(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { provider } = req.query;

  if (provider === 'stripe') {
    const { secretKey } = req.body || {};
    if (!secretKey || typeof secretKey !== 'string') {
      return res.status(400).json({ ok: false, message: 'Body must include { secretKey }' });
    }
    if (!/^sk_(test|live)_[A-Za-z0-9]{20,}$/.test(secretKey)) {
      return res.status(400).json({ ok: false, message: 'Key must look like sk_test_… or sk_live_… (≥20 alphanumeric chars).' });
    }
    try {
      const stripe = new Stripe(secretKey, { apiVersion: '2024-04-10' });
      const list = await stripe.customers.list({ limit: 1 });
      const mode = secretKey.startsWith('sk_live_') ? 'live' : 'test';
      return res.status(200).json({
        ok: true,
        message: `Connected to Stripe (${mode} mode). ${list.data.length} customer${list.data.length === 1 ? '' : 's'} visible to this key.`,
        details: { mode, customerCount: list.data.length },
      });
    } catch (err) {
      return res.status(200).json({
        ok: false,
        message: err.message || 'Stripe rejected the key',
      });
    }
  }

  if (provider === 'aws') {
    const { accessKeyId, secretAccessKey, region } = req.body || {};
    if (!accessKeyId || !secretAccessKey) {
      return res.status(400).json({ ok: false, message: 'Body must include { accessKeyId, secretAccessKey }' });
    }
    const result = await stsGetCallerIdentity({ accessKeyId, secretAccessKey, region });
    if (!result.ok) {
      return res.status(200).json({ ok: false, message: result.error });
    }
    return res.status(200).json({
      ok: true,
      message: `Connected to AWS. Account ${result.account} · ${result.arn}`,
      details: { account: result.account, arn: result.arn, userId: result.userId },
    });
  }

  return res.status(404).json({ ok: false, message: `No test handler for provider: ${provider}` });
});
