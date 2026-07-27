import { useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Chip } from 'primereact/chip'
import { Dropdown } from 'primereact/dropdown'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { plantillasService } from '../services/mock.data.js'
import { useSede } from '../context/SedeContext.jsx'
import { formatDate } from '../utils/format.js'

const SAMPLE_BODY = `En la ciudad de {{ciudad}}, a los {{fecha_letras}}, entre {{empresa_nombre}}, NIT {{empresa_nit}}, y {{empleado_nombre}}, identificado con cédula {{empleado_cedula}}, se celebra el presente contrato de trabajo a {{tipo_contrato}} término.

PRIMERA. OBJETO. El empleado se desempeñará como {{empleado_cargo}} en el área de {{empleado_area}}, sede {{sede}}.

SEGUNDA. REMUNERACIÓN. El empleado recibirá un salario mensual de {{salario}} ({{salario_letras}}), pagado mensualmente.

TERCERA. JORNADA. La jornada de trabajo será de {{jornada}} horas semanales, distribuidas de {{jornada_distribucion}}.

CUARTA. DURACIÓN. El presente contrato tendrá una duración de {{duracion}} a partir del {{fecha_inicio}}.

{{clausulas_adicionales}}

En señal de conformidad, las partes firman en {{ciudad}} a los {{fecha_letras}}.`

export default function Plantillas() {
  const { currentSede } = useSede()
  const [data, setData] = useState([])
  const [selected, setSelected] = useState(null)
  const [variables, setVariables] = useState({})
  const [categoria, setCategoria] = useState(null)

  useEffect(() => {
    if (!currentSede) return
    plantillasService.list(currentSede.id).then((d) => {
      setData(d)
      if (d[0]) setSelected(d[0])
    })
  }, [currentSede])

  useEffect(() => {
    const matches = SAMPLE_BODY.match(/\{\{(\w+)\}\}/g) || []
    const uniq = [...new Set(matches.map((m) => m.replace(/[{}]/g, '')))]
    const obj = {}
    uniq.forEach((v) => {
      obj[v] = ''
    })
    setVariables(obj)
  }, [selected])

  const insertVariable = (key) => {
    navigator.clipboard?.writeText(`{{${key}}}`)
  }

  const filled = SAMPLE_BODY.replace(/\{\{(\w+)\}\}/g, (_, k) => variables[k] || `{{${k}}}`)

  return (
    <div>
      <PageHeader
        icon="pi-clone"
        title="Plantillas"
        subtitle="Plantillas DOCX con variables dinámicas"
        actions={
          <Button label="Nueva plantilla" icon="pi pi-plus" severity="info" />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1">
          <div className="card p-3">
            <Dropdown
              value={categoria}
              options={[
                { label: 'Todas', value: null },
                { label: 'Contratos', value: 'Contratos' },
                { label: 'Cartas', value: 'Cartas' },
              ]}
              onChange={(e) => setCategoria(e.value)}
              placeholder="Categoría"
              className="w-full mb-3"
            />
            <div className="space-y-1.5">
              {data
                .filter((p) => !categoria || p.categoria === categoria)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selected?.id === p.id
                        ? 'bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-900/40 dark:to-brand-800/30 border border-brand-200'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <i className={`pi pi-file-word ${selected?.id === p.id ? 'text-violet-600' : 'text-slate-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                          {p.nombre}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {p.variables} vars · {p.categoria}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {selected ? (
            <>
              <div className="card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                      {selected.nombre}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Tag value={selected.categoria} severity="info" />
                      <span className="text-xs text-slate-500">
                        Actualizado: {formatDate(selected.actualizado)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button label="Editar DOCX" icon="pi pi-pencil" outlined size="small" />
                    <Button label="Duplicar" icon="pi pi-copy" outlined size="small" />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Variables detectadas
                  </p>
                  <span className="text-xs text-slate-400">
                    (click para copiar)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.keys(variables).map((k) => (
                    <button key={k} onClick={() => insertVariable(k)} title="Copiar">
                      <Chip
                        label={`{{${k}}}`}
                        className="text-[10px] bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-200 cursor-pointer hover:scale-105 transition-transform"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <div className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                      <i className="pi pi-pencil mr-2 text-slate-400" />
                      Datos dinámicos
                    </h3>
                    <span className="text-xs text-slate-500">
                      {Object.keys(variables).length} campos
                    </span>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {Object.keys(variables).map((k) => (
                      <div key={k} className="grid grid-cols-3 gap-2 items-center">
                        <label className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
                          {`{{${k}}}`}
                        </label>
                        <InputText
                          value={variables[k]}
                          onChange={(e) =>
                            setVariables((v) => ({ ...v, [k]: e.target.value }))
                          }
                          placeholder="Valor..."
                          className="col-span-2 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                      <i className="pi pi-eye mr-2 text-slate-400" />
                      Vista previa
                    </h3>
                    <Chip label="DOCX" className="text-[10px] bg-violet-100 text-violet-700" />
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                      {filled}
                    </pre>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <EmptyState
              icon="pi-clone"
              title="Selecciona una plantilla"
              description="Elige una plantilla de la lista para previsualizar y editar sus variables."
            />
          )}
        </div>
      </div>
    </div>
  )
}
