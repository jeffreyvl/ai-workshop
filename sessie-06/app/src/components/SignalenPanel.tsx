import type { Signaal } from '../cbs'

const stijl: Record<Signaal['niveau'], { rand: string; badge: string; label: string }> = {
  urgent: { rand: 'border-l-red-500', badge: 'bg-red-100 text-red-700', label: 'Urgent' },
  aandacht: { rand: 'border-l-amber-500', badge: 'bg-amber-100 text-amber-700', label: 'Aandacht' },
  kans: { rand: 'border-l-emerald-500', badge: 'bg-emerald-100 text-emerald-700', label: 'Kans' },
}

const volgorde: Record<Signaal['niveau'], number> = { urgent: 0, aandacht: 1, kans: 2 }

export function SignalenPanel({ signalen }: { signalen: Signaal[] }) {
  const gesorteerd = [...signalen].sort((a, b) => volgorde[a.niveau] - volgorde[b.niveau])

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-800">Signalen</h2>
        <p className="text-sm text-slate-500">Waar actie nodig of mogelijk is</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 360 }}>
        {gesorteerd.map((s) => {
          const st = stijl[s.niveau]
          return (
            <div
              key={s.id}
              className={`rounded-lg border border-slate-100 border-l-4 ${st.rand} bg-slate-50 p-3`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${st.badge}`}>
                  {st.label}
                </span>
                <span className="text-xs text-slate-400">{s.regio}</span>
              </div>
              <h3 className="mt-2 text-sm font-semibold text-slate-800">{s.titel}</h3>
              <p className="mt-1 text-xs leading-snug text-slate-500">{s.beschrijving}</p>
              <p className="mt-2 text-xs font-medium text-rijk-600">→ {s.actie}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
