'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { Review } from '@/lib/api';

// Mock data for demonstration
const mockReviews: Review[] = [
  {
    id: 1,
    prNumber: 142,
    prTitle: 'Add user authentication flow',
    prUrl: 'https://github.com/myorg/frontend-app/pull/142',
    prAuthor: 'johndoe',
    headSha: 'abc1234',
    baseSha: 'def5678',
    status: 'completed',
    aiProvider: 'openai',
    model: 'gpt-4o',
    tokensUsed: 4250,
    processingTime: 12500,
    errorMessage: null,
    metadata: {},
    completedAt: '2024-01-18T14:32:00Z',
    createdAt: '2024-01-18T14:30:00Z',
    updatedAt: '2024-01-18T14:32:00Z',
    repository: {
      id: 1,
      name: 'frontend-app',
      fullName: 'myorg/frontend-app',
      platform: 'github',
      externalId: '123456',
      defaultBranch: 'main',
      isActive: true,
      settings: {},
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-18T14:30:00Z',
    },
  },
  {
    id: 2,
    prNumber: 89,
    prTitle: 'Implement rate limiting middleware',
    prUrl: 'https://github.com/myorg/api-server/pull/89',
    prAuthor: 'janedoe',
    headSha: 'ghi9012',
    baseSha: 'jkl3456',
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
    repository: {
      id: 2,
      name: 'api-server',
      fullName: 'myorg/api-server',
      platform: 'github',
      externalId: '123457',
      defaultBranch: 'main',
      isActive: true,
      settings: {},
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-17T11:20:00Z',
    },
  },
  {
    id: 3,
    prNumber: 56,
    prTitle: 'Fix navigation stack bug on Android',
    prUrl: 'https://github.com/myorg/mobile-app/pull/56',
    prAuthor: 'mobiledev',
    headSha: 'mno7890',
    baseSha: 'pqr1234',
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
    repository: {
      id: 3,
      name: 'mobile-app',
      fullName: 'myorg/mobile-app',
      platform: 'github',
      externalId: '123458',
      defaultBranch: 'develop',
      isActive: false,
      settings: {},
      createdAt: '2024-01-05T08:00:00Z',
      updatedAt: '2024-01-12T16:45:00Z',
    },
  },
  {
    id: 4,
    prNumber: 141,
    prTitle: 'Update dependencies and fix security vulnerabilities',
    prUrl: 'https://github.com/myorg/frontend-app/pull/141',
    prAuthor: 'securitybot',
    headSha: 'stu5678',
    baseSha: 'vwx9012',
    status: 'completed',
    aiProvider: 'openai',
    model: 'gpt-4o',
    tokensUsed: 1850,
    processingTime: 6200,
    errorMessage: null,
    metadata: {},
    completedAt: '2024-01-17T16:47:00Z',
    createdAt: '2024-01-17T16:45:00Z',
    updatedAt: '2024-01-17T16:47:00Z',
    repository: {
      id: 1,
      name: 'frontend-app',
      fullName: 'myorg/frontend-app',
      platform: 'github',
      externalId: '123456',
      defaultBranch: 'main',
      isActive: true,
      settings: {},
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-18T14:30:00Z',
    },
  },
  {
    id: 5,
    prNumber: 88,
    prTitle: 'Add GraphQL subscriptions for real-time updates',
    prUrl: 'https://github.com/myorg/api-server/pull/88',
    prAuthor: 'graphqldev',
    headSha: 'yza3456',
    baseSha: 'bcd7890',
    status: 'failed',
    aiProvider: 'openai',
    model: 'gpt-4o',
    tokensUsed: 500,
    processingTime: 2000,
    errorMessage: 'API rate limit exceeded',
    metadata: {},
    completedAt: null,
    createdAt: '2024-01-17T10:30:00Z',
    updatedAt: '2024-01-17T10:32:00Z',
    repository: {
      id: 2,
      name: 'api-server',
      fullName: 'myorg/api-server',
      platform: 'github',
      externalId: '123457',
      defaultBranch: 'main',
      isActive: true,
      settings: {},
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-17T11:20:00Z',
    },
  },
];

type StatusFilter = 'all' | 'pending' | 'in_progress' | 'completed' | 'failed';

export default function ReviewsPage() {
  const [reviews] = useState<Review[]>(mockReviews);
  const [isLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReviews = reviews.filter((review) => {
    const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
    const matchesSearch =
      !searchQuery ||
      review.prTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.repository?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.prNumber.toString().includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const statusCounts = {
    all: reviews.length,
    pending: reviews.filter((r) => r.status === 'pending').length,
    in_progress: reviews.filter((r) => r.status === 'in_progress').length,
    completed: reviews.filter((r) => r.status === 'completed').length,
    failed: reviews.filter((r) => r.status === 'failed').length,
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground">
          View and manage AI code reviews across all your repositories.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
              { key: 'failed', label: 'Failed' },
            ] as const
          ).map(({ key, label }) => (
            <Button
              key={key}
              variant={statusFilter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(key)}
            >
              {label}
              <span className="ml-1 text-xs opacity-70">({statusCounts[key]})</span>
            </Button>
          ))}
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Reviews table */}
      <Card>
        <CardHeader>
          <CardTitle>Review History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pull Request</TableHead>
                <TableHead>Repository</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tokens</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell>
                    <div className="max-w-xs">
                      <a
                        href={review.prUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        #{review.prNumber}
                      </a>
                      <div className="truncate text-sm text-muted-foreground">{review.prTitle}</div>
                      <div className="text-xs text-muted-foreground">by {review.prAuthor}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {review.repository ? (
                      <Link
                        href={`/repositories/${review.repository.id}`}
                        className="hover:underline"
                      >
                        {review.repository.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">Unknown</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={review.status} />
                    {review.errorMessage && (
                      <div className="mt-1 max-w-xs truncate text-xs text-red-500">
                        {review.errorMessage}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {review.tokensUsed > 0 ? (
                      <div className="flex items-center gap-1">
                        <TokenIcon className="h-3 w-3 text-muted-foreground" />
                        {formatTokens(review.tokensUsed)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {review.processingTime > 0 ? (
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-3 w-3 text-muted-foreground" />
                        {formatDuration(review.processingTime)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{formatDate(review.createdAt)}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/reviews/${review.id}`}>
                      <Button variant="ghost" size="sm">
                        <EyeIcon className="mr-1 h-4 w-4" />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredReviews.length === 0 && (
            <div className="py-12 text-center">
              <ReviewIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No reviews found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery || statusFilter !== 'all'
                  ? 'Try adjusting your filters or search query.'
                  : 'Reviews will appear here when pull requests are opened on connected repositories.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Components
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    skipped: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[status] || styles.pending
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

// Icons
function TokenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );
}

function ReviewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
      />
    </svg>
  );
}
