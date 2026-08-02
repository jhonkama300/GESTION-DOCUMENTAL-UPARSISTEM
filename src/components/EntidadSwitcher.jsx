import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { OverlayPanel } from 'primereact/overlaypanel'
import { Button } from 'primereact/button'
import { useEntidad } from '../context/EntidadContext.jsx'
import { entidadesService } from '../services/entidades.service.js'

const EntidadSwitcher = forwardRef(function EntidadSwitcher(_, ref) {
  const op = useRef(null)
  const { currentEntidad, selectEntidad } = useEntidad()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [entidades, setEntidades] = useState([])

  useEffect(() => {
    entidadesService.list({ todos: true }).then(setEntidades)
  }, [])

  useImperativeHandle(ref, () => ({
    toggle: (e) => op.current?.toggle(e),
  }))

  const filtered = entidades.filter(
    (e) => e.nombre.toLowerCase().includes(search.toLowerCase()),
  )

  const choose = (e) => {
    selectEntidad(e)
    op.current?.hide()
    setSearch('')
  }

  return (
    <OverlayPanel ref={op} className="w-80 max-w-[92vw] p-0" showCloseIcon={false} dismissable>
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Cambiar entidad</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {entidades.length} entidad{entidades.length !== 1 ? 'es' : ''} disponible{entidades.length !== 1 ? 's' : ''}
        </p>
      </div>
      {entidades.length > 1 && (
        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar entidad..."
            className="w-full text-sm px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-brand-500"
          />
        </div>
      )}
      <ul className="max-h-72 overflow-y-auto p-2">
        {filtered.length === 0 ? (
          <li className="p-4 text-center text-sm text-slate-500">Sin resultados</li>
        ) : (
          filtered.map((e) => {
            const active = currentEntidad?.id === e.id
            return (
              <li key={e.id}>
                <button
                  onClick={() => choose(e)}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                    active ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden"
                    style={e.logo_url ? { background: '#fff' } : { background: e.color }}
                  >
                    {e.logo_url ? (
                      <img src={e.logo_url} alt={e.nombre} className="w-full h-full object-contain p-0.5" />
                    ) : (
                      e.iniciales
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {e.nombre}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {e.descripcion || 'Entidad registrada'}
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
          label="Gestionar entidades"
          icon="pi pi-building"
          outlined
          size="small"
          className="w-full"
          onClick={() => { op.current?.hide(); navigate('/entidades') }}
        />
      </div>
    </OverlayPanel>
  )
})

export default EntidadSwitcher
