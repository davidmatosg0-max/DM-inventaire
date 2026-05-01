import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Download, Smartphone, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { PWAIOSInstructions } from './PWAIOSInstructions';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallButtonProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
  onShowIOSInstructions?: () => void;
}

export function PWAInstallButton({ 
  variant = 'ghost', 
  size = 'icon',
  showText = false,
  onShowIOSInstructions
}: PWAInstallButtonProps) {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = React.useState(false);
  const [canInstall, setCanInstall] = React.useState(false);

  useEffect(() => {
    // Detectar si es iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Verificar si ya está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Escuchar evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Si es iOS, siempre permitir mostrar instrucciones
    if (iOS) {
      setCanInstall(true);
    }

    // Detectar cuando se instala la app
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setCanInstall(false);
      toast.success(t('pwa.installed'));
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [t, isIOS]);

  const handleInstallClick = async () => {
    if (isIOS) {
      // Mostrar instrucciones de iOS
      if (onShowIOSInstructions) {
        onShowIOSInstructions();
      } else {
        toast.info(t('pwa.iosInstallTitle'), {
          description: t('pwa.iosStep1'),
          duration: 5000
        });
      }
      return;
    }

    if (!deferredPrompt) {
      toast.info(t('pwa.installTitle'), {
        description: 'Use el menú del navegador para instalar',
        duration: 3000
      });
      return;
    }

    // Mostrar prompt de instalación
    deferredPrompt.prompt();

    // Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success(t('pwa.installing'));
    }

    setDeferredPrompt(null);
    setCanInstall(false);
  };

  // No mostrar el botón si ya está instalado
  if (isInstalled) {
    return showText ? (
      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
        <Check className="h-4 w-4" />
        <span className="text-sm">{t('pwa.installed')}</span>
      </div>
    ) : null;
  }

  // No mostrar si no se puede instalar (excepto en iOS)
  if (!canInstall && !isIOS) {
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      variant={variant}
      size={size}
      className="group relative"
      title={t('pwa.installTitle')}
    >
      {isIOS ? (
        <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
      ) : (
        <Download className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform" />
      )}
      {showText && (
        <span className="ml-2">{t('pwa.install')}</span>
      )}
      
      {/* Badge de notificación */}
      {canInstall && !showText && (
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      )}
    </Button>
  );
}

// Botón flotante visible para PWA
export function PWAFloatingButton() {
  const { t } = useTranslation();
  const [showIOSInstructions, setShowIOSInstructions] = React.useState(false);
  const [isInstalled, setIsInstalled] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = React.useState(false);

  React.useEffect(() => {
    // Detectar si es iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Verificar si ya está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      toast.success(t('pwa.installed'));
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [t]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) {
      toast.info(t('pwa.installTitle'), {
        description: 'Utilisez le menu de votre navigateur pour installer l\'application',
        duration: 4000
      });
      return;
    }

    // Mostrar prompt de instalación
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        toast.success(t('pwa.installing'));
      }
      
      setDeferredPrompt(null);
    } catch (error) {
      console.error('Error al instalar PWA:', error);
    }
  };

  // Solo ocultar si está instalado
  if (isInstalled) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40">
        <div className="relative group">
          {/* Efecto de brillo animado */}
          <div className="absolute -inset-2 bg-gradient-to-r from-[#1a4d7a] to-[#2d9561] rounded-2xl blur-lg opacity-60 group-hover:opacity-80 animate-pulse transition-opacity" />
          
          {/* Botón principal */}
          <button
            onClick={handleInstallClick}
            className="relative bg-gradient-to-r from-[#1a4d7a] to-[#2d9561] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-2xl hover:scale-105 transition-all flex items-center gap-2 sm:gap-3 font-semibold"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {isIOS ? (
              <Smartphone className="h-5 w-5 sm:h-6 sm:w-6" />
            ) : (
              <Download className="h-5 w-5 sm:h-6 sm:w-6" />
            )}
            <span className="text-sm sm:text-base">{t('pwa.install')}</span>
            
            {/* Badge de novedad */}
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full animate-bounce">
              Nouveau!
            </span>
          </button>
        </div>
      </div>
      
      {/* Modal de instrucciones iOS */}
      <PWAIOSInstructions isOpen={showIOSInstructions} onClose={() => setShowIOSInstructions(false)} />
    </>
  );
}