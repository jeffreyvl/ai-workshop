# Sessie: Stemwijzer (Mentimeter-app)

**Medewerker**: Nederlandse overheid (hackathon-showcase)
**Datum**: 25 juni 2026
**Stack**: Vite + React + TypeScript · NL Design System · localStorage

## Wat we bouwen

Een lokale Mentimeter-achtige stem-app in de Rijkshuisstijl. Je stelt vragen
met antwoordopties op, laat mensen op deze pc stemmen (één vraag tegelijk), en
bekijkt de resultaten later terug als staafdiagrammen met aantallen en
percentages. De resultaten kun je exporteren naar JSON. Alles draait in de
browser — geen server, geen internet nodig; vragen en stemmen blijven bewaard
in `localStorage`.

## Starten

```bash
cd app
npm install      # eenmalig
npm run dev      # start de dev-server
```

Daarna te bekijken op: http://localhost:5173

## Gebruik

1. **Vragen beheren** — voeg een vraag toe met minimaal twee antwoordopties.
2. **Stemmen** — loop door de vragen heen; elke klik op een antwoord telt als
   één stem (ideaal als demo-kiosk waar mensen om de beurt stemmen).
3. **Resultaten** — bekijk per vraag de staafdiagrammen, het meest gekozen
   antwoord en het totaal. Exporteer naar JSON of zet de stemmen weer op nul.

## Structuur

- `app/src/App.tsx` — tabnavigatie en gedeelde state (de bron van waarheid).
- `app/src/ManageView.tsx` / `VoteView.tsx` / `ResultsView.tsx` — de drie schermen.
- `app/src/BarChart.tsx` — staafdiagrammen in pure CSS (geen chart-library).
- `app/src/storage.ts` — opslag in `localStorage`.
- Zie `ARCHITECTUUR.md` voor diagrammen van de opzet en datastroom.
