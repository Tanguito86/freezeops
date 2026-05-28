import * as github from "@actions/github";

import { FREEZEOPS_COMMENT_MARKER } from "./report.js";

// ── Public API ──────────────────────────────────────────────────────────

export interface PrCommentOptions {
  /** Markdown body for the PR comment. */
  body: string;
  /** GitHub token with pull-requests:write permission. */
  token: string;
}

/**
 * Post a new PR comment or update the previous one from this bot.
 *
 * The previous comment is identified by the invisible marker
 * `<!-- freezeops-report -->` in the body.
 *
 * Returns `true` if a comment was posted or updated.
 */
export async function postOrUpdatePrComment(
  options: PrCommentOptions,
): Promise<boolean> {
  const { body, token } = options;

  const prNumber = github.context.payload.pull_request?.number;
  if (!prNumber) {
    return false;
  }

  const repo = github.context.repo;
  const octokit = github.getOctokit(token);

  try {
    // Find existing comment from this bot
    const existing = await findExistingComment(octokit, repo, prNumber);

    if (existing) {
      await octokit.rest.issues.updateComment({
        ...repo,
        comment_id: existing.id,
        body,
      });
    } else {
      await octokit.rest.issues.createComment({
        ...repo,
        issue_number: prNumber,
        body,
      });
    }

    return true;
  } catch {
    // Non-fatal: don't crash the check if comment posting fails
    return false;
  }
}

// ── Internal ────────────────────────────────────────────────────────────

interface ExistingComment {
  id: number;
}

async function findExistingComment(
  octokit: ReturnType<typeof github.getOctokit>,
  repo: { owner: string; repo: string },
  prNumber: number,
): Promise<ExistingComment | null> {
  const perPage = 30;

  for (let page = 1; ; page++) {
    const { data: comments } = await octokit.rest.issues.listComments({
      ...repo,
      issue_number: prNumber,
      per_page: perPage,
      page,
    });

    for (const comment of comments) {
      if (
        comment.body?.includes(FREEZEOPS_COMMENT_MARKER) &&
        comment.user?.type === "Bot"
      ) {
        return { id: comment.id };
      }
    }

    if (comments.length < perPage) break;
  }

  return null;
}
