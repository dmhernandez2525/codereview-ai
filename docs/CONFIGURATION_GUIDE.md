# Configuration Guide

## CodeReview AI - Complete Configuration Reference

This guide covers all configuration options for CodeReview AI.

---

## Table of Contents

1. [Repository Configuration](#1-repository-configuration)
2. [Environment Variables](#2-environment-variables)
3. [AI Provider Settings](#3-ai-provider-settings)
4. [Git Platform Setup](#4-git-platform-setup)
5. [Review Profiles](#5-review-profiles)
6. [Advanced Configuration](#6-advanced-configuration)

---

## 1. Repository Configuration

### 1.1 Overview

Configure CodeReview AI at the repository level using a `.codereview.yaml` file
in your repository root.

### 1.2 Basic Configuration

```yaml
# .codereview.yaml
version: '1.0'

# AI Provider Settings
ai:
  provider: openai # openai, anthropic, gemini
  model: gpt-4-turbo # Provider-specific model
  temperature: 0.3 # 0.0-1.0, lower = more focused
  maxTokens: 4096 # Maximum response tokens

# Review Behavior
review:
  autoReview: true # Automatically review new PRs
  reviewOn: # Trigger events
    - pull_request
  skipDraft: true # Skip draft PRs
  skipWIP: true # Skip WIP PRs (title contains WIP)

# File Filters
filters:
  paths:
    include:
      - 'src/**'
      - 'lib/**'
    exclude:
      - '**/*.test.ts'
      - '**/*.spec.ts'
      - '**/node_modules/**'
      - '**/dist/**'
      - '**/*.lock'
```

### 1.3 Complete Configuration Reference

```yaml
version: '1.0'

# ============================================================================
# AI Configuration
# ============================================================================
ai:
  # Provider selection (required)
  provider: openai # openai | anthropic | gemini

  # Model selection (required)
  model: gpt-4-turbo

  # Temperature for response creativity (optional)
  # Lower = more focused/deterministic, Higher = more creative
  temperature: 0.3 # 0.0 - 1.0, default: 0.3

  # Maximum tokens in response (optional)
  maxTokens: 4096 # default: 4096

  # System prompt additions (optional)
  systemPrompt: |
    Additional instructions for the AI reviewer.
    These are appended to the default system prompt.

# ============================================================================
# Review Behavior
# ============================================================================
review:
  # Automatically review new PRs (optional)
  autoReview: true # default: true

  # Events that trigger reviews (optional)
  reviewOn:
    - pull_request # On PR open/update
    # - push          # On push to branch (future)

  # Skip conditions (optional)
  skipDraft: true # Skip draft PRs, default: true
  skipWIP: true # Skip PRs with WIP in title, default: true

  # Comment behavior (optional)
  commentStyle: inline # inline | summary | both, default: inline
  maxComments: 50 # Maximum comments per review, default: 50
  minSeverity:
    suggestion # Only post comments >= this severity
    # info | suggestion | warning | error

  # Summary options (optional)
  summary:
    enabled: true # Generate summary comment, default: true
    position: top # top | bottom, default: top

# ============================================================================
# File Filters
# ============================================================================
filters:
  # Path patterns (glob syntax)
  paths:
    # Files/directories to include (optional)
    # If not specified, all files are included
    include:
      - 'src/**'
      - 'lib/**'
      - 'app/**'

    # Files/directories to exclude (optional)
    exclude:
      - '**/*.test.ts'
      - '**/*.test.tsx'
      - '**/*.spec.ts'
      - '**/*.spec.tsx'
      - '**/__tests__/**'
      - '**/__mocks__/**'
      - '**/node_modules/**'
      - '**/dist/**'
      - '**/build/**'
      - '**/.next/**'
      - '**/coverage/**'
      - '**/*.lock'
      - '**/package-lock.json'
      - '**/yarn.lock'
      - '**/pnpm-lock.yaml'
      - '**/*.min.js'
      - '**/*.min.css'
      - '**/*.map'

  # File size limits (optional)
  maxFileSize: 100000 # Skip files larger than 100KB
  maxDiffSize: 500000 # Skip diffs larger than 500KB

  # File types (optional, uses extension)
  fileTypes:
    include:
      - ts
      - tsx
      - js
      - jsx
      - py
      - go
      - rs
    # exclude takes precedence over include
    exclude:
      - json
      - yaml
      - md

# ============================================================================
# Guidelines
# ============================================================================
guidelines:
  # Custom review guidelines (optional)
  # These are included in the AI prompt
  custom:
    - 'Follow TypeScript best practices'
    - 'Ensure proper error handling with try/catch'
    - 'Use meaningful variable names'
    - 'Add JSDoc comments for public functions'
    - 'Avoid any type, use proper typing'

  # Enable/disable built-in guideline categories (optional)
  categories:
    security: true # Security vulnerabilities
    performance: true # Performance issues
    bestPractices: true # Language best practices
    codeStyle: false # Style issues (use linter instead)
    documentation: true # Documentation/comments
    testing: false # Test coverage suggestions

# ============================================================================
# Path-Specific Configuration
# ============================================================================
paths:
  # Override settings for specific paths
  'src/api/**':
    guidelines:
      custom:
        - 'Validate all input parameters'
        - 'Return appropriate HTTP status codes'
        - 'Log all errors with context'
    ai:
      temperature: 0.2 # More conservative for API code

  'src/components/**':
    guidelines:
      custom:
        - 'Ensure accessibility (a11y) compliance'
        - 'Use semantic HTML elements'
        - 'Avoid inline styles, use CSS classes'

  '**/*.test.ts':
    # Skip review for test files (already excluded, but explicit)
    skip: true

# ============================================================================
# Notifications (Optional)
# ============================================================================
notifications:
  # Slack integration
  slack:
    enabled: false
    webhook: '${SLACK_WEBHOOK_URL}'
    channel: '#code-reviews'
    onComplete: true
    onError: true

  # Email notifications
  email:
    enabled: false
    recipients:
      - 'team@example.com'
    onError: true

# ============================================================================
# Labels (Optional)
# ============================================================================
labels:
  # Add labels based on review results
  enabled: true
  # Add label when no issues found
  approved: 'ai-approved'
  # Add label when issues found
  needsWork: 'ai-needs-work'
  # Severity thresholds for labels
  thresholds:
    approved: 0 # Max issues for approved label
    needsWork: 3 # Min issues for needs-work label
```

### 1.4 Minimal Configuration

For quick setup, use minimal configuration:

```yaml
version: '1.0'
ai:
  provider: openai
  model: gpt-4-turbo
```

All other settings use sensible defaults.

---

## 2. Environment Variables

### 2.1 Required Variables

```bash
# Database
POSTGRES_USER=codereview
POSTGRES_PASSWORD=secure_password
POSTGRES_DB=codereview

# Strapi Secrets
APP_KEYS=key1,key2,key3,key4          # Generate with: openssl rand -base64 32
API_TOKEN_SALT=generated_salt          # Generate with: openssl rand -base64 32
ADMIN_JWT_SECRET=generated_secret      # Generate with: openssl rand -base64 32
TRANSFER_TOKEN_SALT=generated_salt     # Generate with: openssl rand -base64 32
JWT_SECRET=generated_secret            # Generate with: openssl rand -base64 32

# Encryption (for stored API keys)
ENCRYPTION_KEY=32_byte_key             # Generate with: openssl rand -base64 32
```

### 2.2 AI Provider Keys

```bash
# At least one required
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...
```

### 2.3 Git Platform Integration

```bash
# GitHub
GITHUB_APP_ID=123456
GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
GITHUB_WEBHOOK_SECRET=webhook_secret
GITHUB_CLIENT_ID=oauth_client_id
GITHUB_CLIENT_SECRET=oauth_client_secret

# GitLab
GITLAB_WEBHOOK_SECRET=webhook_secret
GITLAB_APPLICATION_ID=app_id
GITLAB_APPLICATION_SECRET=app_secret

# Bitbucket
BITBUCKET_WEBHOOK_SECRET=webhook_secret
BITBUCKET_CLIENT_ID=client_id
BITBUCKET_CLIENT_SECRET=client_secret

# Azure DevOps
AZURE_DEVOPS_WEBHOOK_SECRET=webhook_secret
AZURE_DEVOPS_CLIENT_ID=client_id
AZURE_DEVOPS_CLIENT_SECRET=client_secret
```

### 2.4 Service URLs

```bash
# Internal (container-to-container)
STRAPI_URL=http://server:1337
MICROSERVICE_URL=http://microservice:4000

# Public (browser access)
NEXT_PUBLIC_STRAPI_URL=https://api.yourdomain.com
NEXT_PUBLIC_MICROSERVICE_URL=https://engine.yourdomain.com
PUBLIC_CLIENT_URL=https://yourdomain.com
```

### 2.5 Redis Configuration

```bash
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_password  # Production only
```

### 2.6 Optional Settings

```bash
# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000      # 1 minute window
RATE_LIMIT_MAX_REQUESTS=100     # Max requests per window

# Logging
LOG_LEVEL=info                  # debug, info, warn, error
LOG_FORMAT=json                 # json, text

# Feature Flags
ENABLE_GITLAB_INTEGRATION=false
ENABLE_BITBUCKET_INTEGRATION=false
ENABLE_AZURE_DEVOPS_INTEGRATION=false
```

---

## 3. AI Provider Settings

### 3.1 OpenAI

```yaml
ai:
  provider: openai
  model: gpt-4-turbo # or gpt-4o, gpt-3.5-turbo
  temperature: 0.3
  maxTokens: 4096
```

**Available Models:**

| Model           | Context Window | Best For                         |
| --------------- | -------------- | -------------------------------- |
| `gpt-4-turbo`   | 128K           | Complex reviews, large diffs     |
| `gpt-4o`        | 128K           | Balanced cost/quality            |
| `gpt-3.5-turbo` | 16K            | Budget-conscious, simple reviews |

### 3.2 Anthropic (Claude)

```yaml
ai:
  provider: anthropic
  model: claude-3-sonnet # or claude-3-opus, claude-3-haiku
  temperature: 0.3
  maxTokens: 4096
```

**Available Models:**

| Model             | Context Window | Best For                      |
| ----------------- | -------------- | ----------------------------- |
| `claude-3-opus`   | 200K           | Highest quality, complex code |
| `claude-3-sonnet` | 200K           | Balanced quality/speed        |
| `claude-3-haiku`  | 200K           | Fast, cost-effective          |

### 3.3 Google Gemini

```yaml
ai:
  provider: gemini
  model: gemini-1.5-pro # or gemini-1.5-flash
  temperature: 0.3
  maxTokens: 4096
```

**Available Models:**

| Model              | Context Window | Best For             |
| ------------------ | -------------- | -------------------- |
| `gemini-1.5-pro`   | 1M             | Very large codebases |
| `gemini-1.5-flash` | 1M             | Fast, cost-effective |

---

## 4. Git Platform Setup

### 4.1 GitHub App Setup

1. Go to GitHub Settings → Developer settings → GitHub Apps
2. Click "New GitHub App"
3. Configure:
   - **Name**: CodeReview AI
   - **Homepage URL**: https://yourdomain.com
   - **Webhook URL**: https://engine.yourdomain.com/api/v1/webhooks/github
   - **Webhook Secret**: Generate and save
   - **Permissions**:
     - Repository: Contents (Read), Pull requests (Read & Write)
     - Subscribe to: Pull request, Pull request review comment

4. Generate private key and download
5. Install app on repositories

### 4.2 GitLab Integration

1. Go to GitLab → Settings → Webhooks
2. Configure:
   - **URL**: https://engine.yourdomain.com/api/v1/webhooks/gitlab
   - **Secret Token**: Generate and save
   - **Trigger**: Merge request events

For OAuth (user authentication):

1. Go to GitLab → Settings → Applications
2. Create application with `read_user`, `read_api` scopes

### 4.3 Bitbucket Integration

1. Go to Repository Settings → Webhooks
2. Create webhook:
   - **URL**: https://engine.yourdomain.com/api/v1/webhooks/bitbucket
   - **Triggers**: Pull Request Created, Updated

For OAuth:

1. Go to Bitbucket Settings → OAuth consumers
2. Create consumer with appropriate permissions

### 4.4 Azure DevOps Integration

1. Go to Project Settings → Service Hooks
2. Create subscription:
   - **Service**: Web Hooks
   - **Event**: Pull request created/updated
   - **URL**: https://engine.yourdomain.com/api/v1/webhooks/azure

---

## 5. Review Profiles

### 5.1 Strict Profile

For critical codebases:

```yaml
version: '1.0'
ai:
  provider: anthropic
  model: claude-3-opus
  temperature: 0.2

review:
  autoReview: true
  minSeverity: info
  maxComments: 100

guidelines:
  categories:
    security: true
    performance: true
    bestPractices: true
    documentation: true
    testing: true
```

### 5.2 Balanced Profile

For general development:

```yaml
version: '1.0'
ai:
  provider: openai
  model: gpt-4-turbo
  temperature: 0.3

review:
  autoReview: true
  minSeverity: suggestion
  maxComments: 50

guidelines:
  categories:
    security: true
    performance: true
    bestPractices: true
    documentation: false
    testing: false
```

### 5.3 Light Profile

For less critical code:

```yaml
version: '1.0'
ai:
  provider: openai
  model: gpt-3.5-turbo
  temperature: 0.4

review:
  autoReview: true
  minSeverity: warning
  maxComments: 20

guidelines:
  categories:
    security: true
    performance: false
    bestPractices: true
    documentation: false
    testing: false
```

---

## 6. Advanced Configuration

### 6.1 Multi-Language Support

```yaml
paths:
  '**/*.py':
    guidelines:
      custom:
        - 'Follow PEP 8 style guide'
        - 'Use type hints'
        - 'Document functions with docstrings'

  '**/*.go':
    guidelines:
      custom:
        - 'Follow Go conventions (gofmt)'
        - 'Handle errors explicitly'
        - 'Use meaningful package names'

  '**/*.rs':
    guidelines:
      custom:
        - 'Follow Rust idioms'
        - 'Use Result/Option appropriately'
        - 'Avoid unwrap in production code'
```

### 6.2 Team-Specific Configuration

Use path-based overrides for different teams:

```yaml
paths:
  'services/payments/**':
    ai:
      temperature: 0.1 # Very conservative
    guidelines:
      custom:
        - 'Security is paramount - flag any potential vulnerabilities'
        - 'All changes must have corresponding tests'
        - 'Use prepared statements for all DB queries'

  'services/frontend/**':
    guidelines:
      custom:
        - 'Ensure responsive design'
        - 'Check for accessibility issues'
        - 'Avoid prop drilling - use context or state management'
```

### 6.3 Monorepo Configuration

For monorepos, use root config with path overrides:

```yaml
version: '1.0'

# Global settings
ai:
  provider: openai
  model: gpt-4-turbo

# Package-specific settings
paths:
  'packages/api/**':
    ai:
      model: claude-3-opus # More thorough for backend
    guidelines:
      custom:
        - 'Validate all inputs'
        - 'Return appropriate status codes'

  'packages/web/**':
    guidelines:
      custom:
        - 'Use semantic HTML'
        - 'Ensure a11y compliance'

  'packages/shared/**':
    guidelines:
      custom:
        - 'Maintain backward compatibility'
        - 'Document all exports'
```

### 6.4 Custom System Prompts

Override or extend the default AI prompt:

```yaml
ai:
  provider: openai
  model: gpt-4-turbo
  systemPrompt: |
    You are reviewing code for a fintech company.
    Security is the top priority.

    Special considerations:
    - Flag any hardcoded credentials immediately
    - Check for SQL injection vulnerabilities
    - Verify input validation on all endpoints
    - Ensure PCI-DSS compliance for payment code

    Format your responses with clear severity levels.
```

### 6.5 Conditional Reviews

Skip reviews based on conditions:

```yaml
review:
  autoReview: true
  skipDraft: true
  skipWIP: true

  # Skip if PR author is a bot
  skipAuthors:
    - dependabot[bot]
    - renovate[bot]

  # Skip if title matches pattern
  skipPatterns:
    - "^\\[skip ci\\]"
    - "^\\[no review\\]"
    - '^chore:'

  # Only review specific branches
  branches:
    include:
      - main
      - develop
      - 'feature/*'
    exclude:
      - 'dependabot/*'
```

---

## Appendix A: Configuration Schema

Complete JSON Schema for validation:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["version", "ai"],
  "properties": {
    "version": {
      "type": "string",
      "enum": ["1.0"]
    },
    "ai": {
      "type": "object",
      "required": ["provider", "model"],
      "properties": {
        "provider": {
          "type": "string",
          "enum": ["openai", "anthropic", "gemini"]
        },
        "model": { "type": "string" },
        "temperature": {
          "type": "number",
          "minimum": 0,
          "maximum": 1
        },
        "maxTokens": {
          "type": "integer",
          "minimum": 100,
          "maximum": 100000
        }
      }
    },
    "review": {
      "type": "object",
      "properties": {
        "autoReview": { "type": "boolean" },
        "skipDraft": { "type": "boolean" },
        "skipWIP": { "type": "boolean" },
        "minSeverity": {
          "type": "string",
          "enum": ["info", "suggestion", "warning", "error"]
        },
        "maxComments": { "type": "integer" }
      }
    },
    "filters": {
      "type": "object",
      "properties": {
        "paths": {
          "type": "object",
          "properties": {
            "include": { "type": "array", "items": { "type": "string" } },
            "exclude": { "type": "array", "items": { "type": "string" } }
          }
        }
      }
    }
  }
}
```

## Appendix B: Default Values

| Setting                  | Default    |
| ------------------------ | ---------- |
| `ai.temperature`         | 0.3        |
| `ai.maxTokens`           | 4096       |
| `review.autoReview`      | true       |
| `review.skipDraft`       | true       |
| `review.skipWIP`         | true       |
| `review.commentStyle`    | inline     |
| `review.maxComments`     | 50         |
| `review.minSeverity`     | suggestion |
| `review.summary.enabled` | true       |
| `filters.maxFileSize`    | 100000     |
| `filters.maxDiffSize`    | 500000     |
