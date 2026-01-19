/**
 * Services Index
 * Exports all service modules
 */

// Diff parsing and processing
export { parseDiff, reconstructFileDiff, extractChangedLines } from './diff-parser.js';
export type { DiffFile, DiffHunk, DiffChange, ParsedDiff } from './diff-parser.js';

// File filtering
export {
  filterFiles,
  matchesPatterns,
  groupFilesByType,
  getFileExtension,
  getLanguageFromExtension,
  calculateFilePriority,
  DEFAULT_EXCLUSIONS,
} from './file-filter.js';
export type { FilterConfig } from './file-filter.js';

// Diff chunking
export {
  chunkDiff,
  estimateTokens,
  getMaxInputTokens,
  estimateChunksCost,
  MODEL_TOKEN_LIMITS,
} from './diff-chunker.js';
export type { ChunkOptions, DiffChunk, ChunkedDiff } from './diff-chunker.js';

// Review service
export { ReviewService, getReviewService } from './review.service.js';
export type { ReviewOptions, ReviewProgress, ReviewServiceResult } from './review.service.js';

// Review processor
export {
  createReviewProcessor,
  validateJobData,
  createJobDataFromWebhook,
} from './review-processor.js';

// Configuration parser
export {
  parseConfig,
  getDefaultConfig,
  mergeWithDefaults,
  validateConfig,
  toReviewConfig,
  DEFAULT_EXCLUSIONS as CONFIG_DEFAULT_EXCLUSIONS,
} from './config-parser.js';
export type { ReviewConfigYaml, ConfigParseResult } from './config-parser.js';
