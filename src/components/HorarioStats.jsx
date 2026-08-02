export default function HorarioStats({ stats }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {['Normales', 'Extras', 'Total', 'vs Objetivo'].map((l) => (
          <div key={l} className="card p-3 opacity-50">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">{l}</p>
            <p className="text-xl font-bold text-slate-700 mt-0.5">—</p>
          </div>
        ))}
      </div>
    )
  }

  const { total_normales, total_extras, total, horas_objetivo, diferencia } = stats

  const diffColor =
    Math.abs(diferencia) <= 2
      ? 'text-emerald-600'
      : Math.abs(diferencia) <= 5
      ? 'text-amber-600'
      : 'text-rose-600'

  const diffBg =
    Math.abs(diferencia) <= 2
      ? 'bg-emerald-50 dark:bg-emerald-950/30'
      : Math.abs(diferencia) <= 5
      ? 'bg-amber-50 dark:bg-amber-950/30'
      : 'bg-rose-50 dark:bg-rose-950/30'

  const diffSign = diferencia > 0 ? '+' : ''
  const diffLabel =
    diferencia === 0 ? 'En punto' : diferencia > 0 ? `${diffSign}${diferencia}h sobre` : `${diffSign}${Math.abs(diferencia)}h bajo`

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="card p-3">
        <p className="text-[10px] uppercase tracking-wider text-slate-400">Horas normales</p>
        <p className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">{total_normales}h</p>
      </div>
      <div className="card p-3">
        <p className="text-[10px] uppercase tracking-wider text-slate-400">Horas extra</p>
        <p className="text-xl font-bold text-amber-600 mt-0.5">{total_extras}h</p>
      </div>
      <div className="card p-3">
        <p className="text-[10px] uppercase tracking-wider text-slate-400">Total</p>
        <p className="text-xl font-bold text-brand-600 mt-0.5">{total}h</p>
      </div>
      <div className={`card p-3 ${diffBg}`}>
        <p className="text-[10px] uppercase tracking-wider text-slate-400">vs Objetivo ({horas_objetivo}h)</p>
        <p className={`text-xl font-bold mt-0.5 ${diffColor}`}>{diffLabel}</p>
      </div>
    </div>
  )
}
