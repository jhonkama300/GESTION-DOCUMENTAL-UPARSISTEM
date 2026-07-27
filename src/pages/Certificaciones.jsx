import { useState } from 'react'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { InputText } from 'primereact/inputtext'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import PageHeader from '../components/PageHeader.jsx'
import { formatDate } from '../utils/format.js'

const MOCK = [
  { id: 1, empleado: 'Laura Pérez', tipo: 'Laboral', descripcion: 'Carta de certificación laboral', fecha: '2025-11-10', estado: 'Firmada' },
  { id: 2, empleado: 'Carlos Méndez', tipo: 'Académica', descripcion: 'Certificación de estudios', fecha: '2025-11-08', estado: 'Pendiente' },
  { id: 3, empleado: 'Diego Ramírez', tipo: 'SOAT', descripcion: 'SOAT vehículo corporativo #3', fecha: '2025-12-01', estado: 'Vigente' },
  { id: 4, empleado: 'Andrés López', tipo: 'SST', descripcion: 'Curso de seguridad y salud', fecha: '2025-10-25', estado: 'Vencida' },
]

export default function Certificaciones() {
  const [filter, setFilter] = useState('')
  const filtered = MOCK.filter((c) =>
    [c.empleado, c.tipo, c.descripcion].some((v) => v.toLowerCase().includes(filter.toLowerCase())),
  )

  return (
    <div>
      <PageHeader
        icon="pi-verified"
        title="Certificaciones"
        subtitle="Certificaciones laborales, académicas y documentales"
        actions={
          <div className="flex gap-2">
            <Button label="Importar" icon="pi pi-upload" outlined size="small" />
            <Button label="Nueva certificación" icon="pi pi-plus" severity="info" size="small" />
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Vigentes', value: MOCK.filter((c) => c.estado === 'Vigente').length, color: 'emerald', icon: 'pi-check' },
          { label: 'Pendientes', value: MOCK.filter((c) => c.estado === 'Pendiente').length, color: 'amber', icon: 'pi-clock' },
          { label: 'Firmadas', value: MOCK.filter((c) => c.estado === 'Firmada').length, color: 'brand', icon: 'pi-pen-to-square' },
          { label: 'Vencidas', value: MOCK.filter((c) => c.estado === 'Vencida').length, color: 'rose', icon: 'pi-times' },
        ].map((s) => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${s.color}-50 text-${s.color}-600 dark:bg-${s.color}-900/30 dark:text-${s.color}-300`}>
              <i className={`pi ${s.icon}`} />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className="text-xl font-semibold text-slate-800 dark:text-slate-100">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <IconField iconPosition="left" className="w-full max-w-xs">
            <InputIcon className="pi pi-search" />
            <InputText value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar..." className="w-full" />
          </IconField>
          <span className="text-sm text-slate-500">{filtered.length} resultados</span>
        </div>
        <DataTable value={filtered} paginator rows={10} className="text-sm" rowHover>
          <Column field="id" header="#" style={{ width: 60 }} />
          <Column field="empleado" header="Empleado" />
          <Column field="tipo" header="Tipo" body={(r) => <Tag value={r.tipo} />} />
          <Column field="descripcion" header="Descripción" />
          <Column field="fecha" header="Fecha" body={(r) => formatDate(r.fecha)} />
          <Column field="estado" header="Estado" body={(r) => {
            const sev = { Vigente: 'success', Firmada: 'info', Pendiente: 'warning', Vencida: 'danger' }[r.estado]
            return <Tag value={r.estado} severity={sev} rounded />
          }} />
        </DataTable>
      </div>
    </div>
  )
}
