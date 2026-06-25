#!/usr/bin/env bash
# Snel Vite+React frontend scaffolden MET hot reload, in de huidige sessie-folder
# Gebruik: bash ../_template/scaffold-frontend.sh
# Of kopieer dit script naar je sessie-folder en run: ./scaffold-frontend.sh

set -e

echo "→ Aanmaken Vite + React + TypeScript frontend..."
# Vite-template kopieren (geen prompts) en snel installeren (geen audit/funding-checks)
npm create vite@latest app -- --template react-ts
cd app
npm install --no-audit --no-fund --prefer-offline --silent

echo ""
echo "✓ Frontend klaar (Vite HMR staat standaard aan)."
echo "  Start alles met hot reload:  ./dev.sh"
echo "  Alleen frontend:             cd app && npm run dev -- --open  → http://localhost:5173"
