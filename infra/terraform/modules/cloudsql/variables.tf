variable "project_id" {
  type = string
}

variable "primary_region" {
  type = string
}

variable "replica_regions" {
  type    = list(string)
  default = []
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "network_id" {
  description = "VPC network ID for private IP"
  type        = string
}

variable "tier" {
  description = "Cloud SQL machine tier"
  type        = string
  default     = "db-n1-standard-4"
}

variable "disk_size_gb" {
  type    = number
  default = 100
}
