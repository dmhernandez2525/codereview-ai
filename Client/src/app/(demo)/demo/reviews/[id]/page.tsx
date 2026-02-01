'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDemo } from '@/lib/demo';

export default function DemoReviewDetailPage() {
  const params = useParams();
  const { getReviewById } = useDemo();

  const reviewId = Number(params.id);
  const review = getReviewById(reviewId);

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <NotFoundIcon className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold">Review Not Found</h1>
        <p className="text-muted-foreground mt-2">
          The review you are looking for does not exist.
        </p>
        <Link href="/demo/reviews">
          <Button className="mt-6">Back to Reviews</Button>
        </Link>
      </div>
    );
  }

  const files = Object.keys(review.commentsByFile || {});
  const totalComments = files.reduce(
    (acc, file) => acc + (review.commentsByFile?.[file]?.length || 0),
    0
  );

  const commentsByCategory = files.flatMap((file) => review.commentsByFile?.[file] || []).reduce(
    (acc, comment) => {
      const category = comment.category || 'other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const commentsBySeverity = files.flatMap((file) => review.commentsByFile?.[file] || []).reduce(
    (acc, comment) => {
      const severity = comment.severity || 'info';
      acc[severity] = (acc[severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/demo/reviews" className="hover:text-foreground">
          Reviews
        </Link>
        <ChevronRightIcon className="h-4 w-4" />
        <span className="text-foreground font-medium">#{review.prNumber}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <StatusBadge status={review.status} />
            <a
              href={review.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              View on GitHub
              <ExternalLinkIcon className="h-3.5 w-3.5" />
            </a>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{review.prTitle}</h1>
          <p className="text-muted-foreground mt-1">
            {review.repository?.fullName} - PR #{review.prNumber} by {review.prAuthor}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <RefreshIcon className="h-4 w-4 mr-2" />
            Re-run Review
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Files Reviewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{files.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Comments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalComments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tokens Used</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{review.tokensUsed.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Processing Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {review.processingTime ? `${(review.processingTime / 1000).toFixed(1)}s` : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* By severity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Issues by Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(commentsBySeverity).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SeverityDot severity={severity} />
                    <span className="capitalize">{severity}</span>
                  </div>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              {Object.keys(commentsBySeverity).length === 0 && (
                <p className="text-muted-foreground text-sm">No issues found</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* By category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Issues by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(commentsByCategory).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="capitalize">{category.replace('-', ' ')}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              {Object.keys(commentsByCategory).length === 0 && (
                <p className="text-muted-foreground text-sm">No issues found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* File comments */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Review Comments</h2>
        {files.length > 0 ? (
          files.map((filePath) => (
            <Card key={filePath}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-mono flex items-center gap-2">
                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                  {filePath}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({review.commentsByFile?.[filePath]?.length || 0} comment
                    {(review.commentsByFile?.[filePath]?.length || 0) !== 1 ? 's' : ''})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {review.commentsByFile?.[filePath]?.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg border-l-4 ${getSeverityBorderColor(comment.severity)}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <SeverityBadge severity={comment.severity} />
                      <span className="text-xs text-muted-foreground capitalize">
                        {comment.category?.replace('-', ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Lines {comment.lineStart}
                        {comment.lineEnd !== comment.lineStart ? `-${comment.lineEnd}` : ''}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckIcon className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-lg font-medium">No issues found</p>
              <p className="text-muted-foreground">
                {review.status === 'completed'
                  ? 'The AI review did not find any issues in this pull request.'
                  : 'This review is still in progress or has not completed.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// Helper components
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
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
    info: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        styles[severity] || styles.info
      }`}
    >
      {severity}
    </span>
  );
}

function SeverityDot({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    suggestion: 'bg-blue-500',
    info: 'bg-gray-400',
  };

  return <span className={`w-2 h-2 rounded-full ${colors[severity] || colors.info}`} />;
}

function getSeverityBorderColor(severity: string): string {
  const colors: Record<string, string> = {
    error: 'border-red-500 bg-red-50 dark:bg-red-950/30',
    warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
    suggestion: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30',
    info: 'border-gray-300 bg-gray-50 dark:bg-gray-800/30',
  };
  return colors[severity] || colors.info;
}

// Icons
function NotFoundIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
