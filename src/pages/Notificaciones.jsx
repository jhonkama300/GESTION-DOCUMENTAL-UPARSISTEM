import { useState } from 'react'
import { Button } from 'primereact/button'
import { TabView, TabPanel } from 'primereact/tabview'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'

const ALL = [
  { id: 1, cat: 'firma', icon: 'pi-pen-to-square', color: 'amber', titulo: 'Documento pendiente de firma', desc: 'Contrato TI de Laura Pérez vence hoy', when: 'hace 5 min', read: false },
  { id: 2, cat: 'vencimiento', icon: 'pi-clock', color: 'rose', titulo: 'Certificación por vencer', desc: 'SOAT vehículo #3 vence en 3 días', when: 'hace 2 h', read: false },
  { id: 3, cat: 'aprobacion', icon: 'pi-check-circle', color: 'emerald', titulo: 'Solicitud aprobada', desc: 'Vacaciones de Carlos Méndez', when: 'hace 5 h', read: false },
  { id: 4, cat: 'asignacion', icon: 'pi-user-plus', color: 'brand', titulo: 'Nueva asignación', desc: 'Andrés L. te asignó revisión SST', when: 'ayer', read: false },
  { id: 5, cat: 'sistema', icon: 'pi-cog', color: 'slate', titulo: 'Actualización del sistema', desc: 'GTH v0.2.0 disponible', when: 'hace 2 días', read: true },
  { id: 6, cat: 'firma', icon: 'pi-pen-to-square', color: 'amber', titulo: 'Firma completada', desc: 'Certificación firmada por Diego R.', when: 'hace 3 días', read: true },
  { id: 7, cat: 'vencimiento', icon: 'pi-clock', color: 'rose', titulo: 'Examen médico próximo', desc: 'Vence examen periódico en 7 días', when: 'hace 4 días', read: true },
  { id: 8, cat: 'sistema', icon: 'pi-shield', color: 'slate', titulo: 'Inicio de sesión detectado', desc: 'Nueva ubicación: Bogotá, Colombia', when: 'hace 5 días', read: true },
]

const COLORS = {
  brand: 'bg-brand-50 text-brand-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
  slate: 'bg-slate-100 text-slate-600',
}

export default function Notificaciones() {
  const [list, setList] = useState(ALL)
  const unread = list.filter((n) => !n.read).length
  const mark = (id) => setList((arr) => arr.map((n) => (n.id === id ? { ...n, read: true } : n)))
  const markAll = () => setList((arr) => arr.map((n) => ({ ...n, read: true })))

  const renderList = (items, emptyTitle) => {
    if (items.length === 0) {
      return <EmptyState icon="pi-bell" title={emptyTitle} description="Cuando haya novedades las verás aquí." />
    }
    return (
      <div className="space-y-2">
        {items.map((n) => (
          <div
            key={n.id}
            onClick={() => mark(n.id)}
            className={`card p-4 flex items-start gap-3 cursor-pointer hover:shadow-md transition-all ${
              !n.read ? 'border-l-4 border-l-brand-500' : ''
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${COLORS[n.color]}`}>
              <i className={`pi ${n.icon} text-base`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {n.titulo}
                </p>
                {!n.read && <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0 mt-1.5" />}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.desc}</p>
              <p className="text-[10px] text-slate-400 mt-1.5">{n.when}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        icon="pi-bell"
        title="Notificaciones"
        subtitle={`${unread} sin leer de ${list.length} totales`}
        actions={
          <div className="flex gap-2">
            <Button label="Marcar todas" icon="pi pi-check" outlined onClick={markAll} size="small" />
            <Button label="Configurar" icon="pi pi-cog" severity="info" size="small" />
          </div>
        }
      />

      <TabView>
        <TabPanel header={`Todas (${list.length})`}>
          {renderList(list, 'Sin notificaciones')}
        </TabPanel>
        <TabPanel header={`Sin leer (${unread})`}>
          {renderList(list.filter((n) => !n.read), 'Sin notificaciones sin leer')}
        </TabPanel>
        <TabPanel header="Firmas">
          {renderList(list.filter((n) => n.cat === 'firma'), 'Sin notificaciones de firma')}
        </TabPanel>
        <TabPanel header="Vencimientos">
          {renderList(list.filter((n) => n.cat === 'vencimiento'), 'Sin vencimientos próximos')}
        </TabPanel>
      </TabView>
    </div>
  )
}
