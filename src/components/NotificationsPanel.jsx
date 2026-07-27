import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { OverlayPanel } from 'primereact/overlaypanel'
import { Button } from 'primereact/button'

const NOTIFS = [
  { id: 1, type: 'firma', icon: 'pi-pen-to-square', color: 'amber', titulo: 'Documento pendiente de firma', desc: 'Contrato TI de Laura Pérez vence hoy', when: 'hace 5 min', read: false },
  { id: 2, type: 'vencimiento', icon: 'pi-clock', color: 'rose', titulo: 'Certificación por vencer', desc: 'SOAT vehículo #3 vence en 3 días', when: 'hace 2 h', read: false },
  { id: 3, type: 'aprobacion', icon: 'pi-check-circle', color: 'emerald', titulo: 'Solicitud aprobada', desc: 'Vacaciones de Carlos Méndez', when: 'hace 5 h', read: false },
  { id: 4, type: 'asignacion', icon: 'pi-user-plus', color: 'brand', titulo: 'Nueva asignación', desc: 'Andrés L. te asignó revisión SST', when: 'ayer', read: true },
  { id: 5, type: 'sistema', icon: 'pi-cog', color: 'slate', titulo: 'Actualización del sistema', desc: 'GTH v0.2.0 disponible', when: 'hace 2 días', read: true },
]

const COLORS = {
  brand: 'bg-brand-50 text-brand-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  slate: 'bg-slate-100 text-slate-600',
}

const NotificationsPanel = forwardRef(function NotificationsPanel(_, ref) {
  const op = useRef(null)
  const [list, setList] = useState(NOTIFS)
  const unread = list.filter((n) => !n.read).length

  useImperativeHandle(ref, () => ({
    toggle: (e) => op.current?.toggle(e),
  }))

  const markAll = () => setList((arr) => arr.map((n) => ({ ...n, read: true })))
  const mark = (id) =>
    setList((arr) => arr.map((n) => (n.id === id ? { ...n, read: true } : n)))

  return (
    <OverlayPanel ref={op} className="w-96 max-w-[92vw] p-0" showCloseIcon={false} dismissable>
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Notificaciones</p>
          <p className="text-[11px] text-slate-500">{unread} sin leer</p>
        </div>
        <button
          onClick={markAll}
          className="text-[11px] font-semibold hover:underline"
          style={{ color: '#87a837' }}
        >
          Marcar todas
        </button>
      </div>
      <ul className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
        {list.length === 0 ? (
          <li className="p-8 text-center text-sm text-slate-500">Sin notificaciones</li>
        ) : (
          list.map((n) => (
            <li
              key={n.id}
              onClick={() => mark(n.id)}
              className={`p-3 flex items-start gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                !n.read ? 'bg-brand-50/30 dark:bg-brand-900/10' : ''
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${COLORS[n.color]}`}>
                <i className={`pi ${n.icon} text-sm`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                  {n.titulo}
                </p>
                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {n.desc}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">{n.when}</p>
              </div>
              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />
              )}
            </li>
          ))
        )}
      </ul>
      <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <Link
          to="/notificaciones"
          onClick={() => op.current?.hide()}
          className="w-full"
        >
          <Button
            label="Ver todas las notificaciones"
            icon="pi pi-arrow-right"
            iconPos="right"
            className="w-full"
            outlined
            size="small"
          />
        </Link>
      </div>
    </OverlayPanel>
  )
})

export default NotificationsPanel
