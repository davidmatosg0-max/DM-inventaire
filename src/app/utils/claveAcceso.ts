// Utilidad para generar claves de acceso únicas para organismos

function obtenerInicialesClave(nombreOrganismo: string): string {
  const palabras = nombreOrganismo
    .toUpperCase()
    .split(' ')
    .filter(p => p.length > 2);

  if (palabras.length >= 3) {
    return palabras[0][0] + palabras[1][0] + palabras[2][0];
  }

  if (palabras.length === 2) {
    return palabras[0][0] + palabras[1][0] + (palabras[1][1] || palabras[1][0]);
  }

  if (palabras.length === 1) {
    return palabras[0].substring(0, 3);
  }

  return 'ORG';
}

function generarCodigoClave(): string {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo = '';

  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }

  return codigo;
}

export function normalizarClaveAcceso(clave: string): string {
  return clave.toUpperCase().trim().replace(/\s+/g, '');
}

/**
 * Genera una clave de acceso única basada en las iniciales del organismo
 * Formato: XXX-XXXXXX (3 letras - 6 caracteres alfanuméricos)
 */
export function generarClaveAcceso(nombreOrganismo: string): string {
  return `${obtenerInicialesClave(nombreOrganismo)}-${generarCodigoClave()}`;
}

export function generarClaveAccesoUnica(nombreOrganismo: string, clavesExistentes: string[]): string {
  const clavesNormalizadas = new Set(
    clavesExistentes
      .map(clave => normalizarClaveAcceso(clave || ''))
      .filter(Boolean)
  );

  for (let intento = 0; intento < 50; intento++) {
    const clave = generarClaveAcceso(nombreOrganismo);
    if (!clavesNormalizadas.has(normalizarClaveAcceso(clave))) {
      return clave;
    }
  }

  throw new Error("Impossible de générer une clé d'accès unique");
}

/**
 * Valida el formato de una clave de acceso
 */
export function validarClaveAcceso(clave: string): boolean {
  // Formato: 3 letras - 6 caracteres alfanuméricos
  const regex = /^[A-Z]{3}-[A-Z0-9]{6}$/;
  return regex.test(normalizarClaveAcceso(clave));
}

/**
 * Formatea una clave para mostrarla de forma legible
 */
export function formatearClaveAcceso(clave: string): string {
  return normalizarClaveAcceso(clave).replace(/[^A-Z0-9-]/g, '');
}
