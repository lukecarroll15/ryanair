import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { operatingData } from '../data'
import ChartCard from './ChartCard'
import ChartTooltip from './Tooltip'

export default function Operations() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Passengers Carried" subtitle="Millions of booked passengers">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={operatingData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}M`} />
              <Tooltip content={<ChartTooltip fmt={v => `${v}M`} />} />
              <Bar dataKey="passengers" name="Passengers" fill="#2563eb" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Passenger Load Factor" subtitle="% of seats filled">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={operatingData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} domain={[60, 100]} />
              <Tooltip content={<ChartTooltip fmt={v => `${v}%`} />} />
              <Line type="monotone" dataKey="loadFactor" name="Load Factor" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3, fill: '#f59e0b' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Staff Headcount" subtitle="Employees at period end">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={operatingData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip fmt={v => `${v.toLocaleString()}`} />} />
              <Bar dataKey="staff" name="Staff" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Daily Flight Hour Utilisation" subtitle="Average hours per aircraft per day">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={operatingData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}h`} domain={[0, 12]} />
              <Tooltip content={<ChartTooltip fmt={v => `${v}h`} />} />
              <Line type="monotone" dataKey="utilization" name="Utilisation" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard title="Airports Served" subtitle="Number of destinations">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={operatingData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip fmt={v => `${v} airports`} />} />
              <Line type="monotone" dataKey="airports" name="Airports" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3, fill: '#06b6d4' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Avg Fuel Cost" subtitle="EUR per US gallon">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={operatingData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="year" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `€${v}`} />
              <Tooltip content={<ChartTooltip fmt={v => `€${v}/gal`} />} />
              <Line type="monotone" dataKey="fuelCost" name="Fuel Cost" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3, fill: '#f97316' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
