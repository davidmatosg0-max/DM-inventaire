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