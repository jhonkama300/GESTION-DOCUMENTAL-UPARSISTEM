import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { Tag } from 'primereact/tag'
import { Toast } from 'primereact/toast'
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog'
import PageHeader from '../../components/PageHeader.jsx'
import DropZone from '../../components/admin/DropZone.jsx'
import VersionSwitcher from '../../components/admin/VersionSwitcher.jsx'
import { plantillasAdminService } from '../../services/admin.plantillas.service.js'

const TIPO_OPTIONS = [
  { label: 'Contrato', value: 'contrato' },
  { label: 'Certificación', value: 'certificacion' },
  { label: 'Carta', value: 'carta' },
  { label: 'Memorando', value: 'memorando' },
  { label: 'Acta', value: 'acta' },
  { label: 'Otrosí', value: 'otrosi' },
  { label: 'Autorización', value: 'autorizacion' },
  { label: 'Otro', value: 'otro' },
]

/**
 * PlantillasAdmin — ITERACIÓN 1 · FASE 1
 *
 * Página admin para gestionar plantillas: CRUD + upload de DOCX + versionado.
 *
 * Layout split:
 *   - Izquierda: tabla de plantillas con estado, versión activa y acciones rápidas
 *   - Derecha (al seleccionar): detalle + gestor de versiones + upload de nueva versión
 */
export default function PlantillasAdmin() {
  const toast = useRef(null)
  const navigate = useNavigate()
  const [plantillas, setPlantillas] = useState([])
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [createVisible, setCreateVisible] = useState(false)
  const [createForm, setCreateForm] = useState({
    slug: '', nombre: '', descripcion: '', tipoDocumento: 'contrato', categoria: '',
  })
  const [creating, setCreating] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadNotas, setUploadNotas] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadPlantillas()
  }, [])

  useEffect(() => {
    if (!selected) {
      setDetail(null)
      return
    }
    loadDetail(selected.id)
  }, [selected])

  const loadPlantillas = async () => {
    setLoading(true)
    try {
      const data = await plantillasAdminService.list()
      setPlantillas(data.plantillas || [])
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.error?.message || err.message,
        life: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const loadDetail = async (id) => {
    setDetailLoading(true)
    try {
      const data = await plantillasAdminService.get(id)
      setDetail(data)
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.error?.message || err.message,
        life: 5000,
      })
    } finally {
      setDetailLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!createForm.slug || !createForm.nombre) {
      toast.current?.show({
        severity: 'warn',
        summary: 'Datos incompletos',
        detail: 'Slug y nombre son obligatorios',
        life: 4000,
      })
      return
    }
    setCreating(true)
    try {
      await plantillasAdminService.create(createForm)
      toast.current?.show({
        severity: 'success',
        summary: 'Plantilla creada',
        detail: `"${createForm.nombre}" lista para subir DOCX`,
        life: 3000,
      })
      setCreateVisible(false)
      setCreateForm({ slug: '', nombre: '', descripcion: '', tipoDocumento: 'contrato', categoria: '' })
      await loadPlantillas()
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.error?.message || err.message,
        life: 5000,
      })
    } finally {
      setCreating(false)
    }
  }

  const handleUpload = async () => {
    if (!selected || !uploadFile) return
    setUploading(true)
    try {
      const result = await plantillasAdminService.uploadVersion(selected.id, uploadFile, uploadNotas)
      toast.current?.show({
        severity: 'success',
        summary: `Versión ${result.version} creada`,
        detail: `${result.variables_count} variables detectadas. La nueva versión está INACTIVA — actívala cuando quieras.`,
        life: 5000,
      })
      setUploadFile(null)
      setUploadNotas('')
      await loadDetail(selected.id)
      await loadPlantillas()
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error al subir',
        detail: err.response?.data?.error?.message || err.message,
        life: 5000,
      })
    } finally {
      setUploading(false)
    }
  }

  const handleActivate = async (versionId) => {
    if (!selected) return
    try {
      await plantillasAdminService.activateVersion(selected.id, versionId)
      toast.current?.show({
        severity: 'success',
        summary: 'Versión activada',
        detail: 'La plantilla ahora usa esta versión',
        life: 3000,
      })
      await loadDetail(selected.id)
      await loadPlantillas()
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.error?.message || err.message,
        life: 5000,
      })
    }
  }

  const handleSoftDelete = (plantilla) => {
    confirmDialog({
      message: `¿Inactivar "${plantilla.nombre}"? Las versiones existentes se conservan.`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, inactivar',
      rejectLabel: 'Cancelar',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await plantillasAdminService.softDelete(plantilla.id)
          toast.current?.show({ severity: 'success', summary: 'Plantilla inactivada', life: 3000 })
          if (selected?.id === plantilla.id) setSelected(null)
          await loadPlantillas()
        } catch (err) {
          toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: err.response?.data?.error?.message || err.message,
            life: 5000,
          })
        }
      },
    })
  }

  const handleRestore = async (plantilla) => {
    try {
      await plantillasAdminService.restore(plantilla.id)
      toast.current?.show({ severity: 'success', summary: 'Plantilla reactivada', life: 3000 })
      await loadPlantillas()
    } catch (err) {
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: err.response?.data?.error?.message || err.message,
        life: 5000,
      })
    }
  }

  return (
    <div>
      <Toast ref={toast} />
      <ConfirmDialog />

      <PageHeader
        icon="pi-clone"
        title="Plantillas · Motor Documental"
        subtitle="Sube DOCX, gestiona versiones. Una sola activa por plantilla."
        actions={
          <Button
            label="Nueva plantilla"
            icon="pi pi-plus"
            severity="info"
            onClick={() => setCreateVisible(true)}
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ── Lista de plantillas */}
        <div className="lg:col-span-1 space-y-3">
          <div className="card p-3">
            <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
              <i className="pi pi-list text-brand-500" />
              {plantillas.length} plantilla{plantillas.length !== 1 ? 's' : ''}
            </h3>
            <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
              {plantillas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`w-full text-left p-3 rounded-lg transition-all border ${
                    selected?.id === p.id
                      ? 'bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-900/40 dark:to-brand-800/30 border-brand-300 dark:border-brand-700'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <i className={`pi pi-file-word text-violet-500 mt-0.5 ${selected?.id === p.id ? 'opacity-100' : 'opacity-60'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                        {p.nombre}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {p.slug}
                      </p>
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        {p.tipo_documento && (
                          <Tag value={p.tipo_documento} severity="info" className="text-[10px]" />
                        )}
                        {p.estado === 'activa' ? (
                          <Tag value="activa" severity="success" className="text-[10px]" />
                        ) : (
                          <Tag value="inactiva" severity="secondary" className="text-[10px]" />
                        )}
                        {p.version_activa && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                            v{p.version_activa}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {!loading && plantillas.length === 0 && (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center py-4">
                  No hay plantillas. Crea la primera con "Nueva plantilla".
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Detalle */}
        <div className="lg:col-span-2 space-y-4">
          {!selected ? (
            <div className="card p-12 text-center text-slate-400 dark:text-slate-500">
              <i className="pi pi-arrow-left text-4xl mb-3 opacity-30" />
              <p className="text-sm">Selecciona una plantilla de la lista para ver su detalle y gestionar versiones.</p>
            </div>
          ) : detailLoading || !detail ? (
            <div className="card p-6 text-center text-slate-400">
              <i className="pi pi-spin pi-spinner text-2xl" />
            </div>
          ) : (
            <>
              {/* Header del detalle */}
              <div className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                      {detail.plantilla.nombre}
                    </h2>
                    <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">
                      {detail.plantilla.slug}
                    </p>
                    {detail.plantilla.descripcion && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        {detail.plantilla.descripcion}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {detail.plantilla.tipo_documento && (
                        <Tag value={detail.plantilla.tipo_documento} severity="info" />
                      )}
                      {detail.plantilla.categoria && (
                        <Tag value={detail.plantilla.categoria} severity="secondary" />
                      )}
                      <Tag
                        value={detail.plantilla.estado === 'activa' ? 'activa' : 'inactiva'}
                        severity={detail.plantilla.estado === 'activa' ? 'success' : 'danger'}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      icon="pi pi-sitemap"
                      label="Diseñar variables"
                      severity="info"
                      size="small"
                      onClick={() => navigate(`/admin/plantillas/${detail.plantilla.id}`)}
                      disabled={!detail.plantilla.version_activa}
                      tooltip={!detail.plantilla.version_activa ? 'Activa una versión primero' : 'Abrir el diseñador visual'}
                      tooltipOptions={{ position: 'bottom' }}
                    />
                    {detail.plantilla.estado === 'activa' ? (
                      <Button
                        icon="pi pi-times-circle"
                        label="Inactivar"
        severity="danger"
                        outlined
                        size="small"
                        onClick={() => handleSoftDelete(detail.plantilla)}
                      />
                    ) : (
                      <Button
                        icon="pi pi-replay"
                        label="Reactivar"
                        severity="success"
                        size="small"
                        onClick={() => handleRestore(detail.plantilla)}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Upload de nueva versión */}
              <div className="card p-5">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-3 flex items-center gap-2">
                  <i className="pi pi-upload text-brand-500" />
                  Subir nueva versión
                </h3>
                <DropZone onFile={setUploadFile} disabled={uploading} />
                <div className="mt-3">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Notas del cambio (opcional)
                  </label>
                  <InputTextarea
                    value={uploadNotas}
                    onChange={(e) => setUploadNotas(e.target.value)}
                    rows={2}
                    placeholder="Ej: Actualización de cláusula de confidencialidad"
                    className="w-full text-sm"
                    disabled={uploading}
                  />
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    label={uploading ? 'Subiendo...' : 'Subir versión'}
                    icon={uploading ? 'pi pi-spin pi-spinner' : 'pi pi-cloud-upload'}
                    severity="success"
                    size="small"
                    onClick={handleUpload}
                    disabled={!uploadFile || uploading}
                  />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                  La nueva versión se crea INACTIVA. Actívala cuando quieras que sea la versión oficial.
                </p>
              </div>

              {/* Lista de versiones */}
              <div className="card p-5">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-3 flex items-center gap-2">
                  <i className="pi pi-history text-violet-500" />
                  Versiones ({detail.versiones.length})
                </h3>
                <VersionSwitcher
                  versiones={detail.versiones}
                  loading={detailLoading}
                  onActivate={handleActivate}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Modal de crear plantilla */}
      <Dialog
        visible={createVisible}
        onHide={() => !creating && setCreateVisible(false)}
        header={
          <div className="flex items-center gap-2">
            <i className="pi pi-plus-circle text-brand-600" />
            <span>Nueva plantilla</span>
          </div>
        }
        modal
        style={{ width: 'min(560px, 96vw)' }}
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Slug <span className="text-rose-500">*</span>
              <span className="text-[10px] text-slate-400 font-normal ml-2">(kebab-case, sin espacios)</span>
            </label>
            <InputText
              value={createForm.slug}
              onChange={(e) => setCreateForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
              placeholder="ej: contrato-temporal-docente"
              className="w-full font-mono text-sm"
              disabled={creating}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
              Nombre <span className="text-rose-500">*</span>
            </label>
            <InputText
              value={createForm.nombre}
              onChange={(e) => setCreateForm((f) => ({ ...f, nombre: e.target.value }))}
              placeholder="ej: Contrato docente temporal"
              className="w-full"
              disabled={creating}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Tipo</label>
              <select
                value={createForm.tipoDocumento}
                onChange={(e) => setCreateForm((f) => ({ ...f, tipoDocumento: e.target.value }))}
                disabled={creating}
                className="w-full px-3 py-2 text-sm rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                {TIPO_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Categoría</label>
              <InputText
                value={createForm.categoria}
                onChange={(e) => setCreateForm((f) => ({ ...f, categoria: e.target.value }))}
                placeholder="ej: Contratos"
                className="w-full"
                disabled={creating}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Descripción</label>
            <InputTextarea
              value={createForm.descripcion}
              onChange={(e) => setCreateForm((f) => ({ ...f, descripcion: e.target.value }))}
              rows={3}
              placeholder="Opcional"
              className="w-full text-sm"
              disabled={creating}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
          <Button
            label="Cancelar"
            outlined
            size="small"
            onClick={() => setCreateVisible(false)}
            disabled={creating}
          />
          <Button
            label={creating ? 'Creando...' : 'Crear plantilla'}
            icon={creating ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
            severity="success"
            size="small"
            onClick={handleCreate}
            disabled={creating}
          />
        </div>
      </Dialog>
    </div>
  )
}
