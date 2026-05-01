// 🔧 UTILIDADES DE DEBUGGING PARA BÉNÉVOLES
// Este archivo contiene funciones de utilidad para diagnosticar y corregir problemas con bénévoles

import { obtenerContactosDepartamento } from './contactosDepartamentoStorage';
import { obtenerDepartamentos } from './departamentosStorage';

/**
 * Diagnostica problemas con un bénévole específico
 * Muestra información detallada del bénévole y sus departamentos
 */
export function diagnosticarBenevole(email: string) {
  const benevoles = JSON.parse(localStorage.getItem('banqueAlimentaire_benevoles') || '[]');
  const contactos = obtenerContactosDepartamento();
  const departamentos = obtenerDepartamentos();
  
  const benevole = benevoles.find((b: any) => b.email.toLowerCase() === email.toLowerCase());
  const contactosBenevole = contactos.filter((c: any) => c.email.toLowerCase() === email.toLowerCase());
  
  console.group(`🔍 DIAGNÓSTICO BÉNÉVOLE: ${email}`);
  
  if (!benevole) {
    console.error('❌ Bénévole no encontrado en la lista de bénévoles');
  } else {
    console.log('✅ Bénévole encontrado:', {
      nombre: `${benevole.prenom} ${benevole.nom}`,
      departement: benevole.departement,
      tipo: typeof benevole.departement,
      isArray: Array.isArray(benevole.departement),
      statut: benevole.statut
    });
  }
  
  console.log(`📋 Contactos encontrados: ${contactosBenevole.length}`);
  contactosBenevole.forEach((contacto: any, index: number) => {
    const dept = departamentos.find((d: any) => d.id === contacto.departamentoId);
    console.log(`  ${index + 1}. Departamento ID: ${contacto.departamentoId}`);
    console.log(`     Nombre: ${dept ? dept.nombre : '❌ NO ENCONTRADO'}`);
    console.log(`     Activo: ${contacto.activo}`);
    console.log(`     Numero Archivo: ${contacto.numeroArchivo}`);
  });
  
  if (benevole && Array.isArray(benevole.departement)) {
    console.log(`🔍 Departamentos en bénévole (${benevole.departement.length}):`);
    benevole.departement.forEach((deptId: string, index: number) => {
      const dept = departamentos.find((d: any) => d.id === deptId);
      console.log(`  ${index + 1}. ID: ${deptId} → ${dept ? dept.nombre : '❌ NO ENCONTRADO'}`);
    });
  }
  
  console.groupEnd();
  
  return {
    benevole,
    contactos: contactosBenevole,
    departamentos: departamentos
  };
}

/**
 * Sincroniza los departamentos desde contactos al bénévole
 * Actualiza el campo departement del bénévole con los IDs de los departamentos de sus contactos
 */
export function sincronizarDepartamentosBenevole(email: string) {
  const benevoles = JSON.parse(localStorage.getItem('banqueAlimentaire_benevoles') || '[]');
  const contactos = obtenerContactosDepartamento();
  
  const benevoleIndex = benevoles.findIndex((b: any) => b.email.toLowerCase() === email.toLowerCase());
  
  if (benevoleIndex === -1) {
    console.error(`❌ Bénévole con email ${email} no encontrado`);
    return null;
  }
  
  const contactosBenevole = contactos.filter((c: any) => c.email.toLowerCase() === email.toLowerCase());
  
  if (contactosBenevole.length === 0) {
    console.error(`❌ No se encontraron contactos para ${email}`);
    return null;
  }
  
  // Extraer IDs únicos de departamentos
  const departamentosIds = [...new Set(contactosBenevole.map((c: any) => c.departamentoId))].filter(id => id && id !== '');
  
  console.log(`🔄 Sincronizando departamentos para ${benevoles[benevoleIndex].prenom} ${benevoles[benevoleIndex].nom}`);
  console.log(`   Departamentos anteriores:`, benevoles[benevoleIndex].departement);
  console.log(`   Departamentos nuevos:`, departamentosIds);
  
  // Actualizar el bénévole
  benevoles[benevoleIndex].departement = departamentosIds;
  
  // Guardar en localStorage
  localStorage.setItem('banqueAlimentaire_benevoles', JSON.stringify(benevoles));
  
  // Disparar evento de actualización
  window.dispatchEvent(new CustomEvent('benevoles-actualizados'));
  
  console.log(`✅ Departamentos sincronizados correctamente`);
  
  return benevoles[benevoleIndex];
}

/**
 * Sincroniza TODOS los bénévoles del sistema
 * Actualiza los departamentos de todos los bénévoles desde sus contactos
 */
export function sincronizarTodosLosBenevolesConContactos() {
  const benevoles = JSON.parse(localStorage.getItem('banqueAlimentaire_benevoles') || '[]');
  const contactos = obtenerContactosDepartamento();
  
  let actualizados = 0;
  
  console.group('🔄 SINCRONIZACIÓN MASIVA DE BÉNÉVOLES');
  
  const benevolesActualizados = benevoles.map((benevole: any) => {
    const contactosBenevole = contactos.filter((c: any) => 
      c.email.toLowerCase() === benevole.email.toLowerCase()
    );
    
    if (contactosBenevole.length > 0) {
      // Extraer IDs únicos de departamentos
      const departamentosIds = [...new Set(contactosBenevole.map((c: any) => c.departamentoId))]
        .filter(id => id && id !== '');
      
      // Verificar si hay cambios
      const hayaCambios = JSON.stringify(benevole.departement) !== JSON.stringify(departamentosIds);
      
      if (hayaCambios) {
        console.log(`  ✅ Actualizando ${benevole.prenom} ${benevole.nom}`);
        console.log(`     Anterior:`, benevole.departement);
        console.log(`     Nuevo:`, departamentosIds);
        actualizados++;
        
        return {
          ...benevole,
          departement: departamentosIds
        };
      }
    }
    
    return benevole;
  });
  
  // Guardar en localStorage
  localStorage.setItem('banqueAlimentaire_benevoles', JSON.stringify(benevolesActualizados));
  
  // Disparar evento de actualización
  window.dispatchEvent(new CustomEvent('benevoles-actualizados'));
  
  console.log(`✅ Sincronización completada: ${actualizados} bénévole(s) actualizado(s)`);
  console.groupEnd();
  
  return { actualizados, total: benevoles.length };
}

// Hacer las funciones disponibles globalmente en la consola del navegador
if (typeof window !== 'undefined') {
  (window as any).diagnosticarBenevole = diagnosticarBenevole;
  (window as any).sincronizarDepartamentosBenevole = sincronizarDepartamentosBenevole;
  (window as any).sincronizarTodosLosBenevolesConContactos = sincronizarTodosLosBenevolesConContactos;
  
  console.log(`
  🔧 UTILIDADES DE DEBUGGING DE BÉNÉVOLES CARGADAS:
  
  1. diagnosticarBenevole("email@example.com")
     → Muestra información detallada del bénévole y sus departamentos
  
  2. sincronizarDepartamentosBenevole("email@example.com")
     → Sincroniza los departamentos desde contactos al bénévole específico
  
  3. sincronizarTodosLosBenevolesConContactos()
     → Sincroniza TODOS los bénévoles con sus contactos
  
  Ejemplo para Yve:
    diagnosticarBenevole("yve@correo.com")
    sincronizarDepartamentosBenevole("yve@correo.com")
  `);
}
