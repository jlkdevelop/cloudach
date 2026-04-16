/**
 * lib/email.js — Email delivery via Resend HTTP API.
 *
 * Set RESEND_API_KEY and EMAIL_FROM in your environment to enable delivery.
 * If RESEND_API_KEY is not set, emails are logged to stdout (dev mode).
 *
 * Docs: https://resend.com/docs/api-reference/emails/send-email
 */

const RESEND_API_URL = 'https://api.resend.com/emails';

/**
 * Send a plain-text + HTML email via Resend.
 *
 * @param {object} opts
 * @param {string}   opts.to       — recipient address
 * @param {string}   opts.subject  — email subject
 * @param {string}   opts.html     — HTML body
 * @param {string}   [opts.text]   — plain-text fallback
 * @returns {Promise<boolean>} true if sent (or logged), false on error
 */
export async function sendEmail({ to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'Cloudach <alerts@cloudach.com>';

  if (!apiKey) {
    // Dev / unconfigured — log to stdout so the developer can see what would be sent
    console.log('[email] RESEND_API_KEY not set — would send:');
    console.log(`  To:      ${to}`);
    console.log(`  From:    ${from}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body:    ${text || html}`);
    return true;
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        ...(text ? { text } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`[email] Resend error ${res.status}: ${body}`);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[email] Failed to send email:', err.message);
    return false;
  }
}

/**
 * Build and send a spending-threshold alert email.
 *
 * @param {object} opts
 * @param {string}  opts.to          — recipient email
 * @param {number}  opts.thresholdPct — e.g. 80
 * @param {number}  opts.spend       — current month spend in USD
 * @param {number}  opts.budget      — monthly budget in USD
 * @param {boolean} opts.hardCapApplied — whether API keys were revoked
 */
export async function sendAlertEmail({ to, thresholdPct, spend, budget, hardCapApplied }) {
  const pctLabel = `${thresholdPct}%`;
  const remaining = Math.max(0, budget - spend);

  function fmt(n) {
    return `$${(+n).toFixed(2)}`;
  }

  const subject = `Cloudach — Spending Alert: ${pctLabel} of monthly budget reached`;

  const text = [
    `Hi ${to},`,
    '',
    `Your Cloudach account has reached ${pctLabel} of your ${fmt(budget)} monthly budget.`,
    '',
    `Current spend:   ${fmt(spend)}`,
    `Monthly budget:  ${fmt(budget)}`,
    `Remaining:       ${fmt(remaining)}`,
    '',
    hardCapApplied
      ? 'Your hard spending cap has been applied — all API keys have been revoked to prevent further charges. You can re-create keys from your dashboard.'
      : 'No action has been taken. Review your usage or increase your budget from the alerts page.',
    '',
    'Manage your alerts and budget at https://cloudach.com/dashboard/alerts',
    '',
    "You're receiving this because you enabled email alerts on your Cloudach account.",
    'To unsubscribe, visit your alert settings and disable email notifications.',
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background: #F9FAFB; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; }
    .wrap { max-width: 560px; margin: 40px auto; background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; overflow: hidden; }
    .header { background: #111827; padding: 24px 32px; }
    .header-logo { font-size: 18px; font-weight: 700; color: #fff; letter-spacing: -0.5px; }
    .body { padding: 32px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 700; background: ${thresholdPct >= 100 ? '#FEE2E2' : thresholdPct >= 80 ? '#FEF3C7' : '#F3F4F6'}; color: ${thresholdPct >= 100 ? '#991B1B' : thresholdPct >= 80 ? '#92400E' : '#374151'}; margin-bottom: 16px; }
    h2 { margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #111827; }
    p { margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #374151; }
    .stats { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px 20px; margin: 20px 0; }
    .stat-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; }
    .stat-label { color: #6B7280; }
    .stat-value { font-weight: 600; color: #111827; }
    .bar-wrap { height: 8px; background: #E5E7EB; border-radius: 4px; margin: 16px 0 4px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 4px; background: ${thresholdPct >= 100 ? '#DC2626' : thresholdPct >= 80 ? '#F59E0B' : '#374151'}; width: ${Math.min(thresholdPct, 100)}%; }
    .cap-warning { background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 14px 18px; margin: 20px 0; font-size: 13px; color: #991B1B; }
    .cta { display: inline-block; margin-top: 8px; padding: 10px 20px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; }
    .footer { border-top: 1px solid #F3F4F6; padding: 20px 32px; font-size: 12px; color: #9CA3AF; }
    .footer a { color: #6B7280; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div class="header-logo">Cloudach</div>
    </div>
    <div class="body">
      <div class="badge">${pctLabel} of budget used</div>
      <h2>Spending alert for your account</h2>
      <p>Hi ${to},<br/>Your Cloudach account has reached <strong>${pctLabel}</strong> of your <strong>${fmt(budget)}</strong> monthly budget.</p>

      <div class="stats">
        <div class="bar-wrap"><div class="bar-fill"></div></div>
        <div class="stat-row"><span class="stat-label">Current spend</span><span class="stat-value">${fmt(spend)}</span></div>
        <div class="stat-row"><span class="stat-label">Monthly budget</span><span class="stat-value">${fmt(budget)}</span></div>
        <div class="stat-row"><span class="stat-label">Remaining</span><span class="stat-value">${fmt(remaining)}</span></div>
      </div>

      ${hardCapApplied ? `
      <div class="cap-warning">
        <strong>Hard spending cap applied.</strong> All API keys have been revoked to prevent additional charges.
        You can re-create keys from your <a href="https://cloudach.com/dashboard/api-keys">API keys dashboard</a>.
      </div>
      ` : `
      <p>No action has been taken yet. You can review your usage or adjust your budget from the alerts page.</p>
      `}

      <a class="cta" href="https://cloudach.com/dashboard/alerts">Manage alerts &rarr;</a>
    </div>
    <div class="footer">
      You&rsquo;re receiving this because you enabled email alerts on your Cloudach account.
      <a href="https://cloudach.com/dashboard/alerts">Unsubscribe</a> by disabling email notifications in alert settings.
    </div>
  </div>
</body>
</html>`;

  return sendEmail({ to, subject, html, text });
}
