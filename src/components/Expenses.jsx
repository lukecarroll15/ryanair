import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts'
import { incomeData, fmtM } from '../data'
import ChartCard from './ChartCard'
import ChartTooltip from './Tooltip'

const EXP_COLORS = {
  fuel: '#ef4444',
  staff: '#3b82f6',
  airport: '#8b5cf6',
  routeCharges: '#06b6d4',
  depreciation: '#f97316',
  marketing: '#ec4899',
  maintenance: '#84cc16',
  rentals: '#94a3b8',
}

const EXP_LABELS = {
  fuel: 'Fuel & Oil',
  staff: 'Staff',
  airport: 'Airport & Handling',
  routeCharges: 'Route Charges',
  depreciation: 'Depreciation',
  marketing: 'Marketing & Other',
  maintenance: 'Maintenance',
  rentals: 'Aircraft Rentals',
}

const expRatio = incomeData.map(d => ({
  year: d.year,
  costRatio: +((d.totalExpenses / d.totalRevenue) * 100).toFixed(1),
}))

const latest = incomeData.at(-1)
const pieData = Object.keys(EXP_LABELS).map(k => ({
  name: EXP_LABELS[k],
  value: latest[k] ?? 0,
  color: EXP_COLORS[k],
})).filter(d => d.value > 0)

export default function Expenses() {
  return (
    <div className="space-y-6">
      <ChartCard title="Operating Expense Breakdown" subtitle="EUR millions · stacked by category">
        <ResponsiveContainer width="100%" height={340}>
          <BarChart data={incomeData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `€${(v / 1000).toFixed(0)}B`} />
            <Tooltip content={<ChartTooltip fmt={v => fmtM(v)} />} />
            <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
            {Object.keys(EXP_LABELS).map(k => (
              <Bar key={k} dataKey={k} name={EXP_LABELS[k]} stackId="a" fill={EXP_COLORS[k]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Expenses as % of Revenue" subtitle="Cost ratio trend — lower is better">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={expRatio} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[60, 200]} />
              <Tooltip content={<ChartTooltip fmt={v => `${v}%`} />} />
              <Line type="monotone" dataKey="costRatio" name="Cost Ratio" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title={`FY2025 Expense Mix`} subtitle="By category — latest year">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name" paddingAngle={2}>
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip formatter={(v, name) => [fmtM(v), name]} contentStyle={{ background: '#1e2d45', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#9ca3af' }} itemStyle={{ color: '#fff' }} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
