# Online Course Platform

Turborepo monorepo бүхий онлайн сургалтын платформ.

## Tech Stack

- **Web**: Next.js + TypeScript + Tailwind CSS + React Query + Zustand
- **API**: NestJS + Prisma (PostgreSQL) + Mongoose (MongoDB)
- **Mobile**: React Native + Expo
- **Infrastructure**: Redis, Elasticsearch, Cloudflare R2, Bull Queue

## Setup

### 1. Prerequisites

- Node.js >= 20
- pnpm (`npm install -g pnpm`)
- Docker & Docker Compose

### 2. Environment variables

```bash
cp .env.example .env
```

### 3. Start infrastructure services

```bash
pnpm docker:up
```

### 4. Install dependencies

```bash
pnpm install
```

### 5. Run database migrations

```bash
pnpm db:generate
pnpm db:migrate
```

### 6. Start development

```bash
pnpm dev
```

## Project Structure

```
├── apps/
│   ├── web/       # Next.js web app
│   ├── api/       # NestJS backend API
│   └── mobile/    # React Native Expo app
├── packages/
│   ├── typescript-config/  # Shared TypeScript configs
│   ├── eslint-config/      # Shared ESLint rules
│   ├── shared-types/       # Shared TypeScript types
│   ├── api-client/         # API client library
│   ├── ui-components/      # Shared UI components
│   └── validation/         # Shared Zod schemas
├── tools/                  # Dev scripts & generators
└── files/                  # Architecture & design docs
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps |
| `pnpm lint` | Lint all apps |
| `pnpm test` | Run all tests |
| `pnpm docker:up` | Start Docker services |
| `pnpm docker:down` | Stop Docker services |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run database migrations |
