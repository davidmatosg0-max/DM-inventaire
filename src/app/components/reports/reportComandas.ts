import { obtenerComandas as obtenerComandasCanonicas } from '../../utils/comandaStorage';
import type { Comanda, ItemComanda } from '../../types';

export interface ReportComandaProduct {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  unidad: string;
}

export interface ReportComanda {
  id: string;
  numero: string;
  organismoId: string;
  organismoNombre: string;
  organismoFrecuencia?: string;
  fecha: string;
  fechaEntrega?: string;
  estado: Comanda['estado'];
  observaciones?: string;
  productos: ReportComandaProduct[];
  totalPeso: number;
  totalValorMonetario: number;
}

function readFiniteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getItemQuantity(item: ItemComanda): number {
  const candidates = [item.cantidadAceptada, item.cantidadPreparada, item.cantidad];

  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate;
    }
  }

  return 0;
}

function getItemName(item: ItemComanda): string {
  return item.productoNombre || item.nombreProducto || 'Produit sans nom';
}

function getReportProducts(items: ItemComanda[]): ReportComandaProduct[] {
  return items.map((item) => ({
    productoId: item.productoId,
    productoNombre: getItemName(item),
    cantidad: getItemQuantity(item),
    unidad: item.unidad || 'u',
  }));
}

function getReportFrequency(comanda: Comanda): string | undefined {
  const runtimeComanda = comanda as Comanda & {
    organismoFrecuencia?: string;
    frecuenciaEntrega?: string;
    organismo?: {
      frecuenciaEntrega?: string;
    };
  };

  return runtimeComanda.organismoFrecuencia || runtimeComanda.frecuenciaEntrega || runtimeComanda.organismo?.frecuenciaEntrega;
}

export function adaptComandaToReport(comanda: Comanda): ReportComanda {
  const runtimeComanda = comanda as Comanda & {
    totalPeso?: unknown;
    totalValorMonetario?: unknown;
    organismoNombre?: string;
  };

  const productos = getReportProducts(comanda.items || []);
  const totalPeso = readFiniteNumber(runtimeComanda.totalPeso)
    ?? productos.reduce((sum, producto) => sum + producto.cantidad, 0);
  const totalValorMonetario = readFiniteNumber(runtimeComanda.totalValorMonetario)
    ?? (comanda.items || []).reduce(
      (sum, item) => sum + (getItemQuantity(item) * (readFiniteNumber(item.valorUnitario) ?? 0)),
      0,
    );

  return {
    id: comanda.id,
    numero: comanda.numero,
    organismoId: comanda.organismoId,
    organismoNombre: comanda.nombreOrganismo || runtimeComanda.organismoNombre || 'Organisme sans nom',
    organismoFrecuencia: getReportFrequency(comanda),
    fecha: comanda.fechaEntrega || comanda.fecha,
    fechaEntrega: comanda.fechaEntrega,
    estado: comanda.estado,
    observaciones: comanda.observaciones,
    productos,
    totalPeso,
    totalValorMonetario,
  };
}

export function obtenerComandasReporte(): ReportComanda[] {
  return obtenerComandasCanonicas().map(adaptComandaToReport);
}