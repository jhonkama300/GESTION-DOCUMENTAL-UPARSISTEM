// ── Servicio para consumir la API pública de ESCO
//     ESCO = European Skills, Competences, Qualifications and Occupations
//     Docs: https://ec.europa.eu/esco/portal/api-doc
//
//     ⚠️ Nota: ESCO no envía cabeceras CORS por defecto, por lo que las llamadas
//     directas desde el navegador pueden fallar con CORS. En ese caso, se hace
//     fallback automático a la lista local CARGOS de programas.js.

const ESCO_BASE = 'https://ec.europa.eu/esco/api'
let escoCache = { hits: null, ts: 0 }
const CACHE_TTL = 1000 * 60 * 60 * 6 // 6 horas

function normalize(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export const escoService = {
  /**
   * Busca ocupaciones en ESCO. Devuelve array de strings con los títulos.
   * Si falla (CORS, red, etc.) devuelve null y el caller debe usar fallback.
   */
  async searchOccupations(text, limit = 25) {
    const q = (text || '').trim()
    if (q.length < 2) return null

    try {
      const params = new URLSearchParams({
        text: q,
        type: 'occupation',
        language: 'es',
        limit: String(limit),
      })
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 4000)
      const res = await fetch(`${ESCO_BASE}/v2/search?${params}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })
      clearTimeout(timer)
      if (!res.ok) throw new Error(`ESCO ${res.status}`)
      const data = await res.json()
      const results = data?._embedded?.results || data?.results || []
      return results
        .map((r) => r.title || r.label || r.preferredLabel)
        .filter(Boolean)
        .slice(0, limit)
    } catch (e) {
      console.warn('[ESCO] no disponible:', e.message)
      return null
    }
  },

  /**
   * Devuelve una lista amplia de ocupaciones (top N por ESCO, fallback local).
   * Usa caché para no martillar la API.
   */
  async getTopOccupations(limit = 200) {
    const now = Date.now()
    if (escoCache.hits && now - escoCache.ts < CACHE_TTL) {
      return escoCache.hits.slice(0, limit)
    }

    try {
      const params = new URLSearchParams({
        text: 'a',
        type: 'occupation',
        language: 'es',
        limit: String(limit),
      })
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 5000)
      const res = await fetch(`${ESCO_BASE}/v2/search?${params}`, {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })
      clearTimeout(timer)
      if (!res.ok) throw new Error(`ESCO ${res.status}`)
      const data = await res.json()
      const results = data?._embedded?.results || data?.results || []
      const titles = results
        .map((r) => r.title || r.label || r.preferredLabel)
        .filter(Boolean)
      if (titles.length > 0) {
        escoCache = { hits: titles, ts: now }
        return titles.slice(0, limit)
      }
      throw new Error('Sin resultados')
    } catch (e) {
      console.warn('[ESCO] fallback local:', e.message)
      return null
    }
  },

  clearCache() {
    escoCache = { hits: null, ts: 0 }
  },
}

export default escoService
