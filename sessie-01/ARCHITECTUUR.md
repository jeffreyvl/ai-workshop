# Architectuur — Stemwijzer

Een lokale Mentimeter-achtige app in de Rijkshuisstijl. Je stelt vragen met
antwoordopties op, laat mensen op deze pc stemmen, en bekijkt de resultaten als
staafdiagrammen met aantallen en percentages. Alles draait volledig in de
browser; er is geen server en geen internetverbinding nodig.

## Componenten

```mermaid
flowchart LR
    Gebruiker([Gebruiker]) -->|klik & typt| UI

    subgraph Browser[Browser op deze pc]
        UI[React + Vite UI<br/>:5173]
        NLDD[NL Design System<br/>nldd-* web components]
        Store[(localStorage<br/>menti-vragen-v1)]
        UI --- NLDD
        UI <-->|lees / schrijf| Store
    end

    classDef store fill:#e8eef6,stroke:#154273;
    class Store store;
```

De hele app is **frontend-only**. De NLDD web components leveren de
Rijkshuisstijl en toegankelijkheid; `localStorage` bewaart de vragen en stemmen
zodat ze na herladen behouden blijven.

## Datastroom — een stem uitbrengen

```mermaid
sequenceDiagram
    actor Gebruiker
    participant UI as React UI
    participant State as React state
    participant LS as localStorage

    Gebruiker->>UI: kiest een antwoord (Stemmen-scherm)
    UI->>State: registerVote(vraag, antwoord) → +1
    State->>LS: saveQuestions() (useEffect)
    State-->>UI: nieuwe staat → opnieuw renderen
    UI-->>Gebruiker: volgende vraag / "Bedankt"
    Note over Gebruiker,LS: Bij Resultaten leest de UI dezelfde state<br/>en tekent staafdiagrammen (CSS, geen library)
```

## De drie schermen

```mermaid
flowchart TD
    App[App.tsx<br/>tabs + gedeelde state] --> B[Vragen beheren<br/>ManageView]
    App --> S[Stemmen<br/>VoteView]
    App --> R[Resultaten<br/>ResultsView]
    B -->|maakt/verwijdert vragen| State[(questions in state + localStorage)]
    S -->|+1 stem per klik| State
    R -->|leest & visualiseert| State
    R --> Chart[BarChart.tsx<br/>CSS-staafdiagram]
```

## Mapstructuur

```
sessie-01/
├── ARCHITECTUUR.md          ← dit document
├── README.md                ← wat het is + hoe te starten
└── app/                     ← de Vite + React applicatie
    ├── index.html
    └── src/
        ├── main.tsx         ← opstart: registreert NLDD-componenten, mount React
        ├── App.tsx          ← tabnavigatie + gedeelde state + opslaglogica
        ├── ManageView.tsx   ← vragen + antwoordopties aanmaken/verwijderen
        ├── VoteView.tsx     ← stemmen, één vraag tegelijk
        ├── ResultsView.tsx  ← resultaten + export (JSON) + reset
        ├── BarChart.tsx     ← horizontale staafdiagrammen in pure CSS
        ├── storage.ts       ← lezen/schrijven naar localStorage
        ├── types.ts         ← datamodel (Question, Answer)
        ├── nldd.d.ts        ← TypeScript: staat <nldd-*> toe in JSX
        └── index.css        ← layout + NLDD-tokens (Rijkshuisstijl)
```
