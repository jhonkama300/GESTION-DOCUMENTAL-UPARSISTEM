/**
 * Origenes metadata — ITERACIÓN 3 · FASE 3
 *
 * Define los 9 origenes del motor documental y sus METADATOS (label, descripción,
 * si tienen catálogo de campos asociado, etc.).
 *
 * Los CAMPOS de cada origen (empleado/contrato/entidad/usuario/sistema) NO
 * están aquí — se consultan via `/api/campos-catalogo?origen=X` y se cachean
 * en `camposCatalogo.service.js`.
 *
 * Esto permite que el admin agregue/edite campos desde la UI CRUD sin tocar
 * el frontend del Diseñador. Cuando FASE 4/7 cree el FunctionRegistry, las
 * funciones registradas allí se sumarán a este catálogo (vía API).
 */

/**
 * Lista maestra de origenes. El orden en que aparecen en los dropdowns.
 *
 * Reglas (alineadas con el plan maestro):
 *   - empleado | contrato | entidad | usuario | sistema → tienen catálogo de campos (BD)
 *   - manual | constante                                 → sin catálogo (UI inline)
 *   - funcion                                           → lista de funciones sin input via GET /api/functions
 *   - compuesto                                         → editor inline: otra variable + función con input
 */
export const ORIGENES = [
  { value: 'empleado',   label: 'Empleado',   description: 'Datos del empleado seleccionado',     hasCatalog: true },
  { value: 'contrato',   label: 'Contrato',   description: 'Datos del contrato vigente del empleado', hasCatalog: true },
  { value: 'entidad',    label: 'Entidad',    description: 'Datos de la sede / entidad empleadora', hasCatalog: true },
  { value: 'usuario',    label: 'Usuario',    description: 'Usuario actualmente logueado',         hasCatalog: true },
  { value: 'sistema',    label: 'Sistema',    description: 'Generado automáticamente al emitir',    hasCatalog: true },
  { value: 'funcion',    label: 'Función',    description: 'Aplica una función del registro (uuid, fecha, hora...)', hasCatalog: false },
  { value: 'constante',  label: 'Constante',  description: 'Valor literal fijo para todos los documentos', hasCatalog: false },
  { value: 'manual',     label: 'Manual',     description: 'El usuario lo completa al generar',     hasCatalog: false },
  { value: 'compuesto',  label: 'Compuesto',  description: 'Aplica una función a otra variable del documento', hasCatalog: false },
]

export function getOrigenMeta(origen) {
  return ORIGENES.find((o) => o.value === origen)
}

export function getOrigenLabel(origen) {
  return getOrigenMeta(origen)?.label ?? origen
}

export function getOrigenDescription(origen) {
  return getOrigenMeta(origen)?.description ?? ''
}

export function hasCatalog(origen) {
  return getOrigenMeta(origen)?.hasCatalog ?? false
}

/**
 * Tipos de dato soportados (mirror del backend `campos_catalogo.tipo_dato`).
 */
export const TIPOS_DATO = [
  { value: 'string',   label: 'Texto',          icon: 'pi pi-pencil' },
  { value: 'date',     label: 'Fecha',          icon: 'pi pi-calendar' },
  { value: 'number',   label: 'Número',         icon: 'pi pi-hashtag' },
  { value: 'currency', label: 'Moneda (COP)',   icon: 'pi pi-dollar' },
  { value: 'enum',     label: 'Lista cerrada',  icon: 'pi pi-list' },
  { value: 'uuid',     label: 'UUID',           icon: 'pi pi-id-card' },
]

export function getTipoDatoMeta(tipo) {
  return TIPOS_DATO.find((t) => t.value === tipo)
}
