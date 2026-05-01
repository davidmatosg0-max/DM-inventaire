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

const CUSTOM_AID_TYPES_KEY = 'comptoir_custom_aid_types';
const AID_REQUESTS_KEY = 'comptoir_aid_requests';
const BENEFICIARIES_KEY = 'comptoir_beneficiaries';
const DISTRIBUTIONS_KEY = 'comptoir_distributions';
const APPOINTMENTS_KEY = 'comptoir_appointments';
const COMPTOIR_STORAGE_UPDATED_EVENT = 'comptoir-storage-updated';

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

export const comptoirStorageKeys = {
  customAidTypes: CUSTOM_AID_TYPES_KEY,
  aidRequests: AID_REQUESTS_KEY,
  beneficiaries: BENEFICIARIES_KEY,
  distributions: DISTRIBUTIONS_KEY,
  appointments: APPOINTMENTS_KEY,
};

export const comptoirStorageEvents = {
  updated: COMPTOIR_STORAGE_UPDATED_EVENT,
};