import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OverlayPanel } from 'primereact/overlaypanel'
import { Button } from 'primereact/button'
import { useSede } from '../context/SedeContext.jsx'

const SedeSwitcher = forwardRef(function SedeSwitcher(_, ref) {
  const op = useRef(null)
  const { currentSede, availableSedes, selectSede } = useSede()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  useImperativeHandle(ref, () => ({
    toggle: (e) => op.current?.toggle(e),
  }))

  const filtered = availableSedes.filter(
    (s) => s.nombre.toLowerCase().includes(search.toLowerCase()),
  )

  const choose = (s) => {
    selectSede(s)
    op.current?.hide()
    setSearch('')
  }

  return (
    <OverlayPanel ref={op} className="w-80 max-w-[92vw] p-0" showCloseIcon={false} dismissable>
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Cambiar sede</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {availableSedes.length} sede{availableSedes.length !== 1 ? 's' : ''} disponible{availableSedes.length !== 1 ? 's' : ''}
        </p>
      </div>
      {availableSedes.length > 3 && (
        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar sede..."
            className="w-full text-sm px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
          />
        </div>
      )}
      <ul className="max-h-72 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <li className="p-4 text-center text-sm text-slate-500">Sin resultados</li>
        ) : (
          filtered.map((s) => {
            const active = currentSede?.id === s.id
            return (
              <li key={s.id}>
                <button
                  onClick={() => choose(s)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                    active ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                    style={{ background: s.color }}
                  >
                    {s.iniciales}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {s.nombre}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {s.descripcion || 'Sede registrada'}
                    </p>
                  </div>
                  {active && <i className="pi pi-check-circle text-brand-600" />}
                </button>
              </li>
            )
          })
        )}
      </ul>
      <div className="p-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <Button
          label="Gestionar sedes"
          icon="pi pi-building"
          outlined
          size="small"
          className="w-full"
          onClick={() => { op.current?.hide(); navigate('/sedes') }}
        />
      </div>
    </OverlayPanel>
  )
})

export default SedeSwitcher
