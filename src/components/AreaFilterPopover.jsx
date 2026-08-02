import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { InputText } from 'primereact/inputtext'

export default function AreaFilterPopover({
  options,
  value,
  totalCount,
  onSelect,
  onClose,
  anchorRef,
}) {
  const [search, setSearch] = useState('')
  const popoverRef = useRef(null)

  const filtered = options.filter((o) =>
    o.area.toLowerCase().includes(search.toLowerCase()),
  )

  useEffect(() => {
    const handler = (e) => {
      if (
        !e.target.closest('.area-popover-btn') &&
        !e.target.closest('.area-popover-panel')
      ) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const getPos = () => {
    if (!anchorRef?.current) return { top: 0, right: 16 }
    const rect = anchorRef.current.getBoundingClientRect()
    return {
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    }
  }

  const pos = getPos()
  const maxCount = Math.max(...options.map((o) => o.count), 1)

  return createPortal(
    <div
      ref={popoverRef}
      style={{ position: 'fixed', top: pos.top, right: pos.right }}
      className="area-popover-panel w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-900/10 dark:shadow-black/40 z-[9999] overflow-hidden"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative bg-gradient-to-br from-emerald-600 to-teal-600 px-4 py-3.5">
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" viewBox="0 0 320 60" preserveAspectRatio="none">
            <path d="M0 60 Q80 0 160 30 Q240 60 320 20 L320 0 L0 0 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
              <i className="pi pi-sitemap text-white text-[11px]" />
            </div>
            <div>
              <p className="text-white text-xs font-bold leading-tight">Filtrar por área</p>
              <p className="text-white/60 text-[10px]">{options.length} áreas disponibles</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white text-lg font-bold leading-tight">{totalCount}</p>
            <p className="text-white/50 text-[10px]">empleados</p>
          </div>
        </div>
        <div className="relative mt-2.5">
          <i className="pi pi-search absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40 text-[11px]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar área..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/15 border border-white/20 text-white text-xs placeholder:text-white/40 focus:outline-none focus:bg-white/25 focus:border-white/40 transition-all"
            autoFocus
          />
        </div>
      </div>

      <div className="max-h-56 overflow-y-auto">
        <button
          type="button"
          onClick={() => { onSelect(null); onClose() }}
          className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-colors border-b border-slate-100 dark:border-slate-800 ${
            !value
              ? 'bg-emerald-50 dark:bg-emerald-900/20'
              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
            <i className="pi pi-sitemap text-slate-400 text-[10px]" />
          </div>
          <span className={`flex-1 text-left font-semibold ${!value ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'}`}>
            Todas las áreas
          </span>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            {totalCount}
          </span>
        </button>

        {filtered.length === 0 && (
          <div className="py-8 text-center">
            <i className="pi pi-search text-slate-300 dark:text-slate-600 text-xl mb-1" />
            <p className="text-xs text-slate-400">Sin resultados</p>
          </div>
        )}

        {filtered.map(({ area, count }) => {
          const active = value === area
          const pct = Math.round((count / maxCount) * 100)
          return (
            <button
              key={area}
              type="button"
              onClick={() => { onSelect(active ? null : area); onClose() }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-colors border-b border-slate-50 dark:border-slate-800/50 ${
                active
                  ? 'bg-emerald-50 dark:bg-emerald-900/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                active
                  ? 'bg-emerald-100 dark:bg-emerald-900/40'
                  : 'bg-slate-100 dark:bg-slate-800'
              }`}>
                <i className={`pi ${active ? 'pi-check' : 'pi-building'} text-[10px] ${
                  active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                }`} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className={`text-xs font-semibold truncate leading-tight ${active ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'}`}>
                  {area}
                </p>
                <div className="mt-1 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className={`text-xs font-bold ${active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                  {count}
                </span>
                <p className="text-[9px] text-slate-400 dark:text-slate-500">{pct}%</p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <p className="text-[10px] text-slate-400">
          {filtered.length} de {options.length} áreas
        </p>
        {value && (
          <button
            onClick={() => { onSelect(null); onClose() }}
            className="text-[10px] text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 transition-colors"
          >
            <i className="pi pi-times text-[9px]" />
            Limpiar filtro
          </button>
        )}
      </div>
    </div>,
    document.body,
  )
}
