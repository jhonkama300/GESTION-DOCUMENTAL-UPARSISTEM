import { useEffect, useMemo, useState, useRef } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import EmpleadoDrawer from '../components/EmpleadoDrawer.jsx'
import EmpleadoForm from '../components/EmpleadoForm.jsx'
import { empleadosService, SEDES } from '../services/mock.data.js'
import { useSede } from '../context/SedeContext.jsx'
import { formatDate, initials, avatarColor } from '../utils/format.js'

const ESTADOS_OPTS = [
  { label: 'Activos', value: 'Activo' },
  { label: 'Inactivos', value: 'Inactivo' },
]

export default function Empleados() {
  const { currentSede } = useSede()
  const [data, setData] = useState([])
  const [filter, setFilter] = useState('')
  const [estado, setEstado] = useState(null)
  const [selected, setSelected] = useState(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [editing, setEditing] = useState(null)
  const toast = useRef(null)

  useEffect(() => {
    if (!currentSede) return
    empleadosService.list(currentSede.id).then(setData)
  }, [currentSede])

  const stats = useMemo(() => {
    const total = data.length
    const activos = data.filter((e) => e.estado === 'Activo').length
    const inactivos = total - activos
    const areasUniq = new Set(data.map((e) => e.area).filter(Boolean))
    return {
      total,
      activos,
      inactivos,
      areas: areasUniq.size,
      pctActivos: total ? Math.round((activos / total) * 100) : 0,
    }
  }, [data])

  const filtered = useMemo(() => {
    const q = filter.toLowerCase().trim()
    return data.filter((e) => {
      const matchText = !q || [e.nombre, e.cedula, e.cargo, e.area, e.sede].some((v) =>
        String(v || '').toLowerCase().includes(q),
      )
      const matchEstado = !estado || e.estado === estado
      return matchText && matchEstado
    })
  }, [data, filter, estado])

  const openPerfil = (e) => {
    setSelected(e)
    setDrawerVisible(true)
  }

  const openEdit = (e, ev) => {
    if (ev && ev.stopPropagation) ev.stopPropagation()
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
    if (toast.current) {
      toast.current.show({
        severity: 'success',
        summary: 'Empleado creado',
        detail: `${newEmp.nombre} fue agregado correctamente`,
        life: 3000,
      })
    }
  }

  const handleUpdate = (id, updated) => {
    const prev = data.find((d) => d.id === id)
    const prevSede = prev ? prev.sedeId : null
    setData((d) => d.map((e) => (e.id === id ? { ...e, ...updated } : e)))

    if (prevSede !== updated.sedeId) {
      const fromSede = SEDES.find((s) => s.id === prevSede)
      const toSede = SEDES.find((s) => s.id === updated.sedeId)
      const fromName = fromSede ? fromSede.nombre : ''
      const toName = toSede ? toSede.nombre : ''
      if (toast.current) {
        if (prevSede === (currentSede && currentSede.id)) {
          setData((d) => d.filter((e) => e.id !== id))
          toast.current.show({
            severity: 'info',
            summary: 'Empleado transferido',
            detail: `${updated.nombre} se movio de ${fromName} a ${toName}. Ya no aparece aqui.`,
            life: 4000,
          })
        } else if (updated.sedeId === (currentSede && currentSede.id)) {
          toast.current.show({
            severity: 'success',
            summary: 'Empleado recibido',
            detail: `${updated.nombre} llego desde ${fromName}.`,
            life: 4000,
          })
        } else {
          toast.current.show({
            severity: 'success',
            summary: 'Empleado actualizado',
            detail: `${updated.nombre} ahora esta en ${toName}.`,
            life: 3000,
          })
        }
      }
    } else if (toast.current) {
      toast.current.show({
        severity: 'success',
        summary: 'Empleado actualizado',
        detail: `${updated.nombre} fue modificado correctamente`,
        life: 3000,
      })
    }
  }

  const clearAll = () => {
    setFilter('')
    setEstado(null)
  }

  const hasFilters = Boolean(filter) || Boolean(estado)

  const sedeName = (currentSede && currentSede.nombre) || 'la sede'

  return (
    <div>
      <Toast ref={toast} />

      <PageHeader
        icon="pi-users"
        title="Empleados"
        subtitle={`${stats.total} personas en ${sedeName}`}
        actions={
          <Button
            label="Nuevo empleado"
            icon="pi pi-plus"
            severity="info"
            onClick={openNew}
          />
        }
      />

      {/* Banda de estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatPill icon="pi-users"     tone="brand"   label="Total"     value={stats.total} />
        <StatPill icon="pi-check"     tone="emerald" label="Activos"   value={stats.activos} pct={stats.pctActivos} />
        <StatPill icon="pi-pause"     tone="slate"   label="Inactivos" value={stats.inactivos} />
        <StatPill icon="pi-sitemap"   tone="violet"  label="Areas"     value={stats.areas} />
      </div>

      {/* Filtros */}
      <div className="card mb-5 overflow-hidden">
        <div className="p-4 flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1 min-w-[260px]">
            <i className="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
            <InputText
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Buscar por nombre, cedula, cargo o area"
              className="w-full pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setEstado(null)}
              className={`h-9 px-3 rounded-lg text-xs font-medium border transition inline-flex items-center ${
                !estado
                  ? 'bg-brand-500 text-white border-brand-500'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              Todos
              <span className="ml-1.5 text-[11px] font-semibold opacity-70">{stats.total}</span>
            </button>

            {ESTADOS_OPTS.map((opt) => {
              const count = data.filter((e) => e.estado === opt.value).length
              const active = estado === opt.value
              const tone = opt.value === 'Activo' ? 'emerald' : 'slate'
              const colors = active
                ? tone === 'emerald'
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-slate-700 text-white border-slate-700'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEstado(active ? null : opt.value)}
                  className={`h-9 px-3 rounded-lg text-xs font-medium border transition inline-flex items-center ${colors}`}
                >
                  {opt.label}
                  <span className="ml-1.5 text-[11px] font-semibold opacity-70">{count}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            Mostrando <strong className="text-slate-800 dark:text-slate-100">{filtered.length}</strong> de {stats.total} empleados
          </span>
          {hasFilters && (
            <button onClick={clearAll} className="text-rose-600 dark:text-rose-400 inline-flex items-center gap-1">
              <i className="pi pi-trash text-[10px]" />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon="pi-users"
            title={hasFilters ? 'Sin resultados' : 'Sin empleados'}
            description={
              hasFilters
                ? 'Ningun empleado coincide con los filtros aplicados.'
                : 'No hay empleados en esta sede.'
            }
            action={
              hasFilters ? (
                <Button label="Limpiar filtros" icon="pi pi-refresh" outlined size="small" onClick={clearAll} />
              ) : null
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
              sortable
              sortField="nombre"
              body={(r) => {
                const c = avatarColor(r.nombre)
                return (
                  <div className="flex items-center gap-3 py-2">
                    <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} flex items-center justify-center font-semibold text-sm shrink-0`}>
                      {initials(r.nombre)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 dark:text-slate-100 truncate">{r.nombre}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{r.cedula}</div>
                    </div>
                  </div>
                )
              }}
            />
            <Column field="cargo" header="Cargo" sortable />
            <Column field="area" header="Area" sortable />
            <Column field="sede" header="Sede" />
            <Column field="fechaIngreso" header="Ingreso" sortable body={(r) => formatDate(r.fechaIngreso)} />
            <Column
              field="estado"
              header="Estado"
              body={(r) => {
                const active = r.estado === 'Activo'
                return (
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${active ? 'text-emerald-700' : 'text-slate-500'}`}>
                    <span className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    {r.estado}
                  </span>
                )
              }}
            />
            <Column
              header=""
              style={{ width: '90px' }}
              body={(r) => (
                <div className="flex gap-1 justify-end">
                  <button
                    type="button"
                    onClick={(ev) => openEdit(r, ev)}
                    className="w-8 h-8 rounded-lg hover:bg-amber-50 flex items-center justify-center text-amber-600"
                    aria-label="Editar"
                    title="Editar"
                  >
                    <i className="pi pi-pencil text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={(ev) => {
                      if (ev && ev.stopPropagation) ev.stopPropagation()
                      openPerfil(r)
                    }}
                    className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500"
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

function StatPill({ icon, tone, label, value, pct }) {
  const tones = {
    brand:   'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    slate:   'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    violet:  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  }
  const palette = tones[tone] || tones.brand
  return (
    <div className="card card-hover p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${palette}`}>
        <i className={`pi ${icon} text-lg`} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 truncate">
          {label}
        </div>
        <div className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
          {value}
          {typeof pct === 'number' && pct > 0 && (
            <span className="ml-1 text-xs font-medium text-slate-400">{pct}%</span>
          )}
        </div>
      </div>
    </div>
  )
}
