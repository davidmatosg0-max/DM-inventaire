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
  obtenerOfertaPorId,
  obtenerOfertasParaOrganismo,
  actualizarEstadoOferta,
  type EstadoSolicitud,
  type Oferta,
  type SolicitudOferta
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
import { ModulePageHeader, ModuleStatCard, ModuleStatsGrid } from '../shared/ModulePageHeader';

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
  const productosCatalogo = React.useMemo(() => obtenerProductos(), []);
  const productosCatalogoPorId = React.useMemo(() => {
    return new Map(
      productosCatalogo.map(producto => {
        const rawProducto = producto as unknown as Record<string, unknown>;
        const imageField = ['photo', 'foto', 'imageUrl', 'imagenUrl', 'imagen', 'thumbnail'].find(field => {
          const candidate = rawProducto[field];
          return typeof candidate === 'string' && candidate.trim().length > 0;
        });

        return [
          producto.id,
          {
            nombre: producto.nombre,
            categoria: producto.categoria,
            subcategoria: producto.subcategoria,
            icono: producto.icono,
            photoUrl: imageField ? String(rawProducto[imageField]) : undefined,
          },
        ];
      })
    );
  }, [productosCatalogo]);
  const organismosPorId = React.useMemo(() => {
    return new Map(
      obtenerOrganismos().map(organismo => [organismo.id, organismo.nombre])
    );
  }, []);
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
  const [solicitudReutilizada, setSolicitudReutilizada] = useState<SolicitudOferta | null>(null);
  const [filtroHistorial, setFiltroHistorial] = useState<'todas' | EstadoSolicitud>('todas');

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
    const ofertaActualizada = obtenerOfertaPorId(oferta.id);
    setOfertaSeleccionada(ofertaActualizada || oferta);
    setDialogDetalleOpen(true);
  };

  const resolverDestinoOferta = (oferta: Oferta) => {
    if (oferta.organismosDestino === 'todos') {
      return {
        mode: 'todos' as const,
        title: 'Tous les organismes',
        subtitle: 'Diffusion groupée'
      };
    }

    if (Array.isArray(oferta.organismosDestino)) {
      const nombres = oferta.organismosDestino
        .map(organismoId => organismosPorId.get(organismoId))
        .filter((nombre): nombre is string => Boolean(nombre));

      if (oferta.organismosDestino.length <= 1) {
        return {
          mode: 'individual' as const,
          title: nombres[0] || organismoActual?.nombre || t('offers.organismNotConfigured'),
          subtitle: 'Offre individuelle'
        };
      }

      return {
        mode: 'groupe' as const,
        title: `Groupe de ${oferta.organismosDestino.length} organismes`,
        subtitle: nombres.length > 0
          ? `${nombres.slice(0, 3).join(', ')}${nombres.length > 3 ? ` +${nombres.length - 3}` : ''}`
          : 'Offre groupée'
      };
    }

    return {
      mode: 'individual' as const,
      title: organismoActual?.nombre || t('offers.organismNotConfigured'),
      subtitle: 'Offre individuelle'
    };
  };

  const resumenDestinatario = React.useMemo(() => {
    if (ofertasFiltradas.length === 0) {
      return {
        label: t('offers.organism'),
        value: organismoActual?.nombre || t('offers.organismNotConfigured')
      };
    }

    const modos = new Set(ofertasFiltradas.map(oferta => resolverDestinoOferta(oferta).mode));

    if (modos.size === 1 && modos.has('individual')) {
      return {
        label: t('offers.organism'),
        value: organismoActual?.nombre || t('offers.organismNotConfigured')
      };
    }

    if (modos.size === 1 && modos.has('todos')) {
      return {
        label: 'Diffusion',
        value: 'Tous les organismes'
      };
    }

    if (modos.size === 1 && modos.has('groupe')) {
      return {
        label: 'Diffusion',
        value: 'Groupe d\'organismes'
      };
    }

    return {
      label: 'Diffusion',
      value: 'Individuelle et groupée'
    };
  }, [ofertasFiltradas, organismoActual?.nombre, t]);

  const aceptarOferta = (oferta: Oferta, solicitudBase?: SolicitudOferta) => {
    setOfertaSeleccionada(oferta);
    setSolicitudReutilizada(solicitudBase || null);
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
        {/* Header professionnel unifié */}
        <ModulePageHeader
          title={t('offers.availableOffers')}
          subtitle={`${resumenDestinatario.label} : ${resumenDestinatario.value}`}
          icon={<Tag className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
          accentColor={branding.primaryColor}
          secondaryColor={branding.secondaryColor}
          compact
          showExperienceChips={false}
          showContextChips={false}
        />

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

      {/* Estadísticas — grille responsive normalisée */}
      <ModuleStatsGrid defaultLayout="grid grid-cols-1 sm:grid-cols-3">
        <ModuleStatCard
          label={t('offers.totalOffers')}
          value={contadores.total}
          icon={<Tag className="h-5 w-5 text-white" />}
          accentColor={branding.primaryColor}
          secondaryColor={branding.primaryColor}
          compact
          showPriorityView={false}
        />
        <ModuleStatCard
          label={t('offers.activeOffers')}
          value={contadores.activas}
          icon={<CheckCircle2 className="h-5 w-5 text-white" />}
          accentColor="#4CAF50"
          secondaryColor="#4CAF50"
          valueColor="#4CAF50"
          compact
          showPriorityView={false}
        />
        <ModuleStatCard
          label={t('offers.newOffers')}
          value={contadores.nuevas}
          icon={<Bell className="h-5 w-5 text-white" />}
          accentColor="#FFC107"
          secondaryColor="#FFB300"
          valueColor="#FFC107"
          compact
          showPriorityView={false}
        />
      </ModuleStatsGrid>

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
            const destinoOferta = resolverDestinoOferta(oferta);

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
                      <div className="mt-2 flex items-start gap-2 text-xs sm:text-sm text-gray-600">
                        <Building2 className="mt-0.5 h-4 w-4 text-[#1E73BE]" />
                        <div className="min-w-0">
                          <p className="font-semibold text-[#0f172a]">
                            {destinoOferta.mode === 'individual' ? 'Organisme ciblé' : 'Diffusion'}
                          </p>
                          <p className="truncate">{destinoOferta.title}</p>
                        </div>
                      </div>
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
                    <div className="flex flex-col gap-1">
                      {oferta.productos.slice(0, 3).map((prod, idx) => {
                        const pesoUnitario = Number(prod.peso) || 0;
                        const detallePeso = pesoUnitario > 0
                          ? ` · ${formatQuantity(pesoUnitario)} kg/${prod.unidad || 'unité'}`
                          : '';
                        const limiteMax = Number(prod.limiteMaximoPorOrganismo) || 0;
                        return (
                          <div
                            key={`${oferta.id}-prod-${idx}`}
                            className="flex flex-col gap-0.5 rounded-md bg-gray-50 px-2 py-1 text-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate font-medium text-[#0f172a]">
                                {prod.icono} {prod.productoNombre}
                              </span>
                              <span className="shrink-0 text-gray-600">
                                {prod.cantidadOfrecida} {prod.unidad || 'unité'}{detallePeso}
                              </span>
                            </div>
                            {limiteMax > 0 && (
                              <div className="text-[10px] font-medium text-[#9C27B0]">
                                Max. par organisme : {limiteMax} {prod.unidad || 'unité'}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {oferta.productos.length > 3 && (
                        <Badge variant="outline" className="self-start text-xs">
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
              {(() => {
                const estadoOferta = calcularEstadoOferta(ofertaSeleccionada);
                const fechaExpiracion = new Date(ofertaSeleccionada.fechaExpiracion);
                const destinoOferta = resolverDestinoOferta(ofertaSeleccionada);
                const nombreOrganismoActual = organismoActual?.nombre?.trim().toLowerCase();
                const solicitudesOrganismo = (ofertaSeleccionada.solicitudes || [])
                  .filter(solicitud => {
                    if (organismoActual?.id && solicitud.organismoId === organismoActual.id) {
                      return true;
                    }

                    if (!nombreOrganismoActual) {
                      return false;
                    }

                    return solicitud.organismoNombre?.trim().toLowerCase() === nombreOrganismoActual;
                  })
                  .sort((left, right) => {
                    const leftDate = new Date(left.fechaActualizacion || left.fechaSolicitud).getTime();
                    const rightDate = new Date(right.fechaActualizacion || right.fechaSolicitud).getTime();
                    return rightDate - leftDate;
                  });
                const solicitudesFiltradas = filtroHistorial === 'todas'
                  ? solicitudesOrganismo
                  : solicitudesOrganismo.filter(solicitud => solicitud.estado === filtroHistorial);
                const categoriasAgrupadas = ofertaSeleccionada.productos.reduce<Array<{
                  categoria: string;
                  icono: string;
                  cantidadProductos: number;
                  disponibles: number;
                  reservados: number;
                  subcategorias: string[];
                }>>((groups, producto) => {
                  const existingGroup = groups.find(group => group.categoria === producto.categoria);
                  const reservados = producto.cantidadOfrecida - producto.cantidadDisponible;

                  if (existingGroup) {
                    existingGroup.cantidadProductos += 1;
                    existingGroup.disponibles += producto.cantidadDisponible;
                    existingGroup.reservados += reservados;
                    if (producto.subcategoria && !existingGroup.subcategorias.includes(producto.subcategoria)) {
                      existingGroup.subcategorias.push(producto.subcategoria);
                    }
                    return groups;
                  }

                  groups.push({
                    categoria: producto.categoria,
                    icono: producto.icono || '📦',
                    cantidadProductos: 1,
                    disponibles: producto.cantidadDisponible,
                    reservados,
                    subcategorias: producto.subcategoria ? [producto.subcategoria] : [],
                  });

                  return groups;
                }, []);
                const estadoSolicitudUi: Record<string, { label: string; className: string; dotColor: string }> = {
                  pendiente: { label: 'En attente', className: 'border-[#fcd34d] bg-[#fff7e8] text-[#b45309]', dotColor: '#f59e0b' },
                  aceptada: { label: 'Acceptée', className: 'border-[#bbf7d0] bg-[#ecfdf3] text-[#15803d]', dotColor: '#22c55e' },
                  en_preparacion: { label: 'En préparation', className: 'border-[#bae6fd] bg-[#ecfeff] text-[#0f766e]', dotColor: '#06b6d4' },
                  entregada: { label: 'Livrée', className: 'border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]', dotColor: '#2563eb' },
                  rechazada: { label: 'Refusée', className: 'border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]', dotColor: '#ef4444' },
                  anulada: { label: 'Annulée', className: 'border-[#d1d5db] bg-[#f3f4f6] text-[#4b5563]', dotColor: '#94a3b8' },
                };
                const filtrosHistorial: Array<{ value: 'todas' | EstadoSolicitud; label: string; count: number }> = [
                  { value: 'todas', label: 'Toutes', count: solicitudesOrganismo.length },
                  { value: 'pendiente', label: 'En attente', count: solicitudesOrganismo.filter(solicitud => solicitud.estado === 'pendiente').length },
                  { value: 'aceptada', label: 'Acceptées', count: solicitudesOrganismo.filter(solicitud => solicitud.estado === 'aceptada').length },
                  { value: 'en_preparacion', label: 'En préparation', count: solicitudesOrganismo.filter(solicitud => solicitud.estado === 'en_preparacion').length },
                  { value: 'entregada', label: 'Livrées', count: solicitudesOrganismo.filter(solicitud => solicitud.estado === 'entregada').length },
                  { value: 'rechazada', label: 'Refusées', count: solicitudesOrganismo.filter(solicitud => solicitud.estado === 'rechazada').length },
                  { value: 'anulada', label: 'Annulées', count: solicitudesOrganismo.filter(solicitud => solicitud.estado === 'anulada').length },
                ];

                return (
                  <>
                    <div className="rounded-2xl border border-white/80 bg-gradient-to-br from-[#f8fbff] via-white to-[#eef6ff] p-5 shadow-[0_18px_40px_-32px_rgba(15,45,71,0.24)]">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Tag className="h-5 w-5 text-[#FFC107]" />
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#64748b]">
                              {ofertaSeleccionada.numeroOferta}
                            </p>
                          </div>
                          <h3 className="text-xl font-bold text-[#0f172a]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {ofertaSeleccionada.titulo}
                          </h3>
                          <p className="max-w-2xl text-sm text-[#475569]">
                            {ofertaSeleccionada.descripcion || 'Aucune description supplémentaire pour cette offre.'}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2 lg:justify-end">
                          <Badge className="border border-transparent px-3 py-1 text-xs font-semibold" style={{ backgroundColor: `${estadoOferta.color}22`, color: estadoOferta.color }}>
                            {estadoOferta.label}
                          </Badge>
                          <Badge variant="outline" className="border-[#dbe4ee] bg-white px-3 py-1 text-xs text-[#475569]">
                            Créée par {ofertaSeleccionada.creadoPor}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                        <div className="rounded-xl bg-white/80 p-3 shadow-sm">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[#64748b]">Produits</p>
                          <p className="mt-1 text-lg font-bold text-[#0f172a]">{ofertaSeleccionada.totalProductos}</p>
                        </div>
                        <div className="rounded-xl bg-white/80 p-3 shadow-sm">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[#64748b]">Poids</p>
                          <p className="mt-1 text-lg font-bold text-[#0f172a]">{formatQuantity(ofertaSeleccionada.totalKilos)} kg</p>
                        </div>
                        <div className="rounded-xl bg-white/80 p-3 shadow-sm">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[#64748b]">Valeur</p>
                          <p className="mt-1 text-lg font-bold text-[#0f172a]">CAD$ {formatMoney(ofertaSeleccionada.valorMonetarioTotal)}</p>
                        </div>
                        <div className="rounded-xl bg-white/80 p-3 shadow-sm">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-[#64748b]">Expire le</p>
                          <p className="mt-1 text-sm font-bold text-[#0f172a]">
                            {fechaExpiracion.toLocaleDateString('fr-CA', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.7fr)]">
                      <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-[0_16px_36px_-30px_rgba(15,45,71,0.2)]">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <h4 className="text-base font-bold text-[#0f172a]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Produits inclus
                          </h4>
                          <span className="text-xs text-[#64748b]">{ofertaSeleccionada.productos.length} lignes</span>
                        </div>

                        <div className="space-y-3">
                          {ofertaSeleccionada.productos.map((producto, index) => {
                            const cantidadReservada = producto.cantidadOfrecida - producto.cantidadDisponible;
                            const porcentajeDisponible = producto.cantidadOfrecida > 0
                              ? Math.round((producto.cantidadDisponible / producto.cantidadOfrecida) * 100)
                              : 0;
                            const productoCatalogo = productosCatalogoPorId.get(producto.productoId);
                            const miniaturaProducto = productoCatalogo?.photoUrl;

                            return (
                              <div key={`${ofertaSeleccionada.id}-detail-${producto.productoId}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white bg-white shadow-sm">
                                        {miniaturaProducto ? (
                                          <img
                                            src={miniaturaProducto}
                                            alt={producto.productoNombre}
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <span className="text-2xl">{productoCatalogo?.icono || producto.icono || '📦'}</span>
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-[#0f172a]">{producto.productoNombre}</p>
                                        <p className="text-xs text-[#64748b]">
                                          {producto.productoCodigo} • {producto.categoria}
                                          {producto.subcategoria ? ` • ${producto.subcategoria}` : ''}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="shrink-0 border-[#dbe4ee] bg-white text-[#475569]">
                                    {producto.unidad}
                                  </Badge>
                                </div>

                                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                                  <div className="rounded-lg bg-white px-2 py-2">
                                    <p className="text-[10px] uppercase tracking-wide text-[#64748b]">Offert</p>
                                    <p className="mt-0.5 text-sm font-bold text-[#0f172a]">{producto.cantidadOfrecida}</p>
                                  </div>
                                  <div className="rounded-lg bg-white px-2 py-2">
                                    <p className="text-[10px] uppercase tracking-wide text-[#64748b]">Disponible</p>
                                    <p className="mt-0.5 text-sm font-bold text-[#2E7D32]">{producto.cantidadDisponible}</p>
                                  </div>
                                  <div className="rounded-lg bg-white px-2 py-2">
                                    <p className="text-[10px] uppercase tracking-wide text-[#64748b]">Réservé</p>
                                    <p className="mt-0.5 text-sm font-bold text-[#B45309]">{cantidadReservada}</p>
                                  </div>
                                </div>

                                <div className="mt-3">
                                  <div className="mb-1 flex items-center justify-between text-xs text-[#64748b]">
                                    <span>Disponibilité</span>
                                    <span>{porcentajeDisponible}%</span>
                                  </div>
                                  <div className="h-2 w-full rounded-full bg-slate-200">
                                    <div
                                      className="h-2 rounded-full transition-all"
                                      style={{
                                        width: `${porcentajeDisponible}%`,
                                        backgroundColor: porcentajeDisponible > 50 ? '#4CAF50' : porcentajeDisponible > 20 ? '#FFC107' : '#DC3545',
                                      }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-[0_16px_36px_-30px_rgba(15,45,71,0.2)]">
                          <h4 className="text-base font-bold text-[#0f172a]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Informations utiles
                          </h4>
                          <div className="mt-3 space-y-3 text-sm text-[#475569]">
                            <div className="flex items-start gap-2">
                              <Building2 className="mt-0.5 h-4 w-4 text-[#1E73BE]" />
                              <div>
                                <p className="font-semibold text-[#0f172a]">
                                  {destinoOferta.mode === 'individual' ? 'Organisme ciblé' : 'Diffusion'}
                                </p>
                                <p>{destinoOferta.title}</p>
                                {destinoOferta.mode !== 'individual' && (
                                  <p className="mt-1 text-xs text-[#64748b]">{destinoOferta.subtitle}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Calendar className="mt-0.5 h-4 w-4 text-[#1E73BE]" />
                              <div>
                                <p className="font-semibold text-[#0f172a]">Date limite</p>
                                <p>
                                  {fechaExpiracion.toLocaleDateString('fr-CA', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <AlertCircle className="mt-0.5 h-4 w-4 text-[#1E73BE]" />
                              <div>
                                <p className="font-semibold text-[#0f172a]">Disponibilité</p>
                                <p>
                                  {ofertaSeleccionada.productos.some(producto => producto.cantidadDisponible > 0)
                                    ? 'Des quantités sont encore disponibles pour demande.'
                                    : 'Cette offre n’a plus de quantités disponibles.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-[0_16px_36px_-30px_rgba(15,45,71,0.2)]">
                          <h4 className="text-base font-bold text-[#0f172a]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Catégories représentées
                          </h4>
                          <div className="mt-3 space-y-2">
                            {categoriasAgrupadas.map(categorie => (
                              <div key={`${ofertaSeleccionada.id}-${categorie.categoria}`} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                                <div className="flex items-start gap-2.5">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-sm">
                                    {categorie.icono}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-[#0f172a]">{categorie.categoria}</p>
                                    <p className="mt-0.5 text-xs text-[#64748b]">
                                      {categorie.cantidadProductos} produits • {categorie.disponibles} disponibles • {categorie.reservados} réservés
                                    </p>
                                    {categorie.subcategorias.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {categorie.subcategorias.slice(0, 3).map(subcategorie => (
                                          <Badge key={`${categorie.categoria}-${subcategorie}`} variant="outline" className="border-[#dbe4ee] bg-white text-[10px] text-[#475569]">
                                            {subcategorie}
                                          </Badge>
                                        ))}
                                        {categorie.subcategorias.length > 3 && (
                                          <Badge variant="outline" className="border-[#dbe4ee] bg-white text-[10px] text-[#475569]">
                                            +{categorie.subcategorias.length - 3}
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {calcularEstadoOferta(ofertaSeleccionada).estado === 'activa' && (
                          <Button
                            className="w-full bg-[#4CAF50] hover:bg-[#45A049]"
                            onClick={() => {
                              setDialogDetalleOpen(false);
                              aceptarOferta(ofertaSeleccionada);
                            }}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {t('offers.acceptOffer')}
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-[0_16px_36px_-30px_rgba(15,45,71,0.2)]">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div>
                          <h4 className="text-base font-bold text-[#0f172a]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Historique de vos demandes
                          </h4>
                          <p className="mt-1 text-xs text-[#64748b]">
                            {solicitudesFiltradas.length} résultat{solicitudesFiltradas.length > 1 ? 's' : ''} sur {solicitudesOrganismo.length}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#64748b]">
                          <Filter className="h-4 w-4 text-[#1E73BE]" />
                          Filtrer
                        </div>
                      </div>

                      {solicitudesOrganismo.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-[#64748b]">
                          Aucune demande n'a encore été enregistrée pour cette offre avec votre organisme.
                        </div>
                      ) : (
                        <>
                          <div className="mb-4 flex flex-wrap gap-2">
                            {filtrosHistorial.map(filtroItem => (
                              <button
                                key={`history-filter-${filtroItem.value}`}
                                type="button"
                                onClick={() => setFiltroHistorial(filtroItem.value)}
                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                  filtroHistorial === filtroItem.value
                                    ? 'border-[#1E73BE] bg-[#E3F2FD] text-[#1E73BE]'
                                    : 'border-slate-200 bg-white text-[#64748b] hover:border-[#cfe0f7] hover:text-[#1E73BE]'
                                }`}
                              >
                                {filtroItem.label} ({filtroItem.count})
                              </button>
                            ))}
                          </div>

                          {solicitudesFiltradas.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-[#64748b]">
                              Aucun historique ne correspond au filtre sélectionné.
                            </div>
                          ) : (
                        <div className="relative pl-6">
                          <div className="absolute bottom-2 left-[11px] top-2 w-px bg-gradient-to-b from-[#bfdbfe] via-[#dbeafe] to-transparent" />
                          <div className="space-y-4">
                          {solicitudesFiltradas.map(solicitud => {
                            const totalItems = solicitud.productosAceptados.reduce((sum, producto) => sum + producto.cantidadAceptada, 0);
                            const estadoUi = estadoSolicitudUi[solicitud.estado] || estadoSolicitudUi.pendiente;
                            const fechaTimeline = solicitud.fechaActualizacion || solicitud.fechaSolicitud;
                            const produitsCompatibilite = solicitud.productosAceptados.map(productoAceptado => {
                              const productoOferta = ofertaSeleccionada.productos.find(producto => producto.productoId === productoAceptado.productoId);
                              const cantidadDisponibleActual = productoOferta?.cantidadDisponible || 0;

                              return {
                                productoAceptado,
                                productoOferta,
                                cantidadDisponibleActual,
                                requiereAjuste: cantidadDisponibleActual < productoAceptado.cantidadAceptada,
                                sinDisponibilidad: cantidadDisponibleActual <= 0,
                              };
                            });
                            const produitsReutilisables = produitsCompatibilite.filter(item => item.cantidadDisponibleActual > 0);
                            const lignesAjustees = produitsCompatibilite.filter(item => item.requiereAjuste);
                            const lignesIndisponibles = produitsCompatibilite.filter(item => item.sinDisponibilidad);
                            const esRepetibleCompleta = lignesAjustees.length === 0;
                            const peutReprendreSelection = estadoOferta.estado === 'activa' && produitsReutilisables.length > 0;

                            return (
                              <div key={`${ofertaSeleccionada.id}-history-${solicitud.id}`} className="relative">
                                <span
                                  className="absolute -left-[23px] top-5 h-4 w-4 rounded-full border-[3px] border-white shadow-sm"
                                  style={{ backgroundColor: estadoUi.dotColor }}
                                />
                              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-[0_10px_24px_-24px_rgba(15,23,42,0.45)]">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="rounded-full bg-[#e0f2fe] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0369a1]">
                                        Étape dossier
                                      </span>
                                      <p className="text-sm font-bold text-[#0f172a]">Activité du {new Date(fechaTimeline).toLocaleDateString('fr-CA', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                      })}</p>
                                      <Badge className={`border ${estadoUi.className}`}>
                                        {estadoUi.label}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className={esRepetibleCompleta
                                          ? 'border-[#bbf7d0] bg-[#ecfdf3] text-[#15803d]'
                                          : 'border-[#fde68a] bg-[#fff7e8] text-[#b45309]'}
                                      >
                                        {esRepetibleCompleta
                                          ? 'Stock actuel suffisant'
                                          : `${lignesAjustees.length} ajustement${lignesAjustees.length > 1 ? 's' : ''} requis`}
                                      </Badge>
                                    </div>
                                    <p className="mt-1 text-xs text-[#64748b]">
                                      Demande initiale: {new Date(solicitud.fechaSolicitud).toLocaleDateString('fr-CA', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                      })} • {solicitud.productosAceptados.length} produits • quantité totale: {totalItems}
                                    </p>
                                    {solicitud.preparadoPor && (solicitud.estado === 'en_preparacion' || solicitud.estado === 'entregada') && (
                                      <p className="mt-1 text-xs font-medium text-[#0f766e]">
                                        Préparée par : {solicitud.preparadoPor}
                                      </p>
                                    )}
                                  </div>
                                  {solicitud.fechaActualizacion && (
                                    <p className="text-xs text-[#64748b]">
                                      Mise à jour: {new Date(solicitud.fechaActualizacion).toLocaleDateString('fr-CA', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                      })}
                                    </p>
                                  )}
                                </div>

                                <div className="mt-3 flex flex-wrap gap-1.5">
                                  {produitsCompatibilite.map(({ productoAceptado, productoOferta, cantidadDisponibleActual, requiereAjuste, sinDisponibilidad }) => {
                                    return (
                                      <Badge
                                        key={`${solicitud.id}-${productoAceptado.productoId}`}
                                        variant="outline"
                                        className={sinDisponibilidad
                                          ? 'border-[#fecaca] bg-[#fef2f2] text-xs text-[#b91c1c]'
                                          : requiereAjuste
                                            ? 'border-[#fde68a] bg-[#fff7e8] text-xs text-[#b45309]'
                                            : 'border-[#dbe4ee] bg-white text-xs text-[#334155]'}
                                      >
                                        {productoOferta?.icono || '📦'} {productoOferta?.productoNombre || productoAceptado.productoId} × {productoAceptado.cantidadAceptada}
                                        {' '}
                                        <span className="opacity-80">
                                          • stock actuel {cantidadDisponibleActual}/{productoAceptado.cantidadAceptada}
                                        </span>
                                      </Badge>
                                    );
                                  })}
                                </div>

                                {solicitud.observaciones && (
                                  <div className="mt-3 rounded-lg border border-[#f1f5f9] bg-white px-3 py-2 text-xs text-[#475569]">
                                    {solicitud.observaciones}
                                  </div>
                                )}

                                {solicitud.motivoRechazo && (
                                  <div className="mt-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[#991b1b]">
                                    Motif du refus: {solicitud.motivoRechazo}
                                  </div>
                                )}

                                {!esRepetibleCompleta && (
                                  <div className="mt-3 rounded-lg border border-[#fde68a] bg-[#fff7e8] px-3 py-2 text-xs text-[#92400E]">
                                    Cette demande n’est plus totalement reproductible avec le stock actuel.
                                    {lignesIndisponibles.length > 0 ? ` ${lignesIndisponibles.length} ligne${lignesIndisponibles.length > 1 ? 's sont' : ' est'} désormais indisponible${lignesIndisponibles.length > 1 ? 's' : ''}.` : ''}
                                    {lignesAjustees.length > lignesIndisponibles.length ? ` ${lignesAjustees.length - lignesIndisponibles.length} ligne${lignesAjustees.length - lignesIndisponibles.length > 1 ? 's devront être réduites' : ' devra être réduite'}.` : ''}
                                  </div>
                                )}

                                {estadoOferta.estado === 'activa' && (
                                  <div className="mt-3 flex justify-end">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className={peutReprendreSelection
                                        ? 'border-[#cfe0f7] bg-white text-[#1E73BE] hover:bg-[#eef6ff]'
                                        : 'border-slate-200 bg-slate-100 text-slate-400 hover:bg-slate-100'}
                                      disabled={!peutReprendreSelection}
                                      onClick={() => {
                                        if (!peutReprendreSelection) {
                                          return;
                                        }
                                        setDialogDetalleOpen(false);
                                        aceptarOferta(ofertaSeleccionada, solicitud);
                                      }}
                                    >
                                      <ShoppingCart className="mr-2 h-4 w-4" />
                                      {peutReprendreSelection ? 'Reprendre cette sélection' : 'Aucune ligne disponible'}
                                      {peutReprendreSelection && lignesAjustees.length > 0 ? ` (${lignesAjustees.length} ajustement${lignesAjustees.length > 1 ? 's' : ''})` : ''}
                                    </Button>
                                  </div>
                                )}
                              </div>
                              </div>
                            );
                          })}
                          </div>
                        </div>
                          )}
                        </>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Aceptar Oferta */}
      {ofertaSeleccionada && (
        <DialogAceptarOferta
          open={dialogAceptarOpen}
          onOpenChange={(open) => {
            setDialogAceptarOpen(open);
            if (!open) {
              setSolicitudReutilizada(null);
            }
          }}
          ofertaId={ofertaSeleccionada.id}
          organismoId={organismoActual?.id || ''}
          organismoNombre={organismoActual?.nombre || 'Organisme'}
          initialProductosAceptados={solicitudReutilizada?.productosAceptados}
          initialObservaciones={solicitudReutilizada?.observaciones}
          onOfertaAceptada={() => {
            cargarDatos();
            setSolicitudReutilizada(null);
            setDialogAceptarOpen(false);
          }}
        />
      )}
    </div>
  );
}