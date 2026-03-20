# Stage 1: Build
FROM node:20-alpine AS builder

# Install native build tools required by better-sqlite3 (node-gyp)
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy root package manifests and ALL workspace package.json stubs.
# All three must be present so npm ci can validate lockfile integrity
# against every workspace referenced in package-lock.json.
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend/package.json ./packages/backend/
COPY packages/frontend/package.json ./packages/frontend/

RUN npm ci

# Copy shared source and config
COPY packages/shared/src/ ./packages/shared/src/
COPY packages/shared/tsconfig.json ./packages/shared/

# Copy backend source, config, and migrations folder
COPY packages/backend/src/ ./packages/backend/src/
COPY packages/backend/tsconfig.json ./packages/backend/
COPY packages/backend/drizzle/ ./packages/backend/drizzle/

# Copy root TypeScript base config (extended by package tsconfigs)
COPY tsconfig.base.json ./

# Build shared first (backend depends on dist/)
RUN npm run build -w packages/shared && npm run build -w packages/backend

# Remove devDependencies; compiled better-sqlite3 native addon is retained.
# Also remove the auto-linked frontend workspace symlink — the backend production
# image does not include packages/frontend, so leaving this symlink would create
# a dangling reference in node_modules/@todo-bmad/frontend.
RUN npm prune --omit=dev && rm -rf node_modules/@todo-bmad/frontend

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -S appuser && adduser -S appuser -G appuser

# Copy runtime artifacts from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages/shared/dist/ ./packages/shared/dist/
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/backend/dist/ ./packages/backend/dist/
COPY --from=builder /app/packages/backend/drizzle/ ./packages/backend/drizzle/
COPY --from=builder /app/packages/backend/package.json ./packages/backend/
# node_modules contains pruned production deps including compiled better-sqlite3
COPY --from=builder /app/node_modules/ ./node_modules/

# Create data directory with correct ownership for SQLite writes
RUN mkdir -p /app/packages/backend/data && chown -R appuser:appuser /app/packages/backend/data

ENV NODE_ENV=production

USER appuser

EXPOSE 3001

CMD ["node", "packages/backend/dist/index.js"]
