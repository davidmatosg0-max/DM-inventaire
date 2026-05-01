import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingCart, Plus, Search, Filter, Package, Grid3x3, List, 
  X, Check, ChevronDown, DollarSign, Scale, TrendingUp, AlertCircle, Minus, FileText
} from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { mockProductos } from '../../data/mockData';
import { toast } from 'sonner';
import { Textarea } from '../ui/textarea';
import type { Comanda } from '../../types';
import { obtenerResumenReservasInventario } from '../../utils/inventoryReservations';
import { guardarComanda, generarNumeroComanda } from '../../utils/comandaStorage';
import { guardarNotificacion, crearNotificacionNuevaComanda } from '../../utils/notificacionStorage';
import { obtenerOrganismos } from '../../utils/organismosStorage';
import { enviarEmailAutomaticoNuevaComanda } from '../../utils/organismoEmailNotifications';
import { calcularValorDistribucionProducto } from '../../utils/distributionValue';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';
import { SimulacionRecepcionNotificacion } from '../organismo/SimulacionRecepcionNotificacion';
import { construirRutaAccesoOrganismo } from '../../utils/organismoAccessLinks';
import {
  resolverTemperaturaProductoCanonica,
  resolverTemperaturaOriginalEntradaProducto,
} from '../../utils/productTemperature';

type CarritoItem = {
  productoId: string;
  cantidad: number;
};

const categoriasInfo: Record<string, { icono: string; valorMonetario: number; color: string }> = {
  'Alimentos Secos': { icono: '🍚', valorMonetario: 2.50, color: '#FFC107' },
  'Conservas': { icono: '🥫', valorMonetario: 3.50, color: '#4CAF50' },
  'Lácteos': { icono: '🥛', valorMonetario: 4.00, color: '#1E73BE' },
  'Frutas y Verduras': { icono: '🥬', valorMonetario: 3.00, color: '#4CAF50' },
  'Proteínas': { icono: '🥩', valorMonetario: 5.50, color: '#DC3545' },
  'Panadería': { icono: '🍞', valorMonetario: 2.00, color: '#FFA726' },
  'Bebidas': { icono: '🧃', valorMonetario: 1.50, color: '#29B6F6' },
  'Aceites y Condimentos': { icono: '🫒', valorMonetario: 4.50, color: '#66BB6A' },
};

interface PanierProductosProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carrito: CarritoItem[];
  onAgregarProducto: (productoId: string, cantidad: number) => void;
  onActualizarCantidad: (productoId: string, cantidad: number) => void;
  productos?: any[]; // Lista de productos (opcional, usa mockProductos por defecto)
}

export function PanierProductos({
  open,
  onOpenChange,
  carrito,
  onAgregarProducto,
  onActualizarCantidad,
  productos = mockProductos
}: PanierProductosProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStockStatus, setSelectedStockStatus] = useState<string[]>([]);
  const [vistaMode, setVistaMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'nombre' | 'stock' | 'categoria' | 'valor'>('nombre');
  const [cantidadTemporal, setCantidadTemporal] = useState<Record<string, number>>({});
  
  // Estados para generar comanda
  const [generarComandaOpen, setGenerarComandaOpen] = useState(false);
  const [organismoSeleccionado, setOrganismoSeleccionado] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const reservasInventario = React.useMemo(
    () => obtenerResumenReservasInventario(productos.map(producto => producto.id)),
    [productos]
  );
  const organismosActivos = React.useMemo(
    () => obtenerOrganismos().filter(organismo => organismo.activo),
    [generarComandaOpen, open]
  );
  const organismoPreview = organismosActivos.find(organismo => organismo.id === organismoSeleccionado);
  const totalesPreview = carrito.reduce((sum, item) => {
    const producto = productos.find(productoActual => productoActual.id === item.productoId);
    const valorDistribucion = calcularValorDistribucionProducto(producto, item.cantidad);
    return {
      valorTotal: sum.valorTotal + valorDistribucion.valorTotal,
      pesoTotal: sum.pesoTotal + valorDistribucion.pesoTotal,
    };
  }, { valorTotal: 0, pesoTotal: 0 });
  const comandaPreview = organismoPreview
    ? ({
        id: `preview-panier-${organismoPreview.id}`,
        numero: `SIM-PAN-${organismoPreview.id.toUpperCase().slice(0, 4)}`,
        organismoId: organismoPreview.id,
        nombreOrganismo: organismoPreview.nombre,
        fecha: new Date().toISOString(),
        fechaEntrega,
        estado: 'pendiente',
        observaciones,
        items: carrito.map(item => {
          const producto = productos.find(productoActual => productoActual.id === item.productoId);
          const valorDistribucion = calcularValorDistribucionProducto(producto, 1);

          return {
            productoId: item.productoId,
            nombreProducto: producto?.nombre || '',
            productoNombre: producto?.nombre || '',
            cantidad: item.cantidad,
            unidad: producto?.unidad || 'kg',
            icono: producto?.icono,
            valorUnitario: valorDistribucion.valorUnitario,
          };
        }),
        valorTotal: totalesPreview.valorTotal,
        pesoTotal: totalesPreview.pesoTotal,
      } as Comanda)
    : null;
  const notificacionPreview = comandaPreview
    ? {
        mensaje: `Nouvelle commande ${comandaPreview.numero} disponible pour confirmation`,
        fecha: new Date().toISOString(),
        leida: false,
        urlAcceso: construirRutaAccesoOrganismo(organismoPreview?.claveAcceso),
      }
    : null;

  const categorias = Array.from(new Set(productos.map(p => p.categoria)));

  const getStockStatus = (producto: typeof productos[0]) => {
    const percentage = (producto.stockActual / producto.stockMinimo) * 100;
    if (percentage <= 100) return { label: t('inventory.low'), color: 'bg-[#DC3545]', value: 'bajo' };
    if (percentage <= 150) return { label: t('inventory.medium'), color: 'bg-[#FFC107]', value: 'medio' };
    return { label: t('inventory.optimal'), color: 'bg-[#4CAF50]', value: 'optimo' };
  };

  const toggleCategoria = (categoria: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoria)
        ? prev.filter(c => c !== categoria)
        : [...prev, categoria]
    );
  };

  const toggleStockStatus = (status: string) => {
    setSelectedStockStatus(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const limpiarFiltros = () => {
    setSelectedCategories([]);
    setSelectedStockStatus([]);
    setSearchTerm('');
  };

  const productosFiltrados = productos
    .filter(p => {
      const matchSearch = 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchCategory = 
        selectedCategories.length === 0 || 
        selectedCategories.includes(p.categoria);
      
      const matchStock = 
        selectedStockStatus.length === 0 || 
        selectedStockStatus.includes(getStockStatus(p).value);
      
      return matchSearch && matchCategory && matchStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'stock':
          return b.stockActual - a.stockActual;
        case 'categoria':
          return a.categoria.localeCompare(b.categoria);
        case 'valor':
          const valorA = calcularValorDistribucionProducto(a, 1).valorUnitario;
          const valorB = calcularValorDistribucionProducto(b, 1).valorUnitario;
          return valorB - valorA;
        default:
          return 0;
      }
    });

  const handleAgregarRapido = (productoId: string) => {
    const reserva = reservasInventario[productoId];
    const maximoReservable = reserva?.disponibleParaReservar ?? 0;
    const cantidad = Math.min(cantidadTemporal[productoId] || 1, maximoReservable);

    if (maximoReservable <= 0) {
      toast.error('No hay stock reservable para este producto');
      return;
    }

    onAgregarProducto(productoId, cantidad);
    setCantidadTemporal(prev => ({ ...prev, [productoId]: 1 }));
  };

  const calcularTotalSeleccion = () => {
    return productosFiltrados.length;
  };

  // Función para abrir el diálogo de generar comanda
  const handleAbrirGenerarComanda = () => {
    if (carrito.length === 0) {
      toast.error(t('inventory.emptyCartError'));
      return;
    }
    setGenerarComandaOpen(true);
  };

  // Función para generar la comanda
  const handleGenerarComanda = () => {
    // Validaciones
    if (!organismoSeleccionado) {
      toast.error(t('inventory.selectOrganismError'));
      return;
    }
    if (!fechaEntrega) {
      toast.error(t('inventory.selectDeliveryDateError'));
      return;
    }
    if (carrito.length === 0) {
      toast.error(t('inventory.emptyCartError'));
      return;
    }

    const organismo = organismosActivos.find(item => item.id === organismoSeleccionado);
    if (!organismo) {
      toast.error(t('inventory.selectOrganismError'));
      return;
    }

    const numeroComanda = generarNumeroComanda();
    const fechaCreacion = new Date().toISOString();
    const totalesComanda = carrito.reduce((sum, item) => {
      const producto = productos.find(productoActual => productoActual.id === item.productoId);
      const valorDistribucion = calcularValorDistribucionProducto(producto, item.cantidad);
      return {
        valorTotal: sum.valorTotal + valorDistribucion.valorTotal,
        pesoTotal: sum.pesoTotal + valorDistribucion.pesoTotal,
      };
    }, { valorTotal: 0, pesoTotal: 0 });

    const nuevaComanda: Comanda = {
      id: `comanda-${Date.now()}`,
      numero: numeroComanda,
      numeroComanda,
      organismoId: organismo.id,
      nombreOrganismo: organismo.nombre,
      fecha: fechaCreacion,
      fechaEntrega,
      estado: 'pendiente',
      items: carrito.map(item => {
        const producto = productos.find(productoActual => productoActual.id === item.productoId);
        const valorDistribucion = calcularValorDistribucionProducto(producto, 1);

        return {
          productoId: item.productoId,
          nombreProducto: producto?.nombre || '',
          productoNombre: producto?.nombre || '',
          cantidad: item.cantidad,
          unidad: producto?.unidad || 'kg',
          icono: producto?.icono,
          temperatura: resolverTemperaturaProductoCanonica(producto),
          temperaturaOriginalEntrada: resolverTemperaturaOriginalEntradaProducto(producto),
          valorUnitario: valorDistribucion.valorUnitario
        };
      }),
      valorTotal: totalesComanda.valorTotal,
      pesoTotal: totalesComanda.pesoTotal,
      observaciones,
      fechaCreacion,
      usuarioCreacion: 'Usuario Actual',
      creadoPor: 'Usuario Actual'
    };

    try {
      guardarComanda(nuevaComanda);
      const notificacion = crearNotificacionNuevaComanda(
        nuevaComanda.id,
        numeroComanda,
        organismo.id,
        organismo.claveAcceso
      );
      guardarNotificacion(notificacion);
      const resultadoEmail = enviarEmailAutomaticoNuevaComanda({
        organismo,
        numeroComanda,
        fechaEntrega,
        totalProductos: nuevaComanda.items.length,
        valorTotal: nuevaComanda.valorTotal,
        observaciones,
      });

      setOrganismoSeleccionado('');
      setFechaEntrega('');
      setObservaciones('');
      setGenerarComandaOpen(false);

      toast.success(`${t('inventory.orderCreated')}: ${numeroComanda}`);
      if (resultadoEmail.enviado) {
        toast.success(`Notification email automatique envoyée à ${resultadoEmail.destinatarios.length} destinataire(s)`);
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('common.error'));
      console.error(error);
    }
  };

  const ProductoCard = ({ producto }: { producto: typeof productos[0] }) => {
    const status = getStockStatus(producto);
    const enCarrito = carrito.find(item => item.productoId === producto.id);
    const categoriaInfo = categoriasInfo[producto.categoria] || { icono: '📦', valorMonetario: 0, color: '#999999' };
    const valorDistribucionUnitario = calcularValorDistribucionProducto(producto, 1).valorUnitario;
    const cantidadTemp = cantidadTemporal[producto.id] || 1;
    const reserva = reservasInventario[producto.id] || {
      stockActual: producto.stockActual,
      totalReservado: 0,
      disponibleParaReservar: producto.stockActual
    };

    return (
      <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${enCarrito ? 'ring-2 ring-[#4CAF50] bg-green-50' : 'hover:border-[#1E73BE]'}`}>
        <CardContent className="p-4">
          {/* Badge de estado en carrito */}
          {enCarrito && (
            <div className="absolute top-2 right-2 z-10">
              <Badge className="bg-[#4CAF50] text-white shadow-md">
                <Check className="w-3 h-3 mr-1" />
                En carrito
              </Badge>
            </div>
          )}

          {/* Imagen o icono del producto */}
          <div className="flex items-center justify-center mb-3">
            {producto.foto ? (
              <img 
                src={producto.foto} 
                alt={producto.nombre} 
                className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
              />
            ) : (
              <div 
                className="w-24 h-24 rounded-lg flex items-center justify-center text-5xl"
                style={{ backgroundColor: `${categoriaInfo.color}20` }}
              >
                {producto.icono || categoriaInfo.icono}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-2">
            <div>
              <h3 
                className="font-semibold text-center line-clamp-2 mb-1" 
                style={{ fontFamily: 'Montserrat, sans-serif', color: '#333333' }}
              >
                {producto.nombre}
              </h3>
              <p className="text-xs text-[#666666] text-center">{producto.codigo}</p>
            </div>

            {/* Categoría */}
            <div className="flex justify-center">
              <Badge 
                className="text-white text-xs"
                style={{ backgroundColor: categoriaInfo.color }}
              >
                {categoriaInfo.icono} {producto.categoria}
              </Badge>
            </div>

            {/* Stock y valor */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <div className="text-center">
                <p className="text-xs text-[#666666]">Reservable</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <div className={`w-2 h-2 rounded-full ${status.color}`} />
                  <span className="font-bold text-sm text-[#333333]">
                    {formatQuantity(reserva.disponibleParaReservar)}
                  </span>
                  <span className="text-xs text-[#666666]">{producto.unidad}</span>
                </div>
                <p className="text-[10px] text-[#666666] mt-1">Reservado: {formatQuantity(reserva.totalReservado)}</p>
                <p className="text-[10px] text-[#999999]">Físico: {formatQuantity(producto.stockActual)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-[#666666]">{producto.unidad === 'kg' ? 'Valor/kg' : 'Valor/unidad'}</p>
                <p className="font-bold text-sm text-[#4CAF50] mt-1">
                  CAD$ {formatMoney(valorDistribucionUnitario)}
                </p>
              </div>
            </div>

            {/* Controles de cantidad y agregar */}
            {enCarrito ? (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-[#DC3545] text-[#DC3545] hover:bg-[#DC3545] hover:text-white"
                    onClick={() => onActualizarCantidad(producto.id, enCarrito.cantidad - 1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="bg-[#F4F4F4] px-3 py-1 rounded-md min-w-[60px] text-center">
                    <span className="font-bold text-[#333333]">{enCarrito.cantidad}</span>
                    <span className="text-xs text-[#666666] ml-1">{producto.unidad}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white"
                    onClick={() => onActualizarCantidad(producto.id, enCarrito.cantidad + 1)}
                    disabled={enCarrito.cantidad >= reserva.disponibleParaReservar}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-[#DC3545] text-[#DC3545] hover:bg-[#DC3545] hover:text-white"
                  onClick={() => onActualizarCantidad(producto.id, 0)}
                >
                  <X className="w-4 h-4 mr-1" />
                  Quitar
                </Button>
              </div>
            ) : (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCantidadTemporal(prev => ({ ...prev, [producto.id]: Math.max(1, cantidadTemp - 1) }))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={cantidadTemp}
                    onChange={(e) => setCantidadTemporal(prev => ({
                      ...prev,
                      [producto.id]: Math.min(parseFloat(e.target.value) || 1, Math.max(reserva.disponibleParaReservar, 1))
                    }))}
                    className="w-16 h-8 text-center font-bold"
                    min="1"
                    max={reserva.disponibleParaReservar}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCantidadTemporal(prev => ({ ...prev, [producto.id]: Math.min(reserva.disponibleParaReservar, cantidadTemp + 1) }))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white"
                  size="sm"
                  onClick={() => handleAgregarRapido(producto.id)}
                  disabled={reserva.disponibleParaReservar <= 0}
                  style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                >
                  <ShoppingCart className="w-4 h-4 mr-1" />
                  Agregar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col"
        aria-describedby="panier-dialog-description"
      >
        <DialogHeader>
          <DialogTitle 
            className="flex items-center gap-2" 
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '1.5rem', color: '#1E73BE' }}
          >
            {t('inventory.addProducts')}
          </DialogTitle>
          <DialogDescription id="panier-dialog-description" className="sr-only">
            {t('inventory.addProductsDescription')}
          </DialogDescription>
        </DialogHeader>

        {/* Barra de búsqueda y controles */}
        <div className="space-y-3 pb-3 border-b">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666666] w-4 h-4" />
              <Input
                placeholder={`${t('common.search')} productos por nombre o código...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-[#E3F2FD] border-[#1E73BE]' : ''}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {(selectedCategories.length > 0 || selectedStockStatus.length > 0) && (
                <Badge className="ml-2 bg-[#DC3545] text-white">
                  {selectedCategories.length + selectedStockStatus.length}
                </Badge>
              )}
            </Button>
            <div className="flex gap-1 border rounded-md">
              <Button
                variant={vistaMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setVistaMode('grid')}
                className={vistaMode === 'grid' ? 'bg-[#1E73BE]' : ''}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={vistaMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setVistaMode('list')}
                className={vistaMode === 'list' ? 'bg-[#1E73BE]' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Panel de filtros */}
          {showFilters && (
            <Card className="bg-[#F4F4F4]">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Filtro por categoría */}
                  <div className="space-y-2">
                    <Label className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Categorías
                    </Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {categorias.map(categoria => (
                        <div key={categoria} className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedCategories.includes(categoria)}
                            onCheckedChange={() => toggleCategoria(categoria)}
                            id={`cat-${categoria}`}
                          />
                          <label 
                            htmlFor={`cat-${categoria}`} 
                            className="text-sm cursor-pointer flex items-center gap-2"
                          >
                            <span>{categoriasInfo[categoria]?.icono || '📦'}</span>
                            <span>{categoria}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Filtro por estado de stock */}
                  <div className="space-y-2">
                    <Label className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Estado de Stock
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedStockStatus.includes('bajo')}
                          onCheckedChange={() => toggleStockStatus('bajo')}
                          id="stock-bajo"
                        />
                        <label htmlFor="stock-bajo" className="text-sm cursor-pointer flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#DC3545]" />
                          <span>Stock Bajo</span>
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedStockStatus.includes('medio')}
                          onCheckedChange={() => toggleStockStatus('medio')}
                          id="stock-medio"
                        />
                        <label htmlFor="stock-medio" className="text-sm cursor-pointer flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#FFC107]" />
                          <span>Stock Medio</span>
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedStockStatus.includes('optimo')}
                          onCheckedChange={() => toggleStockStatus('optimo')}
                          id="stock-optimo"
                        />
                        <label htmlFor="stock-optimo" className="text-sm cursor-pointer flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#4CAF50]" />
                          <span>Stock Óptimo</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Ordenar por */}
                  <div className="space-y-2">
                    <Label className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Ordenar por
                    </Label>
                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nombre">Nombre (A-Z)</SelectItem>
                        <SelectItem value="stock">Stock (Mayor a Menor)</SelectItem>
                        <SelectItem value="categoria">Categoría</SelectItem>
                        <SelectItem value="valor">Valor (Mayor a Menor)</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={limpiarFiltros}
                      className="w-full mt-2"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Limpiar filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Estadísticas de selección */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-[#666666]">
                <span className="font-semibold text-[#333333]">{calcularTotalSeleccion()}</span> productos disponibles
              </span>
              <span className="text-[#666666]">
                <span className="font-semibold text-[#4CAF50]">{carrito.length}</span> en el carrito
              </span>
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="flex-1 overflow-y-auto">
          {productosFiltrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-[#F4F4F4] rounded-full p-6 mb-4">
                <Package className="w-16 h-16 text-[#CCCCCC]" />
              </div>
              <p className="text-[#666666] mb-2 font-semibold">No se encontraron productos</p>
              <p className="text-sm text-[#999999]">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div 
              className={
                vistaMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-1"
                  : "space-y-3 p-1"
              }
            >
              {productosFiltrados.map(producto => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
            </div>
          )}
        </div>

        {/* Footer con resumen */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#1E73BE]" />
                <div>
                  <p className="text-xs text-[#666666]">Items en carrito</p>
                  <p className="font-bold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {carrito.reduce((sum, item) => sum + item.cantidad, 0)}
                  </p>
                </div>
              </div>
              <div className="h-8 w-px bg-[#E0E0E0]" />
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-[#4CAF50]" />
                <div>
                  <p className="text-xs text-[#666666]">Productos únicos</p>
                  <p className="font-bold text-[#4CAF50]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {carrito.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleAbrirGenerarComanda}
                disabled={carrito.length === 0}
                className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
              >
                <FileText className="w-4 h-4 mr-2" />
                {t('inventory.generateOrder')}
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                className="bg-[#1E73BE] hover:bg-[#1557A0]"
                style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
              >
                <Check className="w-4 h-4 mr-2" />
                Finalizar Selección
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
      
      {/* Diálogo de Generar Comanda */}
      <Dialog open={generarComandaOpen} onOpenChange={setGenerarComandaOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="generar-comanda-description">
          <DialogHeader>
            <DialogTitle 
              className="flex items-center gap-2" 
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
            >
              <ShoppingCart className="w-6 h-6 text-[#1E73BE]" />
              Generar Comanda del Panier
            </DialogTitle>
            <DialogDescription id="generar-comanda-description">
              Crea una comanda con los productos del panier actual
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Resumen del carrito */}
            <Card className="bg-[#F4F4F4]">
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {t('inventory.summary')}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#666666]">{t('inventory.totalItems')}</span>
                    <span className="font-bold text-[#1E73BE]">{carrito.reduce((sum, item) => sum + item.cantidad, 0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#666666]">{t('inventory.selectedProducts')}</span>
                    <span className="font-bold text-[#4CAF50]">{carrito.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seleccionar organismo */}
            <div className="space-y-2">
              <Label htmlFor="organismo" className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('inventory.selectOrganism')} *
              </Label>
              <Select value={organismoSeleccionado} onValueChange={setOrganismoSeleccionado}>
                <SelectTrigger id="organismo">
                  <SelectValue placeholder={t('inventory.selectOrganism')} />
                </SelectTrigger>
                <SelectContent>
                  {organismosActivos.map(organismo => (
                    <SelectItem key={organismo.id} value={organismo.id}>
                      {organismo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fecha de entrega */}
            <div className="space-y-2">
              <Label htmlFor="fechaEntrega" className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('inventory.deliveryDate')} *
              </Label>
              <Input
                id="fechaEntrega"
                type="date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observaciones" className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('inventory.orderNotes')}
              </Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder={t('inventory.orderNotesPlaceholder')}
                rows={3}
              />
            </div>

            {organismoPreview && comandaPreview && (
              <div className="space-y-2">
                <Label className="font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Simulation de réception par l'organisme
                </Label>
                <SimulacionRecepcionNotificacion
                  organismo={organismoPreview}
                  comanda={comandaPreview}
                  notificacion={notificacionPreview}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setGenerarComandaOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleGenerarComanda}
              className="bg-[#4CAF50] hover:bg-[#45a049] text-white"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
            >
              <FileText className="w-4 h-4 mr-2" />
              {t('inventory.generateOrderButton')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}