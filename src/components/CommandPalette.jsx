import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { useNavigate } from 'react-router-dom'

const COMMANDS = [
  { label: 'Dashboard', icon: 'pi-th-large', to: '/dashboard', section: 'Navegación' },
  { label: 'Empleados', icon: 'pi-users', to: '/empleados', section: 'Navegación' },
  { label: 'Contratos', icon: 'pi-file-edit', to: '/contratos', section: 'Navegación' },
  { label: 'Plantillas', icon: 'pi-clone', to: '/plantillas', section: 'Navegación' },
  { label: 'Documentos', icon: 'pi-folder-open', to: '/documentos', section: 'Navegación' },
  { label: 'Certificaciones', icon: 'pi-id-card', to: '/certificaciones', section: 'Navegación' },
  { label: 'Horarios', icon: 'pi-clock', to: '/horarios', section: 'Navegación' },
  { label: 'Sedes', icon: 'pi-building', to: '/sedes', section: 'Navegación' },
  { label: 'Usuarios', icon: 'pi-user-edit', to: '/usuarios', section: 'Navegación' },
  { label: 'Reportes', icon: 'pi-chart-bar', to: '/reportes', section: 'Navegación' },
  { label: 'Auditoría', icon: 'pi-shield', to: '/auditoria', section: 'Navegación' },
  { label: 'Configuración', icon: 'pi-cog', to: '/configuracion', section: 'Navegación' },
  { label: 'Notificaciones', icon: 'pi-bell', to: '/notificaciones', section: 'Navegación' },
  { label: 'Mi perfil', icon: 'pi-user', to: '/perfil', section: 'Navegación' },
  { label: 'Ayuda', icon: 'pi-question-circle', to: '/ayuda', section: 'Navegación' },
  { label: 'Crear empleado', icon: 'pi-user-plus', to: '/empleados?new=1', section: 'Acciones' },
  { label: 'Crear contrato', icon: 'pi-plus', to: '/contratos?new=1', section: 'Acciones' },
  { label: 'Subir documento', icon: 'pi-upload', to: '/documentos?new=1', section: 'Acciones' },
  { label: 'Cambiar tema', icon: 'pi-moon', to: '/toggle-theme', section: 'Acciones' },
  { label: 'Cerrar sesión', icon: 'pi-sign-out', to: '/logout', section: 'Acciones' },
]

const CommandPalette = forwardRef(function CommandPalette(_, ref) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useImperativeHandle(ref, () => ({
    open: () => { setOpen(true); setQuery(''); setActive(0) },
    close: () => setOpen(false),
  }))

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
        setQuery('')
        setActive(0)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const filtered = useMemo(() => {
    if (!query) return COMMANDS
    const q = query.toLowerCase()
    return COMMANDS.filter(
      (c) => c.label.toLowerCase().includes(q) || c.section.toLowerCase().includes(q),
    )
  }, [query])

  useEffect(() => setActive(0), [query])

  const grouped = useMemo(() => {
    const g = {}
    filtered.forEach((c) => {
      g[c.section] = g[c.section] || []
      g[c.section].push(c)
    })
    return g
  }, [filtered])

  const flat = filtered

  const run = (item) => {
    setOpen(false)
    setQuery('')
    navigate(item.to)
  }

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, flat.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (flat[active]) run(flat[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <Dialog
      visible={open}
      onHide={() => setOpen(false)}
      modal
      showHeader={false}
      style={{ width: 'min(640px, 92vw)' }}
      contentStyle={{ padding: 0 }}
      dismissableMask
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <i className="pi pi-search text-slate-400" />
        <InputText
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Buscar páginas, acciones..."
          className="flex-1 border-0 shadow-none focus:ring-0 dark:bg-slate-800"
        />
        <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded">
          ESC
        </kbd>
      </div>
      <div className="max-h-80 overflow-y-auto p-2">
        {Object.entries(grouped).map(([section, items]) => (
          <div key={section} className="mb-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 px-3 py-1">
              {section}
            </p>
            {items.map((c) => {
              const idx = flat.indexOf(c)
              return (
                <button
                  key={c.label}
                  onClick={() => run(c)}
                  onMouseEnter={() => setActive(idx)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-sm transition-colors ${
                    idx === active
                      ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-200'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <i className={`pi ${c.icon} text-slate-400`} />
                  <span className="flex-1">{c.label}</span>
                  <i className="pi pi-arrow-right text-xs text-slate-300" />
                </button>
              )
            })}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-8">Sin resultados</p>
        )}
      </div>
      <div className="border-t border-slate-200 dark:border-slate-700 px-4 py-2 text-[11px] text-slate-400 flex items-center gap-3">
        <span><kbd className="px-1 bg-slate-100 dark:bg-slate-700 rounded">↑↓</kbd> navegar</span>
        <span><kbd className="px-1 bg-slate-100 dark:bg-slate-700 rounded">↵</kbd> seleccionar</span>
        <span className="ml-auto">⌘K / Ctrl+K</span>
      </div>
    </Dialog>
  )
})

export default CommandPalette
