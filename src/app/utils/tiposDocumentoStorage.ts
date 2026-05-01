/**
 * Sistema de gestión de tipos de documentos estandarizados
 * Permite mantener consistencia en los tipos de documentos a través de todos los contactos
 */

export interface TipoDocumento {
  id: string;
  code: string; // Identificador único (ej: 'contrat', 'casier-judiciaire')
  label: string; // Etiqueta visible (ej: 'Contrat de Travail')
  icon: string; // Emoji o icono
  color: string; // Color principal
  bgColor: string; // Color de fondo
  description?: string; // Descripción opcional
  isPredefined: boolean; // Si es un tipo predefinido del sistema
}

const STORAGE_KEY = 'banque_alimentaire_tipos_documento';
const PREDEFINED_KEY = 'banque_alimentaire_tipos_documento_predefined';

// Tipos de documentos predefinidos - DESHABILITADOS
// Ya no se inicializan automáticamente
const TIPOS_DOCUMENTO_PREDEFINIDOS: Omit<TipoDocumento, 'id'>[] = [];

// Colores disponibles para tipos personalizados
export const COLORES_DOCUMENTO_DISPONIBLES = [
  { name: 'Bleu Marine', value: '#1a4d7a', bg: '#E3F2FD' },
  { name: 'Vert', value: '#2d9561', bg: '#E8F5E9' },
  { name: 'Orange', value: '#F59E0B', bg: '#FFF3E0' },
  { name: 'Violet', value: '#8B5CF6', bg: '#F3E8FF' },
  { name: 'Bleu', value: '#3B82F6', bg: '#DBEAFE' },
  { name: 'Rose', value: '#EC4899', bg: '#FCE7F3' },
  { name: 'Rouge', value: '#EF4444', bg: '#FEE2E2' },
  { name: 'Vert Clair', value: '#10B981', bg: '#D1FAE5' },
  { name: 'Cyan', value: '#06B6D4', bg: '#CFFAFE' },
  { name: 'Gris', value: '#6B7280', bg: '#F3F4F6' }
];

/**
 * Inicializa los tipos de documentos predefinidos si no existen
 * ❌ DESHABILITADO: Ya no inicializa automáticamente
 */
function inicializarTiposDocumento(): void {
  // Esta función ya no inicializa tipos automáticamente
  // El sistema empieza completamente vacío después de la limpieza
  return;
}

/**
 * Obtiene todos los tipos de documentos
 */
export function obtenerTiposDocumento(): TipoDocumento[] {
  // Ya NO llama a inicializarTiposDocumento()
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Obtiene un tipo de documento por su código
 */
export function obtenerTipoDocumentoPorCodigo(code: string): TipoDocumento | undefined {
  const tipos = obtenerTiposDocumento();
  return tipos.find(t => t.code === code);
}

/**
 * Guarda un nuevo tipo de documento personalizado
 */
export function guardarTipoDocumento(tipo: Omit<TipoDocumento, 'id' | 'isPredefined'>): TipoDocumento {
  const tipos = obtenerTiposDocumento();
  const nuevoTipo: TipoDocumento = {
    ...tipo,
    id: `tipo-doc-custom-${Date.now()}`,
    isPredefined: false
  };
  tipos.push(nuevoTipo);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tipos));
  return nuevoTipo;
}

/**
 * Actualiza un tipo de documento existente
 * IMPORTANTE: Esto afectará todos los documentos de este tipo en todos los contactos
 */
export function actualizarTipoDocumento(
  id: string,
  datosActualizados: Partial<Omit<TipoDocumento, 'id' | 'isPredefined'>>
): boolean {
  const tipos = obtenerTiposDocumento();
  const index = tipos.findIndex(t => t.id === id);
  
  if (index === -1) return false;
  
  const tipoAnterior = tipos[index];
  tipos[index] = { ...tipoAnterior, ...datosActualizados };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tipos));
  
  // Actualizar todos los contactos que usen este tipo de documento
  actualizarDocumentosEnContactos(tipoAnterior.code, tipos[index]);
  
  return true;
}

/**
 * Elimina un tipo de documento
 * ADVERTENCIA: Los documentos existentes de este tipo mantendrán su información
 * pero no estarán sincronizados con el tipo eliminado
 */
export function eliminarTipoDocumento(id: string): boolean {
  const tipos = obtenerTiposDocumento();
  const tiposFiltrados = tipos.filter(t => t.id !== id);
  
  if (tiposFiltrados.length === tipos.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tiposFiltrados));
  return true;
}

/**
 * Verifica si un código de tipo ya existe
 */
export function existeCodigoTipoDocumento(code: string, excludeId?: string): boolean {
  const tipos = obtenerTiposDocumento();
  return tipos.some(t => t.code === code && t.id !== excludeId);
}

/**
 * Restablece los tipos predefinidos a sus valores por defecto
 */
export function restablecerTiposPredefinidos(): void {
  const tiposConId: TipoDocumento[] = TIPOS_DOCUMENTO_PREDEFINIDOS.map((tipo, index) => ({
    ...tipo,
    id: `tipo-doc-${Date.now()}-${index}`
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tiposConId));
  localStorage.setItem(PREDEFINED_KEY, JSON.stringify(tiposConId));
}

/**
 * Guarda la configuración actual como predeterminada
 */
export function guardarConfiguracionActualComoPredeterminada(): void {
  const tiposActuales = obtenerTiposDocumento();
  localStorage.setItem(PREDEFINED_KEY, JSON.stringify(tiposActuales));
}

/**
 * Actualiza todos los documentos de un tipo en todos los contactos
 * Esto mantiene la sincronización cuando se modifica un tipo de documento
 */
function actualizarDocumentosEnContactos(codigoTipo: string, nuevoTipo: TipoDocumento): void {
  // Obtener todos los contactos del localStorage
  const contactosKey = 'banque_alimentaire_contactos_departamento';
  const stored = localStorage.getItem(contactosKey);
  
  if (!stored) return;
  
  const contactos = JSON.parse(stored);
  let huboActualizaciones = false;
  
  // Actualizar cada contacto que tenga documentos de este tipo
  contactos.forEach((contacto: any) => {
    if (contacto.documents && Array.isArray(contacto.documents)) {
      contacto.documents.forEach((doc: any) => {
        if (doc.tipo === codigoTipo) {
          // Actualizar la etiqueta del tipo
          doc.tipoLabel = nuevoTipo.label;
          doc.tipoColor = nuevoTipo.color;
          doc.tipoBgColor = nuevoTipo.bgColor;
          doc.tipoIcon = nuevoTipo.icon;
          huboActualizaciones = true;
        }
      });
    }
  });
  
  // Guardar los contactos actualizados
  if (huboActualizaciones) {
    localStorage.setItem(contactosKey, JSON.stringify(contactos));
  }
}