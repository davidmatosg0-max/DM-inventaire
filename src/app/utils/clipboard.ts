/**
 * Utilidad para copiar texto al portapapeles de forma compatible
 * Usa el método alternativo execCommand cuando Clipboard API no está disponible
 */

export function copiarAlPortapapeles(texto: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Método alternativo compatible sin Clipboard API
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.top = '0';
    textarea.style.left = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    try {
      const exito = document.execCommand('copy');
      resolve(exito);
    } catch (err) {
      console.error('Error al copiar:', err);
      resolve(false);
    } finally {
      document.body.removeChild(textarea);
    }
  });
}
