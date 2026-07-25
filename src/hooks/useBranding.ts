import { useState, useEffect } from 'react';
import defaultLogo from '../assets/logo-dmi.svg';

interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  successColor: string;
  dangerColor: string;
  warningColor: string;
  logo: string | null;
  systemName: string;
  phone: string;
  address: string;
}

/**
 * PALETA DE COLORES PREDETERMINADA DEL SISTEMA
 * ==============================================
 * 
 * Esta es la paleta oficial PERMANENTE del sistema "DMi - Gestion de banques alimentaires"
 * Definida como estándar para mantener coherencia visual en toda la aplicación.
 * 
 * ⚠️ CONFIGURACIÓN PERMANENTE:
 * ---------------------------
 * Estos colores se guardan automáticamente en localStorage y permanecen activos
 * incluso después de cerrar sesión. Solo pueden ser modificados explícitamente
 * por el usuario desde el módulo "Aide et Support > Personnalisation".
 * 
 * 🎨 COLORES PRINCIPALES:
 * ----------------------
 * • Color Primario:    #1a4d7a  (Azul marino profesional - coordina con logo DMi)
 * • Color Secundario:  #2d9561  (Verde elegante)
 * • Color de Éxito:    #2d9561  (Verde éxito - mismo que secundario)
 * • Color de Peligro:  #c23934  (Rojo elegante)
 * • Color de Alerta:   #e8a419  (Naranja/amarillo profesional)
 * 
 * 📋 USO RECOMENDADO:
 * ------------------
 * • Primario (#1a4d7a):   Headers, navegación, iconos principales, enlaces
 * • Secundario (#2d9561): Botones de acción, estados activos, barras de progreso
 * • Éxito (#2d9561):      Confirmaciones, estados completados, ofertas activas
 * • Peligro (#c23934):    Errores, eliminaciones, estados rechazados
 * • Alerta (#e8a419):     Advertencias, estados pendientes, notificaciones
 * 
 * 🖼️ LOGO PAR DEFAUT :
 * -----------------------
 * Logo : monogramme « DMi » (hexagone bleu institutionnel + lettres blanches
 * + point du "i" en dégradé vert-doré + barre solidaire verte/dorée).
 * Fichier : src/assets/logo-dmi.svg (SVG vectoriel, évolutif à toute taille).
 * Sistema : Banque Alimentaire.
 * Note : ce logo est chargé dynamiquement et n'est PAS sérialisé dans
 * localStorage (seuls les logos personnalisés en Base64 y sont stockés).
 * 
 * 💾 PERSISTENCIA:
 * ---------------
 * Los colores y el logo se guardan automáticamente en localStorage
 * con la clave 'brandingConfig_permanent' y permanecen activos
 * indefinidamente hasta que el usuario los modifique explícitamente.
 * 
 * Última actualización: Febrero 2026
 * Estos colores están sincronizados con todo el sistema incluyendo:
 * - Vista Pública de Organismos
 * - Panel de Comandas
 * - Módulo de Ofertas Especiales
 * - Todos los componentes UI
 */
const DEFAULT_BRANDING: BrandingConfig = {
  primaryColor: '#1a4d7a',      // Azul marino profesional (coordina con logo DMi)
  secondaryColor: '#2d9561',    // Verde elegante
  successColor: '#2d9561',      // Verde éxito
  dangerColor: '#c23934',       // Rojo elegante
  warningColor: '#e8a419',      // Naranja/amarillo profesional
  logo: defaultLogo,           // Monogramme DMi par defaut (peut etre remplace via PanelMarca)
  systemName: 'Banque Alimentaire',
  phone: '',
  address: ''
};

export function useBranding() {
  const [config, setConfig] = useState<BrandingConfig>(() => {
    // Inicializar con configuración predeterminada (logo DMi inclus)
    return DEFAULT_BRANDING;
  });

  useEffect(() => {
    // Cargar configuración guardada o inicializar con valores predeterminados
    const loadConfig = () => {
      const savedConfig = localStorage.getItem('brandingConfig_permanent');
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);

          // Si le logo sauvegarde est une chaine Base64 ("data:"), on l'utilise
          // (logo personnalise upload par l'utilisateur).
          // Sinon, on retombe sur le monogramme DMi par defaut.
          const finalLogo = parsed.logo && typeof parsed.logo === 'string' && parsed.logo.startsWith('data:')
            ? parsed.logo
            : defaultLogo;

          const finalConfig = {
            ...DEFAULT_BRANDING,
            ...parsed,
            logo: finalLogo
          };

          setConfig(finalConfig);
          applyBranding(finalConfig);
          console.log('✅ Configuration de marque chargée depuis localStorage', finalConfig);
        } catch (error) {
          console.error('Error loading branding config:', error);
          // En cas d'erreur, on retombe sur la config par defaut (avec logo DMi)
          const configToSave = { ...DEFAULT_BRANDING, logo: null }; // On ne stocke pas l'asset
          localStorage.setItem('brandingConfig_permanent', JSON.stringify(configToSave));
          setConfig(DEFAULT_BRANDING);
          applyBranding(DEFAULT_BRANDING);
          console.log('✅ Configuration par defaut restauree');
        }
      } else {
        // PREMIERE CHARGE : on sauvegarde la config par defaut (sans l'asset SVG)
        // Le logo DMi est resolu dynamiquement via l'import ES.
        const configToSave = { ...DEFAULT_BRANDING, logo: null };
        localStorage.setItem('brandingConfig_permanent', JSON.stringify(configToSave));
        setConfig(DEFAULT_BRANDING);
        applyBranding(DEFAULT_BRANDING);
        console.log('✅ Configuration par defaut initialisee (logo DMi actif)');
      }
    };

    loadConfig();

    // Ecouter les changements de configuration en direct (evenement custom)
    const handleBrandingUpdate = (event: CustomEvent<BrandingConfig>) => {
      const updatedConfig = {
        ...DEFAULT_BRANDING,
        ...event.detail,
      };

      // On ne sauvegarde que les logos personnalises (Base64) ; le logo DMi
      // par defaut reste un asset importe et n'est jamais stocke dans localStorage.
      const configToSave = {
        ...updatedConfig,
        logo: updatedConfig.logo && typeof updatedConfig.logo === 'string' && updatedConfig.logo.startsWith('data:')
          ? updatedConfig.logo
          : null
      };

      localStorage.setItem('brandingConfig_permanent', JSON.stringify(configToSave));

      // Pour l'etat React : si aucun logo personnalise, on retombe sur le monogramme DMi.
      const finalConfig = {
        ...updatedConfig,
        logo: updatedConfig.logo || defaultLogo
      };

      setConfig(finalConfig);
      applyBranding(finalConfig);
      console.log('✅ Configuration de marque mise a jour et sauvegardee');
    };

    window.addEventListener('brandingUpdated', handleBrandingUpdate as EventListener);

    return () => {
      window.removeEventListener('brandingUpdated', handleBrandingUpdate as EventListener);
    };
  }, []);

  const applyBranding = (brandingConfig: BrandingConfig) => {
    document.documentElement.style.setProperty('--color-primary', brandingConfig.primaryColor);
    document.documentElement.style.setProperty('--color-secondary', brandingConfig.secondaryColor);
    document.documentElement.style.setProperty('--color-success', brandingConfig.successColor);
    document.documentElement.style.setProperty('--color-danger', brandingConfig.dangerColor);
    document.documentElement.style.setProperty('--color-warning', brandingConfig.warningColor);
  };

  return config;
}