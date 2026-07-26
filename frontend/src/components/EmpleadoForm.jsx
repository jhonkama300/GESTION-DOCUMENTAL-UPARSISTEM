import { memo, useEffect, useMemo, useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Calendar } from 'primereact/calendar'
import { Button } from 'primereact/button'
import { Avatar } from 'primereact/avatar'
import { Controller, useForm, useWatch, useFormContext, FormProvider } from 'react-hook-form'
import LocationPicker from './LocationPicker.jsx'
import { useSede } from '../context/SedeContext.jsx'
import { SEDES } from '../services/mock.data.js'
import {
  TIPOS_DOCUMENTO,
  EPS_COLOMBIA,
  formatEdad,
  formatDuracion,
} from '../utils/colombia.js'
import {
  CARGOS,
  PROGRAMAS_ACADEMICOS,
  AREAS_LABORALES,
} from '../utils/programas.js'
import { fieldInputClass, inputIconLeftClass, labelClass } from '../utils/styles.js'
import { initials } from '../utils/format.js'

const AREAS = AREAS_LABORALES
const ESTADOS = ['Activo', 'Inactivo', 'Suspendido']

const empty = {
  nombres: '',
  apellidos: '',
  tipoDocumento: null,
  identificacion: '',
  email: '',
  fechaExpedicion: null,
  lugarExpedicion: '',
  fechaNacimiento: null,
  lugarNacimiento: '',
  direccion: '',
  eps: null,
  cargo: null,
  profesion: null,
  nivelAcademico: null,
  fechaIngreso: new Date(),
  fechaFinal: null,
  estado: 'Activo',
  foto: '',
}

function buildDefaults(empleado, currentSede) {
  if (!empleado) return empty
  return {
    ...empty,
    nombres: empleado.nombres || empleado.nombre?.split(' ')[0] || '',
    apellidos: empleado.apellidos || empleado.nombre?.split(' ').slice(1).join(' ') || '',
    tipoDocumento: empleado.tipoDocumento || null,
    identificacion: empleado.identificacion || empleado.cedula || '',
    email: empleado.email || '',
    fechaExpedicion: empleado.fechaExpedicion ? new Date(empleado.fechaExpedicion) : null,
    lugarExpedicion: empleado.lugarExpedicion || '',
    fechaNacimiento: empleado.fechaNacimiento ? new Date(empleado.fechaNacimiento) : null,
    lugarNacimiento: empleado.lugarNacimiento || '',
    direccion: empleado.direccion || '',
    eps: empleado.eps || null,
    cargo: empleado.cargo || null,
    profesion: empleado.profesion || null,
    nivelAcademico: empleado.nivelAcademico || null,
    sedeId: empleado.sedeId || currentSede?.id || null,
    fechaIngreso: empleado.fechaIngreso ? new Date(empleado.fechaIngreso) : new Date(),
    fechaFinal: empleado.fechaFinal ? new Date(empleado.fechaFinal) : null,
    estado: empleado.estado || 'Activo',
    foto: empleado.foto || '',
  }
}

const SECTION_FIELDS = {
  identidad: ['nombres', 'apellidos', 'tipoDocumento', 'identificacion'],
  nacimiento: ['fechaNacimiento', 'lugarNacimiento'],
  residencia: ['direccion', 'eps'],
  laboral: ['cargo', 'sedeId', 'fechaIngreso'],
}

const SECTIONS_META = [
  { id: 'identidad', icon: 'pi-id-card', title: 'Identidad', desc: 'Datos del documento' },
  { id: 'nacimiento', icon: 'pi-calendar', title: 'Nacimiento', desc: 'Fecha y lugar' },
  { id: 'residencia', icon: 'pi-home', title: 'Residencia y salud', desc: 'Dirección y EPS' },
  { id: 'laboral', icon: 'pi-briefcase', title: 'Información laboral', desc: 'Cargo y contrato' },
]

export default function EmpleadoForm({ visible, onHide, onSave, onUpdate, empleado }) {
  const { currentSede } = useSede()
  const isEdit = !!empleado
  const methods = useForm({
    defaultValues: buildDefaults(empleado, currentSede),
    mode: 'onBlur',
  })
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = methods

  const cargosFlat = useMemo(
    () => Array.from(new Set(CARGOS)).map((c) => ({ label: c, value: c })),
    []
  )
  const programasFlat = useMemo(
    () => Array.from(new Set(PROGRAMAS_ACADEMICOS.map((p) => p.nombre))).map((n) => ({ label: n, value: n })),
    []
  )
  const epsOptions = useMemo(() => EPS_COLOMBIA.map((e) => ({ label: e, value: e })), [])

  useEffect(() => {
    if (visible) reset(buildDefaults(empleado, currentSede))
  }, [visible, empleado, currentSede, reset])

  const submit = async (formData) => {
    await new Promise((r) => setTimeout(r, 600))
    const fullName = `${formData.nombres} ${formData.apellidos}`.trim()
    const s = SEDES.find((x) => x.id === formData.sedeId)
    const result = {
      ...(empleado || {}),
      nombre: fullName,
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      cargo: formData.cargo,
      profesion: formData.profesion,
      nivelAcademico: formData.nivelAcademico,
      sedeId: formData.sedeId,
      sede: s?.nombre || currentSede?.nombre || 'Sin sede',
      estado: formData.estado,
      tipoDocumento: formData.tipoDocumento,
      identificacion: formData.identificacion,
      cedula: formData.identificacion,
      email: formData.email,
      foto: formData.foto || '',
      fechaExpedicion: formData.fechaExpedicion ? new Date(formData.fechaExpedicion).toISOString().slice(0, 10) : null,
      lugarExpedicion: formData.lugarExpedicion,
      fechaNacimiento: formData.fechaNacimiento ? new Date(formData.fechaNacimiento).toISOString().slice(0, 10) : null,
      lugarNacimiento: formData.lugarNacimiento,
      direccion: formData.direccion,
      eps: formData.eps,
      fechaIngreso: formData.fechaIngreso ? new Date(formData.fechaIngreso).toISOString().slice(0, 10) : null,
      fechaFinal: formData.fechaFinal ? new Date(formData.fechaFinal).toISOString().slice(0, 10) : null,
      edad: formatEdad(formData.fechaNacimiento),
    }
    if (isEdit) onUpdate?.(empleado.id, result)
    else onSave?.({ id: Date.now(), ...result, sedeId: formData.sedeId || currentSede?.id })
    onHide()
  }

  const Field = ({ label, required, error, children, hint, icon }) => (
    <div>
      <label className={labelClass}>
        {icon && <i className={`pi ${icon} text-[10px] text-brand-600`} />}
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
        <i className="pi pi-exclamation-circle" />{error.message}
      </p>}
    </div>
  )

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ background: 'linear-gradient(135deg, #A8CF45 0%, #87a837 100%)' }}
            >
              <i className={`pi ${isEdit ? 'pi-user-edit' : 'pi-user-plus'} text-lg`} />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">
                {isEdit ? 'Editar empleado' : 'Nuevo empleado'}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isEdit ? `Modificando a ${empleado.nombre}` : 'Completa la información del nuevo empleado'}
              </p>
            </div>
          </div>
        </div>
      }
      modal
      dismissableMask
      showCloseIcon={false}
      style={{ width: 'min(1440px, 98vw)' }}
      contentStyle={{ padding: 0, height: 'min(88vh, 880px)' }}
    >
      <FormProvider {...methods}>
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
          <div className="flex flex-1 min-h-0">
          {/* â”€â”€ Sidebar con preview + progreso */}
          <SidebarPreview
            currentSede={currentSede}
            isEdit={isEdit}
            sections={SECTIONS_META}
          />

          {/* â”€â”€ Form area */}
          <form onSubmit={handleSubmit(submit)} className="flex-1 min-w-0 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* SECCIÃ“N 1: Identidad */}
              <section>
                <SectionHeader icon="pi-id-card" title="Identidad" desc="Datos del documento de identidad" index="1" />
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 sm:col-span-6">
                    <Field label="Nombres" required error={errors.nombres} icon="pi-user">
                      <Controller
                        name="nombres"
                        control={control}
                        rules={{ required: 'Requerido', minLength: { value: 2, message: 'Mínimo 2 caracteres' } }}
                        render={({ field }) => (
                          <span className="relative block">
                            <i className={`${inputIconLeftClass} pi pi-user`} />
                            <InputText {...field} className={`${fieldInputClass} pl-10`} placeholder="Ej: Laura Camila" />
                          </span>
                        )}
                      />
                    </Field>
                  </div>
                  <div className="col-span-12 sm:col-span-6">
                    <Field label="Apellidos" required error={errors.apellidos} icon="pi-user">
                      <Controller
                        name="apellidos"
                        control={control}
                        rules={{ required: 'Requerido', minLength: { value: 2, message: 'Mínimo 2 caracteres' } }}
                        render={({ field }) => (
                          <span className="relative block">
                            <i className={`${inputIconLeftClass} pi pi-user`} />
                            <InputText {...field} className={`${fieldInputClass} pl-10`} placeholder="Ej: Pérez Gómez" />
                          </span>
                        )}
                      />
                    </Field>
                  </div>
                  <div className="col-span-12 sm:col-span-4">
                    <Field label="Tipo de identificaciÃ³n" required error={errors.tipoDocumento}>
                      <Controller
                        name="tipoDocumento"
                        control={control}
                        rules={{ required: 'Requerido' }}
                        render={({ field }) => (
                          <Dropdown {...field} options={TIPOS_DOCUMENTO} placeholder="Seleccionar tipo" className="w-full" />
                        )}
                      />
                    </Field>
                  </div>
                  <div className="col-span-12 sm:col-span-4">
                    <Field label="Número" required error={errors.identificacion} icon="pi-hashtag">
                      <Controller
                        name="identificacion"
                        control={control}
                        rules={{ required: 'Requerido', pattern: { value: /^\d{6,12}$/, message: 'Solo números (6-12)' } }}
                        render={({ field }) => (
                          <span className="relative block">
                            <i className={`${inputIconLeftClass} pi pi-hashtag`} />
                            <InputText
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 12))}
                              className={`${fieldInputClass} pl-10`}
                              placeholder="1234567890"
                            />
                          </span>
                        )}
                      />
                    </Field>
                  </div>
                  <div className="col-span-12 sm:col-span-3">
                    <Field label="F. expedición" error={errors.fechaExpedicion}>
                      <Controller
                        name="fechaExpedicion"
                        control={control}
                        render={({ field }) => (
                          <div className="flex justify-center">
                            <Calendar value={field.value} onChange={(e) => field.onChange(e.value)} className="w-full max-w-[240px]" dateFormat="dd/mm/yy" showIcon maxDate={new Date()} />
                          </div>
                        )}
                      />
                    </Field>
                  </div>
                  <div className="col-span-12 sm:col-span-6">
                    <Field label="Correo electrónico" required error={errors.email} icon="pi-envelope">
                      <Controller
                        name="email"
                        control={control}
                        rules={{
                          required: 'Requerido',
                          pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: 'Email inválido' },
                        }}
                        render={({ field }) => (
                          <span className="relative block">
                            <i className={`${inputIconLeftClass} pi pi-envelope`} />
                            <InputText {...field} type="email" className={`${fieldInputClass} pl-10`} placeholder="laura.perez@empresa.com" />
                          </span>
                        )}
                      />
                    </Field>
                  </div>
                  <div className="col-span-12 sm:col-span-6">
                    <LocationPicker
                      control={control}
                      name="lugarExpedicion"
                      label="Lugar de expedición"
                      defaultValue={{}}
                      error={errors.lugarExpedicion}
                    />
                  </div>
                </div>
              </section>

              {/* SECCIÃ“N 2: Nacimiento */}
              <section>
                <SectionHeader icon="pi-calendar" title="Nacimiento" desc="Fecha y lugar de nacimiento Â· Edad calculada automáticamente" index="2" />
                <div className="grid grid-cols-12 gap-4 items-end">
                  <div className="col-span-12 sm:col-span-3">
                    <Field label="Fecha de nacimiento" error={errors.fechaNacimiento}>
                      <Controller
                        name="fechaNacimiento"
                        control={control}
                        render={({ field }) => (
                          <div className="flex justify-center">
                            <Calendar
                              value={field.value}
                              onChange={(e) => field.onChange(e.value)}
                              className="w-full max-w-[240px] [&_input]:!h-[46px] [&_input]:!py-3 [&_input]:!text-sm"
                              dateFormat="dd/mm/yy"
                              showIcon
                              maxDate={new Date()}
                              appendTo="self"
                            />
                          </div>
                        )}
                      />
                    </Field>
                  </div>
                  <div className="col-span-12 sm:col-span-4">
                    <EdadCalculada />
                  </div>
                  <div className="col-span-12 sm:col-span-5">
                    <LocationPicker
                      control={control}
                      name="lugarNacimiento"
                      label="Lugar de nacimiento"
                      defaultValue={{}}
                      error={errors.lugarNacimiento}
                    />
                  </div>
                </div>
              </section>

              {/* SECCIÃ“N 3: Residencia y salud */}
              <section>
                <SectionHeader icon="pi-home" title="Residencia y salud" desc="Dirección actual y entidad promotora de salud" index="3" />
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 sm:col-span-7">
                    <Field label="Dirección de residencia" required error={errors.direccion} icon="pi-home">
                      <Controller
                        name="direccion"
                        control={control}
                        rules={{ required: 'Requerido' }}
                        render={({ field }) => (
                          <span className="relative block">
                            <i className={`${inputIconLeftClass} pi pi-home`} />
                            <InputText {...field} className={`${fieldInputClass} pl-10`} placeholder="Ej: Calle 100 #15-20, Apto 301" />
                          </span>
                        )}
                      />
                    </Field>
                  </div>
                  <div className="col-span-12 sm:col-span-5">
                    <Field label="EPS" required error={errors.eps} icon="pi-heart">
                      <Controller
                        name="eps"
                        control={control}
                        rules={{ required: 'Requerido' }}
                        render={({ field }) => (
                          <Dropdown
                            value={field.value}
                            onChange={(e) => field.onChange(e.value)}
                            options={epsOptions}
                            placeholder="Buscar o seleccionar EPS..."
                            className="w-full"
                            panelClassName="gth-dropdown-panel"
                            filter
                            filterPlaceholder="Escribe para buscar (ej: Sanitas)..."
                            filterMatchMode="contains"
                            virtualScrollerOptions={{ itemSize: 36 }}
                            emptyMessage="Sin resultados"
                            emptyFilterMessage="Sin coincidencias"
                          />
                        )}
                      />
                    </Field>
                  </div>
                </div>
              </section>

              {/* SECCIÃ“N 4: Información laboral */}
              <section>
                <SectionHeader icon="pi-briefcase" title="Información laboral" desc="Nivel académico, profesión, cargo y fechas contractuales" index="4" />
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12 sm:col-span-3">
                    <Field label="Nivel académico" error={errors.nivelAcademico}>
                      <Controller
                        name="nivelAcademico"
                        control={control}
                        render={({ field }) => (
                          <Dropdown
                            value={field.value}
                            onChange={(e) => field.onChange(e.value)}
                            options={[
                              { label: 'Profesional', value: 'Profesional' },
                              { label: 'Tecnólogo', value: 'Tecnólogo' },
                              { label: 'Técnico', value: 'Técnico' },
                            ]}
                            placeholder="Seleccionar nivel"
                            className="w-full"
                          />
                        )}
                      />
                    </Field>
                  </div>
                  <div className="col-span-12 sm:col-span-5">
                    <Field label="Profesión / Carrera" error={errors.profesion} hint="Programa académico cursado">
                      <Controller
                        name="profesion"
                        control={control}
                        render={({ field }) => (
                          <Dropdown
                            value={field.value}
                            onChange={(e) => field.onChange(e.value)}
                            options={programasFlat}
                            filter
                            filterPlaceholder="Escribe para buscar..."
                            filterMatchMode="contains"
                            placeholder="Buscar o seleccionar carrera..."
                            className="w-full"
                            panelClassName="gth-dropdown-panel"
                            virtualScrollerOptions={{ itemSize: 36 }}
                            emptyMessage="Sin resultados"
                            emptyFilterMessage="Sin coincidencias"
                          />
                        )}
                      />
                    </Field>
                  </div>
                  <div className="col-span-12 sm:col-span-4">
                    <Field label="Cargo" error={errors.cargo} hint="Puesto que ocupa en la empresa">
                      <Controller
                        name="cargo"
                        control={control}
                        render={({ field }) => (
                          <Dropdown
                            value={field.value}
                            onChange={(e) => field.onChange(e.value)}
                            options={cargosFlat}
                            filter
                            filterPlaceholder="Escribe para buscar..."
                            filterMatchMode="contains"
                            placeholder="Buscar o seleccionar cargo..."
                            className="w-full"
                            panelClassName="gth-dropdown-panel"
                            virtualScrollerOptions={{ itemSize: 36 }}
                            emptyMessage="Sin resultados"
                            emptyFilterMessage="Sin coincidencias"
                          />
                        )}
                      />
                    </Field>
                  </div>
                  <div className="col-span-12 sm:col-span-3">
                    <label className={labelClass}>
                      <i className="pi pi-building text-[10px] text-brand-600" />
                      Sede
                    </label>
                    <div className="flex justify-center">
                      {isEdit ? (
                        <Controller
                          name="sedeId"
                          control={control}
                          rules={{ required: 'Requerido' }}
                          render={({ field }) => (
                            <Dropdown
                              value={field.value}
                              onChange={(e) => field.onChange(e.value)}
                              options={SEDES.map((s) => ({ label: s.nombre, value: s.id }))}
                              placeholder="Seleccionar sede"
                              className="w-full max-w-[240px]"
                            />
                          )}
                        />
                      ) : (
                        <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 border-slate-200 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-800/50 w-full max-w-[240px]">
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                            style={{ background: currentSede?.color || '#A8CF45' }}
                          >
                            {currentSede?.iniciales || '—'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                              {currentSede?.nombre || 'Sin sede'}
                            </p>
                          </div>
                          <i className="pi pi-lock text-[10px] text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-span-12 sm:col-span-3">
                    <Field label="F. ingreso" required error={errors.fechaIngreso}>
                      <Controller
                        name="fechaIngreso"
                        control={control}
                        rules={{ required: 'Requerido' }}
                        render={({ field }) => (
                          <div className="flex justify-center">
                            <Calendar value={field.value} onChange={(e) => field.onChange(e.value)} className="w-full max-w-[240px]" dateFormat="dd/mm/yy" showIcon />
                          </div>
                        )}
                      />
                    </Field>
                  </div>
                  <div className="col-span-12 sm:col-span-3">
                    <Field label="F. final" hint="Déjalo vacío si es indefinido" error={errors.fechaFinal}>
                      <Controller
                        name="fechaFinal"
                        control={control}
                        render={({ field }) => (
                          <div className="flex justify-center">
                            <Calendar value={field.value} onChange={(e) => field.onChange(e.value)} className="w-full max-w-[240px]" dateFormat="dd/mm/yy" showIcon />
                          </div>
                        )}
                      />
                    </Field>
                  </div>
                  <div className="col-span-12 sm:col-span-3">
                    <DuracionCalculada />
                  </div>
                  <div className="col-span-12 sm:col-span-3">
                    <Field label="Estado" error={errors.estado}>
                      <Controller
                        name="estado"
                        control={control}
                        render={({ field }) => (
                          <Dropdown
                            value={field.value}
                            onChange={(e) => field.onChange(e.value)}
                            options={ESTADOS.map((e) => ({ label: e, value: e }))}
                            className="w-full"
                          />
                        )}
                      />
                    </Field>
                  </div>
                </div>
              </section>
            </div>

            {/* â”€â”€ Sticky footer */}
            <footer className="border-t border-slate-200 dark:border-slate-700 px-6 py-3 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <i className="pi pi-info-circle" />
                Los campos con <span className="text-rose-500 font-bold">*</span> son obligatorios
              </p>
              <div className="flex gap-2">
                <Button label="Cancelar" outlined type="button" onClick={onHide} size="small" />
                <Button
                  label={isSubmitting ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Crear empleado')}
                  icon={isSubmitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                  type="submit"
                  severity="info"
                  disabled={isSubmitting}
                  size="small"
                />
              </div>
            </footer>
          </form>
        </div>
      </div>
      </FormProvider>
    </Dialog>
  )
}

// â”€â”€ Sidebar memoizado: se suscribe a useWatch desde DENTRO,
//     lo que evita re-renders del padre (y por tanto del form)
const SidebarPreview = memo(function SidebarPreview({ currentSede, isEdit, sections }) {
  const { control, setValue } = useFormContext()
  const [fotoPreviewOpen, setFotoPreviewOpen] = useState(false)
  const nombres = useWatch({ control, name: 'nombres' }) || ''
  const apellidos = useWatch({ control, name: 'apellidos' }) || ''
  const profesion = useWatch({ control, name: 'profesion' })
  const cargo = useWatch({ control, name: 'cargo' })
  const identificacion = useWatch({ control, name: 'identificacion' }) || ''
  const eps = useWatch({ control, name: 'eps' })
  const direccion = useWatch({ control, name: 'direccion' }) || ''
  const fechaNacimiento = useWatch({ control, name: 'fechaNacimiento' })
  const fechaIngreso = useWatch({ control, name: 'fechaIngreso' })
  const fechaFinal = useWatch({ control, name: 'fechaFinal' })
  const sedeId = useWatch({ control, name: 'sedeId' })
  const tipoDocumento = useWatch({ control, name: 'tipoDocumento' })
  const lugarNacimiento = useWatch({ control, name: 'lugarNacimiento' })
  const foto = useWatch({ control, name: 'foto' })

  const nombreCompleto = `${nombres} ${apellidos}`.trim()
  const sede = SEDES.find((s) => s.id === sedeId) || currentSede
  const edad = fechaNacimiento ? formatEdad(fechaNacimiento) : null
  const duracion = fechaIngreso && fechaFinal ? formatDuracion(fechaIngreso, fechaFinal) : null

  const completed = useMemo(() => ({
    identidad: !!(nombres && apellidos && tipoDocumento && identificacion),
    nacimiento: !!(fechaNacimiento && lugarNacimiento),
    residencia: !!(direccion && eps),
    laboral: !!(sedeId && fechaIngreso && (cargo || profesion)),
  }), [nombres, apellidos, tipoDocumento, identificacion, fechaNacimiento, lugarNacimiento, direccion, eps, cargo, profesion, sedeId, fechaIngreso])

  const completedCount = Object.values(completed).filter(Boolean).length
  const progressPct = (completedCount / sections.length) * 100

  const onUploadFoto = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    if (file.size > 2 * 1024 * 1024) return
    const reader = new FileReader()
    reader.onload = (ev) => setValue('foto', ev.target.result, { shouldDirty: true })
    reader.readAsDataURL(file)
  }

  return (
    <aside className="w-72 shrink-0 border-r border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60 p-5 flex flex-col gap-4 overflow-y-auto">
      {/* Avatar preview */}
      <div className="flex flex-col items-center text-center pb-4 border-b border-slate-200 dark:border-slate-700">
        <div className="relative group">
          {foto ? (
            <button
              type="button"
              onClick={() => setFotoPreviewOpen(true)}
              className="block rounded-xl overflow-hidden ring-2 ring-white shadow-lg hover:ring-brand-300 transition-all"
              title="Ver foto en grande"
            >
              <img
                src={foto}
                alt={nombreCompleto}
                className="w-24 h-24 object-cover"
              />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => document.getElementById('empleado-foto-input')?.click()}
              className="w-24 h-24 rounded-xl flex items-center justify-center text-white ring-2 ring-white shadow-lg hover:ring-brand-300 transition-all"
              style={{
                background: 'linear-gradient(135deg, #A8CF45 0%, #87a837 100%)',
                fontSize: 30,
              }}
              title="Subir foto"
            >
              {nombreCompleto ? initials(nombreCompleto) : <i className="pi pi-camera text-2xl opacity-60" />}
            </button>
          )}
          <button
            type="button"
            onClick={() => document.getElementById('empleado-foto-input')?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border-2 border-brand-500 text-brand-600 flex items-center justify-center shadow hover:bg-brand-500 hover:text-white transition-colors"
            title="Subir otra foto"
          >
            <i className="pi pi-camera text-xs" />
          </button>
          {foto && (
            <button
              type="button"
              onClick={() => setValue('foto', '', { shouldDirty: true })}
              className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shadow hover:bg-rose-600 transition-colors z-10"
              title="Quitar foto"
            >
              <i className="pi pi-times text-[10px]" />
            </button>
          )}
          <input
            id="empleado-foto-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onUploadFoto}
          />
        </div>
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 mt-3 line-clamp-1">
          {nombreCompleto || 'Sin nombre'}
        </h2>
        <p className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-1">
          {cargo || profesion || 'Sin cargo asignado'}
        </p>
        {sede && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span
              className="w-4 h-4 rounded text-[9px] font-bold text-white flex items-center justify-center"
              style={{ background: sede.color }}
            >
              {sede.iniciales}
            </span>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              {sede.nombre}
            </span>
          </div>
        )}
      </div>

      {/* Stats en vivo */}
      <div className="space-y-2">
        <SidebarStat icon="pi-calendar-plus" label="Edad" value={edad} />
        <SidebarStat icon="pi-hourglass" label="Duración" value={duracion} />
        <SidebarStat icon="pi-id-card" label="Documento" value={identificacion} />
        <SidebarStat icon="pi-heart" label="EPS" value={eps} />
        <SidebarStat
          icon="pi-calendar-plus"
          label="Ingreso"
          value={fechaIngreso ? new Date(fechaIngreso).toLocaleDateString('es-CO') : null}
        />
        <SidebarStat icon="pi-home" label="Dirección" value={direccion} />
      </div>

      {/* Progreso por sección */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Progreso
          </p>
          <p className="text-[10px] text-slate-400">
            {completedCount} de {sections.length}
          </p>
        </div>
        <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #A8CF45 0%, #87a837 100%)',
            }}
          />
        </div>
        <div className="space-y-1.5">
          {sections.map((s) => {
            const done = completed[s.id]
            return (
              <div key={s.id} className="flex items-center gap-2 text-[12px]">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    done
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}
                >
                  <i className={`pi ${done ? 'pi-check' : s.icon} text-[9px]`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={done ? 'text-slate-700 dark:text-slate-200 font-medium truncate' : 'text-slate-400 truncate'}>
                    {s.title}
                  </p>
                </div>
                {done && <i className="pi pi-check text-[10px] text-brand-500" />}
              </div>
            )
          })}
        </div>
      </div>

      <FotoPreviewModal
        visible={fotoPreviewOpen}
        onHide={() => setFotoPreviewOpen(false)}
        src={foto}
        nombre={nombreCompleto}
      />
    </aside>
  )
})

function FotoPreviewModal({ visible, onHide, src, nombre }) {
  if (!src) return null
  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      modal
      dismissableMask
      showHeader={false}
      style={{ width: 'min(540px, 92vw)' }}
      contentStyle={{ padding: 0, background: 'transparent' }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Vista previa</p>
            {nombre && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{nombre}</p>
            )}
          </div>
        </div>
        <div className="p-4 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
          <img
            src={src}
            alt={nombre || 'Foto'}
            className="max-w-full max-h-[70vh] rounded-md shadow-md object-contain"
          />
        </div>
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <i className="pi pi-info-circle" />
            Click fuera o ESC para cerrar
          </p>
          <Button
            label="Cerrar"
            icon="pi pi-times"
            outlined
            size="small"
            onClick={onHide}
          />
        </div>
      </div>
    </Dialog>
  )
}

// â”€â”€ Componentes calculados memoizados para no re-renderizar el form
const EdadCalculada = memo(function EdadCalculada() {
  const { control } = useFormContext()
  const fecha = useWatch({ control, name: 'fechaNacimiento' })
  const edad = fecha ? formatEdad(fecha) : null
  return (
    <>
      <label className={labelClass}>
        <i className="pi pi-clock text-[10px] text-brand-600" />
        Edad calculada
      </label>
      <div className="h-[46px] w-full rounded-xl border-2 border-brand-200 bg-gradient-to-r from-brand-50 to-emerald-50 dark:from-brand-900/30 dark:to-emerald-900/30 dark:border-brand-700 flex items-center gap-2.5 px-3 shadow-sm">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow shrink-0">
          <i className="pi pi-user-plus text-[11px]" />
        </div>
        <span className="text-[13px] font-bold text-brand-700 dark:text-brand-200 whitespace-nowrap truncate">
          {edad || 'Selecciona fecha de nacimiento'}
        </span>
      </div>
    </>
  )
})

const DuracionCalculada = memo(function DuracionCalculada() {
  const { control } = useFormContext()
  const inicio = useWatch({ control, name: 'fechaIngreso' })
  const fin = useWatch({ control, name: 'fechaFinal' })
  const dur = inicio && fin ? formatDuracion(inicio, fin) : null
  return (
    <>
      <label className={labelClass}>
        <i className="pi pi-hourglass text-[10px] text-brand-600" />
        Duración
      </label>
      <div className={`${fieldInputClass} flex items-center gap-2.5 bg-gradient-to-r from-brand-50 to-emerald-50 dark:from-brand-900/20 dark:to-emerald-900/20`}>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-sm shrink-0">
          <i className="pi pi-hourglass text-[12px]" />
        </div>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {dur || 'Selecciona F. final'}
        </span>
      </div>
    </>
  )
})

function SectionHeader({ icon, title, desc, index }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-md shrink-0">
        <i className={`pi ${icon}`} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paso {index}</span>
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">{title}</h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">{desc}</p>
      </div>
    </div>
  )
}

function SidebarStat({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
        <i className={`pi ${icon} text-[11px]`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate" title={value || ''}>
          {value || 'â€”'}
        </p>
      </div>
    </div>
  )
}

// â”€â”€ Dropdown de Cargo con bÃºsqueda (intenta ESCO, fallback local) â€” DEPRECATED
//     Se mantiene Profesión/Carrera como campo principal

