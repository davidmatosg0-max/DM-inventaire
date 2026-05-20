import { getOfflineStorage } from './offlineStorage';

const STORE_NAME = 'cache';
const STORAGE_KEY_PREFIX = 'messagerie-attachment:';
const REFERENCE_PREFIX = 'idb:messagerie-attachment:';

interface MessagerieAttachmentStoredData {
  contenido: string;
  type: string;
}

function construirStorageKey(attachmentId: string): string {
  return `${STORAGE_KEY_PREFIX}${attachmentId}`;
}

function extraerAttachmentId(referencia: string): string | null {
  if (!referencia.startsWith(REFERENCE_PREFIX)) {
    return null;
  }

  const attachmentId = referencia.slice(REFERENCE_PREFIX.length).trim();
  return attachmentId || null;
}

export function crearIdAdjuntoMessagerie(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `messagerie-attachment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function crearReferenciaAdjuntoMessagerie(attachmentId: string): string {
  return `${REFERENCE_PREFIX}${attachmentId}`;
}

export function esReferenciaAdjuntoMessagerie(valor: string | null | undefined): boolean {
  return typeof valor === 'string' && valor.startsWith(REFERENCE_PREFIX);
}

export async function guardarContenidoAdjuntoMessagerie(attachmentId: string, contenido: string, type: string): Promise<void> {
  await getOfflineStorage().set<MessagerieAttachmentStoredData>(
    STORE_NAME,
    construirStorageKey(attachmentId),
    { contenido, type },
    'messagerie-attachment',
  );
}

export async function obtenerContenidoAdjuntoMessagerie(referencia: string): Promise<MessagerieAttachmentStoredData | null> {
  const attachmentId = extraerAttachmentId(referencia);

  if (!attachmentId) {
    return null;
  }

  const stored = await getOfflineStorage().get<MessagerieAttachmentStoredData>(STORE_NAME, construirStorageKey(attachmentId));
  return stored || null;
}

export async function eliminarAdjuntoMessagerie(referencia: string): Promise<void> {
  const attachmentId = extraerAttachmentId(referencia);

  if (!attachmentId) {
    return;
  }

  await getOfflineStorage().delete(STORE_NAME, construirStorageKey(attachmentId));
}

export async function eliminarAdjuntosMessagerie(referencias: string[]): Promise<void> {
  const keys = referencias
    .map((referencia) => extraerAttachmentId(referencia))
    .filter((attachmentId): attachmentId is string => Boolean(attachmentId))
    .map((attachmentId) => construirStorageKey(attachmentId));

  if (keys.length === 0) {
    return;
  }

  await getOfflineStorage().deleteMany(STORE_NAME, keys);
}
