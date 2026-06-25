# Architectuur — Dashboard Inclusieve Arbeidsmarkt

Een **signaaldashboard** dat ontwikkelingen rond uitkeringen, arbeidsongeschiktheid en
regionale verschillen in één oogopslag zichtbaar maakt. Het is een puur front-end app
die **live, echte cijfers** ophaalt bij **CBS StatLine Open Data** — geen backend of
database nodig. Beleidsmakers en uitvoerders zien zo direct waar actie nodig of mogelijk is.

## Architectuur

```mermaid
flowchart LR
    Gebruiker -->|opent in browser| Browser
    Browser -->|fetch CORS| CBS[("CBS StatLine<br/>Open Data API<br/>37789ksz · 80794ned · 85615NED")]

    subgraph Browser["Browser — React + Vite (:5176)"]
        App["App.tsx<br/>laadt & verdeelt data"]
        Cbs["cbs.ts<br/>ophalen + afleiden"]
        KPI[KPI-kaarten]
        Trend[Trendgrafiek]
        Signalen["Signalenpaneel<br/>afgeleid uit cijfers"]
        Verdeling[Donut + staafgrafiek]
        Tabel["Provincietabel<br/>sorteerbaar"]
    end

    CBS --> Cbs --> App
    App --> KPI & Trend & Signalen & Verdeling & Tabel
    KPI & Trend & Verdeling & Tabel -->|render| Recharts[("Recharts<br/>grafieken")]
```

Er is bewust **geen eigen backend, AI of database**: CBS levert de data via een
CORS-API die de browser rechtstreeks mag aanroepen. Dat houdt de stack zo eenvoudig
mogelijk én alle cijfers zijn echt en herleidbaar (zie `DEFINITIES.md`).

## Datastroom — wat gebeurt er als je het dashboard opent

```mermaid
sequenceDiagram
    participant G as Gebruiker
    participant A as App.tsx
    participant C as cbs.ts
    participant CBS as CBS Open Data
    participant R as Recharts

    G->>A: opent http://localhost:5176
    A->>C: haalDashboardData()
    C->>CBS: GET 37789ksz (maandreeks per soort)
    C->>CBS: GET 80794ned (per provincie)
    C->>CBS: GET 85615NED (in-/uitstroom bijstand)
    CBS-->>C: JSON met echte cijfers
    C-->>A: KPI's, trend, verdeling, regio's + afgeleide signalen
    A->>R: geeft data door aan grafieken
    R-->>G: tekent KPI's, grafieken en tabel
    G->>A: klikt op kolomkop in provincietabel
    A-->>G: hersorteert tabel direct (React state)
```

## Mapstructuur

```
sessie-06/
├── README.md                 ← wat is dit & hoe start je het
├── ARCHITECTUUR.md           ← dit document
├── dev.sh                    ← start de dev-server (HMR)
└── app/
    ├── index.html            ← HTML-startpunt
    ├── tailwind.config.js    ← Tailwind + rijksblauw accentkleur
    └── src/
        ├── main.tsx          ← mount React in de pagina
        ├── App.tsx           ← laadt CBS-data, toont laad-/foutstatus + secties
        ├── index.css         ← Tailwind basis-styling
        ├── cbs.ts            ← haalt CBS op, transformeert, leidt signalen af
        └── components/
            ├── KpiCard.tsx        ← kerncijfer met maand-op-maand trendpijl
            ├── TrendChart.tsx     ← bestand per soort per maand (lijngrafiek)
            ├── FlowChart.tsx      ← in-/uitstroom bijstand per kwartaal (+ saldo)
            ├── SignalenPanel.tsx  ← signalen (afgeleid uit de cijfers)
            ├── Donut.tsx          ← verdeling uitkeringssoorten
            ├── StaafVerdeling.tsx ← arbeidsongeschiktheid naar regeling
            └── RegioTabel.tsx     ← sorteerbare tabel per provincie
```

## Techkeuzes in het kort

| Onderdeel | Keuze | Waarom |
|-----------|-------|--------|
| Frontend | Vite + React + TypeScript | Snelste dev-server, type-veilig |
| Styling | Tailwind CSS | Snel, flexibel (geen overheidshuisstijl gewenst) |
| Grafieken | Recharts | Eenvoudige, mooie React-grafieken |
| Data | CBS StatLine Open Data (live) | Echte, openbare cijfers via CORS — geen backend/DB nodig |

Zie **`DEFINITIES.md`** voor de betekenis en exacte CBS-bron van elk getal.
