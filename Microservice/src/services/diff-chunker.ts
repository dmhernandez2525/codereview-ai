/**
 * Diff Chunker Service
 * Splits large diffs into chunks that fit within AI context windows
 */

import { reconstructFileDiff } from './diff-parser.js';
import {
  calculateFilePriority,
  getFileExtension,
  getLanguageFromExtension,
} from './file-filter.js';

import type { DiffFile, ParsedDiff } from './diff-parser.js';

export interface ChunkOptions {
  maxTokensPerChunk?: number;
  maxFilesPerChunk?: number;
  includeContext?: boolean;
}

export interface DiffChunk {
  id: number;
  files: DiffFile[];
  content: string;
  estimatedTokens: number;
  language?: string | undefined;
}

export interface ChunkedDiff {
  chunks: DiffChunk[];
  totalChunks: number;
  totalFiles: number;
  strategy: 'single' | 'by-file' | 'by-language' | 'batched';
}

/**
 * Default token limits for different models.
 */
export const MODEL_TOKEN_LIMITS: Record<string, number> = {
  'gpt-4o': 128000,
  'gpt-4o-mini': 128000,
  'gpt-4-turbo': 128000,
  'gpt-4': 8192,
  'gpt-3.5-turbo': 16385,
  'claude-3-opus': 200000,
  'claude-3-sonnet': 200000,
  'claude-3-haiku': 200000,
  'gemini-1.5-pro': 1000000,
  'gemini-1.5-flash': 1000000,
};

/**
 * Estimates the number of tokens in a string.
 * Uses a rough approximation of ~4 characters per token.
 */
export function estimateTokens(content: string): number {
  // More accurate estimation: ~4 chars per token for English text
  // Code tends to have more special characters, so we use ~3.5
  return Math.ceil(content.length / 3.5);
}

/**
 * Gets the maximum safe token count for a model.
 * Leaves room for system prompt and response.
 */
export function getMaxInputTokens(model: string): number {
  const limit = MODEL_TOKEN_LIMITS[model] ?? 8192;
  // Reserve ~4000 tokens for system prompt and response
  return Math.floor(limit * 0.6);
}

/**
 * Chunks a parsed diff to fit within token limits.
 */
export function chunkDiff(diff: ParsedDiff, options: ChunkOptions = {}): ChunkedDiff {
  const { maxTokensPerChunk = 50000, maxFilesPerChunk = 20 } = options;

  // Sort files by priority
  const sortedFiles = [...diff.files].sort(
    (a, b) => calculateFilePriority(b) - calculateFilePriority(a)
  );

  // Quick check: if entire diff fits in one chunk
  const fullDiffContent = sortedFiles.map((f) => reconstructFileDiff(f)).join('\n');
  const totalTokens = estimateTokens(fullDiffContent);

  if (totalTokens <= maxTokensPerChunk && sortedFiles.length <= maxFilesPerChunk) {
    return {
      chunks: [
        {
          id: 1,
          files: sortedFiles,
          content: fullDiffContent,
          estimatedTokens: totalTokens,
        },
      ],
      totalChunks: 1,
      totalFiles: sortedFiles.length,
      strategy: 'single',
    };
  }

  // Try chunking by language first (better context)
  const languageChunks = chunkByLanguage(sortedFiles, maxTokensPerChunk, maxFilesPerChunk);
  if (languageChunks.length <= 5) {
    return {
      chunks: languageChunks,
      totalChunks: languageChunks.length,
      totalFiles: sortedFiles.length,
      strategy: 'by-language',
    };
  }

  // Fall back to simple batching
  const batchedChunks = chunkByBatch(sortedFiles, maxTokensPerChunk, maxFilesPerChunk);

  return {
    chunks: batchedChunks,
    totalChunks: batchedChunks.length,
    totalFiles: sortedFiles.length,
    strategy: 'batched',
  };
}

/**
 * Chunks files by their programming language.
 */
function chunkByLanguage(files: DiffFile[], maxTokens: number, maxFiles: number): DiffChunk[] {
  // Group by language
  const byLanguage = new Map<string, DiffFile[]>();

  for (const file of files) {
    const ext = getFileExtension(file.newPath);
    const language = getLanguageFromExtension(ext);
    const existing = byLanguage.get(language) ?? [];
    existing.push(file);
    byLanguage.set(language, existing);
  }

  const chunks: DiffChunk[] = [];
  let chunkId = 1;

  for (const [language, langFiles] of byLanguage) {
    // Split language group if too large
    const langChunks = createChunksFromFiles(langFiles, maxTokens, maxFiles, chunkId, language);
    chunks.push(...langChunks);
    chunkId += langChunks.length;
  }

  return chunks;
}

/**
 * Chunks files into batches.
 */
function chunkByBatch(files: DiffFile[], maxTokens: number, maxFiles: number): DiffChunk[] {
  return createChunksFromFiles(files, maxTokens, maxFiles, 1);
}

/**
 * Creates chunks from a list of files.
 */
function createChunksFromFiles(
  files: DiffFile[],
  maxTokens: number,
  maxFiles: number,
  startId: number,
  language?: string
): DiffChunk[] {
  const chunks: DiffChunk[] = [];
  let currentChunk: DiffFile[] = [];
  let currentTokens = 0;
  let chunkId = startId;

  for (const file of files) {
    const fileContent = reconstructFileDiff(file);
    const fileTokens = estimateTokens(fileContent);

    // If single file exceeds limit, it goes in its own chunk
    if (fileTokens > maxTokens) {
      // Save current chunk if not empty
      if (currentChunk.length > 0) {
        chunks.push(createChunk(currentChunk, chunkId++, language));
        currentChunk = [];
        currentTokens = 0;
      }

      // Add oversized file as its own chunk (will need special handling)
      chunks.push(createChunk([file], chunkId++, language));
      continue;
    }

    // Check if adding this file exceeds limits
    if (currentTokens + fileTokens > maxTokens || currentChunk.length >= maxFiles) {
      // Save current chunk and start new one
      if (currentChunk.length > 0) {
        chunks.push(createChunk(currentChunk, chunkId++, language));
      }
      currentChunk = [file];
      currentTokens = fileTokens;
    } else {
      currentChunk.push(file);
      currentTokens += fileTokens;
    }
  }

  // Save remaining files
  if (currentChunk.length > 0) {
    chunks.push(createChunk(currentChunk, chunkId, language));
  }

  return chunks;
}

/**
 * Creates a DiffChunk from a list of files.
 */
function createChunk(files: DiffFile[], id: number, language?: string): DiffChunk {
  const content = files.map((f) => reconstructFileDiff(f)).join('\n');
  return {
    id,
    files,
    content,
    estimatedTokens: estimateTokens(content),
    language,
  };
}

/**
 * Estimates the total cost of reviewing all chunks.
 */
export function estimateChunksCost(
  chunks: DiffChunk[],
  model: string
): { inputTokens: number; estimatedOutputTokens: number; estimatedCost: number } {
  const inputTokens = chunks.reduce((sum, c) => sum + c.estimatedTokens, 0);

  // Estimate output as ~20% of input (comments are usually shorter than code)
  const estimatedOutputTokens = Math.ceil(inputTokens * 0.2);

  // Basic cost estimation (would need actual pricing data)
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
  };

  const modelPricing = pricing[model] ?? pricing['gpt-4o'] ?? { input: 0.005, output: 0.015 };

  const estimatedCost =
    (inputTokens / 1000) * modelPricing.input +
    (estimatedOutputTokens / 1000) * modelPricing.output;

  return {
    inputTokens,
    estimatedOutputTokens,
    estimatedCost,
  };
}
