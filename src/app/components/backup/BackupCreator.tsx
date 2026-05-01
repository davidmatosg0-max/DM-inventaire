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
      name: t('modules.inventory', 'Inventario'),
      icon: <Package className="w-4 h-4" />,
      description: t('modules.inventoryDesc', 'Productos y stock')
    },
    [BACKUP_MODULES.ORDERS]: {
      name: t('modules.orders', 'Pedidos'),
      icon: <Package className="w-4 h-4" />,
      description: t('modules.ordersDesc', 'Comandas y entregas')
    },
    [BACKUP_MODULES.ORGANISMS]: {
      name: t('modules.organisms', 'Organismos'),
      icon: <Database className="w-4 h-4" />,
      description: t('modules.organismsDesc', 'Beneficiarios')
    },
    [BACKUP_MODULES.CONTACTS]: {
      name: t('modules.contacts', 'Contactos'),
      icon: <Database className="w-4 h-4" />,
      description: t('modules.contactsDesc', 'Donantes y proveedores')
    },
    [BACKUP_MODULES.TRANSPORT]: {
      name: t('modules.transport', 'Transporte'),
      icon: <Database className="w-4 h-4" />,
      description: t('modules.transportDesc', 'Vehículos y rutas')
    },
    [BACKUP_MODULES.USERS]: {
      name: t('modules.users', 'Usuarios'),
      icon: <Database className="w-4 h-4" />,
      description: t('modules.usersDesc', 'Usuarios y permisos')
    },
    [BACKUP_MODULES.SETTINGS]: {
      name: t('modules.settings', 'Configuración'),
      icon: <Database className="w-4 h-4" />,
      description: t('modules.settingsDesc', 'Preferencias del sistema')
    },
    [BACKUP_MODULES.AUDIT]: {
      name: t('modules.audit', 'Auditoría'),
      icon: <Database className="w-4 h-4" />,
      description: t('modules.auditDesc', 'Logs y actividad')
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
      toast.error(t('backup.selectAtLeastOne', 'Seleccione al menos un módulo'));
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
          t('backup.savedToStorage', 'Backup guardado en el sistema'),
          {
            description: `${formatFileSize(backup.metadata.size)} - ${backup.metadata.recordCount} registros`
          }
        );
      } else {
        exportBackupToFile(backup);
        toast.success(
          t('backup.exported', 'Backup exportado exitosamente'),
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
        t('backup.createError', 'Error al crear el backup'),
        {
          description: error instanceof Error ? error.message : 'Error desconocido'
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
            {t('backup.createBackup', 'Crear Backup')}
          </CardTitle>
          <CardDescription>
            {t('backup.createDescription', 'Respaldar datos del sistema')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Tipo de backup */}
          <div className="space-y-3">
            <Label>{t('backup.type', 'Tipo de Backup')}</Label>
            <RadioGroup value={backupType} onValueChange={(v: any) => setBackupType(v)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="flex-1 cursor-pointer">
                  <div className="font-medium">
                    {t('backup.full', 'Completo')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('backup.fullDesc', 'Respaldar todos los datos seleccionados')}
                  </div>
                </Label>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {t('backup.recommended', 'Recomendado')}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                <RadioGroupItem value="incremental" id="incremental" />
                <Label htmlFor="incremental" className="flex-1 cursor-pointer">
                  <div className="font-medium">
                    {t('backup.incremental', 'Incremental')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('backup.incrementalDesc', 'Solo cambios desde el último backup')}
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">
              {t('backup.description', 'Descripción')} ({t('common.optional', 'opcional')})
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('backup.descriptionPlaceholder', 'Ej: Backup mensual de febrero')}
              rows={3}
            />
          </div>
          
          {/* Módulos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t('backup.modulesToBackup', 'Módulos a Respaldar')}</Label>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectAll}
                  className="text-xs"
                >
                  {t('common.selectAll', 'Seleccionar todos')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={selectNone}
                  className="text-xs"
                >
                  {t('common.selectNone', 'Ninguno')}
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
              {selectedModules.length} {t('backup.modulesSelected', 'módulos seleccionados')}
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
                  {t('backup.creating', 'Creando...')}
                </>
              ) : (
                <>
                  <HardDrive className="w-4 h-4 mr-2" />
                  {t('backup.saveToSystem', 'Guardar en Sistema')}
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
                  {t('backup.exporting', 'Exportando...')}
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 mr-2" />
                  {t('backup.exportToFile', 'Exportar a Archivo')}
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
              {t('backup.lastCreated', 'Último Backup Creado')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">{t('backup.date', 'Fecha')}</p>
                <p className="font-medium">{formatDateTime(lastBackup.timestamp)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">{t('backup.size', 'Tamaño')}</p>
                <p className="font-medium">{formatFileSize(lastBackup.size)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">{t('backup.records', 'Registros')}</p>
                <p className="font-medium">{lastBackup.recordCount}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">{t('backup.modules', 'Módulos')}</p>
                <p className="font-medium">{lastBackup.modules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
