import api from './api.js'

export const empleadosService = {
  async list(sedeId) {
    const { data } = await api.get('/empleados', { params: sedeId ? { sede_id: sedeId } : {} })
    return data.data?.empleados ?? []
  },

  async get(id) {
    const { data } = await api.get(`/empleados/${id}`)
    return data.data
  },

  async create(payload) {
    const { data } = await api.post('/empleados', payload)
    return data.data
  },

  async update(id, payload) {
    const { data } = await api.put(`/empleados/${id}`, payload)
    return data.data
  },

  async remove(id) {
    const { data } = await api.delete(`/empleados/${id}`)
    return data.data
  },
}
