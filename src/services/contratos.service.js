import api from './api.js'

/**
 * Servicio de Contratos — ITERACIÓN 4
 *
 * Wrapper axios para `/api/contratos/*`. Consumido por:
 *   - Admin UI de gestión de contratos (futuro, FASE 5/6)
 *   - Wizard genérico `/documentos` cuando origen=contrato (FASE 6)
 *   - Motor declarativo (FASE 5) cuando se resuelva `contrato.salario` etc.
 */

export const contratosService = {
  list: async ({ empleadoId, estado } = {}) => {
    const params = new URLSearchParams()
    if (empleadoId) params.set('empleado_id', empleadoId)
    if (estado) params.set('estado', estado)
    const qs = params.toString() ? `?${params}` : ''
    const { data } = await api.get(`/contratos${qs}`)
    return data.data
  },

  get: async (id) => {
    const { data } = await api.get(`/contratos/${id}`)
    return data.data
  },

  create: async (payload) => {
    const { data } = await api.post('/contratos', payload)
    return data.data
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/contratos/${id}`, payload)
    return data.data
  },

  terminar: async (id) => {
    const { data } = await api.post(`/contratos/${id}/terminar`)
    return data.data
  },

  delete: async (id) => {
    const { data } = await api.delete(`/contratos/${id}`)
    return data
  },
}

export default contratosService
