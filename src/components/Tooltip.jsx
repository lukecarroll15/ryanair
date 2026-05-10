export default function ChartTooltip({ active, payload, label, fmt }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1e2d45] border border-white/20 rounded-lg px-3 py-2.5 text-xs shadow-2xl">
      <p className="text-gray-400 font-semibold mb-1.5">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.color }} />
          <span className="text-gray-300">{entry.name}:</span>
          <span className="text-white font-semibold">
            {fmt ? fmt(entry.value, entry.name) : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}
