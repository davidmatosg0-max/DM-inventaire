/**
 * Supresor de Warnings de Figma Make
 * 
 * Figma Make inyecta props internos (_fgT, _fgt, _fgS, _fgs, _fgB, _fgb)
 * para tracking y debugging. Estos warnings no afectan la funcionalidad
 * y solo aparecen en el entorno de desarrollo de Figma.
 */

export function suppressFigmaWarnings() {
  // Guardar referencias a los métodos originales de console
  const originalError = console.error;
  const originalWarn = console.warn;

  // Lista de patrones de warnings de Figma que deben ser suprimidos
  const figmaWarningPatterns = [
    '_fgT',
    '_fgt',
    '_fgS',
    '_fgs',
    '_fgB',
    '_fgb',
    'FGCmp',
    'React does not recognize the `%s` prop on a DOM element'
  ];

  // Lista de patrones de warnings de accesibilidad que queremos mantener
  const keepAccessibilityWarnings = [
    'Missing `Description`',
    'aria-describedby'
  ];

  // Función para verificar si un mensaje debe ser suprimido
  const shouldSuppress = (message: string): boolean => {
    // Mantener warnings de accesibilidad
    if (keepAccessibilityWarnings.some(pattern => message.includes(pattern))) {
      return false;
    }

    // Suprimir warnings de Figma
    return figmaWarningPatterns.some(pattern => message.includes(pattern));
  };

  // Reemplazar console.error
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldSuppress(message)) {
      originalError.apply(console, args);
    }
  };

  // Reemplazar console.warn
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    if (!shouldSuppress(message)) {
      originalWarn.apply(console, args);
    }
  };

  // Retornar función de limpieza para restaurar comportamiento original si es necesario
  return () => {
    console.error = originalError;
    console.warn = originalWarn;
  };
}

/**
 * Versión alternativa que solo filtra en producción o específicamente para Figma
 */
export function suppressFigmaWarningsConditional() {
  // Detectar si estamos en el entorno de Figma
  const isFigmaEnvironment = 
    window.location.hostname.includes('figma.site') ||
    window.location.hostname.includes('makeproxy') ||
    typeof (window as any).figma !== 'undefined';

  if (isFigmaEnvironment) {
    return suppressFigmaWarnings();
  }

  // En otros entornos, no hacer nada
  return () => {};
}
