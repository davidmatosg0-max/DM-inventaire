import React from 'react';
import { BarChart3, Check, Copy, FileSpreadsheet, FileText, Leaf, Pencil, Plus, Recycle, Settings, Trash2, CalendarRange, Scale, PackageCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { useBranding } from '../../../hooks/useBranding';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { QuantityInput, parseQuantityText } from '../ui/quantity-input';
import { formatQuantity } from '../../utils/formatUtils';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { ModuleControlSurface, ModuleControlSurfaceBody, ModuleControlSurfaceTabs } from '../shared/ModuleControlSurface';
import { ModulePageHeader, ModuleStatCard, ModuleStatsGrid } from '../shared/ModulePageHeader';
import { exportarDatosPersonalizados } from '../../utils/exportarExcel';
import { exportarReportePersonalizado } from '../../utils/exportarPDF';
import {
  DECHETS_COMPOSTAGE_EVENT,
  agregarCategoriaDechetsCompostage,
  agregarTipoDechetsCompostage,
  eliminarCategoriaDechetsCompostage,
  eliminarTipoDechetsCompostage,
  eliminarRegistroDechetCompostage,
  guardarRegistroDechetCompostage,
  modifierRegistroDechetCompostage,
  modifierCategoriaDechetsCompostage,
  modifierTipoDechetsCompostage,
  obtenerCategoriasDechetsCompostage,
  obtenerTiposDechetsCompostage,
  obtenerRegistrosDechetsCompostage,
  type OptionTypeDechetCompostage,
  type RegistroDechetCompostage,
  type TypeDechetCompostage,
} from '../../utils/dechetsCompostageStorage';

type OngletDechets = 'gestion' | 'rapport';

type FormulaireDechet = {
  fecha: string;
  tipo: TypeDechetCompostage;
  categorie: string;
  cantidadKg: string;
  notas: string;
};

const TYPE_ACCENT_COLORS = ['#DC3545', '#2D9561', '#1E73BE', '#7C3AED', '#F59E0B', '#0F766E'] as const;

function createFormulaireInitial(tipo: string): FormulaireDechet {
  return {
    fecha: new Date().toISOString().slice(0, 10),
    tipo,
    categorie: '',
    cantidadKg: '',
    notas: '',
  };
}

function formatKg(value: number): string {
  return `${formatQuantity(value)} kg`;
}

function formatDateLabel(value: string): string {
  if (!value) {
    return 'Date non définie';
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateExport(value: string): string {
  if (!value) {
    return '-';
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString('fr-CA');
}

function normaliserRecherche(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function buildTypeSummaries(
  registros: RegistroDechetCompostage[],
  tipos: OptionTypeDechetCompostage[],
): Array<{ id: string; label: string; totalKg: number; accentColor: string }> {
  const map = new Map<string, { id: string; label: string; totalKg: number; accentColor: string }>();

  tipos.forEach((tipo, index) => {
    map.set(tipo.id, {
      id: tipo.id,
      label: tipo.label,
      totalKg: 0,
      accentColor: tipo.color || TYPE_ACCENT_COLORS[index % TYPE_ACCENT_COLORS.length],
    });
  });

  registros.forEach((registro) => {
    const existente = map.get(registro.tipo);
    if (existente) {
      existente.totalKg += registro.cantidadKg;
      return;
    }

    map.set(registro.tipo, {
      id: registro.tipo,
      label: registro.tipo,
      totalKg: registro.cantidadKg,
      accentColor: TYPE_ACCENT_COLORS[map.size % TYPE_ACCENT_COLORS.length],
    });
  });

  return Array.from(map.values());
}

export function DechetsCompostage() {
  const branding = useBranding();
  const [activeTab, setActiveTab] = React.useState<OngletDechets>('gestion');
  const [types, setTypes] = React.useState<OptionTypeDechetCompostage[]>(() => obtenerTiposDechetsCompostage());
  const [categories, setCategories] = React.useState<string[]>(() => obtenerCategoriasDechetsCompostage());
  const [registros, setRegistros] = React.useState<RegistroDechetCompostage[]>(() => obtenerRegistrosDechetsCompostage());
  const [formulaire, setFormulaire] = React.useState<FormulaireDechet>(() => createFormulaireInitial(obtenerTiposDechetsCompostage()[0]?.id || 'dechet'));
  const [registroEnEditionId, setRegistroEnEditionId] = React.useState<string | null>(null);
  const [filtroRegistrosGestion, setFiltroRegistrosGestion] = React.useState('');
  const [filtroRegistrosRapport, setFiltroRegistrosRapport] = React.useState('');
  const [nuevoTipo, setNuevoTipo] = React.useState('');
  const [nuevoTipoColor, setNuevoTipoColor] = React.useState(TYPE_ACCENT_COLORS[0]);
  const [filtroTipos, setFiltroTipos] = React.useState('');
  const [nuevaCategoria, setNuevaCategoria] = React.useState('');
  const [filtroCategorias, setFiltroCategorias] = React.useState('');
  const [dialogGestionCategoriasOpen, setDialogGestionCategoriasOpen] = React.useState(false);
  const [tipoEnEditionId, setTipoEnEditionId] = React.useState<string | null>(null);
  const [valorTipoEdicion, setValorTipoEdicion] = React.useState('');
  const [valorTipoColorEdicion, setValorTipoColorEdicion] = React.useState(TYPE_ACCENT_COLORS[0]);
  const [categoriaEnEdition, setCategoriaEnEdition] = React.useState<string | null>(null);
  const [valorCategoriaEdicion, setValorCategoriaEdicion] = React.useState('');
  const [deleteRegistroConfirm, setDeleteRegistroConfirm] = React.useState<RegistroDechetCompostage | null>(null);
  const [deleteTypeConfirm, setDeleteTypeConfirm] = React.useState<OptionTypeDechetCompostage | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);
  const [dateDebut, setDateDebut] = React.useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().slice(0, 10);
  });
  const [dateFin, setDateFin] = React.useState(() => new Date().toISOString().slice(0, 10));

  React.useEffect(() => {
    const rafraichir = () => {
      setTypes(obtenerTiposDechetsCompostage());
      setCategories(obtenerCategoriasDechetsCompostage());
      setRegistros(obtenerRegistrosDechetsCompostage());
    };

    window.addEventListener(DECHETS_COMPOSTAGE_EVENT, rafraichir);
    window.addEventListener('storage', rafraichir);

    return () => {
      window.removeEventListener(DECHETS_COMPOSTAGE_EVENT, rafraichir);
      window.removeEventListener('storage', rafraichir);
    };
  }, []);

  const resumeTypesGlobal = React.useMemo(() => buildTypeSummaries(registros, types), [registros, types]);
  const typePresentationMap = React.useMemo(
    () => new Map(resumeTypesGlobal.map((tipo) => [tipo.id, { label: tipo.label, color: tipo.accentColor }])),
    [resumeTypesGlobal],
  );

  const getTypeLabel = React.useCallback((tipoId: string) => {
    return typePresentationMap.get(tipoId)?.label || tipoId;
  }, [typePresentationMap]);

  const getTypeColor = React.useCallback((tipoId: string) => {
    return typePresentationMap.get(tipoId)?.color || TYPE_ACCENT_COLORS[0];
  }, [typePresentationMap]);

  const registroCoincideConBusqueda = React.useCallback((registro: RegistroDechetCompostage, recherche: string) => {
    if (!recherche) {
      return true;
    }

    const corpus = [
      registro.categorie,
      getTypeLabel(registro.tipo),
      registro.notas || '',
      formatDateLabel(registro.fecha),
      formatKg(registro.cantidadKg),
    ].join(' ').toLocaleLowerCase();

    return corpus.includes(recherche);
  }, [getTypeLabel]);

  const resumenGlobal = React.useMemo(() => {
    const totalKg = registros.reduce((sum, registro) => sum + registro.cantidadKg, 0);

    return {
      totalKg,
      totalRegistros: registros.length,
    };
  }, [registros]);

  const registrosFiltrados = React.useMemo(() => {
    return registros.filter((registro) => {
      if (dateDebut && registro.fecha < dateDebut) {
        return false;
      }

      if (dateFin && registro.fecha > dateFin) {
        return false;
      }

      return true;
    });
  }, [dateDebut, dateFin, registros]);

  const resumenReporte = React.useMemo(() => {
    const totalKg = registrosFiltrados.reduce((sum, registro) => sum + registro.cantidadKg, 0);
    const typeSummaries = buildTypeSummaries(registrosFiltrados, types);

    const categories = registrosFiltrados.reduce<Record<string, number>>((acc, registro) => {
      acc[registro.categorie] = (acc[registro.categorie] || 0) + registro.cantidadKg;
      return acc;
    }, {});

    const categoriesTriees = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalKg,
      typeSummaries,
      categoriesTriees,
    };
  }, [registrosFiltrados, types]);

  const getUsageCount = React.useCallback((categorie: string) => {
    return registros.filter((registro) => registro.categorie === categorie).length;
  }, [registros]);

  const getTypeUsageCount = React.useCallback((tipoId: string) => {
    return registros.filter((registro) => registro.tipo === tipoId).length;
  }, [registros]);

  const hasHistoricalUsage = React.useCallback((categorie: string) => getUsageCount(categorie) > 0, [getUsageCount]);
  const hasHistoricalTypeUsage = React.useCallback((tipoId: string) => getTypeUsageCount(tipoId) > 0, [getTypeUsageCount]);

  const typesFiltrados = React.useMemo(() => {
    const filtroNormalizado = filtroTipos.trim().toLocaleLowerCase();

    if (!filtroNormalizado) {
      return types;
    }

    return types.filter((tipo) => tipo.label.toLocaleLowerCase().includes(filtroNormalizado));
  }, [filtroTipos, types]);

  const categoriesFiltradas = React.useMemo(() => {
    const filtroNormalizado = filtroCategorias.trim().toLocaleLowerCase();

    if (!filtroNormalizado) {
      return categories;
    }

    return categories.filter((categorie) => categorie.toLocaleLowerCase().includes(filtroNormalizado));
  }, [categories, filtroCategorias]);

  const selectedTypeOption = React.useMemo(() => {
    return types.find((typeOption) => typeOption.id === formulaire.tipo) || null;
  }, [formulaire.tipo, types]);

  const registrosGestionVisibles = React.useMemo(() => {
    const recherche = normaliserRecherche(filtroRegistrosGestion);

    return registros
      .filter((registro) => registroCoincideConBusqueda(registro, recherche))
      .slice(0, 12);
  }, [filtroRegistrosGestion, registroCoincideConBusqueda, registros]);

  const registrosRapportVisibles = React.useMemo(() => {
    const recherche = normaliserRecherche(filtroRegistrosRapport);

    return registrosFiltrados.filter((registro) => registroCoincideConBusqueda(registro, recherche));
  }, [filtroRegistrosRapport, registroCoincideConBusqueda, registrosFiltrados]);

  const handleFieldChange = <K extends keyof FormulaireDechet>(field: K, value: FormulaireDechet[K]) => {
    setFormulaire((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleAnnulerEditionRegistro = () => {
    setRegistroEnEditionId(null);
    setFormulaire(createFormulaireInitial(types[0]?.id || 'dechet'));
  };

  const handleDemarrerEditionRegistro = (registro: RegistroDechetCompostage) => {
    setRegistroEnEditionId(registro.id);
    setFormulaire({
      fecha: registro.fecha,
      tipo: registro.tipo,
      categorie: registro.categorie,
      cantidadKg: String(registro.cantidadKg),
      notas: registro.notas || '',
    });
    setActiveTab('gestion');
  };

  const handleAjouter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const cantidadKg = parseQuantityText(formulaire.cantidadKg) || 0;
    if (!formulaire.fecha || !formulaire.tipo.trim() || !formulaire.categorie.trim() || !Number.isFinite(cantidadKg) || cantidadKg <= 0) {
      toast.error('Complétez la date, le type, la catégorie et un poids valide en kg.');
      return;
    }

    const payload = {
      fecha: formulaire.fecha,
      tipo: formulaire.tipo,
      categorie: formulaire.categorie.trim(),
      cantidadKg,
      notas: formulaire.notas.trim(),
    };

    if (registroEnEditionId) {
      modifierRegistroDechetCompostage(registroEnEditionId, payload);
      setRegistroEnEditionId(null);
      setFormulaire(createFormulaireInitial(formulaire.tipo));
      toast.success('Registre modifié.');
      return;
    }

    guardarRegistroDechetCompostage(payload);

    setFormulaire({
      ...createFormulaireInitial(formulaire.tipo),
      fecha: formulaire.fecha,
    });
    toast.success('Registre de déchets/compostage ajouté.');
  };

  const handleSupprimer = (registro: RegistroDechetCompostage) => {
    eliminarRegistroDechetCompostage(registro.id);
    if (registroEnEditionId === registro.id) {
      handleAnnulerEditionRegistro();
    }
    setDeleteRegistroConfirm(null);
    toast.success('Registre supprimé.');
  };

  const handleDupliquerRegistro = (registro: RegistroDechetCompostage) => {
    guardarRegistroDechetCompostage({
      fecha: registro.fecha,
      tipo: registro.tipo,
      categorie: registro.categorie,
      cantidadKg: registro.cantidadKg,
      notas: registro.notas || '',
    });
    toast.success('Registre dupliqué.');
  };

  const handleAjouterCategorie = () => {
    try {
      const actualizadas = agregarCategoriaDechetsCompostage(nuevaCategoria);
      setCategories(actualizadas);
      setNuevaCategoria('');
      toast.success('Catégorie ajoutée.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible d’ajouter la catégorie.');
    }
  };

  const handleAjouterType = () => {
    try {
      const actualizados = agregarTipoDechetsCompostage(nuevoTipo, nuevoTipoColor);
      setTypes(actualizados);
      setNuevoTipo('');
      setNuevoTipoColor(TYPE_ACCENT_COLORS[actualizados.length % TYPE_ACCENT_COLORS.length]);
      toast.success('Type ajouté.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible d’ajouter le type.');
    }
  };

  const handleDemarrerEditionType = (typeOption: OptionTypeDechetCompostage) => {
    setTipoEnEditionId(typeOption.id);
    setValorTipoEdicion(typeOption.label);
    setValorTipoColorEdicion(typeOption.color);
  };

  const handleAnnulerEditionType = () => {
    setTipoEnEditionId(null);
    setValorTipoEdicion('');
    setValorTipoColorEdicion(TYPE_ACCENT_COLORS[0]);
  };

  const handleDemarrerEditionCategorie = (categorie: string) => {
    setCategoriaEnEdition(categorie);
    setValorCategoriaEdicion(categorie);
  };

  const handleAnnulerEditionCategorie = () => {
    setCategoriaEnEdition(null);
    setValorCategoriaEdicion('');
  };

  const handleDialogGestionCategorias = (open: boolean) => {
    setDialogGestionCategoriasOpen(open);

    if (!open) {
      setNuevoTipoColor(TYPE_ACCENT_COLORS[0]);
      setFiltroTipos('');
      setFiltroCategorias('');
      handleAnnulerEditionType();
      handleAnnulerEditionCategorie();
    }
  };

  const handleEnregistrerType = () => {
    if (!tipoEnEditionId) {
      return;
    }

    try {
      const valorActualizado = valorTipoEdicion.trim();
      const actualizados = modifierTipoDechetsCompostage(tipoEnEditionId, valorActualizado, valorTipoColorEdicion);
      setTypes(actualizados);
      handleAnnulerEditionType();
      toast.success('Type modifié.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de modifier le type.');
    }
  };

  const handleEnregistrerCategorie = () => {
    if (!categoriaEnEdition) {
      return;
    }

    try {
      const valorActualizado = valorCategoriaEdicion.trim();
      const actualizadas = modifierCategoriaDechetsCompostage(categoriaEnEdition, valorActualizado);
      setCategories(actualizadas);
      setFormulaire((current) => ({
        ...current,
        categorie: current.categorie === categoriaEnEdition ? valorActualizado : current.categorie,
      }));
      handleAnnulerEditionCategorie();
      toast.success('Catégorie modifiée.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de modifier la catégorie.');
    }
  };

  const handleSupprimerCategorie = (categorie: string) => {
    try {
      const actualizadas = eliminarCategoriaDechetsCompostage(categorie);
      setCategories(actualizadas);
      setFormulaire((current) => ({
        ...current,
        categorie: current.categorie === categorie ? '' : current.categorie,
      }));
      if (categoriaEnEdition === categorie) {
        handleAnnulerEditionCategorie();
      }
      setDeleteConfirm(null);
      toast.success('Catégorie supprimée.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de supprimer la catégorie.');
    }
  };

  const handleSupprimerType = (typeId: string) => {
    try {
      const actualizados = eliminarTipoDechetsCompostage(typeId);
      setTypes(actualizados);
      setFormulaire((current) => ({
        ...current,
        tipo: current.tipo === typeId ? (actualizados[0]?.id || '') : current.tipo,
      }));
      if (tipoEnEditionId === typeId) {
        handleAnnulerEditionType();
      }
      setDeleteTypeConfirm(null);
      toast.success('Type supprimé.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de supprimer le type.');
    }
  };

  const handleExportExcel = () => {
    if (registrosFiltrados.length === 0) {
      toast.info('Aucun registre à exporter pour cette plage de dates.');
      return;
    }

    exportarDatosPersonalizados('dechets-compostage', [
      {
        nombre: 'Résumé',
        datos: [{
          periode: `${formatDateExport(dateDebut)} au ${formatDateExport(dateFin)}`,
          volumeTotalKg: resumenReporte.totalKg,
          ...Object.fromEntries(resumenReporte.typeSummaries.map((typeSummary) => [typeSummary.label, typeSummary.totalKg])),
          registres: registrosFiltrados.length,
        }],
      },
      {
        nombre: 'Catégories',
        datos: resumenReporte.categoriesTriees.map(([categorie, kg]) => ({
          categorie,
          poidsKg: kg,
        })),
      },
      {
        nombre: 'Détail',
        datos: registrosFiltrados.map((registro) => ({
          date: formatDateExport(registro.fecha),
          type: getTypeLabel(registro.tipo),
          categorie: registro.categorie,
          poidsKg: registro.cantidadKg,
          notes: registro.notas || '-',
        })),
      },
    ]);
  };

  const handleExportPdf = () => {
    if (registrosFiltrados.length === 0) {
      toast.info('Aucun registre à exporter pour cette plage de dates.');
      return;
    }

    exportarReportePersonalizado(
      'Rapport déchets et compostage',
      `Période: ${formatDateExport(dateDebut)} au ${formatDateExport(dateFin)}`,
      [
        {
          titulo: 'Résumé',
          columnas: ['Volume total', ...resumenReporte.typeSummaries.map((typeSummary) => typeSummary.label), 'Registres'],
          datos: [[
            formatKg(resumenReporte.totalKg),
            ...resumenReporte.typeSummaries.map((typeSummary) => formatKg(typeSummary.totalKg)),
            registrosFiltrados.length,
          ]],
        },
        {
          titulo: 'Catégories dominantes',
          columnas: ['Catégorie', 'Poids'],
          datos: resumenReporte.categoriesTriees.length > 0
            ? resumenReporte.categoriesTriees.map(([categorie, kg]) => [categorie, formatKg(kg)])
            : [['Aucune catégorie', '0 kg']],
        },
        {
          titulo: 'Détail des registres',
          columnas: ['Date', 'Type', 'Catégorie', 'Poids', 'Notes'],
          datos: registrosFiltrados.map((registro) => [
            formatDateExport(registro.fecha),
            getTypeLabel(registro.tipo),
            registro.categorie,
            formatKg(registro.cantidadKg),
            registro.notas || '-',
          ]),
        },
      ],
      'rapport-dechets-compostage'
    );
  };

  return (
    <div className="min-h-[calc(100vh-56px)] space-y-4">
      <ModulePageHeader
        title="Déchets & compostage"
        subtitle="Suivi opérationnel des déchets et compostages de l’entrepôt, avec enregistrement en kilogrammes et lecture par période."
        icon={<Recycle className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
        accentColor={branding.primaryColor}
        secondaryColor={branding.secondaryColor}
        compact
        showExperienceChips={false}
        showContextChips={false}
      />

      <ModuleStatsGrid defaultLayout="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
        <ModuleStatCard
          label="Volume total"
          value={formatKg(resumenGlobal.totalKg)}
          icon={<Scale className="h-4 w-4 text-white" />}
          accentColor={branding.primaryColor}
          compact
          showPriorityView={false}
        />
        {resumeTypesGlobal.map((typeSummary) => (
          <ModuleStatCard
            key={typeSummary.id}
            label={typeSummary.label}
            value={formatKg(typeSummary.totalKg)}
            icon={<Leaf className="h-4 w-4 text-white" />}
            accentColor={typeSummary.accentColor}
            valueColor={typeSummary.accentColor}
            compact
            showPriorityView={false}
          />
        ))}
        <ModuleStatCard
          label="Registres"
          value={resumenGlobal.totalRegistros}
          icon={<PackageCheck className="h-4 w-4 text-white" />}
          accentColor="#7C3AED"
          valueColor="#7C3AED"
          compact
          showPriorityView={false}
        />
      </ModuleStatsGrid>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as OngletDechets)} className="overflow-visible">
        <ModuleControlSurface>
          <ModuleControlSurfaceTabs>
            <TabsList className="app-compact-tabs-grid w-full max-w-3xl gap-1 bg-transparent p-0" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
              <TabsTrigger value="gestion" className="app-compact-tab-trigger min-h-8 px-2 py-1.5 text-[11px]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                ♻️ Gestion par kg
              </TabsTrigger>
              <TabsTrigger value="rapport" className="app-compact-tab-trigger min-h-8 px-2 py-1.5 text-[11px]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                📊 Rapport par dates
              </TabsTrigger>
            </TabsList>
          </ModuleControlSurfaceTabs>

          <ModuleControlSurfaceBody className="space-y-4">
            <TabsContent value="gestion" className="mt-0 space-y-4">
              <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
                <Card className="border-white/70 bg-white/94 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Nouveau registre</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 w-9 rounded-xl p-0"
                        onClick={() => handleDialogGestionCategorias(true)}
                        aria-label="Gérer les types et catégories"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4" onSubmit={handleAjouter}>
                      {registroEnEditionId ? (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                          Mode modification activé. Enregistrez les changements ou annulez pour revenir à un nouveau registre.
                        </div>
                      ) : null}

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Input type="date" value={formulaire.fecha} onChange={(e) => handleFieldChange('fecha', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <select
                            value={formulaire.tipo}
                            onChange={(e) => handleFieldChange('tipo', e.target.value)}
                            className="h-10 w-full rounded-xl border border-[#d7dee6] bg-white px-3 text-sm"
                          >
                            <option value="">Sélectionner un type</option>
                            {types.map((typeOption) => (
                              <option key={typeOption.id} value={typeOption.id}>{typeOption.label}</option>
                            ))}
                          </select>
                          {selectedTypeOption ? (
                            <div
                              className="flex items-center pt-1"
                              aria-label={`Type sélectionné : ${selectedTypeOption.label}`}
                              title={selectedTypeOption.label}
                            >
                              <span className="sr-only">Type sélectionné : {selectedTypeOption.label}</span>
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedTypeOption.color }} />
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Catégorie</Label>
                        <select
                          value={formulaire.categorie}
                          onChange={(e) => handleFieldChange('categorie', e.target.value)}
                          className="h-10 w-full rounded-xl border border-[#d7dee6] bg-white px-3 text-sm"
                        >
                          <option value="">Sélectionner une catégorie</option>
                          {categories.map((categorie) => (
                            <option key={categorie} value={categorie}>{categorie}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Poids (kg)</Label>
                        <QuantityInput
                          min={0}
                          step={0.01}
                          placeholder="0,00"
                          value={formulaire.cantidadKg}
                          onChangeText={(value) => handleFieldChange('cantidadKg', value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                          rows={4}
                          placeholder="Observations opérationnelles, lot concerné, action corrective..."
                          value={formulaire.notas}
                          onChange={(e) => handleFieldChange('notas', e.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button type="submit" className="w-full rounded-2xl text-white sm:flex-1" style={{ backgroundColor: branding.primaryColor }}>
                          {registroEnEditionId ? 'Enregistrer les modifications' : 'Ajouter le registre'}
                        </Button>
                        {registroEnEditionId ? (
                          <Button type="button" variant="outline" className="w-full rounded-2xl sm:w-auto" onClick={handleAnnulerEditionRegistro}>
                            Annuler
                          </Button>
                        ) : null}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-white/70 bg-white/94 shadow-lg">
                  <CardHeader>
                    <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Derniers registres</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Input
                        placeholder="Rechercher par catégorie, type, note, date ou poids"
                        value={filtroRegistrosGestion}
                        onChange={(e) => setFiltroRegistrosGestion(e.target.value)}
                      />
                      {registros.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                          Aucun registre pour le moment.
                        </div>
                      ) : registrosGestionVisibles.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                          Aucun registre ne correspond à la recherche.
                        </div>
                      ) : (
                        registrosGestionVisibles.map((registro) => (
                          <div key={registro.id} className="rounded-2xl border bg-white px-4 py-3 shadow-sm" style={{ borderColor: registroEnEditionId === registro.id ? branding.primaryColor : undefined }}>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-semibold text-slate-900">{registro.categorie}</span>
                                  <span
                                    className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                                    style={{ backgroundColor: `${getTypeColor(registro.tipo)}1F`, color: getTypeColor(registro.tipo) }}
                                  >
                                    {getTypeLabel(registro.tipo)}
                                  </span>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">{formatDateLabel(registro.fecha)}</p>
                                {registro.notas ? (
                                  <p className="mt-2 text-sm text-slate-600">{registro.notas}</p>
                                ) : null}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-bold" style={{ color: branding.primaryColor }}>{formatKg(registro.cantidadKg)}</span>
                                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 text-slate-700 hover:bg-slate-100" onClick={() => handleDemarrerEditionRegistro(registro)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 text-slate-700 hover:bg-slate-100" onClick={() => handleDupliquerRegistro(registro)}>
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 text-rose-700 hover:bg-rose-50" onClick={() => setDeleteRegistroConfirm(registro)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="rapport" className="mt-0 space-y-4">
              <Card className="border-white/70 bg-white/94 shadow-lg">
                <CardHeader>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Rapport avec deux dates</CardTitle>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button type="button" variant="outline" className="rounded-2xl" onClick={handleExportExcel}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export Excel
                      </Button>
                      <Button type="button" variant="outline" className="rounded-2xl" onClick={handleExportPdf}>
                        <FileText className="mr-2 h-4 w-4" />
                        Export PDF
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-[minmax(0,220px)_minmax(0,220px)_1fr]">
                    <div className="space-y-2">
                      <Label>Date de début</Label>
                      <Input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Date de fin</Label>
                      <Input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <CalendarRange className="h-4 w-4" />
                        Période analysée
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {formatDateLabel(dateDebut)} au {formatDateLabel(dateFin)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Card className="border-white/70 bg-white/94 shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-white" style={{ backgroundColor: branding.primaryColor }}>
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Volume période</p>
                        <p className="text-2xl font-bold text-slate-900">{formatKg(resumenReporte.totalKg)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {resumenReporte.typeSummaries.map((typeSummary) => (
                  <Card key={typeSummary.id} className="border-white/70 bg-white/94 shadow-lg">
                    <CardContent className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{typeSummary.label}</p>
                      <p className="mt-2 text-2xl font-bold" style={{ color: typeSummary.accentColor }}>{formatKg(typeSummary.totalKg)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                <Card className="border-white/70 bg-white/94 shadow-lg">
                  <CardHeader>
                    <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Catégories dominantes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {resumenReporte.categoriesTriees.length === 0 ? (
                        <p className="text-sm text-slate-500">Aucune donnée sur cette période.</p>
                      ) : (
                        resumenReporte.categoriesTriees.map(([categorie, kg]) => (
                          <div key={categorie} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
                            <span className="text-sm font-medium text-slate-700">{categorie}</span>
                            <span className="text-sm font-bold" style={{ color: branding.primaryColor }}>{formatKg(kg)}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/70 bg-white/94 shadow-lg">
                  <CardHeader>
                    <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>Détail des registres</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Input
                        placeholder="Rechercher dans la période analysée"
                        value={filtroRegistrosRapport}
                        onChange={(e) => setFiltroRegistrosRapport(e.target.value)}
                      />
                      {registrosFiltrados.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                          Aucun registre trouvé pour cette plage de dates.
                        </div>
                      ) : registrosRapportVisibles.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                          Aucun registre de cette période ne correspond à la recherche.
                        </div>
                      ) : (
                        registrosRapportVisibles.map((registro) => (
                          <div key={registro.id} className="grid gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 md:grid-cols-[120px_120px_minmax(0,1fr)_110px_132px] md:items-center">
                            <div className="text-sm font-medium text-slate-700">{formatDateLabel(registro.fecha)}</div>
                            <div>
                              <span
                                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                                style={{ backgroundColor: `${getTypeColor(registro.tipo)}1F`, color: getTypeColor(registro.tipo) }}
                              >
                                {getTypeLabel(registro.tipo)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">{registro.categorie}</p>
                              <p className="truncate text-xs text-slate-500">{registro.destino}</p>
                            </div>
                            <div className="text-right text-sm font-bold" style={{ color: branding.primaryColor }}>{formatKg(registro.cantidadKg)}</div>
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 text-slate-700 hover:bg-slate-100" onClick={() => handleDemarrerEditionRegistro(registro)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 text-slate-700 hover:bg-slate-100" onClick={() => handleDupliquerRegistro(registro)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0 text-rose-700 hover:bg-rose-50" onClick={() => setDeleteRegistroConfirm(registro)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </ModuleControlSurfaceBody>
        </ModuleControlSurface>
      </Tabs>

      <AlertDialog open={!!deleteRegistroConfirm} onOpenChange={() => setDeleteRegistroConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-[#DC3545]">
              <Trash2 className="h-5 w-5" />
              Confirmer la suppression du registre
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteRegistroConfirm ? (
                <span>
                  Voulez-vous vraiment supprimer le registre « {deleteRegistroConfirm.categorie} » du {formatDateLabel(deleteRegistroConfirm.fecha)} pour {formatKg(deleteRegistroConfirm.cantidadKg)} ?
                </span>
              ) : 'Voulez-vous vraiment supprimer ce registre ?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteRegistroConfirm(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteRegistroConfirm && handleSupprimer(deleteRegistroConfirm)}
              className="bg-[#DC3545] hover:bg-[#C82333]"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-[#DC3545]">
              <Trash2 className="h-5 w-5" />
              Confirmer la suppression
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm ? `Voulez-vous vraiment supprimer la catégorie « ${deleteConfirm} » ?` : 'Voulez-vous vraiment supprimer cette catégorie ?'}
              {deleteConfirm && hasHistoricalUsage(deleteConfirm) ? (
                <div className="mt-3 rounded border-l-4 border-[#FFC107] bg-[#FFF9E6] p-3">
                  <p className="text-sm text-[#666666]">
                    <strong>Suppression bloquée :</strong> cette catégorie est utilisée dans {getUsageCount(deleteConfirm)} registre(s).
                  </p>
                  <p className="mt-2 text-sm text-[#666666]">
                    Modifiez ou reclassifiez d’abord les registres concernés avant de la supprimer.
                  </p>
                </div>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirm(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleSupprimerCategorie(deleteConfirm)}
              className="bg-[#DC3545] hover:bg-[#C82333] disabled:bg-[#CCCCCC] disabled:text-[#666666]"
              disabled={!!deleteConfirm && hasHistoricalUsage(deleteConfirm)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteTypeConfirm} onOpenChange={() => setDeleteTypeConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-[#DC3545]">
              <Trash2 className="h-5 w-5" />
              Confirmer la suppression du type
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTypeConfirm ? `Voulez-vous vraiment supprimer le type « ${deleteTypeConfirm.label} » ?` : 'Voulez-vous vraiment supprimer ce type ?'}
              {deleteTypeConfirm && hasHistoricalTypeUsage(deleteTypeConfirm.id) ? (
                <div className="mt-3 rounded border-l-4 border-[#FFC107] bg-[#FFF9E6] p-3">
                  <p className="text-sm text-[#666666]">
                    <strong>Suppression bloquée :</strong> ce type est utilisé dans {getTypeUsageCount(deleteTypeConfirm.id)} registre(s).
                  </p>
                  <p className="mt-2 text-sm text-[#666666]">
                    Modifiez ou reclassifiez d’abord les registres concernés avant de le supprimer.
                  </p>
                </div>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTypeConfirm(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTypeConfirm && handleSupprimerType(deleteTypeConfirm.id)}
              className="bg-[#DC3545] hover:bg-[#C82333] disabled:bg-[#CCCCCC] disabled:text-[#666666]"
              disabled={!!deleteTypeConfirm && hasHistoricalTypeUsage(deleteTypeConfirm.id)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={dialogGestionCategoriasOpen} onOpenChange={handleDialogGestionCategorias}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Gestion des types et catégories</DialogTitle>
            <DialogDescription>
              Gérez les types et les catégories sans les afficher dans le formulaire principal.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Types disponibles</p>
                <span className="text-xs text-slate-500">{types.length} option(s)</span>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="Nouveau type"
                  value={nuevoTipo}
                  onChange={(e) => setNuevoTipo(e.target.value)}
                />
                <label className="flex h-10 w-full items-center gap-2 rounded-xl border border-[#d7dee6] bg-white px-3 text-sm text-slate-600 sm:w-[150px]">
                  <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Couleur</span>
                  <input
                    type="color"
                    value={nuevoTipoColor}
                    onChange={(e) => setNuevoTipoColor(e.target.value.toUpperCase())}
                    className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                  />
                </label>
                <Button type="button" className="rounded-2xl" onClick={handleAjouterType}>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter
                </Button>
              </div>

              <Input
                placeholder="Filtrer les types"
                value={filtroTipos}
                onChange={(e) => setFiltroTipos(e.target.value)}
              />

              <div className="space-y-2 max-h-[28vh] overflow-y-auto pr-1">
                {typesFiltrados.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-3 py-4 text-center text-sm text-slate-500">
                    Aucun type ne correspond au filtre.
                  </div>
                ) : typesFiltrados.map((typeOption) => {
                  const enEdition = tipoEnEditionId === typeOption.id;

                  return (
                    <div key={typeOption.id} className="rounded-2xl border border-slate-200 bg-white p-2.5">
                      {enEdition ? (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <Input
                            value={valorTipoEdicion}
                            onChange={(e) => setValorTipoEdicion(e.target.value)}
                          />
                          <label className="flex h-10 items-center gap-2 rounded-xl border border-[#d7dee6] bg-white px-3 text-sm text-slate-600 sm:w-[150px]">
                            <span className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Couleur</span>
                            <input
                              type="color"
                              value={valorTipoColorEdicion}
                              onChange={(e) => setValorTipoColorEdicion(e.target.value.toUpperCase())}
                              className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                            />
                          </label>
                          <div className="flex gap-2">
                            <Button type="button" size="sm" className="rounded-xl" onClick={handleEnregistrerType}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={handleAnnulerEditionType}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full border border-white shadow-sm" style={{ backgroundColor: typeOption.color }} />
                            <div>
                              <span className="text-sm font-medium text-slate-700">{typeOption.label}</span>
                              <p className="mt-0.5 text-xs text-slate-500">
                                {getTypeUsageCount(typeOption.id)} registre(s)
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => handleDemarrerEditionType(typeOption)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="rounded-xl text-rose-700 hover:bg-rose-50"
                              onClick={() => setDeleteTypeConfirm(typeOption)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Catégories disponibles</p>
              <span className="text-xs text-slate-500">{categories.length} option(s)</span>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                placeholder="Nouvelle catégorie"
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
              />
              <Button type="button" className="rounded-2xl" onClick={handleAjouterCategorie}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </div>

            <Input
              placeholder="Filtrer les catégories"
              value={filtroCategorias}
              onChange={(e) => setFiltroCategorias(e.target.value)}
            />

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {categoriesFiltradas.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-3 py-4 text-center text-sm text-slate-500">
                  Aucune catégorie ne correspond au filtre.
                </div>
              ) : categoriesFiltradas.map((categorie) => {
                const enEdition = categoriaEnEdition === categorie;

                return (
                  <div key={categorie} className="rounded-2xl border border-slate-200 bg-white p-2.5">
                    {enEdition ? (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Input
                          value={valorCategoriaEdicion}
                          onChange={(e) => setValorCategoriaEdicion(e.target.value)}
                        />
                        <div className="flex gap-2">
                          <Button type="button" size="sm" className="rounded-xl" onClick={handleEnregistrerCategorie}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={handleAnnulerEditionCategorie}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-slate-700">{categorie}</span>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {getUsageCount(categorie)} registre(s)
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" size="sm" variant="outline" className="rounded-xl" onClick={() => handleDemarrerEditionCategorie(categorie)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-xl text-rose-700 hover:bg-rose-50"
                            onClick={() => setDeleteConfirm(categorie)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}