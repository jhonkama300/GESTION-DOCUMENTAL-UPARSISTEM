export default function KpiCard({ icon, label, value, color = 'brand', trend, delta }) {
  const palette = {
    brand: 'from-brand-400 to-brand-700',
    emerald: 'from-emerald-500 to-emerald-700',
    amber: 'from-amber-500 to-amber-600',
    rose: 'from-rose-500 to-rose-600',
    violet: 'from-violet-500 to-violet-700',
    cyan: 'from-cyan-500 to-cyan-700',
  }[color]

  return (
    <div className="card card-hover p-5 relative overflow-hidden">
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${palette} opacity-10`} />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-3xl font-semibold text-slate-800 dark:text-slate-100 mt-2 truncate">
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded ${
                  trend.positive
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                }`}
              >
                <i className={`pi ${trend.positive ? 'pi-arrow-up' : 'pi-arrow-down'} text-[9px]`} />
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${palette} flex items-center justify-center text-white shadow-sm shrink-0`}
        >
          <i className={`pi ${icon} text-xl`} />
        </div>
      </div>
    </div>
  )
}
