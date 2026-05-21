/**
 * Système de Communication Interne entre Départements
 * Gestion des messages, demandes, documents et notifications
 */

export type TypeMessage = 'message' | 'demande' | 'document' | 'alerte' | 'annonce';
export type StatutDemande = 'en_attente' | 'en_cours' | 'completee' | 'rejetee' | 'annulee';
export type PrioriteDemande = 'basse' | 'normale' | 'haute' | 'urgente';
export type TypeDemande = 
  | 'transfert_inventaire' 
  | 'transport' 
  | 'approbation' 
  | 'information' 
  | 'support_technique'
  | 'ressources_humaines'
  | 'finance'
  | 'demande_volontaire'
  | 'autre';

// Import des départements existants du système
import { obtenerDepartamentos, type Departamento } from './departamentosStorage';
import {
  eliminarAdjuntosMessagerie,
  esReferenciaAdjuntoMessagerie,
} from './messagerieAttachmentIndexedDb';

export interface PieceJointe {
  id: string;
  nom: string;
  taille: number;
  type: string;
  url: string;
}

export interface Notification {
  id: string;
  messageId: string;
  departementId: string;
  type: 'nouveau_message' | 'changement_statut' | 'reponse';
  lu: boolean;
  dateCreation: string;
}

export interface Message {
  id: string;
  type: TypeMessage;
  departementEmetteur: string;
  departementDestinataire: string;
  expediteur: string; // nom de l'utilisateur
  expediteurId: string;
  sujet: string;
  contenu: string;
  piecesJointes: PieceJointe[];
  
  // Pour les demandes
  typeDemande?: TypeDemande;
  priorite?: PrioriteDemande;
  statut?: StatutDemande;
  dateEcheance?: string;
  
  // Pour les demandes de volontaires
  nombreVolontaires?: number;
  competencesRequises?: string;
  dureeEstimee?: string;
  dateDebut?: string;
  
  // Métadonnées
  lu: boolean;
  archive: boolean;
  important: boolean;
  
  // Réponse
  messageParentId?: string; // si c'est une réponse
  reponses: string[]; // IDs des réponses
  
  dateCreation: string;
  dateModification: string;
  dateLecture?: string;
}

export interface MessageDraft {
  id: string;
  departementId: string;
  ownerUserId: string;
  ownerName: string;
  type: TypeMessage;
  departementDestinataire: string;
  departementDestinataires: string[];
  isGroupMessage: boolean;
  sujet: string;
  contenu: string;
  typeDemande?: TypeDemande;
  priorite?: PrioriteDemande;
  dateEcheance?: string;
  piecesJointes: PieceJointe[];
  updatedAt: string;
}

export interface MessageTemplate {
  id: string;
  departementId: string;
  nom: string;
  description?: string;
  type: TypeMessage;
  sujet: string;
  contenu: string;
  isGroupMessage: boolean;
  typeDemande?: TypeDemande;
  priorite?: PrioriteDemande;
  createdBy: string;
  updatedAt: string;
  usageCount: number;
}

export interface PresenceMessagerie {
  userId: string;
  userName: string;
  role: string;
  departementId: string;
  status: 'online' | 'away';
  lastSeen: string;
}

const STORAGE_KEY_MESSAGES = 'communication_interne_messages';
const STORAGE_KEY_NOTIFICATIONS = 'communication_interne_notifications';
const STORAGE_KEY_DRAFTS = 'communication_interne_drafts';
const STORAGE_KEY_TEMPLATES = 'communication_interne_templates';
const STORAGE_KEY_PRESENCE = 'communication_interne_presence';
const STORAGE_KEY_SIGNAL = 'communication_interne_signal';

export const COMMUNICATION_INTERNE_EVENT = 'communication-interne:updated';

function lireStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  const data = localStorage.getItem(key);
  if (!data) return fallback;

  try {
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Erreur lors du parsing du stockage ${key}:`, error);
    return fallback;
  }
}

function ecrireStorage<T>(key: string, value: T, scope: string): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(key, JSON.stringify(value));

  const payload = {
    scope,
    updatedAt: new Date().toISOString(),
  };

  window.dispatchEvent(new CustomEvent(COMMUNICATION_INTERNE_EVENT, { detail: payload }));
  localStorage.setItem(STORAGE_KEY_SIGNAL, JSON.stringify(payload));
}

function extraerReferenciasAdjuntos(piecesJointes: PieceJointe[] = []): string[] {
  return piecesJointes
    .map((piece) => piece.url)
    .filter((url): url is string => esReferenciaAdjuntoMessagerie(url));
}

function obtenirReferenciasAdjuntosMessages(messages: Message[]): string[] {
  return messages.flatMap((message) => extraerReferenciasAdjuntos(message.piecesJointes));
}

function obtenirReferenciasAdjuntosDrafts(drafts: MessageDraft[]): string[] {
  return drafts.flatMap((draft) => extraerReferenciasAdjuntos(draft.piecesJointes));
}

function nettoyerAdjuntosOrphelins(candidateRefs: string[], options?: { excludeMessageIds?: string[]; excludeDraftIds?: string[] }): void {
  const uniqueCandidateRefs = Array.from(new Set(candidateRefs.filter((ref) => esReferenciaAdjuntoMessagerie(ref))));

  if (uniqueCandidateRefs.length === 0) {
    return;
  }

  const excludeMessageIds = new Set(options?.excludeMessageIds || []);
  const excludeDraftIds = new Set(options?.excludeDraftIds || []);
  const remainingMessages = obtenirMessages().filter((message) => !excludeMessageIds.has(message.id));
  const remainingDrafts = obtenirBrouillonsMessagerie().filter((draft) => !excludeDraftIds.has(draft.id));
  const stillUsedRefs = new Set([
    ...obtenirReferenciasAdjuntosMessages(remainingMessages),
    ...obtenirReferenciasAdjuntosDrafts(remainingDrafts),
  ]);
  const refsToDelete = uniqueCandidateRefs.filter((ref) => !stillUsedRefs.has(ref));

  if (refsToDelete.length === 0) {
    return;
  }

  void eliminarAdjuntosMessagerie(refsToDelete).catch((error) => {
    console.error('Erreur lors du nettoyage des pièces jointes de messagerie:', error);
  });
}

function supprimerNotificationsPourMessages(messageIds: string[]): void {
  if (messageIds.length === 0) {
    return;
  }

  const notifications = obtenirNotifications();
  const filtered = notifications.filter((notification) => !messageIds.includes(notification.messageId));

  if (filtered.length !== notifications.length) {
    sauvegarderNotifications(filtered);
  }
}

// ==================== MESSAGES ====================

export function obtenirMessages(): Message[] {
  return lireStorage<Message[]>(STORAGE_KEY_MESSAGES, []);
}

function sauvegarderMessages(messages: Message[]): void {
  ecrireStorage(STORAGE_KEY_MESSAGES, messages, 'messages');
}

export function envoyerMessage(
  message: Omit<Message, 'id' | 'dateCreation' | 'dateModification' | 'reponses' | 'lu' | 'archive'>
): Message {
  const messages = obtenirMessages();
  
  const nouveauMessage: Message = {
    ...message,
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    reponses: [],
    lu: false,
    archive: false,
    dateCreation: new Date().toISOString(),
    dateModification: new Date().toISOString()
  };
  
  messages.push(nouveauMessage);
  sauvegarderMessages(messages);
  
  // Créer une notification pour le destinataire
  creerNotification({
    messageId: nouveauMessage.id,
    departementId: nouveauMessage.departementDestinataire,
    type: 'nouveau_message',
    lu: false
  });
  
  return nouveauMessage;
}

export function repondreMessage(
  messageParentId: string,
  reponse: Omit<Message, 'id' | 'dateCreation' | 'dateModification' | 'reponses' | 'lu' | 'archive' | 'messageParentId'>
): Message | null {
  const messages = obtenirMessages();
  const messageParent = messages.find(m => m.id === messageParentId);
  
  if (!messageParent) return null;
  
  const nouvelleReponse: Message = {
    ...reponse,
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    messageParentId,
    reponses: [],
    lu: false,
    archive: false,
    dateCreation: new Date().toISOString(),
    dateModification: new Date().toISOString()
  };
  
  messages.push(nouvelleReponse);
  messageParent.reponses.push(nouvelleReponse.id);
  
  sauvegarderMessages(messages);
  
  // Notifier le destinataire
  creerNotification({
    messageId: nouvelleReponse.id,
    departementId: nouvelleReponse.departementDestinataire,
    type: 'reponse',
    lu: false
  });
  
  return nouvelleReponse;
}

export function marquerCommeLu(messageId: string): boolean {
  const messages = obtenirMessages();
  const message = messages.find(m => m.id === messageId);
  
  if (!message) return false;
  
  message.lu = true;
  message.dateLecture = new Date().toISOString();
  sauvegarderMessages(messages);
  return true;
}

export function archiverMessage(messageId: string): boolean {
  const messages = obtenirMessages();
  const message = messages.find(m => m.id === messageId);
  
  if (!message) return false;
  
  message.archive = true;
  sauvegarderMessages(messages);
  return true;
}

export function marquerImportant(messageId: string, important: boolean): boolean {
  const messages = obtenirMessages();
  const message = messages.find(m => m.id === messageId);
  
  if (!message) return false;
  
  message.important = important;
  sauvegarderMessages(messages);
  return true;
}

export function modifierStatutDemande(messageId: string, nouveauStatut: StatutDemande): boolean {
  const messages = obtenirMessages();
  const message = messages.find(m => m.id === messageId);
  
  if (!message || message.type !== 'demande') return false;
  
  message.statut = nouveauStatut;
  message.dateModification = new Date().toISOString();
  sauvegarderMessages(messages);
  
  // Notifier le changement de statut
  creerNotification({
    messageId: message.id,
    departementId: message.departementEmetteur,
    type: 'changement_statut',
    lu: false
  });
  
  return true;
}

export function supprimerMessage(messageId: string): boolean {
  const messages = obtenirMessages();
  const messageToDelete = messages.find((message) => message.id === messageId);

  if (!messageToDelete) return false;

  const filtered = messages.filter(m => m.id !== messageId);

  filtered.forEach((message) => {
    if (message.reponses.includes(messageId)) {
      message.reponses = message.reponses.filter((replyId) => replyId !== messageId);
    }
  });
  
  sauvegarderMessages(filtered);
  supprimerNotificationsPourMessages([messageId]);
  nettoyerAdjuntosOrphelins(extraerReferenciasAdjuntos(messageToDelete.piecesJointes), { excludeMessageIds: [messageId] });
  return true;
}

export function obtenirMessagesParDepartement(departementId: string, type?: 'envoyes' | 'recus'): Message[] {
  const messages = obtenirMessages();
  
  if (type === 'envoyes') {
    return messages.filter(m => m.departementEmetteur === departementId && !m.archive);
  } else if (type === 'recus') {
    return messages.filter(m => m.departementDestinataire === departementId && !m.archive);
  }
  
  return messages.filter(
    m => (m.departementEmetteur === departementId || m.departementDestinataire === departementId) && !m.archive
  );
}

export function obtenirMessagesNonLus(departementId: string): Message[] {
  const messages = obtenirMessages();
  return messages.filter(m => m.departementDestinataire === departementId && !m.lu && !m.archive);
}

export function rechercherMessages(query: string, departementId?: string): Message[] {
  const messages = obtenirMessages();
  const queryLower = query.toLowerCase();
  
  let filtered = messages.filter(m => 
    m.sujet.toLowerCase().includes(queryLower) ||
    m.contenu.toLowerCase().includes(queryLower) ||
    m.expediteur.toLowerCase().includes(queryLower)
  );
  
  if (departementId) {
    filtered = filtered.filter(
      m => m.departementEmetteur === departementId || m.departementDestinataire === departementId
    );
  }
  
  return filtered;
}

// ==================== NOTIFICATIONS ====================

export function obtenirNotifications(): Notification[] {
  return lireStorage<Notification[]>(STORAGE_KEY_NOTIFICATIONS, []);
}

function sauvegarderNotifications(notifications: Notification[]): void {
  ecrireStorage(STORAGE_KEY_NOTIFICATIONS, notifications, 'notifications');
}

export function creerNotification(
  notif: Omit<Notification, 'id' | 'dateCreation'>
): Notification {
  const notifications = obtenirNotifications();
  
  const nouvelleNotif: Notification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
    dateCreation: new Date().toISOString()
  };
  
  notifications.push(nouvelleNotif);
  sauvegarderNotifications(notifications);
  return nouvelleNotif;
}

export function marquerNotificationLue(notifId: string): boolean {
  const notifications = obtenirNotifications();
  const notif = notifications.find(n => n.id === notifId);
  
  if (!notif) return false;
  
  notif.lu = true;
  sauvegarderNotifications(notifications);
  return true;
}

export function marquerToutesNotificationsLues(departementId: string): boolean {
  const notifications = obtenirNotifications();
  let modified = false;
  
  notifications.forEach(n => {
    if (n.departementId === departementId && !n.lu) {
      n.lu = true;
      modified = true;
    }
  });
  
  if (modified) {
    sauvegarderNotifications(notifications);
  }
  
  return modified;
}

export function obtenirNotificationsNonLues(departementId: string): Notification[] {
  const notifications = obtenirNotifications();
  return notifications.filter(n => n.departementId === departementId && !n.lu);
}

export function supprimerNotification(notifId: string): boolean {
  const notifications = obtenirNotifications();
  const filtered = notifications.filter(n => n.id !== notifId);
  
  if (filtered.length === notifications.length) return false;
  
  sauvegarderNotifications(filtered);
  return true;
}

// ==================== STATISTIQUES ====================

export function obtenirStatistiquesDepartement(departementId: string) {
  const messages = obtenirMessages();
  const departement = obtenerDepartamentos().find(d => d.id === departementId);
  
  if (!departement) return null;
  
  const messagesRecus = messages.filter(m => m.departementDestinataire === departementId);
  const messagesEnvoyes = messages.filter(m => m.departementEmetteur === departementId);
  const messagesNonLus = messagesRecus.filter(m => !m.lu);
  
  const demandes = messages.filter(m => 
    (m.departementDestinataire === departementId || m.departementEmetteur === departementId) &&
    m.type === 'demande'
  );
  
  return {
    departement: departement.nombre,
    totalMessagesRecus: messagesRecus.length,
    totalMessagesEnvoyes: messagesEnvoyes.length,
    messagesNonLus: messagesNonLus.length,
    totalDemandes: demandes.length,
    demandesEnAttente: demandes.filter(d => d.statut === 'en_attente').length,
    demandesEnCours: demandes.filter(d => d.statut === 'en_cours').length,
    demandesCompletees: demandes.filter(d => d.statut === 'completee').length,
    demandesRejetees: demandes.filter(d => d.statut === 'rejetee').length,
    demandesUrgentes: demandes.filter(d => d.priorite === 'urgente').length
  };
}

// ==================== BROUILLONS ====================

export function obtenirBrouillonsMessagerie(departementId?: string, ownerUserId?: string): MessageDraft[] {
  const drafts = lireStorage<MessageDraft[]>(STORAGE_KEY_DRAFTS, []);

  return drafts.filter((draft) => {
    if (departementId && draft.departementId !== departementId) return false;
    if (ownerUserId && draft.ownerUserId !== ownerUserId) return false;
    return true;
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function sauvegarderBrouillonMessagerie(
  draft: Omit<MessageDraft, 'id' | 'updatedAt'> & { id?: string }
): MessageDraft {
  const drafts = lireStorage<MessageDraft[]>(STORAGE_KEY_DRAFTS, []);
  const previousDraft = draft.id ? drafts.find((entry) => entry.id === draft.id) : undefined;
  const draftToSave: MessageDraft = {
    ...draft,
    id: draft.id || `draft-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    updatedAt: new Date().toISOString(),
  };

  const index = drafts.findIndex((entry) => entry.id === draftToSave.id);
  if (index >= 0) {
    drafts[index] = draftToSave;
  } else {
    drafts.unshift(draftToSave);
  }

  ecrireStorage(STORAGE_KEY_DRAFTS, drafts, 'drafts');

  if (previousDraft) {
    const nextDraftRefs = new Set(extraerReferenciasAdjuntos(draftToSave.piecesJointes));
    const removedRefs = extraerReferenciasAdjuntos(previousDraft.piecesJointes).filter((ref) => !nextDraftRefs.has(ref));
    nettoyerAdjuntosOrphelins(removedRefs, { excludeDraftIds: [draftToSave.id] });
  }

  return draftToSave;
}

export function supprimerBrouillonMessagerie(draftId: string): boolean {
  const drafts = lireStorage<MessageDraft[]>(STORAGE_KEY_DRAFTS, []);
  const draftToDelete = drafts.find((draft) => draft.id === draftId);
  const filtered = drafts.filter((draft) => draft.id !== draftId);

  if (filtered.length === drafts.length) return false;

  ecrireStorage(STORAGE_KEY_DRAFTS, filtered, 'drafts');

  if (draftToDelete) {
    nettoyerAdjuntosOrphelins(extraerReferenciasAdjuntos(draftToDelete.piecesJointes), { excludeDraftIds: [draftId] });
  }

  return true;
}

// ==================== TEMPLATES ====================

export function obtenirTemplatesMessagerie(departementId?: string): MessageTemplate[] {
  const templates = lireStorage<MessageTemplate[]>(STORAGE_KEY_TEMPLATES, []);

  return templates.filter((template) => !departementId || template.departementId === departementId)
    .sort((a, b) => {
      if (b.usageCount !== a.usageCount) return b.usageCount - a.usageCount;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
}

export function sauvegarderTemplateMessagerie(
  template: Omit<MessageTemplate, 'id' | 'updatedAt' | 'usageCount'> & { id?: string; usageCount?: number }
): MessageTemplate {
  const templates = lireStorage<MessageTemplate[]>(STORAGE_KEY_TEMPLATES, []);
  const templateToSave: MessageTemplate = {
    ...template,
    id: template.id || `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    updatedAt: new Date().toISOString(),
    usageCount: template.usageCount || 0,
  };

  const index = templates.findIndex((entry) => entry.id === templateToSave.id);
  if (index >= 0) {
    templates[index] = templateToSave;
  } else {
    templates.unshift(templateToSave);
  }

  ecrireStorage(STORAGE_KEY_TEMPLATES, templates, 'templates');
  return templateToSave;
}

export function incrementerUsageTemplateMessagerie(templateId: string): boolean {
  const templates = lireStorage<MessageTemplate[]>(STORAGE_KEY_TEMPLATES, []);
  const template = templates.find((entry) => entry.id === templateId);

  if (!template) return false;

  template.usageCount += 1;
  template.updatedAt = new Date().toISOString();
  ecrireStorage(STORAGE_KEY_TEMPLATES, templates, 'templates');
  return true;
}

export function supprimerTemplateMessagerie(templateId: string): boolean {
  const templates = lireStorage<MessageTemplate[]>(STORAGE_KEY_TEMPLATES, []);
  const filtered = templates.filter((template) => template.id !== templateId);

  if (filtered.length === templates.length) return false;

  ecrireStorage(STORAGE_KEY_TEMPLATES, filtered, 'templates');
  return true;
}

// ==================== PRESENCE ====================

export function obtenirPresencesMessagerie(departementId?: string): PresenceMessagerie[] {
  nettoyerPresencesMessagerie();
  const presences = lireStorage<PresenceMessagerie[]>(STORAGE_KEY_PRESENCE, []);

  return presences
    .filter((presence) => !departementId || presence.departementId === departementId)
    .sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());
}

export function enregistrerPresenceMessagerie(
  presence: Omit<PresenceMessagerie, 'lastSeen'> & { lastSeen?: string }
): PresenceMessagerie {
  const presences = lireStorage<PresenceMessagerie[]>(STORAGE_KEY_PRESENCE, []);
  const payload: PresenceMessagerie = {
    ...presence,
    lastSeen: presence.lastSeen || new Date().toISOString(),
  };

  const index = presences.findIndex((entry) => entry.userId === payload.userId);
  if (index >= 0) {
    presences[index] = payload;
  } else {
    presences.push(payload);
  }

  ecrireStorage(STORAGE_KEY_PRESENCE, presences, 'presence');
  return payload;
}

export function nettoyerPresencesMessagerie(timeoutMs: number = 120000): PresenceMessagerie[] {
  const presences = lireStorage<PresenceMessagerie[]>(STORAGE_KEY_PRESENCE, []);
  const now = Date.now();
  const filtered = presences.filter((presence) => now - new Date(presence.lastSeen).getTime() <= timeoutMs);

  if (filtered.length !== presences.length) {
    ecrireStorage(STORAGE_KEY_PRESENCE, filtered, 'presence');
  }

  return filtered;
}