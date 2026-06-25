import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { TrendPunt } from '../cbs'

const lijnen: { key: keyof TrendPunt; naam: string; kleur: string }[] = [
  { key: 'wia', naam: 'WIA', kleur: '#3b82f6' },
  { key: 'bijstand', naam: 'Bijstand', kleur: '#154273' },
  { key: 'wajong', naam: 'Wajong', kleur: '#10b981' },
  { key: 'ww', naam: 'WW', kleur: '#f59e0b' },
  { key: 'wao', naam: 'WAO', kleur: '#94a3b8' },
]

export function TrendChart({ data }: { data: TrendPunt[] }) {
  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="maand" tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip
            formatter={(v: number, n: string) => [`${v.toLocaleString('nl-NL')} dzd`, n]}
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          {lijnen.map((l) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.naam}
              stroke={l.kleur}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
