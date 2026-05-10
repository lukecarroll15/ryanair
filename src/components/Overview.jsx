import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts'
import { incomeData, latest, fmtM, pctChange } from '../data'
import KPICard from './KPICard'
import ChartCard from './ChartCard'
import ChartTooltip from './Tooltip'

const { income: l, prev: p, ops: lo, prevOps: po } = latest

export default function Overview() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          label="Total Revenue"
          value={fmtM(l.totalRevenue)}
          change={pctChange(l.totalRevenue, p.totalRevenue)}
        />
        <KPICard
          label="Net Profit"
          value={fmtM(l.netProfit)}
          change={pctChange(l.netProfit, p.netProfit)}
        />
        <KPICard
          label="Passengers"
          value={`${lo.passengers}M`}
          change={pctChange(lo.passengers, po.passengers)}
        />
        <KPICard
          label="Basic EPS"
          value={`€${l.eps.toFixed(2)}`}
          change={pctChange(l.eps, p.eps)}
        />
      </div>

      <ChartCard title="Revenue Breakdown" subtitle="Scheduled vs Ancillary · EUR millions">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={incomeData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <defs>
              <linearGradient id="gradSched" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="gradAnc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.7} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `€${(v/1000).toFixed(0)}B`} />
            <Tooltip content={<ChartTooltip fmt={v => fmtM(v)} />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <Area type="monotone" dataKey="scheduledRevenue" name="Scheduled" stackId="1" stroke="#2563eb" fill="url(#gradSched)" strokeWidth={2} />
            <Area type="monotone" dataKey="ancillaryRevenue" name="Ancillary" stackId="1" stroke="#f59e0b" fill="url(#gradAnc)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Net Profit / Loss" subtitle="EUR millions · FY2021 & FY2022 loss years highlighted">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={incomeData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => fmtM(v)} />
            <Tooltip content={<ChartTooltip fmt={v => fmtM(v)} />} />
            <Bar dataKey="netProfit" name="Net Profit" radius={[3, 3, 0, 0]}>
              {incomeData.map((d, i) => (
                <Cell key={i} fill={d.netProfit >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
