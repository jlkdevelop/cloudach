# Incident Runbook — Cloudach

_Last updated: 2026-04-14_

This runbook covers the three most common production incidents. For each scenario: detection, triage, mitigation, escalation, and post-mortem.

---

## Table of Contents

1. [API Down / Gateway Unavailable](#1-api-down--gateway-unavailable)
2. [Database Failure](#2-database-failure)
3. [High Latency / Slow Responses](#3-high-latency--slow-responses)
4. [General Escalation Path](#general-escalation-path)
5. [Useful Commands Reference](#useful-commands-reference)

---

## 1. API Down / Gateway Unavailable

### Symptoms
- Frontend returns 502 / 504 gateway errors or connection refused.
- Prometheus alert: `api_gateway_up == 0` or HTTP 5xx rate > 10%.
- Users report "service unavailable" or blank pages.

### Detection
```bash
# Check pod health
kubectl get pods -n cloudach -l app=api-gateway

# Check recent events
kubectl describe deployment api-gateway -n cloudach | tail -30

# Check logs (last 100 lines)
kubectl logs -n cloudach -l app=api-gateway --tail=100 --previous
```

### Triage Checklist
- [ ] Are pods in `CrashLoopBackOff` or `OOMKilled`? → See mitigation A.
- [ ] Are pods `Pending` (not scheduled)? → Check node resources (mitigation B).
- [ ] Are all pods `Running` but returning 5xx? → Check application logs (mitigation C).
- [ ] Did a recent deployment cause this? → Rollback (mitigation D).

### Mitigations

**A — Pod crash loop:**
```bash
# Get crash reason
kubectl logs -n cloudach -l app=api-gateway --previous

# If OOMKilled: increase memory limit in k8s manifest, redeploy
kubectl rollout restart deployment/api-gateway -n cloudach
```

**B — Pods stuck Pending (node resources exhausted):**
```bash
# Check node capacity
kubectl describe nodes | grep -A5 "Allocated resources"

# Scale node pool (GKE)
gcloud container clusters resize cloudach-prod --node-pool default-pool \
  --num-nodes 4 --zone us-central1-a
```

**C — Pods running but 5xx:**
```bash
# Tail live logs
kubectl logs -n cloudach -l app=api-gateway -f

# Check environment variables are correctly mounted
kubectl exec -n cloudach deploy/api-gateway -- env | grep -E 'DATABASE|JWT|PORT'
```

**D — Bad deployment rollback:**
```bash
# Check rollout history
kubectl rollout history deployment/api-gateway -n cloudach

# Rollback to previous revision
kubectl rollout undo deployment/api-gateway -n cloudach

# Verify rollback
kubectl rollout status deployment/api-gateway -n cloudach
```

### Resolution Steps
1. Identify root cause from logs.
2. Apply appropriate mitigation above.
3. Verify: `curl -sf https://api.cloudach.io/health` returns 200.
4. Monitor error rate in Grafana for 10 minutes.
5. Post incident update in Slack `#incidents`.

### Escalation
- **< 5 min** — On-call engineer handles.
- **> 5 min unresolved** — Page engineering lead.
- **> 15 min unresolved** — Incident commander declared; CEO notified.

---

## 2. Database Failure

### Symptoms
- API returns 500 with "connection refused" or "ECONNREFUSED" in logs.
- Prometheus alert: `pg_up == 0` or connection pool exhausted.
- All writes failing; reads may partially succeed.

### Detection
```bash
# From within a running pod, test DB connectivity
kubectl exec -n cloudach deploy/api-gateway -- \
  node -e "const {Pool}=require('pg'); const p=new Pool({connectionString:process.env.DATABASE_URL}); p.query('SELECT 1').then(r=>console.log('OK',r.rows)).catch(e=>console.error('FAIL',e.message))"

# Check DB pod if self-hosted
kubectl get pods -n cloudach -l app=postgres
kubectl logs -n cloudach -l app=postgres --tail=50
```

### Triage Checklist
- [ ] Is the DB pod down? → Mitigation A (restart).
- [ ] DB pod running but unreachable? → Check NetworkPolicy / service (mitigation B).
- [ ] DB running, connection pool exhausted? → Mitigation C.
- [ ] DB disk full? → Mitigation D.
- [ ] DB in read-only mode (standby failover)? → Mitigation E.

### Mitigations

**A — DB pod down (self-hosted):**
```bash
kubectl rollout restart statefulset/postgres -n cloudach
kubectl rollout status statefulset/postgres -n cloudach

# If data volume issue
kubectl describe pvc -n cloudach
```

**B — NetworkPolicy blocking access:**
```bash
# Verify the service resolves
kubectl exec -n cloudach deploy/api-gateway -- nslookup postgres.cloudach.svc.cluster.local

# Check NetworkPolicy
kubectl get networkpolicy -n cloudach
```

**C — Connection pool exhausted:**
```bash
# Check active connections
kubectl exec -n cloudach deploy/postgres -- \
  psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Restart API to reset connection pool (quick fix)
kubectl rollout restart deployment/api-gateway -n cloudach

# Long-term: increase `max` in Pool config or reduce pool per-replica
```

**D — Disk full:**
```bash
# Check disk usage
kubectl exec -n cloudach deploy/postgres -- df -h /var/lib/postgresql/data

# If using GCP: expand the PersistentVolume
gcloud compute disks resize <disk-name> --size=200GB --zone=us-central1-a
kubectl patch pvc postgres-data -n cloudach -p '{"spec":{"resources":{"requests":{"storage":"200Gi"}}}}'
```

**E — DB in read-only (standby) mode:**
```bash
# Check replication status
kubectl exec -n cloudach deploy/postgres -- \
  psql -U postgres -c "SELECT pg_is_in_recovery();"

# If true, promote standby (only if primary is confirmed dead)
kubectl exec -n cloudach deploy/postgres -- \
  psql -U postgres -c "SELECT pg_promote();"
```

### Resolution Steps
1. Restore DB connectivity using appropriate mitigation.
2. Verify: `SELECT 1` query succeeds from application pod.
3. Check for any missed writes during the outage (review app logs for failed transactions).
4. Replay any queued operations if applicable.
5. Monitor connection count and error rate for 15 minutes.

### Data Recovery (Last Resort)
```bash
# List available backups (GCP Cloud SQL)
gcloud sql backups list --instance=cloudach-prod

# Restore to point-in-time (CAUTION: destructive — confirm with team first)
gcloud sql instances restore-backup cloudach-prod \
  --backup-id=<backup-id>
```

### Escalation
- **< 2 min** — On-call engineer handles.
- **> 2 min with data unavailable** — Page DB lead + engineering lead.
- **Any data loss suspected** — Incident commander; CTO notified immediately.

---

## 3. High Latency / Slow Responses

### Symptoms
- Prometheus alert: p95 API latency > 2s or p99 > 5s.
- Users report slow page loads.
- Grafana shows latency spike correlated with increased traffic or a deployment.

### Detection
```bash
# Check current pod CPU/memory
kubectl top pods -n cloudach

# Check HPA (Horizontal Pod Autoscaler) status
kubectl get hpa -n cloudach

# Check recent pod events
kubectl get events -n cloudach --sort-by=.lastTimestamp | tail -20
```

### Triage Checklist
- [ ] Latency spike after a deployment? → Profile new code; rollback if needed.
- [ ] CPU throttled? → Check resource limits (mitigation A).
- [ ] DB query slow? → Check slow query log (mitigation B).
- [ ] Traffic surge? → Scale up (mitigation C).
- [ ] Memory pressure / GC? → Check heap (mitigation D).
- [ ] Cloudflare / external dependency slow? → Check third-party status.

### Mitigations

**A — CPU throttling:**
```bash
# Check CPU limits
kubectl describe pods -n cloudach -l app=api-gateway | grep -A3 "Limits"

# Temporarily increase CPU limit (edit deployment)
kubectl set resources deployment/api-gateway -n cloudach \
  --limits=cpu=2000m,memory=1Gi

# Long-term: tune resource requests/limits in k8s manifests
```

**B — Slow database queries:**
```bash
# Find slow queries (>500ms)
kubectl exec -n cloudach deploy/postgres -- psql -U postgres -d cloudach -c \
  "SELECT query, mean_exec_time, calls FROM pg_stat_statements \
   WHERE mean_exec_time > 500 ORDER BY mean_exec_time DESC LIMIT 10;"

# Check for missing indexes
kubectl exec -n cloudach deploy/postgres -- psql -U postgres -d cloudach -c \
  "SELECT schemaname, tablename, attname, n_distinct, correlation \
   FROM pg_stats WHERE tablename IN ('users','sessions') ORDER BY n_distinct;"

# Terminate long-running queries (replace <pid>)
kubectl exec -n cloudach deploy/postgres -- psql -U postgres -c \
  "SELECT pg_terminate_backend(<pid>);"
```

**C — Traffic surge (scale out):**
```bash
# Manually scale replicas
kubectl scale deployment/api-gateway -n cloudach --replicas=6

# Ensure HPA is configured (if not already)
kubectl autoscale deployment api-gateway -n cloudach \
  --min=2 --max=10 --cpu-percent=70
```

**D — Memory pressure / GC pauses (Node.js):**
```bash
# Check memory usage
kubectl top pods -n cloudach --sort-by=memory

# If pods near limit, increase memory or restart (quick fix)
kubectl rollout restart deployment/api-gateway -n cloudach

# Long-term: profile with --inspect flag in staging; check for memory leaks
```

**E — vLLM inference slow:**
```bash
# Check vLLM pod GPU utilization
kubectl exec -n cloudach deploy/vllm-llama3-8b -- nvidia-smi

# Check vLLM queue depth
kubectl logs -n cloudach -l app=vllm-llama3-8b --tail=50 | grep -i queue

# If GPU OOM: restart vLLM
kubectl rollout restart deployment/vllm-llama3-8b -n cloudach
```

### Resolution Steps
1. Identify bottleneck (CPU, DB, memory, traffic, vLLM).
2. Apply mitigation; watch Grafana latency graph in real time.
3. Target: p95 < 500ms, p99 < 2s.
4. If no improvement in 5 minutes, consider rollback.
5. After recovery: investigate root cause (profiling, query analysis).

### Escalation
- **p95 > 2s for > 5 min** — On-call engineer investigates.
- **p95 > 5s for > 10 min** — Page engineering lead.
- **p99 > 10s / timeouts** — Incident commander; evaluate partial degradation mode.

---

## General Escalation Path

| Severity | Response Time | Contacts |
|----------|---------------|----------|
| P1 — Total outage | 5 min | On-call → Engineering Lead → CTO |
| P2 — Partial outage / data unavailable | 15 min | On-call → Engineering Lead |
| P3 — Degraded performance | 30 min | On-call engineer |
| P4 — Minor issue | Next business day | Ticket in backlog |

**On-call rotation:** See PagerDuty schedule at [your-pagerduty-url].  
**Incident Slack channel:** `#incidents`  
**Status page:** [your-status-page-url]

---

## Useful Commands Reference

```bash
# Get all pods with status
kubectl get pods -n cloudach -o wide

# Watch pods in real time
kubectl get pods -n cloudach -w

# Port-forward for local debugging
kubectl port-forward -n cloudach svc/api-gateway 8080:80

# Execute shell in a pod
kubectl exec -it -n cloudach deploy/api-gateway -- /bin/sh

# View recent Kubernetes events
kubectl get events -n cloudach --sort-by=.lastTimestamp

# Check cluster node health
kubectl get nodes -o wide

# View resource usage
kubectl top nodes
kubectl top pods -n cloudach

# Rollout commands
kubectl rollout status deployment/<name> -n cloudach
kubectl rollout history deployment/<name> -n cloudach
kubectl rollout undo deployment/<name> -n cloudach

# GCP: get GKE credentials
gcloud container clusters get-credentials cloudach-prod \
  --zone us-central1-a --project $GCP_PROJECT_ID
```

---

## Post-Mortem Template

After every P1 or P2 incident, complete within 48 hours:

```
## Incident: [Short title] — [Date]

**Duration:** HH:MM
**Severity:** P1 / P2
**Impact:** [# users affected, revenue impact if known]

### Timeline
- HH:MM UTC — Alert fired / issue detected
- HH:MM UTC — On-call paged
- HH:MM UTC — Root cause identified
- HH:MM UTC — Mitigation applied
- HH:MM UTC — Resolved

### Root Cause
[One paragraph describing the underlying cause]

### What Went Well
- [List]

### What Went Poorly
- [List]

### Action Items
| Action | Owner | Due |
|--------|-------|-----|
| [Fix] | [Name] | [Date] |
```
