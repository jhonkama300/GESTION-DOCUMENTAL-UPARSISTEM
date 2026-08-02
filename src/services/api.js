import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 15000,
})

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('gth_auth')
  if (stored) {
    try {
      const { token } = JSON.parse(stored)
      if (token) config.headers.Authorization = `Bearer ${token}`
    } catch {}
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gth_auth')
      window.dispatchEvent(new CustomEvent('auth:unauthorized'))
    }
    return Promise.reject(err)
  },
)

export default api
