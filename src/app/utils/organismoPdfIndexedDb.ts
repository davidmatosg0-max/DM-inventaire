import { getOfflineStorage } from './offlineStorage';

const STORE_NAME = 'organisms';
const STORAGE_KEY_PREFIX = 'organismo-pdf:';
const REFERENCE_PREFIX = 'idb:organismo-pdf:';

interface OrganismoPdfStoredData {
  contenido: string;
  tipo: 'application/pdf';
}

function construirStorageKey(documentoId: string): string {
  return `${STORAGE_KEY_PREFIX}${documentoId}`;
}

function extraerDocumentoId(referencia: string): string | null {
  if (!referencia.startsWith(REFERENCE_PREFIX)) {
    return null;
  }

  const documentoId = referencia.slice(REFERENCE_PREFIX.length).trim();
  return documentoId || null;
}

export function crearReferenciaDocumentoPdfOrganismo(documentoId: string): string {
  return `${REFERENCE_PREFIX}${documentoId}`;
}

export function esReferenciaDocumentoPdfOrganismo(valor: string | null | undefined): boolean {
  return typeof valor === 'string' && valor.startsWith(REFERENCE_PREFIX);
}

export async function guardarContenidoDocumentoPdfOrganismo(documentoId: string, contenido: string): Promise<void> {
  await getOfflineStorage().set<OrganismoPdfStoredData>(
    STORE_NAME,
    construirStorageKey(documentoId),
    {
      contenido,
      tipo: 'application/pdf',
    },
    'organism-pdf',
  );
}

export async function obtenerContenidoDocumentoPdfOrganismo(referencia: string): Promise<string | null> {
  const documentoId = extraerDocumentoId(referencia);

  if (!documentoId) {
    return null;
  }

  const stored = await getOfflineStorage().get<OrganismoPdfStoredData>(STORE_NAME, construirStorageKey(documentoId));
  return stored?.contenido || null;
}

export async function eliminarContenidoDocumentoPdfOrganismo(referencia: string): Promise<void> {
  const documentoId = extraerDocumentoId(referencia);

  if (!documentoId) {
    return;
  }

  await getOfflineStorage().delete(STORE_NAME, construirStorageKey(documentoId));
}

export async function eliminarContenidosDocumentoPdfOrganismo(referencias: string[]): Promise<void> {
  const keys = referencias
    .map((referencia) => extraerDocumentoId(referencia))
    .filter((documentoId): documentoId is string => Boolean(documentoId))
    .map((documentoId) => construirStorageKey(documentoId));

  if (keys.length === 0) {
    return;
  }

  await getOfflineStorage().deleteMany(STORE_NAME, keys);
}