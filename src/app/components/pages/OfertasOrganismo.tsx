import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tag, Calendar, Package, DollarSign, Scale, Building2,
  CheckCircle2, XCircle, Clock, AlertCircle, Eye, ShoppingCart,
  Bell, BellOff, Filter, Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { 
  obtenerOfertasParaOrganismo,
  actualizarEstadoOferta,
  type Oferta 
} from '../../utils/ofertaStorage';
import { formatMoney, formatQuantity } from '../../utils/formatUtils';
import {
  obtenerNotificacionesOfertasNoLeidas,
  marcarNotificacionOfertaComoLeida,
  type NotificacionOferta
} from '../../utils/notificacionStorage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { DialogAceptarOferta } from '../inventario/DialogAceptarOferta';
import { useBranding } from '../../../hooks/useBranding';
import { useCompactViewport } from '../../../hooks/useCompactViewport';
import { obtenerProductos } from '../../utils/productStorage';
import { calcularValorMonetario } from '../../utils/categoriaStorage';
import { obtenerOrganismos } from '../../utils/organismosStorage';

export function OfertasOrganismo() {
  const { t } = useTranslation();
  const branding = useBranding();
  const { viewportZoom: offersViewportZoom } = useCompactViewport({
    resolveZoom: ({ width, height }) => {
      if (height < 600) {
        return 0.78;
      }

      if (height < 700 || width < 1100) {
        return 0.9;
      }

      return 1;
    },
  });
  const organismoActual = React.useMemo(() => obtenerOrganismos().find(organismo => organismo.activo) || null, []);
  const tipoAsistenciaOrganismo = typeof organismoActual?.tipoAsistencia === 'string'
    ? organismoActual.tipoAsistencia
    : undefined;
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState<NotificacionOferta[]>([]);
  const [filtro, setFiltro] = useState<'todas' | 'activas' | 'expiradas'>('activas');
  const [busqueda, setBusqueda] = useState('');
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState<Oferta | null>(null);
  const [dialogDetalleOpen, setDialogDetalleOpen] = useState(false);
  const [dialogAceptarOpen, setDialogAceptarOpen] = useState(false);

  // Cargar ofertas y notificaciones
  useEffect(() => {
    cargarDatos();
  }, [organismoActual?.id, tipoAsistenciaOrganismo]);

  const cargarDatos = () => {
    if (!organismoActual) {
      setOfertas([]);
      setNotificacionesNoLeidas([]);
      return;
    }

    const ofertasVisibles = obtenerOfertasParaOrganismo(organismoActual.id, tipoAsistenciaOrganismo);

    setOfertas(ofertasVisibles);
    
    // Cargar notificaciones no leídas
    const notifs = obtenerNotificacionesOfertasNoLeidas(organismoActual.id);
    setNotificacionesNoLeidas(notifs);
  };

  // Marcar notificaciones como leídas al montar el componente
  useEffect(() => {
    notificacionesNoLeidas.forEach(notif => {
      marcarNotificacionOfertaComoLeida(notif.id);
    });
  }, []);

  // Calcular estado de la oferta
  const calcularEstadoOferta = (oferta: Oferta): {
    estado: 'activa' | 'expirada' | 'agotada';
    label: string;
    color: string;
    diasRestantes: number;
  } => {
    const ahora = new Date();
    const fechaExpiracion = new Date(oferta.fechaExpiracion);
    const diasRestantes = Math.ceil((fechaExpiracion.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
    
    // Verificar si está expirada
    if (fechaExpiracion < ahora || !oferta.activa) {
      return {
        estado: 'expirada',
        label: t('offers.statusExpired'),
        color: '#DC3545',
        diasRestantes: 0
      };
    }
    
    // Verificar si tiene productos disponibles
    const tieneDisponibilidad = oferta.productos.some(p => p.cantidadDisponible > 0);
    if (!tieneDisponibilidad) {
      return {
        estado: 'agotada',
        label: t('offers.statusSoldOut'),
        color: '#6c757d',
        diasRestantes
      };
    }
    
    return {
      estado: 'activa',
      label: diasRestantes <= 3 ? t('offers.expiresIn', { days: diasRestantes }) : t('offers.statusActive'),
      color: diasRestantes <= 3 ? '#FFC107' : '#4CAF50',
      diasRestantes
    };
  };

  // Filtrar ofertas según criterios
  const ofertasFiltradas = ofertas.filter(oferta => {
    const estadoOferta = calcularEstadoOferta(oferta);
    
    // Filtro por estado
    if (filtro === 'activas' && estadoOferta.estado !== 'activa') return false;
    if (filtro === 'expiradas' && estadoOferta.estado === 'activa') return false;
    
    // Filtro por búsqueda
    if (busqueda.trim()) {
      const searchLower = busqueda.toLowerCase();
      return (
        oferta.titulo.toLowerCase().includes(searchLower) ||
        oferta.numeroOferta.toLowerCase().includes(searchLower) ||
        oferta.descripcion?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const verDetalleOferta = (oferta: Oferta) => {
    setOfertaSeleccionada(oferta);
    setDialogDetalleOpen(true);
  };

  const aceptarOferta = (oferta: Oferta, cantidadParcial?: boolean) => {
    // Abrir el diálogo de aceptación de oferta
    setOfertaSeleccionada(oferta);
    setDialogAceptarOpen(true);
  };

  // Contar ofertas por estado
  const contadores = {
    total: ofertas.length,
    activas: ofertas.filter(o => calcularEstadoOferta(o).estado === 'activa').length,
    nuevas: notificacionesNoLeidas.filter(n => n.tipo === 'nueva_oferta').length
  };

  return (
    <div className="min-h-[calc(100vh-56px)] relative overflow-hidden" style={offersViewportZoom < 1 ? { zoom: offersViewportZoom } : undefined}>
      {/* Fondo degradado con colores del branding */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`
        }}
      />
      
      {/* Formas decorativas animadas */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-96 h-96 rounded-full opacity-20 animate-pulse"
          style={{
            top: '-10%',
            right: '-10%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
            animation: 'pulse 4s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full opacity-20 animate-pulse"
          style={{
            bottom: '-15%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
            animation: 'pulse 5s ease-in-out infinite',
            animationDelay: '1s'
          }}
        />
        <div 
          className="absolute w-64 h-64 rounded-full opacity-10"
          style={{
            top: '50%',
            right: '20%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%)',
            animation: 'pulse 6s ease-in-out infinite',
            animationDelay: '2s'
          }}
        />
      </div>

      {/* Contenido con z-index superior */}
      <div className="relative z-10 space-y-3 sm:space-y-4 p-3 sm:p-4">
        {/* Header con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-3 sm:p-4 border border-white/60">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                🏷️ {t('offers.availableOffers')}
              </h1>
              <p className="text-gray-700 mt-1 text-sm sm:text-base">
                {t('offers.organism')}: <span className="font-semibold">{organismoActual?.nombre || t('offers.organismNotConfigured')}</span>
              </p>
            </div>
          </div>
        </div>

      {/* Alertas de nuevas ofertas */}
      {notificacionesNoLeidas.length > 0 && (
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 border border-white/60 border-l-4 border-l-[#FFC107]">
          <div className="flex items-start gap-3">
            <Bell className="w-6 h-6 text-[#FFC107] flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1">
              <h3 className="font-semibold text-[#FF9800] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('offers.newNotifications', { 
                  count: notificacionesNoLeidas.length, 
                  notification: notificacionesNoLeidas.length === 1 ? t('offers.notification') : t('offers.notifications')
                })}
              </h3>
              <div className="space-y-2">
                {notificacionesNoLeidas.slice(0, 3).map(notif => (
                  <div key={notif.id} className="text-sm text-gray-700">
                    • {notif.mensaje}
                  </div>
                ))}
                {notificacionesNoLeidas.length > 3 && (
                  <p className="text-sm text-gray-600 italic">
                    {t('offers.andMore', { count: notificacionesNoLeidas.length - 3 })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas con glassmorphism */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-4 sm:p-6 border border-white/60 border-l-4" style={{ borderLeftColor: branding.primaryColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">{t('offers.totalOffers')}</p>
              <p className="text-2xl sm:text-3xl font-bold mt-1" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                {contadores.total}
              </p>
            </div>
            <Tag className="w-10 h-10 sm:w-12 sm:h-12 opacity-20" style={{ color: branding.primaryColor }} />
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-3 sm:p-4 border border-white/60 border-l-4 border-l-[#4CAF50]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">{t('offers.activeOffers')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#4CAF50] mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {contadores.activas}
              </p>
            </div>
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#4CAF50] opacity-20" />
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-3 sm:p-4 border border-white/60 border-l-4 border-l-[#FFC107]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">{t('offers.newOffers')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-[#FFC107] mt-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {contadores.nuevas}
              </p>
            </div>
            <Bell className="w-10 h-10 sm:w-12 sm:h-12 text-[#FFC107] opacity-20" />
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda con glassmorphism */}
      <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-3 border border-white/60">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder={t('offers.searchPlaceholder')}
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <Select value={filtro} onValueChange={(value: any) => setFiltro(value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('offers.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">{t('offers.all')}</SelectItem>
                <SelectItem value="activas">{t('offers.active')}</SelectItem>
                <SelectItem value="expiradas">{t('offers.expired')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Lista de ofertas con glassmorphism */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {ofertasFiltradas.length === 0 ? (
          <div className="col-span-full backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-6 border border-white/60 text-center">
            <Tag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm sm:text-base text-gray-500 mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {t('offers.noOffersAvailable')}
            </p>
            <p className="text-xs sm:text-sm text-gray-400">
              {filtro === 'activas' ? t('offers.noActiveOffersAtMoment') : t('offers.noOffersWithFilters')}
            </p>
          </div>
        ) : (
          ofertasFiltradas.map(oferta => {
            const estadoOferta = calcularEstadoOferta(oferta);
            const totalDisponible = oferta.productos.reduce((sum, p) => sum + p.cantidadDisponible, 0);
            const porcentajeDisponible = (totalDisponible / oferta.productos.reduce((sum, p) => sum + p.cantidadOfrecida, 0)) * 100;

            return (
              <div 
                key={oferta.id} 
                className={`backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl border-2 hover:shadow-2xl transition-all ${
                  estadoOferta.estado === 'activa' 
                    ? 'border-[#4CAF50] hover:border-[#45A049]' 
                    : 'border-white/60'
                }`}
              >
                <div className="p-4 sm:p-6 pb-3">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge 
                          style={{ backgroundColor: estadoOferta.color }}
                          className="text-white"
                        >
                          {estadoOferta.estado === 'activa' ? (
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                          ) : (
                            <XCircle className="w-3 h-3 mr-1" />
                          )}
                          {estadoOferta.label}
                        </Badge>
                        {estadoOferta.diasRestantes <= 3 && estadoOferta.estado === 'activa' && (
                          <Badge className="bg-[#FFC107] text-gray-900">
                            <Clock className="w-3 h-3 mr-1" />
                            {t('offers.expiresSoon')}
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                        {oferta.titulo}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">{oferta.numeroOferta}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl">🏷️</div>
                    </div>
                  </div>
                </div>

                <div className="px-4 sm:px-6 pb-4 sm:pb-6 space-y-4">
                  {oferta.descripcion && (
                    <p className="text-sm text-gray-700 line-clamp-2">{oferta.descripcion}</p>
                  )}

                  {/* Información de productos */}
                  <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" style={{ color: branding.primaryColor }} />
                      <span className="text-gray-600">{t('offers.products')}:</span>
                      <span className="font-semibold">{oferta.totalProductos}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#4CAF50]" />
                      <span className="text-gray-600">{t('offers.value')}:</span>
                      <span className="font-semibold text-[#4CAF50]">CAD$ {formatMoney(oferta.valorMonetarioTotal)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-[#FFC107]" />
                      <span className="text-gray-600">{t('offers.weight')}:</span>
                      <span className="font-semibold">{formatQuantity(oferta.totalKilos)} kg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-600">{t('offers.expires')}:</span>
                      <span className="font-semibold">
                        {new Date(oferta.fechaExpiracion).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Barra de disponibilidad */}
                  {estadoOferta.estado === 'activa' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{t('offers.availability')}</span>
                        <span className="font-semibold">{porcentajeDisponible.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            porcentajeDisponible > 50 ? 'bg-[#4CAF50]' : 
                            porcentajeDisponible > 20 ? 'bg-[#FFC107]' : 
                            'bg-[#DC3545]'
                          }`}
                          style={{ width: `${porcentajeDisponible}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Productos preview */}
                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-600 mb-2">{t('offers.productsIncluded')}</p>
                    <div className="flex flex-wrap gap-1">
                      {oferta.productos.slice(0, 3).map((prod, idx) => (
                        <Badge key={`${oferta.id}-prod-${idx}`} variant="outline" className="text-xs">
                          {prod.icono} {prod.productoNombre}
                        </Badge>
                      ))}
                      {oferta.productos.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{oferta.productos.length - 3} {t('offers.more')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-xs sm:text-sm"
                      onClick={() => verDetalleOferta(oferta)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {t('offers.viewDetails')}
                    </Button>
                    {estadoOferta.estado === 'activa' && (
                      <Button
                        className="flex-1 bg-[#4CAF50] hover:bg-[#45A049] text-xs sm:text-sm"
                        onClick={() => aceptarOferta(oferta)}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {t('offers.acceptOffer')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      </div>

      {/* Dialog Detalle de Oferta */}
      <Dialog open={dialogDetalleOpen} onOpenChange={setDialogDetalleOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-thin" aria-describedby="offer-detail-description">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {t('offers.offerDetailTitle')}
            </DialogTitle>
            <DialogDescription id="offer-detail-description">
              {t('offers.offerDetailDescription')}
            </DialogDescription>
          </DialogHeader>
          {ofertaSeleccionada && (
            <div className="space-y-6 py-4">
              {/* Aquí iría el contenido detallado de la oferta */}
              <p className="text-center text-gray-500">{t('offers.detailComponentInDevelopment')}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Aceptar Oferta */}
      {ofertaSeleccionada && (
        <DialogAceptarOferta
          open={dialogAceptarOpen}
          onOpenChange={setDialogAceptarOpen}
          ofertaId={ofertaSeleccionada.id}
          organismoId={organismoActual?.id || ''}
          organismoNombre={organismoActual?.nombre || 'Organisme'}
          onOfertaAceptada={() => {
            cargarDatos();
            setDialogAceptarOpen(false);
          }}
        />
      )}
    </div>
  );
}