# Incident Response Runbook — Cloudach

## Severity Levels

| Level | Definition | Response Time | Example |
|-------|-----------|---------------|---------|
| **SEV-1** | Complete service outage or data breach | 15 min | API gateway down |
| **SEV-2** | Significant degradation >20% of users | 30 min | vLLM crash-looping, p99 >10s |
| **SEV-3** | Partial degradation, workaround available | 2 hours | Single replica restarting |
| **SEV-4** | Minor issue, no user impact | Next business day | Alert flapping |

---

## On-Call Contacts

- **Primary on-call**: check PagerDuty rotation
- **Escalation**: Engineering Manager → CTO
- **Infrastructure channel**: `#infra-alerts` in Slack

---

## Runbooks by Scenario

### 1. API Gateway Down (SEV-1)

**Alerts**: `ApiGatewayDown`, HTTP 502/503 from `api.cloudach.com`

```bash
kubectl get pods -n cloudach -l app=api-gateway
kubectl describe pod <pod-name> -n cloudach
kubectl logs <pod-name> -n cloudach --previous
```

**Steps**:
1. Check pod status — if `CrashLoopBackOff`, read logs for startup errors
2. Verify secrets exist: `kubectl get secret cloudach-secrets -n cloudach`
3. Force rollout restart: `kubectl rollout restart deployment/api-gateway -n cloudach`
4. Roll back if image is broken: `kubectl rollout undo deployment/api-gateway -n cloudach`
5. Scale up temporarily: `kubectl scale deployment/api-gateway --replicas=3 -n cloudach`

---

### 2. vLLM Inference Down (SEV-1/2)

**Alerts**: `VllmPodDown`, `/v1/chat/completions` returns 502

```bash
kubectl get pods -n cloudach -l app=vllm-llama3-8b
kubectl logs deployment/vllm-llama3-8b -n cloudach --tail=100
```

**Steps**:
1. Check GPU availability: `kubectl describe node <node> | grep -A5 "Allocated resources"`
2. Check PVC is bound: `kubectl get pvc model-cache-pvc -n cloudach`
3. Restart: `kubectl rollout restart deployment/vllm-llama3-8b -n cloudach`
4. Monitor readiness (model load takes 2-5 min from cache):
   `kubectl rollout status deployment/vllm-llama3-8b -n cloudach --timeout=10m`

---

### 3. GPU KV Cache High (SEV-2) — `VllmGpuKvCacheHigh`

1. Check queue depth in Grafana: `vllm:num_requests_waiting{namespace="cloudach"}`
2. Reduce `--gpu-memory-utilization` to `0.85` to shed load
3. Long-term: evaluate multi-GPU or quantized model

---

### 4. High API Error Rate (SEV-2) — `ApiGatewayHighErrorRate`

1. Identify failing endpoints:
   ```
   sum by (route, status) (rate(http_requests_total{namespace="cloudach",status=~"5.."}[5m]))
   ```
2. Check logs: `kubectl logs deployment/api-gateway -n cloudach --tail=200`
3. Verify vLLM reachable: `kubectl exec deployment/api-gateway -n cloudach -- curl http://vllm-llama3-8b:8000/health`

---

### 5. Secret or Credential Compromise (SEV-1)

1. **Rotate the credential immediately** in the originating service
2. Update Kubernetes secret:
   ```bash
   kubectl create secret generic cloudach-secrets \
     --from-literal=jwt-secret=<new> --from-literal=db-url=<new> \
     --dry-run=client -o yaml | kubectl apply -f -
   ```
3. Restart deployments: `kubectl rollout restart deployment/api-gateway -n cloudach`
4. If in git history: purge with `git filter-repo`, force-push, notify team
5. Review GCP IAM and Neon audit logs for unauthorized access

---

### 6. Deployment Rollback

```bash
kubectl rollout history deployment/<name> -n cloudach
kubectl rollout undo deployment/<name> -n cloudach
kubectl rollout status deployment/<name> -n cloudach
```

---

## Useful Commands

```bash
kubectl logs -f deployment/api-gateway -n cloudach
kubectl get events -n cloudach --sort-by=.lastTimestamp | tail -30
kubectl top pods -n cloudach
kubectl exec -it deployment/api-gateway -n cloudach -- sh
```

---

## Post-Mortem Template

```
## Incident Summary
Date: YYYY-MM-DD | Duration: Xh Ym | Severity: SEV-N | Impact: N users

## Timeline (UTC)
HH:MM — Alert fired
HH:MM — Root cause identified
HH:MM — Fix deployed / resolved

## Root Cause
[What caused the incident]

## Action Items
- [ ] Owner: Description (due date)
```
