import type { Comanda } from '../types';

export type ModalidadDistribucionComanda = 'standard' | 'collation' | 'grupo';

export function resolverModalidadDistribucionComanda(
  comanda?: Partial<Pick<Comanda, 'modalidadDistribucion' | 'observaciones' | 'grupoDistribucionId'>> | null
): ModalidadDistribucionComanda {
  if (comanda?.modalidadDistribucion === 'standard' || comanda?.modalidadDistribucion === 'collation' || comanda?.modalidadDistribucion === 'grupo') {
    return comanda.modalidadDistribucion;
  }

  if (typeof comanda?.observaciones === 'string' && comanda.observaciones.trimStart().startsWith('Distribution Collation')) {
    return 'collation';
  }

  if (comanda?.grupoDistribucionId) {
    return 'grupo';
  }

  return 'standard';
}

export function obtenerEtiquetaModalidadDistribucion(modalidad: ModalidadDistribucionComanda): string {
  switch (modalidad) {
    case 'collation':
      return 'Collation';
    case 'grupo':
      return 'Groupe';
    default:
      return 'Standard';
  }
}