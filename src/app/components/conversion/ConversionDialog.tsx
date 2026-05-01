import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { ArrowRightLeft, Plus, X, TrendingDown, BookmarkPlus, Bookmark, AlertTriangle, Package } from 'lucide-react';
import type { ProductoCreado } from '../../utils/productStorage';
import type { PlantillaConversion } from '../../utils/conversionStorage';

interface ConversionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productos: ProductoCreado[];
  plantillas: PlantillaConversion[];
  formConversion: {
    productoOrigenId: string;
    productosDestino: Array<{ productoId: string; ratio: number }>;
    cantidadOrigen: number;
    merma: number;
    mermaMotivo: string;
    observaciones: string;
    guardarComoPlantilla: boolean;
    nombrePlantilla: string;
  };
  setFormConversion: (form: any) => void;
  onConvertir: () => void;
  onAgregarDestino: () => void;
  onEliminarDestino: (index: number) => void;
  onActualizarDestino: (index: number, campo: 'productoId' | 'ratio', valor: any) => void;
  onAplicarPlantilla: (plantilla: PlantillaConversion) => void;
}

export function ConversionDialog({
  open,
  onOpenChange,
  productos,
  plantillas,
  formConversion,
  setFormConversion,
  onConvertir,
  onAgregarDestino,
  onEliminarDestino,
  onActualizarDestino,
  onAplicarPlantilla
}: ConversionDialogProps) {
  const productoOrigen = productos.find(p => p.id === formConversion.productoOrigenId);
  const cantidadTotalOrigen = formConversion.cantidadOrigen + formConversion.merma;

  // Debug: mostrar productos disponibles
  React.useEffect(() => {
    if (open) {
      console.log('📦 Productos recibidos en ConversionDialog:', productos.length);
      console.log('📦 Productos con stock > 0:', productos.filter(p => p.stockActual > 0).length);
      console.log('📦 Productos activos:', productos.filter(p => p.activo !== false).length);
      console.log('📦 Productos disponibles para conversión:', 
        productos.filter(p => p.activo !== false && p.stockActual > 0)
      );
    }
  }, [open, productos]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="conversion-dialog-description">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }} className="text-xl flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-[#FFC107]" />
            Conversión Múltiple de Productos
          </DialogTitle>
          <DialogDescription id="conversion-dialog-description" className="text-sm mt-1">
            Convierte un producto en múltiples productos destino. Ideal para clasificar "Frutas Mix" en Manzanas, Naranjas, etc.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plantillas disponibles */}
          {plantillas.length > 0 && !formConversion.productoOrigenId && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bookmark className="w-5 h-5 text-[#1E73BE]" />
                <h4 className="font-medium text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Plantillas Disponibles
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {plantillas.slice(0, 4).map(plantilla => (
                  <button
                    key={plantilla.id}
                    onClick={() => onAplicarPlantilla(plantilla)}
                    className="text-left p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <p className="font-medium text-sm text-[#333333]">{plantilla.nombre}</p>
                    <p className="text-xs text-[#666666] mt-1">
                      {plantilla.configuracion.length} productos • Usada {plantilla.vecesUsada} veces
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Producto Origen */}
          <div className="space-y-2">
            <Label htmlFor="productoOrigen" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
              Producto Origen <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formConversion.productoOrigenId}
              onValueChange={(value) => {
                setFormConversion({ ...formConversion, productoOrigenId: value });
              }}
            >
              <SelectTrigger id="productoOrigen" className="h-11">
                <SelectValue placeholder="Selecciona el producto origen..." />
              </SelectTrigger>
              <SelectContent>
                {productos
                  .filter(p => p.activo !== false && p.stockActual > 0)
                  .length === 0 ? (
                    <div className="p-4 text-center text-sm text-[#666666]">
                      <p className="font-medium mb-1">Aucun produit disponible</p>
                      <p className="text-xs">Ajoutez des produits avec stock &gt; 0</p>
                    </div>
                  ) : (
                    productos
                      .filter(p => p.activo !== false && p.stockActual > 0)
                      .map(producto => (
                        <SelectItem key={producto.id} value={producto.id}>
                          <div className="flex items-center gap-2">
                            <span>{producto.icono}</span>
                            <span className="font-medium">{producto.nombre}</span>
                            <Badge variant="outline" className="text-xs">
                              {producto.stockActual} {producto.unidad}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                  )}
              </SelectContent>
            </Select>
            {productoOrigen && (
              <div className="space-y-1">
                <p className="text-xs text-[#666666]">
                  Stock disponible: {productoOrigen.stockActual} {productoOrigen.unidad}
                </p>
                {productoOrigen.peso && (
                  <p className="text-xs text-[#4CAF50] font-medium">
                    Peso por unidad: {productoOrigen.peso} {productoOrigen.unidad}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Cantidad a Convertir */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cantidadOrigen" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                Cantidad a Convertir <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cantidadOrigen"
                type="number"
                step="0.01"
                min="0"
                value={formConversion.cantidadOrigen || ''}
                onChange={(e) => setFormConversion({ ...formConversion, cantidadOrigen: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="h-11"
              />
            </div>

            {/* Merma/Pérdida */}
            <div className="space-y-2">
              <Label htmlFor="merma" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                <TrendingDown className="w-4 h-4 inline mr-1" />
                Merma/Pérdida (opcional)
              </Label>
              <Input
                id="merma"
                type="number"
                step="0.01"
                min="0"
                value={formConversion.merma || ''}
                onChange={(e) => setFormConversion({ ...formConversion, merma: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                className="h-11"
              />
              {formConversion.merma > 0 && productoOrigen && (
                <p className="text-xs text-[#DC3545]">
                  Total a restar: {cantidadTotalOrigen.toFixed(2)} {productoOrigen.unidad} 
                  ({((formConversion.merma / formConversion.cantidadOrigen) * 100).toFixed(1)}% merma)
                </p>
              )}
            </div>
          </div>

          {/* Motivo de merma */}
          {formConversion.merma > 0 && (
            <div className="space-y-2">
              <Label htmlFor="mermaMotivo" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                Motivo de la Merma
              </Label>
              <Input
                id="mermaMotivo"
                value={formConversion.mermaMotivo}
                onChange={(e) => setFormConversion({ ...formConversion, mermaMotivo: e.target.value })}
                placeholder="Ej: Pérdida por cáscara, partes dañadas, etc."
                className="h-11"
              />
            </div>
          )}

          {/* Indicador visual */}
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center gap-3">
              <div className="h-px w-12 bg-[#E0E0E0]"></div>
              <ArrowRightLeft className="w-6 h-6 text-[#FFC107]" />
              <div className="h-px w-12 bg-[#E0E0E0]"></div>
            </div>
          </div>

          {/* Productos Destino */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                Productos Destino <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                onClick={onAgregarDestino}
                size="sm"
                variant="outline"
                className="h-9 border-[#4CAF50] text-[#4CAF50] hover:bg-green-50"
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar Producto
              </Button>
            </div>

            {formConversion.productosDestino.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-[#666666]">
                  No hay productos destino agregados
                </p>
                <p className="text-xs text-[#999999] mt-1">
                  Haz clic en "Agregar Producto" para comenzar
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {formConversion.productosDestino.map((destino, index) => {
                  const productoDestino = productos.find(p => p.id === destino.productoId);
                  const cantidadCalculada = formConversion.cantidadOrigen * destino.ratio;

                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Selector de producto */}
                          <div className="space-y-1">
                            <Label className="text-xs text-[#666666]">Producto</Label>
                            <Select
                              value={destino.productoId}
                              onValueChange={(value) => onActualizarDestino(index, 'productoId', value)}
                            >
                              <SelectTrigger className="h-10">
                                <SelectValue placeholder="Selecciona..." />
                              </SelectTrigger>
                              <SelectContent>
                                {productos
                                  .filter(p => p.activo !== false && p.id !== formConversion.productoOrigenId)
                                  .length === 0 ? (
                                    <div className="p-4 text-center text-sm text-[#666666]">
                                      <p className="font-medium mb-1">Aucun produit disponible</p>
                                      <p className="text-xs">Ajoutez d'autres produits</p>
                                    </div>
                                  ) : (
                                    productos
                                      .filter(p => p.activo !== false && p.id !== formConversion.productoOrigenId)
                                      .map(producto => (
                                        <SelectItem key={producto.id} value={producto.id}>
                                          <div className="flex items-center gap-2">
                                            <span>{producto.icono}</span>
                                            <span className="font-medium">{producto.nombre}</span>
                                          </div>
                                        </SelectItem>
                                      ))
                                  )}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Ratio */}
                          <div className="space-y-1">
                            <Label className="text-xs text-[#666666]">Ratio de conversión</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={destino.ratio || ''}
                                onChange={(e) => onActualizarDestino(index, 'ratio', parseFloat(e.target.value) || 1)}
                                placeholder="1.00"
                                className="h-10"
                              />
                              <span className="text-sm text-[#666666] whitespace-nowrap">: 1</span>
                            </div>
                            {productoDestino && formConversion.cantidadOrigen > 0 && (
                              <p className="text-xs text-[#4CAF50] font-medium">
                                → {cantidadCalculada.toFixed(2)} {productoDestino.unidad}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Botón eliminar */}
                        <Button
                          type="button"
                          onClick={() => onEliminarDestino(index)}
                          size="sm"
                          variant="ghost"
                          className="h-10 w-10 p-0 text-red-500 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observacionesConversion" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
              Observaciones (opcional)
            </Label>
            <Textarea
              id="observacionesConversion"
              value={formConversion.observaciones}
              onChange={(e) => setFormConversion({ ...formConversion, observaciones: e.target.value })}
              placeholder="Motivo de la conversión, notas adicionales..."
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Guardar como plantilla */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="guardarPlantilla"
                checked={formConversion.guardarComoPlantilla}
                onCheckedChange={(checked) => 
                  setFormConversion({ ...formConversion, guardarComoPlantilla: checked as boolean })
                }
              />
              <div className="flex-1">
                <Label htmlFor="guardarPlantilla" className="text-sm font-medium cursor-pointer">
                  <BookmarkPlus className="w-4 h-4 inline mr-1" />
                  Guardar como plantilla para conversiones futuras
                </Label>
                {formConversion.guardarComoPlantilla && (
                  <Input
                    value={formConversion.nombrePlantilla}
                    onChange={(e) => setFormConversion({ ...formConversion, nombrePlantilla: e.target.value })}
                    placeholder="Nombre de la plantilla..."
                    className="mt-2 h-10"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Resumen de conversión */}
          {productoOrigen && formConversion.productosDestino.length > 0 && formConversion.cantidadOrigen > 0 && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-[#FFC107] flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-sm text-[#856404]">
                  <p className="font-medium mb-2">Resumen de la conversión:</p>
                  <ul className="space-y-1.5">
                    <li className="flex items-center gap-2">
                      <span className="text-red-500">−</span>
                      <span>
                        <strong>{cantidadTotalOrigen.toFixed(2)} {productoOrigen.unidad}</strong> de{' '}
                        <strong>{productoOrigen.nombre}</strong>
                        {formConversion.merma > 0 && (
                          <span className="text-xs"> (incluye {formConversion.merma} {productoOrigen.unidad} de merma)</span>
                        )}
                      </span>
                    </li>
                    {formConversion.productosDestino.map((destino, index) => {
                      const prod = productos.find(p => p.id === destino.productoId);
                      if (!prod) return null;
                      const cantidad = formConversion.cantidadOrigen * destino.ratio;
                      return (
                        <li key={index} className="flex items-center gap-2">
                          <span className="text-green-500">+</span>
                          <span>
                            <strong>{cantidad.toFixed(2)} {prod.unidad}</strong> a{' '}
                            <strong>{prod.nombre}</strong>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setFormConversion({
                productoOrigenId: '',
                productosDestino: [],
                cantidadOrigen: 0,
                merma: 0,
                mermaMotivo: '',
                observaciones: '',
                guardarComoPlantilla: false,
                nombrePlantilla: ''
              });
            }}
            className="h-11 px-6"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={onConvertir}
            className="h-11 px-6 bg-[#FFC107] hover:bg-[#FFB300] text-[#333333]"
            style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
          >
            <ArrowRightLeft className="w-4 h-4 mr-2" />
            Realizar Conversión
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}