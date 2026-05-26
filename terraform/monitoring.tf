# ─────────────────────────────────────────────────────────────────────────────
# CircuitOps Terraform — Ingress and Monitoring Suite
# Deploys NGINX Ingress Controller and Prometheus + Grafana stack via Helm.
# ─────────────────────────────────────────────────────────────────────────────

# ── Create Monitoring Namespace ──────────────────────────────────────────────
resource "kubernetes_namespace" "monitoring" {
  metadata {
    name = "monitoring"
  }
  depends_on = [aws_eks_node_group.circuitops_nodes]
}

# ── Deploy NGINX Ingress Controller ──────────────────────────────────────────
resource "helm_release" "nginx_ingress" {
  name             = "nginx-ingress"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  namespace        = "kube-system"
  create_namespace = false

  set {
    name  = "controller.service.externalTrafficPolicy"
    value = "Local"
  }

  set {
    name  = "controller.publishService.enabled"
    value = "true"
  }

  # Ensure worker nodes are ready before launching Helm charts
  depends_on = [aws_eks_node_group.circuitops_nodes]
}

# ── Deploy Kube-Prometheus-Stack (Prometheus + Grafana + Alertmanager) ────────
resource "helm_release" "prometheus_stack" {
  name       = "prometheus-stack"
  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  namespace  = kubernetes_namespace.monitoring.metadata[0].name
  timeout    = 600  # Increased for t3.small nodes
  atomic     = false
  wait       = false  # Don't block apply; pods will start in background

  set {
    name  = "grafana.adminPassword"
    value = var.grafana_admin_password
  }

  # Disable persistence to avoid PVC issues on small clusters
  set {
    name  = "grafana.persistence.enabled"
    value = "false"
  }

  # Reduce Prometheus resource usage for t3.small
  set {
    name  = "prometheus.prometheusSpec.resources.requests.cpu"
    value = "100m"
  }

  set {
    name  = "prometheus.prometheusSpec.resources.requests.memory"
    value = "256Mi"
  }

  set {
    name  = "prometheus.prometheusSpec.resources.limits.cpu"
    value = "500m"
  }

  set {
    name  = "prometheus.prometheusSpec.resources.limits.memory"
    value = "512Mi"
  }

  # Reduce Grafana resource usage
  set {
    name  = "grafana.resources.requests.cpu"
    value = "50m"
  }

  set {
    name  = "grafana.resources.requests.memory"
    value = "128Mi"
  }

  set {
    name  = "prometheus.prometheusSpec.serviceMonitorSelectorNilUsesHelmValues"
    value = "false"
  }

  depends_on = [
    aws_eks_node_group.circuitops_nodes,
    kubernetes_namespace.monitoring
  ]
}
