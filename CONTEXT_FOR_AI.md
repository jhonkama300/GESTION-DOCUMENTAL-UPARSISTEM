# Contexto del Proyecto GTH — Gestión Documental de Talento Humano

> **Documento de contexto para IAs (ChatGPT, Claude, etc.).** Léelo completo antes de sugerir cambios, código o arquitectura. Contiene el estado real, las decisiones tomadas y los siguientes pasos del proyecto.

---

## 1. Identidad del Proyecto

| Atributo | Valor |
|---|---|
| **Nombre** | GTH · Sistema de Gestión Documental de Talento Humano |
| **Versión** | 0.2.0 (frontend completo con mock data) |
| **Sprint activo** | Sprint 5 — Firma electrónica |
| **Progreso global** | ~50% (Frontend 100% · Backend 0% · BD 0%) |
| **Tipo** | Frontend SPA con datos mock, preparado para integrarse a backend |
| **Organizaciones destino** | Uparsistem (verde `#A8CF45`), Jean Piaget (rosa), CEA (multi-sede) |
| **Repositorio** | Git con rama `main` · 1 commit inicial · 12 archivos modificados + 6 untracked sin commitear |

---

## 2. Stack Tecnológico (DEFINITIVO, no cambiar)

### Frontend
- **React 19.2.7** + **react-dom 19.2.7**
- **Vite 8.1.1** (bundler) + **@vitejs/plugin-react 6.0.3**
- **react-router-dom 7.18.1** (rutas SPA)
- **PrimeReact 10.9.8** + **primeicons 8.0.0** (componentes UI)
- **TailwindCSS 3.4.19** + PostCSS + Autoprefixer (utility-first CSS)
- **react-hook-form 7.82.0** (formularios)
- **axios 1.18.1** (cliente HTTP, ya configurado pero NO usado todavía)
- **chart.js 4.5.1** + **react-chartjs-2 5.3.1** (gráficos)
- **oxlint 1.71.0** (linter ultrarrápido)

### Lenguaje
- **JavaScript / JSX** (NO TypeScript, aunque hay `@types/react` instalados pero sin uso)

### Backend (PENDIENTE — según plan)
- **PHP 8** con arquitectura MVC
- **MySQL** como base de datos
- **JWT** para autenticación
- **Composer** para dependencias PHP
- **OpenSSL** para firma criptográfica

### Scripts disponibles (npm/pnpm)
- `dev` → `vite` (servidor desarrollo)
- `build` → `vite build`
- `preview` → `vite preview`
- `lint` → `oxlint`

---

## 3. Arquitectura de la Aplicación

### Patrón general
- **SPA** con **Context API** (sin Redux/Zustand)
- **Service Layer** con mocks (`setTimeout` simulando latencia) listo para sustituirse por llamadas HTTP reales
- **Multi-tenant multi-sede** con tema dinámico por sede
- **Multi-rol** con filtrado de menú y rutas protegidas

### Flujo de autenticación y multi-sede
1. `Login.jsx` valida contra `MOCK_USERS` en `AuthContext`
2. Se guarda `{ id, email, name, role, sedes[], token }` en `localStorage['gth_auth']`
3. Si el usuario tiene varias sedes, redirige a `/seleccionar-sede`
4. `SedeContext` aplica el tema CSS dinámico (variables `--brand-50` a `--brand-900`)
5. Las páginas filtran datos por `currentSede.id`

### Jerarquía de providers (en `main.jsx`)
```
PrimeReactProvider → ThemeProvider → AuthProvider → SedeProvider → App
```

### Guards de ruta
- `ProtectedRoute` (en `routes/`) → valida autenticación y roles
- `RequireSede` (en `App.jsx`) → exige sede seleccionada
- `MainLayout` y `AuthLayout` envuelven grupos de rutas

---

## 4. Estructura Completa del Proyecto

```
D:\UPARSISTEM\GESTION DOCUMENTAL\
│
├── DOCS PROYECTO/                              # Documentación del proyecto
│   ├── ESTADO_PROYECTO.md                      # ⭐ Estado de sprints y avance
│   ├── Plan_Proyecto_Gestion_Documental_Talento_Humano.md
│   ├── Documentacion_Gestion_Documental_TH.zip
│   ├── Documentacion_Gestion_Documental_TH/    # 12 docs markdown (3-13 líneas c/u)
│   │   ├── README.md
│   │   ├── 01-Vision-del-Proyecto.md
│   │   ├── 02-Requerimientos-Funcionales.md
│   │   ├── 03-Arquitectura.md
│   │   ├── 04-Base-de-Datos.md
│   │   ├── 05-API-REST.md
│   │   ├── 06-Diseno-UI-UX.md
│   │   ├── 07-Roles-y-Permisos.md
│   │   ├── 08-Modulo-Contratos.md
│   │   ├── 09-Firma-Electronica.md
│   │   ├── 10-Gestion-Documental.md
│   │   ├── 11-Plan-de-Desarrollo.md
│   │   └── 12-Manual-Tecnico.md
│   └── CONTRATOS/                              # 5 plantillas DOCX reales
│       ├── CEA/        (1 archivo)
│       ├── JEAN PIAGET/ (2 archivos)
│       └── UPARSISTEM/ (2 archivos)
│
└── frontend/                                   # ⭐ TODA la app vive aquí
    ├── .env.example                            # VITE_API_URL=http://localhost:8000/api
    ├── .oxlintrc.json
    ├── index.html
    ├── package.json
    ├── pnpm-lock.yaml / package-lock.json      # ⚠️ ambos existen, unificar
    ├── postcss.config.js
    ├── tailwind.config.js                      # tema brand verde Uparsistem
    ├── vite.config.js
    ├── public/                                 # favicon.svg, icons.svg
    ├── dist/                                   # build de producción (1.34MB JS, 246KB CSS)
    └── src/
        ├── main.jsx                            # entrada React + providers
        ├── App.jsx                             # router + RequireSede
        ├── index.css                           # estilos globales + tema
        ├── assets/                             # hero.png, vite.svg
        ├── components/                         # 13 componentes reutilizables
        │   ├── Breadcrumbs.jsx
        │   ├── CommandPalette.jsx              # ⌘K paleta de comandos (21 acciones)
        │   ├── EmpleadoDrawer.jsx              # perfil con tabs
        │   ├── EmpleadoForm.jsx                # ⭐ 897 líneas, react-hook-form
        │   ├── EmptyState.jsx
        │   ├── KpiCard.jsx
        │   ├── LocationPicker.jsx              # País/Depto/Ciudad Colombia
        │   ├── NotificationsPanel.jsx
        │   ├── PageHeader.jsx
        │   ├── SedeSwitcher.jsx
        │   ├── Sidebar.jsx                     # menú lateral con filtrado por rol
        │   ├── SignatureDialog.jsx             # OTP + canvas + hash
        │   ├── Skeleton.jsx
        │   └── Topbar.jsx
        ├── context/                            # 3 contextos React
        │   ├── AuthContext.jsx                 # login/logout/persistencia
        │   ├── SedeContext.jsx                 # sede activa + tema dinámico
        │   └── ThemeContext.jsx                # dark/light mode
        ├── layouts/
        │   ├── AuthLayout.jsx
        │   └── MainLayout.jsx                  # sidebar + topbar + outlet
        ├── pages/                              # 17 páginas implementadas
        │   ├── Auditoria.jsx                   # log de eventos
        │   ├── Ayuda.jsx                       # FAQs + atajos + contacto
        │   ├── Certificaciones.jsx
        │   ├── Configuracion.jsx               # 4 secciones
        │   ├── Contratos.jsx                   # wizard 4 pasos + tabla
        │   ├── Dashboard.jsx                   # KPIs + 3 gráficos
        │   ├── Documentos.jsx                  # carpetas + drag&drop + versiones
        │   ├── Empleados.jsx                   # DataTable + filtros + drawer
        │   ├── Horarios.jsx
        │   ├── Login.jsx                       # 4 cuentas demo de un click
        │   ├── NotFound.jsx                    # 404
        │   ├── Notificaciones.jsx
        │   ├── Perfil.jsx                      # 4 tabs
        │   ├── Plantillas.jsx
        │   ├── Reportes.jsx                    # 3 gráficos
        │   ├── Sedes.jsx                       # cards + tabla
        │   ├── SedeSelector.jsx                # post-login
        │   └── Usuarios.jsx                    # DataTable
        ├── routes/
        │   └── ProtectedRoute.jsx              # guard con roles
        ├── services/
        │   ├── api.js                          # ⭐ axios + interceptores (listo pero no usado)
        │   ├── auth.service.js                 # ROLES + hasRole
        │   ├── esco.service.js                 # API pública UE ESCO + fallback
        │   └── mock.data.js                    # 5 servicios mock con datos
        └── utils/
            ├── colombia.js                     # tipos doc, EPS, deptos/ciudades
            ├── format.js                       # formatDate, formatCurrency, initials
            ├── primeLocale.js                  # locale 'es' para PrimeReact
            ├── programas.js                    # 870 líneas: CARGOS, AREAS, PROGRAMAS
            ├── styles.js                       # clases CSS reutilizables
            └── theme.js                        # paletas por sede + CSS variables
```

---

## 5. Rutas y Permisos

| Ruta | Página | Roles permitidos |
|---|---|---|
| `/login` | Login | público |
| `/seleccionar-sede` | SedeSelector | autenticado |
| `/dashboard` | Dashboard | autenticado + sede |
| `/empleados` | Empleados | autenticado + sede |
| `/contratos` | Contratos | autenticado + sede |
| `/plantillas` | Plantillas | autenticado + sede |
| `/documentos` | Documentos | autenticado + sede |
| `/certificaciones` | Certificaciones | autenticado + sede |
| `/horarios` | Horarios | autenticado + sede |
| `/sedes` | Sedes | autenticado + sede |
| `/usuarios` | Usuarios | Administrador, RRHH |
| `/reportes` | Reportes | Administrador, RRHH |
| `/auditoria` | Auditoria | Administrador |
| `/configuracion` | Configuracion | Administrador |
| `/notificaciones` | Notificaciones | autenticado + sede |
| `/perfil` | Perfil | autenticado + sede |
| `/ayuda` | Ayuda | autenticado + sede |
| `*` | NotFound | público |

**Roles definidos**: `Administrador`, `RRHH`, `Supervisor`, `Empleado`, `Administrativo` (en `auth.service.js`).

---

## 6. Funcionalidades Implementadas

1. ✅ Login con autenticación simulada + 4 cuentas demo de un click
2. ✅ Multi-sede con tema dinámico (CSS variables)
3. ✅ Multi-rol con filtrado de menú y rutas
4. ✅ Dashboard con 5 KPIs + 3 gráficos Chart.js
5. ✅ CRUD de empleados (formulario gigante con 17+ campos + validación + transferencia entre sedes)
6. ✅ Wizard de contratos de 4 pasos con variables `{{...}}` y preview en vivo
7. ✅ Generación de PDF simulada con hash SHA-256
8. ✅ Firma electrónica con OTP (6 dígitos) + canvas + hash (3 pasos)
9. ✅ Gestión documental: carpetas + drag&drop + versionamiento + restaurar
10. ✅ Notificaciones con panel emergente y página completa
11. ✅ Auditoría con log filtrable (LOGIN, CREATE, UPDATE, SIGN, DELETE, UPLOAD, LOGIN_FAILED)
12. ✅ Reportes con 3 gráficos + filtros de período
13. ✅ Configuración con 4 secciones (empresa, notificaciones, seguridad, apariencia)
14. ✅ Perfil con 4 tabs (info, seguridad, notificaciones, actividad)
15. ✅ Ayuda con FAQs + 8 atajos de teclado + formulario de contacto
16. ✅ Command Palette (⌘K) con 21 acciones navegables
17. ✅ Dark mode completo
18. ✅ Breadcrumbs dinámicos
19. ✅ Sedes con cards y tabla
20. ✅ Horarios con grid semanal
21. ✅ Certificaciones con stats y tabla
22. ✅ Integración con API pública ESCO (UE) con fallback a catálogo local
23. ✅ Selector de ubicación Colombia completo (país/depto/ciudad)
24. ✅ Skeletons de carga

---

## 7. Convenciones y Patrones del Proyecto

### Sistema de diseño
- **Color brand principal**: `#A8CF45` (verde Uparsistem) con paleta 50-900
- **Tipografía**: Inter (Google Fonts) con preload
- **Animaciones personalizadas**: `fade-in`, `slide-in-right`, `pulse-slow`, `blob`, `shimmer`
- **Iconos**: `pi pi-*` (PrimeIcons)
- **CSS variables**: `--brand-50` a `--brand-900` definidos en `:root` y sobreescritos dinámicamente por sede

### Patrones aplicados
- **Context API** (Provider/Consumer) → `AuthContext`, `SedeContext`, `ThemeContext`
- **Layout pattern** → `MainLayout`, `AuthLayout`
- **Protected Route** → `ProtectedRoute`, `RequireSede`
- **Forward Ref + Imperative API** → `CommandPalette`, `SignatureDialog` con `useImperativeHandle`
- **Service Layer (mock)** → 5 servicios en `mock.data.js` con `setTimeout` simulando latencia
- **Wizard/Stepper** → `Contratos.jsx` con `Steps` de PrimeReact
- **Compound Components** → `TabView/TabPanel`, `Steps` de PrimeReact
- **CSS Variables dinámico** → `utils/theme.js` con `applyThemeToDocument` y `resetThemeToDocument`
- **DRY con clases reutilizables** → `utils/styles.js` + `@layer components` en `index.css`
- **Command Pattern** → `CommandPalette.jsx` con 21 acciones

### Estructura de un servicio mock (patrón)
```js
// services/mock.data.js
export const empleadosService = {
  async getAll(sedeId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_EMPLEADOS.filter(e => e.sedeId === sedeId));
      }, 300);
    });
  },
  async getById(id) { /* ... */ },
  async create(data) { /* ... */ },
  async update(id, data) { /* ... */ },
  async delete(id) { /* ... */ }
};
```

---

## 8. Decisiones Tomadas (NO cambiar sin discutir)

1. **JavaScript, no TypeScript** (aunque haya tipos instalados)
2. **PrimeReact como librería UI principal** (no Material UI, no Ant Design)
3. **TailwindCSS + PrimeReact** combinados (no uno u otro)
4. **Context API, no Redux/Zustand**
5. **Mocks con `setTimeout`**, NO `localStorage` ni IndexedDB
6. **localStorage** para persistencia de auth/sede/tema
7. **PHP 8 + MySQL** como backend (NO Node.js, NO PostgreSQL)
8. **JWT** para autenticación
9. **Vite** como bundler (NO Webpack, NO Next.js)
10. **pnpm** preferido (aunque coexisten `pnpm-lock.yaml` y `package-lock.json`)
11. **CSS variables** para temas dinámicos por sede
12. **Mock data** vive en `src/services/mock.data.js`, NO disperso por componentes

---

## 9. Problemas Conocidos (a resolver)

1. ⚠️ **Backend inexistente** — toda la "funcionalidad" es simulada
2. ⚠️ **Credenciales hardcodeadas** en `AuthContext.jsx` (`admin123`, `rrhh123`, `super123`, `emp123`)
3. ⚠️ **Token JWT falso**: `token: 'mock-jwt-' + Math.random().toString(36).slice(2)`
4. ⚠️ **12 archivos modificados + 6 untracked** sin commitear
5. ⚠️ **Solo 1 commit** en toda la historia
6. ⚠️ **Sin tests** (unitarios, integración, e2e)
7. ⚠️ **Documentación muy superficial** (3-13 líneas por archivo en `Documentacion_Gestion_Documental_TH/`)
8. ⚠️ **Sin README principal** del proyecto
9. ⚠️ **`pnpm-lock.yaml` y `package-lock.json` simultáneos**
10. ⚠️ **Import muerto** en `api.js` (`useAuth` no usado)
11. ⚠️ Sin manejo robusto de errores en operaciones mock
12. ⚠️ Sin PropTypes ni TypeScript para validación de props
13. ⚠️ Comandos "vacíos" en CommandPalette (`/toggle-theme`, `/logout` no son rutas reales)

---

## 10. Sprints y Roadmap

### Sprints completados (Frontend)
- **Sprint 1**: Setup inicial, login, multi-rol
- **Sprint 2**: Dashboard con KPIs y gráficos
- **Sprint 3**: CRUD de empleados
- **Sprint 4**: Wizard de contratos + plantillas
- **Sprint 5**: Firma electrónica
- **Sprint 6**: Gestión documental
- **Sprint 7**: Sedes + horarios + certificaciones
- **Sprint 8**: Auditoría + reportes + configuración

### Extras agregados
- Command Palette (⌘K)
- Dark mode
- Breadcrumbs dinámicos
- Notificaciones
- Animaciones

### Sprints pendientes (Backend)
- **Sprint 9**: Schema MySQL (16 tablas según plan)
- **Sprint 10**: Backend PHP MVC + JWT + Composer
- **Sprint 11**: Conectar `AuthContext` real
- **Sprint 12**: Subida de archivos + storage
- **Sprint 13**: Firma criptográfica con OpenSSL
- **Sprint 14**: Integración end-to-end + tests + deploy

---

## 11. Plan de Implementación del Backend (según docs)

### Arquitectura objetivo
```
React Frontend → API REST (JSON) → PHP 8 (MVC) → MySQL → Storage
```

### Stack backend
- **PHP 8** con patrón MVC
- **MySQL** como BD relacional
- **JWT** para autenticación stateless
- **Composer** para gestión de dependencias
- **OpenSSL** para firma criptográfica
- Almacenamiento: filesystem (DOCX/PDF/firmas)

### Tablas MySQL planificadas (16)
`usuarios`, `roles`, `permisos`, `empleados`, `sedes`, `areas`, `cargos`, `contratos`, `plantillas`, `firmas`, `documentos`, `certificaciones`, `horarios`, `auditoria`, `notificaciones`, `sesiones`

### Endpoints API principales
- `POST /api/login` → devuelve JWT
- `GET /api/empleados?sede=X` → lista filtrada
- `POST /api/contratos` → crea contrato desde plantilla
- `POST /api/firmas` → registra firma con hash
- `GET /api/documentos?empleado=X` → expediente digital
- `GET /api/sedes` → lista de sedes
- `POST /api/upload` → subida de archivos
- `GET /api/reportes/...` → datos para gráficos

### Flujo de Contratos (10 pasos)
1. Crear plantilla DOCX con variables `{{nombre}}`, `{{cargo}}`, etc.
2. Definir variables en el sistema
3. Seleccionar empleado
4. Generar contrato (reemplazo de variables)
5. Convertir DOCX → PDF
6. Enviar enlace al empleado
7. Validar OTP (6 dígitos)
8. Firmar (canvas + hash criptográfico)
9. Generar evidencia (PDF firmado + metadata)
10. Guardar en expediente del empleado

---

## 12. Variables de Entorno

### Frontend (`.env.example`)
```
VITE_API_URL=http://localhost:8000/api
```

### Backend (planificadas, aún no creadas)
```
DB_HOST=localhost
DB_NAME=gth_uparsistem
DB_USER=...
DB_PASS=...
JWT_SECRET=...
JWT_EXPIRES=3600
STORAGE_PATH=/var/gth/storage
```

---

## 13. Cuentas Demo (en `AuthContext.jsx`)

| Email | Contraseña | Rol | Sedes |
|---|---|---|---|
| `admin@uparsistem.com` | `admin123` | Administrador | Uparsistem, Jean Piaget |
| `rrhh@uparsistem.com` | `rrhh123` | RRHH | Uparsistem |
| `supervisor@jeanpiaget.edu.co` | `super123` | Supervisor | Jean Piaget |
| `empleado@uparsistem.com` | `emp123` | Empleado | Uparsistem |

---

## 14. Convenciones de Commits Sugeridas

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formato (sin cambio de lógica)
refactor: refactorización
test: añadir tests
chore: tareas de mantenimiento
```

Estructura: `tipo(alcance): descripción breve`

---

## 15. Instrucciones para la IA

Cuando me ayudes con este proyecto:

1. **Lee este archivo completo** antes de sugerir cambios.
2. **Respeta el stack definido** (no sugieras React Query si no está en el plan).
3. **No cambies el framework UI** (PrimeReact está consolidado).
4. **Mantén los mocks hasta que el backend esté listo**.
5. **Sigue los patrones existentes** (Service Layer con `setTimeout`, Context API, etc.).
6. **Si sugieres cambios grandes, justifica** por qué y cómo impactan el plan.
7. **No añadas dependencias pesadas** sin justificar (ej. Moment.js, Lodash).
8. **El frontend debe seguir funcionando con mocks** aunque se implemente el backend progresivamente.
9. **Respeta la multi-sede y multi-rol** en cualquier nueva feature.
10. **Si vas a tocar varios archivos**, lista primero cuáles y por qué.

---

**Última actualización**: 2026-07-25
**Mantenedor**: Equipo GTH Uparsistem
**Estado**: Frontend completo, backend pendiente
