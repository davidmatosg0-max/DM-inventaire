/**
 * Utilidades de Formateo según Locale
 * 
 * Proporciona funciones para formatear fechas, números y monedas
 * según el idioma seleccionado por el usuario.
 */

import i18n from 'i18next';

// Mapeo de códigos de idioma a locales
const LOCALE_MAP: Record<string, string> = {
  es: 'es-ES',
  fr: 'fr-CA',
  en: 'en-CA',
  ar: 'ar-SA'
};

/**
 * Obtener el locale actual basado en el idioma de i18n
 */
export function getCurrentLocale(): string {
  const lang = i18n.language || 'fr';
  return LOCALE_MAP[lang] || 'fr-CA';
}

/**
 * Formatear una fecha según el locale actual
 */
export function formatDate(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const locale = getCurrentLocale();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options
  };
  
  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return dateObj.toLocaleDateString();
  }
}

/**
 * Formatear una fecha con hora según el locale actual
 */
export function formatDateTime(
  date: string | Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const locale = getCurrentLocale();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...options
  };
  
  try {
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch (error) {
    console.error('Error al formatear fecha/hora:', error);
    return dateObj.toLocaleString();
  }
}

/**
 * Formatear fecha en formato corto (sin año)
 */
export function formatDateShort(date: string | Date): string {
  return formatDate(date, { month: 'short', day: 'numeric' });
}

/**
 * Formatear fecha en formato largo
 */
export function formatDateLong(date: string | Date): string {
  return formatDate(date, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Formatear fecha relativa (hace X días)
 */
export function formatDateRelative(date: string | Date): string {
  const locale = getCurrentLocale();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  // Traducciones para fechas relativas
  const translations: Record<string, Record<string, string>> = {
    'fr-CA': {
      today: "aujourd'hui",
      yesterday: 'hier',
      daysAgo: 'il y a {n} jours',
      tomorrow: 'demain',
      inDays: 'dans {n} jours'
    },
    'es-ES': {
      today: 'hoy',
      yesterday: 'ayer',
      daysAgo: 'hace {n} días',
      tomorrow: 'mañana',
      inDays: 'en {n} días'
    },
    'en-CA': {
      today: 'today',
      yesterday: 'yesterday',
      daysAgo: '{n} days ago',
      tomorrow: 'tomorrow',
      inDays: 'in {n} days'
    },
    'ar-SA': {
      today: 'اليوم',
      yesterday: 'أمس',
      daysAgo: 'منذ {n} أيام',
      tomorrow: 'غدا',
      inDays: 'في {n} أيام'
    }
  };
  
  const t = translations[locale] || translations['fr-CA'];
  
  if (diffDays === 0) return t.today;
  if (diffDays === 1) return t.yesterday;
  if (diffDays === -1) return t.tomorrow;
  if (diffDays > 1) return t.daysAgo.replace('{n}', String(diffDays));
  if (diffDays < -1) return t.inDays.replace('{n}', String(Math.abs(diffDays)));
  
  return formatDate(dateObj);
}

/**
 * Formatear un número según el locale actual
 */
export function formatNumber(
  number: number,
  options?: Intl.NumberFormatOptions
): string {
  const locale = getCurrentLocale();
  
  // Por defecto, NO usar separadores de miles y sin decimales
  const defaultOptions: Intl.NumberFormatOptions = {
    useGrouping: false,
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    ...options
  };
  
  try {
    return new Intl.NumberFormat(locale, defaultOptions).format(number);
  } catch (error) {
    console.error('Error al formatear número:', error);
    return Math.round(number).toString();
  }
}

/**
 * Formatear números grandes dividiéndolos por 1000
 * Ejemplo: 600000 → 600
 * También elimina separadores de miles del resultado
 */
export function formatLargeNumber(number: number): string {
  // Si el número es mayor a 1000, dividir por 1000
  if (Math.abs(number) >= 1000) {
    return Math.round(number / 1000).toString();
  }
  return Math.round(number).toString();
}

/**
 * Formatear número sin separadores de miles y con decimales útiles
 * Ejemplo: 600000 -> 600000, 1.500 -> 1.5
 */
export function formatNumberSimple(number: number): string {
  if (!Number.isFinite(number)) {
    return '0';
  }

  const rounded = Math.round(number * 1000) / 1000;
  const asText = rounded.toString();
  return asText.includes('.')
    ? asText.replace(/\.0+$/, '').replace(/(\.\d*?[1-9])0+$/, '$1')
    : asText;
}

/**
 * Formatear cantidades con decimales útiles (sin ceros finales)
 */
export function formatQuantity(number: number): string {
  return formatNumberSimple(number);
}

/**
 * Formatear montos monetarios como enteros sin decimales
 */
export function formatMoney(number: number): string {
  return formatNumberSimple(number);
}

/**
 * Formatear un número decimal
 */
export function formatDecimal(number: number, decimals: number = 2): string {
  return formatNumber(number, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Formatear un porcentaje
 */
export function formatPercentage(number: number, decimals: number = 1): string {
  return formatNumber(number, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

/**
 * Formatear moneda en dólares canadienses (CAD)
 */
export function formatCurrency(
  amount: number,
  options?: Intl.NumberFormatOptions
): string {
  const locale = getCurrentLocale();
  
  const defaultOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options
  };
  
  try {
    return new Intl.NumberFormat(locale, defaultOptions).format(amount);
  } catch (error) {
    console.error('Error al formatear moneda:', error);
    return `CAD$ ${Math.round(amount)}`;
  }
}

/**
 * Formatear peso en kilogramos
 */
export function formatWeight(kg: number, decimals: number = 2): string {
  const locale = getCurrentLocale();
  const formatted = formatDecimal(kg, decimals);
  
  // Traducciones para "kg"
  const kgLabels: Record<string, string> = {
    'fr-CA': 'kg',
    'es-ES': 'kg',
    'en-CA': 'kg',
    'ar-SA': 'كجم'
  };
  
  const kgLabel = kgLabels[locale] || 'kg';
  
  return `${formatted} ${kgLabel}`;
}

/**
 * Formatear cantidad con unidad
 */
export function formatQuantityWithUnit(quantity: number, unit: string): string {
  const formatted = formatQuantity(quantity);
  return `${formatted} ${unit}`;
}

/**
 * Formatear duración en milisegundos
 */
export function formatDuration(ms: number): string {
  const locale = getCurrentLocale();
  
  const translations: Record<string, Record<string, string>> = {
    'fr-CA': {
      ms: 'ms',
      seconds: 's',
      minutes: 'min',
      hours: 'h'
    },
    'es-ES': {
      ms: 'ms',
      seconds: 's',
      minutes: 'min',
      hours: 'h'
    },
    'en-CA': {
      ms: 'ms',
      seconds: 's',
      minutes: 'min',
      hours: 'h'
    },
    'ar-SA': {
      ms: 'مللي ثانية',
      seconds: 'ث',
      minutes: 'د',
      hours: 'س'
    }
  };
  
  const t = translations[locale] || translations['fr-CA'];
  
  if (ms < 1000) {
    return `${Math.round(ms)}${t.ms}`;
  } else if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}${t.seconds}`;
  } else if (ms < 3600000) {
    return `${(ms / 60000).toFixed(1)}${t.minutes}`;
  } else {
    return `${(ms / 3600000).toFixed(1)}${t.hours}`;
  }
}

/**
 * Formatear tamaño de archivo
 */
export function formatFileSize(bytes: number): string {
  const locale = getCurrentLocale();
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${formatDecimal(size)} ${units[unitIndex]}`;
}

/**
 * Formatear rango de fechas
 */
export function formatDateRange(startDate: string | Date, endDate: string | Date): string {
  const locale = getCurrentLocale();
  
  const translations: Record<string, string> = {
    'fr-CA': 'du {start} au {end}',
    'es-ES': 'del {start} al {end}',
    'en-CA': 'from {start} to {end}',
    'ar-SA': 'من {start} إلى {end}'
  };
  
  const template = translations[locale] || translations['fr-CA'];
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  
  return template.replace('{start}', start).replace('{end}', end);
}

/**
 * Obtener el nombre del mes actual
 */
export function getCurrentMonthName(): string {
  const locale = getCurrentLocale();
  const now = new Date();
  
  return new Intl.DateTimeFormat(locale, { month: 'long' }).format(now);
}

/**
 * Obtener lista de meses
 */
export function getMonthNames(): string[] {
  const locale = getCurrentLocale();
  const months: string[] = [];
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(2024, i, 1);
    months.push(new Intl.DateTimeFormat(locale, { month: 'long' }).format(date));
  }
  
  return months;
}

/**
 * Obtener lista de días de la semana
 */
export function getWeekdayNames(format: 'long' | 'short' = 'long'): string[] {
  const locale = getCurrentLocale();
  const weekdays: string[] = [];
  
  // Empezar desde domingo (0) hasta sábado (6)
  for (let i = 0; i < 7; i++) {
    const date = new Date(2024, 0, i); // Enero 2024 empieza en lunes
    weekdays.push(
      new Intl.DateTimeFormat(locale, { weekday: format }).format(date)
    );
  }
  
  return weekdays;
}

/**
 * Formatear dirección RTL para árabe
 */
export function isRTL(): boolean {
  const lang = i18n.language || 'fr';
  return lang === 'ar';
}

/**
 * Obtener dirección del texto
 */
export function getTextDirection(): 'ltr' | 'rtl' {
  return isRTL() ? 'rtl' : 'ltr';
}

/**
 * Formatear lista de elementos según el locale
 */
export function formatList(items: string[], type: 'conjunction' | 'disjunction' = 'conjunction'): string {
  const locale = getCurrentLocale();
  
  try {
    const formatter = new Intl.ListFormat(locale, { style: 'long', type });
    return formatter.format(items);
  } catch (error) {
    console.error('Error al formatear lista:', error);
    return items.join(', ');
  }
}

/**
 * Formatear número ordinal (1er, 2e, 3e, etc.)
 */
export function formatOrdinal(number: number): string {
  const locale = getCurrentLocale();
  
  // Mapas de sufijos ordinales
  const ordinalSuffixes: Record<string, (n: number) => string> = {
    'fr-CA': (n: number) => (n === 1 ? 'er' : 'e'),
    'es-ES': (n: number) => (n === 1 ? 'er' : 'º'),
    'en-CA': (n: number) => {
      const j = n % 10;
      const k = n % 100;
      if (j === 1 && k !== 11) return 'st';
      if (j === 2 && k !== 12) return 'nd';
      if (j === 3 && k !== 13) return 'rd';
      return 'th';
    },
    'ar-SA': () => '' // En árabe no se usan ordinales de la misma manera
  };
  
  const getSuffix = ordinalSuffixes[locale] || ordinalSuffixes['fr-CA'];
  return `${number}${getSuffix(number)}`;
}

/**
 * Formatear hora (solo hora y minutos)
 */
export function formatTime(date: string | Date): string {
  const locale = getCurrentLocale();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    console.error('Error al formatear hora:', error);
    return dateObj.toLocaleTimeString();
  }
}

/**
 * Parsear fecha desde string de input (yyyy-mm-dd)
 */
export function parseInputDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  } catch (error) {
    console.error('Error al parsear fecha:', error);
    return null;
  }
}

/**
 * Formatear fecha para input HTML (yyyy-mm-dd)
 */
export function formatForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Obtener fecha de hoy en formato input
 */
export function getTodayInputFormat(): string {
  return formatForInput(new Date());
}

/**
 * Calcular diferencia de días entre fechas
 */
export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const diffMs = d2.getTime() - d1.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Verificar si una fecha está en el pasado
 */
export function isInPast(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  return dateObj.getTime() < now.getTime();
}

/**
 * Verificar si una fecha está en el futuro
 */
export function isInFuture(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  return dateObj.getTime() > now.getTime();
}

/**
 * Agregar días a una fecha
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Formatear separador de miles según locale
 */
export function getThousandsSeparator(): string {
  const locale = getCurrentLocale();
  const formatted = formatNumber(1000);
  
  // Extraer el separador
  const match = formatted.match(/1(.?)000/);
  return match ? match[1] : ',';
}

/**
 * Formatear separador decimal según locale
 */
export function getDecimalSeparator(): string {
  const locale = getCurrentLocale();
  const formatted = formatDecimal(1.1, 1);
  
  // Extraer el separador
  const match = formatted.match(/1(.?)1/);
  return match ? match[1] : '.';
}

// Exportar funciones helper
export const FormatHelpers = {
  date: formatDate,
  dateTime: formatDateTime,
  dateShort: formatDateShort,
  dateLong: formatDateLong,
  dateRelative: formatDateRelative,
  dateRange: formatDateRange,
  time: formatTime,
  number: formatNumber,
  decimal: formatDecimal,
  percentage: formatPercentage,
  currency: formatCurrency,
  weight: formatWeight,
  quantity: formatQuantity,
  duration: formatDuration,
  fileSize: formatFileSize,
  list: formatList,
  ordinal: formatOrdinal,
  isRTL,
  getTextDirection
};