# RPG Todo List — Daily Quest

> Gamified daily todo web application built with Flask and React, containerized with Docker, deployed to Kubernetes through Jenkins CI/CD, and monitored with Prometheus plus Grafana.

---

## Members

| Student ID | Name | Responsibility |
|------------|------|----------------|
| Fill in | Fill in | Git and App Development |
| B6618520 | นายธนภัทร เงินเส็ง | Jenkins and Docker |
| Fill in | Fill in | Terraform and Ansible |
| Fill in | Fill in | Kubernetes and Monitoring |

---

## Project Overview

### Application
- Name: RPG Todo List — Daily Quest
- Type: Full-stack Web Application
- Language / Framework: Python Flask, React
- Description: This project turns a normal daily todo list into an Elden Ring themed quest system. Users select a boss for the day, add tasks, and reduce boss HP by completing todos until the daily quest is cleared.

### Architecture Diagram
```text
Developer
    │
    ▼  git push
 GitHub ───────────────▶ Jenkins CI/CD
                            │
                ┌───────────┼───────────────┐
                ▼           ▼               ▼
         Backend Build  Frontend Build   Deploy Pipeline
                │           │               │
                └─────── Docker Images ─────┘
                                        │
                                        ▼
                             Terraform + Ansible
                                        │
                                        ▼
                               Kubernetes Cluster
                       ┌─────────────────────────────────┐
                       │  Postgres StatefulSet           │
                       │  Backend Deployment (2 pods)    │
                       │  Frontend Deployment (2 pods)   │
                       │  Services exposed by NodePort   │
                       └─────────────────────────────────┘
                                        │
                        ┌───────────────┴───────────────┐
                        ▼                               ▼
                   Prometheus                        Grafana
                  (scrape /metrics)            (dashboard panels)
```

---

## Repository Structure

```text
rpgtodolist/
├── backend/
│   ├── app/
│   ├── tests/
│   ├── dockerfile
│   ├── requirements.txt
│   └── wsgi.py
├── frontend/
│   ├── public/
│   ├── src/
│   ├── dockerfile
│   └── package.json
├── jenkins/
│   ├── Jenkinsfile_backend_build
│   ├── Jenkinsfile_frontend_build
│   └── Jenkinsfile_deploy
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   └── outputs.tf
├── ansible/
│   ├── backend/
│   │   ├── deploy_backend.yml
│   │   └── hosts.ini
│   └── frontend/
│       ├── deploy_frontend.yml
│       └── hosts.ini
├── k8s/
│   ├── backend-deployment.yaml
│   ├── frontend-deployment.yaml
│   ├── postgres-statefulset.yaml
│   ├── namespace.yaml
│   └── configmap.yaml
├── monitoring/
│   ├── prometheus.yml
│   └── grafana/
│       ├── dashboards/
│       └── provisioning/
├── docker-compose.yml
└── README.md
```

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Git | 2.x+ | Source control |
| Docker Desktop | 24.x+ | Containers and local runtime |
| Jenkins | 2.5xx | CI/CD automation |
| Terraform | 1.6+ | Provision Kubernetes resources |
| Ansible | 2.15+ | Deployment orchestration |
| kubectl | 1.28+ | Kubernetes CLI |
| Kubernetes | Docker Desktop / kind | Cluster runtime |
| Prometheus | 2.x+ | Metrics collection |
| Grafana | 10.x+ | Monitoring dashboard |

---

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/ludwig-del/rpgtodolist.git
cd rpgtodolist
```

### 2. Run Locally with Docker Compose
```bash
docker compose up -d --build
```

### 3. Local Service URLs
```text
Frontend App   : http://localhost:3002
Backend API    : http://localhost:5000
Prometheus     : http://localhost:9090
Grafana        : http://localhost:3003
```

### 4. Stop the Stack
```bash
docker compose down
```

---

## CI/CD Pipeline (Jenkins)

### Pipeline Flow

```text
Checkout -> Validate Parameters -> Terraform Init -> Terraform Apply -> Deploy Backend -> Deploy Frontend
```

### Jenkins Pipelines Used in This Project

| Pipeline File | Purpose |
|---------------|---------|
| `jenkins/Jenkinsfile_backend_build` | Test backend and build/push backend image |
| `jenkins/Jenkinsfile_frontend_build` | Test frontend and build/push frontend image |
| `jenkins/Jenkinsfile_deploy` | Terraform + Ansible deployment pipeline |

### Deploy Pipeline Stages

| Stage | Description |
|-------|-------------|
| Checkout | Fetch latest code from GitHub branch `sun` |
| Validate Parameters | Resolve image tag and namespace settings |
| Terraform Init | Initialize Terraform provider and working state |
| Terraform Apply | Import existing resources and apply infrastructure changes |
| Deploy Backend | Run backend Ansible rollout |
| Deploy Frontend | Run frontend Ansible rollout |

### Jenkins Setup Notes
1. Create jobs for backend build, frontend build, and deploy.
2. Point the jobs to this repository and branch `sun`.
3. Add credentials for GitHub, Docker Hub, and kubeconfig.
4. Webhook is optional for this project; manual trigger in Jenkins is acceptable for demo and grading.

---

## Infrastructure as Code

### Terraform — Provision Infrastructure
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

Terraform provisions:
- Kubernetes namespace
- ConfigMap and Secret
- PostgreSQL service and StatefulSet
- Backend deployment and service
- Frontend deployment and service

### Ansible — Deploy Application Changes
```bash
ansible-playbook -i ansible/backend/hosts.ini ansible/backend/deploy_backend.yml
ansible-playbook -i ansible/frontend/hosts.ini ansible/frontend/deploy_frontend.yml
```

Ansible performs:
- rollout readiness check for Postgres and existing deployments
- backend image patch for container and initContainer
- frontend image update
- rollout status verification for both services

> In the actual Jenkins deploy pipeline, Terraform and Ansible are executed automatically. They do not need to be run manually during normal CI/CD flow.

---

## Kubernetes Deployment

### Apply Manifests Manually
```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

### Check Runtime Status
```bash
kubectl get pods -n eldenring
kubectl get svc -n eldenring
```

### Expected Access
```text
Frontend NodePort : http://localhost:30080
Backend Metrics   : http://localhost:30500/metrics
```

---

## Monitoring

### Prometheus
- Config file: `monitoring/prometheus.yml`
- Metrics endpoint: `/metrics`
- Scrape target includes the backend application

### Grafana
- Dashboard file: `monitoring/grafana/dashboards/eldenring-overview.json`
- Provisioning path: `monitoring/grafana/provisioning/`
- Default local URL: `http://localhost:3003`

### Dashboard Panels

| Panel | Meaning |
|-------|---------|
| Request Rate | Backend request throughput |
| p95 Latency | Backend request latency |
| Backend Memory | Memory usage of the Flask backend |
| Total Requests | Accumulated request count |

---

## Branching Strategy

```text
feature/* -> sun -> main
```

| Branch | Purpose |
|--------|---------|
| `main` | Stable project branch |
| `sun` | Active integration and Jenkins demo branch |
| `feature/*` | Individual development branches |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register user account |
| `POST` | `/api/auth/login` | Login and receive JWT |
| `GET` | `/api/daily/bosses` | Get available bosses |
| `POST` | `/api/daily/select-boss` | Select boss for the day |
| `GET` | `/api/daily/session` | Get current daily session |
| `GET` | `/api/todo/` | Get current todos |
| `POST` | `/api/todo/` | Create todo |
| `PATCH` | `/api/todo/tick/<id>` | Mark todo as done |
| `DELETE` | `/api/todo/<id>` | Delete todo |
| `GET` | `/metrics` | Prometheus metrics endpoint |

---

## Troubleshooting

**Docker Desktop or Kubernetes does not start correctly**
```bash
docker ps
kubectl get pods -A
```

**Jenkins cannot reach the cluster**
```bash
kubectl get pods -n default
kubectl get svc -n default
```

**Prometheus target is DOWN**
```bash
curl http://localhost:5000/metrics
```

**Frontend or backend not reachable after deploy**
```bash
kubectl get svc -n eldenring
kubectl rollout status deployment/eldenring-backend -n eldenring
kubectl rollout status deployment/eldenring-frontend -n eldenring
```

---

## References

- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Terraform Documentation](https://developer.hashicorp.com/terraform/docs)
- [Ansible Documentation](https://docs.ansible.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

---

## Submission Information

- Course: ENG23 3074 — Serverless and Cloud Architectures
- Instructor: ดร.นันทวุฒิ คะอังกุ
- Department: Computer Engineering
