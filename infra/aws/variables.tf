variable "region" {
  description = "AWS region. Pick one with g6 family availability."
  type        = string
  default     = "us-east-1"

  validation {
    condition     = can(regex("^[a-z]{2}-[a-z]+-\\d$", var.region))
    error_message = "region must be a valid AWS region slug (e.g. us-east-1)."
  }
}

variable "environment" {
  description = "Environment name suffix used in resource names (e.g. dev, staging, prod)."
  type        = string
  default     = "prod"
}

variable "name_prefix" {
  description = "Prefix applied to all named resources."
  type        = string
  default     = "cloudach"
}

variable "instance_type" {
  description = "EC2 GPU instance type. g6.xlarge = 1× L4 (Phase 3 pricing baseline)."
  type        = string
  default     = "g6.xlarge"
}

variable "ssh_pub_key" {
  description = "SSH public key (OpenSSH format) authorized to connect to the EC2 instance. Required."
  type        = string
}

variable "allowed_ingress_cidr" {
  description = "CIDR allowed to reach SSH (22) and the vLLM API (8000). Default 0.0.0.0/0 — tighten before production."
  type        = string
  default     = "0.0.0.0/0"
}

variable "model_id" {
  description = "Hugging Face model id the vLLM service serves on first boot."
  type        = string
  default     = "meta-llama/Llama-3.1-8B-Instruct"
}

variable "log_retention_days" {
  description = "CloudWatch log group retention. 30 = sane default; 0 = forever."
  type        = number
  default     = 30
}

variable "ebs_root_size_gb" {
  description = "Root EBS volume size for the EC2 instance. vLLM + a couple of model weights need ≥80 GB."
  type        = number
  default     = 100
}
