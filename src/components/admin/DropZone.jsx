import { useRef, useState } from 'react'

/**
 * DropZone — ITERACIÓN 1 · FASE 1
 *
 * Componente reutilizable de upload con drag & drop.
 * Valida cliente: extensión .docx, tamaño máx 10 MB.
 * Llama `onFile(file)` cuando el usuario selecciona o suelta un archivo válido.
 *
 * Es solo UI — no hace upload. El padre se encarga de llamar al service.
 */
export default function DropZone({ onFile, accept = '.docx', maxBytes = 10 * 1024 * 1024, disabled = false }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState(null)
  const [fileName, setFileName] = useState(null)

  const validate = (file) => {
    if (!file) return 'No se recibió archivo'
    if (!file.name.toLowerCase().endsWith('.docx')) {
      return 'Solo se aceptan archivos .docx'
    }
    if (file.size > maxBytes) {
      const mb = (file.size / 1024 / 1024).toFixed(2)
      return `El archivo (${mb} MB) supera el máximo permitido (${maxBytes / 1024 / 1024} MB)`
    }
    if (file.size <= 0) {
      return 'El archivo está vacío'
    }
    return null
  }

  const handleFile = (file) => {
    const err = validate(file)
    if (err) {
      setError(err)
      setFileName(null)
      return
    }
    setError(null)
    setFileName(file.name)
    onFile?.(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed transition-all p-6 text-center ${
        dragOver
          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
          : error
            ? 'border-rose-300 bg-rose-50/40 dark:bg-rose-900/10'
            : fileName
              ? 'border-emerald-300 bg-emerald-50/40 dark:bg-emerald-900/10'
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/30'
      } ${disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-brand-400'}`}
      onClick={() => !disabled && inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleSelect}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-2">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            error
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/40'
              : fileName
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
          }`}
        >
          <i className={`pi ${error ? 'pi-times' : fileName ? 'pi-check' : 'pi-cloud-upload'} text-2xl`} />
        </div>

        {error ? (
          <p className="text-sm font-medium text-rose-700 dark:text-rose-300">{error}</p>
        ) : fileName ? (
          <>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Archivo listo</p>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">{fileName}</p>
          </>
        ) : (
          <>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Arrastra el DOCX aquí o haz click para seleccionar
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Máximo 10 MB · Solo .docx
            </p>
          </>
        )}
      </div>
    </div>
  )
}
