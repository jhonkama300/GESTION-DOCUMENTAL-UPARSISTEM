import { useEffect, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { IconField } from 'primereact/iconfield'
import { InputIcon } from 'primereact/inputicon'
import { Dropdown } from 'primereact/dropdown'
import { Avatar } from 'primereact/avatar'
import { Toast } from 'primereact/toast'
import { useRef } from 'react'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import EmpleadoDrawer from '../components/EmpleadoDrawer.jsx'
import EmpleadoForm from '../components/EmpleadoForm.jsx'
import { empleadosService, SEDES } from '../services/mock.data.js'
import { useSede } from '../context/SedeContext.jsx'
import { formatDate, initials } from '../utils/format.js'

const ESTADOS = [
  { label: 'Todos', value: null },
  { label: 'Activos', value: 'Activo' },
  { label: 'Inactivos', value: 'Inactivo' },
]

const CIUDADES = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla']

export default function Empleados() {
  const { currentSede } = useSede()
  const [data, setData] = useState([])
  const [filter, setFilter] = useState('')
  const [estado, setEstado] = useState(null)
  const [ciudad, setCiudad] = useState(null)
  const [selected, setSelected] = useState(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [editing, setEditing] = useState(null)
  const toast = useRef(null)

  useEffect(() => {
    if (!currentSede) return
    empleadosService.list(currentSede.id).then(setData)
  }, [currentSede])

  const filtered = data.filter((e) => {
    const matchText = [e.nombre, e.cedula, e.cargo, e.area, e.sede].some((v) =>
      v?.toLowerCase().includes(filter.toLowerCase()),
    )
    const matchEstado = !estado || e.estado === estado
    const matchCiudad = !ciudad || e.sede === ciudad
    return matchText && matchEstado && matchCiudad
  })

  const openPerfil = (e) => {
    setSelected(e)
    setDrawerVisible(true)
  }

  const openEdit = (e, ev) => {
    ev?.stopPropagation()
    setEditing(e)
    setFormVisible(true)
  }

  const openNew = () => {
    setEditing(null)
    setFormVisible(true)
  }

  const handleSave = (newEmp) => {
    const created = { ...newEmp, id: Date.now() }
    setData((d) => [created, ...d])
    toast.current?.show({
      severity: 'success',
      summary: 'Empleado creado',
      detail: `${newEmp.nombre} fue agregado correctamente`,
      life: 3000,
    })
  }

  const handleUpdate = (id, updated) => {
    const prevSede = data.find((d) => d.id === id)?.sedeId
    setData((d) => d.map((e) => (e.id === id ? { ...e, ...updated } : e)))

    if (prevSede !== updated.sedeId) {
      const fromSede = SEDES.find((s) => s.id === prevSede)?.nombre
      const toSede = SEDES.find((s) => s.id === updated.sedeId)?.nombre
      if (prevSede === currentSede?.id) {
        setData((d) => d.filter((e) => e.id !== id))
        toast.current?.show({
          severity: 'info',
          summary: 'Empleado transferido',
          detail: `${updated.nombre} se movió de ${fromSede} a ${toSede}. Ya no aparece aquí.`,
          life: 4000,
        })
      } else if (updated.sedeId === currentSede?.id) {
        toast.current?.show({
          severity: 'success',
          summary: 'Empleado recibido',
          detail: `${updated.nombre} llegó desde ${fromSede}.`,
          life: 4000,
        })
      } else {
        toast.current?.show({
          severity: 'success',
          summary: 'Empleado actualizado',
          detail: `${updated.nombre} ahora está en ${toSede}.`,
          life: 3000,
        })
      }
    } else {
      toast.current?.show({
        severity: 'success',
        summary: 'Empleado actualizado',
        detail: `${updated.nombre} fue modificado correctamente`,
        life: 3000,
      })
    }
  }

  return (
    <div>
      <Toast ref={toast} />
      <PageHeader
        icon="pi-users"
        title="Empleados"
        subtitle={`${data.length} personas en ${currentSede?.nombre || 'la sede'}`}
        actions={
          <Button
            label="Nuevo empleado"
            icon="pi pi-plus"
            severity="info"
            onClick={openNew}
          />
        }
      />

      <div className="card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <IconField iconPosition="left" className="flex-1 min-w-[200px] max-w-sm">
            <InputIcon className="pi pi-search" />
            <InputText
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar por nombre, cédula, cargo..."
              className="w-full"
            />
          </IconField>

          <Dropdown
            value={estado}
            options={ESTADOS}
            onChange={(e) => setEstado(e.value)}
            placeholder="Estado"
            className="w-36"
            showClear
          />

          <Dropdown
            value={ciudad}
            options={CIUDADES.map((c) => ({ label: c, value: c }))}
            onChange={(e) => setCiudad(e.value)}
            placeholder="Ciudad"
            className="w-36"
            showClear
          />

          <div className="ml-auto text-sm text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-800 dark:text-slate-100">
              {filtered.length}
            </span>{' '}
            resultado{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon="pi-users"
            title="Sin empleados"
            description="No hay empleados en esta sede con los filtros aplicados."
            action={
              <Button label="Limpiar filtros" icon="pi pi-refresh" outlined size="small" onClick={() => { setFilter(''); setEstado(null); setCiudad(null) }} />
            }
          />
        ) : (
          <DataTable
            value={filtered}
            paginator
            rows={10}
            dataKey="id"
            className="text-sm"
            rowHover
            onRowClick={(e) => openPerfil(e.data)}
            rowClassName={() => 'cursor-pointer'}
            emptyMessage="Sin resultados"
          >
            <Column
              header="Empleado"
              body={(r) => (
                <div className="flex items-center gap-3 py-1">
                  <Avatar
                    label={initials(r.nombre)}
                    shape="circle"
                    size="normal"
                    className="bg-gradient-to-br from-brand-400 to-brand-600 text-white"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{r.nombre}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{r.cedula}</p>
                  </div>
                </div>
              )}
            />
            <Column field="cargo" header="Cargo" sortable />
            <Column field="area" header="Área" sortable />
            <Column field="sede" header="Sede" />
            <Column
              field="fechaIngreso"
              header="Ingreso"
              body={(r) => formatDate(r.fechaIngreso)}
              sortable
            />
            <Column
              field="estado"
              header="Estado"
              body={(r) => (
                <Tag
                  value={r.estado}
                  severity={r.estado === 'Activo' ? 'success' : 'danger'}
                  rounded
                />
              )}
            />
            <Column
              header=""
              style={{ width: 90 }}
              body={(r) => (
                <div className="flex gap-1">
                  <button
                    onClick={(ev) => openEdit(r, ev)}
                    className="w-8 h-8 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30 flex items-center justify-center text-amber-600"
                    aria-label="Editar empleado"
                    title="Editar"
                  >
                    <i className="pi pi-pencil text-xs" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); openPerfil(r) }}
                    className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500"
                    aria-label="Ver perfil"
                    title="Ver perfil"
                  >
                    <i className="pi pi-arrow-right text-xs" />
                  </button>
                </div>
              )}
            />
          </DataTable>
        )}
      </div>

      <EmpleadoDrawer
        visible={drawerVisible}
        empleado={selected}
        onHide={() => setDrawerVisible(false)}
      />

      <EmpleadoForm
        visible={formVisible}
        onHide={() => setFormVisible(false)}
        onSave={handleSave}
        onUpdate={handleUpdate}
        empleado={editing}
      />
    </div>
  )
}
