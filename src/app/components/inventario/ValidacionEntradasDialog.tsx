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

type ValidacionEntradasDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type EntradaPendiente = EntradaInventario & {
  diasDesdeEntrada: number;
  alerta?: 'caducidad-proxima' | 'stock-alto' | 'revision-manual';
};

export function ValidacionEntradasDialog({ open, onOpenChange }: ValidacionEntradasDialogProps) {
  const { t, i18n } = useTranslation();
  const [entradasPendientes, setEntradasPendientes] = useState<EntradaPendiente[]>([]);
  const [entradasSeleccionadas, setEntradasSeleccionadas] = useState<string[]>([]);
  const [cargando, setCargando] = useState(false);
  const [searchLote, setSearchLote] = useState('');

  useEffect(() => {
    if (open) {
      setEntradasSeleccionadas([]);
      setSearchLote('');
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
    const idsFiltrados = entradasFiltradas.map((entrada) => entrada.id);

    if (idsFiltrados.length === 0) {
      return;
    }

    const todasFiltradasSeleccionadas = idsFiltrados.every((id) => entradasSeleccionadas.includes(id));

    if (todasFiltradasSeleccionadas) {
      setEntradasSeleccionadas((prev) => prev.filter((id) => !idsFiltrados.includes(id)));
    } else {
      setEntradasSeleccionadas((prev) => Array.from(new Set([...prev, ...idsFiltrados])));
    }
  };

  const validarEntradasSeleccionadas = () => {
    if (entradasSeleccionadas.length === 0) {
      toast.error(t('inventory.entryValidationDialog.selectAtLeastOne'));
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

      toast.success(t('inventory.entryValidationDialog.validationSuccess', { count: entradasSeleccionadas.length }));
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

  const entradasConAlerta = entradasPendientes.filter((entrada) => entrada.alerta).length;
  const todasFiltradasSeleccionadas = entradasFiltradas.length > 0 && entradasFiltradas.every((entrada) => entradasSeleccionadas.includes(entrada.id));
  const locale = i18n.resolvedLanguage || i18n.language || 'fr';

  const formatearFechaEntrada = (fecha: string) => new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(fecha));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] w-[calc(100vw-1rem)] max-w-6xl flex-col overflow-hidden p-0 sm:w-full" aria-describedby="validacion-entradas-description">
        <DialogHeader className="px-4 pt-4 sm:px-6 sm:pt-6">
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <AlertTriangle className="h-6 w-6 text-[#FFC107]" />
            {t('inventory.entryValidationDialog.title')}
          </DialogTitle>
          <DialogDescription id="validacion-entradas-description">
            {t('inventory.entryValidationDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden px-4 pb-4 sm:px-6 sm:pb-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666]">{t('inventory.entryValidationDialog.pendingTotal')}</p>
                  <p className="text-2xl font-bold text-[#1E73BE]">{entradasPendientes.length}</p>
                </div>
                <Package className="h-8 w-8 text-[#1E73BE]" />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666]">{t('inventory.entryValidationDialog.selectedTotal')}</p>
                  <p className="text-2xl font-bold text-[#4CAF50]">{entradasSeleccionadas.length}</p>
                </div>
                <Check className="h-8 w-8 text-[#4CAF50]" />
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666]">{t('inventory.entryValidationDialog.withAlerts')}</p>
                  <p className="text-2xl font-bold text-[#FFC107]">{entradasConAlerta}</p>
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
                <Badge variant="outline" className="absolute right-2 top-1/2 hidden -translate-y-1/2 bg-blue-50 font-bold text-[#1E73BE] border-[#1E73BE] sm:inline-flex">
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
                {t('inventory.entryValidationDialog.emptyRecent')}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTriangle className="h-4 w-4 text-[#1E73BE]" />
              <AlertDescription className="text-[#1E73BE]">
                {t('inventory.entryValidationDialog.reviewRecentInfo')}
              </AlertDescription>
            </Alert>
          )}

          {/* Tabla de entradas */}
          <ScrollArea className="h-[min(48vh,400px)] w-full rounded-md border">
            <div className="min-w-[980px]">
            <Table>
              <TableHeader className="bg-[#F4F4F4] sticky top-0 z-10">
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={todasFiltradasSeleccionadas}
                      onCheckedChange={toggleTodasEntradas}
                    />
                  </TableHead>
                  <TableHead>{t('inventory.date')}</TableHead>
                  <TableHead>{t('inventory.type')}</TableHead>
                  <TableHead>{t('inventory.product')}</TableHead>
                  <TableHead>📦 {t('inventory.lotNumberShort')}</TableHead>
                  <TableHead>{t('inventory.quantity')}</TableHead>
                  <TableHead>{t('inventory.entryValidationDialog.donorColumn')}</TableHead>
                  <TableHead>{t('inventory.entryValidationDialog.withAlerts')}</TableHead>
                  <TableHead>{t('inventory.entryValidationDialog.daysColumn')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entradasFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-[#666666] py-8">
                      <Package className="h-12 w-12 mx-auto mb-2 text-[#666666]" />
                      <p>{searchLote ? t('inventory.noResultsForLot') : t('inventory.entryValidationDialog.noPending')}</p>
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
                          <span className="text-sm">{formatearFechaEntrada(entrada.fecha)}</span>
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
                          {entrada.diasDesdeEntrada}{t('inventory.entryValidationDialog.daysShort')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>
          </ScrollArea>
        </div>

        <DialogFooter className="border-t px-4 pb-4 pt-4 sm:px-6 sm:pb-6">
          <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              <X className="h-4 w-4 mr-2" />
              {t('inventory.close')}
            </Button>
            <Button
              onClick={validarEntradasSeleccionadas}
              disabled={entradasSeleccionadas.length === 0 || cargando}
              className="w-full bg-[#4CAF50] hover:bg-[#45a049] sm:w-auto"
            >
              <Check className="h-4 w-4 mr-2" />
              {cargando ? t('inventory.entryValidationDialog.validating') : t('inventory.entryValidationDialog.validateButton', { count: entradasSeleccionadas.length })}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}