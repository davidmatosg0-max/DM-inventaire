/**
 * Indicador de Estado Offline
 * 
 * Muestra el estado de la conexión y las operaciones pendientes
 * de sincronización.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  WifiOff,
  Wifi,
  CloudOff,
  Cloud,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { toast } from 'sonner';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useOfflineQueue, formatOperationType, getOperationTypeColor } from '../../hooks/useOfflineQueue';
import { formatDateRelative } from '../utils/formatUtils';

export function OfflineIndicator() {
  const { t } = useTranslation();
  const { isOnline, lastOnline, lastOffline } = useOnlineStatus();
  const {
    queue,
    queueSize,
    isSyncing,
    syncProgress,
    syncQueue,
    getQueueStats
  } = useOfflineQueue();

  const [showDetails, setShowDetails] = useState(false);

  const stats = getQueueStats();

  // Sincronizar manualmente
  const handleSync = async () => {
    const result = await syncQueue();
    
    if (result.success > 0) {
      toast.success(
        t('offline.syncSuccess', 'Sincronización exitosa'),
        {
          description: `${result.success} operaciones sincronizadas`
        }
      );
    }
    
    if (result.failed > 0) {
      toast.error(
        t('offline.syncError', 'Error en sincronización'),
        {
          description: `${result.failed} operaciones fallidas`
        }
      );
    }
  };

  // Si está online y no hay operaciones pendientes, no mostrar nada
  if (isOnline && queueSize === 0) {
    return null;
  }

  return (
    <>
      {/* Badge flotante */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className={`
            px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all
            ${isOnline 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-red-500 hover:bg-red-600'
            }
            text-white font-medium
          `}
        >
          {isOnline ? (
            <Wifi className="w-4 h-4" />
          ) : (
            <WifiOff className="w-4 h-4 animate-pulse" />
          )}
          
          <span className="text-sm">
            {isOnline 
              ? t('offline.online', 'En Línea')
              : t('offline.offline', 'Sin Conexión')
            }
          </span>
          
          {queueSize > 0 && (
            <Badge variant="secondary" className="bg-white/20 text-white">
              {queueSize}
            </Badge>
          )}
        </button>
      </div>

      {/* Panel de detalles */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {isOnline ? (
                    <>
                      <Cloud className="w-5 h-5 text-green-600" />
                      {t('offline.onlineStatus', 'Estado de Conexión: En Línea')}
                    </>
                  ) : (
                    <>
                      <CloudOff className="w-5 h-5 text-red-600" />
                      {t('offline.offlineStatus', 'Estado de Conexión: Sin Conexión')}
                    </>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Info de conexión */}
              <div className="p-3 bg-gray-50 rounded-lg space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {t('offline.status', 'Estado')}:
                  </span>
                  <span className={`font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {isOnline 
                      ? t('offline.connected', 'Conectado')
                      : t('offline.disconnected', 'Desconectado')
                    }
                  </span>
                </div>
                
                {lastOnline && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {t('offline.lastOnline', 'Última conexión')}:
                    </span>
                    <span className="text-gray-900">
                      {formatDateRelative(lastOnline)}
                    </span>
                  </div>
                )}
                
                {!isOnline && lastOffline && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">
                      {t('offline.lastOffline', 'Sin conexión desde')}:
                    </span>
                    <span className="text-gray-900">
                      {formatDateRelative(lastOffline)}
                    </span>
                  </div>
                )}
              </div>

              {/* Operaciones pendientes */}
              {queueSize > 0 ? (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600" />
                        {t('offline.pendingOperations', 'Operaciones Pendientes')}
                      </h3>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                        {queueSize}
                      </Badge>
                    </div>

                    {/* Estadísticas */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="p-2 bg-green-50 border border-green-200 rounded text-center">
                        <div className="text-lg font-bold text-green-700">
                          {stats.byType.CREATE}
                        </div>
                        <div className="text-xs text-green-600">
                          {t('offline.create', 'Crear')}
                        </div>
                      </div>
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded text-center">
                        <div className="text-lg font-bold text-blue-700">
                          {stats.byType.UPDATE}
                        </div>
                        <div className="text-xs text-blue-600">
                          {t('offline.update', 'Actualizar')}
                        </div>
                      </div>
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-center">
                        <div className="text-lg font-bold text-red-700">
                          {stats.byType.DELETE}
                        </div>
                        <div className="text-xs text-red-600">
                          {t('offline.delete', 'Eliminar')}
                        </div>
                      </div>
                    </div>

                    {/* Lista de operaciones */}
                    <div className="max-h-48 overflow-y-auto space-y-2">
                      {queue.map((operation) => (
                        <div
                          key={operation.id}
                          className="p-2 border rounded-lg flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <span className={getOperationTypeColor(operation.type)}>
                              {formatOperationType(operation.type)}
                            </span>
                            <span className="text-gray-600">en</span>
                            <span className="font-medium capitalize">
                              {operation.module}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDateRelative(operation.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botón de sincronización */}
                  {isOnline && (
                    <Button
                      onClick={handleSync}
                      disabled={isSyncing}
                      className="w-full bg-[#2d9561] hover:bg-[#257a4f]"
                    >
                      {isSyncing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          {t('offline.syncing', 'Sincronizando...')} {syncProgress}%
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          {t('offline.syncNow', 'Sincronizar Ahora')}
                        </>
                      )}
                    </Button>
                  )}

                  {/* Advertencia si está offline */}
                  {!isOnline && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-700">
                        {t('offline.willSyncWhenOnline', 'Las operaciones se sincronizarán automáticamente cuando se restaure la conexión.')}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                  <p className="text-gray-600">
                    {t('offline.allSynced', 'Todas las operaciones están sincronizadas')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
