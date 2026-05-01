/**
 * Hook y utilidades para asegurar accesibilidad en Dialogs
 * 
 * Este archivo contiene utilidades para garantizar que todos los DialogContent
 * cumplan con los requisitos de accesibilidad (WCAG).
 */

import { DialogDescription } from '../ui/dialog';

/**
 * Genera un ID único para aria-describedby
 */
export function generarIdDescripcion(prefijo: string = 'dialog'): string {
  return `${prefijo}-description-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Descripción por defecto invisible para accesibilidad
 * 
 * Usar cuando no se necesita una descripción visible pero se requiere
 * cumplir con requisitos de accesibilidad.
 * 
 * USO:
 * ```tsx
 * <DialogContent aria-describedby="my-dialog-desc">
 *   <DialogHeader>
 *     <DialogTitle>Título</DialogTitle>
 *     <DialogDescriptionHidden id="my-dialog-desc">
 *       Descripción para lectores de pantalla
 *     </DialogDescriptionHidden>
 *   </DialogHeader>
 *   ...
 * </DialogContent>
 * ```
 */
export function DialogDescriptionHidden({ 
  id, 
  children 
}: { 
  id: string; 
  children: React.ReactNode 
}) {
  return (
    <DialogDescription id={id} className="sr-only">
      {children}
    </DialogDescription>
  );
}

/**
 * Verifica si un Dialog tiene descripción
 */
export function validarDialogAccesibilidad(
  hasDescription: boolean,
  hasAriaDescribedby: boolean
): { valido: boolean; mensaje?: string } {
  if (!hasDescription && !hasAriaDescribedby) {
    return {
      valido: false,
      mensaje: 'DialogContent requiere DialogDescription o aria-describedby para accesibilidad'
    };
  }
  return { valido: true };
}

/**
 * Props estándar para DialogContent con accesibilidad
 */
export interface DialogContentAccessibleProps {
  id: string;
  'aria-describedby': string;
  className?: string;
}

/**
 * Genera props para DialogContent con accesibilidad
 */
export function getDialogContentProps(
  id: string = generarIdDescripcion()
): DialogContentAccessibleProps {
  return {
    id,
    'aria-describedby': `${id}-description`,
  };
}
