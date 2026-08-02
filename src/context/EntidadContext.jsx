import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { applyThemeToDocument, getThemeBySedeId, resetThemeToDocument } from '../utils/theme.js'

const EntidadContext = createContext(null)
const STORAGE_KEY = 'gth_current_entidad'

function loadStoredEntidad() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed && typeof parsed === 'object' && parsed.id) return parsed
    }
  } catch {}
  return null
}

export function EntidadProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [currentEntidad, setCurrentEntidad] = useState(loadStoredEntidad)
  const [validated, setValidated] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setCurrentEntidad(null)
      resetThemeToDocument()
      try { localStorage.removeItem(STORAGE_KEY) } catch {}
      setValidated(true)
      return
    }

    const stored = loadStoredEntidad()
    if (stored) {
      const canAccess = user.sedes === null || user.sedes?.some((s) => s.id === stored.id)
      if (canAccess) {
        setCurrentEntidad(stored)
      } else {
        setCurrentEntidad(null)
        try { localStorage.removeItem(STORAGE_KEY) } catch {}
      }
    } else {
      setCurrentEntidad(null)
    }
    setValidated(true)
  }, [user, authLoading])

  useEffect(() => {
    if (!currentEntidad) {
      resetThemeToDocument()
      return
    }
    applyThemeToDocument(getThemeBySedeId(currentEntidad.id))
  }, [currentEntidad])

  const selectEntidad = (entidad) => {
    setCurrentEntidad(entidad)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(entidad)) } catch {}
  }

  const clearEntidad = () => {
    setCurrentEntidad(null)
    resetThemeToDocument()
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }

  const availableEntidades = user?.sedes === null ? [] : (user?.sedes || [])

  return (
    <EntidadContext.Provider value={{ currentEntidad, selectEntidad, clearEntidad, availableEntidades }}>
      {children}
    </EntidadContext.Provider>
  )
}

export function useEntidad() {
  const ctx = useContext(EntidadContext)
  if (!ctx) throw new Error('useEntidad debe usarse dentro de EntidadProvider')
  return ctx
}
