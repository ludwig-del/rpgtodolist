variable "docker_host" {
  description = "Docker daemon socket (npipe on Windows, unix socket on Linux)"
  type        = string
  default     = "npipe:////./pipe/docker_engine"
}

variable "dockerhub_username" {
  description = "Docker Hub username for pulling published images"
  type        = string
}

variable "image_tag" {
  description = "Image tag to deploy (e.g. build number from CI)"
  type        = string
  default     = "latest"
}

variable "project_root" {
  description = "Absolute path to the project root on the host"
  type        = string
}

variable "db_user" {
  description = "PostgreSQL username"
  type        = string
  default     = "eldenring"
}

variable "db_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
  default     = "eldenring"
}

variable "db_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "eldenring_todo"
}

variable "secret_key" {
  description = "Flask SECRET_KEY"
  type        = string
  sensitive   = true
  default     = "super-secret-dev-key-eldenring-2026"
}

variable "grafana_password" {
  description = "Grafana admin password"
  type        = string
  sensitive   = true
  default     = "admin"
}
