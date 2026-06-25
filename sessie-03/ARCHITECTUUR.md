# Architectuur — Architectuur-validatietool

Een dashboard dat een **ArchiMate Exchange-XML** (architectuurrepository met business-,
informatie-, applicatie- en technologielaag) inleest en toetst aan een **metamodel**.
Het toont per laag de afwijkingen, met grafieken en een filterbare bevindingenlijst.
Alles draait lokaal in de browser — er gaat geen data naar een server.

## Architectuur

```mermaid
flowchart LR
    Gebruiker -->|upload XML / kies voorbeeld| UI[React-dashboard<br/>Vite + Tailwind<br/>:5173]
    UI -->|tekst| Parser[archimate.ts<br/>XML-parser via DOMParser]
    Parser -->|model: elementen + relaties| Validator[validate.ts<br/>validatie-engine]
    Regels[(metamodel.ts<br/>eigen regels)] --> Validator
    Standaard[(ArchiMate<br/>relatieregels)] --> Validator
    Validator -->|bevindingen| UI
    UI -->|grafieken + lijst| Gebruiker
```

De vier bouwstenen:

| Onderdeel | Bestand | Rol |
|-----------|---------|-----|
| **Parser** | `src/archimate.ts` | Leest de Exchange-XML namespace-veilig in tot een `AmModel` (elementen, relaties, properties). |
| **Metamodel** | `src/metamodel.ts` | De eigen regels: laagindeling, toegestane laagovergangen, verplichte attributen, verplichte koppelingen, naamgeving. **Hier pas je de regels aan.** |
| **Validator** | `src/validate.ts` | Past het metamodel + standaard ArchiMate-regels toe en levert een lijst `Finding`s. |
| **Dashboard** | `src/App.tsx` | KPI's, grafieken (recharts) en de filterbare bevindingenlijst. |

## Datastroom — wat gebeurt er bij een validatie

```mermaid
sequenceDiagram
    actor Gebruiker
    participant UI as Dashboard
    participant P as Parser (archimate.ts)
    participant V as Validator (validate.ts)
    participant M as Metamodel (metamodel.ts)

    Gebruiker->>UI: upload ArchiMate Exchange-XML
    UI->>P: parseArchimate(xml)
    P-->>UI: model {elementen, relaties, properties}
    UI->>V: validate(model)
    V->>M: lees regels (lagen, attributen, koppelingen)
    V-->>UI: bevindingen[] (ernst, categorie, laag, uitleg)
    UI-->>Gebruiker: KPI's + grafieken + gefilterde lijst
```

## Welke checks draaien er

```mermaid
flowchart TD
    Model[Gevalideerd model] --> C1[1. Laagovergangen<br/>bron-laag → doel-laag toegestaan?]
    Model --> C2[2. Verplichte attributen<br/>Eigenaar, Status, documentatie]
    Model --> C3[3. Verplichte koppelingen<br/>app→technologie, proces→app, app→informatie]
    Model --> C4[4. Naamgeving & dubbelen<br/>lege namen, conventie, dubbel, wees-elementen]
    Model --> C5[5. Standaard ArchiMate<br/>Access naar passief, geen dangling/zelf-relaties]
    C1 & C2 & C3 & C4 & C5 --> F[Bevindingen<br/>fout / waarschuwing / info]
```

## Mapstructuur

```
sessie-03/
  ARCHITECTUUR.md          ← dit document
  README.md                ← wat het is en hoe je het start
  dev.sh                   ← start de frontend (HMR)
  app/
    index.html
    src/
      App.tsx              ← dashboard: KPI's, grafieken, filters, lijst
      MetamodelPanel.tsx   ← popup die de actieve regels toont
      archimate.ts         ← parser voor ArchiMate Exchange-XML
      metamodel.ts         ← HET METAMODEL: alle eigen regels (pas hier aan)
      validate.ts          ← validatie-engine (metamodel + ArchiMate-regels)
      sampleModel.ts       ← voorbeeld-XML met bewuste fouten
      types.ts             ← datamodel + labels/kleuren per laag
    public/
      voorbeeld-vergunningverlening.xml   ← downloadbaar voorbeeldbestand
```
