import React, { useState } from 'react';
import { Bell, X, Check, Trash2, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Separator } from './ui/separator';
import { useNotificaciones, type Notificacion } from '../stores/useNotificaciones';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

export function CentroNotificaciones() {
  const { t } = useTranslation();
  const {
    notificaciones,
    noLeidas,
    marcarComoLeida,
    marcarTodasComoLeidas,
    eliminarNotificacion,
    eliminarTodas,
  } = useNotificaciones();

  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState<'todas' | 'noLeidas'>('todas');

  const notificacionesFiltradas =
    filtro === 'noLeidas'
      ? notificaciones.filter((n) => !n.leida)
      : notificaciones;

  const obtenerIcono = (tipo: Notificacion['tipo']) => {
    switch (tipo) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-[#4CAF50]" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-[#DC3545]" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[#FFC107]" />;
      case 'info':
        return <Info className="w-5 h-5 text-[#1E73BE]" />;
      default:
        return <Bell className="w-5 h-5 text-[#666666]" />;
    }
  };

  const obtenerColorFondo = (tipo: Notificacion['tipo'], leida: boolean) => {
    if (leida) return 'bg-gray-50';
    
    switch (tipo) {
      case 'success':
        return 'bg-green-50 border-l-4 border-[#4CAF50]';
      case 'error':
        return 'bg-red-50 border-l-4 border-[#DC3545]';
      case 'warning':
        return 'bg-yellow-50 border-l-4 border-[#FFC107]';
      case 'info':
        return 'bg-blue-50 border-l-4 border-[#1E73BE]';
      default:
        return 'bg-white border-l-4 border-gray-300';
    }
  };

  const formatearFecha = (fecha: Date) => {
    const ahora = new Date();
    const diff = ahora.getTime() - new Date(fecha).getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return t('notifications.justNow');
    if (minutos < 60) return t('notifications.minutesAgo', { minutes: minutos });
    if (horas < 24) return t('notifications.hoursAgo', { hours: horas });
    if (dias === 1) return t('notifications.yesterday');
    if (dias < 7) return t('notifications.daysAgo', { days: dias });
    
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-white/20 p-1.5 sm:p-2"
        >
          <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          {noLeidas > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1"
            >
              <Badge
                variant="destructive"
                className="bg-[#DC3545] text-white px-1 sm:px-1.5 py-0 text-[10px] sm:text-xs font-bold min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] flex items-center justify-center rounded-full"
              >
                {noLeidas > 99 ? '99+' : noLeidas}
              </Badge>
            </motion.div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-2rem)] sm:w-96 p-0 max-h-[80vh] flex flex-col"
        align="end"
        sideOffset={8}
      >
        {/* Encabezado */}
        <div className="p-3 sm:p-4 border-b bg-[#F4F4F4] flex-shrink-0">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3
              className="text-base sm:text-lg text-[#333333]"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
            >
              {t('notifications.title')}
            </h3>
            {notificaciones.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={eliminarTodas}
                className="text-[#DC3545] hover:bg-red-50 h-6 sm:h-7 text-xs sm:text-sm px-2 sm:px-3"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                <span className="hidden sm:inline">{t('notifications.clear')}</span>
              </Button>
            )}
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <Button
              variant={filtro === 'todas' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltro('todas')}
              className={`text-xs sm:text-sm h-7 sm:h-8 ${filtro === 'todas' ? 'bg-[#1E73BE]' : ''}`}
            >
              {t('notifications.all')} ({notificaciones.length})
            </Button>
            <Button
              variant={filtro === 'noLeidas' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltro('noLeidas')}
              className={`text-xs sm:text-sm h-7 sm:h-8 ${filtro === 'noLeidas' ? 'bg-[#1E73BE]' : ''}`}
            >
              {t('notifications.unread')} ({noLeidas})
            </Button>
          </div>

          {noLeidas > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={marcarTodasComoLeidas}
              className="w-full mt-2 text-[#1E73BE] hover:bg-blue-50"
            >
              <Check className="w-4 h-4 mr-1" />
              {t('notifications.markAllAsRead')}
            </Button>
          )}
        </div>

        {/* Lista de notificaciones */}
        <ScrollArea className="h-[400px]">
          {notificacionesFiltradas.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Bell className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-[#666666] text-sm">
                {filtro === 'noLeidas'
                  ? t('notifications.noUnreadNotifications')
                  : t('notifications.noNotifications')}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {notificacionesFiltradas.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${obtenerColorFondo(
                      notif.tipo,
                      notif.leida
                    )}`}
                    onClick={() => !notif.leida && marcarComoLeida(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">{obtenerIcono(notif.tipo)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm ${
                              notif.leida ? 'text-[#666666]' : 'text-[#333333] font-medium'
                            }`}
                          >
                            {notif.titulo}
                          </p>
                          {!notif.leida && (
                            <div className="w-2 h-2 rounded-full bg-[#1E73BE] flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-[#999999] mt-1 line-clamp-2">
                          {notif.mensaje}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-[#999999]">
                            {formatearFecha(notif.fecha)}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              eliminarNotificacion(notif.id);
                            }}
                            className="h-6 px-2 text-[#DC3545] hover:bg-red-50"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Versión compacta del botón de notificaciones (para móvil)
 */
export function NotificacionesCompacto() {
  const { noLeidas } = useNotificaciones();

  return (
    <div className="relative">
      <Bell className="w-5 h-5 text-[#333333]" />
      {noLeidas > 0 && (
        <span className="absolute -top-2 -right-2 bg-[#DC3545] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {noLeidas > 9 ? '9+' : noLeidas}
        </span>
      )}
    </div>
  );
}