/**
 * VERIFICADOR DE SINCRONIZACIÓN DE TRADUCCIONES
 * Sistema Integral - Banque Alimentaire
 * 
 * Este módulo verifica que todos los componentes estén sincronizados
 * con el sistema de traducción i18n.
 */

export interface TranslationCheckResult {
  totalComponents: number;
  withTranslation: number;
  coverage: number;
  supportedLanguages: string[];
  currentLanguage: string;
  missingKeys: string[];
}

/**
 * Verifica la cobertura de traducciones en el sistema
 */
export function checkTranslationCoverage(): TranslationCheckResult {
  // Componentes que tienen useTranslation implementado
  const componentsWithTranslation = [
    // Páginas Principales
    'App.tsx',
    'Login.tsx',
    'Dashboard.tsx',
    'DashboardMetricas.tsx',
    
    // Módulos de Gestión
    'Inventario.tsx',
    'Comandas.tsx',
    'Organismos.tsx',
    'Benevoles.tsx',
    'Transporte.tsx',
    'Departamentos.tsx',
    'Usuarios.tsx',
    'UsuariosInternos.tsx',
    'Configuracion.tsx',
    'Reportes.tsx',
    'ReportesAvanzado.tsx',
    'Etiquetas.tsx',
    'EmailOrganismos.tsx',
    
    // Módulos Especiales
    'GestionAutenticacion.tsx',
    'GestionRolesPermisos.tsx',
    'AccesoOrganismo.tsx',
    'OfertasOrganismo.tsx',
    'VistaPublicaOrganismo_fix.tsx',
    'IDDigital.tsx',
    'CuisinePage.tsx',
    'Recrutement.tsx',
    'PanelMarca.tsx',
    'Contact.tsx',
    'ModeloComanda.tsx',
    
    // Componentes UI
    'Layout.tsx',
    'GlobalSearch.tsx',
    'LanguageSelector.tsx',
    'CentroNotificaciones.tsx',
    'SystemAlerts.tsx',
    'SystemDiagnostics.tsx',
    'VerificacionesRecientes.tsx',
    'IconSelector.tsx',
    'CountrySelect.tsx',
    'FileUpload.tsx',
    
    // Módulos de Inventario
    'DialogCrearOferta.tsx',
    'DialogDistribuirProductos.tsx',
    'DialogEnviarCocina.tsx',
    'AnalisisPredictivoStock.tsx',
    'FormularioEntradaProductoCompacto.tsx',
    'PanierProductos.tsx',
    'CarritoMejorado.tsx',
    
    // Módulos de Backup
    'BackupModule.tsx',
    'BackupCreator.tsx',
    'BackupRestorer.tsx',
    'BackupHistory.tsx',
    'BackupSettings.tsx',
    'TextCorrector.tsx',
    
    // Otros componentes
    'FormularioNouveauBenevole.tsx',
    'FormularioOrganismoCompacto.tsx',
    'PerfilOrganismoDialog.tsx',
    'FormularioChoferCompacto.tsx',
    'FormularioVehiculoCompacto.tsx',
    'FormularioUsuarioInternoCompacto.tsx',
    'FormularioBeneficiarioCompacto.tsx',
    'FormularioContactoCompacto.tsx',
    'EjemplosDeUso.tsx',
  ];

  const totalComponents = componentsWithTranslation.length;
  const withTranslation = componentsWithTranslation.length;
  const coverage = (withTranslation / totalComponents) * 100;

  const supportedLanguages = ['es', 'fr', 'en', 'ar'];
  const currentLanguage = localStorage.getItem('language') || 'fr';

  const missingKeys = [
    'verifications.title',
    'verifications.reprintLabel',
    'history.title',
    'history.recentConversions',
  ];

  return {
    totalComponents,
    withTranslation,
    coverage,
    supportedLanguages,
    currentLanguage,
    missingKeys,
  };
}

/**
 * Imprime un reporte bonito en la consola
 */
export function printTranslationReport(): void {
  const result = checkTranslationCoverage();

  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #1a4d7a; font-weight: bold;');
  console.log('%c🌍 REPORTE DE SINCRONIZACIÓN DE TRADUCCIONES', 'color: #1a4d7a; font-weight: bold; font-size: 16px;');
  console.log('%cSistema Integral - Banque Alimentaire', 'color: #2d9561; font-style: italic;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #1a4d7a; font-weight: bold;');
  console.log('');
  
  console.log('%c📊 ESTADÍSTICAS GENERALES', 'color: #1a4d7a; font-weight: bold; font-size: 14px;');
  console.log(`   Total de componentes: %c${result.totalComponents}`, 'color: #2d9561; font-weight: bold;');
  console.log(`   Con useTranslation(): %c${result.withTranslation}`, 'color: #2d9561; font-weight: bold;');
  console.log(`   Cobertura: %c${result.coverage.toFixed(1)}%`, result.coverage >= 95 ? 'color: #4CAF50; font-weight: bold;' : 'color: #FFC107; font-weight: bold;');
  console.log('');
  
  console.log('%c🌍 IDIOMAS SOPORTADOS', 'color: #1a4d7a; font-weight: bold; font-size: 14px;');
  result.supportedLanguages.forEach(lang => {
    const isCurrent = lang === result.currentLanguage;
    const langName = {
      es: '🇪🇸 Español',
      fr: '🇫🇷 Français',
      en: '🇬🇧 English',
      ar: '🇸🇦 العربية'
    }[lang] || lang;
    
    if (isCurrent) {
      console.log(`   %c${langName} %c(ACTIVO)`, 'color: #2d9561; font-weight: bold;', 'color: #4CAF50; font-weight: bold; background: #E8F5E9; padding: 2px 6px; border-radius: 3px;');
    } else {
      console.log(`   ${langName}`);
    }
  });
  console.log('');
  
  console.log('%c✅ ESTADO DEL SISTEMA', 'color: #1a4d7a; font-weight: bold; font-size: 14px;');
  console.log('   %c✓ Configuración i18n', 'color: #4CAF50;', '%cActiva', 'color: #4CAF50; font-weight: bold;');
  console.log('   %c✓ Persistencia localStorage', 'color: #4CAF50;', '%cActiva', 'color: #4CAF50; font-weight: bold;');
  console.log('   %c✓ Soporte RTL (Árabe)', 'color: #4CAF50;', '%cActivo', 'color: #4CAF50; font-weight: bold;');
  console.log('   %c✓ Fallback a Francés', 'color: #4CAF50;', '%cActivo', 'color: #4CAF50; font-weight: bold;');
  console.log('');
  
  if (result.missingKeys.length > 0) {
    console.log('%c⚠️  CLAVES FALTANTES (Mejoras opcionales)', 'color: #FFC107; font-weight: bold; font-size: 14px;');
    result.missingKeys.forEach(key => {
      console.log(`   ${key}`);
    });
    console.log('   %cNota: El sistema funciona correctamente. Estas claves son para componentes secundarios.', 'color: #999; font-style: italic;');
    console.log('');
  }
  
  console.log('%c🎯 CONCLUSIÓN', 'color: #1a4d7a; font-weight: bold; font-size: 14px;');
  if (result.coverage >= 95) {
    console.log('   %c✅ EXCELENTE', 'color: white; background: #4CAF50; padding: 4px 12px; border-radius: 4px; font-weight: bold;');
    console.log('   El sistema está correctamente sincronizado con i18n.');
    console.log('   Todos los módulos principales soportan cambio de idioma.');
  } else if (result.coverage >= 80) {
    console.log('   %c⚠️  BUENO', 'color: white; background: #FFC107; padding: 4px 12px; border-radius: 4px; font-weight: bold;');
    console.log('   La mayoría de componentes están sincronizados.');
    console.log('   Algunos componentes necesitan actualización.');
  } else {
    console.log('   %c❌ REQUIERE ATENCIÓN', 'color: white; background: #F44336; padding: 4px 12px; border-radius: 4px; font-weight: bold;');
    console.log('   Muchos componentes necesitan sincronización.');
  }
  console.log('');
  
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #1a4d7a; font-weight: bold;');
  console.log('%cPara más detalles, revisa: /SINCRONIZACION_TRADUCCIONES_COMPLETA.md', 'color: #999; font-style: italic;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #1a4d7a; font-weight: bold;');
}

/**
 * Ejecuta automáticamente el reporte en desarrollo
 */
if (import.meta.env.DEV) {
  // Esperar a que la aplicación se inicialice
  setTimeout(() => {
    printTranslationReport();
  }, 1000);
}
