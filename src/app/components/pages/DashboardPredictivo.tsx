import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Brain,
  Target,
  Zap,
  Package,
  Calendar,
  Users,
  DollarSign,
  Leaf,
  BarChart3,
  ArrowRight,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useBranding } from '../../../hooks/useBranding';
import {
  predecirDemanda,
  predecirReabastecimiento,
  detectarDesperdicio,
  analizarTendencias,
  generarAlertasInteligentes,
  calcularImpacto,
  Prediccion,
  TendenciaProducto,
  AlertaInteligente
} from '../../utils/predictiveAnalytics';
import { formatLargeNumber } from '../../utils/formatUtils';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ModulePageHeader } from '../shared/ModulePageHeader';

export function DashboardPredictivo() {
  const branding = useBranding();
  const [prediccionesDemanda, setPrediccionesDemanda] = useState<Prediccion[]>([]);
  const [prediccionesReabastecimiento, setPrediccionesReabastecimiento] = useState<Prediccion[]>([]);
  const [riesgoDesperdicio, setRiesgoDesperdicio] = useState<Prediccion[]>([]);
  const [tendencias, setTendencias] = useState<TendenciaProducto[]>([]);
  const [alertas, setAlertas] = useState<AlertaInteligente[]>([]);
  const [impacto, setImpacto] = useState(calcularImpacto('mes'));
  const [periodoImpacto, setPeriodoImpacto] = useState<'mes' | 'trimestre' | 'año'>('mes');
  const etiquetasPeriodoImpacto: Record<'mes' | 'trimestre' | 'año', string> = {
    mes: 'Mois',
    trimestre: 'Trimestre',
    año: 'Année',
  };

  useEffect(() => {
    cargarAnalytics();
  }, []);

  useEffect(() => {
    setImpacto(calcularImpacto(periodoImpacto));
  }, [periodoImpacto]);

  const cargarAnalytics = () => {
    setPrediccionesDemanda(predecirDemanda());
    setPrediccionesReabastecimiento(predecirReabastecimiento());
    setRiesgoDesperdicio(detectarDesperdicio());
    setTendencias(analizarTendencias());
    setAlertas(generarAlertasInteligentes());
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'danger': return '#F44336';
      case 'warning': return '#FF9800';
      case 'success': return '#4CAF50';
      default: return branding.primaryColor;
    }
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'ascendente': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'descendente': return <TrendingDown className="w-5 h-5 text-red-600" />;
      default: return <BarChart3 className="w-5 h-5 text-gray-600" />;
    }
  };

  // Datos para gráfico de tendencias
  const datosTendencias = tendencias.slice(0, 8).map((t, index) => ({
    id: `tendencia-${index}`,
    producto: t.producto.length > 15 ? t.producto.substring(0, 15) + '...' : t.producto,
    actual: t.demandaPromedio,
    prediccion: t.prediccionProximoMes,
  }));

  return (
    <div className="min-h-screen relative">
      {/* Fondo glassmorphism */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, ${branding.primaryColor}12 0%, ${branding.secondaryColor}08 100%)`
        }}
      >
        <div 
          className="absolute top-20 right-20 w-64 sm:w-96 h-64 sm:h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: branding.primaryColor }}
        />
        <div 
          className="absolute bottom-20 left-20 w-64 sm:w-96 h-64 sm:h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ backgroundColor: branding.secondaryColor }}
        />
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        {/* Header professionnel unifié */}
        <ModulePageHeader
          title="Tableau de bord prédictif IA"
          subtitle="Analytique avancée et intelligence des données"
          icon={<Brain className="h-6 w-6 text-white sm:h-7 sm:w-7" />}
          accentColor={branding.primaryColor}
          secondaryColor={branding.secondaryColor}
          actions={(
            <Button
              onClick={cargarAnalytics}
              className="h-10 rounded-2xl px-4 text-white"
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 500,
                background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`,
                boxShadow: `0 10px 24px -18px ${branding.primaryColor}`,
              }}
            >
              <Zap className="mr-2 h-4 w-4" />
              <span className="text-sm sm:text-base">Actualiser l'analyse</span>
            </Button>
          )}
        />

        {/* Alertas Inteligentes */}
        {alertas.length > 0 && (
          <Card className="backdrop-blur-lg bg-white/90 border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="w-5 h-5" />
                Alertes intelligentes ({alertas.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertas.slice(0, 3).map(alerta => (
                  <div
                    key={alerta.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      alerta.nivel === 'danger' 
                        ? 'bg-red-50 border-l-red-500' 
                        : 'bg-orange-50 border-l-orange-500'
                    }`}
                  >
                    <h4 className="font-bold text-sm mb-1">{alerta.titulo}</h4>
                    <p className="text-sm text-gray-700">{alerta.mensaje}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Impacto Social y Económico */}
        <Card className="backdrop-blur-lg bg-white/90">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Impact social et économique
              </CardTitle>
              <div className="flex gap-2">
                {(['mes', 'trimestre', 'año'] as const).map(p => (
                  <Button
                    key={p}
                    variant={periodoImpacto === p ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPeriodoImpacto(p)}
                    style={periodoImpacto === p ? { backgroundColor: branding.primaryColor } : {}}
                  >
                    {etiquetasPeriodoImpacto[p]}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="backdrop-blur-sm bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium text-green-700">Valeur monétaire</p>
                </div>
                <p className="text-2xl font-bold text-green-700">
                  CAD$ {formatLargeNumber(impacto.valorMonetario)}
                </p>
              </div>

              <div className="backdrop-blur-sm bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-medium text-blue-700">Personnes nourries</p>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {impacto.personasAlimentadas}
                </p>
              </div>

              <div className="backdrop-blur-sm bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-orange-600" />
                  <p className="text-sm font-medium text-orange-700">Kg distribués</p>
                </div>
                <p className="text-2xl font-bold text-orange-700">
                  {formatLargeNumber(impacto.kgDistribuidos)} kg
                </p>
              </div>

              <div className="backdrop-blur-sm bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Leaf className="w-5 h-5 text-teal-600" />
                  <p className="text-sm font-medium text-teal-700">CO₂ évité</p>
                </div>
                <p className="text-2xl font-bold text-teal-700">
                  {formatLargeNumber(impacto.co2Evitado)} kg
                </p>
              </div>

              <div className="backdrop-blur-sm bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <p className="text-sm font-medium text-purple-700">Commandes</p>
                </div>
                <p className="text-2xl font-bold text-purple-700">
                  {impacto.numeroComandas}
                </p>
              </div>

              <div className="backdrop-blur-sm bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-pink-600" />
                  <p className="text-sm font-medium text-pink-700">Organismes</p>
                </div>
                <p className="text-2xl font-bold text-pink-700">
                  {impacto.organismosBeneficiados}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Tendencias */}
        <Card className="backdrop-blur-lg bg-white/90">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Tendances de la demande - Top 8 produits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={datosTendencias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="producto" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar key="bar-actual" dataKey="actual" fill={branding.primaryColor} name="Demande actuelle" />
                <Bar key="bar-prediccion" dataKey="prediccion" fill={branding.secondaryColor} name="Prévision du mois prochain" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Grid de Predicciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Predicciones de Demanda */}
          <Card className="backdrop-blur-lg bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: branding.primaryColor }} />
                Prévision de la demande
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prediccionesDemanda.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Données insuffisantes pour générer des prévisions
                  </p>
                ) : (
                  prediccionesDemanda.slice(0, 5).map((pred, idx) => (
                    <div
                      key={idx}
                      className="p-4 border-l-4 rounded-lg bg-gray-50"
                      style={{ borderLeftColor: getNivelColor(pred.nivel) }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold">{pred.producto}</h4>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {pred.confianza}% de confiance
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{pred.mensaje}</p>
                      <div className="flex flex-wrap gap-1">
                        {pred.acciones.slice(0, 2).map((accion, i) => (
                          <span key={i} className="text-xs bg-white px-2 py-1 rounded border flex items-center gap-1">
                            <Lightbulb className="w-3 h-3" />
                            {accion}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Predicciones de Reabastecimiento */}
          <Card className="backdrop-blur-lg bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" style={{ color: branding.secondaryColor }} />
                Réapprovisionnement requis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prediccionesReabastecimiento.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
                    <p className="text-gray-700 font-medium">Stock optimal</p>
                    <p className="text-sm text-gray-500">Tous les produits ont un stock suffisant</p>
                  </div>
                ) : (
                  prediccionesReabastecimiento.slice(0, 5).map((pred, idx) => (
                    <div
                      key={idx}
                      className="p-4 border-l-4 rounded-lg bg-gray-50"
                      style={{ borderLeftColor: getNivelColor(pred.nivel) }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold">{pred.producto}</h4>
                        <span 
                          className="text-xs px-2 py-1 rounded font-bold"
                          style={{ 
                            backgroundColor: getNivelColor(pred.nivel) + '20',
                            color: getNivelColor(pred.nivel)
                          }}
                        >
                          {pred.valor} jours
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{pred.mensaje}</p>
                      <div className="flex flex-wrap gap-1">
                        {pred.acciones.slice(0, 2).map((accion, i) => (
                          <span key={i} className="text-xs bg-white px-2 py-1 rounded border flex items-center gap-1">
                            <ArrowRight className="w-3 h-3" />
                            {accion}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Riesgo de Desperdicio */}
          <Card className="backdrop-blur-lg bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Risque de gaspillage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {riesgoDesperdicio.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-2" />
                    <p className="text-gray-700 font-medium">Aucun risque détecté</p>
                    <p className="text-sm text-gray-500">Stock optimisé sans produits à risque</p>
                  </div>
                ) : (
                  riesgoDesperdicio.slice(0, 5).map((pred, idx) => (
                    <div
                      key={idx}
                      className="p-4 border-l-4 border-l-orange-500 rounded-lg bg-orange-50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-orange-900">{pred.producto}</h4>
                        <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded font-bold">
                          {pred.valor} unités
                        </span>
                      </div>
                      <p className="text-sm text-orange-800 mb-2">{pred.mensaje}</p>
                      <div className="flex flex-wrap gap-1">
                        {pred.acciones.slice(0, 2).map((accion, i) => (
                          <span key={i} className="text-xs bg-white px-2 py-1 rounded border border-orange-200 flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-orange-600" />
                            {accion}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Análisis de Tendencias */}
          <Card className="backdrop-blur-lg bg-white/90">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" style={{ color: branding.primaryColor }} />
                Analyse des tendances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tendencias.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Données historiques insuffisantes
                  </p>
                ) : (
                  tendencias.slice(0, 5).map((tend, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg bg-gray-50 border"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold flex items-center gap-2">
                          {getTendenciaIcon(tend.tendencia)}
                          {tend.producto}
                        </h4>
                        <span 
                          className={`text-xs px-2 py-1 rounded font-bold ${
                            tend.cambio > 0 
                              ? 'bg-green-100 text-green-700' 
                              : tend.cambio < 0
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {tend.cambio > 0 ? '+' : ''}{tend.cambio}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Demande actuelle</p>
                          <p className="font-semibold">{tend.demandaPromedio}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Prévision</p>
                          <p className="font-semibold">{tend.prediccionProximoMes}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}