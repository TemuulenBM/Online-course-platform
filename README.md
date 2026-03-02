<div align="center">

# 🎓 Learnify

**A modern online learning platform built for the next generation of learners.**

_Create courses. Learn anything. Get certified._

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10-red?style=flat-square&logo=nestjs)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://postgresql.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)

</div>

---

## What is Learnify?

Learnify is a full-stack e-learning platform where instructors publish courses, students learn and track progress, take quizzes, and earn verified certificates — all in one place.

Think of it as a Udemy-style platform tailored for the Mongolian market, with a manual bank transfer payment flow that actually works in the local financial ecosystem.

---

## ✨ Features

### For Students

- 🔍 Browse and search courses by category
- 🎥 Watch video lessons with progress tracking
- 📝 Take quizzes with auto-grading and instant feedback
- 💬 Ask questions in course discussion forums
- 📜 Earn **PDF certificates** with QR code verification upon completion
- 📡 Join scheduled **live classes** via Agora-powered video

### For Instructors

- ✏️ Create and publish courses with rich content
- 📊 Track student enrollment and progress analytics
- 🔴 Schedule and host live sessions
- 💬 Engage with students through Q&A and comments

### For Admins

- 👥 Full user and role management
- 💳 Review bank transfer receipts and approve / reject payments
- 📈 Revenue trends, enrollment analytics, popular courses dashboard
- 🔐 Audit logs, system settings, content moderation

---

## 🏗️ Architecture

```
Learnify
├── apps/
│   ├── web/        → Next.js 16 (App Router)     · localhost:3000
│   ├── api/        → NestJS 10 REST API           · localhost:3001/api/v1
│   └── mobile/     → React Native + Expo 52
│
├── packages/
│   ├── shared-types/   → TypeScript interfaces across all apps
│   ├── validation/     → Shared Zod schemas
│   ├── api-client/     → Axios-based API client
│   └── ui-components/  → Shared React components
│
└── tools/
    └── scripts/    → Seed, cleanup, module generator
```

The backend follows **Domain-Driven Design (DDD)** with 15 independent modules, each containing `domain → application → infrastructure → interface` layers.

---

## 💳 Payment Flow

Learnify uses a manual bank transfer flow — the practical reality for payments in Mongolia:

```
Student selects a paid course
        ↓
  Order created  (status: PENDING)
        ↓
  Student transfers money to Learnify's bank account
        ↓
  Student uploads transfer receipt screenshot
        ↓
  Admin reviews the receipt  (status: PROCESSING)
        ↓
  ✅ Admin approves → Course access granted + Invoice generated
  ❌ Admin rejects  → Student notified with reason
```

---

## 🛠️ Tech Stack

| Category            | Technology                                      |
| ------------------- | ----------------------------------------------- |
| **Frontend**        | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui |
| **Backend**         | NestJS 10, TypeScript, DDD architecture         |
| **Relational DB**   | PostgreSQL 16 via Prisma 6                      |
| **Document DB**     | MongoDB via Mongoose (flexible content)         |
| **Caching & Jobs**  | Redis + Bull Queue (background processing)      |
| **Search**          | Elasticsearch                                   |
| **Mobile**          | React Native + Expo 52 + Expo Router            |
| **Live Video**      | Agora SDK (WebRTC)                              |
| **File Storage**    | Cloudflare R2 (prod) / Local filesystem (dev)   |
| **Video Streaming** | Cloudflare Stream                               |
| **Email**           | SendGrid                                        |
| **SMS**             | Twilio                                          |
| **CI/CD**           | GitHub Actions + Docker + GHCR                  |
| **Reverse Proxy**   | Nginx                                           |

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm — `npm install -g pnpm`
- Docker & Docker Compose

### 1. Clone the repo

```bash
git clone https://github.com/TemuulenBM/Online-course-platform.git
cd online-course-platform
pnpm install
```

### 2. Set up environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

Minimum required in `apps/api/.env`:

```env
DATABASE_URL=postgresql://ocp_user:ocp_password@localhost:5432/online_course_platform
MONGODB_URI=mongodb://localhost:27017/online_course_platform
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
```

### 3. Start infrastructure

```bash
pnpm docker:up   # PostgreSQL, MongoDB, Redis, Elasticsearch
```

### 4. Run migrations and seed

```bash
pnpm db:generate   # Generate Prisma client
pnpm db:migrate    # Apply migrations
pnpm db:seed       # Load sample data (20 courses, users, enrollments)
```

### 5. Start development

```bash
pnpm dev   # Web (port 3000) + API (port 3001) concurrently
```

### Seed accounts

| Role    | Email            | Password      |
| ------- | ---------------- | ------------- |
| Admin   | `admin@ocp.mn`   | `Admin123!`   |
| Teacher | `teacher@ocp.mn` | `Teacher123!` |
| Student | `student@ocp.mn` | `Student123!` |

---

## 📜 Scripts

| Command            | Description                      |
| ------------------ | -------------------------------- |
| `pnpm dev`         | Start all apps in watch mode     |
| `pnpm build`       | Production build for all apps    |
| `pnpm lint`        | Run ESLint across all workspaces |
| `pnpm format`      | Run Prettier on all files        |
| `pnpm test`        | Run all unit tests               |
| `pnpm docker:up`   | Start Docker services            |
| `pnpm docker:down` | Stop Docker services             |
| `pnpm db:generate` | Regenerate Prisma client         |
| `pnpm db:migrate`  | Apply database migrations        |
| `pnpm db:seed`     | Seed sample data                 |
| `pnpm db:cleanup`  | Remove seeded data               |

---

## 🔌 API Overview

**Base URL:** `http://localhost:3001/api/v1`

| Module        | Endpoints                 | Description                          |
| ------------- | ------------------------- | ------------------------------------ |
| Auth          | `/auth`                   | Register, login, token refresh       |
| Users         | `/users`                  | Profiles, role management            |
| Courses       | `/courses`, `/categories` | Course CRUD and categorization       |
| Lessons       | `/lessons`                | Lesson management and ordering       |
| Content       | `/content`                | Video and text content per lesson    |
| Enrollments   | `/enrollments`            | Enroll, check status, cancel         |
| Progress      | `/progress`               | Per-lesson and course-level tracking |
| Quizzes       | `/quizzes`                | Quiz builder, attempts, grading      |
| Certificates  | `/certificates`           | Generate and verify PDF certificates |
| Discussions   | `/discussions`            | Forum posts and lesson comments      |
| Notifications | `/notifications`          | Multi-channel notification system    |
| Payments      | `/payments`               | Orders, invoices, admin approval     |
| Analytics     | `/analytics`              | Revenue, trends, event tracking      |
| Admin         | `/admin`                  | Audit logs, settings, moderation     |
| Live Classes  | `/live-sessions`          | Schedule, join, Agora token          |

Postman collections for every module are in [`files/postman/`](files/postman/).

---

## 🚢 Deployment

### Production with Docker Compose

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

Services: `api` · `web` · `nginx` · `postgres` · `mongodb` · `redis`

### CI/CD Pipeline

| Workflow       | Trigger                 | Steps                                         |
| -------------- | ----------------------- | --------------------------------------------- |
| **CI**         | Every push & PR to main | Lint → Test → Build → Docker verify           |
| **Staging**    | Merge to main           | Build → Push GHCR → SSH deploy → Health check |
| **Production** | Manual trigger          | Approval gate → DB migrate → Deploy           |

Health check: `GET /api/v1` — returns live status for PostgreSQL, Redis, and MongoDB.

---

## 👤 Author

Built by **Temuulen B.** — [github.com/TemuulenBM](https://github.com/TemuulenBM)
