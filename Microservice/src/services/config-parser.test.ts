import { describe, expect, it } from 'vitest';

import {
  DEFAULT_CONFIG,
  DEFAULT_EXCLUSIONS,
  getDefaultConfig,
  mergeWithDefaults,
  parseConfig,
  toReviewConfig,
  validateConfig,
} from './config-parser.js';

describe('config-parser', () => {
  describe('parseConfig', () => {
    it('should parse a valid minimal config', () => {
      const yaml = `
version: "1.0"
language: en
`;
      const result = parseConfig(yaml);
      expect(result.success).toBe(true);
      expect(result.config).toBeDefined();
      expect(result.config?.version).toBe('1.0');
      expect(result.config?.language).toBe('en');
    });

    it('should parse a complete config with all options', () => {
      const yaml = `
version: "2.0"
language: es
reviews:
  profile: thorough
  auto_review: false
  review_drafts: true
  summary: false
  request_changes: true
ai:
  provider: anthropic
  model: claude-3
  temperature: 0.5
  max_tokens_per_file: 8000
path_filters:
  include:
    - "src/**/*"
    - "lib/**/*"
  exclude:
    - "**/*.test.ts"
path_instructions:
  - pattern: "*.tsx"
    instructions: "Focus on React best practices"
guidelines:
  - "Use TypeScript strict mode"
  - "Prefer functional components"
checks:
  forbidden_patterns:
    - pattern: "console.log"
      message: "Use logger instead"
      severity: warning
  require_explicit_return_types: true
  max_function_length: 50
labels:
  auto_approve:
    - "trivial"
  needs_review:
    - "security"
`;
      const result = parseConfig(yaml);
      expect(result.success).toBe(true);
      expect(result.config).toBeDefined();
      expect(result.config?.version).toBe('2.0');
      expect(result.config?.language).toBe('es');
      expect(result.config?.reviews.profile).toBe('thorough');
      expect(result.config?.reviews.auto_review).toBe(false);
      expect(result.config?.ai.provider).toBe('anthropic');
      expect(result.config?.ai.model).toBe('claude-3');
      expect(result.config?.ai.temperature).toBe(0.5);
      expect(result.config?.path_filters.include).toContain('src/**/*');
      expect(result.config?.path_instructions).toHaveLength(1);
      expect(result.config?.guidelines).toHaveLength(2);
      expect(result.config?.checks.forbidden_patterns).toHaveLength(1);
      expect(result.config?.labels.auto_approve).toContain('trivial');
    });

    it('should apply default values for missing fields', () => {
      const yaml = `
language: fr
`;
      const result = parseConfig(yaml);
      expect(result.success).toBe(true);
      expect(result.config?.version).toBe('1.0');
      expect(result.config?.reviews.profile).toBe('balanced');
      expect(result.config?.ai.provider).toBe('openai');
      expect(result.config?.ai.temperature).toBe(0.3);
    });

    it('should merge default exclusions with user exclusions', () => {
      const yaml = `
path_filters:
  exclude:
    - "custom/**"
`;
      const result = parseConfig(yaml);
      expect(result.success).toBe(true);
      expect(result.config?.path_filters.exclude).toContain('custom/**');
      expect(result.config?.path_filters.exclude).toContain('**/node_modules/**');
      expect(result.config?.path_filters.exclude).toContain('**/package-lock.json');
    });

    it('should fail on invalid YAML syntax', () => {
      const yaml = `
version: [invalid
`;
      const result = parseConfig(yaml);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]?.message).toContain('YAML parse error');
    });

    it('should fail on invalid config values', () => {
      const yaml = `
reviews:
  profile: invalid_profile
`;
      const result = parseConfig(yaml);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.some((e) => e.path.includes('profile'))).toBe(true);
    });

    it('should fail on invalid temperature range', () => {
      const yaml = `
ai:
  temperature: 2.0
`;
      const result = parseConfig(yaml);
      expect(result.success).toBe(false);
      expect(result.errors?.some((e) => e.path.includes('temperature'))).toBe(true);
    });

    it('should fail when YAML is not an object', () => {
      const result = parseConfig('just a string');
      expect(result.success).toBe(false);
      expect(result.errors?.[0]?.message).toContain('expected an object');
    });

    it('should handle empty YAML', () => {
      const result = parseConfig('');
      expect(result.success).toBe(false);
    });
  });

  describe('getDefaultConfig', () => {
    it('should return a copy of DEFAULT_CONFIG', () => {
      const config = getDefaultConfig();
      expect(config).toEqual(DEFAULT_CONFIG);
      // Ensure it's a copy, not the same reference
      config.language = 'changed';
      expect(DEFAULT_CONFIG.language).toBe('en');
    });
  });

  describe('mergeWithDefaults', () => {
    it('should merge partial config with defaults', () => {
      const partial = {
        language: 'de',
        reviews: { profile: 'quick' as const },
      };
      const merged = mergeWithDefaults(partial);
      expect(merged.language).toBe('de');
      expect(merged.reviews.profile).toBe('quick');
      expect(merged.reviews.auto_review).toBe(true); // Default value
      expect(merged.ai.provider).toBe('openai'); // Default value
    });

    it('should include default exclusions in path_filters', () => {
      const partial = {
        path_filters: {
          exclude: ['custom/**'],
        },
      };
      const merged = mergeWithDefaults(partial);
      expect(merged.path_filters.exclude).toContain('custom/**');
      expect(merged.path_filters.exclude).toContain('**/node_modules/**');
    });
  });

  describe('validateConfig', () => {
    it('should validate a valid config object', () => {
      const config = {
        version: '1.0',
        language: 'en',
        reviews: {
          profile: 'balanced',
          auto_review: true,
        },
      };
      const result = validateConfig(config);
      expect(result.success).toBe(true);
    });

    it('should fail on invalid config object', () => {
      const config = {
        reviews: {
          profile: 'invalid',
        },
      };
      const result = validateConfig(config);
      expect(result.success).toBe(false);
    });
  });

  describe('toReviewConfig', () => {
    it('should convert YAML config to review config', () => {
      const yamlConfig = {
        ...DEFAULT_CONFIG,
        language: 'en',
        reviews: { ...DEFAULT_CONFIG.reviews, profile: 'thorough' as const },
        ai: { ...DEFAULT_CONFIG.ai, provider: 'anthropic' as const, model: 'claude-3' },
        guidelines: ['Custom guideline'],
      };
      const reviewConfig = toReviewConfig(yamlConfig);
      expect(reviewConfig.language).toBe('en');
      expect(reviewConfig.profile).toBe('thorough');
      expect(reviewConfig.aiProvider).toBe('anthropic');
      expect(reviewConfig.aiModel).toBe('claude-3');
      expect(reviewConfig.guidelines).toContain('Custom guideline');
    });
  });

  describe('DEFAULT_EXCLUSIONS', () => {
    it('should contain common exclusion patterns', () => {
      expect(DEFAULT_EXCLUSIONS).toContain('**/node_modules/**');
      expect(DEFAULT_EXCLUSIONS).toContain('**/dist/**');
      expect(DEFAULT_EXCLUSIONS).toContain('**/package-lock.json');
      expect(DEFAULT_EXCLUSIONS).toContain('**/*.min.js');
    });
  });
});
