# Software Design Document

## CodeReview AI - AI-Powered Code Review Platform

**Version:** 1.0.0
**Last Updated:** January 2026
**Status:** Draft

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Component Design](#3-component-design)
4. [Database Schema](#4-database-schema)
5. [API Design](#5-api-design)
6. [Security Architecture](#6-security-architecture)
7. [Integration Architecture](#7-integration-architecture)
8. [Deployment Architecture](#8-deployment-architecture)
9. [Technology Stack](#9-technology-stack)
10. [Non-Functional Requirements](#10-non-functional-requirements)

---

## 1. Executive Summary

### 1.1 Purpose

CodeReview AI is a self-hostable, open-source platform that provides AI-powered code reviews for pull requests. It integrates with major Git platforms and leverages multiple AI providers to deliver intelligent, context-aware code review feedback.

### 1.2 Goals

- **Automate Code Reviews**: Reduce manual review burden with AI-generated insights
- **Multi-Platform Support**: GitHub, GitLab, Bitbucket, Azure DevOps
- **Provider Flexibility**: Support OpenAI, Anthropic, and Google AI
- **Self-Hostable**: Full control over data and infrastructure
- **Configurable**: Repository-level customization via YAML

### 1.3 Scope

| In Scope | Out of Scope |
|----------|--------------|
| PR webhook processing | IDE plugins |
| AI review generation | Real-time collaboration |
| Multi-platform Git integration | Git hosting |
| Usage tracking & analytics | Billing/payments (v1) |
| Repository configuration | Mobile applications |

### 1.4 Key Stakeholders

- **Development Teams**: Primary users receiving code reviews
- **Team Leads**: Configure review settings and view analytics
- **Organization Admins**: Manage repositories and API keys
- **Self-Hosting Operators**: Deploy and maintain the platform

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL SYSTEMS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  GitHub  │  │  GitLab  │  │Bitbucket │  │  Azure   │  │ AI Providers │   │
│  │          │  │          │  │          │  │  DevOps  │  │ OpenAI/Claude│   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       │             │             │             │                │           │
└───────┼─────────────┼─────────────┼─────────────┼────────────────┼───────────┘
        │ Webhooks    │ Webhooks    │ Webhooks    │ Webhooks       │ API
        ▼             ▼             ▼             ▼                │
┌─────────────────────────────────────────────────────────────────┐│
│                         MICROSERVICE                             ││
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              ││
│  │  Webhook    │  │   Review    │  │     AI      │◄─────────────┘│
│  │  Handlers   │─▶│   Service   │─▶│  Providers  │               │
│  └─────────────┘  └─────────────┘  └─────────────┘               │
│         │                │                                        │
│         │                │  ┌─────────────┐                      │
│         │                └─▶│    Queue    │ Bull/Redis           │
│         │                   └─────────────┘                      │
└─────────┼───────────────────────────────────────────────────────┘
          │ REST API
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                           SERVER (Strapi)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   Content   │  │    Auth     │  │    API      │              │
│  │    Types    │  │   (JWT)     │  │  Endpoints  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                  ┌─────────────┐               │
│  │ PostgreSQL  │                  │    Redis    │               │
│  └─────────────┘                  └─────────────┘               │
└───────────────────────────────────────────────────────────────────┘
          ▲ REST API
          │
┌─────────┴───────────────────────────────────────────────────────┐
│                           CLIENT (Next.js)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Dashboard  │  │  Marketing  │  │    Auth     │              │
│  │    Pages    │  │    Pages    │  │    Pages    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    User's Browser                           ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Overview

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Client** | Next.js 14 | User interface, dashboard, marketing |
| **Server** | Strapi 5 | Data management, authentication, REST API |
| **Microservice** | Express.js | Webhook processing, AI orchestration |
| **Database** | PostgreSQL | Persistent data storage |
| **Cache** | Redis | Caching, job queues, rate limiting |

### 2.3 Data Flow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        REVIEW GENERATION FLOW                             │
└──────────────────────────────────────────────────────────────────────────┘

1. PR Created/Updated
   │
   ▼
2. Git Platform ──webhook──▶ Microservice
   │
   ▼
3. Microservice validates webhook signature
   │
   ▼
4. Microservice queries Strapi for repository config
   │
   ▼
5. Microservice fetches PR diff from Git platform
   │
   ▼
6. Microservice queues review job (Bull)
   │
   ▼
7. Worker processes job:
   ├── Fetches .codereview.yaml from repo
   ├── Filters files based on config
   ├── Chunks diff for AI processing
   └── Sends to AI provider
   │
   ▼
8. AI generates review comments
   │
   ▼
9. Microservice posts comments to Git platform
   │
   ▼
10. Microservice updates review status in Strapi
    │
    ▼
11. Usage logged for analytics
```

---

## 3. Component Design

### 3.1 Client (Next.js 14)

#### 3.1.1 Application Structure

```
Client/
├── app/                          # App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── layout.tsx
│   ├── (dashboard)/              # Protected dashboard
│   │   ├── page.tsx              # Dashboard home
│   │   ├── repositories/
│   │   │   ├── page.tsx          # Repository list
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx      # Repository detail
│   │   │   │   ├── settings/
│   │   │   │   └── reviews/
│   │   ├── reviews/
│   │   │   ├── page.tsx          # Review list
│   │   │   └── [id]/
│   │   ├── settings/
│   │   │   ├── page.tsx
│   │   │   ├── api-keys/
│   │   │   ├── integrations/
│   │   │   └── organization/
│   │   ├── analytics/
│   │   └── layout.tsx
│   ├── (marketing)/              # Public marketing
│   │   ├── page.tsx              # Homepage
│   │   ├── pricing/
│   │   ├── docs/
│   │   ├── about/
│   │   └── layout.tsx
│   ├── (legal)/
│   │   ├── privacy/
│   │   └── terms/
│   ├── api/                      # API routes
│   │   └── health/
│   ├── layout.tsx                # Root layout
│   └── globals.css
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── forms/                    # Form components
│   ├── layout/                   # Layout components
│   ├── dashboard/                # Dashboard-specific
│   └── marketing/                # Marketing-specific
├── lib/
│   ├── api/                      # API client
│   ├── utils/                    # Utilities
│   └── hooks/                    # Custom hooks
├── types/                        # TypeScript types
└── public/                       # Static assets
```

#### 3.1.2 Key Features

- **Server Components**: Data fetching at build/request time
- **Streaming**: Progressive page rendering
- **Route Groups**: Separate layouts for auth, dashboard, marketing
- **Middleware**: Auth protection, redirects
- **React Query**: Client-side data fetching and caching

### 3.2 Server (Strapi 5)

#### 3.2.1 Content Types

```
Server/src/api/
├── organization/
│   ├── content-types/
│   │   └── organization/
│   │       └── schema.json
│   ├── controllers/
│   ├── routes/
│   └── services/
├── repository/
├── review/
├── review-comment/
├── api-key/
├── configuration/
└── usage-log/
```

#### 3.2.2 Custom Extensions

```
Server/src/
├── extensions/
│   └── users-permissions/        # Extended auth
├── middlewares/
│   ├── rate-limit.ts
│   └── organization-scope.ts
└── api/
    └── [content-type]/
        └── controllers/
            └── [custom-controllers].ts
```

### 3.3 Microservice (Express)

#### 3.3.1 Service Architecture

```
Microservice/src/
├── index.ts                      # Entry point
├── app.ts                        # Express app setup
├── config/
│   ├── index.ts                  # Configuration
│   └── logger.ts                 # Logging config
├── controllers/
│   ├── webhook.controller.ts     # Webhook handlers
│   ├── review.controller.ts      # Review endpoints
│   └── health.controller.ts      # Health checks
├── services/
│   ├── review.service.ts         # Review orchestration
│   ├── diff.service.ts           # Diff processing
│   ├── config.service.ts         # YAML config parsing
│   └── queue.service.ts          # Job queue management
├── providers/
│   ├── ai/
│   │   ├── index.ts              # Provider factory
│   │   ├── base.provider.ts      # Abstract base
│   │   ├── openai.provider.ts
│   │   ├── anthropic.provider.ts
│   │   └── gemini.provider.ts
│   └── git/
│       ├── index.ts              # Platform factory
│       ├── base.provider.ts      # Abstract base
│       ├── github.provider.ts
│       ├── gitlab.provider.ts
│       ├── bitbucket.provider.ts
│       └── azure.provider.ts
├── integrations/
│   ├── github/
│   │   ├── client.ts             # GitHub API client
│   │   ├── webhook.ts            # Webhook validation
│   │   └── types.ts
│   ├── gitlab/
│   ├── bitbucket/
│   └── azure/
├── middleware/
│   ├── auth.middleware.ts        # Authentication
│   ├── validate.middleware.ts    # Request validation
│   ├── error.middleware.ts       # Error handling
│   └── rate-limit.middleware.ts  # Rate limiting
├── utils/
│   ├── encryption.ts             # API key encryption
│   ├── diff-parser.ts            # Diff parsing
│   └── token-counter.ts          # Token estimation
├── types/
│   ├── review.types.ts
│   ├── webhook.types.ts
│   └── config.types.ts
└── jobs/
    ├── review.job.ts             # Review processing job
    └── cleanup.job.ts            # Cleanup job
```

#### 3.3.2 Provider Pattern

```typescript
// Base AI Provider Interface
interface AIProvider {
  name: string;
  generateReview(params: ReviewParams): Promise<ReviewResult>;
  estimateTokens(content: string): number;
}

// Provider Factory
class AIProviderFactory {
  static create(provider: string, apiKey: string): AIProvider {
    switch (provider) {
      case 'openai':
        return new OpenAIProvider(apiKey);
      case 'anthropic':
        return new AnthropicProvider(apiKey);
      case 'gemini':
        return new GeminiProvider(apiKey);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }
}
```

---

## 4. Database Schema

### 4.1 Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  Organization   │       │    User         │       │   Repository    │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id              │◄──┐   │ id              │   ┌──▶│ id              │
│ name            │   │   │ email           │   │   │ name            │
│ slug            │   │   │ password        │   │   │ full_name       │
│ settings (json) │   │   │ organization_id │───┘   │ platform        │
│ created_at      │   │   │ role            │       │ external_id     │
│ updated_at      │   └───│ created_at      │       │ organization_id │───┐
└─────────────────┘       └─────────────────┘       │ settings (json) │   │
                                                     │ created_at      │   │
                                                     └────────┬────────┘   │
                                                              │            │
                          ┌───────────────────────────────────┘            │
                          │                                                │
                          ▼                                                │
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐   │
│ Review Comment  │       │     Review      │       │   API Key       │   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤   │
│ id              │       │ id              │       │ id              │   │
│ review_id       │───────│ repository_id   │───────│ user_id         │   │
│ file_path       │       │ pr_number       │       │ provider        │   │
│ line_number     │       │ pr_title        │       │ encrypted_key   │   │
│ content         │       │ status          │       │ last_used_at    │   │
│ severity        │       │ ai_provider     │       │ created_at      │   │
│ category        │       │ model           │       └─────────────────┘   │
│ created_at      │       │ tokens_used     │                             │
└─────────────────┘       │ created_at      │                             │
                          └─────────────────┘                             │
                                                                          │
┌─────────────────┐       ┌─────────────────┐                             │
│  Configuration  │       │   Usage Log     │                             │
├─────────────────┤       ├─────────────────┤                             │
│ id              │       │ id              │                             │
│ repository_id   │───────│ organization_id │─────────────────────────────┘
│ yaml_content    │       │ repository_id   │
│ parsed (json)   │       │ review_id       │
│ version         │       │ provider        │
│ created_at      │       │ model           │
└─────────────────┘       │ tokens_input    │
                          │ tokens_output   │
                          │ cost_estimate   │
                          │ created_at      │
                          └─────────────────┘
```

### 4.2 Table Definitions

#### 4.2.1 Organizations

```sql
CREATE TABLE organizations (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(255) NOT NULL,
  slug            VARCHAR(255) NOT NULL UNIQUE,
  settings        JSONB DEFAULT '{}',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_organizations_slug ON organizations(slug);
```

#### 4.2.2 Repositories

```sql
CREATE TABLE repositories (
  id              SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            VARCHAR(255) NOT NULL,
  full_name       VARCHAR(512) NOT NULL,
  platform        VARCHAR(50) NOT NULL CHECK (platform IN ('github', 'gitlab', 'bitbucket', 'azure')),
  external_id     VARCHAR(255) NOT NULL,
  default_branch  VARCHAR(255) DEFAULT 'main',
  webhook_id      VARCHAR(255),
  webhook_secret  VARCHAR(255),
  is_active       BOOLEAN DEFAULT true,
  settings        JSONB DEFAULT '{}',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(platform, external_id)
);

CREATE INDEX idx_repositories_org ON repositories(organization_id);
CREATE INDEX idx_repositories_platform ON repositories(platform, external_id);
```

#### 4.2.3 Reviews

```sql
CREATE TABLE reviews (
  id              SERIAL PRIMARY KEY,
  repository_id   INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  pr_number       INTEGER NOT NULL,
  pr_title        VARCHAR(512),
  pr_url          VARCHAR(1024),
  pr_author       VARCHAR(255),
  head_sha        VARCHAR(40),
  base_sha        VARCHAR(40),
  status          VARCHAR(50) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
  ai_provider     VARCHAR(50),
  model           VARCHAR(100),
  tokens_used     INTEGER DEFAULT 0,
  processing_time INTEGER,
  error_message   TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at    TIMESTAMP
);

CREATE INDEX idx_reviews_repo ON reviews(repository_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);
```

#### 4.2.4 Review Comments

```sql
CREATE TABLE review_comments (
  id              SERIAL PRIMARY KEY,
  review_id       INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  file_path       VARCHAR(1024) NOT NULL,
  line_start      INTEGER,
  line_end        INTEGER,
  content         TEXT NOT NULL,
  severity        VARCHAR(50) CHECK (severity IN ('info', 'suggestion', 'warning', 'error')),
  category        VARCHAR(100),
  external_id     VARCHAR(255),
  is_posted       BOOLEAN DEFAULT false,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_review_comments_review ON review_comments(review_id);
CREATE INDEX idx_review_comments_file ON review_comments(file_path);
```

#### 4.2.5 API Keys

```sql
CREATE TABLE api_keys (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider        VARCHAR(50) NOT NULL CHECK (provider IN ('openai', 'anthropic', 'gemini')),
  encrypted_key   TEXT NOT NULL,
  key_hint        VARCHAR(20),
  is_valid        BOOLEAN DEFAULT true,
  last_used_at    TIMESTAMP,
  last_error      TEXT,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, provider)
);

CREATE INDEX idx_api_keys_user ON api_keys(user_id);
```

#### 4.2.6 Configurations

```sql
CREATE TABLE configurations (
  id              SERIAL PRIMARY KEY,
  repository_id   INTEGER NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  yaml_content    TEXT NOT NULL,
  parsed          JSONB NOT NULL,
  version         VARCHAR(20) DEFAULT '1.0',
  sha             VARCHAR(40),
  is_valid        BOOLEAN DEFAULT true,
  validation_errors JSONB,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_configurations_repo ON configurations(repository_id);
CREATE UNIQUE INDEX idx_configurations_repo_latest ON configurations(repository_id)
  WHERE is_valid = true;
```

#### 4.2.7 Usage Logs

```sql
CREATE TABLE usage_logs (
  id              SERIAL PRIMARY KEY,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  repository_id   INTEGER REFERENCES repositories(id) ON DELETE SET NULL,
  review_id       INTEGER REFERENCES reviews(id) ON DELETE SET NULL,
  user_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  provider        VARCHAR(50) NOT NULL,
  model           VARCHAR(100) NOT NULL,
  tokens_input    INTEGER NOT NULL DEFAULT 0,
  tokens_output   INTEGER NOT NULL DEFAULT 0,
  cost_estimate   DECIMAL(10, 6),
  request_type    VARCHAR(50),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usage_logs_org ON usage_logs(organization_id);
CREATE INDEX idx_usage_logs_created ON usage_logs(created_at DESC);
CREATE INDEX idx_usage_logs_org_created ON usage_logs(organization_id, created_at DESC);
```

### 4.3 Strapi Content Type Schemas

#### 4.3.1 Repository Schema

```json
{
  "kind": "collectionType",
  "collectionName": "repositories",
  "info": {
    "singularName": "repository",
    "pluralName": "repositories",
    "displayName": "Repository"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "fullName": {
      "type": "string",
      "required": true
    },
    "platform": {
      "type": "enumeration",
      "enum": ["github", "gitlab", "bitbucket", "azure"],
      "required": true
    },
    "externalId": {
      "type": "string",
      "required": true
    },
    "defaultBranch": {
      "type": "string",
      "default": "main"
    },
    "webhookId": {
      "type": "string",
      "private": true
    },
    "webhookSecret": {
      "type": "string",
      "private": true
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "settings": {
      "type": "json",
      "default": {}
    },
    "organization": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::organization.organization",
      "inversedBy": "repositories"
    },
    "reviews": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::review.review",
      "mappedBy": "repository"
    }
  }
}
```

---

## 5. API Design

### 5.1 API Overview

| Service | Base URL | Purpose |
|---------|----------|---------|
| Server (Strapi) | `/api` | Data management, auth |
| Microservice | `/api/v1` | Webhooks, review processing |

### 5.2 Authentication

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
└─────────────────────────────────────────────────────────────────┘

1. User Login
   POST /api/auth/local
   Body: { identifier, password }
   Response: { jwt, user }

2. OAuth Login (GitHub)
   GET /api/connect/github
   → Redirect to GitHub
   → Callback: /api/connect/github/callback
   Response: { jwt, user }

3. Authenticated Requests
   Headers: { Authorization: "Bearer <jwt>" }

4. API Token (Service-to-Service)
   Headers: { Authorization: "Bearer <api_token>" }
```

### 5.3 Key Endpoints

See [API_SPECIFICATION.md](API_SPECIFICATION.md) for complete endpoint documentation.

---

## 6. Security Architecture

### 6.1 Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                               │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Network Security
├── TLS/SSL encryption (HTTPS)
├── Rate limiting
└── DDoS protection (via CDN/proxy)

Layer 2: Authentication
├── JWT tokens (short-lived)
├── Refresh tokens (long-lived, httpOnly)
├── OAuth 2.0 for Git platforms
└── API tokens for service communication

Layer 3: Authorization
├── Role-based access control (RBAC)
├── Organization-scoped data access
└── Resource ownership validation

Layer 4: Data Security
├── API key encryption (AES-256)
├── Password hashing (bcrypt)
├── Webhook signature verification
└── Input validation/sanitization
```

### 6.2 API Key Encryption

```typescript
// Encryption for stored API keys
const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'base64');

function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

function decrypt(ciphertext: string): string {
  const buffer = Buffer.from(ciphertext, 'base64');
  const iv = buffer.subarray(0, 16);
  const authTag = buffer.subarray(16, 32);
  const encrypted = buffer.subarray(32);
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final('utf8');
}
```

### 6.3 Webhook Verification

```typescript
// GitHub webhook signature verification
function verifyGitHubWebhook(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = 'sha256=' +
    crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### 6.4 RBAC Roles

| Role | Permissions |
|------|-------------|
| **viewer** | View reviews, view repositories |
| **member** | + Create reviews, manage own API keys |
| **admin** | + Manage repositories, manage org settings |
| **owner** | + Manage users, delete organization |

---

## 7. Integration Architecture

### 7.1 Git Platform Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                    GIT PLATFORM ABSTRACTION                      │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │  GitProvider    │ (Abstract)
                    │  Interface      │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   GitHub     │    │   GitLab     │    │  Bitbucket   │
│   Provider   │    │   Provider   │    │   Provider   │
└──────────────┘    └──────────────┘    └──────────────┘

Interface Methods:
- getDiff(owner, repo, prNumber): Promise<Diff>
- postComment(owner, repo, prNumber, comment): Promise<void>
- getFile(owner, repo, path, ref): Promise<string>
- validateWebhook(payload, signature): boolean
- createWebhook(owner, repo, url): Promise<WebhookInfo>
```

### 7.2 AI Provider Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI PROVIDER ABSTRACTION                       │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │   AIProvider    │ (Abstract)
                    │   Interface     │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   OpenAI     │    │  Anthropic   │    │   Gemini     │
│   Provider   │    │   Provider   │    │   Provider   │
└──────────────┘    └──────────────┘    └──────────────┘

Interface Methods:
- generateReview(params: ReviewParams): Promise<ReviewResult>
- estimateTokens(content: string): number
- getModels(): Model[]
- validateApiKey(): Promise<boolean>

Model Configurations:
- OpenAI: gpt-4-turbo, gpt-4o, gpt-3.5-turbo
- Anthropic: claude-3-opus, claude-3-sonnet, claude-3-haiku
- Gemini: gemini-1.5-pro, gemini-1.5-flash
```

### 7.3 Review Generation Flow

```typescript
interface ReviewParams {
  diff: string;
  config: ReviewConfig;
  context?: {
    repoDescription?: string;
    guidelines?: string[];
    previousComments?: Comment[];
  };
}

interface ReviewResult {
  comments: ReviewComment[];
  summary?: string;
  tokensUsed: {
    input: number;
    output: number;
  };
}

// System prompt template
const SYSTEM_PROMPT = `You are an expert code reviewer. Analyze the provided code diff and provide constructive feedback.

Guidelines:
- Focus on code quality, maintainability, and potential bugs
- Be specific and actionable in your suggestions
- Consider security implications
- Follow the repository's coding standards
{customGuidelines}

Response format: JSON array of comments with file path, line numbers, content, and severity.`;
```

---

## 8. Deployment Architecture

### 8.1 Docker Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOCKER COMPOSE ARCHITECTURE                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         Docker Host                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    docker-compose                        │    │
│  │                                                          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │    │
│  │  │  Client  │  │  Server  │  │Microserv │               │    │
│  │  │  :3000   │  │  :1337   │  │  :4000   │               │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘               │    │
│  │       │             │             │                      │    │
│  │       └─────────────┼─────────────┘                      │    │
│  │                     │                                    │    │
│  │  ┌──────────────────┴──────────────────┐                │    │
│  │  │           Internal Network          │                │    │
│  │  └──────────────────┬──────────────────┘                │    │
│  │                     │                                    │    │
│  │       ┌─────────────┼─────────────┐                     │    │
│  │       │             │             │                      │    │
│  │  ┌────┴─────┐  ┌────┴─────┐  ┌────┴─────┐               │    │
│  │  │PostgreSQL│  │  Redis   │  │  Nginx   │               │    │
│  │  │  :5432   │  │  :6379   │  │  :80/443 │               │    │
│  │  └──────────┘  └──────────┘  └──────────┘               │    │
│  │                                                          │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Cloud Deployment (Render)

```
┌─────────────────────────────────────────────────────────────────┐
│                    RENDER DEPLOYMENT                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │     │   Server     │     │ Microservice │
│   Web Svc    │     │   Web Svc    │     │   Web Svc    │
│   (Node)     │     │   (Node)     │     │   (Node)     │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │                    │                    │
       │             ┌──────┴───────┐            │
       │             │              │            │
       │             ▼              ▼            │
       │      ┌───────────┐  ┌───────────┐      │
       │      │PostgreSQL │  │   Redis   │      │
       │      │  (Render) │  │  (Render) │      │
       │      └───────────┘  └───────────┘      │
       │                                         │
       └─────────────────┬───────────────────────┘
                         │
                  ┌──────┴───────┐
                  │    Render    │
                  │    Router    │
                  │  (SSL/CDN)   │
                  └──────────────┘
```

### 8.3 Scaling Considerations

| Component | Scaling Strategy |
|-----------|------------------|
| **Client** | Horizontal (replicas), CDN caching |
| **Server** | Horizontal with load balancer |
| **Microservice** | Horizontal with shared Redis queue |
| **PostgreSQL** | Vertical, read replicas |
| **Redis** | Cluster mode for high availability |

---

## 9. Technology Stack

### 9.1 Frontend (Client)

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Framework | Next.js | 14.x | React framework with App Router |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 3.x | Utility-first CSS |
| Components | shadcn/ui | Latest | UI component library |
| State | React Query | 5.x | Server state management |
| State | Zustand | 4.x | Client state management |
| Forms | React Hook Form | 7.x | Form handling |
| Validation | Zod | 3.x | Schema validation |
| Charts | Recharts | 2.x | Data visualization |

### 9.2 Backend (Server)

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| CMS | Strapi | 5.x | Headless CMS |
| Database | PostgreSQL | 15.x | Primary database |
| Cache | Redis | 7.x | Caching, sessions |
| Language | TypeScript | 5.x | Type safety |

### 9.3 Backend (Microservice)

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Runtime | Node.js | 20.x | JavaScript runtime |
| Framework | Express | 4.x | HTTP server |
| Language | TypeScript | 5.x | Type safety |
| Queue | Bull | 4.x | Job queue |
| Validation | Zod | 3.x | Request validation |
| OpenAI SDK | openai | 4.x | OpenAI integration |
| Anthropic SDK | @anthropic-ai/sdk | Latest | Claude integration |
| Google AI SDK | @google/generative-ai | Latest | Gemini integration |

### 9.4 Infrastructure

| Category | Technology | Purpose |
|----------|------------|---------|
| Containers | Docker | Containerization |
| Orchestration | Docker Compose | Local development |
| CI/CD | GitHub Actions | Automated testing/deployment |
| Cloud | Render | Managed hosting |
| SSL | Let's Encrypt | TLS certificates |

---

## 10. Non-Functional Requirements

### 10.1 Performance

| Metric | Target | Notes |
|--------|--------|-------|
| API Response Time | < 200ms | P95 for simple queries |
| Review Generation | < 60s | For typical PR (< 500 lines) |
| Page Load Time | < 3s | LCP for dashboard |
| Webhook Processing | < 5s | Time to acknowledge |

### 10.2 Scalability

- Handle 1000+ repositories per organization
- Process 100+ concurrent reviews
- Support 10,000+ daily webhook events

### 10.3 Availability

- 99.9% uptime target
- Graceful degradation when AI providers are unavailable
- Auto-retry with exponential backoff

### 10.4 Security

- SOC 2 Type II compliance ready
- GDPR compliant data handling
- Regular security audits
- Encrypted data at rest and in transit

### 10.5 Monitoring

| Aspect | Tool | Metrics |
|--------|------|---------|
| Application | Built-in + external | Response times, error rates |
| Infrastructure | Docker stats / Render | CPU, memory, disk |
| Logging | JSON structured logs | All requests, errors |
| Alerting | External integration | Error spikes, downtime |

---

## Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| **PR** | Pull Request (or Merge Request) |
| **Diff** | The changes between two versions of code |
| **Webhook** | HTTP callback triggered by an event |
| **JWT** | JSON Web Token for authentication |
| **RBAC** | Role-Based Access Control |

### B. References

- [Next.js Documentation](https://nextjs.org/docs)
- [Strapi Documentation](https://docs.strapi.io)
- [OpenAI API Reference](https://platform.openai.com/docs)
- [Anthropic API Reference](https://docs.anthropic.com)
- [GitHub Webhooks](https://docs.github.com/en/webhooks)

### C. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Jan 2026 | Initial | Initial draft |
