/**
 * Unified Diff Parser
 * Parses unified diff format into structured file changes
 */

export interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  content: string;
  changes: DiffChange[];
}

export interface DiffChange {
  type: 'add' | 'delete' | 'context';
  lineNumber: number; // Line number in the new file
  oldLineNumber?: number; // Line number in the old file (for deletions)
  content: string;
}

export interface DiffFile {
  oldPath: string;
  newPath: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  hunks: DiffHunk[];
  additions: number;
  deletions: number;
  isBinary: boolean;
}

export interface ParsedDiff {
  files: DiffFile[];
  totalAdditions: number;
  totalDeletions: number;
  totalFiles: number;
}

/**
 * Parses a unified diff string into structured data.
 */
export function parseDiff(diffContent: string): ParsedDiff {
  const files: DiffFile[] = [];
  const lines = diffContent.split('\n');

  let currentFile: DiffFile | null = null;
  let currentHunk: DiffHunk | null = null;
  let newLineNumber = 0;
  let oldLineNumber = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line === undefined) {
      continue;
    }

    // File header: diff --git a/path b/path
    if (line.startsWith('diff --git ')) {
      // Save previous file if exists
      if (currentFile) {
        if (currentHunk) {
          currentFile.hunks.push(currentHunk);
        }
        files.push(currentFile);
      }

      // Parse file paths
      const match = line.match(/diff --git a\/(.+) b\/(.+)/);
      if (match && match[1] && match[2]) {
        currentFile = {
          oldPath: match[1],
          newPath: match[2],
          status: 'modified',
          hunks: [],
          additions: 0,
          deletions: 0,
          isBinary: false,
        };
        currentHunk = null;
      }
      continue;
    }

    if (!currentFile) {
      continue;
    }

    // New file indicator
    if (line.startsWith('new file mode')) {
      currentFile.status = 'added';
      continue;
    }

    // Deleted file indicator
    if (line.startsWith('deleted file mode')) {
      currentFile.status = 'deleted';
      continue;
    }

    // Renamed file indicator
    if (line.startsWith('rename from ') || line.startsWith('rename to ')) {
      currentFile.status = 'renamed';
      continue;
    }

    // Binary file indicator
    if (line.startsWith('Binary files ') || line.includes('GIT binary patch')) {
      currentFile.isBinary = true;
      continue;
    }

    // Hunk header: @@ -oldStart,oldLines +newStart,newLines @@
    if (line.startsWith('@@')) {
      // Save previous hunk
      if (currentHunk) {
        currentFile.hunks.push(currentHunk);
      }

      const hunkMatch = line.match(/@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)?/);
      if (hunkMatch && hunkMatch[1] && hunkMatch[3]) {
        oldLineNumber = parseInt(hunkMatch[1], 10);
        const oldLines = parseInt(hunkMatch[2] ?? '1', 10);
        newLineNumber = parseInt(hunkMatch[3], 10);
        const newLines = parseInt(hunkMatch[4] ?? '1', 10);

        currentHunk = {
          oldStart: oldLineNumber,
          oldLines,
          newStart: newLineNumber,
          newLines,
          content: line,
          changes: [],
        };
      }
      continue;
    }

    // Skip other header lines
    if (
      line.startsWith('---') ||
      line.startsWith('+++') ||
      line.startsWith('index ') ||
      line.startsWith('old mode') ||
      line.startsWith('new mode') ||
      line.startsWith('similarity index')
    ) {
      continue;
    }

    // Parse diff content
    if (currentHunk) {
      if (line.startsWith('+')) {
        currentHunk.changes.push({
          type: 'add',
          lineNumber: newLineNumber,
          content: line.substring(1),
        });
        currentFile.additions++;
        newLineNumber++;
      } else if (line.startsWith('-')) {
        currentHunk.changes.push({
          type: 'delete',
          lineNumber: newLineNumber,
          oldLineNumber: oldLineNumber,
          content: line.substring(1),
        });
        currentFile.deletions++;
        oldLineNumber++;
      } else if (line.startsWith(' ') || line === '') {
        currentHunk.changes.push({
          type: 'context',
          lineNumber: newLineNumber,
          oldLineNumber: oldLineNumber,
          content: line.substring(1),
        });
        newLineNumber++;
        oldLineNumber++;
      }
    }
  }

  // Save the last file and hunk
  if (currentFile) {
    if (currentHunk) {
      currentFile.hunks.push(currentHunk);
    }
    files.push(currentFile);
  }

  // Calculate totals
  const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0);
  const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0);

  return {
    files,
    totalAdditions,
    totalDeletions,
    totalFiles: files.length,
  };
}

/**
 * Reconstructs a diff string from a DiffFile.
 * Useful for sending individual file diffs to AI.
 */
export function reconstructFileDiff(file: DiffFile): string {
  if (file.isBinary) {
    return `Binary file ${file.newPath}`;
  }

  let diff = `diff --git a/${file.oldPath} b/${file.newPath}\n`;

  if (file.status === 'added') {
    diff += `new file mode 100644\n`;
    diff += `--- /dev/null\n`;
    diff += `+++ b/${file.newPath}\n`;
  } else if (file.status === 'deleted') {
    diff += `deleted file mode 100644\n`;
    diff += `--- a/${file.oldPath}\n`;
    diff += `+++ /dev/null\n`;
  } else {
    diff += `--- a/${file.oldPath}\n`;
    diff += `+++ b/${file.newPath}\n`;
  }

  for (const hunk of file.hunks) {
    diff += `${hunk.content}\n`;

    for (const change of hunk.changes) {
      if (change.type === 'add') {
        diff += `+${change.content}\n`;
      } else if (change.type === 'delete') {
        diff += `-${change.content}\n`;
      } else {
        diff += ` ${change.content}\n`;
      }
    }
  }

  return diff;
}

/**
 * Extracts only the changed lines from a file diff.
 * Useful for getting a condensed view of changes.
 */
export function extractChangedLines(file: DiffFile): { additions: string[]; deletions: string[] } {
  const additions: string[] = [];
  const deletions: string[] = [];

  for (const hunk of file.hunks) {
    for (const change of hunk.changes) {
      if (change.type === 'add') {
        additions.push(`${file.newPath}:${change.lineNumber}: ${change.content}`);
      } else if (change.type === 'delete') {
        deletions.push(`${file.oldPath}:${change.oldLineNumber ?? 0}: ${change.content}`);
      }
    }
  }

  return { additions, deletions };
}
