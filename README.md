# AgentMergeGuard

Before you merge AI-written code, run one guard.

AgentMergeGuard is an early-stage pre-merge risk guard for AI-generated pull requests, MCP configs, agent instruction files, GitHub Actions workflows, package scripts, and secret-like leaks.

## Current status

This repository is currently an early TypeScript/pnpm MVP.

Implemented now:

- pnpm workspace
- `@agent-mergeguard/core` local file discovery and rule runner
- `@agent-mergeguard/rules` MVP checks for package lifecycle scripts, GitHub Actions `write-all` permissions, and agent instructions that discourage tests
- `@agent-mergeguard/cli` placeholder `scan` command
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
