import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { copiarAlPortapapeles } from '../utils/clipboard';
import { GuiaCommunicationInterne } from './GuiaCommunicationInterne';
import { GuiaCompletaApp } from './GuiaCompletaApp';
import { GuideCompletModules } from './GuideCompletModules';
import { TextareaSpellCheck } from './ui/textarea-spell-check';
import { TextCorrector } from './backup/TextCorrector';
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
    <div className="min-h-screen relative">
      {/* Fondo degradado moderno */}
      <div 
        className="fixed inset-0 -z-20"
        style={{
          background: 'linear-gradient(135deg, #0f2d47 0%, #1a4d7a 25%, #2d9561 75%, #3cb371 100%)'
        }}
      />
      
      {/* Patrón de puntos decorativo */}
      <div 
        className="fixed inset-0 opacity-10 -z-10"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      />

      {/* Header principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col">
        <div className="px-4 pt-4 md:px-6 md:pt-6">
          <div className="overflow-hidden rounded-[32px] border border-white/60 bg-white/92 shadow-[0_28px_90px_-52px_rgba(15,45,71,0.55)] backdrop-blur-xl">
            <div className="flex flex-col gap-5 p-5 md:p-6 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
                  <MessageSquare className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Coordination interne</p>
                  <h1 className="mt-2 text-3xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Messagerie Interne
                  </h1>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    Un espace plus net pour écrire, suivre et traiter les échanges entre départements.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                      {departementCourant?.nombre || 'Aucun département'}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                      {notificationsNonLues} notification(s)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 xl:max-w-[520px]">
                <select
                  value={departementActuel}
                  onChange={(e) => setDepartementActuel(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1a4d7a]/30"
                >
                  {departements.filter(d => d.activo).map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.nombre} ({dept.codigo})
                    </option>
                  ))}
                </select>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      marquerToutesNotificationsLues(departementActuel);
                      setNotificationsNonLues(0);
                      toast.success('Notifications marquées comme lues');
                    }}
                    className="h-11 rounded-2xl border-slate-300 bg-white px-4 text-slate-700"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Tout lire
                    {notificationsNonLues > 0 && (
                      <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                        {notificationsNonLues}
                      </span>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setVue('statistiques')}
                    className="h-11 rounded-2xl border-slate-300 bg-white px-4 text-slate-700"
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Statistiques
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setAfficherGuide(true)}
                    className="h-11 rounded-2xl border-slate-300 bg-white px-4 text-slate-700"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Guide
                  </Button>

                  <Button
                    onClick={() => {
                      setVue('nouveau');
                      setShowPollCreator(false);
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
                    }}
                    className="h-11 rounded-2xl bg-slate-900 px-4 hover:bg-slate-800"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau message
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200/80 p-3 md:p-4">
              <TabsList className="grid h-auto w-full grid-cols-2 rounded-[22px] bg-slate-100 p-1.5">
                <TabsTrigger
                  value="messagerie"
                  className="rounded-[18px] px-4 py-3 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Messagerie
                </TabsTrigger>
                <TabsTrigger
                  value="correction"
                  className="rounded-[18px] px-4 py-3 text-sm font-semibold text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Correction de texte
                </TabsTrigger>
              </TabsList>
            </div>
          </div>
        </div>

        {/* Tab Content: Messagerie */}
        <TabsContent value="messagerie" className="relative z-0 flex-1 min-h-0 flex flex-col m-0 overflow-hidden">
          {afficherGuide && (
            <GuideCompletModules onClose={() => setAfficherGuide(false)} />
          )}

          {afficherGuideCompleta && (
            <GuiaCompletaApp onClose={() => setAfficherGuideCompleta(false)} />
          )}

          {usersTyping.length > 0 && (
            <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform">
              {usersTyping.length === 1 ? (
                <TypingIndicator
                  userName={usersTyping[0].name}
                  departmentName={usersTyping[0].dept}
                />
              ) : (
                <TypingIndicatorCompact count={usersTyping.length} />
              )}
            </div>
          )}

          <div className="flex-1 overflow-hidden p-4 md:p-6">
            {vue === 'liste' && (
              <div className="grid h-full grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                <aside className="min-h-0 space-y-4 xl:overflow-y-auto xl:pr-1">
                  <div className="rounded-[28px] border border-white/60 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,45,71,0.45)] backdrop-blur">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Espace actif</p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-900">{departementCourant?.nombre || 'Sélectionnez un département'}</h2>
                        <p className="mt-1 text-sm text-slate-600">Une vue plus claire pour lire, traiter et répondre rapidement.</p>
                      </div>
                      <div className="rounded-2xl bg-slate-100 px-3 py-2 text-right">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Code</p>
                        <p className="text-sm font-semibold text-slate-700">{departementCourant?.codigo || '--'}</p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Non lus</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{nonLusCount}</p>
                      </div>
                      <div className="rounded-2xl bg-emerald-50 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-emerald-700">Demandes</p>
                        <p className="mt-2 text-2xl font-bold text-emerald-900">{demandesCount}</p>
                      </div>
                      <div className="rounded-2xl bg-amber-50 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-amber-700">Importants</p>
                        <p className="mt-2 text-2xl font-bold text-amber-900">{importantsCount}</p>
                      </div>
                      <div className="rounded-2xl bg-fuchsia-50 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-fuchsia-700">Épinglés</p>
                        <p className="mt-2 text-2xl font-bold text-fuchsia-900">{epinglesCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/60 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,45,71,0.45)] backdrop-blur">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Rechercher un sujet, un contenu ou un expéditeur"
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
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
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

                  <div className="rounded-[28px] border border-white/60 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,45,71,0.45)] backdrop-blur">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">Actions rapides</h3>
                        <p className="text-sm text-slate-600">Les tâches les plus fréquentes en un clic.</p>
                      </div>
                      <Zap className="h-5 w-5 text-[#1a4d7a]" />
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setVue('nouveau');
                          setShowPollCreator(false);
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
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-left text-white transition-transform hover:scale-[1.01]"
                      >
                        <Plus className="h-5 w-5" />
                        <span className="font-semibold">Nouveau message</span>
                      </button>

                      <button
                        onClick={() => {
                          const deptRecrutement = departements.find(d => d.codigo === 'RECRUTEMENT');
                          setVue('nouveau');
                          setShowPollCreator(false);
                          setFormData({
                            type: 'demande',
                            departementDestinataire: deptRecrutement?.id || '',
                            departementDestinataires: [],
                            isGroupMessage: false,
                            sujet: 'Demande de volontaire',
                            contenu: '',
                            typeDemande: 'demande_volontaire',
                            priorite: 'normale',
                            dateEcheance: ''
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
                          setFormData({
                            type: 'message',
                            departementDestinataire: '',
                            departementDestinataires: [],
                            isGroupMessage: true,
                            sujet: '',
                            contenu: '',
                            typeDemande: 'information',
                            priorite: 'normale',
                            dateEcheance: ''
                          });
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

                <section className="min-h-0 rounded-[28px] border border-white/60 bg-white/95 shadow-[0_24px_80px_-48px_rgba(15,45,71,0.45)] backdrop-blur flex flex-col overflow-hidden">
                  <div className="border-b border-slate-200/80 px-5 py-5 md:px-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Messagerie</p>
                        <h3 className="mt-2 text-2xl font-bold text-slate-900">
                          {recherche ? 'Résultats de recherche' : 'Boîte de réception'}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {messagesFiltres.length} message(s) visible(s)
                          {recherche ? ` pour "${recherche}"` : ` dans le filtre sélectionné`}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                          {filtre.replace('_', ' ')}
                        </span>
                        <Button variant="outline" onClick={() => setVue('statistiques')} className="rounded-full border-slate-300 bg-white">
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Voir les statistiques
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
                        <h4 className="mt-6 text-xl font-semibold text-slate-900">Aucun message à afficher</h4>
                        <p className="mt-2 max-w-md text-sm text-slate-600">
                          Ajustez votre filtre, lancez une recherche différente ou créez un nouveau message depuis les actions rapides.
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
                              className={`rounded-[28px] border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                                isUnread
                                  ? 'border-blue-200 bg-blue-50/80'
                                  : 'border-slate-200/80 bg-white'
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
                                  className="flex-1 cursor-pointer"
                                >
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white">
                                      {getIconeType(msg.type)}
                                    </span>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                                      {msg.departementEmetteur === departementActuel ? `À ${deptDest?.nombre || 'Département'}` : `De ${deptEmetteur?.nombre || 'Département'}`}
                                    </span>
                                    {isPinned && (
                                      <span className="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700">
                                        Épinglé
                                      </span>
                                    )}
                                    {msg.important && (
                                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                        Important
                                      </span>
                                    )}
                                    {msg.statut && (
                                      <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                        {getIconeStatut(msg.statut)}
                                        {msg.statut.replace('_', ' ')}
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-4 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                                    <div className="min-w-0 flex-1">
                                      <h4 className="text-lg font-semibold text-slate-900">{msg.sujet}</h4>
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
              </div>
            )}

            {vue === 'detail' && messageSelectionne && (
              <div className="h-full overflow-y-auto">
                <div className="mx-auto grid max-w-6xl gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="space-y-6">
                    <div className="rounded-[28px] border border-white/60 bg-white/95 p-6 shadow-[0_24px_80px_-48px_rgba(15,45,71,0.45)] backdrop-blur">
                      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
                        <div>
                          <Button variant="ghost" onClick={() => setVue('liste')} className="-ml-3 mb-3 rounded-full text-slate-600">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour à la liste
                          </Button>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                              {getIconeType(messageSelectionne.type)}
                            </span>
                            {pinnedMessages.includes(messageSelectionne.id) && (
                              <span className="rounded-full bg-fuchsia-50 px-3 py-1 text-xs font-semibold text-fuchsia-700">Épinglé</span>
                            )}
                            {messageSelectionne.important && (
                              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">Important</span>
                            )}
                          </div>
                          <h2 className="mt-4 text-3xl font-bold text-slate-900">{messageSelectionne.sujet}</h2>
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

                      {messageSelectionne.type === 'demande' && messageSelectionne.statut && (
                        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4">
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

                      <div className="mt-6 whitespace-pre-wrap text-[15px] leading-7 text-slate-700">
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
                          <div className="mt-4 space-y-3">
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

                    {messageSelectionne.reponses.length > 0 && (
                      <div className="rounded-[28px] border border-white/60 bg-white/95 p-6 shadow-[0_24px_80px_-48px_rgba(15,45,71,0.45)] backdrop-blur">
                        <div className="mb-5 flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-slate-900">Réponses ({messageSelectionne.reponses.length})</h3>
                          <Reply className="h-5 w-5 text-slate-400" />
                        </div>

                        <div className="space-y-4">
                          {messageSelectionne.reponses.map(reponseId => {
                            const reponse = messages.find(m => m.id === reponseId);
                            if (!reponse) return null;

                            return (
                              <div key={reponse.id} className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-4">
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
                    <div className="rounded-[28px] border border-white/60 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,45,71,0.45)] backdrop-blur">
                      <h3 className="text-lg font-semibold text-slate-900">Actions</h3>
                      <div className="mt-4 space-y-3">
                        <Button onClick={() => setVue('repondre')} className="h-11 w-full rounded-2xl bg-slate-900 hover:bg-slate-800">
                          <Send className="mr-2 h-4 w-4" />
                          Répondre
                        </Button>
                        <Button variant="outline" onClick={() => handleMarquerImportant(messageSelectionne)} className="h-11 w-full rounded-2xl border-slate-300">
                          <Star className={`mr-2 h-4 w-4 ${messageSelectionne.important ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          {messageSelectionne.important ? 'Retirer des importants' : 'Marquer important'}
                        </Button>
                        <Button variant="outline" onClick={() => handleTogglePin(messageSelectionne.id)} className="h-11 w-full rounded-2xl border-slate-300">
                          <Pin className={`mr-2 h-4 w-4 ${pinnedMessages.includes(messageSelectionne.id) ? 'fill-fuchsia-500 text-fuchsia-500' : ''}`} />
                          {pinnedMessages.includes(messageSelectionne.id) ? 'Retirer l\'épingle' : 'Épingler'}
                        </Button>
                        <Button variant="outline" onClick={() => handleArchiver(messageSelectionne)} className="h-11 w-full rounded-2xl border-slate-300">
                          <Archive className="mr-2 h-4 w-4" />
                          Archiver
                        </Button>
                        <Button variant="outline" onClick={() => handleSupprimer(messageSelectionne)} className="h-11 w-full rounded-2xl border-red-200 text-red-700 hover:bg-red-50">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-white/60 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,45,71,0.45)] backdrop-blur">
                      <h3 className="text-lg font-semibold text-slate-900">Résumé</h3>
                      <div className="mt-4 space-y-3 text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                          <span>Expéditeur</span>
                          <span className="font-semibold text-slate-800">{messageSelectionne.expediteur}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Destination</span>
                          <span className="font-semibold text-slate-800">{departements.find(d => d.id === messageSelectionne.departementDestinataire)?.nombre}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Réponses</span>
                          <span className="font-semibold text-slate-800">{messageSelectionne.reponses.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
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
                <div className="mx-auto max-w-4xl">
                  <div className="rounded-[32px] border border-white/60 bg-white/95 p-6 shadow-[0_24px_80px_-48px_rgba(15,45,71,0.45)] backdrop-blur md:p-8">
                    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Réponse</p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-900">Répondre à {messageSelectionne.sujet}</h2>
                        <p className="mt-1 text-sm text-slate-600">La correction orthographique reste active pendant la rédaction.</p>
                      </div>
                      <Button variant="ghost" onClick={() => setVue('detail')} className="self-start rounded-full text-slate-600">
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="mt-6 space-y-5">
                      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
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
                            rows={10}
                            placeholder="Rédigez votre réponse..."
                            language="fr"
                            showSpellCheck={true}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button variant="outline" onClick={() => setVue('detail')} className="h-11 rounded-2xl border-slate-300 px-5">
                          Annuler
                        </Button>
                        <Button onClick={handleRepondre} className="h-11 rounded-2xl bg-slate-900 px-5 hover:bg-slate-800">
                          <Send className="mr-2 h-4 w-4" />
                          Envoyer la réponse
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {vue === 'nouveau' && (
              <div className="h-full overflow-y-auto">
                <div className="mx-auto max-w-5xl">
                  {showPollCreator ? (
                    <div className="rounded-[32px] border border-white/60 bg-white/95 p-4 shadow-[0_24px_80px_-48px_rgba(15,45,71,0.45)] backdrop-blur md:p-6">
                      <PollCreator
                        onCreatePoll={handleCreatePoll}
                        onCancel={() => {
                          setShowPollCreator(false);
                          setVue('liste');
                        }}
                      />
                    </div>
                  ) : (
                    <div className="rounded-[32px] border border-white/60 bg-white/95 p-6 shadow-[0_24px_80px_-48px_rgba(15,45,71,0.45)] backdrop-blur md:p-8">
                      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Composition</p>
                          <h2 className="mt-2 text-2xl font-bold text-slate-900">Nouveau message</h2>
                          <p className="mt-1 text-sm text-slate-600">Un formulaire plus lisible sans perdre la correction du texte.</p>
                        </div>
                        <Button variant="ghost" onClick={() => setVue('liste')} className="self-start rounded-full text-slate-600">
                          <X className="h-5 w-5" />
                        </Button>
                      </div>

                      <div className="mt-6 space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
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

                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
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
                                  formData.isGroupMessage
                                    ? 'bg-violet-100 text-violet-700'
                                    : 'bg-white text-slate-600'
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
                                {departements
                                  .filter(d => d.activo && d.id !== departementActuel)
                                  .map(dept => (
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
                                        const allDeptIds = departements
                                          .filter(d => d.activo && d.id !== departementActuel)
                                          .map(d => d.id);
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
                                  {departements
                                    .filter(d => d.activo && d.id !== departementActuel)
                                    .map(dept => (
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
                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
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

                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
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

                            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
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

                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                          <label className="mb-2 block text-sm font-semibold text-slate-800">Sujet</label>
                          <Input
                            value={formData.sujet}
                            onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                            placeholder="Exemple : coordination, suivi, information urgente"
                            className="h-11 rounded-2xl border-slate-300 bg-white"
                          />
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
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

                        <div className="flex flex-col gap-4 rounded-3xl border border-violet-200 bg-violet-50 p-4 md:flex-row md:items-center md:justify-between">
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
                          <Button onClick={handleEnvoyerMessage} className="h-11 rounded-2xl bg-slate-900 px-5 hover:bg-slate-800">
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
                <div className="mx-auto max-w-6xl space-y-6">
                  <div className="rounded-[32px] border border-white/60 bg-white/95 p-6 shadow-[0_24px_80px_-48px_rgba(15,45,71,0.45)] backdrop-blur md:p-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Analyse</p>
                        <h2 className="mt-2 text-3xl font-bold text-slate-900">Statistiques de {stats.departement}</h2>
                        <p className="mt-1 text-sm text-slate-600">Une lecture rapide de l'activité du département.</p>
                      </div>
                      <Button variant="outline" onClick={() => setVue('liste')} className="rounded-full border-slate-300 bg-white">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[28px] border border-white/60 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,45,71,0.45)]">
                      <div className="flex items-center justify-between">
                        <Inbox className="h-8 w-8 text-[#1a4d7a]" />
                        <span className="text-3xl font-bold text-slate-900">{stats.totalMessagesRecus}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">Messages reçus</p>
                    </div>

                    <div className="rounded-[28px] border border-white/60 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,45,71,0.45)]">
                      <div className="flex items-center justify-between">
                        <Send className="h-8 w-8 text-emerald-600" />
                        <span className="text-3xl font-bold text-slate-900">{stats.totalMessagesEnvoyes}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">Messages envoyés</p>
                    </div>

                    <div className="rounded-[28px] border border-white/60 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,45,71,0.45)]">
                      <div className="flex items-center justify-between">
                        <Bell className="h-8 w-8 text-rose-600" />
                        <span className="text-3xl font-bold text-slate-900">{stats.messagesNonLus}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">Messages non lus</p>
                    </div>

                    <div className="rounded-[28px] border border-white/60 bg-white/95 p-5 shadow-[0_24px_80px_-48px_rgba(15,45,71,0.45)]">
                      <div className="flex items-center justify-between">
                        <FileText className="h-8 w-8 text-violet-600" />
                        <span className="text-3xl font-bold text-slate-900">{stats.totalDemandes}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">Demandes totales</p>
                    </div>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
                    <div className="rounded-[28px] border border-white/60 bg-white/95 p-6 shadow-[0_24px_80px_-48px_rgba(15,45,71,0.45)]">
                      <div className="mb-5 flex items-center gap-3">
                        <Hash className="h-5 w-5 text-slate-400" />
                        <h3 className="text-xl font-semibold text-slate-900">État des demandes</h3>
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

                    <div className="rounded-[28px] border border-white/60 bg-white/95 p-6 shadow-[0_24px_80px_-48px_rgba(15,45,71,0.45)]">
                      <div className="flex items-center gap-3">
                        <Pin className="h-5 w-5 text-fuchsia-600" />
                        <h3 className="text-xl font-semibold text-slate-900">Épinglés</h3>
                      </div>
                      <div className="mt-5 text-4xl font-bold text-slate-900">{epinglesCount}</div>
                      <p className="mt-2 text-sm text-slate-600">Messages mis en avant dans ce département.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab Content: Correction de Texte */}
        <TabsContent value="correction" className="relative z-0 flex-1 min-h-0 overflow-auto m-0">
          <div className="p-6 max-w-6xl mx-auto">
            <TextCorrector />
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
