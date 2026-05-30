import React, { useEffect, useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Clock,
  Download,
  FileText,
  Filter,
  MapPin,
  Pencil,
  Plus,
  Printer,
  Search,
  Ticket,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  comptoirStorageEvents,
  comptoirStorageKeys,
  type ComptoirAidType,
  genererSiguienteIdInscriptionEvenementSpecial,
  genererSiguienteIdEvenementSpecial,
  obtenirBeneficiairesComptoir,
  obtenirEvenementsSpeciauxComptoir,
  obtenirInscriptionsEvenementsSpeciauxComptoir,
  sauvegarderInscriptionsEvenementsSpeciauxComptoir,
  supprimerEvenementSpecialComptoir,
  type ComptoirBeneficiary,
  type ComptoirSpecialEvent,
  type ComptoirSpecialEventRegistration,
  upsertEvenementSpecialComptoir,
} from '../../utils/comptoirStorage';
import { exportarReportePersonalizado } from '../../utils/exportarPDF';
import { exportarDatosPersonalizados } from '../../utils/exportarExcel';

interface EvenementsSpeciauxProps {
  onNavigate: (view: string, id?: string) => void;
  aidTypes?: Array<Pick<ComptoirAidType, 'id' | 'name' | 'color' | 'isActive'>>;
}

interface EventFormState {
  nom: string;
  description: string;
  fechaInicio: string;
  fechaFin: string;
  heureDebut: string;
  heureFin: string;
  reservationIntervalMinutes: string;
  lieu: string;
  capaciteMax: string;
  statut: ComptoirSpecialEvent['statut'];
}

interface RegistrationAidItemInput {
  aidTypeId: string;
  quantity: number;
}

const EMPTY_EVENT_FORM: EventFormState = {
  nom: '',
  description: '',
  fechaInicio: '',
  fechaFin: '',
  heureDebut: '',
  heureFin: '',
  reservationIntervalMinutes: '',
  lieu: '',
  capaciteMax: '',
  statut: 'planifie',
};

function formatDateLabel(value?: string): string {
  if (!value) return 'Date non définie';
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;
  return parsedDate.toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatEventDateRange(event: Pick<ComptoirSpecialEvent, 'fechaInicio' | 'fechaFin'>): string {
  if (!event.fechaInicio && !event.fechaFin) {
    return 'Date non définie';
  }

  if (!event.fechaFin || event.fechaFin === event.fechaInicio) {
    return formatDateLabel(event.fechaInicio);
  }

  return `${formatDateLabel(event.fechaInicio)} au ${formatDateLabel(event.fechaFin)}`;
}

function getEventAvailableDates(event: Pick<ComptoirSpecialEvent, 'fechaInicio' | 'fechaFin'>): string[] {
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

function parseTimeToMinutes(value?: string): number | null {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) {
    return null;
  }

  const [hours, minutes] = value.split(':').map((part) => Number.parseInt(part, 10));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return (hours * 60) + minutes;
}

function formatMinutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function generateReservationTimeSlots(
  startTime?: string,
  endTime?: string,
  intervalMinutes?: number,
): string[] {
  if (!startTime || !endTime || !intervalMinutes || intervalMinutes <= 0) {
    return [];
  }

  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start === null || end === null || end <= start) {
    return [];
  }

  const slots: string[] = [];
  for (let current = start; current <= end; current += intervalMinutes) {
    slots.push(formatMinutesToTime(current));
  }

  return slots;
}

function getStatusBadgeClass(status: ComptoirSpecialEvent['statut'] | ComptoirSpecialEventRegistration['statut']): string {
  switch (status) {
    case 'ouvert':
    case 'present':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'planifie':
    case 'inscrit':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'complet':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'termine':
      return 'bg-slate-100 text-slate-800 border-slate-200';
    case 'annule':
    case 'absent':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getStatusLabel(status: ComptoirSpecialEvent['statut'] | ComptoirSpecialEventRegistration['statut']): string {
  switch (status) {
    case 'planifie':
      return 'Planifié';
    case 'ouvert':
      return 'Ouvert';
    case 'complet':
      return 'Complet';
    case 'termine':
      return 'Terminé';
    case 'annule':
      return 'Annulé';
    case 'inscrit':
      return 'Inscrit';
    case 'present':
      return 'Présent';
    case 'absent':
      return 'Absent';
    default:
      return status;
  }
}

function getRegistrationQueueOrder(status: ComptoirSpecialEventRegistration['statut']): number {
  if (status === 'inscrit') {
    return 0;
  }

  if (status === 'absent') {
    return 1;
  }

  if (status === 'annule') {
    return 2;
  }

  if (status === 'present') {
    return 3;
  }

  return 4;
}

function getRegistrationGroupQueueOrder(registrations: ComptoirSpecialEventRegistration[]): number {
  const hasInscrit = registrations.some((registration) => registration.statut === 'inscrit');
  if (hasInscrit) {
    return 0;
  }

  const hasAbsent = registrations.some((registration) => registration.statut === 'absent');
  if (hasAbsent) {
    return 1;
  }

  const hasAnnule = registrations.some((registration) => registration.statut === 'annule');
  if (hasAnnule) {
    return 2;
  }

  const hasPresent = registrations.some((registration) => registration.statut === 'present');
  if (hasPresent) {
    return 3;
  }

  return 4;
}

function getRegistrationRowClass(status: ComptoirSpecialEventRegistration['statut']): string {
  switch (status) {
    case 'inscrit':
      return 'bg-blue-50 hover:bg-blue-100/70';
    case 'present':
      return 'bg-green-50 hover:bg-green-100/70';
    case 'absent':
      return 'bg-amber-50 hover:bg-amber-100/70';
    case 'annule':
      return 'bg-red-50 hover:bg-red-100/70';
    default:
      return 'hover:bg-[#FAFAFA]';
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

export function EvenementsSpeciaux({ onNavigate, aidTypes = [] }: EvenementsSpeciauxProps) {
  const [events, setEvents] = useState<ComptoirSpecialEvent[]>(() => obtenirEvenementsSpeciauxComptoir());
  const [registrations, setRegistrations] = useState<ComptoirSpecialEventRegistration[]>(() => obtenirInscriptionsEvenementsSpeciauxComptoir());
  const [beneficiaries, setBeneficiaries] = useState<ComptoirBeneficiary[]>(() => obtenirBeneficiairesComptoir());
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [registrationStatusFilter, setRegistrationStatusFilter] = useState<'all' | ComptoirSpecialEventRegistration['statut']>('all');
  const [registrationAidTypeFilter, setRegistrationAidTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [quickRegistrationSearch, setQuickRegistrationSearch] = useState('');
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [registrationDialogOpen, setRegistrationDialogOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<EventFormState>(EMPTY_EVENT_FORM);
  const [registrationSearch, setRegistrationSearch] = useState('');
  const [selectedBeneficiaryIds, setSelectedBeneficiaryIds] = useState<string[]>([]);
  const [initialSelectedBeneficiaryIds, setInitialSelectedBeneficiaryIds] = useState<string[]>([]);
  const [registrationStatuses, setRegistrationStatuses] = useState<Record<string, ComptoirSpecialEventRegistration['statut']>>({});
  const [registrationAidItems, setRegistrationAidItems] = useState<Record<string, RegistrationAidItemInput[]>>({});
  const [registrationAppointmentDates, setRegistrationAppointmentDates] = useState<Record<string, string>>({});
  const [registrationAppointmentTimes, setRegistrationAppointmentTimes] = useState<Record<string, string>>({});
  const [registrationEditDialogOpen, setRegistrationEditDialogOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<ComptoirSpecialEventRegistration | null>(null);
  const [registrationEditStatus, setRegistrationEditStatus] = useState<ComptoirSpecialEventRegistration['statut']>('inscrit');
  const [registrationEditAidItems, setRegistrationEditAidItems] = useState<RegistrationAidItemInput[]>([]);
  const [registrationEditAppointmentDate, setRegistrationEditAppointmentDate] = useState('');
  const [registrationEditAppointmentTime, setRegistrationEditAppointmentTime] = useState('');

  useEffect(() => {
    const refreshAll = () => {
      setEvents(obtenirEvenementsSpeciauxComptoir());
      setRegistrations(obtenirInscriptionsEvenementsSpeciauxComptoir());
      setBeneficiaries(obtenirBeneficiairesComptoir());
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === comptoirStorageKeys.specialEvents ||
        event.key === comptoirStorageKeys.specialEventRegistrations ||
        event.key === comptoirStorageKeys.beneficiaries
      ) {
        refreshAll();
      }
    };

    const handleComptoirStorageUpdated = (event: Event) => {
      const { detail } = event as CustomEvent<{ key?: string }>;
      if (
        detail?.key === comptoirStorageKeys.specialEvents ||
        detail?.key === comptoirStorageKeys.specialEventRegistrations ||
        detail?.key === comptoirStorageKeys.beneficiaries
      ) {
        refreshAll();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(comptoirStorageEvents.updated, handleComptoirStorageUpdated);
    window.addEventListener('focus', refreshAll);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(comptoirStorageEvents.updated, handleComptoirStorageUpdated);
      window.removeEventListener('focus', refreshAll);
    };
  }, []);

  useEffect(() => {
    if (selectedEventId === 'all') {
      return;
    }

    const eventExists = events.some((event) => event.id === selectedEventId);
    if (!eventExists) {
      setSelectedEventId('all');
    }
  }, [events, selectedEventId]);

  const sortedEvents = [...events].sort((left, right) => left.fechaInicio.localeCompare(right.fechaInicio));
  const selectedEvent = sortedEvents.find((event) => event.id === selectedEventId) || null;
  const registrationsForSelectedEvent = selectedEvent
    ? registrations.filter((registration) => registration.eventId === selectedEvent.id)
    : [];
  const registrationsForSelectedEventMap = new Map(
    registrationsForSelectedEvent.map((registration) => [registration.beneficiaireId, registration])
  );
  const occupiedRegistrationsForSelectedEvent = registrationsForSelectedEvent.filter((registration) => registration.statut !== 'annule');
  const selectedEventCapacityReached = selectedEvent
    ? typeof selectedEvent.capaciteMax === 'number' && occupiedRegistrationsForSelectedEvent.length >= selectedEvent.capaciteMax
    : false;
  const selectedEventRemainingSlots = selectedEvent && typeof selectedEvent.capaciteMax === 'number'
    ? Math.max(selectedEvent.capaciteMax - occupiedRegistrationsForSelectedEvent.length, 0)
    : null;
  const selectedEventAvailableDates = selectedEvent ? getEventAvailableDates(selectedEvent) : [];
  const selectedEventTimeSlots = selectedEvent
    ? generateReservationTimeSlots(selectedEvent.heureDebut, selectedEvent.heureFin, selectedEvent.reservationIntervalMinutes)
    : [];
  const availableAidTypes = aidTypes.filter((aidType) => aidType.isActive !== false);

  const normalizeAidQuantity = (value?: number) => {
    if (!Number.isFinite(value)) {
      return 1;
    }

    return Math.max(1, Math.trunc(value as number));
  };

  const normalizeRegistrationAidItems = (
    items: Array<Partial<{ aidTypeId: string; aidTypeName: string; quantity: number }>>,
  ): RegistrationAidItemInput[] => {
    const normalizedItems = items
      .map((item) => {
        const rawAidTypeId = (item.aidTypeId || '').trim();
        const aidTypeId = rawAidTypeId || availableAidTypes.find((aidType) => aidType.name === item.aidTypeName)?.id || '';
        if (!aidTypeId) {
          return null;
        }

        return {
          aidTypeId,
          quantity: normalizeAidQuantity(item.quantity),
        } satisfies RegistrationAidItemInput;
      })
      .filter((item): item is RegistrationAidItemInput => item !== null);

    const mergedByType = new Map<string, number>();
    normalizedItems.forEach((item) => {
      mergedByType.set(item.aidTypeId, (mergedByType.get(item.aidTypeId) || 0) + item.quantity);
    });

    return Array.from(mergedByType.entries()).map(([aidTypeId, quantity]) => ({ aidTypeId, quantity }));
  };

  const countIncompleteAidItems = (items: RegistrationAidItemInput[]) => {
    return items.filter((item) => !item.aidTypeId).length;
  };

  const getAidItemsFromRegistration = (registration?: ComptoirSpecialEventRegistration | null): RegistrationAidItemInput[] => {
    if (!registration) {
      return [];
    }

    if (registration.aidItems && registration.aidItems.length > 0) {
      return normalizeRegistrationAidItems(registration.aidItems);
    }

    if (registration.aidTypeId || registration.aidTypeName) {
      return normalizeRegistrationAidItems([
        {
          aidTypeId: registration.aidTypeId,
          aidTypeName: registration.aidTypeName,
          quantity: registration.aidQuantity,
        },
      ]);
    }

    return [];
  };

  const getAidTypeNameById = (aidTypeId: string) => {
    return availableAidTypes.find((aidType) => aidType.id === aidTypeId)?.name || aidTypeId;
  };

  const getRegistrationAidSummary = (registration?: ComptoirSpecialEventRegistration | null): string => {
    const items = getAidItemsFromRegistration(registration);
    if (items.length === 0) {
      return 'Non défini';
    }

    return items
      .map((item) => `${getAidTypeNameById(item.aidTypeId)} x${item.quantity}`)
      .join(' | ');
  };

  const getRegistrationAidTypeIds = (registration?: ComptoirSpecialEventRegistration | null): string[] => {
    return getAidItemsFromRegistration(registration).map((item) => item.aidTypeId);
  };

  const getAidTypeNameFromId = (aidTypeId?: string, fallbackName?: string) => {
    if (!aidTypeId) {
      return fallbackName || '';
    }

    return availableAidTypes.find((aidType) => aidType.id === aidTypeId)?.name || fallbackName || '';
  };

  const getAidTypeFilterLabel = () => {
    if (registrationAidTypeFilter === 'all') {
      return 'Tous';
    }

    if (registrationAidTypeFilter === '__none__') {
      return 'Sans type défini';
    }

    return getAidTypeNameFromId(registrationAidTypeFilter, 'Non défini') || 'Non défini';
  };

  const filteredRegistrations = registrations
    .filter((registration) => selectedEventId === 'all' || registration.eventId === selectedEventId)
    .filter((registration) => registrationStatusFilter === 'all' || registration.statut === registrationStatusFilter)
    .filter((registration) => {
      if (registrationAidTypeFilter === 'all') {
        return true;
      }

      const resolvedAidTypeIds = getRegistrationAidTypeIds(registration);
      if (registrationAidTypeFilter === '__none__') {
        return resolvedAidTypeIds.length === 0;
      }

      return resolvedAidTypeIds.includes(registrationAidTypeFilter);
    })
    .filter((registration) => {
      const searchValue = searchTerm.trim().toLowerCase();
      if (!searchValue) {
        return true;
      }

      const event = events.find((currentEvent) => currentEvent.id === registration.eventId);
      return [
        registration.beneficiaireNom,
        registration.beneficiaireId,
        event?.nom || '',
        getRegistrationAidSummary(registration),
      ].some((value) => value.toLowerCase().includes(searchValue));
    })
    .filter((registration) => {
      const quickSearchValue = quickRegistrationSearch.trim().toLowerCase();
      if (!quickSearchValue) {
        return true;
      }

      const beneficiary = beneficiaries.find((item) => item.id === registration.beneficiaireId);
      return [
        registration.beneficiaireNom,
        registration.beneficiaireId,
        beneficiary?.telephone || '',
        beneficiary?.email || '',
      ].some((value) => value.toLowerCase().includes(quickSearchValue));
    })
    .sort((left, right) => {
      const leftEvent = events.find((event) => event.id === left.eventId);
      const rightEvent = events.find((event) => event.id === right.eventId);
      if (leftEvent?.fechaInicio && rightEvent?.fechaInicio && leftEvent.fechaInicio !== rightEvent.fechaInicio) {
        return leftEvent.fechaInicio.localeCompare(rightEvent.fechaInicio);
      }
      return left.beneficiaireNom.localeCompare(right.beneficiaireNom);
    });
  const registrationCountsByAidType = filteredRegistrations.reduce<Array<{ label: string; total: number }>>((acc, registration) => {
    const aidItems = getAidItemsFromRegistration(registration);
    if (aidItems.length === 0) {
      const noneEntry = acc.find((item) => item.label === 'Sans type défini');
      if (noneEntry) {
        noneEntry.total += 1;
      } else {
        acc.push({ label: 'Sans type défini', total: 1 });
      }

      return acc;
    }

    aidItems.forEach((item) => {
      const label = getAidTypeNameById(item.aidTypeId);
      const existingEntry = acc.find((currentItem) => currentItem.label === label);
      if (existingEntry) {
        existingEntry.total += item.quantity;
        return;
      }

      acc.push({ label, total: item.quantity });
    });

    return acc;
  }, []);
  const groupedRegistrations = Array.from(
    filteredRegistrations.reduce<Map<string, {
      appointmentDate?: string;
      appointmentTime?: string;
      registrations: ComptoirSpecialEventRegistration[];
    }>>((acc, registration) => {
      const appointmentDate = registration.appointmentDate || '';
      const appointmentTime = registration.appointmentTime || '';
      const groupKey = `${appointmentDate}__${appointmentTime}`;

      const currentGroup = acc.get(groupKey);
      if (currentGroup) {
        currentGroup.registrations.push(registration);
        return acc;
      }

      acc.set(groupKey, {
        appointmentDate: registration.appointmentDate,
        appointmentTime: registration.appointmentTime,
        registrations: [registration],
      });

      return acc;
    }, new Map())
      .values()
  ).sort((left, right) => {
    const leftGroupOrder = getRegistrationGroupQueueOrder(left.registrations);
    const rightGroupOrder = getRegistrationGroupQueueOrder(right.registrations);

    if (leftGroupOrder !== rightGroupOrder) {
      return leftGroupOrder - rightGroupOrder;
    }

    const leftDate = left.appointmentDate || '9999-12-31';
    const rightDate = right.appointmentDate || '9999-12-31';
    if (leftDate !== rightDate) {
      return leftDate.localeCompare(rightDate);
    }

    const leftTime = left.appointmentTime || '99:99';
    const rightTime = right.appointmentTime || '99:99';
    return leftTime.localeCompare(rightTime);
  });
  const editingRegistrationEvent = editingRegistration
    ? events.find((event) => event.id === editingRegistration.eventId) || null
    : null;
  const editingRegistrationAvailableDates = editingRegistrationEvent ? getEventAvailableDates(editingRegistrationEvent) : [];
  const editingRegistrationTimeSlots = editingRegistrationEvent
    ? generateReservationTimeSlots(
      editingRegistrationEvent.heureDebut,
      editingRegistrationEvent.heureFin,
      editingRegistrationEvent.reservationIntervalMinutes,
    )
    : [];

  const availableBeneficiaries = [...beneficiaries]
    .filter((beneficiary) => {
      const searchValue = registrationSearch.trim().toLowerCase();
      if (!searchValue) {
        return true;
      }

      return [beneficiary.nom, beneficiary.id, beneficiary.telephone, beneficiary.email]
        .join(' ')
        .toLowerCase()
        .includes(searchValue);
    })
    .sort((left, right) => left.nom.localeCompare(right.nom));

  const buildAppointmentSlotKey = (appointmentDate?: string, appointmentTime?: string) => {
    if (!appointmentDate || !appointmentTime) {
      return null;
    }

    return `${appointmentDate}__${appointmentTime}`;
  };

  const getOccupiedSlotKeysForBeneficiary = (beneficiaryId: string) => {
    const occupiedSlotKeys = new Set<string>();

    registrationsForSelectedEvent.forEach((registration) => {
      if (registration.beneficiaireId === beneficiaryId || registration.statut === 'annule') {
        return;
      }

      const slotKey = buildAppointmentSlotKey(registration.appointmentDate, registration.appointmentTime);
      if (slotKey) {
        occupiedSlotKeys.add(slotKey);
      }
    });

    selectedBeneficiaryIds.forEach((selectedBeneficiaryId) => {
      if (selectedBeneficiaryId === beneficiaryId) {
        return;
      }

      const existingRegistration = registrationsForSelectedEventMap.get(selectedBeneficiaryId);
      const selectedStatus = registrationStatuses[selectedBeneficiaryId] || existingRegistration?.statut || 'inscrit';
      if (selectedStatus === 'annule') {
        return;
      }

      const selectedDate = registrationAppointmentDates[selectedBeneficiaryId] || existingRegistration?.appointmentDate;
      const selectedTime = registrationAppointmentTimes[selectedBeneficiaryId] || existingRegistration?.appointmentTime;
      const slotKey = buildAppointmentSlotKey(selectedDate, selectedTime);
      if (slotKey) {
        occupiedSlotKeys.add(slotKey);
      }
    });

    return occupiedSlotKeys;
  };

  const getAvailableDatesForBeneficiary = (beneficiaryId: string) => {
    if (selectedEventTimeSlots.length === 0) {
      return selectedEventAvailableDates;
    }

    const occupiedSlotKeys = getOccupiedSlotKeysForBeneficiary(beneficiaryId);
    return selectedEventAvailableDates.filter((availableDate) => (
      selectedEventTimeSlots.some((slot) => !occupiedSlotKeys.has(`${availableDate}__${slot}`))
    ));
  };

  const getAvailableTimeSlotsForBeneficiary = (beneficiaryId: string, appointmentDate: string) => {
    if (selectedEventTimeSlots.length === 0 || !appointmentDate) {
      return selectedEventTimeSlots;
    }

    const occupiedSlotKeys = getOccupiedSlotKeysForBeneficiary(beneficiaryId);
    return selectedEventTimeSlots.filter((slot) => !occupiedSlotKeys.has(`${appointmentDate}__${slot}`));
  };

  const totalEventCount = sortedEvents.length;
  const openEventCount = sortedEvents.filter((event) => event.statut === 'ouvert' || event.statut === 'planifie').length;
  const totalRegistrationCount = registrations.length;
  const distinctBeneficiariesLinked = new Set(registrations.map((registration) => registration.beneficiaireId)).size;
  const hasIncompleteAidRowsInSelection = selectedBeneficiaryIds.some((beneficiaryId) => {
    const existingRegistration = registrationsForSelectedEventMap.get(beneficiaryId);
    const currentAidItems = registrationAidItems[beneficiaryId] || getAidItemsFromRegistration(existingRegistration);
    return countIncompleteAidItems(currentAidItems) > 0;
  });

  const handleOpenCreateEvent = () => {
    setEditingEventId(null);
    setEventForm(EMPTY_EVENT_FORM);
    setEventDialogOpen(true);
  };

  const handleOpenEditEvent = (event: ComptoirSpecialEvent) => {
    setEditingEventId(event.id);
    setEventForm({
      nom: event.nom,
      description: event.description || '',
      fechaInicio: event.fechaInicio,
      fechaFin: event.fechaFin,
      heureDebut: event.heureDebut || '',
      heureFin: event.heureFin || '',
      reservationIntervalMinutes: typeof event.reservationIntervalMinutes === 'number' ? String(event.reservationIntervalMinutes) : '',
      lieu: event.lieu || '',
      capaciteMax: typeof event.capaciteMax === 'number' ? String(event.capaciteMax) : '',
      statut: event.statut,
    });
    setEventDialogOpen(true);
  };

  const handleSaveEvent = () => {
    if (!eventForm.nom.trim()) {
      toast.error('Le nom de l’événement est obligatoire.');
      return;
    }

    if (!eventForm.fechaInicio) {
      toast.error('La date de commencement de l’événement est obligatoire.');
      return;
    }

    if (!eventForm.fechaFin) {
      toast.error('La date de fin de l’événement est obligatoire.');
      return;
    }

    if (eventForm.fechaFin < eventForm.fechaInicio) {
      toast.error('La date de fin doit être postérieure ou égale à la date de commencement.');
      return;
    }

    const reservationIntervalMinutes = eventForm.reservationIntervalMinutes
      ? Number.parseInt(eventForm.reservationIntervalMinutes, 10)
      : undefined;

    if (eventForm.reservationIntervalMinutes && (!Number.isFinite(reservationIntervalMinutes) || reservationIntervalMinutes! <= 0)) {
      toast.error('L’intervalle entre réservations doit être un nombre de minutes valide.');
      return;
    }

    if (reservationIntervalMinutes && reservationIntervalMinutes > 240) {
      toast.error('L’intervalle entre réservations ne peut pas dépasser 240 minutes.');
      return;
    }

    if (reservationIntervalMinutes && (!eventForm.heureDebut || !eventForm.heureFin)) {
      toast.error('Définissez l’heure de début et l’heure de fin pour utiliser un intervalle de réservations.');
      return;
    }

    if (reservationIntervalMinutes) {
      const slots = generateReservationTimeSlots(eventForm.heureDebut, eventForm.heureFin, reservationIntervalMinutes);
      if (slots.length === 0) {
        toast.error('Vérifiez les heures de début/fin et l’intervalle de réservations.');
        return;
      }
    }

    const savedEvent = upsertEvenementSpecialComptoir({
      id: editingEventId || genererSiguienteIdEvenementSpecial(),
      nom: eventForm.nom.trim(),
      description: eventForm.description.trim() || undefined,
      fechaInicio: eventForm.fechaInicio,
      fechaFin: eventForm.fechaFin,
      heureDebut: eventForm.heureDebut || undefined,
      heureFin: eventForm.heureFin || undefined,
      reservationIntervalMinutes,
      lieu: eventForm.lieu.trim() || undefined,
      capaciteMax: eventForm.capaciteMax ? Number.parseInt(eventForm.capaciteMax, 10) : undefined,
      statut: eventForm.statut,
    });

    setSelectedEventId(savedEvent.id);
    setEventDialogOpen(false);
    setEditingEventId(null);
    setEventForm(EMPTY_EVENT_FORM);
    toast.success(editingEventId ? 'Événement mis à jour.' : 'Événement créé.');
  };

  const handleDeleteEvent = (eventId: string) => {
    const event = events.find((item) => item.id === eventId);
    if (!event) {
      return;
    }

    if (!window.confirm(`Supprimer l’événement « ${event.nom} » et toutes ses inscriptions ?`)) {
      return;
    }

    supprimerEvenementSpecialComptoir(eventId);
    if (selectedEventId === eventId) {
      setSelectedEventId('all');
    }
    toast.success('Événement supprimé.');
  };

  const handleOpenRegistrationsDialog = () => {
    if (!selectedEvent) {
      toast.info('Sélectionnez un événement pour gérer ses inscriptions.');
      return;
    }

    if (selectedEventCapacityReached) {
      toast.info('La capacité maximale de cet événement est déjà atteinte.');
      return;
    }

    const initialIds = registrationsForSelectedEvent.map((registration) => registration.beneficiaireId);
    setSelectedBeneficiaryIds(initialIds);
    setInitialSelectedBeneficiaryIds(initialIds);
    setRegistrationStatuses(
      registrationsForSelectedEvent.reduce<Record<string, ComptoirSpecialEventRegistration['statut']>>((acc, registration) => {
        acc[registration.beneficiaireId] = registration.statut;
        return acc;
      }, {})
    );
    setRegistrationAidItems(
      registrationsForSelectedEvent.reduce<Record<string, RegistrationAidItemInput[]>>((acc, registration) => {
        const resolvedAidItems = getAidItemsFromRegistration(registration);
        if (resolvedAidItems.length > 0) {
          acc[registration.beneficiaireId] = resolvedAidItems;
        }
        return acc;
      }, {})
    );
    setRegistrationAppointmentDates(
      registrationsForSelectedEvent.reduce<Record<string, string>>((acc, registration) => {
        if (registration.appointmentDate) {
          acc[registration.beneficiaireId] = registration.appointmentDate;
        }
        return acc;
      }, {})
    );
    setRegistrationAppointmentTimes(
      registrationsForSelectedEvent.reduce<Record<string, string>>((acc, registration) => {
        if (registration.appointmentTime) {
          acc[registration.beneficiaireId] = registration.appointmentTime;
        }
        return acc;
      }, {})
    );
    setRegistrationSearch('');
    setRegistrationDialogOpen(true);
  };

  const toggleBeneficiarySelection = (beneficiaryId: string, checked: boolean) => {
    setSelectedBeneficiaryIds((currentIds) => {
      if (checked) {
        if (currentIds.includes(beneficiaryId)) {
          return currentIds;
        }
        setRegistrationStatuses((currentStatuses) => ({
          ...currentStatuses,
          [beneficiaryId]: currentStatuses[beneficiaryId] || 'inscrit',
        }));
        return [...currentIds, beneficiaryId];
      }

      setRegistrationStatuses((currentStatuses) => {
        const nextStatuses = { ...currentStatuses };
        delete nextStatuses[beneficiaryId];
        return nextStatuses;
      });
      setRegistrationAidItems((currentAidItems) => {
        const nextAidItems = { ...currentAidItems };
        delete nextAidItems[beneficiaryId];
        return nextAidItems;
      });
      setRegistrationAppointmentDates((currentDates) => {
        const nextDates = { ...currentDates };
        delete nextDates[beneficiaryId];
        return nextDates;
      });
      setRegistrationAppointmentTimes((currentTimes) => {
        const nextTimes = { ...currentTimes };
        delete nextTimes[beneficiaryId];
        return nextTimes;
      });
      return currentIds.filter((currentId) => currentId !== beneficiaryId);
    });
  };

  const handleRegistrationStatusChange = (
    beneficiaryId: string,
    statut: ComptoirSpecialEventRegistration['statut']
  ) => {
    setRegistrationStatuses((currentStatuses) => ({
      ...currentStatuses,
      [beneficiaryId]: statut,
    }));
  };

  const handleRegistrationAidItemsChange = (beneficiaryId: string, nextItems: RegistrationAidItemInput[]) => {
    const nextItemsForForm = nextItems.map((item) => ({
      aidTypeId: item.aidTypeId,
      quantity: normalizeAidQuantity(item.quantity),
    }));

    setRegistrationAidItems((currentAidItems) => ({
      ...currentAidItems,
      [beneficiaryId]: nextItemsForForm,
    }));
  };

  const handleRegistrationAppointmentDateChange = (beneficiaryId: string, appointmentDate: string) => {
    setRegistrationAppointmentDates((currentDates) => ({
      ...currentDates,
      [beneficiaryId]: appointmentDate,
    }));
  };

  const handleRegistrationAppointmentTimeChange = (beneficiaryId: string, appointmentTime: string) => {
    setRegistrationAppointmentTimes((currentTimes) => ({
      ...currentTimes,
      [beneficiaryId]: appointmentTime,
    }));
  };

  const handleSaveRegistrations = () => {
    if (!selectedEvent) {
      toast.error('Aucun événement sélectionné.');
      return;
    }

    const eventRegistrationsMap = new Map(
      registrations
        .filter((registration) => registration.eventId === selectedEvent.id)
        .map((registration) => [registration.beneficiaireId, registration])
    );

    const occupiedSelectedCount = selectedBeneficiaryIds.filter((beneficiaryId) => {
      const currentStatus = registrationStatuses[beneficiaryId] || eventRegistrationsMap.get(beneficiaryId)?.statut || 'inscrit';
      return currentStatus !== 'annule';
    }).length;

    if (typeof selectedEvent.capaciteMax === 'number' && occupiedSelectedCount > selectedEvent.capaciteMax) {
      toast.error(`La capacité maximale de ${selectedEvent.capaciteMax} place(s) serait dépassée.`);
      return;
    }

    const addedBeneficiaryIds = selectedBeneficiaryIds.filter((beneficiaryId) => !initialSelectedBeneficiaryIds.includes(beneficiaryId));

    const existingSelectedRegistrations = addedBeneficiaryIds
      .map((beneficiaryId) => eventRegistrationsMap.get(beneficiaryId))
      .filter((registration): registration is ComptoirSpecialEventRegistration => Boolean(registration));

    if (existingSelectedRegistrations.length > 0) {
      const existingDetails = existingSelectedRegistrations.map((registration) => {
        const dayLabel = registration.appointmentDate ? formatDateLabel(registration.appointmentDate) : 'Non défini';
        const hourLabel = registration.appointmentTime || 'Non définie';
        const aidTypeLabel = getRegistrationAidSummary(registration);
        return `- ${registration.beneficiaireNom}: Jour ${dayLabel}, Heure ${hourLabel}, Type ${aidTypeLabel}`;
      }).join('\n');

      const shouldContinue = window.confirm(
        `Attention: des inscriptions existent déjà.\n\n${existingDetails}\n\nConfirmer la mise à jour de ces inscriptions ?`
      );

      if (!shouldContinue) {
        return;
      }
    }

    const beneficiariesWithIncompleteAidItems = selectedBeneficiaryIds.filter((beneficiaryId) => {
      const existingRegistration = eventRegistrationsMap.get(beneficiaryId);
      const currentAidItems = registrationAidItems[beneficiaryId] || getAidItemsFromRegistration(existingRegistration);
      return countIncompleteAidItems(currentAidItems) > 0;
    });

    if (beneficiariesWithIncompleteAidItems.length > 0) {
      toast.error('Complétez les types d\'aide: certaines lignes n\'ont pas encore de type sélectionné.');
      return;
    }

    const timestamp = new Date().toISOString();

    const nextEventRegistrations = selectedBeneficiaryIds
      .map((beneficiaryId) => {
        const beneficiary = beneficiaries.find((item) => item.id === beneficiaryId);
        if (!beneficiary) {
          return null;
        }

        const existingRegistration = eventRegistrationsMap.get(beneficiaryId);
        const selectedAidItems = registrationAidItems[beneficiaryId] || getAidItemsFromRegistration(existingRegistration);
        const normalizedAidItems = normalizeRegistrationAidItems(selectedAidItems);
        const primaryAidItem = normalizedAidItems[0];
        const primaryAidTypeId = primaryAidItem?.aidTypeId;
        const primaryAidTypeName = primaryAidTypeId
          ? getAidTypeNameById(primaryAidTypeId)
          : existingRegistration?.aidTypeName;
        return {
          id: existingRegistration?.id || genererSiguienteIdInscriptionEvenementSpecial(),
          eventId: selectedEvent.id,
          beneficiaireId: beneficiary.id,
          beneficiaireNom: beneficiary.nom,
          aidTypeId: primaryAidTypeId,
          aidTypeName: primaryAidTypeName,
          aidQuantity: primaryAidItem?.quantity,
          aidItems: normalizedAidItems,
          appointmentDate: registrationAppointmentDates[beneficiaryId] || existingRegistration?.appointmentDate,
          appointmentTime: registrationAppointmentTimes[beneficiaryId] || existingRegistration?.appointmentTime,
          statut: registrationStatuses[beneficiaryId] || existingRegistration?.statut || 'inscrit',
          notes: existingRegistration?.notes,
          createdAt: existingRegistration?.createdAt || timestamp,
          updatedAt: timestamp,
        } satisfies ComptoirSpecialEventRegistration;
      })
      .filter((registration): registration is ComptoirSpecialEventRegistration => registration !== null);

    const duplicatedSlots = new Set<string>();
    const usedSlots = new Set<string>();
    nextEventRegistrations.forEach((registration) => {
      if (registration.statut === 'annule') {
        return;
      }

      const slotKey = buildAppointmentSlotKey(registration.appointmentDate, registration.appointmentTime);
      if (!slotKey) {
        return;
      }

      if (usedSlots.has(slotKey)) {
        duplicatedSlots.add(slotKey);
        return;
      }

      usedSlots.add(slotKey);
    });

    if (duplicatedSlots.size > 0) {
      toast.error('Certains créneaux sont déjà réservés. Choisissez des jours/heures différents.');
      return;
    }

    const remainingRegistrations = registrations.filter((registration) => registration.eventId !== selectedEvent.id);
    sauvegarderInscriptionsEvenementsSpeciauxComptoir(
      dedupeSpecialEventRegistrations([...remainingRegistrations, ...nextEventRegistrations])
    );
    setRegistrationDialogOpen(false);
    toast.success('Inscriptions mises à jour.');
  };

  const handleUpdateRegistrationStatus = (registrationId: string, statut: ComptoirSpecialEventRegistration['statut']) => {
    const updatedRegistrations = registrations.map((registration) => (
      registration.id === registrationId
        ? { ...registration, statut, updatedAt: new Date().toISOString() }
        : registration
    ));

    sauvegarderInscriptionsEvenementsSpeciauxComptoir(updatedRegistrations);
  };

  const handleOpenEditRegistration = (registration: ComptoirSpecialEventRegistration) => {
    setEditingRegistration(registration);
    setRegistrationEditStatus(registration.statut);
    setRegistrationEditAidItems(getAidItemsFromRegistration(registration));
    setRegistrationEditAppointmentDate(registration.appointmentDate || '');
    setRegistrationEditAppointmentTime(registration.appointmentTime || '');
    setRegistrationEditDialogOpen(true);
  };

  const handleSaveEditedRegistration = () => {
    if (!editingRegistration) {
      return;
    }

    if (countIncompleteAidItems(registrationEditAidItems) > 0) {
      toast.error('Complétez les types d\'aide avant d\'enregistrer: certaines lignes n\'ont pas de type sélectionné.');
      return;
    }

    if (
      editingRegistrationAvailableDates.length > 0
      && registrationEditAppointmentDate
      && !editingRegistrationAvailableDates.includes(registrationEditAppointmentDate)
    ) {
      toast.error('La date de cita doit correspondre aux dates programmées de l’événement.');
      return;
    }

    const updatedRegistrations = registrations.map((registration) => {
      if (registration.id !== editingRegistration.id) {
        return registration;
      }

      const normalizedAidItems = normalizeRegistrationAidItems(registrationEditAidItems);
      const primaryAidItem = normalizedAidItems[0];
      const primaryAidTypeId = primaryAidItem?.aidTypeId;
      const primaryAidTypeName = primaryAidTypeId
        ? getAidTypeNameById(primaryAidTypeId)
        : registration.aidTypeName;

      return {
        ...registration,
        statut: registrationEditStatus,
        aidTypeId: primaryAidTypeId,
        aidTypeName: primaryAidTypeName || undefined,
        aidQuantity: primaryAidItem?.quantity,
        aidItems: normalizedAidItems,
        appointmentDate: registrationEditAppointmentDate || undefined,
        appointmentTime: registrationEditAppointmentTime || undefined,
        updatedAt: new Date().toISOString(),
      };
    });

    sauvegarderInscriptionsEvenementsSpeciauxComptoir(updatedRegistrations);
    setRegistrationEditDialogOpen(false);
    setEditingRegistration(null);
    toast.success('Inscription modifiée.');
  };

  const handleRemoveRegistration = (registrationId: string) => {
    const registration = registrations.find((item) => item.id === registrationId);
    if (!registration) {
      return;
    }

    if (!window.confirm(`Retirer ${registration.beneficiaireNom} de cet événement ?`)) {
      return;
    }

    sauvegarderInscriptionsEvenementsSpeciauxComptoir(
      registrations.filter((item) => item.id !== registrationId)
    );
    toast.success('Inscription retirée.');
  };

  const handleExportPdf = () => {
    if (!selectedEvent) {
      toast.info('Sélectionnez un événement pour générer son rapport.');
      return;
    }

    const eventRegistrations = filteredRegistrations.filter((registration) => registration.eventId === selectedEvent.id);
    if (eventRegistrations.length === 0) {
      toast.info('Aucune inscription à exporter pour cet événement.');
      return;
    }

    const summaryByStatus = ['inscrit', 'present', 'absent', 'annule'].map((status) => ({
      statut: getStatusLabel(status as ComptoirSpecialEventRegistration['statut']),
      total: eventRegistrations.filter((registration) => registration.statut === status).length,
    }));
    const summaryByAidType = eventRegistrations.reduce<Array<{ typeAide: string; total: number }>>((acc, registration) => {
      const aidItems = getAidItemsFromRegistration(registration);
      if (aidItems.length === 0) {
        const existingEntry = acc.find((item) => item.typeAide === 'Sans type défini');
        if (existingEntry) {
          existingEntry.total += 1;
        } else {
          acc.push({ typeAide: 'Sans type défini', total: 1 });
        }
        return acc;
      }

      aidItems.forEach((item) => {
        const typeAide = getAidTypeNameById(item.aidTypeId);
        const existingEntry = acc.find((currentItem) => currentItem.typeAide === typeAide);
        if (existingEntry) {
          existingEntry.total += item.quantity;
          return;
        }

        acc.push({ typeAide, total: item.quantity });
      });

      return acc;
    }, []);

    exportarReportePersonalizado(
      `Événement spécial - ${selectedEvent.nom}`,
      `Période: ${formatEventDateRange(selectedEvent)} | Lieu: ${selectedEvent.lieu || 'Non précisé'} | Filtre statut: ${registrationStatusFilter === 'all' ? 'Tous' : getStatusLabel(registrationStatusFilter)} | Filtre type d'aide: ${getAidTypeFilterLabel()}`,
      [
        {
          titulo: 'Résumé de l’événement',
          columnas: ['Événement', 'Début', 'Fin', 'Lieu', 'Capacité', 'Inscriptions'],
          datos: [[
            selectedEvent.nom,
            formatDateLabel(selectedEvent.fechaInicio),
            formatDateLabel(selectedEvent.fechaFin),
            selectedEvent.lieu || '-',
            selectedEvent.capaciteMax || '-',
            eventRegistrations.length,
          ]],
        },
        {
          titulo: 'Répartition par statut',
          columnas: ['Statut', 'Total'],
          datos: summaryByStatus.map((item) => [item.statut, item.total]),
        },
        {
          titulo: 'Répartition par type d\'aide',
          columnas: ['Type d\'aide', 'Total'],
          datos: summaryByAidType.map((item) => [item.typeAide, item.total]),
        },
        {
          titulo: 'Liste des bénéficiaires inscrits',
          columnas: ['Bénéficiaire', 'Numéro', 'Type d\'aide', 'Cita', 'Statut', 'Téléphone', 'Email'],
          datos: eventRegistrations.map((registration) => {
            const beneficiary = beneficiaries.find((item) => item.id === registration.beneficiaireId);
            return [
              registration.beneficiaireNom,
              registration.beneficiaireId,
              getRegistrationAidSummary(registration),
              `${registration.appointmentDate ? formatDateLabel(registration.appointmentDate) : '-'}${registration.appointmentTime ? ` • ${registration.appointmentTime}` : ''}`,
              getStatusLabel(registration.statut),
              beneficiary?.telephone || '-',
              beneficiary?.email || '-',
            ];
          }),
        },
      ]
    );
  };

  const handleExportExcel = () => {
    if (!selectedEvent) {
      toast.info('Sélectionnez un événement pour générer son rapport.');
      return;
    }

    const eventRegistrations = filteredRegistrations.filter((registration) => registration.eventId === selectedEvent.id);
    if (eventRegistrations.length === 0) {
      toast.info('Aucune inscription à exporter pour cet événement.');
      return;
    }

    const summaryByAidType = eventRegistrations.reduce<Array<{ typeAide: string; total: number }>>((acc, registration) => {
      const aidItems = getAidItemsFromRegistration(registration);
      if (aidItems.length === 0) {
        const existingEntry = acc.find((item) => item.typeAide === 'Sans type défini');
        if (existingEntry) {
          existingEntry.total += 1;
        } else {
          acc.push({ typeAide: 'Sans type défini', total: 1 });
        }
        return acc;
      }

      aidItems.forEach((item) => {
        const typeAide = getAidTypeNameById(item.aidTypeId);
        const existingEntry = acc.find((currentItem) => currentItem.typeAide === typeAide);
        if (existingEntry) {
          existingEntry.total += item.quantity;
          return;
        }

        acc.push({ typeAide, total: item.quantity });
      });

      return acc;
    }, []);

    exportarDatosPersonalizados(`evenement-${selectedEvent.id}`, [
      {
        nombre: 'Résumé événement',
        datos: [{
          evenement: selectedEvent.nom,
          fechaInicio: formatDateLabel(selectedEvent.fechaInicio),
          fechaFin: formatDateLabel(selectedEvent.fechaFin),
          periode: formatEventDateRange(selectedEvent),
          lieu: selectedEvent.lieu || '-',
          statut: getStatusLabel(selectedEvent.statut),
          capacite: selectedEvent.capaciteMax || '-',
          inscriptions: eventRegistrations.length,
        }],
      },
      {
        nombre: 'Inscriptions',
        datos: eventRegistrations.map((registration) => {
          const beneficiary = beneficiaries.find((item) => item.id === registration.beneficiaireId);
          return {
            beneficiaire: registration.beneficiaireNom,
            numeroDossier: registration.beneficiaireId,
            typeAide: getRegistrationAidSummary(registration),
            rendezVous: registration.appointmentDate ? formatDateLabel(registration.appointmentDate) : '-',
            heureRendezVous: registration.appointmentTime || '-',
            statut: getStatusLabel(registration.statut),
            telephone: beneficiary?.telephone || '-',
            email: beneficiary?.email || '-',
            ville: beneficiary?.ville || '-',
          };
        }),
      },
      {
        nombre: 'Répartition type aide',
        datos: summaryByAidType.map((item) => ({
          typeAide: item.typeAide,
          total: item.total,
        })),
      },
    ]);
  };

  const handlePrintAttendance = () => {
    if (!selectedEvent) {
      toast.info('Sélectionnez un événement pour imprimer la feuille de présence.');
      return;
    }

    const eventRegistrations = registrations
      .filter((registration) => registration.eventId === selectedEvent.id)
      .slice()
      .sort((left, right) => left.beneficiaireNom.localeCompare(right.beneficiaireNom));

    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    if (!printWindow) {
      toast.error('Impossible d’ouvrir la fenêtre d’impression. Vérifiez le bloqueur de fenêtres.');
      return;
    }

    const rowsHtml = eventRegistrations.length > 0
      ? eventRegistrations.map((registration, index) => {
          const beneficiary = beneficiaries.find((item) => item.id === registration.beneficiaireId);
          return `
            <tr>
              <td>${index + 1}</td>
              <td>${escapeHtml(registration.beneficiaireNom)}</td>
              <td>${escapeHtml(registration.beneficiaireId)}</td>
              <td>${escapeHtml(getRegistrationAidSummary(registration))}</td>
              <td>${escapeHtml(beneficiary?.telephone || '-')}</td>
              <td>${escapeHtml(getStatusLabel(registration.statut))}</td>
              <td></td>
              <td></td>
            </tr>
          `;
        }).join('')
      : `
        <tr>
          <td colspan="8" class="empty-row">Aucun bénéficiaire inscrit pour cet événement.</td>
        </tr>
      `;

    const eventName = escapeHtml(selectedEvent.nom);
    const eventDate = escapeHtml(formatEventDateRange(selectedEvent));
    const eventTime = escapeHtml(`${selectedEvent.heureDebut || '--'}${selectedEvent.heureFin ? ` à ${selectedEvent.heureFin}` : ''}`);
    const eventLocation = escapeHtml(selectedEvent.lieu || 'Lieu non défini');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <title>Feuille de présence - ${eventName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #1f2937;
              margin: 32px;
            }
            .header {
              margin-bottom: 24px;
              border-bottom: 2px solid #1E73BE;
              padding-bottom: 16px;
            }
            .header h1 {
              margin: 0 0 8px;
              color: #1E73BE;
              font-size: 28px;
            }
            .meta {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 8px 24px;
              font-size: 14px;
            }
            .summary {
              margin: 18px 0 22px;
              padding: 12px 16px;
              background: #eff6ff;
              border: 1px solid #bfdbfe;
              border-radius: 8px;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 13px;
            }
            th,
            td {
              border: 1px solid #d1d5db;
              padding: 10px 8px;
              text-align: left;
              vertical-align: middle;
            }
            th {
              background: #f3f4f6;
              font-weight: 700;
            }
            .empty-row {
              text-align: center;
              color: #6b7280;
              padding: 18px;
            }
            .signature {
              margin-top: 32px;
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 40px;
            }
            .signature-line {
              border-top: 1px solid #9ca3af;
              padding-top: 8px;
              font-size: 13px;
              color: #4b5563;
            }
            @media print {
              body {
                margin: 18px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Feuille de présence</h1>
            <div class="meta">
              <div><strong>Événement :</strong> ${eventName}</div>
              <div><strong>Période :</strong> ${eventDate}</div>
              <div><strong>Horaire :</strong> ${eventTime}</div>
              <div><strong>Lieu :</strong> ${eventLocation}</div>
            </div>
          </div>

          <div class="summary">
            Total des inscriptions : <strong>${eventRegistrations.length}</strong>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Bénéficiaire</th>
                <th>Dossier</th>
                <th>Type d'aide</th>
                <th>Téléphone</th>
                <th>Statut actuel</th>
                <th>Présence</th>
                <th>Signature</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <div class="signature">
            <div class="signature-line">Responsable événement</div>
            <div class="signature-line">Validation comptoir</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        <Card className="border-l-4 border-l-[#1E73BE]">
          <CardContent className="flex items-center justify-between p-2.5">
            <div className="min-w-0">
              <p className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[#666666]">Événements créés</p>
              <p className="text-xl font-bold leading-none text-[#1E73BE]">{totalEventCount}</p>
            </div>
            <Ticket className="h-6 w-6 shrink-0 text-[#1E73BE] opacity-20" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#4CAF50]">
          <CardContent className="flex items-center justify-between p-2.5">
            <div className="min-w-0">
              <p className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[#666666]">Événements actifs</p>
              <p className="text-xl font-bold leading-none text-[#4CAF50]">{openEventCount}</p>
            </div>
            <Calendar className="h-6 w-6 shrink-0 text-[#4CAF50] opacity-20" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#FFC107]">
          <CardContent className="flex items-center justify-between p-2.5">
            <div className="min-w-0">
              <p className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[#666666]">Inscriptions</p>
              <p className="text-xl font-bold leading-none text-[#FFC107]">{totalRegistrationCount}</p>
            </div>
            <UserPlus className="h-6 w-6 shrink-0 text-[#FFC107] opacity-20" />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#7E57C2]">
          <CardContent className="flex items-center justify-between p-2.5">
            <div className="min-w-0">
              <p className="mb-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[#666666]">Bénéficiaires liés</p>
              <p className="text-xl font-bold leading-none text-[#7E57C2]">{distinctBeneficiariesLinked}</p>
            </div>
            <Users className="h-6 w-6 shrink-0 text-[#7E57C2] opacity-20" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-2.5">
          <div className="flex flex-col gap-2.5 xl:flex-row xl:items-end xl:justify-between">
            <div className="grid flex-1 grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <Label className="text-[11px] font-medium text-[#666666]">Filtrer par événement</Label>
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <Filter className="mr-2 h-3.5 w-3.5" />
                    <SelectValue placeholder="Tous les événements" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les événements</SelectItem>
                    {sortedEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[11px] font-medium text-[#666666]">Filtrer par statut</Label>
                <Select value={registrationStatusFilter} onValueChange={(value) => setRegistrationStatusFilter(value as 'all' | ComptoirSpecialEventRegistration['statut'])}>
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <Filter className="mr-2 h-3.5 w-3.5" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="inscrit">Inscrit</SelectItem>
                    <SelectItem value="present">Présent</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="annule">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[11px] font-medium text-[#666666]">Filtrer par type d'aide</Label>
                <Select value={registrationAidTypeFilter} onValueChange={setRegistrationAidTypeFilter}>
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <Filter className="mr-2 h-3.5 w-3.5" />
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="__none__">Sans type défini</SelectItem>
                    {availableAidTypes.map((aidType) => (
                      <SelectItem key={aidType.id} value={aidType.id}>
                        {aidType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[11px] font-medium text-[#666666]">Recherche</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#666666]" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="h-8 pl-8 text-xs"
                    placeholder="Bénéficiaire, dossier ou événement"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs" onClick={handlePrintAttendance} disabled={!selectedEvent}>
                <Printer className="mr-1.5 h-3.5 w-3.5" />
                Imprimer
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs" disabled={!selectedEvent}>
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Exporter
                    <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={handleExportPdf}>
                    <Download className="h-3.5 w-3.5" />
                    Exporter en PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportExcel}>
                    <FileText className="h-3.5 w-3.5" />
                    Exporter en Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" className="h-8 bg-[#1E73BE] px-2.5 text-xs hover:bg-[#1557A0]" onClick={handleOpenCreateEvent}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Créer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-[#F4F4F4] px-3 py-2.5">
            <CardTitle className="flex items-center justify-between gap-3 text-sm">
              <span>Calendrier des événements spéciaux</span>
              {selectedEvent && (
                <Badge className={getStatusBadgeClass(selectedEvent.statut)} variant="outline">
                  {getStatusLabel(selectedEvent.statut)}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2.5 sm:p-3">
            {sortedEvents.length > 0 ? (
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {sortedEvents.map((event) => {
              const participantCount = registrations.filter((registration) => registration.eventId === event.id && registration.statut !== 'annule').length;
              const isSelected = selectedEventId === event.id;
              const capacityReached = typeof event.capaciteMax === 'number' && participantCount >= event.capaciteMax;
              const remainingSlots = typeof event.capaciteMax === 'number'
                ? Math.max(event.capaciteMax - participantCount, 0)
                : null;

              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelectedEventId(event.id)}
                  className={`w-full rounded-lg border p-2.5 text-left transition-all ${isSelected ? 'border-[#1E73BE] bg-[#EAF4FF] shadow-sm' : 'border-[#E0E0E0] hover:border-[#BFD8F6] hover:bg-[#FAFAFA]'}`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="truncate text-[13px] font-semibold leading-tight text-[#333333]">{event.nom}</h3>
                        <Badge className={getStatusBadgeClass(capacityReached && event.statut === 'ouvert' ? 'complet' : event.statut)} variant="outline">
                          {capacityReached && event.statut === 'ouvert' ? 'Capacité atteinte' : getStatusLabel(event.statut)}
                        </Badge>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#D8E5F2] bg-white px-2 py-0.5 text-[10px] font-medium leading-none text-[#5B6570]">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>{formatEventDateRange(event)}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#D8E5F2] bg-white px-2 py-0.5 text-[10px] font-medium leading-none text-[#5B6570]">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>{event.heureDebut || '--'}{event.heureFin ? ` à ${event.heureFin}` : ''}</span>
                        </span>
                        <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-[#D8E5F2] bg-white px-2 py-0.5 text-[10px] font-medium leading-none text-[#5B6570]">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{event.lieu || 'Lieu non défini'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <div className="flex flex-col items-end gap-1 text-right text-[10px] leading-none">
                        <span className="rounded-full bg-[#EAF4FF] px-2 py-1 font-semibold text-[#1E73BE]">{participantCount} place(s) inscrite(s)</span>
                        {remainingSlots !== null && (
                          <span className="rounded-full bg-[#E8F5E9] px-2 py-1 font-semibold text-[#2E7D32]">{remainingSlots} place(s) restante(s)</span>
                        )}
                        <span className="rounded-full bg-[#F3F4F6] px-2 py-1 text-[#666666]">
                          {typeof event.capaciteMax === 'number' ? `${event.capaciteMax} places` : 'Capacité libre'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="icon" className="h-6.5 w-6.5" onClick={(clickEvent) => { clickEvent.stopPropagation(); handleOpenEditEvent(event); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="h-6.5 w-6.5 text-red-600 hover:text-red-700" onClick={(clickEvent) => { clickEvent.stopPropagation(); handleDeleteEvent(event.id); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {event.description && (
                    <p className="mt-1.5 line-clamp-2 text-[11px] leading-tight text-[#555555]">{event.description}</p>
                  )}
                </button>
              );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#D0D7DE] p-5 text-center text-sm text-[#666666]">
                Aucun événement spécial n’a encore été créé.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b bg-[#F4F4F4] px-3 py-2.5">
            <CardTitle className="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#333333]">Inscriptions bénéficiaires</p>
                <div className="mt-1 flex flex-wrap items-center gap-1">
                  {selectedEvent ? (
                    <>
                      <Badge variant="outline" className="text-[10px] font-medium">
                        {selectedEvent.nom}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-medium text-[#5B6570]">
                        {formatEventDateRange(selectedEvent)}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] font-medium text-[#1E73BE]">
                        {filteredRegistrations.length} visible(s)
                      </Badge>
                      {registrationCountsByAidType.map((item) => (
                        <Badge key={item.label} variant="outline" className="text-[10px] font-medium text-[#5B6570]">
                          {item.label}: {item.total}
                        </Badge>
                      ))}
                    </>
                  ) : (
                    <Badge variant="outline" className="text-[10px] font-medium text-[#666666]">
                      Sélectionnez un événement
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative min-w-[220px] sm:min-w-[260px]">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#666666]" />
                  <Input
                    value={quickRegistrationSearch}
                    onChange={(event) => setQuickRegistrationSearch(event.target.value)}
                    className="h-8 pl-8 text-xs"
                    placeholder="Recherche rapide: nom, dossier, téléphone, email"
                  />
                </div>
                <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs" onClick={() => onNavigate('fiche-beneficiaire', 'new')}>
                  <Users className="mr-1.5 h-3.5 w-3.5" />
                  Nouveau
                </Button>
                <Button size="sm" className="h-8 bg-[#4CAF50] px-2.5 text-xs hover:bg-[#449B48]" onClick={handleOpenRegistrationsDialog} disabled={!selectedEvent || selectedEventCapacityReached}>
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                  Gérer
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-[#F8F9FA]">
                  <tr>
                    <th className="p-2 text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-[#333333]">Bénéficiaire</th>
                    <th className="p-2 text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-[#333333]">Événement</th>
                    <th className="p-2 text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-[#333333]">Type d'aide</th>
                    <th className="p-2 text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-[#333333]">Cita</th>
                    <th className="p-2 text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-[#333333]">Statut</th>
                    <th className="p-2 text-left text-[10px] font-semibold uppercase tracking-[0.06em] text-[#333333]">Coordonnées</th>
                    <th className="p-2 text-right text-[10px] font-semibold uppercase tracking-[0.06em] text-[#333333]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {groupedRegistrations.map((group, groupIndex) => {
                    const homonymCounts = group.registrations.reduce<Record<string, number>>((acc, registration) => {
                      acc[registration.beneficiaireNom] = (acc[registration.beneficiaireNom] || 0) + 1;
                      return acc;
                    }, {});

                    return (
                    <React.Fragment key={`${group.appointmentDate || 'none'}-${group.appointmentTime || 'none'}-${groupIndex}`}>
                      <tr className="bg-[#F8FAFD]">
                        <td colSpan={7} className="p-2">
                          <div className="flex flex-wrap items-center gap-2 text-[11px]">
                            <Badge variant="outline" className="text-[10px] font-medium text-[#1E73BE]">
                              {group.appointmentDate ? formatDateLabel(group.appointmentDate) : 'Date non définie'}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] font-medium text-[#5B6570]">
                              {group.appointmentTime || 'Heure non définie'}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] font-medium text-[#5B6570]">
                              {group.registrations.length} inscription(s)
                            </Badge>
                          </div>
                        </td>
                      </tr>

                      {[...group.registrations]
                        .sort((left, right) => {
                          const orderDiff = getRegistrationQueueOrder(left.statut) - getRegistrationQueueOrder(right.statut);
                          if (orderDiff !== 0) {
                            return orderDiff;
                          }

                          return left.beneficiaireNom.localeCompare(right.beneficiaireNom);
                        })
                        .map((registration) => {
                        const event = events.find((item) => item.id === registration.eventId);
                        const beneficiary = beneficiaries.find((item) => item.id === registration.beneficiaireId);
                        const hasHomonym = homonymCounts[registration.beneficiaireNom] > 1;
                        const isPresent = registration.statut === 'present';
                        const isQueuedStatus = registration.statut === 'present' || registration.statut === 'absent' || registration.statut === 'annule';

                        return (
                          <tr key={registration.id} className={`align-top ${getRegistrationRowClass(registration.statut)}`}>
                            <td className="p-2">
                              <button
                                type="button"
                                className="text-left"
                                onClick={() => onNavigate('fiche-beneficiaire', registration.beneficiaireId)}
                              >
                                <p className="text-[12px] font-semibold leading-tight text-[#333333]">{registration.beneficiaireNom}</p>
                                <div className="mt-0.5 flex flex-wrap items-center gap-1">
                                  <Badge variant="outline" className="border-[#BFD7F2] bg-[#F4F9FF] px-1.5 py-0 text-[9px] font-semibold text-[#1E73BE]">
                                    Dossier {registration.beneficiaireId}
                                  </Badge>
                                  {hasHomonym && (
                                    <Badge variant="outline" className="border-amber-300 bg-amber-50 px-1.5 py-0 text-[9px] font-semibold text-amber-700">
                                      Homonyme
                                    </Badge>
                                  )}
                                </div>
                                {isQueuedStatus && (
                                  <Badge
                                    variant="outline"
                                    className={`mt-0.5 text-[9px] font-medium ${isPresent ? 'text-green-700 border-green-300' : 'text-[#5B6570] border-[#C9D2DE]'}`}
                                  >
                                    {isPresent ? 'En file des présents' : 'En file de fin'}
                                  </Badge>
                                )}
                              </button>
                            </td>
                            <td className="p-2">
                              <p className="text-[12px] font-medium leading-tight text-[#333333]">{event?.nom || 'Événement supprimé'}</p>
                              <p className="text-[10px] text-[#666666]">{event ? formatEventDateRange(event) : '-'}</p>
                            </td>
                            <td className="p-2">
                              <p className="max-w-[220px] text-[10px] leading-tight text-[#333333]">{getRegistrationAidSummary(registration)}</p>
                            </td>
                            <td className="p-2 text-[10px] leading-tight text-[#666666]">
                              <p>{registration.appointmentDate ? formatDateLabel(registration.appointmentDate) : 'Date non définie'}</p>
                              <p className="mt-0.5">{registration.appointmentTime || 'Heure non définie'}</p>
                            </td>
                            <td className="p-2">
                              <Select value={registration.statut} onValueChange={(value) => handleUpdateRegistrationStatus(registration.id, value as ComptoirSpecialEventRegistration['statut'])}>
                                <SelectTrigger className={`h-6.5 w-[118px] text-[10px] ${getStatusBadgeClass(registration.statut)}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="inscrit">Inscrit</SelectItem>
                                  <SelectItem value="present">Présent</SelectItem>
                                  <SelectItem value="absent">Absent</SelectItem>
                                  <SelectItem value="annule">Annulé</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="p-2 text-[10px] leading-tight text-[#666666]">
                              <p>{beneficiary?.telephone || 'Téléphone non défini'}</p>
                              <p className="mt-0.5">{beneficiary?.email || 'Email non défini'}</p>
                            </td>
                            <td className="p-2">
                              <div className="flex justify-end gap-1">
                                <Button size="sm" variant="ghost" className="h-6.5 px-1.5 text-[10px]" onClick={() => handleOpenEditRegistration(registration)}>
                                  Modifier
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6.5 px-1.5 text-[10px]" onClick={() => onNavigate('fiche-beneficiaire', registration.beneficiaireId)}>
                                  Voir
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6.5 w-6.5 text-red-600 hover:text-red-700" onClick={() => handleRemoveRegistration(registration.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                    );
                  })}

                  {filteredRegistrations.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-5 text-center text-sm text-[#666666]">
                        {selectedEvent
                          ? 'Aucune inscription pour les filtres sélectionnés.'
                          : 'Sélectionnez ou créez un événement pour commencer à relier des bénéficiaires.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="event-special-description">
          <DialogHeader>
            <DialogTitle>{editingEventId ? 'Modifier l’événement spécial' : 'Créer un événement spécial'}</DialogTitle>
            <DialogDescription id="event-special-description">
              Créez des événements ponctuels puis reliez les bénéficiaires à l’activité pour le suivi et les rapports.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Nom de l’événement</Label>
              <Input value={eventForm.nom} onChange={(event) => setEventForm((current) => ({ ...current, nom: event.target.value }))} placeholder="Ex. Distribution de paniers de Noël" />
            </div>

            <div>
              <Label>Date de commencement</Label>
              <Input type="date" value={eventForm.fechaInicio} onChange={(event) => setEventForm((current) => ({ ...current, fechaInicio: event.target.value }))} />
            </div>

            <div>
              <Label>Date de fin</Label>
              <Input type="date" min={eventForm.fechaInicio || undefined} value={eventForm.fechaFin} onChange={(event) => setEventForm((current) => ({ ...current, fechaFin: event.target.value }))} />
            </div>

            <div>
              <Label>Statut</Label>
              <Select value={eventForm.statut} onValueChange={(value) => setEventForm((current) => ({ ...current, statut: value as ComptoirSpecialEvent['statut'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planifie">Planifié</SelectItem>
                  <SelectItem value="ouvert">Ouvert</SelectItem>
                  <SelectItem value="complet">Complet</SelectItem>
                  <SelectItem value="termine">Terminé</SelectItem>
                  <SelectItem value="annule">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Heure de début</Label>
              <Input type="time" value={eventForm.heureDebut} onChange={(event) => setEventForm((current) => ({ ...current, heureDebut: event.target.value }))} />
            </div>

            <div>
              <Label>Heure de fin</Label>
              <Input type="time" value={eventForm.heureFin} onChange={(event) => setEventForm((current) => ({ ...current, heureFin: event.target.value }))} />
            </div>

            <div>
              <Label>Intervalle entre réservations (minutes)</Label>
              <Input
                type="number"
                min="1"
                max="240"
                value={eventForm.reservationIntervalMinutes}
                onChange={(event) => setEventForm((current) => ({ ...current, reservationIntervalMinutes: event.target.value }))}
                placeholder="Ex. 10"
              />
            </div>

            <div>
              <Label>Lieu</Label>
              <Input value={eventForm.lieu} onChange={(event) => setEventForm((current) => ({ ...current, lieu: event.target.value }))} placeholder="Salle communautaire, entrepôt, etc." />
            </div>

            <div>
              <Label>Capacité maximale</Label>
              <Input type="number" min="1" value={eventForm.capaciteMax} onChange={(event) => setEventForm((current) => ({ ...current, capaciteMax: event.target.value }))} placeholder="Optionnel" />
            </div>

            <div className="md:col-span-2">
              <Label>Description</Label>
              <Textarea value={eventForm.description} onChange={(event) => setEventForm((current) => ({ ...current, description: event.target.value }))} rows={4} placeholder="Objectif, consignes, remarques logistiques..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEventDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-[#1E73BE] hover:bg-[#1557A0]" onClick={handleSaveEvent}>
              {editingEventId ? 'Enregistrer les modifications' : 'Créer l’événement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={registrationEditDialogOpen} onOpenChange={(open) => {
        setRegistrationEditDialogOpen(open);
        if (!open) {
          setEditingRegistration(null);
        }
      }}>
        <DialogContent className="max-w-lg" aria-describedby="registration-edit-description">
          <DialogHeader>
            <DialogTitle>Modifier l'inscription</DialogTitle>
            <DialogDescription id="registration-edit-description">
              Ajustez le statut, le type d'aide et la cita du bénéficiaire sélectionné.
            </DialogDescription>
          </DialogHeader>

          {editingRegistration && (
            <div className="space-y-4">
              <div className="rounded-md border bg-[#F8F9FA] p-3 text-xs text-[#5B6570]">
                <p className="font-semibold text-[#333333]">{editingRegistration.beneficiaireNom}</p>
                <p>{editingRegistration.beneficiaireId}</p>
                <p className="mt-1">{editingRegistrationEvent?.nom || 'Événement supprimé'}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="text-xs text-[#666666]">Statut de l'inscription</Label>
                  <Select value={registrationEditStatus} onValueChange={(value) => setRegistrationEditStatus(value as ComptoirSpecialEventRegistration['statut'])}>
                    <SelectTrigger className="mt-1 bg-white">
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

                <div className="sm:col-span-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-[#666666]">Types d'aide et quantités</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-[11px]"
                        onClick={() => setRegistrationEditAidItems((currentItems) => [...currentItems, { aidTypeId: '', quantity: 1 }])}
                      >
                        + Ajouter
                      </Button>
                    </div>

                    {registrationEditAidItems.length > 0 ? registrationEditAidItems.map((aidItem, aidItemIndex) => (
                      <div key={`edit-aid-${aidItemIndex}`} className="grid grid-cols-[1fr_84px_auto] gap-2">
                        <Select
                          value={aidItem.aidTypeId || '__none__'}
                          onValueChange={(value) => {
                            setRegistrationEditAidItems((currentItems) => {
                              const nextItems = [...currentItems];
                              nextItems[aidItemIndex] = {
                                ...nextItems[aidItemIndex],
                                aidTypeId: value === '__none__' ? '' : value,
                              };
                              return nextItems;
                            });
                          }}
                        >
                          <SelectTrigger className="h-8 bg-white text-xs">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Aucun</SelectItem>
                            {availableAidTypes.map((aidType) => (
                              <SelectItem key={aidType.id} value={aidType.id}>{aidType.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          type="number"
                          min="1"
                          value={String(aidItem.quantity)}
                          onChange={(event) => {
                            setRegistrationEditAidItems((currentItems) => {
                              const nextItems = [...currentItems];
                              nextItems[aidItemIndex] = {
                                ...nextItems[aidItemIndex],
                                quantity: Number.parseInt(event.target.value || '1', 10) || 1,
                              };
                              return nextItems;
                            });
                          }}
                          className="h-8 text-xs"
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-[11px] text-red-600 hover:text-red-700"
                          onClick={() => setRegistrationEditAidItems((currentItems) => currentItems.filter((_, index) => index !== aidItemIndex))}
                        >
                          Suppr.
                        </Button>
                      </div>
                    )) : (
                      <p className="text-[11px] text-[#666666]">Aucun type sélectionné.</p>
                    )}
                    {countIncompleteAidItems(registrationEditAidItems) > 0 && (
                      <p className="text-[11px] text-[#DC3545]">Sélectionnez un type pour chaque ligne avant d’enregistrer.</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-[#666666]">Jour de la cita</Label>
                  <Select
                    value={registrationEditAppointmentDate && editingRegistrationAvailableDates.includes(registrationEditAppointmentDate) ? registrationEditAppointmentDate : '__none__'}
                    onValueChange={(value) => setRegistrationEditAppointmentDate(value === '__none__' ? '' : value)}
                  >
                    <SelectTrigger className="mt-1 bg-white">
                      <SelectValue placeholder="Sélectionner un jour" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Aucune date</SelectItem>
                      {editingRegistrationAvailableDates.map((availableDate) => (
                        <SelectItem key={availableDate} value={availableDate}>{formatDateLabel(availableDate)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-[#666666]">Heure de la cita</Label>
                  {editingRegistrationTimeSlots.length > 0 ? (
                    <Select
                      value={registrationEditAppointmentTime || '__none__'}
                      onValueChange={(value) => setRegistrationEditAppointmentTime(value === '__none__' ? '' : value)}
                    >
                      <SelectTrigger className="mt-1 bg-white">
                        <SelectValue placeholder="Sélectionner une heure" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Aucune heure</SelectItem>
                        {editingRegistrationTimeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type="time"
                      value={registrationEditAppointmentTime}
                      onChange={(event) => setRegistrationEditAppointmentTime(event.target.value)}
                      className="mt-1 bg-white"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setRegistrationEditDialogOpen(false);
              setEditingRegistration(null);
            }}>
              Annuler
            </Button>
            <Button className="bg-[#1E73BE] hover:bg-[#1557A0]" onClick={handleSaveEditedRegistration} disabled={!editingRegistration || countIncompleteAidItems(registrationEditAidItems) > 0}>
              Enregistrer la modification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={registrationDialogOpen} onOpenChange={setRegistrationDialogOpen}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[92vh] overflow-hidden flex flex-col" aria-describedby="event-registration-description">
          <DialogHeader>
            <DialogTitle>Gérer les inscriptions</DialogTitle>
            <DialogDescription id="event-registration-description">
              Sélectionnez les bénéficiaires à relier à {selectedEvent?.nom || 'cet événement'}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden">
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <Label>Recherche bénéficiaire</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-[#666666]" />
                  <Input
                    value={registrationSearch}
                    onChange={(event) => setRegistrationSearch(event.target.value)}
                    className="pl-9"
                    placeholder="Nom, dossier, téléphone ou email"
                  />
                </div>
              </div>
              <div className="text-sm text-[#666666]">
                {selectedBeneficiaryIds.length} bénéficiaire(s) sélectionné(s)
                {selectedEventRemainingSlots !== null ? ` • ${selectedEventRemainingSlots} place(s) restante(s)` : ''}
                {selectedEvent?.reservationIntervalMinutes ? ` • Intervalle ${selectedEvent.reservationIntervalMinutes} min` : ''}
              </div>
            </div>

            <div className="rounded-xl border overflow-y-auto max-h-[62vh]">
              {availableBeneficiaries.length > 0 ? availableBeneficiaries.map((beneficiary) => {
                const checked = selectedBeneficiaryIds.includes(beneficiary.id);
                const existingRegistration = registrationsForSelectedEventMap.get(beneficiary.id);
                const currentStatus = registrationStatuses[beneficiary.id] || existingRegistration?.statut || 'inscrit';
                const currentAidItems = registrationAidItems[beneficiary.id] || getAidItemsFromRegistration(existingRegistration);
                const incompleteAidItemsCount = countIncompleteAidItems(currentAidItems);
                const currentAppointmentDate = registrationAppointmentDates[beneficiary.id] || '';
                const currentAppointmentTime = registrationAppointmentTimes[beneficiary.id] || '';
                const availableDatesForBeneficiary = getAvailableDatesForBeneficiary(beneficiary.id);
                const normalizedAppointmentDate = currentAppointmentDate && availableDatesForBeneficiary.includes(currentAppointmentDate)
                  ? currentAppointmentDate
                  : '__none__';
                const availableTimeSlotsForBeneficiary = normalizedAppointmentDate !== '__none__'
                  ? getAvailableTimeSlotsForBeneficiary(beneficiary.id, normalizedAppointmentDate)
                  : [];
                const normalizedAppointmentTime = currentAppointmentTime && availableTimeSlotsForBeneficiary.includes(currentAppointmentTime)
                  ? currentAppointmentTime
                  : '__none__';

                return (
                  <label key={beneficiary.id} className="flex items-start gap-3 border-b p-4 hover:bg-[#FAFAFA] cursor-pointer">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => toggleBeneficiarySelection(beneficiary.id, Boolean(value))}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-[#333333]">{beneficiary.nom}</p>
                        <Badge className={beneficiary.statut === 'actif' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'} variant="outline">
                          {beneficiary.statut === 'actif' ? 'Actif' : 'Inactif'}
                        </Badge>
                        {checked && (
                          <Badge className={getStatusBadgeClass(currentStatus)} variant="outline">
                            {getStatusLabel(currentStatus)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-[#666666] mt-1">{beneficiary.id} • {beneficiary.telephone || 'Sans téléphone'} • {beneficiary.email || 'Sans email'}</p>
                      <p className="text-sm text-[#666666]">{beneficiary.ville || 'Ville non renseignée'} • {beneficiary.nombrePersonnes} personne(s)</p>
                      {checked && (
                        <div className="mt-3 grid max-w-[720px] gap-3 sm:grid-cols-2 lg:grid-cols-4" onClick={(event) => event.stopPropagation()}>
                          <div>
                            <Label className="text-xs text-[#666666]">Statut de l'inscription</Label>
                            <Select
                              value={currentStatus}
                              onValueChange={(value) => handleRegistrationStatusChange(beneficiary.id, value as ComptoirSpecialEventRegistration['statut'])}
                            >
                              <SelectTrigger className="mt-1 bg-white">
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
                            <Label className="text-xs text-[#666666]">Jour de la cita</Label>
                            <Select
                              value={normalizedAppointmentDate}
                              onValueChange={(value) => handleRegistrationAppointmentDateChange(beneficiary.id, value === '__none__' ? '' : value)}
                            >
                              <SelectTrigger className="mt-1 bg-white">
                                <SelectValue placeholder="Sélectionner un jour" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none__">Aucune date</SelectItem>
                                {availableDatesForBeneficiary.map((availableDate) => (
                                  <SelectItem key={availableDate} value={availableDate}>{formatDateLabel(availableDate)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs text-[#666666]">Heure de la cita</Label>
                            {selectedEventTimeSlots.length > 0 ? (
                              <Select
                                value={normalizedAppointmentTime}
                                onValueChange={(value) => handleRegistrationAppointmentTimeChange(beneficiary.id, value === '__none__' ? '' : value)}
                              >
                                <SelectTrigger className="mt-1 bg-white">
                                  <SelectValue placeholder="Sélectionner une heure" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="__none__">Aucune heure</SelectItem>
                                  {availableTimeSlotsForBeneficiary.map((slot) => (
                                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                type="time"
                                value={currentAppointmentTime}
                                onChange={(event) => handleRegistrationAppointmentTimeChange(beneficiary.id, event.target.value)}
                                className="mt-1 bg-white"
                              />
                            )}
                          </div>
                          <div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-xs text-[#666666]">Types d'aide et quantités</Label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-[11px]"
                                  onClick={() => handleRegistrationAidItemsChange(beneficiary.id, [...currentAidItems, { aidTypeId: '', quantity: 1 }])}
                                >
                                  + Ajouter
                                </Button>
                              </div>

                              {currentAidItems.length > 0 ? currentAidItems.map((aidItem, aidItemIndex) => (
                                <div key={`${beneficiary.id}-aid-${aidItemIndex}`} className="grid grid-cols-[1fr_80px_auto] gap-2">
                                  <Select
                                    value={aidItem.aidTypeId || '__none__'}
                                    onValueChange={(value) => {
                                      const nextItems = [...currentAidItems];
                                      nextItems[aidItemIndex] = {
                                        ...nextItems[aidItemIndex],
                                        aidTypeId: value === '__none__' ? '' : value,
                                      };
                                      handleRegistrationAidItemsChange(beneficiary.id, nextItems);
                                    }}
                                  >
                                    <SelectTrigger className="h-8 bg-white text-xs">
                                      <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="__none__">Aucun</SelectItem>
                                      {availableAidTypes.map((aidType) => (
                                        <SelectItem key={aidType.id} value={aidType.id}>{aidType.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  <Input
                                    type="number"
                                    min="1"
                                    value={String(aidItem.quantity)}
                                    onChange={(event) => {
                                      const nextItems = [...currentAidItems];
                                      nextItems[aidItemIndex] = {
                                        ...nextItems[aidItemIndex],
                                        quantity: Number.parseInt(event.target.value || '1', 10) || 1,
                                      };
                                      handleRegistrationAidItemsChange(beneficiary.id, nextItems);
                                    }}
                                    className="h-8 text-xs"
                                  />

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 text-[11px] text-red-600 hover:text-red-700"
                                    onClick={() => handleRegistrationAidItemsChange(
                                      beneficiary.id,
                                      currentAidItems.filter((_, index) => index !== aidItemIndex)
                                    )}
                                  >
                                    Suppr.
                                  </Button>
                                </div>
                              )) : (
                                <p className="text-[11px] text-[#666666]">Aucun type sélectionné.</p>
                              )}
                              {incompleteAidItemsCount > 0 && (
                                <p className="text-[11px] text-[#DC3545]">Sélectionnez un type pour chaque ligne ajoutée.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                );
              }) : (
                <div className="p-6 text-center text-sm text-[#666666]">
                  Aucun bénéficiaire disponible pour cette recherche.
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRegistrationDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="bg-[#4CAF50] hover:bg-[#449B48]" onClick={handleSaveRegistrations} disabled={hasIncompleteAidRowsInSelection}>
              Enregistrer les inscriptions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
