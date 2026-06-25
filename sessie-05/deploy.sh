#!/usr/bin/env bash
# Fractie-Radar Volt Soest — lokaal deployen op macOS / Linux.
# Bouwt de frontend en serveert alles (pagina + API) via één poort.
#
# Gebruik:
#   ./deploy.sh            installeren (indien nodig) + bouwen (indien nodig) + starten
#   ./deploy.sh rebuild    frontend opnieuw bouwen en starten
#   PORT=3010 ./deploy.sh  op een andere poort draaien
#
# Stoppen: Ctrl+C.

set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DIR"

REBUILD=0
if [ "${1:-}" = "rebuild" ] || [ "${1:-}" = "--rebuild" ]; then REBUILD=1; fi

echo "=================================================="
echo "  Fractie-Radar Volt Soest — lokaal deployen"
echo "=================================================="
echo

# 1) Controleer Node.js + npm
if ! command -v node >/dev/null 2>&1; then
  echo "[FOUT] Node.js is niet gevonden."
  echo "       Installeer Node.js LTS (20 of 22) — zie LEESMIJ-MAC-LINUX.md."
  exit 1
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "[FOUT] npm is niet gevonden (hoort bij Node.js). Zie LEESMIJ-MAC-LINUX.md."
  exit 1
fi
echo "Node.js $(node -v) en npm $(npm -v) gevonden."
echo

# 2) Backend-pakketten (eenmalig)
if [ ! -d backend/node_modules ]; then
  echo "[1/3] Backend-pakketten installeren (eenmalig)..."
  ( cd backend && npm install --no-audit --no-fund )
else
  echo "[1/3] Backend-pakketten al aanwezig — overslaan."
fi

# 3) Frontend-pakketten (eenmalig)
if [ ! -d app/node_modules ]; then
  echo "[2/3] Frontend-pakketten installeren (eenmalig)..."
  ( cd app && npm install --no-audit --no-fund )
else
  echo "[2/3] Frontend-pakketten al aanwezig — overslaan."
fi

# 4) Frontend bouwen (indien nog niet gebeurd, of bij 'rebuild')
if [ "$REBUILD" = 1 ] || [ ! -f app/dist/index.html ]; then
  echo "[3/3] Frontend bouwen..."
  ( cd app && npm run build )
else
  echo "[3/3] Frontend al gebouwd — overslaan ('./deploy.sh rebuild' om opnieuw te bouwen)."
fi

PORT="${PORT:-3005}"
URL="http://localhost:${PORT}"
export PORT

echo
echo "--------------------------------------------------"
if [ -f backend/.env ]; then
  echo "Modus: backend/.env gevonden — AI-modus mogelijk."
else
  echo "Modus: geen backend/.env — nieuws-modus (echte RSS-artikelen)."
  echo "  Tip: zet ANTHROPIC_API_KEY in backend/.env voor AI-analyse."
fi
echo "--------------------------------------------------"
echo
echo "Server start op ${URL} — Ctrl+C om te stoppen."

# Open de browser na 3 seconden (server moet eerst opstarten)
opener=""
if   command -v xdg-open >/dev/null 2>&1; then opener="xdg-open"   # Linux
elif command -v open     >/dev/null 2>&1; then opener="open"       # macOS
fi
if [ -n "$opener" ]; then
  ( sleep 3; "$opener" "$URL" >/dev/null 2>&1 || true ) &
fi

cd backend

# Node 20.12+/22 ondersteunt --env-file-if-exists; anders laden we .env zelf.
if node --env-file-if-exists=/dev/null -e "" >/dev/null 2>&1; then
  exec node --env-file-if-exists=.env server.js
else
  if [ -f .env ]; then set -a; . ./.env; set +a; fi
  exec node server.js
fi
