import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Key, Lock, Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { VistaPublicaOrganismo } from './VistaPublicaOrganismo_fix';
import { LanguageSelector } from '../organism-portal/LanguageSelector';
import { useBranding } from '../../../hooks/useBranding';
import { escucharCambiosOrganismo } from '../../utils/organismoEvents';
import { obtenerOrganismos, type Organismo } from '../../utils/organismosStorage';

type OrganismoPortal = Organismo & {
  participaPRS: boolean;
};

function normalizarOrganismoPortal(organismo: Organismo): OrganismoPortal {
  return {
    ...organismo,
    participaPRS: organismo.participantePRS === true,
  };
}

export function AccesoOrganismo() {
  const { t, i18n } = useTranslation();
  const branding = useBranding();
  const [claveAcceso, setClaveAcceso] = useState('');
  const [mostrarClave, setMostrarClave] = useState(false);
  const [organismoAutenticado, setOrganismoAutenticado] = useState<OrganismoPortal | null>(null);
  const [organismosDisponibles, setOrganismosDisponibles] = useState<OrganismoPortal[]>([]);
  const claveAccesoInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const recargarOrganismos = () => {
      setOrganismosDisponibles(obtenerOrganismos().map(normalizarOrganismoPortal));
    };

    recargarOrganismos();
    return escucharCambiosOrganismo(recargarOrganismos);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const claveDesdeUrl = new URLSearchParams(window.location.search).get('clave');
    if (claveDesdeUrl) {
      setClaveAcceso(claveDesdeUrl.toUpperCase());
    }
  }, []);

  useEffect(() => {
    if (organismoAutenticado) {
      return;
    }

    claveAccesoInputRef.current?.focus();
  }, [organismoAutenticado]);

  const handleAcceder = () => {
    // Buscar organismo por clave de acceso
    const organismo = organismosDisponibles.find(
      o => o.claveAcceso?.toUpperCase() === claveAcceso.toUpperCase()
    );

    if (organismo) {
      setOrganismoAutenticado(organismo);
      toast.success(t('organismPortal.welcomeMessage', { name: organismo.nombre }));
      
      // Log para verificar si el organismo participa en PRS
      if (organismo.participaPRS) {
        console.log('✅ Organismo PRS autenticado:', organismo.nombre);
        console.log('🔑 Acceso al botón "Nueva Entrada" habilitado');
      }
    } else {
      toast.error(t('organismPortal.incorrectKey'));
    }
  };

  const handleCerrarSesion = () => {
    setOrganismoAutenticado(null);
    setClaveAcceso('');
    toast.success(t('organismPortal.sessionClosed'));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAcceder();
    }
  };

  const organismesAvecCle = organismosDisponibles.filter((organisme) => organisme.claveAcceso);

  // Si ya está autenticado, mostrar vista pública
  if (organismoAutenticado) {
    return (
      <VistaPublicaOrganismo 
        organismo={organismoAutenticado} 
        onCerrarSesion={handleCerrarSesion}
      />
    );
  }

  // Pantalla de login
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 relative overflow-hidden"
      style={{ 
        fontFamily: 'Roboto, sans-serif',
        background: `linear-gradient(145deg, ${branding.primaryColor}12 0%, #ffffff 45%, ${branding.secondaryColor}10 100%)`,
      }}
    >
      {/* Selector de Idioma - Posicionado arriba a la derecha */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector />
      </div>

      {/* Fond décoratif discret */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: branding.primaryColor }}
        />
        <div 
          className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: branding.secondaryColor }}
        />
      </div>
      
      {/* Conteneur principal */}
      <div className="relative z-10 w-full max-w-md">
        <div 
          className="bg-white/94 rounded-[28px] shadow-[0_28px_70px_-48px_rgba(15,45,71,0.45)] p-4 sm:p-6 md:p-8 border border-white/70"
          style={{
            backdropFilter: 'blur(16px)'
          }}
        >
          {/* Logo et introduction */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4">
              <div 
                className="h-16 w-16 sm:h-18 sm:w-18 rounded-full flex items-center justify-center overflow-hidden border-4 bg-white shadow-lg"
                style={{ borderColor: `${branding.primaryColor}55` }}
              >
                {branding.logo ? (
                  <img 
                    src={branding.logo} 
                    alt="Logo" 
                    className="h-full w-full rounded-full"
                    style={{ 
                      objectFit: 'cover',
                      objectPosition: 'center'
                    }}
                  />
                ) : (
                  <div 
                    className="h-full w-full flex items-center justify-center text-white"
                    style={{ backgroundColor: branding.primaryColor }}
                  >
                    <Key className="w-8 h-8" />
                  </div>
                )}
              </div>
            </div>

            <div className="mb-2">
              <h1 
                className="text-xl sm:text-2xl md:text-[2rem] font-bold tracking-tight" 
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  color: branding.primaryColor 
                }}
              >
                {t('organismPortal.title')}
              </h1>
            </div>
            <p className="text-sm sm:text-base text-[#666666]" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {t('organismPortal.subtitle')}
            </p>
          </div>

          {/* Carte d'accès */}
          <Card className="shadow-sm border border-slate-200/80 overflow-hidden">
            <CardHeader 
              className="text-white rounded-t-lg"
              style={{ 
                background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`,
                boxShadow: `0 10px 24px -18px ${branding.primaryColor}90`
              }}
            >
              <CardTitle className="flex items-center gap-2 justify-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Lock className="w-5 h-5" />
                {t('organismPortal.login')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5 bg-white">
              <div className="space-y-2">
                <Label htmlFor="claveAcceso" className="text-[#333333] font-medium">
                  {t('organismPortal.accessKey')} *
                </Label>
                <div className="relative">
                  <Input
                    ref={claveAccesoInputRef}
                    id="claveAcceso"
                    type={mostrarClave ? 'text' : 'password'}
                    placeholder={t('organismPortal.accessKeyPlaceholder')}
                    value={claveAcceso}
                    onChange={(e) => setClaveAcceso(e.target.value.toUpperCase())}
                    onKeyPress={handleKeyPress}
                    className="h-11 pr-10 font-mono tracking-wider uppercase border-slate-200 bg-slate-50 focus-visible:ring-2"
                    style={{ 
                      fontSize: '1.05rem'
                    }}
                    maxLength={24}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarClave(!mostrarClave)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#333333]"
                    aria-label={mostrarClave ? t('organismPortal.hideKey') : t('organismPortal.showKey')}
                  >
                    {mostrarClave ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-[#666666]">
                  {t('organismPortal.accessKeyFormat')}
                </p>
              </div>

              {/* Aide */}
              <div 
                className="rounded-xl p-4 border"
                style={{
                  backgroundColor: `${branding.primaryColor}08`,
                  borderColor: `${branding.primaryColor}30`
                }}
              >
                <p className="text-sm text-[#333333] mb-2 font-medium">
                  <strong>{t('organismPortal.noAccessKey')}</strong>
                </p>
                <p className="text-xs text-[#666666]">
                  {t('organismPortal.contactInfo')}
                </p>
              </div>

              {/* Action principale */}
              <Button
                onClick={handleAcceder}
                disabled={claveAcceso.length < 6}
                className="w-full h-12 text-white font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  fontSize: '1.05rem',
                  fontFamily: 'Montserrat, sans-serif',
                  background: claveAcceso.length >= 6 
                    ? `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`
                    : '#cccccc',
                  boxShadow: claveAcceso.length >= 6 ? `0 10px 24px -18px ${branding.secondaryColor}95` : 'none'
                }}
              >
                <LogIn className="w-5 h-5 mr-2" />
                {t('organismPortal.accessButton')}
              </Button>

              {organismesAvecCle.length > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-[#666666] mb-2 font-medium">{t('organismPortal.testKeys')}</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {organismesAvecCle.map((organisme) => (
                      <button
                        key={organisme.id}
                        onClick={() => setClaveAcceso(organisme.claveAcceso || '')}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left font-mono text-xs transition-colors hover:bg-slate-100"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{organisme.claveAcceso}</span>
                          {organisme.participaPRS && (
                            <span 
                              className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white whitespace-nowrap"
                              style={{ 
                                backgroundColor: branding.secondaryColor,
                                fontFamily: 'Montserrat, sans-serif'
                              }}
                            >
                              PRS
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Signature */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100/80 px-4 py-2">
              <Shield className="w-4 h-4" style={{ color: branding.primaryColor }} />
              <p className="text-xs text-[#666666]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                {branding.systemName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}