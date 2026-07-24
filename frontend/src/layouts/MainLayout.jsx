import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import Breadcrumbs from '../components/Breadcrumbs.jsx'

const ROUTE_LABELS = {
  '/dashboard': 'Dashboard',
  '/empleados': 'Empleados',
  '/contratos': 'Contratos',
  '/plantillas': 'Plantillas',
  '/documentos': 'Documentos',
  '/certificaciones': 'Certificaciones',
  '/horarios': 'Horarios',
  '/sedes': 'Sedes',
  '/usuarios': 'Usuarios',
  '/reportes': 'Reportes',
  '/auditoria': 'Auditoría',
  '/configuracion': 'Configuración',
  '/notificaciones': 'Notificaciones',
  '/perfil': 'Mi perfil',
  '/ayuda': 'Ayuda',
}

function useCrumbs() {
  const { pathname } = useLocation()
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 0) return []
  const acc = []
  parts.forEach((p, i) => {
    const to = '/' + parts.slice(0, i + 1).join('/')
    acc.push({ label: ROUTE_LABELS[to] || p, to: i === parts.length - 1 ? undefined : to })
  })
  return acc
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const crumbs = useCrumbs()

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar collapsed={collapsed} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onToggleSidebar={() => setCollapsed((c) => !c)} collapsed={collapsed} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 app-scroll">
          <div className="animate-fade-in">
            {crumbs.length > 1 && <Breadcrumbs items={crumbs} />}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
