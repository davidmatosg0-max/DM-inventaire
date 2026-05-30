import { queueStorageSync } from './cloudPersistence';
import { generarClaveAccesoUnica, normalizarClaveAcceso } from './claveAcceso';
import { construirPayloadOrganismo, convertirOrganismoAFormulario } from './organismoForm';
import type { Organismo } from './organismosStorage';

export interface OrganismoRecrutement extends Organismo {}

const STORAGE_KEY = 'recrutement_organismes_banco_alimentos';
export const RECRUTEMENT_ORGANISMES_UPDATED_EVENT = 'recrutement-organismes-actualizados';

function generarIdOrganismoRecrutement(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `recr-org-${crypto.randomUUID()}`;
  }

  return `recr-org-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizarOrganismoRecrutement(
  organismo: Partial<OrganismoRecrutement>,
  fallbackId?: string,
): OrganismoRecrutement {
  const now = new Date().toISOString();
  const payloadNormalizado = construirPayloadOrganismo(convertirOrganismoAFormulario(organismo));
  const claveAcceso = normalizarClaveAcceso(String(organismo.claveAcceso || '').trim() || String(payloadNormalizado.claveAcceso || '').trim());

  return {
    id: String(organismo.id || fallbackId || generarIdOrganismoRecrutement()).trim(),
    ...payloadNormalizado,
    claveAcceso: claveAcceso || undefined,
    zona: String(organismo.zona || '').trim() || payloadNormalizado.zona,
    fechaCreacion: String(organismo.fechaCreacion || now),
    fechaModificacion: String(organismo.fechaModificacion || now),
  };
}

function asignarClavesAccesoFaltantes(
  organismos: OrganismoRecrutement[],
): { organismos: OrganismoRecrutement[]; actualizados: number } {
  const clavesExistentes = new Set(
    organismos
      .map((organismo) => normalizarClaveAcceso(organismo.claveAcceso || ''))
      .filter(Boolean),
  );

  let actualizados = 0;

  const organismosConClave = organismos.map((organismo) => {
    if (normalizarClaveAcceso(organismo.claveAcceso || '')) {
      return organismo;
    }

    const nuevaClave = generarClaveAccesoUnica(organismo.nombre || 'Organisme', Array.from(clavesExistentes));
    clavesExistentes.add(normalizarClaveAcceso(nuevaClave));
    actualizados += 1;

    return {
      ...organismo,
      claveAcceso: nuevaClave,
      fechaModificacion: new Date().toISOString(),
    };
  });

  return { organismos: organismosConClave, actualizados };
}

function emitirCambioOrganismosRecrutement(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(RECRUTEMENT_ORGANISMES_UPDATED_EVENT));
}

function persistirOrganismos(organismos: OrganismoRecrutement[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(organismos));
  queueStorageSync(STORAGE_KEY);
  emitirCambioOrganismosRecrutement();
}

export function obtenerOrganismosRecrutement(): OrganismoRecrutement[] {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const organismos = (JSON.parse(raw) as Partial<OrganismoRecrutement>[])
      .map((organismo) => sanitizarOrganismoRecrutement(organismo))
      .sort((left, right) => left.nombre.localeCompare(right.nombre, 'fr'));

    const { organismos: organismosConClave, actualizados } = asignarClavesAccesoFaltantes(organismos);

    if (actualizados > 0) {
      persistirOrganismos(organismosConClave);
    }

    return organismosConClave;
  } catch (error) {
    console.error('Erreur lors de la lecture des organismes de recrutement:', error);
    return [];
  }
}

export function guardarOrganismoRecrutement(
  organismo: Omit<OrganismoRecrutement, 'id' | 'fechaCreacion' | 'fechaModificacion'> & { id?: string },
): OrganismoRecrutement {
  const organismos = obtenerOrganismosRecrutement();
  const now = new Date().toISOString();
  const existente = organismo.id ? organismos.find((item) => item.id === organismo.id) : undefined;

  const organismoNormalizadoBase = sanitizarOrganismoRecrutement({
    ...organismo,
    claveAcceso: organismo.claveAcceso !== undefined ? organismo.claveAcceso : existente?.claveAcceso,
    zona: organismo.zona !== undefined ? organismo.zona : existente?.zona,
    id: organismo.id || existente?.id || generarIdOrganismoRecrutement(),
    fechaCreacion: existente?.fechaCreacion || now,
    fechaModificacion: now,
  });

  const organismoNormalizado = normalizarClaveAcceso(organismoNormalizadoBase.claveAcceso || '')
    ? organismoNormalizadoBase
    : {
        ...organismoNormalizadoBase,
        claveAcceso: generarClaveAccesoUnica(
          organismoNormalizadoBase.nombre || 'Organisme',
          organismos
            .filter((item) => item.id !== organismoNormalizadoBase.id)
            .map((item) => item.claveAcceso || ''),
        ),
      };

  const actualizados = existente
    ? organismos.map((item) => (item.id === organismoNormalizado.id ? organismoNormalizado : item))
    : [...organismos, organismoNormalizado];

  persistirOrganismos(actualizados.sort((left, right) => left.nombre.localeCompare(right.nombre, 'fr')));
  return organismoNormalizado;
}

export function reinicializarClaveAccesoOrganismoRecrutement(id: string): OrganismoRecrutement | null {
  const organismos = obtenerOrganismosRecrutement();
  const organismo = organismos.find((item) => item.id === id);

  if (!organismo) {
    return null;
  }

  const nuevaClave = generarClaveAccesoUnica(
    organismo.nombre || 'Organisme',
    organismos
      .filter((item) => item.id !== id)
      .map((item) => item.claveAcceso || ''),
  );

  return guardarOrganismoRecrutement({
    ...organismo,
    claveAcceso: nuevaClave,
    id: organismo.id,
  });
}

export function eliminarOrganismoRecrutement(id: string): void {
  const organismos = obtenerOrganismosRecrutement();
  const actualizados = organismos.filter((organismo) => organismo.id !== id);
  persistirOrganismos(actualizados);
}