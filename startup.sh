#!/bin/sh
set -eu
cd /workspace

if ! grep -q '"name": "athrecs"' package.json 2>/dev/null; then
  echo "REFUSING TO START: package.json is not athrecs (wrong codebase)." >&2
  exit 1
fi
if [ ! -d src/routes/clubs ] || [ ! -f public/athrecs-logo.png ]; then
  echo "REFUSING TO START: missing clubs route or ATHRECS logo (wrong codebase)." >&2
  exit 1
fi
if [ -f src/data/races.ts ] || [ -f src/routes/me.tsx ]; then
  echo "REFUSING TO START: sandbox prototype files present (races.ts / me.tsx)." >&2
  exit 1
fi

if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
npm run dev >>/tmp/app-startup.log 2>&1 &
