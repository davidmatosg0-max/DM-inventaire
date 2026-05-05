import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, MapPin, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { GestionVehiculos } from '../transporte/GestionVehiculos';
import { PlanificacionRutas } from '../transporte/PlanificacionRutas';
import { VerificacionVehiculo } from '../transporte/VerificacionVehiculo';
import { GestionChoferes } from '../transporte/GestionChoferes';
import { useBranding } from '../../../hooks/useBranding';
import { useCompactViewport } from '../../../hooks/useCompactViewport';
import { obtenerEstadisticasTransporte, TRANSPORTE_MODULE_EVENT } from '../../utils/transporteLogic';

export function Transporte() {
  const { t } = useTranslation();
  const branding = useBranding();
  const [activeTransportTab, setActiveTransportTab] = React.useState('rutas');
  const {
    isCompactViewport: isCompactTransportViewport,
    viewportZoom: transportViewportZoom,
  } = useCompactViewport({
    deps: [activeTransportTab],
    resolveZoom: ({ height, isCompact }) => {
      const compactRouteOverview = isCompact && activeTransportTab === 'rutas';
      const compactSupportOverview = isCompact && (activeTransportTab === 'vehiculos' || activeTransportTab === 'verificacion');

      if (height < 600) {
        if (compactRouteOverview) {
          return 0.62;
        }

        if (compactSupportOverview) {
          return 0.44;
        }

        if (isCompact && activeTransportTab === 'choferes') {
          return 0.5;
        }

        return 0.36;
      }

      if (height < 700) {
        if (compactRouteOverview) {
          return 0.76;
        }

        if (compactSupportOverview) {
          return 0.56;
        }

        if (isCompact && activeTransportTab === 'choferes') {
          return 0.64;
        }

        return 0.5;
      }

      if (isCompact) {
        if (compactRouteOverview) {
          return 0.88;
        }

        if (compactSupportOverview) {
          return 0.8;
        }

        if (activeTransportTab === 'choferes') {
          return 0.82;
        }

        return 0.76;
      }

      return 1;
    },
  });
  const [resumen, setResumen] = React.useState(() => obtenerEstadisticasTransporte());
  const showCompactRouteOverview = isCompactTransportViewport && activeTransportTab === 'rutas';

  React.useEffect(() => {
    const refrescarResumen = () => {
      setResumen(obtenerEstadisticasTransporte());
    };

    window.addEventListener(TRANSPORTE_MODULE_EVENT, refrescarResumen);
    window.addEventListener('storage', refrescarResumen);

    return () => {
      window.removeEventListener(TRANSPORTE_MODULE_EVENT, refrescarResumen);
      window.removeEventListener('storage', refrescarResumen);
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-56px)] relative" style={transportViewportZoom < 1 ? { zoom: transportViewportZoom } : undefined}>
      {/* Fondo degradado fijo con glassmorphism */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 50%, ${branding.primaryColor}08 100%)`
        }}
      />
      
      {/* Formas decorativas animadas */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: `radial-gradient(circle, ${branding.secondaryColor} 0%, transparent 70%)` }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ 
            background: `radial-gradient(circle, ${branding.primaryColor} 0%, transparent 70%)`,
            animationDelay: '1s'
          }}
        />
      </div>

      {/* Contenedor principal con glassmorphism */}
      <div className="relative z-10 p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Header con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-3 sm:p-4 border border-white/60">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)` }}
            >
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1.5rem', color: branding.primaryColor }}>
                  {t('transport.title')}
                </h1>
                <Sparkles className="w-4 h-4 animate-pulse" style={{ color: branding.secondaryColor }} />
              </div>
              <p className="text-xs text-[#666666]">{t('transport.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={`${isCompactTransportViewport ? 'grid grid-cols-4 gap-2' : 'grid grid-cols-1 md:grid-cols-4 gap-4'}`}>
          <div className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-3 border-l-4 border-l-[#FFC107] transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-[#666666] mb-0.5" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{t('transport.pending')}</p>
                <p className="text-lg font-bold text-[#FFC107]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {resumen.rutasPlanificadas}
                </p>
              </div>
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)' }}
              >
                <Clock className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-3 border-l-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer" style={{ borderLeftColor: branding.primaryColor }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-[#666666] mb-0.5" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{t('transport.onRoute')}</p>
                <p className="text-lg font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                  {resumen.rutasEnCurso}
                </p>
              </div>
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)` }}
              >
                <Truck className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-3 border-l-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer" style={{ borderLeftColor: branding.secondaryColor }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-[#666666] mb-0.5" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{t('transport.delivered')}</p>
                <p className="text-lg font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.secondaryColor }}>
                  {resumen.rutasCompletadas}
                </p>
              </div>
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)` }}
              >
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-3 border-l-4 border-l-[#333333] transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-[#666666] mb-0.5" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{t('transport.totalVehicles')}</p>
                <p className="text-lg font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {resumen.totalVehiculos}
                </p>
              </div>
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #333333 0%, #555555 100%)' }}
              >
                <Truck className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl border border-white/60">
          <Tabs value={activeTransportTab} onValueChange={setActiveTransportTab} className="p-3 sm:p-4">
            <TabsList className="grid w-full max-w-4xl grid-cols-4 gap-1">
              <TabsTrigger value="rutas" className="min-h-8 px-2 py-1.5 text-[11px]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                🗺️ {t('transport.routePlanning')}
              </TabsTrigger>
              <TabsTrigger value="vehiculos" className="min-h-8 px-2 py-1.5 text-[11px]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                🚛 {t('transport.vehicleManagement')}
              </TabsTrigger>
              <TabsTrigger value="choferes" className="min-h-8 px-2 py-1.5 text-[11px]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                👨‍✈️ {t('transport.drivers')}
              </TabsTrigger>
              <TabsTrigger value="verificacion" className="min-h-8 px-2 py-1.5 text-[11px]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                🔍 {t('transport.saaqVerification.title')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rutas">
              {showCompactRouteOverview ? (
                <div className="space-y-3 pt-3">
                  <Card className="border-white/60 bg-white/80 shadow-lg backdrop-blur-xl">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2
                            className="text-base font-semibold"
                            style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}
                          >
                            Planification allégée des itinéraires
                          </h2>
                          <p className="text-xs text-[#666666]">
                            Vue synthétique pensée pour les petits écrans, avec les indicateurs clés visibles d’un coup d’oeil.
                          </p>
                        </div>
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
                          style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)` }}
                        >
                          <MapPin className="h-5 w-5 text-white" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-[#fde68a] bg-[#fff8db] p-3">
                          <p className="text-[11px] font-medium text-[#92400e]">Itinéraires à lancer</p>
                          <p className="mt-1 text-lg font-bold text-[#b45309]">{resumen.rutasPlanificadas}</p>
                        </div>
                        <div className="rounded-xl border p-3" style={{ borderColor: `${branding.primaryColor}40`, background: `${branding.primaryColor}12` }}>
                          <p className="text-[11px] font-medium" style={{ color: branding.primaryColor }}>Itinéraires en cours</p>
                          <p className="mt-1 text-lg font-bold" style={{ color: branding.primaryColor }}>{resumen.rutasEnCurso}</p>
                        </div>
                        <div className="rounded-xl border p-3" style={{ borderColor: `${branding.secondaryColor}40`, background: `${branding.secondaryColor}12` }}>
                          <p className="text-[11px] font-medium" style={{ color: branding.secondaryColor }}>Livraisons terminées</p>
                          <p className="mt-1 text-lg font-bold" style={{ color: branding.secondaryColor }}>{resumen.rutasCompletadas}</p>
                        </div>
                        <div className="rounded-xl border border-[#d1d5db] bg-[#f8fafc] p-3">
                          <p className="text-[11px] font-medium text-[#475569]">Véhicules disponibles</p>
                          <p className="mt-1 text-lg font-bold text-[#111827]">{resumen.totalVehiculos}</p>
                        </div>
                      </div>

                      <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-3">
                        <p className="text-xs font-medium text-[#334155]">Modules accessibles sans perdre le contexte</p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-[#475569]">
                          <div className="rounded-lg bg-white px-2.5 py-2 shadow-sm">Véhicules pour la flotte et la capacité</div>
                          <div className="rounded-lg bg-white px-2.5 py-2 shadow-sm">Conducteurs pour l’affectation des équipes</div>
                          <div className="rounded-lg bg-white px-2.5 py-2 shadow-sm">Vérification SAAQ pour la conformité</div>
                          <div className="rounded-lg bg-white px-2.5 py-2 shadow-sm">Itinéraires détaillés dès qu’un écran plus grand est disponible</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <PlanificacionRutas />
              )}
            </TabsContent>

            <TabsContent value="vehiculos">
              <GestionVehiculos />
            </TabsContent>

            <TabsContent value="choferes">
              <GestionChoferes compactMode={isCompactTransportViewport} />
            </TabsContent>

            <TabsContent value="verificacion">
              <VerificacionVehiculo />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}