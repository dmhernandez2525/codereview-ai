'use client';

import { useMemo } from 'react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useDemo } from '@/lib/demo';

export default function DemoAnalyticsPage() {
  const { reviews, repositories, dashboardStats } = useDemo();

  const analytics = useMemo(() => {
    const completedReviews = reviews.filter((r) => r.status === 'completed');
    const totalTokens = completedReviews.reduce((sum, r) => sum + r.tokensUsed, 0);
    const avgTokens = completedReviews.length > 0 ? totalTokens / completedReviews.length : 0;
    const avgProcessingTime =
      completedReviews.length > 0
        ? completedReviews.reduce((sum, r) => sum + (r.processingTime || 0), 0) /
          completedReviews.length
        : 0;

    const reviewsByRepo = repositories.map((repo) => ({
      name: repo.name,
      reviews: reviews.filter((r) => r.repository?.id === repo.id).length,
    }));

    const reviewsByStatus = {
      completed: reviews.filter((r) => r.status === 'completed').length,
      pending: reviews.filter((r) => r.status === 'pending').length,
      in_progress: reviews.filter((r) => r.status === 'in_progress').length,
      failed: reviews.filter((r) => r.status === 'failed').length,
    };

    const reviewsByDay = [
      { day: 'Mon', count: 12 },
      { day: 'Tue', count: 18 },
      { day: 'Wed', count: 15 },
      { day: 'Thu', count: 22 },
      { day: 'Fri', count: 28 },
      { day: 'Sat', count: 8 },
      { day: 'Sun', count: 5 },
    ];

    return {
      totalReviews: reviews.length,
      completedReviews: completedReviews.length,
      totalTokens,
      avgTokens: Math.round(avgTokens),
      avgProcessingTime: avgProcessingTime / 1000,
      reviewsByRepo,
      reviewsByStatus,
      reviewsByDay,
      successRate: reviews.length > 0 ? (completedReviews.length / reviews.length) * 100 : 0,
    };
  }, [reviews, repositories]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track your code review metrics and AI usage across all repositories.
        </p>
      </div>

      {/* Key metrics */}
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

      {/* Charts row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Reviews by status */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews by Status</CardTitle>
            <CardDescription>Distribution of review outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatusBar
                label="Completed"
                value={analytics.reviewsByStatus.completed}
                total={analytics.totalReviews}
                color="bg-green-500"
              />
              <StatusBar
                label="In Progress"
                value={analytics.reviewsByStatus.in_progress}
                total={analytics.totalReviews}
                color="bg-blue-500"
              />
              <StatusBar
                label="Pending"
                value={analytics.reviewsByStatus.pending}
                total={analytics.totalReviews}
                color="bg-yellow-500"
              />
              <StatusBar
                label="Failed"
                value={analytics.reviewsByStatus.failed}
                total={analytics.totalReviews}
                color="bg-red-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Reviews by repository */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews by Repository</CardTitle>
            <CardDescription>Number of reviews per repository</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.reviewsByRepo.map((repo) => (
                <StatusBar
                  key={repo.name}
                  label={repo.name}
                  value={repo.reviews}
                  total={analytics.totalReviews}
                  color="bg-primary"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly activity */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
          <CardDescription>Reviews processed per day this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between h-48 gap-2">
            {analytics.reviewsByDay.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center">
                  <span className="text-sm font-medium mb-1">{day.count}</span>
                  <div
                    className="w-full bg-primary rounded-t transition-all"
                    style={{
                      height: `${(day.count / Math.max(...analytics.reviewsByDay.map((d) => d.count))) * 140}px`,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <CircularProgress value={analytics.successRate} />
              <div>
                <p className="text-2xl font-bold">{analytics.successRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">of reviews completed successfully</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Average Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <CpuIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.avgTokens.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">tokens per review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Avg Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <ClockIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.avgProcessingTime.toFixed(1)}s</p>
                <p className="text-sm text-muted-foreground">per review</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI model usage */}
      <Card>
        <CardHeader>
          <CardTitle>AI Model Usage</CardTitle>
          <CardDescription>Tokens consumed by AI model</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-violet-500" />
                  <span>GPT-4o</span>
                </div>
                <span className="font-medium">{analytics.totalTokens.toLocaleString()} tokens</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Claude 3.5 Sonnet</span>
                </div>
                <span className="font-medium">0 tokens</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span>Gemini Pro</span>
                </div>
                <span className="font-medium">0 tokens</span>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-gray-200 dark:text-gray-700"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-violet-500"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="100, 100"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-medium">100%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper components
function StatusBar({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="text-muted-foreground">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function CircularProgress({ value }: { value: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-16 h-16">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          className="text-gray-200 dark:text-gray-700"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          cx="50"
          cy="50"
          r={radius}
        />
        <circle
          className="text-green-500"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
    </div>
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
