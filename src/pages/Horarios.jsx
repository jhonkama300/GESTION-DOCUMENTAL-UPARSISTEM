import { useState } from 'react'
import { Button } from 'primereact/button'
import { Dropdown } from 'primereact/dropdown'
import PageHeader from '../components/PageHeader.jsx'
import { initials } from '../utils/format.js'

const TURNOS = [
  { id: 1, empleado: 'Laura Pérez', cargo: 'Desarrolladora', sede: 'Bogotá', turno: 'L-V 8-17', horas: 45 },
  { id: 2, empleado: 'Carlos Méndez', cargo: 'Diseñador UX', sede: 'Medellín', turno: 'L-V 9-18', horas: 45 },
  { id: 3, empleado: 'Ana Rodríguez', cargo: 'Analista RRHH', sede: 'Bogotá', turno: 'L-V 7-16', horas: 45 },
  { id: 4, empleado: 'Diego Ramírez', cargo: 'Contador', sede: 'Cali', turno: 'L-V 8-17', horas: 45 },
  { id: 5, empleado: 'Andrés López', cargo: 'PM', sede: 'Medellín', turno: 'L-S 9-15', horas: 36 },
]

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export default function Horarios() {
  const [sede, setSede] = useState(null)

  return (
    <div>
      <PageHeader
        icon="pi-clock"
        title="Horarios"
        subtitle="Turnos y jornadas por sede"
        actions={
          <div className="flex gap-2">
            <Dropdown
              value={sede}
              options={['Bogotá', 'Medellín', 'Cali'].map((s) => ({ label: s, value: s }))}
              onChange={(e) => setSede(e.value)}
              placeholder="Todas las sedes"
              className="w-48"
              showClear
            />
            <Button label="Nuevo horario" icon="pi pi-plus" severity="info" size="small" />
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TURNOS.filter((t) => !sede || t.sede === sede).map((t) => (
          <div key={t.id} className="card card-hover p-5">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-white font-semibold flex items-center justify-center shrink-0">
                {initials(t.empleado)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{t.empleado}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.cargo}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-7 gap-1">
              {DIAS.map((d, i) => (
                <div
                  key={d}
                  className={`text-center text-[10px] py-1.5 rounded ${
                    i < 5 || (i === 5 && t.turno.includes('S'))
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                  }`}
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs">
              <span className="text-slate-500">
                <i className="pi pi-clock text-[10px] mr-1" />
                {t.turno}
              </span>
              <span className="font-semibold text-brand-600">{t.horas}h/sem</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
