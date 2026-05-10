/**
 * Creador de Backups
 * 
 * Componente para crear y exportar backups del sistema
 * con opciones de configuración avanzadas.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Download,
  Save,
  HardDrive,
  Package,
  Loader2,
  CheckCircle2,
  Database,
  FileDown
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import {
  createBackup,
  saveBackupToStorage,
  exportBackupToFile,
  BACKUP_MODULES,
  type BackupOptions
} from '../utils/backupUtils';
import { formatFileSize, formatDateTime } from '../utils/formatUtils';

export function BackupCreator() {
  const { t } = useTranslation();
  
  // Estado
  const [backupType, setBackupType] = useState<'full' | 'incremental'>('full');
  const [description, setDescription] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>(
    Object.values(BACKUP_MODULES)
  );
  const [isCreating, setIsCreating] = useState(false);
  const [lastBackup, setLastBackup] = useState<any>(null);
  
  // Módulos disponibles con info
  const moduleInfo = {
    [BACKUP_MODULES.INVENTORY]: {
      name: t('modules.inventory', 'Inventaire'),
      icon: <Package className="w-4 h-4" />,
      description: t('modules.inventoryDesc', 'Produits et stock')
    },
    [BACKUP_MODULES.ORDERS]: {
      name: t('modules.orders', 'Commandes'),
      icon: <Package className="w-4 h-4" />,
      description: t('modules.ordersDesc', 'Commandes et livraisons')
    },
    [BACKUP_MODULES.ORGANISMS]: {
      name: t('modules.organisms', 'Organismes'),
      icon: <Database className="w-4 h-4" />,
      description: t('modules.organismsDesc', 'Bénéficiaires')
    },
    [BACKUP_MODULES.CONTACTS]: {
      name: t('modules.contacts', 'Contacts'),
      icon: <Database className="w-4 h-4" />,
      description: t('modules.contactsDesc', 'Donateurs et fournisseurs')
    },
    [BACKUP_MODULES.TRANSPORT]: {
      name: t('modules.transport', 'Transport'),
      icon: <Database className="w-4 h-4" />,
      description: t('modules.transportDesc', 'Véhicules et trajets')
    },
    [BACKUP_MODULES.USERS]: {
      name: t('modules.users', 'Utilisateurs'),
      icon: <Database className="w-4 h-4" />,
      description: t('modules.usersDesc', 'Utilisateurs et permissions')
    },
    [BACKUP_MODULES.SETTINGS]: {
      name: t('modules.settings', 'Configuration'),
      icon: <Database className="w-4 h-4" />,
      description: t('modules.settingsDesc', 'Préférences du système')
    },
    [BACKUP_MODULES.AUDIT]: {
      name: t('modules.audit', 'Audit'),
      icon: <Database className="w-4 h-4" />,
      description: t('modules.auditDesc', 'Journaux et activité')
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
  
  // Seleccionar todos
  const selectAll = () => {
    setSelectedModules(Object.values(BACKUP_MODULES));
  };
  
  // Deseleccionar todos
  const selectNone = () => {
    setSelectedModules([]);
  };
  
  // Crear backup
  const handleCreateBackup = async (saveToStorage: boolean) => {
    if (selectedModules.length === 0) {
      toast.error(t('backup.selectAtLeastOne', 'Sélectionnez au moins un module'));
      return;
    }
    
    setIsCreating(true);
    
    try {
      const options: BackupOptions = {
        type: backupType,
        modules: selectedModules,
        description: description || undefined
      };
      
      const backup = createBackup(options);
      
      if (saveToStorage) {
        saveBackupToStorage(backup);
        toast.success(
          t('backup.savedToStorage', 'Sauvegarde enregistrée dans le système'),
          {
            description: `${formatFileSize(backup.metadata.size)} - ${backup.metadata.recordCount} enregistrements`
          }
        );
      } else {
        exportBackupToFile(backup);
        toast.success(
          t('backup.exported', 'Sauvegarde exportée avec succès'),
          {
            description: `${formatFileSize(backup.metadata.size)}`
          }
        );
      }
      
      setLastBackup(backup.metadata);
      setDescription('');
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error(
        t('backup.createError', 'Erreur lors de la création de la sauvegarde'),
        {
          description: error instanceof Error ? error.message : 'Erreur inconnue'
        }
      );
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-[#1a4d7a]" />
            {t('backup.createBackup', 'Créer une sauvegarde')}
          </CardTitle>
          <CardDescription>
            {t('backup.createDescription', 'Sauvegarder les données du système')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Tipo de backup */}
          <div className="space-y-3">
            <Label>{t('backup.type', 'Type de sauvegarde')}</Label>
            <RadioGroup value={backupType} onValueChange={(v: any) => setBackupType(v)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="flex-1 cursor-pointer">
                  <div className="font-medium">
                    {t('backup.full', 'Complète')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('backup.fullDesc', 'Sauvegarder toutes les données sélectionnées')}
                  </div>
                </Label>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {t('backup.recommended', 'Recommandé')}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="incremental" id="incremental" />
                <Label htmlFor="incremental" className="flex-1 cursor-pointer">
                  <div className="font-medium">
                    {t('backup.incremental', 'Incrémentale')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('backup.incrementalDesc', 'Seulement les changements depuis la dernière sauvegarde')}
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {t('backup.description', 'Description')} ({t('common.optional', 'optionnel')})
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('backup.descriptionPlaceholder', 'Ex. : sauvegarde mensuelle de février')}
              rows={3}
            />
          </div>
          
          {/* Módulos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t('backup.modulesToBackup', 'Modules à sauvegarder')}</Label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                  className="text-xs"
                >
                  {t('common.selectAll', 'Tout sélectionner')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectNone}
                  className="text-xs"
                >
                  {t('common.selectNone', 'Aucun')}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(BACKUP_MODULES).map(([key, module]) => {
                const info = moduleInfo[module];
                const isSelected = selectedModules.includes(module);
                
                return (
                  <div
                    key={module}
                    onClick={() => toggleModule(module)}
                    className={`
                      p-3 border rounded-lg cursor-pointer transition-all
                      ${isSelected
                        ? 'border-[#1a4d7a] bg-blue-50'
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleModule(module)}
                        className="mt-0.5"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {info.icon}
                          <span className="font-medium text-sm">{info.name}</span>
                        </div>
                        <p className="text-xs text-gray-500">{info.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <p className="text-sm text-gray-500">
              {selectedModules.length} {t('backup.modulesSelected', 'modules sélectionnés')}
            </p>
          </div>
          
          {/* Acciones */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => handleCreateBackup(true)}
              disabled={isCreating || selectedModules.length === 0}
              className="flex-1 bg-[#1a4d7a] hover:bg-[#153d61]"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('backup.creating', 'Création...')}
                </>
              ) : (
                <>
                  <HardDrive className="w-4 h-4 mr-2" />
                  {t('backup.saveToSystem', 'Enregistrer dans le système')}
                </>
              )}
            </Button>
            
            <Button
              onClick={() => handleCreateBackup(false)}
              disabled={isCreating || selectedModules.length === 0}
              variant="outline"
              className="flex-1"
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('backup.exporting', 'Exportation...')}
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 mr-2" />
                  {t('backup.exportToFile', 'Exporter vers un fichier')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Último backup creado */}
      {lastBackup && (
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-4 h-4" />
              {t('backup.lastCreated', 'Dernière sauvegarde créée')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">{t('backup.date', 'Date')}</p>
                <p className="font-medium">{formatDateTime(lastBackup.timestamp)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">{t('backup.size', 'Taille')}</p>
                <p className="font-medium">{formatFileSize(lastBackup.size)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">{t('backup.records', 'Enregistrements')}</p>
                <p className="font-medium">{lastBackup.recordCount}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">{t('backup.modules', 'Modules')}</p>
                <p className="font-medium">{lastBackup.modules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
