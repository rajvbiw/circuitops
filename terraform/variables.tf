# ─────────────────────────────────────────────────────────────────────────────
# CircuitOps Terraform — Variables Definition
# Highly-typed input parameters for AWS resources and App environment configurations.
# ─────────────────────────────────────────────────────────────────────────────

variable "aws_region" {
  description = "Target AWS region for infrastructure deployment"
  type        = string
  default     = "ap-south-1"
}

variable "environment" {
  description = "Target environment stage (e.g. staging, production)"
  type        = string
  default     = "production"
}

# ── EKS Configurations ───────────────────────────────────────────────────────
variable "cluster_name" {
  description = "Name of the AWS Elastic Kubernetes Service cluster"
  type        = string
  default     = "circuitops-eks"
}

variable "cluster_version" {
  description = "Kubernetes control plane version"
  type        = string
  default     = "1.29"
}

variable "node_instance_type" {
  description = "Instance type for EKS worker nodes"
  type        = string
  default     = "t3.medium"
}

variable "node_desired_count" {
  description = "Desired number of running EKS worker nodes"
  type        = number
  default     = 2
}

variable "node_min_count" {
  description = "Minimum limit for EKS worker nodes auto-scaling"
  type        = number
  default     = 1
}

variable "node_max_count" {
  description = "Maximum capacity for EKS worker nodes auto-scaling"
  type        = number
  default     = 5
}

# ── Application Secret Variables ─────────────────────────────────────────────
variable "db_password" {
  description = "Password for MySQL Root Database user"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "Secret key for JWT token hashing and session signatures"
  type        = string
  sensitive   = true
}

variable "openai_api_key" {
  description = "API secret key for OpenAI GPT AI integration"
  type        = string
  sensitive   = true
  default     = "sk-mock-key-place-holder"
}

variable "claude_api_key" {
  description = "API secret key for Claude AI integration"
  type        = string
  sensitive   = true
  default     = "sk-ant-mock-key-place-holder"
}

variable "cloudinary_cloud_name" {
  description = "Cloudinary cloud storage environment name"
  type        = string
  default     = "your_cloud_name"
}

variable "cloudinary_api_key" {
  description = "Cloudinary asset storage public api key"
  type        = string
  default     = "your_api_key"
}

variable "cloudinary_api_secret" {
  description = "Cloudinary asset storage api secret key"
  type        = string
  sensitive   = true
  default     = "your_api_secret"
}

variable "razorpay_key_id" {
  description = "Razorpay payment integration client key id"
  type        = string
  default     = "rzp_test_mock"
}

variable "razorpay_key_secret" {
  description = "Razorpay payment gateway client api secret"
  type        = string
  sensitive   = true
  default     = "your_razorpay_secret"
}

# ── Monitoring Configurations ────────────────────────────────────────────────
variable "grafana_admin_password" {
  description = "Administrator login password for Grafana web console dashboard"
  type        = string
  sensitive   = true
  default     = "CircuitOps@Grafana2026"
}
