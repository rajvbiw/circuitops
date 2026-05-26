# ─────────────────────────────────────────────────────────────────────────────
# CircuitOps Terraform — Outputs Configuration
# Exposes connection details and utility commands for local cluster management.
# ─────────────────────────────────────────────────────────────────────────────

output "eks_cluster_name" {
  description = "Name of the EKS Cluster"
  value       = aws_eks_cluster.circuitops.name
}

output "eks_cluster_endpoint" {
  description = "EKS control plane public API server endpoint"
  value       = aws_eks_cluster.circuitops.endpoint
}

output "eks_cluster_security_group_id" {
  description = "Security Group ID of the EKS control plane"
  value       = aws_security_group.eks_cluster.id
}

output "kubeconfig_command" {
  description = "Exact command to configure your local kubectl context"
  value       = "aws eks update-kubeconfig --region ${var.aws_region} --name ${aws_eks_cluster.circuitops.name}"
}

# ── Port Forwarding Commands for Accessing UI ────────────────────────────────
output "grafana_access_guide" {
  description = "Command to port-forward and access Grafana Dashboard"
  value       = "kubectl port-forward svc/prometheus-stack-grafana 3000:80 -n monitoring"
}

output "prometheus_access_guide" {
  description = "Command to port-forward and access Prometheus Dashboard"
  value       = "kubectl port-forward svc/prometheus-stack-kube-prom-prometheus 9090:9090 -n monitoring"
}
