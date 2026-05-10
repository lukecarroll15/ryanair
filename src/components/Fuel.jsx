import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, ReferenceLine, Cell,
} from 'recharts'
import oilData from '../../ryanair_oil_prices.json'
import { incomeData, operatingData } from '../data'
import ChartCard from './ChartCard'
import ChartTooltip from './Tooltip'

// Merge Brent FY averages with Ryanair data
const fyBrent = Object.fromEntries(oilData.fiscalYearAvg.map(d => [d.fy, d.avgClose]))

const combined = incomeData.map((inc, i) => {
  const ops = operatingData[i]
  const brent = fyBrent[inc.year] ?? null
  const ryanairGal = ops.fuelCost ?? null                 // EUR/gallon
  const fuelPctRev = +((inc.fuel / inc.totalRevenue) * 100).toFixed(1)
  const fuelPctExp = +((inc.fuel / inc.totalExpenses) * 100).toFixed(1)
  return { year: inc.year, brent, ryanairGal, fuelPctRev, fuelPctExp, operatingMargin: ops.operatingMargin, netProfit: inc.netProfit, totalFuelCost: inc.fuel }
})

// Index both to FY2012 = 100 for relative comparison
const base = combined[0]
const indexed = combined.map(d => ({
  year: d.year,
  brentIdx:    d.brent      != null ? +(d.brent / base.brent * 100).toFixed(1)          : null,
  ryanairIdx:  d.ryanairGal != null ? +(d.ryanairGal / base.ryanairGal * 100).toFixed(1) : null,
}))

// Scatter data — filter out years where brent is null
const scatterData = combined.filter(d => d.brent != null && d.ryanairGal != null)

// Monthly Brent for full history chart
const monthlyBrent = oilData.monthly.map(d => ({ date: d.date, price: d.close }))

function pearson(pairs) {
  const n = pairs.length
  if (n < 4) return null
  const mx = pairs.reduce((s, p) => s + p.x, 0) / n
  const my = pairs.reduce((s, p) => s + p.y, 0) / n
  const num = pairs.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0)
  const den = Math.sqrt(pairs.reduce((s, p) => s + (p.x - mx) ** 2, 0) * pairs.reduce((s, p) => s + (p.y - my) ** 2, 0))
  return den === 0 ? null : +(num / den).toFixed(3)
}

const rMargin  = pearson(scatterData.map(d => ({ x: d.brent, y: d.operatingMargin })))
const rProfit  = pearson(scatterData.map(d => ({ x: d.brent, y: d.netProfit })))
const rFuelCst = pearson(scatterData.map(d => ({ x: d.brent, y: d.ryanairGal })))

function ScatterTooltip({ active, payload, xLabel, yLabel, xFmt, yFmt }) {
  if (!active || !payload?.length) return null
  const p = payload[0]?.payload
  return (
    <div className="bg-[#1e2d45] border border-white/20 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-[#FFB703] font-semibold mb-1">{p?.year}</p>
      <p className="text-gray-300">{xLabel}: <span className="text-white font-mono">{xFmt(p?.x ?? p?.brent)}</span></p>
      <p className="text-gray-300">{yLabel}: <span className="text-white font-mono">{yFmt(p?.y ?? p?.operatingMargin ?? p?.ryanairGal)}</span></p>
    </div>
  )
}

function RBadge({ r }) {
  if (r == null) return null
  const abs = Math.abs(r)
  const color = abs > 0.7 ? 'text-emerald-400' : abs > 0.4 ? 'text-yellow-400' : 'text-gray-400'
  const label = abs > 0.7 ? 'strong' : abs > 0.4 ? 'moderate' : 'weak'
  return <span className={`text-xs font-semibold ${color}`}>r = {r.toFixed(3)} ({label})</span>
}

export default function Fuel() {
  return (
    <div className="space-y-6">

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Brent FY2025 avg',    value: `$${fyBrent['FY2025']}/bbl`,  sub: 'USD per barrel' },
          { label: 'Ryanair cost FY2025', value: `€${operatingData.at(-1).fuelCost}/gal`, sub: 'EUR per US gallon' },
          { label: 'Fuel % of revenue',   value: `${combined.at(-1).fuelPctRev}%`, sub: 'FY2025' },
          { label: 'Fuel % of expenses',  value: `${combined.at(-1).fuelPctExp}%`, sub: 'FY2025' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-[#0d1b2e] border border-white/10 rounded-xl p-5">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-2">{label}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-gray-600 text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Full Brent monthly history */}
      <ChartCard title="Brent Crude — Full Monthly History" subtitle="USD per barrel · BZ=F">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={monthlyBrent} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} tickLine={false} axisLine={false} interval={23} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip content={<ChartTooltip fmt={v => `$${v}/bbl`} />} />
            <Line type="monotone" dataKey="price" name="Brent" stroke="#f97316" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Indexed comparison */}
      <ChartCard
        title="Brent Crude vs Ryanair Fuel Cost — Indexed to FY2012"
        subtitle="FY2012 = 100 · removes units so both lines are directly comparable · gap = hedging effect"
      >
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={indexed} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}`} />
            <ReferenceLine y={100} stroke="#ffffff15" strokeDasharray="4 2" />
            <Tooltip content={<ChartTooltip fmt={v => `${v}`} />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <Line type="monotone" dataKey="brentIdx"   name="Brent Crude (indexed)" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="ryanairIdx" name="Ryanair Fuel Cost/Gal (indexed)" stroke="#FFB703" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-gray-600 text-xs mt-3">
          When Ryanair's line sits <em>below</em> Brent, hedging or efficiency gains saved money.
          When it sits <em>above</em>, they overpaid vs market — typically when hedges locked in high rates before a price fall.
        </p>
      </ChartCard>

      {/* Fuel as % of revenue & expenses */}
      <ChartCard title="Fuel Cost as % of Revenue and Expenses" subtitle="Lower % = better insulation from oil price movements">
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={combined} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip content={<ChartTooltip fmt={v => `${v}%`} />} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <Line type="monotone" dataKey="fuelPctRev" name="% of Revenue" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="fuelPctExp" name="% of Expenses" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Two scatter plots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <ChartCard title="Brent Price vs Operating Margin" subtitle={<RBadge r={rMargin} />}>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <ReferenceLine y={0} stroke="#ffffff20" />
              <XAxis type="number" dataKey="brent" tick={{ fill: '#9ca3af', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`}
                label={{ value: 'Brent avg ($/bbl)', position: 'insideBottom', offset: -15, fill: '#6b7280', fontSize: 11 }} />
              <YAxis type="number" dataKey="operatingMargin" tick={{ fill: '#9ca3af', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`}
                label={{ value: 'Op. Margin %', angle: -90, position: 'insideLeft', offset: 10, fill: '#6b7280', fontSize: 11 }} />
              <Tooltip content={<ScatterTooltip xLabel="Brent" yLabel="Op. Margin" xFmt={v => `$${v}/bbl`} yFmt={v => `${v}%`} />} />
              <Scatter data={scatterData} shape={({ cx, cy, payload }) => (
                <g>
                  <circle cx={cx} cy={cy} r={5} fill="#3b82f6" fillOpacity={0.85} />
                  <text x={cx} y={cy - 9} textAnchor="middle" fill="#9ca3af" fontSize={9}>{payload.year?.replace('FY', '')}</text>
                </g>
              )} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Brent Price vs Ryanair Fuel Cost/Gal" subtitle={<RBadge r={rFuelCst} />}>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis type="number" dataKey="brent" tick={{ fill: '#9ca3af', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`}
                label={{ value: 'Brent avg ($/bbl)', position: 'insideBottom', offset: -15, fill: '#6b7280', fontSize: 11 }} />
              <YAxis type="number" dataKey="ryanairGal" tick={{ fill: '#9ca3af', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `€${v}`}
                label={{ value: 'Ryanair €/gal', angle: -90, position: 'insideLeft', offset: 10, fill: '#6b7280', fontSize: 11 }} />
              <Tooltip content={<ScatterTooltip xLabel="Brent" yLabel="Ryanair fuel cost" xFmt={v => `$${v}/bbl`} yFmt={v => `€${v}/gal`} />} />
              <Scatter data={scatterData} shape={({ cx, cy, payload }) => (
                <g>
                  <circle cx={cx} cy={cy} r={5} fill="#f97316" fillOpacity={0.85} />
                  <text x={cx} y={cy - 9} textAnchor="middle" fill="#9ca3af" fontSize={9}>{payload.year?.replace('FY', '')}</text>
                </g>
              )} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Annual data table */}
      <div className="bg-[#0d1b2e] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 bg-white/[0.02]">
          <h3 className="text-white text-sm font-semibold">Annual Fuel Summary</h3>
        </div>
        <div className="grid grid-cols-6 px-5 py-2 border-b border-white/5 text-xs text-gray-500 font-medium uppercase tracking-wider">
          <span>Year</span>
          <span className="text-right">Brent avg</span>
          <span className="text-right">Ryanair €/gal</span>
          <span className="text-right">Total Fuel Cost</span>
          <span className="text-right">% of Revenue</span>
          <span className="text-right">Op. Margin</span>
        </div>
        {combined.map((d, i) => (
          <div key={d.year} className={`grid grid-cols-6 px-5 py-2.5 text-xs items-center hover:bg-white/[0.04] transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
            <span className="text-gray-300 font-medium">{d.year}</span>
            <span className="text-right text-gray-400 font-mono">{d.brent != null ? `$${d.brent}` : '—'}</span>
            <span className="text-right text-white font-mono">€{d.ryanairGal}</span>
            <span className="text-right text-gray-400 font-mono">€{(d.totalFuelCost / 1000).toFixed(1)}B</span>
            <span className="text-right font-mono" style={{ color: d.fuelPctRev > 40 ? '#ef4444' : d.fuelPctRev > 30 ? '#f59e0b' : '#10b981' }}>{d.fuelPctRev}%</span>
            <span className={`text-right font-mono ${d.operatingMargin >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{d.operatingMargin}%</span>
          </div>
        ))}
      </div>

    </div>
  )
}
