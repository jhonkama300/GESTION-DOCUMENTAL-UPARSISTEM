export const TIPOS_DOCUMENTO = [
  { label: 'Cédula de ciudadanía (CC)', value: 'CC' },
  { label: 'Cédula de extranjería (CE)', value: 'CE' },
  { label: 'Tarjeta de identidad (TI)', value: 'TI' },
  { label: 'Pasaporte (PAS)', value: 'PAS' },
  { label: 'NIT', value: 'NIT' },
  { label: 'Registro civil (RC)', value: 'RC' },
  { label: 'Permiso especial de permanencia (PEP)', value: 'PEP' },
]

export const EPS_COLOMBIA = [
  { label: 'Sanitas',                value: 'Sanitas',                regimen: 'Contributivo', region: 'Nacional',         estrellas: 5, cobertura: '5.7M' },
  { label: 'Sura',                   value: 'Sura',                   regimen: 'Contributivo', region: 'Nacional',         estrellas: 5, cobertura: '4.9M' },
  { label: 'Nueva EPS',              value: 'Nueva EPS',              regimen: 'Subsidiado',   region: 'Nacional',         estrellas: 3, cobertura: '4.1M' },
  { label: 'Compensar',              value: 'Compensar',              regimen: 'Contributivo', region: 'Bogotá · C/marca', estrellas: 4, cobertura: '2.8M' },
  { label: 'Famisanar',              value: 'Famisanar',              regimen: 'Contributivo', region: 'Bogotá · C/marca', estrellas: 4, cobertura: '2.5M' },
  { label: 'Salud Total',            value: 'Salud Total',            regimen: 'Contributivo', region: 'Nacional',         estrellas: 4, cobertura: '2.3M' },
  { label: 'Coomeva',                value: 'Coomeva',                regimen: 'Contributivo', region: 'Valle · Cauca',    estrellas: 3, cobertura: '2.0M' },
  { label: 'Medimás',                value: 'Medimás',                regimen: 'Subsidiado',   region: 'Nacional',         estrellas: 3, cobertura: '1.8M' },
  { label: 'SOS',                    value: 'SOS',                    regimen: 'Contributivo', region: 'Antioquia',        estrellas: 4, cobertura: '1.6M' },
  { label: 'Aliansalud',             value: 'Aliansalud',             regimen: 'Contributivo', region: 'Bogotá',           estrellas: 4, cobertura: '1.4M' },
  { label: 'Cafesalud',              value: 'Cafesalud',              regimen: 'Contributivo', region: 'Valle · Cauca',    estrellas: 1, cobertura: 'Liquidada' },
  { label: 'Comfenalco Antioquia',   value: 'Comfenalco Antioquia',   regimen: 'Subsidiado',   region: 'Antioquia',        estrellas: 3, cobertura: '1.1M' },
  { label: 'Comfandi',               value: 'Comfandi',               regimen: 'Subsidiado',   region: 'Valle del Cauca',   estrellas: 3, cobertura: '1.0M' },
  { label: 'Comfamiliar Atlantico',  value: 'Comfamiliar Atlantico',  regimen: 'Subsidiado',   region: 'Atlántico',         estrellas: 3, cobertura: '0.9M' },
  { label: 'Cajacopi',               value: 'Cajacopi',               regimen: 'Subsidiado',   region: 'Atlántico',         estrellas: 3, cobertura: '0.7M' },
  { label: 'Capital Salud',          value: 'Capital Salud',          regimen: 'Subsidiado',   region: 'Bogotá',           estrellas: 3, cobertura: '0.7M' },
  { label: 'Capresoca',              value: 'Capresoca',              regimen: 'Contributivo', region: 'Casanare',          estrellas: 3, cobertura: '0.4M' },
  { label: 'Savia Salud',            value: 'Savia Salud',            regimen: 'Subsidiado',   region: 'Antioquia',        estrellas: 3, cobertura: '0.5M' },
  { label: 'Comfachocó',             value: 'Comfachocó',             regimen: 'Subsidiado',   region: 'Chocó',             estrellas: 2, cobertura: '0.3M' },
  { label: 'Dusakawi',               value: 'Dusakawi',               regimen: 'Subsidiado',   region: 'La Guajira',       estrellas: 2, cobertura: '0.3M' },
  { label: 'Asmet Salud',            value: 'Asmet Salud',            regimen: 'Subsidiado',   region: 'Cauca',            estrellas: 2, cobertura: '0.4M' },
  { label: 'Ecoopsos',               value: 'Ecoopsos',               regimen: 'Subsidiado',   region: 'Nacional',         estrellas: 2, cobertura: '0.3M' },
  { label: 'Mallamas',               value: 'Mallamas',               regimen: 'Subsidiado',   region: 'Nariño',           estrellas: 2, cobertura: '0.3M' },
  { label: 'Pijaos Salud',           value: 'Pijaos Salud',           regimen: 'Subsidiado',   region: 'Tolima',           estrellas: 2, cobertura: '0.2M' },
  { label: 'Anas Wayuu',             value: 'Anas Wayuu',             regimen: 'Subsidiado',   region: 'La Guajira',       estrellas: 2, cobertura: '0.2M' },
  { label: 'Mutual Ser',             value: 'Mutual Ser',             regimen: 'Subsidiado',   region: 'Bolívar',          estrellas: 3, cobertura: '0.4M' },
  { label: 'Coosalud',               value: 'Coosalud',               regimen: 'Subsidiado',   region: 'Sucre',            estrellas: 3, cobertura: '0.5M' },
  { label: 'Cruz Blanca',            value: 'Cruz Blanca',            regimen: 'Subsidiado',   region: 'Nacional',         estrellas: 1, cobertura: 'Liquidada' },
  { label: 'Sanidad Militar',        value: 'Sanidad Militar',        regimen: 'Especial',     region: 'Nacional',         estrellas: 5, cobertura: 'Fuerzas Militares' },
  { label: 'Policía Nacional',       value: 'Policía Nacional',       regimen: 'Especial',     region: 'Nacional',         estrellas: 5, cobertura: 'Policía activa' },
  { label: 'Fondo de Prestaciones Sociales del Magisterio', value: 'Fondo de Prestaciones Sociales del Magisterio', regimen: 'Especial', region: 'Nacional', estrellas: 4, cobertura: 'Docentes' },
  { label: 'Universidad Nacional',   value: 'Universidad Nacional',   regimen: 'Especial',     region: 'Bogotá',           estrellas: 4, cobertura: 'Comunidad UNAL' },
]  

export const TIPOS_SANGRE = [
  { label: 'O-',  value: 'O-',  grupo: 'O',  rh: '-', frecuencia: '4%',   puedeDonarA: 'Todos',          puedeRecibirDe: 'O-' },
  { label: 'O+',  value: 'O+',  grupo: 'O',  rh: '+', frecuencia: '38%',  puedeDonarA: 'O+, A+, B+, AB+', puedeRecibirDe: 'O-, O+' },
  { label: 'A-',  value: 'A-',  grupo: 'A',  rh: '-', frecuencia: '3%',   puedeDonarA: 'A-, A+, AB-, AB+', puedeRecibirDe: 'O-, A-' },
  { label: 'A+',  value: 'A+',  grupo: 'A',  rh: '+', frecuencia: '27%',  puedeDonarA: 'A+, AB+',        puedeRecibirDe: 'O-, O+, A-, A+' },
  { label: 'B-',  value: 'B-',  grupo: 'B',  rh: '-', frecuencia: '1%',   puedeDonarA: 'B-, B+, AB-, AB+', puedeRecibirDe: 'O-, B-' },
  { label: 'B+',  value: 'B+',  grupo: 'B',  rh: '+', frecuencia: '10%',  puedeDonarA: 'B+, AB+',        puedeRecibirDe: 'O-, O+, B-, B+' },
  { label: 'AB-', value: 'AB-', grupo: 'AB', rh: '-', frecuencia: '0.5%', puedeDonarA: 'AB-, AB+',       puedeRecibirDe: 'O-, A-, B-, AB-' },
  { label: 'AB+', value: 'AB+', grupo: 'AB', rh: '+', frecuencia: '3.5%', puedeDonarA: 'AB+',            puedeRecibirDe: 'Todos' },
]  

export const PARENTESCOS = [
  'Madre', 'Padre', 'Esposo/a', 'Hijo/a', 'Hermano/a',
  'Tío/a', 'Abuelo/a', 'Sobrino/a', 'Primo/a', 'Amigo/a', 'Otro',
]

export const AFP_COLOMBIA = [
  { label: 'Porvenir',      value: 'Porvenir',      tipo: 'Privada', comision: '1.5%', fondoSolidaridad: '1.0%', patrimonio: '$ 78.4B', estrellas: 4 },
  { label: 'Protección',    value: 'Protección',    tipo: 'Privada', comision: '1.4%', fondoSolidaridad: '1.0%', patrimonio: '$ 64.2B', estrellas: 4 },
  { label: 'Colfondos',     value: 'Colfondos',     tipo: 'Privada', comision: '1.6%', fondoSolidaridad: '1.0%', patrimonio: '$ 32.1B', estrellas: 3 },
  { label: 'Skandia',       value: 'Skandia',       tipo: 'Privada', comision: '1.0%', fondoSolidaridad: '1.0%', patrimonio: '$ 18.7B', estrellas: 4 },
  { label: 'Old Mutual',    value: 'Old Mutual',    tipo: 'Privada', comision: '1.4%', fondoSolidaridad: '1.0%', patrimonio: '$  9.5B', estrellas: 3 },
  { label: 'Colpensiones',  value: 'Colpensiones',  tipo: 'Pública', comision: '0.5%', fondoSolidaridad: '0.0%', patrimonio: '$ 156.3B', estrellas: 4, publica: true },
]

export const ARL_COLOMBIA = [
  { label: 'Sura',         value: 'Sura',         riesgoCubierto: 'Todos los niveles',  estrellas: 5 },
  { label: 'Bolívar',      value: 'Bolívar',      riesgoCubierto: 'I–V',               estrellas: 4 },
  { label: 'Colpatria',    value: 'Colpatria',    riesgoCubierto: 'I–V',               estrellas: 4 },
  { label: 'Positiva',     value: 'Positiva',     riesgoCubierto: 'I–V',               estrellas: 4 },
  { label: 'Mapfre',       value: 'Mapfre',       riesgoCubierto: 'I–V',               estrellas: 4 },
  { label: 'Liberty',      value: 'Liberty',      riesgoCubierto: 'I–V',               estrellas: 3 },
  { label: 'La Equidad',   value: 'La Equidad',   riesgoCubierto: 'I–IV',              estrellas: 3 },
  { label: 'Alba',         value: 'Alba',         riesgoCubierto: 'I–III',             estrellas: 3 },
  { label: 'Aurora',       value: 'Aurora',       riesgoCubierto: 'I–IV',              estrellas: 2 },
]

export const CAJA_COMPENSACION_COLOMBIA = [
  { label: 'Compensar',         value: 'Compensar',         region: 'Bogotá, Cundinamarca',  cuota: '2.0%', servicios: ['Salud', 'Vivienda', 'Educación', 'Recreación'] },
  { label: 'Cafam',             value: 'Cafam',             region: 'Bogotá, Cundinamarca',  cuota: '2.0%', servicios: ['Salud', 'Vivienda', 'Educación', 'Recreación'] },
  { label: 'Colsubsidio',       value: 'Colsubsidio',       region: 'Bogotá, Cundinamarca',  cuota: '2.0%', servicios: ['Salud', 'Vivienda', 'Educación', 'Recreación'] },
  { label: 'Comfenalco Antioquia', value: 'Comfenalco Antioquia', region: 'Antioquia',        cuota: '2.0%', servicios: ['Salud', 'Vivienda', 'Educación', 'Recreación'] },
  { label: 'Comfama',           value: 'Comfama',           region: 'Antioquia',            cuota: '2.0%', servicios: ['Salud', 'Vivienda', 'Educación', 'Recreación'] },
  { label: 'Comfandi',          value: 'Comfandi',          region: 'Valle del Cauca',      cuota: '2.0%', servicios: ['Salud', 'Vivienda', 'Educación', 'Recreación'] },
  { label: 'Comfenalco Valle',  value: 'Comfenalco Valle',  region: 'Valle del Cauca',      cuota: '2.0%', servicios: ['Salud', 'Vivienda', 'Educación'] },
  { label: 'Comfamiliar Atlantico', value: 'Comfamiliar Atlantico', region: 'Atlántico',      cuota: '2.0%', servicios: ['Salud', 'Vivienda', 'Educación', 'Recreación'] },
  { label: 'Comfachocó',        value: 'Comfachocó',        region: 'Chocó',                cuota: '2.0%', servicios: ['Salud', 'Vivienda'] },
  { label: 'Comfacundi',        value: 'Comfacundi',        region: 'Cundinamarca',         cuota: '0.6%', servicios: ['Vivienda', 'Recreación'] },
  { label: 'Comfamiliar Huila', value: 'Comfamiliar Huila', region: 'Huila',                cuota: '2.0%', servicios: ['Salud', 'Vivienda'] },
  { label: 'Comfagiros',        value: 'Comfagiros',        region: 'Norte de Santander',   cuota: '2.0%', servicios: ['Salud', 'Vivienda'] },
]  

export const PAISES = [
  {
    code: 'CO',
    name: 'Colombia',
    flag: '🇨🇴',
    departamentos: [
      { code: 'AMA', name: 'Amazonas', ciudades: ['Leticia', 'Puerto Nariño'] },
      { code: 'ANT', name: 'Antioquia', ciudades: ['Medellín', 'Bello', 'Itagüí', 'Envigado', 'Apartadó', 'Turbo', 'Rionegro', 'Sabaneta'] },
      { code: 'ARA', name: 'Arauca', ciudades: ['Arauca', 'Arauquita', 'Saravena'] },
      { code: 'ATL', name: 'Atlántico', ciudades: ['Barranquilla', 'Soledad', 'Malambo', 'Sabanalarga', 'Puerto Colombia'] },
      { code: 'BOG', name: 'Bogotá D.C.', ciudades: ['Bogotá', 'Bosa', 'Kennedy', 'Suba', 'Engativá', 'Fontibón', 'Chapinero'] },
      { code: 'BOL', name: 'Bolívar', ciudades: ['Cartagena', 'Magangué', 'Turbaco', 'Arjona', 'El Carmen de Bolívar'] },
      { code: 'BOY', name: 'Boyacá', ciudades: ['Tunja', 'Sogamoso', 'Duitama', 'Chiquinquirá', 'Paipa'] },
      { code: 'CAL', name: 'Caldas', ciudades: ['Manizales', 'La Dorada', 'Chinchiná', 'Villamaría'] },
      { code: 'CAQ', name: 'Caquetá', ciudades: ['Florencia', 'San Vicente del Caguán'] },
      { code: 'CAS', name: 'Casanare', ciudades: ['Yopal', 'Aguazul', 'Villanueva'] },
      { code: 'CAU', name: 'Cauca', ciudades: ['Popayán', 'Santander de Quilichao', 'Puerto Tejada'] },
      { code: 'CES', name: 'Cesar', ciudades: ['Valledupar', 'Aguachica', 'Bosconia', 'La Jagua de Ibirico'] },
      { code: 'CHO', name: 'Chocó', ciudades: ['Quibdó', 'Istmina', 'Condoto'] },
      { code: 'COR', name: 'Córdoba', ciudades: ['Montería', 'Cereté', 'Sahagún', 'Lorica', 'Planeta Rica'] },
      { code: 'CUN', name: 'Cundinamarca', ciudades: ['Soacha', 'Girardot', 'Zipaquirá', 'Chía', 'Facatativá', 'Madrid', 'Mosquera', 'Funza', 'Cajicá'] },
      { code: 'GUA', name: 'Guainía', ciudades: ['Inírida'] },
      { code: 'GUV', name: 'Guaviare', ciudades: ['San José del Guaviare'] },
      { code: 'HUI', name: 'Huila', ciudades: ['Neiva', 'Pitalito', 'Garzón', 'La Plata'] },
      { code: 'LAG', name: 'La Guajira', ciudades: ['Riohacha', 'Maicao', 'Uribia', 'Manaure'] },
      { code: 'MAG', name: 'Magdalena', ciudades: ['Santa Marta', 'Ciénaga', 'Fundación', 'Plato'] },
      { code: 'MET', name: 'Meta', ciudades: ['Villavicencio', 'Acacías', 'Granada', 'Puerto López'] },
      { code: 'NAR', name: 'Nariño', ciudades: ['Pasto', 'Tumaco', 'Ipiales', 'Túquerres'] },
      { code: 'NSA', name: 'Norte de Santander', ciudades: ['Cúcuta', 'Ocaña', 'Pamplona', 'Villa del Rosario', 'Los Patios'] },
      { code: 'PUT', name: 'Putumayo', ciudades: ['Mocoa', 'Puerto Asís', 'Orito'] },
      { code: 'QUI', name: 'Quindío', ciudades: ['Armenia', 'Calarcá', 'La Tebaida', 'Montenegro'] },
      { code: 'RIS', name: 'Risaralda', ciudades: ['Pereira', 'Dosquebradas', 'Santa Rosa de Cabal', 'La Virginia'] },
      { code: 'SAP', name: 'San Andrés y Providencia', ciudades: ['San Andrés', 'Providencia'] },
      { code: 'SAN', name: 'Santander', ciudades: ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja', 'San Gil'] },
      { code: 'SUC', name: 'Sucre', ciudades: ['Sincelejo', 'Corozal', 'Sampués', 'Tolú'] },
      { code: 'TOL', name: 'Tolima', ciudades: ['Ibagué', 'Espinal', 'Melgar', 'Honda', 'Lérida'] },
      { code: 'VAC', name: 'Valle del Cauca', ciudades: ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Cartago', 'Buga', 'Jamundí', 'Yumbo'] },
      { code: 'VAU', name: 'Vaupés', ciudades: ['Mitú'] },
      { code: 'VIC', name: 'Vichada', ciudades: ['Puerto Carreño'] },
    ],
  },
  {
    code: 'VE',
    name: 'Venezuela',
    flag: '🇻🇪',
    departamentos: [
      { code: 'AMZ', name: 'Amazonas', ciudades: ['Puerto Ayacucho'] },
      { code: 'ANZ', name: 'Anzoátegui', ciudades: ['Barcelona', 'Puerto La Cruz', 'El Tigre'] },
      { code: 'APU', name: 'Apure', ciudades: ['San Fernando de Apure'] },
      { code: 'ARA', name: 'Aragua', ciudades: ['Maracay', 'Turmero'] },
      { code: 'BAR', name: 'Barinas', ciudades: ['Barinas'] },
      { code: 'BOL', name: 'Bolívar', ciudades: ['Ciudad Bolívar', 'Puerto Ordaz', 'Maturín'] },
      { code: 'CAR', name: 'Carabobo', ciudades: ['Valencia', 'Maracay', 'Puerto Cabello'] },
      { code: 'DCA', name: 'Distrito Capital', ciudades: ['Caracas'] },
      { code: 'FAL', name: 'Falcón', ciudades: ['Maracaibo', 'Punto Fijo'] },
      { code: 'LAR', name: 'Lara', ciudades: ['Barquisimeto'] },
      { code: 'MER', name: 'Mérida', ciudades: ['Mérida', 'El Vigía'] },
      { code: 'MIR', name: 'Miranda', ciudades: ['Los Teques', 'Guarenas', 'Guatire'] },
      { code: 'MON', name: 'Monagas', ciudades: ['Maturín'] },
      { code: 'NVA', name: 'Nueva Esparta', ciudades: ['Porlamar'] },
      { code: 'POR', name: 'Portuguesa', ciudades: ['Acarigua', 'Guanare'] },
      { code: 'SUC', name: 'Sucre', ciudades: ['Cumaná', 'Carúpano'] },
      { code: 'TAC', name: 'Táchira', ciudades: ['San Cristóbal', 'Rubio'] },
      { code: 'TRU', name: 'Trujillo', ciudades: ['Trujillo', 'Valera'] },
      { code: 'VAR', name: 'Vargas', ciudades: ['La Guaira'] },
      { code: 'YAR', name: 'Yaracuy', ciudades: ['San Felipe'] },
      { code: 'ZUL', name: 'Zulia', ciudades: ['Maracaibo', 'Cabimas', 'Mara'] },
    ],
  },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', departamentos: [
    { code: 'AZU', name: 'Azuay', ciudades: ['Cuenca'] },
    { code: 'BOL', name: 'Bolívar', ciudades: ['Guaranda'] },
    { code: 'CAR', name: 'Carchi', ciudades: ['Tulcán'] },
    { code: 'CHI', name: 'Chimborazo', ciudades: ['Riobamba'] },
    { code: 'COT', name: 'Cotopaxi', ciudades: ['Latacunga'] },
    { code: 'EOR', name: 'El Oro', ciudades: ['Machala'] },
    { code: 'ESM', name: 'Esmeraldas', ciudades: ['Esmeraldas'] },
    { code: 'GUA', name: 'Guayas', ciudades: ['Guayaquil'] },
    { code: 'IMB', name: 'Imbabura', ciudades: ['Ibarra'] },
    { code: 'LOJ', name: 'Loja', ciudades: ['Loja'] },
    { code: 'LRI', name: 'Los Ríos', ciudades: ['Babahoyo', 'Quevedo'] },
    { code: 'MAN', name: 'Manabí', ciudades: ['Portoviejo', 'Manta'] },
    { code: 'NAP', name: 'Napo', ciudades: ['Tena'] },
    { code: 'PAS', name: 'Pastaza', ciudades: ['Puyo'] },
    { code: 'PIC', name: 'Pichincha', ciudades: ['Quito'] },
    { code: 'TUN', name: 'Tungurahua', ciudades: ['Ambato'] },
    { code: 'ZCH', name: 'Zamora Chinchipe', ciudades: ['Zamora'] },
  ] },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', departamentos: [
    { code: 'AMA', name: 'Amazonas', ciudades: ['Chachapoyas'] },
    { code: 'ANC', name: 'Áncash', ciudades: ['Huaraz'] },
    { code: 'APU', name: 'Apurímac', ciudades: ['Abancay'] },
    { code: 'ARE', name: 'Arequipa', ciudades: ['Arequipa'] },
    { code: 'AYA', name: 'Ayacucho', ciudades: ['Ayacucho'] },
    { code: 'CAJ', name: 'Cajamarca', ciudades: ['Cajamarca'] },
    { code: 'CAL', name: 'Callao', ciudades: ['Callao'] },
    { code: 'CUS', name: 'Cusco', ciudades: ['Cusco'] },
    { code: 'HUC', name: 'Huancavelica', ciudades: ['Huancavelica'] },
    { code: 'HUN', name: 'Huánuco', ciudades: ['Huánuco'] },
    { code: 'ICA', name: 'Ica', ciudades: ['Ica'] },
    { code: 'JUN', name: 'Junín', ciudades: ['Huancayo'] },
    { code: 'LAL', name: 'La Libertad', ciudades: ['Trujillo'] },
    { code: 'LAM', name: 'Lambayeque', ciudades: ['Chiclayo'] },
    { code: 'LIM', name: 'Lima', ciudades: ['Lima', 'Callao', 'Ate', 'San Isidro', 'Miraflores'] },
    { code: 'LOR', name: 'Loreto', ciudades: ['Iquitos'] },
    { code: 'MDD', name: 'Madre de Dios', ciudades: ['Puerto Maldonado'] },
    { code: 'MOQ', name: 'Moquegua', ciudades: ['Moquegua'] },
    { code: 'PAS', name: 'Pasco', ciudades: ['Cerro de Pasco'] },
    { code: 'PIU', name: 'Piura', ciudades: ['Piura', 'Sullana', 'Talara'] },
    { code: 'PUN', name: 'Puno', ciudades: ['Puno', 'Juliaca'] },
    { code: 'SAM', name: 'San Martín', ciudades: ['Moyobamba', 'Tarapoto'] },
    { code: 'TAC', name: 'Tacna', ciudades: ['Tacna'] },
    { code: 'TUM', name: 'Tumbes', ciudades: ['Tumbes'] },
    { code: 'UCA', name: 'Ucayali', ciudades: ['Pucallpa'] },
  ] },
  { code: 'MX', name: 'México', flag: '🇲🇽', departamentos: [
    { code: 'CMX', name: 'Ciudad de México', ciudades: ['Ciudad de México'] },
    { code: 'JAL', name: 'Jalisco', ciudades: ['Guadalajara'] },
    { code: 'NLE', name: 'Nuevo León', ciudades: ['Monterrey'] },
    { code: 'PUE', name: 'Puebla', ciudades: ['Puebla'] },
    { code: 'YUC', name: 'Yucatán', ciudades: ['Mérida'] },
  ] },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', departamentos: [
    { code: 'BUE', name: 'Buenos Aires', ciudades: ['Buenos Aires', 'La Plata', 'Mar del Plata'] },
    { code: 'COR', name: 'Córdoba', ciudades: ['Córdoba'] },
    { code: 'MEN', name: 'Mendoza', ciudades: ['Mendoza'] },
  ] },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸', departamentos: [
    { code: 'CA', name: 'California', ciudades: ['Los Angeles', 'San Francisco', 'San Diego'] },
    { code: 'NY', name: 'Nueva York', ciudades: ['Nueva York', 'Buffalo'] },
    { code: 'FL', name: 'Florida', ciudades: ['Miami', 'Orlando', 'Tampa'] },
    { code: 'TX', name: 'Texas', ciudades: ['Houston', 'Dallas', 'Austin'] },
  ] },
  { code: 'ES', name: 'España', flag: '🇪🇸', departamentos: [
    { code: 'MAD', name: 'Madrid', ciudades: ['Madrid'] },
    { code: 'CAT', name: 'Cataluña', ciudades: ['Barcelona'] },
    { code: 'AND', name: 'Andalucía', ciudades: ['Sevilla', 'Málaga', 'Granada'] },
    { code: 'VAL', name: 'Valencia', ciudades: ['Valencia'] },
  ] },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷', departamentos: [
    { code: 'SP', name: 'São Paulo', ciudades: ['São Paulo'] },
    { code: 'RJ', name: 'Río de Janeiro', ciudades: ['Río de Janeiro'] },
  ] },
]

export const CARGOS = [
  'Director General', 'Director de Área', 'Gerente', 'Subgerente',
  'Coordinador', 'Jefe de Equipo', 'Analista Senior', 'Analista Junior',
  'Desarrollador Senior', 'Desarrollador Junior', 'Diseñador UX/UI',
  'Diseñador Gráfico', 'Contador', 'Auxiliar Contable',
  'Profesional RRHH', 'Analista de Selección', 'Psicólogo',
  'Docente', 'Profesor', 'Asistente Administrativo', 'Recepcionista',
  'Practicante', 'Auxiliar', 'Conductor', 'Mensajero', 'Servicios Generales',
]

export const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return null
  const hoy = new Date()
  const fn = new Date(fechaNacimiento)
  let años = hoy.getFullYear() - fn.getFullYear()
  let meses = hoy.getMonth() - fn.getMonth()
  let dias = hoy.getDate() - fn.getDate()

  if (dias < 0) {
    meses--
    const ultimoDiaMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate()
    dias += ultimoDiaMesAnterior
  }
  if (meses < 0) {
    años--
    meses += 12
  }

  return { años, meses, dias }
}

export const formatEdad = (fechaNacimiento) => {
  const e = calcularEdad(fechaNacimiento)
  if (!e) return ''
  const parts = []
  if (e.años > 0) parts.push(`${e.años} año${e.años !== 1 ? 's' : ''}`)
  if (e.meses > 0) parts.push(`${e.meses} mes${e.meses !== 1 ? 'es' : ''}`)
  if (e.dias > 0 || parts.length === 0) parts.push(`${e.dias} día${e.dias !== 1 ? 's' : ''}`)
  return parts.join(', ')
}

export const calcularDuracion = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) return null
  const inicio = new Date(fechaInicio)
  const fin = new Date(fechaFin)
  if (fin < inicio) return null

  let años = fin.getFullYear() - inicio.getFullYear()
  let meses = fin.getMonth() - inicio.getMonth()
  let dias = fin.getDate() - inicio.getDate()

  if (dias < 0) {
    meses--
    const ultimoDiaMesAnterior = new Date(fin.getFullYear(), fin.getMonth(), 0).getDate()
    dias += ultimoDiaMesAnterior
  }
  if (meses < 0) {
    años--
    meses += 12
  }

  return { años, meses, dias }
}

export const formatDuracion = (fechaInicio, fechaFin) => {
  const d = calcularDuracion(fechaInicio, fechaFin)
  if (!d) return ''
  const parts = []
  if (d.años > 0) parts.push(`${d.años} año${d.años !== 1 ? 's' : ''}`)
  if (d.meses > 0) parts.push(`${d.meses} mes${d.meses !== 1 ? 'es' : ''}`)
  if (d.dias > 0 || parts.length === 0) parts.push(`${d.dias} día${d.dias !== 1 ? 's' : ''}`)
  return parts.join(', ')
}

export const getPaisByCode = (code) => PAISES.find((p) => p.code === code)
export const getDeptoByCode = (paisCode, deptoCode) => {
  const pais = getPaisByCode(paisCode)
  return pais?.departamentos.find((d) => d.code === deptoCode)
}
