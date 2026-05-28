import { simpleGit } from "simple-git";

import type { ChangedFile } from "./types.js";

// ─── Public API ──────────────────────────────────────────────────────────

export interface GitDiffOptions {
  /** Base ref for comparison (e.g. "origin/main"). */
  baseRef?: string;
  /** Head ref for comparison. Defaults to HEAD. */
  headRef?: string;
}

/**
 * Read changed files from the local git repository.
 *
 * Strategy (when no refs are given):
 *   1. Check for staged changes (`git diff --cached`)
 *   2. If none, fall back to working-tree changes (`git diff`)
 *
 * Returns an empty array when there are no changes.
 */
export async function getChangedFilesFromGit(
  options: GitDiffOptions = {},
): Promise<ChangedFile[]> {
  const git = simpleGit();

  // Verify we're inside a git repository
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    throw new Error(
      "Not a git repository. FreezeOps must run inside a git repo.",
    );
  }

  let diffText: string;

  if (options.baseRef) {
    const head = options.headRef ?? "HEAD";
    diffText = await git.diff([`${options.baseRef}...${head}`]);
  } else {
    // Try staged first, then working tree
    diffText = await git.diff(["--cached"]);
    if (!diffText.trim()) {
      diffText = await git.diff();
    }
  }

  if (!diffText.trim()) {
    return [];
  }

  return parseUnifiedDiff(diffText);
}

// ─── Diff parser ─────────────────────────────────────────────────────────

/**
 * Parse unified diff output into ChangedFile[].
 *
 * Handles:
 *   - Modified files
 *   - New files (--- /dev/null)
 *   - Deleted files (+++ /dev/null)
 *   - Multiple files in a single diff
 */
function parseUnifiedDiff(diffText: string): ChangedFile[] {
  const files: ChangedFile[] = [];

  // Split by "diff --git " to get per-file sections
  const sections = diffText.split(/\n(?=diff --git )/);

  for (const section of sections) {
    const file = parseFileSection(section);
    if (file) {
      files.push(file);
    }
  }

  return files;
}

function parseFileSection(section: string): ChangedFile | null {
  const lines = section.split("\n");

  let path = "";
  const addedLines: string[] = [];
  const removedLines: string[] = [];
  let inHunk = false;

  for (const raw of lines) {
    const line = raw;

    // Detect file path from "+++ b/path" or "+++ /dev/null"
    if (line.startsWith("+++ ")) {
      const bPath = line.slice(4); // remove "+++ "
      if (bPath === "/dev/null") {
        continue; // deleted file — path comes from --- a/
      }
      path = bPath.startsWith("b/") ? bPath.slice(2) : bPath;
      continue;
    }

    // For deleted files, path comes from "--- a/path"
    if (line.startsWith("--- ")) {
      const aPath = line.slice(4); // remove "--- "
      if (!path && aPath !== "/dev/null") {
        path = aPath.startsWith("a/") ? aPath.slice(2) : aPath;
      }
      continue;
    }

    // Ignore metadata lines
    if (
      line.startsWith("diff --git ") ||
      line.startsWith("index ") ||
      line.startsWith("new file mode ") ||
      line.startsWith("deleted file mode ") ||
      line.startsWith("old mode ") ||
      line.startsWith("new mode ") ||
      line.startsWith("similarity index ") ||
      line.startsWith("rename from ") ||
      line.startsWith("rename to ")
    ) {
      continue;
    }

    // Hunk headers
    if (line.startsWith("@@")) {
      inHunk = true;
      continue;
    }

    if (!inHunk) continue;

    // Collect added / removed lines
    if (line.startsWith("+") && !line.startsWith("+++")) {
      addedLines.push(line.slice(1)); // strip the +
    } else if (line.startsWith("-") && !line.startsWith("---")) {
      removedLines.push(line.slice(1)); // strip the -
    }
  }

  if (!path) return null;

  return {
    path,
    addedLines,
    removedLines,
  };
}
