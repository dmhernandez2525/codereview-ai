# syntax=docker/dockerfile:1

# =============================================================================
# Base stage - shared dependencies
# =============================================================================
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# =============================================================================
# Dependencies stage - install node modules
# =============================================================================
FROM base AS deps
# Copy root package files for workspace support
COPY package.json package-lock.json ./
COPY Client/package.json ./Client/
RUN npm ci --workspace=Client

# =============================================================================
# Builder stage - build the application
# =============================================================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/Client/node_modules ./Client/node_modules
COPY Client/ ./Client/

WORKDIR /app/Client
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# =============================================================================
# Production stage - minimal production image
# =============================================================================
FROM base AS production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/Client/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/Client/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/Client/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
