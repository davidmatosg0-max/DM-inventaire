import React, { useState, useEffect } from 'react';
import { Zap, Clock, Calendar, Download, Trash2, Play, Settings2, ChevronDown, ChevronUp, FileText, FolderDown, PackageOpen, FolderOpen, Check, X, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import {
  obtenerConfigAutoBackup,
  guardarConfigAutoBackup,
  obtenerBackupsAlmacenados,
  eliminarBackup,
  ejecutarBackupAutomatico,
  formatearTamano,
  formatearFecha,
  obtenerTiempoRestante,
  limpiarBackupsAntiguos,
  descargarBackup,
  descargarTodosLosBackups,
  type AutoBackupConfig as AutoBackupConfigType,
  type BackupFrequency
} from '../../utils/autoBackupStorage';
import {
  soportaFileSystemAccess,
  seleccionarCarpetaBackup,
  tieneCarpetaSeleccionada,
  obtenerNombreCarpeta,
  limpiarCarpetaSeleccionada,
  inicializarFileSystem
} from '../../utils/fileSystemAccess';

export function AutoBackupConfig() {
  const [config, setConfig] = useState<AutoBackupConfigType>(obtenerConfigAutoBackup());
  const [backups, setBackups] = useState(obtenerBackupsAlmacenados());
  const [expanded, setExpanded] = useState(false);

  // Actualizar datos periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setConfig(obtenerConfigAutoBackup());
      setBackups(obtenerBackupsAlmacenados());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleEnabled = () => {
    const newConfig = { ...config, enabled: !config.enabled };
    guardarConfigAutoBackup(newConfig);
    setConfig(newConfig);
    toast.success(
      newConfig.enabled ? 'Backup automatique activé ✅' : 'Backup automatique désactivé',
      {
        description: newConfig.enabled
          ? `Prochain backup: ${obtenerTiempoRestante(newConfig)}`
          : 'Les backups automatiques sont désactivés'
      }
    );
  };

  const handleFrequencyChange = (value: BackupFrequency) => {
    const newConfig = { ...config, frequency: value };
    guardarConfigAutoBackup(newConfig);
    setConfig(newConfig);
    toast.info(`Fréquence changée: ${getFrequencyLabel(value)}`);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfig = { ...config, time: e.target.value };
    guardarConfigAutoBackup(newConfig);
    setConfig(newConfig);
  };

  const handleMaxBackupsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value > 0 && value <= 50) {
      const newConfig = { ...config, maxBackups: value };
      guardarConfigAutoBackup(newConfig);
      setConfig(newConfig);
    }
  };

  const handleToggleAutoDownload = () => {
    const newConfig = { ...config, autoDownload: !config.autoDownload };
    guardarConfigAutoBackup(newConfig);
    setConfig(newConfig);
    toast.info(
      newConfig.autoDownload 
        ? '📥 Auto-téléchargement activé' 
        : '📥 Auto-téléchargement désactivé',
      {
        description: newConfig.autoDownload
          ? 'Les backups seront téléchargés automatiquement'
          : 'Les backups seront stockés uniquement dans le navigateur'
      }
    );
  };

  const handleFilePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''); // Solo alfanuméricos, guiones y guiones bajos
    const newConfig = { ...config, filePrefix: value || 'backup' };
    guardarConfigAutoBackup(newConfig);
    setConfig(newConfig);
  };

  const handleSelectCustomFolder = async () => {
    const result = await seleccionarCarpetaBackup();
    
    if (result.success) {
      const newConfig = { 
        ...config, 
        customFolder: true,
        folderName: result.folderName 
      };
      guardarConfigAutoBackup(newConfig);
      setConfig(newConfig);
      toast.success('📂 Dossier sélectionné', {
        description: `Les backups seront sauvegardés dans: ${result.folderName}`
      });
    } else {
      toast.error(result.error || 'Erreur lors de la sélection du dossier');
    }
  };

  const handleClearCustomFolder = () => {
    limpiarCarpetaSeleccionada();
    const newConfig = { 
      ...config, 
      customFolder: false,
      folderName: undefined 
    };
    guardarConfigAutoBackup(newConfig);
    setConfig(newConfig);
    toast.info('Dossier personnalisé supprimé', {
      description: 'Les backups seront téléchargés normalement'
    });
  };

  const handleExecuteNow = () => {
    const success = ejecutarBackupAutomatico();
    if (success) {
      toast.success('Backup créé avec succès  ✅', {
        description: 'Un nouveau backup a été ajouté à la liste'
      });
      setBackups(obtenerBackupsAlmacenados());
    } else {
      toast.error('Erreur lors de la création du backup');
    }
  };

  const handleDeleteBackup = (backupId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce backup?')) {
      eliminarBackup(backupId);
      setBackups(obtenerBackupsAlmacenados());
      toast.success('Backup supprimé');
    }
  };

  const handleDownloadBackup = (backup: any) => {
    try {
      descargarBackup(backup, config.filePrefix);
      
      // Mensaje personalizado según la configuración
      if (config.customFolder && tieneCarpetaSeleccionada()) {
        toast.success('Backup téléchargé dans le dossier personnalisé 📁', {
          description: `Sauvegardé dans: ${config.folderName || 'dossier sélectionné'}`
        });
      } else {
        toast.success('Backup téléchargé 📥', {
          description: 'Le fichier a été téléchargé normalement'
        });
      }
    } catch (error) {
      toast.error('Erreur lors du téléchargement');
    }
  };

  const handleCleanOld = () => {
    if (confirm(`Voulez-vous nettoyer les anciens backups automatiques? (Conserve les ${config.maxBackups} plus récents)`)) {
      limpiarBackupsAntiguos();
      setBackups(obtenerBackupsAlmacenados());
      toast.success('Backups nettoyés');
    }
  };

  const handleDownloadAll = () => {
    if (backups.length === 0) {
      toast.error('Aucun backup à télécharger');
      return;
    }
    
    if (confirm(`Voulez-vous télécharger ${backups.length} backup(s)?`)) {
      const count = descargarTodosLosBackups();
      toast.success(`${count} backup(s) en cours de téléchargement`, {
        description: 'Les téléchargements vont commencer dans un instant'
      });
    }
  };

  const getFrequencyLabel = (freq: BackupFrequency): string => {
    const labels = {
      daily: 'Quotidien',
      weekly: 'Hebdomadaire',
      monthly: 'Mensuel',
      manual: 'Manuel'
    };
    return labels[freq];
  };

  const backupsAutomatiques = backups.filter(b => b.automatic);
  const backupsManuels = backups.filter(b => !b.automatic);

  return (
    <div className="backdrop-blur-lg bg-white/90 rounded-2xl border-2 border-white/60 shadow-2xl overflow-hidden">
      {/* Header Elegante */}
      <div 
        className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b-2 border-purple-100 p-6 cursor-pointer hover:from-purple-100 hover:to-indigo-100 transition-all duration-300"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Backup Automatique
              </h3>
              <p className="text-sm text-gray-600">
                {config.enabled ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Actif • Prochain: {obtenerTiempoRestante(config)}
                  </span>
                ) : (
                  <span className="text-gray-500">Désactivé</span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              variant={config.enabled ? 'default' : 'secondary'}
              className={`${config.enabled ? 'bg-green-500' : 'bg-gray-400'} text-white px-4 py-2`}
            >
              {backupsAutomatiques.length} backups
            </Badge>
            {expanded ? (
              <ChevronUp className="w-6 h-6 text-gray-400" />
            ) : (
              <ChevronDown className="w-6 h-6 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Contenido Expandible */}
      {expanded && (
        <div className="p-6 space-y-6">
          {/* Configuración Principal */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Activar/Desactivar */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <Label className="font-semibold text-gray-900">État du Backup</Label>
                    <p className="text-xs text-gray-600">Activer/désactiver les backups automatiques</p>
                  </div>
                </div>
                <Switch checked={config.enabled} onCheckedChange={handleToggleEnabled} />
              </div>
              {config.enabled && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <Button
                    onClick={handleExecuteNow}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Exécuter Maintenant
                  </Button>
                </div>
              )}
            </div>

            {/* Frecuencia */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <Label className="font-semibold text-gray-900">Fréquence</Label>
                  <p className="text-xs text-gray-600">Définir l'intervalle de backup</p>
                </div>
              </div>
              <Select value={config.frequency} onValueChange={handleFrequencyChange} disabled={!config.enabled}>
                <SelectTrigger className="bg-white border-2 border-blue-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">📅 Quotidien</SelectItem>
                  <SelectItem value="weekly">📆 Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">🗓️ Mensuel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Hora */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <Label className="font-semibold text-gray-900">Heure d'Exécution</Label>
                  <p className="text-xs text-gray-600">Choisir l'heure du backup</p>
                </div>
              </div>
              <Input
                type="time"
                value={config.time}
                onChange={handleTimeChange}
                disabled={!config.enabled}
                className="bg-white border-2 border-orange-200"
              />
            </div>

            {/* Max Backups */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Settings2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <Label className="font-semibold text-gray-900">Max Backups</Label>
                  <p className="text-xs text-gray-600">Nombre maximum à conserver</p>
                </div>
              </div>
              <Input
                type="number"
                min="1"
                max="50"
                value={config.maxBackups}
                onChange={handleMaxBackupsChange}
                disabled={!config.enabled}
                className="bg-white border-2 border-purple-200"
              />
            </div>

            {/* Auto Download */}
            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 border-2 border-cyan-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-cyan-500 rounded-lg">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <Label className="font-semibold text-gray-900">Auto Téléchargement</Label>
                  <p className="text-xs text-gray-600">Télécharger automatiquement les backups</p>
                </div>
              </div>
              <Switch checked={config.autoDownload} onCheckedChange={handleToggleAutoDownload} />
            </div>

            {/* File Prefix */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <Label className="font-semibold text-gray-900">Préfixe de Fichier</Label>
                  <p className="text-xs text-gray-600">Définir le préfixe des fichiers de backup</p>
                </div>
              </div>
              <Input
                type="text"
                value={config.filePrefix}
                onChange={handleFilePrefixChange}
                disabled={!config.enabled}
                className="bg-white border-2 border-gray-200"
              />
            </div>

            {/* Custom Folder */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <FolderOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <Label className="font-semibold text-gray-900">Dossier Personnalisé</Label>
                  <p className="text-xs text-gray-600">Choisir où sauvegarder les backups</p>
                </div>
              </div>
              
              {!soportaFileSystemAccess() ? (
                <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-orange-800">
                    <p className="font-semibold mb-1">Non disponible</p>
                    {window.self !== window.top ? (
                      <p>Cette fonctionnalité n'est pas disponible dans Figma Make. Utilisez le téléchargement normal des backups.</p>
                    ) : (
                      <p>Cette fonctionnalité nécessite Chrome ou Edge moderne.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleSelectCustomFolder}
                      size="sm"
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg flex-shrink-0"
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Sélectionner
                    </Button>
                    {config.customFolder && (
                      <Button
                        onClick={handleClearCustomFolder}
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50 flex-shrink-0"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Effacer
                      </Button>
                    )}
                  </div>
                  {config.customFolder && config.folderName && (
                    <div className="bg-green-50 border border-green-300 rounded-lg p-2 flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="text-xs">
                        <p className="font-semibold text-green-900">Dossier sélectionné:</p>
                        <p className="text-green-700 font-mono truncate">{config.folderName}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Lista de Backups Automatiques */}
          {backupsAutomatiques.length > 0 && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  Backups Automatiques ({backupsAutomatiques.length})
                </h4>
                {backupsAutomatiques.length > config.maxBackups && (
                  <Button
                    onClick={handleCleanOld}
                    variant="outline"
                    size="sm"
                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Nettoyer
                  </Button>
                )}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
                {backupsAutomatiques.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{formatearFecha(backup.timestamp)}</p>
                      <p className="text-xs text-gray-500">{formatearTamano(backup.size)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-700 border-purple-300">Auto</Badge>
                      <Button
                        onClick={() => handleDownloadBackup(backup)}
                        size="sm"
                        variant="ghost"
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleDeleteBackup(backup.id)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información */}
          {config.enabled && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 mb-1">Planification Active</p>
                  <ul className="text-blue-800 space-y-1">
                    <li>• Fréquence: {getFrequencyLabel(config.frequency)}</li>
                    <li>• Heure: {config.time}</li>
                    <li>• Prochain backup: {obtenerTiempoRestante(config)}</li>
                    {config.lastBackup && (
                      <li>• Dernier backup: {formatearFecha(config.lastBackup)}</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Télécharger Tous les Backups */}
          {backups.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FolderDown className="w-5 h-5 text-indigo-500" />
                  Gérer Tous les Backups ({backups.length})
                </h4>
                <Button
                  onClick={handleDownloadAll}
                  className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-lg"
                  size="sm"
                >
                  <PackageOpen className="w-4 h-4 mr-2" />
                  Télécharger Tous
                </Button>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Exemple de nom: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{config.filePrefix}-auto-2025-03-09-02-00-00.json</code>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}