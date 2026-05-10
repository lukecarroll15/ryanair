import { useState, useEffect } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts'
import { incomeData, balanceData, fmtM } from '../data'
import ChartCard from './ChartCard'
import ChartTooltip from './Tooltip'
import Correlation from './Correlation'

// RYA.IR = Ryanair on Euronext Dublin, priced in EUR
// Request goes through the Vite proxy → no CORS
const TICKER = 'RYA.IR'
const API = `/yahoo/v8/finance/chart/${TICKER}?interval=1mo&range=15y`

function usePriceData() {
  const [monthly, setMonthly] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(API)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(json => {
        const result = json?.chart?.result?.[0]
        if (!result) throw new Error('No data returned')
        const timestamps = result.timestamp
        const closes = result.indicators.quote[0].close
        const parsed = timestamps
          .map((ts, i) => ({
            ts,
            date: new Date(ts * 1000),
            label: new Date(ts * 1000).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
            price: closes[i] != null ? +closes[i].toFixed(2) : null,
          }))
          .filter(d => d.price !== null)
        setMonthly(parsed)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { monthly, error, loading }
}

// Find the March closing price for a given fiscal year (e.g. FY2025 = March 2025)
function marchPrice(monthly, fyLabel) {
  const fyYear = parseInt(fyLabel.replace('FY', ''))
  return monthly?.find(p => p.date.getFullYear() === fyYear && p.date.getMonth() === 2) ?? null
}

function buildAnnualData(monthly) {
  return incomeData.map((d, i) => {
    const mp = marchPrice(monthly, d.year)
    const sharesM = balanceData[i].sharesMillions
    const price = mp?.price ?? null
    const pe = price != null && d.eps > 0 ? +(price / d.eps).toFixed(1) : null
    // Market cap: price (EUR) × shares (millions) → EUR billions
    const mcap = price != null && sharesM != null ? +(price * sharesM / 1000).toFixed(2) : null
    return { year: d.year, price, eps: d.eps, pe, mcap, sharesM }
  })
}

const fmtPrice = v => v == null ? '—' : `€${v.toFixed(2)}`
const fmtPE = v => v == null ? '—' : `${v.toFixed(1)}x`
const fmtBn = v => v == null ? '—' : `€${v.toFixed(1)}B`

export default function Stock() {
  const { monthly, error, loading } = usePriceData()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center space-y-2">
          <div className="w-6 h-6 border-2 border-[#FFB703] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm">Fetching {TICKER} price history…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-[#0d1b2e] border border-red-500/30 rounded-xl p-8 text-center max-w-md">
          <p className="text-red-400 font-semibold mb-2">Could not load price data</p>
          <p className="text-gray-400 text-sm mb-3">{error}</p>
          <p className="text-gray-500 text-xs">Yahoo Finance blocked the request (CORS). Try opening the app via a local server, or check your network.</p>
        </div>
      </div>
    )
  }

  const annual = buildAnnualData(monthly)
  const latestPrice = monthly?.at(-1)

  return (
    <div className="space-y-6">
      {/* Header strip */}
      <div className="bg-[#0d1b2e] border border-white/10 rounded-xl p-5 flex flex-wrap gap-6 items-center">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Ryanair Holdings · {TICKER}</p>
          <p className="text-3xl font-bold text-white">{fmtPrice(latestPrice?.price)}</p>
          <p className="text-gray-500 text-xs mt-1">Last close · Euronext Dublin · EUR</p>
        </div>
        {latestPrice && (
          <div className="text-gray-500 text-xs ml-auto">
            Data via Yahoo Finance · {latestPrice.date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        )}
      </div>

      {/* Monthly price chart */}
      <ChartCard title="Share Price History" subtitle={`${TICKER} monthly closing price · EUR`}>
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
