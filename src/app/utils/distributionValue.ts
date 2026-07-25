import { obtenerCategorias } from './categoriaStorage';

type ProductoValorable = {
  categoria?: string;
  categoriaBase?: string;
  subcategoria?: string;
  subcategoriaBase?: string;
  varianteId?: string;
  unidad?: string;
  peso?: number;
  pesoUnitario?: number;
  valorUnitario?: number;
  valorMonetario?: number;
};

function redondearMoneda(valor: number): number {
  return Math.round(valor);
}

function normalizarNumero(valor: unknown): number {
  return typeof valor === 'number' && Number.isFinite(valor) ? valor : 0;
}

export function calcularPesoDistribucionProducto(producto: ProductoValorable | undefined, cantidad: number): number {
  if (!producto || !Number.isFinite(cantidad) || cantidad <= 0) {
    return 0;
  }

  if ((producto.unidad || '').trim().toLowerCase() === 'kg') {
    return redondearMoneda(cantidad);
  }

  const pesoUnitario = normalizarNumero(producto.peso) || normalizarNumero(producto.pesoUnitario);
  return redondearMoneda(cantidad * pesoUnitario);
}

export function calcularValorDistribucionProducto(producto: ProductoValorable | undefined, cantidad: number): {
  pesoTotal: number;
  valorUnitario: number;
  valorTotal: number;
} {
  if (!producto || !Number.isFinite(cantidad) || cantidad <= 0) {
    return { pesoTotal: 0, valorUnitario: 0, valorTotal: 0 };
  }

  const categoria = producto.categoria || producto.categoriaBase || '';
  const pesoTotal = calcularPesoDistribucionProducto(producto, cantidad);

  const valorCategoria = categoria
    ? obtenerCategorias().find((categoriaActual) => categoriaActual.nombre === categoria)?.valorMonetario
    : undefined;

  if (valorCategoria !== undefined && valorCategoria > 0) {
    return {
      pesoTotal,
      valorUnitario: redondearMoneda(valorCategoria),
      valorTotal: redondearMoneda(valorCategoria * cantidad),
    };
  }

  const valorUnitarioFallback = normalizarNumero(producto.valorUnitario) || normalizarNumero(producto.valorMonetario);
  const valorTotalFallback = redondearMoneda(valorUnitarioFallback * cantidad);

  return {
    pesoTotal,
    valorUnitario: redondearMoneda(valorUnitarioFallback),
    valorTotal: valorTotalFallback,
  };
}