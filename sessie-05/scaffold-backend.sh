#!/usr/bin/env bash
# Snel Express (Node.js) backend scaffolden
# Gebruik: bash ../_template/scaffold-backend.sh

set -e

echo "→ Aanmaken Express backend..."
mkdir -p backend
cd backend

npm init -y --silent
npm install express cors --no-audit --no-fund --prefer-offline --silent

cat > server.js << 'EOF'
import express from "express";
import cors from "cors";

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "ok" });
});

// Voeg hier je endpoints toe

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✓ API draait op http://localhost:${PORT}`);
});
EOF

# Zet ESM-modus aan en voeg een start-script toe (live herladen met --watch)
node -e "const fs=require('fs');const p=require('./package.json');p.type='module';p.scripts={...p.scripts,start:'node --watch server.js'};fs.writeFileSync('./package.json',JSON.stringify(p,null,2))"

echo ""
echo "✓ Backend klaar (node --watch herstart bij elke wijziging)."
echo "  Start alles met hot reload:  ./dev.sh"
echo "  Alleen backend:              cd backend && npm start  → http://localhost:3001"
