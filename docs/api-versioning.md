# API Versioning & Deprecation Policy

**Current stable version:** `2026-04-14`  
**Base URL:** `https://api.cloudach.com/api/v1`

---

## Versioning Scheme

Cloudach uses **date-based API versioning**, inspired by Stripe and Anthropic. A version is a calendar date (`YYYY-MM-DD`) that pinpoints the exact API surface a client was written against.

### URL Path

All production endpoints are available under the `/api/v1/` path prefix:

```
GET  https://cloudach.com/api/v1/health
POST https://cloudach.com/api/v1/auth/login
GET  https://cloudach.com/api/v1/dashboard/models
```

The `/api/v1/` prefix refers to the **major compatibility group** — breaking changes advance the major prefix (e.g. `/api/v2/`). Non-breaking additions and improvements are released continuously under the same `/v1/` prefix.

### Response Header

Every API response includes:

```
Cloudach-Version: 2026-04-14
X-API-Version: v1
```

`Cloudach-Version` reflects the **date of the API surface** your request was served against. Clients should record this header and compare it against the version they tested with.

### Request Header (Optional)

Clients may pin to an older API behavior by sending:

```
Cloudach-Version: 2026-04-14
```

When a pinned version is no longer supported, the API returns `HTTP 400` with `error: "api_version_unsupported"`.

---

## Version Discovery

Query the version endpoint to get the current stable version and supported version list:

```
GET /api/v1/version
```

Response:
```json
{
  "current": "2026-04-14",
  "versions": [
    {
      "version": "2026-04-14",
      "path": "/api/v1",
      "status": "stable",
      "releasedAt": "2026-04-14",
      "sunsetAt": null
    }
  ],
  "deprecationPolicy": "https://cloudach.com/docs/api-versioning#deprecation-policy",
  "apiVersion": "2026-04-14"
}
```

---

## Deprecation Policy

### What counts as a breaking change?

| Change type | Breaking? |
|---|---|
| Removing an endpoint | **Yes** |
| Removing a field from a response | **Yes** |
| Renaming a field | **Yes** |
| Changing a field's type | **Yes** |
| Removing a supported HTTP method | **Yes** |
| Adding a new required request field | **Yes** |
| Adding new optional fields to responses | No |
| Adding new endpoints | No |
| Expanding valid enum values | No |
| Changing error messages (not codes) | No |
| Performance improvements | No |

### Deprecation timeline

1. **Announcement** — Deprecated endpoints/fields are announced in the [changelog](https://cloudach.com/changelog) with at minimum **6 months** notice before sunset.
2. **Deprecation header** — Deprecated routes return:
   ```
   Deprecation: true
   Sunset: <RFC 7231 date>
   Link: <https://cloudach.com/docs/api-versioning>; rel="deprecation"
   ```
3. **Sunset** — After the sunset date, the endpoint returns `HTTP 410 Gone` with:
   ```json
   { "error": "endpoint_deprecated", "migration": "https://cloudach.com/docs/migration" }
   ```
4. **Removal** — After a further **3 months** grace period, the endpoint is removed.

### Emergency deprecations

Security vulnerabilities may require immediate deprecation without the standard notice period. In such cases, Cloudach will:

- Email all affected API key holders within 24 hours of the change.
- Provide a migration guide with the announcement.
- Maintain backwards-compatible shims where technically feasible.

---

## Migration Guide (Unversioned → v1)

If you are calling `/api/*` without the `/v1/` prefix, your calls still work — those paths are preserved for backwards compatibility. We recommend migrating to `/api/v1/*` at your earliest convenience, as the unversioned paths may be sunset in a future major release.

| Old path | New path |
|---|---|
| `/api/health` | `/api/v1/health` |
| `/api/status` | `/api/v1/status` |
| `/api/auth/login` | `/api/v1/auth/login` |
| `/api/auth/register` | `/api/v1/auth/register` |
| `/api/dashboard/models` | `/api/v1/dashboard/models` |
| `/api/dashboard/stats` | `/api/v1/dashboard/stats` |
| `/api/dashboard/usage` | `/api/v1/dashboard/usage` |
| `/api/dashboard/billing` | `/api/v1/dashboard/billing` |
| `/api/dashboard/api-keys` | `/api/v1/dashboard/api-keys` |

---

## SDK Support

The official [Cloudach SDK](https://github.com/jlkdevelop/cloudach/tree/main/sdk) targets `/api/v1/` by default. Set the `baseUrl` option if you need to point at a different environment:

```js
import { CloudachClient } from '@cloudach/sdk';

const client = new CloudachClient({
  apiKey: process.env.CLOUDACH_API_KEY,
  baseUrl: 'https://api.cloudach.com/api/v1',
});
```

---

## Further Reading

- [Rate Limits](./rate-limits.md)
- [Authentication](./authentication.md)
- [Error Reference](./errors.md)
- [Changelog](https://cloudach.com/changelog)
