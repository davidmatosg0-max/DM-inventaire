import { queueStorageSync } from './cloudPersistence';
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

  return {
    id: String(organismo.id || fallbackId || generarIdOrganismoRecrutement()).trim(),
    ...payloadNormalizado,
    claveAcceso: String(organismo.claveAcceso || '').trim() || payloadNormalizado.claveAcceso,
    zona: String(organismo.zona || '').trim() || payloadNormalizado.zona,
    fechaCreacion: String(organismo.fechaCreacion || now),
    fechaModificacion: String(organismo.fechaModificacion || now),
  };
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
    const organismos = JSON.parse(raw) as Partial<OrganismoRecrutement>[];
    return organismos
      .map((organismo) => sanitizarOrganismoRecrutement(organismo))
      .sort((left, right) => left.nombre.localeCompare(right.nombre, 'fr'));
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

  const organismoNormalizado = sanitizarOrganismoRecrutement({
    ...organismo,
    id: organismo.id || existente?.id || generarIdOrganismoRecrutement(),
    fechaCreacion: existente?.fechaCreacion || now,
    fechaModificacion: now,
  });

  const actualizados = existente
    ? organismos.map((item) => (item.id === organismoNormalizado.id ? organismoNormalizado : item))
    : [...organismos, organismoNormalizado];

  persistirOrganismos(actualizados.sort((left, right) => left.nombre.localeCompare(right.nombre, 'fr')));
  return organismoNormalizado;
}

export function eliminarOrganismoRecrutement(id: string): void {
  const organismos = obtenerOrganismosRecrutement();
  const actualizados = organismos.filter((organismo) => organismo.id !== id);
  persistirOrganismos(actualizados);
}