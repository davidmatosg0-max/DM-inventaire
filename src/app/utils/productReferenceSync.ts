import { calcularValorMonetario } from './categoriaStorage';
import { queueStorageSync } from './cloudPersistence';
import type { ProductoCreado } from './productStorage';

const COMANDAS_KEY = 'banco_alimentos_comandas';
const OFERTAS_KEY = 'ofertas_sistema';
const COMANDAS_UPDATED_EVENT = 'comandas-actualizadas';

function redondearMoneda(valor: number): number {
  if (!Number.isFinite(valor)) {
    return 0;
  }

  return Number(valor.toFixed(2));
}

function obtenerPesoProducto(producto: ProductoCreado): number {
  const peso = producto.pesoUnitario ?? producto.peso ?? 0;
  return Number.isFinite(peso) ? peso : 0;
}

function sincronizarComandasPorProducto(producto: ProductoCreado): boolean {
  const data = localStorage.getItem(COMANDAS_KEY);
  if (!data) {
    return false;
  }

  let huboCambios = false;
  const pesoProducto = obtenerPesoProducto(producto);
  const comandas = JSON.parse(data);

  if (!Array.isArray(comandas)) {
    return false;
  }

  const comandasActualizadas = comandas.map((comanda: any) => {
    if (!Array.isArray(comanda?.items)) {
      return comanda;
    }

    let cambiosComanda = false;
    const itemsActualizados = comanda.items.map((item: any) => {
      if (item?.productoId !== producto.id) {
        return item;
      }

      cambiosComanda = true;

      return {
        ...item,
        nombreProducto: producto.nombre || item?.nombreProducto || item?.productoNombre,
        productoNombre: producto.nombre || item?.productoNombre || item?.nombreProducto,
        unidad: producto.unidad || item?.unidad,
        icono: producto.icono || item?.icono,
        peso: pesoProducto || item?.peso,
        valorUnitario: typeof producto.valorUnitario === 'number' ? producto.valorUnitario : item?.valorUnitario,
        categoria: producto.categoria || item?.categoria,
        subcategoria: producto.subcategoria || item?.subcategoria,
        temperatura: producto.temperatura || item?.temperatura,
        temperaturaOriginalEntrada: producto.temperaturaOriginalEntrada || item?.temperaturaOriginalEntrada,
      };
    });

    if (!cambiosComanda) {
      return comanda;
    }

    huboCambios = true;

    const pesoTotal = itemsActualizados.reduce((total: number, item: any) => (
      total + (Number(item?.cantidad || 0) * Number(item?.peso || 0))
    ), 0);
    const valorTotal = itemsActualizados.reduce((total: number, item: any) => (
      total + (Number(item?.cantidad || 0) * Number(item?.valorUnitario || 0))
    ), 0);

    return {
      ...comanda,
      items: itemsActualizados,
      pesoTotal: redondearMoneda(pesoTotal),
      valorTotal: redondearMoneda(valorTotal),
    };
  });

  if (!huboCambios) {
    return false;
  }

  localStorage.setItem(COMANDAS_KEY, JSON.stringify(comandasActualizadas));
  queueStorageSync(COMANDAS_KEY);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(COMANDAS_UPDATED_EVENT, {
      detail: { timestamp: Date.now(), productoId: producto.id }
    }));
  }

  return true;
}

function sincronizarOfertasPorProducto(producto: ProductoCreado): boolean {
  const data = localStorage.getItem(OFERTAS_KEY);
  if (!data) {
    return false;
  }

  let huboCambios = false;
  const pesoProducto = obtenerPesoProducto(producto);
  const ofertas = JSON.parse(data);

  if (!Array.isArray(ofertas)) {
    return false;
  }

  const ofertasActualizadas = ofertas.map((oferta: any) => {
    if (!Array.isArray(oferta?.productos)) {
      return oferta;
    }

    let cambiosOferta = false;
    const productosActualizados = oferta.productos.map((productoOferta: any) => {
      if (productoOferta?.productoId !== producto.id) {
        return productoOferta;
      }

      cambiosOferta = true;
      const cantidadOfrecida = Number(productoOferta?.cantidadOfrecida || 0);
      const peso = pesoProducto || Number(productoOferta?.peso || 0);
      const valorTotalCalculado = calcularValorMonetario(
        cantidadOfrecida * peso,
        producto.categoria,
        producto.subcategoria,
        producto.varianteId,
      );
      const valorUnitario = typeof valorTotalCalculado === 'number' && cantidadOfrecida > 0 && peso > 0
        ? redondearMoneda(valorTotalCalculado / (cantidadOfrecida * peso))
        : Number(productoOferta?.valorUnitario || 0);

      return {
        ...productoOferta,
        productoNombre: producto.nombre || productoOferta?.productoNombre,
        productoCodigo: producto.codigo || productoOferta?.productoCodigo,
        categoria: producto.categoria || productoOferta?.categoria,
        subcategoria: producto.subcategoria || productoOferta?.subcategoria,
        unidad: producto.unidad || productoOferta?.unidad,
        peso,
        valorUnitario,
        icono: producto.icono || productoOferta?.icono,
      };
    });

    if (!cambiosOferta) {
      return oferta;
    }

    huboCambios = true;

    return {
      ...oferta,
      productos: productosActualizados,
      totalProductos: productosActualizados.length,
      totalKilos: redondearMoneda(productosActualizados.reduce((total: number, item: any) => (
        total + (Number(item?.cantidadOfrecida || 0) * Number(item?.peso || 0))
      ), 0)),
      valorMonetarioTotal: redondearMoneda(productosActualizados.reduce((total: number, item: any) => (
        total + (Number(item?.cantidadOfrecida || 0) * Number(item?.peso || 0) * Number(item?.valorUnitario || 0))
      ), 0)),
    };
  });

  if (!huboCambios) {
    return false;
  }

  localStorage.setItem(OFERTAS_KEY, JSON.stringify(ofertasActualizadas));
  queueStorageSync(OFERTAS_KEY);
  return true;
}

export function sincronizarProductoEnComandasYOfertas(producto: ProductoCreado): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  sincronizarComandasPorProducto(producto);
  sincronizarOfertasPorProducto(producto);
}