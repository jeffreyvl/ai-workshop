# Sessie: Verjaardags-felicitator

**Medewerker**: (overheidsmedewerker, naam onbekend)
**Datum**: 25 juni 2026
**Stack**: Vite + React + TypeScript + Tailwind (frontend) · Express (backend) · `data.json` (opslag) — **geen AI, geen API-key nodig**

## Wat we bouwen
Een app waarin je de verjaardagen van vrienden invult. De app toont wie er
vandaag jarig is en wie er binnenkort aan de beurt is, en stelt een
**persoonlijke felicitatie** op in de toon die je per vriend kiest (hartelijk,
grappig, formeel of kort), met de naam, leeftijd en interesses erin verwerkt. Met
één klik open je het bericht in WhatsApp — kant en klaar om te versturen. Zo
vergeet je nooit meer een verjaardag, ook zonder Facebook.

## Starten
```bash
# Start frontend + backend samen (beide met hot reload)
./dev.sh
```

Daarna te bekijken op: **http://localhost:5173**
(de backend-API draait op http://localhost:3001)

## Structuur
```
sessie-01-donderdag/
├── app/                      # Frontend (Vite + React + Tailwind)
│   └── src/
│       ├── App.tsx           # UI: formulier, lijst, felicitatie + WhatsApp-knop
│       ├── api.ts            # fetch-helpers naar de backend
│       ├── messages.ts       # felicitatie-sjablonen per toon (lokaal, geen AI)
│       └── dates.ts          # verjaardag-rekenwerk (countdown, leeftijd)
├── backend/                  # Backend (Express)
│   ├── server.js             # API: CRUD vrienden (opslag)
│   └── data.json             # opgeslagen vrienden (wordt automatisch aangemaakt)
├── dev.sh                    # start frontend + backend tegelijk
├── README.md                 # dit bestand
└── ARCHITECTUUR.md           # diagrammen van de opbouw
```

## Hoe de persoonlijke felicitatie werkt
Per vriend bewaar je: naam, geboortedatum, telefoonnummer (voor WhatsApp), een
toon en optioneel interesses. Bij "Felicitatie maken" stelt de app het berichtje
lokaal samen uit sjablonen (`app/src/messages.ts`): de gekozen toon bepaalt de
stijl, en naam, leeftijd en interesses worden ingevuld. Elke klik op "Andere
felicitatie" kiest een andere variant. De WhatsApp-knop maakt een `wa.me`-link met
het bericht al ingevuld. Er is geen AI en geen API-key nodig.
