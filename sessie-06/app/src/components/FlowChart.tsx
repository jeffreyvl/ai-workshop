import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { FlowPunt } from '../cbs'

// Saldo (instroom - uitstroom) als lijn erbovenop: positief = bestand groeit.
type Rij = FlowPunt & { saldo: number }

export function FlowChart({ data }: { data: FlowPunt[] }) {
  const rijen: Rij[] = data.map((d) => ({ ...d, saldo: d.instroom - d.uitstroom }))

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <ComposedChart data={rijen} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="kwartaal" tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip
            formatter={(v: number, n: string) => [v.toLocaleString('nl-NL'), n]}
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          <Bar dataKey="instroom" name="Instroom" fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Bar dataKey="uitstroom" name="Uitstroom" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="saldo" name="Saldo (bestand ±)" stroke="#154273" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
