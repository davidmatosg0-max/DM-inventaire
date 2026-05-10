import { descontarStockProductosAtomico, obtenerProductos } from './productStorage';

const OFERTAS_KEY = 'ofertas_sistema';
const COMANDAS_KEY = 'banco_alimentos_comandas';

type ProductoCantidad = {
  productoId: string;
  cantidad: number;
};

type ReservaScope = {
  excludeOfertaId?: string;
  excludeComandaId?: string;
};

export type ReservaInventarioProducto = {
  stockActual: number;
  reservadoEnOfertas: number;
  reservadoEnComandas: number;
  totalReservado: number;
  disponibleParaReservar: number;
};

type OfertaLike = {
  id?: string;
  activa?: boolean;
  estado?: string;
  fechaExpiracion?: string;
  productos?: Array<{
    productoId: string;
    cantidadOfrecida?: number;
  }>;
  aceptaciones?: Array<{
    productos?: Array<{
      productoId: string;
      cantidadAceptada?: number;
    }>;
  }>;
  solicitudes?: Array<{
    estado?: string;
    productosAceptados?: Array<{
      productoId: string;
      cantidadAceptada?: number;
    }>;
  }>;
};

type ComandaLike = {
  id?: string;
  estado?: string;
  items?: Array<{
    productoId: string;
    cantidad?: number;
  }>;
  productos?: Array<{
    productoId: string;
    cantidad?: number;
  }>;
};

const COMANDA_ESTADOS_LIBERADOS = new Set(['entregada', 'anulada', 'cancelada', 'rechazada']);

function leerArrayStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Error al leer reservas desde ${key}:`, error);
    return [];
  }
}

function normalizarCantidad(valor: unknown): number {
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero <= 0) {
    return 0;
  }

  return Number(numero.toFixed(4));
}

function sumarCantidades(items: ProductoCantidad[]): ProductoCantidad[] {
  const acumulado = new Map<string, number>();

  for (const item of items) {
    const cantidad = normalizarCantidad(item.cantidad);
    if (!item.productoId || cantidad <= 0) {
      continue;
    }

    acumulado.set(item.productoId, normalizarCantidad((acumulado.get(item.productoId) || 0) + cantidad));
  }

  return Array.from(acumulado.entries()).map(([productoId, cantidad]) => ({ productoId, cantidad }));
}

function sumarCantidadesSolicitud(
  oferta: OfertaLike,
  productoId: string,
  estados: string[]
): number {
  return normalizarCantidad(
    (oferta.solicitudes || []).reduce((total, solicitud) => {
      if (!estados.includes(solicitud.estado || '')) {
        return total;
      }

      const cantidadSolicitud = (solicitud.productosAceptados || []).reduce((subtotal, item) => {
        if (item.productoId !== productoId) {
          return subtotal;
        }

        return subtotal + normalizarCantidad(item.cantidadAceptada);
      }, 0);

      return total + cantidadSolicitud;
    }, 0)
  );
}

function sumarCantidadesAceptacionLegacy(oferta: OfertaLike, productoId: string): number {
  return normalizarCantidad(
    (oferta.aceptaciones || []).reduce((total, aceptacion) => {
      const cantidadAceptada = (aceptacion.productos || []).reduce((subtotal, item) => {
        if (item.productoId !== productoId) {
          return subtotal;
        }

        return subtotal + normalizarCantidad(item.cantidadAceptada);
      }, 0);

      return total + cantidadAceptada;
    }, 0)
  );
}

function ofertaReservaInventarioCompleta(oferta: OfertaLike): boolean {
  if (oferta.activa === false) {
    return false;
  }

  if (oferta.estado === 'expirada') {
    return false;
  }

  if (!oferta.fechaExpiracion) {
    return true;
  }

  return new Date(oferta.fechaExpiracion) > new Date();
}

function comandaMantieneReserva(estado?: string): boolean {
  return !COMANDA_ESTADOS_LIBERADOS.has(estado || '');
}

function obtenerItemsComanda(comanda: ComandaLike): ProductoCantidad[] {
  const items = Array.isArray(comanda.items) ? comanda.items : Array.isArray(comanda.productos) ? comanda.productos : [];

  return sumarCantidades(
    items.map(item => ({
      productoId: item.productoId,
      cantidad: normalizarCantidad(item.cantidad)
    }))
  );
}

export function obtenerReservaInventarioProducto(productoId: string, scope: ReservaScope = {}) {
  return obtenerResumenReservasInventario([productoId], scope)[productoId] || {
    stockActual: 0,
    reservadoEnOfertas: 0,
    reservadoEnComandas: 0,
    totalReservado: 0,
    disponibleParaReservar: 0
  };
}

export function obtenerResumenReservasInventario(productIds?: string[], scope: ReservaScope = {}) {
  const productos = obtenerProductos();
  const ofertas = leerArrayStorage<OfertaLike>(OFERTAS_KEY);
  const comandas = leerArrayStorage<ComandaLike>(COMANDAS_KEY);
  const filtroIds = productIds ? new Set(productIds) : null;
  const resumen = new Map<string, ReservaInventarioProducto>();

  const asegurarResumen = (productoId: string) => {
    if (filtroIds && !filtroIds.has(productoId)) {
      return null;
    }

    if (!resumen.has(productoId)) {
      const producto = productos.find(item => item.id === productoId);
      resumen.set(productoId, {
        stockActual: normalizarCantidad(producto?.stockActual || 0),
        reservadoEnOfertas: 0,
        reservadoEnComandas: 0,
        totalReservado: 0,
        disponibleParaReservar: normalizarCantidad(producto?.stockActual || 0)
      });
    }

    return resumen.get(productoId) || null;
  };

  if (filtroIds) {
    for (const productoId of filtroIds) {
      asegurarResumen(productoId);
    }
  }

  for (const oferta of ofertas) {
    if (!oferta.id || oferta.id === scope.excludeOfertaId) {
      continue;
    }

    for (const item of oferta.productos || []) {
      if (!item.productoId) {
        continue;
      }

      const entry = asegurarResumen(item.productoId);
      if (!entry) {
        continue;
      }

      const cantidadOfrecida = normalizarCantidad(item.cantidadOfrecida);
      if (cantidadOfrecida <= 0) {
        continue;
      }

      const cantidadEntregada = sumarCantidadesSolicitud(oferta, item.productoId, ['entregada']);
      const cantidadAceptada = sumarCantidadesSolicitud(oferta, item.productoId, ['aceptada']);
      const cantidadLegacy = sumarCantidadesAceptacionLegacy(oferta, item.productoId);

      if (ofertaReservaInventarioCompleta(oferta)) {
        entry.reservadoEnOfertas = normalizarCantidad(entry.reservadoEnOfertas + Math.max(cantidadOfrecida - cantidadEntregada, 0));
      } else {
        entry.reservadoEnOfertas = normalizarCantidad(entry.reservadoEnOfertas + cantidadAceptada + cantidadLegacy);
      }
    }
  }

  for (const comanda of comandas) {
    if (!comanda.id || comanda.id === scope.excludeComandaId || !comandaMantieneReserva(comanda.estado)) {
      continue;
    }

    for (const item of obtenerItemsComanda(comanda)) {
      const entry = asegurarResumen(item.productoId);
      if (!entry) {
        continue;
      }

      entry.reservadoEnComandas = normalizarCantidad(entry.reservadoEnComandas + item.cantidad);
    }
  }

  for (const [productoId, entry] of resumen.entries()) {
    entry.totalReservado = normalizarCantidad(entry.reservadoEnOfertas + entry.reservadoEnComandas);
    entry.disponibleParaReservar = normalizarCantidad(Math.max(entry.stockActual - entry.totalReservado, 0));
    resumen.set(productoId, entry);
  }

  if (!filtroIds) {
    for (const producto of productos) {
      asegurarResumen(producto.id);
    }
  }

  return Object.fromEntries(resumen.entries());
}

export function validarReservaInventario(items: ProductoCantidad[], scope: ReservaScope = {}) {
  const productos = obtenerProductos();
  const cantidades = sumarCantidades(items);
  const errores: string[] = [];

  for (const item of cantidades) {
    const producto = productos.find(entry => entry.id === item.productoId);
    if (!producto) {
      errores.push(`Producto no encontrado: ${item.productoId}`);
      continue;
    }

    const reserva = obtenerReservaInventarioProducto(item.productoId, scope);
    if (item.cantidad > reserva.disponibleParaReservar) {
      errores.push(
        `Stock reservable insuficiente para ${producto.nombre}. Disponible para nuevas reservas: ${reserva.disponibleParaReservar} ${producto.unidad}. Ya reservado: ${reserva.totalReservado} ${producto.unidad}.`
      );
    }
  }

  return {
    ok: errores.length === 0,
    errores
  };
}

export function descontarInventarioReservado(items: ProductoCantidad[]) {
  return descontarStockProductosAtomico(sumarCantidades(items));
}