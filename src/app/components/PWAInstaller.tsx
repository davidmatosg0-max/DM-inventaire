import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Download, X, RefreshCw, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstaller() {
  const { t } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Detectar si es iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Verificar si ya está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      // Verificar si estamos en un entorno seguro (HTTPS o localhost)
      const isSecureContext = window.isSecureContext;
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      if (isSecureContext || isLocalhost) {
        // Verificar que el archivo sw.js existe antes de registrar
        fetch('/sw.js', { method: 'HEAD' })
          .then((response) => {
            if (response.ok && response.headers.get('content-type')?.includes('javascript')) {
              // El archivo existe y tiene el MIME type correcto, registrar SW
              return navigator.serviceWorker.register('/sw.js', { scope: '/' });
            } else {
              console.log('[PWA] Service Worker no disponible (archivo no encontrado o MIME incorrecto)');
              return null;
            }
          })
          .then((registration) => {
            if (registration) {
              console.log('[PWA] Service Worker registrado:', registration.scope);
              
              // Verificar actualizaciones
              registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                  newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                      toast.success(t('pwa.updateAvailable'), {
                        description: t('pwa.updateDescription'),
                        action: {
                          label: t('pwa.reload'),
                          onClick: () => window.location.reload()
                        },
                        duration: 10000
                      });
                    }
                  });
                }
              });
            }
          })
          .catch((error) => {
            // Error silencioso - PWA no es crítica para el funcionamiento de la app
            console.log('[PWA] Service Worker no disponible en este entorno:', error.message);
          });
      } else {
        console.log('[PWA] Entorno no seguro - Service Worker no disponible');
      }
    }

    // Escuchar evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Mostrar banner después de 3 segundos si no está instalado
      setTimeout(() => {
        const hideInstallBanner = localStorage.getItem('hideInstallBanner');
        if (!hideInstallBanner) {
          setShowInstallBanner(true);
        }
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detectar cuando se instala la app
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App instalada');
      setIsInstalled(true);
      setShowInstallBanner(false);
      toast.success(t('pwa.installed'));
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [t]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSInstructions(true);
      }
      return;
    }

    // Mostrar prompt de instalación
    deferredPrompt.prompt();

    // Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('[PWA] Usuario aceptó la instalación');
      toast.success(t('pwa.installing'));
    } else {
      console.log('[PWA] Usuario rechazó la instalación');
    }

    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    localStorage.setItem('hideInstallBanner', 'true');
  };

  if (isInstalled) {
    return null;
  }

  // Banner de instalación
  if (showInstallBanner && !isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-[#1a4d7a] to-[#2d9561] text-white rounded-lg shadow-2xl p-4 z-50 animate-in slide-in-from-bottom-5">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
          aria-label={t('common.close')}
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-start gap-3 pr-6">
          <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
            <Download className="h-6 w-6" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{t('pwa.installTitle')}</h3>
            <p className="text-white/90 text-sm mb-3">{t('pwa.installDescription')}</p>
            
            <div className="flex gap-2">
              <Button
                onClick={handleInstallClick}
                size="sm"
                className="bg-white text-[#1a4d7a] hover:bg-white/90"
              >
                <Download className="h-4 w-4 mr-2" />
                {t('pwa.install')}
              </Button>
              
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/10"
              >
                {t('pwa.later')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Instrucciones para iOS
  if (showIOSInstructions) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-4">
        <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom-5">
          <button
            onClick={() => setShowIOSInstructions(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={t('common.close')}
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-br from-[#1a4d7a] to-[#2d9561] rounded-xl p-3">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-xl text-gray-900">{t('pwa.iosInstallTitle')}</h3>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p className="font-medium">{t('pwa.iosInstallSteps')}</p>
            
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#1a4d7a] text-white text-xs font-bold">1</span>
                <span>{t('pwa.iosStep1')}</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#1a4d7a] text-white text-xs font-bold">2</span>
                <span>{t('pwa.iosStep2')}</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-[#1a4d7a] text-white text-xs font-bold">3</span>
                <span>{t('pwa.iosStep3')}</span>
              </li>
            </ol>
          </div>
          
          <Button
            onClick={() => setShowIOSInstructions(false)}
            className="w-full mt-6 bg-gradient-to-r from-[#1a4d7a] to-[#2d9561] hover:opacity-90"
          >
            {t('common.close')}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}