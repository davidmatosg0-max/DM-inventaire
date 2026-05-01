/**
 * 🐛 SCRIPT DE DEBUG PARA SINCRONIZACIÓN
 * 
 * Funciones de utilidad para depurar la sincronización de voluntarios
 */

import { obtenerIdDepartamentoEntrepot } from './contactosDepartamentoStorage';

export function debugBenevoles() {
  console.log('');
  console.log('🐛 ═══════════════════════════════════════════════════════════');
  console.log('🐛 DEBUG: BÉNÉVOLES EN LOCALSTORAGE');
  console.log('🐛 ═══════════════════════════════════════════════════════════');
  console.log('');
  
  const stored = localStorage.getItem('banqueAlimentaire_benevoles');
  
  if (!stored) {
    console.log('❌ No hay bénévoles en localStorage (clave: banqueAlimentaire_benevoles)');
    console.log('');
    console.log('🐛 ═══════════════════════════════════════════════════════════');
    console.log('');
    return;
  }
  
  try {
    const benevoles = JSON.parse(stored);
    console.log(`📊 Total de bénévoles: ${benevoles.length}`);
    console.log('');
    
    if (benevoles.length === 0) {
      console.log('ℹ️ No hay bénévoles en el sistema');
      console.log('');
      console.log('🐛 ═══════════════════════════════════════════════════════════');
      console.log('');
      return;
    }
    
    benevoles.forEach((b: any, index: number) => {
      const deptType = typeof b.departement;
      const deptValue = Array.isArray(b.departement) 
        ? `[${b.departement.join(', ')}]` 
        : `"${b.departement}"`;
      
      console.log(`[${index + 1}] ${b.prenom} ${b.nom}`);
      console.log(`    Email: ${b.email}`);
      console.log(`    Departement (${deptType}): ${deptValue}`);
      console.log(`    Statut: ${b.statut}`);
      console.log('');
    });
    
    // Verificar cuáles están asignados a Entrepôt
    const benevolesEntrepot = benevoles.filter((b: any) => {
      if (!b.departement) return false;
      
      let departamentos: string[] = [];
      
      if (typeof b.departement === 'string') {
        departamentos = b.departement.split(',').map((d: string) => d.trim().toLowerCase());
      } else if (Array.isArray(b.departement)) {
        departamentos = b.departement.map((d: any) => String(d).trim().toLowerCase());
      } else {
        departamentos = [String(b.departement).toLowerCase()];
      }
      
      return departamentos.some((dept: string) => 
        dept.includes('entrepôt') || 
        dept.includes('entrepot') || 
        dept.includes('almacén') ||
        dept.includes('almacen') ||
        dept.includes('warehouse')
      );
    });
    
    console.log('📦 BÉNÉVOLES ASIGNADOS A ENTREPÔT:');
    console.log(`   Total: ${benevolesEntrepot.length}`);
    console.log('');
    
    if (benevolesEntrepot.length > 0) {
      benevolesEntrepot.forEach((b: any, index: number) => {
        console.log(`   [${index + 1}] ${b.prenom} ${b.nom} - ${b.email}`);
      });
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error al parsear bénévoles:', error);
  }
  
  console.log('🐛 ═══════════════════════════════════════════════════════════');
  console.log('');
}

export function debugContactos() {
  console.log('');
  console.log('🐛 ═══════════════════════════════════════════════════════════');
  console.log('🐛 DEBUG: CONTACTOS EN LOCALSTORAGE');
  console.log('🐛 ═══════════════════════════════════════════════════════════');
  console.log('');
  
  const stored = localStorage.getItem('contactos_departamento');
  
  if (!stored) {
    console.log('❌ No hay contactos en localStorage (clave: contactos_departamento)');
    console.log('');
    console.log('🐛 ═══════════════════════════════════════════════════════════');
    console.log('');
    return;
  }
  
  try {
    const contactos = JSON.parse(stored);
    console.log(`📊 Total de contactos: ${contactos.length}`);
    console.log('');
    
    // Filtrar contactos de Entrepôt
    const entrepotId = obtenerIdDepartamentoEntrepot();
    const contactosEntrepot = contactos.filter((c: any) => c.departamentoId === entrepotId);
    
    console.log(`📦 CONTACTOS DE ENTREPÔT (departamentoId = '${entrepotId}'):`);
    console.log(`   Total: ${contactosEntrepot.length}`);
    console.log('');
    
    if (contactosEntrepot.length > 0) {
      contactosEntrepot.forEach((c: any, index: number) => {
        console.log(`   [${index + 1}] ${c.nombre} ${c.apellido}`);
        console.log(`       Email: ${c.email}`);
        console.log(`       Tipo: ${c.tipo}`);
        console.log(`       Activo: ${c.activo}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error al parsear contactos:', error);
  }
  
  console.log('🐛 ═══════════════════════════════════════════════════════════');
  console.log('');
}

export function debugLocalStorageKeys() {
  console.log('');
  console.log('🐛 ═══════════════════════════════════════════════════════════');
  console.log('🐛 DEBUG: CLAVES EN LOCALSTORAGE');
  console.log('🐛 ═══════════════════════════════════════════════════════════');
  console.log('');
  
  const keys = Object.keys(localStorage);
  const relevantKeys = keys.filter(key => 
    key.includes('benevole') || 
    key.includes('bénévole') ||
    key.includes('contacto')
  );
  
  console.log(`📊 Claves relevantes encontradas: ${relevantKeys.length}`);
  console.log('');
  
  relevantKeys.forEach(key => {
    const value = localStorage.getItem(key);
    const size = value ? (value.length / 1024).toFixed(2) : '0';
    console.log(`   ${key} (${size} KB)`);
    
    // Intentar contar elementos
    try {
      const data = JSON.parse(value || '[]');
      if (Array.isArray(data)) {
        console.log(`     → ${data.length} elementos`);
      }
    } catch (e) {
      // No es JSON o no es array
    }
    console.log('');
  });
  
  console.log('🐛 ═══════════════════════════════════════════════════════════');
  console.log('');
}

// Exportar al window para uso en consola
if (typeof window !== 'undefined') {
  (window as any).debugBenevoles = debugBenevoles;
  (window as any).debugContactos = debugContactos;
  (window as any).debugLocalStorageKeys = debugLocalStorageKeys;
}
