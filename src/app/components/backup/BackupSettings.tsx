/**
 * Configuración de Backups Automáticos
 * 
 * Componente para configurar backups automáticos programados
 * y políticas de retención.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  Clock,
  Calendar,
  Trash2,
  Save,
  Power,
  Info
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';
import {
  loadBackupConfig,
  saveBackupConfig,
  shouldRunAutoBackup,
  runAutoBackup,
  cleanOldBackups,
  BACKUP_MODULES
} from '../utils/backupUtils';

export function BackupSettings() {
  const { t } = useTranslation();
  
  // Estado
  const [enabled, setEnabled] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [time, setTime] = useState('02:00');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [keepLast, setKeepLast] = useState(10);
  const [autoClean, setAutoClean] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Cargar configuración
  useEffect(() => {
    const config = loadBackupConfig();
    setEnabled(config.enabled);
    setFrequency(config.frequency);
    setTime(config.time);
    setSelectedModules(config.modules);
    setKeepLast(config.keepLast);
    setAutoClean(config.autoClean);
  }, []);
  
  // Detectar cambios
  useEffect(() => {
    const config = loadBackupConfig();
    const changed = 
      enabled !== config.enabled ||
      frequency !== config.frequency ||
      time !== config.time ||
      JSON.stringify(selectedModules) !== JSON.stringify(config.modules) ||
      keepLast !== config.keepLast ||
      autoClean !== config.autoClean;
    
    setHasChanges(changed);
  }, [enabled, frequency, time, selectedModules, keepLast, autoClean]);
  
  // Toggle módulo
  const toggleModule = (module: string) => {
    if (selectedModules.includes(module)) {
      setSelectedModules(selectedModules.filter(m => m !== module));
    } else {
      setSelectedModules([...selectedModules, module]);
    }
  };
  
  // Guardar configuración
  const handleSave = () => {
    try {
      saveBackupConfig({
        enabled,
        frequency,
        time,
        modules: selectedModules,
        keepLast,
        autoClean
      });
      
      setHasChanges(false);
      toast.success(t('backup.configSaved', 'Configuración guardada'));
    } catch (error) {
      toast.error(t('backup.saveError', 'Error al guardar configuración'));
    }
  };
  
  // Ejecutar backup manual
  const handleRunNow = () => {
    try {
      const backup = runAutoBackup();
      if (backup) {
        toast.success(t('backup.created', 'Backup creado exitosamente'));
      } else {
        toast.error(t('backup.createError', 'Error al crear backup'));
      }
    } catch (error) {
      toast.error(t('backup.createError', 'Error al crear backup'));
    }
  };
  
  // Limpiar backups antiguos
  const handleCleanOld = () => {
    const confirmed = window.confirm(
      t('backup.confirmCleanOld', `¿Eliminar backups anteriores a los últimos ${keepLast}?`)
    );
    
    if (!confirmed) return;
    
    try {
      const deleted = cleanOldBackups(30); // 30 días
      toast.success(
        t('backup.cleaned', 'Backups eliminados'),
        { description: `${deleted} backups eliminados` }
      );
    } catch (error) {
      toast.error(t('backup.cleanError', 'Error al limpiar'));
    }
  };
  
  // Información sobre frecuencia
  const getFrequencyInfo = () => {
    switch (frequency) {
      case 'daily':
        return t('backup.dailyInfo', 'Un backup cada 24 horas');
      case 'weekly':
        return t('backup.weeklyInfo', 'Un backup cada 7 días');
      case 'monthly':
        return t('backup.monthlyInfo', 'Un backup cada 30 días');
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#1a4d7a]" />
            {t('backup.autoBackup', 'Backup Automático')}
          </CardTitle>
          <CardDescription>
            {t('backup.autoDescription', 'Configure backups automáticos programados')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Habilitar/Deshabilitar */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Power className={`w-5 h-5 ${enabled ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <p className="font-medium">
                  {t('backup.autoEnabled', 'Backup Automático')}
                </p>
                <p className="text-sm text-gray-500">
                  {enabled
                    ? t('backup.autoEnabledDesc', 'Los backups se crearán automáticamente')
                    : t('backup.autoDisabledDesc', 'Los backups automáticos están desactivados')
                  }
                </p>
              </div>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
          
          {/* Configuración (solo si está habilitado) */}
          {enabled && (
            <>
              {/* Frecuencia */}
              <div className="space-y-3">
                <Label htmlFor="frequency">
                  {t('backup.frequency', 'Frecuencia')}
                </Label>
                <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">
                      {t('backup.daily', 'Diario')}
                    </SelectItem>
                    <SelectItem value="weekly">
                      {t('backup.weekly', 'Semanal')}
                    </SelectItem>
                    <SelectItem value="monthly">
                      {t('backup.monthly', 'Mensual')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">{getFrequencyInfo()}</p>
              </div>
              
              {/* Hora */}
              <div className="space-y-2">
                <Label htmlFor="time">
                  {t('backup.time', 'Hora de Ejecución')}
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  {t('backup.timeInfo', 'Hora local del sistema')}
                </p>
              </div>
              
              {/* Módulos */}
              <div className="space-y-3">
                <Label>{t('backup.modulesToBackup', 'Módulos a Respaldar')}</Label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(BACKUP_MODULES).map((module) => (
                    <div
                      key={module}
                      onClick={() => toggleModule(module)}
                      className={`
                        flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-colors
                        ${selectedModules.includes(module)
                          ? 'border-[#1a4d7a] bg-blue-50'
                          : 'hover:bg-gray-50'
                        }
                      `}
                    >
                      <Checkbox
                        checked={selectedModules.includes(module)}
                        onCheckedChange={() => toggleModule(module)}
                      />
                      <span className="text-sm capitalize">{module}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Políticas de retención */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1a4d7a]" />
            {t('backup.retention', 'Políticas de Retención')}
          </CardTitle>
          <CardDescription>
            {t('backup.retentionDescription', 'Configure cuántos backups mantener')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Mantener últimos N backups */}
          <div className="space-y-2">
            <Label htmlFor="keepLast">
              {t('backup.keepLast', 'Mantener Últimos Backups')}
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="keepLast"
                type="number"
                min="1"
                max="100"
                value={keepLast}
                onChange={(e) => setKeepLast(parseInt(e.target.value) || 1)}
                className="w-24"
              />
              <span className="text-sm text-gray-500">
                {t('backup.backups', 'backups')}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {t('backup.keepLastInfo', 'Los backups más antiguos se eliminarán automáticamente')}
            </p>
          </div>
          
          {/* Limpieza automática */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">
                  {t('backup.autoClean', 'Limpieza Automática')}
                </p>
                <p className="text-sm text-gray-500">
                  {t('backup.autoCleanDesc', 'Eliminar backups antiguos automáticamente')}
                </p>
              </div>
            </div>
            <Switch
              checked={autoClean}
              onCheckedChange={setAutoClean}
            />
          </div>
          
          {/* Botón de limpieza manual */}
          <Button
            variant="outline"
            onClick={handleCleanOld}
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('backup.cleanNow', 'Limpiar Ahora')}
          </Button>
        </CardContent>
      </Card>
      
      {/* Información */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <p className="font-medium mb-2">
            {t('backup.note', 'Nota Importante')}
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              {t('backup.noteBackupAuto', 'Los backups automáticos se ejecutan cuando cumple la frecuencia configurada')}
            </li>
            <li>
              {t('backup.noteStorage', 'Los backups se guardan en el almacenamiento local del navegador')}
            </li>
            <li>
              {t('backup.noteLimit', 'Recomendamos exportar backups importantes a archivos')}
            </li>
          </ul>
        </AlertDescription>
      </Alert>
      
      {/* Acciones */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="flex-1 bg-[#2d9561] hover:bg-[#257a4f]"
        >
          <Save className="w-4 h-4 mr-2" />
          {t('backup.saveConfig', 'Guardar Configuración')}
        </Button>
        
        {enabled && (
          <Button
            onClick={handleRunNow}
            variant="outline"
            className="flex-1"
          >
            <Clock className="w-4 h-4 mr-2" />
            {t('backup.runNow', 'Ejecutar Ahora')}
          </Button>
        )}
      </div>
    </div>
  );
}
