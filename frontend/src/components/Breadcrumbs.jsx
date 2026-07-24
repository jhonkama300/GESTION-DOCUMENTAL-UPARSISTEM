import { Link } from 'react-router-dom'

export default function Breadcrumbs({ items = [] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-2">
      <Link to="/dashboard" className="hover:text-brand-600 flex items-center gap-1">
        <i className="pi pi-home text-xs" />
        <span>Inicio</span>
      </Link>
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <i className="pi pi-angle-right text-[10px] text-slate-300" />
          {it.to ? (
            <Link to={it.to} className="hover:text-brand-600">{it.label}</Link>
          ) : (
            <span className="text-slate-800 dark:text-slate-200 font-medium">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
