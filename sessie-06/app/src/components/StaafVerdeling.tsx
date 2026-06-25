import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import type { Verdeling } from '../cbs'

export function StaafVerdeling({ data, eenheid }: { data: Verdeling[]; eenheid?: string }) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis
            type="category"
            dataKey="naam"
            width={90}
            tick={{ fontSize: 12, fill: '#475569' }}
          />
          <Tooltip
            formatter={(v: number) => [`${v.toLocaleString('nl-NL')} ${eenheid ?? ''}`.trim(), 'Aantal']}
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
          />
          <Bar dataKey="aantal" radius={[0, 6, 6, 0]}>
            {data.map((d) => (
              <Cell key={d.naam} fill={d.kleur} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
