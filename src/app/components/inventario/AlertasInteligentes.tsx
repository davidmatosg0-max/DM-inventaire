import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Calendar, TrendingDown, CheckCircle, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { toast } from 'sonner';
import { obtenerProductos } from '../../utils/productStorage';
import { obtenerEntradas } from '../../utils/entradaInventarioStorage';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';

type Alerta = {
  id: string;
  tipo: 'stock-critico' | 'caducidad' | 'stock-alto' | 'sin-movimiento';
  prioridad: 'alta' | 'media' | 'baja';
  productoId: string;
  productoNombre: string;
  mensaje: string;
  accion: string;
  fecha: Date;
  leida: boolean;
};

export function AlertasInteligentes() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [alertasLeidas, setAlertasLeidas] = useState<string[]>([]);

  useEffect(() => {
    generarAlertas();
    // Actualizar alertas cada 5 minutos
    const interval = setInterval(generarAlertas, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const generarAlertas = () => {
    const productos = obtenerProductos();
    const entradas = obtenerEntradas();
    const ahora = new Date();
    const alertasGeneradas: Alerta[] = [];

    productos.forEach(producto => {
      if (!producto.activo) return;

      // Alerta: Stock Crítico
      if (producto.stockActual <= producto.stockMinimo && producto.stockMinimo > 0) {
        alertasGeneradas.push({
          id: `stock-critico-${producto.id}`,
          tipo: 'stock-critico',
          prioridad: 'alta',
          productoId: producto.id,
          productoNombre: producto.nombre,
          mensaje: `Stock critique pour ${producto.nombre} : ${producto.stockActual}`,
          accion: 'Demander un approvisionnement',
          fecha: ahora,
          leida: false
        });
      }

      // Alerta: Caducidad Próxima (menos de 15 días)
      if (producto.fechaVencimiento) {
        const diasHastaCaducidad = differenceInDays(new Date(producto.fechaVencimiento), ahora);
        
        if (diasHastaCaducidad > 0 && diasHastaCaducidad <= 15) {
          alertasGeneradas.push({
            id: `caducidad-${producto.id}`,
            tipo: 'caducidad',
            prioridad: diasHastaCaducidad <= 7 ? 'alta' : 'media',
            productoId: producto.id,
            productoNombre: producto.nombre,
            mensaje: `Produit ${producto.nombre} expirera dans ${diasHastaCaducidad} jours le ${format(new Date(producto.fechaVencimiento), 'dd/MM/yyyy') }`,
            accion: diasHastaCaducidad <= 7 ? 'Distribuer immédiatement' : 'Planifier la distribution',
            fecha: ahora,
            leida: false
          });
        }
      }

      // Alerta: Stock Alto (más de 3x el stock mínimo)
      if (producto.stockActual > producto.stockMinimo * 3 && producto.stockMinimo > 0) {
        alertasGeneradas.push({
          id: `stock-alto-${producto.id}`,
          tipo: 'stock-alto',
          prioridad: 'baja',
          productoId: producto.id,
          productoNombre: producto.nombre,
          mensaje: `Stock élevé pour ${producto.nombre} : ${producto.stockActual} (${Math.round((producto.stockActual / producto.stockMinimo) * 100)}%)`,
          accion: 'Considérer une distribution en masse',
          fecha: ahora,
          leida: false
        });
      }

      // Alerta: Sin Movimiento (sin entradas en 30 días)
      const ultimaEntrada = entradas
        .filter(e => e.productoId === producto.id)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];

      if (ultimaEntrada) {
        const diasSinMovimiento = differenceInDays(ahora, new Date(ultimaEntrada.fecha));
        
        if (diasSinMovimiento > 30 && producto.stockActual > 0) {
          alertasGeneradas.push({
            id: `sin-movimiento-${producto.id}`,
            tipo: 'sin-movimiento',
            prioridad: 'media',
            productoId: producto.id,
            productoNombre: producto.nombre,
            mensaje: `Aucun mouvement pour ${producto.nombre} depuis ${diasSinMovimiento} jours`,
            accion: 'Revoir la demande et le stockage',
            fecha: ahora,
            leida: false
          });
        }
      }
    });

    // Ordenar por prioridad y fecha
    alertasGeneradas.sort((a, b) => {
      const prioridadValor = { alta: 3, media: 2, baja: 1 };
      const diff = prioridadValor[b.prioridad] - prioridadValor[a.prioridad];
      if (diff !== 0) return diff;
      return b.fecha.getTime() - a.fecha.getTime();
    });

    setAlertas(alertasGeneradas);
  };

  const marcarComoLeida = (alertaId: string) => {
    setAlertasLeidas(prev => [...prev, alertaId]);
  };

  const marcarTodasComoLeidas = () => {
    setAlertasLeidas(alertas.map(a => a.id));
    toast.success(`✅ Toutes les alertes ont été marquées comme lues`);
  };

  const obtenerIconoAlerta = (tipo: Alerta['tipo']) => {
    switch (tipo) {
      case 'stock-critico':
        return <TrendingDown className="h-5 w-5" />;
      case 'caducidad':
        return <Calendar className="h-5 w-5" />;
      case 'stock-alto':
        return <Bell className="h-5 w-5" />;
      case 'sin-movimiento':
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const obtenerColorPrioridad = (prioridad: Alerta['prioridad']) => {
    switch (prioridad) {
      case 'alta':
        return 'bg-[#DC3545] text-white border-[#DC3545]';
      case 'media':
        return 'bg-[#FFC107] text-white border-[#FFC107]';
      case 'baja':
        return 'bg-[#1E73BE] text-white border-[#1E73BE]';
    }
  };

  const obtenerColorFondo = (prioridad: Alerta['prioridad']) => {
    switch (prioridad) {
      case 'alta':
        return 'bg-red-50 border-red-200';
      case 'media':
        return 'bg-yellow-50 border-yellow-200';
      case 'baja':
        return 'bg-blue-50 border-blue-200';
    }
  };

  const alertasNoLeidas = alertas.filter(a => !alertasLeidas.includes(a.id));
  const alertasPorPrioridad = {
    alta: alertasNoLeidas.filter(a => a.prioridad === 'alta').length,
    media: alertasNoLeidas.filter(a => a.prioridad === 'media').length,
    baja: alertasNoLeidas.filter(a => a.prioridad === 'baja').length
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#1E73BE]" />
            <CardTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Alertes intelligentes
            </CardTitle>
            {alertasNoLeidas.length > 0 && (
              <Badge className="bg-[#DC3545] text-white">
                {alertasNoLeidas.length} nouvelles alertes
              </Badge>
            )}
          </div>
          {alertasNoLeidas.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={marcarTodasComoLeidas}
              className="text-[#1E73BE]"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Marquer toutes comme lues
            </Button>
          )}
        </div>

        {/* Resumen de prioridades */}
        <div className="flex gap-2 mt-3">
          {alertasPorPrioridad.alta > 0 && (
            <Badge className="bg-[#DC3545] text-white">
              🔴 {alertasPorPrioridad.alta} haute
            </Badge>
          )}
          {alertasPorPrioridad.media > 0 && (
            <Badge className="bg-[#FFC107] text-white">
              🟡 {alertasPorPrioridad.media} moyenne
            </Badge>
          )}
          {alertasPorPrioridad.baja > 0 && (
            <Badge className="bg-[#1E73BE] text-white">
              🔵 {alertasPorPrioridad.baja} basse
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {alertasNoLeidas.length === 0 ? (
          <div className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-[#4CAF50] mb-3" />
            <p className="text-[#666666] font-medium">✅ Aucune alerte en attente</p>
            <p className="text-sm text-[#999999] mt-1">Tous les produits sont sous contrôle</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {alertasNoLeidas.map(alerta => (
                <div
                  key={alerta.id}
                  className={`border rounded-lg p-4 transition-all hover:shadow-md ${obtenerColorFondo(alerta.prioridad)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={obtenerColorPrioridad(alerta.prioridad)}>
                          {obtenerIconoAlerta(alerta.tipo)}
                          <span className="ml-1 uppercase text-xs">
                            {alerta.prioridad === 'alta' ? 'haute' : alerta.prioridad === 'media' ? 'moyenne' : 'basse'}
                          </span>
                        </Badge>
                        <span className="text-xs text-[#666666]">
                          {format(alerta.fecha, 'HH:mm', { locale: fr })}
                        </span>
                      </div>

                      <h4 className="font-semibold text-[#333333] mb-1">
                        {alerta.productoNombre}
                      </h4>
                      
                      <p className="text-sm text-[#666666] mb-2">
                        {alerta.mensaje}
                      </p>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          💡 {alerta.accion}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => marcarComoLeida(alerta.id)}
                      className="text-[#666666] hover:text-[#333333]"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}