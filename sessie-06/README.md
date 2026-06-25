# Sessie: Dashboard inclusieve arbeidsmarkt

**Medewerker**: Nederlandse overheid (AI-showcase)
**Datum**: 25 juni 2026
**Stack**: Vite + React + TypeScript + Tailwind CSS + Recharts (puur front-end, geen backend)
**Databron**: CBS StatLine Open Data — **live & echt** (tabellen 37789ksz en 80794ned)

## Wat we bouwen
Een **signaaldashboard voor de inclusieve arbeidsmarkt** met **echte, openbare
CBS-cijfers**. Het maakt ontwikkelingen rond uitkeringen, arbeidsongeschiktheid en
regionale verschillen in één oogopslag zichtbaar, zodat beleidsmakers en uitvoerders
kunnen signaleren en sturen. Het toont kerncijfers (KPI's met maand-op-maand
verandering), de trend van het bestand per uitkeringssoort, een signalenlijst die
automatisch uit de cijfers wordt **afgeleid**, verdelingen naar uitkeringssoort en
arbeidsongeschiktheidsregeling, en een sorteerbare tabel per provincie. De browser
haalt de cijfers live op bij CBS (CORS), dus er is geen eigen backend nodig.

> Zie **`DEFINITIES.md`** voor de betekenis en exacte CBS-bron van elk getal.

## Starten
```bash
./dev.sh
# of alleen de frontend:
cd app && npm run dev
```

Daarna te bekijken op: **http://localhost:5176**
> Let op: Vite kiest automatisch een vrije poort. Draaien er al andere sessies, dan
> kan het 5173, 5174, 5175 of 5176 zijn — kijk in de terminaluitvoer naar de
> "Local:"-regel.

## Structuur
- `app/src/cbs.ts` — haalt de CBS-cijfers op, transformeert ze en leidt de signalen af.
  Hier staan ook de gebruikte tabel-ID's en veldnamen.
- `app/src/App.tsx` — laadt de data (met laad-/foutstatus) en verdeelt over de secties.
- `app/src/components/` — de losse onderdelen (KPI-kaarten, grafieken, signalen,
  provincietabel).
- `DEFINITIES.md` — betekenis en exacte CBS-bron van elk getal (demo vs. echt).
- `ARCHITECTUUR.md` — visuele uitleg van de opbouw (Mermaid-diagrammen).
- `architectuur.html` — open dit bestand om de diagrammen in de browser te zien.

> **Internet nodig.** De cijfers komen live van `opendata.cbs.nl`. Zonder verbinding
> toont het dashboard een nette foutmelding.
