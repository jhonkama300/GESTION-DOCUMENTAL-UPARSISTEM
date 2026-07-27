import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Calendar } from 'primereact/calendar'
import { Button } from 'primereact/button'
import { Avatar } from 'primereact/avatar'
import { OverlayPanel } from 'primereact/overlaypanel'
import { Controller, useForm, useWatch, useFormContext, FormProvider } from 'react-hook-form'
import LocationPicker from './LocationPicker.jsx'
import { useSede } from '../context/SedeContext.jsx'
import { SEDES } from '../services/mock.data.js'
import {
  TIPOS_DOCUMENTO,
  EPS_COLOMBIA,
  TIPOS_SANGRE,
  AFP_COLOMBIA,
  ARL_COLOMBIA,
  CAJA_COMPENSACION_COLOMBIA,
  PARENTESCOS,
  formatEdad,
  formatDuracion,
} from '../utils/colombia.js'
import {
  CARGOS_ENRIQUECIDOS,
  PROGRAMAS_ENRIQUECIDOS,
  AREAS_LABORALES,
} from '../utils/programas.js'
import { fieldInputClass, inputIconLeftClass, labelClass } from '../utils/styles.js'
import { initials } from '../utils/format.js'

const AREAS = AREAS_LABORALES
const ESTADOS = ['Activo', 'Inactivo', 'Suspendido']

const parentescoOptions = PARENTESCOS.map((p) => ({ label: p, value: p }))

/* ───────── Configuración de los popovers (AFP, ARL, Caja, Cargo, Profesion, EPS, Sangre) ───────── */
const REGIMEN_COLORS = {
  Contributivo: 'emerald',
  Subsidiado:   'violet',
  Especial:     'amber',
}
const NIVEL_COLOR_MAP = {
  'Profesional':        'emerald',
  'Profesional Senior': 'brand',
  'Tecnólogo':          'cyan',
  'Técnico':            'amber',
  'Auxiliar':           'slate',
  'Directivo':          'rose',
  'Subdirección':       'rose',
  'Jefatura':           'violet',
  'Junior':             'slate',
  'Operativo':          'amber',
  'General':            'slate',
}

const ENTITY_POPOVERS = [
  {
    name: 'EPS',
    icon: 'pi-heart-fill',
    iconColor: 'rose',
    options: EPS_COLOMBIA,
    searchable: true,
    searchPlaceholder: 'Buscar EPS (ej: Sanitas)...',
    headerTitle: 'Selecciona una EPS',
    headerSub: 'Entidad Promotora de Salud · régimen y cobertura',
    cardSub: (a) => a.region,
    cardChip: (a) => ({ label: a.regimen, color: REGIMEN_COLORS[a.regimen] || 'slate' }),
    cardRightLabel: 'Cobertura',
    cardRightValue: (a) => a.cobertura,
    footer: (a) => [
      { label: 'Régimen',  value: a.regimen },
      { label: 'Región',   value: a.region },
      { label: 'Rating',   value: '★'.repeat(a.estrellas) + '☆'.repeat(5 - a.estrellas), highlight: true },
    ],
    palette: (a) => REGIMEN_COLORS[a.regimen] || 'rose',
  },
  {
    name: 'AFP',
    icon: 'pi-shield',
    iconColor: 'brand',
    options: AFP_COLOMBIA,
    searchable: true,
    searchPlaceholder: 'Buscar AFP (ej: Porvenir)...',
    headerTitle: 'Selecciona una AFP',
    headerSub: 'Fondo de pensiones · ahorro para tu retiro',
    cardSub: (a) => (a.publica ? 'Administradora pública de pensiones' : 'Administradora privada'),
    cardChip: (a) => ({ label: a.tipo, color: a.publica ? 'amber' : 'slate' }),
    cardRightLabel: 'Comisión',
    cardRightValue: (a) => a.comision,
    footer: (a) => [
      { label: 'Tipo',         value: a.tipo },
      { label: 'Comisión',     value: a.comision, highlight: true },
      { label: 'Solidaridad',  value: a.fondoSolidaridad },
    ],
    palette: (a) => (a.publica ? 'amber' : 'brand'),
  },
  {
    name: 'ARL',
    icon: 'pi-shield',
    iconColor: 'rose',
    options: ARL_COLOMBIA,
    searchable: true,
    searchPlaceholder: 'Buscar ARL (ej: Sura)...',
    headerTitle: 'Selecciona una ARL',
    headerSub: 'Administradora de Riesgos Laborales',
    cardSub: (a) => `Riesgos cubiertos: ${a.riesgoCubierto}`,
    cardChip: null,
    cardRightLabel: 'Calificación',
    cardRightValue: (a) => '★'.repeat(a.estrellas) + '☆'.repeat(5 - a.estrellas),
    footer: (a) => [
      { label: 'Riesgos',  value: a.riesgoCubierto },
      { label: 'Niveles',  value: a.estrellas + ' / 5', highlight: true },
    ],
    palette: () => 'rose',
  },
  {
    name: 'Caja',
    icon: 'pi-home',
    iconColor: 'cyan',
    options: CAJA_COMPENSACION_COLOMBIA,
    searchable: true,
    searchPlaceholder: 'Buscar caja (ej: Compensar)...',
    headerTitle: 'Selecciona una Caja',
    headerSub: 'Caja de Compensación Familiar',
    cardSub: (a) => `Región: ${a.region}`,
    cardChip: (a) => ({ label: a.cuota + ' nómina', color: 'emerald' }),
    cardRightLabel: 'Cuota',
    cardRightValue: (a) => a.cuota,
    footer: (a) => [
      { label: 'Región',      value: a.region },
      { label: 'Servicios',   value: a.servicios.join(' · '), wide: true },
    ],
    palette: () => 'cyan',
  },
  {
    name: 'Cargo',
    icon: 'pi-briefcase',
    iconColor: 'brand',
    options: CARGOS_ENRIQUECIDOS,
    searchable: true,
    searchPlaceholder: 'Buscar cargo (ej: Desarrollador)...',
    visibleLimit: 50,
    headerTitle: 'Selecciona un cargo',
    headerSub: 'Puesto que ocupa en la empresa',
    cardSub: (a) => a.area,
    cardChip: (a) => ({ label: a.nivel, color: NIVEL_COLOR_MAP[a.nivel] || 'slate' }),
    cardRightLabel: 'Nivel',
    cardRightValue: (a) => a.nivel,
    footer: (a) => [
      { label: 'Nivel',  value: a.nivel },
      { label: 'Área',   value: a.area },
    ],
    palette: (a) => (a.nivel === 'Directivo' || a.nivel === 'Subdirección') ? 'rose'
                   : (a.nivel === 'Jefatura')                    ? 'violet'
                   : (a.nivel === 'Profesional')                 ? 'brand'
                   : (a.nivel === 'Profesional Senior')          ? 'emerald'
                   : (a.nivel === 'Operativo')                   ? 'amber'
                   : 'slate',
  },
  {
    name: 'Profesion',
    icon: 'pi-bookmark',
    iconColor: 'cyan',
    options: PROGRAMAS_ENRIQUECIDOS,
    searchable: true,
    searchPlaceholder: 'Buscar programa (ej: Administración)...',
    visibleLimit: 80,
    headerTitle: 'Selecciona una profesión',
    headerSub: 'Programa académico de formación',
    cardSub: (a) => `Duración típica: ${a.duracion}`,
    cardChip: (a) => ({ label: a.nivel, color: NIVEL_COLOR_MAP[a.nivel] || 'slate' }),
    cardRightLabel: 'Nivel',
    cardRightValue: (a) => a.nivel,
    footer: (a) => [
      { label: 'Nivel',     value: a.nivel },
      { label: 'Duración',   value: a.duracion },
    ],
    palette: (a) => NIVEL_COLOR_MAP[a.nivel] || 'cyan',
  },
  {
    name: 'Sangre',
    icon: 'pi-heart-fill',
    iconColor: 'rose',
    options: TIPOS_SANGRE,
    searchable: true,
    searchPlaceholder: 'Buscar tipo (ej: O+, A+)...',
    headerTitle: 'Selecciona el tipo de sangre',
    headerSub: 'Compatible con bancos de sangre · Emergencias',
    cardSub: (a) => `Grupo ${a.grupo} · Factor Rh ${a.rh}`,
    cardChip: (a) => ({ label: a.grupo + a.rh, color: a.rh === '+' ? 'rose' : 'slate' }),
    cardRightLabel: 'Frecuencia',
    cardRightValue: (a) => a.frecuencia,
    footer: (a) => [
      { label: 'Donar a',     value: a.puedeDonarA,      wide: true },
      { label: 'Recibir de',  value: a.puedeRecibirDe,   wide: true },
    ],
    palette: (a) => (a.rh === '+' ? 'rose' : 'amber'),
  },
]  

/* Colores brand disponibles para gradiente del badge */
const BADGE_PALETTE = {
  brand:   'bg-gradient-to-br from-brand-500 to-brand-700',
  emerald: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
  amber:   'bg-gradient-to-br from-amber-500 to-amber-700',
  rose:    'bg-gradient-to-br from-rose-500 to-rose-700',
  cyan:    'bg-gradient-to-br from-cyan-500 to-cyan-700',
  violet:  'bg-gradient-to-br from-violet-500 to-violet-700',
}

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
  afp: null,
  arl: null,
  cajaCompensacion: null,
  tipoSangre: null,
  contactoNombre: '',
  contactoParentesco: null,
  contactoTelefono: '',
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
    nombres: empleado.nombres || empleado.nombre?.split(' ')?.[0] || '',
    apellidos: empleado.apellidos || empleado.nombre?.split(' ')?.slice(1)?.join(' ') || '',
    tipoDocumento: empleado.tipoDocumento || null,
    identificacion: empleado.identificacion || empleado.cedula || '',
    email: empleado.email || '',
    fechaExpedicion: empleado.fechaExpedicion ? new Date(empleado.fechaExpedicion) : null,
    lugarExpedicion: empleado.lugarExpedicion || '',
    fechaNacimiento: empleado.fechaNacimiento ? new Date(empleado.fechaNacimiento) : null,
    lugarNacimiento: empleado.lugarNacimiento || '',
    direccion: empleado.direccion || '',
    eps: empleado.eps || null,
    afp: empleado.afp || null,
    arl: empleado.arl || null,
    cajaCompensacion: empleado.cajaCompensacion || null,
    tipoSangre: empleado.tipoSangre || null,
    contactoNombre: empleado.contactoNombre || '',
    contactoParentesco: empleado.contactoParentesco || null,
    contactoTelefono: empleado.contactoTelefono || '',
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
      afp: formData.afp,
      arl: formData.arl,
      cajaCompensacion: formData.cajaCompensacion,
      tipoSangre: formData.tipoSangre,
      contactoNombre: formData.contactoNombre,
      contactoParentesco: formData.contactoParentesco,
      contactoTelefono: formData.contactoTelefono,
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
                    <Field label="Tipo de identificación" required error={errors.tipoDocumento}>
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

              {/* SECCIÓN 3: Residencia y salud */}
              <section>
                <SectionHeader icon="pi-home" title="Residencia y salud" desc="Dirección, seguridad social y contacto de emergencia" index="3" />

                {/* Fila 1: Dirección (ancho completo) */}
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-12">
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
                </div>

                {/* Fila 2: EPS + AFP + Tipo de sangre */}
                <div className="grid grid-cols-12 gap-4 mt-4">
                  <div className="col-span-12 sm:col-span-5">
                    <Controller
                      name="eps"
                      control={control}
                      rules={{ required: 'Requerido' }}
                      render={({ field }) => (
                        <EntityPopoverField
                          fieldKey="EPS"
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.eps}
                          required
                        />
                      )}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-4">
                    <Controller
                      name="afp"
                      control={control}
                      render={({ field }) => <EntityPopoverField fieldKey="AFP" value={field.value} onChange={field.onChange} error={errors.afp} />}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-3">
                    <Controller
                      name="tipoSangre"
                      control={control}
                      render={({ field }) => <EntityPopoverField fieldKey="Sangre" value={field.value} onChange={field.onChange} error={errors.tipoSangre} />}
                    />
                  </div>
                </div>

                {/* Fila 2.5: ARL + Caja de compensación */}
                <div className="grid grid-cols-12 gap-4 mt-4">
                  <div className="col-span-12 sm:col-span-6">
                    <Controller
                      name="arl"
                      control={control}
                      render={({ field }) => <EntityPopoverField fieldKey="ARL" value={field.value} onChange={field.onChange} error={errors.arl} />}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-6">
                    <Controller
                      name="cajaCompensacion"
                      control={control}
                      render={({ field }) => <EntityPopoverField fieldKey="Caja" value={field.value} onChange={field.onChange} error={errors.cajaCompensacion} />}
                    />
                  </div>
                </div>

                {/* Fila 3: Contacto de emergencia */}
                <div className="grid grid-cols-12 gap-4 mt-4">
                  <div className="col-span-12 sm:col-span-5">
                    <Field label="Contacto de emergencia (nombre)" error={errors.contactoNombre} icon="pi-users">
                      <Controller
                        name="contactoNombre"
                        control={control}
                        render={({ field }) => (
                          <span className="relative block">
                            <i className={`${inputIconLeftClass} pi pi-user`} />
                            <InputText {...field} className={`${fieldInputClass} pl-10`} placeholder="Ej: María Pérez" />
                          </span>
                        )}
                      />
                    </Field>
                  </div>
                  <div className="col-span-12 sm:col-span-3">
                    <Field label="Parentesco" error={errors.contactoParentesco}>
                      <Controller
                        name="contactoParentesco"
                        control={control}
                        render={({ field }) => (
                          <Dropdown
                            value={field.value}
                            onChange={(e) => field.onChange(e.value)}
                            options={parentescoOptions}
                            placeholder="Seleccionar…"
                            className="w-full"
                            panelClassName="gth-dropdown-panel"
                          />
                        )}
                      />
                    </Field>
                  </div>
                  <div className="col-span-12 sm:col-span-4">
                    <Field label="Teléfono de contacto" error={errors.contactoTelefono} icon="pi-phone">
                      <Controller
                        name="contactoTelefono"
                        control={control}
                        render={({ field }) => (
                          <span className="relative block">
                            <i className={`${inputIconLeftClass} pi pi-phone`} />
                            <InputText
                              {...field}
                              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 12))}
                              className={`${fieldInputClass} pl-10`}
                              placeholder="3001234567"
                            />
                          </span>
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
                    <Controller
                      name="profesion"
                      control={control}
                      render={({ field }) => (
                        <EntityPopoverField
                          fieldKey="Profesion"
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.profesion}
                        />
                      )}
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-4">
                    <Controller
                      name="cargo"
                      control={control}
                      render={({ field }) => (
                        <EntityPopoverField
                          fieldKey="Cargo"
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.cargo}
                        />
                      )}
                    />
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
          {value || '—'}
        </p>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════
   EntityPopoverField — selector enriquecido genérico para AFP / ARL / Caja
   Usa la config ENTITY_POPOVERS para mantener el código DRY.
   ════════════════════════════════════════════════════════════════ */
function EntityPopoverField({ fieldKey, value, onChange, error, required }) {
  const cfg = ENTITY_POPOVERS.find((c) => c.name === fieldKey)
  const op = useRef(null)
  const initialHover = cfg ? (value || cfg.options[0].value) : null
  const [hovered, setHovered] = useState(initialHover)
  const [search, setSearch] = useState('')

  if (!cfg) return null

  const selected = cfg.options.find((a) => a.value === value)
  const tone = cfg.iconColor || 'brand'
  const paletteSel = selected ? BADGE_PALETTE[cfg.palette(selected)] || BADGE_PALETTE[tone] : 'bg-slate-300 dark:bg-slate-600'

  /* Filtrado por búsqueda cuando es searchable */
  const filteredOptions = (() => {
    if (!cfg.searchable || !search.trim()) return cfg.options
    const q = search.toLowerCase().trim()
    return cfg.options.filter((a) => a.label.toLowerCase().includes(q))
  })()
  const visibleOptions = cfg.visibleLimit && filteredOptions.length > cfg.visibleLimit
    ? filteredOptions.slice(0, cfg.visibleLimit)
    : filteredOptions

  /* Focus siempre cae sobre el primer item visible filtrado/seleccionado */
  const focus = selected
    || (visibleOptions.find((a) => a.value === hovered))
    || visibleOptions[0]
    || cfg.options[0]
  const footerRows = cfg.footer(focus)
  const wideFooter = footerRows.find((r) => r.wide)

  const renderBadge = a => (a.initials || a.label.slice(0, 2)).toUpperCase()

  return (
    <div>
      <label className={labelClass}>
        <i className={`pi ${cfg.icon} text-[10px] text-brand-600`} />
        {cfg.name}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>

      <button
        type="button"
        onClick={(e) => op.current.toggle(e)}
        className={`w-full text-left rounded-xl border-2 transition px-3.5 py-3 flex items-center gap-3 ${
          selected
            ? 'border-brand-300 bg-brand-50/40 dark:bg-brand-900/20 dark:border-brand-700'
            : 'border-slate-200 bg-white dark:bg-slate-800/60 dark:border-slate-700 hover:border-slate-300'
        } ${error ? 'border-rose-400 dark:border-rose-600' : ''}`}
      >
        <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm ${paletteSel}`}>
          {selected ? renderBadge(selected) : '?'}
        </span>
        <div className="flex-1 min-w-0">
          {selected ? (
            <>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{selected.label}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {cfg.cardSub(selected)}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">Seleccionar {cfg.name}…</p>
              <p className="text-[11px] text-slate-400">Click para ver opciones</p>
            </>
          )}
        </div>
        <i className={`pi ${selected ? 'pi-pencil' : 'pi-chevron-down'} text-[10px] text-slate-400 shrink-0`} />
      </button>

      {error && (
        <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
          <i className="pi pi-exclamation-circle" />{error.message}
        </p>
      )}

      <OverlayPanel ref={op} showCloseIcon={false} className="entity-popover" style={{ width: 500 }}>
        <div className="-m-4">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-br from-brand-50/60 to-white dark:from-brand-900/20 dark:to-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{cfg.headerTitle}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{cfg.headerSub}</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-900/40 px-2 py-1 rounded">
                {cfg.searchable && search
                  ? `${filteredOptions.length} de ${cfg.options.length}`
                  : `${cfg.options.length} opciones`}
              </span>
            </div>
          </div>

          {/* Buscador (si la entidad lo define) */}
          {cfg.searchable && (
            <div className="px-3 pt-3 pb-1">
              <div className="relative">
                <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={cfg.searchPlaceholder || 'Buscar...'}
                  className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Limpiar búsqueda"
                  >
                    <i className="pi pi-times-circle text-sm" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Lista */}
          <div className="p-3 space-y-1.5 max-h-72 overflow-y-auto">
            {visibleOptions.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                <i className="pi pi-search text-2xl text-slate-300 block mb-2" />
                Sin resultados para «{search}»
              </div>
            ) : visibleOptions.map((a) => {
              const isSel = value === a.value
              const isHover = hovered === a.value
              const itemPalette = BADGE_PALETTE[cfg.palette(a)] || BADGE_PALETTE[tone]
              const chip = cfg.cardChip ? cfg.cardChip(a) : null
              const chipClass = chip && {
                brand:   'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300',
                emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
                amber:   'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                slate:   'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
                rose:    'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
                violet:  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
                cyan:    'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
              }[chip.color]
              return (
                <button
                  key={a.value}
                  type="button"
                  onMouseEnter={() => setHovered(a.value)}
                  onClick={() => { onChange(a.value); op.current.hide() }}
                  className={`w-full text-left rounded-lg p-2.5 flex items-center gap-3 transition border ${
                    isSel
                      ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-300 dark:border-brand-700 ring-2 ring-brand-200 dark:ring-brand-800'
                      : isHover
                        ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                        : 'bg-transparent border-transparent'
                  }`}
                >
                  <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm ${itemPalette}`}>
                    {renderBadge(a)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{a.label}</p>
                      {isSel && <i className="pi pi-check-circle text-brand-600 dark:text-brand-400 text-xs" />}
                      {chip && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${chipClass}`}>
                          {chip.label}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {cfg.cardSub(a)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 leading-tight">{cfg.cardRightLabel}</p>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{cfg.cardRightValue(a)}</p>
                  </div>
                </button>
              )
            })}

            {/* Indicador de "ver más" si se truncó por el limit */}
            {cfg.searchable && search && filteredOptions.length > (cfg.visibleLimit || visibleOptions.length) && (
              <div className="px-3 py-2 text-center text-[11px] text-slate-500 dark:text-slate-400">
                Mostrando los primeros {cfg.visibleLimit} resultados — refina la búsqueda para ver más
              </div>
            )}
          </div>

          {/* Footer: vista rápida del item hover/seleccionado */}
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/50">
            <div className="flex items-start gap-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 mt-1">
                Vista rápida
              </span>
              <div className={`flex-1 grid gap-2 text-[11px] ${wideFooter ? 'grid-cols-1' : 'grid-cols-3'}`}>
                {footerRows.map((r, i) => (
                  <Mini key={i} label={r.label} value={r.value} highlight={r.highlight} wide={r.wide} />
                ))}
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <i className="pi pi-info-circle" />
                Click para seleccionar · Hover para detalles
              </span>
              {cfg.searchable && (
                <span className="inline-flex items-center gap-1">
                  <i className="pi pi-keyboard" />
                  {filteredOptions.length} resultado{filteredOptions.length === 1 ? '' : 's'}
                </span>
              )}
            </p>
          </div>
        </div>
      </OverlayPanel>
    </div>
  )
}

function Mini({ label, value, highlight, wide }) {
  return (
    <div className={`rounded px-2 py-1 ${highlight ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-white dark:bg-slate-700/50'} border border-slate-200 dark:border-slate-600`}>
      <p className="text-[9px] uppercase tracking-wider text-slate-400 leading-tight">{label}</p>
      <p className={`${wide ? 'text-[11px]' : 'text-xs'} font-bold leading-tight ${highlight ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'}`}>{value}</p>
    </div>
  )
}

// â”€â”€ Dropdown de Cargo con bÃºsqueda (intenta ESCO, fallback local) â€” DEPRECATED
//     Se mantiene Profesión/Carrera como campo principal

