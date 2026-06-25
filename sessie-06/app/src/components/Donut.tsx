import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import type { Verdeling } from '../cbs'

export function Donut({ data }: { data: Verdeling[] }) {
  const totaal = data.reduce((s, d) => s + d.aantal, 0)

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="aantal"
            nameKey="naam"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
          >
            {data.map((d) => (
              <Cell key={d.naam} fill={d.kleur} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: number, n: string) => [
              `${(v * 1000).toLocaleString('nl-NL')} (${totaal ? Math.round((v / totaal) * 100) : 0}%)`,
              n,
            ]}
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
