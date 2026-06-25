import { useEffect, useState } from 'react'
import { haalDashboardData, type DashboardData } from './cbs'
import { KpiCard } from './components/KpiCard'
import { SignalenPanel } from './components/SignalenPanel'
import { TrendChart } from './components/TrendChart'
import { FlowChart } from './components/FlowChart'
import { Donut } from './components/Donut'
import { StaafVerdeling } from './components/StaafVerdeling'
import { RegioTabel } from './components/RegioTabel'

function App() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [fout, setFout] = useState<string | null>(null)

  useEffect(() => {
    haalDashboardData()
      .then(setData)
      .catch((e) => setFout(e instanceof Error ? e.message : 'Onbekende fout'))
  }, [])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-rijk-500 text-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium uppercase tracking-wide text-rijk-100">
                Signaaldashboard · live CBS-cijfers
              </p>
              <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                Inclusieve arbeidsmarkt
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-rijk-100">
                Uitkeringen, arbeidsongeschiktheid en regionale verschillen — in één
                oogopslag. Alle cijfers komen live van CBS StatLine Open Data.
              </p>
            </div>
            {data && (
              <div className="text-right text-sm text-rijk-100">
                <div className="rounded-lg bg-rijk-600 px-3 py-2">
                  <div className="text-xs uppercase tracking-wide">Peilmaand</div>
                  <div className="text-base font-semibold text-white">
                    {data.peilmaandSoort}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        {fout && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700">
            <p className="font-semibold">Kon de CBS-cijfers niet ophalen</p>
            <p className="mt-1 text-sm">{fout}</p>
            <p className="mt-1 text-sm">Controleer de internetverbinding en herlaad de pagina.</p>
          </div>
        )}

        {!data && !fout && <Laadscherm />}

        {data && (
          <>
            {/* KPI's */}
            <section>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {data.kpis.map((k) => (
                  <KpiCard key={k.id} kpi={k} />
                ))}
              </div>
            </section>

            {/* Trend + signalen */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Card
                  title="Ontwikkeling uitkeringen naar soort"
                  subtitle="Bestand per maand, × 1.000 personen · CBS 37789ksz"
                >
                  <TrendChart data={data.trend} />
                </Card>
              </div>
              <div>
                <SignalenPanel signalen={data.signalen} />
              </div>
            </section>

            {/* In- en uitstroom bijstand */}
            <section>
              <Card
                title="In- en uitstroom bijstand"
                subtitle={`Per kwartaal · t/m ${data.peilkwartaalFlow} · CBS 85615NED — instroom > uitstroom betekent dat het bestand groeit`}
              >
                <FlowChart data={data.bijstandFlow} />
              </Card>
            </section>

            {/* Verdelingen */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card
                title="Uitkeringen naar soort"
                subtitle={`Aandeel van het bestand · ${data.peilmaandSoort}`}
              >
                <Donut data={data.soortVerdeling} />
              </Card>
              <Card
                title="Arbeidsongeschiktheid naar regeling"
                subtitle={`× 1.000 personen · ${data.peilmaandSoort}`}
              >
                <StaafVerdeling data={data.aoRegeling} eenheid="× 1.000" />
              </Card>
            </section>

            {/* Regio-tabel */}
            <section>
              <Card
                title="Per provincie"
                subtitle={`Uitkeringen tot AOW-leeftijd · ${data.peilmaandRegio} · CBS 80794ned — klik op een kolomtitel om te sorteren`}
              >
                <RegioTabel data={data.regios} />
              </Card>
            </section>

            <footer className="pb-8 pt-2 text-center text-xs text-slate-400">
              Live data: CBS StatLine Open Data (tabellen 37789ksz &amp; 80794ned) ·
              signalen afgeleid uit de cijfers · Vite + React + Tailwind + Recharts
            </footer>
          </>
        )}
      </main>
    </div>
  )
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function Laadscherm() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-500">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-rijk-500" />
      <p className="text-sm">Actuele cijfers ophalen bij CBS StatLine…</p>
    </div>
  )
}

export default App
