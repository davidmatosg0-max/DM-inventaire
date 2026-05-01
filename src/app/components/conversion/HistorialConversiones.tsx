import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { History, Undo2, X, TrendingDown, ArrowRight, Clock } from 'lucide-react';
import type { RegistroConversion } from '../../utils/conversionStorage';

interface HistorialConversionesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversiones: RegistroConversion[];
  onRevertir: (conversionId: string) => void;
}

export function HistorialConversiones({
  open,
  onOpenChange,
  conversiones,
  onRevertir
}: HistorialConversionesProps) {
  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto" aria-describedby="historial-conversiones-description">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }} className="text-xl flex items-center gap-2">
            <History className="w-5 h-5 text-[#FFC107]" />
            Historial de Conversiones
          </DialogTitle>
          <DialogDescription id="historial-conversiones-description" className="text-sm mt-1">
            Registro completo de todas las conversiones realizadas. Puedes revertir conversiones recientes si es necesario.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {conversiones.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <History className="w-16 h-16 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-[#666666]">No hay conversiones registradas</p>
              <p className="text-xs text-[#999999] mt-1">
                Las conversiones que realices aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversiones.map((conversion) => (
                <div
                  key={conversion.id}
                  className={`border-2 rounded-lg p-4 ${
                    conversion.revertida
                      ? 'bg-gray-50 border-gray-300 opacity-60'
                      : 'bg-white border-orange-200'
                  }`}
                >
                  {/* Encabezado */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#666666]" />
                      <span className="text-sm text-[#666666]">
                        {formatearFecha(conversion.fecha)}
                      </span>
                      {conversion.revertida && (
                        <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs">
                          Revertida {conversion.fechaReversion && `• ${formatearFecha(conversion.fechaReversion)}`}
                        </Badge>
                      )}
                    </div>
                    {!conversion.revertida && (
                      <Button
                        onClick={() => onRevertir(conversion.id)}
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Undo2 className="w-3 h-3 mr-1" />
                        Revertir
                      </Button>
                    )}
                  </div>

                  {/* Detalles de la conversión */}
                  <div className="space-y-2">
                    {/* Producto Origen */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-red-500 font-bold">−</span>
                      <span className="font-medium text-[#333333]">
                        {conversion.productoOrigen.cantidad.toFixed(2)} {conversion.productoOrigen.unidad}
                      </span>
                      <span className="text-[#666666]">de</span>
                      <span className="font-semibold text-[#333333]">
                        {conversion.productoOrigen.productoNombre}
                      </span>
                    </div>

                    {/* Merma si existe */}
                    {conversion.merma > 0 && (
                      <div className="flex items-center gap-2 text-sm pl-5">
                        <TrendingDown className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-orange-600">
                          Merma: {conversion.merma.toFixed(2)} {conversion.productoOrigen.unidad}
                        </span>
                        {conversion.mermaMotivo && (
                          <span className="text-xs text-[#666666] italic">
                            ({conversion.mermaMotivo})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Flecha separadora */}
                    <div className="flex items-center gap-2 py-1">
                      <div className="h-px flex-1 bg-gray-200"></div>
                      <ArrowRight className="w-4 h-4 text-[#FFC107]" />
                      <div className="h-px flex-1 bg-gray-200"></div>
                    </div>

                    {/* Productos Destino */}
                    {conversion.productosDestino.map((destino, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="text-green-500 font-bold">+</span>
                        <span className="font-medium text-[#333333]">
                          {destino.cantidad.toFixed(2)} {destino.unidad}
                        </span>
                        <span className="text-[#666666]">a</span>
                        <span className="font-semibold text-[#333333]">
                          {destino.productoNombre}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Observaciones */}
                  {conversion.observaciones && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-[#666666] italic">
                        📝 {conversion.observaciones}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón Cerrar */}
        <div className="flex justify-end pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 px-6"
          >
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}