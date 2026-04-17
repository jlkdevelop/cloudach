output "instance_id" {
  description = "EC2 instance ID running vLLM."
  value       = aws_instance.vllm.id
}

output "public_ip" {
  description = "Public IPv4 address of the vLLM instance."
  value       = aws_instance.vllm.public_ip
}

output "public_dns" {
  description = "Public DNS hostname (use this in AWS_API_ENDPOINT)."
  value       = aws_instance.vllm.public_dns
}

output "vllm_endpoint" {
  description = "Full HTTPS-style URL for the vLLM API. Note: this is HTTP, not HTTPS — terminate TLS upstream (CloudFront / ALB) before exposing publicly."
  value       = "http://${aws_instance.vllm.public_dns}:8000"
}

output "s3_bucket_name" {
  description = "S3 bucket holding model weights."
  value       = aws_s3_bucket.models.bucket
}

output "s3_bucket_arn" {
  description = "S3 bucket ARN."
  value       = aws_s3_bucket.models.arn
}

output "log_group_name" {
  description = "CloudWatch log group for vLLM logs."
  value       = aws_cloudwatch_log_group.vllm.name
}

output "iam_role_arn" {
  description = "IAM role attached to the EC2 instance."
  value       = aws_iam_role.vllm.arn
}

output "ssh_command" {
  description = "Convenience SSH command. Replace the .pem path with your private key."
  value       = "ssh -i ~/.ssh/your-key.pem ubuntu@${aws_instance.vllm.public_dns}"
}
