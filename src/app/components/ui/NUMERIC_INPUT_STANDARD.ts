/**
 * ESTÁNDAR DE INPUTS NUMÉRICOS PARA TODA LA APP
 * 
 * Este archivo documenta el estándar para inputs que aceptan números decimales
 * Objetivo: Permitir valores como 1.5 sin zeros adicionales en toda la app
 */

/**
 * CONFIGURACIÓN ESTÁNDAR PARA QuantityInput
 * 
 * Todos los QuantityInput DEBEN usar esta configuración:
 * - step={0.01} → Permite incrementos de 0.01 (dos decimales)
 * - allowDecimal={true} → Explícitamente habilita decimales
 * - parseQuantityText(value, true) → true para permitir decimales
 * 
 * Ejemplo correcto:
 * <QuantityInput
 *   value={cantidad}
 *   onChangeText={(value) => setCantidad(parseQuantityText(value, true) || 0)}
 *   step={0.01}
 *   allowDecimal={true}
 *   min={0}
 * />
 * 
 * ❌ EVITAR:
 * - step={1} (restringe a enteros)
 * - step="1" (string limita precisión)
 * - allowDecimal={false} o omitir allowDecimal
 * - parseQuantityText(value, false) (segundo argumento false)
 */

/**
 * CONFIGURACIÓN PARA HTML Input type="number"
 * 
 * Para inputs nativos de HTML:
 * - step="0.01" → Permite dos decimales
 * - type="number" → Valida que sea número
 * - inputMode="decimal" → Teclado decimal en móviles
 * 
 * Ejemplo correcto:
 * <input
 *   type="number"
 *   step="0.01"
 *   min="0"
 *   placeholder="0"
 *   value={valor}
 *   onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
 * />
 * 
 * ❌ EVITAR:
 * - step="1"
 * - step={1}
 * - Omitir step (usa default de 1)
 */

/**
 * FUNCIONES DE UTILIDAD
 * 
 * parseQuantityText(value, allowDecimal)
 *   - allowDecimal=true → Permite "1.5", "0.25"
 *   - allowDecimal=false → Solo "1", "10" (no usar)
 * 
 * formatQuantityText(value, precision)
 *   - Elimina zeros innecesarios: "1.50" → "1.5"
 *   - Elimina punto decimal si no hay decimales: "10.0" → "10"
 * 
 * normalizeQuantityText(value, allowDecimal)
 *   - Limpia la entrada: "1,5" → "1.5"
 *   - Remueve caracteres inválidos
 */

/**
 * CAMPOS COMUNES QUE NECESITAN DECIMALES
 * 
 * ✅ Cantidad: 1.5 kg, 2.25 paletas
 * ✅ Peso: 100.5 kg, 0.75 kg
 * ✅ Peso unitario: 1.5 kg/unidad
 * ✅ Valor monetario: 19.99 CAD$
 * ✅ Porcentajes: 15.5%
 * 
 * Todos estos campos DEBEN permitir al menos 2 decimales
 */

export const NUMERIC_INPUT_CONFIG = {
  // Para cantidades generales
  quantity: {
    step: 0.01,
    allowDecimal: true,
    min: 0,
    precision: 2,
  },
  
  // Para pesos (kg)
  weight: {
    step: 0.01,
    allowDecimal: true,
    min: 0,
    precision: 2,
  },
  
  // Para valores monetarios
  currency: {
    step: 0.01,
    allowDecimal: true,
    min: 0,
    precision: 2,
  },
  
  // Para porcentajes
  percentage: {
    step: 0.1,
    allowDecimal: true,
    min: 0,
    max: 100,
    precision: 1,
  },
} as const;

/**
 * CHECKLIST PARA AUDITORÍA
 * 
 * Al revisar inputs numéricos:
 * 
 * [ ] ¿Usa step={0.01} o step="0.01"?
 * [ ] ¿allowDecimal está explícitamente en true?
 * [ ] ¿La función onChange/onChangeText usa parseQuantityText con true?
 * [ ] ¿El usuario puede escribir "1.5" sin restricciones?
 * [ ] ¿El valor se muestra sin zeros innecesarios? (1.5, no 1.50)
 * [ ] ¿Funciona en mobile con teclado decimal?
 */
