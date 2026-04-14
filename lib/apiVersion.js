/**
 * API versioning utilities for Cloudach.
 *
 * Current stable version: 2026-04-14
 * All responses served through /api/v1/* carry the Cloudach-Version header.
 */

export const API_VERSION = '2026-04-14';
export const API_VERSION_HEADER = 'Cloudach-Version';
export const API_PATH_VERSION = 'v1';

/**
 * Middleware wrapper that injects API version headers on every response.
 * Apply to individual handlers that need explicit versioning metadata.
 *
 * Usage:
 *   import { withVersion } from '../../lib/apiVersion';
 *   export default withVersion(async function handler(req, res) { ... });
 */
export function withVersion(handler) {
  return async (req, res) => {
    res.setHeader(API_VERSION_HEADER, API_VERSION);
    res.setHeader('X-API-Version', API_PATH_VERSION);
    return handler(req, res);
  };
}

/**
 * Returns standard version metadata to include in API responses.
 * Append to the top level of any JSON response body.
 *
 * Example:
 *   res.status(200).json({ data: ..., ...apiMeta() });
 */
export function apiMeta() {
  return {
    apiVersion: API_VERSION,
  };
}
