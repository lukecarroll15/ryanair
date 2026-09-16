import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts'
import { cashFlowData, latestYear, fmtM } from '../data'
import ChartCard from './ChartCard'
import ChartTooltip from './Tooltip'

export default function CashFlow() {
  return (
    <div className="space-y-6">
      <ChartCard title="Cash Flow Statement" subtitle="Operating / Investing / Financing · EUR millions">
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={cashFlowData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => fmtM(v)} />
            <Tooltip content={<ChartTooltip fmt={v => fmtM(v)} />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <ReferenceLine y={0} stroke="#ffffff30" />
            <Bar dataKey="operating" name="Operating" fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="investing" name="Investing" fill="#ef4444" radius={[3, 3, 0, 0]} />
            <Bar dataKey="financing" name="Financing" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: `${latestYear} Operating CF`, value: fmtM(cashFlowData.at(-1).operating), color: 'text-emerald-400' },
          { label: `${latestYear} Investing CF`, value: fmtM(cashFlowData.at(-1).investing), color: 'text-red-400' },
          { label: `${latestYear} Financing CF`, value: fmtM(cashFlowData.at(-1).financing), color: 'text-violet-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#0d1b2e] border border-white/10 rounded-xl p-5 text-center">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
