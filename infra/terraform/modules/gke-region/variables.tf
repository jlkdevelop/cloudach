variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "cluster_name" {
  type = string
}

variable "network" {
  type = string
}

variable "subnetwork" {
  type = string
}

variable "system_node_count" {
  description = "Number of always-on system nodes"
  type        = number
  default     = 2
}

variable "gpu_min_nodes" {
  description = "Minimum on-demand GPU nodes"
  type        = number
  default     = 1
}

variable "gpu_max_nodes" {
  description = "Maximum on-demand GPU nodes"
  type        = number
  default     = 4
}

variable "gpu_spot_max_nodes" {
  description = "Maximum spot GPU burst nodes"
  type        = number
  default     = 4
}
