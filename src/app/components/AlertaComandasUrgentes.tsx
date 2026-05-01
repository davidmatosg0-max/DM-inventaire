import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Clock, AlertTriangle, Eye } from 'lucide-react';
import { mockComandas, mockOrganismos } from '../data/mockData';

export function AlertaComandasUrgentes() {
  // Calcular días restantes para una fecha límite
  const calcularDiasRestantes = (fechaLimite: string) => {
    const hoy = new Date();
    const fecha = new Date(fechaLimite);
    const diferenciaTiempo = fecha.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));
    return diasRestantes;
  };

  // Filtrar comandas pendientes con fecha límite próxima (3 días o menos)
  const comandasUrgentes = mockComandas.filter(comanda => {
    if (!comanda.fechaLimiteRespuesta) return false;
    if (comanda.estado !== 'pendiente' && comanda.estado !== 'en_preparacion') return false;
    
    const diasRestantes = calcularDiasRestantes(comanda.fechaLimiteRespuesta);
    return diasRestantes <= 3 && diasRestantes >= 0;
  });

  if (comandasUrgentes.length === 0) return null;

  return (
    <Card className="border-l-4 border-l-[#DC3545]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}>
            <AlertTriangle className="w-5 h-5 text-[#DC3545]" />
            Comandas con Respuesta Urgente
          </CardTitle>
          <Badge className="bg-[#DC3545]">
            {comandasUrgentes.length} pendiente{comandasUrgentes.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {comandasUrgentes.map(comanda => {
            const organismo = mockOrganismos.find(o => o.id === comanda.organismoId);
            const diasRestantes = calcularDiasRestantes(comanda.fechaLimiteRespuesta!);
            const esMuyUrgente = diasRestantes <= 1;
            
            return (
              <div
                key={comanda.id}
                className={`p-4 rounded-lg border-2 ${
                  esMuyUrgente 
                    ? 'bg-red-50 border-red-300' 
                    : 'bg-orange-50 border-orange-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className={`w-4 h-4 ${esMuyUrgente ? 'text-red-600' : 'text-orange-600'}`} />
                      <span className="font-semibold text-[#333333]">
                        {comanda.numero}
                      </span>
                      {esMuyUrgente && (
                        <Badge className="bg-red-600 text-white text-xs">
                          ¡MUY URGENTE!
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-[#666666] mb-1">
                      <strong>Organismo:</strong> {organismo?.nombre}
                    </p>
                    
                    <p className="text-sm text-[#666666] mb-1">
                      <strong>Fecha límite:</strong>{' '}
                      {new Date(comanda.fechaLimiteRespuesta!).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long'
                      })}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Badge 
                        className={esMuyUrgente ? 'bg-red-600' : 'bg-orange-500'}
                        style={{ fontSize: '0.75rem' }}
                      >
                        {diasRestantes === 0 
                          ? '¡Vence hoy!' 
                          : diasRestantes === 1 
                            ? 'Vence mañana' 
                            : `${diasRestantes} días restantes`}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {comanda.items.length} productos
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className={`mt-4 p-3 rounded-lg ${
          comandasUrgentes.some(c => calcularDiasRestantes(c.fechaLimiteRespuesta!) <= 1)
            ? 'bg-red-100 border border-red-300'
            : 'bg-orange-100 border border-orange-300'
        }`}>
          <p className="text-sm text-[#333333]">
            <strong>💡 Recordatorio:</strong> Los organismos deben confirmar estas comandas antes de la fecha límite. 
            Considera contactarlos para recordarles sobre la confirmación pendiente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
