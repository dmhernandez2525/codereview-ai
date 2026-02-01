/**
 * Demo data for CodeReview AI
 * This data showcases the code review functionality with sample PRs and review comments
 */

import type { Review, ReviewFull, RepositoryWithStats, ReviewComment } from '@/lib/api';

// Demo user data
export const demoUser = {
  id: 1,
  username: 'demo_user',
  email: 'demo@codereview.ai',
  provider: 'local',
  confirmed: true,
  blocked: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-18T00:00:00Z',
};

// Demo repositories
export const demoRepositories: RepositoryWithStats[] = [
  {
    id: 1,
    name: 'react-dashboard',
    fullName: 'acme-corp/react-dashboard',
    platform: 'github',
    externalId: '123456',
    defaultBranch: 'main',
    isActive: true,
    settings: {},
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
    stats: {
      totalReviews: 48,
      completedReviews: 45,
      lastReviewAt: '2024-01-18T14:30:00Z',
      lastReviewStatus: 'completed',
    },
  },
  {
    id: 2,
    name: 'node-api',
    fullName: 'acme-corp/node-api',
    platform: 'github',
    externalId: '123457',
    defaultBranch: 'main',
    isActive: true,
    settings: {},
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-17T11:20:00Z',
    stats: {
      totalReviews: 32,
      completedReviews: 30,
      lastReviewAt: '2024-01-17T11:20:00Z',
      lastReviewStatus: 'completed',
    },
  },
  {
    id: 3,
    name: 'mobile-app',
    fullName: 'acme-corp/mobile-app',
    platform: 'github',
    externalId: '123458',
    defaultBranch: 'develop',
    isActive: false,
    settings: {},
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    stats: {
      totalReviews: 15,
      completedReviews: 14,
      lastReviewAt: '2024-01-12T16:45:00Z',
      lastReviewStatus: 'failed',
    },
  },
  {
    id: 4,
    name: 'shared-utils',
    fullName: 'acme-corp/shared-utils',
    platform: 'github',
    externalId: '123459',
    defaultBranch: 'main',
    isActive: true,
    settings: {},
    createdAt: '2024-01-01T07:00:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
    stats: {
      totalReviews: 22,
      completedReviews: 22,
      lastReviewAt: '2024-01-16T09:15:00Z',
      lastReviewStatus: 'completed',
    },
  },
];

// Demo reviews list
export const demoReviews: Review[] = [
  {
    id: 1,
    prNumber: 287,
    prTitle: 'Implement OAuth2 authentication with PKCE flow',
    prUrl: 'https://github.com/acme-corp/react-dashboard/pull/287',
    prAuthor: 'sarah.chen',
    headSha: 'a1b2c3d4e5f6',
    baseSha: 'f6e5d4c3b2a1',
    status: 'completed',
    aiProvider: 'openai',
    model: 'gpt-4o',
    tokensUsed: 5820,
    processingTime: 14500,
    errorMessage: null,
    metadata: {},
    completedAt: '2024-01-18T14:32:00Z',
    createdAt: '2024-01-18T14:30:00Z',
    updatedAt: '2024-01-18T14:32:00Z',
    repository: demoRepositories[0],
  },
  {
    id: 2,
    prNumber: 156,
    prTitle: 'Add rate limiting middleware with Redis backend',
    prUrl: 'https://github.com/acme-corp/node-api/pull/156',
    prAuthor: 'mike.wilson',
    headSha: 'g7h8i9j0k1l2',
    baseSha: 'l2k1j0i9h8g7',
    status: 'completed',
    aiProvider: 'openai',
    model: 'gpt-4o',
    tokensUsed: 3180,
    processingTime: 9800,
    errorMessage: null,
    metadata: {},
    completedAt: '2024-01-18T11:22:00Z',
    createdAt: '2024-01-18T11:20:00Z',
    updatedAt: '2024-01-18T11:22:00Z',
    repository: demoRepositories[1],
  },
  {
    id: 3,
    prNumber: 89,
    prTitle: 'Fix memory leak in navigation stack on Android',
    prUrl: 'https://github.com/acme-corp/mobile-app/pull/89',
    prAuthor: 'alex.rodriguez',
    headSha: 'm3n4o5p6q7r8',
    baseSha: 'r8q7p6o5n4m3',
    status: 'pending',
    aiProvider: 'openai',
    model: 'gpt-4o',
    tokensUsed: 0,
    processingTime: 0,
    errorMessage: null,
    metadata: {},
    completedAt: null,
    createdAt: '2024-01-18T09:00:00Z',
    updatedAt: '2024-01-18T09:00:00Z',
    repository: demoRepositories[2],
  },
  {
    id: 4,
    prNumber: 286,
    prTitle: 'Upgrade React to v18 and fix strict mode issues',
    prUrl: 'https://github.com/acme-corp/react-dashboard/pull/286',
    prAuthor: 'emma.johnson',
    headSha: 's9t0u1v2w3x4',
    baseSha: 'x4w3v2u1t0s9',
    status: 'completed',
    aiProvider: 'openai',
    model: 'gpt-4o',
    tokensUsed: 2150,
    processingTime: 7200,
    errorMessage: null,
    metadata: {},
    completedAt: '2024-01-17T16:47:00Z',
    createdAt: '2024-01-17T16:45:00Z',
    updatedAt: '2024-01-17T16:47:00Z',
    repository: demoRepositories[0],
  },
  {
    id: 5,
    prNumber: 155,
    prTitle: 'Add GraphQL subscriptions for real-time updates',
    prUrl: 'https://github.com/acme-corp/node-api/pull/155',
    prAuthor: 'david.kim',
    headSha: 'y5z6a7b8c9d0',
    baseSha: 'd0c9b8a7z6y5',
    status: 'failed',
    aiProvider: 'openai',
    model: 'gpt-4o',
    tokensUsed: 500,
    processingTime: 2000,
    errorMessage: 'API rate limit exceeded. Please try again later.',
    metadata: {},
    completedAt: null,
    createdAt: '2024-01-17T10:30:00Z',
    updatedAt: '2024-01-17T10:32:00Z',
    repository: demoRepositories[1],
  },
  {
    id: 6,
    prNumber: 45,
    prTitle: 'Add string manipulation utilities and unit tests',
    prUrl: 'https://github.com/acme-corp/shared-utils/pull/45',
    prAuthor: 'lisa.patel',
    headSha: 'e1f2g3h4i5j6',
    baseSha: 'j6i5h4g3f2e1',
    status: 'completed',
    aiProvider: 'openai',
    model: 'gpt-4o',
    tokensUsed: 1820,
    processingTime: 5400,
    errorMessage: null,
    metadata: {},
    completedAt: '2024-01-16T09:17:00Z',
    createdAt: '2024-01-16T09:15:00Z',
    updatedAt: '2024-01-16T09:17:00Z',
    repository: demoRepositories[3],
  },
  {
    id: 7,
    prNumber: 285,
    prTitle: 'Implement dark mode with system preference detection',
    prUrl: 'https://github.com/acme-corp/react-dashboard/pull/285',
    prAuthor: 'sarah.chen',
    headSha: 'k7l8m9n0o1p2',
    baseSha: 'p2o1n0m9l8k7',
    status: 'in_progress',
    aiProvider: 'openai',
    model: 'gpt-4o',
    tokensUsed: 1200,
    processingTime: 3500,
    errorMessage: null,
    metadata: {},
    completedAt: null,
    createdAt: '2024-01-18T15:00:00Z',
    updatedAt: '2024-01-18T15:01:00Z',
    repository: demoRepositories[0],
  },
];

// Detailed review comments for demo review #1 (OAuth implementation)
const oauthReviewComments: Record<string, ReviewComment[]> = {
  'src/auth/OAuthProvider.tsx': [
    {
      id: 1,
      filePath: 'src/auth/OAuthProvider.tsx',
      lineStart: 23,
      lineEnd: 28,
      content:
        'Security Issue: The PKCE code verifier is being stored in localStorage which is vulnerable to XSS attacks. Consider using sessionStorage or an httpOnly cookie approach. For sensitive tokens, memory-only storage with refresh token rotation is recommended.',
      severity: 'error',
      category: 'security',
      externalId: 'comment-1',
      isPosted: true,
      createdAt: '2024-01-18T14:31:00Z',
    },
    {
      id: 2,
      filePath: 'src/auth/OAuthProvider.tsx',
      lineStart: 45,
      lineEnd: 52,
      content:
        'The token refresh logic should include exponential backoff for retry attempts. Currently, rapid failures could overwhelm the auth server and degrade user experience.',
      severity: 'warning',
      category: 'reliability',
      externalId: 'comment-2',
      isPosted: true,
      createdAt: '2024-01-18T14:31:10Z',
    },
    {
      id: 3,
      filePath: 'src/auth/OAuthProvider.tsx',
      lineStart: 67,
      lineEnd: 67,
      content:
        'Good implementation of the PKCE challenge generation using crypto.subtle. This follows best practices for secure code verifier creation.',
      severity: 'info',
      category: 'code-quality',
      externalId: 'comment-3',
      isPosted: true,
      createdAt: '2024-01-18T14:31:15Z',
    },
  ],
  'src/hooks/useOAuth.ts': [
    {
      id: 4,
      filePath: 'src/hooks/useOAuth.ts',
      lineStart: 15,
      lineEnd: 22,
      content:
        'Consider adding a timeout for the OAuth callback. If the user abandons the flow, the pending state should eventually reset to prevent UI inconsistencies.',
      severity: 'suggestion',
      category: 'user-experience',
      externalId: 'comment-4',
      isPosted: true,
      createdAt: '2024-01-18T14:31:20Z',
    },
    {
      id: 5,
      filePath: 'src/hooks/useOAuth.ts',
      lineStart: 34,
      lineEnd: 38,
      content:
        'The error handling here swallows the original error details. For debugging purposes, consider logging the full error while showing a user-friendly message.',
      severity: 'suggestion',
      category: 'error-handling',
      externalId: 'comment-5',
      isPosted: true,
      createdAt: '2024-01-18T14:31:25Z',
    },
  ],
  'src/components/LoginButton.tsx': [
    {
      id: 6,
      filePath: 'src/components/LoginButton.tsx',
      lineStart: 12,
      lineEnd: 18,
      content:
        'The button should be disabled during the OAuth flow to prevent multiple authorization requests. Add a loading state indicator for better UX.',
      severity: 'warning',
      category: 'user-experience',
      externalId: 'comment-6',
      isPosted: true,
      createdAt: '2024-01-18T14:31:30Z',
    },
  ],
  'src/utils/crypto.ts': [
    {
      id: 7,
      filePath: 'src/utils/crypto.ts',
      lineStart: 8,
      lineEnd: 15,
      content:
        'Excellent use of the Web Crypto API for generating cryptographically secure random values. This is the correct approach for PKCE implementation.',
      severity: 'info',
      category: 'security',
      externalId: 'comment-7',
      isPosted: true,
      createdAt: '2024-01-18T14:31:35Z',
    },
  ],
};

// Detailed review comments for demo review #2 (Rate limiting)
const rateLimitingReviewComments: Record<string, ReviewComment[]> = {
  'src/middleware/rateLimiter.ts': [
    {
      id: 8,
      filePath: 'src/middleware/rateLimiter.ts',
      lineStart: 15,
      lineEnd: 25,
      content:
        'The sliding window algorithm implementation looks correct. However, consider adding a fallback mechanism when Redis is unavailable to prevent total service disruption.',
      severity: 'warning',
      category: 'reliability',
      externalId: 'comment-8',
      isPosted: true,
      createdAt: '2024-01-18T11:21:00Z',
    },
    {
      id: 9,
      filePath: 'src/middleware/rateLimiter.ts',
      lineStart: 42,
      lineEnd: 48,
      content:
        'Consider adding X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset headers to the response. This helps API consumers implement proper retry logic.',
      severity: 'suggestion',
      category: 'api-design',
      externalId: 'comment-9',
      isPosted: true,
      createdAt: '2024-01-18T11:21:10Z',
    },
  ],
  'src/config/rateLimits.ts': [
    {
      id: 10,
      filePath: 'src/config/rateLimits.ts',
      lineStart: 5,
      lineEnd: 12,
      content:
        'The rate limits are well-structured with different tiers. Consider making these configurable via environment variables for easier adjustment in different environments.',
      severity: 'suggestion',
      category: 'configuration',
      externalId: 'comment-10',
      isPosted: true,
      createdAt: '2024-01-18T11:21:15Z',
    },
  ],
  'tests/rateLimiter.test.ts': [
    {
      id: 11,
      filePath: 'tests/rateLimiter.test.ts',
      lineStart: 28,
      lineEnd: 35,
      content:
        'Good test coverage for the happy path. Consider adding tests for Redis connection failures and concurrent request handling.',
      severity: 'suggestion',
      category: 'testing',
      externalId: 'comment-11',
      isPosted: true,
      createdAt: '2024-01-18T11:21:20Z',
    },
  ],
};

// Full demo reviews with comments
export const demoFullReviews: Record<number, ReviewFull> = {
  1: {
    ...demoReviews[0],
    commentsByFile: oauthReviewComments,
  },
  2: {
    ...demoReviews[1],
    commentsByFile: rateLimitingReviewComments,
  },
  4: {
    ...demoReviews[3],
    commentsByFile: {
      'src/App.tsx': [
        {
          id: 12,
          filePath: 'src/App.tsx',
          lineStart: 8,
          lineEnd: 12,
          content:
            'The StrictMode wrapper is correctly placed at the root level. This will help catch potential issues during development.',
          severity: 'info',
          category: 'best-practices',
          externalId: 'comment-12',
          isPosted: true,
          createdAt: '2024-01-17T16:46:00Z',
        },
      ],
      'src/hooks/useEffect.ts': [
        {
          id: 13,
          filePath: 'src/hooks/useEffect.ts',
          lineStart: 15,
          lineEnd: 22,
          content:
            'Good fix for the strict mode double-mount issue. The cleanup function properly handles the abort controller for async operations.',
          severity: 'info',
          category: 'code-quality',
          externalId: 'comment-13',
          isPosted: true,
          createdAt: '2024-01-17T16:46:10Z',
        },
      ],
    },
  },
  6: {
    ...demoReviews[5],
    commentsByFile: {
      'src/strings.ts': [
        {
          id: 14,
          filePath: 'src/strings.ts',
          lineStart: 25,
          lineEnd: 32,
          content:
            'The truncate function handles edge cases well, but consider adding support for custom ellipsis characters and word boundary truncation.',
          severity: 'suggestion',
          category: 'enhancement',
          externalId: 'comment-14',
          isPosted: true,
          createdAt: '2024-01-16T09:16:00Z',
        },
      ],
      'tests/strings.test.ts': [
        {
          id: 15,
          filePath: 'tests/strings.test.ts',
          lineStart: 42,
          lineEnd: 55,
          content:
            'Excellent test coverage including edge cases like empty strings and unicode characters. Well done!',
          severity: 'info',
          category: 'testing',
          externalId: 'comment-15',
          isPosted: true,
          createdAt: '2024-01-16T09:16:10Z',
        },
      ],
    },
  },
};

// Demo dashboard stats
export const demoDashboardStats = [
  { name: 'Total Repositories', value: '4', change: '+1 from last month', trend: 'up' as const },
  { name: 'Reviews Completed', value: '117', change: '+28% from last month', trend: 'up' as const },
  { name: 'AI Tokens Used', value: '1.4M', change: '+12% from last month', trend: 'up' as const },
  { name: 'Issues Found', value: '156', change: '-8% from last month', trend: 'down' as const },
];

// Recent reviews for dashboard
export const demoRecentReviews = [
  {
    id: '1',
    repository: 'react-dashboard',
    prNumber: 287,
    prTitle: 'Implement OAuth2 authentication',
    status: 'completed',
    commentsCount: 7,
    createdAt: '2 hours ago',
  },
  {
    id: '2',
    repository: 'node-api',
    prNumber: 156,
    prTitle: 'Add rate limiting middleware',
    status: 'completed',
    commentsCount: 4,
    createdAt: '5 hours ago',
  },
  {
    id: '7',
    repository: 'react-dashboard',
    prNumber: 285,
    prTitle: 'Implement dark mode',
    status: 'in_progress',
    commentsCount: 2,
    createdAt: '30 minutes ago',
  },
  {
    id: '4',
    repository: 'react-dashboard',
    prNumber: 286,
    prTitle: 'Upgrade React to v18',
    status: 'completed',
    commentsCount: 2,
    createdAt: '1 day ago',
  },
];

// Helper to get a full review by ID
export function getDemoReviewById(id: number): ReviewFull | null {
  if (demoFullReviews[id]) {
    return demoFullReviews[id];
  }

  // For reviews without detailed comments, return with empty comments
  const review = demoReviews.find((r) => r.id === id);
  if (review) {
    return {
      ...review,
      commentsByFile: {},
    };
  }

  return null;
}
