# Security

## Reporting a Vulnerability

If you discover a security vulnerability in FreezeOps, please **do not**
open a public issue.

Email the maintainer directly. We'll respond within 48 hours and work
with you on a fix and coordinated disclosure.

## Scope

FreezeOps is a deterministic rule engine that runs locally or in CI.
It does not:

- Make network calls during audits
- Store or transmit any data
- Use AI or LLM APIs
- Require authentication or secrets (except `GITHUB_TOKEN` for PR comments)

## GITHUB_TOKEN

The `GITHUB_TOKEN` is only used to post PR comments via the GitHub API.
It is never logged, stored, or transmitted outside the GitHub Actions
runner. If no token is provided, PR comments are silently skipped.

## Dependencies

FreezeOps depends on:

- `yaml` — YAML parsing
- `minimatch` — glob matching
- `simple-git` — git operations
- `@actions/core` — GitHub Actions integration
- `@actions/github` — GitHub API client

All dependencies are pinned to known versions in `package-lock.json`.
