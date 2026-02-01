'use client';

import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDemo } from '@/lib/demo';

export default function DemoDashboardPage() {
  const { user, dashboardStats, recentReviews } = useDemo();

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user.username}</h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your code reviews.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              {stat.trend === 'up' ? (
                <TrendUpIcon className="h-4 w-4 text-green-500" />
              ) : (
                <TrendDownIcon className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent reviews table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium text-muted-foreground">
                  <th className="pb-3 pr-4">Repository</th>
                  <th className="pb-3 pr-4">Pull Request</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Comments</th>
                  <th className="pb-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentReviews.map((review) => (
                  <tr key={review.id} className="text-sm">
                    <td className="py-3 pr-4 font-medium">{review.repository}</td>
                    <td className="py-3 pr-4">
                      <Link
                        href={`/demo/reviews/${review.id}`}
                        className="hover:underline hover:text-primary"
                      >
                        <span className="text-muted-foreground">#{review.prNumber}</span>{' '}
                        {review.prTitle}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={review.status} />
                    </td>
                    <td className="py-3 pr-4">{review.commentsCount}</td>
                    <td className="py-3 text-muted-foreground">{review.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/demo/repositories">
          <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <PlusIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Connect Repository</h3>
                <p className="text-sm text-muted-foreground">Add a new repository for AI reviews</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/demo/settings">
          <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <KeyIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Manage API Keys</h3>
                <p className="text-sm text-muted-foreground">Add or update your AI provider keys</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <DocumentIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">View Documentation</h3>
              <p className="text-sm text-muted-foreground">Learn how to configure reviews</p>
            </div>
          </CardContent>
        </Card>
      </div>
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
function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  );
}

function TrendDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
      />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
      />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
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
