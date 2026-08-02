import { useEffect, useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Avatar } from 'primereact/avatar'
import { Toast } from 'primereact/toast'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import HorarioStats from '../components/HorarioStats.jsx'
import HorarioEditor from '../components/HorarioEditor.jsx'
import { empleadosService } from '../services/empleados.service.js'
import { horariosService } from '../services/horarios.service.js'
import { useEntidad } from '../context/EntidadContext.jsx'
import { formatTiempoRelativo, initials } from '../utils/format.js'

export default function Horarios() {
  const toast = useRef(null)
  const { currentEntidad } = useEntidad()
  const [empleados, setEmpleados] = useState([])
  const [loadingEmp, setLoadingEmp] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [horario, setHorario] = useState(null)
  const [bloques, setBloques] = useState([])
  const [stats, setStats] = useState(null)
  const [loadingHorario, setLoadingHorario] = useState(false)
  const [bloqueSaving, setBloqueSaving] = useState(false)

  const loadEmpleados = async () => {
    if (!currentEntidad) return
    setLoadingEmp(true)
    try {
      const list = await empleadosService.list(currentEntidad.id)
      setEmpleados(list)
    } catch {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los empleados', life: 5000 })
    } finally {
      setLoadingEmp(false)
    }
  }

  useEffect(() => { loadEmpleados() }, [currentEntidad])

  const loadHorario = async (empId) => {
    setLoadingHorario(true)
    try {
      const data = await horariosService.getHorario(empId)
      setHorario(data)
      setBloques(data?.bloques || [])
      setStats(data?.stats || null)
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: e.message, life: 5000 })
    } finally {
      setLoadingHorario(false)
    }
  }

  const selectEmpleado = async (emp) => {
    setSelected(emp)
    await loadHorario(emp.id)
  }

  const handleSaveHeader = async (headerData) => {
    if (!selected || !currentEntidad) return
    try {
      const data = await horariosService.saveHorario(selected.id, { ...headerData, entidadId: currentEntidad.id })
      setHorario(data)
      setBloques(data?.bloques || [])
      setStats(data?.stats || null)
      toast.current?.show({ severity: 'success', summary: 'Horario guardado', life: 3000 })
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: e.response?.data?.error?.message || e.message, life: 5000 })
    }
  }

  const handleCrearBloque = async (form) => {
    if (!selected) return
    setBloqueSaving(true)
    try {
      await horariosService.crearBloque(selected.id, form)
      await loadHorario(selected.id)
      toast.current?.show({ severity: 'success', summary: 'Bloque agregado', life: 3000 })
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: e.response?.data?.error?.message || e.message, life: 5000 })
      throw e
    } finally {
      setBloqueSaving(false)
    }
  }

  const handleEditarBloque = async (bloqueId, form) => {
    if (!selected) return
    setBloqueSaving(true)
    try {
      await horariosService.actualizarBloque(bloqueId, form)
      await loadHorario(selected.id)
      toast.current?.show({ severity: 'success', summary: 'Bloque actualizado', life: 3000 })
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: e.response?.data?.error?.message || e.message, life: 5000 })
      throw e
    } finally {
      setBloqueSaving(false)
    }
  }

  const handleEliminarBloque = async (bloqueId) => {
    if (!selected) return
    setBloqueSaving(true)
    try {
      await horariosService.eliminarBloque(bloqueId)
      await loadHorario(selected.id)
      toast.current?.show({ severity: 'success', summary: 'Bloque eliminado', life: 3000 })
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: e.response?.data?.error?.message || e.message, life: 5000 })
    } finally {
      setBloqueSaving(false)
    }
  }

  const filtered = search
    ? empleados.filter((e) =>
        [e.nombre, e.cedula, e.cargo].some((v) => v?.toLowerCase().includes(search.toLowerCase()))
      )
    : empleados

  return (
    <div>
      <Toast ref={toast} />
      <PageHeader
        icon="pi-clock"
        title="Horarios"
        subtitle="Edificador de jornadas por empleado"
      />

      <div className="grid grid-cols-[280px_1fr] gap-4 min-h-[600px]">
        <div className="card p-0 flex flex-col">
          <div className="p-3 border-b border-slate-100 dark:border-slate-700">
            <div className="relative">
              <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[12px]" />
              <InputText
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar empleado..."
                className="w-full pl-8 text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingEmp ? (
              <div className="p-8 text-center text-slate-400">
                <i className="pi pi-spin pi-spinner text-xl" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">Sin empleados</div>
            ) : (
              filtered.map((emp) => {
                const active = selected?.id === emp.id
                return (
                  <button
                    key={emp.id}
                    onClick={() => selectEmpleado(emp)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left border-b border-slate-50 dark:border-slate-800 transition-colors ${
                      active
                        ? 'bg-brand-50 dark:bg-brand-950/30 border-l-2 border-l-brand-500'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <Avatar
                      label={initials(emp.nombre)}
                      shape="circle"
                      size="normal"
                      className="bg-gradient-to-br from-brand-400 to-brand-600 text-white shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white leading-snug">{emp.nombre}</p>
                      <p className="text-[11px] text-slate-500 leading-snug">{emp.cargo || emp.area || 'Sin cargo'}</p>
                    </div>
                    {active && <i className="pi pi-check-circle text-brand-600 text-sm shrink-0" />}
                  </button>
                )
              })
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {loadingHorario ? (
            <div className="card p-12 flex items-center justify-center">
              <i className="pi pi-spin pi-spinner text-2xl text-slate-400" />
            </div>
          ) : !selected ? (
            <div className="card p-12 flex items-center justify-center">
              <EmptyState
                icon="pi-clock"
                title="Sin empleado seleccionado"
                description="Selecciona un empleado de la lista para ver o editar su horario."
              />
            </div>
          ) : (
            <>
              <HorarioStats stats={stats} />
              <HorarioEditor
                horario={horario}
                bloques={bloques}
                stats={stats}
                saving={bloqueSaving}
                onSaveHeader={handleSaveHeader}
                onCrearBloque={handleCrearBloque}
                onEditarBloque={handleEditarBloque}
                onEliminarBloque={handleEliminarBloque}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
