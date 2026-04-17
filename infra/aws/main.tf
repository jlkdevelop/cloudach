provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project     = "cloudach"
      Environment = var.environment
      ManagedBy   = "terraform"
      Stack       = "infra/aws"
    }
  }
}

# Single random suffix used to disambiguate globally-unique resource names
# (S3 bucket, primarily). Persists across plans via terraform.tfstate.
resource "random_id" "suffix" {
  byte_length = 4
}

locals {
  name_prefix = "${var.name_prefix}-${var.environment}"
  bucket_name = "${local.name_prefix}-models-${random_id.suffix.hex}"
}
