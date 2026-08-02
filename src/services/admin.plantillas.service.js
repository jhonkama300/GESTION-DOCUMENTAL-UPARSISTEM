import api from './api.js'

/**
 * Servicio admin — Plantillas · ITERACIÓN 1 · FASE 1
 *
 * Wrapper sobre axios para los endpoints `/api/admin/plantillas/*`.
 * La base de axios es `VITE_API_URL` (ver `services/api.js`).
 *
 * NOTA: el upload de DOCX usa multipart/form-data con campo `file`.
 * El backend extrae el archivo via `$_FILES['file']` y `$_POST['notas']`.
 */

const BASE = '/admin/plantillas'

export const plantillasAdminService = {
  // ── Plantillas (CRUD)

  list: async () => {
    const { data } = await api.get(BASE)
    return data.data
  },

  get: async (id) => {
    const { data } = await api.get(`${BASE}/${id}`)
    return data.data
  },

  create: async ({ slug, nombre, descripcion, tipoDocumento, categoria }) => {
    const { data } = await api.post(BASE, {
      slug,
      nombre,
      descripcion,
      tipoDocumento,
      categoria,
    })
    return data.data
  },

  update: async (id, payload) => {
    const { data } = await api.put(`${BASE}/${id}`, payload)
    return data.data
  },

  softDelete: async (id) => {
    const { data } = await api.delete(`${BASE}/${id}`)
    return data
  },

  restore: async (id) => {
    const { data } = await api.post(`${BASE}/${id}/restore`)
    return data.data
  },

  // ── Versiones

  listVersions: async (id) => {
    const { data } = await api.get(`${BASE}/${id}/versiones`)
    return data.data
  },

  /**
   * Sube una nueva versión del DOCX.
   * @param {number} id - id de la plantilla
   * @param {File} file - archivo DOCX
   * @param {string} [notas] - notas opcionales del cambio
   * @param {function} [onUploadProgress] - callback para progress del upload
   */
  uploadVersion: async (id, file, notas = '', onUploadProgress = null) => {
    const formData = new FormData()
    formData.append('file', file)
    if (notas) formData.append('notas', notas)
    const { data } = await api.post(`${BASE}/${id}/versiones`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    })
    return data.data
  },

  activateVersion: async (id, versionId) => {
    const { data } = await api.post(`${BASE}/${id}/versiones/${versionId}/activar`)
    return data
  },

  deleteVersion: async (id, versionId) => {
    const { data } = await api.delete(`${BASE}/${id}/versiones/${versionId}`)
    return data
  },

  // ── Variables (ITERACIÓN 2 · FASE 2: Diseñador Visual)

  /**
   * GET /api/admin/plantillas/{id}/variables
   * Devuelve las variables detectadas en la versión activa + su config guardada.
   */
  getVariables: async (id) => {
    const { data } = await api.get(`${BASE}/${id}/variables`)
    return data.data
  },

  /**
   * PUT /api/admin/plantillas/{id}/variables
   * @param {Array} variables - Array de configs: [{nombre_variable, origen, campo_nombre, ...}, ...]
   */
  saveVariables: async (id, variables) => {
    const { data } = await api.put(`${BASE}/${id}/variables`, { variables })
    return data.data
  },
}

export default plantillasAdminService
