import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Key, Lock, Eye, EyeOff, LogIn, Shield, Sparkles, ShieldCheck, Building2, Home } from 'lucide-react';
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
import { PERMISOS, tienePermiso } from '../../utils/permisos';

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
  const mostrarRetornoMenuPrincipal = tienePermiso(PERMISOS.DESARROLLADOR);

  const handleVolverMenuPrincipal = () => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('page', 'dashboard');
    window.location.href = url.toString();
  };

  useEffect(() => {
    const recargarOrganismos = () => {
      const organismosActualizados = obtenerOrganismos().map(normalizarOrganismoPortal);

      setOrganismosDisponibles(organismosActualizados);
      setOrganismoAutenticado((organismoActual) => {
        if (!organismoActual) {
          return organismoActual;
        }

        return organismosActualizados.find((organismo) => organismo.id === organismoActual.id) || null;
      });
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
        mostrarBotonMenuPrincipalDesarrollador={mostrarRetornoMenuPrincipal}
        onVolverMenuPrincipal={handleVolverMenuPrincipal}
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
            <div className="relative overflow-hidden rounded-[30px] border border-white/90 bg-white/94 p-6 shadow-[0_28px_64px_-40px_rgba(15,45,71,0.36)]">
                <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                <div className="pointer-events-none absolute -right-12 top-[-3rem] h-28 w-28 rounded-full blur-3xl" style={{ backgroundColor: `${branding.secondaryColor}1f` }} />
                <p
                  className="text-[2.1rem] font-bold leading-none tracking-tight"
                  style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                >
                  {branding.systemName}
                </p>
                <p className="mt-4 text-[1.08rem] font-semibold text-slate-700">{t('common.systemManagementSubtitle')}</p>
                {systemAddress && <p className="mt-3 text-[1.02rem] text-slate-500">{systemAddress}</p>}
                {systemPhone && <p className="mt-1 text-[1.02rem] text-slate-500">{systemPhone}</p>}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/82 px-3 py-1 shadow-sm">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: branding.secondaryColor }} />
                {t('organismPortal.portalLabel')}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/75 bg-white/68 px-3 py-1 text-[10px] text-slate-400">
                <Sparkles className="h-3.5 w-3.5" style={{ color: branding.primaryColor }} />
                {t('experience.executiveCadence')}
              </div>
            </div>
            <h1
              className="mt-2 text-[1.9rem] font-bold tracking-tight text-slate-900"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {t('organismPortal.title')}
            </h1>

            <p className="mt-4 max-w-xl text-[1rem] leading-7 text-slate-600">
              {t('organismPortal.subtitle')}
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 shadow-sm">
              <ShieldCheck className="h-4 w-4" style={{ color: branding.primaryColor }} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{t('organismPortal.secureControlledAccess')}</p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="relative overflow-hidden rounded-[24px] border border-white/82 bg-white/88 p-4 shadow-[0_20px_40px_-32px_rgba(15,45,71,0.4)]">
                <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)` }} />
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{t('organismPortal.activeAccesses')}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>{organismesAvecCle.length}</p>
                <p className="mt-2 text-xs text-slate-500">{t('organismPortal.activeAccessesDescription')}</p>
              </div>
              <div className="relative overflow-hidden rounded-[24px] border border-white/82 bg-white/88 p-4 shadow-[0_20px_40px_-32px_rgba(15,45,71,0.4)]">
                <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${branding.secondaryColor} 0%, ${branding.primaryColor} 100%)` }} />
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{t('organismPortal.prsPortalLabel')}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>{organismesPRS}</p>
                <p className="mt-2 text-xs text-slate-500">{t('organismPortal.prsPortalDescription')}</p>
              </div>
              <div className="relative overflow-hidden rounded-[24px] border border-white/82 bg-white/88 p-4 shadow-[0_20px_40px_-32px_rgba(15,45,71,0.4)]">
                <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${branding.primaryColor} 0%, ${branding.primaryColor}aa 100%)` }} />
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{t('organismPortal.securityLabel')}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{t('organismPortal.keyAuthentication')}</p>
                <p className="mt-2 text-xs text-slate-500">{t('organismPortal.securityDescription')}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-[26px] border border-white/82 bg-white/90 p-5 shadow-[0_22px_48px_-34px_rgba(15,45,71,0.34)]">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-2xl p-2" style={{ backgroundColor: `${branding.primaryColor}12` }}>
                  <Shield className="h-5 w-5" style={{ color: branding.primaryColor }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t('organismPortal.premiumEntryTitle')}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {t('organismPortal.premiumEntryDescription')}
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
          <div className="relative overflow-hidden rounded-[30px] border border-slate-200/90 bg-white/98 p-5 shadow-[0_28px_70px_-42px_rgba(15,23,42,0.2)] sm:p-6">
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <div className="pointer-events-none absolute -right-12 top-[-4rem] h-32 w-32 rounded-full blur-3xl" style={{ backgroundColor: `${branding.primaryColor}12` }} />
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    <Lock className="h-3.5 w-3.5" />
                    {t('organismPortal.secureLogin')}
                  </div>
                  <h2 className="mt-1 text-[1.55rem] font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('organismPortal.login')}
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                    {t('organismPortal.loginDescription')}
                  </p>
                </div>

                <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 sm:flex">
                  <Lock className="h-5 w-5" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2 rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.9)_100%)] p-4 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.12)]">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="claveAcceso" className="text-sm font-semibold text-slate-800">
                      {t('organismPortal.accessKey')} *
                    </Label>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      {t('organismPortal.secureFormat')}
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
                  className="rounded-[24px] border p-4 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.1)]"
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

                {mostrarRetornoMenuPrincipal && (
                  <Button
                    onClick={handleVolverMenuPrincipal}
                    variant="outline"
                    className="h-11 w-full rounded-2xl border-slate-200 bg-slate-50/92 text-slate-700 shadow-[0_16px_30px_-28px_rgba(15,23,42,0.26)] hover:bg-slate-100"
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 500,
                    }}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Volver al menú principal
                  </Button>
                )}

                {organismesAvecCle.length > 0 && (
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50/85 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {t('organismPortal.testKeys')}
                      </p>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                        {t('organismPortal.availableCount', { count: organismesAvecCle.length })}
                      </span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {organismesAvecCle.map((organisme) => (
                        <button
                          key={organisme.id}
                          onClick={() => setClaveAcceso(organisme.claveAcceso || '')}
                          className="relative overflow-hidden rounded-[20px] border border-slate-200 bg-white px-3 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_32px_-24px_rgba(15,23,42,0.4)]"
                        >
                          <div className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)` }} />
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
                          <div className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                            <Building2 className="h-3.5 w-3.5" />
                            {t('organismPortal.quickSelection')}
                          </div>
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