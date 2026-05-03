/**
 * Utilidades para generación de códigos de barras
 */

/**
 * Genera un código de barras EAN-13 (13 dígitos)
 * Formato: Prefijo (3) + Código de empresa (4) + Código de producto (5) + Dígito verificador (1)
 */
export function generarCodigoBarrasEAN13(productoId: string): string {
  // Prefijo para productos del banco de alimentos: 200 (uso interno)
  const prefijo = '200';
  
  // Código de empresa (4 dígitos) - Usamos un código fijo para el banco
  const codigoEmpresa = '1001';
  
  // Código de producto (5 dígitos) - Convertimos el ID del producto
  const numeroProducto = parseInt(productoId) || 1;
  // IMPORTANTE: Truncar a 5 dígitos usando módulo para evitar códigos más largos
  const codigoProducto = (numeroProducto % 100000).toString().padStart(5, '0');
  
  // Primeros 12 dígitos
  const codigo12 = prefijo + codigoEmpresa + codigoProducto;
  
  // Calcular dígito verificador
  const digitoVerificador = calcularDigitoVerificadorEAN(codigo12);
  
  return codigo12 + digitoVerificador;
}

/**
 * Genera un código de barras CODE128 alfanumérico
 * Útil para lotes, ubicaciones, etc.
 */
export function generarCodigoBarrasAlfanumerico(prefix: string, id: string): string {
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}-${id}-${timestamp}`.toUpperCase();
}

/**
 * Genera código de barras para lote de producto
 */
export function generarCodigoLote(productoId: string, fechaVencimiento: string): string {
  // Validar que tengamos datos válidos
  if (!productoId || !fechaVencimiento) {
    const timestamp = Date.now().toString().slice(-8);
    return `LOT${timestamp}`;
  }
  
  const fecha = fechaVencimiento.replace(/-/g, '').slice(2); // YYMMDD
  const prodId = (parseInt(productoId) || 0).toString().padStart(4, '0').slice(-4); // Solo últimos 4 dígitos
  return `LOT${prodId}${fecha}`;
}

/**
 * Genera código de barras para ubicación en almacén
 */
export function generarCodigoUbicacion(ubicacion: string): string {
  // Validar que tengamos una ubicación válida
  if (!ubicacion || ubicacion.trim() === '') {
    return 'UBIC-DEFAULT';
  }
  
  // Convertir "Estantería A1" a "ESTA1"
  const partes = ubicacion.split(' ');
  if (partes.length >= 2) {
    const tipo = partes[0].substring(0, 3).toUpperCase();
    const codigo = partes[1].toUpperCase();
    return `${tipo}${codigo}`;
  }
  
  const limpio = ubicacion.replace(/\s/g, '').toUpperCase();
  return limpio.substring(0, 8) || 'UBIC-DEFAULT';
}

/**
 * Calcula el dígito verificador para código EAN-13
 */
function calcularDigitoVerificadorEAN(codigo12: string): string {
  let suma = 0;
  
  for (let i = 0; i < 12; i++) {
    const digito = parseInt(codigo12[i]);
    // Posiciones impares (0, 2, 4, 6, 8, 10) se multiplican por 1
    // Posiciones pares (1, 3, 5, 7, 9, 11) se multiplican por 3
    suma += i % 2 === 0 ? digito : digito * 3;
  }
  
  // El dígito verificador es el número que sumado da un múltiplo de 10
  const digitoVerificador = (10 - (suma % 10)) % 10;
  
  return digitoVerificador.toString();
}

/**
 * Valida un código de barras EAN-13
 */
export function validarCodigoEAN13(codigo: string): boolean {
  if (codigo.length !== 13) return false;
  if (!/^\d+$/.test(codigo)) return false;
  
  const codigo12 = codigo.substring(0, 12);
  const digitoCalculado = calcularDigitoVerificadorEAN(codigo12);
  
  return digitoCalculado === codigo[12];
}

/**
 * Valida un código de barras según su formato
 */
export function validarCodigoBarras(codigo: string, formato: string): boolean {
  if (!codigo || codigo.trim() === '') return false;
  
  switch (formato) {
    case 'EAN13':
      return /^\d{13}$/.test(codigo);
    case 'CODE128':
    case 'CODE39':
      return codigo.length > 0 && codigo.length <= 80;
    case 'UPC':
      return /^\d{12}$/.test(codigo);
    default:
      return codigo.length > 0;
  }
}

/**
 * Sanitiza un código de barras para asegurar que sea válido
 */
export function sanitizarCodigoBarras(codigo: string, formato: string = 'CODE128'): string {
  if (!codigo) return '';
  
  switch (formato) {
    case 'EAN13':
      // Asegurar que sea exactamente 13 dígitos
      const soloDigitos = codigo.replace(/\D/g, '');
      if (soloDigitos.length > 13) {
        return soloDigitos.substring(0, 13);
      }
      return soloDigitos.padStart(13, '0');
    
    case 'CODE128':
    case 'CODE39':
      // Remover caracteres no válidos y truncar si es muy largo
      return codigo.substring(0, 80);
    
    case 'UPC':
      // Asegurar que sea exactamente 12 dígitos
      const digitosUPC = codigo.replace(/\D/g, '');
      if (digitosUPC.length > 12) {
        return digitosUPC.substring(0, 12);
      }
      return digitosUPC.padStart(12, '0');
    
    default:
      return codigo;
  }
}

/**
 * Genera un código QR para producto (JSON con información completa)
 */
export function generarDatosQR(producto: {
  id: string;
  codigo: string;
  nombre: string;
  lote?: string;
  fechaVencimiento?: string;
  ubicacion?: string;
}) {
  return JSON.stringify({
    tipo: 'producto',
    id: producto.id,
    codigo: producto.codigo,
    nombre: producto.nombre,
    lote: producto.lote,
    fecha_vencimiento: producto.fechaVencimiento,
    ubicacion: producto.ubicacion,
    generado: new Date().toISOString()
  });
}

type QRRecord = Record<string, unknown>;

export interface ProductQRPayload {
  tipo: 'producto';
  id: string;
  codigo?: string;
  producto?: string;
  nombre?: string;
  lote?: string;
  fecha_vencimiento?: string;
  ubicacion?: string;
}

export interface LocationQRPayload {
  tipo: 'ubicacion';
  id: string;
  codigo: string;
  ubicacion: string;
  text?: string;
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

function normalizeLocationCandidate(value?: string): string {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

function resolveKnownLocationMatch(
  candidates: string[],
  knownLocations: string[]
): string | undefined {
  const normalizedCandidates = candidates
    .map(normalizeLocationCandidate)
    .filter(Boolean);

  return knownLocations.find((location) => {
    const normalizedLocation = normalizeLocationCandidate(location);
    const generatedCode = normalizeLocationCandidate(generarCodigoUbicacion(location));

    return normalizedCandidates.includes(normalizedLocation) || normalizedCandidates.includes(generatedCode);
  });
}

export function normalizeScannedLocationQR(
  value: unknown,
  knownLocations: string[] = []
): LocationQRPayload | null {
  const record = getRecord(value);

  if (!record) {
    const text = getString(value);
    const normalizedText = normalizeLocationCandidate(text);
    const matchedLocation = resolveKnownLocationMatch([normalizedText], knownLocations);

    if (!text || !matchedLocation) {
      return null;
    }

    return {
      tipo: 'ubicacion',
      id: matchedLocation,
      codigo: normalizedText,
      ubicacion: matchedLocation,
      text,
    };
  }

  const nested = getRecord(record.datos);
  const explicitType = getString(record.tipo) || getString(nested?.tipo);

  if (explicitType && explicitType !== 'ubicacion') {
    return null;
  }

  const text = getString(record.text) || getString(nested?.text);
  const codigo = getString(record.codigo) || getString(nested?.codigo) || text;
  const explicitLocation = getString(record.ubicacion) || getString(nested?.ubicacion);
  const id = getString(record.id) || getString(nested?.id) || codigo || explicitLocation;
  const candidates = [explicitLocation, codigo, text, id]
    .map(normalizeLocationCandidate)
    .filter(Boolean);

  const matchedLocation = resolveKnownLocationMatch(candidates, knownLocations);

  if (!matchedLocation) {
    if (explicitType !== 'ubicacion' || candidates.length === 0) {
      return null;
    }

    return {
      tipo: 'ubicacion',
      id: id || candidates[0],
      codigo: normalizeLocationCandidate(codigo || explicitLocation || id || candidates[0]),
      ubicacion: explicitLocation || codigo || id || candidates[0],
      text,
    };
  }

  return {
    tipo: 'ubicacion',
    id: matchedLocation,
    codigo: normalizeLocationCandidate(codigo || matchedLocation),
    ubicacion: matchedLocation,
    text,
  };
}

export function normalizeScannedProductQR(value: unknown): ProductQRPayload | null {
  const record = getRecord(value);

  if (!record) {
    const text = getString(value);
    if (!text) {
      return null;
    }

    return {
      tipo: 'producto',
      id: text,
      codigo: text,
      producto: text,
      nombre: text,
    };
  }

  const nested = getRecord(record.datos);
  const explicitType = getString(record.tipo) || getString(nested?.tipo);

  if (explicitType && explicitType !== 'producto') {
    return null;
  }

  const text = getString(record.text) || getString(nested?.text);
  const codigo = getString(record.codigo) || getString(nested?.codigo) || text;
  const nombre =
    getString(record.producto) ||
    getString(record.nombre) ||
    getString(nested?.producto) ||
    getString(nested?.nombre);
  const id =
    getString(record.id) ||
    getString(nested?.id) ||
    codigo ||
    nombre;

  if (!id) {
    return null;
  }

  return {
    tipo: 'producto',
    id,
    codigo,
    producto: nombre,
    nombre,
    lote: getString(record.lote) || getString(nested?.lote),
    fecha_vencimiento:
      getString(record.fecha_vencimiento) ||
      getString(record.fechaVencimiento) ||
      getString(nested?.fecha_vencimiento) ||
      getString(nested?.fechaVencimiento),
    ubicacion: getString(record.ubicacion) || getString(nested?.ubicacion),
  };
}

/**
 * Formatos de código de barras soportados
 */
export const FORMATOS_BARCODE = {
  EAN13: 'EAN13',      // Productos retail (13 dígitos)
  CODE128: 'CODE128',  // Alfanumérico general
  CODE39: 'CODE39',    // Alfanumérico simple
  UPC: 'UPC',          // Universal Product Code
} as const;

export type FormatoBarcode = typeof FORMATOS_BARCODE[keyof typeof FORMATOS_BARCODE];