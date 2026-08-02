import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const MENU = [
  { to: '/dashboard', icon: 'pi-th-large', label: 'Dashboard' },
  { to: '/empleados', icon: 'pi-users', label: 'Empleados' },
  { to: '/generar-documento', icon: 'pi-plus-circle', label: 'Generar documento' },
  { to: '/documentos', icon: 'pi-folder-open', label: 'Documentos' },
  { to: '/certificaciones', icon: 'pi-id-card', label: 'Certificaciones' },
  { to: '/horarios', icon: 'pi-clock', label: 'Horarios' },
  { to: '/entidades', icon: 'pi-building', label: 'Entidades', roles: ['Administrador'] },
  { to: '/usuarios', icon: 'pi-user-edit', label: 'Usuarios', roles: ['Administrador'] },
  { to: '/reportes', icon: 'pi-chart-bar', label: 'Reportes', roles: ['Administrador', 'Administrativo'] },
  { to: '/auditoria', icon: 'pi-shield', label: 'Auditoría', roles: ['Administrador'] },
  { to: '/configuracion', icon: 'pi-cog', label: 'Configuración', roles: ['Administrador'] },
  { to: '/admin/plantillas', icon: 'pi-sitemap', label: 'Plantillas', roles: ['Administrador'] },
  { to: '/admin/contratos', icon: 'pi-file-edit', label: 'Contratos', roles: ['Administrador'] },
  { to: '/admin/campos-catalogo', icon: 'pi-database', label: 'Catálogo de Campos', roles: ['Administrador'] },
]

const SECTIONS = [
  {
    title: 'Principal',
    items: ['/dashboard', '/empleados', '/generar-documento'],
  },
  {
    title: 'Documentos',
    items: ['/documentos', '/certificaciones', '/horarios', '/entidades'],
  },
  {
    title: 'Administración',
    items: ['/usuarios', '/reportes', '/auditoria', '/configuracion'],
  },
  {
    title: 'Motor Documental',
    items: ['/admin/plantillas', '/admin/contratos', '/admin/campos-catalogo'],
  },
]

export default function Sidebar({ collapsed }) {
  const { user } = useAuth()
  const width = collapsed ? 'w-20' : 'w-64'

  const isAllowed = (item) => !item.roles || item.roles.includes(user?.role)
  const itemsByPath = Object.fromEntries(MENU.map((i) => [i.to, i]))

  return (
    <aside
      className={`${width} transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-r border-slate-200/80 dark:border-slate-800 flex flex-col h-screen sticky top-0 z-20`}
      style={{
        boxShadow: '1px 0 0 rgba(0,0,0,0.02), 4px 0 24px -8px rgba(0,0,0,0.04)',
      }}
    >
      {/* ── Brand header */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
          style={{
            background: 'linear-gradient(135deg, #A8CF45 0%, #87a837 100%)',
            boxShadow: '0 8px 20px -6px rgba(135,168,55,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          <i className="pi pi-id-card text-lg" />
        </div>
        {!collapsed && (
          <div className="leading-tight overflow-hidden">
            <p className="font-bold text-slate-900 dark:text-white tracking-tight text-[15px]">
              GTH
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wide uppercase">
              Gestión Documental
            </p>
          </div>
        )}
      </div>

      {/* ── Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {SECTIONS.map((section) => {
          const visible = section.items
            .map((p) => itemsByPath[p])
            .filter(Boolean)
            .filter(isAllowed)
          if (visible.length === 0) return null
          return (
            <div key={section.title}>
              {!collapsed && (
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                  {section.title}
                </p>
              )}
              <ul className="space-y-0.5">
                {visible.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                          isActive
                            ? 'text-brand-700 dark:text-brand-200 font-semibold'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {/* Indicador lateral activo */}
                          {isActive && (
                            <span
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                              style={{ background: 'linear-gradient(180deg, #A8CF45 0%, #87a837 100%)' }}
                            />
                          )}

                          {/* Icono */}
                          <span
                            className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all ${
                              isActive
                                ? 'text-white shadow-sm'
                                : 'text-slate-400 group-hover:text-brand-600 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30'
                            }`}
                            style={
                              isActive
                                ? {
                                    background: 'linear-gradient(135deg, #A8CF45 0%, #87a837 100%)',
                                    boxShadow: '0 4px 10px -2px rgba(135,168,55,0.5)',
                                  }
                                : undefined
                            }
                          >
                            <i className={`pi ${item.icon} text-[15px]`} />
                          </span>

                          {/* Label */}
                          {!collapsed && (
                            <span className="truncate flex-1">{item.label}</span>
                          )}

                          {/* Chevron activo */}
                          {!collapsed && isActive && (
                            <i className="pi pi-chevron-right text-[10px] text-brand-500" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </nav>

      {/* ── Footer card "Sprint" */}
      {!collapsed && (
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 shrink-0">
          <div
            className="relative rounded-xl p-3.5 text-white overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #A8CF45 0%, #87a837 100%)',
              boxShadow:
                '0 1px 2px rgba(0,0,0,0.05), 0 8px 20px -6px rgba(135,168,55,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            {/* Decorativos */}
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5" />

            <div className="relative">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
                  <i className="pi pi-check-circle text-[10px]" />
                </div>
                <p className="text-xs font-bold">Sprint 5 · 100%</p>
              </div>
              <p className="text-[11px] text-white/85 leading-snug">
                Frontend + multi-sede · v0.3.0
              </p>
              <div className="mt-2.5 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: '100%' }}
                />
              </div>
              <p className="text-[10px] text-white/70 mt-1.5">
                Frontend 100% · Global 55%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Versión cuando colapsado */}
      {collapsed && (
        <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 flex justify-center shrink-0">
          <span className="text-[10px] font-bold text-slate-400">v0.1</span>
        </div>
      )}
    </aside>
  )
}
