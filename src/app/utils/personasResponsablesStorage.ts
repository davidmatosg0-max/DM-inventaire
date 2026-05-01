/**
 * Gestión de Personas Responsables para Organismos
 * Sistema de almacenamiento de contactos autorizados para recoger comandas
 */

export interface JourDisponible {
  jour: string;
  horaire: 'AM' | 'PM' | 'AM/PM' | null;
}

export type IdiomaPersona = 'es' | 'fr' | 'en' | 'ar';

export interface PersonaResponsable {
  id: string;
  organismoId: string;
  nombreCompleto: string;
  telefono: string;
  email: string;
  cargo?: string;
  idiomas?: IdiomaPersona[];
  notas?: string;
  activo: boolean;
  esPrincipal: boolean; // Indica si es el contacto principal
  fechaCreacion: string;
  fechaActualizacion: string;
  joursDisponibles?: JourDisponible[]; // Días y horarios disponibles para recoger comandas
}

const STORAGE_KEY = 'personas_responsables';

/**
 * Obtener todas las personas responsables
 */
export function obtenerPersonasResponsables(): PersonaResponsable[] {
  if (typeof window === 'undefined') return [];
  
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return [];
  
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al parsear personas responsables:', error);
    return [];
  }
}

/**
 * Obtener personas responsables de un organismo específico
 */
export function obtenerPersonasPorOrganismo(organismoId: string): PersonaResponsable[] {
  const todasLasPersonas = obtenerPersonasResponsables();
  return todasLasPersonas.filter(p => p.organismoId === organismoId && p.activo);
}

/**
 * Obtener persona principal de un organismo
 */
export function obtenerPersonaPrincipal(organismoId: string): PersonaResponsable | null {
  const personas = obtenerPersonasPorOrganismo(organismoId);
  return personas.find(p => p.esPrincipal) || personas[0] || null;
}

/**
 * Guardar una persona responsable
 */
export function guardarPersonaResponsable(persona: Omit<PersonaResponsable, 'id' | 'fechaCreacion' | 'fechaActualizacion'>): PersonaResponsable {
  const personas = obtenerPersonasResponsables();
  
  const nuevaPersona: PersonaResponsable = {
    ...persona,
    id: `persona-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString()
  };
  
  // Si es principal, quitar el flag de las demás del mismo organismo
  if (nuevaPersona.esPrincipal) {
    personas.forEach(p => {
      if (p.organismoId === nuevaPersona.organismoId && p.esPrincipal) {
        p.esPrincipal = false;
      }
    });
  }
  
  personas.push(nuevaPersona);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(personas));
  
  return nuevaPersona;
}

/**
 * Actualizar una persona responsable
 */
export function actualizarPersonaResponsable(id: string, datos: Partial<PersonaResponsable>): boolean {
  const personas = obtenerPersonasResponsables();
  const index = personas.findIndex(p => p.id === id);
  
  if (index === -1) return false;
  
  const personaActualizada = {
    ...personas[index],
    ...datos,
    fechaActualizacion: new Date().toISOString()
  };
  
  // Si se marca como principal, quitar el flag de las demás
  if (datos.esPrincipal) {
    personas.forEach((p, i) => {
      if (i !== index && p.organismoId === personaActualizada.organismoId && p.esPrincipal) {
        p.esPrincipal = false;
      }
    });
  }
  
  personas[index] = personaActualizada;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(personas));
  
  return true;
}

/**
 * Eliminar una persona responsable (desactivar)
 */
export function eliminarPersonaResponsable(id: string): boolean {
  const personas = obtenerPersonasResponsables();
  const index = personas.findIndex(p => p.id === id);
  
  if (index === -1) return false;
  
  // No eliminar físicamente, solo desactivar
  personas[index].activo = false;
  personas[index].fechaActualizacion = new Date().toISOString();
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(personas));
  
  return true;
}

/**
 * Marcar una persona como principal
 */
export function marcarComoPrincipal(id: string): boolean {
  const personas = obtenerPersonasResponsables();
  const persona = personas.find(p => p.id === id);
  
  if (!persona) return false;
  
  // Quitar el flag de principal de las demás del mismo organismo
  personas.forEach(p => {
    if (p.organismoId === persona.organismoId) {
      p.esPrincipal = (p.id === id);
      p.fechaActualizacion = new Date().toISOString();
    }
  });
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(personas));
  
  return true;
}

/**
 * Limpiar personas duplicadas (por si acaso)
 */
export function limpiarPersonasDuplicadas(): void {
  const personas = obtenerPersonasResponsables();
  const personasUnicas: PersonaResponsable[] = [];
  const idsVistos = new Set<string>();
  
  personas.forEach(persona => {
    if (!idsVistos.has(persona.id)) {
      idsVistos.add(persona.id);
      personasUnicas.push(persona);
    }
  });
  
  if (personasUnicas.length !== personas.length) {
    console.warn(`Se encontraron ${personas.length - personasUnicas.length} personas duplicadas. Limpiando...`);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(personasUnicas));
  }
}

/**
 * Inicializar personas de ejemplo (solo para desarrollo)
 */
export function inicializarPersonasEjemplo(organismoId: string, nombreOrganismo: string, responsableOrganismo: string): void {
  const personasExistentes = obtenerPersonasPorOrganismo(organismoId);
  
  // Solo inicializar si no hay personas para este organismo
  if (personasExistentes.length === 0) {
    guardarPersonaResponsable({
      organismoId,
      nombreCompleto: responsableOrganismo,
      telefono: '(514) 555-0100',
      email: `contacto@${nombreOrganismo.toLowerCase().replace(/ /g, '')}.org`,
      cargo: 'Responsable Principal',
      notas: 'Contacto principal del organismo',
      activo: true,
      esPrincipal: true
    });
  }
}

/**
 * Inicializar personas responsables completas para todos los organismos de ejemplo
 */
export function inicializarPersonasEjemploCompletas(): void {
  const todasLasPersonas = obtenerPersonasResponsables();
  
  // Solo inicializar si no hay personas registradas
  if (todasLasPersonas.length > 0) {
    console.log('Ya existen personas responsables en el sistema');
    return;
  }

  const fechaActual = new Date().toISOString();
  
  // Personas para cada organismo de ejemplo
  const personasEjemplo: Omit<PersonaResponsable, 'id' | 'fechaCreacion' | 'fechaActualizacion'>[] = [
    // Salle Communautaire Saint-Joseph (id: '1')
    {
      organismoId: '1',
      nombreCompleto: 'Jean-Pierre Lafleur',
      telefono: '(514) 555-1001',
      email: 'jp.lafleur@saintjoseph.org',
      cargo: 'Coordinateur de Logistique',
      notas: 'Autorizado para recoger comandas. Disponible de lunes a viernes 9h-17h',
      activo: true,
      esPrincipal: true,
      joursDisponibles: [
        { jour: 'Lundi', horaire: 'AM/PM' },
        { jour: 'Mardi', horaire: 'AM/PM' },
        { jour: 'Mercredi', horaire: 'AM/PM' },
        { jour: 'Jeudi', horaire: 'AM/PM' },
        { jour: 'Vendredi', horaire: 'AM/PM' }
      ]
    },
    {
      organismoId: '1',
      nombreCompleto: 'Marie-Claude Bouchard',
      telefono: '(514) 555-1002',
      email: 'mc.bouchard@saintjoseph.org',
      cargo: 'Assistante Administrative',
      notas: 'Contacto secundario. Disponible martes y jueves',
      activo: true,
      esPrincipal: false,
      joursDisponibles: [
        { jour: 'Mardi', horaire: 'AM/PM' },
        { jour: 'Jeudi', horaire: 'PM' }
      ]
    },
    
    // Fondation Espoir (id: '2')
    {
      organismoId: '2',
      nombreCompleto: 'Robert Bélanger',
      telefono: '(514) 555-2001',
      email: 'r.belanger@fondationespoir.org',
      cargo: 'Directeur Général',
      notas: 'Responsable principal. Autorizado para todas las comandas',
      activo: true,
      esPrincipal: true
    },
    {
      organismoId: '2',
      nombreCompleto: 'Sophie Gagnon',
      telefono: '(514) 555-2002',
      email: 's.gagnon@fondationespoir.org',
      cargo: 'Coordinatrice des Services',
      notas: 'Contacto alternativo. Disponible lunes, miércoles y viernes',
      activo: true,
      esPrincipal: false
    },
    {
      organismoId: '2',
      nombreCompleto: 'Marc Tremblay',
      telefono: '(514) 555-2003',
      email: 'm.tremblay@fondationespoir.org',
      cargo: 'Responsable d\'Entrepôt',
      notas: 'Encargado de recepción de mercancía',
      activo: true,
      esPrincipal: false
    },
    
    // Foyer pour Enfants La Paix (id: '3')
    {
      organismoId: '3',
      nombreCompleto: 'Laura Gagnon',
      telefono: '(514) 555-3001',
      email: 'l.gagnon@foyerlapaix.org',
      cargo: 'Directrice',
      notas: 'Contacto principal del foyer. Disponible todos los días',
      activo: true,
      esPrincipal: true
    },
    {
      organismoId: '3',
      nombreCompleto: 'François Dubois',
      telefono: '(514) 555-3002',
      email: 'f.dubois@foyerlapaix.org',
      cargo: 'Chef de Cuisine',
      notas: 'Responsable de cocina. Prefiere recibir comandas por la mañana',
      activo: true,
      esPrincipal: false
    },
    
    // Centre Communautaire Le Chêne (id: '4')
    {
      organismoId: '4',
      nombreCompleto: 'Michel Dubois',
      telefono: '(514) 555-4001',
      email: 'm.dubois@centrelechene.org',
      cargo: 'Directeur du Centre',
      notas: 'Responsable principal. Autorizado para firmar documentos',
      activo: true,
      esPrincipal: true
    },
    {
      organismoId: '4',
      nombreCompleto: 'Isabelle Morin',
      telefono: '(514) 555-4002',
      email: 'i.morin@centrelechene.org',
      cargo: 'Coordonnatrice de Programmes',
      notas: 'Contacto secundario. Disponible de 10h a 18h',
      activo: true,
      esPrincipal: false
    },
    {
      organismoId: '4',
      nombreCompleto: 'Pierre Lefebvre',
      telefono: '(514) 555-4003',
      email: 'p.lefebvre@centrelechene.org',
      cargo: 'Bénévole Senior',
      notas: 'Voluntario de confianza. Puede recoger en emergencias',
      activo: true,
      esPrincipal: false
    },
    
    // Aide aux Personnes Âgées (id: '5')
    {
      organismoId: '5',
      nombreCompleto: 'Chantal Levesque',
      telefono: '(514) 555-5001',
      email: 'c.levesque@aidepersonnesagees.org',
      cargo: 'Coordinatrice Générale',
      notas: 'Contacto principal. Prefiere notificaciones por email',
      activo: true,
      esPrincipal: true
    },
    {
      organismoId: '5',
      nombreCompleto: 'Daniel Rousseau',
      telefono: '(514) 555-5002',
      email: 'd.rousseau@aidepersonnesagees.org',
      cargo: 'Chauffeur et Livreur',
      notas: 'Encargado de transporte. Disponible lunes a viernes',
      activo: true,
      esPrincipal: false
    }
  ];

  // Guardar todas las personas
  personasEjemplo.forEach(persona => {
    guardarPersonaResponsable(persona);
  });

  console.log(`✅ Se crearon ${personasEjemplo.length} personas responsables de ejemplo`);
}