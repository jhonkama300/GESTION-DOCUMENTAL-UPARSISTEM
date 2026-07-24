import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { SEDES } from '../services/mock.data.js'

const SedeContext = createContext(null)
const STORAGE_KEY = 'gth_current_sede'

export function SedeProvider({ children }) {
  const { user } = useAuth()
  const [currentSede, setCurrentSede] = useState(null)

  useEffect(() => {
    if (!user) {
      setCurrentSede(null)
      try { localStorage.removeItem(STORAGE_KEY) } catch {}
      return
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (user.sedes?.some((s) => s.id === parsed.id)) {
          setCurrentSede(parsed)
          return
        }
      }
    } catch {}
  }, [user])

  const selectSede = (sede) => {
    setCurrentSede(sede)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sede)) } catch {}
  }

  const clearSede = () => {
    setCurrentSede(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  const availableSedes = user?.sedes || []

  return (
    <SedeContext.Provider value={{ currentSede, selectSede, clearSede, availableSedes, allSedes: SEDES }}>
      {children}
    </SedeContext.Provider>
  )
}

export function useSede() {
  const ctx = useContext(SedeContext)
  if (!ctx) throw new Error('useSede debe usarse dentro de SedeProvider')
  return ctx
}
