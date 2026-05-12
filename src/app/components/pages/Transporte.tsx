import React from 'react';
import { useTranslation } from 'react-i18next';
import { Truck, MapPin, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { GestionVehiculos } from '../transporte/GestionVehiculos';
import { PlanificacionRutas } from '../transporte/PlanificacionRutas';
import { VerificacionVehiculo } from '../transporte/VerificacionVehiculo';
import { GestionChoferes } from '../transporte/GestionChoferes';
import { useBranding } from '../../../hooks/useBranding';
import { useCompactViewport } from '../../../hooks/useCompactViewport';
import { obtenerChoferes, obtenerEstadisticasTransporte, TRANSPORTE_MODULE_EVENT, TRANSPORTE_OPEN_CHOFER_DIALOG_EVENT, TRANSPORTE_OPEN_VEHICULO_DIALOG_EVENT } from '../../utils/transporteLogic';
import { ModulePageHeader, ModuleStatCard, ModuleStatsGrid } from '../shared/ModulePageHeader';
import { ModuleControlSurface, ModuleControlSurfaceBody, ModuleControlSurfaceTabs } from '../shared/ModuleControlSurface';
import { ModuleExecutiveStrip } from '../shared/ModuleExecutiveStrip';

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
  const totalChoferes = React.useMemo(() => obtenerChoferes().length, [resumen]);

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

  const transportTabLabels: Record<string, string> = {
    rutas: t('transport.executive.tabs.routes'),
    vehiculos: t('transport.executive.tabs.vehicles'),
    choferes: t('transport.executive.tabs.drivers'),
    verificacion: t('transport.executive.tabs.verification'),
  };

  const openTransportQuickAction = (tab: string, eventName?: string) => {
    setActiveTransportTab(tab);

    if (typeof window !== 'undefined' && eventName) {
      window.requestAnimationFrame(() => {
        window.dispatchEvent(new Event(eventName));
      });
    }
  };

  const transportExecutiveMetrics = [
    {
      id: 'active-view',
      label: t('transport.executive.metrics.activeView'),
      value: transportTabLabels[activeTransportTab] || t('transport.executive.tabs.routes'),
      helper: t('transport.executive.metrics.activeViewHelper'),
      icon: <MapPin className="h-4 w-4" />,
      accentColor: branding.primaryColor,
    },
    {
      id: 'planned-routes',
      label: t('transport.executive.metrics.toLaunch'),
      value: resumen.rutasPlanificadas,
      helper: t('transport.executive.metrics.toLaunchHelper'),
      icon: <Clock className="h-4 w-4" />,
      accentColor: '#f59e0b',
    },
    {
      id: 'fleet',
      label: t('transport.executive.metrics.fleet'),
      value: resumen.totalVehiculos,
      helper: t('transport.executive.metrics.fleetHelper'),
      icon: <Truck className="h-4 w-4" />,
      accentColor: branding.secondaryColor,
    },
    {
      id: 'drivers',
      label: t('transport.executive.metrics.drivers'),
      value: totalChoferes,
      helper: t('transport.executive.metrics.driversHelper'),
      icon: <CheckCircle className="h-4 w-4" />,
      accentColor: '#7c3aed',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-56px)] space-y-3 sm:space-y-4" style={transportViewportZoom < 1 ? { zoom: transportViewportZoom } : undefined}>
      <ModulePageHeader
        title={t('transport.title')}
        subtitle={t('transport.subtitle')}
        icon={<Truck className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
        accentColor={branding.primaryColor}
        secondaryColor={branding.secondaryColor}
      />

      <ModuleExecutiveStrip
        eyebrow={t('transport.executive.eyebrow')}
        title={t('transport.executive.title')}
        description={t('transport.executive.description')}
        accentColor={branding.primaryColor}
        secondaryColor={branding.secondaryColor}
        metrics={transportExecutiveMetrics}
        actions={(
          <>
            <Button variant="outline" onClick={() => setActiveTransportTab('rutas')} className="border-white/70 bg-white/82 text-[#16324f] hover:bg-white">
              <MapPin className="mr-2 h-4 w-4" />
              {t('transport.executive.actions.routes')}
            </Button>
            <Button variant="outline" onClick={() => openTransportQuickAction('vehiculos', TRANSPORTE_OPEN_VEHICULO_DIALOG_EVENT)} className="border-white/70 bg-white/82 text-[#16324f] hover:bg-white">
              <Truck className="mr-2 h-4 w-4" />
              {t('transport.executive.actions.newVehicle')}
            </Button>
            <Button variant="outline" onClick={() => openTransportQuickAction('choferes', TRANSPORTE_OPEN_CHOFER_DIALOG_EVENT)} className="border-white/70 bg-white/82 text-[#16324f] hover:bg-white">
              <CheckCircle className="mr-2 h-4 w-4" />
              {t('transport.executive.actions.newDriver')}
            </Button>
            <Button onClick={() => setActiveTransportTab('verificacion')} className="text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)` }}>
              <Clock className="mr-2 h-4 w-4" />
              {t('transport.executive.actions.verification')}
            </Button>
          </>
        )}
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
                  <Card className="overflow-hidden border-white/75 bg-white/90 shadow-[0_24px_56px_-40px_rgba(15,45,71,0.24)] backdrop-blur-xl">
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
                        <div className="rounded-[20px] border border-white/80 bg-[#fff8db]/92 p-3 shadow-[0_14px_28px_-24px_rgba(15,45,71,0.16)]">
                          <p className="text-[11px] font-medium text-[#92400e]">Itinéraires à lancer</p>
                          <p className="mt-1 text-lg font-bold text-[#b45309]">{resumen.rutasPlanificadas}</p>
                        </div>
                        <div className="rounded-[20px] border border-white/80 p-3 shadow-[0_14px_28px_-24px_rgba(15,45,71,0.16)]" style={{ borderColor: `${branding.primaryColor}40`, background: `${branding.primaryColor}12` }}>
                          <p className="text-[11px] font-medium" style={{ color: branding.primaryColor }}>Itinéraires en cours</p>
                          <p className="mt-1 text-lg font-bold" style={{ color: branding.primaryColor }}>{resumen.rutasEnCurso}</p>
                        </div>
                        <div className="rounded-[20px] border border-white/80 p-3 shadow-[0_14px_28px_-24px_rgba(15,45,71,0.16)]" style={{ borderColor: `${branding.secondaryColor}40`, background: `${branding.secondaryColor}12` }}>
                          <p className="text-[11px] font-medium" style={{ color: branding.secondaryColor }}>Livraisons terminées</p>
                          <p className="mt-1 text-lg font-bold" style={{ color: branding.secondaryColor }}>{resumen.rutasCompletadas}</p>
                        </div>
                        <div className="rounded-[20px] border border-white/80 bg-[#f8fafc]/92 p-3 shadow-[0_14px_28px_-24px_rgba(15,45,71,0.16)]">
                          <p className="text-[11px] font-medium text-[#475569]">Véhicules disponibles</p>
                          <p className="mt-1 text-lg font-bold text-[#111827]">{resumen.totalVehiculos}</p>
                        </div>
                      </div>

                      <div className="rounded-[20px] border border-dashed border-[#cbd5e1] bg-[#f8fafc]/92 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
                        <p className="text-xs font-medium text-[#334155]">Modules accessibles sans perdre le contexte</p>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-[#475569]">
                          <div className="rounded-[16px] bg-white/92 px-2.5 py-2 shadow-[0_10px_20px_-18px_rgba(15,45,71,0.18)]">Véhicules pour la flotte et la capacité</div>
                          <div className="rounded-[16px] bg-white/92 px-2.5 py-2 shadow-[0_10px_20px_-18px_rgba(15,45,71,0.18)]">Conducteurs pour l’affectation des équipes</div>
                          <div className="rounded-[16px] bg-white/92 px-2.5 py-2 shadow-[0_10px_20px_-18px_rgba(15,45,71,0.18)]">Vérification SAAQ pour la conformité</div>
                          <div className="rounded-[16px] bg-white/92 px-2.5 py-2 shadow-[0_10px_20px_-18px_rgba(15,45,71,0.18)]">Itinéraires détaillés dès qu’un écran plus grand est disponible</div>
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