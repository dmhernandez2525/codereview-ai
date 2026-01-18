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
COPY package.json package-lock.json ./
RUN npm ci

# =============================================================================
# Builder stage - build the application
# =============================================================================
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

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
COPY --from=builder --chown=strapi:strapi /app/package.json ./
COPY --from=builder --chown=strapi:strapi /app/package-lock.json ./
COPY --from=builder --chown=strapi:strapi /app/node_modules ./node_modules
COPY --from=builder --chown=strapi:strapi /app/dist ./dist
COPY --from=builder --chown=strapi:strapi /app/config ./config
COPY --from=builder --chown=strapi:strapi /app/src ./src
COPY --from=builder --chown=strapi:strapi /app/public ./public
COPY --from=builder --chown=strapi:strapi /app/database ./database
COPY --from=builder --chown=strapi:strapi /app/types ./types

USER strapi

EXPOSE 1337

ENV HOST=0.0.0.0
ENV PORT=1337

CMD ["npm", "run", "start"]
