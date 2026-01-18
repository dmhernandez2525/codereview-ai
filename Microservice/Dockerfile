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
COPY package.json package-lock.json ./
RUN npm ci

# =============================================================================
# Builder stage - build the application
# =============================================================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# =============================================================================
# Production stage - minimal production image
# =============================================================================
FROM base AS production
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 express
RUN adduser --system --uid 1001 express

WORKDIR /app

# Copy production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built artifacts
COPY --from=builder --chown=express:express /app/dist ./dist

USER express

EXPOSE 4000

ENV HOST=0.0.0.0
ENV PORT=4000

CMD ["node", "dist/index.js"]
