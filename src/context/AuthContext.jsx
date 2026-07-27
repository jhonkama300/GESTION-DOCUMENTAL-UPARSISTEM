import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'gth_auth'
const MOCK_USERS = [
  {
    id: 1,
    email: 'admin@gth.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'Administrador',
    sedes: [
      { id: 1, nombre: 'Uparsistem', iniciales: 'UP', color: '#A8CF45', descripcion: 'Empresa de tecnología' },
      { id: 2, nombre: 'Jeanpiaget', iniciales: 'JP', color: '#10b981', descripcion: 'Institución educativa' },
    ],
  },
  {
    id: 2,
    email: 'admin2@gth.com',
    password: 'admin123',
    name: 'María Salazar',
    role: 'Administrador',
    sedes: [
      { id: 1, nombre: 'Uparsistem', iniciales: 'UP', color: '#A8CF45', descripcion: 'Empresa de tecnología' },
      { id: 2, nombre: 'Jeanpiaget', iniciales: 'JP', color: '#10b981', descripcion: 'Institución educativa' },
    ],
  },
  {
    id: 3,
    email: 'admin3@gth.com',
    password: 'admin123',
    name: 'Roberto Silva',
    role: 'Administrador',
    sedes: [
      { id: 1, nombre: 'Uparsistem', iniciales: 'UP', color: '#A8CF45', descripcion: 'Empresa de tecnología' },
    ],
  },
  {
    id: 4,
    email: 'rrhh@gth.com',
    password: 'rrhh123',
    name: 'Ana Rodríguez',
    role: 'Administrativo',
    sedes: [
      { id: 1, nombre: 'Uparsistem', iniciales: 'UP', color: '#A8CF45', descripcion: 'Empresa de tecnología' },
      { id: 2, nombre: 'Jeanpiaget', iniciales: 'JP', color: '#10b981', descripcion: 'Institución educativa' },
    ],
  },
  {
    id: 5,
    email: 'admin4@gth.com',
    password: 'admin123',
    name: 'Pedro Gómez',
    role: 'Administrador',
    sedes: [
      { id: 2, nombre: 'Jeanpiaget', iniciales: 'JP', color: '#10b981', descripcion: 'Institución educativa' },
    ],
  },
]

function buildSession(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    sedes: user.sedes || [],
    token: 'mock-jwt-' + Math.random().toString(36).slice(2),
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Refrescar sedes desde MOCK_USERS para reflejar cambios
        const live = MOCK_USERS.find((u) => u.id === parsed.id)
        if (live) {
          const merged = { ...parsed, sedes: live.sedes || [] }
          setUser(merged)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
        } else {
          setUser(parsed)
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    await new Promise((r) => setTimeout(r, 600))
    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password,
    )
    if (!found) {
      throw new Error('Credenciales inválidas')
    }
    const session = buildSession(found)
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
