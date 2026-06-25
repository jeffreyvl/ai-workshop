# Architectuur — Verjaardags-felicitator

De app houdt de verjaardagen van je vrienden bij, laat zien wie er (binnenkort)
jarig is, en stelt lokaal een persoonlijke felicitatie op die je met één klik in
WhatsApp opent. Er is geen AI en geen API-key nodig. De vrienden worden lokaal op
deze pc bewaard in een simpel JSON-bestand.

## Onderdelen en hoe ze samenwerken

```mermaid
flowchart LR
    Gebruiker([👤 Medewerker]) -->|invullen + klikken| FE[React + Vite<br/>:5173]
    FE -->|fetch /api/...| BE[Express backend<br/>:3001]
    FE -->|stelt felicitatie op| Msg[messages.ts<br/>sjablonen per toon]
    BE -->|lees / schrijf| Data[(data.json<br/>vrienden)]
    FE -.->|wa.me link met bericht| WA[📲 WhatsApp]
```

## Datastroom — een felicitatie maken

```mermaid
sequenceDiagram
    participant G as 👤 Gebruiker
    participant FE as Frontend :5173
    participant BE as Backend :3001
    G->>FE: vult vriend in (naam, datum, toon, interesses)
    FE->>BE: POST /api/friends
    BE->>BE: opslaan in data.json
    Note over FE: App toont countdown<br/>en "vandaag jarig"
    G->>FE: klik "Felicitatie maken"
    Note over FE: messages.ts vult sjabloon<br/>(toon + naam + leeftijd + interesses)
    FE-->>G: toont bericht + knop "Open in WhatsApp"
    G->>FE: klik WhatsApp
    FE-->>G: opent wa.me met bericht al ingevuld
```

## Mapstructuur

```mermaid
flowchart TD
    root[sessie-01-donderdag/]
    root --> app[app/ — frontend]
    root --> backend[backend/ — backend]
    root --> dev[dev.sh — start alles]
    app --> apptsx[src/App.tsx — UI + felicitatie]
    app --> apiTs[src/api.ts — calls naar backend]
    app --> msgTs[src/messages.ts — felicitatie-sjablonen]
    app --> datesTs[src/dates.ts — verjaardag-rekenwerk]
    backend --> server[server.js — API/opslag]
    backend --> data[data.json — opgeslagen vrienden]
```

## Belangrijkste bestanden

| Bestand | Wat het doet |
|---------|--------------|
| `app/src/App.tsx` | Het scherm: formulier om vrienden toe te voegen, lijst met countdown, knop om de felicitatie te maken en in WhatsApp te openen |
| `app/src/messages.ts` | Stelt de felicitatie lokaal op uit sjablonen per toon — vult naam, leeftijd en interesses in (geen AI) |
| `app/src/api.ts` | Verbindt de frontend met de backend (vrienden ophalen/toevoegen/verwijderen) |
| `app/src/dates.ts` | Rekent uit wie er vandaag jarig is, hoeveel dagen tot de volgende verjaardag en welke leeftijd iemand wordt |
| `backend/server.js` | De server: bewaart vrienden in `data.json` |
| `backend/data.json` | De opgeslagen vrienden (wordt automatisch aangemaakt) |
