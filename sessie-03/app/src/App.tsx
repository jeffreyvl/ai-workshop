import { useMemo, useRef, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from 'recharts'
import { parseArchimate } from './archimate'
import { validate } from './validate'
import { SAMPLE_XML } from './sampleModel'
import {
  type AmModel,
  type Finding,
  type Layer,
  type Severity,
  type FindingCategory,
  LAYER_LABEL,
  LAYER_COLOR,
  CATEGORY_LABEL,
  SEVERITY_LABEL,
} from './types'
import { MetamodelPanel } from './MetamodelPanel'

const SEVERITY_COLOR: Record<Severity, string> = {
  error: '#dc2626',
  warning: '#d97706',
  info: '#2563eb',
}
const LAYER_ORDER: Layer[] = ['business', 'information', 'application', 'technology', 'other']

function App() {
  const [model, setModel] = useState<AmModel | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const fileInput = useRef<HTMLInputElement>(null)

  // filters
  const [q, setQ] = useState('')
  const [fLayer, setFLayer] = useState<'all' | Layer>('all')
  const [fCat, setFCat] = useState<'all' | FindingCategory>('all')
  const [fSev, setFSev] = useState<'all' | Severity>('all')

  function load(xml: string, name: string) {
    try {
      const m = parseArchimate(xml)
      setModel(m)
      setFileName(name)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setModel(null)
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => load(String(reader.result), file.name)
    reader.readAsText(file)
  }

  const findings = useMemo(() => (model ? validate(model) : []), [model])

  const filtered = useMemo(() => {
    return findings.filter((f) => {
      if (fLayer !== 'all' && f.layer !== fLayer) return false
      if (fCat !== 'all' && f.category !== fCat) return false
      if (fSev !== 'all' && f.severity !== fSev) return false
      if (q.trim()) {
        const hay = `${f.title} ${f.detail} ${f.elementName ?? ''} ${f.rule}`.toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    })
  }, [findings, fLayer, fCat, fSev, q])

  return (
    <div className="min-h-full bg-slate-50 text-slate-800">
      <Header
        model={model}
        fileName={fileName}
        onPick={() => fileInput.current?.click()}
        onSample={() => load(SAMPLE_XML, 'voorbeeld-vergunningverlening.xml')}
      />
      <input
        ref={fileInput}
        type="file"
        accept=".xml,text/xml,application/xml"
        className="hidden"
        onChange={onFile}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        {error && (
          <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
            <strong>Kon het bestand niet inlezen:</strong> {error}
          </div>
        )}

        {!model ? (
          <EmptyState
            onPick={() => fileInput.current?.click()}
            onSample={() => load(SAMPLE_XML, 'voorbeeld-vergunningverlening.xml')}
          />
        ) : (
          <Dashboard
            model={model}
            findings={findings}
            filtered={filtered}
            q={q}
            setQ={setQ}
            fLayer={fLayer}
            setFLayer={setFLayer}
            fCat={fCat}
            setFCat={setFCat}
            fSev={fSev}
            setFSev={setFSev}
          />
        )}
      </main>
    </div>
  )
}

function Header({
  model,
  fileName,
  onPick,
  onSample,
}: {
  model: AmModel | null
  fileName: string
  onPick: () => void
  onSample: () => void
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-800 text-lg font-bold text-white">
            ✓
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Architectuur-validatie</h1>
            <p className="text-xs text-slate-500">
              ArchiMate-repository toetsen aan het metamodel
            </p>
          </div>
        </div>
        {model && (
          <div className="ml-2 hidden text-sm text-slate-600 sm:block">
            <span className="font-medium">{model.name}</span>
            {fileName && <span className="text-slate-400"> · {fileName}</span>}
          </div>
        )}
        <div className="ml-auto flex gap-2">
          <button
            onClick={onSample}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium hover:bg-slate-100"
          >
            Voorbeeldmodel
          </button>
          <button
            onClick={onPick}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            XML uploaden
          </button>
        </div>
      </div>
    </header>
  )
}

function EmptyState({ onPick, onSample }: { onPick: () => void; onSample: () => void }) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
      <h2 className="text-2xl font-bold">Valideer je architectuurrepository</h2>
      <p className="mx-auto mt-3 max-w-prose text-slate-600">
        Upload een <strong>ArchiMate Exchange-XML</strong>. De tool toetst je model aan de
        standaard ArchiMate-relatieregels én je eigen metamodel-regels: toegestane
        laagovergangen, verplichte attributen, verplichte koppelingen en naamgeving.
        Alles draait lokaal in je browser — er gaat niets naar een server.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={onPick}
          className="rounded-md bg-slate-800 px-5 py-2.5 font-medium text-white hover:bg-slate-700"
        >
          XML uploaden
        </button>
        <button
          onClick={onSample}
          className="rounded-md border border-slate-300 px-5 py-2.5 font-medium hover:bg-slate-100"
        >
          Laad voorbeeldmodel
        </button>
      </div>
    </div>
  )
}

function Dashboard(props: {
  model: AmModel
  findings: Finding[]
  filtered: Finding[]
  q: string
  setQ: (v: string) => void
  fLayer: 'all' | Layer
  setFLayer: (v: 'all' | Layer) => void
  fCat: 'all' | FindingCategory
  setFCat: (v: 'all' | FindingCategory) => void
  fSev: 'all' | Severity
  setFSev: (v: 'all' | Severity) => void
}) {
  const { model, findings, filtered } = props

  const sev = (s: Severity) => findings.filter((f) => f.severity === s).length

  // charts data
  const perLayer = LAYER_ORDER.filter(
    (l) => l !== 'other' || model.elements.some((e) => e.layer === 'other')
  ).map((l) => ({
    layer: LAYER_LABEL[l],
    elementen: model.elements.filter((e) => e.layer === l).length,
    afwijkingen: findings.filter((f) => f.layer === l).length,
  }))

  const perCategory = (Object.keys(CATEGORY_LABEL) as FindingCategory[]).map((c) => ({
    categorie: CATEGORY_LABEL[c],
    aantal: findings.filter((f) => f.category === c).length,
  }))

  const sevData = (['error', 'warning', 'info'] as Severity[])
    .map((s) => ({ name: SEVERITY_LABEL[s], value: sev(s), sev: s }))
    .filter((d) => d.value > 0)

  const score =
    findings.length === 0
      ? 100
      : Math.max(0, Math.round(100 - (sev('error') * 6 + sev('warning') * 2 + sev('info') * 1)))

  return (
    <div className="space-y-6">
      {/* KPI's */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Elementen" value={model.elements.length} />
        <Kpi label="Relaties" value={model.relations.length} />
        <Kpi label="Afwijkingen" value={findings.length} accent="slate" />
        <Kpi label="Fouten" value={sev('error')} accent="error" />
        <Kpi label="Waarschuwingen" value={sev('warning')} accent="warning" />
        <Kpi label="Conformiteit" value={`${score}%`} accent={score >= 80 ? 'good' : 'warning'} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card title="Elementen & afwijkingen per laag" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={perLayer} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="layer" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="elementen" name="Elementen" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="afwijkingen" name="Afwijkingen" fill="#dc2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Afwijkingen per ernst">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={
                  sevData.length ? sevData : [{ name: 'Geen', value: 1, sev: 'info' as Severity }]
                }
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {(sevData.length ? sevData : [{ sev: 'info' as Severity }]).map((d, i) => (
                  <Cell key={i} fill={sevData.length ? SEVERITY_COLOR[d.sev] : '#86efac'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Afwijkingen per categorie">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={perCategory}
            layout="vertical"
            margin={{ top: 4, right: 16, left: 40, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="categorie" tick={{ fontSize: 12 }} width={130} />
            <Tooltip />
            <Bar dataKey="aantal" name="Aantal" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Filters + lijst */}
      <Card title={`Bevindingen (${filtered.length}/${findings.length})`} action={<MetamodelPanel />}>
        <Filters {...props} />
        <FindingsList findings={filtered} />
      </Card>
    </div>
  )
}

function Filters(props: {
  q: string
  setQ: (v: string) => void
  fLayer: 'all' | Layer
  setFLayer: (v: 'all' | Layer) => void
  fCat: 'all' | FindingCategory
  setFCat: (v: 'all' | FindingCategory) => void
  fSev: 'all' | Severity
  setFSev: (v: 'all' | Severity) => void
}) {
  const sel =
    'rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:border-slate-500 focus:outline-none'
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <input
        value={props.q}
        onChange={(e) => props.setQ(e.target.value)}
        placeholder="Zoek in bevindingen…"
        className={`${sel} min-w-[180px] flex-1`}
      />
      <select
        className={sel}
        value={props.fLayer}
        onChange={(e) => props.setFLayer(e.target.value as Layer | 'all')}
      >
        <option value="all">Alle lagen</option>
        {LAYER_ORDER.map((l) => (
          <option key={l} value={l}>
            {LAYER_LABEL[l]}
          </option>
        ))}
      </select>
      <select
        className={sel}
        value={props.fCat}
        onChange={(e) => props.setFCat(e.target.value as FindingCategory | 'all')}
      >
        <option value="all">Alle categorieën</option>
        {(Object.keys(CATEGORY_LABEL) as FindingCategory[]).map((c) => (
          <option key={c} value={c}>
            {CATEGORY_LABEL[c]}
          </option>
        ))}
      </select>
      <select
        className={sel}
        value={props.fSev}
        onChange={(e) => props.setFSev(e.target.value as Severity | 'all')}
      >
        <option value="all">Alle ernst</option>
        {(['error', 'warning', 'info'] as Severity[]).map((s) => (
          <option key={s} value={s}>
            {SEVERITY_LABEL[s]}
          </option>
        ))}
      </select>
    </div>
  )
}

function FindingsList({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center text-emerald-800">
        Geen bevindingen voor deze filter. 🎉
      </div>
    )
  }
  return (
    <ul className="space-y-2">
      {findings.map((f) => (
        <li
          key={f.id}
          className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:bg-slate-50"
        >
          <SeverityDot sev={f.severity} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{f.title}</span>
              <Badge color={LAYER_COLOR[f.layer]}>{LAYER_LABEL[f.layer]}</Badge>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                {CATEGORY_LABEL[f.category]}
              </span>
            </div>
            <p className="mt-0.5 text-sm text-slate-600">{f.detail}</p>
            <p className="mt-1 text-xs text-slate-400">Regel: {f.rule}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

// ── kleine UI-helpers ──────────────────────────────────────────────────────
function Kpi({
  label,
  value,
  accent = 'neutral',
}: {
  label: string
  value: number | string
  accent?: 'neutral' | 'slate' | 'error' | 'warning' | 'good'
}) {
  const colors: Record<string, string> = {
    neutral: 'text-slate-800',
    slate: 'text-slate-800',
    error: 'text-red-600',
    warning: 'text-amber-600',
    good: 'text-emerald-600',
  }
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className={`text-2xl font-bold ${colors[accent]}`}>{value}</div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  )
}

function Card({
  title,
  children,
  className = '',
  action,
}: {
  title: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      className="rounded px-1.5 py-0.5 text-xs font-medium text-slate-800"
      style={{ backgroundColor: color + '55' }}
    >
      {children}
    </span>
  )
}

function SeverityDot({ sev }: { sev: Severity }) {
  return (
    <span
      className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: SEVERITY_COLOR[sev] }}
      title={SEVERITY_LABEL[sev]}
    />
  )
}

export default App
