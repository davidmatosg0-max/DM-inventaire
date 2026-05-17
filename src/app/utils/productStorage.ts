// Sistema de almacenamiento de productos creados en Configuración

import { registrarActividad } from './actividadLogger';
import { buildLocationOptions, loadLocationZones, resolveLegacyLocation } from './locationZones';
import { queueStorageSync } from './cloudPersistence';
import { sincronizarProductoEnComandasYOfertas } from './productReferenceSync';
import {
  aplicarTemperaturaProducto,
  type TemperaturaProductoCanonica,
  type TemperaturaAlmacenamiento,
} from './productTemperature';

export type ProductoCreado = {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  subcategoria: string;
  varianteId?: string;
  varianteNombre?: string;
  unidad: string;
  icono: string;
  peso: number;
  pesoUnitario?: number; // Peso en kg de una unidad del producto
  pesoRegistrado?: number; // Peso total registrado en kg
  stockActual: number;
  stockMinimo: number;
  ubicacion: string;
  lote: string;
  fechaVencimiento: string;
  esPRS: boolean;
  activo: boolean;
  fechaCreacion: string;
  temperatura?: TemperaturaProductoCanonica;
  temperaturaAlmacenamiento?: TemperaturaAlmacenamiento;
  temperaturaOriginalEntrada?: TemperaturaProductoCanonica;
  productoOrigenId?: string; // ID del producto origen en caso de conversión
  esConversion?: boolean; // Indica si es un producto resultado de conversión
  valorUnitario?: number; // Valor monetario por unidad en CAD$
  valorTotal?: number; // Valor monetario total en CAD$ (valorUnitario × stockActual)
};

type ProductoCantidadOperacion = {
  productoId: string;
  cantidad: number;
};

type ProductoInventarioComparable = Pick<ProductoCreado, 'categoria' | 'subcategoria' | 'varianteNombre' | 'peso' | 'pesoUnitario'> & {
  varianteId?: string;
};

export type GuardarProductoEstrategia = 'id' | 'inventario-canonico';

type GuardarProductoOpciones = {
  estrategiaDeduplicacion?: GuardarProductoEstrategia;
};

const STORAGE_KEY = 'banco_alimentos_productos';

function normalizeProductNameToken(value?: string): string {
  return typeof value === 'string'
    ? value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
    : '';
}

function normalizeProductWeight(value?: number): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '0.000';
  }

  return value.toFixed(3);
}

function getNormalizedProductName(producto: Pick<ProductoCreado, 'nombre' | 'categoria' | 'subcategoria' | 'varianteNombre'>): string {
  const rawName = producto.nombre?.trim() || '';
  const categoria = producto.categoria?.trim() || '';
  const subcategoria = producto.subcategoria?.trim() || '';
  const variante = producto.varianteNombre?.trim() || '';
  const hasDistinctVariant = Boolean(variante) && normalizeProductNameToken(variante) !== normalizeProductNameToken(subcategoria);
  const cleanName = hasDistinctVariant
    ? `${subcategoria} - ${variante}`
    : subcategoria || variante || rawName;

  const legacyCandidates = [
    categoria && subcategoria ? `${categoria} - ${subcategoria}` : '',
    categoria && subcategoria ? `${categoria} - ${subcategoria} - ${subcategoria}` : '',
    categoria && subcategoria && variante ? `${categoria} - ${subcategoria} - ${variante}` : '',
  ]
    .map(normalizeProductNameToken)
    .filter(Boolean);

  if (!rawName) {
    return cleanName;
  }

  return legacyCandidates.includes(normalizeProductNameToken(rawName)) ? cleanName : rawName;
}

export function construirClaveProductoInventario(producto: ProductoInventarioComparable): string {
  const pesoNormalizado = normalizeProductWeight(producto.pesoUnitario ?? producto.peso ?? 0);
  const varianteNormalizada = normalizeProductNameToken(producto.varianteNombre || producto.varianteId || '');

  return [
    normalizeProductNameToken(producto.categoria),
    normalizeProductNameToken(producto.subcategoria),
    varianteNormalizada,
    pesoNormalizado,
  ].join('|');
}

function calcularPesoRegistrado(producto: Pick<ProductoCreado, 'pesoRegistrado' | 'pesoUnitario' | 'peso' | 'stockActual'>): number {
  if (typeof producto.pesoRegistrado === 'number' && Number.isFinite(producto.pesoRegistrado)) {
    return producto.pesoRegistrado;
  }

  const pesoUnitario = producto.pesoUnitario ?? producto.peso ?? 0;
  const stockActual = producto.stockActual ?? 0;
  return pesoUnitario * stockActual;
}

function redondearValorMonetario(valor: number): number {
  if (!Number.isFinite(valor)) {
    return 0;
  }

  return parseFloat(valor.toFixed(2));
}

function calcularValorInventarioProducto(producto: Pick<ProductoCreado, 'valorTotal' | 'valorUnitario' | 'stockActual'>): number {
  if (typeof producto.valorTotal === 'number' && Number.isFinite(producto.valorTotal) && producto.valorTotal > 0) {
    return redondearValorMonetario(producto.valorTotal);
  }

  if (typeof producto.valorUnitario === 'number' && Number.isFinite(producto.valorUnitario) && producto.valorUnitario > 0) {
    return redondearValorMonetario(producto.valorUnitario * (producto.stockActual ?? 0));
  }

  return 0;
}

function fusionarProductoCanonico(
  productoExistente: ProductoCreado,
  productoEntrante: ProductoCreado,
  standardLocations: string[]
): ProductoCreado {
  const stockExistente = productoExistente.stockActual ?? 0;
  const stockEntrante = productoEntrante.stockActual ?? 0;
  const stockFusionado = stockExistente + stockEntrante;
  const pesoRegistradoExistente = calcularPesoRegistrado(productoExistente);
  const pesoRegistradoEntrante = calcularPesoRegistrado(productoEntrante);
  const valorInventarioExistente = calcularValorInventarioProducto(productoExistente);
  const valorInventarioEntrante = calcularValorInventarioProducto(productoEntrante);
  const valorTotalFusionado = redondearValorMonetario(valorInventarioExistente + valorInventarioEntrante);
  const valorUnitarioFusionado = stockFusionado > 0 && valorTotalFusionado > 0
    ? redondearValorMonetario(valorTotalFusionado / stockFusionado)
    : (productoEntrante.valorUnitario ?? productoExistente.valorUnitario);

  return aplicarTemperaturaProducto(normalizeStoredProduct({
    ...productoExistente,
    stockActual: stockFusionado,
    stockMinimo: Math.max(productoExistente.stockMinimo ?? 0, productoEntrante.stockMinimo ?? 0),
    pesoRegistrado: pesoRegistradoExistente + pesoRegistradoEntrante,
    valorTotal: valorTotalFusionado,
    valorUnitario: valorUnitarioFusionado,
    icono: productoExistente.icono || productoEntrante.icono,
    ubicacion: productoExistente.ubicacion || productoEntrante.ubicacion,
    lote: productoExistente.lote || productoEntrante.lote,
    fechaVencimiento: productoExistente.fechaVencimiento || productoEntrante.fechaVencimiento,
    esPRS: productoExistente.esPRS || productoEntrante.esPRS,
    activo: productoExistente.activo !== false && productoEntrante.activo !== false,
  }, standardLocations));
}

function getCurrentStandardLocations(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  return buildLocationOptions(loadLocationZones());
}

function normalizeStoredLocation(value: string | undefined, allowedLocations: string[]): string {
  const normalizedValue = typeof value === 'string' ? value.trim().toUpperCase() : '';
  if (!normalizedValue) {
    return '';
  }

  return resolveLegacyLocation(normalizedValue, allowedLocations) || normalizedValue;
}

function normalizeStoredProduct<T extends Pick<ProductoCreado, 'nombre' | 'categoria' | 'subcategoria' | 'varianteNombre' | 'ubicacion'>>(
  producto: T,
  allowedLocations: string[] = []
): T {
  const nombreNormalizado = getNormalizedProductName(producto);
  const ubicacionNormalizada = normalizeStoredLocation(producto.ubicacion, allowedLocations);

  if (nombreNormalizado === producto.nombre && ubicacionNormalizada === producto.ubicacion) {
    return producto;
  }

  return {
    ...producto,
    nombre: nombreNormalizado,
    ubicacion: ubicacionNormalizada,
  };
}

function normalizarCantidadOperacion(valor: unknown): number {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero <= 0) {
    return 0;
  }

  return Number(numero.toFixed(4));
}

/**
 * Obtener todos los productos guardados
 */
export function obtenerProductos(): ProductoCreado[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    const productos = JSON.parse(data);
    const standardLocations = getCurrentStandardLocations();
    
    // Eliminar duplicados basándonos en el ID
    const productosUnicos = productos.reduce((acc: ProductoCreado[], producto: ProductoCreado) => {
      const existe = acc.find(p => p.id === producto.id);
      if (!existe) {
        acc.push(producto);
      }
      return acc;
    }, []);
    
    const productosNormalizados = productosUnicos.map((producto: ProductoCreado) =>
      aplicarTemperaturaProducto(normalizeStoredProduct(producto, standardLocations))
    );

    // Si se encontraron duplicados o faltaban campos de temperatura, guardar la versión limpia
    if (JSON.stringify(productosNormalizados) !== JSON.stringify(productos)) {
      if (productosUnicos.length !== productos.length) {
        console.warn(`⚠️ Se encontraron ${productos.length - productosUnicos.length} productos duplicados. Limpiando...`);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(productosNormalizados));
      queueStorageSync(STORAGE_KEY);
    }
    
    return productosNormalizados;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
}

/**
 * Guardar un nuevo producto
 */
export function guardarProducto(
  producto: ProductoCreado | Omit<ProductoCreado, 'id'>,
  opciones: GuardarProductoOpciones = {}
): ProductoCreado {
  try {
    const productos = obtenerProductos();
    const standardLocations = getCurrentStandardLocations();
    const estrategiaDeduplicacion = opciones.estrategiaDeduplicacion || 'id';
    
    // Generar ID si no existe
    const productoConId: ProductoCreado = 'id' in producto 
      ? producto as ProductoCreado
      : { ...producto, id: Date.now().toString() } as ProductoCreado;
    const productoNormalizado = aplicarTemperaturaProducto(normalizeStoredProduct(productoConId, standardLocations));

    if (estrategiaDeduplicacion === 'inventario-canonico') {
      const claveProducto = construirClaveProductoInventario(productoNormalizado);
      const productoCanonicoExistente = productos.find(p =>
        p.id !== productoNormalizado.id &&
        p.activo !== false &&
        construirClaveProductoInventario(p) === claveProducto
      );

      if (productoCanonicoExistente) {
        const productoFusionado = fusionarProductoCanonico(productoCanonicoExistente, productoNormalizado, standardLocations);
        const productosActualizados = productos.map(p => p.id === productoCanonicoExistente.id ? productoFusionado : p);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(productosActualizados));
        queueStorageSync(STORAGE_KEY);
        console.log('✅ Producto fusionado con existente en localStorage:', productoFusionado.nombre);
        return productoFusionado;
      }
    }
    
    // Verificar si el producto ya existe para evitar duplicados
    const existeProducto = productos.find(p => p.id === productoNormalizado.id);
    if (existeProducto) {
      console.warn(`⚠️ Producto con ID ${productoNormalizado.id} ya existe. Use actualizarProducto() en su lugar.`);
      // Actualizar el producto existente en lugar de agregar uno duplicado
      actualizarProducto(productoNormalizado.id, productoNormalizado);
      return productoNormalizado;
    }
    
    productos.push(productoNormalizado);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productos));
    queueStorageSync(STORAGE_KEY);
    console.log('✅ Producto guardado exitosamente en localStorage:', productoNormalizado.nombre);
    
    // Registrar actividad
    registrarActividad(
      'Inventaire',
      'crear',
      `Produit "${productoNormalizado.nombre}" créé - Stock: ${productoNormalizado.stockActual} ${productoNormalizado.unidad}`,
      { productoId: productoNormalizado.id, codigo: productoNormalizado.codigo }
    );
    
    return productoNormalizado;
  } catch (error) {
    console.error('❌ Error al guardar producto:', error);
    throw error;
  }
}

/**
 * Actualizar un producto existente
 */
export function actualizarProducto(id: string, productoActualizado: Partial<ProductoCreado>): void {
  try {
    const productos = obtenerProductos();
    const standardLocations = getCurrentStandardLocations();
    const index = productos.findIndex(p => p.id === id);
    if (index !== -1) {
      const productoAnterior = { ...productos[index] };
      const productoFusionado: Partial<ProductoCreado> = { ...productos[index], ...productoActualizado };
      const tieneCambioExplicitoTemperatura = (
        productoActualizado.temperatura !== undefined ||
        productoActualizado.temperaturaAlmacenamiento !== undefined ||
        productoActualizado.temperaturaOriginalEntrada !== undefined
      );

      if (tieneCambioExplicitoTemperatura && productoActualizado.temperaturaOriginalEntrada === undefined) {
        productoFusionado.temperaturaOriginalEntrada = undefined;
      }

      productos[index] = aplicarTemperaturaProducto(normalizeStoredProduct(productoFusionado as ProductoCreado, standardLocations));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(productos));
      queueStorageSync(STORAGE_KEY);
      sincronizarProductoEnComandasYOfertas(productos[index]);
      
      // Registrar actividad solo si hay cambios significativos
      const cambiosSignificativos = [];
      if (productoActualizado.stockActual !== undefined && productoActualizado.stockActual !== productoAnterior.stockActual) {
        cambiosSignificativos.push(`Stock: ${productoAnterior.stockActual} → ${productoActualizado.stockActual}`);
      }
      if (productoActualizado.nombre !== undefined && productoActualizado.nombre !== productoAnterior.nombre) {
        cambiosSignificativos.push(`Nom modifié`);
      }
      
      if (cambiosSignificativos.length > 0) {
        registrarActividad(
          'Inventaire',
          'modificar',
          `Produit "${productos[index].nombre}" modifié - ${cambiosSignificativos.join(', ')}`,
          { productoId: id, cambios: productoActualizado }
        );
      }
    }
  } catch (error) {
    console.error('Error al actualizar producto:', error);
  }
}

type SincronizarVarianteProductosArgs = {
  varianteId?: string;
  varianteNombreAnterior?: string;
  varianteNombreNuevo?: string;
  categoria: string;
  subcategoria: string;
  icono?: string;
};

export function sincronizarProductosPorVariante({
  varianteId,
  varianteNombreAnterior,
  varianteNombreNuevo,
  categoria,
  subcategoria,
  icono,
}: SincronizarVarianteProductosArgs): number {
  const productos = obtenerProductos();
  const categoriaNormalizada = normalizeProductNameToken(categoria);
  const subcategoriaNormalizada = normalizeProductNameToken(subcategoria);
  const nombresCompatibles = new Set(
    [varianteNombreAnterior, varianteNombreNuevo]
      .map((value) => normalizeProductNameToken(value))
      .filter(Boolean),
  );

  const productosCoincidentes = productos.filter((producto) => {
    const coincidePorVarianteId = Boolean(varianteId) && producto.varianteId === varianteId;
    const coincideCategoriaSubcategoria = !producto.varianteId
      && normalizeProductNameToken(producto.categoria) === categoriaNormalizada
      && normalizeProductNameToken(producto.subcategoria) === subcategoriaNormalizada;
    const varianteNombreProducto = normalizeProductNameToken(producto.varianteNombre);
    const nombreProducto = normalizeProductNameToken(producto.nombre);
    const coincidePorNombreLegacy = coincideCategoriaSubcategoria && (
      (Boolean(varianteNombreProducto) && nombresCompatibles.has(varianteNombreProducto))
      || (!varianteNombreProducto && (
        nombresCompatibles.size === 0
        || nombresCompatibles.has(subcategoriaNormalizada)
        || nombresCompatibles.has(nombreProducto)
      ))
    );

    return coincidePorVarianteId || coincidePorNombreLegacy;
  });

  productosCoincidentes.forEach((producto) => {
    actualizarProducto(producto.id, {
      icono: icono || producto.icono,
      varianteNombre: varianteNombreNuevo || producto.varianteNombre,
    });
  });

  return productosCoincidentes.length;
}

export function descontarStockProductosAtomico(items: ProductoCantidadOperacion[]): { ok: boolean; error?: string } {
  try {
    const cantidades = new Map<string, number>();

    for (const item of items) {
      const cantidad = normalizarCantidadOperacion(item.cantidad);
      if (!item.productoId || cantidad <= 0) {
        continue;
      }

      cantidades.set(item.productoId, normalizarCantidadOperacion((cantidades.get(item.productoId) || 0) + cantidad));
    }

    if (cantidades.size === 0) {
      return { ok: true };
    }

    const productos = obtenerProductos();
    const standardLocations = getCurrentStandardLocations();
    const productosActualizados = [...productos];
    const cambiosStock: Array<{ productoAnterior: ProductoCreado; productoActualizado: ProductoCreado }> = [];

    for (const [productoId, cantidad] of cantidades.entries()) {
      const index = productosActualizados.findIndex(producto => producto.id === productoId);
      if (index === -1) {
        return { ok: false, error: `Producto no encontrado: ${productoId}` };
      }

      const productoAnterior = productosActualizados[index];
      const stockActual = normalizarCantidadOperacion(productoAnterior.stockActual);
      if (stockActual < cantidad) {
        return {
          ok: false,
          error: `Stock insuficiente para expedir ${productoAnterior.nombre}. Disponible: ${stockActual} ${productoAnterior.unidad}.`
        };
      }

      const productoActualizado = aplicarTemperaturaProducto(normalizeStoredProduct({
        ...productoAnterior,
        stockActual: normalizarCantidadOperacion(stockActual - cantidad)
      }, standardLocations));

      productosActualizados[index] = productoActualizado;
      cambiosStock.push({ productoAnterior, productoActualizado });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(productosActualizados));
    queueStorageSync(STORAGE_KEY);

    cambiosStock.forEach(({ productoAnterior, productoActualizado }) => {
      if (productoAnterior.stockActual === productoActualizado.stockActual) {
        return;
      }

      registrarActividad(
        'Inventaire',
        'modificar',
        `Produit "${productoActualizado.nombre}" modifié - Stock: ${productoAnterior.stockActual} → ${productoActualizado.stockActual}`,
        { productoId: productoActualizado.id, cambios: { stockActual: productoActualizado.stockActual } }
      );
    });

    return { ok: true };
  } catch (error) {
    console.error('Error al descontar stock de productos:', error);
    return { ok: false, error: 'No fue posible descontar el inventario reservado' };
  }
}

/**
 * Eliminar un producto
 */
export function eliminarProducto(id: string): void {
  try {
    const productos = obtenerProductos();
    const productoAEliminar = productos.find(p => p.id === id);
    const productosFiltrados = productos.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productosFiltrados));
    queueStorageSync(STORAGE_KEY);
    
    // Registrar actividad
    if (productoAEliminar) {
      registrarActividad(
        'Inventaire',
        'eliminar',
        `Produit "${productoAEliminar.nombre}" supprimé du système`,
        { productoId: id, codigo: productoAEliminar.codigo }
      );
    }
  } catch (error) {
    console.error('Error al eliminar producto:', error);
  }
}

/**
 * Obtener un producto por ID
 */
export function obtenerProductoPorId(id: string): ProductoCreado | undefined {
  const productos = obtenerProductos();
  return productos.find(p => p.id === id);
}

/**
 * Obtener productos activos
 */
export function obtenerProductosActivos(): ProductoCreado[] {
  return obtenerProductos().filter(p => p.activo);
}

/**
 * Buscar productos por nombre o código
 */
export function buscarProductos(query: string): ProductoCreado[] {
  const productos = obtenerProductosActivos();
  const queryLower = query.toLowerCase();
  return productos.filter(p => 
    p.nombre.toLowerCase().includes(queryLower) ||
    p.codigo.toLowerCase().includes(queryLower) ||
    p.categoria.toLowerCase().includes(queryLower) ||
    p.subcategoria.toLowerCase().includes(queryLower)
  );
}

/**
 * 🔧 Migración: Corregir pesoUnitario en productos existentes
 * 
 * Esta función revisa todos los productos y asegura que tienen
 * el campo pesoUnitario correctamente establecido para el cálculo
 * del valor monetario: stockActual × pesoUnitario × valorPorKg
 */
export function migrarPesoUnitarioProductos(): number {
  try {
    const productos = obtenerProductos();
    let productosCorregidos = 0;
    
    productos.forEach(producto => {
      let necesitaActualizacion = false;
      const cambios: Partial<ProductoCreado> = {};
      
      // CASO 1: Si no tiene pesoUnitario pero tiene peso, copiar el valor
      if (!producto.pesoUnitario && producto.peso > 0) {
        cambios.pesoUnitario = producto.peso;
        necesitaActualizacion = true;
        console.log(`✅ Producto "${producto.nombre}": pesoUnitario establecido a ${producto.peso} kg`);
      }
      
      // CASO 2: Si tiene pesoUnitario 0 pero tiene peso > 0, copiar el valor
      if (producto.pesoUnitario === 0 && producto.peso > 0) {
        cambios.pesoUnitario = producto.peso;
        necesitaActualizacion = true;
        console.log(`✅ Producto "${producto.nombre}": pesoUnitario corregido de 0 a ${producto.peso} kg`);
      }
      
      // CASO 3: Si ambos son 0 o undefined, establecer un valor predeterminado de 1kg
      if ((!producto.pesoUnitario || producto.pesoUnitario === 0) && 
          (!producto.peso || producto.peso === 0)) {
        cambios.pesoUnitario = 1; // 1 kg por defecto
        cambios.peso = 1;
        necesitaActualizacion = true;
        console.log(`⚠️ Producto "${producto.nombre}": sin peso definido, establecido a 1 kg por defecto`);
      }
      
      if (necesitaActualizacion) {
        actualizarProducto(producto.id, cambios);
        productosCorregidos++;
      }
    });
    
    if (productosCorregidos > 0) {
      console.log(`✅ Migración completada: ${productosCorregidos} producto(s) corregido(s)`);
    } else {
      console.log('✅ Todos los productos ya tienen pesoUnitario correcto');
    }
    
    return productosCorregidos;
  } catch (error) {
    console.error('❌ Error en migración de pesoUnitario:', error);
    return 0;
  }
}

/**
 * Limpiar todos los productos (útil para testing)
 */
export function limpiarProductos(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    queueStorageSync(STORAGE_KEY);
  } catch (error) {
    console.error('Error al limpiar productos:', error);
  }
}

// 🆘 Exponer función de migración en la consola para uso manual
if (typeof window !== 'undefined') {
  (window as any).migrarPesoUnitarioProductos = migrarPesoUnitarioProductos;
  console.log('🔧 Función de emergencia disponible: migrarPesoUnitarioProductos()');
  
  // 🔍 Función de debug para verificar productos sin pesoUnitario
  (window as any).verificarProductosSinPeso = () => {
    const productos = obtenerProductos();
    const productosSinPeso = productos.filter(p => 
      !p.pesoUnitario || p.pesoUnitario === 0 || !p.peso || p.peso === 0
    );
    
    console.log(`📊 Total de productos: ${productos.length}`);
    console.log(`⚠️ Productos sin peso: ${productosSinPeso.length}`);
    
    if (productosSinPeso.length > 0) {
      console.table(productosSinPeso.map(p => ({
        ID: p.id,
        Nombre: p.nombre,
        Categoría: p.categoria,
        Subcategoría: p.subcategoria,
        Peso: p.peso,
        PesoUnitario: p.pesoUnitario,
        Stock: p.stockActual,
        Unidad: p.unidad
      })));
      
      console.log('💡 Ejecuta migrarPesoUnitarioProductos() para corregir estos productos');
    } else {
      console.log('✅ Todos los productos tienen peso correctamente configurado');
    }
    
    return productosSinPeso;
  };
  
  console.log('🔍 Función de debug disponible: verificarProductosSinPeso()');
  
  // 💰 Función para recalcular valores monetarios de todos los productos
  (window as any).recalcularValoresMonetarios = () => {
    const productos = obtenerProductos();
    let productosActualizados = 0;
    
    productos.forEach(producto => {
      let actualizado = false;
      
      // Si tiene valorUnitario pero no valorTotal, calcularlo
      if (producto.valorUnitario && producto.valorUnitario > 0) {
        const nuevoValorTotal = producto.valorUnitario * producto.stockActual;
        if (producto.valorTotal !== nuevoValorTotal) {
          actualizarProducto(producto.id, { valorTotal: nuevoValorTotal });
          actualizado = true;
        }
      }
      
      if (actualizado) productosActualizados++;
    });
    
    console.log(`✅ ${productosActualizados} productos actualizados con valores monetarios`);
    return productosActualizados;
  };
  
  console.log('💰 Función disponible: recalcularValoresMonetarios()');
}