// Utilidad para gestionar registro individual de paletas

import { guardarEntrada, type EntradaInventario } from './entradaInventarioStorage';
import type { ContactoDepartamento } from './contactosDepartamentoStorage';
import type { ProgramaEntrada } from './programaEntradaStorage';
import type { ProductoCreado } from './productStorage';

export interface DatosEntradaPaleta {
  formData: {
    tipoEntrada: string;
    donadorId: string;
    productoId: string;
    nombreProducto: string;
    productoCustom: string;
    categoria: string;
    subcategoria: string;
    varianteId?: string;
    productoIcono?: string;
    cantidad: number;
    unidad: string;
    peso: number;
    temperatura: 'ambiente' | 'refrigerado' | 'congelado' | '';
    fechaCaducidad: string;
    lote: string;
    detallesEmpaque: string;
    observaciones: string;
  };
  contactoSeleccionado: ContactoDepartamento | null;
  programaSeleccionado: ProgramaEntrada | null;
  productoSeleccionado: ProductoCreado | null;
  varianteInfo?: {
    id: string;
    nombre: string;
    codigo: string;
    icono: string;
  };
}

export interface ProductoAgregado {
  nombreProducto: string;
  productoIcono: string;
  cantidad: number;
  unidad: string;
  pesoTotal: number;
  temperatura: string;
  categoria?: string;
  subcategoria?: string;
  lote?: string;
  fechaCaducidad?: string;
  detallesEmpaque?: string;
  numeroPaleta?: number;
  totalPaletas?: number;
}

/**
 * Registra múltiples paletas de forma individual
 * Cada paleta obtiene su propio registro y etiqueta única
 */
export function registrarPaletasIndividuales(
  datos: DatosEntradaPaleta
): ProductoAgregado[] {
  const { formData, contactoSeleccionado, programaSeleccionado, productoSeleccionado, varianteInfo } = datos;
  const cantidadPaletas = formData.cantidad;
  const productosAgregados: ProductoAgregado[] = [];

  console.log(`🎯 MODO PALETA: Registrando ${cantidadPaletas} paletas individualmente`);

  for (let i = 1; i <= cantidadPaletas; i++) {
    const entradaDataPaleta = {
      fecha: new Date().toISOString(),
      tipoEntrada: formData.tipoEntrada,
      programaNombre: programaSeleccionado?.nombre || '',
      programaCodigo: programaSeleccionado?.codigo || '',
      programaColor: programaSeleccionado?.color || '#1E73BE',
      programaIcono: programaSeleccionado?.icono || '📦',
      
      donadorId: formData.donadorId,
      donadorNombre: contactoSeleccionado 
        ? `${contactoSeleccionado.nombre} ${contactoSeleccionado.apellido}` 
        : '',
      donadorEsCustom: false,
      
      productoId: formData.productoId || 'custom',
      nombreProducto: `${formData.nombreProducto} - Paleta ${i}/${cantidadPaletas}`,
      categoria: formData.categoria || productoSeleccionado?.categoria,
      subcategoria: formData.subcategoria || productoSeleccionado?.subcategoria,
      productoCategoria: formData.categoria || productoSeleccionado?.categoria,
      productoSubcategoria: formData.subcategoria || productoSeleccionado?.subcategoria,
      productoIcono: formData.productoIcono || productoSeleccionado?.icono || '📦',
      productoCodigo: productoSeleccionado?.codigo,
      varianteId: formData.varianteId,
      variante: varianteInfo,
      
      cantidad: 1, // Cada paleta es 1 unidad
      unidad: formData.unidad,
      pesoUnidad: formData.peso,
      pesoTotal: formData.peso, // Peso de UNA paleta
      
      temperatura: formData.temperatura as 'ambiente' | 'refrigerado' | 'congelado',
      
      lote: formData.lote ? `${formData.lote}-P${i}` : `P${i}`,
      fechaCaducidad: formData.fechaCaducidad || undefined,
      detallesEmpaque: formData.detallesEmpaque || undefined,
      observaciones: formData.observaciones 
        ? `${formData.observaciones} | Paleta ${i} de ${cantidadPaletas}` 
        : `Paleta ${i} de ${cantidadPaletas}`,
    };

    console.log(`📦 Guardando Paleta ${i}/${cantidadPaletas}:`, entradaDataPaleta);
    const entradaGuardada = guardarEntrada(entradaDataPaleta);

    // Emitir evento para actualizar UI
    window.dispatchEvent(new CustomEvent('entradaGuardada', { 
      detail: entradaGuardada 
    }));
    
    // Agregar a lista de productos agregados
    const productoAgregado: ProductoAgregado = {
      nombreProducto: entradaDataPaleta.nombreProducto,
      productoIcono: formData.productoIcono || '📦',
      cantidad: 1,
      unidad: formData.unidad,
      pesoTotal: formData.peso,
      temperatura: formData.temperatura,
      categoria: formData.categoria,
      subcategoria: formData.subcategoria,
      lote: entradaDataPaleta.lote,
      fechaCaducidad: formData.fechaCaducidad,
      detallesEmpaque: formData.detallesEmpaque,
      numeroPaleta: i,
      totalPaletas: cantidadPaletas
    };
    
    productosAgregados.push(productoAgregado);
  }

  return productosAgregados;
}

/**
 * Verifica si la unidad seleccionada es "Paleta"
 */
export function esPaleta(unidad: string): boolean {
  return unidad === 'PLT' || unidad.toLowerCase().includes('paleta');
}

/**
 * Determina si se debe usar el modo de registro individual para paletas
 */
export function debeRegistrarPaletasIndividuales(unidad: string, cantidad: number): boolean {
  return esPaleta(unidad) && cantidad > 1;
}
