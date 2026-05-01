// Utilidad para generar claves de acceso únicas para organismos

/**
 * Genera una clave de acceso única basada en las iniciales del organismo
 * Formato: XXX-XXXXXX (3 letras - 6 caracteres alfanuméricos)
 */
export function generarClaveAcceso(nombreOrganismo: string): string {
  // Obtener iniciales del nombre (primeras 3 letras de palabras significativas)
  const palabras = nombreOrganismo
    .toUpperCase()
    .split(' ')
    .filter(p => p.length > 2); // Filtrar palabras cortas como "de", "la", "el"
  
  let iniciales = '';
  if (palabras.length >= 3) {
    iniciales = palabras[0][0] + palabras[1][0] + palabras[2][0];
  } else if (palabras.length === 2) {
    iniciales = palabras[0][0] + palabras[1][0] + palabras[1][1];
  } else if (palabras.length === 1) {
    iniciales = palabras[0].substring(0, 3);
  }
  
  // Generar código alfanumérico aleatorio de 6 caracteres
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin I, O, 0, 1 para evitar confusión
  let codigo = '';
  
  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  
  return `${iniciales}-${codigo}`;
}

/**
 * Valida el formato de una clave de acceso
 */
export function validarClaveAcceso(clave: string): boolean {
  // Formato: 3 letras - 6 caracteres alfanuméricos
  const regex = /^[A-Z]{3}-[A-Z0-9]{6}$/;
  return regex.test(clave);
}

/**
 * Formatea una clave para mostrarla de forma legible
 */
export function formatearClaveAcceso(clave: string): string {
  return clave.toUpperCase().replace(/[^A-Z0-9-]/g, '');
}
