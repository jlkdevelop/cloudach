# IAM role + instance profile attached to the EC2 instance. Grants
# scoped access to the model-weights S3 bucket and the CloudWatch log
# group — nothing else.

data "aws_iam_policy_document" "ec2_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "vllm" {
  name               = "${local.name_prefix}-vllm-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_assume.json
}

data "aws_iam_policy_document" "vllm_inline" {
  # Read model weights from the dedicated bucket
  statement {
    sid     = "S3ModelWeightsRead"
    effect  = "Allow"
    actions = [
      "s3:GetObject",
      "s3:ListBucket",
    ]
    resources = [
      aws_s3_bucket.models.arn,
      "${aws_s3_bucket.models.arn}/*",
    ]
  }

  # Push logs to the dedicated CloudWatch log group
  statement {
    sid     = "CloudWatchLogsPush"
    effect  = "Allow"
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
      "logs:DescribeLogStreams",
    ]
    resources = [
      "${aws_cloudwatch_log_group.vllm.arn}:*",
    ]
  }

  # Allow the instance to publish custom metrics to the cloudach namespace
  statement {
    sid       = "CloudWatchMetricsPut"
    effect    = "Allow"
    actions   = ["cloudwatch:PutMetricData"]
    resources = ["*"]

    condition {
      test     = "StringEquals"
      variable = "cloudwatch:namespace"
      values   = ["cloudach/inference"]
    }
  }
}

resource "aws_iam_role_policy" "vllm" {
  name   = "${local.name_prefix}-vllm-policy"
  role   = aws_iam_role.vllm.id
  policy = data.aws_iam_policy_document.vllm_inline.json
}

resource "aws_iam_instance_profile" "vllm" {
  name = "${local.name_prefix}-vllm-profile"
  role = aws_iam_role.vllm.name
}
