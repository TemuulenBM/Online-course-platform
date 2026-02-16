# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules

1. **Монгол хэлээр харилцах**: Хэрэглэгчтэй ЗААВАЛ монгол хэлээр, тайлбарлах өнгөөр харилцана. Variable нэр англиар байж болно, гэхдээ хэрэглэгчтэй ярих бүх текст монголоор байна.
7. **Код дотор монголоор бичих**: Хөгжүүлэлтийн явцад бүх comment, JSDoc/TSDoc docblock, тайлбар зэргийг ЗААВАЛ монгол хэлээр бичнэ. Variable болон function нэрс англиар байна, харин тэдгээрийн тайлбар, comment-ууд монголоор байна.
2. **Commit message монголоор бичих**: Commit message-ийг ЗААВАЛ монгол хэлээр бичнэ.
3. **Commit-д authored текст бичихгүй**: `Co-Authored-By` мөрийг commit message-д хэзээ ч оруулахгүй.
4. **Системийн архитектурыг дагах**: `files/architecture.mmd` дээрх архитектурыг чанд дагана — модулийн бүтэц, өгөгдлийн урсгал, технологийн сонголтуудыг өөрчлөхгүй.
5. **Модулиудыг дараалалтай хөгжүүлэх**: `files/Дараалал.docx` дээрх дарааллыг баримтлана:
   - Phase 1: Auth Module → User Module
   - Phase 2: Course Module → Lesson Module → Content Module
   - Phase 3: Enrollment → Progress → Quiz → Certificate Module
   - Phase 4: Discussion → Notification Module
   - Phase 5: Payment → Analytics → Admin Module
   - Phase 6: Live Class Module
   - Phase 7: React Native Mobile App
6. **Төлөвлөгөө/баримт бичгийг дагах**: `files/` дотор байгаа бүх баримт бичгүүдийг (архитектур, database schema, MongoDB collections) лавлагаа болгон ашиглана. Шинэ шийдвэр гаргахдаа эдгээр баримт бичигтэй нийцэж байгаа эсэхийг шалгана.
8. **Тест заавал бичих**: Хөгжүүлэлтийн явцад код бичихдээ ЗААВАЛ тест дагалдуулна. Модуль бүрийн `tests/` хавтаст unit болон integration тест бичнэ. Use case (application давхарга), controller (interface давхарга), repository (infrastructure давхарга) тус бүрд тест бичнэ. Тест бичээгүй код commit хийхгүй.
9. **Модуль дуусмагц CLAUDE.md шинэчлэх**: Модулийн хөгжүүлэлт бүрэн дууссаны дараа CLAUDE.md-ийн `## Implemented Modules` хэсэгт тухайн модулийн мэдээллийг нэмнэ: гол endpoint-ууд, export хийсэн service-ууд, хамаарал (dependencies), онцлог шийдвэрүүд. Ингэснээр дараагийн conversation-д кодыг дахин судлах шаардлагагүй болж token хэмнэнэ.

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
- `apps/api/src/common/` — Shared guards (JWT, Roles), decorators (@CurrentUser, @Roles, @Public), interceptors, filters, pipes, utils, redis (@Global RedisModule + RedisService), prisma (@Global PrismaModule)
- `apps/api/src/common/constants/` — Дахин ашиглах constants (throttle limits гэх мэт)
- `apps/api/src/config/` — NestJS `registerAs` configs: app, database, mongodb, redis, jwt, throttle, s3, stripe, elasticsearch, mail
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

## Implemented Modules

<!-- Модуль бүрэн дууссаны дараа энд нэмнэ: endpoint-ууд, export service-ууд, хамаарал, онцлог шийдвэрүүд -->

### Auth Module (Phase 1)

**Endpoints** (`/api/v1/auth`):
- `POST /register` — Шинэ хэрэглэгч бүртгүүлэх (public)
- `POST /login` — Нэвтрэх (public)
- `POST /refresh` — Токен шинэчлэх (public)
- `POST /logout` — Системээс гарах (JWT required)
- `POST /forgot-password` — Нууц үг сэргээх хүсэлт (public)
- `POST /reset-password` — Нууц үг шинэчлэх (public)
- `GET /me` — Одоогийн хэрэглэгчийн мэдээлэл (JWT required)

**Export хийсэн service-ууд**: `UserRepository`, `TokenService`

**Хамаарал**: `PrismaModule` (@Global), `PassportModule`, `JwtModule`, `ConfigModule`, `UsersModule`

**Онцлог шийдвэрүүд**:
- JWT access token (15 мин) + Refresh token (7 хоног) — Token rotation хэрэглэнэ
- Refresh token-ийг SHA-256 хэшлэж хадгална (bcrypt биш — хурдны учир)
- User enumeration хамгаалалт: login болон forgot-password дээр ижил хариу буцаана
- Нууц үг шинэчлэхэд бүх сесси болон refresh token цуцлагдана
- `PrismaModule` нь `@Global()` — бусад модулиуд дахин import хийх шаардлагагүй
- firstName/lastName RegisterDto-д байгаа — Users модуль хэрэгжсэний дараа UserProfile-д хадгалагдана
- Auth модуль `UsersModule`-г import хийж `UserProfileRepository`-г ашиглана (register үед profile үүсгэх)

**Тест**: 7 test suite, 22 unit тест (use-case + controller)

### Users Module (Phase 1)

**Endpoints** (`/api/v1/users`):
- `GET /me/profile` — Миний профайл авах (JWT required)
- `POST /me/profile` — Миний профайл үүсгэх (JWT required)
- `PATCH /me/profile` — Миний профайл шинэчлэх (JWT required)
- `GET /:id/profile` — Хэрэглэгчийн профайл авах (JWT required)
- `GET /` — Хэрэглэгчдийн жагсаалт pagination-тэй (ADMIN only)
- `PATCH /:id/role` — Хэрэглэгчийн эрх солих (ADMIN only)
- `DELETE /:id` — Хэрэглэгч устгах (ADMIN only)

**Export хийсэн service-ууд**: `UserProfileRepository`

**Хамаарал**: `PrismaModule` (@Global), `RedisModule` (@Global)

**Онцлог шийдвэрүүд**:
- UserProfile нь User-тэй one-to-one хамаарал (`@unique` on userId)
- Redis кэшлэлт: профайл авах үед Redis-ээс эхлээд, байхгүй бол DB (TTL 15 мин, `user:profile:{userId}` key)
- Профайл шинэчлэх/устгах үед кэш invalidate хийгдэнэ
- Auth модулийн RegisterUseCase-д profile үүсгэлт нэмэгдсэн (firstName, lastName хадгалагдана)
- `RedisModule` нь `@Global()` — common/redis/ дотор, ioredis ашиглана
- Admin endpoint-ууд `@Roles('ADMIN')` + `RolesGuard`-аар хамгаалагдсан
- Профайл шинэчлэхэд өөрийн эсвэл admin эрхийн шалгалт (`ForbiddenException`)

**Тест**: 8 test suite, 25 unit тест (use-case + controller + cache service)

### API Gateway тохиргоо

**Middleware** (`main.ts`):
- `helmet()` — Security headers (X-Frame-Options, X-Content-Type-Options, CSP гэх мэт)
- `compression()` — Response compression
- `enableCors()` — Origin хязгаарлалт (`app.url` config-оос), credentials: true
- `useGlobalPipes(ValidationPipe)` — whitelist + transform
- `useGlobalFilters(AllExceptionsFilter, HttpExceptionFilter)` — Бүх алдааг нэг хэлбэрээр буцаах
- `useGlobalInterceptors(LoggingInterceptor, TransformInterceptor)` — Лог + `{ success, data }` wrapper

**Rate Limiting** (`@nestjs/throttler`):
- Global: 3 давхар хязгаарлалт (short: 3 req/sec, medium: 20 req/10sec, long: 100 req/min)
- `ThrottlerModule.forRootAsync` — `throttle.config.ts`-ээс ConfigService-ээр уншина (env-ээр тохируулах боломжтой)
- `APP_GUARD` → `ThrottlerGuard` бүх endpoint-д автомат ажиллана
- Auth endpoint-д хатуу хязгаарлалт: `AUTH_THROTTLE` (5 req/min), `PASSWORD_RESET_THROTTLE` (3 req/min)
- Constants: `common/constants/throttle.constants.ts` — controller-уудад `@Throttle()` decorator-т дахин ашиглана

**Config файлууд**: `config/throttle.config.ts` (`registerAs('throttle')`) — env variables: `THROTTLE_SHORT_TTL`, `THROTTLE_SHORT_LIMIT`, `THROTTLE_AUTH_LIMIT` гэх мэт
