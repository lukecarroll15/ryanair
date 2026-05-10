import { writeFileSync } from 'fs'

// BZ=F = Brent Crude Continuous Futures on Yahoo Finance
const TICKER = 'BZ=F'
const URL = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(TICKER)}?interval=1mo&range=20y`

console.log('Fetching Brent Crude (BZ=F) monthly prices...')

const res = await fetch(URL, { headers: { 'User-Agent': 'Mozilla/5.0' } })
if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

const json = await res.json()
const result = json?.chart?.result?.[0]
if (!result) throw new Error('Unexpected response shape')

const timestamps = result.timestamp
const { open, high, low, close } = result.indicators.quote[0]

const monthly = timestamps.map((ts, i) => ({
  date: new Date(ts * 1000).toISOString().slice(0, 7),
  open:  open[i]  != null ? +open[i].toFixed(2)  : null,
  high:  high[i]  != null ? +high[i].toFixed(2)  : null,
  low:   low[i]   != null ? +low[i].toFixed(2)   : null,
  close: close[i] != null ? +close[i].toFixed(2) : null,
})).filter(d => d.close !== null)

// Derive Ryanair fiscal year averages (April → March)
// e.g. FY2025 = Apr 2024 → Mar 2025
const fyAvgs = []
for (let yr = 2012; yr <= 2025; yr++) {
  const months = []
  for (let m = 0; m < 12; m++) {
    const d = new Date(yr - 1, 3 + m) // Apr of prev year
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const row = monthly.find(r => r.date === key)
    if (row?.close) months.push(row.close)
  }
  if (months.length > 0) {
    fyAvgs.push({
      fy: `FY${yr}`,
      avgClose: +(months.reduce((a, b) => a + b, 0) / months.length).toFixed(2),
      months: months.length,
    })
  }
}

const output = {
  ticker: TICKER,
  name: 'Brent Crude Oil Futures',
  currency: 'USD',
  unit: 'per barrel',
  interval: 'monthly',
  fetched: new Date().toISOString(),
  monthly,
  fiscalYearAvg: fyAvgs,
}

writeFileSync('ryanair_oil_prices.json', JSON.stringify(output, null, 2))
console.log(`Saved ${monthly.length} months → ryanair_oil_prices.json`)
console.log(`Range: ${monthly.at(0).date} → ${monthly.at(-1).date}`)
console.log(`Fiscal year averages computed: ${fyAvgs.map(f => `${f.fy}=$${f.avgClose}`).join('  ')}`)
