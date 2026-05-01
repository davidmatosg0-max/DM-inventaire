/**
 * Módulo Principal de Backup/Restauración
 * 
 * Integra todos los componentes del sistema de backup en una interfaz unificada.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Database,
  Download,
  Sparkles,
  Clock,
  Settings,
  TrendingUp,
  HardDrive,
  Shield
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { BackupCreator } from './BackupCreator';
import { BackupRestorer } from './BackupRestorer';
import { BackupHistory } from './BackupHistory';
import { BackupSettings } from './BackupSettings';
import { TextCorrector } from './TextCorrector';
import { getBackupStats, shouldRunAutoBackup, runAutoBackup } from '../utils/backupUtils';
import { formatFileSize, formatDateRelative } from '../utils/formatUtils';

export function BackupModule() {
  const { t } = useTranslation();
  
  // Estado
  const [activeTab, setActiveTab] = useState('create');
  const [stats, setStats] = useState<any>(null);
  const [autoBackupDue, setAutoBackupDue] = useState(false);
  
  // Cargar estadísticas
  useEffect(() => {
    loadStats();
    checkAutoBackup();
  }, []);
  
  const loadStats = () => {
    const backupStats = getBackupStats();
    setStats(backupStats);
  };
  
  const checkAutoBackup = () => {
    const due = shouldRunAutoBackup();
    setAutoBackupDue(due);
  };
  
  // Ejecutar backup automático si es necesario
  const handleAutoBackup = () => {
    const backup = runAutoBackup();
    if (backup) {
      loadStats();
      checkAutoBackup();
    }
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
                    <Database className="w-8 h-8" />
                  </div>
                  {t('backup.title', 'Backup y Restauración')}
                </h1>
                <p className="text-gray-600">
                  {t('backup.subtitle', 'Sistema de respaldo y recuperación de datos')}
                </p>
              </div>
              
              {/* Estadísticas rápidas */}
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#1a4d7a]">
                    {stats?.total || 0}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t('backup.backups', 'Backups')}
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#2d9561]">
                    {stats ? formatFileSize(stats.totalSize) : '0 B'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {t('backup.size', 'Tamaño')}
                  </div>
                </div>
                
                <div className="text-center">
                  {stats?.newest ? (
                    <>
                      <div className="text-sm font-bold text-purple-600">
                        {formatDateRelative(stats.newest)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t('backup.lastBackup', 'Último')}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-bold text-gray-400">
                        {t('backup.none', 'Ninguno')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {t('backup.lastBackup', 'Último')}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Alerta de backup automático pendiente */}
            {autoBackupDue && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-700">
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">
                    {t('backup.autoBackupDue', 'Es momento de crear un backup automático')}
                  </span>
                </div>
                <button
                  onClick={handleAutoBackup}
                  className="px-4 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                >
                  {t('backup.createNow', 'Crear Ahora')}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Tabs principales */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="backdrop-blur-xl bg-white/90 rounded-2xl border border-white/20 shadow-xl">
            <TabsList className="grid grid-cols-4 w-full p-1 bg-gray-100/50">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                {t('backup.create', 'Crear')}
              </TabsTrigger>
              <TabsTrigger value="restore" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                {t('textCorrector.correction', 'Corrección')}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('backup.history', 'Historial')}
                {stats && stats.total > 0 && (
                  <Badge variant="outline" className="ml-1 text-xs">
                    {stats.total}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {t('backup.settings', 'Configuración')}
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Tab: Crear Backup */}
          <TabsContent value="create" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Creador de backups */}
              <div className="lg:col-span-2">
                <BackupCreator />
              </div>
              
              {/* Panel lateral de información */}
              <div className="space-y-4">
                {/* Ventajas del backup */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[#2d9561]" />
                      {t('backup.benefits', 'Ventajas del Backup')}
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span>{t('backup.benefit1', 'Protección contra pérdida de datos')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span>{t('backup.benefit2', 'Recuperación rápida')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span>{t('backup.benefit3', 'Migración de datos')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        <span>{t('backup.benefit4', 'Historial de cambios')}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                {/* Mejores prácticas */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#1a4d7a]" />
                      {t('backup.bestPractices', 'Mejores Prácticas')}
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start gap-2">
                        <span>📅</span>
                        <span>{t('backup.practice1', 'Crear backups regularmente')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>💾</span>
                        <span>{t('backup.practice2', 'Exportar a archivos externos')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>✅</span>
                        <span>{t('backup.practice3', 'Verificar backups periódicamente')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span>🔒</span>
                        <span>{t('backup.practice4', 'Mantener múltiples copias')}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                {/* Tipos de backup */}
                <Card>
                  <CardContent className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-purple-600" />
                      {t('backup.types', 'Tipos de Backup')}
                    </h3>
                    <div className="space-y-3">
                      <div className="p-2 bg-green-50 border border-green-200 rounded">
                        <p className="text-sm font-medium text-green-900 mb-1">
                          {t('backup.full', 'Completo')}
                        </p>
                        <p className="text-xs text-green-700">
                          {t('backup.fullTypeDesc', 'Respalda todos los datos. Recomendado.')}
                        </p>
                      </div>
                      <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          {t('backup.incremental', 'Incremental')}
                        </p>
                        <p className="text-xs text-blue-700">
                          {t('backup.incrementalTypeDesc', 'Solo cambios recientes. Más rápido.')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Tab: Corrección de Texto */}
          <TabsContent value="restore">
            <div className="backdrop-blur-xl bg-white/90 rounded-2xl p-6 border border-white/20 shadow-xl">
              <TextCorrector />
            </div>
          </TabsContent>
          
          {/* Tab: Historial */}
          <TabsContent value="history">
            <div className="backdrop-blur-xl bg-white/90 rounded-2xl border border-white/20 shadow-xl">
              <BackupHistory onRestore={() => loadStats()} />
            </div>
          </TabsContent>
          
          {/* Tab: Configuración */}
          <TabsContent value="settings">
            <div className="backdrop-blur-xl bg-white/90 rounded-2xl p-6 border border-white/20 shadow-xl">
              <BackupSettings />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Exportar componentes individuales
export { BackupCreator, BackupRestorer, BackupHistory, BackupSettings, TextCorrector };