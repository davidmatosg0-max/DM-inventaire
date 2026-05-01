import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { APP_VERSION, getLatestVersion, compareVersions } from '../app/version';

const VERSION_STORAGE_KEY = 'banco_alimentos_app_version';
const VERSION_DISMISSED_KEY = 'banco_alimentos_version_dismissed';

export function useVersionCheck() {
  const { t, i18n } = useTranslation();
  const [hasNewVersion, setHasNewVersion] = useState(false);

  useEffect(() => {
    checkVersion();
  }, []);

  const checkVersion = () => {
    try {
      const storedVersion = localStorage.getItem(VERSION_STORAGE_KEY);
      const dismissedVersion = localStorage.getItem(VERSION_DISMISSED_KEY);
      const currentVersion = APP_VERSION.version;

      // Si no hay versión almacenada, es la primera vez que se abre la app
      if (!storedVersion) {
        localStorage.setItem(VERSION_STORAGE_KEY, currentVersion);
        return;
      }

      // Verificar si hay una nueva versión
      if (compareVersions(currentVersion, storedVersion) > 0) {
        setHasNewVersion(true);
        
        // Si esta versión ya fue vista/descartada, no mostrar notificación
        if (dismissedVersion === currentVersion) {
          localStorage.setItem(VERSION_STORAGE_KEY, currentVersion);
          return;
        }

        // Mostrar notificación de nueva versión
        showVersionUpdateNotification(currentVersion, storedVersion);
        
        // Actualizar la versión almacenada
        localStorage.setItem(VERSION_STORAGE_KEY, currentVersion);
      }
    } catch (error) {
      console.error('Error al verificar versión:', error);
    }
  };

  const showVersionUpdateNotification = (newVersion: string, oldVersion: string) => {
    const latestRelease = getLatestVersion();
    if (!latestRelease) return;

    // Obtener el idioma actual
    const currentLang = i18n.language as 'fr' | 'es' | 'en' | 'ar';
    const lang = ['fr', 'es', 'en', 'ar'].includes(currentLang) ? currentLang : 'fr';

    const title = latestRelease.title[lang] || latestRelease.title.fr;
    const description = latestRelease.description[lang] || latestRelease.description.fr;

    // Crear el mensaje de cambios
    const changesText = latestRelease.changes
      .map(change => {
        const icon = getChangeIcon(change.type);
        return `${icon} ${change.description[lang] || change.description.fr}`;
      })
      .join('\n');

    // Mostrar notificación especial para actualizaciones
    const notificationMessage = `
🎉 ${title}

📦 Version ${oldVersion} → ${newVersion}
📅 ${latestRelease.date}

${description}

${changesText}
    `.trim();

    // Determinar el tipo de notificación según la criticidad
    if (latestRelease.critical) {
      toast.error(`🚨 ${t('organisms.version.notification.criticalUpdate')} ${newVersion}`, {
        description: notificationMessage,
        duration: 15000,
        position: 'top-center',
        style: {
          background: '#FFF3E0',
          border: '2px solid #DC3545',
          color: '#333',
          maxWidth: '600px',
          fontSize: '14px',
          whiteSpace: 'pre-line'
        },
        action: {
          label: t('organisms.version.notification.viewDetails'),
          onClick: () => {
            // Aquí podrías abrir un modal con más detalles
            console.log('Ver detalles de la actualización');
          }
        }
      });
    } else if (latestRelease.breaking) {
      toast.warning(`⚠️ ${t('organisms.version.notification.importantUpdate')} ${newVersion}`, {
        description: notificationMessage,
        duration: 12000,
        position: 'top-center',
        style: {
          background: '#FFF9E6',
          border: '2px solid #FFC107',
          color: '#333',
          maxWidth: '600px',
          fontSize: '14px',
          whiteSpace: 'pre-line'
        },
        action: {
          label: t('organisms.version.notification.understood'),
          onClick: () => {
            localStorage.setItem(VERSION_DISMISSED_KEY, newVersion);
          }
        }
      });
    } else {
      toast.success(`✨ ${t('organisms.version.notification.newVersion')} ${newVersion}`, {
        description: notificationMessage,
        duration: 10000,
        position: 'top-center',
        style: {
          background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
          border: '2px solid #4CAF50',
          color: '#1B5E20',
          maxWidth: '600px',
          fontSize: '14px',
          whiteSpace: 'pre-line',
          boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)'
        },
        action: {
          label: `👍 ${t('organisms.version.notification.ok')}`,
          onClick: () => {
            localStorage.setItem(VERSION_DISMISSED_KEY, newVersion);
          }
        }
      });
    }
  };

  const getChangeIcon = (type: 'feature' | 'improvement' | 'bugfix' | 'security'): string => {
    const icons = {
      feature: '🆕',
      improvement: '⚡',
      bugfix: '🔧',
      security: '🔒'
    };
    return icons[type] || '•';
  };

  return {
    hasNewVersion,
    currentVersion: APP_VERSION.version,
    checkVersion
  };
}