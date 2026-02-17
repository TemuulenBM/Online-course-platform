# =============================================================================
# Web Dockerfile — Next.js standalone multi-stage build (monorepo context)
# Build command: docker build -f apps/web/Dockerfile -t ocp-web .
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
COPY apps/web/package.json ./apps/web/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/validation/package.json ./packages/validation/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/ui-components/package.json ./packages/ui-components/

RUN pnpm install --frozen-lockfile

# --- Builder stage: build хийх ---
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages ./packages

# Бүх source code хуулах
COPY apps/web ./apps/web
COPY packages ./packages
COPY turbo.json package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Workspace packages build хийх
RUN pnpm --filter @ocp/shared-types build || true
RUN pnpm --filter @ocp/validation build || true
RUN pnpm --filter @ocp/api-client build || true
RUN pnpm --filter @ocp/ui-components build || true

# Next.js build
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @ocp/web build

# --- Production stage: standalone output ---
FROM node:20-alpine AS production

RUN apk add --no-cache curl
WORKDIR /app

# Non-root хэрэглэгч
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Next.js standalone output хуулах
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

CMD ["node", "apps/web/server.js"]
