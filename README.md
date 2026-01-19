# CodeReview AI

A self-hostable, open-source AI-powered code review platform that integrates
with your existing Git workflow.

## Overview

CodeReview AI automatically analyzes pull requests and provides intelligent code
review feedback using leading AI models. It supports multiple Git platforms and
AI providers, giving you full control over your code review infrastructure.

### Key Features

- **Multi-Platform Support**: GitHub, GitLab, Bitbucket, Azure DevOps
- **Multiple AI Providers**: OpenAI, Anthropic, Gemini
- **Self-Hostable**: Full Docker support for on-premise deployment
- **Configurable**: Repository-level YAML configuration
- **Multi-Tenant**: Organization-based access control
- **Usage Tracking**: Token and cost monitoring

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Client      │────▶│     Server      │────▶│  Microservice   │
│   (Next.js 14)  │     │   (Strapi 5)    │     │    (Express)    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │   AI Providers  │
                                               │ OpenAI/Claude/  │
                                               │     Gemini      │
                                               └─────────────────┘
```

### Components

| Component        | Technology              | Purpose                                   |
| ---------------- | ----------------------- | ----------------------------------------- |
| **Client**       | Next.js 14 (App Router) | Dashboard, marketing site, user interface |
| **Server**       | Strapi 5                | CMS, authentication, data management      |
| **Microservice** | Express + TypeScript    | AI review engine, webhook processing      |

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+
- Git platform account (GitHub/GitLab/Bitbucket/Azure)
- AI provider API key (OpenAI/Anthropic/Google)

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/codereview-ai.git
   cd codereview-ai
   ```

2. **Copy environment variables**

   ```bash
   cp .env.example .env
   ```

3. **Start with Docker Compose**

   ```bash
   docker-compose up -d
   ```

4. **Access the services**
   - Client: http://localhost:3000
   - Server (Strapi): http://localhost:1337
   - Microservice: http://localhost:4000

### Manual Setup

See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for detailed manual
installation instructions.

## Configuration

Configure CodeReview AI at the repository level using a `.codereview.yaml` file:

```yaml
version: '1.0'
ai:
  provider: openai
  model: gpt-4-turbo
  temperature: 0.3

review:
  auto_review: true
  review_on: [pull_request]

filters:
  paths:
    include: ['src/**', 'lib/**']
    exclude: ['**/*.test.ts', '**/*.spec.ts']

guidelines:
  - 'Follow TypeScript best practices'
  - 'Ensure proper error handling'
```

See [CONFIGURATION_GUIDE.md](docs/CONFIGURATION_GUIDE.md) for complete
configuration reference.

## Documentation

| Document                                                     | Description                              |
| ------------------------------------------------------------ | ---------------------------------------- |
| [Software Design Document](docs/SOFTWARE_DESIGN_DOCUMENT.md) | Architecture, schemas, technical design  |
| [API Specification](docs/API_SPECIFICATION.md)               | Complete API reference                   |
| [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)                 | Installation and deployment instructions |
| [Configuration Guide](docs/CONFIGURATION_GUIDE.md)           | YAML config and environment variables    |
| [Coding Standards](docs/CODING_STANDARDS.md)                 | Development conventions                  |

## Roadmap

| Phase                                      | Focus                       | Status      |
| ------------------------------------------ | --------------------------- | ----------- |
| [Phase 1](roadmap/PHASE_1_MVP.md)          | MVP - Core functionality    | In Progress |
| [Phase 2](roadmap/PHASE_2_INTEGRATIONS.md) | Multi-platform integrations | Planned     |
| [Phase 3](roadmap/PHASE_3_ENTERPRISE.md)   | Enterprise features         | Planned     |

## Project Structure

```
codereview-ai/
├── Client/                 # Next.js 14 frontend
│   ├── app/               # App Router pages
│   ├── components/        # React components
│   ├── lib/              # Utilities and API clients
│   └── types/            # TypeScript definitions
├── Server/                # Strapi 5 CMS
│   └── src/
│       ├── api/          # Content types and controllers
│       └── extensions/   # Strapi extensions
├── Microservice/          # Express AI engine
│   └── src/
│       ├── controllers/  # HTTP endpoints
│       ├── services/     # Business logic
│       ├── providers/    # AI providers
│       ├── integrations/ # Git platform integrations
│       └── middleware/   # Express middleware
├── docs/                  # Documentation
└── roadmap/              # Phase checklists
```

## Tech Stack

### Client

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query

### Server

- Strapi 5
- PostgreSQL
- Redis (caching)

### Microservice

- Express.js
- TypeScript
- Bull (job queue)
- OpenAI/Anthropic/Google AI SDKs

### Infrastructure

- Docker & Docker Compose
- GitHub Actions CI/CD
- Render (cloud deployment)

## Contributing

Contributions are welcome! Please read our contributing guidelines before
submitting PRs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## Support

- [GitHub Issues](https://github.com/yourusername/codereview-ai/issues) - Bug
  reports and feature requests
- [Discussions](https://github.com/yourusername/codereview-ai/discussions) -
  Questions and community support
