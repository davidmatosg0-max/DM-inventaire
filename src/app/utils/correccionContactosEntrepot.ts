import { obtenerDepartamentos } from './departamentosStorage';

/**
 * 🔧 CORRECCIÓN AUTOMÁTICA DE CONTACTOS - ASIGNACIÓN CORRECTA POR DEPARTAMENTO
 * 
 * Esta función se ejecuta al cargar la aplicación y corrige automáticamente:
 * 1. Contactos de Entrepôt (donador, fournisseur, transportista, partenaire) → departamentoId='2'
 * 2. Contactos de Comptoir (benevole, employe) → departamentoId='1'
 * 3. Activar contactos de Entrepôt por defecto
 * 
 * GARANTIZA la correcta asignación de departamentos:
 * - Entrepôt (ID='2'): donador, fournisseur, transportista, partenaire
 * - Comptoir (ID='1'): benevole, employe
 * - Contactos activos y disponibles en formularios
 */

export function corregirContactosEntrepotAutomaticamente(): void {
  const STORAGE_KEY = 'contactos_departamentos';
  const CORRECCION_VERSION_KEY = 'contactos_correccion_v3'; // v3 incluye corrección de bénévoles y employés
  const departamentos = obtenerDepartamentos();
  const entrepotId = departamentos.find((departamento) => departamento.codigo === 'ENTREPOT')?.id || '1';
  const comptoirId = departamentos.find((departamento) => departamento.codigo === 'COMPTOIR')?.id || '2';
  
  // Limpiar versiones anteriores para forzar la re-ejecución
  localStorage.removeItem('contactos_correccion_v1');
  localStorage.removeItem('contactos_correccion_v2');
  
  // Verificar si ya se ejecutó esta corrección
  const correccionRealizada = localStorage.getItem(CORRECCION_VERSION_KEY);
  if (correccionRealizada === 'true') {
    // Ya se ejecutó, no hacer nada
    return;
  }
  
  try {
    const contactosData = localStorage.getItem(STORAGE_KEY);
    if (!contactosData) {
      // No hay contactos, marcar como ejecutado y salir
      localStorage.setItem(CORRECCION_VERSION_KEY, 'true');
      return;
    }
    
    const contactos = JSON.parse(contactosData);
    let contactosCorregidos = 0;
    let contactosActivados = 0;
    
    const contactosActualizados = contactos.map((contacto: any) => {
      let modificado = false;
      const contactoNuevo = { ...contacto };
      
      // REGLA 1: Donadores, Fournisseurs, Transportistas y Partenaires van a Entrepôt
      if ((contacto.tipo === 'donador' || contacto.tipo === 'fournisseur' || 
           contacto.tipo === 'transportista' || contacto.tipo === 'partenaire') && 
          contacto.departamentoId !== entrepotId) {
        contactoNuevo.departamentoId = entrepotId;
        contactoNuevo.departamentoIds = [entrepotId];
        modificado = true;
        contactosCorregidos++;
        console.log(`✅ Corregido a Entrepôt: ${contacto.nombre} ${contacto.apellido} (${contacto.tipo})`);
      }
      
      // REGLA 2: Bénévoles y Employés van a Comptoir
      if ((contacto.tipo === 'benevole' || contacto.tipo === 'employe') && 
          contacto.departamentoId !== comptoirId) {
        contactoNuevo.departamentoId = comptoirId;
        contactoNuevo.departamentoIds = [comptoirId];
        modificado = true;
        contactosCorregidos++;
        console.log(`✅ Corregido a Comptoir: ${contacto.nombre} ${contacto.apellido} (${contacto.tipo})`);
      }
      
      // REGLA 3: Activar contactos donadores/fournisseurs si están inactivos
      if ((contacto.tipo === 'donador' || contacto.tipo === 'fournisseur') && 
          contacto.activo === false) {
        contactoNuevo.activo = true; // ✅ Activar por defecto
        modificado = true;
        contactosActivados++;
        console.log(`✅ Activado: ${contacto.nombre} ${contacto.apellido} (${contacto.tipo})`);
      }
      
      return contactoNuevo;
    });
    
    // Si hubo cambios, guardar
    if (contactosCorregidos > 0 || contactosActivados > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(contactosActualizados));
      console.log(`🔧 CORRECCIÓN AUTOMÁTICA APLICADA:`);
      console.log(`   • ${contactosCorregidos} contacto(s) con departamentoId corregido`);
      console.log(`   • ${contactosActivados} contacto(s) activado(s)`);
      
      // Disparar evento para sincronizar otros componentes
      window.dispatchEvent(new CustomEvent('contactos-restaurados', {
        detail: { departamentoId: entrepotId, auto: true }
      }));
    }
    
    // Marcar corrección como ejecutada
    localStorage.setItem(CORRECCION_VERSION_KEY, 'true');
    
  } catch (error) {
    console.error('❌ Error en corrección automática de contactos:', error);
    // Marcar como ejecutada para no intentar de nuevo si hay error
    localStorage.setItem(CORRECCION_VERSION_KEY, 'true');
  }
}

/**
 * 🛡️ VALIDACIÓN AL GUARDAR CONTACTOS
 * 
 * Valida y corrige automáticamente antes de guardar un contacto
 */
export function validarContactoEntrepot(contacto: any): any {
  const contactoValidado = { ...contacto };
  const departamentos = obtenerDepartamentos();
  const entrepotId = departamentos.find((departamento) => departamento.codigo === 'ENTREPOT')?.id || '1';
  const comptoirId = departamentos.find((departamento) => departamento.codigo === 'COMPTOIR')?.id || '2';
  
  // REGLA 1: Donadores, Fournisseurs, Transportistas y Partenaires van a Entrepôt
  if (contacto.tipo === 'donador' || contacto.tipo === 'fournisseur' || 
      contacto.tipo === 'transportista' || contacto.tipo === 'partenaire') {
    if (contacto.departamentoId !== entrepotId) {
      console.warn(`⚠️ Corrigiendo departamentoId: ${contacto.tipo} debe tener departamentoId='${entrepotId}' (Entrepôt)`);
      contactoValidado.departamentoId = entrepotId;
      contactoValidado.departamentoIds = [entrepotId];
    }
  }
  
  // REGLA 2: Bénévoles y Employés van a Comptoir
  if (contacto.tipo === 'benevole' || contacto.tipo === 'employe') {
    if (contacto.departamentoId !== comptoirId) {
      console.warn(`⚠️ Corrigiendo departamentoId: ${contacto.tipo} debe tener departamentoId='${comptoirId}' (Comptoir)`);
      contactoValidado.departamentoId = comptoirId;
      contactoValidado.departamentoIds = [comptoirId];
    }
  }
  
  // REGLA 3: Contactos de Entrepôt deben estar activos por defecto
  if ((contacto.tipo === 'donador' || contacto.tipo === 'fournisseur' || 
       contacto.tipo === 'transportista' || contacto.tipo === 'partenaire') && 
      contacto.activo === undefined) {
    contactoValidado.activo = true;
  }
  
  return contactoValidado;
}

/**
 * 📊 OBTENER ESTADÍSTICAS DE CONTACTOS ENTREPÔT
 * 
 * Para debugging y monitoreo
 */
export function obtenerEstadisticasContactosEntrepot(): {
  total: number;
  donadores: number;
  fournisseurs: number;
  donadoresActivos: number;
  fournisseursActivos: number;
  conDepartamentoIncorrecto: number;
} {
  const STORAGE_KEY = 'contactos_departamentos';
  const departamentos = obtenerDepartamentos();
  const entrepotId = departamentos.find((departamento) => departamento.codigo === 'ENTREPOT')?.id || '1';
  
  try {
    const contactosData = localStorage.getItem(STORAGE_KEY);
    if (!contactosData) {
      return {
        total: 0,
        donadores: 0,
        fournisseurs: 0,
        donadoresActivos: 0,
        fournisseursActivos: 0,
        conDepartamentoIncorrecto: 0
      };
    }
    
    const contactos = JSON.parse(contactosData);
    const donadores = contactos.filter((c: any) => c.tipo === 'donador');
    const fournisseurs = contactos.filter((c: any) => c.tipo === 'fournisseur');
    
    return {
      total: contactos.length,
      donadores: donadores.length,
      fournisseurs: fournisseurs.length,
      donadoresActivos: donadores.filter((c: any) => c.activo && c.departamentoId === entrepotId).length,
      fournisseursActivos: fournisseurs.filter((c: any) => c.activo && c.departamentoId === entrepotId).length,
      conDepartamentoIncorrecto: [...donadores, ...fournisseurs].filter((c: any) => c.departamentoId !== entrepotId).length
    };
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    return {
      total: 0,
      donadores: 0,
      fournisseurs: 0,
      donadoresActivos: 0,
      fournisseursActivos: 0,
      conDepartamentoIncorrecto: 0
    };
  }
}
