import { Link } from 'react-router-dom'
import { Button } from 'primereact/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="relative">
        <p className="text-[140px] font-bold bg-gradient-to-br from-brand-500 to-brand-800 bg-clip-text text-transparent leading-none">
          404
        </p>
        <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-br from-brand-500 to-brand-800" />
      </div>
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-2">
        Página no encontrada
      </h2>
      <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md">
        La ruta que buscas no existe o fue movida. Verifica la URL o vuelve al inicio.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button label="Volver al dashboard" icon="pi pi-home" severity="info" />
      </Link>
    </div>
  )
}
