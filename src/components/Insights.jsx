import { useState } from 'react'
import { incomeData, balanceData, cashFlowData, operatingData } from '../data'

const YEARS = incomeData.map(d => d.year)

const byYear = Object.fromEntries(
  YEARS.map((y, i) => [y, {
    inc: incomeData[i],
    bal: balanceData[i],
    cf: cashFlowData[i],
    ops: operatingData[i],
  }])
)

// Formatters
const M   = v => v == null ? '—' : (Math.abs(v) >= 1000 ? `€${(v / 1000).toFixed(1)}B` : `€${v.toFixed(0)}M`)
const Pct = v => v == null ? '—' : `${v}%`
const Eur = v => v == null ? '—' : `€${v.toFixed(2)}`
const Mpx = v => v == null ? '—' : `${v}M`
const Num = v => v == null ? '—' : v.toLocaleString()

const KEY_METRICS = [
  { label: 'Total Revenue',      get: d => d.inc?.totalRevenue,        fmt: M },
  { label: 'Scheduled Revenue',  get: d => d.inc?.scheduledRevenue,    fmt: M },
  { label: 'Ancillary Revenue',  get: d => d.inc?.ancillaryRevenue,    fmt: M },
  { label: 'Operating Profit',   get: d => d.inc?.operatingProfit,     fmt: M },
  { label: 'Net Profit',         get: d => d.inc?.netProfit,           fmt: M },
  { label: 'EPS',                get: d => d.inc?.eps,                 fmt: Eur },
  { label: 'Total Expenses',     get: d => d.inc?.totalExpenses,       fmt: M },
  { label: 'Fuel & Oil',         get: d => d.inc?.fuel,                fmt: M },
  { label: 'Staff Costs',        get: d => d.inc?.staff,               fmt: M },
  { label: 'Operating Margin',   get: d => d.ops?.operatingMargin,     fmt: Pct },
  { label: 'Passengers',         get: d => d.ops?.passengers,          fmt: Mpx },
  { label: 'Load Factor',        get: d => d.ops?.loadFactor,          fmt: Pct },
  { label: 'Avg Fare',           get: d => d.ops?.avgFare,             fmt: Eur },
  { label: 'Ancillary / Pax',    get: d => d.ops?.ancillaryPerPax,     fmt: Eur },
  { label: 'Cost / Pax',         get: d => d.ops?.costPerPax,          fmt: Eur },
  { label: 'Staff Count',        get: d => d.ops?.staff,               fmt: Num },
  { label: 'Airports',           get: d => d.ops?.airports,            fmt: Num },
  { label: 'Utilisation',        get: d => d.ops?.utilization,         fmt: v => `${v}h` },
  { label: 'Cash',               get: d => d.bal?.cash,                fmt: M },
  { label: 'LT Debt',            get: d => d.bal?.debt,                fmt: M },
  { label: 'Net Debt',           get: d => d.bal?.netDebt,             fmt: M },
  { label: 'Shareholders Equity',get: d => d.bal?.equity,              fmt: M },
  { label: 'Total Assets',       get: d => d.bal?.totalAssets,         fmt: M },
  { label: 'Operating CF',       get: d => d.cf?.operating,            fmt: M },
]

// All year-over-year swings, sorted by abs(%)
function buildSwings() {
  const swings = []
  KEY_METRICS.forEach(metric => {
    YEARS.forEach((y, i) => {
      if (i === 0) return
      const prev = metric.get(byYear[YEARS[i - 1]])
      const curr = metric.get(byYear[y])
      if (prev == null || curr == null || prev === 0) return
      const pct = (curr - prev) / Math.abs(prev) * 100
      swings.push({
        metric: metric.label,
        fmt: metric.fmt,
        fromYear: YEARS[i - 1],
        toYear: y,
        from: prev,
        to: curr,
        pct,
        isCovid: y === 'FY2021' || y === 'FY2022',
      })
    })
  })
  return swings.sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct))
}

// All-time records for key display metrics
const RECORD_METRICS = [
  { label: 'Total Revenue',     get: d => d.inc?.totalRevenue,       fmt: M },
  { label: 'Net Profit',        get: d => d.inc?.netProfit,          fmt: M },
  { label: 'Operating Margin',  get: d => d.ops?.operatingMargin,    fmt: Pct },
  { label: 'Basic EPS',         get: d => d.inc?.eps,                fmt: Eur },
  { label: 'Passengers',        get: d => d.ops?.passengers,         fmt: Mpx },
  { label: 'Load Factor',       get: d => d.ops?.loadFactor,         fmt: Pct },
  { label: 'Operating CF',      get: d => d.cf?.operating,           fmt: M },
  { label: 'Shareholders Equity', get: d => d.bal?.equity,           fmt: M },
]

function buildRecords() {
  return RECORD_METRICS.map(metric => {
    const vals = YEARS.map(y => ({ year: y, value: metric.get(byYear[y]) })).filter(d => d.value != null)
    const best  = vals.reduce((a, b) => b.value > a.value ? b : a)
    const worst = vals.reduce((a, b) => b.value < a.value ? b : a)
    return { label: metric.label, fmt: metric.fmt, best, worst }
  })
}

const cagr = (start, end, n) => ((end / start) ** (1 / n) - 1) * 100

const CAGRS = (() => {
  const n = YEARS.length - 1 // 13 years
  const first = byYear[YEARS[0]]
  const last  = byYear[YEARS.at(-1)]
  return [
    { label: 'Total Revenue',  value: cagr(first.inc.totalRevenue,  last.inc.totalRevenue,  n) },
    { label: 'Net Profit',     value: cagr(first.inc.netProfit,     last.inc.netProfit,     n) },
    { label: 'Passengers',     value: cagr(first.ops.passengers,    last.ops.passengers,    n) },
    { label: 'Basic EPS',      value: cagr(first.inc.eps,           last.inc.eps,           n) },
    { label: 'Total Expenses', value: cagr(first.inc.totalExpenses, last.inc.totalExpenses, n) },
    { label: 'Cash',           value: cagr(first.bal.cash,          last.bal.cash,          n) },
  ]
})()

const ALL_SWINGS = buildSwings()
const RECORDS = buildRecords()

function SwingRow({ rank, s }) {
  const up = s.pct > 0
  return (
    <div className={`grid grid-cols-12 items-center px-4 py-3 gap-2 text-xs ${rank % 2 === 0 ? '' : 'bg-white/[0.02]'} hover:bg-white/[0.04] transition-colors`}>
      <span className="col-span-1 text-gray-600 font-mono">{rank}</span>
      <span className="col-span-3 text-gray-200 font-medium">{s.metric}</span>
      <span className="col-span-2 text-gray-500 text-center">
        {s.fromYear} <span className="text-gray-700">→</span> {s.toYear}
      </span>
      <span className="col-span-2 text-right text-gray-400 font-mono">{s.fmt(s.from)}</span>
      <span className="col-span-2 text-right text-white font-mono">{s.fmt(s.to)}</span>
      <span className="col-span-2 text-right">
        <span className={`font-semibold px-1.5 py-0.5 rounded text-[11px] ${up ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
          {up ? '+' : ''}{s.pct.toFixed(1)}%
        </span>
      </span>
    </div>
  )
}

export default function Insights() {
  const [showCovid, setShowCovid] = useState(true)
  const [limit, setLimit] = useState(20)

  const swings = showCovid ? ALL_SWINGS : ALL_SWINGS.filter(s => !s.isCovid)
  const visible = swings.slice(0, limit)

  return (
    <div className="space-y-8">

      {/* CAGR */}
      <div>
        <h2 className="text-white font-semibold text-sm mb-3">Long-Run Growth  <span className="text-gray-500 font-normal">FY2012 → FY2025 compound annual growth rate</span></h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CAGRS.map(c => (
            <div key={c.label} className="bg-[#0d1b2e] border border-white/10 rounded-xl p-4 text-center">
              <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">{c.label}</p>
              <p className={`text-2xl font-bold ${c.value > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {c.value > 0 ? '+' : ''}{c.value.toFixed(1)}%
              </p>
              <p className="text-gray-600 text-[10px] mt-1">per year</p>
            </div>
          ))}
        </div>
      </div>

      {/* All-time records */}
      <div>
        <h2 className="text-white font-semibold text-sm mb-3">All-Time Records</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {RECORDS.map(r => (
            <div key={r.label} className="bg-[#0d1b2e] border border-white/10 rounded-xl p-4 flex gap-4">
              <div className="flex-1">
                <p className="text-gray-400 text-[10px] uppercase tracking-widest mb-1">{r.label}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-emerald-400 font-bold text-lg">{r.fmt(r.best.value)}</span>
                  <span className="text-gray-600 text-xs">best · {r.best.year}</span>
                </div>
              </div>
              <div className="w-px bg-white/10" />
              <div className="flex-1">
                <p className="text-gray-600 text-[10px] uppercase tracking-widest mb-1">worst</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-red-400 font-bold text-lg">{r.fmt(r.worst.value)}</span>
                  <span className="text-gray-600 text-xs">{r.worst.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Biggest swings */}
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h2 className="text-white font-semibold text-sm">Biggest Year-over-Year Swings</h2>
          <span className="text-gray-500 text-xs">ranked by % change across all metrics</span>
          <label className="ml-auto flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
            <div
              onClick={() => setShowCovid(p => !p)}
              className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${showCovid ? 'bg-[#FFB703]' : 'bg-gray-700'}`}
            >
              <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${showCovid ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            Include COVID years (FY2021–22)
          </label>
        </div>

        <div className="bg-[#0d1b2e] border border-white/10 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 px-4 py-2.5 border-b border-white/10 text-[10px] text-gray-500 font-medium uppercase tracking-wider gap-2">
            <span className="col-span-1">#</span>
            <span className="col-span-3">Metric</span>
            <span className="col-span-2 text-center">Years</span>
            <span className="col-span-2 text-right">From</span>
            <span className="col-span-2 text-right">To</span>
            <span className="col-span-2 text-right">Change</span>
          </div>

          {visible.map((s, i) => <SwingRow key={`${s.metric}-${s.toYear}`} rank={i + 1} s={s} />)}

          {swings.length > limit && (
            <div className="border-t border-white/10 px-4 py-3 text-center">
              <button
                onClick={() => setLimit(l => l + 20)}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Show more ({swings.length - limit} remaining)
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
