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
  TypeMessage,
  StatutDemande,
  PrioriteDemande,
  TypeDemande,
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
  obtenirStatistiquesDepartement
} from '../utils/communicationInterneStorage';
import { obtenerDepartamentos, type Departamento } from '../utils/departamentosStorage';
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
  const currentUserId = 'user-current'; // En producción, obtener del contexto de autenticación
  
  // Formulaire nouveau message
  const [formData, setFormData] = useState({
    type: 'message' as TypeMessage,
    departementDestinataire: '',
    departementDestinataires: [] as string[], // Nuevo: múltiples destinatarios
    isGroupMessage: false, // Nuevo: flag para mensaje grupal
    sujet: '',
    contenu: '',
    typeDemande: 'information' as TypeDemande,
    priorite: 'normale' as PrioriteDemande,
    dateEcheance: ''
  });

  useEffect(() => {
    chargerDonnees();
    // Simular indicador de escritura aleatorio para demo
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
  }, []);

  useEffect(() => {
    if (departementActuel) {
      const notifs = obtenirNotificationsNonLues(departementActuel);
      setNotificationsNonLues(notifs.length);
    }
  }, [departementActuel, messages]);

  const chargerDonnees = () => {
    const msgs = obtenirMessages() as ExtendedMessage[];
    const depts = obtenerDepartamentos();
    
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
    
    if (depts.length > 0 && !departementActuel) {
      setDepartementActuel(depts[0].id);
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
    // Validar según tipo de mensaje
    const hasDestinataire = formData.isGroupMessage 
      ? formData.departementDestinataires.length > 0 
      : formData.departementDestinataire;
    
    if (!hasDestinataire || !formData.sujet || !formData.contenu) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    const deptActuel = departements.find(d => d.id === departementActuel);
    if (!deptActuel) return;
    
    // Si es mensaje grupal, enviar a múltiples destinatarios
    if (formData.isGroupMessage) {
      formData.departementDestinataires.forEach(destId => {
        const destDept = departements.find(d => d.id === destId);
        envoyerMessage({
          type: formData.type,
          departementEmetteur: departementActuel,
          departementDestinataire: destId,
          expediteur: `Responsable ${deptActuel.nombre}`,
          expediteurId: currentUserId,
          sujet: `[GROUPE] ${formData.sujet}`,
          contenu: formData.contenu,
          piecesJointes: [],
          typeDemande: formData.type === 'demande' ? formData.typeDemande : undefined,
          priorite: formData.type === 'demande' ? formData.priorite : undefined,
          statut: formData.type === 'demande' ? 'en_attente' : undefined,
          dateEcheance: formData.dateEcheance || undefined,
          important: false
        });
      });
      toast.success(`Message envoyé à ${formData.departementDestinataires.length} département(s)`);
    } else {
      // Mensaje individual normal
      envoyerMessage({
        type: formData.type,
        departementEmetteur: departementActuel,
        departementDestinataire: formData.departementDestinataire,
        expediteur: `Responsable ${deptActuel.nombre}`,
        expediteurId: currentUserId,
        sujet: formData.sujet,
        contenu: formData.contenu,
        piecesJointes: [],
        typeDemande: formData.type === 'demande' ? formData.typeDemande : undefined,
        priorite: formData.type === 'demande' ? formData.priorite : undefined,
        statut: formData.type === 'demande' ? 'en_attente' : undefined,
        dateEcheance: formData.dateEcheance || undefined,
        important: false
      });
      toast.success('Message envoyé avec succès');
    }
    
    chargerDonnees();
    setVue('liste');
    setFormData({
      type: 'message',
      departementDestinataire: '',
      departementDestinataires: [],
      isGroupMessage: false,
      sujet: '',
      contenu: '',
      typeDemande: 'information',
      priorite: 'normale',
      dateEcheance: ''
    });
  };

  const handleRepondre = () => {
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
      expediteur: `Responsable ${deptActuel.nombre}`,
      expediteurId: currentUserId,
      sujet: `RE: ${messageSelectionne.sujet}`,
      contenu: formData.contenu,
      piecesJointes: [],
      important: false
    });
    
    chargerDonnees();
    setVue('detail');
    setFormData({ ...formData, contenu: '' });
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
    modifierStatutDemande(msg.id, statut);
    chargerDonnees();
    toast.success(`Statut modifié: ${statut}`);
  };

  const handleSupprimer = (msg: ExtendedMessage) => {
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
    if (!formData.departementDestinataire || !formData.sujet) {
      toast.error('Veuillez remplir le destinataire et le sujet');
      return;
    }
    
    const deptActuel = departements.find(d => d.id === departementActuel);
    if (!deptActuel) return;
    
    const pollMessage: any = {
      type: 'message',
      departementEmetteur: departementActuel,
      departementDestinataire: formData.departementDestinataire,
      expediteur: `Responsable ${deptActuel.nombre}`,
      expediteurId: currentUserId,
      sujet: formData.sujet,
      contenu: `📊 Sondage: ${poll.question}`,
      piecesJointes: [],
      important: false,
      poll: poll
    };
    
    envoyerMessage(pollMessage);
    chargerDonnees();
    setShowPollCreator(false);
    setVue('liste');
    setFormData({
      type: 'message',
      departementDestinataire: '',
      sujet: '',
      contenu: '',
      typeDemande: 'information',
      priorite: 'normale',
      dateEcheance: ''
    });
    
    toast.success('Sondage créé et envoyé');
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
  const tauxLecture = messagesDepartement.length > 0
    ? Math.max(0, Math.min(100, Math.round(((messagesDepartement.length - nonLusCount) / messagesDepartement.length) * 100)))
    : 100;
  const resetFormData = (overrides?: Partial<typeof formData>) => {
    setFormData({
      type: 'message',
      departementDestinataire: '',
      departementDestinataires: [],
      isGroupMessage: false,
      sujet: '',
      contenu: '',
      typeDemande: 'information',
      priorite: 'normale',
      dateEcheance: '',
      ...overrides
    });
  };
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
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_340px]">
            <div className="overflow-hidden rounded-[34px] border border-white/70 bg-white/92 shadow-[0_30px_70px_-42px_rgba(15,45,71,0.32)] backdrop-blur-xl">
              <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:p-7">
                <div>
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
                        Un workspace de coordination plus net, pensé pour traiter les messages, demandes et réponses avec une lecture rapide et un ton professionnel.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-2.5">
                    <span className="rounded-full border border-slate-200 bg-slate-100 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                      {departementCourant?.nombre || 'Aucun département'}
                    </span>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                      {nonLusCount} non lu(s)
                    </span>
                    <span className="rounded-full border border-violet-200 bg-violet-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">
                      {demandesOuvertes.length} demande(s) ouverte(s)
                    </span>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Reçus</p>
                      <p className="mt-3 text-3xl font-bold text-slate-900">{messagesRecusCount}</p>
                      <p className="mt-1 text-sm text-slate-500">Messages à traiter</p>
                    </div>
                    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Envoyés</p>
                      <p className="mt-3 text-3xl font-bold text-slate-900">{messagesEnvoyesCount}</p>
                      <p className="mt-1 text-sm text-slate-500">Suivis en circulation</p>
                    </div>
                    <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Lecture</p>
                      <p className="mt-3 text-3xl font-bold text-emerald-900">{tauxLecture}%</p>
                      <p className="mt-1 text-sm text-emerald-800">Messages déjà lus</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] bg-slate-950 p-5 text-white shadow-[0_24px_64px_-36px_rgba(15,23,42,0.72)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Cockpit</p>
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Département actif</label>
                      <select
                        value={departementActuel}
                        onChange={(e) => setDepartementActuel(e.target.value)}
                        className="h-12 w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                      >
                        {departements.filter(d => d.activo).map(dept => (
                          <option key={dept.id} value={dept.id}>
                            {dept.nombre} ({dept.codigo})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Importants</p>
                        <p className="mt-2 text-2xl font-bold">{importantsCount}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Épinglés</p>
                        <p className="mt-2 text-2xl font-bold">{epinglesCount}</p>
                      </div>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          marquerToutesNotificationsLues(departementActuel);
                          setNotificationsNonLues(0);
                          toast.success('Notifications marquées comme lues');
                        }}
                        className="h-11 w-full rounded-2xl border-slate-700 bg-transparent text-white hover:bg-slate-900"
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
                        onClick={() => {
                          setVue('nouveau');
                          setShowPollCreator(false);
                          resetFormData();
                        }}
                        className="h-11 w-full rounded-2xl bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Nouveau message
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => setVue('statistiques')}
                        className="h-11 w-full rounded-2xl border-slate-700 bg-transparent text-white hover:bg-slate-900"
                      >
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Voir les statistiques
                      </Button>
                    </div>
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

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[32px] border border-white/70 bg-white/92 p-5 shadow-[0_30px_70px_-42px_rgba(15,45,71,0.25)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Priorités du jour</p>
                    <h2 className="mt-2 text-xl font-bold text-slate-950">Vue rapide</h2>
                  </div>
                  <Zap className="h-5 w-5 text-amber-500" />
                </div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Demandes urgentes</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{orderedMessagesDepartement.filter(message => message.type === 'demande' && message.priorite === 'urgente' && !message.archive).length}</p>
                  </div>
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Archives</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{archivesCount}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[32px] border border-white/70 bg-white/92 p-5 shadow-[0_30px_70px_-42px_rgba(15,45,71,0.25)] backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Aide</p>
                    <h2 className="mt-2 text-xl font-bold text-slate-950">Raccourcis</h2>
                  </div>
                  <BookOpen className="h-5 w-5 text-[#1a4d7a]" />
                </div>
                <div className="mt-4 space-y-2.5">
                  <Button variant="outline" onClick={() => setAfficherGuide(true)} className="h-11 w-full justify-start rounded-2xl border-slate-200 bg-white text-slate-700">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Ouvrir le guide du module
                  </Button>
                  <Button variant="outline" onClick={() => setAfficherGuideCompleta(true)} className="h-11 w-full justify-start rounded-2xl border-slate-200 bg-white text-slate-700">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Guide complet de l'application
                  </Button>
                </div>
              </div>
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

          <div className="flex-1 overflow-hidden px-4 pb-4 md:px-6 md:pb-6">
            {vue === 'liste' && (
              <div className="grid h-full grid-cols-1 gap-5 xl:grid-cols-[280px_minmax(0,1fr)_300px]">
                <aside className="min-h-0 space-y-4 xl:overflow-y-auto xl:pr-1">
                  <div className="rounded-[30px] border border-white/70 bg-white/94 p-5 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Bureau actif</p>
                        <h3 className="mt-2 text-2xl font-bold text-slate-950">{departementCourant?.nombre || 'Département'}</h3>
                        <p className="mt-1 text-sm text-slate-600">Une lecture centralisée de votre file de traitement.</p>
                      </div>
                      <div className="rounded-2xl bg-slate-100 px-3 py-2 text-right">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Code</p>
                        <p className="text-sm font-semibold text-slate-700">{departementCourant?.codigo || '--'}</p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">À lire</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{nonLusCount}</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50 p-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-700">Demandes</p>
                        <p className="mt-2 text-2xl font-bold text-emerald-900">{demandesCount}</p>
                      </div>
                      <div className="rounded-2xl bg-amber-50 p-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-amber-700">Importants</p>
                        <p className="mt-2 text-2xl font-bold text-amber-900">{importantsCount}</p>
                      </div>
                      <div className="rounded-2xl bg-fuchsia-50 p-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-fuchsia-700">Épinglés</p>
                        <p className="mt-2 text-2xl font-bold text-fuchsia-900">{epinglesCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[30px] border border-white/70 bg-white/94 p-5 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Rechercher un message ou un expéditeur"
                        value={recherche}
                        onChange={(e) => setRecherche(e.target.value)}
                        className="h-11 rounded-2xl border-slate-200 bg-slate-50 pl-11 text-sm"
                      />
                    </div>

                    <div className="mt-4 space-y-2">
                      {filterOptions.map(option => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setFiltre(option.id);
                            setRecherche('');
                          }}
                          className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                            filtre === option.id
                              ? `bg-gradient-to-r ${option.tone} shadow-sm`
                              : 'border-transparent bg-slate-50 text-slate-700 hover:border-slate-200 hover:bg-white'
                          }`}
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                            {option.icon}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{option.label}</span>
                          </span>
                          {typeof option.count === 'number' && (
                            <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                              {option.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[30px] border border-white/70 bg-white/94 p-5 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">Actions rapides</h3>
                        <p className="text-sm text-slate-600">Créez et déclenchez les flux les plus utilisés.</p>
                      </div>
                      <Zap className="h-5 w-5 text-amber-500" />
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setVue('nouveau');
                          setShowPollCreator(false);
                          resetFormData();
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl bg-slate-950 px-4 py-3 text-left text-white transition-transform hover:scale-[1.01]"
                      >
                        <Plus className="h-5 w-5" />
                        <span className="font-semibold">Nouveau message</span>
                      </button>

                      <button
                        onClick={() => {
                          const deptRecrutement = departements.find(d => d.codigo === 'RECRUTEMENT');
                          setVue('nouveau');
                          setShowPollCreator(false);
                          resetFormData({
                            type: 'demande',
                            departementDestinataire: deptRecrutement?.id || '',
                            sujet: 'Demande de volontaire',
                            typeDemande: 'demande_volontaire'
                          });
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left text-emerald-900 transition-colors hover:bg-emerald-100"
                      >
                        <UserPlus className="h-5 w-5" />
                        <span className="font-semibold">Demander un bénévole</span>
                      </button>

                      <button
                        onClick={() => {
                          setVue('nouveau');
                          setShowPollCreator(false);
                          resetFormData({ isGroupMessage: true });
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-amber-900 transition-colors hover:bg-amber-100"
                      >
                        <Users className="h-5 w-5" />
                        <span className="font-semibold">Message de groupe</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowPollCreator(true);
                          setVue('nouveau');
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-left text-violet-900 transition-colors hover:bg-violet-100"
                      >
                        <BarChart3 className="h-5 w-5" />
                        <span className="font-semibold">Créer un sondage</span>
                      </button>
                    </div>
                  </div>
                </aside>

                <section className="flex min-h-0 flex-col overflow-hidden rounded-[30px] border border-white/70 bg-white/94 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                  <div className="border-b border-slate-200/80 px-5 py-5 md:px-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Boîte de travail</p>
                        <h3 className="mt-2 text-2xl font-bold text-slate-950">
                          {recherche ? 'Résultats de recherche' : 'Fil principal'}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {messagesFiltres.length} message(s) visible(s){recherche ? ` pour "${recherche}"` : ' dans la vue active'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                          {filtre.replace('_', ' ')}
                        </span>
                        <Button variant="outline" onClick={() => setVue('statistiques')} className="rounded-full border-slate-300 bg-white text-slate-700">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Statistiques
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6">
                    {messagesFiltres.length === 0 ? (
                      <div className="flex h-full min-h-[360px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50/80 px-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                          <Inbox className="h-8 w-8 text-slate-400" />
                        </div>
                        <h4 className="mt-6 text-xl font-semibold text-slate-950">Aucun message à afficher</h4>
                        <p className="mt-2 max-w-md text-sm text-slate-600">
                          Ajustez votre filtre, lancez une autre recherche ou créez un nouveau message depuis le panneau de gauche.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messagesFiltres.map(msg => {
                          const deptEmetteur = departements.find(d => d.id === msg.departementEmetteur);
                          const deptDest = departements.find(d => d.id === msg.departementDestinataire);
                          const isPinned = pinnedMessages.includes(msg.id);
                          const isUnread = !msg.lu && msg.departementDestinataire === departementActuel;

                          return (
                            <article
                              key={msg.id}
                              className={`group relative overflow-hidden rounded-[30px] border px-5 py-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                                isUnread
                                  ? 'border-l-[6px] border-l-[#1a4d7a] border-r-slate-200 border-t-slate-200 border-b-slate-200 bg-blue-50/50'
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                                      {getIconeType(msg.type)}
                                    </span>
                                    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                                      {msg.departementEmetteur === departementActuel ? `À ${deptDest?.nombre || 'Département'}` : `De ${deptEmetteur?.nombre || 'Département'}`}
                                    </span>
                                    {isPinned && (
                                      <span className="rounded-full border border-fuchsia-200 bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700">
                                        Épinglé
                                      </span>
                                    )}
                                    {msg.important && (
                                      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                        Important
                                      </span>
                                    )}
                                    {msg.statut && (
                                      <span className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                                        {getIconeStatut(msg.statut)}
                                        {msg.statut.replace('_', ' ')}
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="min-w-0 flex-1">
                                      <h4 className="text-xl font-semibold leading-tight text-slate-950">{msg.sujet}</h4>
                                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{msg.contenu}</p>
                                    </div>

                                    {msg.priorite && (
                                      <span className={`self-start rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getPrioriteColor(msg.priorite)}`}>
                                        {msg.priorite}
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
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
                                    {msg.piecesJointes.length > 0 && (
                                      <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">
                                        {msg.piecesJointes.length} pièce(s) jointe(s)
                                      </span>
                                    )}
                                    {msg.reponses.length > 0 && (
                                      <span className="rounded-full bg-blue-100 px-2.5 py-1 font-semibold text-blue-700">
                                        {msg.reponses.length} réponse(s)
                                      </span>
                                    )}
                                    {msg.poll && (
                                      <span className="rounded-full bg-violet-100 px-2.5 py-1 font-semibold text-violet-700">
                                        Sondage
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="lg:w-[220px] lg:pl-4">
                                  <MessageActions
                                    onReply={() => {
                                      setMessageSelectionne(msg);
                                      setVue('repondre');
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

                <aside className="min-h-0 space-y-4 xl:overflow-y-auto xl:pl-1">
                  <div className="rounded-[30px] border border-white/70 bg-white/94 p-5 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Focus</p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-950">À surveiller</h3>
                      </div>
                      <Bell className="h-5 w-5 text-rose-500" />
                    </div>

                    <div className="mt-4 space-y-3">
                      {spotlightMessages.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                          Aucun message prioritaire pour le moment.
                        </div>
                      ) : spotlightMessages.map(message => (
                        <button
                          key={message.id}
                          type="button"
                          onClick={() => {
                            setMessageSelectionne(message);
                            setVue('detail');
                          }}
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors hover:bg-white"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="truncate text-sm font-semibold text-slate-900">{message.sujet}</span>
                            <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-slate-500">
                              {new Date(message.dateCreation).toLocaleDateString('fr-CA')}
                            </span>
                          </div>
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{message.contenu}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[30px] border border-white/70 bg-white/94 p-5 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Chronologie</p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-950">Récents</h3>
                      </div>
                      <Clock className="h-5 w-5 text-slate-400" />
                    </div>

                    <div className="mt-4 space-y-3">
                      {messagesRecents.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                          Aucun échange récent.
                        </div>
                      ) : messagesRecents.map(message => (
                        <div key={message.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                            {getIconeType(message.type)}
                            <span>{message.type}</span>
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900">{message.sujet}</p>
                          <p className="mt-2 text-xs text-slate-500">{new Date(message.dateCreation).toLocaleString('fr-CA')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </aside>
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

                              {messageSelectionne.departementDestinataire === departementActuel && (
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
                            <QuickReplyButton onClick={() => setVue('repondre')} />
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
                                  <Button variant="ghost" size="sm" className="rounded-full">
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
                        <Button onClick={() => setVue('repondre')} className="h-11 w-full rounded-2xl bg-slate-950 hover:bg-slate-800">
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

                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <Button variant="outline" onClick={() => setVue('detail')} className="h-11 rounded-2xl border-slate-300 px-5">
                        Annuler
                      </Button>
                      <Button onClick={handleRepondre} className="h-11 rounded-2xl bg-slate-950 px-5 hover:bg-slate-800">
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
                <div className="mx-auto max-w-7xl">
                  {showPollCreator ? (
                    <div className="rounded-[32px] border border-white/70 bg-white/94 p-4 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)] md:p-6">
                      <PollCreator
                        onCreatePoll={handleCreatePoll}
                        onCancel={() => {
                          setShowPollCreator(false);
                          setVue('liste');
                        }}
                      />
                    </div>
                  ) : (
                    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                      <div className="rounded-[32px] border border-white/70 bg-white/94 p-6 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)] md:p-8">
                        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Composition</p>
                            <h2 className="mt-2 text-3xl font-bold text-slate-950">Nouveau message</h2>
                            <p className="mt-1 text-sm text-slate-600">Une composition plus structurée, moderne et orientée clarté.</p>
                          </div>
                          <Button variant="ghost" onClick={() => setVue('liste')} className="self-start rounded-full text-slate-600">
                            <X className="h-5 w-5" />
                          </Button>
                        </div>

                        <div className="mt-6 space-y-6">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                              <label className="mb-2 block text-sm font-semibold text-slate-800">Type de message</label>
                              <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as TypeMessage })}
                                className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm"
                              >
                                <option value="message">Message</option>
                                <option value="demande">Demande</option>
                                <option value="document">Document</option>
                                <option value="alerte">Alerte</option>
                                <option value="annonce">Annonce</option>
                              </select>
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
                                  className="h-11 w-full rounded-2xl border border-slate-300 bg-white px-4 text-sm"
                                >
                                  <option value="">Sélectionner un département</option>
                                  {departements.filter(d => d.activo && d.id !== departementActuel).map(dept => (
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
                                          const allDeptIds = departements.filter(d => d.activo && d.id !== departementActuel).map(d => d.id);
                                          setFormData({ ...formData, departementDestinataires: allDeptIds });
                                        }}
                                        className="underline"
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
                                    {departements.filter(d => d.activo && d.id !== departementActuel).map(dept => (
                                      <label key={dept.id} className="flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2 hover:bg-violet-50">
                                        <input
                                          type="checkbox"
                                          checked={formData.departementDestinataires.includes(dept.id)}
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
                              placeholder="Exemple : coordination, suivi, information urgente"
                              className="h-11 rounded-2xl border-slate-300 bg-white"
                            />
                          </div>

                          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <label className="text-sm font-semibold text-slate-800">Contenu du message</label>
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
                                placeholder="Rédigez votre message ici..."
                                language="fr"
                                showSpellCheck={true}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-4 rounded-[28px] border border-violet-200 bg-violet-50 p-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-sm font-semibold text-violet-900">Ajouter un sondage</p>
                              <p className="mt-1 text-sm text-violet-700">Créez une consultation rapide sans quitter la composition.</p>
                            </div>
                            <Button onClick={() => setShowPollCreator(true)} className="rounded-2xl bg-violet-700 hover:bg-violet-800">
                              <BarChart3 className="mr-2 h-4 w-4" />
                              Ouvrir le créateur
                            </Button>
                          </div>

                          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <Button variant="outline" onClick={() => setVue('liste')} className="h-11 rounded-2xl border-slate-300 px-5">
                              Annuler
                            </Button>
                            <Button onClick={handleEnvoyerMessage} className="h-11 rounded-2xl bg-slate-950 px-5 hover:bg-slate-800">
                              <Send className="mr-2 h-4 w-4" />
                              Envoyer le message
                            </Button>
                          </div>
                        </div>
                      </div>

                      <aside className="space-y-4">
                        <div className="rounded-[30px] border border-white/70 bg-white/94 p-5 shadow-[0_24px_60px_-44px_rgba(15,45,71,0.28)]">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Contrôle d'envoi</p>
                          <h3 className="mt-2 text-lg font-semibold text-slate-950">Synthèse</h3>
                          <div className="mt-4 space-y-3 text-sm text-slate-600">
                            <div className="flex items-center justify-between gap-3">
                              <span>Mode</span>
                              <span className="font-semibold text-slate-800">{formData.isGroupMessage ? 'Groupe' : 'Individuel'}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span>Type</span>
                              <span className="font-semibold capitalize text-slate-800">{formData.type}</span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                              <span>Destinataires</span>
                              <span className="font-semibold text-slate-800">{formData.isGroupMessage ? formData.departementDestinataires.length : (formData.departementDestinataire ? 1 : 0)}</span>
                            </div>
                          </div>
                        </div>
                      </aside>
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
