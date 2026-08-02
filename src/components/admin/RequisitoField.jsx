import { Dropdown } from 'primereact/dropdown'
import { InputText } from 'primereact/inputtext'
import { InputTextarea } from 'primereact/inputtextarea'
import { InputNumber } from 'primereact/inputnumber'
import { Calendar } from 'primereact/calendar'

/**
 * RequisitoField — ITERACIÓN 6 · Motor Documental Visual
 *
 * Renderiza UN input variable de un requisito de plantilla, según `tipo_dato`.
 *
 * Por qué existe: el backend (RequirementsService) declara QUÉ pide
 * (tipo_dato, placeholder, obligatorio). El frontend SOLO pinta.
 * El día que se agregue un nuevo tipo_dato al backend (ej: "textarea-multi"),
 * se agrega un case aquí.
 *
 * Shape del requisito (viene de RequirementsService):
 *   {
 *     variable: 'OBSERVACIONES',
 *     placeholder: 'Notas adicionales',
 *     obligatorio: true,
 *     tipo_dato: 'string' | 'date' | 'number' | 'currency' | 'textarea' | 'enum',
 *     opciones?: ['A', 'B', 'C']  // solo para enum
 *   }
 */
export default function RequisitoField({ requisito, value, onChange, disabled = false }) {
  const { variable, placeholder, obligatorio, tipo_dato, opciones } = requisito

  const label = variable.replace(/_/g, ' ').toLowerCase()
  const helpId = `help-${variable}`

  return (
    <div>
      <label
        htmlFor={`req-${variable}`}
        className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block"
      >
        {label}
        {obligatorio && <span className="text-rose-500 ml-1">*</span>}
      </label>

      {/* Enum: Dropdown con opciones fijas declaradas por config */}
      {tipo_dato === 'enum' && (
        <Dropdown
          inputId={`req-${variable}`}
          value={value ?? null}
          options={(opciones || []).map((o) => ({ value: o, label: o }))}
          onChange={(e) => onChange?.(e.value)}
          placeholder={placeholder || 'Seleccionar…'}
          className="w-full"
          disabled={disabled}
        />
      )}

      {/* Date: Calendar */}
      {tipo_dato === 'date' && (
        <Calendar
          inputId={`req-${variable}`}
          value={value ? new Date(value) : null}
          onChange={(e) => onChange?.(e.value ? e.value.toISOString().slice(0, 10) : null)}
          dateFormat="yy-mm-dd"
          className="w-full"
          showIcon
          disabled={disabled}
        />
      )}

      {/* Number / Currency: InputNumber */}
      {(tipo_dato === 'number' || tipo_dato === 'currency') && (
        <InputNumber
          inputId={`req-${variable}`}
          value={value ?? null}
          onValueChange={(e) => onChange?.(e.value ?? null)}
          mode={tipo_dato === 'currency' ? 'currency' : 'decimal'}
          currency={tipo_dato === 'currency' ? 'COP' : undefined}
          locale="es-CO"
          className="w-full"
          disabled={disabled}
        />
      )}

      {/* Textarea: input largo */}
      {tipo_dato === 'textarea' && (
        <InputTextarea
          inputId={`req-${variable}`}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder || ''}
          rows={3}
          className="w-full text-sm"
          disabled={disabled}
        />
      )}

      {/* String (default): InputText */}
      {(!tipo_dato || tipo_dato === 'string') && (
        <InputText
          inputId={`req-${variable}`}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder || ''}
          className="w-full"
          disabled={disabled}
        />
      )}

      {placeholder && tipo_dato !== 'textarea' && (
        <p id={helpId} className="text-[10px] text-slate-400 mt-1 italic">
          {placeholder}
        </p>
      )}
    </div>
  )
}
