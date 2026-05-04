/**
 * Sistema de almacenamiento para candidatos de recrutamiento
 * Guarda todos los candidatos con sus datos completos en localStorage
 */

import type {
  ContactoDepartamento,
  DisponibilidadDia,
  GeneroContacto,
  IdiomaContacto
} from './contactosDepartamentoStorage';

const STORAGE_KEY = 'banqueAlimentaire_candidatos_recrutement';

export interface FeuilleTiempoCandidato {
  id: number;
  departamentoId: string;
  departement: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  duree: number;
  notes: string;
  enCours?: boolean;
  correctionHistory?: HistorialCorreccionFeuilleTiempo[];
}

export interface HistorialCorreccionFeuilleTiempo {
  id: string;
  actor: string;
  timestamp: string;
  source: 'public' | 'internal';
  changes: string[];
}

export interface Candidato {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: 'pending' | 'reviewed' | 'interview' | 'accepted' | 'rejected';
  applicationDate: string;
  experience: string;
  availability: string;
  numeroArchivo?: string;
  adresse?: string;
  appartement?: string;
  ville?: string;
  codePostal?: string;
  quartier?: string; // ✅ Campo crítico que debe persistir
  departamentoIds?: string[];
  contactoId?: string;
  fechaNacimiento?: string;
  genero?: GeneroContacto;
  disponibilidades?: DisponibilidadDia[];
  idiomas?: IdiomaContacto[];
  certificaciones?: string[];
  foto?: string;
  documents?: ContactoDepartamento['documents'];
  feuillesTemps?: FeuilleTiempoCandidato[];
}

/**
 * Obtener todos los candidatos
 */
export function obtenerCandidatos(): Candidato[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const candidatos = JSON.parse(data);
      console.log('📋 Candidatos cargados desde localStorage:', candidatos.length);
      return candidatos;
    }
    
    // Si no hay datos, retornar candidatos iniciales
    const candidatosIniciales = getCandidatosIniciales();
    guardarCandidatos(candidatosIniciales);
    return candidatosIniciales;
  } catch (error) {
    console.error('❌ Error al leer candidatos:', error);
    return getCandidatosIniciales();
  }
}

/**
 * Guardar todos los candidatos
 * ✅ CRÍTICO: Esta función guarda TODOS los candidatos en localStorage sin perder ningún dato
 */
export function guardarCandidatos(candidatos: Candidato[]): void {
  try {
    // ✅ Serializar y guardar en localStorage
    const jsonData = JSON.stringify(candidatos);
    localStorage.setItem(STORAGE_KEY, jsonData);
    
    console.log('✅ Candidatos guardados en localStorage:', candidatos.length);
    
    // ✅ VERIFICACIÓN INMEDIATA: Leer los datos guardados para confirmar
    const verificacion = localStorage.getItem(STORAGE_KEY);
    if (verificacion) {
      const candidatosVerificados = JSON.parse(verificacion);
      
      // ✅ Verificar que el número de candidatos coincide
      if (candidatosVerificados.length !== candidatos.length) {
        console.error('⚠️ ADVERTENCIA: El número de candidatos guardados NO coincide!', {
          esperados: candidatos.length,
          guardados: candidatosVerificados.length
        });
      }
      
      // ✅ Verificar que los campos críticos se guardaron correctamente
      candidatos.forEach((candidato, index) => {
        const candidatoVerificado = candidatosVerificados.find((c: Candidato) => c.id === candidato.id);
        if (candidatoVerificado) {
          // Verificar campos críticos
          if (candidato.quartier && !candidatoVerificado.quartier) {
            console.error('⚠️ ADVERTENCIA: Se perdió el quartier del candidato:', candidato.id, candidato.name);
          }
          if (candidato.ville && !candidatoVerificado.ville) {
            console.error('⚠️ ADVERTENCIA: Se perdió la ville del candidato:', candidato.id, candidato.name);
          }
          if (candidato.adresse && !candidatoVerificado.adresse) {
            console.error('⚠️ ADVERTENCIA: Se perdió la adresse del candidato:', candidato.id, candidato.name);
          }
        } else {
          console.error('❌ ERROR: Candidato no encontrado después de guardar:', candidato.id, candidato.name);
        }
      });
      
      console.log('✅ Verificación exitosa: Todos los datos se guardaron correctamente');
    } else {
      console.error('❌ ERROR CRÍTICO: No se pudieron leer los datos después de guardar!');
    }
  } catch (error) {
    console.error('❌ Error al guardar candidatos:', error);
    throw error;
  }
}

/**
 * Agregar un nuevo candidato
 */
export function agregarCandidato(candidato: Omit<Candidato, 'id'>): Candidato {
  const candidatos = obtenerCandidatos();
  const maxId = candidatos.length > 0 ? Math.max(...candidatos.map(c => c.id)) : 0;
  
  const nuevoCandidato: Candidato = {
    ...candidato,
    id: maxId + 1
  };
  
  candidatos.push(nuevoCandidato);
  guardarCandidatos(candidatos);
  
  console.log('✅ Nuevo candidato agregado:', nuevoCandidato.id);
  return nuevoCandidato;
}

/**
 * Actualizar un candidato existente
 * ✅ CRÍTICO: Esta función PRESERVA todos los campos existentes y solo actualiza los que vienen en 'datos'
 */
export function actualizarCandidato(id: number, datos: Partial<Candidato>): Candidato | null {
  const candidatos = obtenerCandidatos();
  const index = candidatos.findIndex(c => c.id === id);
  
  if (index === -1) {
    console.error('❌ Candidato no encontrado:', id);
    return null;
  }
  
  // ✅ IMPORTANTE: Preservar TODOS los campos existentes antes de actualizar
  const candidatoAnterior = { ...candidatos[index] };
  
  // ✅ Actualizar el candidato preservando todos los campos existentes
  candidatos[index] = {
    ...candidatoAnterior,
    ...datos
  };
  
  // ✅ Guardar en localStorage inmediatamente
  guardarCandidatos(candidatos);
  
  // ✅ Verificar que la información se guardó correctamente
  const candidatosVerificacion = obtenerCandidatos();
  const candidatoVerificado = candidatosVerificacion.find(c => c.id === id);
  
  if (candidatoVerificado) {
    console.log('✅ Candidato actualizado y VERIFICADO en localStorage:', {
      id: candidatoVerificado.id,
      name: candidatoVerificado.name,
      email: candidatoVerificado.email,
      phone: candidatoVerificado.phone,
      position: candidatoVerificado.position,
      status: candidatoVerificado.status,
      experience: candidatoVerificado.experience,
      availability: candidatoVerificado.availability,
      adresse: candidatoVerificado.adresse || '[vacío]',
      appartement: candidatoVerificado.appartement || '[vacío]',
      ville: candidatoVerificado.ville || '[vacío]',
      codePostal: candidatoVerificado.codePostal || '[vacío]',
      quartier: candidatoVerificado.quartier || '[vacío]'
    });
    
    // ✅ Verificar campos críticos que NO deben perderse
    if (datos.quartier !== undefined && !candidatoVerificado.quartier) {
      console.error('⚠️ ADVERTENCIA: El campo quartier se perdió durante la actualización!');
    }
    if (datos.ville !== undefined && !candidatoVerificado.ville) {
      console.error('⚠️ ADVERTENCIA: El campo ville se perdió durante la actualización!');
    }
    if (datos.adresse !== undefined && !candidatoVerificado.adresse) {
      console.error('⚠️ ADVERTENCIA: El campo adresse se perdió durante la actualización!');
    }
  } else {
    console.error('❌ ERROR CRÍTICO: El candidato NO se encontró después de guardar!');
  }
  
  console.log('📊 Datos actualizados:', datos);
  
  return candidatos[index];
}

/**
 * Eliminar un candidato
 */
export function eliminarCandidato(id: number): boolean {
  const candidatos = obtenerCandidatos();
  const nuevosCandidatos = candidatos.filter(c => c.id !== id);
  
  if (nuevosCandidatos.length === candidatos.length) {
    console.error('❌ Candidato no encontrado para eliminar:', id);
    return false;
  }
  
  guardarCandidatos(nuevosCandidatos);
  console.log('✅ Candidato eliminado:', id);
  return true;
}

/**
 * Obtener candidatos iniciales (datos mock)
 */
function getCandidatosIniciales(): Candidato[] {
  return [
    {
      id: 1,
      name: 'Jean Tremblay',
      email: 'jean.tremblay@email.com',
      phone: '(514) 555-0101',
      position: 'Bénévole - Distribution',
      status: 'pending',
      applicationDate: '2024-02-08',
      experience: '2 ans d\'expérience en service communautaire',
      availability: 'Lundi, Mercredi, Vendredi',
      adresse: '123 Rue Saint-Denis',
      ville: 'Montréal',
      codePostal: 'H2X 1K8',
      quartier: 'Ville-Marie'
    },
    {
      id: 2,
      name: 'Marie Dubois',
      email: 'marie.dubois@email.com',
      phone: '(514) 555-0102',
      position: 'Coordinateur bénévole',
      status: 'reviewed',
      applicationDate: '2024-02-10',
      experience: '5 ans d\'expérience en gestion d\'équipe',
      availability: 'Temps plein',
      adresse: '456 Avenue du Parc',
      ville: 'Montréal',
      codePostal: 'H2W 2N7',
      quartier: 'Plateau-Mont-Royal'
    },
    {
      id: 3,
      name: 'Pierre Gagnon',
      email: 'pierre.gagnon@email.com',
      phone: '(514) 555-0103',
      position: 'Chauffeur bénévole',
      status: 'interview',
      applicationDate: '2024-02-12',
      experience: '3 ans comme chauffeur professionnel',
      availability: 'Mardi, Jeudi',
      adresse: '789 Boulevard René-Lévesque',
      ville: 'Montréal',
      codePostal: 'H3B 4W8',
      quartier: 'Centre-Ville'
    },
    {
      id: 4,
      name: 'Sophie Martin',
      email: 'sophie.martin@email.com',
      phone: '(514) 555-0104',
      position: 'Bénévole - Cuisine',
      status: 'accepted',
      applicationDate: '2024-02-15',
      experience: 'Diplômée en arts culinaires',
      availability: 'Mercredi, Vendredi, Samedi',
      adresse: '321 Rue Sherbrooke Est',
      ville: 'Montréal',
      codePostal: 'H2L 1K6',
      quartier: 'Hochelaga-Maisonneuve'
    },
    {
      id: 5,
      name: 'Luc Bergeron',
      email: 'luc.bergeron@email.com',
      phone: '(514) 555-0105',
      position: 'Bénévole - Entrepôt',
      status: 'rejected',
      applicationDate: '2024-02-18',
      experience: '1 an d\'expérience en logistique',
      availability: 'Flexible',
      adresse: '654 Avenue Papineau',
      ville: 'Montréal',
      codePostal: 'H2K 4J5',
      quartier: 'Centre-Sud'
    }
  ];
}

/**
 * Obtener estadísticas de candidatos
 */
export function obtenerEstadisticasCandidatos() {
  const candidatos = obtenerCandidatos();
  
  return {
    total: candidatos.length,
    pending: candidatos.filter(c => c.status === 'pending').length,
    reviewed: candidatos.filter(c => c.status === 'reviewed').length,
    interview: candidatos.filter(c => c.status === 'interview').length,
    accepted: candidatos.filter(c => c.status === 'accepted').length,
    rejected: candidatos.filter(c => c.status === 'rejected').length
  };
}
