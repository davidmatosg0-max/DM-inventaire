import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Calendar, Package, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useBranding } from '../../../hooks/useBranding';
import { ModuleStatCard, ModuleStatsGrid } from '../shared/ModulePageHeader';
import {
  obtenirRendezVousComptoir,
  comptoirStorageEvents,
  comptoirStorageKeys,
  obtenirBeneficiairesComptoir,
  obtenirDemandesAideComptoir,
  obtenirDistributionsComptoir,
  obtenirReservationSettingsComptoir,
  sauvegarderReservationSettingsComptoir,
} from '../../utils/comptoirStorage';

interface ComptoirDashboardProps {
  onNavigate: (view: string, id?: string) => void;
}

export function ComptoirDashboard({ onNavigate }: ComptoirDashboardProps) {
  const { t } = useTranslation();
  const branding = useBranding();
  const [refreshToken, setRefreshToken] = useState(0);
  const [reservationSettings, setReservationSettings] = useState(() => obtenirReservationSettingsComptoir());

  useEffect(() => {
    const refreshData = () => {
      setRefreshToken((value) => value + 1);
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === comptoirStorageKeys.beneficiaries ||
        event.key === comptoirStorageKeys.aidRequests ||
        event.key === comptoirStorageKeys.distributions ||
        event.key === comptoirStorageKeys.appointments ||
        event.key === comptoirStorageKeys.reservationSettings
      ) {
        refreshData();
        if (event.key === comptoirStorageKeys.reservationSettings) {
          setReservationSettings(obtenirReservationSettingsComptoir());
        }
      }
    };

    const handleComptoirStorageUpdated = (event: Event) => {
      const { detail } = event as CustomEvent<{ key?: string }>;
      if (
        detail?.key === comptoirStorageKeys.beneficiaries ||
        detail?.key === comptoirStorageKeys.aidRequests ||
        detail?.key === comptoirStorageKeys.distributions ||
        detail?.key === comptoirStorageKeys.appointments ||
        detail?.key === comptoirStorageKeys.reservationSettings
      ) {
        refreshData();
        if (detail?.key === comptoirStorageKeys.reservationSettings) {
          setReservationSettings(obtenirReservationSettingsComptoir());
        }
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

  const beneficiaries = obtenirBeneficiairesComptoir();
  const aidRequests = obtenirDemandesAideComptoir();
  const distributions = obtenirDistributionsComptoir();
  const appointments = obtenirRendezVousComptoir();
  const normalizarFechaDia = (value?: string) => {
    if (!value) return '';
    if (value.includes('T')) return value.split('T')[0];
    if (value.includes(' ')) return value.split(' ')[0];
    return value;
  };
  const today = new Date().toISOString().split('T')[0];
  void refreshToken;

  const stats = {
    beneficiairesActifs: beneficiaries.filter((beneficiary) => beneficiary.statut === 'actif').length,
    rdvAujourdhui:
      appointments.filter((appointment) => normalizarFechaDia(appointment.date) === today && appointment.statut !== 'annule').length +
      aidRequests.filter((request) => request.status === 'approved' && normalizarFechaDia(request.appointmentDate) === today).length,
    aidesDistribuees: distributions.length,
  };

  const pendingRequests = aidRequests.filter((request) => request.status === 'pending').length;
  const reservationSlotsPreview = (() => {
    const parseTime = (value: string) => {
      if (!/^\d{2}:\d{2}$/.test(value)) {
        return null;
      }

      const [hours, minutes] = value.split(':').map((part) => Number.parseInt(part, 10));
      if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
        return null;
      }

      return (hours * 60) + minutes;
    };

    const start = parseTime(reservationSettings.startTime);
    const end = parseTime(reservationSettings.endTime);
    if (start === null || end === null || end < start || reservationSettings.intervalMinutes <= 0) {
      return [] as string[];
    }

    const slots: string[] = [];
    for (let current = start; current <= end; current += reservationSettings.intervalMinutes) {
      const hours = Math.floor(current / 60);
      const minutes = current % 60;
      slots.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
    }

    return slots;
  })();

  const getSortTimestamp = (dateValue?: string, timeValue?: string) => {
    if (!dateValue) {
      return 0;
    }

    const normalizedDate = dateValue.includes('T') ? dateValue : `${dateValue}T${timeValue || '00:00'}:00`;
    const parsedDate = new Date(normalizedDate);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.getTime();
    }

    const fallbackDate = new Date(dateValue);
    return Number.isNaN(fallbackDate.getTime()) ? 0 : fallbackDate.getTime();
  };

  const recentBeneficiaries = beneficiaries
    .slice()
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 3)
    .map((beneficiary) => ({
      id: beneficiary.id,
      beneficiaireId: beneficiary.id,
      type: 'beneficiaire',
      nom: beneficiary.nom,
      action: `Dossier ${beneficiary.id} mis a jour`,
      date: new Date(beneficiary.updatedAt).toLocaleDateString('fr-CA'),
      priorite: beneficiary.priorite,
      sortTs: getSortTimestamp(beneficiary.updatedAt),
    }));

  const recentDistributions = distributions
    .slice()
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 5)
    .map((distribution) => ({
      id: distribution.id,
      beneficiaireId: distribution.beneficiaireId,
      type: 'aide',
      nom: distribution.beneficiaire,
      action: `${distribution.type} • ${distribution.quantite} unite(s)`,
      date: `${normalizarFechaDia(distribution.date)}${distribution.time ? ` • ${distribution.time}` : ''}`,
      priorite: 'normale',
      sortTs: getSortTimestamp(distribution.createdAt || distribution.date, distribution.time),
    }));

  const activitesRecentes = [...recentDistributions, ...recentBeneficiaries]
    .sort((left, right) => right.sortTs - left.sortTs)
    .slice(0, 6);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'beneficiaire': return <Users className="w-4 h-4" />;
      case 'rdv': return <Calendar className="w-4 h-4" />;
      case 'aide': return <Package className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priorite: string) => {
    switch (priorite) {
      case 'haute': return '#DC3545';
      case 'normale': return '#1E73BE';
      case 'basse': return '#666666';
      default: return '#666666';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Ligne 1 — Cartes statistiques */}
      <ModuleStatsGrid defaultLayout="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
        <button type="button" onClick={() => onNavigate('beneficiaires')} className="text-left">
          <ModuleStatCard
            label={t('comptoir.activeBeneficiaries')}
            value={stats.beneficiairesActifs}
            icon={<Users className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
            accentColor="#1E73BE"
            valueColor="#1E73BE"
            helper={(
              <div className="flex items-center gap-1 text-xs text-[#4CAF50]">
                <TrendingUp className="h-3 w-3" />
                <span>{beneficiaries.length} dossiers au total</span>
              </div>
            )}
            className="cursor-pointer"
          />
        </button>
        <button type="button" onClick={() => onNavigate('rendez-vous')} className="text-left">
          <ModuleStatCard
            label={t('comptoir.appointmentsToday')}
            value={stats.rdvAujourdhui}
            icon={<Calendar className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
            accentColor="#4CAF50"
            valueColor="#4CAF50"
            helper={(
              <div className="flex items-center gap-1 text-xs text-[#666666]">
                <Clock className="h-3 w-3" />
                <span>{pendingRequests} en attente</span>
              </div>
            )}
            className="cursor-pointer"
          />
        </button>
        <button type="button" onClick={() => onNavigate('aide-alimentaire')} className="text-left">
          <ModuleStatCard
            label={t('comptoir.aidsDistributed')}
            value={stats.aidesDistribuees}
            icon={<Package className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
            accentColor="#FFC107"
            valueColor="#FFC107"
            helper={(
              <div className="flex items-center gap-1 text-xs text-[#4CAF50]">
                <TrendingUp className="h-3 w-3" />
                <span>{distributions.filter((distribution) => normalizarFechaDia(distribution.date) === today).length} aujourd'hui</span>
              </div>
            )}
            className="cursor-pointer"
          />
        </button>
      </ModuleStatsGrid>

      {/* Ligne 2 — Activités récentes */}
      <Card>
        <CardHeader className="border-b bg-[#F4F4F4]">
          <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '1.125rem' }}>
            {t('comptoir.recentActivities')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {activitesRecentes.length > 0 ? activitesRecentes.map((activite) => (
              <div 
                key={activite.id} 
                className="p-4 hover:bg-[#F4F4F4] transition-colors cursor-pointer"
                onClick={() => {
                  if (activite.beneficiaireId) {
                    onNavigate('fiche-beneficiaire', activite.beneficiaireId.toString());
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
                    style={{ backgroundColor: `${getPriorityColor(activite.priorite)}20` }}
                  >
                    <div style={{ color: getPriorityColor(activite.priorite) }}>
                      {getActivityIcon(activite.type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {activite.nom}
                        </p>
                        <p className="text-sm text-[#666666] mt-0.5">
                          {activite.action}
                        </p>
                      </div>
                      <span className="text-xs text-[#999999] whitespace-nowrap">
                        {activite.date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-6 text-sm text-[#666666] text-center">
                Aucune activite recente a afficher pour le moment.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ligne 3 — Actions rapides */}
      <Card className="bg-gradient-to-br from-[#1E73BE] to-[#1557A0]">
        <CardContent className="p-6">
          <h3 className="text-white font-semibold mb-4" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.125rem' }}>
            {t('comptoir.quickActions')}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <Button 
              className="bg-white text-[#1E73BE] hover:bg-gray-100 h-auto py-4 justify-start"
              onClick={() => onNavigate('beneficiaires')}
            >
              <Users className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('comptoir.newBeneficiary')}
                </div>
                <div className="text-xs opacity-75">
                  {t('comptoir.createNewRecord')}
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b bg-[#F4F4F4]">
          <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '1.125rem' }}>
            Programmation des réservations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <Label>Heure de début</Label>
              <Input
                type="time"
                value={reservationSettings.startTime}
                onChange={(event) => setReservationSettings((current) => ({ ...current, startTime: event.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Heure de fin</Label>
              <Input
                type="time"
                value={reservationSettings.endTime}
                onChange={(event) => setReservationSettings((current) => ({ ...current, endTime: event.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Intervalle (minutes)</Label>
              <Input
                type="number"
                min="5"
                max="240"
                value={String(reservationSettings.intervalMinutes)}
                onChange={(event) => setReservationSettings((current) => ({
                  ...current,
                  intervalMinutes: Number.parseInt(event.target.value || '0', 10) || 0,
                }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Personnes par horaire</Label>
              <Input
                type="number"
                min="1"
                max="50"
                value={String(reservationSettings.slotCapacity)}
                onChange={(event) => setReservationSettings((current) => ({
                  ...current,
                  slotCapacity: Number.parseInt(event.target.value || '0', 10) || 0,
                }))}
                className="mt-1"
              />
            </div>
          </div>

          <div className="rounded-lg border border-[#D8E5F2] bg-[#F8FAFD] p-4">
            <p className="text-sm font-medium text-[#333333]">Créneaux prévus</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {reservationSlotsPreview.length > 0 ? reservationSlotsPreview.slice(0, 16).map((slot) => (
                <span key={slot} className="rounded-full border border-[#D8E5F2] bg-white px-2 py-1 text-xs text-[#1E73BE]">
                  {slot}
                </span>
              )) : (
                <span className="text-xs text-[#666666]">Définissez une plage horaire et un intervalle valides.</span>
              )}
              {reservationSlotsPreview.length > 16 && (
                <span className="rounded-full border border-[#D8E5F2] bg-white px-2 py-1 text-xs text-[#666666]">
                  +{reservationSlotsPreview.length - 16} autres
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              className="bg-[#1E73BE] hover:bg-[#1557A0]"
              onClick={() => {
                if (!reservationSettings.startTime || !reservationSettings.endTime) {
                  return;
                }

                if (reservationSettings.intervalMinutes < 5 || reservationSettings.intervalMinutes > 240) {
                  return;
                }

                if (reservationSettings.slotCapacity < 1 || reservationSettings.slotCapacity > 50) {
                  return;
                }

                sauvegarderReservationSettingsComptoir({
                  startTime: reservationSettings.startTime,
                  endTime: reservationSettings.endTime,
                  intervalMinutes: reservationSettings.intervalMinutes,
                  slotCapacity: reservationSettings.slotCapacity,
                });
              }}
            >
              Enregistrer la programmation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}