# Fractie-Radar op macOS / Linux draaien (vanaf nul)

Deze handleiding zet de app op een **Mac** of **Linux-pc** op die nog niets heeft.
Aan het eind draait alles op één adres in je browser: **http://localhost:3005**.

Twee modi:
- **Nieuws-modus** (zonder sleutel): echte, actuele artikelen via nieuws-RSS.
- **AI-modus** (met Anthropic API-sleutel): Claude zoekt live op het web en maakt op maat
  gemaakte raadsvragen.

---

## Stap 1 — Benodigdheden installeren

Je hebt **Node.js** (versie 20 of 22, "LTS") nodig. `npm` zit daar automatisch bij.
Controleer eerst of je het al hebt — open een **Terminal** en typ:

```bash
node -v
```

Zie je een versie als `v20.x` of `v22.x`? Dan kun je door naar **Stap 2**.
Komt er `command not found`, of een versie lager dan 20? Installeer Node.js hieronder.

### macOS

**Optie A — installer (makkelijkst):**
1. Ga naar **https://nodejs.org/**
2. Download de **LTS**-versie (knop links) en open het `.pkg`-bestand.
3. Doorloop de installatie met de standaardinstellingen.

**Optie B — via Homebrew** (als je Homebrew gebruikt):
```bash
# Homebrew zelf installeren (alleen als 'brew -v' niet werkt):
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js installeren:
brew install node
```

> Eerste keer een Terminal-tool gebruiken? macOS vraagt mogelijk om de
> "Command Line Tools" te installeren — klik op **Installeren** en wacht tot het klaar is.

### Linux

Distributie-pakketten zijn vaak verouderd. De schoonste manier is **nvm** (Node Version
Manager), die voor elke distributie werkt zonder `sudo`:

```bash
# 1) nvm installeren
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# 2) Terminal opnieuw openen (of dit uitvoeren):
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"

# 3) Node.js LTS installeren en activeren
nvm install --lts
nvm use --lts
```

**Alternatief via de pakketbeheerder** (controleer daarna dat `node -v` ≥ 20 is):
```bash
# Debian / Ubuntu
sudo apt update && sudo apt install -y nodejs npm

# Fedora
sudo dnf install -y nodejs

# Arch
sudo pacman -S nodejs npm
```

> Heb je `curl` of `git` nog niet? Installeer die met je pakketbeheerder
> (bijv. `sudo apt install -y curl git`).

Controleer tot slot:
```bash
node -v   # bijv. v22.x
npm -v    # bijv. 10.x
```

## Stap 2 — De projectmap op de pc zetten

Kopieer de map **`sessie-05`** naar je pc (bijvoorbeeld naar je Home-map). Daarin staan:

```
sessie-05/
  app/                  de frontend (React + Vite)
  backend/              de server (Express + Claude/RSS)
  deploy.sh             <-- hiermee bouw en start je alles
  LEESMIJ-MAC-LINUX.md  deze handleiding
```

## Stap 3 (optioneel) — Anthropic API-sleutel toevoegen (voor AI-modus)

Wil je de AI-analyse met op maat gemaakte raadsvragen? Maak een `.env`-bestand in `backend`:

```bash
cd sessie-05/backend
cp .env.example .env
# open .env in een editor en vul je sleutel in:
#   ANTHROPIC_API_KEY=sk-ant-...jouw-sleutel...
cd ..
```

Zonder dit bestand werkt de app prima in **nieuws-modus**. De sleutel blijft op je eigen pc.

## Stap 4 — Bouwen en starten

Vanuit de map `sessie-05`:

```bash
./deploy.sh
```

De eerste keer installeert het script de onderdelen en bouwt het de app (een paar minuten;
daarna gaat het snel). Vervolgens:
- start de server op **http://localhost:3005**;
- opent je browser daar automatisch.

> Krijg je `permission denied`? Maak het script eenmalig uitvoerbaar:
> ```bash
> chmod +x deploy.sh
> ./deploy.sh
> ```

## Stoppen

Druk in de Terminal op **Ctrl + C**. De server stopt dan. De volgende keer typ je weer
`./deploy.sh`.

---

## Handige opties

**Frontend opnieuw bouwen** (na codewijzigingen):
```bash
./deploy.sh rebuild
```

**Een andere poort gebruiken** (bijv. als 3005 bezet is):
```bash
PORT=3010 ./deploy.sh
# open daarna http://localhost:3010
```

---

## Veelvoorkomende meldingen

**`command not found: node`**
Node.js is niet (goed) geïnstalleerd, of de Terminal stond nog open van vóór de
installatie. Doe Stap 1 en open een **nieuwe** Terminal. Bij nvm: `nvm use --lts`.

**`permission denied: ./deploy.sh`**
Maak het script uitvoerbaar: `chmod +x deploy.sh` en probeer opnieuw.

**`EADDRINUSE` / "address already in use" (poort 3005 bezet)**
Er draait al iets op poort 3005. Start op een andere poort: `PORT=3010 ./deploy.sh`.

**Wijziging in de code niet zichtbaar?**
De frontend draait als gebouwde versie. Bouw opnieuw: `./deploy.sh rebuild`.

**`.env not found. Continuing without it.`**
Dit is gewoon een melding, geen fout: er is geen `backend/.env`, dus de app draait in
nieuws-modus. Voeg een `.env` toe (Stap 3) voor AI-modus.
