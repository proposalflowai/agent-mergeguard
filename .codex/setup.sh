#!/usr/bin/env bash
set -euo pipefail

echo "[AgentMergeGuard] Codex local environment setup started"

if ! command -v pnpm >/dev/null 2>&1; then
  corepack enable
  corepack prepare pnpm@latest --activate
fi

if [ -f package.json ]; then
  pnpm install
  pnpm run build || true
fi

echo "[AgentMergeGuard] setup complete"
