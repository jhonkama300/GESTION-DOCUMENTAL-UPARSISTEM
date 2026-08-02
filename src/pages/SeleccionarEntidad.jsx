import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from 'primereact/button'
import { useAuth } from '../context/AuthContext.jsx'
import { useEntidad } from '../context/EntidadContext.jsx'
import { entidadesService } from '../services/entidades.service.js'
import { resetThemeToDocument } from '../utils/theme.js'

export default function SeleccionarEntidad() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const { selectEntidad } = useEntidad()
  const [entidades, setEntidades] = useState([])

  useEffect(() => {
    resetThemeToDocument()
  }, [])

  useEffect(() => {
    let alive = true
    entidadesService
      .list({ todos: true })
      .then((list) => {
        if (alive) setEntidades(list)
      })
    return () => {
      alive = false
    }
  }, [])

  const choose = (entidad) => {
    selectEntidad(entidad)
    const to = location.state?.from?.pathname || '/dashboard'
    navigate(to, { replace: true })
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at top, #f3f8e8 0%, #e8f0d8 50%, #d4e3b8 100%)',
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(168,207,69,0.45) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[520px] h-[520px] rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.35) 0%, transparent 70%)' }}
        />
      </div>

      <button
        onClick={handleLogout}
        className="absolute top-5 right-5 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur shadow border border-slate-200 text-xs text-slate-600 hover:bg-white"
      >
        <i className="pi pi-sign-out" />
        <span>Cerrar sesión</span>
      </button>

      <div className="relative z-10 w-full max-w-3xl">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] px-3 py-1.5 rounded-full border border-brand-500/30 text-brand-700 bg-brand-50">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-slow" />
            {entidades.length || 0} entidades disponibles
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 tracking-tight">
            ¿Con qué organización quieres{' '}
            <span className="relative inline-block" style={{ color: '#A8CF45' }}>
              trabajar?
              <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" preserveAspectRatio="none">
                <path d="M0,4 Q50,0 100,4 T200,4" stroke="#A8CF45" strokeWidth="2.5" fill="none" opacity="0.6" />
              </svg>
            </span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-3 max-w-md mx-auto">
            Hola <span className="font-semibold text-slate-800 dark:text-white">{user?.name}</span>, selecciona la entidad
            con la que vas a trabajar. Podrás cambiarla en cualquier momento desde la barra superior.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
          {entidades.length === 0 ? (
            <div className="sm:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border-2 border-slate-100 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                <i className="pi pi-building text-slate-400 text-xl" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                No tienes entidades asignadas
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Un administrador debe asignarte al menos una entidad para continuar.
              </p>
            </div>
          ) : (
            entidades.map((e) => (
              <button
                key={e.id}
                onClick={() => choose(e)}
                className="group relative bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-slate-100 dark:border-slate-800 hover:border-brand-400 hover:shadow-xl hover:-translate-y-1 transition-all text-left"
                style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.04)' }}
              >
                <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  style={{ background: e.color }}
                >
                  <i className="pi pi-arrow-right text-white" />
                </div>

              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 overflow-hidden shadow-md"
                style={
                  e.logo_url
                    ? { background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }
                    : { background: `linear-gradient(135deg, ${e.color} 0%, ${e.color}dd 100%)` }
                }
              >
                {e.logo_url ? (
                  <img src={e.logo_url} alt={`Logo de ${e.nombre}`} className="w-full h-full object-contain p-1.5" />
                ) : (
                  <span className="text-white text-xl font-bold">{e.iniciales}</span>
                )}
              </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {e.nombre}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {e.descripcion || 'Entidad registrada en el sistema'}
                </p>

                <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
                    {e.id === 1 ? 'Entidad principal' : 'Entidad aliada'}
                  </span>
                  <span className="text-xs font-semibold text-brand-600 group-hover:underline">
                    Ingresar →
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-8">
          La sesión y datos se filtran automáticamente por la entidad seleccionada.
        </p>
      </div>
    </div>
  )
}
