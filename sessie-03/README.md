# Sessie: Architectuurrepository valideren tegen metamodel

**Medewerker**: overheidsmedewerker (showcase)
**Datum**: 25 juni 2026
**Stack**: Vite + React + TypeScript + Tailwind CSS + recharts (frontend-only, geen backend)

## Wat we bouwen

Een interactief dashboard dat een **ArchiMate Exchange-XML** (een architectuurrepository
met business-, informatie-, applicatie- en technologielaag) inleest en valideert tegen
een **metamodel**. Het toetst zowel de **standaard ArchiMate-relatieregels** als je
**eigen metamodel-regels** (toegestane laagovergangen, verplichte attributen, verplichte
koppelingen, naamgeving & dubbelen) en toont de afwijkingen per laag met grafieken en een
filterbare bevindingenlijst. Alles draait lokaal in de browser — er gaat geen data naar
een server.

## Starten

```bash
cd sessie-03
./dev.sh
```

Daarna te bekijken op: **http://localhost:5173** (of 5174 als 5173 bezet is).

Klik op **"Laad voorbeeldmodel"** voor een direct gevuld dashboard, of upload je eigen
ArchiMate Exchange-XML met **"XML uploaden"**.

## De validatieregels aanpassen

Het hart van de tool is **`app/src/metamodel.ts`**. Daar pas je aan:

- **Laagindeling** — welk ArchiMate-elementtype bij welke laag hoort.
- **Toegestane laagovergangen** — welke relaties tussen lagen mogen.
- **Verplichte attributen** — bijv. `Eigenaar`/`Status` per laag, plus documentatie.
- **Verplichte koppelingen** — bijv. elke applicatiecomponent op de technologielaag.
- **Naamgeving** — naamconventie, lege/dubbele namen, wees-elementen.

In het dashboard toont de knop **"Toon metamodel-regels"** altijd de actuele regels.

## Structuur

| Bestand | Rol |
|---------|-----|
| `app/src/archimate.ts` | Parser voor de ArchiMate Exchange-XML (browser, DOMParser). |
| `app/src/metamodel.ts` | **Het metamodel** — alle eigen validatieregels. |
| `app/src/validate.ts` | Validatie-engine: metamodel + standaard ArchiMate-regels → bevindingen. |
| `app/src/App.tsx` | Dashboard: KPI's, grafieken, filters, bevindingenlijst. |
| `app/src/MetamodelPanel.tsx` | Popup die de actieve regels toont. |
| `app/src/sampleModel.ts` | Voorbeeldmodel (vergunningverlening) met bewuste fouten. |
| `app/public/voorbeeld-vergunningverlening.xml` | Hetzelfde voorbeeld als los, downloadbaar bestand. |

Zie **`ARCHITECTUUR.md`** voor diagrammen van de opzet.
