output "primary_ip" {
  value     = google_sql_database_instance.primary.private_ip_address
  sensitive = true
}

output "replica_ips" {
  value     = { for k, v in google_sql_database_instance.replica : k => v.private_ip_address }
  sensitive = true
}

output "primary_instance_name" {
  value = google_sql_database_instance.primary.name
}
