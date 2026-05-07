import { obtenerUsuarioSesion } from './sesionStorage';
import { guardarEntrada } from './entradaInventarioStorage';

export type StatutBonAchat = 'brouillon' | 'en_attente' | 'approuve' | 'refuse' | 'commande' | 'recu' | 'annule';
export type PrioriteBonAchat = 'normal' | 'urgent' | 'critique';
export type DecisionAutorisation = 'en_attente' | 'approuve' | 'refuse';

export interface LigneBonAchat {
  id: string;
  description: string;
  quantite: number;
  unite: string;
  prixUnitaire: number;
  total: number;
}

export interface AutorisationBonAchat {
  id: string;
  regleId: string;
  nom: string;
  roleAutorisateur: string;
  decision: DecisionAutorisation;
  autorisateurId?: string;
  autorisateurNom?: string;
  dateDecision?: string;
  commentaire?: string;
}

export interface HistoriqueBonAchat {
  id: string;
  date: string;
  action: string;
  acteur: string;
  details: string;
}

export interface BonAchat {
  id: string;
  numero: string;
  programmeAchatId?: string;
  programmeAchatNom?: string;
  fournisseurId: string;
  fournisseurNom: string;
  fournisseurEmail: string;
  fournisseurTelephone?: string;
  fournisseurAdresse?: string;
  dateCreation: string;
  dateLivraisonSouhaitee?: string;
  createdById?: string;
  createdByName: string;
  departementCode: string;
  priorite: PrioriteBonAchat;
  statut: StatutBonAchat;
  devise: 'CAD';
  conditionsPaiement?: string;
  notes?: string;
  lignes: LigneBonAchat[];
  montantTotal: number;
  autorisations: AutorisationBonAchat[];
  inventarioRegistrado?: boolean;
  entradasInventarioIds?: string[];
  fechaRecepcionInventario?: string;
  updatedAt: string;
  historique: HistoriqueBonAchat[];
}

export interface RegleAutorisationAchat {
  id: string;
  nom: string;
  roleAutorisateur: string;
  montantMinimum: number;
  montantMaximum?: number | null;
  description: string;
  actif: boolean;
  ordre: number;
}

export interface ProgrammeAchat {
  id: string;
  nom: string;
  code: string;
  responsable?: string;
  budgetAnnuel?: number | null;
  description?: string;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NouveauBonAchat {
  programmeAchatId?: string;
  programmeAchatNom?: string;
  fournisseurId: string;
  fournisseurNom: string;
  fournisseurEmail: string;
  fournisseurTelephone?: string;
  fournisseurAdresse?: string;
  dateLivraisonSouhaitee?: string;
  createdById?: string;
  createdByName: string;
  priorite: PrioriteBonAchat;
  statutInitial: StatutBonAchat;
  conditionsPaiement?: string;
  notes?: string;
  lignes: LigneBonAchat[];
}

const STORAGE_BONS_KEY = 'banque_alimentaire_bons_achat';
const STORAGE_REGLES_KEY = 'banque_alimentaire_autorisations_achat';
const STORAGE_PROGRAMMES_KEY = 'banque_alimentaire_programmes_achat';

const REGLES_PAR_DEFAUT: RegleAutorisationAchat[] = [
  {
    id: 'achat-rule-1',
    nom: 'Validation opérationnelle',
    roleAutorisateur: 'Coordination des achats',
    montantMinimum: 0,
    montantMaximum: 499.99,
    description: 'Contrôle de cohérence du besoin, du fournisseur et du budget opérationnel.',
    actif: true,
    ordre: 1
  },
  {
    id: 'achat-rule-2',
    nom: 'Approbation budgétaire',
    roleAutorisateur: 'Direction administrative',
    montantMinimum: 500,
    montantMaximum: 1499.99,
    description: 'Validation financière obligatoire pour tout bon d\'achat à partir de 500 CAD.',
    actif: true,
    ordre: 2
  },
  {
    id: 'achat-rule-3',
    nom: 'Autorisation exécutive',
    roleAutorisateur: 'Direction générale',
    montantMinimum: 1500,
    montantMaximum: null,
    description: 'Niveau d\'approbation requis pour les achats stratégiques et urgents.',
    actif: true,
    ordre: 3
  }
];

function lireDepuisStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function ecrireDansStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function genererId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function genererNumeroBon(bonsExistants: BonAchat[]): string {
  const date = new Date();
  const annee = date.getFullYear();
  const mois = `${date.getMonth() + 1}`.padStart(2, '0');
  const prefixe = `BA-ACH-${annee}${mois}-`;
  const prochainIndex = bonsExistants.reduce((max, bon) => {
    if (!bon.numero.startsWith(prefixe)) {
      return max;
    }

    const sequence = Number(bon.numero.slice(prefixe.length));
    if (!Number.isFinite(sequence)) {
      return max;
    }

    return Math.max(max, sequence);
  }, 0);

  return `${prefixe}${`${prochainIndex + 1}`.padStart(3, '0')}`;
}

function migrarBonsAchat(bons: BonAchat[]): BonAchat[] {
  let needsUpdate = false;

  const bonsActualizados = bons.map(bon => {
    const bonLegacy = bon as BonAchat & { numeroPO?: string; reference?: string };
    const inventarioRegistrado = bonLegacy.inventarioRegistrado ?? false;
    const entradasInventarioIds = bonLegacy.entradasInventarioIds ?? [];
    const hadPo = Object.prototype.hasOwnProperty.call(bonLegacy, 'numeroPO');
    const hadReference = Object.prototype.hasOwnProperty.call(bonLegacy, 'reference');
    const needsDefaults = bonLegacy.inventarioRegistrado == null || bonLegacy.entradasInventarioIds == null;

    if (hadPo || hadReference || needsDefaults) {
      needsUpdate = true;
    }

    const { numeroPO: _removedPo, reference: _removedReference, ...rest } = {
      ...bonLegacy,
      inventarioRegistrado,
      entradasInventarioIds
    };

    return rest;
  });

  if (needsUpdate) {
    ecrireDansStorage(STORAGE_BONS_KEY, bonsActualizados);
  }

  return bonsActualizados;
}

function obtenirNomActeurParDefaut(): string {
  const usuario = obtenerUsuarioSesion();
  if (!usuario) {
    return 'Système';
  }

  return `${usuario.nombre} ${usuario.apellido || ''}`.trim();
}

function crearHistorique(action: string, details: string, acteur?: string): HistoriqueBonAchat {
  return {
    id: genererId('hist'),
    date: new Date().toISOString(),
    action,
    acteur: acteur || obtenirNomActeurParDefaut(),
    details
  };
}

export function obtenerReglasAutorizacionAchat(): RegleAutorisationAchat[] {
  return lireDepuisStorage(STORAGE_REGLES_KEY, REGLES_PAR_DEFAUT)
    .sort((a, b) => a.ordre - b.ordre);
}

export function obtenerProgrammesAchat(): ProgrammeAchat[] {
  return lireDepuisStorage<ProgrammeAchat[]>(STORAGE_PROGRAMMES_KEY, [])
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
}

export function guardarProgrammeAchat(programme: Omit<ProgrammeAchat, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): ProgrammeAchat {
  const programmes = obtenerProgrammesAchat();
  const now = new Date().toISOString();
  const existant = programme.id ? programmes.find(item => item.id === programme.id) : null;

  const programmeFinal: ProgrammeAchat = {
    ...programme,
    id: programme.id || genererId('programme'),
    createdAt: existant?.createdAt || now,
    updatedAt: now,
  };

  const index = programmes.findIndex(item => item.id === programmeFinal.id);
  if (index >= 0) {
    programmes[index] = programmeFinal;
  } else {
    programmes.push(programmeFinal);
  }

  ecrireDansStorage(STORAGE_PROGRAMMES_KEY, programmes.sort((a, b) => a.nom.localeCompare(b.nom, 'fr')));
  return programmeFinal;
}

export function eliminarProgrammeAchat(programmeId: string): void {
  const programmes = obtenerProgrammesAchat().filter(programme => programme.id !== programmeId);
  ecrireDansStorage(STORAGE_PROGRAMMES_KEY, programmes);
}

export function guardarReglaAutorizacionAchat(regla: Omit<RegleAutorisationAchat, 'id'> & { id?: string }): RegleAutorisationAchat {
  const reglas = obtenerReglasAutorizacionAchat();
  const nuevaRegla: RegleAutorisationAchat = {
    ...regla,
    id: regla.id || genererId('rule')
  };

  const index = reglas.findIndex(item => item.id === nuevaRegla.id);
  if (index >= 0) {
    reglas[index] = nuevaRegla;
  } else {
    reglas.push(nuevaRegla);
  }

  ecrireDansStorage(STORAGE_REGLES_KEY, reglas.sort((a, b) => a.ordre - b.ordre));
  return nuevaRegla;
}

export function eliminarReglaAutorizacionAchat(reglaId: string): void {
  const reglas = obtenerReglasAutorizacionAchat().filter(regla => regla.id !== reglaId);
  ecrireDansStorage(STORAGE_REGLES_KEY, reglas);
}

export function construirAutorizacionesIniciales(montantTotal: number): AutorisationBonAchat[] {
  const reglasActivas = obtenerReglasAutorizacionAchat().filter(regla => {
    if (!regla.actif) {
      return false;
    }

    const cumpleMinimo = montantTotal >= regla.montantMinimum;
    const cumpleMaximo = regla.montantMaximum == null || montantTotal <= regla.montantMaximum;
    return cumpleMinimo && cumpleMaximo;
  });

  const reglasFinales = reglasActivas.length > 0
    ? reglasActivas
    : obtenerReglasAutorizacionAchat().filter(regla => regla.actif).slice(0, 1);

  return reglasFinales.map(regla => ({
    id: genererId('autorisation'),
    regleId: regla.id,
    nom: regla.nom,
    roleAutorisateur: regla.roleAutorisateur,
    decision: 'en_attente'
  }));
}

export function obtenerBonsAchat(): BonAchat[] {
  return migrarBonsAchat(lireDepuisStorage<BonAchat[]>(STORAGE_BONS_KEY, []))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export function crearBonAchat(data: NuevoBonAchat): BonAchat {
  const bons = obtenerBonsAchat();
  const numero = genererNumeroBon(bons);
  const now = new Date().toISOString();
  const autorisations = construirAutorizacionesIniciales(
    data.lignes.reduce((sum, ligne) => sum + ligne.total, 0)
  );

  const bon: BonAchat = {
    id: genererId('bon'),
    numero,
    programmeAchatId: data.programmeAchatId,
    programmeAchatNom: data.programmeAchatNom,
    fournisseurId: data.fournisseurId,
    fournisseurNom: data.fournisseurNom,
    fournisseurEmail: data.fournisseurEmail,
    fournisseurTelephone: data.fournisseurTelephone,
    fournisseurAdresse: data.fournisseurAdresse,
    dateCreation: now,
    dateLivraisonSouhaitee: data.dateLivraisonSouhaitee,
    createdById: data.createdById,
    createdByName: data.createdByName,
    departementCode: 'ACHAT',
    priorite: data.priorite,
    statut: data.statutInitial,
    devise: 'CAD',
    conditionsPaiement: data.conditionsPaiement,
    notes: data.notes,
    lignes: data.lignes,
    montantTotal: data.lignes.reduce((sum, ligne) => sum + ligne.total, 0),
    autorisations,
    inventarioRegistrado: false,
    entradasInventarioIds: [],
    updatedAt: now,
    historique: [
      crearHistorique(
        data.statutInitial === 'en_attente' ? 'Soumission' : 'Création',
        data.statutInitial === 'en_attente'
          ? `Bon d'achat ${numero} soumis au circuit d'autorisation.`
          : `Bon d'achat ${numero} enregistré en brouillon.`,
        data.createdByName
      )
    ]
  };

  ecrireDansStorage(STORAGE_BONS_KEY, [bon, ...bons]);
  return bon;
}

export function actualizarBonAchat(bonId: string, updates: Partial<BonAchat>, acteur?: string): BonAchat | null {
  const bons = obtenerBonsAchat();
  const index = bons.findIndex(bon => bon.id === bonId);
  if (index === -1) {
    return null;
  }

  const bonActualizado: BonAchat = {
    ...bons[index],
    ...updates,
    updatedAt: new Date().toISOString(),
    historique: updates.historique || bons[index].historique
  };

  if (updates.statut && updates.statut !== bons[index].statut) {
    bonActualizado.historique = [
      crearHistorique('Changement de statut', `Statut mis à jour vers ${updates.statut}.`, acteur),
      ...bonActualizado.historique
    ];
  }

  bons[index] = bonActualizado;
  ecrireDansStorage(STORAGE_BONS_KEY, bons);
  return bonActualizado;
}

export function soumettreBonAchat(bonId: string, acteur?: string): BonAchat | null {
  const bons = obtenerBonsAchat();
  const bon = bons.find(item => item.id === bonId);
  if (!bon) {
    return null;
  }

  const autorisations = bon.autorisations.length > 0
    ? bon.autorisations
    : construirAutorizacionesIniciales(bon.montantTotal);

  return actualizarBonAchat(
    bonId,
    {
      statut: 'en_attente',
      autorisations,
      historique: [
        crearHistorique('Soumission', `Bon d'achat ${bon.numero} envoyé pour approbation.`, acteur),
        ...bon.historique
      ]
    },
    acteur
  );
}

export function registrerDecisionBonAchat(
  bonId: string,
  decision: Exclude<DecisionAutorisation, 'en_attente'>,
  autorisateur: { id?: string; nom: string; role: string; commentaire?: string },
  autorisationId?: string
): BonAchat | null {
  const bons = obtenerBonsAchat();
  const bon = bons.find(item => item.id === bonId);
  if (!bon) {
    return null;
  }

  const cible = autorisationId
    ? bon.autorisations.find(item => item.id === autorisationId)
    : bon.autorisations.find(item => item.decision === 'en_attente');

  if (!cible) {
    return bon;
  }

  const autorisations = bon.autorisations.map(item => {
    if (item.id !== cible.id) {
      return item;
    }

    return {
      ...item,
      decision,
      autorisateurId: autorisateur.id,
      autorisateurNom: autorisateur.nom,
      dateDecision: new Date().toISOString(),
      commentaire: autorisateur.commentaire,
      roleAutorisateur: autorisateur.role || item.roleAutorisateur
    };
  });

  const existeRefus = autorisations.some(item => item.decision === 'refuse');
  const todoAprobado = autorisations.every(item => item.decision === 'approuve');

  const nouveauStatut: StatutBonAchat = existeRefus
    ? 'refuse'
    : todoAprobado
      ? 'approuve'
      : 'en_attente';

  return actualizarBonAchat(
    bonId,
    {
      statut: nouveauStatut,
      autorisations,
      historique: [
        crearHistorique(
          decision === 'approuve' ? 'Autorisation approuvée' : 'Autorisation refusée',
          `${autorisateur.nom} a ${decision === 'approuve' ? 'approuvé' : 'refusé'} le bon ${bon.numero}.`,
          autorisateur.nom
        ),
        ...bon.historique
      ]
    },
    autorisateur.nom
  );
}

export function obtenerResumenAchats() {
  const bons = obtenerBonsAchat();
  return {
    totalBons: bons.length,
    totalMontant: bons.reduce((sum, bon) => sum + bon.montantTotal, 0),
    enAttente: bons.filter(bon => bon.statut === 'en_attente').length,
    approuves: bons.filter(bon => bon.statut === 'approuve').length,
    commandes: bons.filter(bon => bon.statut === 'commande').length,
    recus: bons.filter(bon => bon.statut === 'recu').length,
    annules: bons.filter(bon => bon.statut === 'annule').length,
    brouillons: bons.filter(bon => bon.statut === 'brouillon').length,
    refusés: bons.filter(bon => bon.statut === 'refuse').length
  };
}

function convertirLigneEnEntradaInventario(bon: BonAchat, acteur?: string) {
  return bon.lignes.map((ligne, index) => {
    const entrada = guardarEntrada({
      fecha: new Date().toISOString(),
      tipoEntrada: 'achat',
      programaNombre: 'Achats',
      programaCodigo: 'ACHAT',
      programaColor: '#1E73BE',
      programaIcono: 'ShoppingCart',
      donadorId: bon.fournisseurId,
      donadorNombre: bon.fournisseurNom,
      donadorEsCustom: false,
      productoId: `TEMP-ACH-${Date.now()}-${index}`,
      nombreProducto: ligne.description,
      productoIcono: 'ShoppingCart',
      categoria: 'Achats',
      subcategoria: bon.numero,
      cantidad: ligne.quantite,
      unidad: ligne.unite,
      pesoUnidad: 0,
      pesoTotal: 0,
      temperatura: 'ambiente',
      observaciones: `Réception automatique depuis le bon ${bon.numero}${bon.notes ? ` • ${bon.notes}` : ''}`,
      valorUnitario: ligne.prixUnitaire,
      valorTotal: ligne.total,
      creadoPor: acteur || bon.createdByName,
    });

    return entrada;
  });
}

export function registrarRecepcionBonAchat(bonId: string, acteur?: string): BonAchat | null {
  const bons = obtenerBonsAchat();
  const bon = bons.find(item => item.id === bonId);
  if (!bon) {
    return null;
  }

  if (bon.inventarioRegistrado) {
    return actualizarBonAchat(
      bonId,
      {
        statut: 'recu',
        historique: [
          crearHistorique('Réception confirmée', `Le bon ${bon.numero} était déjà intégré à l'inventaire.`, acteur),
          ...bon.historique
        ]
      },
      acteur
    );
  }

  const entradas = convertirLigneEnEntradaInventario(bon, acteur);
  const fechaRecepcion = new Date().toISOString();

  return actualizarBonAchat(
    bonId,
    {
      statut: 'recu',
      inventarioRegistrado: true,
      fechaRecepcionInventario: fechaRecepcion,
      entradasInventarioIds: entradas.map(entrada => entrada.id),
      historique: [
        crearHistorique(
          'Réception en inventaire',
          `${entradas.length} entrée(s) d'inventaire générée(s) automatiquement pour le bon ${bon.numero}.`,
          acteur
        ),
        ...bon.historique
      ]
    },
    acteur
  );
}