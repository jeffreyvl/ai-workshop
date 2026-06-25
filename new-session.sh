#!/usr/bin/env bash
# Start een nieuwe showcase-sessie — maakt folder aan en opent Claude Code direct
# Gebruik: ./new-session.sh
#          ./new-session.sh "optionele naam als je die al weet"

set -e

BASE_DIR="$(cd "$(dirname "$0")" && pwd)"

# Bepaal het sessienummer (laagste beschikbare)
# Matcht zowel "sessie-01" als "sessie-01-naam"
N=1
while compgen -G "$BASE_DIR/sessie-$(printf '%02d' $N)" > /dev/null || \
      compgen -G "$BASE_DIR/sessie-$(printf '%02d' $N)-*" > /dev/null; do
  N=$((N + 1))
done

NUM=$(printf '%02d' $N)

if [ -n "$1" ]; then
  SLUG=$(echo "$1" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | tr -cd 'a-z0-9-')
  SESSION_DIR="$BASE_DIR/sessie-$NUM-$SLUG"
else
  SESSION_DIR="$BASE_DIR/sessie-$NUM"
fi

echo "→ Sessie $NUM aanmaken in: $SESSION_DIR"
mkdir -p "$SESSION_DIR"

# Kopieer CLAUDE.md template (intake-instructie voor Claude)
cp "$BASE_DIR/_template/CLAUDE.md" "$SESSION_DIR/CLAUDE.md"

# Kopieer scaffold- en dev-scripts als referentie
cp "$BASE_DIR/_template/scaffold-frontend.sh" "$SESSION_DIR/"
cp "$BASE_DIR/_template/scaffold-backend.sh" "$SESSION_DIR/"
cp "$BASE_DIR/_template/dev.sh" "$SESSION_DIR/"
chmod +x "$SESSION_DIR/scaffold-frontend.sh" "$SESSION_DIR/scaffold-backend.sh" "$SESSION_DIR/dev.sh"

echo "✓ Sessie-folder klaar"
echo ""

# Start Claude Code in de sessie-folder met de root als extra context
# De initiële prompt triggert de intake-flow uit CLAUDE.md direct
cd "$SESSION_DIR"
exec claude --add-dir "$BASE_DIR" \
  "Voer de intake uit zoals beschreven in CLAUDE.md: begroet de medewerker en vraag wat ze willen bouwen."
