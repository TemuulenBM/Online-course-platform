# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Rules

1. **Монгол хэлээр харилцах**: Хэрэглэгчтэй ЗААВАЛ монгол хэлээр, тайлбарлах өнгөөр харилцана. Variable нэр англиар байж болно, гэхдээ хэрэглэгчтэй ярих бүх текст монголоор байна.
2. **Код дотор монголоор бичих**: Хөгжүүлэлтийн явцад бүх comment, JSDoc/TSDoc docblock, тайлбар зэргийг ЗААВАЛ монгол хэлээр бичнэ. Variable болон function нэрс англиар байна, харин тэдгээрийн тайлбар, comment-ууд монголоор байна.
3. **Commit message монголоор бичих**: Commit message-ийг ЗААВАЛ монгол хэлээр бичнэ.
4. **Commit-д authored текст бичихгүй**: `Co-Authored-By` мөрийг commit message-д хэзээ ч оруулахгүй.
5. **Системийн архитектурыг дагах**: `files/architecture.mmd` дээрх архитектурыг чанд дагана — модулийн бүтэц, өгөгдлийн урсгал, технологийн сонголтуудыг өөрчлөхгүй.
6. **Модулиудыг дараалалтай хөгжүүлэх**: `files/Дараалал.docx` дээрх дарааллыг баримтлана:
   - Phase 1: Auth Module → User Module
   - Phase 2: Course Module → Lesson Module → Content Module
   - Phase 3: Enrollment → Progress → Quiz → Certificate Module
   - Phase 4: Discussion → Notification Module
   - Phase 5: Payment → Analytics → Admin Module
   - Phase 6: Live Class Module
   - Phase 7: React Native Mobile App
7. **Төлөвлөгөө/баримт бичгийг дагах**: `files/` дотор байгаа бүх баримт бичгүүдийг (архитектур, database schema, MongoDB collections) лавлагаа болгон ашиглана. Шинэ шийдвэр гаргахдаа эдгээр баримт бичигтэй нийцэж байгаа эсэхийг шалгана.
8. **Тест заавал бичих**: Хөгжүүлэлтийн явцад код бичихдээ ЗААВАЛ тест дагалдуулна. Модуль бүрийн `tests/` хавтаст unit болон integration тест бичнэ. Use case (application давхарга), controller (interface давхарга), repository (infrastructure давхарга) тус бүрд тест бичнэ. Тест бичээгүй код commit хийхгүй.
9. **Модуль дуусмагц CLAUDE.md шинэчлэх**: Модулийн хөгжүүлэлт бүрэн дууссаны дараа CLAUDE.md-ийн `## Implemented Modules` хэсэгт тухайн модулийн мэдээллийг нэмнэ: гол endpoint-ууд, export хийсэн service-ууд, хамаарал (dependencies), онцлог шийдвэрүүд. Ингэснээр дараагийн conversation-д кодыг дахин судлах шаардлагагүй болж token хэмнэнэ.
10. **Commit хийхийн өмнө Prettier format ажиллуулах**: Код commit хийхийн өмнө ЗААВАЛ `pnpm format` ажиллуулж бүх файлыг форматлана. CI pipeline дээр Prettier шалгалт байгаа тул форматлаагүй код push хийвэл lint алдаа гарна.
11. **Модуль дуусмагц API шалгах + Postman collection бэлтгэх**: Модулийн хөгжүүлэлт дууссаны дараа ЗААВАЛ бүх API endpoint-уудыг ажиллуулж шалгана (server ажиллуулж, request илгээж, response зөв эсэхийг баталгаажуулна). Бүх API зөв ажиллаж байгаа нь батлагдсаны дараа тухайн модулийн Postman collection JSON файлыг `files/postman/` хавтаст үүсгэнэ. Collection нь бүх endpoint-ийн request, header, body, environment variable-уудыг агуулсан байна. Swagger ашиглахгүй — Postman-ийг API баримтжуулалт, тестийн үндсэн хэрэгсэл болгон ашиглана.

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

# Docker (Production)
docker compose -f docker-compose.prod.yml build   # Бүх image build
docker compose -f docker-compose.prod.yml up -d    # Production орчин ажиллуулах
docker compose -f docker-compose.prod.yml down     # Зогсоох
```

## Tech Stack

- **Web**: Next.js 15 + TypeScript + Tailwind CSS 4 + React Query + Zustand
- **API**: NestJS 10 + Prisma 6 (PostgreSQL) + Mongoose (MongoDB)
- **Mobile**: React Native + Expo 52 + Expo Router
- **Infra**: Redis (cache/queue via Bull), Elasticsearch (search)
- **CI/CD**: GitHub Actions, Docker (multi-stage), Nginx (reverse proxy), GHCR (container registry)
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
.github/workflows/     # CI/CD pipelines (ci, deploy-staging, deploy-production)
nginx/                 # Nginx reverse proxy тохиргоо
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

## CI/CD & Docker

### GitHub Actions Workflows

**CI Pipeline** (`.github/workflows/ci.yml`):

- **Trigger**: push (бүх branch), pull_request (main руу)
- **Concurrency**: branch бүрт нэг CI — хуучин run автомат cancel
- 4 job: `lint` (ESLint + Prettier), `test` (PostgreSQL/MongoDB/Redis services, Prisma migrate, unit тест), `build` (API build), `docker-build` (PR дээр Docker image verify)

**Deploy Staging** (`.github/workflows/deploy-staging.yml`):

- **Trigger**: push to main (PR merge-ийн дараа)
- Docker image build → GHCR push (`ghcr.io/OWNER/ocp-api:staging`, `ocp-web:staging`) → SSH deploy → health check

**Deploy Production** (`.github/workflows/deploy-production.yml`):

- **Trigger**: workflow_dispatch (manual button), tag input optional
- GHCR push (`production` + timestamp tag) → GitHub Environment approval → DB migration → deploy → health check

### Docker

- **API** (`apps/api/Dockerfile`): Multi-stage (base → deps → builder → production). Node 20 Alpine, pnpm, bcrypt build tools (python3, make, g++), Prisma generate dummy URL, non-root user (`nestjs`), `node dist/main`
- **Web** (`apps/web/Dockerfile`): Multi-stage Next.js standalone. `next.config.ts`-д `output: 'standalone'` нэмэгдсэн
- **docker-compose.prod.yml**: api, web, nginx, postgres, mongodb, redis — бүгд `app-network` дээр
- **nginx** (`nginx/nginx.conf`): `/api/` → api:3001, `/uploads/` → api:3001, `/` → web:3000, `/_next/static/` immutable cache, gzip, security headers, 100M upload

### Branch Protection (GitHub Rulesets)

- main branch: PR заавал шаардана, 3 status check шаардлагатай (`lint`, `test`, `build`), force push хориглосон

### ESLint 9 Flat Config

- `packages/eslint-config/*.mjs` — base, nestjs, nextjs, react-native config-ууд (ESLint 9 flat config format)
- App бүрт `eslint.config.mjs` — тохирох shared config import хийнэ
- `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin` + `eslint-config-prettier`

### Health Check Endpoint

`GET /api/v1` — `@Public()`, JWT шаардахгүй:

- PostgreSQL (`$queryRawUnsafe('SELECT 1')`), Redis (`set`/`get` health:check), MongoDB (`readyState`) connectivity шалгана
- Response: `{ status: 'ok' | 'degraded', timestamp, services: { database, redis, mongodb } }`
- `ok` → HTTP 200, `degraded` → HTTP 503 (Docker healthcheck болон deployment verify-д ашиглагдана)

---

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

### Courses Module (Phase 2)

**Endpoints** (`/api/v1/courses`):

- `POST /courses` — Шинэ сургалт үүсгэх (TEACHER, ADMIN)
- `GET /courses` — Сургалтуудын жагсаалт pagination-тэй (@Public, PUBLISHED only)
- `GET /courses/my` — Миний сургалтууд (TEACHER, ADMIN, бүх status)
- `GET /courses/slug/:slug` — Slug-аар сургалт авах (@Public, PUBLISHED only)
- `GET /courses/:id` — ID-аар сургалт авах (@Public, PUBLISHED only)
- `PATCH /courses/:id` — Сургалт шинэчлэх (эзэмшигч/ADMIN)
- `PATCH /courses/:id/publish` — DRAFT→PUBLISHED (эзэмшигч/ADMIN)
- `PATCH /courses/:id/archive` — PUBLISHED→ARCHIVED (эзэмшигч/ADMIN)
- `DELETE /courses/:id` — Сургалт устгах (ADMIN only)

**Endpoints** (`/api/v1/categories`):

- `POST /categories` — Ангилал үүсгэх (ADMIN)
- `GET /categories` — Ангиллуудын жагсаалт мод бүтцээр (@Public)
- `GET /categories/:id` — Ангиллын дэлгэрэнгүй + coursesCount (@Public)
- `PATCH /categories/:id` — Ангилал шинэчлэх (ADMIN)
- `DELETE /categories/:id` — Ангилал устгах (ADMIN)

**Export хийсэн service-ууд**: `CourseRepository`, `CategoryRepository`

**Хамаарал**: `PrismaModule` (@Global), `RedisModule` (@Global)

**Онцлог шийдвэрүүд**:

- Categories нь Courses модуль дотор — тусдаа модуль биш, тус controller-тэй
- Status flow: DRAFT → PUBLISHED → ARCHIVED (нэг чиглэлтэй, буцаахгүй)
- Public endpoint дээр зөвхөн PUBLISHED — use-case түвшинд шүүнэ
- Эзэмшигч/admin эрхийн шалгалт — use-case түвшинд (guard биш)
- Slug utility: `common/utils/slug.util.ts` — `generateSlug()` + `generateUniqueSlug()`
- Prisma Decimal → number хөрвүүлэлт entity constructor дотор
- Redis кэшлэлт: `course:{id}` (TTL 15 мин), `category:tree` key
- Кэш invalidate: сургалт шинэчлэх/устгах/нийтлэх/архивлах үед
- Hard delete — Phase 3 (Enrollment, Progress) хүртэл soft delete шаардлагагүй
- Route дараалал: `/courses/my`, `/courses/slug/:slug` нь `/courses/:id`-ээс ӨМНӨ

**Тест**: 14 test suite, 54 unit тест (use-case + controller + cache service)

### Lessons Module (Phase 2)

**Endpoints** (`/api/v1/lessons`):

- `POST /lessons` — Шинэ хичээл үүсгэх (TEACHER, ADMIN)
- `GET /lessons/course/:courseId` — Сургалтын хичээлүүдийн жагсаалт (@Public, published only)
- `PATCH /lessons/reorder` — Хичээлүүдийн дарааллыг өөрчлөх (TEACHER, ADMIN)
- `GET /lessons/:id` — Хичээлийн дэлгэрэнгүй (@Public, published only)
- `PATCH /lessons/:id` — Хичээл шинэчлэх (эзэмшигч/ADMIN)
- `PATCH /lessons/:id/publish` — Нийтлэлт toggle (эзэмшигч/ADMIN)
- `DELETE /lessons/:id` — Хичээл устгах (эзэмшигч/ADMIN)

**Export хийсэн service-ууд**: `LessonRepository`

**Хамаарал**: `PrismaModule` (@Global), `RedisModule` (@Global), `CoursesModule` (CourseRepository ашиглах)

**Онцлог шийдвэрүүд**:

- Зөвхөн PostgreSQL metadata — MongoDB контент Content модульд хамаарна
- `orderIndex` автоматаар тавигдана (max+1), reorder endpoint-ээр өөрчлөгдөнө
- Pagination байхгүй — хичээлүүд (10-100) цөөн тул бүгдийг нэг дор авна
- `courseId` update хийхгүй — хичээлийг сургалт хооронд зөөхгүй
- `isPublished` boolean toggle — Course-ийн DRAFT→PUBLISHED биш
- Эрхийн шалгалт: use-case түвшинд, Course.instructorId-г шалгана
- Redis кэшлэлт: `lesson:{id}`, `lessons:course:{courseId}` (TTL 15 мин)
- Зөвхөн published жагсаалтыг кэшлэнэ, owner/admin DB-ээс шууд
- `LessonType` enum: VIDEO, TEXT, QUIZ, ASSIGNMENT, LIVE
- Cascade delete: Course устгахад хичээлүүд автоматаар устна
- Route дараалал: `/lessons/course/:courseId`, `/lessons/reorder` нь `/lessons/:id`-ээс ӨМНӨ

**Тест**: 9 test suite, 45 unit тест (use-case + controller + cache service)

### Content Module (Phase 2)

**Endpoints** (`/api/v1/content`):

- `POST /content/text` — Текст контент тавих (TEACHER, ADMIN)
- `POST /content/video` — Видео контент тавих (TEACHER, ADMIN)
- `GET /content/lesson/:lessonId` — Хичээлийн контент авах (@Public, published only)
- `PATCH /content/lesson/:lessonId` — Контент шинэчлэх (эзэмшигч/ADMIN)
- `DELETE /content/lesson/:lessonId` — Контент устгах (эзэмшигч/ADMIN)
- `POST /content/lesson/:lessonId/upload` — Файл upload (TEACHER, ADMIN)

**Export хийсэн service-ууд**: `ContentRepository`

**Хамаарал**: `MongooseModule`, `LessonsModule` (LessonRepository), `RedisModule` (@Global), `PrismaModule` (@Global)

**Онцлог шийдвэрүүд**:

- MongoDB-г анх удаа ашигласан модуль — `MongooseModule.forRootAsync()` app.module.ts-д нэмэгдсэн
- Нэг хичээлд нэг content document (`lessonId` unique index) — original doc-ийн per-course nested бүтцийг хялбарчилсан
- `IStorageService` interface + `LocalStorageService` — DI token `STORAGE_SERVICE`-ээр inject, ирээдүйд S3/R2 руу солих боломжтой
- `contentType` нь lesson.lessonType-тэй таарах ёстой — mismatch бол BadRequestException
- Set endpoint нь upsert семантиктай — контент байвал шинэчлэх, байхгүй бол үүсгэх
- Upload endpoint-д fileType query param: `video | thumbnail | attachment | subtitle`
- Redis кэш: `content:lesson:{lessonId}` (TTL 15 мин)
- Static file serving: `main.ts`-д `useStaticAssets` нэмэгдсэн (`/uploads/` prefix)
- `storage.config.ts` config нэмэгдсэн (provider, localUploadDir, maxFileSizeMb)
- Mongoose schema: `course_content` collection, timestamps автомат

**Тест**: 7 test suite, 38 unit тест (use-case + controller + cache service)

### Enrollments Module (Phase 3)

**Endpoints** (`/api/v1/enrollments`):

- `POST /enrollments` — Сургалтад элсэх (JWT required)
- `GET /enrollments/my` — Миний элсэлтүүд pagination-тэй (JWT required)
- `GET /enrollments/course/:courseId` — Сургалтын оюутнуудын жагсаалт (TEACHER, ADMIN)
- `GET /enrollments/check/:courseId` — Элсэлтийн статус шалгах (JWT required)
- `GET /enrollments/:id` — Элсэлтийн дэлгэрэнгүй (JWT required, өөрийн/эзэмшигч/ADMIN)
- `PATCH /enrollments/:id/cancel` — Элсэлт цуцлах (JWT required, өөрийн/ADMIN)
- `PATCH /enrollments/:id/complete` — Элсэлт дуусгах (ADMIN only)
- `DELETE /enrollments/:id` — Элсэлт устгах (ADMIN only)

**Export хийсэн service-ууд**: `EnrollmentRepository`

**Хамаарал**: `CoursesModule` (CourseRepository), `PrismaModule` (@Global), `RedisModule` (@Global)

**Онцлог шийдвэрүүд**:

- Зөвхөн PostgreSQL — MongoDB шаардлагагүй
- `@@unique([userId, courseId])` — Нэг хэрэглэгчид нэг сургалтад нэг элсэлт
- Зөвхөн PUBLISHED сургалтад элсэх боломжтой
- Re-enrollment: CANCELLED/EXPIRED элсэлтийг ACTIVE руу update (шинээр үүсгэхгүй)
- Prerequisite шалгалт: `Prerequisite` model-ээс required course ID-уудыг аваад, хэрэглэгч бүгдийг COMPLETED болсон эсэхийг шалгана
- Төлбөр шалгахгүй (Payment модуль Phase 5-д)
- ADMIN-only complete — Progress модуль хэрэгжсэний дараа автомат болно
- Redis кэш: `enrollment:{id}`, `enrollment:check:{userId}:{courseId}` (TTL 15 мин)
- Жагсаалт кэшлэхгүй — зөвхөн дан элсэлт + check кэшлэнэ
- Эрхийн шалгалт use-case түвшинд: өөрийн элсэлт / сургалтын эзэмшигч / ADMIN
- Route дараалал: `/enrollments/my`, `/enrollments/course/:courseId`, `/enrollments/check/:courseId` нь `/:id`-ээс ӨМНӨ

**Тест**: 10 test suite, 42 unit тест (use-case + controller + cache service)

### Progress Module (Phase 3)

**Endpoints** (`/api/v1/progress`):

- `GET /progress/my` — Миний ахицуудын жагсаалт pagination-тэй (JWT required)
- `GET /progress/course/:courseId` — Сургалтын ахицын нэгтгэл (JWT required)
- `GET /progress/lessons/:lessonId` — Хичээлийн ахиц авах (JWT required)
- `POST /progress/lessons/:lessonId` — Хичээлийн ахиц шинэчлэх (JWT required)
- `POST /progress/lessons/:lessonId/complete` — Хичээл дуусгах (JWT required)
- `PATCH /progress/lessons/:lessonId/position` — Видеоны байрлал шинэчлэх (JWT required)
- `DELETE /progress/:id` — Ахиц устгах (ADMIN only)

**Export хийсэн service-ууд**: `ProgressRepository`

**Хамаарал**: `EnrollmentsModule` (EnrollmentRepository), `LessonsModule` (LessonRepository), `PrismaModule` (@Global), `RedisModule` (@Global)

**Онцлог шийдвэрүүд**:

- Зөвхөн PostgreSQL — MongoDB шаардлагагүй
- `@@unique([userId, lessonId])` — Нэг хэрэглэгчид нэг хичээлд нэг ахиц
- Upsert семантик: progress байвал шинэчлэх, байхгүй бол үүсгэх
- **Auto-complete enrollment**: Бүх published хичээл дуусахад enrollment автоматаар COMPLETED болно (`CompleteLessonUseCase` дотор)
- `timeSpentSeconds` additive: Шинэ зарцуулсан хугацааг хуучин дээр нэмнэ
- Видео progressPercentage автоматаар тооцоолно: `Math.min(100, Math.round((lastPositionSeconds / (durationMinutes * 60)) * 100))`
- TEXT/QUIZ/ASSIGNMENT хичээлд зөвхөн 0% (эхлээгүй) эсвэл 100% (complete) — дунд шат байхгүй
- Зөвхөн published хичээлд, ACTIVE элсэлттэй хэрэглэгчид ахиц бүртгэнэ
- Redis кэш: `progress:lesson:{userId}:{lessonId}`, `progress:course:{userId}:{courseId}` (TTL 15 мин)
- Enrollment кэш invalidation: auto-complete үед `enrollment:{id}`, `enrollment:check:{userId}:{courseId}` түлхүүрүүд устгагдана
- GetLessonProgress-д ахиц олдоогүй бол default утга буцаана (0%, false) — NotFoundException биш
- GetCourseProgress: нэгтгэл буцаана (totalLessons, completedLessons, courseProgressPercentage, totalTimeSpentSeconds, lessons[])
- Route дараалал: `/progress/my`, `/progress/course/:courseId` нь `/progress/lessons/:lessonId`-ээс ӨМНӨ

**Тест**: 9 test suite, 37 unit тест (use-case + controller + cache service)

### Quizzes Module (Phase 3)

**Endpoints** (`/api/v1/quizzes`):

- `POST /quizzes` — Quiz үүсгэх (TEACHER, ADMIN — lessonType=QUIZ шаардлагатай)
- `GET /quizzes/lesson/:lessonId` — Хичээлийн quiz авах (@Public)
- `GET /quizzes/:id` — Quiz дэлгэрэнгүй + асуултууд (TEACHER/ADMIN: хариултуудтай, STUDENT: хариултгүй)
- `PATCH /quizzes/:id` — Quiz тохиргоо шинэчлэх (эзэмшигч/ADMIN)
- `DELETE /quizzes/:id` — Quiz устгах (эзэмшигч/ADMIN)
- `POST /quizzes/:id/questions` — Асуулт нэмэх (TEACHER, ADMIN)
- `PATCH /quizzes/:id/questions/:questionId` — Асуулт шинэчлэх (TEACHER, ADMIN)
- `DELETE /quizzes/:id/questions/:questionId` — Асуулт устгах (TEACHER, ADMIN)
- `PATCH /quizzes/:id/questions/reorder` — Асуултуудын дараалал солих (TEACHER, ADMIN)
- `POST /quizzes/:id/attempts` — Quiz оролдлого эхлүүлэх (JWT required, ACTIVE enrollment)
- `GET /quizzes/:id/attempts/my` — Миний оролдлогууд (JWT required)
- `GET /quizzes/:id/attempts/students` — Оюутнуудын оролдлогууд (TEACHER, ADMIN)
- `GET /quizzes/:id/attempts/:attemptId` — Оролдлогын дэлгэрэнгүй (JWT required)
- `POST /quizzes/:id/attempts/:attemptId/submit` — Хариулт илгээх + auto-grade (JWT required)
- `PATCH /quizzes/attempts/:attemptId/grade` — Essay/code гараар дүгнэх (TEACHER, ADMIN)

**Export хийсэн service-ууд**: `QuizRepository`

**Хамаарал**: `MongooseModule` (quiz_questions, quiz_answers), `LessonsModule` (LessonRepository), `EnrollmentsModule` (EnrollmentRepository), `ProgressModule` (CompleteLessonUseCase), `PrismaModule` (@Global), `RedisModule` (@Global)

**Онцлог шийдвэрүүд**:

- Dual-database: PostgreSQL (quiz metadata + attempt results) + MongoDB (questions + answers)
- Асуултын 5 төрөл: `multiple_choice`, `true_false`, `fill_blank` (auto-grade), `code_challenge`, `essay` (гараар дүгнэх)
- `QuizGradingService`: multiple_choice, true_false, fill_blank автомат дүгнэнэ; code_challenge, essay → pointsEarned=0, гараар дүгнэх хүртэл
- `CompleteLessonUseCase` интеграц: quiz тэнцсэн бол хичээл автомат complete → enrollment auto-complete
- `CompleteLessonUseCase` ConflictException-г try/catch-аар алгасна (дахин тэнцсэн тохиолдол)
- `ProgressModule` exports-д `CompleteLessonUseCase` нэмэгдсэн
- Attempt lifecycle: `startAttempt` → `submitAttempt` → auto-grade → (optional) `gradeAttempt`
- `maxAttempts` null бол хязгааргүй оролдлого; `timeLimitMinutes` null бол хугацааны хязгааргүй
- `randomizeQuestions`, `randomizeOptions` тохиргоо — Fisher-Yates shuffle алгоритм
- Зөв хариулт нуулт: StartAttempt-д isCorrect, correctAnswer, solution зэрэг талбарууд strip хийгдэнэ
- Redis кэш: `quiz:{id}`, `quiz:lesson:{lessonId}`, `quiz:questions:{quizId}`, `quiz:attempts:{quizId}:{userId}` (TTL 15 мин)
- Route дараалал: `/quizzes/lesson/:lessonId`, `/quizzes/attempts/:attemptId/grade` нь `/quizzes/:id`-ээс ӨМНӨ; `/quizzes/:id/questions/reorder` нь `/:id/questions/:questionId`-ээс ӨМНӨ; `/attempts/my`, `/attempts/students` нь `/attempts/:attemptId`-ээс ӨМНӨ

**Тест**: 8 test suite, 68 unit тест (use-case + controller + cache service + grading service)

### Certificates Module (Phase 3)

**Endpoints** (`/api/v1/certificates`):

- `GET /certificates/verify/:verificationCode` — Сертификат баталгаажуулах (@Public, JWT шаардлагагүй)
- `GET /certificates/my` — Миний сертификатууд pagination-тэй (JWT required)
- `GET /certificates/course/:courseId` — Сургалтын сертификатуудын жагсаалт (TEACHER, ADMIN)
- `POST /certificates/generate/:courseId` — Сертификат гараар үүсгэх (JWT required, COMPLETED enrollment шаардлагатай)
- `GET /certificates/:id` — Сертификатын дэлгэрэнгүй (JWT required, эзэмшигч/багш/ADMIN)
- `DELETE /certificates/:id` — Сертификат устгах (ADMIN only)

**Export хийсэн service-ууд**: `CertificateRepository`

**Хамаарал**: `BullModule` (certificates queue), `EnrollmentsModule` (EnrollmentRepository), `CoursesModule` (CourseRepository), `PrismaModule` (@Global), `RedisModule` (@Global), `ConfigModule`

**Онцлог шийдвэрүүд**:

- Зөвхөн PostgreSQL — MongoDB шаардлагагүй
- `@@unique([userId, courseId])` — Нэг хэрэглэгчид нэг сургалтад нэг сертификат
- **Auto-generate trigger**: `CompleteLessonUseCase`-д enrollment auto-complete болоход Bull Queue-ээр `generate-auto` job нэмэгдэнэ (`progress.module.ts`-д `BullModule.registerQueue({ name: 'certificates' })` нэмэгдсэн)
- `BullModule.forRootAsync()` app.module.ts-д нэмэгдсэн (Redis config ашиглан)
- **CertificateProcessor** (Bull Queue): `generate` + `generate-auto` 2 process. Auto-generate нь давхардал шалгаад certificate record үүсгээд generate рүү шилжинэ
- Certificate number формат: `OCP-YYYY-XXXXXXXX` (hex random), P2002 unique violation дээр retry (3 удаа)
- Verification code: `crypto.randomUUID()` dash-гүй (32 тэмдэгт)
- **Puppeteer-core** + HTML template: A4 landscape PDF сертификат, QR код embed хийгдсэн
- `CHROMIUM_PATH` env variable — Docker-д `/usr/bin/chromium-browser`, dev-д system Chromium
- Content модулийн `IStorageService` + `LocalStorageService` pattern дахин ашигласан (`STORAGE_SERVICE` DI token)
- `pdfUrl`, `qrCodeUrl` nullable — Bull processor async шинэчлэнэ
- Redis кэш: `certificate:{id}`, `certificate:verify:{verificationCode}` (TTL 900s / 15 мин)
- Эрхийн шалгалт: эзэмшигч / сургалтын багш (courseInstructorId) / ADMIN — use-case түвшинд
- Public verify endpoint: JWT шаардлагагүй, verification code-оор сертификат хайна
- Docker Dockerfile-д Chromium + шрифтүүд нэмэгдсэн (`chromium nss freetype harfbuzz ca-certificates ttf-freefont`)
- Route дараалал: `/certificates/verify/:verificationCode`, `/certificates/my`, `/certificates/course/:courseId` нь `/:id`-ээс ӨМНӨ

**Тест**: 11 test suite, 40 unit тест (use-case + controller + cache service + processor + pdf + qr)

### Discussions Module (Phase 4)

**Endpoints — Discussion Posts** (`/api/v1/discussions/posts`):

- `GET /discussions/posts/course/:courseId` — Сургалтын нийтлэлүүдийн жагсаалт (@Public, pagination+filter+search+sort)
- `POST /discussions/posts` — Нийтлэл үүсгэх (JWT required, enrolled/instructor/admin)
- `GET /discussions/posts/:id` — Нийтлэлийн дэлгэрэнгүй (@Public, viewCount increment)
- `PATCH /discussions/posts/:id` — Нийтлэл шинэчлэх (эзэмшигч/ADMIN, isLocked шалгалт)
- `DELETE /discussions/posts/:id` — Нийтлэл устгах (эзэмшигч/ADMIN)
- `POST /discussions/posts/:id/replies` — Хариулт нэмэх (enrolled/instructor/admin, isLocked шалгалт)
- `PATCH /discussions/posts/:id/replies/:replyId` — Хариулт шинэчлэх (хариулт эзэмшигч/ADMIN)
- `DELETE /discussions/posts/:id/replies/:replyId` — Хариулт устгах (хариулт эзэмшигч/ADMIN)
- `POST /discussions/posts/:id/vote` — Санал өгөх up/down toggle (enrolled/instructor/admin)
- `POST /discussions/posts/:id/accept/:replyId` — Зөв хариулт хүлээн авах (асуулт эзэмшигч/ADMIN)
- `POST /discussions/posts/:id/pin` — Нийтлэл pin/unpin toggle (TEACHER, ADMIN)
- `POST /discussions/posts/:id/lock` — Нийтлэл lock/unlock toggle (TEACHER, ADMIN)
- `POST /discussions/posts/:id/flag` — Нийтлэл flag/unflag хийх (TEACHER, ADMIN)

**Endpoints — Lesson Comments** (`/api/v1/discussions/comments`):

- `GET /discussions/comments/lesson/:lessonId` — Хичээлийн сэтгэгдлүүдийн жагсаалт (@Public, pagination+sort)
- `POST /discussions/comments` — Сэтгэгдэл үүсгэх (enrolled/instructor/admin)
- `PATCH /discussions/comments/:id` — Сэтгэгдэл шинэчлэх (эзэмшигч/ADMIN)
- `DELETE /discussions/comments/:id` — Сэтгэгдэл устгах (эзэмшигч/ADMIN)
- `POST /discussions/comments/:id/replies` — Сэтгэгдэлд хариулт нэмэх (enrolled/instructor/admin)
- `POST /discussions/comments/:id/upvote` — Upvote toggle (enrolled/instructor/admin)

**Export хийсэн service-ууд**: `DiscussionPostRepository`, `LessonCommentRepository`

**Хамаарал**: `MongooseModule` (discussion_posts, lesson_comments), `CoursesModule` (CourseRepository), `LessonsModule` (LessonRepository), `EnrollmentsModule` (EnrollmentRepository), `RedisModule` (@Global)

**Онцлог шийдвэрүүд**:

- **MongoDB-only модуль** — PostgreSQL таблиц нэмэгдээгүй, UUID reference-ээр PostgreSQL-тэй холбогдоно
- 2 MongoDB collection: `discussion_posts` (Форум/Q&A) + `lesson_comments` (Хичээлийн сэтгэгдэл)
- 2 Controller: `DiscussionPostsController` (13 endpoint) + `LessonCommentsController` (6 endpoint)
- Vote tracking: `voters: [{ userId, voteType }]` массив embed — давхар vote-оос хамгаална. `toResponse(currentUserId)`-д voters нуугдана, зөвхөн `userVote` буцаана
- Upvote (lesson comments): Зөвхөн upvote (downvote-гүй), `upvoterIds` массив toggle. `toResponse(currentUserId)`-д upvoterIds нуугдана, зөвхөн `hasUpvoted` буцаана
- `isInstructorReply` авто-илрүүлэлт — `CourseRepository.findById()` → `instructorId === userId`
- View count: Энгийн `$inc` increment, per-user tracking байхгүй
- Enrollment-based authorization: use-case түвшинд enrolled/instructor/admin шалгалт
- Pin/Lock/Flag toggle: `TEACHER` болон `ADMIN` зөвхөн хийх боломжтой
- Accept answer: `postType=question` зөвхөн, хуучин accepted answer автомат unset
- Delete reply: accepted answer устгавал `isAnswered` reset хийгдэнэ
- Redis кэш: `discussion:post:{id}`, `comment:{id}` (TTL 900s / 15 мин). Жагсаалт кэшлэхгүй
- Route дараалал: `course/:courseId` нь `:id`-ээс ӨМНӨ; `lesson/:lessonId` нь `:id`-ээс ӨМНӨ

**Тест**: 16 test suite, ~75 unit тест (use-case + controller + cache service)

### Notifications Module (Phase 4)

**Endpoints** (`/api/v1/notifications`):

- `GET /notifications/unread-count` — Уншаагүй мэдэгдлийн тоо (JWT required)
- `GET /notifications/preferences` — Мэдэгдлийн тохиргоо авах (JWT required)
- `PATCH /notifications/mark-all-read` — Бүх мэдэгдлийг уншсан болгох (JWT required)
- `PATCH /notifications/preferences` — Мэдэгдлийн тохиргоо шинэчлэх (JWT required)
- `GET /notifications` — Мэдэгдлүүдийн жагсаалт pagination+filter (JWT required)
- `PATCH /notifications/:id/read` — Нэг мэдэгдлийг уншсан болгох (JWT required, эзэмшигч)
- `DELETE /notifications/:id` — Мэдэгдэл устгах (JWT required, эзэмшигч/ADMIN)

**Export хийсэн service-ууд**: `NotificationService` (send, sendBulk — бусад модулиас дуудагдана)

**Хамаарал**: `BullModule` (notifications queue), `ConfigModule`, `PrismaModule` (@Global), `RedisModule` (@Global)

**Онцлог шийдвэрүүд**:

- Зөвхөн PostgreSQL — MongoDB шаардлагагүй
- **Multi-channel architecture**: IN_APP (заавал) + Email (SendGrid) + SMS (Twilio placeholder) + Push (Expo placeholder)
- `NotificationService.send()` workflow: DB бичих → кэш invalidate → preference шалгах → config шалгах → Bull Queue job нэмэх
- `NotificationService.sendBulk()`: `Promise.all` ашиглан олон хэрэглэгчид параллелиар илгээх
- **Bull Queue processor** (`NotificationProcessor`): `send-email`, `send-sms`, `send-push` гэсэн 3 process handler — тус бүр config шалгаж service дуудна
- **DI Token pattern**: `EMAIL_SERVICE` → `SendGridEmailService`, `SMS_SERVICE` → `PlaceholderSmsService`, `PUSH_SERVICE` → `PlaceholderPushService` — ирээдүйд солих боломжтой
- `notification.config.ts`: Email (SendGrid API key, from), SMS (Twilio), Push тохиргоо — env variables-ээр удирдана
- **NotificationPreference**: Хэрэглэгч бүр email/push/sms идэвхтэй/идэвхгүй болгох боломжтой. Тохиргоо байхгүй бол default (email:true, push:true, sms:false)
- Upsert семантик: preference байвал update, байхгүй бол create
- Эрхийн шалгалт use-case түвшинд: өөрийн мэдэгдэл / ADMIN
- Redis кэш: `notification:{id}`, `notification:unread:{userId}`, `notification:prefs:{userId}` (TTL 900s / 15 мин)
- Route дараалал: `/unread-count`, `/preferences`, `/mark-all-read` нь `/:id`-ээс ӨМНӨ

**Тест**: 11 test suite, 51 unit тест (use-case + controller + cache service + notification service + processor)

### Payments Module (Phase 5)

**Endpoints — Orders** (`/api/v1/payments/orders`):

- `POST /payments/orders` — Захиалга үүсгэх (JWT + Throttle 5/min)
- `GET /payments/orders/my` — Миний захиалгууд pagination+status filter (JWT required)
- `GET /payments/orders/pending` — Хүлээгдэж буй захиалгууд (ADMIN only)
- `GET /payments/orders/:id` — Захиалгын дэлгэрэнгүй (JWT required, эзэмшигч/instructor/ADMIN)
- `POST /payments/orders/:id/upload-proof` — Төлбөрийн баримт upload (JWT + Multer)
- `PATCH /payments/orders/:id/approve` — Захиалга баталгаажуулах (ADMIN only)
- `PATCH /payments/orders/:id/reject` — Захиалга татгалзах (ADMIN only)

**Endpoints — Subscriptions** (`/api/v1/payments/subscriptions`):

- `POST /payments/subscriptions` — Бүртгэл эхлүүлэх (JWT + Throttle 3/min)
- `GET /payments/subscriptions/my` — Миний бүртгэл (JWT required)
- `PATCH /payments/subscriptions/:id/cancel` — Бүртгэл цуцлах (JWT required, эзэмшигч/ADMIN)

**Endpoints — Invoices** (`/api/v1/payments/invoices`):

- `GET /payments/invoices/my` — Миний нэхэмжлэхүүд pagination-тэй (JWT required)
- `GET /payments/invoices/:id` — Нэхэмжлэхийн дэлгэрэнгүй (JWT required, эзэмшигч/ADMIN)

**Export хийсэн service-ууд**: `OrderRepository`

**Хамаарал**: `BullModule` (payments queue), `MulterModule`, `ConfigModule`, `CoursesModule` (CourseRepository), `EnrollmentsModule` (EnrollmentRepository), `NotificationsModule` (NotificationService), `PrismaModule` (@Global), `RedisModule` (@Global)

**Онцлог шийдвэрүүд**:

- **Manual Payment flow**: Монголд Stripe ажиллахгүй, QPay/SocialPay бизнес данс шаардлагатай → Банк шилжүүлэг + Admin approve арга сонгосон
- Flow: Order(PENDING) → Upload proof(PROCESSING) → Admin approve(PAID) → Bull Queue → Enrollment + Invoice + Notification
- **IPaymentGateway DI Token pattern**: `PAYMENT_GATEWAY` → `MockPaymentGateway` — ирээдүйд QPay/Stripe руу хялбар солих боломжтой
- `STORAGE_SERVICE` → `LocalStorageService` (Content модулийн pattern дахин ашигласан)
- **Bull Queue processor** 3 process: `payment-approved` (enrollment + invoice + notification + PDF queue), `payment-rejected` (notification), `generate-invoice-pdf` (Puppeteer PDF)
- **InvoicePdfService**: Puppeteer-core + HTML template → A4 portrait PDF нэхэмжлэх
- Invoice number формат: `INV-YYYY-XXXXXXXX` (hex random), P2002 unique violation дээр retry (3 удаа)
- Зөвхөн PostgreSQL — MongoDB шаардлагагүй
- Үнэгүй сургалтад захиалга үүсгэхгүй (BadRequestException → /enrollments руу чиглүүлнэ)
- Давхар захиалга/элсэлт шалгалт: ACTIVE/COMPLETED enrollment болон PENDING/PROCESSING/PAID order байвал ConflictException
- Хямдралтай үнэ байвал `discountPrice` ашиглана
- Валют default: MNT (stripe.config-оос)
- Redis кэш: `order:{id}`, `subscription:{id}`, `subscription:user:{userId}` (TTL 900s / 15 мин)
- Throttle constants: `PAYMENT_THROTTLE` (5/min), `SUBSCRIPTION_THROTTLE` (3/min)
- Route дараалал: `/my`, `/pending` нь `/:id`-ээс ӨМНӨ

**Тест**: 18 test suite, 75 unit тест (use-case + controller + cache service + processor + mock gateway)
