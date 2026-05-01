/**
 * Lógica de negocio para el módulo de Organismos
 * Maneja la gestión completa de organismos beneficiarios
 */

import { toast } from 'sonner';

export type TipoAsistencia = 'alimentario' | 'higiene' | 'mixto';
export type Frecuencia = 'semanal' | 'quincenal' | 'mensual' | 'eventual';

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
  horarioAtencion?: string;
  diasEntrega?: string[];
}

// ==================== STORAGE ====================

const ORGANISMOS_KEY = 'banco_alimentos_organismos';

export function obtenerOrganismos(): Organismo[] {
  try {
    const datos = localStorage.getItem(ORGANISMOS_KEY);
    return datos ? JSON.parse(datos) : [];
  } catch (error) {
    console.error('Error al obtener organismos:', error);
    return [];
  }
}

export function guardarOrganismos(organismos: Organismo[]): boolean {
  try {
    localStorage.setItem(ORGANISMOS_KEY, JSON.stringify(organismos));
    return true;
  } catch (error) {
    console.error('Error al guardar organismos:', error);
    return false;
  }
}

// ==================== CREAR ORGANISMO ====================

export function generarCodigoOrganismo(): string {
  const organismos = obtenerOrganismos();
  const ultimoNumero = organismos.length + 1;
  return `ORG-${ultimoNumero.toString().padStart(4, '0')}`;
}

export function validarDatosOrganismo(datos: Partial<Organismo>): string[] {
  const errores: string[] = [];

  if (!datos.nombre || datos.nombre.trim().length < 3) {
    errores.push('El nombre debe tener al menos 3 caracteres');
  }

  if (!datos.tipo) {
    errores.push('Debe seleccionar un tipo de organismo');
  }

  if (!datos.direccion || datos.direccion.trim().length < 5) {
    errores.push('La dirección es obligatoria');
  }

  if (!datos.ciudad || datos.ciudad.trim().length < 2) {
    errores.push('La ciudad es obligatoria');
  }

  if (!datos.telefono || datos.telefono.trim().length < 9) {
    errores.push('El teléfono debe tener al menos 9 dígitos');
  }

  if (datos.email && !validarEmail(datos.email)) {
    errores.push('El formato del email no es válido');
  }

  if (!datos.responsable || datos.responsable.trim().length < 3) {
    errores.push('El nombre del responsable es obligatorio');
  }

  if (!datos.tipoAsistencia) {
    errores.push('Debe seleccionar un tipo de asistencia');
  }

  if (!datos.frecuencia) {
    errores.push('Debe seleccionar una frecuencia de entrega');
  }

  if (!datos.numeroPersonasAtendidas || datos.numeroPersonasAtendidas < 1) {
    errores.push('El número de personas atendidas debe ser mayor a 0');
  }

  return errores;
}

function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function crearOrganismo(datos: Omit<Organismo, 'id' | 'codigo' | 'fechaRegistro'>): Organismo | null {
  const errores = validarDatosOrganismo(datos);
  
  if (errores.length > 0) {
    errores.forEach(error => toast.error(error));
    return null;
  }

  // Verificar que no exista un organismo con el mismo nombre
  const organismos = obtenerOrganismos();
  const nombreExiste = organismos.some(
    o => o.nombre.toLowerCase() === datos.nombre.toLowerCase()
  );

  if (nombreExiste) {
    toast.error('Ya existe un organismo con este nombre');
    return null;
  }

  const nuevoOrganismo: Organismo = {
    id: Date.now().toString(),
    codigo: generarCodigoOrganismo(),
    fechaRegistro: new Date().toISOString(),
    ...datos,
  };

  organismos.push(nuevoOrganismo);
  guardarOrganismos(organismos);

  toast.success(`Organismo ${nuevoOrganismo.nombre} creado correctamente`);
  return nuevoOrganismo;
}

// ==================== ACTUALIZAR ORGANISMO ====================

export function actualizarOrganismo(id: string, datos: Partial<Organismo>): boolean {
  const organismos = obtenerOrganismos();
  const index = organismos.findIndex(o => o.id === id);
  
  if (index === -1) {
    toast.error('Organismo no encontrado');
    return false;
  }

  // Validar datos si se están actualizando campos importantes
  if (datos.nombre || datos.direccion || datos.telefono || datos.email) {
    const datosCompletos = { ...organismos[index], ...datos };
    const errores = validarDatosOrganismo(datosCompletos);
    
    if (errores.length > 0) {
      errores.forEach(error => toast.error(error));
      return false;
    }
  }

  organismos[index] = { ...organismos[index], ...datos };
  guardarOrganismos(organismos);
  
  toast.success('Organismo actualizado correctamente');
  return true;
}

// ==================== ELIMINAR ORGANISMO ====================

export function eliminarOrganismo(id: string): boolean {
  const organismos = obtenerOrganismos();
  const organismo = organismos.find(o => o.id === id);
  
  if (!organismo) {
    toast.error('Organismo no encontrado');
    return false;
  }

  // Verificar si tiene comandas asociadas (esto requeriría importar comandasLogic)
  // Por seguridad, mejor desactivar en lugar de eliminar
  actualizarOrganismo(id, { activo: false });
  toast.success(`Organismo ${organismo.nombre} desactivado correctamente`);
  
  return true;
}

// ==================== ACTIVAR/DESACTIVAR ====================

export function activarOrganismo(id: string): boolean {
  return actualizarOrganismo(id, { activo: true });
}

export function desactivarOrganismo(id: string): boolean {
  return actualizarOrganismo(id, { activo: false });
}

export function marcarComoRegular(id: string): boolean {
  return actualizarOrganismo(id, { regular: true });
}

export function marcarComoNoRegular(id: string): boolean {
  return actualizarOrganismo(id, { regular: false });
}

// ==================== FILTROS Y BÚSQUEDA ====================

export function obtenerOrganismosActivos(): Organismo[] {
  return obtenerOrganismos().filter(o => o.activo);
}

export function obtenerOrganismosRegulares(): Organismo[] {
  return obtenerOrganismos().filter(o => o.activo && o.regular);
}

export function obtenerOrganismosPorTipo(tipo: string): Organismo[] {
  return obtenerOrganismos().filter(o => o.tipo === tipo && o.activo);
}

export function obtenerOrganismosPorFrecuencia(frecuencia: Frecuencia): Organismo[] {
  return obtenerOrganismos().filter(o => o.frecuencia === frecuencia && o.activo);
}

export function obtenerOrganismosPorTipoAsistencia(tipoAsistencia: TipoAsistencia): Organismo[] {
  return obtenerOrganismos().filter(o => o.tipoAsistencia === tipoAsistencia && o.activo);
}

export function buscarOrganismos(termino: string): Organismo[] {
  const organismos = obtenerOrganismos();
  const terminoLower = termino.toLowerCase();
  
  return organismos.filter(o => 
    o.nombre.toLowerCase().includes(terminoLower) ||
    o.codigo.toLowerCase().includes(terminoLower) ||
    o.ciudad.toLowerCase().includes(terminoLower) ||
    o.responsable.toLowerCase().includes(terminoLower)
  );
}

export function obtenerOrganismosPorCiudad(ciudad: string): Organismo[] {
  return obtenerOrganismos().filter(o => 
    o.ciudad.toLowerCase() === ciudad.toLowerCase() && o.activo
  );
}

// ==================== ESTADÍSTICAS ====================

export function obtenerEstadisticasOrganismos() {
  const organismos = obtenerOrganismos();
  
  const tiposCuenta: Record<string, number> = {};
  const tiposAsistenciaCuenta: Record<string, number> = {};
  const frecuenciasCuenta: Record<string, number> = {};
  const ciudadesCuenta: Record<string, number> = {};

  organismos.forEach(o => {
    if (!o.activo) return;
    
    tiposCuenta[o.tipo] = (tiposCuenta[o.tipo] || 0) + 1;
    tiposAsistenciaCuenta[o.tipoAsistencia] = (tiposAsistenciaCuenta[o.tipoAsistencia] || 0) + 1;
    frecuenciasCuenta[o.frecuencia] = (frecuenciasCuenta[o.frecuencia] || 0) + 1;
    ciudadesCuenta[o.ciudad] = (ciudadesCuenta[o.ciudad] || 0) + 1;
  });

  return {
    total: organismos.length,
    activos: organismos.filter(o => o.activo).length,
    inactivos: organismos.filter(o => !o.activo).length,
    regulares: organismos.filter(o => o.regular && o.activo).length,
    totalPersonasAtendidas: organismos
      .filter(o => o.activo)
      .reduce((sum, o) => sum + o.numeroPersonasAtendidas, 0),
    porTipo: tiposCuenta,
    porTipoAsistencia: tiposAsistenciaCuenta,
    porFrecuencia: frecuenciasCuenta,
    porCiudad: ciudadesCuenta,
  };
}

// ==================== DISTRIBUCIÓN AUTOMÁTICA ====================

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
  const pesoPorFrecuencia: Record<Frecuencia, number> = {
    semanal: 4,
    quincenal: 2,
    mensual: 1,
    eventual: 0.5,
  };

  const totalPeso = organismosValidos.reduce(
    (sum, o) => sum + pesoPorFrecuencia[o.frecuencia],
    0
  );

  if (totalPeso === 0) {
    return [];
  }

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

// ==================== GEOCODIFICACIÓN (PLACEHOLDER) ====================

export async function geocodificarDireccion(direccion: string, ciudad: string): Promise<{ lat: number; lng: number } | null> {
  // En una implementación real, esto llamaría a una API de geocodificación
  // Por ahora, retornar coordenadas de ejemplo
  console.log('Geocodificando:', direccion, ciudad);
  return null;
}

export function calcularDistanciaEntreOrganismos(org1Id: string, org2Id: string): number | null {
  const organismos = obtenerOrganismos();
  const org1 = organismos.find(o => o.id === org1Id);
  const org2 = organismos.find(o => o.id === org2Id);

  if (!org1 || !org2 || !org1.latitud || !org1.longitud || !org2.latitud || !org2.longitud) {
    return null;
  }

  // Fórmula de Haversine para calcular distancia entre dos puntos
  const R = 6371; // Radio de la Tierra en km
  const dLat = (org2.latitud - org1.latitud) * Math.PI / 180;
  const dLon = (org2.longitud - org1.longitud) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(org1.latitud * Math.PI / 180) * Math.cos(org2.latitud * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distancia = R * c;

  return Math.round(distancia * 100) / 100;
}

// ==================== EXPORTAR ====================

export function exportarOrganismos(): string {
  const organismos = obtenerOrganismos();
  return JSON.stringify(organismos, null, 2);
}

export function exportarOrganismosCSV(): string {
  const organismos = obtenerOrganismos();
  
  const headers = [
    'Código',
    'Nombre',
    'Tipo',
    'Dirección',
    'Ciudad',
    'Código Postal',
    'Teléfono',
    'Email',
    'Responsable',
    'Tipo Asistencia',
    'Frecuencia',
    'Personas Atendidas',
    'Activo',
    'Regular',
  ].join(',');

  const rows = organismos.map(o => [
    o.codigo,
    `"${o.nombre}"`,
    o.tipo,
    `"${o.direccion}"`,
    o.ciudad,
    o.codigoPostal,
    o.telefono,
    o.email,
    `"${o.responsable}"`,
    o.tipoAsistencia,
    o.frecuencia,
    o.numeroPersonasAtendidas,
    o.activo ? 'Sí' : 'No',
    o.regular ? 'Sí' : 'No',
  ].join(','));

  return [headers, ...rows].join('\n');
}
