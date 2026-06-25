import express from "express";
import cors from "cors";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:3000"] }));
app.use(express.json());

const DATA_FILE = "./data.json";

function readFriends() {
  if (!existsSync(DATA_FILE)) return [];
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeFriends(friends) {
  writeFileSync(DATA_FILE, JSON.stringify(friends, null, 2));
}

let _id = Date.now();
const newId = () => String(++_id);

// --- CRUD vrienden ---------------------------------------------------------

app.get("/api/friends", (req, res) => {
  res.json(readFriends());
});

app.post("/api/friends", (req, res) => {
  const { name, birthdate, phone, tone, note } = req.body;
  if (!name || !birthdate) {
    return res.status(400).json({ error: "naam en geboortedatum zijn verplicht" });
  }
  const friends = readFriends();
  const friend = {
    id: newId(),
    name: name.trim(),
    birthdate,                      // YYYY-MM-DD
    phone: (phone || "").trim(),    // optioneel, voor WhatsApp
    tone: tone || "hartelijk",
    note: (note || "").trim(),      // optioneel binnengrapje/weetje
  };
  friends.push(friend);
  writeFriends(friends);
  res.status(201).json(friend);
});

app.put("/api/friends/:id", (req, res) => {
  const friends = readFriends();
  const i = friends.findIndex((f) => f.id === req.params.id);
  if (i === -1) return res.status(404).json({ error: "niet gevonden" });
  friends[i] = { ...friends[i], ...req.body, id: friends[i].id };
  writeFriends(friends);
  res.json(friends[i]);
});

app.delete("/api/friends/:id", (req, res) => {
  const friends = readFriends().filter((f) => f.id !== req.params.id);
  writeFriends(friends);
  res.status(204).end();
});

// De felicitatie wordt lokaal in de frontend opgesteld (app/src/messages.ts) —
// geen AI/API-key nodig. De backend bewaart alleen de vrienden.

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✓ API draait op http://localhost:${PORT}`);
});
