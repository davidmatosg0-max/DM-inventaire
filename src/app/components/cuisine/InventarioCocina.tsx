import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Package, Search, Filter, Edit, Trash2, AlertCircle, TrendingDown,
  MapPin, Calendar, Eye, Plus, Scale, ArrowUpDown, RefreshCw, FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { toast } from 'sonner';
import {
  obtenerInventarioCocina,
  obtenerProductosAlertaBaja,
  obtenerProductosPorZona,
  actualizarProductoInventario,
  ajustarStock,
  registrarMerma,
  eliminarProductoInventario,
  obtenerMovimientosPorProducto,
  obtenerEstadisticasInventarioCocina,
  type ProductoInventarioCocina,
  type MovimientoStock
} from '../../utils/inventarioCocinaStorage';

export function InventarioCocina() {
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
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalAjustarOpen, setModalAjustarOpen] = useState(false);
  const [modalMermaOpen, setModalMermaOpen] = useState(false);
  const [modalMovimientosOpen, setModalMovimientosOpen] = useState(false);
  const [movimientos, setMovimientos] = useState<MovimientoStock[]>([]);
  
  // Estados de formularios
  const [nuevoStock, setNuevoStock] = useState(0);
  const [motivoAjuste, setMotivoAjuste] = useState('');
  const [cantidadMerma, setCantidadMerma] = useState(0);
  const [motivoMerma, setMotivoMerma] = useState('');
  const [notasMerma, setNotasMerma] = useState('');

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [inventario, busqueda, filtroZona, filtroAlerta, ordenamiento]);

  const cargarDatos = () => {
    const inv = obtenerInventarioCocina();
    setInventario(inv);
    setEstadisticas(obtenerEstadisticasInventarioCocina());
  };

  const aplicarFiltros = () => {
    let resultado = [...inventario];

    // Filtro de búsqueda
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

  const handleEditarProducto = (producto: ProductoInventarioCocina) => {
    setProductoSeleccionado(producto);
    setModalEditarOpen(true);
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
    const colores: Record<string, string> = {
      'refrigerado': 'bg-blue-500',
      'congelado': 'bg-cyan-500',
      'seco': 'bg-amber-500',
      'fresco': 'bg-green-500'
    };

    return (
      <Badge className={`${colores[zona || '']} text-white`}>
        {zona || 'Non défini'}
      </Badge>
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

      {/* Filtros y búsqueda */}
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

          <div className="flex items-center gap-4 mt-4">
            <Button
              variant={filtroAlerta ? 'default' : 'outline'}
              onClick={() => setFiltroAlerta(!filtroAlerta)}
              className={filtroAlerta ? 'bg-[#DC3545]' : ''}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Stock bas seulement
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
                    <TableHead>Catégorie</TableHead>
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
                        <Badge variant="outline">{producto.categoria}</Badge>
                        {producto.subcategoria && (
                          <Badge variant="outline" className="ml-1 text-xs">
                            {producto.subcategoria}
                          </Badge>
                        )}
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
                            variant="ghost"
                            size="icon"
                            onClick={() => handleVerMovimientos(producto)}
                            title="Voir historique"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleAjustarStock(producto)}
                            title="Ajuster stock"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRegistrarMerma(producto)}
                            title="Enregistrer perte"
                            className="text-orange-600"
                          >
                            <TrendingDown className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEliminar(producto)}
                            title="Supprimer"
                            className="text-red-600"
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

      {/* Modal Ajustar Stock */}
      <Dialog open={modalAjustarOpen} onOpenChange={setModalAjustarOpen}>
        <DialogContent aria-describedby="ajustar-stock-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-3xl">{productoSeleccionado?.icono}</span>
              Ajustar Stock - {productoSeleccionado?.nombre}
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
              <Input
                id="nuevoStock"
                type="number"
                value={nuevoStock}
                onChange={(e) => setNuevoStock(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
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
              <Input
                id="cantidadMerma"
                type="number"
                value={cantidadMerma}
                onChange={(e) => setCantidadMerma(parseFloat(e.target.value) || 0)}
                min="0"
                max={productoSeleccionado?.stockActual}
                step="0.01"
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