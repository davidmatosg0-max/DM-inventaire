/**
 * Utilidades de Backup y Restauración
 * 
 * Sistema completo para respaldar y restaurar datos del sistema
 * con validación de integridad, compresión y versionado.
 */

import { saveAs } from 'file-saver';
import { marcarComoSistemaConDatosReales } from './inicializarDatosEjemplo';

// ==================== TIPOS ====================

export interface BackupMetadata {
  id: string;
  version: string;
  timestamp: Date;
  user: string;
  type: 'full' | 'incremental';
  modules: string[];
  size: number;
  recordCount: number;
  checksum: string;
  description?: string;
}

export interface BackupData {
  metadata: BackupMetadata;
  data: {
    [module: string]: any;
  };
}

export interface BackupOptions {
  type?: 'full' | 'incremental';
  modules?: string[];
  compress?: boolean;
  description?: string;
}

export interface RestoreOptions {
  mode?: 'replace' | 'merge';
  modules?: string[];
  dryRun?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ==================== CONSTANTES ====================

const BACKUP_VERSION = '1.0.0';
const STORAGE_KEY_PREFIX = 'ba_backup_';
const BACKUP_LIST_KEY = 'ba_backup_list';

// Módulos respaldables
export const BACKUP_MODULES = {
  INVENTORY: 'inventory',
  ORDERS: 'orders',
  ORGANISMS: 'organisms',
  CONTACTS: 'contacts',
  TRANSPORT: 'transport',
  USERS: 'users',
  SETTINGS: 'settings',
  AUDIT: 'audit',
  CATEGORIES: 'banco_alimentos_categorias'
} as const;

// ==================== UTILIDADES DE CHECKSUM ====================

/**
 * Calcular checksum MD5 simple
 */
function calculateChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

/**
 * Verificar integridad del backup
 */
export function verifyChecksum(backup: BackupData): boolean {
  const { checksum, ...metadata } = backup.metadata;
  const dataString = JSON.stringify({ metadata, data: backup.data });
  const calculatedChecksum = calculateChecksum(dataString);
  return checksum === calculatedChecksum;
}

// ==================== OBTENER DATOS DE MÓDULOS ====================

/**
 * Obtener datos de un módulo específico
 */
function getModuleData(module: string): any {
  try {
    // Las categorías usan una clave diferente sin el prefijo ba_
    const storageKey = module === 'banco_alimentos_categorias' ? module : `ba_${module}`;
    const data = localStorage.getItem(storageKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error loading module ${module}:`, error);
    return null;
  }
}

/**
 * Guardar datos de un módulo
 */
function setModuleData(module: string, data: any): void {
  try {
    // Las categorías usan una clave diferente sin el prefijo ba_
    const storageKey = module === 'banco_alimentos_categorias' ? module : `ba_${module}`;
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving module ${module}:`, error);
    throw error;
  }
}

/**
 * Obtener todos los datos del sistema
 */
function getAllSystemData(modules?: string[]): { [module: string]: any } {
  const modulesToBackup = modules || Object.values(BACKUP_MODULES);
  const systemData: { [module: string]: any } = {};
  
  for (const module of modulesToBackup) {
    const data = getModuleData(module);
    if (data) {
      systemData[module] = data;
    }
  }
  
  return systemData;
}

// ==================== CREAR BACKUP ====================

/**
 * Crear backup completo del sistema
 */
export function createBackup(options: BackupOptions = {}): BackupData {
  const {
    type = 'full',
    modules = Object.values(BACKUP_MODULES),
    description = ''
  } = options;
  
  // Obtener datos
  const systemData = getAllSystemData(modules);
  
  // Calcular estadísticas
  let recordCount = 0;
  for (const moduleData of Object.values(systemData)) {
    if (Array.isArray(moduleData)) {
      recordCount += moduleData.length;
    } else if (typeof moduleData === 'object' && moduleData !== null) {
      recordCount += Object.keys(moduleData).length;
    }
  }
  
  // Crear metadata
  const metadata: Omit<BackupMetadata, 'checksum'> = {
    id: `backup_${Date.now()}`,
    version: BACKUP_VERSION,
    timestamp: new Date(),
    user: getCurrentUser(),
    type,
    modules,
    size: 0, // Se calculará después
    recordCount,
    description
  };
  
  // Crear objeto de backup
  const backupData: BackupData = {
    metadata: { ...metadata, checksum: '' },
    data: systemData
  };
  
  // Calcular checksum
  const dataString = JSON.stringify({ metadata, data: systemData });
  const checksum = calculateChecksum(dataString);
  backupData.metadata.checksum = checksum;
  
  // Calcular tamaño
  const finalString = JSON.stringify(backupData);
  backupData.metadata.size = new Blob([finalString]).size;
  
  return backupData;
}

/**
 * Crear backup incremental (solo cambios desde último backup)
 */
export function createIncrementalBackup(
  lastBackup: BackupData,
  options: BackupOptions = {}
): BackupData {
  const currentData = createBackup({ ...options, type: 'incremental' });
  
  // Comparar con último backup y guardar solo diferencias
  const incrementalData: { [module: string]: any } = {};
  
  for (const module in currentData.data) {
    if (lastBackup.data[module]) {
      const changes = getDataChanges(lastBackup.data[module], currentData.data[module]);
      if (changes) {
        incrementalData[module] = changes;
      }
    } else {
      incrementalData[module] = currentData.data[module];
    }
  }
  
  currentData.data = incrementalData;
  
  // Recalcular checksum y tamaño
  const dataString = JSON.stringify({
    metadata: { ...currentData.metadata, checksum: '' },
    data: incrementalData
  });
  currentData.metadata.checksum = calculateChecksum(dataString);
  currentData.metadata.size = new Blob([JSON.stringify(currentData)]).size;
  
  return currentData;
}

/**
 * Obtener cambios entre dos conjuntos de datos
 */
function getDataChanges(oldData: any, newData: any): any {
  // Implementación simple: retornar newData si es diferente
  const oldString = JSON.stringify(oldData);
  const newString = JSON.stringify(newData);
  return oldString !== newString ? newData : null;
}

// ==================== GUARDAR BACKUP ====================

/**
 * Guardar backup en localStorage
 */
export function saveBackupToStorage(backup: BackupData): void {
  try {
    // Guardar backup
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${backup.metadata.id}`,
      JSON.stringify(backup)
    );
    
    // Actualizar lista de backups
    const backupList = getBackupList();
    backupList.push(backup.metadata);
    localStorage.setItem(BACKUP_LIST_KEY, JSON.stringify(backupList));
  } catch (error) {
    console.error('Error saving backup:', error);
    throw new Error('No se pudo guardar el backup. Espacio insuficiente.');
  }
}

/**
 * Exportar backup a archivo
 */
export async function exportBackupToFile(backup: BackupData): Promise<void> {
  const jsonString = JSON.stringify(backup, null, 2);
  const filename = `backup_${backup.metadata.id}_${formatDateForFilename(backup.metadata.timestamp)}.json`;
  
  // Intentar guardar en carpeta predefinida si está configurada
  const { guardarArchivoEnCarpeta, tieneCarpetaSeleccionada, soportaFileSystemAccess } = await import('./fileSystemAccess');
  const { obtenerConfigAutoBackup } = await import('./autoBackupStorage');
  
  const config = obtenerConfigAutoBackup();
  
  if (config.customFolder && soportaFileSystemAccess() && tieneCarpetaSeleccionada()) {
    try {
      const resultado = await guardarArchivoEnCarpeta(filename, jsonString);
      if (resultado.success) {
        console.log(`✅ Backup guardado en carpeta predefinida: ${filename}`);
        return;
      } else {
        console.warn('⚠️ No se pudo guardar en carpeta predefinida, usando descarga normal');
      }
    } catch (error) {
      console.warn('⚠️ Error al guardar en carpeta predefinida:', error);
    }
  }
  
  // Fallback: Descarga normal
  const blob = new Blob([jsonString], { type: 'application/json' });
  saveAs(blob, filename);
}

// ==================== CARGAR BACKUP ====================

/**
 * Obtener lista de backups disponibles
 */
export function getBackupList(): BackupMetadata[] {
  try {
    const stored = localStorage.getItem(BACKUP_LIST_KEY);
    if (!stored) return [];
    
    const list = JSON.parse(stored);
    return list.map((item: any) => ({
      ...item,
      timestamp: new Date(item.timestamp)
    }));
  } catch (error) {
    console.error('Error loading backup list:', error);
    return [];
  }
}

/**
 * Cargar backup desde localStorage
 */
export function loadBackupFromStorage(backupId: string): BackupData | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${backupId}`);
    if (!stored) return null;
    
    const backup = JSON.parse(stored);
    backup.metadata.timestamp = new Date(backup.metadata.timestamp);
    return backup;
  } catch (error) {
    console.error('Error loading backup:', error);
    return null;
  }
}

/**
 * Cargar backup desde archivo
 */
export async function loadBackupFromFile(file: File): Promise<BackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content);
        backup.metadata.timestamp = new Date(backup.metadata.timestamp);
        resolve(backup);
      } catch (error) {
        reject(new Error('Archivo de backup inválido'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsText(file);
  });
}

// ==================== VALIDAR BACKUP ====================

/**
 * Validar backup antes de restaurar
 */
export function validateBackup(backup: BackupData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Verificar estructura básica
  if (!backup.metadata || !backup.data) {
    errors.push('Estructura de backup inválida');
    return { isValid: false, errors, warnings };
  }
  
  // Verificar versión
  if (!backup.metadata.version) {
    warnings.push('Versión de backup no especificada');
  }
  
  // Verificar checksum
  if (!verifyChecksum(backup)) {
    errors.push('Checksum inválido - el backup puede estar corrupto');
  }
  
  // Verificar módulos
  if (!backup.metadata.modules || backup.metadata.modules.length === 0) {
    warnings.push('No se especifican módulos en el backup');
  }
  
  // Verificar datos
  if (Object.keys(backup.data).length === 0) {
    errors.push('El backup no contiene datos');
  }
  
  // Verificar compatibilidad de versión
  if (backup.metadata.version !== BACKUP_VERSION) {
    warnings.push(`Versión diferente (${backup.metadata.version} vs ${BACKUP_VERSION})`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ==================== RESTAURAR BACKUP ====================

/**
 * Restaurar backup
 */
export function restoreBackup(
  backup: BackupData,
  options: RestoreOptions = {}
): { success: boolean; errors: string[] } {
  const {
    mode = 'replace',
    modules = backup.metadata.modules,
    dryRun = false
  } = options;
  
  const errors: string[] = [];
  
  // Validar backup
  const validation = validateBackup(backup);
  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }
  
  // Crear respaldo antes de restaurar
  if (!dryRun) {
    try {
      const preRestoreBackup = createBackup({
        description: 'Backup automático antes de restauración'
      });
      saveBackupToStorage(preRestoreBackup);
    } catch (error) {
      errors.push('No se pudo crear backup de seguridad');
    }
  }
  
  // Restaurar cada módulo
  for (const module of modules) {
    if (!backup.data[module]) {
      errors.push(`Módulo ${module} no encontrado en backup`);
      continue;
    }
    
    try {
      if (dryRun) {
        // Solo validar sin guardar
        console.log(`[DRY RUN] Restauraría módulo ${module}`);
      } else {
        if (mode === 'merge') {
          // Merge: combinar datos existentes con backup
          const existingData = getModuleData(module);
          const mergedData = mergeData(existingData, backup.data[module]);
          setModuleData(module, mergedData);
        } else {
          // Replace: reemplazar completamente
          setModuleData(module, backup.data[module]);
        }
      }
    } catch (error) {
      errors.push(`Error restaurando módulo ${module}: ${error}`);
    }
  }
  
  // 🔒 MARCAR SISTEMA COMO CON DATOS REALES después de restaurar backup exitoso
  if (!dryRun && errors.length === 0) {
    try {
      marcarComoSistemaConDatosReales();
      console.log('🔒 Backup restaurado - Sistema marcado como CON DATOS REALES');
    } catch (error) {
      console.warn('⚠️ No se pudo marcar el sistema como con datos reales:', error);
    }
  }
  
  return {
    success: errors.length === 0,
    errors
  };
}

/**
 * Combinar datos (merge)
 */
function mergeData(existing: any, backup: any): any {
  if (!existing) return backup;
  if (!backup) return existing;
  
  // Si son arrays, combinar por ID
  if (Array.isArray(existing) && Array.isArray(backup)) {
    const merged = [...existing];
    for (const item of backup) {
      const existingIndex = merged.findIndex((e: any) => e.id === item.id);
      if (existingIndex >= 0) {
        merged[existingIndex] = item; // Actualizar
      } else {
        merged.push(item); // Agregar nuevo
      }
    }
    return merged;
  }
  
  // Si son objetos, combinar propiedades
  if (typeof existing === 'object' && typeof backup === 'object') {
    return { ...existing, ...backup };
  }
  
  // Por defecto, usar backup
  return backup;
}

// ==================== ELIMINAR BACKUP ====================

/**
 * Eliminar backup
 */
export function deleteBackup(backupId: string): void {
  // Eliminar backup
  localStorage.removeItem(`${STORAGE_KEY_PREFIX}${backupId}`);
  
  // Actualizar lista
  const backupList = getBackupList();
  const updated = backupList.filter(b => b.id !== backupId);
  localStorage.setItem(BACKUP_LIST_KEY, JSON.stringify(updated));
}

/**
 * Eliminar backups antiguos
 */
export function cleanOldBackups(daysToKeep: number = 30): number {
  const backupList = getBackupList();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  let deletedCount = 0;
  
  for (const backup of backupList) {
    if (backup.timestamp < cutoffDate) {
      deleteBackup(backup.id);
      deletedCount++;
    }
  }
  
  return deletedCount;
}

// ==================== COMPARAR BACKUPS ====================

/**
 * Comparar dos backups
 */
export function compareBackups(
  backup1: BackupData,
  backup2: BackupData
): {
  differences: { [module: string]: any };
  summary: {
    modulesAdded: string[];
    modulesRemoved: string[];
    modulesChanged: string[];
  };
} {
  const differences: { [module: string]: any } = {};
  const modulesAdded: string[] = [];
  const modulesRemoved: string[] = [];
  const modulesChanged: string[] = [];
  
  // Módulos en backup2 pero no en backup1
  for (const module in backup2.data) {
    if (!backup1.data[module]) {
      modulesAdded.push(module);
      differences[module] = { status: 'added', data: backup2.data[module] };
    }
  }
  
  // Módulos en backup1 pero no en backup2
  for (const module in backup1.data) {
    if (!backup2.data[module]) {
      modulesRemoved.push(module);
      differences[module] = { status: 'removed', data: backup1.data[module] };
    }
  }
  
  // Módulos en ambos - verificar cambios
  for (const module in backup1.data) {
    if (backup2.data[module]) {
      const data1 = JSON.stringify(backup1.data[module]);
      const data2 = JSON.stringify(backup2.data[module]);
      if (data1 !== data2) {
        modulesChanged.push(module);
        differences[module] = {
          status: 'changed',
          before: backup1.data[module],
          after: backup2.data[module]
        };
      }
    }
  }
  
  return {
    differences,
    summary: {
      modulesAdded,
      modulesRemoved,
      modulesChanged
    }
  };
}

// ==================== CONFIGURACIÓN DE BACKUP AUTOMÁTICO ====================

interface BackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM
  modules: string[];
  keepLast: number;
  autoClean: boolean;
}

const BACKUP_CONFIG_KEY = 'ba_backup_config';

/**
 * Guardar configuración de backup automático
 */
export function saveBackupConfig(config: BackupConfig): void {
  localStorage.setItem(BACKUP_CONFIG_KEY, JSON.stringify(config));
}

/**
 * Cargar configuración de backup automático
 */
export function loadBackupConfig(): BackupConfig {
  const stored = localStorage.getItem(BACKUP_CONFIG_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  
  // Configuración por defecto
  return {
    enabled: false,
    frequency: 'weekly',
    time: '02:00',
    modules: Object.values(BACKUP_MODULES),
    keepLast: 10,
    autoClean: true
  };
}

/**
 * Verificar si es momento de hacer backup automático
 */
export function shouldRunAutoBackup(): boolean {
  const config = loadBackupConfig();
  if (!config.enabled) return false;
  
  const lastBackup = getBackupList()
    .filter(b => b.type === 'full')
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  
  if (!lastBackup) return true;
  
  const now = new Date();
  const hoursSinceLastBackup = (now.getTime() - lastBackup.timestamp.getTime()) / (1000 * 60 * 60);
  
  switch (config.frequency) {
    case 'daily':
      return hoursSinceLastBackup >= 24;
    case 'weekly':
      return hoursSinceLastBackup >= 168;
    case 'monthly':
      return hoursSinceLastBackup >= 720;
    default:
      return false;
  }
}

/**
 * Ejecutar backup automático
 */
export function runAutoBackup(): BackupData | null {
  try {
    const config = loadBackupConfig();
    const backup = createBackup({
      type: 'full',
      modules: config.modules,
      description: 'Backup automático'
    });
    
    saveBackupToStorage(backup);
    
    // Limpiar backups antiguos si está habilitado
    if (config.autoClean) {
      const backupList = getBackupList();
      if (backupList.length > config.keepLast) {
        const toDelete = backupList
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
          .slice(0, backupList.length - config.keepLast);
        
        for (const b of toDelete) {
          deleteBackup(b.id);
        }
      }
    }
    
    return backup;
  } catch (error) {
    console.error('Error running auto backup:', error);
    return null;
  }
}

// ==================== HELPERS ====================

/**
 * Obtener usuario actual
 */
function getCurrentUser(): string {
  // Intentar obtener de localStorage o usar 'system'
  try {
    const user = localStorage.getItem('ba_current_user');
    return user || 'system';
  } catch {
    return 'system';
  }
}

/**
 * Formatear fecha para nombre de archivo
 */
function formatDateForFilename(date: Date): string {
  return date.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}

/**
 * Obtener tamaño total de backups
 */
export function getTotalBackupSize(): number {
  const backupList = getBackupList();
  return backupList.reduce((total, backup) => total + backup.size, 0);
}

/**
 * Obtener estadísticas de backups
 */
export function getBackupStats(): {
  total: number;
  full: number;
  incremental: number;
  totalSize: number;
  oldest: Date | null;
  newest: Date | null;
} {
  const backupList = getBackupList();
  
  return {
    total: backupList.length,
    full: backupList.filter(b => b.type === 'full').length,
    incremental: backupList.filter(b => b.type === 'incremental').length,
    totalSize: getTotalBackupSize(),
    oldest: backupList.length > 0 
      ? new Date(Math.min(...backupList.map(b => b.timestamp.getTime())))
      : null,
    newest: backupList.length > 0
      ? new Date(Math.max(...backupList.map(b => b.timestamp.getTime())))
      : null
  };
}

// Exportar todo junto
export const BackupUtils = {
  create: createBackup,
  createIncremental: createIncrementalBackup,
  save: saveBackupToStorage,
  export: exportBackupToFile,
  load: loadBackupFromStorage,
  loadFromFile: loadBackupFromFile,
  validate: validateBackup,
  restore: restoreBackup,
  delete: deleteBackup,
  cleanOld: cleanOldBackups,
  compare: compareBackups,
  list: getBackupList,
  stats: getBackupStats,
  config: {
    save: saveBackupConfig,
    load: loadBackupConfig
  },
  auto: {
    shouldRun: shouldRunAutoBackup,
    run: runAutoBackup
  },
  modules: BACKUP_MODULES
};