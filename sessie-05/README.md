# Sessie: Fractie-Radar voor Volt Soest

**Medewerker**: Eenmansfractie Volt — gemeente Soest
**Datum**: 25 juni 2026
**Stack**: Vite + React + TypeScript + Tailwind (frontend) · Express (backend) · Claude (Anthropic) met live web search

## Wat we bouwen
Een briefing-dashboard dat **live op het web zoekt** naar belangrijke ontwikkelingen —
lokaal (Soest), regionaal (Eemland/provincie Utrecht), landelijk, Europees en geopolitiek — en die per onderwerp samenvat
met een inschatting "waarom dit relevant is" en **kant-en-klare, scherpe vragen** die je
als raadslid aan het college kunt stellen of waarmee je een debat opent.

Je kunt optioneel een **focusthema** opgeven (bijv. "woningbouw" of "EU-defensie");
de assistent geeft dat thema dan extra gewicht. Resultaten zijn te filteren op
schaalniveau en elk item toont de gebruikte bronnen.

> **Op een andere pc zetten?** Vanaf nul opzetten (incl. Node.js installeren):
> **macOS/Linux** → [LEESMIJ-MAC-LINUX.md](./LEESMIJ-MAC-LINUX.md) (`./deploy.sh`) ·
> **Windows** → [LEESMIJ-WINDOWS.md](./LEESMIJ-WINDOWS.md) (dubbelklik `windows-start.bat`).
> Alles draait dan op één adres: http://localhost:3005

## Starten
```bash
./dev.sh
```

### Waar zet ik de Anthropic API-key? (voor AI-modus)
Kies één van deze manieren:

1. **In een `.env`-bestand (aanbevolen)** — maak `backend/.env` aan:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
   (Zie `backend/.env.example`.) De backend laadt dit automatisch. Daarna `./dev.sh`.
   Het bestand staat in `.gitignore`, dus je sleutel wordt nooit gecommit.

2. **Eenmalig op de commandoregel**:
   ```bash
   ANTHROPIC_API_KEY=sk-ant-... ./dev.sh
   ```

Zonder key draait de app in **nieuws-modus** (echte RSS-artikelen) — ook prima om te demonstreren.

Daarna te bekijken op: http://localhost:5173
De backend-API draait op http://localhost:3005

> **Twee modi (geen nepdata):**
> - **AI-modus** — mét `ANTHROPIC_API_KEY`: Claude zoekt live op het web en levert een
>   geanalyseerde briefing met op maat gemaakte raadsvragen.
> - **Nieuws-modus** — zónder key: de app haalt **echte, actuele artikelen** op via
>   nieuws-RSS (Google News, query per categorie + recency-filter), gefilterd op je
>   focusthema. Items tonen bron, datum en algemene start-vragen. Een blauwe balk geeft
>   de modus aan.

> **Poort:** deze sessie gebruikt backend-poort **3005** (3001 was al in gebruik door
> een andere sessie). Te overrulen met `PORT=...`.

## Lokaal deployen (alles op één poort)
Voor een nette lokale installatie wordt de frontend gebouwd en serveert de
Express-backend zowel de pagina als de API — alles op **http://localhost:3005**,
zonder Vite en zonder CORS. Eén commando regelt installeren + bouwen + starten:

| Platform | Vanaf nul opzetten | Uitgebreide handleiding (incl. installatie) |
|----------|--------------------|---------------------------------------------|
| **macOS / Linux** | `./deploy.sh` | [LEESMIJ-MAC-LINUX.md](./LEESMIJ-MAC-LINUX.md) |
| **Windows** | dubbelklik `windows-start.bat` | [LEESMIJ-WINDOWS.md](./LEESMIJ-WINDOWS.md) |

Beide scripts zijn **idempotent**: de eerste keer installeren + bouwen ze, daarna
starten ze direct. Opties (macOS/Linux): `./deploy.sh rebuild` (opnieuw bouwen),
`PORT=3010 ./deploy.sh` (andere poort).

Handmatig kan ook:
```bash
cd app && npm install && npm run build && cd ..
cd backend && npm install && node --env-file-if-exists=.env server.js
```

## Structuur
```
sessie-05/
  app/                    ← Vite + React + TypeScript frontend (Tailwind)
    src/App.tsx           ← het dashboard: focus-invoer, filters, briefing-kaarten
    src/index.css         ← Tailwind-import
    dist/                 ← gebouwde frontend (na 'npm run build') — door backend geserveerd
  backend/
    server.js             ← Express: serveert app/dist + POST /api/briefing (AI of nieuws-RSS)
    .env.example          ← sjabloon; kopieer naar .env en zet je ANTHROPIC_API_KEY erin
  dev.sh                  ← dev-modus: frontend (Vite, 5173) + backend (3005), hot reload
  deploy.sh               ← macOS/Linux: installeren + bouwen + starten (één poort)
  windows-start.bat       ← Windows: installeren + bouwen + starten in één klik
  windows-herbouwen.bat   ← Windows: frontend opnieuw bouwen na wijzigingen
  LEESMIJ-MAC-LINUX.md    ← macOS/Linux-handleiding (vanaf nul, incl. Node.js installeren)
  LEESMIJ-WINDOWS.md      ← Windows-handleiding (vanaf nul, incl. Node.js installeren)
  ARCHITECTUUR.md         ← architectuur- en datastroomdiagrammen (Mermaid)
  architectuur.html       ← zelfde diagrammen, direct in de browser te bekijken
```

## Hoe het werkt (kort)
1. De gebruiker geeft optioneel een focusthema op en klikt op "Genereer briefing".
2. De frontend doet `POST /api/briefing` naar de Express-backend.
3. De backend kiest een modus op basis van de aanwezigheid van een API-key:
   - **AI-modus**: Claude (`claude-opus-4-8`) zoekt live met de **web search**-tool,
     weegt lokale relevantie voor Soest en levert 6–8 geanalyseerde ontwikkelingen op.
   - **Nieuws-modus**: de backend haalt per categorie (Lokaal/Regionaal/Landelijk/Europees/
     Geopolitiek) echte artikelen op via nieuws-RSS, gefilterd op het focusthema, en
     bepaalt urgentie op basis van hoe recent het artikel is.
4. Het antwoord komt als JSON terug; de frontend toont het als filterbare kaarten met
   per item: categorie, urgentie, samenvatting, relevantie, vragen en bronnen.
