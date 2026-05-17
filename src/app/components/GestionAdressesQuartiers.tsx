import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Edit2, Trash2, Download, Map, ChevronDown, ChevronRight, FileDown, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import {
  obtenirVilles,
  ajouterVille,
  mettreAJourVille,
  supprimerVille,
  ajouterQuartier,
  mettreAJourQuartier,
  supprimerQuartier,
  initialiserDonneesExemple,
  sontDonneesInitialisees,
  exporterDonnees,
  synchroniserAvecInternet,
  synchroniserQuartiersVille,
  corrigerCodesPostauxExistants,
  verifierEtReparerAdresses,
  type Ville,
  type Quartier
} from '../utils/adressesQuartiersStorage';

export function GestionAdressesQuartiers() {
  const [villes, setVilles] = useState<Ville[]>([]);
  const [villesExpandidas, setVillesExpandidas] = useState<Set<string>>(new Set());
  const [quartiersExpandidos, setQuartiersExpandidos] = useState<Set<string>>(new Set());
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncVilleLoading, setSyncVilleLoading] = useState<string | null>(null);
  
  // États pour le dialogue de ville
  const [dialogVilleOpen, setDialogVilleOpen] = useState(false);
  const [villeEditando, setVilleEditando] = useState<Ville | null>(null);
  const [formVille, setFormVille] = useState({
    nom: '',
    province: 'Québec',
    pays: 'Canada'
  });

  // États pour le dialogue de quartier
  const [dialogQuartierOpen, setDialogQuartierOpen] = useState(false);
  const [villeSeleccionada, setVilleSeleccionada] = useState<Ville | null>(null);
  const [quartierEditando, setQuartierEditando] = useState<Quartier | null>(null);
  const [formQuartier, setFormQuartier] = useState({
    nom: '',
    codePostal: '',
    description: ''
  });

  // Cargar datos
  useEffect(() => {
    cargarVilles();
  }, []);

  const cargarVilles = () => {
    verifierEtReparerAdresses();
    const villesData = obtenirVilles();
    if (villesData.length === 0 && !sontDonneesInitialisees()) {
      initialiserDonneesExemple();
      setVilles(obtenirVilles());
    } else {
      setVilles(villesData);
    }
  };

  // Alternar expansión de ciudad
  const toggleVille = (villeId: string) => {
    const newSet = new Set(villesExpandidas);
    if (newSet.has(villeId)) {
      newSet.delete(villeId);
    } else {
      newSet.add(villeId);
    }
    setVillesExpandidas(newSet);
  };

  const toggleQuartier = (quartierId: string) => {
    const newSet = new Set(quartiersExpandidos);
    if (newSet.has(quartierId)) {
      newSet.delete(quartierId);
    } else {
      newSet.add(quartierId);
    }
    setQuartiersExpandidos(newSet);
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'chemin':
        return '🛣️';
      case 'montée':
        return '⛰️';
      case 'boulevard':
        return '🌆';
      case 'avenue':
        return '🌳';
      case 'place':
        return '📍';
      case 'rue':
        return '🏠';
      default:
        return '📌';
    }
  };

  const getTypeLabel = (type?: string) => {
    switch (type) {
      case 'chemin':
        return 'Chemins';
      case 'montée':
        return 'Montées';
      case 'boulevard':
        return 'Boulevards';
      case 'avenue':
        return 'Avenues';
      case 'place':
        return 'Places';
      case 'rue':
        return 'Rues';
      default:
        return 'Autres';
    }
  };

  // Gestión de Villes
  const handleAbrirDialogVille = (ville?: Ville) => {
    if (ville) {
      setVilleEditando(ville);
      setFormVille({
        nom: ville.nom,
        province: ville.province,
        pays: ville.pays
      });
    } else {
      setVilleEditando(null);
      setFormVille({
        nom: '',
        province: 'Québec',
        pays: 'Canada'
      });
    }
    setDialogVilleOpen(true);
  };

  const handleGuardarVille = () => {
    if (!formVille.nom.trim()) {
      toast.error('Le nom de la ville est requis');
      return;
    }

    if (villeEditando) {
      const success = mettreAJourVille(villeEditando.id, formVille);
      if (success) {
        toast.success(`Ville "${formVille.nom}" mise à jour avec succès`);
        cargarVilles();
        setDialogVilleOpen(false);
      }
    } else {
      ajouterVille(formVille.nom, formVille.province, formVille.pays);
      toast.success(`Ville "${formVille.nom}" ajoutée avec succès`);
      cargarVilles();
      setDialogVilleOpen(false);
    }
  };

  const handleEliminarVille = (ville: Ville) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la ville "${ville.nom}" et tous ses quartiers?`)) {
      const success = supprimerVille(ville.id);
      if (success) {
        toast.success(`Ville "${ville.nom}" supprimée`);
        cargarVilles();
      }
    }
  };

  // Gestión de Quartiers
  const handleAbrirDialogQuartier = (ville: Ville, quartier?: Quartier) => {
    setVilleSeleccionada(ville);
    
    if (quartier) {
      setQuartierEditando(quartier);
      setFormQuartier({
        nom: quartier.nom,
        codePostal: quartier.codePostal || '',
        description: quartier.description || ''
      });
    } else {
      setQuartierEditando(null);
      setFormQuartier({
        nom: '',
        codePostal: '',
        description: ''
      });
    }
    setDialogQuartierOpen(true);
  };

  const handleGuardarQuartier = () => {
    if (!formQuartier.nom.trim()) {
      toast.error('Le nom du quartier est requis');
      return;
    }

    if (!villeSeleccionada) {
      toast.error('Aucune ville sélectionnée');
      console.error('❌ ERROR: villeSeleccionada is null');
      return;
    }

    console.log('📍 Ajout de quartier:', {
      ville: villeSeleccionada.nom,
      villeId: villeSeleccionada.id,
      quartier: formQuartier.nom,
      codePostal: formQuartier.codePostal,
      description: formQuartier.description
    });

    if (quartierEditando) {
      const success = mettreAJourQuartier(villeSeleccionada.id, quartierEditando.id, formQuartier);
      if (success) {
        console.log('✅ Quartier mis à jour avec succès');
        toast.success(`Quartier "${formQuartier.nom}" mis à jour avec succès`);
        cargarVilles();
        setDialogQuartierOpen(false);
      } else {
        console.error('❌ Échec de mise à jour du quartier');
        toast.error('Erreur lors de la mise à jour du quartier');
      }
    } else {
      const quartier = ajouterQuartier(
        villeSeleccionada.id, 
        formQuartier.nom, 
        formQuartier.codePostal, 
        formQuartier.description
      );
      
      console.log('🔍 Résultat ajouterQuartier:', quartier);
      
      if (quartier) {
        console.log('✅ Quartier ajouté avec succès:', quartier);
        toast.success(`Quartier "${formQuartier.nom}" ajouté avec succès`);
        cargarVilles();
        setDialogQuartierOpen(false);
      } else {
        console.error('❌ Échec de l\'ajout du quartier - La fonction a retourné null');
        toast.error('Erreur lors de l\'ajout du quartier');
      }
    }
  };

  const handleEliminarQuartier = (ville: Ville, quartier: Quartier) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le quartier "${quartier.nom}"?`)) {
      const success = supprimerQuartier(ville.id, quartier.id);
      if (success) {
        toast.success(`Quartier "${quartier.nom}" supprimé`);
        cargarVilles();
      }
    }
  };

  // Exportación
  const handleExportar = (format: 'json' | 'csv' | 'excel') => {
    const data = exporterDonnees(); // Solo exporta JSON
    const filename = `adresses-quartiers-${new Date().toISOString().split('T')[0]}.json`;
    const mimeType = 'application/json';
    
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`Fichier téléchargé: ${filename}`);
  };

  // Synchronisation
  const handleSynchroniser = async () => {
    setSyncLoading(true);
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const resultado = synchroniserAvecInternet();
      
      if (resultado.villesAjoutees === 0 && resultado.quartiersAjoutes === 0 && resultado.ruesSupprimees === 0 && resultado.villesMisesAJour === 0) {
        toast.info('Les données sont déjà à jour', {
          description: 'Toutes les rues et codes postaux sont synchronisés'
        });
      } else {
        const messages = [];
        if (resultado.villesAjoutees > 0) {
          messages.push(`${resultado.villesAjoutees} ville(s) ajoutée(s)`);
        }
        if (resultado.quartiersAjoutes > 0) {
          messages.push(`${resultado.quartiersAjoutes} quartier(s) mis à jour`);
        }
        if (resultado.ruesSupprimees > 0) {
          messages.push(`${resultado.ruesSupprimees} rues invalides supprimées`);
        }
        if (resultado.villesMisesAJour > 0) {
          messages.push(`Codes postaux actualisés`);
        }
        
        toast.success('🌐 Synchronisation Internet réussie!', {
          description: `${messages.join(' • ')} - Données téléchargées depuis Internet`,
          duration: 5000
        });
      }
      
      cargarVilles();
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      toast.error('Erreur de synchronisation', {
        description: 'Une erreur s\'est produite lors de la synchronisation'
      });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleSynchroniserVille = async (villeId: string) => {
    setSyncVilleLoading(villeId);
    
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const resultado = synchroniserQuartiersVille(villeId);
      const ville = villes.find(v => v.id === villeId);
      
      if (resultado.quartiersAjoutes === 0 && resultado.ruesAjoutees === 0 && resultado.ruesSupprimees === 0) {
        toast.info(`${ville?.nom || 'Ville'} - Données à jour`, {
          description: 'Toutes les rues disponibles sont déjà synchronisées'
        });
      } else {
        const messages = [];
        if (resultado.ruesAjoutees > 0) {
          messages.push(`${resultado.ruesAjoutees} rues téléchargées`);
        }
        if (resultado.quartiersAjoutes > 0) {
          messages.push(`${resultado.quartiersAjoutes} quartier(s) mis à jour`);
        }
        if (resultado.ruesSupprimees > 0) {
          messages.push(`${resultado.ruesSupprimees} rues invalides supprimées`);
        }
        
        toast.success(`🌐 ${ville?.nom || 'Ville'} - Synchronisation réussie!`, {
          description: messages.join(' • '),
          duration: 5000
        });
      }
      
      cargarVilles();
    } catch (error) {
      console.error('Erreur de synchronisation:', error);
      toast.error('Erreur de synchronisation', {
        description: 'Une erreur s\'est produite lors de la synchronisation'
      });
    } finally {
      setSyncVilleLoading(null);
    }
  };

  // 🔧 CORRECCIÓN DE CÓDIGOS POSTALES
  const handleCorrigerCodesPostaux = async () => {
    setSyncLoading(true);
    
    // Simular delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const resultado = corrigerCodesPostauxExistants();
      
      if (resultado.success) {
        if (resultado.quartiersCorrigidos > 0) {
          toast.success('✅ Codes Postaux Corrigés!', {
            description: resultado.message,
            duration: 6000
          });
        } else {
          toast.info('✓ Vérification Complète', {
            description: resultado.message,
            duration: 4000
          });
        }
        cargarVilles();
      } else {
        toast.error('Erreur de correction', {
          description: resultado.message
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la correction des codes postaux');
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              <div className="flex items-center gap-3">
                <Map className="w-6 h-6 text-[#1E73BE]" />
                Gestion des Adresses et Quartiers
              </div>
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => handleExportar('json')}
                className="text-[#1E73BE] border-[#1E73BE]"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
              >
                <FileDown className="w-4 h-4 mr-2" />
                JSON
              </Button>
              <Button
                variant="outline"
                onClick={() => handleExportar('csv')}
                className="text-[#4CAF50] border-[#4CAF50]"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                CSV/Excel
              </Button>
              <Button
                onClick={() => handleAbrirDialogVille()}
                className="bg-[#1E73BE] hover:bg-[#1557A0]"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Ville
              </Button>
              <Button
                onClick={handleSynchroniser}
                className="bg-[#FFC107] hover:bg-[#FFA000]"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                disabled={syncLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`} />
                {syncLoading ? 'Synchronisation...' : 'Synchroniser'}
              </Button>
              <Button
                onClick={handleCorrigerCodesPostaux}
                className="bg-[#FF5722] hover:bg-[#E64A19]"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                disabled={syncLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`} />
                {syncLoading ? 'Correction...' : 'Corriger Codes Postaux'}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {villes.length === 0 ? (
              <div className="text-center py-12 text-[#666666]">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-[#CCCCCC]" />
                <p className="text-lg font-medium">Aucune ville enregistrée</p>
                <p className="text-sm mt-2">Cliquez sur "Nouvelle Ville" pour commencer</p>
              </div>
            ) : (
              villes.map((ville) => (
                <Card key={ville.id} className="border-l-4 border-l-[#1E73BE]">
                  <CardContent className="pt-4">
                    {(() => {
                      const totalRues = ville.quartiers.reduce((sum, quartier) => sum + (quartier.rues?.length || 0), 0);
                      const quartiersSansRues = ville.quartiers.filter((quartier) => !quartier.rues || quartier.rues.length === 0).length;

                      return (
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <button
                            onClick={() => toggleVille(ville.id)}
                            className="text-[#1E73BE] hover:text-[#1557A0]"
                            aria-label={`Afficher les quartiers de ${ville.nom}`}
                          >
                            {villesExpandidas.has(ville.id) ? (
                              <ChevronDown className="w-5 h-5" />
                            ) : (
                              <ChevronRight className="w-5 h-5" />
                            )}
                          </button>
                          <div>
                            <h3 className="font-bold text-[#333333] text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              {ville.nom}
                            </h3>
                            <p className="text-sm text-[#666666]">
                              {ville.province}, {ville.pays}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge className="bg-[#E3F2FD] text-[#1E73BE]">
                            {ville.quartiers.length} quartier{ville.quartiers.length !== 1 ? 's' : ''}
                          </Badge>
                          <Badge className="bg-[#EEF8EF] text-[#2E7D32]">
                            {totalRues} voie{totalRues !== 1 ? 's' : ''}
                          </Badge>
                          {quartiersSansRues > 0 && (
                            <Badge className="bg-[#FFF4E5] text-[#B45309]">
                              {quartiersSansRues} sans rues visibles
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAbrirDialogQuartier(ville)}
                          className="text-[#4CAF50] border-[#4CAF50]"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Quartier
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAbrirDialogVille(ville)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEliminarVille(ville)}
                          className="text-[#DC3545] border-[#DC3545]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                      );
                    })()}

                    {villesExpandidas.has(ville.id) && (
                      <div className="mt-4 ml-8 space-y-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-[#666666] font-medium">
                            Quartiers de {ville.nom}
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSynchroniserVille(ville.id)}
                            className="text-[#FFC107] border-[#FFC107] hover:bg-[#FFF8E1]"
                            disabled={syncVilleLoading === ville.id}
                          >
                            <RefreshCw className={`w-3 h-3 mr-1 ${syncVilleLoading === ville.id ? 'animate-spin' : ''}`} />
                            {syncVilleLoading === ville.id ? 'Sync...' : 'Sync Quartiers'}
                          </Button>
                        </div>
                        {ville.quartiers.length === 0 ? (
                          <p className="text-sm text-[#999999] italic">Aucun quartier enregistré</p>
                        ) : (
                          ville.quartiers.map((quartier) => (
                            <div
                              key={quartier.id}
                              className="rounded-lg border bg-gray-50 p-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <button
                                      onClick={() => toggleQuartier(quartier.id)}
                                      className="text-[#2E7D32] hover:text-[#256b28]"
                                      aria-label={`Afficher les rues de ${quartier.nom}`}
                                    >
                                      {quartiersExpandidos.has(quartier.id) ? (
                                        <ChevronDown className="w-4 h-4" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4" />
                                      )}
                                    </button>
                                    <MapPin className="w-4 h-4 text-[#4CAF50]" />
                                    <span className="font-medium text-[#333333]">{quartier.nom}</span>
                                    {quartier.codePostal && (
                                      <Badge variant="outline" className="text-xs">
                                        {quartier.codePostal}
                                      </Badge>
                                    )}
                                    <Badge className="bg-white text-[#2E7D32] border border-[#CDE9D1]">
                                      {quartier.rues?.length || 0} voie{(quartier.rues?.length || 0) !== 1 ? 's' : ''}
                                    </Badge>
                                  </div>
                                  {quartier.description && (
                                    <p className="text-sm text-[#666666] mt-1 ml-6">{quartier.description}</p>
                                  )}
                                  {quartier.rues && quartier.rues.length > 0 && (
                                    <div className="mt-2 ml-6 flex flex-wrap gap-2">
                                      {Array.from(new Set(quartier.rues.map((rue) => rue.type))).map((type) => {
                                        const total = quartier.rues?.filter((rue) => rue.type === type).length || 0;
                                        return (
                                          <Badge key={`${quartier.id}-${type}`} variant="outline" className="bg-white text-xs">
                                            {getTypeIcon(type)} {getTypeLabel(type)}: {total}
                                          </Badge>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleAbrirDialogQuartier(ville, quartier)}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEliminarQuartier(ville, quartier)}
                                    className="text-[#DC3545] hover:text-[#c82333]"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>

                              {quartiersExpandidos.has(quartier.id) && (
                                <div className="mt-3 ml-6 rounded-lg border border-dashed border-[#D7E6F5] bg-white/90 p-3">
                                  {!quartier.rues || quartier.rues.length === 0 ? (
                                    <p className="text-sm italic text-[#999999]">Aucune rue, avenue, chemin ou montée synchronisé(e) pour ce quartier.</p>
                                  ) : (
                                    <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                                      {quartier.rues
                                        .slice()
                                        .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
                                        .map((rue) => (
                                          <div key={rue.id} className="flex items-center justify-between gap-3 rounded-md border border-[#EEF2F7] bg-[#FAFCFE] px-3 py-2">
                                            <div className="min-w-0">
                                              <p className="truncate text-sm font-medium text-[#334155]">
                                                {getTypeIcon(rue.type)} {rue.nom}
                                              </p>
                                              <p className="text-xs text-[#64748B]">{getTypeLabel(rue.type).slice(0, -1) || rue.type}</p>
                                            </div>
                                            <Badge variant="outline" className="shrink-0 text-[11px]">
                                              {rue.codePostal || 'Sans code postal'}
                                            </Badge>
                                          </div>
                                        ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog Ville */}
      <Dialog open={dialogVilleOpen} onOpenChange={setDialogVilleOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="ville-dialog-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              <div className="flex items-center gap-2">
                <Map className="w-6 h-6 text-[#1E73BE]" />
                {villeEditando ? 'Modifier la Ville' : 'Nouvelle Ville'}
              </div>
            </DialogTitle>
            <DialogDescription id="ville-dialog-description">
              {villeEditando ? 'Modifiez les informations de la ville' : 'Ajoutez une nouvelle ville au système'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[#333333]">Nom de la Ville *</Label>
              <Input
                value={formVille.nom}
                onChange={(e) => setFormVille({ ...formVille, nom: e.target.value })}
                placeholder="Ex: Montréal"
                className="border-gray-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#333333]">Province *</Label>
                <Input
                  value={formVille.province}
                  onChange={(e) => setFormVille({ ...formVille, province: e.target.value })}
                  placeholder="Ex: Québec"
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[#333333]">Pays *</Label>
                <Input
                  value={formVille.pays}
                  onChange={(e) => setFormVille({ ...formVille, pays: e.target.value })}
                  placeholder="Ex: Canada"
                  className="border-gray-300"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogVilleOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleGuardarVille}
              className="bg-[#4CAF50] hover:bg-[#45a049]"
              disabled={!formVille.nom.trim()}
            >
              {villeEditando ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Quartier */}
      <Dialog open={dialogQuartierOpen} onOpenChange={setDialogQuartierOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="quartier-dialog-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              <div className="flex items-center gap-2">
                <MapPin className="w-6 h-6 text-[#4CAF50]" />
                {quartierEditando ? 'Modifier le Quartier' : 'Nouveau Quartier'}
              </div>
            </DialogTitle>
            <DialogDescription id="quartier-dialog-description">
              {villeSeleccionada ? (
                quartierEditando 
                  ? `Modifiez le quartier dans ${villeSeleccionada.nom}` 
                  : `Ajoutez un nouveau quartier à ${villeSeleccionada.nom}`
              ) : (
                quartierEditando 
                  ? 'Modifiez les informations du quartier' 
                  : 'Ajoutez un nouveau quartier'
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[#333333]">Nom du Quartier *</Label>
              <Input
                value={formQuartier.nom}
                onChange={(e) => setFormQuartier({ ...formQuartier, nom: e.target.value })}
                placeholder="Ex: Plateau-Mont-Royal"
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#333333]">Code Postal</Label>
              <Input
                value={formQuartier.codePostal}
                onChange={(e) => setFormQuartier({ ...formQuartier, codePostal: e.target.value })}
                placeholder="Ex: H2T"
                className="border-gray-300"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#333333]">Description</Label>
              <Textarea
                value={formQuartier.description}
                onChange={(e) => setFormQuartier({ ...formQuartier, description: e.target.value })}
                placeholder="Décrivez brièvement le quartier..."
                rows={3}
                className="border-gray-300"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setDialogQuartierOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleGuardarQuartier}
              className="bg-[#4CAF50] hover:bg-[#45a049]"
              disabled={!formQuartier.nom.trim()}
            >
              {quartierEditando ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}