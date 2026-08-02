import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'

/**
 * Modal de vista previa de foto.
 *
 * Uso:
 *   <PhotoPreviewModal
 *     visible={open}
 *     src={empleado.foto}
 *     nombre={empleado.nombre}
 *     onHide={() => setOpen(false)}
 *   />
 *
 * Si `src` es null/vacío, no renderiza nada.
 */
export default function PhotoPreviewModal({ visible, onHide, src, nombre, size = 'md' }) {
  if (!src) return null

  const sizes = {
    sm: '420px',
    md: '540px',
    lg: '720px',
  }

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      modal
      dismissableMask
      showHeader={false}
      style={{ width: `min(${sizes[size] || sizes.md}, 92vw)` }}
      contentStyle={{ padding: 0, background: 'transparent' }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0"
              style={{ background: 'linear-gradient(135deg, #A8CF45 0%, #87a837 100%)' }}
            >
              <i className="pi pi-image text-sm" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Vista previa de foto</p>
              {nombre && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{nombre}</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-100 dark:bg-slate-950 flex items-center justify-center min-h-[200px]">
          <img
            src={src}
            alt={nombre || 'Foto'}
            className="max-w-full max-h-[70vh] rounded-md shadow-md object-contain bg-white"
          />
        </div>

        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <i className="pi pi-info-circle" />
            Click fuera o <kbd className="px-1.5 py-px rounded text-[9px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">ESC</kbd> para cerrar
          </p>
          <Button label="Cerrar" icon="pi pi-times" outlined size="small" onClick={onHide} />
        </div>
      </div>
    </Dialog>
  )
}
