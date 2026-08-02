import { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { ColorPicker } from 'primereact/colorpicker'
import { InputSwitch } from 'primereact/inputswitch'
import { Toast } from 'primereact/toast'
import { confirmDialog } from 'primereact/confirmdialog'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { entidadesService } from '../services/entidades.service.js'
import { useEntidad } from '../context/EntidadContext.jsx'
import { formatDate, initials } from '../utils/format.js'

const emptyForm = () => ({
  nombre: '',
  iniciales: '',
  color: '#A8CF45',
  logo: null,
  descripcion: '',
  nit: '',
  direccion: '',
  ciudad: '',
  telefono: '',
  email: '',
  representante_nombre: '',
  estado: 'activa',
})

export default function Entidades() {
  const toast = useRef(null)
  const { currentEntidad, selectEntidad } = useEntidad()
  const selectSede = selectEntidad
  const [entidades, setEntidades] = useState([])
  const [loading, setLoading] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [editMode, setEditMode] = useState('create')
  const [editForm, setEditForm] = useState(emptyForm())
  const [editingId, setEditingId] = useState(null)
  const [editSaving, setEditSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setEntidades(await entidadesService.list({ todos: true }))
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.error?.message || err.message,
        life: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openCreate = () => {
    setEditMode('create')
    setEditForm(emptyForm())
    setEditingId(null)
    setEditVisible(true)
  }

  const openEdit = (s) => {
    setEditMode('edit')
    setEditingId(s.id)
    setEditForm({
      nombre: s.nombre,
      iniciales: s.iniciales || '',
      color: s.color || '#A8CF45',
      logo: s.logo_url || null,
      descripcion: s.descripcion || '',
      nit: s.nit || '',
      direccion: s.direccion || '',
      ciudad: s.ciudad || '',
      telefono: s.telefono || '',
      email: s.email || '',
      representante_nombre: s.representante_nombre || '',
      estado: s.estado || 'activa',
    })
    setEditVisible(true)
  }

  const save = async () => {
    if (!editForm.nombre.trim()) {
      toast.current?.show({ severity: 'warn', summary: 'Falta el nombre de la entidad', life: 3000 })
      return
    }
    setEditSaving(true)
    try {
      const payload = {
        nombre: editForm.nombre.trim(),
        iniciales: editForm.iniciales.trim().toUpperCase(),
        color: editForm.color || '#A8CF45',
        descripcion: editForm.descripcion.trim(),
        nit: editForm.nit.trim(),
        direccion: editForm.direccion.trim(),
        ciudad: editForm.ciudad.trim(),
        telefono: editForm.telefono.trim(),
        email: editForm.email.trim(),
        representante_nombre: editForm.representante_nombre.trim(),
        estado: editForm.estado,
      }
      if (editMode === 'create') {
        const creada = await entidadesService.create(payload)
        toast.current?.show({ severity: 'success', summary: 'Entidad registrada', life: 3000 })
        await persistLogo(creada.id)
      } else {
        await entidadesService.update(editingId, payload)
        toast.current?.show({ severity: 'success', summary: 'Entidad actualizada', life: 3000 })
        await persistLogo(editingId)
      }
      setEditVisible(false)
      await load()
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.error?.message || err.message,
        life: 5000,
      })
    } finally {
      setEditSaving(false)
    }
  }

  const persistLogo = async (entidadId) => {
    try {
      if (editForm.logoFile) {
        await entidadesService.uploadLogo(entidadId, editForm.logoFile)
        toast.current?.show({ severity: 'success', summary: 'Logo actualizado', life: 3000 })
      } else if (editForm.logoRemoved) {
        await entidadesService.removeLogo(entidadId)
      }
    } catch (err) {
      toast.current?.show({
        severity: 'warn',
        summary: 'No se pudo guardar el logo',
        detail: err.response?.data?.error?.message || err.message,
        life: 5000,
      })
    }
  }

  const toggleEstado = async (s) => {
    const nuevo = s.estado === 'activa' ? 'inactiva' : 'activa'
    try {
      await entidadesService.update(s.id, { estado: nuevo })
      toast.current?.show({
        severity: 'success',
        summary: nuevo === 'activa' ? 'Entidad activada' : 'Entidad inactivada',
        life: 3000,
      })
      await load()
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.error?.message || err.message,
        life: 5000,
      })
    }
  }

  const remove = (s) => {
    confirmDialog({
      message: `¿Eliminar la entidad "${s.nombre}"? Esta acción no se puede deshacer.`,
      header: 'Eliminar entidad',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await entidadesService.delete(s.id)
          toast.current?.show({ severity: 'success', summary: 'Entidad eliminada', life: 3000 })
          await load()
        } catch (err) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: err.response?.data?.error?.message || err.message,
            life: 5000,
          })
        }
      },
    })
  }

  const activas = entidades.filter((s) => s.estado === 'activa')
  const inactivas = entidades.filter((s) => s.estado !== 'activa')
  const sorted = [...entidades].sort((a, b) => {
    if (a.estado !== b.estado) return a.estado === 'activa' ? -1 : 1
    return a.nombre.localeCompare(b.nombre)
  })

  // Filtro de búsqueda por texto (nombre, iniciales, NIT, ciudad).
  // El search vive en estado local y filtra tanto activas como inactivas.
  const [search, setSearch] = useState('')
  const matchSearch = (s) => {
    if (!search.trim()) return true
    const q = search.toLowerCase().trim()
    return [s.nombre, s.iniciales, s.nit, s.ciudad, s.representante_nombre]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q))
  }
  const sortedFiltered = sorted.filter(matchSearch)

  return (
    <div>
      <Toast ref={toast} />
      <PageHeader
        icon="pi-building"
        title="Entidades registradas"
        subtitle={
          <>
            <span className="font-semibold text-brand-700 dark:text-brand-300">{activas.length}</span> activas ·{' '}
            <span className="font-semibold">{inactivas.length}</span> inactivas ·{' '}
            <span className="text-slate-400">registro real en BD</span>
          </>
        }
        actions={
          <Button label="Registrar entidad" icon="pi pi-plus" severity="info" size="small" onClick={openCreate} />
        }
      />

      {/* ── Resumen compacto: jerarquía 1 · el estado general de las entidades */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat icon="pi-building" label="Organizaciones" value={entidades.length} color="brand" />
          <Stat icon="pi-check-circle" label="Activas" value={activas.length} color="emerald" />
          <Stat icon="pi-ban" label="Inactivas" value={inactivas.length} color="amber" />
          <Stat
            icon="pi-map-marker"
            label="Trabajando con"
            value={currentEntidad ? currentEntidad.nombre : '—'}
            color="violet"
            compact
          />
        </div>
      </div>

      {entidades.length === 0 && !loading ? (
        <EmptyState
          icon="pi-building"
              title="Aún no hay entidades registradas"
          description="Registra la primera organización del sistema."
          action={<Button label="Registrar entidad" icon="pi pi-plus" severity="info" onClick={openCreate} />}
        />
      ) : (
        <>
          {/* ── Buscador · jerarquía 2 */}
          {entidades.length > 1 && (
            <div className="card p-3 mb-5">
              <div className="relative">
                <i className="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
                <InputText
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, iniciales, NIT o ciudad"
                  className="w-full pl-10"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title="Limpiar búsqueda"
                  >
                    <i className="pi pi-times-circle text-xs" />
                  </button>
                )}
              </div>
              {search && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  {sortedFiltered.length} de {entidades.length} entidades coinciden con «{search}»
                </p>
              )}
            </div>
          )}

          {/* ── Activas · jerarquía 3 */}
          <SectionTitle
            icon="pi-check-circle"
            tone="emerald"
            title="Activas"
            count={sortedFiltered.filter((s) => s.estado === 'activa').length}
            subtitle="Disponibles en el selector para los usuarios asignados"
          />
          {sortedFiltered.filter((s) => s.estado === 'activa').length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 italic mb-6">
                {search ? `Ninguna entidad activa coincide con «${search}».` : 'No hay entidades activas.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              {sortedFiltered.filter((s) => s.estado === 'activa').map((s) => (
                <SedeCard
                  key={s.id}
                  s={s}
                  isCurrent={currentEntidad?.id === s.id}
                  onSelect={() => selectSede(s)}
                  onToggle={() => toggleEstado(s)}
                  onEdit={() => openEdit(s)}
                  onDelete={() => remove(s)}
                />
              ))}
            </div>
          )}

          {/* ── Inactivas · jerarquía 4 */}
          {sortedFiltered.filter((s) => s.estado !== 'activa').length > 0 && (
            <>
              <SectionTitle
                icon="pi-ban"
                tone="slate"
                title="Inactivas"
                count={sortedFiltered.filter((s) => s.estado !== 'activa').length}
                subtitle="Ocultas del selector hasta que se reactiven"
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
                {sortedFiltered
                  .filter((s) => s.estado !== 'activa')
                  .map((s) => (
                    <SedeCard
                      key={s.id}
                      s={s}
                      isCurrent={currentEntidad?.id === s.id}
                      onSelect={() => selectSede(s)}
                      onToggle={() => toggleEstado(s)}
                      onEdit={() => openEdit(s)}
                      onDelete={() => remove(s)}
                    />
                  ))}
              </div>
            </>
          )}
        </>
      )}

      <SedeFormDialog
        visible={editVisible}
        mode={editMode}
        form={editForm}
        saving={editSaving}
        onHide={() => setEditVisible(false)}
        onChange={(patch) => setEditForm((f) => ({ ...f, ...patch }))}
        onSave={save}
        onRemoveLogo={async () => {
          await entidadesService.removeLogo(editingId)
          setEditForm((f) => ({ ...f, logo: null, logoFile: null, logoRemoved: false }))
        }}
      />
    </div>
  )
}

function SectionTitle({ icon, tone, title, count, subtitle }) {
  const tones = {
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
    slate: 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
  }[tone]
  return (
    <div className="flex items-end justify-between mb-3">
      <div className="flex items-center gap-2.5">
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${tones}`}>
          <i className={`pi ${icon} text-[13px]`} />
        </span>
        <div className="flex items-baseline gap-2">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {count}
          </span>
        </div>
      </div>
      <p className="hidden md:block text-[11px] text-slate-400 dark:text-slate-500">{subtitle}</p>
    </div>
  )
}

function SedeCard({ s, isCurrent, onSelect, onToggle, onEdit, onDelete }) {
  const activa = s.estado === 'activa'
  return (
    <div
      className={`card p-0 overflow-hidden relative transition-all ${
        isCurrent
          ? 'ring-2 ring-brand-400 shadow-lg shadow-brand-500/10'
          : activa
            ? 'hover:shadow-md'
            : 'opacity-75'
      }`}
    >
      {/* Franja de identidad: barra lateral del color de la entidad (sin overflow) */}
      <div
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ background: `linear-gradient(180deg, ${s.color} 0%, ${s.color}99 100%)` }}
      />

      <div className="pl-5 pr-5 py-4">
        {/* Cabecera: identidad + estado en flujo normal */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-slate-200 dark:border-slate-700"
            style={
              s.logo_url
                ? { background: '#fff' }
                : { background: `linear-gradient(135deg, ${s.color} 0%, ${s.color}bb 100%)` }
            }
          >
            {s.logo_url ? (
              <img src={s.logo_url} alt={`Logo de ${s.nombre}`} className="w-full h-full object-contain p-0.5" />
            ) : (
              <span className="text-white text-base font-bold">{s.iniciales || initials(s.nombre)}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">
              {s.nombre}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {s.nit ? `NIT ${s.nit}` : 'Sin NIT'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                activa
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <i className={`pi ${activa ? 'pi-check-circle' : 'pi-ban'} text-[10px]`} />
              {activa ? 'Activa' : 'Inactiva'}
            </span>
            {isCurrent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 text-[10px] font-bold">
                <i className="pi pi-map-marker text-[9px]" />
                Entidad actual
              </span>
            )}
          </div>
        </div>

        {/* Descripción */}
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
          {s.descripcion || 'Organización registrada en el sistema'}
        </p>

        {/* Contadores: empleados + contratos */}
        <div className="flex items-center gap-3 mb-3 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-1.5">
            <i className="pi pi-users text-[11px] text-brand-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{s.count_empleados ?? 0}</span>
            <span className="text-[11px] text-slate-400">empleados</span>
          </div>
          <div className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-1.5">
            <i className="pi pi-file text-[11px] text-violet-500" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{s.count_contratos ?? 0}</span>
            <span className="text-[11px] text-slate-400">contratos</span>
          </div>
        </div>

        {/* Teléfono */}
        {s.telefono && (
          <div className="mb-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <Meta icon="pi-phone" text={s.telefono} />
          </div>
        )}

        {/* Footer: fecha + acciones */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {s.created_at ? `Registrada el ${formatDate(s.created_at)}` : 'Sin fecha de registro'}
          </span>
          <div className="flex gap-0.5">
            <Button
              icon="pi pi-map-marker"
              tooltip="Usar como entidad actual"
              tooltipOptions={{ position: 'top' }}
              rounded
              text
              size="small"
              disabled={isCurrent}
              onClick={onSelect}
            />
            <Button
              icon={activa ? 'pi pi-ban' : 'pi pi-play'}
              tooltip={activa ? 'Inactivar' : 'Activar'}
              tooltipOptions={{ position: 'top' }}
              rounded
              text
              size="small"
              onClick={onToggle}
            />
            <Button
              icon="pi pi-pencil"
              tooltip="Editar"
              tooltipOptions={{ position: 'top' }}
              rounded
              text
              size="small"
              onClick={onEdit}
            />
            <Button
              icon="pi pi-trash"
              tooltip="Eliminar"
              tooltipOptions={{ position: 'top' }}
              rounded
              text
              size="small"
              className="p-button-danger"
              onClick={onDelete}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function Meta({ icon, text }) {
  if (!text) return null
  return (
    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 min-w-0">
      <i className={`pi ${icon} text-[10px] text-slate-400 shrink-0`} />
      <span className="truncate">{text}</span>
    </div>
  )
}

function Stat({ icon, label, value, color, compact }) {
  const palette = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  }[color]
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${palette}`}>
        <i className={`pi ${icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </p>
        <p className={`font-bold text-slate-800 dark:text-slate-100 truncate ${compact ? 'text-sm' : 'text-xl'}`}>
          {value}
        </p>
      </div>
    </div>
  )
}

function SedeFormDialog({ visible, mode, form, saving, onHide, onChange, onSave, onRemoveLogo }) {
  const isCreate = mode === 'create'
  const fileInputRef = useRef(null)
  const previewName = form.nombre.trim() || 'Nombre de la entidad'
  const previewIniciales = form.iniciales || initials(previewName)
  const activa = form.estado === 'activa'
  const nombreValido = form.nombre.trim() !== ''
  const logoPreview = form.logoFile ? URL.createObjectURL(form.logoFile) : form.logo || null
  const tieneLogo = !!logoPreview

  const pickLogo = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    onChange({ logoFile: file, logoRemoved: false })
    e.target.value = ''
  }

  return (
    <Dialog
      header={
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-slate-200 dark:border-slate-700"
            style={
              tieneLogo
                ? { background: '#fff' }
                : { background: `linear-gradient(135deg, ${form.color} 0%, ${form.color}bb 100%)` }
            }
          >
            {tieneLogo ? (
                  <img src={logoPreview} alt="Logo de la entidad" className="w-full h-full object-contain p-0.5" />
            ) : (
              <span className="text-white text-base font-bold">{previewIniciales}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-slate-800 dark:text-white leading-tight truncate max-w-[280px]">
              {isCreate ? 'Registrar entidad' : previewName}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isCreate
                ? 'La entidad aparecerá en el selector de organizaciones'
                : 'Editando la entidad seleccionada'}
            </p>
          </div>
        </div>
      }
      visible={visible}
      style={{ width: '820px', maxWidth: 'calc(100vw - 32px)' }}
      onHide={onHide}
      footer={
        <div className="grid grid-cols-[1fr_auto] items-center gap-4 w-full">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Estado de la entidad</span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${
                activa
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <i className={`pi ${activa ? 'pi-check-circle' : 'pi-ban'} text-[10px]`} />
              {activa ? 'Entidad activa' : 'Entidad inactiva'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button label="Cancelar" outlined onClick={onHide} />
            <Button
              label={isCreate ? 'Registrar entidad' : 'Guardar cambios'}
              icon="pi pi-check"
              loading={saving}
              disabled={!nombreValido}
              onClick={onSave}
            />
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-[220px_1fr] gap-6">
        <div className="flex flex-col gap-5">
          <section>
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm border-2 border-slate-200 dark:border-slate-700"
                style={
                  tieneLogo
                    ? { background: '#fff' }
                    : { background: `linear-gradient(135deg, ${form.color} 0%, ${form.color}bb 100%)` }
                }
              >
                {tieneLogo ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <span className="text-white text-2xl font-bold">{previewIniciales}</span>
                )}
              </div>
              <div className="flex flex-col items-center gap-1.5 w-full">
                <Button
                  label="Subir logo"
                  icon="pi pi-upload"
                  size="small"
                  outlined
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                />
                {tieneLogo && (
                  <Button
                    label="Quitar"
                    icon="pi pi-times"
                    size="small"
                    text
                    className="p-button-danger w-full"
                    onClick={async () => {
                      if (!isCreate) await onRemoveLogo()
                      else onChange({ logoFile: null, logo: null, logoRemoved: false })
                    }}
                  />
                )}
                <p className="text-[10px] text-slate-400 text-center">PNG, JPG, WEBP · máx 2 MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                className="hidden"
                onChange={pickLogo}
              />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center">
                <i className="pi pi-power-off text-[10px]" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Estado</span>
            </div>
            <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <span className={`text-xs font-semibold ${activa ? 'text-emerald-600' : 'text-slate-400'}`}>
                {activa ? 'Activa' : 'Inactiva'}
              </span>
              <InputSwitch checked={activa} onChange={(e) => onChange({ estado: e.value ? 'activa' : 'inactiva' })} />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 text-center">
              {activa ? 'Visible para usuarios asignados' : 'Oculta del selector'}
            </p>
          </section>
        </div>

        <div className="flex flex-col gap-5 pt-0.5">
          <section>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-5 h-5 rounded bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center">
                <i className="pi pi-id-card text-[10px]" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Identidad</span>
            </div>
            <div className="space-y-3">
              <Field label="Nombre de la entidad" required>
                <InputText
                  value={form.nombre}
                  onChange={(e) => onChange({ nombre: e.target.value })}
                  className="w-full"
                  placeholder="Ej: Uparsistem Cartagena"
                  invalid={form.nombre.trim() === ''}
                />
                {!nombreValido && <p className="text-[11px] text-red-500 mt-1">Este campo es obligatorio</p>}
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Iniciales">
                  <InputText
                    value={form.iniciales}
                    onChange={(e) => onChange({ iniciales: e.target.value.toUpperCase().slice(0, 4) })}
                    className="w-full"
                    placeholder="UP"
                    maxLength={4}
                  />
                </Field>
                <Field label="Color">
                  <ColorPicker value={form.color} onChange={(e) => onChange({ color: e.value })} style={{ width: '100%', height: '38px' }} />
                </Field>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-5 h-5 rounded bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center">
                <i className="pi pi-align-left text-[10px]" />
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Descripción</span>
            </div>
            <InputTextarea
              value={form.descripcion}
              onChange={(e) => onChange({ descripcion: e.target.value })}
              rows={2}
              className="w-full"
              placeholder="Breve descripción de la organización"
            />
          </section>

          <div className="grid grid-cols-2 gap-4">
            <section>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-5 h-5 rounded bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center">
                  <i className="pi pi-hashtag text-[10px]" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">NIT</span>
              </div>
              <InputText
                value={form.nit}
                onChange={(e) => onChange({ nit: e.target.value })}
                className="w-full"
                placeholder="900.123.456-1"
              />
            </section>
            <section>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-5 h-5 rounded bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center">
                  <i className="pi pi-phone text-[10px]" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Teléfono</span>
              </div>
              <InputText
                value={form.telefono}
                onChange={(e) => onChange({ telefono: e.target.value })}
                className="w-full"
                placeholder="+57 601 555 1000"
              />
            </section>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

function FormSection({ icon, title, hint, children }) {
  return (
    <section>
      <div className="flex items-baseline gap-2 mb-1.5">
        <span className="w-6 h-6 rounded-md bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center shrink-0">
          <i className={`pi ${icon} text-[11px]`} />
        </span>
        <h4 className="text-[12px] font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          {title}
        </h4>
        {hint && <span className="text-[11px] text-slate-400">· {hint}</span>}
      </div>
      <div className="space-y-2 pl-8">{children}</div>
    </section>
  )
}

function Field({ label, required, hint, children }) {
  return (
    <div className="min-w-0">
      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {hint && <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>}
    </div>
  )
}
