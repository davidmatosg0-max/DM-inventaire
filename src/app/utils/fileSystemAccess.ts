/**
 * Utilidades para File System Access API
 * Permite seleccionar y guardar archivos en carpetas personalizadas
 * Compatible solo con navegadores modernos (Chrome, Edge)
 */

// Variable global para mantener el handle de la carpeta seleccionada
let directoryHandle: any = null;

/**
 * Verificar si el navegador soporta File System Access API
 */
export function soportaFileSystemAccess(): boolean {
  // Verificar si estamos en un iframe
  if (window.self !== window.top) {
    return false; // No soportado en iframes por razones de seguridad
  }
  
  return 'showDirectoryPicker' in window;
}

/**
 * Solicitar permiso para acceder a la carpeta
 */
async function solicitarPermisoDirectorio(handle: any): Promise<boolean> {
  try {
    const permission = await handle.queryPermission({ mode: 'readwrite' });
    
    if (permission === 'granted') {
      return true;
    }
    
    if (permission === 'prompt') {
      const newPermission = await handle.requestPermission({ mode: 'readwrite' });
      return newPermission === 'granted';
    }
    
    return false;
  } catch (error) {
    console.error('Error al solicitar permiso:', error);
    return false;
  }
}

/**
 * Seleccionar carpeta de destino para backups
 */
export async function seleccionarCarpetaBackup(): Promise<{ success: boolean; folderName?: string; error?: string }> {
  if (!soportaFileSystemAccess()) {
    return {
      success: false,
      error: 'Votre navigateur ne supporte pas la sélection de dossier. Utilisez Chrome ou Edge moderne.'
    };
  }
  
  try {
    // @ts-ignore - File System Access API
    const handle = await window.showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents'
    });
    
    // Solicitar permisos
    const hasPermission = await solicitarPermisoDirectorio(handle);
    
    if (!hasPermission) {
      return {
        success: false,
        error: 'Permission refusée pour accéder au dossier'
      };
    }
    
    // Guardar el handle globalmente
    directoryHandle = handle;
    
    // Intentar guardar en IndexedDB para persistencia
    try {
      await guardarHandleEnIndexedDB(handle);
    } catch (e) {
      console.warn('No se pudo persistir el handle:', e);
    }
    
    return {
      success: true,
      folderName: handle.name
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Sélection de dossier annulée'
      };
    }
    
    console.error('Error al seleccionar carpeta:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la sélection du dossier'
    };
  }
}

/**
 * Guardar archivo en la carpeta seleccionada
 */
export async function guardarArchivoEnCarpeta(
  nombreArchivo: string,
  contenido: string
): Promise<{ success: boolean; error?: string }> {
  if (!directoryHandle) {
    // Intentar recuperar desde IndexedDB
    try {
      directoryHandle = await recuperarHandleDeIndexedDB();
      if (!directoryHandle) {
        return {
          success: false,
          error: 'Aucun dossier sélectionné. Veuillez d\'abord sélectionner un dossier.'
        };
      }
    } catch (e) {
      return {
        success: false,
        error: 'Aucun dossier sélectionné. Veuillez d\'abord sélectionner un dossier.'
      };
    }
  }
  
  try {
    // Verificar permisos nuevamente
    const hasPermission = await solicitarPermisoDirectorio(directoryHandle);
    
    if (!hasPermission) {
      return {
        success: false,
        error: 'Permission refusée pour écrire dans le dossier'
      };
    }
    
    // Crear el archivo
    const fileHandle = await directoryHandle.getFileHandle(nombreArchivo, { create: true });
    
    // Crear un writable stream
    const writable = await fileHandle.createWritable();
    
    // Escribir el contenido
    await writable.write(contenido);
    
    // Cerrar el stream
    await writable.close();
    
    return { success: true };
  } catch (error: any) {
    console.error('Error al guardar archivo:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de l\'enregistrement du fichier'
    };
  }
}

/**
 * Verificar si hay una carpeta seleccionada
 */
export function tieneCarpetaSeleccionada(): boolean {
  return directoryHandle !== null;
}

/**
 * Obtener el nombre de la carpeta seleccionada
 */
export function obtenerNombreCarpeta(): string | null {
  return directoryHandle ? directoryHandle.name : null;
}

/**
 * Limpiar la carpeta seleccionada
 */
export function limpiarCarpetaSeleccionada(): void {
  directoryHandle = null;
  limpiarHandleDeIndexedDB();
}

/**
 * 📥 FUNCIÓN UNIVERSAL DE DESCARGA CON CARPETA PREDEFINIDA
 * 
 * Intenta guardar en la carpeta predefinida si está configurada,
 * de lo contrario usa descarga normal del navegador.
 * 
 * @param nombreArchivo - Nombre del archivo a guardar
 * @param contenido - Contenido del archivo (string o Blob)
 * @param tipoMime - Tipo MIME del archivo (por defecto 'application/json')
 * @returns Promise<{success: boolean, usedCustomFolder: boolean, error?: string}>
 */
export async function descargarArchivoConCarpetaPredefinida(
  nombreArchivo: string,
  contenido: string | Blob,
  tipoMime: string = 'application/json'
): Promise<{ success: boolean; usedCustomFolder: boolean; error?: string }> {
  // Obtener configuración de backup automático
  let usarCarpetaPersonalizada = false;
  
  try {
    const config = localStorage.getItem('autoBackupConfig');
    if (config) {
      const parsedConfig = JSON.parse(config);
      usarCarpetaPersonalizada = parsedConfig.customFolder === true;
    }
  } catch (e) {
    // Ignorar error de configuración
  }
  
  // Si está configurada carpeta personalizada, intentar usarla
  if (usarCarpetaPersonalizada && soportaFileSystemAccess()) {
    // Intentar recuperar handle si no está en memoria
    if (!directoryHandle) {
      try {
        directoryHandle = await recuperarHandleDeIndexedDB();
      } catch (e) {
        console.warn('No se pudo recuperar carpeta desde IndexedDB');
      }
    }
    
    if (directoryHandle) {
      const contenidoString = typeof contenido === 'string' ? contenido : await contenido.text();
      const resultado = await guardarArchivoEnCarpeta(nombreArchivo, contenidoString);
      
      if (resultado.success) {
        return { success: true, usedCustomFolder: true };
      }
    }
  }
  
  // Fallback: Descarga normal del navegador
  try {
    const blob = typeof contenido === 'string' 
      ? new Blob([contenido], { type: tipoMime })
      : contenido;
      
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return { success: true, usedCustomFolder: false };
  } catch (error: any) {
    return {
      success: false,
      usedCustomFolder: false,
      error: error.message || 'Error al descargar archivo'
    };
  }
}

// ============================================
// Persistencia en IndexedDB (Experimental)
// ============================================

const DB_NAME = 'BanqueAlimentaireBackup';
const STORE_NAME = 'directoryHandles';
const HANDLE_KEY = 'backupDirectory';

/**
 * Guardar handle en IndexedDB para persistencia entre sesiones
 */
async function guardarHandleEnIndexedDB(handle: any): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      store.put(handle, HANDLE_KEY);
      
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      
      transaction.onerror = () => reject(transaction.error);
    };
    
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Recuperar handle de IndexedDB
 */
async function recuperarHandleDeIndexedDB(): Promise<any> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => {
      const db = request.result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.close();
        resolve(null);
        return;
      }
      
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(HANDLE_KEY);
      
      getRequest.onsuccess = () => {
        db.close();
        resolve(getRequest.result || null);
      };
      
      getRequest.onerror = () => {
        db.close();
        reject(getRequest.error);
      };
    };
    
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * Limpiar handle de IndexedDB
 */
function limpiarHandleDeIndexedDB(): void {
  const request = indexedDB.open(DB_NAME, 1);
  
  request.onsuccess = () => {
    const db = request.result;
    
    if (db.objectStoreNames.contains(STORE_NAME)) {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.delete(HANDLE_KEY);
    }
    
    db.close();
  };
}

/**
 * Inicializar el sistema de archivos
 * Intenta recuperar la carpeta seleccionada previamente
 */
export async function inicializarFileSystem(): Promise<void> {
  try {
    directoryHandle = await recuperarHandleDeIndexedDB();
    
    if (directoryHandle) {
      // Verificar si aún tenemos permisos
      const hasPermission = await solicitarPermisoDirectorio(directoryHandle);
      
      if (!hasPermission) {
        console.log('⚠️ Permisos revocados para la carpeta guardada');
        directoryHandle = null;
        limpiarHandleDeIndexedDB();
      } else {
        console.log('✅ Carpeta de backup restaurada:', directoryHandle.name);
      }
    }
  } catch (error) {
    console.error('Error al inicializar sistema de archivos:', error);
    directoryHandle = null;
  }
}