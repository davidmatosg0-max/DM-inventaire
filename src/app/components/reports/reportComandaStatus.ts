import type { ReportComanda } from './reportComandas';

export type ReportComandaStatusFilter = 'all' | ReportComanda['estado'];

export function isActiveReportComanda(comanda: Pick<ReportComanda, 'estado'>): boolean {
  return comanda.estado !== 'anulada';
}

export function matchesReportComandaStatusFilter(
  comanda: Pick<ReportComanda, 'estado'>,
  statusFilter: ReportComandaStatusFilter
): boolean {
  if (statusFilter === 'all') {
    return isActiveReportComanda(comanda);
  }

  return comanda.estado === statusFilter;
}