# syntax=docker/dockerfile:1

# =============================================================================
# Base stage - shared dependencies
# =============================================================================
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

# =============================================================================
# Dependencies stage - install node modules
# =============================================================================
FROM base AS deps
# Copy root package files for workspace support
COPY package.json package-lock.json ./
COPY Server/package.json ./Server/
RUN npm ci --workspace=Server

# =============================================================================
# Builder stage - build the application
# =============================================================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/Server/node_modules ./Server/node_modules
COPY Server/ ./Server/

WORKDIR /app/Server
ENV NODE_ENV=production
RUN npm run build

# =============================================================================
# Production stage - minimal production image
# =============================================================================
FROM base AS production
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 strapi
RUN adduser --system --uid 1001 strapi

WORKDIR /app

# Copy built artifacts
COPY --from=builder --chown=strapi:strapi /app/Server/package.json ./
COPY --from=builder --chown=strapi:strapi /app/Server/node_modules ./node_modules
COPY --from=builder --chown=strapi:strapi /app/Server/dist ./dist
COPY --from=builder --chown=strapi:strapi /app/Server/config ./config
COPY --from=builder --chown=strapi:strapi /app/Server/src ./src
COPY --from=builder --chown=strapi:strapi /app/Server/public ./public
COPY --from=builder --chown=strapi:strapi /app/Server/database ./database
COPY --from=builder --chown=strapi:strapi /app/Server/types ./types

USER strapi

EXPOSE 1337

ENV HOST=0.0.0.0
ENV PORT=1337

CMD ["npm", "run", "start"]
