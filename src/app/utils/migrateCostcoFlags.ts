/**
 * Migración de flags de Costco Wholesale
 * Corrige el flag de Costco para que sea proveedor EXCLUSIVO (no donador)
 */

import { ContactoDepartamento } from '../types/inventario';

export const migrarFlagsCostco = (): boolean => {
  try {
    console.log('🔧 Iniciando migración de flags de Costco...');
    
    // Obtener contactos de Almacén
    const contactosAlmacenStr = localStorage.getItem('contactos_Almacén');
    if (!contactosAlmacenStr) {
      console.log('⚠️ No hay contactos en Almacén');
      return false;
    }

    const contactosAlmacen: ContactoDepartamento[] = JSON.parse(contactosAlmacenStr);
    console.log(`📋 Contactos encontrados: ${contactosAlmacen.length}`);
    
    // Buscar Costco
    const costcoIndex = contactosAlmacen.findIndex(c => c.nombre === 'Costco Wholesale');
    
    if (costcoIndex === -1) {
      console.log('⚠️ Costco Wholesale no encontrado');
      return false;
    }

    const costco = contactosAlmacen[costcoIndex];
    console.log('📍 Costco encontrado:', {
      nombre: costco.nombre,
      isDonateur_antes: costco.isDonateur,
      isFournisseur_antes: costco.isFournisseur
    });

    // Verificar si ya tiene los flags correctos
    if (costco.isDonateur === false && costco.isFournisseur === true) {
      console.log('✅ Costco ya tiene los flags correctos (proveedor exclusivo)');
      return false;
    }

    // Corregir flags: Costco es SOLO PROVEEDOR (no donador)
    contactosAlmacen[costcoIndex] = {
      ...costco,
      isDonateur: false,
      isFournisseur: true
    };

    // Guardar cambios
    localStorage.setItem('contactos_Almacén', JSON.stringify(contactosAlmacen));
    
    console.log('✅ Flags de Costco corregidos:', {
      nombre: contactosAlmacen[costcoIndex].nombre,
      isDonateur_despues: contactosAlmacen[costcoIndex].isDonateur,
      isFournisseur_despues: contactosAlmacen[costcoIndex].isFournisseur
    });

    return true;
  } catch (error) {
    console.error('❌ Error en migración de Costco:', error);
    return false;
  }
};

/**
 * Verificar si la migración ya fue ejecutada
 */
export const yaMigradoCostco = (): boolean => {
  const migrado = localStorage.getItem('migracion_costco_flags');
  return migrado === 'true';
};

/**
 * Marcar migración como ejecutada
 */
export const marcarMigracionCostco = (): void => {
  localStorage.setItem('migracion_costco_flags', 'true');
};

// 🆘 FUNCIÓN DE EMERGENCIA: Ejecutar migración manualmente desde consola
(window as any).migrarCostcoManual = () => {
  console.log('🔧 Ejecutando migración manual de Costco...');
  
  // Resetear flag de migración
  localStorage.removeItem('migracion_costco_flags');
  
  // Ejecutar migración
  const resultado = migrarFlagsCostco();
  
  if (resultado) {
    marcarMigracionCostco();
    console.log('✅ Migración completada. RECARGA LA PÁGINA para ver los cambios.');
  } else {
    console.log('⚠️ La migración no fue necesaria o falló.');
  }
};

console.log('🆘 Función de emergencia cargada: migrarCostcoManual()');