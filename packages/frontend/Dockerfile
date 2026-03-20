# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package manifests and ALL workspace package.json stubs.
# All three must be present so npm ci can validate lockfile integrity
# against every workspace referenced in package-lock.json.
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/backend/package.json ./packages/backend/

RUN npm ci

# Copy shared source and build it first (frontend depends on dist/)
COPY packages/shared/src/ ./packages/shared/src/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY tsconfig.base.json ./
RUN npm run build -w packages/shared

# Copy frontend source files
COPY packages/frontend/src/ ./packages/frontend/src/
COPY packages/frontend/next.config.ts ./packages/frontend/
COPY packages/frontend/tsconfig.json ./packages/frontend/
COPY packages/frontend/postcss.config.mjs ./packages/frontend/

# NEXT_PUBLIC_API_URL is baked into the client JS bundle at build time.
# It must resolve to the backend as seen by the browser (host-mapped port).
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# Suppress Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build -w packages/frontend

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -S appuser && adduser -S appuser -G appuser

# Copy the standalone output into /app/.
# With outputFileTracingRoot set to the monorepo root, the standalone directory
# mirrors the monorepo layout: the server entry lives at
# packages/frontend/server.js after this COPY.
COPY --from=builder /app/packages/frontend/.next/standalone/ ./

# Static assets are not included in standalone output — copy separately.
# They must land at packages/frontend/.next/static/ relative to WORKDIR.
COPY --from=builder /app/packages/frontend/.next/static/ ./packages/frontend/.next/static/

# NOTE: No packages/frontend/public/ directory exists in this project.
# The favicon is at src/app/favicon.ico (App Router convention) and is
# included in the .next/static/ output by Next.js automatically.

RUN chown -R appuser:appuser /app

ENV NODE_ENV=production
# Bind to all interfaces so the container is reachable via Docker port mapping.
# Next.js standalone server uses this env var to set its listen address;
# without it the server defaults to localhost (loopback only inside the container).
ENV HOSTNAME=0.0.0.0

USER appuser

EXPOSE 3000

CMD ["node", "packages/frontend/server.js"]
