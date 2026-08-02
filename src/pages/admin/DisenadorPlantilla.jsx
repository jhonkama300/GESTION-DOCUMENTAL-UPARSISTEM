import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Toast } from 'primereact/toast'
import PageHeader from '../../components/PageHeader.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import VariableConfigRow from '../../components/admin/VariableConfigRow.jsx'
import { plantillasAdminService } from '../../services/admin.plantillas.service.js'

/**
 * DisenadorPlantilla — ITERACIÓN 2 · FASE 2 · Motor Documental Visual
 *
 * Página principal del Diseñador. Layout:
 *   - Header con breadcrumb + acciones globales (guardar)
 *   - Lista de variables detectadas en el DOCX (con su estado: configurada / pendiente)
 *   - Click en una variable → muestra/oculta el editor
 *   - Cambios NO se persisten hasta que el usuario click "Guardar configuración"
 *
 * Decisiones:
 *   - Trabaja siempre sobre la versión ACTIVA de la plantilla
 *   - Mantiene un `draft` local con los cambios del usuario, separado del state del backend
 *   - Tracking de "dirty" para advertir al usuario antes de salir
 *   - Filtros en el header (todas / pendientes / configuradas)
 */
export default function DisenadorPlantilla() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useRef(null)

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [draft, setDraft] = useState({})     // { nombre_variable: config object }
  const [selected, setSelected] = useState(null)  // nombre_variable actualmente expandido
  const [filter, setFilter] = useState('all')    // 'all' | 'pending' | 'configured'
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const resp = await plantillasAdminService.getVariables(id)
      setData(resp)
      // Inicializar draft: si una variable ya tiene config, la precargamos.
      // Si no, le damos un objeto vacío listo para configurar.
      const initialDraft = {}
      for (const v of resp.variables) {
        initialDraft[v.nombre_variable] = v.config ?? emptyConfig(v.nombre_variable)
      }
      setDraft(initialDraft)
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

  // Lista filtrada + ordenada
  const filteredVars = useMemo(() => {
    if (!data) return []
    let list = [...data.variables]

    if (filter === 'pending') list = list.filter((v) => v.status === 'pending')
    else if (filter === 'configured') list = list.filter((v) => v.status === 'configured')
    else if (filter === 'orphan') list = list.filter((v) => v.status === 'orphan')

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((v) => v.nombre_variable.toLowerCase().includes(q))
    }

    list.sort((a, b) => {
      // configuradas primero (por nombre), luego pending (por nombre)
      const ao = a.nombre_variable
      const bo = b.nombre_variable
      return ao.localeCompare(bo)
    })

    return list
  }, [data, filter, search])

  // Dirty: true si el draft difiere de lo que el backend tiene
  const dirty = useMemo(() => {
    if (!data) return false
    for (const v of data.variables) {
      const draftCfg = draft[v.nombre_variable]
      const serverCfg = v.config
      if (!isSameConfig(draftCfg, serverCfg)) return true
    }
    return false
  }, [data, draft])

  const updateVarConfig = (nombre, newConfig) => {
    setDraft((d) => ({ ...d, [nombre]: newConfig }))
  }

  const clearVarConfig = (nombre) => {
    setDraft((d) => ({ ...d, [nombre]: emptyConfig(nombre) }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Construir payload: solo vars con origen configurado (sin origen = "no guardar")
      const items = data.variables
        .map((v) => draft[v.nombre_variable])
        .filter((cfg) => cfg && cfg.origen)
        .map((cfg, i) => ({
          nombre_variable: cfg.nombre_variable,
          origen: cfg.origen,
          campo_nombre: cfg.campo_nombre || null,
          funcion_nombre: cfg.funcion_nombre || null,
          valor_constante: cfg.valor_constante || null,
          placeholder: cfg.placeholder || null,
          obligatorio: !!cfg.obligatorio,
          orden: i,
          config_json: cfg.config_json || null,
        }))

      const result = await plantillasAdminService.saveVariables(id, items)
      toast.current?.show({
        severity: 'success',
        summary: 'Configuración guardada',
        detail: `${result.count} variable(s) persistida(s)`,
        life: 3000,
      })
      await loadData()
      setSelected(null)
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error al guardar',
        detail: err.response?.data?.error?.message || err.message,
        life: 5000,
      })
    } finally {
      setSaving(false)
    }
  }

  // Bulk apply helpers
  const applyConstantToAll = () => {
    const newDraft = { ...draft }
    for (const v of data.variables) {
      if (v.status === 'pending') {
        newDraft[v.nombre_variable] = {
          ...newDraft[v.nombre_variable],
          origen: 'constante',
          campo_nombre: null,
          funcion_nombre: null,
        }
      }
    }
    setDraft(newDraft)
    toast.current?.show({
      severity: 'info',
      summary: 'Marcadas como Constante',
      detail: 'Edita el valor de cada una individualmente antes de guardar',
      life: 3000,
    })
  }

  if (loading || !data) {
    return (
      <div>
        <Toast ref={toast} />
        <PageHeader icon="pi-sitemap" title="Diseñador Visual" subtitle="Cargando..." />
        <div className="card p-12 text-center text-slate-400">
          <i className="pi pi-spin pi-spinner text-2xl" />
        </div>
      </div>
    )
  }

  const stats = {
    total: data.total_detected,
    configured: data.total_configured,
    pending: data.total_pending,
  }

  return (
    <div>
      <Toast ref={toast} />

      <PageHeader
        icon="pi-sitemap"
        title="Diseñador Visual"
        subtitle={
          <span>
            <code className="text-xs">{data.plantilla.slug}</code> · v{data.version.version} · {stats.total} variables detectadas
          </span>
        }
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button
              label="Volver"
              icon="pi pi-arrow-left"
              outlined
              size="small"
              onClick={() => {
                if (dirty && !window.confirm('Tienes cambios sin guardar. ¿Salir?')) return
                navigate('/admin/plantillas')
              }}
            />
            <Button
              label={saving ? 'Guardando...' : 'Guardar configuración'}
              icon={saving ? 'pi pi-spin pi-spinner' : 'pi pi-save'}
              severity="success"
              size="small"
              onClick={handleSave}
              disabled={saving || !dirty}
              badge={dirty ? '•' : null}
              tooltip={dirty ? 'Tienes cambios sin guardar' : 'Sin cambios pendientes'}
              tooltipOptions={{ position: 'bottom' }}
            />
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <Stat label="Detectadas" value={stats.total} icon="pi-code" color="brand" />
        <Stat label="Configuradas" value={stats.configured} icon="pi-check-circle" color="emerald" />
        <Stat label="Pendientes" value={stats.pending} icon="pi-exclamation-triangle" color="amber" />
      </div>

      {/* Filters + bulk actions */}
      <div className="card p-3 mb-4 flex flex-wrap items-center gap-3">
        <InputText
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar variable..."
          className="text-sm"
          style={{ minWidth: '240px' }}
        />
        <div className="flex gap-1.5">
          <FilterChip label="Todas" value="all" active={filter === 'all'} onClick={setFilter} count={stats.total} />
          <FilterChip label="Pendientes" value="pending" active={filter === 'pending'} onClick={setFilter} count={stats.pending} color="amber" />
          <FilterChip label="Configuradas" value="configured" active={filter === 'configured'} onClick={setFilter} count={stats.configured} color="emerald" />
        </div>
        {stats.pending > 0 && (
          <Button
            label="Marcar pendientes como Constante"
            icon="pi pi-bolt"
            size="small"
            text
            severity="secondary"
            onClick={applyConstantToAll}
            className="ml-auto"
          />
        )}
      </div>

      {/* Lista de variables */}
      {filteredVars.length === 0 ? (
        <EmptyState
          icon="pi-search"
          title="Sin variables"
          description={
            filter === 'pending'
              ? 'No hay variables pendientes — todas están configuradas.'
              : 'No hay variables que coincidan con el filtro actual.'
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredVars.map((v) => (
            <VariableConfigRow
              key={v.nombre_variable}
              variable={{
                ...v,
                config: draft[v.nombre_variable] ?? emptyConfig(v.nombre_variable),
                status: isConfiguredDraft(draft[v.nombre_variable]) ? 'configured' : 'pending',
              }}
              allVariables={data.variables.map((x) => x.nombre_variable)}
              selected={selected === v.nombre_variable}
              onSelect={() => setSelected((s) => (s === v.nombre_variable ? null : v.nombre_variable))}
              onChange={(newCfg) => updateVarConfig(v.nombre_variable, newCfg)}
              onClear={() => clearVarConfig(v.nombre_variable)}
            />
          ))}
        </div>
      )}

      {dirty && (
        <div className="fixed bottom-6 right-6 z-30 animate-fade-in">
          <div className="bg-amber-100 dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 rounded-lg px-4 py-2 text-sm shadow-lg flex items-center gap-2">
            <i className="pi pi-info-circle text-amber-600 dark:text-amber-400" />
            <span className="text-amber-800 dark:text-amber-200 font-medium">Cambios sin guardar</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-componentes

function Stat({ label, value, icon, color }) {
  const palette = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  }[color]
  return (
    <div className="card p-3 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${palette}`}>
        <i className={`pi ${icon}`} />
      </div>
      <div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{value}</p>
      </div>
    </div>
  )
}

function FilterChip({ label, value, active, onClick, count, color = 'slate' }) {
  const palette = {
    slate: active ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    amber: active ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    emerald: active ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  }[color]
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${palette}`}
    >
      {label}
      {count !== undefined && <span className="ml-1 opacity-70">({count})</span>}
    </button>
  )
}

// ── Helpers

function emptyConfig(nombre) {
  return {
    nombre_variable: nombre,
    origen: null,
    campo_nombre: null,
    funcion_nombre: null,
    valor_constante: null,
    placeholder: null,
    obligatorio: false,
    orden: 0,
    config_json: null,
  }
}

function isConfiguredDraft(cfg) {
  return cfg && !!cfg.origen
}

function isSameConfig(a, b) {
  if (!a && !b) return true
  if (!a || !b) return false
  return (
    a.origen === b.origen &&
    (a.campo_nombre ?? null) === (b.campo_nombre ?? null) &&
    (a.funcion_nombre ?? null) === (b.funcion_nombre ?? null) &&
    (a.valor_constante ?? null) === (b.valor_constante ?? null) &&
    (a.placeholder ?? null) === (b.placeholder ?? null) &&
    JSON.stringify(a.config_json ?? null) === JSON.stringify(b.config_json ?? null) &&
    !!a.obligatorio === !!b.obligatorio
  )
}
