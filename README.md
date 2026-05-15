# 🚀 RPG Todo List — Daily Quest — ENG23 3074

> _เว็บแอปบันทึกภารกิจประจาวันในรูปแบบเกมต่อสู้บอส สร้างด้วย Python Flask และ React containerize ด้วย Docker และ deploy บน Kubernetes ผ่าน Jenkins pipeline พร้อมระบบ monitoring ด้วย Prometheus และ Grafana_

---

## 👥 สมาชิกในกลุ่ม

| รหัสนักศึกษา | ชื่อ-นามสกุล | ความรับผิดชอบ |
|-------------|-------------|---------------|
| B6612122 | นายธนพล สุดโต | Git, App Development |
| B6618520 | นายธนภัทร เงินเส็ง | Jenkins, Docker |
| B6512866 | นายเจษฎา เชือดขุนทด | Terraform, Ansible |
| B6611460 | นายสิษฐ์โรจ กันทรสุรพล | Kubernetes, Monitoring |

---

## 📌 ภาพรวมโปรเจค

### แอปพลิเคชัน
- **ชื่อ:** RPG Todo List — Daily Quest
- **ประเภท:** Full-stack Web Application
- **ภาษา / Framework:** Python Flask, React
- **คำอธิบาย:** โปรเจกต์นี้เปลี่ยนการทำ todo list แบบปกติให้กลายเป็น daily quest สไตล์ Elden Ring ผู้ใช้เลือกบอสประจำวัน เพิ่มรายการงาน และเมื่อทำงานเสร็จแต่ละข้อจะลด HP ของบอสลงจนเคลียร์ภารกิจในวันนั้นได้ ระบบนี้ช่วยทำให้การจัดการงานประจำวันมีความสนุกและเห็นความคืบหน้าแบบเกมมากขึ้น

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
                       │  Service (NodePort 30080/30500) │
                       └─────────────────────────────────┘
                                        │
                        ┌───────────────┴───────────────┐
                        ▼                               ▼
                   Prometheus                        Grafana
                  (scrape /metrics)            (dashboard panels)
```

---

## 📁 โครงสร้าง Repository

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

## ⚙️ สิ่งที่ต้องติดตั้งก่อน (Prerequisites)

ตรวจสอบให้แน่ใจว่าติดตั้งทุก tool ครบก่อนรันโปรเจค

| Tool | Version | หน้าที่ |
|------|---------|---------|
| Git | ≥ 2.x | จัดการ source code |
| Docker Desktop | ≥ 24.x | สร้างและรัน container |
| Jenkins | ≥ 2.5xx | ระบบ CI/CD automation |
| Terraform | ≥ 1.6 | Provision infrastructure |
| Ansible | ≥ 2.15 | Configure environment |
| kubectl | ≥ 1.28 | สั่งงาน Kubernetes cluster |
| Kubernetes | Docker Desktop / kind | Kubernetes แบบ local |
| Prometheus | ≥ 2.x | เก็บ metrics |
| Grafana | ≥ 10.x | แสดง dashboard |

---

## 🏃 วิธีรันโปรเจค (Quick Start)

### 1. Clone Repository
```bash
git clone https://github.com/ludwig-del/rpgtodolist.git
cd rpgtodolist
```

### 2. รันแอปด้วย Docker Compose
```bash
docker compose up -d --build
```

### 3. Service URLs
```text
Frontend App : http://localhost:3002
Backend API  : http://localhost:5000
Prometheus   : http://localhost:9090
Grafana      : http://localhost:3003
```

### 4. หยุดการทำงานของระบบ
```bash
docker compose down
```

---

## 🔄 CI/CD Pipeline (Jenkins)

### ลำดับการทำงานของ Pipeline

```text
Checkout ──▶ Validate Parameters ──▶ Terraform Init ──▶ Terraform Apply ──▶ Deploy Backend ──▶ Deploy Frontend
```

| Stage | คำอธิบาย |
|-------|----------|
| **Checkout** | ดึงโค้ดล่าสุดจาก GitHub branch `sun` |
| **Validate Parameters** | ตรวจสอบ namespace, image tag และรูปแบบ image ที่จะใช้ |
| **Terraform Init** | initialize Terraform provider และ working directory |
| **Terraform Apply** | import resource เดิมและ apply infrastructure changes |
| **Deploy Backend** | ใช้ Ansible rollout backend image ไปยัง Kubernetes |
| **Deploy Frontend** | ใช้ Ansible rollout frontend image ไปยัง Kubernetes |

### วิธีตั้งค่า Jenkins
1. ติดตั้ง Jenkins และเปิดใช้งานบนเครื่องหรือบน Kubernetes cluster
2. ติดตั้ง plugin ที่จำเป็นสำหรับ Pipeline, Git และ Docker usage
3. เพิ่ม credentials สำหรับ GitHub, Docker Hub และ kubeconfig
4. สร้าง jobs สำหรับ backend build, frontend build และ deploy โดยชี้ไปที่ repository นี้และ branch `sun`
5. ตั้งค่า Webhook ใน GitHub ได้ถ้าต้องการ trigger อัตโนมัติ แต่สำหรับโปรเจกต์นี้สามารถใช้ manual trigger ใน Jenkins ได้ตามที่อาจารย์อนุญาต

### Jenkins Pipelines ที่ใช้ในโปรเจค

| Pipeline File | หน้าที่ |
|---------------|---------|
| `jenkins/Jenkinsfile_backend_build` | ทดสอบ backend และ build/push backend image |
| `jenkins/Jenkinsfile_frontend_build` | ทดสอบ frontend และ build/push frontend image |
| `jenkins/Jenkinsfile_deploy` | รัน Terraform + Ansible เพื่อ deploy ไป Kubernetes |

---

## 🏗️ Infrastructure as Code

### Terraform — Provision Infrastructure
```bash
cd terraform
terraform init
terraform plan
terraform apply
```
> **สิ่งที่ Terraform สร้าง:** Kubernetes namespace, ConfigMap, Secret, PostgreSQL StatefulSet และ Service, Backend Deployment และ Service, Frontend Deployment และ Service

### Ansible — Configure Environment
```bash
ansible-playbook -i ansible/backend/hosts.ini ansible/backend/deploy_backend.yml
ansible-playbook -i ansible/frontend/hosts.ini ansible/frontend/deploy_frontend.yml
```
> **สิ่งที่ Ansible ทำ:** ตรวจสอบความพร้อมของ resource, อัปเดต image ของ backend และ frontend, รอ rollout ให้เสร็จ และยืนยันว่า deployment กลับมาทำงานได้

> ⚠️ **หมายเหตุ:** ใน pipeline จริง Jenkins จะเรียก Terraform และ Ansible อัตโนมัติในขั้นตอน Deploy ไม่ต้องรันด้วยมือ

---

## ☸️ Kubernetes Deployment

### Apply Manifests ด้วยตัวเอง
```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

### ตรวจสอบสถานะ
```bash
kubectl get pods -n eldenring
kubectl get svc -n eldenring
```

### ผลลัพธ์ที่ควรจะได้
```text
NAME                                  READY   STATUS    RESTARTS   AGE
eldenring-backend-xxxxxxxxxx-xxxxx    1/1     Running   0          2m
eldenring-backend-xxxxxxxxxx-yyyyy    1/1     Running   0          2m
eldenring-frontend-xxxxxxxxxx-xxxxx   1/1     Running   0          2m
eldenring-frontend-xxxxxxxxxx-yyyyy   1/1     Running   0          2m
postgres-0                            1/1     Running   0          2m

NAME                     TYPE       CLUSTER-IP      PORT(S)          AGE
eldenring-backend-svc    NodePort   10.xx.xx.xx     5000:30500/TCP   2m
eldenring-frontend-svc   NodePort   10.xx.xx.xx     80:30080/TCP     2m
postgres-svc             ClusterIP  None            5432/TCP         2m
```

### เข้าถึงแอปพลิเคชัน
```text
Frontend : http://localhost:30080
Backend  : http://localhost:30500/metrics
```

---

## 📊 Monitoring

### Prometheus — เก็บ Metrics
- ไฟล์ config: `monitoring/prometheus.yml`
- Scrape ทุก 15 วินาที
- Target endpoint: `/metrics`

รัน Prometheus:
```bash
# ถ้าใช้ docker compose ระบบจะรันให้อัตโนมัติ
# เปิด UI ที่ http://localhost:9090
```

### Grafana — แสดง Dashboard
- ไฟล์ dashboard: `monitoring/grafana/dashboards/eldenring-overview.json`
- Data source: Prometheus (`http://prometheus:9090`)
- เปิดใช้งานที่ `http://localhost:3003`

### Panels ใน Dashboard

| Panel | Metric (PromQL) | แสดงข้อมูลอะไร |
|-------|-----------------|----------------|
| Request Rate | `sum(rate(flask_http_request_total[5m]))` | จำนวน request ต่อวินาที |
| p95 Latency | `histogram_quantile(0.95, sum by (le) (rate(flask_http_request_duration_seconds_bucket[5m])))` | response time ที่ percentile 95 |
| Backend Memory | `process_resident_memory_bytes` | memory usage ของ backend |
| Total Requests | `sum(flask_http_request_total)` | จำนวน request สะสมทั้งหมด |

---

## 🌿 Branching Strategy

```text
feature/* ──▶ sun ──▶ main
```

| Branch | Protected | คำอธิบาย |
|--------|-----------|----------|
| `main` | ใช่ | โค้ดที่พร้อมส่งและเป็น stable branch |
| `sun` | ไม่ | branch สำหรับ integration และ Jenkins demo |
| `feature/*` | ไม่ | พัฒนา feature แยกก่อน merge เข้า `sun` |

---

## 🧪 API Endpoints

| Method | Endpoint | คำอธิบาย |
|--------|----------|----------|
| `POST` | `/api/auth/register` | สมัครผู้ใช้ใหม่ |
| `POST` | `/api/auth/login` | เข้าสู่ระบบและรับ JWT |
| `GET` | `/api/daily/bosses` | ดึงรายชื่อบอสทั้งหมด |
| `POST` | `/api/daily/select-boss` | เลือกบอสประจำวัน |
| `GET` | `/api/daily/session` | ดู session ประจำวันปัจจุบัน |
| `GET` | `/api/todo/` | ดึงรายการ todo ปัจจุบัน |
| `POST` | `/api/todo/` | เพิ่ม todo ใหม่ |
| `PATCH` | `/api/todo/tick/<id>` | ทำเครื่องหมายว่างานเสร็จ |
| `DELETE` | `/api/todo/<id>` | ลบ todo |
| `GET` | `/metrics` | Prometheus metrics endpoint |

---

## 🐛 ปัญหาที่พบบ่อย (Troubleshooting)

**Docker Desktop หรือ Kubernetes ไม่ยอมเริ่มทำงาน**
```bash
docker ps
kubectl get pods -A
```

**Jenkins เข้าถึง cluster ไม่ได้**
```bash
kubectl get pods -n default
kubectl get svc -n default
```

**Prometheus แสดง target เป็น DOWN**
```bash
curl http://localhost:5000/metrics
```

**Frontend หรือ Backend เข้าไม่ได้หลัง deploy**
```bash
kubectl get svc -n eldenring
kubectl rollout status deployment/eldenring-backend -n eldenring
kubectl rollout status deployment/eldenring-frontend -n eldenring
```

---

## 📚 เอกสารอ้างอิง

- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Terraform Documentation](https://developer.hashicorp.com/terraform/docs)
- [Ansible Documentation](https://docs.ansible.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Markdown Syntax](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax)

---

## 📄 ข้อมูลการส่งงาน

- วิชา: **ENG23 3074 — Serverless and Cloud Architectures**
- อาจารย์ผู้สอน: **ดร. นันทวุฒิ คะอังกุ**
- ภาควิชาวิศวกรรมคอมพิวเตอร์
