# Definities — Dashboard Inclusieve Arbeidsmarkt

Dit document legt uit wat elk getal op het dashboard betekent en waar het vandaan komt.

> **Belangrijk vooraf.** De eerste versie van dit dashboard gebruikte **verzonnen
> demo-data**. Die is vervangen door **echte, openbare CBS-cijfers**. CBS publiceert
> deels andere begrippen dan de demo: vooral **standcijfers (het bestand)** per
> uitkeringssoort en per regio — niet rechtstreeks "uitstroom naar werk",
> "banenafspraak-percentage" of "re-integratie-slagingspercentage". Waar de demo zulke
> getallen verzon, tonen we nu wat CBS wél meet, of leiden we het af (bijvoorbeeld de
> **maand-op-maand verandering** van het bestand). Zo heeft elk getal op het scherm een
> echte, herleidbare bron.

## Bronnen (CBS StatLine Open Data, openbaar, geen sleutel nodig)

| Tabel | Titel | Gebruikt voor |
|-------|-------|---------------|
| **37789ksz** | Sociale zekerheid; kerncijfers, uitkeringen naar uitkeringssoort (maandreeks, × 1.000) | KPI's, trendgrafiek, donut, arbeidsongeschiktheid-staaf |
| **80794ned** | Personen met een uitkering; uitkeringsontvangers per regio | Provincietabel |
| **85615NED** | Personen met bijstand; (her)instromers en uitstromers (per kwartaal) | Grafiek "In- en uitstroom bijstand" |

Beide live opgehaald in de browser via `https://opendata.cbs.nl/ODataApi/odata/...`.

---

## KPI's (kerncijfers bovenaan)

### Wat het dashboard NU toont (echte CBS-cijfers, tabel 37789ksz)

Elke KPI toont het **bestand** (aantal lopende uitkeringen) in de laatste maand, plus
de **procentuele verandering t.o.v. de vorige maand**. Een stijging is rood (meer mensen
afhankelijk van een uitkering), een daling groen.

| KPI | Betekenis | CBS-veld |
|-----|-----------|----------|
| **Bijstand (< AOW-leeftijd)** | Mensen in de Participatiewet onder de AOW-leeftijd: inkomensvangnet voor wie geen ander inkomen of recht op een andere uitkering heeft. | `BijstandsuitkeringenTotDeAOWLeeftijd` |
| **WW-uitkeringen** | Lopende werkloosheidsuitkeringen na baanverlies; tijdelijk, op basis van arbeidsverleden. Conjunctuurgevoelig. | `NietSeizoengecorrigeerd` (Werkloosheidsuitkeringen) |
| **Wajong (jonggehandicapten)** | Mensen die al vóór hun werkzame leven een ziekte/handicap hadden — kern van de inclusieve arbeidsmarkt. | `WajongUitkeringen` |
| **Arbeidsongeschiktheid totaal** | WIA + WAO + Wajong samen: langdurige ziekte of arbeidsbeperking. | som van `TotaalWIAUitkeringen` + `WAOUitkeringen` + `WajongUitkeringen` |

### De oorspronkelijke demo-KPI's (verzonnen — niet langer in beeld)

| Term | Betekenis (demo) | Waarom vervangen |
|------|------------------|------------------|
| **Mensen met afstand tot arbeidsmarkt** | Mensen met een uitkering die (nog) niet werken en begeleiding nodig hebben om werk te vinden. | CBS meet dit niet als één getal; benaderd via het bestand per uitkeringssoort. |
| **Banenafspraak gerealiseerd** | % van de afgesproken extra banen voor mensen met een arbeidsbeperking dat is ingevuld (Sociaal Akkoord 2013; doel = 100%). | Geen openbare maand-tabel in 37789ksz/80794ned; daarom weggelaten. |
| **Uitstroom naar werk** | Aantal mensen dat in een maand de uitkering verlaat omdat ze betaald werk vinden. | CBS 37789ksz geeft het bestand, niet de reden van uitstroom; benaderd via maand-op-maand verandering. |
| **Re-integratie slaagt** | % re-integratietrajecten dat binnen 12 maanden tot een baan leidt. | Niet in deze CBS-tabellen; weggelaten. |

---

## Grafieken en tabellen

### Begrippen rond stromen (algemeen)

- **Instroom uitkering** — aantal mensen dat in een periode een uitkering *gaat ontvangen* (de "kraan erbij").
- **Uitstroom** — aantal mensen dat de uitkering *verlaat* (de "kraan eraf"). Is instroom > uitstroom, dan groeit het bestand.
- **Bestand** — het totale aantal mensen dat op een peilmoment een uitkering ontvangt (de "voorraad").

> **Nu met echte cijfers (bijstand).** De grafiek **"In- en uitstroom bijstand"** toont
> de werkelijke instroom en uitstroom per kwartaal uit CBS **85615NED**, plus het
> **saldo** (instroom − uitstroom) als lijn. Een positief saldo betekent dat het
> bijstandsbestand groeit. Let op: CBS 85615NED telt *alle* uitstroom uit de bijstand,
> niet alleen uitstroom *naar werk* — de reden van uitstroom staat er niet bij.
>
> De trendgrafiek toont daarnaast het **bestand per uitkeringssoort per maand**
> (37789ksz); de beweging van die lijn is het herleidbare equivalent van per saldo meer
> in- dan uitstroom, of omgekeerd.

### Grafiek — "In- en uitstroom bijstand"
Echte in- en uitstroom van de bijstand per kwartaal (CBS 85615NED), met het saldo als
lijn. Rode staaf = instroom, groene staaf = uitstroom, blauwe lijn = saldo (instroom −
uitstroom). Staat het saldo boven nul, dan groeit het bestand.
Bron: 85615NED (`Instromers`, `Uitstromers`, totaal over geslacht/leeftijd/herkomst).

### Trendgrafiek — "Ontwikkeling uitkeringen naar soort"
Het bestand per maand (× 1.000 personen) voor Bijstand, WW, Wajong, WIA en WAO.
Bron: 37789ksz, de beschikbare maanden van de reeks.

### Donut — "Uitkeringen naar soort"
Aandeel van elke uitkeringssoort in het totale bestand in de laatste maand.

- **Participatiewet / bijstand** — inkomensvangnet voor wie geen ander inkomen of recht op een andere uitkering heeft.
- **Wajong** — voor jonggehandicapten: mensen die al vóór hun werkzame leven een ziekte/handicap hadden.
- **WW** — werkloosheidsuitkering na baanverlies; tijdelijk, op basis van arbeidsverleden.
- **WIA / WGA** — arbeidsongeschiktheidsuitkering bij langdurige ziekte. WIA = de wet; **WGA** = regeling voor wie nog deels kan werken; **IVA** = volledig/duurzaam arbeidsongeschikt. **WAO** is de oude regeling van vóór 2006.

### Staafgrafiek — "Arbeidsongeschiktheid naar regeling"
Het bestand uitgesplitst naar WIA·WGA, WIA·IVA, WAO en Wajong (× 1.000), laatste maand.
Bron: 37789ksz (`WGAUitkeringen`, `IVAUitkeringen`, `WAOUitkeringen`, `WajongUitkeringen`).

> Dit vervangt de demo-grafiek **"Afstand tot de arbeidsmarkt"**. Die toonde verzonnen
> categorieën die CBS in deze tabellen niet publiceert. Voor de volledigheid de
> oorspronkelijke betekenis:
> - **Direct bemiddelbaar** — kan vrijwel meteen aan het werk.
> - **Korte afstand** — met beperkte ondersteuning binnen afzienbare tijd inzetbaar.
> - **Middellange afstand** — heeft scholing/begeleiding nodig.
> - **Grote afstand** — langdurige, intensieve ondersteuning nodig.
> - **Zorg/ontheffing** — (tijdelijk) vrijgesteld van de arbeidsverplichting (zorgtaken of gezondheid).

### Provincietabel — "Per provincie"
Bron: 80794ned, laatste beschikbare maand. Per provincie (CBS gebruikt hier de **12
provincies**, niet de 35 arbeidsmarktregio's uit de demo):

| Kolom | Betekenis | CBS-veld |
|-------|-----------|----------|
| **Provincie** | Een van de 12 provincies. | `RegioS` (PV-codes) |
| **Uitkeringen (< AOW)** | Aantal uitkeringsontvangers onder de AOW-leeftijd. | `TotDeAOWLeeftijd` |
| **Bijstand** | Bijstand(gerelateerd) tot de AOW-leeftijd. | `BijstandTotDeAOWLeeftijd` |
| **Arbeidsongeschikt** | Totaal arbeidsongeschiktheidsuitkeringen (WAO + WIA + Wajong). | `ArbeidsongeschiktheidTotaal` |
| **Aandeel AO** | Afgeleid: arbeidsongeschikt ÷ totaal (< AOW). Kleur: groen < 45%, oranje 45–54%, rood ≥ 55%. | berekend |

> **Arbeidsmarktregio** (demo) = een van de 35 regio's waarin gemeenten en UWV
> samenwerken aan arbeidsbemiddeling. In de echte CBS-versie zijn dit de 12 provincies.
> De demo-kolommen **Banenafspraak** en **Re-integratie slaagt** zijn vervangen door
> **Bijstand**, **Arbeidsongeschikt** en **Aandeel AO**, omdat die wél uit CBS komen.

---

## Signalen

Het signalenpaneel rechts wordt **automatisch afgeleid uit de echte cijfers** (geen
verzonnen tekst meer). Voorbeelden: de maand-op-maand verandering van WW en bijstand,
de trend in WIA over de getoonde periode, en de provincie met het hoogste aandeel
arbeidsongeschiktheid.

| Niveau | Betekenis |
|--------|-----------|
| **Urgent** (rood) | Knelpunt dat directe actie vraagt (bv. sterke stijging WW). |
| **Aandacht** (oranje) | Ontwikkeling om in de gaten te houden. |
| **Kans** (groen) | Positief resultaat of best practice om uit te bouwen. |
| **Actie** | De concrete vervolgstap die bij het signaal hoort. |

> De **acties** bij de signalen zijn beleidsmatige suggesties (geen CBS-data). De
> **constatering** waar het signaal op rust (de percentages en aantallen) komt
> rechtstreeks uit de CBS-cijfers en is dus herleidbaar.

---

## Samengevat: demo → echt

| Demo (verzonnen) | Nu (echte CBS-bron) |
|------------------|---------------------|
| Mensen met afstand tot arbeidsmarkt | Bestand per uitkeringssoort (37789ksz) |
| Banenafspraak gerealiseerd | *(weggelaten — geen openbare maandtabel)* |
| Uitstroom naar werk (los getal) | Echte in-/uitstroom bijstand per kwartaal (85615NED); reden "naar werk" niet apart |
| Re-integratie slaagt | *(weggelaten — niet in deze tabellen)* |
| Instroom vs. uitstroom (2 verzonnen lijnen) | Echte in-/uitstroom bijstand (85615NED) + bestand per soort per maand (37789ksz) |
| Afstand tot de arbeidsmarkt (staaf) | Arbeidsongeschiktheid naar regeling (staaf) |
| 35 arbeidsmarktregio's | 12 provincies (80794ned) |
| Banenafspraak % + Re-integratie % per regio | Bijstand, Arbeidsongeschikt, Aandeel AO per provincie |
| Verzonnen signalen met acties | Signalen afgeleid uit de cijfers; acties als suggestie |
