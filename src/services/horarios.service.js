import api from './api.js'

export const horariosService = {
  async getHorario(empleadoId) {
    const { data } = await api.get(`/empleados/${empleadoId}/horario`)
    return data.data
  },

  async saveHorario(empleadoId, payload) {
    const { data } = await api.put(`/empleados/${empleadoId}/horario`, payload)
    return data.data
  },

  async crearBloque(empleadoId, payload) {
    const { data } = await api.post(`/empleados/${empleadoId}/horario/bloques`, payload)
    return data.data
  },

  async actualizarBloque(bloqueId, payload) {
    const { data } = await api.put(`/horario/bloques/${bloqueId}`, payload)
    return data.data
  },

  async eliminarBloque(bloqueId) {
    const { data } = await api.delete(`/horario/bloques/${bloqueId}`)
    return data.data
  },
}
