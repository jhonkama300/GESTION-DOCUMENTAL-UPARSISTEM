import api from './api.js'

/**
 * Servicio de tiempo autoritativo.
 *
 * Devuelve la hora del servidor (configurado en America/Bogota, UTC-5)
 * independientemente del reloj local del cliente. Útil para:
 *  - Mostrar "última act." real (no afectada por mal reloj del cliente)
 *  - Validar freshness de operaciones sensibles
 *  - Detectar drift del servidor (campo external_sync.drift_seconds)
 *
 * Cache: 30 segundos para no martillar el backend.
 */

let cache = null
let cacheAt = 0
const TTL_MS = 30_000

export async function getServerTime({ force = false } = {}) {
  const now = Date.now()
  if (!force && cache && now - cacheAt < TTL_MS) {
    return cache
  }
  const { data } = await api.get('/time')
  cache = data.data
  cacheAt = now
  return cache
}

/** Devuelve la hora actual del servidor como Date. */
export async function now({ force = false } = {}) {
  const t = await getServerTime({ force })
  return new Date(t.unix * 1000)
}

/** Indica si el servidor tiene drift respecto a la referencia externa (>5s). */
export async function hasServerDrift() {
  try {
    const t = await getServerTime()
    return t.external_sync?.ok && (t.external_sync.drift_seconds ?? 0) > 5
  } catch {
    return false
  }
}

/** Formatea una fecha del servidor. Si `iso` viene del backend, lo trata como
 *  hora local de Colombia (sin conversión a local del cliente). */
export const formatServerDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}

export const formatServerDateTime = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('es-CO', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}
