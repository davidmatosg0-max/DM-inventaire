type QRRecord = Record<string, unknown>;

export interface ComandaQRPayload {
  tipo: 'comanda';
  id: string;
  comanda: string;
  organismo?: string;
  fecha?: string;
  items?: number;
}

export const COMANDA_QR_SVG_LEVEL = 'H' as const;
export const COMANDA_QR_DATA_URL_OPTIONS = {
  errorCorrectionLevel: 'H' as const,
  margin: 2,
  color: {
    dark: '#000000',
    light: '#FFFFFF',
  },
};

interface BuildComandaQRInput {
  numeroComanda: string;
  organismo?: string;
  fecha?: string;
  items?: number;
  organismoId?: string;
  totalUnidades?: number;
  fechaEntrega?: string;
}

function getRecord(value: unknown): QRRecord | undefined {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as QRRecord;
  }

  return undefined;
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

function getNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function hasProductShape(record?: QRRecord): boolean {
  if (!record) {
    return false;
  }

  return Boolean(
    getString(record.codigo) ||
    getString(record.producto) ||
    getString(record.nombre) ||
    getString(record.lote) ||
    getString(record.ubicacion) ||
    getString(record.fecha_vencimiento) ||
    getString(record.fechaVencimiento)
  );
}

export function buildComandaQRPayload(input: BuildComandaQRInput): ComandaQRPayload {
  const numeroComanda = input.numeroComanda.trim();
  const fecha = input.fecha || input.fechaEntrega;
  const items = Number.isFinite(input.items) ? input.items : 0;

  return {
    tipo: 'comanda',
    id: numeroComanda,
    comanda: numeroComanda,
    organismo: input.organismo,
    fecha,
    items,
  };
}

export function buildComandaQRData(input: BuildComandaQRInput): string {
  return JSON.stringify(buildComandaQRPayload(input));
}

export function normalizeScannedComandaQR(value: unknown): ComandaQRPayload | null {
  const record = getRecord(value);
  if (!record) {
    const text = getString(value);
    if (!text) {
      return null;
    }

    return buildComandaQRPayload({ numeroComanda: text });
  }

  const nested = getRecord(record.datos);
  const explicitType = getString(record.tipo) || getString(nested?.tipo);

  if (explicitType && explicitType !== 'comanda') {
    return null;
  }

  if (!explicitType && (hasProductShape(record) || hasProductShape(nested))) {
    return null;
  }

  const numeroComanda =
    getString(record.comanda) ||
    getString(record.numeroComanda) ||
    getString(record.id) ||
    getString(record.text) ||
    getString(nested?.comanda) ||
    getString(nested?.numeroComanda) ||
    getString(nested?.id) ||
    getString(nested?.text);

  if (!numeroComanda) {
    return null;
  }

  return buildComandaQRPayload({
    numeroComanda,
    organismo: getString(record.organismo) || getString(nested?.organismo),
    fecha:
      getString(record.fecha) ||
      getString(record.fechaEntrega) ||
      getString(nested?.fecha) ||
      getString(nested?.fechaEntrega),
    items:
      getNumber(record.items) ||
      getNumber(record.totalItems) ||
      getNumber(nested?.items) ||
      getNumber(nested?.totalItems),
    organismoId: getString(record.organismoId) || getString(nested?.organismoId),
    totalUnidades:
      getNumber(record.totalUnidades) ||
      getNumber(nested?.totalUnidades),
    fechaEntrega:
      getString(record.fechaEntrega) ||
      getString(nested?.fechaEntrega),
  });
}