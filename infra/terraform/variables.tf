variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for cloudach.com"
  type        = string
}

variable "db_password" {
  description = "Cloud SQL postgres password"
  type        = string
  sensitive   = true
}

variable "regions" {
  description = "GCP regions to deploy to"
  type        = list(string)
  default     = ["us-central1", "europe-west4", "asia-southeast1"]
}

variable "primary_region" {
  description = "Primary GCP region (Cloud SQL write primary)"
  type        = string
  default     = "us-central1"
}
