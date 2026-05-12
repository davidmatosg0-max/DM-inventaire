/**
 * Lógica de negocio para el módulo de Transporte
 * Maneja vehículos, rutas y planificación de entregas
 */

import { toast } from 'sonner';
import { obtenerComandas } from './comandasLogic';
import { obtenerOrganismos } from './organismosLogic';

export type TipoVehiculo = 'furgoneta' | 'camion' | 'camioneta' | 'refrigerado';
export type EstadoVehiculo = 'disponible' | 'en_ruta' | 'mantenimiento';
export type EstadoRuta = 'planificada' | 'en_curso' | 'completada' | 'cancelada';
export type EstadoChofer = 'activo' | 'inactivo' | 'vacaciones';

export interface JourDisponibleTransporte {
  jour: string;
  horaire: 'AM' | 'PM' | 'AM/PM' | null;
}

export interface Vehiculo {
  id: string;
  matricula: string;
  placa?: string;
  tipo: TipoVehiculo;
  marca?: string;
  modelo?: string;
  capacidadKg: number;
  capacidadM3: number;
  estado: EstadoVehiculo;
  estadoUI?: 'disponible' | 'en_uso' | 'mantenimiento' | 'fuera_servicio';
  activo: boolean;
  observaciones?: string;
  notas?: string;
  ultimoMantenimiento?: string;
  proximoMantenimiento?: string;
  kmActual?: number;
  kilometraje?: number;
  conductorAsignado?: string;
  anio?: number;
  consumoCombustible?: number;
}

export interface ParadaRuta {
  id?: string;
  organismoId: string;
  organismoNombre: string;
  direccion: string;
  orden: number;
  comandaId?: string;
  horaEstimada?: string;
  tiempoEstimadoLlegada?: string;
  horaReal?: string;
  estado: 'pendiente' | 'entregado' | 'no_entregado';
  observaciones?: string;
  latitud?: number;
  longitud?: number;
  tiempoEstimadoDescarga?: number;
}

export interface Ruta {
  id: string;
  numeroRuta: string;
  numero?: string;
  nombre?: string;
  fecha: string;
  fechaEntrega?: string;
  vehiculoId: string;
  vehiculoMatricula: string;
  vehiculo?: string;
  conductorId?: string;
  conductorNombre?: string;
  conductor?: string;
  estado: EstadoRuta;
  paradas: ParadaRuta[];
  destino?: string;
  observaciones?: string;
  notas?: string;
  horaSalida?: string;
  horaRegreso?: string;
  kmInicio?: number;
  kmFin?: number;
  pesoTotalKg: number;
  distanciaTotalKm?: number;
  distanciaTotal?: number;
  tiempoEstimado?: number;
}

export interface Chofer {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  licencia: string;
  tipoLicencia: string;
  telefono: string;
  email: string;
  fechaNacimiento: string;
  fechaContratacion: string;
  estado: EstadoChofer;
  vehiculoAsignado?: string;
  experienciaAnios: number;
  certificaciones: string[];
  foto?: string;
  joursDisponibles?: JourDisponibleTransporte[];
}

// ==================== STORAGE ====================

const VEHICULOS_KEY = 'banco_alimentos_vehiculos';
const RUTAS_KEY = 'banco_alimentos_rutas';
const CHOFERES_KEY = 'banco_alimentos_choferes';
const LEGACY_VEHICULOS_KEY = 'banque_alimentaire_transporte_ui_vehiculos';
const LEGACY_RUTAS_KEY = 'banque_alimentaire_transporte_ui_rutas';
const LEGACY_CHOFERES_KEY = 'banque_alimentaire_transporte_ui_choferes';
export const TRANSPORTE_MODULE_EVENT = 'transporte-ui-actualizado';
export const TRANSPORTE_OPEN_VEHICULO_DIALOG_EVENT = 'transporte-ui-abrir-vehiculo';
export const TRANSPORTE_OPEN_CHOFER_DIALOG_EVENT = 'transporte-ui-abrir-chofer';

function generarIdUnico(prefijo: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefijo}-${crypto.randomUUID()}`;
  }

  return `${prefijo}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function emitirActualizacion(scope: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(TRANSPORTE_MODULE_EVENT, {
    detail: { scope }
  }));
}

function normalizarEstadoVehiculo(estado: unknown, activo: boolean | undefined): EstadoVehiculo {
  if (estado === 'en_uso') {
    return 'en_ruta';
  }

  if (estado === 'fuera_servicio') {
    return 'mantenimiento';
  }

  if (estado === 'disponible' || estado === 'en_ruta' || estado === 'mantenimiento') {
    return estado;
  }

  return activo === false ? 'mantenimiento' : 'disponible';
}

function normalizarVehiculo(vehiculo: any): Vehiculo {
  const activo = vehiculo?.activo !== false && vehiculo?.estado !== 'fuera_servicio';
  const estado = normalizarEstadoVehiculo(vehiculo?.estado, activo);
  const kilometraje = Number(vehiculo?.kilometraje ?? vehiculo?.kmActual ?? 0);
  const notas = String(vehiculo?.notas ?? vehiculo?.observaciones ?? '');

  return {
    ...vehiculo,
    id: String(vehiculo?.id ?? generarIdUnico('veh')),
    matricula: String(vehiculo?.matricula ?? vehiculo?.placa ?? ''),
    placa: String(vehiculo?.placa ?? vehiculo?.matricula ?? ''),
    tipo: vehiculo?.tipo ?? 'camion',
    capacidadKg: Number(vehiculo?.capacidadKg ?? 0),
    capacidadM3: Number(vehiculo?.capacidadM3 ?? 0),
    estado,
    estadoUI: vehiculo?.estadoUI ?? (activo ? (estado === 'en_ruta' ? 'en_uso' : estado) : 'fuera_servicio'),
    activo,
    observaciones: notas,
    notas,
    kmActual: kilometraje,
    kilometraje,
    conductorAsignado: vehiculo?.conductorAsignado ?? '',
    anio: vehiculo?.anio,
    consumoCombustible: Number(vehiculo?.consumoCombustible ?? 0),
  };
}

function normalizarEstadoParada(estado: unknown): 'pendiente' | 'entregado' | 'no_entregado' {
  if (estado === 'completada') {
    return 'entregado';
  }

  if (estado === 'omitida' || estado === 'no_entregado') {
    return 'no_entregado';
  }

  return 'pendiente';
}

function normalizarParada(parada: any, index: number): ParadaRuta {
  return {
    ...parada,
    id: parada?.id ? String(parada.id) : `parada-${index + 1}`,
    organismoId: String(parada?.organismoId ?? ''),
    organismoNombre: String(parada?.organismoNombre ?? ''),
    direccion: String(parada?.direccion ?? ''),
    orden: Number(parada?.orden ?? index + 1),
    horaEstimada: parada?.horaEstimada ?? parada?.tiempoEstimadoLlegada ?? '',
    tiempoEstimadoLlegada: parada?.tiempoEstimadoLlegada ?? parada?.horaEstimada ?? '',
    estado: normalizarEstadoParada(parada?.estado),
    tiempoEstimadoDescarga: Number(parada?.tiempoEstimadoDescarga ?? 0),
  };
}

function calcularTiempoEstimado(paradas: ParadaRuta[]): number {
  return paradas.reduce((total, parada) => total + Number(parada.tiempoEstimadoDescarga ?? 0), 0);
}

function normalizarRuta(ruta: any): Ruta {
  const paradas = Array.isArray(ruta?.paradas)
    ? ruta.paradas.map((parada: any, index: number) => normalizarParada(parada, index))
    : [];
  const numeroRuta = String(ruta?.numeroRuta ?? ruta?.numero ?? `RUT-${ruta?.id ?? Date.now()}`);
  const conductorNombre = String(ruta?.conductorNombre ?? ruta?.conductor ?? '');
  const vehiculoMatricula = String(ruta?.vehiculoMatricula ?? ruta?.vehiculo ?? '');
  const observaciones = String(ruta?.observaciones ?? ruta?.notas ?? '');
  const distanciaTotalKm = Number(ruta?.distanciaTotalKm ?? ruta?.distanciaTotal ?? ruta?.distancia ?? 0);
  const tiempoEstimado = Number(ruta?.tiempoEstimado ?? calcularTiempoEstimado(paradas));
  const destino = String(ruta?.destino ?? paradas.map((parada) => parada.organismoNombre).filter(Boolean).join(' · '));

  return {
    ...ruta,
    id: String(ruta?.id ?? generarIdUnico('ruta')),
    numeroRuta,
    numero: String(ruta?.numero ?? numeroRuta),
    nombre: String(ruta?.nombre ?? numeroRuta),
    fecha: String(ruta?.fecha ?? ruta?.fechaEntrega ?? new Date().toISOString().split('T')[0]),
    fechaEntrega: String(ruta?.fechaEntrega ?? ruta?.fecha ?? new Date().toISOString().split('T')[0]),
    vehiculoId: String(ruta?.vehiculoId ?? ''),
    vehiculoMatricula,
    vehiculo: String(ruta?.vehiculo ?? vehiculoMatricula),
    conductorId: ruta?.conductorId ? String(ruta.conductorId) : '',
    conductorNombre,
    conductor: String(ruta?.conductor ?? conductorNombre),
    estado: ruta?.estado ?? 'planificada',
    paradas,
    destino,
    observaciones,
    notas: String(ruta?.notas ?? observaciones),
    pesoTotalKg: Number(ruta?.pesoTotalKg ?? 0),
    distanciaTotalKm,
    distanciaTotal: distanciaTotalKm,
    tiempoEstimado,
  };
}

function normalizarChofer(chofer: any): Chofer {
  return {
    id: String(chofer?.id ?? generarIdUnico('chofer')),
    nombre: String(chofer?.nombre ?? '').trim(),
    apellido: String(chofer?.apellido ?? '').trim(),
    cedula: String(chofer?.cedula ?? '').trim(),
    licencia: String(chofer?.licencia ?? '').trim(),
    tipoLicencia: String(chofer?.tipoLicencia ?? 'Clase 5'),
    telefono: String(chofer?.telefono ?? '').trim(),
    email: String(chofer?.email ?? '').trim(),
    fechaNacimiento: String(chofer?.fechaNacimiento ?? ''),
    fechaContratacion: String(chofer?.fechaContratacion ?? ''),
    estado: chofer?.estado === 'inactivo' || chofer?.estado === 'vacaciones' ? chofer.estado : 'activo',
    vehiculoAsignado: String(chofer?.vehiculoAsignado ?? ''),
    experienciaAnios: Number(chofer?.experienciaAnios ?? 0),
    certificaciones: Array.isArray(chofer?.certificaciones)
      ? chofer.certificaciones.map((certificacion: any) => String(certificacion)).filter(Boolean)
      : [],
    foto: String(chofer?.foto ?? '👤'),
    joursDisponibles: Array.isArray(chofer?.joursDisponibles)
      ? chofer.joursDisponibles.map((jour: any) => ({
          jour: String(jour?.jour ?? ''),
          horaire: jour?.horaire === 'AM' || jour?.horaire === 'PM' || jour?.horaire === 'AM/PM' ? jour.horaire : null,
        })).filter((jour: JourDisponibleTransporte) => Boolean(jour.jour))
      : [],
  };
}

export function obtenerVehiculos(): Vehiculo[] {
  try {
    const datos = localStorage.getItem(VEHICULOS_KEY);
    if (datos) {
      const parsed = JSON.parse(datos);
      return Array.isArray(parsed) ? parsed.map(normalizarVehiculo) : [];
    }

    const legacy = localStorage.getItem(LEGACY_VEHICULOS_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const migrados = parsed.map(normalizarVehiculo);
        guardarVehiculos(migrados);
        return migrados;
      }
    }

    return [];
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    return [];
  }
}

export function guardarVehiculos(vehiculos: Vehiculo[]): boolean {
  try {
    localStorage.setItem(VEHICULOS_KEY, JSON.stringify(vehiculos.map(normalizarVehiculo)));
    emitirActualizacion('vehiculos');
    return true;
  } catch (error) {
    console.error('Error al guardar vehículos:', error);
    return false;
  }
}

export function obtenerRutas(): Ruta[] {
  try {
    const datos = localStorage.getItem(RUTAS_KEY);
    if (datos) {
      const parsed = JSON.parse(datos);
      return Array.isArray(parsed) ? parsed.map(normalizarRuta) : [];
    }

    const legacy = localStorage.getItem(LEGACY_RUTAS_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const migradas = parsed.map(normalizarRuta);
        guardarRutas(migradas);
        return migradas;
      }
    }

    return [];
  } catch (error) {
    console.error('Error al obtener rutas:', error);
    return [];
  }
}

export function guardarRutas(rutas: Ruta[]): boolean {
  try {
    localStorage.setItem(RUTAS_KEY, JSON.stringify(rutas.map(normalizarRuta)));
    emitirActualizacion('rutas');
    return true;
  } catch (error) {
    console.error('Error al guardar rutas:', error);
    return false;
  }
}

export function obtenerChoferes(): Chofer[] {
  try {
    const datos = localStorage.getItem(CHOFERES_KEY);
    if (datos) {
      const parsed = JSON.parse(datos);
      return Array.isArray(parsed) ? parsed.map(normalizarChofer) : [];
    }

    const legacy = localStorage.getItem(LEGACY_CHOFERES_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const migrados = parsed.map(normalizarChofer);
        guardarChoferes(migrados);
        return migrados;
      }
    }

    return [];
  } catch (error) {
    console.error('Error al obtener choferes:', error);
    return [];
  }
}

export function guardarChoferes(choferes: Chofer[]): boolean {
  try {
    localStorage.setItem(CHOFERES_KEY, JSON.stringify(choferes.map(normalizarChofer)));
    emitirActualizacion('choferes');
    return true;
  } catch (error) {
    console.error('Error al guardar choferes:', error);
    return false;
  }
}

// ==================== VEHICULOS ====================

export function crearVehiculo(datos: Omit<Vehiculo, 'id'>): Vehiculo | null {
  if (!datos.matricula || !datos.tipo || !datos.capacidadKg) {
    toast.error('Datos incompletos para crear el vehículo');
    return null;
  }

  // Verificar que no exista un vehículo con la misma matrícula
  const vehiculos = obtenerVehiculos();
  const matriculaExiste = vehiculos.some(
    v => v.matricula.toLowerCase() === datos.matricula.toLowerCase()
  );

  if (matriculaExiste) {
    toast.error('Ya existe un vehículo con esta matrícula');
    return null;
  }

  const nuevoVehiculo: Vehiculo = {
    id: generarIdUnico('veh'),
    ...datos,
  };

  vehiculos.push(nuevoVehiculo);
  guardarVehiculos(vehiculos);

  toast.success(`Vehículo ${nuevoVehiculo.matricula} creado correctamente`);
  return nuevoVehiculo;
}

export function actualizarVehiculo(id: string, datos: Partial<Vehiculo>): boolean {
  const vehiculos = obtenerVehiculos();
  const index = vehiculos.findIndex(v => v.id === id);
  
  if (index === -1) {
    toast.error('Vehículo no encontrado');
    return false;
  }

  vehiculos[index] = { ...vehiculos[index], ...datos };
  guardarVehiculos(vehiculos);
  
  toast.success('Vehículo actualizado correctamente');
  return true;
}

export function eliminarVehiculo(id: string): boolean {
  const vehiculos = obtenerVehiculos();
  const vehiculo = vehiculos.find(v => v.id === id);
  
  if (!vehiculo) {
    toast.error('Vehículo no encontrado');
    return false;
  }

  // Verificar si tiene rutas asociadas
  const rutas = obtenerRutas();
  const tieneRutas = rutas.some(r => r.vehiculoId === id);

  if (tieneRutas) {
    toast.error('No se puede eliminar un vehículo con rutas asociadas');
    return false;
  }

  const nuevosVehiculos = vehiculos.filter(v => v.id !== id);
  guardarVehiculos(nuevosVehiculos);
  
  toast.success('Vehículo eliminado correctamente');
  return true;
}

export function obtenerVehiculosDisponibles(fecha?: string): Vehiculo[] {
  const vehiculos = obtenerVehiculos();
  
  if (!fecha) {
    return vehiculos.filter(v => v.activo && v.estado === 'disponible');
  }

  // Verificar qué vehículos no tienen rutas en esa fecha
  const rutas = obtenerRutas();
  const vehiculosEnRuta = rutas
    .filter(r => r.fecha === fecha && r.estado !== 'cancelada')
    .map(r => r.vehiculoId);

  return vehiculos.filter(
    v => v.activo && !vehiculosEnRuta.includes(v.id)
  );
}

export function cambiarEstadoVehiculo(id: string, nuevoEstado: EstadoVehiculo): boolean {
  return actualizarVehiculo(id, { estado: nuevoEstado });
}

// ==================== CHOFERES ====================

export function crearChofer(datos: Omit<Chofer, 'id'>): Chofer | null {
  if (!datos.nombre || !datos.apellido || !datos.cedula || !datos.licencia) {
    toast.error('Datos incompletos para crear el chofer');
    return null;
  }

  const choferes = obtenerChoferes();
  const duplicado = choferes.some(
    (chofer) => chofer.licencia.toLowerCase() === datos.licencia.toLowerCase() || chofer.cedula.toLowerCase() === datos.cedula.toLowerCase()
  );

  if (duplicado) {
    toast.error('Ya existe un chofer con la misma licencia o cédula');
    return null;
  }

  const nuevoChofer: Chofer = {
    id: generarIdUnico('chofer'),
    ...datos,
  };

  choferes.push(nuevoChofer);
  guardarChoferes(choferes);
  toast.success(`Chofer ${nuevoChofer.nombre} ${nuevoChofer.apellido} creado correctamente`);
  return nuevoChofer;
}

export function actualizarChofer(id: string, datos: Partial<Chofer>): boolean {
  const choferes = obtenerChoferes();
  const index = choferes.findIndex((chofer) => chofer.id === id);

  if (index === -1) {
    toast.error('Chofer no encontrado');
    return false;
  }

  const licenciaObjetivo = String(datos.licencia ?? choferes[index].licencia).toLowerCase();
  const cedulaObjetivo = String(datos.cedula ?? choferes[index].cedula).toLowerCase();
  const duplicado = choferes.some(
    (chofer) => chofer.id !== id && (chofer.licencia.toLowerCase() === licenciaObjetivo || chofer.cedula.toLowerCase() === cedulaObjetivo)
  );

  if (duplicado) {
    toast.error('Ya existe un chofer con la misma licencia o cédula');
    return false;
  }

  choferes[index] = normalizarChofer({ ...choferes[index], ...datos, id });
  guardarChoferes(choferes);
  toast.success('Chofer actualizado correctamente');
  return true;
}

export function eliminarChofer(id: string): boolean {
  const choferes = obtenerChoferes();
  const chofer = choferes.find((item) => item.id === id);

  if (!chofer) {
    toast.error('Chofer no encontrado');
    return false;
  }

  const rutas = obtenerRutas();
  const tieneRutaActiva = rutas.some((ruta) => ruta.conductorId === id && ruta.estado === 'en_curso');
  if (tieneRutaActiva) {
    toast.error('No se puede eliminar un chofer con una ruta en curso');
    return false;
  }

  guardarChoferes(choferes.filter((item) => item.id !== id));
  toast.success('Chofer eliminado correctamente');
  return true;
}

// ==================== RUTAS ====================

export function generarNumeroRuta(): string {
  const fecha = new Date();
  const año = fecha.getFullYear().toString().slice(-2);
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dia = fecha.getDate().toString().padStart(2, '0');
  const timestamp = Date.now().toString().slice(-4);
  return `RUT-${año}${mes}${dia}-${timestamp}`;
}

export function crearRuta(datos: Omit<Ruta, 'id' | 'numeroRuta'>): Ruta | null {
  if (!datos.fecha || !datos.vehiculoId || datos.paradas.length === 0) {
    toast.error('Datos incompletos para crear la ruta');
    return null;
  }

  // Verificar que el vehículo exista y esté disponible
  const vehiculos = obtenerVehiculos();
  const vehiculo = vehiculos.find(v => v.id === datos.vehiculoId);

  if (!vehiculo) {
    toast.error('Vehículo no encontrado');
    return null;
  }

  if (!vehiculo.activo) {
    toast.error('El vehículo no está activo');
    return null;
  }

  // Verificar capacidad
  if (datos.pesoTotalKg > vehiculo.capacidadKg) {
    toast.error(`El peso total (${datos.pesoTotalKg} kg) excede la capacidad del vehículo (${vehiculo.capacidadKg} kg)`);
    return null;
  }

  const nuevaRuta: Ruta = {
    id: generarIdUnico('ruta'),
    numeroRuta: generarNumeroRuta(),
    ...datos,
  };

  const rutas = obtenerRutas();
  rutas.push(nuevaRuta);
  guardarRutas(rutas);

  // Una ruta planificada reserva el vehículo por fecha, pero no lo pone en ruta hasta iniciar salida.
  if (datos.estado === 'en_curso') {
    cambiarEstadoVehiculo(datos.vehiculoId, 'en_ruta');
  }

  toast.success(`Ruta ${nuevaRuta.numeroRuta} creada correctamente`);
  return nuevaRuta;
}

export function actualizarRuta(id: string, datos: Partial<Ruta>): boolean {
  const rutas = obtenerRutas();
  const index = rutas.findIndex(r => r.id === id);
  
  if (index === -1) {
    toast.error('Ruta no encontrada');
    return false;
  }

  rutas[index] = { ...rutas[index], ...datos };
  guardarRutas(rutas);
  
  toast.success('Ruta actualizada correctamente');
  return true;
}

export function cambiarEstadoRuta(id: string, nuevoEstado: EstadoRuta): boolean {
  const rutas = obtenerRutas();
  const ruta = rutas.find(r => r.id === id);
  
  if (!ruta) {
    toast.error('Ruta no encontrada');
    return false;
  }

  // Si la ruta se completa o cancela, liberar el vehículo
  if (nuevoEstado === 'completada' || nuevoEstado === 'cancelada') {
    cambiarEstadoVehiculo(ruta.vehiculoId, 'disponible');
  }

  // Si la ruta pasa a en_curso, marcar vehículo en ruta
  if (nuevoEstado === 'en_curso') {
    cambiarEstadoVehiculo(ruta.vehiculoId, 'en_ruta');
  }

  return actualizarRuta(id, { estado: nuevoEstado });
}

export function eliminarRuta(id: string): boolean {
  const rutas = obtenerRutas();
  const ruta = rutas.find(r => r.id === id);
  
  if (!ruta) {
    toast.error('Ruta no encontrada');
    return false;
  }

  // Si la ruta estaba en curso, liberar el vehículo
  if (ruta.estado === 'en_curso') {
    cambiarEstadoVehiculo(ruta.vehiculoId, 'disponible');
  }

  const nuevasRutas = rutas.filter(r => r.id !== id);
  guardarRutas(nuevasRutas);
  
  toast.success('Ruta eliminada correctamente');
  return true;
}

// ==================== PARADAS ====================

export function actualizarParada(
  rutaId: string,
  paradaIndex: number,
  datos: Partial<ParadaRuta>
): boolean {
  const rutas = obtenerRutas();
  const ruta = rutas.find(r => r.id === rutaId);
  
  if (!ruta || !ruta.paradas[paradaIndex]) {
    toast.error('Ruta o parada no encontrada');
    return false;
  }

  ruta.paradas[paradaIndex] = { ...ruta.paradas[paradaIndex], ...datos };
  
  return actualizarRuta(rutaId, { paradas: ruta.paradas });
}

export function marcarParadaComoEntregada(
  rutaId: string,
  paradaIndex: number,
  horaReal?: string
): boolean {
  return actualizarParada(rutaId, paradaIndex, {
    estado: 'entregado',
    horaReal: horaReal || new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
  });
}

export function marcarParadaComoNoEntregada(
  rutaId: string,
  paradaIndex: number,
  observaciones: string
): boolean {
  return actualizarParada(rutaId, paradaIndex, {
    estado: 'no_entregado',
    observaciones,
  });
}

// ==================== OPTIMIZACIÓN DE RUTAS ====================

export function optimizarRuta(paradas: ParadaRuta[]): ParadaRuta[] {
  // Algoritmo simple: ordenar por latitud y longitud
  // En una implementación real, usar un algoritmo de optimización de rutas (TSP)
  
  if (paradas.length <= 1) return paradas;

  const paradasOrdenadas = [...paradas].sort((a, b) => {
    if (!a.latitud || !b.latitud) return 0;
    if (a.latitud !== b.latitud) {
      return a.latitud - b.latitud;
    }
    if (!a.longitud || !b.longitud) return 0;
    return a.longitud - b.longitud;
  });

  // Actualizar orden
  return paradasOrdenadas.map((parada, index) => ({
    ...parada,
    orden: index + 1,
  }));
}

export function calcularDistanciaRuta(paradas: ParadaRuta[]): number {
  // Calcular distancia total aproximada entre paradas
  let distanciaTotal = 0;

  for (let i = 0; i < paradas.length - 1; i++) {
    const parada1 = paradas[i];
    const parada2 = paradas[i + 1];

    if (parada1.latitud && parada1.longitud && parada2.latitud && parada2.longitud) {
      const distancia = calcularDistanciaEntrePuntos(
        parada1.latitud,
        parada1.longitud,
        parada2.latitud,
        parada2.longitud
      );
      distanciaTotal += distancia;
    }
  }

  return Math.round(distanciaTotal * 100) / 100;
}

function calcularDistanciaEntrePuntos(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ==================== ASIGNACIÓN AUTOMÁTICA ====================

export function asignarVehiculoOptimo(pesoTotalKg: number, fecha: string): Vehiculo | null {
  const vehiculosDisponibles = obtenerVehiculosDisponibles(fecha);
  
  // Filtrar vehículos con capacidad suficiente
  const vehiculosAptos = vehiculosDisponibles.filter(
    v => v.capacidadKg >= pesoTotalKg
  );

  if (vehiculosAptos.length === 0) {
    toast.error('No hay vehículos disponibles con capacidad suficiente');
    return null;
  }

  // Seleccionar el vehículo con menor capacidad que cumpla (optimización)
  const vehiculoOptimo = vehiculosAptos.reduce((mejor, actual) => 
    actual.capacidadKg < mejor.capacidadKg ? actual : mejor
  );

  return vehiculoOptimo;
}

// ==================== ESTADÍSTICAS ====================

export function obtenerEstadisticasTransporte() {
  const vehiculos = obtenerVehiculos();
  const rutas = obtenerRutas();
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  return {
    totalVehiculos: vehiculos.length,
    vehiculosDisponibles: vehiculos.filter(v => v.activo && v.estado === 'disponible').length,
    vehiculosEnRuta: vehiculos.filter(v => v.estado === 'en_ruta').length,
    vehiculosMantenimiento: vehiculos.filter(v => v.estado === 'mantenimiento').length,
    totalRutas: rutas.length,
    rutasEsteMes: rutas.filter(r => new Date(r.fecha) >= primerDiaMes).length,
    rutasCompletadas: rutas.filter(r => r.estado === 'completada').length,
    rutasEnCurso: rutas.filter(r => r.estado === 'en_curso').length,
    rutasPlanificadas: rutas.filter(r => r.estado === 'planificada').length,
    kmTotales: rutas.reduce((sum, r) => {
      if (r.kmFin && r.kmInicio) {
        return sum + (r.kmFin - r.kmInicio);
      }
      return sum;
    }, 0),
  };
}

// ==================== FILTROS ====================

export function obtenerRutasPorFecha(fecha: string): Ruta[] {
  return obtenerRutas().filter(r => r.fecha === fecha);
}

export function obtenerRutasPorVehiculo(vehiculoId: string): Ruta[] {
  return obtenerRutas().filter(r => r.vehiculoId === vehiculoId);
}

export function obtenerRutasPorEstado(estado: EstadoRuta): Ruta[] {
  return obtenerRutas().filter(r => r.estado === estado);
}

// ==================== EXPORTAR ====================

export function exportarRuta(rutaId: string): string {
  const rutas = obtenerRutas();
  const ruta = rutas.find(r => r.id === rutaId);
  
  if (!ruta) return '';
  
  return JSON.stringify(ruta, null, 2);
}
