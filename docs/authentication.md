# Authentication

All requests to the Cloudach API must include an `Authorization` header with a valid API key.

```
Authorization: Bearer sk-cloudach-<your-key>
```

---

## Getting an API key

1. Sign up or log in at [cloudach.com](https://cloudach.com)
2. Go to **Dashboard** → **API Keys**
3. Click **Create key** and give it a descriptive name (e.g. `prod-backend`, `dev-local`)
4. Copy the key immediately — it is shown **only once**

---

## Key format

All Cloudach API keys start with `sk-cloudach-` followed by 64 hex characters:

```
sk-cloudach-a1b2c3d4e5f6...
```

---

## Key scoping (optional)

When creating a key via the dashboard, you can restrict it to specific models and set a rate limit:

| Option | Description |
|--------|-------------|
| `allowed_models` | Array of model IDs the key can use. Omit for unrestricted access. |
| `rate_limit_rpm` | Per-key requests-per-minute cap. Defaults to the account-level limit (60 RPM). |

Example: a key scoped to `llama3-8b` only, capped at 10 RPM, is appropriate for a free-tier integration.

---

## Error responses

| Status | Error type | Cause |
|--------|------------|-------|
| `401` | `authentication_error` | Missing, invalid, or revoked key |
| `403` | `permission_error` | Key exists but the requested model is not in its allowlist |
| `429` | `rate_limit_exceeded` | Too many requests — see [Rate limits](./rate-limits.md) |

A `401` response body looks like:

```json
{
  "error": {
    "message": "Invalid or revoked API key.",
    "type": "authentication_error"
  }
}
```

---

## Best practices

- **Never commit API keys.** Use environment variables (e.g. `CLOUDACH_API_KEY`) and add `.env` files to `.gitignore`.
- **Use scoped keys in production.** Restrict each key to the models it actually needs.
- **Rotate keys regularly.** Revoke and recreate keys at least every 90 days, and immediately after any suspected exposure.
- **One key per integration.** Use separate keys for dev, staging, and production so you can revoke one without affecting the others.
