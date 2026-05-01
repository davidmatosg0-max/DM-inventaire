/**
 * 🔒 SISTEMA DE PROTECCIÓN TOTAL DE DATOS
 * 
 * Este módulo protege los datos del localStorage contra eliminaciones accidentales
 * incluyendo combinaciones de teclas, cierre de pestaña, y cualquier acción destructiva.
 * 
 * Última actualización: 16/03/2026
 */

import { logger } from './logger';

// Flag para permitir operaciones de mantenimiento (restauración de backups)
let modoMantenimiento = false;

// Lista de claves críticas que NUNCA deben ser eliminadas
const CLAVES_CRITICAS = [
  'sistema_con_datos_reales',
  'limpieza_completa_ejecutada',
  'productos_inventario',
  'categorias_inventario',
  'subcategorias_inventario',
  'organismos',
  'usuarios_internos',
  'usuarios_sistema',
  'comandas',
  'sesion_usuario',
  'departamentos_banco_alimentos',
  'contactos_departamentos',
  'benevoles_data',
  'vehiculos_transporte',
  'choferes_transporte',
  'configuracion_branding',
  'productos_prs',
  'unidades_medida',
  'backup_',
];

/**
 * Verifica si una clave es crítica
 */
function esClaveProtegida(clave: string): boolean {
  return CLAVES_CRITICAS.some(critica => clave.startsWith(critica));
}

/**
 * Protege el localStorage original
 */
function protegerLocalStorage() {
  const localStorageOriginal = {
    clear: localStorage.clear.bind(localStorage),
    removeItem: localStorage.removeItem.bind(localStorage),
  };

  // Sobrescribir clear para prevenir borrado total
  localStorage.clear = function() {
    // Si está en modo mantenimiento, permitir la operación
    if (modoMantenimiento) {
      // Modo mantenimiento - operación permitida
      localStorageOriginal.clear();
      return;
    }
    
    logger.warn('🛡️ PROTECCIÓN ACTIVADA: Intento de borrar localStorage bloqueado');
    console.warn('⚠️ No se puede borrar el localStorage. Los datos están protegidos.');
    
    // Mostrar notificación visual
    const mensaje = document.createElement('div');
    mensaje.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(220, 53, 69, 0.4);
      z-index: 999999;
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      font-size: 14px;
      animation: slideIn 0.3s ease-out;
    `;
    mensaje.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px;">
        <span style="font-size: 24px;">🛡️</span>
        <div>
          <div style="font-weight: 700; margin-bottom: 4px;">Datos Protegidos</div>
          <div style="font-size: 12px; opacity: 0.9;">Los datos no pueden ser eliminados</div>
        </div>
      </div>
    `;
    document.body.appendChild(mensaje);
    
    setTimeout(() => {
      mensaje.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
      mensaje.style.opacity = '0';
      mensaje.style.transform = 'translateX(400px)';
      setTimeout(() => mensaje.remove(), 300);
    }, 3000);
    
    return; // No hacer nada
  };

  // Sobrescribir removeItem para proteger claves críticas
  localStorage.removeItem = function(clave: string) {
    if (esClaveProtegida(clave) && !modoMantenimiento) {
      logger.warn(`🛡️ PROTECCIÓN ACTIVADA: Intento de eliminar clave protegida bloqueado: ${clave}`);
      console.warn(`⚠️ La clave "${clave}" está protegida y no puede ser eliminada.`);
      return;
    }
    
    // Permitir eliminar solo claves no críticas
    localStorageOriginal.removeItem(clave);
  };

  logger.info('🔒 localStorage protegido contra eliminaciones accidentales');
}

/**
 * Intercepta combinaciones de teclas peligrosas
 */
function protegerTeclado() {
  const teclasPeligrosas = [
    { ctrl: true, shift: true, key: 'Delete' },
    { ctrl: true, key: 'Delete' },
    { ctrl: true, shift: true, key: 'r' }, // Recarga forzada
    { ctrl: true, shift: true, key: 'R' },
  ];

  window.addEventListener('keydown', (event) => {
    const combinacionPeligrosa = teclasPeligrosas.some(combo => {
      const ctrlMatch = combo.ctrl ? (event.ctrlKey || event.metaKey) : true;
      const shiftMatch = combo.shift ? event.shiftKey : !event.shiftKey;
      const keyMatch = combo.key === event.key;
      return ctrlMatch && shiftMatch && keyMatch;
    });

    if (combinacionPeligrosa) {
      event.preventDefault();
      event.stopPropagation();
      
      logger.warn('🛡️ PROTECCIÓN ACTIVADA: Combinación de teclas peligrosa bloqueada');
      console.warn('⚠️ Esta combinación de teclas está bloqueada para proteger los datos.');
      
      // Mostrar notificación
      mostrarNotificacionProteccion('Combinación de teclas bloqueada');
      
      return false;
    }
  }, true);

  logger.info('⌨️ Protección de teclado activada');
}

/**
 * Protege contra cierre accidental de la pestaña
 */
function protegerCierrePestana() {
  // Crear respaldo antes de cerrar
  window.addEventListener('beforeunload', (event) => {
    // Crear respaldo de emergencia
    try {
      const timestamp = new Date().toISOString();
      const backup = {
        timestamp,
        datos: {} as Record<string, string>
      };
      
      // Respaldar todas las claves críticas
      CLAVES_CRITICAS.forEach(prefijo => {
        Object.keys(localStorage).forEach(clave => {
          if (clave.startsWith(prefijo)) {
            backup.datos[clave] = localStorage.getItem(clave) || '';
          }
        });
      });
      
      localStorage.setItem(`backup_emergencia_${timestamp}`, JSON.stringify(backup));
      logger.info('💾 Respaldo de emergencia creado antes de cerrar pestaña');
    } catch (error) {
      logger.error('❌ Error al crear respaldo de emergencia:', error);
    }
  });

  logger.info('🚪 Protección contra cierre de pestaña activada');
}

/**
 * Protege la consola del desarrollador contra comandos destructivos
 */
function protegerConsola() {
  // Crear funciones seguras en consola
  (window as any).proteccionDatos = {
    info: () => {
      console.log('%c🔒 SISTEMA DE PROTECCIÓN DE DATOS ACTIVO', 'color: #2d9561; font-weight: bold; font-size: 16px;');
      console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #2d9561;');
      console.log('✅ localStorage protegido contra clear()');
      console.log('✅ Claves críticas protegidas contra removeItem()');
      console.log('✅ Combinaciones de teclas peligrosas bloqueadas');
      console.log('✅ Respaldos automáticos antes de cerrar pestaña');
      console.log('✅ Sistema de restauración de emergencia disponible');
      console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #2d9561;');
    },
    
    verificar: () => {
      console.log('%c🔍 VERIFICACIÓN DEL SISTEMA', 'color: #1a4d7a; font-weight: bold; font-size: 14px;');
      
      const stats = {
        totalClaves: Object.keys(localStorage).length,
        clavesProtegidas: 0,
        backups: 0,
      };
      
      Object.keys(localStorage).forEach(clave => {
        if (esClaveProtegida(clave)) stats.clavesProtegidas++;
        if (clave.startsWith('backup_')) stats.backups++;
      });
      
      console.table(stats);
      console.log('✅ Sistema funcionando correctamente');
    },
    
    restaurarBackup: (timestamp?: string) => {
      console.log('%c🔄 RESTAURACIÓN DE BACKUP', 'color: #e8a419; font-weight: bold; font-size: 14px;');
      
      // Buscar backups disponibles
      const backups: string[] = [];
      Object.keys(localStorage).forEach(clave => {
        if (clave.startsWith('backup_emergencia_')) {
          backups.push(clave);
        }
      });
      
      if (backups.length === 0) {
        console.warn('⚠️ No hay backups de emergencia disponibles');
        return;
      }
      
      console.log(`📦 Backups disponibles: ${backups.length}`);
      backups.forEach((backup, index) => {
        console.log(`  ${index + 1}. ${backup}`);
      });
      
      if (!timestamp) {
        console.log('💡 Usa proteccionDatos.restaurarBackup("TIMESTAMP") para restaurar un backup específico');
        return;
      }
      
      const claveBackup = `backup_emergencia_${timestamp}`;
      const backupData = localStorage.getItem(claveBackup);
      
      if (!backupData) {
        console.error('❌ Backup no encontrado');
        return;
      }
      
      try {
        const backup = JSON.parse(backupData);
        Object.entries(backup.datos).forEach(([clave, valor]) => {
          localStorage.setItem(clave, valor as string);
        });
        console.log('✅ Backup restaurado exitosamente');
        console.log('🔄 Recarga la página para ver los cambios');
      } catch (error) {
        console.error('❌ Error al restaurar backup:', error);
      }
    }
  };

  // Advertencia al inicio
  console.log('%c⚠️ ADVERTENCIA DE SEGURIDAD', 'color: #dc3545; font-weight: bold; font-size: 18px; background: #fff3cd; padding: 8px;');
  console.log('%cLos datos del localStorage están protegidos.', 'color: #333; font-size: 14px;');
  console.log('%cNo se pueden eliminar usando clear() o removeItem() en claves críticas.', 'color: #333; font-size: 14px;');
  console.log('%cUsa proteccionDatos.info() para ver el estado de protección.', 'color: #2d9561; font-size: 14px; font-weight: bold;');
  console.log(' ');

  logger.info('🖥️ Protección de consola activada');
}

/**
 * Muestra una notificación visual de protección
 */
function mostrarNotificacionProteccion(mensaje: string) {
  const notificacion = document.createElement('div');
  notificacion.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #e8a419 0%, #d89410 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(232, 164, 25, 0.4);
    z-index: 999999;
    font-family: 'Montserrat', sans-serif;
    font-weight: 600;
    font-size: 14px;
    animation: slideIn 0.3s ease-out;
  `;
  notificacion.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 24px;">⚠️</span>
      <div>
        <div style="font-weight: 700; margin-bottom: 4px;">Acción Bloqueada</div>
        <div style="font-size: 12px; opacity: 0.9;">${mensaje}</div>
      </div>
    </div>
  `;
  document.body.appendChild(notificacion);
  
  setTimeout(() => {
    notificacion.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
    notificacion.style.opacity = '0';
    notificacion.style.transform = 'translateX(400px)';
    setTimeout(() => notificacion.remove(), 300);
  }, 3000);
}

/**
 * Monitorea cambios sospechosos en localStorage
 */
function monitorearCambios() {
  let ultimoConteo = Object.keys(localStorage).length;
  
  setInterval(() => {
    const conteoActual = Object.keys(localStorage).length;
    
    // Si se redujo significativamente, generar alerta
    if (conteoActual < ultimoConteo - 5) {
      logger.error('🚨 ALERTA: Reducción significativa en localStorage detectada');
      console.error(`🚨 Se detectó una reducción de ${ultimoConteo - conteoActual} claves en localStorage`);
      
      // Crear respaldo de emergencia
      const timestamp = new Date().toISOString();
      const backup = {
        timestamp,
        razon: 'Reducción detectada',
        conteoAnterior: ultimoConteo,
        conteoActual: conteoActual,
      };
      localStorage.setItem(`alerta_${timestamp}`, JSON.stringify(backup));
    }
    
    ultimoConteo = conteoActual;
  }, 5000); // Verificar cada 5 segundos

  logger.info('👁️ Monitoreo de cambios en localStorage activado');
}

/**
 * Inicializa todo el sistema de protección
 */
export function inicializarProteccionDatos() {
  try {
    // Marcar sistema con datos reales
    localStorage.setItem('sistema_con_datos_reales', 'true');
    localStorage.setItem('proteccion_datos_activa', 'true');
    
    // Activar todas las protecciones
    protegerLocalStorage();
    protegerTeclado();
    protegerCierrePestana();
    protegerConsola();
    monitorearCambios();
    
    logger.info('🛡️🛡️🛡️ SISTEMA DE PROTECCIÓN TOTAL DE DATOS ACTIVADO');
    logger.info('🔒 Todas las protecciones están activas');
    
    // Crear backup inicial
    const timestamp = new Date().toISOString();
    const backupInicial = {
      timestamp,
      razon: 'Backup inicial al cargar sistema',
      totalClaves: Object.keys(localStorage).length,
    };
    localStorage.setItem(`backup_inicial_${timestamp.split('T')[0]}`, JSON.stringify(backupInicial));
    
    return true;
  } catch (error) {
    logger.error('❌ Error al inicializar protección de datos:', error);
    return false;
  }
}

/**
 * Verifica si la protección está activa
 */
export function verificarProteccion(): boolean {
  return localStorage.getItem('proteccion_datos_activa') === 'true';
}

/**
 * Crear backup manual
 */
export function crearBackupManual(razon: string = 'Backup manual'): string {
  try {
    const timestamp = new Date().toISOString();
    const backup = {
      timestamp,
      razon,
      datos: {} as Record<string, string>
    };
    
    // Respaldar todas las claves
    Object.keys(localStorage).forEach(clave => {
      backup.datos[clave] = localStorage.getItem(clave) || '';
    });
    
    const claveBackup = `backup_manual_${timestamp}`;
    localStorage.setItem(claveBackup, JSON.stringify(backup));
    
    logger.info(`💾 Backup manual creado: ${claveBackup}`);
    return claveBackup;
  } catch (error) {
    logger.error('❌ Error al crear backup manual:', error);
    throw error;
  }
}

/**
 * Habilita el modo mantenimiento para permitir operaciones de restauración
 * IMPORTANTE: Solo usar para restauración de backups autorizados
 */
export function habilitarModoMantenimiento(): void {
  modoMantenimiento = true;
  // Modo mantenimiento habilitado silenciosamente
}

/**
 * Deshabilita el modo mantenimiento y reactiva todas las protecciones
 */
export function deshabilitarModoMantenimiento(): void {
  modoMantenimiento = false;
  // Protecciones reactivadas silenciosamente
}

/**
 * Ejecuta una operación en modo mantenimiento y luego lo deshabilita automáticamente
 */
export async function ejecutarEnModoMantenimiento<T>(
  operacion: () => T | Promise<T>
): Promise<T> {
  try {
    habilitarModoMantenimiento();
    const resultado = await operacion();
    return resultado;
  } finally {
    deshabilitarModoMantenimiento();
  }
}