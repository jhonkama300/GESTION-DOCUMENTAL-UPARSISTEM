import { useEffect, useState } from 'react'
import { Dropdown } from 'primereact/dropdown'
import { ProgressSpinner } from 'primereact/progressspinner'
import { ORIGENES, getOrigenLabel, getOrigenDescription, hasCatalog } from './catalog'
import { camposCatalogoService } from '../../services/camposCatalogo.service.js'
import { functionsService } from '../../services/functions.service.js'

/**
 * CampoOrigenSelect — Cascada Tipo → Origen → Campo/Función
 *
 * ITERACIÓN 3 · FASE 3: campos vía `/api/campos-catalogo` (cache local).
 * ITERACIÓN 7 · FASE 7: origen=funcion ahora muestra el dropdown de
 * funciones SIN input vía `/api/functions` (uuid, fecha_actual, hora...).
 *
 * Comportamiento:
 *   - Origen con catálogo (empleado/contrato/entidad/usuario/sistema)
 *     → fetch lazy de campos y dropdown de campo
 *   - Origen=funcion → fetch lazy de funciones y dropdown de función
 *   - Origenes sin catálogo (manual, constante, compuesto) → hint inline
 *   - Error state con retry
 *
 * Props:
 *   - value: { origen, campo_nombre, funcion_nombre }
 *   - onChange: ({ origen, campo_nombre, funcion_nombre }) => void
 *   - disabled: bool
 */
export default function CampoOrigenSelect({ value, onChange, disabled = false }) {
  const origen = value?.origen ?? null
  const campoNombre = value?.campo_nombre ?? null
  const funcionNombre = value?.funcion_nombre ?? null

  const [campos, setCampos] = useState([])
  const [loadingCampos, setLoadingCampos] = useState(false)
  const [errorCampos, setErrorCampos] = useState(null)

  const [funciones, setFunciones] = useState([])
  const [loadingFunciones, setLoadingFunciones] = useState(false)
  const [errorFunciones, setErrorFunciones] = useState(null)

  // Fetch lazy de campos cuando el origen tiene catálogo
  useEffect(() => {
    let cancelled = false
    if (!origen || !hasCatalog(origen)) {
      setCampos([])
      setErrorCampos(null)
      return
    }

    setLoadingCampos(true)
    setErrorCampos(null)
    camposCatalogoService.list(origen)
      .then((resp) => {
        if (cancelled) return
        setCampos(resp.campos || [])
      })
      .catch((err) => {
        if (cancelled) return
        setErrorCampos(err.response?.data?.error?.message || err.message)
        setCampos([])
      })
      .finally(() => {
        if (!cancelled) setLoadingCampos(false)
      })

    return () => { cancelled = true }
  }, [origen])

  // Fetch lazy de funciones cuando el origen es 'funcion'
  useEffect(() => {
    let cancelled = false
    if (origen !== 'funcion') {
      setFunciones([])
      setErrorFunciones(null)
      return
    }

    setLoadingFunciones(true)
    setErrorFunciones(null)
    functionsService.listWithoutInput()
      .then((funcs) => {
        if (cancelled) return
        setFunciones(funcs || [])
      })
      .catch((err) => {
        if (cancelled) return
        setErrorFunciones(err.response?.data?.error?.message || err.message)
        setFunciones([])
      })
      .finally(() => {
        if (!cancelled) setLoadingFunciones(false)
      })

    return () => { cancelled = true }
  }, [origen])

  const origenOptions = ORIGENES.map((o) => ({
    value: o.value,
    label: o.label,
  }))

  const campoOptions = campos.map((c) => ({
    value: c.nombre_campo,
    label: c.label,
  }))

  const funcionOptions = funciones.map((f) => ({
    value: f.name,
    label: f.label,
  }))

  const handleOrigen = (newOrigen) => {
    if (newOrigen === origen) return
    onChange?.({ origen: newOrigen, campo_nombre: null, funcion_nombre: null })
  }

  const handleCampo = (newCampo) => {
    onChange?.({ origen, campo_nombre: newCampo, funcion_nombre: null })
  }

  const handleFuncion = (newFuncion) => {
    const fn = funciones.find((f) => f.name === newFuncion)
    onChange?.({ origen, campo_nombre: null, funcion_nombre: newFuncion, _funcionMeta: fn })
  }

  const showCampoDropdown = origen && hasCatalog(origen)
  const showFuncionDropdown = origen === 'funcion'
  const showEmptyState = origen && !hasCatalog(origen) && origen !== 'funcion'

  const selectedFuncion = funciones.find((f) => f.name === funcionNombre)

  const emptyStateMsg = {
    manual: 'No requiere campo — el usuario completa el valor al generar.',
    constante: 'No requiere campo — el valor es un literal fijo.',
    compuesto: 'No requiere campo aquí — se configura en la sección de abajo.',
  }[origen] ?? ''

  return (
    <div className="space-y-3">
      {/* ── Selector de Origen ── */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
          Origen
        </label>
        <Dropdown
          value={origen}
          options={origenOptions}
          onChange={(e) => handleOrigen(e.value)}
          placeholder="Seleccionar origen"
          className="w-full"
          disabled={disabled}
          filter
        />
        {origen && (
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 italic">
            {getOrigenDescription(origen)}
          </p>
        )}
      </div>

      {/* ── Selector de Campo (lazy-loaded desde API) ── */}
      {showCampoDropdown && (
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
            Campo
          </label>
          {loadingCampos ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
              <ProgressSpinner style={{ width: '16px', height: '16px' }} strokeWidth="4" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Cargando campos de {getOrigenLabel(origen).toLowerCase()}...
              </span>
            </div>
          ) : errorCampos ? (
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20">
              <span className="text-xs text-rose-700 dark:text-rose-300">
                <i className="pi pi-exclamation-triangle mr-1" />
                {errorCampos}
              </span>
              <button
                type="button"
                onClick={() => handleOrigen(origen)}
                className="text-xs text-rose-700 dark:text-rose-300 underline hover:no-underline"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <Dropdown
              value={campoNombre}
              options={campoOptions}
              onChange={(e) => handleCampo(e.value)}
              placeholder="Seleccionar campo"
              className="w-full"
              disabled={disabled || campoOptions.length === 0}
              filter
              emptyMessage={
                <div className="text-xs text-slate-500 p-2">
                  No hay campos registrados para este origen. El admin debe agregarlos en el Catálogo.
                </div>
              }
            />
          )}
          {showCampoDropdown && !loadingCampos && !errorCampos && campos.length > 0 && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              {campos.length} campo{campos.length !== 1 ? 's' : ''} disponible{campos.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}

      {/* ── Selector de Función (origen=funcion, ITER 7) ── */}
      {showFuncionDropdown && (
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
            Función
          </label>
          {loadingFunciones ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
              <ProgressSpinner style={{ width: '16px', height: '16px' }} strokeWidth="4" />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Cargando funciones del registro...
              </span>
            </div>
          ) : errorFunciones ? (
            <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20">
              <span className="text-xs text-rose-700 dark:text-rose-300">
                <i className="pi pi-exclamation-triangle mr-1" />
                {errorFunciones}
              </span>
              <button
                type="button"
                onClick={() => handleOrigen(origen)}
                className="text-xs text-rose-700 dark:text-rose-300 underline hover:no-underline"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <Dropdown
              value={funcionNombre}
              options={funcionOptions}
              onChange={(e) => handleFuncion(e.value)}
              placeholder="Seleccionar función"
              className="w-full"
              disabled={disabled || funcionOptions.length === 0}
              filter
              emptyMessage={
                <div className="text-xs text-slate-500 p-2">
                  No hay funciones sin input registradas en el motor.
                </div>
              }
            />
          )}
          {selectedFuncion && (
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 italic">
              {selectedFuncion.description}
            </p>
          )}
        </div>
      )}

      {showEmptyState && (
        <div className="text-xs text-slate-500 dark:text-slate-400 italic px-3 py-2 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
          {emptyStateMsg}
        </div>
      )}
    </div>
  )
}
