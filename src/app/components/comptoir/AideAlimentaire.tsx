import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Calendar, User, Hash, Save, History, Send, Settings, Search, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { QuantityInput, parseQuantityText } from '../ui/quantity-input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { BoutonRetourHeader } from '../shared/BoutonRetour';
import { formatMoney } from '../../utils/formatUtils';
import {
  comptoirStorageEvents,
  comptoirStorageKeys,
  obtenirDemandesAideComptoir,
  obtenirBeneficiairesComptoir,
  obtenirReservationSettingsComptoir,
  sauvegarderDemandesAideComptoir,
  type ComptoirBeneficiary,
} from '../../utils/comptoirStorage';

interface AideAlimentaireProps {
  onNavigate: (view: string, id?: string) => void;
  aidTypes: any[];
  preselectedBeneficiaireId?: string;
}

const AIDE_ALIMENTAIRE_SCHEDULE_STORAGE_KEY = 'comptoir_aide_alimentaire_schedule';

export function AideAlimentaire({ onNavigate, aidTypes, preselectedBeneficiaireId }: AideAlimentaireProps) {
  const { t } = useTranslation();
  const getRememberedSchedule = () => {
    const today = new Date().toISOString().split('T')[0];
    const defaultSettings = obtenirReservationSettingsComptoir();

    try {
      const rawValue = localStorage.getItem(AIDE_ALIMENTAIRE_SCHEDULE_STORAGE_KEY);
      if (!rawValue) {
        return {
          date: today,
          time: defaultSettings.startTime,
        };
      }

      const parsedValue = JSON.parse(rawValue) as { date?: string; time?: string };
      return {
        date: parsedValue.date || today,
        time: parsedValue.time || defaultSettings.startTime,
      };
    } catch (error) {
      console.error('Erreur lors de la lecture de la date/heure mémorisées pour l\'aide alimentaire :', error);
      return {
        date: today,
        time: defaultSettings.startTime,
      };
    }
  };

  const rememberedSchedule = getRememberedSchedule();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBeneficiaires, setSelectedBeneficiaires] = useState<ComptoirBeneficiary[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAidType, setSelectedAidType] = useState<string>('');
  const [beneficiaires, setBeneficiaires] = useState<ComptoirBeneficiary[]>(() => obtenirBeneficiairesComptoir());
  const [quantite, setQuantite] = useState('1');
  const [dateAide, setDateAide] = useState(rememberedSchedule.date);
  const [reservationSettings, setReservationSettings] = useState(() => obtenirReservationSettingsComptoir());
  const [heureAide, setHeureAide] = useState(rememberedSchedule.time);
  const [valeurEstimee, setValeurEstimee] = useState('');
  const [notes, setNotes] = useState('');
  const [demandesRefreshToken, setDemandesRefreshToken] = useState(0);

  const getRequestReservationSlotKey = (request: { appointmentDate?: string; appointmentTime?: string; dateRequested?: string }) => {
    const appointmentDate = request.appointmentDate || request.dateRequested?.split(' ')[0] || '';
    const appointmentTime = request.appointmentTime || request.dateRequested?.split(' ')[1] || '';

    if (!appointmentDate || !appointmentTime) {
      return null;
    }

    return `${appointmentDate}__${appointmentTime}`;
  };

  const generateReservationSlots = () => {
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
  };

  const reservationTimeSlots = generateReservationSlots();

  const occupiedTimesForSelectedDate = new Set(
    obtenirDemandesAideComptoir()
      .filter((request) => request.status !== 'rejected')
      .filter((request) => {
        const requestDate = request.appointmentDate || request.dateRequested?.split(' ')[0] || '';
        return Boolean(dateAide) && requestDate === dateAide;
      })
      .map((request) => request.appointmentTime || request.dateRequested?.split(' ')[1] || '')
      .filter((value) => Boolean(value))
  );

  const availableReservationTimeSlots = reservationTimeSlots.filter((slot) => !occupiedTimesForSelectedDate.has(slot));

  const planReservationSchedule = (baseDate: string, baseTime: string, offsetMinutes: number) => {
    const hasDate = Boolean(baseDate);
    const hasTime = Boolean(baseTime);

    if (!hasDate) {
      return {
        appointmentDate: undefined as string | undefined,
        appointmentTime: hasTime ? baseTime : undefined,
        dateRequested: hasTime ? ` ${baseTime}` : '',
      };
    }

    if (!hasTime) {
      return {
        appointmentDate: baseDate,
        appointmentTime: undefined as string | undefined,
        dateRequested: baseDate,
      };
    }

    const baseDateTime = new Date(`${baseDate}T${baseTime}:00`);
    if (Number.isNaN(baseDateTime.getTime())) {
      return {
        appointmentDate: baseDate,
        appointmentTime: baseTime,
        dateRequested: `${baseDate} ${baseTime}`,
      };
    }

    baseDateTime.setMinutes(baseDateTime.getMinutes() + offsetMinutes);

    const appointmentDate = baseDateTime.toISOString().slice(0, 10);
    const appointmentTime = `${String(baseDateTime.getHours()).padStart(2, '0')}:${String(baseDateTime.getMinutes()).padStart(2, '0')}`;

    return {
      appointmentDate,
      appointmentTime,
      dateRequested: `${appointmentDate} ${appointmentTime}`,
    };
  };

  const generarSiguienteIdDemanda = () => {
    const requests = obtenirDemandesAideComptoir();
    const maxId = requests.reduce((maxValue, request) => {
      const numericId = Number(request.id);
      if (!Number.isFinite(numericId)) {
        return maxValue;
      }

      return Math.max(maxValue, numericId);
    }, 0);

    return maxId + 1;
  };

  // Obtener el tipo de ayuda seleccionado
  const currentAidType = aidTypes.find(type => type.id === selectedAidType);

  useEffect(() => {
    const refreshBeneficiaires = () => {
      setBeneficiaires(obtenirBeneficiairesComptoir());
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === comptoirStorageKeys.beneficiaries) {
        refreshBeneficiaires();
      }

      if (event.key === comptoirStorageKeys.aidRequests) {
        setDemandesRefreshToken((currentValue) => currentValue + 1);
      }

      if (event.key === comptoirStorageKeys.reservationSettings) {
        const updatedSettings = obtenirReservationSettingsComptoir();
        setReservationSettings(updatedSettings);
        setHeureAide((currentTime) => currentTime || updatedSettings.startTime);
      }
    };

    const handleComptoirStorageUpdated = (event: Event) => {
      const { detail } = event as CustomEvent<{ key?: string }>;
      if (detail?.key === comptoirStorageKeys.beneficiaries) {
        refreshBeneficiaires();
      }

      if (detail?.key === comptoirStorageKeys.aidRequests) {
        setDemandesRefreshToken((currentValue) => currentValue + 1);
      }

      if (detail?.key === comptoirStorageKeys.reservationSettings) {
        const updatedSettings = obtenirReservationSettingsComptoir();
        setReservationSettings(updatedSettings);
        setHeureAide((currentTime) => currentTime || updatedSettings.startTime);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(comptoirStorageEvents.updated, handleComptoirStorageUpdated);
    window.addEventListener('focus', refreshBeneficiaires);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(comptoirStorageEvents.updated, handleComptoirStorageUpdated);
      window.removeEventListener('focus', refreshBeneficiaires);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      AIDE_ALIMENTAIRE_SCHEDULE_STORAGE_KEY,
      JSON.stringify({ date: dateAide, time: heureAide })
    );
  }, [dateAide, heureAide]);

  useEffect(() => {
    if (availableReservationTimeSlots.length === 0) {
      return;
    }

    if (!availableReservationTimeSlots.includes(heureAide)) {
      setHeureAide(availableReservationTimeSlots[0]);
    }
  }, [heureAide, availableReservationTimeSlots, demandesRefreshToken]);

  useEffect(() => {
    if (!preselectedBeneficiaireId) {
      return;
    }

    const preselectedBeneficiaire = beneficiaires.find((beneficiary) => beneficiary.id === preselectedBeneficiaireId);
    if (!preselectedBeneficiaire) {
      return;
    }

    setSelectedBeneficiaires((currentSelected) => {
      if (currentSelected.some((item) => item.id === preselectedBeneficiaire.id)) {
        return currentSelected;
      }

      return [preselectedBeneficiaire, ...currentSelected];
    });
  }, [preselectedBeneficiaireId, beneficiaires]);

  // Filtrage des bénéficiaires (excluant ceux déjà sélectionnés)
  const beneficiairesFiltres = beneficiaires.filter((b) => {
    const alreadySelected = selectedBeneficiaires.some(sb => sb.id === b.id);
    if (alreadySelected) return false;
    
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      b.nom.toLowerCase().includes(searchLower) ||
      b.id.toLowerCase().includes(searchLower) ||
      b.telephone.includes(searchTerm) ||
      b.email.toLowerCase().includes(searchLower)
    );
  });

  const handleSelectBeneficiaire = (beneficiaire: ComptoirBeneficiary) => {
    setSelectedBeneficiaires([...selectedBeneficiaires, beneficiaire]);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemoveBeneficiaire = (beneficiaireId: string) => {
    setSelectedBeneficiaires(selectedBeneficiaires.filter(b => b.id !== beneficiaireId));
  };

  const handleClearAll = () => {
    setSelectedBeneficiaires([]);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleEnregistrer = () => {
    if (selectedBeneficiaires.length === 0) {
      toast.error(t('common.error'), {
        description: 'Sélectionnez au moins un bénéficiaire.',
      });
      return;
    }

    if (!selectedAidType || !currentAidType) {
      toast.error(t('common.error'), {
        description: 'Sélectionnez un type d\'aide avant d\'enregistrer.',
      });
      return;
    }

    const quantity = parseQuantityText(quantite, false) || 0;
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error(t('common.error'), {
        description: 'La quantité doit être supérieure à 0.',
      });
      return;
    }

    let estimatedValue: number;
    if (valeurEstimee.trim()) {
      const parsedValue = Number.parseFloat(valeurEstimee);
      if (!Number.isFinite(parsedValue) || parsedValue < 0) {
        toast.error(t('common.error'), {
          description: 'La valeur estimée doit être un nombre valide supérieur ou égal à 0.',
        });
        return;
      }
      estimatedValue = parsedValue;
    } else {
      estimatedValue = (currentAidType.defaultValue || 0) * quantity;
    }

    const intervalMinutes = reservationSettings.intervalMinutes;
    if (!Number.isFinite(intervalMinutes) || intervalMinutes <= 0) {
      toast.error(t('common.error'), {
        description: 'Programmez un intervalle valide dans le tableau de bord du Comptoir.',
      });
      return;
    }

    if (reservationTimeSlots.length === 0) {
      toast.error(t('common.error'), {
        description: 'Aucun créneau n\'est disponible. Vérifiez la programmation des réservations.',
      });
      return;
    }

    if (availableReservationTimeSlots.length === 0) {
      toast.error(t('common.error'), {
        description: 'Tous les créneaux de cette date sont déjà réservés.',
      });
      return;
    }

    if (!heureAide) {
      toast.error(t('common.error'), {
        description: 'Sélectionnez une heure de base parmi les créneaux programmés.',
      });
      return;
    }

    if (!availableReservationTimeSlots.includes(heureAide)) {
      toast.error(t('common.error'), {
        description: 'Ce créneau est déjà réservé. Choisissez une autre heure.',
      });
      return;
    }

    const demandasActuales = obtenirDemandesAideComptoir();
    let siguienteIdDemanda = generarSiguienteIdDemanda();

    const occupiedReservationSlots = new Set(
      demandasActuales
        .filter((request) => request.status !== 'rejected')
        .map((request) => getRequestReservationSlotKey(request))
        .filter((slotKey): slotKey is string => Boolean(slotKey))
    );

    const beneficiariesWithExistingReservation = selectedBeneficiaires.filter((beneficiaire) => (
      demandasActuales.some((request) => request.beneficiaireId === beneficiaire.id && request.status !== 'rejected')
    ));

    if (beneficiariesWithExistingReservation.length > 0) {
      const reservationDetails = beneficiariesWithExistingReservation.map((beneficiaire) => {
        const existingRequest = demandasActuales.find((request) => (
          request.beneficiaireId === beneficiaire.id && request.status !== 'rejected'
        ));

        const dayLabel = existingRequest?.appointmentDate || existingRequest?.dateRequested?.split(' ')[0] || 'Non défini';
        const hourLabel = existingRequest?.appointmentTime || existingRequest?.dateRequested?.split(' ')[1] || 'Non définie';
        const aidTypeLabel = existingRequest?.type || 'Non défini';
        const statusLabel = existingRequest?.status === 'approved' ? 'approuvée' : 'en attente';

        return `- ${beneficiaire.nom}: Jour ${dayLabel}, Heure ${hourLabel}, Type ${aidTypeLabel}, Statut ${statusLabel}`;
      }).join('\n');

      const shouldContinue = window.confirm(
        `Attention: des réservations existent déjà pour ces bénéficiaires.\n\n${reservationDetails}\n\nCes bénéficiaires seront ignorés. Voulez-vous continuer ?`
      );

      if (!shouldContinue) {
        return;
      }
    }

    const skippedBeneficiaries: string[] = [];
    let addedCount = 0;
    const baseSlotIndex = Math.max(reservationTimeSlots.indexOf(heureAide), 0);
    const eligibleBeneficiaries = selectedBeneficiaires.filter((beneficiaire) => !beneficiariesWithExistingReservation.some((item) => item.id === beneficiaire.id));
    const availableSlots = reservationTimeSlots
      .slice(baseSlotIndex)
      .filter((slot) => !occupiedReservationSlots.has(`${dateAide}__${slot}`));

    if (availableSlots.length < eligibleBeneficiaries.length) {
      toast.error(t('common.error'), {
        description: 'Les créneaux disponibles ne suffisent pas pour tous les bénéficiaires sélectionnés à cette date.',
      });
      return;
    }

    let nextReservationSlotIndex = 0;

    selectedBeneficiaires.forEach((beneficiaire) => {
      const hasExistingReservation = demandasActuales.some((request) => (
        request.beneficiaireId === beneficiaire.id && request.status !== 'rejected'
      ));

      if (hasExistingReservation) {
        skippedBeneficiaries.push(beneficiaire.nom);
        return;
      }

      const assignedSlot = availableSlots[nextReservationSlotIndex];
      const reservationSchedule = {
        appointmentDate: dateAide || undefined,
        appointmentTime: assignedSlot,
        dateRequested: dateAide ? `${dateAide} ${assignedSlot}` : assignedSlot,
      };
      nextReservationSlotIndex += 1;

      demandasActuales.push({
        id: siguienteIdDemanda,
        beneficiaire: beneficiaire.nom,
        beneficiaireId: beneficiaire.id,
        type: currentAidType.name,
        quantite: quantity,
        dateRequested: reservationSchedule.dateRequested,
        status: 'pending',
        notes,
        estimatedValue,
        appointmentDate: reservationSchedule.appointmentDate,
        appointmentTime: reservationSchedule.appointmentTime,
      });

      const assignedSlotKey = getRequestReservationSlotKey(reservationSchedule);
      if (assignedSlotKey) {
        occupiedReservationSlots.add(assignedSlotKey);
      }

      siguienteIdDemanda += 1;
      addedCount += 1;
    });

    if (addedCount === 0) {
      toast.error(t('common.error'), {
        description: 'Chaque bénéficiaire sélectionné a déjà une aide en attente.',
      });
      return;
    }

    sauvegarderDemandesAideComptoir(demandasActuales);

    setSelectedBeneficiaires([]);
    setSelectedAidType('');
    setQuantite('1');
    setValeurEstimee('');
    setNotes('');
    setSearchTerm('');
    setShowDropdown(false);

    toast.success(
      <div>
        <div className="font-semibold">Demande enregistrée</div>
        <div className="text-sm text-[#666666] mt-1">
          {addedCount} {addedCount === 1 ? 'bénéficiaire ajouté à la file d\'attente' : 'bénéficiaires ajoutés à la file d\'attente'}
        </div>
      </div>,
      { duration: 5000 }
    );

    if (skippedBeneficiaries.length > 0) {
      toast.info(
        `${skippedBeneficiaries.length} doublon(s) ignoré(s): ${skippedBeneficiaries.join(', ')}`,
        { duration: 6000 }
      );
    }
  };

  return (
    <>
      <BoutonRetourHeader 
        onClick={() => onNavigate('__back__')} 
        titre="Nouvelle demande d'aide"
      />
    <div className="space-y-6">
      {/* Formulaire central */}
      <Card className="border-2 border-[#1E73BE]">
        <CardHeader className="bg-gradient-to-r from-[#1E73BE] to-[#1557A0] text-white">
          <CardTitle className="flex items-center gap-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <Package className="w-6 h-6" />
            Créer une demande d'aide
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Sélection bénéficiaire */}
            <div className="bg-[#E3F2FD] p-4 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-[#1E73BE] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <User className="w-4 h-4 inline mr-2" />
                  {t('comptoir.selectBeneficiary')} *
                </Label>
                {selectedBeneficiaires.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#4CAF50]">
                      {selectedBeneficiaires.length} {selectedBeneficiaires.length === 1 ? t('comptoir.beneficiarySelected') : t('comptoir.beneficiariesSelected')}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-[#DC3545] hover:text-[#DC3545] hover:bg-[#DC354510] h-7 px-2"
                      onClick={handleClearAll}
                    >
                      <X className="w-3 h-3 mr-1" />
                      {t('common.clearAll')}
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Campo de búsqueda siempre visible */}
              <div className="relative mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
                  <Input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder={t('comptoir.searchBeneficiaries')}
                    className="pl-10 pr-10 bg-white"
                  />
                  {searchTerm && (
                    <X 
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666] cursor-pointer hover:text-[#DC3545]" 
                      onClick={() => {
                        setSearchTerm('');
                        setShowDropdown(false);
                      }}
                    />
                  )}
                </div>
                
                {showDropdown && searchTerm && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute z-20 w-full mt-1 bg-white border border-[#DDDDDD] rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
                      {beneficiairesFiltres.length > 0 ? (
                        <>
                          <div className="sticky top-0 bg-[#F4F4F4] px-3 py-2 text-xs text-[#666666] border-b">
                            {beneficiairesFiltres.length} {beneficiairesFiltres.length === 1 ? t('comptoir.resultFound') : t('comptoir.resultsFound')}
                          </div>
                          {beneficiairesFiltres.map((b) => (
                            <div 
                              key={b.id} 
                              className="p-3 hover:bg-[#F4F4F4] transition-colors cursor-pointer border-b last:border-b-0"
                              onClick={() => handleSelectBeneficiaire(b)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium text-[#333333]">{b.nom}</div>
                                  <div className="text-sm text-[#666666] mt-0.5">
                                    <span className="font-mono text-xs bg-[#1E73BE10] text-[#1E73BE] px-1.5 py-0.5 rounded mr-2">
                                      {b.id}
                                    </span>
                                    {b.telephone}
                                  </div>
                                </div>
                                <Badge className={b.statut === 'actif' ? 'bg-[#4CAF50]' : 'bg-[#666666]'}>
                                  {b.statut === 'actif' ? t('common.active') : t('common.inactive')}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <div className="p-4 text-center text-[#666666]">
                          <Search className="w-8 h-8 text-[#CCCCCC] mx-auto mb-2" />
                          <p className="text-sm">{t('comptoir.noResultsFound')}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Lista de beneficiarios seleccionados */}
              {selectedBeneficiaires.length > 0 && (
                <div className="space-y-2">
                  {selectedBeneficiaires.map((beneficiaire) => (
                    <div 
                      key={beneficiaire.id} 
                      className="bg-white p-3 rounded-lg border-2 border-[#4CAF50] hover:border-[#45a049] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Check className="w-4 h-4 text-[#4CAF50] flex-shrink-0" />
                            <span className="font-semibold text-[#333333] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              {beneficiaire.nom}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-sm text-[#666666]">
                            <span className="font-mono text-xs bg-[#1E73BE10] text-[#1E73BE] px-2 py-0.5 rounded">
                              {beneficiaire.id}
                            </span>
                            <Badge className={beneficiaire.statut === 'actif' ? 'bg-[#4CAF50]' : 'bg-[#666666]'}>
                              {beneficiaire.statut === 'actif' ? t('common.active') : t('common.inactive')}
                            </Badge>
                            <span className="hidden sm:inline">{beneficiaire.telephone}</span>
                          </div>
                          <div className="text-xs text-[#999999] mt-1 truncate hidden md:block">
                            {beneficiaire.email}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-[#DC3545] hover:text-[#DC3545] hover:bg-[#DC354510] h-8 w-8 p-0 flex-shrink-0"
                          onClick={() => handleRemoveBeneficiaire(beneficiaire.id)}
                          title={t('common.remove')}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedBeneficiaires.length === 0 && (
                <p className="text-xs text-[#666666] mt-2">
                  {t('comptoir.beneficiaryNotFound')} <Button variant="link" className="text-[#1E73BE] p-0 h-auto" onClick={() => onNavigate('fiche-beneficiaire', 'new')}>{t('comptoir.createNew')}</Button>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Type d'aide */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <Label>{t('comptoir.aidType')} *</Label>
                  <Button 
                    variant="link" 
                    size="sm"
                    className="text-xs text-[#1E73BE] p-0 h-auto"
                    onClick={() => onNavigate('types-aide')}
                  >
                    <Settings className="w-3 h-3 mr-1" />
                    {t('comptoir.manageAidTypes')}
                  </Button>
                </div>
                <Select
                  value={selectedAidType}
                  onValueChange={setSelectedAidType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('comptoir.selectAidType')} />
                  </SelectTrigger>
                  <SelectContent>
                    {aidTypes.filter(type => type.isActive).map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: type.color }}
                          />
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Tarjeta informativa del tipo seleccionado */}
                {currentAidType && (
                  <div 
                    className="mt-3 p-4 rounded-lg border-2 transition-all"
                    style={{ 
                      borderColor: currentAidType.color,
                      backgroundColor: `${currentAidType.color}10`
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-4 h-4 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: currentAidType.color }}
                          />
                          <h3 
                            className="font-bold text-[#333333]" 
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            {currentAidType.name}
                          </h3>
                          <Badge 
                            variant="outline" 
                            className="ml-auto"
                            style={{ borderColor: currentAidType.color, color: currentAidType.color }}
                          >
                            {currentAidType.isSystem ? t('comptoir.systemType') : t('comptoir.customType')}
                          </Badge>
                        </div>
                        {currentAidType.description && (
                          <p className="text-sm text-[#666666] mb-2">
                            {currentAidType.description}
                          </p>
                        )}
                        {currentAidType.defaultValue && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-[#666666]">{t('comptoir.defaultValue')}:</span>
                            <span 
                              className="font-bold px-2 py-0.5 rounded" 
                              style={{ 
                                color: currentAidType.color,
                                backgroundColor: `${currentAidType.color}20`
                              }}
                            >
                              CAD$ {formatMoney(currentAidType.defaultValue)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantité */}
              <div>
                <Label>{t('comptoir.quantity')} *</Label>
                <QuantityInput
                  value={quantite}
                  onChangeText={setQuantite}
                  min={1}
                  step={1}
                />
              </div>

              {/* Date */}
              <div>
                <Label>{t('common.date')} *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
                  <Input 
                    type="date" 
                    value={dateAide}
                    onChange={(event) => setDateAide(event.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Heure */}
              <div>
                <Label>{t('comptoir.time')}</Label>
                <Select value={heureAide} onValueChange={setHeureAide}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une heure" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableReservationTimeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#666666] mt-1">Créneaux libres: {availableReservationTimeSlots.length}/{reservationTimeSlots.length} pour le {dateAide || 'jour sélectionné'}.</p>
              </div>
            </div>

            {/* Valeur estimée */}
            <div>
              <Label>{t('comptoir.estimatedValue')} (CAD$)</Label>
              <Input 
                type="number" 
                value={valeurEstimee}
                onChange={(event) => setValeurEstimee(event.target.value)}
                placeholder="45.00"
                step="0.01"
              />
              <p className="text-xs text-[#666666] mt-1">
                {t('comptoir.optionalField')}
              </p>
            </div>

            {/* Notes */}
            <div>
              <Label>{t('comptoir.notes')}</Label>
              <Textarea 
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder={t('comptoir.additionalNotesPlaceholder')}
                className="min-h-[100px]"
              />
            </div>

            {/* Bouton confirmation */}
            <div className="pt-4 border-t">
              <Button 
                className="w-full bg-[#4CAF50] hover:bg-[#45a049] h-12 text-lg"
                onClick={handleEnregistrer}
              >
                <Save className="w-5 h-5 mr-2" />
                Enregistrer la demande
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}