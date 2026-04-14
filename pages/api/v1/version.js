/**
 * GET /api/v1/version
 *
 * Returns the current API version, supported versions, and a link to the
 * deprecation policy. Safe to call unauthenticated.
 */
import { API_VERSION, API_PATH_VERSION } from '../../../lib/apiVersion';

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');

  return res.status(200).json({
    current: API_VERSION,
    versions: [
      {
        version: API_VERSION,
        path: `/api/${API_PATH_VERSION}`,
        status: 'stable',
        releasedAt: '2026-04-14',
        sunsetAt: null,
      },
    ],
    deprecationPolicy: 'https://cloudach.com/docs/api-versioning#deprecation-policy',
    apiVersion: API_VERSION,
  });
}
