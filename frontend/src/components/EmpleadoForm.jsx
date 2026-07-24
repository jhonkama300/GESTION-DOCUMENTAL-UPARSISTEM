import { useEffect, useState } from 'react'
import { Dialog } from 'primereact/dialog'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { Calendar } from 'primereact/calendar'
import { Button } from 'primereact/button'
import { InputMask } from 'primereact/inputmask'
import { useForm, Controller } from 'react-hook-form'

const CARGOS = [
  'Desarrollador', 'Diseñador', 'Analista', 'Contador', 'Project Manager',
  'Practicante', 'Director', 'Coordinador',
]
const AREAS = ['Tecnología', 'Producto', 'Talento Humano', 'Financiera', 'Operaciones', 'Marketing', 'Comercial']
const SEDES = ['Bogotá', 'Medellín', 'Cali']

export default function EmpleadoForm({ visible, onHide, onSave }) {
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      cedula: '',
      nombre: '',
      email: '',
      telefono: '',
      cargo: null,
      area: null,
      sede: null,
      fechaIngreso: new Date(),
      estado: 'Activo',
    },
  })

  useEffect(() => {
    if (visible) reset()
  }, [visible, reset])

  const submit = async (data) => {
    await new Promise((r) => setTimeout(r, 600))
    onSave?.(data)
    onHide()
  }

  const Field = ({ label, error, children, required }) => (
    <div>
      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500 mt-1">{error.message}</p>}
    </div>
  )

  return (
    <Dialog
      visible={visible}
      onHide={onHide}
      header={
        <div className="flex items-center gap-2">
          <i className="pi pi-user-plus text-brand-600" />
          <span>Nuevo empleado</span>
        </div>
      }
      modal
      style={{ width: 'min(640px, 96vw)' }}
      contentStyle={{ paddingTop: 8 }}
    >
      <form onSubmit={handleSubmit(submit)} className="grid grid-cols-2 gap-4">
        <div className="col-span-2 sm:col-span-1">
          <Field label="Cédula" required error={errors.cedula}>
            <Controller
              name="cedula"
              control={control}
              rules={{ required: 'Requerido', pattern: { value: /^\d{6,12}$/, message: 'Solo números (6-12)' } }}
              render={({ field }) => <InputText {...field} className="w-full" placeholder="1234567890" />}
            />
          </Field>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <Field label="Nombre completo" required error={errors.nombre}>
            <Controller
              name="nombre"
              control={control}
              rules={{ required: 'Requerido', minLength: { value: 3, message: 'Mínimo 3 caracteres' } }}
              render={({ field }) => <InputText {...field} className="w-full" placeholder="Ej: Laura Pérez" />}
            />
          </Field>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <Field label="Email corporativo" required error={errors.email}>
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Requerido',
                pattern: { value: /^[^@]+@[^@]+\.[^@]+$/, message: 'Email inválido' },
              }}
              render={({ field }) => <InputText {...field} className="w-full" placeholder="laura@empresa.com" />}
            />
          </Field>
        </div>

        <div className="col-span-2 sm:col-span-1">
          <Field label="Teléfono">
            <Controller
              name="telefono"
              control={control}
              render={({ field }) => (
                <InputMask {...field} mask="+57 999 999 9999" placeholder="+57 300 000 0000" className="w-full" />
              )}
            />
          </Field>
        </div>

        <div>
          <Field label="Cargo" required error={errors.cargo}>
            <Controller
              name="cargo"
              control={control}
              rules={{ required: 'Requerido' }}
              render={({ field }) => (
                <Dropdown
                  {...field}
                  options={CARGOS.map((c) => ({ label: c, value: c }))}
                  placeholder="Seleccionar"
                  className="w-full"
                />
              )}
            />
          </Field>
        </div>

        <div>
          <Field label="Área" required error={errors.area}>
            <Controller
              name="area"
              control={control}
              rules={{ required: 'Requerido' }}
              render={({ field }) => (
                <Dropdown
                  {...field}
                  options={AREAS.map((a) => ({ label: a, value: a }))}
                  placeholder="Seleccionar"
                  className="w-full"
                />
              )}
            />
          </Field>
        </div>

        <div>
          <Field label="Sede" required error={errors.sede}>
            <Controller
              name="sede"
              control={control}
              rules={{ required: 'Requerido' }}
              render={({ field }) => (
                <Dropdown
                  {...field}
                  options={SEDES.map((s) => ({ label: s, value: s }))}
                  placeholder="Seleccionar"
                  className="w-full"
                />
              )}
            />
          </Field>
        </div>

        <div>
          <Field label="Fecha de ingreso" required>
            <Controller
              name="fechaIngreso"
              control={control}
              rules={{ required: 'Requerido' }}
              render={({ field }) => <Calendar {...field} className="w-full" dateFormat="dd/mm/yy" />}
            />
          </Field>
        </div>

        <div className="col-span-2 flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700 mt-2">
          <Button label="Cancelar" outlined type="button" onClick={onHide} />
          <Button
            label={isSubmitting ? 'Guardando...' : 'Guardar empleado'}
            icon={isSubmitting ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
            type="submit"
            severity="info"
            disabled={isSubmitting}
          />
        </div>
      </form>
    </Dialog>
  )
}
