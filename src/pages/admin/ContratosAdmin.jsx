import { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { Calendar } from 'primereact/calendar'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import PageHeader from '../../components/PageHeader.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { contratosService } from '../../services/contratos.service.js'
import { empleadosService } from '../../services/empleados.service.js'
import { formatCurrency, formatDate } from '../../utils/format.js'

const TIPOS = [
  { value: 'fijo', label: 'Término fijo' },
  { value: 'indefinido', label: 'Término indefinido' },
  { value: 'prestacion', label: 'Prestación de servicios' },
  { value: 'aprendizaje', label: 'Aprendizaje' },
]

const ESTADOS = [
  { value: 'activo', label: 'Activo' },
  { value: 'terminado', label: 'Terminado' },
  { value: 'suspendido', label: 'Suspendido' },
]

/**
 * ContratosAdmin — ITERACIÓN 4
 *
 * UI CRUD para gestión de contratos. La fuente de verdad ahora es
 * la tabla `contratos` (Iter 4), no el array hardcoded de antes.
 *
 * Filtros:
 *   - Por empleado
 *   - Por estado
 *
 * El wizard /documentos (FASE 6) consumirá esta misma fuente via
 * `contratosService.list({ empleadoId })` para resolver origen=contrato.
 */
export default function ContratosAdmin() {
  const toast = useRef(null)
  const [contratos, setContratos] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterEmpleado, setFilterEmpleado] = useState(null)
  const [filterEstado, setFilterEstado] = useState(null)
  const [editVisible, setEditVisible] = useState(false)
  const [editMode, setEditMode] = useState('create')
  const [editForm, setEditForm] = useState(emptyForm())
  const [editSaving, setEditSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await contratosService.list({
        empleadoId: filterEmpleado,
        estado: filterEstado,
      })
      setContratos(data.contratos || [])
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

  const loadAux = async () => {
    try {
      const emps = await empleadosService.list().catch(() => ({ empleados: [] }))
      setEmpleados(emps.empleados || [])
    } catch {
      // Silenciar — los filtros igual funcionan
    }
  }

  useEffect(() => {
    load()
    loadAux()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEmpleado, filterEstado])

  const openCreate = () => {
    setEditMode('create')
    setEditForm({ ...emptyForm(), empleado_id: filterEmpleado })
    setEditVisible(true)
  }

  const openEdit = (contrato) => {
    setEditMode('edit')
    setEditForm({
      id: contrato.id,
      empleado_id: contrato.empleado_id,
      sede_id: contrato.sede_id,
      tipo: contrato.tipo,
      fecha_inicio: contrato.fecha_inicio ? new Date(contrato.fecha_inicio) : null,
      fecha_fin: contrato.fecha_fin ? new Date(contrato.fecha_fin) : null,
      duracion: contrato.duracion || '',
      salario: contrato.salario,
      jornada: contrato.jornada,
      periodo_prueba: contrato.periodo_prueba || '',
      auxilio: contrato.auxilio,
      centro_costo: contrato.centro_costo || '',
      clausulas: contrato.clausulas || '',
      estado: contrato.estado,
    })
    setEditVisible(true)
  }

  const handleSave = async () => {
    if (!editForm.empleado_id || !editForm.tipo || !editForm.fecha_inicio) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Datos incompletos',
        detail: 'Empleado, tipo y fecha de inicio son obligatorios',
        life: 4000,
      })
      return
    }

    setEditSaving(true)
    try {
      const payload = {
        empleado_id: editForm.empleado_id,
        sede_id: editForm.sede_id || null,
        tipo: editForm.tipo,
        fecha_inicio: editForm.fecha_inicio ? toISODate(editForm.fecha_inicio) : null,
        fecha_fin: editForm.fecha_fin ? toISODate(editForm.fecha_fin) : null,
        duracion: editForm.duracion || null,
        salario: editForm.salario || null,
        jornada: editForm.jornada || null,
        periodo_prueba: editForm.periodo_prueba || null,
        auxilio: editForm.auxilio || null,
        centro_costo: editForm.centro_costo || null,
        clausulas: editForm.clausulas || null,
        estado: editForm.estado,
      }

      if (editMode === 'create') {
        await contratosService.create(payload)
        toast.current?.show({ severity: 'success', summary: 'Contrato creado', life: 3000 })
      } else {
        await contratosService.update(editForm.id, payload)
        toast.current?.show({ severity: 'success', summary: 'Contrato actualizado', life: 3000 })
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

  const handleTerminar = (contrato) => {
    confirmDialog({
      message: `¿Marcar como terminado el contrato de ${empleadoNombre(contrato.empleado_id)}?`,
      header: 'Terminar contrato',
      icon: 'pi pi-check-circle',
      acceptLabel: 'Sí, terminar',
      rejectLabel: 'Cancelar',
      accept: async () => {
        try {
          await contratosService.terminar(contrato.id)
          toast.current?.show({ severity: 'success', summary: 'Contrato terminado', life: 3000 })
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

  const handleDelete = (contrato) => {
    confirmDialog({
      message: `¿Eliminar permanentemente el contrato #${contrato.id}? Esta acción no se puede deshacer.`,
      header: 'Eliminar contrato',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await contratosService.delete(contrato.id)
          toast.current?.show({ severity: 'success', summary: 'Contrato eliminado', life: 3000 })
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

  const empleadoNombre = (id) => empleados.find((e) => e.id === id)?.nombre || `Empleado #${id}`

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <PageHeader
        icon="pi-file-edit"
        title="Contratos"
        subtitle="Fuente de verdad del origen=contrato. Consumido por el motor y el wizard."
        actions={
          <Button
            label="Nuevo contrato"
            icon="pi pi-plus"
            severity="info"
            onClick={openCreate}
          />
        }
      />

      {/* ── Filtros ── */}
      <div className="card p-3 mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
            Empleado
          </label>
          <Dropdown
            value={filterEmpleado}
            options={[{ value: null, label: 'Todos' }, ...empleados.map((e) => ({ value: e.id, label: e.nombre }))]}
            onChange={(e) => setFilterEmpleado(e.value)}
            placeholder="Todos"
            className="w-64"
            filter
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
            Estado
          </label>
          <Dropdown
            value={filterEstado}
            options={[{ value: null, label: 'Todos' }, ...ESTADOS]}
            onChange={(e) => setFilterEstado(e.value)}
            placeholder="Todos"
            className="w-48"
          />
        </div>
        <Button
          icon="pi pi-refresh"
          label="Recargar"
          outlined
          size="small"
          onClick={load}
          disabled={loading}
          className="ml-auto"
        />
      </div>

      {/* ── Tabla de contratos ── */}
      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {contratos.length} contrato{contratos.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <i className="pi pi-spin pi-spinner text-2xl" />
          </div>
        ) : contratos.length === 0 ? (
          <EmptyState
            icon="pi-file"
            title="Sin contratos"
            description="Crea el primer contrato con el botón 'Nuevo contrato'."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold">Empleado</th>
                  <th className="px-4 py-2 text-left font-semibold">Tipo</th>
                  <th className="px-4 py-2 text-left font-semibold">Fechas</th>
                  <th className="px-4 py-2 text-right font-semibold">Salario</th>
                  <th className="px-4 py-2 text-center font-semibold">Jornada</th>
                  <th className="px-4 py-2 text-left font-semibold">Estado</th>
                  <th className="px-4 py-2 text-right font-semibold w-44">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {contratos.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {empleadoNombre(c.empleado_id)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">#{c.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Tag value={c.tipo} severity={tipoSeverity(c.tipo)} className="text-[10px]" />
                      {c.duracion && (
                        <div className="text-[10px] text-slate-500 mt-0.5">{c.duracion}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="text-slate-700 dark:text-slate-200">
                        <i className="pi pi-calendar-plus text-emerald-500 mr-1" />
                        {formatDate(c.fecha_inicio)}
                      </div>
                      {c.fecha_fin && (
                        <div className="text-slate-500 mt-0.5">
                          <i className="pi pi-calendar-minus text-rose-500 mr-1" />
                          {formatDate(c.fecha_fin)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-sm">
                      {c.salario ? formatCurrency(c.salario) : <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-slate-600 dark:text-slate-400">
                      {c.jornada ? `${c.jornada} hrs` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Tag
                        value={c.estado}
                        severity={estadoSeverity(c.estado)}
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
                        {c.estado === 'activo' && (
                          <Button
                            icon="pi pi-check-circle"
                            size="small"
                            text
                            severity="success"
                            onClick={() => handleTerminar(c)}
                            tooltip="Terminar contrato"
                            tooltipOptions={{ position: 'left' }}
                          />
                        )}
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
            <span>{editMode === 'create' ? 'Nuevo contrato' : 'Editar contrato'}</span>
          </div>
        }
        modal
        style={{ width: 'min(720px, 96vw)' }}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Empleado <span className="text-rose-500">*</span>
              </label>
              <Dropdown
                value={editForm.empleado_id}
                options={empleados.map((e) => ({ value: e.id, label: e.nombre }))}
                onChange={(e) => setEditForm((f) => ({ ...f, empleado_id: e.value }))}
                placeholder="Seleccionar empleado"
                className="w-full"
                filter
                disabled={editMode === 'edit'}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Tipo <span className="text-rose-500">*</span>
              </label>
              <Dropdown
                value={editForm.tipo}
                options={TIPOS}
                onChange={(e) => setEditForm((f) => ({ ...f, tipo: e.value }))}
                className="w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Fecha inicio <span className="text-rose-500">*</span>
              </label>
              <Calendar
                value={editForm.fecha_inicio}
                onChange={(e) => setEditForm((f) => ({ ...f, fecha_inicio: e.value }))}
                dateFormat="yy-mm-dd"
                className="w-full"
                showIcon
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Fecha fin {editForm.tipo !== 'indefinido' && <span className="text-rose-500">*</span>}
              </label>
              <Calendar
                value={editForm.fecha_fin}
                onChange={(e) => setEditForm((f) => ({ ...f, fecha_fin: e.value }))}
                dateFormat="yy-mm-dd"
                className="w-full"
                showIcon
                disabled={editForm.tipo === 'indefinido'}
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Salario
              </label>
              <InputNumber
                value={editForm.salario}
                onValueChange={(e) => setEditForm((f) => ({ ...f, salario: e.value }))}
                mode="currency"
                currency="COP"
                locale="es-CO"
                className="w-full"
                placeholder="0"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Jornada (hrs/sem)
              </label>
              <InputNumber
                value={editForm.jornada}
                onValueChange={(e) => setEditForm((f) => ({ ...f, jornada: e.value }))}
                className="w-full"
                min={0}
                max={168}
                showButtons
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Auxilio
              </label>
              <InputNumber
                value={editForm.auxilio}
                onValueChange={(e) => setEditForm((f) => ({ ...f, auxilio: e.value }))}
                mode="currency"
                currency="COP"
                locale="es-CO"
                className="w-full"
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Duración (texto libre)
              </label>
              <InputText
                value={editForm.duracion}
                onChange={(e) => setEditForm((f) => ({ ...f, duracion: e.target.value }))}
                placeholder="ej: 12 meses"
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Periodo de prueba
              </label>
              <InputText
                value={editForm.periodo_prueba}
                onChange={(e) => setEditForm((f) => ({ ...f, periodo_prueba: e.target.value }))}
                placeholder="ej: 2 meses"
                className="w-full text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Centro de costo
              </label>
              <InputText
                value={editForm.centro_costo}
                onChange={(e) => setEditForm((f) => ({ ...f, centro_costo: e.target.value }))}
                className="w-full text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Estado
              </label>
              <Dropdown
                value={editForm.estado}
                options={ESTADOS}
                onChange={(e) => setEditForm((f) => ({ ...f, estado: e.value }))}
                className="w-full"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Cláusulas adicionales
            </label>
            <InputTextarea
              value={editForm.clausulas}
              onChange={(e) => setEditForm((f) => ({ ...f, clausulas: e.target.value }))}
              rows={3}
              className="w-full text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          <Button label="Cancelar" outlined size="small" onClick={() => setEditVisible(false)} disabled={editSaving} />
          <Button
            label={editSaving ? 'Guardando...' : editMode === 'create' ? 'Crear contrato' : 'Guardar'}
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
    empleado_id: null,
    sede_id: null,
    tipo: 'fijo',
    fecha_inicio: null,
    fecha_fin: null,
    duracion: '',
    salario: null,
    jornada: null,
    periodo_prueba: '',
    auxilio: null,
    centro_costo: '',
    clausulas: '',
    estado: 'activo',
  }
}

function toISODate(d) {
  if (!d) return null
  if (typeof d === 'string') return d
  const date = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(date.getTime())) return null
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function tipoSeverity(tipo) {
  return {
    fijo: 'info',
    indefinido: 'success',
    prestacion: 'warning',
    aprendizaje: 'help',
  }[tipo] ?? 'secondary'
}

function estadoSeverity(estado) {
  return {
    activo: 'success',
    terminado: 'secondary',
    suspendido: 'warning',
  }[estado] ?? 'secondary'
}
