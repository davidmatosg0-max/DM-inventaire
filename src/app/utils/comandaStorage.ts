import { Comanda, EstadoComanda, EstadoComandaLegacy } from '../types';
import { toast } from 'sonner';
import { registrarActividad } from './actividadLogger';
import { descontarInventarioReservado, validarReservaInventario } from './inventoryReservations';
import { obtenerProductos } from './productStorage';
import { queueStorageSync } from './cloudPersistence';
import { registrarDistribucionCompletada } from './movimientoStorage';
import { obtenerUsuarioSesion } from './sesionStorage';
import {
  resolverTemperaturaProductoCanonica,
  resolverTemperaturaOriginalEntradaProducto,
} from './productTemperature';

const COMANDAS_KEY = 'banco_alimentos_comandas';
export const COMANDAS_UPDATED_EVENT = 'comandas-actualizadas';
const ESTADOS_COMANDA_LEGACY: Record<EstadoComandaLegacy, EstadoComanda> = {
  preparada: 'completada',
  en_transito: 'entregada',
  cancelada: 'anulada'
};

function construirEtiquetaGrupoDistribucion(
  modalidadDistribucion?: string,
  fechaCaducidadGrupo?: string,
  etiquetaActual?: string,
): string | undefined {
  const prefix = modalidadDistribucion === 'collation' || etiquetaActual?.toLowerCase().includes('collation')
    ? 'Distribution Collation'
    : 'Distribution de groupe';

  if (fechaCaducidadGrupo) {
    return `${prefix} ${fechaCaducidadGrupo}`;
  }

  return etiquetaActual || undefined;
}

function emitirActualizacionComandas(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(COMANDAS_UPDATED_EVENT, {
    detail: { timestamp: Date.now() }
  }));
}

type ComandaPersistida = Omit<Comanda, 'estado'> & {
  estado?: Comanda['estado'] | EstadoComandaLegacy | string;
  organismoNombre?: string;
  usuarioCreacion?: string;
  creadoPor?: string;
  numeroComanda?: string;
  items?: Comanda['items'] | unknown;
};

function normalizarItemComanda(item: any, productos = obtenerProductos()) {
  const producto = productos.find(productoActual => productoActual.id === item?.productoId);
  const nombreProducto = item?.nombreProducto || item?.productoNombre || producto?.nombre || '';
  const productoNombre = item?.productoNombre || item?.nombreProducto || producto?.nombre || '';
  const temperatura = resolverTemperaturaProductoCanonica({
    ...(producto || {}),
    nombre: producto?.nombre || nombreProducto,
    nombreProducto,
    productoNombre,
    categoria: producto?.categoria || item?.categoria,
    subcategoria: producto?.subcategoria || item?.subcategoria,
    temperatura: item?.temperatura || producto?.temperatura,
    temperaturaAlmacenamiento: producto?.temperaturaAlmacenamiento,
    temperaturaOriginalEntrada: item?.temperaturaOriginalEntrada || producto?.temperaturaOriginalEntrada,
  });
  const temperaturaOriginalEntrada = resolverTemperaturaOriginalEntradaProducto({
    ...(producto || {}),
    nombre: producto?.nombre || nombreProducto,
    nombreProducto,
    productoNombre,
    categoria: producto?.categoria || item?.categoria,
    subcategoria: producto?.subcategoria || item?.subcategoria,
    temperatura: item?.temperatura || producto?.temperatura,
    temperaturaAlmacenamiento: producto?.temperaturaAlmacenamiento,
    temperaturaOriginalEntrada: item?.temperaturaOriginalEntrada || producto?.temperaturaOriginalEntrada,
  });

  return {
    ...item,
    nombreProducto,
    productoNombre,
    unidad: item?.unidad || producto?.unidad || 'kg',
    icono: item?.icono || producto?.icono,
    temperatura,
    temperaturaOriginalEntrada,
  };
}

function normalizarEstadoComanda(estado?: string): EstadoComanda {
  if (!estado) {
    return 'pendiente';
  }

  if (estado in ESTADOS_COMANDA_LEGACY) {
    return ESTADOS_COMANDA_LEGACY[estado as EstadoComandaLegacy];
  }

  const estadosValidos = new Set<EstadoComanda>(['pendiente', 'confirmada', 'en_preparacion', 'completada', 'entregada', 'anulada']);
  return estadosValidos.has(estado as EstadoComanda) ? (estado as EstadoComanda) : 'pendiente';
}

function normalizarComanda(comanda: ComandaPersistida, productos = obtenerProductos()): Comanda {
  return {
    ...comanda,
    numero: comanda.numero || comanda.numeroComanda || '',
    numeroComanda: comanda.numeroComanda || comanda.numero || '',
    nombreOrganismo: comanda.nombreOrganismo || comanda.organismoNombre || '',
    usuarioCreacion: comanda.usuarioCreacion || comanda.creadoPor || '',
    creadoPor: comanda.creadoPor || comanda.usuarioCreacion || '',
    items: Array.isArray(comanda.items) ? comanda.items.map(item => normalizarItemComanda(item, productos)) : [],
    estado: normalizarEstadoComanda(comanda.estado)
  } as Comanda;
}

function extraerCantidadesComanda(comanda: Comanda) {
  return (comanda.items || []).map(item => ({
    productoId: item.productoId,
    cantidad: Number(item.cantidad || 0)
  }));
}

function sumarCantidadesComanda(comanda: Comanda) {
  const cantidades = new Map<string, number>();

  extraerCantidadesComanda(comanda).forEach((item) => {
    if (!item.productoId || item.cantidad <= 0) {
      return;
    }

    cantidades.set(item.productoId, Number(((cantidades.get(item.productoId) || 0) + item.cantidad).toFixed(4)));
  });

  return Array.from(cantidades.entries()).map(([productoId, cantidad]) => ({ productoId, cantidad }));
}

function obtenerNombreUsuarioMovimiento(comanda: Comanda): string {
  const usuarioSesion = obtenerUsuarioSesion();
  const nombreSesion = [usuarioSesion?.nombre, usuarioSesion?.apellido].filter(Boolean).join(' ').trim();

  return nombreSesion || comanda.usuarioCreacion || comanda.creadoPor || 'Système';
}

function emitirActualizacionInventario(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event('productos-actualizados'));
}

function registrarMovimientosEntregaComanda(
  comanda: Comanda,
  itemsEntregados: Array<{ productoId: string; cantidad: number }>,
  productosAntes = obtenerProductos(),
  productosDespues = obtenerProductos()
): void {
  const usuario = obtenerNombreUsuarioMovimiento(comanda);
  const numeroComanda = comanda.numero || comanda.numeroComanda || comanda.id;
  const organismoNombre = comanda.organismoNombre || comanda.nombreOrganismo || '';
  const productosAntesPorId = new Map(productosAntes.map((producto) => [producto.id, producto]));
  const productosDespuesPorId = new Map(productosDespues.map((producto) => [producto.id, producto]));

  itemsEntregados.forEach((item) => {
    if (!item.productoId || item.cantidad <= 0) {
      return;
    }

    const productoAntes = productosAntesPorId.get(item.productoId);
    const productoDespues = productosDespuesPorId.get(item.productoId);

    registrarDistribucionCompletada(
      item.productoId,
      item.cantidad,
      comanda.organismoId,
      organismoNombre,
      numeroComanda,
      usuario,
      `Commande ${numeroComanda} livrée`,
      productoAntes?.stockActual,
      productoDespues?.stockActual
    );
  });
}

function comandaExigeReserva(estado?: string): boolean {
  return !['entregada', 'anulada', 'cancelada', 'rechazada'].includes(estado || '');
}

// Obtener todas las comandas
export function obtenerComandas(): Comanda[] {
  try {
    const comandasJSON = localStorage.getItem(COMANDAS_KEY);
    if (comandasJSON !== null) {
      const comandasPersistidas = JSON.parse(comandasJSON);
      const productos = obtenerProductos();
      const comandasNormalizadas = Array.isArray(comandasPersistidas)
        ? comandasPersistidas.map((comanda) => normalizarComanda(comanda, productos))
        : [];

      if (JSON.stringify(comandasPersistidas) !== JSON.stringify(comandasNormalizadas)) {
        localStorage.setItem(COMANDAS_KEY, JSON.stringify(comandasNormalizadas));
        queueStorageSync(COMANDAS_KEY);
        emitirActualizacionComandas();
      }

      return comandasNormalizadas;
    }
    return [];
  } catch (error) {
    console.error('Erreur lors du chargement des commandes :', error);
    return [];
  }
}

// Guardar una nueva comanda
export function guardarComanda(comanda: Comanda): void {
  try {
    const comandaNormalizada = normalizarComanda(comanda, obtenerProductos());

    if (comandaExigeReserva(comandaNormalizada.estado)) {
      const validacion = validarReservaInventario(extraerCantidadesComanda(comandaNormalizada));
      if (!validacion.ok) {
        const mensaje = validacion.errores[0] || 'No fue posible reservar inventario para la comanda';
        toast.error(mensaje);
        throw new Error(mensaje);
      }
    }

    const comandas = obtenerComandas();
    comandas.push(comandaNormalizada);
    localStorage.setItem(COMANDAS_KEY, JSON.stringify(comandas));
    queueStorageSync(COMANDAS_KEY);
    emitirActualizacionComandas();
    
    // Registrar actividad
    registrarActividad(
      'Commandes',
      'crear',
      `Commande ${comandaNormalizada.numero} créée pour "${comandaNormalizada.organismoNombre}"`,
      { comandaId: comandaNormalizada.id, numero: comandaNormalizada.numero, organismoId: comandaNormalizada.organismoId }
    );
  } catch (error) {
    console.error('Erreur lors de l’enregistrement de la commande :', error);
    throw error;
  }
}

// Actualizar una comanda existente
export function actualizarComanda(comandaActualizada: Comanda): void {
  try {
    const comandas = obtenerComandas();
    const comandaNormalizada = normalizarComanda(comandaActualizada, obtenerProductos());
    const index = comandas.findIndex(c => c.id === comandaNormalizada.id);
    
    if (index !== -1) {
      const comandaAnterior = normalizarComanda(comandas[index]);

      if (comandaAnterior.estado === 'entregada' && comandaNormalizada.estado !== 'entregada') {
        const mensaje = 'Una comanda expedida no puede volver a un estado anterior';
        toast.error(mensaje);
        throw new Error(mensaje);
      }

      if (comandaExigeReserva(comandaNormalizada.estado)) {
        const validacion = validarReservaInventario(extraerCantidadesComanda(comandaNormalizada), {
          excludeComandaId: comandaNormalizada.id
        });

        if (!validacion.ok) {
          const mensaje = validacion.errores[0] || 'No fue posible mantener la reserva de inventario para la comanda';
          toast.error(mensaje);
          throw new Error(mensaje);
        }
      }

      if (comandaAnterior.estado !== 'entregada' && comandaNormalizada.estado === 'entregada') {
        const itemsEntregados = sumarCantidadesComanda(comandaNormalizada);
        const productosAntes = obtenerProductos();
        const resultado = descontarInventarioReservado(itemsEntregados);
        if (!resultado.ok) {
          const mensaje = resultado.error || 'No fue posible descontar inventario al expedir la comanda';
          toast.error(mensaje);
          throw new Error(mensaje);
        }

        try {
          registrarMovimientosEntregaComanda(comandaNormalizada, itemsEntregados, productosAntes, obtenerProductos());
        } catch (movementError) {
          console.error('Erreur lors de l’enregistrement des mouvements de livraison :', movementError);
        }
      }

      comandas[index] = comandaNormalizada;
      localStorage.setItem(COMANDAS_KEY, JSON.stringify(comandas));
      queueStorageSync(COMANDAS_KEY);
      emitirActualizacionComandas();
      emitirActualizacionInventario();
      
      // Registrar actividad con cambios
      const cambios = [];
      if (comandaAnterior.estado !== comandaNormalizada.estado) {
        cambios.push(`Statut: ${comandaAnterior.estado} → ${comandaNormalizada.estado}`);
      }
      
      registrarActividad(
        'Commandes',
        'modificar',
        `Commande ${comandaNormalizada.numero} modifiée${cambios.length > 0 ? ' - ' + cambios.join(', ') : ''}`,
        { comandaId: comandaNormalizada.id, cambios: { estadoAnterior: comandaAnterior.estado, estadoNuevo: comandaNormalizada.estado } }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande :', error);
    throw error;
  }
}

export function actualizarComandasGrupo(grupoDistribucionId: string, cambios: Partial<Comanda>): Comanda[] {
  try {
    const comandas = obtenerComandas();
    const comandasActualizadas = comandas.map((comanda) => {
      if (comanda.grupoDistribucionId !== grupoDistribucionId) {
        return comanda;
      }

      const grupoDistribucionEtiqueta = construirEtiquetaGrupoDistribucion(
        comanda.modalidadDistribucion,
        cambios.fechaCaducidadGrupo,
        cambios.grupoDistribucionEtiqueta || comanda.grupoDistribucionEtiqueta,
      );

      return normalizarComanda({
        ...comanda,
        ...cambios,
        grupoDistribucionEtiqueta,
        fechaModificacion: new Date().toISOString(),
      }, obtenerProductos());
    });

    localStorage.setItem(COMANDAS_KEY, JSON.stringify(comandasActualizadas));
    queueStorageSync(COMANDAS_KEY);
    emitirActualizacionComandas();

    registrarActividad(
      'Commandes',
      'modificar',
      `Distribution groupée ${grupoDistribucionId} mise à jour`,
      { grupoDistribucionId, cambios }
    );

    return comandasActualizadas.filter(comanda => comanda.grupoDistribucionId === grupoDistribucionId);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des commandes du groupe :', error);
    throw error;
  }
}

export function actualizarComandasDistribucion(
  comandaIds: string[],
  cambios: Partial<Comanda>,
  metadatosGrupo?: Pick<Comanda, 'grupoDistribucionId' | 'grupoDistribucionEtiqueta' | 'grupoDistribucionAnclada'>,
): Comanda[] {
  try {
    const idsObjetivo = new Set(comandaIds);
    const comandas = obtenerComandas();
    const comandasActualizadas = comandas.map((comanda) => {
      if (!idsObjetivo.has(comanda.id)) {
        return comanda;
      }

      const grupoDistribucionEtiqueta = construirEtiquetaGrupoDistribucion(
        comanda.modalidadDistribucion,
        cambios.fechaCaducidadGrupo,
        metadatosGrupo?.grupoDistribucionEtiqueta || comanda.grupoDistribucionEtiqueta,
      );

      return normalizarComanda({
        ...comanda,
        ...metadatosGrupo,
        ...cambios,
        grupoDistribucionEtiqueta,
        fechaModificacion: new Date().toISOString(),
      }, obtenerProductos());
    });

    localStorage.setItem(COMANDAS_KEY, JSON.stringify(comandasActualizadas));
    queueStorageSync(COMANDAS_KEY);
    emitirActualizacionComandas();

    registrarActividad(
      'Commandes',
      'modificar',
      `Distribution ${metadatosGrupo?.grupoDistribucionId || comandaIds.join(',')} mise à jour`,
      { comandaIds, cambios, metadatosGrupo }
    );

    return comandasActualizadas.filter(comanda => idsObjetivo.has(comanda.id));
  } catch (error) {
    console.error('Erreur lors de la mise à jour des commandes de la distribution :', error);
    throw error;
  }
}

// Eliminar una comanda
export function eliminarComanda(comandaId: string): void {
  try {
    const comandas = obtenerComandas();
    const comandaEliminar = comandas.find(c => c.id === comandaId);
    const comandasFiltradas = comandas.filter(c => c.id !== comandaId);
    localStorage.setItem(COMANDAS_KEY, JSON.stringify(comandasFiltradas));
    queueStorageSync(COMANDAS_KEY);
    emitirActualizacionComandas();
    
    // Registrar actividad
    if (comandaEliminar) {
      registrarActividad(
        'Commandes',
        'eliminar',
        `Commande ${comandaEliminar.numero} supprimée`,
        { comandaId, numero: comandaEliminar.numero }
      );
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande :', error);
    throw error;
  }
}

// Obtener comanda por ID
export function obtenerComandaPorId(comandaId: string): Comanda | null {
  const comandas = obtenerComandas();
  return comandas.find(c => c.id === comandaId) || null;
}

// Obtener comandas por organismo
export function obtenerComandasPorOrganismo(organismoId: string): Comanda[] {
  const comandas = obtenerComandas();
  return comandas.filter(c => c.organismoId === organismoId);
}

// Obtener comandas por estado
export function obtenerComandasPorEstado(estado: Comanda['estado']): Comanda[] {
  const comandas = obtenerComandas();
  return comandas.filter(c => c.estado === estado);
}

// Generar número de comanda
export function generarNumeroComanda(): string {
  const comandas = obtenerComandas();
  const ultimoNumero = comandas.length > 0 
    ? Math.max(...comandas.map(c => {
        const match = c.numero.match(/CMD-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      }))
    : 0;
  
  return `CMD-${String(ultimoNumero + 1).padStart(4, '0')}`;
}

// Obtener estadísticas de comandas
export function obtenerEstadisticasComandas() {
  const comandas = obtenerComandas();
  
  return {
    total: comandas.length,
    pendientes: comandas.filter(c => c.estado === 'pendiente').length,
    confirmadas: comandas.filter(c => c.estado === 'confirmada').length,
    enPreparacion: comandas.filter(c => c.estado === 'en_preparacion').length,
    completadas: comandas.filter(c => c.estado === 'completada').length,
    entregadas: comandas.filter(c => c.estado === 'entregada').length,
    anuladas: comandas.filter(c => c.estado === 'anulada').length,
  };
}