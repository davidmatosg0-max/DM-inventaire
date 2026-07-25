import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Calendar, Filter, TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { formatMoney } from '../../utils/formatUtils';
import { toast } from 'sonner';
import { exportarReportePersonalizado } from '../../utils/exportarPDF';
import { exportarDatosPersonalizados } from '../../utils/exportarExcel';
import {
  comptoirStorageEvents,
  comptoirStorageKeys,
  obtenirDistributionsComptoir,
  obtenirEvenementsSpeciauxComptoir,
  obtenirInscriptionsEvenementsSpeciauxComptoir,
  type ComptoirDistribution,
  type ComptoirSpecialEvent,
  type ComptoirSpecialEventRegistration,
} from '../../utils/comptoirStorage';
import type { AidRequest, AidType } from '../pages/IDDigital';

type ReportPeriod = 'week' | 'month' | 'quarter' | 'year' | 'custom';
type ReportCategory = 'regular' | 'special';
type ReportSourceFilter = 'all' | ReportDistributionRecord['source'];

interface RapportsProps {
  aidRequests?: AidRequest[];
  aidTypes?: AidType[];
}

interface DistributionSummary {
  type: string;
  distributions: number;
  quantity: number;
  beneficiaries: number;
  percentage: number;
  averageValue: number;
  totalValue: number;
  color: string;
}

interface ReportDistributionRecord {
  id: string | number;
  beneficiaire: string;
  beneficiaireId: string;
  type: string;
  quantite: number;
  estimatedValue?: number;
  date: string;
  source: 'distribution' | 'approvedRequest' | 'specialEvent';
  eventId?: string;
  eventName?: string;
  status?: ComptoirSpecialEventRegistration['statut'];
}

const DEFAULT_TYPE_COLORS = ['#1E73BE', '#4CAF50', '#FFC107', '#DC3545', '#7E57C2'];

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getPeriodRange(period: Exclude<ReportPeriod, 'custom'>): { start: string; end: string } {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);

  if (period === 'week') {
    start.setDate(start.getDate() - 6);
  }

  if (period === 'month') {
    start.setDate(1);
  }

  if (period === 'quarter') {
    const quarterStartMonth = Math.floor(start.getMonth() / 3) * 3;
    start.setMonth(quarterStartMonth, 1);
  }

  if (period === 'year') {
    start.setMonth(0, 1);
  }

  return {
    start: formatDateInput(start),
    end: formatDateInput(end),
  };
}

function parseDateValue(value?: string | null, endOfDay = false): Date | null {
  if (!value) return null;

  const trimmedValue = value.trim();
  const directDate = new Date(trimmedValue);

  if (!Number.isNaN(directDate.getTime())) {
    if (endOfDay) {
      directDate.setHours(23, 59, 59, 999);
    }
    return directDate;
  }

  const dateMatch = trimmedValue.match(/^(\d{4}-\d{2}-\d{2})/);
  if (!dateMatch) return null;

  const fallbackDate = new Date(`${dateMatch[1]}T00:00:00`);
  if (Number.isNaN(fallbackDate.getTime())) return null;
  if (endOfDay) {
    fallbackDate.setHours(23, 59, 59, 999);
  }
  return fallbackDate;
}

function isDateInRange(value: Date | null, start: Date | null, end: Date | null): boolean {
  if (!value || !start || !end) return false;
  return value >= start && value <= end;
}

function getReferenceDate(request: AidRequest): Date | null {
  return (
    parseDateValue(request.appointmentDate) ||
    parseDateValue(request.processedDate) ||
    parseDateValue(request.dateRequested)
  );
}

function shiftDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getMonthBuckets(reference: Date, count = 6): Array<{ key: string; label: string }> {
  const buckets: Array<{ key: string; label: string }> = [];

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(reference.getFullYear(), reference.getMonth() - index, 1);
    buckets.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('fr-CA', { month: 'short' }),
    });
  }

  return buckets;
}

function getMonthKey(date: Date | null): string | null {
  if (!date) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getDateKey(value?: string | null): string {
  const parsedDate = parseDateValue(value);
  if (!parsedDate) return '';
  return formatDateInput(parsedDate);
}

function normalizeTypeName(value?: string | null): string {
  return (value || '').trim().toLowerCase();
}

export function Rapports({ aidRequests = [], aidTypes = [] }: RapportsProps) {
  const { t } = useTranslation();
  const currentMonthRange = getPeriodRange('month');
  const [periode, setPeriode] = useState<ReportPeriod>('month');
  const [reportCategory, setReportCategory] = useState<ReportCategory>('regular');
  const [typeAide, setTypeAide] = useState('all');
  const [sourceFilter, setSourceFilter] = useState<ReportSourceFilter>('all');
  const [specialEventFilter, setSpecialEventFilter] = useState('all');
  const [dateDebut, setDateDebut] = useState(currentMonthRange.start);
  const [dateFin, setDateFin] = useState(currentMonthRange.end);
  const [distributions, setDistributions] = useState<ComptoirDistribution[]>(() => obtenirDistributionsComptoir());
  const [specialEvents, setSpecialEvents] = useState<ComptoirSpecialEvent[]>(() => obtenirEvenementsSpeciauxComptoir());
  const [specialEventRegistrations, setSpecialEventRegistrations] = useState<ComptoirSpecialEventRegistration[]>(() => obtenirInscriptionsEvenementsSpeciauxComptoir());

  useEffect(() => {
    if (periode === 'custom') return;
    const range = getPeriodRange(periode);
    setDateDebut(range.start);
    setDateFin(range.end);
  }, [periode]);

  useEffect(() => {
    const refreshData = () => {
      setDistributions(obtenirDistributionsComptoir());
      setSpecialEvents(obtenirEvenementsSpeciauxComptoir());
      setSpecialEventRegistrations(obtenirInscriptionsEvenementsSpeciauxComptoir());
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === comptoirStorageKeys.distributions
        || event.key === comptoirStorageKeys.specialEvents
        || event.key === comptoirStorageKeys.specialEventRegistrations
      ) {
        refreshData();
      }
    };

    const handleComptoirStorageUpdated = (event: Event) => {
      const { detail } = event as CustomEvent<{ key?: string }>;
      if (
        detail?.key === comptoirStorageKeys.distributions
        || detail?.key === comptoirStorageKeys.specialEvents
        || detail?.key === comptoirStorageKeys.specialEventRegistrations
      ) {
        refreshData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(comptoirStorageEvents.updated, handleComptoirStorageUpdated);
    window.addEventListener('focus', refreshData);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(comptoirStorageEvents.updated, handleComptoirStorageUpdated);
      window.removeEventListener('focus', refreshData);
    };
  }, []);

  const startDate = parseDateValue(dateDebut);
  const endDate = parseDateValue(dateFin, true);
  const selectedAidTypes = aidTypes.filter((type) => type.isActive !== false);
  const approvedRequests = aidRequests.filter((request) => request.status === 'approved');
  const distributionOperationKeys = new Set(
    distributions.map((distribution) => (
      `${distribution.beneficiaireId || distribution.beneficiaire}__${normalizeTypeName(distribution.type)}__${distribution.quantite}__${getDateKey(distribution.date)}`
    ))
  );
  const approvedRequestsWithoutDistribution = approvedRequests.filter((request) => {
    const requestDateKey = getDateKey(request.appointmentDate || request.processedDate || request.dateRequested);
    const operationKey = `${request.beneficiaireId || request.beneficiaire}__${normalizeTypeName(request.type)}__${request.quantite}__${requestDateKey}`;
    return !distributionOperationKeys.has(operationKey);
  });
  const reportRecords: ReportDistributionRecord[] = [
    ...distributions.map((distribution) => ({
      id: distribution.id,
      beneficiaire: distribution.beneficiaire,
      beneficiaireId: distribution.beneficiaireId,
      type: distribution.type,
      quantite: distribution.quantite,
      estimatedValue: distribution.estimatedValue,
      date: distribution.date,
      source: 'distribution' as const,
    })),
    ...approvedRequestsWithoutDistribution.map((request) => ({
      id: request.id,
      beneficiaire: request.beneficiaire,
      beneficiaireId: request.beneficiaireId,
      type: request.type,
      quantite: request.quantite,
      estimatedValue: request.estimatedValue,
      date: request.appointmentDate || request.processedDate || request.dateRequested,
      source: 'approvedRequest' as const,
    })),
  ];

  const specialEventById = specialEvents.reduce<Map<string, ComptoirSpecialEvent>>((acc, event) => {
    acc.set(event.id, event);
    return acc;
  }, new Map<string, ComptoirSpecialEvent>());

  const specialEventRecords = specialEventRegistrations
    .filter((registration) => registration.statut !== 'annule')
    .flatMap((registration) => {
      const event = specialEventById.get(registration.eventId);
      const eventName = event?.nom || 'Evenement special';
      const fallbackDate = registration.appointmentDate || event?.fechaInicio || registration.createdAt;

      if (Array.isArray(registration.aidItems) && registration.aidItems.length > 0) {
        return registration.aidItems.map((aidItem, index) => ({
          id: `${registration.id}-${index + 1}`,
          beneficiaire: registration.beneficiaireNom,
          beneficiaireId: registration.beneficiaireId,
          type: aidItem.aidTypeName || registration.aidTypeName || 'Sans type defini',
          quantite: Math.max(1, aidItem.quantity || 0),
          date: fallbackDate,
          source: 'specialEvent' as const,
          eventId: registration.eventId,
          eventName,
          status: registration.statut,
        }));
      }

      return [{
        id: registration.id,
        beneficiaire: registration.beneficiaireNom,
        beneficiaireId: registration.beneficiaireId,
        type: registration.aidTypeName || 'Sans type defini',
        quantite: Math.max(1, registration.aidQuantity || 1),
        date: fallbackDate,
        source: 'specialEvent' as const,
        eventId: registration.eventId,
        eventName,
        status: registration.statut,
      }];
    });

  const availableSpecialEventFilters = specialEvents
    .map((event) => ({ id: event.id, name: event.nom }))
    .sort((left, right) => left.name.localeCompare(right.name));

  const recordsForCategory = reportCategory === 'special' ? specialEventRecords : reportRecords;

  const derivedAidTypes = recordsForCategory.reduce<Array<{ name: string; color: string; defaultValue?: number }>>((acc, record, index) => {
    if (acc.some((type) => type.name === record.type)) {
      return acc;
    }
    acc.push({
      name: record.type,
      color: DEFAULT_TYPE_COLORS[index % DEFAULT_TYPE_COLORS.length],
    });
    return acc;
  }, []);
  const aidTypeOptions = [...selectedAidTypes, ...derivedAidTypes.filter((type) => !selectedAidTypes.some((option) => option.name === type.name))];
  const recordsByTypeAndSource = recordsForCategory.filter((record) => {
    if (typeAide !== 'all' && record.type !== typeAide) {
      return false;
    }

    if (reportCategory === 'special' && specialEventFilter !== 'all' && record.eventId !== specialEventFilter) {
      return false;
    }

    if (reportCategory === 'regular' && sourceFilter !== 'all' && record.source !== sourceFilter) {
      return false;
    }

    return true;
  });
  const filteredRecords = recordsByTypeAndSource.filter((record) => isDateInRange(parseDateValue(record.date), startDate, endDate));

  const rangeDays = startDate && endDate
    ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
    : 30;
  const previousStart = startDate ? shiftDays(startDate, -rangeDays) : null;
  const previousEnd = endDate ? shiftDays(endDate, -rangeDays) : null;
  const previousRecords = recordsByTypeAndSource.filter((record) => isDateInRange(parseDateValue(record.date), previousStart, previousEnd));

  const getAidTypeMetadata = (typeName: string) => {
    const matchingAidType = aidTypeOptions.find((type) => type.name === typeName);
    return {
      color: matchingAidType?.color || DEFAULT_TYPE_COLORS[0],
      defaultValue: matchingAidType?.defaultValue || 0,
    };
  };

  const getRecordValue = (record: ReportDistributionRecord) => {
    if (typeof record.estimatedValue === 'number') {
      return record.estimatedValue;
    }

    const metadata = getAidTypeMetadata(record.type);
    return metadata.defaultValue * record.quantite;
  };

  const distributionsByTypeMap = filteredRecords.reduce<Map<string, DistributionSummary>>((acc, record) => {
    const existingItem = acc.get(record.type);
    const requestValue = getRecordValue(record);
    const metadata = getAidTypeMetadata(record.type);

    if (existingItem) {
      existingItem.distributions += 1;
      existingItem.quantity += record.quantite;
      existingItem.totalValue += requestValue;
      acc.set(record.type, existingItem);
      return acc;
    }

    acc.set(record.type, {
      type: record.type,
      distributions: 1,
      quantity: record.quantite,
      beneficiaries: 0,
      percentage: 0,
      averageValue: 0,
      totalValue: requestValue,
      color: metadata.color,
    });

    return acc;
  }, new Map<string, DistributionSummary>());

  const beneficiaryGroups = filteredRecords.reduce<Map<string, Set<string>>>((acc, record) => {
    const key = record.type;
    const currentSet = acc.get(key) || new Set<string>();
    currentSet.add(record.beneficiaireId || record.beneficiaire);
    acc.set(key, currentSet);
    return acc;
  }, new Map<string, Set<string>>());

  const totalDistributions = filteredRecords.length;
  const totalQuantity = filteredRecords.reduce((sum, record) => sum + record.quantite, 0);
  const totalBeneficiaries = new Set(filteredRecords.map((record) => record.beneficiaireId || record.beneficiaire)).size;
  const totalValue = filteredRecords.reduce((sum, record) => sum + getRecordValue(record), 0);
  const previousTotalDistributions = previousRecords.length;
  const trendValue = previousTotalDistributions === 0
    ? (totalDistributions > 0 ? 100 : 0)
    : ((totalDistributions - previousTotalDistributions) / previousTotalDistributions) * 100;
  const trendLabel = `${trendValue >= 0 ? '+' : ''}${Math.round(trendValue)}%`;
  const hasDirectDistributions = reportCategory === 'regular' && filteredRecords.some((record) => record.source === 'distribution');
  const hasApprovedRequests = reportCategory === 'regular' && filteredRecords.some((record) => record.source === 'approvedRequest');
  const exportDetailTitle = reportCategory === 'special'
    ? 'Aides en evenements speciaux'
    : hasDirectDistributions && hasApprovedRequests
      ? 'Distributions et demandes approuvees'
      : hasDirectDistributions
        ? 'Distributions enregistrees'
        : 'Demandes approuvees';

  const distributionsParType = Array.from(distributionsByTypeMap.values())
    .map((item) => {
      const beneficiaries = beneficiaryGroups.get(item.type)?.size || 0;
      const averageValue = item.distributions > 0 ? item.totalValue / item.distributions : 0;

      return {
        ...item,
        beneficiaries,
        percentage: totalDistributions > 0 ? Math.round((item.distributions / totalDistributions) * 100) : 0,
        averageValue,
      };
    })
    .sort((left, right) => right.distributions - left.distributions);

  const evolutionMensuelle = getMonthBuckets(endDate || new Date(), 6).map((bucket) => {
    const distributions = recordsByTypeAndSource.filter((record) => getMonthKey(parseDateValue(record.date)) === bucket.key).length;
    return {
      mois: bucket.label,
      distributions,
    };
  });

  const stats = {
    totalBeneficiaires: totalBeneficiaries,
    totalDistributions,
    valeurTotale: formatMoney(totalValue),
    tendance: trendLabel,
  };

  useEffect(() => {
    if (typeAide === 'all') {
      return;
    }

    const typeExists = aidTypeOptions.some((option) => option.name === typeAide);
    if (!typeExists) {
      setTypeAide('all');
    }
  }, [typeAide, aidTypeOptions]);

  useEffect(() => {
    if (reportCategory !== 'special') {
      return;
    }

    if (specialEventFilter === 'all') {
      return;
    }

    const eventExists = availableSpecialEventFilters.some((event) => event.id === specialEventFilter);
    if (!eventExists) {
      setSpecialEventFilter('all');
    }
  }, [reportCategory, specialEventFilter, availableSpecialEventFilters]);

  const selectedSpecialEventName = specialEventFilter === 'all'
    ? 'Tous les evenements'
    : availableSpecialEventFilters.find((event) => event.id === specialEventFilter)?.name || 'Evenement special';

  const getSourceLabel = (source: ReportSourceFilter) => {
    switch (source) {
      case 'distribution':
        return 'Distributions directes';
      case 'approvedRequest':
        return 'Demandes approuvees';
      case 'specialEvent':
        return 'Evenements speciaux';
      case 'all':
      default:
        return 'Toutes les origines';
    }
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    setPeriode('custom');
    if (field === 'start') {
      setDateDebut(value);
      return;
    }
    setDateFin(value);
  };

  const handleExportPdf = () => {
    if (filteredRecords.length === 0) {
      toast.info('Aucune distribution enregistree a exporter pour cette periode.');
      return;
    }

    exportarReportePersonalizado(
      reportCategory === 'special' ? 'Rapport evenements speciaux' : 'Rapport aides regulieres',
      reportCategory === 'special'
        ? `Periode: ${dateDebut} - ${dateFin} | Type: ${typeAide === 'all' ? 'Tous' : typeAide} | Evenement: ${selectedSpecialEventName}`
        : `Periode: ${dateDebut} - ${dateFin} | Type: ${typeAide === 'all' ? 'Tous' : typeAide} | Origine: ${getSourceLabel(sourceFilter)}`,
      [
        {
          titulo: 'Resume',
          columnas: ['Beneficiaires', 'Distributions', 'Valeur totale', 'Tendance'],
          datos: [[stats.totalBeneficiaires, stats.totalDistributions, `${stats.valeurTotale} CAD$`, stats.tendance]],
        },
        {
          titulo: 'Distribution par type',
          columnas: ['Type', 'Distributions', 'Quantite', 'Beneficiaires', 'Valeur moyenne', 'Valeur totale'],
          datos: distributionsParType.map((item) => [
            item.type,
            item.distributions,
            item.quantity,
            item.beneficiaries,
            `${formatMoney(item.averageValue)} CAD$`,
            `${formatMoney(item.totalValue)} CAD$`,
          ]),
        },
        {
          titulo: exportDetailTitle,
          columnas: reportCategory === 'special'
            ? ['ID', 'Evenement', 'Beneficiaire', 'Numero', 'Type', 'Quantite', 'Date', 'Valeur']
            : ['ID', 'Beneficiaire', 'Numero', 'Type', 'Origine', 'Quantite', 'Date', 'Valeur'],
          datos: filteredRecords.map((record) => [
            record.id,
            ...(reportCategory === 'special'
              ? [
                record.eventName || 'Evenement special',
                record.beneficiaire,
                record.beneficiaireId,
                record.type,
                record.quantite,
                record.date || '-',
                `${formatMoney(getRecordValue(record))} CAD$`,
              ]
              : [
                record.beneficiaire,
                record.beneficiaireId,
                record.type,
                record.source === 'distribution' ? 'Distribution directe' : 'Demande approuvee',
                record.quantite,
                record.date || '-',
                `${formatMoney(getRecordValue(record))} CAD$`,
              ]),
          ]),
        },
      ]
    );
  };

  const handleExportExcel = () => {
    if (filteredRecords.length === 0) {
      toast.info('Aucune distribution enregistree a exporter pour cette periode.');
      return;
    }

    exportarDatosPersonalizados(reportCategory === 'special' ? 'rapport-evenements-speciaux' : 'rapport-aides-regulieres', [
      {
        nombre: 'Resume',
        datos: [{
          beneficiaires: stats.totalBeneficiaires,
          distributions: stats.totalDistributions,
          valeurTotale: stats.valeurTotale,
          tendance: stats.tendance,
          periode: `${dateDebut} - ${dateFin}`,
          typeAide: typeAide === 'all' ? 'Tous' : typeAide,
          rapport: reportCategory === 'special' ? 'Evenements speciaux' : 'Aides regulieres',
          typeEvenement: reportCategory === 'special' ? selectedSpecialEventName : '-',
          origine: reportCategory === 'special' ? 'Evenements speciaux' : getSourceLabel(sourceFilter),
        }],
      },
      {
        nombre: 'Distribution par type',
        datos: distributionsParType.map((item) => ({
          type: item.type,
          distributions: item.distributions,
          quantite: item.quantity,
          beneficiaires: item.beneficiaries,
          valeurMoyenne: formatMoney(item.averageValue),
          valeurTotale: formatMoney(item.totalValue),
        })),
      },
      {
        nombre: exportDetailTitle,
        datos: filteredRecords.map((record) => ({
          id: record.id,
          evenement: reportCategory === 'special' ? (record.eventName || 'Evenement special') : '-',
          beneficiaire: record.beneficiaire,
          numeroDossier: record.beneficiaireId,
          type: record.type,
          origine: reportCategory === 'special'
            ? 'Evenement special'
            : record.source === 'distribution'
              ? 'Distribution directe'
              : 'Demande approuvee',
          quantite: record.quantite,
          date: record.date || '-',
          valeur: formatMoney(getRecordValue(record)),
        })),
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Barre de filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <Label>Rapport</Label>
                <Select
                  value={reportCategory}
                  onValueChange={(value) => {
                    const nextValue = value as ReportCategory;
                    setReportCategory(nextValue);
                    if (nextValue === 'special') {
                      setSourceFilter('all');
                    }
                  }}
                >
                  <SelectTrigger>
                    <FileText className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Aides regulieres</SelectItem>
                    <SelectItem value="special">Evenements speciaux</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('comptoir.period')}</Label>
                <Select value={periode} onValueChange={setPeriode}>
                  <SelectTrigger>
                    <Calendar className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">{t('comptoir.thisWeek')}</SelectItem>
                    <SelectItem value="month">{t('comptoir.thisMonth')}</SelectItem>
                    <SelectItem value="quarter">{t('comptoir.thisQuarter')}</SelectItem>
                    <SelectItem value="year">{t('comptoir.thisYear')}</SelectItem>
                    <SelectItem value="custom">{t('comptoir.customPeriod')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('comptoir.aidType')}</Label>
                <Select value={typeAide} onValueChange={setTypeAide}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {aidTypeOptions.map((type) => (
                      <SelectItem key={type.name} value={type.name}>{type.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {reportCategory === 'special' && (
                <div>
                  <Label>Type d'evenement</Label>
                  <Select value={specialEventFilter} onValueChange={setSpecialEventFilter}>
                    <SelectTrigger>
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les evenements</SelectItem>
                      {availableSpecialEventFilters.map((event) => (
                        <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {reportCategory === 'regular' && (
                <div>
                  <Label>Origine</Label>
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger>
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les origines</SelectItem>
                      <SelectItem value="distribution">Distributions directes</SelectItem>
                      <SelectItem value="approvedRequest">Demandes approuvees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>{t('comptoir.startDate')}</Label>
                <Input type="date" value={dateDebut} onChange={(event) => handleDateChange('start', event.target.value)} />
              </div>

              <div>
                <Label>{t('comptoir.endDate')}</Label>
                <Input type="date" value={dateFin} onChange={(event) => handleDateChange('end', event.target.value)} />
              </div>
            </div>

            <div className="flex w-full lg:w-auto gap-2">
              <Button variant="outline" className="w-full lg:w-auto" onClick={handleExportExcel}>
                <FileText className="w-4 h-4 mr-2" />
                {t('common.export')} Excel
              </Button>
              <Button className="bg-[#4CAF50] hover:bg-[#45a049] w-full lg:w-auto" onClick={handleExportPdf}>
                <Download className="w-4 h-4 mr-2" />
                {t('common.export')} PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicateurs principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4" style={{ borderLeftColor: '#1E73BE' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">{t('comptoir.totalBeneficiaries')}</p>
                <p className="text-3xl font-bold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {stats.totalBeneficiaires}
                </p>
              </div>
              <Users className="w-10 h-10 text-[#1E73BE] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4" style={{ borderLeftColor: '#4CAF50' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">{t('comptoir.totalDistributions')}</p>
                <p className="text-3xl font-bold text-[#4CAF50]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {stats.totalDistributions}
                </p>
              </div>
              <Package className="w-10 h-10 text-[#4CAF50] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4" style={{ borderLeftColor: '#FFC107' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">{t('comptoir.totalValue')}</p>
                <p className="text-3xl font-bold text-[#FFC107]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {stats.valeurTotale}
                </p>
                <p className="text-xs text-[#666666]">CAD$</p>
              </div>
              <DollarSign className="w-10 h-10 text-[#FFC107] opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4" style={{ borderLeftColor: '#1E73BE' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">{t('comptoir.trend')}</p>
                <p className="text-3xl font-bold text-[#4CAF50]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {stats.tendance}
                </p>
                <p className="text-xs text-[#666666]">{t('comptoir.vsLastMonth')}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-[#4CAF50] opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique - Distribution par type */}
        <Card>
          <CardHeader className="border-b bg-[#F4F4F4]">
            <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.125rem' }}>
              {t('comptoir.distributionByType')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {distributionsParType.length > 0 ? (
              <div className="space-y-4">
                {distributionsParType.map((item) => (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#333333]">{item.type}</span>
                      <span className="text-sm text-[#666666]">{item.distributions} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-[#E0E0E0] rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-[#666666] text-center">
                Aucune donnee disponible pour les filtres selectionnes.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Graphique - Évolution mensuelle */}
        <Card>
          <CardHeader className="border-b bg-[#F4F4F4]">
            <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.125rem' }}>
              {t('comptoir.monthlyEvolution')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {evolutionMensuelle.some((item) => item.distributions > 0) ? (
              <div className="flex items-end justify-between h-48 gap-2">
                {evolutionMensuelle.map((item) => {
                  const maxValue = Math.max(...evolutionMensuelle.map((entry) => entry.distributions), 1);
                  const height = (item.distributions / maxValue) * 100;

                  return (
                    <div key={item.mois} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex items-end justify-center flex-1">
                        <div 
                          className="w-full bg-gradient-to-t from-[#1E73BE] to-[#4CAF50] rounded-t hover:opacity-80 transition-opacity cursor-pointer relative group"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#333333] text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                            {item.distributions}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-[#666666] mt-2 font-medium">{item.mois}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-[#666666] text-center">
                Aucune evolution disponible pour les filtres selectionnes.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tableau résumé */}
      <Card>
        <CardHeader className="border-b bg-[#F4F4F4]">
          <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.125rem' }}>
            {t('comptoir.summaryTable')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F4F4F4] border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('comptoir.aidType')}
                  </th>
                  <th className="text-left p-4 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('comptoir.quantity')}
                  </th>
                  <th className="text-left p-4 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('comptoir.beneficiaries')}
                  </th>
                  <th className="text-left p-4 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('comptoir.averageValue')}
                  </th>
                  <th className="text-left p-4 font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('comptoir.totalValue')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {distributionsParType.map((item) => (
                  <tr key={item.type} className="hover:bg-[#F4F4F4] transition-colors">
                    <td className="p-4 font-medium text-[#333333]">{item.type}</td>
                    <td className="p-4 text-[#666666]">{item.quantity}</td>
                    <td className="p-4 text-[#666666]">{item.beneficiaries}</td>
                    <td className="p-4 text-[#666666]">{formatMoney(item.averageValue)} CAD$</td>
                    <td className="p-4 font-semibold text-[#1E73BE]">
                      {formatMoney(item.totalValue)} CAD$
                    </td>
                  </tr>
                ))}
                {distributionsParType.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-sm text-[#666666]">
                      Aucune donnee a afficher pour les filtres selectionnes.
                    </td>
                  </tr>
                )}
                <tr className="bg-[#E3F2FD] font-semibold">
                  <td className="p-4">{t('common.total')}</td>
                  <td className="p-4">{totalQuantity}</td>
                  <td className="p-4">{stats.totalBeneficiaires}</td>
                  <td className="p-4">-</td>
                  <td className="p-4 text-[#1E73BE]">{stats.valeurTotale} CAD$</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}