/**
 * Gestión de Autenticación Híbrida - JWT + API Keys
 * Banque Alimentaire PRO v5.0
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Shield, 
  Key, 
  Users, 
  Activity, 
  Clock, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Database,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { JWTSessionInfo } from '../JWTSessionInfo';
import { useAuth } from '../../../contexts/AuthContext';
import { obtenerEstadisticasJWT } from '../../utils/jwtManager';
import { obtenerEstadisticasAPI } from '../../utils/apiKeyManager';

export function GestionAutenticacion() {
  const { t } = useTranslation();
  const { usuario, isAuthenticated } = useAuth();
  const [statsJWT, setStatsJWT] = useState(obtenerEstadisticasJWT());
  const [statsAPI, setStatsAPI] = useState(obtenerEstadisticasAPI());
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Actualizar estadísticas cada 30 segundos
    const interval = setInterval(() => {
      setStatsJWT(obtenerEstadisticasJWT());
      setStatsAPI(obtenerEstadisticasAPI());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-[#1a4d7a] rounded-xl shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 
              className="text-3xl font-bold text-gray-800"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Gestion d'Authentification
            </h1>
            <p className="text-gray-600">
              Système hybride JWT + API Keys
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Vue d'ensemble</span>
          </TabsTrigger>
          <TabsTrigger value="jwt" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">JWT Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="gap-2">
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">API Keys</span>
          </TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* JWT Active */}
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Session JWT Active</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-800">
                        {statsJWT.tokenActivo ? 'Active' : 'Inactive'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {statsJWT.usuario || 'Aucun utilisateur'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Temps restant */}
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Temps Restant JWT</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">
                      {Math.floor(statsJWT.tiempoRestante / 60)}m
                    </div>
                    <div className="text-sm text-gray-600">
                      {statsJWT.tiempoRestante}s au total
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* API Keys Total */}
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>API Keys Total</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Key className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">
                      {statsAPI.totalKeys}
                    </div>
                    <div className="text-sm text-gray-600">
                      {statsAPI.activeKeys} actives
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requêtes API */}
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Requêtes API Today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">
                      {statsAPI.requestsToday.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {statsAPI.totalRequests.toLocaleString()} au total
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información detallada */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Session JWT */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-[#1a4d7a]" />
                  Session JWT Actuelle
                </CardTitle>
                <CardDescription>
                  Information de votre session d'authentification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JWTSessionInfo />
              </CardContent>
            </Card>

            {/* Top API Consumers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#2d9561]" />
                  Top Consommateurs API
                </CardTitle>
                <CardDescription>
                  Les clés API les plus utilisées
                </CardDescription>
              </CardHeader>
              <CardContent>
                {statsAPI.topConsumers.length > 0 ? (
                  <div className="space-y-3">
                    {statsAPI.topConsumers.map((consumer, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 bg-[#2d9561] text-white rounded-full text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {consumer.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {consumer.requests.toLocaleString()} requêtes
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {((consumer.requests / statsAPI.totalRequests) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Key className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>Aucune activité API détectée</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Comparaison JWT vs API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#1a4d7a]" />
                JWT vs API Keys - Cas d'utilisation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* JWT */}
                <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">
                      JWT (Sessions)
                    </h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Utilisateurs humains</strong> - Login web/mobile</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Portal Organismos</strong> - Accès avec clave</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Sessions courtes</strong> - 15min + refresh 7j</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Auto-refresh</strong> - Renovación automática</span>
                    </li>
                  </ul>
                </div>

                {/* API Keys */}
                <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-600 rounded-lg">
                      <Key className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-800">
                      API Keys
                    </h3>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Intégrations</strong> - Máquina-a-máquina</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Email/SMS</strong> - Services externes (FASE 2)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Webhooks</strong> - Notificaciones automáticas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span><strong>Sin expiración</strong> - Claves permanentes</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* JWT Sessions */}
        <TabsContent value="jwt" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session JWT Active</CardTitle>
              <CardDescription>
                Gérez votre session d'authentification basée sur JWT
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JWTSessionInfo />
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-900">
                      À propos des tokens JWT
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• <strong>Access Token:</strong> Válido por 15 minutos</li>
                      <li>• <strong>Refresh Token:</strong> Válido por 7 días</li>
                      <li>• <strong>Auto-refresh:</strong> Se renueva automáticamente antes de expirar</li>
                      <li>• <strong>Seguridad:</strong> Firmados con secreto único del sistema</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys */}
        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des API Keys</CardTitle>
              <CardDescription>
                Pour accéder à la gestion complète des API Keys, visitez la page dédiée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800 mb-1">
                      {statsAPI.totalKeys}
                    </div>
                    <div className="text-sm text-gray-600">Total Keys</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {statsAPI.activeKeys}
                    </div>
                    <div className="text-sm text-gray-600">Actives</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      {statsAPI.expiredKeys}
                    </div>
                    <div className="text-sm text-gray-600">Expirées</div>
                  </div>
                </div>

                <Button 
                  className="w-full bg-[#1a4d7a] hover:bg-[#1a4d7a]/90"
                  onClick={() => window.location.href = '#api-keys'}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Gérer les API Keys
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
