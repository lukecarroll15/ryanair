import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts'
import { balanceData, fmtM } from '../data'
import ChartCard from './ChartCard'
import ChartTooltip from './Tooltip'

export default function BalanceSheet() {
  return (
    <div className="space-y-6">
      <ChartCard title="Cash, Debt & Equity Over Time" subtitle="EUR millions">
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={balanceData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `€${(v / 1000).toFixed(0)}B`} />
            <Tooltip content={<ChartTooltip fmt={v => fmtM(v)} />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <Line type="monotone" dataKey="totalAssets" name="Total Assets" stroke="#6b7280" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            <Line type="monotone" dataKey="equity" name="Equity" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} />
            <Line type="monotone" dataKey="debt" name="LT Debt" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3, fill: '#ef4444' }} />
            <Line type="monotone" dataKey="cash" name="Cash" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Net Debt (Debt − Cash)" subtitle="Negative = net cash position">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={balanceData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => fmtM(v)} />
            <Tooltip content={<ChartTooltip fmt={v => fmtM(v)} />} />
            <Bar dataKey="netDebt" name="Net Debt" radius={[3, 3, 0, 0]}>
              {balanceData.map((d, i) => (
                <Cell key={i} fill={d.netDebt >= 0 ? '#ef4444' : '#10b981'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
