import api from './api.js'

/**
 * Servicio de FunctionRegistry — ITERACIÓN 7 · FASE 7
 *
 * Wrapper sobre axios para `GET /api/functions`.
 *
 * Cache en memoria: el registro de funciones cambia solo con deploys del
 * backend. TTL de 5 minutos es suficiente (mismo patrón que camposCatalogo).
 */

const CACHE_TTL_MS = 5 * 60 * 1000
let cache = { at: 0, data: null }

function isFresh(at) {
  return Date.now() - at < CACHE_TTL_MS
}

export const functionsService = {
  /**
   * GET /api/functions
   * Devuelve array de funciones: [{ name, label, description, input: { type, label } }]
   */
  list: async () => {
    if (cache.data && isFresh(cache.at)) return cache.data
    const { data } = await api.get('/functions')
    const result = data.data
    cache = { at: Date.now(), data: result }
    return result
  },

  /**
   * Funciones que aceptan input (para origen=compuesto).
   */
  listWithInput: async () => {
    const resp = await functionsService.list()
    return (resp.functions || []).filter((f) => f.input?.type !== 'none')
  },

  /**
   * Funciones sin input (para origen=funcion).
   */
  listWithoutInput: async () => {
    const resp = await functionsService.list()
    return (resp.functions || []).filter((f) => f.input?.type === 'none')
  },

  clearCache: () => {
    cache = { at: 0, data: null }
  },
}

export default functionsService
