'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useDemo } from '@/lib/demo';

type StatusFilter = 'all' | 'completed' | 'pending' | 'in_progress' | 'failed';

export default function DemoReviewsPage() {
  const { reviews, filterReviews } = useDemo();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReviews = useMemo(() => {
    return filterReviews(statusFilter, searchQuery);
  }, [filterReviews, statusFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    return {
      all: reviews.length,
      completed: reviews.filter((r) => r.status === 'completed').length,
      pending: reviews.filter((r) => r.status === 'pending').length,
      in_progress: reviews.filter((r) => r.status === 'in_progress').length,
      failed: reviews.filter((r) => r.status === 'failed').length,
    };
  }, [reviews]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Code Reviews</h1>
        <p className="text-muted-foreground">
          View and manage AI-generated code reviews across all your repositories.
        </p>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by PR title, number, or repository..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        <StatusFilterButton
          active={statusFilter === 'all'}
          onClick={() => setStatusFilter('all')}
          count={statusCounts.all}
        >
          All
        </StatusFilterButton>
        <StatusFilterButton
          active={statusFilter === 'completed'}
          onClick={() => setStatusFilter('completed')}
          count={statusCounts.completed}
          variant="success"
        >
          Completed
        </StatusFilterButton>
        <StatusFilterButton
          active={statusFilter === 'in_progress'}
          onClick={() => setStatusFilter('in_progress')}
          count={statusCounts.in_progress}
          variant="info"
        >
          In Progress
        </StatusFilterButton>
        <StatusFilterButton
          active={statusFilter === 'pending'}
          onClick={() => setStatusFilter('pending')}
          count={statusCounts.pending}
          variant="warning"
        >
          Pending
        </StatusFilterButton>
        <StatusFilterButton
          active={statusFilter === 'failed'}
          onClick={() => setStatusFilter('failed')}
          count={statusCounts.failed}
          variant="error"
        >
          Failed
        </StatusFilterButton>
      </div>

      {/* Reviews list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {filteredReviews.length} Review{filteredReviews.length !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReviews.length > 0 ? (
            <div className="divide-y">
              {filteredReviews.map((review) => (
                <Link
                  key={review.id}
                  href={`/demo/reviews/${review.id}`}
                  className="block py-4 hover:bg-gray-50 dark:hover:bg-gray-800 -mx-4 px-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-muted-foreground">
                          {review.repository?.name}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-sm text-muted-foreground">#{review.prNumber}</span>
                      </div>
                      <h3 className="font-medium truncate">{review.prTitle}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <UserIcon className="h-3.5 w-3.5" />
                          {review.prAuthor}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-3.5 w-3.5" />
                          {formatRelativeTime(review.createdAt)}
                        </span>
                        {review.tokensUsed > 0 && (
                          <span className="flex items-center gap-1">
                            <CpuIcon className="h-3.5 w-3.5" />
                            {review.tokensUsed.toLocaleString()} tokens
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={review.status} />
                  </div>
                  {review.errorMessage && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-600 dark:text-red-400">
                      {review.errorMessage}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <CodeIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No reviews found</p>
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search query.'
                  : 'No reviews match the selected filter.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Retry failed button */}
      {statusCounts.failed > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" disabled>
            <RefreshIcon className="h-4 w-4 mr-2" />
            Retry Failed Reviews ({statusCounts.failed})
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper components
function StatusFilterButton({
  children,
  active,
  onClick,
  count,
  variant = 'default',
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  count: number;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
        active
          ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900'
          : 'hover:opacity-80'
      } ${variants[variant]}`}
    >
      {children}
      <span className="text-xs opacity-75">({count})</span>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${
        styles[status] || styles.pending
      }`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
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

function CpuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
      />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}
