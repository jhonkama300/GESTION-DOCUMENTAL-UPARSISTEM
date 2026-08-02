import { useEffect, useState } from 'react'
import { Checkbox } from 'primereact/checkbox'
import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { Tag } from 'primereact/tag'
import { Button } from 'primereact/button'
import CampoOrigenSelect from './CampoOrigenSelect'
import { getOrigenLabel } from './catalog'
import { functionsService } from '../../services/functions.service.js'

/**
 * VariableConfigRow — Fila individual del Diseñador Visual.
 *
 * Props:
 *   - variable: { nombre_variable, detected, status, config }
 *   - allVariables: [string] — nombres de TODAS las variables de la plantilla
 *     (para el selector de origen=compuesto: qué variable transformar)
 *   - selected: bool — si está expandida/seleccionada
 *   - onSelect: () => void — al click en la fila
 *   - onChange: (newConfig) => void — al cambiar algún campo
 *   - onClear: () => void — al limpiar toda la config
 *
 * Forma de la config (la que persiste el backend):
 *   {
 *     nombre_variable: 'NOMBRE',
 *     origen: 'empleado',
 *     campo_nombre: 'nombre_completo',
 *     funcion_nombre: 'uuid',          // origen=funcion
 *     valor_constante: null,
 *     placeholder: null,
 *     obligatorio: false,
 *     orden: 0,
 *     config_json: {                   // origen=compuesto (ITER 7)
 *       source_variable: 'SALARIO',
 *       function: 'numero_a_letras',
 *     },
 *   }
 *
 * El padre (DisenadorPlantilla) gestiona el array de configs en estado.
 * Esta fila es controlada — emite eventos, no maneja estado propio salvo
 * para UI efímera (mostrar/ocultar la advertencia "modificado sin guardar").
 */
export default function VariableConfigRow({ variable, allVariables = [], selected, onSelect, onChange, onClear }) {
  const cfg = variable.config ?? emptyConfig(variable.nombre_variable)

  const handleOrigenChange = ({ origen, campo_nombre, funcion_nombre }) => {
    // Al cambiar origen, mantenemos campos comunes y reseteamos los específicos
    const next = {
      ...cfg,
      origen,
      campo_nombre: origen === 'funcion' ? null : (campo_nombre ?? null),
      funcion_nombre: origen === 'funcion' ? (funcion_nombre ?? null) : null,
      valor_constante: origen === 'constante' ? (cfg.valor_constante ?? '') : null,
      placeholder: origen === 'manual' ? (cfg.placeholder ?? '') : null,
      config_json: origen === 'compuesto' ? (cfg.config_json ?? { source_variable: '', function: '' }) : null,
    }
    onChange?.(next)
  }

  const handleField = (field, value) => {
    onChange?.({ ...cfg, [field]: value })
  }

  const handleCompoundField = (field, value) => {
    const current = cfg.config_json ?? { source_variable: '', function: '' }
    onChange?.({ ...cfg, config_json: { ...current, [field]: value } })
  }

  const isConfigured = variable.status === 'configured'
  const showConstanteInput = cfg.origen === 'constante'
  const showManualPlaceholder = cfg.origen === 'manual'
  const showCompoundEditor = cfg.origen === 'compuesto'

  const compound = cfg.config_json ?? {}
  const otherVariables = allVariables.filter((v) => v !== variable.nombre_variable)

  const [funcionesInput, setFuncionesInput] = useState([])

  useEffect(() => {
    if (!showCompoundEditor) return
    let cancelled = false
    functionsService.listWithInput()
      .then((funcs) => { if (!cancelled) setFuncionesInput(funcs || []) })
      .catch(() => { if (!cancelled) setFuncionesInput([]) })
    return () => { cancelled = true }
  }, [showCompoundEditor])

  return (
    <div
      className={`rounded-lg border transition-all overflow-hidden ${
        selected
          ? 'border-brand-400 shadow-sm'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      {/* Header clickable */}
      <button
        type="button"
        onClick={onSelect}
        className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${
          selected ? 'bg-brand-50/60 dark:bg-brand-900/20' : 'bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/60'
        }`}
      >
        <code className={`text-[11px] font-mono font-semibold shrink-0 ${
          selected ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-200'
        }`}>
          {`{{${variable.nombre_variable}}}`}
        </code>

        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          {isConfigured ? (
            <>
              <Tag value={getOrigenLabel(cfg.origen)} severity="info" className="text-[10px]" />
              {cfg.origen === 'compuesto' && (compound.source_variable || compound.function) ? (
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  <code className="text-[10px]">
                    {compound.function || 'fn'}({compound.source_variable || '?'})
                  </code>
                </span>
              ) : (cfg.campo_nombre || cfg.funcion_nombre) ? (
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  → <code className="text-[10px]">{cfg.campo_nombre || cfg.funcion_nombre}</code>
                </span>
              ) : null}
              {cfg.valor_constante && (
                <span className="text-xs text-slate-500 dark:text-slate-400 italic truncate max-w-[200px]">
                  = "{cfg.valor_constante}"
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-amber-700 dark:text-amber-400 italic flex items-center gap-1">
              <i className="pi pi-exclamation-circle" />
              Sin configurar
            </span>
          )}
          {cfg.obligatorio && (
            <Tag value="obligatorio" severity="warning" className="text-[10px]" />
          )}
          {!variable.detected && (
            <Tag value="huérfana" severity="secondary" className="text-[10px]" />
          )}
        </div>

        <i className={`pi pi-chevron-${selected ? 'up' : 'down'} text-slate-400 text-xs shrink-0`} />
      </button>

      {/* Editor expandido */}
      {selected && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/30 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Columna izquierda: cascada Origen + Campo/Función */}
            <div>
              <CampoOrigenSelect
                value={{
                  origen: cfg.origen,
                  campo_nombre: cfg.origen === 'funcion' ? null : cfg.campo_nombre,
                  funcion_nombre: cfg.origen === 'funcion' ? cfg.funcion_nombre : null,
                }}
                onChange={handleOrigenChange}
              />
            </div>

            {/* Columna derecha: inputs específicos del origen */}
            <div className="space-y-3">
              {showConstanteInput && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
                    Valor constante
                  </label>
                  <InputText
                    value={cfg.valor_constante ?? ''}
                    onChange={(e) => handleField('valor_constante', e.target.value)}
                    placeholder="Ej: Colombia"
                    className="w-full text-sm"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 italic">
                    Este valor se usará literal para todos los documentos generados.
                  </p>
                </div>
              )}

              {showManualPlaceholder && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
                    Placeholder (texto de ayuda)
                  </label>
                  <InputText
                    value={cfg.placeholder ?? ''}
                    onChange={(e) => handleField('placeholder', e.target.value)}
                    placeholder="Ej: Observaciones adicionales"
                    className="w-full text-sm"
                  />
                </div>
              )}

              {showCompoundEditor && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
                      Variable fuente
                    </label>
                    <Dropdown
                      value={compound.source_variable || null}
                      options={otherVariables.map((v) => ({ value: v, label: `{{${v}}}` }))}
                      onChange={(e) => handleCompoundField('source_variable', e.value)}
                      placeholder="Seleccionar variable del documento"
                      className="w-full"
                      filter
                      emptyMessage={
                        <div className="text-xs text-slate-500 p-2">
                          No hay otras variables en esta plantilla. Configurá primero la variable fuente.
                        </div>
                      }
                    />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 italic">
                      El valor resuelto de esta variable será el argumento de la función.
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
                      Función a aplicar
                    </label>
                    <Dropdown
                      value={compound.function || null}
                      options={funcionesInput.map((f) => ({ value: f.name, label: f.label }))}
                      onChange={(e) => handleCompoundField('function', e.value)}
                      placeholder="Seleccionar función"
                      className="w-full"
                      filter
                      emptyMessage={
                        <div className="text-xs text-slate-500 p-2">
                          No hay funciones con input registradas.
                        </div>
                      }
                    />
                    {compound.function && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 italic">
                        {funcionesInput.find((f) => f.name === compound.function)?.description}
                      </p>
                    )}
                  </div>
                  {compound.source_variable && compound.function && (
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 px-3 py-2 rounded-md bg-slate-100 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-600">
                      {`{{${variable.nombre_variable}}} = ${compound.function}({{${compound.source_variable}}})`}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <Checkbox
                  inputId={`oblig-${variable.nombre_variable}`}
                  checked={!!cfg.obligatorio}
                  onChange={(e) => handleField('obligatorio', e.checked)}
                />
                <label htmlFor={`oblig-${variable.nombre_variable}`} className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  Obligatorio
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">(aborta generación si falta)</span>
                </label>
              </div>
            </div>
          </div>

          {isConfigured && (
            <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-700">
              <Button
                label="Quitar configuración"
                icon="pi pi-times"
                size="small"
                text
                severity="danger"
                onClick={onClear}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

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
