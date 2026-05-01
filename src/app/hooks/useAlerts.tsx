import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { 
  useNotificaciones,
  notificarStockCritico,
  notificarCaducidadProxima,
  notificarComandaUrgente,
} from '../stores/useNotificaciones';
import { obtenerProductos } from '../utils/productStorage';
import { obtenerComandas } from '../utils/comandaStorage';
import { obtenerRutas } from '../utils/transporteLogic';

interface AlertConfig {
  enableStockAlerts: boolean;
  enableExpiryAlerts: boolean;
  enableOrderAlerts: boolean;
  enableDeliveryAlerts: boolean;
  stockThreshold: number; // Porcentaje mínimo de stock
  expiryDaysThreshold: number; // Días antes de caducidad
  checkInterval: number; // Intervalo de verificación en ms (default: 5 min)
}

const DEFAULT_CONFIG: AlertConfig = {
  enableStockAlerts: true,
  enableExpiryAlerts: true,
  enableOrderAlerts: true,
  enableDeliveryAlerts: true,
  stockThreshold: 20, // 20% del stock mínimo
  expiryDaysThreshold: 7, // 7 días antes de caducidad
  checkInterval: 5 * 60 * 1000, // 5 minutos
};

/**
 * Hook para monitorear y generar alertas automáticas del sistema
 */
export function useAlerts(config: Partial<AlertConfig> = {}) {
  const { t } = useTranslation();
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const lastCheck = useRef<Date>(new Date());
  const alertasEnviadas = useRef<Set<string>>(new Set());

  // Verificar stock bajo
  const checkStockLevels = () => {
    if (!finalConfig.enableStockAlerts) return;

    try {
      const productos = obtenerProductos();
      const productosConStockBajo = productos.filter((producto) => {
        if (!producto.stockMinimo || producto.stockMinimo === 0) return false;
        
        const porcentaje = (producto.stock / producto.stockMinimo) * 100;
        return porcentaje <= finalConfig.stockThreshold;
      });

      productosConStockBajo.forEach((producto) => {
        const alertKey = `stock-${producto.id}`;
        
        // Evitar enviar la misma alerta múltiples veces
        if (!alertasEnviadas.current.has(alertKey)) {
          notificarStockCritico({
            nombre: producto.nombre,
            stockActual: producto.stock,
            stockMinimo: producto.stockMinimo || 0,
          });

          toast.warning(
            `⚠️ ${t('alerts.lowStock') || 'Stock bajo'}: ${producto.nombre}`,
            {
              description: `${t('alerts.currentStock') || 'Stock actual'}: ${producto.stock} / ${producto.stockMinimo}`,
              duration: 8000,
            }
          );

          alertasEnviadas.current.add(alertKey);
          
          // Limpiar alerta después de 1 hora
          setTimeout(() => {
            alertasEnviadas.current.delete(alertKey);
          }, 60 * 60 * 1000);
        }
      });
    } catch (error) {
      console.error('Error al verificar niveles de stock:', error);
    }
  };

  // Verificar productos próximos a caducar
  const checkExpiringProducts = () => {
    if (!finalConfig.enableExpiryAlerts) return;

    try {
      const productos = obtenerProductos();
      const hoy = new Date();

      productos.forEach((producto) => {
        if (!producto.fechaVencimiento) return;

        const fechaVencimiento = new Date(producto.fechaVencimiento);
        const diasRestantes = Math.ceil(
          (fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diasRestantes > 0 && diasRestantes <= finalConfig.expiryDaysThreshold) {
          const alertKey = `expiry-${producto.id}-${diasRestantes}`;
          
          if (!alertasEnviadas.current.has(alertKey)) {
            notificarCaducidadProxima({
              nombre: producto.nombre,
              fechaVencimiento,
              diasRestantes,
            });

            const isUrgent = diasRestantes <= 3;
            
            (isUrgent ? toast.error : toast.warning)(
              `${isUrgent ? '🚨' : '⏰'} ${t('alerts.expiringProduct') || 'Producto por caducar'}: ${producto.nombre}`,
              {
                description: `${t('alerts.daysRemaining') || 'Días restantes'}: ${diasRestantes}`,
                duration: isUrgent ? 12000 : 8000,
              }
            );

            alertasEnviadas.current.add(alertKey);
            
            setTimeout(() => {
              alertasEnviadas.current.delete(alertKey);
            }, 24 * 60 * 60 * 1000); // 24 horas
          }
        }
      });
    } catch (error) {
      console.error('Error al verificar productos próximos a caducar:', error);
    }
  };

  // Verificar comandas urgentes/pendientes
  const checkUrgentOrders = () => {
    if (!finalConfig.enableOrderAlerts) return;

    try {
      const comandas = obtenerComandas();
      const hoy = new Date();

      const comandasUrgentes = comandas.filter((comanda) => {
        if (comanda.estado === 'completada' || comanda.estado === 'cancelada') {
          return false;
        }

        // Verificar si la fecha de entrega es hoy o pasó
        if (comanda.fechaEntrega) {
          const fechaEntrega = new Date(comanda.fechaEntrega);
          const diferenciaDias = Math.ceil(
            (fechaEntrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          return diferenciaDias <= 1; // Hoy o pasado
        }

        return false;
      });

      comandasUrgentes.forEach((comanda) => {
        const alertKey = `order-${comanda.id}-urgent`;
        
        if (!alertasEnviadas.current.has(alertKey)) {
          notificarComandaUrgente({
            numero: comanda.numero,
            organismo: comanda.nombreOrganismo,
          });

          toast.error(
            `🚨 ${t('alerts.urgentOrder') || 'Comanda urgente'}: #${comanda.numero}`,
            {
              description: `${comanda.nombreOrganismo} - ${t('alerts.requiresAttention') || 'Requiere atención'}`,
              duration: 10000,
            }
          );

          alertasEnviadas.current.add(alertKey);
          
          setTimeout(() => {
            alertasEnviadas.current.delete(alertKey);
          }, 6 * 60 * 60 * 1000); // 6 horas
        }
      });
    } catch (error) {
      console.error('Error al verificar comandas urgentes:', error);
    }
  };

  // Verificar entregas programadas
  const checkScheduledDeliveries = () => {
    if (!finalConfig.enableDeliveryAlerts) return;

    try {
      const rutas = obtenerRutas();
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const entregasHoy = rutas.filter((ruta) => {
        if (ruta.estado === 'completada' || ruta.estado === 'cancelada') {
          return false;
        }

        if (ruta.fechaEntrega) {
          const fechaEntrega = new Date(ruta.fechaEntrega);
          fechaEntrega.setHours(0, 0, 0, 0);
          
          return fechaEntrega.getTime() === hoy.getTime();
        }

        return false;
      });

      if (entregasHoy.length > 0) {
        const alertKey = `deliveries-today-${hoy.toISOString().split('T')[0]}`;
        
        if (!alertasEnviadas.current.has(alertKey)) {
          toast.info(
            `🚚 ${t('alerts.deliveriesToday') || 'Entregas programadas hoy'}: ${entregasHoy.length}`,
            {
              description: t('alerts.checkTransportModule') || 'Revisa el módulo de transporte',
              duration: 10000,
            }
          );

          alertasEnviadas.current.add(alertKey);
          
          setTimeout(() => {
            alertasEnviadas.current.delete(alertKey);
          }, 24 * 60 * 60 * 1000); // 24 horas
        }
      }
    } catch (error) {
      console.error('Error al verificar entregas programadas:', error);
    }
  };

  // Ejecutar todas las verificaciones
  const runAllChecks = () => {
    const now = new Date();
    const timeSinceLastCheck = now.getTime() - lastCheck.current.getTime();

    // Solo ejecutar si ha pasado el intervalo configurado
    if (timeSinceLastCheck < finalConfig.checkInterval) {
      return;
    }

    lastCheck.current = now;

    checkStockLevels();
    checkExpiringProducts();
    checkUrgentOrders();
    checkScheduledDeliveries();
  };

  // Configurar intervalo de verificación
  useEffect(() => {
    // Ejecutar inmediatamente al montar
    const timer = setTimeout(() => {
      runAllChecks();
    }, 2000); // Esperar 2 segundos después de montar

    // Configurar intervalo
    const interval = setInterval(runAllChecks, finalConfig.checkInterval);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [
    finalConfig.enableStockAlerts,
    finalConfig.enableExpiryAlerts,
    finalConfig.enableOrderAlerts,
    finalConfig.enableDeliveryAlerts,
    finalConfig.checkInterval,
  ]);

  return {
    runAllChecks,
    checkStockLevels,
    checkExpiringProducts,
    checkUrgentOrders,
    checkScheduledDeliveries,
  };
}

/**
 * Hook simple para mostrar mensajes toast con feedback visual
 */
export function useToastFeedback() {
  const { t } = useTranslation();

  return {
    success: (message: string, description?: string) => {
      toast.success(`✅ ${message}`, {
        description,
        duration: 4000,
      });
    },
    
    error: (message: string, description?: string) => {
      toast.error(`❌ ${message}`, {
        description,
        duration: 6000,
      });
    },
    
    warning: (message: string, description?: string) => {
      toast.warning(`⚠️ ${message}`, {
        description,
        duration: 5000,
      });
    },
    
    info: (message: string, description?: string) => {
      toast.info(`ℹ️ ${message}`, {
        description,
        duration: 4000,
      });
    },
    
    loading: (message: string) => {
      return toast.loading(message);
    },
    
    dismiss: (toastId: string | number) => {
      toast.dismiss(toastId);
    },
  };
}
