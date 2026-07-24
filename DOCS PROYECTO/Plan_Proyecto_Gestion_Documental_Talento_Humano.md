# Sistema de Gestión Documental de Talento Humano

## Objetivo

Desarrollar una plataforma web moderna para administrar empleados,
contratos, documentos, certificaciones, horarios y sedes, incorporando
firma electrónica y auditoría.

## Stack Tecnológico

-   Frontend: React + Vite
-   UI: TailwindCSS + PrimeReact
-   Backend: PHP 8 (API REST)
-   Base de datos: MySQL
-   Autenticación: JWT
-   Dependencias: Composer

## Arquitectura

``` text
React
   │
API REST (JSON)
   │
PHP
   │
MySQL
   │
Storage (PDF, DOCX, imágenes)
```

## Módulos

1.  Login y autenticación
2.  Dashboard
3.  Usuarios, roles y permisos
4.  Empleados
5.  Áreas, cargos y sedes
6.  Contratos
7.  Plantillas dinámicas DOCX
8.  Firma electrónica (OTP + evidencia)
9.  Gestión documental
10. Certificaciones
11. Horarios
12. Reportes
13. Auditoría
14. Configuración

## Flujo de Contratos

1.  Crear plantilla DOCX.
2.  Definir variables ({{nombre}}, {{cedula}}, etc.).
3.  Seleccionar empleado.
4.  Generar contrato.
5.  Convertir a PDF.
6.  Enviar enlace de firma.
7.  Validar OTP.
8.  Firmar.
9.  Generar evidencia.
10. Guardar en expediente.

## Dashboard

-   Empleados activos
-   Contratos
-   Certificaciones
-   Documentos
-   Próximos vencimientos
-   Actividad reciente

## Expediente del empleado

-   Información general
-   Contratos
-   Documentos
-   Certificaciones
-   Horarios
-   Historial

## Base de datos

-   usuarios
-   roles
-   permisos
-   empleados
-   areas
-   cargos
-   sedes
-   contratos
-   plantillas
-   firmas
-   documentos
-   certificaciones
-   horarios
-   auditoria
-   notificaciones
-   configuracion

## Estructura Frontend

``` text
src/
  components/
  pages/
  layouts/
  routes/
  services/
  hooks/
  context/
  utils/
  assets/
```

## Estructura Backend

``` text
app/
  Controllers/
  Models/
  Services/
  Repositories/
  Middleware/
  Routes/
  Helpers/
  Core/
storage/
public/
vendor/
```

## Roadmap

### Sprint 1

-   Arquitectura
-   UI/UX
-   Base de datos

### Sprint 2

-   Login
-   Roles
-   Usuarios

### Sprint 3

-   Dashboard
-   Empleados

### Sprint 4

-   Contratos y plantillas

### Sprint 5

-   Firma electrónica

### Sprint 6

-   Gestión documental

### Sprint 7

-   Horarios
-   Certificaciones
-   Sedes

### Sprint 8

-   Reportes
-   Auditoría
-   Optimización

## Objetivo final

Crear un software comercial, modular y escalable con apariencia
empresarial, preparado para crecer con módulos como vacaciones,
incapacidades, nómina y evaluaciones de desempeño.
