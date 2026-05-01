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

      {/* Header con glassmorphism */}
      <div className="backdrop-blur-xl bg-white/90 border-b border-white/20 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1a4d7a] to-[#2d9561] rounded-xl flex items-center justify-center text-white shadow-lg">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1a4d7a] to-blue-600 bg-clip-text text-transparent" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Messagerie Interne
                </h1>
                <p className="text-gray-600 text-sm">Système de messagerie avancé entre départements</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Sélecteur de département */}
              <select
                value={departementActuel}
                onChange={(e) => setDepartementActuel(e.target.value)}
                className="px-4 py-2 bg-white/70 backdrop-blur-sm border border-white/30 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a4d7a]/50"
              >
                {departements.filter(d => d.activo).map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.nombre} ({dept.codigo})
                  </option>
                ))}
              </select>
              
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    marquerToutesNotificationsLues(departementActuel);
                    setNotificationsNonLues(0);
                    toast.success('Notifications marquées comme lues');
                  }}
                  className="group relative p-2 hover:bg-white/50 rounded-xl transition-all duration-300 hover:shadow-md"
                >
                  <Bell className="w-5 h-5 text-gray-700 group-hover:text-[#1a4d7a] transition-colors" />
                  {notificationsNonLues > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-pulse">
                      {notificationsNonLues}
                    </span>
                  )}
                </button>
              </div>
              
              <button
                onClick={() => {
                  setVue('statistiques');
                }}
                className="group relative bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white w-11 h-11 rounded-full font-medium transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 overflow-hidden"
                title="Statistiques"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <TrendingUp className="w-5 h-5 relative z-10" />
              </button>
              
              <button
                onClick={() => setAfficherGuide(true)}
                className="group relative bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white w-11 h-11 rounded-full font-medium transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 overflow-hidden"
                title="Guide Complet des Modules"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <HelpCircle className="w-5 h-5 relative z-10" />
              </button>
              
              <button
                onClick={() => {
                  setVue('nouveau');
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
                className="group relative bg-gradient-to-r from-[#1a4d7a] to-blue-700 hover:from-blue-700 hover:to-[#1a4d7a] text-white w-11 h-11 rounded-full font-medium transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 overflow-hidden"
                title="Nouveau Message"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <Plus className="w-5 h-5 relative z-10" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs para Messagerie y Correction de Texte */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="backdrop-blur-xl bg-white/80 border-b border-white/20">
          <TabsList className="bg-transparent p-0 h-auto border-0 w-full justify-start">
            <TabsTrigger 
              value="messagerie" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1a4d7a] data-[state=active]:to-[#2d9561] data-[state=active]:text-white px-8 py-4 rounded-none border-b-2 data-[state=active]:border-[#2d9561] data-[state=inactive]:border-transparent transition-all duration-300"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messagerie
            </TabsTrigger>
            <TabsTrigger 
              value="correction" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1a4d7a] data-[state=active]:to-[#2d9561] data-[state=active]:text-white px-8 py-4 rounded-none border-b-2 data-[state=active]:border-[#2d9561] data-[state=inactive]:border-transparent transition-all duration-300"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Correction de Texte
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content: Messagerie */}
        <TabsContent value="messagerie" className="flex-1 flex flex-col m-0 overflow-hidden">

      {/* Guide Complet de tous les Modules */}
      {afficherGuide && (
        <GuideCompletModules onClose={() => setAfficherGuide(false)} />
      )}
      
      {/* Guide Complet de l'Application */}
      {afficherGuideCompleta && (
        <GuiaCompletaApp onClose={() => setAfficherGuideCompleta(false)} />
      )}

      {/* Indicador de escritura flotante */}
      {usersTyping.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
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

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Filtres con glassmorphism */}
        {vue === 'liste' && (
          <div className="w-64 backdrop-blur-xl bg-white/90 border-r border-white/20 p-4 overflow-y-auto shadow-lg">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  className="pl-10 bg-white/50 backdrop-blur-sm border-white/30"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <button
                onClick={() => {setFiltre('tous'); setRecherche('');}}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-300 ${
                  filtre === 'tous' 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md border border-blue-200/50' 
                    : 'hover:bg-white/70 backdrop-blur-sm hover:shadow-sm'
                }`}
              >
                <Inbox className="w-4 h-4" />
                <span className="font-medium">Tous les messages</span>
                <span className="ml-auto text-sm bg-gray-100 px-2 py-0.5 rounded-full">{messages.filter(m => m.departementDestinataire === departementActuel || m.departementEmetteur === departementActuel).length}</span>
              </button>
              
              <button
                onClick={() => {setFiltre('epingles'); setRecherche('');}}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-300 ${
                  filtre === 'epingles' 
                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 shadow-md border border-purple-200/50' 
                    : 'hover:bg-white/70 backdrop-blur-sm hover:shadow-sm'
                }`}
              >
                <Pin className="w-4 h-4" />
                <span className="font-medium">Épinglés</span>
                {pinnedMessages.length > 0 && (
                  <span className="ml-auto text-sm bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{pinnedMessages.length}</span>
                )}
              </button>
              
              <button
                onClick={() => {setFiltre('recus'); setRecherche('');}}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-300 ${
                  filtre === 'recus' 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md border border-blue-200/50' 
                    : 'hover:bg-white/70 backdrop-blur-sm hover:shadow-sm'
                }`}
              >
                <Inbox className="w-4 h-4" />
                <span className="font-medium">Reçus</span>
                <span className="ml-auto text-sm bg-gray-100 px-2 py-0.5 rounded-full">{messages.filter(m => m.departementDestinataire === departementActuel && !m.archive).length}</span>
              </button>
              
              <button
                onClick={() => {setFiltre('envoyes'); setRecherche('');}}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-300 ${
                  filtre === 'envoyes' 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md border border-blue-200/50' 
                    : 'hover:bg-white/70 backdrop-blur-sm hover:shadow-sm'
                }`}
              >
                <Send className="w-4 h-4" />
                <span className="font-medium">Envoyés</span>
                <span className="ml-auto text-sm bg-gray-100 px-2 py-0.5 rounded-full">{messages.filter(m => m.departementEmetteur === departementActuel && !m.archive).length}</span>
              </button>
              
              <button
                onClick={() => {setFiltre('non_lus'); setRecherche('');}}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-300 ${
                  filtre === 'non_lus' 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md border border-blue-200/50' 
                    : 'hover:bg-white/70 backdrop-blur-sm hover:shadow-sm'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span className="font-medium">Non lus</span>
                <span className="ml-auto text-sm bg-red-500 text-white px-2 py-0.5 rounded-full text-xs shadow-sm">
                  {obtenirMessagesNonLus(departementActuel).length}
                </span>
              </button>
              
              <button
                onClick={() => {setFiltre('importants'); setRecherche('');}}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-300 ${
                  filtre === 'importants' 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md border border-blue-200/50' 
                    : 'hover:bg-white/70 backdrop-blur-sm hover:shadow-sm'
                }`}
              >
                <Star className="w-4 h-4" />
                <span className="font-medium">Importants</span>
              </button>
              
              <button
                onClick={() => {setFiltre('demandes'); setRecherche('');}}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-300 ${
                  filtre === 'demandes' 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md border border-blue-200/50' 
                    : 'hover:bg-white/70 backdrop-blur-sm hover:shadow-sm'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="font-medium">Demandes</span>
                <span className="ml-auto text-sm bg-gray-100 px-2 py-0.5 rounded-full">{messages.filter(m => (m.departementDestinataire === departementActuel || m.departementEmetteur === departementActuel) && m.type === 'demande' && !m.archive).length}</span>
              </button>
              
              <button
                onClick={() => {setFiltre('archives'); setRecherche('');}}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all duration-300 ${
                  filtre === 'archives' 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-md border border-blue-200/50' 
                    : 'hover:bg-white/70 backdrop-blur-sm hover:shadow-sm'
                }`}
              >
                <Archive className="w-4 h-4" />
                <span className="font-medium">Archives</span>
              </button>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        <div className="flex-1 overflow-hidden">
          {vue === 'liste' && (
            <div className="h-full overflow-y-auto p-6">
              {/* Boutons flotants */}
              <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
                <button
                  onClick={() => {
                    // Trouver le département Recrutement
                    const deptRecrutement = departements.find(d => d.codigo === 'RECRUTEMENT');
                    setVue('nouveau');
                    setFormData({
                      type: 'demande',
                      departementDestinataire: deptRecrutement?.id || '',
                      sujet: 'Demande de Volontaire',
                      contenu: '',
                      typeDemande: 'demande_volontaire',
                      priorite: 'normale',
                      dateEcheance: ''
                    });
                  }}
                  className="group relative bg-gradient-to-r from-[#2d9561] to-green-700 hover:from-green-700 hover:to-[#2d9561] text-white px-6 py-4 rounded-2xl font-medium transition-all duration-300 shadow-2xl hover:shadow-green-500/50 hover:scale-105 flex items-center gap-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <UserPlus className="w-6 h-6 relative z-10" />
                  <span className="relative z-10 text-lg">Demander un Bénévole</span>
                </button>
                
                <button
                  onClick={() => {
                    setShowPollCreator(true);
                    setVue('nouveau');
                  }}
                  className="group relative bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-4 rounded-2xl font-medium transition-all duration-300 shadow-2xl hover:shadow-purple-500/50 hover:scale-105 flex items-center gap-2 overflow-hidden"
                  title="Créer un sondage"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <BarChart3 className="w-6 h-6 relative z-10" />
                  <span className="relative z-10 text-lg">Créer un Sondage</span>
                </button>
                
                <button
                  onClick={() => {
                    setVue('nouveau');
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
                  className="group relative bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-4 rounded-2xl font-medium transition-all duration-300 shadow-2xl hover:shadow-orange-500/50 hover:scale-105 flex items-center gap-2 overflow-hidden"
                  title="Message de groupe"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  <Users className="w-6 h-6 relative z-10" />
                  <span className="relative z-10 text-lg">Message Groupe</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {obtenirMessagesFiltres().length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 backdrop-blur-xl bg-white/70 rounded-2xl shadow-lg border border-white/20">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mb-4">
                      <Inbox className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">Aucun message à afficher</p>
                  </div>
                ) : (
                  obtenirMessagesFiltres().map(msg => {
                    const deptEmetteur = departements.find(d => d.id === msg.departementEmetteur);
                    const deptDest = departements.find(d => d.id === msg.departementDestinataire);
                    const isPinned = pinnedMessages.includes(msg.id);
                    
                    return (
                      <div
                        key={msg.id}
                        className={`group backdrop-blur-xl rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl border relative overflow-hidden ${
                          !msg.lu && msg.departementDestinataire === departementActuel 
                            ? 'bg-blue-50/90 border-blue-300/50 shadow-lg shadow-blue-200/50' 
                            : 'bg-white/90 border-white/20 shadow-lg hover:bg-white/95'
                        }`}
                      >
                        {/* Indicador de fijado */}
                        {isPinned && (
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
                        )}
                        
                        {/* Línea decorativa superior */}
                        <div className={`absolute ${isPinned ? 'top-1' : 'top-0'} left-0 w-full h-1 ${
                          !msg.lu && msg.departementDestinataire === departementActuel
                            ? 'bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500'
                            : 'bg-gradient-to-r from-[#1a4d7a] via-[#2d9561] to-[#1a4d7a]'
                        }`} />
                        
                        <div
                          onClick={() => {
                            setMessageSelectionne(msg);
                            setVue('detail');
                            if (!msg.lu && msg.departementDestinataire === departementActuel) {
                              handleMarquerLu(msg);
                            }
                          }}
                          className="cursor-pointer"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {isPinned && (
                                  <Pin className="w-4 h-4 fill-purple-500 text-purple-500" />
                                )}
                                <div className="w-8 h-8 bg-gradient-to-br from-[#1a4d7a] to-[#2d9561] rounded-lg flex items-center justify-center text-white shadow-sm">
                                  {getIconeType(msg.type)}
                                </div>
                                <span className="font-semibold text-sm text-gray-700">
                                  {msg.departementEmetteur === departementActuel ? `À: ${deptDest?.nombre}` : `De: ${deptEmetteur?.nombre}`}
                                </span>
                                {msg.important && (
                                  <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-lg">
                                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                  </div>
                                )}
                                {msg.statut && getIconeStatut(msg.statut)}
                                {msg.edited && (
                                  <span className="text-xs text-gray-500 italic">(modifié)</span>
                                )}
                              </div>
                              
                              <h3 className="font-bold text-gray-900 mb-2 text-lg">
                                {msg.sujet}
                              </h3>
                              
                              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                {msg.contenu}
                              </p>
                              
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="font-medium">{msg.expediteur}</span>
                                <span>•</span>
                                <span>{new Date(msg.dateCreation).toLocaleDateString('fr-CA')} {new Date(msg.dateCreation).toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })}</span>
                                {msg.piecesJointes.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
                                      <Paperclip className="w-3 h-3" />
                                      {msg.piecesJointes.length}
                                    </span>
                                  </>
                                )}
                                {msg.reponses.length > 0 && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-lg text-blue-700">
                                      <MessageSquare className="w-3 h-3" />
                                      {msg.reponses.length} réponse(s)
                                    </span>
                                  </>
                                )}
                                {msg.poll && (
                                  <>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-lg text-purple-700">
                                      <BarChart3 className="w-3 h-3" />
                                      Sondage
                                    </span>
                                  </>
                                )}
                              </div>
                              
                              {/* Reacciones */}
                              {messageReactions[msg.id] && (
                                <MessageReactions
                                  reactions={messageReactions[msg.id]}
                                  onReact={(emoji) => handleReaction(msg.id, emoji)}
                                  currentUserId={currentUserId}
                                />
                              )}
                            </div>
                            
                            {msg.priorite && (
                              <span className={`px-3 py-1 rounded-xl text-xs font-bold border shadow-sm ${getPrioriteColor(msg.priorite)}`}>
                                {msg.priorite}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Acciones rápidas */}
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
                        
                        {/* Picker de reacciones */}
                        {showReactionPicker === msg.id && (
                          <ReactionPicker
                            onReact={(emoji) => handleReaction(msg.id, emoji)}
                            onClose={() => setShowReactionPicker(null)}
                          />
                        )}
                      </div>
                    );
                  })
                )}</div>
            </div>
          )}

          {vue === 'detail' && messageSelectionne && (
            <div className="h-full overflow-y-auto">
              <div className="backdrop-blur-xl bg-white/90 border-b border-white/20 shadow-lg p-4 flex items-center justify-between">
                <Button variant="ghost" onClick={() => setVue('liste')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour
                </Button>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => handleMarquerImportant(messageSelectionne)}
                  >
                    <Star className={`w-4 h-4 ${messageSelectionne.important ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleTogglePin(messageSelectionne.id)}
                  >
                    <Pin className={`w-4 h-4 ${pinnedMessages.includes(messageSelectionne.id) ? 'fill-purple-400 text-purple-400' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleArchiver(messageSelectionne)}
                  >
                    <Archive className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleSupprimer(messageSelectionne)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => setVue('repondre')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Répondre
                  </Button>
                </div>
              </div>
              
              <div className="p-6 max-w-4xl mx-auto">
                <div className="backdrop-blur-xl bg-white/90 rounded-2xl border border-white/20 shadow-2xl p-6 mb-6 relative overflow-hidden">
                  {/* Indicador de fijado */}
                  {pinnedMessages.includes(messageSelectionne.id) && (
                    <div className="flex items-center gap-2 mb-3 text-purple-600">
                      <Pin className="w-4 h-4 fill-purple-600" />
                      <span className="text-sm font-medium">Message épinglé</span>
                    </div>
                  )}
                  
                  {/* Línea decorativa superior */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1a4d7a] via-[#2d9561] to-[#1a4d7a]" />
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">{messageSelectionne.sujet}</h2>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <span className="font-medium">{messageSelectionne.expediteur}</span>
                        <span>•</span>
                        <span>{departements.find(d => d.id === messageSelectionne.departementEmetteur)?.nombre}</span>
                        <span>•</span>
                        <span>{new Date(messageSelectionne.dateCreation).toLocaleString('fr-CA')}</span>
                        {messageSelectionne.edited && (
                          <>
                            <span>•</span>
                            <span className="italic text-gray-500">Modifié</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {messageSelectionne.priorite && (
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPrioriteColor(messageSelectionne.priorite)}`}>
                        {messageSelectionne.priorite}
                      </span>
                    )}
                  </div>
                  
                  {messageSelectionne.type === 'demande' && messageSelectionne.statut && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getIconeStatut(messageSelectionne.statut)}
                          <span className="font-medium">Statut: {messageSelectionne.statut}</span>
                        </div>
                        
                        {messageSelectionne.departementDestinataire === departementActuel && (
                          <select
                            value={messageSelectionne.statut}
                            onChange={(e) => handleChangerStatut(messageSelectionne, e.target.value as StatutDemande)}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
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
                        <div className="mt-2 text-sm text-gray-600">
                          Échéance: {new Date(messageSelectionne.dateEcheance).toLocaleDateString('fr-CA')}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{messageSelectionne.contenu}</p>
                  </div>
                  
                  {/* Sondage */}
                  {messageSelectionne.poll && (
                    <div className="mt-6">
                      <PollView
                        poll={messageSelectionne.poll}
                        onVote={(optionIds) => {
                          toast.success('Vote enregistré!');
                        }}
                        currentVotes={[]}
                        totalVotes={messageSelectionne.poll.options.reduce((acc: number, opt: any) => acc + opt.votes, 0)}
                        hasVoted={false}
                      />
                    </div>
                  )}
                  
                  {/* Reacciones */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <button
                        onClick={() => setShowReactionPicker(messageSelectionne.id)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-sm"
                      >
                        <Smile className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-700">Réagir</span>
                      </button>
                      
                      {showReactionPicker === messageSelectionne.id && (
                        <ReactionPicker
                          onReact={(emoji) => handleReaction(messageSelectionne.id, emoji)}
                          onClose={() => setShowReactionPicker(null)}
                        />
                      )}
                    </div>
                    
                    {messageReactions[messageSelectionne.id] && (
                      <MessageReactions
                        reactions={messageReactions[messageSelectionne.id]}
                        onReact={(emoji) => handleReaction(messageSelectionne.id, emoji)}
                        currentUserId={currentUserId}
                      />
                    )}
                  </div>
                  
                  {messageSelectionne.piecesJointes.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-medium mb-2">Pièces jointes ({messageSelectionne.piecesJointes.length})</h4>
                      <div className="space-y-2">
                        {messageSelectionne.piecesJointes.map(piece => (
                          <div key={piece.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex items-center gap-2">
                              <Paperclip className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{piece.nom}</span>
                              <span className="text-xs text-gray-500">({(piece.taille / 1024).toFixed(2)} KB)</span>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Réponses */}
                {messageSelectionne.reponses.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">Réponses ({messageSelectionne.reponses.length})</h3>
                    {messageSelectionne.reponses.map(reponseId => {
                      const reponse = messages.find(m => m.id === reponseId);
                      if (!reponse) return null;
                      
                      return (
                        <div key={reponse.id} className="backdrop-blur-xl bg-white/90 rounded-2xl border border-white/20 shadow-lg p-4 ml-8">
                          <div className="flex items-center gap-3 mb-2 text-sm text-gray-600">
                            <span className="font-medium">{reponse.expediteur}</span>
                            <span>•</span>
                            <span>{departements.find(d => d.id === reponse.departementEmetteur)?.nombre}</span>
                            <span>•</span>
                            <span>{new Date(reponse.dateCreation).toLocaleString('fr-CA')}</span>
                          </div>
                          <p className="whitespace-pre-wrap text-gray-700">{reponse.contenu}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                {/* Botón de respuesta rápida */}
                <div className="mt-6">
                  <QuickReplyButton onClick={() => setVue('repondre')} />
                </div>
              </div>
            </div>
          )}

          {vue === 'repondre' && messageSelectionne && (
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                <div className="backdrop-blur-xl bg-white/90 rounded-2xl border border-white/20 shadow-2xl p-6 relative overflow-hidden">
                  {/* Línea decorativa superior */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1a4d7a] via-[#2d9561] to-[#1a4d7a]" />
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Répondre à: {messageSelectionne.sujet}</h2>
                    <Button variant="ghost" onClick={() => setVue('detail')}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium">Message *</label>
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <Sparkles className="w-3 h-3" />
                          <span>Correction automatique activée</span>
                        </div>
                      </div>
                      <TextareaSpellCheck
                        value={formData.contenu}
                        onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                        rows={10}
                        placeholder="Contenu du message..."
                        language="fr"
                        showSpellCheck={true}
                      />
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <Button variant="outline" onClick={() => setVue('detail')}>
                        Annuler
                      </Button>
                      <Button onClick={handleRepondre} className="bg-blue-600 hover:bg-blue-700">
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer la réponse
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {vue === 'nouveau' && (
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                {showPollCreator ? (
                  <PollCreator
                    onCreatePoll={handleCreatePoll}
                    onCancel={() => {
                      setShowPollCreator(false);
                      setVue('liste');
                    }}
                  />
                ) : (
                  <div className="backdrop-blur-xl bg-white/90 rounded-2xl border border-white/20 shadow-2xl p-6 relative overflow-hidden">
                    {/* Línea decorativa superior */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1a4d7a] via-[#2d9561] to-[#1a4d7a]" />
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold">Nouveau Message</h2>
                      <Button variant="ghost" onClick={() => setVue('liste')}>
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Type de message *</label>
                          <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as TypeMessage })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="message">Message</option>
                            <option value="demande">Demande</option>
                            <option value="document">Document</option>
                            <option value="alerte">Alerte</option>
                            <option value="annonce">Annonce</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                            <span>Mode d'envoi *</span>
                            <button
                              type="button"
                              onClick={() => setFormData({ 
                                ...formData, 
                                isGroupMessage: !formData.isGroupMessage,
                                departementDestinataire: '',
                                departementDestinataires: []
                              })}
                              className={`px-3 py-1 text-xs rounded-full transition-all ${
                                formData.isGroupMessage 
                                  ? 'bg-purple-100 text-purple-700 border border-purple-300' 
                                  : 'bg-gray-100 text-gray-600 border border-gray-300'
                              }`}
                            >
                              <Users className="w-3 h-3 inline mr-1" />
                              {formData.isGroupMessage ? 'Groupe' : 'Individuel'}
                            </button>
                          </label>
                          
                          {!formData.isGroupMessage ? (
                            <select
                              value={formData.departementDestinataire}
                              onChange={(e) => setFormData({ ...formData, departementDestinataire: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                            <div className="border border-purple-300 rounded-lg bg-purple-50/50">
                              {/* Botones de control superior */}
                              <div className="px-3 py-2 border-b border-purple-200 bg-purple-100/50 flex items-center justify-between">
                                <span className="text-xs font-medium text-purple-900">
                                  {formData.departementDestinataires.length > 0 
                                    ? `${formData.departementDestinataires.length} département(s) sélectionné(s)`
                                    : 'Aucun département sélectionné'
                                  }
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const allDeptIds = departements
                                        .filter(d => d.activo && d.id !== departementActuel)
                                        .map(d => d.id);
                                      setFormData({ ...formData, departementDestinataires: allDeptIds });
                                    }}
                                    className="text-xs text-purple-700 hover:text-purple-900 font-medium underline flex items-center gap-1"
                                  >
                                    <CheckCheck className="w-3 h-3" />
                                    Tout sélectionner
                                  </button>
                                  {formData.departementDestinataires.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setFormData({ ...formData, departementDestinataires: [] })}
                                      className="text-xs text-purple-600 hover:text-purple-800 font-medium underline flex items-center gap-1"
                                    >
                                      <X className="w-3 h-3" />
                                      Tout désélectionner
                                    </button>
                                  )}
                                </div>
                              </div>
                              
                              {/* Lista de departamentos */}
                              <div className="p-3 max-h-40 overflow-y-auto space-y-2">
                                {departements
                                  .filter(d => d.activo && d.id !== departementActuel)
                                  .map(dept => (
                                    <label key={dept.id} className="flex items-center gap-2 p-2 hover:bg-white/70 rounded cursor-pointer transition-colors">
                                      <input
                                        type="checkbox"
                                        checked={formData.departementDestinataires.includes(dept.id)}
                                        onChange={(e) => {
                                          const newDestinataires = e.target.checked
                                            ? [...formData.departementDestinataires, dept.id]
                                            : formData.departementDestinataires.filter(id => id !== dept.id);
                                          setFormData({ ...formData, departementDestinataires: newDestinataires });
                                        }}
                                        className="w-4 h-4 text-purple-600 rounded border-purple-300 focus:ring-purple-500"
                                      />
                                      <span className="text-sm font-medium">{dept.nombre}</span>
                                      <span className="text-xs text-gray-500">({dept.codigo})</span>
                                    </label>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {formData.type === 'demande' && (
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Type de demande</label>
                            <select
                              value={formData.typeDemande}
                              onChange={(e) => setFormData({ ...formData, typeDemande: e.target.value as TypeDemande })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Priorité</label>
                            <select
                              value={formData.priorite}
                              onChange={(e) => setFormData({ ...formData, priorite: e.target.value as PrioriteDemande })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="basse">Basse</option>
                              <option value="normale">Normale</option>
                              <option value="haute">Haute</option>
                              <option value="urgente">Urgente</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Date d'échéance</label>
                            <Input
                              type="date"
                              value={formData.dateEcheance}
                              onChange={(e) => setFormData({ ...formData, dateEcheance: e.target.value })}
                            />
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Sujet *</label>
                        <Input
                          value={formData.sujet}
                          onChange={(e) => setFormData({ ...formData, sujet: e.target.value })}
                          placeholder="Sujet du message"
                        />
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium">Message *</label>
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <Sparkles className="w-3 h-3" />
                            <span>Correction automatique activée</span>
                          </div>
                        </div>
                        <TextareaSpellCheck
                          value={formData.contenu}
                          onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                          rows={10}
                          placeholder="Contenu du message..."
                          language="fr"
                          showSpellCheck={true}
                        />
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-purple-900">Voulez-vous créer un sondage?</p>
                          <p className="text-xs text-purple-600">Recueillez l'avis de votre équipe avec un sondage interactif</p>
                        </div>
                        <Button
                          onClick={() => setShowPollCreator(true)}
                          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                        >
                          <BarChart3 className="w-4 h-4 mr-2" />
                          Créer un sondage
                        </Button>
                      </div>
                      
                      <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setVue('liste')}>
                          Annuler
                        </Button>
                        <Button onClick={handleEnvoyerMessage} className="bg-blue-600 hover:bg-blue-700">
                          <Send className="w-4 h-4 mr-2" />
                          Envoyer
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {vue === 'statistiques' && stats && (
            <div className="h-full overflow-y-auto p-6">
              <div className="max-w-6xl mx-auto">
                <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg border border-white/20 p-6 mb-6 flex items-center justify-between">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-[#1a4d7a] to-blue-600 bg-clip-text text-transparent">Statistiques - {stats.departement}</h2>
                  <Button variant="outline" onClick={() => setVue('liste')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="group backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 p-6 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-400" />
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-300" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <Inbox className="w-8 h-8 text-blue-600" />
                        <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{stats.totalMessagesRecus}</span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Messages reçus</p>
                    </div>
                  </div>
                  
                  <div className="group backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 p-6 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#2d9561] to-green-400" />
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#2d9561]/10 rounded-full blur-2xl group-hover:bg-[#2d9561]/20 transition-all duration-300" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <Send className="w-8 h-8 text-[#2d9561]" />
                        <span className="text-4xl font-bold bg-gradient-to-r from-[#2d9561] to-green-700 bg-clip-text text-transparent">{stats.totalMessagesEnvoyes}</span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Messages envoyés</p>
                    </div>
                  </div>
                  
                  <div className="group backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 p-6 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-red-400" />
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-all duration-300" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <Bell className="w-8 h-8 text-red-600" />
                        <span className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">{stats.messagesNonLus}</span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Non lus</p>
                    </div>
                  </div>
                  
                  <div className="group backdrop-blur-xl bg-white/90 rounded-2xl shadow-lg hover:shadow-2xl border border-white/20 p-6 transition-all duration-300 hover:scale-105 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-purple-400" />
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-300" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <FileText className="w-8 h-8 text-purple-600" />
                        <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">{stats.totalDemandes}</span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Total demandes</p>
                    </div>
                  </div>
                </div>
                
                <div className="backdrop-blur-xl bg-white/90 rounded-2xl border border-white/20 shadow-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1a4d7a] via-[#2d9561] to-[#1a4d7a]" />
                  <h3 className="text-lg font-bold mb-4 text-gray-800">État des demandes</h3>
                  <div className="grid grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.demandesEnAttente}</div>
                      <div className="text-sm text-gray-600">En attente</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-1">{stats.demandesEnCours}</div>
                      <div className="text-sm text-gray-600">En cours</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-1">{stats.demandesCompletees}</div>
                      <div className="text-sm text-gray-600">Complétées</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600 mb-1">{stats.demandesRejetees}</div>
                      <div className="text-sm text-gray-600">Rejetées</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-1">{stats.demandesUrgentes}</div>
                      <div className="text-sm text-gray-600">Urgentes</div>
                    </div>
                  </div>
                </div>
                
                {/* Nueva estadística de mensajes fijados */}
                <div className="mt-6 backdrop-blur-xl bg-gradient-to-br from-purple-50/90 to-pink-50/90 rounded-2xl border border-purple-200/50 shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Pin className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-800">Messages Épinglés</h3>
                  </div>
                  <div className="text-4xl font-bold text-purple-600 mb-1">{pinnedMessages.length}</div>
                  <p className="text-sm text-gray-600">Messages épinglés dans ce département</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

        </TabsContent>

        {/* Tab Content: Correction de Texte */}
        <TabsContent value="correction" className="flex-1 overflow-auto m-0">
          <div className="p-6 max-w-6xl mx-auto">
            <TextCorrector />
          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}
