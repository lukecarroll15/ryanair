import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts'
import { incomeData, fmtM } from '../data'
import ChartCard from './ChartCard'
import ChartTooltip from './Tooltip'

const enriched = incomeData.map((d, i, arr) => ({
  ...d,
  ancillaryPct: +((d.ancillaryRevenue / d.totalRevenue) * 100).toFixed(1),
  yoyGrowth: i === 0 ? null : +((d.totalRevenue / arr[i - 1].totalRevenue - 1) * 100).toFixed(1),
}))

const growthData = enriched.slice(1)

export default function Revenue() {
  return (
    <div className="space-y-6">
      <ChartCard title="Scheduled vs Ancillary Revenue" subtitle="Stacked bars · EUR millions">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={enriched} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `€${(v / 1000).toFixed(0)}B`} />
            <Tooltip content={<ChartTooltip fmt={v => fmtM(v)} />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <Bar dataKey="scheduledRevenue" name="Scheduled" stackId="a" fill="#2563eb" />
            <Bar dataKey="ancillaryRevenue" name="Ancillary" stackId="a" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Ancillary Revenue %" subtitle="As share of total revenue">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={enriched} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[0, 60]} />
              <Tooltip content={<ChartTooltip fmt={v => `${v}%`} />} />
              <Line type="monotone" dataKey="ancillaryPct" name="Ancillary %" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue YoY Growth" subtitle="% change vs prior year">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={growthData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<ChartTooltip fmt={v => `${v > 0 ? '+' : ''}${v?.toFixed(1)}%`} />} />
              <Bar dataKey="yoyGrowth" name="YoY Growth" radius={[3, 3, 0, 0]}>
                {growthData.map((d, i) => (
                  <Cell key={i} fill={d.yoyGrowth >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
