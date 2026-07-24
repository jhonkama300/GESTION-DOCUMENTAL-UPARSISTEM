# Estado del Proyecto — GTH
**Última actualización:** 2026-07-23
**Versión actual:** 0.2.0 (Frontend completo con mock data)
**Sprint activo:** Sprint 5 — Firma electrónica ✅

---

## Resumen ejecutivo

| Fase | Estado | Progreso |
|------|--------|----------|
| Arquitectura del proyecto | ✅ Completo | 100% |
| UI/UX Frontend | ✅ Completo | 100% |
| Backend PHP API | 🔴 No iniciado | 0% |
| Base de datos MySQL | 🔴 No iniciado | 0% |
| Integración API ↔ Frontend | 🔴 No iniciado | 0% |

**Progreso general del proyecto: ~50%**

El frontend está **100% completo** con todos los módulos, flujos y diseño pulido. Solo falta el backend PHP, la base de datos MySQL y conectar todo.

---

## Páginas implementadas (17)

| Página | Ruta | Estado |
|--------|------|--------|
| Login | `/login` | ✅ |
| Dashboard | `/dashboard` | ✅ |
| Empleados | `/empleados` | ✅ |
| Contratos | `/contratos` | ✅ |
| Plantillas | `/plantillas` | ✅ |
| Firma electrónica | `/firma` | ✅ |
| Documentos | `/documentos` | ✅ |
| Certificaciones | `/certificaciones` | ✅ |
| Horarios | `/horarios` | ✅ |
| Sedes | `/sedes` | ✅ |
| Usuarios | `/usuarios` | ✅ |
| Reportes | `/reportes` | ✅ |
| Auditoría | `/auditoria` | ✅ |
| Configuración | `/configuracion` | ✅ |
| Notificaciones | `/notificaciones` | ✅ |
| Mi perfil | `/perfil` | ✅ |
| Ayuda | `/ayuda` | ✅ |

---

## Detalle por sprint

### ✅ Sprint 1 — Arquitectura, UI/UX, Base de datos (100%)
- ✅ Estructura del proyecto (`frontend/`, futura `backend/`)
- ✅ Stack: React 19 + Vite 8 + Tailwind + PrimeReact 10
- ✅ Estructura de carpetas según plan
- ✅ Sistema de diseño (brand `#A8CF45`, dark mode, jerarquía)
- ✅ Routing + AuthContext + ProtectedRoute
- ⏳ Schema MySQL (pendiente)

### ✅ Sprint 2 — Login, Roles, Usuarios (100% Frontend)
- ✅ Login con paleta verde, sombras, jerarquía, demo accounts
- ✅ Filtrado del sidebar por rol
- ✅ Página de Usuarios con tabla + stats + avatares
- ⏳ Backend real con JWT

### ✅ Sprint 3 — Dashboard, Empleados (100% Frontend)
- ✅ Dashboard con 5 KPIs, gráficos Chart.js
- ✅ Empleados con DataTable + filtros + drawer con tabs + form con validación
- ⏳ CRUD real contra backend

### ✅ Sprint 4 — Contratos y plantillas (100% Frontend)
- ✅ Wizard 4 pasos
- ✅ Editor de variables con preview en vivo
- ✅ Pantalla de éxito con hash SHA-256
- ⏳ Generación real DOCX/PDF

### ✅ Sprint 5 — Firma electrónica (100% Frontend)
- ✅ Lista de documentos pendientes
- ✅ Flujo completo: OTP (InputOtp de PrimeReact) → Canvas de firma → Hash SHA-256 → Confirmación
- ✅ Stepper visual de 4 pasos
- ✅ Historial de documentos firmados
- ⏳ Backend con envío real de OTP

### ✅ Sprint 6 — Gestión documental (100% Frontend)
- ✅ Carpetas + archivos con drag & drop para upload
- ✅ Vista grid/list
- ✅ Preview con info y versiones
- ✅ Versionamiento con opción restaurar
- ⏳ Backend de upload + storage

### ✅ Sprint 7 — Horarios, Certificaciones, Sedes (100% Frontend)
- ✅ Horarios con grid semanal por empleado
- ✅ Certificaciones con stats y tabla
- ✅ Sedes con cards y tabla

### ✅ Sprint 8 — Reportes, Auditoría, Optimización (100% Frontend)
- ✅ Reportes con 3 gráficos (ingresos/retiros, tendencia, distribución)
- ✅ Auditoría con log filtrable
- ✅ Configuración con secciones (empresa, notificaciones, seguridad, apariencia)
- ✅ Notificaciones con dropdown + página completa
- ✅ Mi perfil con tabs (info, seguridad, notificaciones, actividad)
- ✅ Ayuda con FAQs + atajos + contacto

### ✅ Extras
- ✅ Command Palette (⌘K)
- ✅ Dark mode
- ✅ Breadcrumbs dinámicos
- ✅ Notificaciones con badge
- ✅ Animaciones (fade-in, blob, shimmer)

---

## Stack final del Frontend

```
React 19 + Vite 8 + React Router 7
TailwindCSS 3 + PrimeReact 10 (lara-light-green)
Chart.js 4 + react-chartjs-2
react-hook-form
PrimeReact InputOtp, Calendar, Password, etc.
```

**Bundle:** ~1.24 MB (355 KB gzip) — incluye todas las páginas

---

## Próximos pasos (Backend)

1. **Schema MySQL** — 16 tablas con relaciones e índices
2. **Backend PHP** — estructura MVC + JWT + Composer
3. **Endpoints REST** — `/login`, `/empleados`, `/contratos`, `/firmas`
4. **Conectar AuthContext real** — reemplazar mock
5. **Subida de archivos** — storage + URL firmada
6. **Firma criptográfica real** — OpenSSL para hash + PDF firmado

---

## Métricas finales

- **Páginas (pages/):** 17
- **Componentes (components/):** 13
- **Contextos (context/):** 2
- **Servicios (services/):** 3
- **Líneas (estimado):** ~6.000
- **Rutas protegidas:** 16
- **Acciones en Command Palette:** 20+
