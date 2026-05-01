/**
 * Componente de información de sesión JWT
 * Muestra estado de autenticación, tiempo restante y opciones de refrescar sesión
 */

import React, { useState, useEffect } from 'react';
import { Shield, Clock, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { obtenerEstadisticasJWT } from '../utils/jwtManager';
import { toast } from 'sonner';

interface JWTSessionInfoProps {
  compact?: boolean;
}

export function JWTSessionInfo({ compact = false }: JWTSessionInfoProps) {
  const { usuario, isAuthenticated, refrescarSesion } = useAuth();
  const [stats, setStats] = useState(obtenerEstadisticasJWT());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Actualizar estadísticas cada 10 segundos
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      setStats(obtenerEstadisticasJWT());
    }, 10000); // 10 segundos

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const exito = await refrescarSesion();
      if (exito) {
        toast.success('🔐 Sesión refrescada', {
          description: 'Tu sesión ha sido renovada exitosamente'
        });
        setStats(obtenerEstadisticasJWT());
      } else {
        toast.error('Error al refrescar sesión', {
          description: 'Por favor, inicia sesión nuevamente'
        });
      }
    } catch (error) {
      toast.error('Error al refrescar sesión');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTiempoRestante = (segundos: number): string => {
    if (segundos <= 0) return 'Expirado';
    
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    
    if (minutos > 60) {
      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;
      return `${horas}h ${mins}m`;
    }
    
    return `${minutos}m ${segs}s`;
  };

  const getEstadoColor = (segundos: number): string => {
    if (segundos <= 0) return 'text-red-600';
    if (segundos < 120) return 'text-orange-600'; // Menos de 2 minutos
    if (segundos < 300) return 'text-yellow-600'; // Menos de 5 minutos
    return 'text-green-600';
  };

  const getEstadoIcon = (segundos: number) => {
    if (segundos <= 0) return <AlertTriangle className="w-4 h-4 text-red-600" />;
    if (segundos < 120) return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    return <CheckCircle className="w-4 h-4 text-green-600" />;
  };

  if (!isAuthenticated || !stats.tokenActivo) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200">
        <Shield className="w-4 h-4 text-[#1a4d7a]" />
        <span className="text-xs font-medium text-gray-700">
          {formatTiempoRestante(stats.tiempoRestante)}
        </span>
        {stats.tiempoRestante < 300 && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            title="Refrescar sesión"
          >
            <RefreshCw className={`w-3 h-3 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#1a4d7a]/5 to-[#2d9561]/5 rounded-xl p-4 border border-[#1a4d7a]/20">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#1a4d7a] rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Sesión JWT
            </h3>
            <p className="text-xs text-gray-600">
              {stats.usuario} • {stats.rol}
            </p>
          </div>
        </div>
        {getEstadoIcon(stats.tiempoRestante)}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Tiempo restante:</span>
          </div>
          <span className={`text-sm font-semibold ${getEstadoColor(stats.tiempoRestante)}`}>
            {formatTiempoRestante(stats.tiempoRestante)}
          </span>
        </div>

        {stats.tiempoRestante < 300 && stats.tiempoRestante > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#1a4d7a] text-white rounded-lg hover:bg-[#1a4d7a]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-semibold">
                {isRefreshing ? 'Refrescando...' : 'Refrescar Sesión'}
              </span>
            </button>
            <p className="text-xs text-center text-gray-500 mt-2">
              Tu sesión expirará pronto. Refresca para continuar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
