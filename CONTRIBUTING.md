# Contributing to CodeReview AI

Thank you for your interest in contributing to CodeReview AI! This document
provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and
inclusive environment. Be kind, constructive, and professional in all
interactions.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/codereview-ai.git
   cd codereview-ai
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/codereview-ai.git
   ```

## Development Setup

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### Setup Steps

1. **Copy environment variables**:

   ```bash
   cp .env.example .env
   ```

2. **Start development environment**:

   ```bash
   docker-compose up -d
   ```

3. **Install dependencies** (for IDE support):

   ```bash
   # Root
   npm install

   # Each service
   cd Client && npm install && cd ..
   cd Server && npm install && cd ..
   cd Microservice && npm install && cd ..
   ```

4. **Access services**:
   - Client: http://localhost:3000
   - Server (Strapi): http://localhost:1337
   - Microservice: http://localhost:4000

## Making Changes

### Branch Naming

Use descriptive branch names:

| Type          | Pattern                | Example                       |
| ------------- | ---------------------- | ----------------------------- |
| Feature       | `feature/description`  | `feature/add-gitlab-support`  |
| Bug Fix       | `fix/description`      | `fix/webhook-signature`       |
| Documentation | `docs/description`     | `docs/update-api-spec`        |
| Refactor      | `refactor/description` | `refactor/provider-interface` |

### Workflow

1. **Create a branch**:

   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make your changes** following our
   [Coding Standards](docs/CODING_STANDARDS.md)

3. **Test your changes**:

   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

4. **Commit your changes**:

   ```bash
   git commit -m "feat(scope): description of change"
   ```

5. **Push to your fork**:

   ```bash
   git push origin feature/your-feature
   ```

6. **Open a Pull Request**

## Pull Request Process

### Before Submitting

- [ ] Code follows project coding standards
- [ ] All tests pass locally
- [ ] Linting passes (`npm run lint`)
- [ ] Type checking passes (`npm run type-check`)
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow conventions

### PR Description Template

```markdown
## Summary

Brief description of changes

## Changes Made

- Change 1
- Change 2

## Testing

How were these changes tested?

## Related Issues

Fixes #123
```

### Review Process

1. A maintainer will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge your PR

## Coding Standards

Please follow our [Coding Standards](docs/CODING_STANDARDS.md) document. Key
points:

- **TypeScript**: Use strict typing, avoid `any`
- **Formatting**: Use Prettier (runs automatically)
- **Linting**: Follow ESLint rules
- **Naming**: Use descriptive, meaningful names
- **Comments**: Explain "why", not "what"

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
```

**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples**:

```
feat(review): add GitLab merge request support
fix(webhook): handle missing signature header
docs(api): update authentication examples
```

## Testing

### Running Tests

```bash
# All tests
npm run test

# With coverage
npm run test:coverage

# Specific service
cd Microservice && npm run test
```

### Writing Tests

- Write tests for new features
- Update tests when modifying existing code
- Aim for meaningful coverage, not just numbers
- Test edge cases and error conditions

### Test Structure

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## Documentation

### When to Update Docs

- Adding new features
- Changing API endpoints
- Modifying configuration options
- Updating deployment steps

### Documentation Files

| File                               | Purpose            |
| ---------------------------------- | ------------------ |
| `README.md`                        | Project overview   |
| `docs/SOFTWARE_DESIGN_DOCUMENT.md` | Architecture       |
| `docs/API_SPECIFICATION.md`        | API reference      |
| `docs/DEPLOYMENT_GUIDE.md`         | Deployment         |
| `docs/CONFIGURATION_GUIDE.md`      | Configuration      |
| `docs/CODING_STANDARDS.md`         | Coding conventions |

## Questions?

- Open a [Discussion](https://github.com/OWNER/codereview-ai/discussions) for
  questions
- Open an [Issue](https://github.com/OWNER/codereview-ai/issues) for bugs or
  feature requests

Thank you for contributing!
