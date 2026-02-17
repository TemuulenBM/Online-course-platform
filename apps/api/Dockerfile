# =============================================================================
# API Dockerfile — NestJS multi-stage build (monorepo context)
# Build command: docker build -f apps/api/Dockerfile -t ocp-api .
# =============================================================================

# --- Base stage: Node 20 Alpine + pnpm ---
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
RUN apk add --no-cache libc6-compat
WORKDIR /app

# --- Dependencies stage: pnpm install ---
FROM base AS deps

# Monorepo тохиргоо хуулах
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/validation/package.json ./packages/validation/

# bcrypt native module-д build tools хэрэгтэй
RUN apk add --no-cache python3 make g++

RUN pnpm install --frozen-lockfile

# --- Builder stage: build хийх ---
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages ./packages

# Бүх source code хуулах
COPY apps/api ./apps/api
COPY packages ./packages
COPY turbo.json package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Prisma client generate (dummy URL — зөвхөн generate-д хэрэгтэй)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN cd apps/api && npx prisma generate

# Workspace packages build хийх (shared-types, validation)
RUN pnpm --filter @ocp/shared-types build || true
RUN pnpm --filter @ocp/validation build || true

# API build
RUN pnpm --filter @ocp/api build

# Production dependencies дахин суулгах (devDependencies хасах)
RUN apk add --no-cache python3 make g++
RUN pnpm --filter @ocp/api --prod deploy /app/prod-deps

# --- Production stage: хамгийн жижиг image ---
FROM node:20-alpine AS production

RUN apk add --no-cache curl
WORKDIR /app

# Non-root хэрэглэгч үүсгэх
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Production dependencies + build output хуулах
COPY --from=builder --chown=nestjs:nodejs /app/prod-deps/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/prisma ./prisma

# Upload хавтас үүсгэх
RUN mkdir -p uploads && chown nestjs:nodejs uploads

USER nestjs

ENV NODE_ENV=production
ENV APP_PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3001/api/v1 || exit 1

CMD ["node", "dist/main"]
