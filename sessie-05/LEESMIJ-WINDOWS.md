# Fractie-Radar op een Windows-pc draaien (vanaf nul)

Deze handleiding zet de app op een **Windows-pc** op die nog niets heeft. Aan het
eind draait alles op één adres in je browser: **http://localhost:3005**.

De app heeft twee modi:
- **Nieuws-modus** (zonder sleutel): haalt echte, actuele artikelen op via nieuws-RSS.
- **AI-modus** (met Anthropic API-sleutel): laat Claude live op het web zoeken en maakt
  op maat gemaakte raadsvragen.

---

## Stap 1 — Node.js installeren (eenmalig)

1. Ga naar **https://nodejs.org/**
2. Download de **LTS**-versie (20 of 22) en installeer met de standaardinstellingen.
3. Klaar — je hoeft verder niets te configureren.

> Node.js bevat ook `npm`, dat de scripts gebruiken. Een herstart van de pc is niet nodig,
> maar open na de installatie wel een **nieuw** venster.

## Stap 2 — De projectmap op de pc zetten

Kopieer de hele map **`sessie-05`** naar de Windows-pc (bijvoorbeeld naar je Bureaublad).
In die map staan onder andere:

```
sessie-05\
  app\                    de frontend (React + Vite)
  backend\                de server (Express + Claude/RSS)
  windows-start.bat       <-- hiermee start je alles
  windows-herbouwen.bat   frontend opnieuw bouwen na wijzigingen
  LEESMIJ-WINDOWS.md       deze handleiding
```

> Kopieer je een bestaande map met al een `node_modules`-map mee? Dan kun je die mappen
> beter weggooien en het startscript opnieuw laten installeren.

## Stap 3 (optioneel) — Anthropic API-sleutel toevoegen (voor AI-modus)

Wil je de AI-analyse met op maat gemaakte raadsvragen?

1. Ga in de map naar **`backend`**.
2. Maak een nieuw tekstbestand met exact de naam **`.env`** (dus zónder iets ervoor).
   - Tip: kopieer `backend\.env.example` en hernoem de kopie naar `.env`.
3. Zet er één regel in:
   ```
   ANTHROPIC_API_KEY=sk-ant-...jouw-sleutel...
   ```
4. Opslaan. Het startscript laadt dit automatisch.

> Zonder dit bestand werkt de app prima in **nieuws-modus**. De sleutel wordt nooit
> meegestuurd of opgeslagen buiten je eigen pc.

## Stap 4 — Starten

**Dubbelklik op `windows-start.bat`.**

De eerste keer installeert het script de benodigde onderdelen en bouwt het de app
(dit duurt een paar minuten — daarna gaat het snel). Vervolgens:

- opent je browser automatisch op **http://localhost:3005**;
- in het zwarte venster zie je de serverlog.

Klaar! Vul eventueel een focusthema in en klik op **"Genereer briefing"**.

## Stoppen

Sluit het zwarte venster (of druk er `Ctrl + C` en daarna `J`/`Y`). De server stopt dan.
De volgende keer hoef je alleen weer op `windows-start.bat` te dubbelklikken.

---

## Veelvoorkomende meldingen

**"Windows heeft je pc beschermd" (SmartScreen) bij het openen van het .bat-bestand**
Klik op **Meer informatie → Toch uitvoeren**. Dit komt doordat het bestand van buiten
de pc komt; de inhoud is gewone tekst die je kunt openen met Kladblok.

**"Node.js is niet gevonden"**
Node.js is nog niet (goed) geïnstalleerd, of het venster stond nog open van vóór de
installatie. Installeer Node.js (stap 1), open een nieuw venster en probeer opnieuw.

**De browser opent maar de pagina laadt niet meteen**
De server start in een paar seconden op. Ververs de pagina (F5) als hij te vroeg opende.

**"Port 3005 is in use" / poort is bezet**
Er draait al iets op poort 3005. Sluit dat programma, of start met een andere poort:
open een venster in de map `backend` en typ:
```
set PORT=3010
node --env-file-if-exists=.env server.js
```
Open daarna http://localhost:3010

**Code aangepast en de wijziging is niet zichtbaar?**
De frontend draait als gebouwde versie. Dubbelklik op `windows-herbouwen.bat` en start
daarna opnieuw met `windows-start.bat`.
