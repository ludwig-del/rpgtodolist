output "namespace" {
  description = "Provisioned Kubernetes namespace."
  value       = kubernetes_namespace_v1.app.metadata[0].name
}

output "backend_service" {
  description = "Backend service name."
  value       = kubernetes_service_v1.backend.metadata[0].name
}

output "frontend_service" {
  description = "Frontend service name."
  value       = kubernetes_service_v1.frontend.metadata[0].name
}

output "postgres_service" {
  description = "PostgreSQL service name."
  value       = kubernetes_service_v1.postgres.metadata[0].name
}