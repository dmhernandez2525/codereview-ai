# Demo Mode

Demo mode allows CodeReview AI to be showcased without requiring real
authentication, database connections, or API keys. This is useful for portfolio
demonstrations and evaluating the product.

## How It Works

When demo mode is enabled, the application:

1. Redirects login/register pages to the demo experience at `/demo`
2. Uses mock data for repositories, code reviews, and analytics
3. Displays a demo banner indicating the user is viewing sample data
4. Provides full UI functionality with simulated data

## Enabling Demo Mode

### Environment Variable

Set the following environment variable:

```bash
NEXT_PUBLIC_DEMO_MODE=true
```

### Local Development

```bash
# Start with demo mode enabled
NEXT_PUBLIC_DEMO_MODE=true npm run dev
```

### Render Deployment

Demo mode is enabled by default in `render.yaml`:

```yaml
- key: NEXT_PUBLIC_DEMO_MODE
  value: 'true'
```

To disable demo mode and use real authentication, set the value to `"false"`.

## Demo Data

The demo mode includes:

### Demo User

- Username: `demo_user`
- Email: `demo@codereview.ai`

### Demo Repositories

- `acme-corp/react-dashboard` - Active React project
- `acme-corp/node-api` - Active Node.js API
- `acme-corp/mobile-app` - Inactive mobile project
- `acme-corp/shared-utils` - Shared utilities library

### Demo Reviews

Sample code reviews demonstrating:

- OAuth2 authentication implementation
- Rate limiting middleware
- React 18 upgrade
- Dark mode implementation
- Various review statuses (completed, pending, in_progress, failed)

### Demo Review Comments

Realistic AI-generated review comments showcasing:

- Security issues (error severity)
- Reliability warnings
- Code quality suggestions
- Best practice recommendations

## Architecture

```
Client/src/lib/demo/
  ├── index.ts       # Exports all demo utilities
  ├── context.tsx    # DemoProvider and useDemo hook
  └── data.ts        # All demo data (users, repos, reviews)

Client/src/app/(demo)/
  ├── layout.tsx     # Demo layout with banner and navigation
  └── demo/
      └── page.tsx   # Demo dashboard page
```

## Switching Between Demo and Real Mode

| Mode | NEXT_PUBLIC_DEMO_MODE | Behavior                            |
| ---- | --------------------- | ----------------------------------- |
| Demo | `"true"`              | Uses mock data, no auth required    |
| Real | `"false"`             | Requires database, Strapi CMS, auth |

## Testing Demo Mode

```bash
# Verify demo works without any backend services
unset DATABASE_URL STRAPI_URL
NEXT_PUBLIC_DEMO_MODE=true npm run dev
```

The demo should function fully without any external dependencies.
