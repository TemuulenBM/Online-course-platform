<div align="center">

# Learnify

**A full-stack e-learning platform — built from scratch as a production-grade portfolio project.**

_Create courses. Learn anything. Get certified._

[![CI](https://github.com/TemuulenBM/Online-course-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/TemuulenBM/Online-course-platform/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=flat-square&logo=nestjs)](https://nestjs.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://postgresql.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?style=flat-square&logo=docker)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Live Demo](https://online-course-platform-web.vercel.app) · [Portfolio](https://temuulen.dev) · [API Docs (Postman)](files/postman/)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Stats](#key-stats)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Module System](#module-system)
- [Payment Flow](#payment-flow)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [API Overview](#api-overview)
- [Deployment](#deployment)
- [Author](#author)

---

## Overview

Learnify is a **Udemy-style learning management system** designed for the Mongolian market. Students browse and purchase courses, watch video lessons, take quizzes, and earn verifiable PDF certificates. Instructors manage their content and analytics. Admins oversee payments, moderation, and platform health.

This project is **not a tutorial clone** — it is a complete, production-ready platform built with enterprise patterns: Domain-Driven Design, dual-database architecture, background job queues, multi-channel notifications, live video sessions, and a full CI/CD pipeline.

---

## Key Stats

| Metric | Count |
|---|---|
| Backend modules (NestJS) | **15** |
| REST API endpoints | **100+** |
| Unit tests | **700+** |
| Shared packages | **6** |
| PostgreSQL tables | **20+** |
| MongoDB collections | **5** |
| Bull Queue processors | **5** |
| Docker services (prod) | **6** |

---

## Features

### For Students

- Browse and search courses by category
- Watch video lessons with progress tracking and resume position
- Take quizzes — auto-graded (multiple choice, true/false, fill-in-the-blank) and manual-graded (essay, code challenge)
- Earn **PDF certificates** with QR code verification on course completion
- Participate in course discussion forums and lesson comment threads
- Join scheduled **live video sessions** powered by Agora WebRTC
- Receive in-app, email, and SMS notifications

### For Instructors

- Create and publish courses with rich text and video content
- Manage lessons, quizzes, and live session schedules
- View per-lesson and overall course analytics
- Engage with students via Q&A and comment replies

### For Admins

- Full user and role management (Student / Teacher / Admin)
- Review bank transfer receipts and approve or reject payment orders
- Revenue trends, enrollment analytics, popular courses dashboard
- Audit logs, configurable system settings, content moderation queue

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Client Layer                        │
│          Next.js 16 (Web)  ·  Expo 52 (Mobile)         │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS / REST
┌──────────────────────▼──────────────────────────────────┐
│                Nginx Reverse Proxy                      │
│         /api/ → :3001  ·  / → :3000  ·  gzip           │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│              NestJS API  (port 3001)                    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │         15 Domain Modules (DDD)                 │   │
│  │  Auth · Users · Courses · Lessons · Content     │   │
│  │  Enrollments · Progress · Quizzes · Certs       │   │
│  │  Discussions · Notifications · Payments         │   │
│  │  Analytics · Admin · Live Classes               │   │
│  └──────────┬──────────────────────┬──────────────┘   │
│             │                      │                    │
│  ┌──────────▼──────┐  ┌───────────▼──────────────┐    │
│  │  PostgreSQL 16  │  │      MongoDB 7            │    │
│  │  (Prisma ORM)   │  │      (Mongoose)           │    │
│  │  Structured     │  │  Flexible content         │    │
│  │  relational     │  │  Quiz Q&A · Discussions   │    │
│  └─────────────────┘  └──────────────────────────┘    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │      Redis  ·  Bull Queue  ·  Elasticsearch      │  │
│  │  Cache · Jobs · Search                           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### DDD Module Structure

Every module follows a strict four-layer pattern:

```
modules/{name}/
  domain/           # Entities, value objects, domain events
  application/      # Use cases — all business logic lives here
  infrastructure/   # Prisma / Mongoose repositories, external services
  interface/        # NestJS controllers (HTTP)
  dto/              # Validated request / response DTOs (class-validator)
  tests/
    unit/           # Use-case and controller tests with mocks
    integration/    # Repository-level tests against real DBs
  {name}.module.ts
```

### Key Data Flows

```
Certificate auto-generation:
  CompleteLessonUseCase → enrollment auto-complete → Bull Queue → PDF + QR → S3

Payment approval:
  Admin approves order → Bull Queue → Enrollment created + Invoice PDF + Notification

Notification delivery:
  NotificationService.send() → DB record → Bull Queue → SendGrid / Twilio / Push

Live video:
  POST /live-sessions/:id/join → Agora RTC token → client connects via Agora SDK
```

---

## Tech Stack

| Category | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, TanStack Query 5, Zustand 5 |
| **Backend** | NestJS 10, TypeScript 5.6, Domain-Driven Design |
| **Relational DB** | PostgreSQL 16 via Prisma 7 |
| **Document DB** | MongoDB 7 via Mongoose 8 (quiz questions, discussions, course content) |
| **Caching & Queue** | Redis 7 + Bull Queue (certificates, notifications, invoices, analytics) |
| **Search** | Elasticsearch |
| **Mobile** | React Native + Expo 52 + Expo Router |
| **Live Video** | Agora SDK (WebRTC token generation on server) |
| **File Storage** | Cloudflare R2 (prod) / Local filesystem (dev) — swappable via DI token |
| **Video Streaming** | Cloudflare Stream |
| **PDF Generation** | Puppeteer-core (certificates A4 landscape, invoices A4 portrait) |
| **Email** | SendGrid |
| **SMS** | Twilio |
| **Auth** | JWT access (15 min) + refresh tokens (7 days) with rotation, bcrypt passwords |
| **CI/CD** | GitHub Actions — lint · test · build · Docker verify on every push |
| **Container** | Docker multi-stage builds, non-root user, GHCR registry |
| **Reverse Proxy** | Nginx — routing, gzip, security headers, 100 MB upload limit |
| **Monorepo** | Turborepo + pnpm workspaces (`@ocp/` namespace) |

---

## Module System

| Module | Endpoints | Highlights |
|---|---|---|
| **Auth** | 7 | JWT rotation, refresh token hashing, session management |
| **Users** | 7 | Redis-cached profiles, role management |
| **Courses** | 9 + 5 categories | Slug generation, DRAFT→PUBLISHED→ARCHIVED flow |
| **Lessons** | 7 | Drag-and-drop reorder, lesson type enum |
| **Content** | 6 | MongoDB content, S3 upload, local dev fallback |
| **Enrollments** | 8 | Prerequisite checks, re-enrollment, auto-complete trigger |
| **Progress** | 7 | Video position tracking, auto enrollment completion |
| **Quizzes** | 15 | 5 question types, auto-grading, randomization, attempt limits |
| **Certificates** | 6 | Puppeteer PDF, QR code, Bull Queue, public verification URL |
| **Discussions** | 13 + 6 | Forum Q&A + lesson comments, voting, pin/lock/flag |
| **Notifications** | 7 | In-app + email + SMS + push, per-user preferences |
| **Payments** | 10 | Manual bank transfer flow, receipt upload, admin approval, invoice PDF |
| **Analytics** | 8 | Revenue/enrollment trends, event tracking, course analytics |
| **Admin** | 8 | Audit logs, system settings, content moderation, health check |
| **Live Classes** | 14 | Agora token, attendance tracking, recording webhook, reminder queue |

---

## Payment Flow

Learnify uses a manual bank transfer flow — the practical reality for payments in Mongolia:

```
Student selects a paid course
        ↓
  Order created  (PENDING)
        ↓
  Student transfers money → uploads receipt screenshot
        ↓
  Admin reviews receipt  (PROCESSING)
        ↓
  ✅ Admin approves → PAID → Bull Queue:
       • Enrollment activated
       • Invoice PDF generated (Puppeteer)
       • Email notification sent
  ❌ Admin rejects  → Student notified with reason
```

The `IPaymentGateway` interface is injected via DI token (`PAYMENT_GATEWAY`) — swappable to QPay or Stripe without changing business logic.

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm — `npm install -g pnpm`
- Docker & Docker Compose

### 1. Clone and install

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
pnpm dev   # Web :3000 + API :3001 concurrently
```

### Seed accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@ocp.mn` | `Admin123!` |
| Teacher | `teacher@ocp.mn` | `Teacher123!` |
| Student | `student@ocp.mn` | `Student123!` |

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in watch mode |
| `pnpm build` | Production build for all apps |
| `pnpm lint` | ESLint across all workspaces |
| `pnpm format` | Prettier on all files |
| `pnpm test` | Run all unit tests |
| `pnpm docker:up` | Start Docker services |
| `pnpm docker:down` | Stop Docker services |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm db:migrate` | Apply database migrations |
| `pnpm db:seed` | Seed sample data |
| `pnpm db:cleanup` | Remove seeded data |

---

## API Overview

**Base URL:** `http://localhost:3001/api/v1`

| Module | Base Path | Description |
|---|---|---|
| Auth | `/auth` | Register, login, token refresh, password reset |
| Users | `/users` | Profiles, role management |
| Courses | `/courses`, `/categories` | Course CRUD and categorization |
| Lessons | `/lessons` | Lesson management and ordering |
| Content | `/content` | Video and text content per lesson |
| Enrollments | `/enrollments` | Enroll, check status, cancel |
| Progress | `/progress` | Per-lesson and course-level tracking |
| Quizzes | `/quizzes` | Quiz builder, attempts, grading |
| Certificates | `/certificates` | Generate and verify PDF certificates |
| Discussions | `/discussions/posts`, `/discussions/comments` | Forum and lesson comments |
| Notifications | `/notifications` | Multi-channel notification system |
| Payments | `/payments/orders`, `/payments/subscriptions`, `/payments/invoices` | Orders and invoices |
| Analytics | `/analytics` | Revenue, trends, event tracking |
| Admin | `/admin` | Audit logs, settings, moderation |
| Live Classes | `/live-sessions` | Schedule, join, Agora token |

Postman collections for every module → [`files/postman/`](files/postman/)

---

## Deployment

### Production with Docker Compose

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

Services: `api` · `web` · `nginx` · `postgres` · `mongodb` · `redis`

### CI/CD Pipeline

| Workflow | Trigger | Steps |
|---|---|---|
| **CI** | Every push & PR | Lint → Test → Build → Docker verify |
| **Staging** | Merge to `main` | Build → Push GHCR → SSH deploy → Health check |
| **Production** | Manual trigger | GitHub Environment approval → DB migrate → Deploy |

**Health check:** `GET /api/v1` — returns live status for PostgreSQL, Redis, and MongoDB.

```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "services": { "database": "ok", "redis": "ok", "mongodb": "ok" }
}
```

---

## Author

Built by **Temuulen B.**

- Portfolio: [temuulen.dev](https://temuulen.dev)
- GitHub: [@TemuulenBM](https://github.com/TemuulenBM)

---

<div align="center">

MIT License · Built with TypeScript · Powered by NestJS & Next.js

</div>
