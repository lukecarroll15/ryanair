import {
  LineChart, Line, BarChart, Bar, ComposedChart, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell, ReferenceLine,
} from 'recharts'
import { incomeData, operatingData, fmtM, fmtEur } from '../data'
import ChartCard from './ChartCard'
import ChartTooltip from './Tooltip'

const combined = incomeData.map((d, i) => ({
  year: d.year,
  operatingMargin: operatingData[i].operatingMargin,
  eps: d.eps,
  avgFare: operatingData[i].avgFare,
  costPerPax: operatingData[i].costPerPax,
  ancillaryPerPax: operatingData[i].ancillaryPerPax,
}))

export default function Profitability() {
  return (
    <div className="space-y-6">
      <ChartCard title="Operating Margin %" subtitle="COVID collapse in FY2021 (-51%) clearly visible">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={combined} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<ChartTooltip fmt={v => `${v}%`} />} />
            <ReferenceLine y={0} stroke="#ffffff30" />
            <Bar dataKey="operatingMargin" name="Operating Margin" radius={[3, 3, 0, 0]}>
              {combined.map((d, i) => (
                <Cell key={i} fill={d.operatingMargin >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Basic EPS" subtitle="Earnings per share · EUR">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={combined} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `€${v.toFixed(1)}`} />
              <Tooltip content={<ChartTooltip fmt={v => fmtEur(v)} />} />
              <ReferenceLine y={0} stroke="#ffffff30" />
              <Bar dataKey="eps" name="EPS" radius={[3, 3, 0, 0]}>
                {combined.map((d, i) => (
                  <Cell key={i} fill={d.eps >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue vs Cost Per Passenger" subtitle="EUR per booked passenger">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={combined} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `€${v}`} />
              <Tooltip content={<ChartTooltip fmt={v => fmtEur(v)} />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#9ca3af' }} />
              <Line type="monotone" dataKey="avgFare" name="Avg Fare" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="ancillaryPerPax" name="Ancillary/Pax" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="costPerPax" name="Cost/Pax" stroke="#ef4444" strokeWidth={2} dot={{ r: 2 }} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
