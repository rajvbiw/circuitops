# ─────────────────────────────────────────────────────────────────────────────
# CircuitOps Terraform — Kubernetes Main Workloads Config
# Provisions the main Kubernetes namespace, initial configurations, and injects
# secure base64-encoded application secrets directly from Terraform variables.
# ─────────────────────────────────────────────────────────────────────────────

# ── Create the Dedicated Application Namespace ────────────────────────────────
resource "kubernetes_namespace" "app" {
  metadata {
    name = "circuitops"
    labels = {
      "app.kubernetes.io/name" = "circuitops-marketplace"
      environment              = var.environment
    }
  }
  depends_on = [aws_eks_node_group.circuitops_nodes]
}

# ── Provision ConfigMap (Standard Configurations) ────────────────────────────
resource "kubernetes_config_map" "app_config" {
  metadata {
    name      = "circuitops-config"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  data = {
    PORT          = "5000"
    DB_HOST       = "circuitops-mysql"
    DB_USER       = "root"
    DB_NAME       = "gada_electronics"
    AI_PROVIDER   = "mock"
    VITE_API_URL  = "/api/v1"
  }
}

# ── Provision Kubernetes Secret (Inject Secure Variables Safely) ─────────────
resource "kubernetes_secret" "app_secret" {
  metadata {
    name      = "circuitops-secret"
    namespace = kubernetes_namespace.app.metadata[0].name
  }

  type = "Opaque"

  data = {
    DB_PASSWORD           = var.db_password
    JWT_SECRET            = var.jwt_secret
    OPENAI_API_KEY        = var.openai_api_key
    CLAUDE_API_KEY        = var.claude_api_key
    CLOUDINARY_CLOUD_NAME = var.cloudinary_cloud_name
    CLOUDINARY_API_KEY    = var.cloudinary_api_key
    CLOUDINARY_API_SECRET = var.cloudinary_api_secret
    RAZORPAY_KEY_ID        = var.razorpay_key_id
    RAZORPAY_KEY_SECRET    = var.razorpay_key_secret
  }
}
