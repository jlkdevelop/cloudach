/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

// Current stable API version — update when a new version is released.
const API_VERSION = '2026-04-14';

const nextConfig = {
  reactStrictMode: true,
  compress: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        // Immutable cache for hashed static assets — safe to cache forever
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Favicon and other public assets — cache for 1 day, revalidate
        source: '/(favicon\\.svg|favicon\\.ico|robots\\.txt|sitemap\\.xml)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        // Inject API versioning headers on all API responses.
        // /api/v1/* routes are handled via rewrites below; /api/* are legacy paths.
        source: '/api/:path*',
        headers: [
          { key: 'Cloudach-Version', value: API_VERSION },
          { key: 'X-API-Version', value: 'v1' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      // Expose all existing /api/* handlers under the /api/v1/* namespace.
      // File-system routes under pages/api/v1/ take precedence over these rewrites,
      // so version-specific overrides can be added there without conflicts.
      {
        source: '/api/v1/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
