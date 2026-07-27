import { useEffect, useState } from 'react'
import { Button } from 'primereact/button'
import { Tag } from 'primereact/tag'
import { Avatar } from 'primereact/avatar'
import PageHeader from '../components/PageHeader.jsx'
import { sedesService } from '../services/mock.data.js'
import { useSede } from '../context/SedeContext.jsx'
import { formatDate, initials } from '../utils/format.js'

export default function Sedes() {
  const [data, setData] = useState([])
  const [selected, setSelected] = useState(null)
  const { currentSede, selectSede } = useSede()

  useEffect(() => {
    sedesService.list().then((d) => {
      setData(d)
      setSelected(d[0])
    })
  }, [])

  const total = {
    empleados: data.reduce((a, s) => a + s.empleados, 0),
    contratos: data.reduce((a, s) => a + s.contratos, 0),
    usuarios: data.reduce((a, s) => a + s.usuarios, 0),
  }

  return (
    <div>
      <PageHeader
        icon="pi-building"
        title="Sedes registradas"
        subtitle={`${data.length} organizaciones · ${total.empleados} empleados · ${total.contratos} contratos`}
        actions={
          <div className="flex gap-2">
            <Button label="Asignar usuarios" icon="pi pi-user-plus" outlined size="small" />
            <Button label="Registrar sede" icon="pi pi-plus" severity="info" size="small" />
          </div>
        }
      />

      {/* Stats globales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Stat icon="pi-building" label="Organizaciones" value={data.length} color="brand" />
        <Stat icon="pi-users" label="Empleados totales" value={total.empleados} color="emerald" />
        <Stat icon="pi-file-edit" label="Contratos activos" value={total.contratos} color="amber" />
        <Stat icon="pi-user-edit" label="Usuarios sistema" value={total.usuarios} color="violet" />
      </div>

      {/* Cards de sedes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {data.map((s) => {
          const isCurrent = currentSede?.id === s.id
          return (
            <div
              key={s.id}
              onClick={() => setSelected(s)}
              className={`card p-0 overflow-hidden cursor-pointer card-hover relative ${
                selected?.id === s.id ? 'ring-2 ring-brand-400' : ''
              }`}
            >
              {/* Cover gradient */}
              <div
                className="h-20 relative"
                style={{ background: `linear-gradient(135deg, ${s.color} 0%, ${s.color}dd 100%)` }}
              >
                <div className="absolute inset-0 opacity-20">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id={`p-${s.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1.5" fill="white" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#p-${s.id})`} />
                  </svg>
                </div>
                {isCurrent && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-[10px] font-bold text-brand-700 flex items-center gap-1">
                    <i className="pi pi-check-circle text-[10px]" />
                    ACTIVA
                  </div>
                )}
              </div>

              <div className="px-5 pb-5 -mt-8">
                <div className="flex items-end gap-3 mb-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold ring-4 ring-white shadow-lg"
                    style={{ background: s.color }}
                  >
                    {s.iniciales}
                  </div>
                  <div className="flex-1 pb-1 min-w-0">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
                      {s.nombre}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      NIT {s.nit}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                  {s.descripcion}
                </p>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
                    <p className="text-[10px] text-slate-500 uppercase">Empleados</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{s.empleados}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
                    <p className="text-[10px] text-slate-500 uppercase">Contratos</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{s.contratos}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-center">
                    <p className="text-[10px] text-slate-500 uppercase">Usuarios</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{s.usuarios}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <i className="pi pi-map-marker text-[10px] text-slate-400" />
                    <span className="truncate">{s.direccion}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <i className="pi pi-phone text-[10px] text-slate-400" />
                    <span>{s.telefono}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <i className="pi pi-envelope text-[10px] text-slate-400" />
                    <span className="truncate">{s.email}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-3">
                  {s.ciudades.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <i className="pi pi-map text-[8px]" />
                      {c}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <Tag value={s.estado} severity="success" rounded />
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 dark:text-brand-300">
                      <i className="pi pi-check-circle text-[10px]" />
                      Sede actual
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">Solo lectura</span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detalle de la sede seleccionada */}
      {selected && (
        <div className="card p-5 animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                Detalle de {selected.nombre}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Registrada el {formatDate(selected.fechaRegistro)} · Representante: {selected.representante}
              </p>
            </div>
            <Button label="Editar información" icon="pi pi-pencil" outlined size="small" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Info label="NIT" value={selected.nit} />
            <Info label="Representante legal" value={selected.representante} />
            <Info label="Email corporativo" value={selected.email} />
            <Info label="Teléfono" value={selected.telefono} />
            <Info label="Dirección" value={selected.direccion} full />
            <Info label="Ciudades" value={selected.ciudades.join(' · ')} full />
            <Info label="Empleados" value={String(selected.empleados)} green />
            <Info label="Contratos" value={String(selected.contratos)} green />
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ icon, label, value, color }) {
  const palette = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  }[color]
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${palette}`}>
        <i className={`pi ${icon}`} />
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
      </div>
    </div>
  )
}

function Info({ label, value, full, green }) {
  return (
    <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 ${full ? 'md:col-span-2 lg:col-span-4' : ''}`}>
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`text-sm font-semibold mt-0.5 ${green ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-100'}`}>
        {value}
      </p>
    </div>
  )
}
