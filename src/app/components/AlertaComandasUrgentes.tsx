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
            Commandes avec réponse urgente
          </CardTitle>
          <Badge className="bg-[#DC3545]">
            {comandasUrgentes.length} en attente
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
                          TRES URGENT
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-[#666666] mb-1">
                      <strong>Organisme :</strong> {organismo?.nombre}
                    </p>
                    
                    <p className="text-sm text-[#666666] mb-1">
                      <strong>Date limite :</strong>{' '}
                      {new Date(comanda.fechaLimiteRespuesta!).toLocaleDateString('fr-CA', {
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
                          ? 'Échéance aujourd\'hui' 
                          : diasRestantes === 1 
                            ? 'Échéance demain' 
                            : `${diasRestantes} jours restants`}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {comanda.items.length} produits
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Voir
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
            <strong>💡 Rappel :</strong> Les organismes doivent confirmer ces commandes avant la date limite.
            Pensez à les contacter pour leur rappeler la confirmation en attente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
