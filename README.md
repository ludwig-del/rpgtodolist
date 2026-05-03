# RPG todolist — Daily Quest

> A gamified daily Todo List application themed around Elden Ring.
> Select a boss each day, complete your tasks to deal damage, and defeat the boss before the day ends.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Running Locally](#running-locally)
- [Kubernetes Deployment](#kubernetes-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring](#monitoring)

---

## Project Overview

This application is a **Gamified Daily Todo List** inspired by Elden Ring. The core gameplay loop works as follows:

1. **Select a Daily Boss** — Choose from 7 bosses ordered by difficulty (number of tasks required)
2. **Add Todos** — Create the tasks you need to complete today
3. **Tick Complete** — Checking off a task deals damage to the boss (reduces HP)
4. **Defeat the Boss** — Complete all required tasks to defeat the boss and clear the daily quest

### Boss List & Task Requirements

| Boss | Required Tasks |
|------|---------------|
| Malenia, Blade of Miquella | 1 |
| Radagon of the Golden Order | 2 |
| Mohg, Lord of Blood | 3 |
| Godfrey, the First Elden Lord | 4 |
| Starscourge Radahn | 5 |
| Morgott, the Omen King | 6 |
| Messmer the Impaler | 7 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Framer Motion, Context API, Axios |
| **Backend** | Python Flask, Flask-SQLAlchemy, Flask-Migrate |
| **Database** | PostgreSQL 16 |
| **Containerization** | Docker, Docker Compose |
| **CI/CD** | Jenkins Pipeline |
| **Orchestration** | Kubernetes (Minikube), NodePort Service |
| **Monitoring** | Prometheus, Grafana |
| **Registry** | Docker Hub |

---

## Project Structure

```
Eldenring Project/
├── backend/                        # Flask REST API
│   ├── app/
│   │   ├── __init__.py             # App factory + CLI commands
│   │   ├── config.py               # Dev/Prod configuration
│   │   ├── extensions.py           # SQLAlchemy, Migrate instances
│   │   ├── models/                 # ORM Models
│   │   │   ├── user.py             # User (Device ID-based, no login)
│   │   │   ├── boss.py             # Boss data
│   │   │   ├── daily_session.py    # Daily session + HP logic
│   │   │   └── todo.py             # Todo items
│   │   └── routes/                 # API Blueprints
│   │       ├── daily.py            # Boss selection, session management
│   │       └── todo.py             # CRUD + atomic tick
│   ├── tests/                      # Pytest test suite
│   ├── dockerfile                  # python:3.12-slim → gunicorn
│   ├── requirements.txt
│   └── wsgi.py
├── frontend/                       # React Application
│   ├── public/
│   │   └── assets/
│   │       ├── images/             # Drop boss .webp files here
│   │       └── audio/              # Drop boss .mp3 files here
│   ├── src/
│   │   ├── components/
│   │   │   ├── Landing/            # Landing page + Play button
│   │   │   ├── BossSelection/      # Boss selection screen
│   │   │   ├── BossCard/           # Boss card (hover + audio fade)
│   │   │   ├── Dashboard/          # Main game screen
│   │   │   ├── HPBar/              # Animated boss HP bar
│   │   │   └── TodoList/           # Todo management
│   │   ├── context/
│   │   │   └── GameContext.jsx     # Global state (useReducer)
│   │   ├── services/
│   │   │   └── api.js              # Axios client + Device ID header
│   │   └── App.jsx                 # Route definitions
│   ├── dockerfile                  # Multi-stage: Node build → Nginx serve
│   └── package.json
├── db/
│   └── init.sql                    # Schema creation + boss seed data
├── infrastructure/
│   └── k8s/                        # Kubernetes manifests
│       ├── namespace.yaml
│       ├── configmap.yaml
│       ├── postgres-statefulset.yaml
│       ├── backend-deployment.yaml  # NodePort 30500
│       └── frontend-deployment.yaml # NodePort 30080
├── monitoring/
│   └── prometheus/
│       └── prometheus.yml
├── docker-compose.yml              # Full local stack
└── Jenkinsfile                     # CI/CD pipeline definition
```

---

## Database Schema

### `users` table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | User ID |
| device_id | VARCHAR(36) UNIQUE | Browser-generated UUID (no login required) |
| created_at | TIMESTAMPTZ | Creation timestamp |

### `bosses` table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Boss ID |
| name | VARCHAR(100) | Boss name |
| required_todos | INTEGER | Number of tasks required to defeat |
| image_path | VARCHAR | Path to boss image asset |
| audio_path | VARCHAR | Path to boss theme audio |
| difficulty_order | INTEGER | Sort order (easiest to hardest) |

### `daily_sessions` table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Session ID |
| user_id | FK → users | Session owner |
| boss_id | FK → bosses | Selected boss |
| session_date | DATE | One session per user per day (unique constraint) |
| required_todos | INTEGER | Tasks needed to clear |
| current_todos_done | INTEGER | Tasks completed so far |
| is_cleared | BOOLEAN | Whether the boss is defeated |
| cleared_at | TIMESTAMPTZ | Timestamp of boss defeat |

> **Race Condition Prevention:** The tick endpoint uses a single atomic SQL statement to prevent double-counting from rapid consecutive clicks:
> ```sql
> UPDATE daily_sessions
> SET current_todos_done = current_todos_done + 1,
>     is_cleared = CASE WHEN current_todos_done + 1 >= required_todos THEN TRUE ELSE FALSE END
> WHERE id = :id AND is_cleared = FALSE
> ```

### `todos` table
| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL PK | Todo ID |
| session_id | FK → daily_sessions | Parent session |
| task_name | VARCHAR(255) | Task description |
| status | ENUM(pending, done) | Completion status |
| created_at | TIMESTAMPTZ | Creation timestamp |
| completed_at | TIMESTAMPTZ | Completion timestamp |

---

## API Endpoints

### Daily Session

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/daily/bosses` | Get all bosses ordered by difficulty |
| GET | `/api/daily/session` | Get today's active session |
| POST | `/api/daily/select-boss` | Lock in today's boss (one per day) |
| GET | `/api/daily/history` | Get last 30 days of session history |

### Todo

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/todo/` | Get all todos for today's session |
| POST | `/api/todo/` | Create a new todo |
| PATCH | `/api/todo/tick/:id` | Mark todo as done (atomically reduces boss HP) |
| DELETE | `/api/todo/:id` | Delete a pending todo |

> All requests must include the header `X-Device-ID: <uuid>` to identify the user.

---

## Running Locally

### Prerequisites

- Docker Desktop (must be running)

### Start the App

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/eldenring-todo.git
cd eldenring-todo

# Build and start all services (first run takes 3-5 minutes)
docker compose up --build
```

### Service URLs

| Service | URL |
|---------|-----|
| Application | http://localhost:3002 |
| Backend API | http://localhost:5000 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3003 (admin / admin) |

### Stop the App

```bash
# Stop but keep data
docker compose down

# Stop and wipe all data (full reset)
docker compose down -v
```

### Adding Boss Assets

Place your files in the correct folders:

```
frontend/public/assets/images/   ← boss image files (.webp)
frontend/public/assets/audio/    ← boss theme files (.mp3)
```

Required filenames:

```
malenia.webp    radagon.webp    mohg.webp      godfrey.webp
radahn.webp     morgott.webp    messmer.webp

malenia_theme.mp3    radagon_theme.mp3    mohg_theme.mp3    godfrey_theme.mp3
radahn_theme.mp3     morgott_theme.mp3    messmer_theme.mp3
```

After adding files, rebuild:
```bash
docker compose up --build
```

---

## Kubernetes Deployment

### 1. Start Minikube

```bash
minikube start --driver=docker --cpus=2 --memory=4096
minikube status
```

### 2. Apply Manifests

```bash
kubectl apply -f infrastructure/k8s/namespace.yaml
kubectl apply -f infrastructure/k8s/configmap.yaml
kubectl apply -f infrastructure/k8s/postgres-statefulset.yaml
kubectl apply -f infrastructure/k8s/backend-deployment.yaml
kubectl apply -f infrastructure/k8s/frontend-deployment.yaml
```

### 3. Verify Pods

```bash
kubectl get pods -n eldenring
kubectl get services -n eldenring
```

### 4. Open the App

```bash
minikube service eldenring-frontend-svc -n eldenring
```

### NodePort Reference

| Service | NodePort |
|---------|----------|
| Frontend | 30080 |
| Backend API | 30500 |

---

## CI/CD Pipeline

### Pipeline Flow

```
Push to GitHub
    └── Webhook triggers Jenkins
            ├── Stage 1: Checkout
            ├── Stage 2: Test Backend (pytest)
            ├── Stage 3: Test Frontend (npm test)
            ├── Stage 4: Build & Push Docker Images to Docker Hub
            └── Stage 5: kubectl set image → Rolling deploy to Kubernetes
```

### Jenkins Setup

```bash
# Run Jenkins in Docker
docker run -d --name jenkins -p 8080:8080 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

Required Jenkins credentials:

| Credential ID | Type | Purpose |
|--------------|------|---------|
| `registry-credentials` | Username/Password | Docker Hub login |
| `kubeconfig-prod` | Secret File | kubectl access to cluster |

### GitHub Webhook

- **Payload URL:** `http://<JENKINS_URL>/github-webhook/`
- **Content Type:** `application/json`
- **Trigger:** Push event

Every push to the `main` branch automatically triggers the full pipeline.

---

## Monitoring

### Prometheus

The backend exposes metrics at `/metrics` via `prometheus-flask-exporter`. Prometheus scrapes this endpoint automatically.

```bash
# View raw metrics
curl http://localhost:5000/metrics
```

### Grafana

1. Open http://localhost:3003
2. Login: `admin` / `admin`
3. Add Data Source → Prometheus → URL: `http://prometheus:9090`
4. Import Dashboard ID `11159` for Flask application metrics

---

## Authentication System

This app requires **no login or registration**. On first visit, the browser generates a UUID and stores it in `localStorage` as `device_id`. Every API request includes this as an `X-Device-ID` header, allowing the backend to identify and persist data per device automatically.

---

*This project was built for the Serverless & Cloud Computing course — Semester 6*
