#!/usr/bin/env bash
set -euo pipefail

message="${1:-${CHECKPOINT_MESSAGE:-checkpoint}}"

if [[ -z "${message// }" ]]; then
  echo "Commit message cannot be blank" >&2
  exit 2
fi

if [[ -z "$(git status --porcelain)" ]]; then
  echo "Working tree clean; nothing to commit."
  exit 0
fi

npm run build
npm test

git add -A

if git diff --cached --quiet; then
  echo "No staged changes after git add."
  exit 0
fi

git commit -m "$message"
