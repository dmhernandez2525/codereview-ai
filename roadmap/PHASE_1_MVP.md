# Phase 1: MVP Implementation

## Overview

Phase 1 focuses on delivering a Minimum Viable Product with core functionality:

- GitHub integration only
- OpenAI as the primary AI provider
- Basic dashboard and configuration
- **BYOK (Bring Your Own Key) support from day 1** (key differentiator)
- **Zero-retention architecture** (security-first)
- **Marketing website foundation**

**Timeline**: 4-6 weeks **Goal**: Functional code review platform for GitHub
repositories with enterprise-ready security

---

## Key Differentiators (Built into MVP)

These features differentiate us from competitors from launch:

| Feature                 | Why It Matters                   | Competitor Gap                             |
| ----------------------- | -------------------------------- | ------------------------------------------ |
| **BYOK from day 1**     | 67% cost savings for users       | Most only offer at enterprise tier         |
| **Zero-retention**      | Code never stored after review   | Trust/security requirement                 |
| **Transparent pricing** | Published enterprise pricing     | Universal frustration with "contact sales" |
| **Low false positives** | Target <30% (vs industry 60-80%) | #1 user complaint across all tools         |

---

## Milestones

### Milestone 1: Project Initialization

**Status**: Complete

- [x] Project structure created
- [x] Documentation foundation
- [x] Configuration files (ESLint, Prettier, TypeScript)
- [x] Docker Compose setup
- [x] CI/CD pipeline
- [x] Initialize Client (Next.js)
- [x] Initialize Server (Strapi)
- [x] Initialize Microservice (Express)

### Milestone 2: Server (Strapi) Setup

**Status**: In Progress

- [x] Install Strapi 5
- [x] Configure PostgreSQL connection
- [ ] Create content types:
  - [ ] Organization
  - [ ] Repository
  - [ ] Review
  - [ ] ReviewComment
  - [ ] ApiKey
  - [ ] Configuration
  - [ ] UsageLog
- [ ] Configure user permissions
- [ ] Set up JWT authentication
- [ ] Create API tokens for microservice
- [ ] Add custom controllers:
  - [ ] Repository connection flow
  - [ ] Usage analytics
  - [ ] API key management

### Milestone 3: Microservice Setup

**Status**: Not Started

- [ ] Express app initialization
- [ ] TypeScript configuration
- [ ] Middleware setup:
  - [ ] Authentication
  - [ ] Rate limiting
  - [ ] Error handling
  - [ ] Request validation
- [ ] Health check endpoints
- [ ] Strapi client integration
- [ ] Redis connection (Bull queue)

### Milestone 4: GitHub Integration

**Status**: Not Started

- [ ] GitHub App creation guide
- [ ] Webhook handler:
  - [ ] Signature verification
  - [ ] Event parsing
  - [ ] PR event handling
- [ ] GitHub API client:
  - [ ] Get PR diff
  - [ ] Get file contents
  - [ ] Post review comments
  - [ ] Get repository config
- [ ] OAuth flow for user connection

### Milestone 5: AI Review Engine

**Status**: Not Started

- [ ] OpenAI provider:
  - [ ] Client initialization
  - [ ] Review generation with streaming responses
  - [ ] Token counting and cost calculation
  - [ ] Error handling
  - [ ] Rate limit handling with exponential backoff
- [ ] **BYOK (Bring Your Own Key) support:**
  - [ ] Encrypted API key storage (AES-256)
  - [ ] Key validation endpoint
  - [ ] Multi-provider key support (OpenAI, future: Anthropic, Gemini)
  - [ ] User-level vs organization-level keys
- [ ] Diff processing:
  - [ ] Parse unified diff format
  - [ ] Split into files with metadata
  - [ ] Filter by config (.codereview.yaml)
  - [ ] Intelligent chunking for context window
  - [ ] Handle large PRs (100+ files) with batching
- [ ] Review generation:
  - [ ] System prompt with customization
  - [ ] Code context inclusion (file + surrounding)
  - [ ] Comment formatting (markdown, code blocks)
  - [ ] Severity classification (critical, major, minor, info)
  - [ ] Category tagging (bug, security, performance, style, suggestion, praise)
- [ ] **Automated code review checklist:**
  - [ ] Forbidden patterns detection (any, @ts-ignore, console.log)
  - [ ] TypeScript quality checks (explicit return types, no implicit any)
  - [ ] Security checks (SQL injection, XSS, secrets detection)
  - [ ] Configurable rule severity
- [ ] Job queue:
  - [ ] Review job processor with Bull
  - [ ] Retry logic with dead letter queue
  - [ ] Progress tracking with SSE updates
  - [ ] Job cancellation support
- [ ] **Cost estimation:**
  - [ ] Pre-review cost estimate endpoint
  - [ ] Actual cost tracking per review
  - [ ] Usage dashboard data collection

### Milestone 6: Configuration System

**Status**: Not Started

- [ ] **YAML parser (.codereview.yaml):**
  - [ ] Parse and validate YAML structure
  - [ ] JSON Schema for validation
  - [ ] Error reporting with line numbers
- [ ] **Configuration options:**
  - [ ] `language`: Review comment language
  - [ ] `reviews.profile`: thorough, balanced, quick
  - [ ] `reviews.auto_review`: enabled, drafts
  - [ ] `reviews.summary`: Generate high-level summary
  - [ ] `reviews.request_changes`: Request changes vs comment
  - [ ] `ai.provider`: openai (Phase 1), anthropic, gemini (Phase 2)
  - [ ] `ai.model`: Model selection
  - [ ] `ai.temperature`: 0-1 for determinism
  - [ ] `ai.max_tokens_per_file`: Token limit per file
- [ ] **Path filtering:**
  - [ ] `path_filters`: Include/exclude patterns
  - [ ] Glob pattern support (\*_, _, !)
  - [ ] Default exclusions (node_modules, dist, lock files)
- [ ] **Path-specific instructions:**
  - [ ] `path_instructions`: Per-path review focus
  - [ ] Pattern matching (\*.tsx, **/api/**, etc.)
  - [ ] Custom instructions per path type
- [ ] **Custom guidelines:**
  - [ ] `guidelines`: Array of custom review rules
  - [ ] Reference to external docs
  - [ ] Natural language rule definition
- [ ] **Config inheritance:**
  - [ ] Repository config overrides org defaults
  - [ ] PR-level config (via comments) overrides repo
  - [ ] Environment-specific configs
- [ ] **Config caching:**
  - [ ] Redis cache with TTL
  - [ ] Invalidation on push to default branch
  - [ ] Fallback to defaults on error
- [ ] **Config validation endpoint:**
  - [ ] Validate config without review
  - [ ] Preview effective configuration

### Milestone 7: Client Dashboard

**Status**: Not Started

- [ ] Next.js 14 setup with App Router
- [ ] **UI Component Library (shadcn/ui):**
  - [ ] Button, Input, Form components
  - [ ] Card, Table, Dialog components
  - [ ] Toast notifications
  - [ ] Loading skeletons
- [ ] Authentication pages:
  - [ ] Login page with OAuth options
  - [ ] Register page with email verification
  - [ ] Forgot password flow
  - [ ] OAuth callback handler (GitHub)
  - [ ] Auth context/provider with JWT
- [ ] Dashboard layout:
  - [ ] Sidebar navigation with icons
  - [ ] Header with user menu
  - [ ] Breadcrumb navigation
  - [ ] Responsive design (mobile-first)
- [ ] **Key Dashboard Components:**
  - [ ] `RepositoryList` - repository cards with status
  - [ ] `ReviewViewer` - full review display
  - [ ] `DiffViewer` - Monaco-based diff view with comments
  - [ ] `CommentThread` - threaded comment display
  - [ ] `CostTracker` - usage and cost display
  - [ ] `AnalyticsCharts` - review trends (Recharts)
- [ ] Core pages:
  - [ ] Dashboard home (overview with stats)
  - [ ] Repositories list with filters
  - [ ] Repository detail with recent reviews
  - [ ] Reviews list with status filters
  - [ ] Review detail with inline comments
  - [ ] Settings (profile, API keys, config)
- [ ] **State Management (Redux Toolkit):**
  - [ ] Auth slice (user, tokens)
  - [ ] Repositories slice
  - [ ] Reviews slice
  - [ ] Settings slice

### Milestone 7b: Marketing Website

**Status**: Not Started

- [ ] **Landing Page (/):**
  - [ ] Hero section with demo/animation
  - [ ] Key features (3-4 blocks)
  - [ ] How it works (3 steps)
  - [ ] Pricing preview
  - [ ] CTA: "Start Free Trial"
- [ ] **Features Page (/features):**
  - [ ] AI-powered reviews detail
  - [ ] Multi-platform support
  - [ ] BYOK explanation
  - [ ] Self-hosting option
  - [ ] Configuration flexibility
  - [ ] Cost transparency
- [ ] **Pricing Page (/pricing):**
  - [ ] Free tier details
  - [ ] BYOK tier ($10/dev/mo)
  - [ ] Pro tier ($15/dev/mo)
  - [ ] Team tier ($24/dev/mo)
  - [ ] Enterprise tier ($35+/dev/mo)
  - [ ] Feature comparison table
  - [ ] FAQ section
- [ ] **Documentation (/docs):**
  - [ ] Getting Started guide
  - [ ] Configuration Reference (.codereview.yaml)
  - [ ] API Documentation
  - [ ] GitHub App Setup
  - [ ] Self-Hosting Guide (basic)
- [ ] **Legal Pages:**
  - [ ] Privacy Policy (/privacy)
  - [ ] Terms of Service (/terms)
  - [ ] Security (/security)

### Milestone 8: Repository Management

**Status**: Not Started

- [ ] Connect repository flow
- [ ] Webhook registration
- [ ] Repository settings
- [ ] Enable/disable reviews
- [ ] Delete repository

### Milestone 9: Review Display

**Status**: Not Started

- [ ] Review list view:
  - [ ] Paginated list with filters (status, repo, date)
  - [ ] Review cards with summary, status, cost
  - [ ] Sort by date, status, comment count
- [ ] Review detail view:
  - [ ] PR summary section
  - [ ] Review metadata (model, tokens, cost, duration)
  - [ ] Comment statistics (by severity, category)
- [ ] **DiffViewer component (Monaco Editor):**
  - [ ] Unified diff display
  - [ ] Side-by-side diff option
  - [ ] Inline comment markers
  - [ ] Syntax highlighting
  - [ ] File tree navigation
- [ ] **CommentThread component:**
  - [ ] Threaded comment display
  - [ ] Severity badges (critical, major, minor, info)
  - [ ] Category tags (bug, security, performance, style)
  - [ ] Code snippet with line reference
  - [ ] Suggested fix display
- [ ] **Streaming review updates:**
  - [ ] SSE connection for live updates
  - [ ] Progress indicator during generation
  - [ ] Real-time comment appearance
- [ ] Status indicators:
  - [ ] Pending, In Progress, Completed, Failed
  - [ ] Webhook status on repository
- [ ] Filter and search:
  - [ ] Full-text search
  - [ ] Filter by severity
  - [ ] Filter by category
  - [ ] Filter by file path

### Milestone 10: Settings & API Keys

**Status**: Not Started

- [ ] User profile settings
- [ ] API key management:
  - [ ] Add API key
  - [ ] Validate key
  - [ ] Delete key
  - [ ] Key hint display
- [ ] Organization settings

### Milestone 11: Security Architecture

**Status**: Not Started

- [ ] **Zero-retention architecture:**
  - [ ] Code processed in memory only
  - [ ] No code storage after review completion
  - [ ] Audit log without code content
- [ ] **Sandboxed analysis:**
  - [ ] Isolated review environments
  - [ ] No cross-tenant data access
  - [ ] Resource limits per review
- [ ] **API key security:**
  - [ ] AES-256 encryption at rest
  - [ ] Key hint storage (last 4 chars only)
  - [ ] Key rotation support
- [ ] **Data handling:**
  - [ ] TLS 1.2+ in transit
  - [ ] No model training on customer code
  - [ ] Data residency documentation
- [ ] **Authentication security:**
  - [ ] JWT with short expiry
  - [ ] Refresh token rotation
  - [ ] Session management

### Milestone 12: Testing

**Status**: Not Started

- [ ] **Testing framework setup (Vitest):**
  - [ ] vitest.config.ts with coverage thresholds
  - [ ] Test utilities and custom matchers
  - [ ] MSW for API mocking
  - [ ] Test fixtures factory (faker.js)
- [ ] Unit tests:
  - [ ] Microservice services (diff parser, AI router, cost calculator)
  - [ ] Client components (render tests)
  - [ ] Utility functions
  - [ ] Provider implementations
- [ ] Integration tests:
  - [ ] API endpoints (Supertest)
  - [ ] Webhook processing flow
  - [ ] Review generation pipeline
  - [ ] Authentication flows
- [ ] **E2E tests (Playwright):**
  - [ ] Auth flows (login, register, OAuth)
  - [ ] Repository connection flow
  - [ ] Review viewing and navigation
  - [ ] Settings management
- [ ] **Coverage requirements:**
  - [ ] 80% line coverage
  - [ ] 80% branch coverage
  - [ ] Critical paths 100% covered

### Milestone 13: Documentation & Polish

**Status**: Not Started

- [ ] **User documentation:**
  - [ ] Getting started tutorial
  - [ ] GitHub App installation guide
  - [ ] Configuration reference (.codereview.yaml)
  - [ ] Troubleshooting guide
- [ ] **API documentation:**
  - [ ] OpenAPI/Swagger spec
  - [ ] Request/response examples
  - [ ] Error codes reference
  - [ ] Rate limits documentation
- [ ] **UI polish:**
  - [ ] Error messages (user-friendly, actionable)
  - [ ] Loading states (skeletons, spinners)
  - [ ] Empty states (helpful guidance)
  - [ ] Success/confirmation states
- [ ] **Responsive testing:**
  - [ ] Mobile viewport (320px+)
  - [ ] Tablet viewport (768px+)
  - [ ] Desktop viewport (1024px+)
- [ ] **Performance optimization:**
  - [ ] Bundle size analysis
  - [ ] Image optimization
  - [ ] API response caching
  - [ ] Lighthouse score >90

---

## Technical Specifications

### Technology Stack (Phase 1)

| Component    | Technology                                  |
| ------------ | ------------------------------------------- |
| Client       | Next.js 14, TypeScript, Tailwind, shadcn/ui |
| Server       | Strapi 5, PostgreSQL                        |
| Microservice | Express, TypeScript, Bull                   |
| AI           | OpenAI GPT-4 Turbo                          |
| Platform     | GitHub only                                 |

### Database Schema (Phase 1)

See
[SOFTWARE_DESIGN_DOCUMENT.md](../docs/SOFTWARE_DESIGN_DOCUMENT.md#4-database-schema)

### API Endpoints (Phase 1)

**Server (Strapi)**:

- Authentication: `/api/auth/*`
- Organizations: `/api/organizations`
- Repositories: `/api/repositories`
- Reviews: `/api/reviews`
- API Keys: `/api/api-keys`

**Microservice**:

- Health: `/api/v1/health`
- Webhooks: `/api/v1/webhooks/github`
- Reviews: `/api/v1/reviews`

---

## Acceptance Criteria

### Core Functionality

1. **User can sign up and log in**
   - Email/password registration
   - JWT-based authentication
   - Password reset flow

2. **User can connect GitHub repositories**
   - OAuth connection to GitHub
   - Repository selection
   - Automatic webhook setup

3. **PRs are automatically reviewed**
   - Webhook receives PR events
   - AI generates review comments
   - Comments posted to GitHub

4. **User can view reviews in dashboard**
   - List of all reviews
   - Review detail with comments
   - Filter by repository/status

5. **User can configure reviews**
   - `.codereview.yaml` in repository
   - Basic path filtering
   - AI model selection

6. **User can manage API keys**
   - Add OpenAI API key
   - Key validation
   - Secure storage

### Non-Functional Requirements

1. **Performance**
   - API response < 200ms (P95)
   - Review generation < 60s

2. **Reliability**
   - Webhook retry on failure
   - Graceful error handling

3. **Security**
   - Encrypted API keys
   - Webhook signature verification
   - Input validation

---

## Risk Assessment

| Risk               | Impact | Mitigation                       |
| ------------------ | ------ | -------------------------------- |
| OpenAI rate limits | High   | Implement queuing, retry logic   |
| GitHub API limits  | Medium | Cache responses, optimize calls  |
| Large diffs        | Medium | Chunk processing, file filtering |
| Webhook delivery   | Medium | Idempotent processing, retries   |

---

## Dependencies

- GitHub account for App creation
- OpenAI API access
- PostgreSQL 15+
- Redis 7+
- Node.js 20+

---

## Definition of Done

Phase 1 is complete when:

1. All milestones are checked off
2. Core user flows work end-to-end
3. Tests pass with >80% coverage
4. Documentation is complete
5. Docker deployment works
6. No critical bugs open

---

## Next Steps (After Phase 1)

- Add Anthropic and Gemini support (Phase 2)
- Add GitLab integration (Phase 2)
- Add usage analytics dashboard
- Implement organization management
