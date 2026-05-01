import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Calendar, Package, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useBranding } from '../../../hooks/useBranding';
import {
  obtenirRendezVousComptoir,
  comptoirStorageEvents,
  comptoirStorageKeys,
  obtenirBeneficiairesComptoir,
  obtenirDemandesAideComptoir,
  obtenirDistributionsComptoir,
} from '../../utils/comptoirStorage';

interface ComptoirDashboardProps {
  onNavigate: (view: string, id?: string) => void;
}

export function ComptoirDashboard({ onNavigate }: ComptoirDashboardProps) {
  const { t } = useTranslation();
  const branding = useBranding();
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const refreshData = () => {
      setRefreshToken((value) => value + 1);
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === comptoirStorageKeys.beneficiaries ||
        event.key === comptoirStorageKeys.aidRequests ||
        event.key === comptoirStorageKeys.distributions ||
        event.key === comptoirStorageKeys.appointments
      ) {
        refreshData();
      }
    };

    const handleComptoirStorageUpdated = (event: Event) => {
      const { detail } = event as CustomEvent<{ key?: string }>;
      if (
        detail?.key === comptoirStorageKeys.beneficiaries ||
        detail?.key === comptoirStorageKeys.aidRequests ||
        detail?.key === comptoirStorageKeys.distributions ||
        detail?.key === comptoirStorageKeys.appointments
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

  const beneficiaries = obtenirBeneficiairesComptoir();
  const aidRequests = obtenirDemandesAideComptoir();
  const distributions = obtenirDistributionsComptoir();
  const appointments = obtenirRendezVousComptoir();
  const today = new Date().toISOString().split('T')[0];
  void refreshToken;

  const stats = {
    beneficiairesActifs: beneficiaries.filter((beneficiary) => beneficiary.statut === 'actif').length,
    rdvAujourdhui:
      appointments.filter((appointment) => appointment.date === today && appointment.statut !== 'annule').length +
      aidRequests.filter((request) => request.status === 'approved' && request.appointmentDate === today).length,
    aidesDistribuees: distributions.length,
  };

  const pendingRequests = aidRequests.filter((request) => request.status === 'pending').length;
  const recentBeneficiaries = beneficiaries
    .slice()
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, 3)
    .map((beneficiary) => ({
      id: beneficiary.id,
      type: 'beneficiaire',
      nom: beneficiary.nom,
      action: `Dossier ${beneficiary.id} mis a jour`,
      date: new Date(beneficiary.updatedAt).toLocaleDateString('fr-CA'),
      priorite: beneficiary.priorite,
    }));

  const recentDistributions = distributions
    .slice()
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, 5)
    .map((distribution) => ({
      id: distribution.id,
      type: 'aide',
      nom: distribution.beneficiaire,
      action: `${distribution.type} • ${distribution.quantite} unite(s)`,
      date: distribution.date,
      priorite: 'normale',
    }));

  const activitesRecentes = [...recentDistributions, ...recentBeneficiaries]
    .sort((left, right) => right.date.localeCompare(left.date))
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-l-4 hover:shadow-lg transition-shadow cursor-pointer" 
          style={{ borderLeftColor: '#1E73BE' }}
          onClick={() => onNavigate('beneficiaires')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">{t('comptoir.activeBeneficiaries')}</p>
                <p className="text-3xl font-bold" style={{ color: '#1E73BE', fontFamily: 'Montserrat, sans-serif' }}>
                  {stats.beneficiairesActifs}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-[#4CAF50]" />
                  <span className="text-xs text-[#4CAF50]">{beneficiaries.length} dossiers au total</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E3F2FD' }}>
                <Users className="w-6 h-6" style={{ color: '#1E73BE' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 hover:shadow-lg transition-shadow cursor-pointer" 
          style={{ borderLeftColor: '#4CAF50' }}
          onClick={() => onNavigate('rendez-vous')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">{t('comptoir.appointmentsToday')}</p>
                <p className="text-3xl font-bold" style={{ color: '#4CAF50', fontFamily: 'Montserrat, sans-serif' }}>
                  {stats.rdvAujourdhui}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="w-3 h-3 text-[#666666]" />
                  <span className="text-xs text-[#666666]">{pendingRequests} en attente</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E8F5E9' }}>
                <Calendar className="w-6 h-6" style={{ color: '#4CAF50' }} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 hover:shadow-lg transition-shadow cursor-pointer" 
          style={{ borderLeftColor: '#FFC107' }}
          onClick={() => onNavigate('aide-alimentaire')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#666666] mb-1">{t('comptoir.aidsDistributed')}</p>
                <p className="text-3xl font-bold" style={{ color: '#FFC107', fontFamily: 'Montserrat, sans-serif' }}>
                  {stats.aidesDistribuees}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-3 h-3 text-[#4CAF50]" />
                  <span className="text-xs text-[#4CAF50]">{distributions.filter((distribution) => distribution.date === today).length} aujourd'hui</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FFF9E6' }}>
                <Package className="w-6 h-6" style={{ color: '#FFC107' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                  if (activite.type === 'beneficiaire') onNavigate('beneficiaires', activite.id.toString());
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <Button 
              className="bg-white text-[#1E73BE] hover:bg-gray-100 h-auto py-4 justify-start"
              onClick={() => onNavigate('rendez-vous')}
            >
              <Calendar className="w-5 h-5 mr-3" />
              <div className="text-left">
                <div className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {t('comptoir.newAppointment')}
                </div>
                <div className="text-xs opacity-75">
                  {t('comptoir.scheduleAppointment')}
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}