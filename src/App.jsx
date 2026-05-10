import { useState } from 'react'
import Overview from './components/Overview'
import Revenue from './components/Revenue'
import Expenses from './components/Expenses'
import Profitability from './components/Profitability'
import BalanceSheet from './components/BalanceSheet'
import CashFlow from './components/CashFlow'
import Operations from './components/Operations'
import Compare from './components/Compare'
import Stock from './components/Stock'
import DataTable from './components/DataTable'
import Insights from './components/Insights'
import Fuel from './components/Fuel'

const TABS = [
  { id: 'overview', label: 'Overview', Component: Overview },
  { id: 'revenue', label: 'Revenue', Component: Revenue },
  { id: 'expenses', label: 'Expenses', Component: Expenses },
  { id: 'profitability', label: 'Profitability', Component: Profitability },
  { id: 'balance', label: 'Balance Sheet', Component: BalanceSheet },
  { id: 'cashflow', label: 'Cash Flow', Component: CashFlow },
  { id: 'operations', label: 'Operations', Component: Operations },
  { id: 'compare', label: 'Compare Years', Component: Compare },
  { id: 'stock', label: 'Stock Price', Component: Stock },
  { id: 'datatable', label: 'Data Table', Component: DataTable },
  { id: 'insights', label: 'Insights', Component: Insights },
  { id: 'fuel', label: 'Fuel & Oil', Component: Fuel },
]

export default function App() {
  const [active, setActive] = useState('overview')
  const { Component } = TABS.find(t => t.id === active)

  return (
    <div className="min-h-screen bg-[#060d1a] text-white font-sans">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#073590] rounded-lg px-2.5 py-1.5">
            <span className="text-[#FFB703] font-black text-sm tracking-tight">RYAN</span>
            <span className="text-white font-black text-sm tracking-tight">AIR</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">Financial Dashboard</h1>
            <p className="text-gray-500 text-xs mt-0.5">FY2012 – FY2025 · EUR millions · Fiscal year ends March 31</p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-white/10 px-6 flex gap-0 overflow-x-auto">
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

      {/* Content */}
      <main className="px-6 py-6 max-w-7xl mx-auto">
        <Component />
      </main>
    </div>
  )
}
