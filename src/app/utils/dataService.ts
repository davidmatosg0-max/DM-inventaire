/**
 * Servicio centralizado de datos para el Sistema de Banco de Alimentos
 * Maneja todas las operaciones CRUD con localStorage
 */

// ==================== TIPOS DE DATOS ====================

export type TipoAsistencia = 'alimentario' | 'higiene' | 'mixto';
export type Frecuencia = 'semanal' | 'quincenal' | 'mensual' | 'eventual';
export type EstadoComanda = 'pendiente' | 'preparada' | 'entregada' | 'cancelada';
export type EstadoTransporte = 'planificado' | 'en_ruta' | 'entregado' | 'cancelado';
export type TipoVehiculo = 'furgoneta' | 'camion' | 'refrigerado';

export interface Organismo {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
  telefono: string;
  email: string;
  responsable: string;
  tipoAsistencia: TipoAsistencia;
  frecuencia: Frecuencia;
  numeroPersonasAtendidas: number;
  activo: boolean;
  regular: boolean;
  latitud?: number;
  longitud?: number;
  observaciones?: string;
  fechaRegistro: string;
  ultimaComanda?: string;
}

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  subcategoria?: string;
  unidad: string;
  icono: string;
  peso: number;
  stockActual: number;
  stockMinimo: number;
  ubicacion: string;
  lote: string;
  fechaVencimiento: string;
  esPRS: boolean;
  activo: boolean;
  fechaCreacion: string;
  esVariante?: boolean;
  productoBaseId?: string;
  productoBaseNombre?: string;
  valorMonetario?: number;
  valorUnitario?: number; // Valor monetario por unidad en CAD$
  valorTotal?: number; // Valor monetario total en CAD$ (valorUnitario × stockActual)
  factorConversionCaja?: number; // Cuántas cajas hay en una paleta
  factorConversionUnidad?: number; // Cuántas unidades hay en una caja
  factorConversionSaco?: number; // Cuántas unidades hay en un saco
}

export interface Comanda {
  id: string;
  numero: string;
  organismoId: string;
  organismoNombre: string;
  fecha: string;
  fechaEntrega?: string;
  estado: EstadoComanda;
  productos: ComandaProducto[];
  observaciones?: string;
  creadoPor: string;
  totalValorMonetario: number;
  transporteAsignado?: string;
}

export interface ComandaProducto {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  unidad: string;
  valorMonetario: number;
  icono?: string;
}

export interface Vehiculo {
  id: string;
  matricula: string;
  tipo: TipoVehiculo;
  capacidadKg: number;
  capacidadM3: number;
  estado: 'disponible' | 'en_ruta' | 'mantenimiento';
  activo: boolean;
  observaciones?: string;
}

export interface Ruta {
  id: string;
  fecha: string;
  vehiculoId: string;
  vehiculoMatricula: string;
  conductorId: string;
  conductorNombre: string;
  estado: EstadoTransporte;
  comandas: string[]; // IDs de comandas
  organismos: OrganismoRuta[];
  observaciones?: string;
  horaSalida?: string;
  horaRegreso?: string;
  kmInicio?: number;
  kmFin?: number;
}

export interface OrganismoRuta {
  organismoId: string;
  organismoNombre: string;
  direccion: string;
  orden: number;
  horaEstimada?: string;
  horaReal?: string;
  estado: 'pendiente' | 'entregado' | 'no_entregado';
  observaciones?: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: string;
  permisos: string[];
  activo: boolean;
  fechaCreacion: string;
  ultimoAcceso?: string;
}

export interface IDDigital {
  id: string;
  organismoId: string;
  organismoNombre: string;
  claveAcceso: string;
  qrCode: string;
  fechaCreacion: string;
  fechaExpiracion?: string;
  activo: boolean;
  ultimoAcceso?: string;
}

export interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  valorMonetario: number;
  color: string;
  icono: string;
  subcategorias: Subcategoria[];
  activa: boolean;
}

export interface Subcategoria {
  id: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  cantidad?: number;
  peso?: number;
  pesoUnitario?: number;
  unidad?: string;
  unidadesPermitidas?: string[];
  activa: boolean;
  stockMinimo?: number;
}

export interface EntradaInventario {
  id: string;
  fecha: string;
  tipo: 'achat' | 'don' | 'cpn' | 'otro';
  proveedor?: string;
  productos: EntradaProducto[];
  observaciones?: string;
  creadoPor: string;
  valorTotal: number;
}

export interface EntradaProducto {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  unidad: string;
  lote?: string;
  fechaVencimiento?: string;
  valorMonetario: number;
}

// ==================== KEYS DE LOCALSTORAGE ====================

const KEYS = {
  ORGANISMOS: 'banco_alimentos_organismos',
  PRODUCTOS: 'banco_alimentos_productos',
  COMANDAS: 'banco_alimentos_comandas',
  VEHICULOS: 'banco_alimentos_vehiculos',
  RUTAS: 'banco_alimentos_rutas',
  USUARIOS: 'banco_alimentos_usuarios',
  ID_DIGITAL: 'banco_alimentos_id_digital',
  CATEGORIAS: 'banco_alimentos_categorias',
  ENTRADAS: 'banco_alimentos_entradas',
  CONFIGURACION: 'banco_alimentos_configuracion',
};

// ==================== FUNCIONES GENERICAS ====================

function obtenerDatos<T>(key: string, valorPorDefecto: T[] = []): T[] {
  try {
    const datos = localStorage.getItem(key);
    return datos ? JSON.parse(datos) : valorPorDefecto;
  } catch (error) {
    console.error(`Error al obtener ${key}:`, error);
    return valorPorDefecto;
  }
}

function guardarDatos<T>(key: string, datos: T[]): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(datos));
    return true;
  } catch (error) {
    console.error(`Error al guardar ${key}:`, error);
    return false;
  }
}

// ==================== ORGANISMOS ====================

export function obtenerOrganismos(): Organismo[] {
  return obtenerDatos<Organismo>(KEYS.ORGANISMOS);
}

export function guardarOrganismo(organismo: Organismo): boolean {
  const organismos = obtenerOrganismos();
  organismos.push(organismo);
  return guardarDatos(KEYS.ORGANISMOS, organismos);
}

export function actualizarOrganismo(id: string, datos: Partial<Organismo>): boolean {
  const organismos = obtenerOrganismos();
  const index = organismos.findIndex(o => o.id === id);
  if (index !== -1) {
    organismos[index] = { ...organismos[index], ...datos };
    return guardarDatos(KEYS.ORGANISMOS, organismos);
  }
  return false;
}

export function eliminarOrganismo(id: string): boolean {
  const organismos = obtenerOrganismos();
  const filtrados = organismos.filter(o => o.id !== id);
  return guardarDatos(KEYS.ORGANISMOS, filtrados);
}

export function obtenerOrganismosActivos(): Organismo[] {
  return obtenerOrganismos().filter(o => o.activo);
}

export function obtenerOrganismosRegulares(): Organismo[] {
  return obtenerOrganismos().filter(o => o.activo && o.regular);
}

// ==================== COMANDAS ====================

export function obtenerComandas(): Comanda[] {
  return obtenerDatos<Comanda>(KEYS.COMANDAS);
}

export function guardarComanda(comanda: Comanda): boolean {
  const comandas = obtenerComandas();
  comandas.push(comanda);
  return guardarDatos(KEYS.COMANDAS, comandas);
}

export function actualizarComanda(id: string, datos: Partial<Comanda>): boolean {
  const comandas = obtenerComandas();
  const index = comandas.findIndex(c => c.id === id);
  if (index !== -1) {
    comandas[index] = { ...comandas[index], ...datos };
    return guardarDatos(KEYS.COMANDAS, comandas);
  }
  return false;
}

export function eliminarComanda(id: string): boolean {
  const comandas = obtenerComandas();
  const filtradas = comandas.filter(c => c.id !== id);
  return guardarDatos(KEYS.COMANDAS, filtradas);
}

export function obtenerComandasPorOrganismo(organismoId: string): Comanda[] {
  return obtenerComandas().filter(c => c.organismoId === organismoId);
}

export function obtenerComandasPorEstado(estado: EstadoComanda): Comanda[] {
  return obtenerComandas().filter(c => c.estado === estado);
}

// ==================== VEHICULOS ====================

export function obtenerVehiculos(): Vehiculo[] {
  return obtenerDatos<Vehiculo>(KEYS.VEHICULOS);
}

export function guardarVehiculo(vehiculo: Vehiculo): boolean {
  const vehiculos = obtenerVehiculos();
  vehiculos.push(vehiculo);
  return guardarDatos(KEYS.VEHICULOS, vehiculos);
}

export function actualizarVehiculo(id: string, datos: Partial<Vehiculo>): boolean {
  const vehiculos = obtenerVehiculos();
  const index = vehiculos.findIndex(v => v.id === id);
  if (index !== -1) {
    vehiculos[index] = { ...vehiculos[index], ...datos };
    return guardarDatos(KEYS.VEHICULOS, vehiculos);
  }
  return false;
}

export function eliminarVehiculo(id: string): boolean {
  const vehiculos = obtenerVehiculos();
  const filtrados = vehiculos.filter(v => v.id !== id);
  return guardarDatos(KEYS.VEHICULOS, filtrados);
}

export function obtenerVehiculosDisponibles(): Vehiculo[] {
  return obtenerVehiculos().filter(v => v.activo && v.estado === 'disponible');
}

// ==================== RUTAS ====================

export function obtenerRutas(): Ruta[] {
  return obtenerDatos<Ruta>(KEYS.RUTAS);
}

export function guardarRuta(ruta: Ruta): boolean {
  const rutas = obtenerRutas();
  rutas.push(ruta);
  return guardarDatos(KEYS.RUTAS, rutas);
}

export function actualizarRuta(id: string, datos: Partial<Ruta>): boolean {
  const rutas = obtenerRutas();
  const index = rutas.findIndex(r => r.id === id);
  if (index !== -1) {
    rutas[index] = { ...rutas[index], ...datos };
    return guardarDatos(KEYS.RUTAS, rutas);
  }
  return false;
}

export function eliminarRuta(id: string): boolean {
  const rutas = obtenerRutas();
  const filtradas = rutas.filter(r => r.id !== id);
  return guardarDatos(KEYS.RUTAS, filtradas);
}

export function obtenerRutasPorFecha(fecha: string): Ruta[] {
  return obtenerRutas().filter(r => r.fecha === fecha);
}

// ==================== USUARIOS ====================

export function obtenerUsuarios(): Usuario[] {
  return obtenerDatos<Usuario>(KEYS.USUARIOS);
}

export function guardarUsuario(usuario: Usuario): boolean {
  const usuarios = obtenerUsuarios();
  usuarios.push(usuario);
  return guardarDatos(KEYS.USUARIOS, usuarios);
}

export function actualizarUsuario(id: string, datos: Partial<Usuario>): boolean {
  const usuarios = obtenerUsuarios();
  const index = usuarios.findIndex(u => u.id === id);
  if (index !== -1) {
    usuarios[index] = { ...usuarios[index], ...datos };
    return guardarDatos(KEYS.USUARIOS, usuarios);
  }
  return false;
}

export function eliminarUsuario(id: string): boolean {
  const usuarios = obtenerUsuarios();
  const filtrados = usuarios.filter(u => u.id !== id);
  return guardarDatos(KEYS.USUARIOS, filtrados);
}

// ==================== ID DIGITAL ====================

export function obtenerIDsDigitales(): IDDigital[] {
  return obtenerDatos<IDDigital>(KEYS.ID_DIGITAL);
}

export function guardarIDDigital(idDigital: IDDigital): boolean {
  const ids = obtenerIDsDigitales();
  ids.push(idDigital);
  return guardarDatos(KEYS.ID_DIGITAL, ids);
}

export function actualizarIDDigital(id: string, datos: Partial<IDDigital>): boolean {
  const ids = obtenerIDsDigitales();
  const index = ids.findIndex(i => i.id === id);
  if (index !== -1) {
    ids[index] = { ...ids[index], ...datos };
    return guardarDatos(KEYS.ID_DIGITAL, ids);
  }
  return false;
}

export function obtenerIDDigitalPorOrganismo(organismoId: string): IDDigital | null {
  const ids = obtenerIDsDigitales();
  return ids.find(i => i.organismoId === organismoId && i.activo) || null;
}

export function validarClaveAcceso(claveAcceso: string): IDDigital | null {
  const ids = obtenerIDsDigitales();
  return ids.find(i => i.claveAcceso === claveAcceso && i.activo) || null;
}

// ==================== ENTRADAS DE INVENTARIO ====================

export function obtenerEntradas(): EntradaInventario[] {
  return obtenerDatos<EntradaInventario>(KEYS.ENTRADAS);
}

export function guardarEntrada(entrada: EntradaInventario): boolean {
  const entradas = obtenerEntradas();
  entradas.push(entrada);
  return guardarDatos(KEYS.ENTRADAS, entradas);
}

// ==================== ESTADÍSTICAS ====================

export interface EstadisticasGenerales {
  totalOrganismos: number;
  organismosActivos: number;
  totalProductos: number;
  totalStock: number;
  stockBajo: number;
  comandasPendientes: number;
  comandasMes: number;
  valorTotalInventario: number;
  personasAtendidas: number;
}

export function calcularEstadisticas(): EstadisticasGenerales {
  const organismos = obtenerOrganismos();
  const productos = obtenerDatos<Producto>(KEYS.PRODUCTOS);
  const comandas = obtenerComandas();

  const fechaActual = new Date();
  const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1);

  return {
    totalOrganismos: organismos.length,
    organismosActivos: organismos.filter(o => o.activo).length,
    totalProductos: productos.length,
    totalStock: productos.reduce((sum, p) => sum + p.stockActual, 0),
    stockBajo: productos.filter(p => p.stockActual <= p.stockMinimo).length,
    comandasPendientes: comandas.filter(c => c.estado === 'pendiente').length,
    comandasMes: comandas.filter(c => new Date(c.fecha) >= primerDiaMes).length,
    valorTotalInventario: productos.reduce((sum, p) => sum + (p.stockActual * (p.valorMonetario || 0)), 0),
    personasAtendidas: organismos.reduce((sum, o) => sum + (o.activo ? o.numeroPersonasAtendidas : 0), 0),
  };
}

// ==================== FUNCIONES DE DISTRIBUCIÓN ====================

export interface DistribucionOrganismo {
  organismoId: string;
  organismoNombre: string;
  frecuencia: Frecuencia;
  porcentaje: number;
  cantidad: number;
}

export function calcularDistribucionAutomatica(
  cantidadTotal: number,
  organismosSeleccionados: string[]
): DistribucionOrganismo[] {
  const organismos = obtenerOrganismos();
  const organismosValidos = organismos.filter(
    o => organismosSeleccionados.includes(o.id) && o.activo && o.regular
  );

  // Peso por frecuencia: semanal = 4, quincenal = 2, mensual = 1, eventual = 0.5
  const pesoPorFrecuencia = {
    semanal: 4,
    quincenal: 2,
    mensual: 1,
    eventual: 0.5,
  };

  const totalPeso = organismosValidos.reduce(
    (sum, o) => sum + pesoPorFrecuencia[o.frecuencia],
    0
  );

  return organismosValidos.map(o => {
    const peso = pesoPorFrecuencia[o.frecuencia];
    const porcentaje = (peso / totalPeso) * 100;
    const cantidad = (cantidadTotal * porcentaje) / 100;

    return {
      organismoId: o.id,
      organismoNombre: o.nombre,
      frecuencia: o.frecuencia,
      porcentaje: Math.round(porcentaje * 100) / 100,
      cantidad: Math.round(cantidad * 100) / 100,
    };
  });
}

// ==================== EXPORTAR/IMPORTAR DATOS ====================

export function exportarTodosLosDatos(): string {
  const datos = {
    organismos: obtenerOrganismos(),
    productos: obtenerDatos<Producto>(KEYS.PRODUCTOS),
    comandas: obtenerComandas(),
    vehiculos: obtenerVehiculos(),
    rutas: obtenerRutas(),
    usuarios: obtenerUsuarios(),
    idsDigitales: obtenerIDsDigitales(),
    categorias: obtenerDatos<Categoria>(KEYS.CATEGORIAS),
    entradas: obtenerEntradas(),
    fechaExportacion: new Date().toISOString(),
  };
  return JSON.stringify(datos, null, 2);
}

export function importarDatos(datosJSON: string): boolean {
  try {
    const datos = JSON.parse(datosJSON);
    
    if (datos.organismos) guardarDatos(KEYS.ORGANISMOS, datos.organismos);
    if (datos.productos) guardarDatos(KEYS.PRODUCTOS, datos.productos);
    if (datos.comandas) guardarDatos(KEYS.COMANDAS, datos.comandas);
    if (datos.vehiculos) guardarDatos(KEYS.VEHICULOS, datos.vehiculos);
    if (datos.rutas) guardarDatos(KEYS.RUTAS, datos.rutas);
    if (datos.usuarios) guardarDatos(KEYS.USUARIOS, datos.usuarios);
    if (datos.idsDigitales) guardarDatos(KEYS.ID_DIGITAL, datos.idsDigitales);
    if (datos.categorias) guardarDatos(KEYS.CATEGORIAS, datos.categorias);
    if (datos.entradas) guardarDatos(KEYS.ENTRADAS, datos.entradas);
    
    return true;
  } catch (error) {
    console.error('Error al importar datos:', error);
    return false;
  }
}