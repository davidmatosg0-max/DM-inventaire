/**
 * Módulo de Gestión Offline
 * 
 * Panel completo para gestionar operaciones offline,
 * sincronización y configuración.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CloudOff,
  Cloud,
  RefreshCw,
  Trash2,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  WifiOff,
  Database,
  Activity
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import {
  useOfflineQueue,
  formatOperationType,
  getOperationTypeColor,
  getOperationTypeIcon,
  type QueuedOperation
} from '../../hooks/useOfflineQueue';
import { formatDateTime, formatDateRelative } from '../utils/formatUtils';

export function OfflineModule() {
  const { t } = useTranslation();
  const { isOnline, lastOnline, lastOffline } = useOnlineStatus();
  const {
    queue,
    queueSize,
    isSyncing,
    syncProgress,
    syncQueue,
    clearAllQueue,
    removeFromQueue,
    getQueueStats
  } = useOfflineQueue();

  const [activeTab, setActiveTab] = useState('queue');
  const [autoSync, setAutoSync] = useState(true);

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

  // Limpiar queue
  const handleClearQueue = () => {
    const confirmed = window.confirm(
      t('offline.confirmClear', '¿Está seguro de eliminar todas las operaciones pendientes?')
    );
    
    if (confirmed) {
      clearAllQueue();
      toast.success(t('offline.queueCleared', 'Cola de operaciones limpiada'));
    }
  };

  // Eliminar operación específica
  const handleRemoveOperation = (operationId: string) => {
    removeFromQueue(operationId);
    toast.success(t('offline.operationRemoved', 'Operación eliminada'));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Fondo decorativo */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Contenedor principal */}
      <div className="container mx-auto px-4 py-8 relative">
        {/* Header */}
        <div className="mb-8">
          <div className="backdrop-blur-xl bg-white/90 rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#1a4d7a] to-[#2d9561] rounded-xl text-white shadow-lg">
                    <CloudOff className="w-8 h-8" />
                  </div>
                  {t('offline.title', 'Gestión Offline')}
                </h1>
                <p className="text-gray-600">
                  {t('offline.subtitle', 'Operaciones sin conexión y sincronización')}
                </p>
              </div>

              {/* Estado de conexión */}
              <div className="flex flex-col items-end gap-3">
                <div className={`
                  px-4 py-2 rounded-lg flex items-center gap-2
                  ${isOnline 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                  }
                `}>
                  {isOnline ? (
                    <>
                      <Cloud className="w-5 h-5" />
                      {t('offline.online', 'En Línea')}
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-5 h-5 animate-pulse" />
                      {t('offline.offline', 'Sin Conexión')}
                    </>
                  )}
                </div>

                {queueSize > 0 && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {queueSize} {t('offline.pendingOps', 'operaciones pendientes')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t('offline.total', 'Total')}
                  </p>
                  <p className="text-2xl font-bold text-[#1a4d7a]">
                    {stats.total}
                  </p>
                </div>
                <Database className="w-8 h-8 text-gray-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t('offline.create', 'Crear')}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.byType.CREATE}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-gray-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t('offline.update', 'Actualizar')}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.byType.UPDATE}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-gray-300" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t('offline.delete', 'Eliminar')}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.byType.DELETE}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-gray-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="backdrop-blur-xl bg-white/90 rounded-2xl border border-white/20 shadow-xl">
            <TabsList className="grid grid-cols-3 w-full p-1 bg-gray-100/50">
              <TabsTrigger value="queue" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('offline.queue', 'Cola')}
                {queueSize > 0 && (
                  <Badge variant="outline" className="ml-1 text-xs">
                    {queueSize}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="status" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {t('offline.status', 'Estado')}
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {t('offline.settings', 'Configuración')}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab: Cola de Operaciones */}
          <TabsContent value="queue">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[#1a4d7a]" />
                      {t('offline.pendingOperations', 'Operaciones Pendientes')}
                    </CardTitle>
                    <CardDescription>
                      {t('offline.queueDescription', 'Operaciones que se sincronizarán cuando haya conexión')}
                    </CardDescription>
                  </div>

                  <div className="flex gap-2">
                    {isOnline && queueSize > 0 && (
                      <Button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="bg-[#2d9561] hover:bg-[#257a4f]"
                      >
                        {isSyncing ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            {syncProgress}%
                          </>
                        ) : (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            {t('offline.syncNow', 'Sincronizar')}
                          </>
                        )}
                      </Button>
                    )}

                    {queueSize > 0 && (
                      <Button
                        variant="outline"
                        onClick={handleClearQueue}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {t('offline.clearAll', 'Limpiar Todo')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {queue.length > 0 ? (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="space-y-3">
                      {queue.map((operation) => (
                        <OperationCard
                          key={operation.id}
                          operation={operation}
                          onRemove={handleRemoveOperation}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="py-12 text-center">
                    <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                    <p className="text-lg font-medium text-gray-700 mb-2">
                      {t('offline.noOperations', 'Sin Operaciones Pendientes')}
                    </p>
                    <p className="text-gray-500">
                      {t('offline.allSynced', 'Todas las operaciones están sincronizadas')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Estado */}
          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#1a4d7a]" />
                  {t('offline.connectionStatus', 'Estado de Conexión')}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Estado actual */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">
                      {t('offline.currentStatus', 'Estado Actual')}
                    </h3>
                    <Badge
                      variant="outline"
                      className={
                        isOnline
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }
                    >
                      {isOnline 
                        ? t('offline.connected', 'Conectado')
                        : t('offline.disconnected', 'Desconectado')
                      }
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    {lastOnline && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {t('offline.lastOnline', 'Última conexión')}:
                        </span>
                        <span className="font-medium">
                          {formatDateTime(lastOnline)}
                        </span>
                      </div>
                    )}

                    {lastOffline && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          {t('offline.lastOffline', 'Última desconexión')}:
                        </span>
                        <span className="font-medium">
                          {formatDateTime(lastOffline)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estadísticas por módulo */}
                {Object.keys(stats.byModule).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">
                      {t('offline.operationsByModule', 'Operaciones por Módulo')}
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(stats.byModule).map(([module, count]) => (
                        <div
                          key={module}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="capitalize font-medium">{module}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Operaciones fallidas */}
                {stats.failedOperations > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-900 mb-1">
                          {t('offline.failedOperations', 'Operaciones Fallidas')}
                        </p>
                        <p className="text-sm text-red-700">
                          {stats.failedOperations} {t('offline.operationsReachedMaxRetries', 'operaciones alcanzaron el máximo de reintentos')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Configuración */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-[#1a4d7a]" />
                  {t('offline.configuration', 'Configuración Offline')}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Auto sincronización */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium mb-1">
                      {t('offline.autoSync', 'Sincronización Automática')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('offline.autoSyncDesc', 'Sincronizar automáticamente cuando se restaure la conexión')}
                    </p>
                  </div>
                  <Switch
                    checked={autoSync}
                    onCheckedChange={setAutoSync}
                  />
                </div>

                {/* Información */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>{t('offline.note', 'Nota')}:</strong>{' '}
                    {t('offline.noteDesc', 'Las operaciones offline se guardan localmente y se sincronizarán cuando vuelva la conexión.')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Componente para mostrar una operación individual
function OperationCard({
  operation,
  onRemove
}: {
  operation: QueuedOperation;
  onRemove: (id: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">
              {getOperationTypeIcon(operation.type)}
            </span>
            <span className={`font-medium ${getOperationTypeColor(operation.type)}`}>
              {formatOperationType(operation.type)}
            </span>
            <span className="text-gray-400">en</span>
            <span className="font-medium capitalize text-gray-900">
              {operation.module}
            </span>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              {formatDateRelative(operation.timestamp)}
            </div>

            {operation.retries > 0 && (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="w-3 h-3" />
                {operation.retries} {t('offline.retries', 'reintentos')}
              </div>
            )}

            {operation.error && (
              <p className="text-red-600 text-xs">
                {operation.error}
              </p>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(operation.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
