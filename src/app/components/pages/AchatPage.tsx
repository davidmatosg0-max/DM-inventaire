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
import { ModulePageHeader, ModuleStatCard, ModuleStatsGrid } from '../shared/ModulePageHeader';
import { ModuleControlSurface, ModuleControlSurfaceTabs } from '../shared/ModuleControlSurface';
import { ModuleExecutiveStrip } from '../shared/ModuleExecutiveStrip';
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

function resolveIntlLocale(language: string): string {
  const normalized = language.split('-')[0];

  switch (normalized) {
    case 'en':
      return 'en-CA';
    case 'es':
      return 'es-ES';
    case 'ar':
      return 'ar-EG';
    case 'fr':
    default:
      return 'fr-CA';
  }
}

function createEmptyLine(defaultUnit = 'unit'): LigneFormulaire {
  return {
    id: `ligne-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    description: '',
    quantite: '',
    unite: defaultUnit,
    prixUnitaire: 0,
    total: 0
  };
}

function formatCurrency(value: number, language = 'fr'): string {
  return new Intl.NumberFormat(resolveIntlLocale(language), {
    style: 'currency',
    currency: 'CAD',
    maximumFractionDigits: 2
  }).format(value || 0);
}

function formatDate(value?: string, language = 'fr'): string {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat(resolveIntlLocale(language), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(value));
}

function getSupplierLabel(contact: ContactoDepartamento, fallbackLabel = 'Supplier'): string {
  return contact.nombreEmpresa || `${contact.nombre} ${contact.apellido}`.trim() || fallbackLabel;
}

export function AchatPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const { t, i18n } = useTranslation();
  const branding = useBranding();
  const usuario = obtenerUsuarioSesion();
  const currentLanguage = i18n.resolvedLanguage || i18n.language || 'fr';
  const supplierFallback = t('achatPage.supplierFallback');
  const formatCurrencyValue = (value: number) => formatCurrency(value, currentLanguage);
  const formatDateValue = (value?: string) => formatDate(value, currentLanguage);
  const statutConfig = useMemo<Record<StatutBonAchat, { label: string; className: string }>>(() => ({
    brouillon: { label: t('achatPage.status.draft'), className: 'bg-slate-100 text-slate-700 border-slate-200' },
    en_attente: { label: t('achatPage.status.pending'), className: 'bg-amber-100 text-amber-800 border-amber-200' },
    approuve: { label: t('achatPage.status.approved'), className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    refuse: { label: t('achatPage.status.refused'), className: 'bg-rose-100 text-rose-800 border-rose-200' },
    commande: { label: t('achatPage.status.ordered'), className: 'bg-sky-100 text-sky-800 border-sky-200' },
    recu: { label: t('achatPage.status.received'), className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    annule: { label: t('achatPage.status.cancelled'), className: 'bg-zinc-200 text-zinc-700 border-zinc-300' }
  }), [t]);
  const [bons, setBons] = useState<BonAchat[]>([]);
  const [programmes, setProgrammes] = useState<ProgrammeAchat[]>([]);
  const [reglas, setReglas] = useState<RegleAutorisationAchat[]>([]);
  const [dialogBonOpen, setDialogBonOpen] = useState(false);
  const [dialogProgrammeOpen, setDialogProgrammeOpen] = useState(false);
  const [dialogReglaOpen, setDialogReglaOpen] = useState(false);
  const [activeAchatTab, setActiveAchatTab] = useState('overview');
  const [previewBon, setPreviewBon] = useState<BonAchat | null>(null);
  const [programmeEnEdicion, setProgrammeEnEdicion] = useState<ProgrammeAchat | null>(null);
  const [reglaEnEdicion, setReglaEnEdicion] = useState<RegleAutorisationAchat | null>(null);
  const [bonsProgrammeFilter, setBonsProgrammeFilter] = useState('all');
  const [selectedProgrammeId, setSelectedProgrammeId] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [dateLivraisonSouhaitee, setDateLivraisonSouhaitee] = useState('');
  const [priorite, setPriorite] = useState<PrioriteBonAchat>('normal');
  const [conditionsPaiement, setConditionsPaiement] = useState(t('achatPage.defaults.paymentTerms'));
  const [notes, setNotes] = useState('');
  const [lignes, setLignes] = useState<LigneFormulaire[]>([createEmptyLine(t('achatPage.defaults.unit'))]);
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
      .sort((a, b) => getSupplierLabel(a, supplierFallback).localeCompare(getSupplierLabel(b, supplierFallback), 'fr'));
  }, [supplierFallback]);

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
  const achatTabLabels: Record<string, string> = useMemo(() => ({
    overview: t('achatPage.tabs.overview'),
    bons: t('achatPage.tabs.orders'),
    fournisseurs: t('achatPage.tabs.suppliers'),
    programmes: t('achatPage.tabs.programs'),
    autorisations: t('achatPage.tabs.authorizations'),
  }), [t]);
  const priorityLabels: Record<PrioriteBonAchat, string> = useMemo(() => ({
    normal: t('achatPage.create.priorityNormal'),
    urgent: t('achatPage.create.priorityUrgent'),
    critique: t('achatPage.create.priorityCritical')
  }), [t]);
  const achatsExecutiveMetrics = useMemo(() => [
    {
      id: 'active-view',
      label: t('achatPage.metrics.activeView'),
      value: achatTabLabels[activeAchatTab] || t('achatPage.tabs.overview'),
      helper: t('achatPage.metrics.activeViewHelper'),
      icon: <Receipt className="h-4 w-4" />,
      accentColor: branding.primaryColor,
    },
    {
      id: 'pending-approvals',
      label: t('achatPage.metrics.pendingValidation'),
      value: resumen.enAttente,
      helper: resumen.enAttente > 0 ? t('achatPage.metrics.pendingValidationSome') : t('achatPage.metrics.pendingValidationNone'),
      icon: <ShieldCheck className="h-4 w-4" />,
      accentColor: '#f59e0b',
    },
    {
      id: 'active-programmes',
      label: t('achatPage.metrics.activePrograms'),
      value: programmes.filter(programme => programme.actif).length,
      helper: t('achatPage.metrics.activeProgramsHelper'),
      icon: <ClipboardCheck className="h-4 w-4" />,
      accentColor: branding.secondaryColor,
    },
    {
      id: 'engaged-volume',
      label: t('achatPage.metrics.engagedVolume'),
      value: formatCurrencyValue(resumen.totalMontant),
      helper: t('achatPage.metrics.engagedVolumeHelper'),
      icon: <CreditCard className="h-4 w-4" />,
      accentColor: '#7c3aed',
    },
  ], [t, achatTabLabels, activeAchatTab, resumen.enAttente, resumen.totalMontant, programmes, branding.primaryColor, branding.secondaryColor]);

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
    setConditionsPaiement(t('achatPage.defaults.paymentTerms'));
    setNotes('');
    setLignes([createEmptyLine(t('achatPage.defaults.unit'))]);
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
      toast.error(t('achatPage.toasts.selectSupplier'));
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
      toast.error(t('achatPage.toasts.addValidLine'));
      return;
    }

    const auteur = usuario ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : t('achatPage.defaults.systemActor');
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
        ? t('achatPage.toasts.submitted')
        : t('achatPage.toasts.savedDraft')
    );
    setDialogBonOpen(false);
    resetBonForm();
    loadModuleData();
  };

  const handleSubmitBon = (bonId: string) => {
    soumettreBonAchat(bonId, usuario ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : t('achatPage.defaults.systemActor'));
    toast.success(t('achatPage.toasts.sentForApproval'));
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
        commentaire: approved ? t('achatPage.toasts.approvalCommentApproved') : t('achatPage.toasts.approvalCommentRejected')
      }
    );

    toast.success(approved ? t('achatPage.toasts.approvalApproved') : t('achatPage.toasts.approvalRejected'));
    loadModuleData();
  };

  const handleUpdateBonStatus = (bonId: string, statut: StatutBonAchat) => {
    const actorName = usuario ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : t('achatPage.defaults.systemActor');

    if (statut === 'recu') {
      const bonRecu = registrarRecepcionBonAchat(bonId, actorName);
      if (bonRecu?.inventarioRegistrado) {
        toast.success(t('achatPage.toasts.receivedInventory', { count: bonRecu.entradasInventarioIds?.length || 0 }));
      }
      loadModuleData();
      return;
    }

    actualizarBonAchat(bonId, { statut }, actorName);
    toast.success(t('achatPage.toasts.statusUpdated', { status: statutConfig[statut].label }));
    loadModuleData();
  };

  const handleCancelBon = (bonId: string) => {
    const actorName = usuario ? `${usuario.nombre} ${usuario.apellido || ''}`.trim() : t('achatPage.defaults.systemActor');
    const bonAnnule = actualizarBonAchat(bonId, { statut: 'annule' }, actorName);

    if (!bonAnnule) {
      toast.error(t('achatPage.toasts.cancelFailed'));
      return;
    }

    setPreviewBon(current => current?.id === bonId ? bonAnnule : current);
    toast.success(t('achatPage.toasts.cancelled'));
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
    doc.text(t('achatPage.pdf.title'), 14, 16);
    doc.setFontSize(11);
    doc.text(`${branding.systemName || 'Banque Alimentaire'}`, 14, 23);

    doc.setTextColor('#111827');
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${t('achatPage.pdf.orderLabel')}: ${bon.numero}`, 14, 40);

    doc.setFont('helvetica', 'normal');
    doc.text(`${t('achatPage.pdf.creationDate')}: ${formatDateValue(bon.dateCreation)}`, 110, 40);
    doc.text(`${t('achatPage.pdf.desiredDelivery')}: ${formatDateValue(bon.dateLivraisonSouhaitee)}`, 110, 47);
    doc.text(`${t('achatPage.pdf.createdBy')}: ${bon.createdByName}`, 110, 54);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primary);
    doc.text(t('achatPage.pdf.supplier'), 14, 66);
    doc.text(t('achatPage.pdf.conditions'), 110, 66);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#111827');
    fournisseurDetails.forEach((line, index) => {
      doc.text(line, 14, 73 + index * 6);
    });
    doc.text(`${t('achatPage.pdf.priority')}: ${priorityLabels[bon.priorite]}`, 110, 73);
    doc.text(`${t('achatPage.pdf.status')}: ${statutConfig[bon.statut].label}`, 110, 79);
    doc.text(`${t('achatPage.pdf.payment')}: ${bon.conditionsPaiement || t('achatPage.defaults.toConfirm')}`, 110, 85);

    autoTable(doc, {
      startY: 98,
      head: [[t('achatPage.pdf.headers.description'), t('achatPage.pdf.headers.qty'), t('achatPage.pdf.headers.unit'), t('achatPage.pdf.headers.unitPrice'), t('achatPage.pdf.headers.total')]],
      body: bon.lignes.map(ligne => [
        ligne.description,
        `${ligne.quantite}`,
        ligne.unite,
        formatCurrencyValue(ligne.prixUnitaire),
        formatCurrencyValue(ligne.total)
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
    doc.text(`${t('achatPage.pdf.headers.total')}: ${formatCurrencyValue(bon.montantTotal)}`, 138, finalY + 16);

    doc.setTextColor('#111827');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(t('achatPage.pdf.authorizations'), 14, finalY + 16);
    doc.setFont('helvetica', 'normal');
    bon.autorisations.forEach((autorisation, index) => {
      const decisionLabel = autorisation.decision === 'approuve'
        ? t('achatPage.pdf.approvalApproved')
        : autorisation.decision === 'refuse'
          ? t('achatPage.pdf.approvalRejected')
          : t('achatPage.pdf.approvalPending');
      const acteur = autorisation.autorisateurNom ? ` ${t('achatPage.pdf.by')} ${autorisation.autorisateurNom}` : '';
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
    doc.text(t('achatPage.pdf.requester'), 18, signatureBaseY + 6);
    doc.text(t('achatPage.pdf.financeValidation'), 82, signatureBaseY + 6);
    doc.text(t('achatPage.pdf.finalApproval'), 146, signatureBaseY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(bon.createdByName, 18, signatureBaseY + 12);
    const approbations = bon.autorisations.filter(item => item.decision === 'approuve');
    doc.text(approbations[0]?.autorisateurNom || t('achatPage.pdf.signatureRequired'), 82, signatureBaseY + 12);
    doc.text(approbations[approbations.length - 1]?.autorisateurNom || t('achatPage.pdf.signatureRequired'), 146, signatureBaseY + 12);

    if (bon.fechaRecepcionInventario) {
      doc.setFont('helvetica', 'italic');
      doc.text(t('achatPage.pdf.inventoryConfirmedOn', { date: formatDateValue(bon.fechaRecepcionInventario) }), 14, signatureBaseY + 24);
      doc.setFont('helvetica', 'normal');
    }

    if (bon.notes) {
      const notesStartY = finalY + 28 + bon.autorisations.length * 6;
      doc.setFont('helvetica', 'bold');
      doc.text(t('achatPage.pdf.notes'), 14, notesStartY);
      doc.setFont('helvetica', 'normal');
      const splitNotes = doc.splitTextToSize(bon.notes, 180);
      doc.text(splitNotes, 14, notesStartY + 6);
    }

    doc.save(`${bon.numero}.pdf`);
    toast.success(t('achatPage.toasts.pdfGeneratedFor', { number: bon.numero }));
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
      toast.error(t('achatPage.toasts.ruleRequired'));
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

    toast.success(reglaEnEdicion ? t('achatPage.toasts.ruleUpdated') : t('achatPage.toasts.ruleCreated'));
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
      toast.error(t('achatPage.toasts.programRequired'));
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

    toast.success(programmeEnEdicion ? t('achatPage.toasts.programUpdated') : t('achatPage.toasts.programCreated'));
    setDialogProgrammeOpen(false);
    resetProgrammeForm();
    loadModuleData();
  };

  return (
    <div className="space-y-6">
      <ModulePageHeader
        title={t('achatPage.header.title')}
        subtitle={t('achatPage.header.subtitle')}
        icon={<ShoppingCart className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
        accentColor={branding.primaryColor}
        secondaryColor={branding.secondaryColor}
      />

      <ModuleExecutiveStrip
        eyebrow={t('achatPage.strip.eyebrow')}
        title={t('achatPage.strip.title')}
        description={t('achatPage.strip.description')}
        accentColor={branding.primaryColor}
        secondaryColor={branding.secondaryColor}
        metrics={achatsExecutiveMetrics}
        actions={(
          <>
            <Button variant="outline" onClick={() => setActiveAchatTab('bons')} className="border-white/70 bg-white/82 text-[#16324f] hover:bg-white">
              <Receipt className="mr-2 h-4 w-4" />
              {t('achatPage.actions.orders')}
            </Button>
            <Button onClick={() => { setActiveAchatTab('bons'); setDialogBonOpen(true); }} disabled={!canCreateBon} className="text-white shadow-lg disabled:opacity-60" style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)` }}>
              <Plus className="mr-2 h-4 w-4" />
              {t('achatPage.actions.newOrder')}
            </Button>
            <Button variant="outline" onClick={() => { setActiveAchatTab('programmes'); setDialogProgrammeOpen(true); }} className="border-white/70 bg-white/82 text-[#16324f] hover:bg-white">
              <ClipboardCheck className="mr-2 h-4 w-4" />
              {t('achatPage.actions.newProgram')}
            </Button>
            <Button variant="outline" onClick={() => { setActiveAchatTab('autorisations'); setDialogReglaOpen(true); }} className="border-white/70 bg-white/82 text-[#16324f] hover:bg-white">
              <ShieldCheck className="mr-2 h-4 w-4" />
              {t('achatPage.actions.newRule')}
            </Button>
            <Button variant="outline" onClick={() => setActiveAchatTab('fournisseurs')} className="border-white/70 bg-white/82 text-[#16324f] hover:bg-white">
              <Building2 className="mr-2 h-4 w-4" />
              {t('achatPage.actions.suppliers')}
            </Button>
          </>
        )}
      />

      <ModuleStatsGrid defaultLayout="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-[32rem]">
        <ModuleStatCard
          label={t('achatPage.stats.activeSuppliers')}
          value={fournisseurs.length}
          icon={<Building2 className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
          accentColor={branding.primaryColor}
        />
        <ModuleStatCard
          label={t('achatPage.stats.pendingAuthorizations')}
          value={resumen.enAttente}
          icon={<ShieldCheck className="h-4 w-4 text-white sm:h-5 sm:w-5" />}
          accentColor={branding.secondaryColor}
        />
      </ModuleStatsGrid>

      <Tabs value={activeAchatTab} onValueChange={setActiveAchatTab} className="space-y-6">
        <ModuleControlSurface>
          <ModuleControlSurfaceTabs>
            <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
              <TabsTrigger value="overview" className="gap-2 rounded-xl px-4 py-2">
                <Receipt className="h-4 w-4" />
                {t('achatPage.tabs.overview')}
              </TabsTrigger>
              <TabsTrigger value="bons" className="gap-2 rounded-xl px-4 py-2">
                <FileSignature className="h-4 w-4" />
                {t('achatPage.tabs.orders')}
              </TabsTrigger>
              <TabsTrigger value="fournisseurs" className="gap-2 rounded-xl px-4 py-2">
                <Building2 className="h-4 w-4" />
                {t('achatPage.tabs.suppliers')}
              </TabsTrigger>
              <TabsTrigger value="programmes" className="gap-2 rounded-xl px-4 py-2">
                <ClipboardCheck className="h-4 w-4" />
                {t('achatPage.tabs.programs')}
              </TabsTrigger>
              <TabsTrigger value="autorisations" className="gap-2 rounded-xl px-4 py-2">
                <ShieldCheck className="h-4 w-4" />
                {t('achatPage.tabs.authorizations')}
              </TabsTrigger>
            </TabsList>
          </ModuleControlSurfaceTabs>
        </ModuleControlSurface>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('achatPage.overview.engagedVolume.title')}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{formatCurrencyValue(resumen.totalMontant)}</p>
                <p className="mt-2 text-sm text-slate-500">{t('achatPage.overview.engagedVolume.description')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('achatPage.overview.underReview.title')}</p>
                <p className="mt-2 text-3xl font-bold text-amber-700">{resumen.enAttente}</p>
                <p className="mt-2 text-sm text-slate-500">{t('achatPage.overview.underReview.description')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('achatPage.overview.readyToOrder.title')}</p>
                <p className="mt-2 text-3xl font-bold text-emerald-700">{resumen.approuves}</p>
                <p className="mt-2 text-sm text-slate-500">{t('achatPage.overview.readyToOrder.description')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t('achatPage.overview.finalizedReceipts.title')}</p>
                <p className="mt-2 text-3xl font-bold text-sky-700">{resumen.recus}</p>
                <p className="mt-2 text-sm text-slate-500">{t('achatPage.overview.finalizedReceipts.description')}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t('achatPage.latestOrders.title')}</CardTitle>
                  <p className="text-sm text-slate-500">{t('achatPage.latestOrders.description')}</p>
                </div>
                {canCreateBon && (
                  <Button onClick={() => setDialogBonOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t('achatPage.actions.newOrder')}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {bonsRecents.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                    {t('achatPage.latestOrders.empty')}
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
                          <p className="mt-1 text-xs font-medium text-slate-500">{t('achatPage.latestOrders.programLabel')}: {bon.programmeAchatNom}</p>
                        )}
                        <p className="mt-1 text-sm text-slate-600">{bon.fournisseurNom}</p>
                        <p className="text-xs text-slate-500">{t('achatPage.latestOrders.createdOnBy', { date: formatDateValue(bon.dateCreation), name: bon.createdByName })}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-slate-900">{formatCurrencyValue(bon.montantTotal)}</p>
                        <p className="text-xs text-slate-500">{t('achatPage.latestOrders.desiredDelivery')}: {formatDateValue(bon.dateLivraisonSouhaitee)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('achatPage.authorizationQueue.title')}</CardTitle>
                <p className="text-sm text-slate-500">{t('achatPage.authorizationQueue.description')}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {bonsEnAttente.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                    {t('achatPage.authorizationQueue.empty')}
                  </div>
                )}
                {bonsEnAttente.slice(0, 5).map(bon => (
                  <div key={bon.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{bon.numero}</p>
                        <p className="text-sm text-slate-600">{bon.fournisseurNom}</p>
                        <p className="text-xs text-slate-500">{t('achatPage.authorizationQueue.remainingValidations', { count: bon.autorisations.filter(item => item.decision === 'en_attente').length })}</p>
                      </div>
                      <p className="text-sm font-semibold text-amber-700">{formatCurrencyValue(bon.montantTotal)}</p>
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
                <CardTitle>{t('achatPage.orders.title')}</CardTitle>
                <p className="text-sm text-slate-500">{t('achatPage.orders.description')}</p>
              </div>
              {canCreateBon && (
                <Button onClick={() => setDialogBonOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  {t('achatPage.orders.createOrder')}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t('achatPage.orders.filterTitle')}</p>
                  <p className="text-sm text-slate-500">{t('achatPage.orders.filterDescription')}</p>
                </div>
                <div className="w-full md:max-w-sm">
                  <Label className="mb-2 block">{t('achatPage.orders.programLabel')}</Label>
                  <Select value={bonsProgrammeFilter} onValueChange={setBonsProgrammeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('achatPage.orders.allPrograms')}</SelectItem>
                      <SelectItem value="none">{t('achatPage.orders.withoutProgram')}</SelectItem>
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
                    <TableHead>{t('achatPage.orders.table.order')}</TableHead>
                    <TableHead>{t('achatPage.orders.table.supplier')}</TableHead>
                    <TableHead>{t('achatPage.orders.table.amount')}</TableHead>
                    <TableHead>{t('achatPage.orders.table.status')}</TableHead>
                    <TableHead>{t('achatPage.orders.table.authorizations')}</TableHead>
                    <TableHead>{t('achatPage.orders.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBons.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                        {bons.length === 0 ? t('achatPage.orders.emptyNone') : t('achatPage.orders.emptyFiltered')}
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredBons.map(bon => (
                    <TableRow key={bon.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-slate-900">{bon.numero}</p>
                          {bon.programmeAchatNom && <p className="text-xs text-slate-500">{bon.programmeAchatNom}</p>}
                          <p className="text-xs text-slate-500">{t('achatPage.orders.createdOn', { date: formatDateValue(bon.dateCreation) })}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900">{bon.fournisseurNom}</p>
                          <p className="text-xs text-slate-500">{bon.fournisseurEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrencyValue(bon.montantTotal)}</TableCell>
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
                            {t('achatPage.orders.preview')}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleExportBonPdf(bon)}>
                            <Download className="mr-1 h-4 w-4" />
                            PDF
                          </Button>
                          {bon.statut === 'brouillon' && (
                            <Button size="sm" variant="outline" onClick={() => handleSubmitBon(bon.id)}>
                              {t('achatPage.orders.submit')}
                            </Button>
                          )}
                          {canAuthorize && bon.statut === 'en_attente' && (
                            <>
                              <Button size="sm" onClick={() => handleApprove(bon.id, true)}>
                                {t('achatPage.orders.approve')}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleApprove(bon.id, false)}>
                                {t('achatPage.orders.reject')}
                              </Button>
                            </>
                          )}
                          {bon.statut === 'approuve' && (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateBonStatus(bon.id, 'commande')}>
                              {t('achatPage.orders.markOrdered')}
                            </Button>
                          )}
                          {bon.statut === 'commande' && (
                            <Button size="sm" variant="outline" onClick={() => handleUpdateBonStatus(bon.id, 'recu')}>
                              {t('achatPage.orders.markReceived')}
                            </Button>
                          )}
                          {bonPeutEtreAnnule(bon) && (
                            <Button size="sm" variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800" onClick={() => handleCancelBon(bon.id)}>
                              <Ban className="mr-1 h-4 w-4" />
                              {t('achatPage.orders.cancel')}
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
                <CardTitle>{t('achatPage.suppliers.title')}</CardTitle>
                <p className="text-sm text-slate-500">{t('achatPage.suppliers.description')}</p>
              </div>
              {onNavigate && (
                <Button variant="outline" className="gap-2" onClick={() => onNavigate('donateurs-fournisseurs')}>
                  <Truck className="h-4 w-4" />
                  {t('achatPage.suppliers.openDatabase')}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {fournisseurs.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 md:col-span-2 xl:col-span-3">
                    <p>{t('achatPage.suppliers.empty')}</p>
                    {onNavigate && (
                      <Button variant="outline" className="mt-4 gap-2" onClick={() => onNavigate('donateurs-fournisseurs')}>
                        <Building2 className="h-4 w-4" />
                        {t('achatPage.suppliers.goToDatabase')}
                      </Button>
                    )}
                  </div>
                )}
                {fournisseurs.map(fournisseur => (
                  <Card key={fournisseur.id} className="border-slate-200">
                    <CardContent className="space-y-3 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{getSupplierLabel(fournisseur, supplierFallback)}</p>
                          <p className="text-xs text-slate-500">{fournisseur.tipoEmpresa || t('achatPage.suppliers.referencedSupplier')}</p>
                        </div>
                        <Badge variant="outline" className="bg-slate-50">{t('achatPage.suppliers.activeBase')}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600">
                        <p>{fournisseur.emailPrincipal || fournisseur.email || t('achatPage.suppliers.noEmail')}</p>
                        <p>{fournisseur.telefonoPrincipal || fournisseur.telefono || t('achatPage.suppliers.noPhone')}</p>
                        <p>{fournisseur.direccion || t('achatPage.suppliers.noAddress')}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(fournisseur.categoriaProductos || []).slice(0, 3).map(categorie => (
                          <Badge key={categorie} variant="secondary">{categorie}</Badge>
                        ))}
                        {(fournisseur.categoriaProductos || []).length === 0 && (
                          <Badge variant="secondary">{t('achatPage.suppliers.catalogPending')}</Badge>
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
                <CardTitle>{t('achatPage.programs.title')}</CardTitle>
                <p className="text-sm text-slate-500">{t('achatPage.programs.description')}</p>
              </div>
              <Button
                className="gap-2"
                onClick={() => {
                  resetProgrammeForm();
                  setDialogProgrammeOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                {t('achatPage.actions.newProgram')}
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('achatPage.programs.table.program')}</TableHead>
                    <TableHead>{t('achatPage.programs.table.manager')}</TableHead>
                    <TableHead>{t('achatPage.programs.table.annualBudget')}</TableHead>
                    <TableHead>{t('achatPage.programs.table.consumption')}</TableHead>
                    <TableHead>{t('achatPage.programs.table.status')}</TableHead>
                    <TableHead>{t('achatPage.programs.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programmes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                        {t('achatPage.programs.empty')}
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
                        <TableCell>{programme.responsable || t('achatPage.programs.unassigned')}</TableCell>
                        <TableCell>{programme.budgetAnnuel == null ? t('achatPage.programs.toDefine') : formatCurrencyValue(programme.budgetAnnuel)}</TableCell>
                        <TableCell>
                          <div className="min-w-[240px] space-y-2">
                            <div className="flex items-center justify-between gap-3 text-sm">
                              <span className="font-semibold text-slate-900">{formatCurrencyValue(budgetMetrics.montantEngage)}</span>
                              {budgetMetrics.budgetRestant == null ? (
                                <span className="text-slate-500">{t('achatPage.programs.noCap')}</span>
                              ) : (
                                <span className={budgetDepasse ? 'text-rose-600' : 'text-slate-500'}>
                                  {budgetDepasse ? t('achatPage.programs.overrun', { amount: formatCurrencyValue(Math.abs(budgetMetrics.budgetRestant)) }) : t('achatPage.programs.remaining', { amount: formatCurrencyValue(budgetMetrics.budgetRestant) })}
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
                              {t('achatPage.programs.engagedOrders', { count: budgetMetrics.bonsEngages })}
                              {budgetMetrics.montantRecu > 0 ? ` • ${t('achatPage.programs.alreadyReceived', { amount: formatCurrencyValue(budgetMetrics.montantRecu) })}` : ''}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={programme.actif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                            {programme.actif ? t('achatPage.programs.active') : t('achatPage.programs.inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openEditProgramme(programme)}>
                              {t('achatPage.programs.edit')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                eliminarProgrammeAchat(programme.id);
                                toast.success(t('achatPage.toasts.programDeleted'));
                                loadModuleData();
                              }}
                            >
                              {t('achatPage.programs.delete')}
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
                  <p className="text-sm font-semibold text-slate-900">{t('achatPage.authorizations.cards.configurableFlow.title')}</p>
                  <p className="text-sm text-slate-500">{t('achatPage.authorizations.cards.configurableFlow.description')}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-start gap-3 p-5">
                <ClipboardCheck className="mt-1 h-5 w-5 text-sky-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t('achatPage.authorizations.cards.documentedValidation.title')}</p>
                  <p className="text-sm text-slate-500">{t('achatPage.authorizations.cards.documentedValidation.description')}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-start gap-3 p-5">
                <AlertCircle className="mt-1 h-5 w-5 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t('achatPage.authorizations.cards.internalCompliance.title')}</p>
                  <p className="text-sm text-slate-500">{t('achatPage.authorizations.cards.internalCompliance.description')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>{t('achatPage.rules.title')}</CardTitle>
                <p className="text-sm text-slate-500">{t('achatPage.rules.description')}</p>
              </div>
              <Button
                className="gap-2"
                onClick={() => {
                  resetReglaForm();
                  setDialogReglaOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
                {t('achatPage.actions.newRule')}
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('achatPage.rules.table.rule')}</TableHead>
                    <TableHead>{t('achatPage.rules.table.authorizer')}</TableHead>
                    <TableHead>{t('achatPage.rules.table.threshold')}</TableHead>
                    <TableHead>{t('achatPage.rules.table.status')}</TableHead>
                    <TableHead>{t('achatPage.rules.table.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reglas.map(regla => (
                    <TableRow key={regla.id}>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-slate-900">{regla.nom}</p>
                          <p className="text-xs text-slate-500">{regla.description || t('achatPage.rules.noDescription')}</p>
                        </div>
                      </TableCell>
                      <TableCell>{regla.roleAutorisateur}</TableCell>
                      <TableCell>
                        {formatCurrencyValue(regla.montantMinimum)}
                        {' '}à{' '}
                        {regla.montantMaximum == null ? t('achatPage.rules.andMore') : formatCurrencyValue(regla.montantMaximum)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={regla.actif ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}>
                          {regla.actif ? t('achatPage.rules.active') : t('achatPage.rules.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditRule(regla)}>
                            {t('achatPage.rules.edit')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              eliminarReglaAutorizacionAchat(regla.id);
                              toast.success(t('achatPage.toasts.ruleDeleted'));
                              loadModuleData();
                            }}
                          >
                              {t('achatPage.rules.delete')}
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
                <DialogTitle>{t('achatPage.preview.title')}</DialogTitle>
                <DialogDescription>
                  {t('achatPage.preview.description')}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_340px]">
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{t('achatPage.preview.orderLabel')}</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{previewBon.numero}</p>
                        <p className="mt-1 text-sm text-slate-600">{t('achatPage.latestOrders.createdOnBy', { date: formatDateValue(previewBon.dateCreation), name: previewBon.createdByName })}</p>
                      </div>
                      <Badge variant="outline" className={statutConfig[previewBon.statut].className}>
                        {statutConfig[previewBon.statut].label}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-base">{t('achatPage.preview.supplier')}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-slate-600">
                        <p className="font-semibold text-slate-900">{previewBon.fournisseurNom}</p>
                        <p>{previewBon.fournisseurEmail || t('achatPage.preview.noEmail')}</p>
                        <p>{previewBon.fournisseurTelephone || t('achatPage.preview.noPhone')}</p>
                        <p>{previewBon.fournisseurAdresse || t('achatPage.preview.noAddress')}</p>
                      </CardContent>
                    </Card>

                    <Card className="border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-base">{t('achatPage.preview.purchaseContext')}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm text-slate-600">
                        <p><span className="font-semibold text-slate-900">{t('achatPage.preview.priority')}:</span> {priorityLabels[previewBon.priorite]}</p>
                        <p><span className="font-semibold text-slate-900">{t('achatPage.preview.delivery')}:</span> {formatDateValue(previewBon.dateLivraisonSouhaitee)}</p>
                        <p><span className="font-semibold text-slate-900">{t('achatPage.preview.payment')}:</span> {previewBon.conditionsPaiement || t('achatPage.defaults.toConfirm')}</p>
                        <p><span className="font-semibold text-slate-900">{t('achatPage.preview.program')}:</span> {previewBon.programmeAchatNom || t('achatPage.preview.unassigned')}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-base">{t('achatPage.preview.lineItems')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('achatPage.pdf.headers.description')}</TableHead>
                            <TableHead>{t('achatPage.pdf.headers.qty')}</TableHead>
                            <TableHead>{t('achatPage.pdf.headers.unit')}</TableHead>
                            <TableHead>{t('achatPage.pdf.headers.unitPrice')}</TableHead>
                            <TableHead>{t('achatPage.pdf.headers.total')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {previewBon.lignes.map(ligne => (
                            <TableRow key={ligne.id}>
                              <TableCell className="font-medium text-slate-900">{ligne.description}</TableCell>
                              <TableCell>{ligne.quantite}</TableCell>
                              <TableCell>{ligne.unite}</TableCell>
                              <TableCell>{formatCurrencyValue(ligne.prixUnitaire)}</TableCell>
                              <TableCell className="font-semibold">{formatCurrencyValue(ligne.total)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {previewBon.notes && (
                    <Card className="border-slate-200">
                      <CardHeader>
                        <CardTitle className="text-base">{t('achatPage.pdf.notes')}</CardTitle>
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
                      <CardTitle className="text-base">{t('achatPage.preview.summary')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-slate-600">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{t('achatPage.preview.totalAmount')}</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrencyValue(previewBon.montantTotal)}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{t('achatPage.preview.authorizations')}</p>
                        <div className="mt-2 space-y-2">
                          {previewBon.autorisations.map(item => (
                            <div key={item.id} className="rounded-xl border border-slate-200 px-3 py-2">
                              <p className="text-sm font-medium text-slate-900">{item.nom}</p>
                              <p className="text-xs text-slate-500">{item.autorisateurNom || item.roleAutorisateur}</p>
                              <p className="mt-1 text-xs text-slate-600">{item.decision === 'approuve' ? t('achatPage.pdf.approvalApproved') : item.decision === 'refuse' ? t('achatPage.pdf.approvalRejected') : t('achatPage.pdf.approvalPending')}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 pt-2">
                        <Button variant="outline" className="gap-2" onClick={() => handleExportBonPdf(previewBon)}>
                          <Download className="h-4 w-4" />
                          {t('achatPage.preview.exportPdf')}
                        </Button>
                        {bonPeutEtreAnnule(previewBon) && (
                          <Button variant="outline" className="gap-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800" onClick={() => handleCancelBon(previewBon.id)}>
                            <Ban className="h-4 w-4" />
                            {t('achatPage.preview.cancelOrder')}
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
            <DialogTitle>{t('achatPage.create.title')}</DialogTitle>
            <DialogDescription>
              {t('achatPage.create.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('achatPage.create.program')}</Label>
                  <Select value={selectedProgrammeId} onValueChange={setSelectedProgrammeId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('achatPage.create.chooseProgram')} />
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
                  <Label>{t('achatPage.create.supplier')}</Label>
                  <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('achatPage.create.chooseSupplier')} />
                    </SelectTrigger>
                    <SelectContent>
                      {fournisseurs.map(fournisseur => (
                        <SelectItem key={fournisseur.id} value={fournisseur.id}>
                          {getSupplierLabel(fournisseur, supplierFallback)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t('achatPage.create.desiredDelivery')}</Label>
                  <Input type="date" value={dateLivraisonSouhaitee} onChange={event => setDateLivraisonSouhaitee(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t('achatPage.create.priority')}</Label>
                  <Select value={priorite} onValueChange={value => setPriorite(value as PrioriteBonAchat)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">{t('achatPage.create.priorityNormal')}</SelectItem>
                      <SelectItem value="urgent">{t('achatPage.create.priorityUrgent')}</SelectItem>
                      <SelectItem value="critique">{t('achatPage.create.priorityCritical')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{t('achatPage.create.paymentTerms')}</Label>
                  <Input value={conditionsPaiement} onChange={event => setConditionsPaiement(event.target.value)} placeholder={t('achatPage.create.paymentPlaceholder')} />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{t('achatPage.create.lineItems')}</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setLignes(current => [...current, createEmptyLine(t('achatPage.defaults.unit'))])}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('achatPage.create.addLine')}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  {t('achatPage.create.quantityHelp')}
                </p>
                {lignes.map((ligne, index) => (
                  <div key={ligne.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">{t('achatPage.create.lineLabel', { index: index + 1 })}</p>
                      {lignes.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => setLignes(current => current.filter(item => item.id !== ligne.id))}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid gap-3 md:grid-cols-[minmax(0,2.1fr)_minmax(132px,0.9fr)_minmax(132px,0.9fr)_minmax(148px,1fr)_minmax(156px,1fr)]">
                      <Input className="h-11" placeholder={t('achatPage.create.purchaseDescription')} value={ligne.description} onChange={event => handleChangeLine(ligne.id, 'description', event.target.value)} />
                      <Input className="h-11 text-base" type="number" min="0" step="0.01" placeholder={t('achatPage.create.manualQty')} value={ligne.quantite} onChange={event => handleChangeLine(ligne.id, 'quantite', event.target.value === '' ? '' : Number(event.target.value))} />
                      <Input className="h-11" placeholder={t('achatPage.create.unit')} value={ligne.unite} onChange={event => handleChangeLine(ligne.id, 'unite', event.target.value)} />
                      <Input className="h-11 text-base" type="number" min="0" step="0.01" placeholder={t('achatPage.create.price')} value={ligne.prixUnitaire} onChange={event => handleChangeLine(ligne.id, 'prixUnitaire', Number(event.target.value))} />
                      <div className="flex min-h-11 items-center rounded-xl border border-slate-200 px-4 text-base font-semibold text-slate-700">
                        {formatCurrencyValue(ligne.total)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>{t('achatPage.create.notesAndContext')}</Label>
                <Textarea value={notes} onChange={event => setNotes(event.target.value)} placeholder={t('achatPage.create.notesPlaceholder')} rows={4} />
              </div>
            </div>

            <Card className="h-fit border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">{t('achatPage.create.supplierSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-600">
                {fournisseurSeleccionado ? (
                  <>
                    {programmeSeleccionado && (
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{t('achatPage.create.program')}</p>
                        <p className="mt-2 font-semibold text-slate-900">{programmeSeleccionado.nom}</p>
                        <p className="text-sm text-slate-600">{programmeSeleccionado.code}</p>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-slate-900">{getSupplierLabel(fournisseurSeleccionado, supplierFallback)}</p>
                      <p>{fournisseurSeleccionado.emailPrincipal || fournisseurSeleccionado.email || t('achatPage.preview.noEmail')}</p>
                      <p>{fournisseurSeleccionado.telefonoPrincipal || fournisseurSeleccionado.telefono || t('achatPage.preview.noPhone')}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{t('achatPage.suppliers.address')}</p>
                      <p className="mt-2">{fournisseurSeleccionado.direccion || t('achatPage.suppliers.noAddress')}</p>
                    </div>
                  </>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
                    {t('achatPage.create.chooseSupplierToShow')}
                  </div>
                )}

                {fournisseurs.length === 0 && onNavigate && (
                  <Button variant="outline" className="w-full gap-2" onClick={() => onNavigate('donateurs-fournisseurs')}>
                    <Building2 className="h-4 w-4" />
                    {t('achatPage.create.populateSupplierDatabase')}
                  </Button>
                )}

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{t('achatPage.create.totalAmount')}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{formatCurrencyValue(montantTotalFormulaire)}</p>
                  <p className="mt-2 text-xs text-slate-500">{t('achatPage.create.orderNumberAuto')}</p>
                </div>

                <div className="space-y-2 rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{t('achatPage.create.plannedAuthorizations')}</p>
                  {obtenerReglasAutorizacionAchat().filter(regla => regla.actif).map(regla => (
                    <div key={regla.id} className="flex items-center justify-between gap-3 text-xs text-slate-500">
                      <span>{regla.nom}</span>
                      <span>{formatCurrencyValue(regla.montantMinimum)}{regla.montantMaximum == null ? '+' : ` - ${formatCurrencyValue(regla.montantMaximum)}`}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button onClick={() => handleCreateBon('en_attente')} className="w-full gap-2">
                    <BadgeCheck className="h-4 w-4" />
                    {t('achatPage.create.submitForAuthorization')}
                  </Button>
                  <Button variant="outline" onClick={() => handleCreateBon('brouillon')} className="w-full gap-2">
                    <CreditCard className="h-4 w-4" />
                    {t('achatPage.create.saveDraft')}
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
            <DialogTitle>{programmeEnEdicion ? t('achatPage.programDialog.editTitle') : t('achatPage.programDialog.newTitle')}</DialogTitle>
            <DialogDescription>
              {t('achatPage.programDialog.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('achatPage.programDialog.name')}</Label>
                <Input value={programmeForm.nom} onChange={event => setProgrammeForm(current => ({ ...current, nom: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('achatPage.programDialog.code')}</Label>
                <Input value={programmeForm.code} onChange={event => setProgrammeForm(current => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder={t('achatPage.programDialog.codePlaceholder')} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('achatPage.programDialog.manager')}</Label>
                <Input value={programmeForm.responsable} onChange={event => setProgrammeForm(current => ({ ...current, responsable: event.target.value }))} placeholder={t('achatPage.programDialog.managerPlaceholder')} />
              </div>
              <div className="space-y-2">
                <Label>{t('achatPage.programDialog.annualBudget')}</Label>
                <Input type="number" min="0" step="0.01" value={programmeForm.budgetAnnuel} onChange={event => setProgrammeForm(current => ({ ...current, budgetAnnuel: event.target.value }))} placeholder={t('achatPage.programDialog.budgetPlaceholder')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('achatPage.programDialog.descriptionLabel')}</Label>
              <Textarea value={programmeForm.description} onChange={event => setProgrammeForm(current => ({ ...current, description: event.target.value }))} rows={4} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
              <div>
                <p className="font-semibold text-slate-900">{t('achatPage.programDialog.activeTitle')}</p>
                <p className="text-sm text-slate-500">{t('achatPage.programDialog.activeDescription')}</p>
              </div>
              <Button variant={programmeForm.actif ? 'default' : 'outline'} onClick={() => setProgrammeForm(current => ({ ...current, actif: !current.actif }))}>
                {programmeForm.actif ? t('achatPage.programs.active') : t('achatPage.programs.inactive')}
              </Button>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setDialogProgrammeOpen(false); resetProgrammeForm(); }}>
                {t('achatPage.common.cancel')}
              </Button>
              <Button onClick={handleSaveProgramme}>{t('achatPage.common.save')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogReglaOpen} onOpenChange={setDialogReglaOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{reglaEnEdicion ? t('achatPage.ruleDialog.editTitle') : t('achatPage.ruleDialog.newTitle')}</DialogTitle>
            <DialogDescription>
              {t('achatPage.ruleDialog.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>{t('achatPage.ruleDialog.name')}</Label>
              <Input value={reglaForm.nom} onChange={event => setReglaForm(current => ({ ...current, nom: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>{t('achatPage.ruleDialog.role')}</Label>
              <Input value={reglaForm.roleAutorisateur} onChange={event => setReglaForm(current => ({ ...current, roleAutorisateur: event.target.value }))} placeholder={t('achatPage.ruleDialog.rolePlaceholder')} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('achatPage.ruleDialog.minAmount')}</Label>
                <Input type="number" min="0" step="0.01" value={reglaForm.montantMinimum} onChange={event => setReglaForm(current => ({ ...current, montantMinimum: event.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>{t('achatPage.ruleDialog.maxAmount')}</Label>
                <Input type="number" min="0" step="0.01" value={reglaForm.montantMaximum} onChange={event => setReglaForm(current => ({ ...current, montantMaximum: event.target.value }))} placeholder={t('achatPage.ruleDialog.maxPlaceholder')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('achatPage.programDialog.descriptionLabel')}</Label>
              <Textarea value={reglaForm.description} onChange={event => setReglaForm(current => ({ ...current, description: event.target.value }))} rows={4} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setDialogReglaOpen(false); resetReglaForm(); }}>
                {t('achatPage.common.cancel')}
              </Button>
              <Button onClick={handleSaveRule}>{t('achatPage.common.save')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AchatPage;