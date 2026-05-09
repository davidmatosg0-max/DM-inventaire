import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { GestionVehiculos } from '../transporte/GestionVehiculos';
import { PlanificacionRutas } from '../transporte/PlanificacionRutas';
import { VerificacionVehiculo } from '../transporte/VerificacionVehiculo';
import { GestionChoferes } from '../transporte/GestionChoferes';
import { useBranding } from '../../../hooks/useBranding';
import { useCompactViewport } from '../../../hooks/useCompactViewport';
import { obtenerEstadisticasTransporte, TRANSPORTE_MODULE_EVENT } from '../../utils/transporteLogic';
import { ModulePageHeader, ModuleStatCard, ModuleStatsGrid } from '../shared/ModulePageHeader';
import { ModuleControlSurface, ModuleControlSurfaceBody, ModuleControlSurfaceTabs } from '../shared/ModuleControlSurface';

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
    <div className="min-h-[calc(100vh-56px)] space-y-3 sm:space-y-4" style={transportViewportZoom < 1 ? { zoom: transportViewportZoom } : undefined}>
      <ModulePageHeader
        title={t('transport.title')}
        subtitle={t('transport.subtitle')}
        icon={<Truck className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
        accentColor={branding.primaryColor}
        secondaryColor={branding.secondaryColor}
      />

      <ModuleStatsGrid
        compact={isCompactTransportViewport}
        compactLayout="grid grid-cols-4 gap-2"
        defaultLayout="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <ModuleStatCard
          label={t('transport.pending')}
          value={resumen.rutasPlanificadas}
          icon={<Clock className="h-4 w-4 text-white" />}
          accentColor="#FFC107"
          valueColor="#FFC107"
        />
        <ModuleStatCard
          label={t('transport.onRoute')}
          value={resumen.rutasEnCurso}
          icon={<Truck className="h-4 w-4 text-white" />}
          accentColor={branding.primaryColor}
        />
        <ModuleStatCard
          label={t('transport.delivered')}
          value={resumen.rutasCompletadas}
          icon={<CheckCircle className="h-4 w-4 text-white" />}
          accentColor={branding.secondaryColor}
        />
        <ModuleStatCard
          label={t('transport.totalVehicles')}
          value={resumen.totalVehiculos}
          icon={<Truck className="h-4 w-4 text-white" />}
          accentColor="#333333"
          valueColor="#333333"
        />
      </ModuleStatsGrid>

      <Tabs value={activeTransportTab} onValueChange={setActiveTransportTab} className="overflow-visible">
        <ModuleControlSurface>
          <ModuleControlSurfaceTabs>
            <TabsList className="app-compact-tabs-grid w-full max-w-4xl gap-1 bg-transparent p-0" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
              <TabsTrigger value="rutas" className="app-compact-tab-trigger min-h-8 px-2 py-1.5 text-[11px]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                🗺️ {t('transport.routePlanning')}
              </TabsTrigger>
              <TabsTrigger value="vehiculos" className="app-compact-tab-trigger min-h-8 px-2 py-1.5 text-[11px]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                🚛 {t('transport.vehicleManagement')}
              </TabsTrigger>
              <TabsTrigger value="choferes" className="app-compact-tab-trigger min-h-8 px-2 py-1.5 text-[11px]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                👨‍✈️ {t('transport.drivers')}
              </TabsTrigger>
              <TabsTrigger value="verificacion" className="app-compact-tab-trigger min-h-8 px-2 py-1.5 text-[11px]" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                🔍 {t('transport.saaqVerification.title')}
              </TabsTrigger>
            </TabsList>
          </ModuleControlSurfaceTabs>

          <ModuleControlSurfaceBody>
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
          </ModuleControlSurfaceBody>
        </ModuleControlSurface>
      </Tabs>
    </div>
  );
}