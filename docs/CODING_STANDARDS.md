# Coding Standards

This document outlines the coding conventions and best practices for the
CodeReview AI project.

## Table of Contents

- [General Principles](#general-principles)
- [TypeScript Guidelines](#typescript-guidelines)
- [React/Next.js Guidelines](#reactnextjs-guidelines)
- [Node.js/Express Guidelines](#nodejsexpress-guidelines)
- [Strapi Guidelines](#strapi-guidelines)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Error Handling](#error-handling)
- [Testing Standards](#testing-standards)
- [Git Workflow](#git-workflow)
- [Documentation](#documentation)

---

## General Principles

### Code Quality

1. **Readability over cleverness** - Write code that others can understand
2. **Single Responsibility** - Each function/module should do one thing well
3. **DRY (Don't Repeat Yourself)** - Extract common logic into reusable
   functions
4. **YAGNI (You Aren't Gonna Need It)** - Don't add functionality until it's
   needed
5. **Fail fast** - Validate early and throw errors immediately

### Formatting

- Use Prettier for automatic code formatting
- Run `npm run format` before committing
- Maximum line length: 100 characters
- Use 2 spaces for indentation (no tabs)
- Always use semicolons
- Use single quotes for strings (except JSX)

---

## TypeScript Guidelines

### Type Safety

```typescript
// Good: Explicit types for function parameters and returns
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Bad: Any type
function calculateTotal(items: any): any {
  return items.reduce(
    (sum: any, item: any) => sum + item.price * item.quantity,
    0
  );
}
```

### Type Definitions

```typescript
// Good: Interface for object shapes
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

// Good: Type for unions and computed types
type UserRole = 'admin' | 'member' | 'viewer';
type UserWithRole = User & { role: UserRole };

// Good: Enums for fixed sets of values
enum ReviewStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
  Failed = 'failed',
}
```

### Null Handling

```typescript
// Good: Use optional chaining and nullish coalescing
const userName = user?.name ?? 'Anonymous';

// Good: Explicit null checks when needed
function processReview(review: Review | null): void {
  if (!review) {
    throw new Error('Review is required');
  }
  // TypeScript knows review is not null here
}

// Bad: Non-null assertion without validation
const userName = user!.name;
```

### Generics

```typescript
// Good: Generic functions for reusability
async function fetchResource<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return response.json() as T;
}

// Usage
const user = await fetchResource<User>('/api/users/1');
```

### Async/Await

```typescript
// Good: Always use async/await over .then()
async function fetchUserReviews(userId: string): Promise<Review[]> {
  const user = await fetchUser(userId);
  const reviews = await fetchReviewsByUser(user.id);
  return reviews;
}

// Good: Parallel execution when possible
async function fetchDashboardData(userId: string): Promise<DashboardData> {
  const [user, reviews, stats] = await Promise.all([
    fetchUser(userId),
    fetchReviews(userId),
    fetchStats(userId),
  ]);
  return { user, reviews, stats };
}
```

---

## React/Next.js Guidelines

### Component Structure

```typescript
// Good: Functional components with TypeScript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  children,
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }))}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Hooks

```typescript
// Good: Custom hooks for reusable logic
function useReviews(repositoryId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchReviews() {
      try {
        const data = await api.getReviews(repositoryId);
        if (!cancelled) {
          setReviews(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchReviews();

    return () => {
      cancelled = true;
    };
  }, [repositoryId]);

  return { reviews, loading, error };
}
```

### Server Components (Next.js 14)

```typescript
// Good: Server component for data fetching
// app/dashboard/reviews/page.tsx
export default async function ReviewsPage() {
  const reviews = await fetchReviews();

  return (
    <div>
      <h1>Reviews</h1>
      <ReviewList reviews={reviews} />
    </div>
  );
}

// Good: Client component when interactivity needed
// components/ReviewList.tsx
'use client';

export function ReviewList({ reviews }: { reviews: Review[] }) {
  const [filter, setFilter] = useState('all');

  return (
    <div>
      <FilterBar value={filter} onChange={setFilter} />
      {reviews.filter(/* ... */).map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
```

### State Management

- Use React Query for server state
- Use Zustand for complex client state
- Use useState for simple local state
- Avoid prop drilling - use context or state management

---

## Node.js/Express Guidelines

### Controller Structure

```typescript
// Good: Controller with dependency injection
export class ReviewController {
  constructor(
    private reviewService: ReviewService,
    private aiService: AIService
  ) {}

  async createReview(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { repositoryId, pullRequestNumber } = req.body;

      const review = await this.reviewService.createReview({
        repositoryId,
        pullRequestNumber,
        userId: req.user.id,
      });

      res.status(201).json({ data: review });
    } catch (error) {
      next(error);
    }
  }
}
```

### Service Layer

```typescript
// Good: Business logic in services
export class ReviewService {
  constructor(
    private reviewRepository: ReviewRepository,
    private aiProvider: AIProvider
  ) {}

  async createReview(params: CreateReviewParams): Promise<Review> {
    // Validate
    await this.validateRepository(params.repositoryId);

    // Create review record
    const review = await this.reviewRepository.create({
      repositoryId: params.repositoryId,
      pullRequestNumber: params.pullRequestNumber,
      status: ReviewStatus.Pending,
    });

    // Queue AI processing
    await this.queueReviewProcessing(review.id);

    return review;
  }
}
```

### Error Handling

```typescript
// Good: Custom error classes
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}
```

### Middleware

```typescript
// Good: Error handling middleware
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', error);

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}
```

---

## Strapi Guidelines

### Content Type Naming

- Use singular, kebab-case names: `review`, `api-key`, `usage-log`
- Prefix custom routes with `/api/v1/`

### Custom Controllers

```typescript
// Good: Extending Strapi controllers
export default factories.createCoreController(
  'api::review.review',
  ({ strapi }) => ({
    async findByRepository(ctx) {
      const { repositoryId } = ctx.params;

      const reviews = await strapi.entityService.findMany(
        'api::review.review',
        {
          filters: { repository: repositoryId },
          populate: ['comments', 'repository'],
        }
      );

      return { data: reviews };
    },
  })
);
```

### Services

```typescript
// Good: Custom service logic
export default factories.createCoreService(
  'api::review.review',
  ({ strapi }) => ({
    async processReview(reviewId: number) {
      const review = await strapi.entityService.findOne(
        'api::review.review',
        reviewId,
        {
          populate: ['repository', 'repository.organization'],
        }
      );

      if (!review) {
        throw new NotFoundError('Review');
      }

      // Process...
    },
  })
);
```

---

## File Organization

### Directory Structure

```
src/
├── controllers/        # HTTP request handlers
├── services/          # Business logic
├── repositories/      # Data access layer
├── models/            # Type definitions
├── middleware/        # Express middleware
├── utils/             # Helper functions
├── config/            # Configuration
└── types/             # TypeScript types
```

### File Naming

| Type       | Convention                  | Example               |
| ---------- | --------------------------- | --------------------- |
| Components | PascalCase                  | `ReviewCard.tsx`      |
| Hooks      | camelCase with `use` prefix | `useReviews.ts`       |
| Utilities  | camelCase                   | `formatDate.ts`       |
| Types      | PascalCase                  | `Review.ts`           |
| Constants  | SCREAMING_SNAKE_CASE        | `API_ENDPOINTS.ts`    |
| Tests      | Same as source + `.test`    | `ReviewCard.test.tsx` |

---

## Naming Conventions

### Variables and Functions

```typescript
// Good: Descriptive names
const activeReviews = reviews.filter((r) => r.status === 'active');
const totalTokensUsed = calculateTokenUsage(reviews);

function formatReviewComment(comment: Comment): string {}
async function fetchRepositoryReviews(repoId: string): Promise<Review[]> {}

// Bad: Abbreviated or unclear names
const revs = reviews.filter((r) => r.s === 'a');
const ttu = calcTU(revs);
```

### Booleans

```typescript
// Good: Use is/has/can/should prefixes
const isLoading = true;
const hasPermission = user.role === 'admin';
const canEdit = hasPermission && !isLocked;
const shouldRefresh = lastUpdate < threshold;

// Bad: Unclear boolean names
const loading = true;
const permission = true;
```

### Constants

```typescript
// Good: SCREAMING_SNAKE_CASE for constants
const MAX_RETRIES = 3;
const DEFAULT_PAGE_SIZE = 20;
const API_BASE_URL = process.env.API_URL;

// Good: Frozen objects for constant collections
const REVIEW_STATUSES = Object.freeze({
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const);
```

---

## Error Handling

### Principles

1. **Catch specific errors** - Don't catch generic `Error` when possible
2. **Provide context** - Include relevant information in error messages
3. **Log appropriately** - Log errors with stack traces in development
4. **User-friendly messages** - Return sanitized messages to clients

### Patterns

```typescript
// Good: Specific error handling
async function fetchReview(id: string): Promise<Review> {
  try {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        throw new NotFoundError('Review');
      }
      if (error.response?.status === 403) {
        throw new ForbiddenError('Access denied');
      }
    }
    throw new AppError('Failed to fetch review');
  }
}
```

---

## Testing Standards

### Unit Tests

```typescript
describe('ReviewService', () => {
  describe('createReview', () => {
    it('should create a review with pending status', async () => {
      const mockRepo = { create: vi.fn().mockResolvedValue({ id: '1' }) };
      const service = new ReviewService(mockRepo);

      const result = await service.createReview({
        repositoryId: 'repo-1',
        pullRequestNumber: 42,
      });

      expect(result.id).toBe('1');
      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pending' })
      );
    });
  });
});
```

### Integration Tests

```typescript
describe('POST /api/reviews', () => {
  it('should create a review and return 201', async () => {
    const response = await request(app)
      .post('/api/reviews')
      .send({
        repositoryId: 'repo-1',
        pullRequestNumber: 42,
      })
      .set('Authorization', `Bearer ${testToken}`);

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
  });
});
```

### Test File Organization

```
__tests__/
├── unit/
│   ├── services/
│   │   └── ReviewService.test.ts
│   └── utils/
│       └── formatters.test.ts
├── integration/
│   └── api/
│       └── reviews.test.ts
└── e2e/
    └── review-flow.test.ts
```

---

## Git Workflow

### Branch Naming

| Type     | Pattern                | Example                          |
| -------- | ---------------------- | -------------------------------- |
| Feature  | `feature/description`  | `feature/add-gitlab-integration` |
| Bug Fix  | `fix/description`      | `fix/review-status-update`       |
| Hotfix   | `hotfix/description`   | `hotfix/auth-token-expiry`       |
| Refactor | `refactor/description` | `refactor/review-service`        |

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:

```
feat(review): add support for GitLab webhooks
fix(auth): resolve token refresh race condition
docs(api): update webhook endpoint documentation
refactor(microservice): extract AI provider interface
```

### Pull Requests

1. Keep PRs focused and small (< 400 lines when possible)
2. Include description of changes
3. Reference related issues
4. Ensure CI passes before requesting review
5. Respond to review comments promptly

---

## Documentation

### Code Comments

```typescript
// Good: Explain "why", not "what"
// Retry with exponential backoff to handle rate limiting from AI providers
for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
  try {
    return await this.aiProvider.generateReview(diff);
  } catch (error) {
    if (attempt === MAX_RETRIES - 1) throw error;
    await sleep(Math.pow(2, attempt) * 1000);
  }
}

// Bad: Obvious comment
// Loop through reviews
for (const review of reviews) {
```

### JSDoc

Use JSDoc for public APIs and complex functions:

```typescript
/**
 * Generates an AI-powered code review for a pull request.
 *
 * @param repository - The repository containing the PR
 * @param pullRequestNumber - The PR number to review
 * @param options - Review generation options
 * @returns The generated review with comments
 * @throws {NotFoundError} If the repository or PR doesn't exist
 * @throws {RateLimitError} If AI provider rate limit is exceeded
 *
 * @example
 * const review = await generateReview(repo, 42, { model: 'gpt-4' });
 */
async function generateReview(
  repository: Repository,
  pullRequestNumber: number,
  options: ReviewOptions
): Promise<Review> {
  // ...
}
```

### README Files

Each service should have its own README with:

- Purpose and overview
- Setup instructions
- Available scripts
- Environment variables
- Architecture notes

---

## Code Review Checklist

Before submitting a PR, ensure:

- [ ] Code follows these coding standards
- [ ] TypeScript has no type errors (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Prettier formatting applied (`npm run format`)
- [ ] Tests pass (`npm run test`)
- [ ] No console.log statements (except in server code)
- [ ] Error handling is appropriate
- [ ] No hardcoded secrets or credentials
- [ ] Documentation updated if needed
