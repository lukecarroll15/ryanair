import { useState } from 'react'
import { incomeData, balanceData, cashFlowData, operatingData, fmtM, fmtEur } from '../data'

const YEARS = incomeData.map(d => d.year)

function getYear(year) {
  const inc = incomeData.find(d => d.year === year)
  const bal = balanceData.find(d => d.year === year)
  const cf = cashFlowData.find(d => d.year === year)
  const ops = operatingData.find(d => d.year === year)
  return { inc, bal, cf, ops }
}

const pctDiff = (a, b) => {
  if (a == null || b == null || a === 0) return null
  return ((b - a) / Math.abs(a)) * 100
}

const fmtPax = v => (v == null ? '—' : `${v}M`)
const fmtNum = v => (v == null ? '—' : v.toLocaleString())
const fmtH = v => (v == null ? '—' : `${v}h`)
const fmtPct2 = v => (v == null ? '—' : `${v}%`)
const fmtEurG = v => (v == null ? '—' : `€${v.toFixed(3)}/gal`)

// inverse=true means lower is better (costs, debt) — green = decrease
const SECTIONS = [
  {
    title: 'Income Statement',
    rows: [
      { label: 'Total Revenue',       get: d => d.inc?.totalRevenue,       fmt: fmtM },
      { label: 'Scheduled Revenue',   get: d => d.inc?.scheduledRevenue,   fmt: fmtM },
      { label: 'Ancillary Revenue',   get: d => d.inc?.ancillaryRevenue,   fmt: fmtM },
      { label: 'Ancillary % of Rev',  get: d => d.inc && +((d.inc.ancillaryRevenue / d.inc.totalRevenue) * 100).toFixed(1), fmt: fmtPct2 },
      { label: 'Total Expenses',      get: d => d.inc?.totalExpenses,      fmt: fmtM, inverse: true },
      { label: 'Operating Profit',    get: d => d.inc?.operatingProfit,    fmt: fmtM },
      { label: 'Net Profit',          get: d => d.inc?.netProfit,          fmt: fmtM },
      { label: 'Basic EPS',           get: d => d.inc?.eps,                fmt: v => v == null ? '—' : `€${v.toFixed(2)}` },
    ],
  },
  {
    title: 'Operating Expenses',
    rows: [
      { label: 'Fuel & Oil',          get: d => d.inc?.fuel,               fmt: fmtM, inverse: true },
      { label: 'Staff Costs',         get: d => d.inc?.staff,              fmt: fmtM, inverse: true },
      { label: 'Airport & Handling',  get: d => d.inc?.airport,            fmt: fmtM, inverse: true },
      { label: 'Route Charges',       get: d => d.inc?.routeCharges,       fmt: fmtM, inverse: true },
      { label: 'Depreciation',        get: d => d.inc?.depreciation,       fmt: fmtM, inverse: true },
      { label: 'Marketing & Other',   get: d => d.inc?.marketing,          fmt: fmtM, inverse: true },
      { label: 'Maintenance',         get: d => d.inc?.maintenance,        fmt: fmtM, inverse: true },
      { label: 'Aircraft Rentals',    get: d => d.inc?.rentals,            fmt: fmtM, inverse: true },
    ],
  },
  {
    title: 'Balance Sheet',
    rows: [
      { label: 'Total Assets',        get: d => d.bal?.totalAssets,        fmt: fmtM },
      { label: 'Cash & Equivalents',  get: d => d.bal?.cash,               fmt: fmtM },
      { label: 'LT Debt (incl. leases)', get: d => d.bal?.debt,            fmt: fmtM, inverse: true },
      { label: 'Net Debt',            get: d => d.bal?.netDebt,            fmt: fmtM, inverse: true },
      { label: 'Shareholders Equity', get: d => d.bal?.equity,             fmt: fmtM },
    ],
  },
  {
    title: 'Cash Flow',
    rows: [
      { label: 'Operating CF',        get: d => d.cf?.operating,           fmt: fmtM },
      { label: 'Investing CF',        get: d => d.cf?.investing,           fmt: fmtM },
      { label: 'Financing CF',        get: d => d.cf?.financing,           fmt: fmtM },
    ],
  },
  {
    title: 'Operating Metrics',
    rows: [
      { label: 'Passengers',          get: d => d.ops?.passengers,         fmt: fmtPax },
      { label: 'Load Factor',         get: d => d.ops?.loadFactor,         fmt: fmtPct2 },
      { label: 'Operating Margin',    get: d => d.ops?.operatingMargin,    fmt: fmtPct2 },
      { label: 'Avg Booked Fare',     get: d => d.ops?.avgFare,            fmt: fmtEur },
      { label: 'Ancillary / Pax',     get: d => d.ops?.ancillaryPerPax,    fmt: fmtEur },
      { label: 'Cost / Pax',          get: d => d.ops?.costPerPax,         fmt: fmtEur, inverse: true },
      { label: 'Staff',               get: d => d.ops?.staff,              fmt: fmtNum },
      { label: 'Airports Served',     get: d => d.ops?.airports,           fmt: fmtNum },
      { label: 'Daily Utilisation',   get: d => d.ops?.utilization,        fmt: fmtH },
      { label: 'Fuel Cost / Gal',     get: d => d.ops?.fuelCost,           fmt: fmtEurG, inverse: true },
    ],
  },
]

function Badge({ pct, inverse }) {
  if (pct == null) return <span className="text-gray-600 text-xs">—</span>
  const positive = inverse ? pct < 0 : pct > 0
  const neutral = Math.abs(pct) < 0.05
  if (neutral) return <span className="text-gray-400 text-xs font-medium">0%</span>
  return (
    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${positive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
      {pct > 0 ? '+' : ''}{pct.toFixed(1)}%
    </span>
  )
}

function YearSelect({ value, onChange, exclude }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="bg-[#0d1b2e] border border-white/20 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#FFB703] cursor-pointer"
    >
      {YEARS.map(y => (
        <option key={y} value={y} disabled={y === exclude}>{y}</option>
      ))}
    </select>
  )
}

export default function Compare() {
  const [yearA, setYearA] = useState('FY2019')
  const [yearB, setYearB] = useState('FY2025')

  const a = getYear(yearA)
  const b = getYear(yearB)

  return (
    <div className="space-y-6">
      {/* Year pickers */}
      <div className="bg-[#0d1b2e] border border-white/10 rounded-xl p-5 flex flex-wrap items-center gap-4">
        <span className="text-gray-400 text-sm">Compare</span>
        <YearSelect value={yearA} onChange={setYearA} exclude={yearB} />
        <span className="text-gray-500 text-sm">vs</span>
        <YearSelect value={yearB} onChange={setYearB} exclude={yearA} />
        <span className="text-gray-500 text-xs ml-auto">% change shown from {yearA} → {yearB}</span>
      </div>

      {yearA === yearB && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-5 py-3 text-yellow-400 text-sm">
          Select two different years to see a comparison.
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {SECTIONS.map(section => (
          <div key={section.title} className="bg-[#0d1b2e] border border-white/10 rounded-xl overflow-hidden">
            {/* Section header */}
            <div className="px-5 py-3 border-b border-white/10 bg-white/[0.02]">
              <h3 className="text-white text-sm font-semibold">{section.title}</h3>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-4 px-5 py-2 border-b border-white/5 text-xs text-gray-500 font-medium uppercase tracking-wider">
              <span>Metric</span>
              <span className="text-right">{yearA}</span>
              <span className="text-right">{yearB}</span>
              <span className="text-right">Change</span>
            </div>

            {/* Rows */}
            {section.rows.map((row, i) => {
              const valA = row.get(a)
              const valB = row.get(b)
              const pct = pctDiff(valA, valB)
              return (
                <div
                  key={row.label}
                  className={`grid grid-cols-4 px-5 py-2.5 text-sm items-center ${i % 2 === 0 ? '' : 'bg-white/[0.02]'} hover:bg-white/[0.04] transition-colors`}
                >
                  <span className="text-gray-300">{row.label}</span>
                  <span className="text-right text-gray-400 font-mono text-xs">{valA != null ? row.fmt(valA) : '—'}</span>
                  <span className="text-right text-white font-mono text-xs">{valB != null ? row.fmt(valB) : '—'}</span>
                  <span className="text-right"><Badge pct={pct} inverse={row.inverse} /></span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
