/**
 * TypeScript interface for the .codereview.yaml configuration.
 */
export interface CodeReviewConfig {
  version?: string;
  enabled?: boolean;

  ai?: {
    provider?: 'openai' | 'anthropic' | 'gemini';
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };

  review?: {
    autoReview?: boolean;
    minApprovals?: number;
    requireAllChecks?: boolean;
    labels?: {
      approved?: string;
      changesRequested?: string;
      pending?: string;
    };
  };

  filters?: {
    include?: string[];
    exclude?: string[];
    maxFileSize?: number;
    maxFiles?: number;
  };

  rules?: {
    severity?: 'critical' | 'major' | 'minor' | 'info';
    categories?: Array<'bug' | 'security' | 'performance' | 'style' | 'suggestion'>;
    customRules?: Array<{
      name: string;
      pattern?: string;
      message: string;
      severity?: 'critical' | 'major' | 'minor' | 'info';
    }>;
  };

  guidelines?: string[];

  language?: {
    primary?: string;
    responseLanguage?: string;
  };

  pathConfig?: Array<{
    path: string;
    guidelines?: string[];
    ignore?: boolean;
    rules?: {
      severity?: 'critical' | 'major' | 'minor' | 'info';
      categories?: Array<'bug' | 'security' | 'performance' | 'style' | 'suggestion'>;
    };
  }>;
}

/**
 * JSON Schema for validating .codereview.yaml configuration.
 * Using plain object type instead of JSONSchemaType for compatibility.
 */
export const codeReviewConfigSchema = {
  type: 'object',
  properties: {
    version: { type: 'string' },
    enabled: { type: 'boolean' },

    ai: {
      type: 'object',
      properties: {
        provider: {
          type: 'string',
          enum: ['openai', 'anthropic', 'gemini'],
        },
        model: { type: 'string' },
        temperature: { type: 'number', minimum: 0, maximum: 2 },
        maxTokens: { type: 'integer', minimum: 100, maximum: 128000 },
      },
      additionalProperties: false,
    },

    review: {
      type: 'object',
      properties: {
        autoReview: { type: 'boolean' },
        minApprovals: { type: 'integer', minimum: 0 },
        requireAllChecks: { type: 'boolean' },
        labels: {
          type: 'object',
          properties: {
            approved: { type: 'string' },
            changesRequested: { type: 'string' },
            pending: { type: 'string' },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },

    filters: {
      type: 'object',
      properties: {
        include: { type: 'array', items: { type: 'string' } },
        exclude: { type: 'array', items: { type: 'string' } },
        maxFileSize: { type: 'integer', minimum: 1 },
        maxFiles: { type: 'integer', minimum: 1 },
      },
      additionalProperties: false,
    },

    rules: {
      type: 'object',
      properties: {
        severity: {
          type: 'string',
          enum: ['critical', 'major', 'minor', 'info'],
        },
        categories: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['bug', 'security', 'performance', 'style', 'suggestion'],
          },
        },
        customRules: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              pattern: { type: 'string' },
              message: { type: 'string' },
              severity: {
                type: 'string',
                enum: ['critical', 'major', 'minor', 'info'],
              },
            },
            required: ['name', 'message'],
            additionalProperties: false,
          },
        },
      },
      additionalProperties: false,
    },

    guidelines: {
      type: 'array',
      items: { type: 'string' },
    },

    language: {
      type: 'object',
      properties: {
        primary: { type: 'string' },
        responseLanguage: { type: 'string' },
      },
      additionalProperties: false,
    },

    pathConfig: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          path: { type: 'string' },
          guidelines: {
            type: 'array',
            items: { type: 'string' },
          },
          ignore: { type: 'boolean' },
          rules: {
            type: 'object',
            properties: {
              severity: {
                type: 'string',
                enum: ['critical', 'major', 'minor', 'info'],
              },
              categories: {
                type: 'array',
                items: {
                  type: 'string',
                  enum: ['bug', 'security', 'performance', 'style', 'suggestion'],
                },
              },
            },
            additionalProperties: false,
          },
        },
        required: ['path'],
        additionalProperties: false,
      },
    },
  },
  additionalProperties: false,
} as const;

/**
 * Default configuration values.
 */
export const defaultConfig: CodeReviewConfig = {
  version: '1.0',
  enabled: true,
  ai: {
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.3,
    maxTokens: 4000,
  },
  review: {
    autoReview: true,
    minApprovals: 0,
    requireAllChecks: false,
    labels: {
      approved: 'ai-approved',
      changesRequested: 'ai-changes-requested',
      pending: 'ai-review-pending',
    },
  },
  filters: {
    include: ['**/*'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.min.js',
      '**/*.lock',
      '**/package-lock.json',
      '**/yarn.lock',
    ],
    maxFileSize: 100000, // 100KB
    maxFiles: 100,
  },
  rules: {
    severity: 'minor',
    categories: ['bug', 'security', 'performance', 'style', 'suggestion'],
  },
  guidelines: [],
  language: {
    primary: 'auto',
    responseLanguage: 'en',
  },
  pathConfig: [],
};
