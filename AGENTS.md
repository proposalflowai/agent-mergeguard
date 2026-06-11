# AgentMergeGuard — Codex App Operating Guide

## Mission

Build a zero-cost, revenue-proving developer tool that helps maintainers review risks before merging AI-generated PRs, MCP configs, agent instruction files, GitHub Actions workflows, and package scripts.

The only proof metric is completed revenue. Stars, likes, visits, downloads, and waitlist signups are secondary.

## Product

AgentMergeGuard has four surfaces:

1. Free CLI: `agent-mergeguard`
2. Free GitHub Action
3. Free static browser scanner
4. Paid Pro Rule Pack / Maintainer Kit / Team Pack

The tool must run locally or client-side by default. Do not collect customer code on our server.

## Non-overlap constraint

This repository must not build, mention, or reuse product scope from feeddoctor.

Forbidden product areas:
- Shopify feed optimization
- ecommerce product feeds
- merchant catalog improvement
- product listing SEO
- smartstore/Cafe24/Shopify merchant tools
- AI shopping agent optimization
- product detail page optimization
- product catalog cleanup
- product listing generation

If a task drifts into those areas, stop and redirect back to:
AI-generated PR risk review, MCP security, agent instruction safety, GitHub Actions safety, package script risk, and pre-merge checks.

## Zero-cost constraint

No paid APIs.
No hosted database.
No paid ads.
No paid infrastructure.
No paid observability.
No paid design tools.
No paid domain until revenue is proven.

Use:
- public GitHub repo
- GitHub Pages
- public GitHub Actions runners
- local/client-side scanning
- static files
- Payhip/Polar/Gumroad only after owner manually creates accounts

## Safety rules

Do not exploit vulnerabilities.
Do not scan private third-party systems.
Do not send automated spam, DMs, or mass PRs.
Do not scrape private data.
Do not collect customer code.
Do not exfiltrate secrets.
Do not publish security claims like "guaranteed secure".

The product is a pre-merge risk aid, not a replacement for professional security review.

## Codex environment rules

This repo is intended to run in the official OpenAI Codex Windows app with WSL.

Do not use sudo inside Codex tasks.
Do not run apt install inside Codex tasks.
Do not modify system packages from Codex.
System setup must be done manually by the owner in an external WSL terminal.

Allowed project commands:
- pwd
- git status
- git diff
- git branch
- git add
- git commit
- node -v
- pnpm -v
- pnpm install
- pnpm test
- pnpm run build
- pnpm run lint

Owner approval required:
- git push
- gh pr create
- gh release create
- npm publish
- external posting
- checkout/payment changes
- changing revenue-ledger.md
- using Computer Use
- enabling Full Access

## Engineering stack

Use TypeScript.
Use pnpm workspaces.
Use Vitest for tests.
Use tsup or equivalent for package builds.
Use a static web app for the browser scanner.
Use GitHub Actions for CI and Pages deployment.

## Core rule groups

1. MCP config risks
2. AGENTS.md / CLAUDE.md / Cursor rules risks
3. package.json lifecycle script risks
4. GitHub Actions permission risks
5. PR diff auth/payment/security-sensitive change risks
6. secret-like pattern risks
7. dependency and lockfile anomaly risks

## Definition of done

A task is done only when:

1. Tests pass.
2. Build passes.
3. Documentation is updated.
4. A fixture exists for the behavior.
5. The change does not require paid infrastructure.
6. Any new rule has a risky fixture and safe fixture.
7. Any user-facing claim is conservative and accurate.
8. `revenue-ledger.md` remains unchanged unless a real completed payment happened.

## Git rules

Use branches named:

- agent/bootstrap-*
- agent/rules-*
- agent/cli-*
- agent/web-*
- agent/docs-*
- agent/revenue-*

Do not push directly to main after initial bootstrap.
Do not force push unless the owner explicitly approves.
Open pull requests for review when a coherent unit is ready.

## Revenue rule

Only count completed customer payments.

Do not count:
- visits
- stars
- downloads
- fake purchases
- owner's own test payment
- unpaid waitlist submissions

## WSL Node/pnpm environment rule

Codex may run non-interactive WSL commands that do not automatically load nvm.

Before running Node, npm, pnpm, Vitest, tsup, or workspace scripts, use:

`source ~/.codex-shell-env`

Examples:

`source ~/.codex-shell-env; node -v; pnpm -v`

`source ~/.codex-shell-env; pnpm install`

`source ~/.codex-shell-env; pnpm test`

Do not use sudo or apt from Codex.
System setup is handled manually by the owner in an external WSL terminal.
