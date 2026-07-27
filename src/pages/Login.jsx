import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { InputText } from 'primereact/inputtext'
import { Password } from 'primereact/password'
import { Button } from 'primereact/button'
import { Checkbox } from 'primereact/checkbox'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'

const QUICK = [
  { email: 'admin@gth.com', password: 'admin123', label: 'Admin', letter: 'A' },
  { email: 'rrhh@gth.com', password: 'rrhh123', label: 'RRHH', letter: 'R' },
  { email: 'supervisor@gth.com', password: 'super123', label: 'Supervisor', letter: 'S' },
  { email: 'empleado@gth.com', password: 'emp123', label: 'Empleado', letter: 'E' },
]

const QUICK_COLORS = ['#A8CF45', '#10b981', '#f59e0b', '#8b5cf6']

export default function Login() {
  const { login } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      const to = location.state?.from?.pathname || '/dashboard'
      navigate(to, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background:
          theme === 'dark'
            ? 'radial-gradient(ellipse at top, #0f1d10 0%, #0a1208 60%, #050805 100%)'
            : 'radial-gradient(ellipse at top, #f3f8e8 0%, #e8f0d8 50%, #d4e3b8 100%)',
      }}
    >
      {/* Decorativos de fondo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full blur-3xl opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(168,207,69,0.45) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-32 -right-32 w-[520px] h-[520px] rounded-full blur-3xl opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(135,168,55,0.35) 0%, transparent 70%)' }}
        />
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill={theme === 'dark' ? 'white' : '#1a2f12'} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      {/* Toggle tema */}
      <button
        onClick={toggle}
        className="absolute top-5 right-5 z-20 inline-flex items-center gap-0.5 p-1 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-lg shadow-slate-200/50 dark:shadow-black/30 border border-slate-200 dark:border-slate-700 transition-all hover:scale-105"
        aria-label="Cambiar tema"
      >
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${theme === 'light' ? 'bg-amber-100 text-amber-600' : 'text-slate-400'}`}>
          <i className="pi pi-sun" />
        </span>
        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${theme === 'dark' ? 'bg-brand-500/20 text-brand-300' : 'text-slate-400'}`}>
          <i className="pi pi-moon" />
        </span>
      </button>

      {/* Contenedor principal */}
      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* ══════════ PANEL IZQUIERDO ══════════ */}
        <div className="hidden md:flex flex-col gap-8 px-4">
          {/* Brand block */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #A8CF45 0%, #87a837 100%)',
                  boxShadow: '0 12px 28px -8px rgba(135,168,55,0.6)',
                }}
              >
                <i className="pi pi-id-card text-2xl text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">
                  GTH
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 tracking-wide uppercase">
                  Gestión Documental
                </p>
              </div>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold text-slate-900 dark:text-white leading-[1.05] tracking-tight">
              Bienvenido a tu <br />
              <span className="relative inline-block" style={{ color: '#A8CF45' }}>
                Talento Humano
                <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 240 8" preserveAspectRatio="none">
                  <path d="M0,4 Q60,0 120,4 T240,4" stroke="#A8CF45" strokeWidth="2.5" fill="none" opacity="0.6" />
                </svg>
              </span>
            </h1>

            <p className="mt-5 text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-md">
              Plataforma integral para administrar empleados, contratos,
              documentos y firma electrónica con seguridad de grado corporativo.
            </p>
          </div>

          {/* Ilustración persona */}
          <PersonIllustration />
        </div>

        {/* ══════════ CARD DE LOGIN ══════════ */}
        <div className="w-full max-w-md mx-auto md:mx-0">
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-9 border border-white/60 dark:border-slate-800 animate-fade-in"
            style={{
              boxShadow:
                '0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05), 0 24px 48px -12px rgba(135,168,55,0.18), 0 32px 64px -24px rgba(0,0,0,0.12)',
            }}
          >
            {/* Logo mobile */}
            <div className="md:hidden flex items-center gap-3 mb-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #A8CF45 0%, #87a837 100%)' }}
              >
                <i className="pi pi-id-card text-xl text-white" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-900 dark:text-white leading-none">GTH</p>
                <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider">Talento Humano</p>
              </div>
            </div>

            {/* Header card */}
            <div className="mb-7">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168,207,69,0.18) 0%, rgba(135,168,55,0.10) 100%)',
                    boxShadow: 'inset 0 0 0 1px rgba(168,207,69,0.2)',
                  }}
                >
                  <i className="pi pi-lock text-sm" style={{ color: '#87a837' }} />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-slate-900 dark:text-white leading-tight">
                    Iniciar sesión
                  </h2>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Ingresa tus credenciales para continuar
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <i className="pi pi-envelope text-[10px] text-brand-600" />
                  Correo electrónico
                </label>
                <div className="relative group">
                  <i className="pi pi-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors z-10 pointer-events-none" />
                  <InputText
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field-input pl-11 pr-4 py-3.5"
                    autoComplete="email"
                    placeholder="tu@empresa.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <i className="pi pi-lock text-[10px] text-brand-600" />
                  Contraseña
                </label>
                <div className="relative group">
                  <i className="pi pi-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600 transition-colors z-10 pointer-events-none" />
                  <Password
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    toggleMask
                    feedback={false}
                    className="field-shell w-full"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between -mt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[12.5px] text-slate-600 dark:text-slate-300 select-none">
                  <Checkbox
                    onChange={(e) => setRemember(e.checked)}
                    checked={remember}
                    binary
                    className="text-brand-500"
                  />
                  Recordarme
                </label>
                <button
                  type="button"
                  className="text-[12.5px] font-semibold hover:underline transition-colors"
                  style={{ color: '#87a837' }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {error && (
                <div className="text-[12.5px] text-rose-600 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-3 flex items-start gap-2 animate-fade-in">
                  <i className="pi pi-exclamation-circle mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                label={loading ? 'Ingresando...' : 'Iniciar sesión'}
                icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-arrow-right'}
                iconPos="right"
                loading={loading}
                className="w-full justify-center text-white font-bold border-0 mt-1 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #A8CF45 0%, #87a837 100%)',
                  boxShadow: '0 10px 24px -8px rgba(135,168,55,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
                }}
                size="large"
              />
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-dashed border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white dark:bg-slate-900 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  Demo
                </span>
              </div>
            </div>

            {/* Quick access */}
            <div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mb-3">
                Click para autocompletar credenciales
              </p>
              <div className="grid grid-cols-4 gap-2">
                {QUICK.map((q, i) => (
                  <button
                    key={q.email}
                    type="button"
                    onClick={() => { setEmail(q.email); setPassword(q.password) }}
                    className="group flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-all hover:-translate-y-0.5 hover:shadow-sm"
                  >
                    <div
                      className="w-8 h-8 rounded-lg text-white text-xs font-bold flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"
                      style={{ background: QUICK_COLORS[i] }}
                    >
                      {q.letter}
                    </div>
                    <span className="text-[10.5px] text-slate-700 dark:text-slate-300 font-semibold">
                      {q.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-5">
            © {new Date().getFullYear()} GTH – Gestión Documental
            <span className="mx-1.5 text-slate-300 dark:text-slate-600">·</span>
            Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  )
}

function PersonIllustration() {
  return (
    <div className="relative w-full h-80 flex items-center justify-center">
      <svg viewBox="0 0 480 380" className="w-full h-full max-w-lg" aria-hidden="true">
        <defs>
          <linearGradient id="bg-rad" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(168,207,69,0.18)" />
            <stop offset="100%" stopColor="rgba(168,207,69,0)" />
          </linearGradient>
          <linearGradient id="laptop-base" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#475569" />
            <stop offset="1" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="shirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#A8CF45" />
            <stop offset="1" stopColor="#87a837" />
          </linearGradient>
          <linearGradient id="hair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1e293b" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="leaf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#A8CF45" />
            <stop offset="1" stopColor="#5a7020" />
          </linearGradient>
          <linearGradient id="leaf-d" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#87a837" />
            <stop offset="1" stopColor="#3d4f17" />
          </linearGradient>
          <filter id="card-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* círculo de fondo */}
        <circle cx="240" cy="190" r="170" fill="url(#bg-rad)" />

        {/* Documentos flotando arriba izquierda */}
        <g transform="translate(60, 60)" filter="url(#card-shadow)">
          <rect x="0" y="0" width="46" height="56" rx="4" fill="white" />
          <rect x="6" y="10" width="24" height="2.5" rx="1" fill="#A8CF45" />
          <rect x="6" y="18" width="32" height="2" rx="1" fill="#cbd5e1" />
          <rect x="6" y="24" width="28" height="2" rx="1" fill="#cbd5e1" />
          <rect x="6" y="30" width="32" height="2" rx="1" fill="#cbd5e1" />
          <rect x="6" y="36" width="22" height="2" rx="1" fill="#cbd5e1" />
          <circle cx="34" cy="46" r="7" fill="#A8CF45" />
          <path d="M30 46 L33 49 L38 43" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Documento con gráfica */}
        <g transform="translate(30, 150)" filter="url(#card-shadow)">
          <rect x="0" y="0" width="56" height="68" rx="5" fill="white" />
          <rect x="8" y="8" width="22" height="2.5" rx="1" fill="#94a3b8" />
          <rect x="8" y="44" width="6" height="16" rx="1" fill="#A8CF45" />
          <rect x="18" y="36" width="6" height="24" rx="1" fill="#A8CF45" />
          <rect x="28" y="28" width="6" height="32" rx="1" fill="#87a837" />
          <rect x="38" y="40" width="6" height="20" rx="1" fill="#A8CF45" />
        </g>

        {/* Carpeta derecha */}
        <g transform="translate(380, 90)" filter="url(#card-shadow)">
          <path d="M0 14 L0 58 L70 58 L70 14 L42 14 L36 6 L0 6 Z" fill="#87a837" />
          <path d="M0 14 L70 14 L70 20 L0 20 Z" fill="#A8CF45" />
          <rect x="12" y="28" width="46" height="3.5" rx="1" fill="white" opacity="0.85" />
          <rect x="12" y="38" width="36" height="3.5" rx="1" fill="white" opacity="0.65" />
          <rect x="12" y="48" width="40" height="3.5" rx="1" fill="white" opacity="0.5" />
        </g>

        {/* Escudo seguridad */}
        <g transform="translate(395, 200)" filter="url(#card-shadow)">
          <path d="M22 0 L42 8 L42 28 C42 38 33 46 22 50 C11 46 2 38 2 28 L2 8 Z" fill="#A8CF45" />
          <path d="M14 24 L20 30 L30 18" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Silla */}
        <ellipse cx="295" cy="370" rx="90" ry="6" fill="rgba(0,0,0,0.08)" />
        <rect x="278" y="210" width="40" height="130" rx="10" fill="#334155" />
        <rect x="265" y="340" width="66" height="12" rx="3" fill="#1e293b" />
        <rect x="285" y="352" width="6" height="22" fill="#1e293b" />
        <rect x="307" y="352" width="6" height="22" fill="#1e293b" />
        <circle cx="288" cy="376" r="6" fill="#0f172a" />
        <circle cx="310" cy="376" r="6" fill="#0f172a" />

        {/* Cuerpo / camisa */}
        <path
          d="M200 220 C 200 210 215 200 240 198 C 265 200 280 210 280 220 L 290 300 C 290 320 280 330 240 330 C 200 330 190 320 190 300 Z"
          fill="url(#shirt)"
        />
        {/* brazo izquierdo */}
        <path d="M200 230 C 175 260 165 300 180 320 L 210 315 C 215 300 220 280 230 260 Z" fill="url(#shirt)" />
        {/* brazo derecho */}
        <path d="M280 230 C 305 260 310 290 295 320 L 270 315 C 270 300 265 280 255 260 Z" fill="url(#shirt)" />
        {/* manos */}
        <ellipse cx="190" cy="318" rx="10" ry="6" fill="#f4d5b3" transform="rotate(-20 190 318)" />
        <ellipse cx="290" cy="318" rx="10" ry="6" fill="#f4d5b3" transform="rotate(20 290 318)" />

        {/* Piernas */}
        <path d="M210 320 C 205 340 210 360 215 368 L 235 368 C 240 355 240 340 235 320 Z" fill="#1e293b" />
        <path d="M270 320 C 275 335 275 355 280 368 L 260 368 C 255 355 255 340 250 320 Z" fill="#1e293b" />

        {/* Cuello */}
        <rect x="228" y="185" width="24" height="20" rx="4" fill="#f4d5b3" />

        {/* Cabeza */}
        <ellipse cx="240" cy="160" rx="36" ry="40" fill="#f4d5b3" />
        {/* Cabello */}
        <path
          d="M205 155 C 200 115 220 98 250 100 C 285 102 285 135 278 160 C 275 140 270 135 260 135 C 240 135 215 140 210 155 Z"
          fill="url(#hair)"
        />
        {/* mechón al lado */}
        <path d="M275 140 C 290 150 290 180 280 200 L 273 190 C 278 175 280 160 275 140 Z" fill="url(#hair)" />
        {/* Ojos */}
        <circle cx="232" cy="162" r="2" fill="#1e293b" />
        <circle cx="250" cy="162" r="2" fill="#1e293b" />
        {/* Mejillas */}
        <ellipse cx="222" cy="172" rx="3" ry="2" fill="#f5b9a0" opacity="0.5" />
        <ellipse cx="260" cy="172" rx="3" ry="2" fill="#f5b9a0" opacity="0.5" />
        {/* Boca sonrisa */}
        <path d="M234 175 Q 240 180 248 175" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Laptop */}
        <g transform="translate(150, 300)" filter="url(#card-shadow)">
          <rect x="0" y="0" width="180" height="14" rx="2" fill="url(#laptop-base)" />
          <rect x="20" y="-50" width="140" height="50" rx="3" fill="#1e293b" />
          <rect x="25" y="-45" width="130" height="40" rx="1" fill="#A8CF45" opacity="0.2" />
          <rect x="35" y="-38" width="30" height="2" rx="1" fill="white" opacity="0.6" />
          <rect x="35" y="-32" width="50" height="2" rx="1" fill="white" opacity="0.5" />
          <rect x="35" y="-26" width="40" height="2" rx="1" fill="white" opacity="0.4" />
          <circle cx="120" cy="-25" r="6" fill="white" opacity="0.3" />
        </g>

        {/* Planta derecha */}
        <g transform="translate(395, 280)">
          <rect x="0" y="50" width="44" height="40" rx="4" fill="#1e293b" />
          <ellipse cx="22" cy="50" rx="22" ry="4" fill="#0f172a" />
          <path d="M22 50 C 6 30 -2 10 8 -8 C 18 14 22 30 22 50" fill="url(#leaf)" />
          <path d="M22 50 C 38 30 46 10 36 -8 C 26 14 22 30 22 50" fill="url(#leaf-d)" />
          <path d="M22 50 C 14 28 14 8 22 -4 C 30 8 30 28 22 50" fill="url(#leaf)" />
          <path d="M22 20 L 22 50" stroke="#3d4f17" strokeWidth="1.5" fill="none" />
        </g>
      </svg>
    </div>
  )
}
