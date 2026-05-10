import { writeFileSync } from 'fs'

const TICKER = 'RYA.IR'
const URL = `https://query2.finance.yahoo.com/v8/finance/chart/${TICKER}?interval=1mo&range=20y`

console.log(`Fetching ${TICKER} from Yahoo Finance...`)

const res = await fetch(URL, {
  headers: { 'User-Agent': 'Mozilla/5.0' },
})

if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

const json = await res.json()
const result = json?.chart?.result?.[0]
if (!result) throw new Error('Unexpected response shape')

const timestamps = result.timestamp
const { open, high, low, close, volume } = result.indicators.quote[0]
const adjClose = result.indicators.adjclose?.[0]?.adjclose

const monthly = timestamps.map((ts, i) => {
  const date = new Date(ts * 1000)
  return {
    date: date.toISOString().slice(0, 7), // YYYY-MM
    open:     open[i]     != null ? +open[i].toFixed(4)     : null,
    high:     high[i]     != null ? +high[i].toFixed(4)     : null,
    low:      low[i]      != null ? +low[i].toFixed(4)      : null,
    close:    close[i]    != null ? +close[i].toFixed(4)    : null,
    adjClose: adjClose?.[i] != null ? +adjClose[i].toFixed(4) : null,
    volume:   volume[i]   ?? null,
  }
}).filter(d => d.close !== null)

const output = {
  ticker: TICKER,
  exchange: 'Euronext Dublin',
  currency: 'EUR',
  interval: 'monthly',
  fetched: new Date().toISOString(),
  data: monthly,
}

writeFileSync('ryanair_stock_prices.json', JSON.stringify(output, null, 2))
console.log(`Saved ${monthly.length} months → ryanair_stock_prices.json`)
console.log(`Range: ${monthly.at(0).date} → ${monthly.at(-1).date}`)
