/**
 * SISTEMA DE CÁLCULO AUTOMÁTICO DE VALOR MONETARIO
 * 
 * Este módulo calcula y actualiza automáticamente el valor monetario
 * de todos los productos basándose en:
 * - Stock actual
 * - Peso unitario
 * - Valor por kg de la categoría/subcategoría/variante
 * 
 * Fórmula: Valor Total = Stock Actual × Peso Unitario × Valor por Kg
 */

import { obtenerProductos, actualizarProducto, type ProductoCreado } from './productStorage';
import { obtenerValorPorKg, calcularValorMonetario } from './categoriaStorage';

export interface ResultadoCalculoValor {
  productosActualizados: number;
  productosConValor: number;
  productosSinValor: number;
  valorTotalInventario: number;
  detalles: {
    id: string;
    nombre: string;
    stockActual: number;
    pesoUnitario: number;
    valorPorKg: number | undefined;
    valorUnitario: number;
    valorTotal: number;
  }[];
}

/**
 * Calcula el valor unitario de un producto
 * Valor Unitario = Peso Unitario × Valor por Kg
 */
export function calcularValorUnitarioProducto(
  pesoUnitario: number,
  categoriaNombre: string,
  subcategoriaNombre?: string,
  varianteId?: string
): number {
  const valorPorKg = obtenerValorPorKg(categoriaNombre, subcategoriaNombre, varianteId);
  
  if (!valorPorKg || pesoUnitario <= 0) {
    return 0;
  }
  
  return parseFloat((pesoUnitario * valorPorKg).toFixed(2));
}

/**
 * Calcula el valor total de un producto
 * Valor Total = Stock Actual × Valor Unitario
 */
export function calcularValorTotalProducto(
  stockActual: number,
  valorUnitario: number
): number {
  if (stockActual <= 0 || valorUnitario <= 0) {
    return 0;
  }
  
  return parseFloat((stockActual * valorUnitario).toFixed(2));
}

/**
 * 🔧 FUNCIÓN PRINCIPAL: Recalcula el valor monetario de TODOS los productos
 * 
 * Esta función:
 * 1. Lee todos los productos del inventario
 * 2. Calcula el valor unitario basado en pesoUnitario × valorPorKg
 * 3. Calcula el valor total basado en stockActual × valorUnitario
 * 4. Actualiza cada producto con los nuevos valores
 * 
 * @returns Objeto con estadísticas del cálculo
 */
export function recalcularValoresMonetarios(): ResultadoCalculoValor {
  console.log('🔄 Iniciando recalculo de valores monetarios...');
  
  const productos = obtenerProductos();
  let productosActualizados = 0;
  let productosConValor = 0;
  let productosSinValor = 0;
  let valorTotalInventario = 0;
  const detalles: ResultadoCalculoValor['detalles'] = [];
  
  productos.forEach(producto => {
    try {
      // Asegurar que pesoUnitario existe
      const pesoUnitario = producto.pesoUnitario || producto.peso || 0;
      
      // Obtener valor por kg de la categoría/subcategoría/variante
      const valorPorKg = obtenerValorPorKg(
        producto.categoria,
        producto.subcategoria,
        producto.varianteId
      );
      
      // Calcular valor unitario (precio de 1 unidad del producto)
      const valorUnitario = calcularValorUnitarioProducto(
        pesoUnitario,
        producto.categoria,
        producto.subcategoria,
        producto.varianteId
      );
      
      // Calcular valor total (precio total del stock)
      const valorTotal = calcularValorTotalProducto(producto.stockActual, valorUnitario);
      
      // Agregar detalle
      detalles.push({
        id: producto.id,
        nombre: producto.nombre,
        stockActual: producto.stockActual,
        pesoUnitario,
        valorPorKg: valorPorKg || 0,
        valorUnitario,
        valorTotal,
      });
      
      // Actualizar el producto si hay cambios
      if (producto.valorUnitario !== valorUnitario || producto.valorTotal !== valorTotal || producto.pesoUnitario !== pesoUnitario) {
        actualizarProducto(producto.id, {
          pesoUnitario, // Asegurar que pesoUnitario está establecido
          valorUnitario,
          valorTotal,
        });
        productosActualizados++;
      }
      
      // Contar estadísticas
      if (valorTotal > 0) {
        productosConValor++;
        valorTotalInventario += valorTotal;
      } else {
        productosSinValor++;
      }
      
    } catch (error) {
      console.error(`❌ Error al calcular valor para producto ${producto.nombre}:`, error);
    }
  });
  
  const resultado: ResultadoCalculoValor = {
    productosActualizados,
    productosConValor,
    productosSinValor,
    valorTotalInventario,
    detalles,
  };
  
  console.log('✅ Recalculo completado:', {
    productosActualizados,
    productosConValor,
    productosSinValor,
    valorTotal: `CAD$ ${valorTotalInventario.toFixed(2)}`,
  });
  
  return resultado;
}

/**
 * Actualiza el valor monetario de un producto específico
 */
export function actualizarValorMonetarioProducto(productoId: string): boolean {
  try {
    const productos = obtenerProductos();
    const producto = productos.find(p => p.id === productoId);
    
    if (!producto) {
      console.error(`❌ Producto con ID ${productoId} no encontrado`);
      return false;
    }
    
    const pesoUnitario = producto.pesoUnitario || producto.peso || 0;
    const valorUnitario = calcularValorUnitarioProducto(
      pesoUnitario,
      producto.categoria,
      producto.subcategoria,
      producto.varianteId
    );
    const valorTotal = calcularValorTotalProducto(producto.stockActual, valorUnitario);
    
    actualizarProducto(productoId, {
      pesoUnitario,
      valorUnitario,
      valorTotal,
    });
    
    console.log(`✅ Valor actualizado para ${producto.nombre}: CAD$ ${valorTotal.toFixed(2)}`);
    return true;
  } catch (error) {
    console.error('❌ Error al actualizar valor monetario:', error);
    return false;
  }
}

/**
 * Obtiene el valor total del inventario
 */
export function obtenerValorTotalInventario(): number {
  const productos = obtenerProductos();
  return productos.reduce((total, producto) => {
    return total + (producto.valorTotal || 0);
  }, 0);
}

/**
 * Imprime un reporte visual del valor monetario en consola
 */
export function imprimirReporteValoresMonetarios(): void {
  const resultado = recalcularValoresMonetarios();
  
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #1a4d7a; font-weight: bold;');
  console.log('%c💰 REPORTE DE VALORES MONETARIOS', 'color: #1a4d7a; font-weight: bold; font-size: 16px;');
  console.log('%cSistema Integral - Banque Alimentaire', 'color: #2d9561; font-style: italic;');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #1a4d7a; font-weight: bold;');
  console.log('');
  
  console.log('%c📊 ESTADÍSTICAS', 'color: #1a4d7a; font-weight: bold; font-size: 14px;');
  console.log(`   Productos actualizados: %c${resultado.productosActualizados}`, 'color: #2d9561; font-weight: bold;');
  console.log(`   Productos con valor: %c${resultado.productosConValor}`, 'color: #4CAF50; font-weight: bold;');
  console.log(`   Productos sin valor: %c${resultado.productosSinValor}`, resultado.productosSinValor > 0 ? 'color: #FFC107; font-weight: bold;' : 'color: #999;');
  console.log(`   Valor total inventario: %cCAD$ ${resultado.valorTotalInventario.toFixed(2)}`, 'color: #2d9561; font-weight: bold; font-size: 16px;');
  console.log('');
  
  if (resultado.detalles.length > 0) {
    console.log('%c📦 TOP 10 PRODUCTOS POR VALOR', 'color: #1a4d7a; font-weight: bold; font-size: 14px;');
    const top10 = resultado.detalles
      .filter(d => d.valorTotal > 0)
      .sort((a, b) => b.valorTotal - a.valorTotal)
      .slice(0, 10);
    
    top10.forEach((detalle, index) => {
      console.log(
        `   ${index + 1}. %c${detalle.nombre}`,
        'color: #333; font-weight: bold;',
        `%c- Stock: ${detalle.stockActual} - Valor Unit: CAD$ ${detalle.valorUnitario.toFixed(2)} - Total: CAD$ ${detalle.valorTotal.toFixed(2)}`,
        'color: #666;'
      );
    });
  }
  
  console.log('');
  console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #1a4d7a; font-weight: bold;');
}

/**
 * 🆘 Función de emergencia disponible en consola
 * Ejecutar: recalcularTodosLosValores()
 */
(window as any).recalcularTodosLosValores = () => {
  console.log('%c🔄 RECALCULANDO TODOS LOS VALORES MONETARIOS...', 'color: #1a4d7a; font-weight: bold; font-size: 16px;');
  imprimirReporteValoresMonetarios();
  console.log('%c✅ ¡Recalculo completado! Los valores están actualizados.', 'color: #4CAF50; font-weight: bold; font-size: 14px;');
};

console.log('%c💡 TIP: Ejecuta recalcularTodosLosValores() en la consola para forzar el recalculo de valores monetarios', 'color: #2d9561; font-style: italic;');
