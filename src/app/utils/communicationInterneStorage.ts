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

const STORAGE_KEY_MESSAGES = 'communication_interne_messages';
const STORAGE_KEY_NOTIFICATIONS = 'communication_interne_notifications';

// ==================== MESSAGES ====================

export function obtenirMessages(): Message[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY_MESSAGES);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors du parsing des messages:', error);
    return [];
  }
}

function sauvegarderMessages(messages: Message[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
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
  const filtered = messages.filter(m => m.id !== messageId);
  
  if (filtered.length === messages.length) return false;
  
  sauvegarderMessages(filtered);
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
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors du parsing des notifications:', error);
    return [];
  }
}

function sauvegarderNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
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