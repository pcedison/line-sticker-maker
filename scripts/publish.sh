#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT_DIR/vitejs-vite"
BRANCH="$(git -C "$ROOT_DIR" branch --show-current)"
MESSAGE="${1:-publish updates}"
if [[ -z "$BRANCH" ]]; then
  echo "Unable to determine the current Git branch."
  exit 1
fi

STACKBLITZ_PATH="https://stackblitz.com/github/pcedison/line-sticker-maker/tree/$BRANCH/vitejs-vite"

if [[ ! -d "$APP_DIR" ]]; then
  echo "Frontend app directory not found: $APP_DIR"
  exit 1
fi

echo "Running quality checks in $APP_DIR ..."
(
  cd "$APP_DIR"
  npm run check
)

echo "Staging changes ..."
git -C "$ROOT_DIR" add .

if git -C "$ROOT_DIR" diff --cached --quiet; then
  echo "No changes to publish."
  exit 0
fi

echo "Creating commit on branch '$BRANCH' ..."
git -C "$ROOT_DIR" commit -m "$MESSAGE"

echo "Pushing to origin/$BRANCH ..."
git -C "$ROOT_DIR" push -u origin "$BRANCH"

echo
echo "Publish complete."
echo "GitHub: https://github.com/pcedison/line-sticker-maker"
echo "StackBlitz: ${STACKBLITZ_PATH}?startScript=dev&title=Line%20Sticker%20Master%20Toolkit"
