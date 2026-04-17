/**
 * Minimal AWS STS GetCallerIdentity probe via raw SigV4 signing.
 *
 * Avoids adding @aws-sdk/* as a dependency just for one probe call. ~100 lines
 * of well-trodden SigV4 logic + a single fetch.
 *
 * Used by /api/admin/integrations/aws/test to verify a user-pasted access
 * key + secret pair before saving it as a Vercel env var.
 */

import { createHash, createHmac } from 'crypto';

/**
 * Run STS GetCallerIdentity against the given credentials.
 *
 * @param {object} creds
 * @param {string} creds.accessKeyId  e.g. "AKIA..." (AWS_ACCESS_KEY_ID)
 * @param {string} creds.secretAccessKey
 * @param {string} [creds.region='us-east-1']  STS is global but the endpoint
 *                                              defaults to us-east-1.
 * @returns {Promise<{ ok: boolean, account?: string, arn?: string, userId?: string, error?: string }>}
 */
export async function stsGetCallerIdentity({ accessKeyId, secretAccessKey, region = 'us-east-1' }) {
  if (!accessKeyId || !secretAccessKey) {
    return { ok: false, error: 'Both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required.' };
  }

  const host = 'sts.amazonaws.com'; // STS global endpoint
  const service = 'sts';
  const method = 'POST';
  const body = 'Action=GetCallerIdentity&Version=2011-06-15';
  const contentType = 'application/x-www-form-urlencoded; charset=utf-8';

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, ''); // 20260417T053000Z
  const dateStamp = amzDate.slice(0, 8);                                          // 20260417

  const canonicalUri = '/';
  const canonicalQuery = '';
  const payloadHash = sha256Hex(body);
  const canonicalHeaders =
    `content-type:${contentType}\n` +
    `host:${host}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = 'content-type;host;x-amz-date';

  const canonicalRequest =
    `${method}\n${canonicalUri}\n${canonicalQuery}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  const algorithm = 'AWS4-HMAC-SHA256';
  const credScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign =
    `${algorithm}\n${amzDate}\n${credScope}\n${sha256Hex(canonicalRequest)}`;

  const kDate    = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion  = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  const kSigning = hmac(kService, 'aws4_request');
  const signature = hmac(kSigning, stringToSign).toString('hex');

  const authorization =
    `${algorithm} Credential=${accessKeyId}/${credScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  let res;
  try {
    res = await fetch(`https://${host}/`, {
      method,
      headers: {
        'Content-Type': contentType,
        'Host': host,
        'X-Amz-Date': amzDate,
        'Authorization': authorization,
        'Accept': 'application/json',
      },
      body,
    });
  } catch (err) {
    return { ok: false, error: `Network error reaching STS: ${err.message}` };
  }

  const text = await res.text();
  if (!res.ok) {
    // STS errors come back as XML or JSON. Extract message if present.
    const xmlMessage = text.match(/<Message>([^<]+)<\/Message>/)?.[1];
    const jsonMessage = (() => { try { return JSON.parse(text)?.Error?.Message; } catch { return null; } })();
    return {
      ok: false,
      error: xmlMessage || jsonMessage || `STS returned ${res.status}: ${text.slice(0, 200)}`,
    };
  }

  // Successful XML response shape:
  // <GetCallerIdentityResponse>
  //   <GetCallerIdentityResult>
  //     <Arn>arn:aws:iam::123456789012:user/alice</Arn>
  //     <UserId>AIDAxxx</UserId>
  //     <Account>123456789012</Account>
  //   </GetCallerIdentityResult>
  // </GetCallerIdentityResponse>
  return {
    ok: true,
    account: text.match(/<Account>([^<]+)<\/Account>/)?.[1],
    arn:     text.match(/<Arn>([^<]+)<\/Arn>/)?.[1],
    userId:  text.match(/<UserId>([^<]+)<\/UserId>/)?.[1],
  };
}

function sha256Hex(s) {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

function hmac(key, data) {
  return createHmac('sha256', key).update(data, 'utf8').digest();
}
