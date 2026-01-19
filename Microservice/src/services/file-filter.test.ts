import { describe, expect, it } from 'vitest';

import type { DiffFile, ParsedDiff } from './diff-parser.js';
import {
  calculateFilePriority,
  DEFAULT_EXCLUSIONS,
  filterFiles,
  getFileExtension,
  getLanguageFromExtension,
  groupFilesByType,
  matchesPatterns,
} from './file-filter.js';

const createDiffFile = (path: string, overrides: Partial<DiffFile> = {}): DiffFile => ({
  oldPath: path,
  newPath: path,
  status: 'modified',
  hunks: [],
  additions: 10,
  deletions: 5,
  isBinary: false,
  ...overrides,
});

const createParsedDiff = (files: DiffFile[]): ParsedDiff => ({
  files,
  totalAdditions: files.reduce((sum, f) => sum + f.additions, 0),
  totalDeletions: files.reduce((sum, f) => sum + f.deletions, 0),
  totalFiles: files.length,
});

describe('file-filter', () => {
  describe('matchesPatterns', () => {
    it('should match a simple glob pattern', () => {
      expect(matchesPatterns('src/index.ts', ['**/*.ts'])).toBe(true);
      expect(matchesPatterns('src/index.js', ['**/*.ts'])).toBe(false);
    });

    it('should match directory patterns', () => {
      expect(matchesPatterns('node_modules/lodash/index.js', ['**/node_modules/**'])).toBe(true);
      expect(matchesPatterns('src/utils.ts', ['**/node_modules/**'])).toBe(false);
    });

    it('should match multiple patterns', () => {
      expect(matchesPatterns('src/index.ts', ['**/*.ts', '**/*.js'])).toBe(true);
      expect(matchesPatterns('src/index.js', ['**/*.ts', '**/*.js'])).toBe(true);
      expect(matchesPatterns('src/index.css', ['**/*.ts', '**/*.js'])).toBe(false);
    });

    it('should handle negation patterns', () => {
      expect(matchesPatterns('src/test.ts', ['!**/*.test.ts'])).toBe(true);
      expect(matchesPatterns('src/index.test.ts', ['!**/*.test.ts'])).toBe(false);
    });

    it('should handle dotfiles', () => {
      expect(matchesPatterns('.gitignore', ['**/.*'])).toBe(true);
      expect(matchesPatterns('src/.env', ['**/.env'])).toBe(true);
    });
  });

  describe('filterFiles', () => {
    it('should exclude binary files', () => {
      const diff = createParsedDiff([
        createDiffFile('src/index.ts'),
        createDiffFile('image.png', { isBinary: true }),
      ]);

      const result = filterFiles(diff);

      expect(result.totalFiles).toBe(1);
      expect(result.files[0]?.newPath).toBe('src/index.ts');
    });

    it('should apply default exclusions', () => {
      const diff = createParsedDiff([
        createDiffFile('src/index.ts'),
        createDiffFile('node_modules/lodash/index.js'),
        createDiffFile('dist/bundle.js'),
        createDiffFile('package-lock.json'),
      ]);

      const result = filterFiles(diff);

      expect(result.totalFiles).toBe(1);
      expect(result.files[0]?.newPath).toBe('src/index.ts');
    });

    it('should apply custom exclusions', () => {
      const diff = createParsedDiff([
        createDiffFile('src/index.ts'),
        createDiffFile('src/generated/types.ts'),
      ]);

      const result = filterFiles(diff, { exclude: ['**/generated/**'] });

      expect(result.totalFiles).toBe(1);
      expect(result.files[0]?.newPath).toBe('src/index.ts');
    });

    it('should apply include filters', () => {
      const diff = createParsedDiff([
        createDiffFile('src/index.ts'),
        createDiffFile('lib/utils.ts'),
        createDiffFile('docs/readme.md'),
      ]);

      const result = filterFiles(diff, { include: ['src/**/*'] });

      expect(result.totalFiles).toBe(1);
      expect(result.files[0]?.newPath).toBe('src/index.ts');
    });

    it('should limit by max file size', () => {
      const diff = createParsedDiff([
        createDiffFile('src/small.ts', { additions: 10, deletions: 5 }),
        createDiffFile('src/large.ts', { additions: 1000, deletions: 500 }),
      ]);

      // 1200 lines * 80 bytes = 96,000 bytes, limit to 50,000
      const result = filterFiles(diff, { maxFileSize: 50000 });

      expect(result.totalFiles).toBe(1);
      expect(result.files[0]?.newPath).toBe('src/small.ts');
    });

    it('should limit by max files', () => {
      const diff = createParsedDiff([
        createDiffFile('src/a.ts', { additions: 100, deletions: 50 }),
        createDiffFile('src/b.ts', { additions: 50, deletions: 25 }),
        createDiffFile('src/c.ts', { additions: 10, deletions: 5 }),
      ]);

      const result = filterFiles(diff, { maxFiles: 2 });

      expect(result.totalFiles).toBe(2);
      // Should keep files with more changes
      expect(result.files.map((f) => f.newPath)).toContain('src/a.ts');
      expect(result.files.map((f) => f.newPath)).toContain('src/b.ts');
    });

    it('should recalculate totals after filtering', () => {
      const diff = createParsedDiff([
        createDiffFile('src/index.ts', { additions: 20, deletions: 10 }),
        createDiffFile('node_modules/pkg/index.js', { additions: 100, deletions: 50 }),
      ]);

      const result = filterFiles(diff);

      expect(result.totalAdditions).toBe(20);
      expect(result.totalDeletions).toBe(10);
    });
  });

  describe('groupFilesByType', () => {
    it('should group files by extension', () => {
      const files = [
        createDiffFile('src/index.ts'),
        createDiffFile('src/utils.ts'),
        createDiffFile('src/styles.css'),
        createDiffFile('src/readme.md'),
      ];

      const groups = groupFilesByType(files);

      expect(groups.get('ts')).toHaveLength(2);
      expect(groups.get('css')).toHaveLength(1);
      expect(groups.get('md')).toHaveLength(1);
    });

    it('should handle files without extension', () => {
      const files = [createDiffFile('Dockerfile'), createDiffFile('Makefile')];

      const groups = groupFilesByType(files);

      expect(groups.get('other')).toHaveLength(2);
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension', () => {
      expect(getFileExtension('src/index.ts')).toBe('ts');
      expect(getFileExtension('src/styles.module.css')).toBe('css');
      expect(getFileExtension('README.MD')).toBe('md');
    });

    it('should return null for files without extension', () => {
      expect(getFileExtension('Dockerfile')).toBeNull();
      expect(getFileExtension('Makefile')).toBeNull();
    });
  });

  describe('getLanguageFromExtension', () => {
    it('should map TypeScript extensions', () => {
      expect(getLanguageFromExtension('ts')).toBe('typescript');
      expect(getLanguageFromExtension('tsx')).toBe('typescript');
    });

    it('should map JavaScript extensions', () => {
      expect(getLanguageFromExtension('js')).toBe('javascript');
      expect(getLanguageFromExtension('jsx')).toBe('javascript');
      expect(getLanguageFromExtension('mjs')).toBe('javascript');
    });

    it('should map other common languages', () => {
      expect(getLanguageFromExtension('py')).toBe('python');
      expect(getLanguageFromExtension('go')).toBe('go');
      expect(getLanguageFromExtension('rs')).toBe('rust');
      expect(getLanguageFromExtension('java')).toBe('java');
    });

    it('should return unknown for unmapped extensions', () => {
      expect(getLanguageFromExtension('xyz')).toBe('unknown');
      expect(getLanguageFromExtension(null)).toBe('unknown');
    });
  });

  describe('calculateFilePriority', () => {
    it('should prioritize files with more changes', () => {
      const smallFile = createDiffFile('src/small.ts', { additions: 5, deletions: 2 });
      const largeFile = createDiffFile('src/large.ts', { additions: 50, deletions: 30 });

      expect(calculateFilePriority(largeFile)).toBeGreaterThan(calculateFilePriority(smallFile));
    });

    it('should prioritize source files over config', () => {
      const sourceFile = createDiffFile('src/index.ts', { additions: 10, deletions: 5 });
      const configFile = createDiffFile('tsconfig.json', { additions: 10, deletions: 5 });

      expect(calculateFilePriority(sourceFile)).toBeGreaterThan(calculateFilePriority(configFile));
    });

    it('should deprioritize test files slightly', () => {
      const sourceFile = createDiffFile('src/utils.ts', { additions: 10, deletions: 5 });
      const testFile = createDiffFile('src/utils.test.ts', { additions: 10, deletions: 5 });

      expect(calculateFilePriority(sourceFile)).toBeGreaterThan(calculateFilePriority(testFile));
    });
  });

  describe('DEFAULT_EXCLUSIONS', () => {
    it('should contain node_modules', () => {
      expect(DEFAULT_EXCLUSIONS).toContain('**/node_modules/**');
    });

    it('should contain common build directories', () => {
      expect(DEFAULT_EXCLUSIONS).toContain('**/dist/**');
      expect(DEFAULT_EXCLUSIONS).toContain('**/build/**');
      expect(DEFAULT_EXCLUSIONS).toContain('**/.next/**');
    });

    it('should contain lock files', () => {
      expect(DEFAULT_EXCLUSIONS).toContain('**/package-lock.json');
      expect(DEFAULT_EXCLUSIONS).toContain('**/yarn.lock');
      expect(DEFAULT_EXCLUSIONS).toContain('**/pnpm-lock.yaml');
    });

    it('should contain binary/asset files', () => {
      expect(DEFAULT_EXCLUSIONS).toContain('**/*.png');
      expect(DEFAULT_EXCLUSIONS).toContain('**/*.jpg');
      expect(DEFAULT_EXCLUSIONS).toContain('**/*.pdf');
    });
  });
});
