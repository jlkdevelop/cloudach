# Security Baseline — Cloudach

> Last updated: 2026-04-14
> Owner: DevOps Engineer

This document captures the security controls in place and the gaps to address.

---

## 1. Secrets Management

### Current State ✅
- All secrets (DB credentials, JWT secret, Redis URL, HuggingFace token) are stored in Kubernetes Secrets.
- Secrets are referenced via `secretKeyRef` in deployments — never hardcoded in images or YAML.
- GitHub Actions uses repository secrets (`GCP_SA_KEY`, `VERCEL_TOKEN`, etc.) managed through the GitHub Secrets UI.

### Required Actions
- [ ] **Enable GCP Secret Manager** and use the [External Secrets Operator](https://external-secrets.io/) to sync secrets into the cluster. This provides audit logs, rotation, and fine-grained IAM.
- [ ] **Enable Kubernetes Secret encryption at rest** (GKE Application-layer encryption using Cloud KMS).
- [ ] **Rotate all secrets quarterly**; automate rotation via Secret Manager + ESO.
- [ ] Remove `PROJECT_ID` placeholder from `namespace.yaml` — substitute at deploy time via CI.

---

## 2. CI/CD Security

### Current State ✅
- GitHub Actions workflows use pinned action versions (`@v4`, `@v3`).
- Docker builds use layer caching but **do not push** on PRs — only on push to `main`.
- Deployment to GKE gated on `production` GitHub environment (requires approval).

### Controls Added
- **Gitleaks** secret scanning on every push and PR.
- **Trivy** container image scanning (CRITICAL+HIGH, ignores unfixed) — blocks CI on critical vulns.
- **Trivy filesystem scan** for IaC and dependency vulnerabilities.
- **CodeQL** SAST for JavaScript (frontend + api-gateway).
- **`npm audit --audit-level=high`** for both `cloudach` and `api-gateway` packages.

### Required Actions
- [ ] Pin all GitHub Actions to exact SHA (e.g., `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683`) for supply-chain security.
- [ ] Add `permissions:` block to all workflow jobs — restrict to least privilege.
- [ ] Add `CODEOWNERS` file to require review from infra team on `infra/` and `.github/` changes.

---

## 3. Kubernetes RBAC

### Current State ✅
- `cloudach-deployer` Role grants only `apps/deployments`, `services`, `configmaps`, `secrets`, and `pods` — no cluster-admin.
- `cloudach-ci-sa` ServiceAccount is bound to the role via `RoleBinding` (namespace-scoped, not ClusterRoleBinding).
- Workload Identity annotation on ServiceAccount links to least-privilege GCP SA.

### Required Actions
- [ ] Audit and confirm the GCP SA `cloudach-ci@PROJECT_ID.iam.gserviceaccount.com` has only the minimum roles: `roles/container.developer` + `roles/artifactregistry.writer`.
- [ ] Enable **GKE Autopilot** or **Workload Identity** for all pods — no node-level SA escalation.
- [ ] Bind `cloudach-deployer` only to CI SA, not to all authenticated users.

---

## 4. Network Security

### Current State ✅
- `NetworkPolicy` manifests enforce:
  - **Default deny-all** ingress and egress for the `cloudach` namespace.
  - API Gateway: inbound from GKE L7 LB and Prometheus only; outbound to vLLM, DNS, and external HTTPS.
  - vLLM: inbound from api-gateway and Prometheus only; outbound to HuggingFace Hub and DNS.
- GKE Ingress with managed SSL certificate (`cloudach-ssl-cert`), HTTPS redirect enforced.
- `ClusterIP` services — neither api-gateway nor vLLM are directly exposed externally.

### Required Actions
- [ ] Enable **GKE Binary Authorization** — only signed images from Artifact Registry allowed.
- [ ] Enable **VPC Service Controls** around GKE and Artifact Registry.
- [ ] Review Ingress IP allowlist — restrict admin endpoints to VPN IP ranges.

---

## 5. Container Security

### Current State
- vLLM runs as root inside the container (upstream image default).
- api-gateway image not yet audited for user context.

### Required Actions
- [ ] Add `securityContext` to all pod specs:
  ```yaml
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    readOnlyRootFilesystem: true
    allowPrivilegeEscalation: false
    capabilities:
      drop: ["ALL"]
  ```
- [ ] Set `PodDisruptionBudget` for api-gateway (minAvailable: 1) to prevent zero-replica deploys.
- [ ] Enable GKE **Container-Optimized OS** nodes with auto-upgrade.

---

## 6. Dependency Management

### Controls Added ✅
- `npm audit --audit-level=high` runs on every CI push and PR.
- Trivy filesystem scan covers Node.js `package-lock.json` for CVEs.

### Required Actions
- [ ] Add **Dependabot** (`/.github/dependabot.yml`) for automated dependency PRs.
- [ ] Pin `vllm/vllm-openai` to a specific image digest in production.

---

## 7. No-Hardcoded-Credentials Check

A grep of the repo confirms no hardcoded secrets:
```
grep -r "password\s*=\s*['\"]" --include="*.js" --include="*.ts" --include="*.json" . 
# (excluding node_modules, .git)
```
Gitleaks CI job enforces this on every commit going forward.

---

## 8. Outstanding High-Priority Items

| Priority | Item | Owner | Due |
|----------|------|-------|-----|
| High | Replace `PROJECT_ID` placeholder in k8s YAMLs | DevOps | Sprint 1 |
| High | Enable GCP Secret Manager + ESO | DevOps | Sprint 1 |
| High | Add `securityContext` (non-root) to all pods | DevOps | Sprint 1 |
| Medium | Pin GitHub Actions to SHA digests | DevOps | Sprint 2 |
| Medium | Add `CODEOWNERS` | DevOps | Sprint 2 |
| Medium | Dependabot configuration | DevOps | Sprint 2 |
| Medium | GKE Binary Authorization | DevOps | Sprint 2 |
| Low | VPC Service Controls | DevOps | Sprint 3 |
