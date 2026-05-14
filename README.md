# 📋 Student Attendance System

Hệ thống điểm danh sinh viên — Đồ án môn Triển khai Hệ thống.

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────┐
│                   Docker Compose                │
│                                                 │
│  ┌──────────────┐        ┌──────────────────┐   │
│  │   Frontend   │──────▶│     Backend      │   │
│  │  React/Vite  │  /api  │  Express + Node  │   │
│  │  nginx:80    │        │  Port 3001       │   │
│  └──────────────┘        └────────┬─────────┘   │
│                                   │             │
│                          ┌────────▼─────────┐   │
│                          │    SQLite DB     │   │
│                          │  /app/data/*.db  │   │
│                          │  (Docker Volume) │   │
│                          └──────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Bảng dữ liệu
- **students**: id, student_code, full_name, class_name, email, created_at
- **attendance**: id, student_id (FK), date, status (present/absent/late), note, created_at

## 🚀 Chạy nhanh (Docker)

```bash
# 1. Clone repo
git clone https://github.com/<your-org>/attendance-system.git
cd attendance-system

# 2. Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Khởi động toàn bộ hệ thống
docker compose up -d --build

# 4. Kiểm tra
curl http://localhost/api/health
# → {"ok":true}

# 5. Mở trình duyệt
open http://localhost
```

## 🔧 Chạy Development

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev        # port 3001

# Frontend (terminal khác)
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:3001
npm install
npm run dev        # port 5173
```

## 📡 API Endpoints

| Method | Path | Mô tả |
|--------|------|-------|
| GET | `/api/health` | Kiểm tra hệ thống |
| GET | `/api/students` | Danh sách sinh viên |
| POST | `/api/students` | Thêm sinh viên |
| PUT | `/api/students/:id` | Cập nhật |
| DELETE | `/api/students/:id` | Xóa |
| GET | `/api/attendance` | Danh sách điểm danh (filter: date, class_name) |
| POST | `/api/attendance` | Chấm điểm danh 1 SV |
| POST | `/api/attendance/bulk` | Chấm cả lớp |
| GET | `/api/attendance/summary` | Thống kê theo ngày |

### Test bằng curl
```bash
# Health check
curl http://localhost:3001/api/health

# Danh sách sinh viên
curl http://localhost:3001/api/students

# Điểm danh
curl -X POST http://localhost:3001/api/attendance \
  -H "Content-Type: application/json" \
  -d '{"student_id":1,"date":"2024-01-20","status":"present"}'
```

## 🐳 Docker Commands

```bash
# Khởi động
docker compose up -d

# Xem log
docker logs attendance_backend -f
docker logs attendance_frontend -f

# Xem container status
docker compose ps

# Dừng hệ thống
docker compose down

# Xóa cả volume (reset DB)
docker compose down -v
```

## 🔄 CI/CD Flow (GitHub Actions)

```
Push to main/dev
      │
      ├── backend-ci
      │   ├── npm install
      │   ├── eslint (lint)
      │   └── jest (test)
      │
      ├── frontend-ci
      │   ├── npm install
      │   ├── eslint (lint)
      │   └── vite build
      │
      └── docker-build (chỉ khi lint+test pass)
          ├── build backend image
          ├── build frontend image
          └── deploy (chỉ branch main)
              └── SSH vào server → git pull → docker compose up
```

## 🌿 Git Branching

```
main     ← production, protected
dev      ← integration
feature/ ← mỗi tính năng
```

```bash
git checkout -b feature/add-export-excel
git commit -m "feat: add export to Excel"
git push origin feature/add-export-excel
# → tạo Pull Request vào dev
```

## 🔑 Environment Variables

### Backend (`backend/.env`)
```
PORT=3001
NODE_ENV=development
DB_PATH=./data/attendance.db
CORS_ORIGIN=http://localhost:5173
```

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:3001
```

> ⚠️ **KHÔNG commit file `.env`**. Chỉ commit `.env.example`.

## 📋 Phân vai

| Vai | Nhiệm vụ | File chính |
|-----|----------|-----------|
| Backend Engineer | API + DB | `backend/server.js`, `backend/routes/` |
| Frontend Engineer | UI + gọi API | `frontend/src/` |
| DevOps Engineer | CI/CD | `.github/workflows/ci-cd.yml` |
| Infrastructure Engineer | Deploy | `docker-compose.yml`, Dockerfile |
| QA/SRE Engineer | Test + Debug | `INCIDENT_REPORT.md`, `server.test.js` |

## 🧪 Chạy Tests

```bash
cd backend
npm test
```
