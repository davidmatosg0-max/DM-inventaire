// Sistema de almacenamiento de conversiones de productos

export type ConversionProducto = {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  unidad: string;
};

export type RegistroConversion = {
  id: string;
  fecha: string;
  productoOrigen: ConversionProducto;
  productosDestino: ConversionProducto[];
  merma: number; // Pérdida en kg o unidad del producto origen
  mermaMotivo?: string;
  observaciones?: string;
  usuarioId?: string;
  revertida?: boolean;
  fechaReversion?: string;
};

export type PlantillaConversion = {
  id: string;
  nombre: string;
  descripcion?: string;
  productoOrigenId?: string; // Opcional, puede ser genérico
  configuracion: {
    productoDestinoId: string;
    productoDestinoNombre: string;
    ratio: number;
  }[];
  mermaEsperada: number; // Porcentaje de merma esperado
  icono?: string;
  activa: boolean;
  fechaCreacion: string;
  vecesUsada: number;
};

const CONVERSIONES_KEY = 'banco_alimentos_conversiones';
const PLANTILLAS_KEY = 'banco_alimentos_plantillas_conversion';

/**
 * Obtener todas las conversiones
 */
export function obtenerConversiones(): RegistroConversion[] {
  try {
    const data = localStorage.getItem(CONVERSIONES_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al obtener conversiones:', error);
    return [];
  }
}

/**
 * Guardar una nueva conversión
 */
export function guardarConversion(conversion: RegistroConversion): void {
  try {
    const conversiones = obtenerConversiones();
    conversiones.unshift(conversion); // Agregar al inicio
    localStorage.setItem(CONVERSIONES_KEY, JSON.stringify(conversiones));
    console.log('✅ Conversión guardada exitosamente');
  } catch (error) {
    console.error('❌ Error al guardar conversión:', error);
    throw error;
  }
}

/**
 * Marcar conversión como revertida
 */
export function revertirConversion(conversionId: string): void {
  try {
    const conversiones = obtenerConversiones();
    const index = conversiones.findIndex(c => c.id === conversionId);
    if (index !== -1) {
      conversiones[index].revertida = true;
      conversiones[index].fechaReversion = new Date().toISOString();
      localStorage.setItem(CONVERSIONES_KEY, JSON.stringify(conversiones));
      console.log('✅ Conversión revertida');
    }
  } catch (error) {
    console.error('❌ Error al revertir conversión:', error);
    throw error;
  }
}

/**
 * Obtener conversiones recientes (últimas 50)
 */
export function obtenerConversionesRecientes(limite: number = 50): RegistroConversion[] {
  const conversiones = obtenerConversiones();
  return conversiones.slice(0, limite);
}

/**
 * Obtener todas las plantillas de conversión
 */
export function obtenerPlantillasConversion(): PlantillaConversion[] {
  try {
    const data = localStorage.getItem(PLANTILLAS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al obtener plantillas:', error);
    return [];
  }
}

/**
 * Guardar una nueva plantilla
 */
export function guardarPlantillaConversion(plantilla: PlantillaConversion): void {
  try {
    const plantillas = obtenerPlantillasConversion();
    const existe = plantillas.find(p => p.id === plantilla.id);
    if (existe) {
      // Actualizar
      const index = plantillas.findIndex(p => p.id === plantilla.id);
      plantillas[index] = plantilla;
    } else {
      // Agregar nueva
      plantillas.push(plantilla);
    }
    localStorage.setItem(PLANTILLAS_KEY, JSON.stringify(plantillas));
    console.log('✅ Plantilla guardada exitosamente');
  } catch (error) {
    console.error('❌ Error al guardar plantilla:', error);
    throw error;
  }
}

/**
 * Actualizar contador de usos de plantilla
 */
export function incrementarUsoPlantilla(plantillaId: string): void {
  try {
    const plantillas = obtenerPlantillasConversion();
    const plantilla = plantillas.find(p => p.id === plantillaId);
    if (plantilla) {
      plantilla.vecesUsada += 1;
      localStorage.setItem(PLANTILLAS_KEY, JSON.stringify(plantillas));
    }
  } catch (error) {
    console.error('Error al incrementar uso de plantilla:', error);
  }
}

/**
 * Eliminar una plantilla
 */
export function eliminarPlantillaConversion(plantillaId: string): void {
  try {
    const plantillas = obtenerPlantillasConversion();
    const plantillasFiltradas = plantillas.filter(p => p.id !== plantillaId);
    localStorage.setItem(PLANTILLAS_KEY, JSON.stringify(plantillasFiltradas));
    console.log('✅ Plantilla eliminada');
  } catch (error) {
    console.error('❌ Error al eliminar plantilla:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas de conversiones
 */
export function obtenerEstadisticasConversiones() {
  const conversiones = obtenerConversiones();
  const conversionesActivas = conversiones.filter(c => !c.revertida);
  
  return {
    total: conversiones.length,
    activas: conversionesActivas.length,
    revertidas: conversiones.filter(c => c.revertida).length,
    mermaTotal: conversionesActivas.reduce((sum, c) => sum + c.merma, 0),
    ultimaSemana: conversiones.filter(c => {
      const fecha = new Date(c.fecha);
      const hace7Dias = new Date();
      hace7Dias.setDate(hace7Dias.getDate() - 7);
      return fecha >= hace7Dias && !c.revertida;
    }).length
  };
}
