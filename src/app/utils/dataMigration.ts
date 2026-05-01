/**
 * SISTEMA DE MIGRACIÓN Y BACKUP DE DATOS
 * 
 * Este módulo maneja:
 * - Migración automática de claves antiguas a nuevas
 * - Backup y restauración de localStorage
 * - Inspección de datos almacenados
 * - Protección de datos reales
 */

import { ejecutarEnModoMantenimiento } from './proteccionDatos';

/**
 * 🔄 MIGRACIÓN AUTOMÁTICA DE CLAVES DE STORAGE
 * 
 * Convierte las claves antiguas al nuevo formato:
 * - productos_banco_alimentos → banco_alimentos_productos
 * - categorias_banco_alimentos → banco_alimentos_categorias
 * - unidades_banco_alimentos → banco_alimentos_unidades
 */
export function migrateStorageKeys() {
  console.log('🔄 Verificando migración de claves de storage...');
  
  const migrations = [
    { old: 'productos_banco_alimentos', new: 'banco_alimentos_productos' },
    { old: 'categorias_banco_alimentos', new: 'banco_alimentos_categorias' },
    { old: 'unidades_banco_alimentos', new: 'banco_alimentos_unidades' },
  ];

  let migrated = false;

  migrations.forEach(({ old: oldKey, new: newKey }) => {
    const oldData = localStorage.getItem(oldKey);
    const newData = localStorage.getItem(newKey);

    // Si existe el dato antiguo y NO existe el nuevo, migrar
    if (oldData && !newData) {
      localStorage.setItem(newKey, oldData);
      console.log(`✅ Migrado: ${oldKey} → ${newKey}`);
      migrated = true;
    }
    
    // Si existe el dato antiguo Y el nuevo, eliminar el antiguo
    if (oldData && newData) {
      localStorage.removeItem(oldKey);
      console.log(`🧹 Limpiado duplicado: ${oldKey}`);
    }
  });

  if (migrated) {
    console.log('✅ Migración de claves completada');
  } else {
    console.log('ℹ️ No se requiere migración');
  }

  return migrated;
}

/**
 * 🔄 VERSIÓN DE DATOS
 * Permite actualizar la estructura de datos entre versiones
 */
const CURRENT_DATA_VERSION = '1.2.0';

export function getDataVersion(): string {
  return localStorage.getItem('data_version') || '1.0.0';
}

export function setDataVersion(version: string) {
  localStorage.setItem('data_version', version);
}

/**
 * 🔄 Actualizar versión de datos y ejecutar migraciones necesarias
 */
export function updateDataVersion() {
  const currentVersion = getDataVersion();
  
  if (currentVersion !== CURRENT_DATA_VERSION) {
    console.log(`🔄 Actualizando versión de datos: ${currentVersion} → ${CURRENT_DATA_VERSION}`);
    
    // Ejecutar migraciones de claves
    migrateStorageKeys();
    
    // Actualizar versión
    setDataVersion(CURRENT_DATA_VERSION);
    
    console.log('✅ Versión de datos actualizada');
  }
}

/**
 * 🔄 EJECUTAR TODAS LAS MIGRACIONES DE DATOS
 * Esta función se ejecuta automáticamente al cargar la aplicación
 */
export function runDataMigrations() {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('🔄 EJECUTANDO MIGRACIONES DE DATOS');
  console.log('═══════════════════════════════════════');
  console.log('');
  
  const currentVersion = getDataVersion();
  console.log(`📊 Versión actual: ${currentVersion}`);
  console.log(`📊 Versión objetivo: ${CURRENT_DATA_VERSION}`);
  
  // Ejecutar migración de claves
  const keysMigrated = migrateStorageKeys();
  
  // Actualizar versión si es necesario
  if (currentVersion !== CURRENT_DATA_VERSION) {
    updateDataVersion();
  }
  
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('✅ MIGRACIONES COMPLETADAS');
  console.log('═══════════════════════════════════════');
  console.log('');
  
  return keysMigrated;
}

/**
 * Backup completo de todos los datos en localStorage
 * Útil antes de hacer cambios importantes
 */
export function backupLocalStorage(): string {
  const backup: Record<string, string | null> = {};
  
  // Capturar TODAS las claves de localStorage sin excepción
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      backup[key] = localStorage.getItem(key);
    }
  }

  const backupString = JSON.stringify(backup, null, 2);
  
  // Mostrar estadísticas detalladas del backup
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('📦 BACKUP CRÉÉ - STATISTIQUES COMPLÈTES');
  console.log('═══════════════════════════════════════');
  console.log(`📊 Nombre total de clés: ${Object.keys(backup).length}`);
  console.log(`💾 Taille totale: ${(backupString.length / 1024).toFixed(2)} KB`);
  console.log('');
  console.log('📋 CLÉS INCLUSES DANS LE BACKUP:');
  
  // Agrupar y mostrar las claves por módulo
  const modulesKeys: Record<string, string[]> = {
    'Productos': [],
    'Categorías': [],
    'Comandas': [],
    'Organismos': [],
    'Usuarios': [],
    'Inventario': [],
    'Departamentos': [],
    'Contactos': [],
    'Bénévoles': [],
    'Unidades': [],
    'Transporte': [],
    'Ofertas': [],
    'Donateurs/Fournisseurs': [],
    'Recetas': [],
    'Configuración': [],
    'Auditoría': [],
    'Sistema': [],
    'Otros': []
  };
  
  Object.keys(backup).forEach(key => {
    if (key.includes('producto')) modulesKeys['Productos'].push(key);
    else if (key.includes('categoria')) modulesKeys['Categorías'].push(key);
    else if (key.includes('comanda')) modulesKeys['Comandas'].push(key);
    else if (key.includes('organismo')) modulesKeys['Organismos'].push(key);
    else if (key.includes('usuario')) modulesKeys['Usuarios'].push(key);
    else if (key.includes('inventario') || key.includes('entrada')) modulesKeys['Inventario'].push(key);
    else if (key.includes('departamento')) modulesKeys['Departamentos'].push(key);
    else if (key.includes('contacto')) modulesKeys['Contactos'].push(key);
    else if (key.includes('benevole')) modulesKeys['Bénévoles'].push(key);
    else if (key.includes('unidad')) modulesKeys['Unidades'].push(key);
    else if (key.includes('transporte')) modulesKeys['Transporte'].push(key);
    else if (key.includes('oferta')) modulesKeys['Ofertas'].push(key);
    else if (key.includes('donateur') || key.includes('fournisseur')) modulesKeys['Donateurs/Fournisseurs'].push(key);
    else if (key.includes('receta')) modulesKeys['Recetas'].push(key);
    else if (key.includes('config') || key.includes('programa')) modulesKeys['Configuración'].push(key);
    else if (key.includes('audit') || key.includes('log')) modulesKeys['Auditoría'].push(key);
    else if (key.includes('sistema') || key.includes('version') || key.includes('limpieza') || key.includes('proteg')) modulesKeys['Sistema'].push(key);
    else modulesKeys['Otros'].push(key);
  });
  
  // Mostrar resumen por módulo
  Object.entries(modulesKeys).forEach(([module, keys]) => {
    if (keys.length > 0) {
      console.log(`\n🔹 ${module} (${keys.length} clés):`);
      keys.forEach(key => {
        const value = backup[key];
        const size = value ? (value.length / 1024).toFixed(2) : '0.00';
        console.log(`   • ${key}: ${size} KB`);
      });
    }
  });
  
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('✅ BACKUP COMPLET GÉNÉRÉ');
  console.log('═══════════════════════════════════════');
  console.log('');
  
  return backupString;
}

/**
 * Restaurar datos desde un backup
 * 🔒🔒🔒 PROTECCIÓN MÁXIMA: Al restaurar, marcar INMEDIATAMENTE como protegido
 */
export async function restoreLocalStorage(backupString: string): Promise<boolean> {
  return ejecutarEnModoMantenimiento(() => {
    try {
      // 🔒🔒🔒 PASO 1: MARCAR INMEDIATAMENTE COMO PROTEGIDO ANTES DE RESTAURAR
      localStorage.setItem('sistema_con_datos_reales', 'true');
      localStorage.setItem('limpieza_completa_ejecutada', 'true');
      localStorage.setItem('limpieza_completa_fecha', new Date().toISOString());
      console.log('🔒🔒🔒 PRE-PROTECCIÓN ACTIVADA - Sistema marcado como CON DATOS REALES');
      
      const backup = JSON.parse(backupString);
      
      // PASO 2: Limpiar localStorage actual (permitido en modo mantenimiento)
      console.log('🧹 Limpiando localStorage actual...');
      localStorage.clear();
      
      // PASO 3: Restaurar todos los datos del backup
      console.log('📦 Restaurando datos del backup...');
      let keysRestored = 0;
      
      Object.keys(backup).forEach(key => {
        localStorage.setItem(key, backup[key]);
        keysRestored++;
      });
      
      console.log(`✅ ${keysRestored} claves restauradas`);
      
      // PASO 4: Ejecutar migración automática de claves
      console.log('🔄 Ejecutando migración automática de claves...');
      migrateStorageKeys();
      
      // 🔒🔒🔒 PASO 5: VOLVER A MARCAR COMO PROTEGIDO DESPUÉS DE RESTAURAR
      localStorage.setItem('sistema_con_datos_reales', 'true');
      localStorage.setItem('limpieza_completa_ejecutada', 'true');
      localStorage.setItem('limpieza_completa_fecha', new Date().toISOString());
      console.log('🔒🔒🔒 POST-PROTECCIÓN ACTIVADA - Datos restaurados y protegidos');
      
      // PASO 6: Actualizar versión de datos
      setDataVersion(CURRENT_DATA_VERSION);
      
      // PASO 7: Disparar evento para notificar a los componentes
      window.dispatchEvent(new Event('backupRestored'));
      
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('✅ RESTAURATION COMPLÈTE TERMINÉE');
      console.log('═══════════════════════════════════════');
      console.log('🔄 Migrations appliquées automatiquement');
      console.log('🔒 Données protégées contre la suppression');
      console.log('💡 Rechargez la page (F5) pour voir les changements');
      console.log('═══════════════════════════════════════');
      console.log('');
      
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la restauration:', error);
      
      // 🔒🔒🔒 ASEGURAR PROTECCIÓN INCLUSO SI FALLA
      localStorage.setItem('sistema_con_datos_reales', 'true');
      localStorage.setItem('limpieza_completa_ejecutada', 'true');
      
      return false;
    }
  });
}

/**
 * Exportar datos como archivo descargable
 */
export function downloadBackup() {
  const backup = backupLocalStorage();
  const blob = new Blob([backup], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  
  // Nombre del archivo con fecha y hora
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
  a.download = `banco-alimentos-backup-${dateStr}-${timeStr}.json`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Lista todas las claves en localStorage con sus tamaños
 */
export function inspectLocalStorage() {
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('🔍 INSPECTION COMPLÈTE DU LOCALSTORAGE');
  console.log('═══════════════════════════════════════');
  console.log('');
  
  let totalSize = 0;
  const allKeys: Array<{ key: string; size: number; sizeKB: string }> = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      const size = value ? value.length : 0;
      totalSize += size;
      allKeys.push({
        key,
        size,
        sizeKB: (size / 1024).toFixed(2)
      });
    }
  }
  
  // Ordenar por tamaño (descendente)
  allKeys.sort((a, b) => b.size - a.size);
  
  console.log(`📊 Nombre total de clés: ${allKeys.length}`);
  console.log(`💾 Taille totale: ${(totalSize / 1024).toFixed(2)} KB`);
  console.log(`📈 Espace utilisé: ${((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2)}% de ~5MB`);
  console.log('');
  console.log('📋 CLÉS PAR TAILLE (du plus grand au plus petit):');
  console.log('');
  
  // Mostrar las top 20 claves más grandes
  const topKeys = allKeys.slice(0, 20);
  topKeys.forEach((item, index) => {
    const bar = '█'.repeat(Math.ceil((item.size / allKeys[0].size) * 20));
    console.log(`${(index + 1).toString().padStart(2)}. ${item.key.padEnd(50)} ${item.sizeKB.padStart(8)} KB ${bar}`);
  });
  
  if (allKeys.length > 20) {
    console.log('');
    console.log(`... et ${allKeys.length - 20} autres clés plus petites`);
  }
  
  console.log('');
  console.log('═══════════════════════════════════════');
  console.log('✅ INSPECTION TERMINÉE');
  console.log('═══════════════════════════════════════');
  console.log('');
  
  // Mostrar advertencias si el espacio está casi lleno
  const percentageUsed = (totalSize / (5 * 1024 * 1024)) * 100;
  if (percentageUsed > 80) {
    console.warn('⚠️ ATTENTION: Vous utilisez plus de 80% de l\'espace localStorage!');
    console.warn('   Considérez nettoyer les données anciennes ou inutilisées.');
  } else if (percentageUsed > 60) {
    console.info('💡 INFO: Vous utilisez plus de 60% de l\'espace localStorage.');
    console.info('   Surveillez l\'utilisation de l\'espace.');
  }
}

/**
 * Verificar si hay datos en localStorage
 */
export function hasData(): boolean {
  return localStorage.length > 0;
}

/**
 * Obtener tamaño total del localStorage en KB
 */
export function getLocalStorageSize(): number {
  let totalSize = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      totalSize += value ? value.length : 0;
    }
  }
  return totalSize / 1024; // Retornar en KB
}

/**
 * Limpiar datos de ejemplo (usado en desarrollo)
 */
export function clearExampleData() {
  const protectedKeys = [
    'currentUser',
    'sistema_con_datos_reales',
    'limpieza_completa_ejecutada',
    'limpieza_completa_fecha',
    'data_version'
  ];
  
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !protectedKeys.includes(key)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  console.log(`🧹 ${keysToRemove.length} claves eliminadas`);
}