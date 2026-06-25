# Architectuur — Fractie-Radar Volt Soest

Een briefing-dashboard dat live op het web zoekt naar belangrijke ontwikkelingen
(lokaal, regionaal, landelijk, Europees, geopolitiek) en die voor een raadslid omzet in
samenvattingen plus concrete vragen voor het college. De frontend toont de
resultaten als filterbare kaarten; de backend laat Claude live web search doen.

## Architectuur

De backend kiest één van twee databronnen op basis van de aanwezigheid van een
`ANTHROPIC_API_KEY`.

```mermaid
flowchart LR
    Gebruiker -->|focusthema + klik| Frontend["React + Vite + Tailwind<br/>:5173"]
    Frontend -->|POST /api/briefing| Backend["Express<br/>:3005"]
    Backend -->|met key: AI-modus| Claude[("Claude<br/>claude-opus-4-8")]
    Claude -->|web_search tool| Web[("Live web")]
    Web --> Claude
    Backend -->|zonder key: nieuws-modus| RSS[("Nieuws-RSS<br/>Google News")]
    Claude -->|JSON-briefing| Backend
    RSS -->|artikelen| Backend
    Backend -->|items + bronnen| Frontend
    Frontend -->|kaarten met vragen| Gebruiker
```

## Datastroom

```mermaid
sequenceDiagram
    actor R as Raadslid
    participant F as Frontend (5173)
    participant B as Backend (3005)
    participant C as Claude API
    participant W as Web search

    R->>F: vult focusthema in, klikt "Genereer briefing"
    F->>B: POST /api/briefing { focus }
    B->>C: prompt + web_search tool (streaming)
    C->>W: zoekopdrachten (lokaal/regionaal/landelijk/EU/geopolitiek)
    W-->>C: zoekresultaten + bronnen
    C-->>B: JSON met 6–8 ontwikkelingen
    B-->>F: { items: [...], gegenereerd_op }
    F-->>R: filterbare kaarten: samenvatting, relevantie, vragen, bronnen
```

## Mapstructuur

```mermaid
flowchart TD
    root["sessie-05/"] --> app["app/ — frontend"]
    root --> backend["backend/ — API"]
    root --> dev["dev.sh — start beide samen"]
    root --> arch["ARCHITECTUUR.md / architectuur.html"]
    app --> apptsx["src/App.tsx — dashboard + kaarten"]
    app --> css["src/index.css — Tailwind"]
    backend --> server["server.js — POST /api/briefing → Claude + web search"]
```

- **app/src/App.tsx** — het dashboard: focus-invoer, categoriefilters en de briefing-kaarten.
- **app/src/index.css** — laadt Tailwind in.
- **backend/server.js** — Express-API; `POST /api/briefing` bouwt de prompt, roept Claude met de web-search-tool aan en geeft gestructureerde JSON terug.
- **dev.sh** — start frontend (Vite HMR, :5173) en backend (`node --watch`, :3005) tegelijk.
