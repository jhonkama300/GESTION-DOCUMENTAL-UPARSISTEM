import { Tag } from 'primereact/tag'

/**
 * VersionSwitcher — ITERACIÓN 1 · FASE 1
 *
 * Lista compacta de versiones de una plantilla con indicador visual de
 * cuál está activa y botón para activar otra versión (callback `onActivate`).
 *
 * Read-only: no hace llamadas. El padre dispara el activate via service.
 *
 * Props:
 *   - versiones: array de {id, version, archivo_nombre, es_activa, variables_count, created_at}
 *   - loading: bool — desactiva botones mientras se procesa
 *   - onActivate: (versionId) => void
 *   - onDelete: (versionId) => void (opcional — solo si permite eliminar)
 */
export default function VersionSwitcher({ versiones = [], loading = false, onActivate, onDelete }) {
  if (!versiones.length) {
    return (
      <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">
        Esta plantilla aún no tiene versiones.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {versiones.map((v) => (
        <div
          key={v.id}
          className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
            v.es_activa
              ? 'border-brand-300 bg-brand-50/60 dark:bg-brand-900/20 dark:border-brand-700'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40'
          }`}
        >
          <div className="shrink-0">
            <Tag
              value={`v${v.version}`}
              severity={v.es_activa ? 'success' : 'secondary'}
              rounded
              className="font-mono"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-mono text-slate-700 dark:text-slate-200 truncate" title={v.archivo_nombre}>
              {v.archivo_nombre}
            </p>
            <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
              <span><i className="pi pi-code mr-1" />{v.variables_count} vars</span>
              <span><i className="pi pi-calendar mr-1" />{formatDate(v.created_at)}</span>
              {v.es_activa && (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  <i className="pi pi-check-circle mr-1" />ACTIVA
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {!v.es_activa && (
              <button
                type="button"
                disabled={loading}
                onClick={() => onActivate?.(v.id)}
                className="px-2.5 py-1 text-xs font-medium rounded-md border border-brand-300 text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/30 disabled:opacity-50 transition"
              >
                <i className="pi pi-bolt mr-1" />Activar
              </button>
            )}
            {!v.es_activa && onDelete && (
              <button
                type="button"
                disabled={loading}
                onClick={() => onDelete?.(v.id)}
                className="px-2 py-1 text-xs rounded-md border border-rose-200 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-50 transition"
                title="Eliminar versión"
              >
                <i className="pi pi-trash" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function formatDate(s) {
  if (!s) return '—'
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s))
  if (!m) return s
  return `${m[3]}/${m[2]}/${m[1]}`
}
