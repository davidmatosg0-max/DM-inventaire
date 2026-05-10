import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Plus, Edit2, Trash2, Save, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  comptoirStorageEvents,
  comptoirStorageKeys,
  obtenirDemandesAideComptoir,
  obtenirDistributionsComptoir,
  sauvegarderDemandesAideComptoir,
  sauvegarderDistributionsComptoir,
} from '../../utils/comptoirStorage';

interface AidType {
  id: string;
  name: string;
  description?: string;
  defaultValue?: number;
  color: string;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  usageCount?: number;
}

interface TypesAideProps {
  onNavigate?: (view: string) => void;
  aidTypes: AidType[];
  setAidTypes: React.Dispatch<React.SetStateAction<AidType[]>>;
  systemAidTypes: AidType[];
}

export function TypesAide({ onNavigate, aidTypes, setAidTypes, systemAidTypes }: TypesAideProps) {
  const { t } = useTranslation();
  const [showDialog, setShowDialog] = useState(false);
  const [editingType, setEditingType] = useState<AidType | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AidType | null>(null);
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    defaultValue: '',
    color: '#1E73BE',
    isActive: true,
  });

  const colors = [
    { value: '#1E73BE', label: 'Bleu' },
    { value: '#4CAF50', label: 'Vert' },
    { value: '#DC3545', label: 'Rouge' },
    { value: '#FFC107', label: 'Jaune' },
    { value: '#FF9800', label: 'Orange' },
    { value: '#9C27B0', label: 'Violet' },
    { value: '#00BCD4', label: 'Cyan' },
    { value: '#E91E63', label: 'Rose' },
  ];

  useEffect(() => {
    const normalizeAidTypeName = (value?: string) => (value || '').trim().toLowerCase();

    const refreshUsageCounts = () => {
      const allTypes = [...systemAidTypes, ...aidTypes];
      const nameToTypeId = new Map<string, string>();

      allTypes.forEach((type) => {
        nameToTypeId.set(normalizeAidTypeName(type.name), type.id);
      });

      const nextCounts = allTypes.reduce<Record<string, number>>((acc, type) => {
        acc[type.id] = 0;
        return acc;
      }, {});

      obtenirDemandesAideComptoir().forEach((request) => {
        if (request.status === 'rejected') {
          return;
        }

        const matchingTypeId = nameToTypeId.get(normalizeAidTypeName(request.type));
        if (matchingTypeId) {
          nextCounts[matchingTypeId] = (nextCounts[matchingTypeId] || 0) + 1;
        }
      });

      obtenirDistributionsComptoir().forEach((distribution) => {
        const matchingTypeId = distribution.aidTypeId || nameToTypeId.get(normalizeAidTypeName(distribution.type));
        if (matchingTypeId) {
          nextCounts[matchingTypeId] = (nextCounts[matchingTypeId] || 0) + 1;
        }
      });

      setUsageCounts(nextCounts);
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === comptoirStorageKeys.aidRequests ||
        event.key === comptoirStorageKeys.distributions ||
        event.key === comptoirStorageKeys.customAidTypes
      ) {
        refreshUsageCounts();
      }
    };

    const handleComptoirStorageUpdated = (event: Event) => {
      const { detail } = event as CustomEvent<{ key?: string }>;

      if (
        detail?.key === comptoirStorageKeys.aidRequests ||
        detail?.key === comptoirStorageKeys.distributions ||
        detail?.key === comptoirStorageKeys.customAidTypes
      ) {
        refreshUsageCounts();
      }
    };

    refreshUsageCounts();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(comptoirStorageEvents.updated, handleComptoirStorageUpdated);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(comptoirStorageEvents.updated, handleComptoirStorageUpdated);
    };
  }, [aidTypes, systemAidTypes]);

  const getUsageCount = (type: AidType) => usageCounts[type.id] || 0;
  const hasHistoricalUsage = (type: AidType) => getUsageCount(type) > 0;

  const handleOpenDialog = (type?: AidType) => {
    if (type) {
      setEditingType(type);
      setFormData({
        name: type.name,
        description: type.description || '',
        defaultValue: type.defaultValue?.toString() || '',
        color: type.color,
        isActive: type.isActive,
      });
    } else {
      setEditingType(null);
      setFormData({
        name: '',
        description: '',
        defaultValue: '',
        color: '#1E73BE',
        isActive: true,
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingType(null);
    setFormData({
      name: '',
      description: '',
      defaultValue: '',
      color: '#1E73BE',
      isActive: true,
    });
  };

  const handleSave = () => {
    const normalizedName = formData.name.trim();

    if (!normalizedName) {
      toast.error(t('common.error'), {
        description: 'Le nom du type d\'aide est requis'
      });
      return;
    }

    const duplicateType = aidTypes.find((type) =>
      type.id !== editingType?.id
      && type.name.trim().toLowerCase() === normalizedName.toLowerCase()
    );

    if (duplicateType) {
      toast.error(t('common.error'), {
        description: 'Un type d\'aide avec ce nom existe déjà.'
      });
      return;
    }

    if (editingType) {
      const previousName = editingType.name;

      // Update existing type
      setAidTypes(prev => prev.map(type => 
        type.id === editingType.id
          ? {
              ...type,
              name: normalizedName,
              description: formData.description,
              defaultValue: formData.defaultValue ? parseFloat(formData.defaultValue) : undefined,
              color: formData.color,
              isActive: formData.isActive,
            }
          : type
      ));

      if (previousName.trim() !== normalizedName) {
        const updatedRequests = obtenirDemandesAideComptoir().map((request) =>
          request.type === previousName
            ? { ...request, type: normalizedName }
            : request
        );

        const updatedDistributions = obtenirDistributionsComptoir().map((distribution) => {
          const shouldUpdate = distribution.aidTypeId === editingType.id || distribution.type === previousName;

          return shouldUpdate
            ? {
                ...distribution,
                aidTypeId: editingType.id,
                type: normalizedName,
              }
            : distribution;
        });

        sauvegarderDemandesAideComptoir(updatedRequests);
        sauvegarderDistributionsComptoir(updatedDistributions);
      }

      toast.success(t('comptoir.aidTypeUpdated'));
    } else {
      // Create new type
      const newType: AidType = {
        id: `custom-${Date.now()}`,
        name: normalizedName,
        description: formData.description,
        defaultValue: formData.defaultValue ? parseFloat(formData.defaultValue) : undefined,
        color: formData.color,
        isActive: formData.isActive,
        isSystem: false,
        createdAt: new Date().toISOString(),
        usageCount: 0,
      };
      setAidTypes(prev => [...prev, newType]);
      toast.success(t('comptoir.aidTypeCreated'));
    }

    handleCloseDialog();
  };

  const handleDelete = (type: AidType) => {
    setDeleteConfirm(type);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      if (hasHistoricalUsage(deleteConfirm)) {
        toast.error(t('common.error'), {
          description: 'Ce type d\'aide ne peut pas être supprimé car il possède un historique d\'utilisation.',
        });
        return;
      }

      setAidTypes(prev => prev.filter(type => type.id !== deleteConfirm.id));
      toast.success(t('comptoir.aidTypeDeleted'));
      setDeleteConfirm(null);
    }
  };

  const toggleStatus = (type: AidType) => {
    setAidTypes(prev => prev.map(t => 
      t.id === type.id ? { ...t, isActive: !t.isActive } : t
    ));
    toast.success(
      type.isActive ? 'Type d\'aide désactivé' : 'Type d\'aide activé'
    );
  };

  const renderTypeCard = (type: AidType) => (
    <div 
      key={type.id}
      className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: type.color }}
            />
            <h3 className="font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {type.name}
            </h3>
            {type.isSystem && (
              <Badge variant="outline" className="text-xs">
                Système
              </Badge>
            )}
            <Badge 
              className={type.isActive ? 'bg-[#4CAF50]' : 'bg-[#999999]'}
            >
              {type.isActive ? t('comptoir.active') : t('comptoir.inactive')}
            </Badge>
          </div>
          
          {type.description && (
            <p className="text-sm text-[#666666] mb-2">
              {type.description}
            </p>
          )}
          
          <div className="flex flex-wrap gap-4 text-sm text-[#666666]">
            {type.defaultValue && (
              <div>
                <span className="font-medium">{t('comptoir.defaultValue')}:</span> {type.defaultValue.toFixed(2)} CAD$
              </div>
            )}
            {(type.usageCount !== undefined || usageCounts[type.id] !== undefined) && (
              <div>
                <span className="font-medium">Utilisations:</span> {getUsageCount(type)}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenDialog(type)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-[#DC3545] border-[#DC3545] hover:bg-[#DC3545] hover:text-white"
            onClick={() => handleDelete(type)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Switch
            checked={type.isActive}
            onCheckedChange={() => toggleStatus(type)}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {t('comptoir.manageAidTypes')}
          </h2>
          <p className="text-sm text-[#666666] mt-1">
            Configurez les types d'aide disponibles pour votre organisation
          </p>
        </div>
        <Button
          className="bg-[#4CAF50] hover:bg-[#45a049]"
          onClick={() => handleOpenDialog()}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('comptoir.addNewType')}
        </Button>
      </div>

      {systemAidTypes.length > 0 && (
        <Card>
          <CardHeader className="bg-[#F4F4F4] border-b">
            <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              <Package className="w-5 h-5" />
              {t('comptoir.systemAidTypes')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {systemAidTypes.map(type => renderTypeCard(type))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Managed Types */}
      <Card>
        <CardHeader className="bg-[#F4F4F4] border-b">
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <Package className="w-5 h-5" />
            {systemAidTypes.length > 0 ? t('comptoir.customAidTypes') : t('comptoir.aidTypes')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {aidTypes.length > 0 ? (
            <div className="space-y-3">
              {aidTypes.map(type => renderTypeCard(type))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-[#CCCCCC]" />
              <p className="text-[#666666] mb-4">{t('comptoir.noAidTypesYet')}</p>
              <Button
                variant="outline"
                onClick={() => handleOpenDialog()}
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('comptoir.createFirstAidType')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl" aria-describedby="types-aide-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {editingType ? t('comptoir.editAidType') : t('comptoir.newAidType')}
            </DialogTitle>
            <DialogDescription id="types-aide-description">
              {editingType ? 'Modifier les informations du type d\'aide' : 'Créer un nouveau type d\'aide'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div>
              <Label>{t('comptoir.aidTypeName')} *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder={t('comptoir.aidTypeNamePlaceholder')}
                className="mt-2"
              />
            </div>

            {/* Description */}
            <div>
              <Label>{t('comptoir.aidTypeDescription')}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder={t('comptoir.aidTypeDescriptionPlaceholder')}
                className="mt-2"
                rows={3}
              />
            </div>

            {/* Default Value */}
            <div>
              <Label>{t('comptoir.defaultValue')} (CAD$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.defaultValue}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
                placeholder="45.00"
                className="mt-2"
              />
              <p className="text-xs text-[#666666] mt-1">
                {t('comptoir.defaultValueHelper')}
              </p>
            </div>

            {/* Color */}
            <div>
              <Label>{t('comptoir.aidTypeColor')}</Label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-2">
                {colors.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    className={`w-12 h-12 rounded-lg border-2 transition-all ${
                      formData.color === color.value 
                        ? 'border-[#333333] scale-110' 
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    title={color.label}
                  >
                    {formData.color === color.value && (
                      <Check className="w-6 h-6 mx-auto text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-[#F4F4F4] rounded-lg">
              <div>
                <Label className="text-base">{t('comptoir.aidTypeStatus')}</Label>
                <p className="text-sm text-[#666666] mt-1">
                  {formData.isActive 
                    ? 'Ce type sera disponible dans les formulaires'
                    : 'Ce type sera masqué des formulaires'
                  }
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCloseDialog}
            >
              <X className="w-4 h-4 mr-2" />
              {t('common.cancel')}
            </Button>
            <Button
              className="bg-[#4CAF50] hover:bg-[#45a049]"
              onClick={handleSave}
            >
              <Save className="w-4 h-4 mr-2" />
              {editingType ? t('comptoir.updateAidType') : t('comptoir.createAidType')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-[#DC3545]">
              <Trash2 className="w-5 h-5" />
              {t('comptoir.confirmDeleteAidType')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('comptoir.deleteAidTypeWarning')}
              {deleteConfirm && hasHistoricalUsage(deleteConfirm) && (
                <div className="mt-3 p-3 bg-[#FFF9E6] border-l-4 border-[#FFC107] rounded">
                  <p className="text-sm text-[#666666]">
                    <strong>Attention:</strong> Ce type a été utilisé {getUsageCount(deleteConfirm)} fois.
                  </p>
                  <p className="text-sm text-[#666666] mt-2">
                    La suppression est bloquée pour préserver l'historique des demandes et des distributions.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm(null)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-[#DC3545] hover:bg-[#C82333] disabled:bg-[#CCCCCC] disabled:text-[#666666]"
              disabled={!!deleteConfirm && hasHistoricalUsage(deleteConfirm)}
            >
              {t('comptoir.deleteAidType')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}