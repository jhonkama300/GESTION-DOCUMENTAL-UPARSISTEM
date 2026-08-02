import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { Steps } from 'primereact/steps'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import RequisitoField from '../components/admin/RequisitoField.jsx'
import { templatesService } from '../services/templates.service.js'
import { documentsService } from '../services/documents.service.js'
import { useEntidad } from '../context/EntidadContext.jsx'

/**
 * DocumentosWizard — Motor Documental Genérico · FASE 6
 *
 * Wizard UNIVERSAL para generar CUALQUIER documento del motor.
 * Funciona idéntico para contratos, certificaciones, cartas, memorandos,
 * actas, otrosíes, etc. — porque la UI renderiza DINÁMICAMENTE según
 * el requirements del backend.
 *
 * Pasos:
 *   1. Seleccionar plantilla
 *   2. Datos del documento (orígenes seleccionados según needs)
 *   3. Campos pendientes (lo que el backend no pudo resolver)
 *   4. Vista previa (resolución completa)
 *   5. Generar documento
 *
 * PRINCIPIO: el frontend NO SABE qué pedir. Pregunta al backend via
 * `templatesService.getRequirements()` y renderiza lo que dice.
 *
 * Endpoints consumidos (públicos, sin /admin/):
 *   GET  /api/templates/{id}/requirements
 *   POST /api/templates/{id}/resolve (mode: pending | final)
 *   POST /api/documentos/generate
 */

const STEPS = [
  { label: 'Plantilla' },
  { label: 'Datos del documento' },
  { label: 'Campos pendientes' },
  { label: 'Vista previa' },
  { label: 'Generar' },
]

// Mapeo source → campo en `context` que el wizard debe persistir
const SOURCE_TO_CONTEXT = {
  empleado: 'empleadoId',
  contrato: 'contratoId',
  entidad: 'entidadId',
}

export default function DocumentosWizard() {
  const navigate = useNavigate()
  const { currentEntidad } = useEntidad()
  const toast = useRef(null)

  // ── Estado del wizard
  const [step, setStep] = useState(0)
  const [plantilla, setPlantilla] = useState(null)
  const [plantillas, setPlantillas] = useState([])
  const [requirements, setRequirements] = useState(null)
  const [context, setContext] = useState({})
  const [manual, setManual] = useState({})
  const [resolvePending, setResolvePending] = useState(null) // mode='pending' response
  const [resolveFinal, setResolveFinal] = useState(null)     // mode='final' response
  const [pendingInputs, setPendingInputs] = useState([])     // inputs a renderizar en Paso 3

  // ── Estado de carga
  const [loadingPlantillas, setLoadingPlantillas] = useState(false)
  const [loadingRequirements, setLoadingRequirements] = useState(false)
  const [loadingPending, setLoadingPending] = useState(false)
  const [loadingFinal, setLoadingFinal] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)

  // ── Carga inicial: plantillas activas
  useEffect(() => {
    setLoadingPlantillas(true)
    templatesService.list()
      .then((data) => {
        // `data` puede venir como { templates: [...] } o como array
        const list = Array.isArray(data) ? data : (data.templates || [])
        setPlantillas(list)
      })
      .catch((err) => {
        toast.current?.show({
          severity: 'error', summary: 'Error', detail: err.message, life: 5000,
        })
      })
      .finally(() => setLoadingPlantillas(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Cuando se selecciona plantilla, cargar requirements
  useEffect(() => {
    if (!plantilla) {
      setRequirements(null)
      return
    }
    setLoadingRequirements(true)
    templatesService.getRequirements(plantilla.id)
      .then((reqs) => {
        setRequirements(reqs)

        // Auto-set entidad si la plantilla lo pide y hay una entidad activa
        if (reqs.needs?.entidad && currentEntidad) {
          setContext((c) => ({ ...c, entidadId: currentEntidad.id }))
        }
      })
      .catch((err) => {
        toast.current?.show({
          severity: 'error', summary: 'Error',
          detail: err.response?.data?.error?.message || err.message,
          life: 5000,
        })
        setRequirements(null)
      })
      .finally(() => setLoadingRequirements(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plantilla])

  // ── Resetear estado si cambia la plantilla
  useEffect(() => {
    setContext({})
    setManual({})
    setResolvePending(null)
    setResolveFinal(null)
    setPendingInputs([])
  }, [plantilla?.id])

  // ── Validaciones de cada paso
  const canNext = useMemo(() => {
    if (step === 0) return !!plantilla
    if (step === 1) {
      if (!requirements) return false
      const needs = requirements.needs || {}
      if (needs.empleado && !context.empleadoId) return false
      if (needs.contrato && !context.contratoId) return false
      if (needs.entidad  && !context.entidadId)  return false
      return true
    }
    if (step === 2) {
      // Todos los obligatorios pendientes llenos
      for (const r of pendingInputs) {
        if (r.required && !manual[r.variable]) return false
      }
      return true
    }
    return true
  }, [step, plantilla, requirements, context, manual, pendingInputs])

  // ── Paso 2 → 3: resolver pendientes
  const goToPendientes = async () => {
    if (!plantilla || !requirements) return
    setLoadingPending(true)
    try {
      const data = await templatesService.resolve(
        plantilla.id,
        {
          empleadoId: context.empleadoId || null,
          contratoId: context.contratoId || null,
          entidadId:  context.entidadId  || null,
        },
        {},
        'pending',
      )
      setResolvePending(data)
      setPendingInputs(data.pending_inputs || [])
      setStep(2)
    } catch (err) {
      toast.current?.show({
        severity: 'error', summary: 'Error al resolver pendientes',
        detail: err.response?.data?.error?.message || err.message,
        life: 5000,
      })
    } finally {
      setLoadingPending(false)
    }
  }

  // ── Paso 3 → 4: resolución final
  const goToPreview = async () => {
    if (!plantilla) return
    setLoadingFinal(true)
    try {
      const data = await templatesService.resolve(
        plantilla.id,
        {
          empleadoId: context.empleadoId || null,
          contratoId: context.contratoId || null,
          entidadId:  context.entidadId  || null,
        },
        manual,
        'final',
      )
      setResolveFinal(data)
      setStep(3)
    } catch (err) {
      toast.current?.show({
        severity: 'error', summary: 'Error al generar vista previa',
        detail: err.response?.data?.error?.message || err.message,
        life: 5000,
      })
    } finally {
      setLoadingFinal(false)
    }
  }

  // ── Generar documento
  const handleGenerate = async () => {
    if (!plantilla) return
    setGenerating(true)
    setResult(null)
    try {
      const data = await documentsService.generate({
        templateId: plantilla.id,
        context: {
          empleadoId: context.empleadoId || null,
          contratoId: context.contratoId || null,
          entidadId:  context.entidadId  || null,
        },
        manual,
      })
      setResult(data)
      setStep(4)
      toast.current?.show({
        severity: 'success', summary: 'Documento generado',
        detail: `ID #${data.id} · ${data.replaced ?? 0} variables reemplazadas`,
        life: 4000,
      })
    } catch (err) {
      toast.current?.show({
        severity: 'error', summary: 'Error al generar',
        detail: err.response?.data?.error?.message || err.message,
        life: 5000,
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleReset = () => {
    setStep(0)
    setPlantilla(null)
    setRequirements(null)
    setContext({})
    setManual({})
    setResolvePending(null)
    setResolveFinal(null)
    setPendingInputs([])
    setResult(null)
  }

  return (
    <div>
      <Toast ref={toast} />

      <PageHeader
        icon="pi-file-edit"
        title="Generar documento"
        subtitle="Wizard universal del motor. Funciona con CUALQUIER plantilla."
        actions={
          step > 0 ? (
            <Button
              label="Reiniciar"
              icon="pi pi-refresh"
              outlined
              size="small"
              onClick={handleReset}
            />
          ) : null
        }
      />

      <div className="card p-3 mb-4">
        <Steps
          model={STEPS}
          activeIndex={step}
          onSelect={(e) => setStep(e.index)}
          readOnly={generating}
          className="text-xs"
        />
      </div>

      {/* ── Paso 1: Plantilla */}
      {step === 0 && (
        <StepPlantilla
          plantillas={plantillas}
          loading={loadingPlantillas}
          selected={plantilla}
          onSelect={setPlantilla}
        />
      )}

      {/* ── Paso 2: Datos del documento (orígenes seleccionados) */}
      {step === 1 && (
        <StepDatos
          requirements={requirements}
          loading={loadingRequirements}
          context={context}
          setContext={setContext}
          loadContext={templatesService.loadContext}
        />
      )}

      {/* ── Paso 3: Campos pendientes (lo que el backend no pudo resolver) */}
      {step === 2 && (
        <StepPendientes
          pendingInputs={pendingInputs}
          warnings={resolvePending?.warnings || []}
          resolved={resolvePending?.resolved || {}}
          manual={manual}
          setManual={setManual}
          loading={loadingPending}
        />
      )}

      {/* ── Paso 4: Vista previa */}
      {step === 3 && (
        <StepPreview
          plantilla={plantilla}
          resolveFinal={resolveFinal}
          loading={loadingFinal}
        />
      )}

      {/* ── Paso 5: Generar documento (acción) */}
      {step === 4 && result && (
        <StepResultado
          result={result}
          plantilla={plantilla}
          onReset={handleReset}
          onVolver={() => navigate('/dashboard')}
        />
      )}

      {/* ── Footer con navegación */}
      {step < 4 && (
        <div className="flex justify-between pt-3 mt-3 border-t border-slate-200 dark:border-slate-700">
          <Button
            label="Atrás"
            icon="pi pi-arrow-left"
            outlined
            size="small"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0 || generating || loadingPending || loadingFinal}
          />
          {step === 0 && (
            <Button
              label="Siguiente"
              icon="pi pi-arrow-right"
              iconPos="right"
              severity="info"
              size="small"
              onClick={() => setStep(1)}
              disabled={!canNext}
            />
          )}
          {step === 1 && (
            <Button
              label="Siguiente"
              icon="pi pi-arrow-right"
              iconPos="right"
              severity="info"
              size="small"
              onClick={goToPendientes}
              disabled={!canNext || loadingPending}
              loading={loadingPending}
            />
          )}
          {step === 2 && (
            <Button
              label="Vista previa"
              icon="pi pi-eye"
              iconPos="right"
              severity="info"
              size="small"
              onClick={goToPreview}
              disabled={!canNext || loadingFinal}
              loading={loadingFinal}
            />
          )}
          {step === 3 && (
            <Button
              label={generating ? 'Generando…' : 'Generar documento'}
              icon={generating ? 'pi pi-spin pi-spinner' : 'pi pi-send'}
              severity="success"
              size="small"
              onClick={handleGenerate}
              disabled={generating}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ── Pasos

function StepPlantilla({ plantillas, loading, selected, onSelect }) {
  if (loading) {
    return <div className="card p-12 text-center text-slate-400"><i className="pi pi-spin pi-spinner text-2xl" /></div>
  }

  return (
    <div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
        Elegí la plantilla con la que querés generar un documento. El sistema
        va a detectar automáticamente qué datos te pide.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {plantillas.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className={`text-left p-4 rounded-lg border-2 transition-all ${
              selected?.id === p.id
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-brand-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-white flex items-center justify-center shrink-0">
                <i className="pi pi-file-word" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {p.nombre}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {p.tipo_documento || 'documento'} · {p.categoria || 'General'}
                </p>
                {p.version_activa && (
                  <p className="text-[10px] text-slate-400 mt-0.5">v{p.version_activa} activa</p>
                )}
              </div>
              {selected?.id === p.id && <i className="pi pi-check-circle text-brand-600" />}
            </div>
          </button>
        ))}
      </div>
      {plantillas.length === 0 && (
        <EmptyState
          icon="pi-inbox"
          title="No hay plantillas"
          description="El admin aún no ha creado plantillas. Pedile a un Administrador que vaya a /admin/plantillas."
        />
      )}
    </div>
  )
}

/**
 * StepDatos — Paso 2 · Datos del documento
 *
 * Renderiza SOLO los pickers declarados en requirements.context_inputs[].
 * El backend ya filtró qué orígenes se necesitan. El frontend solo renderiza.
 *
 * Si needs.entidad=true y hay entidad activa, se auto-rellena sin mostrar picker.
 * Si needs.usuario=true, no se muestra nada (se obtiene del JWT).
 */
function StepDatos({ requirements, loading, context, setContext, loadContext }) {
  const [opciones, setOpciones] = useState({})

  // Cargar opciones para cada context_input que lo requiera
  useEffect(() => {
    if (!requirements) return
    const inputs = requirements.context_inputs || []
    const needs = requirements.needs || {}

    const loadAll = async () => {
      const result = {}
      for (const ci of inputs) {
        try {
          result[ci.source] = await loadContext(ci, context)
        } catch {
          result[ci.source] = []
        }
      }
      setOpciones(result)
    }
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requirements, context.empleadoId]) // recarga cuando cambia el empleado (para contratos)

  if (loading) {
    return <div className="card p-12 text-center text-slate-400"><i className="pi pi-spin pi-spinner text-2xl" /></div>
  }
  if (!requirements) {
    return <EmptyState icon="pi-exclamation-triangle" title="Sin requirements" description="No se pudo cargar la configuración de la plantilla." />
  }

  const inputs = requirements.context_inputs || []
  const needs = requirements.needs || {}

  // Si la plantilla solo necesita entidad/usuario (auto-rellenados), no hay pickers
  const visibleInputs = inputs.filter((ci) => {
    if (ci.source === 'entidad' && context.entidadId) return false
    if (ci.source === 'usuario') return false
    return true
  })

  if (visibleInputs.length === 0 && (needs.entidad || needs.usuario)) {
    return (
      <div className="card p-6 text-center">
        <i className="pi pi-check-circle text-3xl text-emerald-500 mb-2" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Datos del documento completos</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {needs.entidad && `Entidad: ${context.entidadId ? 'seleccionada' : 'no seleccionada'}`}
          {needs.usuario && ' · Usuario autenticado'}
        </p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
        Completá los datos que la plantilla necesita. Solo se muestran los campos requeridos.
      </p>
      <div className="card p-5 space-y-4">
        {visibleInputs.map((ci) => {
          if (ci.source === 'empleado') {
            return (
              <div key="empleado">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Empleado <span className="text-rose-500">*</span>
                </label>
                <Dropdown
                  value={context.empleadoId ?? null}
                  options={(opciones.empleado || []).map((e) => ({ value: e.id, label: e.nombre }))}
                  onChange={(e) => setContext((c) => ({ ...c, empleadoId: e.value, contratoId: null }))}
                  placeholder="Seleccionar empleado"
                  className="w-full"
                  filter
                  loading={!opciones.empleado}
                />
              </div>
            )
          }
          if (ci.source === 'contrato') {
            return (
              <div key="contrato">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Contrato {!context.empleadoId && <span className="text-[10px] text-slate-400">(elegí empleado primero)</span>}
                  {context.empleadoId && <span className="text-rose-500">*</span>}
                </label>
                <Dropdown
                  value={context.contratoId ?? null}
                  options={(opciones.contrato || []).map((c) => ({
                    value: c.id,
                    label: `${c.tipo || 'contrato'} · ${c.fecha_inicio || ''} → ${c.fecha_fin || 'indef.'} · $${(c.salario || 0).toLocaleString('es-CO')}`,
                  }))}
                  onChange={(e) => setContext((c) => ({ ...c, contratoId: e.value }))}
                  placeholder={context.empleadoId ? 'Seleccionar contrato' : 'Esperando empleado…'}
                  className="w-full"
                  disabled={!context.empleadoId}
                  loading={context.empleadoId && !opciones.contrato}
                />
                {context.empleadoId && opciones.contrato?.length === 0 && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
                    Este empleado no tiene contratos registrados.
                  </p>
                )}
              </div>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}

/**
 * StepPendientes — Paso 3 · Campos pendientes
 *
 * El backend ya intentó resolver todas las variables. Solo nos pasa
 * las que faltan (manual_inputs) y las que no pudo resolver (warnings).
 *
 * Inputs: pending_inputs[] viene de /api/templates/{id}/resolve?mode=pending
 */
function StepPendientes({ pendingInputs, warnings, resolved, manual, setManual, loading }) {
  if (loading) {
    return <div className="card p-12 text-center text-slate-400"><i className="pi pi-spin pi-spinner text-2xl" /></div>
  }

  if (pendingInputs.length === 0 && warnings.length === 0) {
    return (
      <EmptyState
        icon="pi-check-circle"
        title="Todo resuelto"
        description="El motor pudo resolver todas las variables automáticamente. Podés avanzar al preview."
      />
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        El backend ya intentó resolver todo automáticamente. Completá solo lo que falta.
      </p>

      {warnings.length > 0 && (
        <div className="card p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-1.5">
            <i className="pi pi-exclamation-triangle" />
            {warnings.length} variable{warnings.length !== 1 ? 's' : ''} no se pudo resolver automáticamente
          </p>
          <div className="flex flex-wrap gap-1.5">
            {warnings.map((w) => (
              <Tag key={w.variable} value={w.variable} severity="warning" />
            ))}
          </div>
        </div>
      )}

      {pendingInputs.length > 0 ? (
        <div className="card p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingInputs.map((req) => (
            <RequisitoField
              key={req.variable}
              requisito={req}
              value={manual[req.variable]}
              onChange={(val) => setManual((m) => ({ ...m, [req.variable]: val }))}
            />
          ))}
        </div>
      ) : (
        <div className="card p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
            <i className="pi pi-check" />
            No hay campos pendientes para completar
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * StepPreview — Paso 4 · Vista previa
 *
 * Usa la respuesta de /api/templates/{id}/resolve?mode=final para mostrar
 * qué variables se resolvieron y cuáles quedaron sin resolver.
 */
function StepPreview({ plantilla, resolveFinal, loading }) {
  if (loading) {
    return <div className="card p-12 text-center text-slate-400"><i className="pi pi-spin pi-spinner text-2xl" /></div>
  }
  if (!resolveFinal) return null

  const resolvedEntries = Object.entries(resolveFinal.resolved || {})
  const unresolvedEntries = (resolveFinal.unresolved || []).map((v) => [v, null])

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Revisión final antes de generar. <strong className="text-emerald-600 dark:text-emerald-400">{resolvedEntries.length}</strong> resueltas
        {unresolvedEntries.length > 0 && (
          <> · <strong className="text-amber-600 dark:text-amber-400">{unresolvedEntries.length}</strong> sin resolver</>
        )}.
      </p>

      {resolvedEntries.length > 0 && (
        <div className="card p-4">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
            <i className="pi pi-check-circle" />
            Variables resueltas ({resolvedEntries.length})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
            {resolvedEntries.map(([k, v]) => (
              <div key={k} className="flex items-center gap-2 py-0.5 min-w-0">
                <span className="font-mono text-slate-500 dark:text-slate-400 shrink-0">{k}</span>
                <span className="text-slate-300 dark:text-slate-600">→</span>
                <span className="text-slate-700 dark:text-slate-200 truncate">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {unresolvedEntries.length > 0 && (
        <div className="card p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-2 flex items-center gap-1.5">
            <i className="pi pi-exclamation-triangle" />
            Sin resolver ({unresolvedEntries.length}) — quedarán vacías en el documento
          </p>
          <div className="flex flex-wrap gap-1.5">
            {unresolvedEntries.map(([k]) => (
              <Tag key={k} value={k} severity="warning" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StepResultado({ result, onReset, onVolver, plantilla }) {
  const downloadUrl = result.docxUrl
  return (
    <div className="text-center py-8 animate-fade-in">
      <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
        <i className="pi pi-check text-4xl text-emerald-600" />
      </div>
      <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">¡Documento generado!</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
        El motor declaró <strong>{plantilla?.nombre}</strong> usando la configuración
        declarativa. Se generaron {result.replaced ?? 0} reemplazos.
      </p>
      <div className="mt-6 max-w-md mx-auto bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-left space-y-2">
        <Row label="ID" value={`#${result.id}`} />
        <Row label="Hash" value={result.hash} mono />
        {result.unresolved?.length > 0 && (
          <Row
            label="Sin resolver"
            value={result.unresolved.join(', ')}
            warn
          />
        )}
      </div>
      <div className="flex gap-2 justify-center mt-6">
        {downloadUrl && (
          <Button
            label="Descargar DOCX"
            icon="pi pi-download"
            severity="info"
            onClick={() => window.open(downloadUrl, '_blank')}
          />
        )}
        <Button label="Generar otro" icon="pi pi-refresh" outlined onClick={onReset} />
        <Button label="Volver al dashboard" icon="pi pi-home" outlined onClick={onVolver} />
      </div>
    </div>
  )
}

// ── Helpers UI

function Summary({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
      <i className={`pi ${icon} text-slate-400`} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{value}</p>
      </div>
    </div>
  )
}

function Row({ label, value, mono, warn }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`${mono ? 'font-mono text-[10px]' : 'font-medium'} ${warn ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-100'} truncate`}>
        {value}
      </span>
    </div>
  )
}

