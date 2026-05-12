import { obtenerComandas as obtenerComandasCanonicas } from '../../utils/comandaStorage';
import { obtenerOfertas, type Oferta as OfertaSistema, type SolicitudOferta } from '../../utils/ofertaStorage';
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

type ReportOfferRequestStatus = Extract<SolicitudOferta['estado'], 'aceptada' | 'entregada'>;

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

function getOfferRequestDate(solicitud: SolicitudOferta): string {
  return solicitud.fechaActualizacion || solicitud.fechaSolicitud;
}

function mapOfferRequestStatusToReportStatus(status: ReportOfferRequestStatus): ReportComanda['estado'] {
  return status === 'entregada' ? 'entregada' : 'confirmada';
}

function getOfferProductWeight(producto: OfertaSistema['productos'][number], cantidad: number): number {
  const peso = readFiniteNumber(producto.peso) ?? 0;

  if (producto.unidad === 'kg') {
    return cantidad;
  }

  return cantidad * peso;
}

function getOfferRequestProducts(
  oferta: OfertaSistema,
  solicitud: SolicitudOferta,
): ReportComandaProduct[] {
  return solicitud.productosAceptados.map((productoAceptado) => {
    const productoOferta = oferta.productos.find((producto) => producto.productoId === productoAceptado.productoId);

    return {
      productoId: productoAceptado.productoId,
      productoNombre: productoOferta?.productoNombre || 'Produit sans nom',
      cantidad: productoAceptado.cantidadAceptada,
      unidad: productoOferta?.unidad || 'u',
    };
  });
}

function adaptOfferRequestToReport(
  oferta: OfertaSistema,
  solicitud: SolicitudOferta,
): ReportComanda | null {
  if (solicitud.estado !== 'aceptada' && solicitud.estado !== 'entregada') {
    return null;
  }

  const productos = getOfferRequestProducts(oferta, solicitud);
  const fecha = getOfferRequestDate(solicitud);
  const totalPeso = solicitud.productosAceptados.reduce((sum, productoAceptado) => {
    const productoOferta = oferta.productos.find((producto) => producto.productoId === productoAceptado.productoId);
    if (!productoOferta) {
      return sum;
    }

    return sum + getOfferProductWeight(productoOferta, productoAceptado.cantidadAceptada);
  }, 0);
  const totalValorMonetario = solicitud.productosAceptados.reduce((sum, productoAceptado) => {
    const productoOferta = oferta.productos.find((producto) => producto.productoId === productoAceptado.productoId);
    const valorUnitario = productoOferta ? (readFiniteNumber(productoOferta.valorUnitario) ?? 0) : 0;

    return sum + (productoAceptado.cantidadAceptada * valorUnitario);
  }, 0);

  return {
    id: `OFE-SOL-${solicitud.id}`,
    numero: `${oferta.numeroOferta}-${solicitud.id}`,
    organismoId: solicitud.organismoId,
    organismoNombre: solicitud.organismoNombre,
    fecha,
    fechaEntrega: solicitud.estado === 'entregada' ? fecha : undefined,
    estado: mapOfferRequestStatusToReportStatus(solicitud.estado),
    observaciones: solicitud.observaciones,
    productos,
    totalPeso,
    totalValorMonetario,
  };
}

function obtenerSolicitudesOfertaReporte(): ReportComanda[] {
  return obtenerOfertas().flatMap((oferta) => (
    (oferta.solicitudes || []).reduce<ReportComanda[]>((reportes, solicitud) => {
      const reporte = adaptOfferRequestToReport(oferta, solicitud);

      if (reporte) {
        reportes.push(reporte);
      }

      return reportes;
    }, [])
  ));
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
  return [
    ...obtenerComandasCanonicas().map(adaptComandaToReport),
    ...obtenerSolicitudesOfertaReporte(),
  ];
}