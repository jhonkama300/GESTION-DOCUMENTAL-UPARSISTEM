import { Dialog } from 'primereact/dialog'
import { Button } from 'primereact/button'
import { TabView, TabPanel } from 'primereact/tabview'
import { initials, formatDate, avatarColor } from '../utils/format.js'

function buildEmail(nombre) {
  if (!nombre) return '—'
  return `${nombre.toLowerCase().replace(/\s+/g, '.').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}@gth.com`
}

function calcAntiguedad(fechaIngreso) {
  if (!fechaIngreso) return '—'
  const inicio = new Date(fechaIngreso)
  const hoy = new Date()
  let meses = (hoy.getFullYear() - inicio.getFullYear()) * 12 + (hoy.getMonth() - inicio.getMonth())
  if (hoy.getDate() < inicio.getDate()) meses -= 1
  const anos = Math.floor(meses / 12)
  const m = meses % 12
  if (anos === 0) return `${m} mes${m !== 1 ? 'es' : ''}`
  return `${anos} año${anos !== 1 ? 's' : ''} ${m} mes${m !== 1 ? 'es' : ''}`
}

export default function EmpleadoDrawer({ visible, empleado, onHide }) {
  if (!empleado) return null

  const active = empleado.estado === 'Activo'
  const color = avatarColor(empleado.nombre)
  const email = buildEmail(empleado.nombre)
  const antiguedad = calcAntiguedad(empleado.fechaIngreso)

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
                Información completa de {empleado.nombre}
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
            {empleado.estado}
          </span>
        </div>
      }
    >
      <div className="flex flex-col h-full bg-white dark:bg-slate-900">
        <div className="flex flex-1 min-h-0">
          {/* ══════ SIDEBAR (preview tipo EmpleadoForm) ══════ */}
          <aside className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-900 overflow-y-auto p-5">
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-28 h-28 rounded-2xl ${color.bg} ${color.text} flex items-center justify-center font-bold text-4xl ring-4 ring-white dark:ring-slate-800 mb-3`}
                style={{ boxShadow: '0 8px 24px -4px rgba(0,0,0,0.18)' }}
              >
                {initials(empleado.nombre)}
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {empleado.nombre}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {empleado.cargo}
              </p>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700">
                <i className="pi pi-building text-[10px]" />
                {empleado.sede}
              </span>
            </div>

            {/* Mini stats */}
            <div className="mt-5 space-y-2">
              <SidebarStat icon="pi-id-card"      label="Cédula"      value={empleado.cedula} mono />
              <SidebarStat icon="pi-calendar"     label="Ingreso"     value={formatDate(empleado.fechaIngreso)} />
              <SidebarStat icon="pi-clock"        label="Antigüedad"  value={antiguedad} />
              <SidebarStat icon="pi-sitemap"      label="Área"        value={empleado.area} />
              <SidebarStat icon="pi-envelope"     label="Correo"      value={email} mono />
              <SidebarStat icon="pi-phone"        label="Teléfono"    value="+57 300 123 4567" mono />
            </div>

            {/* Sede-color accent stripe */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <i className="pi pi-info-circle text-brand-500" />
                <span>ID interno <span className="font-mono font-bold text-slate-800 dark:text-slate-100">#{String(empleado.id).padStart(4, '0')}</span></span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                <i className="pi pi-history text-brand-500" />
                <span>Última act. <span className="text-slate-700 dark:text-slate-200 font-medium">hace 2 horas</span></span>
              </div>
            </div>
          </aside>

          {/* ══════ TABS AREA ══════ */}
          <main className="flex-1 min-w-0 flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <TabView>
                {/* ────── TAB: RESUMEN ────── */}
                <TabPanel header="Resumen">
                  <div className="space-y-5 pt-1">
                    <Section index="1" icon="pi-user" title="Datos personales" desc="Identificación y datos de contacto">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 sm:col-span-6">
                          <Field label="Nombre completo" value={empleado.nombre} />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="Cédula" value={empleado.cedula} mono />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="Tipo doc." value="Cédula de ciudadanía" chip="slate" />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <Field label="Correo corporativo" value={email} mono />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="F. expedición" value="12/03/2018" />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="Teléfono" value="+57 300 123 4567" mono />
                        </div>
                      </div>
                    </Section>

                    <Section index="2" icon="pi-heart" title="Salud y seguridad social" desc="EPS, fondo de pensiones y riesgos laborales">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="EPS" value="Sanitas" />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="AFP" value="Porvenir" />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="ARL" value="Sura" />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="Caja de compensación" value="Compensar" />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="Tipo de sangre" value="O+" chip="rose" />
                        </div>
                        <div className="col-span-12 sm:col-span-9">
                          <Field label="Contacto de emergencia" value="María Pérez · 300 456 7890" />
                        </div>
                      </div>
                    </Section>

                    <Section index="3" icon="pi-map-marker" title="Ubicación" desc="Dirección y modalidad de trabajo">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 sm:col-span-8">
                          <Field label="Dirección de residencia" value="Cra 7 #45-30, Apto 502" />
                        </div>
                        <div className="col-span-12 sm:col-span-4">
                          <Field label="Ciudad / Depto" value={`${empleado.sede}, Cundinamarca`} />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <Field label="Sede asignada" value={empleado.sede} chip="brand" />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <Field label="Modalidad" value="Presencial" chip="emerald" />
                        </div>
                      </div>
                    </Section>
                  </div>
                </TabPanel>

                {/* ────── TAB: LABORAL ────── */}
                <TabPanel header="Laboral">
                  <div className="space-y-5 pt-1">
                    <Section index="1" icon="pi-briefcase" title="Posición actual" desc="Cargo, contrato y remuneración">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-12 sm:col-span-6">
                          <Field label="Cargo" value={empleado.cargo} highlight />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <Field label="Área" value={empleado.area} chip="slate" />
                        </div>
                        <div className="col-span-12 sm:col-span-4">
                          <Field label="Tipo de contrato" value="Término indefinido" chip="emerald" />
                        </div>
                        <div className="col-span-12 sm:col-span-4">
                          <Field label="Jornada" value="Tiempo completo · 48h" />
                        </div>
                        <div className="col-span-12 sm:col-span-4">
                          <Field label="Periodicidad" value="Mensual" />
                        </div>
                        <div className="col-span-12 sm:col-span-6">
                          <Field label="Salario base" value="$ 3.200.000" mono highlight />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="Aux. transporte" value="Sí" chip="brand" />
                        </div>
                        <div className="col-span-12 sm:col-span-3">
                          <Field label="Nivel de riesgo" value="Riesgo I" chip="amber" />
                        </div>
                      </div>
                    </Section>

                    <Section index="2" icon="pi-history" title="Línea de tiempo laboral" desc="Movimientos y cambios contractuales">
                      <div className="relative pl-6">
                        <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />
                        <div className="space-y-3">
                          <TimelineEvent
                            icon="pi-play" color="emerald"
                            title="Inicio en la empresa"
                            when={formatDate(empleado.fechaIngreso)}
                            desc={`Cargo inicial: ${empleado.cargo}`}
                          />
                          <TimelineEvent
                            icon="pi-arrow-up-right" color="brand"
                            title="Promoción a cargo actual"
                            when="01/08/2023"
                            desc={`Ascendió a ${empleado.cargo} en el área de ${empleado.area}`}
                          />
                          <TimelineEvent
                            icon="pi-sync" color="violet"
                            title="Cambio de sede"
                            when="10/02/2024"
                            desc={`Trasladado a la sede ${empleado.sede}`}
                          />
                          <TimelineEvent
                            icon="pi-dollar" color="amber"
                            title="Ajuste salarial"
                            when="15/01/2024"
                            desc="Incremento del 8% — Adenda No. 002"
                          />
                        </div>
                      </div>
                    </Section>

                    <Section index="3" icon="pi-clock" title="Jornada semanal" desc="Horario asignado y días libres">
                      <div className="grid grid-cols-7 gap-2">
                        {['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'].map((d, i) => {
                          const isOff = i >= 5
                          return (
                            <div
                              key={d}
                              className={`rounded-xl p-3 text-center transition ${
                                isOff
                                  ? 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-600 border border-slate-200 dark:border-slate-700'
                                  : 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                              }`}
                            >
                              <div className="text-[11px] font-bold uppercase tracking-wider">{d}</div>
                              <div className="mt-2 text-xs font-semibold">{isOff ? 'Libre' : '07–17'}</div>
                              <div className="text-[10px] mt-0.5 opacity-70">{isOff ? '' : '8h'}</div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span><span className="font-semibold text-slate-700 dark:text-slate-200">40h</span> semanales</span>
                        <span>·</span>
                        <span>Descanso <span className="font-semibold text-slate-700 dark:text-slate-200">sáb-dom</span></span>
                      </div>
                    </Section>
                  </div>
                </TabPanel>

                {/* ────── TAB: EXPEDIENTE ────── */}
                <TabPanel header="Expediente">
                  <div className="space-y-5 pt-1">
                    <Section index="1" icon="pi-folder" title="Documentos del expediente" desc="Archivos cargados y organizados por tipo">
                      <div className="grid grid-cols-3 gap-3">
                        <DocCard icon="pi-id-card"   name="Cédula (frontal)"   size="1.2 MB" date="12/08/2024" verified />
                        <DocCard icon="pi-id-card"   name="Cédula (posterior)" size="0.9 MB" date="12/08/2024" verified />
                        <DocCard icon="pi-file-pdf"  name="Contrato laboral"   size="245 KB"  date={formatDate(empleado.fechaIngreso)} verified />
                        <DocCard icon="pi-file-pdf"  name="Adenda salarial"    size="118 KB"  date="15/01/2024" verified />
                        <DocCard icon="pi-file-word" name="Hoja de vida"       size="68 KB"   date="30/07/2024" />
                        <DocCard icon="pi-image"     name="Foto de perfil"     size="2.4 MB"  date="01/08/2024" />
                        <DocCard icon="pi-shield"    name="Certificado EPS"    size="94 KB"   date="01/09/2024" />
                        <DocCard icon="pi-bookmark"  name="Acta de grado"      size="310 KB"  date="18/06/2022" />
                        <DocCard icon="pi-plus-circle" name="Subir archivo" dashed />
                      </div>
                    </Section>

                    <Section index="2" icon="pi-history" title="Versiones recientes" desc="Historial de cambios en cada documento">
                      <div className="space-y-1.5">
                        {[
                          { f: 'Contrato laboral', v: 'v3', u: 'admin@gth.com', d: '15/01/2024' },
                          { f: 'Hoja de vida', v: 'v2', u: empleado.nombre, d: '30/07/2024' },
                          { f: 'Foto de perfil', v: 'v1', u: empleado.nombre, d: '01/08/2024' },
                          { f: 'Cédula (frontal)', v: 'v2', u: 'rrhh@gth.com', d: '12/08/2024' },
                        ].map((x, i) => (
                          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                            <span className="text-[10px] font-mono font-bold text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-900/40 px-2 py-0.5 rounded">
                              {x.v}
                            </span>
                            <span className="text-sm text-slate-700 dark:text-slate-200 font-medium flex-1">{x.f}</span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">{x.u}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 w-24 text-right">{x.d}</span>
                          </div>
                        ))}
                      </div>
                    </Section>
                  </div>
                </TabPanel>

                {/* ────── TAB: ACTIVIDAD ────── */}
                <TabPanel header="Actividad">
                  <div className="pt-1">
                    <Section index="1" icon="pi-clock" title="Registro de actividad" desc="Eventos recientes del empleado en el sistema">
                      <div className="relative pl-7">
                        <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />
                        <div className="space-y-4">
                          <TimelineEvent
                            icon="pi-pencil" color="brand"
                            title="Actualizó información de perfil"
                            when="Hace 2 horas"
                            desc="Modificó teléfono y dirección de residencia"
                          />
                          <TimelineEvent
                            icon="pi-verified" color="emerald"
                            title="Firmó certificación laboral"
                            when="Hace 3 días"
                            desc="Certificado No. 0247 con firma digital SHA-256"
                            signed
                          />
                          <TimelineEvent
                            icon="pi-upload" color="violet"
                            title="Subió documento de identidad"
                            when="Hace 1 mes"
                            desc="cédula_frontal_v2.pdf · 1.2 MB"
                          />
                          <TimelineEvent
                            icon="pi-sync" color="amber"
                            title="Cambio de sede"
                            when="Hace 5 meses"
                            desc={`Trasladado desde Medellín a ${empleado.sede}`}
                          />
                          <TimelineEvent
                            icon="pi-briefcase" color="brand"
                            title="Inicio de relación laboral"
                            when={formatDate(empleado.fechaIngreso)}
                            desc={`Contrato a término indefinido como ${empleado.cargo}`}
                          />
                        </div>
                      </div>
                    </Section>
                  </div>
                </TabPanel>
              </TabView>
            </div>

            {/* ══════ STICKY FOOTER (mismo patrón que EmpleadoForm) ══════ */}
            <footer className="border-t border-slate-200 dark:border-slate-700 px-6 py-3 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <i className="pi pi-info-circle text-brand-500" />
                Vista de solo lectura · Los cambios se realizan desde el botón Editar
              </p>
              <div className="flex gap-2">
                <Button label="Imprimir" icon="pi pi-print" outlined size="small" />
                <Button label="Cerrar" outlined size="small" onClick={onHide} />
                <Button
                  label="Editar perfil"
                  icon="pi pi-pencil"
                  severity="info"
                  size="small"
                />
              </div>
            </footer>
          </main>
        </div>
      </div>
    </Dialog>
  )
}

/* ════════════════════ SUB-COMPONENTES ════════════════════ */

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

function DocCard({ icon, name, size, date, verified, dashed }) {
  if (dashed) {
    return (
      <button
        type="button"
        className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-brand-400 hover:bg-brand-50/40 dark:hover:bg-brand-900/10 p-4 flex flex-col items-center justify-center gap-2 transition group min-h-[120px]"
      >
        <i className="pi pi-plus-circle text-2xl text-slate-400 group-hover:text-brand-500 transition" />
        <span className="text-xs font-semibold text-slate-500 group-hover:text-brand-600">Subir archivo</span>
      </button>
    )
  }
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40 p-3.5 hover:border-brand-300 hover:shadow-sm transition group cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:bg-brand-100 transition">
          <i className={`pi ${icon} text-base`} />
        </div>
        {verified && <i className="pi pi-verified text-emerald-500 text-base" title="Verificado" />}
      </div>
      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate" title={name}>{name}</p>
      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 dark:text-slate-500">
        <span className="font-mono">{size}</span>
        <span>{date}</span>
      </div>
    </div>
  )
}
