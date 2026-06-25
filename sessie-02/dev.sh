#!/usr/bin/env bash
# Start frontend EN backend tegelijk, beide met hot reload, in één commando.
# Gebruik: ./dev.sh   (vanuit de sessie-folder)
#
# - Frontend (app/)      → Vite HMR op http://localhost:5173
# - Backend  (backend/)  → Express + node --watch op http://localhost:3001
# Wat er bestaat wordt gestart; ontbreekt een deel, dan wordt dat overgeslagen.
# Ctrl+C stopt beide processen netjes.

set -e
DIR="$(cd "$(dirname "$0")" && pwd)"

PIDS=()
cleanup() {
  echo ""
  echo "→ Stoppen..."
  for pid in "${PIDS[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

started=false

if [ -d "$DIR/backend" ]; then
  echo "→ Backend start (http://localhost:3001, hot reload)..."
  (cd "$DIR/backend" && npm start 2>&1 | sed 's/^/[backend]  /') &
  PIDS+=($!)
  started=true
fi

if [ -d "$DIR/app" ]; then
  echo "→ Frontend start (http://localhost:5173, HMR)..."
  (cd "$DIR/app" && npm run dev -- --open 2>&1 | sed 's/^/[frontend] /') &
  PIDS+=($!)
  started=true
fi

if [ "$started" = false ]; then
  echo "✗ Geen app/ of backend/ gevonden."
  echo "  Scaffold eerst:  ./scaffold-frontend.sh   en/of   ./scaffold-backend.sh"
  exit 1
fi

echo ""
echo "✓ Draait. Ctrl+C stopt alles."
wait
