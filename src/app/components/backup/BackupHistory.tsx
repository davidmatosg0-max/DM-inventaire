/**
 * Historial de Backups
 * 
 * Componente para visualizar, gestionar y comparar backups guardados.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Clock,
  Download,
  Trash2,
  RotateCcw,
  Search,
  Filter,
  FileDown,
  HardDrive,
  CheckCircle2,
  GitCompare
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import {
  getBackupList,
  loadBackupFromStorage,
  deleteBackup,
  exportBackupToFile,
  restoreBackup,
  getBackupStats,
  type BackupMetadata
} from '../utils/backupUtils';
import { formatDateTime, formatDateRelative, formatFileSize } from '../utils/formatUtils';

interface BackupHistoryProps {
  onRestore?: (backupId: string) => void;
}

export function BackupHistory({ onRestore }: BackupHistoryProps) {
  const { t } = useTranslation();
  
  // Estado
  const [backups, setBackups] = useState<BackupMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'full' | 'incremental'>('all');
  const [stats, setStats] = useState<any>(null);
  
  // Cargar backups
  useEffect(() => {
    loadBackups();
  }, []);
  
  const loadBackups = () => {
    const list = getBackupList();
    setBackups(list);
    setStats(getBackupStats());
  };
  
  // Filtrar backups
  const filteredBackups = backups.filter(backup => {
    const matchesSearch = backup.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         backup.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         backup.user.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || backup.type === filterType;
    
    return matchesSearch && matchesType;
  });
  
  // Exportar backup
  const handleExport = (backupId: string) => {
    const backup = loadBackupFromStorage(backupId);
    if (backup) {
      exportBackupToFile(backup);
      toast.success(t('backup.exported', 'Backup exportado'));
    } else {
      toast.error(t('backup.notFound', 'Backup no encontrado'));
    }
  };
  
  // Restaurar backup
  const handleRestore = (backupId: string) => {
    const backup = loadBackupFromStorage(backupId);
    if (!backup) {
      toast.error(t('backup.notFound', 'Backup no encontrado'));
      return;
    }
    
    const confirmed = window.confirm(
      t('backup.confirmRestore', '¿Está seguro de restaurar este backup?')
    );
    
    if (!confirmed) return;
    
    try {
      const result = restoreBackup(backup);
      
      if (result.success) {
        toast.success(t('backup.restored', 'Backup restaurado exitosamente'));
        if (onRestore) {
          onRestore(backupId);
        }
      } else {
        toast.error(
          t('backup.restoreError', 'Error al restaurar'),
          { description: result.errors.join(', ') }
        );
      }
    } catch (error) {
      toast.error(t('backup.restoreError', 'Error al restaurar'));
    }
  };
  
  // Eliminar backup
  const handleDelete = (backupId: string) => {
    const confirmed = window.confirm(
      t('backup.confirmDelete', '¿Está seguro de eliminar este backup?')
    );
    
    if (!confirmed) return;
    
    try {
      deleteBackup(backupId);
      loadBackups();
      toast.success(t('backup.deleted', 'Backup eliminado'));
    } catch (error) {
      toast.error(t('backup.deleteError', 'Error al eliminar'));
    }
  };
  
  // Limpiar todos
  const handleClearAll = () => {
    const confirmed = window.confirm(
      t('backup.confirmClearAll', '¿Está seguro de eliminar TODOS los backups?')
    );
    
    if (!confirmed) return;
    
    try {
      backups.forEach(backup => deleteBackup(backup.id));
      loadBackups();
      toast.success(t('backup.allDeleted', 'Todos los backups eliminados'));
    } catch (error) {
      toast.error(t('backup.clearError', 'Error al limpiar'));
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t('backup.total', 'Total')}
                  </p>
                  <p className="text-2xl font-bold text-[#1a4d7a]">
                    {stats.total}
                  </p>
                </div>
                <HardDrive className="w-8 h-8 text-gray-300" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t('backup.full', 'Completos')}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.full}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-gray-300" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t('backup.incremental', 'Incrementales')}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.incremental}
                  </p>
                </div>
                <GitCompare className="w-8 h-8 text-gray-300" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t('backup.size', 'Tamaño')}
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatFileSize(stats.totalSize)}
                  </p>
                </div>
                <Download className="w-8 h-8 text-gray-300" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#1a4d7a]" />
                {t('backup.history', 'Historial de Backups')}
              </CardTitle>
              <CardDescription>
                {t('backup.historyDescription', 'Backups guardados en el sistema')}
              </CardDescription>
            </div>
            
            {backups.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t('backup.clearAll', 'Limpiar Todo')}
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t('backup.search', 'Buscar backups...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">{t('backup.allTypes', 'Todos')}</option>
              <option value="full">{t('backup.full', 'Completos')}</option>
              <option value="incremental">{t('backup.incremental', 'Incrementales')}</option>
            </select>
          </div>
          
          {/* Lista de backups */}
          {filteredBackups.length > 0 ? (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {filteredBackups.map((backup) => (
                  <div
                    key={backup.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <HardDrive className="w-4 h-4 text-gray-400" />
                          <h4 className="font-medium text-gray-900">
                            {backup.description || backup.id}
                          </h4>
                          <Badge
                            variant="outline"
                            className={
                              backup.type === 'full'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-blue-50 text-blue-700'
                            }
                          >
                            {backup.type === 'full'
                              ? t('backup.full', 'Completo')
                              : t('backup.incremental', 'Incremental')
                            }
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDateRelative(backup.timestamp)}
                          </div>
                          <div>
                            {formatDateTime(backup.timestamp)}
                          </div>
                          <div>
                            {formatFileSize(backup.size)}
                          </div>
                          <div>
                            {backup.recordCount} registros
                          </div>
                          <div className="col-span-2">
                            {backup.modules.length} módulos: {backup.modules.slice(0, 3).join(', ')}
                            {backup.modules.length > 3 && ` +${backup.modules.length - 3}`}
                          </div>
                        </div>
                      </div>
                      
                      {/* Acciones */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleExport(backup.id)}
                          title={t('backup.export', 'Exportar')}
                        >
                          <FileDown className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestore(backup.id)}
                          title={t('backup.restore', 'Restaurar')}
                          className="text-green-600 hover:text-green-700"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(backup.id)}
                          title={t('backup.delete', 'Eliminar')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="py-12 text-center">
              <HardDrive className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">
                {searchQuery || filterType !== 'all'
                  ? t('backup.noMatching', 'No se encontraron backups que coincidan')
                  : t('backup.noBackups', 'No hay backups guardados')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
