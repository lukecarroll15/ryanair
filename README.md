# Ryanair Financial Dashboard

An interactive data visualisation of Ryanair's financial performance across 14 fiscal years (FY2012–FY2025), built with React and Recharts.

**Live site:** _add your deployment URL here_

---

## What it covers

| Tab | Description |
|-----|-------------|
| Overview | Revenue, profit, passengers and EPS at a glance |
| Revenue | Scheduled vs ancillary revenue breakdown and growth |
| Expenses | Operating cost breakdown across 8 categories |
| Profitability | Operating margin, EPS, revenue and cost per passenger |
| Balance Sheet | Cash, debt, equity and net debt over time |
| Cash Flow | Operating, investing and financing cash flows |
| Operations | Passengers, load factor, staff, utilisation and more |
| Compare Years | Side-by-side comparison of any two fiscal years |
| Data Table | Full spreadsheet view of every metric, filterable by category |
| Insights | CAGR analysis, all-time records and biggest year-on-year swings |

---

## Tech stack

- **React 19** — UI
- **Recharts** — charts (line, bar, area, scatter, pie)
- **Tailwind CSS 4** — styling
- **Vite** — build tool

---

## Running locally

```bash
npm install
npm run dev
```

Then open [here](https://ryanair-eosin.vercel.app/).

---

## Data sources

Financial data is sourced from Ryanair's published annual reports and results announcements, available at [investor.ryanair.com](https://investor.ryanair.com/results-centre/).

All figures are in EUR millions unless otherwise stated. Fiscal years end 31 March.

**Note on comparability:** From FY2019 onwards, balance sheet figures reflect IFRS 16 lease accounting (aircraft operating leases capitalised as right-of-use assets and lease liabilities). Pre-FY2019 figures are not directly comparable on those line items.

Stock price data sourced from Yahoo Finance (RYA.IR, Euronext Dublin).

---

## Disclaimer

This project is not affiliated with or endorsed by Ryanair Holdings plc. All data is publicly available and used for educational and portfolio purposes only.

---

