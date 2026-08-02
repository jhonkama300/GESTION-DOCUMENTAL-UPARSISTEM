import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

import AuthLayout from './layouts/AuthLayout.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import ProtectedRoute from './routes/ProtectedRoute.jsx'
import { useEntidad } from './context/EntidadContext.jsx'
import { useAuth } from './context/AuthContext.jsx'

import Login from './pages/Login.jsx'
import SeleccionarEntidad from './pages/SeleccionarEntidad.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Empleados from './pages/Empleados.jsx'
import PlantillasAdmin from './pages/admin/PlantillasAdmin.jsx'
import DisenadorPlantilla from './pages/admin/DisenadorPlantilla.jsx'
import CamposCatalogo from './pages/admin/CamposCatalogo.jsx'
import ContratosAdmin from './pages/admin/ContratosAdmin.jsx'
import Documentos from './pages/Documentos.jsx'
import DocumentosWizard from './pages/DocumentosWizard.jsx'
import Certificaciones from './pages/Certificaciones.jsx'
import Horarios from './pages/Horarios.jsx'
import Entidades from './pages/Entidades.jsx'
import Usuarios from './pages/Usuarios.jsx'
import Reportes from './pages/Reportes.jsx'
import Auditoria from './pages/Auditoria.jsx'
import Configuracion from './pages/Configuracion.jsx'
import Notificaciones from './pages/Notificaciones.jsx'
import Perfil from './pages/Perfil.jsx'
import Ayuda from './pages/Ayuda.jsx'
import NotFound from './pages/NotFound.jsx'

function RequireEntidad({ children }) {
  const { currentEntidad } = useEntidad()
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  if (authLoading) {
    return <FullScreenLoader />
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (!currentEntidad) {
    return <Navigate to="/seleccionar-entidad" state={{ from: location }} replace />
  }
  return children
}

function FullScreenLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #A8CF45 0%, #87a837 100%)' }}
      >
        <i className="pi pi-spin pi-spinner text-2xl text-white" />
      </div>
      <p className="text-base font-semibold text-slate-700 dark:text-slate-200">Cargando sesión...</p>
    </div>
  )
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
        path="/seleccionar-entidad"
        element={
          <ProtectedRoute>
            <SeleccionarEntidad />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <RequireEntidad>
              <MainLayout />
            </RequireEntidad>
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/empleados" element={<Empleados />} />
        <Route path="/contratos" element={<ContratosAdmin />} />
        <Route path="/admin/plantillas" element={<PlantillasAdmin />} />
        <Route path="/admin/plantillas/:id" element={<DisenadorPlantilla />} />
        <Route path="/admin/campos-catalogo" element={<CamposCatalogo />} />
        <Route path="/admin/contratos" element={<ContratosAdmin />} />
        <Route path="/documentos" element={<Documentos />} />
        <Route path="/generar-documento" element={<DocumentosWizard />} />
        <Route path="/certificaciones" element={<Certificaciones />} />
        <Route path="/horarios" element={<Horarios />} />
        <Route path="/entidades" element={<Entidades />} />
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
