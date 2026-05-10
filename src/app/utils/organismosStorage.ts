// Sistema de almacenamiento centralizado para organismos
// Utilizado tanto por el módulo Organismos como por el módulo Liaison (EmailOrganismos)

import { notificarCambioOrganismo } from './organismoEvents';
import { registrarActividad } from './actividadLogger';
import { queueStorageSync } from './cloudPersistence';
import { generarClaveAccesoUnica, normalizarClaveAcceso } from './claveAcceso';

export interface JourDisponible {
  jour: string;
  horaire: 'AM' | 'PM' | 'AM/PM' | null;
}

export type IdiomaContactoOrganismo = 'es' | 'fr' | 'en' | 'ar';
export type ClasificacionOrganismo = 'regular' | 'eventual' | 'collation';

export interface ContactoNotificacion {
  nombre: string;
  email: string;
  cargo: string;
  idiomas?: IdiomaContactoOrganismo[];
  joursDisponibles?: JourDisponible[];
}

export interface DocumentoPdfOrganismo {
  id: string;
  nombre: string;
  contenido: string;
  tamanoBytes: number;
}

export interface Organismo {
  id: string;
  nombre: string;
  tipo: string;
  email: string;
  telefono: string;
  contactoCargo?: string;
  contactoTelefono?: string;
  contactoCellulaire?: string;
  contactoEmail?: string;
  contactoJoursDisponibles?: JourDisponible[];
  direccion: string;
  codigoPostal?: string;
  quartier?: string;
  zona?: string;
  responsable: string;
  beneficiarios: number;
  activo: boolean;
  regular: boolean;
  clasificacionOrganismo?: ClasificacionOrganismo;
  participantePRS: boolean;
  frecuenciaCita?: string;
  diaCita?: string;
  horaCita?: string;
  personasServidas: number;
  cantidadColaciones: number;
  cantidadAlmuerzos: number;
  porcentajeReparticion: number;
  notas?: string;
  notificaciones: boolean;
  logo?: string | null;
  documentosPDF?: DocumentoPdfOrganismo[];
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

function generarIdDocumentoPdf(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `pdf-${crypto.randomUUID()}`;
  }

  return `pdf-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function construirNombreDocumentoPdf(valor: string, index: number, nombreOrganismo?: string): string {
  const nombreLimpio = String(valor || '').trim();

  if (nombreLimpio && !nombreLimpio.startsWith('data:')) {
    return nombreLimpio.toLowerCase().endsWith('.pdf') ? nombreLimpio : `${nombreLimpio}.pdf`;
  }

  const baseNombre = String(nombreOrganismo || 'document-organisme')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${baseNombre || 'document-organisme'}-${index + 1}.pdf`;
}

function normalizarDocumentosPdf(
  documentosPDF: DocumentoPdfOrganismo[] | undefined,
  documentoPDFLegado: string | null | undefined,
  nombreOrganismo?: string,
): DocumentoPdfOrganismo[] {
  const documentosNormalizados = (documentosPDF || [])
    .map((documento, index) => {
      const contenido = String(documento?.contenido || '').trim();

      if (!contenido) {
        return null;
      }

      return {
        id: String(documento?.id || '').trim() || generarIdDocumentoPdf(),
        nombre: construirNombreDocumentoPdf(String(documento?.nombre || '').trim(), index, nombreOrganismo),
        contenido,
        tamanoBytes: Number.isFinite(documento?.tamanoBytes) ? Math.max(0, Math.round(documento.tamanoBytes)) : 0,
      };
    })
    .filter((documento): documento is DocumentoPdfOrganismo => Boolean(documento));

  if (documentosNormalizados.length > 0) {
    return documentosNormalizados;
  }

  const legado = String(documentoPDFLegado || '').trim();
  if (!legado) {
    return [];
  }

  return [
    {
      id: generarIdDocumentoPdf(),
      nombre: construirNombreDocumentoPdf(legado, 0, nombreOrganismo),
      contenido: legado,
      tamanoBytes: 0,
    },
  ];
}

function sanitizarOrganismo(organismo: Organismo): Organismo {
  const clasificacionOrganismo = organismo.clasificacionOrganismo || (organismo.regular ? 'regular' : 'eventual');
  const claveAcceso = normalizarClaveAcceso(organismo.claveAcceso || '');
  const contactoCargo = String(organismo.contactoCargo || '').trim();
  const contactoTelefono = String(organismo.contactoTelefono || '').trim();
  const contactoCellulaire = String(organismo.contactoCellulaire || '').trim();
  const contactoEmail = String(organismo.contactoEmail || '').trim();
  const documentosPDF = normalizarDocumentosPdf(organismo.documentosPDF, organismo.documentoPDF, organismo.nombre);

  return {
    ...organismo,
    regular: clasificacionOrganismo !== 'eventual',
    clasificacionOrganismo,
    porcentajeReparticion: normalizarPorcentajeReparticion(organismo.porcentajeReparticion),
    contactoCargo: contactoCargo || undefined,
    contactoTelefono: contactoTelefono || undefined,
    contactoCellulaire: contactoCellulaire || undefined,
    contactoEmail: contactoEmail || undefined,
    contactoJoursDisponibles: organismo.contactoJoursDisponibles || [],
    documentosPDF,
    documentoPDF: documentosPDF[0]?.contenido || null,
    claveAcceso: claveAcceso || undefined,
  };
}

function tieneClaveAccesoDuplicada(organismos: Organismo[], claveAcceso?: string, organismoId?: string): boolean {
  const claveNormalizada = normalizarClaveAcceso(claveAcceso || '');

  if (!claveNormalizada) {
    return false;
  }

  return organismos.some((organismo) => {
    if (organismoId && organismo.id === organismoId) {
      return false;
    }

    return normalizarClaveAcceso(organismo.claveAcceso || '') === claveNormalizada;
  });
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
    queueStorageSync(STORAGE_KEY);
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
      queueStorageSync(STORAGE_KEY);
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

  if (tieneClaveAccesoDuplicada(organismos, nuevoOrganismo.claveAcceso)) {
    throw new Error("La clé d'accès existe déjà pour un autre organisme");
  }

  organismos.push(nuevoOrganismo);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(organismos));
  queueStorageSync(STORAGE_KEY);
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

  if (tieneClaveAccesoDuplicada(organismos, organismoActualizado.claveAcceso, id)) {
    throw new Error("La clé d'accès existe déjà pour un autre organisme");
  }

  const organismosActualizados = [...organismos];
  organismosActualizados[index] = organismoActualizado;
  organismos[index] = organismoActualizado;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(organismos));
  queueStorageSync(STORAGE_KEY);
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
  queueStorageSync(STORAGE_KEY);
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
  const clavesExistentes = new Set(
    organismos
      .map(org => normalizarClaveAcceso(org.claveAcceso || ''))
      .filter(Boolean)
  );
  
  const organismosActualizados = organismos.map(org => {
    if (!org.claveAcceso) {
      actualizados++;
      const nuevaClave = generarClaveAccesoUnica(org.nombre, Array.from(clavesExistentes));
      clavesExistentes.add(normalizarClaveAcceso(nuevaClave));
      
      return {
        ...org,
        claveAcceso: nuevaClave
      };
    }
    return org;
  });
  
  if (actualizados > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(organismosActualizados));
    queueStorageSync(STORAGE_KEY);
    console.log(`✅ Migración completada: ${actualizados} organismos actualizados avec claves de acceso`);
  }
}