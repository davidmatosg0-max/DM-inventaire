import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Key, Lock, Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { AccessExperienceShell } from '../shared/AccessExperienceShell';
import { VistaPublicaOrganismo } from './VistaPublicaOrganismo_fix';
import { LanguageSelector } from '../organism-portal/LanguageSelector';
import { useBranding } from '../../../hooks/useBranding';
import { escucharCambiosOrganismo } from '../../utils/organismoEvents';
import { obtenerOrganismos, type Organismo } from '../../utils/organismosStorage';
import { normalizarClaveAcceso } from '../../utils/claveAcceso';

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
  const { t } = useTranslation();
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
      setClaveAcceso(normalizarClaveAcceso(claveDesdeUrl));
    }
  }, []);

  useEffect(() => {
    if (organismoAutenticado) {
      return;
    }

    claveAccesoInputRef.current?.focus();
  }, [organismoAutenticado]);

  const handleAcceder = () => {
    const claveNormalizada = normalizarClaveAcceso(claveAcceso);

    if (!claveNormalizada) {
      toast.error(t('organismPortal.incorrectKey'));
      return;
    }

    // Buscar organismo por clave de acceso
    const organismo = organismosDisponibles.find(
      o => normalizarClaveAcceso(o.claveAcceso || '') === claveNormalizada
    );

    if (organismo) {
      if (!organismo.activo) {
        toast.error(`Cet organisme est actuellement inactif. Veuillez contacter ${branding.systemName}.`);
        return;
      }

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
  const organismesPRS = organismesAvecCle.filter((organisme) => organisme.participaPRS).length;
  const systemAddress = branding.address?.trim();
  const systemPhone = branding.phone?.trim();

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
    <AccessExperienceShell
      branding={branding}
      topRight={<LanguageSelector />}
      leftPanel={
        <div className="flex h-full flex-col justify-between gap-6">
          <div>
            <div className="rounded-[28px] border border-white/90 bg-white/92 p-6 shadow-[0_22px_50px_-36px_rgba(15,45,71,0.35)]">
                <p
                  className="text-[2.1rem] font-bold leading-none tracking-tight"
                  style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                >
                  {branding.systemName}
                </p>
                <p className="mt-4 text-[1.08rem] font-semibold text-slate-700">Système de gestion des commandes</p>
                {systemAddress && <p className="mt-3 text-[1.02rem] text-slate-500">{systemAddress}</p>}
                {systemPhone && <p className="mt-1 text-[1.02rem] text-slate-500">{systemPhone}</p>}
            </div>

            <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Portail organisme</p>
            <h1
              className="mt-2 text-[1.9rem] font-bold tracking-tight text-slate-900"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {t('organismPortal.title')}
            </h1>

            <p className="mt-4 max-w-xl text-[1rem] leading-7 text-slate-600">
              {t('organismPortal.subtitle')}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[22px] border border-white/80 bg-white/85 p-4 shadow-[0_16px_34px_-30px_rgba(15,45,71,0.4)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Accès actifs</p>
                <p className="mt-2 text-2xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>{organismesAvecCle.length}</p>
              </div>
              <div className="rounded-[22px] border border-white/80 bg-white/85 p-4 shadow-[0_16px_34px_-30px_rgba(15,45,71,0.4)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Portail PRS</p>
                <p className="mt-2 text-2xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>{organismesPRS}</p>
              </div>
              <div className="rounded-[22px] border border-white/80 bg-white/85 p-4 shadow-[0_16px_34px_-30px_rgba(15,45,71,0.4)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Sécurité</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">Authentification par clé</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-[24px] border border-white/80 bg-white/88 p-5 shadow-[0_18px_36px_-30px_rgba(15,45,71,0.35)]">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-2xl p-2" style={{ backgroundColor: `${branding.primaryColor}12` }}>
                  <Shield className="h-5 w-5" style={{ color: branding.primaryColor }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Accès plus sobre et plus direct</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Un écran recentré sur la clé d’accès, la sécurité et les raccourcis utiles pour les organismes.
                  </p>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2">
              <Shield className="h-4 w-4" style={{ color: branding.primaryColor }} />
              <p className="text-xs text-slate-600">{branding.systemName}</p>
            </div>
        </div>
        </div>
      }
      rightPanel={
        <div className="space-y-5">
          <div className="rounded-[28px] border border-slate-200 bg-white/96 p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.18)] sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Connexion sécurisée</p>
                  <h2 className="mt-1 text-[1.55rem] font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('organismPortal.login')}
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                    Entrez la clé de votre organisme pour accéder au portail privé et consulter vos commandes.
                  </p>
                </div>

                <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 sm:flex">
                  <Lock className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="claveAcceso" className="text-sm font-semibold text-slate-800">
                      {t('organismPortal.accessKey')} *
                    </Label>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Format sécurisé
                    </span>
                  </div>

                  <div className="relative">
                    <Input
                      ref={claveAccesoInputRef}
                      id="claveAcceso"
                      type={mostrarClave ? 'text' : 'password'}
                      placeholder={t('organismPortal.accessKeyPlaceholder')}
                      value={claveAcceso}
                      onChange={(e) => setClaveAcceso(normalizarClaveAcceso(e.target.value))}
                      onKeyPress={handleKeyPress}
                      className="h-12 rounded-2xl border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.92)_100%)] pr-11 font-mono text-[1rem] tracking-[0.18em] uppercase shadow-[0_14px_28px_-24px_rgba(15,23,42,0.4)]"
                      maxLength={24}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarClave(!mostrarClave)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      aria-label={mostrarClave ? t('organismPortal.hideKey') : t('organismPortal.showKey')}
                    >
                      {mostrarClave ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  <p className="text-xs text-slate-500">{t('organismPortal.accessKeyFormat')}</p>
                </div>

                <div
                  className="rounded-[22px] border p-4"
                  style={{
                    backgroundColor: `${branding.primaryColor}08`,
                    borderColor: `${branding.primaryColor}24`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl p-2" style={{ backgroundColor: `${branding.primaryColor}12` }}>
                      <Key className="h-4 w-4" style={{ color: branding.primaryColor }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{t('organismPortal.noAccessKey')}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{t('organismPortal.contactInfo')}</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleAcceder}
                  disabled={normalizarClaveAcceso(claveAcceso).length < 6}
                  className="h-12 w-full rounded-2xl text-white shadow-[0_18px_34px_-24px_rgba(15,23,42,0.45)] disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    fontSize: '1rem',
                    fontFamily: 'Montserrat, sans-serif',
                    background: normalizarClaveAcceso(claveAcceso).length >= 6
                      ? `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`
                      : '#cbd5e1',
                  }}
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  {t('organismPortal.accessButton')}
                </Button>

                {organismesAvecCle.length > 0 && (
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {t('organismPortal.testKeys')}
                      </p>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                        {organismesAvecCle.length} disponibles
                      </span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {organismesAvecCle.map((organisme) => (
                        <button
                          key={organisme.id}
                          onClick={() => setClaveAcceso(organisme.claveAcceso || '')}
                          className="rounded-[18px] border border-slate-200 bg-white px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_26px_-24px_rgba(15,23,42,0.4)]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-semibold tracking-[0.16em] text-slate-700">{organisme.claveAcceso}</span>
                            {organisme.participaPRS && (
                              <span
                                className="whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                                style={{
                                  backgroundColor: branding.secondaryColor,
                                  fontFamily: 'Montserrat, sans-serif',
                                }}
                              >
                                PRS
                              </span>
                            )}
                          </div>
                          <p className="mt-2 truncate text-xs text-slate-500">{organisme.nombre}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
          </div>

          <div className="flex justify-center lg:hidden">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2">
              <Shield className="h-4 w-4" style={{ color: branding.primaryColor }} />
              <p className="text-xs text-slate-600">{branding.systemName}</p>
            </div>
          </div>
        </div>
      }
    />
  );
}