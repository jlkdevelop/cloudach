resource "aws_cloudwatch_log_group" "vllm" {
  name              = "/cloudach/${var.environment}/vllm"
  retention_in_days = var.log_retention_days

  tags = {
    Name = "${local.name_prefix}-vllm-logs"
  }
}
