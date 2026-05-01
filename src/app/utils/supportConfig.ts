// Configuración de soporte y ayuda del sistema

export type SupportConfig = {
  chatAide: {
    enabled: boolean;
    type: 'email' | 'url' | 'phone';
    value: string;
    label?: string;
  };
  support: {
    enabled: boolean;
    type: 'email' | 'phone';
    email?: string;
    emailSecondaire?: string;
    phone?: string;
  };
  reportBug: {
    enabled: boolean;
    type: 'email' | 'url';
    value: string;
    emailSecondaire?: string;
    label?: string;
  };
};

const STORAGE_KEY = 'banque_alimentaire_support_config';

const defaultConfig: SupportConfig = {
  chatAide: {
    enabled: true,
    type: 'email',
    value: 'aide@banque-alimentaire.org',
    label: 'Chat d\'Aide'
  },
  support: {
    enabled: true,
    type: 'email',
    email: 'support@banque-alimentaire.org',
    emailSecondaire: 'support-technique@banque-alimentaire.org',
    phone: '+1 (514) 555-0100'
  },
  reportBug: {
    enabled: true,
    type: 'email',
    value: 'bugs@banque-alimentaire.org',
    emailSecondaire: 'problemes@banque-alimentaire.org',
    label: 'Signaler un Problème'
  }
};

// Inicializar configuración por defecto si no existe
export function inicializarConfigSupport(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultConfig));
      console.log('✅ Configuration de support initialisée avec succès');
    }
  } catch (error) {
    console.error('Error al inicializar configuración de soporte:', error);
  }
}

export function obtenerConfigSupport(): SupportConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const config = JSON.parse(stored);
      // Asegurar que todos los campos nuevos existan (para retrocompatibilidad)
      return {
        ...defaultConfig,
        ...config,
        support: {
          ...defaultConfig.support,
          ...config.support
        },
        reportBug: {
          ...defaultConfig.reportBug,
          ...config.reportBug
        }
      };
    }
  } catch (error) {
    console.error('Error al cargar configuración de soporte:', error);
  }
  // Si no existe, inicializar y devolver
  inicializarConfigSupport();
  return defaultConfig;
}

export function guardarConfigSupport(config: SupportConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    console.log('✅ Configuration de support enregistrée:', config);
    
    // Notificar a todos los componentes sobre el cambio
    // Usar dynamic import para evitar dependencias circulares
    import('./supportConfigSync').then(({ notifyConfigChange }) => {
      notifyConfigChange(config);
    });
  } catch (error) {
    console.error('Error al guardar configuración de soporte:', error);
  }
}

export function resetearConfigSupport(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultConfig));
    console.log('✅ Configuration de support réinitialisée');
    
    // Notificar a todos los componentes sobre el cambio
    import('./supportConfigSync').then(({ notifyConfigChange }) => {
      notifyConfigChange(defaultConfig);
    });
  } catch (error) {
    console.error('Error al resetear configuración de soporte:', error);
  }
}