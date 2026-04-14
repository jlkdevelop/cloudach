terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.25"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
  }

  backend "s3" {
    bucket         = "cloudach-terraform-state"
    key            = "cloudach/aws/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "cloudach-terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "cloudach"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# -----------------------------------------------------------------------------
# VPC
# -----------------------------------------------------------------------------
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "cloudach-${var.environment}"
  cidr = var.vpc_cidr

  azs             = data.aws_availability_zones.available.names
  public_subnets  = var.public_subnet_cidrs
  private_subnets = var.private_subnet_cidrs

  enable_nat_gateway     = true
  single_nat_gateway     = var.environment == "staging" ? true : false
  one_nat_gateway_per_az = var.environment == "production" ? true : false

  enable_dns_hostnames = true
  enable_dns_support   = true

  # Required for ALB controller
  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
  }
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb"                    = "1"
    "kubernetes.io/cluster/cloudach-${var.environment}" = "owned"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

# -----------------------------------------------------------------------------
# EKS Cluster
# -----------------------------------------------------------------------------
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "cloudach-${var.environment}"
  cluster_version = "1.29"

  vpc_id                         = module.vpc.vpc_id
  subnet_ids                     = module.vpc.private_subnets
  cluster_endpoint_public_access = true

  # Managed add-ons
  cluster_addons = {
    coredns                = { most_recent = true }
    kube-proxy             = { most_recent = true }
    vpc-cni                = { most_recent = true }
    aws-ebs-csi-driver     = { most_recent = true }
    aws-efs-csi-driver     = { most_recent = true }
  }

  # CPU node group — api-gateway, Redis, misc
  eks_managed_node_groups = {
    cpu = {
      name           = "cloudach-cpu"
      instance_types = ["t3.large"]
      capacity_type  = "SPOT"

      min_size     = 2
      max_size     = 10
      desired_size = 2

      labels = {
        role = "cpu"
      }
    }

    gpu = {
      name           = "cloudach-gpu"
      instance_types = var.gpu_instance_types
      capacity_type  = "SPOT"

      min_size     = 0
      max_size     = 8
      desired_size = 0

      # NVIDIA taint keeps non-GPU pods off GPU nodes
      taints = [
        {
          key    = "nvidia.com/gpu"
          value  = "true"
          effect = "NO_SCHEDULE"
        }
      ]

      labels = {
        role                              = "gpu"
        "nvidia.com/gpu"                  = "true"
        "k8s.amazonaws.com/accelerator"   = "nvidia-tesla-t4"
      }

      block_device_mappings = {
        xvda = {
          device_name = "/dev/xvda"
          ebs = {
            volume_size           = 100
            volume_type           = "gp3"
            delete_on_termination = true
          }
        }
      }
    }
  }

  # IRSA for cluster-autoscaler
  enable_irsa = true
}

# -----------------------------------------------------------------------------
# RDS — Aurora PostgreSQL
# -----------------------------------------------------------------------------
module "rds" {
  source  = "terraform-aws-modules/rds-aurora/aws"
  version = "~> 9.0"

  name           = "cloudach-${var.environment}"
  engine         = "aurora-postgresql"
  engine_version = "15.4"
  instance_class = var.rds_instance_class

  instances = {
    writer = {}
    reader = {}
  }

  vpc_id               = module.vpc.vpc_id
  db_subnet_group_name = module.vpc.database_subnet_group_name
  security_group_rules = {
    eks_ingress = {
      source_security_group_id = module.eks.node_security_group_id
    }
  }

  storage_encrypted   = true
  apply_immediately   = var.environment == "staging" ? true : false
  skip_final_snapshot = var.environment == "staging" ? true : false

  manage_master_user_password = true
  master_username             = "cloudach"

  database_name = "cloudach"
}

# -----------------------------------------------------------------------------
# ElastiCache — Redis
# -----------------------------------------------------------------------------
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id = "cloudach-${var.environment}"
  description          = "Cloudach Redis — rate limits, request queue"

  engine               = "redis"
  engine_version       = "7.0"
  node_type            = var.redis_node_type
  num_cache_clusters   = var.environment == "production" ? 2 : 1
  port                 = 6379

  subnet_group_name  = aws_elasticache_subnet_group.redis.name
  security_group_ids = [aws_security_group.redis.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = true

  automatic_failover_enabled = var.environment == "production" ? true : false
}

resource "aws_elasticache_subnet_group" "redis" {
  name       = "cloudach-redis-${var.environment}"
  subnet_ids = module.vpc.private_subnets
}

# -----------------------------------------------------------------------------
# S3 — Model weights
# -----------------------------------------------------------------------------
resource "aws_s3_bucket" "models" {
  bucket = "cloudach-models-${var.environment}-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_versioning" "models" {
  bucket = aws_s3_bucket.models.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "models" {
  bucket = aws_s3_bucket.models.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "models" {
  bucket                  = aws_s3_bucket.models.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

data "aws_caller_identity" "current" {}

# -----------------------------------------------------------------------------
# EFS — Shared model cache for GPU nodes
# -----------------------------------------------------------------------------
resource "aws_efs_file_system" "model_cache" {
  creation_token = "cloudach-model-cache-${var.environment}"
  encrypted      = true

  lifecycle_policy {
    transition_to_ia = "AFTER_30_DAYS"
  }

  tags = {
    Name = "cloudach-model-cache-${var.environment}"
  }
}

resource "aws_efs_mount_target" "model_cache" {
  for_each = toset(module.vpc.private_subnets)

  file_system_id  = aws_efs_file_system.model_cache.id
  subnet_id       = each.value
  security_groups = [aws_security_group.efs.id]
}

resource "aws_efs_access_point" "vllm" {
  file_system_id = aws_efs_file_system.model_cache.id

  posix_user {
    uid = 1000
    gid = 1000
  }

  root_directory {
    path = "/models"
    creation_info {
      owner_uid   = 1000
      owner_gid   = 1000
      permissions = "755"
    }
  }
}

# -----------------------------------------------------------------------------
# ECR repositories
# -----------------------------------------------------------------------------
resource "aws_ecr_repository" "api_gateway" {
  name                 = "cloudach/api-gateway"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "api_gateway" {
  repository = aws_ecr_repository.api_gateway.name

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 20 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 20
      }
      action = { type = "expire" }
    }]
  })
}

# -----------------------------------------------------------------------------
# Security Groups
# -----------------------------------------------------------------------------
resource "aws_security_group" "redis" {
  name        = "cloudach-redis-${var.environment}"
  description = "ElastiCache Redis — allow EKS nodes only"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "efs" {
  name        = "cloudach-efs-${var.environment}"
  description = "EFS model cache — allow EKS GPU nodes only"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 2049
    to_port         = 2049
    protocol        = "tcp"
    security_groups = [module.eks.node_security_group_id]
  }
}

# -----------------------------------------------------------------------------
# Secrets Manager
# -----------------------------------------------------------------------------
resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "cloudach/${var.environment}/jwt-secret"
  recovery_window_in_days = var.environment == "production" ? 30 : 0
}

resource "aws_secretsmanager_secret" "hf_token" {
  name                    = "cloudach/${var.environment}/hf-token"
  recovery_window_in_days = var.environment == "production" ? 30 : 0
}
