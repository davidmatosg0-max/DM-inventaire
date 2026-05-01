/**
 * Configuración de moneda del sistema
 * Dólar Canadiense (CAD$)
 */

export const CURRENCY_SYMBOL = 'CAD$';
export const CURRENCY_CODE = 'CAD';
export const CURRENCY_NAME = 'Dólar Canadiense';

/**
 * Formatea un valor numérico como moneda
 * @param value - Valor numérico a formatear
 * @param decimals - Número de decimales (por defecto 2)
 * @returns String formateado como moneda
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  return `${CURRENCY_SYMBOL} ${value.toFixed(decimals)}`;
}

/**
 * Formatea un valor numérico como moneda con símbolo al final
 * @param value - Valor numérico a formatear
 * @param decimals - Número de decimales (por defecto 2)
 * @returns String formateado como moneda
 */
export function formatCurrencyAlt(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)} ${CURRENCY_SYMBOL}`;
}
