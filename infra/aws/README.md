# `infra/aws/` — Cloudach AWS Terraform

> **Scope:** EC2 + vLLM single-node MVP. EKS is intentionally out of scope until we need multi-GPU, multi-AZ, or per-tenant isolation — see §6 of `docs/setup/aws.md` for the migration path.

## ⚠️ Do not `terraform apply` without operator authorization

These files declare cloud resources that **cost real money and persist after the agent's session ends**. The CLO-1 ground rules are explicit: code-only here. Operator runs `terraform plan`/`apply` themselves with their own AWS credentials.

If you are an automated agent reading this: **do not** run `terraform init`, `terraform plan`, or `terraform apply` against this directory. Even `init` writes lock files that are operator-owned. Confine yourself to editing the `.tf` files.

## What this Terraform creates

When applied, this stack provisions:

1. **VPC** with one public subnet in the default region's first AZ. Internet gateway + route table for public egress.
2. **Security group** allowing inbound SSH (port 22) from a CIDR you specify (default: your IP) and inbound vLLM API (port 8000) from the same CIDR. Egress all.
3. **IAM role + instance profile** with policies for:
   - `s3:GetObject` on the model-weights bucket (so the EC2 instance can pull weights at boot)
   - `logs:CreateLogStream` + `logs:PutLogEvents` on the CloudWatch log group
4. **S3 bucket** for model weights with versioning, server-side encryption (AES256), and public-access blocked.
5. **CloudWatch log group** with 30-day retention.
6. **EC2 instance** (default `g6.xlarge`, 1× L4 GPU) with cloud-init bootstrap that:
   - Installs Python 3.11 + CUDA + vLLM
   - Pulls a chosen model from the S3 bucket (or directly from HuggingFace if `s3_model_uri` is empty)
   - Starts vLLM on port 8000 as a `systemd` service named `vllm.service`

The instance is the inference backend that `services/api-gateway/src/lib/inference/AwsInferenceBackend.js` will route to once `INFERENCE_BACKEND=aws` is set in the app's env. See `docs/setup/aws.md` for the full wiring.

## Files

| File | Purpose |
|------|---------|
| `versions.tf` | Terraform + AWS provider pins |
| `main.tf` | Provider configuration |
| `variables.tf` | Inputs (region, instance type, SSH key, etc.) |
| `vpc.tf` | VPC, public subnet, IGW, route table |
| `security_groups.tf` | SSH + vLLM ingress + egress all |
| `iam.tf` | EC2 instance role/profile + S3/CloudWatch policies |
| `s3.tf` | Model-weights bucket (versioned, encrypted, public-blocked) |
| `cloudwatch.tf` | Log group + retention |
| `ec2.tf` | g6.xlarge with vLLM bootstrap user-data |
| `outputs.tf` | Instance ID, public IP/DNS, bucket name, log group |
| `terraform.tfvars.example` | Copy to `terraform.tfvars` and fill in your values |
| `.gitignore` | Ignores `*.tfvars`, `.terraform/`, `*.tfstate*` |

## How operator runs this (short version)

Detailed instructions in `docs/setup/aws.md`. TL;DR:

```bash
cd infra/aws/
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values (SSH pub key, allowed CIDR, etc.)
terraform init
terraform plan       # review every line of the diff
terraform apply      # only when you've reviewed the plan
```

The `terraform apply` output prints the public DNS and S3 bucket name. Plug those into Cloudach via `/admin/integrations` (PR #19) — no manual env-var editing needed.

## Estimated monthly cost

Single g6.xlarge running 24/7 in `us-east-1`:

| Component | $/month |
|-----------|--------:|
| g6.xlarge on-demand | $580 |
| 100 GB gp3 EBS root volume | $8 |
| S3 (50 GB model weights, standard) | $1 |
| CloudWatch log ingestion (~1 GB/day) | $15 |
| Data transfer (modest) | $5 |
| **Total** | **≈$610/mo** |

Spot-instance variants reduce GPU cost ~60% but lose the persistence guarantee; see `docs/setup/aws.md` §5.

## What this Terraform does NOT do

- **No EKS.** Single-node only. When we need multi-instance vLLM with auto-scaling, blue-green, or tenant isolation, we'll write a separate `infra/aws/eks/` stack.
- **No RDS.** Cloudach uses Neon for Postgres today. RDS migration path documented in `docs/setup/aws.md` §7 (optional).
- **No remote state backend.** `terraform.tfstate` is local. Production-grade setups should switch to S3 + DynamoDB locking — see `docs/setup/aws.md` §8.
- **No `aws-auth` ConfigMap, no service mesh, no autoscaling group.** These are all multi-instance concerns.
- **No vLLM model fine-tuning infrastructure.** Out of MVP scope per CLO-1.

## Validation status

These files have been written but **not** `terraform validate`'d, `plan`'d, or `apply`'d in this branch. Operator should run `terraform validate` first to catch HCL syntax / type errors, then `terraform plan` to see what would happen.

The configuration is conservative — uses well-known AWS resource types, no exotic providers, no remote module sources — so `validate` should pass without surprises. If `plan` reveals an issue, file an issue on CLO-1 with the error and the agent will iterate.
