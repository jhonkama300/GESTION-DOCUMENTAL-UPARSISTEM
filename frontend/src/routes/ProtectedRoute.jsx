import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-slate-500">
        Cargando...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-slate-600">
        <i className="pi pi-lock text-5xl mb-4 text-rose-500" />
        <h2 className="text-2xl font-semibold">Acceso denegado</h2>
        <p>No tiene permisos para acceder a esta sección.</p>
      </div>
    )
  }

  return children
}
