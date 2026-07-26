import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Package, Box, Layers, ShoppingBag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { QuantityInput, parseQuantityText } from '../ui/quantity-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { obtenerUnidades, type Unidad } from '../../utils/unidadStorage';
import { formatQuantity } from '../../utils/formatUtils';

interface Producto {
  id: string;
  nombre: string;
  unidad: string;
  stockActual: number;
  pesoRegistrado?: number; // Peso total registrado en kg
  peso?: number; // Peso alternativo si pesoRegistrado no está disponible
  pesoUnitario?: number; // Peso unitario registrado en la entrada
  factorConversionCaja?: number; // Cuántas cajas hay en una paleta
  factorConversionUnidad?: number; // Cuántas unidades hay en una caja
  factorConversionSaco?: number; // Cuántas unidades hay en un saco
}

interface ConversionUnidadesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producto: Producto | null;
  onConversion: (productoId: string, cantidadOrigen: number, unidadOrigen: string, cantidadDestino: number, unidadDestino: string) => void;
}

export function ConversionUnidadesDialog({
  open,
  onOpenChange,
  producto,
  onConversion
}: ConversionUnidadesDialogProps) {
  const { t } = useTranslation();
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [unidadOrigen, setUnidadOrigen] = useState('');
  const [unidadDestino, setUnidadDestino] = useState('');
  const [cantidadOrigen, setCantidadOrigen] = useState('');
  const [factorConversion, setFactorConversion] = useState('');
  const [cantidadDestino, setCantidadDestino] = useState(0);
  const [pesoUnitarioDestino, setPesoUnitarioDestino] = useState<number | null>(null);
  const [pesoUnitarioOrigen, setPesoUnitarioOrigen] = useState<number | null>(null); // 🎯 NUEVO: guardar peso unitario origen
  const [unidadesDestino, setUnidadesDestino] = useState<Unidad[]>([]);
  const cantidadOrigenPermiteDecimal = unidadOrigen.toLowerCase().includes('kg') || unidadOrigen.toLowerCase().includes('kilo');

  // Cargar unidades dinámicas al montar el componente
  useEffect(() => {
    const cargarUnidades = () => {
      const unidadesCargadas = obtenerUnidades();
      setUnidades(unidadesCargadas);
    };

    cargarUnidades();

    // Escuchar cambios en las unidades
    const handleUnidadesActualizadas = (event: CustomEvent) => {
      setUnidades(event.detail);
    };

    window.addEventListener('unidadesActualizadas', handleUnidadesActualizadas as EventListener);

    return () => {
      window.removeEventListener('unidadesActualizadas', handleUnidadesActualizadas as EventListener);
    };
  }, []);

  // Inicializar unidad origen cuando se abre el diálogo
  useEffect(() => {
    if (producto && open) {
      setUnidadOrigen(producto.unidad || '');
      setCantidadOrigen('');
      setUnidadDestino('');
      setFactorConversion('');
      setCantidadDestino(0);
      setPesoUnitarioDestino(null);
      setPesoUnitarioOrigen(null); // 🎯 NUEVO: resetear peso unitario origen
    } else if (!open) {
      // Resetear cuando se cierra
      setUnidadOrigen('');
      setCantidadOrigen('');
      setUnidadDestino('');
      setFactorConversion('');
      setCantidadDestino(0);
      setPesoUnitarioDestino(null);
      setPesoUnitarioOrigen(null); // 🎯 NUEVO: resetear peso unitario origen
    }
  }, [producto, open]);

  // Actualizar unidades destino disponibles según la unidad origen
  useEffect(() => {
    if (!unidadOrigen) {
      setUnidadesDestino([]);
      return;
    }

    let disponibles: Unidad[] = [];
    
    // Normalizar la unidad origen (case insensitive y variaciones)
    const unidadOrigenNorm = unidadOrigen.toLowerCase();

    if (unidadOrigenNorm.includes('paleta') || unidadOrigenNorm.includes('pallet') || unidadOrigenNorm.includes('palette')) {
      disponibles = unidades.filter(u => 
        u.nombre.toLowerCase().includes('caja') || 
        u.nombre.toLowerCase().includes('box') ||
        u.nombre.toLowerCase().includes('boîte') ||
        u.nombre.toLowerCase().includes('unidad') || 
        u.nombre.toLowerCase().includes('unité') ||
        u.nombre.toLowerCase().includes('saco') ||
        u.nombre.toLowerCase().includes('sac')
      );
    } else if (unidadOrigenNorm.includes('caja') || unidadOrigenNorm.includes('box') || unidadOrigenNorm.includes('boîte')) {
      disponibles = unidades.filter(u => 
        u.nombre.toLowerCase().includes('unidad') || 
        u.nombre.toLowerCase().includes('unité') ||
        u.nombre.toLowerCase().includes('saco') ||
        u.nombre.toLowerCase().includes('sac')
      );
    } else {
      // Si no es paleta ni caja, mostrar todas las opciones excepto la misma unidad origen
      disponibles = unidades.filter(u => u.nombre !== unidadOrigen);
    }

    setUnidadesDestino(disponibles);
    
    // No resetear unidadDestino aquí para no perder la selección
  }, [unidadOrigen, unidades]);

  // Actualizar factor de conversión sugerido cuando cambia la unidad destino
  useEffect(() => {
    if (!producto || !unidadDestino) return;

    let factor = '';

    // Conversiones desde Paleta
    if (unidadOrigen === 'Paleta' && unidadDestino === 'Caja') {
      factor = producto.factorConversionCaja?.toString() || '20'; // Default: 20 cajas por paleta
    } else if (unidadOrigen === 'Paleta' && unidadDestino === 'Unidad') {
      const cajasPorPaleta = producto.factorConversionCaja || 20;
      const unidadesPorCaja = producto.factorConversionUnidad || 24;
      factor = (cajasPorPaleta * unidadesPorCaja).toString();
    } else if (unidadOrigen === 'Paleta' && unidadDestino === 'Saco') {
      factor = producto.factorConversionSaco?.toString() || '40'; // Default: 40 sacos por paleta
    }
    // Conversiones desde Caja
    else if (unidadOrigen === 'Caja' && unidadDestino === 'Unidad') {
      factor = producto.factorConversionUnidad?.toString() || '24'; // Default: 24 unidades por caja
    } else if (unidadOrigen === 'Caja' && unidadDestino === 'Saco') {
      factor = producto.factorConversionSaco?.toString() || '2'; // Default: 2 sacos por caja
    }

    setFactorConversion(factor);
  }, [unidadDestino, unidadOrigen, producto]);

  // Calcular cantidad destino cuando cambia cantidad origen o factor
  useEffect(() => {
    const cantidad = parseQuantityText(cantidadOrigen, cantidadOrigenPermiteDecimal);
    const factor = parseInt(factorConversion, 10);

    if (!isNaN(cantidad) && !isNaN(factor) && factor > 0) {
      setCantidadDestino(cantidad * factor);
    } else {
      setCantidadDestino(0);
    }
  }, [cantidadOrigen, cantidadOrigenPermiteDecimal, factorConversion]);

  // Calcular peso unitario de la unidad destino
  useEffect(() => {
    // 🎯 PASO 1: CALCULAR PESO UNITARIO ORIGEN (siempre que haya producto)
    if (!producto) {
      setPesoUnitarioOrigen(null);
      setPesoUnitarioDestino(null);
      return;
    }

    // 🎯 USAR LA MISMA LÓGICA QUE LA TABLA DE INVENTARIO
    // 1. Si existe pesoUnitario → usar ese
    // 2. Si no existe pesoUnitario, pero existe peso → usar peso
    // 3. Si ninguno existe → no hay peso disponible
    let pesoPorUnidadOrigen = null;
    
    if (producto.pesoUnitario && producto.pesoUnitario > 0) {
      pesoPorUnidadOrigen = producto.pesoUnitario;
    } else if (producto.peso && producto.peso > 0) {
      pesoPorUnidadOrigen = producto.peso;
    } else if (producto.pesoRegistrado && producto.pesoRegistrado > 0 && producto.stockActual > 0) {
      // Calcular peso unitario desde peso registrado total
      pesoPorUnidadOrigen = producto.pesoRegistrado / producto.stockActual;
    }
    
    // Guardar peso unitario origen SIEMPRE (incluso si es null)
    setPesoUnitarioOrigen(pesoPorUnidadOrigen);

    // 🎯 PASO 2: CALCULAR PESO UNITARIO DESTINO (solo si hay conversión válida)
    if (!pesoPorUnidadOrigen || pesoPorUnidadOrigen <= 0) {
      setPesoUnitarioDestino(null);
      return;
    }

    const cantidad = parseQuantityText(cantidadOrigen, cantidadOrigenPermiteDecimal);
    const factor = parseInt(factorConversion, 10);

    if (!isNaN(cantidad) && !isNaN(factor) && factor > 0 && cantidad > 0) {
      // 🎯 FÓRMULA DIRECTA: Peso Unitario Origen ÷ Factor de Conversión = Peso Unitario Destino
      // Ejemplo: 200 kg/paleta ÷ 45 cajas/paleta = 4.444 kg/caja
      const pesoUnitario = pesoPorUnidadOrigen / factor;
      setPesoUnitarioDestino(pesoUnitario);
    } else {
      setPesoUnitarioDestino(null);
    }
  }, [producto, cantidadOrigen, cantidadDestino, cantidadOrigenPermiteDecimal, factorConversion, unidadDestino, unidadOrigen]);

  const handleConvertir = () => {
    if (!producto) return;

    const cantidad = parseQuantityText(cantidadOrigen, cantidadOrigenPermiteDecimal);
    const factor = parseInt(factorConversion, 10);

    // Validaciones
    if (isNaN(cantidad) || cantidad <= 0) {
      toast.error(t('inventory.conversionDialog.errors.invalidQuantity'));
      return;
    }

    if (isNaN(factor) || factor <= 0) {
      toast.error(t('inventory.conversionDialog.errors.invalidFactor'));
      return;
    }

    if (!unidadDestino) {
      toast.error(t('inventory.conversionDialog.errors.selectTargetUnit'));
      return;
    }

    if (cantidad > producto.stockActual) {
      toast.error(t('inventory.conversionDialog.errors.insufficientStock', {
        stock: producto.stockActual,
        unit: unidadOrigen,
      }));
      return;
    }

    // Ejecutar conversión
    onConversion(producto.id, cantidad, unidadOrigen, cantidadDestino, unidadDestino);
    
    // Mensaje de éxito con peso unitario
    if (pesoUnitarioDestino !== null) {
      toast.success(
        t('inventory.conversionDialog.successWithWeight', {
          sourceAmount: formatQuantity(cantidad),
          sourceUnit: unidadOrigen,
          targetAmount: formatQuantity(cantidadDestino),
          targetUnit: unidadDestino,
          weight: formatQuantity(pesoUnitarioDestino),
        }),
        { duration: 4000 }
      );
    } else {
      toast.success(t('inventory.conversionDialog.success', {
        sourceAmount: formatQuantity(cantidad),
        sourceUnit: unidadOrigen,
        targetAmount: formatQuantity(cantidadDestino),
        targetUnit: unidadDestino,
      }));
    }
    onOpenChange(false);
  };

  const getIconoUnidad = (unidad: string) => {
    const unidadData = unidades.find(u => u.nombre === unidad || u.abreviatura === unidad);
    // Si tiene icono, mostrar el emoji
    if (unidadData?.icono) {
      return () => <span className="text-2xl">{unidadData.icono}</span>;
    }
    return Package;
  };

  const IconoOrigen = getIconoUnidad(unidadOrigen);
  const IconoDestino = getIconoUnidad(unidadDestino);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" aria-describedby="conversion-unidades-description">
        <DialogHeader>
          <DialogTitle className="text-xl" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700 }}>
            {t('inventory.conversionDialog.title')}
          </DialogTitle>
          <DialogDescription id="conversion-unidades-description">
            {t('inventory.conversionDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Visualización de conversión */}
          <Card className="p-4 bg-gray-50">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-center">
                <IconoOrigen className="h-12 w-12 mx-auto mb-2 text-[#1E73BE]" />
                <div className="text-2xl font-bold text-[#1E73BE]">
                  {cantidadOrigen || '0'}
                </div>
                <div className="text-sm text-gray-600">{unidadOrigen}</div>
              </div>

              <ArrowRight className="h-8 w-8 text-gray-400" />

              <div className="flex-1 text-center">
                {unidadDestino ? (
                  <>
                    <IconoDestino className="h-12 w-12 mx-auto mb-2 text-[#4CAF50]" />
                    <div className="text-2xl font-bold text-[#4CAF50]">
                      {formatQuantity(cantidadDestino)}
                    </div>
                    <div className="text-sm text-gray-600">{unidadDestino}</div>
                  </>
                ) : (
                  <>
                    <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <div className="text-sm text-gray-400">{t('inventory.conversionDialog.selectTargetUnit')}</div>
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Formulario de conversión */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="unidadOrigen">{t('inventory.conversionDialog.sourceUnitLabel')}</Label>
              <Input
                id="unidadOrigen"
                value={unidadOrigen}
                disabled
                className="bg-gray-100"
              />
              {/* 🎯 PESO UNITARIO DE LA UNIDAD ORIGEN - DESTACADO */}
              {pesoUnitarioOrigen !== null && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 rounded-lg border-2 border-blue-300 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚖️</span>
                    <div>
                      <p className="text-xs text-blue-600 font-semibold">{t('inventory.conversionDialog.currentUnitWeight')}</p>
                      <p className="text-base text-blue-900 font-bold mt-0.5">
                        {formatQuantity(pesoUnitarioOrigen)} kg
                      </p>
                      <p className="text-xs text-blue-700 mt-0.5">{t('inventory.conversionDialog.perEachUnit', { unit: unidadOrigen })}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidadDestino">{t('inventory.conversionDialog.targetUnitLabel')}</Label>
              <Select value={unidadDestino} onValueChange={setUnidadDestino}>
                <SelectTrigger id="unidadDestino">
                  <SelectValue placeholder={t('inventory.conversionDialog.selectUnitPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {unidadesDestino.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">
                      {t('inventory.conversionDialog.noConversionsAvailable', { unit: unidadOrigen })}
                    </div>
                  ) : (
                    unidadesDestino.map((unidad) => (
                      <SelectItem key={unidad.id} value={unidad.nombre}>
                        <div className="flex items-center gap-2">
                          {unidad.icono && <span>{unidad.icono}</span>}
                          {unidad.nombre} ({unidad.abreviatura})
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {unidadesDestino.length > 0 && (
                <p className="text-xs text-gray-500">
                  {t('inventory.conversionDialog.availableOptions', { count: unidadesDestino.length })}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidadOrigen">{t('inventory.conversionDialog.amountToConvert')}</Label>
              <QuantityInput
                id="cantidadOrigen"
                value={cantidadOrigen}
                onChangeText={setCantidadOrigen}
                step={cantidadOrigenPermiteDecimal ? 0.1 : 1}
                allowDecimal={cantidadOrigenPermiteDecimal}
                min={0}
                max={producto?.stockActual}
                placeholder="0"
              />
              <p className="text-xs text-gray-500">
                {t('inventory.conversionDialog.maximum', { amount: producto?.stockActual || 0, unit: unidadOrigen })}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="factorConversion">{t('inventory.conversionDialog.conversionFactor')}</Label>
              <Input
                id="factorConversion"
                type="number"
                step="1"
                min="1"
                value={factorConversion}
                onChange={(e) => setFactorConversion(e.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-gray-500">
                {unidadDestino && t('inventory.conversionDialog.unitsPerEach', {
                  targetUnit: unidadDestino,
                  sourceUnit: unidadOrigen,
                })}
              </p>
            </div>
          </div>

          {/* Información adicional */}
          {cantidadDestino > 0 && (
            <Card className="p-3 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-2">
                <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-blue-900">{t('inventory.conversionDialog.resultTitle')}</p>
                  <p className="text-blue-700 mt-1">
                    {formatQuantity(parseQuantityText(cantidadOrigen, cantidadOrigenPermiteDecimal) || 0)} {unidadOrigen} × {factorConversion} = <strong>{formatQuantity(cantidadDestino)} {unidadDestino}</strong>
                  </p>
                  
                  {/* PESO UNITARIO DESTACADO */}
                  {pesoUnitarioDestino !== null && (
                    <div className="mt-3 bg-gradient-to-r from-blue-100 to-blue-50 px-3 py-3 rounded-lg border-2 border-blue-300">
                      <p className="text-blue-900 font-bold text-base mb-2">
                        {t('inventory.conversionDialog.resultingUnitWeight')}
                      </p>
                      <p className="text-blue-800 font-mono text-lg font-bold">
                        {formatQuantity(pesoUnitarioDestino)} kg/{unidadDestino}
                      </p>
                      <p className="text-blue-600 text-xs mt-2">
                        {t('inventory.conversionDialog.eachUnitWillWeigh', {
                          unit: unidadDestino,
                          weight: formatQuantity(pesoUnitarioDestino),
                        })}
                      </p>
                    </div>
                  )}
                  
                  {pesoUnitarioDestino !== null && producto && pesoUnitarioOrigen !== null && (
                    <>
                      <p className="text-blue-700 mt-3 font-medium">
                        {t('inventory.conversionDialog.weightCalculationTitle')}
                      </p>
                      <p className="text-blue-600 text-xs mt-1 bg-white px-2 py-1 rounded border border-blue-200">
                        <strong>{t('inventory.conversionDialog.step1')}</strong> {t('inventory.conversionDialog.weightOriginStep', {
                          weight: formatQuantity(pesoUnitarioOrigen),
                          unit: unidadOrigen,
                        })}
                      </p>
                      <p className="text-blue-600 text-xs mt-1 bg-white px-2 py-1 rounded border border-blue-200">
                        <strong>{t('inventory.conversionDialog.step2')}</strong> {t('inventory.conversionDialog.conversionFactorStep', {
                          factor: factorConversion,
                          targetUnit: unidadDestino,
                          sourceUnit: unidadOrigen,
                        })}
                      </p>
                      <p className="text-blue-600 text-xs mt-1 font-mono bg-blue-100 px-2 py-2 rounded border-2 border-blue-300">
                        <strong>{t('inventory.conversionDialog.formula')}</strong><br/>
                        {formatQuantity(pesoUnitarioOrigen)} kg ÷ {factorConversion} = <strong className="text-blue-800 text-base">{formatQuantity(pesoUnitarioDestino)} kg/{unidadDestino}</strong>
                      </p>
                    </>
                  )}
                  <p className="text-blue-600 text-xs mt-2">
                    {t('inventory.conversionDialog.stockUpdateNotice')}
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('inventory.conversionDialog.cancel')}
          </Button>
          <Button
            onClick={handleConvertir}
            className="bg-[#1E73BE] hover:bg-[#1557A0]"
            disabled={!unidadDestino || !cantidadOrigen || !factorConversion || cantidadDestino <= 0}
          >
            {t('inventory.conversionDialog.convert')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}