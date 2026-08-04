/**
 * Sistema de Backup Automático
 * Gestiona la configuración y ejecución de backups automáticos
 */

import {
  soportaFileSystemAccess,
  guardarArchivoEnCarpeta,
  tieneCarpetaSeleccionada,
  obtenerNombreCarpeta
} from './fileSystemAccess';

export type BackupFrequency = 'daily' | 'weekly' | 'monthly' | 'manual';

export interface AutoBackupConfig {
  enabled: boolean;
  intervalMinutes: number; // Intervalo de ejecución en minutos
  frequency?: BackupFrequency; // Legacy: mantener compatibilidad con configuraciones antiguas
  time?: string; // Legacy: mantener compatibilidad con configuraciones antiguas
  maxBackups: number; // Número máximo de backups a mantener
  lastBackup?: string; // ISO timestamp del último backup
  nextBackup?: string; // ISO timestamp del próximo backup
  autoDownload: boolean; // Auto-descargar backups automáticos
  filePrefix: string; // Prefijo personalizado para nombres de archivo
  customFolder: boolean; // Si usa carpeta personalizada
  folderName?: string; // Nombre de la carpeta seleccionada (solo para mostrar)
}

export interface StoredBackup {
  id: string;
  timestamp: string;
  data: string;
  size: number; // Tamaño en bytes
  automatic: boolean; // Si fue generado automáticamente
}

const AUTO_BACKUP_CONFIG_KEY = 'autoBackupConfig';
const STORED_BACKUPS_KEY = 'storedBackups';
const DEFAULT_INTERVAL_MINUTES = 60;

// Configuración por defecto
const DEFAULT_CONFIG: AutoBackupConfig = {
  enabled: false,
  intervalMinutes: DEFAULT_INTERVAL_MINUTES,
  maxBackups: 5,
  autoDownload: false,
  filePrefix: 'backup',
  customFolder: false
};

// Variable global para almacenar el ID del temporizador
let backupIntervalId: NodeJS.Timeout | null = null;
let autoBackupConfigListenerInstalled = false;

function persistirConfigAutoBackupSilenciosamente(config: AutoBackupConfig): void {
  localStorage.setItem(AUTO_BACKUP_CONFIG_KEY, JSON.stringify(config));
}

function obtenerIntervaloDesdeFrecuenciaLegacy(frequency?: BackupFrequency): number {
  switch (frequency) {
    case 'daily':
      return 24 * 60;
    case 'weekly':
      return 7 * 24 * 60;
    case 'monthly':
      return 30 * 24 * 60;
    default:
      return DEFAULT_INTERVAL_MINUTES;
  }
}

function normalizarIntervalo(minutes: unknown, fallback: number): number {
  const parsed = typeof minutes === 'number' ? minutes : Number(minutes);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.round(parsed);
  }
  return fallback;
}

function normalizarConfigAutoBackup(config: Partial<AutoBackupConfig> | null | undefined): AutoBackupConfig {
  const legacyFallback = obtenerIntervaloDesdeFrecuenciaLegacy(config?.frequency);
  const intervalMinutes = normalizarIntervalo(config?.intervalMinutes, legacyFallback);

  return {
    ...DEFAULT_CONFIG,
    ...config,
    intervalMinutes
  };
}

function actualizarConfigDespuesDeBackup(config: AutoBackupConfig, backupTimestamp: string): void {
  const updatedConfigBase: AutoBackupConfig = {
    ...config,
    lastBackup: backupTimestamp
  };
  const updatedConfig: AutoBackupConfig = {
    ...updatedConfigBase,
    nextBackup: calcularProximoBackup(updatedConfigBase).toISOString(),
  };

  persistirConfigAutoBackupSilenciosamente(updatedConfig);
  window.dispatchEvent(new CustomEvent('autoBackupConfigUpdated', { detail: updatedConfig }));
}

function detenerTemporizadorAutoBackup(): void {
  if (backupIntervalId) {
    clearTimeout(backupIntervalId);
    backupIntervalId = null;
  }
}

function programarSiguienteEjecucionAutoBackup(): void {
  const config = obtenerConfigAutoBackup();

  detenerTemporizadorAutoBackup();

  if (!config.enabled) {
    return;
  }

  const nextBackup = config.nextBackup ? new Date(config.nextBackup) : calcularProximoBackup(config);
  const delay = Math.max(nextBackup.getTime() - Date.now(), 1000);

  backupIntervalId = setTimeout(() => {
    if (debeEjecutarBackup()) {
      console.log('⏰ Es momento de ejecutar backup automático');
      ejecutarBackupAutomatico();
      return;
    }

    programarSiguienteEjecucionAutoBackup();
  }, delay);
}

/**
 * Obtener la configuración de backup automático
 */
export function obtenerConfigAutoBackup(): AutoBackupConfig {
  try {
    const config = localStorage.getItem(AUTO_BACKUP_CONFIG_KEY);
    if (config) {
      const parsedConfig = JSON.parse(config) as Partial<AutoBackupConfig>;
      return normalizarConfigAutoBackup(parsedConfig);
    }
    return DEFAULT_CONFIG;
  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration de sauvegarde automatique :', error);
    return DEFAULT_CONFIG;
  }
}

/**
 * Guardar la configuración de backup automático
 */
export function guardarConfigAutoBackup(config: AutoBackupConfig): void {
  try {
    const normalizedConfig = normalizarConfigAutoBackup(config);
    // Calcular el próximo backup
    normalizedConfig.nextBackup = calcularProximoBackup(normalizedConfig).toISOString();
    persistirConfigAutoBackupSilenciosamente(normalizedConfig);
    
    console.log('💾 Configuration de sauvegarde mise à jour :', {
      enabled: normalizedConfig.enabled,
      intervalMinutes: normalizedConfig.intervalMinutes,
      nextBackup: normalizedConfig.nextBackup
    });
    
    // ✅ NO LLAMAR inicializarAutoBackup aquí para evitar recursión
    // Solo dispatch el evento
    window.dispatchEvent(new CustomEvent('autoBackupConfigUpdated', { detail: normalizedConfig }));
  } catch (error) {
    console.error('Erreur lors de l’enregistrement de la configuration de sauvegarde automatique :', error);
  }
}

/**
 * Obtener todos los backups almacenados
 */
export function obtenerBackupsAlmacenados(): StoredBackup[] {
  try {
    const backups = localStorage.getItem(STORED_BACKUPS_KEY);
    if (backups) {
      return JSON.parse(backups);
    }
    return [];
  } catch (error) {
    console.error('Erreur lors de la récupération des sauvegardes stockées :', error);
    return [];
  }
}

/**
 * Guardar un backup
 */
export function guardarBackup(data: string, automatic: boolean = false): StoredBackup {
  const config = obtenerConfigAutoBackup();
  
  const newBackup: StoredBackup = {
    id: `backup_${Date.now()}`,
    timestamp: new Date().toISOString(),
    data: data,
    size: new Blob([data]).size,
    automatic: automatic
  };
  
  // ✅ CRÍTICO: Si el backup es grande, NO HACER NADA más que retornarlo
  const TAMAÑO_MAXIMO_BACKUP = 2 * 1024 * 1024; // 2MB máximo por backup
  if (newBackup.size > TAMAÑO_MAXIMO_BACKUP) {
    console.warn(`⚠️ Sauvegarde trop volumineuse (${formatearTamano(newBackup.size)}), elle ne sera pas enregistrée dans localStorage`);
    console.log('✅ La sauvegarde ne sera PAS enregistrée, retour de l’objet sans persistance');
    // ✅ RETORNAR INMEDIATAMENTE - NO intentar guardar NADA
    // La descarga se manejará desde ejecutarBackupAutomatico()
    return newBackup;
  }
  
  try {
    // ✅ LIMPIAR BACKUPS ANTIGUOS PRIMERO para hacer espacio
    try {
      const backupsAntiguos = obtenerBackupsAlmacenados();
      if (backupsAntiguos.length > 0) {
        console.log(`🧹 Nettoyage de ${backupsAntiguos.length} ancienne(s) sauvegarde(s) pour libérer de l’espace...`);
        localStorage.removeItem(STORED_BACKUPS_KEY);
      }
    } catch (cleanError) {
      console.warn('⚠️ Impossible de nettoyer les anciennes sauvegardes :', cleanError);
    }
    
    // Crear array con solo el nuevo backup
    const trimmedBackups = [newBackup];
    
    // ✅ INTENTAR GUARDAR CON MANEJO DE ERRORES
    try {
      localStorage.setItem(STORED_BACKUPS_KEY, JSON.stringify(trimmedBackups));
      console.log('✅ Sauvegarde enregistrée dans localStorage (1 sauvegarde)');
    } catch (quotaError) {
      console.error('❌ Erreur de quota dépassé lors de l’enregistrement de la sauvegarde :', quotaError);
      console.log('⚠️ La sauvegarde ne sera pas enregistrée dans localStorage, poursuite sans persistance');
      
      // Eliminar todos los backups de localStorage
      try {
        localStorage.removeItem(STORED_BACKUPS_KEY);
        console.log('✅ Sauvegardes supprimées de localStorage');
      } catch (removeError) {
        console.error('❌ Impossible de supprimer les sauvegardes :', removeError);
      }
      
      // NO lanzar excepción - solo retornar el objeto
      console.log('ℹ️ La sauvegarde n’a pas été persistée, mais l’objet est renvoyé');
    }
    
    return newBackup;
  } catch (error) {
    console.error('❌ Erreur lors du traitement de la sauvegarde :', error);
    // NO lanzar excepción - retornar el objeto de todas formas
    return newBackup;
  }
}

/**
 * Eliminar un backup específico
 */
export function eliminarBackup(backupId: string): void {
  try {
    const backups = obtenerBackupsAlmacenados();
    const filteredBackups = backups.filter(b => b.id !== backupId);
    localStorage.setItem(STORED_BACKUPS_KEY, JSON.stringify(filteredBackups));
  } catch (error) {
    console.error('Erreur lors de la suppression de la sauvegarde :', error);
  }
}

/**
 * Limpiar todos los backups automáticos antiguos
 */
export function limpiarBackupsAntiguos(): void {
  try {
    const backups = obtenerBackupsAlmacenados();
    const config = obtenerConfigAutoBackup();
    
    // Mantener solo los backups manuales y los últimos N automáticos
    const backupsAutomaticos = backups.filter(b => b.automatic).slice(0, config.maxBackups);
    const backupsManuales = backups.filter(b => !b.automatic);
    
    const cleanedBackups = [...backupsManuales, ...backupsAutomaticos];
    localStorage.setItem(STORED_BACKUPS_KEY, JSON.stringify(cleanedBackups));
  } catch (error) {
    console.error('Erreur lors du nettoyage des anciennes sauvegardes :', error);
  }
}

/**
 * Calcular la fecha del próximo backup basado en la configuración
 */
export function calcularProximoBackup(config: AutoBackupConfig): Date {
  const intervalMinutes = normalizarIntervalo(config.intervalMinutes, DEFAULT_INTERVAL_MINUTES);
  const nowMs = Date.now();
  const lastBackupMs = config.lastBackup ? new Date(config.lastBackup).getTime() : nowMs;
  const baseMs = Number.isFinite(lastBackupMs) ? Math.max(lastBackupMs, nowMs) : nowMs;
  return new Date(baseMs + (intervalMinutes * 60 * 1000));
}

/**
 * Verificar si es momento de ejecutar un backup
 */
export function debeEjecutarBackup(): boolean {
  const config = obtenerConfigAutoBackup();
  
  if (!config.enabled) {
    return false;
  }
  
  const now = new Date();
  const nextBackup = config.nextBackup ? new Date(config.nextBackup) : null;
  
  if (!nextBackup) {
    console.log('⏰ Primera ejecución de backup - programando backup inmediato');
    return true; // Primera vez
  }
  
  const shouldBackup = now >= nextBackup;
  
  if (shouldBackup) {
    console.log('⏰ Es momento de ejecutar backup:', {
      ahora: now.toLocaleString('fr-CA'),
      programado: nextBackup.toLocaleString('fr-CA')
    });
  }
  
  return shouldBackup;
}

/**
 * Ejecutar backup automático
 */
export function ejecutarBackupAutomatico(): boolean {
  try {
    console.log('🔄 Démarrage de la sauvegarde automatique...');
    const config = obtenerConfigAutoBackup();
    
    // ✅ VERIFICAR SI LOS BACKUPS ESTÁN REALMENTE HABILITADOS
    if (!config.enabled) {
      console.log('⏸️ Les sauvegardes automatiques sont désactivées, arrêt...');
      return false;
    }
    
    // Crear backup de todo el localStorage (excepto los backups mismos)
    const backup: Record<string, any> = {};
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key !== STORED_BACKUPS_KEY) {
        const value = localStorage.getItem(key);
        if (value) {
          backup[key] = value;
        }
      }
    }
    
    console.log(`📦 Données à sauvegarder : ${Object.keys(backup).length} clés`);
    
    const backupData = JSON.stringify(backup, null, 2);
    const backupSize = new Blob([backupData]).size;
    const backupSizeMB = (backupSize / 1024 / 1024).toFixed(2);
    
    console.log(`📊 Taille de la sauvegarde : ${backupSizeMB} MB`);
    
    // ✅ SI EL BACKUP ES MUY GRANDE (>2MB), SOLO DESCARGAR - NO GUARDAR EN LOCALSTORAGE
    const TAMAÑO_MAXIMO = 2 * 1024 * 1024; // 2MB
    
    if (backupSize > TAMAÑO_MAXIMO) {
      console.warn(`⚠️ Sauvegarde trop volumineuse (${backupSizeMB} MB), téléchargement direct...`);
      console.log('💡 Elle ne sera pas enregistrée dans localStorage pour éviter les erreurs de quota');
      
      // Crear objeto de backup temporal solo para descargar
      const tempBackup: StoredBackup = {
        id: `backup_${Date.now()}`,
        timestamp: new Date().toISOString(),
        data: backupData,
        size: backupSize,
        automatic: true
      };
      
      // Descargar automáticamente
      console.log('📥 Téléchargement automatique de la sauvegarde...');
      descargarBackup(tempBackup, config.filePrefix);
      
      console.log('✅ Sauvegarde téléchargée avec succès (non enregistrée dans localStorage)');
      
      // Actualizar solo la fecha del último backup en config (sin guardar el backup completo)
      try {
        actualizarConfigDespuesDeBackup(config, tempBackup.timestamp);
      } catch (configError) {
        console.warn('⚠️ Impossible de mettre à jour la date de la dernière sauvegarde');
      }
      
      return true;
    }
    
    // Si el backup es pequeño (<2MB), intentar guardarlo
    try {
      const savedBackup = guardarBackup(backupData, true);
      console.log(`✅ Sauvegarde enregistrée : ${savedBackup.id} (${formatearTamano(savedBackup.size)})`);
      
      // Auto-descargar si está configurado
      if (config.autoDownload) {
        console.log('📥 Téléchargement automatique de la sauvegarde...');
        descargarBackup(savedBackup, config.filePrefix);
      }
      
      // Limpiar backups antiguos
      limpiarBackupsAntiguos();

      actualizarConfigDespuesDeBackup(config, savedBackup.timestamp);
      
      console.log('✅ Sauvegarde automatique exécutée avec succès');
      console.log(`📅 Prochaine sauvegarde : ${config.nextBackup ? new Date(config.nextBackup).toLocaleString('fr-CA') : 'Non planifiée'}`);
      
      return true;
    } catch (saveError) {
      console.error('❌ Erreur lors de l’enregistrement de la sauvegarde :', saveError);
      
      // Fallback: Descargar directamente si falla guardar
      console.log('📥 Téléchargement de la sauvegarde en alternative...');
      const tempBackup: StoredBackup = {
        id: `backup_${Date.now()}`,
        timestamp: new Date().toISOString(),
        data: backupData,
        size: backupSize,
        automatic: true
      };
      
      descargarBackup(tempBackup, config.filePrefix);
      console.log('✅ Sauvegarde téléchargée (l’enregistrement a échoué)');
      actualizarConfigDespuesDeBackup(config, tempBackup.timestamp);
      
      return true;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l’exécution de la sauvegarde automatique :', error);
    return false;
  }
}

/**
 * Descargar un backup específico
 */
export async function descargarBackup(backup: StoredBackup, customPrefix?: string): Promise<void> {
  try {
    const config = obtenerConfigAutoBackup();
    const prefix = customPrefix || config.filePrefix || 'backup';
    const fecha = new Date(backup.timestamp).toISOString().split('T')[0];
    const hora = new Date(backup.timestamp).toTimeString().split(' ')[0].replace(/:/g, '-');
    const tipo = backup.automatic ? 'auto' : 'manual';
    const nombreArchivo = `${prefix}-${tipo}-${fecha}-${hora}.json`;
    
    console.log('📥 Téléchargement de la sauvegarde :', {
      id: backup.id,
      tamaño: formatearTamano(backup.size),
      automático: backup.automatic,
      carpetaPersonalizada: config.customFolder,
      nombreArchivo: nombreArchivo
    });
    
    // Si está configurada carpeta personalizada y es soportada, intentar guardar ahí
    if (config.customFolder && soportaFileSystemAccess() && tieneCarpetaSeleccionada()) {
      console.log('📁 Tentative d’enregistrement dans le dossier personnalisé...');
      const resultado = await guardarArchivoEnCarpeta(nombreArchivo, backup.data);
      
      if (resultado.success) {
        console.log(`✅ Sauvegarde enregistrée dans le dossier personnalisé : ${nombreArchivo}`);
        return;
      } else {
        console.warn('⚠️ Impossible d’enregistrer dans le dossier personnalisé, utilisation du téléchargement standard');
        console.warn('Raison :', resultado.error || 'Inconnue');
      }
    } else {
      if (config.customFolder) {
        console.log('ℹ️ Dossier personnalisé configuré mais indisponible :');
        console.log('  - Prise en charge de File System Access :', soportaFileSystemAccess());
        console.log('  - Dossier sélectionné :', tieneCarpetaSeleccionada());
      }
    }
    
    // Fallback: Descarga normal
    console.log('📥 Utilisation du téléchargement standard du navigateur...');
    const blob = new Blob([backup.data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('✅ Téléchargement lancé :', nombreArchivo);
  } catch (error) {
    console.error('❌ Erreur lors du téléchargement de la sauvegarde :', error);
    throw error;
  }
}

/**
 * Descargar todos los backups como archivos ZIP simulado
 * (Descarga cada uno individualmente debido a limitaciones del navegador)
 */
export function descargarTodosLosBackups(): number {
  try {
    const backups = obtenerBackupsAlmacenados();
    const config = obtenerConfigAutoBackup();
    
    backups.forEach((backup, index) => {
      // Pequeño delay entre descargas para evitar bloqueos del navegador
      setTimeout(() => {
        descargarBackup(backup, config.filePrefix);
      }, index * 200);
    });
    
    return backups.length;
  } catch (error) {
    console.error('Error al descargar todos los backups:', error);
    return 0;
  }
}

/**
 * Formatear tamaño de archivo
 */
export function formatearTamano(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Formatear fecha de manera legible
 */
export function formatearFecha(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Obtener el tiempo restante hasta el próximo backup
 */
export function obtenerTiempoRestante(config: AutoBackupConfig): string {
  if (!config.enabled || !config.nextBackup) {
    return 'Désactivé';
  }
  
  const now = new Date();
  const next = new Date(config.nextBackup);
  const diff = next.getTime() - now.getTime();
  
  if (diff <= 0) {
    return 'Bientôt';
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}j ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}min`;
  } else {
    return `${minutes}min`;
  }
}

/**
 * Inicializar el sistema de backup automático
 * Debe llamarse al cargar la aplicación
 */
export function inicializarAutoBackup(): void {
  const config = obtenerConfigAutoBackup();
  
  // Limpiar temporizador anterior si existe
  detenerTemporizadorAutoBackup();

  if (!autoBackupConfigListenerInstalled) {
    window.addEventListener('autoBackupConfigUpdated', () => {
      programarSiguienteEjecucionAutoBackup();
    });
    autoBackupConfigListenerInstalled = true;
  }
  
  if (!config.enabled) {
    console.log('⏸️ Sistema de backup automático desactivado');
    console.log('💡 Para activarlo, ve a Configuración > Backups Automáticos');
    console.log('💡 IMPORTANTE: Los backups automáticos pueden llenar localStorage rápidamente');
    console.log('💡 Se recomienda activar "Auto-descarga" para guardar backups en tu PC');
    return;
  }
  
  // ✅ VERIFICACIÓN DE SEGURIDAD: No ejecutar backup si hay problemas de espacio
  try {
    const backupsExistentes = localStorage.getItem(STORED_BACKUPS_KEY);
    if (backupsExistentes) {
      const tamañoBackups = new Blob([backupsExistentes]).size;
      const limiteSeguro = 3 * 1024 * 1024; // 3MB
      
      if (tamañoBackups > limiteSeguro) {
        console.warn('⚠️ ADVERTENCIA: Backups exceden el límite seguro');
        console.warn('⚠️ Sistema de backup automático DESHABILITADO por seguridad');
        console.warn('💡 Ejecuta limpiarBackups() para liberar espacio');
        return;
      }
    }
  } catch (e) {
    console.warn('⚠️ No se pudo verificar tamaño de backups, deshabilitando por seguridad');
    return;
  }
  
  // Verificar inmediatamente si hay un backup pendiente
  if (debeEjecutarBackup()) {
    console.log('⏰ Ejecutando backup pendiente...');
    ejecutarBackupAutomatico();
  } else {
    programarSiguienteEjecucionAutoBackup();
  }
  
  console.log('🔄 Sistema de backup automático inicializado');
  console.log(`📅 Próximo backup: ${config.nextBackup ? new Date(config.nextBackup).toLocaleString('fr-CA') : 'No programado'}`);
}

/**
 * Detener el sistema de backup automático
 */
export function detenerAutoBackup(): void {
  if (backupIntervalId) {
    clearTimeout(backupIntervalId);
    backupIntervalId = null;
    console.log('🛑 Sistema de backup automático detenido');
  }
}

/**
 * Función de diagnóstico para verificar el estado del sistema
 */
export function diagnosticarAutoBackup(): void {
  const config = obtenerConfigAutoBackup();
  const backups = obtenerBackupsAlmacenados();
  const now = new Date();
  const nextBackup = config.nextBackup ? new Date(config.nextBackup) : null;
  
  console.log('🔍 ==================== DIAGNÓSTICO DE BACKUP AUTOMÁTICO ====================');
  console.log('📊 Configuración actual:');
  console.log('  - Habilitado:', config.enabled);
  console.log('  - Intervalo (minutos):', config.intervalMinutes);
  console.log('  - Máximo de backups:', config.maxBackups);
  console.log('  - Auto-descarga:', config.autoDownload);
  console.log('  - Prefijo de archivo:', config.filePrefix);
  console.log('  - Carpeta personalizada:', config.customFolder);
  console.log('  - Nombre de carpeta:', config.folderName || 'No seleccionada');
  console.log('');
  console.log('⏰ Tiempos:');
  console.log('  - Último backup:', config.lastBackup ? new Date(config.lastBackup).toLocaleString('fr-CA') : 'Nunca');
  console.log('  - Próximo backup:', nextBackup ? nextBackup.toLocaleString('fr-CA') : 'No programado');
  console.log('  - Tiempo restante:', obtenerTiempoRestante(config));
  console.log('  - Fecha/hora actual:', now.toLocaleString('fr-CA'));
  console.log('');
  console.log('📦 Backups almacenados:');
  console.log('  - Total:', backups.length);
  console.log('  - Automáticos:', backups.filter(b => b.automatic).length);
  console.log('  - Manuales:', backups.filter(b => !b.automatic).length);
  console.log('');
  console.log('🔄 Estado del sistema:');
  console.log('  - Intervalo activo:', backupIntervalId !== null);
  console.log('  - Debe ejecutar backup ahora:', debeEjecutarBackup());
  console.log('===========================================================================');
}

/**
 * ✅ FUNCIÓN DE EMERGENCIA: Limpiar TODOS los backups de localStorage
 * Usar solo si tienes error de cuota excedida
 */
export function limpiarTodosLosBackups(): void {
  try {
    console.log('🧹 ==================== LIMPIEZA TOTAL DE BACKUPS ====================');
    console.log('⚠️ Esta operación eliminará TODOS los backups almacenados en localStorage');
    
    const backupsAnteriores = obtenerBackupsAlmacenados();
    console.log(`📦 Backups a eliminar: ${backupsAnteriores.length}`);
    
    if (backupsAnteriores.length > 0) {
      const tamañoTotal = backupsAnteriores.reduce((sum, b) => sum + b.size, 0);
      console.log(`💾 Espacio a liberar: ${formatearTamano(tamañoTotal)}`);
      
      // Eliminar todos los backups
      localStorage.removeItem(STORED_BACKUPS_KEY);
      console.log('✅ Todos los backups han sido eliminados de localStorage');
      console.log('💡 Recomendación: Descarga backups manualmente en lugar de almacenarlos');
      console.log('💡 Configura "Auto-descarga" en ON para descargar backups directamente');
    } else {
      console.log('ℹ️ No hay backups para eliminar');
    }
    
    console.log('=====================================================================');
  } catch (error) {
    console.error('❌ Error al limpiar backups:', error);
  }
}

/**
 * ✅ VERIFICAR TAMAÑO DE BACKUPS EN LOCALSTORAGE
 */
export function verificarTamañoBackups(): void {
  try {
    console.log('📊 ==================== ANÁLISIS DE BACKUPS ====================');
    
    const backups = obtenerBackupsAlmacenados();
    const backupsData = localStorage.getItem(STORED_BACKUPS_KEY);
    
    if (!backupsData) {
      console.log('ℹ️ No hay backups almacenados');
      console.log('===============================================================');
      return;
    }
    
    const tamañoBackupsKey = new Blob([backupsData]).size;
    console.log(`📦 Total de backups: ${backups.length}`);
    console.log(`💾 Tamaño de clave 'storedBackups': ${formatearTamano(tamañoBackupsKey)}`);
    console.log('');
    console.log('📋 Detalle de backups:');
    
    backups.forEach((backup, index) => {
      console.log(`  ${index + 1}. ${backup.automatic ? '🤖 Auto' : '👤 Manual'} | ${formatearFecha(backup.timestamp)} | ${formatearTamano(backup.size)}`);
    });
    
    const tamañoTotal = backups.reduce((sum, b) => sum + b.size, 0);
    console.log('');
    console.log(`💾 Tamaño total de datos: ${formatearTamano(tamañoTotal)}`);
    
    // Límite de localStorage (aproximado: 5-10MB)
    const limiteAproximado = 5 * 1024 * 1024; // 5MB
    const porcentajeUso = (tamañoBackupsKey / limiteAproximado) * 100;
    
    console.log(`📊 Uso estimado de cuota: ${porcentajeUso.toFixed(1)}% del límite de 5MB`);
    
    if (porcentajeUso > 80) {
      console.warn('⚠️ ADVERTENCIA: Uso de cuota muy alto (>80%)');
      console.warn('💡 Ejecuta limpiarTodosLosBackups() para liberar espacio');
    } else if (porcentajeUso > 50) {
      console.log('⚠️ Uso moderado de cuota (>50%)');
      console.log('💡 Considera limpiar backups antiguos');
    } else {
      console.log('✅ Uso de cuota saludable (<50%)');
    }
    
    console.log('===============================================================');
  } catch (error) {
    console.error('❌ Error al verificar tamaño de backups:', error);
  }
}