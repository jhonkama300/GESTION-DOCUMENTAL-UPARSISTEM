# Continuación — Gestión Documental GTH

Documento de handoff para continuar el trabajo en otro equipo (laptop). Contiene el contexto completo, decisiones tomadas, problemas resueltos y trabajo pendiente.

---

## Estado del proyecto

- **Stack:** React 19 + Vite 8 + PrimeReact 10.9 + Tailwind 3 + React Hook Form
- **Ruta frontend:** `D:\UPARSISTEM\GESTION DOCUMENTAL\frontend`
- **Login:** verde lima `#A8CF45` (resto de la app)
- **Roles:** solo Administrador y Administrativo
- **Sedes:** Uparsistem (verde) y Jeanpiaget (emerald)
- **Modal crear/editar empleado:** patrón con sidebar preview + secciones numeradas + tabs (Resumen/Laboral/Expediente/Actividad)
- **Stack de seguridad social en popovers:** 7 entidades (EPS, AFP, ARL, Caja, Cargo, Profesión, Sangre) con el mismo patrón visual

---

## Cambios realizados en esta sesión

### 1. Modal de vista previa del empleado (EmpleadoDrawer) — rediseño completo

**Problema:** El modal anterior tenía layout plano en tabs sin organización visual.

**Solución:** Mismo patrón que el modal de crear/editar (EmpleadoForm):
- `min(1100px, 96vw)` ancho, `min(88vh, 760px)` alto
- **Sidebar 288px** (left) con avatar 112×112 + 6 mini-stats (cédula, ingreso, antigüedad, área, correo, teléfono)
- **Tabs (right)** con 4 secciones: Resumen, Laboral, Expediente, Actividad
- Cada sección con header numerado (1, 2, 3) + descripción
- Timeline vertical con dots coloreados
- DocCards de 9 archivos en grid 3-col con badge "verificado"
- Footer sticky con "Vista rápida" + acciones (Imprimir, Cerrar, Editar perfil)

**Componentes auxiliares agregados:** `<SidebarStat>`, `<Section>`, `<Field>`, `<TimelineEvent>`, `<DocCard>` (todos al final de EmpleadoDrawer.jsx).

---

### 2. Modal "se queda en blanco" — diagnóstico y arreglo

**Síntoma:** Al abrir el modal de nuevo empleado, la pantalla quedaba en blanco.

**Causas identificadas (múltiples bugs en cadena):**

1. **Optional chaining mal aplicado** — `empleado.nombre?.split(' ')[0]` reventaba cuando `empleado` era `undefined`:
   ```diff
   - empleado.nombre?.split(' ')[0]
   + empleado.nombre?.split(' ')?.[0]
   ```
   Y: `field.value?.split(' - ')[1]` → `field.value?.split(' - ')?.[1]`

2. **LocationPicker — `stageSub` reventaba** (este era el bug principal que dejaba el modal en blanco):
   ```jsx
   // ANTES — todas las props se evaluan al construir el objeto
   const stageSub = {
     1: '...',
     2: pais ? `${pais.flag} ${pais.name}` : '',
     3: `${pais.flag} ${pais.name} · ${depto.name}`,  // 💥 pais.flag throw
   }[stage]
   ```
   ```jsx
   // AHORA — IIFE solo evalúa la rama de stage actual
   const stageSub = (() => {
     if (stage === 1) return '...'
     if (stage === 2) return pais ? `${pais.flag} ${pais.name}` : ''
     if (stage === 3 && pais && depto) return `${pais.flag} ${pais.name} · ${depto.name}`
     return ''
   })()
   ```

3. **Defensiva añadida** en otros accesos a `pais.X` y `depto.X` en LocationPicker con `?.` y fallbacks.

**Regla mental:**
```jsx
foo?.bar()      → seguro
foo?.bar()[0]   → PELIGRO ([0] sobre undefined → TypeError)
foo?.bar()?.[0] → seguro
```

---

### 3. Popovers de seguridad social — 7 entidades unificadas

Refactor completo del patrón de selección para: **EPS, AFP, ARL, Caja, Cargo, Profesión, Sangre**.

**Patrón común (`EntityPopoverField`):**
- Toggle con border redondeado + badge de color + label truncado + icono pencil/chevron
- Popover 500px con:
  - Header con título + subtítulo dinámico + contador
  - Input de búsqueda (autofocus) para listas largas
  - Lista de cards seleccionables (mismo estilo que EntityPopoverField)
  - Footer "Vista rápida" con mini-cards de info

**Config-driven (DRY)** — todo en `ENTITY_POPOVERS`:
```js
{
  name: 'Sangre',
  icon: 'pi-heart-fill',
  iconColor: 'rose',
  options: TIPOS_SANGRE,
  searchable: true,
  searchPlaceholder: 'Buscar tipo (ej: O+, A+)...',
  headerTitle: '...',
  headerSub: '...',
  cardSub: (a) => `Grupo ${a.grupo} · Factor Rh ${a.rh}`,
  cardChip: (a) => ({ label: ..., color: ... }),
  cardRightLabel: '...',
  cardRightValue: (a) => ...,
  footer: (a) => [...],
  palette: (a) => ...,
}
```

**Datos enriquecidos en `colombia.js`:**
- `TIPOS_SANGRE`: cada tipo tiene `grupo`, `rh`, `frecuencia`, `puedeDonarA`, `puedeRecibirDe`
- `EPS_COLOMBIA`: cada EPS tiene `regimen`, `region`, `estrellas`, `cobertura`
- `ARL_COLOMBIA`: cada ARL tiene `riesgoCubierto`, `estrellas`
- `CAJA_COMPENSACION_COLOMBIA`: cada caja tiene `region`, `cuota`, `servicios[]`

**Datos enriquecidos en `programas.js`:**
- `CARGOS_ENRIQUECIDOS`: 1134 cargos clasificados por heurística → `{ label, value, initials, nivel, area }`
- `PROGRAMAS_ENRIQUECIDOS`: cada programa → `{ label, value, initials, nivel, duracion, area }`
- Función `classifyCargo()` detecta: Directivo, Subdirección, Jefatura, Profesional Senior, Profesional, Operativo, Técnico, Junior

**Niveles de paleta:** `NIVEL_COLOR_MAP` (brand/emerald/cyan/amber/slate/rose/violet)

---

### 4. EPS convertido a popover

EPS pasó de `Dropdown` simple a `EntityPopoverField` (los popovers anteriores eran AFP, ARL, Caja, Sangre):

```jsx
{
  name: 'EPS',
  options: EPS_COLOMBIA,
  searchable: true,
  cardChip: (a) => ({ label: a.regimen, color: REGIMEN_COLORS[a.regimen] }),
  ...
}
```

---

### 5. Profesión y Cargo convertidos a popovers (con búsqueda)

Patrón especializado para listas largas (>100 items):

```jsx
{
  name: 'Cargo',
  options: CARGOS_ENRIQUECIDOS,         // 1134 items
  searchable: true,
  searchPlaceholder: 'Buscar cargo (ej: Desarrollador)...',
  visibleLimit: 50,                     // máximo de cards mostradas
  ...
}
{
  name: 'Profesion',
  options: PROGRAMAS_ENRIQUECIDOS,      // ~250 items
  searchable: true,
  searchPlaceholder: 'Buscar programa (ej: Administración)...',
  visibleLimit: 80,
  ...
}
```

**Búsqueda inteligente:**
- Filtra por `label.toLowerCase().includes(query)` case-insensitive
- Si filteredOptions.length > visibleLimit, recorta y muestra "Mostrando los primeros N — refina para ver más"
- Header dinámico: "1134 opciones" sin búsqueda, "5 de 1134" con búsqueda

**Implementación de `EntityPopoverField` con búsqueda:**
- `useState('')` para search query
- `filteredOptions` memoizado por IIFE
- `visibleOptions` recortado si excede limit
- Input con `autoFocus` (PrimeReact lo aplica al montarse)
- Botón X para limpiar búsqueda cuando hay texto

---

### 6. X removida de los popovers

```diff
- <OverlayPanel ref={op} showCloseIcon className="entity-popover">
+ <OverlayPanel ref={op} showCloseIcon={false} className="entity-popover">
```

Aplicado a los 7 popovers. Se cierra con click en card, click fuera, o ESC.

---

### 7. LocationPicker rediseñado con stepper País→Depto→Ciudad

**Problema:** El modal se rompía al seleccionar ubicación. El toggle mostraba `Cesar, Colombia` ignorando la ciudad.

**Solución:**
- **Stepper crumb** en el header: `1. País › 2. Depto › 3. Ciudad` con highlight brand-color en etapa actual
- **Toggle button** muestra `"Ciudad - Depto - País"`:
  ```
  ┌────────────────────────────────────────┐
  │ 🇨🇴  Valledupar - Cesar - Colombia  ✏️│
  │     125 ciudades disponibles            │
  └────────────────────────────────────────┘
  ```
- Helper `formatLocationDisplay()` que parsea "País - Ciudad - Depto" → "Ciudad - Depto - País"
- **Footer "Vista rápida"** con 3 mini-cards: País / Depto / Ciudad
- **Header con sub-título dinámico** según stage:
  - Stage 1: "Origen geográfico · país de nacimiento"
  - Stage 2: "🇨🇴 Colombia"
  - Stage 3: "🇨🇴 Colombia · Cesar"
- **Búsqueda global** cuando no hay país seleccionado (busca en países + deptos + ciudades)
- **Búsqueda filtrada** cuando ya hay país (filtra deptos)
- **Navigate-back buttons**: "Cambiar país: 🇨🇴 Colombia" / "Cambiar depto: Cesar"
- **Botón Limpiar** siempre que hay valor
- **`PickCard` component** reutilizable con estados selected/hovered (mismo patrón EntityPopoverField)
- **País flag emojis** 🇨🇴🇻🇪🇪🇨🇵🇪🇧🇷🇦🇷🇲🇽🇺🇸🇪🇸 con gradientes por país
- Color del badge toggle cambia según país (CO=brand, VE/EC=amber, PE=rose, BR/MX=emerald, AR=cyan, US=blue)

---

### 8. Empleados.jsx rediseñado con jerarquía mejorada

**Jerarquía de 3 niveles:**

**Nivel 1 — Banda de estadísticas** (4 KPI cards):
- Total / Activos (+ %) / Inactivos / Áreas
- Cada uno con icono coloreado en cuadro brand

**Nivel 2 — Filtros** (cards + chips en card):
- Buscador amplio (`flex-1 min-w-[260px]`)
- Chips de estado: `Todos [8] · Activos [7] · Inactivos [1]` con conteo en vivo

**Nivel 3 — Tabla con jerarquía visual fuerte:**
- Avatar con color hash del nombre (paleta 8 colores)
- Cargo en highlight brand
- Área como chip gris
- Sede con icono `pi-map-marker`
- Estado con punto de color animado + label
- Acciones con borde que cambian a color al hover

**Nivel 4 — Footer de card:**
- "Mostrando 8 de 8 empleados" con botón "Limpiar filtros"

**Componentes auxiliares:**
- `<Stat>` con `accent` color (slate/brand/emerald)
- `<Chip>` para filtros (Todos/Activos/Inactivos) con `tone`
- `<Section>` con index + icono + título + descripción
- `<Field>` soporta `mono`, `chip` (6 colores), `highlight`

---

### 9. IconField reemplazado por div manual con búsqueda

**Problema:** PrimeReact `IconField` + `InputText` no aplicaba padding automáticamente al input (el icono pisaba el placeholder).

**Solución en Empleados.jsx:**
```jsx
<div className="relative flex-1 min-w-[260px]">
  <i className="pi pi-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none" />
  <InputText className="w-full pl-10" />
</div>
```

Resultado: input ocupa todo el ancho + padding-left reservado para el icono.

---

### 10. Modal crear/editar empleado: secciones reorganizadas

**Sección 3 (Residencia y salud) ahora tiene 3 filas:**

**Fila 1:** Dirección (ancho completo, 12 cols)

**Fila 2:** EPS (5) + AFP (4) + Tipo de sangre (3) — todos como popovers
- Reordenado vs antes (era AFP primero, ahora EPS primero)

**Fila 2.5 (nueva):** ARL (6) + Caja de Compensación (6) — ambos como popovers
- Cada uno con `searchable: true` con autofocus

**Fila 3 (nueva, contacto de emergencia):**
- Contacto nombre (5) + Parentesco (3, dropdown) + Teléfono (4, input)

**Sección 4 (Información laboral):**
- Profesión / Carrera ahora como popover (5 cols)
- Cargo ahora como popover (4 cols)
- Reemplazó los Dropdowns simples con virtual scroll (1134 cargos)

---

## Archivos modificados (sesión actual)

| Archivo | Cambio |
|---|---|
| `frontend/src/components/EmpleadoDrawer.jsx` | Rediseño completo del drawer |
| `frontend/src/components/EmpleadoForm.jsx` | 7 popovers unificados, X removida, datos enriquecidos |
| `frontend/src/components/LocationPicker.jsx` | Stepper + formato "Ciudad - Depto - País" + bug fixes |
| `frontend/src/pages/Empleados.jsx` | Jerarquía 3 niveles + chips + IconField manual |
| `frontend/src/utils/colombia.js` | Datos enriquecidos (TIPOS_SANGRE, AFP, ARL, CAJA, EPS) |
| `frontend/src/utils/programas.js` | `CARGOS_ENRIQUECIDOS` + `PROGRAMAS_ENRIQUECIDOS` + `classifyCargo()` |
| `frontend/src/utils/format.js` | (sin cambios esta sesión, ya tenía `avatarColor`) |
| `frontend/continuancion.md` | Este archivo |

---

## Comando útiles

> **NO** correr `npm run build` ni `npm run dev` según indicación del usuario — leer el código directamente.

```bash
# Iniciar dev server (puertos 5173 o 5174 según disponibilidad)
cd frontend && npm run dev

# Build producción
cd frontend && npm run build

# Lint
cd frontend && npm run lint
```

---

## Trabajo pendiente / Por hacer

### Bugs latentes que vigilar
- [ ] Verificar encoding UTF-8 en otros archivos del proyecto (Topbar, Sidebar, CommandPalette, mock.data.js, etc.)
- [ ] Validar rendimiento del modal de crear/editar con 7 popovers montados simultáneamente
- [ ] El drawer modal EmpleadoDrawer no tiene integración con datos reales — los campos hardcodeados ("Sanitas", "+57 300 123 4567") deben leerse del empleado real

### Mejoras futuras (no prioritarias)
- [ ] Virtual scroll dentro del popover para Cargo (1134 items no entran en scroll manual)
- [ ] ESCO API real para Profesión/Cargo (actualmente solo fallback local)
- [ ] Foto del empleado real en el drawer (actualmente siempre usa iniciales)
- [ ] Búsqueda fuzzy en los popovers (no solo `includes`, sino coincidencia parcial)
- [ ] Modal fullscreen tipo Linear/GitHub para formularios densos

---

## Contexto de la conversación (sesión actual)

### Problemas resueltos
1. ✅ **Modal en blanco** — bug crítico: stageSub evaluaba todas las props del objeto literal, reventando al renderizar. Fix con IIFE.
2. ✅ **Optional chaining mal puesto** — `?.split()[0]` no protege contra indexar `undefined`. Fix con `?.split()?.[0]`.
3. ✅ **Toggle LocationPicker mostraba solo Depto, País** — Fix con `formatLocationDisplay()` que parsea "País - Ciudad - Depto" → "Ciudad - Depto - País".
4. ✅ **Ref={op} duplicado** en botón y OverlayPanel (eliminado del botón).
5. ✅ **X close icon** en los 7 popovers removida para consistencia visual.

### Decisiones de diseño
- ✅ 7 entidades unificadas con el mismo patrón visual (EPS, AFP, ARL, Caja, Sangre, Cargo, Profesión)
- ✅ Searchable + autofocus en TODOS los popovers para UX consistente
- ✅ Clasificación heurística de cargos (no se necesita mantener tabla de clasificación)
- ✅ Función `classifyCargo()` es determinística por nombre — agregar nuevos cargos no requiere actualizar un mapa manual

### Patrones aplicados
- **EntityPopoverField** — componente genérico DRY con config-driven approach
- **LocationPicker PickCard** — componente interno para cards seleccionables
- **IIFE para objetos con valores computados** — evita el bug de evaluar todas las props
- **`?.` en cadena completa** — `obj?.foo?.bar?.baz` no solo hasta el primer nivel
