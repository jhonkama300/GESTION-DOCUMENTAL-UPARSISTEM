import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { TabView, TabPanel } from 'primereact/tabview'
import { Avatar } from 'primereact/avatar'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import EmptyState from './EmptyState.jsx'
import { initials, formatDate } from '../utils/format.js'

export default function EmpleadoDrawer({ visible, empleado, onHide }) {
  if (!empleado) return null

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      modal
      showHeader={false}
      style={{ width: 'min(720px, 96vw)' }}
      contentStyle={{ padding: 0 }}
      dismissableMask
    >
      <div className="relative h-28 bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800">
        <button
          onClick={onHide}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur"
        >
          <i className="pi pi-times text-sm" />
        </button>
      </div>

      <div className="px-6 -mt-14">
        <div className="flex items-end gap-4">
          <Avatar
            label={initials(empleado.nombre)}
            shape="circle"
            size="xlarge"
            className="bg-white text-brand-700 ring-4 ring-white dark:ring-slate-800"
            style={{ width: 80, height: 80, fontSize: 28 }}
          />
          <div className="flex-1 pb-1">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
              {empleado.nombre}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {empleado.cargo}
            </p>
          </div>
          <Tag
            value={empleado.estado}
            severity={empleado.estado === 'Activo' ? 'success' : 'danger'}
            rounded
            className="mb-2"
          />
        </div>
      </div>

      <div className="px-6 pt-5">
        <TabView>
          <TabPanel header="Información">
            <div className="grid grid-cols-2 gap-4 py-2">
              <Field label="Cédula" value={empleado.cedula} icon="pi-id-card" />
              <Field label="Fecha de ingreso" value={formatDate(empleado.fechaIngreso)} icon="pi-calendar" />
              <Field label="Cargo" value={empleado.cargo} icon="pi-briefcase" />
              <Field label="Sede" value={empleado.sede} icon="pi-building" />
              <Field label="Estado" value={empleado.estado} icon="pi-check-circle" />
              <Field label="Email" value={`${empleado.nombre.toLowerCase().replace(/ /g, '.')}@gth.com`} icon="pi-envelope" />
              <Field label="Teléfono" value="+57 300 123 4567" icon="pi-phone" />
            </div>
          </TabPanel>

          <TabPanel header={`Contratos (2)`}>
            <DataTable value={[
              { id: 1, tipo: 'Término indefinido', inicio: '2022-03-15', estado: 'Vigente' },
              { id: 2, tipo: 'Adenda salarial', inicio: '2024-01-15', estado: 'Vigente' },
            ]} size="small" className="text-sm">
              <Column field="tipo" header="Tipo" />
              <Column field="inicio" header="Inicio" body={(r) => formatDate(r.inicio)} />
              <Column field="estado" header="Estado" body={(r) => <Tag value={r.estado} severity="success" />} />
            </DataTable>
          </TabPanel>

          <TabPanel header="Documentos">
            <EmptyState
              icon="pi-folder-open"
              title="Sin documentos"
              description="Aún no se han subido documentos al expediente."
              action={<Button label="Subir documento" icon="pi pi-upload" severity="info" size="small" />}
            />
          </TabPanel>

          <TabPanel header="Actividad">
            <ul className="space-y-3 py-2">
              {[
                { a: 'Inicio de sesión', f: '2025-11-12 09:14' },
                { a: 'Firmó certificación', f: '2025-11-10 16:32' },
                { a: 'Actualizó perfil', f: '2025-10-28 11:05' },
                { a: 'Subió documento de identidad', f: '2025-09-15 14:48' },
              ].map((x, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                  <span className="text-slate-700 dark:text-slate-300 flex-1">{x.a}</span>
                  <span className="text-xs text-slate-400">{x.f}</span>
                </li>
              ))}
            </ul>
          </TabPanel>
        </TabView>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-3 flex justify-end gap-2">
        <Button label="Cerrar" outlined onClick={onHide} size="small" />
        <Button label="Editar" icon="pi pi-pencil" severity="info" size="small" />
      </div>
    </Dialog>
  )
}

function Field({ label, value, icon }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
        <i className={`pi ${icon} text-[10px]`} /> {label}
      </p>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{value}</p>
    </div>
  )
}
