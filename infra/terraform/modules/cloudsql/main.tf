resource "google_sql_database_instance" "primary" {
  name             = "cloudach-postgres-primary"
  database_version = "POSTGRES_16"
  region           = var.primary_region
  project          = var.project_id

  settings {
    tier              = var.tier
    availability_type = "REGIONAL"  # HA within primary region

    disk_size         = var.disk_size_gb
    disk_type         = "PD_SSD"
    disk_autoresize   = true

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      start_time                     = "03:00"
      backup_retention_settings {
        retained_backups = 7
      }
    }

    ip_configuration {
      ipv4_enabled    = false
      private_network = var.network_id
    }

    database_flags {
      name  = "max_connections"
      value = "500"
    }
  }

  deletion_protection = true
}

resource "google_sql_database" "cloudach" {
  name     = "cloudach"
  instance = google_sql_database_instance.primary.name
  project  = var.project_id
}

resource "google_sql_user" "cloudach" {
  name     = "cloudach"
  instance = google_sql_database_instance.primary.name
  password = var.db_password
  project  = var.project_id
}

# Cross-region read replicas
resource "google_sql_database_instance" "replica" {
  for_each = toset(var.replica_regions)

  name                 = "cloudach-postgres-${replace(each.key, "-", "")}-replica"
  database_version     = "POSTGRES_16"
  region               = each.key
  project              = var.project_id
  master_instance_name = google_sql_database_instance.primary.name

  replica_configuration {
    failover_target = false
  }

  settings {
    tier              = var.tier
    availability_type = "ZONAL"  # replicas are zonal — save cost

    disk_size       = var.disk_size_gb
    disk_type       = "PD_SSD"
    disk_autoresize = true

    ip_configuration {
      ipv4_enabled    = false
      private_network = var.network_id
    }
  }

  deletion_protection = true
}
