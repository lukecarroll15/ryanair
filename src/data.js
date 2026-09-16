import rawData from '../ryanair_financial_data.json'

const FY_KEYS = rawData.metadata.years_covered
const lbl = fy => 'FY' + fy.slice(2)

export const incomeData = FY_KEYS.map(fy => {
  const d = rawData.income_statement[fy]
  const exp = d.operating_expenses
  return {
    year: lbl(fy),
    scheduledRevenue: d.scheduled_revenues,
    ancillaryRevenue: d.ancillary_revenues,
    totalRevenue: d.total_operating_revenues,
    totalExpenses: exp.total_operating_expenses,
    operatingProfit: d.operating_profit,
    netProfit: d.profit_for_period,
    eps: d.basic_eps_euros,
    fuel: exp.fuel_and_oil,
    staff: exp.staff_costs,
    airport: exp.airport_and_handling_charges,
    routeCharges: exp.route_charges,
    depreciation: exp.depreciation,
    marketing: exp.marketing_distribution_other,
    maintenance: exp.maintenance_materials_repairs,
    rentals: exp.aircraft_rentals,
  }
})

export const balanceData = FY_KEYS.map(fy => {
  const d = rawData.balance_sheet[fy]
  return {
    year: lbl(fy),
    cash: d.cash_and_equivalents,
    totalAssets: d.total_assets,
    debt: d.long_term_debt_incl_lease_obligations,
    equity: d.shareholders_equity,
    netDebt: d.long_term_debt_incl_lease_obligations - d.cash_and_equivalents,
    sharesMillions: d.weighted_avg_ordinary_shares_millions,
  }
})

export const cashFlowData = FY_KEYS.map(fy => {
  const d = rawData.cash_flow[fy]
  return {
    year: lbl(fy),
    operating: d.net_cash_from_operating,
    investing: d.net_cash_from_investing,
    financing: d.net_cash_from_financing,
  }
})

export const operatingData = FY_KEYS.map(fy => {
  const d = rawData.operating_data[fy]
  return {
    year: lbl(fy),
    operatingMargin: d.operating_margin_pct,
    loadFactor: d.booked_passenger_load_factor_pct,
    passengers: d.revenue_passengers_booked_millions,
    avgFare: d.average_booked_passenger_fare_eur,
    ancillaryPerPax: d.ancillary_revenue_per_booked_passenger_eur,
    costPerPax: d.cost_per_booked_passenger_eur,
    staff: d.staff_at_period_end,
    airports: d.number_of_airports_served,
    utilization: d.average_daily_flight_hour_utilization_hours,
    fuelCost: d.average_fuel_cost_per_us_gallon_eur,
  }
})

export const latest = {
  income: incomeData.at(-1),
  prev: incomeData.at(-2),
  ops: operatingData.at(-1),
  prevOps: operatingData.at(-2),
  balance: balanceData.at(-1),
}

export const firstYear = incomeData[0].year
export const latestYear = incomeData.at(-1).year
export const prevYear = incomeData.at(-2).year

// Formatters
export const fmtM = n => {
  if (n == null) return 'N/A'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1000) return `${sign}€${(abs / 1000).toFixed(1)}B`
  return `${sign}€${abs.toFixed(0)}M`
}
export const fmtPct = n => (n == null ? 'N/A' : `${n > 0 ? '+' : ''}${n.toFixed(1)}%`)
export const fmtEur = n => (n == null ? 'N/A' : `€${n.toFixed(2)}`)
export const pctChange = (curr, prev) => ((curr / prev - 1) * 100)
