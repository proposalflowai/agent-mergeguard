# AgentMergeGuard

Before you merge AI-written code, run one guard.

AgentMergeGuard is an early-stage pre-merge risk guard for AI-generated pull requests, MCP configs, agent instruction files, GitHub Actions workflows, package scripts, and secret-like leaks.

## Current status

This repository is currently a minimal TypeScript/pnpm skeleton.

Implemented now:

- pnpm workspace
- `@agent-mergeguard/core` placeholder scan function
- `@agent-mergeguard/rules` placeholder core rules
- `@agent-mergeguard/cli` placeholder `scan` command
- Vitest test setup
- safe/risky fixture directories

Not implemented yet:

- real rule engine
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

Run placeholder scan:

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
