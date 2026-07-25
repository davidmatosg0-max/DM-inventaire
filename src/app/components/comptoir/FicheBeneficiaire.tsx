import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User, Phone, Mail, MapPin, Calendar, AlertCircle, 
  Save, Package, FileText, ChevronDown, ChevronUp,
  Edit2, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { toast } from 'sonner';
import { AddressAutocomplete } from '../ui/address-autocomplete';
import { CountrySelect } from '../ui/country-select';
import { FileUpload, UploadedFile } from '../ui/file-upload';
import {
  genererSiguienteIdInscriptionEvenementSpecial,
  generarSiguienteIdBeneficiario,
  obtenirTypesAidePersonnalises,
  obtenirDemandesAideComptoir,
  obtenirDistributionsComptoir,
  obtenirEvenementsSpeciauxComptoir,
  obtenirInscriptionsEvenementsSpeciauxComptoir,
  obtenirRendezVousComptoir,
  obtenirBeneficiaireComptoirParId,
  sauvegarderInscriptionsEvenementsSpeciauxComptoir,
  upsertBeneficiaireComptoir,
  type ComptoirAidType,
  type ComptoirBeneficiary,
  type ComptoirSpecialEventRegistration,
} from '../../utils/comptoirStorage';

interface FicheBeneficiaireProps {
  beneficiaireId?: string;
  onNavigate: (view: string, id?: string) => void;
}

function formatCurrency(value?: number): string {
  if (!value) {
    return 'CAD$ 0';
  }

  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDateLabel(dateValue?: string): string {
  if (!dateValue) {
    return '-';
  }

  const [year, month, day] = dateValue.split('-').map(Number);
  if (year && month && day) {
    return new Date(year, month - 1, day).toLocaleDateString('fr-CA');
  }

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleDateString('fr-CA');
}

function getTimelineSortValue(dateValue?: string, timeValue?: string): number {
  if (!dateValue) {
    return 0;
  }

  const normalizedDate = dateValue.includes('T')
    ? dateValue
    : `${dateValue}T${timeValue || '00:00'}:00`;
  const parsedDate = new Date(normalizedDate);

  if (!Number.isNaN(parsedDate.getTime())) {
    return parsedDate.getTime();
  }

  const fallbackDate = new Date(dateValue);
  return Number.isNaN(fallbackDate.getTime()) ? 0 : fallbackDate.getTime();
}

function getEventAvailableDates(event: { fechaInicio?: string; fechaFin?: string }): string[] {
  if (!event.fechaInicio) {
    return [];
  }

  const endDate = event.fechaFin || event.fechaInicio;
  const dates: string[] = [];
  const current = new Date(`${event.fechaInicio}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(current.getTime()) || Number.isNaN(end.getTime())) {
    return [event.fechaInicio];
  }

  if (current > end) {
    return [event.fechaInicio];
  }

  for (let guard = 0; current <= end && guard < 370; guard += 1) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function getRegistrationPanierQuantity(registration?: ComptoirSpecialEventRegistration | null): number {
  if (!registration || registration.statut === 'annule') {
    return 0;
  }

  if (Array.isArray(registration.aidItems) && registration.aidItems.length > 0) {
    const total = registration.aidItems.reduce((sum, item) => {
      const quantity = Number(item?.quantity);
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return sum;
      }
      return sum + Math.trunc(quantity);
    }, 0);

    if (total > 0) {
      return total;
    }
  }

  const quantity = Number(registration.aidQuantity);
  if (Number.isFinite(quantity) && quantity > 0) {
    return Math.trunc(quantity);
  }

  if (registration.aidTypeId || registration.aidTypeName) {
    return 1;
  }

  return 0;
}

function dedupeSpecialEventRegistrations(registrations: ComptoirSpecialEventRegistration[]): ComptoirSpecialEventRegistration[] {
  const byEventAndBeneficiary = new Map<string, ComptoirSpecialEventRegistration>();

  registrations.forEach((registration) => {
    const key = `${registration.eventId}__${registration.beneficiaireId}`;
    const existing = byEventAndBeneficiary.get(key);
    if (!existing) {
      byEventAndBeneficiary.set(key, registration);
      return;
    }

    const existingTimestamp = new Date(existing.updatedAt || existing.createdAt || 0).getTime();
    const currentTimestamp = new Date(registration.updatedAt || registration.createdAt || 0).getTime();
    if (currentTimestamp >= existingTimestamp) {
      byEventAndBeneficiary.set(key, registration);
    }
  });

  return Array.from(byEventAndBeneficiary.values());
}

export function FicheBeneficiaire({ beneficiaireId, onNavigate }: FicheBeneficiaireProps) {
  const { t } = useTranslation();

  const beneficiaire = beneficiaireId && beneficiaireId !== 'new'
    ? obtenirBeneficiaireComptoirParId(beneficiaireId)
    : null;
  const fullNameRef = useRef<HTMLInputElement | null>(null);
  const birthDateRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  
  const [isEditing, setIsEditing] = useState(beneficiaireId === 'new');
  const [infoExpanded, setInfoExpanded] = useState(true);
  const [situationExpanded, setSituationExpanded] = useState(true);
  const [historiqueExpanded, setHistoriqueExpanded] = useState(true);
  const [eventosExpanded, setEventosExpanded] = useState(true);
  const [nombrePersonnes, setNombrePersonnes] = useState(beneficiaire?.nombrePersonnes || 3);
  const [revenuMensuel, setRevenuMensuel] = useState(beneficiaire?.revenuMensuel?.toString() || '');
  const [niveauRevenu, setNiveauRevenu] = useState('');
  const [hasEnfants, setHasEnfants] = useState(beneficiaire?.hasEnfants || false);
  const [nombreEnfants, setNombreEnfants] = useState(beneficiaire?.nombreEnfants || 0);
  const [edadesEnfants, setEdadesEnfants] = useState<number[]>(beneficiaire?.nombreEnfants ? Array(beneficiaire.nombreEnfants).fill(0) : []);
  const [paisOrigen, setPaisOrigen] = useState(beneficiaire?.paisOrigen || 'ca');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [gender, setGender] = useState(beneficiaire?.sexe || 'no_respuesta');
  const [priority, setPriority] = useState<ComptoirBeneficiary['priorite']>(beneficiaire?.priorite || 'normale');
  const [notesInternes, setNotesInternes] = useState(beneficiaire?.notes || '');
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [registrationEventId, setRegistrationEventId] = useState<string>('');
  const [registrationStatus, setRegistrationStatus] = useState<ComptoirSpecialEventRegistration['statut']>('inscrit');
  const [registrationAidTypeId, setRegistrationAidTypeId] = useState('');
  const [registrationAppointmentDate, setRegistrationAppointmentDate] = useState('');
  const [registrationAppointmentTime, setRegistrationAppointmentTime] = useState('');
  
  // Estados para los campos de dirección
  const [adresse, setAdresse] = useState(beneficiaire?.adresse || '');
  const [ville, setVille] = useState(beneficiaire?.ville || '');
  const [codePostal, setCodePostal] = useState(beneficiaire?.codePostal || '');
  const [numeroAppartement, setNumeroAppartement] = useState(beneficiaire?.numeroAppartement || '');

  // Formule logique pour déterminer le niveau de revenu
  // Basée sur la Mesure du Panier de Consommation (MPC) du Canada
  const calculerNiveauRevenu = (revenu: number, personnes: number): { niveau: string; seuil: number; couleur: string } => {
    // Seuils MPC 2024 approximatifs pour Montréal (CAD$ mensuel)
    const seuilsBase: { [key: number]: number } = {
      1: 2100,   // 1 personne
      2: 2940,   // 2 personnes
      3: 3780,   // 3 personnes
      4: 4200,   // 4 personnes
      5: 4620,   // 5 personnes
      6: 5040,   // 6 personnes
      7: 5460,   // 7 personnes
    };

    // Pour plus de 7 personnes, ajouter 420 CAD$ par personne supplémentaire
    const calculerSeuil = (nb: number): number => {
      if (nb <= 7) return seuilsBase[nb];
      return seuilsBase[7] + ((nb - 7) * 420);
    };

    const seuilPauvrete = calculerSeuil(personnes);
    const seuilMoyen = seuilPauvrete * 1.5;

    if (revenu === 0) {
      return { 
        niveau: 'Aucun', 
        seuil: 0,
        couleur: '#DC3545'
      };
    } else if (revenu < seuilPauvrete) {
      return { 
        niveau: 'Faibles', 
        seuil: seuilPauvrete,
        couleur: '#FFC107'
      };
    } else if (revenu < seuilMoyen) {
      return { 
        niveau: 'Moyens', 
        seuil: seuilMoyen,
        couleur: '#4CAF50'
      };
    } else {
      return { 
        niveau: 'Suffisants', 
        seuil: seuilMoyen,
        couleur: '#1E73BE'
      };
    }
  };

  // Effet pour calculer automatiquement le niveau de revenu
  React.useEffect(() => {
    if (revenuMensuel && nombrePersonnes) {
      const revenu = parseInt(revenuMensuel, 10);
      if (!isNaN(revenu)) {
        const resultat = calculerNiveauRevenu(revenu, nombrePersonnes);
        setNiveauRevenu(resultat.niveau);
      }
    }
  }, [revenuMensuel, nombrePersonnes]);

  const distributions = beneficiaire ? obtenirDistributionsComptoir() : [];
  const appointments = beneficiaire ? obtenirRendezVousComptoir() : [];
  const aidRequests = beneficiaire ? obtenirDemandesAideComptoir() : [];
  const specialEvents = beneficiaire ? obtenirEvenementsSpeciauxComptoir() : [];
  const specialEventRegistrations = beneficiaire ? obtenirInscriptionsEvenementsSpeciauxComptoir() : [];
  const aidTypes = beneficiaire ? obtenirTypesAidePersonnalises().filter((aidType) => aidType.isActive !== false) : [];
  const availableSpecialEvents = specialEvents
    .filter((event) => event.statut !== 'annule' && event.statut !== 'termine')
    .slice()
    .sort((left, right) => left.fechaInicio.localeCompare(right.fechaInicio));
  const selectedRegistrationEvent = availableSpecialEvents.find((event) => event.id === registrationEventId) || null;
  const selectedRegistrationEventDates = selectedRegistrationEvent ? getEventAvailableDates(selectedRegistrationEvent) : [];

  const historiqueAides = beneficiaire
    ? distributions
        .filter((distribution) => distribution.beneficiaireId === beneficiaire.id)
        .slice()
        .sort((left, right) => getTimelineSortValue(right.date, right.time) - getTimelineSortValue(left.date, left.time))
        .map((distribution) => ({
          id: distribution.id,
          type: distribution.type,
          valeur: formatCurrency(distribution.estimatedValue),
          quantite: `${distribution.quantite} unite(s)`,
          date: `${formatDateLabel(distribution.date)}${distribution.time ? ` • ${distribution.time}` : ''}`,
        }))
    : [];

  const appointmentTimeline = beneficiaire
    ? appointments
        .filter((appointment) => appointment.beneficiaireId === beneficiaire.id)
        .map((appointment) => ({
          id: appointment.id,
          action: `${
            appointment.statut === 'annule'
              ? 'Rendez-vous annulé'
              : appointment.statut === 'absent'
                ? 'Rendez-vous absent'
              : appointment.statut === 'attente'
                ? 'Rendez-vous en attente'
                : 'Rendez-vous confirmé'
          } • ${appointment.motif}`,
          date: `${formatDateLabel(appointment.date)}${appointment.heure ? ` • ${appointment.heure}` : ''}`,
          user: 'Comptoir',
          sortValue: getTimelineSortValue(appointment.date, appointment.heure),
        }))
    : [];

  const aidRequestTimeline = beneficiaire
    ? aidRequests
        .filter(
          (request) =>
            request.beneficiaireId === beneficiaire.id &&
            request.status === 'approved' &&
            request.appointmentDate
        )
        .map((request) => ({
          id: `aid-request-${request.id}`,
          action: `Demande approuvée • ${request.type}`,
          date: `${formatDateLabel(request.appointmentDate)}${request.appointmentTime ? ` • ${request.appointmentTime}` : ''}`,
          user: 'Comptoir',
          sortValue: getTimelineSortValue(request.appointmentDate, request.appointmentTime),
        }))
    : [];

  const distributionTimeline = beneficiaire
    ? distributions
        .filter((distribution) => distribution.beneficiaireId === beneficiaire.id)
        .map((distribution) => ({
          id: `distribution-${distribution.id}`,
          action: `Aide distribuée • ${distribution.type}`,
          date: `${formatDateLabel(distribution.date)}${distribution.time ? ` • ${distribution.time}` : ''}`,
          user: 'Comptoir',
          sortValue: getTimelineSortValue(distribution.date, distribution.time),
        }))
    : [];

  const historiqueEvenements = beneficiaire
    ? specialEventRegistrations
        .filter((registration) => registration.beneficiaireId === beneficiaire.id)
        .map((registration) => {
          const event = specialEvents.find((item) => item.id === registration.eventId);
          const fechaInicio = event?.fechaInicio || event?.date || registration.createdAt;
          const fechaFin = event?.fechaFin || event?.date || fechaInicio;
          return {
            id: registration.id,
            nom: event?.nom || 'Événement spécial supprimé',
            statut: registration.statut,
            typeAide: registration.aidTypeName,
            dateCita: registration.appointmentDate,
            heureCita: registration.appointmentTime,
            fechaInicio,
            fechaFin,
            horaire: event?.heureDebut ? `${event.heureDebut}${event.heureFin ? ` à ${event.heureFin}` : ''}` : '',
            lieu: event?.lieu || 'Lieu non défini',
            notes: registration.notes,
            sortValue: getTimelineSortValue(registration.appointmentDate || fechaInicio || registration.updatedAt, registration.appointmentTime || event?.heureDebut),
          };
        })
        .sort((left, right) => right.sortValue - left.sortValue)
    : [];

  const eventTimeline = beneficiaire
    ? historiqueEvenements.map((eventItem) => ({
        id: `special-event-${eventItem.id}`,
        action: `Événement spécial • ${eventItem.nom} • ${eventItem.typeAide ? `${eventItem.typeAide} • ` : ''}${eventItem.statut}`,
        date: `${eventItem.dateCita ? formatDateLabel(eventItem.dateCita) : formatDateLabel(eventItem.fechaInicio)}${eventItem.heureCita ? ` • ${eventItem.heureCita}` : eventItem.horaire ? ` • ${eventItem.horaire}` : ''}${eventItem.fechaFin && eventItem.dateCita !== eventItem.fechaFin && eventItem.fechaFin !== eventItem.fechaInicio && !eventItem.dateCita ? ` au ${formatDateLabel(eventItem.fechaFin)}` : ''}`,
        user: 'Comptoir',
        sortValue: eventItem.sortValue,
      }))
    : [];

  const timeline = beneficiaire
    ? [
        {
          id: `beneficiary-created-${beneficiaire.id}`,
          action: 'Dossier créé',
          date: formatDateLabel(beneficiaire.createdAt),
          user: 'Comptoir',
          sortValue: getTimelineSortValue(beneficiaire.createdAt),
        },
        ...(beneficiaire.updatedAt !== beneficiaire.createdAt
          ? [
              {
                id: `beneficiary-updated-${beneficiaire.id}`,
                action: 'Dossier mis à jour',
                date: formatDateLabel(beneficiaire.updatedAt),
                user: 'Comptoir',
                sortValue: getTimelineSortValue(beneficiaire.updatedAt),
              },
            ]
          : []),
        ...appointmentTimeline,
        ...aidRequestTimeline,
        ...distributionTimeline,
        ...eventTimeline,
      ]
        .slice()
        .sort((left, right) => right.sortValue - left.sortValue)
    : [];

  const handleSave = () => {
    const nom = fullNameRef.current?.value.trim() || '';
    const telephone = phoneRef.current?.value.trim() || '';
    const email = emailRef.current?.value.trim() || '';

    if (!nom || !telephone) {
      toast.error(t('common.error'), {
        description: 'Le nom complet et le téléphone sont requis',
      });
      return;
    }

    const beneficiaryId = beneficiaire?.id || generarSiguienteIdBeneficiario();
    const savedBeneficiary = upsertBeneficiaireComptoir({
      id: beneficiaryId,
      nom,
      telephone,
      email,
      dateNaissance: birthDateRef.current?.value || '',
      sexe: gender,
      statut: beneficiaire?.statut || 'actif',
      priorite: priority,
      derniereAide: beneficiaire?.derniereAide || 'Aucune',
      notes: notesInternes,
      nombrePersonnes,
      revenuMensuel: revenuMensuel ? Number.parseInt(revenuMensuel, 10) : undefined,
      revenus: niveauRevenu || beneficiaire?.revenus || '',
      hasEnfants,
      nombreEnfants,
      paisOrigen,
      adresse,
      ville,
      codePostal,
      numeroAppartement,
      createdAt: beneficiaire?.createdAt,
      updatedAt: beneficiaire?.updatedAt,
    });

    toast.success(t('comptoir.beneficiarySaved'));

    if (beneficiaireId === 'new' || !beneficiaire) {
      onNavigate('fiche-beneficiaire', savedBeneficiary.id);
    }

    setIsEditing(false);
  };

  const handleOpenCreateEventRegistration = () => {
    if (!beneficiaire) {
      toast.info('Créez d’abord le dossier du bénéficiaire.');
      return;
    }

    if (availableSpecialEvents.length === 0) {
      toast.info('Aucun événement ouvert ou planifié disponible pour inscription.');
      return;
    }

    setRegistrationEventId(availableSpecialEvents[0].id);
    setRegistrationStatus('inscrit');
    setRegistrationAidTypeId('');
    setRegistrationAppointmentDate('');
    setRegistrationAppointmentTime('');
    setRegistrationDialogOpen(true);
  };

  const handleSaveEventRegistration = () => {
    if (!beneficiaire) {
      return;
    }

    const selectedEvent = specialEvents.find((event) => event.id === registrationEventId);
    if (!selectedEvent) {
      toast.error('Sélectionnez un événement valide.');
      return;
    }

    const availableDates = getEventAvailableDates(selectedEvent);
    if (registrationAppointmentDate && availableDates.length > 0 && !availableDates.includes(registrationAppointmentDate)) {
      toast.error('La date du rendez-vous doit être une date programmée de l’événement.');
      return;
    }

    const existingRegistration = specialEventRegistrations.find((registration) => (
      registration.eventId === selectedEvent.id && registration.beneficiaireId === beneficiaire.id
    ));

    const selectedAidType = aidTypes.find((aidType) => aidType.id === registrationAidTypeId);

    if (existingRegistration) {
      const dayLabel = existingRegistration.appointmentDate ? formatDateLabel(existingRegistration.appointmentDate) : 'Non défini';
      const hourLabel = existingRegistration.appointmentTime || 'Non définie';
      const aidTypeLabel = existingRegistration.aidTypeName || 'Aucun';
      const shouldContinue = window.confirm(
        `Ce bénéficiaire a déjà une inscription à cet événement.\n\nJour: ${dayLabel}\nHeure: ${hourLabel}\nType d'aide: ${aidTypeLabel}\n\nConfirmer la mise à jour avant d'enregistrer ?`
      );
      if (!shouldContinue) {
        return;
      }
    }

    const occupiedPaniers = specialEventRegistrations
      .filter((registration) => (
        registration.eventId === selectedEvent.id
        && registration.beneficiaireId !== beneficiaire.id
      ))
      .reduce((total, registration) => total + getRegistrationPanierQuantity(registration), 0);
    const panierForCurrentRegistration = registrationStatus === 'annule'
      ? 0
      : (registrationAidTypeId ? 1 : 0);

    if (
      typeof selectedEvent.capaciteMax === 'number'
      && (occupiedPaniers + panierForCurrentRegistration) > selectedEvent.capaciteMax
    ) {
      toast.error('L’objectif de paniers à distribuer de cet événement est atteint.');
      return;
    }

    const timestamp = new Date().toISOString();
    const registrationsToSave = specialEventRegistrations.slice();

    if (existingRegistration) {
      const index = registrationsToSave.findIndex((registration) => registration.id === existingRegistration.id);
      if (index >= 0) {
        registrationsToSave[index] = {
          ...existingRegistration,
          statut: registrationStatus,
          aidTypeId: registrationAidTypeId || undefined,
          aidTypeName: selectedAidType?.name || existingRegistration.aidTypeName,
          appointmentDate: registrationAppointmentDate || undefined,
          appointmentTime: registrationAppointmentTime || undefined,
          updatedAt: timestamp,
        };
      }
    } else {
      registrationsToSave.push({
        id: genererSiguienteIdInscriptionEvenementSpecial(),
        eventId: selectedEvent.id,
        beneficiaireId: beneficiaire.id,
        beneficiaireNom: beneficiaire.nom,
        aidTypeId: registrationAidTypeId || undefined,
        aidTypeName: selectedAidType?.name,
        appointmentDate: registrationAppointmentDate || undefined,
        appointmentTime: registrationAppointmentTime || undefined,
        statut: registrationStatus,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    sauvegarderInscriptionsEvenementsSpeciauxComptoir(dedupeSpecialEventRegistrations(registrationsToSave));
    setRegistrationDialogOpen(false);
    toast.success(existingRegistration ? 'Inscription mise à jour depuis le profil.' : 'Inscription créée depuis le profil.');
  };

  const CollapsibleSection = ({ 
    title, 
    expanded, 
    onToggle, 
    children 
  }: { 
    title: string; 
    expanded: boolean; 
    onToggle: () => void; 
    children: React.ReactNode;
  }) => (
    <Card>
      <CardHeader 
        className="cursor-pointer hover:bg-[#F4F4F4] transition-colors border-b"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '1rem' }}>
            {title}
          </CardTitle>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </CardHeader>
      {expanded && <CardContent className="pt-4">{children}</CardContent>}
    </Card>
  );

  return (
    <div className="space-y-4">
      {/* Header fiche */}
      <Card className="bg-gradient-to-r from-[#1E73BE] to-[#1557A0]">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                <User className="w-8 h-8 text-[#1E73BE]" />
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {beneficiaire ? beneficiaire.nom : t('comptoir.newBeneficiary')}
                </h1>
                {beneficiaire && (
                  <div className="flex gap-2">
                    <Badge className="bg-white text-[#1E73BE] hover:bg-white">
                      {beneficiaire.statut === 'actif' ? t('common.active') : t('common.inactive')}
                    </Badge>
                    <Badge className="bg-[#DC3545] hover:bg-[#DC3545]">
                      {t('comptoir.highPriority')}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <Button 
                    className="bg-white text-[#1E73BE] hover:bg-gray-100"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    {t('common.edit')}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline"
                    className="bg-white border-white text-[#1E73BE] hover:bg-gray-100"
                    onClick={() => {
                      if (beneficiaireId === 'new') {
                        onNavigate('beneficiaires');
                      } else {
                        setIsEditing(false);
                      }
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button 
                    className="bg-[#4CAF50] hover:bg-[#45a049]"
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {t('common.save')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disposition en 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Colonne gauche */}
        <div className="space-y-4">
          {/* Informations générales */}
          <CollapsibleSection
            title={t('comptoir.generalInformation')}
            expanded={infoExpanded}
            onToggle={() => setInfoExpanded(!infoExpanded)}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t('comptoir.fullName')} *</Label>
                  <Input 
                    ref={fullNameRef}
                    defaultValue={beneficiaire?.nom}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-[#F4F4F4]' : ''}
                  />
                </div>
                <div>
                  <Label>{t('comptoir.birthDate')}</Label>
                  <Input 
                    ref={birthDateRef}
                    type="date"
                    defaultValue={beneficiaire?.dateNaissance}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-[#F4F4F4]' : ''}
                  />
                </div>
              </div>

              <div>
                <Label>{t('comptoir.phone')} *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
                  <Input 
                    ref={phoneRef}
                    defaultValue={beneficiaire?.telephone}
                    disabled={!isEditing}
                    className={`pl-10 ${!isEditing ? 'bg-[#F4F4F4]' : ''}`}
                  />
                </div>
              </div>

              <div>
                <Label>{t('comptoir.email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
                  <Input 
                    ref={emailRef}
                    type="email"
                    defaultValue={beneficiaire?.email}
                    disabled={!isEditing}
                    className={`pl-10 ${!isEditing ? 'bg-[#F4F4F4]' : ''}`}
                  />
                </div>
              </div>

              {/* Nuevos campos adicionales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t('comptoir.gender')}</Label>
                  <Select disabled={!isEditing} value={gender} onValueChange={setGender}>
                    <SelectTrigger className={!isEditing ? 'bg-[#F4F4F4]' : ''}>
                      <SelectValue placeholder={t('comptoir.selectGender')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_respuesta">
                        <div className="flex items-center gap-2">
                          <span>🚫</span>
                          <span>{t('comptoir.noAnswer')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="masculino">
                        <div className="flex items-center gap-2">
                          <span>👨</span>
                          <span>{t('comptoir.male')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="femenino">
                        <div className="flex items-center gap-2">
                          <span>👩</span>
                          <span>{t('comptoir.female')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="otro">
                        <div className="flex items-center gap-2">
                          <span>⚧️</span>
                          <span>{t('comptoir.other')}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>{t('comptoir.immigrationStatus')}</Label>
                  <Select disabled={!isEditing} defaultValue={beneficiaire?.estatusInmigracion || 'ciudadano'}>
                    <SelectTrigger className={!isEditing ? 'bg-[#F4F4F4]' : ''}>
                      <SelectValue placeholder={t('comptoir.selectStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ciudadano">
                        <div className="flex items-center gap-2">
                          <span>🇨🇦</span>
                          <span>{t('comptoir.canadianCitizen')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="residente_permanente">
                        <div className="flex items-center gap-2">
                          <span>🏠</span>
                          <span>{t('comptoir.permanentResident')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="refugiado">
                        <div className="flex items-center gap-2">
                          <span>🛡️</span>
                          <span>{t('comptoir.refugee')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="solicitante_refugio">
                        <div className="flex items-center gap-2">
                          <span>📋</span>
                          <span>{t('comptoir.asylumSeeker')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="estudiante">
                        <div className="flex items-center gap-2">
                          <span>🎓</span>
                          <span>{t('comptoir.studentVisa')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="trabajador_temporal">
                        <div className="flex items-center gap-2">
                          <span>💼</span>
                          <span>{t('comptoir.temporaryWorker')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="visitante">
                        <div className="flex items-center gap-2">
                          <span>✈️</span>
                          <span>{t('comptoir.visitor')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="otro">
                        <div className="flex items-center gap-2">
                          <span>📄</span>
                          <span>{t('comptoir.otherStatus')}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>{t('comptoir.countryOfOrigin')}</Label>
                  <CountrySelect
                    value={paisOrigen}
                    onValueChange={setPaisOrigen}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-[#F4F4F4]' : ''}
                  />
                </div>

                <div>
                  <Label>{t('comptoir.ownsCar')}</Label>
                  <Select disabled={!isEditing} defaultValue={beneficiaire?.tieneCoche ? 'si' : 'no'}>
                    <SelectTrigger className={!isEditing ? 'bg-[#F4F4F4]' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="si">
                        <div className="flex items-center gap-2">
                          <span>🚗</span>
                          <span>{t('common.yes')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="no">
                        <div className="flex items-center gap-2">
                          <span>🚫</span>
                          <span>{t('common.no')}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>{t('comptoir.spokenLanguages')}</Label>
                <Select disabled={!isEditing} defaultValue={beneficiaire?.idiomasHablados || 'frances'}>
                  <SelectTrigger className={!isEditing ? 'bg-[#F4F4F4]' : ''}>
                    <SelectValue placeholder={t('comptoir.selectLanguages')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frances">
                      <div className="flex items-center gap-2">
                        <span>🇫🇷</span>
                        <span>{t('comptoir.french')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ingles">
                      <div className="flex items-center gap-2">
                        <span>🇬🇧</span>
                        <span>{t('comptoir.english')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="frances_ingles">
                      <div className="flex items-center gap-2">
                        <span>🇫🇷🇬🇧</span>
                        <span>{t('comptoir.frenchEnglish')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="espanol">
                      <div className="flex items-center gap-2">
                        <span>🇪🇸</span>
                        <span>{t('comptoir.spanish')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="arabe">
                      <div className="flex items-center gap-2">
                        <span>🇸🇦</span>
                        <span>{t('comptoir.arabic')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="chino">
                      <div className="flex items-center gap-2">
                        <span>🇨🇳</span>
                        <span>{t('comptoir.chinese')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="portugues">
                      <div className="flex items-center gap-2">
                        <span>🇵🇹</span>
                        <span>{t('comptoir.portuguese')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="creole">
                      <div className="flex items-center gap-2">
                        <span>🇭🇹</span>
                        <span>{t('comptoir.creole')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="otro">
                      <div className="flex items-center gap-2">
                        <span>🌍</span>
                        <span>{t('comptoir.otherLanguage')}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#666666] mt-1">
                  💡 {t('comptoir.languageHelper')}
                </p>
              </div>

              {/* Adresse divisée en 4 champs */}
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-[#1E73BE]" />
                  <Label className="text-base font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('comptoir.addressSection')}
                  </Label>
                </div>

                <div className="space-y-4">
                  {isEditing ? (
                    <>
                      <AddressAutocomplete
                        onAddressSelect={(address) => {
                          setAdresse(address.street);
                          setVille(address.city);
                          setCodePostal(address.postalCode);
                        }}
                        disabled={false}
                        initialValue={adresse}
                        placeholder="Commencez à taper une adresse..."
                        label={t('comptoir.streetAddress')}
                        required={false}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>{t('comptoir.apartmentNumber')}</Label>
                          <Input 
                            value={numeroAppartement}
                            onChange={(e) => setNumeroAppartement(e.target.value)}
                            placeholder="App. 5"
                          />
                        </div>
                        <div>
                          <Label>{t('comptoir.city')}</Label>
                          <Input 
                            value={ville}
                            onChange={(e) => setVille(e.target.value)}
                            placeholder="Montréal"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>{t('comptoir.postalCode')}</Label>
                        <Input 
                          value={codePostal}
                          onChange={(e) => setCodePostal(e.target.value.toUpperCase())}
                          placeholder="H2X 1Y1"
                          className="uppercase"
                          maxLength={7}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label>{t('comptoir.streetAddress')}</Label>
                        <Input 
                          value={beneficiaire?.adresse || ''}
                          disabled
                          className="bg-[#F4F4F4]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label>{t('comptoir.apartmentNumber')}</Label>
                          <Input 
                            value={beneficiaire?.numeroAppartement || ''}
                            disabled
                            className="bg-[#F4F4F4]"
                          />
                        </div>
                        <div>
                          <Label>{t('comptoir.city')}</Label>
                          <Input 
                            value={beneficiaire?.ville || ''}
                            disabled
                            className="bg-[#F4F4F4]"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>{t('comptoir.postalCode')}</Label>
                        <Input 
                          value={beneficiaire?.codePostal || ''}
                          disabled
                          className="bg-[#F4F4F4] uppercase"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <Label>{t('comptoir.housingType')}</Label>
                <Select disabled={!isEditing} defaultValue={beneficiaire?.typeLogement || 'locataire'}>
                  <SelectTrigger className={!isEditing ? 'bg-[#F4F4F4]' : ''}>
                    <SelectValue placeholder={t('comptoir.selectHousingType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proprietaire">
                      <div className="flex items-center gap-2">
                        <span>🏠</span>
                        <span>{t('comptoir.owner')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="locataire">
                      <div className="flex items-center gap-2">
                        <span>🔑</span>
                        <span>{t('comptoir.tenant')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="heberge">
                      <div className="flex items-center gap-2">
                        <span>👥</span>
                        <span>{t('comptoir.hosted')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="autre">
                      <div className="flex items-center gap-2">
                        <span>📋</span>
                        <span>{t('comptoir.otherHousing')}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleSection>

          {/* Situation */}
          <CollapsibleSection
            title={t('comptoir.situation')}
            expanded={situationExpanded}
            onToggle={() => setSituationExpanded(!situationExpanded)}
          >
            <div className="space-y-4">
              <div>
                <Label>{t('comptoir.familySituation')}</Label>
                <Select disabled={!isEditing} defaultValue={beneficiaire?.situationFamiliale}>
                  <SelectTrigger className={!isEditing ? 'bg-[#F4F4F4]' : ''}>
                    <SelectValue placeholder={t('comptoir.selectSituation')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Famille monoparentale">{t('comptoir.singleParent')}</SelectItem>
                    <SelectItem value="Couple avec enfants">{t('comptoir.coupleWithChildren')}</SelectItem>
                    <SelectItem value="Personne seule">{t('comptoir.single')}</SelectItem>
                    <SelectItem value="Couple sans enfants">{t('comptoir.coupleNoChildren')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Enfants */}
              <div className="border border-[#CCCCCC] rounded-lg p-4 bg-[#FAFAFA]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">👶</span>
                  <Label className="text-base font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('comptoir.children')}
                  </Label>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">{t('comptoir.hasChildren')}</Label>
                    <Select 
                      disabled={!isEditing} 
                      value={hasEnfants ? 'oui' : 'non'}
                      onValueChange={(value) => {
                        setHasEnfants(value === 'oui');
                        if (value === 'non') {
                          setNombreEnfants(0);
                        }
                      }}
                    >
                      <SelectTrigger className={!isEditing ? 'bg-[#F4F4F4]' : 'bg-white'}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oui">
                          <div className="flex items-center gap-2">
                            <span>✅</span>
                            <span>{t('common.yes')}</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="non">
                          <div className="flex items-center gap-2">
                            <span>❌</span>
                            <span>{t('common.no')}</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {hasEnfants && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                      <Label className="text-sm">{t('comptoir.numberOfChildren')}</Label>
                      <Input 
                        type="number"
                        min="0"
                        max="20"
                        value={nombreEnfants}
                        disabled={!isEditing}
                        className={!isEditing ? 'bg-[#F4F4F4]' : 'bg-white'}
                        onChange={(e) => {
                          const newNombre = parseInt(e.target.value) || 0;
                          setNombreEnfants(newNombre);
                          // Ajuster le array de edades
                          if (newNombre > edadesEnfants.length) {
                            setEdadesEnfants([...edadesEnfants, ...Array(newNombre - edadesEnfants.length).fill(0)]);
                          } else {
                            setEdadesEnfants(edadesEnfants.slice(0, newNombre));
                          }
                        }}
                      />
                      {nombreEnfants > 0 && (
                        <p className="text-xs text-[#4CAF50] mt-1 flex items-center gap-1">
                          <span>ℹ️</span>
                          <span>
                            {nombreEnfants} {nombreEnfants > 1 ? t('comptoir.childrenCount') : t('comptoir.childCount')}
                          </span>
                        </p>
                      )}
                      
                      {/* Campo de edades de los niños */}
                      {nombreEnfants > 0 && (
                        <div className="mt-4 p-3 bg-white border-2 border-[#1E73BE]/20 rounded-lg">
                          <Label className="text-sm font-semibold text-[#1E73BE] mb-2 block">
                            {t('comptoir.childrenAges')} 🧒
                          </Label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {Array.from({ length: nombreEnfants }).map((_, index) => (
                              <div key={index} className="space-y-1">
                                <Label className="text-xs text-[#666666]">
                                  {t('comptoir.child')} {index + 1}
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="18"
                                  value={edadesEnfants[index] || 0}
                                  disabled={!isEditing}
                                  className={!isEditing ? 'bg-[#F4F4F4]' : 'bg-white'}
                                  placeholder="Âge"
                                  onChange={(e) => {
                                    const newEdades = [...edadesEnfants];
                                    newEdades[index] = parseInt(e.target.value) || 0;
                                    setEdadesEnfants(newEdades);
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-[#666666] mt-2 italic">
                            💡 {t('comptoir.childrenAgesHelper')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('comptoir.householdSize')}</Label>
                  <Input 
                    type="number"
                    defaultValue={beneficiaire?.nombrePersonnes}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-[#F4F4F4]' : ''}
                    onChange={(e) => setNombrePersonnes(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label>{t('comptoir.monthlyIncome')}</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666] font-semibold">
                      CAD$
                    </span>
                    <Input 
                      type="number"
                      step="1"
                      placeholder="0"
                      value={revenuMensuel}
                      disabled={!isEditing}
                      className={`pl-16 ${!isEditing ? 'bg-[#F4F4F4]' : ''}`}
                      onChange={(e) => setRevenuMensuel(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Calcul automatique du niveau de revenu */}
              {revenuMensuel && nombrePersonnes && (
                <div className="bg-gradient-to-r from-[#E3F2FD] to-[#E8F5E9] border-2 border-[#1E73BE] rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[#1E73BE] flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#1E73BE] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        📊 {t('comptoir.incomeCalculation')}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[#666666]">{t('comptoir.declaredIncome')}:</span>
                          <span className="font-semibold">{Math.round(Number.parseInt(revenuMensuel, 10) || 0)} CAD$ / {t('comptoir.month').toLowerCase()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#666666]">{t('comptoir.householdSize')}:</span>
                          <span className="font-semibold">{nombrePersonnes} {nombrePersonnes > 1 ? t('comptoir.persons') : t('comptoir.person')}</span>
                        </div>
                        <div className="border-t border-[#1E73BE]/20 my-2 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-[#333333]">{t('comptoir.incomeLevel')}:</span>
                            <Badge 
                              className="font-semibold"
                              style={{ 
                                backgroundColor: calculerNiveauRevenu(parseInt(revenuMensuel, 10), nombrePersonnes).couleur,
                                color: 'white'
                              }}
                            >
                              {calculerNiveauRevenu(parseInt(revenuMensuel, 10), nombrePersonnes).niveau}
                            </Badge>
                          </div>
                        </div>
                        <div className="bg-white/60 rounded p-2 mt-2 text-xs text-[#666666]">
                          <p className="font-medium mb-1">💡 {t('comptoir.mpcFormula')}:</p>
                          <p>{t('comptoir.mpcExplanation', {
                            threshold: Math.round(calculerNiveauRevenu(parseInt(revenuMensuel, 10), nombrePersonnes).seuil)
                          })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <Label>{t('comptoir.income')}</Label>
                <Select disabled={!isEditing} value={niveauRevenu || beneficiaire?.revenus}>
                  <SelectTrigger className={!isEditing ? 'bg-[#F4F4F4]' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aucun">{t('comptoir.noIncome')}</SelectItem>
                    <SelectItem value="Faibles">{t('comptoir.lowIncome')}</SelectItem>
                    <SelectItem value="Moyens">{t('comptoir.mediumIncome')}</SelectItem>
                    <SelectItem value="Suffisants">{t('comptoir.sufficientIncome')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#666666] mt-1">
                  {niveauRevenu && revenuMensuel ? (
                    <span className="text-[#4CAF50]">✓ {t('comptoir.autoCalculated')}</span>
                  ) : (
                    <span>{t('comptoir.manualSelection')}</span>
                  )}
                </p>
              </div>

              <div>
                <Label>{t('comptoir.priority')}</Label>
                <Select disabled={!isEditing} value={priority} onValueChange={(value) => setPriority(value as ComptoirBeneficiary['priorite'])}>
                  <SelectTrigger className={!isEditing ? 'bg-[#F4F4F4]' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="haute">{t('comptoir.highPriority')}</SelectItem>
                    <SelectItem value="normale">{t('comptoir.normalPriority')}</SelectItem>
                    <SelectItem value="basse">{t('comptoir.lowPriority')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{t('comptoir.internalNotes')}</Label>
                <Textarea
                  value={notesInternes}
                  onChange={(event) => setNotesInternes(event.target.value)}
                  disabled={!isEditing}
                  className={`min-h-[100px] ${!isEditing ? 'bg-[#F4F4F4]' : ''}`}
                  placeholder={t('comptoir.notesPlaceholder')}
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Documents Section */}
          <CollapsibleSection
            title={t('comptoir.documents')}
            expanded={true}
            onToggle={() => {}}
          >
            <FileUpload
              files={uploadedFiles}
              onFilesChange={setUploadedFiles}
              disabled={!isEditing}
            />
          </CollapsibleSection>
        </div>

        {/* Colonne droite */}
        <div className="space-y-4">
          {/* Historique des aides */}
          <CollapsibleSection
            title={t('comptoir.aidHistory')}
            expanded={historiqueExpanded}
            onToggle={() => setHistoriqueExpanded(!historiqueExpanded)}
          >
            {beneficiaire ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-[#666666]">
                    {historiqueAides.length} {t('comptoir.aidsRecorded')}
                  </div>
                  <Button size="sm" className="bg-[#4CAF50] hover:bg-[#45a049]" onClick={() => onNavigate('aide-alimentaire', beneficiaire?.id)}>
                    <Plus className="w-4 h-4 mr-1" />
                    {t('comptoir.addAid')}
                  </Button>
                </div>
                {historiqueAides.map((aide) => (
                  <div key={aide.id} className="border-l-4 border-[#1E73BE] bg-[#F4F4F4] p-3 rounded">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {aide.type}
                      </div>
                      <Badge variant="outline">{aide.valeur}</Badge>
                    </div>
                    <div className="text-sm text-[#666666]">{aide.quantite}</div>
                    <div className="text-xs text-[#999999] mt-1">{aide.date}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-[#666666]">
                {t('comptoir.noHistoryYet')}
              </div>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            title="Historique des événements spéciaux"
            expanded={eventosExpanded}
            onToggle={() => setEventosExpanded(!eventosExpanded)}
          >
            {beneficiaire ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-[#666666]">
                    {historiqueEvenements.length} participation(s) enregistrée(s)
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="bg-[#4CAF50] hover:bg-[#449B48]" onClick={handleOpenCreateEventRegistration}>
                      <Plus className="w-4 h-4 mr-1" />
                      Inscrire au événement
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onNavigate('evenements-speciaux')}>
                      <Calendar className="w-4 h-4 mr-1" />
                      Voir les événements
                    </Button>
                  </div>
                </div>

                {historiqueEvenements.length > 0 ? historiqueEvenements.map((eventItem) => (
                  <div key={eventItem.id} className="border-l-4 border-[#4CAF50] bg-[#F4F4F4] p-3 rounded">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {eventItem.nom}
                        </div>
                        <div className="text-sm text-[#666666] mt-1">
                          {eventItem.dateCita ? formatDateLabel(eventItem.dateCita) : formatDateLabel(eventItem.fechaInicio)}
                          {!eventItem.dateCita && eventItem.fechaFin && eventItem.fechaFin !== eventItem.fechaInicio ? ` au ${formatDateLabel(eventItem.fechaFin)}` : ''}
                          {eventItem.heureCita ? ` • ${eventItem.heureCita}` : eventItem.horaire ? ` • ${eventItem.horaire}` : ''}
                        </div>
                        {(eventItem.dateCita || eventItem.heureCita) && (
                          <div className="text-sm text-[#666666]">Rendez-vous: {eventItem.dateCita ? formatDateLabel(eventItem.dateCita) : 'Date non définie'}{eventItem.heureCita ? ` • ${eventItem.heureCita}` : ''}</div>
                        )}
                        {eventItem.typeAide && (
                          <div className="text-sm text-[#666666]">Type d'aide: {eventItem.typeAide}</div>
                        )}
                        <div className="text-sm text-[#666666]">{eventItem.lieu}</div>
                        {eventItem.notes && (
                          <div className="text-xs text-[#666666] mt-1">Notes: {eventItem.notes}</div>
                        )}
                      </div>
                      <Badge variant="outline">{eventItem.statut}</Badge>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6 text-[#666666]">
                    Aucune participation à un événement spécial pour le moment.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-[#666666]">
                Créez d’abord le dossier du bénéficiaire pour suivre ses événements spéciaux.
              </div>
            )}
          </CollapsibleSection>

          <Dialog open={registrationDialogOpen} onOpenChange={setRegistrationDialogOpen}>
            <DialogContent className="max-w-lg" aria-describedby="beneficiary-event-registration-description">
              <DialogHeader>
                <DialogTitle>Inscrire le bénéficiaire à un événement</DialogTitle>
                <DialogDescription id="beneficiary-event-registration-description">
                  Créez ou mettez à jour rapidement une inscription d'événement spécial depuis le profil.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Événement</Label>
                  <Select value={registrationEventId} onValueChange={setRegistrationEventId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionner un événement" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSpecialEvents.map((event) => (
                        <SelectItem key={event.id} value={event.id}>{event.nom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Statut d'inscription</Label>
                  <Select value={registrationStatus} onValueChange={(value) => setRegistrationStatus(value as ComptoirSpecialEventRegistration['statut'])}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inscrit">Inscrit</SelectItem>
                      <SelectItem value="present">Présent</SelectItem>
                      <SelectItem value="absent">Absent</SelectItem>
                      <SelectItem value="annule">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Type d'aide</Label>
                  <Select value={registrationAidTypeId || '__none__'} onValueChange={(value) => setRegistrationAidTypeId(value === '__none__' ? '' : value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Aucun</SelectItem>
                      {aidTypes.map((aidType: ComptoirAidType) => (
                        <SelectItem key={aidType.id} value={aidType.id}>{aidType.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Jour du rendez-vous</Label>
                  <Select value={registrationAppointmentDate && selectedRegistrationEventDates.includes(registrationAppointmentDate) ? registrationAppointmentDate : '__none__'} onValueChange={(value) => setRegistrationAppointmentDate(value === '__none__' ? '' : value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Sélectionner un jour" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Aucune date</SelectItem>
                      {selectedRegistrationEventDates.map((availableDate) => (
                        <SelectItem key={availableDate} value={availableDate}>{formatDateLabel(availableDate)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Heure du rendez-vous</Label>
                  <Input
                    type="time"
                    value={registrationAppointmentTime}
                    onChange={(event) => setRegistrationAppointmentTime(event.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setRegistrationDialogOpen(false)}>
                  Annuler
                </Button>
                <Button className="bg-[#1E73BE] hover:bg-[#1557A0]" onClick={handleSaveEventRegistration}>
                  Enregistrer l'inscription
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Timeline d'activité */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '1rem' }}>
                {t('comptoir.activityTimeline')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {beneficiaire ? (
                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-[#1E73BE]"></div>
                        {index < timeline.length - 1 && (
                          <div className="w-0.5 h-full bg-[#CCCCCC] mt-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="text-sm font-medium text-[#333333]">
                          {item.action}
                        </div>
                        <div className="text-xs text-[#666666] mt-1">
                          {item.date} • {item.user}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-[#666666]">
                  {t('comptoir.noActivityYet')}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}