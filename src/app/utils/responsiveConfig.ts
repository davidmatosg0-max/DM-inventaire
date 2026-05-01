/**
 * Configuración de Responsive para la Aplicación
 * Sistema unificado para adaptar la UI a todos los tamaños de pantalla
 */

/**
 * Breakpoints de Tailwind CSS v4
 * - xs: < 640px (móviles)
 * - sm: >= 640px (móviles grandes)
 * - md: >= 768px (tablets)
 * - lg: >= 1024px (laptops)
 * - xl: >= 1280px (desktops)
 * - 2xl: >= 1536px (pantallas grandes)
 */

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
} as const;

/**
 * Clases de Dialog responsivas según el tamaño
 */
export const DIALOG_SIZES = {
  // Dialog pequeño (confirmaciones, alertas)
  sm: 'w-full sm:max-w-sm md:max-w-md mx-4 sm:mx-auto max-h-[90vh] sm:max-h-[85vh]',
  
  // Dialog mediano (formularios simples)
  md: 'w-full sm:max-w-md md:max-w-lg mx-4 sm:mx-auto max-h-[90vh] sm:max-h-[85vh]',
  
  // Dialog grande (formularios complejos)
  lg: 'w-full sm:max-w-lg md:max-w-2xl mx-4 sm:mx-auto max-h-[90vh] sm:max-h-[85vh]',
  
  // Dialog extra grande (tablas, dashboards)
  xl: 'w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-4 sm:mx-auto max-h-[90vh] sm:max-h-[85vh]',
  
  // Dialog full (vistas complejas con sidebar)
  full: 'w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[80vw] mx-auto max-h-[95vh] sm:max-h-[90vh]',
  
  // Dialog fullscreen (pantalla completa)
  fullscreen: 'w-screen h-screen max-w-none max-h-none !top-0 !left-0 !translate-x-0 !translate-y-0 m-0 rounded-none'
} as const;

/**
 * Clases de Grid responsivas
 */
export const GRID_COLS = {
  // 1 columna en móvil, 2 en tablet, 3 en desktop
  '1-2-3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  
  // 1 columna en móvil, 2 en tablet, 4 en desktop
  '1-2-4': 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
  
  // 1 columna en móvil, 3 en desktop
  '1-3': 'grid-cols-1 lg:grid-cols-3',
  
  // 2 columnas siempre (compacto)
  '2-2': 'grid-cols-2',
  
  // 1 columna en móvil, 2 en todo lo demás
  '1-2': 'grid-cols-1 sm:grid-cols-2',
  
  // 2 columnas en móvil, 3 en tablet, 4 en desktop
  '2-3-4': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  
  // Automático según el contenido
  auto: 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]'
} as const;

/**
 * Clases de padding responsivas para contenedores
 */
export const CONTAINER_PADDING = {
  sm: 'px-4 sm:px-6',
  md: 'px-4 sm:px-6 lg:px-8',
  lg: 'px-6 sm:px-8 lg:px-10',
  none: 'px-0'
} as const;

/**
 * Clases de espaciado responsivo
 */
export const SPACING = {
  section: 'space-y-4 md:space-y-6',
  card: 'gap-4 md:gap-6',
  form: 'space-y-3 md:space-y-4',
  tight: 'space-y-2 md:space-y-3'
} as const;

/**
 * Clases de texto responsivo
 */
export const TEXT_SIZES = {
  title: 'text-xl sm:text-2xl md:text-3xl',
  subtitle: 'text-lg sm:text-xl md:text-2xl',
  heading: 'text-base sm:text-lg md:text-xl',
  body: 'text-sm sm:text-base',
  small: 'text-xs sm:text-sm',
  tiny: 'text-[10px] sm:text-xs'
} as const;

/**
 * Clases para ocultar/mostrar según breakpoint
 */
export const VISIBILITY = {
  hideOnMobile: 'hidden sm:block',
  showOnMobile: 'block sm:hidden',
  hideOnTablet: 'hidden md:block',
  showOnTablet: 'block md:hidden',
  hideOnDesktop: 'hidden lg:block',
  showOnDesktop: 'block lg:hidden'
} as const;

/**
 * Clases para botones responsivos
 */
export const BUTTON_SIZES = {
  sm: 'h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-sm',
  md: 'h-9 px-4 text-sm sm:h-10 sm:px-5 sm:text-base',
  lg: 'h-10 px-5 text-sm sm:h-11 sm:px-6 sm:text-base',
  icon: 'h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10'
} as const;

/**
 * Clases para cards responsivos
 */
export const CARD_STYLES = {
  default: 'rounded-lg sm:rounded-xl p-4 sm:p-5 md:p-6',
  compact: 'rounded-md sm:rounded-lg p-3 sm:p-4',
  large: 'rounded-lg sm:rounded-xl p-5 sm:p-6 md:p-8'
} as const;

/**
 * Clases para sidebars responsivos
 */
export const SIDEBAR = {
  width: 'w-full sm:w-64 md:w-72 lg:w-80',
  collapsedWidth: 'w-16 sm:w-20',
  mobile: 'fixed inset-0 z-50 sm:relative sm:inset-auto',
  desktop: 'hidden sm:block'
} as const;

/**
 * Hook personalizado para detectar tamaño de pantalla
 */
export function useResponsive() {
  if (typeof window === 'undefined') {
    return { isMobile: false, isTablet: false, isDesktop: true, width: 1920 };
  }

  const [windowSize, setWindowSize] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  React.useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isMobile: windowSize.width < BREAKPOINTS.md,
    isTablet: windowSize.width >= BREAKPOINTS.md && windowSize.width < BREAKPOINTS.lg,
    isDesktop: windowSize.width >= BREAKPOINTS.lg,
    width: windowSize.width,
    height: windowSize.height
  };
}

// Necesitamos importar React para el hook
import React from 'react';

/**
 * Utilidad para combinar clases condicionales
 */
export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Clases para tablas responsivas
 */
export const TABLE_STYLES = {
  container: 'overflow-x-auto scrollbar-thin',
  table: 'w-full min-w-[640px]',
  cell: 'px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm',
  header: 'px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm font-medium'
} as const;

/**
 * Configuración de Scroll
 */
export const SCROLL_STYLES = {
  vertical: 'overflow-y-auto scrollbar-thin',
  horizontal: 'overflow-x-auto scrollbar-thin',
  both: 'overflow-auto scrollbar-thin',
  hidden: 'overflow-hidden'
} as const;

/**
 * Clases para formularios responsivos
 */
export const FORM_STYLES = {
  label: 'text-xs sm:text-sm font-medium',
  input: 'h-9 sm:h-10 text-sm sm:text-base px-3 sm:px-4',
  textarea: 'min-h-[80px] sm:min-h-[100px] text-sm sm:text-base p-3 sm:p-4',
  select: 'h-9 sm:h-10 text-sm sm:text-base',
  checkbox: 'h-4 w-4 sm:h-5 sm:w-5'
} as const;

/**
 * Layout de dos columnas con sidebar
 */
export const LAYOUT_WITH_SIDEBAR = {
  container: 'flex flex-col sm:flex-row gap-0 sm:gap-4',
  sidebar: 'w-full sm:w-64 md:w-72 border-b sm:border-b-0 sm:border-r',
  content: 'flex-1 min-w-0'
} as const;

/**
 * Márgenes y paddings estándar
 */
export const STANDARD_SPACING = {
  page: 'p-4 sm:p-6 lg:p-8',
  section: 'mb-4 sm:mb-6 lg:mb-8',
  card: 'p-4 sm:p-5 lg:p-6',
  list: 'space-y-2 sm:space-y-3 lg:space-y-4'
} as const;
