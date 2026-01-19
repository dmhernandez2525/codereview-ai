export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    redis: 'connected' | 'disconnected';
    strapi: 'connected' | 'disconnected';
  };
}

export interface ReviewRequest {
  repositoryId: string;
  pullRequestId: string;
  provider: 'github' | 'gitlab' | 'bitbucket' | 'azure';
  diff: string;
  config?: ReviewConfig;
}

export interface ReviewConfig {
  language?: string;
  profile?: 'thorough' | 'balanced' | 'quick';
  aiProvider?: 'openai' | 'anthropic' | 'gemini' | 'ollama';
  aiModel?: string;
  pathFilters?: string[];
  guidelines?: string[];
}

export interface ReviewComment {
  file: string;
  line: number;
  severity: 'critical' | 'major' | 'minor' | 'info';
  category: 'bug' | 'security' | 'performance' | 'style' | 'suggestion' | 'praise';
  message: string;
  suggestedFix?: string;
}

export interface ReviewResult {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  summary?: string;
  comments: ReviewComment[];
  tokenCount: number;
  cost: number;
  duration: number;
  createdAt: string;
  completedAt?: string;
}

// =========================================================================
// Queue Job Types
// =========================================================================

export interface ReviewJobData {
  repositoryId: number;
  prNumber: number;
  prTitle: string;
  prUrl: string;
  prAuthor: string;
  headSha: string;
  baseSha: string;
  diff: string;
  platform: 'github' | 'gitlab' | 'bitbucket' | 'azure';
  config?: ReviewConfig;
  priority?: number;
}

export interface ReviewJobResult {
  reviewId: number;
  status: 'completed' | 'failed' | 'skipped';
  commentsCreated: number;
  tokensUsed: number;
  processingTime: number;
  errorMessage?: string;
}

// =========================================================================
// Strapi Types
// =========================================================================

export interface StrapiResponse<T> {
  data: {
    id: number;
    attributes: T;
  };
  meta: Record<string, unknown>;
}

export interface StrapiCollectionResponse<T> {
  data: Array<{
    id: number;
    attributes: T;
  }>;
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface Organization {
  name: string;
  slug: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Repository {
  name: string;
  fullName: string;
  platform: 'github' | 'gitlab' | 'bitbucket' | 'azure';
  externalId: string;
  defaultBranch: string;
  webhookId?: string;
  webhookSecret?: string;
  isActive: boolean;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  prNumber: number;
  prTitle?: string;
  prUrl?: string;
  prAuthor?: string;
  headSha?: string;
  baseSha?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  aiProvider?: string;
  model?: string;
  tokensUsed: number;
  processingTime?: number;
  errorMessage?: string;
  metadata: Record<string, unknown>;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  repository?: { data: { id: number } };
}

// Strapi ReviewComment (different from local ReviewComment interface)
export interface StrapiReviewComment {
  filePath: string;
  lineStart?: number;
  lineEnd?: number;
  content: string;
  severity?: 'info' | 'suggestion' | 'warning' | 'error';
  category?: string;
  externalId?: string;
  isPosted: boolean;
  createdAt: string;
  updatedAt: string;
  review?: { data: { id: number } };
}

export interface Configuration {
  yamlContent: string;
  parsed: Record<string, unknown>;
  version: string;
  sha?: string;
  isValid: boolean;
  validationErrors?: Array<{ message: string; path: string }>;
  createdAt: string;
  updatedAt: string;
  repository?: { data: { id: number } };
}

export interface UsageLog {
  provider: string;
  model: string;
  tokensInput: number;
  tokensOutput: number;
  costEstimate?: number;
  requestType?: string;
  createdAt: string;
  organization?: { data: { id: number } };
  repository?: { data: { id: number } };
  review?: { data: { id: number } };
}
