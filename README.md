# AgentMergeGuard

Before you merge AI-written code, run one guard.

AgentMergeGuard is an early-stage pre-merge risk guard for AI-generated pull requests, MCP configs, agent instruction files, GitHub Actions workflows, package scripts, and secret-like leaks.

## Current status

This repository is currently an early TypeScript/pnpm MVP.

Implemented now:

- pnpm workspace
- `@agent-mergeguard/core` local file discovery and rule runner
- `@agent-mergeguard/rules` MVP checks for package lifecycle scripts, GitHub Actions `write-all` permissions, and agent instructions that discourage tests
- `@agent-mergeguard/cli` `scan` command with text, JSON, and Markdown reports
- Vitest test setup
- safe/risky fixtures for the MVP rules

Not implemented yet:

- GitHub Action
- browser scanner
- SARIF output
- paid rule pack

## Quickstart

Install dependencies:

`pnpm install`

Run tests:

`pnpm test`

Build packages:

`pnpm run build`

Run local scan:

`pnpm scan`

Run the CLI directly:

`agent-mergeguard scan .`

Report formats:

`agent-mergeguard scan . --format text`

`agent-mergeguard scan . --format json`

`agent-mergeguard scan . --format markdown`

Only show higher-severity findings:

`agent-mergeguard scan . --min-severity high`

Exclude paths from scanning:

`agent-mergeguard scan . --exclude fixtures --exclude dist`

When scanning this repository root, fixtures are excluded by default so fixture-only risky examples do not fail the normal local scan. Include them intentionally with:

`agent-mergeguard scan . --include-fixtures`

The CLI exits with code 1 when high or critical findings are present after path excludes are applied. It exits with code 0 when no high or critical findings are present.

## Product direction

Free:

- CLI scanner
- GitHub Action
- static browser scanner
- core rule set

Paid:

- Pro Rule Pack
- Maintainer Kit
- Team Pack

## Revenue proof

This project only proves itself through completed revenue.

Stars, visits, downloads, and waitlist signups are secondary.
