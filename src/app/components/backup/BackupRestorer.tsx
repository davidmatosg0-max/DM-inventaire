/**
 * Restaurador de Backups
 * 
 * Componente para cargar y restaurar backups con validación
 * y preview de cambios.
 */

import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Upload,
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  FileUp,
  RotateCcw,
  Shield
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import {
  loadBackupFromFile,
  validateBackup,
  restoreBackup,
  type BackupData,
  type RestoreOptions
} from '../utils/backupUtils';
import { formatDateTime, formatFileSize } from '../utils/formatUtils';

export function BackupRestorer() {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estado
  const [backup, setBackup] = useState<BackupData | null>(null);
  const [validation, setValidation] = useState<any>(null);
  const [restoreMode, setRestoreMode] = useState<'replace' | 'merge'>('replace');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreComplete, setRestoreComplete] = useState(false);
  
  // Cargar archivo
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const loadedBackup = await loadBackupFromFile(file);
      setBackup(loadedBackup);
      
      // Validar
      const validationResult = validateBackup(loadedBackup);
      setValidation(validationResult);
      
      // Pre-seleccionar módulos disponibles
      setSelectedModules(loadedBackup.metadata.modules);
      setRestoreComplete(false);
      
      if (validationResult.isValid) {
        toast.success(t('backup.loaded', 'Sauvegarde chargée correctement'));
      } else {
        toast.error(t('backup.validationFailed', 'La sauvegarde contient des erreurs de validation'));
      }
    } catch (error) {
      console.error('Error loading backup:', error);
      toast.error(
        t('backup.loadError', 'Erreur lors du chargement de la sauvegarde'),
        {
          description: error instanceof Error ? error.message : 'Erreur inconnue'
        }
      );
    }
  };
  
  // Toggle módulo
  const toggleModule = (module: string) => {
    if (selectedModules.includes(module)) {
      setSelectedModules(selectedModules.filter(m => m !== module));
    } else {
      setSelectedModules([...selectedModules, module]);
    }
  };
  
  // Restaurar backup
  const handleRestore = async () => {
    if (!backup || !validation?.isValid) {
      toast.error(t('backup.cannotRestore', 'Cette sauvegarde ne peut pas être restaurée'));
      return;
    }
    
    if (selectedModules.length === 0) {
      toast.error(t('backup.selectModules', 'Sélectionnez au moins un module'));
      return;
    }
    
    // Confirmar
    const confirmed = window.confirm(
      t('backup.confirmRestore', 'Êtes-vous sûr de vouloir restaurer cette sauvegarde ? Cette action est irréversible.')
    );
    
    if (!confirmed) return;
    
    setIsRestoring(true);
    
    try {
      const options: RestoreOptions = {
        mode: restoreMode,
        modules: selectedModules
      };
      
      const result = restoreBackup(backup, options);
      
      if (result.success) {
        setRestoreComplete(true);
        toast.success(
          t('backup.restored', 'Sauvegarde restaurée avec succès'),
          {
            description: t('backup.reloadPage', 'Rechargez la page pour voir les changements')
          }
        );
      } else {
        toast.error(
          t('backup.restoreError', 'Erreur lors de la restauration de la sauvegarde'),
          {
            description: result.errors.join(', ')
          }
        );
      }
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast.error(
        t('backup.restoreError', 'Erreur lors de la restauration de la sauvegarde'),
        {
          description: error instanceof Error ? error.message : 'Erreur inconnue'
        }
      );
    } finally {
      setIsRestoring(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Cargar archivo */}
      {!backup && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#1a4d7a]" />
              {t('backup.loadBackup', 'Charger une sauvegarde')}
            </CardTitle>
            <CardDescription>
              {t('backup.loadDescription', 'Sélectionnez un fichier de sauvegarde à restaurer')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <FileUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {t('backup.clickToUpload', 'Cliquez pour sélectionner un fichier')}
              </p>
              <p className="text-sm text-gray-500">
                {t('backup.supportedFormat', 'Fichiers de sauvegarde .json')}
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Información del backup */}
      {backup && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#1a4d7a]" />
                  {t('backup.information', 'Informations de la sauvegarde')}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBackup(null);
                    setValidation(null);
                    setRestoreComplete(false);
                  }}
                >
                  {t('backup.loadAnother', 'Charger une autre sauvegarde')}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Validación */}
              {validation && (
                <>
                  {validation.isValid ? (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        {t('backup.valid', 'La sauvegarde est valide et peut être restaurée')}
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <p className="font-medium mb-2">
                          {t('backup.invalid', 'La sauvegarde contient des erreurs :')}
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {validation.errors.map((error: string, i: number) => (
                            <li key={i}>{error}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {validation.warnings && validation.warnings.length > 0 && (
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-700">
                        <p className="font-medium mb-2">
                          {t('backup.warnings', 'Avertissements :')}
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {validation.warnings.map((warning: string, i: number) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
              
              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t('backup.date', 'Date')}
                  </p>
                  <p className="font-medium">
                    {formatDateTime(backup.metadata.timestamp)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t('backup.type', 'Type')}
                  </p>
                  <Badge variant="outline">
                    {backup.metadata.type === 'full'
                      ? t('backup.full', 'Complète')
                      : t('backup.incremental', 'Incrémentale')
                    }
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t('backup.size', 'Taille')}
                  </p>
                  <p className="font-medium">
                    {formatFileSize(backup.metadata.size)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t('backup.records', 'Enregistrements')}
                  </p>
                  <p className="font-medium">{backup.metadata.recordCount}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t('backup.user', 'Utilisateur')}
                  </p>
                  <p className="font-medium">{backup.metadata.user}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {t('backup.version', 'Version')}
                  </p>
                  <p className="font-medium">{backup.metadata.version}</p>
                </div>
              </div>
              
              {backup.metadata.description && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>{t('backup.description', 'Description')}:</strong>{' '}
                    {backup.metadata.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Opciones de restauración */}
          {validation?.isValid && !restoreComplete && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-[#1a4d7a]" />
                  {t('backup.restoreOptions', 'Options de restauration')}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Modo de restauración */}
                <div className="space-y-3">
                  <Label>{t('backup.restoreMode', 'Mode de restauration')}</Label>
                  <RadioGroup value={restoreMode} onValueChange={(v: any) => setRestoreMode(v)}>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="replace" id="replace" />
                      <Label htmlFor="replace" className="flex-1 cursor-pointer">
                        <div className="font-medium">
                          {t('backup.replace', 'Remplacer')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {t('backup.replaceDesc', 'Supprimer les données actuelles et utiliser celles de la sauvegarde')}
                        </div>
                      </Label>
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        {t('backup.destructive', 'Destructif')}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="merge" id="merge" />
                      <Label htmlFor="merge" className="flex-1 cursor-pointer">
                        <div className="font-medium">
                          {t('backup.merge', 'Fusionner')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {t('backup.mergeDesc', 'Fusionner les données de la sauvegarde avec les données actuelles')}
                        </div>
                      </Label>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {t('backup.safer', 'Plus sûr')}
                      </Badge>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Módulos a restaurar */}
                <div className="space-y-3">
                  <Label>{t('backup.modulesToRestore', 'Modules à restaurer')}</Label>
                  <div className="space-y-2">
                    {backup.metadata.modules.map((module) => (
                      <div
                        key={module}
                        onClick={() => toggleModule(module)}
                        className={`
                          flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all
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
                        <div className="flex-1">
                          <p className="font-medium capitalize">{module}</p>
                          <p className="text-sm text-gray-500">
                            {backup.data[module]
                              ? `${Array.isArray(backup.data[module])
                                  ? backup.data[module].length
                                  : Object.keys(backup.data[module]).length
                                } enregistrements`
                              : 'Aucune donnée'
                            }
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Advertencia de seguridad */}
                <Alert className="border-amber-200 bg-amber-50">
                  <Shield className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700">
                    <p className="font-medium mb-2">
                      {t('backup.safetyNote', 'Note de sécurité')}
                    </p>
                    <p className="text-sm">
                      {t('backup.safetyDesc', 'Une sauvegarde automatique sera créée avant la restauration. Vous pourrez annuler cette opération en restaurant cette sauvegarde.')}
                    </p>
                  </AlertDescription>
                </Alert>
                
                {/* Botón de restaurar */}
                <Button
                  onClick={handleRestore}
                  disabled={isRestoring || selectedModules.length === 0}
                  className="w-full bg-[#2d9561] hover:bg-[#257a4f]"
                  size="lg"
                >
                  {isRestoring ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('backup.restoring', 'Restauration...')}
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      {t('backup.restore', 'Restaurer la sauvegarde')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Restauración completa */}
          {restoreComplete && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-full">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-green-900 mb-1">
                      {t('backup.restoreSuccess', 'Sauvegarde restaurée !')}
                    </h3>
                    <p className="text-green-700">
                      {t('backup.restoreSuccessDesc', 'Les données ont été restaurées correctement.')}
                    </p>
                  </div>
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {t('backup.reloadNow', 'Recharger maintenant')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
