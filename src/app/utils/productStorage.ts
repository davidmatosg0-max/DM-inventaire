// Sistema de almacenamiento de productos creados en Configuración

import { registrarActividad } from './actividadLogger';
import { buildLocationOptions, loadLocationZones, resolveLegacyLocation } from './locationZones';
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

type ProductoInventarioComparable = Pick<ProductoCreado, 'categoria' | 'subcategoria' | 'varianteNombre' | 'peso' | 'pesoUnitario'> & {
  varianteId?: string;
};

const STORAGE_KEY = 'banco_alimentos_productos';

function normalizeProductNameToken(value?: string): string {
  return typeof value === 'string' ? value.trim().replace(/\s+/g, ' ').toLowerCase() : '';
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
export function guardarProducto(producto: ProductoCreado | Omit<ProductoCreado, 'id'>): ProductoCreado {
  try {
    const productos = obtenerProductos();
    const standardLocations = getCurrentStandardLocations();
    
    // Generar ID si no existe
    const productoConId: ProductoCreado = 'id' in producto 
      ? producto as ProductoCreado
      : { ...producto, id: Date.now().toString() } as ProductoCreado;
    const productoNormalizado = aplicarTemperaturaProducto(normalizeStoredProduct(productoConId, standardLocations));
    
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
      productos[index] = aplicarTemperaturaProducto(normalizeStoredProduct({ ...productos[index], ...productoActualizado }, standardLocations));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(productos));
      
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

/**
 * Eliminar un producto
 */
export function eliminarProducto(id: string): void {
  try {
    const productos = obtenerProductos();
    const productoAEliminar = productos.find(p => p.id === id);
    const productosFiltrados = productos.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productosFiltrados));
    
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