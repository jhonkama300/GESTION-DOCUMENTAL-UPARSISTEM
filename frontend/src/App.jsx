import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

import AuthLayout from './layouts/AuthLayout.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import { useSede } from './context/SedeContext.jsx'

import Login from './pages/Login.jsx'
import SedeSelector from './pages/SedeSelector.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Empleados from './pages/Empleados.jsx'
import Contratos from './pages/Contratos.jsx'
import Plantillas from './pages/Plantillas.jsx'
import Documentos from './pages/Documentos.jsx'
import Certificaciones from './pages/Certificaciones.jsx'
import Horarios from './pages/Horarios.jsx'
import Sedes from './pages/Sedes.jsx'
import Usuarios from './pages/Usuarios.jsx'
import Reportes from './pages/Reportes.jsx'
import Auditoria from './pages/Auditoria.jsx'
import Configuracion from './pages/Configuracion.jsx'
import Notificaciones from './pages/Notificaciones.jsx'
import Perfil from './pages/Perfil.jsx'
import Ayuda from './pages/Ayuda.jsx'
import NotFound from './pages/NotFound.jsx'

function RequireSede({ children }) {
  const { currentSede } = useSede()
  const location = useLocation()
  if (!currentSede) {
    return <Navigate to="/seleccionar-sede" state={{ from: location }} replace />
  }
  return children
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        }
      />

      <Route
        path="/seleccionar-sede"
        element={
          <ProtectedRoute>
            <SedeSelector />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <RequireSede>
              <MainLayout />
            </RequireSede>
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/empleados" element={<Empleados />} />
        <Route path="/contratos" element={<Contratos />} />
        <Route path="/plantillas" element={<Plantillas />} />
        <Route path="/documentos" element={<Documentos />} />
        <Route path="/certificaciones" element={<Certificaciones />} />
        <Route path="/horarios" element={<Horarios />} />
        <Route path="/sedes" element={<Sedes />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/auditoria" element={<Auditoria />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="/notificaciones" element={<Notificaciones />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/ayuda" element={<Ayuda />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
