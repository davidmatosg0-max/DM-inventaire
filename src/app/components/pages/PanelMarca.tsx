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
import { AdaptiveBrandLogo } from '../shared/AdaptiveBrandLogo';

interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  successColor: string;
  dangerColor: string;
  warningColor: string;
  logo: string | null;
  systemName: string;
  phone: string;
  address: string;
}

const QUICK_COLOR_PRESETS = [
  '#1a4d7a',
  '#2d9561',
  '#0f766e',
  '#c2410c',
  '#b45309',
  '#7c3aed',
  '#be123c',
  '#475569',
];

const isValidHexColor = (value: string) => /^#[0-9A-Fa-f]{6}$/.test(value);

const DEFAULT_BRANDING: BrandingConfig = {
  primaryColor: '#1a4d7a',      // Azul marino profesional (coordina con logo DM)
  secondaryColor: '#2d9561',    // Verde elegante
  successColor: '#2d9561',      // Verde éxito
  dangerColor: '#c23934',       // Rojo elegante
  warningColor: '#e8a419',      // Naranja/amarillo profesional
  logo: null,
  systemName: 'Banque Alimentaire',
  phone: '',
  address: ''
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
        const hydratedConfig = {
          ...DEFAULT_BRANDING,
          ...parsed,
        };
        setConfig(hydratedConfig);
        if (hydratedConfig.logo) {
          setLogoPreview(hydratedConfig.logo);
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
  }) => {
    const previewColor = isValidHexColor(value) ? value : '#94a3b8';

    return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_45px_-32px_rgba(15,23,42,0.35)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {label}
          </label>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div
          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          Ton
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-slate-200 bg-slate-50 shadow-inner">
          <div
            className="h-12 w-12 rounded-2xl border border-white/70 shadow-sm"
            style={{ backgroundColor: previewColor }}
          />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Sélecteur visuel
            </label>
            <input
              type="color"
              value={previewColor}
              onChange={(e) => onChange(e.target.value)}
              className="h-12 w-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-1"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Code hexadécimal
            </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
            pattern="^#[0-9A-Fa-f]{6}$"
            placeholder="#000000"
          />
          </div>

          <div className="h-3 rounded-full bg-slate-100">
            <div
              className="h-3 rounded-full"
              style={{ backgroundColor: previewColor, width: '100%' }}
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Couleurs rapides
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onChange(preset)}
                  className={`h-9 w-9 rounded-xl border transition hover:scale-105 ${preset.toLowerCase() === value.toLowerCase() ? 'border-slate-900 ring-2 ring-slate-300' : 'border-white/80'}`}
                  style={{ backgroundColor: preset }}
                  aria-label={`Choisir la couleur ${preset}`}
                  title={preset}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  };

  const colorFields: Array<{
    key: keyof BrandingConfig;
    label: string;
    description: string;
  }> = [
    {
      key: 'primaryColor',
      label: t('branding.primaryColor'),
      description: t('branding.primaryColorDesc'),
    },
    {
      key: 'secondaryColor',
      label: t('branding.secondaryColor'),
      description: t('branding.secondaryColorDesc'),
    },
    {
      key: 'successColor',
      label: t('branding.successColor'),
      description: t('branding.successColorDesc'),
    },
    {
      key: 'dangerColor',
      label: t('branding.dangerColor'),
      description: t('branding.dangerColorDesc'),
    },
    {
      key: 'warningColor',
      label: t('branding.warningColor'),
      description: t('branding.warningColorDesc'),
    },
  ];

  const identitySignals = [
    {
      label: 'Nom du système',
      value: config.systemName || 'Banque Alimentaire',
    },
    {
      label: 'Téléphone',
      value: config.phone || 'Non défini',
    },
    {
      label: 'Adresse',
      value: config.address || 'Non définie',
    },
    {
      label: 'Logo',
      value: logoPreview ? 'Actif' : 'Non défini',
    },
    {
      label: 'Palette',
      value: `${colorFields.length} tons`,
    },
  ];

  const previewChips = [
    { label: 'Principal', color: config.primaryColor },
    { label: 'Accent', color: config.secondaryColor },
    { label: 'Succès', color: config.successColor },
  ];

  return (
    <div className="space-y-6 pb-8">
      <section
        className="overflow-hidden rounded-[32px] border border-slate-200/70 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.45)]"
        style={{
          background: `linear-gradient(135deg, ${config.primaryColor} 0%, #10243a 52%, ${config.secondaryColor} 100%)`,
        }}
      >
        <div className="grid gap-8 px-6 py-7 text-white lg:grid-cols-[1.5fr_0.9fr] lg:px-8 lg:py-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white/85">
              <Check className="h-3.5 w-3.5" />
              Studio de marque
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight lg:text-4xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {t('branding.title')}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 lg:text-base">
              {t('branding.subtitle')} Ajustez votre identité visuelle avec une palette cohérente, un logo propre et un aperçu immédiat de l’expérience finale.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              {identitySignals.map((signal) => (
                <div key={signal.label} className="rounded-2xl border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">{signal.label}</p>
                  <p className="mt-2 text-sm font-semibold text-white break-words">{signal.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/12 bg-white/10 p-5 backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Pilotage</p>
                <p className="mt-2 text-lg font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Configuration permanente
                </p>
              </div>
              <div className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                Auto-save
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <Eye className="h-4 w-4" />
                {previewMode ? t('branding.previewActive') : t('branding.activatePreview')}
              </button>
              <button
                onClick={handleSave}
                className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 transition"
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  backgroundColor: '#f7f8fa',
                }}
              >
                <Save className="h-4 w-4" />
                {t('branding.saveChanges')}
              </button>
              <button
                onClick={handleReset}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-3 text-sm font-medium text-white/85 transition hover:bg-white/10"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <RotateCcw className="h-4 w-4" />
                {t('branding.reset')}
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {previewChips.map((chip) => (
                <div key={chip.label} className="rounded-2xl border border-white/12 bg-white/10 p-2.5 text-center">
                  <div className="mx-auto h-8 w-8 rounded-xl border border-white/20" style={{ backgroundColor: chip.color }} />
                  <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/65">{chip.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="space-y-6">
          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: config.primaryColor }}>
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('branding.logoSettings')}
                </h2>
                <p className="text-sm text-slate-500">Nom du système, logo et présence visuelle principale.</p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('branding.systemNameSettings')}
                </label>
                <input
                  type="text"
                  value={config.systemName}
                  onChange={(e) => handleColorChange('systemName', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  placeholder={t('branding.systemNamePlaceholder')}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={config.phone}
                  onChange={(e) => handleColorChange('phone', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  placeholder="Ex: (514) 555-0100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Adresse
                </label>
                <input
                  type="text"
                  value={config.address}
                  onChange={(e) => handleColorChange('address', e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  placeholder="Ex: 123 Rue Exemple, Laval, QC"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-800" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('branding.uploadLogo')}
                </label>
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center">
                  {logoPreview ? (
                    <div className="space-y-4">
                      <div className="rounded-3xl border border-slate-200 bg-white px-4 py-6 shadow-sm">
                        <div className="flex justify-center">
                          <AdaptiveBrandLogo
                            src={logoPreview}
                            alt="Logo preview"
                            wrapperClassName="h-28 w-28 sm:h-32 sm:w-32"
                            containerClassName="border border-slate-200"
                            shadowClassName="shadow-[0_14px_28px_-20px_rgba(15,23,42,0.22)]"
                            squareRadiusClassName="rounded-[28px]"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <Upload className="h-4 w-4" />
                        {t('branding.uploadLogo')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
                        <Upload className="h-7 w-7 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-700">{t('branding.uploadLogo')}</p>
                      <p className="text-xs text-slate-500">{t('branding.logoFormats')}</p>
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
                    className="mt-3 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white transition"
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      backgroundColor: config.primaryColor,
                    }}
                  >
                    {t('common.upload')}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={`rounded-[30px] border bg-white p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] transition ${previewMode ? 'border-slate-900 ring-1 ring-slate-900/10' : 'border-slate-200'}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Aperçu de l’interface
                </h2>
                <p className="text-sm text-slate-500">Une prévisualisation plus réaliste du rendu de votre identité.</p>
              </div>
              <div className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {previewMode ? 'Live' : 'Studio'}
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between px-5 py-4 text-white" style={{ backgroundColor: config.primaryColor }}>
                <div className="flex items-center gap-3">
                  {logoPreview ? (
                    <AdaptiveBrandLogo
                      src={logoPreview}
                      alt="Logo"
                      wrapperClassName="h-10 w-10"
                      containerClassName="border border-white/15 backdrop-blur-sm"
                      backgroundClassName="bg-white/90"
                      squareRadiusClassName="rounded-[16px]"
                      shadowClassName=""
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/12 backdrop-blur-sm">
                      <Palette className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/70">Identité</p>
                    <p className="text-sm font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{config.systemName}</p>
                    {config.phone && (
                      <p className="mt-1 text-xs text-white/80">{config.phone}</p>
                    )}
                    {config.address && (
                      <p className="mt-1 text-xs text-white/70">{config.address}</p>
                    )}
                  </div>
                </div>
                <div className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/80">Portail interne</div>
              </div>

              <div className="space-y-4 p-5">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Accent principal</p>
                    <div className="mt-3 h-2 rounded-full" style={{ backgroundColor: config.primaryColor }} />
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Accent secondaire</p>
                    <div className="mt-3 h-2 rounded-full" style={{ backgroundColor: config.secondaryColor }} />
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Signal d’alerte</p>
                    <div className="mt-3 h-2 rounded-full" style={{ backgroundColor: config.warningColor }} />
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap gap-3">
                    <button className="rounded-2xl px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: config.primaryColor }}>
                      Action principale
                    </button>
                    <button className="rounded-2xl px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: config.secondaryColor }}>
                      Action secondaire
                    </button>
                    <button className="rounded-2xl px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: config.successColor }}>
                      Confirmation
                    </button>
                  </div>
                  <div className="mt-4 rounded-2xl border px-4 py-3 text-sm" style={{ borderColor: `${config.warningColor}40`, backgroundColor: `${config.warningColor}10` }}>
                    Les avertissements et messages sensibles gardent un contraste clair et une hiérarchie propre.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Palette className="mr-2 inline h-5 w-5" />
                {t('branding.colorSettings')}
              </h2>
              <p className="mt-1 text-sm text-slate-500">Composez une palette élégante, stable et cohérente à travers tous les modules.</p>
            </div>
            <div className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {colorFields.length} réglages
            </div>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {colorFields.map((field) => (
              <ColorPicker
                key={field.key}
                label={field.label}
                value={config[field.key] as string}
                onChange={(value) => handleColorChange(field.key, value)}
                description={field.description}
              />
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Sauvegarde</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">Chaque ajustement est enregistré automatiquement dans le navigateur et réappliqué au prochain chargement.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Cohérence</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">Les couleurs et le logo se diffusent dans l’ensemble des modules pour préserver une lecture uniforme et professionnelle.</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Recommandation</h3>
            <p className="mt-3 text-sm leading-6 text-slate-700">Préférez un logo PNG transparent de moins de 2 MB et des couleurs contrastées pour garantir une apparence haut de gamme.</p>
          </div>
        </div>
      </section>
    </div>
  );
}