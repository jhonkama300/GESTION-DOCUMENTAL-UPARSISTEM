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
          <linearGradient id="shirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#A8CF45" />
            <stop offset="1" stopColor="#87a837" />
          </linearGradient>
          <linearGradient id="shirt-shadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#87a837" />
            <stop offset="1" stopColor="#5a7020" />
          </linearGradient>
          <linearGradient id="hair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1e293b" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbe1c4" />
            <stop offset="1" stopColor="#f4d5b3" />
          </linearGradient>
          <linearGradient id="tablet" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#334155" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="tablet-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f8fafc" />
            <stop offset="1" stopColor="#e2e8f0" />
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
          <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* círculo de fondo */}
        <circle cx="240" cy="200" r="165" fill="url(#bg-rad)" />

        {/* Sombra del cuerpo en el piso */}
        <ellipse cx="240" cy="365" rx="55" ry="5" fill="rgba(0,0,0,0.08)" />

        {/* Documento firmado volando (izquierda arriba) */}
        <g transform="translate(40, 70) rotate(-12)" filter="url(#card-shadow)">
          <rect x="0" y="0" width="60" height="76" rx="4" fill="white" />
          <rect x="6" y="8" width="28" height="2.5" rx="1" fill="#A8CF45" />
          <rect x="6" y="16" width="44" height="2" rx="1" fill="#cbd5e1" />
          <rect x="6" y="22" width="38" height="2" rx="1" fill="#cbd5e1" />
          <rect x="6" y="28" width="42" height="2" rx="1" fill="#cbd5e1" />
          <rect x="6" y="34" width="32" height="2" rx="1" fill="#cbd5e1" />
          <path d="M8 50 C 14 46 18 54 24 50 C 30 46 34 56 42 52" stroke="#1e293b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M8 50 L 50 50" stroke="#cbd5e1" strokeWidth="0.8" fill="none" strokeDasharray="2 2" />
          <circle cx="46" cy="64" r="9" fill="none" stroke="#A8CF45" strokeWidth="1.6" />
          <path d="M42 64 L45 67 L50 61" stroke="#A8CF45" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Lápiz flotante (arriba derecha, lejos del personaje) */}
        <g transform="translate(390, 90) rotate(35)" filter="url(#soft-shadow)">
          <rect x="0" y="0" width="54" height="8" rx="1" fill="#fbbf24" />
          <rect x="0" y="0" width="54" height="4" fill="#f59e0b" />
          <polygon points="54,0 62,4 54,8" fill="#f4d5b3" />
          <polygon points="60,3 62,4 60,5" fill="#1e293b" />
          <rect x="-6" y="0" width="6" height="8" rx="1" fill="#1e293b" />
        </g>

        {/* Sello de verificación (izquierda medio) */}
        <g transform="translate(35, 215)" filter="url(#card-shadow)">
          <path d="M22 0 L42 8 L42 28 C42 38 33 46 22 50 C11 46 2 38 2 28 L2 8 Z" fill="#A8CF45" />
          <path d="M14 24 L20 30 L30 18" stroke="white" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* ════════ PERSONA DE PIE ════════ */}
        <g>
          {/* Piernas (de pie, vaqueros) - visibles por debajo del tablet */}
          <path d="M222 285 L218 360 L234 360 L240 285 Z" fill="#1e293b" />
          <path d="M240 285 L246 360 L262 360 L258 285 Z" fill="#1e293b" />
          {/* zapatos */}
          <ellipse cx="226" cy="361" rx="13" ry="4" fill="#0f172a" />
          <ellipse cx="254" cy="361" rx="13" ry="4" fill="#0f172a" />
          {/* costura */}
          <line x1="228" y1="290" x2="226" y2="358" stroke="#475569" strokeWidth="0.8" opacity="0.5" />
          <line x1="252" y1="290" x2="254" y2="358" stroke="#475569" strokeWidth="0.8" opacity="0.5" />

          {/* Torso (camisa) — desde cuello hasta cadera */}
          <path
            d="M214 165
               C 214 156 222 150 240 150
               C 258 150 266 156 266 165
               L 270 240
               C 270 270 260 290 240 290
               C 220 290 210 270 210 240 Z"
            fill="url(#shirt)"
          />
          {/* sombra lateral del torso */}
          <path
            d="M256 155 C 263 160 266 165 266 165 L 270 240 C 270 265 262 282 250 288 L 256 165 Z"
            fill="url(#shirt-shadow)"
            opacity="0.4"
          />
          {/* cuello camisa (V) */}
          <path d="M226 150 L 240 167 L 254 150 L 250 148 L 240 158 L 230 148 Z" fill="url(#shirt-shadow)" opacity="0.7" />

          {/* Brazos — desde el hombro bajan y se curvan hacia el centro */}
          {/* brazo izquierdo */}
          <path
            d="M215 175
               C 200 188 188 210 192 236
               C 200 246 214 246 226 240
               L 226 226
               C 220 226 214 222 212 216
               C 212 204 218 192 224 182 Z"
            fill="url(#shirt)"
          />
          {/* brazo derecho */}
          <path
            d="M265 175
               C 280 188 292 210 288 236
               C 280 246 266 246 254 240
               L 254 226
               C 260 226 266 222 268 216
               C 268 204 262 192 256 182 Z"
            fill="url(#shirt)"
          />

          {/* Cuello */}
          <path d="M231 142 L231 158 C 231 162 235 164 240 164 C 245 164 249 162 249 158 L249 142 Z" fill="url(#skin)" />
          <path d="M231 152 L249 152 L249 158 C 249 162 245 164 240 164 C 235 164 231 162 231 158 Z" fill="#e8c19a" opacity="0.6" />

          {/* Cabeza */}
          <ellipse cx="240" cy="116" rx="28" ry="32" fill="url(#skin)" />
          {/* sombra mandíbula */}
          <path d="M216 124 C 222 138 230 146 240 146 C 250 146 258 138 264 124 C 264 142 254 150 240 150 C 226 150 216 142 216 124 Z" fill="#e8c19a" opacity="0.55" />

          {/* Cabello (corte corto) */}
          <path
            d="M212 114
               C 210 80 220 62 240 62
               C 260 62 270 80 268 114
               C 268 114 266 90 240 90
               C 214 90 212 114 212 114 Z"
            fill="url(#hair)"
          />
          <path d="M230 90 C 222 98 224 110 230 116 C 232 108 232 98 230 90 Z" fill="url(#hair)" />

          {/* Orejas */}
          <ellipse cx="213" cy="120" rx="3" ry="5" fill="url(#skin)" />
          <ellipse cx="267" cy="120" rx="3" ry="5" fill="url(#skin)" />

          {/* Cejas */}
          <path d="M223 108 Q 228 104 234 108" stroke="#1e293b" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M246 108 Q 252 104 257 108" stroke="#1e293b" strokeWidth="1.8" fill="none" strokeLinecap="round" />

          {/* Ojos */}
          <circle cx="228" cy="118" r="2.2" fill="#1e293b" />
          <circle cx="252" cy="118" r="2.2" fill="#1e293b" />
          <circle cx="229" cy="117" r="0.7" fill="white" />
          <circle cx="253" cy="117" r="0.7" fill="white" />

          {/* Mejillas */}
          <ellipse cx="220" cy="130" rx="3.5" ry="2" fill="#f5b9a0" opacity="0.55" />
          <ellipse cx="260" cy="130" rx="3.5" ry="2" fill="#f5b9a0" opacity="0.55" />

          {/* Boca sonrisa */}
          <path d="M232 136 Q 240 141 248 136" stroke="#1e293b" strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </g>

        {/* ════════ TABLET CON FIRMA (más pequeño, a la altura del pecho) ════════ */}
        <g transform="translate(180, 218) rotate(-3)" filter="url(#card-shadow)">
          {/* marco */}
          <rect x="0" y="0" width="120" height="80" rx="6" fill="url(#tablet)" />
          {/* pantalla */}
          <rect x="5" y="5" width="110" height="70" rx="3" fill="url(#tablet-screen)" />
          {/* header */}
          <rect x="5" y="5" width="110" height="12" rx="3" fill="#A8CF45" />
          <rect x="5" y="14" width="110" height="3" fill="#A8CF45" />
          <circle cx="11" cy="11" r="1.8" fill="white" opacity="0.85" />
          <rect x="17" y="9" width="32" height="2" rx="1" fill="white" opacity="0.85" />
          <rect x="17" y="13" width="20" height="1.5" rx="1" fill="white" opacity="0.6" />

          {/* label */}
          <rect x="11" y="23" width="32" height="2.5" rx="1" fill="#94a3b8" />
          <rect x="11" y="28" width="46" height="1.5" rx="1" fill="#cbd5e1" />

          {/* campo de firma */}
          <rect x="11" y="36" width="98" height="24" rx="2.5" fill="white" stroke="#cbd5e1" strokeWidth="0.8" />
          <line x1="15" y1="55" x2="92" y2="55" stroke="#cbd5e1" strokeWidth="0.6" />
          {/* firma manuscrita */}
          <path
            d="M16 51 C 21 45 26 54 32 48 C 38 42 43 54 50 49 C 57 44 62 53 70 48 C 78 43 83 51 90 47"
            stroke="#1e293b"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          {/* check de verificado */}
          <circle cx="97" cy="44" r="6" fill="#A8CF45" />
          <path d="M94 44 L96.5 46.5 L100 41.5" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {/* footer */}
          <rect x="11" y="65" width="36" height="1.5" rx="1" fill="#cbd5e1" />
          <rect x="11" y="69" width="26" height="1.5" rx="1" fill="#cbd5e1" />
          <rect x="83" y="66" width="24" height="6" rx="2" fill="#A8CF45" />
          <rect x="88" y="68.5" width="14" height="1.5" rx="1" fill="white" />
        </g>

        {/* Manos agarrando el tablet POR LOS LADOS */}
        <ellipse cx="188" cy="248" rx="9" ry="7" fill="url(#skin)" />
        <ellipse cx="292" cy="248" rx="9" ry="7" fill="url(#skin)" />
        {/* pulgares */}
        <ellipse cx="194" cy="240" rx="4" ry="2.5" fill="url(#skin)" transform="rotate(-30 194 240)" />
        <ellipse cx="286" cy="240" rx="4" ry="2.5" fill="url(#skin)" transform="rotate(30 286 240)" />

        {/* Líneas de acción (curvas alrededor del tablet) */}
        <path d="M315 240 Q 332 232 330 215" stroke="#A8CF45" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="2 3" opacity="0.6" />
        <path d="M165 240 Q 148 232 150 215" stroke="#A8CF45" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeDasharray="2 3" opacity="0.6" />

        {/* Planta (esquina inferior izquierda) */}
        <g transform="translate(35, 305)">
          <rect x="0" y="44" width="40" height="34" rx="4" fill="#1e293b" />
          <ellipse cx="20" cy="44" rx="20" ry="4" fill="#0f172a" />
          <path d="M20 44 C 6 28 -2 12 6 -4 C 16 14 20 28 20 44" fill="url(#leaf)" />
          <path d="M20 44 C 34 28 42 12 34 -4 C 24 14 20 28 20 44" fill="url(#leaf-d)" />
          <path d="M20 44 C 12 26 12 8 20 -2 C 28 8 28 26 20 44" fill="url(#leaf)" />
          <path d="M20 20 L 20 44" stroke="#3d4f17" strokeWidth="1.5" fill="none" />
        </g>
      </svg>
    </div>
  )
}
