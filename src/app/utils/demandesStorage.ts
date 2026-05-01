// Système de gestion des demandes des organismes vers Liaison

export interface Demande {
  id: string;
  organismeId: string;
  organismeNom: string;
  type: 'technique' | 'modification' | 'question' | 'urgente';
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  statut: 'nouveau' | 'en_cours' | 'resolu' | 'ferme';
  sujet: string;
  description: string;
  fichierJoint?: string;
  dateCreation: string;
  dateDerniereModification: string;
  reponses: ReponsedemAnde[];
  assigneA?: string; // ID de l'administrateur Liaison
  tags?: string[];
}

export interface ReponsedemAnde {
  id: string;
  auteurId: string;
  auteurNom: string;
  auteurRole: 'organisme' | 'liaison';
  message: string;
  dateCreation: string;
  fichierJoint?: string;
}

const STORAGE_KEY = 'demandes_organismes';

// Obtenir toutes les demandes
export const obtenirDemandes = (): Demande[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes:', error);
    return [];
  }
};

// Sauvegarder les demandes
const sauvegarderDemandes = (demandes: Demande[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demandes));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des demandes:', error);
  }
};

// Créer une nouvelle demande
export const creerDemande = (demande: Omit<Demande, 'id' | 'dateCreation' | 'dateDerniereModification' | 'reponses' | 'statut'>): Demande => {
  const demandes = obtenirDemandes();
  
  const nouvelleDemande: Demande = {
    ...demande,
    id: `DEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    dateCreation: new Date().toISOString(),
    dateDerniereModification: new Date().toISOString(),
    reponses: [],
    statut: 'nouveau'
  };
  
  demandes.push(nouvelleDemande);
  sauvegarderDemandes(demandes);
  
  return nouvelleDemande;
};

// Obtenir les demandes d'un organisme spécifique
export const obtenirDemandesParOrganisme = (organismeId: string): Demande[] => {
  const demandes = obtenirDemandes();
  return demandes.filter(d => d.organismeId === organismeId);
};

// Obtenir une demande par ID
export const obtenirDemandeParId = (demandeId: string): Demande | undefined => {
  const demandes = obtenirDemandes();
  return demandes.find(d => d.id === demandeId);
};

// Mettre à jour une demande
export const mettreAJourDemande = (demandeId: string, updates: Partial<Demande>): boolean => {
  const demandes = obtenirDemandes();
  const index = demandes.findIndex(d => d.id === demandeId);
  
  if (index === -1) return false;
  
  demandes[index] = {
    ...demandes[index],
    ...updates,
    dateDerniereModification: new Date().toISOString()
  };
  
  sauvegarderDemandes(demandes);
  return true;
};

// Ajouter une réponse à une demande
export const ajouterReponse = (
  demandeId: string,
  auteurId: string,
  auteurNom: string,
  auteurRole: 'organisme' | 'liaison',
  message: string,
  fichierJoint?: string
): boolean => {
  const demandes = obtenirDemandes();
  const index = demandes.findIndex(d => d.id === demandeId);
  
  if (index === -1) return false;
  
  const nouvelleReponse: ReponsedemAnde = {
    id: `REP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    auteurId,
    auteurNom,
    auteurRole,
    message,
    dateCreation: new Date().toISOString(),
    fichierJoint
  };
  
  demandes[index].reponses.push(nouvelleReponse);
  demandes[index].dateDerniereModification = new Date().toISOString();
  
  // Si c'est une réponse de Liaison, changer le statut à "en_cours"
  if (auteurRole === 'liaison' && demandes[index].statut === 'nouveau') {
    demandes[index].statut = 'en_cours';
  }
  
  sauvegarderDemandes(demandes);
  return true;
};

// Changer le statut d'une demande
export const changerStatutDemande = (demandeId: string, statut: Demande['statut']): boolean => {
  return mettreAJourDemande(demandeId, { statut });
};

// Assigner une demande à un administrateur
export const assignerDemande = (demandeId: string, assigneA: string): boolean => {
  return mettreAJourDemande(demandeId, { assigneA });
};

// Obtenir le nombre de nouvelles demandes
export const obtenirNombreNouvellesDemandes = (): number => {
  const demandes = obtenirDemandes();
  return demandes.filter(d => d.statut === 'nouveau').length;
};

// Obtenir le nombre de demandes par statut
export const obtenirStatistiquesDemandes = () => {
  const demandes = obtenirDemandes();
  
  return {
    total: demandes.length,
    nouveau: demandes.filter(d => d.statut === 'nouveau').length,
    enCours: demandes.filter(d => d.statut === 'en_cours').length,
    resolu: demandes.filter(d => d.statut === 'resolu').length,
    ferme: demandes.filter(d => d.statut === 'ferme').length,
    urgent: demandes.filter(d => d.priorite === 'urgente').length
  };
};

// Supprimer une demande
export const supprimerDemande = (demandeId: string): boolean => {
  const demandes = obtenirDemandes();
  const nouvellesDemandes = demandes.filter(d => d.id !== demandeId);
  
  if (nouvellesDemandes.length === demandes.length) return false;
  
  sauvegarderDemandes(nouvellesDemandes);
  return true;
};

// Initialiser avec des données de démonstration
export const initialiserDonneesDemo = () => {
  const demandesExistantes = obtenirDemandes();
  
  if (demandesExistantes.length === 0) {
    const demandesDemo: Demande[] = [
      {
        id: 'DEM-001',
        organismeId: '1',
        organismeNom: 'Banque Alimentaire Montréal',
        type: 'technique',
        priorite: 'haute',
        statut: 'en_cours',
        sujet: 'Problème de connexion à la plateforme',
        description: 'Nous rencontrons des difficultés pour accéder à notre espace depuis hier. Message d\'erreur lors de la connexion.',
        dateCreation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        dateDerniereModification: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        assigneA: 'admin-liaison-1',
        tags: ['technique', 'urgent'],
        reponses: [
          {
            id: 'REP-001',
            auteurId: 'admin-liaison-1',
            auteurNom: 'Marie Dubois',
            auteurRole: 'liaison',
            message: 'Bonjour, nous avons identifié le problème. Il s\'agit d\'un problème temporaire qui sera résolu dans les prochaines heures. Merci de votre patience.',
            dateCreation: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: 'DEM-002',
        organismeId: '2',
        organismeNom: 'Centre d\'Action Bénévole',
        type: 'modification',
        priorite: 'normale',
        statut: 'nouveau',
        sujet: 'Mise à jour de nos coordonnées',
        description: 'Nous avons déménagé dans de nouveaux locaux. Pourriez-vous mettre à jour notre adresse: 456 Rue Principale, Montréal, H2X 1Y5',
        dateCreation: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        dateDerniereModification: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        reponses: [],
        tags: ['modification', 'coordonnées']
      },
      {
        id: 'DEM-003',
        organismeId: '3',
        organismeNom: 'Œuvre de Charité Laval',
        type: 'question',
        priorite: 'basse',
        statut: 'resolu',
        sujet: 'Question sur les rapports mensuels',
        description: 'Pourriez-vous m\'expliquer comment générer les rapports mensuels d\'activité?',
        dateCreation: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        dateDerniereModification: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        assigneA: 'admin-liaison-2',
        tags: ['question', 'rapports'],
        reponses: [
          {
            id: 'REP-002',
            auteurId: 'admin-liaison-2',
            auteurNom: 'Jean Martin',
            auteurRole: 'liaison',
            message: 'Bonjour! Pour générer vos rapports mensuels, rendez-vous dans la section "Rapports" puis cliquez sur "Générer rapport mensuel". Vous pourrez choisir le mois et le format de téléchargement.',
            dateCreation: new Date(Date.now() - 4.5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'REP-003',
            auteurId: '3',
            auteurNom: 'Sophie Tremblay',
            auteurRole: 'organisme',
            message: 'Parfait, merci beaucoup! C\'est très clair.',
            dateCreation: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]
      }
    ];
    
    sauvegarderDemandes(demandesDemo);
  }
};