/** Parsea 'YYYY-MM-DD' (string puro del backend) como fecha LOCAL.
 *  Evita que `new Date('2024-01-01')` se interprete como UTC midnight,
 *  que en Colombia (UTC-5) mostraría 31/12/2023 19:00 → día anterior. */
const parseLocalDate = (d) => {
  if (!d) return null
  if (d instanceof Date) return d
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d))
  if (!m) return null
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
}

export const formatDate = (d) => {
  const date = parseLocalDate(d)
  if (!date) return '—'
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export const formatCurrency = (n) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n || 0)

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')

export const avatarColor = (name = '') => {
  const palette = [
    { bg: 'bg-brand-100 dark:bg-brand-900/40',     text: 'text-brand-700 dark:text-brand-300' },
    { bg: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-700 dark:text-emerald-300' },
    { bg: 'bg-amber-100 text-amber-700', text: 'text-amber-700 dark:text-amber-300' },
    { bg: 'bg-violet-100 text-violet-700', text: 'text-violet-700 dark:text-violet-300' },
    { bg: 'bg-cyan-100 text-cyan-700', text: 'text-cyan-700 dark:text-cyan-300' },
    { bg: 'bg-rose-100 text-rose-700', text: 'text-rose-700 dark:text-rose-300' },
    { bg: 'bg-indigo-100 text-indigo-700', text: 'text-indigo-700 dark:text-indigo-300' },
    { bg: 'bg-teal-100 text-teal-700', text: 'text-teal-700 dark:text-teal-300' },
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return palette[hash % palette.length]
}

/** "Hace 5 min", "Hace 2 horas", "Hace 3 días", "Hace 1 mes"
 *  Acepta 'YYYY-MM-DD' (DATE) o 'YYYY-MM-DD HH:MM:SS' (TIMESTAMP MariaDB).
 *  Trata siempre como LOCAL para evitar desfase por UTC. */
export const formatTiempoRelativo = (fecha) => {
  if (!fecha) return '—'
  const s = String(fecha)
  let date
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [y, m, d] = s.split('-').map(Number)
    date = new Date(y, m - 1, d, 0, 0, 0)
  } else {
    const iso = s.includes('T') ? s : s.replace(' ', 'T')
    date = new Date(iso)
  }
  if (Number.isNaN(date.getTime())) return '—'
  const now = Date.now()
  const diff = Math.max(0, now - date.getTime())
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Justo ahora'
  if (min < 60) return `Hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `Hace ${h} hora${h !== 1 ? 's' : ''}`
  const d = Math.floor(h / 24)
  if (d < 30) return `Hace ${d} día${d !== 1 ? 's' : ''}`
  const mo = Math.floor(d / 30)
  if (mo < 12) return `Hace ${mo} mes${mo !== 1 ? 'es' : ''}`
  const y = Math.floor(d / 365)
  return `Hace ${y} año${y !== 1 ? 's' : ''}`
}

/** Fallback para valores vacíos */
export const orDash = (v) => (v === null || v === undefined || v === '' ? '—' : v)

/** Label legible del tipo de documento: 'CC' → 'Cédula de ciudadanía' */
export const tipoDocLabel = (code) => {
  const map = {
    CC: 'Cédula de ciudadanía',
    CE: 'Cédula de extranjería',
    TI: 'Tarjeta de identidad',
    PAS: 'Pasaporte',
    NIT: 'NIT',
    RC: 'Registro civil',
    PEP: 'Permiso especial de permanencia',
  }
  return map[code] || code || '—'
}

/** Antigüedad humana: '8 meses', '2 años 3 meses'. Devuelve { text, years, months }. */
export const calcAntiguedad = (fechaIngreso) => {
  if (!fechaIngreso) return { text: '—', years: 0, months: 0, days: 0 }
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fechaIngreso))
  if (!m) return { text: '—', years: 0, months: 0, days: 0 }
  const inicio = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (Number.isNaN(inicio.getTime())) return { text: '—', years: 0, months: 0, days: 0 }
  const hoy = new Date()
  let meses = (hoy.getFullYear() - inicio.getFullYear()) * 12 + (hoy.getMonth() - inicio.getMonth())
  if (hoy.getDate() < inicio.getDate()) meses -= 1
  if (meses < 0) return { text: '—', years: 0, months: 0, days: 0 }
  const anos = Math.floor(meses / 12)
  const mm = meses % 12
  let text
  if (anos === 0) text = `${mm} mes${mm !== 1 ? 'es' : ''}`
  else text = `${anos} año${anos !== 1 ? 's' : ''} ${mm} mes${mm !== 1 ? 'es' : ''}`
  const days = Math.floor((hoy - inicio) / 86400000)
  return { text, years: anos, months: mm, days }
}

/** Días restantes hasta una fecha futura. Negativo si ya pasó. */
export const diasHasta = (fecha) => {
  if (!fecha) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fecha))
  if (!m) return null
  const target = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (Number.isNaN(target.getTime())) return null
  return Math.ceil((target - new Date()) / 86400000)
}

/** Edad en años a partir de fecha de nacimiento */
export const calcEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fechaNacimiento))
  if (!m) return null
  const nac = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (Number.isNaN(nac.getTime())) return null
  const hoy = new Date()
  let edad = hoy.getFullYear() - nac.getFullYear()
  const mDiff = hoy.getMonth() - nac.getMonth()
  if (mDiff < 0 || (mDiff === 0 && hoy.getDate() < nac.getDate())) edad--
  return edad >= 0 ? edad : null
}
