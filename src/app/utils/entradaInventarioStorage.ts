/**
 * Sistema de Almacenamiento de Entradas de Inventario
 * Gestiona el almacenamiento persistente en localStorage de todas las entradas
 * de productos (Don/Achat) registradas en el sistema
 */

import { mockProductos, mockMovimientos } from '../data/mockData';
import { 
  guardarProducto, 
  actualizarProducto, 
  obtenerProductoPorId,
  obtenerProductosActivos,
  eliminarProducto,
  construirClaveProductoInventario,
  type ProductoCreado 
} from './productStorage';
import {
  registrarEntrada as registrarMovimientoEntrada,
  actualizarMovimientoEntrada,
  eliminarMovimientosPorDocumento,
  reasignarProductoEnMovimientos
} from './movimientoStorage';

export type EntradaInventario = {
  id: string;
  fecha: string; // ISO string
  tipoEntrada: string; // 'don', 'achat', etc.
  programaNombre: string;
  programaCodigo: string;
  programaColor: string;
  programaIcono: string;
  
  // Información del donador/proveedor
  donadorId: string;
  donadorNombre: string;
  donadorEsCustom: boolean;
  
  // Información del participante PRS (opcional, solo para programa PRS)
  participantePRSId?: string;
  participantePRSNombre?: string;
  
  // Información del producto
  productoId: string;
  nombreProducto: string;
  categoria?: string; // Alias para compatibilidad
  subcategoria?: string; // Alias para compatibilidad
  productoCategoria?: string;
  productoSubcategoria?: string;
  productoIcono?: string;
  productoCodigo?: string;
  varianteId?: string;
  variante?: {
    id: string;
    nombre: string;
    codigo?: string;
    icono?: string;
  };
  
  // Cantidades
  cantidad: number;
  unidad: string;
  pesoUnidad: number; // kg por unidad
  pesoTotal: number; // cantidad × pesoUnidad
  
  // Valores monetarios
  valorUnitario?: number; // Valor por unidad en CAD$
  valorTotal?: number; // valorUnitario × cantidad
  
  // Temperatura
  temperatura: 'ambiente' | 'refrigerado' | 'congelado';
  
  // Detalles opcionales
  lote?: string;
  fechaCaducidad?: string;
  detallesEmpaque?: string; // Ejemplo: "45x900ml", "24x500g"
  observaciones?: string;
  
  // Metadata
  creadoPor?: string;
  fechaCreacion: string;
  activo: boolean;
};

function convertirTemperaturaAlmacenamiento(
  temperatura: EntradaInventario['temperatura'] | string | undefined,
): 'Temperatura Ambiente' | 'Refrigerado' | 'Congelado' {
  switch (temperatura) {
    case 'refrigerado':
    case 'Refrigerado':
      return 'Refrigerado';
    case 'congelado':
    case 'Congelado':
      return 'Congelado';
    default:
      return 'Temperatura Ambiente';
  }
}

const STORAGE_KEY = 'banco_alimentos_entradas_inventario';

const DEFAULT_PRODUCT_LOCATION = 'Almacén Principal';

function seleccionarUbicacionCanonica(ubicacionActual?: string, ubicacionDuplicada?: string): string {
  const actual = typeof ubicacionActual === 'string' ? ubicacionActual.trim() : '';
  const duplicada = typeof ubicacionDuplicada === 'string' ? ubicacionDuplicada.trim() : '';

  if (actual && actual !== DEFAULT_PRODUCT_LOCATION) {
    return actual;
  }

  if (duplicada && duplicada !== DEFAULT_PRODUCT_LOCATION) {
    return duplicada;
  }

  return actual || duplicada || DEFAULT_PRODUCT_LOCATION;
}

function seleccionarFechaReciente(fechaActual?: string, fechaDuplicada?: string): string {
  if (!fechaActual) return fechaDuplicada || '';
  if (!fechaDuplicada) return fechaActual;

  return new Date(fechaDuplicada).getTime() > new Date(fechaActual).getTime() ? fechaDuplicada : fechaActual;
}

function sincronizarProductoEnMemoria(productoId: string): void {
  const productoActualizado = obtenerProductoPorId(productoId);
  if (!productoActualizado) return;

  const indexMock = mockProductos.findIndex((producto: any) => producto.id === productoId);
  if (indexMock !== -1) {
    mockProductos[indexMock] = {
      ...mockProductos[indexMock],
      ...productoActualizado,
    };
    return;
  }

  mockProductos.push(productoActualizado as any);
}

function recalcularProductoDesdeEntradas(productoId: string): void {
  const producto = obtenerProductoPorId(productoId);
  if (!producto) return;

  const entradasActivasProducto = obtenerTodasLasEntradas().filter(
    entrada => entrada.activo && entrada.productoId === productoId
  );

  const stockActual = entradasActivasProducto.reduce((total, entrada) => total + entrada.cantidad, 0);
  const pesoRegistrado = entradasActivasProducto.reduce(
    (total, entrada) => total + (entrada.pesoTotal || (entrada.cantidad * entrada.pesoUnidad)),
    0
  );
  const valorTotal = entradasActivasProducto.reduce((total, entrada) => {
    if (typeof entrada.valorTotal === 'number') {
      return total + entrada.valorTotal;
    }

    if (typeof entrada.valorUnitario === 'number' && entrada.valorUnitario > 0) {
      return total + (entrada.valorUnitario * entrada.cantidad);
    }

    return total;
  }, 0);
  const cantidadConValor = entradasActivasProducto.reduce((total, entrada) => {
    if (typeof entrada.valorUnitario === 'number' && entrada.valorUnitario > 0) {
      return total + entrada.cantidad;
    }

    if (typeof entrada.valorTotal === 'number' && entrada.valorTotal > 0 && entrada.cantidad > 0) {
      return total + entrada.cantidad;
    }

    return total;
  }, 0);
  const entradaMasReciente = entradasActivasProducto.reduce<EntradaInventario | undefined>((reciente, actual) => {
    if (!reciente) return actual;
    return new Date(actual.fecha).getTime() > new Date(reciente.fecha).getTime() ? actual : reciente;
  }, undefined);

  actualizarProducto(productoId, {
    stockActual,
    pesoRegistrado,
    lote: entradaMasReciente?.lote || '',
    fechaVencimiento: entradaMasReciente?.fechaCaducidad || '',
    temperaturaAlmacenamiento: convertirTemperaturaAlmacenamiento(entradaMasReciente?.temperatura),
    temperaturaOriginalEntrada: entradaMasReciente?.temperatura || 'ambiente',
    valorUnitario: cantidadConValor > 0 ? valorTotal / cantidadConValor : 0,
    valorTotal,
  });

  sincronizarProductoEnMemoria(productoId);
}

export function migrarProductosDuplicadosInventario(): {
  productosFusionados: number;
  entradasReasignadas: number;
  movimientosReasignados: number;
} {
  try {
    const productosOrdenados = obtenerProductosActivos()
      .slice()
      .sort((left, right) => new Date(left.fechaCreacion || 0).getTime() - new Date(right.fechaCreacion || 0).getTime());
    const entradas = obtenerTodasLasEntradas();
    const productosPorClave = new Map<string, ProductoCreado>();
    const productosCanonicosActualizados = new Set<string>();
    let entradasReasignadas = 0;
    let movimientosReasignados = 0;
    let productosFusionados = 0;
    let entradasModificadas = false;

    for (const producto of productosOrdenados) {
      const claveProducto = construirClaveProductoInventario(producto);
      const productoCanonico = productosPorClave.get(claveProducto);

      if (!productoCanonico) {
        productosPorClave.set(claveProducto, producto);
        continue;
      }

      if (productoCanonico.id === producto.id) {
        continue;
      }

      for (const entrada of entradas) {
        if (entrada.productoId === producto.id) {
          entrada.productoId = productoCanonico.id;
          entradasReasignadas += 1;
          entradasModificadas = true;
        }
      }

      movimientosReasignados += reasignarProductoEnMovimientos(producto.id, productoCanonico.id);

      actualizarProducto(productoCanonico.id, {
        lote: productoCanonico.lote || producto.lote,
        fechaVencimiento: seleccionarFechaReciente(productoCanonico.fechaVencimiento, producto.fechaVencimiento),
        ubicacion: seleccionarUbicacionCanonica(productoCanonico.ubicacion, producto.ubicacion),
        icono: productoCanonico.icono || producto.icono,
      });

      eliminarProducto(producto.id);

      const mockIndex = mockProductos.findIndex((item: any) => item.id === producto.id);
      if (mockIndex !== -1) {
        mockProductos.splice(mockIndex, 1);
      }

      const mockMovimientoIds = mockMovimientos.filter((movimiento: any) => movimiento.productoId === producto.id);
      mockMovimientoIds.forEach((movimiento: any) => {
        movimiento.productoId = productoCanonico.id;
      });

      productosCanonicosActualizados.add(productoCanonico.id);
      productosFusionados += 1;
    }

    if (entradasModificadas) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entradas));
    }

    productosCanonicosActualizados.forEach(productoId => {
      recalcularProductoDesdeEntradas(productoId);
    });

    return {
      productosFusionados,
      entradasReasignadas,
      movimientosReasignados,
    };
  } catch (error) {
    console.error('Error al migrar productos duplicados de inventario:', error);
    return {
      productosFusionados: 0,
      entradasReasignadas: 0,
      movimientosReasignados: 0,
    };
  }
}

function construirEntradaActualizada(
  entradaActual: EntradaInventario,
  datos: Partial<EntradaInventario>
): EntradaInventario {
  const cantidadFinal = datos.cantidad ?? entradaActual.cantidad;
  const pesoUnidadFinal = datos.pesoUnidad ?? entradaActual.pesoUnidad;
  const valorUnitarioFinal = datos.valorUnitario ?? entradaActual.valorUnitario;

  return {
    ...entradaActual,
    ...datos,
    id: entradaActual.id,
    fechaCreacion: entradaActual.fechaCreacion,
    pesoTotal: datos.pesoTotal ?? (cantidadFinal * pesoUnidadFinal),
    valorTotal: typeof valorUnitarioFinal === 'number' && valorUnitarioFinal > 0
      ? (datos.valorTotal ?? (valorUnitarioFinal * cantidadFinal))
      : (datos.valorTotal ?? entradaActual.valorTotal),
  };
}

/**
 * Obtener todas las entradas de inventario
 */
export function obtenerTodasLasEntradas(): EntradaInventario[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error al obtener entradas de inventario:', error);
    return [];
  }
}

/**
 * Alias para obtenerTodasLasEntradas (compatibilidad)
 */
export const obtenerEntradas = obtenerTodasLasEntradas;

/**
 * Obtener solo las entradas activas
 */
export function obtenerEntradasActivas(): EntradaInventario[] {
  return obtenerTodasLasEntradas().filter(entrada => entrada.activo);
}

/**
 * Obtener una entrada por ID
 */
export function obtenerEntradaPorId(id: string): EntradaInventario | undefined {
  return obtenerTodasLasEntradas().find(entrada => entrada.id === id);
}

/**
 * Guardar una nueva entrada de inventario
 * ✅ AUTOMÁTICAMENTE registra el producto en el inventario (mockProductos)
 * ✅ AUTOMÁTICAMENTE crea el movimiento de inventario (mockMovimientos)
 * ✅ AUTOMÁTICAMENTE guarda en el historial de entradas (localStorage)
 * 
 * Esta función hace TODO el trabajo necesario:
 * - Si el producto existe: actualiza su stock
 * - Si es nuevo: lo crea con todos sus datos
 * - Registra el movimiento de entrada
 * - Guarda en el historial persistente
 * 
 * NO es necesario hacer ningún registro manual adicional.
 */
export function guardarEntrada(entrada: Omit<EntradaInventario, 'id' | 'fechaCreacion' | 'activo'>): EntradaInventario {
  const nuevaEntrada: EntradaInventario = {
    ...entrada,
    id: `ENT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    fechaCreacion: new Date().toISOString(),
    activo: true,
  };

  // ✅ REGISTRAR AUTOMÁTICAMENTE EN EL INVENTARIO
  const productoIdReal = registrarEnInventario(nuevaEntrada);
  nuevaEntrada.productoId = productoIdReal;

  const entradas = obtenerTodasLasEntradas();
  entradas.push(nuevaEntrada);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entradas));
  
  return nuevaEntrada;
}

/**
 * Función auxiliar para registrar una entrada en el inventario automáticamente
 * ✅ ACTUALIZADO: Ahora guarda productos persistentemente en localStorage
 */
function registrarEnInventario(entrada: EntradaInventario): string {
  // Determinar la categoría correcta (puede venir en varios campos)
  const categoriaFinal = entrada.categoria || entrada.productoCategoria || 'Sin categoría';
  const subcategoriaFinal = entrada.subcategoria || entrada.productoSubcategoria || '';
  
  console.log(`📦 Registrando en inventario: ${entrada.nombreProducto} (${entrada.cantidad} ${entrada.unidad})`);
  
  // 🔄 PASO 1: Verificar si el producto ya existe en localStorage (persistente)
  // ⚠️ REGLA IMPORTANTE: Productos con diferente peso unitario o variante son productos DIFERENTES
  const productosLocalStorage = obtenerProductosActivos();
  
  // Tolerancia para comparar pesos (0.001 kg = 1 gramo)
  const TOLERANCIA_PESO = 0.001;
  const claveEntrada = construirClaveProductoInventario({
    nombre: entrada.nombreProducto,
    categoria: categoriaFinal,
    subcategoria: subcategoriaFinal,
    varianteId: entrada.varianteId,
    varianteNombre: entrada.variante?.nombre,
    peso: entrada.pesoUnidad,
    pesoUnitario: entrada.pesoUnidad,
  });
  
  const productoExistenteLS = productosLocalStorage.find((p) => {
    const pesoUnitarioProducto = p.pesoUnitario || 0;
    const pesoCoincide = Math.abs(pesoUnitarioProducto - entrada.pesoUnidad) < TOLERANCIA_PESO;

    return pesoCoincide && construirClaveProductoInventario(p) === claveEntrada;
  });
  
  console.log(`🔍 Producto existente encontrado: ${productoExistenteLS ? productoExistenteLS.nombre : 'NO'} (Total productos en localStorage: ${productosLocalStorage.length})`);

  // 🔄 PASO 2: Verificar si el producto existe en mockProductos (memoria)
  const productoExistenteMock = mockProductos.find((p: any) => {
    const pesoUnitarioProducto = p.pesoUnitario || 0;
    const pesoCoincide = Math.abs(pesoUnitarioProducto - entrada.pesoUnidad) < TOLERANCIA_PESO;

    return pesoCoincide && construirClaveProductoInventario(p) === claveEntrada;
  });

  let productoId = '';

  if (productoExistenteLS) {
    // ✅ CASO A: El producto YA EXISTE en localStorage - ACTUALIZAR STOCK
    productoId = productoExistenteLS.id;
    
    const nuevoStockActual = productoExistenteLS.stockActual + entrada.cantidad;
    
    // Calcular valorUnitario y valorTotal si están disponibles en la entrada
    let valorUnitario = productoExistenteLS.valorUnitario;
    let valorTotal = productoExistenteLS.valorTotal;
    
    // Si la entrada tiene valor unitario, actualizar
    if (entrada.valorUnitario && entrada.valorUnitario > 0) {
      // Promedio ponderado de valores
      const valorAnterior = (productoExistenteLS.valorUnitario || 0) * productoExistenteLS.stockActual;
      const valorNuevo = entrada.valorUnitario * entrada.cantidad;
      valorUnitario = (valorAnterior + valorNuevo) / nuevoStockActual;
    }
    
    // Recalcular valorTotal basado en el nuevo stock
    if (valorUnitario && valorUnitario > 0) {
      valorTotal = valorUnitario * nuevoStockActual;
    }
    
    // Actualizar en localStorage (persistente)
    actualizarProducto(productoId, {
      stockActual: nuevoStockActual,
      lote: entrada.lote || productoExistenteLS.lote,
      fechaVencimiento: entrada.fechaCaducidad || productoExistenteLS.fechaVencimiento,
      pesoRegistrado: (productoExistenteLS.pesoRegistrado || 0) + entrada.pesoTotal,
      temperaturaAlmacenamiento: convertirTemperaturaAlmacenamiento(entrada.temperatura),
      temperaturaOriginalEntrada: entrada.temperatura,
      valorUnitario,
      valorTotal
    });
    
    // Actualizar también en mockProductos (memoria) para reflejar cambios inmediatamente
    const indexMock = mockProductos.findIndex((p: any) => p.id === productoId);
    if (indexMock !== -1) {
      mockProductos[indexMock] = {
        ...mockProductos[indexMock],
        stockActual: mockProductos[indexMock].stockActual + entrada.cantidad,
        lote: entrada.lote || mockProductos[indexMock].lote,
        fechaVencimiento: entrada.fechaCaducidad || mockProductos[indexMock].fechaVencimiento,
        pesoRegistrado: (mockProductos[indexMock].pesoRegistrado || 0) + entrada.pesoTotal
      };
    } else {
      // Si no está en mockProductos, agregarlo desde localStorage
      const productoActualizado = obtenerProductoPorId(productoId);
      if (productoActualizado) {
        mockProductos.push(productoActualizado as any);
      }
    }
    
    console.log(`✅ Stock actualizado (localStorage + memoria): ${entrada.nombreProducto} +${entrada.cantidad} ${entrada.unidad}`);
    
  } else if (productoExistenteMock) {
    // 🔄 CASO B: El producto existe en mockProductos pero NO en localStorage
    // Esto puede pasar con productos mock iniciales - migrar a localStorage
    productoId = productoExistenteMock.id;
    
    const productoParaGuardar: ProductoCreado = {
      id: productoId,
      codigo: productoExistenteMock.codigo || `AUTO-${Date.now()}`,
      nombre: productoExistenteMock.nombre,
      categoria: categoriaFinal,
      subcategoria: subcategoriaFinal,
      stockActual: productoExistenteMock.stockActual + entrada.cantidad,
      stockMinimo: productoExistenteMock.stockMinimo || Math.round(entrada.cantidad * 0.2),
      unidad: entrada.unidad,
      peso: entrada.pesoUnidad,
      pesoUnitario: entrada.pesoUnidad,
      pesoRegistrado: entrada.pesoTotal,
      lote: entrada.lote || productoExistenteMock.lote || '',
      fechaVencimiento: entrada.fechaCaducidad || productoExistenteMock.fechaVencimiento || '',
      icono: entrada.productoIcono || productoExistenteMock.icono || '📦',
      ubicacion: productoExistenteMock.ubicacion || 'Almacén Principal',
      esPRS: false,
      activo: true,
      fechaCreacion: new Date().toISOString()
    };
    
    // Guardar en localStorage
    guardarProducto(productoParaGuardar);
    
    // Actualizar mockProductos
    const indexMock = mockProductos.findIndex((p: any) => p.id === productoId);
    if (indexMock !== -1) {
      mockProductos[indexMock] = {
        ...mockProductos[indexMock],
        stockActual: mockProductos[indexMock].stockActual + entrada.cantidad,
        pesoUnitario: entrada.pesoUnidad,
        pesoRegistrado: (mockProductos[indexMock].pesoRegistrado || 0) + entrada.pesoTotal,
        lote: entrada.lote || mockProductos[indexMock].lote,
        fechaVencimiento: entrada.fechaCaducidad || mockProductos[indexMock].fechaVencimiento
      };
    }
    
    console.log(`✅ Producto migrado a localStorage y stock actualizado: ${entrada.nombreProducto}`);
    
  } else {
    // ✅ CASO C: El producto NO EXISTE - CREAR NUEVO en localStorage y mockProductos
    productoId = entrada.productoId && entrada.productoId !== 'custom' 
      ? entrada.productoId 
      : `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const nuevoProducto: ProductoCreado = {
      id: productoId,
      codigo: entrada.productoCodigo || `AUTO-${Date.now()}`,
      nombre: entrada.nombreProducto,
      categoria: categoriaFinal,
      subcategoria: subcategoriaFinal,
      varianteId: entrada.varianteId,
      varianteNombre: entrada.variante?.nombre,
      stockActual: entrada.cantidad,
      stockMinimo: Math.round(entrada.cantidad * 0.2), // 20% del stock inicial
      unidad: entrada.unidad,
      peso: entrada.pesoUnidad,
      pesoUnitario: entrada.pesoUnidad,
      pesoRegistrado: entrada.pesoTotal,
      valorUnitario: entrada.valorUnitario || 0,
      valorTotal: entrada.valorUnitario ? entrada.valorUnitario * entrada.cantidad : 0,
      temperaturaAlmacenamiento: convertirTemperaturaAlmacenamiento(entrada.temperatura),
      temperaturaOriginalEntrada: entrada.temperatura,
      lote: entrada.lote || '',
      fechaVencimiento: entrada.fechaCaducidad || '',
      icono: entrada.variante?.icono || entrada.productoIcono || '📦', // Usar icono de la variante si existe
      ubicacion: 'Almacén Principal',
      esPRS: false,
      activo: true,
      fechaCreacion: new Date().toISOString()
    };
    
    // Guardar en localStorage (persistente)
    guardarProducto(nuevoProducto);
    
    // Agregar también a mockProductos (memoria) para visualización inmediata
    const nuevoProductoMock = {
      ...nuevoProducto,
      estado: 'Disponible' as const,
      temperatura: entrada.temperatura || 'ambiente' as const,
      programaEntrada: entrada.tipoEntrada,
      documentoReferencia: entrada.id,
      esTemporal: false
    };
    mockProductos.push(nuevoProductoMock);
  }

  // 📝 PASO 3: Registrar movimiento de entrada
  registrarMovimientoEntrada(
    productoId,
    entrada.cantidad,
    `Entrada ${entrada.programaCodigo} - ${entrada.donadorNombre}`,
    entrada.creadoPor || 'Usuario Actual',
    entrada.id, // documentoReferencia
    undefined, // cantidadAnterior
    undefined, // cantidadActual
    entrada.pesoUnidad, // pesoUnitario
    entrada.fecha // fechaEntrada - usar la fecha de la entrada, no la fecha de caducidad
  );
  
  console.log(`✅ Movimiento registrado: ${entrada.programaCodigo} - ${entrada.nombreProducto}`);
  console.log(`📊 Resumen: Producto ID ${productoId} ahora tiene stock actualizado en localStorage`);

  return productoId;
}

/**
 * Actualizar una entrada existente
 */
export function actualizarEntrada(id: string, datos: Partial<EntradaInventario>): boolean {
  const entradas = obtenerTodasLasEntradas();
  const index = entradas.findIndex(e => e.id === id);
  
  if (index === -1) return false;

  const entradaAnterior = entradas[index];
  const entradaActualizada = construirEntradaActualizada(entradaAnterior, datos);
  entradas[index] = entradaActualizada;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entradas));

  recalcularProductoDesdeEntradas(entradaActualizada.productoId);

  if (entradaAnterior.productoId !== entradaActualizada.productoId) {
    recalcularProductoDesdeEntradas(entradaAnterior.productoId);
  }

  if (!entradaActualizada.activo) {
    eliminarMovimientosPorDocumento(entradaActualizada.id);
    return true;
  }

  actualizarMovimientoEntrada(entradaActualizada.id, {
    productoId: entradaActualizada.productoId,
    cantidad: entradaActualizada.cantidad,
    motivo: `Entrada ${entradaActualizada.programaCodigo} - ${entradaActualizada.donadorNombre}`,
    usuario: entradaActualizada.creadoPor || 'Usuario Actual',
    pesoUnitario: entradaActualizada.pesoUnidad,
    fechaEntrada: entradaActualizada.fecha,
  });

  return true;
}

/**
 * Eliminar una entrada (soft delete)
 */
export function eliminarEntrada(id: string): boolean {
  return actualizarEntrada(id, { activo: false });
}

/**
 * Eliminar permanentemente una entrada
 */
export function eliminarEntradaPermanente(id: string): boolean {
  const entradas = obtenerTodasLasEntradas();
  const nuevasEntradas = entradas.filter(e => e.id !== id);
  
  if (nuevasEntradas.length === entradas.length) return false;
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevasEntradas));
  return true;
}

/**
 * Obtener entradas filtradas por tipo
 */
export function obtenerEntradasPorTipo(tipo: string): EntradaInventario[] {
  return obtenerEntradasActivas().filter(entrada => entrada.tipoEntrada === tipo);
}

/**
 * Obtener entradas filtradas por rango de fechas
 */
export function obtenerEntradasPorFechas(fechaInicio: Date, fechaFin: Date): EntradaInventario[] {
  return obtenerEntradasActivas().filter(entrada => {
    const fecha = new Date(entrada.fecha);
    return fecha >= fechaInicio && fecha <= fechaFin;
  });
}

/**
 * Obtener entradas filtradas por producto
 */
export function obtenerEntradasPorProducto(productoId: string): EntradaInventario[] {
  return obtenerEntradasActivas().filter(entrada => entrada.productoId === productoId);
}

/**
 * Obtener entradas filtradas por donador/proveedor
 */
export function obtenerEntradasPorDonador(donadorId: string): EntradaInventario[] {
  return obtenerEntradasActivas().filter(entrada => entrada.donadorId === donadorId);
}

/**
 * Obtener estadísticas de entradas
 */
export function obtenerEstadisticasEntradas() {
  const entradas = obtenerEntradasActivas();
  
  return {
    total: entradas.length,
    porTipo: {
      don: entradas.filter(e => e.tipoEntrada === 'don').length,
      achat: entradas.filter(e => e.tipoEntrada === 'achat').length,
      otros: entradas.filter(e => e.tipoEntrada !== 'don' && e.tipoEntrada !== 'achat').length,
    },
    pesoTotal: entradas.reduce((sum, e) => sum + e.pesoTotal, 0),
    porTemperatura: {
      ambiente: entradas.filter(e => e.temperatura === 'ambiente').length,
      refrigerado: entradas.filter(e => e.temperatura === 'refrigerado').length,
      congelado: entradas.filter(e => e.temperatura === 'congelado').length,
    },
  };
}

/**
 * Exportar todas las entradas a JSON
 */
export function exportarEntradasJSON(): string {
  return JSON.stringify(obtenerTodasLasEntradas(), null, 2);
}

/**
 * Importar entradas desde JSON
 */
export function importarEntradasJSON(json: string): boolean {
  try {
    const entradas = JSON.parse(json);
    if (!Array.isArray(entradas)) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entradas));
    return true;
  } catch (error) {
    console.error('Error al importar entradas:', error);
    return false;
  }
}

/**
 * Limpiar todas las entradas (requiere confirmación)
 */
export function limpiarTodasLasEntradas(): boolean {
  localStorage.removeItem(STORAGE_KEY);
  return true;
}