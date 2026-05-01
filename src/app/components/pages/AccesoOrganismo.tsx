import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Key, Lock, Eye, EyeOff, LogIn, Shield, Sparkles } from 'lucide-react';
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
        background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 100%)`,
      }}
    >
      {/* Selector de Idioma - Posicionado arriba a la derecha */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSelector />
      </div>

      {/* Formas decorativas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: branding.primaryColor }}
        />
        <div 
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: branding.secondaryColor }}
        />
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: branding.primaryColor }}
        />
      </div>
      
      {/* Contenedor principal con glassmorphism */}
      <div className="relative z-10 w-full max-w-md">
        <div 
          className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 border border-white/60"
          style={{
            boxShadow: `0 8px 32px 0 ${branding.primaryColor}33, 0 0 80px ${branding.secondaryColor}1a`
          }}
        >
          {/* Logo y Header con efecto glow */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative inline-block">
                {/* Glow effect detrás del logo */}
                <div 
                  className="absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse"
                  style={{ backgroundColor: branding.primaryColor }}
                />
                <div 
                  className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full flex items-center justify-center overflow-hidden shadow-2xl border-4 bg-white"
                  style={{ borderColor: branding.primaryColor }}
                >
                  {branding.logo ? (
                    <img 
                      src={branding.logo} 
                      alt="Logo" 
                      className="h-full w-full rounded-full"
                      style={{ 
                        objectFit: 'cover',
                        objectPosition: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1) inset'
                      }}
                    />
                  ) : (
                    <div 
                      className="h-full w-full flex items-center justify-center text-white"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      <Key className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Título con iconos y efecto Sparkles */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <Key 
                className="w-5 h-5 sm:w-6 sm:h-6" 
                style={{ color: branding.primaryColor }}
              />
              <h1 
                className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight" 
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  color: branding.primaryColor 
                }}
              >
                {t('organismPortal.title')}
              </h1>
              <Sparkles 
                className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" 
                style={{ color: branding.secondaryColor }}
              />
            </div>
            <p className="text-sm sm:text-base text-[#666666]" style={{ fontFamily: 'Roboto, sans-serif' }}>
              {t('organismPortal.subtitle')}
            </p>
          </div>

          {/* Card de Login con estilo moderno */}
          <Card className="shadow-lg border-2 border-white/60">
            <CardHeader 
              className="text-white rounded-t-lg"
              style={{ 
                background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`,
                boxShadow: `0 4px 15px ${branding.primaryColor}40`
              }}
            >
              <CardTitle className="flex items-center gap-2 justify-center" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <Lock className="w-5 h-5" />
                {t('organismPortal.login')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Campo de Clave */}
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
                    className="pr-10 font-mono tracking-wider uppercase border-2 focus:border-opacity-50 transition-all duration-300"
                    style={{ 
                      fontSize: '1.1rem',
                      borderColor: branding.primaryColor + '30'
                    }}
                    maxLength={24}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarClave(!mostrarClave)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#333333] transition-colors duration-200"
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

              {/* Información de Ayuda con nuevo estilo */}
              <div 
                className="rounded-lg p-4 border-2"
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

              {/* Botón de Acceso con estilo moderno */}
              <Button
                onClick={handleAcceder}
                disabled={claveAcceso.length < 6}
                className="w-full h-12 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ 
                  fontSize: '1.1rem',
                  fontFamily: 'Montserrat, sans-serif',
                  background: claveAcceso.length >= 6 
                    ? `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`
                    : '#cccccc',
                  boxShadow: claveAcceso.length >= 6 ? `0 4px 15px ${branding.secondaryColor}40` : 'none'
                }}
              >
                <LogIn className="w-5 h-5 mr-2" />
                {t('organismPortal.accessButton')}
              </Button>

              {/* Claves de prueba (solo para desarrollo) */}
              <div className="pt-4 border-t border-gray-200">
                <p className="text-xs text-[#666666] mb-2 font-medium">{t('organismPortal.testKeys')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {organismosDisponibles.filter(o => o.claveAcceso).map(o => (
                    <button
                      key={o.id}
                      onClick={() => setClaveAcceso(o.claveAcceso || '')}
                      className="text-xs bg-gray-100 hover:bg-gray-200 p-2 rounded-lg font-mono transition-all duration-200 hover:scale-105 relative"
                      style={{
                        borderLeft: `3px solid ${branding.primaryColor}`
                      }}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>{o.claveAcceso}</span>
                        {o.participaPRS && (
                          <span 
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white whitespace-nowrap"
                            style={{ 
                              backgroundColor: branding.secondaryColor,
                              fontFamily: 'Montserrat, sans-serif'
                            }}
                          >
                            ✓ PRS
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer decorativo */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-transparent via-gray-100/50 to-transparent">
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