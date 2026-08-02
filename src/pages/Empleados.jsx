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
import PhotoPreviewModal from '../components/PhotoPreviewModal.jsx'
import AreaFilterPopover from '../components/AreaFilterPopover.jsx'
import { empleadosService } from '../services/empleados.service.js'
import { useEntidad } from '../context/EntidadContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { formatDate, initials, avatarColor, calcAntiguedad, calcEdad, diasHasta } from '../utils/format.js'

const ESTADOS_OPTS = [
  { label: 'Activos', value: 'Activo' },
  { label: 'Inactivos', value: 'Inactivo' },
]

export default function Empleados() {
const { currentEntidad } = useEntidad()
const { user } = useAuth()
const sedesCatalog = user?.sedes || []
  const [data, setData] = useState([])
  const [filter, setFilter] = useState('')
  const [estado, setEstado] = useState(null)
  const [areaFilter, setAreaFilter] = useState(null)
  const [areaPopoverOpen, setAreaPopoverOpen] = useState(false)
  const areaBtnRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [formVisible, setFormVisible] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const toast = useRef(null)

  const refresh = async (sedeId) => {
    setLoading(true)
    try {
      const list = await empleadosService.list(sedeId)
      setData(Array.isArray(list) ? list : [])
    } catch (err) {
      const message = err.response?.data?.error?.message || err.message
      toast.current?.show({
        severity: 'error',
        summary: 'Error al cargar',
        detail: message,
        life: 4000,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!currentEntidad) return
    refresh(currentEntidad.id)
  }, [currentEntidad])

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

  const areaOptions = useMemo(() => {
    const set = new Map()
    data.forEach((e) => { if (e.area) set.set(e.area, (set.get(e.area) || 0) + 1) })
    return Array.from(set.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([area, count]) => ({ area, count }))
  }, [data])

  const filtered = useMemo(() => {
    const q = filter.toLowerCase().trim()
    return data.filter((e) => {
      const matchText = !q || [e.nombre, e.cedula, e.cargo, e.area, e.sede].some((v) =>
        String(v || '').toLowerCase().includes(q),
      )
      const matchEstado = !estado || e.estado === estado
      const matchArea = !areaFilter || e.area === areaFilter
      return matchText && matchEstado && matchArea
    })
  }, [data, filter, estado, areaFilter])

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

  const handleSave = async (newEmp) => {
    try {
      const payload = stripForApi(newEmp)
      const created = await empleadosService.create(payload)
      setData((d) => [created, ...d])
      toast.current?.show({
        severity: 'success',
        summary: 'Empleado creado',
        detail: `${created.nombre} fue agregado correctamente`,
        life: 3000,
      })
    } catch (err) {
      const message = err.response?.data?.error?.message || err.message
      toast.current?.show({
        severity: 'error',
        summary: 'Error al crear',
        detail: message,
        life: 4000,
      })
    }
  }

  const handleUpdate = async (id, updated) => {
    const prev = data.find((d) => d.id === id)
    const prevSede = prev ? prev.sedeId : null
    try {
      const payload = stripForApi(updated)
      const saved = await empleadosService.update(id, payload)
      const newSede = saved.sedeId
      const sedeChanged = prevSede !== newSede

      if (sedeChanged) {
        const fromSede = sedesCatalog.find((s) => s.id === prevSede)
        const toSede = sedesCatalog.find((s) => s.id === newSede)
        const fromName = fromSede ? fromSede.nombre : ''
        const toName = toSede ? toSede.nombre : ''

        if (currentEntidad && prevSede === currentEntidad.id && newSede !== currentEntidad.id) {
          setData((d) => d.filter((e) => e.id !== id))
          toast.current?.show({
            severity: 'info',
            summary: 'Empleado transferido',
            detail: `${saved.nombre} se movió de ${fromName} a ${toName}. Ya no aparece aquí.`,
            life: 4000,
          })
        } else if (currentEntidad && newSede === currentEntidad.id) {
          setData((d) => [saved, ...d.filter((e) => e.id !== id)])
          toast.current?.show({
            severity: 'success',
            summary: 'Empleado recibido',
            detail: `${saved.nombre} llegó desde ${fromName}.`,
            life: 4000,
          })
        } else {
          setData((d) => d.map((e) => (e.id === id ? saved : e)))
          toast.current?.show({
            severity: 'success',
            summary: 'Empleado actualizado',
            detail: `${saved.nombre} ahora está en ${toName}.`,
            life: 3000,
          })
        }
      } else {
        setData((d) => d.map((e) => (e.id === id ? saved : e)))
        toast.current?.show({
          severity: 'success',
          summary: 'Empleado actualizado',
          detail: `${saved.nombre} fue modificado correctamente`,
          life: 3000,
        })
      }
    } catch (err) {
      const message = err.response?.data?.error?.message || err.message
      toast.current?.show({
        severity: 'error',
        summary: 'Error al actualizar',
        detail: message,
        life: 4000,
      })
    }
  }

  const clearAll = () => {
    setFilter('')
    setEstado(null)
    setAreaFilter(null)
  }

  const hasFilters = Boolean(filter) || Boolean(estado) || Boolean(areaFilter)

  const sedeName = (currentEntidad && currentEntidad.nombre) || 'la sede'

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

            <div className="relative">
            <button
              ref={areaBtnRef}
              type="button"
              onClick={() => setAreaPopoverOpen((v) => !v)}
              className={`area-popover-btn h-9 px-3 rounded-lg text-xs font-medium border transition inline-flex items-center gap-1.5 ${
                areaFilter
                  ? 'bg-violet-500 text-white border-violet-500'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-violet-400'
              }`}
            >
              <i className="pi pi-sitemap text-[11px]" />
              {areaFilter || 'Área'}
              {areaFilter && (
                <span className="ml-1 text-[10px] font-bold opacity-70">
                  ({areaOptions.find((a) => a.area === areaFilter)?.count})
                </span>
              )}
            </button>

            {areaPopoverOpen && (
              <AreaFilterPopover
                options={areaOptions}
                value={areaFilter}
                totalCount={data.filter((e) => e.area).length}
                onSelect={setAreaFilter}
                onClose={() => setAreaPopoverOpen(false)}
                anchorRef={areaBtnRef}
              />
            )}
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
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        {loading && data.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">
            <i className="pi pi-spin pi-spinner text-2xl mb-2 text-brand-500" />
            <p>Cargando empleados...</p>
          </div>
        ) : filtered.length === 0 ? (
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
            className="text-sm gth-table"
            rowHover
            stripedRows
            scrollable
            onRowClick={(e) => openPerfil(e.data)}
            rowClassName={(r) => rowAccentClass(r)}
            emptyMessage="Sin resultados"
          >
            <Column
              header="Empleado"
              sortable
              sortField="nombre"
              frozen
              alignFrozen="left"
              style={{ minWidth: '280px' }}
              headerClassName="gth-th"
              bodyClassName="gth-td-empleado"
              body={(r) => <EmpleadoCell r={r} onPhotoClick={setPhotoPreview} />}
            />
            <Column
              header="Cargo / Área"
              sortable
              sortField="cargo"
              style={{ minWidth: '210px' }}
              headerClassName="gth-th"
              body={CargoCell}
            />
            <Column
              header="Entidad"
              field="sede"
              sortable
              style={{ minWidth: '130px' }}
              headerClassName="gth-th"
              body={SedeCell}
            />
            <Column
              header="Ingreso / Antigüedad"
              sortable
              sortField="fechaIngreso"
              style={{ minWidth: '180px' }}
              headerClassName="gth-th"
              body={IngresoCell}
            />
            <Column
              header="Contrato"
              sortable
              sortField="fechaFinal"
              style={{ minWidth: '170px' }}
              headerClassName="gth-th"
              body={ContratoCell}
            />
            <Column
              header="Email"
              field="email"
              sortable
              style={{ minWidth: '210px' }}
              headerClassName="gth-th"
              body={(r) => (
                <span className="font-mono text-xs text-slate-600 dark:text-slate-300 truncate block max-w-[210px]" title={r.email}>
                  {r.email || '—'}
                </span>
              )}
            />
            <Column
              field="estado"
              header="Estado"
              sortable
              style={{ minWidth: '120px' }}
              headerClassName="gth-th"
              body={EstadoCell}
            />
            <Column
              header=""
              frozen
              alignFrozen="right"
              style={{ width: '96px' }}
              headerClassName="gth-th gth-th-actions"
              bodyClassName="gth-td-actions"
              body={(r) => (
                <div className="flex gap-1 justify-end">
                  <button
                    type="button"
                    onClick={(ev) => openEdit(r, ev)}
                    className="w-8 h-8 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/30 flex items-center justify-center text-amber-600 transition"
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
                    className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition"
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

      <PhotoPreviewModal
        visible={!!photoPreview}
        onHide={() => setPhotoPreview(null)}
        src={photoPreview?.foto}
        nombre={photoPreview?.nombre}
        size="md"
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

const EMPTY_DATE = (v) => (v === '' || v === undefined ? null : v)

function stripForApi(form) {
  return {
    nombres: form.nombres,
    apellidos: form.apellidos,
    tipoDocumento: form.tipoDocumento || null,
    identificacion: form.identificacion || form.cedula,
    email: form.email,
    fechaExpedicion: EMPTY_DATE(form.fechaExpedicion),
    lugarExpedicion: form.lugarExpedicion || null,
    fechaNacimiento: EMPTY_DATE(form.fechaNacimiento),
    lugarNacimiento: form.lugarNacimiento || null,
    direccion: form.direccion || null,
    eps: form.eps || null,
    afp: form.afp || null,
    arl: form.arl || null,
    cajaCompensacion: form.cajaCompensacion || null,
    tipoSangre: form.tipoSangre || null,
    contactoNombre: form.contactoNombre || null,
    contactoParentesco: form.contactoParentesco || null,
    contactoTelefono: form.contactoTelefono || null,
    sedeId: form.sedeId || null,
    area: form.area || null,
    cargo: form.cargo || null,
    profesion: form.profesion || null,
    nivelAcademico: form.nivelAcademico || null,
    fechaIngreso: EMPTY_DATE(form.fechaIngreso),
    fechaFinal: EMPTY_DATE(form.fechaFinal),
    estado: form.estado || 'Activo',
    foto: form.foto || null,
  }
}

/* ════════════════════════════════════════════════════════════════
   CELL COMPONENTS — lo que TH ve de un vistazo
   Jerarquía visual:
     1. Empleado (foto + nombre) → PRIMARY, más grande y prominente
     2. Cargo / Contrato        → SECONDARY, peso medio
     3. Sede / Antigüedad       → TERTIARY, metadata
   ════════════════════════════════════════════════════════════════ */

function EmpleadoCell({ r, onPhotoClick }) {
  const c = avatarColor(r.nombre)
  const edad = calcEdad(r.fechaNacimiento)
  const novedad = novedadEmpleado(r)
  return (
    <div className="flex items-center gap-3.5 py-2">
      <button
        type="button"
        onClick={(ev) => {
          if (ev && ev.stopPropagation) ev.stopPropagation()
          if (r.foto && onPhotoClick) onPhotoClick(r)
        }}
        disabled={!r.foto}
        title={r.foto ? 'Click para ver foto' : 'Sin foto'}
        className={`relative shrink-0 rounded-xl transition ${
          r.foto ? 'cursor-zoom-in hover:scale-105' : 'cursor-default'
        }`}
      >
        {r.foto ? (
          <img
            src={r.foto}
            alt={r.nombre}
            className="w-11 h-11 rounded-xl object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm"
          />
        ) : (
          <div className={`w-11 h-11 rounded-xl ${c.bg} ${c.text} flex items-center justify-center font-bold text-[15px] ring-2 ring-white dark:ring-slate-800 shadow-sm`}>
            {initials(r.nombre)}
          </div>
        )}
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
            r.estado === 'Activo' ? 'bg-emerald-500' :
            r.estado === 'Suspendido' ? 'bg-amber-500' : 'bg-slate-400'
          }`}
          title={r.estado}
        />
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <div className="font-bold text-[14px] text-slate-800 dark:text-slate-100 truncate" title={r.nombre}>
            {r.nombre}
          </div>
          {novedad && (
            <span
              className={`shrink-0 inline-flex items-center gap-0.5 px-1.5 py-px rounded text-[9px] font-bold uppercase tracking-wide ${novedad.cls}`}
              title={novedad.title}
            >
              <i className={`pi ${novedad.icon} text-[8px]`} />
              {novedad.text}
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate flex items-center gap-1.5 mt-0.5">
          <span className="font-semibold">{r.cedula}</span>
          {r.tipoDocumento && (
            <span className="px-1 py-px rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
              {r.tipoDocumento}
            </span>
          )}
          {edad != null && (
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">· {edad}a</span>
          )}
        </div>
      </div>
    </div>
  )
}

function CargoCell(r) {
  return (
    <div className="py-2">
      <div className="font-semibold text-[13px] text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5" title={r.cargo}>
        <i className="pi pi-briefcase text-[11px] text-brand-500" />
        {r.cargo || <span className="text-slate-400 font-normal italic">Sin cargo</span>}
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <span
          className="inline-flex items-center gap-1 px-1.5 py-px rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 truncate max-w-[180px]"
          title={r.area}
        >
          <i className="pi pi-sitemap text-[8px]" />
          {r.area || 'Sin área'}
        </span>
        {r.nivelAcademico && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate" title={r.nivelAcademico}>
            · {r.nivelAcademico}
          </span>
        )}
      </div>
    </div>
  )
}

function SedeCell(r) {
  const { user } = useAuth()
  const sedeObj = (user?.sedes || []).find((s) => s.id === r.sedeId)
  if (!sedeObj) {
    return <span className="text-xs text-slate-500 italic">{r.sede || '—'}</span>
  }
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span
        className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm"
        style={{ background: sedeObj.color }}
        title={sedeObj.nombre}
      >
        {sedeObj.iniciales}
      </span>
      <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200 truncate">{sedeObj.nombre}</span>
    </div>
  )
}

function IngresoCell(r) {
  const a = calcAntiguedad(r.fechaIngreso)
  const tones = a.years >= 5
    ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 ring-violet-200 dark:ring-violet-800'
    : a.years >= 2
    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 ring-brand-200 dark:ring-brand-800'
    : a.years >= 1
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-800'
    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 ring-slate-200 dark:ring-slate-600'
  return (
    <div className="py-1.5">
      <div className="text-[13px] text-slate-700 dark:text-slate-200 font-medium tabular-nums">
        {formatDate(r.fechaIngreso)}
      </div>
      {a.text !== '—' && (
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold mt-1 ring-1 ${tones}`}>
          <i className="pi pi-clock text-[8px]" />
          {a.text}
        </span>
      )}
    </div>
  )
}

function ContratoCell(r) {
  const dias = diasHasta(r.fechaFinal)
  if (!r.fechaFinal) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-800">
        <i className="pi pi-infinity text-[10px]" />
        Indefinido
      </span>
    )
  }
  const urgente = dias !== null && dias <= 30
  const expirado = dias !== null && dias < 0
  const tone = expirado
    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 ring-rose-200 dark:ring-rose-800'
    : urgente
    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ring-amber-200 dark:ring-amber-800'
    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 ring-slate-200 dark:ring-slate-600'
  return (
    <div className="py-1.5">
      <div className="text-[13px] text-slate-700 dark:text-slate-200 font-medium tabular-nums">
        {formatDate(r.fechaFinal)}
      </div>
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold mt-1 ring-1 ${tone}`}>
        <i className={`pi ${expirado ? 'pi-times-circle' : urgente ? 'pi-exclamation-triangle' : 'pi-calendar'} text-[9px]`} />
        {expirado
          ? `Venció hace ${Math.abs(dias)}d`
          : urgente
          ? `Vence en ${dias}d`
          : `${dias}d restantes`}
      </span>
    </div>
  )
}

function EstadoCell(r) {
  const map = {
    Activo:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ring-emerald-200 dark:ring-emerald-800',
    Inactivo:   'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 ring-slate-200 dark:ring-slate-600',
    Suspendido: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 ring-amber-200 dark:ring-amber-800',
  }
  const tone = map[r.estado] || map.Inactivo
  const icons = { Activo: 'pi-check-circle', Inactivo: 'pi-pause-circle', Suspendido: 'pi-ban' }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold ring-1 ${tone}`}>
      <i className={`pi ${icons[r.estado] || 'pi-circle'} text-[11px]`} />
      {r.estado}
    </span>
  )
}

/** Devuelve { text, icon, cls, title } si el empleado tiene una "novedad"
 *  reciente (< 30 días) — para destacar visualmente en la fila. */
function novedadEmpleado(r) {
  if (!r.fechaIngreso) return null
  const a = calcAntiguedad(r.fechaIngreso)
  if (a.days > 0 && a.days <= 30) {
    return {
      text: 'Nuevo',
      icon: 'pi-sparkles',
      cls: 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-sm shadow-brand-500/30',
      title: `Ingresó hace ${a.days} días`,
    }
  }
  return null
}

/** Acento visual en el borde izquierdo de la fila según urgencia. */
function rowAccentClass(r) {
  const dias = diasHasta(r.fechaFinal)
  let cls = 'cursor-pointer transition-colors'
  if (r.estado === 'Inactivo') return `${cls} opacity-60`
  if (dias !== null && dias < 0) return `${cls} border-l-4 !border-l-rose-400 dark:!border-l-rose-500 bg-rose-50/30 dark:bg-rose-900/10`
  if (dias !== null && dias <= 30) return `${cls} border-l-4 !border-l-amber-400 dark:!border-l-amber-500`
  return cls
}
