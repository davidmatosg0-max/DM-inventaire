/**
 * Sistema de Queue para Operaciones Offline
 * 
 * Gestiona una cola de operaciones pendientes que se ejecutarán
 * cuando se restaure la conexión.
 */

import { useState, useEffect, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';

// ==================== TIPOS ====================

export type OperationType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface QueuedOperation {
  id: string;
  type: OperationType;
  module: string;
  data: any;
  timestamp: Date;
  retries: number;
  error?: string;
}

export interface QueueConfig {
  maxRetries?: number;
  retryDelay?: number;
  autoSync?: boolean;
}

// ==================== CONSTANTES ====================

const QUEUE_STORAGE_KEY = 'ba_offline_queue';
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 2000;

// ==================== UTILIDADES DE STORAGE ====================

/**
 * Guardar queue en localStorage
 */
function saveQueue(queue: QueuedOperation[]): void {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('Error saving queue:', error);
  }
}

/**
 * Cargar queue desde localStorage
 */
function loadQueue(): QueuedOperation[] {
  try {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!stored) return [];
    
    const queue = JSON.parse(stored);
    
    // Convertir timestamps a Date
    return queue.map((op: any) => ({
      ...op,
      timestamp: new Date(op.timestamp)
    }));
  } catch (error) {
    console.error('Error loading queue:', error);
    return [];
  }
}

/**
 * Limpiar queue
 */
function clearQueue(): void {
  localStorage.removeItem(QUEUE_STORAGE_KEY);
}

// ==================== HOOK ====================

export function useOfflineQueue(config: QueueConfig = {}) {
  const {
    maxRetries = DEFAULT_MAX_RETRIES,
    retryDelay = DEFAULT_RETRY_DELAY,
    autoSync = true
  } = config;

  const { isOnline, wasOffline } = useOnlineStatus();
  const [queue, setQueue] = useState<QueuedOperation[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);

  // Cargar queue al iniciar
  useEffect(() => {
    const loadedQueue = loadQueue();
    setQueue(loadedQueue);
  }, []);

  // Guardar queue cuando cambie
  useEffect(() => {
    saveQueue(queue);
  }, [queue]);

  // Auto-sincronizar cuando vuelva la conexión
  useEffect(() => {
    if (isOnline && wasOffline && autoSync && queue.length > 0) {
      console.log('🔄 Conexión restaurada - Iniciando sincronización automática');
      syncQueue();
    }
  }, [isOnline, wasOffline, autoSync, queue.length]);

  /**
   * Agregar operación a la queue
   */
  const addToQueue = useCallback((
    type: OperationType,
    module: string,
    data: any
  ): string => {
    const operation: QueuedOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      module,
      data,
      timestamp: new Date(),
      retries: 0
    };

    setQueue(prev => [...prev, operation]);
    
    console.log(`📥 Operación agregada a la queue: ${type} en ${module}`);
    
    return operation.id;
  }, []);

  /**
   * Remover operación de la queue
   */
  const removeFromQueue = useCallback((operationId: string) => {
    setQueue(prev => prev.filter(op => op.id !== operationId));
    console.log(`✅ Operación removida de la queue: ${operationId}`);
  }, []);

  /**
   * Actualizar operación en la queue
   */
  const updateOperation = useCallback((
    operationId: string,
    updates: Partial<QueuedOperation>
  ) => {
    setQueue(prev => prev.map(op => 
      op.id === operationId ? { ...op, ...updates } : op
    ));
  }, []);

  /**
   * Ejecutar una operación específica
   */
  const executeOperation = async (operation: QueuedOperation): Promise<boolean> => {
    try {
      console.log(`🔄 Ejecutando operación: ${operation.type} en ${operation.module}`);
      
      // Aquí iría la lógica real de sincronización
      // Por ahora simulamos con un delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // En producción, aquí haríamos el fetch al servidor:
      // const response = await fetch(`/api/${operation.module}`, {
      //   method: operation.type === 'CREATE' ? 'POST' : 
      //           operation.type === 'UPDATE' ? 'PUT' : 'DELETE',
      //   body: JSON.stringify(operation.data)
      // });
      
      console.log(`✅ Operación ejecutada: ${operation.id}`);
      return true;
    } catch (error) {
      console.error(`❌ Error ejecutando operación ${operation.id}:`, error);
      return false;
    }
  };

  /**
   * Sincronizar toda la queue
   */
  const syncQueue = useCallback(async (): Promise<{
    success: number;
    failed: number;
    errors: Array<{ id: string; error: string }>;
  }> => {
    if (!isOnline) {
      console.warn('⚠️ No se puede sincronizar sin conexión');
      return { success: 0, failed: 0, errors: [] };
    }

    if (queue.length === 0) {
      console.log('✅ Queue vacía, nada que sincronizar');
      return { success: 0, failed: 0, errors: [] };
    }

    setIsSyncing(true);
    setSyncProgress(0);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ id: string; error: string }>
    };

    const totalOperations = queue.length;

    for (let i = 0; i < queue.length; i++) {
      const operation = queue[i];
      
      // Actualizar progreso
      setSyncProgress(Math.round(((i + 1) / totalOperations) * 100));

      // Verificar si ya alcanzó el máximo de reintentos
      if (operation.retries >= maxRetries) {
        console.warn(`⚠️ Operación ${operation.id} alcanzó máximo de reintentos`);
        results.failed++;
        results.errors.push({
          id: operation.id,
          error: 'Máximo de reintentos alcanzado'
        });
        continue;
      }

      // Ejecutar operación
      const success = await executeOperation(operation);

      if (success) {
        results.success++;
        removeFromQueue(operation.id);
      } else {
        results.failed++;
        
        // Incrementar contador de reintentos
        updateOperation(operation.id, {
          retries: operation.retries + 1,
          error: 'Error al sincronizar'
        });
        
        results.errors.push({
          id: operation.id,
          error: 'Error al ejecutar operación'
        });

        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    setIsSyncing(false);
    setSyncProgress(0);

    console.log(`🔄 Sincronización completada: ${results.success} éxitos, ${results.failed} fallos`);

    return results;
  }, [isOnline, queue, maxRetries, retryDelay, removeFromQueue, updateOperation]);

  /**
   * Limpiar toda la queue
   */
  const clearAllQueue = useCallback(() => {
    setQueue([]);
    clearQueue();
    console.log('🗑️ Queue limpiada');
  }, []);

  /**
   * Obtener operaciones por módulo
   */
  const getOperationsByModule = useCallback((module: string) => {
    return queue.filter(op => op.module === module);
  }, [queue]);

  /**
   * Obtener operaciones por tipo
   */
  const getOperationsByType = useCallback((type: OperationType) => {
    return queue.filter(op => op.type === type);
  }, [queue]);

  /**
   * Obtener estadísticas de la queue
   */
  const getQueueStats = useCallback(() => {
    const stats = {
      total: queue.length,
      byType: {
        CREATE: 0,
        UPDATE: 0,
        DELETE: 0
      },
      byModule: {} as Record<string, number>,
      oldestOperation: queue.length > 0 
        ? queue.reduce((oldest, op) => 
            op.timestamp < oldest.timestamp ? op : oldest
          ).timestamp
        : null,
      failedOperations: queue.filter(op => op.retries >= maxRetries).length
    };

    // Contar por tipo
    queue.forEach(op => {
      stats.byType[op.type]++;
      
      // Contar por módulo
      if (!stats.byModule[op.module]) {
        stats.byModule[op.module] = 0;
      }
      stats.byModule[op.module]++;
    });

    return stats;
  }, [queue, maxRetries]);

  return {
    // Estado
    queue,
    queueSize: queue.length,
    isSyncing,
    syncProgress,
    isOnline,
    
    // Métodos
    addToQueue,
    removeFromQueue,
    updateOperation,
    syncQueue,
    clearAllQueue,
    getOperationsByModule,
    getOperationsByType,
    getQueueStats
  };
}

// ==================== HELPERS ====================

/**
 * Formatear tipo de operación
 */
export function formatOperationType(type: OperationType): string {
  const labels: Record<OperationType, string> = {
    CREATE: 'Crear',
    UPDATE: 'Actualizar',
    DELETE: 'Eliminar'
  };
  return labels[type];
}

/**
 * Obtener color según tipo
 */
export function getOperationTypeColor(type: OperationType): string {
  const colors: Record<OperationType, string> = {
    CREATE: 'text-green-600',
    UPDATE: 'text-blue-600',
    DELETE: 'text-red-600'
  };
  return colors[type];
}

/**
 * Obtener icono según tipo
 */
export function getOperationTypeIcon(type: OperationType): string {
  const icons: Record<OperationType, string> = {
    CREATE: '➕',
    UPDATE: '✏️',
    DELETE: '🗑️'
  };
  return icons[type];
}
