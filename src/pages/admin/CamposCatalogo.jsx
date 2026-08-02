import { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { InputNumber } from 'primereact/inputnumber'
import { Dropdown } from 'primereact/dropdown'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import PageHeader from '../../components/PageHeader.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { camposCatalogoService } from '../../services/camposCatalogo.service.js'
import { ORIGENES, TIPOS_DATO, getOrigenLabel } from '../../components/admin/catalog'

/**
 * CamposCatalogo — ITERACIÓN 3 · FASE 3 · Motor Documental Visual
 *
 * CRUD admin para gestionar el catálogo declarativo de campos.
 * El Diseñador Visual consume este catálogo via `/api/campos-catalogo?origen=X`.
 *
 * Layout:
 *   - Header con filtros por origen
 *   - Stats por origen (badge con count)
 *   - Tabla con todos los campos del origen seleccionado
 *   - Modal de edición: nombre_campo, label, tipo_dato, funcion_sugerida,
 *     opciones (JSON array, solo para enum), descripcion, orden, estado
 */
export default function CamposCatalogo() {
  const toast = useRef(null)
  const [origenFilter, setOrigenFilter] = useState('empleado')
  const [campos, setCampos] = useState([])
  const [loading, setLoading] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [editMode, setEditMode] = useState('create') // 'create' | 'edit'
  const [editForm, setEditForm] = useState(emptyForm())
  const [editSaving, setEditSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await camposCatalogoService.list(origenFilter, true)  // includeInactive=true para admin
      setCampos(data.campos || [])
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
  }, [origenFilter])

  const openCreate = () => {
    setEditMode('create')
    setEditForm({ ...emptyForm(), origen: origenFilter })
    setEditVisible(true)
  }

  const openEdit = (campo) => {
    setEditMode('edit')
    setEditForm({
      id: campo.id,
      origen: campo.origen,
      nombre_campo: campo.nombre_campo,
      label: campo.label,
      tipo_dato: campo.tipo_dato,
      funcion_sugerida: campo.funcion_sugerida || '',
      opciones: Array.isArray(campo.opciones) ? campo.opciones : [],
      opcionesText: Array.isArray(campo.opciones) ? campo.opciones.join(', ') : '',
      descripcion: campo.descripcion || '',
      orden: campo.orden,
      estado: campo.estado,
    })
    setEditVisible(true)
  }

  const handleSave = async () => {
    // Validación cliente mínima (backend valida de nuevo)
    if (!editForm.origen || !editForm.nombre_campo || !editForm.label) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Datos incompletos',
        detail: 'Origen, nombre_campo y label son obligatorios',
        life: 4000,
      })
      return
    }

    setEditSaving(true)
    try {
      const payload = {
        origen: editForm.origen,
        nombre_campo: editForm.nombre_campo.trim().toLowerCase(),
        label: editForm.label.trim(),
        tipo_dato: editForm.tipo_dato,
        funcion_sugerida: editForm.funcion_sugerida || null,
        opciones: editForm.tipo_dato === 'enum'
          ? editForm.opcionesText.split(',').map((s) => s.trim()).filter(Boolean)
          : null,
        descripcion: editForm.descripcion || null,
        orden: editForm.orden || 0,
        estado: editForm.estado,
      }

      if (editMode === 'create') {
        await camposCatalogoService.create(payload)
        toast.current?.show({ severity: 'success', summary: 'Campo creado', life: 3000 })
      } else {
        await camposCatalogoService.update(editForm.id, payload)
        toast.current?.show({ severity: 'success', summary: 'Campo actualizado', life: 3000 })
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

  const handleDelete = (campo) => {
    confirmDialog({
      message: `¿Eliminar "${campo.label}" (${campo.nombre_campo})? Esta acción no se puede deshacer.`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await camposCatalogoService.delete(campo.id)
          toast.current?.show({ severity: 'success', summary: 'Campo eliminado', life: 3000 })
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

  const handleToggleEstado = async (campo) => {
    try {
      if (campo.estado === 'activo') {
        await camposCatalogoService.inactivar(campo.id)
        toast.current?.show({ severity: 'info', summary: 'Campo inactivado', life: 3000 })
      } else {
        await camposCatalogoService.activar(campo.id)
        toast.current?.show({ severity: 'success', summary: 'Campo reactivado', life: 3000 })
      }
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

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <PageHeader
        icon="pi-database"
        title="Catálogo de Campos"
        subtitle="Origenes declarativos del motor. Cambios acá se reflejan en el Diseñador."
        actions={
          <Button
            label="Nuevo campo"
            icon="pi pi-plus"
            severity="info"
            onClick={openCreate}
            disabled={!origenFilter}
          />
        }
      />

      {/* ── Filtros por origen ── */}
      <div className="card p-3 mb-4 flex flex-wrap gap-2">
        {ORIGENES.filter((o) => o.hasCatalog).map((o) => (
          <button
            key={o.value}
            onClick={() => setOrigenFilter(o.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              origenFilter === o.value
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* ── Tabla de campos ── */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              Campos de {getOrigenLabel(origenFilter)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {campos.length} campo{campos.length !== 1 ? 's' : ''} ({campos.filter((c) => c.estado === 'activo').length} activos)
            </p>
          </div>
          <Button
            icon="pi pi-refresh"
            size="small"
            text
            onClick={load}
            disabled={loading}
          />
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <i className="pi pi-spin pi-spinner text-2xl" />
          </div>
        ) : campos.length === 0 ? (
          <EmptyState
            icon="pi-inbox"
            title="Sin campos"
            description={`No hay campos registrados para ${getOrigenLabel(origenFilter)}. Crea el primero con "Nuevo campo".`}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Campo</th>
                  <th className="px-4 py-2 text-left font-semibold">Tipo</th>
                  <th className="px-4 py-2 text-left font-semibold">Función sugerida</th>
                  <th className="px-4 py-2 text-left font-semibold">Opciones enum</th>
                  <th className="px-4 py-2 text-left font-semibold">Estado</th>
                  <th className="px-4 py-2 text-right font-semibold w-32">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {campos.map((c) => (
                  <tr key={c.id} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors ${c.estado === 'inactivo' ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs text-slate-700 dark:text-slate-200">{c.nombre_campo}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{c.label}</div>
                      {c.descripcion && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-0.5">{c.descripcion}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Tag value={c.tipo_dato} severity={tipoSeverity(c.tipo_dato)} className="text-[10px]" />
                    </td>
                    <td className="px-4 py-3">
                      {c.funcion_sugerida ? (
                        <code className="text-xs font-mono text-violet-700 dark:text-violet-300">{c.funcion_sugerida}</code>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {Array.isArray(c.opciones) && c.opciones.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {c.opciones.slice(0, 3).map((opt, i) => (
                            <Tag key={i} value={opt} severity="secondary" className="text-[10px]" />
                          ))}
                          {c.opciones.length > 3 && (
                            <span className="text-[10px] text-slate-400">+{c.opciones.length - 3} más</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Tag
                        value={c.estado === 'activo' ? 'activo' : 'inactivo'}
                        severity={c.estado === 'activo' ? 'success' : 'secondary'}
                        className="text-[10px]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          icon="pi pi-pencil"
                          size="small"
                          text
                          onClick={() => openEdit(c)}
                          tooltip="Editar"
                          tooltipOptions={{ position: 'left' }}
                        />
                        <Button
                          icon={c.estado === 'activo' ? 'pi pi-eye-slash' : 'pi pi-eye'}
                          size="small"
                          text
                          severity={c.estado === 'activo' ? 'secondary' : 'success'}
                          onClick={() => handleToggleEstado(c)}
                          tooltip={c.estado === 'activo' ? 'Inactivar' : 'Reactivar'}
                          tooltipOptions={{ position: 'left' }}
                        />
                        <Button
                          icon="pi pi-trash"
                          size="small"
                          text
                          severity="danger"
                          onClick={() => handleDelete(c)}
                          tooltip="Eliminar (hard delete)"
                          tooltipOptions={{ position: 'left' }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal de edición ── */}
      <Dialog
        visible={editVisible}
        onHide={() => !editSaving && setEditVisible(false)}
        header={
          <div className="flex items-center gap-2">
            <i className={`pi ${editMode === 'create' ? 'pi-plus-circle' : 'pi-pencil'} text-brand-600`} />
            <span>{editMode === 'create' ? 'Nuevo campo' : 'Editar campo'}</span>
          </div>
        }
        modal
        style={{ width: 'min(640px, 96vw)' }}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Origen <span className="text-rose-500">*</span>
              </label>
              <Dropdown
                value={editForm.origen}
                options={ORIGENES.filter((o) => o.hasCatalog)}
                onChange={(e) => setEditForm((f) => ({ ...f, origen: e.value }))}
                disabled={editMode === 'edit'}  // no se cambia origen en edit
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Tipo de dato <span className="text-rose-500">*</span>
              </label>
              <Dropdown
                value={editForm.tipo_dato}
                options={TIPOS_DATO}
                onChange={(e) => setEditForm((f) => ({ ...f, tipo_dato: e.value }))}
                className="w-full"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Nombre técnico <span className="text-rose-500">*</span>
              <span className="text-[10px] text-slate-400 font-normal ml-2">(snake_case)</span>
            </label>
            <InputText
              value={editForm.nombre_campo}
              onChange={(e) => setEditForm((f) => ({ ...f, nombre_campo: e.target.value }))}
              placeholder="ej: estado_civil"
              className="w-full font-mono text-sm"
              disabled={editMode === 'edit'}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Label visible <span className="text-rose-500">*</span>
            </label>
            <InputText
              value={editForm.label}
              onChange={(e) => setEditForm((f) => ({ ...f, label: e.target.value }))}
              placeholder="ej: Estado Civil"
              className="w-full"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Función sugerida (opcional)
              <span className="text-[10px] text-slate-400 font-normal ml-2">(nombre del FunctionRegistry)</span>
            </label>
            <InputText
              value={editForm.funcion_sugerida}
              onChange={(e) => setEditForm((f) => ({ ...f, funcion_sugerida: e.target.value }))}
              placeholder="ej: numero_a_letras"
              className="w-full font-mono text-sm"
            />
          </div>
          {editForm.tipo_dato === 'enum' && (
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Opciones del enum <span className="text-rose-500">*</span>
                <span className="text-[10px] text-slate-400 font-normal ml-2">(separadas por coma)</span>
              </label>
              <InputText
                value={editForm.opcionesText}
                onChange={(e) => setEditForm((f) => ({ ...f, opcionesText: e.target.value }))}
                placeholder="Soltero/a, Casado/a, Unión Libre, Divorciado/a"
                className="w-full text-sm"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Descripción
            </label>
            <InputTextarea
              value={editForm.descripcion}
              onChange={(e) => setEditForm((f) => ({ ...f, descripcion: e.target.value }))}
              rows={2}
              className="w-full text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Orden
              </label>
              <InputNumber
                value={editForm.orden}
                onValueChange={(e) => setEditForm((f) => ({ ...f, orden: e.value ?? 0 }))}
                className="w-full"
                showButtons
                min={0}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Estado
              </label>
              <Dropdown
                value={editForm.estado}
                options={[
                  { value: 'activo', label: 'Activo' },
                  { value: 'inactivo', label: 'Inactivo' },
                ]}
                onChange={(e) => setEditForm((f) => ({ ...f, estado: e.value }))}
                className="w-full"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          <Button label="Cancelar" outlined size="small" onClick={() => setEditVisible(false)} disabled={editSaving} />
          <Button
            label={editSaving ? 'Guardando...' : editMode === 'create' ? 'Crear campo' : 'Guardar cambios'}
            icon={editSaving ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
            severity="success"
            size="small"
            onClick={handleSave}
            disabled={editSaving}
          />
        </div>
      </Dialog>
    </div>
  )
}

function emptyForm() {
  return {
    id: null,
    origen: 'empleado',
    nombre_campo: '',
    label: '',
    tipo_dato: 'string',
    funcion_sugerida: '',
    opciones: [],
    opcionesText: '',
    descripcion: '',
    orden: 0,
    estado: 'activo',
  }
}

function tipoSeverity(tipo) {
  return {
    string: 'secondary',
    date: 'info',
    number: 'warning',
    currency: 'success',
    enum: 'help',
    uuid: 'contrast',
  }[tipo] ?? 'secondary'
}
