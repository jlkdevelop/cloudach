terraform {
  required_version = ">= 1.6"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
  backend "gcs" {
    bucket = "cloudach-tfstate"
    prefix = "multi-region"
  }
}

provider "google" {
  project = var.project_id
}

provider "cloudflare" {
  # API token sourced from CLOUDFLARE_API_TOKEN env var
}

# ---------------------------------------------------------------------------
# VPCs — one per region with private Google access
# ---------------------------------------------------------------------------
resource "google_compute_network" "cloudach" {
  for_each                = toset(var.regions)
  name                    = "cloudach-vpc-${each.key}"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "cloudach" {
  for_each      = toset(var.regions)
  name          = "cloudach-subnet-${each.key}"
  region        = each.key
  network       = google_compute_network.cloudach[each.key].id
  ip_cidr_range = local.subnet_cidrs[each.key]

  private_ip_google_access = true

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = local.pod_cidrs[each.key]
  }
  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = local.svc_cidrs[each.key]
  }
}

locals {
  subnet_cidrs = {
    "us-central1"      = "10.0.0.0/20"
    "europe-west4"     = "10.1.0.0/20"
    "asia-southeast1"  = "10.2.0.0/20"
  }
  pod_cidrs = {
    "us-central1"      = "10.10.0.0/16"
    "europe-west4"     = "10.11.0.0/16"
    "asia-southeast1"  = "10.12.0.0/16"
  }
  svc_cidrs = {
    "us-central1"      = "10.20.0.0/20"
    "europe-west4"     = "10.21.0.0/20"
    "asia-southeast1"  = "10.22.0.0/20"
  }
}

# ---------------------------------------------------------------------------
# GKE clusters — one per region
# ---------------------------------------------------------------------------
module "gke" {
  for_each = toset(var.regions)
  source   = "./modules/gke-region"

  project_id  = var.project_id
  region      = each.key
  cluster_name = "cloudach-${replace(each.key, "-", "")}"
  network     = google_compute_network.cloudach[each.key].name
  subnetwork  = google_compute_subnetwork.cloudach[each.key].name
}

# ---------------------------------------------------------------------------
# Cloud SQL — HA primary in primary_region, read replicas in other regions
# ---------------------------------------------------------------------------
module "cloudsql" {
  source = "./modules/cloudsql"

  project_id      = var.project_id
  primary_region  = var.primary_region
  replica_regions = [for r in var.regions : r if r != var.primary_region]
  db_password     = var.db_password
  network_id      = google_compute_network.cloudach[var.primary_region].id
}
