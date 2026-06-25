import { useEffect, useState } from "react";
import {
  type Friend,
  type Tone,
  getFriends,
  addFriend,
  deleteFriend,
} from "./api";
import { generateFelicitatie } from "./messages";
import {
  daysUntil,
  isBirthdayToday,
  turningAge,
  formatDate,
  countdownLabel,
  sortByUpcoming,
} from "./dates";

const TONES: { value: Tone; label: string; emoji: string }[] = [
  { value: "hartelijk", label: "Hartelijk", emoji: "💛" },
  { value: "grappig", label: "Grappig", emoji: "😄" },
  { value: "formeel", label: "Formeel", emoji: "🤝" },
  { value: "kort", label: "Kort", emoji: "⚡" },
];

function App() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  // formulier
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [phone, setPhone] = useState("");
  const [tone, setTone] = useState<Tone>("hartelijk");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    getFriends()
      .then(setFriends)
      .catch(() => setFormError("Kon vrienden niet laden — draait de backend?"))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!name.trim() || !birthdate) {
      setFormError("Vul minstens een naam en geboortedatum in.");
      return;
    }
    setSaving(true);
    try {
      const created = await addFriend({ name, birthdate, phone, tone, note });
      setFriends((f) => [...f, created]);
      setName(""); setBirthdate(""); setPhone(""); setTone("hartelijk"); setNote("");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Toevoegen mislukt");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    await deleteFriend(id);
    setFriends((f) => f.filter((x) => x.id !== id));
  }

  const sorted = sortByUpcoming(friends);
  const todays = sorted.filter((f) => isBirthdayToday(f.birthdate));

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-violet-50 text-slate-800">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            🎂 Verjaardags-felicitator
          </h1>
          <p className="mt-2 text-slate-600">
            Nooit meer een verjaardag vergeten — met een persoonlijke felicitatie, klaar voor WhatsApp.
          </p>
        </header>

        {/* Vandaag jarig */}
        {todays.length > 0 && (
          <section className="mb-8">
            <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-rose-400 p-1 shadow-lg">
              <div className="rounded-xl bg-white p-5">
                <h2 className="text-lg font-semibold text-rose-600 mb-3">
                  🎉 Vandaag jarig!
                </h2>
                <div className="space-y-3">
                  {todays.map((f) => (
                    <FriendCard key={f.id} friend={f} highlight onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Toevoeg-formulier */}
        <section className="mb-8 rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Vriend toevoegen
          </h2>
          <form onSubmit={handleAdd} className="grid gap-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Naam *</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="bv. Sanne"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Geboortedatum *</span>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Telefoonnummer <span className="text-slate-400">(voor WhatsApp, bv. 0612345678)</span>
              </span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0612345678"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none"
              />
            </label>
            <div>
              <span className="text-sm font-medium text-slate-700">Toon van de felicitatie</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTone(t.value)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium border transition ${
                      tone === t.value
                        ? "bg-violet-600 text-white border-violet-600"
                        : "bg-white text-slate-700 border-slate-300 hover:border-violet-400"
                    }`}
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">
                Interesses <span className="text-slate-400">(optioneel — komt terug in de felicitatie)</span>
              </span>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="bv. padel, goede koffie, reizen"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none"
              />
            </label>
            {formError && <p className="text-sm text-rose-600">{formError}</p>}
            <button
              type="submit"
              disabled={saving}
              className="justify-self-start rounded-lg bg-violet-600 px-5 py-2.5 font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition"
            >
              {saving ? "Bezig…" : "➕ Toevoegen"}
            </button>
          </form>
        </section>

        {/* Lijst */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Komende verjaardagen
          </h2>
          {loading ? (
            <p className="text-slate-500">Laden…</p>
          ) : sorted.length === 0 ? (
            <p className="text-slate-500">
              Nog geen vrienden toegevoegd. Voeg er hierboven eentje toe! 👆
            </p>
          ) : (
            <div className="space-y-3">
              {sorted
                .filter((f) => !isBirthdayToday(f.birthdate))
                .map((f) => (
                  <FriendCard key={f.id} friend={f} onDelete={handleDelete} />
                ))}
            </div>
          )}
        </section>

        <footer className="mt-12 text-center text-xs text-slate-400">
          Felicitaties geschreven door Claude · gegevens lokaal opgeslagen op deze pc
        </footer>
      </div>
    </div>
  );
}

function FriendCard({
  friend,
  highlight = false,
  onDelete,
}: {
  friend: Friend;
  highlight?: boolean;
  onDelete: (id: string) => void;
}) {
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const days = daysUntil(friend.birthdate);
  const age = turningAge(friend.birthdate);

  function handleGenerate() {
    const text = generateFelicitatie({
      name: friend.name,
      tone: friend.tone,
      note: friend.note,
      age: isBirthdayToday(friend.birthdate) ? age : undefined,
    });
    setMessage(text);
  }

  function whatsappUrl() {
    const text = encodeURIComponent(message);
    const num = friend.phone.replace(/[^0-9]/g, "");
    // 06... → 316...
    const intl = num.startsWith("0") ? "31" + num.slice(1) : num;
    return num ? `https://wa.me/${intl}?text=${text}` : `https://wa.me/?text=${text}`;
  }

  async function copy() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "border-rose-200 bg-rose-50/50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold text-slate-900">{friend.name}</div>
          <div className="text-sm text-slate-500">
            {formatDate(friend.birthdate)} · wordt {age} ·{" "}
            <span className={highlight ? "text-rose-600 font-medium" : ""}>
              {countdownLabel(days)}
            </span>
          </div>
          {friend.note && (
            <div className="text-xs text-slate-400 mt-0.5">“{friend.note}”</div>
          )}
        </div>
        <button
          onClick={() => onDelete(friend.id)}
          className="text-slate-300 hover:text-rose-500 transition text-sm"
          title="Verwijderen"
        >
          ✕
        </button>
      </div>

      <div className="mt-3">
        <button
          onClick={handleGenerate}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition"
        >
          {message ? "🔄 Andere felicitatie" : "✨ Felicitatie maken"}
        </button>
      </div>

      {message && (
        <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200 p-3">
          <p className="whitespace-pre-wrap text-slate-800 text-[15px]">{message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition"
            >
              📲 Open in WhatsApp
            </a>
            <button
              onClick={copy}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              {copied ? "✓ Gekopieerd" : "📋 Kopieer"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
