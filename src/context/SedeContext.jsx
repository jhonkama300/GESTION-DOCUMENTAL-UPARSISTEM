import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { applyThemeToDocument, getThemeBySedeId, resetThemeToDocument } from '../utils/theme.js'

const SedeContext = createContext(null)
const STORAGE_KEY = 'gth_current_sede'

function loadStoredSede() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && typeof parsed === 'object' && parsed.id) return parsed
    }
  } catch {}
  return null
}

export function SedeProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [currentSede, setCurrentSede] = useState(loadStoredSede)
  const [validated, setValidated] = useState(false)

  useEffect(() => {
    // Esperar a que Auth termine de cargar
    if (authLoading) return

    if (!user) {
      setCurrentSede(null)
      resetThemeToDocument()
      try { localStorage.removeItem(STORAGE_KEY) } catch {}
      setValidated(true)
      return
    }

    const stored = loadStoredSede()
    if (stored && user.sedes?.some((s) => s.id === stored.id)) {
      setCurrentSede(stored)
    } else {
      setCurrentSede(null)
      try { localStorage.removeItem(STORAGE_KEY) } catch {}
    }
    setValidated(true)
  }, [user, authLoading])

  // ── Aplicar tema dinámico según la sede
  useEffect(() => {
    if (!currentSede) {
      resetThemeToDocument()
      return
    }
    applyThemeToDocument(getThemeBySedeId(currentSede.id))
  }, [currentSede])

  const selectSede = (sede) => {
    setCurrentSede(sede)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sede)) } catch {}
  }

  const clearSede = () => {
    setCurrentSede(null)
    resetThemeToDocument()
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  const availableSedes = user?.sedes || []

  return (
    <SedeContext.Provider value={{ currentSede, selectSede, clearSede, availableSedes }}>
      {children}
    </SedeContext.Provider>
  )
}

export function useSede() {
  const ctx = useContext(SedeContext)
  if (!ctx) throw new Error('useSede debe usarse dentro de SedeProvider')
  return ctx
}
