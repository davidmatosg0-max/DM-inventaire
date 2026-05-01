import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Palette, 
  Upload, 
  Save, 
  RotateCcw, 
  Eye,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  successColor: string;
  dangerColor: string;
  warningColor: string;
  logo: string | null;
  systemName: string;
}

const DEFAULT_BRANDING: BrandingConfig = {
  primaryColor: '#1a4d7a',      // Azul marino profesional (coordina con logo DM)
  secondaryColor: '#2d9561',    // Verde elegante
  successColor: '#2d9561',      // Verde éxito
  dangerColor: '#c23934',       // Rojo elegante
  warningColor: '#e8a419',      // Naranja/amarillo profesional
  logo: null,
  systemName: 'Banque Alimentaire'
};

export function PanelMarca() {
  const { t } = useTranslation();
  const [config, setConfig] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [previewMode, setPreviewMode] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Cargar configuración guardada
  useEffect(() => {
    const savedConfig = localStorage.getItem('brandingConfig_permanent');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        if (parsed.logo) {
          setLogoPreview(parsed.logo);
        }
      } catch (error) {
        console.error('Error loading branding config:', error);
      }
    } else {
      // Guardar configuración por defecto si no existe
      localStorage.setItem('brandingConfig_permanent', JSON.stringify(DEFAULT_BRANDING));
      setConfig(DEFAULT_BRANDING);
      // Aplicar los valores por defecto globalmente
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('brandingUpdated', { detail: DEFAULT_BRANDING }));
      }, 0);
    }
  }, []);

  // Aplicar colores en tiempo real
  useEffect(() => {
    if (previewMode || config !== DEFAULT_BRANDING) {
      document.documentElement.style.setProperty('--color-primary', config.primaryColor);
      document.documentElement.style.setProperty('--color-secondary', config.secondaryColor);
      document.documentElement.style.setProperty('--color-success', config.successColor);
      document.documentElement.style.setProperty('--color-danger', config.dangerColor);
      document.documentElement.style.setProperty('--color-warning', config.warningColor);
    }
  }, [config, previewMode]);

  const handleColorChange = (field: keyof BrandingConfig, value: string) => {
    setConfig(prev => {
      const newConfig = { ...prev, [field]: value };
      // Guardar automáticamente en localStorage
      localStorage.setItem('brandingConfig_permanent', JSON.stringify(newConfig));
      // Aplicar cambios globalmente en tiempo real usando setTimeout para evitar actualización durante render
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('brandingUpdated', { detail: newConfig }));
      }, 0);
      return newConfig;
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t('branding.fileTooLarge'));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoPreview(result);
        const newConfig = { ...config, logo: result };
        setConfig(newConfig);
        // Guardar automáticamente el logo
        localStorage.setItem('brandingConfig_permanent', JSON.stringify(newConfig));
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('brandingUpdated', { detail: newConfig }));
        }, 0);
        toast.success('Logo mis à jour et sauvegardé automatiquement');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    try {
      localStorage.setItem('brandingConfig_permanent', JSON.stringify(config));
      // Aplicar cambios globalmente
      window.dispatchEvent(new CustomEvent('brandingUpdated', { detail: config }));
      toast.success('✅ ' + t('branding.changesSaved') + ' - Les modifications sont permanentes');
    } catch (error) {
      toast.error(t('messages.error'));
      console.error(error);
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_BRANDING);
    setLogoPreview(null);
    localStorage.removeItem('brandingConfig_permanent');
    // Guardar los valores predeterminados nuevamente
    localStorage.setItem('brandingConfig_permanent', JSON.stringify(DEFAULT_BRANDING));
    // Aplicar cambios globalmente
    window.dispatchEvent(new CustomEvent('brandingUpdated', { detail: DEFAULT_BRANDING }));
    toast.success(t('branding.changesReset'));
  };

  const ColorPicker = ({ 
    label, 
    value, 
    onChange, 
    description 
  }: { 
    label: string; 
    value: string; 
    onChange: (value: string) => void;
    description: string;
  }) => (
    <div className="space-y-2">
      <label className="block font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {label}
      </label>
      <p className="text-sm text-gray-600">{description}</p>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-20 h-20 rounded-lg border-2 border-gray-300 cursor-pointer"
          />
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            pattern="^#[0-9A-Fa-f]{6}$"
            placeholder="#000000"
          />
          <div 
            className="mt-2 h-12 rounded-lg border-2 border-gray-200"
            style={{ backgroundColor: value }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Banner de autoguardado */}
        <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-3 rounded">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                ✨ Sauvegarde Automatique Activée
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                Tous les changements sont sauvegardés automatiquement et de manière permanente dans votre navigateur.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1a4d7a' }}>
              <Palette className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem' }}>
                {t('branding.title')}
              </h1>
              <p className="text-gray-600">
                {t('branding.subtitle')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                previewMode 
                  ? 'text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={{ 
                fontFamily: 'Montserrat, sans-serif', 
                fontWeight: 500,
                backgroundColor: previewMode ? '#2d9561' : undefined
              }}
            >
              <Eye className="w-4 h-4" />
              {previewMode ? t('branding.previewActive') : t('branding.activatePreview')}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              <RotateCcw className="w-4 h-4" />
              {t('branding.reset')}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
              style={{ 
                fontFamily: 'Montserrat, sans-serif', 
                fontWeight: 500,
                backgroundColor: '#2d9561'
              }}
            >
              <Save className="w-4 h-4" />
              {t('branding.saveChanges')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logo del Sistema */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.25rem' }}>
            <ImageIcon className="w-5 h-5 inline mr-2" />
            {t('branding.logoSettings')}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('branding.systemNameSettings')}
              </label>
              <input
                type="text"
                value={config.systemName}
                onChange={(e) => handleColorChange('systemName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder={t('branding.systemNamePlaceholder')}
              />
            </div>

            <div>
              <label className="block font-medium mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('branding.uploadLogo')}
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {logoPreview ? (
                  <div className="space-y-4">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="max-h-32 mx-auto"
                    />
                    <button
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      style={{ color: '#1a4d7a' }}
                      className="hover:underline"
                    >
                      {t('branding.uploadLogo')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-12 h-12 mx-auto text-gray-400" />
                    <p className="text-gray-600">
                      {t('branding.uploadLogo')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('branding.logoFormats')}
                    </p>
                  </div>
                )}
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
              {!logoPreview && (
                <button
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  className="mt-2 w-full px-4 py-2 text-white rounded-lg transition-colors"
                  style={{ 
                    fontFamily: 'Montserrat, sans-serif', 
                    fontWeight: 500,
                    backgroundColor: '#1a4d7a'
                  }}
                >
                  {t('common.upload')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Vista Previa */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <h2 className="font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.25rem' }}>
            {t('branding.activatePreview')}
          </h2>

          <div className="space-y-4">
            {/* Header Preview */}
            <div 
              className="rounded-lg p-4 text-white"
              style={{ backgroundColor: config.primaryColor }}
            >
              <div className="flex items-center gap-3">
                {logoPreview && (
                  <img src={logoPreview} alt="Logo" className="h-8" />
                )}
                <span className="font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {config.systemName}
                </span>
              </div>
            </div>

            {/* Buttons Preview */}
            <div className="space-y-2">
              <button
                className="w-full px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: config.primaryColor }}
              >
                {t('branding.primaryColor')}
              </button>
              <button
                className="w-full px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: config.secondaryColor }}
              >
                {t('branding.successColor')}
              </button>
              <button
                className="w-full px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: config.successColor }}
              >
                {t('branding.successColor')}
              </button>
              <button
                className="w-full px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: config.dangerColor }}
              >
                {t('branding.dangerColor')}
              </button>
              <button
                className="w-full px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: config.warningColor }}
              >
                {t('branding.warningColor')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Paleta de Colores */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <h2 className="font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.25rem' }}>
          <Palette className="w-5 h-5 inline mr-2" />
          {t('branding.colorSettings')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ColorPicker
            label={t('branding.primaryColor')}
            value={config.primaryColor}
            onChange={(value) => handleColorChange('primaryColor', value)}
            description={t('branding.primaryColorDesc')}
          />

          <ColorPicker
            label={t('branding.successColor')}
            value={config.secondaryColor}
            onChange={(value) => handleColorChange('secondaryColor', value)}
            description={t('branding.successColorDesc')}
          />

          <ColorPicker
            label={t('branding.successColor')}
            value={config.successColor}
            onChange={(value) => handleColorChange('successColor', value)}
            description={t('branding.successColorDesc')}
          />

          <ColorPicker
            label={t('branding.dangerColor')}
            value={config.dangerColor}
            onChange={(value) => handleColorChange('dangerColor', value)}
            description={t('branding.dangerColorDesc')}
          />

          <ColorPicker
            label={t('branding.warningColor')}
            value={config.warningColor}
            onChange={(value) => handleColorChange('warningColor', value)}
            description={t('branding.warningColorDesc')}
          />
        </div>
      </div>

      {/* Información */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: '#1a4d7a' }}>
            <Check className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#333333] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              💾 Configuration Permanente
            </h3>
            <ul className="text-sm text-gray-700 space-y-1.5">
              <li>✅ <strong>Sauvegarde automatique:</strong> Chaque modification est sauvegardée instantanément dans votre navigateur</li>
              <li>✅ <strong>Persistance permanente:</strong> Vos configurations restent actives même après fermeture du navigateur</li>
              <li>✅ <strong>Synchronisation globale:</strong> Les couleurs et le logo s'appliquent automatiquement dans tous les modules</li>
              <li>🎨 <strong>Vista previa en temps réel:</strong> Utilisez le mode prévisualisation pour voir les changements avant de sauvegarder</li>
              <li>🖼️ <strong>Logo recommandé:</strong> PNG avec fond transparent, taille max 2MB</li>
              <li>🔄 <strong>Restauration:</strong> Vous pouvez revenir aux valeurs par défaut à tout moment avec le bouton "Réinitialiser"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}