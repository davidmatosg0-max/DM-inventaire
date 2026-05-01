/**
 * Función simple de búsqueda que funciona desde el primer carácter
 * Busca en cualquier parte del texto, maneja valores null/undefined
 */
export const filterBySearch = (text: string | null | undefined, query: string | null | undefined): boolean => {
  // Si no hay query o no es string, retornar true (mostrar todo)
  if (!query || typeof query !== 'string' || query.trim() === '') return true;
  
  // Si no hay texto para buscar, retornar false
  if (!text) return false;
  
  // Búsqueda simple: convertir ambos a lowercase y buscar
  const textLower = String(text).toLowerCase().trim();
  const queryLower = String(query).toLowerCase().trim();
  
  return textLower.includes(queryLower);
};

/**
 * Función para filtrar múltiples campos
 * Retorna true si alguno de los campos coincide
 */
export const filterBySearchMultiple = (fields: (string | null | undefined)[], query: string | null | undefined): boolean => {
  // Si no hay query o no es string, mostrar todo
  if (!query || typeof query !== 'string' || query.trim() === '') return true;
  
  // Buscar en cualquiera de los campos
  return fields.some(field => filterBySearch(field, query));
};

// Mantener compatibilidad con código anterior
export const filterByThreeLetters = filterBySearch;
export const filterByThreeLettersMultiple = filterBySearchMultiple;
