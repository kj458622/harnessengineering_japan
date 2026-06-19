#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/seong/2026/harnessengineering_japan/memory-next-app"
NODE_PATH_DIR="/home/seong/.nvm/versions/node/v20.20.2/bin"
APP_URL="http://127.0.0.1:4320"
CODEX_API_VERSION="0.140.0"
OAUTH_MODELS="gpt-5.4"

run_in_terminal() {
  local title="$1"
  local command="$2"

  if command -v gnome-terminal >/dev/null 2>&1; then
    gnome-terminal --title="$title" -- bash -lc "$command; exec bash"
    return
  fi

  if command -v x-terminal-emulator >/dev/null 2>&1; then
    x-terminal-emulator -T "$title" -e bash -lc "$command; exec bash"
    return
  fi

  echo "터미널 앱을 찾지 못했습니다. gnome-terminal 또는 x-terminal-emulator가 필요합니다."
  exit 1
}

run_in_terminal "일본어 앱 OAuth" "cd \"$APP_DIR\" && PATH=\"$NODE_PATH_DIR:\$PATH\" npx openai-oauth --codex-version \"$CODEX_API_VERSION\" --models \"$OAUTH_MODELS\""
sleep 2
run_in_terminal "일본어 앱 Next.js" "cd \"$APP_DIR\" && PATH=\"$NODE_PATH_DIR:\$PATH\" ./node_modules/.bin/next dev -p 4320"

sleep 4
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "$APP_URL" >/dev/null 2>&1 || true
fi
