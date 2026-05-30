export interface ComptoirAidType {
  id: string;
  name: string;
  description?: string;
  defaultValue?: number;
  color: string;
  isActive: boolean;
  isSystem: boolean;
  createdAt: string;
  usageCount?: number;
}

export interface ComptoirAidRequest {
  id: number;
  beneficiaire: string;
  beneficiaireId: string;
  type: string;
  quantite: number;
  dateRequested: string;
  status: 'pending' | 'approved' | 'rejected';
  processedDate?: string;
  processedBy?: string;
  notes?: string;
  rejectionReason?: string;
  estimatedValue?: number;
  appointmentDate?: string;
  appointmentTime?: string;
}

export interface ComptoirBeneficiary {
  id: string;
  nom: string;
  telephone: string;
  email: string;
  dateNaissance?: string;
  sexe?: string;
  statut: 'actif' | 'inactif';
  priorite: 'haute' | 'normale' | 'basse';
  derniereAide?: string;
  notes?: string;
  nombrePersonnes: number;
  revenuMensuel?: number;
  revenus?: string;
  hasEnfants: boolean;
  nombreEnfants: number;
  paisOrigen?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  numeroAppartement?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComptoirDistribution {
  id: string;
  beneficiaireId: string;
  beneficiaire: string;
  aidTypeId?: string;
  type: string;
  quantite: number;
  date: string;
  time?: string;
  estimatedValue?: number;
  notes?: string;
  source: 'direct';
  createdAt: string;
}

export interface ComptoirAppointment {
  id: string;
  beneficiaireId: string;
  beneficiaire: string;
  date: string;
  heure: string;
  motif: string;
  statut: 'confirme' | 'attente' | 'annule';
  notes?: string;
  type: 'regular';
  createdAt: string;
  updatedAt: string;
}

export interface ComptoirSpecialEvent {
  id: string;
  nom: string;
  description?: string;
  fechaInicio: string;
  fechaFin: string;
  date?: string;
  heureDebut?: string;
  heureFin?: string;
  reservationIntervalMinutes?: number;
  lieu?: string;
  capaciteMax?: number;
  statut: 'planifie' | 'ouvert' | 'complet' | 'termine' | 'annule';
  createdAt: string;
  updatedAt: string;
}

export interface ComptoirSpecialEventRegistration {
  id: string;
  eventId: string;
  beneficiaireId: string;
  beneficiaireNom: string;
  aidTypeId?: string;
  aidTypeName?: string;
  aidQuantity?: number;
  aidItems?: Array<{
    aidTypeId?: string;
    aidTypeName?: string;
    quantity: number;
  }>;
  appointmentDate?: string;
  appointmentTime?: string;
  statut: 'inscrit' | 'present' | 'absent' | 'annule';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComptoirReservationSettings {
  startTime: string;
  endTime: string;
  intervalMinutes: number;
  updatedAt: string;
}

const CUSTOM_AID_TYPES_KEY = 'comptoir_custom_aid_types';
const AID_REQUESTS_KEY = 'comptoir_aid_requests';
const BENEFICIARIES_KEY = 'comptoir_beneficiaries';
const DISTRIBUTIONS_KEY = 'comptoir_distributions';
const APPOINTMENTS_KEY = 'comptoir_appointments';
const SPECIAL_EVENTS_KEY = 'comptoir_special_events';
const SPECIAL_EVENT_REGISTRATIONS_KEY = 'comptoir_special_event_registrations';
const RESERVATION_SETTINGS_KEY = 'comptoir_reservation_settings';
const COMPTOIR_STORAGE_UPDATED_EVENT = 'comptoir-storage-updated';

const DEFAULT_RESERVATION_SETTINGS: ComptoirReservationSettings = {
  startTime: '08:00',
  endTime: '17:00',
  intervalMinutes: 15,
  updatedAt: new Date().toISOString(),
};

function notifyComptoirStorageUpdated(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(COMPTOIR_STORAGE_UPDATED_EVENT, {
    detail: { key },
  }));
}

function readStorageValue<T>(key: string): T[] {
  try {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) {
      return [];
    }

    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.error(`Erreur lors de la lecture du stockage ${key}:`, error);
    return [];
  }
}

function writeStorageValue<T>(key: string, value: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyComptoirStorageUpdated(key);
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde du stockage ${key}:`, error);
  }
}

export function obtenirTypesAidePersonnalises(): ComptoirAidType[] {
  return readStorageValue<ComptoirAidType>(CUSTOM_AID_TYPES_KEY);
}

export function sauvegarderTypesAidePersonnalises(types: ComptoirAidType[]): void {
  writeStorageValue(CUSTOM_AID_TYPES_KEY, types);
}

export function obtenirDemandesAideComptoir(): ComptoirAidRequest[] {
  return readStorageValue<ComptoirAidRequest>(AID_REQUESTS_KEY);
}

export function sauvegarderDemandesAideComptoir(requests: ComptoirAidRequest[]): void {
  writeStorageValue(AID_REQUESTS_KEY, requests);
}

export function obtenirBeneficiairesComptoir(): ComptoirBeneficiary[] {
  return readStorageValue<ComptoirBeneficiary>(BENEFICIARIES_KEY);
}

export function obtenirBeneficiaireComptoirParId(id: string): ComptoirBeneficiary | null {
  return obtenirBeneficiairesComptoir().find((beneficiary) => beneficiary.id === id) || null;
}

export function sauvegarderBeneficiairesComptoir(beneficiaries: ComptoirBeneficiary[]): void {
  writeStorageValue(BENEFICIARIES_KEY, beneficiaries);
}

export function generarSiguienteIdBeneficiario(): string {
  const beneficiaries = obtenirBeneficiairesComptoir();
  const maxId = beneficiaries.reduce((maxValue, beneficiary) => {
    const match = beneficiary.id.match(/BEN-(\d+)/);
    if (!match) {
      return maxValue;
    }

    return Math.max(maxValue, Number.parseInt(match[1], 10));
  }, 0);

  return `BEN-${String(maxId + 1).padStart(3, '0')}`;
}

export function upsertBeneficiaireComptoir(
  beneficiary: Omit<ComptoirBeneficiary, 'updatedAt' | 'createdAt'> & Partial<Pick<ComptoirBeneficiary, 'updatedAt' | 'createdAt'>>
): ComptoirBeneficiary {
  const beneficiaries = obtenirBeneficiairesComptoir();
  const existingIndex = beneficiaries.findIndex((currentBeneficiary) => currentBeneficiary.id === beneficiary.id);
  const timestamp = new Date().toISOString();
  const normalizedBeneficiary: ComptoirBeneficiary = {
    ...beneficiary,
    createdAt: existingIndex >= 0 ? beneficiaries[existingIndex].createdAt : beneficiary.createdAt || timestamp,
    updatedAt: timestamp,
  };

  if (existingIndex >= 0) {
    beneficiaries[existingIndex] = normalizedBeneficiary;
  } else {
    beneficiaries.push(normalizedBeneficiary);
  }

  sauvegarderBeneficiairesComptoir(beneficiaries);
  return normalizedBeneficiary;
}

export function obtenirDistributionsComptoir(): ComptoirDistribution[] {
  return readStorageValue<ComptoirDistribution>(DISTRIBUTIONS_KEY);
}

export function sauvegarderDistributionsComptoir(distributions: ComptoirDistribution[]): void {
  writeStorageValue(DISTRIBUTIONS_KEY, distributions);
}

export function generarSiguienteIdDistribution(): string {
  const distributions = obtenirDistributionsComptoir();
  const maxId = distributions.reduce((maxValue, distribution) => {
    const match = distribution.id.match(/DIST-(\d+)/);
    if (!match) {
      return maxValue;
    }

    return Math.max(maxValue, Number.parseInt(match[1], 10));
  }, 0);

  return `DIST-${String(maxId + 1).padStart(4, '0')}`;
}

export function ajouterDistributionComptoir(
  distribution: Omit<ComptoirDistribution, 'id' | 'createdAt'>
): ComptoirDistribution {
  const distributions = obtenirDistributionsComptoir();
  const nouvelleDistribution: ComptoirDistribution = {
    ...distribution,
    id: generarSiguienteIdDistribution(),
    createdAt: new Date().toISOString(),
  };

  distributions.push(nouvelleDistribution);
  sauvegarderDistributionsComptoir(distributions);
  return nouvelleDistribution;
}

export function obtenirRendezVousComptoir(): ComptoirAppointment[] {
  return readStorageValue<ComptoirAppointment>(APPOINTMENTS_KEY);
}

export function sauvegarderRendezVousComptoir(appointments: ComptoirAppointment[]): void {
  writeStorageValue(APPOINTMENTS_KEY, appointments);
}

export function genererSiguienteIdRendezVous(): string {
  const appointments = obtenirRendezVousComptoir();
  const maxId = appointments.reduce((maxValue, appointment) => {
    const match = appointment.id.match(/RDV-(\d+)/);
    if (!match) {
      return maxValue;
    }

    return Math.max(maxValue, Number.parseInt(match[1], 10));
  }, 0);

  return `RDV-${String(maxId + 1).padStart(4, '0')}`;
}

export function ajouterRendezVousComptoir(
  appointment: Omit<ComptoirAppointment, 'id' | 'createdAt' | 'updatedAt'>
): ComptoirAppointment {
  const appointments = obtenirRendezVousComptoir();
  const timestamp = new Date().toISOString();
  const nouveauRendezVous: ComptoirAppointment = {
    ...appointment,
    id: genererSiguienteIdRendezVous(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  appointments.push(nouveauRendezVous);
  sauvegarderRendezVousComptoir(appointments);
  return nouveauRendezVous;
}

export function upsertRendezVousComptoir(
  appointment: Omit<ComptoirAppointment, 'updatedAt' | 'createdAt'> & Partial<Pick<ComptoirAppointment, 'updatedAt' | 'createdAt'>>
): ComptoirAppointment {
  const appointments = obtenirRendezVousComptoir();
  const existingIndex = appointments.findIndex((currentAppointment) => currentAppointment.id === appointment.id);
  const timestamp = new Date().toISOString();
  const normalizedAppointment: ComptoirAppointment = {
    ...appointment,
    createdAt: existingIndex >= 0 ? appointments[existingIndex].createdAt : appointment.createdAt || timestamp,
    updatedAt: timestamp,
  };

  if (existingIndex >= 0) {
    appointments[existingIndex] = normalizedAppointment;
  } else {
    appointments.push(normalizedAppointment);
  }

  sauvegarderRendezVousComptoir(appointments);
  return normalizedAppointment;
}

export function obtenirEvenementsSpeciauxComptoir(): ComptoirSpecialEvent[] {
  return readStorageValue<(ComptoirSpecialEvent & { date?: string })>(SPECIAL_EVENTS_KEY)
    .map((event) => {
      const fechaInicio = event.fechaInicio || event.date || '';
      const fechaFin = event.fechaFin || event.date || fechaInicio;
      const parsedInterval = Number(event.reservationIntervalMinutes);
      const reservationIntervalMinutes = Number.isFinite(parsedInterval) && parsedInterval > 0
        ? Math.trunc(parsedInterval)
        : undefined;

      return {
        ...event,
        fechaInicio,
        fechaFin,
        reservationIntervalMinutes,
      };
    })
    .filter((event) => Boolean(event.fechaInicio));
}

export function sauvegarderEvenementsSpeciauxComptoir(events: ComptoirSpecialEvent[]): void {
  writeStorageValue(SPECIAL_EVENTS_KEY, events);
}

export function genererSiguienteIdEvenementSpecial(): string {
  const events = obtenirEvenementsSpeciauxComptoir();
  const maxId = events.reduce((maxValue, event) => {
    const match = event.id.match(/EVT-(\d+)/);
    if (!match) {
      return maxValue;
    }

    return Math.max(maxValue, Number.parseInt(match[1], 10));
  }, 0);

  return `EVT-${String(maxId + 1).padStart(4, '0')}`;
}

export function upsertEvenementSpecialComptoir(
  event: Omit<ComptoirSpecialEvent, 'updatedAt' | 'createdAt'> & Partial<Pick<ComptoirSpecialEvent, 'updatedAt' | 'createdAt'>>
): ComptoirSpecialEvent {
  const events = obtenirEvenementsSpeciauxComptoir();
  const existingIndex = events.findIndex((currentEvent) => currentEvent.id === event.id);
  const timestamp = new Date().toISOString();
  const normalizedEvent: ComptoirSpecialEvent = {
    ...event,
    createdAt: existingIndex >= 0 ? events[existingIndex].createdAt : event.createdAt || timestamp,
    updatedAt: timestamp,
  };

  if (existingIndex >= 0) {
    events[existingIndex] = normalizedEvent;
  } else {
    events.push(normalizedEvent);
  }

  sauvegarderEvenementsSpeciauxComptoir(events);
  return normalizedEvent;
}

export function supprimerEvenementSpecialComptoir(eventId: string): void {
  const events = obtenirEvenementsSpeciauxComptoir().filter((event) => event.id !== eventId);
  const registrations = obtenirInscriptionsEvenementsSpeciauxComptoir().filter((registration) => registration.eventId !== eventId);

  sauvegarderEvenementsSpeciauxComptoir(events);
  sauvegarderInscriptionsEvenementsSpeciauxComptoir(registrations);
}

export function obtenirInscriptionsEvenementsSpeciauxComptoir(): ComptoirSpecialEventRegistration[] {
  return readStorageValue<ComptoirSpecialEventRegistration>(SPECIAL_EVENT_REGISTRATIONS_KEY);
}

export function sauvegarderInscriptionsEvenementsSpeciauxComptoir(registrations: ComptoirSpecialEventRegistration[]): void {
  writeStorageValue(SPECIAL_EVENT_REGISTRATIONS_KEY, registrations);
}

export function genererSiguienteIdInscriptionEvenementSpecial(): string {
  const registrations = obtenirInscriptionsEvenementsSpeciauxComptoir();
  const maxId = registrations.reduce((maxValue, registration) => {
    const match = registration.id.match(/EVREG-(\d+)/);
    if (!match) {
      return maxValue;
    }

    return Math.max(maxValue, Number.parseInt(match[1], 10));
  }, 0);

  return `EVREG-${String(maxId + 1).padStart(4, '0')}`;
}

export function upsertInscriptionEvenementSpecialComptoir(
  registration: Omit<ComptoirSpecialEventRegistration, 'updatedAt' | 'createdAt'> & Partial<Pick<ComptoirSpecialEventRegistration, 'updatedAt' | 'createdAt'>>
): ComptoirSpecialEventRegistration {
  const registrations = obtenirInscriptionsEvenementsSpeciauxComptoir();
  const existingIndex = registrations.findIndex((currentRegistration) => currentRegistration.id === registration.id);
  const timestamp = new Date().toISOString();
  const normalizedRegistration: ComptoirSpecialEventRegistration = {
    ...registration,
    createdAt: existingIndex >= 0 ? registrations[existingIndex].createdAt : registration.createdAt || timestamp,
    updatedAt: timestamp,
  };

  if (existingIndex >= 0) {
    registrations[existingIndex] = normalizedRegistration;
  } else {
    registrations.push(normalizedRegistration);
  }

  sauvegarderInscriptionsEvenementsSpeciauxComptoir(registrations);
  return normalizedRegistration;
}

export function supprimerInscriptionEvenementSpecialComptoir(registrationId: string): void {
  const registrations = obtenirInscriptionsEvenementsSpeciauxComptoir().filter((registration) => registration.id !== registrationId);
  sauvegarderInscriptionsEvenementsSpeciauxComptoir(registrations);
}

export function obtenirReservationSettingsComptoir(): ComptoirReservationSettings {
  try {
    const rawValue = localStorage.getItem(RESERVATION_SETTINGS_KEY);
    if (!rawValue) {
      return DEFAULT_RESERVATION_SETTINGS;
    }

    const parsedValue = JSON.parse(rawValue) as Partial<ComptoirReservationSettings>;
    const intervalMinutes = Number(parsedValue.intervalMinutes);

    return {
      startTime: parsedValue.startTime || DEFAULT_RESERVATION_SETTINGS.startTime,
      endTime: parsedValue.endTime || DEFAULT_RESERVATION_SETTINGS.endTime,
      intervalMinutes: Number.isFinite(intervalMinutes) && intervalMinutes > 0
        ? Math.trunc(intervalMinutes)
        : DEFAULT_RESERVATION_SETTINGS.intervalMinutes,
      updatedAt: parsedValue.updatedAt || DEFAULT_RESERVATION_SETTINGS.updatedAt,
    };
  } catch (error) {
    console.error('Erreur lors de la lecture de la configuration des réservations:', error);
    return DEFAULT_RESERVATION_SETTINGS;
  }
}

export function sauvegarderReservationSettingsComptoir(
  settings: Omit<ComptoirReservationSettings, 'updatedAt'>
): ComptoirReservationSettings {
  const normalizedSettings: ComptoirReservationSettings = {
    startTime: settings.startTime,
    endTime: settings.endTime,
    intervalMinutes: Math.trunc(settings.intervalMinutes),
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(RESERVATION_SETTINGS_KEY, JSON.stringify(normalizedSettings));
  notifyComptoirStorageUpdated(RESERVATION_SETTINGS_KEY);
  return normalizedSettings;
}

export const comptoirStorageKeys = {
  customAidTypes: CUSTOM_AID_TYPES_KEY,
  aidRequests: AID_REQUESTS_KEY,
  beneficiaries: BENEFICIARIES_KEY,
  distributions: DISTRIBUTIONS_KEY,
  appointments: APPOINTMENTS_KEY,
  specialEvents: SPECIAL_EVENTS_KEY,
  specialEventRegistrations: SPECIAL_EVENT_REGISTRATIONS_KEY,
  reservationSettings: RESERVATION_SETTINGS_KEY,
};

export const comptoirStorageEvents = {
  updated: COMPTOIR_STORAGE_UPDATED_EVENT,
};