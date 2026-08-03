import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../../hooks/useBranding';
import { Lock, User, LogIn, AlertCircle, Sparkles, Clock, Shield } from 'lucide-react';
import { LanguageSelector } from '../LanguageSelector';
import { PWAFloatingButton } from '../PWAInstallButton';
import { AdaptiveBrandLogo } from '../shared/AdaptiveBrandLogo';
import { AccessExperienceShell } from '../shared/AccessExperienceShell';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/AuthContext';
import { inicializarUsuarios } from '../../utils/usuarios';
import { isSupabaseAuthEnabled } from '../../utils/supabaseClient';

interface LoginProps {
  onLogin: (page?: string) => void;
  onAccessPublic?: (page: string) => void;
}

export function Login({ onLogin, onAccessPublic }: LoginProps) {
  const { t } = useTranslation();
  const branding = useBranding();
  const { login } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [recordarme, setRecordarme] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [postLoginPage, setPostLoginPage] = useState<'dashboard' | 'recrutement'>('dashboard');
  const authRemotaActiva = isSupabaseAuthEnabled();
  const brandInitials = branding.systemName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(fragment => fragment.charAt(0).toUpperCase())
    .join('') || 'BA';

  // Inicializar usuarios al montar el componente
  React.useEffect(() => {
    inicializarUsuarios();
  }, []);

  const handleDeveloperAccess = () => {
    setUsuario('David');
    setContrasena('Lettycia26');
    toast.success('🔧 Accès Développeur', { 
      description: 'Identifiants développeur chargés',
      duration: 2500,
      icon: '👨‍💻'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    // Validación simple
    if (!usuario || !contrasena) {
    setError(`Veuillez entrer ${authRemotaActiva ? 'un nom d\'utilisateur ou email' : 'un nom d\'utilisateur'} et un mot de passe`);
      toast.error('Champs requis');
      setIsLoading(false);
      return;
    }

    // Simular un petit délai pour animation
    await new Promise(resolve => setTimeout(resolve, 800));

    // Login usando el contexto de autenticación JWT
    const exito = await login(usuario, contrasena, recordarme);
    
    if (!exito) {
      setError('Nom d\'utilisateur ou mot de passe incorrect');
      toast.error('❌ Authentification échouée', {
        description: 'Vérifiez vos identifiants et réessayez'
      });
      setIsLoading(false);
      return;
    }

    // Login exitoso con JWT
    toast.success(`✅ Bienvenue ${usuario}!`, {
      description: '🔐 Connexion sécurisée par JWT',
      duration: 3000,
      icon: <Shield className="text-green-600" />
    });
    
    setTimeout(() => {
      onLogin(postLoginPage);
    }, 500);
  };

  return (
    <>
      <AccessExperienceShell
        branding={branding}
        topRight={<LanguageSelector />}
        leftPanel={
          <div className="flex h-full flex-col justify-between gap-6">
            <div>
              <div className="relative mb-6 overflow-hidden rounded-[30px] border border-white/90 bg-white/94 p-6 shadow-[0_28px_64px_-40px_rgba(15,45,71,0.36)]">
                <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />
                <div className="pointer-events-none absolute -right-12 top-[-3rem] h-28 w-28 rounded-full blur-3xl" style={{ backgroundColor: `${branding.secondaryColor}20` }} />
                <div className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <Lock className="h-3.5 w-3.5" />
                  {t('login.authenticationLabel')}
                </div>
                <div className="relative inline-block mb-5">
                  {branding.logo ? (
                    <AdaptiveBrandLogo
                      src={branding.logo}
                      alt="Logo"
                      wrapperClassName="h-24 w-24"
                      glowColor={branding.primaryColor}
                      glowClassName="blur-2xl opacity-30 animate-pulse"
                      containerClassName="cursor-default transition-all duration-300 border-4 bg-white shadow-2xl"
                      containerStyle={{ borderColor: branding.primaryColor }}
                      imageStyle={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1) inset' }}
                      onClick={handleDeveloperAccess}
                    />
                  ) : (
                    <>
                      <div 
                        className="absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse"
                        style={{ backgroundColor: branding.primaryColor }}
                      />
                      <div 
                        onClick={handleDeveloperAccess}
                        className="relative h-24 w-24 rounded-full flex items-center justify-center overflow-hidden shadow-2xl border-4 bg-white cursor-default transition-all duration-300"
                        style={{ borderColor: branding.primaryColor }}
                        title=""
                      >
                        <div 
                          className="h-full w-full flex items-center justify-center text-white"
                          style={{ backgroundColor: branding.primaryColor }}
                        >
                          <span className="text-3xl sm:text-4xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {brandInitials}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <h1 
                  className="font-bold text-2xl sm:text-3xl mb-3 tracking-tight" 
                  style={{ 
                    fontFamily: 'Montserrat, sans-serif',
                    color: branding.primaryColor,
                  }}
                >
                  {branding.systemName}
                </h1>
                <p className="text-base sm:text-lg text-gray-700 font-light leading-7" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  {t('login.welcome')}
                </p>
                {branding.address && <p className="mt-4 text-sm text-slate-500">{branding.address}</p>}
                {branding.phone && <p className="mt-1 text-sm text-slate-500">{branding.phone}</p>}

                <div className="mt-5 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/82 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-sm">
                    <Sparkles className="h-3.5 w-3.5" style={{ color: branding.primaryColor }} />
                    {t('experience.executiveCadence')}
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/82 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-sm">
                    <Shield className="h-3.5 w-3.5" style={{ color: branding.secondaryColor }} />
                    {t('login.priorityAccess')}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="relative overflow-hidden rounded-[24px] border border-white/82 bg-white/88 p-4 shadow-[0_20px_40px_-32px_rgba(15,45,71,0.3)]">
                  <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)` }} />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{t('login.securityLabel')}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">JWT</p>
                  <p className="mt-1 text-xs text-slate-500">{t('login.securityDescription')}</p>
                </div>
                <div className="relative overflow-hidden rounded-[24px] border border-white/82 bg-white/88 p-4 shadow-[0_20px_40px_-32px_rgba(15,45,71,0.3)]">
                  <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${branding.secondaryColor} 0%, ${branding.primaryColor} 100%)` }} />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{t('login.portalLabel')}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{t('nav.organisms')}</p>
                  <p className="mt-1 text-xs text-slate-500">{t('login.portalDescription')}</p>
                </div>
                <div className="relative overflow-hidden rounded-[24px] border border-white/82 bg-white/88 p-4 shadow-[0_20px_40px_-32px_rgba(15,45,71,0.3)]">
                  <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${branding.primaryColor} 0%, ${branding.primaryColor}aa 100%)` }} />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{t('login.appLabel')}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{t('experience.responsive')}</p>
                  <p className="mt-1 text-xs text-slate-500">{t('login.appDescription')}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-white/82 bg-white/90 p-5 shadow-[0_22px_48px_-34px_rgba(15,45,71,0.34)]">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-2xl p-2" style={{ backgroundColor: `${branding.primaryColor}12` }}>
                  <Shield className="h-5 w-5" style={{ color: branding.primaryColor }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t('login.unifiedDesignTitle')}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {t('login.unifiedDesignDescription')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
        rightPanel={
          <div className="space-y-5">
            <div className="rounded-[28px] border border-slate-200/90 bg-white/96 p-5 shadow-[0_24px_58px_-38px_rgba(15,23,42,0.16)] sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                    <Sparkles className="h-3.5 w-3.5" style={{ color: branding.primaryColor }} />
                    {t('login.internalConnectionLabel')}
                  </div>
                  <h2 
                    className="mt-2 font-bold text-xl sm:text-[1.7rem] text-left" 
                    style={{ 
                      fontFamily: 'Montserrat, sans-serif',
                      color: '#333333' 
                    }}
                  >
                    {t('login.signIn')}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {t('login.internalConnectionDescription')}
                  </p>
                </div>

                <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 sm:flex">
                  <Lock className="h-5 w-5" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2 rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.9)_100%)] p-4 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.12)]">
                  <label 
                    htmlFor="usuario" 
                    className="block text-sm font-semibold"
                    style={{ 
                      fontFamily: 'Montserrat, sans-serif',
                      color: '#333333' 
                    }}
                  >
                    {authRemotaActiva ? 'Nom d\'utilisateur ou email' : t('login.username')}
                  </label>
                  <div className="relative group">
                    <div 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                      style={{ color: usuario ? branding.primaryColor : '#9CA3AF' }}
                    >
                      <User size={20} />
                    </div>
                    <Input
                      id="usuario"
                      type="text"
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      style={{ 
                        borderColor: usuario ? branding.primaryColor : undefined,
                      }}
                      placeholder={authRemotaActiva ? 'Nom d\'utilisateur ou email' : t('login.usernamePlaceholder')}
                    />
                  </div>
                </div>

                <div className="space-y-2 rounded-[24px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.9)_100%)] p-4 shadow-[0_18px_34px_-28px_rgba(15,23,42,0.12)]">
                  <label 
                    htmlFor="contrasena" 
                    className="block text-sm font-semibold"
                    style={{ 
                      fontFamily: 'Montserrat, sans-serif',
                      color: '#333333' 
                    }}
                  >
                    {t('login.password')}
                  </label>
                  <div className="relative group">
                    <div 
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                      style={{ color: contrasena ? branding.primaryColor : '#9CA3AF' }}
                    >
                      <Lock size={20} />
                    </div>
                    <Input
                      id="contrasena"
                      type="password"
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                      style={{ 
                        borderColor: contrasena ? branding.primaryColor : undefined,
                      }}
                      placeholder={t('login.passwordPlaceholder')}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={recordarme}
                        onChange={(e) => setRecordarme(e.target.checked)}
                        className="w-5 h-5 rounded-md cursor-pointer transition-all"
                        style={{ accentColor: branding.primaryColor }}
                      />
                    </div>
                    <span 
                      className="ml-2 text-sm font-medium transition-colors"
                      style={{ color: '#333333' }}
                    >
                      {t('login.rememberMe')}
                    </span>
                  </label>
                  <a 
                    href="#" 
                    className="text-sm font-semibold hover:underline transition-all"
                    style={{ color: branding.primaryColor }}
                  >
                    {t('login.forgotPassword')}
                  </a>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="w-full text-white font-bold py-3.5 text-base transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-6"
                  style={{ 
                    background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`,
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t('common.loading')}</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={20} />
                      {t('login.signIn')}
                    </>
                  )}
                </Button>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-xl animate-fadeIn">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {error}
                    </p>
                  </div>
                )}
              </form>
            </div>

        {/* Botón de acceso público a Feuilles de Temps */}
        {onAccessPublic && (
          <div className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => {
                setPostLoginPage('recrutement');
                toast.info('Connectez-vous pour ouvrir la feuille de temps avec votre utilisateur');
              }}
              className="mb-3 w-full rounded-[24px] border border-slate-200 bg-white/70 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/85 hover:shadow-xl"
              style={{ boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.08)' }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg shadow-md transition-transform duration-300"
                    style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)` }}
                  >
                    <User size={22} className="text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="mb-0.5 text-base font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {t('login.internalTimesheetTitle') || 'Feuille de temps avec utilisateur'}
                    </h3>
                    <p className="text-xs font-medium text-gray-600" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {t('login.internalTimesheetDescription') || 'Ouvrir la feuille de temps après connexion'}
                    </p>
                  </div>
                </div>
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300"
                  style={{ backgroundColor: `${branding.primaryColor}15` }}
                >
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" style={{ color: branding.primaryColor }}>
                    <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </button>
            <button
              onClick={() => onAccessPublic('recrutement-public')}
              className="w-full backdrop-blur-xl bg-gradient-to-r from-white/70 to-white/50 rounded-[24px] shadow-lg p-4 border border-white/60 group hover:shadow-xl hover:from-white/80 hover:to-white/60 transition-all duration-300 transform hover:-translate-y-1"
              style={{
                boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.08)',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Icono */}
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300"
                    style={{ 
                      background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}DD 100%)` 
                    }}
                  >
                    <Clock size={22} className="text-white" />
                  </div>
                  
                  {/* Texto */}
                  <div className="text-left">
                    <h3 
                      className="font-bold text-base sm:text-lg mb-0.5" 
                      style={{ 
                        fontFamily: 'Montserrat, sans-serif',
                        color: '#333333' 
                      }}
                    >
                      {t('login.volunteerAccessTitle')}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      {t('login.volunteerAccessDescription')}
                    </p>
                  </div>
                </div>

                {/* Flecha */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300"
                  style={{ backgroundColor: `${branding.secondaryColor}15` }}
                >
                  <svg 
                    width="18" 
                    height="18" 
                    viewBox="0 0 16 16" 
                    fill="none"
                    style={{ color: branding.secondaryColor }}
                  >
                    <path 
                      d="M6 12L10 8L6 4" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              
              {/* Badge decorativo */}
              <div className="mt-3 flex justify-center">
                <div 
                  className="px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5"
                  style={{ 
                    backgroundColor: `${branding.secondaryColor}15`,
                    color: branding.secondaryColor,
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  <Sparkles size={11} />
                  {t('login.forVolunteers')}
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Pied de page */}
        <div className="text-center pt-1 text-sm text-gray-600">
          <p className="font-light">
            © 2024 {branding.systemName}. {t('login.allRightsReserved') || 'Todos los derechos reservados'}
          </p>
        </div>
          </div>
        }
      />

      {/* Botón flotante de instalación PWA */}
      <PWAFloatingButton />
    </>
  );
}