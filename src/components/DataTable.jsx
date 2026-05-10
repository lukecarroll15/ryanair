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
const M  = v => v == null ? null : (Math.abs(v) >= 1000 ? `€${(v / 1000).toFixed(1)}B` : `€${v.toFixed(0)}M`)
const Pct = v => v == null ? null : `${v}%`
const Eur = v => v == null ? null : `€${v.toFixed(2)}`
const Num = v => v == null ? null : v.toLocaleString()
const H   = v => v == null ? null : `${v}h`
const G   = v => v == null ? null : `€${v.toFixed(3)}`
const Mpx = v => v == null ? null : `${v}M`

// inverse=true → lower is better (used for min/max colouring)
const SECTIONS = [
  {
    id: 'income',
    label: 'Income Statement',
    rows: [
      { label: 'Total Revenue',        get: d => d.inc?.totalRevenue,                         fmt: M },
      { label: 'Scheduled Revenue',    get: d => d.inc?.scheduledRevenue,                     fmt: M },
      { label: 'Ancillary Revenue',    get: d => d.inc?.ancillaryRevenue,                     fmt: M },
      { label: 'Ancillary % of Rev',   get: d => d.inc && +((d.inc.ancillaryRevenue / d.inc.totalRevenue) * 100).toFixed(1), fmt: Pct },
      { label: 'Total Expenses',       get: d => d.inc?.totalExpenses,                        fmt: M,   inverse: true },
      { label: 'Operating Profit',     get: d => d.inc?.operatingProfit,                      fmt: M },
      { label: 'Net Profit / Loss',    get: d => d.inc?.netProfit,                            fmt: M },
      { label: 'Basic EPS',            get: d => d.inc?.eps,                                  fmt: Eur },
    ],
  },
  {
    id: 'expenses',
    label: 'Operating Expenses',
    rows: [
      { label: 'Fuel & Oil',           get: d => d.inc?.fuel,           fmt: M,   inverse: true },
      { label: 'Staff',                get: d => d.inc?.staff,          fmt: M,   inverse: true },
      { label: 'Airport & Handling',   get: d => d.inc?.airport,        fmt: M,   inverse: true },
      { label: 'Route Charges',        get: d => d.inc?.routeCharges,   fmt: M,   inverse: true },
      { label: 'Depreciation',         get: d => d.inc?.depreciation,   fmt: M,   inverse: true },
      { label: 'Marketing & Other',    get: d => d.inc?.marketing,      fmt: M,   inverse: true },
      { label: 'Maintenance',          get: d => d.inc?.maintenance,    fmt: M,   inverse: true },
      { label: 'Aircraft Rentals',     get: d => d.inc?.rentals,        fmt: M,   inverse: true },
    ],
  },
  {
    id: 'balance',
    label: 'Balance Sheet',
    rows: [
      { label: 'Total Assets',         get: d => d.bal?.totalAssets,    fmt: M },
      { label: 'Cash & Equivalents',   get: d => d.bal?.cash,           fmt: M },
      { label: 'LT Debt',              get: d => d.bal?.debt,           fmt: M,   inverse: true },
      { label: 'Net Debt',             get: d => d.bal?.netDebt,        fmt: M,   inverse: true },
      { label: 'Shareholders Equity',  get: d => d.bal?.equity,         fmt: M },
    ],
  },
  {
    id: 'cashflow',
    label: 'Cash Flow',
    rows: [
      { label: 'Operating CF',         get: d => d.cf?.operating,       fmt: M },
      { label: 'Investing CF',         get: d => d.cf?.investing,       fmt: M },
      { label: 'Financing CF',         get: d => d.cf?.financing,       fmt: M },
    ],
  },
  {
    id: 'ops',
    label: 'Operations',
    rows: [
      { label: 'Passengers',           get: d => d.ops?.passengers,     fmt: Mpx },
      { label: 'Load Factor',          get: d => d.ops?.loadFactor,     fmt: Pct },
      { label: 'Operating Margin',     get: d => d.ops?.operatingMargin,fmt: Pct },
      { label: 'Avg Booked Fare',      get: d => d.ops?.avgFare,        fmt: Eur },
      { label: 'Ancillary / Pax',      get: d => d.ops?.ancillaryPerPax,fmt: Eur },
      { label: 'Cost / Pax',           get: d => d.ops?.costPerPax,     fmt: Eur, inverse: true },
      { label: 'Staff',                get: d => d.ops?.staff,          fmt: Num },
      { label: 'Airports Served',      get: d => d.ops?.airports,       fmt: Num },
      { label: 'Daily Utilisation',    get: d => d.ops?.utilization,    fmt: H },
      { label: 'Fuel Cost / Gal',      get: d => d.ops?.fuelCost,       fmt: G,   inverse: true },
    ],
  },
]

// Returns bg class for a cell based on its rank in the row
function cellBg(val, allVals, inverse) {
  const nums = allVals.filter(v => v != null && isFinite(v))
  if (nums.length === 0 || val == null) return ''
  const max = Math.max(...nums)
  const min = Math.min(...nums)
  if (max === min) return ''
  const best  = inverse ? min : max
  const worst = inverse ? max : min
  if (val === best)  return 'bg-emerald-500/10 text-emerald-300'
  if (val === worst) return 'bg-red-500/10 text-red-300'
  return ''
}

const FILTER_ALL = 'all'

export default function DataTable() {
  const [active, setActive] = useState(FILTER_ALL)
  const [newestFirst, setNewestFirst] = useState(true)

  const displayYears = newestFirst ? [...YEARS].reverse() : YEARS
  const sections = active === FILTER_ALL ? SECTIONS : SECTIONS.filter(s => s.id === active)

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5">
          {[{ id: FILTER_ALL, label: 'All' }, ...SECTIONS.map(s => ({ id: s.id, label: s.label }))].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                active === id
                  ? 'bg-[#FFB703] text-[#060d1a]'
                  : 'bg-[#0d1b2e] border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Year order toggle */}
        <button
          onClick={() => setNewestFirst(p => !p)}
          className="px-3 py-1.5 text-xs font-medium rounded-full bg-[#0d1b2e] border border-white/10 text-gray-400 hover:text-white transition-colors"
        >
          {newestFirst ? 'Newest → Oldest' : 'Oldest → Newest'}
        </button>
      </div>

      {/* Hint */}
      <p className="text-gray-600 text-xs">Highest value per row highlighted green · lowest red (inverted for cost rows)</p>

      {/* Table */}
      <div className="bg-[#0d1b2e] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            {/* Sticky header row */}
            <thead>
              <tr className="border-b border-white/10">
                <th className="sticky left-0 z-10 bg-[#0d1b2e] text-left px-4 py-3 text-gray-500 font-medium uppercase tracking-wider min-w-44 border-r border-white/10">
                  Metric
                </th>
                {displayYears.map(y => (
                  <th key={y} className="text-right px-3 py-3 text-gray-400 font-semibold whitespace-nowrap min-w-20">
                    {y}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sections.map((section, si) => (
                <>
                  {/* Section header row */}
                  <tr key={section.id} className="bg-white/[0.03] border-y border-white/10">
                    <td
                      colSpan={displayYears.length + 1}
                      className="sticky left-0 px-4 py-2 text-gray-400 font-semibold uppercase tracking-widest text-[10px]"
                    >
                      {section.label}
                    </td>
                  </tr>

                  {/* Data rows */}
                  {section.rows.map((row, ri) => {
                    const allVals = YEARS.map(y => row.get(byYear[y]))
                    return (
                      <tr
                        key={row.label}
                        className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${ri % 2 === 0 ? '' : 'bg-white/[0.015]'}`}
                      >
                        {/* Sticky label */}
                        <td className={`sticky left-0 z-10 px-4 py-2.5 text-gray-300 font-medium border-r border-white/10 whitespace-nowrap ${ri % 2 === 0 ? 'bg-[#0d1b2e]' : 'bg-[#0f1f38]'}`}>
                          {row.label}
                        </td>

                        {/* Values */}
                        {displayYears.map(y => {
                          const val = row.get(byYear[y])
                          const bg  = cellBg(val, allVals, row.inverse)
                          return (
                            <td key={y} className={`text-right px-3 py-2.5 font-mono tabular-nums whitespace-nowrap ${bg || 'text-gray-300'}`}>
                              {val != null ? row.fmt(val) : <span className="text-gray-700">—</span>}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
