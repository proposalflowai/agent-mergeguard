#!/usr/bin/env bash
set -euo pipefail

echo "[AgentMergeGuard] Codex local environment setup started"

if [ -f "$HOME/.codex-shell-env" ]; then
  # shellcheck disable=SC1090
  source "$HOME/.codex-shell-env"
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node is not available. Check ~/.codex-shell-env and nvm setup." >&2
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  corepack enable
  corepack prepare pnpm@latest --activate
fi

if [ -f package.json ]; then
  pnpm install
  pnpm run build || true
fi

echo "[AgentMergeGuard] setup complete"
