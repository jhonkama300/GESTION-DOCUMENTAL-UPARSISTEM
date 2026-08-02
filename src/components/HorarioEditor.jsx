import { useState } from 'react'
import { Button } from 'primereact/button'
import HorarioBloqueModal from './HorarioBloqueModal.jsx'
import HorarioConfigModal from './HorarioConfigModal.jsx'

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const DIA_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

function to12h(h) {
  const [hh, mm] = h.split(':').map(Number)
  const period = hh >= 12 ? 'PM' : 'AM'
  const h12 = hh % 12 || 12
  return `${h12}:${mm.toString().padStart(2, '0')} ${period}`
}

function minutosEntre(ini, fin) {
  const [hi, mi] = ini.split(':').map(Number)
  const [hf, mf] = fin.split(':').map(Number)
  return Math.max(0, (hf * 60 + mf) - (hi * 60 + mi))
}

function formatMinutos(min) {
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function calcularDescansos(bloques) {
  const porDia = {}
  bloques.forEach((b) => {
    const d = b.dia_semana
    if (!porDia[d]) porDia[d] = []
    porDia[d].push(b)
  })
  const result = {}
  for (const [dia, bs] of Object.entries(porDia)) {
    bs.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
    for (let i = 0; i < bs.length - 1; i++) {
      const gap = minutosEntre(bs[i].hora_fin, bs[i + 1].hora_inicio)
      if (gap > 0) {
        if (!result[dia]) result[dia] = []
        result[dia].push({ minutos: gap })
      }
    }
  }
  return result
}

export default function HorarioEditor({ horario, bloques, saving, onSaveHeader, onCrearBloque, onEditarBloque, onEliminarBloque }) {
  const [bloqueModalVisible, setBloqueModalVisible] = useState(false)
  const [bloqueModalMode, setBloqueModalMode] = useState('create')
  const [editingBloque, setEditingBloque] = useState(null)
  const [configVisible, setConfigVisible] = useState(false)
  const [configSaving, setConfigSaving] = useState(false)

  const descansos = calcularDescansos(bloques || [])
  const bloquesPorDia = {}
  ;(bloques || []).forEach((b) => {
    if (!bloquesPorDia[b.dia_semana]) bloquesPorDia[b.dia_semana] = []
    bloquesPorDia[b.dia_semana].push(b)
  })
  for (const d in bloquesPorDia) {
    bloquesPorDia[d].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
  }

  const openCreate = (dia) => {
    setEditingBloque({ dia_semana: dia, hora_inicio: '08:00', hora_fin: '17:00', tipo: 'normal' })
    setBloqueModalMode('create')
    setBloqueModalVisible(true)
  }

  const openEdit = (bloque) => {
    setEditingBloque({ ...bloque })
    setBloqueModalMode('edit')
    setBloqueModalVisible(true)
  }

  const handleSaveBloque = async (form) => {
    try {
      if (bloqueModalMode === 'create') {
        await onCrearBloque(form)
      } else {
        await onEditarBloque(editingBloque.id, form)
      }
      setBloqueModalVisible(false)
    } catch (e) {
      // toast handled by parent
    }
  }

  const handleSaveConfig = async (form) => {
    setConfigSaving(true)
    try {
      await onSaveHeader(form)
      setConfigVisible(false)
    } finally {
      setConfigSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-300 flex items-center justify-center">
            <i className="pi pi-calendar text-[12px]" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Bloques de trabajo</h3>
            <p className="text-[11px] text-slate-400">7 días · haz clic en + para agregar</p>
          </div>
        </div>
        <Button
          icon="pi pi-cog"
          size="small"
          text
          rounded
          severity="secondary"
          tooltip="Configurar horario"
          tooltipOptions={{ position: 'top' }}
          onClick={() => setConfigVisible(true)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6, 7].map((diaIdx) => {
          const dia = diaIdx
          const bs = bloquesPorDia[dia] || []
          const gaps = descansos[dia] || []

          return (
            <div
              key={dia}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 relative"
            >
              <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 rounded-t-xl">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center text-[11px] font-bold">
                    {DIAS[dia - 1]}
                  </span>
                  <span className="text-[10px] text-slate-400">{DIA_FULL[dia - 1]}</span>
                </div>
                <Button icon="pi pi-plus" size="small" text rounded onClick={() => openCreate(dia)} />
              </div>

              <div className="p-2 space-y-1.5 min-h-[72px] overflow-hidden rounded-b-xl">
                {bs.length === 0 ? (
                  <p className="text-[11px] text-slate-400 text-center py-3 italic">Sin bloques</p>
                ) : (
                  <>
                    {bs.map((b) => {
                      const min = minutosEntre(b.hora_inicio, b.hora_fin)
                      return (
                        <div key={b.id} className="group relative">
                          <button
                            onClick={() => openEdit(b)}
                            className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left transition-colors text-[11px] ${
                              b.tipo === 'extra'
                                ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800'
                                : 'bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-800'
                            }`}
                          >
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                              {to12h(b.hora_inicio)}
                            </span>
                            <span className="text-slate-400">–</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                              {to12h(b.hora_fin)}
                            </span>
                            <span className="text-slate-400 ml-0.5">· {formatMinutos(min)}</span>
                            {b.tipo === 'extra' && (
                              <span className="ml-auto text-[9px] font-bold uppercase tracking-wider text-amber-600 bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded-full shrink-0">
                                Extra
                              </span>
                            )}
                          </button>
                          <Button
                            icon="pi pi-trash"
                            size="small"
                            text
                            severity="danger"
                            className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 w-5 h-5 p-0 min-w-0"
                            onClick={(e) => { e.stopPropagation(); onEliminarBloque(b.id) }}
                          />
                        </div>
                      )
                    })}
                    {gaps.map((g, i) => (
                      <div key={i} className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] text-slate-400">
                        <i className="pi pi-arrow-right text-[8px]" />
                        <span>☕ {formatMinutos(g.minutos)}</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <HorarioBloqueModal
        visible={bloqueModalVisible}
        mode={bloqueModalMode}
        form={editingBloque}
        saving={saving}
        onHide={() => setBloqueModalVisible(false)}
        onSave={handleSaveBloque}
      />

      <HorarioConfigModal
        visible={configVisible}
        form={horario}
        saving={configSaving}
        onHide={() => setConfigVisible(false)}
        onSave={handleSaveConfig}
      />
    </div>
  )
}
