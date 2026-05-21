import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
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
  Calendar,
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
  Phone,
  Moon,
  Sun,
  Link2,
  Mic,
  Image,
  Info,
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
  obtenirStatistiquesDepartement,
  marquerNotificationLue,
  marquerToutesNotificationsLues,
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
import { obtenerUsuarios, obtenerEtiquetaRol, type Usuario } from '../utils/usuarios';
import { ReactionPicker, MessageReactions } from './chat/ReactionPicker';
import { TypingIndicator, TypingIndicatorCompact } from './chat/TypingIndicator';
import { UserAvatar } from './shared/UserAvatar';
import {
  crearIdAdjuntoMessagerie,
  crearReferenciaAdjuntoMessagerie,
  esReferenciaAdjuntoMessagerie,
  guardarContenidoAdjuntoMessagerie,
  obtenerContenidoAdjuntoMessagerie,
  eliminarAdjuntoMessagerie,
} from '../utils/messagerieAttachmentIndexedDb';
import {
  TEAM_CHAT_EVENT,
  buildDirectConversationId,
  obtenirTeamChatMessages,
  obtenirTeamChatTeams,
  obtenirTeamChatChannels,
  obtenirTeamChatEvents,
  envoyerTeamChatMessage,
  creerTeamChatTeam,
  creerTeamChatChannel,
  creerTeamChatEvent,
  mettreAJourTeamChatTeam,
  supprimerTeamChatTeam,
  mettreAJourTeamChatChannel,
  supprimerTeamChatChannel,
  mettreAJourTeamChatEvent,
  supprimerTeamChatEvent,
  marquerConversationLeida,
  type TeamChatMessage,
  type TeamChatTeam,
  type TeamChatChannel,
  type TeamChatEvent,
} from '../utils/teamChatStorage';

type Vue = 'liste' | 'detail' | 'nouveau' | 'repondre' | 'statistiques';
type Filtre = 'tous' | 'recus' | 'envoyes' | 'non_lus' | 'importants' | 'demandes' | 'archives' | 'epingles';
type SimpleQuickFilter = 'chat' | 'channels' | 'people' | 'files' | 'agenda' | 'alerts';

interface ExtendedMessage extends Message {
  reactions?: Record<string, string[]>;
  pinned?: boolean;
}

interface MessagingAccessProfile {
  canCompose: boolean;
  canUseAttachments: boolean;
  canUseGroupMessages: boolean;
  canManageStatus: boolean;
  canViewStats: boolean;
  canManageTemplates: boolean;
  canDeleteAny: boolean;
  canManageWorkspace: boolean;
  allowedRecipientIds: string[];
  restrictionNotice?: string;
}

type WorkspaceConversationType = 'direct' | 'team' | 'channel';

type WorkspaceDialogMode = 'team' | 'channel' | 'event';

interface WorkspaceConversation {
  key: string;
  id: string;
  type: WorkspaceConversationType;
  title: string;
  subtitle: string;
  avatarSeed: string;
  avatarUserId?: string;
  memberIds: string[];
  messages: TeamChatMessage[];
  unreadCount: number;
  lastActivity?: string;
  accentLabel: string;
}

const WORKSPACE_QUICK_EMOJIS = [
  '🙂', '😊', '😄', '😉', '🤝', '🙌', '👏', '🙏',
  '👍', '👌', '💪', '❤️', '💙', '💚', '🔥', '✨',
  '🎉', '🚀', '🎯', '💡', '📌', '📅', '📞', '📝',
  '📣', '📎', '📦', '🚚', '👀', '⚠️', '✅', '🏁',
] as const;

const WORKSPACE_QUICK_REACTIONS = [
  { emoji: '✅', label: 'Validé' },
  { emoji: '📌', label: 'À garder en vue' },
  { emoji: '📅', label: 'À planifier' },
  { emoji: '📞', label: 'À appeler' },
  { emoji: '📦', label: 'Logistique' },
  { emoji: '🚚', label: 'Livraison' },
  { emoji: '💡', label: 'Idée' },
  { emoji: '📝', label: 'Note' },
  { emoji: '📣', label: 'Annonce' },
  { emoji: '👀', label: 'À relire' },
  { emoji: '⚠️', label: 'Attention' },
  { emoji: '🔥', label: 'Prioritaire' },
  { emoji: '🤝', label: 'Coordination' },
  { emoji: '🎯', label: 'Objectif' },
  { emoji: '🚀', label: 'Lancement' },
  { emoji: '🙏', label: 'Merci' },
] as const;

interface WorkspaceTeamFormState {
  name: string;
  description: string;
  memberIds: string[];
}

interface WorkspaceChannelFormState {
  name: string;
  description: string;
  teamId: string;
  memberIds: string[];
}

interface WorkspaceEventFormState {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  participantIds: string[];
  teamId: string;
  channelId: string;
}

const createEmptyWorkspaceTeamForm = (currentUserId: string): WorkspaceTeamFormState => ({
  name: '',
  description: '',
  memberIds: [currentUserId],
});

const createEmptyWorkspaceChannelForm = (currentUserId: string): WorkspaceChannelFormState => ({
  name: '',
  description: '',
  teamId: '',
  memberIds: [currentUserId],
});

const createDefaultEventStart = () => {
  const date = new Date(Date.now() + 60 * 60 * 1000);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const createEmptyWorkspaceEventForm = (currentUserId: string): WorkspaceEventFormState => ({
  title: '',
  description: '',
  startAt: createDefaultEventStart(),
  endAt: '',
  participantIds: [currentUserId],
  teamId: '',
  channelId: '',
});

interface MessageFormData {
  type: TypeMessage;
  departementDestinataire: string;
  departementDestinataires: string[];
  isGroupMessage: boolean;
  sujet: string;
  contenu: string;
  typeDemande?: TypeDemande;
  priorite: PrioriteDemande;
  dateEcheance: string;
}

function createEmptyFormData(): MessageFormData {
  return {
    type: 'message' as TypeMessage,
    departementDestinataire: '',
    departementDestinataires: [],
    isGroupMessage: false,
    sujet: '',
    contenu: '',
    typeDemande: undefined,
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
  if (elapsedMinutes < 60) return `Il y a ${elapsedMinutes} min`;
  return new Date(date).toLocaleDateString('fr-CA');
}

const CHAT_AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #5b67f3 0%, #6e8bff 100%)',
  'linear-gradient(135deg, #1f8f68 0%, #4ecb8d 100%)',
  'linear-gradient(135deg, #f18a3b 0%, #ffb466 100%)',
  'linear-gradient(135deg, #9a56d6 0%, #c38cff 100%)',
  'linear-gradient(135deg, #1176b8 0%, #59b8f0 100%)',
  'linear-gradient(135deg, #e0567a 0%, #ff8ea6 100%)',
];

function hashChatSeed(value: string): number {
  return Array.from(value).reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0);
}

function getChatAvatarStyle(seed: string): React.CSSProperties {
  const colorIndex = hashChatSeed(seed) % CHAT_AVATAR_GRADIENTS.length;
  return { backgroundImage: CHAT_AVATAR_GRADIENTS[colorIndex] };
}

function getChatAvatarLabel(label: string): string {
  const tokens = label.trim().split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return 'C';
  }

  if (tokens.length === 1) {
    return tokens[0].slice(0, 1).toUpperCase();
  }

  return `${tokens[0][0] || ''}${tokens[1][0] || ''}`.toUpperCase();
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
      canManageWorkspace: false,
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
  const canManageWorkspace = isFullAccess || hasAny(
    'coordinador',
    'administrador_liaison',
    'liaison_organisme',
    'responsable_entrepot',
    'responsable_comptoir',
    'responsable_transport'
  );
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
    canManageWorkspace,
    allowedRecipientIds,
    restrictionNotice,
  };
}

function parseStoredState<T>(rawValue: string | null, fallback: T, key: string): T {
  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch (error) {
    console.warn(`État persistant ignoré pour ${key}:`, error);
    return fallback;
  }
}

interface MessagingUiState {
  selectedConversationId: string;
  simpleQuickFilter: SimpleQuickFilter;
  selectedWorkspaceKey: string;
  selectedCalendarEventId: string;
}

const DEFAULT_MESSAGING_UI_STATE: MessagingUiState = {
  selectedConversationId: '',
  simpleQuickFilter: 'chat',
  selectedWorkspaceKey: '',
  selectedCalendarEventId: '',
};

function getMessagingUiStateStorageKey(userId: string): string {
  return `communication_interne_ui_state:${userId}`;
}

function readMessagingUiState(userId: string): MessagingUiState {
  if (typeof window === 'undefined') {
    return DEFAULT_MESSAGING_UI_STATE;
  }

  const rawValue = localStorage.getItem(getMessagingUiStateStorageKey(userId));
  const parsed = parseStoredState(rawValue, DEFAULT_MESSAGING_UI_STATE, 'communication-interne-ui-state');

  return {
    selectedConversationId: typeof parsed.selectedConversationId === 'string' ? parsed.selectedConversationId : '',
    simpleQuickFilter: ['chat', 'channels', 'people', 'files', 'agenda', 'alerts'].includes(parsed.simpleQuickFilter)
      ? parsed.simpleQuickFilter
      : 'chat',
    selectedWorkspaceKey: typeof parsed.selectedWorkspaceKey === 'string' ? parsed.selectedWorkspaceKey : '',
    selectedCalendarEventId: typeof parsed.selectedCalendarEventId === 'string' ? parsed.selectedCalendarEventId : '',
  };
}

function writeMessagingUiState(userId: string, state: MessagingUiState): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(getMessagingUiStateStorageKey(userId), JSON.stringify(state));
}

export function CommunicationInterne() {
  const sessionInfo = obtenerInfoUsuarioConPermisos();
  const currentUserId = sessionInfo?.id || 'user-current';
  const currentUserName = sessionInfo
    ? [sessionInfo.nombre, sessionInfo.apellido].filter(Boolean).join(' ') || sessionInfo.username || 'Utilisateur'
    : 'Utilisateur';
  const currentUserRoleLabel = sessionInfo ? obtenerNombreRol(sessionInfo.rol) : 'Utilisateur';
  const initialMessagingUiState = readMessagingUiState(currentUserId);
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
  const [selectedConversationId, setSelectedConversationId] = useState(initialMessagingUiState.selectedConversationId);
  
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
  const [simpleQuickFilter, setSimpleQuickFilter] = useState<SimpleQuickFilter>(initialMessagingUiState.simpleQuickFilter);
  const [workspaceUsers, setWorkspaceUsers] = useState<Usuario[]>([]);
  const [teamChatMessages, setTeamChatMessages] = useState<TeamChatMessage[]>([]);
  const [teamChatTeams, setTeamChatTeams] = useState<TeamChatTeam[]>([]);
  const [teamChatChannels, setTeamChatChannels] = useState<TeamChatChannel[]>([]);
  const [teamChatEvents, setTeamChatEvents] = useState<TeamChatEvent[]>([]);
  const [selectedWorkspaceKey, setSelectedWorkspaceKey] = useState(initialMessagingUiState.selectedWorkspaceKey);
  const [selectedCalendarEventId, setSelectedCalendarEventId] = useState(initialMessagingUiState.selectedCalendarEventId);
  const [workspaceDialogMode, setWorkspaceDialogMode] = useState<WorkspaceDialogMode | null>(null);
  const [workspaceEditingTeamId, setWorkspaceEditingTeamId] = useState<string | null>(null);
  const [workspaceEditingChannelId, setWorkspaceEditingChannelId] = useState<string | null>(null);
  const [workspaceEditingEventId, setWorkspaceEditingEventId] = useState<string | null>(null);
  const [workspaceTeamForm, setWorkspaceTeamForm] = useState<WorkspaceTeamFormState>(() => createEmptyWorkspaceTeamForm(currentUserId));
  const [workspaceChannelForm, setWorkspaceChannelForm] = useState<WorkspaceChannelFormState>(() => createEmptyWorkspaceChannelForm(currentUserId));
  const [workspaceEventForm, setWorkspaceEventForm] = useState<WorkspaceEventFormState>(() => createEmptyWorkspaceEventForm(currentUserId));
  const [attachmentPickerAccept, setAttachmentPickerAccept] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const composerActionsRef = useRef<HTMLDivElement | null>(null);
  const workspaceMessagesContainerRef = useRef<HTMLDivElement | null>(null);
  const departmentMessagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [openComposerMenu, setOpenComposerMenu] = useState<'media' | 'quick' | null>(null);
  const accessProfile = buildMessagingAccessProfile(sessionInfo, departements, departementActuel);
  const allowedRecipientIds = accessProfile.allowedRecipientIds;
  const allowedRecipientsKey = allowedRecipientIds.join('|');
  const isWorkspaceDialogOpen = workspaceDialogMode !== null;
  
  // Formulaire nouveau message
  const [formData, setFormData] = useState(createEmptyFormData());

  useEffect(() => {
    chargerDonnees();
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!composerActionsRef.current) {
        return;
      }

      if (!composerActionsRef.current.contains(event.target as Node)) {
        setOpenComposerMenu(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  useEffect(() => {
    writeMessagingUiState(currentUserId, {
      selectedConversationId,
      simpleQuickFilter,
      selectedWorkspaceKey,
      selectedCalendarEventId,
    });
  }, [currentUserId, selectedConversationId, simpleQuickFilter, selectedWorkspaceKey, selectedCalendarEventId]);

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
      if (
        !event.key
        || event.key.startsWith('communication_interne_')
        || event.key === 'banque_alimentaire_usuarios'
        || event.key.startsWith('team_chat_')
      ) {
        chargerDonnees();
      }
    };

    const customEventHandler = () => {
      chargerDonnees();
    };

    window.addEventListener('storage', storageHandler);
    window.addEventListener(COMMUNICATION_INTERNE_EVENT, customEventHandler as EventListener);
    window.addEventListener(TEAM_CHAT_EVENT, customEventHandler as EventListener);

    return () => {
      window.removeEventListener('storage', storageHandler);
      window.removeEventListener(COMMUNICATION_INTERNE_EVENT, customEventHandler as EventListener);
      window.removeEventListener(TEAM_CHAT_EVENT, customEventHandler as EventListener);
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

  const chargerWorkspaceChat = () => {
    const rawUsers = obtenerUsuarios();
    const hasSessionUser = rawUsers.some((user) => user.id === currentUserId);
    const normalizedUsers = hasSessionUser || !sessionInfo
      ? rawUsers
      : [
          ...rawUsers,
          {
            id: currentUserId,
            username: sessionInfo.username || currentUserName,
            password: '',
            nombre: sessionInfo.nombre || currentUserName,
            apellido: sessionInfo.apellido || '',
            email: sessionInfo.email || '',
            rol: sessionInfo.rol,
            permisos: sessionInfo.permisos || [],
            activo: true,
          },
        ];

    setWorkspaceUsers(normalizedUsers);
    setTeamChatMessages(obtenirTeamChatMessages());
    setTeamChatTeams(obtenirTeamChatTeams());
    setTeamChatChannels(obtenirTeamChatChannels());
    setTeamChatEvents(obtenirTeamChatEvents());
  };

  const chargerDonnees = () => {
    const msgs = obtenirMessages() as ExtendedMessage[];
    const depts = obtenerDepartamentos();
    const nextDepartmentId = departementActuel || depts.find(d => d.activo)?.id || '';
    
    // Cargar reacciones y mensajes fijados del localStorage
    const storedReactions = localStorage.getItem('message-reactions');
    const storedPinned = localStorage.getItem('pinned-messages');
    
    setMessageReactions(parseStoredState(storedReactions, {}, 'message-reactions'));
    setPinnedMessages(parseStoredState(storedPinned, [], 'pinned-messages'));
    
    setMessages(msgs);
    setDepartements(depts);
    setSavedDrafts(nextDepartmentId ? obtenirBrouillonsMessagerie(nextDepartmentId, currentUserId) : []);
    setDepartmentTemplates(nextDepartmentId ? obtenirTemplatesMessagerie(nextDepartmentId) : []);
    setPresenceEntries(obtenirPresencesMessagerie());
    chargerWorkspaceChat();
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

  const handleEnvoyerMessageSimple = () => {
    if (!accessProfile.canCompose) {
      toast.error(accessProfile.restrictionNotice || 'Votre rôle ne permet pas l’envoi de messages.');
      return;
    }

    if (!selectedConversationId) {
      toast.error('Sélectionnez une conversation avant d’envoyer un message.');
      return;
    }

    const contenu = formData.contenu.trim();
    if (!contenu && composerAttachments.length === 0) {
      toast.error('Ajoutez un message ou une pièce jointe avant l’envoi.');
      return;
    }

    const deptActuel = departements.find(d => d.id === departementActuel);
    const deptDest = departements.find(d => d.id === selectedConversationId);
    if (!deptActuel || !deptDest) {
      toast.error('Conversation invalide.');
      return;
    }

    const subjectBase = formData.sujet.trim() || `Conversation ${deptActuel.codigo || 'INT'} -> ${deptDest.codigo || 'EXT'}`;

    envoyerMessage({
      type: 'message',
      departementEmetteur: departementActuel,
      departementDestinataire: selectedConversationId,
      expediteur: currentUserName || `Responsable ${deptActuel.nombre}`,
      expediteurId: currentUserId,
      sujet: subjectBase,
      contenu,
      piecesJointes: composerAttachments,
      important: false,
    });

    if (activeDraftId) {
      supprimerBrouillonMessagerie(activeDraftId);
      setActiveDraftId(null);
    }

    chargerDonnees();
    setComposerAttachments([]);
    setFormData(previous => ({
      ...previous,
      type: 'message',
      isGroupMessage: false,
      departementDestinataire: selectedConversationId,
      departementDestinataires: [],
      sujet: '',
      contenu: '',
      typeDemande: 'information',
      priorite: 'normale',
      dateEcheance: '',
    }));
    toast.success(`Message envoyé à ${deptDest.nombre}`);
  };

  const handleOpenReply = (msg: ExtendedMessage) => {
    setMessageSelectionne(msg);
    setComposerAttachments([]);
    setFormData(previous => ({ ...previous, contenu: '' }));
    setVue('repondre');
  };

  const handleDownloadAttachment = async (piece: PieceJointe) => {
    let downloadUrl = piece.url;

    if (esReferenciaAdjuntoMessagerie(piece.url)) {
      const stored = await obtenerContenidoAdjuntoMessagerie(piece.url);

      if (!stored?.contenido) {
        toast.error(`Le fichier ${piece.nom} n'est plus disponible localement.`);
        return;
      }

      downloadUrl = stored.contenido;
    }

    const link = document.createElement('a');
    link.href = downloadUrl;
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

  const processAttachmentFiles = async (files: File[]) => {
    setAttachmentPickerAccept(undefined);

    if (!files.length) return;

    if (!accessProfile.canUseAttachments) {
      toast.error('Les pièces jointes ne sont pas disponibles pour ce rôle.');
      return;
    }

    const nextAttachments: PieceJointe[] = [];

    for (const file of files) {
      const url = await lireFichierEnDataUrl(file);
      const attachmentId = crearIdAdjuntoMessagerie();
      await guardarContenidoAdjuntoMessagerie(attachmentId, url, file.type || 'application/octet-stream');
      nextAttachments.push({
        id: attachmentId,
        nom: file.name,
        taille: file.size,
        type: file.type || 'application/octet-stream',
        url: crearReferenciaAdjuntoMessagerie(attachmentId),
      });
    }

    if (nextAttachments.length > 0) {
      setComposerAttachments(previous => [...previous, ...nextAttachments]);
      toast.success(`${nextAttachments.length} pièce(s) jointe(s) ajoutée(s)`);
    }
  };

  const handleAttachmentSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    await processAttachmentFiles(files);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setComposerAttachments(previous => {
      const attachmentToRemove = previous.find(attachment => attachment.id === attachmentId);

      if (attachmentToRemove && esReferenciaAdjuntoMessagerie(attachmentToRemove.url)) {
        void eliminarAdjuntoMessagerie(attachmentToRemove.url).catch((error) => {
          console.error('Erreur lors de la suppression du contenu de la pièce jointe:', error);
        });
      }

      return previous.filter(attachment => attachment.id !== attachmentId);
    });
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
  const normalizedChatSearch = recherche.trim().toLowerCase();
  const baseSimpleConversationThreads = departements
    .filter(department => department.activo && department.id !== departementActuel && allowedRecipientIds.includes(department.id))
    .map(department => {
      const threadMessages = messages
        .filter(message => !message.archive && (
          (message.departementEmetteur === departementActuel && message.departementDestinataire === department.id) ||
          (message.departementDestinataire === departementActuel && message.departementEmetteur === department.id)
        ))
        .sort((left, right) => new Date(left.dateCreation).getTime() - new Date(right.dateCreation).getTime());

      const lastMessage = threadMessages[threadMessages.length - 1] || null;
      const unreadCount = threadMessages.filter(message =>
        message.departementDestinataire === departementActuel &&
        message.departementEmetteur === department.id &&
        !message.lu
      ).length;
      const presence = presenceEntries.find(entry => entry.departementId === department.id && entry.status === 'online')
        || presenceEntries.find(entry => entry.departementId === department.id)
        || null;

      return {
        department,
        messages: threadMessages,
        lastMessage,
        unreadCount,
        presence,
      };
    });
  const simpleConversationThreads = baseSimpleConversationThreads
    .filter(thread => {
      if (!normalizedChatSearch) {
        return true;
      }

      const preview = `${thread.department.nombre} ${thread.department.codigo || ''} ${thread.lastMessage?.contenu || ''} ${thread.lastMessage?.expediteur || ''}`.toLowerCase();
      return preview.includes(normalizedChatSearch);
    })
    .filter(thread => {
      switch (simpleQuickFilter) {
        case 'channels':
          return thread.unreadCount > 0;
        case 'people':
          return thread.presence?.status === 'online';
        case 'files':
          return thread.messages.some(message => message.piecesJointes.length > 0);
        case 'agenda':
          return thread.messages.some(message => message.type === 'demande' || Boolean(message.dateEcheance));
        case 'alerts':
          return thread.messages.some(message =>
            message.type === 'alerte'
            || (message.type === 'demande' && ['urgente', 'haute'].includes(message.priorite || ''))
            || (!message.lu && message.departementDestinataire === departementActuel)
          );
        default:
          return true;
      }
    })
    .sort((left, right) => {
      const leftTime = left.lastMessage ? new Date(left.lastMessage.dateCreation).getTime() : 0;
      const rightTime = right.lastMessage ? new Date(right.lastMessage.dateCreation).getTime() : 0;

      if (rightTime !== leftTime) {
        return rightTime - leftTime;
      }

      return left.department.nombre.localeCompare(right.department.nombre, 'fr', { sensitivity: 'base' });
    });
  const simpleConversationIdsKey = simpleConversationThreads.map(thread => thread.department.id).join('|');
  const selectedConversation = simpleConversationThreads.find(thread => thread.department.id === selectedConversationId)
    || simpleConversationThreads[0]
    || null;
  const selectedConversationMessages = selectedConversation?.messages || [];
  useEffect(() => {
    const container = departmentMessagesContainerRef.current;
    if (!container) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [selectedConversationId, selectedConversationMessages.length]);
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
  const handleSimpleQuickFilterChange = (target: SimpleQuickFilter) => {
    setSimpleQuickFilter(target);
  };
  const canUseComposerMedia = Boolean(selectedConversationId || selectedWorkspaceKey || vue === 'nouveau' || vue === 'repondre');
  const ouvrirSelecteurAdjuntos = (accept?: string) => {
    if (!canUseComposerMedia) {
      toast.error('Sélectionnez une conversation avant d’ajouter un contenu.');
      return;
    }

    if (!accessProfile.canUseAttachments) {
      toast.error('Les pièces jointes ne sont pas disponibles pour ce rôle.');
      return;
    }

    setAttachmentPickerAccept(accept || undefined);
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.multiple = true;
    picker.accept = accept || '';
    picker.style.position = 'fixed';
    picker.style.left = '-9999px';
    picker.style.top = '0';

    picker.addEventListener('change', () => {
      const files = Array.from(picker.files || []);
      void processAttachmentFiles(files);
      picker.remove();
    }, { once: true });

    document.body.appendChild(picker);
    picker.click();
  };
  const ouvrirOptionMedia = (accept?: string) => {
    setOpenComposerMenu(null);
    ouvrirSelecteurAdjuntos(accept);
  };
  const handleInsertQuickText = (value: string, emptyError: string) => {
    if (!canUseComposerMedia) {
      toast.error(emptyError);
      return;
    }

    if (!accessProfile.canCompose) {
      toast.error(accessProfile.restrictionNotice || 'Votre rôle ne permet pas de rédiger un message.');
      return;
    }

    setFormData(previous => ({
      ...previous,
      contenu: previous.contenu.trim().length > 0 ? `${previous.contenu} ${value}` : value
    }));
  };
  const handleInsertQuickEmoji = (emoji = '🙂') => {
    handleInsertQuickText(emoji, 'Sélectionnez une conversation avant d’ajouter un emoji.');
  };
  const handleInsertReaction = (emoji: string) => {
    handleInsertQuickText(emoji, 'Sélectionnez une conversation avant d’ajouter une réaction.');
  };
  const handleInsertLinkTemplate = () => {
    handleInsertQuickText('https://', 'Sélectionnez une conversation avant d’ajouter un lien.');
  };
  const handleStartVideoRoom = () => {
    if (!selectedConversation || !departementCourant) {
      toast.error('Sélectionnez une conversation avant de lancer une réunion.');
      return;
    }

    const roomId = ['banque-dm', departementCourant.codigo || departementCourant.id, selectedConversation.department.codigo || selectedConversation.department.id]
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-');

    window.open(`https://meet.jit.si/${roomId}`, '_blank', 'noopener,noreferrer');
    toast.success(`Salon vidéo ouvert pour ${selectedConversation.department.nombre}`);
  };
  const toggleComposerMenu = (menu: 'media' | 'quick') => {
    setOpenComposerMenu(previous => previous === menu ? null : menu);
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

  const workspaceUserMap = workspaceUsers.reduce<Record<string, Usuario>>((accumulator, user) => {
    accumulator[user.id] = user;
    return accumulator;
  }, {});

  const getWorkspaceUserLabel = (userId: string) => {
    const user = workspaceUserMap[userId];
    if (!user) {
      return userId === currentUserId ? currentUserName : 'Utilisateur';
    }

    return [user.nombre, user.apellido].filter(Boolean).join(' ').trim() || user.username || user.email || 'Utilisateur';
  };

  const getWorkspaceRoleLabel = (userId: string) => {
    const user = workspaceUserMap[userId];
    if (!user?.rol) {
      return userId === currentUserId ? currentUserRoleLabel : 'Utilisateur';
    }

    return obtenerEtiquetaRol(user.rol);
  };

  const formatWorkspaceDate = (value?: string) => {
    if (!value) {
      return 'Aucune activité';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return 'Aucune activité';
    }

    return date.toLocaleString('fr-CA', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUnreadCountForConversation = (messagesForConversation: TeamChatMessage[]) => {
    return messagesForConversation.filter((message) => (
      message.senderUserId !== currentUserId && !message.readByUserIds.includes(currentUserId)
    )).length;
  };

  const activeWorkspaceUsers = workspaceUsers.filter((user) => user.id !== currentUserId && user.activo !== false);
  const historicalDirectUserIds = Array.from(new Set(
    teamChatMessages
      .filter((message) => message.conversationType === 'direct')
      .map((message) => {
        const participants = message.conversationId
          .split(':')
          .filter((part) => part && part !== 'direct' && part !== currentUserId);
        return participants[0] || '';
      })
      .filter((userId) => Boolean(userId))
  ));
  const directConversationUserIds = Array.from(new Set([
    ...activeWorkspaceUsers.map((user) => user.id),
    ...historicalDirectUserIds,
  ])).filter((userId) => userId !== currentUserId);

  const directConversations: WorkspaceConversation[] = directConversationUserIds
    .map((userId) => {
      const user = workspaceUserMap[userId];
      const conversationId = buildDirectConversationId(currentUserId, userId);
      const messagesForConversation = teamChatMessages
        .filter((message) => message.conversationType === 'direct' && message.conversationId === conversationId)
        .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
      const lastMessage = messagesForConversation[messagesForConversation.length - 1];
      const fallbackName = messagesForConversation.find((message) => message.senderUserId === userId)?.senderName
        || messagesForConversation.find((message) => message.senderUserId !== currentUserId)?.senderName
        || 'Utilisateur archivé';
      const subtitleParts = [
        user ? getWorkspaceRoleLabel(userId) : 'Historique archivé',
        user?.email || '',
        user && user.activo === false ? 'Inactif' : '',
      ].filter(Boolean);

      return {
        key: `direct:${conversationId}`,
        id: conversationId,
        type: 'direct',
        title: user ? getWorkspaceUserLabel(userId) : fallbackName,
        subtitle: subtitleParts.join(' • '),
        avatarSeed: `direct-${userId}`,
        avatarUserId: user?.activo === false ? undefined : userId,
        memberIds: [currentUserId, userId],
        messages: messagesForConversation,
        unreadCount: getUnreadCountForConversation(messagesForConversation),
        lastActivity: lastMessage?.createdAt,
        accentLabel: 'Utilisateur',
      };
    })
    .sort((left, right) => {
      const leftTime = left.lastActivity ? new Date(left.lastActivity).getTime() : 0;
      const rightTime = right.lastActivity ? new Date(right.lastActivity).getTime() : 0;
      return rightTime - leftTime || left.title.localeCompare(right.title, 'fr');
    });

  const teamConversations: WorkspaceConversation[] = teamChatTeams
    .filter((team) => team.memberIds.includes(currentUserId))
    .map((team) => {
      const messagesForConversation = teamChatMessages
        .filter((message) => message.conversationType === 'team' && message.conversationId === team.id)
        .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
      const lastMessage = messagesForConversation[messagesForConversation.length - 1];

      return {
        key: `team:${team.id}`,
        id: team.id,
        type: 'team',
        title: team.name,
        subtitle: team.description || `${team.memberIds.length} membre(s)`,
        avatarSeed: `team-${team.id}`,
        memberIds: team.memberIds,
        messages: messagesForConversation,
        unreadCount: getUnreadCountForConversation(messagesForConversation),
        lastActivity: lastMessage?.createdAt || team.createdAt,
        accentLabel: 'Équipe',
      };
    })
    .sort((left, right) => {
      const leftTime = left.lastActivity ? new Date(left.lastActivity).getTime() : 0;
      const rightTime = right.lastActivity ? new Date(right.lastActivity).getTime() : 0;
      return rightTime - leftTime || left.title.localeCompare(right.title, 'fr');
    });

  const channelConversations: WorkspaceConversation[] = teamChatChannels
    .filter((channel) => {
      if (channel.memberIds.includes(currentUserId)) {
        return true;
      }

      if (!channel.teamId) {
        return false;
      }

      return teamChatTeams.some((team) => team.id === channel.teamId && team.memberIds.includes(currentUserId));
    })
    .map((channel) => {
      const linkedTeam = channel.teamId ? teamChatTeams.find((team) => team.id === channel.teamId) : undefined;
      const memberIds = channel.memberIds.length > 0 ? channel.memberIds : linkedTeam?.memberIds || [currentUserId];
      const messagesForConversation = teamChatMessages
        .filter((message) => message.conversationType === 'channel' && message.conversationId === channel.id)
        .sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
      const lastMessage = messagesForConversation[messagesForConversation.length - 1];

      return {
        key: `channel:${channel.id}`,
        id: channel.id,
        type: 'channel',
        title: `#${channel.name}`,
        subtitle: channel.description || (linkedTeam ? `Équipe ${linkedTeam.name}` : `${memberIds.length} membre(s)`),
        avatarSeed: `channel-${channel.id}`,
        memberIds,
        messages: messagesForConversation,
        unreadCount: getUnreadCountForConversation(messagesForConversation),
        lastActivity: lastMessage?.createdAt || channel.createdAt,
        accentLabel: 'Canal',
      };
    })
    .sort((left, right) => {
      const leftTime = left.lastActivity ? new Date(left.lastActivity).getTime() : 0;
      const rightTime = right.lastActivity ? new Date(right.lastActivity).getTime() : 0;
      return rightTime - leftTime || left.title.localeCompare(right.title, 'fr');
    });

  const allWorkspaceConversations = [...directConversations, ...teamConversations, ...channelConversations];
  const workspaceSearch = recherche.trim().toLowerCase();

  const visibleWorkspaceConversations = allWorkspaceConversations.filter((conversation) => {
    switch (simpleQuickFilter) {
      case 'chat':
        if (conversation.type !== 'direct') return false;
        break;
      case 'channels':
        if (conversation.type !== 'channel') return false;
        break;
      case 'people':
        if (conversation.type !== 'team') return false;
        break;
      case 'files':
        if (!conversation.messages.some((message) => message.attachments.length > 0)) return false;
        break;
      case 'alerts':
        if (conversation.unreadCount === 0) return false;
        break;
      case 'agenda':
        return false;
    }

    if (!workspaceSearch) {
      return true;
    }

    return conversation.title.toLowerCase().includes(workspaceSearch)
      || conversation.subtitle.toLowerCase().includes(workspaceSearch)
      || conversation.messages.some((message) => message.content.toLowerCase().includes(workspaceSearch));
  });

  const visibleCalendarEvents = teamChatEvents
    .filter((event) => event.participantIds.includes(currentUserId))
    .filter((event) => {
      if (!workspaceSearch) {
        return true;
      }

      return event.title.toLowerCase().includes(workspaceSearch)
        || (event.description || '').toLowerCase().includes(workspaceSearch);
    })
    .sort((left, right) => new Date(left.startAt).getTime() - new Date(right.startAt).getTime());

  const selectedWorkspace = visibleWorkspaceConversations.find((conversation) => conversation.key === selectedWorkspaceKey)
    || visibleWorkspaceConversations[0]
    || null;
  const selectedCalendarEvent = visibleCalendarEvents.find((event) => event.id === selectedCalendarEventId)
    || visibleCalendarEvents[0]
    || null;
  useEffect(() => {
    if (simpleQuickFilter === 'agenda') {
      return;
    }

    const container = workspaceMessagesContainerRef.current;
    if (!container) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [simpleQuickFilter, selectedWorkspace?.key, selectedWorkspace?.messages.length]);

  const toggleWorkspaceMemberSelection = (
    memberIds: string[],
    memberId: string,
    checked: boolean,
    keepCurrentUser = true,
  ) => {
    const nextMemberIds = checked
      ? [...memberIds, memberId]
      : memberIds.filter((item) => item !== memberId);

    return Array.from(new Set(keepCurrentUser ? [currentUserId, ...nextMemberIds] : nextMemberIds));
  };

  const closeWorkspaceDialog = () => {
    setWorkspaceEditingTeamId(null);
    setWorkspaceEditingChannelId(null);
    setWorkspaceEditingEventId(null);
    setWorkspaceDialogMode(null);
  };

  const handleCreateWorkspaceTeam = () => {
    if (!accessProfile.canManageWorkspace) {
      toast.error('La gestion des équipes est réservée aux rôles autorisés.');
      return;
    }

    setWorkspaceEditingTeamId(null);
    setWorkspaceTeamForm(createEmptyWorkspaceTeamForm(currentUserId));
    setWorkspaceDialogMode('team');
  };

  const handleEditWorkspaceTeam = (teamId: string) => {
    if (!accessProfile.canManageWorkspace) {
      toast.error('La modification des équipes est réservée aux rôles autorisés.');
      return;
    }

    const team = teamChatTeams.find((item) => item.id === teamId);
    if (!team) {
      toast.error('Équipe introuvable.');
      return;
    }

    setWorkspaceEditingTeamId(team.id);
    setWorkspaceTeamForm({
      name: team.name,
      description: team.description || '',
      memberIds: Array.from(new Set([currentUserId, ...team.memberIds])),
    });
    setWorkspaceDialogMode('team');
  };

  const submitWorkspaceTeam = () => {
    if (!accessProfile.canManageWorkspace) {
      toast.error('La gestion des équipes est réservée aux rôles autorisés.');
      return;
    }

    if (!workspaceTeamForm.name.trim()) {
      toast.error('Saisissez un nom pour l’équipe.');
      return;
    }

    const memberIds = Array.from(new Set([currentUserId, ...workspaceTeamForm.memberIds]));
    const savedTeam = workspaceEditingTeamId
      ? mettreAJourTeamChatTeam(workspaceEditingTeamId, {
          name: workspaceTeamForm.name.trim(),
          description: workspaceTeamForm.description.trim(),
          memberIds,
        })
      : creerTeamChatTeam({
          name: workspaceTeamForm.name.trim(),
          description: workspaceTeamForm.description.trim(),
          memberIds,
          createdByUserId: currentUserId,
        });

    if (!savedTeam) {
      toast.error('Impossible de sauvegarder l’équipe.');
      return;
    }

    chargerWorkspaceChat();
    setSimpleQuickFilter('people');
    setSelectedWorkspaceKey(`team:${savedTeam.id}`);
    setWorkspaceTeamForm(createEmptyWorkspaceTeamForm(currentUserId));
    closeWorkspaceDialog();
    toast.success(workspaceEditingTeamId ? `Équipe « ${savedTeam.name} » mise à jour` : `Équipe « ${savedTeam.name} » créée`);
  };

  const handleDeleteWorkspaceTeam = (teamId: string) => {
    if (!accessProfile.canManageWorkspace) {
      toast.error('La suppression des équipes est réservée aux rôles autorisés.');
      return;
    }

    const team = teamChatTeams.find((item) => item.id === teamId);
    if (!team) {
      toast.error('Équipe introuvable.');
      return;
    }

    if (!window.confirm(`Supprimer l’équipe « ${team.name} » ainsi que ses canaux et messages liés ?`)) {
      return;
    }

    supprimerTeamChatTeam(teamId);
    setSelectedWorkspaceKey('');
    chargerWorkspaceChat();
    toast.success(`Équipe « ${team.name} » supprimée`);
  };

  const handleCreateWorkspaceChannel = () => {
    if (!accessProfile.canManageWorkspace) {
      toast.error('La gestion des canaux est réservée aux rôles autorisés.');
      return;
    }

    setWorkspaceEditingChannelId(null);
    setWorkspaceChannelForm(createEmptyWorkspaceChannelForm(currentUserId));
    setWorkspaceDialogMode('channel');
  };

  const handleEditWorkspaceChannel = (channelId: string) => {
    if (!accessProfile.canManageWorkspace) {
      toast.error('La modification des canaux est réservée aux rôles autorisés.');
      return;
    }

    const channel = teamChatChannels.find((item) => item.id === channelId);
    if (!channel) {
      toast.error('Canal introuvable.');
      return;
    }

    setWorkspaceEditingChannelId(channel.id);
    setWorkspaceChannelForm({
      name: channel.name,
      description: channel.description || '',
      teamId: channel.teamId || '',
      memberIds: Array.from(new Set([currentUserId, ...channel.memberIds])),
    });
    setWorkspaceDialogMode('channel');
  };

  const submitWorkspaceChannel = () => {
    if (!accessProfile.canManageWorkspace) {
      toast.error('La gestion des canaux est réservée aux rôles autorisés.');
      return;
    }

    if (!workspaceChannelForm.name.trim()) {
      toast.error('Saisissez un nom pour le canal.');
      return;
    }

    const linkedTeam = workspaceChannelForm.teamId
      ? teamChatTeams.find((team) => team.id === workspaceChannelForm.teamId)
      : undefined;
    const memberIds = linkedTeam
      ? linkedTeam.memberIds
      : Array.from(new Set([currentUserId, ...workspaceChannelForm.memberIds]));

    const savedChannel = workspaceEditingChannelId
      ? mettreAJourTeamChatChannel(workspaceEditingChannelId, {
          name: workspaceChannelForm.name.trim().replace(/^#/, ''),
          description: workspaceChannelForm.description.trim(),
          memberIds,
          teamId: linkedTeam?.id,
        })
      : creerTeamChatChannel({
          name: workspaceChannelForm.name.trim().replace(/^#/, ''),
          description: workspaceChannelForm.description.trim(),
          memberIds,
          teamId: linkedTeam?.id,
          createdByUserId: currentUserId,
        });

    if (!savedChannel) {
      toast.error('Impossible de sauvegarder le canal.');
      return;
    }

    chargerWorkspaceChat();
    setSimpleQuickFilter('channels');
    setSelectedWorkspaceKey(`channel:${savedChannel.id}`);
    setWorkspaceChannelForm(createEmptyWorkspaceChannelForm(currentUserId));
    closeWorkspaceDialog();
    toast.success(workspaceEditingChannelId ? `Canal « ${savedChannel.name} » mis à jour` : `Canal « ${savedChannel.name} » créé`);
  };

  const handleDeleteWorkspaceChannel = (channelId: string) => {
    if (!accessProfile.canManageWorkspace) {
      toast.error('La suppression des canaux est réservée aux rôles autorisés.');
      return;
    }

    const channel = teamChatChannels.find((item) => item.id === channelId);
    if (!channel) {
      toast.error('Canal introuvable.');
      return;
    }

    if (!window.confirm(`Supprimer le canal « ${channel.name} » ainsi que ses messages et événements liés ?`)) {
      return;
    }

    supprimerTeamChatChannel(channelId);
    setSelectedWorkspaceKey('');
    chargerWorkspaceChat();
    toast.success(`Canal « ${channel.name} » supprimé`);
  };

  const handleScheduleWorkspaceEvent = (conversation?: WorkspaceConversation | null) => {
    if (!accessProfile.canManageWorkspace) {
      toast.error('La programmation d’événements est réservée aux rôles autorisés.');
      return;
    }

    setWorkspaceEditingEventId(null);
    setWorkspaceEventForm({
      title: '',
      description: '',
      startAt: createDefaultEventStart(),
      endAt: '',
      participantIds: conversation?.memberIds?.length ? Array.from(new Set(conversation.memberIds)) : [currentUserId],
      teamId: conversation?.type === 'team' ? conversation.id : '',
      channelId: conversation?.type === 'channel' ? conversation.id : '',
    });
    setWorkspaceDialogMode('event');
  };

  const handleEditWorkspaceEvent = (eventId: string) => {
    if (!accessProfile.canManageWorkspace) {
      toast.error('La modification des événements est réservée aux rôles autorisés.');
      return;
    }

    const event = teamChatEvents.find((item) => item.id === eventId);
    if (!event) {
      toast.error('Événement introuvable.');
      return;
    }

    setWorkspaceEditingEventId(event.id);
    setWorkspaceEventForm({
      title: event.title,
      description: event.description || '',
      startAt: createDefaultEventStart(),
      endAt: '',
      participantIds: Array.from(new Set([currentUserId, ...event.participantIds])),
      teamId: event.teamId || '',
      channelId: event.channelId || '',
    });
    setWorkspaceEventForm((previous) => ({
      ...previous,
      startAt: (() => {
        const date = new Date(event.startAt);
        const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return local.toISOString().slice(0, 16);
      })(),
      endAt: event.endAt
        ? (() => {
            const date = new Date(event.endAt as string);
            const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
            return local.toISOString().slice(0, 16);
          })()
        : '',
    }));
    setWorkspaceDialogMode('event');
  };

  const submitWorkspaceEvent = () => {
    if (!accessProfile.canManageWorkspace) {
      toast.error('La programmation d’événements est réservée aux rôles autorisés.');
      return;
    }

    if (!workspaceEventForm.title.trim()) {
      toast.error('Saisissez un titre pour l’événement.');
      return;
    }

    if (!workspaceEventForm.startAt.trim() || Number.isNaN(new Date(workspaceEventForm.startAt).getTime())) {
      toast.error('Date de début invalide.');
      return;
    }

    if (workspaceEventForm.endAt.trim() && Number.isNaN(new Date(workspaceEventForm.endAt).getTime())) {
      toast.error('Date de fin invalide.');
      return;
    }

    const savedEvent = workspaceEditingEventId
      ? mettreAJourTeamChatEvent(workspaceEditingEventId, {
          title: workspaceEventForm.title.trim(),
          description: workspaceEventForm.description.trim(),
          startAt: new Date(workspaceEventForm.startAt).toISOString(),
          endAt: workspaceEventForm.endAt.trim() ? new Date(workspaceEventForm.endAt).toISOString() : undefined,
          participantIds: Array.from(new Set([currentUserId, ...workspaceEventForm.participantIds])),
          teamId: workspaceEventForm.teamId || undefined,
          channelId: workspaceEventForm.channelId || undefined,
        })
      : creerTeamChatEvent({
          title: workspaceEventForm.title.trim(),
          description: workspaceEventForm.description.trim(),
          startAt: new Date(workspaceEventForm.startAt).toISOString(),
          endAt: workspaceEventForm.endAt.trim() ? new Date(workspaceEventForm.endAt).toISOString() : undefined,
          createdByUserId: currentUserId,
          participantIds: Array.from(new Set([currentUserId, ...workspaceEventForm.participantIds])),
          teamId: workspaceEventForm.teamId || undefined,
          channelId: workspaceEventForm.channelId || undefined,
        });

    if (!savedEvent) {
      toast.error('Impossible de sauvegarder l’événement.');
      return;
    }

    chargerWorkspaceChat();
    setSimpleQuickFilter('agenda');
    setSelectedCalendarEventId(savedEvent.id);
    setWorkspaceEventForm(createEmptyWorkspaceEventForm(currentUserId));
    closeWorkspaceDialog();
    toast.success(workspaceEditingEventId ? `Événement « ${savedEvent.title} » mis à jour` : `Événement « ${savedEvent.title} » programmé`);
  };

  const handleDeleteWorkspaceEvent = (eventId: string) => {
    if (!accessProfile.canManageWorkspace) {
      toast.error('La suppression des événements est réservée aux rôles autorisés.');
      return;
    }

    const event = teamChatEvents.find((item) => item.id === eventId);
    if (!event) {
      toast.error('Événement introuvable.');
      return;
    }

    if (!window.confirm(`Supprimer l’événement « ${event.title} » ?`)) {
      return;
    }

    supprimerTeamChatEvent(eventId);
    setSelectedCalendarEventId('');
    chargerWorkspaceChat();
    toast.success(`Événement « ${event.title} » supprimé`);
  };

  const handleStartWorkspaceVideoRoom = (conversation?: WorkspaceConversation | null) => {
    if (!conversation) {
      toast.error('Sélectionnez une conversation avant de lancer une réunion.');
      return;
    }

    const roomId = ['banque-dm', conversation.type, conversation.id]
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-');

    window.open(`https://meet.jit.si/${roomId}`, '_blank', 'noopener,noreferrer');
    toast.success(`Salon vidéo ouvert pour ${conversation.title}`);
  };

  const handleSendWorkspaceMessage = () => {
    if (!selectedWorkspace) {
      toast.error('Sélectionnez une conversation avant d’envoyer un message.');
      return;
    }

    if (!accessProfile.canCompose) {
      toast.error(accessProfile.restrictionNotice || 'Votre rôle ne permet pas de rédiger un message.');
      return;
    }

    const content = formData.contenu.trim();
    if (!content && composerAttachments.length === 0) {
      toast.error('Saisissez un message ou ajoutez une pièce jointe.');
      return;
    }

    envoyerTeamChatMessage({
      conversationType: selectedWorkspace.type,
      conversationId: selectedWorkspace.id,
      senderUserId: currentUserId,
      senderName: currentUserName,
      content,
      attachments: composerAttachments,
    });

    setComposerAttachments([]);
    setOpenComposerMenu(null);
    setFormData((previous) => ({
      ...previous,
      sujet: '',
      contenu: '',
    }));
    chargerWorkspaceChat();
  };

  useEffect(() => {
    if (simpleQuickFilter === 'agenda') {
      if (!visibleCalendarEvents.length) {
        if (selectedCalendarEventId) {
          setSelectedCalendarEventId('');
        }
        return;
      }

      if (!selectedCalendarEventId || !visibleCalendarEvents.some((event) => event.id === selectedCalendarEventId)) {
        setSelectedCalendarEventId(visibleCalendarEvents[0].id);
      }
      return;
    }

    if (!visibleWorkspaceConversations.length) {
      if (selectedWorkspaceKey) {
        setSelectedWorkspaceKey('');
      }
      return;
    }

    if (!selectedWorkspaceKey || !visibleWorkspaceConversations.some((conversation) => conversation.key === selectedWorkspaceKey)) {
      setSelectedWorkspaceKey(visibleWorkspaceConversations[0].key);
    }
  }, [
    simpleQuickFilter,
    selectedWorkspaceKey,
    selectedCalendarEventId,
    visibleWorkspaceConversations.map((conversation) => conversation.key).join('|'),
    visibleCalendarEvents.map((event) => event.id).join('|'),
  ]);

  useEffect(() => {
    if (!selectedWorkspace || simpleQuickFilter === 'agenda') {
      return;
    }

    if (selectedWorkspace.unreadCount === 0) {
      return;
    }

    marquerConversationLeida(selectedWorkspace.type, selectedWorkspace.id, currentUserId);
    chargerWorkspaceChat();
  }, [selectedWorkspace?.key, simpleQuickFilter, currentUserId]);

  useEffect(() => {
    if (!simpleConversationThreads.length) {
      if (selectedConversationId) {
        setSelectedConversationId('');
      }
      return;
    }

    if (!selectedConversationId || !simpleConversationThreads.some(thread => thread.department.id === selectedConversationId)) {
      setSelectedConversationId(simpleConversationThreads[0].department.id);
    }
  }, [selectedConversationId, simpleConversationIdsKey]);

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }

    setFormData(previous => {
      if (
        previous.departementDestinataire === selectedConversationId &&
        !previous.isGroupMessage &&
        previous.departementDestinataires.length === 0 &&
        previous.type === 'message'
      ) {
        return previous;
      }

      return {
        ...previous,
        type: 'message',
        isGroupMessage: false,
        departementDestinataire: selectedConversationId,
        departementDestinataires: [],
      };
    });
  }, [selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId || !departementActuel) {
      return;
    }

    const unreadMessages = messages.filter(message =>
      message.departementDestinataire === departementActuel &&
      message.departementEmetteur === selectedConversationId &&
      !message.lu
    );

    if (unreadMessages.length === 0) {
      return;
    }

    unreadMessages.forEach(message => {
      marquerCommeLu(message.id);
    });
    chargerDonnees();
  }, [selectedConversationId, departementActuel, messages]);

  const renderTeamWorkspaceView = () => {
    const navigationItems = [
      { id: 'chat' as const, label: 'Chats', icon: <MessageSquare className="h-4 w-4" /> },
      { id: 'channels' as const, label: 'Canaux', icon: <Hash className="h-4 w-4" /> },
      { id: 'people' as const, label: 'Équipes', icon: <Users className="h-4 w-4" /> },
      { id: 'files' as const, label: 'Fichiers', icon: <FileText className="h-4 w-4" /> },
      { id: 'agenda' as const, label: 'Calendrier', icon: <Calendar className="h-4 w-4" /> },
      { id: 'alerts' as const, label: 'Alertes', icon: <Bell className="h-4 w-4" /> },
    ];

    const totalUnreadConversations = allWorkspaceConversations.filter((conversation) => conversation.unreadCount > 0).length;
    const totalAttachments = allWorkspaceConversations.reduce((count, conversation) => (
      count + conversation.messages.reduce((innerCount, message) => innerCount + message.attachments.length, 0)
    ), 0);

    const sectionDescriptions: Record<SimpleQuickFilter, string> = {
      chat: 'Conversations directes avec les utilisateurs créés.',
      channels: 'Canaux partagés par équipe ou par sujet.',
      people: 'Espaces d’équipe pour coordonner plusieurs membres.',
      files: 'Conversations contenant des fichiers ou médias.',
      agenda: 'Réunions, points de passage et créneaux planifiés.',
      alerts: 'Conversations avec messages non lus à traiter.',
    };

    const emptyDescriptions: Record<SimpleQuickFilter, string> = {
      chat: 'Aucun utilisateur actif n’est encore disponible pour lancer une discussion directe.',
      channels: 'Créez un canal pour organiser un sujet, un projet ou une opération.',
      people: 'Créez une équipe pour regrouper plusieurs utilisateurs et centraliser la discussion.',
      files: 'Aucun échange avec pièce jointe n’a été trouvé pour ce filtre.',
      agenda: 'Aucun événement programmé pour votre périmètre actuel.',
      alerts: 'Aucune conversation prioritaire ou non lue n’est en attente.',
    };

    const directParticipantId = selectedWorkspace?.type === 'direct'
      ? selectedWorkspace.memberIds.find((memberId) => memberId !== currentUserId) || currentUserId
      : undefined;
    const selectedPresence = directParticipantId
      ? presenceEntries.find((entry) => entry.userId === directParticipantId)
      : undefined;
    const workspaceActionButtonClass = 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800';
    const workspaceDangerButtonClass = 'inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600';

    return (
      <div className="flex h-full min-h-0 w-full items-center justify-center">
        <div className="flex h-[calc(100%-8px)] min-h-0 w-full max-w-[1368px] flex-col rounded-[34px] border border-white/70 bg-white/42 p-2 shadow-[0_30px_80px_-52px_rgba(15,45,71,0.35)] backdrop-blur-xl xl:h-[calc(100%-12px)] xl:p-2.5">
          <div className="grid h-full min-h-0 grid-cols-1 gap-2 lg:grid-cols-[88px_332px_minmax(0,1fr)] xl:grid-cols-[88px_320px_minmax(0,1fr)]">
            <aside className="overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#18243a_0%,#10192b_100%)] text-white shadow-[0_24px_56px_-42px_rgba(15,23,42,0.88)]">
              <div className="flex h-full flex-col items-center p-2.5">
                <div className="flex w-full flex-col items-center border-b border-white/10 pb-3 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg" style={getChatAvatarStyle('communica-team-chat')}>
                    T
                  </div>
                  <div className="mt-2.5 min-w-0">
                    <p className="text-[13px] font-semibold">Communica</p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-300">Team chat</p>
                  </div>
                </div>

                <nav className="mt-3 w-full space-y-1.5">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      title={item.label}
                      onClick={() => handleSimpleQuickFilterChange(item.id)}
                      className={`flex w-full flex-col items-center gap-1.5 rounded-[20px] px-1.5 py-2.5 text-center text-[10px] transition-colors ${
                        simpleQuickFilter === item.id ? 'bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${simpleQuickFilter === item.id ? 'bg-white/12' : 'bg-white/5'}`}>{item.icon}</span>
                      <span className="line-clamp-2 leading-tight">{item.label}</span>
                    </button>
                  ))}
                </nav>

                <div className="mt-auto w-full rounded-[20px] border border-white/10 bg-white/5 p-2.5">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="relative">
                      <UserAvatar
                        userId={currentUserId}
                        displayName={currentUserName}
                        photo={sessionInfo?.foto}
                        users={workspaceUsers}
                        className="h-9 w-9 rounded-full"
                        fallbackClassName="text-[11px] font-semibold text-white"
                        fallbackStyle={getChatAvatarStyle(currentUserName)}
                      />
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#11192b] bg-emerald-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold">{currentUserName}</p>
                      <p className="mt-1 truncate text-[11px] text-slate-300">{currentUserRoleLabel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <section className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/75 bg-[linear-gradient(180deg,#fbfcfe_0%,#f5f7fb_100%)] shadow-[0_24px_60px_-44px_rgba(15,45,71,0.22)]">
              <div className="border-b border-[#e4e8f2] px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Espace d’équipe</p>
                    <h2 className="mt-0.5 text-[26px] font-bold text-slate-950">{navigationItems.find((item) => item.id === simpleQuickFilter)?.label || 'Chats'}</h2>
                    <p className="text-[12px] text-slate-500">{sectionDescriptions[simpleQuickFilter]}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {simpleQuickFilter === 'people' && accessProfile.canManageWorkspace && (
                      <button type="button" onClick={handleCreateWorkspaceTeam} className="inline-flex h-9 items-center gap-2 rounded-2xl border border-[#d7deec] bg-white px-3 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                        <UserPlus className="h-4 w-4" />
                        Créer équipe
                      </button>
                    )}
                    {simpleQuickFilter === 'channels' && accessProfile.canManageWorkspace && (
                      <button type="button" onClick={handleCreateWorkspaceChannel} className="inline-flex h-9 items-center gap-2 rounded-2xl border border-[#d7deec] bg-white px-3 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                        <Plus className="h-4 w-4" />
                        Créer canal
                      </button>
                    )}
                    {simpleQuickFilter === 'agenda' && accessProfile.canManageWorkspace && (
                      <button type="button" onClick={() => handleScheduleWorkspaceEvent(selectedWorkspace)} className="inline-flex h-9 items-center gap-2 rounded-2xl border border-[#d7deec] bg-white px-3 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                        <Calendar className="h-4 w-4" />
                        Programmer
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                    {workspaceUsers.length} utilisateur(s)
                  </span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                    {totalUnreadConversations} conversation(s) à lire
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                    {teamChatTeams.length} équipe(s)
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                    {teamChatChannels.length} canal(aux)
                  </span>
                  <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                    {totalAttachments} fichier(s)
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={recherche}
                      onChange={(event) => setRecherche(event.target.value)}
                      placeholder={simpleQuickFilter === 'agenda' ? 'Rechercher un événement' : 'Rechercher une conversation'}
                      className="h-9 rounded-2xl border-[#e4e8f2] bg-white pl-10"
                    />
                  </div>
                  <button type="button" onClick={() => setRecherche('')} className="rounded-full border border-[#e4e8f2] bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
                {simpleQuickFilter === 'agenda' ? (
                  visibleCalendarEvents.length === 0 ? (
                    <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 text-center">
                      <Calendar className="h-9 w-9 text-slate-300" />
                      <p className="mt-4 text-base font-semibold text-slate-900">Aucun événement programmé</p>
                      <p className="mt-2 max-w-xs text-sm text-slate-500">{emptyDescriptions.agenda}</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {visibleCalendarEvents.map((event) => {
                        const isActive = event.id === selectedCalendarEvent?.id;
                        const participantLabel = event.participantIds.map((participantId) => getWorkspaceUserLabel(participantId)).slice(0, 3).join(', ');

                        return (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => setSelectedCalendarEventId(event.id)}
                            className={`flex w-full flex-col gap-1 rounded-[18px] border px-3 py-3 text-left transition-all ${
                              isActive ? 'border-white bg-white shadow-[0_18px_34px_-24px_rgba(59,78,135,0.45)]' : 'border-transparent bg-transparent hover:border-white hover:bg-white/75'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="truncate text-[14px] font-semibold text-slate-950">{event.title}</p>
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                                {formatWorkspaceDate(event.startAt)}
                              </span>
                            </div>
                            <p className="line-clamp-2 text-[12px] text-slate-600">{event.description || 'Réunion planifiée depuis l’espace de communication.'}</p>
                            <p className="text-[11px] text-slate-500">{participantLabel || currentUserName}</p>
                          </button>
                        );
                      })}
                    </div>
                  )
                ) : visibleWorkspaceConversations.length === 0 ? (
                  <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 text-center">
                    <MessageSquare className="h-9 w-9 text-slate-300" />
                    <p className="mt-4 text-base font-semibold text-slate-900">Aucune conversation disponible</p>
                    <p className="mt-2 max-w-xs text-sm text-slate-500">{emptyDescriptions[simpleQuickFilter]}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {visibleWorkspaceConversations.map((conversation) => {
                      const isActive = conversation.key === selectedWorkspace?.key;
                      const lastMessage = conversation.messages[conversation.messages.length - 1];

                      return (
                        <button
                          key={conversation.key}
                          type="button"
                          onClick={() => setSelectedWorkspaceKey(conversation.key)}
                          className={`flex w-full items-start gap-2.5 rounded-[18px] border px-2.5 py-2 text-left transition-all ${
                            isActive ? 'border-white bg-white shadow-[0_18px_34px_-24px_rgba(59,78,135,0.45)]' : 'border-transparent bg-transparent hover:border-white hover:bg-white/75'
                          }`}
                        >
                          <div className="relative shrink-0">
                            {conversation.type === 'direct' ? (
                              <UserAvatar
                                userId={conversation.avatarUserId}
                                displayName={conversation.title}
                                users={workspaceUsers}
                                className="h-10 w-10 rounded-full"
                                fallbackClassName="text-[13px] font-semibold text-white"
                                fallbackStyle={getChatAvatarStyle(conversation.avatarSeed)}
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold text-white" style={getChatAvatarStyle(conversation.avatarSeed)}>
                                {getChatAvatarLabel(conversation.title)}
                              </div>
                            )}
                            {conversation.unreadCount > 0 && (
                              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-[14px] font-semibold text-slate-950">{conversation.title}</p>
                                <p className="mt-0.5 truncate text-[11px] text-slate-500">{conversation.subtitle}</p>
                              </div>
                              <div className="flex shrink-0 flex-col items-end gap-1">
                                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                                  {conversation.accentLabel}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400">{formatWorkspaceDate(conversation.lastActivity)}</span>
                              </div>
                            </div>
                            <p className="mt-0.5 line-clamp-1 text-[12px] text-slate-600">
                              {lastMessage?.content || 'Commencer une nouvelle conversation'}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <section className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_24px_60px_-44px_rgba(15,45,71,0.22)]">
              {simpleQuickFilter === 'agenda' ? (
                selectedCalendarEvent ? (
                  <>
                    <div className="border-b border-[#edf0f6] bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] px-5 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Événement</p>
                          <h3 className="truncate text-[18px] font-bold text-slate-950">{selectedCalendarEvent.title}</h3>
                          <p className="mt-0.5 text-[13px] text-slate-500">Début {formatWorkspaceDate(selectedCalendarEvent.startAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {accessProfile.canManageWorkspace && (
                            <div className="flex items-center rounded-full border border-[#e4e8f2] bg-white/95 p-1 shadow-sm">
                              <button type="button" title="Modifier l’événement" onClick={() => handleEditWorkspaceEvent(selectedCalendarEvent.id)} className={workspaceActionButtonClass}>
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button type="button" title="Supprimer l’événement" onClick={() => handleDeleteWorkspaceEvent(selectedCalendarEvent.id)} className={workspaceDangerButtonClass}>
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                          {accessProfile.canManageWorkspace && (
                            <div className="flex items-center rounded-full border border-[#e4e8f2] bg-white/95 p-1 shadow-sm">
                              <button type="button" title="Programmer un nouvel événement" onClick={() => handleScheduleWorkspaceEvent(selectedWorkspace)} className={workspaceActionButtonClass}>
                                <Calendar className="h-4 w-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(91,103,243,0.06),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2f8_100%)] px-5 py-5">
                      <div className="rounded-[22px] border border-slate-200 bg-white/85 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Participants</p>
                        <p className="mt-2 text-sm text-slate-700">{selectedCalendarEvent.participantIds.map((participantId) => getWorkspaceUserLabel(participantId)).join(', ') || currentUserName}</p>
                      </div>
                      <div className="rounded-[22px] border border-slate-200 bg-white/85 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Détails</p>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{selectedCalendarEvent.description || 'Aucun détail complémentaire fourni pour cet événement.'}</p>
                      </div>
                      <div className="rounded-[22px] border border-slate-200 bg-white/85 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Contexte</p>
                        <p className="mt-2 text-sm text-slate-700">
                          {selectedCalendarEvent.channelId
                            ? `Canal lié : ${channelConversations.find((conversation) => conversation.id === selectedCalendarEvent.channelId)?.title || 'Canal supprimé'}`
                            : selectedCalendarEvent.teamId
                              ? `Équipe liée : ${teamConversations.find((conversation) => conversation.id === selectedCalendarEvent.teamId)?.title || 'Équipe supprimée'}`
                              : 'Événement planifié hors conversation spécifique.'}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                    <Calendar className="h-10 w-10 text-slate-300" />
                    <p className="mt-6 text-lg font-semibold text-slate-900">Sélectionnez un événement</p>
                    <p className="mt-2 max-w-sm text-sm text-slate-500">Choisissez un événement à gauche ou utilisez le bouton Programmer pour en créer un.</p>
                  </div>
                )
              ) : selectedWorkspace ? (
                <>
                  <div className="border-b border-[#edf0f6] bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] px-5 py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="relative shrink-0">
                          {selectedWorkspace.type === 'direct' ? (
                            <UserAvatar
                              userId={selectedWorkspace.avatarUserId}
                              displayName={selectedWorkspace.title}
                              users={workspaceUsers}
                              className="h-12 w-12 rounded-full"
                              fallbackClassName="text-sm font-semibold text-white"
                              fallbackStyle={getChatAvatarStyle(selectedWorkspace.avatarSeed)}
                            />
                          ) : (
                            <div className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white" style={getChatAvatarStyle(selectedWorkspace.avatarSeed)}>
                              {getChatAvatarLabel(selectedWorkspace.title)}
                            </div>
                          )}
                          {selectedPresence?.status === 'online' && (
                            <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{selectedWorkspace.accentLabel}</p>
                          <h3 className="truncate text-[18px] font-bold text-slate-950">{selectedWorkspace.title}</h3>
                          <p className="mt-0.5 text-[13px] text-slate-500">{selectedWorkspace.subtitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedWorkspace.type !== 'direct' && accessProfile.canManageWorkspace && (
                          <div className="flex items-center rounded-full border border-[#e4e8f2] bg-white/95 p-1 shadow-sm">
                            <button
                              type="button"
                              title={selectedWorkspace.type === 'team' ? 'Modifier l’équipe' : 'Modifier le canal'}
                              onClick={() => selectedWorkspace.type === 'team' ? handleEditWorkspaceTeam(selectedWorkspace.id) : handleEditWorkspaceChannel(selectedWorkspace.id)}
                              className={workspaceActionButtonClass}
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              title={selectedWorkspace.type === 'team' ? 'Supprimer l’équipe' : 'Supprimer le canal'}
                              onClick={() => selectedWorkspace.type === 'team' ? handleDeleteWorkspaceTeam(selectedWorkspace.id) : handleDeleteWorkspaceChannel(selectedWorkspace.id)}
                              className={workspaceDangerButtonClass}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center rounded-full border border-[#e4e8f2] bg-white/95 p-1 shadow-sm">
                          {accessProfile.canManageWorkspace && (
                            <button type="button" title="Programmer un événement" onClick={() => handleScheduleWorkspaceEvent(selectedWorkspace)} className={workspaceActionButtonClass}>
                              <Calendar className="h-4 w-4" />
                            </button>
                          )}
                          <button type="button" title="Lancer une réunion vidéo" onClick={() => handleStartWorkspaceVideoRoom(selectedWorkspace)} className={workspaceActionButtonClass}>
                            <Video className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div ref={workspaceMessagesContainerRef} className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(91,103,243,0.06),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2f8_100%)] px-4 py-4 sm:px-5">
                    {selectedWorkspace.messages.length === 0 ? (
                      <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                        <div className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Nouveau fil
                        </div>
                        <p className="mt-6 text-lg font-semibold text-slate-900">Aucun message dans cette conversation</p>
                        <p className="mt-2 max-w-sm text-sm text-slate-500">Commencez l’échange avec {selectedWorkspace.title} ou planifiez un rendez-vous avec le bouton calendrier.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedWorkspace.messages.map((message) => {
                          const isOutgoing = message.senderUserId === currentUserId;

                          return (
                            <div key={message.id} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                              <div className={`flex max-w-[84%] items-end gap-2 sm:max-w-[66%] ${isOutgoing ? 'flex-row-reverse' : 'flex-row'}`}>
                                <UserAvatar
                                  userId={message.senderUserId}
                                  displayName={message.senderName || getWorkspaceUserLabel(message.senderUserId)}
                                  users={workspaceUsers}
                                  className="h-8 w-8 rounded-full"
                                  fallbackClassName="text-[10px] font-semibold text-white"
                                  fallbackStyle={getChatAvatarStyle(`${message.senderUserId || message.senderName || 'message'}-${message.id}`)}
                                />
                                <div className={`flex flex-col gap-1.5 ${isOutgoing ? 'items-end' : 'items-start'}`}>
                                  <div className="flex items-center gap-2 px-1">
                                    <span className="text-[12px] font-semibold text-slate-700">{message.senderName || getWorkspaceUserLabel(message.senderUserId)}</span>
                                    <span className="text-[10px] text-slate-400">{formatWorkspaceDate(message.createdAt)}</span>
                                  </div>
                                  <div className={`rounded-[22px] px-4 py-3 shadow-sm ${isOutgoing ? 'bg-slate-900 text-white' : 'border border-white/80 bg-white text-slate-900'}`}>
                                    {message.content && (
                                      <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{message.content}</p>
                                    )}
                                    {message.attachments.length > 0 && (
                                      <div className="mt-3 space-y-2">
                                        {message.attachments.map((attachment) => (
                                          <button
                                            key={attachment.id}
                                            type="button"
                                            onClick={() => handleDownloadAttachment(attachment)}
                                            className={`flex w-full items-center gap-2 rounded-2xl border px-3 py-2 text-left text-[12px] transition-colors ${isOutgoing ? 'border-white/15 bg-white/10 hover:bg-white/15' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}`}
                                          >
                                            <Paperclip className="h-4 w-4 shrink-0" />
                                            <span className="min-w-0 flex-1 truncate">{attachment.nombre}</span>
                                            <Download className="h-4 w-4 shrink-0" />
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-[#edf0f6] bg-white px-4 py-4 sm:px-5">
                    <div className="rounded-[26px] border border-[#e8edf7] bg-[#f8fafc] p-3 shadow-[0_18px_40px_-32px_rgba(15,45,71,0.28)]">
                      {composerAttachments.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {composerAttachments.map((attachment) => (
                            <div key={attachment.id} className="inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-700">
                              <Paperclip className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                              <span className="truncate">{attachment.nombre}</span>
                              <button type="button" onClick={() => handleRemoveAttachment(attachment.id)} className="rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <TextareaSpellCheck
                            value={formData.contenu}
                            onChange={(event) => setFormData((previous) => ({ ...previous, contenu: event.target.value }))}
                            placeholder={`Écrire à ${selectedWorkspace.title}`}
                            className="min-h-[86px] rounded-[22px] border-[#dbe3f2] bg-white px-4 py-3 text-[13px]"
                          />
                        </div>

                        <div ref={composerActionsRef} className="relative flex items-center gap-2">
                          <button type="button" onClick={() => toggleComposerMenu('media')} className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#dbe3f2] bg-white px-3 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                            <Paperclip className="h-4 w-4" />
                            Médias
                          </button>
                          <button type="button" onClick={() => toggleComposerMenu('quick')} className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#dbe3f2] bg-white px-3 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50">
                            <Zap className="h-4 w-4" />
                            Rapide
                          </button>

                          {openComposerMenu === 'media' && (
                            <div className="absolute bottom-14 right-0 z-20 flex min-w-[210px] flex-col gap-1 rounded-[22px] border border-slate-200 bg-white p-2 shadow-[0_22px_44px_-28px_rgba(15,23,42,0.4)]">
                              <button type="button" onClick={() => ouvrirOptionMedia(undefined)} className="flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-[12px] text-slate-700 transition-colors hover:bg-slate-50">
                                <Paperclip className="h-4 w-4" />
                                Documents
                              </button>
                              <button type="button" onClick={() => ouvrirOptionMedia('image/*')} className="flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-[12px] text-slate-700 transition-colors hover:bg-slate-50">
                                <Image className="h-4 w-4" />
                                Images
                              </button>
                              <button type="button" onClick={() => ouvrirOptionMedia('video/*')} className="flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-[12px] text-slate-700 transition-colors hover:bg-slate-50">
                                <Video className="h-4 w-4" />
                                Vidéos
                              </button>
                              <button type="button" onClick={() => ouvrirOptionMedia('audio/*')} className="flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-[12px] text-slate-700 transition-colors hover:bg-slate-50">
                                <Mic className="h-4 w-4" />
                                Audio
                              </button>
                            </div>
                          )}

                          {openComposerMenu === 'quick' && (
                            <div className="absolute bottom-14 right-0 z-20 flex w-[320px] flex-col gap-3 rounded-[22px] border border-slate-200 bg-white p-3 shadow-[0_22px_44px_-28px_rgba(15,23,42,0.4)]">
                              <div>
                                <div className="mb-2 flex items-center gap-2 px-1">
                                  <Smile className="h-4 w-4 text-slate-400" />
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Émojis</p>
                                </div>
                                <div className="grid grid-cols-8 gap-1.5">
                                  {WORKSPACE_QUICK_EMOJIS.map((emoji) => (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => handleInsertQuickEmoji(emoji)}
                                      className="flex h-9 w-9 items-center justify-center rounded-xl text-[19px] transition-colors hover:bg-slate-100"
                                      title={`Insérer ${emoji}`}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <div className="mb-2 flex items-center gap-2 px-1">
                                  <ThumbsUp className="h-4 w-4 text-slate-400" />
                                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Raccourcis métier</p>
                                </div>
                                <div className="grid grid-cols-2 gap-1.5">
                                  {WORKSPACE_QUICK_REACTIONS.map((item) => (
                                    <button
                                      key={item.label}
                                      type="button"
                                      onClick={() => handleInsertReaction(item.emoji)}
                                      className="flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-[12px] text-slate-700 transition-colors hover:bg-slate-50"
                                    >
                                      <span className="text-base leading-none">{item.emoji}</span>
                                      <span>{item.label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <button type="button" onClick={handleInsertLinkTemplate} className="flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-[12px] text-slate-700 transition-colors hover:bg-slate-50">
                                <Link2 className="h-4 w-4" />
                                Ajouter un lien
                              </button>
                            </div>
                          )}

                          <button type="button" onClick={handleSendWorkspaceMessage} className="inline-flex h-11 items-center gap-2 rounded-2xl bg-slate-900 px-4 text-[12px] font-semibold text-white transition-colors hover:bg-slate-800">
                            <Send className="h-4 w-4" />
                            Envoyer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                  <MessageSquare className="h-10 w-10 text-slate-300" />
                  <p className="mt-6 text-lg font-semibold text-slate-900">Sélectionnez une conversation</p>
                  <p className="mt-2 max-w-sm text-sm text-slate-500">Choisissez un utilisateur, une équipe ou un canal à gauche pour commencer.</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    );
  };

  const renderSimpleMessagingView = () => {
    const navigationItems = [
      { id: 'chat' as const, label: 'Chats', icon: <MessageSquare className="h-4 w-4" /> },
      { id: 'channels' as const, label: 'Canaux', icon: <Hash className="h-4 w-4" /> },
      { id: 'people' as const, label: 'Équipes', icon: <Users className="h-4 w-4" /> },
      { id: 'files' as const, label: 'Fichiers', icon: <FileText className="h-4 w-4" /> },
      { id: 'agenda' as const, label: 'Calendrier', icon: <Calendar className="h-4 w-4" /> },
      { id: 'alerts' as const, label: 'Alertes', icon: <Bell className="h-4 w-4" /> },
    ];

    const selectedDepartment = selectedConversation?.department || null;
    const selectedPresence = selectedConversation?.presence || null;
    const selectedAvatarSeed = `${selectedDepartment?.id || 'current'}-${selectedDepartment?.nombre || 'chat'}`;
    const totalUnreadConversations = simpleConversationThreads.filter(thread => thread.unreadCount > 0).length;
    const currentDepartmentLabel = departementCourant?.nombre || 'Aucun département';
    const simpleEmptyStateDescription: Record<SimpleQuickFilter, string> = {
      chat: 'Sélectionnez un département autorisé ou attendez un nouveau message.',
      channels: 'Aucun échange non lu ne correspond au filtre actif.',
      people: 'Aucun département en ligne n’est disponible pour le moment.',
      files: 'Aucune conversation avec pièces jointes n’est disponible.',
      agenda: 'Aucune conversation avec échéance ou demande active n’est disponible.',
      alerts: 'Aucune alerte ou demande prioritaire n’est disponible.',
    };

    return (
      <div className="flex h-full min-h-0 w-full items-center justify-center">
        <div className="flex h-[calc(100%-8px)] min-h-0 w-full max-w-[1368px] flex-col rounded-[34px] border border-white/70 bg-white/42 p-2 shadow-[0_30px_80px_-52px_rgba(15,45,71,0.35)] backdrop-blur-xl xl:h-[calc(100%-12px)] xl:p-2.5">
          <div className="grid h-full min-h-0 grid-cols-1 gap-2 lg:grid-cols-[88px_332px_minmax(0,1fr)] xl:grid-cols-[88px_320px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-[28px] bg-[linear-gradient(180deg,#18243a_0%,#10192b_100%)] text-white shadow-[0_24px_56px_-42px_rgba(15,23,42,0.88)]">
          <div className="flex h-full flex-col items-center p-2.5">
            <div className="flex w-full flex-col items-center border-b border-white/10 pb-3 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-lg" style={getChatAvatarStyle('communica-app')}>
                C
              </div>
              <div className="mt-2.5 min-w-0">
                <p className="text-[13px] font-semibold">Communica</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-300">Chat</p>
              </div>
            </div>

            <nav className="mt-3 w-full space-y-1.5">
              {navigationItems.map(item => (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  onClick={() => handleSimpleQuickFilterChange(item.id)}
                  className={`flex w-full flex-col items-center gap-1.5 rounded-[20px] px-1.5 py-2.5 text-center text-[10px] transition-colors ${
                    simpleQuickFilter === item.id ? 'bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${simpleQuickFilter === item.id ? 'bg-white/12' : 'bg-white/5'}`}>{item.icon}</span>
                  <span className="line-clamp-2 leading-tight">{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="mt-auto w-full rounded-[20px] border border-white/10 bg-white/5 p-2.5">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="relative">
                  <UserAvatar
                    userId={currentUserId}
                    displayName={currentUserName}
                    photo={sessionInfo?.foto}
                    users={workspaceUsers}
                    className="h-9 w-9 rounded-full"
                    fallbackClassName="text-[11px] font-semibold text-white"
                    fallbackStyle={getChatAvatarStyle(currentUserName)}
                  />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#11192b] bg-emerald-500" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold">{currentUserName}</p>
                  <p className="mt-1 truncate text-[11px] text-slate-300">{currentUserRoleLabel}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/75 bg-[linear-gradient(180deg,#fbfcfe_0%,#f5f7fb_100%)] shadow-[0_24px_60px_-44px_rgba(15,45,71,0.22)]">
          <div className="border-b border-[#e4e8f2] px-4 py-3">
            <div className="flex flex-col gap-2.5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Centre de messagerie</p>
                <h2 className="mt-0.5 text-[26px] font-bold text-slate-950">Messages</h2>
                <p className="text-[12px] text-slate-500">{navigationItems.find(item => item.id === simpleQuickFilter)?.label || 'Conversations'} par département</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <select
                  value={departementActuel}
                  onChange={(e) => setDepartementActuel(e.target.value)}
                  className="h-9 w-full rounded-2xl border border-[#e4e8f2] bg-white px-4 text-[13px] font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a4d7a]/20"
                >
                  {departements.filter(d => d.activo).map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.nombre} ({dept.codigo})
                    </option>
                  ))}
                </select>
                <div className="flex justify-end">
                  <button type="button" onClick={() => setAfficherGuide(true)} className="flex h-9 w-10 items-center justify-center rounded-2xl border border-[#e4e8f2] bg-white text-slate-500 transition-colors hover:bg-slate-50">
                    <Filter className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                {currentDepartmentLabel}
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700">
                {notificationsNonLues} notification(s)
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700">
                {messagesEnvoyesCount} envoyés
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={recherche}
                  onChange={(event) => setRecherche(event.target.value)}
                  placeholder="Rechercher"
                  className="h-9 rounded-2xl border-[#e4e8f2] bg-white pl-10"
                />
              </div>
              <button type="button" onClick={() => setRecherche('')} className="rounded-full border border-[#e4e8f2] bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-semibold text-white">Tous</span>
              <span className="rounded-full border border-[#dbe1ee] bg-white px-3 py-1 text-[10px] font-semibold text-slate-600">
                Non lus {totalUnreadConversations}
              </span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            {simpleConversationThreads.length === 0 ? (
              <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 text-center">
                <MessageSquare className="h-9 w-9 text-slate-300" />
                <p className="mt-4 text-base font-semibold text-slate-900">Aucune conversation disponible</p>
                <p className="mt-2 max-w-xs text-sm text-slate-500">{simpleEmptyStateDescription[simpleQuickFilter]}</p>
              </div>
            ) : (
              <div className="space-y-1">
                {simpleConversationThreads.map(thread => {
                  const isActive = thread.department.id === selectedConversationId;
                  const avatarSeed = `${thread.department.id}-${thread.department.nombre}`;
                  const fallbackLabel = getChatAvatarLabel(thread.department.nombre);
                  const lastTime = thread.lastMessage
                    ? new Date(thread.lastMessage.dateCreation).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })
                    : '--:--';

                  return (
                    <button
                      key={thread.department.id}
                      type="button"
                      onClick={() => setSelectedConversationId(thread.department.id)}
                      className={`flex w-full items-start gap-2.5 rounded-[18px] border px-2.5 py-2 text-left transition-all ${
                        isActive
                          ? 'border-white bg-white shadow-[0_18px_34px_-24px_rgba(59,78,135,0.45)]'
                          : 'border-transparent bg-transparent hover:border-white hover:bg-white/75'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full text-[13px] font-semibold text-white" style={getChatAvatarStyle(avatarSeed)}>
                          {fallbackLabel}
                        </div>
                        {thread.presence?.status === 'online' && (
                          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-semibold text-slate-950">{thread.department.nombre}</p>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {thread.presence?.status === 'online' ? 'En ligne' : formatPresenceLabel(thread.presence?.lastSeen || new Date().toISOString())}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            <span className="text-[10px] font-medium text-slate-400">{lastTime}</span>
                            {thread.unreadCount > 0 && (
                              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">
                                {thread.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="mt-0.5 line-clamp-1 text-[12px] text-slate-600">
                          {thread.lastMessage?.contenu || 'Commencer une nouvelle conversation'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_24px_60px_-44px_rgba(15,45,71,0.22)]">
          {selectedDepartment ? (
            <>
              <div className="border-b border-[#edf0f6] bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="relative shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white" style={getChatAvatarStyle(selectedAvatarSeed)}>
                        {getChatAvatarLabel(selectedDepartment.nombre)}
                      </div>
                      {selectedPresence?.status === 'online' && (
                        <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Discussion</p>
                      <h3 className="truncate text-[18px] font-bold text-slate-950">{selectedDepartment.nombre}</h3>
                      <p className="mt-0.5 text-[13px] text-slate-500">
                        {selectedPresence?.status === 'online'
                          ? 'En ligne'
                          : `Dernière activité ${formatPresenceLabel(selectedPresence?.lastSeen || new Date().toISOString())}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500">
                    <button type="button" onClick={handleStartVideoRoom} className="rounded-full border border-[#e4e8f2] bg-white p-2 transition-colors hover:bg-slate-50">
                      <Video className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div ref={departmentMessagesContainerRef} className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(91,103,243,0.06),transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2f8_100%)] px-4 py-4 sm:px-5">
                {selectedConversationMessages.length === 0 ? (
                  <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
                    <div className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Aujourd'hui
                    </div>
                    <p className="mt-6 text-lg font-semibold text-slate-900">Aucun message dans cette conversation</p>
                    <p className="mt-2 max-w-sm text-sm text-slate-500">Écris un premier message pour démarrer l’échange avec {selectedDepartment.nombre}.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <span className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Aujourd'hui
                      </span>
                    </div>

                    {selectedConversationMessages.map(message => {
                      const isOutgoing = message.departementEmetteur === departementActuel;
                      const attachmentCount = message.piecesJointes.length;
                      const messageSeed = `${isOutgoing ? 'self' : message.expediteur}-${message.id}`;

                      return (
                        <div key={message.id} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[84%] sm:max-w-[66%] ${isOutgoing ? 'items-end' : 'items-start'} flex flex-col gap-1.5`}>
                            {!isOutgoing && (
                              <div className="flex items-center gap-3 px-1">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold text-white" style={getChatAvatarStyle(messageSeed)}>
                                  {getChatAvatarLabel(message.expediteur)}
                                </div>
                                <span className="text-sm font-semibold text-slate-700">{message.expediteur}</span>
                              </div>
                            )}
                            <div
                              className={`px-4 py-2.5 shadow-sm ${
                                isOutgoing
                                  ? 'rounded-[26px] rounded-br-[10px] bg-[#5b67f3] text-white'
                                  : 'rounded-[26px] rounded-bl-[10px] border border-white/80 bg-white text-slate-800'
                              }`}
                            >
                              <p className="whitespace-pre-wrap text-[13px] leading-5">{message.contenu || 'Pièce jointe envoyée'}</p>

                              {attachmentCount > 0 && (
                                <div className="mt-3 space-y-2">
                                  {message.piecesJointes.map(piece => (
                                    <button
                                      key={piece.id}
                                      type="button"
                                      onClick={() => handleDownloadAttachment(piece)}
                                      className={`flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-2 text-left text-xs font-semibold transition-colors ${
                                        isOutgoing
                                          ? 'border border-white/20 bg-white/10 text-white hover:bg-white/15'
                                          : 'border border-slate-200 bg-white/80 text-slate-700 hover:bg-white'
                                      }`}
                                    >
                                      <span className="min-w-0 truncate">{piece.nom}</span>
                                      <span>{formatFileSize(piece.taille)}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 px-1 text-xs text-slate-400">
                              <span>
                                {new Date(message.dateCreation).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isOutgoing && (
                                <CheckCheck className={`h-3.5 w-3.5 ${message.lu ? 'text-indigo-500' : 'text-slate-300'}`} />
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fbfcff_100%)] px-4 py-3 sm:px-5">
                {!accessProfile.canCompose && accessProfile.restrictionNotice && (
                  <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {accessProfile.restrictionNotice}
                  </div>
                )}

                <div className="rounded-[24px] border border-[#e5e9f3] bg-[#fbfcfe] p-2.5 shadow-sm">
                  <TextareaSpellCheck
                    value={formData.contenu}
                    onChange={(event) => setFormData(previous => ({ ...previous, contenu: event.target.value }))}
                    rows={2}
                    placeholder={selectedDepartment ? `Écrire à ${selectedDepartment.nombre}...` : 'Écrire un message...' }
                    language="fr"
                    showSpellCheck={true}
                    disabled={!accessProfile.canCompose || !selectedConversationId}
                  />

                  {composerAttachments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {composerAttachments.map(attachment => (
                        <div key={attachment.id} className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
                          <Paperclip className="h-3.5 w-3.5 text-slate-400" />
                          <span className="max-w-[180px] truncate font-medium">{attachment.nom}</span>
                          <button type="button" onClick={() => handleRemoveAttachment(attachment.id)} className="text-slate-400 hover:text-slate-700">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div ref={composerActionsRef} className="flex flex-wrap items-center gap-2 text-slate-500">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={attachmentPickerAccept}
                        multiple
                        onChange={handleAttachmentSelection}
                        className="hidden"
                      />
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => toggleComposerMenu('media')}
                          disabled={!selectedConversationId}
                          className="flex items-center gap-2 rounded-full border border-[#e4e8f2] bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Paperclip className="h-4 w-4" />
                          Médias
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {openComposerMenu === 'media' && (
                          <div className="absolute bottom-full left-0 z-20 mb-2 flex min-w-[172px] flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_-24px_rgba(15,45,71,0.28)]">
                            <button type="button" onClick={() => ouvrirOptionMedia()} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                              <Paperclip className="h-4 w-4" />
                              Fichier
                            </button>
                            <button type="button" onClick={() => ouvrirOptionMedia('image/*')} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                              <Image className="h-4 w-4" />
                              Image
                            </button>
                            <button type="button" onClick={() => ouvrirOptionMedia('video/*')} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                              <Video className="h-4 w-4" />
                              Vidéo
                            </button>
                            <button type="button" onClick={() => ouvrirOptionMedia('audio/*')} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                              <Mic className="h-4 w-4" />
                              Audio
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => toggleComposerMenu('quick')}
                          disabled={!selectedConversationId}
                          className="flex items-center gap-2 rounded-full border border-[#e4e8f2] bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Sparkles className="h-4 w-4" />
                          Rapide
                          <MoreVertical className="h-4 w-4" />
                        </button>

                        {openComposerMenu === 'quick' && (
                          <div className="absolute bottom-full left-0 z-20 mb-2 flex min-w-[236px] max-h-[340px] flex-col gap-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_-24px_rgba(15,45,71,0.28)]">
                            <button type="button" onClick={() => { setOpenComposerMenu(null); handleInsertQuickEmoji(); }} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                              <Smile className="h-4 w-4" />
                              Emoji
                            </button>
                            <button type="button" onClick={() => { setOpenComposerMenu(null); handleInsertLinkTemplate(); }} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                              <Link2 className="h-4 w-4" />
                              Lien
                            </button>
                            <button type="button" onClick={() => { setOpenComposerMenu(null); handleInsertReaction('✅'); }} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                              <span className="text-base leading-none">✅</span>
                              Confirmé
                            </button>
                            <button type="button" onClick={() => { setOpenComposerMenu(null); handleInsertReaction('📌'); }} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                              <span className="text-base leading-none">📌</span>
                              Priorité
                            </button>
                            <button type="button" onClick={() => { setOpenComposerMenu(null); handleInsertReaction('📅'); }} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                              <span className="text-base leading-none">📅</span>
                              Planifié
                            </button>
                            <button type="button" onClick={() => { setOpenComposerMenu(null); handleInsertReaction('📞'); }} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                              <span className="text-base leading-none">📞</span>
                              Appel requis
                            </button>
                            <button type="button" onClick={() => { setOpenComposerMenu(null); handleInsertReaction('📦'); }} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                              <span className="text-base leading-none">📦</span>
                              Logistique
                            </button>
                            <button type="button" onClick={() => { setOpenComposerMenu(null); handleInsertReaction('🚚'); }} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                              <span className="text-base leading-none">🚚</span>
                              Transport
                            </button>
                            <button type="button" onClick={() => { setOpenComposerMenu(null); handleInsertReaction('⚠️'); }} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                              <span className="text-base leading-none">⚠️</span>
                              Urgent
                            </button>
                            <button type="button" onClick={() => { setOpenComposerMenu(null); handleInsertReaction('👀'); }} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                              <span className="text-base leading-none">👀</span>
                              À vérifier
                            </button>
                            <button type="button" onClick={() => { setOpenComposerMenu(null); handleInsertReaction('🙏'); }} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                              <span className="text-base leading-none">🙏</span>
                              Merci
                            </button>
                            <button type="button" onClick={() => { setOpenComposerMenu(null); handleInsertReaction('👍'); }} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                              <ThumbsUp className="h-4 w-4" />
                              Réaction positive
                            </button>
                            <button type="button" onClick={() => { setOpenComposerMenu(null); handleInsertReaction('❤️'); }} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                              <Heart className="h-4 w-4" />
                              Réaction coeur
                            </button>
                            <button type="button" onClick={() => { setOpenComposerMenu(null); handleInsertReaction('😂'); }} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                              <Laugh className="h-4 w-4" />
                              Réaction rire
                            </button>
                          </div>
                        )}
                      </div>

                      <span className="text-xs text-slate-400">Sélection multiple sans limite imposée</span>
                    </div>

                    <Button
                      type="button"
                      onClick={handleEnvoyerMessageSimple}
                      disabled={!accessProfile.canCompose || !selectedConversationId}
                      className="h-11 rounded-full bg-[#5b67f3] px-5 text-white hover:bg-[#4d58de]"
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Envoyer
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[480px] flex-col items-center justify-center rounded-[30px] border border-dashed border-slate-200 bg-white px-6 text-center">
              <MessageSquare className="h-10 w-10 text-slate-300" />
              <p className="mt-4 text-lg font-semibold text-slate-900">Choisissez une conversation</p>
              <p className="mt-2 max-w-sm text-sm text-slate-500">Le fil de discussion apparaîtra ici avec un modèle simple et direct.</p>
            </div>
          )}
        </section>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#eef3f8]">
      <div className="pointer-events-none fixed inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,_rgba(15,45,71,0.16),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(45,149,97,0.18),_transparent_26%),linear-gradient(180deg,_#f7fafc_0%,_#edf3f8_100%)]" />
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-60" style={{ backgroundImage: 'linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden">
        <TabsContent value="messagerie" className="relative m-0 flex min-h-0 flex-1 flex-col overflow-hidden">
          {afficherGuide && <GuideCompletModules onClose={() => setAfficherGuide(false)} />}
          {afficherGuideCompleta && <GuiaCompletaApp onClose={() => setAfficherGuideCompleta(false)} />}
          <Dialog open={isWorkspaceDialogOpen} onOpenChange={(open) => { if (!open) closeWorkspaceDialog(); }}>
            <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto" aria-describedby="workspace-chat-dialog-description">
              <DialogHeader>
                <DialogTitle>
                  {workspaceDialogMode === 'team' && (workspaceEditingTeamId ? 'Modifier l’équipe' : 'Créer une équipe')}
                  {workspaceDialogMode === 'channel' && (workspaceEditingChannelId ? 'Modifier le canal' : 'Créer un canal')}
                  {workspaceDialogMode === 'event' && (workspaceEditingEventId ? 'Modifier l’événement' : 'Programmer un événement')}
                </DialogTitle>
                <DialogDescription id="workspace-chat-dialog-description">
                  {workspaceDialogMode === 'team' && (workspaceEditingTeamId ? 'Mettez à jour le périmètre et les membres de cette équipe.' : 'Regroupez des utilisateurs créés dans un espace commun de travail.')}
                  {workspaceDialogMode === 'channel' && (workspaceEditingChannelId ? 'Ajustez le nom, les membres ou le rattachement de ce canal.' : 'Définissez un canal libre ou rattaché à une équipe existante.')}
                  {workspaceDialogMode === 'event' && (workspaceEditingEventId ? 'Modifiez les participants, dates ou le contexte de cet événement.' : 'Planifiez une réunion ou un créneau depuis le calendrier du module.')}
                </DialogDescription>
              </DialogHeader>

              {workspaceDialogMode === 'team' && (
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700">Nom</p>
                      <Input
                        value={workspaceTeamForm.name}
                        onChange={(event) => setWorkspaceTeamForm((previous) => ({ ...previous, name: event.target.value }))}
                        placeholder="Ex. Coordination terrain"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700">Description</p>
                      <Input
                        value={workspaceTeamForm.description}
                        onChange={(event) => setWorkspaceTeamForm((previous) => ({ ...previous, description: event.target.value }))}
                        placeholder="Mission, périmètre ou projet"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-700">Membres</p>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {workspaceTeamForm.memberIds.length} sélectionné(s)
                      </span>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {[currentUserId, ...activeWorkspaceUsers.map((user) => user.id)].map((memberId) => {
                        const isCurrentUser = memberId === currentUserId;
                        return (
                          <label key={memberId} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={workspaceTeamForm.memberIds.includes(memberId)}
                              disabled={isCurrentUser}
                              onChange={(event) => setWorkspaceTeamForm((previous) => ({
                                ...previous,
                                memberIds: toggleWorkspaceMemberSelection(previous.memberIds, memberId, event.target.checked),
                              }))}
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                            />
                            <span>
                              <span className="block font-semibold text-slate-900">{isCurrentUser ? `${currentUserName} (vous)` : getWorkspaceUserLabel(memberId)}</span>
                              <span className="block text-[12px] text-slate-500">{isCurrentUser ? currentUserRoleLabel : getWorkspaceRoleLabel(memberId)}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {workspaceDialogMode === 'channel' && (
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700">Nom du canal</p>
                      <Input
                        value={workspaceChannelForm.name}
                        onChange={(event) => setWorkspaceChannelForm((previous) => ({ ...previous, name: event.target.value }))}
                        placeholder="Ex. livraison-soir"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700">Équipe liée</p>
                      <select
                        value={workspaceChannelForm.teamId}
                        onChange={(event) => setWorkspaceChannelForm((previous) => ({
                          ...previous,
                          teamId: event.target.value,
                          memberIds: event.target.value
                            ? teamChatTeams.find((team) => team.id === event.target.value)?.memberIds || [currentUserId]
                            : [currentUserId],
                        }))}
                        className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                      >
                        <option value="">Aucune équipe liée</option>
                        {teamChatTeams.map((team) => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">Description</p>
                    <Input
                      value={workspaceChannelForm.description}
                      onChange={(event) => setWorkspaceChannelForm((previous) => ({ ...previous, description: event.target.value }))}
                      placeholder="Sujet du canal, usage ou consignes"
                    />
                  </div>
                  {workspaceChannelForm.teamId ? (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      Membres hérités de l’équipe : {workspaceChannelForm.memberIds.map((memberId) => getWorkspaceUserLabel(memberId)).join(', ')}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-700">Membres du canal</p>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                          {workspaceChannelForm.memberIds.length} sélectionné(s)
                        </span>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        {[currentUserId, ...activeWorkspaceUsers.map((user) => user.id)].map((memberId) => {
                          const isCurrentUser = memberId === currentUserId;
                          return (
                            <label key={memberId} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                              <input
                                type="checkbox"
                                checked={workspaceChannelForm.memberIds.includes(memberId)}
                                disabled={isCurrentUser}
                                onChange={(event) => setWorkspaceChannelForm((previous) => ({
                                  ...previous,
                                  memberIds: toggleWorkspaceMemberSelection(previous.memberIds, memberId, event.target.checked),
                                }))}
                                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                              />
                              <span>
                                <span className="block font-semibold text-slate-900">{isCurrentUser ? `${currentUserName} (vous)` : getWorkspaceUserLabel(memberId)}</span>
                                <span className="block text-[12px] text-slate-500">{isCurrentUser ? currentUserRoleLabel : getWorkspaceRoleLabel(memberId)}</span>
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {workspaceDialogMode === 'event' && (
                <div className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700">Titre</p>
                      <Input
                        value={workspaceEventForm.title}
                        onChange={(event) => setWorkspaceEventForm((previous) => ({ ...previous, title: event.target.value }))}
                        placeholder="Ex. Point quotidien terrain"
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700">Contexte</p>
                      <select
                        value={workspaceEventForm.channelId || workspaceEventForm.teamId}
                        onChange={(event) => {
                          const nextValue = event.target.value;
                          const nextChannel = teamChatChannels.find((channel) => channel.id === nextValue);
                          const nextTeam = teamChatTeams.find((team) => team.id === nextValue);
                          setWorkspaceEventForm((previous) => ({
                            ...previous,
                            channelId: nextChannel?.id || '',
                            teamId: nextChannel?.teamId || nextTeam?.id || '',
                            participantIds: nextChannel?.memberIds || nextTeam?.memberIds || previous.participantIds,
                          }));
                        }}
                        className="h-10 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
                      >
                        <option value="">Aucun contexte spécifique</option>
                        {teamChatTeams.map((team) => (
                          <option key={team.id} value={team.id}>{`Équipe • ${team.name}`}</option>
                        ))}
                        {teamChatChannels.map((channel) => (
                          <option key={channel.id} value={channel.id}>{`Canal • #${channel.name}`}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700">Début</p>
                      <Input
                        type="datetime-local"
                        value={workspaceEventForm.startAt}
                        onChange={(event) => setWorkspaceEventForm((previous) => ({ ...previous, startAt: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-slate-700">Fin</p>
                      <Input
                        type="datetime-local"
                        value={workspaceEventForm.endAt}
                        onChange={(event) => setWorkspaceEventForm((previous) => ({ ...previous, endAt: event.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">Détails</p>
                    <TextareaSpellCheck
                      value={workspaceEventForm.description}
                      onChange={(event) => setWorkspaceEventForm((previous) => ({ ...previous, description: event.target.value }))}
                      placeholder="Objectif, ordre du jour, lien utile ou contraintes"
                      className="min-h-[110px] rounded-2xl border-slate-200 bg-white"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-700">Participants</p>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {workspaceEventForm.participantIds.length} sélectionné(s)
                      </span>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      {[currentUserId, ...activeWorkspaceUsers.map((user) => user.id)].map((memberId) => {
                        const isCurrentUser = memberId === currentUserId;
                        return (
                          <label key={memberId} className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-700">
                            <input
                              type="checkbox"
                              checked={workspaceEventForm.participantIds.includes(memberId)}
                              disabled={isCurrentUser}
                              onChange={(event) => setWorkspaceEventForm((previous) => ({
                                ...previous,
                                participantIds: toggleWorkspaceMemberSelection(previous.participantIds, memberId, event.target.checked),
                              }))}
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                            />
                            <span>
                              <span className="block font-semibold text-slate-900">{isCurrentUser ? `${currentUserName} (vous)` : getWorkspaceUserLabel(memberId)}</span>
                              <span className="block text-[12px] text-slate-500">{isCurrentUser ? currentUserRoleLabel : getWorkspaceRoleLabel(memberId)}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeWorkspaceDialog}>Annuler</Button>
                {workspaceDialogMode === 'team' && <Button type="button" onClick={submitWorkspaceTeam} disabled={!accessProfile.canManageWorkspace}>{workspaceEditingTeamId ? 'Enregistrer' : 'Créer l’équipe'}</Button>}
                {workspaceDialogMode === 'channel' && <Button type="button" onClick={submitWorkspaceChannel} disabled={!accessProfile.canManageWorkspace}>{workspaceEditingChannelId ? 'Enregistrer' : 'Créer le canal'}</Button>}
                {workspaceDialogMode === 'event' && <Button type="button" onClick={submitWorkspaceEvent} disabled={!accessProfile.canManageWorkspace}>{workspaceEditingEventId ? 'Enregistrer' : 'Programmer'}</Button>}
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {usersTyping.length > 0 && (
            <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform">
              {usersTyping.length === 1 ? (
                <TypingIndicator userName={usersTyping[0].name} departmentName={usersTyping[0].dept} />
              ) : (
                <TypingIndicatorCompact count={usersTyping.length} />
              )}
            </div>
          )}

          <div className="flex min-h-0 flex-1 overflow-hidden p-2 md:p-2.5">
            {true ? renderTeamWorkspaceView() : vue === 'liste' && (
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
                          <p className="mt-1 text-sm text-slate-600">Ajoutez un ou plusieurs fichiers locaux sans limite imposée par l’interface.</p>
                        </div>
                        <div className="relative" ref={composerActionsRef}>
                          <Button type="button" variant="outline" onClick={() => toggleComposerMenu('media')} className="rounded-2xl border-slate-300 bg-white" disabled={!accessProfile.canUseAttachments}>
                            <Paperclip className="mr-2 h-4 w-4" />
                            Médias
                          </Button>
                          {openComposerMenu === 'media' && (
                            <div className="absolute right-0 top-full z-20 mt-2 flex min-w-[190px] flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_-24px_rgba(15,45,71,0.28)]">
                              <button type="button" onClick={() => ouvrirOptionMedia()} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                                <Paperclip className="h-4 w-4" />
                                Fichier
                              </button>
                              <button type="button" onClick={() => ouvrirOptionMedia('image/*')} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                                <Image className="h-4 w-4" />
                                Image
                              </button>
                              <button type="button" onClick={() => ouvrirOptionMedia('video/*')} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                                <Video className="h-4 w-4" />
                                Vidéo
                              </button>
                              <button type="button" onClick={() => ouvrirOptionMedia('audio/*')} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                                <Mic className="h-4 w-4" />
                                Audio
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={attachmentPickerAccept}
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
                            <div className="relative" ref={composerActionsRef}>
                              <Button type="button" variant="outline" onClick={() => toggleComposerMenu('media')} className="rounded-2xl border-slate-300 bg-white" disabled={!accessProfile.canUseAttachments}>
                                <Paperclip className="mr-2 h-4 w-4" />
                                Médias
                              </Button>
                              {openComposerMenu === 'media' && (
                                <div className="absolute right-0 top-full z-20 mt-2 flex min-w-[190px] flex-col gap-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_18px_40px_-24px_rgba(15,45,71,0.28)]">
                                  <button type="button" onClick={() => ouvrirOptionMedia()} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                                    <Paperclip className="h-4 w-4" />
                                    Fichier
                                  </button>
                                  <button type="button" onClick={() => ouvrirOptionMedia('image/*')} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                                    <Image className="h-4 w-4" />
                                    Image
                                  </button>
                                  <button type="button" onClick={() => ouvrirOptionMedia('video/*')} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                                    <Video className="h-4 w-4" />
                                    Vidéo
                                  </button>
                                  <button type="button" onClick={() => ouvrirOptionMedia('audio/*')} className="flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50">
                                    <Mic className="h-4 w-4" />
                                    Audio
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept={attachmentPickerAccept}
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
