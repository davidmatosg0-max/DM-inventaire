import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { obtenerUnidades, guardarUnidad, eliminarUnidad, type Unidad } from '../../utils/unidadStorage';
import { cn } from '../ui/utils';

const iconosDisponibles = [
  // Paletas y contenedores grandes
  { icono: '📦', nombre: 'Palette/Boîte' },
  { icono: '🗃️', nombre: 'Conteneur' },
  { icono: '📐', nombre: 'Grande Palette' },
  { icono: '🧱', nombre: 'Palette Industrielle' },
  { icono: '🎛️', nombre: 'Palette Empilable' },
  
  // Sacos y bolsas
  { icono: '💼', nombre: 'Sac' },
  { icono: '🎒', nombre: 'Grand Sac' },
  { icono: '📮', nombre: 'Sachet' },
  { icono: '🛍️', nombre: 'Sac Commercial' },
  { icono: '🧳', nombre: 'Valise/Sac Industriel' },
  
  // Cajas
  { icono: '📦', nombre: 'Boîte Standard' },
  { icono: '📫', nombre: 'Petite Boîte' },
  { icono: '📪', nombre: 'Boîte Moyenne' },
  { icono: '📬', nombre: 'Grande Boîte' },
  { icono: '🎁', nombre: 'Boîte Cadeau' },
  
  // Líquidos y galones
  { icono: '🥤', nombre: 'Litre' },
  { icono: '🧃', nombre: 'Bouteille' },
  { icono: '🍾', nombre: 'Grande Bouteille' },
  { icono: '🫙', nombre: 'Cruche/Gallon' },
  { icono: '⛽', nombre: 'Gallon Industriel' },
  { icono: '🪣', nombre: 'Seau/Bidon' },
  
  // Latas y conservas
  { icono: '🥫', nombre: 'Boîte de Conserve' },
  { icono: '🫘', nombre: 'Boîte de Conserve' },
  
  // Unidades y piezas
  { icono: '🏷️', nombre: 'Unité' },
  { icono: '🧊', nombre: 'Pièce' },
  { icono: '🎯', nombre: 'Set/Ensemble' },
  { icono: '📋', nombre: 'Lot' },
  { icono: '🔢', nombre: 'Quantité' },
  
  // Canastas y cestas
  { icono: '🧺', nombre: 'Panier' },
  { icono: '🗑️', nombre: 'Bac/Conteneur' },
  { icono: '⚫', nombre: 'Bac Noir' },
  
  // Medidas de peso
  { icono: '⚖️', nombre: 'Kilogramme' },
  { icono: '⚗️', nombre: 'Gramme' },
  { icono: '🪨', nombre: 'Tonne' },
  
  // Medidas de longitud
  { icono: '📏', nombre: 'Mètre' },
  { icono: '📐', nombre: 'Mètre Carré' },
  
  // Otros
  { icono: '🛒', nombre: 'Chariot' },
  { icono: '📦', nombre: 'Paquet' },
  { icono: '🎪', nombre: 'Palette Complète' },
  { icono: '🏗️', nombre: 'Industriel' },
];

export function GestionUnidades() {
  const { t } = useTranslation();
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [unidadEditando, setUnidadEditando] = useState<Unidad | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    abreviatura: '',
    icono: '📦',
    pesoUnidad: 0
  });

  useEffect(() => {
    cargarUnidades();
  }, []);

  const cargarUnidades = () => {
    const unidadesCargadas = obtenerUnidades();
    setUnidades(unidadesCargadas);
  };

  const handleAbrirNuevo = () => {
    setModoEdicion(false);
    setUnidadEditando(null);
    setFormData({
      nombre: '',
      abreviatura: '',
      icono: '📦',
      pesoUnidad: 0
    });
    setDialogOpen(true);
  };

  const handleAbrirEditar = (unidad: Unidad) => {
    setModoEdicion(true);
    setUnidadEditando(unidad);
    setFormData({
      nombre: unidad.nombre,
      abreviatura: unidad.abreviatura,
      icono: unidad.icono || '📦',
      pesoUnidad: unidad.pesoUnidad || 0
    });
    setDialogOpen(true);
  };

  const handleGuardar = () => {
    if (!formData.nombre.trim()) {
      toast.error('Le nom est requis');
      return;
    }

    if (!formData.abreviatura.trim()) {
      toast.error('L\'abréviation est requise');
      return;
    }

    const unidad: Unidad = {
      id: modoEdicion && unidadEditando ? unidadEditando.id : Date.now().toString(),
      nombre: formData.nombre.trim(),
      abreviatura: formData.abreviatura.trim().toUpperCase(),
      icono: formData.icono,
      pesoUnidad: formData.pesoUnidad > 0 ? formData.pesoUnidad : undefined
    };

    const guardado = guardarUnidad(unidad);
    
    if (guardado) {
      toast.success(modoEdicion ? 'Unité mise à jour avec succès' : 'Unité créée avec succès');
      setDialogOpen(false);
      cargarUnidades();
    } else {
      toast.error('Erreur lors de la sauvegarde de l\'unité');
    }
  };

  const handleEliminar = (unidad: Unidad) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'unité "${unidad.nombre}" ?`)) {
      const eliminado = eliminarUnidad(unidad.id);
      
      if (eliminado) {
        toast.success('Unité supprimée avec succès');
        cargarUnidades();
      } else {
        toast.error('Erreur lors de la suppression de l\'unité');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            Unités
          </h3>
          <p className="text-sm text-[#666666]">
            Gérer les unités de mesure pour l'inventaire
          </p>
        </div>
        <Button
          onClick={handleAbrirNuevo}
          className="bg-[#1E73BE] hover:bg-[#1557A0]"
          style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Unité
        </Button>
      </div>

      {/* Grid de Unidades */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {unidades.map((unidad) => (
          <Card key={unidad.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="text-4xl">{unidad.icono || '📦'}</div>
              <div className="flex-1">
                <p className="font-medium text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {unidad.nombre}
                </p>
                <p className="text-xs text-[#666666] mt-1">
                  {unidad.abreviatura}
                </p>
              </div>
              <div className="flex gap-2 w-full">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleAbrirEditar(unidad)}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-[#DC3545] border-[#DC3545] hover:bg-red-50"
                  onClick={() => handleEliminar(unidad)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {unidades.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-[#666666] mb-2">Aucune unité enregistrée</p>
          <Button
            onClick={handleAbrirNuevo}
            variant="outline"
            className="mt-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer la première unité
          </Button>
        </div>
      )}

      {/* Diálogo Crear/Editar Unidad */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md" aria-describedby="gestion-unidad-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              {modoEdicion ? '✏️ Modifier Unité' : '✨ Nouvelle Unité'}
            </DialogTitle>
            <DialogDescription id="gestion-unidad-description">
              {modoEdicion ? 'Modifier les données de l\'unité' : 'Définir une nouvelle unité de mesure'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label>Nom *</Label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ex: Palette, Boîte, Sac..."
              />
            </div>

            {/* Abreviatura */}
            <div className="space-y-2">
              <Label>Abréviation *</Label>
              <Input
                value={formData.abreviatura}
                onChange={(e) => setFormData({ ...formData, abreviatura: e.target.value.toUpperCase() })}
                placeholder="Ex: PLT, BTE, SAC..."
                maxLength={5}
              />
              <p className="text-xs text-[#666666]">
                Maximum 5 caractères
              </p>
            </div>

            {/* Peso de la Unidad (Tara) */}
            <div className="space-y-2">
              <Label>⚖️ Poids de l'unité vide (Tare) en kg</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.pesoUnidad}
                onChange={(e) => setFormData({ ...formData, pesoUnidad: parseFloat(e.target.value) || 0 })}
                placeholder="Ex: 30 (pour une palette de 30 kg)"
              />
              <p className="text-xs text-[#666666]">
                💡 Ce poids sera automatiquement déduit lors de la pesée avec la balance
              </p>
            </div>

            {/* Selector de Icono */}
            <div className="space-y-2">
              <Label>Icône</Label>
              <div className="max-h-[240px] overflow-y-auto border rounded-lg p-2">
                <div className="grid grid-cols-6 gap-2">
                  {iconosDisponibles.map((item, index) => (
                    <button
                      key={`${item.icono}-${index}`}
                      type="button"
                      onClick={() => setFormData({ ...formData, icono: item.icono })}
                      className={cn(
                        "p-2 text-2xl border rounded-lg hover:bg-gray-100 transition-colors",
                        formData.icono === item.icono ? 'border-[#1E73BE] bg-blue-50' : 'border-gray-200'
                      )}
                      title={item.nombre}
                    >
                      {item.icono}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-[#666666]">
                {iconosDisponibles.length} icônes disponibles - Faites défiler pour voir plus
              </p>
            </div>

            {/* Vista Previa */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-[#666666] mb-2">Aperçu :</p>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{formData.icono}</div>
                <div>
                  <p className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {formData.nombre || 'Nom de l\'unité'}
                  </p>
                  <p className="text-sm text-[#666666]">
                    {formData.abreviatura || 'ABR'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              <X className="w-4 h-4 mr-2" />
              Annuler
            </Button>
            <Button
              onClick={handleGuardar}
              className="bg-[#4CAF50] hover:bg-[#45a049]"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              <Save className="w-4 h-4 mr-2" />
              {modoEdicion ? 'Enregistrer' : 'Créer Unité'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}