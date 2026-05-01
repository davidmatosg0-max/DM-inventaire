import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Bookmark, Trash2, X, TrendingDown, ArrowRight } from 'lucide-react';
import type { PlantillaConversion } from '../../utils/conversionStorage';

interface PlantillasConversionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plantillas: PlantillaConversion[];
  onAplicar: (plantilla: PlantillaConversion) => void;
  onEliminar: (plantillaId: string) => void;
}

export function PlantillasConversion({
  open,
  onOpenChange,
  plantillas,
  onAplicar,
  onEliminar
}: PlantillasConversionProps) {
  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" aria-describedby="plantillas-conversion-description">
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }} className="text-xl flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#1E73BE]" />
            Plantillas de Conversión
          </DialogTitle>
          <DialogDescription id="plantillas-conversion-description" className="text-sm mt-1">
            Guarda configuraciones de conversión frecuentes para reutilizarlas rápidamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {plantillas.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Bookmark className="w-16 h-16 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-[#666666]">No hay plantillas guardadas</p>
              <p className="text-xs text-[#999999] mt-1">
                Al crear una conversión, marca la opción "Guardar como plantilla" para crear una
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plantillas.map((plantilla) => (
                <div
                  key={plantilla.id}
                  className="border-2 border-blue-200 bg-blue-50/30 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {/* Encabezado */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-[#333333] text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {plantilla.icono || '📦'} {plantilla.nombre}
                      </h4>
                      {plantilla.descripcion && (
                        <p className="text-xs text-[#666666] mt-1 line-clamp-2">
                          {plantilla.descripcion}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={() => onEliminar(plantilla.id)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  {/* Configuración de la plantilla */}
                  <div className="space-y-2 mb-3">
                    <div className="text-xs">
                      <div className="flex items-center gap-1.5 text-[#666666] mb-1.5">
                        <ArrowRight className="w-3 h-3" />
                        <span className="font-medium">Configuración:</span>
                      </div>
                      <div className="pl-5 space-y-1">
                        {plantilla.configuracion.map((config, index) => (
                          <div key={index} className="flex items-center gap-1.5 text-[#333333]">
                            <span className="w-12 font-mono text-right">{config.ratio.toFixed(2)}x</span>
                            <ArrowRight className="w-3 h-3 text-[#FFC107]" />
                            <span className="truncate">{config.productoDestinoNombre}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Merma esperada */}
                    {plantilla.mermaEsperada > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-orange-600">
                        <TrendingDown className="w-3 h-3" />
                        <span>Merma esperada: {plantilla.mermaEsperada.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center justify-between pt-3 border-t border-blue-200">
                    <div className="flex items-center gap-2 text-xs text-[#666666]">
                      <Badge variant="outline" className="text-xs bg-white">
                        Usada {plantilla.vecesUsada} {plantilla.vecesUsada === 1 ? 'vez' : 'veces'}
                      </Badge>
                      <span>•</span>
                      <span>{formatearFecha(plantilla.fechaCreacion)}</span>
                    </div>
                  </div>

                  {/* Botón Aplicar */}
                  <Button
                    onClick={() => {
                      onAplicar(plantilla);
                      onOpenChange(false);
                    }}
                    className="w-full mt-3 h-9 bg-[#1E73BE] hover:bg-[#1565C0] text-white"
                    size="sm"
                  >
                    Aplicar Plantilla
                  </Button>
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