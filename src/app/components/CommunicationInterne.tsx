import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { copiarAlPortapapeles } from '../utils/clipboard';
import { GuiaCommunicationInterne } from './GuiaCommunicationInterne';
import { GuiaCompletaApp } from './GuiaCompletaApp';
import { GuideCompletModules } from './GuideCompletModules';
import { TextareaSpellCheck } from './ui/textarea-spell-check';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Send, 
  Inbox, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Star,
  Archive,
  Search,
  Filter,
  Paperclip,
  Download,
  Trash2,
  ArrowLeft,
  Users,
  TrendingUp,
  Bell,
  X,
  MessageSquare,
  Plus,
  UserPlus,
  HelpCircle,
  Sparkles,
  Smile,
  ThumbsUp,
  Heart,
  Laugh,
  Pin,
  Moon,
  Sun,
  Link2,
  Mic,
  Image,
  Video,
  BarChart3,
  Hash,
  CheckCheck,
  Reply,
  Forward,
  Copy,
  Edit2,
  MoreVertical,
  Zap,
  BookOpen
} from 'lucide-react';
import { 
  Message,
  PieceJointe,
  MessageDraft,
  MessageTemplate,
  PresenceMessagerie,
  TypeMessage,
  StatutDemande,
  PrioriteDemande,
  TypeDemande,
  COMMUNICATION_INTERNE_EVENT,
  obtenirMessages,
  envoyerMessage,
  repondreMessage,
  marquerCommeLu,
  archiverMessage,
  marquerImportant,
  modifierStatutDemande,
  supprimerMessage,
  obtenirMessagesParDepartement,
  obtenirMessagesNonLus,
  rechercherMessages,
  obtenirNotificationsNonLues,
  marquerNotificationLue,
  marquerToutesNotificationsLues,
  obtenirStatistiquesDepartement,
  obtenirBrouillonsMessagerie,
  sauvegarderBrouillonMessagerie,
  supprimerBrouillonMessagerie,
  obtenirTemplatesMessagerie,
  sauvegarderTemplateMessagerie,
  supprimerTemplateMessagerie,
  incrementerUsageTemplateMessagerie,
  obtenirPresencesMessagerie,
  enregistrerPresenceMessagerie
} from '../utils/communicationInterneStorage';
import { obtenerDepartamentos, type Departamento } from '../utils/departamentosStorage';
import { obtenerInfoUsuarioConPermisos, obtenerNombreRol } from '../utils/permisos';
import { ReactionPicker, MessageReactions } from './chat/ReactionPicker';
import { TypingIndicator, TypingIndicatorCompact } from './chat/TypingIndicator';
import { MessageActions, QuickReplyButton } from './chat/MessageActions';
import { PollCreator, PollView } from './chat/PollCreator';

type Vue = 'liste' | 'detail' | 'nouveau' | 'repondre' | 'statistiques';
type Filtre = 'tous' | 'recus' | 'envoyes' | 'non_lus' | 'importants' | 'demandes' | 'archives' | 'epingles';
type Reaction = '👍' | '❤️' | '😂' | '⭐' | '⚡' | '✅' | '🎉' | '🔥';

interface ExtendedMessage extends Message {
  reactions?: Record<string, string[]>;
  pinned?: boolean;
  poll?: any;
  edited?: boolean;
  editedAt?: string;
}

interface MessagingAccessProfile {
  canCompose: boolean;
  canUseAttachments: boolean;
  canUseGroupMessages: boolean;
  canManageStatus: boolean;
  canViewStats: boolean;
  canManageTemplates: boolean;
  canDeleteAny: boolean;
  allowedRecipientIds: string[];
  restrictionNotice?: string;
}

function createEmptyFormData() {
  return {
    type: 'message' as TypeMessage,
    departementDestinataire: '',
    departementDestinataires: [] as string[],
    isGroupMessage: false,
    sujet: '',
    contenu: '',
    typeDemande: 'information' as TypeDemande,
    priorite: 'normale' as PrioriteDemande,
    dateEcheance: ''
  };
}

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
  return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
}

function formatPresenceLabel(date: string): string {
  const elapsedMs = Date.now() - new Date(date).getTime();
  const elapsedMinutes = Math.max(0, Math.round(elapsedMs / 60000));

  if (elapsedMinutes <= 1) return 'À l’instant';
  if (elapsedMinutes < 60) return `Il y a ${elapsedMinutes} min`;

  const elapsedHours = Math.round(elapsedMinutes / 60);
  if (elapsedHours < 24) return `Il y a ${elapsedHours} h`;

  return new Date(date).toLocaleDateString('fr-CA');
}

function buildMessagingAccessProfile(
  userInfo: ReturnType<typeof obtenerInfoUsuarioConPermisos>,
  departments: Departamento[],
  currentDepartmentId: string
): MessagingAccessProfile {
  const availableRecipients = departments.filter(
    department => department.activo && department.id !== currentDepartmentId
  );

  if (!userInfo) {
    return {
      canCompose: false,
      canUseAttachments: false,
      canUseGroupMessages: false,
      canManageStatus: false,
      canViewStats: false,
      canManageTemplates: false,
      canDeleteAny: false,
      allowedRecipientIds: [],
      restrictionNotice: 'Une session active est requise pour utiliser la messagerie.'
    };
  }

  const permissions = new Set(userInfo.permisosExpandidos || []);
  const hasAny = (...values: string[]) => values.some(value => permissions.has(value));
  const isFullAccess = Boolean(userInfo.esDesarrollador || userInfo.esAdministrador || permissions.has('acceso_total'));
  const canCompose = !userInfo.soloLectura && !hasAny('visualizador', 'usuario');
  const canUseGroupMessages = isFullAccess || hasAny(
    'coordinador',
    'administrador_liaison',
    'liaison_organisme',
    'responsable_entrepot',
    'responsable_comptoir',
    'responsable_transport'
  );
  const canManageStatus = isFullAccess || hasAny(
    'coordinador',
    'administrador_liaison',
    'responsable_entrepot',
    'responsable_comptoir',
    'responsable_transport'
  );
  const canViewStats = isFullAccess || hasAny('coordinador', 'administrador_liaison', 'liaison_organisme');
  const canDeleteAny = isFullAccess || hasAny('coordinador');
  const canManageTemplates = canCompose && (isFullAccess || hasAny(
    'coordinador',
    'administrador_liaison',
    'liaison_organisme',
    'responsable_entrepot',
    'responsable_comptoir',
    'responsable_transport',
    'employe'
  ));

  let allowedRecipientIds = availableRecipients.map(department => department.id);

  if (!isFullAccess && hasAny('employe')) {
    const priorityCodes = new Set(['RECRUTEMENT', 'LIAISON', 'COORDINATION']);
    const restrictedRecipients = availableRecipients.filter(department =>
      priorityCodes.has((department.codigo || '').toUpperCase())
    );

    if (restrictedRecipients.length > 0) {
      allowedRecipientIds = restrictedRecipients.map(department => department.id);
    }
  }

  if (!canCompose) {
    allowedRecipientIds = [];
  }

  let restrictionNotice: string | undefined;
  if (!canCompose) {
    restrictionNotice = 'Votre rôle dispose actuellement d’un accès en consultation.';
  } else if (!canUseGroupMessages) {
    restrictionNotice = 'Les envois groupés sont réservés à la coordination et aux responsables autorisés.';
  }

  return {
    canCompose,
    canUseAttachments: canCompose,
    canUseGroupMessages,
    canManageStatus,
    canViewStats,
    canManageTemplates,
    canDeleteAny,
    allowedRecipientIds,
    restrictionNotice,
  };
}

export function CommunicationInterne() {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [departements, setDepartements] = useState<Departamento[]>([]);
  const [departementActuel, setDepartementActuel] = useState<string>('');
  const [vue, setVue] = useState<Vue>('liste');
  const [filtre, setFiltre] = useState<Filtre>('tous');
  const [messageSelectionne, setMessageSelectionne] = useState<ExtendedMessage | null>(null);
  const [recherche, setRecherche] = useState('');
  const [notificationsNonLues, setNotificationsNonLues] = useState(0);
  const [afficherGuide, setAfficherGuide] = useState(false);
  const [afficherGuideCompleta, setAfficherGuideCompleta] = useState(false);
  const [activeTab, setActiveTab] = useState('messagerie');
  
  // Nuevos estados para funcionalidades avanzadas
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [messageReactions, setMessageReactions] = useState<Record<string, Record<string, string[]>>>({});
  const [pinnedMessages, setPinnedMessages] = useState<string[]>([]);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [usersTyping, setUsersTyping] = useState<Array<{id: string, name: string, dept: string}>>([]);
  const [composerAttachments, setComposerAttachments] = useState<PieceJointe[]>([]);
  const [savedDrafts, setSavedDrafts] = useState<MessageDraft[]>([]);
  const [departmentTemplates, setDepartmentTemplates] = useState<MessageTemplate[]>([]);
  const [presenceEntries, setPresenceEntries] = useState<PresenceMessagerie[]>([]);
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [lastRealtimeRefresh, setLastRealtimeRefresh] = useState(new Date().toISOString());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const sessionInfo = obtenerInfoUsuarioConPermisos();
  const currentUserId = sessionInfo?.id || 'user-current';
  const currentUserName = sessionInfo
    ? [sessionInfo.nombre, sessionInfo.apellido].filter(Boolean).join(' ') || sessionInfo.username || 'Utilisateur'
    : 'Utilisateur';
  const currentUserRoleLabel = sessionInfo ? obtenerNombreRol(sessionInfo.rol) : 'Utilisateur';
  const accessProfile = buildMessagingAccessProfile(sessionInfo, departements, departementActuel);
  const allowedRecipientIds = accessProfile.allowedRecipientIds;
  const allowedRecipientsKey = allowedRecipientIds.join('|');
  
  // Formulaire nouveau message
  const [formData, setFormData] = useState(createEmptyFormData());

  useEffect(() => {
    chargerDonnees();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.95 && departements.length > 0) {
        const randomDept = departements[Math.floor(Math.random() * departements.length)];
        setUsersTyping([{
          id: 'demo-user',
          name: 'Marie Dubois',
          dept: randomDept.nombre
        }]);
        setTimeout(() => setUsersTyping([]), 3000);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [departements]);

  useEffect(() => {
    if (departementActuel) {
      const notifs = obtenirNotificationsNonLues(departementActuel);
      setNotificationsNonLues(notifs.length);
    }
  }, [departementActuel, messages]);

  useEffect(() => {
    if (!departementActuel) return;

    setSavedDrafts(obtenirBrouillonsMessagerie(departementActuel, currentUserId));
    setDepartmentTemplates(obtenirTemplatesMessagerie(departementActuel));
    setPresenceEntries(obtenirPresencesMessagerie());
  }, [departementActuel, currentUserId, lastRealtimeRefresh]);

  useEffect(() => {
    const storageHandler = (event: StorageEvent) => {
      if (!event.key || event.key.startsWith('communication_interne_')) {
        chargerDonnees();
      }
    };

    const customEventHandler = () => {
      chargerDonnees();
    };

    window.addEventListener('storage', storageHandler);
    window.addEventListener(COMMUNICATION_INTERNE_EVENT, customEventHandler as EventListener);

    return () => {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener(COMMUNICATION_INTERNE_EVENT, customEventHandler as EventListener);
    };
  }, [departementActuel, currentUserId]);

  useEffect(() => {
    if (!sessionInfo || !departementActuel) return;

    const updatePresence = (status: 'online' | 'away' = document.hidden ? 'away' : 'online') => {
      enregistrerPresenceMessagerie({
        userId: currentUserId,
        userName: currentUserName,
        role: currentUserRoleLabel,
        departementId: departementActuel,
        status,
      });
      setPresenceEntries(obtenirPresencesMessagerie());
      setLastRealtimeRefresh(new Date().toISOString());
    };

    const handleVisibility = () => {
      updatePresence(document.hidden ? 'away' : 'online');
    };

    updatePresence();
    const interval = window.setInterval(() => updatePresence(), 30000);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [sessionInfo, departementActuel, currentUserId, currentUserName, currentUserRoleLabel]);

  useEffect(() => {
    if (vue !== 'nouveau' || !departementActuel || !accessProfile.canCompose) return;

    const hasDraftContent = Boolean(
      formData.sujet.trim() ||
      formData.contenu.trim() ||
      formData.departementDestinataire ||
      formData.departementDestinataires.length ||
      composerAttachments.length
    );

    if (!hasDraftContent) return;

    const timeout = window.setTimeout(() => {
      const savedDraft = sauvegarderBrouillonMessagerie({
        id: activeDraftId || undefined,
        departementId: departementActuel,
        ownerUserId: currentUserId,
        ownerName: currentUserName,
        type: formData.type,
        departementDestinataire: formData.departementDestinataire,
        departementDestinataires: formData.departementDestinataires,
        isGroupMessage: formData.isGroupMessage,
        sujet: formData.sujet,
        contenu: formData.contenu,
        typeDemande: formData.typeDemande,
        priorite: formData.priorite,
        dateEcheance: formData.dateEcheance || undefined,
        piecesJointes: composerAttachments,
      });

      setActiveDraftId(savedDraft.id);
      setSavedDrafts(obtenirBrouillonsMessagerie(departementActuel, currentUserId));
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [vue, formData, composerAttachments, departementActuel, currentUserId, currentUserName, activeDraftId, accessProfile.canCompose]);

  useEffect(() => {
    if (!formData.departementDestinataire && formData.departementDestinataires.length === 0 && !formData.isGroupMessage) {
      return;
    }

    if (!accessProfile.canUseGroupMessages && formData.isGroupMessage) {
      setFormData(previous => ({
        ...previous,
        isGroupMessage: false,
        departementDestinataires: [],
      }));
      return;
    }

    if (formData.departementDestinataire && !allowedRecipientIds.includes(formData.departementDestinataire)) {
      setFormData(previous => ({ ...previous, departementDestinataire: '' }));
    }

    if (formData.departementDestinataires.length > 0) {
      const filteredRecipients = formData.departementDestinataires.filter(id => allowedRecipientIds.includes(id));
      if (filteredRecipients.length !== formData.departementDestinataires.length) {
        setFormData(previous => ({ ...previous, departementDestinataires: filteredRecipients }));
      }
    }
  }, [allowedRecipientsKey, accessProfile.canUseGroupMessages, formData.departementDestinataire, formData.departementDestinataires, formData.isGroupMessage]);

  const chargerDonnees = () => {
    const msgs = obtenirMessages() as ExtendedMessage[];
    const depts = obtenerDepartamentos();
    const nextDepartmentId = departementActuel || depts.find(d => d.activo)?.id || '';
    
    // Cargar reacciones y mensajes fijados del localStorage
    const storedReactions = localStorage.getItem('message-reactions');
    const storedPinned = localStorage.getItem('pinned-messages');
    
    if (storedReactions) {
      setMessageReactions(JSON.parse(storedReactions));
    }
    if (storedPinned) {
      setPinnedMessages(JSON.parse(storedPinned));
    }
    
    setMessages(msgs);
    setDepartements(depts);
    setSavedDrafts(nextDepartmentId ? obtenirBrouillonsMessagerie(nextDepartmentId, currentUserId) : []);
    setDepartmentTemplates(nextDepartmentId ? obtenirTemplatesMessagerie(nextDepartmentId) : []);
    setPresenceEntries(obtenirPresencesMessagerie());
    setLastRealtimeRefresh(new Date().toISOString());
    
    if (nextDepartmentId && !departementActuel) {
      setDepartementActuel(nextDepartmentId);
    }
  };

  const obtenirMessagesFiltres = (): ExtendedMessage[] => {
    if (!departementActuel) return [];
    
    let filtered = messages;
    
    if (recherche) {
      filtered = rechercherMessages(recherche, departementActuel) as ExtendedMessage[];
    } else {
      switch (filtre) {
        case 'recus':
          filtered = messages.filter(m => m.departementDestinataire === departementActuel && !m.archive);
          break;
        case 'envoyes':
          filtered = messages.filter(m => m.departementEmetteur === departementActuel && !m.archive);
          break;
        case 'non_lus':
          filtered = obtenirMessagesNonLus(departementActuel) as ExtendedMessage[];
          break;
        case 'importants':
          filtered = messages.filter(m => 
            (m.departementDestinataire === departementActuel || m.departementEmetteur === departementActuel) && 
            m.important && 
            !m.archive
          );
          break;
        case 'demandes':
          filtered = messages.filter(m => 
            (m.departementDestinataire === departementActuel || m.departementEmetteur === departementActuel) && 
            m.type === 'demande' && 
            !m.archive
          );
          break;
        case 'archives':
          filtered = messages.filter(m => 
            (m.departementDestinataire === departementActuel || m.departementEmetteur === departementActuel) && 
            m.archive
          );
          break;
        case 'epingles':
          filtered = messages.filter(m => 
            (m.departementDestinataire === departementActuel || m.departementEmetteur === departementActuel) && 
            pinnedMessages.includes(m.id)
          );
          break;
        default:
          filtered = messages.filter(m => 
            (m.departementDestinataire === departementActuel || m.departementEmetteur === departementActuel) && 
            !m.archive
          );
      }
    }
    
    // Ordenar: primero los fijados, luego por fecha
    return filtered.sort((a, b) => {
      const aPinned = pinnedMessages.includes(a.id);
      const bPinned = pinnedMessages.includes(b.id);
      
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      
      return new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime();
    });
  };

  const handleEnvoyerMessage = () => {
    if (!accessProfile.canCompose) {
      toast.error(accessProfile.restrictionNotice || 'Votre rôle ne permet pas l’envoi de messages.');
      return;
    }

    if (formData.isGroupMessage && !accessProfile.canUseGroupMessages) {
      toast.error('Les messages de groupe nécessitent un niveau d’autorisation supérieur.');
      return;
    }

    const hasDestinataire = formData.isGroupMessage 
      ? formData.departementDestinataires.length > 0 
      : formData.departementDestinataire;

    const recipients = formData.isGroupMessage
      ? formData.departementDestinataires.filter(destId => allowedRecipientIds.includes(destId))
      : formData.departementDestinataire && allowedRecipientIds.includes(formData.departementDestinataire)
        ? [formData.departementDestinataire]
        : [];
    
    if (!hasDestinataire || recipients.length === 0 || !formData.sujet || !formData.contenu) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    const deptActuel = departements.find(d => d.id === departementActuel);
    if (!deptActuel) return;
    const expediteurNom = currentUserName || `Responsable ${deptActuel.nombre}`;
    
    if (formData.isGroupMessage) {
      recipients.forEach(destId => {
        envoyerMessage({
          type: formData.type,
          departementEmetteur: departementActuel,
          departementDestinataire: destId,
          expediteur: expediteurNom,
          expediteurId: currentUserId,
          sujet: `[GROUPE] ${formData.sujet}`,
          contenu: formData.contenu,
          piecesJointes: composerAttachments,
          typeDemande: formData.type === 'demande' ? formData.typeDemande : undefined,
          priorite: formData.type === 'demande' ? formData.priorite : undefined,
          statut: formData.type === 'demande' ? 'en_attente' : undefined,
          dateEcheance: formData.dateEcheance || undefined,
          important: false
        });
      });
      toast.success(`Message envoyé à ${recipients.length} département(s)`);
    } else {
      envoyerMessage({
        type: formData.type,
        departementEmetteur: departementActuel,
        departementDestinataire: recipients[0],
        expediteur: expediteurNom,
        expediteurId: currentUserId,
        sujet: formData.sujet,
        contenu: formData.contenu,
        piecesJointes: composerAttachments,
        typeDemande: formData.type === 'demande' ? formData.typeDemande : undefined,
        priorite: formData.type === 'demande' ? formData.priorite : undefined,
        statut: formData.type === 'demande' ? 'en_attente' : undefined,
        dateEcheance: formData.dateEcheance || undefined,
        important: false
      });
      toast.success('Message envoyé avec succès');
    }

    if (activeDraftId) {
      supprimerBrouillonMessagerie(activeDraftId);
      setActiveDraftId(null);
    }
    
    chargerDonnees();
    setVue('liste');
    setComposerAttachments([]);
    setTemplateName('');
    setFormData(createEmptyFormData());
  };

  const handleRepondre = () => {
    if (!accessProfile.canCompose) {
      toast.error(accessProfile.restrictionNotice || 'Votre rôle ne permet pas l’envoi de réponses.');
      return;
    }

    if (!messageSelectionne || !formData.contenu) {
      toast.error('Veuillez saisir un message');
      return;
    }
    
    const deptActuel = departements.find(d => d.id === departementActuel);
    if (!deptActuel) return;
    
    repondreMessage(messageSelectionne.id, {
      type: 'message',
      departementEmetteur: departementActuel,
      departementDestinataire: messageSelectionne.departementEmetteur,
      expediteur: currentUserName || `Responsable ${deptActuel.nombre}`,
      expediteurId: currentUserId,
      sujet: `RE: ${messageSelectionne.sujet}`,
      contenu: formData.contenu,
      piecesJointes: composerAttachments,
      important: false
    });
    
    chargerDonnees();
    setVue('detail');
    setFormData({ ...formData, contenu: '' });
    setComposerAttachments([]);
    toast.success('Réponse envoyée');
  };

  const handleMarquerLu = (msg: ExtendedMessage) => {
    marquerCommeLu(msg.id);
    chargerDonnees();
  };

  const handleArchiver = (msg: ExtendedMessage) => {
    archiverMessage(msg.id);
    chargerDonnees();
    toast.success('Message archivé');
  };

  const handleMarquerImportant = (msg: ExtendedMessage) => {
    marquerImportant(msg.id, !msg.important);
    chargerDonnees();
    toast.success(msg.important ? 'Retiré des importants' : 'Marqué comme important');
  };

  const handleChangerStatut = (msg: ExtendedMessage, statut: StatutDemande) => {
    if (!accessProfile.canManageStatus) {
      toast.error('La modification de statut est réservée aux rôles de coordination et de supervision.');
      return;
    }

    modifierStatutDemande(msg.id, statut);
    chargerDonnees();
    toast.success(`Statut modifié: ${statut}`);
  };

  const handleSupprimer = (msg: ExtendedMessage) => {
    if (!accessProfile.canDeleteAny && msg.expediteurId !== currentUserId) {
      toast.error('Vous pouvez supprimer uniquement vos propres messages.');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      supprimerMessage(msg.id);
      chargerDonnees();
      setVue('liste');
      toast.success('Message supprimé');
    }
  };

  // Nuevos handlers para funcionalidades avanzadas
  const handleReaction = (messageId: string, emoji: Reaction) => {
    const newReactions = { ...messageReactions };
    
    if (!newReactions[messageId]) {
      newReactions[messageId] = {};
    }
    
    if (!newReactions[messageId][emoji]) {
      newReactions[messageId][emoji] = [];
    }
    
    const userIndex = newReactions[messageId][emoji].indexOf(currentUserId);
    
    if (userIndex > -1) {
      // Quitar reacción
      newReactions[messageId][emoji].splice(userIndex, 1);
      if (newReactions[messageId][emoji].length === 0) {
        delete newReactions[messageId][emoji];
      }
    } else {
      // Agregar reacción
      newReactions[messageId][emoji].push(currentUserId);
    }
    
    setMessageReactions(newReactions);
    localStorage.setItem('message-reactions', JSON.stringify(newReactions));
    setShowReactionPicker(null);
  };

  const handleTogglePin = (messageId: string) => {
    const newPinned = pinnedMessages.includes(messageId)
      ? pinnedMessages.filter(id => id !== messageId)
      : [...pinnedMessages, messageId];
    
    setPinnedMessages(newPinned);
    localStorage.setItem('pinned-messages', JSON.stringify(newPinned));
    toast.success(pinnedMessages.includes(messageId) ? 'Message détaché' : 'Message épinglé');
  };

  const handleCopyMessage = (content: string) => {
    copiarAlPortapapeles(content);
    toast.success('Message copié dans le presse-papiers');
  };

  const handleCreatePoll = (poll: any) => {
    if (!accessProfile.canCompose) {
      toast.error(accessProfile.restrictionNotice || 'Votre rôle ne permet pas la création de sondages.');
      return;
    }

    if (!formData.departementDestinataire || !allowedRecipientIds.includes(formData.departementDestinataire) || !formData.sujet) {
      toast.error('Veuillez remplir le destinataire et le sujet');
      return;
    }
    
    const deptActuel = departements.find(d => d.id === departementActuel);
    if (!deptActuel) return;
    
    const pollMessage: any = {
      type: 'message',
      departementEmetteur: departementActuel,
      departementDestinataire: formData.departementDestinataire,
      expediteur: currentUserName || `Responsable ${deptActuel.nombre}`,
      expediteurId: currentUserId,
      sujet: formData.sujet,
      contenu: `📊 Sondage: ${poll.question}`,
      piecesJointes: composerAttachments,
      important: false,
      poll: poll
    };
    
    envoyerMessage(pollMessage);
    chargerDonnees();
    setShowPollCreator(false);
    setVue('liste');
    setComposerAttachments([]);
    setTemplateName('');
    setFormData(createEmptyFormData());
    
    toast.success('Sondage créé et envoyé');
  };

  const handleOpenReply = (msg: ExtendedMessage) => {
    setMessageSelectionne(msg);
    setComposerAttachments([]);
    setFormData(previous => ({ ...previous, contenu: '' }));
    setVue('repondre');
  };

  const handleDownloadAttachment = (piece: PieceJointe) => {
    const link = document.createElement('a');
    link.href = piece.url;
    link.download = piece.nom;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const lireFichierEnDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Lecture de fichier impossible'));
    reader.readAsDataURL(file);
  });

  const handleAttachmentSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';

    if (!files.length) return;

    if (!accessProfile.canUseAttachments) {
      toast.error('Les pièces jointes ne sont pas disponibles pour ce rôle.');
      return;
    }

    const nextAttachments: PieceJointe[] = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} dépasse la limite de 5 Mo.`);
        continue;
      }

      const url = await lireFichierEnDataUrl(file);
      nextAttachments.push({
        id: `attachment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        nom: file.name,
        taille: file.size,
        type: file.type || 'application/octet-stream',
        url,
      });
    }

    if (nextAttachments.length > 0) {
      setComposerAttachments(previous => [...previous, ...nextAttachments].slice(0, 6));
      toast.success(`${nextAttachments.length} pièce(s) jointe(s) ajoutée(s)`);
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setComposerAttachments(previous => previous.filter(attachment => attachment.id !== attachmentId));
  };

  const handleSaveDraftNow = () => {
    if (!departementActuel || !accessProfile.canCompose) {
      toast.error(accessProfile.restrictionNotice || 'Impossible de sauvegarder ce brouillon.');
      return;
    }

    if (!formData.sujet.trim() && !formData.contenu.trim() && composerAttachments.length === 0) {
      toast.error('Ajoutez au moins un sujet, un contenu ou une pièce jointe avant de sauvegarder.');
      return;
    }

    const savedDraft = sauvegarderBrouillonMessagerie({
      id: activeDraftId || undefined,
      departementId: departementActuel,
      ownerUserId: currentUserId,
      ownerName: currentUserName,
      type: formData.type,
      departementDestinataire: formData.departementDestinataire,
      departementDestinataires: formData.departementDestinataires,
      isGroupMessage: formData.isGroupMessage,
      sujet: formData.sujet,
      contenu: formData.contenu,
      typeDemande: formData.typeDemande,
      priorite: formData.priorite,
      dateEcheance: formData.dateEcheance || undefined,
      piecesJointes: composerAttachments,
    });

    setActiveDraftId(savedDraft.id);
    setSavedDrafts(obtenirBrouillonsMessagerie(departementActuel, currentUserId));
    toast.success('Brouillon sauvegardé');
  };

  const handleLoadDraft = (draft: MessageDraft) => {
    setActiveDraftId(draft.id);
    setComposerAttachments(draft.piecesJointes || []);
    setFormData({
      type: draft.type,
      departementDestinataire: draft.departementDestinataire,
      departementDestinataires: draft.departementDestinataires,
      isGroupMessage: draft.isGroupMessage,
      sujet: draft.sujet,
      contenu: draft.contenu,
      typeDemande: draft.typeDemande || 'information',
      priorite: draft.priorite || 'normale',
      dateEcheance: draft.dateEcheance || '',
    });
    setVue('nouveau');
    toast.success('Brouillon chargé');
  };

  const handleDeleteDraft = (draftId: string) => {
    supprimerBrouillonMessagerie(draftId);
    if (activeDraftId === draftId) {
      setActiveDraftId(null);
    }
    setSavedDrafts(obtenirBrouillonsMessagerie(departementActuel, currentUserId));
    toast.success('Brouillon supprimé');
  };

  const handleSaveTemplate = () => {
    if (!departementActuel || !accessProfile.canManageTemplates) {
      toast.error('Seuls les rôles autorisés peuvent enregistrer des modèles de département.');
      return;
    }

    if (!templateName.trim() || !formData.sujet.trim() || !formData.contenu.trim()) {
      toast.error('Renseignez un nom de modèle, un sujet et un contenu.');
      return;
    }

    sauvegarderTemplateMessagerie({
      departementId: departementActuel,
      nom: templateName.trim(),
      description: `${messageTypeMeta[formData.type].label} prêt à l’emploi`,
      type: formData.type,
      sujet: formData.sujet,
      contenu: formData.contenu,
      isGroupMessage: formData.isGroupMessage,
      typeDemande: formData.type === 'demande' ? formData.typeDemande : undefined,
      priorite: formData.type === 'demande' ? formData.priorite : undefined,
      createdBy: currentUserName,
    });

    setTemplateName('');
    setDepartmentTemplates(obtenirTemplatesMessagerie(departementActuel));
    toast.success('Modèle enregistré pour ce département');
  };

  const handleApplyTemplate = (template: MessageTemplate) => {
    setFormData(previous => ({
      ...previous,
      type: template.type,
      sujet: template.sujet,
      contenu: template.contenu,
      isGroupMessage: template.isGroupMessage && accessProfile.canUseGroupMessages,
      typeDemande: template.typeDemande || 'information',
      priorite: template.priorite || 'normale',
    }));
    incrementerUsageTemplateMessagerie(template.id);
    setDepartmentTemplates(obtenirTemplatesMessagerie(departementActuel));
    toast.success(`Modèle « ${template.nom} » appliqué`);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (!accessProfile.canManageTemplates) {
      toast.error('Suppression réservée aux rôles autorisés.');
      return;
    }

    supprimerTemplateMessagerie(templateId);
    setDepartmentTemplates(obtenirTemplatesMessagerie(departementActuel));
    toast.success('Modèle supprimé');
  };

  const getIconeType = (type: TypeMessage) => {
    switch (type) {
      case 'message': return <MessageSquare className="w-4 h-4" />;
      case 'demande': return <FileText className="w-4 h-4" />;
      case 'document': return <Paperclip className="w-4 h-4" />;
      case 'alerte': return <AlertCircle className="w-4 h-4" />;
      case 'annonce': return <Bell className="w-4 h-4" />;
    }
  };

  const getIconeStatut = (statut?: StatutDemande) => {
    switch (statut) {
      case 'en_attente': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'en_cours': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'completee': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejetee': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'annulee': return <X className="w-4 h-4 text-gray-500" />;
      default: return null;
    }
  };

  const getPrioriteColor = (priorite?: PrioriteDemande) => {
    switch (priorite) {
      case 'urgente': return 'bg-red-100 text-red-700 border-red-300';
      case 'haute': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'normale': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'basse': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const stats = departementActuel ? obtenirStatistiquesDepartement(departementActuel) : null;
  const departementCourant = departements.find(d => d.id === departementActuel);
  const messagesDepartement = departementActuel
    ? messages.filter(m => m.departementDestinataire === departementActuel || m.departementEmetteur === departementActuel)
    : [];
  const messagesFiltres = obtenirMessagesFiltres();
  const nonLusCount = departementActuel ? obtenirMessagesNonLus(departementActuel).length : 0;
  const demandesCount = messagesDepartement.filter(m => m.type === 'demande' && !m.archive).length;
  const importantsCount = messagesDepartement.filter(m => m.important && !m.archive).length;
  const archivesCount = messagesDepartement.filter(m => m.archive).length;
  const epinglesCount = messagesDepartement.filter(m => pinnedMessages.includes(m.id)).length;
  const messagesRecusCount = messages.filter(m => m.departementDestinataire === departementActuel && !m.archive).length;
  const messagesEnvoyesCount = messages.filter(m => m.departementEmetteur === departementActuel && !m.archive).length;
  const orderedMessagesDepartement = messagesDepartement
    .slice()
    .sort((left, right) => new Date(right.dateCreation).getTime() - new Date(left.dateCreation).getTime());
  const demandesOuvertes = orderedMessagesDepartement.filter(message =>
    message.type === 'demande' && !['completee', 'rejetee', 'annulee'].includes(message.statut || '')
  );
  const messagesRecents = orderedMessagesDepartement.filter(message => !message.archive).slice(0, 4);
  const spotlightMessages = orderedMessagesDepartement
    .filter(message => !message.archive && (message.important || !message.lu || pinnedMessages.includes(message.id)))
    .slice(0, 3);
  const availableRecipients = departements.filter(
    department => department.activo && department.id !== departementActuel && allowedRecipientIds.includes(department.id)
  );
  const departmentPresence = presenceEntries.filter(entry => entry.departementId === departementActuel);
  const activePresenceCount = presenceEntries.filter(entry => entry.status === 'online').length;
  const permissionBadges = [
    accessProfile.canCompose ? 'Écriture' : 'Lecture',
    accessProfile.canUseGroupMessages ? 'Groupe' : 'Individuel',
    accessProfile.canManageStatus ? 'Suivi' : 'Consultation',
  ];
  const tauxLecture = messagesDepartement.length > 0
    ? Math.max(0, Math.min(100, Math.round(((messagesDepartement.length - nonLusCount) / messagesDepartement.length) * 100)))
    : 100;
  const resetFormData = (overrides?: Partial<typeof formData>) => {
    setFormData({
      ...createEmptyFormData(),
      ...overrides
    });
  };
  const resetComposer = (overrides?: Partial<typeof formData>) => {
    setActiveDraftId(null);
    setTemplateName('');
    setComposerAttachments([]);
    resetFormData(overrides);
  };
  const ouvrirVueTravail = (target: Extract<Vue, 'liste' | 'nouveau' | 'statistiques'>) => {
    if (target === 'nouveau') {
      setShowPollCreator(false);
      resetComposer();
    }

    setVue(target);
  };
  const selectedDestCount = formData.isGroupMessage
    ? formData.departementDestinataires.length
    : formData.departementDestinataire
      ? 1
      : 0;
  const messageTypeMeta: Record<TypeMessage, { label: string; description: string; accent: string; icon: React.ReactNode }> = {
    message: {
      label: 'Message',
      description: 'Échange rapide entre équipes.',
      accent: 'border-slate-200 bg-slate-50 text-slate-700',
      icon: <MessageSquare className="h-4 w-4" />,
    },
    demande: {
      label: 'Demande',
      description: 'Suivi avec priorité et échéance.',
      accent: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      icon: <FileText className="h-4 w-4" />,
    },
    document: {
      label: 'Document',
      description: 'Partage d’un support ou d’une pièce jointe.',
      accent: 'border-blue-200 bg-blue-50 text-blue-700',
      icon: <Paperclip className="h-4 w-4" />,
    },
    alerte: {
      label: 'Alerte',
      description: 'Signalement immédiat pour un sujet sensible.',
      accent: 'border-rose-200 bg-rose-50 text-rose-700',
      icon: <AlertCircle className="h-4 w-4" />,
    },
    annonce: {
      label: 'Annonce',
      description: 'Communication officielle à portée large.',
      accent: 'border-violet-200 bg-violet-50 text-violet-700',
      icon: <Bell className="h-4 w-4" />,
    },
  };
  const quickDraftPresets: Array<{
    id: string;
    label: string;
    description: string;
    type: TypeMessage;
    sujet: string;
    contenu: string;
    isGroupMessage?: boolean;
    typeDemande?: TypeDemande;
    priorite?: PrioriteDemande;
  }> = [
    {
      id: 'handoff',
      label: 'Passation',
      description: 'Résumé clair d’un dossier à transmettre.',
      type: 'message',
      sujet: 'Passation de dossier',
      contenu: 'Bonjour,\n\nVoici le point de situation :\n- éléments finalisés\n- sujets en attente\n- prochaine action attendue\n\nMerci de me confirmer la prise en charge.',
    },
    {
      id: 'incident',
      label: 'Incident',
      description: 'Alerte concise avec niveau d’urgence.',
      type: 'alerte',
      sujet: 'Signalement prioritaire',
      contenu: 'Bonjour,\n\nUn incident nécessite une attention immédiate.\n- impact observé\n- périmètre concerné\n- action attendue\n\nMerci de traiter ce point dès que possible.',
    },
    {
      id: 'volunteer-request',
      label: 'Volontaires',
      description: 'Demande standardisée au recrutement.',
      type: 'demande',
      typeDemande: 'demande_volontaire',
      priorite: 'haute',
      sujet: 'Renfort bénévole demandé',
      contenu: 'Bonjour,\n\nNous avons besoin d’un renfort bénévole pour couvrir une plage opérationnelle.\n- créneau souhaité\n- nombre de bénévoles\n- tâches prévues\n\nMerci de confirmer la disponibilité.',
    },
    {
      id: 'group-note',
      label: 'Info groupe',
      description: 'Note simple pour plusieurs départements.',
      type: 'annonce',
      isGroupMessage: true,
      sujet: 'Information de coordination',
      contenu: 'Bonjour à toutes et à tous,\n\nMerci de prendre connaissance de cette information de coordination.\n- contexte\n- changement attendu\n- date d’application\n\nN’hésitez pas à répondre si une validation est nécessaire.',
    },
  ];
  const appliquerBrouillonRapide = (preset: typeof quickDraftPresets[number]) => {
    setShowPollCreator(false);
    setVue('nouveau');
    setActiveDraftId(null);
    setComposerAttachments([]);
    resetFormData({
      type: preset.type,
      sujet: preset.sujet,
      contenu: preset.contenu,
      isGroupMessage: (preset.isGroupMessage || false) && accessProfile.canUseGroupMessages,
      departementDestinataire: '',
      departementDestinataires: [],
      typeDemande: preset.typeDemande || 'information',
      priorite: preset.priorite || 'normale',
    });
    toast.success(`Brouillon « ${preset.label} » prêt à compléter`);
  };
  const draftChecks = [
    { label: 'Type défini', ready: Boolean(formData.type) },
    { label: 'Destinataire choisi', ready: selectedDestCount > 0 },
    { label: 'Sujet renseigné', ready: formData.sujet.trim().length >= 4 },
    { label: 'Message structuré', ready: formData.contenu.trim().length >= 30 },
  ];
  const draftCompletion = Math.round((draftChecks.filter(check => check.ready).length / draftChecks.length) * 100);
  const workspaceShortcuts: Array<{
    id: Extract<Vue, 'liste' | 'nouveau' | 'statistiques'>;
    label: string;
    description: string;
    badge: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'liste',
      label: 'Boîte de réception',
      description: 'Traiter les messages et demandes en cours.',
      badge: `${messagesFiltres.length}`,
      icon: <Inbox className="h-4 w-4" />,
    },
    {
      id: 'nouveau',
      label: 'Rédiger',
      description: 'Composer un message clair et professionnel.',
      badge: selectedDestCount > 0 ? `${selectedDestCount}` : 'Nouveau',
      icon: <Edit2 className="h-4 w-4" />,
    },
    {
      id: 'statistiques',
      label: 'Pilotage',
      description: 'Lire la charge, les urgences et la réactivité.',
      badge: `${tauxLecture}%`,
      icon: <BarChart3 className="h-4 w-4" />,
    },
  ];
  const filterOptions: Array<{ id: Filtre; label: string; icon: React.ReactNode; count?: number; tone: string }> = [
    {
      id: 'tous',
      label: 'Tous les messages',
      icon: <Inbox className="w-4 h-4" />,
      count: messagesDepartement.length,
      tone: 'from-slate-50 to-slate-100 text-slate-700 border-slate-200'
    },
    {
      id: 'recus',
      label: 'Reçus',
      icon: <Inbox className="w-4 h-4" />,
      count: messages.filter(m => m.departementDestinataire === departementActuel && !m.archive).length,
      tone: 'from-blue-50 to-indigo-50 text-blue-700 border-blue-200'
    },
    {
      id: 'envoyes',
      label: 'Envoyés',
      icon: <Send className="w-4 h-4" />,
      count: messages.filter(m => m.departementEmetteur === departementActuel && !m.archive).length,
      tone: 'from-emerald-50 to-green-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'non_lus',
      label: 'Non lus',
      icon: <Bell className="w-4 h-4" />,
      count: nonLusCount,
      tone: 'from-rose-50 to-red-50 text-red-700 border-red-200'
    },
    {
      id: 'importants',
      label: 'Importants',
      icon: <Star className="w-4 h-4" />,
      count: importantsCount,
      tone: 'from-amber-50 to-yellow-50 text-amber-700 border-amber-200'
    },
    {
      id: 'demandes',
      label: 'Demandes',
      icon: <FileText className="w-4 h-4" />,
      count: demandesCount,
      tone: 'from-violet-50 to-purple-50 text-violet-700 border-violet-200'
    },
    {
      id: 'epingles',
      label: 'Épinglés',
      icon: <Pin className="w-4 h-4" />,
      count: epinglesCount,
      tone: 'from-fuchsia-50 to-pink-50 text-fuchsia-700 border-fuchsia-200'
    },
    {
      id: 'archives',
      label: 'Archives',
      icon: <Archive className="w-4 h-4" />,
      count: archivesCount,
      tone: 'from-zinc-50 to-slate-50 text-slate-700 border-slate-200'
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#eef3f8]">
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,_rgba(15,45,71,0.16),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(45,149,97,0.18),_transparent_26%),linear-gradient(180deg,_#f7fafc_0%,_#edf3f8_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-60" style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="relative z-10 flex min-h-screen flex-col">
        <div className="px-4 py-4 md:px-6 md:py-6">
          <div className="overflow-hidden rounded-[34px] border border-white/70 bg-white/92 shadow-[0_30px_70px_-42px_rgba(15,45,71,0.32)] backdrop-blur-xl">
            <div className="p-6 lg:p-7">
              <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-slate-950 text-white shadow-lg shadow-slate-900/15">
                      <MessageSquare className="h-8 w-8" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Communication interne</p>
                      <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Centre de messagerie
                      </h1>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 md:text-[15px]">
                        Une messagerie plus simple pour lire, répondre et envoyer sans surcharge visuelle.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                      {departementCourant?.nombre || 'Aucun département'}
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                      {nonLusCount} non lu(s)
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                      {messagesRecusCount} reçus
                    </span>
                    <span className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                      {messagesEnvoyesCount} envoyés
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[minmax(220px,260px)_auto_auto] xl:min-w-[540px]">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Département actif</label>
                    <select
                      value={departementActuel}
                      onChange={(e) => setDepartementActuel(e.target.value)}
                      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a4d7a]/20"
                    >
                      {departements.filter(d => d.activo).map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.nombre} ({dept.codigo})
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => {
                      marquerToutesNotificationsLues(departementActuel);
                      setNotificationsNonLues(0);
                      toast.success('Notifications marquées comme lues');
                    }}
                    className="h-12 rounded-2xl border-slate-300 bg-white text-slate-700"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Tout lire
                    {notificationsNonLues > 0 && (
                      <span className="ml-2 rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
                        {notificationsNonLues}
                      </span>
                    )}
                  </Button>

                  <Button
                    onClick={() => ouvrirVueTravail('nouveau')}
                    disabled={!accessProfile.canCompose}
                    className="h-12 rounded-2xl bg-slate-950 hover:bg-slate-800"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau message
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200/80 px-4 pb-4 pt-3 md:px-6 md:pb-6">
              <TabsList className="grid h-auto w-full grid-cols-1 rounded-[24px] border border-slate-200 bg-slate-100/90 p-1.5">
                <TabsTrigger
                  value="messagerie"
                  className="rounded-[18px] px-4 py-3 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-950 data-[state=active]:shadow-sm"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messagerie
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        <TabsContent value="messagerie" className="relative m-0 flex flex-1 flex-col overflow-hidden">
          {afficherGuide && <GuideCompletModules onClose={() => setAfficherGuide(false)} />}
          {afficherGuideCompleta && <GuiaCompletaApp onClose={() => setAfficherGuideCompleta(false)} />}

          {usersTyping.length > 0 && (
            <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform">
              {usersTyping.length === 1 ? (
                <TypingIndicator userName={usersTyping[0].name} departmentName={usersTyping[0].dept} />
              ) : (
                <TypingIndicatorCompact count={usersTyping.length} />
              )}
            </div>
          )}

          <div className="flex-1 overflow-hidden px-3 pb-3 md:px-4 md:pb-4">
            {vue === 'liste' && (
              <div className="grid h-full grid-cols-1 gap-4 xl:grid-cols-[248px_minmax(0,1fr)]">
                <aside className="min-h-0 space-y-3 xl:overflow-y-auto">
                  <div className="rounded-[28px] border border-white/70 bg-white/94 p-4 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bureau actif</p>
                        <h3 className="mt-1.5 text-xl font-bold text-slate-950">{departementCourant?.nombre || 'Département'}</h3>
                        <p className="mt-1 text-xs text-slate-600">Vue rapide du flux en cours.</p>
                      </div>
                      <div className="rounded-xl bg-slate-100 px-2.5 py-1.5 text-right">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Code</p>
                        <p className="text-sm font-semibold text-slate-700">{departementCourant?.codigo || '--'}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      <div className="rounded-xl bg-slate-50 p-2.5">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">À lire</p>
                        <p className="mt-1.5 text-xl font-bold text-slate-900">{nonLusCount}</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50 p-2.5">
                        <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-700">Demandes</p>
                        <p className="mt-1.5 text-xl font-bold text-emerald-900">{demandesCount}</p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                        {messagesEnvoyesCount} envoyés
                      </span>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>{archivesCount} archives</span>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/70 bg-white/94 p-4 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Filtres</p>
                      <Input
                        placeholder="Rechercher"
                        value={recherche}
                        onChange={(e) => setRecherche(e.target.value)}
                        className="mt-2 h-10 rounded-xl border-slate-200 bg-white text-sm"
                      />
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {filterOptions.map(option => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setFiltre(option.id);
                            setRecherche('');
                          }}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-all ${
                            filtre === option.id
                              ? 'border-slate-900 bg-slate-950 text-white shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-semibold">{option.label}</span>
                          </span>
                          {typeof option.count === 'number' && (
                            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              filtre === option.id ? 'bg-white/12 text-white' : 'bg-slate-100 text-slate-700'
                            }`}>
                              {option.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/70 bg-white/94 p-4 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                    <div className="space-y-2.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Actions</p>
                      <Button
                        onClick={() => {
                          setVue('nouveau');
                          setShowPollCreator(false);
                          resetComposer();
                        }}
                        className="h-10 w-full rounded-xl bg-slate-950 text-sm hover:bg-slate-800"
                        disabled={!accessProfile.canCompose}
                      >
                        Nouveau message
                      </Button>
                      <Button variant="outline" onClick={() => setAfficherGuide(true)} className="h-10 w-full rounded-xl border-slate-200 bg-white text-sm text-slate-700">
                        Guide du module
                      </Button>
                    </div>
                  </div>
                </aside>

                <section className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/70 bg-white/94 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                  <div className="border-b border-slate-200/80 px-4 py-4 md:px-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Boîte de travail</p>
                        <h3 className="mt-1 text-xl font-bold text-slate-950">
                          {recherche ? 'Résultats de recherche' : 'Fil principal'}
                        </h3>
                        <p className="mt-1 text-xs text-slate-600 md:text-sm">
                          {messagesFiltres.length} élément(s){recherche ? ` pour "${recherche}"` : ' dans la vue active'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                          {filtre.replace('_', ' ')}
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => setVue('statistiques')}
                          disabled={!accessProfile.canViewStats}
                          className="h-9 rounded-full border-slate-300 bg-white px-3 text-slate-700"
                        >
                          Statistiques
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-5">
                    {messagesFiltres.length === 0 ? (
                      <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50/80 px-5 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                          <Inbox className="h-7 w-7 text-slate-400" />
                        </div>
                        <h4 className="mt-4 text-lg font-semibold text-slate-950">Aucun message à afficher</h4>
                        <p className="mt-2 max-w-md text-sm text-slate-600">
                          Ajustez votre filtre, lancez une autre recherche ou créez un nouveau message depuis le panneau de gauche.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messagesFiltres.map(msg => {
                          const deptEmetteur = departements.find(d => d.id === msg.departementEmetteur);
                          const deptDest = departements.find(d => d.id === msg.departementDestinataire);
                          const isPinned = pinnedMessages.includes(msg.id);
                          const isUnread = !msg.lu && msg.departementDestinataire === departementActuel;
                          const compactMeta = [
                            msg.statut ? msg.statut.replace('_', ' ') : null,
                            isPinned ? 'Épinglé' : null,
                            msg.important ? 'Important' : null,
                            msg.piecesJointes.length > 0 ? `${msg.piecesJointes.length} fichier(s)` : null,
                            msg.reponses.length > 0 ? `${msg.reponses.length} réponse(s)` : null,
                            msg.poll ? 'Sondage' : null,
                          ].filter(Boolean);
                          const primaryMeta = compactMeta.slice(0, 2);
                          const hiddenMetaCount = Math.max(0, compactMeta.length - primaryMeta.length);

                          return (
                            <article
                              key={msg.id}
                              className={`group relative overflow-hidden rounded-[22px] border px-3 py-2.5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                                isUnread
                                  ? 'border-l-[6px] border-l-[#1a4d7a] border-r-slate-200 border-t-slate-200 border-b-slate-200 bg-blue-50/50'
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              <div className="flex flex-col gap-2.5 lg:flex-row lg:items-start lg:justify-between">
                                <div
                                  onClick={() => {
                                    setMessageSelectionne(msg);
                                    setVue('detail');
                                    if (isUnread) {
                                      handleMarquerLu(msg);
                                    }
                                  }}
                                  className="min-w-0 flex-1 cursor-pointer"
                                >
                                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex min-w-0 items-start gap-2">
                                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white shadow-sm">
                                        {getIconeType(msg.type)}
                                      </span>
                                      <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                                            {msg.departementEmetteur === departementActuel ? `À ${deptDest?.nombre || 'Département'}` : `De ${deptEmetteur?.nombre || 'Département'}`}
                                          </span>
                                          {isUnread && (
                                            <span className="rounded-full border border-blue-200 bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                                              Nouveau
                                            </span>
                                          )}
                                        </div>
                                        <h4 className="mt-1.5 text-[15px] font-semibold leading-tight text-slate-950">{msg.sujet}</h4>
                                      </div>
                                    </div>

                                    {msg.priorite && msg.priorite !== 'normale' && (
                                      <span className={`self-start rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${getPrioriteColor(msg.priorite)}`}>
                                        {msg.priorite}
                                      </span>
                                    )}
                                  </div>

                                  <p className="mt-1.5 line-clamp-1 text-[13px] leading-5 text-slate-600">{msg.contenu}</p>

                                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                                    <span className="font-semibold text-slate-700">{msg.expediteur}</span>
                                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                                    <span>
                                      {new Date(msg.dateCreation).toLocaleDateString('fr-CA')} à {new Date(msg.dateCreation).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {msg.edited && (
                                      <>
                                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                                        <span>Modifié</span>
                                      </>
                                    )}
                                    {primaryMeta.map((item, index) => (
                                      <React.Fragment key={`${msg.id}-meta-${index}`}>
                                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                                        <span>{item}</span>
                                      </React.Fragment>
                                    ))}
                                    {hiddenMetaCount > 0 && (
                                      <>
                                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                                        <span>+{hiddenMetaCount}</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="lg:w-[170px] lg:pl-2.5">
                                  <div className="transition-opacity lg:opacity-70 lg:group-hover:opacity-100">
                                    <MessageActions
                                      onReply={() => {
                                        handleOpenReply(msg);
                                      }}
                                      onCopy={() => handleCopyMessage(msg.contenu)}
                                      onDelete={() => handleSupprimer(msg)}
                                      onToggleStar={() => handleMarquerImportant(msg)}
                                      onTogglePin={() => handleTogglePin(msg.id)}
                                      onArchive={() => handleArchiver(msg)}
                                      onReact={() => setShowReactionPicker(msg.id)}
                                      isStarred={msg.important}
                                      isPinned={isPinned}
                                      canEdit={msg.expediteurId === currentUserId}
                                    />
                                  </div>

                                  {messageReactions[msg.id] && (
                                    <div className="mt-3">
                                      <MessageReactions
                                        reactions={messageReactions[msg.id]}
                                        onReact={(emoji) => handleReaction(msg.id, emoji)}
                                        currentUserId={currentUserId}
                                      />
                                    </div>
                                  )}

                                  {showReactionPicker === msg.id && (
                                    <div className="mt-3">
                                      <ReactionPicker
                                        onReact={(emoji) => handleReaction(msg.id, emoji)}
                                        onClose={() => setShowReactionPicker(null)}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </section>

              </div>
            )}

            {vue === 'detail' && messageSelectionne && (
              <div className="h-full overflow-y-auto">
                <div className="mx-auto grid max-w-7xl gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="space-y-5">
                    <div className="overflow-hidden rounded-[32px] border border-white/70 bg-white/94 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                      <div className="border-b border-slate-200 bg-[linear-gradient(135deg,rgba(15,45,71,0.06),rgba(45,149,97,0.05))] px-6 py-6 md:px-8">
                        <Button variant="ghost" onClick={() => setVue('liste')} className="-ml-3 mb-4 rounded-full text-slate-600">
                          <ArrowLeft className="mr-2 h-4 w-4" />
                          Retour à la liste
                        </Button>
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                                {getIconeType(messageSelectionne.type)}
                              </span>
                              {pinnedMessages.includes(messageSelectionne.id) && (
                                <span className="rounded-full border border-fuchsia-200 bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700">Épinglé</span>
                              )}
                              {messageSelectionne.important && (
                                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Important</span>
                              )}
                            </div>
                            <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-950 md:text-4xl">{messageSelectionne.sujet}</h2>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                              <span className="font-semibold text-slate-800">{messageSelectionne.expediteur}</span>
                              <span className="h-1 w-1 rounded-full bg-slate-300" />
                              <span>{departements.find(d => d.id === messageSelectionne.departementEmetteur)?.nombre}</span>
                              <span className="h-1 w-1 rounded-full bg-slate-300" />
                              <span>{new Date(messageSelectionne.dateCreation).toLocaleString('fr-CA')}</span>
                              {messageSelectionne.edited && (
                                <>
                                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                                  <span>Modifié</span>
                                </>
                              )}
                            </div>
                          </div>

                          {messageSelectionne.priorite && (
                            <span className={`self-start rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${getPrioriteColor(messageSelectionne.priorite)}`}>
                              {messageSelectionne.priorite}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="px-6 py-6 md:px-8 md:py-8">
                        {messageSelectionne.type === 'demande' && messageSelectionne.statut && (
                          <div className="rounded-[26px] border border-slate-200 bg-slate-50 p-4">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                {getIconeStatut(messageSelectionne.statut)}
                                <span>Statut: {messageSelectionne.statut.replace('_', ' ')}</span>
                              </div>

                              {messageSelectionne.departementDestinataire === departementActuel && accessProfile.canManageStatus && (
                                <select
                                  value={messageSelectionne.statut}
                                  onChange={(e) => handleChangerStatut(messageSelectionne, e.target.value as StatutDemande)}
                                  className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm"
                                >
                                  <option value="en_attente">En attente</option>
                                  <option value="en_cours">En cours</option>
                                  <option value="completee">Complétée</option>
                                  <option value="rejetee">Rejetée</option>
                                  <option value="annulee">Annulée</option>
                                </select>
                              )}
                            </div>

                            {messageSelectionne.dateEcheance && (
                              <p className="mt-3 text-sm text-slate-600">
                                Échéance: {new Date(messageSelectionne.dateEcheance).toLocaleDateString('fr-CA')}
                              </p>
                            )}
                          </div>
                        )}

                        <div className="mt-6 whitespace-pre-wrap rounded-[26px] border border-slate-200 bg-white px-5 py-5 text-[15px] leading-7 text-slate-700 shadow-sm">
                          {messageSelectionne.contenu}
                        </div>

                        {messageSelectionne.poll && (
                          <div className="mt-8">
                            <PollView
                              poll={messageSelectionne.poll}
                              onVote={() => {
                                toast.success('Vote enregistré!');
                              }}
                              currentVotes={[]}
                              totalVotes={messageSelectionne.poll.options.reduce((acc: number, opt: any) => acc + opt.votes, 0)}
                              hasVoted={false}
                            />
                          </div>
                        )}

                        <div className="mt-6 border-t border-slate-200 pt-5">
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              onClick={() => setShowReactionPicker(messageSelectionne.id)}
                              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-white"
                            >
                              <Smile className="h-4 w-4 text-slate-500" />
                              Réagir
                            </button>
                            <QuickReplyButton onClick={() => handleOpenReply(messageSelectionne)} />
                          </div>

                          {showReactionPicker === messageSelectionne.id && (
                            <div className="mt-4">
                              <ReactionPicker
                                onReact={(emoji) => handleReaction(messageSelectionne.id, emoji)}
                                onClose={() => setShowReactionPicker(null)}
                              />
                            </div>
                          )}

                          {messageReactions[messageSelectionne.id] && (
                            <div className="mt-4">
                              <MessageReactions
                                reactions={messageReactions[messageSelectionne.id]}
                                onReact={(emoji) => handleReaction(messageSelectionne.id, emoji)}
                                currentUserId={currentUserId}
                              />
                            </div>
                          )}
                        </div>

                        {messageSelectionne.piecesJointes.length > 0 && (
                          <div className="mt-6 border-t border-slate-200 pt-5">
                            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                              Pièces jointes ({messageSelectionne.piecesJointes.length})
                            </h4>
                            <div className="mt-4 grid gap-3 md:grid-cols-2">
                              {messageSelectionne.piecesJointes.map(piece => (
                                <div key={piece.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <Paperclip className="h-4 w-4 text-slate-400" />
                                    <div>
                                      <p className="text-sm font-semibold text-slate-800">{piece.nom}</p>
                                      <p className="text-xs text-slate-500">{(piece.taille / 1024).toFixed(2)} KB</p>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm" className="rounded-full" onClick={() => handleDownloadAttachment(piece)}>
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {messageSelectionne.reponses.length > 0 && (
                      <div className="rounded-[32px] border border-white/70 bg-white/94 p-6 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                        <div className="mb-5 flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-slate-950">Réponses ({messageSelectionne.reponses.length})</h3>
                          <Reply className="h-5 w-5 text-slate-400" />
                        </div>

                        <div className="space-y-4">
                          {messageSelectionne.reponses.map(reponseId => {
                            const reponse = messages.find(m => m.id === reponseId);
                            if (!reponse) return null;

                            return (
                              <div key={reponse.id} className="rounded-[26px] border border-slate-200 bg-slate-50 px-5 py-4">
                                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                                  <span className="font-semibold text-slate-800">{reponse.expediteur}</span>
                                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                                  <span>{departements.find(d => d.id === reponse.departementEmetteur)?.nombre}</span>
                                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                                  <span>{new Date(reponse.dateCreation).toLocaleString('fr-CA')}</span>
                                </div>
                                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{reponse.contenu}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <aside className="space-y-4">
                    <div className="rounded-[30px] border border-white/70 bg-white/94 p-5 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                      <h3 className="text-lg font-semibold text-slate-950">Actions</h3>
                      <div className="mt-4 space-y-3">
                        <Button onClick={() => handleOpenReply(messageSelectionne)} disabled={!accessProfile.canCompose} className="h-11 w-full rounded-2xl bg-slate-950 hover:bg-slate-800">
                          <Send className="mr-2 h-4 w-4" />
                          Répondre
                        </Button>
                        <Button variant="outline" onClick={() => handleMarquerImportant(messageSelectionne)} className="h-11 w-full rounded-2xl border-slate-300 bg-white">
                          <Star className={`mr-2 h-4 w-4 ${messageSelectionne.important ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          {messageSelectionne.important ? 'Retirer des importants' : 'Marquer important'}
                        </Button>
                        <Button variant="outline" onClick={() => handleTogglePin(messageSelectionne.id)} className="h-11 w-full rounded-2xl border-slate-300 bg-white">
                          <Pin className={`mr-2 h-4 w-4 ${pinnedMessages.includes(messageSelectionne.id) ? 'fill-fuchsia-500 text-fuchsia-500' : ''}`} />
                          {pinnedMessages.includes(messageSelectionne.id) ? 'Retirer l\'épingle' : 'Épingler'}
                        </Button>
                        <Button variant="outline" onClick={() => handleArchiver(messageSelectionne)} className="h-11 w-full rounded-2xl border-slate-300 bg-white">
                          <Archive className="mr-2 h-4 w-4" />
                          Archiver
                        </Button>
                        <Button variant="outline" onClick={() => handleSupprimer(messageSelectionne)} className="h-11 w-full rounded-2xl border-red-200 bg-white text-red-700 hover:bg-red-50">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-[30px] border border-white/70 bg-white/94 p-5 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                      <h3 className="text-lg font-semibold text-slate-950">Résumé</h3>
                      <div className="mt-4 space-y-3 text-sm text-slate-600">
                        <div className="flex items-center justify-between gap-3">
                          <span>Expéditeur</span>
                          <span className="text-right font-semibold text-slate-800">{messageSelectionne.expediteur}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span>Destination</span>
                          <span className="text-right font-semibold text-slate-800">{departements.find(d => d.id === messageSelectionne.departementDestinataire)?.nombre}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span>Réponses</span>
                          <span className="font-semibold text-slate-800">{messageSelectionne.reponses.length}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span>Pièces jointes</span>
                          <span className="font-semibold text-slate-800">{messageSelectionne.piecesJointes.length}</span>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            )}

            {vue === 'repondre' && messageSelectionne && (
              <div className="h-full overflow-y-auto">
                <div className="mx-auto grid max-w-6xl gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="rounded-[32px] border border-white/70 bg-white/94 p-6 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)] md:p-8">
                    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Réponse assistée</p>
                        <h2 className="mt-2 text-3xl font-bold text-slate-950">Répondre à {messageSelectionne.sujet}</h2>
                        <p className="mt-1 text-sm text-slate-600">La reformulation et la correction restent actives pendant la rédaction.</p>
                      </div>
                      <Button variant="ghost" onClick={() => setVue('detail')} className="self-start rounded-full text-slate-600">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <label className="text-sm font-semibold text-slate-800">Votre réponse</label>
                        <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          <Sparkles className="h-3.5 w-3.5" />
                          Correction active
                        </span>
                      </div>
                      <div className="mt-3">
                        <TextareaSpellCheck
                          value={formData.contenu}
                          onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                          rows={12}
                          placeholder="Rédigez votre réponse..."
                          language="fr"
                          showSpellCheck={true}
                        />
                      </div>
                    </div>

                    <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Pièces jointes de réponse</p>
                          <p className="mt-1 text-sm text-slate-600">Ajoutez jusqu’à 6 fichiers locaux, 5 Mo chacun.</p>
                        </div>
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-2xl border-slate-300 bg-white" disabled={!accessProfile.canUseAttachments}>
                          <Paperclip className="mr-2 h-4 w-4" />
                          Ajouter un fichier
                        </Button>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleAttachmentSelection}
                        className="hidden"
                      />

                      <div className="mt-4 space-y-3">
                        {composerAttachments.length === 0 ? (
                          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
                            Aucune pièce jointe ajoutée pour cette réponse.
                          </div>
                        ) : composerAttachments.map(attachment => (
                          <div key={attachment.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{attachment.nom}</p>
                              <p className="mt-1 text-xs text-slate-500">{formatFileSize(attachment.taille)}</p>
                            </div>
                            <button type="button" onClick={() => handleRemoveAttachment(attachment.id)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100">
                              Retirer
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <Button variant="outline" onClick={() => setVue('detail')} className="h-11 rounded-2xl border-slate-300 px-5">
                        Annuler
                      </Button>
                      <Button onClick={handleRepondre} disabled={!accessProfile.canCompose} className="h-11 rounded-2xl bg-slate-950 px-5 hover:bg-slate-800">
                        <Send className="mr-2 h-4 w-4" />
                        Envoyer la réponse
                      </Button>
                    </div>
                  </div>

                  <aside className="space-y-4">
                    <div className="rounded-[30px] border border-white/70 bg-white/94 p-5 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Contexte</p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">Message d'origine</h3>
                      <p className="mt-3 line-clamp-6 text-sm leading-6 text-slate-600">{messageSelectionne.contenu}</p>
                    </div>
                  </aside>
                </div>
              </div>
            )}

            {vue === 'nouveau' && (
              <div className="h-full overflow-y-auto">
                <div className="mx-auto max-w-5xl">
                  {showPollCreator ? (
                    <div className="rounded-[32px] border border-white/70 bg-white/94 p-4 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)] md:p-6">
                      <PollCreator
                        onCreatePoll={handleCreatePoll}
                        onCancel={() => {
                          setShowPollCreator(false);
                          setVue('liste');
                          setComposerAttachments([]);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="rounded-[32px] border border-white/70 bg-white/94 p-6 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)] md:p-8">
                      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Composition</p>
                          <h2 className="mt-2 text-3xl font-bold text-slate-950">Nouveau message</h2>
                          <p className="mt-1 text-sm text-slate-600">Un formulaire recentré sur l'essentiel pour écrire et envoyer plus vite.</p>
                          {activeDraftId && (
                            <span className="mt-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                              Brouillon synchronisé
                            </span>
                          )}
                        </div>
                        <Button variant="ghost" onClick={() => setVue('liste')} className="self-start rounded-full text-slate-600">
                          <X className="h-5 w-5" />
                        </Button>
                      </div>

                      <div className="mt-6 space-y-6">
                        {accessProfile.restrictionNotice && (
                          <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                            {accessProfile.restrictionNotice}
                          </div>
                        )}

                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Avancement</p>
                            <p className="mt-1 text-lg font-semibold text-slate-900">{draftCompletion}%</p>
                          </div>
                          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Mode</p>
                            <p className="mt-1 text-lg font-semibold text-slate-900">{formData.isGroupMessage ? 'Groupe' : 'Individuel'}</p>
                          </div>
                          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Destinataires</p>
                            <p className="mt-1 text-lg font-semibold text-slate-900">{selectedDestCount}</p>
                          </div>
                          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Fichiers</p>
                            <p className="mt-1 text-lg font-semibold text-slate-900">{composerAttachments.length}</p>
                          </div>
                        </div>

                        <div className="rounded-[28px] border border-[#d8e5f0] bg-[linear-gradient(135deg,rgba(26,77,122,0.06),rgba(45,149,97,0.08))] p-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">Départs rapides</p>
                              <p className="mt-1 text-sm text-slate-600">Choisissez une base simple puis adaptez-la.</p>
                            </div>
                            <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                              Simple et rapide
                            </span>
                          </div>

                          <div className="mt-4 grid gap-3 md:grid-cols-2">
                            {quickDraftPresets.map(preset => (
                              <button
                                key={preset.id}
                                type="button"
                                onClick={() => appliquerBrouillonRapide(preset)}
                                className={`rounded-[22px] border border-white/80 bg-white/90 p-3.5 text-left shadow-sm transition-all ${
                                  accessProfile.canCompose ? 'hover:-translate-y-0.5 hover:shadow-md' : 'opacity-60'
                                }`}
                                disabled={!accessProfile.canCompose}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-sm font-semibold text-slate-900">{preset.label}</span>
                                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${messageTypeMeta[preset.type].accent}`}>
                                    {messageTypeMeta[preset.type].label}
                                  </span>
                                </div>
                                <p className="mt-2 text-xs leading-5 text-slate-600">{preset.description}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                            <label className="mb-3 block text-sm font-semibold text-slate-800">Type de message</label>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                              {(Object.entries(messageTypeMeta) as Array<[TypeMessage, typeof messageTypeMeta[TypeMessage]]>).map(([type, meta]) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => setFormData({ ...formData, type })}
                                  disabled={!accessProfile.canCompose}
                                  className={`rounded-[22px] border px-4 py-3 text-left transition-all ${
                                    formData.type === type
                                      ? 'border-slate-900 bg-slate-950 text-white shadow-[0_20px_40px_-28px_rgba(15,23,42,0.85)]'
                                      : `${meta.accent} hover:-translate-y-0.5`
                                  }`}
                                >
                                  <div className="flex items-center gap-2 text-sm font-semibold">
                                    {meta.icon}
                                    {meta.label}
                                  </div>
                                  {formData.type === type && (
                                    <p className="mt-2 text-xs leading-5 text-slate-300">Sélectionné</p>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-2 flex items-center justify-between gap-3">
                              <label className="text-sm font-semibold text-slate-800">Mode d'envoi</label>
                              <button
                                type="button"
                                onClick={() => setFormData({
                                  ...formData,
                                  isGroupMessage: !formData.isGroupMessage,
                                  departementDestinataire: '',
                                  departementDestinataires: []
                                })}
                                disabled={!accessProfile.canUseGroupMessages}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                                  formData.isGroupMessage ? 'bg-violet-100 text-violet-700' : 'bg-white text-slate-600'
                                }`}
                              >
                                <Users className="mr-1 inline h-3.5 w-3.5" />
                                {formData.isGroupMessage ? 'Groupe' : 'Individuel'}
                              </button>
                            </div>

                            {!formData.isGroupMessage ? (
                              <select
                                value={formData.departementDestinataire}
                                onChange={(e) => setFormData({ ...formData, departementDestinataire: e.target.value })}
                                disabled={!accessProfile.canCompose}
                                className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm"
                              >
                                <option value="">Sélectionner un département</option>
                                {availableRecipients.map(dept => (
                                  <option key={dept.id} value={dept.id}>
                                    {dept.nombre} ({dept.codigo})
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className="rounded-2xl border border-violet-200 bg-white">
                                <div className="flex items-center justify-between border-b border-violet-100 px-4 py-3 text-xs font-semibold text-violet-700">
                                  <span>
                                    {formData.departementDestinataires.length > 0
                                      ? `${formData.departementDestinataires.length} département(s) sélectionné(s)`
                                      : 'Aucun département sélectionné'}
                                  </span>
                                  <div className="flex items-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const allDeptIds = availableRecipients.map(d => d.id);
                                        setFormData({ ...formData, departementDestinataires: allDeptIds });
                                      }}
                                      className="underline"
                                      disabled={!accessProfile.canUseGroupMessages}
                                    >
                                      Tout sélectionner
                                    </button>
                                    {formData.departementDestinataires.length > 0 && (
                                      <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, departementDestinataires: [] })}
                                        className="underline"
                                      >
                                        Vider
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <div className="max-h-48 space-y-2 overflow-y-auto p-3">
                                  {availableRecipients.map(dept => (
                                    <label key={dept.id} className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 hover:bg-violet-50">
                                      <input
                                        type="checkbox"
                                        checked={formData.departementDestinataires.includes(dept.id)}
                                        disabled={!accessProfile.canUseGroupMessages}
                                        onChange={(e) => {
                                          const newDestinataires = e.target.checked
                                            ? [...formData.departementDestinataires, dept.id]
                                            : formData.departementDestinataires.filter(id => id !== dept.id);
                                          setFormData({ ...formData, departementDestinataires: newDestinataires });
                                        }}
                                        className="h-4 w-4 rounded border-violet-300 text-violet-600"
                                      />
                                      <span className="text-sm font-medium text-slate-800">{dept.nombre}</span>
                                      <span className="text-xs text-slate-500">({dept.codigo})</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {formData.type === 'demande' && (
                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                              <label className="mb-2 block text-sm font-semibold text-slate-800">Type de demande</label>
                              <select
                                value={formData.typeDemande}
                                onChange={(e) => setFormData({ ...formData, typeDemande: e.target.value as TypeDemande })}
                                className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm"
                              >
                                <option value="demande_volontaire">Demande de volontaire</option>
                                <option value="transfert_inventaire">Transfert inventaire</option>
                                <option value="transport">Transport</option>
                                <option value="approbation">Approbation</option>
                                <option value="information">Information</option>
                                <option value="support_technique">Support technique</option>
                                <option value="ressources_humaines">RH</option>
                                <option value="finance">Finance</option>
                                <option value="autre">Autre</option>
                              </select>
                            </div>

                            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                              <label className="mb-2 block text-sm font-semibold text-slate-800">Priorité</label>
                              <select
                                value={formData.priorite}
                                onChange={(e) => setFormData({ ...formData, priorite: e.target.value as PrioriteDemande })}
                                className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm"
                              >
                                <option value="basse">Basse</option>
                                <option value="normale">Normale</option>
                                <option value="haute">Haute</option>
                                <option value="urgente">Urgente</option>
                              </select>
                            </div>

                            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                              <label className="mb-2 block text-sm font-semibold text-slate-800">Date d'échéance</label>
                              <Input
                                type="date"
                                value={formData.dateEcheance}
                                onChange={(e) => setFormData({ ...formData, dateEcheance: e.target.value })}
                                disabled={!accessProfile.canCompose}
                                className="h-11 rounded-2xl border-slate-300 bg-white"
                              />
                            </div>
                          </div>
                        )}

                        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                          <label className="mb-2 block text-sm font-semibold text-slate-800">Sujet</label>
                          <Input
                            value={formData.sujet}
                            onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                            disabled={!accessProfile.canCompose}
                            placeholder="Exemple : coordination, suivi, information urgente"
                            className="h-11 rounded-2xl border-slate-300 bg-white"
                          />
                        </div>

                        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <label className="text-sm font-semibold text-slate-800">Contenu du message</label>
                            <span className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                              <Sparkles className="h-3.5 w-3.5" />
                              Relecture active
                            </span>
                          </div>
                          <div className="mt-3">
                            <TextareaSpellCheck
                              value={formData.contenu}
                              onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                              rows={12}
                              placeholder="Rédigez votre message ici..."
                              language="fr"
                              showSpellCheck={true}
                              disabled={!accessProfile.canCompose}
                            />
                          </div>
                        </div>

                        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">Pièces jointes</p>
                              <p className="mt-1 text-sm text-slate-600">Ajoutez seulement les fichiers nécessaires au message.</p>
                            </div>
                            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="rounded-2xl border-slate-300 bg-white" disabled={!accessProfile.canUseAttachments}>
                              <Paperclip className="mr-2 h-4 w-4" />
                              Ajouter des fichiers
                            </Button>
                          </div>

                          <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleAttachmentSelection}
                            className="hidden"
                          />

                          <div className="mt-4 space-y-3">
                            {composerAttachments.length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
                                Aucune pièce jointe pour ce message.
                              </div>
                            ) : composerAttachments.map(attachment => (
                              <div key={attachment.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">{attachment.nom}</p>
                                  <p className="mt-1 text-xs text-slate-500">{formatFileSize(attachment.taille)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button type="button" onClick={() => handleDownloadAttachment(attachment)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100">
                                    Télécharger
                                  </button>
                                  <button type="button" onClick={() => handleRemoveAttachment(attachment.id)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100">
                                    Retirer
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 rounded-[28px] border border-violet-200 bg-violet-50 p-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-violet-900">Ajouter un sondage</p>
                            <p className="mt-1 text-sm text-violet-700">Créez une consultation rapide sans quitter la composition.</p>
                          </div>
                          <Button onClick={() => setShowPollCreator(true)} disabled={!accessProfile.canCompose} className="rounded-2xl bg-violet-700 hover:bg-violet-800">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Ouvrir le créateur
                          </Button>
                        </div>

                        <details className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                          <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">
                            Brouillons, modèles et outils avancés
                          </summary>
                          <p className="mt-2 text-sm text-slate-600">
                            Ouvrez cette section seulement si vous avez besoin de reprendre un brouillon, d'appliquer un modèle ou de vérifier les derniers contrôles.
                          </p>

                          <div className="mt-4 grid gap-4 xl:grid-cols-2">
                            <div className="space-y-4">
                              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Vérification rapide</p>
                                <div className="mt-3 space-y-2">
                                  {draftChecks.map(check => (
                                    <div key={check.label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                                      <span className="text-sm text-slate-700">{check.label}</span>
                                      <span className={`text-xs font-semibold uppercase tracking-[0.14em] ${check.ready ? 'text-emerald-700' : 'text-slate-500'}`}>
                                        {check.ready ? 'OK' : 'À faire'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Brouillons</p>
                                    <p className="mt-1 text-sm text-slate-600">{savedDrafts.length} disponible(s)</p>
                                  </div>
                                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{draftCompletion}% prêt</span>
                                </div>
                                <div className="mt-3 space-y-3">
                                  {savedDrafts.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                                      Aucun brouillon enregistré pour ce département.
                                    </div>
                                  ) : savedDrafts.slice(0, 3).map(draft => (
                                    <div key={draft.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <p className="text-sm font-semibold text-slate-900">{draft.sujet || 'Sans sujet'}</p>
                                          <p className="mt-1 text-xs text-slate-500">{formatPresenceLabel(draft.updatedAt)}</p>
                                        </div>
                                        <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-500">{draft.type}</span>
                                      </div>
                                      <div className="mt-3 flex gap-2">
                                        <button type="button" onClick={() => handleLoadDraft(draft)} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                                          Charger
                                        </button>
                                        <button type="button" onClick={() => handleDeleteDraft(draft.id)} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                                          Supprimer
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Modèles</p>
                                    <p className="mt-1 text-sm text-slate-600">Réutilisez un canevas existant</p>
                                  </div>
                                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{departmentTemplates.length}</span>
                                </div>

                                <div className="mt-4 space-y-3">
                                  <Input
                                    value={templateName}
                                    onChange={(e) => setTemplateName(e.target.value)}
                                    placeholder="Nom du modèle"
                                    disabled={!accessProfile.canManageTemplates}
                                    className="h-11 rounded-2xl border-slate-300 bg-white"
                                  />
                                  <Button type="button" variant="outline" onClick={handleSaveTemplate} disabled={!accessProfile.canManageTemplates} className="h-11 w-full rounded-2xl border-slate-300 bg-white text-slate-700">
                                    Enregistrer comme modèle
                                  </Button>

                                  {departmentTemplates.length === 0 ? (
                                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                                      Aucun modèle enregistré pour ce département.
                                    </div>
                                  ) : departmentTemplates.slice(0, 3).map(template => (
                                    <div key={template.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <p className="text-sm font-semibold text-slate-900">{template.nom}</p>
                                          <p className="mt-1 text-xs text-slate-500">{template.description}</p>
                                        </div>
                                        <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-500">{template.usageCount} usage(s)</span>
                                      </div>
                                      <div className="mt-3 flex gap-2">
                                        <button type="button" onClick={() => handleApplyTemplate(template)} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100">
                                          Appliquer
                                        </button>
                                        <button type="button" onClick={() => handleDeleteTemplate(template.id)} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100" disabled={!accessProfile.canManageTemplates}>
                                          Supprimer
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="rounded-[24px] border border-slate-200 bg-white p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Présence</p>
                                <div className="mt-2 flex items-center justify-between gap-3 text-sm text-slate-600">
                                  <span>Collaborateurs actifs sur ce canal</span>
                                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{departmentPresence.length}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </details>

                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                          <Button type="button" variant="outline" onClick={handleSaveDraftNow} disabled={!accessProfile.canCompose} className="h-11 rounded-2xl border-slate-300 px-5">
                            Sauvegarder le brouillon
                          </Button>
                          <Button variant="outline" onClick={() => setVue('liste')} className="h-11 rounded-2xl border-slate-300 px-5">
                            Annuler
                          </Button>
                          <Button onClick={handleEnvoyerMessage} disabled={!accessProfile.canCompose} className="h-11 rounded-2xl bg-slate-950 px-5 hover:bg-slate-800">
                            <Send className="mr-2 h-4 w-4" />
                            Envoyer le message
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {vue === 'statistiques' && stats && (
              <div className="h-full overflow-y-auto">
                <div className="mx-auto max-w-7xl space-y-5">
                  <div className="rounded-[32px] border border-white/70 bg-white/94 p-6 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)] md:p-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Tableau d'analyse</p>
                        <h2 className="mt-2 text-3xl font-bold text-slate-950">Statistiques de {stats.departement}</h2>
                        <p className="mt-1 text-sm text-slate-600">Une lecture plus professionnelle de la charge, de la réactivité et des demandes.</p>
                      </div>
                      <Button variant="outline" onClick={() => setVue('liste')} className="rounded-full border-slate-300 bg-white text-slate-700">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[30px] border border-white/70 bg-white/94 p-5 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                      <div className="flex items-center justify-between">
                        <Inbox className="h-8 w-8 text-[#1a4d7a]" />
                        <span className="text-3xl font-bold text-slate-950">{stats.totalMessagesRecus}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">Messages reçus</p>
                    </div>

                    <div className="rounded-[30px] border border-white/70 bg-white/94 p-5 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                      <div className="flex items-center justify-between">
                        <Send className="h-8 w-8 text-emerald-600" />
                        <span className="text-3xl font-bold text-slate-950">{stats.totalMessagesEnvoyes}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">Messages envoyés</p>
                    </div>

                    <div className="rounded-[30px] border border-white/70 bg-white/94 p-5 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                      <div className="flex items-center justify-between">
                        <Bell className="h-8 w-8 text-rose-600" />
                        <span className="text-3xl font-bold text-slate-950">{stats.messagesNonLus}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">Messages non lus</p>
                    </div>

                    <div className="rounded-[30px] border border-white/70 bg-white/94 p-5 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                      <div className="flex items-center justify-between">
                        <FileText className="h-8 w-8 text-violet-600" />
                        <span className="text-3xl font-bold text-slate-950">{stats.totalDemandes}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">Demandes totales</p>
                    </div>
                  </div>

                  <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="rounded-[32px] border border-white/70 bg-white/94 p-6 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                      <div className="mb-5 flex items-center gap-3">
                        <Hash className="h-5 w-5 text-slate-400" />
                        <h3 className="text-xl font-semibold text-slate-950">État des demandes</h3>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        <div className="rounded-2xl bg-amber-50 p-4 text-center">
                          <div className="text-3xl font-bold text-amber-700">{stats.demandesEnAttente}</div>
                          <div className="mt-1 text-sm text-amber-900">En attente</div>
                        </div>
                        <div className="rounded-2xl bg-blue-50 p-4 text-center">
                          <div className="text-3xl font-bold text-blue-700">{stats.demandesEnCours}</div>
                          <div className="mt-1 text-sm text-blue-900">En cours</div>
                        </div>
                        <div className="rounded-2xl bg-emerald-50 p-4 text-center">
                          <div className="text-3xl font-bold text-emerald-700">{stats.demandesCompletees}</div>
                          <div className="mt-1 text-sm text-emerald-900">Complétées</div>
                        </div>
                        <div className="rounded-2xl bg-rose-50 p-4 text-center">
                          <div className="text-3xl font-bold text-rose-700">{stats.demandesRejetees}</div>
                          <div className="mt-1 text-sm text-rose-900">Rejetées</div>
                        </div>
                        <div className="rounded-2xl bg-orange-50 p-4 text-center">
                          <div className="text-3xl font-bold text-orange-700">{stats.demandesUrgentes}</div>
                          <div className="mt-1 text-sm text-orange-900">Urgentes</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <div className="rounded-[32px] border border-white/70 bg-white/94 p-6 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                        <div className="flex items-center gap-3">
                          <Pin className="h-5 w-5 text-fuchsia-600" />
                          <h3 className="text-xl font-semibold text-slate-950">Épinglés</h3>
                        </div>
                        <div className="mt-5 text-4xl font-bold text-slate-950">{epinglesCount}</div>
                        <p className="mt-2 text-sm text-slate-600">Messages mis en avant dans ce département.</p>
                      </div>

                      <div className="rounded-[32px] border border-white/70 bg-white/94 p-6 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                        <div className="flex items-center gap-3">
                          <CheckCheck className="h-5 w-5 text-emerald-600" />
                          <h3 className="text-xl font-semibold text-slate-950">Lecture</h3>
                        </div>
                        <div className="mt-5 text-4xl font-bold text-slate-950">{tauxLecture}%</div>
                        <p className="mt-2 text-sm text-slate-600">Taux estimé de lecture du département.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
