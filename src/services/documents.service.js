import api from './api.js'

/**
 * Servicio de Documentos — ITERACIÓN 6 · Motor Documental Visual
 *
 * Wrapper sobre `/api/documentos/generate` (motor declarativo, FASE 5).
 *
 * Shape NUEVA (ITER 5+): el backend hace los lookups via IDs.
 *   {
 *     templateId: 'uparsistem-inferior-1-ano',
 *     context: {
 *       empleadoId: 1,
 *       contratoId: 5,
 *       entidadId:  1
 *     },
 *     manual: { OBSERVACIONES: '...' }   // variables manuales opcionales
 *   }
 *
 * Shape LEGACY (ITER 1): el frontend pasa los objetos completos.
 *   El backend hace el adapter internamente.
 */

export const documentsService = {
  /**
   * Genera un documento a partir de una plantilla.
   *
   * @param {object} payload - Ver shapes arriba
   * @returns {Promise<object>} { id, hash, docxUrl, replaced, unresolved, ... }
   */
  generate: async (payload) => {
    const { data } = await api.post('/documentos/generate', payload)
    return data.data
  },

  /**
   * Construye el payload en la nueva shape (con IDs).
   * Helper para que el wizard no tenga que armar el shape a mano.
   *
   * @param {string} templateId
   * @param {object} context { empleadoId, contratoId, entidadId }
   * @param {object} manual  { NOMBRE: 'valor', ... }
   */
  buildPayload: (templateId, context, manual = {}) => ({
    templateId,
    context,
    manual,
  }),
}

export default documentsService
