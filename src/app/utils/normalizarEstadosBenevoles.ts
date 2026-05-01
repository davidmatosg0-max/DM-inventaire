/**
 * 🔧 NORMALIZAR ESTADOS DE BÉNÉVOLES
 * 
 * Este script corrige estados con mayúsculas incorrectas en localStorage
 * Convierte: "Actif" → "actif", "Inactif" → "inactif", etc.
 */

export const normalizarEstadosBenevoles = (): { 
  corregidos: number; 
  total: number; 
  detalles: Array<{ nombre: string; antes: string; despues: string }> 
} => {
  console.log('%c🔧 NORMALIZANDO ESTADOS DE BÉNÉVOLES', 'background: orange; color: white; font-size: 16px; padding: 8px; font-weight: bold');
  console.log('==========================================\n');
  
  const benevolesData = localStorage.getItem('banqueAlimentaire_benevoles');
  
  if (!benevolesData) {
    console.log('❌ No hay bénévoles para normalizar');
    return { corregidos: 0, total: 0, detalles: [] };
  }

  try {
    const benevoles = JSON.parse(benevolesData);
    let corregidos = 0;
    const detalles: Array<{ nombre: string; antes: string; despues: string }> = [];

    const benevolesNormalizados = benevoles.map((b: any) => {
      const estatusOriginal = b.statut;
      const estatusNormalizado = (b.statut || 'actif').toLowerCase().trim();
      
      // Validar que sea un estado válido
      const estadosValidos = ['actif', 'inactif', 'en pause', 'en attente'];
      const estatusFinal = estadosValidos.includes(estatusNormalizado) ? estatusNormalizado : 'actif';
      
      if (estatusOriginal !== estatusFinal) {
        corregidos++;
        detalles.push({
          nombre: `${b.prenom} ${b.nom}`,
          antes: estatusOriginal || '(vacío)',
          despues: estatusFinal
        });
      }
      
      return {
        ...b,
        statut: estatusFinal
      };
    });

    // Guardar los datos corregidos
    localStorage.setItem('banqueAlimentaire_benevoles', JSON.stringify(benevolesNormalizados));

    console.log(`✅ Total de bénévoles: ${benevoles.length}`);
    console.log(`🔧 Estados corregidos: ${corregidos}`);
    console.log('');

    if (detalles.length > 0) {
      console.log('📋 DETALLES DE CORRECCIONES:');
      console.log('----------------------------');
      detalles.forEach((d, i) => {
        console.log(`${i + 1}. ${d.nombre}`);
        console.log(`   Antes: "${d.antes}" → Después: "${d.despues}"`);
      });
    } else {
      console.log('✅ Todos los estados ya están normalizados correctamente');
    }

    console.log('\n==========================================');
    console.log('%c✅ NORMALIZACIÓN COMPLETADA', 'background: green; color: white; font-size: 14px; padding: 6px; font-weight: bold');

    return { corregidos, total: benevoles.length, detalles };

  } catch (error) {
    console.error('❌ Error al normalizar estados:', error);
    return { corregidos: 0, total: 0, detalles: [] };
  }
};

// Hacer disponible en la consola
if (typeof window !== 'undefined') {
  (window as any).normalizarEstadosBenevoles = normalizarEstadosBenevoles;
  (window as any).normalizarEstados = normalizarEstadosBenevoles; // Alias más corto
}
