import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar } from 'primereact/avatar'
import { Menu } from 'primereact/menu'
import { useAuth } from '../context/AuthContext.jsx'
import { useTheme } from '../context/ThemeContext.jsx'
import { useEntidad } from '../context/EntidadContext.jsx'
import { initials } from '../utils/format.js'
import CommandPalette from './CommandPalette.jsx'
import NotificationsPanel from './NotificationsPanel.jsx'
import EntidadSwitcher from './EntidadSwitcher.jsx'

export default function Topbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const { currentEntidad, clearEntidad } = useEntidad()
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const paletteRef = useRef(null)
  const notifRef = useRef(null)
  const entidadRef = useRef(null)

  const items = [
    {
      label: 'Mi perfil',
      icon: 'pi pi-user',
      command: () => navigate('/perfil'),
    },
    {
      label: 'Notificaciones',
      icon: 'pi pi-bell',
      command: () => navigate('/notificaciones'),
    },
    { separator: true },
    {
      label: 'Ayuda',
      icon: 'pi pi-question-circle',
      command: () => navigate('/ayuda'),
    },
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: () => {
        clearEntidad()
        logout()
        navigate('/login', { replace: true })
      },
    },
  ]

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 glass border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300"
          aria-label="Alternar menú"
        >
          <i className="pi pi-bars" />
        </button>

        {currentEntidad && (
          <button
            ref={entidadRef}
            onClick={(e) => entidadRef.current?.toggle(e)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-all"
          >
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold shadow-sm"
              style={{ background: currentEntidad.color }}
            >
              {currentEntidad.iniciales}
            </div>
            <div className="leading-tight text-left hidden sm:block">
              <p className="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400">Entidad</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{currentEntidad.nombre}</p>
            </div>
            <i className="pi pi-chevron-down text-[10px] text-slate-400" />
          </button>
        )}
        <EntidadSwitcher ref={entidadRef} />

        <div className="hidden md:block ml-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">Bienvenido,</p>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{user?.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => paletteRef.current?.open()}
          className="hidden sm:flex items-center gap-2 px-3 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm w-48"
        >
          <i className="pi pi-search text-xs" />
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="text-[10px] px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded">⌘K</kbd>
        </button>

        <button
          onClick={toggle}
          className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300"
          aria-label="Cambiar tema"
        >
          <i className={`pi ${theme === 'dark' ? 'pi-sun' : 'pi-moon'}`} />
        </button>

        <button
          onClick={(e) => notifRef.current?.toggle(e)}
          className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 relative"
          aria-label="Notificaciones"
        >
          <i className="pi pi-bell" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
        </button>
        <NotificationsPanel ref={notifRef} />

        <button
          onClick={(e) => menuRef.current?.toggle(e)}
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ml-1"
        >
          <Avatar
            label={initials(user?.name)}
            shape="circle"
            className="bg-brand-100 text-brand-700"
          />
          <div className="hidden md:block leading-tight text-left">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{user?.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role}</p>
          </div>
          <i className="pi pi-angle-down text-xs text-slate-500" />
        </button>
        <Menu model={items} popup ref={menuRef} />
        <CommandPalette ref={paletteRef} />
      </div>
    </header>
  )
}
