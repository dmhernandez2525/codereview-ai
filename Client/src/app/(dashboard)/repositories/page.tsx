'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type RepositoryWithStats } from '@/lib/api';

// Mock data for demonstration (will be replaced with real API calls)
const mockRepositories: RepositoryWithStats[] = [
  {
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
    stats: {
      totalReviews: 48,
      completedReviews: 45,
      lastReviewAt: '2024-01-18T14:30:00Z',
      lastReviewStatus: 'completed',
    },
  },
  {
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
    fullName: 'myorg/mobile-app',
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
    name: 'shared-components',
    fullName: 'myorg/shared-components',
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

export default function RepositoriesPage() {
  const [repositories] = useState<RepositoryWithStats[]>(mockRepositories);
  const [isLoading] = useState(false);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);

  const formatDate = (dateString: string | null) => {
    if (!dateString) {
      return 'Never';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleToggle = (id: number) => {
    // TODO: Implement toggle functionality with API
    void id;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">
            Manage your connected repositories and their review settings.
          </p>
        </div>
        <Dialog open={connectDialogOpen} onOpenChange={setConnectDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Connect Repository
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect a Repository</DialogTitle>
              <DialogDescription>
                Connect a GitHub repository to enable AI-powered code reviews.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                To connect a new repository, you&apos;ll need to install the CodeReview AI GitHub
                App on your repository. This will allow us to receive webhook events and post review
                comments.
              </p>
              <Button className="w-full" onClick={() => setConnectDialogOpen(false)}>
                <GitHubIcon className="mr-2 h-4 w-4" />
                Install GitHub App
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Repositories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{repositories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {repositories.filter((r) => r.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {repositories.reduce((sum, r) => sum + r.stats.totalReviews, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                (repositories.reduce((sum, r) => sum + r.stats.completedReviews, 0) /
                  Math.max(
                    1,
                    repositories.reduce((sum, r) => sum + r.stats.totalReviews, 0)
                  )) *
                  100
              )}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Repositories table */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Repositories</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Repository</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead>Last Review</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repositories.map((repo) => (
                <TableRow key={repo.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        <FolderIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <Link
                          href={`/repositories/${repo.id}`}
                          className="font-medium hover:underline"
                        >
                          {repo.name}
                        </Link>
                        <div className="text-sm text-muted-foreground">{repo.fullName}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={repo.platform} />
                      <span className="capitalize">{repo.platform}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge active={repo.isActive} />
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{repo.stats.completedReviews}</span>
                      <span className="text-muted-foreground"> / {repo.stats.totalReviews}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm">{formatDate(repo.stats.lastReviewAt)}</div>
                      {repo.stats.lastReviewStatus && (
                        <ReviewStatusBadge status={repo.stats.lastReviewStatus} />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(repo.id)}
                        title={repo.isActive ? 'Disable reviews' : 'Enable reviews'}
                      >
                        {repo.isActive ? (
                          <PauseIcon className="h-4 w-4" />
                        ) : (
                          <PlayIcon className="h-4 w-4" />
                        )}
                      </Button>
                      <Link href={`/repositories/${repo.id}`}>
                        <Button variant="ghost" size="sm">
                          <SettingsIcon className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {repositories.length === 0 && (
            <div className="py-12 text-center">
              <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No repositories connected</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Connect your first repository to start getting AI-powered code reviews.
              </p>
              <Button className="mt-4" onClick={() => setConnectDialogOpen(true)}>
                Connect Repository
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Components
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      }`}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function ReviewStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'text-green-600 dark:text-green-400',
    pending: 'text-yellow-600 dark:text-yellow-400',
    in_progress: 'text-blue-600 dark:text-blue-400',
    failed: 'text-red-600 dark:text-red-400',
    skipped: 'text-gray-600 dark:text-gray-400',
  };

  return (
    <span className={`text-xs ${styles[status] || styles.pending}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  if (platform === 'github') {
    return <GitHubIcon className="h-4 w-4" />;
  }
  return <CodeIcon className="h-4 w-4" />;
}

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
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

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}
