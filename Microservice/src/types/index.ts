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
