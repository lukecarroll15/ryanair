import { useState } from 'react'
import Overview from './components/Overview'
import Revenue from './components/Revenue'
import Expenses from './components/Expenses'
import Profitability from './components/Profitability'
import BalanceSheet from './components/BalanceSheet'
import CashFlow from './components/CashFlow'
import Operations from './components/Operations'
import Compare from './components/Compare'
import DataTable from './components/DataTable'
import Insights from './components/Insights'
import ErrorBoundary from './components/ErrorBoundary'
import { incomeData } from './data'

const TABS = [
  { id: 'overview', label: 'Overview', Component: Overview },
  { id: 'revenue', label: 'Revenue', Component: Revenue },
  { id: 'expenses', label: 'Expenses', Component: Expenses },
  { id: 'profitability', label: 'Profitability', Component: Profitability },
  { id: 'balance', label: 'Balance Sheet', Component: BalanceSheet },
  { id: 'cashflow', label: 'Cash Flow', Component: CashFlow },
  { id: 'operations', label: 'Operations', Component: Operations },
  { id: 'compare', label: 'Compare Years', Component: Compare },
  { id: 'datatable', label: 'Data Table', Component: DataTable },
  { id: 'insights', label: 'Insights', Component: Insights },
]

const firstYear = incomeData[0].year
const lastYear = incomeData.at(-1).year

export default function App() {
  const [active, setActive] = useState('overview')
  const { Component } = TABS.find(t => t.id === active)

  return (
    <div className="min-h-screen bg-[#060d1a] text-white font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#073590] rounded-lg px-2.5 py-1.5">
            <span className="text-[#FFB703] font-black text-sm tracking-tight">RYAN</span>
            <span className="text-white font-black text-sm tracking-tight">AIR</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">Financial Dashboard</h1>
            <p className="text-gray-500 text-xs mt-0.5">{firstYear} – {lastYear} · EUR millions · Fiscal year ends March 31</p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="relative border-b border-white/10">
        {/* Right scroll fade */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#060d1a] to-transparent z-10" />
        <nav
          className="px-6 flex gap-0 overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                active === id
                  ? 'text-[#FFB703] border-[#FFB703]'
                  : 'text-gray-400 border-transparent hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <main className="px-6 py-6 max-w-7xl mx-auto w-full flex-1">
        <ErrorBoundary key={active}>
          <Component />
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-5 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-2 sm:gap-6 items-start sm:items-center justify-between">
          <div className="text-gray-600 text-xs space-y-1">
            <p>Data sourced from <a href="https://investor.ryanair.com/results-centre/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-300 underline transition-colors">Ryanair Annual Reports</a> · {firstYear}–{lastYear}</p>
            <p>Not affiliated with or endorsed by Ryanair Holdings plc</p>
          </div>
          <div className="text-gray-600 text-xs text-right">
          </div>
        </div>
      </footer>
    </div>
  )
}
