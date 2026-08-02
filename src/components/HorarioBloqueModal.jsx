import { useState, useEffect } from 'react'
import { Dialog } from 'primereact/dialog'
import { Dropdown } from 'primereact/dropdown'
import { InputSwitch } from 'primereact/inputswitch'
import { Button } from 'primereact/button'
import { Avatar } from 'primereact/avatar'

const DIAS = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
]

function toMinutos(h) {
  const [hh, mm] = h.split(':').map(Number)
  return hh * 60 + mm
}

function calcularDuracion(ini, fin) {
  const min = toMinutos(fin) - toMinutos(ini)
  if (min <= 0) return null
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m}min`
}

function to12h(h) {
  const [hh, mm] = h.split(':').map(Number)
  const period = hh >= 12 ? 'PM' : 'AM'
  const h12 = hh % 12 || 12
  return `${h12}:${mm.toString().padStart(2, '0')} ${period}`
}

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

export default function HorarioBloqueModal({ visible, mode, form, onHide, onSave, saving }) {
  const [local, setLocal] = useState({ dia_semana: 1, hora_inicio: '08:00', hora_fin: '17:00', tipo: 'normal' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (visible) {
      setLocal(form?.dia_semana ? { ...form } : { dia_semana: 1, hora_inicio: '08:00', hora_fin: '17:00', tipo: 'normal' })
      setError('')
    }
  }, [visible, form])

  const duracion = calcularDuracion(local.hora_inicio, local.hora_fin)
  const isValid = local.hora_inicio && local.hora_fin && toMinutos(local.hora_fin) > toMinutos(local.hora_inicio)
  const isEdit = mode === 'edit'

  const handleSave = () => {
    if (!isValid) {
      setError('La hora de fin debe ser mayor que la hora de inicio')
      return
    }
    setError('')
    onSave(local)
  }

  return (
    <Dialog
      header={
        <div className="flex items-center gap-3">
          <Avatar
            label={isEdit ? '✏' : '+'}
            size="large"
            className="bg-brand-100 text-brand-700"
            shape="circle"
          />
          <div>
            <p className="text-[15px] font-bold text-slate-800 dark:text-white">
              {isEdit ? 'Editar bloque' : 'Nuevo bloque'}
            </p>
            <p className="text-[11px] text-slate-500">
              {isEdit ? 'Modifica las horas del turno' : 'Agrega un turno de trabajo'}
            </p>
          </div>
        </div>
      }
      visible={visible}
      style={{ width: '520px', maxWidth: 'calc(100vw - 32px)' }}
      onHide={onHide}
      footer={
        <div className="flex items-center justify-between w-full">
          <div />
          <div className="flex gap-2">
            <Button label="Cancelar" outlined onClick={onHide} disabled={saving} />
            <Button
              label={saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Agregar bloque'}
              icon="pi pi-check"
              loading={saving}
              disabled={!isValid}
              onClick={handleSave}
            />
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-[180px_1fr] gap-5">
        <div className="flex flex-col gap-4">
          <section>
            <SectionTitle icon="pi-calendar" title="Día" />
            <Dropdown
              value={local.dia_semana}
              options={DIAS}
              onChange={(e) => setLocal((l) => ({ ...l, dia_semana: e.value }))}
              className="w-full"
            />
          </section>

          <section>
            <SectionTitle icon="pi-clock" title="Tipo" />
            <div className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div>
                <p className={`text-sm font-semibold ${local.tipo === 'extra' ? 'text-amber-600' : 'text-slate-700 dark:text-slate-200'}`}>
                  {local.tipo === 'extra' ? 'Hora extra' : 'Hora normal'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {local.tipo === 'extra' ? 'Se suma como extra' : 'Cuenta como normal'}
                </p>
              </div>
              <InputSwitch
                checked={local.tipo === 'extra'}
                onChange={(e) => setLocal((l) => ({ ...l, tipo: e.value ? 'extra' : 'normal' }))}
              />
            </div>
            {local.tipo === 'extra' && (
              <p className="text-[10px] text-amber-500 mt-1 italic">Las horas extra se sumarán por separado</p>
            )}
          </section>
        </div>

        <div className="flex flex-col gap-4 pt-0.5">
          <section>
            <SectionTitle icon="pi-history" title="Horario" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Hora inicio</label>
                <input
                  type="time"
                  value={local.hora_inicio}
                  onChange={(e) => setLocal((l) => ({ ...l, hora_inicio: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Hora fin</label>
                <input
                  type="time"
                  value={local.hora_fin}
                  onChange={(e) => setLocal((l) => ({ ...l, hora_fin: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                />
              </div>
            </div>
            {error && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2 mt-2">{error}</p>
            )}
            {duracion && !error && (
              <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg bg-brand-50 dark:bg-brand-950/30">
                <i className="pi pi-check-circle text-brand-600 text-xs" />
                <span className="text-xs font-semibold text-brand-700 dark:text-brand-300">Duración: {duracion} · {to12h(local.hora_inicio)} – {to12h(local.hora_fin)}</span>
              </div>
            )}
          </section>
        </div>
      </div>
    </Dialog>
  )
}
