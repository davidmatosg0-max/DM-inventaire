/**
 * Hook para detectar el estado de conexión online/offline
 * 
 * Monitorea el estado de la red y proporciona información
 * sobre la conectividad del usuario.
 */

import { useState, useEffect } from 'react';

export interface OnlineStatus {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnline: Date | null;
  lastOffline: Date | null;
}

/**
 * Hook para monitorear el estado de conexión
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [lastOnline, setLastOnline] = useState<Date | null>(null);
  const [lastOffline, setLastOffline] = useState<Date | null>(null);

  useEffect(() => {
    // Handlers para eventos de conexión
    const handleOnline = () => {
      setIsOnline(true);
      setLastOnline(new Date());
      
      // Si estuvo offline, marcar para mostrar notificación
      if (!isOnline) {
        setWasOffline(true);
        
        // Limpiar flag después de 5 segundos
        setTimeout(() => setWasOffline(false), 5000);
      }
      
      console.log('🟢 Conexión restaurada');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastOffline(new Date());
      console.log('🔴 Conexión perdida - Modo offline activado');
    };

    // Registrar listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar estado inicial
    if (navigator.onLine) {
      setLastOnline(new Date());
    } else {
      setLastOffline(new Date());
    }

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  return {
    isOnline,
    wasOffline,
    lastOnline,
    lastOffline
  };
}

/**
 * Hook extendido con verificación de conectividad real
 */
export function useOnlineStatusWithPing() {
  const baseStatus = useOnlineStatus();
  const [isPinging, setIsPinging] = useState(false);
  const [lastPing, setLastPing] = useState<Date | null>(null);
  const [pingSuccess, setPingSuccess] = useState(true);

  /**
   * Verificar conectividad real haciendo un ping al servidor
   */
  const checkConnectivity = async (): Promise<boolean> => {
    if (!baseStatus.isOnline) {
      return false;
    }

    setIsPinging(true);
    
    try {
      // Intentar hacer fetch a un endpoint ligero
      // Usar un timestamp para evitar caché
      const response = await fetch(`/health?t=${Date.now()}`, {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const success = response.ok;
      setPingSuccess(success);
      setLastPing(new Date());
      
      return success;
    } catch (error) {
      setPingSuccess(false);
      setLastPing(new Date());
      return false;
    } finally {
      setIsPinging(false);
    }
  };

  return {
    ...baseStatus,
    isPinging,
    lastPing,
    pingSuccess,
    checkConnectivity
  };
}

/**
 * Hook simple para solo saber si está online
 */
export function useIsOnline(): boolean {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
