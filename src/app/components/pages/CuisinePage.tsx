import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useBranding } from '../../../hooks/useBranding';
import {
  ChefHat, Home, Plus, Package, ClipboardList, TrendingUp,
  Calendar, Users, AlertTriangle, Clock, CheckCircle,
  XCircle, PlayCircle, List, BookOpen, Utensils, Scale,
  BarChart3, FileText, ArrowLeft, Edit, Trash2, Copy,
  Search, Filter, X, Save, ChevronDown, ChevronUp, Printer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import {
  obtenerRecetas,
  obtenerTransformaciones,
  obtenerEstadisticasCocina,
  crearReceta,
  actualizarReceta,
  eliminarReceta,
  duplicarReceta,
  crearTransformacion,
  actualizarTransformacion,
  eliminarTransformacion,
  type Receta,
  type Transformacion,
  type IngredienteReceta,
  type CategoriaReceta,
  type UnidadMedida,
  type EstadoTransformacion
} from '../../utils/recetaStorage';
import { obtenerProductos, type ProductoCreado } from '../../utils/productStorage';
import { InventarioCocina } from '../cuisine/InventarioCocina';
import { EtiquetaReceta } from '../cuisine/EtiquetaReceta';
import { GestionContactosDepartamento } from '../departamentos/GestionContactosDepartamento';
import { BoutonRetourHeader } from '../shared/BoutonRetour';
import { formatQuantity } from '../../utils/formatUtils';

interface CuisinePageProps {
  onNavigate?: (page: string) => void;
}

type VistaActual = 'dashboard' | 'recetas' | 'transformaciones' | 'produccion' | 'inventario' | 'estadisticas' | 'perdidas' | 'contactos';

export function CuisinePage({ onNavigate }: CuisinePageProps) {
  const { t } = useTranslation();
  const branding = useBranding();
  const [vistaActual, setVistaActual] = useState<VistaActual>('dashboard');
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [transformaciones, setTransformaciones] = useState<Transformacion[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  const [productos, setProductos] = useState<ProductoCreado[]>([]);
  
  // Estados para modales
  const [modalRecetaAbierto, setModalRecetaAbierto] = useState(false);
  const [recetaEditando, setRecetaEditando] = useState<Receta | null>(null);
  const [modalTransformacionAbierto, setModalTransformacionAbierto] = useState(false);
  const [transformacionEditando, setTransformacionEditando] = useState<Transformacion | null>(null);
  const [modalEtiquetaAbierto, setModalEtiquetaAbierto] = useState(false);
  const [recetaParaEtiquetar, setRecetaParaEtiquetar] = useState<Receta | null>(null);
  
  // Búsqueda y filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaReceta | 'todas'>('todas');
  const [filtroEstado, setFiltroEstado] = useState<EstadoTransformacion | 'todos'>('todos');

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    setRecetas(obtenerRecetas());
    setTransformaciones(obtenerTransformaciones());
    setEstadisticas(obtenerEstadisticasCocina());
    setProductos(obtenerProductos());
  };

  // Renderizar header común
  const renderHeader = (titulo: string, icono: React.ReactNode) => (
    <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            {icono}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                {titulo}
              </h1>
              <p className="text-sm text-gray-700">Département Cuisine - Transformation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== MODAL RECETA ====================
  const ModalReceta = () => {
    const [formData, setFormData] = useState({
      nombre: recetaEditando?.nombre || '',
      descripcion: recetaEditando?.descripcion || '',
      categoria: (recetaEditando?.categoria || 'plat-principal') as CategoriaReceta,
      ingredientes: recetaEditando?.ingredientes || [] as IngredienteReceta[],
      productoNombre: recetaEditando?.productoElaborado.nombre || '',
      productoCantidad: recetaEditando?.productoElaborado.cantidad || 1,
      productoUnidad: (recetaEditando?.productoElaborado.unidad || 'pièce') as UnidadMedida,
      productoPesoUnitario: recetaEditando?.productoElaborado.pesoUnitario || 0.5,
      productoDiasConservacion: recetaEditando?.productoElaborado.diasConservacion || 3,
      instrucciones: recetaEditando?.instrucciones || '',
      tiempoPreparacion: recetaEditando?.tiempoPreparacion || 60,
      rendimiento: recetaEditando?.rendimiento || '',
      notasAdicionales: recetaEditando?.notasAdicionales || '',
      activa: recetaEditando?.activa ?? true
    });

    const [nuevoIngrediente, setNuevoIngrediente] = useState({
      productoId: '',
      cantidad: 1,
      unidad: 'kg' as UnidadMedida,
      esOpcional: false,
      notas: ''
    });

    const categorias: { value: CategoriaReceta; label: string }[] = [
      { value: 'plat-principal', label: 'Plat Principal' },
      { value: 'soupe', label: 'Soupe' },
      { value: 'dessert', label: 'Dessert' },
      { value: 'pain', label: 'Pain' },
      { value: 'sauce', label: 'Sauce' },
      { value: 'conserve', label: 'Conserve' },
      { value: 'autre', label: 'Autre' }
    ];

    const unidades: UnidadMedida[] = ['kg', 'g', 'L', 'ml', 'unité', 'pièce'];

    const agregarIngrediente = () => {
      if (!nuevoIngrediente.productoId) {
        toast.error('Sélectionnez un produit');
        return;
      }

      const producto = productos.find(p => p.id === nuevoIngrediente.productoId);
      if (!producto) return;

      const ingrediente: IngredienteReceta = {
        productoId: producto.id,
        productoNombre: producto.nombre,
        cantidad: nuevoIngrediente.cantidad,
        unidad: nuevoIngrediente.unidad,
        esOpcional: nuevoIngrediente.esOpcional,
        notas: nuevoIngrediente.notas
      };

      setFormData({
        ...formData,
        ingredientes: [...formData.ingredientes, ingrediente]
      });

      setNuevoIngrediente({
        productoId: '',
        cantidad: 1,
        unidad: 'kg',
        esOpcional: false,
        notas: ''
      });

      toast.success('Ingrédient ajouté');
    };

    const eliminarIngrediente = (index: number) => {
      setFormData({
        ...formData,
        ingredientes: formData.ingredientes.filter((_, i) => i !== index)
      });
      toast.success('Ingrédient supprimé');
    };

    const guardarReceta = () => {
      if (!formData.nombre.trim()) {
        toast.error('Le nom est requis');
        return;
      }

      if (formData.ingredientes.length === 0) {
        toast.error('Ajoutez au moins un ingrédient');
        return;
      }

      if (!formData.productoNombre.trim()) {
        toast.error('Le nom du produit élaboré est requis');
        return;
      }

      const recetaData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        ingredientes: formData.ingredientes,
        productoElaborado: {
          nombre: formData.productoNombre,
          cantidad: formData.productoCantidad,
          unidad: formData.productoUnidad,
          pesoUnitario: formData.productoPesoUnitario,
          diasConservacion: formData.productoDiasConservacion
        },
        instrucciones: formData.instrucciones,
        tiempoPreparacion: formData.tiempoPreparacion,
        rendimiento: formData.rendimiento,
        notasAdicionales: formData.notasAdicionales,
        activa: formData.activa,
        creadoPor: 'Chef Cuisine',
        ultimaModificacion: undefined
      };

      if (recetaEditando) {
        actualizarReceta(recetaEditando.id, recetaData);
        toast.success('Recette mise à jour');
      } else {
        crearReceta(recetaData);
        toast.success('Recette créée');
      }

      setModalRecetaAbierto(false);
      setRecetaEditando(null);
      cargarDatos();
    };

    if (!modalRecetaAbierto) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#333333]">
              {recetaEditando ? 'Modifier la Recette' : 'Nouvelle Recette'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setModalRecetaAbierto(false);
                setRecetaEditando(null);
              }}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nom de la Recette *</Label>
                <Input
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ex: Soupe aux légumes"
                />
              </div>

              <div>
                <Label>Catégorie *</Label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value as CategoriaReceta })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {categorias.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Description de la recette"
                  rows={2}
                />
              </div>

              <div>
                <Label>Temps de Préparation (minutes)</Label>
                <Input
                  type="number"
                  value={formData.tiempoPreparacion}
                  onChange={(e) => setFormData({ ...formData, tiempoPreparacion: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label>Rendement</Label>
                <Input
                  value={formData.rendimiento}
                  onChange={(e) => setFormData({ ...formData, rendimiento: e.target.value })}
                  placeholder="Ex: 100 portions de 300g"
                />
              </div>
            </div>

            {/* Ingredientes */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-[#333333] mb-4">Ingrédients</h3>
              
              {/* Lista de ingredientes */}
              <div className="space-y-2 mb-4">
                {formData.ingredientes.map((ing, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-[#F4F4F4] rounded-lg">
                    <Package className="w-4 h-4 text-[#1E73BE]" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{ing.productoNombre}</p>
                      <p className="text-xs text-[#666666]">
                        {ing.cantidad} {ing.unidad}
                        {ing.esOpcional && ' (optionnel)'}
                        {ing.notas && ` - ${ing.notas}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => eliminarIngrediente(index)}
                    >
                      <Trash2 className="w-4 h-4 text-[#DC3545]" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Formulario agregar ingrediente */}
              <Card>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div className="md:col-span-2">
                      <Label className="text-xs">Produit</Label>
                      <select
                        value={nuevoIngrediente.productoId}
                        onChange={(e) => setNuevoIngrediente({ ...nuevoIngrediente, productoId: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border rounded-md"
                      >
                        <option value="">Sélectionner...</option>
                        {productos.map(prod => (
                          <option key={prod.id} value={prod.id}>{prod.nombre}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs">Quantité</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={nuevoIngrediente.cantidad}
                        onChange={(e) => setNuevoIngrediente({ ...nuevoIngrediente, cantidad: parseFloat(e.target.value) || 0 })}
                        className="text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Unité</Label>
                      <select
                        value={nuevoIngrediente.unidad}
                        onChange={(e) => setNuevoIngrediente({ ...nuevoIngrediente, unidad: e.target.value as UnidadMedida })}
                        className="w-full px-2 py-1.5 text-sm border rounded-md"
                      >
                        {unidades.map(u => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className="text-xs">Notes</Label>
                      <Input
                        value={nuevoIngrediente.notas}
                        onChange={(e) => setNuevoIngrediente({ ...nuevoIngrediente, notas: e.target.value })}
                        className="text-sm"
                        placeholder="Optionnel"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={agregarIngrediente}
                        className="bg-[#4CAF50] hover:bg-[#45a049] text-white w-full"
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="opcional"
                      checked={nuevoIngrediente.esOpcional}
                      onChange={(e) => setNuevoIngrediente({ ...nuevoIngrediente, esOpcional: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="opcional" className="text-sm cursor-pointer">Ingrédient optionnel</Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Producto elaborado */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-[#333333] mb-4">Produit Élaboré</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nom du Produit *</Label>
                  <Input
                    value={formData.productoNombre}
                    onChange={(e) => setFormData({ ...formData, productoNombre: e.target.value })}
                    placeholder="Ex: Soupe aux légumes (portions)"
                  />
                </div>

                <div>
                  <Label>Quantité Produite</Label>
                  <Input
                    type="number"
                    value={formData.productoCantidad}
                    onChange={(e) => setFormData({ ...formData, productoCantidad: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label>Unité</Label>
                  <select
                    value={formData.productoUnidad}
                    onChange={(e) => setFormData({ ...formData, productoUnidad: e.target.value as UnidadMedida })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    {unidades.map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Poids Unitaire (kg)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.productoPesoUnitario}
                    onChange={(e) => setFormData({ ...formData, productoPesoUnitario: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label>Jours de Conservation</Label>
                  <Input
                    type="number"
                    value={formData.productoDiasConservacion}
                    onChange={(e) => setFormData({ ...formData, productoDiasConservacion: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="border-t pt-6">
              <Label>Instructions de Préparation</Label>
              <Textarea
                value={formData.instrucciones}
                onChange={(e) => setFormData({ ...formData, instrucciones: e.target.value })}
                rows={5}
                placeholder="Étapes de préparation..."
              />
            </div>

            {/* Notes adicionales */}
            <div>
              <Label>Notes Additionnelles</Label>
              <Textarea
                value={formData.notasAdicionales}
                onChange={(e) => setFormData({ ...formData, notasAdicionales: e.target.value })}
                rows={2}
                placeholder="Informations supplémentaires"
              />
            </div>

            {/* Estado activo */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="activa"
                checked={formData.activa}
                onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="activa" className="cursor-pointer">Recette active</Label>
            </div>
          </div>

          {/* Footer con botones */}
          <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setModalRecetaAbierto(false);
                setRecetaEditando(null);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={guardarReceta}
              className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {recetaEditando ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== MODAL TRANSFORMACION ====================
  const ModalTransformacion = () => {
    const recetasActivas = recetas.filter(r => r.activa);
    const [recetaSeleccionada, setRecetaSeleccionada] = useState<Receta | null>(
      transformacionEditando 
        ? recetas.find(r => r.id === transformacionEditando.recetaId) || null
        : null
    );

    const [formData, setFormData] = useState({
      fecha: transformacionEditando?.fecha || new Date().toISOString().split('T')[0],
      estado: (transformacionEditando?.estado || 'planifiée') as EstadoTransformacion,
      responsable: transformacionEditando?.responsable || '',
      ayudantes: transformacionEditando?.ayudantes?.join(', ') || '',
      observaciones: transformacionEditando?.observaciones || '',
      incidencias: transformacionEditando?.incidencias || '',
      cantidadMultiplicador: 1
    });

    const estados: { value: EstadoTransformacion; label: string; color: string }[] = [
      { value: 'planifiée', label: 'Planifiée', color: 'text-[#1E73BE]' },
      { value: 'en-cours', label: 'En Cours', color: 'text-[#FFC107]' },
      { value: 'terminée', label: 'Terminée', color: 'text-[#4CAF50]' },
      { value: 'annulée', label: 'Annulée', color: 'text-[#DC3545]' }
    ];

    const guardarTransformacion = () => {
      if (!recetaSeleccionada) {
        toast.error('Sélectionnez une recette');
        return;
      }

      if (!formData.responsable.trim()) {
        toast.error('Le responsable est requis');
        return;
      }

      const fechaElaboracion = formData.fecha;
      const fechaCaducidad = new Date(fechaElaboracion);
      fechaCaducidad.setDate(fechaCaducidad.getDate() + recetaSeleccionada.productoElaborado.diasConservacion);

      const lote = `LOT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      const transformacionData: Omit<Transformacion, 'id' | 'numeroTransformacion'> = {
        recetaId: recetaSeleccionada.id,
        recetaNombre: recetaSeleccionada.nombre,
        fecha: formData.fecha,
        estado: formData.estado,
        ingredientesUsados: recetaSeleccionada.ingredientes.map(ing => ({
          productoId: ing.productoId,
          productoNombre: ing.productoNombre,
          cantidadPlanificada: ing.cantidad * formData.cantidadMultiplicador,
          cantidadReal: ing.cantidad * formData.cantidadMultiplicador,
          unidad: ing.unidad,
          lote: ''
        })),
        productosGenerados: [{
          nombre: recetaSeleccionada.productoElaborado.nombre,
          cantidadPlanificada: recetaSeleccionada.productoElaborado.cantidad * formData.cantidadMultiplicador,
          cantidadReal: recetaSeleccionada.productoElaborado.cantidad * formData.cantidadMultiplicador,
          unidad: recetaSeleccionada.productoElaborado.unidad,
          pesoTotal: recetaSeleccionada.productoElaborado.pesoUnitario * recetaSeleccionada.productoElaborado.cantidad * formData.cantidadMultiplicador,
          fechaElaboracion,
          fechaCaducidad: fechaCaducidad.toISOString().split('T')[0],
          lote
        }],
        mermas: [],
        responsable: formData.responsable,
        ayudantes: formData.ayudantes.split(',').map(a => a.trim()).filter(a => a),
        observaciones: formData.observaciones,
        incidencias: formData.incidencias,
        fechaInicio: formData.estado === 'en-cours' || formData.estado === 'terminée' ? new Date().toISOString() : undefined,
        fechaFin: formData.estado === 'terminée' ? new Date().toISOString() : undefined
      };

      if (transformacionEditando) {
        actualizarTransformacion(transformacionEditando.id, transformacionData);
        toast.success('Transformation mise à jour');
      } else {
        crearTransformacion(transformacionData);
        toast.success('Transformation enregistrée');
      }

      setModalTransformacionAbierto(false);
      setTransformacionEditando(null);
      cargarDatos();
    };

    if (!modalTransformacionAbierto) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#333333]">
              {transformacionEditando ? 'Modifier la Transformation' : 'Nouvelle Transformation'}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setModalTransformacionAbierto(false);
                setTransformacionEditando(null);
              }}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Selección de receta */}
            <div>
              <Label>Recette *</Label>
              <select
                value={recetaSeleccionada?.id || ''}
                onChange={(e) => {
                  const receta = recetasActivas.find(r => r.id === e.target.value);
                  if (receta) {
                    console.log('Receta seleccionada:', receta);
                    console.log('Ingredientes:', receta.ingredientes);
                  }
                  setRecetaSeleccionada(receta || null);
                }}
                className="w-full px-3 py-2 border rounded-md"
                disabled={!!transformacionEditando}
              >
                <option value="">Sélectionner une recette...</option>
                {recetasActivas.map(receta => (
                  <option key={receta.id} value={receta.id}>
                    {receta.nombre} - {receta.rendimiento}
                  </option>
                ))}
              </select>
            </div>

            {/* Información de la receta seleccionada */}
            {recetaSeleccionada && (
              <Card className="bg-[#F4F4F4]">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-[#333333] mb-2">Détails de la Recette</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[#666666]">Catégorie:</p>
                      <p className="font-medium">{recetaSeleccionada.categoria}</p>
                    </div>
                    <div>
                      <p className="text-[#666666]">Temps:</p>
                      <p className="font-medium">{recetaSeleccionada.tiempoPreparacion} min</p>
                    </div>
                    <div>
                      <p className="text-[#666666]">Ingrédients:</p>
                      <p className="font-medium">{recetaSeleccionada.ingredientes.length}</p>
                    </div>
                    <div>
                      <p className="text-[#666666]">Rendement:</p>
                      <p className="font-medium">{recetaSeleccionada.rendimiento}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Date de Production *</Label>
                <Input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>

              <div>
                <Label>État *</Label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as EstadoTransformacion })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {estados.map(est => (
                    <option key={est.value} value={est.value}>{est.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Responsable *</Label>
                <Input
                  value={formData.responsable}
                  onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
                  placeholder="Nom du chef responsable"
                />
              </div>

              <div>
                <Label>Multiplicateur de Quantité</Label>
                <Input
                  type="number"
                  min="1"
                  step="0.5"
                  value={formData.cantidadMultiplicador}
                  onChange={(e) => setFormData({ ...formData, cantidadMultiplicador: parseFloat(e.target.value) || 1 })}
                />
                <p className="text-xs text-[#666666] mt-1">
                  1 = quantité normale, 2 = double, 0.5 = moitié
                </p>
              </div>

              <div className="md:col-span-2">
                <Label>Assistants (séparés par virgules)</Label>
                <Input
                  value={formData.ayudantes}
                  onChange={(e) => setFormData({ ...formData, ayudantes: e.target.value })}
                  placeholder="Ex: Marie, Jean, Sophie"
                />
              </div>

              <div className="md:col-span-2">
                <Label>Observations</Label>
                <Textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  rows={3}
                  placeholder="Notes sur la production..."
                />
              </div>

              {/* Campo de ingredientes de solo lectura */}
              {recetaSeleccionada && (
                <div className="md:col-span-2">
                  <Label className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-[#4CAF50]" />
                    Ingrédients de la Recette
                    <Badge variant="outline" className="ml-2 text-xs">
                      {recetaSeleccionada.ingredientes.length} ingrédients
                    </Badge>
                  </Label>
                  <Textarea
                    value={recetaSeleccionada.ingredientes
                      .map(ing => {
                        const nombre = ing.productoNombre || `Produit ID: ${ing.productoId}`;
                        console.log('Ingrediente:', ing);
                        return `${nombre} (${ing.cantidad} ${ing.unidad})`;
                      })
                      .join(', ')}
                    readOnly
                    rows={3}
                    className="bg-gray-50 text-gray-700 cursor-default resize-none"
                    placeholder="Sélectionnez une recette pour voir les ingrédients..."
                  />
                  <p className="text-xs text-[#666666] mt-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Liste automatique des ingrédients (lecture seule)
                  </p>
                </div>
              )}

              <div className="md:col-span-2">
                <Label>Incidents / Problèmes</Label>
                <Textarea
                  value={formData.incidencias}
                  onChange={(e) => setFormData({ ...formData, incidencias: e.target.value })}
                  rows={2}
                  placeholder="Problèmes rencontrés (optionnel)"
                />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white border-t p-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setModalTransformacionAbierto(false);
                setTransformacionEditando(null);
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={guardarTransformacion}
              className="bg-[#FF6B35] hover:bg-[#FF5722] text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {transformacionEditando ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard principal
  const renderDashboard = () => (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo degradado con colores del branding */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`
        }}
      />
      
      {/* Formas decorativas animadas */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full opacity-20 animate-pulse"
          style={{
            top: '-10%',
            right: '-10%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full opacity-20 animate-pulse"
          style={{
            bottom: '-15%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
            animation: 'pulse 5s ease-in-out infinite',
            animationDelay: '1s'
          }}
        />
        <div 
          className="absolute w-64 h-64 rounded-full opacity-10"
          style={{
            top: '50%',
            right: '20%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
            animation: 'pulse 6s ease-in-out infinite',
            animationDelay: '2s'
          }}
        />
      </div>

      {/* Contenido con z-index superior */}
      <div className="relative z-10 p-4 sm:p-6 space-y-4 sm:space-y-6">
        {renderHeader('Cuisine et Transformation', <ChefHat className="w-8 h-8" style={{ color: branding.primaryColor }} />)}

        {/* Estadísticas principales con glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border-l-4" style={{ borderLeftColor: '#4CAF50' }}>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-[#4CAF50]" />
              <p className="text-sm font-medium text-gray-700">Recettes Actives</p>
            </div>
            <div className="text-3xl font-bold text-[#4CAF50]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {estadisticas?.recetasActivas || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">sur {estadisticas?.totalRecetas || 0} recettes totales</p>
          </div>

          <div className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-l-[#FF6B35]">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList className="w-5 h-5 text-[#FF6B35]" />
              <p className="text-sm font-medium text-gray-700">Transformations ce mois</p>
            </div>
            <div className="text-3xl font-bold text-[#FF6B35]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {estadisticas?.transformacionesMes || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {estadisticas?.transformacionesCompletadas || 0} terminées
            </p>
          </div>

          <div className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border-l-4" style={{ borderLeftColor: branding.primaryColor }}>
            <div className="flex items-center gap-2 mb-2">
              <PlayCircle className="w-5 h-5" style={{ color: branding.primaryColor }} />
              <p className="text-sm font-medium text-gray-700">En Production</p>
            </div>
            <div className="text-3xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
              {estadisticas?.transformacionesEnCurso || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">transformations en cours</p>
          </div>

          <div className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-l-[#9C27B0]">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-5 h-5 text-[#9C27B0]" />
              <p className="text-sm font-medium text-gray-700">Production (kg)</p>
            </div>
            <div className="text-3xl font-bold text-[#9C27B0]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {estadisticas?.totalKgElaborados?.toFixed(1) || '0.0'}
            </div>
            <p className="text-xs text-gray-600 mt-1">kg élaborés ce mois</p>
          </div>
        </div>

        {/* Menú de acciones principales con glassmorphism */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border border-white/40 hover:shadow-2xl transition-all cursor-pointer hover:scale-105"
            onClick={() => setVistaActual('recetas')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#4CAF5020' }}>
                <BookOpen className="w-6 h-6 text-[#4CAF50]" />
              </div>
              <h3 className="text-lg font-bold text-[#4CAF50]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Gestion des Recettes
              </h3>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Créer et gérer les recettes de production. Définir ingrédients, quantités et instructions.
            </p>
            <Badge variant="outline" className="text-[#4CAF50] border-[#4CAF50]">
              {estadisticas?.recetasActivas || 0} recettes disponibles
            </Badge>
          </div>

          <div 
            className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border border-white/40 hover:shadow-2xl transition-all cursor-pointer hover:scale-105"
            onClick={() => setVistaActual('transformaciones')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#FF6B3520' }}>
                <ClipboardList className="w-6 h-6 text-[#FF6B35]" />
              </div>
              <h3 className="text-lg font-bold text-[#FF6B35]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Registre des Transformations
              </h3>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Enregistrer les transformations réalisées. Traçabilité complète des productions.
            </p>
            <Badge variant="outline" className="text-[#FF6B35] border-[#FF6B35]">
              {estadisticas?.transformacionesMes || 0} ce mois
            </Badge>
          </div>

          <div 
            className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border border-white/40 hover:shadow-2xl transition-all cursor-pointer hover:scale-105"
            onClick={() => setVistaActual('produccion')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${branding.primaryColor}20` }}>
                <Calendar className="w-6 h-6" style={{ color: branding.primaryColor }} />
              </div>
              <h3 className="text-lg font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                Planification Production
              </h3>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Planifier les productions quotidiennes et hebdomadaires.
            </p>
            <Badge variant="outline" style={{ color: branding.primaryColor, borderColor: branding.primaryColor }}>
              Calendrier de production
            </Badge>
          </div>

          <div 
            className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border border-white/40 hover:shadow-2xl transition-all cursor-pointer hover:scale-105"
            onClick={() => setVistaActual('inventario')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#9C27B020' }}>
                <Package className="w-6 h-6 text-[#9C27B0]" />
              </div>
              <h3 className="text-lg font-bold text-[#9C27B0]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Inventaire Cuisine</h3>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Consulter les stocks disponibles pour la production.
            </p>
            <Badge variant="outline" className="text-[#9C27B0] border-[#9C27B0]">
              Stock temps réel
            </Badge>
          </div>

          <div 
            className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border border-white/40 hover:shadow-2xl transition-all cursor-pointer hover:scale-105"
            onClick={() => setVistaActual('estadisticas')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${branding.secondaryColor}20` }}>
                <BarChart3 className="w-6 h-6" style={{ color: branding.secondaryColor }} />
              </div>
              <h3 className="text-lg font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.secondaryColor }}>
                Statistiques
              </h3>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Analyses et rapports de production détaillés.
            </p>
            <Badge variant="outline" style={{ color: branding.secondaryColor, borderColor: branding.secondaryColor }}>
              Tableaux de bord
            </Badge>
          </div>

          <div 
            className="backdrop-blur-lg bg-white/80 rounded-xl shadow-lg p-4 sm:p-6 border border-white/40 hover:shadow-2xl transition-all cursor-pointer hover:scale-105"
            onClick={() => setVistaActual('contactos')}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3B82F620' }}>
                <Users className="w-6 h-6 text-[#3B82F6]" />
              </div>
              <h3 className="text-lg font-bold text-[#3B82F6]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Gestion des Contacts
              </h3>
            </div>
            <p className="text-sm text-gray-700 mb-3">
              Gérer les bénévoles, PTC, employés et programmes.
            </p>
            <Badge variant="outline" className="text-[#3B82F6] border-[#3B82F6]">
              Contacts du département
            </Badge>
          </div>
        </div>

        {/* Botón de retour */}
        {onNavigate && (
          <div className="flex justify-center mt-6">
            <Button
              onClick={() => onNavigate('departamentos')}
              className="text-white"
              style={{ backgroundColor: branding.primaryColor }}
            >
              <Home className="w-4 h-4 mr-2" />
              Retour aux Départements
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Vista de Recetas (continuará en próximo mensaje debido a límite de caracteres...)
  const renderRecetas = () => {
    const recetasFiltradas = recetas.filter(receta => {
      const coincideBusqueda = receta.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                               receta.descripcion.toLowerCase().includes(busqueda.toLowerCase());
      const coincideCategoria = filtroCategoria === 'todas' || receta.categoria === filtroCategoria;
      return coincideBusqueda && coincideCategoria;
    });

    return (
      <div className="p-6 space-y-6">
        <BoutonRetourHeader 
          onClick={() => setVistaActual('dashboard')} 
          titre="Gestion des Recettes"
        />
        {renderHeader('Gestion des Recettes', <BookOpen className="w-8 h-8 text-[#4CAF50]" />)}
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
              <Input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Rechercher..."
                className="pl-10"
              />
            </div>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value as any)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="todas">Toutes catégories</option>
              <option value="plat-principal">Plat Principal</option>
              <option value="soupe">Soupe</option>
              <option value="dessert">Dessert</option>
              <option value="pain">Pain</option>
              <option value="sauce">Sauce</option>
              <option value="conserve">Conserve</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <Button
            onClick={() => {
              setRecetaEditando(null);
              setModalRecetaAbierto(true);
            }}
            className="bg-[#4CAF50] hover:bg-[#45a049] text-white w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Recette
          </Button>
        </div>

        <p className="text-[#666666]">{recetasFiltradas.length} recette(s)</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recetasFiltradas.map((receta) => (
            <Card key={receta.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{receta.nombre}</CardTitle>
                    <p className="text-xs text-[#666666] mt-1">{receta.codigo}</p>
                  </div>
                  <Badge variant="outline" className={receta.activa ? 'border-[#4CAF50] text-[#4CAF50]' : 'border-gray-400 text-gray-400'}>
                    {receta.activa ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#666666] mb-3 line-clamp-2">{receta.descripcion}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-[#666666]">
                    <Utensils className="w-4 h-4" />
                    <span>{receta.categoria}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#666666]">
                    <Clock className="w-4 h-4" />
                    <span>{receta.tiempoPreparacion} min</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#666666]">
                    <Package className="w-4 h-4" />
                    <span>{receta.ingredientes.length} ingrédients</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-medium text-[#333333] mb-1">Produit élaboré:</p>
                  <p className="text-sm text-[#666666]">{receta.productoElaborado.nombre}</p>
                  <p className="text-xs text-[#666666]">{receta.rendimiento}</p>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="sm"
                    onClick={() => {
                      setRecetaParaEtiquetar(receta);
                      setModalEtiquetaAbierto(true);
                    }}
                  >
                    <Printer className="w-4 h-4 mr-1" />
                    Étiquette
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRecetaEditando(receta);
                      setModalRecetaAbierto(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const duplicada = duplicarReceta(receta.id);
                      if (duplicada) {
                        toast.success('Recette dupliquée');
                        cargarDatos();
                      }
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (confirm('Supprimer cette recette?')) {
                        eliminarReceta(receta.id);
                        toast.success('Recette supprimée');
                        cargarDatos();
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-[#DC3545]" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {recetasFiltradas.length === 0 && (
          <Card className="p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-[#CCCCCC]" />
            <h3 className="text-xl font-semibold text-[#333333] mb-2">
              {busqueda || filtroCategoria !== 'todas' ? 'Aucun résultat' : 'Aucune recette'}
            </h3>
            <p className="text-[#666666] mb-4">
              {busqueda || filtroCategoria !== 'todas' 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par créer votre première recette'
              }
            </p>
            {!busqueda && filtroCategoria === 'todas' && (
              <Button
                onClick={() => {
                  setRecetaEditando(null);
                  setModalRecetaAbierto(true);
                }}
                className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer une recette
              </Button>
            )}
          </Card>
        )}
      </div>
    );
  };

  // Vista de Transformaciones
  const renderTransformaciones = () => {
    const transformacionesFiltradas = transformaciones.filter(trans => {
      const coincideBusqueda = trans.recetaNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                               trans.numeroTransformacion.toLowerCase().includes(busqueda.toLowerCase());
      const coincideEstado = filtroEstado === 'todos' || trans.estado === filtroEstado;
      return coincideBusqueda && coincideEstado;
    });

    return (
      <div className="p-6 space-y-6">
        <BoutonRetourHeader 
          onClick={() => setVistaActual('dashboard')} 
          titre="Registre des Transformations"
        />
        {renderHeader('Registre des Transformations', <ClipboardList className="w-8 h-8 text-[#FF6B35]" />)}
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666666]" />
              <Input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Rechercher..."
                className="pl-10"
              />
            </div>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as any)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="todos">Tous états</option>
              <option value="planifiée">Planifiée</option>
              <option value="en-cours">En Cours</option>
              <option value="terminée">Terminée</option>
              <option value="annulée">Annulée</option>
            </select>
          </div>
          <Button
            onClick={() => {
              setTransformacionEditando(null);
              setModalTransformacionAbierto(true);
            }}
            className="bg-[#FF6B35] hover:bg-[#FF5722] text-white w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Transformation
          </Button>
        </div>

        <p className="text-[#666666]">{transformacionesFiltradas.length} transformation(s)</p>

        {transformacionesFiltradas.length > 0 ? (
          <div className="space-y-3">
            {transformacionesFiltradas.map((trans) => (
              <Card key={trans.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-[#333333]">{trans.recetaNombre}</h3>
                        <Badge
                          variant="outline"
                          className={
                            trans.estado === 'terminée' ? 'border-[#4CAF50] text-[#4CAF50]' :
                            trans.estado === 'en-cours' ? 'border-[#FFC107] text-[#FFC107]' :
                            trans.estado === 'planifiée' ? 'border-[#1E73BE] text-[#1E73BE]' :
                            'border-[#DC3545] text-[#DC3545]'
                          }
                        >
                          {trans.estado}
                        </Badge>
                      </div>
                      
                      {/* Botones de cambio rápido de estado */}
                      {(trans.estado === 'planifiée' || trans.estado === 'en-cours') && (
                        <div className="flex items-center gap-2 mb-3">
                          {trans.estado === 'planifiée' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                actualizarTransformacion(trans.id, { estado: 'en-cours' });
                                toast.success('État changé: En Cours');
                                cargarDatos();
                              }}
                              className="bg-[#FFC107] hover:bg-[#FFB300] text-white text-xs px-3 py-1.5 h-8"
                            >
                              <PlayCircle className="w-3 h-3 mr-1" />
                              Démarrer
                            </Button>
                          )}
                          {trans.estado === 'en-cours' && (
                            <Button
                              size="sm"
                              onClick={() => {
                                actualizarTransformacion(trans.id, { estado: 'terminée' });
                                toast.success('Transformation terminée!');
                                cargarDatos();
                              }}
                              className="bg-[#4CAF50] hover:bg-[#45a049] text-white text-xs px-3 py-1.5 h-8"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Terminer
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm('Annuler cette transformation?')) {
                                actualizarTransformacion(trans.id, { estado: 'annulée' });
                                toast.info('Transformation annulée');
                                cargarDatos();
                              }
                            }}
                            className="border-[#DC3545] text-[#DC3545] hover:bg-[#DC3545] hover:text-white text-xs px-3 py-1.5 h-8"
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Annuler
                          </Button>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#666666] mb-3">
                        <span className="font-medium">{trans.numeroTransformacion}</span>
                        <span>•</span>
                        <span>{new Date(trans.fecha).toLocaleDateString('fr-FR')}</span>
                        <span>•</span>
                        <span>Chef: {trans.responsable}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-[#666666]">Produits générés:</p>
                          <p className="font-medium text-[#333333]">
                            {trans.productosGenerados[0]?.cantidadReal || 0} {trans.productosGenerados[0]?.unidad || ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#666666]">Poids total:</p>
                          <p className="font-medium text-[#333333]">
                            {formatQuantity(trans.productosGenerados[0]?.pesoTotal || 0)} kg
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-[#666666]">Lot:</p>
                          <p className="font-medium text-[#333333]">
                            {trans.productosGenerados[0]?.lote || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {trans.observaciones && (
                        <p className="text-sm text-[#666666] mt-3 italic">
                          {trans.observaciones}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setTransformacionEditando(trans);
                          setModalTransformacionAbierto(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Supprimer cette transformation?')) {
                            eliminarTransformacion(trans.id);
                            toast.success('Transformation supprimée');
                            cargarDatos();
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-[#DC3545]" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <ClipboardList className="w-16 h-16 mx-auto mb-4 text-[#CCCCCC]" />
            <h3 className="text-xl font-semibold text-[#333333] mb-2">
              {busqueda || filtroEstado !== 'todos' ? 'Aucun résultat' : 'Aucune transformation'}
            </h3>
            <p className="text-[#666666] mb-4">
              {busqueda || filtroEstado !== 'todos'
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par enregistrer une transformation'
              }
            </p>
            {!busqueda && filtroEstado === 'todos' && (
              <Button
                onClick={() => {
                  setTransformacionEditando(null);
                  setModalTransformacionAbierto(true);
                }}
                className="bg-[#FF6B35] hover:bg-[#FF5722] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle Transformation
              </Button>
            )}
          </Card>
        )}
      </div>
    );
  };

  // Vista de Producción
  const renderProduccion = () => {
    const hoy = new Date();
    const transformacionesHoy = transformaciones.filter(t => {
      const fecha = new Date(t.fecha);
      return fecha.toDateString() === hoy.toDateString();
    });

    const transformacionesSemana = transformaciones.filter(t => {
      const fecha = new Date(t.fecha);
      const diff = Math.floor((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 7;
    });

    return (
      <div className="p-6 space-y-6">
        <BoutonRetourHeader 
          onClick={() => setVistaActual('dashboard')} 
          titre="Planification de Production"
        />
        {renderHeader('Planification de Production', <Calendar className="w-8 h-8 text-[#1E73BE]" />)}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-l-4 border-l-[#4CAF50]">
            <CardHeader>
              <CardTitle className="text-lg">Production Aujourd'hui</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#4CAF50] mb-2">
                {transformacionesHoy.length}
              </div>
              <p className="text-sm text-[#666666]">transformation(s) planifiée(s)</p>
              
              {transformacionesHoy.length > 0 && (
                <div className="mt-4 space-y-2">
                  {transformacionesHoy.map(trans => (
                    <div key={trans.id} className="text-sm p-2 bg-[#F4F4F4] rounded">
                      <p className="font-medium">{trans.recetaNombre}</p>
                      <p className="text-xs text-[#666666]">{trans.responsable}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#1E73BE]">
            <CardHeader>
              <CardTitle className="text-lg">Production Cette Semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#1E73BE] mb-2">
                {transformacionesSemana.length}
              </div>
              <p className="text-sm text-[#666666]">transformation(s) à venir</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Calendrier de Production</CardTitle>
              <Button
                onClick={() => {
                  setTransformacionEditando(null);
                  setModalTransformacionAbierto(true);
                }}
                className="bg-[#1E73BE] hover:bg-[#1a5fa0] text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Planifier
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transformacionesSemana.length > 0 ? (
                transformacionesSemana.map(trans => (
                  <div key={trans.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#1E73BE]">
                          {new Date(trans.fecha).getDate()}
                        </div>
                        <div className="text-xs text-[#666666]">
                          {new Date(trans.fecha).toLocaleDateString('fr-FR', { month: 'short' })}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-[#333333]">{trans.recetaNombre}</p>
                        <p className="text-sm text-[#666666]">Chef: {trans.responsable}</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        trans.estado === 'terminée' ? 'border-[#4CAF50] text-[#4CAF50]' :
                        trans.estado === 'en-cours' ? 'border-[#FFC107] text-[#FFC107]' :
                        'border-[#1E73BE] text-[#1E73BE]'
                      }
                    >
                      {trans.estado}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[#666666]">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucune production planifiée pour cette semaine</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Vista de Inventario
  const renderInventario = () => (
    <div className="p-6 space-y-6">
      <BoutonRetourHeader 
        onClick={() => setVistaActual('dashboard')} 
        titre="Inventaire Cuisine"
      />
      {renderHeader('Inventaire Cuisine', <Package className="w-8 h-8 text-[#9C27B0]" />)}
      <InventarioCocina />
    </div>
  );

  // Vista de Estadísticas
  const renderEstadisticas = () => {
    const transformacionesPorReceta = recetas.map(receta => ({
      receta: receta.nombre,
      cantidad: transformaciones.filter(t => t.recetaId === receta.id && t.estado === 'terminée').length
    })).filter(r => r.cantidad > 0).sort((a, b) => b.cantidad - a.cantidad);

    const produccionPorMes = Array.from({ length: 12 }, (_, i) => {
      const mes = i + 1;
      const trans = transformaciones.filter(t => {
        const fecha = new Date(t.fecha);
        return fecha.getMonth() + 1 === mes && t.estado === 'terminée';
      });
      const kg = trans.reduce((sum, t) => 
        sum + t.productosGenerados.reduce((s, p) => s + p.pesoTotal, 0), 0
      );
      return {
        mes: new Date(2024, i).toLocaleDateString('fr-FR', { month: 'short' }),
        kg: kg.toFixed(1),
        transformaciones: trans.length
      };
    });

    return (
      <div className="p-6 space-y-6">
        <BoutonRetourHeader 
          onClick={() => setVistaActual('dashboard')} 
          titre="Statistiques de Production"
        />
        {renderHeader('Statistiques de Production', <BarChart3 className="w-8 h-8 text-[#FFC107]" />)}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Recettes les Plus Utilisées</CardTitle>
            </CardHeader>
            <CardContent>
              {transformacionesPorReceta.length > 0 ? (
                <div className="space-y-3">
                  {transformacionesPorReceta.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#4CAF50] text-white flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-[#333333]">{item.receta}</span>
                      </div>
                      <Badge variant="outline" className="text-[#4CAF50] border-[#4CAF50]">
                        {item.cantidad} fois
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-[#666666] py-8">Aucune donnée disponible</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Production par Mois</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {produccionPorMes.filter(m => parseFloat(m.kg) > 0).slice(-6).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2">
                    <span className="text-sm font-medium text-[#333333]">{item.mes}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#666666]">{item.transformaciones} trans.</span>
                      <Badge variant="outline" className="text-[#9C27B0] border-[#9C27B0]">
                        {item.kg} kg
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Résumé Général</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-[#F4F4F4] rounded-lg">
                <div className="text-3xl font-bold text-[#4CAF50]">{recetas.length}</div>
                <p className="text-sm text-[#666666] mt-1">Recettes totales</p>
              </div>
              <div className="text-center p-4 bg-[#F4F4F4] rounded-lg">
                <div className="text-3xl font-bold text-[#FF6B35]">{transformaciones.length}</div>
                <p className="text-sm text-[#666666] mt-1">Transformations</p>
              </div>
              <div className="text-center p-4 bg-[#F4F4F4] rounded-lg">
                <div className="text-3xl font-bold text-[#1E73BE]">
                  {transformaciones.filter(t => t.estado === 'terminée').length}
                </div>
                <p className="text-sm text-[#666666] mt-1">Terminées</p>
              </div>
              <div className="text-center p-4 bg-[#F4F4F4] rounded-lg">
                <div className="text-3xl font-bold text-[#9C27B0]">
                  {estadisticas?.totalKgElaborados?.toFixed(0) || 0}
                </div>
                <p className="text-sm text-[#666666] mt-1">kg produits</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Vista de Pérdidas
  const renderPerdidas = () => {
    const transformacionesConMermas = transformaciones.filter(t => 
      t.mermas && t.mermas.length > 0
    );

    const totalMermas = transformacionesConMermas.reduce((sum, t) => 
      sum + (t.mermas?.length || 0), 0
    );

    return (
      <div className="p-6 space-y-6">
        <BoutonRetourHeader 
          onClick={() => setVistaActual('dashboard')} 
          titre="Gestion des Pertes et Mermas"
        />
        {renderHeader('Gestion des Pertes et Mermas', <AlertTriangle className="w-8 h-8 text-[#DC3545]" />)}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="border-l-4 border-l-[#DC3545]">
            <CardHeader>
              <CardTitle className="text-lg">Transformations avec Pertes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#DC3545] mb-2">
                {transformacionesConMermas.length}
              </div>
              <p className="text-sm text-[#666666]">
                sur {transformaciones.length} transformations
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#FF9800]">
            <CardHeader>
              <CardTitle className="text-lg">Total de Pertes Enregistrées</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-[#FF9800] mb-2">
                {totalMermas}
              </div>
              <p className="text-sm text-[#666666]">incidents</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Détail des Pertes</CardTitle>
          </CardHeader>
          <CardContent>
            {transformacionesConMermas.length > 0 ? (
              <div className="space-y-4">
                {transformacionesConMermas.map(trans => (
                  <div key={trans.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-[#333333]">{trans.recetaNombre}</h4>
                        <p className="text-sm text-[#666666]">
                          {trans.numeroTransformacion} • {new Date(trans.fecha).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-[#DC3545] text-[#DC3545]">
                        {trans.mermas?.length || 0} perte(s)
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {trans.mermas?.map((merma, index) => (
                        <div key={index} className="bg-[#FFEBEE] p-3 rounded">
                          <p className="font-medium text-[#DC3545]">{merma.descripcion}</p>
                          <p className="text-sm text-[#666666] mt-1">
                            Quantité: {merma.cantidad} {merma.unidad}
                          </p>
                          <p className="text-sm text-[#666666]">
                            Motif: {merma.motivo}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#666666]">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-[#4CAF50] opacity-50" />
                <p>Aucune perte enregistrée</p>
                <p className="text-sm mt-1">Excellente gestion de la production!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Renderizar vista actual
  const renderVistaActual = () => {
    switch (vistaActual) {
      case 'dashboard':
        return renderDashboard();
      case 'recetas':
        return renderRecetas();
      case 'transformaciones':
        return renderTransformaciones();
      case 'produccion':
        return renderProduccion();
      case 'inventario':
        return renderInventario();
      case 'estadisticas':
        return renderEstadisticas();
      case 'perdidas':
        return renderPerdidas();
      case 'contactos':
        return renderContactos();
      default:
        return renderDashboard();
    }
  };

  // Renderizar vista de contactos
  const renderContactos = () => (
    <div className="p-6 space-y-6">
      <BoutonRetourHeader 
        onClick={() => setVistaActual('dashboard')} 
        titre="Gestion des Contacts"
      />
      <GestionContactosDepartamento 
        departamentoId="3"
        departamentoNombre="Cuisine"
      />
    </div>
  );

  return (
    <div className={vistaActual === 'dashboard' ? 'min-h-screen' : 'min-h-screen bg-[#F4F4F4]'}>
      {renderVistaActual()}
      <ModalReceta />
      <ModalTransformacion />
      <EtiquetaReceta
        open={modalEtiquetaAbierto}
        onOpenChange={setModalEtiquetaAbierto}
        receta={recetaParaEtiquetar}
      />
    </div>
  );
}
