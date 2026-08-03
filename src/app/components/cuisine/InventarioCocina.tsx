import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Package, Search, Edit, Trash2, AlertCircle, TrendingDown,
  Plus, Scale, RefreshCw, ShoppingCart, Eye,
  Refrigerator, Snowflake, Sun, Leaf, HelpCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { QuantityInput, parseQuantityText } from '../ui/quantity-input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { IconSelector } from '../ui/IconSelector';
import { toast } from 'sonner';
import {
  obtenerInventarioCocina,
  ajustarStock,
  registrarMerma,
  eliminarProductoInventario,
  obtenerMovimientosPorProducto,
  obtenerEstadisticasInventarioCocina,
  crearProductoInventarioCocina,
  obtenerCategoriasProductosCocina,
  crearCategoriaProductoCocina,
  consumirProducto,
  type ProductoInventarioCocina,
  type MovimientoStock
} from '../../utils/inventarioCocinaStorage';
import { guardarProducto } from '../../utils/productStorage';
import { generarIconoProducto, sugerirIconos } from '../../utils/iconoUtils';
import { obtenerRecetas, type Receta } from '../../utils/recetaStorage';

interface InventarioCocinaProps {
  onProductoCreado?: () => void;
}

export function InventarioCocina({ onProductoCreado }: InventarioCocinaProps) {
  const { t } = useTranslation();
  const [inventario, setInventario] = useState<ProductoInventarioCocina[]>([]);
  const [inventarioFiltrado, setInventarioFiltrado] = useState<ProductoInventarioCocina[]>([]);
  const [estadisticas, setEstadisticas] = useState<any>(null);
  
  // Estados de filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroZona, setFiltroZona] = useState<string>('todas');
  const [filtroAlerta, setFiltroAlerta] = useState(false);
  const [ordenamiento, setOrdenamiento] = useState<'nombre' | 'stock' | 'fecha'>('nombre');
  
  // Estados de modales
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoInventarioCocina | null>(null);
  const [modalAjustarOpen, setModalAjustarOpen] = useState(false);
  const [modalMermaOpen, setModalMermaOpen] = useState(false);
  const [modalMovimientosOpen, setModalMovimientosOpen] = useState(false);
  const [modalCrearOpen, setModalCrearOpen] = useState(false);
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
  const [categoriasProductos, setCategoriasProductos] = useState<string[]>(() => obtenerCategoriasProductosCocina());
  const [mostrarCampoNuevaCategoria, setMostrarCampoNuevaCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState('');
   
  // Estados de formularios
  const [nuevoStock, setNuevoStock] = useState(0);
  const [nuevoProductoForm, setNuevoProductoForm] = useState({
    nombre: '',
    codigo: '',
    categoria: 'Autre',
    unidad: 'kg' as string,
    stockActual: 0,
    stockMinimo: 0,
    zona: 'seco' as 'refrigerado' | 'congelado' | 'seco' | 'fresco' | '',
    icono: '📦',
    notas: ''
  });
  const [motivoAjuste, setMotivoAjuste] = useState('');
  const [cantidadMerma, setCantidadMerma] = useState(0);
  const [motivoMerma, setMotivoMerma] = useState('');
  const [notasMerma, setNotasMerma] = useState('');
  const [productosSeleccionados, setProductosSeleccionados] = useState<string[]>([]);
  const [carritoComanda, setCarritoComanda] = useState<Array<{
    productoId: string;
    productoNombre: string;
    productoCodigo: string;
    unidad: string;
    stockActual: number;
    cantidad: number;
  }>>([]);
  const [modalCarritoOpen, setModalCarritoOpen] = useState(false);
  const [motivoCarrito, setMotivoCarrito] = useState('Utilisation en recette');
  const [recetaCarritoId, setRecetaCarritoId] = useState('');
  const [notasCarrito, setNotasCarrito] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [inventario, busqueda, filtroZona, filtroAlerta, ordenamiento]);

  const recetasDisponibles: Receta[] = obtenerRecetas().filter(receta => receta.activa);

  const cargarDatos = () => {
    const inv = obtenerInventarioCocina();
    setInventario(inv);
    setEstadisticas(obtenerEstadisticasInventarioCocina());
  };

  const resetearFormularioProducto = () => {
    const categoriaPorDefecto = categoriasProductos[0] || 'Autre';
    setNuevoProductoForm({
      nombre: '',
      codigo: '',
      categoria: categoriaPorDefecto,
      unidad: 'kg',
      stockActual: 0,
      stockMinimo: 0,
      zona: 'seco',
      icono: '📦',
      notas: ''
    });
    setMostrarCampoNuevaCategoria(false);
    setNuevaCategoria('');
  };

  const agregarCategoriaProducto = () => {
    const categoria = crearCategoriaProductoCocina(nuevaCategoria);
    if (!categoria) {
      toast.error('Le nom de la catégorie est requis');
      return;
    }

    setCategoriasProductos(obtenerCategoriasProductosCocina());
    setNuevoProductoForm(prev => ({ ...prev, categoria }));
    setNuevaCategoria('');
    setMostrarCampoNuevaCategoria(false);
    toast.success('Catégorie créée');
  };

  const guardarNuevoProducto = () => {
    if (!nuevoProductoForm.nombre.trim()) {
      toast.error('Le nom du produit est requis');
      return;
    }

    const codigo = nuevoProductoForm.codigo.trim() || `${nuevoProductoForm.nombre.trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'PRODUIT'}-${Date.now().toString().slice(-4)}`;
    const icono = nuevoProductoForm.icono.trim() || generarIconoProducto(nuevoProductoForm.nombre, nuevoProductoForm.categoria);
    const productoCreado = guardarProducto({
      codigo,
      nombre: nuevoProductoForm.nombre.trim(),
      categoria: nuevoProductoForm.categoria.trim() || 'Autre',
      subcategoria: '',
      unidad: nuevoProductoForm.unidad,
      icono,
      peso: 0,
      pesoUnitario: 0,
      stockActual: nuevoProductoForm.stockActual,
      stockMinimo: nuevoProductoForm.stockMinimo,
      ubicacion: '',
      lote: '',
      fechaVencimiento: '',
      esPRS: false,
      activo: true,
      fechaCreacion: new Date().toISOString(),
    }, { estrategiaDeduplicacion: 'id' });

    crearProductoInventarioCocina({
      productoId: productoCreado.id,
      productoNombre: productoCreado.nombre,
      productoCodigo: productoCreado.codigo,
      categoria: productoCreado.categoria || 'Autre',
      subcategoria: productoCreado.subcategoria || '',
      icono: productoCreado.icono || icono,
      stockActual: nuevoProductoForm.stockActual,
      unidad: productoCreado.unidad || nuevoProductoForm.unidad,
      peso: productoCreado.pesoUnitario ?? productoCreado.peso ?? 0,
      zona: nuevoProductoForm.zona || undefined,
      fechaRecepcion: new Date().toISOString(),
      origenEnvio: 'Ajout manuel',
      notas: nuevoProductoForm.notas,
      stockMinimo: nuevoProductoForm.stockMinimo,
      alertaBaja: nuevoProductoForm.stockActual <= (nuevoProductoForm.stockMinimo || 0),
    });

    toast.success('Produit créé et ajouté à l\'inventaire cuisine');
    setModalCrearOpen(false);
    resetearFormularioProducto();
    cargarDatos();
    onProductoCreado?.();
  };

  const aplicarFiltros = () => {
    let resultado = [...inventario];

    // Filtro de bùsqueda
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase();
      resultado = resultado.filter(p =>
        p.productoNombre.toLowerCase().includes(busquedaLower) ||
        p.productoCodigo.toLowerCase().includes(busquedaLower) ||
        p.categoria.toLowerCase().includes(busquedaLower)
      );
    }

    // Filtro de zona
    if (filtroZona !== 'todas') {
      resultado = resultado.filter(p => p.zona === filtroZona);
    }

    // Filtro de alerta baja
    if (filtroAlerta) {
      resultado = resultado.filter(p => p.alertaBaja || (p.stockMinimo && p.stockActual <= p.stockMinimo));
    }

    // Ordenamiento
    resultado.sort((a, b) => {
      switch (ordenamiento) {
        case 'nombre':
          return a.productoNombre.localeCompare(b.productoNombre);
        case 'stock':
          return b.stockActual - a.stockActual;
        case 'fecha':
          return new Date(b.fechaRecepcion).getTime() - new Date(a.fechaRecepcion).getTime();
        default:
          return 0;
      }
    });

    setInventarioFiltrado(resultado);
  };

  const handleAjustarStock = (producto: ProductoInventarioCocina) => {
    setProductoSeleccionado(producto);
    setNuevoStock(producto.stockActual);
    setMotivoAjuste('');
    setModalAjustarOpen(true);
  };

  const handleRegistrarMerma = (producto: ProductoInventarioCocina) => {
    setProductoSeleccionado(producto);
    setCantidadMerma(0);
    setMotivoMerma('');
    setNotasMerma('');
    setModalMermaOpen(true);
  };

  const handleVerMovimientos = (producto: ProductoInventarioCocina) => {
    setProductoSeleccionado(producto);
    const movs = obtenerMovimientosPorProducto(producto.id);
    setMovimientos(movs);
    setModalMovimientosOpen(true);
  };

  const toggleSeleccionProducto = (productoId: string) => {
    setProductosSeleccionados(prev =>
      prev.includes(productoId)
        ? prev.filter(id => id !== productoId)
        : [...prev, productoId]
    );
  };

  const agregarSeleccionadosAlCarrito = () => {
    if (productosSeleccionados.length === 0) {
      toast.error('Sélectionnez au moins un produit');
      return;
    }

    const productosAgregados = productosSeleccionados
      .map(id => inventario.find(producto => producto.id === id))
      .filter((producto): producto is ProductoInventarioCocina => Boolean(producto));

    setCarritoComanda(prev => {
      const actualizado = [...prev];
      productosAgregados.forEach(producto => {
        const existente = actualizado.find(item => item.productoId === producto.id);
        if (existente) {
          existente.cantidad = Math.max(existente.cantidad, 1);
          return;
        }
        actualizado.push({
          productoId: producto.id,
          productoNombre: producto.productoNombre,
          productoCodigo: producto.productoCodigo,
          unidad: producto.unidad,
          stockActual: producto.stockActual,
          cantidad: 1
        });
      });
      return actualizado;
    });

    setProductosSeleccionados([]);
    setModalCarritoOpen(true);
    toast.success('Produits ajoutés au panier de commande');
  };

  const actualizarCantidadCarrito = (productoId: string, cantidad: number) => {
    setCarritoComanda(prev => prev.map(item =>
      item.productoId === productoId ? { ...item, cantidad: Math.max(0, cantidad) } : item
    ).filter(item => item.cantidad > 0));
  };

  const eliminarDelCarrito = (productoId: string) => {
    setCarritoComanda(prev => prev.filter(item => item.productoId !== productoId));
  };

  const crearSalidaCarrito = () => {
    if (carritoComanda.length === 0) {
      toast.error('Le panier est vide');
      return;
    }

    const recetaSeleccionada = recetasDisponibles.find(receta => receta.id === recetaCarritoId);
    const recetaNombre = recetaSeleccionada?.nombre || '';

    const inventarioActual = obtenerInventarioCocina();
    const productosSinStock = carritoComanda.filter(item => {
      const producto = inventarioActual.find(prod => prod.id === item.productoId);
      return !producto || producto.stockActual < item.cantidad;
    });

    if (productosSinStock.length > 0) {
      toast.error('Un ou plusieurs produits n\'ont pas assez de stock');
      return;
    }

    const resultados = carritoComanda.map(item => {
      const producto = inventarioActual.find(prod => prod.id === item.productoId);
      return producto ? consumirProducto(
        item.productoId,
        item.cantidad,
        motivoCarrito.trim() || 'Utilisation en recette',
        recetaNombre ? `Utilisation en recette: ${recetaNombre}` : 'Sortie de stock',
        'Chef Cuisine',
        recetaSeleccionada?.id,
        recetaNombre,
        notasCarrito
      ) : false;
    });

    if (resultados.every(Boolean)) {
      toast.success(`${carritoComanda.length} produits retirés du stock`);
      setCarritoComanda([]);
      setProductosSeleccionados([]);
      setRecetaCarritoId('');
      setMotivoCarrito('Utilisation en recette');
      setNotasCarrito('');
      cargarDatos();
    } else {
      toast.error('Erreur lors de la sortie du panier');
    }
  };

  const guardarAjuste = () => {
    if (!productoSeleccionado) return;

    if (!motivoAjuste.trim()) {
      toast.error('Le motif est requis');
      return;
    }

    const exito = ajustarStock(
      productoSeleccionado.id,
      nuevoStock,
      motivoAjuste,
      'Chef Cuisine'
    );

    if (exito) {
      toast.success('Stock ajusté avec succès');
      setModalAjustarOpen(false);
      cargarDatos();
    } else {
      toast.error('Erreur lors de l\'ajustement');
    }
  };

  const guardarMerma = () => {
    if (!productoSeleccionado) return;

    if (cantidadMerma <= 0) {
      toast.error('La quantité doit être supérieure à 0');
      return;
    }

    if (cantidadMerma > productoSeleccionado.stockActual) {
      toast.error('Quantité supérieure au stock disponible');
      return;
    }

    if (!motivoMerma.trim()) {
      toast.error('Le motif est requis');
      return;
    }

    const exito = registrarMerma(
      productoSeleccionado.id,
      cantidadMerma,
      motivoMerma,
      'Chef Cuisine',
      notasMerma
    );

    if (exito) {
      toast.success('Perte enregistrée');
      setModalMermaOpen(false);
      cargarDatos();
    } else {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleEliminar = (producto: ProductoInventarioCocina) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer "${producto.productoNombre}" de l'inventaire?`)) {
      return;
    }

    const exito = eliminarProductoInventario(producto.id);
    if (exito) {
      toast.success('Produit supprimé');
      cargarDatos();
    } else {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getZonaBadge = (zona?: string) => {
    const config: Record<string, { icono: React.ReactNode; label: string; clases: string }> = {
      'refrigerado': {
        icono: <Refrigerator className="w-4 h-4" />,
        label: 'Réfrigéré',
        clases: 'bg-blue-50 text-blue-600 border-blue-200'
      },
      'congelado': {
        icono: <Snowflake className="w-4 h-4" />,
        label: 'Congelé',
        clases: 'bg-cyan-50 text-cyan-600 border-cyan-200'
      },
      'seco': {
        icono: <Sun className="w-4 h-4" />,
        label: 'Sec',
        clases: 'bg-amber-50 text-amber-600 border-amber-200'
      },
      'fresco': {
        icono: <Leaf className="w-4 h-4" />,
        label: 'Frais',
        clases: 'bg-green-50 text-green-600 border-green-200'
      }
    };

    const conf = config[zona || ''] || {
      icono: <HelpCircle className="w-4 h-4" />,
      label: 'Non défini',
      clases: 'bg-gray-50 text-gray-400 border-gray-200'
    };

    return (
      <span
        title={conf.label}
        aria-label={conf.label}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border shadow-sm ${conf.clases}`}
      >
        {conf.icono}
      </span>
    );
  };

  const getTipoMovimientoBadge = (tipo: string) => {
    const config: Record<string, { color: string; label: string }> = {
      'entrada': { color: 'bg-green-500', label: 'Entrée' },
      'salida': { color: 'bg-blue-500', label: 'Sortie' },
      'ajuste': { color: 'bg-orange-500', label: 'Ajustement' },
      'merma': { color: 'bg-red-500', label: 'Perte' }
    };

    const conf = config[tipo] || { color: 'bg-gray-500', label: tipo };
    return <Badge className={`${conf.color} text-white`}>{conf.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-[#1E73BE] to-[#1a5fa0] text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4" />
              Total Produits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{estadisticas?.totalProductos || 0}</div>
            <p className="text-xs opacity-90 mt-1">produits en stock</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#4CAF50] to-[#45a049] text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Poids Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{estadisticas?.pesoTotal?.toFixed(1) || '0.0'}</div>
            <p className="text-xs opacity-90 mt-1">kg en inventaire</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#FFC107] to-[#FFA000] text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Alertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{estadisticas?.productosAlertaBaja || 0}</div>
            <p className="text-xs opacity-90 mt-1">stock bas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[#9C27B0] to-[#7B1FA2] text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Mouvements ce mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{estadisticas?.movimientosMes || 0}</div>
            <p className="text-xs opacity-90 mt-1">
              {estadisticas?.entradasMes || 0} entrées • {estadisticas?.salidasMes || 0} sorties
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y bùsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Label className="mb-2 block">Recherche</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Chercher par nom, code ou catégorie..."
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Zone</Label>
              <Select value={filtroZona} onValueChange={setFiltroZona}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Toutes les zones</SelectItem>
                  <SelectItem value="refrigerado">Réfrigéré</SelectItem>
                  <SelectItem value="congelado">Congelé</SelectItem>
                  <SelectItem value="seco">Sec</SelectItem>
                  <SelectItem value="fresco">Frais</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Tri</Label>
              <Select value={ordenamiento} onValueChange={(v: any) => setOrdenamiento(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nombre">Par nom</SelectItem>
                  <SelectItem value="stock">Par stock</SelectItem>
                  <SelectItem value="fecha">Par date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            <Button
              variant={filtroAlerta ? 'default' : 'outline'}
              onClick={() => setFiltroAlerta(!filtroAlerta)}
              className={filtroAlerta ? 'bg-[#DC3545]' : ''}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Stock bas seulement
            </Button>
            <Button
              onClick={() => {
                resetearFormularioProducto();
                setModalCrearOpen(true);
              }}
              className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau produit
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (productosSeleccionados.length > 0) {
                  agregarSeleccionadosAlCarrito();
                } else {
                  setModalCarritoOpen(true);
                }
              }}
              disabled={carritoComanda.length === 0 && productosSeleccionados.length === 0}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {carritoComanda.length > 0 ? `Voir le panier (${carritoComanda.length})` : `Ajouter au panier (${productosSeleccionados.length})`}
            </Button>
            <Button variant="outline" onClick={cargarDatos}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de inventario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventaire Cuisine ({inventarioFiltrado.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inventarioFiltrado.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 mb-2">Aucun produit trouvé</p>
              <p className="text-sm text-gray-500">
                {inventario.length === 0
                  ? 'Acceptez des offres pour ajouter des produits'
                  : 'Essayez de modifier vos filtres'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Origine</TableHead>
                    <TableHead>Date Réception</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventarioFiltrado.map((producto) => (
                    <TableRow 
                      key={producto.id}
                      className={producto.alertaBaja ? 'bg-red-50' : ''}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{producto.icono}</span>
                          <div>
                            <p className="font-semibold text-base">{producto.productoNombre}</p>
                            <p className="text-xs text-gray-600">{producto.productoCodigo}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-bold text-lg">{producto.stockActual} {producto.unidad}</p>
                          {producto.stockMinimo && (
                            <p className="text-xs text-gray-600">
                              Min: {producto.stockMinimo} {producto.unidad}
                            </p>
                          )}
                          {producto.alertaBaja && (
                            <Badge className="bg-[#DC3545] text-white mt-1">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Stock bas
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getZonaBadge(producto.zona)}</TableCell>
                      <TableCell>
                        <p className="text-sm">{producto.origenEnvio || 'Direct'}</p>
                      </TableCell>
                                            <TableCell>
                        <p className="text-sm">
                          {new Date(producto.fechaRecepcion).toLocaleDateString('fr-FR')}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title={productosSeleccionados.includes(producto.id) ? 'Retirer du panier' : 'Ajouter au panier'}
                            aria-label={productosSeleccionados.includes(producto.id) ? 'Retirer du panier' : 'Ajouter au panier'}
                            className={`relative ${productosSeleccionados.includes(producto.id) ? 'text-[#1E73BE]' : 'text-slate-500'}`}
                            onClick={() => toggleSeleccionProducto(producto.id)}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            {productosSeleccionados.includes(producto.id) && (
                              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#4CAF50] border border-white" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Modifier"
                            aria-label="Modifier"
                            className="text-slate-500 hover:text-[#1E73BE]"
                            onClick={() => handleAjustarStock(producto)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Enregistrer une perte"
                            aria-label="Enregistrer une perte"
                            className="text-slate-500 hover:text-orange-600"
                            onClick={() => handleRegistrarMerma(producto)}
                          >
                            <TrendingDown className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Voir l'historique"
                            aria-label="Voir l'historique"
                            className="text-slate-500 hover:text-[#1E73BE]"
                            onClick={() => handleVerMovimientos(producto)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Supprimer"
                            aria-label="Supprimer"
                            className="text-slate-500 hover:text-[#DC3545]"
                            onClick={() => handleEliminar(producto)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Carrito de commande */}
      <Dialog open={modalCarritoOpen} onOpenChange={setModalCarritoOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" aria-describedby="carrito-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5 text-[#1E73BE]" />
              Panier de sortie de stock
            </DialogTitle>
            <DialogDescription id="carrito-description">
              Consultez, ajustez et confirmez la sortie groupée des produits sélectionnés.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="motivoCarrito">Motif *</Label>
                  <Select value={motivoCarrito} onValueChange={setMotivoCarrito}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un motif" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Utilisation en recette">Utilisation en recette</SelectItem>
                      <SelectItem value="Préparation">Préparation</SelectItem>
                      <SelectItem value="Service">Service</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="recetaCarrito">Recette associée (optionnel)</Label>
                  <Select value={recetaCarritoId || 'none'} onValueChange={(value) => setRecetaCarritoId(value === 'none' ? '' : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une recette" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune recette</SelectItem>
                      {recetasDisponibles.map((receta) => (
                        <SelectItem key={receta.id} value={receta.id}>{receta.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="notasCarrito">Notes (optionnel)</Label>
                <Textarea
                  id="notasCarrito"
                  value={notasCarrito}
                  onChange={(e) => setNotasCarrito(e.target.value)}
                  placeholder="Détails supplémentaires..."
                  className="min-h-[90px]"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Produits du panier</p>
                  <p className="text-xs text-slate-500">{carritoComanda.length} article(s) prêt(s) à sortir</p>
                </div>
                <Badge className="bg-[#1E73BE] text-white">{carritoComanda.length} produits</Badge>
              </div>

              <div className="space-y-3">
                {carritoComanda.map((item) => (
                  <div key={item.productoId} className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800">{item.productoNombre}</p>
                        <p className="text-xs text-slate-500">{item.productoCodigo}</p>
                        <p className="text-xs text-slate-500 mt-1">Stock disponible: {item.stockActual} {item.unidad}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <div className="w-full sm:w-[140px]">
                          <Label className="mb-1 block text-xs">Quantité</Label>
                          <QuantityInput
                            value={item.cantidad}
                            onChangeText={(value) => actualizarCantidadCarrito(item.productoId, parseQuantityText(value) || 0)}
                            min={0}
                            step={0.01}
                            showButtons={false}
                            className="w-full"
                          />
                        </div>
                        <span className="text-sm text-slate-600">{item.unidad}</span>
                        <Button variant="ghost" size="sm" onClick={() => eliminarDelCarrito(item.productoId)} className="text-red-600">
                          Retirer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
              <Button onClick={crearSalidaCarrito} className="bg-[#1E73BE] text-white">
                Créer la sortie du panier
              </Button>
              <Button variant="outline" onClick={() => setCarritoComanda([])}>
                Vider le panier
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Crear Producto */}
      <Dialog open={modalCrearOpen} onOpenChange={(open) => {
        setModalCrearOpen(open);
        if (!open) {
          resetearFormularioProducto();
        }
      }}>
        <DialogContent className="max-w-2xl" aria-describedby="crear-producto-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Plus className="w-5 h-5 text-[#4CAF50]" />
              Ajouter un nouveau produit
            </DialogTitle>
            <DialogDescription id="crear-producto-description">
              Créez un produit dans le catalogue de cuisine et ajoutez-le immédiatement à l'inventaire.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="nuevoProductoNombre">Nom du produit *</Label>
              <Input
                id="nuevoProductoNombre"
                value={nuevoProductoForm.nombre}
                onChange={(e) => setNuevoProductoForm({ ...nuevoProductoForm, nombre: e.target.value })}
                placeholder="Ex: Tomates cerises"
              />
            </div>

            <div>
              <Label htmlFor="nuevoProductoCodigo">Code</Label>
              <Input
                id="nuevoProductoCodigo"
                value={nuevoProductoForm.codigo}
                onChange={(e) => setNuevoProductoForm({ ...nuevoProductoForm, codigo: e.target.value })}
                placeholder="Optionnel"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="nuevoProductoCategoria">Catégorie</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  id="nuevoProductoCategoria"
                  value={nuevoProductoForm.categoria}
                  onChange={(e) => setNuevoProductoForm({ ...nuevoProductoForm, categoria: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {categoriasProductos.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarCampoNuevaCategoria((prev) => !prev)}
                  className="whitespace-nowrap"
                >
                  {mostrarCampoNuevaCategoria ? 'Annuler' : 'Nouvelle catégorie'}
                </Button>
              </div>
              {mostrarCampoNuevaCategoria && (
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value)}
                    placeholder="Nom de la catégorie"
                  />
                  <Button type="button" onClick={agregarCategoriaProducto} className="bg-[#4CAF50] hover:bg-[#45a049] text-white">
                    Créer
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="nuevoProductoUnidad">Unité</Label>
              <select
                id="nuevoProductoUnidad"
                value={nuevoProductoForm.unidad}
                onChange={(e) => setNuevoProductoForm({ ...nuevoProductoForm, unidad: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
                <option value="unité">unité</option>
                <option value="pièce">pièce</option>
              </select>
            </div>

            <div>
              <Label htmlFor="nuevoProductoStock">Stock initial</Label>
              <QuantityInput
                id="nuevoProductoStock"
                value={nuevoProductoForm.stockActual}
                onChangeText={(value) => setNuevoProductoForm({ ...nuevoProductoForm, stockActual: parseQuantityText(value) || 0 })}
                min={0}
                step={0.01}
                showButtons={false}
                className="w-full text-left"
                wrapperClassName="w-full"
              />
            </div>

            <div>
              <Label htmlFor="nuevoProductoStockMin">Stock minimum</Label>
              <QuantityInput
                id="nuevoProductoStockMin"
                value={nuevoProductoForm.stockMinimo}
                onChangeText={(value) => setNuevoProductoForm({ ...nuevoProductoForm, stockMinimo: parseQuantityText(value) || 0 })}
                min={0}
                step={0.01}
                showButtons={false}
                className="w-full text-left"
                wrapperClassName="w-full"
              />
            </div>

            <div>
              <Label htmlFor="nuevoProductoZona">Zone</Label>
              <select
                id="nuevoProductoZona"
                value={nuevoProductoForm.zona}
                onChange={(e) => setNuevoProductoForm({ ...nuevoProductoForm, zona: e.target.value as 'refrigerado' | 'congelado' | 'seco' | 'fresco' | '' })}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Sélectionner</option>
                <option value="refrigerado">Réfrigéré</option>
                <option value="congelado">Congelé</option>
                <option value="seco">Sec</option>
                <option value="fresco">Frais</option>
              </select>
            </div>

            <div>
              <Label>Icône</Label>
              <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                <IconSelector
                  value={nuevoProductoForm.icono}
                  onChange={(icono) => setNuevoProductoForm({ ...nuevoProductoForm, icono })}
                  label="Icône alimentaire"
                  contextoNombre={`${nuevoProductoForm.nombre} ${nuevoProductoForm.categoria}`}
                  iconosRecomendados={sugerirIconos(`${nuevoProductoForm.nombre} ${nuevoProductoForm.categoria}`)}
                  gridCols={6}
                  maxHeight="max-h-48"
                />
              </div>
              <p className="mt-2 text-xs text-[#666666]">
                Choisissez un icône pour les produits frais, préparés ou transformés.
              </p>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="nuevoProductoNotas">Notes</Label>
              <Textarea
                id="nuevoProductoNotas"
                value={nuevoProductoForm.notas}
                onChange={(e) => setNuevoProductoForm({ ...nuevoProductoForm, notas: e.target.value })}
                placeholder="Informations supplémentaires..."
                className="min-h-[90px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalCrearOpen(false)}>
              Annuler
            </Button>
            <Button onClick={guardarNuevoProducto} className="bg-[#4CAF50] hover:bg-[#45a049] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Créer le produit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Ajustar Stock */}
      <Dialog open={modalAjustarOpen} onOpenChange={setModalAjustarOpen}>
        <DialogContent aria-describedby="ajustar-stock-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-3xl">{productoSeleccionado?.icono}</span>
              Ajustar Stock - {productoSeleccionado?.productoNombre}
            </DialogTitle>
            <DialogDescription id="ajustar-stock-description">
              Ajuster la quantité de stock disponible pour ce produit
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-2 border-blue-200">
              <Label className="text-sm text-gray-600">Stock actuel</Label>
              <p className="text-3xl font-bold text-[#1E73BE]">
                {productoSeleccionado?.stockActual} {productoSeleccionado?.unidad}
              </p>
            </div>

            <div>
              <Label htmlFor="nuevoStock">Nouveau stock</Label>
              <QuantityInput
                id="nuevoStock"
                value={nuevoStock}
                onChangeText={(value) => setNuevoStock(parseQuantityText(value) || 0)}
                min={0}
                step={0.01}
              />
              <p className="text-sm text-gray-600 mt-1">
                Différence: {(nuevoStock - (productoSeleccionado?.stockActual || 0)).toFixed(2)} {productoSeleccionado?.unidad}
              </p>
            </div>

            <div>
              <Label htmlFor="motivoAjuste">Motif *</Label>
              <Input
                id="motivoAjuste"
                value={motivoAjuste}
                onChange={(e) => setMotivoAjuste(e.target.value)}
                placeholder="Ex: Inventaire physique, correction, etc."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAjustarOpen(false)}>
              Annuler
            </Button>
            <Button onClick={guardarAjuste} className="bg-[#1E73BE]">
              Ajuster
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Registrar Merma */}
      <Dialog open={modalMermaOpen} onOpenChange={setModalMermaOpen}>
        <DialogContent aria-describedby="registrar-merma-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-3xl">{productoSeleccionado?.icono}</span>
              Enregistrer une Perte
            </DialogTitle>
            <DialogDescription id="registrar-merma-description">
              {productoSeleccionado?.productoNombre} - {productoSeleccionado?.productoCodigo}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border-2 border-orange-200">
              <Label className="text-sm text-gray-600">Stock disponible</Label>
              <p className="text-3xl font-bold text-[#DC3545]">
                {productoSeleccionado?.stockActual} {productoSeleccionado?.unidad}
              </p>
            </div>

            <div>
              <Label htmlFor="cantidadMerma">Quantité perdue *</Label>
              <QuantityInput
                id="cantidadMerma"
                value={cantidadMerma}
                onChangeText={(value) => setCantidadMerma(parseQuantityText(value) || 0)}
                min={0}
                max={productoSeleccionado?.stockActual}
                step={0.01}
              />
            </div>

            <div>
              <Label htmlFor="motivoMerma">Motif *</Label>
              <Select value={motivoMerma} onValueChange={setMotivoMerma}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un motif" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Périmé">Périmé</SelectItem>
                  <SelectItem value="Détérioré">Détérioré</SelectItem>
                  <SelectItem value="Casse">Casse</SelectItem>
                  <SelectItem value="Contamination">Contamination</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notasMerma">Notes (optionnel)</Label>
              <Textarea
                id="notasMerma"
                value={notasMerma}
                onChange={(e) => setNotasMerma(e.target.value)}
                placeholder="Détails supplémentaires..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalMermaOpen(false)}>
              Annuler
            </Button>
            <Button onClick={guardarMerma} className="bg-[#DC3545]">
              Enregistrer la Perte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Movimientos */}
      <Dialog open={modalMovimientosOpen} onOpenChange={setModalMovimientosOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="movimientos-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-3xl">{productoSeleccionado?.icono}</span>
              Historique des Mouvements
            </DialogTitle>
            <DialogDescription id="movimientos-description">
              {productoSeleccionado?.productoNombre} - Stock actuel: {productoSeleccionado?.stockActual} {productoSeleccionado?.unidad}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {movimientos.length === 0 ? (
              <p className="text-center text-gray-600 py-8">Aucun mouvement enregistré</p>
            ) : (
              movimientos.map((mov) => (
                <Card key={mov.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTipoMovimientoBadge(mov.tipo)}
                        <p className="font-semibold">{mov.motivo}</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(mov.fecha).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Quantité</p>
                        <p className="font-bold">{mov.cantidad} {mov.unidad}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Stock avant</p>
                        <p className="font-bold">{mov.stockAnterior}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Stock après</p>
                        <p className="font-bold">{mov.stockNuevo}</p>
                      </div>
                    </div>
                    {mov.recetaNombre && (
                      <p className="text-sm text-blue-700 mt-2">
                        Associé à la recette: <span className="font-semibold">{mov.recetaNombre}</span>
                      </p>
                    )}
                    {mov.notas && (
                      <p className="text-sm text-gray-700 mt-2 italic">{mov.notas}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Par: {mov.usuario}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setModalMovimientosOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
