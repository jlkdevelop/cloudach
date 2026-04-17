# AWS Setup — Cloudach

> Last updated: 2026-04-17
> Related code: `infra/aws/` (Terraform), `services/api-gateway/src/lib/inference/AwsInferenceBackend.js`, `lib/aws.js`, `pages/admin/integrations.jsx`.

This doc gets a fresh Cloudach environment from "AWS shows NOT_CONFIGURED in /admin" to "EC2+vLLM serving real inference, admin panel green, app routing requests via the AWS backend." Operator-only — agents do not request live AWS keys per CLO-1 ground rules.

---

## 0. Prerequisites

- An AWS account with billing alerts you trust.
- Local Terraform ≥ 1.6.0 installed (`brew install terraform` or your distro equivalent).
- Local AWS CLI configured with an IAM user/role that has EC2 / VPC / S3 / IAM / CloudWatch full-access (you can scope it down later — see §4).
- An SSH keypair (`ssh-keygen -t ed25519` if you don't have one). The `.pub` half goes into `terraform.tfvars`; the private half stays on your machine.

---

## 1. Required environment variables (Cloudach app side)

These are what `lib/aws.js → isAwsConfigured()` and `services/api-gateway/src/lib/inference/AwsInferenceBackend.js` read. Set them via `/admin/integrations` once Terraform has produced the values.

| Env var | What it is | Source |
|---------|-----------|--------|
| `AWS_REGION` | AWS region the inference instance runs in. | Whatever you pass to `terraform apply -var region=…` (default `us-east-1`). |
| `AWS_ACCESS_KEY_ID` | IAM access key for runtime calls (CloudWatch billing query, future SDK calls). Starts with `AKIA…`. | IAM Console → Users → Create access key. **Use the scoped policy in §4, not full admin.** |
| `AWS_SECRET_ACCESS_KEY` | Secret half. | Shown once at access-key creation; never retrievable afterward. |
| `AWS_API_ENDPOINT` | Full HTTP URL of the vLLM API on the EC2 instance. | `terraform output vllm_endpoint` after apply. |
| `AWS_GPU_INSTANCE_ID` | EC2 instance ID for inventory / health checks. | `terraform output instance_id`. |
| `INFERENCE_BACKEND` | `aws` to switch the gateway over. Default `local`. | Set last, only after the AWS backend health-checks pass. |

All these can be set via `/admin/integrations` (PR #19) once the Vercel API is wired (`VERCEL_TOKEN` + `VERCEL_PROJECT_ID` env vars on the Vercel project itself).

---

## 2. Provision the infrastructure (Terraform)

### 2a. Configure your variables

```bash
cd infra/aws/
cp terraform.tfvars.example terraform.tfvars
$EDITOR terraform.tfvars
```

Fill in:
- `region` — AWS region with `g6` family availability (`us-east-1`, `us-west-2`, `eu-west-1`, etc.).
- `ssh_pub_key` — paste your full public key (`cat ~/.ssh/id_ed25519.pub`).
- `allowed_ingress_cidr` — your office IP / VPN range. **Never leave at `0.0.0.0/0` in production.** Use https://checkip.amazonaws.com to find your current IP.
- `model_id` — Hugging Face model to serve. `meta-llama/Llama-3.1-8B-Instruct` is the Phase 3 baseline.

### 2b. Init + plan + apply

```bash
terraform init
terraform plan
# Read every line of the plan output. Look for any "destroy" or "replace" entries.
# On the first apply against a fresh AWS account you should only see "+create" entries.

terraform apply
# Type `yes` only after you've reviewed the plan.
# Apply takes 2–4 minutes for the EC2 instance + ~1 minute for everything else.
```

### 2c. Capture the outputs

```bash
terraform output
```

You should see:
- `instance_id` — `i-0abc…` (paste into `AWS_GPU_INSTANCE_ID`)
- `public_dns` — `ec2-x-x-x-x.compute-1.amazonaws.com`
- `vllm_endpoint` — `http://ec2-x-x-x-x.compute-1.amazonaws.com:8000` (paste into `AWS_API_ENDPOINT`)
- `s3_bucket_name` — `cloudach-prod-models-abcd1234` (your model weights bucket)
- `log_group_name` — `/cloudach/prod/vllm`
- `ssh_command` — convenience SSH command

### 2d. Wait for vLLM to come up

The EC2 instance bootstraps vLLM via cloud-init. First boot takes 5–15 minutes (CUDA driver install + first model download). You can watch progress with:

```bash
# SSH in
ssh -i ~/.ssh/your-key ubuntu@<public_dns>

# Watch the cloud-init log
tail -f /var/log/cloudach-bootstrap.log

# Once it exits cleanly, check vLLM
sudo systemctl status vllm
curl http://localhost:8000/v1/models
```

If `vllm.service` is not active after 20 minutes, check `journalctl -u vllm` and the bootstrap log.

---

## 3. Wire Cloudach to talk to the AWS backend

### 3a. Set the env vars via `/admin/integrations`

1. Sign in to `https://cloudach.vercel.app/admin/integrations` as admin.
2. Find the **AWS** card.
3. Paste:
   - **Access key ID** — the `AKIA…` from §4 (scoped IAM user)
   - **Secret access key** — the secret half
   - **Region** — same as your `terraform.tfvars`
   - **Inference backend** — leave on `local` for now; flip to `aws` in step 3c.
4. Click **Test connection**. You should see "Connected to AWS. Account 123456789012 · arn:aws:iam::…".
5. Click **Save & redeploy**. Wait ~60s for the deploy.

### 3b. Set the endpoint env vars

`AWS_API_ENDPOINT` and `AWS_GPU_INSTANCE_ID` aren't in the integrations form yet (they're in the AwsInferenceBackend, not lib/aws.js). For now, set them directly in the Vercel project:

1. Vercel Dashboard → your **cloudach** project → Settings → Environment Variables.
2. Add `AWS_API_ENDPOINT` = `http://<public_dns>:8000` (from `terraform output`).
3. Add `AWS_GPU_INSTANCE_ID` = `i-…`.
4. Redeploy.

(A future PR will surface these in `/admin/integrations` so they don't need a manual Vercel step.)

### 3c. Flip the inference backend

Once §3a + §3b are done and the EC2 instance's vLLM is healthy:

1. Back to `/admin/integrations` → AWS card.
2. **Inference backend** field → set to `aws`.
3. **Test connection** (validates AWS creds, doesn't change backend yet).
4. **Save & redeploy**.

After the deploy completes, the Cloudach API gateway routes `/v1/chat/completions` to the EC2 vLLM instance instead of the local mock. Verify:

```bash
curl -X POST https://cloudach.vercel.app/v1/chat/completions \
  -H "Authorization: Bearer <a real cloudach API key>" \
  -H "Content-Type: application/json" \
  -d '{"model":"llama3-8b","messages":[{"role":"user","content":"Hello!"}]}'
```

Should return a real Llama response within a few seconds.

---

## 4. IAM policy for the runtime IAM user

The IAM user whose access key you pasted in §3a should have **only the permissions Cloudach actually needs at runtime**, not full admin. Attach this inline policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DescribeOwnedResources",
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances",
        "ec2:DescribeInstanceStatus",
        "ec2:DescribeRegions",
        "cloudwatch:GetMetricStatistics",
        "cloudwatch:ListMetrics",
        "ce:GetCostAndUsage",
        "sts:GetCallerIdentity"
      ],
      "Resource": "*"
    },
    {
      "Sid": "ReadModelWeights",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": [
        "arn:aws:s3:::cloudach-*-models-*",
        "arn:aws:s3:::cloudach-*-models-*/*"
      ]
    }
  ]
}
```

The Terraform-provisioned EC2 instance uses a **different** IAM role (defined in `infra/aws/iam.tf`) — the runtime user above is for the Cloudach app's own AWS calls (cost queries, instance health checks).

---

## 5. Cost estimate per region / GPU type

Spot pricing varies — these are on-demand monthly running 24/7, rounded:

| Region | g6.xlarge (1× L4) | g6.2xlarge (1× L4, more CPU) | g5.xlarge (1× A10G) | g5.2xlarge (1× A10G, more CPU) |
|--------|-----:|-----:|-----:|-----:|
| us-east-1 | $580 | $700 | $730 | $880 |
| us-east-2 | $580 | $700 | $730 | $880 |
| us-west-2 | $605 | $730 | $760 | $920 |
| eu-west-1 | $640 | $770 | $810 | $980 |
| ap-southeast-1 | $670 | $805 | $850 | $1,030 |

Add **~$30/mo** for storage + CloudWatch + modest data transfer.

Spot variants are typically 60–70% cheaper but can be interrupted — fine for batch / dev, risky for production. If you go spot, set a `spot_price` in the Terraform and monitor preemption rates.

---

## 6. EKS migration (when you outgrow single-node)

The current `infra/aws/` is single-node EC2 — fine for MVP, the Phase 3 baseline (1 customer / dev workload) and small early-customer load. You'll want EKS when:

- You need >4 GPUs across the same vLLM cluster (multi-instance load balancing).
- You need blue-green / canary deploys without downtime.
- You need per-tenant isolation (separate vLLM pods per customer).
- You need automatic GPU spot/on-demand mixing with KEDA.

The migration path:

1. Keep `infra/aws/` for the legacy single-node (rename to `infra/aws/single-node/`).
2. Add `infra/aws/eks/` with the EKS cluster, vLLM Helm chart, KEDA scaler, autoscaling group.
3. Update `services/api-gateway/src/lib/inference/AwsInferenceBackend.js` to talk to the EKS-fronted ALB instead of a single EC2 IP.
4. Phase the cutover: route 10% of traffic, then 50%, then 100% as confidence builds.

This is a quarter+ of work. Don't start until single-node is genuinely too small.

---

## 7. RDS as Postgres alternative (optional)

Cloudach uses **Neon** for Postgres today. Neon is great for serverless + branching, painful for low-latency workloads where the cold-start hits matter. RDS migration if you outgrow Neon:

1. Provision RDS Postgres (single-AZ for dev, multi-AZ for prod) via separate Terraform under `infra/aws/rds/` (not yet written).
2. Run a `pg_dump | pg_restore` from Neon to RDS during a maintenance window.
3. Update `DATABASE_URL` env var on Vercel; redeploy.
4. Run smoke tests, then cancel the Neon plan.

**Not in scope for MVP.** Neon's free tier is generous.

---

## 8. Production hardening (deferred)

The current `infra/aws/` is intentionally minimal. Before serving real paying customers you'll want:

- **Remote Terraform state** (S3 bucket + DynamoDB lock table) so multiple operators don't trample state.
- **Multi-AZ**: spread the vLLM instance(s) across at least two AZs behind an ALB.
- **TLS**: terminate HTTPS at an ALB (or CloudFront) in front of the EC2 instance instead of plain HTTP on port 8000.
- **WAF rules** at the CloudFront layer.
- **Tighter security groups**: instead of `allowed_ingress_cidr = 0.0.0.0/0`, lock to the ALB's security group only.
- **Backups**: enable automated EBS snapshots on the root volume.
- **Secrets**: move IAM access keys to AWS Secrets Manager; have Cloudach pull at startup instead of via env vars. Rotation becomes a one-button thing.

Each of these is its own follow-up PR.

---

## 9. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `terraform apply` fails on `random_id.suffix` | `random` provider not initialized | Re-run `terraform init` |
| `terraform apply` fails with `InvalidKeyPair.Duplicate` | Key with the same name already exists in the region | `terraform import aws_key_pair.vllm <name>` or change `name_prefix` |
| EC2 instance launches but vLLM never starts | Cloud-init failed; CUDA driver missing | SSH in, check `/var/log/cloudach-bootstrap.log` and `dmesg` for NVIDIA driver errors. May need a different AMI for newer GPU families. |
| `curl :8000/v1/models` returns connection refused | vLLM still starting, or systemd unit failed | `sudo systemctl status vllm`; if active but no port, check `journalctl -u vllm` |
| `/admin/integrations` Test Connection fails for AWS | IAM user policy too narrow OR access key disabled | Verify IAM policy matches §4; check IAM Console → Users → Access keys → Status |
| AWS panel on `/admin` still shows NOT_CONFIGURED after save | Vercel deploy hasn't finished, or env var didn't set | Vercel Dashboard → Deployments → confirm READY; Settings → Env vars → confirm `AWS_REGION` + `AWS_ACCESS_KEY_ID` present |
| vLLM serves requests but is much slower than expected | First-call cold path: model loads to GPU (30s); subsequent calls are fast. Or CPU oversubscription. | Send 5 warm-up requests on instance start. Check `nvidia-smi` for GPU utilization. |
| EBS root volume fills up | Multiple model weights cached, log files growing | `df -h`; clear `/var/lib/vllm/hf-cache/`; bump `ebs_root_size_gb` and `terraform apply` |

---

## 10. Where each env var is read

| Env var | File | Notes |
|---------|------|-------|
| `AWS_REGION` | `lib/aws.js` (`getAwsConfig()`); `services/api-gateway/src/lib/inference/AwsInferenceBackend.js` | Both layers read it. |
| `AWS_ACCESS_KEY_ID` | `lib/aws.js` (`isAwsConfigured()`); future CloudWatch / Cost Explorer queries | Boolean check today; SDK use later. |
| `AWS_SECRET_ACCESS_KEY` | (same) | Companion to `AWS_ACCESS_KEY_ID`; never logged. |
| `AWS_API_ENDPOINT` | `services/api-gateway/src/lib/inference/AwsInferenceBackend.js` | Full vLLM URL the gateway proxies to. |
| `AWS_GPU_INSTANCE_ID` | (same) | Used for log/metric tagging. |
| `INFERENCE_BACKEND` | `services/api-gateway/src/lib/inference/index.js` | Switches the factory between `LocalInferenceBackend` and `AwsInferenceBackend`. |
