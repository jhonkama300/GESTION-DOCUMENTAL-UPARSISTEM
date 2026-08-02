import api from './api.js'
import { empleadosService } from './empleados.service.js'
import { entidadesService } from './entidades.service.js'

/**
 * Servicio público de Templates — Motor Documental Genérico · FASE 6
 *
 * Wrapper sobre `/api/templates/*` para el wizard /generar-documento.
 *
 * PRINCIPIO: este servicio NO tiene lógica de tipo de documento.
 * El backend devuelve el shape declarativo y el frontend solo renderiza.
 *
 * Endpoints consumidos:
 *   GET  /api/templates                            → lista plantillas activas
 *   GET  /api/templates/{id}/requirements          → qué necesita la plantilla
 *   POST /api/templates/{id}/resolve              → resolver (mode: pending|final)
 */

// ── Resolutores de contexto (source → datos)
// El wizard pasa un context_input declarativo; este map decide
// cómo obtener los datos. Cero fetch directo en el wizard.
const CONTEXT_RESOLVERS = {
  empleado: async () => {
    return await empleadosService.list()
  },

  contrato: async (input, currentContext) => {
    if (!currentContext?.empleadoId) return []
    const { data } = await api.get('/contratos', {
      params: { empleado_id: currentContext.empleadoId },
    })
    return data.data?.contratos || []
  },

  entidad: async () => {
    const data = await entidadesService.list({ todos: true })
    return Array.isArray(data) ? data : (data.entidades || [])
  },
}

export const templatesService = {
  /**
   * Lista plantillas activas.
   * @returns {Promise<{templates: Array, total: number}>}
   */
  list: async () => {
    const { data } = await api.get('/templates')
    return data.data
  },

  /**
   * Devuelve el requirements declarativo de una plantilla.
   * @param {string|number} id - numérico o slug
   * @returns {Promise<{plantilla, version, needs, context_inputs, manual_inputs, ...}>}
   */
  getRequirements: async (id) => {
    const { data } = await api.get(`/templates/${id}/requirements`)
    return data.data
  },

  /**
   * Resuelve la plantilla con el contexto dado.
   *
   * mode='pending' → devuelve qué falta para poder generar.
   * mode='final'   → devuelve preview completo.
   */
  resolve: async (id, context = {}, manual = {}, mode = 'final') => {
    const { data } = await api.post(`/templates/${id}/resolve`, { context, manual, mode })
    return data.data
  },

  /**
   * Carga las opciones de un context_input declarativo.
   * El wizard llama esto por cada context_input que necesite renderizar.
   *
   * @param {{source: string, label: string, endpoint?: string, depends_on?: string}} input
   * @param {object} currentContext - contexto ya seleccionado (para inputs que dependen de otros)
   * @returns {Promise<Array>} opciones para mostrar en el picker
   */
  loadContext: async (input, currentContext = {}) => {
    const resolver = CONTEXT_RESOLVERS[input.source]
    if (!resolver) {
      console.warn(`[templatesService] No resolver para source='${input.source}'`)
      return []
    }
    return resolver(input, currentContext)
  },
}

export default templatesService

