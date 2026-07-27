import { useEffect, useState } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { Tag } from 'primereact/tag'
import { Button } from 'primereact/button'
import { Steps } from 'primereact/steps'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Calendar } from 'primereact/calendar'
import { InputTextarea } from 'primereact/inputtextarea'
import { Dialog } from 'primereact/dialog'
import { Toast } from 'primereact/toast'
import { useRef } from 'react'
import { Chip } from 'primereact/chip'
import PageHeader from '../components/PageHeader.jsx'
import { contratosService, empleadosService, plantillasService } from '../services/mock.data.js'
import { useSede } from '../context/SedeContext.jsx'
import { formatDate, formatCurrency, initials } from '../utils/format.js'

const STEPS = [
  { label: 'Plantilla' },
  { label: 'Empleado' },
  { label: 'Variables' },
  { label: 'Generar' },
]

const TIPOS = [
  { label: 'Término indefinido', value: 'indefinido' },
  { label: 'Término fijo', value: 'fijo' },
  { label: 'Prestación de servicios', value: 'prestacion' },
  { label: 'Aprendizaje', value: 'aprendizaje' },
]

const SAMPLE_PLANTILLA = [
  'En la ciudad de {{ciudad}}, a los {{fecha_letras}}, entre {{empresa_nombre}}, NIT {{empresa_nit}}, representada por {{empresa_representante}}, y {{empleado_nombre}}, identificado con cédula {{empleado_cedula}} de {{empleado_ciudad}}, se celebra el presente contrato de trabajo a {{tipo_contrato}}.',
  '',
  'El empleado se desempeñará como {{empleado_cargo}} en el área de {{empleado_area}}, con una asignación mensual de {{salario}} ({{salario_letras}}), y una jornada de {{jornada}} horas semanales en la sede {{sede}}.',
  '',
  'El presente contrato tendrá una duración de {{duracion}} a partir del {{fecha_inicio}}.{{fecha_fin_clausula}}',
  '',
  '{{clausulas_adicionales}}',
  '',
  'En señal de conformidad, las partes firman.',
].join('\n')

export default function Contratos() {
  const { currentSede } = useSede()
  const [data, setData] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [plantillas, setPlantillas] = useState([])
  const [wizardVisible, setWizardVisible] = useState(false)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    plantilla: null,
    empleado: null,
    tipo: null,
    fechaInicio: new Date(),
    duracion: '12 meses',
    salario: 2500000,
    jornada: 48,
    variables: {},
  })
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(null)
  const toast = useRef(null)

  useEffect(() => {
    if (!currentSede) return
    contratosService.list(currentSede.id).then(setData)
    empleadosService.list(currentSede.id).then(setEmpleados)
    plantillasService.list(currentSede.id).then(setPlantillas)
  }, [currentSede])

  const resetWizard = () => {
    setStep(0)
    setForm({
      plantilla: null, empleado: null, tipo: null,
      fechaInicio: new Date(), duracion: '12 meses',
      salario: 2500000, jornada: 48, variables: {},
    })
    setGenerated(null)
  }

  const close = () => {
    setWizardVisible(false)
    setTimeout(resetWizard, 300)
  }

  const openWizard = () => {
    resetWizard()
    setWizardVisible(true)
  }

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const canNext = () => {
    if (step === 0) return !!form.plantilla && !!form.tipo
    if (step === 1) return !!form.empleado
    if (step === 2) return true
    return true
  }

  const generate = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setGenerated({
        id: Math.floor(Math.random() * 1000) + 100,
        fecha: new Date(),
        hash: 'sha256:' + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
      })
      toast.current?.show({
        severity: 'success',
        summary: 'Contrato generado',
        detail: 'PDF creado y enviado a firma',
        life: 4000,
      })
    }, 1500)
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Tipo de contrato
              </label>
              <Dropdown
                value={form.tipo}
                options={TIPOS}
                onChange={(e) => setForm((f) => ({ ...f, tipo: e.value }))}
                placeholder="Seleccionar tipo"
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                Plantilla
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plantillas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setForm((f) => ({ ...f, plantilla: p }))}
                    className={`text-left p-4 rounded-lg border-2 transition-all ${
                      form.plantilla?.id === p.id
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 text-white flex items-center justify-center">
                        <i className="pi pi-file-word" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          {p.nombre}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {p.variables} variables · {p.categoria}
                        </p>
                      </div>
                      {form.plantilla?.id === p.id && (
                        <i className="pi pi-check-circle text-brand-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Selecciona el empleado
            </label>
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg divide-y divide-slate-100 dark:divide-slate-700 max-h-96 overflow-y-auto">
              {empleados.filter((e) => e.estado === 'Activo').map((e) => (
                <button
                  key={e.id}
                  onClick={() => setForm((f) => ({ ...f, empleado: e }))}
                  className={`w-full text-left p-3 flex items-center gap-3 transition-colors ${
                    form.empleado?.id === e.id
                      ? 'bg-brand-50 dark:bg-brand-900/20'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white text-xs font-semibold flex items-center justify-center">
                    {initials(e.nombre)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{e.nombre}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {e.cargo} · {e.area} · {e.sede}
                    </p>
                  </div>
                  {form.empleado?.id === e.id && (
                    <i className="pi pi-check-circle text-brand-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Se completarán automáticamente con base en la plantilla y el empleado:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {['{{empleado_nombre}}', '{{empleado_cedula}}', '{{empleado_cargo}}', '{{empleado_area}}', '{{sede}}', '{{ciudad}}', '{{fecha_inicio}}', '{{empresa_nombre}}'].map((v) => (
                  <Chip key={v} label={v} className="text-[10px] bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200" />
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Fecha de inicio
              </label>
              <Calendar
                value={form.fechaInicio}
                onChange={(e) => setForm((f) => ({ ...f, fechaInicio: e.value }))}
                className="w-full"
                dateFormat="dd/mm/yy"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Duración
              </label>
              <InputText
                value={form.duracion}
                onChange={(e) => setForm((f) => ({ ...f, duracion: e.target.value }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Salario mensual
              </label>
              <InputText
                type="number"
                value={form.salario}
                onChange={(e) => setForm((f) => ({ ...f, salario: Number(e.target.value) }))}
                className="w-full"
              />
              <p className="text-xs text-slate-500 mt-1">
                {formatCurrency(form.salario)}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Jornada (horas/semana)
              </label>
              <InputText
                type="number"
                value={form.jornada}
                onChange={(e) => setForm((f) => ({ ...f, jornada: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Cláusulas adicionales
              </label>
              <InputTextarea
                rows={3}
                placeholder="Opcional: agregue cláusulas especiales..."
                className="w-full"
              />
            </div>
          </div>
        )

      case 3:
        if (generated) {
          return (
            <div className="text-center py-8 animate-fade-in">
              <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                <i className="pi pi-check text-4xl text-emerald-600" />
              </div>
              <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
                ¡Contrato generado!
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                PDF creado, encriptado y enviado a <strong>{form.empleado?.nombre}</strong> para firma electrónica
              </p>

              <div className="mt-6 max-w-md mx-auto bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-left space-y-2">
                <Row label="ID Contrato" value={`#${generated.id}`} />
                <Row label="Empleado" value={form.empleado?.nombre} />
                <Row label="Plantilla" value={form.plantilla?.nombre} />
                <Row label="Fecha" value={formatDate(generated.fecha)} />
                <Row label="Hash SHA-256" value={generated.hash} mono />
              </div>

              <div className="flex gap-2 justify-center mt-6">
                <Button label="Descargar PDF" icon="pi pi-download" outlined />
                <Button label="Enviar a firma" icon="pi pi-send" severity="info" />
              </div>
            </div>
          )
        }
        return (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vista previa</p>
                <Chip label="DOCX" className="text-[10px] bg-violet-100 text-violet-700" />
              </div>
              <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                {SAMPLE_PLANTILLA
                  .replaceAll('{{ciudad}}', form.empleado?.sede || '___')
                  .replaceAll('{{fecha_letras}}', '___ del 2025')
                  .replaceAll('{{empresa_nombre}}', 'GTH S.A.S')
                  .replaceAll('{{empresa_nit}}', '900.123.456-7')
                  .replaceAll('{{empresa_representante}}', 'Juan Pérez')
                  .replaceAll('{{empleado_nombre}}', form.empleado?.nombre || '___')
                  .replaceAll('{{empleado_cedula}}', form.empleado?.cedula || '___')
                  .replaceAll('{{empleado_ciudad}}', form.empleado?.sede || '___')
                  .replaceAll('{{tipo_contrato}}', form.tipo || '___')
                  .replaceAll('{{empleado_cargo}}', form.empleado?.cargo || '___')
                  .replaceAll('{{empleado_area}}', form.empleado?.area || '___')
                  .replaceAll('{{salario}}', formatCurrency(form.salario))
                  .replaceAll('{{salario_letras}}', '___')
                  .replaceAll('{{jornada}}', form.jornada)
                  .replaceAll('{{sede}}', form.empleado?.sede || '___')
                  .replaceAll('{{duracion}}', form.duracion)
                  .replaceAll('{{fecha_inicio}}', formatDate(form.fechaInicio))
                  .replaceAll('{{fecha_fin_clausula}}', '')
                  .replaceAll('{{clausulas_adicionales}}', '')}
              </pre>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Summary icon="pi-file" label="Plantilla" value={form.plantilla?.nombre} />
              <Summary icon="pi-user" label="Empleado" value={form.empleado?.nombre} />
              <Summary icon="pi-calendar" label="Inicio" value={formatDate(form.fechaInicio)} />
              <Summary icon="pi-dollar" label="Salario" value={formatCurrency(form.salario)} />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div>
      <Toast ref={toast} />
      <PageHeader
        icon="pi-file-edit"
        title="Contratos"
        subtitle="Genera, firma y archiva contratos laborales"
        actions={
          <Button label="Nuevo contrato" icon="pi pi-plus" severity="info" onClick={openWizard} />
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Stat label="Total" value={data.length} icon="pi-file" color="brand" />
        <Stat label="Vigentes" value={data.filter((c) => c.estado === 'Vigente').length} icon="pi-check" color="emerald" />
        <Stat label="Por vencer" value={data.filter((c) => c.estado === 'Por vencer').length} icon="pi-clock" color="amber" />
        <Stat label="Vencidos" value={data.filter((c) => c.estado === 'Vencido').length} icon="pi-times" color="rose" />
      </div>

      <div className="card overflow-hidden">
        <DataTable value={data} paginator rows={10} className="text-sm" rowHover>
          <Column field="id" header="#" style={{ width: 60 }} />
          <Column
            header="Empleado"
            body={(r) => (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white text-xs font-semibold flex items-center justify-center">
                  {initials(r.empleado)}
                </div>
                <span className="font-medium text-slate-800 dark:text-slate-100">{r.empleado}</span>
              </div>
            )}
          />
          <Column field="tipo" header="Tipo" />
          <Column field="inicio" header="Inicio" body={(r) => formatDate(r.inicio)} />
          <Column field="fin" header="Fin" body={(r) => formatDate(r.fin)} />
          <Column
            field="estado"
            header="Estado"
            body={(r) => {
              const sev =
                r.estado === 'Vigente' ? 'success' :
                r.estado === 'Por vencer' ? 'warning' :
                r.estado === 'Vencido' ? 'danger' : 'info'
              return <Tag value={r.estado} severity={sev} rounded />
            }}
          />
          <Column
            header=""
            style={{ width: 110 }}
            body={() => (
              <div className="flex gap-1">
                <Button icon="pi pi-eye" rounded text severity="info" size="small" />
                <Button icon="pi pi-download" rounded text severity="secondary" size="small" />
                <Button icon="pi pi-send" rounded text severity="success" size="small" />
              </div>
            )}
          />
        </DataTable>
      </div>

      <Dialog
        visible={wizardVisible}
        onHide={close}
        header={
          <div className="flex items-center gap-2">
            <i className="pi pi-file-edit text-brand-600" />
            <span>Nuevo contrato</span>
          </div>
        }
        modal
        style={{ width: 'min(820px, 96vw)' }}
        contentStyle={{ paddingTop: 0 }}
      >
        <div className="mb-5">
          <Steps
            model={STEPS}
            activeIndex={step}
            onSelect={(e) => setStep(e.index)}
            readOnly={false}
            className="text-xs"
          />
        </div>

        <div className="min-h-[400px]">{renderStep()}</div>

        {!generated && (
          <div className="flex justify-between pt-4 mt-3 border-t border-slate-200 dark:border-slate-700">
            <Button
              label="Atrás"
              icon="pi pi-arrow-left"
              outlined
              size="small"
              onClick={back}
              disabled={step === 0}
            />
            {step < STEPS.length - 1 ? (
              <Button
                label="Siguiente"
                icon="pi pi-arrow-right"
                iconPos="right"
                severity="info"
                size="small"
                onClick={next}
                disabled={!canNext()}
              />
            ) : (
              <Button
                label={generating ? 'Generando...' : 'Generar contrato'}
                icon={generating ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                severity="success"
                size="small"
                onClick={generate}
                disabled={generating}
              />
            )}
          </div>
        )}
      </Dialog>
    </div>
  )
}

function Row({ label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`${mono ? 'font-mono text-[10px]' : 'font-medium'} text-slate-800 dark:text-slate-100 truncate`}>
        {value}
      </span>
    </div>
  )
}

function Summary({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
      <i className={`pi ${icon} text-slate-400`} />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{value || '—'}</p>
      </div>
    </div>
  )
}

function Stat({ label, value, icon, color }) {
  const palette = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300',
  }[color]
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${palette}`}>
        <i className={`pi ${icon}`} />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-xl font-semibold text-slate-800 dark:text-slate-100">{value}</p>
      </div>
    </div>
  )
}
