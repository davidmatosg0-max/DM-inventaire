import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../../hooks/useBranding';
import { Lock, User, LogIn, AlertCircle, Sparkles, Clock, Shield } from 'lucide-react';
import { LanguageSelector } from '../LanguageSelector';
import { PWAFloatingButton } from '../PWAInstallButton';
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/AuthContext';
import { inicializarUsuarios } from '../../utils/usuarios';

interface LoginProps {
  onLogin: () => void;
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
      setError('Veuillez entrer un nom d\'utilisateur et un mot de passe');
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
      onLogin();
    }, 500);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative p-4 overflow-hidden"
      style={{ 
        fontFamily: 'Roboto, sans-serif',
        background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 100%)`,
      }}
    >
      {/* Formas décoratives de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: branding.primaryColor }}
        />
        <div 
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ backgroundColor: branding.secondaryColor }}
        />
      </div>

      {/* Selector de idioma en la esquina supérieure droite */}
      <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-20">
        <LanguageSelector />
      </div>

      {/* Conteneur du formulaire */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo et titre avec animation */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="relative inline-block mb-6">
            {/* Effet de lumière derrière le logo */}
            <div 
              className="absolute inset-0 rounded-full blur-2xl opacity-30 animate-pulse"
              style={{ backgroundColor: branding.primaryColor }}
            />
            <div 
              onClick={handleDeveloperAccess}
              className="relative h-28 w-28 sm:h-32 sm:w-32 mx-auto rounded-full flex items-center justify-center overflow-hidden shadow-2xl border-4 bg-white cursor-default transition-all duration-300"
              style={{ borderColor: branding.primaryColor }}
              title=""
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
                  <span className="text-4xl sm:text-5xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    BA
                  </span>
                </div>
              )}
            </div>
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
          <p className="text-base sm:text-lg text-gray-700 font-light" style={{ fontFamily: 'Roboto, sans-serif' }}>
            {t('login.welcome')}
          </p>
        </div>

        {/* Carte de login avec glassmorphism */}
        <div 
          className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-2xl p-6 sm:p-8 border border-white/50"
          style={{
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles size={20} style={{ color: branding.primaryColor }} />
            <h2 
              className="font-bold text-xl sm:text-2xl text-center" 
              style={{ 
                fontFamily: 'Montserrat, sans-serif',
                color: '#333333' 
              }}
            >
              {t('login.signIn')}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Champ d'utilisateur */}
            <div className="space-y-2">
              <label 
                htmlFor="usuario" 
                className="block text-sm font-semibold"
                style={{ 
                  fontFamily: 'Montserrat, sans-serif',
                  color: '#333333' 
                }}
              >
                {t('login.username')}
              </label>
              <div className="relative group">
                <div 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200"
                  style={{ color: usuario ? branding.primaryColor : '#9CA3AF' }}
                >
                  <User size={20} />
                </div>
                <input
                  id="usuario"
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none transition-all duration-300 bg-white/50 backdrop-blur-sm"
                  style={{ 
                    borderColor: usuario ? branding.primaryColor : undefined,
                  }}
                  placeholder={t('login.usernamePlaceholder')}
                />
              </div>
            </div>

            {/* Champ de mot de passe */}
            <div className="space-y-2">
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
                <input
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

            {/* Recordarme et mot de passe oublié */}
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

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-bold py-3.5 text-base rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-6"
              style={{ 
                backgroundColor: branding.primaryColor,
                fontFamily: 'Montserrat, sans-serif',
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Chargement...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  {t('login.signIn')}
                </>
              )}
            </button>

            {/* Message d'erreur */}
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
          <div className="mt-6 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <button
              onClick={() => onAccessPublic('benevoles-public')}
              className="w-full backdrop-blur-xl bg-gradient-to-r from-white/70 to-white/50 rounded-xl shadow-lg p-4 border border-white/60 group hover:shadow-xl hover:from-white/80 hover:to-white/60 transition-all duration-300 transform hover:-translate-y-1"
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
                      Feuilles de Temps
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 font-medium" style={{ fontFamily: 'Roboto, sans-serif' }}>
                      Enregistrement rapide • Accès libre
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
                  Pour Bénévoles
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Pied de page */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p className="font-light">
            © 2024 {branding.systemName}. {t('login.allRightsReserved') || 'Todos los derechos reservados'}
          </p>
        </div>
      </div>

      {/* Botón flotante de instalación PWA */}
      <PWAFloatingButton />

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}