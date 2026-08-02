import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api.js'

const AuthContext = createContext(null)

const STORAGE_KEY = 'gth_auth'

function buildSession(user, token) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    sedes: user.sedes || [],
    token,
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    function onUnauthorized() {
      setUser(null)
      setLoading(false)
    }
    window.addEventListener('auth:unauthorized', onUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', onUnauthorized)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) {
          if (!cancelled) setLoading(false)
          return
        }
        const parsed = JSON.parse(stored)
        if (!parsed?.token) {
          localStorage.removeItem(STORAGE_KEY)
          if (!cancelled) setLoading(false)
          return
        }
        try {
          const response = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${parsed.token}` },
          })
          const fresh = response.data?.data ?? response.data ?? {}
          if (!cancelled) {
            const merged = { ...parsed, ...fresh, token: parsed.token }
            setUser(merged)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
          }
        } catch (bootErr) {
          if (!cancelled) {
            if (bootErr?.response?.status === 401) {
              localStorage.removeItem(STORAGE_KEY)
              setUser(null)
            } else {
              setUser(parsed)
            }
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    bootstrap()
    return () => { cancelled = true }
  }, [])

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const payload = response.data?.data ?? response.data ?? {}
    const session = buildSession(payload.user, payload.token)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    setUser(session)
    return session
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
