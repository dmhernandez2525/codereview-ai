import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import YAML from 'yaml';

import { codeReviewConfigSchema, defaultConfig } from './config-schema';

import type { CodeReviewConfig } from './config-schema';

// Initialize AJV with all errors reporting
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false, // Allow additional keywords
});
addFormats(ajv);

// Compile the schema
const validateSchema = ajv.compile(codeReviewConfigSchema);

export interface ValidationError {
  path: string;
  message: string;
  keyword: string;
  params?: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  parsed?: CodeReviewConfig;
  merged?: CodeReviewConfig;
}

/**
 * Parses YAML content and validates it against the schema.
 */
export function validateYamlConfig(yamlContent: string): ValidationResult {
  const errors: ValidationError[] = [];

  // Parse YAML
  let parsed: unknown;
  try {
    parsed = YAML.parse(yamlContent);
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          path: '',
          message: error instanceof Error ? error.message : 'Invalid YAML syntax',
          keyword: 'yaml-parse',
        },
      ],
    };
  }

  // Handle empty YAML
  if (parsed === null || parsed === undefined) {
    return {
      valid: true,
      errors: [],
      parsed: {},
      merged: { ...defaultConfig },
    };
  }

  // Validate against schema
  const valid = validateSchema(parsed);

  if (!valid && validateSchema.errors) {
    for (const error of validateSchema.errors) {
      errors.push({
        path: error.instancePath || '/',
        message: error.message || 'Validation error',
        keyword: error.keyword,
        params: error.params as Record<string, unknown>,
      });
    }

    return {
      valid: false,
      errors,
      parsed: parsed as CodeReviewConfig,
    };
  }

  // Merge with defaults
  const merged = mergeWithDefaults(parsed as CodeReviewConfig);

  return {
    valid: true,
    errors: [],
    parsed: parsed as CodeReviewConfig,
    merged,
  };
}

/**
 * Deep merges user config with defaults.
 */
function mergeWithDefaults(userConfig: CodeReviewConfig): CodeReviewConfig {
  return {
    version: userConfig.version ?? defaultConfig.version,
    enabled: userConfig.enabled ?? defaultConfig.enabled,
    ai: {
      ...defaultConfig.ai,
      ...userConfig.ai,
    },
    review: {
      ...defaultConfig.review,
      ...userConfig.review,
      labels: {
        ...defaultConfig.review?.labels,
        ...userConfig.review?.labels,
      },
    },
    filters: {
      ...defaultConfig.filters,
      ...userConfig.filters,
      // For arrays, user config replaces defaults if provided
      include: userConfig.filters?.include ?? defaultConfig.filters?.include,
      exclude: userConfig.filters?.exclude ?? defaultConfig.filters?.exclude,
    },
    rules: {
      ...defaultConfig.rules,
      ...userConfig.rules,
      categories: userConfig.rules?.categories ?? defaultConfig.rules?.categories,
      customRules: userConfig.rules?.customRules ?? [],
    },
    guidelines: userConfig.guidelines ?? defaultConfig.guidelines,
    language: {
      ...defaultConfig.language,
      ...userConfig.language,
    },
    pathConfig: userConfig.pathConfig ?? defaultConfig.pathConfig,
  };
}

/**
 * Validates a JSON config object directly.
 */
export function validateJsonConfig(config: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (config === null || config === undefined) {
    return {
      valid: true,
      errors: [],
      parsed: {},
      merged: { ...defaultConfig },
    };
  }

  const valid = validateSchema(config);

  if (!valid && validateSchema.errors) {
    for (const error of validateSchema.errors) {
      errors.push({
        path: error.instancePath || '/',
        message: error.message || 'Validation error',
        keyword: error.keyword,
        params: error.params as Record<string, unknown>,
      });
    }

    return {
      valid: false,
      errors,
      parsed: config as CodeReviewConfig,
    };
  }

  const merged = mergeWithDefaults(config as CodeReviewConfig);

  return {
    valid: true,
    errors: [],
    parsed: config as CodeReviewConfig,
    merged,
  };
}

/**
 * Gets the default configuration.
 */
export function getDefaultConfig(): CodeReviewConfig {
  return { ...defaultConfig };
}

/**
 * Merges multiple configurations with inheritance.
 * Order: organization defaults → repository config → PR overrides
 */
export function mergeConfigs(
  ...configs: Array<CodeReviewConfig | null | undefined>
): CodeReviewConfig {
  let result = { ...defaultConfig };

  for (const config of configs) {
    if (config) {
      result = mergeWithDefaults({ ...result, ...config });
    }
  }

  return result;
}
