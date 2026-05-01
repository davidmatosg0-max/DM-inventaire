import { TipoContacto } from './contactosDepartamentoStorage';

export interface TipoContactoPersonalizado {
  id: string;
  code: TipoContacto | string;
  label: string;
  icon: string; // Nombre del icono de lucide-react
  color: string;
  bgColor: string;
  isPredefined: boolean;
  dateCreated: string; // Nueva propiedad para rastrear cuándo fue creado
  departamentoId?: string; // NUEVO: ID del departamento al que pertenece (undefined = global)
}

const STORAGE_KEY = 'banque_alimentaire_tipos_contacto_personalizados';

// Obtener todos los tipos de contacto (globales + de un departamento específico)
export function obtenerTiposContacto(departamentoId?: string): TipoContactoPersonalizado[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const todosTipos: TipoContactoPersonalizado[] = stored ? JSON.parse(stored) : [];
    
    if (departamentoId) {
      // Retornar tipos globales (sin departamentoId) + tipos específicos del departamento
      return todosTipos.filter(t => !t.departamentoId || t.departamentoId === departamentoId);
    }
    
    // Si no se especifica departamento, retornar todos
    return todosTipos;
  } catch (error) {
    console.error('Error al obtener tipos de contacto:', error);
    return [];
  }
}

export function obtenerTiposPersonalizados(departamentoId?: string): TipoContactoPersonalizado[] {
  // Ahora todos los tipos son "personalizados" (creados por el usuario)
  return obtenerTiposContacto(departamentoId);
}

// NUEVO: Obtener solo tipos globales (sin departamento asignado)
export function obtenerTiposGlobales(): TipoContactoPersonalizado[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const todosTipos: TipoContactoPersonalizado[] = stored ? JSON.parse(stored) : [];
    return todosTipos.filter(t => !t.departamentoId);
  } catch (error) {
    console.error('Error al obtener tipos globales:', error);
    return [];
  }
}

// NUEVO: Obtener solo tipos de un departamento específico
export function obtenerTiposPorDepartamento(departamentoId: string): TipoContactoPersonalizado[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const todosTipos: TipoContactoPersonalizado[] = stored ? JSON.parse(stored) : [];
    return todosTipos.filter(t => t.departamentoId === departamentoId);
  } catch (error) {
    console.error('Error al obtener tipos del departamento:', error);
    return [];
  }
}

export function guardarTipoPersonalizado(
  tipo: Omit<TipoContactoPersonalizado, 'id' | 'isPredefined' | 'dateCreated'>,
  departamentoId?: string
): TipoContactoPersonalizado {
  const stored = localStorage.getItem(STORAGE_KEY);
  const tipos: TipoContactoPersonalizado[] = stored ? JSON.parse(stored) : [];
  
  const nuevoTipo: TipoContactoPersonalizado = {
    ...tipo,
    id: `tipo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    isPredefined: true, // Todos los tipos creados se guardan como predefinidos permanentes
    dateCreated: new Date().toISOString(), // Registrar fecha de creación
    departamentoId: departamentoId // Asignar departamento (undefined = global)
  };
  
  tipos.push(nuevoTipo);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tipos));
  
  const scope = departamentoId ? `departamento ${departamentoId}` : 'global';
  console.log(`✅ Tipo de contacto "${nuevoTipo.label}" (${nuevoTipo.code}) guardado permanentemente [${scope}]`);
  console.log(`📊 Total de tipos de contacto: ${tipos.length}`);
  
  return nuevoTipo;
}

export function actualizarTipoPersonalizado(id: string, datos: Partial<TipoContactoPersonalizado>): void {
  const stored = localStorage.getItem(STORAGE_KEY);
  const tipos: TipoContactoPersonalizado[] = stored ? JSON.parse(stored) : [];
  const index = tipos.findIndex(t => t.id === id);
  
  if (index !== -1) {
    tipos[index] = { ...tipos[index], ...datos };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tipos));
  }
}

export function eliminarTipoPersonalizado(id: string): void {
  const stored = localStorage.getItem(STORAGE_KEY);
  const tipos: TipoContactoPersonalizado[] = stored ? JSON.parse(stored) : [];
  const tiposFiltrados = tipos.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tiposFiltrados));
}

export function existeCodigoTipo(code: string, departamentoId?: string, excludeId?: string): boolean {
  const todosTipos = obtenerTiposContacto(departamentoId);
  return todosTipos.some(t => t.code === code && t.id !== excludeId);
}

// Iconos disponibles para selección
export const ICONOS_DISPONIBLES = [
  'User', 'UserCheck', 'UserPlus', 'Users', 'Heart', 'Star', 
  'Building', 'Building2', 'Briefcase', 'Stethoscope', 
  'ShieldCheck', 'Award', 'Crown', 'Zap', 'Sparkles',
  'Phone', 'Mail', 'MessageCircle', 'Package', 'Truck'
];

// Colores predefinidos para selección
export const COLORES_DISPONIBLES = [
  { name: 'Azul', value: '#1a4d7a', bg: '#DBEAFE' },
  { name: 'Verde', value: '#2d9561', bg: '#D1FAE5' },
  { name: 'Rojo', value: '#DC2626', bg: '#FEE2E2' },
  { name: 'Amarillo', value: '#F59E0B', bg: '#FEF3C7' },
  { name: 'Púrpura', value: '#8B5CF6', bg: '#EDE9FE' },
  { name: 'Rosa', value: '#EC4899', bg: '#FCE7F3' },
  { name: 'Gris', value: '#6B7280', bg: '#F3F4F6' },
  { name: 'Naranja', value: '#F97316', bg: '#FFEDD5' },
  { name: 'Índigo', value: '#4F46E5', bg: '#E0E7FF' },
  { name: 'Turquesa', value: '#14B8A6', bg: '#CCFBF1' }
];

/**
 * Exportar todos los tipos de contacto a JSON
 * Útil para hacer respaldos o migrar configuraciones
 */
export function exportarTiposContacto(): string {
  const tipos = obtenerTiposContacto();
  return JSON.stringify(tipos, null, 2);
}

/**
 * Importar tipos de contacto desde JSON
 * @param jsonData - String JSON con los tipos de contacto
 * @param sobrescribir - Si true, reemplaza todos los tipos existentes. Si false, agrega sin duplicar
 */
export function importarTiposContacto(jsonData: string, sobrescribir: boolean = false): { success: boolean; message: string; count: number } {
  try {
    const tiposImportados: TipoContactoPersonalizado[] = JSON.parse(jsonData);
    
    if (!Array.isArray(tiposImportados)) {
      return { success: false, message: 'Format JSON invalide', count: 0 };
    }
    
    // Validar estructura de cada tipo
    const tiposValidos = tiposImportados.filter(tipo => 
      tipo.code && tipo.label && tipo.icon && tipo.color && tipo.bgColor
    );
    
    if (tiposValidos.length === 0) {
      return { success: false, message: 'Aucun type valide trouvé dans le JSON', count: 0 };
    }
    
    if (sobrescribir) {
      // Reemplazar todos los tipos existentes
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tiposValidos));
      console.log(`✅ ${tiposValidos.length} tipos de contacto importados (sobrescribiendo existentes)`);
      return { success: true, message: `${tiposValidos.length} types importés avec succès (remplacé)`, count: tiposValidos.length };
    } else {
      // Agregar sin duplicar
      const tiposExistentes = obtenerTiposContacto();
      const codigosExistentes = new Set(tiposExistentes.map(t => t.code));
      
      const tiposNuevos = tiposValidos.filter(tipo => !codigosExistentes.has(tipo.code));
      
      if (tiposNuevos.length === 0) {
        return { success: false, message: 'Tous les types importés existent déjà', count: 0 };
      }
      
      const tiposCombinados = [...tiposExistentes, ...tiposNuevos];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tiposCombinados));
      console.log(`✅ ${tiposNuevos.length} nuevos tipos de contacto agregados (total: ${tiposCombinados.length})`);
      return { success: true, message: `${tiposNuevos.length} nouveaux types ajoutés avec succès`, count: tiposNuevos.length };
    }
  } catch (error) {
    console.error('❌ Error al importar tipos de contacto:', error);
    return { success: false, message: 'Erreur lors de l\'importation: ' + (error as Error).message, count: 0 };
  }
}

/**
 * Obtener estadísticas de los tipos de contacto
 */
export function obtenerEstadisticasTipos(): {
  total: number;
  predefinidos: number;
  personalizados: number;
  fechaCreacionMasAntigua: string | null;
  fechaCreacionMasReciente: string | null;
} {
  const tipos = obtenerTiposContacto();
  const conFecha = tipos.filter(t => t.dateCreated);
  
  return {
    total: tipos.length,
    predefinidos: tipos.filter(t => t.isPredefined).length,
    personalizados: tipos.filter(t => !t.isPredefined).length,
    fechaCreacionMasAntigua: conFecha.length > 0 
      ? conFecha.reduce((min, t) => t.dateCreated < min ? t.dateCreated : min, conFecha[0].dateCreated)
      : null,
    fechaCreacionMasReciente: conFecha.length > 0
      ? conFecha.reduce((max, t) => t.dateCreated > max ? t.dateCreated : max, conFecha[0].dateCreated)
      : null
  };
}

/**
 * NUEVO: Obtener estadísticas por departamento
 */
export function obtenerEstadisticasPorDepartamento(departamentoId?: string): {
  total: number;
  globales: number;
  especificos: number;
  porDepartamento: { [key: string]: number };
} {
  const todosTipos = obtenerTiposContacto();
  const tiposDepartamento = departamentoId ? obtenerTiposContacto(departamentoId) : todosTipos;
  
  // Contar tipos por departamento
  const porDepartamento: { [key: string]: number } = {};
  todosTipos.forEach(tipo => {
    const deptId = tipo.departamentoId || 'global';
    porDepartamento[deptId] = (porDepartamento[deptId] || 0) + 1;
  });
  
  return {
    total: tiposDepartamento.length,
    globales: todosTipos.filter(t => !t.departamentoId).length,
    especificos: todosTipos.filter(t => t.departamentoId).length,
    porDepartamento
  };
}

/**
 * NUEVO: Convertir tipo específico en global
 */
export function convertirTipoAGlobal(tipoId: string): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const tipos: TipoContactoPersonalizado[] = stored ? JSON.parse(stored) : [];
    const index = tipos.findIndex(t => t.id === tipoId);
    
    if (index !== -1) {
      tipos[index].departamentoId = undefined;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tipos));
      console.log(`✅ Tipo "${tipos[index].label}" convertido a global`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al convertir tipo a global:', error);
    return false;
  }
}

/**
 * NUEVO: Convertir tipo global en específico de un departamento
 */
export function convertirTipoAEspecifico(tipoId: string, departamentoId: string): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const tipos: TipoContactoPersonalizado[] = stored ? JSON.parse(stored) : [];
    const index = tipos.findIndex(t => t.id === tipoId);
    
    if (index !== -1) {
      tipos[index].departamentoId = departamentoId;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tipos));
      console.log(`✅ Tipo "${tipos[index].label}" asignado al departamento ${departamentoId}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al convertir tipo a específico:', error);
    return false;
  }
}

/**
 * NUEVO: Duplicar tipo de un departamento a otro
 */
export function duplicarTipoADepartamento(
  tipoId: string, 
  departamentoIdDestino: string
): TipoContactoPersonalizado | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const tipos: TipoContactoPersonalizado[] = stored ? JSON.parse(stored) : [];
    const tipoOriginal = tipos.find(t => t.id === tipoId);
    
    if (!tipoOriginal) return null;
    
    // Crear una copia con nuevo ID y departamento
    const nuevoCodigo = `${tipoOriginal.code}-${departamentoIdDestino}`;
    const tipoDuplicado: TipoContactoPersonalizado = {
      ...tipoOriginal,
      id: `tipo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      code: nuevoCodigo,
      departamentoId: departamentoIdDestino,
      dateCreated: new Date().toISOString()
    };
    
    tipos.push(tipoDuplicado);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tipos));
    
    console.log(`✅ Tipo duplicado a departamento ${departamentoIdDestino}`);
    return tipoDuplicado;
  } catch (error) {
    console.error('Error al duplicar tipo:', error);
    return null;
  }
}