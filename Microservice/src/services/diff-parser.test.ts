import { describe, expect, it } from 'vitest';

import { extractChangedLines, parseDiff, reconstructFileDiff } from './diff-parser.js';

describe('diff-parser', () => {
  describe('parseDiff', () => {
    it('should parse a simple file modification', () => {
      const diff = `diff --git a/src/index.ts b/src/index.ts
index abc123..def456 100644
--- a/src/index.ts
+++ b/src/index.ts
@@ -1,3 +1,4 @@
 const x = 1;
-const y = 2;
+const y = 3;
+const z = 4;
 export { x };
`;
      const result = parseDiff(diff);

      expect(result.totalFiles).toBe(1);
      expect(result.files[0]?.oldPath).toBe('src/index.ts');
      expect(result.files[0]?.newPath).toBe('src/index.ts');
      expect(result.files[0]?.status).toBe('modified');
      expect(result.files[0]?.additions).toBe(2);
      expect(result.files[0]?.deletions).toBe(1);
      expect(result.totalAdditions).toBe(2);
      expect(result.totalDeletions).toBe(1);
    });

    it('should parse a new file', () => {
      const diff = `diff --git a/src/new-file.ts b/src/new-file.ts
new file mode 100644
index 0000000..abc123
--- /dev/null
+++ b/src/new-file.ts
@@ -0,0 +1,3 @@
+export function hello() {
+  return 'world';
+}
`;
      const result = parseDiff(diff);

      expect(result.totalFiles).toBe(1);
      expect(result.files[0]?.status).toBe('added');
      expect(result.files[0]?.additions).toBe(3);
      expect(result.files[0]?.deletions).toBe(0);
    });

    it('should parse a deleted file', () => {
      const diff = `diff --git a/src/old-file.ts b/src/old-file.ts
deleted file mode 100644
index abc123..0000000
--- a/src/old-file.ts
+++ /dev/null
@@ -1,2 +0,0 @@
-const legacy = true;
-export { legacy };
`;
      const result = parseDiff(diff);

      expect(result.totalFiles).toBe(1);
      expect(result.files[0]?.status).toBe('deleted');
      expect(result.files[0]?.additions).toBe(0);
      expect(result.files[0]?.deletions).toBe(2);
    });

    it('should parse a renamed file', () => {
      const diff = `diff --git a/src/old-name.ts b/src/new-name.ts
similarity index 90%
rename from src/old-name.ts
rename to src/new-name.ts
index abc123..def456 100644
--- a/src/old-name.ts
+++ b/src/new-name.ts
@@ -1,2 +1,2 @@
-export const name = 'old';
+export const name = 'new';
`;
      const result = parseDiff(diff);

      expect(result.totalFiles).toBe(1);
      expect(result.files[0]?.status).toBe('renamed');
      expect(result.files[0]?.oldPath).toBe('src/old-name.ts');
      expect(result.files[0]?.newPath).toBe('src/new-name.ts');
    });

    it('should detect binary files', () => {
      const diff = `diff --git a/image.png b/image.png
new file mode 100644
Binary files /dev/null and b/image.png differ
`;
      const result = parseDiff(diff);

      expect(result.totalFiles).toBe(1);
      expect(result.files[0]?.isBinary).toBe(true);
    });

    it('should parse multiple files', () => {
      const diff = `diff --git a/src/a.ts b/src/a.ts
index abc..def 100644
--- a/src/a.ts
+++ b/src/a.ts
@@ -1,1 +1,2 @@
 const a = 1;
+const b = 2;
diff --git a/src/c.ts b/src/c.ts
index ghi..jkl 100644
--- a/src/c.ts
+++ b/src/c.ts
@@ -1,1 +1,1 @@
-const c = 3;
+const c = 4;
`;
      const result = parseDiff(diff);

      expect(result.totalFiles).toBe(2);
      expect(result.files[0]?.newPath).toBe('src/a.ts');
      expect(result.files[1]?.newPath).toBe('src/c.ts');
      expect(result.totalAdditions).toBe(2);
      expect(result.totalDeletions).toBe(1);
    });

    it('should parse multiple hunks in a file', () => {
      const diff = `diff --git a/src/large-file.ts b/src/large-file.ts
index abc..def 100644
--- a/src/large-file.ts
+++ b/src/large-file.ts
@@ -1,3 +1,4 @@
 function first() {
+  console.log('added');
   return 1;
 }
@@ -100,3 +101,4 @@
 function last() {
+  console.log('also added');
   return 100;
 }
`;
      const result = parseDiff(diff);

      expect(result.totalFiles).toBe(1);
      expect(result.files[0]?.hunks).toHaveLength(2);
      expect(result.files[0]?.hunks[0]?.newStart).toBe(1);
      expect(result.files[0]?.hunks[1]?.newStart).toBe(101);
    });

    it('should handle empty diff', () => {
      const result = parseDiff('');

      expect(result.totalFiles).toBe(0);
      expect(result.files).toHaveLength(0);
    });

    it('should parse hunk changes correctly', () => {
      const diff = `diff --git a/src/index.ts b/src/index.ts
--- a/src/index.ts
+++ b/src/index.ts
@@ -1,3 +1,3 @@
 const x = 1;
-const y = 2;
+const y = 3;
 const z = 4;`;
      const result = parseDiff(diff);
      const changes = result.files[0]?.hunks[0]?.changes;

      expect(changes?.length).toBeGreaterThanOrEqual(4);
      expect(changes?.[0]?.type).toBe('context');
      expect(changes?.[0]?.content).toBe('const x = 1;');
      expect(changes?.[1]?.type).toBe('delete');
      expect(changes?.[1]?.content).toBe('const y = 2;');
      expect(changes?.[2]?.type).toBe('add');
      expect(changes?.[2]?.content).toBe('const y = 3;');
      expect(changes?.[3]?.type).toBe('context');
    });
  });

  describe('reconstructFileDiff', () => {
    it('should reconstruct a modified file diff', () => {
      const file = {
        oldPath: 'src/index.ts',
        newPath: 'src/index.ts',
        status: 'modified' as const,
        hunks: [
          {
            oldStart: 1,
            oldLines: 2,
            newStart: 1,
            newLines: 2,
            content: '@@ -1,2 +1,2 @@',
            changes: [
              { type: 'delete' as const, lineNumber: 1, oldLineNumber: 1, content: 'old line' },
              { type: 'add' as const, lineNumber: 1, content: 'new line' },
            ],
          },
        ],
        additions: 1,
        deletions: 1,
        isBinary: false,
      };

      const diff = reconstructFileDiff(file);

      expect(diff).toContain('diff --git a/src/index.ts b/src/index.ts');
      expect(diff).toContain('--- a/src/index.ts');
      expect(diff).toContain('+++ b/src/index.ts');
      expect(diff).toContain('@@ -1,2 +1,2 @@');
      expect(diff).toContain('-old line');
      expect(diff).toContain('+new line');
    });

    it('should reconstruct a new file diff', () => {
      const file = {
        oldPath: 'src/new.ts',
        newPath: 'src/new.ts',
        status: 'added' as const,
        hunks: [],
        additions: 0,
        deletions: 0,
        isBinary: false,
      };

      const diff = reconstructFileDiff(file);

      expect(diff).toContain('new file mode 100644');
      expect(diff).toContain('--- /dev/null');
      expect(diff).toContain('+++ b/src/new.ts');
    });

    it('should reconstruct a deleted file diff', () => {
      const file = {
        oldPath: 'src/old.ts',
        newPath: 'src/old.ts',
        status: 'deleted' as const,
        hunks: [],
        additions: 0,
        deletions: 0,
        isBinary: false,
      };

      const diff = reconstructFileDiff(file);

      expect(diff).toContain('deleted file mode 100644');
      expect(diff).toContain('--- a/src/old.ts');
      expect(diff).toContain('+++ /dev/null');
    });

    it('should handle binary files', () => {
      const file = {
        oldPath: 'image.png',
        newPath: 'image.png',
        status: 'modified' as const,
        hunks: [],
        additions: 0,
        deletions: 0,
        isBinary: true,
      };

      const diff = reconstructFileDiff(file);
      expect(diff).toBe('Binary file image.png');
    });
  });

  describe('extractChangedLines', () => {
    it('should extract additions and deletions', () => {
      const file = {
        oldPath: 'src/index.ts',
        newPath: 'src/index.ts',
        status: 'modified' as const,
        hunks: [
          {
            oldStart: 1,
            oldLines: 2,
            newStart: 1,
            newLines: 2,
            content: '@@ -1,2 +1,2 @@',
            changes: [
              { type: 'delete' as const, lineNumber: 1, oldLineNumber: 1, content: 'deleted line' },
              { type: 'add' as const, lineNumber: 1, content: 'added line' },
              { type: 'context' as const, lineNumber: 2, oldLineNumber: 2, content: 'context' },
            ],
          },
        ],
        additions: 1,
        deletions: 1,
        isBinary: false,
      };

      const { additions, deletions } = extractChangedLines(file);

      expect(additions).toHaveLength(1);
      expect(additions[0]).toContain('added line');
      expect(additions[0]).toContain('src/index.ts:1');
      expect(deletions).toHaveLength(1);
      expect(deletions[0]).toContain('deleted line');
      expect(deletions[0]).toContain('src/index.ts:1');
    });

    it('should handle files with no changes', () => {
      const file = {
        oldPath: 'src/index.ts',
        newPath: 'src/index.ts',
        status: 'modified' as const,
        hunks: [],
        additions: 0,
        deletions: 0,
        isBinary: false,
      };

      const { additions, deletions } = extractChangedLines(file);

      expect(additions).toHaveLength(0);
      expect(deletions).toHaveLength(0);
    });
  });
});
