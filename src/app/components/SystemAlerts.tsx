import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAlerts } from '../hooks/useAlerts';
import { useNotificaciones } from '../stores/useNotificaciones';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Settings as SettingsIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';

interface AlertSettings {
  enableStockAlerts: boolean;
  enableExpiryAlerts: boolean;
  enableOrderAlerts: boolean;
  enableDeliveryAlerts: boolean;
  enableSoundNotifications: boolean;
  stockThreshold: number;
  expiryDaysThreshold: number;
}

const DEFAULT_SETTINGS: AlertSettings = {
  enableStockAlerts: true,
  enableExpiryAlerts: true,
  enableOrderAlerts: true,
  enableDeliveryAlerts: true,
  enableSoundNotifications: true,
  stockThreshold: 20,
  expiryDaysThreshold: 7,
};

/**
 * Componente que gestiona las alertas automáticas del sistema
 */
export function SystemAlerts() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<AlertSettings>(() => {
    const saved = localStorage.getItem('system-alerts-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [showSettings, setShowSettings] = useState(false);

  // Inicializar sistema de alertas con la configuración
  useAlerts({
    enableStockAlerts: settings.enableStockAlerts,
    enableExpiryAlerts: settings.enableExpiryAlerts,
    enableOrderAlerts: settings.enableOrderAlerts,
    enableDeliveryAlerts: settings.enableDeliveryAlerts,
    stockThreshold: settings.stockThreshold,
    expiryDaysThreshold: settings.expiryDaysThreshold,
  });

  // Guardar configuración cuando cambia
  useEffect(() => {
    localStorage.setItem('system-alerts-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof AlertSettings>(
    key: K,
    value: AlertSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* El sistema de alertas funciona en segundo plano */}
      
      {/* Botón de configuración de alertas (opcional, puede ir en el navbar) */}
      <Sheet open={showSettings} onOpenChange={setShowSettings}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-white/20 hidden md:flex"
            title={t('alerts.settings') || 'Configuración de alertas'}
          >
            <SettingsIcon className="w-5 h-5 text-white" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-[#1a4d7a] flex items-center gap-2">
              <Bell className="w-5 h-5" />
              {t('alerts.settings') || 'Configuración de Alertas'}
            </SheetTitle>
            <SheetDescription>
              {t('alerts.settingsDescription') || 
                'Personaliza las notificaciones automáticas del sistema'}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Alertas de Stock */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="stock-alerts" className="text-[#333333] font-medium">
                    {t('alerts.stockAlerts') || 'Alertas de Stock Bajo'}
                  </Label>
                  <p className="text-xs text-[#666666]">
                    {t('alerts.stockAlertsDesc') || 'Notificar cuando el stock esté por debajo del mínimo'}
                  </p>
                </div>
                <Switch
                  id="stock-alerts"
                  checked={settings.enableStockAlerts}
                  onCheckedChange={(checked) => updateSetting('enableStockAlerts', checked)}
                />
              </div>

              {settings.enableStockAlerts && (
                <div className="pl-4 border-l-2 border-[#1a4d7a]/20">
                  <Label className="text-xs text-[#666666]">
                    {t('alerts.threshold') || 'Umbral'}: {settings.stockThreshold}%
                  </Label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={settings.stockThreshold}
                    onChange={(e) => updateSetting('stockThreshold', parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Alertas de Caducidad */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="expiry-alerts" className="text-[#333333] font-medium">
                    {t('alerts.expiryAlerts') || 'Alertas de Caducidad'}
                  </Label>
                  <p className="text-xs text-[#666666]">
                    {t('alerts.expiryAlertsDesc') || 'Notificar productos próximos a caducar'}
                  </p>
                </div>
                <Switch
                  id="expiry-alerts"
                  checked={settings.enableExpiryAlerts}
                  onCheckedChange={(checked) => updateSetting('enableExpiryAlerts', checked)}
                />
              </div>

              {settings.enableExpiryAlerts && (
                <div className="pl-4 border-l-2 border-[#1a4d7a]/20">
                  <Label className="text-xs text-[#666666]">
                    {t('alerts.daysBeforeExpiry') || 'Días antes de caducidad'}: {settings.expiryDaysThreshold}
                  </Label>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    value={settings.expiryDaysThreshold}
                    onChange={(e) => updateSetting('expiryDaysThreshold', parseInt(e.target.value))}
                    className="w-full mt-2"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Alertas de Comandas */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="order-alerts" className="text-[#333333] font-medium">
                  {t('alerts.orderAlerts') || 'Alertas de Comandas'}
                </Label>
                <p className="text-xs text-[#666666]">
                  {t('alerts.orderAlertsDesc') || 'Notificar comandas urgentes y pendientes'}
                </p>
              </div>
              <Switch
                id="order-alerts"
                checked={settings.enableOrderAlerts}
                onCheckedChange={(checked) => updateSetting('enableOrderAlerts', checked)}
              />
            </div>

            <Separator />

            {/* Alertas de Entregas */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="delivery-alerts" className="text-[#333333] font-medium">
                  {t('alerts.deliveryAlerts') || 'Alertas de Entregas'}
                </Label>
                <p className="text-xs text-[#666666]">
                  {t('alerts.deliveryAlertsDesc') || 'Notificar entregas programadas para hoy'}
                </p>
              </div>
              <Switch
                id="delivery-alerts"
                checked={settings.enableDeliveryAlerts}
                onCheckedChange={(checked) => updateSetting('enableDeliveryAlerts', checked)}
              />
            </div>

            <Separator />

            {/* Notificaciones de Sonido */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound-alerts" className="text-[#333333] font-medium">
                  {t('alerts.soundNotifications') || 'Notificaciones de Sonido'}
                </Label>
                <p className="text-xs text-[#666666]">
                  {t('alerts.soundNotificationsDesc') || 'Reproducir sonido con las alertas'}
                </p>
              </div>
              <Switch
                id="sound-alerts"
                checked={settings.enableSoundNotifications}
                onCheckedChange={(checked) => updateSetting('enableSoundNotifications', checked)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setSettings(DEFAULT_SETTINGS)}
              className="border-[#1a4d7a] text-[#1a4d7a] hover:bg-[#1a4d7a]/10"
            >
              {t('common.restoreDefaults') || 'Restaurar por defecto'}
            </Button>
            <Button
              onClick={() => setShowSettings(false)}
              className="bg-[#1a4d7a] hover:bg-[#1a4d7a]/90"
            >
              {t('common.save') || 'Guardar'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

/**
 * Componente para mostrar resumen de alertas activas
 */
export function AlertsSummary() {
  const { t } = useTranslation();
  const { notificaciones } = useNotificaciones();
  const [visible, setVisible] = useState(true);

  const alertasUrgentes = notificaciones.filter(
    (n) => !n.leida && n.prioridad === 'urgente'
  );

  if (alertasUrgentes.length === 0 || !visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 right-4 z-50 max-w-sm"
      >
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg shadow-2xl backdrop-blur-xl border border-red-400/30">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 animate-pulse" />
                <h4 className="font-bold text-sm">
                  {t('alerts.urgentAlerts') || 'Alertas Urgentes'}
                </h4>
              </div>
              <p className="text-xs opacity-90">
                {alertasUrgentes.length} {t('alerts.requireImmediateAttention') || 'requieren atención inmediata'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setVisible(false)}
              className="h-6 w-6 text-white hover:bg-white/20 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
