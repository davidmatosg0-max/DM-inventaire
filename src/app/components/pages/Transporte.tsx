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
import { obtenerEstadisticasTransporte, TRANSPORTE_MODULE_EVENT } from '../../utils/transporteLogic';

export function Transporte() {
  const { t } = useTranslation();
  const branding = useBranding();
  const [resumen, setResumen] = React.useState(() => obtenerEstadisticasTransporte());

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
    <div className="min-h-screen relative">
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
      <div className="relative z-10 p-6 space-y-6">
        {/* Header con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl p-6 border border-white/60">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)` }}
            >
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '2rem', color: branding.primaryColor }}>
                  {t('transport.title')}
                </h1>
                <Sparkles className="w-5 h-5 animate-pulse" style={{ color: branding.secondaryColor }} />
              </div>
              <p className="text-[#666666]">{t('transport.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 border-l-4 border-l-[#FFC107] transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{t('transport.pending')}</p>
                <p className="text-2xl font-bold text-[#FFC107]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {resumen.rutasPlanificadas}
                </p>
              </div>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #FFC107 0%, #FFB300 100%)' }}
              >
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 border-l-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer" style={{ borderLeftColor: branding.primaryColor }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{t('transport.onRoute')}</p>
                <p className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.primaryColor }}>
                  {resumen.rutasEnCurso}
                </p>
              </div>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)` }}
              >
                <Truck className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 border-l-4 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer" style={{ borderLeftColor: branding.secondaryColor }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{t('transport.delivered')}</p>
                <p className="text-2xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: branding.secondaryColor }}>
                  {resumen.rutasCompletadas}
                </p>
              </div>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: `linear-gradient(135deg, ${branding.secondaryColor} 0%, ${branding.secondaryColor}dd 100%)` }}
              >
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>

          <div className="backdrop-blur-xl bg-white/90 rounded-xl shadow-lg p-4 border-l-4 border-l-[#333333] transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[#666666] mb-1" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>{t('transport.totalVehicles')}</p>
                <p className="text-2xl font-bold text-[#333333]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {resumen.totalVehiculos}
                </p>
              </div>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, #333333 0%, #555555 100%)' }}
              >
                <Truck className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/90 rounded-2xl shadow-xl border border-white/60">
          <Tabs defaultValue="rutas" className="p-6">
            <TabsList className="grid w-full max-w-4xl grid-cols-4">
              <TabsTrigger value="rutas" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                🗺️ {t('transport.routePlanning')}
              </TabsTrigger>
              <TabsTrigger value="vehiculos" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                🚛 {t('transport.vehicleManagement')}
              </TabsTrigger>
              <TabsTrigger value="choferes" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                👨‍✈️ {t('transport.drivers')}
              </TabsTrigger>
              <TabsTrigger value="verificacion" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 500 }}>
                🔍 {t('transport.saaqVerification.title')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rutas">
              <PlanificacionRutas />
            </TabsContent>

            <TabsContent value="vehiculos">
              <GestionVehiculos />
            </TabsContent>

            <TabsContent value="choferes">
              <GestionChoferes />
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