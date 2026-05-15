variable "namespace" {
  description = "Kubernetes namespace for the application."
  type        = string
  default     = "eldenring"
}

variable "kubeconfig_path" {
  description = "Absolute path to the kubeconfig file used by the Kubernetes provider."
  type        = string
}

variable "backend_image" {
  description = "Backend container image to provision in Kubernetes."
  type        = string
  default     = "rpgtodolist-backend:latest"
}

variable "frontend_image" {
  description = "Frontend container image to provision in Kubernetes."
  type        = string
  default     = "rpgtodolist-frontend:latest"
}

variable "postgres_password" {
  description = "PostgreSQL password shared by the database secret and app DATABASE_URL."
  type        = string
  default     = "REPLACE_WITH_DB_PASSWORD"
  sensitive   = true
}

variable "secret_key" {
  description = "Flask SECRET_KEY stored in Kubernetes secret."
  type        = string
  default     = "super-secret-prod-key-eldenring-2026"
  sensitive   = true
}