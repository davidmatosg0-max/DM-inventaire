import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  MapPin, 
  Barcode,
  FileText,
  Clock,
  Plus,
  Minus,
  RefreshCw,
  Edit,
  Download,
  Printer,
  Truck,
  CheckCircle2,
  Building2,
  ArrowRightLeft
} from 'lucide-react';
import { mockMovimientos, mockProductos } from '../../data/mockData';
import { BarcodeDisplay } from '../ui/barcode-display';
import { generarCodigoBarrasEAN13, generarCodigoLote, generarCodigoUbicacion } from '../../utils/barcode';
import { obtenerMovimientosProducto, obtenerEstadisticasProducto, type MovimientoExtendido } from '../../utils/movimientoStorage';
import { obtenerProductos } from '../../utils/productStorage';

interface HistorialProductoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productoId: string;
  categoriasInfo: Record<string, { icono: string; valorMonetario: number; color: string }>;
}

export function HistorialProductoDialog({
  open,
  onOpenChange,
  productoId,
  categoriasInfo
}: HistorialProductoDialogProps) {
  const { t } = useTranslation();
  const [tabActiva, setTabActiva] = useState('historial');
  
  // Buscar el producto primero en localStorage, luego en mockProductos
  const productosLocalStorage = obtenerProductos();
  let producto = productosLocalStorage.find(p => p.id === productoId);
  
  if (!producto) {
    producto = mockProductos.find(p => p.id === productoId);
  }
  
  if (!producto) return null;

  const movimientosProducto: MovimientoExtendido[] = obtenerMovimientosProducto(productoId);
  const estadisticasProducto = obtenerEstadisticasProducto(productoId);
  const categoriaInfo = categoriasInfo[producto.categoria] || { 
    icono: '📦', 
    valorMonetario: 0, 
    color: '#999999' 
  };

  // Calcular estadísticas
  const totalEntradas = estadisticasProducto.totalEntradas;
  
  const totalSalidas = estadisticasProducto.totalSalidas;
  
  const totalTransformaciones = estadisticasProducto.totalTransformaciones;

  const totalCorrecciones = estadisticasProducto.totalCorrecciones;

  // Generar códigos de barras
  const codigoBarrasProducto = generarCodigoBarrasEAN13(producto.id);
  const codigoLote = producto.lote 
    ? producto.lote 
    : generarCodigoLote(producto.id, producto.fechaVencimiento || '2025-12-31');
  const codigoUbicacion = generarCodigoUbicacion(producto.ubicacion);

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <Plus className="w-4 h-4 text-[#4CAF50]" />;
      case 'salida':
        return <Minus className="w-4 h-4 text-[#DC3545]" />;
      case 'transformacion':
        return <RefreshCw className="w-4 h-4 text-[#1E73BE]" />;
      case 'correccion':
        return <Edit className="w-4 h-4 text-[#FFC107]" />;
      case 'distribucion':
        return <Truck className="w-4 h-4 text-[#1E73BE]" />;
      case 'distribucion_completada':
        return <CheckCircle2 className="w-4 h-4 text-[#4CAF50]" />;
      case 'ajuste_stock':
        return <Edit className="w-4 h-4 text-[#FFC107]" />;
      case 'conversion_unidad':
        return <ArrowRightLeft className="w-4 h-4 text-[#1E73BE]" />;
      default:
        return null;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'text-[#4CAF50]';
      case 'salida':
        return 'text-[#DC3545]';
      case 'transformacion':
        return 'text-[#1E73BE]';
      case 'correccion':
        return 'text-[#FFC107]';
      case 'distribucion':
        return 'text-[#1E73BE]';
      case 'distribucion_completada':
        return 'text-[#4CAF50]';
      case 'ajuste_stock':
        return 'text-[#FFC107]';
      case 'conversion_unidad':
        return 'text-[#1E73BE]';
      default:
        return 'text-[#666666]';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'entrada': return 'Entrada';
      case 'salida': return 'Salida';
      case 'transformacion': return 'Transformación';
      case 'correccion': return 'Corrección';
      case 'distribucion': return 'Distribución';
      case 'distribucion_completada': return 'Entregado';
      case 'ajuste_stock': return 'Ajuste';
      case 'conversion_unidad': return 'Conversión';
      default: return tipo.charAt(0).toUpperCase() + tipo.slice(1);
    }
  };

  const getStockStatus = () => {
    const percentage = (producto.stockActual / producto.stockMinimo) * 100;
    if (percentage <= 100) return { 
      label: 'Stock Bajo', 
      color: 'bg-[#DC3545]', 
      textColor: 'text-[#DC3545]',
      bgColor: 'bg-red-50',
      icon: <TrendingDown className="w-5 h-5" />
    };
    if (percentage <= 150) return { 
      label: 'Stock Medio', 
      color: 'bg-[#FFC107]', 
      textColor: 'text-[#FFC107]',
      bgColor: 'bg-yellow-50',
      icon: <TrendingUp className="w-5 h-5" />
    };
    return { 
      label: 'Stock Óptimo', 
      color: 'bg-[#4CAF50]', 
      textColor: 'text-[#4CAF50]',
      bgColor: 'bg-green-50',
      icon: <TrendingUp className="w-5 h-5" />
    };
  };

  const status = getStockStatus();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col" aria-describedby="historial-producto-description">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '1.5rem' }}>
            Historial del Producto
          </DialogTitle>
          <DialogDescription id="historial-producto-description">
            Revisa todas las entradas, salidas y movimientos de este producto
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 py-4">
            {/* Información del Producto */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Tarjeta Principal */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <Package className="w-5 h-5 text-[#1E73BE]" />
                    Información del Producto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {/* Imagen/Icono */}
                    <div className="flex-shrink-0">
                      {producto.foto ? (
                        <img 
                          src={producto.foto} 
                          alt={producto.nombre} 
                          className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-lg flex items-center justify-center bg-gray-50 border-2 border-gray-200">
                          <span className="text-6xl">{producto.icono || categoriaInfo.icono}</span>
                        </div>
                      )}
                    </div>

                    {/* Detalles */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="font-bold text-xl text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {producto.nombre}
                        </h3>
                        <p className="text-[#666666] text-sm">Código: {producto.codigo}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge 
                          className="font-semibold" 
                          style={{ 
                            backgroundColor: categoriaInfo.color, 
                            color: 'white',
                            border: 'none'
                          }}
                        >
                          {categoriaInfo.icono} {producto.categoria}
                        </Badge>
                        <Badge 
                          className="font-semibold" 
                          style={{ 
                            backgroundColor: categoriaInfo.color, 
                            color: 'white',
                            border: 'none'
                          }}
                        >
                          ${formatMoney(categoriaInfo.valorMonetario || 0)} / kg
                        </Badge>
                        {producto.esPRS && (
                          <Badge className="bg-[#4CAF50] hover:bg-[#45a049]">
                            ✓ PRS
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-[#666666]">Ubicación</p>
                          <p className="font-medium flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-[#1E73BE]" />
                            {producto.ubicacion}
                          </p>
                        </div>
                        {producto.fechaVencimiento && (
                          <div>
                            <p className="text-[#666666]">Vencimiento</p>
                            <p className="font-medium flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-[#DC3545]" />
                              {producto.fechaVencimiento}
                            </p>
                          </div>
                        )}
                        {producto.cantidadUnidades && (
                          <div>
                            <p className="text-[#666666]">Unidades por paquete</p>
                            <p className="font-medium">
                              {producto.cantidadUnidades} {producto.tipoUnidad}
                            </p>
                          </div>
                        )}
                        {producto.lote && (
                          <div>
                            <p className="text-[#666666]">Lote</p>
                            <p className="font-medium">{producto.lote}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estado del Stock */}
              <Card className={`${status.bgColor} border-2`} style={{ borderColor: status.color.replace('bg-', '#') }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {status.icon}
                    <span className={status.textColor}>Estado del Stock</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-[#666666] mb-1">Stock Actual</p>
                    <p className="font-bold text-3xl" style={{ color: status.color.replace('bg-', '#') }}>
                      {producto.stockActual}
                    </p>
                    <p className="text-sm text-[#666666]">{producto.unidad}</p>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-300">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#666666]">Stock Mínimo</span>
                      <span className="font-medium">{producto.stockMinimo} {producto.unidad}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#666666]">Porcentaje</span>
                      <span className={`font-bold ${status.textColor}`}>
                        {((producto.stockActual / producto.stockMinimo) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <Badge className={`w-full justify-center py-2 ${status.color} text-white hover:${status.color}`}>
                    {status.label}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            {/* Estadísticas de Movimientos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-[#4CAF50]">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#666666]">Total Entradas</p>
                      <p className="font-bold text-2xl text-[#4CAF50]">
                        +{totalEntradas}
                      </p>
                    </div>
                    <Plus className="w-10 h-10 text-[#4CAF50] opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[#DC3545]">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#666666]">Total Salidas</p>
                      <p className="font-bold text-2xl text-[#DC3545]">
                        -{totalSalidas}
                      </p>
                    </div>
                    <Minus className="w-10 h-10 text-[#DC3545] opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[#1E73BE]">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#666666]">Transformaciones</p>
                      <p className="font-bold text-2xl text-[#1E73BE]">
                        {totalTransformaciones}
                      </p>
                    </div>
                    <RefreshCw className="w-10 h-10 text-[#1E73BE] opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[#FFC107]">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[#666666]">Correcciones</p>
                      <p className="font-bold text-2xl text-[#FFC107]">
                        {totalCorrecciones}
                      </p>
                    </div>
                    <Edit className="w-10 h-10 text-[#FFC107] opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs de Historial y Códigos */}
            <Tabs value={tabActiva} onValueChange={setTabActiva}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="historial" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <FileText className="w-4 h-4 mr-2" />
                  Historial de Movimientos ({movimientosProducto.length})
                </TabsTrigger>
                <TabsTrigger value="codigos" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <Barcode className="w-4 h-4 mr-2" />
                  Códigos de Barras
                </TabsTrigger>
              </TabsList>

              <TabsContent value="historial" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Registro de Movimientos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {movimientosProducto.length === 0 ? (
                      <div className="text-center py-12">
                        <Clock className="w-16 h-16 text-[#CCCCCC] mx-auto mb-4" />
                        <p className="text-[#666666]">No hay movimientos registrados para este producto</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Cantidad</TableHead>
                              <TableHead>Peso Unitario</TableHead>
                              <TableHead>Fecha Entrada</TableHead>
                              <TableHead>Motivo/Destino</TableHead>
                              <TableHead>Usuario</TableHead>
                              <TableHead>Documento</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {movimientosProducto
                              .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                              .map(mov => (
                                <TableRow key={mov.id} className="hover:bg-gray-50">
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4 text-[#666666]" />
                                      <span className="text-sm">
                                        {new Date(mov.fecha).toLocaleString('es-ES', {
                                          year: 'numeric',
                                          month: '2-digit',
                                          day: '2-digit',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      {getTipoIcon(mov.tipo)}
                                      <span className={`font-medium ${getTipoColor(mov.tipo)}`}>
                                        {getTipoLabel(mov.tipo)}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col">
                                      <span className={`font-bold ${getTipoColor(mov.tipo)}`}>
                                        {mov.tipo === 'entrada' ? '+' : (mov.tipo === 'salida' || mov.tipo === 'distribucion' || mov.tipo === 'distribucion_completada') ? '-' : ''}
                                        {formatQuantity(mov.cantidad)} {producto.unidad}
                                      </span>
                                      {(mov.cantidadAnterior !== undefined && mov.cantidadActual !== undefined) && (
                                        <span className="text-xs text-[#999999]">
                                          {formatQuantity(mov.cantidadAnterior)} → {formatQuantity(mov.cantidadActual)}
                                        </span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    {mov.pesoUnitario ? (
                                      <div className="flex flex-col">
                                        <span className="font-medium text-[#1E73BE]">
                                          {formatQuantity(mov.pesoUnitario)} kg
                                        </span>
                                        <span className="text-xs text-[#999999]">
                                          por unidad
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-[#999999]">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {mov.fechaEntrada ? (
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-[#1E73BE]" />
                                        <span className="text-sm">
                                          {new Date(mov.fechaEntrada).toLocaleDateString('es-ES', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit'
                                          })}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-[#999999]">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[#666666]">{mov.motivo}</span>
                                      {mov.organismoNombre && (
                                        <div className="flex items-center gap-1 text-xs text-[#1E73BE]">
                                          <Building2 className="w-3 h-3" />
                                          {mov.organismoNombre}
                                        </div>
                                      )}
                                      {mov.observaciones && (
                                        <span className="text-xs italic text-[#999999]">{mov.observaciones}</span>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-sm">{mov.usuario}</TableCell>
                                  <TableCell>
                                    <div className="flex flex-col gap-1">
                                      {mov.numeroComanda && (
                                        <Badge className="bg-[#1E73BE] text-white text-xs">
                                          {mov.numeroComanda}
                                        </Badge>
                                      )}
                                      {mov.documentoReferencia && !mov.numeroComanda && (
                                        <span className="text-sm text-[#666666]">{mov.documentoReferencia}</span>
                                      )}
                                      {!mov.documentoReferencia && !mov.numeroComanda && (
                                        <span className="text-sm text-[#999999]">-</span>
                                      )}
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
              </TabsContent>

              <TabsContent value="codigos" className="mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <BarcodeDisplay
                    value={codigoBarrasProducto}
                    format="EAN13"
                    label="Código de Producto (EAN-13)"
                    displayValue={`${producto.nombre} - ${producto.codigo}`}
                    width={2}
                    height={60}
                  />
                  
                  <BarcodeDisplay
                    value={codigoLote}
                    format="CODE128"
                    label="Código de Lote"
                    displayValue={codigoLote}
                    width={2}
                    height={60}
                  />
                  
                  <BarcodeDisplay
                    value={codigoUbicacion}
                    format="CODE128"
                    label="Código de Ubicación"
                    displayValue={`Ubicación: ${producto.ubicacion}`}
                    width={2}
                    height={60}
                  />
                </div>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Acciones Rápidas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Descargar Todos los Códigos
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Printer className="w-4 h-4" />
                        Imprimir Etiquetas
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Barcode className="w-4 h-4" />
                        Generar Código QR
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}