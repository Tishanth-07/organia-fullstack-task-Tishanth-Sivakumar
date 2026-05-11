# ── 1. Dependency Stage ───────────────────────────────────────────────────────
# Install only the necessary dependencies required for the build.
FROM node:20-alpine AS deps
WORKDIR /app

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine 
# to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

# Copy package manifests for efficient layer caching
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

# ── 2. Builder Stage ──────────────────────────────────────────────────────────
# Compile the Next.js application into a production-ready standalone bundle.
FROM node:20-alpine AS builder
WORKDIR /app

# Inherit node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY frontend/ .

# Inject build-time environment variables
ARG NEXT_PUBLIC_API_URL=http://localhost:5181/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

# Execute production build
RUN npm run build

# ── 2.5 Test Stage ───────────────────────────────────────────────────────────
FROM builder AS test
# Ensure tests pass before proceeding to runner
RUN npm test

# ── 3. Runner Stage ───────────────────────────────────────────────────────────
# Final production image with minimal footprint and non-root execution.
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-privileged user for security compliance
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy static assets and standalone server artifacts
COPY --from=test /app/public ./public
COPY --from=test --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=test --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Network Configuration
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Entrypoint: Execute the standalone server
CMD ["node", "server.js"]