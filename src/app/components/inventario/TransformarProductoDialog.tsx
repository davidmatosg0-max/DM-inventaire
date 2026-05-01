import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Package, Shuffle, Plus, Minus, Info, History, Check, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import { mockProductos, mockUsuariosInternos } from '../../data/mockData';
import { obtenerUsuarioSesion } from '../../utils/sesionStorage';

interface TransformarProductoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productoInicial?: any;
}

// Mapeo de categorías con sus iconos
const categoriasInfo: Record<string, { icono: string; color: string }> = {
  'Alimentos Secos': { icono: '🍚', color: '#FFC107' },
  'Conservas': { icono: '🥫', color: '#4CAF50' },
  'Lácteos': { icono: '🥛', color: '#1E73BE' },
  'Frutas y Verduras': { icono: '🥬', color: '#4CAF50' },
  'Proteínas': { icono: '🥩', color: '#DC3545' },
  'Panadería': { icono: '🍞', color: '#FFA726' },
  'Bebidas': { icono: '🧃', color: '#29B6F6' },
  'Aceites y Condimentos': { icono: '🫒', color: '#66BB6A' },
};

// Transformaciones predefinidas comunes
const transformacionesComunes = [
  {
    nombre: 'Granel a Porción Individual',
    ejemplo: 'Arroz 25kg → Bolsas 1kg',
    ratio: 25
  },
  {
    nombre: 'Porción a Granel',
    ejemplo: 'Bolsas 1kg → Arroz 25kg',
    ratio: 0.04
  },
  {
    nombre: 'Producto Fresco a Conserva',
    ejemplo: 'Frutas → Mermelada',
    ratio: 0.6
  },
  {
    nombre: 'Procesamiento con Pérdida',
    ejemplo: 'Con desperdicio del 30%',
    ratio: 0.7
  }
];

export function TransformarProductoDialog({ open, onOpenChange, productoInicial }: TransformarProductoDialogProps) {
  const { t } = useTranslation();
  const [productoOrigenId, setProductoOrigenId] = useState(productoInicial?.id || '');
  const [cantidadOrigen, setCantidadOrigen] = useState<number>(1);
  const [productoDestinoId, setProductoDestinoId] = useState('');
  const [cantidadDestino, setCantidadDestino] = useState<number>(1);
  const [motivo, setMotivo] = useState('');
  const [proveedorId, setProveedorId] = useState('');
  const [mostrarHistorial, setMostrarHistorial] = useState(false);
  const [ratioPersonalizado, setRatioPersonalizado] = useState(false);

  const productoOrigen = mockProductos.find(p => p.id === productoOrigenId);
  const productoDestino = mockProductos.find(p => p.id === productoDestinoId);
  const proveedorSeleccionado = mockUsuariosInternos.find(p => p.id === proveedorId);

  const categoriaOrigen = productoOrigen ? categoriasInfo[productoOrigen.categoria] : null;
  const categoriaDestino = productoDestino ? categoriasInfo[productoDestino.categoria] : null;

  const handleTransformar = () => {
    if (!productoOrigenId || !productoDestinoId) {
      toast.error('Selecciona ambos productos');
      return;
    }

    if (!cantidadOrigen || cantidadOrigen <= 0) {
      toast.error('La cantidad de origen debe ser mayor a 0');
      return;
    }

    if (!cantidadDestino || cantidadDestino <= 0) {
      toast.error('La cantidad de destino debe ser mayor a 0');
      return;
    }

    if (productoOrigen && cantidadOrigen > productoOrigen.stockActual) {
      toast.error(`Stock insuficiente. Disponible: ${productoOrigen.stockActual} ${productoOrigen.unidad}`);
      return;
    }

    const ratio = cantidadDestino / cantidadOrigen;
    const eficiencia = (ratio * 100).toFixed(1);

    toast.success(
      <div className="flex flex-col gap-1">
        <span className="font-semibold">✅ Transformación completada</span>
        <div className="text-sm text-[#666666] space-y-1">
          <div>
            <strong>Origen:</strong> -{cantidadOrigen} {productoOrigen?.unidad} de {productoOrigen?.nombre}
          </div>
          <div>
            <strong>Destino:</strong> +{cantidadDestino} {productoDestino?.unidad} de {productoDestino?.nombre}
          </div>
          <div>
            <strong>Eficiencia:</strong> {eficiencia}%
          </div>
        </div>
      </div>,
      { duration: 6000 }
    );

    // Limpiar y cerrar
    limpiarFormulario();
    onOpenChange(false);
  };

  const limpiarFormulario = () => {
    if (!productoInicial) {
      setProductoOrigenId('');
    }
    setCantidadOrigen(1);
    setProductoDestinoId('');
    setCantidadDestino(1);
    setMotivo('');
    setRatioPersonalizado(false);
  };

  const aplicarTransformacionComun = (ratio: number) => {
    if (cantidadOrigen > 0) {
      setCantidadDestino(parseFloat((cantidadOrigen * ratio).toFixed(2)));
      setRatioPersonalizado(false);
    }
  };

  const calcularRatio = () => {
    if (cantidadOrigen > 0 && cantidadDestino > 0) {
      return (cantidadDestino / cantidadOrigen).toFixed(3);
    }
    return '0';
  };

  // Historial de transformaciones (mock)
  const usuarioActual = obtenerUsuarioSesion();
  const nombreUsuarioActual = usuarioActual 
    ? `${usuarioActual.nombre} ${usuarioActual.apellido}`
    : 'Usuario Sistema';

  const historialTransformaciones = [
    {
      id: '1',
      fecha: '2025-01-04 10:30',
      productoOrigen: 'Arroz Blanco 25kg',
      cantidadOrigen: 25,
      unidadOrigen: 'kg',
      productoDestino: 'Arroz Blanco 1kg',
      cantidadDestino: 25,
      unidadDestino: 'unidades',
      usuario: nombreUsuarioActual,
      motivo: 'Fraccionamiento para distribución'
    },
    {
      id: '2',
      fecha: '2025-01-03 15:45',
      productoOrigen: 'Tomates Frescos',
      cantidadOrigen: 50,
      unidadOrigen: 'kg',
      productoDestino: 'Salsa de Tomate',
      cantidadDestino: 30,
      unidadDestino: 'kg',
      usuario: nombreUsuarioActual,
      motivo: 'Procesamiento de productos próximos a vencer'
    },
    {
      id: '3',
      fecha: '2025-01-02 09:15',
      productoOrigen: 'Leche Líquida 20L',
      cantidadOrigen: 10,
      unidadOrigen: 'unidades',
      productoDestino: 'Leche 1L',
      cantidadDestino: 200,
      unidadDestino: 'unidades',
      usuario: nombreUsuarioActual,
      motivo: 'Fraccionamiento para familias'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" aria-describedby="transformar-producto-description">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#9C27B0] to-[#7B1FA2] flex items-center justify-center text-white text-2xl">
                🔄
              </div>
              <span className="text-xl">Transformar Producto</span>
            </div>
          </DialogTitle>
          <DialogDescription id="transformar-producto-description">
            Convierte este producto en uno o varios productos diferentes
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Info Banner */}
          <div className="bg-[#E3F2FD] border border-[#1E73BE] rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[#1E73BE] flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm text-[#1E73BE]">
                <strong>¿Qué es una transformación?</strong>
                <p className="mt-1">
                  Registra cuando un producto se convierte en otro (ej: arroz a granel → bolsas individuales, 
                  frutas frescas → conservas). El stock del producto origen se reduce y el del producto destino aumenta.
                </p>
              </div>
            </div>
          </div>

          {/* Botón de historial */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
            >
              <History className="w-4 h-4 mr-2" />
              {mostrarHistorial ? 'Ocultar' : 'Ver'} Historial
            </Button>
          </div>

          {/* Historial de transformaciones */}
          {mostrarHistorial && (
            <Card className="border-2 border-[#1E73BE]">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-[#1E73BE]" />
                  Historial de Transformaciones
                </h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {historialTransformaciones.map(t => (
                    <div key={t.id} className="border rounded-lg p-3 bg-[#F4F4F4]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-[#666666]">{t.fecha}</span>
                        <Badge variant="outline" className="text-xs">{t.usuario}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 text-sm">
                          <strong>{t.productoOrigen}</strong>
                          <p className="text-[#666666]">
                            -{t.cantidadOrigen} {t.unidadOrigen}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#1E73BE] flex-shrink-0" />
                        <div className="flex-1 text-sm">
                          <strong>{t.productoDestino}</strong>
                          <p className="text-[#4CAF50]">
                            +{t.cantidadDestino} {t.unidadDestino}
                          </p>
                        </div>
                      </div>
                      {t.motivo && (
                        <p className="text-xs text-[#666666] italic">"{t.motivo}"</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Grid principal de transformación */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Producto Origen */}
            <Card className="border-2 border-[#DC3545]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Minus className="w-5 h-5 text-[#DC3545]" />
                  <h3 className="font-semibold text-[#DC3545]">Producto Origen</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Producto a transformar</Label>
                    <Select value={productoOrigenId} onValueChange={setProductoOrigenId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProductos.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            <div className="flex items-center gap-2">
                              <span>{categoriasInfo[p.categoria]?.icono}</span>
                              <span>{p.nombre}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {productoOrigen && (
                    <>
                      <div className="bg-[#FFF3CD] border border-[#FFC107] rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{categoriaOrigen?.icono}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{productoOrigen.nombre}</p>
                            <p className="text-xs text-[#666666]">{productoOrigen.categoria}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                          <div>
                            <span className="text-[#666666]">Stock Actual:</span>
                            <p className="font-bold text-[#1E73BE]">
                              {productoOrigen.stockActual} {productoOrigen.unidad}
                            </p>
                          </div>
                          <div>
                            <span className="text-[#666666]">Código:</span>
                            <p className="font-mono">{productoOrigen.codigo}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Cantidad a transformar</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="0"
                            max={productoOrigen.stockActual}
                            step="0.1"
                            value={cantidadOrigen || ''}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setCantidadOrigen(val);
                              if (!ratioPersonalizado && cantidadDestino > 0) {
                                const ratio = cantidadDestino / cantidadOrigen;
                                setCantidadDestino(parseFloat((val * ratio).toFixed(2)));
                              }
                            }}
                            className="flex-1"
                          />
                          <Badge variant="outline" className="flex items-center px-3">
                            {productoOrigen.unidad}
                          </Badge>
                        </div>
                        {cantidadOrigen > productoOrigen.stockActual && (
                          <p className="text-xs text-[#DC3545]">
                            ⚠️ Stock insuficiente (máx: {productoOrigen.stockActual})
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Flecha y ratio de conversión */}
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="bg-[#1E73BE] rounded-full p-4 shadow-lg">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>

              {cantidadOrigen > 0 && cantidadDestino > 0 && (
                <div className="bg-white border-2 border-[#1E73BE] rounded-lg p-4 w-full">
                  <p className="text-xs text-[#666666] text-center mb-1">Ratio de Conversión</p>
                  <p className="text-2xl font-bold text-[#1E73BE] text-center">
                    {calcularRatio()}
                  </p>
                  <p className="text-xs text-[#666666] text-center mt-1">
                    1 {productoOrigen?.unidad} → {calcularRatio()} {productoDestino?.unidad}
                  </p>
                </div>
              )}

              {/* Transformaciones comunes */}
              <div className="w-full space-y-2">
                <Label className="text-xs text-center block">Ratios Comunes</Label>
                <div className="grid grid-cols-1 gap-2">
                  {transformacionesComunes.map((tc, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => aplicarTransformacionComun(tc.ratio)}
                      className="text-xs h-auto py-2 px-2"
                      title={tc.ejemplo}
                    >
                      <div className="text-left w-full">
                        <div className="font-semibold truncate">{tc.nombre}</div>
                        <div className="text-[#666666] text-[10px]">Ratio: {tc.ratio}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Producto Destino */}
            <Card className="border-2 border-[#4CAF50]">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Plus className="w-5 h-5 text-[#4CAF50]" />
                  <h3 className="font-semibold text-[#4CAF50]">Producto Destino</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Producto resultante</Label>
                    <Select value={productoDestinoId} onValueChange={setProductoDestinoId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockProductos
                          .filter(p => p.id !== productoOrigenId)
                          .map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              <div className="flex items-center gap-2">
                                <span>{categoriasInfo[p.categoria]?.icono}</span>
                                <span>{p.nombre}</span>
                              </div>
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {productoDestino && (
                    <>
                      <div className="bg-[#E8F5E9] border border-[#4CAF50] rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{categoriaDestino?.icono}</span>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{productoDestino.nombre}</p>
                            <p className="text-xs text-[#666666]">{productoDestino.categoria}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                          <div>
                            <span className="text-[#666666]">Stock Actual:</span>
                            <p className="font-bold text-[#1E73BE]">
                              {productoDestino.stockActual} {productoDestino.unidad}
                            </p>
                          </div>
                          <div>
                            <span className="text-[#666666]">Código:</span>
                            <p className="font-mono">{productoDestino.codigo}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Cantidad resultante</Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRatioPersonalizado(!ratioPersonalizado)}
                            className="h-auto py-1 px-2 text-xs"
                          >
                            {ratioPersonalizado ? '🔓 Personalizado' : '🔒 Auto'}
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={cantidadDestino || ''}
                            onChange={(e) => {
                              setCantidadDestino(parseFloat(e.target.value) || 0);
                              setRatioPersonalizado(true);
                            }}
                            className="flex-1"
                          />
                          <Badge variant="outline" className="flex items-center px-3">
                            {productoDestino.unidad}
                          </Badge>
                        </div>
                        {!ratioPersonalizado && (
                          <p className="text-xs text-[#666666]">
                            💡 Se calcula automáticamente según el ratio
                          </p>
                        )}
                      </div>

                      {cantidadDestino > 0 && (
                        <div className="bg-[#E8F5E9] border border-[#4CAF50] rounded-lg p-3">
                          <p className="text-xs text-[#666666] mb-1">Stock después de transformar:</p>
                          <p className="text-lg font-bold text-[#4CAF50]">
                            {(productoDestino.stockActual + cantidadDestino).toFixed(2)} {productoDestino.unidad}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label>Motivo de la transformación</Label>
            <Textarea
              placeholder="Ej: Fraccionamiento para distribución a familias, Procesamiento de productos próximos a vencer..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={3}
            />
          </div>

          {/* Proveedor/Contacto */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1E73BE]" />
              Proveedor / Contacto (Opcional)
            </Label>
            <Select value={proveedorId} onValueChange={setProveedorId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar proveedor o contacto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ninguno">
                  <span className="text-[#999999]">Ninguno</span>
                </SelectItem>
                {mockUsuariosInternos.map(prov => {
                  const iconoCat = prov.categoria === 'donador' ? '💰' : prov.categoria === 'vendedor' ? '🛍️' : '🏢';
                  const colorCat = prov.categoria === 'donador' ? '#FF9800' : prov.categoria === 'vendedor' ? '  #9C27B0' : '#1E73BE';
                  
                  return (
                    <SelectItem key={prov.id} value={prov.id}>
                      <div className="flex items-center gap-2">
                        <span>{iconoCat}</span>
                        <div className="flex flex-col">
                          <span className="font-medium">{prov.nombre} {prov.apellido}</span>
                          <span className="text-xs text-[#666666]">{prov.nombreEmpresa || prov.categoria}</span>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {proveedorSeleccionado && (
              <div className="bg-[#F4F4F4] border rounded-lg p-3 flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#1E73BE] flex items-center justify-center text-white text-lg">
                  {proveedorSeleccionado.categoria === 'donador' ? '💰' : 
                   proveedorSeleccionado.categoria === 'vendedor' ? '🛍️' : '🏢'}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {proveedorSeleccionado.nombre} {proveedorSeleccionado.apellido}
                  </p>
                  {proveedorSeleccionado.nombreEmpresa && (
                    <p className="text-xs text-[#666666]">{proveedorSeleccionado.nombreEmpresa}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                    <div>
                      <span className="text-[#999999]">ID:</span> {proveedorSeleccionado.numeroID}
                    </div>
                    <div>
                      <span className="text-[#999999]">Tipo:</span> {proveedorSeleccionado.categoria.charAt(0).toUpperCase() + proveedorSeleccionado.categoria.slice(1)}
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#999999]">Email:</span> {proveedorSeleccionado.email}
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#999999]">Tel:</span> {proveedorSeleccionado.telefono}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resumen */}
          {productoOrigen && productoDestino && cantidadOrigen > 0 && cantidadDestino > 0 && (
            <Card className="bg-[#F4F4F4] border-2 border-[#1E73BE]">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Check className="w-5 h-5 text-[#1E73BE]" />
                  Resumen de Transformación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-[#666666] mb-1">Se retirará:</p>
                    <p className="font-bold text-[#DC3545]">
                      {cantidadOrigen} {productoOrigen.unidad}
                    </p>
                    <p className="text-sm">{productoOrigen.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#666666] mb-1">Se agregará:</p>
                    <p className="font-bold text-[#4CAF50]">
                      {cantidadDestino} {productoDestino.unidad}
                    </p>
                    <p className="text-sm">{productoDestino.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#666666] mb-1">Eficiencia:</p>
                    <p className="font-bold text-[#1E73BE]">
                      {((cantidadDestino / cantidadOrigen) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-[#666666]">
                      {cantidadDestino > cantidadOrigen ? '⬆️ Incremento' : cantidadDestino < cantidadOrigen ? '⬇️ Reducción' : '➡️ Equivalente'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                limpiarFormulario();
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleTransformar}
              className="bg-[#1E73BE] hover:bg-[#1557A0]"
              disabled={!productoOrigenId || !productoDestinoId || cantidadOrigen <= 0 || cantidadDestino <= 0}
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Transformar Producto
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}