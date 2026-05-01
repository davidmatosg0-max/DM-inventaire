/**
 * 🔍 VERIFICAR VOLUNTARIOS EN TIEMPO REAL
 * 
 * Estas funciones permiten verificar el estado actual de los voluntarios
 * en el sistema sin necesidad de recargar la página.
 */

export const verificarVoluntariosConsola = () => {
  console.log('%c🔍 VERIFICACIÓN DE VOLUNTARIOS EN TIEMPO REAL', 'background: blue; color: white; font-size: 18px; padding: 10px; font-weight: bold');
  console.log('==========================================\n');
  console.log('🕒 Fecha y hora:', new Date().toLocaleString());
  console.log('');
  
  // Obtener voluntarios del módulo principal
  const benevolesData = localStorage.getItem('banqueAlimentaire_benevoles');
  
  if (!benevolesData) {
    console.log('%c❌ NO HAY VOLUNTARIOS EN EL SISTEMA', 'background: red; color: white; font-size: 16px; padding: 8px');
    console.log('La clave "banqueAlimentaire_benevoles" no existe en localStorage\n');
    console.log('💡 Esto significa que NO se ha creado ningún voluntario todavía.');
    return;
  }
  
  try {
    const benevoles = JSON.parse(benevolesData);
    
    console.log(`%c✅ TOTAL DE VOLUNTARIOS: ${benevoles.length}`, 'background: green; color: white; font-size: 16px; padding: 8px');
    console.log('');
    
    // Estadísticas por statut
    const activos = benevoles.filter((b: any) => b.statut === 'actif').length;
    const inactivos = benevoles.filter((b: any) => b.statut === 'inactif').length;
    const enFormation = benevoles.filter((b: any) => b.statut === 'en formation').length;
    
    console.log('📊 ESTADÍSTICAS POR STATUT:');
    console.log(`  ✅ Activos: ${activos}`);
    console.log(`  ⏸️  Inactivos: ${inactivos}`);
    console.log(`  🎓 En formation: ${enFormation}`);
    console.log('');
    
    // Listar todos
    console.log('📋 LISTADO COMPLETO:');
    console.log('==========================================');
    benevoles.forEach((b: any, idx: number) => {
      const statutEmoji = b.statut === 'actif' ? '✅' : b.statut === 'inactif' ? '⏸️' : '🎓';
      console.log(`${idx + 1}. ${statutEmoji} ${b.prenom} ${b.nom}`);
      console.log(`   Email: ${b.email || 'N/A'}`);
      console.log(`   Téléphone: ${b.telephone || 'N/A'}`);
      console.log(`   Départements: ${b.departement || 'N/A'}`);
      console.log(`   Statut: ${b.statut}`);
      console.log(`   ID: ${b.id}`);
      console.log('');
    });
    
    console.log('==========================================');
    console.log('%c✅ VERIFICACIÓN COMPLETA', 'background: green; color: white; font-size: 14px; padding: 6px');
    
    return benevoles;
    
  } catch (error) {
    console.error('%c❌ ERROR AL LEER VOLUNTARIOS', 'background: red; color: white; font-size: 16px; padding: 8px');
    console.error('Error:', error);
    return null;
  }
};

export const contarVoluntariosActivos = () => {
  const benevolesData = localStorage.getItem('banqueAlimentaire_benevoles');
  if (!benevolesData) return 0;
  
  try {
    const benevoles = JSON.parse(benevolesData);
    return benevoles.filter((b: any) => b.statut === 'actif').length;
  } catch {
    return 0;
  }
};

export const buscarVoluntarioPorNombre = (nombre: string) => {
  console.log(`%c🔍 BUSCANDO: "${nombre}"`, 'background: blue; color: white; font-size: 16px; padding: 8px');
  
  const benevolesData = localStorage.getItem('banqueAlimentaire_benevoles');
  if (!benevolesData) {
    console.log('❌ No hay voluntarios en el sistema');
    return [];
  }
  
  try {
    const benevoles = JSON.parse(benevolesData);
    const nombreLower = nombre.toLowerCase();
    
    const resultados = benevoles.filter((b: any) => {
      const nombreCompleto = `${b.prenom} ${b.nom}`.toLowerCase();
      const email = (b.email || '').toLowerCase();
      const telephone = (b.telephone || '').toLowerCase();
      
      return nombreCompleto.includes(nombreLower) ||
             email.includes(nombreLower) ||
             telephone.includes(nombreLower);
    });
    
    if (resultados.length === 0) {
      console.log(`%c❌ NO SE ENCONTRÓ "${nombre}"`, 'background: red; color: white; font-size: 14px; padding: 6px');
      console.log('\n💡 Intenta buscar con:');
      console.log('  - Solo el nombre');
      console.log('  - Solo el apellido');
      console.log('  - Email');
      console.log('  - Teléfono\n');
    } else {
      console.log(`%c✅ ENCONTRADOS: ${resultados.length}`, 'background: green; color: white; font-size: 14px; padding: 6px');
      console.log('');
      
      resultados.forEach((b: any, idx: number) => {
        console.log(`📋 Resultado ${idx + 1}:`);
        console.log(`  Nombre: ${b.prenom} ${b.nom}`);
        console.log(`  Email: ${b.email || 'N/A'}`);
        console.log(`  Téléphone: ${b.telephone || 'N/A'}`);
        console.log(`  Départements: ${b.departement || 'N/A'}`);
        console.log(`  Statut: ${b.statut}`);
        console.log(`  ID: ${b.id}`);
        console.log('  Datos completos:', b);
        console.log('');
      });
    }
    
    return resultados;
    
  } catch (error) {
    console.error('❌ Error al buscar:', error);
    return [];
  }
};

// Exponer funciones globalmente para uso en consola
if (typeof window !== 'undefined') {
  (window as any).verificarVoluntarios = verificarVoluntariosConsola;
  (window as any).buscarVoluntario = buscarVoluntarioPorNombre;
  (window as any).contarActivos = contarVoluntariosActivos;
}
