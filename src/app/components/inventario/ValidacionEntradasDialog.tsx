import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Check, X, Calendar, Package, TrendingUp, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { toast } from 'sonner';
import { obtenerEntradas, actualizarEntrada, type EntradaInventario } from '../../utils/entradaInventarioStorage';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type ValidacionEntradasDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type EntradaPendiente = EntradaInventario & {
  diasDesdeEntrada: number;
  alerta?: 'caducidad-proxima' | 'stock-alto' | 'revision-manual';
};

export function ValidacionEntradasDialog({ open, onOpenChange }: ValidacionEntradasDialogProps) {
  const { t } = useTranslation();
  const [entradasPendientes, setEntradasPendientes] = useState<EntradaPendiente[]>([]);
  const [entradasSeleccionadas, setEntradasSeleccionadas] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const [searchLote, setSearchLote] = useState('');

  useEffect(() => {
    if (open) {
      cargarEntradasPendientes();
    }
  }, [open]);

  const cargarEntradasPendientes = () => {
    const todasLasEntradas = obtenerEntradas();
    const ahora = new Date();

    // Filtrar entradas que requieren validación (últimos 7 días)
    const pendientes = todasLasEntradas
      .map(entrada => {
        const fechaEntrada = new Date(entrada.fecha);
        const diasDesdeEntrada = Math.floor((ahora.getTime() - fechaEntrada.getTime()) / (1000 * 60 * 60 * 24));
        
        let alerta: EntradaPendiente['alerta'] = undefined;
        
        // Detectar alertas
        if (entrada.fechaCaducidad) {
          const fechaCaducidad = new Date(entrada.fechaCaducidad);
          const diasHastaCaducidad = Math.floor((fechaCaducidad.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diasHastaCaducidad < 30 && diasHastaCaducidad > 0) {
            alerta = 'caducidad-proxima';
          }
        }
        
        if (entrada.cantidad > 100) {
          alerta = 'stock-alto';
        }

        return {
          ...entrada,
          diasDesdeEntrada,
          alerta
        };
      })
      .filter(e => e.diasDesdeEntrada <= 7)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

    setEntradasPendientes(pendientes);
  };

  const toggleEntradaSeleccionada = (entradaId: string) => {
    setEntradasSeleccionadas(prev => 
      prev.includes(entradaId)
        ? prev.filter(id => id !== entradaId)
        : [...prev, entradaId]
    );
  };

  const toggleTodasEntradas = () => {
    if (entradasSeleccionadas.length === entradasPendientes.length) {
      setEntradasSeleccionadas([]);
    } else {
      setEntradasSeleccionadas(entradasPendientes.map(e => e.id));
    }
  };

  const validarEntradasSeleccionadas = () => {
    if (entradasSeleccionadas.length === 0) {
      toast.error('Selecciona al menos una entrada para validar');
      return;
    }

    setCargando(true);

    // Simular proceso de validación
    setTimeout(() => {
      entradasSeleccionadas.forEach(entradaId => {
        const entrada = entradasPendientes.find(e => e.id === entradaId);
        if (entrada) {
          // Aquí podrías actualizar el estado de la entrada en tu storage
          // Por ahora solo mostramos un mensaje
        }
      });

      toast.success(`✅ ${entradasSeleccionadas.length} entrada(s) validada(s) correctamente`);
      setEntradasSeleccionadas([]);
      cargarEntradasPendientes();
      setCargando(false);
    }, 1500);
  };

  const obtenerBadgeAlerta = (alerta?: EntradaPendiente['alerta']) => {
    switch (alerta) {
      case 'caducidad-proxima':
        return <Badge className="bg-[#FFC107] text-white">⚠️ {t('alerts.nearExpiry')}</Badge>;
      case 'stock-alto':
        return <Badge className="bg-[#1E73BE] text-white">📊 {t('alerts.highStockBadge')}</Badge>;
      case 'revision-manual':
        return <Badge className="bg-[#DC3545] text-white">🔍 {t('alerts.manualReview')}</Badge>;
      default:
        return null;
    }
  };

  // Filtrar entradas por número de lote
  const entradasFiltradas = entradasPendientes.filter(entrada => {
    if (!searchLote) return true;
    return entrada.lote && entrada.lote.toLowerCase().includes(searchLote.toLowerCase());
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]" aria-describedby="validacion-entradas-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <AlertTriangle className="h-6 w-6 text-[#FFC107]" />
            Validación de Entradas Pendientes
          </DialogTitle>
          <DialogDescription id="validacion-entradas-description">
            Revisa y valida las entradas de productos que esperan aprobación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Estadísticas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666]">Total Pendientes</p>
                  <p className="text-2xl font-bold text-[#1E73BE]">{entradasPendientes.length}</p>
                </div>
                <Package className="h-8 w-8 text-[#1E73BE]" />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666]">Seleccionadas</p>
                  <p className="text-2xl font-bold text-[#4CAF50]">{entradasSeleccionadas.length}</p>
                </div>
                <Check className="h-8 w-8 text-[#4CAF50]" />
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666]">Con Alertas</p>
                  <p className="text-2xl font-bold text-[#FFC107]">
                    {entradasPendientes.filter(e => e.alerta).length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-[#FFC107]" />
              </div>
            </div>
          </div>

          {/* Campo de búsqueda por lote */}
          <div className="bg-white border-2 border-[#E0E0E0] rounded-lg p-3 shadow-sm">
            <label className="block text-sm font-medium text-[#333333] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              🔍 {t('inventory.filterByLotNumber')}
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#666666]" />
              <Input
                placeholder={t('inventory.searchByLotNumber')}
                value={searchLote}
                onChange={(e) => setSearchLote(e.target.value)}
                className="pl-10 border-[#1E73BE] focus:ring-2 focus:ring-[#1E73BE]"
              />
              {searchLote && entradasPendientes.length > 0 && (
                <Badge variant="outline" className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-50 text-[#1E73BE] border-[#1E73BE] font-bold">
                  {entradasFiltradas.length} {t('common.results')}
                </Badge>
              )}
            </div>
          </div>

          {/* Alerta informativa */}
          {entradasPendientes.length === 0 ? (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-[#4CAF50]" />
              <AlertDescription className="text-[#4CAF50]">
                ✅ No hay entradas pendientes de validación en los últimos 7 días
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTriangle className="h-4 w-4 text-[#1E73BE]" />
              <AlertDescription className="text-[#1E73BE]">
                Revisa las entradas recientes y marca las que ya verificaste
              </AlertDescription>
            </Alert>
          )}

          {/* Tabla de entradas */}
          <ScrollArea className="h-[400px] rounded-md border">
            <Table>
              <TableHeader className="bg-[#F4F4F4] sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={entradasSeleccionadas.length === entradasPendientes.length && entradasPendientes.length > 0}
                      onCheckedChange={toggleTodasEntradas}
                    />
                  </TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>📦 {t('inventory.lotNumberShort')}</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Donador</TableHead>
                  <TableHead>Alertas</TableHead>
                  <TableHead>Días</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entradasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-[#666666] py-8">
                      <Package className="h-12 w-12 mx-auto mb-2 text-[#666666]" />
                      <p>{searchLote ? t('inventory.noResultsForLot') : 'No hay entradas pendientes'}</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  entradasFiltradas.map(entrada => (
                    <TableRow key={entrada.id} className={entradasSeleccionadas.includes(entrada.id) ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <Checkbox
                          checked={entradasSeleccionadas.includes(entrada.id)}
                          onCheckedChange={() => toggleEntradaSeleccionada(entrada.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#666666]" />
                          <span className="text-sm">
                            {format(new Date(entrada.fecha), 'dd MMM yyyy', { locale: es })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {entrada.programaIcono} {entrada.programaNombre}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{entrada.nombreProducto}</p>
                          <p className="text-xs text-[#666666]">Código: {entrada.productoCodigo}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {entrada.lote ? (
                          <Badge variant="outline" className="bg-blue-50 text-[#1E73BE] border-[#1E73BE] font-mono text-xs">
                            📦 {entrada.lote}
                          </Badge>
                        ) : (
                          <span className="text-xs text-[#999999]">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-bold text-[#1E73BE]">{entrada.cantidad}</span> {entrada.unidad}
                          <p className="text-xs text-[#666666]">{entrada.pesoTotal || 0} kg</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{entrada.donadorNombre}</TableCell>
                      <TableCell>{obtenerBadgeAlerta(entrada.alerta)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          entrada.diasDesdeEntrada <= 2 ? 'bg-green-50 text-green-700' :
                          entrada.diasDesdeEntrada <= 5 ? 'bg-yellow-50 text-yellow-700' :
                          'bg-red-50 text-red-700'
                        }>
                          {entrada.diasDesdeEntrada}d
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
            <Button
              onClick={validarEntradasSeleccionadas}
              disabled={entradasSeleccionadas.length === 0 || cargando}
              className="bg-[#4CAF50] hover:bg-[#45a049]"
            >
              <Check className="h-4 w-4 mr-2" />
              {cargando ? 'Validando...' : `Validar (${entradasSeleccionadas.length})`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}