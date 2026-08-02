import api from './api.js'

const BASE = '/usuarios'

export const usuariosService = {
  async list({ todos = true } = {}) {
    const { data } = await api.get(BASE, { params: { todos } })
    return data.data?.usuarios ?? []
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
}
