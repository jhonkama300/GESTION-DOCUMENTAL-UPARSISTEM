# Continuación — Gestión Documental GTH

Handoff rápido para retomar trabajo en otra sesión. Pensado para arrancar sin contexto previo.

---

## Estado actual

- **Stack frontend:** React 19 + Vite 8 + PrimeReact 10.9 + Tailwind 3 + React Hook Form + axios + React Router 7
- **Stack backend:** PHP 8.1+ propio (sin framework) + PHPWord 1.1 + JWT HS256 + MariaDB
- **Frontend ruta:** `C:\Users\jhonk\Desktop\UPARSISTEM\GESTION-DOCUMENTAL-UPARSISTEM\frontend`
- **Backend ruta original:** `C:\Users\jhonk\Desktop\UPARSISTEM\GESTION-DOCUMENTAL-UPARSISTEM\backend`
- **Backend ruta deploy XAMPP:** `C:\xampp\htdocs\gth-api\` (Apache + mod_rewrite, hardlinks)
- **URL backend:** `http://localhost/gth-api/api`
- **URL frontend dev:** `http://localhost:5173` (o `:5174` si :5173 ocupado)
- **Frontend .env:** `VITE_API_URL=http://localhost/gth-api/api`
- **Backend .env (nuevo):** `APP_TZ=America/Bogota`, `DB_TIMEZONE=America/Bogota`, `TIME_SYNC_ENABLED=true`
- **Login color:** verde lima `#A8CF45` (resto de la app)
- **Roles:** Administrador, Administrativo
- **Sedes:** Uparsistem (UP) y Jeanpiaget (JP)
- **DB:** MariaDB (XAMPP por defecto), nombre `gth_uparsistem`, charset `utf8mb4`

---

## Cómo arrancar (3 pasos)

### 1. Levantar servicios XAMPP
- Panel de XAMPP → **Start Apache** y **Start MySQL/MariaDB**.
- (Apache y MySQL ya están corriendo según última sesión; verificar si responde).

### 2. Levantar frontend
```powershell
cd "C:\Users\jhonk\Desktop\UPARSISTEM\GESTION-DOCUMENTAL-UPARSISTEM\frontend"
npm run dev
```
Abre `http://localhost:5173` → login con `admin@gth.com` / `admin123`.

### 3. (Opcional) Probar backend directo
```powershell
curl -X POST http://localhost/gth-api/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@gth.com","password":"admin123"}'
curl http://localhost/gth-api/api/time                    # hora autoritativa del servidor
curl http://localhost/gth-api/api/empleados -H "Authorization: Bearer <TOKEN>"
curl "http://localhost/gth-api/api/empleados?sede_id=1" -H "Authorization: Bearer <TOKEN>"
```

---

## Cuentas demo (hardcoded en `src/Models/Usuario.php`)

| Email | Password | Rol |
|---|---|---|
| `admin@gth.com` | `admin123` | Administrador |
| `admin2@gth.com` | `admin123` | Administrador |
| `rrhh@gth.com` | `rrhh123` | Administrativo |

---

## Arquitectura del backend

```
public/index.php              → bootstrap + .env + CorsMiddleware + dispatch
                                + date_default_timezone_set(APP_TZ) ← NUEVO
routes/api.php                → 14 endpoints, AuthMiddleware por ruta
src/Core/                     → Router, Request, Response, Database, Jwt, Logger, Env
src/Controllers/              → Auth, Contratos, Documentos, Empleados, Plantillas, Time, Base
src/Engine/                   → motor DOCX (núcleo del negocio)
  ├─ DocumentEngine           → orquesta parser → resolver → generator → storage
  ├─ TemplateParser           → lee manifest.json + extrae variables del DOCX
  ├─ VariableResolver         → pipeline de resolvers por prioridad
  ├─ DocumentGenerator        → reemplaza MERGEFIELD y {{var}} en word/document.xml
  ├─ DocumentStorage          → genera rutas y guarda archivos
  ├─ Context/                 → ResolutionContext, ParsedTemplate
  ├─ Resolvers/               → 7 resolvers (TipoDoc, Formato, Empleado, Sede, Contrato, Ubicación)
  └─ Result/                  → GenerationResult, ResolutionResult
src/Models/                   → Documento, Empleado (DB), Usuario (hardcoded)
storage/                      → plantillas/*.docx + manifest.json, contratos/, logs/
database/migrations/          → 001_contratos (legacy), 002_documentos (activo), 003_empleados
database/seeds/               → 001_seed_empleados.sql (11 empleados demo)
```

---

## Rutas del backend

| Método | Ruta | Auth | Notas |
|---|---|---|---|
| POST | `/api/auth/login` | — | Devuelve JWT |
| GET | `/api/auth/me` | ✓ | |
| GET | `/api/time` | — | Hora autoritativa + sync externa |
| GET | `/api/templates` | ✓ | Lista 5 plantillas |
| GET | `/api/templates/{id}` | ✓ | |
| GET | `/api/templates/{id}/variables` | ✓ | **NUEVO** — vars detectadas + asignaciones manuales |
| PUT | `/api/templates/{id}/variables` | ✓ | **NUEVO** — body `{variables: {VAR: valor}}` |
| GET | `/api/documentos` | ✓ | Query `?tipo=contrato` |
| GET | `/api/documentos/{id}` | ✓ | |
| POST | `/api/documentos/{id}/preview` | ✓ | |
| GET | `/api/documentos/{id}/download` | ✓ | |
| POST | `/api/documentos/generate` | ✓ | Endpoint principal (respeta asignaciones manuales) |
| GET | `/api/contratos/*` | ✓ | LEGACY — duplica `/api/documentos/*` |
| GET | `/api/empleados` | ✓ | Query `?sede_id=1&estado=Activo` |
| GET | `/api/empleados/{id}` | ✓ | |
| POST | `/api/empleados` | ✓ | |
| PUT | `/api/empleados/{id}` | ✓ | |
| DELETE | `/api/empleados/{id}` | ✓ | |

**Migraciones ejecutadas:** `001_create_contratos.sql` (legacy), `002_create_documentos.sql`, `003_create_empleados.sql`, `004_create_template_variables.sql`
**Seed ejecutado:** `001_seed_empleados.sql` (11 empleados demo)

---

## Tiempo autoritativo (NUEVO)

El servidor es la única fuente de verdad para timestamps. Ningún cliente depende de su reloj local.

**Backend:**
- `APP_TZ=America/Bogota` (UTC-5) en `.env` → `date_default_timezone_set()` al arrancar
- `Database.php` ejecuta `SET time_zone = '-05:00'` (offset numérico — evita depender de tablas tz de MariaDB)
- `GET /api/time` devuelve `{ now, date, timezone, offset, unix, server_clock, external_sync }`
- **Bug fix crítico:** `Env::get()` tenía error de precedencia (`??` vs `!==`) que hacía que TODOS los envs leídos retornaran el default. Ahora busca `$_ENV` → `$_SERVER` → `getenv()` en orden.

**Sync externa (opcional):** al primer hit de `/api/time`, consulta `timeapi.io` y detecta drift del reloj del servidor. Loguea warning si drift > 5s.

**Frontend (`src/services/time.service.js`):**
- `getServerTime({ force })` con cache de 30s
- `now()`, `hasServerDrift()`, `formatServerDate()`, `formatServerDateTime()`

---

## Frontend: componentes clave

- **`Empleados.jsx`** — vista principal. KPI cards (4) + chips de filtros + tabla con 8 columnas:
  1. **Empleado** (frozen left) — foto + nombre + CC + tipo doc + edad + badge "Nuevo"
  2. **Cargo / Área** — cargo + chip área + nivel académico
  3. **Sede** — badge color hash + nombre
  4. **Ingreso / Antigüedad** — fecha + chip coloreado por años (slate→emerald→brand→violet)
  5. **Contrato** — Indefinido o cuenta regresiva (slate→amber→rose)
  6. **Email** — mono truncado
  7. **Estado** — chip con icono (Activo/Inactivo/Suspendido)
  8. **Acciones** (frozen right) — editar + ver perfil
  - Striped rows, hover suave, scroll horizontal, border-left rojo/amber según urgencia de contrato.

- **`EmpleadoDrawer.jsx`** — vista previa del empleado (1100×760 modal). Tabs: Resumen / Laboral / Expediente / Actividad. Sidebar 288px con avatar, mini-stats y línea de tiempo. Foto del sidebar clickable → abre `PhotoPreviewModal`.

- **`EmpleadoForm.jsx`** — modal crear/editar (1440×880). 4 secciones: Identidad / Nacimiento / Residencia y salud / Laboral. 7 popovers unificados (EPS, AFP, ARL, Caja, Cargo, Profesión, Sangre) con `EntityPopoverField` config-driven. LocationPicker para lugar expedición/nacimiento. Sidebar con preview en vivo del avatar.

- **`LocationPicker.jsx`** — stepper País→Depto→Ciudad. Toggle muestra `"Ciudad - Depto - País"`. Parsea el string guardado `"País - Ciudad - Depto"` para auto-seleccionar al editar.

- **`PhotoPreviewModal.jsx`** — modal reutilizable (sm/md/lg) para preview de fotos. Cierre con ESC o click fuera.

---

## Reglas y patrones importantes

```jsx
// Optional chaining mal aplicado
foo?.bar()      → seguro
foo?.bar()[0]   → PELIGRO ([0] sobre undefined → TypeError)
foo?.bar()?.[0] → seguro

// IIFE para objetos con valores computados
const stageSub = (() => {
  if (stage === 1) return '...'
  if (stage === 2) return cond ? `...` : ''
  return ''
})()

// Popovers sin X
<OverlayPanel ref={op} showCloseIcon={false}>

// Parsear fechas como LOCAL (no UTC) — backend devuelve 'YYYY-MM-DD'
new Date('2024-01-01')                                  → UTC midnight (¡mal!)
new Date(2024, 0, 1)                                    → LOCAL midnight (✓)
parseLocalDate('2024-01-01')                            → Date LOCAL
toLocalISODate(new Date())                              → 'YYYY-MM-DD' LOCAL
```

---

## Archivos importantes del frontend

| Archivo | Función |
|---|---|
| `src/services/api.js` | axios con `baseURL = VITE_API_URL`, interceptor Bearer + 401 logout |
| `src/services/empleados.service.js` | CRUD real (list/get/create/update/remove) — **USADO por /empleados y /contratos** |
| `src/services/documentEngine.service.js` | templates + documentos + **getTemplateVariables / setTemplateVariables** |
| `src/services/time.service.js` | getServerTime() con cache 30s |
| `src/services/mock.data.js` | Solo `SEDES` y `dashboardService` ya quedan aquí — el resto es basura para borrar |
| `src/utils/colombia.js` | datos enriquecidos (TIPOS_SANGRE, AFP, ARL, CAJA, EPS_COLOMBIA, PAISES) |
| `src/utils/programas.js` | `CARGOS_ENRIQUECIDOS` (1134), `PROGRAMAS_ENRIQUECIDOS` (~250), `classifyCargo()` |
| `src/utils/format.js` | formatDate, formatCurrency, avatarColor, parseLocalDate, calcAntiguedad, diasHasta, calcEdad, orDash, tipoDocLabel, formatTiempoRelativo |
| `src/components/PhotoPreviewModal.jsx` | modal reutilizable (sm/md/lg) para preview de fotos |
| `src/components/LocationPicker.jsx` | stepper ubicación + parsea string guardado |
| `src/components/EmpleadoDrawer.jsx` | vista previa (foto clickable → preview) |
| `src/components/EmpleadoForm.jsx` | crear/editar (parseLocalDate, toLocalISODate, buildDefaults) |
| `src/pages/Plantillas.jsx` | editor de variables manuales + lista de MERGEFIELDs |
| `src/pages/Contratos.jsx` | wizard 5 pasos con datos reales (empleados + backend) |
| `src/pages/Empleados.jsx` | tabla con 8 columnas, foto clickable, jerarquía visual |

---

## Schema `empleados` (NUEVO)

30 columnas: identidad, salud, contacto emergencia, laboral, auditoría. Migración `database/migrations/003_create_empleados.sql`. Seed `database/seeds/001_seed_empleados.sql` con 11 empleados demo.

Constraints clave:
- `UNIQUE KEY uk_identificacion_sede (sede_id, identificacion)` — previene duplicados por sede
- `KEY idx_nombre (nombres, apellidos)` — búsquedas
- `KEY idx_email` — búsquedas

Hydrate del model (`Empleado.php`): convierte snake_case → camelCase + agrega computados `nombre` (concat) y `sede` (lookup).

## Schema `template_variables` (NUEVO)

Tabla simple para asignaciones manuales por plantilla. Migración `004_create_template_variables.sql`.

```sql
CREATE TABLE template_variables (
  id INT UNSIGNED AUTO_INCREMENT,
  plantilla_id VARCHAR(100) NOT NULL,
  variable_name VARCHAR(150) NOT NULL,
  value TEXT NOT NULL,
  updated_by INT UNSIGNED NULL,
  updated_by_email VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_plantilla_var (plantilla_id, variable_name),
  KEY idx_plantilla (plantilla_id)
);
```

Usado por `TemplateAssignmentResolver` (prioridad 100). El valor guardado aquí gana sobre cualquier auto-resolución al generar un documento.

---

## Deploy en XAMPP — lo hecho

1. **Copia completa** del backend a `C:\xampp\htdocs\gth-api\` (incluye `vendor/`).
2. **Apache ya tiene** `mod_rewrite` + `AllowOverride All` → no requiere Alias.
3. **`.env` ajustado** en deploy (vía hardlink a `backend/.env`).
4. **CORS** ya permite `localhost:5173/5174/4173/3000` en `src/Core/Middleware/CorsMiddleware.php`.

**Hardlinks en `gth-api/`:** `index.php`, `.htaccess`, `.env`, `routes/`, `src/` son hardlinks desde `backend/public/` y `backend/`. Editar uno actualiza todos. Si querés independencia: `fsutil hardlink delete`.

**Para cPanel (futuro):**
- Subir `backend/` completo a una carpeta fuera de `public_html` (ej: `/home/user/api.gth/`)
- `npm run build` del frontend → subir `dist/` a `public_html/`
- Ajustar `APP_URL` y `VITE_API_URL` al dominio real
- Importar migraciones en cPanel → phpMyAdmin

---

## Trabajo pendiente

### Bugs latentes
- [ ] Encoding UTF-8 en otros archivos (Topbar, Sidebar, CommandPalette, mock.data.js)
- [ ] Validar rendimiento del modal con 7 popovers montados
- [ ] **INVESTIGAR:** `/api/auth/me` devuelve 404 en consola del navegador — la ruta SÍ existe en código y responde 401 directo. Probable cache de HMR o navegador.
- [ ] **VERIFICAR:** `Plantillas.jsx` puede crashear si el endpoint de variables falla (no hay try/catch separado del de templates)

### Mejoras futuras
- [ ] Virtual scroll en popover Cargo (1134 items)
- [ ] ESCO API real para Profesión/Cargo
- [ ] Búsqueda fuzzy en popovers
- [ ] Modal fullscreen tipo Linear/GitHub
- [ ] Migrar `Usuario` hardcoded → tabla `usuarios` con `password_hash()`
- [ ] Endpoint `POST /api/documentos/{id}/firmar` con firma criptográfica
- [ ] Conversión DOCX → PDF (LibreOffice headless)
- [ ] CRUD sedes (actualmente `SEDES` en `mock.data.js`)
- [ ] Eliminar rutas legacy `/api/contratos/*` y `MOCK_CONTRATOS` del frontend
- [ ] Migrar `dashboardService` de mocks a real (último mock del frontend)
- [ ] Borrar `src/services/empleadosService`, `contratosService`, `sedesService`, `empresasService` de `mock.data.js` — ya no se usan
- [ ] Tests con PHPUnit
- [ ] `src/Services/` y `src/Utils/` están vacíos (basura de refactor)

---

## Decisiones de diseño (no revertir sin discusión)

- **Backend timezone:** todo en America/Bogota (UTC-5). Servidor es autoridad. `SET time_zone = '-05:00'` para que `NOW()`/`CURRENT_TIMESTAMP` en MariaDB devuelvan hora local.
- **Frontend NO depende de su reloj local** para timestamps críticos. Llama `/api/time` si necesita precisión.
- 7 entidades (EPS, AFP, ARL, Caja, Sangre, Cargo, Profesión) usan el mismo patrón visual
- Searchable + autofocus en TODOS los popovers
- `classifyCargo()` es determinística por nombre — no requiere tabla de clasificación
- Backend en modo `APP_ENV=development` (permite mock tokens + dev fallback)
- Frontend usa axios con `baseURL` desde `.env`, sin proxy de Vite
- **Contratos guardan `tipo='contrato'`** en la tabla `documentos`, el subtipo (fijo/indefinido/prestacion) va en `metadata.contrato_tipo` como JSON
- **Empleados:** `nombre` y `sede` son computados por el model (no se guardan en BD), se generan al hidratar desde `nombres+apellidos` y `sede_id` respectivamente
- **Fechas:** el frontend siempre parsea strings `'YYYY-MM-DD'` como LOCAL (no UTC) usando `parseLocalDate()`. Al enviar al backend usa `toLocalISODate()` con componentes locales. Bug clásico: `new Date('2024-01-01')` se interpreta como UTC midnight → desfase en zonas negativas.

---

## Resumen de cambios recientes

### Sesión 1: Backend de empleados
- Migración `003_create_empleados.sql` (30 columnas)
- `Empleado.php` model con `find`, `all`, `allBySede`, `create`, `update`, `delete`, `countBySede`
- `EmpleadosController.php` con CRUD + validación (422/409/404)
- 5 rutas nuevas en `routes/api.php`
- Seed con 11 empleados demo

### Sesión 2: Frontend de empleados
- `empleados.service.js` (axios)
- `Empleados.jsx` con `loading`, `handleSave/handleUpdate` async, `stripForApi()`
- Drawer sin datos hardcoded (lee del empleado real)
- `PhotoPreviewModal` reutilizable

### Sesión 3: Jerarquía visual de tabla
- 8 columnas con celdas especializadas (`EmpleadoCell`, `CargoCell`, `SedeCell`, `IngresoCell`, `ContratoCell`, `EstadoCell`)
- Avatar 44px con dot de estado + badge "Nuevo"
- Chips con colores semánticos (antigüedad por años, urgencia de contrato)
- Frozen columns, striped rows, row accent border
- Helpers: `calcAntiguedad`, `diasHasta`, `calcEdad`, `formatTiempoRelativo`

### Sesión 4: Timezone autoritativo
- `TimeController` + `/api/time` con sync externa
- `APP_TZ` + `DB_TIMEZONE` + `SET time_zone` numérico
- **Bug fix crítico** en `Env::get` (precedencia de operadores)
- Frontend: `time.service.js` con cache 30s
- `formatDate`/`formatTiempoRelativo` parsean `'YYYY-MM-DD'` como LOCAL

### Sesión 5: Bug fixes de edición
- `toLocalISODate()` agregada (faltaba desde fix de timezones)
- `parseLocalDate()` en buildDefaults (evita desfase UTC en Calendar)
- `LocationPicker` parsea string `"País - Ciudad - Depto"` para auto-seleccionar al editar
- Removida `currentSede` de deps del reset para evitar re-renders mid-edit
- Typo `FotoPreviewModal` → `PhotoPreviewModal` en JSX

### Sesión 6: Bug en vista de Plantillas
**Síntoma:** `/api/templates` devolvía `total: 0` aunque había 5 DOCX en `storage/plantillas/`. La vista `/plantillas` salía vacía.

**Causa raíz:** `.env` tenía `TEMPLATES_PATH=storage/plantillas` (sin `/` al inicio), pero el código en `DocumentEngine::listTemplates()` concatenaba así:
```php
$manifestPath = dirname(__DIR__, 2) . Env::getString('TEMPLATES_PATH') . '/manifest.json';
// → C:\xampp\htdocs\gth-apistorage/plantillas/manifest.json ❌
// (falta el / entre root y storage)
```

**Fix:**
1. Restaurar el `/` inicial en `.env`: `TEMPLATES_PATH=/storage/plantillas` (también `STORAGE_PATH=/storage`, `CONTRACTS_PATH=/storage/contratos`).
2. Refactor de `DocumentEngine.php`: nueva helper privada `templatesRoot()` que normaliza el path con `ltrim()` y `DIRECTORY_SEPARATOR`. Acepta ambos formatos (con/sin `/`) para que no vuelva a pasar si alguien edita el `.env`.
3. Reemplazada la concatenación cruda en `listTemplates()` y `generate()` por `$this->templatesRoot()`.

**Verificación:**
```
GET /api/templates → { total: 5, templates: [...5 plantillas...] } ✓
GET /api/templates/uparsistem-inferior-1-ano → 13 vars detectadas ✓
```

**Lección:** nunca concatenes paths sin `DIRECTORY_SEPARATOR` y sin normalizar — siempre helper centralizada.

### Sesión 7: Editor de variables manuales por plantilla
**Motivación:** el usuario quiere editar valores por plantilla (ej: REPRESENTANTE_LEGAL, CIUDAD_EMPRESA) que persistan y tengan prioridad sobre la auto-resolución.

**Backend (PHP):**
- **Migración 004** — `template_variables (plantilla_id, variable_name, value, updated_by, updated_by_email)` con UNIQUE en `(plantilla_id, variable_name)`.
- **`PlantillaVariable.php`** — `getValue`, `getAll`, `setValue`, `setMany` (transaccional), `deleteValue`.
- **`TemplateAssignmentResolver.php`** — nuevo resolver con prioridad 100 (la más alta). Lee `template_id` activo de `$GLOBALS['__current_template_id__']`, cachea todas las asignaciones de la plantilla en una sola query.
- **`DocumentEngine::resolveWithTemplate()`** — wrapper que setea el global antes de resolver y limpia el cache en `try/finally`.
- **Endpoints:**
  - `GET /api/templates/{id}/variables` → `{ plantilla_id, variables: [{name, value, assigned, source}], total_detected, total_assigned }`
  - `PUT /api/templates/{id}/variables` con body `{variables: {VAR: valor}}` → reemplazo atómico

**Verificado end-to-end:**
```
1. Asignar NOMBRECOMPLETO="VALOR MANUAL" y TIPO_ID="Cédula de Ciudadanía"
2. Generar contrato con empleado "AUTO EMPLEADO"
3. BD: variables_json.NOMBRECOMPLETO = "VALOR MANUAL"   ✓ (manual ganó)
4. BD: variables_json.TIPO_ID = "Cédula de Ciudadanía"  ✓ (manual ganó)
5. Reemplazos: 26, Sin mapear: []
```

**Frontend:**
- `getTemplateVariables(id)` y `setTemplateVariables(id, map)` en `documentEngine.service.js`
- **`Plantillas.jsx`** rediseñado:
  - Al seleccionar plantilla: carga en paralelo `/templates/{id}` + `/templates/{id}/variables`
  - Cada variable detectada → InputText editable con badge **Auto** o **Manual**
  - Badge amber **Modificado** cuando hay cambios sin guardar
  - Botón ✕ para limpiar asignación individual
  - Contador en tiempo real: "X valores manuales que ganarán sobre el contexto del empleado/sede/contrato"
  - Botón **Guardar asignaciones** en PageHeader + secundario al pie del editor
  - Sección inferior con todos los MERGEFIELDs detectados como chips

### Sesión 8: Bug Login.jsx — prop `binary` shorthand
**Warning React:** `Received true for a non-boolean attribute binary`.

**Causa:** `<Checkbox binary />` shorthand pasa `binary={true}` al DOM. PrimeReact 10 ya usa binary mode por default en Checkbox; el prop era redundante y causaba warning.

**Fix:** quitado `binary` de `<Checkbox>` en `Login.jsx:222`. Sin cambio de comportamiento.

### Sesión 9: Anomalía `/api/auth/me` 404 en consola
**Síntoma:** `GET http://localhost/gth-api/api/auth/me 404 (Not Found)` aparecía en consola del navegador.

**Diagnóstico:** la ruta SÍ existe en `routes/api.php:15` y en deploy. Probada con `curl`: responde 401 (sin token), no 404. Era cache de HMR de Vite o cache del navegador.

**Resolución:** el usuario debe hacer `Ctrl+Shift+R` (hard reload) en el navegador.

### Sesión 10: Wizard /contratos usa datos reales
**Antes:** importaba `empleadosService` y `contratosService` de `mock.data.js`.

**Cambios:**
- `import { empleadosService } from '../services/empleados.service.js'` (el real)
- `buildContext()` actualizado para mapear campos del mock a los reales:
  ```js
  telefono: form.empleado.contactoTelefono || form.empleado.telefono
  correo:   form.empleado.email           || form.empleado.correo
  ```
- Fallback `||` mantiene compatibilidad con cualquier mock residual.

**Verificado end-to-end:**
```
1. GET /api/empleados?sede_id=1 → trae empleados reales de MySQL
2. Wizard completo genera documento #8 con 26 reemplazos, 0 sin mapear
3. BD muestra variables con datos reales del empleado #1 (dirección, salario formateado, etc)
```

`/contratos` ahora es 100% backend. Único mock restante: `dashboardService` en `/dashboard`.
