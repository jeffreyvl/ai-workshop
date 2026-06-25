import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Anthropic from "@anthropic-ai/sdk";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
// Lokale dev: sta elke localhost-poort toe (Vite kan uitwijken naar 5174/5175/…)
app.use(cors({ origin: /^http:\/\/localhost:\d+$/ }));
app.use(express.json());

// Productie/lokale deploy: serveer de gebouwde frontend (app/dist) als die bestaat,
// zodat alles via één poort draait (http://localhost:3005). In dev gebruikt Vite
// een eigen server met proxy naar /api, en blijft dit ongebruikt.
const FRONTEND_DIST = path.join(__dirname, "..", "app", "dist");
app.use(express.static(FRONTEND_DIST));

const client = new Anthropic(); // leest ANTHROPIC_API_KEY uit de omgeving

// ── Gemeente-context: hiermee weegt het model lokale relevantie voor Soest ──
const GEMEENTE = "Soest (provincie Utrecht, Nederland)";
const FRACTIE = "Volt — een progressieve, pro-Europese partij";

// ════════════════════════════════════════════════════════════════════════
//  MODUS 1 — AI-analyse via Claude + live web search (als er een key is)
// ════════════════════════════════════════════════════════════════════════

function bouwPrompt(focus) {
  const focusregel = focus
    ? `De medewerker wil zich vandaag vooral richten op: "${focus}". Geef hier extra gewicht aan, maar negeer andere belangrijke ontwikkelingen niet.`
    : `Geen specifiek thema opgegeven — kies zelf de meest relevante ontwikkelingen van de afgelopen dagen.`;

  return `Je bent een politiek-strategisch assistent voor een eenmansfractie van ${FRACTIE} in de gemeenteraad van ${GEMEENTE}.

Je taak: zoek met web search naar de belangrijkste actuele ontwikkelingen en vertaal die naar bruikbare input voor het raadswerk.

${focusregel}

Zoek naar ontwikkelingen op vijf niveaus:
- **Lokaal**: nieuws over de gemeente Soest zelf — lokale besluiten, projecten, raad en discussies.
- **Regionaal**: ontwikkelingen in de regio Amersfoort/Eemland en de provincie Utrecht (regionale samenwerking, U10/Regio Amersfoort, provinciale besluiten, OV, woningbouwafspraken, natuur).
- **Landelijk**: Nederlandse politiek en beleid dat doorwerkt naar gemeenten (woningbouw, stikstof, energie, zorg, gemeentefonds, asiel/spreidingswet).
- **Europees**: EU-beleid dat lokaal relevant is (relevant voor Volt als pro-Europese partij).
- **Geopolitiek**: grote internationale ontwikkelingen met mogelijke lokale of maatschappelijke impact.

Lever 6 tot 8 ontwikkelingen op. Voor elk item:
- Een korte titel en samenvatting (2-3 zinnen).
- Een heldere uitleg waarom dit relevant is voor een raadslid in Soest of voor Volt.
- Een urgentie-inschatting.
- 2 tot 4 concrete, scherpe vragen die de fractie aan het college kan stellen of waarmee een debat geopend kan worden. Maak ze specifiek en kritisch, niet algemeen.
- De bron-URLs die je gebruikt hebt.

Gebruik web search actief om je op recente, controleerbare feiten te baseren. Verzin geen feiten.

Geef je antwoord UITSLUITEND als één JSON-object met de sleutel "items" (een array van objecten). Elk object heeft exact deze sleutels: "titel" (string), "categorie" (een van: "Lokaal", "Regionaal", "Landelijk", "Europees", "Geopolitiek"), "samenvatting" (string), "waarom_relevant" (string), "urgentie" (een van: "Hoog", "Middel", "Laag"), "vragen" (array van strings), "bronnen" (array van URL-strings). Geen tekst eromheen, geen markdown-codeblok — alleen pure JSON.`;
}

function parseBriefing(message) {
  const tekst = message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();

  const start = tekst.indexOf("{");
  const eind = tekst.lastIndexOf("}");
  if (start === -1 || eind === -1) {
    throw new Error("Geen JSON gevonden in het antwoord van het model.");
  }
  return JSON.parse(tekst.slice(start, eind + 1));
}

async function maakAiBriefing(focus) {
  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 16000,
    tools: [
      {
        type: "web_search_20260209",
        name: "web_search",
        max_uses: 8,
        user_location: { type: "approximate", country: "NL" },
      },
    ],
    messages: [{ role: "user", content: bouwPrompt(focus) }],
  });
  const message = await stream.finalMessage();
  return parseBriefing(message);
}

// ════════════════════════════════════════════════════════════════════════
//  MODUS 2 — Echte nieuws-RSS (Google News) als er geen API-key is
//  Haalt actuele artikelen op per categorie en filtert op het focusthema.
// ════════════════════════════════════════════════════════════════════════

// Per categorie een zoekopdracht-anker + een recency-venster (Google News
// "when:"-operator). Bij een focusthema verfijnen we de query daarmee.
const CATEGORIE_QUERIES = {
  Lokaal: { anker: 'gemeente Soest OR gemeenteraad Soest', venster: 'when:45d' },
  Regionaal: {
    anker: '"provincie Utrecht" OR "regio Amersfoort" OR Eemland OR Baarn OR Soesterberg',
    venster: 'when:30d',
  },
  Landelijk: {
    anker: 'gemeentefonds OR woningbouw OR stikstof OR "lokale politiek" Nederland',
    venster: 'when:14d',
  },
  Europees: { anker: '"Europese Unie" beleid Nederland', venster: 'when:21d' },
  Geopolitiek: { anker: 'geopolitiek internationaal', venster: 'when:10d' },
};

const CATEGORIE_FOCUS_ANKER = {
  Lokaal: 'Soest',
  Regionaal: '"provincie Utrecht" OR "regio Amersfoort"',
  Landelijk: 'Nederland politiek',
  Europees: '"Europese Unie"',
  Geopolitiek: 'internationaal',
};

const WAAROM_RELEVANT = {
  Lokaal: "Direct nieuws over de gemeente Soest.",
  Regionaal: "Regionale ontwikkeling (Eemland/provincie Utrecht) met doorwerking naar Soest.",
  Landelijk: "Landelijk beleid dat doorwerkt naar gemeenten zoals Soest.",
  Europees: "Europees beleid met mogelijke lokale doorwerking — relevant voor Volt.",
  Geopolitiek: "Internationale ontwikkeling met mogelijke maatschappelijke impact.",
};

function decodeEntities(s = "") {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/<[^>]+>/g, "")
    .trim();
}

function pak(tag, blok) {
  const m = blok.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? m[1] : "";
}

function urgentieUitDatum(pubDate) {
  const dagen = (Date.now() - new Date(pubDate).getTime()) / 86_400_000;
  if (!isFinite(dagen)) return "Laag";
  if (dagen <= 2) return "Hoog";
  if (dagen <= 7) return "Middel";
  return "Laag";
}

async function haalCategorie(categorie, focus, perCategorie) {
  const cfg = CATEGORIE_QUERIES[categorie];
  const query = focus
    ? `${focus} ${CATEGORIE_FOCUS_ANKER[categorie]} ${cfg.venster}`
    : `${cfg.anker} ${cfg.venster}`;

  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(
    query
  )}&hl=nl&gl=NL&ceid=NL:nl`;

  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (FractieRadar/1.0)" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`RSS ${categorie}: HTTP ${res.status}`);
  const xml = await res.text();

  const blokken = xml.split("<item>").slice(1);
  const items = [];
  for (const blok of blokken.slice(0, perCategorie)) {
    let titel = decodeEntities(pak("title", blok));
    const bronNaam = decodeEntities(pak("source", blok));
    const link = decodeEntities(pak("link", blok));
    const pubDate = decodeEntities(pak("pubDate", blok));

    // Google News zet vaak " - Bron" achter de kop; haal die weg.
    if (bronNaam && titel.endsWith(` - ${bronNaam}`)) {
      titel = titel.slice(0, -(bronNaam.length + 3)).trim();
    }
    if (!titel || !link) continue;

    const datum = pubDate
      ? new Date(pubDate).toLocaleDateString("nl-NL", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : null;

    items.push({
      titel,
      categorie,
      samenvatting: "",
      waarom_relevant: WAAROM_RELEVANT[categorie],
      urgentie: urgentieUitDatum(pubDate),
      bron_naam: bronNaam || null,
      datum,
      vragen: [
        `Wat is de positie van het college over: "${titel}"?`,
        `Welke gevolgen heeft dit voor de gemeente Soest, en is actie van het college nodig?`,
      ],
      bronnen: [link],
    });
  }
  return items;
}

async function maakNieuwsBriefing(focus, perCategorie = 3) {
  const categorieen = Object.keys(CATEGORIE_QUERIES);
  const resultaten = await Promise.allSettled(
    categorieen.map((c) => haalCategorie(c, focus, perCategorie))
  );

  const items = [];
  let fouten = 0;
  for (const r of resultaten) {
    if (r.status === "fulfilled") items.push(...r.value);
    else fouten++;
  }

  if (items.length === 0) {
    throw new Error(
      "Kon geen nieuws ophalen (geen internet of bron onbereikbaar). Probeer het later opnieuw."
    );
  }
  return { items, gedeeltelijk: fouten > 0 };
}

// ════════════════════════════════════════════════════════════════════════
//  Routes
// ════════════════════════════════════════════════════════════════════════

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Volt Soest briefing-API",
    modus: process.env.ANTHROPIC_API_KEY ? "ai" : "nieuws",
  });
});

app.post("/api/briefing", async (req, res) => {
  const focus = (req.body?.focus || "").toString().slice(0, 200);
  const heeftKey = !!process.env.ANTHROPIC_API_KEY;

  try {
    if (heeftKey) {
      const briefing = await maakAiBriefing(focus);
      return res.json({
        gegenereerd_op: new Date().toISOString(),
        focus: focus || null,
        modus: "ai",
        ...briefing,
      });
    }

    // Fallback zonder key: echte nieuws-RSS, gefilterd op focus.
    const { items, gedeeltelijk } = await maakNieuwsBriefing(focus);
    return res.json({
      gegenereerd_op: new Date().toISOString(),
      focus: focus || null,
      modus: "nieuws",
      gedeeltelijk,
      items,
    });
  } catch (err) {
    console.error("Fout bij genereren briefing:", err);
    res
      .status(500)
      .json({ error: err?.message || "Onbekende fout bij het genereren van de briefing." });
  }
});

import fs from "fs";

// Poort 3005 voor deze sessie (3001 wordt door een andere sessie gebruikt).
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  const heeftFrontend = fs.existsSync(path.join(FRONTEND_DIST, "index.html"));
  console.log(`✓ Server draait op http://localhost:${PORT}`);
  console.log(
    heeftFrontend
      ? "→ Frontend wordt geserveerd vanaf app/dist (open de URL in je browser)"
      : "→ Alleen de API draait; start de frontend apart met Vite (dev) of bouw 'm eerst"
  );
  console.log(
    process.env.ANTHROPIC_API_KEY
      ? "→ Modus: AI-analyse (Claude + web search)"
      : "→ Modus: live nieuws-RSS (geen API-key gevonden)"
  );
});
