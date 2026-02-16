# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules

1. **Монгол хэлээр харилцах**: Хэрэглэгчтэй ЗААВАЛ монгол хэлээр, тайлбарлах өнгөөр харилцана. Код доторх comment, variable нэр, commit message зэрэг нь англиар байж болно, гэхдээ хэрэглэгчтэй ярих бүх текст монголоор байна.
2. **Commit-д authored текст бичихгүй**: `Co-Authored-By` мөрийг commit message-д хэзээ ч оруулахгүй.
3. **Системийн архитектурыг дагах**: `files/architecture.mmd` дээрх архитектурыг чанд дагана — модулийн бүтэц, өгөгдлийн урсгал, технологийн сонголтуудыг өөрчлөхгүй.
4. **Модулиудыг дараалалтай хөгжүүлэх**: `files/Дараалал.docx` дээрх дарааллыг баримтлана:
   - Phase 1: Auth Module → User Module
   - Phase 2: Course Module → Lesson Module → Content Module
   - Phase 3: Enrollment → Progress → Quiz → Certificate Module
   - Phase 4: Discussion → Notification Module
   - Phase 5: Payment → Analytics → Admin Module
   - Phase 6: Live Class Module
   - Phase 7: React Native Mobile App
5. **Төлөвлөгөө/баримт бичгийг дагах**: `files/` дотор байгаа бүх баримт бичгүүдийг (архитектур, database schema, MongoDB collections) лавлагаа болгон ашиглана. Шинэ шийдвэр гаргахдаа эдгээр баримт бичигтэй нийцэж байгаа эсэхийг шалгана.

## Project Overview

Online course platform (planning phase — no source code yet). The `files/` directory contains architecture diagrams, database schemas, and design documents (some in Mongolian).

## Planned Technology Stack

- **Frontend Web**: Next.js with TypeScript, Tailwind CSS, React Query, Zustand, Server Components
- **Frontend Mobile**: React Native with Expo
- **Backend**: NestJS (modular architecture)
- **Primary DB**: PostgreSQL (structured data — users, enrollments, payments, progress, certificates) via Prisma ORM
- **Document DB**: MongoDB (flexible schema — course content, quiz questions/answers, discussions, comments, reviews, assignment submissions)
- **Cache/Queue**: Redis (sessions, API cache, rate limiting) + Bull Queue (background jobs)
- **Search**: Elasticsearch (course discovery, full-text search, autocomplete)
- **File Storage**: Cloudflare R2 / S3 (videos, documents, images, certificates) + Cloudflare CDN
- **Video Processing**: Cloudflare Stream / Mux (transcoding, HLS/DASH streaming)
- **Payments**: Stripe (subscriptions, invoicing, refunds)
- **Auth**: JWT + refresh tokens, OAuth (Google/Facebook), 2FA
- **Live Classes**: WebRTC via Agora SDK
- **Monitoring**: Winston/Pino logging, Prometheus + Grafana, Sentry error tracking

## Architecture

### Dual-Database Pattern
PostgreSQL holds relational/transactional data; MongoDB holds flexible-schema content. They are linked by UUID references — MongoDB documents store `course_id`, `lesson_id`, `quiz_id`, `user_id` etc. as `"uuid-from-postgresql"` strings. Typical access pattern: query PostgreSQL for metadata first, then fetch rich content from MongoDB.

### NestJS Module Structure
The backend is organized into these module groups:
- **Core**: Auth (JWT, OAuth, 2FA), User (profiles, roles: student/teacher/admin)
- **Course Management**: Course (CRUD, categories, pricing, enrollment), Lesson (types, sequencing, prerequisites), Content (upload, S3, CDN)
- **Learning**: Progress (completion tracking, streaks), Quiz (question bank, auto-grading, multiple types), Certificate (PDF generation, QR verification)
- **Engagement**: Discussion (forums, Q&A, moderation), Live Class (WebRTC, scheduling, recording, attendance), Notification (email/SMS/push/in-app)
- **Business**: Payment (Stripe, subscriptions, refunds), Analytics (user behavior, revenue reports), Admin (user management, content approval, audit logs)

### Key Data Flows
- Progress events are published to Redis message queue, consumed by analytics and notification workers
- Video uploads go to S3/R2, trigger transcoding via Cloudflare Stream/Mux, webhook notifies Content module when done
- Payment webhooks from Stripe trigger enrollment creation and invoice generation
- Certificate generation is queued as a background job (Bull Queue)

## Reference Documents

- [architecture.mmd](files/architecture.mmd) — Full system architecture (Mermaid graph)
- [database-diagram.mermaid](files/database-diagram.mermaid) — PostgreSQL ER diagram (20+ tables)
- [mongodb-collections.md](files/mongodb-collections.md) — MongoDB collection schemas with examples and cross-DB query patterns
