# ---------------------------------------------------------------------------
# Cloudflare — Global Load Balancer + Cache Rules
# ---------------------------------------------------------------------------

# Health checks for each origin region
resource "cloudflare_healthcheck" "api" {
  for_each = {
    "us"   = "us-central1"
    "eu"   = "europe-west4"
    "apac" = "asia-southeast1"
  }

  zone_id  = var.cloudflare_zone_id
  name     = "cloudach-api-${each.key}"
  type     = "HTTPS"
  path     = "/health"
  interval = 30
  retries  = 2
  timeout  = 10

  # address filled by external load balancer IPs (outputs from GKE ingress)
  address = "api-${each.key}.cloudach.com"

  check_regions = ["WNAM", "ENAM", "WEU", "EEU", "SEAS", "NEAS"]
}

# Origin pools — one per region
resource "cloudflare_load_balancer_pool" "api" {
  for_each = {
    "us"   = { region = "us-central1",     address_placeholder = "api-us.cloudach.com" }
    "eu"   = { region = "europe-west4",    address_placeholder = "api-eu.cloudach.com" }
    "apac" = { region = "asia-southeast1", address_placeholder = "api-apac.cloudach.com" }
  }

  account_id         = var.cloudflare_account_id
  name               = "cloudach-api-${each.key}"
  monitor            = cloudflare_healthcheck.api[each.key].id
  notification_email = "ops@cloudach.com"

  origins {
    name    = "api-${each.key}"
    address = each.value.address_placeholder
    enabled = true
    weight  = 1
  }

  minimum_origins = 1
}

# Global load balancer — latency steering
resource "cloudflare_load_balancer" "api" {
  zone_id          = var.cloudflare_zone_id
  name             = "api.cloudach.com"
  fallback_pool_id = cloudflare_load_balancer_pool.api["us"].id
  default_pool_ids = [
    cloudflare_load_balancer_pool.api["us"].id,
    cloudflare_load_balancer_pool.api["eu"].id,
    cloudflare_load_balancer_pool.api["apac"].id,
  ]
  description  = "Cloudach API — latency-based global LB"
  proxied      = true
  steering_policy = "dynamic_latency"

  # Session affinity off — stateless inference requests
  session_affinity = "none"
}

# ---------------------------------------------------------------------------
# Cache Rules
# ---------------------------------------------------------------------------

# Rule 1: Bypass cache for all POST requests (inference)
resource "cloudflare_ruleset" "cache_rules" {
  zone_id = var.cloudflare_zone_id
  name    = "cloudach-cache-rules"
  kind    = "zone"
  phase   = "http_request_cache_settings"

  rules {
    description = "Bypass cache for POST (inference)"
    expression  = "(http.request.method eq \"POST\")"
    action      = "set_cache_settings"
    action_parameters {
      cache = false
    }
    enabled = true
  }

  rules {
    description = "Bypass cache for authenticated requests"
    expression  = "(http.request.headers[\"authorization\"][*] ne \"\")"
    action      = "set_cache_settings"
    action_parameters {
      cache = false
    }
    enabled = true
  }

  rules {
    description = "Cache /v1/models for 5 minutes"
    expression  = "(http.request.uri.path matches \"^/v1/models\")"
    action      = "set_cache_settings"
    action_parameters {
      cache = true
      edge_ttl {
        mode    = "override_origin"
        default = 300
      }
      browser_ttl {
        mode    = "override_origin"
        default = 60
      }
    }
    enabled = true
  }

  rules {
    description = "Cache /health for 30 seconds"
    expression  = "(http.request.uri.path eq \"/health\")"
    action      = "set_cache_settings"
    action_parameters {
      cache = true
      edge_ttl {
        mode    = "override_origin"
        default = 30
      }
    }
    enabled = true
  }
}
