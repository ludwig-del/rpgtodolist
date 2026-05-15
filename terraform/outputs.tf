output "namespace" {
  description = "Kubernetes namespace managed by Terraform"
  value       = kubernetes_namespace_v1.app.metadata[0].name
}

output "backend_service_name" {
  description = "Backend Kubernetes service name"
  value       = kubernetes_service_v1.backend.metadata[0].name
}

output "frontend_service_name" {
  description = "Frontend Kubernetes service name"
  value       = kubernetes_service_v1.frontend.metadata[0].name
}

output "postgres_service_name" {
  description = "PostgreSQL headless service name"
  value       = kubernetes_service_v1.postgres.metadata[0].name
}

output "frontend_url" {
  description = "Frontend NodePort URL"
  value       = "http://localhost:${var.frontend_node_port}"
}

output "backend_metrics_url" {
  description = "Backend metrics NodePort URL"
  value       = "http://localhost:${var.backend_node_port}/metrics"
}
