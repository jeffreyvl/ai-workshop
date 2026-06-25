import type { Kpi } from '../cbs'

function pct(waarde: number, vorige: number): number {
  if (vorige === 0) return 0
  return ((waarde - vorige) / vorige) * 100
}

export function KpiCard({ kpi }: { kpi: Kpi }) {
  const verschil = pct(kpi.waarde, kpi.vorigePeriode)
  const stijgt = verschil > 0
  // Is de verandering positief geduid? (bij 'slecht' is dalen juist goed)
  const positief = kpi.richting === 'goed' ? stijgt : !stijgt
  const kleur = verschil === 0
    ? 'text-slate-400'
    : positief
      ? 'text-emerald-600'
      : 'text-red-600'
  const pijl = verschil === 0 ? '→' : stijgt ? '▲' : '▼'

  const waardeStr =
    kpi.eenheid === '%'
      ? `${kpi.waarde}%`
      : kpi.waarde.toLocaleString('nl-NL')

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{kpi.label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-900">{waardeStr}</span>
        <span className={`text-sm font-semibold ${kleur}`}>
          {pijl} {Math.abs(verschil).toFixed(1)}%
        </span>
      </div>

      <p className="mt-1 text-xs text-slate-400">t.o.v. vorige maand</p>

      <p className="mt-3 text-xs leading-snug text-slate-400">{kpi.toelichting}</p>
    </div>
  )
}
