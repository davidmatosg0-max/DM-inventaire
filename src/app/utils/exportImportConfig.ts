/**
 * Utilidades para exportar e importar la configuración completa del sistema
 */

export interface ConfiguracionCompleta {
  programasEntrada: any[];
  categorias: any[];
  productos: any[];
  unidades: any[];
  timestamp: string;
  version: string;
}

/**
 * Exporta toda la configuración del sistema a un archivo JSON
 */
export function exportarConfiguracion(): void {
  try {
    const configuracion: ConfiguracionCompleta = {
      programasEntrada: JSON.parse(localStorage.getItem('bancoAlimentos_programasEntrada') || '[]'),
      categorias: JSON.parse(localStorage.getItem('bancoAlimentos_categorias') || '[]'),
      productos: JSON.parse(localStorage.getItem('bancoAlimentos_productos') || '[]'),
      unidades: JSON.parse(localStorage.getItem('bancoAlimentos_unidades') || '[]'),
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(configuracion, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `banco-alimentos-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar configuración:', error);
    throw new Error('No se pudo exportar la configuración');
  }
}

/**
 * Importa la configuración desde un archivo JSON
 */
export function importarConfiguracion(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const contenido = e.target?.result as string;
        const configuracion: ConfiguracionCompleta = JSON.parse(contenido);
        
        // Validar que tenga la estructura correcta
        if (!configuracion.version || !configuracion.timestamp) {
          throw new Error('Archivo de configuración inválido');
        }
        
        // Guardar en localStorage
        if (configuracion.programasEntrada) {
          localStorage.setItem('bancoAlimentos_programasEntrada', JSON.stringify(configuracion.programasEntrada));
        }
        if (configuracion.categorias) {
          localStorage.setItem('bancoAlimentos_categorias', JSON.stringify(configuracion.categorias));
        }
        if (configuracion.productos) {
          localStorage.setItem('bancoAlimentos_productos', JSON.stringify(configuracion.productos));
        }
        if (configuracion.unidades) {
          localStorage.setItem('bancoAlimentos_unidades', JSON.stringify(configuracion.unidades));
        }
        
        resolve();
      } catch (error) {
        console.error('Error al importar configuración:', error);
        reject(new Error('No se pudo leer el archivo de configuración'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Resetea toda la configuración a los valores por defecto
 */
export function resetearConfiguracion(): void {
  const keys = [
    'bancoAlimentos_programasEntrada',
    'bancoAlimentos_categorias',
    'bancoAlimentos_productos',
    'bancoAlimentos_unidades'
  ];
  
  keys.forEach(key => localStorage.removeItem(key));
}
