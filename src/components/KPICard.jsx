export default function KPICard({ label, value, change, sub }) {
  const up = change >= 0
  return (
    <div className="bg-[#0d1b2e] border border-white/10 rounded-xl p-5">
      <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mb-2">{label}</p>
      <p className="text-3xl font-bold text-white leading-none">{value}</p>
      {change !== undefined && (
        <p className={`text-sm mt-2 font-medium ${up ? 'text-emerald-400' : 'text-red-400'}`}>
          {up ? '▲' : '▼'} {Math.abs(change).toFixed(1)}% vs FY2024
        </p>
      )}
      {sub && <p className="text-gray-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}
