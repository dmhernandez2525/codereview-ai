import { parse as parseYaml } from 'yaml';
import { z } from 'zod';

import { logger } from '../utils/logger.js';

/**
 * Schema for .codereview.yaml configuration file
 */
const PathInstructionSchema = z.object({
  pattern: z.string(),
  instructions: z.string(),
});

// Define sub-schemas with explicit defaults
const ReviewsSchema = z.object({
  profile: z.enum(['thorough', 'balanced', 'quick']).default('balanced'),
  auto_review: z.boolean().default(true),
  review_drafts: z.boolean().default(false),
  summary: z.boolean().default(true),
  request_changes: z.boolean().default(false),
});

const AISchema = z.object({
  provider: z.enum(['openai', 'anthropic', 'gemini', 'ollama']).default('openai'),
  model: z.string().optional(),
  temperature: z.number().min(0).max(1).default(0.3),
  max_tokens_per_file: z.number().default(4000),
});

const PathFiltersSchema = z.object({
  include: z.array(z.string()).default(['**/*']),
  exclude: z.array(z.string()).default([]),
});

const ForbiddenPatternSchema = z.object({
  pattern: z.string(),
  message: z.string(),
  severity: z.enum(['error', 'warning', 'info']).default('warning'),
});

const ChecksSchema = z.object({
  forbidden_patterns: z.array(ForbiddenPatternSchema).default([]),
  require_explicit_return_types: z.boolean().default(false),
  max_function_length: z.number().optional(),
  max_file_length: z.number().optional(),
});

const LabelsSchema = z.object({
  auto_approve: z.array(z.string()).default([]),
  needs_review: z.array(z.string()).default([]),
});

const ReviewConfigSchema = z.object({
  version: z.string().default('1.0'),

  // Language settings
  language: z.string().default('en'),

  // Review profile
  reviews: ReviewsSchema.default({
    profile: 'balanced',
    auto_review: true,
    review_drafts: false,
    summary: true,
    request_changes: false,
  }),

  // AI provider settings
  ai: AISchema.default({
    provider: 'openai',
    temperature: 0.3,
    max_tokens_per_file: 4000,
  }),

  // Path filtering
  path_filters: PathFiltersSchema.default({
    include: ['**/*'],
    exclude: [],
  }),

  // Path-specific instructions
  path_instructions: z.array(PathInstructionSchema).default([]),

  // Custom guidelines
  guidelines: z.array(z.string()).default([]),

  // Automated checks
  checks: ChecksSchema.default({
    forbidden_patterns: [],
    require_explicit_return_types: false,
  }),

  // Labels to apply based on review
  labels: LabelsSchema.default({
    auto_approve: [],
    needs_review: [],
  }),
});

export type ReviewConfigYaml = z.infer<typeof ReviewConfigSchema>;

export interface ConfigParseResult {
  success: boolean;
  config?: ReviewConfigYaml;
  errors?: Array<{
    path: string;
    message: string;
  }>;
  rawYaml?: string;
}

/**
 * Default configuration when no .codereview.yaml is found
 */
export const DEFAULT_CONFIG: ReviewConfigYaml = {
  version: '1.0',
  language: 'en',
  reviews: {
    profile: 'balanced',
    auto_review: true,
    review_drafts: false,
    summary: true,
    request_changes: false,
  },
  ai: {
    provider: 'openai',
    model: undefined,
    temperature: 0.3,
    max_tokens_per_file: 4000,
  },
  path_filters: {
    include: ['**/*'],
    exclude: [],
  },
  path_instructions: [],
  guidelines: [],
  checks: {
    forbidden_patterns: [],
    require_explicit_return_types: false,
    max_function_length: undefined,
    max_file_length: undefined,
  },
  labels: {
    auto_approve: [],
    needs_review: [],
  },
};

/**
 * Default file exclusions applied on top of user config
 */
export const DEFAULT_EXCLUSIONS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/coverage/**',
  '**/vendor/**',
  '**/*.min.js',
  '**/*.min.css',
  '**/package-lock.json',
  '**/yarn.lock',
  '**/pnpm-lock.yaml',
  '**/*.lock',
  '**/*.generated.*',
  '**/__generated__/**',
  '**/migrations/**',
  '**/*.snap',
];

/**
 * Parses and validates a .codereview.yaml configuration string
 */
export function parseConfig(yamlContent: string): ConfigParseResult {
  try {
    const parsed: unknown = parseYaml(yamlContent);

    if (!parsed || typeof parsed !== 'object') {
      return {
        success: false,
        errors: [{ path: '', message: 'Invalid YAML: expected an object' }],
        rawYaml: yamlContent,
      };
    }

    const result = ReviewConfigSchema.safeParse(parsed);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));

      logger.warn({ errors }, 'Config validation failed');

      return {
        success: false,
        errors,
        rawYaml: yamlContent,
      };
    }

    // Merge default exclusions with user exclusions
    const config = result.data;
    config.path_filters.exclude = [
      ...new Set([...DEFAULT_EXCLUSIONS, ...config.path_filters.exclude]),
    ];

    logger.debug({ config }, 'Parsed codereview config');

    return {
      success: true,
      config,
      rawYaml: yamlContent,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown parsing error';
    logger.error({ error }, 'Failed to parse YAML config');

    return {
      success: false,
      errors: [{ path: '', message: `YAML parse error: ${message}` }],
      rawYaml: yamlContent,
    };
  }
}

/**
 * Creates a config from default values
 */
export function getDefaultConfig(): ReviewConfigYaml {
  return { ...DEFAULT_CONFIG };
}

/**
 * Merges user config with defaults
 */
export function mergeWithDefaults(partial: Partial<ReviewConfigYaml>): ReviewConfigYaml {
  return {
    ...DEFAULT_CONFIG,
    ...partial,
    reviews: { ...DEFAULT_CONFIG.reviews, ...(partial.reviews ?? {}) },
    ai: { ...DEFAULT_CONFIG.ai, ...(partial.ai ?? {}) },
    path_filters: {
      include: partial.path_filters?.include ?? DEFAULT_CONFIG.path_filters.include,
      exclude: [
        ...new Set([
          ...DEFAULT_EXCLUSIONS,
          ...(partial.path_filters?.exclude ?? DEFAULT_CONFIG.path_filters.exclude),
        ]),
      ],
    },
    path_instructions: partial.path_instructions ?? DEFAULT_CONFIG.path_instructions,
    guidelines: partial.guidelines ?? DEFAULT_CONFIG.guidelines,
    checks: { ...DEFAULT_CONFIG.checks, ...(partial.checks ?? {}) },
    labels: { ...DEFAULT_CONFIG.labels, ...(partial.labels ?? {}) },
  };
}

/**
 * Validates config without parsing (for pre-loaded objects)
 */
export function validateConfig(config: unknown): ConfigParseResult {
  const result = ReviewConfigSchema.safeParse(config);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    };
  }

  return {
    success: true,
    config: result.data,
  };
}

/**
 * Converts parsed YAML config to ReviewConfig type used in review service
 */
export function toReviewConfig(yamlConfig: ReviewConfigYaml) {
  return {
    language: yamlConfig.language,
    profile: yamlConfig.reviews.profile,
    aiProvider: yamlConfig.ai.provider,
    aiModel: yamlConfig.ai.model,
    pathFilters: yamlConfig.path_filters.exclude,
    guidelines: yamlConfig.guidelines,
  };
}
