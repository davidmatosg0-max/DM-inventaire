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
import { toast } from 'sonner';
import { AddressAutocomplete } from '../ui/address-autocomplete';
import { CountrySelect } from '../ui/country-select';
import { FileUpload, UploadedFile } from '../ui/file-upload';
import {
  generarSiguienteIdBeneficiario,
  obtenirDemandesAideComptoir,
  obtenirDistributionsComptoir,
  obtenirRendezVousComptoir,
  obtenirBeneficiaireComptoirParId,
  upsertBeneficiaireComptoir,
  type ComptoirBeneficiary,
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

function getTimelineSortValue(dateValue?: string, timeValue?: string): string {
  return `${dateValue || ''}T${timeValue || '00:00'}:00`;
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
      const revenu = parseFloat(revenuMensuel);
      if (!isNaN(revenu)) {
        const resultat = calculerNiveauRevenu(revenu, nombrePersonnes);
        setNiveauRevenu(resultat.niveau);
      }
    }
  }, [revenuMensuel, nombrePersonnes]);

  const distributions = beneficiaire ? obtenirDistributionsComptoir() : [];
  const appointments = beneficiaire ? obtenirRendezVousComptoir() : [];
  const aidRequests = beneficiaire ? obtenirDemandesAideComptoir() : [];

  const historiqueAides = beneficiaire
    ? distributions
        .filter((distribution) => distribution.beneficiaireId === beneficiaire.id)
        .slice()
        .sort((left, right) => getTimelineSortValue(right.date, right.time).localeCompare(getTimelineSortValue(left.date, left.time)))
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
          action: `Rendez-vous confirmé • ${appointment.motif}`,
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

  const timeline = beneficiaire
    ? [
        {
          id: `beneficiary-created-${beneficiaire.id}`,
          action: 'Dossier créé',
          date: formatDateLabel(beneficiaire.createdAt),
          user: 'Comptoir',
          sortValue: beneficiaire.createdAt,
        },
        ...(beneficiaire.updatedAt !== beneficiaire.createdAt
          ? [
              {
                id: `beneficiary-updated-${beneficiaire.id}`,
                action: 'Dossier mis à jour',
                date: formatDateLabel(beneficiaire.updatedAt),
                user: 'Comptoir',
                sortValue: beneficiaire.updatedAt,
              },
            ]
          : []),
        ...appointmentTimeline,
        ...aidRequestTimeline,
        ...distributionTimeline,
      ]
        .slice()
        .sort((left, right) => right.sortValue.localeCompare(left.sortValue))
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
      revenuMensuel: revenuMensuel ? Number.parseFloat(revenuMensuel) : undefined,
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
                  <Button 
                    className="bg-[#4CAF50] hover:bg-[#45a049]"
                    onClick={() => onNavigate('rendez-vous')}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {t('comptoir.newAppointment')}
                  </Button>
                  <Button 
                    className="bg-[#FFC107] hover:bg-[#FFB300] text-[#333333]"
                    onClick={() => onNavigate('aide-alimentaire')}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    {t('comptoir.recordAid')}
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
                      step="0.01"
                      placeholder="0.00"
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
                          <span className="font-semibold">{parseFloat(revenuMensuel).toFixed(2)} CAD$ / {t('comptoir.month').toLowerCase()}</span>
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
                                backgroundColor: calculerNiveauRevenu(parseFloat(revenuMensuel), nombrePersonnes).couleur,
                                color: 'white'
                              }}
                            >
                              {calculerNiveauRevenu(parseFloat(revenuMensuel), nombrePersonnes).niveau}
                            </Badge>
                          </div>
                        </div>
                        <div className="bg-white/60 rounded p-2 mt-2 text-xs text-[#666666]">
                          <p className="font-medium mb-1">💡 {t('comptoir.mpcFormula')}:</p>
                          <p>{t('comptoir.mpcExplanation', {
                            threshold: calculerNiveauRevenu(parseFloat(revenuMensuel), nombrePersonnes).seuil.toFixed(0)
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
                  <Button size="sm" className="bg-[#4CAF50] hover:bg-[#45a049]">
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