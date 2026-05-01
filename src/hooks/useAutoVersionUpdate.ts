/**
 * Hook de Actualización Automática de Versión
 * 
 * Este hook detecta automáticamente cuando hay una nueva versión
 * y fuerza la actualización de la pestaña de Versions
 * 
 * Última actualización: 16/03/2026
 */

import { useEffect, useState, useCallback } from 'react';
import { APP_VERSION } from '../app/version';
import { logger } from '../app/utils/logger';

const VERSION_CHECK_KEY = 'version_last_checked';
const VERSION_CHECK_INTERVAL = 30000; // 30 segundos

export function useAutoVersionUpdate() {
  const [currentVersion, setCurrentVersion] = useState(APP_VERSION.version);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const checkForVersionUpdate = useCallback(() => {
    try {
      const now = Date.now();
      const lastChecked = parseInt(localStorage.getItem(VERSION_CHECK_KEY) || '0');

      // Solo verificar si ha pasado suficiente tiempo
      if (now - lastChecked < VERSION_CHECK_INTERVAL) {
        return;
      }

      // Actualizar timestamp de verificación
      localStorage.setItem(VERSION_CHECK_KEY, now.toString());

      // Verificar si la versión en APP_VERSION es diferente a la almacenada
      const storedVersion = localStorage.getItem('banco_alimentos_app_version');
      
      if (storedVersion && storedVersion !== APP_VERSION.version) {
        logger.info(`🔄 Nueva versión detectada: ${storedVersion} → ${APP_VERSION.version}`);
        setCurrentVersion(APP_VERSION.version);
        setShouldRefresh(true);
        
        // Actualizar la versión almacenada
        localStorage.setItem('banco_alimentos_app_version', APP_VERSION.version);
      }
    } catch (error) {
      logger.error('Error al verificar actualización de versión:', error);
    }
  }, []);

  // Verificar al montar y periódicamente
  useEffect(() => {
    checkForVersionUpdate();

    // Configurar verificación periódica
    const interval = setInterval(checkForVersionUpdate, VERSION_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [checkForVersionUpdate]);

  // Escuchar cambios en localStorage desde otras pestañas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'banco_alimentos_app_version' && e.newValue !== currentVersion) {
        logger.info('🔄 Cambio de versión detectado desde otra pestaña');
        setCurrentVersion(e.newValue || APP_VERSION.version);
        setShouldRefresh(true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentVersion]);

  return {
    currentVersion,
    shouldRefresh,
    checkForVersionUpdate
  };
}
