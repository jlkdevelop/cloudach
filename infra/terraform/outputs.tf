output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS API server endpoint"
  value       = module.eks.cluster_endpoint
  sensitive   = true
}

output "eks_cluster_certificate_authority_data" {
  description = "EKS cluster CA certificate"
  value       = module.eks.cluster_certificate_authority_data
  sensitive   = true
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "private_subnets" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnets
}

output "rds_cluster_endpoint" {
  description = "RDS Aurora writer endpoint"
  value       = module.rds.cluster_endpoint
  sensitive   = true
}

output "rds_cluster_reader_endpoint" {
  description = "RDS Aurora reader endpoint"
  value       = module.rds.cluster_reader_endpoint
  sensitive   = true
}

output "redis_endpoint" {
  description = "ElastiCache primary endpoint"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
  sensitive   = true
}

output "s3_models_bucket" {
  description = "S3 bucket for model weights"
  value       = aws_s3_bucket.models.bucket
}

output "efs_file_system_id" {
  description = "EFS file system ID for model cache"
  value       = aws_efs_file_system.model_cache.id
}

output "efs_access_point_id" {
  description = "EFS access point ID for vLLM pods"
  value       = aws_efs_access_point.vllm.id
}

output "ecr_api_gateway_url" {
  description = "ECR repository URL for api-gateway"
  value       = aws_ecr_repository.api_gateway.repository_url
}
