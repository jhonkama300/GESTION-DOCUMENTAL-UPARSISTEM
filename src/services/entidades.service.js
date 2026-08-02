import api from './api.js'

const BASE = '/sedes'

export const entidadesService = {
  async list({ todos = false } = {}) {
    const { data } = await api.get(BASE, { params: todos ? { todos } : {} })
    return data.data?.sedes ?? []
  },

  async misEntidades() {
    const { data } = await api.get(`${BASE}/mias`)
    return data.data?.sedes ?? []
  },

  async get(id) {
    const { data } = await api.get(`${BASE}/${id}`)
    return data.data
  },

  async create(payload) {
    const { data } = await api.post(BASE, payload)
    return data.data
  },

  async update(id, payload) {
    const { data } = await api.put(`${BASE}/${id}`, payload)
    return data.data
  },

  async delete(id) {
    const { data } = await api.delete(`${BASE}/${id}`)
    return data.data
  },

  async uploadLogo(id, file) {
    const form = new FormData()
    form.append('file', file)
    const { data } = await api.post(`${BASE}/${id}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data.data
  },

  async removeLogo(id) {
    const { data } = await api.delete(`${BASE}/${id}/logo`)
    return data.data
  },
}
