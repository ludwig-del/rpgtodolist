terraform {
  required_version = ">= 1.6.0"
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {
  host = var.docker_host
}

# ─── Network ───────────────────────────────────────────────────────────────────
resource "docker_network" "eldenring" {
  name = "eldenringproject_default"
  check_duplicate = true
}

# ─── Volumes ───────────────────────────────────────────────────────────────────
resource "docker_volume" "pg_data" {
  name = "eldenringproject_pg_data"
}

resource "docker_volume" "grafana_data" {
  name = "eldenringproject_grafana_data"
}

# ─── Images ────────────────────────────────────────────────────────────────────
resource "docker_image" "postgres" {
  name         = "postgres:16-alpine"
  keep_locally = true
}

resource "docker_image" "prometheus" {
  name         = "prom/prometheus:v2.52.0"
  keep_locally = true
}

resource "docker_image" "grafana" {
  name         = "grafana/grafana:10.4.3"
  keep_locally = true
}

resource "docker_image" "backend" {
  name         = "${var.dockerhub_username}/eldenring-backend:${var.image_tag}"
  keep_locally = true
}

resource "docker_image" "frontend" {
  name         = "${var.dockerhub_username}/eldenring-frontend:${var.image_tag}"
  keep_locally = true
}

# ─── PostgreSQL ────────────────────────────────────────────────────────────────
resource "docker_container" "db" {
  name  = "eldenring_db"
  image = docker_image.postgres.image_id

  env = [
    "POSTGRES_USER=${var.db_user}",
    "POSTGRES_PASSWORD=${var.db_password}",
    "POSTGRES_DB=${var.db_name}",
  ]

  ports {
    internal = 5432
    external = 5432
  }

  volumes {
    volume_name    = docker_volume.pg_data.name
    container_path = "/var/lib/postgresql/data"
  }

  networks_advanced {
    name = docker_network.eldenring.name
  }

  healthcheck {
    test         = ["CMD-SHELL", "pg_isready -U ${var.db_user} -d ${var.db_name}"]
    interval     = "5s"
    timeout      = "5s"
    retries      = 10
    start_period = "5s"
  }

  restart = "unless-stopped"
}

# ─── Backend ───────────────────────────────────────────────────────────────────
resource "docker_container" "backend" {
  name  = "eldenring_backend"
  image = docker_image.backend.image_id

  env = [
    "FLASK_ENV=production",
    "DATABASE_URL=postgresql://${var.db_user}:${var.db_password}@eldenring_db:5432/${var.db_name}",
    "SECRET_KEY=${var.secret_key}",
  ]

  ports {
    internal = 5000
    external = 5000
  }

  networks_advanced {
    name = docker_network.eldenring.name
  }

  depends_on = [docker_container.db]
  restart    = "unless-stopped"
}

# ─── Frontend ──────────────────────────────────────────────────────────────────
resource "docker_container" "frontend" {
  name  = "eldenring_frontend"
  image = docker_image.frontend.image_id

  ports {
    internal = 80
    external = 3002
  }

  networks_advanced {
    name = docker_network.eldenring.name
  }

  depends_on = [docker_container.backend]
  restart    = "unless-stopped"
}

# ─── Prometheus ────────────────────────────────────────────────────────────────
resource "docker_container" "prometheus" {
  name  = "eldenring_prometheus"
  image = docker_image.prometheus.image_id

  ports {
    internal = 9090
    external = 9090
  }

  volumes {
    host_path      = "${var.project_root}/monitoring/prometheus/prometheus.yml"
    container_path = "/etc/prometheus/prometheus.yml"
    read_only      = true
  }

  command = [
    "--config.file=/etc/prometheus/prometheus.yml",
    "--storage.tsdb.retention.time=7d",
  ]

  networks_advanced {
    name = docker_network.eldenring.name
  }

  restart = "unless-stopped"
}

# ─── Grafana ───────────────────────────────────────────────────────────────────
resource "docker_container" "grafana" {
  name  = "eldenring_grafana"
  image = docker_image.grafana.image_id

  env = [
    "GF_SECURITY_ADMIN_PASSWORD=${var.grafana_password}",
    "GF_DASHBOARDS_DEFAULT_HOME_DASHBOARD_PATH=/var/lib/grafana/dashboards/eldenring.json",
  ]

  ports {
    internal = 3000
    external = 3003
  }

  volumes {
    volume_name    = docker_volume.grafana_data.name
    container_path = "/var/lib/grafana"
  }

  volumes {
    host_path      = "${var.project_root}/monitoring/grafana/provisioning"
    container_path = "/etc/grafana/provisioning"
    read_only      = true
  }

  volumes {
    host_path      = "${var.project_root}/monitoring/grafana/dashboards"
    container_path = "/var/lib/grafana/dashboards"
    read_only      = true
  }

  networks_advanced {
    name = docker_network.eldenring.name
  }

  depends_on = [docker_container.prometheus]
  restart    = "unless-stopped"
}
