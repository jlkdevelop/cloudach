# Runbook: Deploy a New Model on Cloudach

**Audience:** Platform / ML engineers  
**Last updated:** 2026-04-14  
**Applies to:** GKE (staging) and AWS EKS (production)

---

## Overview

This runbook covers the end-to-end process for adding a new LLM to the Cloudach platform — from obtaining model weights, through staging validation, to production rollout with autoscaling enabled.

Estimated time: **60–90 minutes** (excluding HuggingFace download time).

---

## Prerequisites

| Requirement | Notes |
|-------------|-------|
| `kubectl` configured | `kubectl config use-context <cluster>` |
| `helm` ≥ 3.12 | |
| AWS CLI or `gcloud` | Depending on target cloud |
| HuggingFace account with model access | Gated models (Llama) need approved access |
| `HF_TOKEN` available | Stored in `cloudach-secrets` / AWS Secrets Manager |
| `GITHUB_TOKEN` with repo write | To merge the config PR |

---

## Step 1 — Choose the Model and Instance Type

1. Check GPU VRAM requirements:

   | Model | VRAM | Recommended instance | Tensor parallel |
   |-------|------|---------------------|-----------------|
   | Mistral 7B | 14 GB | g4dn.xlarge (T4 16 GB) | 1 |
   | Llama 3 8B | 16 GB | g4dn.xlarge (T4 16 GB) | 1 |
   | Llama 3 70B | 40 GB | 2 × g5.xlarge (A10G 24 GB) | 2 |
   | Mixtral 8x7B | 48 GB | 2 × g5.xlarge | 2 |

2. Estimate cost before proceeding:

   ```bash
   python3 infra/scripts/cost_calculator.py \
     --model <model-key> \
     --requests-per-day <expected-daily-volume> \
     --environment staging
   ```

3. Get sign-off from the CTO if GPU cost delta > $500/month.

---

## Step 2 — Verify HuggingFace Access

```bash
# Test that your token can download the model
pip install huggingface_hub
python3 -c "
from huggingface_hub import snapshot_download
snapshot_download('meta-llama/Meta-Llama-3-8B-Instruct',
                  token='$HF_TOKEN',
                  local_dir='/tmp/model-test',
                  ignore_patterns=['*.bin'])
print('Access OK')
"
```

For gated models (Llama family), you must first accept the license at `huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct`.

---

## Step 3 — Add the Model to the Catalog (Database)

1. Connect to the database:

   ```bash
   # GKE
   kubectl -n cloudach exec -it deploy/api-gateway -- psql $DB_URL

   # AWS — port-forward RDS via bastion or use SSM
   aws ssm start-session --target <bastion-instance-id>
   psql "$(aws secretsmanager get-secret-value \
     --secret-id cloudach/staging/db-url --query SecretString --output text)"
   ```

2. Insert the model record:

   ```sql
   INSERT INTO model_catalog (id, name, provider, context_window, description)
   VALUES (
     'llama3-8b',
     'Llama 3 8B Instruct',
     'meta',
     8192,
     'Meta Llama 3 8B — fast general-purpose instruction-following model.'
   )
   ON CONFLICT (id) DO NOTHING;

   -- Developer tier pricing ($0 for beta)
   INSERT INTO model_pricing (model_id, tier, input_price_per_1m, output_price_per_1m)
   VALUES ('llama3-8b', 'developer', 0.50, 1.50)
   ON CONFLICT (model_id, tier) DO UPDATE
     SET input_price_per_1m  = EXCLUDED.input_price_per_1m,
         output_price_per_1m = EXCLUDED.output_price_per_1m;
   ```

3. Verify the insert:
   ```sql
   SELECT id, name, provider, context_window FROM model_catalog ORDER BY id;
   ```

---

## Step 4 — Create the vLLM Kubernetes Manifest

1. Copy the existing manifest as a starting point:

   ```bash
   cp infra/k8s/vllm/deployment.yaml infra/k8s/vllm/deployment-<model-id>.yaml
   ```

2. Edit the new file — key fields to change:

   ```yaml
   metadata:
     name: vllm-<model-id>         # e.g. vllm-mistral-7b

   spec:
     replicas: 0                    # KEDA controls this

     selector:
       matchLabels:
         app: vllm-<model-id>

     template:
       metadata:
         labels:
           app: vllm-<model-id>
           model: <model-id>        # must match model_catalog.id

       spec:
         containers:
           - name: vllm
             args:
               - "--model"
               - "<hf-model-id>"   # e.g. mistralai/Mistral-7B-Instruct-v0.3
               - "--served-model-name"
               - "<model-id>"
               - "--tensor-parallel-size"
               - "<1 or 2>"
               - "--max-model-len"
               - "<context_window>"  # match model_catalog
   ```

3. For `--tensor-parallel-size 2`, also request `nvidia.com/gpu: "2"` in resources.

4. Open a PR with the new manifest. CI runs `kubectl apply --dry-run=server`.

---

## Step 5 — Deploy to Staging

```bash
# Apply the manifest
kubectl apply -f infra/k8s/vllm/deployment-<model-id>.yaml -n cloudach

# Verify the deployment was created (replicas=0 is normal — KEDA manages it)
kubectl get deploy vllm-<model-id> -n cloudach

# Check the pod comes up when triggered manually
kubectl scale deploy vllm-<model-id> --replicas=1 -n cloudach

# Watch pod status (GPU node may take 90s to provision)
kubectl get pods -n cloudach -w -l app=vllm-<model-id>

# Tail logs
kubectl logs -n cloudach -l app=vllm-<model-id> -f --tail=200
```

Expected log line when ready:
```
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## Step 6 — Smoke Test the Inference Endpoint

```bash
# Port-forward to the vLLM pod directly
kubectl port-forward -n cloudach svc/vllm-<model-id> 8001:8000 &

# Verify model is listed
curl -s http://localhost:8001/v1/models | jq '.data[].id'

# Send a test completion
curl -s http://localhost:8001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "<model-id>",
    "messages": [{"role":"user","content":"Say hello in one sentence."}],
    "max_tokens": 50
  }' | jq '.choices[0].message.content'

# Kill port-forward
kill %1
```

---

## Step 7 — Configure the API Gateway to Route to the New Model

1. Update the gateway's model routing config (environment variable or config map):

   ```bash
   kubectl -n cloudach set env deploy/api-gateway \
     VLLM_ROUTES="llama3-8b=http://vllm-llama3-8b:8000,<model-id>=http://vllm-<model-id>:8000"
   ```

   Or if routing is config-file based, edit `infra/k8s/api-gateway/configmap.yaml`.

2. Rollout and verify:

   ```bash
   kubectl rollout status deploy/api-gateway -n cloudach
   kubectl rollout restart deploy/api-gateway -n cloudach
   ```

3. Test through the gateway with a valid API key:

   ```bash
   curl -s https://api-staging.cloudach.com/v1/chat/completions \
     -H "Authorization: Bearer $TEST_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"<model-id>","messages":[{"role":"user","content":"Ping"}],"max_tokens":20}'
   ```

---

## Step 8 — Add KEDA ScaledObject

Add a KEDA `ScaledObject` for the new model so it autoscales from zero:

```bash
cat <<EOF | kubectl apply -f -
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: vllm-<model-id>-scaler
  namespace: cloudach
spec:
  scaleTargetRef:
    name: vllm-<model-id>
  minReplicaCount: 0
  maxReplicaCount: 4
  cooldownPeriod: 300
  triggers:
    - type: prometheus
      metadata:
        serverAddress: http://prometheus:9090
        metricName: vllm_num_requests_waiting
        threshold: "1"
        query: sum(vllm_num_requests_waiting{model="<model-id>"})
EOF
```

Verify the ScaledObject is ready:
```bash
kubectl get scaledobject vllm-<model-id>-scaler -n cloudach
```

---

## Step 9 — Scale Back to Zero and Verify Cold Start

```bash
# Force scale-to-zero (KEDA will do this automatically after cooldownPeriod)
kubectl scale deploy vllm-<model-id> --replicas=0 -n cloudach

# Send a request — this should trigger KEDA to scale up
curl -s https://api-staging.cloudach.com/v1/chat/completions \
  -H "Authorization: Bearer $TEST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"<model-id>","messages":[{"role":"user","content":"Test"}],"max_tokens":20}'

# Watch pod scale up (expect ~90s to first token on cold start)
kubectl get pods -n cloudach -w -l app=vllm-<model-id>
```

Cold start p95 target: **< 120 seconds** to first token.

---

## Step 10 — Production Rollout

Once staging passes:

1. Merge the PR with the new manifest.
2. Apply to production:

   ```bash
   kubectl config use-context cloudach-production
   kubectl apply -f infra/k8s/vllm/deployment-<model-id>.yaml -n cloudach
   ```

3. Repeat steps 6–9 against the production cluster.
4. Update the frontend `Models` component if the model should appear in the UI.
5. Announce in `#platform` Slack channel and update the changelog.

---

## Rollback

If a deployment causes issues:

```bash
# Scale the new model to zero immediately
kubectl scale deploy vllm-<model-id> --replicas=0 -n cloudach

# Remove the gateway route
kubectl -n cloudach set env deploy/api-gateway \
  VLLM_ROUTES="<old-routes-without-new-model>"

# If DB entry needs reverting
# (safe to leave in catalog — just remove pricing to make it unavailable)
psql $DB_URL -c "DELETE FROM model_pricing WHERE model_id = '<model-id>';"
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Pod stuck in `Pending` | No GPU node available | Check cluster-autoscaler logs; verify instance type in node group |
| OOMKilled | VRAM or RAM limit too low | Increase `limits.nvidia.com/gpu` or reduce `--gpu-memory-utilization` |
| `CUDA out of memory` | Model too large for instance | Switch to larger GPU instance |
| `404` from gateway | Model not in routing config | Update `VLLM_ROUTES` env var |
| Slow first token after cold start | Model loading from EFS | Normal; EFS cold read. Pre-warm by scaling to 1 replica before traffic spike |
| HuggingFace 401 | Token expired or not injected | Rotate `hf-token` secret; restart pod |

---

## Checklist

- [ ] Cost estimate reviewed and approved
- [ ] HuggingFace access verified
- [ ] `model_catalog` and `model_pricing` rows inserted
- [ ] Kubernetes manifest created and PR merged
- [ ] Staged smoke test passed
- [ ] Gateway routing updated
- [ ] KEDA ScaledObject applied
- [ ] Cold-start latency < 120 s verified
- [ ] Production deployment completed
- [ ] Changelog updated
