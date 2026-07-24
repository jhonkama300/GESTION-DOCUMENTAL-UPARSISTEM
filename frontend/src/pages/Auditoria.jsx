import { useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { InputText } from 'primereact/inputtext'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { Button } from 'primereact/button'
import PageHeader from '../components/PageHeader.jsx'

const AUDIT = [
  { id: 1, usuario: 'admin@gth.com', accion: 'LOGIN', recurso: 'Auth', detalle: 'Inicio de sesión exitoso', fecha: '2025-11-12 10:24:15', ip: '192.168.1.10' },
  { id: 2, usuario: 'rrhh@gth.com', accion: 'CREATE', recurso: 'Empleado', detalle: 'Creó empleado #42 - Sofia Castro', fecha: '2025-11-12 10:15:32', ip: '192.168.1.12' },
  { id: 3, usuario: 'admin@gth.com', accion: 'UPDATE', recurso: 'Plantilla', detalle: 'Modificó plantilla de contrato indefinido', fecha: '2025-11-12 09:48:01', ip: '192.168.1.10' },
  { id: 4, usuario: 'supervisor@gth.com', accion: 'SIGN', recurso: 'Contrato', detalle: 'Firmó contrato #104 de Carlos Méndez', fecha: '2025-11-12 09:51:22', ip: '192.168.1.18' },
  { id: 5, usuario: 'rrhh@gth.com', accion: 'DELETE', recurso: 'Documento', detalle: 'Eliminó documento temporal', fecha: '2025-11-11 18:02:10', ip: '192.168.1.12' },
  { id: 6, usuario: 'admin@gth.com', accion: 'LOGIN_FAILED', recurso: 'Auth', detalle: 'Contraseña incorrecta', fecha: '2025-11-11 16:34:08', ip: '200.45.32.18' },
  { id: 7, usuario: 'rrhh@gth.com', accion: 'UPLOAD', recurso: 'Documento', detalle: 'Subió contrato firmado de Laura Pérez', fecha: '2025-11-11 14:20:45', ip: '192.168.1.12' },
]

const ACTION_COLORS = {
  LOGIN: 'info', LOGIN_FAILED: 'danger', CREATE: 'success', UPDATE: 'warning',
  DELETE: 'danger', SIGN: 'success', UPLOAD: 'info',
}

export default function Auditoria() {
  const [filter, setFilter] = useState('')
  const filtered = AUDIT.filter((a) =>
    [a.usuario, a.accion, a.recurso, a.detalle, a.ip].some((v) => v.toLowerCase().includes(filter.toLowerCase())),
  )

  return (
    <div>
      <PageHeader
        icon="pi-shield"
        title="Auditoría"
        subtitle="Trazabilidad de todas las acciones del sistema"
        actions={<Button label="Exportar log" icon="pi pi-download" outlined size="small" />}
      />

      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <IconField iconPosition="left" className="w-full max-w-md">
            <InputIcon className="pi pi-search" />
            <InputText value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Buscar por usuario, acción, IP..." className="w-full" />
          </IconField>
          <span className="text-sm text-slate-500">{filtered.length} eventos</span>
        </div>
        <DataTable value={filtered} paginator rows={15} className="text-sm" rowHover>
          <Column field="fecha" header="Fecha y hora" sortable style={{ width: 180 }} />
          <Column field="usuario" header="Usuario" />
          <Column field="accion" header="Acción" body={(r) => <Tag value={r.accion} severity={ACTION_COLORS[r.accion]} />} />
          <Column field="recurso" header="Recurso" />
          <Column field="detalle" header="Detalle" />
          <Column field="ip" header="IP" body={(r) => <code className="text-xs text-slate-500">{r.ip}</code>} />
        </DataTable>
      </div>
    </div>
  )
}
