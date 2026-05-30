import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, User, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { BoutonRetourHeader } from '../shared/BoutonRetour';
import {
  ajouterRendezVousComptoir,
  comptoirStorageEvents,
  comptoirStorageKeys,
  obtenirBeneficiairesComptoir,
  obtenirRendezVousComptoir,
  type ComptoirAppointment,
  type ComptoirBeneficiary,
  upsertRendezVousComptoir,
} from '../../utils/comptoirStorage';

interface RendezVousProps {
  onNavigate: (view: string, id?: string) => void;
  aidRequests: any[];
  aidTypes: any[];
}

interface RendezVousRecord {
  id: string;
  beneficiaire: string;
  beneficiaireId: string;
  date: string;
  heure: string;
  motif: string;
  statut: 'confirme' | 'attente' | 'annule';
  notes: string;
  type: 'regular' | 'aidRequest';
  quantity?: number;
  estimatedValue?: number;
  aidType?: string;
}

function parseLocalDate(dateValue: string): Date {
  const [year, month, day] = dateValue.split('-').map(Number);
  if (!year || !month || !day) {
    return new Date(dateValue);
  }

  return new Date(year, month - 1, day);
}

export function RendezVous({ onNavigate, aidRequests = [], aidTypes = [] }: RendezVousProps) {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRdv, setSelectedRdv] = useState<RendezVousRecord | null>(null);
  const [editingRdvId, setEditingRdvId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<'all' | RendezVousRecord['statut']>('all');
  const [beneficiaires, setBeneficiaires] = useState<ComptoirBeneficiary[]>(() => obtenirBeneficiairesComptoir());
  const [rendezvous, setRendezvous] = useState<ComptoirAppointment[]>(() => obtenirRendezVousComptoir());
  const [selectedBeneficiaireId, setSelectedBeneficiaireId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [appointmentReason, setAppointmentReason] = useState('distribution');
  const [appointmentNotes, setAppointmentNotes] = useState('');

  useEffect(() => {
    const refreshData = () => {
      setBeneficiaires(obtenirBeneficiairesComptoir());
      setRendezvous(obtenirRendezVousComptoir());
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === comptoirStorageKeys.beneficiaries ||
        event.key === comptoirStorageKeys.appointments
      ) {
        refreshData();
      }
    };

    const handleComptoirStorageUpdated = (event: Event) => {
      const { detail } = event as CustomEvent<{ key?: string }>;
      if (
        detail?.key === comptoirStorageKeys.beneficiaries ||
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

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'distribution':
        return t('comptoir.foodDistribution');
      case 'consultation':
        return t('comptoir.socialConsultation');
      case 'suivi':
        return t('comptoir.regularFollowup');
      case 'autre':
      default:
        return t('comptoir.other');
    }
  };

  const resetForm = () => {
    setEditingRdvId(null);
    setSelectedBeneficiaireId('');
    setAppointmentDate(new Date().toISOString().split('T')[0]);
    setAppointmentTime('09:00');
    setAppointmentReason('distribution');
    setAppointmentNotes('');
  };

  const getReasonValue = (reasonLabel: string) => {
    if (reasonLabel === t('comptoir.foodDistribution')) {
      return 'distribution';
    }

    if (reasonLabel === t('comptoir.socialConsultation')) {
      return 'consultation';
    }

    if (reasonLabel === t('comptoir.regularFollowup')) {
      return 'suivi';
    }

    return 'autre';
  };

  const openEditDialog = () => {
    if (!selectedRdv || selectedRdv.type !== 'regular') {
      return;
    }

    setEditingRdvId(selectedRdv.id);
    setSelectedBeneficiaireId(selectedRdv.beneficiaireId);
    setAppointmentDate(selectedRdv.date);
    setAppointmentTime(selectedRdv.heure);
    setAppointmentReason(getReasonValue(selectedRdv.motif));
    setAppointmentNotes(selectedRdv.notes || '');
    setDialogOpen(true);
  };

  // Función para obtener el color del tipo de ayuda
  const getAidTypeColor = (aidTypeName: string) => {
    if (!aidTypes || aidTypes.length === 0) return '#4CAF50';
    const aidType = aidTypes.find(type => type.name === aidTypeName);
    return aidType?.color || '#4CAF50';
  };

  // Convertir demandes aprobadas en citas
  const approvedAidAppointments: RendezVousRecord[] = aidRequests
    .filter(req => req.status === 'approved' && req.appointmentDate && req.appointmentTime)
    .map(req => ({
      id: `aid-${req.id}`,
      beneficiaire: req.beneficiaire,
      beneficiaireId: req.beneficiaireId,
      date: req.appointmentDate,
      heure: req.appointmentTime,
      motif: `Distribution: ${req.type}`,
      statut: 'confirme',
      notes: req.notes || '',
      type: 'aidRequest',
      quantity: req.quantite,
      estimatedValue: req.estimatedValue,
      aidType: req.type
    }));

  const regularAppointments: RendezVousRecord[] = rendezvous.map((appointment) => ({
    ...appointment,
    notes: appointment.notes || '',
    type: 'regular',
  }));

  // Combinar citas regulares con las de ayuda
  const allRendezvous = [...regularAppointments, ...approvedAidAppointments]
    .slice()
    .sort((left, right) => `${left.date} ${left.heure}`.localeCompare(`${right.date} ${right.heure}`));

  const filteredRendezvous = allRendezvous.filter((rdv) => {
    if (statusFilter === 'all') {
      return true;
    }

    return rdv.statut === statusFilter;
  });

  useEffect(() => {
    if (!selectedRdv) {
      return;
    }

    const updatedSelection = filteredRendezvous.find((rdv) => rdv.id === selectedRdv.id) || null;
    if (!updatedSelection) {
      setSelectedRdv(null);
      return;
    }

    if (JSON.stringify(updatedSelection) !== JSON.stringify(selectedRdv)) {
      setSelectedRdv(updatedSelection);
    }
  }, [filteredRendezvous, selectedRdv]);

  const handleUpdateRegularAppointmentStatus = (newStatus: ComptoirAppointment['statut']) => {
    if (!selectedRdv || selectedRdv.type !== 'regular') {
      return;
    }

    const currentAppointment = rendezvous.find((appointment) => appointment.id === selectedRdv.id);
    if (!currentAppointment) {
      toast.error(t('common.error'), {
        description: t('comptoir.noAppointments'),
      });
      return;
    }

    if (currentAppointment.statut === newStatus) {
      return;
    }

    upsertRendezVousComptoir({
      ...currentAppointment,
      statut: newStatus,
    });

    const successMessage = {
      confirme: 'Rendez-vous confirmé',
      attente: 'Rendez-vous mis en attente',
      annule: 'Rendez-vous annulé',
    }[newStatus];

    toast.success(successMessage);
  };

  const handleSaveRdv = () => {
    if (!selectedBeneficiaireId) {
      toast.error(t('common.error'), {
        description: t('comptoir.selectBeneficiary'),
      });
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      toast.error(t('common.error'), {
        description: `${t('common.date')} / ${t('comptoir.time')}`,
      });
      return;
    }

    const beneficiary = beneficiaires.find((item) => item.id === selectedBeneficiaireId);
    if (!beneficiary) {
      toast.error(t('common.error'), {
        description: t('comptoir.selectBeneficiary'),
      });
      return;
    }

    if (editingRdvId) {
      const currentAppointment = rendezvous.find((appointment) => appointment.id === editingRdvId);
      if (!currentAppointment) {
        toast.error(t('common.error'), {
          description: t('comptoir.noAppointments'),
        });
        return;
      }

      upsertRendezVousComptoir({
        ...currentAppointment,
        beneficiaireId: beneficiary.id,
        beneficiaire: beneficiary.nom,
        date: appointmentDate,
        heure: appointmentTime,
        motif: getReasonLabel(appointmentReason),
        statut: currentAppointment.statut,
        notes: appointmentNotes.trim(),
        type: 'regular',
      });

      toast.success('Rendez-vous mis à jour avec succès');
    } else {
      ajouterRendezVousComptoir({
        beneficiaireId: beneficiary.id,
        beneficiaire: beneficiary.nom,
        date: appointmentDate,
        heure: appointmentTime,
        motif: getReasonLabel(appointmentReason),
        statut: 'confirme',
        notes: appointmentNotes.trim(),
        type: 'regular',
      });

      toast.success(t('comptoir.appointmentCreated'));
    }

    resetForm();
    setDialogOpen(false);
    setSelectedRdv(null);
  };

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'confirme':
        return <Badge className="bg-[#4CAF50] hover:bg-[#4CAF50]">{t('comptoir.confirmed')}</Badge>;
      case 'attente':
        return <Badge className="bg-[#FFC107] hover:bg-[#FFC107] text-[#333333]">{t('comptoir.pending')}</Badge>;
      case 'annule':
        return <Badge className="bg-[#DC3545] hover:bg-[#DC3545]">{t('comptoir.cancelled')}</Badge>;
      default:
        return null;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'confirme': return '#4CAF50';
      case 'attente': return '#FFC107';
      case 'annule': return '#DC3545';
      default: return '#1E73BE';
    }
  };

  // Grouper les rendez-vous par date
  const rdvParDate = filteredRendezvous.reduce<Record<string, RendezVousRecord[]>>((acc, rdv) => {
    if (!acc[rdv.date]) {
      acc[rdv.date] = [];
    }
    acc[rdv.date].push(rdv);
    return acc;
  }, {});

  const hasVisibleAppointments = Object.keys(rdvParDate).length > 0;

  return (
    <div className="space-y-4">
      <BoutonRetourHeader 
        onClick={() => onNavigate('__back__')} 
        titre="Rendez-vous"
      />
      {/* Barre supérieure */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </h2>
              <Button variant="outline" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  {t('comptoir.day')}
                </Button>
                <Button variant="outline" size="sm" className="bg-[#1E73BE] text-white hover:bg-[#1557A0] hover:text-white">
                  {t('comptoir.week')}
                </Button>
                <Button variant="outline" size="sm">
                  {t('comptoir.month')}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
                <div className="w-full sm:w-[220px]">
                  <Label className="text-xs uppercase tracking-wide text-[#666666]">{t('common.status')}</Label>
                  <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | RendezVousRecord['statut'])}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={t('common.status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="confirme">{t('comptoir.confirmed')}</SelectItem>
                      <SelectItem value="attente">{t('comptoir.pending')}</SelectItem>
                      <SelectItem value="annule">{t('comptoir.cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Dialog
                  open={dialogOpen}
                  onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) {
                      resetForm();
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-[#4CAF50] hover:bg-[#45a049] w-full sm:w-auto sm:self-end">
                      <Plus className="w-4 h-4 mr-2" />
                      {t('comptoir.newAppointment')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md" aria-describedby="rdv-description">
                    <DialogHeader>
                      <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {editingRdvId ? t('common.edit') : t('comptoir.createAppointment')}
                      </DialogTitle>
                      <DialogDescription id="rdv-description">
                        {editingRdvId ? t('common.edit') : t('comptoir.fillAppointmentInfo')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>{t('comptoir.beneficiary')} *</Label>
                        <Select value={selectedBeneficiaireId} onValueChange={setSelectedBeneficiaireId}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('comptoir.selectBeneficiary')} />
                          </SelectTrigger>
                          <SelectContent>
                            {beneficiaires.map((beneficiary) => (
                              <SelectItem key={beneficiary.id} value={beneficiary.id}>
                                {beneficiary.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{t('common.date')} *</Label>
                          <Input type="date" value={appointmentDate} onChange={(event) => setAppointmentDate(event.target.value)} />
                        </div>
                        <div>
                          <Label>{t('comptoir.time')} *</Label>
                          <Input type="time" value={appointmentTime} onChange={(event) => setAppointmentTime(event.target.value)} />
                        </div>
                      </div>

                      <div>
                        <Label>{t('comptoir.reason')}</Label>
                        <Select value={appointmentReason} onValueChange={setAppointmentReason}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('comptoir.selectReason')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="distribution">{t('comptoir.foodDistribution')}</SelectItem>
                            <SelectItem value="consultation">{t('comptoir.socialConsultation')}</SelectItem>
                            <SelectItem value="suivi">{t('comptoir.regularFollowup')}</SelectItem>
                            <SelectItem value="autre">{t('comptoir.other')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>{t('comptoir.notes')}</Label>
                        <Textarea
                          placeholder={t('comptoir.additionalNotes')}
                          className="min-h-[80px]"
                          value={appointmentNotes}
                          onChange={(event) => setAppointmentNotes(event.target.value)}
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                          {t('common.cancel')}
                        </Button>
                        <Button onClick={handleSaveRdv} className="bg-[#4CAF50] hover:bg-[#45a049]">
                          {editingRdvId ? t('common.save') : t('common.confirm')}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vue calendrier semaine */}
      {hasVisibleAppointments ? (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {/* Liste des jours avec rendez-vous */}
          {Object.keys(rdvParDate).map((dateStr) => {
            const date = parseLocalDate(dateStr);
            const rdvJour = rdvParDate[dateStr];
            
            return (
              <Card key={dateStr} className="lg:col-span-1">
                <CardHeader className="bg-[#F4F4F4] pb-3">
                  <div className="text-center">
                    <div className="text-xs text-[#666666] uppercase">
                      {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                    </div>
                    <div className="text-2xl font-bold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {date.getDate()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                  {rdvJour.map((rdv) => (
                    <div
                      key={rdv.id}
                      className="p-2 rounded cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: `${getStatusColor(rdv.statut)}20`, borderLeft: `3px solid ${getStatusColor(rdv.statut)}` }}
                      onClick={() => setSelectedRdv(rdv)}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3 text-[#666666]" />
                        <span className="text-xs font-medium">{rdv.heure}</span>
                      </div>
                      <div className="text-xs font-semibold text-[#333333] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {rdv.beneficiaire}
                      </div>
                      <div className="text-xs text-[#666666] truncate mt-0.5">
                        {rdv.motif}
                      </div>
                      {rdv.type === 'aidRequest' && rdv.aidType && (
                        <div className="mt-1 pt-1 border-t border-gray-200">
                          <Badge 
                            variant="outline" 
                            className="text-xs px-1.5 py-0 h-5"
                            style={{
                              backgroundColor: `${getAidTypeColor(rdv.aidType)}10`,
                              color: getAidTypeColor(rdv.aidType),
                              borderColor: `${getAidTypeColor(rdv.aidType)}50`
                            }}
                          >
                            {rdv.aidType}
                          </Badge>
                          {rdv.quantity && (
                            <span className="text-xs text-[#666666] ml-1">
                              × {rdv.quantity}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}

          {/* Jours vides pour compléter la semaine */}
          {Array.from({ length: 7 - Object.keys(rdvParDate).length }).map((_, i) => (
            <Card key={`empty-${i}`} className="lg:col-span-1 opacity-50">
              <CardHeader className="bg-[#F4F4F4] pb-3">
                <div className="text-center">
                  <div className="text-xs text-[#666666] uppercase">-</div>
                  <div className="text-2xl font-bold text-[#CCCCCC]">-</div>
                </div>
              </CardHeader>
              <CardContent className="p-4 text-center text-sm text-[#999999]">
                {t('comptoir.noAppointments')}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-[#CCCCCC]" />
            <p className="text-sm text-[#666666]">
              {statusFilter === 'all'
                ? 'Aucun rendez-vous à afficher pour le moment.'
                : 'Aucun rendez-vous ne correspond au statut sélectionné.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Panneau latéral - Détails du RDV sélectionné */}
      {selectedRdv && (
        <Card className="border-2 border-[#1E73BE]">
          <CardHeader className="bg-[#E3F2FD]">
            <div className="flex items-center justify-between">
              <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
                {t('comptoir.appointmentDetails')}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedRdv(null)}
              >
                ✕
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-[#666666]" />
                <span className="text-sm text-[#666666]">{t('comptoir.beneficiary')}</span>
              </div>
              <p className="font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {selectedRdv.beneficiaire}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#666666]" />
                  <span className="text-sm text-[#666666]">{t('common.date')}</span>
                </div>
                <p className="font-medium">{selectedRdv.date}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[#666666]" />
                  <span className="text-sm text-[#666666]">{t('comptoir.time')}</span>
                </div>
                <p className="font-medium">{selectedRdv.heure}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-[#666666]" />
                <span className="text-sm text-[#666666]">{t('comptoir.reason')}</span>
              </div>
              <p className="font-medium">{selectedRdv.motif}</p>
            </div>

            <div>
              <span className="text-sm text-[#666666] mb-2 block">{t('common.status')}</span>
              {getStatusBadge(selectedRdv.statut)}
            </div>

            {selectedRdv.notes && (
              <div>
                <span className="text-sm text-[#666666] mb-2 block">{t('comptoir.notes')}</span>
                <p className="text-sm bg-[#F4F4F4] p-3 rounded">{selectedRdv.notes}</p>
              </div>
            )}

            {selectedRdv.type === 'regular' && (
              <div className="space-y-2">
                <span className="text-sm text-[#666666] block">Gestion du statut</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="border-[#4CAF50] text-[#2E7D32] hover:bg-[#4CAF50] hover:text-white"
                    onClick={() => handleUpdateRegularAppointmentStatus('confirme')}
                    disabled={selectedRdv.statut === 'confirme'}
                  >
                    Confirmer
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#FFC107] text-[#8A6D00] hover:bg-[#FFC107] hover:text-[#333333]"
                    onClick={() => handleUpdateRegularAppointmentStatus('attente')}
                    disabled={selectedRdv.statut === 'attente'}
                  >
                    Mettre en attente
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#DC3545] text-[#DC3545] hover:bg-[#DC3545] hover:text-white"
                    onClick={() => handleUpdateRegularAppointmentStatus('annule')}
                    disabled={selectedRdv.statut === 'annule'}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <Button 
                className="flex-1 bg-[#1E73BE] hover:bg-[#1557A0]"
                onClick={() => onNavigate('fiche-beneficiaire', selectedRdv.beneficiaireId)}
              >
                {t('comptoir.viewBeneficiary')}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={openEditDialog}
                disabled={selectedRdv.type !== 'regular'}
              >
                {t('common.edit')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}