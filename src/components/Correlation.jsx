import { useState } from 'react'
import {
  BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList, ReferenceLine,
} from 'recharts'
import { incomeData, balanceData, cashFlowData, operatingData } from '../data'

const YEARS = incomeData.map(d => d.year)

function pearson(pairs) {
  const n = pairs.length
  if (n < 4) return null
  const mx = pairs.reduce((s, p) => s + p.x, 0) / n
  const my = pairs.reduce((s, p) => s + p.y, 0) / n
  const num = pairs.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0)
  const den = Math.sqrt(
    pairs.reduce((s, p) => s + (p.x - mx) ** 2, 0) *
    pairs.reduce((s, p) => s + (p.y - my) ** 2, 0)
  )
  return den === 0 ? null : num / den
}

// YoY % change: (curr - prev) / |prev| * 100
// Skip pairs where prev is 0 or either is null
function yoyPct(prev, curr) {
  if (prev == null || curr == null || prev === 0 || !isFinite(prev) || !isFinite(curr)) return null
  return (curr - prev) / Math.abs(prev) * 100
}

const METRICS = [
  { label: 'Total Revenue',       get: i => incomeData[i]?.totalRevenue,        fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Scheduled Revenue',   get: i => incomeData[i]?.scheduledRevenue,    fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Ancillary Revenue',   get: i => incomeData[i]?.ancillaryRevenue,    fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Operating Profit',    get: i => incomeData[i]?.operatingProfit,     fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Net Profit',          get: i => incomeData[i]?.netProfit,           fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'EPS',                 get: i => incomeData[i]?.eps,                 fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Total Expenses',      get: i => incomeData[i]?.totalExpenses,       fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Fuel & Oil',          get: i => incomeData[i]?.fuel,                fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Staff Costs',         get: i => incomeData[i]?.staff,               fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Operating Margin',    get: i => operatingData[i]?.operatingMargin,  fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Passengers',          get: i => operatingData[i]?.passengers,       fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Load Factor',         get: i => operatingData[i]?.loadFactor,       fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Avg Fare',            get: i => operatingData[i]?.avgFare,          fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Ancillary / Pax',     get: i => operatingData[i]?.ancillaryPerPax,  fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Cost / Pax',          get: i => operatingData[i]?.costPerPax,       fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Staff Count',         get: i => operatingData[i]?.staff,            fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Airports',            get: i => operatingData[i]?.airports,         fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Utilisation',         get: i => operatingData[i]?.utilization,      fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Cash',                get: i => balanceData[i]?.cash,               fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'LT Debt',             get: i => balanceData[i]?.debt,               fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Net Debt',            get: i => balanceData[i]?.netDebt,            fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Shareholders Equity', get: i => balanceData[i]?.equity,             fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
  { label: 'Operating CF',        get: i => cashFlowData[i]?.operating,         fmt: v => `${v > 0 ? '+' : ''}${v.toFixed(1)}%` },
]

function rStrength(r) {
  const abs = Math.abs(r)
  if (abs > 0.7) return { text: 'Strong',   color: 'text-emerald-400' }
  if (abs > 0.4) return { text: 'Moderate', color: 'text-yellow-400' }
  return                  { text: 'Weak',    color: 'text-gray-400' }
}

export default function Correlation({ prices }) {
  // Build stock YoY % changes keyed by the "to" year
  const priceYears = Object.keys(prices).sort()
  const stockChanges = {}
  for (let i = 1; i < priceYears.length; i++) {
    const pct = yoyPct(prices[priceYears[i - 1]], prices[priceYears[i]])
    if (pct != null) stockChanges[priceYears[i]] = pct
  }

  // Build correlations using first differences
  const correlations = METRICS.map(m => {
    const pairs = YEARS.map((y, i) => {
      if (i === 0) return null
      const stockPct = stockChanges[y]
      const metricPct = yoyPct(m.get(i - 1), m.get(i))
      if (stockPct == null || metricPct == null) return null
      return { year: y, x: metricPct, y: stockPct }
    }).filter(Boolean)

    const r = pearson(pairs)
    return r == null ? null : { ...m, r: +r.toFixed(3), n: pairs.length, pairs }
  }).filter(Boolean).sort((a, b) => Math.abs(b.r) - Math.abs(a.r))

  const [selIdx, setSelIdx] = useState(0)
  const sel = correlations[selIdx]

  if (!correlations.length) return null

  const { text: strength, color: strColor } = rStrength(sel.r)

  return (
    <div className="space-y-5">
      <div className="bg-[#0d1b2e] border border-white/10 rounded-xl p-5">
        <p className="text-white font-semibold text-sm mb-0.5">What moves the stock?</p>
        <p className="text-gray-500 text-xs mb-1">
          Pearson r on <span className="text-gray-300">year-over-year % changes</span> — removes the shared upward trend that inflated the previous version.
          Each data point is one fiscal year's change vs the stock's change over the same period.
        </p>
        <p className="text-gray-600 text-xs mb-5">Click a bar to see the scatter plot · n = number of valid year pairs used</p>

        <ResponsiveContainer width="100%" height={correlations.length * 26 + 20}>
          <BarChart
            data={correlations}
            layout="vertical"
            margin={{ top: 0, right: 70, bottom: 0, left: 130 }}
            onClick={d => d?.activeTooltipIndex != null && setSelIdx(d.activeTooltipIndex)}
          >
            <XAxis
              type="number" domain={[-1, 1]}
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              tickLine={false} axisLine={false}
              tickFormatter={v => v.toFixed(1)}
            />
            <YAxis
              type="category" dataKey="label" width={125}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={false} axisLine={false}
            />
            <ReferenceLine x={0} stroke="#ffffff20" />
            <Tooltip
              formatter={v => [v.toFixed(3), 'Pearson r (first diff)']}
              contentStyle={{ background: '#1e2d45', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, fontSize: 12 }}
              itemStyle={{ color: '#fff' }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Bar dataKey="r" radius={[0, 3, 3, 0]} cursor="pointer">
              {correlations.map((d, i) => (
                <Cell
                  key={i}
                  fill={i === selIdx ? '#FFB703' : d.r > 0 ? '#3b82f6' : '#f97316'}
                  fillOpacity={i === selIdx ? 1 : 0.65}
                />
              ))}
              <LabelList
                content={({ x, y, width, height, index }) => {
                  const d = correlations[index]
                  const lx = (width >= 0 ? x + width : x) + (width >= 0 ? 4 : -4)
                  return (
                    <text x={lx} y={y + height / 2 + 4} fill="#6b7280" fontSize={10} textAnchor="start">
                      {d.r.toFixed(3)} <tspan fill="#4b5563">n={d.n}</tspan>
                    </text>
                  )
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scatter */}
      <div className="bg-[#0d1b2e] border border-white/10 rounded-xl p-5">
        <div className="flex items-baseline gap-3 mb-0.5">
          <p className="text-white font-semibold text-sm">
            YoY Δ {sel.label} vs YoY Δ Share Price
          </p>
          <span className={`text-sm font-bold ${strColor}`}>r = {sel.r.toFixed(3)}</span>
          <span className={`text-xs ${strColor}`}>{strength}</span>
          <span className="text-gray-600 text-xs">n = {sel.n}</span>
        </div>
        <p className="text-gray-500 text-xs mb-4">
          Each dot = one year's % change in both variables · axes show % change, not absolute levels
        </p>

        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <ReferenceLine x={0} stroke="#ffffff15" />
            <ReferenceLine y={0} stroke="#ffffff15" />
            <XAxis
              type="number" dataKey="x"
              tick={{ fill: '#9ca3af', fontSize: 10 }} tickLine={false} axisLine={false}
              tickFormatter={v => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`}
              label={{ value: `${sel.label} YoY %`, position: 'insideBottom', offset: -15, fill: '#6b7280', fontSize: 11 }}
            />
            <YAxis
              type="number" dataKey="y"
              tick={{ fill: '#9ca3af', fontSize: 10 }} tickLine={false} axisLine={false}
              tickFormatter={v => `${v > 0 ? '+' : ''}${v.toFixed(0)}%`}
              label={{ value: 'Stock YoY %', angle: -90, position: 'insideLeft', offset: 10, fill: '#6b7280', fontSize: 11 }}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: '#ffffff15' }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const p = payload[0]?.payload
                return (
                  <div className="bg-[#1e2d45] border border-white/20 rounded-lg px-3 py-2 text-xs shadow-xl">
                    <p className="text-[#FFB703] font-semibold mb-1">{p?.year}</p>
                    <p className="text-gray-300">{sel.label}: <span className="text-white font-mono">{p?.x > 0 ? '+' : ''}{p?.x?.toFixed(1)}%</span></p>
                    <p className="text-gray-300">Stock: <span className="text-white font-mono">{p?.y > 0 ? '+' : ''}{p?.y?.toFixed(1)}%</span></p>
                  </div>
                )
              }}
            />
            <Scatter
              data={sel.pairs}
              shape={({ cx, cy, payload }) => (
                <g>
                  <circle cx={cx} cy={cy} r={5} fill="#FFB703" fillOpacity={0.9} />
                  <text x={cx} y={cy - 9} textAnchor="middle" fill="#9ca3af" fontSize={9}>
                    {payload.year?.replace('FY', '')}
                  </text>
                </g>
              )}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
