# ⚔️ RPG Todo List (Elden Ring Edition) — ENG23 3074

> ระบบ Todo List สไตล์ RPG ที่นำธีม Elden Ring มาผสานกับการจัดการงานประจำวัน  
> **สร้างด้วย Python Flask (Backend) + React (Frontend) containerize ด้วย Docker และ deploy บน Kubernetes ผ่าน Jenkins Pipeline แบบอัตโนมัติ**

---

## 👥 สมาชิกในกลุ่ม

| รหัสนักศึกษา | ชื่อ-นามสกุล | ความรับผิดชอบ |
|-------------|-------------|---------------|
| B6611460 | สิษฐ์สโรจ กันทรสุรพล | Git, Backend Development, Jenkins |
| B6612122 | ธนพล สุดโต | Docker, Kubernetes, CI/CD Pipeline |
| B6512866 | เจษฎา เชือดขุนทด | Terraform, Ansible, Infrastructure |
| B6618520 | ธนภัทร เงินเส็ง | Frontend Development, Prometheus, Grafana |

---

## 📌 ภาพรวมโปรเจค

### แอปพลิเคชัน
- **ชื่อ:** RPG Todo List — Elden Ring Edition
- **ประเภท:** Full-Stack Web Application (REST API + React SPA)
- **ภาษา / Framework:** Python Flask + PostgreSQL (Backend), React 18 + Framer Motion (Frontend)
- **คำอธิบาย:** แอปพลิเคชัน Todo List ที่ผสมผสานธีม RPG สไตล์ Elden Ring เข้ากับการจัดการงานประจำวัน ผู้ใช้จะเลือก "Boss" ประจำวันเป็นตัวแทนเป้าหมาย สร้าง Todo Task แต่ละชิ้นจะลด HP ของ Boss เมื่อทำเสร็จ และถ้าทำครบตามจำนวนที่กำหนดก็จะ "สังหาร" Boss ได้สำเร็จ

### Boss & จำนวน Task ที่ต้องทำ

| Boss | Task ที่ต้องทำ |
|------|---------------|
| Malenia, Blade of Miquella | 1 |
| Radagon of the Golden Order | 2 |
| Mohg, Lord of Blood | 3 |
| Godfrey, the First Elden Lord | 4 |
| Starscourge Radahn | 5 |
| Morgott, the Omen King | 6 |
| Messmer the Impaler | 7 |

### Architecture Diagram
```
Developer
    │
    ▼  git push
 GitHub ──── webhook ────▶ Jenkins CI/CD Pipeline
                                │
                    ┌───────────┼────────────┐
                    ▼           ▼            ▼
               Checkout    Test Backend  Test Frontend
                           (pytest)      (npm test)
                                            │
                                            ▼
                                    Build & Push Images
                                       Docker Hub
                                  (eldenring-backend /
                                   eldenring-frontend)
                                            │
                                    ┌───────┴───────┐
                                    ▼               ▼
                                Terraform        Ansible
                          (Provision Namespace) (Configure Env)
                                    │               │
                                    └───────┬───────┘
                                            ▼
                                   Kubernetes Cluster
                          ┌──────────────────────────────────┐
                          │  Namespace: eldenring             │
                          │                                   │
                          │  [Backend Pod]  [Frontend Pod]    │
                          │  Flask:5000     React → Nginx     │
                          │                                   │
                          │  [PostgreSQL StatefulSet]         │
                          │                                   │
                          │  Backend  NodePort :30500         │
                          │  Frontend NodePort :30080         │
                          └──────────────────────────────────┘
                                            │
                              ┌─────────────┴──────────────┐
                              ▼                             ▼
                          Prometheus  ──────────────▶  Grafana
                        (scrape /metrics)            (dashboard)
```

---

## 📁 โครงสร้าง Repository

```
rpgtodolist/
├── backend/
│   ├── app/
│   │   ├── __init__.py             # App factory + CLI commands
│   │   ├── config.py               # Dev/Prod configuration
│   │   ├── extensions.py           # Flask extensions (SQLAlchemy, Migrate)
│   │   ├── models/
│   │   │   ├── user.py             # User (Device ID-based, ไม่ต้อง login)
│   │   │   ├── boss.py             # Boss data (ชื่อ, HP, ความยาก)
│   │   │   ├── daily_session.py    # Session ประจำวัน + HP logic
│   │   │   └── todo.py             # Todo items
│   │   └── routes/
│   │       ├── auth.py             # Auth endpoints (register/login/me)
│   │       ├── daily.py            # Boss selection + Session management
│   │       └── todo.py             # CRUD + atomic tick
│   ├── migrations/                 # Flask-Migrate database migrations
│   ├── tests/                      # Pytest test suite
│   ├── requirements.txt            # Python dependencies
│   ├── dockerfile                  # python:3.12-slim → gunicorn
│   └── wsgi.py                     # WSGI entry point
├── frontend/
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
│   ├── public/
│   │   └── assets/
│   │       ├── images/             # Boss images (.webp)
│   │       └── audio/              # Boss themes (.mp3)
│   ├── package.json                # Node.js dependencies
│   └── dockerfile                  # Multi-stage: Node build → Nginx serve
├── db/
│   └── init.sql                    # Schema creation + boss seed data
├── ansible/
│   ├── inventory.ini               # รายชื่อ host เป้าหมาย
│   ├── playbook.yml                # Tasks สำหรับ configure environment
│   └── roles/                      # Ansible roles แยกตามหน้าที่
├── infrastructure/
│   ├── k8s/
│   │   ├── namespace.yaml          # Namespace: eldenring
│   │   ├── configmap.yaml          # Environment variables สำหรับ Pods
│   │   ├── postgres-statefulset.yaml  # PostgreSQL StatefulSet
│   │   ├── backend-deployment.yaml    # Backend Deployment (NodePort 30500)
│   │   └── frontend-deployment.yaml   # Frontend Deployment (NodePort 30080)
│   └── terraform/
│       ├── main.tf                 # กำหนด resource ที่จะ provision
│       ├── variables.tf            # ตัวแปร input
│       ├── outputs.tf              # ค่า output หลัง apply
│       └── terraform.tfvars.example   # ตัวอย่างไฟล์ตั้งค่า
├── monitoring/
│   └── prometheus/
│       └── prometheus.yml          # Prometheus scrape config
├── Jenkinsfile                     # กำหนด CI/CD pipeline ทุก stage
├── docker-compose.yml              # รันทั้งระบบแบบ local ด้วยคำสั่งเดียว
└── README.md
```

---

## ⚙️ สิ่งที่ต้องติดตั้งก่อน (Prerequisites)

ตรวจสอบให้แน่ใจว่าติดตั้งทุก tool ครบก่อนรันโปรเจค

| Tool | Version | หน้าที่ |
|------|---------|---------|
| Git | ≥ 2.x | จัดการ source code |
| Docker Desktop | ≥ 24.x | สร้างและรัน container (ต้องเปิดค้างไว้) |
| Docker Compose | ≥ 2.x | รันหลาย container พร้อมกันแบบ local |
| Jenkins | ≥ 2.4xx | ระบบ CI/CD automation |
| Terraform | ≥ 1.x | Provision infrastructure |
| Ansible | ≥ 2.15 | Configure environment |
| kubectl | ≥ 1.28 | สั่งงาน Kubernetes cluster |
| Minikube | latest | Kubernetes แบบ local |
| Prometheus | ≥ 2.x | เก็บ metrics |
| Grafana | ≥ 10.x | แสดง dashboard |

---

## 🏃 วิธีรันโปรเจค (Quick Start)

### 1. Clone Repository
```bash
git clone https://github.com/[username]/rpgtodolist.git
cd rpgtodolist
```

### 2. รันทั้งระบบด้วย Docker Compose (แนะนำสำหรับ local)
```bash
# Build และ start ทุก service พร้อมกัน (ครั้งแรกใช้เวลา 3–5 นาที)
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend (React) | http://localhost:3002 |
| Backend API | http://localhost:5000 |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3003 (admin / admin) |

```bash
# หยุด แต่เก็บข้อมูลไว้
docker compose down

# หยุด และล้างข้อมูลทั้งหมด (full reset)
docker compose down -v
```

### 3. เพิ่ม Boss Assets (รูปภาพ + เพลง)
วาง file ลงในโฟลเดอร์ที่กำหนด แล้ว rebuild:
```
frontend/public/assets/images/   ← boss images (.webp)
frontend/public/assets/audio/    ← boss themes (.mp3)

ชื่อไฟล์: malenia.webp, radagon.webp, mohg.webp, godfrey.webp,
           radahn.webp, morgott.webp, messmer.webp
           (เพลง: ชื่อเดียวกัน + _theme.mp3)
```
```bash
docker compose up --build
```

---

## 🔄 CI/CD Pipeline (Jenkins)

### ลำดับการทำงานของ Pipeline

```
Checkout ──▶ Test Backend ──▶ Test Frontend ──▶ Build & Push Images ──▶ Provision Infra ──▶ Deploy K8s
```

| Stage | คำอธิบาย |
|-------|----------|
| **Checkout** | ดึงโค้ดล่าสุดจาก GitHub |
| **Test — Backend** | รัน pytest พร้อม coverage report ใน Python 3.12 container |
| **Test — Frontend** | รัน npm test ใน Node.js 20 container |
| **Build & Push Images** | สร้าง Docker image และ push ขึ้น Docker Hub (เฉพาะ branch `main` / `release/*`) |
| **Provision Infrastructure** | รัน Terraform (init → validate → plan → apply) และ Ansible playbook |
| **Deploy to Kubernetes** | Apply K8s manifests และ rolling update ไปยัง image tag ใหม่ |

### วิธีตั้งค่า Jenkins
1. รัน Jenkins ด้วย Docker:
```bash
docker run -d --name jenkins -p 8080:8080 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```
2. ติดตั้ง plugin: **Git**, **Pipeline**, **Docker Pipeline**
3. เพิ่ม credentials ใน Jenkins:

| Credential ID | Type | หน้าที่ |
|--------------|------|---------|
| `registry-credentials` | Username/Password | Docker Hub login |
| `kubeconfig-prod` | Secret File | kubectl access to cluster |

4. สร้าง Pipeline job และชี้ไปที่ repository นี้
5. ตั้งค่า Webhook ใน GitHub:
   - ไปที่ **Settings → Webhooks → Add webhook**
   - Payload URL: `http://[jenkins-host]:8080/github-webhook/`
   - Content type: `application/json`
   - ติ๊ก trigger: **Just the push event**

---

## 🏗️ Infrastructure as Code

### Terraform — Provision Infrastructure
```bash
cd infrastructure/terraform
cp terraform.tfvars.example terraform.tfvars   # แก้ไขค่าตามจริง
terraform init      # ดาวน์โหลด provider plugins
terraform validate  # ตรวจสอบ config
terraform plan      # ดูว่าจะสร้างอะไรบ้าง
terraform apply     # สร้าง resource จริง
```
> **สิ่งที่ Terraform สร้าง:** Kubernetes namespace `eldenring`, ConfigMap, และ resource สำหรับ deploy แอปพลิเคชัน

### Ansible — Configure Environment
```bash
cd ansible
ansible-playbook -i inventory.ini playbook.yml \
  --extra-vars "dockerhub_username=YOUR_USER image_tag=latest" -v
```
> **สิ่งที่ Ansible ทำ:** ติดตั้ง dependencies บน node เป้าหมาย, copy kubeconfig, ตั้งค่า environment variable สำหรับ cluster

> ⚠️ **หมายเหตุ:** ใน pipeline จริง Jenkins จะเรียก Terraform และ Ansible อัตโนมัติในขั้นตอน Provision Infrastructure ไม่ต้องรันด้วยมือ

---

## ☸️ Kubernetes Deployment

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

### 3. ตรวจสอบสถานะ
```bash
kubectl get pods -n eldenring
kubectl get svc  -n eldenring
```

### ผลลัพธ์ที่ควรจะได้
```
NAME                                   READY   STATUS    RESTARTS   AGE
eldenring-backend-xxxxxxxxx-xxxxx      1/1     Running   0          2m
eldenring-frontend-xxxxxxxxx-yyyyy     1/1     Running   0          2m
postgres-0                             1/1     Running   0          2m

NAME                        TYPE       CLUSTER-IP     PORT(S)          AGE
eldenring-backend-svc       NodePort   10.96.xx.xxx   5000:30500/TCP   2m
eldenring-frontend-svc      NodePort   10.96.xx.yyy   80:30080/TCP     2m
```

### 4. เปิดแอปพลิเคชัน
```bash
minikube service eldenring-frontend-svc -n eldenring
```
หรือเข้าถึงได้ที่:
```
Frontend:  http://localhost:30080
Backend:   http://localhost:30500
```

---

## 📊 Monitoring

### Prometheus — เก็บ Metrics
- Backend expose metrics ที่ `/metrics` ผ่าน `prometheus-flask-exporter`
- Scrape ทุก **15 วินาที**

```bash
# ดู raw metrics จาก backend
curl http://localhost:5000/metrics

# เปิด Prometheus UI
# http://localhost:9090
```

### Grafana — แสดง Dashboard
1. เปิด Grafana ที่ `http://localhost:3003` (login: `admin` / `admin`)
2. ไปที่ **Connections → Data Sources → Add** เลือก **Prometheus**
3. URL: `http://prometheus:9090` → **Save & Test**
4. ไปที่ **Dashboards → Import** ใส่ Dashboard ID `11159` สำหรับ Flask metrics

### Panels ใน Dashboard

| Panel | Metric (PromQL) | แสดงข้อมูลอะไร |
|-------|-----------------|----------------|
| Request Rate | `rate(http_requests_total[1m])` | จำนวน request ต่อวินาที |
| Error Rate | `rate(http_requests_total{status=~"5.."}[1m])` | จำนวน error 5xx ต่อวินาที |
| Latency (p95) | `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))` | response time ที่ percentile 95 |
| Pod Health | `up{job="eldenring-backend"}` | service ขึ้นหรือล่ม (1/0) |

---

## 🌿 Branching Strategy

```
main        ──── โค้ดที่พร้อม production, trigger pipeline อัตโนมัติ
dev         ──── รวมโค้ดก่อน merge ขึ้น main
feature/*   ──── พัฒนา feature แต่ละอัน (เช่น feature/add-boss)
```

| Branch | Protected | คำอธิบาย |
|--------|-----------|----------|
| `main` | ✅ | trigger pipeline full (Test + Build + Deploy) เมื่อ push |
| `dev` | ✅ | trigger pipeline แค่ Test เท่านั้น |
| `feature/*` | ❌ | พัฒนาแยกกันแล้วค่อย merge เข้า dev |

---

## 🧪 API Endpoints

> ทุก request ที่ใช้ Device-based auth ต้องส่ง Header: `X-Device-ID: <uuid>`  
> (ระบบนี้ไม่ต้อง login — browser จะ generate UUID และเก็บไว้ใน localStorage อัตโนมัติ)

### Daily Session & Boss

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| `GET` | `/api/daily/bosses` | ดูรายการ Boss ทั้งหมดเรียงตามความยาก |
| `GET` | `/api/daily/session` | ดู Session ประจำวันของผู้ใช้ |
| `POST` | `/api/daily/select-boss` | เลือก Boss ประจำวัน (ได้แค่ครั้งเดียวต่อวัน) |
| `DELETE` | `/api/daily/session` | รีเซ็ต Session วันนี้ |

### Todo Tasks

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| `GET` | `/api/todo/` | ดู Todo ทั้งหมดของ Session วันนี้ |
| `POST` | `/api/todo/` | สร้าง Todo ใหม่ (ระบุ `task_name`) |
| `PATCH` | `/api/todo/tick/<id>` | ทำเครื่องหมาย Task ว่าเสร็จ (ลด HP Boss แบบ atomic) |
| `PATCH` | `/api/todo/<id>` | เปลี่ยนชื่อ Task (เฉพาะที่ยังไม่เสร็จ) |
| `DELETE` | `/api/todo/<id>` | ลบ Task (เฉพาะที่ยังไม่เสร็จ) |
| `GET` | `/metrics` | Prometheus metrics endpoint |

---

## 🐛 ปัญหาที่พบบ่อย (Troubleshooting)

**Pods ค้างอยู่ที่ `Pending` ไม่ยอม Running**
```bash
kubectl describe pod [pod-name] -n eldenring
# ดูที่ Events: อาจเกิดจาก image pull error หรือ resource ไม่พอ
```

**Jenkins pipeline ล้มเหลวตอน Docker Build**
```bash
# ตรวจว่า Docker daemon รันอยู่
sudo systemctl start docker
# เพิ่ม jenkins user เข้า docker group
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

**Prometheus แสดง target เป็น DOWN**
```bash
# ตรวจว่า backend เปิด /metrics ได้จริง
curl http://localhost:5000/metrics
# ตรวจ prometheus.yml ว่า host:port ตรงกับ service จริง
```

**API ตอบ 404 "No active session today"**
```
ต้องเลือก Boss ก่อนเสมอ โดยเรียก POST /api/daily/select-boss พร้อมส่ง boss_id
จากนั้นถึงจะสร้าง Todo ได้ในวันนั้น
```

**Todo tick ไม่ลด HP / นับซ้ำ**
```
ระบบใช้ atomic SQL UPDATE เพื่อป้องกัน race condition
หากยังพบปัญหาให้ตรวจสอบ PostgreSQL logs ใน pod:
kubectl logs postgres-0 -n eldenring
```

---

## 📚 เอกสารอ้างอิง

- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [Framer Motion](https://www.framer.com/motion/)
- [Jenkinsfile Declarative Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Terraform Documentation](https://developer.hashicorp.com/terraform/docs)
- [Ansible Documentation](https://docs.ansible.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Prometheus Flask Exporter](https://github.com/rycus86/prometheus_flask_exporter)
- [Grafana Documentation](https://grafana.com/docs/)
- [Markdown Guide](https://www.markdownguide.org/)

---

*โปรเจคนี้จัดทำขึ้นสำหรับวิชา Serverless & Cloud Computing — ภาคการศึกษาที่ 6*
