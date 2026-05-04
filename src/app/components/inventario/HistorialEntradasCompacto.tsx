import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, RefreshCw, Package, Edit, XCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  obtenerEntradasActivas,
  eliminarEntrada,
  type EntradaInventario 
} from '../../utils/entradaInventarioStorage';
import { EditarEntradaDialog } from './EditarEntradaDialog';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';
import { toast } from 'sonner';

interface HistorialEntradasCompactoProps {
  onAgregarAlCarrito: (entrada: EntradaInventario) => void;
}

export function HistorialEntradasCompacto({ onAgregarAlCarrito }: HistorialEntradasCompactoProps) {
  const { t, i18n } = useTranslation();
  const [entradas, setEntradas] = useState<EntradaInventario[]>([]);
  const [entradaParaEditar, setEntradaParaEditar] = useState<EntradaInventario | null>(null);
  const [dialogoEditarAbierto, setDialogoEditarAbierto] = useState(false);

  const cargarDatos = () => {
    const entradasCargadas = obtenerEntradasActivas();
    // Ordenar por fecha más reciente primero
    entradasCargadas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    setEntradas(entradasCargadas);
  };

  const abrirEditarEntrada = (entrada: EntradaInventario) => {
    setEntradaParaEditar(entrada);
    setDialogoEditarAbierto(true);
  };

  const handleAnularEntrada = (entrada: EntradaInventario) => {
    if (window.confirm(t('inventory.entryHistoryCompact.confirmVoid', { product: entrada.nombreProducto }))) {
      const resultado = eliminarEntrada(entrada.id);
      if (resultado) {
        toast.success(t('inventory.entryHistoryCompact.voidSuccess'));
        cargarDatos();
        // Disparar evento para que otros componentes se actualicen
        window.dispatchEvent(new Event('entradaGuardada'));
      } else {
        toast.error(t('inventory.entryHistoryCompact.voidError'));
      }
    }
  };

  const handleActualizarEntrada = () => {
    cargarDatos();
    // Disparar evento para que otros componentes se actualicen
    window.dispatchEvent(new Event('entradaGuardada'));
  };

  useEffect(() => {
    cargarDatos();
    
    // 🔔 Escuchar eventos de nuevas entradas guardadas
    const handleEntradaGuardada = () => {
      console.log('📢 Nueva entrada detectada, actualizando historial compacto...');
      cargarDatos();
    };
    
    window.addEventListener('entradaGuardada', handleEntradaGuardada);
    
    // Limpieza del evento al desmontar el componente
    return () => {
      window.removeEventListener('entradaGuardada', handleEntradaGuardada);
    };
  }, []);

  const formatearFecha = (isoString: string) => {
    const fecha = new Date(isoString);
    const locale = i18n.resolvedLanguage || i18n.language || 'fr';

    return fecha.toLocaleDateString(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (entradas.length === 0) {
    return (
      <div className="py-12 text-center bg-[#F4F4F4] rounded-lg border-2 border-dashed border-[#E0E0E0]">
        <Package className="w-16 h-16 mx-auto text-[#CCCCCC] mb-4" />
        <p className="text-[#666666] font-medium mb-2">{t('inventory.entryHistoryCompact.emptyTitle')}</p>
        <p className="text-sm text-[#999999]">
          {t('inventory.entryHistoryCompact.emptyDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[#666666]">
          {entradas.length === 1
            ? t('inventory.entryHistoryCompact.registeredSingle', { count: entradas.length })
            : t('inventory.entryHistoryCompact.registeredMultiple', { count: entradas.length })}
        </p>
        <Button
          onClick={cargarDatos}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="w-3 h-3" />
          {t('inventory.entryHistoryCompact.refresh')}
        </Button>
      </div>

      {entradas.map((entrada) => (
        <div
          key={entrada.id}
          className="p-3 bg-white rounded-lg border-2 border-[#E0E0E0] hover:border-purple-400 transition-all hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            {/* Información Principal */}
            <div className="flex-1 space-y-2 min-w-0">
              {/* Header con Badge y Fecha */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  className="text-white text-xs"
                  style={{ backgroundColor: entrada.programaColor }}
                >
                  {entrada.programaIcono} {entrada.programaCodigo}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-[#666666]">
                  <Calendar className="w-3 h-3" />
                  <span>{formatearFecha(entrada.fecha)}</span>
                </div>
              </div>

              {/* Información del Producto */}
              <div className="flex items-center gap-2">
                {entrada.productoIcono && (
                  <span className="text-2xl">{entrada.productoIcono}</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#333333] truncate" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {entrada.nombreProducto}
                  </p>
                  <p className="text-xs text-[#666666]">
                    {entrada.donadorNombre}
                  </p>
                </div>
              </div>

              {/* Cantidades */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-[#666666]">{t('inventory.quantity')}:</span>
                  <span className="font-bold text-sm text-[#333333]">
                    {formatQuantity(entrada.cantidad)} {entrada.unidad}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xs">⚖️</span>
                  <span className="font-medium text-sm text-[#1E73BE]">
                    {formatQuantity(entrada.pesoTotal || 0)} kg
                  </span>
                </div>
                {/* Valor Total */}
                {entrada.valorTotal && entrada.valorTotal > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs">💰</span>
                    <span className="font-bold text-sm text-[#2d9561]">
                      CAD$ {formatMoney(entrada.valorTotal)}
                    </span>
                  </div>
                )}
              </div>

              {/* Temperatura */}
              <Badge
                className={`text-xs ${
                  entrada.temperatura === 'ambiente' ? 'bg-[#FFC107]' :
                  entrada.temperatura === 'refrigerado' ? 'bg-[#2196F3]' :
                  'bg-[#00BCD4]'
                } text-white`}
              >
                {entrada.temperatura === 'ambiente' ? `🌡️ ${t('inventory.ambient')}` :
                 entrada.temperatura === 'refrigerado' ? `❄️ ${t('inventory.refrigerated')}` :
                 `🧊 ${t('inventory.frozen')}`}
              </Badge>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Button
                onClick={() => abrirEditarEntrada(entrada)}
                variant="outline"
                size="sm"
                className="gap-1 border-[#1E73BE] text-[#1E73BE] hover:bg-[#1E73BE] hover:text-white transition-all"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">{t('edit')}</span>
              </Button>
              {/* Botón Anular - ACTUALIZADO 15/03/2026 */}
              <Button
                onClick={() => handleAnularEntrada(entrada)}
                variant="outline"
                size="sm"
                className="gap-1 border-2 border-[#DC3545] text-[#DC3545] hover:bg-[#DC3545] hover:text-white transition-all shadow-sm"
                title={t('inventory.entryHistoryCompact.voidButtonTitle')}
              >
                <XCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{t('inventory.entryHistoryCompact.voidButton')}</span>
              </Button>
            </div>
          </div>
        </div>
      ))}

      {/* Dialogo de Editar Entrada */}
      <EditarEntradaDialog
        entrada={entradaParaEditar}
        open={dialogoEditarAbierto}
        onOpenChange={setDialogoEditarAbierto}
        onActualizar={handleActualizarEntrada}
      />
    </div>
  );
}