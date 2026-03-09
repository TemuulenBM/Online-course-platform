# CLAUDE.md

## Rules

1. **Монгол хэлээр харилцах**: Хэрэглэгчтэй ЗААВАЛ монгол хэлээр, тайлбарлах өнгөөр харилцана. Variable нэр англиар, ярих текст монголоор.
2. **Код дотор монголоор бичих**: Comment, JSDoc/TSDoc docblock, тайлбар ЗААВАЛ монгол хэлээр. Variable/function нэрс англиар.
3. **Commit message монголоор бичих**.
4. **Commit-д `Co-Authored-By` хэзээ ч оруулахгүй**.
5. **Системийн архитектурыг дагах**: `files/architecture.mmd` — модулийн бүтэц, өгөгдлийн урсгал, технологийг өөрчлөхгүй.
6. **Модулиудыг дараалалтай хөгжүүлэх** (`files/Дараалал.docx`): Phase 1: Auth→Users | Phase 2: Courses→Lessons→Content | Phase 3: Enrollments→Progress→Quizzes→Certificates | Phase 4: Discussions→Notifications | Phase 5: Payments→Analytics→Admin | Phase 6: Live Classes | Phase 7: Mobile App
7. **`files/` дотор байгаа баримт бичгүүдийг** (архитектур, database schema, MongoDB collections) лавлагаа болгон ашиглах.
8. **Тест заавал бичих**: `tests/` хавтаст unit + integration тест. Use case, controller, repository тус бүрд тест. Тестгүй код commit хийхгүй.
9. **Модуль дуусмагц CLAUDE.md шинэчлэх**: `## Implemented Modules`-д endpoint, export service, хамаарал, онцлог шийдвэрүүдийг нэмэх.
10. **Commit-ийн өмнө `pnpm format`** ажиллуулах. CI дээр Prettier шалгалт байгаа.
11. **Модуль дуусмагц API шалгах + Postman collection** бэлтгэх (`files/postman/`). Swagger ашиглахгүй.

## Шийдвэр гаргах горим

Модуль дизайн, API структур, DB schema шийдэхдээ дараах **3 өнцгөөс** шүүмжлэн, дараа нь шийдэл санал болго:

1. **🔵 Мэргэжлийн инженер өнцөг**: "Мэргэжлийн NestJS инженер энэ кодыг юу гэж харах вэ? Техникийн өр, scalability асуудал байна уу?"
2. **🔴 Шүүмжлэгч өнцөг (Devil's Advocate)**: "Миний бодоогүй ямар асуудал байна? 6 сарын дараа энэ кодыг засварлахад ямар бэрхшээл гарах вэ?"
3. **🟢 Хэрэглэгч & Интеграцийн өнцөг**: "Frontend developer энэ API-г consume хийхэд хэр хялбар вэ? Response бүтэц, error message, HTTP status code зөв тодорхойлогдсон уу? Эцсийн хэрэглэгч (сурагч, багш, admin) энэ feature-г ашиглахад ямар UX асуудал гарч болзошгүй вэ? Loading state, validation error, edge case-ийг frontend хэрхэн зохицуулах вэ?"

Эдгээр асуултад хариулсны дараа эцсийн шийдлийг санал болго.

---

## Project Overview

Turborepo monorepo онлайн сургалтын платформ. `@ocp/` namespace, pnpm workspaces.

## Commands

```bash
pnpm dev                    # Бүх apps (api :3001, web :3000)
pnpm dev --filter @ocp/api  # API only
pnpm dev --filter @ocp/web  # Web only
pnpm build                  # Build all
pnpm lint && pnpm test      # Lint + Test
pnpm --filter @ocp/api test             # API тест
pnpm --filter @ocp/api test -- --watch  # Watch mode
pnpm docker:up / pnpm docker:down       # PostgreSQL, MongoDB, Redis, Elasticsearch
pnpm db:generate && pnpm db:migrate     # Prisma client + migrations
pnpm format                             # Prettier
```

## Tech Stack

- **Web**: Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui + React Query + Zustand
- **API**: NestJS 10 + Prisma 6 (PostgreSQL) + Mongoose (MongoDB)
- **Mobile**: React Native + Expo 52 + Expo Router
- **Infra**: Redis (cache/queue via Bull), Elasticsearch (search)
- **CI/CD**: GitHub Actions, Docker (multi-stage), Nginx, GHCR
- **External**: Stripe, SendGrid, Twilio, Agora SDK, Cloudflare R2/Stream

## Monorepo Structure

`apps/`: api (NestJS :3001, /api/v1), web (Next.js :3000), mobile (Expo)
`packages/`: typescript-config, eslint-config, shared-types, validation, api-client, ui-components
`tools/`: Dev scripts | `files/`: Architecture docs | `.github/workflows/`: CI/CD | `nginx/`: Reverse proxy

## NestJS Backend Architecture

### DDD Module Structure (`apps/api/src/modules/{name}/`)

`domain/` (entities, value-objects) → `application/` (use-cases) → `infrastructure/` (repositories) → `interface/` (controllers) → `dto/` → `tests/` → `{name}.module.ts`

15 модуль: auth, users, courses, lessons, content, enrollments, progress, quizzes, certificates, discussions, notifications, payments, analytics, admin, live-classes

### Key Directories

- `apps/api/src/common/` — Guards (JWT, Roles), Decorators (@CurrentUser, @Roles, @Public), Interceptors, Filters, Pipes, Utils, Redis (@Global), Prisma (@Global)
- `apps/api/src/common/constants/` — Throttle limits гэх мэт дахин ашиглах constants
- `apps/api/src/config/` — `registerAs` configs: app, database, mongodb, redis, jwt, throttle, s3, stripe, elasticsearch, mail, storage, agora, notification
- `apps/api/prisma/` — `schema.prisma` + `prisma.config.ts`

### Dual-Database Pattern

PostgreSQL (Prisma) = relational data; MongoDB (Mongoose) = flexible content. UUID references-ээр холбогдоно.

### Key Data Flows

- Progress events → Redis queue → analytics/notification workers
- Video uploads → S3/R2 → Cloudflare Stream → webhook → Content module
- Payment approved → Bull Queue → enrollment + invoice + notification
- Certificate/Invoice generation → Bull Queue → Puppeteer PDF

## Reference Documents

- `files/architecture.mmd` — System architecture (Mermaid)
- `files/database-diagram.mermaid` — PostgreSQL ER diagram (20+ tables)
- `files/mongodb-collections.md` — MongoDB schemas + cross-DB query patterns

## CI/CD & Docker

- **CI** (`.github/workflows/ci.yml`): push/PR trigger, 4 job — `lint`, `test` (PG/Mongo/Redis services), `build`, `docker-build`
- **Deploy Staging**: push to main → GHCR push (`ocp-api:staging`, `ocp-web:staging`) → SSH deploy → health check
- **Deploy Production**: workflow_dispatch → GHCR push → Environment approval → DB migration → deploy
- **Docker**: Multi-stage (Node 20 Alpine, pnpm), API non-root user (`nestjs`), Web standalone output
- **docker-compose.prod.yml**: api, web, nginx, postgres, mongodb, redis on `app-network`
- **nginx**: `/api/` → api:3001, `/` → web:3000, gzip, security headers, 100M upload
- **Branch Protection**: PR шаардлагатай, `lint`+`test`+`build` status checks, force push хориглосон
- **Health Check** `GET /api/v1` (@Public): PG + Redis + MongoDB connectivity → `ok`(200) / `degraded`(503)

## API Gateway (`main.ts`)

- `helmet()`, `compression()`, `enableCors()`, `ValidationPipe` (whitelist+transform), `AllExceptionsFilter`, `HttpExceptionFilter`, `LoggingInterceptor`, `TransformInterceptor` (`{ success, data }` wrapper)
- **Rate Limiting**: Global 3 tier (3/sec, 20/10sec, 100/min). Auth: 5/min. Password reset: 3/min. Constants: `common/constants/throttle.constants.ts`

---

## Implemented Modules — Common Patterns

Бүх модулиуд дараах нийтлэг pattern-ийг дагана:

- **Redis кэш**: TTL 15 мин (900s). Dashboard/overview кэш 5 мин (300s). Жагсаалт ихэвчлэн кэшлэхгүй
- **Route дараалал**: Specific routes (`/my`, `/course/:id`, `/slug/:slug`) нь generic `/:id`-ээс ЗААВАЛ ӨМНӨ бүртгэгдэнэ
- **Эрхийн шалгалт**: Use-case түвшинд (guard биш) — эзэмшигч / instructor / ADMIN
- **Bull Queue processors**: Graceful error handling — try/catch, log, exception шидэхгүй
- **@Global() модулиуд**: PrismaModule, RedisModule — бусад модулиуд дахин import хийхгүй
- **DI Token pattern**: Interface-ээр inject (`STORAGE_SERVICE`, `PAYMENT_GATEWAY`, `AGORA_SERVICE`, `EMAIL_SERVICE`, `SMS_SERVICE`, `PUSH_SERVICE`) — ирээдүйд implementation солих боломжтой
- **Upsert семантик**: Content, Progress, NotificationPreference, SystemSettings — байвал update, байхгүй бол create

### Auth Module (Phase 1)

`/api/v1/auth` — 7 endpoints (register, login, refresh, logout, forgot-password, reset-password, me)
**Exports**: `UserRepository`, `TokenService` | **Deps**: PassportModule, JwtModule, ConfigModule, UsersModule

- JWT access (15 мин) + refresh (7 хоног), token rotation, refresh SHA-256 хэш
- User enumeration хамгаалалт, нууц үг солиход бүх сесси цуцлагдана
- Register үед UserProfile автомат үүсгэнэ (UsersModule-аар)

### Users Module (Phase 1)

`/api/v1/users` — 7 endpoints (me/profile CRUD, /:id/profile, admin: list, role change, delete)
**Exports**: `UserProfileRepository` | **Deps**: (global only)

- UserProfile one-to-one User, Redis кэш `user:profile:{userId}`
- Admin endpoints `@Roles('ADMIN')` + `RolesGuard`

### Courses Module (Phase 2)

`/api/v1/courses` — 9 endpoints | `/api/v1/categories` — 5 endpoints
**Exports**: `CourseRepository`, `CategoryRepository` | **Deps**: (global only)

- Categories нь Courses модуль дотор, тус controller-тэй
- Status flow: DRAFT → PUBLISHED → ARCHIVED (нэг чиглэлтэй)
- Public endpoint-д зөвхөн PUBLISHED, slug utility `common/utils/slug.util.ts`
- Prisma Decimal → number хөрвүүлэлт entity constructor дотор

### Lessons Module (Phase 2)

`/api/v1/lessons` — 7 endpoints (CRUD, reorder, publish toggle, course/:courseId list)
**Exports**: `LessonRepository` | **Deps**: CoursesModule

- `orderIndex` auto max+1, reorder endpoint, pagination-гүй (цөөн хичээл)
- `LessonType` enum: VIDEO, TEXT, QUIZ, ASSIGNMENT, LIVE
- Cascade delete: Course устгахад хичээлүүд автомат устна

### Content Module (Phase 2)

`/api/v1/content` — 6 endpoints (text/video set, lesson/:lessonId get/update/delete, upload)
**Exports**: `ContentRepository` | **Deps**: MongooseModule, LessonsModule

- MongoDB анхны модуль — `course_content` collection, `lessonId` unique
- `IStorageService` + `LocalStorageService` (DI token `STORAGE_SERVICE`)
- `contentType` ↔ `lesson.lessonType` таарах ёстой
- Upload fileType: video | thumbnail | attachment | subtitle

### Enrollments Module (Phase 3)

`/api/v1/enrollments` — 8 endpoints (enroll, my, course/:courseId, check/:courseId, cancel, complete, delete)
**Exports**: `EnrollmentRepository` | **Deps**: CoursesModule

- `@@unique([userId, courseId])`, зөвхөн PUBLISHED-д элсэх
- Re-enrollment: CANCELLED/EXPIRED → ACTIVE update
- Prerequisite шалгалт: бүх required courses COMPLETED байх ёстой

### Progress Module (Phase 3)

`/api/v1/progress` — 7 endpoints (my, course/:courseId, lesson progress CRUD, complete, video position)
**Exports**: `ProgressRepository`, `CompleteLessonUseCase` | **Deps**: EnrollmentsModule, LessonsModule

- `@@unique([userId, lessonId])`, upsert семантик
- **Auto-complete enrollment**: Бүх published хичээл дуусахад enrollment → COMPLETED
- Video progressPercentage: `lastPositionSeconds / (durationMinutes * 60) * 100`
- TEXT/QUIZ/ASSIGNMENT: зөвхөн 0% эсвэл 100%

### Quizzes Module (Phase 3)

`/api/v1/quizzes` — 15 endpoints (quiz CRUD, questions CRUD+reorder, attempts start/submit/grade, lists)
**Exports**: `QuizRepository` | **Deps**: MongooseModule, LessonsModule, EnrollmentsModule, ProgressModule

- Dual-database: PostgreSQL (quiz meta + attempts) + MongoDB (questions + answers)
- 5 question type: multiple_choice, true_false, fill_blank (auto-grade), code_challenge, essay (manual)
- `QuizGradingService` auto-grade, quiz тэнцсэн бол `CompleteLessonUseCase` → enrollment auto-complete
- Fisher-Yates shuffle (randomizeQuestions/Options), зөв хариулт student-ээс нуугдана

### Certificates Module (Phase 3)

`/api/v1/certificates` — 6 endpoints (verify/:code public, my, course/:courseId, generate/:courseId, detail, delete)
**Exports**: `CertificateRepository` | **Deps**: BullModule, EnrollmentsModule, CoursesModule, ConfigModule

- `@@unique([userId, courseId])`, auto-generate: enrollment COMPLETED → Bull Queue → PDF
- Puppeteer-core + HTML template → A4 landscape PDF + QR code
- Certificate number: `OCP-YYYY-XXXXXXXX`, verification code: UUID 32 char
- `CHROMIUM_PATH` env — Docker: `/usr/bin/chromium-browser`

### Discussions Module (Phase 4)

`/api/v1/discussions/posts` — 13 endpoints | `/api/v1/discussions/comments` — 6 endpoints
**Exports**: `DiscussionPostRepository`, `LessonCommentRepository` | **Deps**: MongooseModule, CoursesModule, LessonsModule, EnrollmentsModule

- **MongoDB-only** — 2 collection: `discussion_posts` (forum/Q&A) + `lesson_comments`
- Vote tracking: `voters[]` embed (up/down), lesson comments: upvote only (`upvoterIds[]`)
- Pin/Lock/Flag toggle (TEACHER/ADMIN), accept answer (question owner)
- Enrollment-based authorization, `isInstructorReply` auto-detect

### Notifications Module (Phase 4)

`/api/v1/notifications` — 7 endpoints (unread-count, preferences, mark-all-read, list, read, delete)
**Exports**: `NotificationService` (send, sendBulk) | **Deps**: BullModule, ConfigModule

- **Multi-channel**: IN_APP (заавал) + Email (SendGrid) + SMS (Twilio placeholder) + Push (Expo placeholder)
- `NotificationService.send(userId, payload)` — 2 параметр, бусад модулиас дуудагдана
- Bull Queue: `send-email`, `send-sms`, `send-push` process handlers
- NotificationPreference upsert, default: email:true, push:true, sms:false

### Payments Module (Phase 5)

`/api/v1/payments/orders` — 7 endpoints | `/subscriptions` — 3 | `/invoices` — 2
**Exports**: `OrderRepository` | **Deps**: BullModule, MulterModule, CoursesModule, EnrollmentsModule, NotificationsModule, ConfigModule

- **Manual Payment**: Банк шилжүүлэг + Admin approve (Монголд Stripe ажиллахгүй)
- Flow: Order(PENDING) → Upload proof(PROCESSING) → Admin approve(PAID) → Bull → Enrollment + Invoice + Notification
- `IPaymentGateway` → `MockPaymentGateway` (DI token), ирээдүйд QPay/Stripe
- InvoicePdfService: Puppeteer → A4 PDF, `INV-YYYY-XXXXXXXX` format
- Үнэгүй сургалтад захиалга үүсгэхгүй, валют default MNT

### Analytics Module (Phase 5)

`/api/v1/analytics/dashboard` — 4 endpoints (ADMIN) | `/analytics/courses` — 3 (TEACHER/ADMIN) | `/analytics/events` — 2
**Exports**: `AnalyticsEventRepository` | **Deps**: BullModule, CoursesModule, EnrollmentsModule, ConfigModule

- Hybrid: AnalyticsEvent таблиц (event tracking) + Aggregation from existing tables
- `AnalyticsAggregationRepository`: `$queryRawUnsafe` SQL aggregate — Prisma text type, `::uuid` cast хэрэглэхгүй
- `Prisma.raw()` ашиглан `date_trunc` SQL identifier embed
- Track event: @Public, JWT optional, Bull Queue async

### Admin Module (Phase 5)

`/api/v1/admin/audit-logs` — 3 endpoints | `/admin/settings` — 5 | `/admin/dashboard` — 8
**Exports**: `AuditLogService` (log — Bull Queue async) | **Deps**: BullModule, DiscussionsModule, NotificationsModule, ConfigModule

- AuditLog async: `AuditLogService.log()` → Bull Queue → DB (endpoint удаашруулахгүй)
- SystemSettings: Prisma upsert + auto audit log
- Moderation: DiscussionPostRepository `findFlagged()`, `countFlagged()`, `countLocked()`
- `RolesGuard` засвар: `@Public()` + `@Roles()` хамт байхад `IS_PUBLIC_KEY` шалгалт

### Live Classes Module (Phase 6)

`/api/v1/live-sessions` — 14 endpoints (CRUD, start/end, join/leave, attendees, token, webhook/recording)
**Exports**: `LiveSessionRepository` | **Deps**: BullModule, LessonsModule, CoursesModule, EnrollmentsModule, NotificationsModule, ConfigModule

- Agora SDK — WebSocket шаардлагагүй, server зөвхөн RTC token үүсгэнэ
- `AGORA_SERVICE` → `AgoraTokenService`, channel: `ocp-live-{sessionId}`, deterministic UID (CRC32-like hash)
- Status: SCHEDULED → LIVE → ENDED | SCHEDULED → CANCELLED
- `@@unique([liveSessionId, userId])` attendance upsert, `lessonId` unique
- Bull: session-started, session-ended (markAllLeft), session-reminder (15 мин), recording-ready
- Webhook: `x-agora-signature` HMAC-SHA256 verification

### DLQ Module (Common — Production Readiness)

`apps/api/src/common/dlq/` — Bull queue failed job tracking + admin alerting
**Exports**: `DlqRepository`, `DlqService` | **Deps**: BullModule (бүх 6 queue), PrismaModule, RedisModule

- `FailedJob` PostgreSQL model — queue нэр, severity, status, job data хадгална
- Severity mapping: payments/certificates=CRITICAL, live-classes=HIGH, notifications=MEDIUM, analytics/admin=LOW
- CRITICAL/HIGH failed job → admin-д IN_APP notification шууд DB-д (infinite loop хамгаалалт)
- Alert rate limit: Redis key `dlq:alert:{queueName}` TTL 300s
- Admin endpoints: `GET /admin/dashboard/failed-jobs`, `POST /:id/retry`, `PATCH /:id/resolve`
- `GetPendingItemsUseCase`-д `failedJobs` count нэмэгдсэн

### Web App Setup (Phase 7 - Frontend)

- Next.js 16.1 + React 19.2 + Tailwind CSS 4 + shadcn/ui (new-york, 24 components) + React Query 5.62 + Zustand 5.0
- `components.json`, `globals.css` (OKLCH, light/dark), `cn()` utility, 24 shadcn UI components
- Routes: `(auth)/` login,register,forgot-password | `(dashboard)/` dashboard,profile,courses,my-courses | `(admin)/`
- Shared: `@ocp/shared-types`, `@ocp/validation` (Zod), `@ocp/api-client` (Axios), `@ocp/ui-components`
