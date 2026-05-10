export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <div className={`bg-[#0d1b2e] border border-white/10 rounded-xl p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        {subtitle && <p className="text-gray-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
