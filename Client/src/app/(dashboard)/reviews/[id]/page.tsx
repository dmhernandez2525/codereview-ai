'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';


import type { ReviewFull, ReviewComment } from '@/lib/api';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';


// Mock data for demonstration
const mockReview: ReviewFull = {
  id: 1,
  prNumber: 142,
  prTitle: 'Add user authentication flow',
  prUrl: 'https://github.com/myorg/frontend-app/pull/142',
  prAuthor: 'johndoe',
  headSha: 'abc1234567890',
  baseSha: 'def5678901234',
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
  commentsByFile: {
    'src/auth/AuthProvider.tsx': [
      {
        id: 1,
        filePath: 'src/auth/AuthProvider.tsx',
        lineStart: 15,
        lineEnd: 20,
        content:
          'Consider using a more secure token storage mechanism. localStorage is vulnerable to XSS attacks. Consider using httpOnly cookies or a more secure approach like storing tokens in memory with refresh token rotation.',
        severity: 'warning',
        category: 'security',
        externalId: 'comment-1',
        isPosted: true,
        createdAt: '2024-01-18T14:31:00Z',
      },
      {
        id: 2,
        filePath: 'src/auth/AuthProvider.tsx',
        lineStart: 45,
        lineEnd: 45,
        content:
          'This async operation should handle errors more gracefully. Consider wrapping in a try-catch block and providing user feedback on failure.',
        severity: 'suggestion',
        category: 'error-handling',
        externalId: 'comment-2',
        isPosted: true,
        createdAt: '2024-01-18T14:31:10Z',
      },
    ],
    'src/hooks/useAuth.ts': [
      {
        id: 3,
        filePath: 'src/hooks/useAuth.ts',
        lineStart: 8,
        lineEnd: 12,
        content:
          'Good use of the custom hook pattern here. The separation of concerns is clean and follows React best practices.',
        severity: 'info',
        category: 'code-quality',
        externalId: 'comment-3',
        isPosted: true,
        createdAt: '2024-01-18T14:31:20Z',
      },
    ],
    'src/components/LoginForm.tsx': [
      {
        id: 4,
        filePath: 'src/components/LoginForm.tsx',
        lineStart: 32,
        lineEnd: 38,
        content:
          'The form validation is missing email format validation. Consider adding a regex check or using a validation library like zod or yup.',
        severity: 'error',
        category: 'validation',
        externalId: 'comment-4',
        isPosted: true,
        createdAt: '2024-01-18T14:31:30Z',
      },
      {
        id: 5,
        filePath: 'src/components/LoginForm.tsx',
        lineStart: 55,
        lineEnd: 55,
        content:
          'Consider adding rate limiting on the client side to prevent rapid form submissions.',
        severity: 'suggestion',
        category: 'security',
        externalId: 'comment-5',
        isPosted: true,
        createdAt: '2024-01-18T14:31:40Z',
      },
    ],
  },
};

export default function ReviewDetailPage() {
  const params = useParams();
  const [review] = useState<ReviewFull>(mockReview);
  const [isLoading] = useState(false);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(
    new Set(Object.keys(mockReview.commentsByFile))
  );

  const toggleFile = (filePath: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(filePath)) {
      newExpanded.delete(filePath);
    } else {
      newExpanded.add(filePath);
    }
    setExpandedFiles(newExpanded);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) {
      return 'N/A';
    }
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  const allComments = Object.values(review.commentsByFile).flat();
  const severityCounts = {
    error: allComments.filter((c) => c.severity === 'error').length,
    warning: allComments.filter((c) => c.severity === 'warning').length,
    suggestion: allComments.filter((c) => c.severity === 'suggestion').length,
    info: allComments.filter((c) => c.severity === 'info').length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-96" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/reviews" className="hover:underline">
              Reviews
            </Link>
            <ChevronRightIcon className="h-4 w-4" />
            <span>Review #{params.id}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            PR #{review.prNumber}: {review.prTitle}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            {review.repository && (
              <Link
                href={`/repositories/${review.repository.id}`}
                className="flex items-center gap-1 hover:underline"
              >
                <FolderIcon className="h-4 w-4" />
                {review.repository.name}
              </Link>
            )}
            <span>by {review.prAuthor}</span>
            <StatusBadge status={review.status} />
          </div>
        </div>
        <div className="flex gap-2">
          <a href={review.prUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <ExternalLinkIcon className="mr-2 h-4 w-4" />
              View on GitHub
            </Button>
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allComments.length}</div>
            <div className="mt-1 flex gap-2 text-xs">
              {severityCounts.error > 0 && (
                <span className="text-red-600">{severityCounts.error} errors</span>
              )}
              {severityCounts.warning > 0 && (
                <span className="text-yellow-600">{severityCounts.warning} warnings</span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Files Reviewed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(review.commentsByFile).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tokens Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTokens(review.tokensUsed)}</div>
            <div className="mt-1 text-xs text-muted-foreground">{review.model}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(review.processingTime)}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Completed {formatDate(review.completedAt)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comments by File */}
      <Card>
        <CardHeader>
          <CardTitle>Review Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(review.commentsByFile).map(([filePath, comments]) => (
            <div key={filePath} className="rounded-lg border">
              <button
                onClick={() => toggleFile(filePath)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-mono text-sm">{filePath}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">
                    {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                  </span>
                </div>
                <ChevronDownIcon
                  className={`h-5 w-5 text-muted-foreground transition-transform ${
                    expandedFiles.has(filePath) ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {expandedFiles.has(filePath) && (
                <div className="border-t">
                  {comments.map((comment) => (
                    <CommentCard key={comment.id} comment={comment} />
                  ))}
                </div>
              )}
            </div>
          ))}

          {Object.keys(review.commentsByFile).length === 0 && (
            <div className="py-8 text-center">
              <CheckIcon className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-lg font-medium">No issues found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The AI review did not find any issues with this pull request.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Technical Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">Head SHA</dt>
              <dd className="font-mono">{review.headSha.substring(0, 7)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Base SHA</dt>
              <dd className="font-mono">{review.baseSha.substring(0, 7)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">AI Provider</dt>
              <dd className="capitalize">{review.aiProvider}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd>{formatDate(review.createdAt)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

// Components
function CommentCard({ comment }: { comment: ReviewComment }) {
  return (
    <div className="border-b p-4 last:border-b-0">
      <div className="mb-2 flex items-start justify-between">
        <div className="flex items-center gap-2">
          <SeverityBadge severity={comment.severity} />
          {comment.category && (
            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-700">
              {comment.category}
            </span>
          )}
        </div>
        {comment.lineStart && (
          <span className="font-mono text-xs text-muted-foreground">
            {comment.lineEnd && comment.lineEnd !== comment.lineStart
              ? `L${comment.lineStart}-${comment.lineEnd}`
              : `L${comment.lineStart}`}
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed">{comment.content}</p>
    </div>
  );
}

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

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    suggestion: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    info: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        styles[severity] || styles.info
      }`}
    >
      {severity}
    </span>
  );
}

// Icons
function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
      />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
