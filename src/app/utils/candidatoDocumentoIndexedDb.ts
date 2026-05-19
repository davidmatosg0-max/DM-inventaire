import { getOfflineStorage } from './offlineStorage';

const STORE_NAME = 'contacts';
const STORAGE_KEY_PREFIX = 'candidate-document:';
const REFERENCE_PREFIX = 'idb:candidate-document:';

interface CandidateDocumentStoredData {
  contenido: string;
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

export function crearIdDocumentoCandidato(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `candidate-document-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function crearReferenciaDocumentoCandidato(documentoId: string): string {
  return `${REFERENCE_PREFIX}${documentoId}`;
}

export function esReferenciaDocumentoCandidato(valor: string | null | undefined): boolean {
  return typeof valor === 'string' && valor.startsWith(REFERENCE_PREFIX);
}

export async function guardarContenidoDocumentoCandidato(documentoId: string, contenido: string): Promise<void> {
  await getOfflineStorage().set<CandidateDocumentStoredData>(
    STORE_NAME,
    construirStorageKey(documentoId),
    { contenido },
    'candidate-document',
  );
}

export async function obtenerContenidoDocumentoCandidato(referencia: string): Promise<string | null> {
  const documentoId = extraerDocumentoId(referencia);

  if (!documentoId) {
    return null;
  }

  const stored = await getOfflineStorage().get<CandidateDocumentStoredData>(STORE_NAME, construirStorageKey(documentoId));
  return stored?.contenido || null;
}

export async function eliminarContenidosDocumentoCandidato(referencias: string[]): Promise<void> {
  const keys = referencias
    .map((referencia) => extraerDocumentoId(referencia))
    .filter((documentoId): documentoId is string => Boolean(documentoId))
    .map((documentoId) => construirStorageKey(documentoId));

  if (keys.length === 0) {
    return;
  }

  await getOfflineStorage().deleteMany(STORE_NAME, keys);
}