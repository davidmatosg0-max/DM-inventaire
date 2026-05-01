import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingCart, Trash2, Plus, Minus, Package, DollarSign, Scale, 
  FileText, Save, Download, Printer, TrendingUp, X, Users, Building2, Calendar, Share2, AlertTriangle, ChefHat
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '../ui/sheet';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { mockProductos, mockOrganismos } from '../../data/mockData';
import { guardarComanda, generarNumeroComanda } from '../../utils/comandaStorage';
import { obtenerProductos, actualizarProducto } from '../../utils/productStorage';
import { calcularValorDistribucionProducto } from '../../utils/distributionValue';
import { Comanda } from '../../types';
import { DialogDistribuirProductos } from './DialogDistribuirProductos';
import { DialogEnviarCocina } from './DialogEnviarCocina';
import { obtenerResumenReservasInventario } from '../../utils/inventoryReservations';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';

type CarritoItem = {
  productoId: string;
  cantidad: number;
};

type CarritoGuardado = {
  id: string;
  nombre: string;
  fecha: string;
  items: CarritoItem[];
  valorTotal: number;
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

interface CarritoMejoradoProps {
  carrito: CarritoItem[];
  carritoOpen: boolean;
  setCarritoOpen: (open: boolean) => void;
  actualizarCantidad: (productoId: string, cantidad: number) => void;
  eliminarDelCarrito: (productoId: string) => void;
  vaciarCarrito: () => void;
  onComandaCreada?: () => void; // Callback opcional cuando se crea una comanda
  productos?: any[]; // Lista de productos (opcional, usa mockProductos por defecto)
}

export function CarritoMejorado({
  carrito,
  carritoOpen,
  setCarritoOpen,
  actualizarCantidad,
  eliminarDelCarrito,
  vaciarCarrito,
  onComandaCreada,
  productos = mockProductos
}: CarritoMejoradoProps) {
  const { t } = useTranslation();
  const [carritosGuardados, setCarritosGuardados] = useState<CarritoGuardado[]>([]);
  const [nombreCarrito, setNombreCarrito] = useState('');
  const [guardarDialogOpen, setGuardarDialogOpen] = useState(false);
  
  // Estados para distribuir productos
  const [distribuirDialogOpen, setDistribuirDialogOpen] = useState(false);
  const [enviarCocinaDialogOpen, setEnviarCocinaDialogOpen] = useState(false);
  const reservasInventario = React.useMemo(
    () => obtenerResumenReservasInventario(productos.map(producto => producto.id)),
    [productos]
  );

  const calcularTotalItems = () => {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
  };

  // Calcular el peso total de todos los productos en el carrito
  // Peso total = cantidad × peso unitario de cada producto
  const calcularPesoTotal = () => {
    return carrito.reduce((total, item) => {
      const producto = productos.find(p => p.id === item.productoId);
      return total + calcularValorDistribucionProducto(producto, item.cantidad).pesoTotal;
    }, 0);
  };

  // Calcular el valor monetario total usando la función de valorPorKg
  // Valor total = Peso total (kg) × Valor por kg ($/kg)
  const calcularValorTotal = () => {
    return carrito.reduce((total, item) => {
      const producto = productos.find(p => p.id === item.productoId);
      return total + calcularValorDistribucionProducto(producto, item.cantidad).valorTotal;
    }, 0);
  };

  const guardarCarrito = () => {
    if (!nombreCarrito.trim()) {
      toast.error('Por favor ingrese un nombre para el carrito');
      return;
    }
    
    const nuevoCarrito: CarritoGuardado = {
      id: Date.now().toString(),
      nombre: nombreCarrito,
      fecha: new Date().toISOString(),
      items: [...carrito],
      valorTotal: calcularValorTotal()
    };
    
    setCarritosGuardados([...carritosGuardados, nuevoCarrito]);
    toast.success(`Carrito "${nombreCarrito}" guardado correctamente`);
    setNombreCarrito('');
    setGuardarDialogOpen(false);
  };

  const cargarCarrito = (carritoGuardado: CarritoGuardado) => {
    // Esta función necesitaría ser implementada en el componente padre
    // Para este ejemplo, solo mostramos un mensaje
    toast.info(`Para cargar este carrito, use la función de importación`);
  };

  const exportarCarrito = () => {
    const carritoData = carrito.map(item => {
      const producto = productos.find(p => p.id === item.productoId);
      const valorDistribucion = calcularValorDistribucionProducto(producto, item.cantidad);
      return {
        producto: producto?.nombre || '',
        codigo: producto?.codigo || '',
        categoria: producto?.categoria || '',
        cantidad: item.cantidad,
        unidad: producto?.unidad || '',
        valorUnitario: valorDistribucion.valorUnitario,
        valorTotal: valorDistribucion.valorTotal
      };
    });

    const csvContent = [
      ['Producto', 'Código', 'Categoría', 'Cantidad', 'Unidad', 'Valor Unitario (CAD$)', 'Valor Total (CAD$)'],
      ...carritoData.map(item => [
        item.producto,
        item.codigo,
        item.categoria,
        formatQuantity(item.cantidad),
        item.unidad,
        formatMoney(item.valorUnitario || 0),
        formatMoney(item.valorTotal || 0)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `carrito_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Carrito exportado correctamente');
  };

  const imprimirCarrito = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    const carritoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Liste de Produits - Banque Alimentaire</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1E73BE; margin-bottom: 10px; }
          .header { border-bottom: 3px solid #1E73BE; padding-bottom: 10px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #1E73BE; color: white; font-weight: 600; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .total-section { margin-top: 30px; padding: 20px; background-color: #f4f4f4; border-radius: 8px; }
          .total-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
          .total-item:last-child { border-bottom: none; font-weight: bold; font-size: 1.2em; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🛒 Liste de Produits</h1>
          <p><strong>Banque Alimentaire</strong></p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th>Código</th>
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>Valor Unit. (CAD$)</th>
              <th>Valor Total (CAD$)</th>
            </tr>
          </thead>
          <tbody>
            ${carrito.map((item, index) => {
              const producto = productos.find(p => p.id === item.productoId);
              const categoriaInfo = categoriasInfo[producto?.categoria || ''];
              const valorDistribucion = calcularValorDistribucionProducto(producto, item.cantidad);
              return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${producto?.nombre || ''}</td>
                  <td>${producto?.codigo || ''}</td>
                  <td>${categoriaInfo?.icono || ''} ${producto?.categoria || ''}</td>
                  <td>${formatQuantity(item.cantidad)} ${producto?.unidad || ''}</td>
                  <td>${formatMoney(valorDistribucion.valorUnitario)}</td>
                  <td>${formatMoney(valorDistribucion.valorTotal)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        <div class="total-section">
          <div class="total-item">
            <span>📦 Total de Items:</span>
            <span>${calcularTotalItems()}</span>
          </div>
          <div class="total-item">
            <span>⚖️ Peso Total:</span>
            <span>${formatQuantity(calcularPesoTotal())} kg</span>
          </div>
          <div class="total-item">
            <span>💰 Valor Total Estimado:</span>
            <span>CAD$ ${formatMoney(calcularValorTotal())}</span>
          </div>
        </div>
        <div class="footer">
          <p>Document généré automatiquement par le Système de Gestion de la Banque Alimentaire</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(carritoHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleDistribucionCompletada = () => {
    vaciarCarrito();
    if (onComandaCreada) {
      onComandaCreada();
    }
  };

  return (
    <>
      <Sheet open={carritoOpen} onOpenChange={setCarritoOpen}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '1.5rem', color: '#1E73BE' }}>
                🛒 Lista de Productos
              </SheetTitle>
            </div>
          </SheetHeader>
          
          <div className="flex-1 overflow-auto py-4">
            {carrito.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-[#F4F4F4] rounded-full p-6 mb-4">
                  <ShoppingCart className="w-16 h-16 text-[#CCCCCC]" />
                </div>
                <p className="text-[#666666] mb-2 font-semibold">{t('inventory.emptyCart')}</p>
                <p className="text-sm text-[#999999]">{t('inventory.addProductsFromInventory')}</p>
                
                {/* Carritos guardados */}
                {carritosGuardados.length > 0 && (
                  <div className="mt-8 w-full">
                    <h3 className="font-semibold text-[#333333] mb-3 text-left" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      📋 Carritos Guardados
                    </h3>
                    <div className="space-y-2">
                      {carritosGuardados.map(cg => (
                        <div key={cg.id} className="border-2 border-[#E0E0E0] rounded-lg p-3 bg-white hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-[#333333]">{cg.nombre}</p>
                              <p className="text-xs text-[#666666] mt-1">
                                {new Date(cg.fecha).toLocaleDateString('es-ES')} • {cg.items.length} productos
                              </p>
                              <Badge className="mt-2 bg-[#4CAF50] text-white">
                                CAD$ {formatMoney(cg.valorTotal || 0)}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => cargarCarrito(cg)}
                              className="bg-[#1E73BE] hover:bg-[#1557A0]"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Cargar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Estadísticas del Carrito */}
                <div className="mb-4 grid grid-cols-3 gap-2">
                  <Card className="border-l-4 border-l-[#1E73BE]">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#1E73BE]" />
                        <div>
                          <p className="text-xs text-[#666666]">Items</p>
                          <p className="font-bold text-[#1E73BE]" style={{ fontSize: '1.2rem' }}>{calcularTotalItems()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-[#4CAF50]">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#4CAF50]" />
                        <div>
                          <p className="text-xs text-[#666666]">Valor</p>
                          <p className="font-bold text-[#4CAF50]" style={{ fontSize: '1.2rem' }}>
                            CAD$ {formatMoney(calcularValorTotal() || 0)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-[#FFC107]">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-[#FFC107]" />
                        <div>
                          <p className="text-xs text-[#666666]">Peso</p>
                          <p className="font-bold text-[#FFC107]" style={{ fontSize: '1.2rem' }}>{formatQuantity(calcularPesoTotal())}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Botones de acción rápida */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setGuardarDialogOpen(true)}
                    className="flex-1 border-[#1E73BE] text-[#1E73BE] hover:bg-[#E3F2FD]"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Guardar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportarCarrito}
                    className="flex-1 border-[#4CAF50] text-[#4CAF50] hover:bg-[#E8F5E9]"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Exportar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={imprimirCarrito}
                    className="flex-1 border-[#FFC107] text-[#FFC107] hover:bg-[#FFF8E1]"
                  >
                    <Printer className="w-4 h-4 mr-1" />
                    Imprimir
                  </Button>
                </div>

                {/* Lista de productos en el carrito */}
                <div className="space-y-3">
                  {carrito.map(item => {
                    const producto = productos.find(p => p.id === item.productoId);
                    const categoriaInfo = categoriasInfo[producto?.categoria || ''];
                    const valorDistribucion = calcularValorDistribucionProducto(producto, item.cantidad);
                    const pesoTotalItem = valorDistribucion.pesoTotal;
                    const valorItem = valorDistribucion.valorTotal;

                    const reserva = reservasInventario[item.productoId] || {
                      stockActual: producto?.stockActual || 0,
                      totalReservado: 0,
                      disponibleParaReservar: producto?.stockActual || 0
                    };
                    
                    const excedeStock = item.cantidad > reserva.disponibleParaReservar;
                    
                    return (
                      <div 
                        key={item.productoId} 
                        className={`border-2 rounded-lg p-4 bg-white hover:shadow-md transition-all ${
                          excedeStock 
                            ? 'border-[#DC3545] bg-red-50' 
                            : 'border-[#E0E0E0] hover:border-[#1E73BE]'
                        }`}
                      >
                        {excedeStock && (
                          <div className="mb-2 p-2 bg-[#DC3545] text-white rounded text-xs font-semibold flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            ⚠️ Cantidad excede el stock reservable
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1rem' }}>
                              {producto?.nombre}
                            </h4>
                            <p className="text-sm text-[#666666] mt-1">{producto?.codigo}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge className="bg-[#F4F4F4] text-[#666666] hover:bg-[#F4F4F4]">
                                {categoriaInfo?.icono} {producto?.categoria}
                              </Badge>
                              <Badge className="bg-[#4CAF50] text-white hover:bg-[#4CAF50]">
                                💰 CAD$ {formatMoney(valorItem)}
                              </Badge>
                              <Badge className="bg-[#FFC107] text-white hover:bg-[#FFC107]">
                                ⚖️ {formatQuantity(pesoTotalItem)} kg
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => eliminarDelCarrito(item.productoId)}
                            className="text-[#DC3545] hover:text-white hover:bg-[#DC3545] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 border-2 border-[#DC3545] text-[#DC3545] hover:bg-[#DC3545] hover:text-white transition-colors"
                              onClick={() => actualizarCantidad(item.productoId, item.cantidad - 1)}
                              disabled={item.cantidad <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <div className="flex items-center gap-1 px-3 py-1 bg-[#F4F4F4] rounded-md min-w-[80px] justify-center">
                              <Input
                                type="number"
                                value={item.cantidad}
                                onChange={(e) => {
                                  const nuevaCantidad = parseFloat(e.target.value) || 0;
                                  if (nuevaCantidad > reserva.disponibleParaReservar) {
                                    toast.error(
                                      `Cantidad máxima reservable: ${reserva.disponibleParaReservar} ${producto?.unidad}`,
                                      { duration: 3000 }
                                    );
                                    actualizarCantidad(item.productoId, reserva.disponibleParaReservar || 0);
                                  } else {
                                    actualizarCantidad(item.productoId, nuevaCantidad);
                                  }
                                }}
                                className="w-14 h-7 text-center font-bold border-none bg-transparent p-0"
                                min="0.01"
                                step="0.01"
                                max={reserva.disponibleParaReservar}
                              />
                              <span className="text-sm font-medium text-[#666666]">{producto?.unidad}</span>
                            </div>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 border-2 border-[#4CAF50] text-[#4CAF50] hover:bg-[#4CAF50] hover:text-white transition-colors"
                              onClick={() => actualizarCantidad(item.productoId, item.cantidad + 1)}
                              disabled={item.cantidad >= reserva.disponibleParaReservar}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-xs text-[#666666] text-right">
                            <p>Reservable:</p>
                            <p className={`font-semibold ${item.cantidad > (producto?.stockActual || 0) ? 'text-[#DC3545]' : 'text-[#333333]'}`}>
                              {reserva.disponibleParaReservar} {producto?.unidad}
                            </p>
                            <p className="text-[#666666]">Reservado: {reserva.totalReservado} {producto?.unidad}</p>
                            <p className="text-[#999999]">Físico: {reserva.stockActual} {producto?.unidad}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <SheetFooter className="border-t pt-4 space-y-3">
            {carrito.length > 0 && (
              <>
                <div className="w-full">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#E3F2FD] to-[#E8F5E9] rounded-lg border-2 border-[#1E73BE]">
                    <div>
                      <p className="text-sm text-[#666666]">Total del Carrito</p>
                      <p className="font-bold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '1.5rem' }}>
                        CAD$ {formatMoney(calcularValorTotal())}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[#666666]">{formatQuantity(calcularTotalItems())} items</p>
                      <p className="text-sm font-medium text-[#4CAF50]">{formatQuantity(calcularPesoTotal())} kg</p>
                    </div>
                  </div>
                </div>
                
                <div className="w-full flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={vaciarCarrito}
                    className="flex-1 text-[#DC3545] border-2 border-[#DC3545] hover:bg-[#DC3545] hover:text-white transition-colors"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('inventory.empty')}
                  </Button>
                </div>
                
                <div className="w-full flex gap-2">
                  <Button 
                    onClick={() => setDistribuirDialogOpen(true)}
                    className="flex-1 bg-[#4CAF50] hover:bg-[#45a049] text-white"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Accès Organismes
                  </Button>
                  <Button 
                    onClick={() => setEnviarCocinaDialogOpen(true)}
                    className="flex-1 bg-[#FF9800] hover:bg-[#F57C00] text-white"
                    style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}
                  >
                    <ChefHat className="w-4 h-4 mr-2" />
                    Envoyer à Cuisine
                  </Button>
                </div>
              </>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Dialog para guardar carrito */}
      <Dialog open={guardarDialogOpen} onOpenChange={setGuardarDialogOpen}>
        <DialogContent aria-describedby="guardar-carrito-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
              💾 Guardar Carrito
            </DialogTitle>
            <DialogDescription id="guardar-carrito-description">
              Ingrese un nombre para guardar este carrito y poder cargarlo más tarde
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre del Carrito</Label>
              <Input
                placeholder="Ej: Carrito Comanda Enero 2026"
                value={nombreCarrito}
                onChange={(e) => setNombreCarrito(e.target.value)}
              />
            </div>
            <div className="bg-[#F4F4F4] p-3 rounded-lg">
              <p className="text-sm text-[#666666]">
                <strong>Resumen:</strong>
              </p>
              <p className="text-sm text-[#666666] mt-1">
                {formatQuantity(calcularTotalItems())} items • CAD$ {formatMoney(calcularValorTotal())}
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setGuardarDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarCarrito} className="bg-[#1E73BE] hover:bg-[#1557A0]">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para distribuir productos */}
      <DialogDistribuirProductos
        open={distribuirDialogOpen}
        onOpenChange={setDistribuirDialogOpen}
        carrito={carrito}
        productos={productos}
        categoriasInfo={categoriasInfo}
        onDistribucionCompletada={handleDistribucionCompletada}
      />
      
      {/* Dialog para enviar a cocina */}
      <DialogEnviarCocina
        open={enviarCocinaDialogOpen}
        onOpenChange={setEnviarCocinaDialogOpen}
        carrito={carrito}
        productos={productos}
        categoriasInfo={categoriasInfo}
        onEnvioCompletado={handleDistribucionCompletada}
      />
    </>
  );
}