import { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Avatar } from 'primereact/avatar'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Dropdown } from 'primereact/dropdown'
import { MultiSelect } from 'primereact/multiselect'
import { InputSwitch } from 'primereact/inputswitch'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { usuariosService } from '../services/usuarios.service.js'

import { useAuth } from '../context/AuthContext.jsx'
import { formatTiempoRelativo, initials } from '../utils/format.js'

const ROLES = [
  { value: 'Administrador', label: 'Administrador' },
  { value: 'Administrativo', label: 'Administrativo' },
]

const ROL_COLORS = {
  Administrador: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-400', badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' },
  Administrativo: { bg: 'bg-brand-50 dark:bg-brand-950/30', text: 'text-brand-600 dark:text-brand-400', badge: 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300' },
}

const emptyForm = () => ({
  name: '',
  email: '',
  password: '',
  role: 'Administrativo',
  sede_ids: [],
  activo: true,
})

function SectionTitle({ icon, title, count }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-6 h-6 rounded-md bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center">
        <i className={`pi ${icon} text-[11px]`} />
      </span>
      <h3 className="text-[12px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">{title}</h3>
      {count !== undefined && (
        <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">{count}</span>
      )}
    </div>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="min-w-0">
      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-slate-400 mt-0.5">{hint}</p>}
    </div>
  )
}

function Stat({ icon, label, value, color }) {
  const palette = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
  }[color] || 'bg-slate-50 text-slate-600'
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${palette}`}>
        <i className={`pi ${icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</p>
        <p className="font-bold text-xl text-slate-800 dark:text-slate-100">{value}</p>
      </div>
    </div>
  )
}

export default function Usuarios() {
  const toast = useRef(null)
  const { user: currentUser } = useAuth()
  const [usuarios, setUsuarios] = useState([])

  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [editVisible, setEditVisible] = useState(false)
  const [editMode, setEditMode] = useState('create')
  const [editForm, setEditForm] = useState(emptyForm())
  const [editingId, setEditingId] = useState(null)
  const [editSaving, setEditSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isSelf = (u) => u.id === currentUser?.id

  const load = async () => {
    setLoading(true)
    try {
      const userList = await usuariosService.list({ todos: true })
      setUsuarios(userList)
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: err.message, life: 5000 })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditMode('create')
    setEditForm(emptyForm())
    setEditingId(null)
    setEditVisible(true)
  }

  const openEdit = (u) => {
    setEditMode('edit')
    setEditingId(u.id)
    setEditForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      sede_ids: u.sede_ids || [],
      activo: u.activo,
    })
    setEditVisible(true)
  }

  const save = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) return
    if (editMode === 'create' && editForm.password.length < 6) return
    setEditSaving(true)
    try {
      const payload = {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        role: editForm.role,
        sede_ids: editForm.sede_ids,
        activo: editForm.activo,
      }
      if (editMode === 'create') {
        payload.password = editForm.password
        await usuariosService.create(payload)
        toast.current?.show({ severity: 'success', summary: 'Usuario creado', life: 3000 })
      } else {
        if (editForm.password) payload.password = editForm.password
        await usuariosService.update(editingId, payload)
        toast.current?.show({ severity: 'success', summary: 'Usuario actualizado', life: 3000 })
      }
      setEditVisible(false)
      await load()
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: err.response?.data?.error?.message || err.message, life: 5000 })
    } finally {
      setEditSaving(false)
    }
  }

  const toggleActivo = async (u) => {
    try {
      await usuariosService.update(u.id, { activo: !u.activo })
      toast.current?.show({ severity: 'success', summary: u.activo ? 'Usuario desactivado' : 'Usuario activado', life: 3000 })
      await load()
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: err.response?.data?.error?.message || err.message, life: 5000 })
    }
  }

  const remove = (u) => {
    confirmDialog({
      message: `¿Eliminar a "${u.name}"? Esta acción no se puede deshacer.`,
      header: 'Eliminar usuario',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await usuariosService.delete(u.id)
          toast.current?.show({ severity: 'success', summary: 'Usuario eliminado', life: 3000 })
          await load()
        } catch (err) {
          toast.current?.show({ severity: 'error', summary: 'Error', detail: err.response?.data?.error?.message || err.message, life: 5000 })
        }
      },
    })
  }

  const filtered = search
    ? usuarios.filter((u) =>
        [u.name, u.email, u.role].some((v) => v.toLowerCase().includes(search.toLowerCase()))
      )
    : usuarios

  const activos = filtered.filter((u) => u.activo)
  const inactivos = filtered.filter((u) => !u.activo)
  const byRole = (r) => filtered.filter((u) => u.role === r)

  const rolesMap = ROLES.map((r) => ({
    ...r,
    items: byRole(r.value),
    count: byRole(r.value).length,
  }))

  const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  const formValid = editForm.name.trim() && isValidEmail(editForm.email) && (editMode === 'edit' || editForm.password.length >= 6)

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <PageHeader
        icon="pi-user-edit"
        title="Usuarios y Roles"
        subtitle={`${usuarios.length} usuarios registrados`}
        actions={
          <Button label="Nuevo usuario" icon="pi pi-plus" severity="info" size="small" onClick={openCreate} />
        }
      />

      <div className="card p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat icon="pi-users" label="Total" value={usuarios.length} color="brand" />
          <Stat icon="pi-check-circle" label="Activos" value={usuarios.filter((u) => u.activo).length} color="emerald" />
          <Stat icon="pi-shield" label="Administradores" value={byRole('Administrador').length} color="rose" />
          <Stat icon="pi-briefcase" label="Administrativos" value={byRole('Administrativo').length} color="amber" />
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[12px]" />
            <InputText
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email o rol..."
              className="w-full pl-8 text-sm"
            />
          </div>
          <Button icon="pi pi-refresh" outlined size="small" onClick={load} loading={loading} />
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <i className="pi pi-spin pi-spinner text-2xl" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="pi-user-edit" title="Sin usuarios" description="Crea el primer usuario con el botón 'Nuevo usuario'." />
        ) : (
          <div className="space-y-6">
            {rolesMap.map(({ value: rol, label, items, count }) =>
              items.length === 0 ? null : (
                <section key={rol}>
                  <SectionTitle icon={rol === 'Administrador' ? 'pi-shield' : 'pi-briefcase'} title={label} count={count} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {items.map((u) => {
                      const colors = ROL_COLORS[u.role]
                      return (
                        <div
                          key={u.id}
                          className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="absolute top-3 right-3 flex gap-1">
                            {isSelf(u) && (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 dark:bg-brand-900/40 px-1.5 py-0.5 rounded-full">Tú</span>
                            )}
                            {u.activo ? (
                              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" title="Activo" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-slate-300 mt-1.5" title="Inactivo" />
                            )}
                          </div>

                          <div className="flex items-start gap-3 mb-3">
                            <Avatar
                              label={initials(u.name)}
                              shape="circle"
                              className="bg-gradient-to-br from-brand-400 to-brand-600 text-white"
                              size="large"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm text-slate-800 dark:text-white leading-snug">{u.name}</p>
                              <p className="text-[11px] text-slate-500 leading-snug">{u.email}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors.badge}`}>
                              {u.role}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 mb-3 min-h-[20px]">
                            {u.sedes === null ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Acceso total</span>
                            ) : u.sedes?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {u.sedes.map((s) => (
                                  <span key={s.id} className="text-[10px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{s.nombre}</span>
                                ))}
                              </div>
                            ) : (
                              <span className="italic">Sin entidades asignadas</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] text-slate-400">
                              {u.ultimo_acceso ? formatTiempoRelativo(u.ultimo_acceso) : 'Nunca accede'}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                icon={u.activo ? 'pi pi-ban' : 'pi pi-play'}
                                tooltip={u.activo ? 'Desactivar' : 'Activar'}
                                tooltipOptions={{ position: 'top' }}
                                rounded
                                text
                                size="small"
                                disabled={isSelf(u)}
                                onClick={() => toggleActivo(u)}
                              />
                              <Button
                                icon="pi pi-pencil"
                                tooltip="Editar"
                                tooltipOptions={{ position: 'top' }}
                                rounded
                                text
                                size="small"
                                onClick={() => openEdit(u)}
                              />
                              <Button
                                icon="pi pi-trash"
                                tooltip="Eliminar"
                                tooltipOptions={{ position: 'top' }}
                                rounded
                                text
                                size="small"
                                severity="danger"
                                disabled={isSelf(u)}
                                onClick={() => remove(u)}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </section>
              )
            )}
          </div>
        )}
      </div>

      <Dialog
        header={
          <div className="flex items-center gap-3">
            <Avatar
              label={editForm.name ? initials(editForm.name) : '?'}
              shape="circle"
              className="bg-gradient-to-br from-brand-400 to-brand-600 text-white"
              size="large"
            />
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-slate-800 dark:text-white truncate max-w-[240px]">
                {editMode === 'create' ? 'Nuevo usuario' : editForm.name}
              </p>
              <p className="text-[11px] text-slate-500">
                {editMode === 'create' ? 'Complete los datos del nuevo usuario' : 'Editando datos del usuario'}
              </p>
            </div>
          </div>
        }
        visible={editVisible}
        style={{ width: '820px', maxWidth: 'calc(100vw - 32px)' }}
        onHide={() => setEditVisible(false)}
        footer={
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 w-full">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${editForm.activo ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
              <i className={`pi ${editForm.activo ? 'pi-check-circle' : 'pi-ban'} text-[10px]`} />
              {editForm.activo ? 'Usuario activo' : 'Usuario inactivo'}
            </span>
            <div className="flex gap-2">
              <Button label="Cancelar" outlined onClick={() => setEditVisible(false)} disabled={editSaving} />
              <Button
                label={editSaving ? 'Guardando...' : editMode === 'create' ? 'Crear usuario' : 'Guardar cambios'}
                icon="pi pi-check"
                loading={editSaving}
                disabled={!formValid}
                onClick={save}
              />
            </div>
          </div>
        }
      >
        <style>{`
          .usuario-ms-chips .p-multiselect-label .p-multiselect-item {
            white-space: normal !important;
          }
          .usuario-ms-chips .p-multiselect-label {
            flex-wrap: wrap !important;
            min-height: 38px;
          }
          .usuario-ms-chips .p-multiselect-label .p-chip {
            max-width: none !important;
            white-space: normal !important;
          }
          .usuario-ms-chips .p-multiselect-label .p-chip span {
            text-overflow: unset !important;
            overflow: visible !important;
            white-space: normal !important;
          }
        `}</style>
        <div className="grid grid-cols-[260px_1fr] gap-6">
          <div className="flex flex-col gap-5">
            <section>
              <div className="flex flex-col items-center gap-3">
                <Avatar
                  label={editForm.name ? initials(editForm.name) : '?'}
                  shape="circle"
                  className="bg-gradient-to-br from-brand-400 to-brand-600 text-white"
                  size="xlarge"
                />
                <p className="text-xs text-slate-500 text-center">
                  {editForm.email || 'email@ejemplo.com'}
                </p>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-5 h-5 rounded bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center">
                  <i className="pi pi-shield text-[10px]" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Rol</span>
              </div>
              <Dropdown
                value={editForm.role}
                options={ROLES}
                onChange={(e) => setEditForm({ ...editForm, role: e.value })}
                className="w-full"
              />
            </section>

            {editMode === 'edit' && (
              <section>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center">
                    <i className="pi pi-power-off text-[10px]" />
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Estado</span>
                </div>
                <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className={`text-xs font-semibold ${editForm.activo ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {editForm.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <InputSwitch checked={editForm.activo} onChange={(e) => setEditForm({ ...editForm, activo: e.value })} />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                  {editForm.activo ? 'Puede iniciar sesión' : 'No puede iniciar sesión'}
                </p>
              </section>
            )}
          </div>

          <div className="flex flex-col gap-5 pt-0.5">
            <section>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-5 h-5 rounded bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center">
                  <i className="pi pi-user text-[10px]" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">Datos personales</span>
              </div>
              <div className="space-y-3">
                <Field label="Nombre completo" required>
                  <InputText
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full"
                    placeholder="Ej: Laura Pérez"
                  />
                </Field>
                <Field label="Correo electrónico" required hint="Este email será su usuario de acceso">
                  <InputText
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full"
                    placeholder="ej: laura@empresa.com"
                  />
                </Field>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-5 h-5 rounded bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center">
                  <i className="pi pi-lock text-[10px]" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  {editMode === 'create' ? 'Contraseña' : 'Nueva contraseña'}
                </span>
              </div>
              <Field hint={editMode === 'edit' ? 'Dejar vacío para no cambiar la contraseña actual' : 'Mínimo 6 caracteres'}>
                <div className="relative flex items-center">
                  <InputText
                    type={showPassword ? 'text' : 'password'}
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full pr-10"
                    placeholder={editMode === 'create' ? 'Mínimo 6 caracteres' : 'Nueva contraseña (opcional)'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    <i className={`pi ${showPassword ? 'pi-eye-slash' : 'pi-eye'}`} />
                  </button>
                </div>
              </Field>
            </section>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
