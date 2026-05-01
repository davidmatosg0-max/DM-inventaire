/**
 * 🔧 MIGRACIÓN DE VALORES MONETARIOS
 * 
 * Script para actualizar productos existentes en el inventario
 * con valores monetarios basados en las entradas registradas
 */

import { obtenerProductos, actualizarProducto, type ProductoCreado } from './productStorage';
import { obtenerTodasLasEntradas, type EntradaInventario } from './entradaInventarioStorage';

export type ResultadoMigracion = {
  exitoso: boolean;
  productosActualizados: number;
  productosSinValor: number;
  errores: string[];
  detalles: {
    nombre: string;
    valorUnitarioAntes: number;
    valorUnitarioDespues: number;
    valorTotalDespues: number;
  }[];
};

/**
 * 🔧 Migrar valores monetarios de todas las entradas a los productos
 * 
 * Esta función:
 * 1. Obtiene todas las entradas registradas
 * 2. Calcula el promedio ponderado de valores para cada producto
 * 3. Actualiza los productos con sus valores monetarios
 */
export function migrarValoresMonetariosDesdeEntradas(): ResultadoMigracion {
  const resultado: ResultadoMigracion = {
    exitoso: false,
    productosActualizados: 0,
    productosSinValor: 0,
    errores: [],
    detalles: []
  };

  try {
    console.log('🔄 Iniciando migración de valores monetarios...');
    
    const productos = obtenerProductos();
    const entradas = obtenerTodasLasEntradas();
    
    console.log(`📊 Total de productos: ${productos.length}`);
    console.log(`📊 Total de entradas: ${entradas.length}`);
    
    // Agrupar entradas por producto
    const entradasPorProducto = new Map<string, EntradaInventario[]>();
    
    entradas.forEach(entrada => {
      // Crear clave única basada en nombre del producto
      const clave = entrada.nombreProducto || `${entrada.categoria}-${entrada.subcategoria}`;
      
      if (!entradasPorProducto.has(clave)) {
        entradasPorProducto.set(clave, []);
      }
      
      entradasPorProducto.get(clave)!.push(entrada);
    });
    
    console.log(`🔍 Productos con entradas: ${entradasPorProducto.size}`);
    
    // Procesar cada producto
    productos.forEach(producto => {
      const claveProducto = `${producto.categoria} - ${producto.subcategoria}`;
      const entradasProducto = entradasPorProducto.get(claveProducto) || [];
      
      // Si el producto ya tiene valorUnitario, saltarlo
      if (producto.valorUnitario && producto.valorUnitario > 0) {
        console.log(`✅ "${producto.nombre}" ya tiene valor unitario: CAD$ ${producto.valorUnitario.toFixed(2)}`);
        return;
      }
      
      // Filtrar solo las entradas que tienen valor monetario
      const entradasConValor = entradasProducto.filter(
        e => e.valorUnitario && e.valorUnitario > 0
      );
      
      if (entradasConValor.length === 0) {
        resultado.productosSinValor++;
        console.log(`⚠️ "${producto.nombre}" no tiene entradas con valor monetario`);
        return;
      }
      
      // Calcular promedio ponderado
      let sumaValorXCantidad = 0;
      let sumaCantidad = 0;
      
      entradasConValor.forEach(entrada => {
        const valor = entrada.valorUnitario || 0;
        const cantidad = entrada.cantidad || 0;
        
        sumaValorXCantidad += valor * cantidad;
        sumaCantidad += cantidad;
      });
      
      const valorUnitarioPromedio = sumaCantidad > 0 
        ? sumaValorXCantidad / sumaCantidad 
        : 0;
      
      if (valorUnitarioPromedio > 0) {
        const valorTotal = valorUnitarioPromedio * producto.stockActual;
        
        // Actualizar producto
        actualizarProducto(producto.id, {
          valorUnitario: valorUnitarioPromedio,
          valorTotal: valorTotal
        });
        
        resultado.productosActualizados++;
        resultado.detalles.push({
          nombre: producto.nombre,
          valorUnitarioAntes: producto.valorUnitario || 0,
          valorUnitarioDespues: valorUnitarioPromedio,
          valorTotalDespues: valorTotal
        });
        
        console.log(`✅ "${producto.nombre}": CAD$ ${valorUnitarioPromedio.toFixed(2)}/u (basado en ${entradasConValor.length} entradas)`);
      }
    });
    
    resultado.exitoso = true;
    
    console.log('\n✅ MIGRACIÓN COMPLETADA');
    console.log(`📊 Productos actualizados: ${resultado.productosActualizados}`);
    console.log(`⚠️ Productos sin valor: ${resultado.productosSinValor}`);
    
    if (resultado.detalles.length > 0) {
      console.log('\n📋 DETALLES DE ACTUALIZACIÓN:');
      console.table(resultado.detalles);
    }
    
  } catch (error: any) {
    resultado.exitoso = false;
    resultado.errores.push(error.message);
    console.error('❌ Error en migración:', error);
  }
  
  return resultado;
}

/**
 * 🔧 Recalcular valores totales de todos los productos
 * basándose en valorUnitario × stockActual
 */
export function recalcularValoresTotales(): number {
  try {
    const productos = obtenerProductos();
    let productosActualizados = 0;
    
    productos.forEach(producto => {
      if (producto.valorUnitario && producto.valorUnitario > 0) {
        const valorTotalCalculado = producto.valorUnitario * producto.stockActual;
        
        // Solo actualizar si el valor total es diferente
        if (producto.valorTotal !== valorTotalCalculado) {
          actualizarProducto(producto.id, {
            valorTotal: valorTotalCalculado
          });
          
          productosActualizados++;
          console.log(`✅ "${producto.nombre}": Valor total actualizado a CAD$ ${valorTotalCalculado.toFixed(2)}`);
        }
      }
    });
    
    console.log(`✅ ${productosActualizados} productos con valores totales recalculados`);
    return productosActualizados;
    
  } catch (error) {
    console.error('❌ Error al recalcular valores totales:', error);
    return 0;
  }
}

/**
 * 📊 Obtener estadísticas de valores monetarios en el inventario
 */
export function obtenerEstadisticasValoresMonetarios() {
  const productos = obtenerProductos();
  
  const stats = {
    totalProductos: productos.length,
    productosConValor: 0,
    productosSinValor: 0,
    valorTotalInventario: 0,
    valorPromedioPorProducto: 0,
    productos: [] as {
      nombre: string;
      valorUnitario: number;
      stockActual: number;
      valorTotal: number;
    }[]
  };
  
  productos.forEach(producto => {
    if (producto.valorUnitario && producto.valorUnitario > 0) {
      stats.productosConValor++;
      const valorTotal = producto.valorTotal || (producto.valorUnitario * producto.stockActual);
      stats.valorTotalInventario += valorTotal;
      
      stats.productos.push({
        nombre: producto.nombre,
        valorUnitario: producto.valorUnitario,
        stockActual: producto.stockActual,
        valorTotal
      });
    } else {
      stats.productosSinValor++;
    }
  });
  
  stats.valorPromedioPorProducto = stats.productosConValor > 0 
    ? stats.valorTotalInventario / stats.productosConValor 
    : 0;
  
  // Ordenar productos por valor total (mayor a menor)
  stats.productos.sort((a, b) => b.valorTotal - a.valorTotal);
  
  return stats;
}

// 🆘 Exponer funciones en la consola para uso manual
if (typeof window !== 'undefined') {
  (window as any).migrarValoresMonetariosDesdeEntradas = migrarValoresMonetariosDesdeEntradas;
  (window as any).recalcularValoresTotales = recalcularValoresTotales;
  (window as any).obtenerEstadisticasValoresMonetarios = obtenerEstadisticasValoresMonetarios;
  
  console.log('💰 Funciones de migración de valores monetarios disponibles:');
  console.log('   - migrarValoresMonetariosDesdeEntradas()');
  console.log('   - recalcularValoresTotales()');
  console.log('   - obtenerEstadisticasValoresMonetarios()');
}
