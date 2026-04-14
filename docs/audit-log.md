# Audit Log

Cloudach records an immutable audit trail of all security-relevant actions in your account. Enterprise customers can use this to satisfy compliance requirements (SOC 2, ISO 27001, HIPAA, etc.) and to investigate incidents.

## What Is Logged

| Action | Trigger |
|--------|---------|
| `login.success` | Successful password login |
| `login.failed` | Failed login attempt (bad password or unknown email) |
| `api_key.created` | A new API key is created |
| `api_key.revoked` | An API key is revoked |
| `audit_log.retention_updated` | The retention policy is changed |

Every event captures:

| Field | Description |
|-------|-------------|
| `id` | Auto-incrementing event ID |
| `timestamp` | UTC timestamp of the event |
| `actor_email` | Email of the user who performed the action (snapshot at event time) |
| `actor_type` | `user`, `api_key`, or `system` |
| `action` | Dot-notation action identifier (e.g. `api_key.created`) |
| `resource` | Type of the affected resource (e.g. `api_key`, `user`) |
| `resource_id` | UUID of the affected resource |
| `ip_address` | Client IP (derived from `X-Forwarded-For` or socket) |
| `metadata` | JSON blob with action-specific extra fields |

## Dashboard

Navigate to **Dashboard → Audit Log** to view and search your audit events.

### Filters

- **Search** — free-text search across IP address, actor email, and resource ID
- **Action** — filter by a specific action type
- **Resource** — filter by resource type
- **From / To** — date-range filter

### CSV Export

Click **Export CSV** to download all matching events (up to 10,000 rows) as a CSV file. The export respects the active filters.

## Retention Policy

By default, audit events are kept for **90 days**. You can change this to 30 or 60 days from the bottom of the Audit Log page. Events older than the retention window are automatically purged.

## Database Schema

Defined in `infra/db/009_audit_log.sql`.

```sql
CREATE TABLE audit_logs (
    id          BIGSERIAL   PRIMARY KEY,
    user_id     UUID        REFERENCES users(id) ON DELETE SET NULL,
    api_key_id  UUID        REFERENCES api_keys(id) ON DELETE SET NULL,
    actor_email TEXT,
    actor_type  TEXT        NOT NULL DEFAULT 'user',  -- 'user' | 'api_key' | 'system'
    action      TEXT        NOT NULL,
    resource    TEXT,
    resource_id TEXT,
    ip_address  TEXT,
    metadata    JSONB       NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_log_settings (
    id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    retention_days INT     NOT NULL DEFAULT 90,  -- 30 | 60 | 90
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id)
);
```

## API Reference

### List audit events

```
GET /api/dashboard/audit-log
```

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Free-text search |
| `action` | string | Filter by action (e.g. `login.success`) |
| `resource` | string | Filter by resource type |
| `from` | ISO date string | Start of date range |
| `to` | ISO date string | End of date range |
| `page` | integer | Page number (default: 1) |
| `export` | `1` | Return CSV instead of JSON |

**Response (JSON):**

```json
{
  "events": [
    {
      "id": 42,
      "created_at": "2026-04-14T10:23:00.000Z",
      "actor_email": "alice@example.com",
      "actor_type": "user",
      "action": "api_key.created",
      "resource": "api_key",
      "resource_id": "3f2504e0-...",
      "ip_address": "1.2.3.4",
      "metadata": { "name": "prod-key" }
    }
  ],
  "total": 128,
  "page": 1,
  "pageSize": 50,
  "totalPages": 3,
  "retentionDays": 90
}
```

**Response (CSV, when `export=1`):**

```
id,timestamp,actor_email,actor_type,action,resource,resource_id,ip_address,metadata
42,2026-04-14T10:23:00.000Z,alice@example.com,user,api_key.created,api_key,3f2504e0-...,...,"{""name"":""prod-key""}"
```

---

### Get / update retention policy

```
GET  /api/dashboard/audit-log/retention
PUT  /api/dashboard/audit-log/retention
```

**PUT body:**

```json
{ "retentionDays": 60 }
```

Valid values: `30`, `60`, `90`.

**Response:**

```json
{ "retentionDays": 60 }
```

## Adding Audit Events in Application Code

Use the `logAuditEvent` helper from `lib/audit.js`. It is fire-and-forget and will never throw.

```js
import { logAuditEvent, getClientIp } from '../../../lib/audit';

logAuditEvent({
  userId,            // UUID of acting user (or null for system events)
  actorEmail,        // Email snapshot
  action: 'widget.deleted',
  resource: 'widget',
  resourceId: widget.id,
  ipAddress: getClientIp(req),
  metadata: { reason: 'user_requested' },
});
```
