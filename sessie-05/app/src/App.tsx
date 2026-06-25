import { useState } from 'react'

type Categorie = 'Lokaal' | 'Regionaal' | 'Landelijk' | 'Europees' | 'Geopolitiek'
type Urgentie = 'Hoog' | 'Middel' | 'Laag'

interface BriefingItem {
  titel: string
  categorie: Categorie
  samenvatting: string
  waarom_relevant: string
  urgentie: Urgentie
  vragen: string[]
  bronnen: string[]
  bron_naam?: string | null
  datum?: string | null
}

interface BriefingResponse {
  gegenereerd_op: string
  focus: string | null
  modus?: 'ai' | 'nieuws'
  gedeeltelijk?: boolean
  items: BriefingItem[]
}

// Relatief pad: in dev proxyt Vite /api naar de backend; in de lokale deploy
// serveert dezelfde Express-backend zowel de pagina als /api.
const API = ''

const CATEGORIE_KLEUR: Record<Categorie, string> = {
  Lokaal: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20',
  Regionaal: 'bg-teal-100 text-teal-800 ring-teal-600/20',
  Landelijk: 'bg-blue-100 text-blue-800 ring-blue-600/20',
  Europees: 'bg-indigo-100 text-indigo-800 ring-indigo-600/20',
  Geopolitiek: 'bg-amber-100 text-amber-800 ring-amber-600/20',
}

const URGENTIE_KLEUR: Record<Urgentie, string> = {
  Hoog: 'bg-red-500',
  Middel: 'bg-amber-500',
  Laag: 'bg-slate-400',
}

const CATEGORIEEN: (Categorie | 'Alle')[] = [
  'Alle',
  'Lokaal',
  'Regionaal',
  'Landelijk',
  'Europees',
  'Geopolitiek',
]

function App() {
  const [focus, setFocus] = useState('')
  const [laden, setLaden] = useState(false)
  const [fout, setFout] = useState<string | null>(null)
  const [data, setData] = useState<BriefingResponse | null>(null)
  const [filter, setFilter] = useState<Categorie | 'Alle'>('Alle')

  async function genereer() {
    setLaden(true)
    setFout(null)
    try {
      const res = await fetch(`${API}/api/briefing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ focus }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Er ging iets mis.')
      setData(json)
      setFilter('Alle')
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'Onbekende fout.')
    } finally {
      setLaden(false)
    }
  }

  const zichtbaar =
    data?.items.filter((i) => filter === 'Alle' || i.categorie === filter) ?? []

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#502379] text-lg font-bold text-white">
              V
            </span>
            <div>
              <h1 className="text-xl font-semibold leading-tight">
                Fractie-Radar · Volt Soest
              </h1>
              <p className="text-sm text-slate-500">
                Belangrijke ontwikkelingen → scherpe raadsvragen
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {/* Bedieningspaneel */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Focus (optioneel) — een thema waar je je vandaag op wilt richten
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !laden && genereer()}
              placeholder="bijv. woningbouw, energietransitie, asielopvang, EU-defensie…"
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-[#502379] focus:ring-2 focus:ring-[#502379]/20"
            />
            <button
              onClick={genereer}
              disabled={laden}
              className="rounded-lg bg-[#502379] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3f1c60] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {laden ? 'Bezig met zoeken…' : 'Genereer briefing'}
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            De assistent zoekt live op het web (lokaal Soest, landelijk, Europees
            en geopolitiek) en zet de bevindingen om in vragen voor het college.
          </p>
        </section>

        {/* Laad-status */}
        {laden && (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-[#502379]" />
            <p className="text-sm">
              Live nieuws zoeken en analyseren… dit duurt meestal 20–60 seconden.
            </p>
          </div>
        )}

        {/* Fout */}
        {fout && !laden && (
          <div className="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <strong className="font-semibold">Er ging iets mis:</strong> {fout}
          </div>
        )}

        {/* Lege staat */}
        {!data && !laden && !fout && (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
            <p className="text-sm">
              Nog geen briefing. Klik op <span className="font-medium text-slate-600">“Genereer briefing”</span> om te starten.
            </p>
          </div>
        )}

        {/* Resultaten */}
        {data && !laden && (
          <section className="mt-8">
            {data.modus === 'nieuws' && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-sky-300 bg-sky-50 p-3 text-sm text-sky-800">
                <span className="text-base leading-none">📰</span>
                <span>
                  <strong className="font-semibold">Nieuws-modus:</strong> echte,
                  actuele artikelen opgehaald via nieuws-RSS en gefilterd op je
                  focus — nog zónder AI-analyse. De vragen zijn algemene
                  startsuggesties. Stel een{' '}
                  <code className="rounded bg-sky-100 px-1">ANTHROPIC_API_KEY</code>{' '}
                  in voor AI-analyse met op maat gemaakte raadsvragen.
                  {data.gedeeltelijk && (
                    <span className="mt-1 block text-xs text-sky-600">
                      (Niet alle bronnen waren bereikbaar — resultaat kan
                      onvolledig zijn.)
                    </span>
                  )}
                </span>
              </div>
            )}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {CATEGORIEEN.map((c) => {
                  const aantal =
                    c === 'Alle'
                      ? data.items.length
                      : data.items.filter((i) => i.categorie === c).length
                  if (c !== 'Alle' && aantal === 0) return null
                  return (
                    <button
                      key={c}
                      onClick={() => setFilter(c)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        filter === c
                          ? 'bg-[#502379] text-white'
                          : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {c} ({aantal})
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-slate-400">
                Gegenereerd:{' '}
                {new Date(data.gegenereerd_op).toLocaleString('nl-NL', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {zichtbaar.map((item, i) => (
                <Kaart key={i} item={item} />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-6 py-8 text-center text-xs text-slate-400">
        Hulpmiddel — controleer altijd de bronnen voordat je een vraag indient.
      </footer>
    </div>
  )
}

function Kaart({ item }: { item: BriefingItem }) {
  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
            CATEGORIE_KLEUR[item.categorie] ?? 'bg-slate-100 text-slate-700'
          }`}
        >
          {item.categorie}
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <span
            className={`h-2 w-2 rounded-full ${URGENTIE_KLEUR[item.urgentie] ?? 'bg-slate-400'}`}
          />
          {item.urgentie}
        </span>
      </div>

      <h2 className="mb-2 text-base font-semibold leading-snug text-slate-900">
        {item.titel}
      </h2>

      {(item.bron_naam || item.datum) && (
        <p className="mb-2 text-xs text-slate-400">
          {[item.bron_naam, item.datum].filter(Boolean).join(' · ')}
        </p>
      )}

      {item.samenvatting && (
        <p className="mb-3 text-sm leading-relaxed text-slate-600">
          {item.samenvatting}
        </p>
      )}

      <div className="mb-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
        <span className="font-medium text-slate-900">Waarom relevant: </span>
        {item.waarom_relevant}
      </div>

      <div className="mt-auto">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#502379]">
          Vragen voor het college
        </p>
        <ul className="space-y-1.5">
          {item.vragen.map((v, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-700">
              <span className="mt-0.5 select-none text-[#502379]">→</span>
              <span>{v}</span>
            </li>
          ))}
        </ul>

        {item.bronnen?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-100 pt-3">
            {item.bronnen.map((b, i) => (
              <a
                key={i}
                href={b}
                target="_blank"
                rel="noreferrer"
                className="truncate text-xs text-slate-400 underline-offset-2 hover:text-[#502379] hover:underline"
              >
                bron {i + 1}
              </a>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}

export default App
