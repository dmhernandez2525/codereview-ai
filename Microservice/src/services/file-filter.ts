/**
 * File Filter Service
 * Filters files based on glob patterns and configuration
 */

import { minimatch } from 'minimatch';

import type { DiffFile, ParsedDiff } from './diff-parser.js';

export interface FilterConfig {
  include?: string[];
  exclude?: string[];
  maxFileSize?: number; // In bytes (estimated from line count)
  maxFiles?: number;
}

/**
 * Default exclusion patterns for files that typically shouldn't be reviewed.
 */
export const DEFAULT_EXCLUSIONS = [
  // Dependencies
  '**/node_modules/**',
  '**/vendor/**',
  '**/bower_components/**',

  // Build outputs
  '**/dist/**',
  '**/build/**',
  '**/out/**',
  '**/.next/**',
  '**/.nuxt/**',

  // Lock files
  '**/package-lock.json',
  '**/yarn.lock',
  '**/pnpm-lock.yaml',
  '**/Gemfile.lock',
  '**/Cargo.lock',
  '**/poetry.lock',
  '**/composer.lock',

  // Generated files
  '**/*.min.js',
  '**/*.min.css',
  '**/*.map',
  '**/*.d.ts',
  '**/generated/**',
  '**/__generated__/**',

  // IDE/Editor
  '**/.idea/**',
  '**/.vscode/**',
  '**/.vs/**',
  '**/*.swp',
  '**/*.swo',

  // OS files
  '**/.DS_Store',
  '**/Thumbs.db',

  // Test snapshots (usually auto-generated)
  '**/__snapshots__/**',
  '**/*.snap',

  // Documentation
  '**/docs/**/*.md',
  '**/CHANGELOG.md',
  '**/HISTORY.md',

  // Assets (binary files)
  '**/*.png',
  '**/*.jpg',
  '**/*.jpeg',
  '**/*.gif',
  '**/*.ico',
  '**/*.svg',
  '**/*.woff',
  '**/*.woff2',
  '**/*.ttf',
  '**/*.eot',
  '**/*.pdf',
  '**/*.zip',
  '**/*.tar',
  '**/*.gz',
];

/**
 * Checks if a file path matches any of the given patterns.
 */
export function matchesPatterns(filePath: string, patterns: string[]): boolean {
  return patterns.some((pattern) => {
    // Handle negation patterns
    if (pattern.startsWith('!')) {
      return !minimatch(filePath, pattern.substring(1), { dot: true });
    }
    return minimatch(filePath, pattern, { dot: true });
  });
}

/**
 * Filters files based on the provided configuration.
 */
export function filterFiles(diff: ParsedDiff, config: FilterConfig = {}): ParsedDiff {
  const { include = [], exclude = [], maxFileSize, maxFiles } = config;

  // Combine default exclusions with custom exclusions
  const allExclusions = [...DEFAULT_EXCLUSIONS, ...exclude];

  let filteredFiles = diff.files.filter((file) => {
    const filePath = file.newPath;

    // Skip binary files
    if (file.isBinary) {
      return false;
    }

    // Check exclusions first
    if (matchesPatterns(filePath, allExclusions)) {
      return false;
    }

    // If include patterns are specified, file must match at least one
    if (include.length > 0) {
      if (!matchesPatterns(filePath, include)) {
        return false;
      }
    }

    // Check max file size (estimate based on line count)
    if (maxFileSize) {
      const estimatedSize = (file.additions + file.deletions) * 80; // ~80 bytes per line
      if (estimatedSize > maxFileSize) {
        return false;
      }
    }

    return true;
  });

  // Limit number of files if specified
  if (maxFiles && filteredFiles.length > maxFiles) {
    // Sort by importance (prefer files with more changes)
    filteredFiles = filteredFiles
      .sort((a, b) => b.additions + b.deletions - (a.additions + a.deletions))
      .slice(0, maxFiles);
  }

  // Recalculate totals
  const totalAdditions = filteredFiles.reduce((sum, f) => sum + f.additions, 0);
  const totalDeletions = filteredFiles.reduce((sum, f) => sum + f.deletions, 0);

  return {
    files: filteredFiles,
    totalAdditions,
    totalDeletions,
    totalFiles: filteredFiles.length,
  };
}

/**
 * Groups files by their extension or directory.
 */
export function groupFilesByType(files: DiffFile[]): Map<string, DiffFile[]> {
  const groups = new Map<string, DiffFile[]>();

  for (const file of files) {
    const ext = getFileExtension(file.newPath) || 'other';
    const existing = groups.get(ext) ?? [];
    existing.push(file);
    groups.set(ext, existing);
  }

  return groups;
}

/**
 * Gets the file extension from a path.
 */
export function getFileExtension(filePath: string): string | null {
  const match = filePath.match(/\.([^.]+)$/);
  return match && match[1] ? match[1].toLowerCase() : null;
}

/**
 * Gets the programming language based on file extension.
 */
export function getLanguageFromExtension(ext: string | null): string {
  if (!ext) {
    return 'unknown';
  }

  const languageMap: Record<string, string> = {
    // JavaScript/TypeScript
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    mjs: 'javascript',
    cjs: 'javascript',

    // Web
    html: 'html',
    htm: 'html',
    css: 'css',
    scss: 'scss',
    sass: 'sass',
    less: 'less',
    vue: 'vue',
    svelte: 'svelte',

    // Backend
    py: 'python',
    rb: 'ruby',
    php: 'php',
    java: 'java',
    kt: 'kotlin',
    scala: 'scala',
    go: 'go',
    rs: 'rust',
    cs: 'csharp',
    fs: 'fsharp',
    swift: 'swift',

    // Systems
    c: 'c',
    h: 'c',
    cpp: 'cpp',
    cc: 'cpp',
    hpp: 'cpp',

    // Data/Config
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
    xml: 'xml',
    sql: 'sql',

    // Shell
    sh: 'shell',
    bash: 'shell',
    zsh: 'shell',

    // Other
    md: 'markdown',
    txt: 'text',
    dockerfile: 'dockerfile',
  };

  return languageMap[ext] ?? 'unknown';
}

/**
 * Calculates the priority of a file for review.
 * Higher priority files should be reviewed first.
 */
export function calculateFilePriority(file: DiffFile): number {
  let priority = 0;

  // More changes = higher priority
  priority += Math.min(file.additions + file.deletions, 100);

  // Prioritize source files over config/docs
  const ext = getFileExtension(file.newPath);
  const language = getLanguageFromExtension(ext);

  if (['typescript', 'javascript', 'python', 'java', 'go', 'rust'].includes(language)) {
    priority += 50;
  }

  // Prioritize test files slightly less
  if (file.newPath.includes('test') || file.newPath.includes('spec')) {
    priority -= 20;
  }

  // Deprioritize config files
  if (['json', 'yaml', 'toml'].includes(language)) {
    priority -= 30;
  }

  return priority;
}
