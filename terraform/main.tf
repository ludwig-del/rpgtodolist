terraform {
  required_version = ">= 1.6.0"

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.32"
    }
  }
}

provider "kubernetes" {
  config_path = var.kubeconfig_path
}

locals {
  labels = {
    "app.kubernetes.io/part-of" = "eldenring-todo"
  }

  database_url = "postgresql://eldenring:${var.postgres_password}@postgres-svc:5432/eldenring_todo"
}

resource "kubernetes_namespace_v1" "app" {
  metadata {
    name   = var.namespace
    labels = local.labels
  }
}

resource "kubernetes_config_map_v1" "app" {
  metadata {
    name      = "eldenring-config"
    namespace = kubernetes_namespace_v1.app.metadata[0].name
  }

  data = {
    FLASK_ENV    = "production"
    DATABASE_URL = local.database_url
  }
}

resource "kubernetes_secret_v1" "app" {
  metadata {
    name      = "eldenring-secrets"
    namespace = kubernetes_namespace_v1.app.metadata[0].name
  }

  type = "Opaque"

  data = {
    SECRET_KEY        = var.secret_key
    POSTGRES_PASSWORD = var.postgres_password
  }
}

resource "kubernetes_service_v1" "postgres" {
  metadata {
    name      = "postgres-svc"
    namespace = kubernetes_namespace_v1.app.metadata[0].name
  }

  spec {
    cluster_ip = "None"

    selector = {
      app = "postgres"
    }

    port {
      port = 5432
    }
  }
}

resource "kubernetes_stateful_set_v1" "postgres" {
  metadata {
    name      = "postgres"
    namespace = kubernetes_namespace_v1.app.metadata[0].name
  }

  lifecycle {
    ignore_changes = [
      spec[0].volume_claim_template[0].metadata[0].namespace,
    ]
  }

  spec {
    service_name = kubernetes_service_v1.postgres.metadata[0].name
    replicas     = 1

    selector {
      match_labels = {
        app = "postgres"
      }
    }

    template {
      metadata {
        labels = {
          app = "postgres"
        }
      }

      spec {
        container {
          name  = "postgres"
          image = "postgres:16-alpine"

          port {
            container_port = 5432
          }

          env {
            name  = "POSTGRES_USER"
            value = "eldenring"
          }

          env {
            name  = "POSTGRES_DB"
            value = "eldenring_todo"
          }

          env {
            name = "POSTGRES_PASSWORD"

            value_from {
              secret_key_ref {
                name = kubernetes_secret_v1.app.metadata[0].name
                key  = "POSTGRES_PASSWORD"
              }
            }
          }

          volume_mount {
            name       = "pg-data"
            mount_path = "/var/lib/postgresql/data"
          }

          liveness_probe {
            exec {
              command = ["pg_isready", "-U", "eldenring"]
            }

            initial_delay_seconds = 15
            period_seconds        = 10
          }
        }
      }
    }

    volume_claim_template {
      metadata {
        name = "pg-data"
      }

      spec {
        access_modes = ["ReadWriteOnce"]

        resources {
          requests = {
            storage = "5Gi"
          }
        }
      }
    }
  }
}

resource "kubernetes_deployment_v1" "backend" {
  metadata {
    name      = "eldenring-backend"
    namespace = kubernetes_namespace_v1.app.metadata[0].name
    labels = {
      app = "eldenring-backend"
    }
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "eldenring-backend"
      }
    }

    strategy {
      type = "RollingUpdate"

      rolling_update {
        max_surge       = "1"
        max_unavailable = "0"
      }
    }

    template {
      metadata {
        labels = {
          app = "eldenring-backend"
        }

        annotations = {
          "prometheus.io/scrape" = "true"
          "prometheus.io/port"   = "5000"
          "prometheus.io/path"   = "/metrics"
        }
      }

      spec {
        init_container {
          name              = "run-migrations"
          image             = var.backend_image
          image_pull_policy = "IfNotPresent"
          command           = ["flask", "db", "upgrade"]

          env_from {
            config_map_ref {
              name = kubernetes_config_map_v1.app.metadata[0].name
            }
          }

          env_from {
            secret_ref {
              name = kubernetes_secret_v1.app.metadata[0].name
            }
          }
        }

        container {
          name              = "backend"
          image             = var.backend_image
          image_pull_policy = "IfNotPresent"

          port {
            container_port = 5000
          }

          env_from {
            config_map_ref {
              name = kubernetes_config_map_v1.app.metadata[0].name
            }
          }

          env_from {
            secret_ref {
              name = kubernetes_secret_v1.app.metadata[0].name
            }
          }

          readiness_probe {
            http_get {
              path = "/metrics"
              port = 5000
            }

            initial_delay_seconds = 10
            period_seconds        = 10
          }

          liveness_probe {
            http_get {
              path = "/metrics"
              port = 5000
            }

            initial_delay_seconds = 30
            period_seconds        = 20
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "256Mi"
            }

            limits = {
              cpu    = "500m"
              memory = "512Mi"
            }
          }
        }
      }
    }
  }

  depends_on = [
    kubernetes_stateful_set_v1.postgres,
    kubernetes_config_map_v1.app,
    kubernetes_secret_v1.app,
  ]
}

resource "kubernetes_service_v1" "backend" {
  metadata {
    name      = "eldenring-backend-svc"
    namespace = kubernetes_namespace_v1.app.metadata[0].name
  }

  spec {
    type = "NodePort"

    selector = {
      app = "eldenring-backend"
    }

    port {
      port        = 5000
      target_port = 5000
      node_port   = 30500
    }
  }
}

resource "kubernetes_deployment_v1" "frontend" {
  metadata {
    name      = "eldenring-frontend"
    namespace = kubernetes_namespace_v1.app.metadata[0].name
    labels = {
      app = "eldenring-frontend"
    }
  }

  spec {
    replicas = 2

    selector {
      match_labels = {
        app = "eldenring-frontend"
      }
    }

    strategy {
      type = "RollingUpdate"

      rolling_update {
        max_surge       = "1"
        max_unavailable = "0"
      }
    }

    template {
      metadata {
        labels = {
          app = "eldenring-frontend"
        }
      }

      spec {
        container {
          name              = "frontend"
          image             = var.frontend_image
          image_pull_policy = "IfNotPresent"

          port {
            container_port = 80
          }

          readiness_probe {
            http_get {
              path = "/health"
              port = 80
            }

            initial_delay_seconds = 5
            period_seconds        = 10
          }

          liveness_probe {
            http_get {
              path = "/health"
              port = 80
            }

            initial_delay_seconds = 10
            period_seconds        = 20
          }

          resources {
            requests = {
              cpu    = "50m"
              memory = "64Mi"
            }

            limits = {
              cpu    = "200m"
              memory = "128Mi"
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "frontend" {
  metadata {
    name      = "eldenring-frontend-svc"
    namespace = kubernetes_namespace_v1.app.metadata[0].name
  }

  spec {
    type = "NodePort"

    selector = {
      app = "eldenring-frontend"
    }

    port {
      port        = 80
      target_port = 80
      node_port   = 30080
    }
  }
}