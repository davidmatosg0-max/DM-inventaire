import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle,
  ShoppingCart, Package, DollarSign, Scale, CheckCircle2,
  AlertCircle, Plus, Minus, X, Check, Tag
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { 
  obtenerOfertaPorId,
  crearSolicitudOferta,
  type Oferta,
  type ProductoOferta 
} from '../../utils/ofertaStorage';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';

type ProductoSeleccionado = ProductoOferta & {
  cantidadAceptada: number;
  seleccionado: boolean;
};

interface DialogAceptarOfertaProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ofertaId: string;
  organismoId: string;
  organismoNombre: string;
  onOfertaAceptada: () => void;
}

export function DialogAceptarOferta({
  open,
  onOpenChange,
  ofertaId,
  organismoId,
  organismoNombre,
  onOfertaAceptada
}: DialogAceptarOfertaProps) {
  const { t } = useTranslation();
  
  const [oferta, setOferta] = useState<Oferta | null>(null);
  const [productos, setProductos] = useState<ProductoSeleccionado[]>([]);
  const [modoAceptacion, setModoAceptacion] = useState<'completa' | 'parcial'>('completa');
  const [notasAdicionales, setNotasAdicionales] = useState('');

  // Cargar oferta cuando se abre el diálogo
  useEffect(() => {
    if (open && ofertaId) {
      const ofertaData = obtenerOfertaPorId(ofertaId);
      if (ofertaData) {
        setOferta(ofertaData);
        
        // Inicializar productos con cantidades disponibles
        const productosIniciales: ProductoSeleccionado[] = ofertaData.productos.map(p => ({
          ...p,
          cantidadAceptada: p.cantidadDisponible,
          seleccionado: true
        }));
        setProductos(productosIniciales);
      }
    }
  }, [open, ofertaId]);

  // Calcular totales según productos seleccionados
  const calcularTotales = () => {
    const productosSeleccionados = productos.filter(p => p.seleccionado);
    
    return {
      totalProductos: productosSeleccionados.length,
      totalItems: productosSeleccionados.reduce((sum, p) => sum + p.cantidadAceptada, 0),
      totalKilos: productosSeleccionados.reduce((sum, p) => {
        if (p.unidad === 'kg') {
          return sum + p.cantidadAceptada;
        }
        return sum + (p.cantidadAceptada * p.peso);
      }, 0),
      valorTotal: productosSeleccionados.reduce((sum, p) => 
        sum + (p.cantidadAceptada * p.valorUnitario), 0
      )
    };
  };

  // Toggle selección de producto
  const toggleProducto = (productoId: string) => {
    setProductos(prev => 
      prev.map(p => 
        p.productoId === productoId 
          ? { ...p, seleccionado: !p.seleccionado }
          : p
      )
    );
  };

  // Ajustar cantidad de un producto
  const ajustarCantidad = (productoId: string, nuevaCantidad: number) => {
    setProductos(prev =>
      prev.map(p => {
        if (p.productoId === productoId) {
          // No permitir cantidades negativas o mayores a la disponible
          const cantidadValida = Math.max(0, Math.min(nuevaCantidad, p.cantidadDisponible));
          return { ...p, cantidadAceptada: cantidadValida };
        }
        return p;
      })
    );
  };

  // Incrementar cantidad
  const incrementarCantidad = (productoId: string) => {
    const producto = productos.find(p => p.productoId === productoId);
    if (producto && producto.cantidadAceptada < producto.cantidadDisponible) {
      ajustarCantidad(productoId, producto.cantidadAceptada + 1);
    }
  };

  // Decrementar cantidad
  const decrementarCantidad = (productoId: string) => {
    const producto = productos.find(p => p.productoId === productoId);
    if (producto && producto.cantidadAceptada > 0) {
      ajustarCantidad(productoId, producto.cantidadAceptada - 1);
    }
  };

  // Seleccionar todos los productos
  const seleccionarTodos = () => {
    setProductos(prev => prev.map(p => ({ ...p, seleccionado: true })));
  };

  // Deseleccionar todos los productos
  const deseleccionarTodos = () => {
    setProductos(prev => prev.map(p => ({ ...p, seleccionado: false })));
  };

  // Validar aceptación
  const validarAceptacion = (): boolean => {
    const productosSeleccionados = productos.filter(p => p.seleccionado);
    
    if (productosSeleccionados.length === 0) {
      toast.error('Debe seleccionar al menos un producto');
      return false;
    }

    const hayProductosSinCantidad = productosSeleccionados.some(p => p.cantidadAceptada <= 0);
    if (hayProductosSinCantidad) {
      toast.error('Los productos seleccionados deben tener cantidad mayor a 0');
      return false;
    }

    return true;
  };

  // Enviar solicitud de oferta
  const handleAceptarOferta = () => {
    if (!validarAceptacion() || !oferta) return;

    try {
      const productosAceptados = productos
        .filter(p => p.seleccionado && p.cantidadAceptada > 0)
        .map(p => ({
          productoId: p.productoId,
          cantidadAceptada: p.cantidadAceptada
        }));

      const exito = crearSolicitudOferta(ofertaId, organismoId, organismoNombre, productosAceptados, notasAdicionales);

      if (!exito) {
        toast.error('No fue posible registrar la solicitud con las cantidades seleccionadas');
        return;
      }

      const totales = calcularTotales();
      const esAceptacionCompleta = productos.every(p => 
        p.seleccionado && p.cantidadAceptada === p.cantidadDisponible
      );

      toast.success(
        <div>
          <p className="font-semibold mb-1">✅ Solicitud enviada exitosamente</p>
          <p className="text-sm">
            {esAceptacionCompleta ? 'Solicitud completa' : 'Solicitud parcial'} - {totales.totalProductos} productos
          </p>
          <p className="text-sm">
            Total: CAD$ {formatMoney(totales.valorTotal)} • {formatQuantity(totales.totalKilos)} kg
          </p>
        </div>,
        { duration: 5000 }
      );

      onOfertaAceptada();
      onOpenChange(false);
    } catch (error) {
      toast.error('Error al registrar la solicitud');
      console.error(error);
    }
  };

  const totales = calcularTotales();
  const productosSeleccionadosCount = productos.filter(p => p.seleccionado).length;

  if (!oferta) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col" aria-describedby="aceptar-oferta-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#4CAF50] to-[#45A049] flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl">Aceptar Oferta</span>
          </DialogTitle>
          <DialogDescription id="aceptar-oferta-description">
            Revisa y acepta los productos de esta oferta para tu organismo
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto py-4 space-y-6">
          {/* Información de la oferta */}
          <Card className="border-2 border-[#1E73BE] bg-[#E3F2FD]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-5 h-5 text-[#1E73BE]" />
                    <h3 className="font-semibold text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {oferta.titulo}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{oferta.numeroOferta}</p>
                  {oferta.descripcion && (
                    <p className="text-sm text-gray-600">{oferta.descripcion}</p>
                  )}
                </div>
                <div className="text-right">
                  <Badge className="bg-[#4CAF50] text-white mb-2">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Activa
                  </Badge>
                  <p className="text-xs text-gray-600">
                    Expira: {new Date(oferta.fechaExpiracion).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modo de aceptación */}
          <Card className="border-2 border-gray-200">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Modo de Aceptación
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    modoAceptacion === 'completa'
                      ? 'border-[#4CAF50] bg-[#E8F5E9]'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => {
                    setModoAceptacion('completa');
                    seleccionarTodos();
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className={`w-5 h-5 ${modoAceptacion === 'completa' ? 'text-[#4CAF50]' : 'text-gray-400'}`} />
                    <p className="font-semibold">Aceptación Completa</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    Aceptar todos los productos con las cantidades ofrecidas
                  </p>
                </div>

                <div
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    modoAceptacion === 'parcial'
                      ? 'border-[#1E73BE] bg-[#E3F2FD]'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onClick={() => setModoAceptacion('parcial')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Package className={`w-5 h-5 ${modoAceptacion === 'parcial' ? 'text-[#1E73BE]' : 'text-gray-400'}`} />
                    <p className="font-semibold">Aceptación Parcial</p>
                  </div>
                  <p className="text-xs text-gray-600">
                    Seleccionar productos y ajustar cantidades según necesidad
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Productos */}
          <Card className="border-2 border-[#4CAF50]">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <Package className="w-5 h-5 inline mr-2" />
                  Productos Disponibles
                </h3>
                {modoAceptacion === 'parcial' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={seleccionarTodos}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Todos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={deseleccionarTodos}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Ninguno
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {productos.map((producto, index) => (
                  <div
                    key={`${producto.productoId}-${index}`}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      producto.seleccionado
                        ? 'border-[#4CAF50] bg-[#E8F5E9]'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Checkbox de selección */}
                      {modoAceptacion === 'parcial' && (
                        <Checkbox
                          checked={producto.seleccionado}
                          onCheckedChange={() => toggleProducto(producto.productoId)}
                          disabled={producto.cantidadDisponible === 0}
                        />
                      )}

                      {/* Icono y nombre del producto */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{producto.icono}</span>
                          <div>
                            <p className="font-semibold">{producto.productoNombre}</p>
                            <p className="text-xs text-gray-600">{producto.productoCodigo}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 text-xs">
                          <Badge variant="outline">{producto.categoria}</Badge>
                          <Badge variant="outline">
                            Disponible: {formatQuantity(producto.cantidadDisponible)} {producto.unidad}
                          </Badge>
                        </div>
                      </div>

                      {/* Controles de cantidad */}
                      {modoAceptacion === 'parcial' ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => decrementarCantidad(producto.productoId)}
                            disabled={!producto.seleccionado || producto.cantidadAceptada <= 0}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            value={formatQuantity(producto.cantidadAceptada)}
                            onChange={(e) => ajustarCantidad(producto.productoId, parseFloat(e.target.value) || 0)}
                            className="w-20 text-center"
                            disabled={!producto.seleccionado}
                            min={0}
                            max={producto.cantidadDisponible}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => incrementarCantidad(producto.productoId)}
                            disabled={!producto.seleccionado || producto.cantidadAceptada >= producto.cantidadDisponible}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <span className="text-sm text-gray-600 ml-2 min-w-[40px]">
                            {producto.unidad}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#4CAF50] text-white text-lg px-4 py-1">
                            {formatQuantity(producto.cantidadDisponible)} {producto.unidad}
                          </Badge>
                        </div>
                      )}

                      {/* Valor */}
                      <div className="text-right min-w-[100px]">
                        <p className="text-sm text-gray-600">Valor</p>
                        <p className="font-bold text-[#4CAF50]">
                          CAD$ {formatMoney(producto.cantidadAceptada * producto.valorUnitario)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resumen de totales */}
          <Card className="border-2 border-[#1E73BE]">
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Resumen de Aceptación
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-[#E3F2FD] rounded-lg">
                  <Package className="w-6 h-6 mx-auto mb-2 text-[#1E73BE]" />
                  <p className="text-xs text-gray-600">Productos</p>
                  <p className="text-xl font-bold text-[#1E73BE]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {totales.totalProductos}
                  </p>
                </div>
                <div className="text-center p-3 bg-[#E8F5E9] rounded-lg">
                  <Package className="w-6 h-6 mx-auto mb-2 text-[#4CAF50]" />
                  <p className="text-xs text-gray-600">Items Total</p>
                  <p className="text-xl font-bold text-[#4CAF50]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {formatQuantity(totales.totalItems)}
                  </p>
                </div>
                <div className="text-center p-3 bg-[#FFF8E1] rounded-lg">
                  <Scale className="w-6 h-6 mx-auto mb-2 text-[#FFC107]" />
                  <p className="text-xs text-gray-600">Peso Total</p>
                  <p className="text-xl font-bold text-[#FFC107]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {formatQuantity(totales.totalKilos)} kg
                  </p>
                </div>
                <div className="text-center p-3 bg-[#E8F5E9] rounded-lg">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-[#4CAF50]" />
                  <p className="text-xs text-gray-600">Valor Total</p>
                  <p className="text-xl font-bold text-[#4CAF50]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    CAD$ {formatMoney(totales.valorTotal)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información importante */}
          <Card className="border-l-4 border-l-[#FFC107] bg-[#FFF8E1]">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-[#FFC107] flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-[#FF9800] mb-1">Información Importante</p>
                  <ul className="text-gray-700 space-y-1 list-disc list-inside">
                    <li>Al aceptar la oferta, se generará una comanda automáticamente</li>
                    <li>Los productos aceptados se reservarán para su organismo</li>
                    <li>La comanda quedará pendiente de confirmación por el banco</li>
                    <li>Recibirá una notificación cuando la comanda sea confirmada</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleAceptarOferta}
            className="bg-[#4CAF50] hover:bg-[#45A049]"
            disabled={productosSeleccionadosCount === 0}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Aceptar Oferta ({productosSeleccionadosCount} {productosSeleccionadosCount === 1 ? 'producto' : 'productos'})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}