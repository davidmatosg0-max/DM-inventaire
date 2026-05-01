import { useState, useEffect } from 'react';

interface BrandingConfig {
  primaryColor: string;
  secondaryColor: string;
  successColor: string;
  dangerColor: string;
  warningColor: string;
  logo: string | null;
  systemName: string;
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
 * 🖼️ LOGO PREDETERMINADO:
 * -----------------------
 * Logo: "DMi - Gestion de banques alimentaires" 
 * Diseño 3D con:
 *   - "D" en turquesa/cyan (#4db8b8)
 *   - "M" en azul marino/gris oscuro (#5a6b7c)
 *   - Icono de lupa integrado en la "i"
 *   - Texto descriptivo: "Gestion de banques alimentaires"
 * Formato: PNG con transparencia, optimizado para relleno circular completo
 * Sistema: Banque Alimentaire
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
  logo: null,  // Se puede personalizar desde el módulo de Personalización
  systemName: 'Banque Alimentaire'
};

export function useBranding() {
  const [config, setConfig] = useState<BrandingConfig>(() => {
    // Inicializar con configuración predeterminada
    return DEFAULT_BRANDING;
  });

  useEffect(() => {
    // Cargar configuración guardada o inicializar con valores predeterminados
    const loadConfig = () => {
      const savedConfig = localStorage.getItem('brandingConfig_permanent');
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          
          // Si el logo guardado es null o está vacío, usar el logo por defecto
          // Si el logo es una cadena Base64 (comienza con "data:"), usarlo
          const finalLogo = parsed.logo && parsed.logo.startsWith('data:') 
            ? parsed.logo 
            : null;
          
          const finalConfig = {
            ...parsed,
            logo: finalLogo
          };
          
          setConfig(finalConfig);
          applyBranding(finalConfig);
          console.log('✅ Colores cargados desde localStorage (permanentes)', finalConfig);
        } catch (error) {
          console.error('Error loading branding config:', error);
          // Si hay error al cargar, guardar y usar configuración por defecto
          const defaultConfig = { ...DEFAULT_BRANDING, logo: null };
          const configToSave = { ...DEFAULT_BRANDING, logo: null }; // Guardar sin logo asset
          localStorage.setItem('brandingConfig_permanent', JSON.stringify(configToSave));
          setConfig(defaultConfig);
          applyBranding(defaultConfig);
          console.log('✅ Colores predeterminados guardados (permanentes)');
        }
      } else {
        // PRIMERA CARGA: Guardar automáticamente los colores predeterminados (sin logo asset)
        const configToSave = { ...DEFAULT_BRANDING, logo: null };
        localStorage.setItem('brandingConfig_permanent', JSON.stringify(configToSave));
        const defaultConfig = { ...DEFAULT_BRANDING, logo: null };
        setConfig(defaultConfig);
        applyBranding(defaultConfig);
        console.log('✅ Colores predeterminados inicializados y guardados permanentemente');
      }
    };

    loadConfig();

    // Escuchar cambios en la configuración
    const handleBrandingUpdate = (event: CustomEvent<BrandingConfig>) => {
      const updatedConfig = event.detail;
      
      // Si el logo es null o no es Base64, no guardarlo (se usará el predeterminado)
      // Si el logo es Base64, guardarlo
      const configToSave = {
        ...updatedConfig,
        logo: updatedConfig.logo && updatedConfig.logo.startsWith('data:') 
          ? updatedConfig.logo 
          : null
      };
      
      // Guardar cambios permanentemente
      localStorage.setItem('brandingConfig_permanent', JSON.stringify(configToSave));
      
      // Usar el logo predeterminado si no hay logo personalizado
      const finalConfig = {
        ...updatedConfig,
        logo: updatedConfig.logo || null
      };
      
      setConfig(finalConfig);
      applyBranding(finalConfig);
      console.log('✅ Configuración de branding actualizada y guardada permanentemente');
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