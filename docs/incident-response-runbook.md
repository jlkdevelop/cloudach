# Incident Response Runbook — Cloudach

## Severity Levels

| Level | Definition | Response Time | Example |
|-------|-----------|---------------|---------|
| **SEV-1** | Complete service outage or data breach | 15 min | API gateway down, all requests failing |
| **SEV-2** | Significant degradation affecting >20% of users | 30 min | vLLM pod crash-looping, p99 latency >10s |
| **SEV-3** | Partial degradation, workaround available | 2 hours | Single replica restarting, elevated error rate <5% |
| **SEV-4** | Minor issue, no user impact | Next business day | Alert flapping, non-critical config drift |

---

## On-Call Contacts

- **Primary on-call**: check PagerDuty rotation
- **Escalation**: Engineering Manager → CTO
- **Infrastructure channel**: `#infra-alerts` in Slack

---

## Runbooks by Scenario

### 1. API Gateway Down (SEV-1)

**Symptoms**: HTTP 502/503 from `api.cloudach.com`, `ApiGatewayDown` alert firing.

**Diagnosis**:
```bash
kubectl get pods -n cloudach -l app=api-gateway
kubectl describe pod <pod-name> -n cloudach
kubectl logs <pod-name> -n cloudach --previous
```

**Steps**:
1. Check pod status. If `CrashLoopBackOff`, read logs for startup errors.
2. Verify secrets exist: `kubectl get secret cloudach-secrets -n cloudach`
3. Verify DB connectivity from a debug pod:
   ```bash
   kubectl run debug --rm -it --image=postgres:16 -n cloudach -- psql $DB_URL
   ```
4. Force rollout restart: `kubectl rollout restart deployment/api-gateway -n cloudach`
5. If image is broken, roll back:
   ```bash
   kubectl rollout undo deployment/api-gateway -n cloudach
   kubectl rollout status deployment/api-gateway -n cloudach
   ```
6. Scale up replicas temporarily: `kubectl scale deployment/api-gateway --replicas=3 -n cloudach`

**Post-incident**: File a post-mortem within 48 hours. Update `ENGINEERING.md` with findings.

---

### 2. vLLM Inference Down (SEV-1/2)

**Symptoms**: `VllmPodDown` alert firing, `/v1/chat/completions` returns 502.

**Diagnosis**:
```bash
kubectl get pods -n cloudach -l app=vllm-llama3-8b
kubectl logs deployment/vllm-llama3-8b -n cloudach --tail=100
kubectl describe pod <pod-name> -n cloudach
```

**Steps**:
1. Check GPU availability: `kubectl describe node <node-name> | grep -A5 "Allocated resources"`
2. Check HuggingFace token secret: `kubectl get secret hf-token -n cloudach`
3. Check PVC is bound: `kubectl get pvc model-cache-pvc -n cloudach`
4. If OOM killed: increase memory limit or reduce `--gpu-memory-utilization` to `0.85`
5. Restart pod: `kubectl rollout restart deployment/vllm-llama3-8b -n cloudach`
6. Monitor readiness (may take 2-5 min for model load): `kubectl rollout status deployment/vllm-llama3-8b -n cloudach --timeout=10m`

**Note**: Model cold-start from cache takes ~2 min; from HuggingFace Hub ~15 min.

---

### 3. GPU KV Cache High (SEV-2) — `VllmGpuKvCacheHigh`

**Symptoms**: `VllmGpuKvCacheHigh` alert; cache >95%, requests being rejected.

**Steps**:
1. Check current request queue depth:
   ```
   vllm:num_requests_waiting{namespace="cloudach"}
   ```
2. Temporarily enable request queuing or reduce max concurrent requests.
3. Consider adding `--max-num-seqs 64` (lower than default 256) to vLLM args to shed load.
4. Long-term: evaluate scaling to multi-GPU or quantized model variant.

---

### 4. High API Error Rate (SEV-2) — `ApiGatewayHighErrorRate`

**Symptoms**: `ApiGatewayHighErrorRate` alert, 5xx rate >5%.

**Steps**:
1. Identify which endpoints are failing:
   ```
   sum by (route, status) (rate(http_requests_total{namespace="cloudach", app="api-gateway", status=~"5.."}[5m]))
   ```
2. Check api-gateway logs: `kubectl logs deployment/api-gateway -n cloudach --tail=200`
3. Verify vLLM is reachable from api-gateway:
   ```bash
   kubectl exec deployment/api-gateway -n cloudach -- curl -s http://vllm-llama3-8b:8000/health
   ```
4. Check database connection pool: look for `connection pool exhausted` in logs.
5. If DB issue: verify Neon connection limits in GCP Console / Neon dashboard.

---

### 5. Secret or Credential Compromise (SEV-1)

**Symptoms**: `secret-scan` CI job fails, or credential found in git history.

**Immediate steps**:
1. **Rotate the credential immediately** in the originating service (GCP, Neon, Redis, HuggingFace).
2. Update the Kubernetes secret:
   ```bash
   kubectl create secret generic cloudach-secrets \
     --from-literal=jwt-secret=<new-value> \
     --from-literal=db-url=<new-value> \
     --from-literal=redis-url=<new-value> \
     --dry-run=client -o yaml | kubectl apply -f -
   ```
3. Restart affected deployments: `kubectl rollout restart deployment/api-gateway -n cloudach`
4. If secret was in git history, purge with `git filter-repo` and force-push. Notify the team.
5. Review audit logs in GCP IAM and Neon for unauthorized access.
6. File a SEV-1 post-mortem.

---

### 6. Deployment Rollback

**Standard rollback procedure**:
```bash
# Check rollout history
kubectl rollout history deployment/<name> -n cloudach

# Roll back to previous version
kubectl rollout undo deployment/<name> -n cloudach

# Roll back to a specific revision
kubectl rollout undo deployment/<name> -n cloudach --to-revision=<N>

# Confirm
kubectl rollout status deployment/<name> -n cloudach
```

---

## Useful Commands

```bash
# Live pod logs
kubectl logs -f deployment/api-gateway -n cloudach

# All recent events
kubectl get events -n cloudach --sort-by=.lastTimestamp | tail -30

# Resource usage
kubectl top pods -n cloudach

# Exec into a pod
kubectl exec -it deployment/api-gateway -n cloudach -- sh

# Check secrets (base64 encoded)
kubectl get secret cloudach-secrets -n cloudach -o jsonpath='{.data}' | jq
```

---

## Post-Mortem Template

```
## Incident Summary
Date: YYYY-MM-DD
Duration: X hours Y minutes
Severity: SEV-N
Impact: [number of users/requests affected]

## Timeline (UTC)
HH:MM — Alert fired / incident detected
HH:MM — On-call paged
HH:MM — Root cause identified
HH:MM — Fix deployed
HH:MM — Incident resolved

## Root Cause
[What caused the incident]

## Contributing Factors
[What made it worse or delayed resolution]

## What Went Well
[Things that worked]

## Action Items
- [ ] Owner: Short description (due date)
```
