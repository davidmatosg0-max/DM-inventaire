import React, { useEffect, useMemo, useState } from 'react';
import { useBranding } from '../../../hooks/useBranding';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  BadgeCheck,
  Ban,
  Building2,
  Check,
  ClipboardCheck,
  CreditCard,
  Download,
  Eye,
  FileSignature,
  Plus,
  Receipt,
  ShoppingCart,
  ShieldCheck,
  Truck,
  X,
  Clock3
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { obtenerContactosDepartamento, type ContactoDepartamento } from '../../utils/contactosDepartamentoStorage';
import {
  actualizarBonAchat,
  crearBonAchat,
  eliminarReglaAutorizacionAchat,
  eliminarProgrammeAchat,
  guardarReglaAutorizacionAchat,
  guardarProgrammeAchat,
  obtenerBonsAchat,
  obtenerProgrammesAchat,
  obtenerReglasAutorizacionAchat,
  obtenerResumenAchats,
  registrarRecepcionBonAchat,
  registrerDecisionBonAchat,
  soumettreBonAchat,
  type BonAchat,
  type LigneBonAchat,
  type PrioriteBonAchat,
  type ProgrammeAchat,
  type RegleAutorisationAchat,
  type StatutBonAchat
} from '../../utils/achatsStorage';
import { obtenerUsuarioSesion } from '../../utils/sesionStorage';

interface LigneFormulaire extends Omit<LigneBonAchat, 'quantite'> {
  quantite: number | '';
}

interface ReglaFormulaire {
  id?: string;
  nom: string;
  roleAutorisateur: string;
  montantMinimum: string;
  montantMaximum: string;
  description: string;
  actif: boolean;
}

interface ProgrammeFormulaire {
  id?: string;
  nom: string;
  code: string;
  responsable: string;
  budgetAnnuel: string;
  description: string;
  actif: boolean;
}

function createEmptyLine(): LigneFormulaire {
  return {
    id: `ligne-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    description: '',
    quantite: '',
    unite: 'unité',
    prixUnitaire: 0,
    total: 0
  };
}

const statutConfig: Record<StatutBonAchat, { label: string; className: string }> = {
  brouillon: { label: 'Brouillon', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  en_attente: { label: 'En attente', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  approuve: { label: 'Approuvé', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  refuse: { label: 'Refusé', className: 'bg-rose-100 text-rose-800 border-rose-200' },
  commande: { label: 'Commandé', className: 'bg-sky-100 text-sky-800 border-sky-200' },
  recu: { label: 'Reçu', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  annule: { label: 'Annulé', className: 'bg-zinc-200 text-zinc-700 border-zinc-300' }
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 2
  }).format(value || 0);
}

function formatDate(value?: string): string {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('fr-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(value));
}

function getSupplierLabel(contact: ContactoDepartamento): string {
  return contact.nombreEmpresa || `${contact.nombre} ${contact.apellido}`.trim() || 'Fournisseur';
}

export function AchatPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { t } = useTranslation();
  const branding = useBranding();
  const usuario = obtenerUsuarioSesion();
  const [bons, setBons] = useState<BonAchat[]>([]);
  const [programmes, setProgrammes] = useState<ProgrammeAchat[]>([]);
  const [reglas, setReglas] = useState<RegleAutorisationAchat[]>([]);
  const [dialogBonOpen, setDialogBonOpen] = useState(false);
  const [dialogProgrammeOpen, setDialogProgrammeOpen] = useState(false);
  const [dialogReglaOpen, setDialogReglaOpen] = useState(false);
  const [previewBon, setPreviewBon] = useState<BonAchat | null>(null);
  const [programmeEnEdicion, setProgrammeEnEdicion] = useState<ProgrammeAchat | null>(null);
  const [reglaEnEdicion, setReglaEnEdicion] = useState<RegleAutorisationAchat | null>(null);
  const [bonsProgrammeFilter, setBonsProgrammeFilter] = useState('all');
  const [selectedProgrammeId, setSelectedProgrammeId] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [dateLivraisonSouhaitee, setDateLivraisonSouhaitee] = useState('');
  const [priorite, setPriorite] = useState<PrioriteBonAchat>('normal');
  const [conditionsPaiement, setConditionsPaiement] = useState('30 jours');
  const [notes, setNotes] = useState('');
  const [lignes, setLignes] = useState<LigneFormulaire[]>([createEmptyLine()]);
  const [reglaForm, setReglaForm] = useState<ReglaFormulaire>({
    nom: '',
    roleAutorisateur: '',
    montantMinimum: '0',
    montantMaximum: '',
    description: '',
    actif: true
  });
  const [programmeForm, setProgrammeForm] = useState<ProgrammeFormulaire>({
    nom: '',
    code: '',
    responsable: '',
    budgetAnnuel: '',
    description: '',
    actif: true
  });

  const fournisseurs = useMemo(() => {
    return obtenerContactosDepartamento()
      .filter(contact => contact.activo && (contact.isFournisseur === true || contact.tipo === 'fournisseur'))
      .sort((a, b) => getSupplierLabel(a).localeCompare(getSupplierLabel(b), 'fr'));
  }, []);

  const fournisseurSeleccionado = useMemo(
    () => fournisseurs.find(contact => contact.id === selectedSupplierId) || null,
    [fournisseurs, selectedSupplierId]
  );
  const programmeSeleccionado = useMemo(
    () => programmes.find(programme => programme.id === selectedProgrammeId) || null,
    [programmes, selectedProgrammeId]
  );
  const programmeFilterOptions = useMemo(() => {
    const options = new Map<string, string>();

    programmes.forEach(programme => {
      options.set(programme.id, programme.nom);
    });

    bons.forEach(bon => {
      if (bon.programmeAchatId && bon.programmeAchatNom && !options.has(bon.programmeAchatId)) {
        options.set(bon.programmeAchatId, bon.programmeAchatNom);
      }
    });

    return Array.from(options.entries())
      .map(([id, nom]) => ({ id, nom }))
      .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
  }, [bons, programmes]);
  const programmeBudgetMetrics = useMemo(() => {
    return programmes.reduce<Record<string, {
      bonsEngages: number;
      montantEngage: number;
      montantRecu: number;
      budgetRestant: number | null;
      usageRatio: number | null;
    }>>((accumulator, programme) => {
      const bonsProgramme = bons.filter(bon => bon.programmeAchatId === programme.id);
      const bonsEngages = bonsProgramme.filter(bon => !['brouillon', 'refuse', 'annule'].includes(bon.statut));
      const bonsRecus = bonsProgramme.filter(bon => bon.statut === 'recu');
      const montantEngage = bonsEngages.reduce((sum, bon) => sum + bon.montantTotal, 0);
      const montantRecu = bonsRecus.reduce((sum, bon) => sum + bon.montantTotal, 0);
      const budgetRestant = programme.budgetAnnuel == null ? null : programme.budgetAnnuel - montantEngage;
      const usageRatio = programme.budgetAnnuel && programme.budgetAnnuel > 0
        ? (montantEngage / programme.budgetAnnuel) * 100
        : null;

      accumulator[programme.id] = {
        bonsEngages: bonsEngages.length,
        montantEngage,
        montantRecu,
        budgetRestant,
        usageRatio
      };

      return accumulator;
    }, {});
  }, [bons, programmes]);

  const resumen = useMemo(() => obtenerResumenAchats(), [bons]);
  const bonsEnAttente = useMemo(() => bons.filter(bon => bon.statut === 'en_attente'), [bons]);
  const bonsRecents = useMemo(() => bons.slice(0, 5), [bons]);
  const filteredBons = useMemo(() => {
    if (bonsProgrammeFilter === 'all') {
      return bons;
    }

    if (bonsProgrammeFilter === 'none') {
      return bons.filter(bon => !bon.programmeAchatId);
    }

    return bons.filter(bon => bon.programmeAchatId === bonsProgrammeFilter);
  }, [bons, bonsProgrammeFilter]);
  const canCreateBon = Boolean(usuario);
  const canAuthorize = Boolean(usuario?.permisos?.some(permiso =>
    ['acceso_total', 'desarrollador', 'administrador_general'].includes(permiso)
  ));

  const loadModuleData = () => {
    setBons(obtenerBonsAchat());
    setProgrammes(obtenerProgrammesAchat());
    setReglas(obtenerReglasAutorizacionAchat());
  };

  useEffect(() => {
    loadModuleData();
  }, []);

  useEffect(() => {
    if (bonsProgrammeFilter === 'all' || bonsProgrammeFilter === 'none') {
      return;
    }

    const optionStillExists = programmeFilterOptions.some(programme => programme.id === bonsProgrammeFilter);
    if (!optionStillExists) {
      setBonsProgrammeFilter('all');
    }
  }, [bonsProgrammeFilter, programmeFilterOptions]);

  const montantTotalFormulaire = useMemo(
    () => lignes.reduce((sum, ligne) => sum + ligne.total, 0),
    [lignes]
  );

  const resetBonForm = () => {
    setSelectedProgrammeId('');
    setSelectedSupplierId('');
    setDateLivraisonSouhaitee('');
    setPriorite('normal');
    setConditionsPaiement('30 jours');
    setNotes('');
    setLignes([createEmptyLine()]);
  };

  const resetReglaForm = () => {
    setReglaEnEdicion(null);
    setReglaForm({
      nom: '',
      roleAutorisateur: '',
      montantMinimum: '0',
      montantMaximum: '',
      description: '',
      actif: true
    });
  };

  const resetProgrammeForm = () => {
    setProgrammeEnEdicion(null);
    setProgrammeForm({
      nom: '',
      code: '',
      responsable: '',
      budgetAnnuel: '',
      description: '',
      actif: true
    });
  };

  const handleChangeLine = (lineId: string, field: keyof LigneFormulaire, value: string | number) => {
    setLignes(current => current.map(line => {
      if (line.id !== lineId) {
        return line;
      }

      const updatedLine = {
        ...line,
        [field]: value
      } as LigneFormulaire;

      const quantite = updatedLine.quantite === '' ? '' : Number(updatedLine.quantite) || 0;
      const prixUnitaire = Number(updatedLine.prixUnitaire) || 0;

      return {
        ...updatedLine,
        quantite,
        prixUnitaire,
        total: (typeof quantite === 'number' ? quantite : 0) * prixUnitaire
      };
    }));
  };

  const handleCreateBon = (statutInitial: 'brouillon' | 'en_attente') => {
    if (!fournisseurSeleccionado) {
      toast.error('Sélectionnez un fournisseur pour créer le bon d\'achat.');
      return;
    }

    const lignesValides = lignes
      .filter(line => line.description.trim() && (Number(line.quantite) || 0) > 0 && line.prixUnitaire > 0)
      .map(line => ({
        ...line,
        quantite: Number(line.quantite) || 0,
        total: (Number(line.quantite) || 0) * line.prixUnitaire
      }));

    if (lignesValides.length === 0) {
      toast.error('Ajoutez au moins une ligne valide au bon d\'achat.');
      return;
    }

    const auteur = usuario ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : 'Système';
    crearBonAchat({
      programmeAchatId: programmeSeleccionado?.id,
      programmeAchatNom: programmeSeleccionado?.nom,
      fournisseurId: fournisseurSeleccionado.id,
      fournisseurNom: getSupplierLabel(fournisseurSeleccionado),
      fournisseurEmail: fournisseurSeleccionado.emailPrincipal || fournisseurSeleccionado.email,
      fournisseurTelephone: fournisseurSeleccionado.telefonoPrincipal || fournisseurSeleccionado.telefono,
      fournisseurAdresse: fournisseurSeleccionado.direccion,
      dateLivraisonSouhaitee,
      createdById: usuario?.id,
      createdByName: auteur,
      priorite,
      statutInitial,
      conditionsPaiement,
      notes,
      lignes: lignesValides
    });

    toast.success(
      statutInitial === 'en_attente'
        ? 'Bon d\'achat soumis pour autorisation.'
        : 'Bon d\'achat enregistré en brouillon.'
    );
    setDialogBonOpen(false);
    resetBonForm();
    loadModuleData();
  };

  const handleSubmitBon = (bonId: string) => {
    soumettreBonAchat(bonId, usuario ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : 'Système');
    toast.success('Le bon d\'achat a été envoyé au circuit d\'approbation.');
    loadModuleData();
  };

  const handleApprove = (bonId: string, approved: boolean) => {
    if (!usuario) {
      return;
    }

    registrerDecisionBonAchat(
      bonId,
      approved ? 'approuve' : 'refuse',
      {
        id: usuario.id,
        nom: `${usuario.nombre} ${usuario.apellido || ''}`.trim(),
        role: usuario.rol,
        commentaire: approved ? 'Validation effectuée depuis le module Achat.' : 'Demande refusée depuis le module Achat.'
      }
    );

    toast.success(approved ? 'Autorisation approuvée.' : 'Autorisation refusée.');
    loadModuleData();
  };

  const handleUpdateBonStatus = (bonId: string, statut: StatutBonAchat) => {
    const actorName = usuario ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : 'Système';

    if (statut === 'recu') {
      const bonRecu = registrarRecepcionBonAchat(bonId, actorName);
      if (bonRecu?.inventarioRegistrado) {
        toast.success(`Bon reçu et intégré automatiquement à l'inventaire (${bonRecu.entradasInventarioIds?.length || 0} entrée(s)).`);
      }
      loadModuleData();
      return;
    }

    actualizarBonAchat(bonId, { statut }, actorName);
    toast.success(`Statut du bon mis à jour vers ${statutConfig[statut].label}.`);
    loadModuleData();
  };

  const handleCancelBon = (bonId: string) => {
    const actorName = usuario ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : 'Système';
    const bonAnnule = actualizarBonAchat(bonId, { statut: 'annule' }, actorName);

    if (!bonAnnule) {
      toast.error('Impossible d\'annuler ce bon d\'achat.');
      return;
    }

    setPreviewBon(current => current?.id === bonId ? bonAnnule : current);
    toast.success('Bon d\'achat annulé.');
    loadModuleData();
  };

  const handleExportBonPdf = (bon: BonAchat) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const primary = branding.primaryColor || '#1E73BE';
    const secondary = branding.secondaryColor || '#4CAF50';
    const fournisseurDetails = [
      bon.fournisseurNom,
      bon.fournisseurEmail,
      bon.fournisseurTelephone || '',
      bon.fournisseurAdresse || ''
    ].filter(Boolean);

    doc.setFillColor(primary);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text('Bon d\'achat', 14, 16);
    doc.setFontSize(11);
    doc.text(`${branding.systemName || 'Banque Alimentaire'}`, 14, 23);

    doc.setTextColor('#111827');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Bon d'achat: ${bon.numero}`, 14, 40);

    doc.setFont('helvetica', 'normal');
    doc.text(`Date de création: ${formatDate(bon.dateCreation)}`, 110, 40);
    doc.text(`Livraison souhaitée: ${formatDate(bon.dateLivraisonSouhaitee)}`, 110, 47);
    doc.text(`Créé par: ${bon.createdByName}`, 110, 54);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primary);
    doc.text('Fournisseur', 14, 66);
    doc.text('Conditions', 110, 66);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#111827');
    fournisseurDetails.forEach((line, index) => {
      doc.text(line, 14, 73 + index * 6);
    });
    doc.text(`Priorité: ${bon.priorite}`, 110, 73);
    doc.text(`Statut: ${statutConfig[bon.statut].label}`, 110, 79);
    doc.text(`Paiement: ${bon.conditionsPaiement || 'À confirmer'}`, 110, 85);

    autoTable(doc, {
      startY: 98,
      head: [['Description', 'Qté', 'Unité', 'Prix unitaire', 'Total']],
      body: bon.lignes.map(ligne => [
        ligne.description,
        `${ligne.quantite}`,
        ligne.unite,
        formatCurrency(ligne.prixUnitaire),
        formatCurrency(ligne.total)
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: primary,
        textColor: '#FFFFFF'
      },
      styles: {
        fontSize: 9,
        cellPadding: 2.5
      },
      columnStyles: {
        0: { cellWidth: 82 },
        1: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' }
      }
    });

    const finalY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY || 120;
    doc.setFillColor(secondary);
    doc.roundedRect(132, finalY + 6, 64, 16, 3, 3, 'F');
    doc.setTextColor('#FFFFFF');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Total: ${formatCurrency(bon.montantTotal)}`, 138, finalY + 16);

    doc.setTextColor('#111827');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Autorisations', 14, finalY + 16);
    doc.setFont('helvetica', 'normal');
    bon.autorisations.forEach((autorisation, index) => {
      const decisionLabel = autorisation.decision === 'approuve'
        ? 'Approuvée'
        : autorisation.decision === 'refuse'
          ? 'Refusée'
          : 'En attente';
      const acteur = autorisation.autorisateurNom ? ` par ${autorisation.autorisateurNom}` : '';
      doc.text(
        `${autorisation.nom} • ${decisionLabel}${acteur}`,
        14,
        finalY + 24 + index * 6
      );
    });

    const signatureBaseY = Math.max(finalY + 52 + bon.autorisations.length * 6, 220);
    doc.setDrawColor(primary);
    doc.setLineWidth(0.4);
    doc.line(18, signatureBaseY, 74, signatureBaseY);
    doc.line(82, signatureBaseY, 138, signatureBaseY);
    doc.line(146, signatureBaseY, 202, signatureBaseY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor('#111827');
    doc.text('Demandeur', 18, signatureBaseY + 6);
    doc.text('Validation financière', 82, signatureBaseY + 6);
    doc.text('Approbation finale', 146, signatureBaseY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(bon.createdByName, 18, signatureBaseY + 12);
    const approbations = bon.autorisations.filter(item => item.decision === 'approuve');
    doc.text(approbations[0]?.autorisateurNom || 'Signature requise', 82, signatureBaseY + 12);
    doc.text(approbations[approbations.length - 1]?.autorisateurNom || 'Signature requise', 146, signatureBaseY + 12);

    if (bon.fechaRecepcionInventario) {
      doc.setFont('helvetica', 'italic');
      doc.text(`Réception en inventaire confirmée le ${formatDate(bon.fechaRecepcionInventario)}.`, 14, signatureBaseY + 24);
      doc.setFont('helvetica', 'normal');
    }

    if (bon.notes) {
      const notesStartY = finalY + 28 + bon.autorisations.length * 6;
      doc.setFont('helvetica', 'bold');
      doc.text('Notes', 14, notesStartY);
      doc.setFont('helvetica', 'normal');
      const splitNotes = doc.splitTextToSize(bon.notes, 180);
      doc.text(splitNotes, 14, notesStartY + 6);
    }

    doc.save(`${bon.numero}.pdf`);
    toast.success(`PDF généré pour ${bon.numero}.`);
  };

  const openEditRule = (regla: RegleAutorisationAchat) => {
    setReglaEnEdicion(regla);
    setReglaForm({
      id: regla.id,
      nom: regla.nom,
      roleAutorisateur: regla.roleAutorisateur,
      montantMinimum: `${regla.montantMinimum}`,
      montantMaximum: regla.montantMaximum == null ? '' : `${regla.montantMaximum}`,
      description: regla.description,
      actif: regla.actif
    });
    setDialogReglaOpen(true);
  };

  const handleSaveRule = () => {
    if (!reglaForm.nom.trim() || !reglaForm.roleAutorisateur.trim()) {
      toast.error('Le nom de la règle et le rôle autorisateur sont obligatoires.');
      return;
    }

    guardarReglaAutorizacionAchat({
      id: reglaForm.id,
      nom: reglaForm.nom.trim(),
      roleAutorisateur: reglaForm.roleAutorisateur.trim(),
      montantMinimum: Number(reglaForm.montantMinimum) || 0,
      montantMaximum: reglaForm.montantMaximum.trim() ? Number(reglaForm.montantMaximum) : null,
      description: reglaForm.description.trim(),
      actif: reglaForm.actif,
      ordre: reglaEnEdicion?.ordre || reglas.length + 1
    });

    toast.success(reglaEnEdicion ? 'Règle d\'autorisation mise à jour.' : 'Règle d\'autorisation créée.');
    setDialogReglaOpen(false);
    resetReglaForm();
    loadModuleData();
  };

  const bonPeutEtreAnnule = (bon: BonAchat) => ['brouillon', 'en_attente', 'approuve', 'commande'].includes(bon.statut);

  const openEditProgramme = (programme: ProgrammeAchat) => {
    setProgrammeEnEdicion(programme);
    setProgrammeForm({
      id: programme.id,
      nom: programme.nom,
      code: programme.code,
      responsable: programme.responsable || '',
      budgetAnnuel: programme.budgetAnnuel == null ? '' : `${programme.budgetAnnuel}`,
      description: programme.description || '',
      actif: programme.actif
    });
    setDialogProgrammeOpen(true);
  };

  const handleSaveProgramme = () => {
    if (!programmeForm.nom.trim() || !programmeForm.code.trim()) {
      toast.error('Le nom et le code du programme sont obligatoires.');
      return;
    }

    guardarProgrammeAchat({
      id: programmeForm.id,
      nom: programmeForm.nom.trim(),
      code: programmeForm.code.trim().toUpperCase(),
      responsable: programmeForm.responsable.trim(),
      budgetAnnuel: programmeForm.budgetAnnuel.trim() ? Number(programmeForm.budgetAnnuel) : null,
      description: programmeForm.description.trim(),
      actif: programmeForm.actif,
    });

    toast.success(programmeEnEdicion ? 'Programme d\'achat mis à jour.' : 'Programme d\'achat créé.');
    setDialogProgrammeOpen(false);
    resetProgrammeForm();
    loadModuleData();
  };

  return (
    <div className="space-y-6">
      <div
        className="rounded-3xl border p-6 shadow-sm"
        style={{
          borderColor: `${branding.primaryColor}22`,
          background: `linear-gradient(135deg, ${branding.primaryColor}12 0%, white 52%, ${branding.secondaryColor}10 100%)`
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
              <ShoppingCart className="h-4 w-4" />
              Achats et approvisionnements
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Module Achat professionnel
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600">
                Gérez les bons d'achat, pilotez les autorisations internes et exploitez directement la base fournisseurs pour générer des demandes d'achat conformes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:min-w-[320px]">
            <Card className="border-slate-200 bg-white/90">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Fournisseurs actifs</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{fournisseurs.length}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-white/90">
              <CardContent className="p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Autorisations en attente</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{resumen.enAttente}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 rounded-2xl border border-slate-200 bg-white p-2">
          <TabsTrigger value="overview" className="gap-2 rounded-xl px-4 py-2">
            <Receipt className="h-4 w-4" />
            Tableau de bord
          </TabsTrigger>
          <TabsTrigger value="bons" className="gap-2 rounded-xl px-4 py-2">
            <FileSignature className="h-4 w-4" />
            Bons d'achat
          </TabsTrigger>
          <TabsTrigger value="fournisseurs" className="gap-2 rounded-xl px-4 py-2">
            <Building2 className="h-4 w-4" />
            Base fournisseurs
          </TabsTrigger>
          <TabsTrigger value="programmes" className="gap-2 rounded-xl px-4 py-2">
            <ClipboardCheck className="h-4 w-4" />
            Programmes d'achat
          </TabsTrigger>
          <TabsTrigger value="autorisations" className="gap-2 rounded-xl px-4 py-2">
            <ShieldCheck className="h-4 w-4" />
            Autorisations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Volume engagé</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{formatCurrency(resumen.totalMontant)}</p>
                <p className="mt-2 text-sm text-slate-500">Total de tous les bons d'achat enregistrés</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">En validation</p>
                <p className="mt-2 text-3xl font-bold text-amber-700">{resumen.enAttente}</p>
                <p className="mt-2 text-sm text-slate-500">Bons actuellement dans le circuit d'autorisation</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Prêts à commander</p>
                <p className="mt-2 text-3xl font-bold text-emerald-700">{resumen.approuves}</p>
                <p className="mt-2 text-sm text-slate-500">Bons approuvés et prêts pour émission au fournisseur</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Réceptions finalisées</p>
                <p className="mt-2 text-3xl font-bold text-sky-700">{resumen.recus}</p>
                <p className="mt-2 text-sm text-slate-500">Bons réceptionnés et clôturés</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Derniers bons d'achat</CardTitle>
                  <p className="text-sm text-slate-500">Suivi opérationnel des demandes les plus récentes</p>
                </div>
                {canCreateBon && (
                  <Button onClick={() => setDialogBonOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nouveau bon
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {bonsRecents.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                    Aucun bon d'achat enregistré pour le moment.
                  </div>
                )}
                {bonsRecents.map(bon => (
                  <div key={bon.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-900">{bon.numero}</p>
                          <Badge variant="outline" className={statutConfig[bon.statut].className}>
                            {statutConfig[bon.statut].label}
                          </Badge>
                        </div>
                        {bon.programmeAchatNom && (
                          <p className="mt-1 text-xs font-medium text-slate-500">Programme: {bon.programmeAchatNom}</p>
                        )}
                        <p className="mt-1 text-sm text-slate-600">{bon.fournisseurNom}</p>
                        <p className="text-xs text-slate-500">Créé le {formatDate(bon.dateCreation)} par {bon.createdByName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{formatCurrency(bon.montantTotal)}</p>
                        <p className="text-xs text-slate-500">Livraison souhaitée: {formatDate(bon.dateLivraisonSouhaitee)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>File d'autorisation</CardTitle>
                <p className="text-sm text-slate-500">Bons qui exigent une validation interne</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {bonsEnAttente.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                    Aucun bon en attente d'autorisation.
                  </div>
                )}
                {bonsEnAttente.slice(0, 5).map(bon => (
                  <div key={bon.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{bon.numero}</p>
                        <p className="text-sm text-slate-600">{bon.fournisseurNom}</p>
                        <p className="text-xs text-slate-500">{bon.autorisations.filter(item => item.decision === 'en_attente').length} validation(s) restante(s)</p>
                      </div>
                      <p className="text-sm font-semibold text-amber-700">{formatCurrency(bon.montantTotal)}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bons" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Gestion des bons d'achat</CardTitle>
                <p className="text-sm text-slate-500">Création, validation, émission et réception des commandes fournisseurs</p>
              </div>
              {canCreateBon && (
                <Button onClick={() => setDialogBonOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Créer un bon d'achat
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Filtrer par programme</p>
                  <p className="text-sm text-slate-500">Isolez les bons rattachés à un programme d'achat précis.</p>
                </div>
                <div className="w-full md:max-w-sm">
                  <Label className="mb-2 block">Programme d'achat</Label>
                  <Select value={bonsProgrammeFilter} onValueChange={setBonsProgrammeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les programmes</SelectItem>
                      <SelectItem value="none">Sans programme</SelectItem>
                      {programmeFilterOptions.map(programme => (
                        <SelectItem key={programme.id} value={programme.id}>
                          {programme.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bon</TableHead>
                    <TableHead>Fournisseur</TableHead>
                    <TableHead>Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Autorisations</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBons.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                        {bons.length === 0 ? 'Aucun bon d\'achat disponible.' : 'Aucun bon d\'achat ne correspond au programme sélectionné.'}
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredBons.map(bon => (
                    <TableRow key={bon.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-slate-900">{bon.numero}</p>
                          {bon.programmeAchatNom && <p className="text-xs text-slate-500">{bon.programmeAchatNom}</p>}
                          <p className="text-xs text-slate-500">Créé le {formatDate(bon.dateCreation)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{bon.fournisseurNom}</p>
                          <p className="text-xs text-slate-500">{bon.fournisseurEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(bon.montantTotal)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statutConfig[bon.statut].className}>
                          {statutConfig[bon.statut].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {bon.autorisations.map(item => (
                            <div key={item.id} className="flex items-center gap-2 text-xs text-slate-600">
                              {item.decision === 'approuve' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : item.decision === 'refuse' ? <X className="h-3.5 w-3.5 text-rose-600" /> : <Clock3 className="h-3.5 w-3.5 text-amber-600" />}
                              <span>{item.nom}</span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => setPreviewBon(bon)}>
                            <Eye className="mr-1 h-4 w-4" />
                            Prévisualiser
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleExportBonPdf(bon)}>
                            <Download className="mr-1 h-4 w-4" />
                            PDF
                          </Button>
                          {bon.statut === 'brouillon' && (
                            <Button size="sm" variant="outline" onClick={() => handleSubmitBon(bon.id)}>
                              Soumettre
                            </Button>
                          )}
                          {canAuthorize && bon.statut === 'en_attente' && (
                            <>
                              <Button size="sm" onClick={() => handleApprove(bon.id, true)}>
                                Approuver
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleApprove(bon.id, false)}>
                                Refuser
                              </Button>
                            </>
                          )}
                          {bon.statut === 'approuve' && (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateBonStatus(bon.id, 'commande')}>
                              Marquer commandé
                            </Button>
                          )}
                          {bon.statut === 'commande' && (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateBonStatus(bon.id, 'recu')}>
                              Marquer reçu
                            </Button>
                          )}
                          {bonPeutEtreAnnule(bon) && (
                            <Button size="sm" variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800" onClick={() => handleCancelBon(bon.id)}>
                              <Ban className="mr-1 h-4 w-4" />
                              Annuler
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fournisseurs" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Base de données fournisseurs</CardTitle>
                <p className="text-sm text-slate-500">Source centralisée utilisée pour la création des bons d'achat</p>
              </div>
              {onNavigate && (
                <Button variant="outline" className="gap-2" onClick={() => onNavigate('donateurs-fournisseurs')}>
                  <Truck className="h-4 w-4" />
                  Ouvrir la base fournisseurs
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {fournisseurs.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
                    <p>Aucun fournisseur actif n'est disponible dans la base de données actuelle.</p>
                    {onNavigate && (
                      <Button variant="outline" className="mt-4 gap-2" onClick={() => onNavigate('donateurs-fournisseurs')}>
                        <Building2 className="h-4 w-4" />
                        Accéder à la base fournisseurs
                      </Button>
                    )}
                  </div>
                )}
                {fournisseurs.map(fournisseur => (
                  <Card key={fournisseur.id} className="border-slate-200">
                    <CardContent className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{getSupplierLabel(fournisseur)}</p>
                          <p className="text-xs text-slate-500">{fournisseur.tipoEmpresa || 'Fournisseur référencé'}</p>
                        </div>
                        <Badge variant="outline" className="bg-slate-50">Base active</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>{fournisseur.emailPrincipal || fournisseur.email || 'Sans email principal'}</p>
                        <p>{fournisseur.telefonoPrincipal || fournisseur.telefono || 'Sans téléphone principal'}</p>
                        <p>{fournisseur.direccion || 'Adresse non renseignée'}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(fournisseur.categoriaProductos || []).slice(0, 3).map(categorie => (
                          <Badge key={categorie} variant="secondary">{categorie}</Badge>
                        ))}
                        {(fournisseur.categoriaProductos || []).length === 0 && (
                          <Badge variant="secondary">Catalogue à compléter</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programmes" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Programmes d'achat</CardTitle>
                <p className="text-sm text-slate-500">Cadrez vos achats par programme, responsable et budget de référence</p>
              </div>
              <Button
                className="gap-2"
                onClick={() => {
                  resetProgrammeForm();
                  setDialogProgrammeOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Nouveau programme
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Programme</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Budget annuel</TableHead>
                    <TableHead>Consommation</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programmes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                        Aucun programme d'achat configuré.
                      </TableCell>
                    </TableRow>
                  )}
                  {programmes.map(programme => {
                    const budgetMetrics = programmeBudgetMetrics[programme.id] || {
                      bonsEngages: 0,
                      montantEngage: 0,
                      montantRecu: 0,
                      budgetRestant: programme.budgetAnnuel ?? null,
                      usageRatio: null
                    };
                    const progressWidth = Math.max(0, Math.min(budgetMetrics.usageRatio ?? 0, 100));
                    const budgetDepasse = budgetMetrics.budgetRestant != null && budgetMetrics.budgetRestant < 0;

                    return (
                      <TableRow key={programme.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-slate-900">{programme.nom}</p>
                            <p className="text-xs text-slate-500">{programme.code}{programme.description ? ` • ${programme.description}` : ''}</p>
                          </div>
                        </TableCell>
                        <TableCell>{programme.responsable || 'Non assigné'}</TableCell>
                        <TableCell>{programme.budgetAnnuel == null ? 'À définir' : formatCurrency(programme.budgetAnnuel)}</TableCell>
                        <TableCell>
                          <div className="min-w-[240px] space-y-2">
                            <div className="flex items-center justify-between gap-3 text-sm">
                              <span className="font-semibold text-slate-900">{formatCurrency(budgetMetrics.montantEngage)}</span>
                              {budgetMetrics.budgetRestant == null ? (
                                <span className="text-slate-500">Sans plafond défini</span>
                              ) : (
                                <span className={budgetDepasse ? 'text-rose-600' : 'text-slate-500'}>
                                  {budgetDepasse ? `${formatCurrency(Math.abs(budgetMetrics.budgetRestant))} de dépassement` : `${formatCurrency(budgetMetrics.budgetRestant)} restant`}
                                </span>
                              )}
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full ${budgetDepasse ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                style={{ width: `${progressWidth}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-500">
                              {budgetMetrics.bonsEngages} bon(s) engagé(s)
                              {budgetMetrics.montantRecu > 0 ? ` • ${formatCurrency(budgetMetrics.montantRecu)} déjà reçus` : ''}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={programme.actif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                            {programme.actif ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditProgramme(programme)}>
                              Modifier
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                eliminarProgrammeAchat(programme.id);
                                toast.success('Programme d\'achat supprimé.');
                                loadModuleData();
                              }}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="autorisations" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="flex items-start gap-3 p-5">
                <ShieldCheck className="mt-1 h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Circuit configurable</p>
                  <p className="text-sm text-slate-500">Définissez des niveaux d'approbation par seuil financier.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-start gap-3 p-5">
                <ClipboardCheck className="mt-1 h-5 w-5 text-sky-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Validation documentée</p>
                  <p className="text-sm text-slate-500">Chaque décision est historisée dans le bon d'achat.</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-start gap-3 p-5">
                <AlertCircle className="mt-1 h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Conformité interne</p>
                  <p className="text-sm text-slate-500">Les achats importants exigent une double validation.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Règles d'autorisation</CardTitle>
                <p className="text-sm text-slate-500">Seuils financiers et rôles responsables des approbations</p>
              </div>
              <Button
                className="gap-2"
                onClick={() => {
                  resetReglaForm();
                  setDialogReglaOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                Nouvelle règle
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Règle</TableHead>
                    <TableHead>Autorisateur</TableHead>
                    <TableHead>Seuil</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reglas.map(regla => (
                    <TableRow key={regla.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-slate-900">{regla.nom}</p>
                          <p className="text-xs text-slate-500">{regla.description || 'Sans description'}</p>
                        </div>
                      </TableCell>
                      <TableCell>{regla.roleAutorisateur}</TableCell>
                      <TableCell>
                        {formatCurrency(regla.montantMinimum)}
                        {' '}à{' '}
                        {regla.montantMaximum == null ? 'et plus' : formatCurrency(regla.montantMaximum)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={regla.actif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                          {regla.actif ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditRule(regla)}>
                            Modifier
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              eliminarReglaAutorizacionAchat(regla.id);
                              toast.success('Règle d\'autorisation supprimée.');
                              loadModuleData();
                            }}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(previewBon)} onOpenChange={open => { if (!open) setPreviewBon(null); }}>
        <DialogContent className="max-h-[92vh] w-[96vw] overflow-y-auto sm:max-w-[1180px]">
          {previewBon && (
            <>
              <DialogHeader>
                <DialogTitle>Prévisualisation du bon d'achat</DialogTitle>
                <DialogDescription>
                  Vérifiez les détails complets du bon avant impression, envoi ou annulation.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_340px]">
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Bon d'achat</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{previewBon.numero}</p>
                        <p className="mt-1 text-sm text-slate-600">Créé le {formatDate(previewBon.dateCreation)} par {previewBon.createdByName}</p>
                      </div>
                      <Badge variant="outline" className={statutConfig[previewBon.statut].className}>
                        {statutConfig[previewBon.statut].label}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-base">Fournisseur</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">{previewBon.fournisseurNom}</p>
                        <p>{previewBon.fournisseurEmail || 'Sans email'}</p>
                        <p>{previewBon.fournisseurTelephone || 'Sans téléphone'}</p>
                        <p>{previewBon.fournisseurAdresse || 'Adresse non renseignée'}</p>
                      </CardContent>
                    </Card>

                    <Card className="border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-base">Contexte d'achat</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-slate-600">
                        <p><span className="font-semibold text-slate-900">Priorité:</span> {previewBon.priorite}</p>
                        <p><span className="font-semibold text-slate-900">Livraison:</span> {formatDate(previewBon.dateLivraisonSouhaitee)}</p>
                        <p><span className="font-semibold text-slate-900">Paiement:</span> {previewBon.conditionsPaiement || 'À confirmer'}</p>
                        <p><span className="font-semibold text-slate-900">Programme:</span> {previewBon.programmeAchatNom || 'Non assigné'}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-base">Lignes du bon d'achat</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Qté</TableHead>
                            <TableHead>Unité</TableHead>
                            <TableHead>Prix unitaire</TableHead>
                            <TableHead>Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewBon.lignes.map(ligne => (
                            <TableRow key={ligne.id}>
                              <TableCell className="font-medium text-slate-900">{ligne.description}</TableCell>
                              <TableCell>{ligne.quantite}</TableCell>
                              <TableCell>{ligne.unite}</TableCell>
                              <TableCell>{formatCurrency(ligne.prixUnitaire)}</TableCell>
                              <TableCell className="font-semibold">{formatCurrency(ligne.total)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {previewBon.notes && (
                    <Card className="border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-base">Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-slate-600">{previewBon.notes}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="space-y-4">
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-base">Synthèse</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-600">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Montant total</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(previewBon.montantTotal)}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Autorisations</p>
                        <div className="mt-2 space-y-2">
                          {previewBon.autorisations.map(item => (
                            <div key={item.id} className="rounded-xl border border-slate-200 px-3 py-2">
                              <p className="text-sm font-medium text-slate-900">{item.nom}</p>
                              <p className="text-xs text-slate-500">{item.autorisateurNom || item.roleAutorisateur}</p>
                              <p className="mt-1 text-xs text-slate-600">{item.decision === 'approuve' ? 'Approuvée' : item.decision === 'refuse' ? 'Refusée' : 'En attente'}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 pt-2">
                        <Button variant="outline" className="gap-2" onClick={() => handleExportBonPdf(previewBon)}>
                          <Download className="h-4 w-4" />
                          Exporter PDF
                        </Button>
                        {bonPeutEtreAnnule(previewBon) && (
                          <Button variant="outline" className="gap-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800" onClick={() => handleCancelBon(previewBon.id)}>
                            <Ban className="h-4 w-4" />
                            Annuler le bon
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dialogBonOpen} onOpenChange={setDialogBonOpen}>
        <DialogContent className="max-h-[92vh] w-[96vw] overflow-y-auto sm:max-w-[1380px]">
          <DialogHeader>
            <DialogTitle>Créer un bon d'achat</DialogTitle>
            <DialogDescription>
              Sélectionnez un fournisseur depuis la base active, composez les lignes d'achat et choisissez le mode d'enregistrement.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Programme d'achat</Label>
                  <Select value={selectedProgrammeId} onValueChange={setSelectedProgrammeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un programme" />
                    </SelectTrigger>
                    <SelectContent>
                      {programmes.filter(programme => programme.actif).map(programme => (
                        <SelectItem key={programme.id} value={programme.id}>
                          {programme.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fournisseur</Label>
                  <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un fournisseur" />
                    </SelectTrigger>
                    <SelectContent>
                      {fournisseurs.map(fournisseur => (
                        <SelectItem key={fournisseur.id} value={fournisseur.id}>
                          {getSupplierLabel(fournisseur)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Livraison souhaitée</Label>
                  <Input type="date" value={dateLivraisonSouhaitee} onChange={event => setDateLivraisonSouhaitee(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Priorité</Label>
                  <Select value={priorite} onValueChange={value => setPriorite(value as PrioriteBonAchat)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normale</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                      <SelectItem value="critique">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Conditions de paiement</Label>
                  <Input value={conditionsPaiement} onChange={event => setConditionsPaiement(event.target.value)} placeholder="Ex: 30 jours fin de mois" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Lignes du bon d'achat</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setLignes(current => [...current, createEmptyLine()])}>
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une ligne
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  La quantité peut être saisie manuellement sur chaque ligne, y compris en format décimal si nécessaire.
                </p>
                {lignes.map((ligne, index) => (
                  <div key={ligne.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">Ligne {index + 1}</p>
                      {lignes.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => setLignes(current => current.filter(item => item.id !== ligne.id))}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-[minmax(0,2.1fr)_minmax(132px,0.9fr)_minmax(132px,0.9fr)_minmax(148px,1fr)_minmax(156px,1fr)]">
                      <Input className="h-11" placeholder="Description de l'achat" value={ligne.description} onChange={event => handleChangeLine(ligne.id, 'description', event.target.value)} />
                      <Input className="h-11 text-base" type="number" min="0" step="0.01" placeholder="Qté manuelle" value={ligne.quantite} onChange={event => handleChangeLine(ligne.id, 'quantite', event.target.value === '' ? '' : Number(event.target.value))} />
                      <Input className="h-11" placeholder="Unité" value={ligne.unite} onChange={event => handleChangeLine(ligne.id, 'unite', event.target.value)} />
                      <Input className="h-11 text-base" type="number" min="0" step="0.01" placeholder="Prix" value={ligne.prixUnitaire} onChange={event => handleChangeLine(ligne.id, 'prixUnitaire', Number(event.target.value))} />
                      <div className="flex min-h-11 items-center rounded-xl border border-slate-200 px-4 text-base font-semibold text-slate-700">
                        {formatCurrency(ligne.total)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Notes et contexte</Label>
                <Textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder="Motif de l'achat, budget lié, contraintes logistiques, commentaires complémentaires..." rows={4} />
              </div>
            </div>

            <Card className="h-fit border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Résumé fournisseur</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                {fournisseurSeleccionado ? (
                  <>
                    {programmeSeleccionado && (
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Programme d'achat</p>
                        <p className="mt-2 font-semibold text-slate-900">{programmeSeleccionado.nom}</p>
                        <p className="text-sm text-slate-600">{programmeSeleccionado.code}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">{getSupplierLabel(fournisseurSeleccionado)}</p>
                      <p>{fournisseurSeleccionado.emailPrincipal || fournisseurSeleccionado.email || 'Sans email'}</p>
                      <p>{fournisseurSeleccionado.telefonoPrincipal || fournisseurSeleccionado.telefono || 'Sans téléphone'}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Adresse</p>
                      <p className="mt-2">{fournisseurSeleccionado.direccion || 'Adresse non renseignée'}</p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
                    Choisissez un fournisseur pour afficher ses coordonnées opérationnelles.
                  </div>
                )}

                {fournisseurs.length === 0 && onNavigate && (
                  <Button variant="outline" className="w-full gap-2" onClick={() => onNavigate('donateurs-fournisseurs')}>
                    <Building2 className="h-4 w-4" />
                    Alimenter la base fournisseurs
                  </Button>
                )}

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Montant total</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrency(montantTotalFormulaire)}</p>
                  <p className="mt-2 text-xs text-slate-500">Le numéro du bon d'achat sera généré automatiquement à l'enregistrement.</p>
                </div>

                <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">Autorisations prévues</p>
                  {obtenerReglasAutorizacionAchat().filter(regla => regla.actif).map(regla => (
                    <div key={regla.id} className="flex items-center justify-between gap-3 text-xs text-slate-500">
                      <span>{regla.nom}</span>
                      <span>{formatCurrency(regla.montantMinimum)}{regla.montantMaximum == null ? '+' : ` - ${formatCurrency(regla.montantMaximum)}`}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={() => handleCreateBon('en_attente')} className="w-full gap-2">
                    <BadgeCheck className="h-4 w-4" />
                    Soumettre à l'autorisation
                  </Button>
                  <Button variant="outline" onClick={() => handleCreateBon('brouillon')} className="w-full gap-2">
                    <CreditCard className="h-4 w-4" />
                    Enregistrer en brouillon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogProgrammeOpen} onOpenChange={setDialogProgrammeOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{programmeEnEdicion ? 'Modifier un programme' : 'Nouveau programme d\'achat'}</DialogTitle>
            <DialogDescription>
              Définissez le cadre du programme, son responsable et son budget annuel de référence.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nom du programme</Label>
                <Input value={programmeForm.nom} onChange={event => setProgrammeForm(current => ({ ...current, nom: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Code</Label>
                <Input value={programmeForm.code} onChange={event => setProgrammeForm(current => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="Ex: PRA-OPS" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Responsable</Label>
                <Input value={programmeForm.responsable} onChange={event => setProgrammeForm(current => ({ ...current, responsable: event.target.value }))} placeholder="Ex: Coordination des achats" />
              </div>
              <div className="space-y-2">
                <Label>Budget annuel</Label>
                <Input type="number" min="0" step="0.01" value={programmeForm.budgetAnnuel} onChange={event => setProgrammeForm(current => ({ ...current, budgetAnnuel: event.target.value }))} placeholder="Ex: 25000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={programmeForm.description} onChange={event => setProgrammeForm(current => ({ ...current, description: event.target.value }))} rows={4} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
              <div>
                <p className="font-semibold text-slate-900">Programme actif</p>
                <p className="text-sm text-slate-500">Disponible dans la création des bons d'achat</p>
              </div>
              <Button variant={programmeForm.actif ? 'default' : 'outline'} onClick={() => setProgrammeForm(current => ({ ...current, actif: !current.actif }))}>
                {programmeForm.actif ? 'Actif' : 'Inactif'}
              </Button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setDialogProgrammeOpen(false); resetProgrammeForm(); }}>
                Annuler
              </Button>
              <Button onClick={handleSaveProgramme}>Enregistrer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogReglaOpen} onOpenChange={setDialogReglaOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{reglaEnEdicion ? 'Modifier une règle' : 'Nouvelle règle d\'autorisation'}</DialogTitle>
            <DialogDescription>
              Définissez le rôle responsable et la plage financière couverte par cette règle.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Nom de la règle</Label>
              <Input value={reglaForm.nom} onChange={event => setReglaForm(current => ({ ...current, nom: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Rôle autorisateur</Label>
              <Input value={reglaForm.roleAutorisateur} onChange={event => setReglaForm(current => ({ ...current, roleAutorisateur: event.target.value }))} placeholder="Ex: Direction générale" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Montant minimum</Label>
                <Input type="number" min="0" step="0.01" value={reglaForm.montantMinimum} onChange={event => setReglaForm(current => ({ ...current, montantMinimum: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Montant maximum</Label>
                <Input type="number" min="0" step="0.01" value={reglaForm.montantMaximum} onChange={event => setReglaForm(current => ({ ...current, montantMaximum: event.target.value }))} placeholder="Laisser vide pour sans plafond" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={reglaForm.description} onChange={event => setReglaForm(current => ({ ...current, description: event.target.value }))} rows={4} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setDialogReglaOpen(false); resetReglaForm(); }}>
                Annuler
              </Button>
              <Button onClick={handleSaveRule}>Enregistrer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AchatPage;