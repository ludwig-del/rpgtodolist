output "app_url" {
  description = "Frontend application URL"
  value       = "http://localhost:3002"
}

output "api_url" {
  description = "Backend API URL"
  value       = "http://localhost:5000"
}

output "prometheus_url" {
  description = "Prometheus metrics UI"
  value       = "http://localhost:9090"
}

output "grafana_url" {
  description = "Grafana dashboard URL"
  value       = "http://localhost:3003"
}

output "backend_container_id" {
  description = "Docker container ID of the backend service"
  value       = docker_container.backend.id
}

output "frontend_container_id" {
  description = "Docker container ID of the frontend service"
  value       = docker_container.frontend.id
}

output "network_id" {
  description = "Docker network ID"
  value       = docker_network.eldenring.id
}
