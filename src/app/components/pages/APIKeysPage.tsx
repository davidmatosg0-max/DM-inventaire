import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Copy, Eye, EyeOff, RefreshCw, Download, Shield, Activity, Clock, Globe, CheckCircle, Zap, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  crearAPIKey, 
  obtenerAPIKeys, 
  revocarAPIKey, 
  actualizarAPIKey,
  exportarDocumentacionAPI,
  eliminarAPIKey,
  obtenerEstadisticasAPI,
  type APIKey,
  type Permiso
} from '../../utils/apiKeyManager';
import { toast } from 'sonner';
import { useBranding } from '../../../hooks/useBranding';
import { copiarAlPortapapeles } from '../../utils/clipboard';

export function APIKeysPage() {
  const branding = useBranding();
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyValue, setShowKeyValue] = useState<{ [key: string]: boolean }>({});
  const [estadisticas, setEstadisticas] = useState(obtenerEstadisticasAPI());

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    expiresInDays: 365,
    permissions: [] as Permiso[],
  });

  useEffect(() => {
    cargarAPIKeys();
  }, []);

  const cargarAPIKeys = () => {
    setApiKeys(obtenerAPIKeys());
    setEstadisticas(obtenerEstadisticasAPI());
  };

  const handleCrearAPIKey = () => {
    if (!formData.name.trim()) {
      toast.error('Le nom est obligatoire');
      return;
    }

    if (formData.permissions.length === 0) {
      toast.error('Sélectionnez au moins une permission');
      return;
    }

    const newKey = crearAPIKey({
      name: formData.name,
      description: formData.description,
      createdBy: 'admin', // TODO: Obtener usuario actual
      permissions: formData.permissions,
      expiresInDays: formData.expiresInDays,
    });

    toast.success(`Clé API créée : ${newKey.name}`);
    
    // Mostrar la key completa una vez
    setShowKeyValue({ [newKey.id]: true });
    
    setShowCreateModal(false);
    setFormData({
      name: '',
      description: '',
      expiresInDays: 365,
      permissions: [],
    });
    cargarAPIKeys();
  };

  const handleCopiarKey = (key: string) => {
    copiarAlPortapapeles(key);
    toast.success('Clé API copiée dans le presse-papiers');
  };

  const handleRevocarKey = (keyId: string, name: string) => {
    if (confirm(`Révoquer l'accès à "${name}" ?`)) {
      revocarAPIKey(keyId);
      toast.success('Clé API révoquée');
      cargarAPIKeys();
    }
  };

  const handleEliminarKey = (keyId: string, name: string) => {
    if (confirm(`Supprimer définitivement "${name}" ?`)) {
      eliminarAPIKey(keyId);
      toast.success('Clé API supprimée');
      cargarAPIKeys();
    }
  };

  const togglePermission = (permission: Permiso) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const permissionsAvailable: { value: Permiso; label: string; color: string }[] = [
    { value: 'read:inventory', label: 'Lire l\'inventaire', color: '#4CAF50' },
    { value: 'write:inventory', label: 'Modifier l\'inventaire', color: '#FF9800' },
    { value: 'read:orders', label: 'Lire les commandes', color: '#2196F3' },
    { value: 'write:orders', label: 'Modifier les commandes', color: '#FF9800' },
    { value: 'read:organisms', label: 'Lire les organismes', color: '#9C27B0' },
    { value: 'write:organisms', label: 'Modifier les organismes', color: '#FF9800' },
    { value: 'read:transport', label: 'Lire le transport', color: '#00BCD4' },
    { value: 'write:transport', label: 'Modifier le transport', color: '#FF9800' },
    { value: 'read:reports', label: 'Lire les rapports', color: '#795548' },
    { value: 'read:users', label: 'Lire les utilisateurs', color: '#607D8B' },
    { value: 'write:users', label: 'Modifier les utilisateurs', color: '#F44336' },
    { value: 'admin:all', label: 'Administration totale', color: '#F44336' },
  ];

  const exportarDocumentacion = () => {
    const docs = exportarDocumentacionAPI();
    const blob = new Blob([docs], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'api-documentation.json';
    a.click();
    toast.success('Documentation exportée');
  };

  return (
    <div className="min-h-screen relative">
      {/* Fondo con glassmorphism */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 100%)`
        }}
      >
        <div 
          className="absolute top-20 right-20 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: branding.primaryColor }}
        />
        <div 
          className="absolute bottom-20 left-20 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: branding.secondaryColor }}
        />
      </div>

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 
              className="text-3xl font-bold flex items-center gap-3"
              style={{ 
                fontFamily: 'Montserrat, sans-serif',
                color: branding.primaryColor 
              }}
            >
              <Key className="w-8 h-8" />
              Gestion des clés API
            </h1>
            <p className="text-gray-600 mt-2">Gestion complète des clés API et des permissions</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={exportarDocumentacion}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Documentation
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="gap-2"
              style={{ backgroundColor: branding.primaryColor }}
            >
              <Plus className="w-4 h-4" />
              Nouvelle clé API
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="backdrop-blur-lg bg-white/80 border-l-4" style={{ borderLeftColor: branding.primaryColor }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg" style={{ backgroundColor: `${branding.primaryColor}20` }}>
                  <Key className="w-6 h-6" style={{ color: branding.primaryColor }} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Clés API totales</p>
                  <p className="text-2xl font-bold" style={{ color: branding.primaryColor }}>
                    {estadisticas.totalKeys}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/80 border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Clés actives</p>
                  <p className="text-2xl font-bold text-green-600">
                    {estadisticas.activeKeys}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/80 border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-orange-100">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Requêtes aujourd'hui</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {estadisticas.requestsToday.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-lg bg-white/80 border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-100">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Requêtes totales</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {estadisticas.totalRequests.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de API Keys */}
        <Card className="backdrop-blur-lg bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Clés API actives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiKeys.length === 0 ? (
                <div className="text-center py-12">
                  <Key className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Aucune clé API créée</p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    Créer la première clé API
                  </Button>
                </div>
              ) : (
                apiKeys.map(key => (
                  <div
                    key={key.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg">{key.name}</h3>
                          {key.isActive ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                              Active
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                              Révoquée
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{key.description}</p>
                        
                        {/* API Key Value */}
                        <div className="flex items-center gap-2 mb-3">
                          <code className="flex-1 bg-gray-100 px-3 py-2 rounded font-mono text-sm">
                            {showKeyValue[key.id] ? key.key : '••••••••••••••••••••••••••••••••'}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowKeyValue(prev => ({ ...prev, [key.id]: !prev[key.id] }))}
                          >
                            {showKeyValue[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopiarKey(key.key)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Permisos */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {key.permissions.map(permission => {
                            const permData = permissionsAvailable.find(p => p.value === permission);
                            return (
                              <span
                                key={permission}
                                className="px-2 py-1 rounded text-xs text-white"
                                style={{ backgroundColor: permData?.color || '#666' }}
                              >
                                {permData?.label || permission}
                              </span>
                            );
                          })}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Créée</p>
                            <p className="font-semibold">{new Date(key.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Dernière utilisation</p>
                            <p className="font-semibold">
                              {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Jamais'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Total des requêtes</p>
                            <p className="font-semibold">{key.usage.totalRequests.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-col gap-2 ml-4">
                        {key.isActive && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevocarKey(key.id, key.name)}
                            className="text-orange-600 hover:bg-orange-50"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEliminarKey(key.id, key.name)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Crear API Key */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Créer une nouvelle clé API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Mon application"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description d'utilisation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Expire dans (jours)</label>
                <Input
                  type="number"
                  value={formData.expiresInDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresInDays: parseInt(e.target.value) }))}
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Permissions *</label>
                <div className="grid grid-cols-2 gap-2">
                  {permissionsAvailable.map(permission => (
                    <label
                      key={permission.value}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.permissions.includes(permission.value)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission.value)}
                        onChange={() => togglePermission(permission.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">{permission.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCrearAPIKey}
                  className="flex-1"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  Créer la clé API
                </Button>
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}