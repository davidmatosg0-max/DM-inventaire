/**
 * 🔍 HERRAMIENTA DE VERIFICACIÓN DE PRODUCTOS PRS
 * 
 * Script de debugging para verificar la sincronización de productos PRS
 * entre Configuración y FormularioEntrada
 * 
 * USO:
 * - En consola del navegador, ejecutar: verificarSincronizacionPRS()
 * - Ver el informe completo en consola
 */

import { obtenerProductos, type ProductoCreado } from './productStorage';
import { obtenerProgramasActivos } from './programaEntradaStorage';

export type ResultadoVerificacion = {
  exitoso: boolean;
  totalProductos: number;
  productosPRS: number;
  productosSinEsPRS: number;
  programaPRSExiste: boolean;
  productosPRSDetalle: ProductoCreado[];
  productosSinEsPRSDetalle: ProductoCreado[];
  mensajes: string[];
  advertencias: string[];
  errores: string[];
};

/**
 * Verificar sincronización completa de productos PRS
 */
export function verificarSincronizacionPRS(): ResultadoVerificacion {
  console.log('\n🔍 ===== VERIFICACIÓN DE SINCRONIZACIÓN PRS =====\n');
  
  const resultado: ResultadoVerificacion = {
    exitoso: true,
    totalProductos: 0,
    productosPRS: 0,
    productosSinEsPRS: 0,
    programaPRSExiste: false,
    productosPRSDetalle: [],
    productosSinEsPRSDetalle: [],
    mensajes: [],
    advertencias: [],
    errores: []
  };

  // 1. Verificar productos en localStorage
  console.log('📦 Paso 1: Verificando productos en localStorage...');
  const todosProductos = obtenerProductos();
  resultado.totalProductos = todosProductos.length;
  resultado.mensajes.push(`✅ Total de productos encontrados: ${todosProductos.length}`);

  // 2. Filtrar productos PRS
  console.log('\n🎯 Paso 2: Filtrando productos PRS...');
  const productosPRS = todosProductos.filter(p => p.esPRS === true);
  resultado.productosPRS = productosPRS.length;
  resultado.productosPRSDetalle = productosPRS;
  
  if (productosPRS.length > 0) {
    resultado.mensajes.push(`✅ Productos PRS encontrados: ${productosPRS.length}`);
    console.log(`   ✅ ${productosPRS.length} productos con esPRS === true`);
    
    // Mostrar detalles de productos PRS
    console.table(productosPRS.map(p => ({
      ID: p.id,
      Código: p.codigo,
      Nombre: p.nombre,
      Categoría: p.categoria,
      Subcategoría: p.subcategoria,
      Unidad: p.unidad,
      'Peso Unitario': p.pesoUnitario || 0,
      esPRS: p.esPRS,
      Activo: p.activo
    })));
  } else {
    resultado.advertencias.push('⚠️ No se encontraron productos PRS en el sistema');
    console.log('   ⚠️ No hay productos con esPRS === true');
  }

  // 3. Buscar productos que deberían ser PRS pero no tienen la marca
  console.log('\n🔎 Paso 3: Buscando productos PRS sin marcar...');
  const productosSinMarca = todosProductos.filter(p => {
    const tienePRSEnNombre = p.nombre.toLowerCase().includes('prs') || 
                             p.categoria.toLowerCase().includes('prs');
    const esCodigoPRS = ['FL', 'PC', 'PL', 'PV', 'VS'].includes(p.codigo.toUpperCase());
    const noMarcado = p.esPRS !== true;
    
    return (tienePRSEnNombre || esCodigoPRS) && noMarcado;
  });
  
  resultado.productosSinEsPRS = productosSinMarca.length;
  resultado.productosSinEsPRSDetalle = productosSinMarca;
  
  if (productosSinMarca.length > 0) {
    resultado.advertencias.push(`⚠️ Productos PRS sin marcar: ${productosSinMarca.length}`);
    console.log(`   ⚠️ Encontrados ${productosSinMarca.length} productos que deberían tener esPRS=true:`);
    console.table(productosSinMarca.map(p => ({
      ID: p.id,
      Código: p.codigo,
      Nombre: p.nombre,
      Categoría: p.categoria,
      esPRS: p.esPRS,
      'Tipo esPRS': typeof p.esPRS
    })));
    
    resultado.advertencias.push('💡 La migración automática debería corregir esto al abrir el formulario');
  } else {
    resultado.mensajes.push('✅ Todos los productos PRS están correctamente marcados');
    console.log('   ✅ No se encontraron productos PRS sin marcar');
  }

  // 4. Verificar programa PRS
  console.log('\n🎨 Paso 4: Verificando programa de entrada PRS...');
  const programas = obtenerProgramasActivos();
  const programaPRS = programas.find(p => 
    p.codigo.toLowerCase() === 'prs' || 
    p.nombre.toLowerCase().includes('prs') ||
    p.nombre.toLowerCase().includes('récupération spéciale')
  );
  
  resultado.programaPRSExiste = !!programaPRS;
  
  if (programaPRS) {
    resultado.mensajes.push(`✅ Programa PRS encontrado: "${programaPRS.nombre}"`);
    console.log(`   ✅ Programa PRS activo:`, {
      ID: programaPRS.id,
      Código: programaPRS.codigo,
      Nombre: programaPRS.nombre,
      Color: programaPRS.color,
      Icono: programaPRS.icono,
      Activo: programaPRS.activo
    });
  } else {
    resultado.advertencias.push('⚠️ No se encontró el programa PRS');
    resultado.exitoso = false;
    console.log('   ⚠️ Programa PRS no encontrado en programas activos');
    console.log('   💡 Verifica que existe un programa con código "PRS" en la configuración');
  }

  // 5. Verificar estructura de datos
  console.log('\n🔧 Paso 5: Verificando integridad de datos...');
  let productosConErrores = 0;
  
  productosPRS.forEach(producto => {
    const errores: string[] = [];
    
    if (!producto.id) errores.push('Sin ID');
    if (!producto.codigo) errores.push('Sin código');
    if (!producto.nombre) errores.push('Sin nombre');
    if (!producto.categoria) errores.push('Sin categoría');
    if (!producto.subcategoria) errores.push('Sin subcategoría');
    if (!producto.unidad) errores.push('Sin unidad');
    if (typeof producto.esPRS !== 'boolean') errores.push('esPRS no es boolean');
    if (producto.esPRS !== true) errores.push('esPRS no es true');
    
    if (errores.length > 0) {
      productosConErrores++;
      resultado.errores.push(`❌ Producto "${producto.nombre}" (${producto.codigo}): ${errores.join(', ')}`);
      console.log(`   ❌ Producto con errores: ${producto.nombre}`, errores);
    }
  });
  
  if (productosConErrores === 0) {
    resultado.mensajes.push('✅ Todos los productos PRS tienen estructura válida');
    console.log('   ✅ Integridad de datos correcta');
  } else {
    resultado.exitoso = false;
    resultado.errores.push(`❌ ${productosConErrores} productos con errores de estructura`);
    console.log(`   ❌ ${productosConErrores} productos con errores de estructura`);
  }

  // 6. Resumen final
  console.log('\n📊 ===== RESUMEN DE VERIFICACIÓN =====\n');
  
  console.log('📈 Estadísticas:');
  console.log(`   • Total de productos: ${resultado.totalProductos}`);
  console.log(`   • Productos PRS marcados: ${resultado.productosPRS}`);
  console.log(`   • Productos PRS sin marcar: ${resultado.productosSinEsPRS}`);
  console.log(`   • Programa PRS existe: ${resultado.programaPRSExiste ? 'Sí' : 'No'}`);
  
  if (resultado.mensajes.length > 0) {
    console.log('\n✅ Mensajes de éxito:');
    resultado.mensajes.forEach(msg => console.log(`   ${msg}`));
  }
  
  if (resultado.advertencias.length > 0) {
    console.log('\n⚠️ Advertencias:');
    resultado.advertencias.forEach(adv => console.log(`   ${adv}`));
  }
  
  if (resultado.errores.length > 0) {
    console.log('\n❌ Errores:');
    resultado.errores.forEach(err => console.log(`   ${err}`));
  }
  
  // Estado final
  console.log('\n🏁 Estado final:');
  if (resultado.exitoso && resultado.productosPRS > 0 && resultado.programaPRSExiste) {
    console.log('   ✅✅✅ SINCRONIZACIÓN FUNCIONANDO CORRECTAMENTE ✅✅✅');
  } else if (resultado.exitoso && resultado.productosPRS === 0 && resultado.programaPRSExiste) {
    console.log('   ⚠️ Sistema configurado pero sin productos PRS');
    console.log('   💡 Crea productos PRS en Configuración → Productos PRS');
  } else {
    console.log('   ❌ SE DETECTARON PROBLEMAS EN LA SINCRONIZACIÓN');
    console.log('   💡 Revisa los errores y advertencias arriba');
  }
  
  console.log('\n===========================================\n');
  
  return resultado;
}

/**
 * Ejecutar migración manual de productos PRS
 */
export function migrarProductosPRSManual(): number {
  console.log('\n🔧 ===== MIGRACIÓN MANUAL DE PRODUCTOS PRS =====\n');
  
  const productos = obtenerProductos();
  let productosMigrados = 0;
  
  const productosActualizados = productos.map(producto => {
    const tienePRSEnNombre = producto.nombre.toLowerCase().includes('prs') || 
                             producto.categoria.toLowerCase().includes('prs');
    const esCodigoPRS = ['FL', 'PC', 'PL', 'PV', 'VS'].includes(producto.codigo.toUpperCase());
    const noMarcado = producto.esPRS !== true;
    
    if ((tienePRSEnNombre || esCodigoPRS) && noMarcado) {
      console.log(`   🔄 Migrando: ${producto.nombre} (${producto.codigo})`);
      productosMigrados++;
      return { ...producto, esPRS: true };
    }
    
    return producto;
  });
  
  if (productosMigrados > 0) {
    localStorage.setItem('banco_alimentos_productos', JSON.stringify(productosActualizados));
    window.dispatchEvent(new Event('productos-actualizados'));
    console.log(`\n✅ ${productosMigrados} productos migrados correctamente`);
    console.log('✅ Evento "productos-actualizados" emitido');
  } else {
    console.log('\n✅ No hay productos para migrar');
  }
  
  console.log('\n===========================================\n');
  
  return productosMigrados;
}

/**
 * Listar todos los productos PRS con detalles
 */
export function listarProductosPRS(): void {
  console.log('\n📦 ===== LISTADO DE PRODUCTOS PRS =====\n');
  
  const productos = obtenerProductos();
  const productosPRS = productos.filter(p => p.esPRS === true);
  
  if (productosPRS.length === 0) {
    console.log('⚠️ No hay productos PRS en el sistema');
    console.log('💡 Crea productos PRS en Configuración → Productos PRS');
  } else {
    console.log(`✅ Total de productos PRS: ${productosPRS.length}\n`);
    
    // Agrupar por categoría
    const porCategoria = productosPRS.reduce((acc, p) => {
      if (!acc[p.categoria]) {
        acc[p.categoria] = [];
      }
      acc[p.categoria].push(p);
      return acc;
    }, {} as Record<string, ProductoCreado[]>);
    
    Object.entries(porCategoria).forEach(([categoria, productos]) => {
      console.log(`\n📂 ${categoria} (${productos.length} productos)`);
      console.table(productos.map(p => ({
        Código: p.codigo,
        Nombre: p.nombre,
        Subcategoría: p.subcategoria,
        Unidad: p.unidad,
        'Peso Unit.': p.pesoUnitario || 0,
        Stock: p.stockActual,
        Ubicación: p.ubicacion || 'N/A'
      })));
    });
  }
  
  console.log('\n===========================================\n');
}

// Exponer funciones en window para uso en consola
if (typeof window !== 'undefined') {
  (window as any).verificarSincronizacionPRS = verificarSincronizacionPRS;
  (window as any).migrarProductosPRSManual = migrarProductosPRSManual;
  (window as any).listarProductosPRS = listarProductosPRS;
  
  console.log('\n🔧 ===== HERRAMIENTAS DE VERIFICACIÓN PRS DISPONIBLES =====');
  console.log('\nEjecuta en consola:');
  console.log('  • verificarSincronizacionPRS()  - Verificar sincronización completa');
  console.log('  • migrarProductosPRSManual()     - Migrar productos PRS manualmente');
  console.log('  • listarProductosPRS()           - Listar todos los productos PRS');
  console.log('\n=========================================================\n');
}
