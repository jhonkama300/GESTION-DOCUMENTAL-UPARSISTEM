import { useState, useEffect } from 'react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { Avatar } from 'primereact/avatar'

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <span className="w-5 h-5 rounded bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center">
        <i className={`pi ${icon} text-[10px]`} />
      </span>
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">{title}</span>
    </div>
  )
}

export default function HorarioConfigModal({ visible, form, saving, onHide, onSave }) {
  const [local, setLocal] = useState({ horas_objetivo_semanal: 48, descanso_minimo_minutos: 60 })

  useEffect(() => {
    if (visible) {
      setLocal({
        horas_objetivo_semanal: form?.horas_objetivo_semanal || 48,
        descanso_minimo_minutos: form?.descanso_minimo_minutos || 60,
      })
    }
  }, [visible, form])

  const isEdit = !!(form?.horas_objetivo_semanal)

  return (
    <Dialog
      header={
        <div className="flex items-center gap-3">
          <Avatar
            icon="pi-sliders-h"
            size="large"
            className="bg-brand-100 text-brand-700"
            shape="circle"
          />
          <div>
            <p className="text-[15px] font-bold text-slate-800 dark:text-white">
              Configuración del horario
            </p>
            <p className="text-[11px] text-slate-500">
              {isEdit ? 'Edita los parámetros del horario' : 'Define las metas de este horario'}
            </p>
          </div>
        </div>
      }
      visible={visible}
      style={{ width: '520px', maxWidth: 'calc(100vw - 32px)' }}
      onHide={onHide}
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${
              isEdit
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
            }`}>
              <i className={`pi ${isEdit ? 'pi-check-circle' : 'pi-plus-circle'} text-[10px]`} />
              {isEdit ? 'Horario configurado' : 'Sin configurar'}
            </span>
          </div>
          <div className="flex gap-2">
            <Button label="Cancelar" outlined onClick={onHide} disabled={saving} />
            <Button
              label={saving ? 'Guardando...' : 'Guardar configuración'}
              icon="pi pi-check"
              loading={saving}
              onClick={() => onSave(local)}
            />
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-[180px_1fr] gap-5">
        <div className="flex flex-col gap-5">
          <section>
            <SectionTitle icon="pi-briefcase" title="Meta semanal" />
            <div className="relative">
              <input
                type="number"
                min={1}
                max={168}
                value={local.horas_objetivo_semanal}
                onChange={(e) => setLocal((l) => ({ ...l, horas_objetivo_semanal: parseInt(e.target.value) || 48 }))}
                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-lg"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">hrs/sem</span>
            </div>
          </section>

          <section>
            <SectionTitle icon="pi-heart" title="Descanso" />
            <div className="relative">
              <input
                type="number"
                min={0}
                max={240}
                value={local.descanso_minimo_minutos}
                onChange={(e) => setLocal((l) => ({ ...l, descanso_minimo_minutos: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2.5 pr-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">min</span>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-4 pt-0.5">
          <section>
            <SectionTitle icon="pi-info-circle" title="Información" />
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4 space-y-3">
              <div className="flex items-start gap-2.5">
                <i className="pi pi-clock text-brand-500 text-xs mt-0.5" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Las <strong>horas objetivo</strong> son la meta semanal de horas normales. Se usa para calcular la diferencia que ves en las estadísticas.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <i className="pi pi-heart text-rose-400 text-xs mt-0.5" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  El <strong>descanso mínimo</strong> es el tiempo que debe haber entre dos bloques del mismo día. Es solo informativo (para referencia).
                </p>
              </div>
            </div>
          </section>

          <section>
            <SectionTitle icon="pi-chart-bar" title="Presets comunes" />
            <div className="flex flex-wrap gap-2">
              {[
                { label: '40h', obj: 40, des: 60 },
                { label: '44h', obj: 44, des: 60 },
                { label: '48h', obj: 48, des: 60 },
                { label: '36h', obj: 36, des: 30 },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => setLocal({ horas_objetivo_semanal: p.obj, descanso_minimo_minutos: p.des })}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Dialog>
  )
}
