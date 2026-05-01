/**
 * 🔧 HERRAMIENTA DE DEBUGGING PARA CONTACTOS DE DEPARTAMENTOS
 * 
 * Funciones de consola para diagnosticar problemas de filtrado en la gestión de contactos
 */

import { obtenerContactosDepartamento, obtenerContactosPorDepartamento } from './contactosDepartamentoStorage';
import { obtenerDepartamentos } from './departamentosStorage';

function crearMapaDepartamentos() {
  return obtenerDepartamentos().reduce((acc, departamento) => {
    acc[departamento.id] = departamento.nombre;
    return acc;
  }, {} as Record<string, string>);
}

function obtenerIdDepartamentoPorNombre(nombre: string) {
  const nombreNormalizado = nombre.trim().toLowerCase();
  return obtenerDepartamentos().find((departamento) => departamento.nombre.trim().toLowerCase() === nombreNormalizado)?.id;
}

/**
 * Ver todos los contactos del sistema con sus departamentos asignados
 */
export function debugTodosLosContactos() {
  const contactos = obtenerContactosDepartamento();
  
  console.group('📋 TODOS LOS CONTACTOS DEL SISTEMA');
  console.log(`Total de contactos: ${contactos.length}`);
  console.log('');
  
  // Agrupar por departamento
  const porDepartamento: { [key: string]: any[] } = {};
  
  contactos.forEach(contacto => {
    const depts = contacto.departamentoIds || [contacto.departamentoId];
    
    depts.forEach(deptId => {
      if (!porDepartamento[deptId]) {
        porDepartamento[deptId] = [];
      }
      
      porDepartamento[deptId].push({
        nombre: `${contacto.nombre} ${contacto.apellido}`,
        email: contacto.email,
        tipo: contacto.tipo,
        activo: contacto.activo,
        departamentoId: contacto.departamentoId,
        departamentoIds: contacto.departamentoIds
      });
    });
  });
  
  // Mostrar por departamento
  const nombresDepartamentos = crearMapaDepartamentos();
  
  Object.keys(porDepartamento).sort().forEach(deptId => {
    const nombreDept = nombresDepartamentos[deptId] || `Departamento ${deptId}`;
    const contactosDept = porDepartamento[deptId];
    
    console.group(`📁 ${nombreDept} (ID: ${deptId}) - ${contactosDept.length} contacto(s)`);
    
    contactosDept.forEach(c => {
      console.log(`  👤 ${c.nombre}`);
      console.log(`     Email: ${c.email}`);
      console.log(`     Tipo: ${c.tipo}`);
      console.log(`     Activo: ${c.activo ? '✅' : '❌'}`);
      console.log(`     Dept Principal: ${c.departamentoId}`);
      console.log(`     Todos los Depts: [${c.departamentoIds?.join(', ') || c.departamentoId}]`);
      console.log('');
    });
    
    console.groupEnd();
  });
  
  console.groupEnd();
}

/**
 * Ver contactos de un departamento específico
 */
export function debugContactosDepartamento(departamentoId: string) {
  const contactos = obtenerContactosPorDepartamento(departamentoId);
  
  const nombresDepartamentos: { [key: string]: string } = {
    '1': 'Direction',
    '2': 'Entrepôt',
    '3': 'Achats',
    '4': 'Comptoir',
    '5': 'Finance',
    '6': 'Communication',
    '7': 'Recrutement',
    '8': 'Transport',
    '9': 'Qualité',
    '10': 'IT'
  };
  
  const nombreDept = nombresDepartamentos[departamentoId] || `Departamento ${departamentoId}`;
  
  console.group(`📋 CONTACTOS DE ${nombreDept} (ID: ${departamentoId})`);
  console.log(`Total de contactos: ${contactos.length}`);
  console.log('');
  
  contactos.forEach((c, index) => {
    console.log(`${index + 1}. ${c.nombre} ${c.apellido}`);
    console.log(`   Email: ${c.email}`);
    console.log(`   Tipo: ${c.tipo}`);
    console.log(`   Activo: ${c.activo ? '✅' : '❌'}`);
    console.log(`   Dept Principal: ${c.departamentoId}`);
    console.log(`   Todos los Depts: [${c.departamentoIds?.join(', ') || c.departamentoId}]`);
    console.log('');
  });
  
  console.groupEnd();
}

/**
 * Ver estadísticas de contactos por departamento
 */
export function debugEstadisticasContactos() {
  const contactos = obtenerContactosDepartamento();
  
  console.group('📊 ESTADÍSTICAS DE CONTACTOS');
  
  const nombresDepartamentos: { [key: string]: string } = {
    '1': 'Direction',
    '2': 'Entrepôt',
    '3': 'Achats',
    '4': 'Comptoir',
    '5': 'Finance',
    '6': 'Communication',
    '7': 'Recrutement',
    '8': 'Transport',
    '9': 'Qualité',
    '10': 'IT'
  };
  
  Object.keys(nombresDepartamentos).forEach(deptId => {
    const contactosDept = obtenerContactosPorDepartamento(deptId);
    const activos = contactosDept.filter(c => c.activo).length;
    const inactivos = contactosDept.filter(c => !c.activo).length;
    const benevoles = contactosDept.filter(c => c.tipo === 'benevole').length;
    
    console.log(`${nombresDepartamentos[deptId]}: ${contactosDept.length} total (${activos} activos, ${inactivos} inactivos, ${benevoles} bénévoles)`);
  });
  
  console.groupEnd();
}

/**
 * Comparar bénévoles del módulo principal con contactos de un departamento
 */
export function debugCompararBenevolesConContactos(departamentoId: string) {
  const contactos = obtenerContactosPorDepartamento(departamentoId);
  const benevolesRaw = localStorage.getItem('banqueAlimentaire_benevoles');
  
  if (!benevolesRaw) {
    console.error('❌ No se encontraron bénévoles en localStorage');
    return;
  }
  
  const benevoles = JSON.parse(benevolesRaw);
  
  const nombresDepartamentos: { [key: string]: string } = {
    '1': 'Direction',
    '2': 'Entrepôt',
    '3': 'Achats',
    '4': 'Comptoir',
    '5': 'Finance',
    '6': 'Communication',
    '7': 'Recrutement',
    '8': 'Transport',
    '9': 'Qualité',
    '10': 'IT'
  };
  
  const nombreDept = nombresDepartamentos[departamentoId] || `Departamento ${departamentoId}`;
  
  console.group(`🔍 COMPARACIÓN: Bénévoles vs Contactos de ${nombreDept}`);
  
  console.log(`📊 Total bénévoles en módulo principal: ${benevoles.length}`);
  console.log(`📊 Total contactos en ${nombreDept}: ${contactos.length}`);
  console.log('');
  
  // Bénévoles que deberían estar en este departamento
  const benevolesDelDept = benevoles.filter((b: any) => {
    let departamentosAsignados: string[] = [];
    if (Array.isArray(b.departement)) {
      departamentosAsignados = b.departement;
    } else if (typeof b.departement === 'string') {
      departamentosAsignados = b.departement.split(',').map((d: string) => d.trim());
    }
    
    return departamentosAsignados.some(d => d === departamentoId || obtenerIdDepartamentoPorNombre(d) === departamentoId);
  });
  
  console.log(`📋 Bénévoles asignados a ${nombreDept}: ${benevolesDelDept.length}`);
  benevolesDelDept.forEach((b: any) => {
    const enContactos = contactos.find(c => c.email?.toLowerCase() === b.email?.toLowerCase());
    console.log(`  ${enContactos ? '✅' : '❌'} ${b.prenom} ${b.nom} (${b.email})`);
    if (!enContactos) {
      console.log(`     ⚠️ No está en contactos de ${nombreDept}`);
    }
  });
  
  console.log('');
  console.log(`📋 Contactos en ${nombreDept}:`);
  contactos.forEach(c => {
    const esBenevole = benevoles.find((b: any) => b.email?.toLowerCase() === c.email?.toLowerCase());
    console.log(`  ${esBenevole ? '✅' : '⚠️'} ${c.nombre} ${c.apellido} (${c.email})`);
    if (!esBenevole) {
      console.log(`     ℹ️ No encontrado en módulo de bénévoles`);
    }
  });
  
  console.groupEnd();
}

// Registrar funciones globalmente para uso en consola
if (typeof window !== 'undefined') {
  (window as any).debugContactos = {
    todos: debugTodosLosContactos,
    departamento: debugContactosDepartamento,
    estadisticas: debugEstadisticasContactos,
    comparar: debugCompararBenevolesConContactos
  };
  
  console.log('🔧 Herramientas de debug de contactos disponibles:');
  console.log('  debugContactos.todos() - Ver todos los contactos');
  console.log('  debugContactos.departamento("7") - Ver contactos de un departamento');
  console.log('  debugContactos.estadisticas() - Ver estadísticas');
  console.log('  debugContactos.comparar("7") - Comparar bénévoles con contactos');
}
