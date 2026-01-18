# Phase 2: Multi-Platform Integrations

## Overview

Phase 2 expands CodeReview AI with additional AI providers and Git platform integrations.

**Timeline**: 4-6 weeks (after Phase 1)
**Goal**: Support all major AI providers and Git platforms

### Key Additions in Phase 2
- **Anthropic (Claude)** and **Google Gemini** AI providers
- **GitLab, Bitbucket, Azure DevOps** platform integrations
- **Streaming review responses** for better UX
- **Review caching** and **incremental reviews**
- **IDE extensions** (VS Code)
- **Full codebase indexing** for context
- **Jira/Linear integration** for business context
- **Test generation** capabilities

---

## Prerequisites

- Phase 1 MVP complete and stable
- User feedback incorporated
- Infrastructure scaled if needed

---

## Milestones

### Milestone 1: Anthropic Integration
**Status**: Not Started

- [ ] Anthropic SDK integration
- [ ] Claude provider implementation:
  - [ ] API client setup
  - [ ] Review generation
  - [ ] Token counting
  - [ ] Model selection (Opus, Sonnet, Haiku)
- [ ] Configuration support
- [ ] API key management in dashboard
- [ ] Provider selection UI
- [ ] Testing with various codebases
- [ ] Documentation

### Milestone 2: Google Gemini Integration
**Status**: Not Started

- [ ] Google AI SDK integration
- [ ] Gemini provider implementation:
  - [ ] API client setup
  - [ ] Review generation
  - [ ] Token counting
  - [ ] Model selection (Pro, Flash)
- [ ] Configuration support
- [ ] API key management in dashboard
- [ ] Testing with various codebases
- [ ] Documentation

### Milestone 3: Provider Abstraction Layer
**Status**: Not Started

- [ ] Unified provider interface
- [ ] Provider factory pattern
- [ ] Dynamic provider selection
- [ ] Fallback provider support
- [ ] Cost estimation per provider
- [ ] Model capability comparison

### Milestone 4: GitLab Integration
**Status**: Not Started

- [ ] GitLab webhook handler:
  - [ ] Token verification
  - [ ] Merge request events
  - [ ] Event parsing
- [ ] GitLab API client:
  - [ ] Get MR diff
  - [ ] Get file contents
  - [ ] Post discussion notes
  - [ ] Get repository config
- [ ] OAuth flow for connection
- [ ] Repository connection UI
- [ ] Webhook setup automation
- [ ] Testing with GitLab instances
- [ ] Documentation

### Milestone 5: Bitbucket Integration
**Status**: Not Started

- [ ] Bitbucket webhook handler:
  - [ ] Signature verification
  - [ ] PR events
  - [ ] Event parsing
- [ ] Bitbucket API client:
  - [ ] Get PR diff
  - [ ] Get file contents
  - [ ] Post comments
  - [ ] Get repository config
- [ ] OAuth flow for connection
- [ ] Repository connection UI
- [ ] Webhook setup
- [ ] Testing
- [ ] Documentation

### Milestone 6: Azure DevOps Integration
**Status**: Not Started

- [ ] Azure DevOps webhook handler:
  - [ ] Authentication
  - [ ] PR events
  - [ ] Event parsing
- [ ] Azure DevOps API client:
  - [ ] Get PR diff
  - [ ] Get file contents
  - [ ] Post comments/threads
  - [ ] Get repository config
- [ ] OAuth flow for connection
- [ ] Repository connection UI
- [ ] Service hook setup
- [ ] Testing
- [ ] Documentation

### Milestone 7: Platform Abstraction Layer
**Status**: Not Started

- [ ] Unified Git platform interface
- [ ] Platform factory pattern
- [ ] Webhook routing
- [ ] Normalized data models
- [ ] Platform-specific comment formatting
- [ ] Error handling per platform

### Milestone 8: Usage Analytics Dashboard
**Status**: Not Started

- [ ] Usage tracking:
  - [ ] Tokens per review
  - [ ] Cost estimation
  - [ ] Reviews per day/week/month
  - [ ] Reviews per repository
- [ ] Dashboard pages:
  - [ ] Usage overview
  - [ ] Cost breakdown by provider
  - [ ] Usage trends charts
  - [ ] Repository comparison
- [ ] Export functionality
- [ ] Date range filtering

### Milestone 9: Enhanced Configuration
**Status**: Not Started

- [ ] Path-specific configurations:
  - [ ] Per-directory rules
  - [ ] Per-file-type instructions
  - [ ] Inherited configurations
- [ ] Team overrides:
  - [ ] Team-level config inheritance
  - [ ] Override priority chain
- [ ] Configuration validation API:
  - [ ] Real-time validation
  - [ ] Preview effective config
  - [ ] Diff against defaults
- [ ] Configuration preview:
  - [ ] What would be reviewed
  - [ ] Which rules apply where
- [ ] Configuration templates:
  - [ ] React/TypeScript template
  - [ ] Python/Django template
  - [ ] Go template
  - [ ] Java/Spring template
- [ ] Import/export configs:
  - [ ] Export as YAML
  - [ ] Import from URL
  - [ ] Share between repos

### Milestone 9b: Streaming & Real-time Features
**Status**: Not Started

- [ ] **Streaming review responses:**
  - [ ] Server-Sent Events (SSE) implementation
  - [ ] Real-time comment appearance during review
  - [ ] Progress percentage updates
  - [ ] File completion notifications
- [ ] **Review caching:**
  - [ ] Cache reviews by commit SHA
  - [ ] Skip unchanged files on re-review
  - [ ] Cache invalidation on config change
- [ ] **Incremental reviews:**
  - [ ] Only review changed files since last review
  - [ ] Track file changes across commits
  - [ ] Smart context inclusion for changed dependencies
- [ ] **Real-time progress tracking:**
  - [ ] WebSocket fallback for SSE
  - [ ] Progress bar in dashboard
  - [ ] Estimated time remaining

### Milestone 9c: IDE Extensions
**Status**: Not Started

- [ ] **VS Code Extension:**
  - [ ] Pre-commit review trigger
  - [ ] Inline review comments
  - [ ] Configuration editor
  - [ ] API key management
  - [ ] Review history panel
- [ ] **JetBrains Plugin (basic):**
  - [ ] IntelliJ IDEA support
  - [ ] WebStorm support
  - [ ] PyCharm support
  - [ ] Pre-commit review

### Milestone 9d: Test Generation
**Status**: Not Started

- [ ] **Test generation service:**
  - [ ] Analyze changed code
  - [ ] Generate unit test suggestions
  - [ ] Support for Jest, Vitest, pytest
  - [ ] Configurable test style
- [ ] **Test coverage integration:**
  - [ ] Identify untested code in diff
  - [ ] Suggest test cases for coverage gaps
- [ ] **Test commands:**
  - [ ] `/test` command in PR comments
  - [ ] Generate tests for selected function
  - [ ] Test file creation suggestions

### Milestone 9e: Business Context Integration
**Status**: Not Started

- [ ] **Jira integration:**
  - [ ] Link PRs to Jira tickets
  - [ ] Validate against acceptance criteria
  - [ ] Auto-update ticket status
- [ ] **Linear integration:**
  - [ ] Link PRs to Linear issues
  - [ ] Context from issue description
- [ ] **Custom webhook integration:**
  - [ ] Review completion webhooks
  - [ ] Slack notifications
  - [ ] Teams notifications

### Milestone 9f: Full Codebase Indexing
**Status**: Not Started

- [ ] **Codebase graph building:**
  - [ ] Function/class dependency mapping
  - [ ] Import/export relationship tracking
  - [ ] Cross-file reference resolution
- [ ] **Vector embeddings:**
  - [ ] Code chunk embeddings
  - [ ] Semantic similarity search
  - [ ] Related file discovery
- [ ] **Context enhancement:**
  - [ ] Include related files in review context
  - [ ] Show impact of changes across codebase
  - [ ] Multi-hop investigation capabilities

### Milestone 10: Multi-Tenant Enhancements
**Status**: Not Started

- [ ] Organization management:
  - [ ] Create organization
  - [ ] Invite members
  - [ ] Role assignment
  - [ ] Remove members
- [ ] Organization settings:
  - [ ] Default AI provider
  - [ ] Usage limits
  - [ ] Notification preferences
- [ ] Organization switching UI
- [ ] Cross-organization isolation

### Milestone 11: Notification System
**Status**: Not Started

- [ ] Email notifications:
  - [ ] Review completed
  - [ ] Review failed
  - [ ] Weekly summary
- [ ] Slack integration:
  - [ ] Webhook configuration
  - [ ] Review notifications
  - [ ] Custom channels
- [ ] Notification preferences UI
- [ ] Notification templates

### Milestone 12: Testing & Documentation
**Status**: Not Started

- [ ] Integration tests for all providers
- [ ] Integration tests for all platforms
- [ ] Performance testing
- [ ] Load testing
- [ ] Updated user documentation
- [ ] Platform-specific guides
- [ ] Migration guide from Phase 1

---

## Technical Specifications

### New Providers

| Provider | Models | Max Context |
|----------|--------|-------------|
| Anthropic | claude-3-opus, claude-3-sonnet, claude-3-haiku | 200K tokens |
| Gemini | gemini-1.5-pro, gemini-1.5-flash | 1M tokens |

### New Platforms

| Platform | Auth Method | Webhook Format |
|----------|-------------|----------------|
| GitLab | OAuth 2.0 + Token | JSON webhook |
| Bitbucket | OAuth 2.0 | JSON webhook |
| Azure DevOps | OAuth 2.0 + PAT | Service hooks |

### New API Endpoints

**Microservice**:
```
POST /api/v1/webhooks/gitlab
POST /api/v1/webhooks/bitbucket
POST /api/v1/webhooks/azure
GET  /api/v1/providers
POST /api/v1/providers/:provider/test
```

**Server (Strapi)**:
```
GET  /api/usage-logs/summary
GET  /api/organizations/:id/members
POST /api/organizations/:id/invite
PUT  /api/organizations/:id/members/:userId
```

---

## Acceptance Criteria

### AI Providers

1. **User can choose any AI provider**
   - Select in repository config
   - All providers produce quality reviews
   - Consistent comment format

2. **Provider failover works**
   - Automatic switch on error
   - User notification of failover

3. **Cost tracking is accurate**
   - Per-provider token tracking
   - Cost estimation displayed

### Git Platforms

1. **All platforms work identically**
   - Same user experience
   - Same configuration options
   - Same review quality

2. **Platform-specific features supported**
   - GitLab discussion notes
   - Bitbucket inline comments
   - Azure DevOps threads

3. **Webhook handling is robust**
   - Proper signature verification
   - Graceful error handling
   - Retry logic

### Organization Features

1. **Teams can collaborate**
   - Invite members
   - Role-based access
   - Shared repositories

2. **Usage is tracked per organization**
   - Clear cost attribution
   - Usage limits enforced

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| API differences between platforms | High | Strong abstraction layer |
| Provider API changes | Medium | Version pinning, monitoring |
| Rate limits across providers | Medium | Queue management, caching |
| Increased complexity | Medium | Thorough testing, documentation |

---

## Dependencies

- All Phase 1 features complete
- GitLab/Bitbucket/Azure accounts for testing
- Anthropic API access
- Google AI API access

---

## Definition of Done

Phase 2 is complete when:

1. All 3 AI providers work interchangeably
2. All 4 Git platforms are supported
3. Usage analytics dashboard is functional
4. Organization management works
5. Tests pass with >80% coverage
6. Documentation updated for all features
7. No critical bugs open

---

## Next Steps (After Phase 2)

- Enterprise features (Phase 3)
- SSO/SAML integration
- Custom AI models
- On-premise deployment guide
- Advanced analytics
