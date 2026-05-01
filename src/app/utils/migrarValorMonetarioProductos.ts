/**
 * 💰 SCRIPT DE MIGRACIÓN: Actualizar valores monetarios de productos existentes
 * 
 * Este script actualiza todos los productos PRS existentes en el inventario
 * con valores monetarios calculados a partir del valorMonetario de sus categorías
 */

import { obtenerProductos, actualizarProducto, type ProductoCreado } from './productStorage';
import { obtenerCategorias } from './categoriaStorage';

export type ResultadoMigracionValores = {
  exitoso: boolean;
  productosActualizados: number;
  productosSinCategoria: number;
  errores: string[];
  detalles: {
    id: string;
    nombre: string;
    categoria: string;
    valorUnitarioAntes?: number;
    valorUnitarioAhora: number;
    peso: number;
    valorMonetarioCategoria: number;
  }[];
};

/**
 * Migrar valores monetarios para todos los productos existentes
 */
export function migrarValoresMonetariosProductos(): ResultadoMigracionValores {
  console.log('\n💰 ===== MIGRACIÓN DE VALORES MONETARIOS =====\n');
  
  const productos = obtenerProductos();
  const categorias = obtenerCategorias();
  
  const resultado: ResultadoMigracionValores = {
    exitoso: true,
    productosActualizados: 0,
    productosSinCategoria: 0,
    errores: [],
    detalles: []
  };
  
  console.log(`📦 Total de productos a procesar: ${productos.length}`);
  console.log(`📂 Total de categorías disponibles: ${categorias.length}\n`);
  
  productos.forEach(producto => {
    try {
      // Buscar la categoría del producto
      const categoria = categorias.find(c => c.nombre === producto.categoria);
      
      if (!categoria) {
        console.warn(`⚠️ Producto "${producto.nombre}" no tiene categoría válida: "${producto.categoria}"`);
        resultado.productosSinCategoria++;
        return;
      }
      
      // Obtener valor monetario de la categoría
      const valorMonetarioCategoria = categoria.valorMonetario || categoria.valorPorKg || 0;
      
      if (valorMonetarioCategoria <= 0) {
        console.warn(`⚠️ Categoría "${categoria.nombre}" no tiene valor monetario configurado`);
        return;
      }
      
      // Calcular valor unitario basado en el peso del producto
      const peso = producto.peso || 0;
      const valorUnitario = valorMonetarioCategoria * peso;
      const valorTotal = valorUnitario * (producto.stockActual || 0);
      
      // Guardar valores antiguos para el reporte
      const valorUnitarioAntes = producto.valorUnitario;
      
      // Actualizar el producto con los nuevos valores
      const productoActualizado: ProductoCreado = {
        ...producto,
        valorUnitario: valorUnitario,
        valorTotal: valorTotal
      };
      
      actualizarProducto(producto.id, productoActualizado);
      
      resultado.productosActualizados++;
      resultado.detalles.push({
        id: producto.id,
        nombre: producto.nombre,
        categoria: producto.categoria,
        valorUnitarioAntes,
        valorUnitarioAhora: valorUnitario,
        peso: peso,
        valorMonetarioCategoria
      });
      
      console.log(`✅ Producto "${producto.nombre}" actualizado:`);
      console.log(`   Peso: ${peso} kg`);
      console.log(`   Valor monetario categoría: CAD$ ${valorMonetarioCategoria.toFixed(2)}/kg`);
      console.log(`   Valor unitario: CAD$ ${valorUnitario.toFixed(2)}`);
      console.log(`   Valor total (stock ${producto.stockActual}): CAD$ ${valorTotal.toFixed(2)}\n`);
      
    } catch (error) {
      const mensajeError = `Error al procesar producto "${producto.nombre}": ${error}`;
      console.error(`❌ ${mensajeError}`);
      resultado.errores.push(mensajeError);
      resultado.exitoso = false;
    }
  });
  
  // Resumen final
  console.log('\n📊 ===== RESUMEN DE MIGRACIÓN =====');
  console.log(`✅ Productos actualizados: ${resultado.productosActualizados}`);
  console.log(`⚠️ Productos sin categoría válida: ${resultado.productosSinCategoria}`);
  console.log(`❌ Errores encontrados: ${resultado.errores.length}`);
  
  if (resultado.errores.length > 0) {
    console.log('\n🔴 Errores:');
    resultado.errores.forEach(error => console.log(`  - ${error}`));
  }
  
  console.log('\n✨ Migración completada\n');
  
  return resultado;
}

/**
 * Exportar función para ejecutar desde consola del navegador
 */
(window as any).migrarValoresMonetariosProductos = migrarValoresMonetariosProductos;
