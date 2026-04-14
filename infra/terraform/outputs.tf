output "gke_cluster_names" {
  description = "GKE cluster names by region"
  value       = { for k, v in module.gke : k => v.cluster_name }
}

output "gke_endpoints" {
  description = "GKE cluster API endpoints by region"
  value       = { for k, v in module.gke : k => v.endpoint }
  sensitive   = true
}

output "cloudsql_primary_ip" {
  description = "Cloud SQL primary instance private IP"
  value       = module.cloudsql.primary_ip
  sensitive   = true
}

output "cloudsql_replica_ips" {
  description = "Cloud SQL read replica private IPs by region"
  value       = module.cloudsql.replica_ips
  sensitive   = true
}
