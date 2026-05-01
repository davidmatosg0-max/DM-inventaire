/**
 * 🔄 SINCRONIZACIÓN AUTOMÁTICA DE VOLUNTARIOS A CONTACTOS ENTREPÔT
 * 
 * Este módulo sincroniza automáticamente todos los bénévoles (voluntarios)
 * que están asignados al departamento "Entrepôt" en la lista de reclutamiento
 * hacia la sección de Contactos del almacén.
 */

import { guardarContacto, obtenerContactosDepartamento, actualizarContacto, obtenerIdDepartamentoEntrepot, type ContactoDepartamento, type DisponibilidadDia } from './contactosDepartamentoStorage';
import { obtenerDepartamentos } from './departamentosStorage';

// Interfaz de Benevole (debe coincidir con la del componente Benevoles.tsx)
interface DisponibilidadDiaBenevole {
  jour: string;
  am: boolean;
  pm: boolean;
}

interface Benevole {
  id: number;
  identifiant: string;
  tipo?: 'benevole' | 'stagiaire' | 'employe' | 'coordinateur' | 'responsable' | 'autre';
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  departement: string | string[]; // String con departamentos separados por comas o array de departamentos
  disponibilites: string;
  disponibilidadesSemanal?: DisponibilidadDiaBenevole[];
  statut: 'actif' | 'inactif' | 'en pause' | 'en attente';
  heuresTotal: number;
  heuresMois: number;
  dateInscription: string;
  sexe?: 'Homme' | 'Femme' | 'Autre' | 'Non spécifié';
  dateNaissance?: string;
  langues?: string[];
  adresse?: string;
  ville?: string;
  codePostal?: string;
  quartier?: string;
  voiture?: boolean;
  notes?: any[];
  notasGenerales?: string;
  documents?: any[];
  photo?: string | null;
  poste?: string;
  heuresSemaines?: number;
  reference?: string;
  feuillesTemps?: any[];
  contactoEmergenciaNombre?: string;
  contactoEmergenciaRelacion?: string;
  contactoEmergenciaTelefono?: string;
  contactoEmergenciaEmail?: string;
}

const STORAGE_KEY_BENEVOLES = 'banqueAlimentaire_benevoles';

/**
 * Obtener todos los bénévoles desde localStorage
 */
function obtenerBenevoles(): Benevole[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_BENEVOLES);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('❌ Error al cargar bénévoles:', error);
  }
  return [];
}

/**
 * Verificar si un bénévole está asignado a Entrepôt
 */
function estaAsignadoAEntrepot(benevole: Benevole): boolean {
  if (!benevole.departement) return false;
  
  // ✅ CORRECCIÓN: Obtener departamentos del sistema y buscar por nombre
  const todosDepartamentos = obtenerDepartamentos();
  const departamentosEntrepot = todosDepartamentos.filter(dept =>
    dept.nombre.toLowerCase().includes('entrepôt') ||
    dept.nombre.toLowerCase().includes('entrepot') ||
    dept.nombre.toLowerCase().includes('almacén') ||
    dept.nombre.toLowerCase().includes('almacen') ||
    dept.nombre.toLowerCase().includes('warehouse')
  );
  
  // Si no existe un departamento llamado "Entrepôt", retornar false
  if (departamentosEntrepot.length === 0) {
    console.log('⚠️ No se encontró un departamento llamado "Entrepôt" en el sistema');
    return false;
  }
  
  // Obtener los IDs de los departamentos tipo Entrepôt
  const idsEntrepot = departamentosEntrepot.map(dept => dept.id);
  
  console.log('🔍 Departamentos Entrepôt encontrados:', {
    departamentos: departamentosEntrepot.map(d => ({ id: d.id, nombre: d.nombre })),
    ids: idsEntrepot
  });
  
  // 🔧 El campo departement puede ser string o array de IDs
  let departamentosDelBenevole: string[] = [];
  
  if (typeof benevole.departement === 'string') {
    // Si es string, dividir por comas
    departamentosDelBenevole = benevole.departement.split(',').map(d => d.trim());
  } else if (Array.isArray(benevole.departement)) {
    // Si es array, usar directamente
    departamentosDelBenevole = benevole.departement.map(d => String(d).trim());
  } else {
    // Si es otro tipo, convertir a string
    departamentosDelBenevole = [String(benevole.departement)];
  }
  
  console.log(`🔍 Verificando bénévole ${benevole.prenom} ${benevole.nom}:`, {
    departamentosAsignados: departamentosDelBenevole,
    idsEntrepot: idsEntrepot,
    estaEnEntrepot: departamentosDelBenevole.some(id => idsEntrepot.includes(id))
  });
  
  // Verificar si algún ID del bénévole coincide con algún ID de Entrepôt
  return departamentosDelBenevole.some(id => idsEntrepot.includes(id));
}

/**
 * Convertir disponibilidades de bénévole a formato de contacto
 */
function convertirDisponibilidades(benevole: Benevole): DisponibilidadDia[] {
  if (benevole.disponibilidadesSemanal && benevole.disponibilidadesSemanal.length > 0) {
    return benevole.disponibilidadesSemanal.map(d => ({
      jour: d.jour,
      am: d.am,
      pm: d.pm
    }));
  }
  
  // Si no tiene disponibilidades estructuradas, retornar array vacío
  return [];
}

/**
 * Mapear tipo de bénévole a tipo de contacto
 */
function mapearTipoBenevole(tipo?: string): 'benevole' | 'employe' {
  if (tipo === 'employe' || tipo === 'coordinateur' || tipo === 'responsable') {
    return 'employe';
  }
  return 'benevole';
}

/**
 * Convertir idiomas de bénévole a formato de contacto
 */
function convertirIdiomas(langues?: string[]): ('es' | 'fr' | 'en' | 'ar')[] {
  if (!langues || langues.length === 0) return ['fr'];
  
  const idiomasValidos: ('es' | 'fr' | 'en' | 'ar')[] = [];
  
  langues.forEach(lang => {
    const langLower = lang.toLowerCase();
    if (langLower.includes('fr') || langLower.includes('français')) {
      idiomasValidos.push('fr');
    } else if (langLower.includes('en') || langLower.includes('english') || langLower.includes('anglais')) {
      idiomasValidos.push('en');
    } else if (langLower.includes('es') || langLower.includes('español') || langLower.includes('espagnol')) {
      idiomasValidos.push('es');
    } else if (langLower.includes('ar') || langLower.includes('arabe') || langLower.includes('arabic')) {
      idiomasValidos.push('ar');
    }
  });
  
  // Si no se encontró ningún idioma válido, retornar francés por defecto
  return idiomasValidos.length > 0 ? idiomasValidos : ['fr'];
}

/**
 * Sincronizar un bénévole específico como contacto de Entrepôt
 */
function sincronizarBenevoleComoContacto(benevole: Benevole): boolean {
  try {
    const entrepotId = obtenerIdDepartamentoEntrepot();
    // Verificar si ya existe un contacto con el mismo email
    const contactosExistentes = obtenerContactosDepartamento();
    const contactoExistente = contactosExistentes.find(c => 
      c.email.toLowerCase() === benevole.email.toLowerCase()
    );
    
    const tipoContacto = mapearTipoBenevole(benevole.tipo);
    
    // 🔒 SI EL CONTACTO YA EXISTE EN OTRO DEPARTAMENTO, NO SOBRESCRIBIR
    if (contactoExistente) {
      // Verificar si ya está asignado a Entrepôt
      const departamentosActuales = Array.isArray(contactoExistente.departamentoIds) 
        ? contactoExistente.departamentoIds 
        : [contactoExistente.departamentoId];
      
      const yaEstaEnEntrepot = departamentosActuales.includes(entrepotId);
      
      if (yaEstaEnEntrepot) {
        console.log(`⚠️ Contacto ya existe en Entrepôt: ${benevole.prenom} ${benevole.nom} (${benevole.email}) - NO SE SOBRESCRIBE`);
        return false;
      } else {
        // Agregar Entrepôt a los departamentos existentes sin eliminar los otros
        console.log(`⚠️ Contacto existe en otros departamentos (${departamentosActuales.join(', ')}): ${benevole.prenom} ${benevole.nom} - NO SE SINCRONIZA AUTOMÁTICAMENTE`);
        console.log(`💡 Para asignar manualmente a Entrepôt, use el botón "Assigner" en el módulo Bénévoles`);
        return false;
      }
    }
    
    // Preparar datos del contacto SOLO SI NO EXISTE
    const datosContacto = {
      departamentoId: entrepotId,
      departamentoIds: [entrepotId],
      tipo: tipoContacto,
      nombre: benevole.prenom,
      apellido: benevole.nom,
      fechaNacimiento: benevole.dateNaissance,
      fechaInicio: benevole.dateInscription,
      genero: benevole.sexe || 'Non spécifié',
      email: benevole.email,
      telefono: benevole.telephone,
      cargo: benevole.poste || (tipoContacto === 'benevole' ? 'Bénévole Entrepôt' : 'Employé Entrepôt'),
      idiomas: convertirIdiomas(benevole.langues),
      disponibilidad: benevole.disponibilites,
      disponibilidades: convertirDisponibilidades(benevole),
      notas: benevole.notasGenerales || '',
      activo: benevole.statut === 'actif',
      fechaIngreso: benevole.dateInscription,
      foto: benevole.photo || undefined,
      direccion: benevole.adresse,
      ciudad: benevole.ville,
      codigoPostal: benevole.codePostal,
      numeroEmpleado: benevole.identifiant,
      horasSemaines: benevole.heuresSemaines,
      reference: benevole.reference,
      // Documentos (si existen)
      documents: benevole.documents?.map((doc: any) => ({
        nom: doc.nom || 'Document',
        tipo: doc.type || 'autre',
        tipoLabel: doc.nom || 'Autre',
        url: doc.url || '',
        date: doc.date || new Date().toISOString()
      }))
    };
    
    // Crear nuevo contacto solo si no existe
    guardarContacto(datosContacto as Omit<ContactoDepartamento, 'id'>);
    console.log(`✅ Nuevo contacto creado: ${benevole.prenom} ${benevole.nom} (${benevole.email})`);
    return true;
  } catch (error) {
    console.error(`❌ Error al sincronizar bénévole ${benevole.prenom} ${benevole.nom}:`, error);
    return false;
  }
}

/**
 * FUNCIÓN PRINCIPAL: Sincronizar todos los bénévoles de Entrepôt
 */
export function sincronizarVoluntariosEntrepot(): {
  total: number;
  sincronizados: number;
  errores: number;
  detalles: string[];
} {
  console.log('');
  console.log('🔄 ═══════════════════════════════════════════════════════════');
  console.log('🔄 SINCRONIZACIÓN DE VOLUNTARIOS ENTREPÔT → CONTACTOS');
  console.log('🔄 ═══════════════════════════════════════════════════════════');
  console.log('');
  
  const benevoles = obtenerBenevoles();
  const benevolesEntrepot = benevoles.filter(estaAsignadoAEntrepot);
  
  console.log(`📊 Total de bénévoles en sistema: ${benevoles.length}`);
  console.log(`📦 Bénévoles asignados a Entrepôt: ${benevolesEntrepot.length}`);
  
  // 🔒 VERIFICAR CONTACTOS EXISTENTES ANTES DE SINCRONIZAR
  const contactosExistentesAntes = obtenerContactosDepartamento();
  console.log(`📋 Contactos existentes en sistema: ${contactosExistentesAntes.length}`);
  console.log('');
  
  if (benevolesEntrepot.length === 0) {
    console.log('ℹ️ No hay bénévoles asignados a Entrepôt para sincronizar');
    console.log('✅ Contactos existentes preservados:', contactosExistentesAntes.length);
    console.log('');
    console.log('🔄 ═══════════════════════════════════════════════════════════');
    console.log('');
    return {
      total: 0,
      sincronizados: 0,
      errores: 0,
      detalles: ['No hay bénévoles asignados a Entrepôt']
    };
  }
  
  let sincronizados = 0;
  let errores = 0;
  const detalles: string[] = [];
  
  benevolesEntrepot.forEach((benevole, index) => {
    console.log(`🔄 [${index + 1}/${benevolesEntrepot.length}] Sincronizando: ${benevole.prenom} ${benevole.nom}`);
    
    const exitoso = sincronizarBenevoleComoContacto(benevole);
    
    if (exitoso) {
      sincronizados++;
      detalles.push(`✅ ${benevole.prenom} ${benevole.nom} (${benevole.email})`);
    } else {
      errores++;
      detalles.push(`❌ ${benevole.prenom} ${benevole.nom} (${benevole.email}) - Error`);
    }
  });
  
  // 🔒 VERIFICAR QUE NO SE PERDIERON CONTACTOS
  const contactosExistentesDespues = obtenerContactosDepartamento();
  console.log('');
  console.log('📊 RESUMEN DE SINCRONIZACIÓN:');
  console.log(`   Total procesados: ${benevolesEntrepot.length}`);
  console.log(`   ✅ Sincronizados exitosamente: ${sincronizados}`);
  console.log(`   ❌ Errores: ${errores}`);
  console.log(`   📋 Contactos antes: ${contactosExistentesAntes.length}`);
  console.log(`   📋 Contactos después: ${contactosExistentesDespues.length}`);
  console.log('');
  console.log('🔄 ═══════════════════════════════════════════════════════════');
  console.log('');
  
  return {
    total: benevolesEntrepot.length,
    sincronizados,
    errores,
    detalles
  };
}

/**
 * Ejecutar sincronización automática al cargar el módulo
 */
export function inicializarSincronizacionAutomatica(): void {
  // Ejecutar sincronización cada vez que cambie la lista de bénévoles
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY_BENEVOLES) {
      console.log('🔔 Cambio detectado en lista de bénévoles - Sincronizando...');
      sincronizarVoluntariosEntrepot();
    }
  });
  
  // 🔒 SINCRONIZACIÓN AUTOMÁTICA DESHABILITADA TEMPORALMENTE
  // La sincronización automática puede interferir con contactos agregados manualmente
  // Para ejecutar manualmente, usar: window.sincronizarVoluntariosEntrepot() en consola
  console.log('ℹ️ Sincronización automática de voluntarios Entrepôt: MANUAL');
  console.log('💡 Para sincronizar manualmente, ejecuta: window.sincronizarVoluntariosEntrepot()');
  
  // Comentado para evitar sobrescribir contactos manuales
  // setTimeout(() => {
  //   console.log('🚀 Ejecutando sincronización inicial de voluntarios Entrepôt...');
  //   sincronizarVoluntariosEntrepot();
  // }, 2000); // Esperar 2 segundos después de cargar para evitar conflictos
}

// Exportar funciones al objeto window para uso en consola
if (typeof window !== 'undefined') {
  (window as any).sincronizarVoluntariosEntrepot = sincronizarVoluntariosEntrepot;
  (window as any).inicializarSincronizacionAutomatica = inicializarSincronizacionAutomatica;
}