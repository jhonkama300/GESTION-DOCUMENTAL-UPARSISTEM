import { useState } from 'react'
import { Button } from 'primereact/button'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { Avatar } from 'primereact/avatar'
import PageHeader from '../components/PageHeader.jsx'
import { initials } from '../utils/format.js'

const USERS = [
  { id: 1, nombre: 'Administrador', email: 'admin@gth.com', rol: 'Administrador', estado: 'Activo', ultimo: '2025-11-12 10:24' },
  { id: 2, nombre: 'Ana Rodríguez', email: 'rrhh@gth.com', rol: 'RRHH', estado: 'Activo', ultimo: '2025-11-12 09:51' },
  { id: 3, nombre: 'Carlos Méndez', email: 'supervisor@gth.com', rol: 'Supervisor', estado: 'Activo', ultimo: '2025-11-11 17:02' },
  { id: 4, nombre: 'Laura Pérez', email: 'empleado@gth.com', rol: 'Empleado', estado: 'Activo', ultimo: '2025-11-11 14:10' },
  { id: 5, nombre: 'María Salazar', email: 'maria@gth.com', rol: 'RRHH', estado: 'Inactivo', ultimo: '2025-10-25 16:30' },
]

const ROL_COLORS = {
  Administrador: 'rose',
  Administrativo: 'brand',
}

export default function Usuarios() {
  return (
    <div>
      <PageHeader
        icon="pi-user-edit"
        title="Usuarios y Roles"
        subtitle="Gestión de accesos al sistema"
        actions={
          <div className="flex gap-2">
            <Button label="Roles y permisos" icon="pi pi-shield" outlined size="small" />
            <Button label="Nuevo usuario" icon="pi pi-plus" severity="info" size="small" />
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {['Administrador', 'Administrativo'].map((r) => {
          const count = USERS.filter((u) => u.rol === r).length
          return (
            <div key={r} className="card p-4">
              <p className="text-xs text-slate-500 dark:text-slate-400">{r}</p>
              <p className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-1">{count}</p>
              <p className="text-[10px] text-slate-400 mt-1">usuarios</p>
            </div>
          )
        })}
      </div>

      <div className="card overflow-hidden">
        <DataTable value={USERS} paginator rows={10} className="text-sm" rowHover>
          <Column
            header="Usuario"
            body={(r) => (
              <div className="flex items-center gap-3 py-1">
                <Avatar label={initials(r.nombre)} shape="circle" className="bg-gradient-to-br from-brand-400 to-brand-600 text-white" />
                <div>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{r.nombre}</p>
                  <p className="text-xs text-slate-500">{r.email}</p>
                </div>
              </div>
            )}
          />
          <Column field="rol" header="Rol" body={(r) => <Tag value={r.rol} severity={ROL_COLORS[r.rol]} />} />
          <Column field="estado" header="Estado" body={(r) => <Tag value={r.estado} severity={r.estado === 'Activo' ? 'success' : 'danger'} rounded />} />
          <Column field="ultimo" header="Último acceso" />
        </DataTable>
      </div>
    </div>
  )
}
