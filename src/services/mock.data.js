const MOCK_EMPLEADOS = [
  // Sede 1: Uparsistem Bogotá
  { id: 1, sedeId: 1, cedula: '1234567890', nombre: 'Laura Pérez', cargo: 'Desarrolladora Senior', area: 'Tecnología', sede: 'Bogotá', estado: 'Activo', fechaIngreso: '2022-03-15', direccion: 'Calle 100 #15-20, Bogotá D.C.', telefono: '+57 301 555 1234', correo: 'laura.perez@uparsistem.com', fechaNacimiento: '1995-03-15', lugarNacimiento: 'Bogotá D.C.', lugarExpedicion: 'Bogotá D.C.' },
  { id: 2, sedeId: 1, cedula: '9876543210', nombre: 'Carlos Méndez', cargo: 'Diseñador UX', area: 'Producto', sede: 'Bogotá', estado: 'Activo', fechaIngreso: '2023-01-10', direccion: 'Carrera 7 #45-30, Bogotá D.C.', telefono: '+57 302 555 2345', correo: 'carlos.mendez@uparsistem.com', fechaNacimiento: '1992-07-22', lugarNacimiento: 'Medellín', lugarExpedicion: 'Bogotá D.C.' },
  { id: 3, sedeId: 1, cedula: '1122334455', nombre: 'Ana Rodríguez', cargo: 'Analista RRHH', area: 'Talento Humano', sede: 'Bogotá', estado: 'Activo', fechaIngreso: '2021-07-22', direccion: 'Calle 72 #10-34, Bogotá D.C.', telefono: '+57 303 555 3456', correo: 'ana.rodriguez@uparsistem.com', fechaNacimiento: '1988-11-30', lugarNacimiento: 'Cali', lugarExpedicion: 'Bogotá D.C.' },
  { id: 4, sedeId: 1, cedula: '5566778899', nombre: 'Diego Ramírez', cargo: 'Contador', area: 'Financiera', sede: 'Bogotá', estado: 'Activo', fechaIngreso: '2020-11-05', direccion: 'Avenida 19 #120-30, Bogotá D.C.', telefono: '+57 304 555 4567', correo: 'diego.ramirez@uparsistem.com', fechaNacimiento: '1985-05-10', lugarNacimiento: 'Bogotá D.C.', lugarExpedicion: 'Bogotá D.C.' },
  { id: 5, sedeId: 1, cedula: '6677889900', nombre: 'Sofía Castro', cargo: 'Practicante', area: 'Marketing', sede: 'Bogotá', estado: 'Inactivo', fechaIngreso: '2024-08-01', direccion: 'Calle 45 #8-12, Bogotá D.C.', telefono: '+57 305 555 5678', correo: 'sofia.castro@uparsistem.com', fechaNacimiento: '2000-02-14', lugarNacimiento: 'Bogotá D.C.', lugarExpedicion: 'Bogotá D.C.' },
  { id: 6, sedeId: 1, cedula: '7788990011', nombre: 'Andrés López', cargo: 'Project Manager', area: 'Operaciones', sede: 'Bogotá', estado: 'Activo', fechaIngreso: '2022-09-12', direccion: 'Carrera 15 #93-50, Bogotá D.C.', telefono: '+57 306 555 6789', correo: 'andres.lopez@uparsistem.com', fechaNacimiento: '1990-08-25', lugarNacimiento: 'Barranquilla', lugarExpedicion: 'Bogotá D.C.' },

  // Sede 1: Uparsistem Medellín
  { id: 7, sedeId: 1, cedula: '2233445566', nombre: 'María Salazar', cargo: 'Coordinadora Académica', area: 'Talento Humano', sede: 'Medellín', estado: 'Activo', fechaIngreso: '2021-03-10', direccion: 'Calle 10 #36-20, Medellín', telefono: '+57 304 555 7890', correo: 'maria.salazar@uparsistem.com', fechaNacimiento: '1987-04-18', lugarNacimiento: 'Medellín', lugarExpedicion: 'Medellín' },
  { id: 8, sedeId: 1, cedula: '3344556677', nombre: 'Jorge Herrera', cargo: 'Docente', area: 'Operaciones', sede: 'Medellín', estado: 'Activo', fechaIngreso: '2022-06-15', direccion: 'Carrera 50 #54-18, Medellín', telefono: '+57 305 555 8901', correo: 'jorge.herrera@uparsistem.com', fechaNacimiento: '1983-12-05', lugarNacimiento: 'Bucaramanga', lugarExpedicion: 'Medellín' },

  // Sede 2: Jeanpiaget Bogotá
  { id: 9, sedeId: 2, cedula: '4455667788', nombre: 'Pedro Gómez', cargo: 'Director Académico', area: 'Operaciones', sede: 'Bogotá', estado: 'Activo', fechaIngreso: '2018-02-01', direccion: 'Calle 134 #7-83, Bogotá D.C.', telefono: '+57 307 555 9012', correo: 'pedro.gomez@jeanpiaget.edu.co', fechaNacimiento: '1975-09-15', lugarNacimiento: 'Bogotá D.C.', lugarExpedicion: 'Bogotá D.C.' },
  { id: 10, sedeId: 2, cedula: '5566778890', nombre: 'Camila Torres', cargo: 'Psicóloga', area: 'Talento Humano', sede: 'Bogotá', estado: 'Activo', fechaIngreso: '2020-08-12', direccion: 'Carrera 19 #134-50, Bogotá D.C.', telefono: '+57 308 555 0123', correo: 'camila.torres@jeanpiaget.edu.co', fechaNacimiento: '1991-06-20', lugarNacimiento: 'Bogotá D.C.', lugarExpedicion: 'Bogotá D.C.' },
  { id: 11, sedeId: 2, cedula: '6677889901', nombre: 'Roberto Silva', cargo: 'Profesor', area: 'Operaciones', sede: 'Bogotá', estado: 'Activo', fechaIngreso: '2019-04-20', direccion: 'Calle 80 #8-23, Bogotá D.C.', telefono: '+57 309 555 1234', correo: 'roberto.silva@jeanpiaget.edu.co', fechaNacimiento: '1980-03-08', lugarNacimiento: 'Tunja', lugarExpedicion: 'Bogotá D.C.' },
]

const MOCK_CONTRATOS = [
  { id: 1, sedeId: 1, empleado: 'Laura Pérez', tipo: 'Término indefinido', inicio: '2022-03-15', fin: '—', estado: 'Vigente' },
  { id: 2, sedeId: 1, empleado: 'Carlos Méndez', tipo: 'Prestación de servicios', inicio: '2024-01-01', fin: '2024-12-31', estado: 'Por vencer' },
  { id: 3, sedeId: 1, empleado: 'Ana Rodríguez', tipo: 'Término indefinido', inicio: '2021-07-22', fin: '—', estado: 'Vigente' },
  { id: 4, sedeId: 1, empleado: 'María Salazar', tipo: 'Término indefinido', inicio: '2021-03-10', fin: '—', estado: 'Vigente' },
  { id: 5, sedeId: 2, empleado: 'Pedro Gómez', tipo: 'Término indefinido', inicio: '2018-02-01', fin: '—', estado: 'Vigente' },
  { id: 6, sedeId: 2, empleado: 'Camila Torres', tipo: 'Término fijo', inicio: '2024-02-01', fin: '2025-02-01', estado: 'Vigente' },
]

export const SEDES = [
  {
    id: 1,
    nombre: 'Uparsistem',
    descripcion: 'Empresa de tecnología y soluciones empresariales',
    iniciales: 'UP',
    color: '#A8CF45',
    direccion: 'Calle 100 #15-20, Bogotá D.C.',
    telefono: '+57 601 555 1000',
    email: 'contacto@uparsistem.com',
    ciudades: ['Bogotá', 'Medellín'],
    empleados: 65,
    contratos: 58,
    usuarios: 12,
    estado: 'Activa',
    fechaRegistro: '2021-03-15',
    nit: '900.123.456-1',
    representante: 'Carlos Ramírez',
  },
  {
    id: 2,
    nombre: 'Jeanpiaget',
    descripcion: 'Institución educativa con presencia nacional',
    iniciales: 'JP',
    color: '#10b981',
    direccion: 'Carrera 7 #40-50, Bogotá D.C.',
    telefono: '+57 601 555 2000',
    email: 'info@jeanpiaget.edu.co',
    ciudades: ['Bogotá', 'Cali', 'Barranquilla'],
    empleados: 120,
    contratos: 105,
    usuarios: 18,
    estado: 'Activa',
    fechaRegistro: '2019-08-20',
    nit: '900.234.567-2',
    representante: 'María Salazar',
  },
]

const delay = (data, ms = 400) =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms))

export const empleadosService = {
  list: (sedeId) => delay(MOCK_EMPLEADOS.filter((e) => e.sedeId === sedeId)),
  get: (id, sedeId) => delay(MOCK_EMPLEADOS.find((e) => e.id === id && e.sedeId === sedeId)),
}

export const contratosService = {
  list: (sedeId) => delay(MOCK_CONTRATOS.filter((c) => c.sedeId === sedeId)),
}

export const sedesService = {
  list: () => delay([...SEDES]),
  get: (id) => delay(SEDES.find((s) => s.id === id)),
}

export const empresasService = {
  list: () => delay([...SEDES]),
}

export const dashboardService = {
  kpis: (sedeId) => {
    const empActivos = MOCK_EMPLEADOS.filter((e) => e.sedeId === sedeId && e.estado === 'Activo').length
    return delay({
      empleadosActivos: empActivos,
      contratosVigentes: MOCK_CONTRATOS.filter((c) => c.sedeId === sedeId && c.estado === 'Vigente').length,
      certificaciones: 134,
      documentos: 1240,
      proximosVencer: 6,
    })
  },
  actividad: () =>
    delay([
      { id: 1, usuario: 'Ana Rodríguez', accion: 'subió contrato de Carlos Méndez', fecha: '2025-11-12 10:24' },
      { id: 2, usuario: 'Carlos Méndez', accion: 'firmó documento de certificación', fecha: '2025-11-12 09:51' },
      { id: 3, usuario: 'Laura Pérez', accion: 'actualizó su perfil', fecha: '2025-11-11 17:02' },
      { id: 4, usuario: 'Admin', accion: 'creó plantilla de contrato', fecha: '2025-11-11 14:10' },
      { id: 5, usuario: 'Diego Ramírez', accion: 'firmó certificación SOAT', fecha: '2025-11-11 11:45' },
      { id: 6, usuario: 'Sofía Castro', accion: 'subió hoja de vida', fecha: '2025-11-10 16:20' },
      { id: 7, usuario: 'Andrés López', accion: 'asignó horario a equipo', fecha: '2025-11-10 12:08' },
    ]),
  charts: (sedeId) =>
    delay({
      empleadosPorArea: [
        { area: 'Tecnología', total: Math.max(2, Math.floor(empPorSede(sedeId) * 0.3)) },
        { area: 'Operaciones', total: Math.max(1, Math.floor(empPorSede(sedeId) * 0.25)) },
        { area: 'Talento Humano', total: Math.max(1, Math.floor(empPorSede(sedeId) * 0.12)) },
        { area: 'Financiera', total: Math.max(1, Math.floor(empPorSede(sedeId) * 0.15)) },
        { area: 'Comercial', total: Math.max(1, Math.floor(empPorSede(sedeId) * 0.1)) },
        { area: 'Marketing', total: Math.max(1, Math.floor(empPorSede(sedeId) * 0.08)) },
      ],
      contratosPorMes: [
        { mes: 'Jun', generados: 4, firmados: 4 },
        { mes: 'Jul', generados: 6, firmados: 5 },
        { mes: 'Ago', generados: 8, firmados: 7 },
        { mes: 'Sep', generados: 5, firmados: 5 },
        { mes: 'Oct', generados: 9, firmados: 8 },
        { mes: 'Nov', generados: 11, firmados: 10 },
      ],
      distribucionSedes: [
        { sede: 'Bogotá', total: MOCK_EMPLEADOS.filter((e) => e.sedeId === sedeId && e.sede === 'Bogotá').length },
        { sede: 'Medellín', total: MOCK_EMPLEADOS.filter((e) => e.sedeId === sedeId && e.sede === 'Medellín').length },
        { sede: 'Cali', total: MOCK_EMPLEADOS.filter((e) => e.sedeId === sedeId && e.sede === 'Cali').length },
      ],
    }),
}

function empPorSede(sedeId) {
  return MOCK_EMPLEADOS.filter((e) => e.sedeId === sedeId).length
}
