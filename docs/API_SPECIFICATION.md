# API Specification

## CodeReview AI - Complete API Reference

**Version:** 1.0.0
**Base URLs:**
- Server (Strapi): `https://api.yourdomain.com/api`
- Microservice: `https://engine.yourdomain.com/api/v1`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Server API (Strapi)](#2-server-api-strapi)
3. [Microservice API](#3-microservice-api)
4. [Webhooks](#4-webhooks)
5. [Error Handling](#5-error-handling)
6. [Rate Limiting](#6-rate-limiting)

---

## 1. Authentication

### 1.1 JWT Authentication

All authenticated endpoints require a JWT token in the Authorization header.

```http
Authorization: Bearer <jwt_token>
```

### 1.2 Login

```http
POST /api/auth/local
Content-Type: application/json

{
  "identifier": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "user@example.com",
    "confirmed": true,
    "blocked": false,
    "createdAt": "2026-01-15T10:00:00.000Z",
    "updatedAt": "2026-01-15T10:00:00.000Z"
  }
}
```

### 1.3 Register

```http
POST /api/auth/local/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "user@example.com"
  }
}
```

### 1.4 OAuth (GitHub)

```http
GET /api/connect/github
```

Redirects to GitHub for OAuth authorization. After successful authorization, redirects to:

```
/api/connect/github/callback?access_token=<token>
```

### 1.5 Forgot Password

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "ok": true
}
```

### 1.6 Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "code": "reset-code-from-email",
  "password": "newPassword123",
  "passwordConfirmation": "newPassword123"
}
```

### 1.7 Get Current User

```http
GET /api/users/me
Authorization: Bearer <jwt>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "user@example.com",
  "organization": {
    "id": 1,
    "name": "Acme Corp",
    "slug": "acme-corp"
  },
  "role": "admin"
}
```

---

## 2. Server API (Strapi)

### 2.1 Organizations

#### List Organizations

```http
GET /api/organizations
Authorization: Bearer <jwt>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "Acme Corp",
        "slug": "acme-corp",
        "settings": {},
        "createdAt": "2026-01-15T10:00:00.000Z",
        "updatedAt": "2026-01-15T10:00:00.000Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

#### Get Organization

```http
GET /api/organizations/:id
Authorization: Bearer <jwt>
```

#### Update Organization

```http
PUT /api/organizations/:id
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "data": {
    "name": "Acme Corporation",
    "settings": {
      "defaultAiProvider": "openai",
      "defaultModel": "gpt-4-turbo"
    }
  }
}
```

---

### 2.2 Repositories

#### List Repositories

```http
GET /api/repositories
Authorization: Bearer <jwt>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `filters[platform][$eq]` | string | Filter by platform |
| `filters[isActive][$eq]` | boolean | Filter by active status |
| `populate` | string | Include relations (e.g., `organization,reviews`) |
| `pagination[page]` | number | Page number |
| `pagination[pageSize]` | number | Items per page |
| `sort` | string | Sort field (e.g., `createdAt:desc`) |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "name": "my-repo",
        "fullName": "acme/my-repo",
        "platform": "github",
        "externalId": "123456789",
        "defaultBranch": "main",
        "isActive": true,
        "settings": {},
        "createdAt": "2026-01-15T10:00:00.000Z",
        "updatedAt": "2026-01-15T10:00:00.000Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

#### Create Repository

```http
POST /api/repositories
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "data": {
    "name": "my-repo",
    "fullName": "acme/my-repo",
    "platform": "github",
    "externalId": "123456789",
    "defaultBranch": "main",
    "organization": 1
  }
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "name": "my-repo",
      "fullName": "acme/my-repo",
      "platform": "github",
      "externalId": "123456789",
      "defaultBranch": "main",
      "isActive": true
    }
  }
}
```

#### Get Repository

```http
GET /api/repositories/:id
Authorization: Bearer <jwt>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `populate` | string | Include relations |

#### Update Repository

```http
PUT /api/repositories/:id
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "data": {
    "isActive": false,
    "settings": {
      "autoReview": true
    }
  }
}
```

#### Delete Repository

```http
DELETE /api/repositories/:id
Authorization: Bearer <jwt>
```

**Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "name": "my-repo"
    }
  }
}
```

---

### 2.3 Reviews

#### List Reviews

```http
GET /api/reviews
Authorization: Bearer <jwt>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `filters[repository][id][$eq]` | number | Filter by repository |
| `filters[status][$eq]` | string | Filter by status |
| `populate` | string | Include relations |
| `sort` | string | Sort field |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "prNumber": 42,
        "prTitle": "Add new feature",
        "prUrl": "https://github.com/acme/my-repo/pull/42",
        "prAuthor": "developer",
        "headSha": "abc123",
        "baseSha": "def456",
        "status": "completed",
        "aiProvider": "openai",
        "model": "gpt-4-turbo",
        "tokensUsed": 1500,
        "processingTime": 12500,
        "createdAt": "2026-01-15T10:00:00.000Z",
        "completedAt": "2026-01-15T10:00:12.500Z"
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 25,
      "pageCount": 1,
      "total": 1
    }
  }
}
```

#### Get Review

```http
GET /api/reviews/:id
Authorization: Bearer <jwt>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `populate` | string | Include `comments`, `repository` |

**Response (200 OK):**
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "prNumber": 42,
      "prTitle": "Add new feature",
      "status": "completed",
      "comments": {
        "data": [
          {
            "id": 1,
            "attributes": {
              "filePath": "src/index.ts",
              "lineStart": 10,
              "lineEnd": 15,
              "content": "Consider using const instead of let here.",
              "severity": "suggestion",
              "category": "best-practice"
            }
          }
        ]
      }
    }
  }
}
```

---

### 2.4 Review Comments

#### List Comments for Review

```http
GET /api/review-comments
Authorization: Bearer <jwt>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `filters[review][id][$eq]` | number | Filter by review ID |
| `filters[severity][$eq]` | string | Filter by severity |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "filePath": "src/index.ts",
        "lineStart": 10,
        "lineEnd": 15,
        "content": "Consider using const instead of let here.",
        "severity": "suggestion",
        "category": "best-practice",
        "isPosted": true,
        "externalId": "ic_12345",
        "createdAt": "2026-01-15T10:00:00.000Z"
      }
    }
  ]
}
```

---

### 2.5 API Keys

#### List API Keys

```http
GET /api/api-keys
Authorization: Bearer <jwt>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "provider": "openai",
        "keyHint": "sk-...abc",
        "isValid": true,
        "lastUsedAt": "2026-01-15T10:00:00.000Z",
        "createdAt": "2026-01-10T10:00:00.000Z"
      }
    }
  ]
}
```

#### Create API Key

```http
POST /api/api-keys
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "data": {
    "provider": "openai",
    "apiKey": "sk-your-api-key-here"
  }
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": 1,
    "attributes": {
      "provider": "openai",
      "keyHint": "sk-...abc",
      "isValid": true
    }
  }
}
```

#### Delete API Key

```http
DELETE /api/api-keys/:id
Authorization: Bearer <jwt>
```

#### Validate API Key

```http
POST /api/api-keys/:id/validate
Authorization: Bearer <jwt>
```

**Response (200 OK):**
```json
{
  "valid": true,
  "provider": "openai",
  "models": ["gpt-4-turbo", "gpt-4o", "gpt-3.5-turbo"]
}
```

---

### 2.6 Configurations

#### Get Repository Configuration

```http
GET /api/configurations
Authorization: Bearer <jwt>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `filters[repository][id][$eq]` | number | Filter by repository |

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "yamlContent": "version: \"1.0\"\nai:\n  provider: openai\n  model: gpt-4-turbo",
        "parsed": {
          "version": "1.0",
          "ai": {
            "provider": "openai",
            "model": "gpt-4-turbo"
          }
        },
        "version": "1.0",
        "isValid": true,
        "createdAt": "2026-01-15T10:00:00.000Z"
      }
    }
  ]
}
```

#### Update Configuration

```http
PUT /api/configurations/:id
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "data": {
    "yamlContent": "version: \"1.0\"\nai:\n  provider: anthropic\n  model: claude-3-sonnet"
  }
}
```

---

### 2.7 Usage Logs & Analytics

#### Get Usage Summary

```http
GET /api/usage-logs/summary
Authorization: Bearer <jwt>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `startDate` | string | Start date (ISO 8601) |
| `endDate` | string | End date (ISO 8601) |
| `groupBy` | string | `day`, `week`, `month` |

**Response (200 OK):**
```json
{
  "data": {
    "totalReviews": 150,
    "totalTokens": 450000,
    "estimatedCost": 12.50,
    "byProvider": {
      "openai": {
        "reviews": 100,
        "tokens": 300000,
        "cost": 9.00
      },
      "anthropic": {
        "reviews": 50,
        "tokens": 150000,
        "cost": 3.50
      }
    },
    "timeline": [
      {
        "date": "2026-01-15",
        "reviews": 25,
        "tokens": 75000
      }
    ]
  }
}
```

#### List Usage Logs

```http
GET /api/usage-logs
Authorization: Bearer <jwt>
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `filters[createdAt][$gte]` | string | From date |
| `filters[createdAt][$lte]` | string | To date |
| `filters[provider][$eq]` | string | Filter by provider |

---

## 3. Microservice API

### 3.1 Health Check

#### Basic Health

```http
GET /api/v1/health
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-15T10:00:00.000Z",
  "version": "1.0.0"
}
```

#### Detailed Health

```http
GET /api/v1/health/detailed
Authorization: Bearer <api_token>
```

**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-15T10:00:00.000Z",
  "version": "1.0.0",
  "services": {
    "strapi": {
      "status": "healthy",
      "responseTime": 50
    },
    "redis": {
      "status": "healthy",
      "responseTime": 5
    },
    "queue": {
      "status": "healthy",
      "activeJobs": 2,
      "waitingJobs": 5
    }
  }
}
```

---

### 3.2 Reviews

#### Trigger Manual Review

```http
POST /api/v1/reviews
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "repositoryId": 1,
  "pullRequestNumber": 42,
  "options": {
    "force": false,
    "provider": "openai",
    "model": "gpt-4-turbo"
  }
}
```

**Response (202 Accepted):**
```json
{
  "reviewId": "review_abc123",
  "status": "queued",
  "estimatedWait": 30,
  "message": "Review has been queued for processing"
}
```

#### Get Review Status

```http
GET /api/v1/reviews/:reviewId/status
Authorization: Bearer <jwt>
```

**Response (200 OK):**
```json
{
  "reviewId": "review_abc123",
  "status": "in_progress",
  "progress": {
    "stage": "analyzing",
    "filesProcessed": 5,
    "totalFiles": 10,
    "percentage": 50
  },
  "startedAt": "2026-01-15T10:00:00.000Z"
}
```

#### Cancel Review

```http
DELETE /api/v1/reviews/:reviewId
Authorization: Bearer <jwt>
```

**Response (200 OK):**
```json
{
  "reviewId": "review_abc123",
  "status": "cancelled",
  "message": "Review has been cancelled"
}
```

---

### 3.3 Webhooks (Internal)

These endpoints receive webhooks from Git platforms.

#### GitHub Webhook

```http
POST /api/v1/webhooks/github
X-Hub-Signature-256: sha256=<signature>
X-GitHub-Event: pull_request
X-GitHub-Delivery: <delivery-id>
Content-Type: application/json

{
  "action": "opened",
  "number": 42,
  "pull_request": {
    "id": 123456789,
    "title": "Add new feature",
    "user": {
      "login": "developer"
    },
    "head": {
      "sha": "abc123"
    },
    "base": {
      "sha": "def456"
    }
  },
  "repository": {
    "id": 987654321,
    "full_name": "acme/my-repo"
  }
}
```

**Response (200 OK):**
```json
{
  "received": true,
  "reviewId": "review_abc123"
}
```

#### GitLab Webhook

```http
POST /api/v1/webhooks/gitlab
X-Gitlab-Token: <webhook-secret>
X-Gitlab-Event: Merge Request Hook
Content-Type: application/json

{
  "object_kind": "merge_request",
  "object_attributes": {
    "iid": 42,
    "title": "Add new feature",
    "action": "open"
  },
  "project": {
    "id": 123456
  }
}
```

#### Bitbucket Webhook

```http
POST /api/v1/webhooks/bitbucket
X-Hub-Signature: sha256=<signature>
X-Event-Key: pullrequest:created
Content-Type: application/json

{
  "pullrequest": {
    "id": 42,
    "title": "Add new feature"
  },
  "repository": {
    "uuid": "{uuid}"
  }
}
```

#### Azure DevOps Webhook

```http
POST /api/v1/webhooks/azure
Content-Type: application/json

{
  "eventType": "git.pullrequest.created",
  "resource": {
    "pullRequestId": 42,
    "title": "Add new feature",
    "repository": {
      "id": "repo-guid"
    }
  }
}
```

---

### 3.4 Configuration

#### Validate Configuration

```http
POST /api/v1/config/validate
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "yaml": "version: \"1.0\"\nai:\n  provider: openai\n  model: gpt-4-turbo"
}
```

**Response (200 OK):**
```json
{
  "valid": true,
  "parsed": {
    "version": "1.0",
    "ai": {
      "provider": "openai",
      "model": "gpt-4-turbo"
    }
  }
}
```

**Response (400 Bad Request):**
```json
{
  "valid": false,
  "errors": [
    {
      "path": "ai.provider",
      "message": "Invalid provider. Must be one of: openai, anthropic, gemini"
    }
  ]
}
```

---

### 3.5 AI Providers

#### List Available Providers

```http
GET /api/v1/providers
Authorization: Bearer <jwt>
```

**Response (200 OK):**
```json
{
  "providers": [
    {
      "id": "openai",
      "name": "OpenAI",
      "models": [
        {
          "id": "gpt-4-turbo",
          "name": "GPT-4 Turbo",
          "contextWindow": 128000,
          "inputCostPer1k": 0.01,
          "outputCostPer1k": 0.03
        },
        {
          "id": "gpt-4o",
          "name": "GPT-4o",
          "contextWindow": 128000,
          "inputCostPer1k": 0.005,
          "outputCostPer1k": 0.015
        }
      ]
    },
    {
      "id": "anthropic",
      "name": "Anthropic",
      "models": [
        {
          "id": "claude-3-opus",
          "name": "Claude 3 Opus",
          "contextWindow": 200000,
          "inputCostPer1k": 0.015,
          "outputCostPer1k": 0.075
        }
      ]
    }
  ]
}
```

#### Test Provider Connection

```http
POST /api/v1/providers/:provider/test
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "apiKey": "sk-your-api-key"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "provider": "openai",
  "models": ["gpt-4-turbo", "gpt-4o", "gpt-3.5-turbo"]
}
```

---

## 4. Webhooks

### 4.1 Supported Events

#### GitHub

| Event | Action | Triggers Review |
|-------|--------|-----------------|
| `pull_request` | `opened` | Yes |
| `pull_request` | `synchronize` | Yes |
| `pull_request` | `reopened` | Yes |
| `pull_request` | `ready_for_review` | Yes |
| `pull_request_review_comment` | `created` | No (logged) |

#### GitLab

| Event | Action | Triggers Review |
|-------|--------|-----------------|
| `Merge Request Hook` | `open` | Yes |
| `Merge Request Hook` | `update` | Yes |
| `Merge Request Hook` | `reopen` | Yes |

#### Bitbucket

| Event | Triggers Review |
|-------|-----------------|
| `pullrequest:created` | Yes |
| `pullrequest:updated` | Yes |

#### Azure DevOps

| Event | Triggers Review |
|-------|-----------------|
| `git.pullrequest.created` | Yes |
| `git.pullrequest.updated` | Yes |

### 4.2 Webhook Security

All webhooks are validated using platform-specific signature verification:

- **GitHub**: HMAC-SHA256 signature in `X-Hub-Signature-256`
- **GitLab**: Secret token in `X-Gitlab-Token`
- **Bitbucket**: HMAC-SHA256 signature in `X-Hub-Signature`
- **Azure DevOps**: Basic auth or service hooks authentication

---

## 5. Error Handling

### 5.1 Error Response Format

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

### 5.2 Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `AI_PROVIDER_ERROR` | 502 | AI provider unavailable |
| `WEBHOOK_INVALID` | 400 | Invalid webhook signature |

### 5.3 Validation Errors

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "errors": [
        {
          "field": "email",
          "message": "Invalid email format"
        },
        {
          "field": "password",
          "message": "Password must be at least 8 characters"
        }
      ]
    }
  }
}
```

---

## 6. Rate Limiting

### 6.1 Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Authentication | 10 requests | 1 minute |
| API (authenticated) | 100 requests | 1 minute |
| Webhooks | 1000 requests | 1 minute |
| Review generation | 10 requests | 1 minute |

### 6.2 Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705312860
```

### 6.3 Rate Limit Response

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 30

{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please retry after 30 seconds.",
    "details": {
      "retryAfter": 30
    }
  }
}
```

---

## Appendix A: Type Definitions

### Repository

```typescript
interface Repository {
  id: number;
  name: string;
  fullName: string;
  platform: 'github' | 'gitlab' | 'bitbucket' | 'azure';
  externalId: string;
  defaultBranch: string;
  isActive: boolean;
  settings: RepositorySettings;
  organization: Organization;
  createdAt: string;
  updatedAt: string;
}

interface RepositorySettings {
  autoReview?: boolean;
  defaultProvider?: string;
  defaultModel?: string;
}
```

### Review

```typescript
interface Review {
  id: number;
  prNumber: number;
  prTitle: string;
  prUrl: string;
  prAuthor: string;
  headSha: string;
  baseSha: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  aiProvider: string;
  model: string;
  tokensUsed: number;
  processingTime: number;
  errorMessage?: string;
  metadata: Record<string, unknown>;
  comments: ReviewComment[];
  repository: Repository;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
```

### ReviewComment

```typescript
interface ReviewComment {
  id: number;
  filePath: string;
  lineStart?: number;
  lineEnd?: number;
  content: string;
  severity: 'info' | 'suggestion' | 'warning' | 'error';
  category?: string;
  externalId?: string;
  isPosted: boolean;
  createdAt: string;
}
```

### Configuration

```typescript
interface ReviewConfig {
  version: string;
  ai: {
    provider: 'openai' | 'anthropic' | 'gemini';
    model: string;
    temperature?: number;
    maxTokens?: number;
  };
  review: {
    autoReview: boolean;
    reviewOn: ('pull_request' | 'push')[];
  };
  filters: {
    paths: {
      include?: string[];
      exclude?: string[];
    };
    fileTypes?: string[];
  };
  guidelines?: string[];
}
```

---

## Appendix B: SDK Examples

### JavaScript/TypeScript

```typescript
import { CodeReviewClient } from '@codereview-ai/sdk';

const client = new CodeReviewClient({
  baseUrl: 'https://api.yourdomain.com',
  token: 'your-jwt-token',
});

// List repositories
const repos = await client.repositories.list({
  filters: { platform: 'github' },
});

// Trigger review
const review = await client.reviews.create({
  repositoryId: 1,
  pullRequestNumber: 42,
});

// Get review status
const status = await client.reviews.getStatus(review.reviewId);
```

### cURL Examples

```bash
# Login
curl -X POST https://api.yourdomain.com/api/auth/local \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user@example.com","password":"password"}'

# List repositories
curl https://api.yourdomain.com/api/repositories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Trigger review
curl -X POST https://engine.yourdomain.com/api/v1/reviews \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"repositoryId":1,"pullRequestNumber":42}'
```
