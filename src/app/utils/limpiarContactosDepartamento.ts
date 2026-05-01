/**
 * 🧹 LIMPIEZA DE CONTACTOS DE DEPARTAMENTOS
 * 
 * Funciones para limpiar contactos que no deberían estar en ciertos departamentos
 */

import { obtenerContactosDepartamento, actualizarContacto, eliminarContacto } from './contactosDepartamentoStorage';
import { obtenerDepartamentos } from './departamentosStorage';

function obtenerIdDepartamentoPorNombre(nombre: string) {
  const nombreNormalizado = nombre.trim().toLowerCase();
  return obtenerDepartamentos().find((departamento) => departamento.nombre.trim().toLowerCase() === nombreNormalizado)?.id;
}

/**
 * Limpiar contactos duplicados o mal asignados en departamentos específicos
 */
export function limpiarContactosDepartamentoEspecifico(departamentoId: string): {
  eliminados: number;
  actualizados: number;
  mantenidos: number;
} {
  const todosContactos = obtenerContactosDepartamento();
  
  let eliminados = 0;
  let actualizados = 0;
  let mantenidos = 0;
  
  console.group(`🧹 LIMPIEZA DE CONTACTOS - Departamento ${departamentoId}`);
  
  todosContactos.forEach(contacto => {
    // Verificar si el contacto tiene el departamento en su lista
    const tieneDepartamento = contacto.departamentoIds?.includes(departamentoId) || 
                              contacto.departamentoId === departamentoId;
    
    if (tieneDepartamento) {
      // Verificar si el contacto existe en el módulo de bénévoles
      const benevolesRaw = localStorage.getItem('banqueAlimentaire_benevoles');
      
      if (benevolesRaw && contacto.tipo === 'benevole') {
        const benevoles = JSON.parse(benevolesRaw);
        const benevoleCorrespondiente = benevoles.find((b: any) => 
          b.email?.toLowerCase() === contacto.email?.toLowerCase()
        );
        
        if (benevoleCorrespondiente) {
          // Verificar si el bénévole tiene asignado este departamento
          let departamentosAsignados: string[] = [];
          if (Array.isArray(benevoleCorrespondiente.departement)) {
            departamentosAsignados = benevoleCorrespondiente.departement;
          } else if (typeof benevoleCorrespondiente.departement === 'string') {
            departamentosAsignados = benevoleCorrespondiente.departement.split(',').map((d: string) => d.trim());
          }
          
          const tieneDepartamentoEnBenevoles = departamentosAsignados.some(d => 
            d === departamentoId || obtenerIdDepartamentoPorNombre(d) === departamentoId
          );
          
          if (!tieneDepartamentoEnBenevoles) {
            // El contacto NO debería estar en este departamento
            console.log(`  ❌ ${contacto.nombre} ${contacto.apellido} - NO asignado a este departamento en módulo bénévoles`);
            
            // Remover el departamento de la lista
            let nuevosDepartamentos = contacto.departamentoIds?.filter(d => d !== departamentoId) || [];
            
            if (nuevosDepartamentos.length === 0) {
              // Si no tiene más departamentos, eliminar el contacto
              console.log(`    🗑️ Eliminando contacto (sin departamentos restantes)`);
              eliminados++;
            } else {
              // Actualizar con los departamentos restantes
              actualizarContacto(contacto.id, {
                departamentoIds: nuevosDepartamentos,
                departamentoId: nuevosDepartamentos[0]
              });
              console.log(`    ✏️ Actualizado - Departamentos restantes: [${nuevosDepartamentos.join(', ')}]`);
              actualizados++;
            }
          } else {
            console.log(`  ✅ ${contacto.nombre} ${contacto.apellido} - Correctamente asignado`);
            mantenidos++;
          }
        } else {
          console.log(`  ⚠️ ${contacto.nombre} ${contacto.apellido} - No encontrado en módulo bénévoles`);
          mantenidos++;
        }
      } else {
        console.log(`  ℹ️ ${contacto.nombre} ${contacto.apellido} - No es bénévole o no hay módulo cargado`);
        mantenidos++;
      }
    }
  });
  
  console.log('');
  console.log('📊 RESUMEN:');
  console.log(`  ✅ Mantenidos: ${mantenidos}`);
  console.log(`  ✏️ Actualizados: ${actualizados}`);
  console.log(`  ❌ Eliminados: ${eliminados}`);
  console.groupEnd();
  
  return { eliminados, actualizados, mantenidos };
}

/**
 * Mostrar contactos de un departamento sin el módulo principal
 */
export function mostrarContactosDepartamento(departamentoId: string) {
  const todosContactos = obtenerContactosDepartamento();
  
  const contactosDept = todosContactos.filter(c => 
    c.departamentoIds?.includes(departamentoId) || c.departamentoId === departamentoId
  );
  
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
  
  console.group(`📋 CONTACTOS DE ${nombreDept} (${contactosDept.length})`);
  
  contactosDept.forEach((c, i) => {
    console.log(`${i + 1}. ${c.nombre} ${c.apellido} (${c.tipo})`);
    console.log(`   Departamentos: [${c.departamentoIds?.join(', ') || c.departamentoId}]`);
    console.log(`   Email: ${c.email}`);
    console.log(`   Activo: ${c.activo ? '✅' : '❌'}`);
  });
  
  console.groupEnd();
}

// Registrar funciones globalmente
if (typeof window !== 'undefined') {
  (window as any).limpiarContactosDept = limpiarContactosDepartamentoEspecifico;
  (window as any).mostrarContactosDept = mostrarContactosDepartamento;
  
  console.log('🧹 Funciones de limpieza de contactos disponibles:');
  console.log('  limpiarContactosDept("7") - Limpiar contactos de Recrutamiento');
  console.log('  mostrarContactosDept("7") - Ver contactos de Recrutamiento');
}
