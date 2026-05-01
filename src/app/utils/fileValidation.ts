/**
 * 🔧 UTILIDADES DE VALIDACIÓN DE ARCHIVOS
 * Funciones centralizadas para validar tamaños y tipos de archivos
 */

import { toast } from 'sonner';

// Constantes de tamaño
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
export const RECOMMENDED_IMAGE_SIZE = 500 * 1024; // 500KB
export const MAX_DOCUMENT_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Formatea bytes a una cadena legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}

/**
 * Valida una imagen antes de procesarla
 * @param file - Archivo a validar
 * @param maxSize - Tamaño máximo permitido en bytes (default: 2MB)
 * @param showWarning - Mostrar advertencia si es grande pero válido (default: true)
 * @returns true si el archivo es válido, false en caso contrario
 */
export function validateImageFile(
  file: File,
  maxSize: number = MAX_IMAGE_SIZE,
  showWarning: boolean = true
): boolean {
  if (!file) return false;

  // Validar que sea una imagen
  if (!file.type.startsWith('image/')) {
    toast.error('Le fichier doit être une image');
    return false;
  }

  // Validar tamaño
  if (file.size > maxSize) {
    toast.error(
      `Image trop grande (${formatFileSize(file.size)}). Maximum: ${formatFileSize(maxSize)}`
    );
    return false;
  }

  // Advertencia si es grande pero aceptable
  if (showWarning && file.size > RECOMMENDED_IMAGE_SIZE && file.size <= maxSize) {
    toast.warning(
      `Image volumineuse (${formatFileSize(file.size)}). Recommandé: moins de ${formatFileSize(RECOMMENDED_IMAGE_SIZE)}`
    );
  }

  return true;
}

/**
 * Valida un documento antes de procesarlo
 * @param file - Archivo a validar
 * @param allowedTypes - Tipos MIME permitidos
 * @param maxSize - Tamaño máximo permitido en bytes (default: 2MB)
 * @returns true si el archivo es válido, false en caso contrario
 */
export function validateDocumentFile(
  file: File,
  allowedTypes: string[] = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
  maxSize: number = MAX_DOCUMENT_SIZE
): boolean {
  if (!file) return false;

  // Validar tipo
  if (!allowedTypes.includes(file.type)) {
    const extensions = allowedTypes
      .map((type) => type.split('/')[1].toUpperCase())
      .join(', ');
    toast.error(`Format non accepté. Formats autorisés: ${extensions}`);
    return false;
  }

  // Validar tamaño
  if (file.size > maxSize) {
    toast.error(
      `Fichier trop grand (${formatFileSize(file.size)}). Maximum: ${formatFileSize(maxSize)}`
    );
    return false;
  }

  return true;
}

/**
 * Lee un archivo como Data URL con validación integrada
 * @param file - Archivo a leer
 * @param onSuccess - Callback cuando se lee exitosamente
 * @param onError - Callback cuando hay un error
 * @param validator - Función de validación personalizada (opcional)
 */
export function readFileAsDataURL(
  file: File,
  onSuccess: (dataUrl: string) => void,
  onError?: (error: Error) => void,
  validator?: (file: File) => boolean
): void {
  // Validar archivo si se proporciona validador
  if (validator && !validator(file)) {
    onError?.(new Error('Validation failed'));
    return;
  }

  const reader = new FileReader();
  
  reader.onload = (event) => {
    const result = event.target?.result;
    if (typeof result === 'string') {
      onSuccess(result);
    } else {
      onError?.(new Error('Failed to read file as string'));
    }
  };
  
  reader.onerror = () => {
    toast.error('Erreur lors de la lecture du fichier');
    onError?.(new Error('FileReader error'));
  };
  
  reader.readAsDataURL(file);
}
