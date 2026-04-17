# Latest Ubuntu 24.04 LTS AMI for the chosen region. AWS publishes these
# under the Canonical owner ID 099720109477.
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "architecture"
    values = ["x86_64"]
  }
}

resource "aws_key_pair" "vllm" {
  key_name   = "${local.name_prefix}-vllm-key"
  public_key = var.ssh_pub_key

  tags = {
    Name = "${local.name_prefix}-vllm-key"
  }
}

# cloud-init bootstrap for vLLM. The user-data script runs as root on
# first boot. It installs CUDA + Python + vLLM, then starts vLLM as a
# systemd unit serving the configured Hugging Face model on port 8000.
locals {
  user_data = <<-EOT
    #!/bin/bash
    set -euxo pipefail

    # Send everything to /var/log/cloud-init-output.log AND CloudWatch
    exec > >(tee /var/log/cloudach-bootstrap.log) 2>&1

    apt-get update -y
    apt-get install -y --no-install-recommends \
      python3.11 python3.11-venv python3-pip \
      build-essential git curl jq awscli unzip ca-certificates

    # Install NVIDIA driver (if not already present on the AMI). g6 instances
    # use L4 GPUs which require driver >= 535.
    if ! command -v nvidia-smi >/dev/null 2>&1; then
      apt-get install -y nvidia-driver-550 nvidia-utils-550
    fi

    # Install vLLM into a dedicated venv so system Python stays clean.
    python3.11 -m venv /opt/vllm-venv
    /opt/vllm-venv/bin/pip install --upgrade pip
    /opt/vllm-venv/bin/pip install vllm==0.4.2

    # Drop the systemd unit
    cat >/etc/systemd/system/vllm.service <<'UNIT'
    [Unit]
    Description=vLLM OpenAI-compatible inference server
    After=network-online.target
    Wants=network-online.target

    [Service]
    Type=simple
    User=root
    Environment=HOME=/root
    Environment=HF_HOME=/var/lib/vllm/hf-cache
    ExecStartPre=/bin/mkdir -p /var/lib/vllm/hf-cache
    ExecStart=/opt/vllm-venv/bin/python -m vllm.entrypoints.openai.api_server \
      --model ${var.model_id} \
      --host 0.0.0.0 \
      --port 8000 \
      --dtype auto
    Restart=on-failure
    RestartSec=10
    LimitNOFILE=65535
    StandardOutput=journal
    StandardError=journal

    [Install]
    WantedBy=multi-user.target
    UNIT

    systemctl daemon-reload
    systemctl enable vllm.service
    systemctl start vllm.service

    # CloudWatch agent for log shipping
    curl -s -o /tmp/awscw.deb https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
    dpkg -i /tmp/awscw.deb || true

    cat >/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json <<'CFG'
    {
      "logs": {
        "logs_collected": {
          "files": {
            "collect_list": [
              {
                "file_path": "/var/log/cloudach-bootstrap.log",
                "log_group_name": "${aws_cloudwatch_log_group.vllm.name}",
                "log_stream_name": "bootstrap-{instance_id}",
                "retention_in_days": ${var.log_retention_days}
              },
              {
                "file_path": "/var/log/syslog",
                "log_group_name": "${aws_cloudwatch_log_group.vllm.name}",
                "log_stream_name": "syslog-{instance_id}",
                "retention_in_days": ${var.log_retention_days}
              }
            ]
          }
        }
      }
    }
    CFG

    /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
      -a fetch-config -m ec2 -s \
      -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
  EOT
}

resource "aws_instance" "vllm" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.vllm.id]
  key_name               = aws_key_pair.vllm.key_name
  iam_instance_profile   = aws_iam_instance_profile.vllm.name

  user_data              = local.user_data
  user_data_replace_on_change = false # avoid accidental re-bootstrap on tag changes

  root_block_device {
    volume_type           = "gp3"
    volume_size           = var.ebs_root_size_gb
    delete_on_termination = true
    encrypted             = true
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required" # IMDSv2 only
    http_put_response_hop_limit = 2
  }

  tags = {
    Name = "${local.name_prefix}-vllm"
    Role = "inference"
  }

  lifecycle {
    ignore_changes = [ami] # don't replace on AMI updates; operator decides
  }
}
