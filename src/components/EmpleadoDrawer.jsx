import { useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { TabView, TabPanel } from 'primereact/tabview'
import {
  initials,
  formatDate,
  avatarColor,
  formatTiempoRelativo,
  orDash,
  tipoDocLabel,
} from '../utils/format.js'
import PhotoPreviewModal from './PhotoPreviewModal.jsx'

function calcAntiguedad(fechaIngreso) {
  if (!fechaIngreso) return '—'
  // Parse 'YYYY-MM-DD' como fecha LOCAL (no UTC) para evitar desfase
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fechaIngreso))
  if (!m) return '—'
  const inicio = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  if (Number.isNaN(inicio.getTime())) return '—'
  const hoy = new Date()
  let meses = (hoy.getFullYear() - inicio.getFullYear()) * 12 + (hoy.getMonth() - inicio.getMonth())
  if (hoy.getDate() < inicio.getDate()) meses -= 1
  if (meses < 0) return '—'
  const anos = Math.floor(meses / 12)
  const mm = meses % 12
  if (anos === 0) return `${mm} mes${mm !== 1 ? 'es' : ''}`
  return `${anos} año${anos !== 1 ? 's' : ''} ${mm} mes${mm !== 1 ? 'es' : ''}`
}

export default function EmpleadoDrawer({ visible, empleado, onHide }) {
  const [photoPreview, setPhotoPreview] = useState(false)
  if (!empleado) return null

  const active = empleado.estado === 'Activo'
  const color = avatarColor(empleado.nombre)
  const antiguedad = calcAntiguedad(empleado.fechaIngreso)

  const contactoCompleto = empleado.contactoNombre
    ? `${empleado.contactoNombre}${empleado.contactoParentesco ? ` (${empleado.contactoParentesco})` : ''}${empleado.contactoTelefono ? ` · ${empleado.contactoTelefono}` : ''}`
    : '—'

  const tipoDoc = tipoDocLabel(empleado.tipoDocumento)

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      modal
      dismissableMask
      showCloseIcon={false}
      style={{ width: 'min(1100px, 96vw)' }}
      contentStyle={{ padding: 0, height: 'min(88vh, 760px)' }}
      header={
        <div className="flex items-center justify-between w-full pr-2">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #A8CF45 0%, #87a837 100%)' }}
            >
              <i className="pi pi-user text-lg" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
                Perfil del empleado
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {empleado.nombre ? `Información completa de ${empleado.nombre}` : 'Detalle del empleado'}
              </p>
            </div>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${
              active
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500 animate-pulse-slow' : 'bg-slate-400'}`} />
            {orDash(empleado.estado)}
          </span>
        </div>
      }
    >
      <div className="flex flex-col h-full bg-white dark:bg-slate-900">
        <div className="flex flex-1 min-h-0">
          {/* ══════ SIDEBAR ══════ */}
          <aside className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-900 overflow-y-auto p-5">
            <div className="flex flex-col items-center text-center">
              <button
                type="button"
                onClick={() => empleado.foto && setPhotoPreview(true)}
                disabled={!empleado.foto}
                className={`relative group block rounded-2xl mb-3 transition ${
                  empleado.foto ? 'cursor-zoom-in hover:scale-[1.02]' : 'cursor-default'
                }`}
                title={empleado.foto ? 'Click para ver en grande' : 'Sin foto'}
              >
                {empleado.foto ? (
                  <img
                    src={empleado.foto}
                    alt={empleado.nombre}
                    className="w-28 h-28 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800"
                    style={{ boxShadow: '0 8px 24px -4px rgba(0,0,0,0.18)' }}
                  />
                ) : (
                  <div
                    className={`w-28 h-28 rounded-2xl ${color.bg} ${color.text} flex items-center justify-center font-bold text-4xl ring-4 ring-white dark:ring-slate-800`}
                    style={{ boxShadow: '0 8px 24px -4px rgba(0,0,0,0.18)' }}
                  >
                    {initials(empleado.nombre)}
                  </div>
                )}
                {empleado.foto && (
                  <span className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 text-slate-700 text-[11px] font-semibold shadow">
                      <i className="pi pi-search-plus text-[10px]" />
                      Ver foto
                    </span>
                  </span>
                )}
              </button>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {orDash(empleado.nombre)}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {orDash(empleado.cargo)}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700">
                <i className="pi pi-building text-[10px]" />
                {orDash(empleado.sede)}
              </span>
            </div>

            <div className="mt-5 space-y-2">
              <SidebarStat icon="pi-id-card"      label="Cédula"      value={empleado.cedula} mono />
              <SidebarStat icon="pi-calendar"     label="Ingreso"     value={formatDate(empleado.fechaIngreso)} />
              <SidebarStat icon="pi-clock"        label="Antigüedad"  value={antiguedad} />
              <SidebarStat icon="pi-sitemap"      label="Área"        value={orDash(empleado.area)} />
              <SidebarStat icon="pi-envelope"     label="Correo"      value={orDash(empleado.email)} mono />
              <SidebarStat icon="pi-phone"        label="Teléfono"    value={orDash(empleado.contactoTelefono)} mono />
            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <i className="pi pi-info-circle text-brand-500" />
                <span>ID interno <span className="font-mono font-bold text-slate-800 dark:text-slate-100">#{String(empleado.id).padStart(4, '0')}</span></span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                <i className="pi pi-history text-brand-500" />
                <span>Última act. <span className="text-slate-700 dark:text-slate-200 font-medium">{formatTiempoRelativo(empleado.updatedAt)}</span></span>
              </div>
            </div>
          </aside>

          {/* ══════ TABS ══════ */}
          <main className="flex-1 min-w-0 flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <TabView>
                {/* ────── TAB: RESUMEN ────── */}
                <TabPanel header="Resumen">
                  <div className="space-y-5 pt-1">
                    <Section index="1" icon="pi-user" title="Datos personales" desc="Identificación y datos de contacto">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 sm:col-span-6">
                          <Field label="Nombre completo" value={orDash(empleado.nombre)} />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="Cédula" value={orDash(empleado.cedula)} mono />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="Tipo doc." value={tipoDoc} chip="slate" />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <Field label="Correo corporativo" value={orDash(empleado.email)} mono />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="F. expedición" value={formatDate(empleado.fechaExpedicion)} />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="Lugar de expedición" value={orDash(empleado.lugarExpedicion)} />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <Field label="F. nacimiento" value={formatDate(empleado.fechaNacimiento)} />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <Field label="Lugar de nacimiento" value={orDash(empleado.lugarNacimiento)} />
                        </div>
                      </div>
                    </Section>

                    <Section index="2" icon="pi-heart" title="Salud y seguridad social" desc="EPS, fondo de pensiones y riesgos laborales">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="EPS" value={orDash(empleado.eps)} />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="AFP" value={orDash(empleado.afp)} />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="ARL" value={orDash(empleado.arl)} />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="Caja de compensación" value={orDash(empleado.cajaCompensacion)} />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="Tipo de sangre" value={orDash(empleado.tipoSangre)} chip="rose" />
                        </div>
                        <div className="col-span-12 sm:col-span-9">
                          <Field label="Contacto de emergencia" value={contactoCompleto} />
                        </div>
                      </div>
                    </Section>

                    <Section index="3" icon="pi-map-marker" title="Ubicación" desc="Dirección y sede">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12">
                          <Field label="Dirección de residencia" value={orDash(empleado.direccion)} />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <Field label="Sede asignada" value={orDash(empleado.sede)} chip="brand" />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <Field label="Estado" value={orDash(empleado.estado)} chip={active ? 'emerald' : 'slate'} />
                        </div>
                      </div>
                    </Section>
                  </div>
                </TabPanel>

                {/* ────── TAB: LABORAL ────── */}
                <TabPanel header="Laboral">
                  <div className="space-y-5 pt-1">
                    <Section index="1" icon="pi-briefcase" title="Posición actual" desc="Cargo, área y fechas contractuales">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 sm:col-span-6">
                          <Field label="Cargo" value={orDash(empleado.cargo)} highlight />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <Field label="Área" value={orDash(empleado.area)} chip="slate" />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <Field label="Profesión" value={orDash(empleado.profesion)} />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <Field label="Nivel académico" value={orDash(empleado.nivelAcademico)} />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <Field label="F. ingreso" value={formatDate(empleado.fechaIngreso)} />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <Field label="F. final" value={empleado.fechaFinal ? formatDate(empleado.fechaFinal) : 'Indefinido'} chip={empleado.fechaFinal ? 'amber' : 'emerald'} />
                        </div>
                      </div>
                    </Section>

                    <Section index="2" icon="pi-history" title="Línea de tiempo laboral" desc="Eventos de la relación laboral">
                      <div className="relative pl-6">
                        <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />
                        <div className="space-y-3">
                          {empleado.fechaIngreso && (
                            <TimelineEvent
                              icon="pi-play" color="emerald"
                              title="Inicio de relación laboral"
                              when={formatDate(empleado.fechaIngreso)}
                              desc={`Ingresó como ${orDash(empleado.cargo)} en ${orDash(empleado.area)}.`}
                            />
                          )}
                          {empleado.fechaFinal && (
                            <TimelineEvent
                              icon="pi-stop" color="rose"
                              title="Fin de contrato programado"
                              when={formatDate(empleado.fechaFinal)}
                              desc={`Terminación prevista del contrato.`}
                            />
                          )}
                          {!empleado.fechaIngreso && !empleado.fechaFinal && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 italic">Sin eventos registrados.</p>
                          )}
                        </div>
                      </div>
                    </Section>
                  </div>
                </TabPanel>

                {/* ────── TAB: EXPEDIENTE ────── */}
                <TabPanel header="Expediente">
                  <div className="space-y-5 pt-1">
                    <Section index="1" icon="pi-folder" title="Documentos del expediente" desc="Archivos cargados en el sistema">
                      <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/40 dark:bg-slate-800/20 p-8 text-center">
                        <i className="pi pi-folder-open text-3xl text-slate-400 mb-3 block" />
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Sin documentos cargados</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          El módulo de expediente digital aún no está conectado a la base de datos.
                        </p>
                      </div>
                    </Section>
                  </div>
                </TabPanel>

                {/* ────── TAB: ACTIVIDAD ────── */}
                <TabPanel header="Actividad">
                  <div className="pt-1">
                    <Section index="1" icon="pi-clock" title="Registro de actividad" desc="Eventos recientes del empleado">
                      <div className="relative pl-7">
                        <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />
                        <div className="space-y-4">
                          {empleado.updatedAt && (
                            <TimelineEvent
                              icon="pi-pencil" color="brand"
                              title="Última actualización del perfil"
                              when={formatTiempoRelativo(empleado.updatedAt)}
                              desc={`${formatDate(empleado.updatedAt)} · datos personales o laborales modificados.`}
                            />
                          )}
                          {empleado.createdAt && (
                            <TimelineEvent
                              icon="pi-user-plus" color="emerald"
                              title="Empleado dado de alta en el sistema"
                              when={formatDate(empleado.createdAt)}
                              desc={`Registro inicial en la plataforma.`}
                            />
                          )}
                          {empleado.fechaIngreso && (
                            <TimelineEvent
                              icon="pi-briefcase" color="brand"
                              title="Inicio de relación laboral"
                              when={formatDate(empleado.fechaIngreso)}
                              desc={`Contrato como ${orDash(empleado.cargo)} en ${orDash(empleado.area)}.`}
                            />
                          )}
                          {!empleado.createdAt && !empleado.updatedAt && !empleado.fechaIngreso && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 italic">Sin actividad registrada.</p>
                          )}
                        </div>
                      </div>
                    </Section>
                  </div>
                </TabPanel>
              </TabView>
            </div>

            <footer className="border-t border-slate-200 dark:border-slate-700 px-6 py-3 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <i className="pi pi-info-circle text-brand-500" />
                Vista de solo lectura · Los cambios se realizan desde el botón Editar
              </p>
              <div className="flex gap-2">
                <Button label="Cerrar" outlined size="small" onClick={onHide} />
              </div>
            </footer>
          </main>
        </div>
      </div>

      <PhotoPreviewModal
        visible={photoPreview}
        onHide={() => setPhotoPreview(false)}
        src={empleado.foto}
        nombre={empleado.nombre}
        size="lg"
      />
    </Dialog>
  )
}

function SidebarStat({ icon, label, value, mono }) {
  return (
    <div className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-white/60 dark:hover:bg-slate-800/40 transition">
      <span className="w-7 h-7 rounded-md bg-white dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
        <i className={`pi ${icon} text-[11px]`} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 leading-tight">
          {label}
        </p>
        <p className={`text-xs font-semibold text-slate-800 dark:text-slate-100 truncate ${mono ? 'font-mono' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  )
}

function Section({ index, icon, title, desc, children }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <span
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0"
          style={{ background: 'linear-gradient(135deg, #A8CF45 0%, #87a837 100%)' }}
        >
          {index}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <i className={`pi ${icon} text-brand-500`} />
            {title}
          </h3>
          {desc && <p className="text-[11px] text-slate-500 dark:text-slate-400">{desc}</p>}
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/20 p-4">
        {children}
      </div>
    </section>
  )
}

function Field({ label, value, mono, chip, highlight }) {
  const chipColors = {
    brand: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  }
  return (
    <div>
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
        {label}
      </label>
      {chip ? (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${chipColors[chip]}`}>
          {value}
        </span>
      ) : (
        <p className={`text-sm ${highlight ? 'font-bold text-brand-700 dark:text-brand-300' : 'font-semibold text-slate-800 dark:text-slate-100'} ${mono ? 'font-mono' : ''} truncate`}>
          {value}
        </p>
      )}
    </div>
  )
}

function TimelineEvent({ icon, color, title, when, desc, signed }) {
  const tone = {
    brand: 'bg-brand-500 text-white',
    emerald: 'bg-emerald-500 text-white',
    amber: 'bg-amber-500 text-white',
    violet: 'bg-violet-500 text-white',
    rose: 'bg-rose-500 text-white',
    slate: 'bg-slate-500 text-white',
  }[color] || 'bg-brand-500 text-white'
  return (
    <div className="relative flex items-start gap-3">
      <div className={`absolute -left-6 mt-0.5 w-7 h-7 rounded-full ${tone} flex items-center justify-center shadow-sm ring-2 ring-white dark:ring-slate-900`}>
        <i className={`pi ${icon} text-[11px]`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-1.5">
            {title}
            {signed && <i className="pi pi-verified text-emerald-500 text-xs" title="Firmado digitalmente" />}
          </p>
          <span className="ml-auto text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">{when}</span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
      </div>
    </div>
  )
}
