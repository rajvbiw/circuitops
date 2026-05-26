# ─────────────────────────────────────────────────────────────────────────────
# CircuitOps Terraform — Providers Configuration
# Sourced Provider Blocks for AWS, Kubernetes, Helm, and TLS.
# ─────────────────────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.13.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Fetch authorization token to authenticate Kubernetes and Helm providers with the EKS cluster
data "aws_eks_cluster_auth" "cluster" {
  name = aws_eks_cluster.circuitops.name
}

provider "kubernetes" {
  host                   = aws_eks_cluster.circuitops.endpoint
  cluster_ca_certificate = base64decode(aws_eks_cluster.circuitops.certificate_authority[0].data)
  token                  = data.aws_eks_cluster_auth.cluster.token
}

provider "helm" {
  kubernetes {
    host                   = aws_eks_cluster.circuitops.endpoint
    cluster_ca_certificate = base64decode(aws_eks_cluster.circuitops.certificate_authority[0].data)
    token                  = data.aws_eks_cluster_auth.cluster.token
  }
}
