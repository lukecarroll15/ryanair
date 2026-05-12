import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { incomeData, balanceData, fmtM } from '../data'
import ChartCard from './ChartCard'
import ChartTooltip from './Tooltip'
import Correlation from './Correlation'
import stockRaw from '../../ryanair_stock_prices.json'

function parseMonthly() {
  return stockRaw.data
    .map(d => {
      const [year, month] = d.date.split('-').map(Number)
      const date = new Date(year, month - 1, 1)
      return {
        date,
        label: date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
        price: d.close != null ? +d.close.toFixed(2) : null,
      }
    })
    .filter(d => d.price !== null)
}

const monthly = parseMonthly()

// Find the March closing price for a given fiscal year (e.g. FY2025 = March 2025)
function marchPrice(fyLabel) {
  const fyYear = parseInt(fyLabel.replace('FY', ''))
  return monthly.find(p => p.date.getFullYear() === fyYear && p.date.getMonth() === 2) ?? null
}

function buildAnnualData() {
  return incomeData.map((d, i) => {
    const mp = marchPrice(d.year)
    const sharesM = balanceData[i].sharesMillions
    const price = mp?.price ?? null
    const pe = price != null && d.eps > 0 ? +(price / d.eps).toFixed(1) : null
    const mcap = price != null && sharesM != null ? +(price * sharesM / 1000).toFixed(2) : null
    return { year: d.year, price, eps: d.eps, pe, mcap, sharesM }
  })
}

const annual = buildAnnualData()

const fmtPrice = v => v == null ? '—' : `€${v.toFixed(2)}`
const fmtPE = v => v == null ? '—' : `${v.toFixed(1)}x`
const fmtBn = v => v == null ? '—' : `€${v.toFixed(1)}B`

const fetchedDate = new Date(stockRaw.fetched).toLocaleDateString('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric',
})

export default function Stock() {
  const latestPrice = monthly.at(-1)

  return (
    <div className="space-y-6">
      {/* Header strip */}
      <div className="bg-[#0d1b2e] border border-white/10 rounded-xl p-5 flex flex-wrap gap-6 items-center">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Ryanair Holdings · {stockRaw.ticker}</p>
          <p className="text-3xl font-bold text-white">{fmtPrice(latestPrice?.price)}</p>
          <p className="text-gray-500 text-xs mt-1">Last close · Euronext Dublin · EUR</p>
        </div>
        <div className="text-gray-500 text-xs ml-auto text-right">
          <p>Data via Yahoo Finance · {stockRaw.ticker}</p>
          <p className="mt-0.5">Snapshot as of {fetchedDate}</p>
        </div>
      </div>

      {/* Monthly price chart */}
      <ChartCard title="Share Price History" subtitle={`${stockRaw.ticker} monthly closing price · EUR`}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthly} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="label"
              tick={{ fill: '#9ca3af', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={11}
            />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `€${v}`} />
            <Tooltip content={<ChartTooltip fmt={v => fmtPrice(v)} />} />
            <Line type="monotone" dataKey="price" name="Price" stroke="#FFB703" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* P/E ratio */}
        <ChartCard title="Price / Earnings Ratio" subtitle="Share price ÷ basic EPS at fiscal year end (March 31)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={annual.filter(d => d.pe != null)} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}x`} />
              <Tooltip content={<ChartTooltip fmt={v => fmtPE(v)} />} />
              <Bar dataKey="pe" name="P/E" radius={[3, 3, 0, 0]}>
                {annual.filter(d => d.pe != null).map((d, i) => (
                  <Cell key={i} fill={d.pe < 15 ? '#10b981' : d.pe < 25 ? '#f59e0b' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Market cap */}
        <ChartCard title="Market Capitalisation" subtitle="Share price × weighted avg shares at FY end · EUR billions">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={annual.filter(d => d.mcap != null)} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `€${v}B`} />
              <Tooltip content={<ChartTooltip fmt={v => fmtBn(v)} />} />
              <Bar dataKey="mcap" name="Market Cap" fill="#3b82f6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Annual price table */}
      <div className="bg-[#0d1b2e] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10 bg-white/[0.02]">
          <h3 className="text-white text-sm font-semibold">Annual Snapshot at Fiscal Year End</h3>
        </div>
        <div className="grid grid-cols-4 px-5 py-2 border-b border-white/5 text-xs text-gray-500 font-medium uppercase tracking-wider">
          <span>Year</span>
          <span className="text-right">Share Price</span>
          <span className="text-right">P/E Ratio</span>
          <span className="text-right">Market Cap</span>
        </div>
        {annual.map((d, i) => (
          <div key={d.year} className={`grid grid-cols-4 px-5 py-2.5 text-sm items-center ${i % 2 === 0 ? '' : 'bg-white/[0.02]'} hover:bg-white/[0.04] transition-colors`}>
            <span className="text-gray-300 font-medium">{d.year}</span>
            <span className="text-right text-white font-mono text-xs">{fmtPrice(d.price)}</span>
            <span className="text-right font-mono text-xs">
              {d.pe != null
                ? <span className={d.pe < 15 ? 'text-emerald-400' : d.pe < 25 ? 'text-yellow-400' : 'text-red-400'}>{fmtPE(d.pe)}</span>
                : <span className="text-gray-600">—</span>}
            </span>
            <span className="text-right text-gray-300 font-mono text-xs">{fmtBn(d.mcap)}</span>
          </div>
        ))}
      </div>

      {/* Correlation analysis */}
      <Correlation prices={Object.fromEntries(annual.filter(d => d.price != null).map(d => [d.year, d.price]))} />
    </div>
  )
}
