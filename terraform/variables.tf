variable "namespace" {
  description = "Kubernetes namespace for the application"
  type        = string
  default     = "eldenring"
}

variable "kubeconfig_path" {
  description = "Absolute path to the kubeconfig file used by Terraform"
  type        = string
}

variable "backend_image" {
  description = "Backend container image"
  type        = string
  default     = "rpgtodolist-backend:latest"
}

variable "frontend_image" {
  description = "Frontend container image"
  type        = string
  default     = "rpgtodolist-frontend:latest"
}

variable "postgres_user" {
  description = "PostgreSQL username"
  type        = string
  default     = "eldenring"
}

variable "postgres_db" {
  description = "PostgreSQL database name"
  type        = string
  default     = "eldenring_todo"
}

variable "postgres_password" {
  description = "PostgreSQL password used by both the secret and backend DATABASE_URL"
  type        = string
  sensitive   = true
}

variable "secret_key" {
  description = "Flask secret key"
  type        = string
  sensitive   = true
}

variable "backend_node_port" {
  description = "NodePort exposed by the backend service"
  type        = number
  default     = 30500
}

variable "frontend_node_port" {
  description = "NodePort exposed by the frontend service"
  type        = number
  default     = 30080
}

variable "postgres_storage" {
  description = "Requested persistent storage for PostgreSQL"
  type        = string
  default     = "5Gi"
}
