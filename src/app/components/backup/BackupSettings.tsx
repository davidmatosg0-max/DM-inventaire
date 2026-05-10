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
      toast.success(t('backup.configSaved', 'Configuration enregistrée'));
    } catch (error) {
      toast.error(t('backup.saveError', 'Erreur lors de l\'enregistrement de la configuration'));
    }
  };
  
  // Ejecutar backup manual
  const handleRunNow = () => {
    try {
      const backup = runAutoBackup();
      if (backup) {
        toast.success(t('backup.created', 'Sauvegarde créée avec succès'));
      } else {
        toast.error(t('backup.createError', 'Erreur lors de la création de la sauvegarde'));
      }
    } catch (error) {
      toast.error(t('backup.createError', 'Erreur lors de la création de la sauvegarde'));
    }
  };
  
  // Limpiar backups antiguos
  const handleCleanOld = () => {
    const confirmed = window.confirm(
      t('backup.confirmCleanOld', `Supprimer les sauvegardes plus anciennes que les ${keepLast} dernières ?`)
    );
    
    if (!confirmed) return;
    
    try {
      const deleted = cleanOldBackups(30); // 30 días
      toast.success(
        t('backup.cleaned', 'Sauvegardes supprimées'),
        { description: `${deleted} sauvegardes supprimées` }
      );
    } catch (error) {
      toast.error(t('backup.cleanError', 'Erreur lors du nettoyage'));
    }
  };
  
  // Información sobre frecuencia
  const getFrequencyInfo = () => {
    switch (frequency) {
      case 'daily':
        return t('backup.dailyInfo', 'Une sauvegarde toutes les 24 heures');
      case 'weekly':
        return t('backup.weeklyInfo', 'Une sauvegarde tous les 7 jours');
      case 'monthly':
        return t('backup.monthlyInfo', 'Une sauvegarde tous les 30 jours');
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#1a4d7a]" />
            {t('backup.autoBackup', 'Sauvegarde automatique')}
          </CardTitle>
          <CardDescription>
            {t('backup.autoDescription', 'Configurez des sauvegardes automatiques planifiées')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Habilitar/Deshabilitar */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Power className={`w-5 h-5 ${enabled ? 'text-green-600' : 'text-gray-400'}`} />
              <div>
                <p className="font-medium">
                  {t('backup.autoEnabled', 'Sauvegarde automatique')}
                </p>
                <p className="text-sm text-gray-500">
                  {enabled
                    ? t('backup.autoEnabledDesc', 'Les sauvegardes seront créées automatiquement')
                    : t('backup.autoDisabledDesc', 'Les sauvegardes automatiques sont désactivées')
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
                  {t('backup.frequency', 'Fréquence')}
                </Label>
                <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">
                      {t('backup.daily', 'Quotidienne')}
                    </SelectItem>
                    <SelectItem value="weekly">
                      {t('backup.weekly', 'Hebdomadaire')}
                    </SelectItem>
                    <SelectItem value="monthly">
                      {t('backup.monthly', 'Mensuelle')}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">{getFrequencyInfo()}</p>
              </div>
              
              {/* Hora */}
              <div className="space-y-2">
                <Label htmlFor="time">
                  {t('backup.time', 'Heure d\'exécution')}
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  {t('backup.timeInfo', 'Heure locale du système')}
                </p>
              </div>
              
              {/* Módulos */}
              <div className="space-y-3">
                <Label>{t('backup.modulesToBackup', 'Modules à sauvegarder')}</Label>
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
            {t('backup.retention', 'Politiques de rétention')}
          </CardTitle>
          <CardDescription>
            {t('backup.retentionDescription', 'Configurez combien de sauvegardes conserver')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Mantener últimos N backups */}
          <div className="space-y-2">
            <Label htmlFor="keepLast">
              {t('backup.keepLast', 'Conserver les dernières sauvegardes')}
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
                {t('backup.backups', 'sauvegardes')}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {t('backup.keepLastInfo', 'Les sauvegardes les plus anciennes seront supprimées automatiquement')}
            </p>
          </div>
          
          {/* Limpieza automática */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-medium">
                  {t('backup.autoClean', 'Nettoyage automatique')}
                </p>
                <p className="text-sm text-gray-500">
                  {t('backup.autoCleanDesc', 'Supprimer automatiquement les anciennes sauvegardes')}
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
            {t('backup.cleanNow', 'Nettoyer maintenant')}
          </Button>
        </CardContent>
      </Card>
      
      {/* Información */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700">
          <p className="font-medium mb-2">
            {t('backup.note', 'Note importante')}
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              {t('backup.noteBackupAuto', 'Les sauvegardes automatiques s\'exécutent selon la fréquence configurée')}
            </li>
            <li>
              {t('backup.noteStorage', 'Les sauvegardes sont enregistrées dans le stockage local du navigateur')}
            </li>
            <li>
              {t('backup.noteLimit', 'Nous recommandons d\'exporter les sauvegardes importantes dans des fichiers')}
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
          {t('backup.saveConfig', 'Enregistrer la configuration')}
        </Button>
        
        {enabled && (
          <Button
            onClick={handleRunNow}
            variant="outline"
            className="flex-1"
          >
            <Clock className="w-4 h-4 mr-2" />
            {t('backup.runNow', 'Exécuter maintenant')}
          </Button>
        )}
      </div>
    </div>
  );
}
