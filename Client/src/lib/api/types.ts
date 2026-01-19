/**
 * API Types for CodeReview AI Client
 */

// =========================================================================
// Base Strapi Types
// =========================================================================

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiError {
  error: {
    status: number;
    name: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// =========================================================================
// Organization Types
// =========================================================================

export interface Organization {
  id: number;
  name: string;
  slug: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationDashboard {
  organization: {
    id: number;
    name: string;
    slug: string;
  };
  repositories: {
    total: number;
    active: number;
  };
  reviews: {
    total: number;
    completed: number;
    failed: number;
    pending: number;
    successRate: number;
  };
  usage: {
    monthlyTokens: number;
    monthlyCost: number;
  };
  recentReviews: RecentReview[];
}

export interface OrganizationUsage {
  period: {
    startDate: string;
    endDate: string;
  };
  totals: {
    requests: number;
    tokens: number;
    cost: number;
  };
  byModel: Array<{
    model: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
  byRepository: Array<{
    repository: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
  byDay: Array<{
    date: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

// =========================================================================
// Repository Types
// =========================================================================

export interface Repository {
  id: number;
  name: string;
  fullName: string;
  platform: 'github' | 'gitlab' | 'bitbucket' | 'azure';
  externalId: string;
  defaultBranch: string;
  isActive: boolean;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  organization?: Organization;
}

export interface RepositoryWithStats extends Repository {
  stats: {
    totalReviews: number;
    completedReviews: number;
    lastReviewAt: string | null;
    lastReviewStatus: string | null;
  };
}

export interface RepositoryStats {
  reviews: {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    failed: number;
    skipped: number;
  };
  tokens: {
    total: number;
  };
  comments: {
    total: number;
    info: number;
    suggestion: number;
    warning: number;
    error: number;
  };
}

export interface RepositoryConfig {
  isDefault: boolean;
  config: Configuration | DefaultConfiguration;
}

// =========================================================================
// Review Types
// =========================================================================

export interface Review {
  id: number;
  prNumber: number;
  prTitle: string;
  prUrl: string;
  prAuthor: string;
  headSha: string;
  baseSha: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  aiProvider: string;
  model: string;
  tokensUsed: number;
  processingTime: number;
  errorMessage: string | null;
  metadata: Record<string, unknown>;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  repository?: Repository;
  comments?: ReviewComment[];
}

export interface RecentReview {
  id: number;
  prNumber: number;
  prTitle: string;
  status: string;
  createdAt: string;
  repository: {
    id: number;
    name: string;
  } | null;
}

export interface ReviewComment {
  id: number;
  filePath: string;
  lineStart: number | null;
  lineEnd: number | null;
  content: string;
  severity: 'info' | 'suggestion' | 'warning' | 'error';
  category: string;
  externalId: string | null;
  isPosted: boolean;
  createdAt: string;
}

export interface ReviewFull extends Review {
  commentsByFile: Record<string, ReviewComment[]>;
}

export interface ReviewAnalytics {
  period: {
    startDate: string | null;
    endDate: string | null;
  };
  reviews: {
    total: number;
    pending: number;
    in_progress: number;
    completed: number;
    failed: number;
    skipped: number;
    successRate: number;
  };
  performance: {
    totalTokens: number;
    averageTokens: number;
    averageProcessingTime: number;
  };
  comments: {
    total: number;
    bySeverity: {
      info: number;
      suggestion: number;
      warning: number;
      error: number;
    };
    byCategory: Record<string, number>;
  };
}

export interface ReviewTimeline {
  groupBy: string;
  startDate: string;
  endDate: string;
  timeline: Array<{
    date: string;
    count: number;
    tokens: number;
    completed: number;
  }>;
}

// =========================================================================
// Configuration Types
// =========================================================================

export interface Configuration {
  id: number;
  yamlContent: string;
  parsed: Record<string, unknown>;
  isValid: boolean;
  validationErrors: string | null;
  createdAt: string;
  repository?: Repository;
}

export interface DefaultConfiguration {
  aiProvider: string;
  model: string;
  maxTokens: number;
  reviewOptions: {
    enabled: boolean;
    autoApprove: boolean;
    commentThreshold: string;
    focusAreas: string[];
  };
  fileFilters: {
    include: string[];
    exclude: string[];
  };
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  config: Record<string, unknown> | null;
}
