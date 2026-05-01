// Sistema de almacenamiento centralizado para organismos
// Utilizado tanto por el módulo Organismos como por el módulo Liaison (EmailOrganismos)

import { notificarCambioOrganismo } from './organismoEvents';
import { registrarActividad } from './actividadLogger';

export interface JourDisponible {
  jour: string;
  horaire: 'AM' | 'PM' | 'AM/PM' | null;
}

export type IdiomaContactoOrganismo = 'es' | 'fr' | 'en' | 'ar';

export interface ContactoNotificacion {
  nombre: string;
  email: string;
  cargo: string;
  idiomas?: IdiomaContactoOrganismo[];
  joursDisponibles?: JourDisponible[];
}

export interface Organismo {
  id: string;
  nombre: string;
  tipo: string;
  email: string;
  telefono: string;
  direccion: string;
  codigoPostal?: string;
  quartier?: string;
  zona?: string;
  responsable: string;
  beneficiarios: number;
  activo: boolean;
  regular: boolean;
  participantePRS: boolean;
  frecuenciaCita?: string;
  horaCita?: string;
  personasServidas: number;
  cantidadColaciones: number;
  cantidadAlmuerzos: number;
  porcentajeReparticion: number;
  notas?: string;
  notificaciones: boolean;
  logo?: string | null;
  documentoPDF?: string | null;
  claveAcceso?: string;
  contactosNotificacion: ContactoNotificacion[];
  fechaInicioInactividad?: string;
  fechaFinInactividad?: string;
  fechaCreacion: string;
  fechaModificacion: string;
}

const STORAGE_KEY = 'organismos_banco_alimentos';

function generarIdOrganismo(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `org-${crypto.randomUUID()}`;
  }

  return `org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function normalizarPorcentajeReparticion(valor: number | undefined): number {
  if (!Number.isFinite(valor)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(valor)));
}

function sanitizarOrganismo(organismo: Organismo): Organismo {
  return {
    ...organismo,
    porcentajeReparticion: normalizarPorcentajeReparticion(organismo.porcentajeReparticion),
  };
}

function asegurarIdsUnicosOrganismos(organismos: Organismo[]): Organismo[] {
  const idsVistos = new Set<string>();

  return organismos.map((organismo) => {
    const organismoSanitizado = sanitizarOrganismo(organismo);
    const idActual = String(organismoSanitizado.id || '').trim();

    if (!idActual || idsVistos.has(idActual)) {
      const nuevoId = generarIdOrganismo();
      idsVistos.add(nuevoId);
      return {
        ...organismoSanitizado,
        id: nuevoId,
      };
    }

    idsVistos.add(idActual);
    return organismoSanitizado;
  });
}

// ===== MODO PRODUCCIÓN: ORGANISMOS DE EJEMPLO DESACTIVADOS =====
// Lista de organismos inicial - vacía para producción
const organismosIniciales: Organismo[] = [];

// Inicializar el almacenamiento si no existe
export function inicializarOrganismos(): void {
  if (!localStorage.getItem(STORAGE_KEY)) {
    // En producción, inicializar con array vacío
    localStorage.setItem(STORAGE_KEY, JSON.stringify(organismosIniciales));
    console.log('✅ Sistema de organismos inicializado (vacío - listo para producción)');
  }
}

// Obtener todos los organismos
export function obtenerOrganismos(): Organismo[] {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data !== null) {
    // Si existe la clave (aunque sea un array vacío), usarla
    const organismos = JSON.parse(data) as Organismo[];
    const organismosSanitizados = asegurarIdsUnicosOrganismos(organismos);

    if (JSON.stringify(organismosSanitizados) !== JSON.stringify(organismos)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(organismosSanitizados));
    }

    return organismosSanitizados;
  } else {
    // Solo inicializar si NO existe la clave en localStorage (primera vez)
    inicializarOrganismos();
    const nuevosOrganismos = localStorage.getItem(STORAGE_KEY);
    return nuevosOrganismos ? JSON.parse(nuevosOrganismos) : [];
  }
}

// Obtener un organismo por ID
export function obtenerOrganismoPorId(id: string): Organismo | null {
  const organismos = obtenerOrganismos();
  return organismos.find(org => org.id === id) || null;
}

// Crear un nuevo organismo
export function crearOrganismo(organismo: Omit<Organismo, 'id' | 'fechaCreacion' | 'fechaModificacion'>): Organismo {
  const organismos = obtenerOrganismos();
  const nuevoOrganismo = sanitizarOrganismo({
    ...organismo,
    id: generarIdOrganismo(),
    fechaCreacion: new Date().toISOString(),
    fechaModificacion: new Date().toISOString()
  });
  organismos.push(nuevoOrganismo);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(organismos));
  notificarCambioOrganismo('CREATED', nuevoOrganismo.id);
  
  // Registrar actividad
  registrarActividad(
    'Organismes',
    'crear',
    `Organisme "${nuevoOrganismo.nombre}" créé - Type: ${nuevoOrganismo.tipo}`,
    { organismoId: nuevoOrganismo.id, tipo: nuevoOrganismo.tipo }
  );
  
  return nuevoOrganismo;
}

// Actualizar un organismo existente
export function actualizarOrganismo(id: string, datos: Partial<Organismo>): Organismo | null {
  const organismos = obtenerOrganismos();
  const index = organismos.findIndex(org => org.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const organismoAnterior = { ...organismos[index] };
  const organismoActualizado = sanitizarOrganismo({
    ...organismos[index],
    ...datos,
    id, // Mantener el ID original
    fechaModificacion: new Date().toISOString()
  });
  const organismosActualizados = [...organismos];
  organismosActualizados[index] = organismoActualizado;
  organismos[index] = organismoActualizado;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(organismos));
  notificarCambioOrganismo('UPDATED', organismos[index].id);
  
  // Registrar actividad con cambios
  const cambios = [];
  if (datos.activo !== undefined && datos.activo !== organismoAnterior.activo) {
    cambios.push(datos.activo ? 'Activé' : 'Désactivé');
  }
  if (datos.nombre && datos.nombre !== organismoAnterior.nombre) {
    cambios.push('Nom modifié');
  }
  
  registrarActividad(
    'Organismes',
    'modificar',
    `Organisme "${organismos[index].nombre}" modifié${cambios.length > 0 ? ' - ' + cambios.join(', ') : ''}`,
    { organismoId: id, cambios: datos }
  );
  
  return organismos[index];
}

// Eliminar un organismo
export function eliminarOrganismo(id: string): boolean {
  const organismos = obtenerOrganismos();
  const organismoEliminar = organismos.find(org => org.id === id);
  const nuevosOrganismos = organismos.filter(org => org.id !== id);
  
  if (nuevosOrganismos.length === organismos.length) {
    return false; // No se encontró el organismo
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevosOrganismos));
  notificarCambioOrganismo('DELETED', id);
  
  // Registrar actividad
  if (organismoEliminar) {
    registrarActividad(
      'Organismes',
      'eliminar',
      `Organisme "${organismoEliminar.nombre}" supprimé`,
      { organismoId: id, nombre: organismoEliminar.nombre }
    );
  }
  
  return true;
}

// Buscar organismos por término
export function buscarOrganismos(termino: string): Organismo[] {
  const organismos = obtenerOrganismos();
  const terminoLower = termino.toLowerCase();
  
  return organismos.filter(org =>
    org.nombre.toLowerCase().includes(terminoLower) ||
    org.tipo.toLowerCase().includes(terminoLower) ||
    org.responsable.toLowerCase().includes(terminoLower) ||
    org.direccion.toLowerCase().includes(terminoLower) ||
    org.email.toLowerCase().includes(terminoLower)
  );
}

// Obtener organismos activos
export function obtenerOrganismosActivos(): Organismo[] {
  return obtenerOrganismos().filter(org => org.activo);
}

// Obtener organismos regulares
export function obtenerOrganismosRegulares(): Organismo[] {
  return obtenerOrganismos().filter(org => org.regular);
}

// Obtener organismos participantes del PRS
export function obtenerOrganismosPRS(): Organismo[] {
  return obtenerOrganismos().filter(org => org.participantePRS);
}

// Obtener estadísticas
export function obtenerEstadisticasOrganismos() {
  const organismos = obtenerOrganismos();
  
  return {
    total: organismos.length,
    activos: organismos.filter(org => org.activo).length,
    inactivos: organismos.filter(org => !org.activo).length,
    regulares: organismos.filter(org => org.regular).length,
    eventuales: organismos.filter(org => !org.regular).length,
    participantesPRS: organismos.filter(org => org.participantePRS).length,
    totalBeneficiarios: organismos.reduce((sum, org) => sum + org.beneficiarios, 0),
    totalPersonasServidas: organismos.reduce((sum, org) => sum + org.personasServidas, 0)
  };
}

// Migración: Agregar claves de acceso a organismos existentes que no las tengan
export function migrarClavesDeAcceso(): void {
  const organismos = obtenerOrganismos();
  let actualizados = 0;
  
  const organismosActualizados = organismos.map(org => {
    if (!org.claveAcceso) {
      actualizados++;
      // Generar clave basada en iniciales du nombre
      const palabras = org.nombre
        .toUpperCase()
        .split(' ')
        .filter(p => p.length > 2);
      
      let iniciales = '';
      if (palabras.length >= 3) {
        iniciales = palabras[0][0] + palabras[1][0] + palabras[2][0];
      } else if (palabras.length === 2) {
        iniciales = palabras[0][0] + palabras[1][0] + palabras[1][1];
      } else if (palabras.length === 1) {
        iniciales = palabras[0].substring(0, 3);
      }
      
      // Generar código aleatorio
      const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let codigo = '';
      for (let i = 0; i < 6; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }
      
      return {
        ...org,
        claveAcceso: `${iniciales}-${codigo}`
      };
    }
    return org;
  });
  
  if (actualizados > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(organismosActualizados));
    console.log(`✅ Migración completada: ${actualizados} organismos actualizados avec claves de acceso`);
  }
}