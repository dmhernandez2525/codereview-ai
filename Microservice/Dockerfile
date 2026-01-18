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
COPY Microservice/package.json ./Microservice/
RUN npm ci --workspace=Microservice

# =============================================================================
# Builder stage - build the application
# =============================================================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/Microservice/node_modules ./Microservice/node_modules
COPY Microservice/ ./Microservice/

WORKDIR /app/Microservice
RUN npm run build

# =============================================================================
# Production stage - minimal production image
# =============================================================================
FROM base AS production
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 express
RUN adduser --system --uid 1001 express

WORKDIR /app

# Copy package files and install production deps only
COPY package.json package-lock.json ./
COPY Microservice/package.json ./Microservice/
RUN npm ci --workspace=Microservice --omit=dev && npm cache clean --force

# Copy built artifacts
COPY --from=builder --chown=express:express /app/Microservice/dist ./dist

USER express

EXPOSE 4000

ENV HOST=0.0.0.0
ENV PORT=4000

CMD ["node", "dist/index.js"]
