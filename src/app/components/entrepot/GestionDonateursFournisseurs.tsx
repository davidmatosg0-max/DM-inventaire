import React, { useState, useEffect } from 'react';
import { useBranding } from '../../../hooks/useBranding';
import { Plus, Search, Edit2, Trash2, Building2, Phone, MapPin, User, Mail, X, Save, ChevronRight, UserPlus, Upload, Image as ImageIcon, Check, Eye, History, Clock, Package, ShoppingCart, TrendingUp, LayoutGrid, List, Table as TableIcon, Users, Gift, Store, Truck, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { obtenerUsuarioSesion } from '../../utils/sesionStorage';
import { obtenerOrganismos } from '../../utils/organismosStorage';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';
import {
  eliminarContacto,
  sincronizarDonateursFournisseurs,
  obtenerContactosPorDepartamentoYTipo,
  obtenerIdDepartamentoEntrepot,
  type ContactoDepartamento,
} from '../../utils/contactosDepartamentoStorage';

interface PersonneContact {
  id: string;
  nom: string;
  email: string;
  telephone: string;
}

interface ModificationHistorique {
  id: string;
  date: string;
  champ: string;
  ancienneValeur: string;
  nouvelleValeur: string;
  utilisateur: string;
}

interface ActiviteHistorique {
  id: string;
  date: string;
  type: 'donation' | 'achat';
  produits: string[];
  quantite: number;
  unites: string[]; // Array de unidades usadas
  pesoTotal: number; // Peso total en kg
  valeur: number;
  reference: string;
}

interface DonateurFournisseur {
  id: string;
  isDonateur: boolean;
  isFournisseur: boolean;
  participantPRS: boolean;
  organismeAcreditadoId?: string;
  organismeAcreditadoNombre?: string;
  nomEntreprise: string;
  telephone: string;
  adresse: string;
  logo?: string; // Base64 de la imagen
  personnesContact: PersonneContact[];
  actif: boolean;
  dateCreation: string;
  historiqueModifications?: ModificationHistorique[];
  historiqueActivites?: ActiviteHistorique[];
}

const STORAGE_KEY = 'banque_alimentaire_donateurs_fournisseurs';

const normalizarClaveEmpresa = (valor?: string): string =>
  String(valor || '').trim().toLowerCase();

const mapearContactoADonateurFournisseur = (
  contacto: ContactoDepartamento,
  existente?: DonateurFournisseur
): DonateurFournisseur => {
  const nombreContacto = [contacto.nombre, contacto.apellido].filter(Boolean).join(' ').trim();
  const empresa = contacto.nombreEmpresa || nombreContacto || 'Partenaire';

  return {
    id: contacto.id,
    isDonateur: contacto.isDonateur === true || contacto.tipo === 'donador',
    isFournisseur: contacto.isFournisseur === true || contacto.tipo === 'fournisseur',
    participantPRS: contacto.participaPRS === true,
    organismeAcreditadoId: existente?.organismeAcreditadoId,
    organismeAcreditadoNombre: existente?.organismeAcreditadoNombre,
    nomEntreprise: empresa,
    telephone: contacto.telefonoPrincipal || contacto.telefono || existente?.telephone || '',
    adresse: contacto.direccion || existente?.adresse || '',
    logo: existente?.logo,
    personnesContact: existente?.personnesContact?.length
      ? existente.personnesContact
      : [{
          id: contacto.id,
          nom: nombreContacto || empresa,
          email: contacto.email || '',
          telephone: contacto.telefonoPrincipal || contacto.telefono || '',
        }],
    actif: contacto.activo,
    dateCreation: contacto.fechaIngreso || existente?.dateCreation || new Date().toISOString(),
    historiqueModifications: existente?.historiqueModifications || [],
    historiqueActivites: existente?.historiqueActivites || [],
  };
};

// Funciones de almacenamiento
const obtenirDonnees = (): DonateurFournisseur[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  const donneesLegacy: DonateurFournisseur[] = data ? JSON.parse(data) : [];
  const entrepotId = obtenerIdDepartamentoEntrepot();
  const contactosEntrepot = obtenerContactosPorDepartamentoYTipo(entrepotId, ['donador', 'fournisseur']);

  const donneesPorClave = new Map<string, DonateurFournisseur>();

  donneesLegacy.forEach((item) => {
    donneesPorClave.set(item.id, item);

    const claveEmpresa = normalizarClaveEmpresa(item.nomEntreprise);
    if (claveEmpresa) {
      donneesPorClave.set(`empresa:${claveEmpresa}`, item);
    }
  });

  contactosEntrepot.forEach((contacto) => {
    const claveEmpresa = normalizarClaveEmpresa(contacto.nombreEmpresa || `${contacto.nombre} ${contacto.apellido}`);
    const existente = donneesPorClave.get(contacto.id) || (claveEmpresa ? donneesPorClave.get(`empresa:${claveEmpresa}`) : undefined);
    const normalizado = mapearContactoADonateurFournisseur(contacto, existente);

    donneesPorClave.set(contacto.id, normalizado);
    if (claveEmpresa) {
      donneesPorClave.set(`empresa:${claveEmpresa}`, normalizado);
    }
  });

  const donneesFusionnees = Array.from(
    new Map(
      Array.from(donneesPorClave.values()).map((item) => [item.id, item])
    ).values()
  );

  if (JSON.stringify(donneesFusionnees) !== JSON.stringify(donneesLegacy)) {
    sauvegarderDonnees(donneesFusionnees);
  }

  return donneesFusionnees;
};

const sauvegarderDonnees = (donnees: DonateurFournisseur[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(donnees));
};

// Función para sincronizar entradas de inventario con el historial del donador
const sincroniserActivites = (): void => {
  try {
    // Obtener entradas de inventario
    const entradas = localStorage.getItem('banco_alimentos_entradas_inventario');
    if (!entradas) {
      console.log('⚠️ No hay entradas de inventario para sincronizar');
      return;
    }
    
    const entradasParsed = JSON.parse(entradas);
    const donnees = obtenirDonnees();
    
    console.log(`📊 Sincronizando ${entradasParsed.length} entradas con ${donnees.length} donadores/fournisseurs`);
    
    // Agrupar entradas por donador y fecha
    const actividadesPorDonador: { [donadorId: string]: { [fecha: string]: any[] } } = {};
    
    entradasParsed.forEach((entrada: any) => {
      if (!entrada.donadorId || !entrada.activo) return;
      
      // La fecha puede estar en 'fecha' o 'fechaCreacion'
      const fechaEntrada = entrada.fecha || entrada.fechaCreacion;
      if (!fechaEntrada) return;
      
      const fechaSolo = fechaEntrada.split('T')[0]; // Solo fecha sin hora
      
      if (!actividadesPorDonador[entrada.donadorId]) {
        actividadesPorDonador[entrada.donadorId] = {};
      }
      
      if (!actividadesPorDonador[entrada.donadorId][fechaSolo]) {
        actividadesPorDonador[entrada.donadorId][fechaSolo] = [];
      }
      
      actividadesPorDonador[entrada.donadorId][fechaSolo].push(entrada);
    });
    
    // Crear actividades agrupadas por donador y fecha
    Object.keys(actividadesPorDonador).forEach(donadorId => {
      const donador = donnees.find(d => d.id === donadorId);
      if (!donador) {
        console.log(`⚠️ Donador no encontrado: ${donadorId}`);
        return;
      }
      
      console.log(`📦 Sincronizando actividades para: ${donador.nomEntreprise}`);
      
      // Limpiar historial existente para re-sincronizar
      donador.historiqueActivites = [];
      
      Object.keys(actividadesPorDonador[donadorId]).forEach(fecha => {
        const entradasDelDia = actividadesPorDonador[donadorId][fecha];
        
        // Agrupar por tipo de entrada
        const donations = entradasDelDia.filter(e => e.tipoEntrada?.toLowerCase() === 'don');
        const achats = entradasDelDia.filter(e => e.tipoEntrada?.toLowerCase() === 'achat');
        
        console.log(`  📅 ${fecha}: ${donations.length} donations, ${achats.length} achats`);
        
        // Crear actividad para donaciones
        if (donations.length > 0) {
          const produits = [...new Set(donations.map((e: any) => e.nombreProducto))];
          const quantite = donations.reduce((sum: number, e: any) => sum + (e.cantidad || 0), 0);
          const unites = [...new Set(donations.map((e: any) => e.unidad).filter(Boolean))];
          const pesoTotal = donations.reduce((sum: number, e: any) => sum + (e.pesoTotal || 0), 0);
          const valeur = donations.reduce((sum: number, e: any) => sum + (e.valorTotal || 0), 0);
          
          console.log(`    💚 Donation: ${formatQuantity(quantite)} unités (${unites.join('/')}) | ${formatQuantity(pesoTotal)} kg | CAD$ ${formatMoney(valeur)}`);
          
          const activite: ActiviteHistorique = {
            id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            date: donations[0].fecha,
            type: 'donation',
            produits,
            quantite,
            unites,
            pesoTotal,
            valeur,
            reference: donations[0].id
          };
          
          donador.historiqueActivites!.push(activite);
        }
        
        // Crear actividad para compras
        if (achats.length > 0) {
          const produits = [...new Set(achats.map((e: any) => e.nombreProducto))];
          const quantite = achats.reduce((sum: number, e: any) => sum + (e.cantidad || 0), 0);
          const unites = [...new Set(achats.map((e: any) => e.unidad).filter(Boolean))];
          const pesoTotal = achats.reduce((sum: number, e: any) => sum + (e.pesoTotal || 0), 0);
          const valeur = achats.reduce((sum: number, e: any) => sum + (e.valorTotal || 0), 0);
          
          console.log(`    🛒 Achat: ${formatQuantity(quantite)} unités (${unites.join('/')}) | ${formatQuantity(pesoTotal)} kg | CAD$ ${formatMoney(valeur)}`);
          
          const activite: ActiviteHistorique = {
            id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            date: achats[0].fecha,
            type: 'achat',
            produits,
            quantite,
            unites,
            pesoTotal,
            valeur,
            reference: achats[0].id
          };
          
          donador.historiqueActivites!.push(activite);
        }
      });
      
      // Ordenar actividades por fecha (más reciente primero)
      if (donador.historiqueActivites) {
        donador.historiqueActivites.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        console.log(`  ✅ ${donador.historiqueActivites.length} actividades registradas`);
      }
    });
    
    sauvegarderDonnees(donnees);
    const totalActivites = donnees.reduce((sum, d) => sum + (d.historiqueActivites?.length || 0), 0);
    console.log(`✅ Activités synchronisées avec succès: ${totalActivites} activités pour ${Object.keys(actividadesPorDonador).length} partenaires`);
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation des activités:', error);
  }
};

export function GestionDonateursFournisseurs() {
  const branding = useBranding();
  const organismosAcreditados = obtenerOrganismos()
    .filter((organismo) => organismo.activo && organismo.regular)
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'fr', { sensitivity: 'base' }));
  const [activeTab, setActiveTab] = useState<'donateurs' | 'fournisseurs'>('donateurs');
  const [donnees, setDonnees] = useState<DonateurFournisseur[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtrePRS, setFiltrePRS] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modeEdition, setModeEdition] = useState(false);
  const [itemEnEdition, setItemEnEdition] = useState<DonateurFournisseur | null>(null);
  
  const [formulaire, setFormulaire] = useState({
    nomEntreprise: '',
    telephone: '',
    adresse: '',
  });

  // Estado para múltiples contactos
  const [contactos, setContactos] = useState<PersonneContact[]>([
    { id: Date.now().toString(), nom: '', email: '', telephone: '' }
  ]);

  // Estado para el logo
  const [logo, setLogo] = useState<string>('');
  const [logoPreview, setLogoPreview] = useState<string>('');

  // Estado para los tipos (donateur/fournisseur)
  const [estDonateur, setEstDonateur] = useState(false);
  const [estFournisseur, setEstFournisseur] = useState(false);
  const [estParticipantPRS, setEstParticipantPRS] = useState(false);
  const [organismoAcreditadoId, setOrganismoAcreditadoId] = useState('');

  // Estado para el dialog de visualización de historial
  const [dialogHistoriqueOpen, setDialogHistoriqueOpen] = useState(false);
  const [itemVisualization, setItemVisualization] = useState<DonateurFournisseur | null>(null);
  const [historiqueTab, setHistoriqueTab] = useState<'modifications' | 'activites'>('modifications');
  
  // Estado para la vista de contactos
  const [vistaContactos, setVistaContactos] = useState<'cards' | 'table' | 'compact'>('cards');

  // Función para redimensionar y optimizar imagen
  const optimiserImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          // Calcular nuevas dimensiones manteniendo aspecto
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Convertir a base64 con compresión
          const base64 = canvas.toDataURL('image/jpeg', 0.85);
          resolve(base64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Manejar carga de logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image valide');
      return;
    }

    // Validar tamaño (max 5MB antes de compresión)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image est trop grande. Maximum 5MB');
      return;
    }

    try {
      const optimizedBase64 = await optimiserImage(file);
      setLogo(optimizedBase64);
      setLogoPreview(optimizedBase64);
      toast.success('✅ Logo ajouté avec succès');
    } catch (error) {
      toast.error('Erreur lors du traitement de l\'image');
      console.error(error);
    }
  };

  // Eliminar logo
  const supprimerLogo = () => {
    setLogo('');
    setLogoPreview('');
  };

  // Cargar datos al iniciar y sincronizar actividades
  useEffect(() => {
    // Sincronizar actividades desde entradas de inventario
    sincroniserActivites();
    
    // Cargar datos actualizados
    const data = obtenirDonnees();
    setDonnees(data);
    
    // Escuchar eventos de nueva entrada para actualizar en tiempo real
    const handleEntradaGuardada = () => {
      sincroniserActivites();
      const dataActualizada = obtenirDonnees();
      setDonnees(dataActualizada);
    };

    const handleContactosActualizados = () => {
      const dataActualizada = obtenirDonnees();
      setDonnees(dataActualizada);
    };
    
    window.addEventListener('entradaGuardada', handleEntradaGuardada);
    window.addEventListener('contactos-actualizados', handleContactosActualizados);
    
    return () => {
      window.removeEventListener('entradaGuardada', handleEntradaGuardada);
      window.removeEventListener('contactos-actualizados', handleContactosActualizados);
    };
  }, []);

  // Resetear formulario
  const resetFormulaire = () => {
    setFormulaire({
      nomEntreprise: '',
      telephone: '',
      adresse: '',
    });
    setContactos([{ id: Date.now().toString(), nom: '', email: '', telephone: '' }]);
    setLogo('');
    setLogoPreview('');
    setModeEdition(false);
    setItemEnEdition(null);
    setEstDonateur(false);
    setEstFournisseur(false);
    setEstParticipantPRS(false);
    setOrganismoAcreditadoId('');
  };

  // Abrir diálogo para crear
  const ouvrirDialogueCreation = (type: 'donateur' | 'fournisseur') => {
    resetFormulaire();
    setActiveTab(type === 'donateur' ? 'donateurs' : 'fournisseurs');
    // Pre-seleccionar el tipo según el tab activo
    if (type === 'donateur') {
      setEstDonateur(true);
    } else {
      setEstFournisseur(true);
    }
    setDialogOpen(true);
  };

  // Abrir diálogo para editar
  const ouvrirDialogueEdition = (item: DonateurFournisseur) => {
    setFormulaire({
      nomEntreprise: item.nomEntreprise,
      telephone: item.telephone,
      adresse: item.adresse,
    });
    setContactos(item.personnesContact);
    setLogo(item.logo || '');
    setLogoPreview(item.logo || '');
    setItemEnEdition(item);
    setModeEdition(true);
    setDialogOpen(true);
    setEstDonateur(item.isDonateur);
    setEstFournisseur(item.isFournisseur);
    setEstParticipantPRS(item.participantPRS || false);
    setOrganismoAcreditadoId(item.organismeAcreditadoId || '');
  };

  // Guardar (crear o actualizar)
  const sauvegarder = () => {
    // Validaciones
    if (!formulaire.nomEntreprise.trim()) {
      toast.error('Le nom de l\'entreprise est requis');
      return;
    }
    if (!formulaire.telephone.trim()) {
      toast.error('Le téléphone de l\'entreprise est requis');
      return;
    }
    if (!formulaire.adresse.trim()) {
      toast.error('L\'adresse de l\'entreprise est requise');
      return;
    }

    const organismoAcreditadoSeleccionado = estParticipantPRS && organismoAcreditadoId
      ? organismosAcreditados.find((organismo) => organismo.id === organismoAcreditadoId)
      : null;

    if (estParticipantPRS && organismoAcreditadoId && !organismoAcreditadoSeleccionado) {
      toast.error('L\'organisme accrédité sélectionné n\'est plus disponible');
      return;
    }

    // Obtener usuario actual
    const usuarioActual = obtenerUsuarioSesion();
    const nombreUsuario = usuarioActual?.nombre || usuarioActual?.username || 'Système';

    // Preparar historial de modificaciones si es edición
    let historiqueModifications: ModificationHistorique[] = [];
    if (modeEdition && itemEnEdition) {
      historiqueModifications = [...(itemEnEdition.historiqueModifications || [])];
      
      // Detectar cambios y registrarlos
      const cambios: Array<{champ: string, ancienne: string, nouvelle: string}> = [];
      
      if (itemEnEdition.nomEntreprise !== formulaire.nomEntreprise.trim()) {
        cambios.push({
          champ: 'Nom de l\'entreprise',
          ancienne: itemEnEdition.nomEntreprise,
          nouvelle: formulaire.nomEntreprise.trim()
        });
      }
      
      if (itemEnEdition.telephone !== formulaire.telephone.trim()) {
        cambios.push({
          champ: 'Téléphone',
          ancienne: itemEnEdition.telephone,
          nouvelle: formulaire.telephone.trim()
        });
      }
      
      if (itemEnEdition.adresse !== formulaire.adresse.trim()) {
        cambios.push({
          champ: 'Adresse',
          ancienne: itemEnEdition.adresse,
          nouvelle: formulaire.adresse.trim()
        });
      }

      if (itemEnEdition.isDonateur !== estDonateur) {
        cambios.push({
          champ: 'Type Donateur',
          ancienne: itemEnEdition.isDonateur ? 'Oui' : 'Non',
          nouvelle: estDonateur ? 'Oui' : 'Non'
        });
      }

      if (itemEnEdition.isFournisseur !== estFournisseur) {
        cambios.push({
          champ: 'Type Fournisseur',
          ancienne: itemEnEdition.isFournisseur ? 'Oui' : 'Non',
          nouvelle: estFournisseur ? 'Oui' : 'Non'
        });
      }

      if (itemEnEdition.participantPRS !== estParticipantPRS) {
        cambios.push({
          champ: 'Participant PRS',
          ancienne: itemEnEdition.participantPRS ? 'Oui' : 'Non',
          nouvelle: estParticipantPRS ? 'Oui' : 'Non'
        });
      }

      const organismoAnterior = itemEnEdition.organismeAcreditadoNombre || 'Aucun';
      const organismoNuevo = estParticipantPRS
        ? (organismoAcreditadoSeleccionado?.nombre || 'Aucun')
        : 'Aucun';

      if (organismoAnterior !== organismoNuevo) {
        cambios.push({
          champ: 'Organisme accrédité PRS',
          ancienne: organismoAnterior,
          nouvelle: organismoNuevo,
        });
      }

      if (itemEnEdition.logo !== logo) {
        cambios.push({
          champ: 'Logo',
          ancienne: itemEnEdition.logo ? 'Logo existant' : 'Aucun logo',
          nouvelle: logo ? 'Logo mis à jour' : 'Logo supprimé'
        });
      }
      
      // Agregar modificaciones al historial
      cambios.forEach(cambio => {
        historiqueModifications.push({
          id: Date.now().toString() + Math.random(),
          date: new Date().toISOString(),
          champ: cambio.champ,
          ancienneValeur: cambio.ancienne,
          nouvelleValeur: cambio.nouvelle,
          utilisateur: nombreUsuario
        });
      });
    }

    const nouvelleDonnee: DonateurFournisseur = {
      id: modeEdition && itemEnEdition ? itemEnEdition.id : Date.now().toString(),
      isDonateur: estDonateur,
      isFournisseur: estFournisseur,
      participantPRS: estParticipantPRS,
      organismeAcreditadoId: estParticipantPRS ? (organismoAcreditadoSeleccionado?.id || '') : '',
      organismeAcreditadoNombre: estParticipantPRS ? (organismoAcreditadoSeleccionado?.nombre || '') : '',
      nomEntreprise: formulaire.nomEntreprise.trim(),
      telephone: formulaire.telephone.trim(),
      adresse: formulaire.adresse.trim(),
      logo: logo,
      personnesContact: contactos.map(c => ({
        id: c.id,
        nom: c.nom.trim(),
        email: c.email.trim(),
        telephone: c.telephone.trim()
      })),
      actif: true,
      dateCreation: modeEdition && itemEnEdition ? itemEnEdition.dateCreation : new Date().toISOString(),
      historiqueModifications: modeEdition ? historiqueModifications : [],
      historiqueActivites: modeEdition && itemEnEdition ? itemEnEdition.historiqueActivites : []
    };

    let nouvellesDonnees: DonateurFournisseur[];
    if (modeEdition && itemEnEdition) {
      // Actualizar existente
      nouvellesDonnees = donnees.map(d => d.id === itemEnEdition.id ? nouvelleDonnee : d);
      toast.success(`✅ ${activeTab === 'donateurs' ? 'Donateur' : 'Fournisseur'} mis à jour avec succès`);
    } else {
      // Crear nuevo
      nouvellesDonnees = [...donnees, nouvelleDonnee];
      toast.success(`✅ ${activeTab === 'donateurs' ? 'Donateur' : 'Fournisseur'} créé avec succès`);
    }

    sauvegarderDonnees(nouvellesDonnees);
    sincronizarDonateursFournisseurs();
    setDonnees(nouvellesDonnees);
    setDialogOpen(false);
    resetFormulaire();
  };

  // Eliminar
  const supprimer = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      const nouvellesDonnees = donnees.filter(d => d.id !== id);
      sauvegarderDonnees(nouvellesDonnees);
      eliminarContacto(id);
      sincronizarDonateursFournisseurs();
      setDonnees(nouvellesDonnees);
      toast.success('✅ Élément supprimé avec succès');
    }
  };

  // Abrir dialog de visualización de historial
  const ouvrirDialogueHistorique = (item: DonateurFournisseur) => {
    setItemVisualization(item);
    setDialogHistoriqueOpen(true);
    setHistoriqueTab('modifications');
  };

  // Sincronizar manualmente las actividades
  const sincroniserManuellement = () => {
    sincroniserActivites();
    const dataActualizada = obtenirDonnees();
    setDonnees(dataActualizada);
    toast.success('✅ Activités synchronisées avec succès');
  };

  // Filtrar datos según tab activo, búsqueda y filtro PRS
  const donneesFiltrees = donnees.filter(d => {
    const matchType = activeTab === 'donateurs' ? d.isDonateur : d.isFournisseur;
    const matchSearch = searchTerm.trim() === '' || 
      d.nomEntreprise.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.personnesContact[0].nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.telephone.includes(searchTerm) ||
      d.personnesContact[0].telephone.includes(searchTerm);
    const matchPRS = !filtrePRS || d.participantPRS;
    return matchType && matchSearch && matchPRS;
  });

  // Estadísticas
  const totalDonateurs = donnees.filter(d => d.isDonateur).length;
  const totalFournisseurs = donnees.filter(d => d.isFournisseur).length;
  const totalParticipantsPRS = donnees.filter(d => d.participantPRS).length;

  return (
    <div className="relative h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] flex flex-col overflow-hidden -my-3 sm:-my-4 lg:-my-6 -mx-3 sm:-mx-4 lg:-mx-6">
      {/* Fondo degradado con glassmorphism */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 50%, ${branding.primaryColor}08 100%)`
        }}
      />

      <Card className="border-none shadow-none flex-1 flex flex-col overflow-hidden rounded-none w-full relative z-10">
        <CardHeader className="border-none flex-shrink-0 p-6 bg-gradient-to-r from-[#1a4d7a] to-[#2d9561] text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold mb-1 text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Contacts de l'Entrepôt
                </CardTitle>
                <CardDescription className="text-white/90">
                  Gestion des donateurs, fournisseurs et partenaires de l'entrepôt
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={sincroniserManuellement}
              variant="ghost"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20"
              title="Synchroniser les activités"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync
            </Button>
          </div>

          {/* Badges informativos */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Gift className="w-3 h-3 mr-1" />
              Donateurs
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <ShoppingCart className="w-3 h-3 mr-1" />
              Fournisseurs
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Store className="w-3 h-3 mr-1" />
              PRS
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Truck className="w-3 h-3 mr-1" />
              Transporteurs
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <Package className="w-3 h-3 mr-1" />
              Fournisseurs d'Emballage
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-4 flex-1 min-h-0 overflow-y-auto space-y-4">
          {/* Estadísticas */}
          <div className="grid gap-3 md:grid-cols-3 flex-shrink-0">
            <div 
              className="card-glass rounded-2xl p-4 hover-lift cursor-pointer border-l-4"
              style={{ borderLeftColor: '#4CAF50' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666] mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Total Donateurs
                  </p>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: '#4CAF50' }}>
                    {totalDonateurs}
                  </p>
                </div>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' }}
                >
                  <Building2 className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div 
              className="card-glass rounded-2xl p-4 hover-lift cursor-pointer border-l-4"
              style={{ borderLeftColor: '#FF9800' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666] mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Total Fournisseurs
                  </p>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: '#FF9800' }}>
                    {totalFournisseurs}
                  </p>
                </div>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)' }}
                >
                  <Building2 className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div 
              className="card-glass rounded-2xl p-4 hover-lift cursor-pointer border-l-4"
              style={{ borderLeftColor: '#3B82F6' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666] mb-1" style={{ fontFamily: 'Roboto, sans-serif' }}>
                    Participants PRS
                  </p>
                  <p className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: '#3B82F6' }}>
                    {totalParticipantsPRS}
                  </p>
                </div>
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}
                >
                  <Check className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Información sobre sistema dual de partenaires */}
          <div className="card-glass rounded-2xl p-4 border-l-4 border-l-[#2d9561] flex-shrink-0">
            <div className="flex items-start gap-3">
              <div 
                className="w-6 h-6 mt-0.5 flex items-center justify-center rounded-full flex-shrink-0"
                style={{ backgroundColor: '#2d9561', color: 'white' }}
              >
                <span className="text-xs font-bold">i</span>
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif', color: '#1a4d7a' }}>
                  Partenaires avec Types Multiples
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  Un même partenaire peut avoir plusieurs types simultanément (ex: Donateur + Fournisseur). 
                  Les flags <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">isDonateur</code> et{' '}
                  <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">isFournisseur</code> permettent 
                  d'identifier les partenaires duels qui apparaissent dans plusieurs programmes d'entrée.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs y contenido */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'donateurs' | 'fournisseurs')} className="relative z-10 flex flex-col">
            <div className="relative z-10 flex items-center justify-between gap-3 flex-shrink-0">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="donateurs">
                  <Building2 className="w-4 h-4 mr-2" />
                  Donateurs
                </TabsTrigger>
                <TabsTrigger value="fournisseurs">
                  <Building2 className="w-4 h-4 mr-2" />
                  Fournisseurs
                </TabsTrigger>
              </TabsList>

              <Button
                onClick={() => ouvrirDialogueCreation(activeTab === 'donateurs' ? 'donateur' : 'fournisseur')}
                className="gap-2"
                style={{ backgroundColor: branding.secondaryColor }}
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
            </div>

            {/* Barra de búsqueda y filtro PRS */}
            <div className="relative z-10 flex gap-3 flex-shrink-0 mt-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />
                <Input
                  placeholder="Rechercher par nom, téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={filtrePRS ? "default" : "outline"}
                onClick={() => setFiltrePRS(!filtrePRS)}
                className="gap-2 whitespace-nowrap"
                style={filtrePRS ? { backgroundColor: '#3B82F6' } : {}}
              >
                <Check className="w-4 h-4" />
                {filtrePRS ? 'PRS Actif' : 'Filtrer PRS'}
              </Button>
            </div>

            {/* Contenido de tabs */}
            <TabsContent value="donateurs" className="relative z-10 flex-1 overflow-hidden mt-3">
              <div className="h-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Logo</TableHead>
                      <TableHead>Entreprise</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Adresse</TableHead>
                      <TableHead>Personne Contact</TableHead>
                      <TableHead>Contact Email</TableHead>
                      <TableHead>Contact Tél.</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donneesFiltrees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-[#999999] italic py-8">
                          Aucun donateur trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      donneesFiltrees.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                              {item.logo ? (
                                <img 
                                  src={item.logo} 
                                  alt={item.nomEntreprise}
                                  className="w-full h-full object-contain p-1"
                                />
                              ) : (
                                <Building2 className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col gap-1">
                                <span className="font-medium">{item.nomEntreprise}</span>
                                {item.participantPRS && (
                                  <Badge 
                                    variant="outline" 
                                    className="w-fit text-xs gap-1"
                                    style={{ borderColor: '#3B82F6', color: '#3B82F6', background: 'rgba(59, 130, 246, 0.08)' }}
                                  >
                                    <Check className="w-3 h-3" />
                                    PRS
                                  </Badge>
                                )}
                                {item.organismeAcreditadoNombre && (
                                  <span className="text-xs text-[#3B82F6] flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {item.organismeAcreditadoNombre}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#666666]" />
                              <span className="text-sm">{item.telephone || '-'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#666666]" />
                              <span className="text-sm max-w-[200px] truncate">{item.adresse || '-'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-[#666666]" />
                              <span className="text-sm">{item.personnesContact[0].nom}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-[#666666]" />
                              <span className="text-sm">{item.personnesContact[0].email || '-'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#666666]" />
                              <span className="text-sm">{item.personnesContact[0].telephone || '-'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => ouvrirDialogueHistorique(item)}
                                className="hover:bg-purple-50 text-purple-600"
                                title="Voir historique"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => ouvrirDialogueEdition(item)}
                                className="hover:bg-blue-50"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => supprimer(item.id)}
                                className="hover:bg-red-50 text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="fournisseurs" className="relative z-10 flex-1 overflow-hidden mt-3">
              <div className="h-full overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Logo</TableHead>
                      <TableHead>Entreprise</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Adresse</TableHead>
                      <TableHead>Personne Contact</TableHead>
                      <TableHead>Contact Email</TableHead>
                      <TableHead>Contact Tél.</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donneesFiltrees.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-[#999999] italic py-8">
                          Aucun fournisseur trouvé
                        </TableCell>
                      </TableRow>
                    ) : (
                      donneesFiltrees.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                              {item.logo ? (
                                <img 
                                  src={item.logo} 
                                  alt={item.nomEntreprise}
                                  className="w-full h-full object-contain p-1"
                                />
                              ) : (
                                <Building2 className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col gap-1">
                                <span className="font-medium">{item.nomEntreprise}</span>
                                {item.participantPRS && (
                                  <Badge 
                                    variant="outline" 
                                    className="w-fit text-xs gap-1"
                                    style={{ borderColor: '#3B82F6', color: '#3B82F6', background: 'rgba(59, 130, 246, 0.08)' }}
                                  >
                                    <Check className="w-3 h-3" />
                                    PRS
                                  </Badge>
                                )}
                                {item.organismeAcreditadoNombre && (
                                  <span className="text-xs text-[#3B82F6] flex items-center gap-1">
                                    <Building2 className="w-3 h-3" />
                                    {item.organismeAcreditadoNombre}
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#666666]" />
                              <span className="text-sm">{item.telephone || '-'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#666666]" />
                              <span className="text-sm max-w-[200px] truncate">{item.adresse || '-'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-[#666666]" />
                              <span className="text-sm">{item.personnesContact[0].nom}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-[#666666]" />
                              <span className="text-sm">{item.personnesContact[0].email || '-'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-[#666666]" />
                              <span className="text-sm">{item.personnesContact[0].telephone || '-'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => ouvrirDialogueHistorique(item)}
                                className="hover:bg-purple-50 text-purple-600"
                                title="Voir historique"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => ouvrirDialogueEdition(item)}
                                className="hover:bg-blue-50"
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => supprimer(item.id)}
                                className="hover:bg-red-50 text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog de formulario - DISEÑO MODERNO */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0" aria-describedby="donateur-fournisseur-description">
          <DialogHeader className="sr-only">
              <DialogTitle>
                {modeEdition ? 'Modifier' : 'Nouveau'} {activeTab === 'donateurs' ? 'Donateur' : 'Fournisseur'}
              </DialogTitle>
              <DialogDescription id="donateur-fournisseur-description">
                {modeEdition ? 'Mettez à jour les informations du partenaire' : 'Ajoutez un nouveau partenaire à votre réseau'}
              </DialogDescription>
            </DialogHeader>

          {/* Header con degradado */}
          <div 
            className="px-6 py-5 border-b"
            style={{ 
              background: `linear-gradient(135deg, ${activeTab === 'donateurs' ? '#4CAF50' : '#FF9800'}15 0%, ${activeTab === 'donateurs' ? '#4CAF50' : '#FF9800'}08 100%)`
            }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${activeTab === 'donateurs' ? '#4CAF50' : '#FF9800'} 0%, ${activeTab === 'donateurs' ? '#45a049' : '#F57C00'} 100%)` }}
              >
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-2xl mb-1" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                  {modeEdition ? 'Modifier' : 'Nouveau'} {activeTab === 'donateurs' ? 'Donateur' : 'Fournisseur'}
                </h2>
                <p className="text-sm text-[#666666]">
                  {modeEdition ? 'Mettez à jour les informations du partenaire' : 'Ajoutez un nouveau partenaire à votre réseau'}
                </p>
              </div>
            </div>
          </div>

          {/* Contenido con scroll */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-6 py-6">
            <div className="space-y-8">
              {/* Section 1: Informations de l'entreprise */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                {/* Header de la sección */}
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                    style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)` }}
                  >
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                      Informations de l'Entreprise
                    </h3>
                    <p className="text-xs text-[#999999]">Détails de l'organisation partenaire</p>
                  </div>
                </div>

                {/* Card contenedor */}
                <div 
                  className="rounded-2xl p-6 border-2"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                    borderColor: `${branding.primaryColor}20`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                  }}
                >
                  <div className="grid gap-6">
                    {/* Nom Entreprise - Destacado */}
                    <div className="space-y-2">
                      <Label htmlFor="nomEntreprise" className="text-sm font-semibold flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        <Building2 className="w-4 h-4" style={{ color: branding.primaryColor }} />
                        Nom de l'Entreprise
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="nomEntreprise"
                        value={formulaire.nomEntreprise}
                        onChange={(e) => setFormulaire({ ...formulaire, nomEntreprise: e.target.value })}
                        placeholder="Ex: Épicerie solidaire Laval"
                        className="h-12 text-base border-2 focus:ring-2"
                        style={{ 
                          borderColor: formulaire.nomEntreprise ? branding.secondaryColor : '#e5e7eb',
                          transition: 'all 0.2s'
                        }}
                      />
                    </div>

                    {/* Grid de 2 columnas */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="telephone" className="text-sm font-semibold flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          <Phone className="w-4 h-4 text-[#666666]" />
                          Téléphone Principal
                          <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                          <Input
                            id="telephone"
                            value={formulaire.telephone}
                            onChange={(e) => setFormulaire({ ...formulaire, telephone: e.target.value })}
                            placeholder="(514) 555-1234"
                            className="pl-10 h-11"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="adresse" className="text-sm font-semibold flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          <MapPin className="w-4 h-4 text-[#666666]" />
                          Adresse Complète
                          <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                          <Input
                            id="adresse"
                            value={formulaire.adresse}
                            onChange={(e) => setFormulaire({ ...formulaire, adresse: e.target.value })}
                            placeholder="123 Rue Example, Laval, QC H7G 2W5"
                            className="pl-10 h-11"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Logo */}
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        <ImageIcon className="w-4 h-4 text-[#666666]" />
                        Logo de l'Entreprise
                      </Label>
                      
                      {!logoPreview ? (
                        <div
                          className="relative rounded-xl border-2 border-dashed p-8 text-center cursor-pointer hover:border-[#2d9561] transition-all"
                          style={{ borderColor: '#e5e7eb' }}
                          onClick={() => document.getElementById('logo-upload')?.click()}
                        >
                          <input
                            type="file"
                            id="logo-upload"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                          />
                          <div className="flex flex-col items-center gap-3">
                            <div
                              className="w-16 h-16 rounded-full flex items-center justify-center"
                              style={{ background: 'linear-gradient(135deg, #2d9561 0%, #2d9561dd 100%)' }}
                            >
                              <Upload className="w-8 h-8 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                Glisser une image ou cliquer pour sélectionner
                              </p>
                              <p className="text-xs text-[#999999] mt-1">
                                PNG, JPG, GIF jusqu'à 5MB • Adapte automatiquement
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="relative rounded-xl border-2 p-6"
                          style={{ 
                            borderColor: '#2d9561',
                            background: 'linear-gradient(135deg, rgba(45,149,97,0.05) 0%, rgba(45,149,97,0.02) 100%)'
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={logoPreview}
                              alt="Logo"
                              className="w-24 h-24 object-contain rounded-2xl shadow-lg border-2 border-white p-2 bg-white"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-[#333333] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                Logo chargé avec succès
                              </p>
                              <p className="text-xs text-[#666666]">
                                Image optimisée et prête à être sauvegardée
                              </p>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={supprimerLogo}
                              className="hover:bg-red-50 text-red-600 border-red-200"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Type de Partenaire - Checkboxes */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        <Check className="w-4 h-4 text-[#666666]" />
                        Type de Partenaire
                        <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div 
                          className={`rounded-xl p-4 border-2 cursor-pointer transition-all hover:shadow-md ${estDonateur ? 'ring-2 ring-[#4CAF50]' : ''}`}
                          style={{ 
                            background: estDonateur 
                              ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.02) 100%)'
                              : 'rgba(249, 250, 251, 0.5)',
                            borderColor: estDonateur ? '#4CAF50' : '#e5e7eb'
                          }}
                          onClick={() => setEstDonateur(!estDonateur)}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${estDonateur ? 'bg-[#4CAF50] border-[#4CAF50]' : 'border-gray-300'}`}
                            >
                              {estDonateur && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                              <Package className="w-5 h-5 text-[#4CAF50]" />
                              <div>
                                <p className="font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                  Donateur
                                </p>
                                <p className="text-xs text-[#666666]">
                                  Donne des produits
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div 
                          className={`rounded-xl p-4 border-2 cursor-pointer transition-all hover:shadow-md ${estFournisseur ? 'ring-2 ring-[#FF9800]' : ''}`}
                          style={{ 
                            background: estFournisseur 
                              ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(255, 152, 0, 0.02) 100%)'
                              : 'rgba(249, 250, 251, 0.5)',
                            borderColor: estFournisseur ? '#FF9800' : '#e5e7eb'
                          }}
                          onClick={() => setEstFournisseur(!estFournisseur)}
                        >
                          <div className="flex items-center gap-3">
                            <div 
                              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${estFournisseur ? 'bg-[#FF9800] border-[#FF9800]' : 'border-gray-300'}`}
                            >
                              {estFournisseur && <Check className="w-4 h-4 text-white" />}
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                              <ShoppingCart className="w-5 h-5 text-[#FF9800]" />
                              <div>
                                <p className="font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                  Fournisseur
                                </p>
                                <p className="text-xs text-[#666666]">
                                  Vend des produits
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {!estDonateur && !estFournisseur && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                          <span>⚠️</span>
                          Veuillez sélectionner au moins un type
                        </p>
                      )}
                    </div>

                    {/* Programme PRS - Checkbox */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        <Check className="w-4 h-4 text-[#3B82F6]" />
                        Programme de Récupération
                      </Label>
                      <div 
                        className={`rounded-xl p-5 border-2 cursor-pointer transition-all hover:shadow-md ${estParticipantPRS ? 'ring-2 ring-[#3B82F6]' : ''}`}
                        style={{ 
                          background: estParticipantPRS 
                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%)'
                            : 'rgba(249, 250, 251, 0.5)',
                          borderColor: estParticipantPRS ? '#3B82F6' : '#e5e7eb'
                        }}
                        onClick={() => setEstParticipantPRS(!estParticipantPRS)}
                      >
                        <div className="flex items-start gap-4">
                          <div 
                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${estParticipantPRS ? 'bg-[#3B82F6] border-[#3B82F6]' : 'border-gray-300'}`}
                          >
                            {estParticipantPRS && <Check className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Check className="w-5 h-5 text-[#3B82F6]" />
                              <p className="font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                Participant PRS (Programme de Récupération en Supermarchés)
                              </p>
                            </div>
                            <p className="text-sm text-[#666666] leading-relaxed">
                              Ce partenaire participe activement au programme PRS, qui permet la récupération des produits alimentaires non vendus dans les supermarchés pour les redistribuer aux personnes dans le besoin.
                            </p>
                            {estParticipantPRS && (
                              <div className="mt-3 p-3 rounded-lg" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                                <p className="text-xs font-medium text-[#3B82F6]">
                                  ✓ Ce partenaire est inscrit au programme PRS
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {estParticipantPRS && (
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            <Building2 className="w-4 h-4 text-[#3B82F6]" />
                            Organisme accrédité assigné
                          </Label>
                          <Select
                            value={organismoAcreditadoId || '__aucun__'}
                            onValueChange={(value) => setOrganismoAcreditadoId(value === '__aucun__' ? '' : value)}
                          >
                            <SelectTrigger className="h-11 border-2 focus:ring-2 focus:ring-[#3B82F6]">
                              <SelectValue placeholder="Sélectionner un organisme accrédité" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__aucun__">Aucun organisme assigné</SelectItem>
                              {organismosAcreditados.map((organismo) => (
                                <SelectItem key={organismo.id} value={organismo.id}>
                                  {organismo.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-[#666666]">
                            Organismes disponibles: actifs et réguliers. L\'assignation reste optionnelle mais permet d\'identifier rapidement le bénéficiaire PRS prévu.
                          </p>
                          {organismosAcreditados.length === 0 && (
                            <p className="text-xs text-amber-600">
                              Aucun organisme accrédité disponible pour l\'instant.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Divider con icono */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                <ChevronRight className="w-5 h-5 text-[#999999]" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>

              {/* Section 2: Personne de contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="relative"
              >
                {/* Header de la sección */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                      style={{ background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)` }}
                    >
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.secondaryColor }}>
                        Personnes de Contact
                      </h3>
                      <p className="text-xs text-[#999999]">Coordonnées des personnes responsables</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Botones de cambio de vista */}
                    <div className="flex items-center rounded-lg border-2 p-1" style={{ borderColor: `${branding.secondaryColor}30` }}>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setVistaContactos('cards')}
                        className={`h-8 px-3 ${vistaContactos === 'cards' ? 'shadow-sm' : ''}`}
                        style={vistaContactos === 'cards' ? { backgroundColor: branding.secondaryColor, color: 'white' } : {}}
                        title="Vue Cartes"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setVistaContactos('table')}
                        className={`h-8 px-3 ${vistaContactos === 'table' ? 'shadow-sm' : ''}`}
                        style={vistaContactos === 'table' ? { backgroundColor: branding.secondaryColor, color: 'white' } : {}}
                        title="Vue Tableau"
                      >
                        <TableIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => setVistaContactos('compact')}
                        className={`h-8 px-3 ${vistaContactos === 'compact' ? 'shadow-sm' : ''}`}
                        style={vistaContactos === 'compact' ? { backgroundColor: branding.secondaryColor, color: 'white' } : {}}
                        title="Vue Compacte"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setContactos([...contactos, { id: Date.now().toString(), nom: '', email: '', telephone: '' }]);
                      }}
                      className="gap-2"
                      style={{ backgroundColor: branding.secondaryColor }}
                    >
                      <UserPlus className="w-4 h-4" />
                      Ajouter Contact
                    </Button>
                  </div>
                </div>

                {/* Lista de contactos - Vista Cards (Por defecto) */}
                {vistaContactos === 'cards' && (
                  <div className="space-y-4">
                    {contactos.map((contacto, index) => (
                      <motion.div
                        key={contacto.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-2xl p-6 border-2 relative"
                        style={{ 
                          background: 'linear-gradient(135deg, rgba(45,149,97,0.05) 0%, rgba(45,149,97,0.02) 100%)',
                          borderColor: `${branding.secondaryColor}20`,
                          boxShadow: '0 4px 20px rgba(45,149,97,0.08)'
                        }}
                      >
                        {/* Badge de número y botón eliminar */}
                        <div className="flex items-center justify-between mb-4">
                          <Badge 
                            variant="outline" 
                            className="gap-2"
                            style={{ 
                              borderColor: branding.secondaryColor, 
                              color: branding.secondaryColor 
                            }}
                          >
                            <User className="w-3 h-3" />
                            Contact #{index + 1}
                          </Badge>
                          {contactos.length > 1 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setContactos(contactos.filter((_, i) => i !== index));
                              }}
                              className="h-8 w-8 p-0 hover:bg-red-50 text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-6">
                          {/* Nom Contact - Destacado */}
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              <User className="w-4 h-4" style={{ color: branding.secondaryColor }} />
                              Nom Complet
                            </Label>
                            <Input
                              value={contacto.nom}
                              onChange={(e) => {
                                const nuevosContactos = [...contactos];
                                nuevosContactos[index] = { ...contacto, nom: e.target.value };
                                setContactos(nuevosContactos);
                              }}
                              placeholder="Ex: Jean Dupont"
                              className="h-12 text-base border-2 focus:ring-2"
                              style={{ 
                                borderColor: contacto.nom ? branding.secondaryColor : '#e5e7eb',
                                transition: 'all 0.2s'
                              }}
                            />
                          </div>

                          {/* Grid de 2 columnas */}
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                <Mail className="w-4 h-4 text-[#666666]" />
                                Email
                              </Label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                                <Input
                                  type="email"
                                  value={contacto.email}
                                  onChange={(e) => {
                                    const nuevosContactos = [...contactos];
                                    nuevosContactos[index] = { ...contacto, email: e.target.value };
                                    setContactos(nuevosContactos);
                                  }}
                                  placeholder="jean.dupont@example.com"
                                  className="pl-10 h-11"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-semibold flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                <Phone className="w-4 h-4 text-[#666666]" />
                                Téléphone
                              </Label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999]" />
                                <Input
                                  value={contacto.telephone}
                                  onChange={(e) => {
                                    const nuevosContactos = [...contactos];
                                    nuevosContactos[index] = { ...contacto, telephone: e.target.value };
                                    setContactos(nuevosContactos);
                                  }}
                                  placeholder="(514) 555-5678"
                                  className="pl-10 h-11"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Vista Tabla */}
                {vistaContactos === 'table' && (
                  <div className="rounded-xl border-2 overflow-hidden" style={{ borderColor: `${branding.secondaryColor}20` }}>
                    <Table>
                      <TableHeader>
                        <TableRow style={{ backgroundColor: `${branding.secondaryColor}10` }}>
                          <TableHead className="font-bold" style={{ color: branding.secondaryColor }}>#</TableHead>
                          <TableHead className="font-bold" style={{ color: branding.secondaryColor }}>Nom Complet</TableHead>
                          <TableHead className="font-bold" style={{ color: branding.secondaryColor }}>Email</TableHead>
                          <TableHead className="font-bold" style={{ color: branding.secondaryColor }}>Téléphone</TableHead>
                          <TableHead className="font-bold text-center" style={{ color: branding.secondaryColor }}>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contactos.map((contacto, index) => (
                          <TableRow key={contacto.id} className="hover:bg-gray-50">
                            <TableCell>
                              <Badge 
                                variant="outline"
                                style={{ 
                                  borderColor: branding.secondaryColor, 
                                  color: branding.secondaryColor 
                                }}
                              >
                                {index + 1}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Input
                                value={contacto.nom}
                                onChange={(e) => {
                                  const nuevosContactos = [...contactos];
                                  nuevosContactos[index] = { ...contacto, nom: e.target.value };
                                  setContactos(nuevosContactos);
                                }}
                                placeholder="Ex: Jean Dupont"
                                className="h-9"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="email"
                                value={contacto.email}
                                onChange={(e) => {
                                  const nuevosContactos = [...contactos];
                                  nuevosContactos[index] = { ...contacto, email: e.target.value };
                                  setContactos(nuevosContactos);
                                }}
                                placeholder="jean.dupont@example.com"
                                className="h-9"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={contacto.telephone}
                                onChange={(e) => {
                                  const nuevosContactos = [...contactos];
                                  nuevosContactos[index] = { ...contacto, telephone: e.target.value };
                                  setContactos(nuevosContactos);
                                }}
                                placeholder="(514) 555-5678"
                                className="h-9"
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              {contactos.length > 1 && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setContactos(contactos.filter((_, i) => i !== index));
                                  }}
                                  className="h-8 w-8 p-0 hover:bg-red-50 text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Vista Compacta */}
                {vistaContactos === 'compact' && (
                  <div className="space-y-2">
                    {contactos.map((contacto, index) => (
                      <motion.div
                        key={contacto.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="rounded-lg p-4 border-2 hover:shadow-md transition-all"
                        style={{ 
                          borderColor: `${branding.secondaryColor}20`,
                          background: 'white'
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <Badge 
                            variant="outline"
                            className="flex-shrink-0"
                            style={{ 
                              borderColor: branding.secondaryColor, 
                              color: branding.secondaryColor 
                            }}
                          >
                            #{index + 1}
                          </Badge>
                          <div className="flex-1 grid grid-cols-3 gap-3">
                            <Input
                              value={contacto.nom}
                              onChange={(e) => {
                                const nuevosContactos = [...contactos];
                                nuevosContactos[index] = { ...contacto, nom: e.target.value };
                                setContactos(nuevosContactos);
                              }}
                              placeholder="Nom complet"
                              className="h-9"
                            />
                            <Input
                              type="email"
                              value={contacto.email}
                              onChange={(e) => {
                                const nuevosContactos = [...contactos];
                                nuevosContactos[index] = { ...contacto, email: e.target.value };
                                setContactos(nuevosContactos);
                              }}
                              placeholder="Email"
                              className="h-9"
                            />
                            <Input
                              value={contacto.telephone}
                              onChange={(e) => {
                                const nuevosContactos = [...contactos];
                                nuevosContactos[index] = { ...contacto, telephone: e.target.value };
                                setContactos(nuevosContactos);
                              }}
                              placeholder="Téléphone"
                              className="h-9"
                            />
                          </div>
                          {contactos.length > 1 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setContactos(contactos.filter((_, i) => i !== index));
                              }}
                              className="h-8 w-8 p-0 hover:bg-red-50 text-red-600 flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Info note */}
              <div 
                className="rounded-xl p-4 border-l-4"
                style={{ 
                  background: 'rgba(59, 130, 246, 0.05)',
                  borderLeftColor: '#3B82F6'
                }}
              >
                <p className="text-xs text-[#666666]" style={{ fontFamily: 'Roboto, sans-serif' }}>
                  <strong>Note:</strong> Les champs marqués d'un astérisque (<span className="text-red-500">*</span>) sont obligatoires.
                </p>
              </div>
            </div>
          </div>

          {/* Footer con botones */}
          <div 
            className="px-6 py-4 border-t bg-gray-50/80 backdrop-blur-sm"
            style={{ 
              boxShadow: '0 -4px 20px rgba(0,0,0,0.03)'
            }}
          >
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetFormulaire();
                }}
                className="gap-2 h-11 px-6"
              >
                <X className="w-4 h-4" />
                Annuler
              </Button>
              <Button
                onClick={sauvegarder}
                className="gap-2 h-11 px-8 shadow-lg text-white"
                style={{ 
                  background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)`
                }}
              >
                <Save className="w-4 h-4" />
                {modeEdition ? 'Mettre à jour' : 'Créer le Partenaire'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Historial - VISUALIZACIÓN */}
      <Dialog open={dialogHistoriqueOpen} onOpenChange={setDialogHistoriqueOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0 gap-0" aria-describedby="historique-partenaire-description">
          <DialogHeader className="sr-only">
              <DialogTitle>Historique du Partenaire</DialogTitle>
              <DialogDescription id="historique-partenaire-description">
                Consultez l'historique des modifications et des activités
              </DialogDescription>
            </DialogHeader>

          {/* Header con logo e info del partenaire */}
          {itemVisualization && (
            <div 
              className="px-6 py-5 border-b"
              style={{ 
                background: `linear-gradient(135deg, #7C3AED15 0%, #7C3AED08 100%)`
              }}
            >
              <div className="flex items-center gap-4">
                {itemVisualization.logo ? (
                  <img
                    src={itemVisualization.logo}
                    alt={itemVisualization.nomEntreprise}
                    className="w-16 h-16 object-contain rounded-2xl shadow-lg border-2 border-white p-1 bg-white"
                  />
                ) : (
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)' }}
                  >
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-2xl mb-1" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                    {itemVisualization.nomEntreprise}
                  </h2>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      {itemVisualization.isDonateur && (
                        <Badge 
                          variant="outline" 
                          className="gap-1"
                          style={{ borderColor: '#4CAF50', color: '#4CAF50' }}
                        >
                          <Package className="w-3 h-3" />
                          Donateur
                        </Badge>
                      )}
                      {itemVisualization.isFournisseur && (
                        <Badge 
                          variant="outline"
                          className="gap-1"
                          style={{ borderColor: '#FF9800', color: '#FF9800' }}
                        >
                          <ShoppingCart className="w-3 h-3" />
                          Fournisseur
                        </Badge>
                      )}
                      {itemVisualization.participantPRS && (
                        <Badge 
                          variant="outline"
                          className="gap-1"
                          style={{ borderColor: '#3B82F6', color: '#3B82F6', background: 'rgba(59, 130, 246, 0.08)' }}
                        >
                          <Check className="w-3 h-3" />
                          Participant PRS
                        </Badge>
                      )}
                      {itemVisualization.organismeAcreditadoNombre && (
                        <Badge 
                          variant="outline"
                          className="gap-1"
                          style={{ borderColor: branding.secondaryColor, color: branding.secondaryColor }}
                        >
                          <Building2 className="w-3 h-3" />
                          {itemVisualization.organismeAcreditadoNombre}
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-[#666666]">{itemVisualization.telephone}</span>
                    <span className="text-sm text-[#666666]">{itemVisualization.adresse}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tabs de historique */}
          {itemVisualization && (
            <Tabs value={historiqueTab} onValueChange={(v) => setHistoriqueTab(v as 'modifications' | 'activites')} className="flex-1 flex flex-col overflow-hidden">
              <div className="px-6 pt-4 border-b flex-shrink-0">
                <TabsList className="grid w-full max-w-lg grid-cols-2">
                  <TabsTrigger value="modifications">
                    <History className="w-4 h-4 mr-2" />
                    Historique de Modifications
                  </TabsTrigger>
                  <TabsTrigger value="activites">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Historique d'Activité
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Contenido con scroll */}
              <div className="overflow-y-auto flex-1">
                {/* Tab de modificaciones */}
                <TabsContent value="modifications" className="m-0 p-6">
                  <div className="space-y-4">
                    {(!itemVisualization.historiqueModifications || itemVisualization.historiqueModifications.length === 0) ? (
                      <div className="text-center py-12">
                        <div 
                          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                          style={{ background: 'rgba(156, 163, 175, 0.1)' }}
                        >
                          <History className="w-10 h-10 text-[#9CA3AF]" />
                        </div>
                        <p className="text-[#999999] text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Aucune modification enregistrée
                        </p>
                        <p className="text-sm text-[#666666]">
                          Les modifications apportées à ce partenaire apparaîtront ici
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {itemVisualization.historiqueModifications.map((modif) => (
                          <motion.div
                            key={modif.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="rounded-xl p-4 border-2 hover:shadow-md transition-all"
                            style={{ 
                              background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.03) 0%, rgba(124, 58, 237, 0.01) 100%)',
                              borderColor: 'rgba(124, 58, 237, 0.15)'
                            }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <div 
                                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ background: 'rgba(124, 58, 237, 0.1)' }}
                                >
                                  <Clock className="w-5 h-5 text-[#7C3AED]" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                      {modif.champ}
                                    </h4>
                                    <Badge variant="outline" style={{ borderColor: '#7C3AED', color: '#7C3AED' }}>
                                      Modifié
                                    </Badge>
                                  </div>
                                  <div className="grid md:grid-cols-2 gap-4 mb-2">
                                    <div className="space-y-1">
                                      <p className="text-xs text-[#999999] uppercase tracking-wide">Ancienne Valeur</p>
                                      <p className="text-sm text-[#666666] line-through">{modif.ancienneValeur || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs text-[#999999] uppercase tracking-wide">Nouvelle Valeur</p>
                                      <p className="text-sm font-medium" style={{ color: branding.secondaryColor }}>{modif.nouvelleValeur}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-[#999999]">
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3" />
                                      {modif.utilisateur}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {new Date(modif.date).toLocaleString('fr-FR', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Tab de actividades */}
                <TabsContent value="activites" className="m-0 p-6">
                  <div className="space-y-4">
                    {(!itemVisualization.historiqueActivites || itemVisualization.historiqueActivites.length === 0) ? (
                      <div className="text-center py-12">
                        <div 
                          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                          style={{ background: 'rgba(156, 163, 175, 0.1)' }}
                        >
                          <TrendingUp className="w-10 h-10 text-[#9CA3AF]" />
                        </div>
                        <p className="text-[#999999] text-lg mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Aucune activité enregistrée
                        </p>
                        <p className="text-sm text-[#666666]">
                          Les donations et achats avec ce partenaire apparaîtront ici
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {itemVisualization.historiqueActivites.map((activite) => (
                          <motion.div
                            key={activite.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="rounded-xl p-4 border-2 hover:shadow-md transition-all"
                            style={{ 
                              background: activite.type === 'donation'
                                ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.03) 0%, rgba(76, 175, 80, 0.01) 100%)'
                                : 'linear-gradient(135deg, rgba(255, 152, 0, 0.03) 0%, rgba(255, 152, 0, 0.01) 100%)',
                              borderColor: activite.type === 'donation' ? 'rgba(76, 175, 80, 0.15)' : 'rgba(255, 152, 0, 0.15)'
                            }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3 flex-1">
                                <div 
                                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                  style={{ background: activite.type === 'donation' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)' }}
                                >
                                  {activite.type === 'donation' ? (
                                    <Package className="w-5 h-5 text-[#4CAF50]" />
                                  ) : (
                                    <ShoppingCart className="w-5 h-5 text-[#FF9800]" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                      {activite.type === 'donation' ? 'Donation' : 'Achat'}
                                    </h4>
                                    <Badge 
                                      variant="outline" 
                                      style={{ 
                                        borderColor: activite.type === 'donation' ? '#4CAF50' : '#FF9800', 
                                        color: activite.type === 'donation' ? '#4CAF50' : '#FF9800'
                                      }}
                                    >
                                      Réf: {activite.reference}
                                    </Badge>
                                  </div>
                                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                                    <div className="space-y-1">
                                      <p className="text-xs text-[#999999] uppercase tracking-wide">Produits</p>
                                      <p className="text-sm text-[#666666]">
                                        {activite.produits.length > 2 
                                          ? `${activite.produits.slice(0, 2).join(', ')}... (+${activite.produits.length - 2})`
                                          : activite.produits.join(', ')}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs text-[#999999] uppercase tracking-wide">Quantité</p>
                                      <p className="text-sm font-medium text-[#333333]">
                                        {activite.quantite} {activite.unites && activite.unites.length > 0 ? activite.unites.join('/') : 'unités'}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs text-[#999999] uppercase tracking-wide">Poids Total</p>
                                      <p className="text-sm font-medium text-[#333333]">
                                        {activite.pesoTotal 
                                          ? `${formatQuantity(activite.pesoTotal)} kg`
                                          : '—'}
                                      </p>
                                    </div>
                                    <div className="space-y-1">
                                      <p className="text-xs text-[#999999] uppercase tracking-wide">Valeur</p>
                                      <p className="text-sm font-bold" style={{ color: activite.type === 'donation' ? '#4CAF50' : '#FF9800' }}>
                                        {activite.valeur > 0
                                          ? `CAD$ ${formatMoney(activite.valeur)}`
                                          : '—'}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-[#999999]">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {new Date(activite.date).toLocaleString('fr-FR', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t bg-gray-50/80 backdrop-blur-sm flex-shrink-0">
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setDialogHistoriqueOpen(false)}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Fermer
                  </Button>
                </div>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <style>{`
        .card-glass {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }
        
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </div>
  );
}