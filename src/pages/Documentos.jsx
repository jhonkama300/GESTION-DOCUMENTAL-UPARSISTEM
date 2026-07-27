import { useRef, useState } from 'react'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Toast } from 'primereact/toast'
import { Tag } from 'primereact/tag'
import PageHeader from '../components/PageHeader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import SignatureDialog from '../components/SignatureDialog.jsx'
import { formatDate } from '../utils/format.js'
import { fieldInputClass } from '../utils/styles.js'

const FOLDERS = [
  { id: 1, name: 'Contratos firmados', count: 124, icon: 'pi-file-edit', color: 'emerald' },
  { id: 2, name: 'Hojas de vida', count: 89, icon: 'pi-id-card', color: 'brand' },
  { id: 3, name: 'Certificaciones', count: 67, icon: 'pi-verified', color: 'violet' },
  { id: 4, name: 'Exámenes médicos', count: 42, icon: 'pi-heart', color: 'rose' },
  { id: 5, name: 'Cursos SST', count: 38, icon: 'pi-book', color: 'amber' },
  { id: 6, name: 'Actas', count: 21, icon: 'pi-file', color: 'cyan' },
]

const FILES = [
  { id: 1, name: 'Contrato_LPerez_2024.pdf', size: '342 KB', type: 'pdf', pages: 4, by: 'Ana R.', when: 'hace 2 h', folder: 1, versions: 3, signed: true, hash: 'sha256:a8cf45b9e55b2d4f7c8e1a3b5d9f2c4e7a1b3c5d8e2f4a6b9c1d3e5f7a9b2c4d' },
  { id: 2, name: 'HojaVida_SCastro.pdf', size: '1.2 MB', type: 'pdf', pages: 6, by: 'Admin', when: 'hace 5 h', folder: 2, versions: 2, signed: true },
  { id: 3, name: 'SOAT_vehiculo3.pdf', size: '88 KB', type: 'pdf', pages: 1, by: 'Diego R.', when: 'ayer', folder: 3, versions: 1, signed: true },
  { id: 4, name: 'CertSST_ALopez.pdf', size: '256 KB', type: 'pdf', pages: 3, by: 'Carlos M.', when: 'hace 2 días', folder: 3, versions: 1, signed: false, email: 'carlos.mendez@empresa.com' },
  { id: 5, name: 'ExamenMedico_DR.pdf', size: '180 KB', type: 'pdf', pages: 2, by: 'Ana R.', when: 'hace 3 días', folder: 4, versions: 1, signed: false, email: 'diego.ramirez@empresa.com' },
  { id: 6, name: 'CursoSST_Todos.pdf', size: '2.1 MB', type: 'pdf', pages: 12, by: 'Andrés L.', when: 'hace 4 días', folder: 5, versions: 5, signed: true },
  { id: 7, name: 'ActaReunion_15Nov.docx', size: '64 KB', type: 'docx', pages: 2, by: 'Laura P.', when: 'hace 5 días', folder: 6, versions: 1, signed: true },
  { id: 8, name: 'CertLaboral_CMendez.pdf', size: '120 KB', type: 'pdf', pages: 1, by: 'Admin', when: 'hace 6 días', folder: 3, versions: 1, signed: false, email: 'carlos.mendez@empresa.com' },
]

const TYPE_COLORS = {
  pdf: { bg: 'bg-rose-50', text: 'text-rose-500', icon: 'pi-file-pdf' },
  docx: { bg: 'bg-blue-50', text: 'text-blue-500', icon: 'pi-file-word' },
  xlsx: { bg: 'bg-emerald-50', text: 'text-emerald-500', icon: 'pi-file-excel' },
  jpg: { bg: 'bg-violet-50', text: 'text-violet-500', icon: 'pi-image' },
}

const COLOR = {
  brand: 'bg-brand-50 text-brand-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet: 'bg-violet-50 text-violet-600',
  rose: 'bg-rose-50 text-rose-600',
  amber: 'bg-amber-50 text-amber-600',
  cyan: 'bg-cyan-50 text-cyan-600',
}

export default function Documentos() {
  const [selected, setSelected] = useState(1)
  const [view, setView] = useState('grid')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [previewFile, setPreviewFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [files, setFiles] = useState(FILES)
  const toast = useRef(null)
  const fileRef = useRef(null)
  const sigRef = useRef(null)

  const folder = FOLDERS.find((f) => f.id === selected)
  const filesInFolder = files.filter((f) => f.folder === selected)
  const pending = files.filter((f) => !f.signed)

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    toast.current?.show({ severity: 'success', summary: 'Subida exitosa', detail: 'Documento agregado al expediente', life: 3000 })
    setUploadOpen(false)
  }

  const openSign = (file) => {
    setPreviewFile(null)
    setTimeout(() => sigRef.current?.open(file), 200)
  }

  const onSigned = (file, hash) => {
    setFiles((arr) => arr.map((f) => (f.id === file.id ? { ...f, signed: true, hash } : f)))
  }

  return (
    <div>
      <Toast ref={toast} />
      <PageHeader
        icon="pi-folder-open"
        title="Gestión Documental"
        subtitle="Expediente digital versionado · Firma documentos directamente"
        actions={
          <div className="flex gap-2">
            <Button label="Nueva carpeta" icon="pi pi-folder-plus" outlined size="small" />
            <Button label="Subir" icon="pi pi-upload" severity="info" size="small" onClick={() => setUploadOpen(true)} />
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
            <i className="pi pi-folder" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{files.length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <i className="pi pi-clock" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Pendientes firma</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{pending.length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <i className="pi pi-verified" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Firmados</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{files.length - pending.length}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
            <i className="pi pi-history" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Versiones</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{files.reduce((a, f) => a + f.versions, 0)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* ── Sidebar de carpetas */}
        <div className="card p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2 px-2">
            Carpetas
          </p>
          <div className="space-y-0.5">
            {FOLDERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelected(f.id)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all ${
                  selected === f.id
                    ? 'bg-brand-50 text-brand-700 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${COLOR[f.color]}`}>
                  <i className={`pi ${f.icon} text-xs`} />
                </div>
                <span className="flex-1 text-left truncate">{f.name}</span>
                <span className="text-[11px] text-slate-400">{f.count}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Contenido */}
        <div className="lg:col-span-3">
          <div className="card p-4 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{folder?.name}</h3>
                <p className="text-xs text-slate-500">{filesInFolder.length} documentos</p>
              </div>
              <div className="flex items-center gap-2">
                <InputText placeholder="Buscar en carpeta..." className="text-sm w-56" />
                <div className="flex border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setView('grid')}
                    className={`px-2.5 py-1.5 ${view === 'grid' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <i className="pi pi-th-large text-sm" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`px-2.5 py-1.5 ${view === 'list' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <i className="pi pi-list text-sm" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {filesInFolder.length === 0 ? (
            <div className="card p-12">
              <EmptyState
                icon="pi-folder-open"
                title="Carpeta vacía"
                description="Sube el primer documento para empezar."
                action={<Button label="Subir documento" icon="pi pi-upload" severity="info" onClick={() => setUploadOpen(true)} />}
              />
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filesInFolder.map((f) => {
                const t = TYPE_COLORS[f.type] || TYPE_COLORS.pdf
                return (
                  <div
                    key={f.id}
                    onClick={() => setPreviewFile(f)}
                    className="card p-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group"
                  >
                    <div className={`w-12 h-14 rounded-lg ${t.bg} ${t.text} flex items-center justify-center mb-3 relative`}>
                      <i className={`pi ${t.icon} text-2xl`} />
                      {f.versions > 1 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center">
                          v{f.versions}
                        </span>
                      )}
                      {f.signed && (
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white">
                          <i className="pi pi-check text-[9px]" />
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                      {f.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {f.size} · {f.by}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-[10px] text-slate-400">{f.when}</p>
                      {f.signed ? (
                        <Tag value="Firmado" severity="success" rounded />
                      ) : (
                        <Tag value="Pendiente" severity="warning" rounded />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="card divide-y divide-slate-100 dark:divide-slate-700">
              {filesInFolder.map((f) => {
                const t = TYPE_COLORS[f.type] || TYPE_COLORS.pdf
                return (
                  <div
                    key={f.id}
                    onClick={() => setPreviewFile(f)}
                    className="p-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg ${t.bg} ${t.text} flex items-center justify-center shrink-0`}>
                      <i className={`pi ${t.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{f.name}</p>
                      <p className="text-xs text-slate-500">{f.size} · {f.by} · {f.when}</p>
                    </div>
                    {f.versions > 1 && <Tag value={`v${f.versions}`} severity="info" />}
                    {f.signed ? <Tag value="Firmado" severity="success" rounded /> : <Tag value="Pendiente" severity="warning" rounded />}
                    <i className="pi pi-arrow-right text-xs text-slate-300" />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Dialog de subida */}
      <Dialog
        visible={uploadOpen}
        onHide={() => setUploadOpen(false)}
        header={
          <div className="flex items-center gap-2">
            <i className="pi pi-upload text-brand-600" />
            <span>Subir documento</span>
          </div>
        }
        modal
        style={{ width: 'min(560px, 96vw)' }}
      >
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 dark:border-slate-600 hover:border-brand-400 hover:bg-brand-50/30'
          }`}
        >
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3"
            style={{ background: 'linear-gradient(135deg, rgba(168,207,69,0.18) 0%, rgba(135,168,55,0.10) 100%)' }}
          >
            <i className="pi pi-cloud-upload text-2xl" style={{ color: '#87a837' }} />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Arrastra archivos aquí</p>
          <p className="text-xs text-slate-500 mt-1">o haz click para seleccionar — PDF, DOCX, XLSX, JPG</p>
          <p className="text-[10px] text-slate-400 mt-2">Máx. 10 MB por archivo</p>
          <input ref={fileRef} type="file" multiple className="hidden" />
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 block">
              Carpeta destino
            </label>
            <Dropdown value={selected} options={FOLDERS.map((f) => ({ label: f.name, value: f.id }))} className="w-full" />
          </div>
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 block">
              Descripción (opcional)
            </label>
            <InputText className={fieldInputClass} placeholder="Ej: Contrato firmado digitalmente" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 mt-3 border-t border-slate-200 dark:border-slate-700">
          <Button label="Cancelar" outlined onClick={() => setUploadOpen(false)} size="small" />
          <Button label="Subir" icon="pi pi-upload" severity="info" onClick={onDrop} size="small" />
        </div>
      </Dialog>

      {/* ── Dialog de preview */}
      <Dialog
        visible={!!previewFile}
        onHide={() => setPreviewFile(null)}
        header={previewFile?.name}
        modal
        style={{ width: 'min(720px, 96vw)' }}
      >
        {previewFile && (
          <div>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg h-64 flex items-center justify-center mb-4">
              <div className="text-center">
                <i className={`pi ${TYPE_COLORS[previewFile.type]?.icon || 'pi-file'} text-6xl text-slate-400`} />
                <p className="text-sm text-slate-500 mt-2">Vista previa no disponible</p>
                <p className="text-xs text-slate-400">Descarga el archivo para verlo</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Tipo" value={previewFile.type.toUpperCase()} />
              <Info label="Tamaño" value={previewFile.size} />
              <Info label="Páginas" value={`${previewFile.pages || 1}`} />
              <Info label="Subido por" value={previewFile.by} />
              <Info label="Fecha" value={previewFile.when} />
              <Info label="Versiones" value={`${previewFile.versions}`} />
              <Info label="Estado" value={previewFile.signed ? 'Firmado' : 'Pendiente de firma'} green={previewFile.signed} />
              <Info label="Hash" value={previewFile.hash || '—'} mono />
            </div>

            {previewFile.versions > 1 && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Historial de versiones</p>
                <ul className="space-y-1.5">
                  {Array.from({ length: previewFile.versions }).map((_, i) => (
                    <li key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                      <span className="font-semibold">v{previewFile.versions - i}</span>
                      <span className="text-slate-500">hace {i + 1} día{i > 0 ? 's' : ''}</span>
                      <button className="font-semibold hover:underline" style={{ color: '#87a837' }}>
                        Restaurar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-between gap-2 pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
              <Button label="Cerrar" outlined onClick={() => setPreviewFile(null)} size="small" />
              <div className="flex gap-2">
                <Button label="Descargar" icon="pi pi-download" outlined size="small" />
                {!previewFile.signed && (
                  <Button
                    label="Firmar documento"
                    icon="pi pi-verified"
                    severity="info"
                    onClick={() => openSign(previewFile)}
                    size="small"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </Dialog>

      {/* ── Dialog reutilizable de firma */}
      <SignatureDialog ref={sigRef} onSigned={onSigned} />
    </div>
  )
}

function Info({ label, value, mono, green }) {
  return (
    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`text-sm font-semibold ${green ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-100'} ${mono ? 'font-mono text-[11px]' : ''}`}>
        {value}
      </p>
    </div>
  )
}
