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

Turborepo monorepo бүхий онлайн сургалтын платформ. `@ocp/` namespace, pnpm workspaces.

## Commands

```bash
# Development
pnpm dev                    # Start all apps (api :3001, web :3000)
pnpm dev --filter @ocp/api  # Start API only
pnpm dev --filter @ocp/web  # Start web only

# Build
pnpm build                  # Build all
pnpm build --filter @ocp/api

# Lint & Test
pnpm lint
pnpm test
pnpm --filter @ocp/api test             # All API tests
pnpm --filter @ocp/api test -- --watch  # Watch mode
pnpm --filter @ocp/api test:e2e         # E2E tests

# Database
pnpm docker:up              # Start PostgreSQL, MongoDB, Redis, Elasticsearch
pnpm docker:down
pnpm db:generate             # Generate Prisma client
pnpm db:migrate              # Run migrations (uses prisma.config.ts)

# Formatting
pnpm format                  # Prettier on all files
```

## Tech Stack

- **Web**: Next.js 15 + TypeScript + Tailwind CSS 4 + React Query + Zustand
- **API**: NestJS 10 + Prisma 6 (PostgreSQL) + Mongoose (MongoDB)
- **Mobile**: React Native + Expo 52 + Expo Router
- **Infra**: Redis (cache/queue via Bull), Elasticsearch (search)
- **External**: Stripe, SendGrid, Twilio, Agora SDK, Cloudflare R2/Stream

## Monorepo Structure

```
apps/
  api/          # NestJS backend — port 3001, prefix /api/v1
  web/          # Next.js App Router — port 3000
  mobile/       # React Native Expo app
packages/
  typescript-config/   # Shared tsconfig (base, nestjs, nextjs, react-native, library)
  eslint-config/       # Shared ESLint rules
  shared-types/        # TypeScript interfaces shared across all apps
  validation/          # Zod schemas shared across all apps
  api-client/          # Axios-based API client
  ui-components/       # Shared React UI components
tools/                 # Dev scripts (seed, module generator)
files/                 # Architecture docs & design documents
```

## NestJS Backend Architecture

### DDD Module Structure
Each of the 15 modules in `apps/api/src/modules/` follows this pattern:
```
modules/{name}/
  domain/           # Entities, value objects, domain events
  application/      # Use cases (business logic)
  infrastructure/   # Repositories (Prisma/Mongoose), external services
  interface/        # Controllers (REST endpoints)
  dto/              # Request/response DTOs with validation
  tests/            # unit/ and integration/
  {name}.module.ts  # NestJS module definition
```

### Modules (15 total)
auth, users, courses, lessons, content, enrollments, progress, quizzes, certificates, discussions, notifications, payments, analytics, admin, live-classes

### Key Directories
- `apps/api/src/common/` — Shared guards (JWT, Roles), decorators (@CurrentUser, @Roles, @Public), interceptors, filters, pipes, utils
- `apps/api/src/config/` — NestJS `registerAs` configs: app, database, mongodb, redis, jwt, s3, stripe, elasticsearch, mail
- `apps/api/prisma/` — `schema.prisma` (models) + `prisma.config.ts` (migration URL config, Prisma 7 pattern)

### Dual-Database Pattern
PostgreSQL (Prisma) holds relational data; MongoDB (Mongoose) holds flexible-schema content. Linked by UUID references. Typical pattern: query PostgreSQL for metadata, then fetch rich content from MongoDB.

### Key Data Flows
- Progress events → Redis message queue → analytics/notification workers
- Video uploads → S3/R2 → Cloudflare Stream transcoding → webhook → Content module
- Stripe payment webhooks → enrollment creation + invoice generation
- Certificate generation → Bull Queue background job

## Reference Documents

- [architecture.mmd](files/architecture.mmd) — Full system architecture (Mermaid graph)
- [database-diagram.mermaid](files/database-diagram.mermaid) — PostgreSQL ER diagram (20+ tables)
- [mongodb-collections.md](files/mongodb-collections.md) — MongoDB collection schemas with cross-DB query patterns
