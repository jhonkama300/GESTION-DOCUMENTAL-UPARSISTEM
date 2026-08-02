import api from './api.js'

/**
 * Servicio de Catálogo de Campos — ITERACIÓN 3 · FASE 3
 *
 * Wrapper sobre axios para `/api/campos-catalogo/*`.
 *
 * Cache en memoria: el catálogo se consulta mucho (en cada apertura del
 * Diseñador) y cambia poco. TTL de 5 minutos es suficiente.
 */

const CACHE_TTL_MS = 5 * 60 * 1000
const cache = {
  byOrigen: new Map(),     // origen → { at, data }
  all: { at: 0, data: null, includeInactive: false },
}

function isFresh(at) {
  return Date.now() - at < CACHE_TTL_MS
}

export const camposCatalogoService = {
  // ── Read

  /**
   * GET /api/campos-catalogo?origen=X
   * Devuelve array de campos. Cachea por origen durante 5 min.
   */
  list: async (origen = null, includeInactive = false) => {
    if (!origen && !includeInactive && cache.all.data && isFresh(cache.all.at)) {
      return cache.all.data
    }
    if (origen && !includeInactive && cache.byOrigen.has(origen)) {
      const entry = cache.byOrigen.get(origen)
      if (isFresh(entry.at)) return entry.data
    }

    const params = new URLSearchParams()
    if (origen) params.set('origen', origen)
    if (includeInactive) params.set('todos', 'true')
    const qs = params.toString() ? `?${params}` : ''
    const { data } = await api.get(`/campos-catalogo${qs}`)
    const result = data.data

    if (!origen && !includeInactive) {
      cache.all = { at: Date.now(), data: result, includeInactive: false }
    } else if (origen && !includeInactive) {
      cache.byOrigen.set(origen, { at: Date.now(), data: result })
    }
    return result
  },

  get: async (id) => {
    const { data } = await api.get(`/campos-catalogo/${id}`)
    return data.data
  },

  // ── Write

  create: async (payload) => {
    const { data } = await api.post('/campos-catalogo', payload)
    camposCatalogoService.clearCache()
    return data.data
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/campos-catalogo/${id}`, payload)
    camposCatalogoService.clearCache()
    return data.data
  },

  delete: async (id) => {
    const { data } = await api.delete(`/campos-catalogo/${id}`)
    camposCatalogoService.clearCache()
    return data
  },

  inactivar: async (id) => {
    const { data } = await api.post(`/campos-catalogo/${id}/inactivar`)
    camposCatalogoService.clearCache()
    return data
  },

  activar: async (id) => {
    const { data } = await api.post(`/campos-catalogo/${id}/activar`)
    camposCatalogoService.clearCache()
    return data
  },

  clearCache: () => {
    cache.all = { at: 0, data: null, includeInactive: false }
    cache.byOrigen.clear()
  },
}

export default camposCatalogoService
