// Sistema de eventos para sincronización de configuración de soporte en tiempo real
// Permite que todos los componentes se actualicen automáticamente cuando cambie la configuración

import type { SupportConfig } from './supportConfig';

// Tipo de evento personalizado para cambios de configuración de soporte
export class SupportConfigChangeEvent extends Event {
  constructor(public detail: { config: SupportConfig }) {
    super('support-config-change');
  }
}

// Event emitter singleton para gestionar eventos de configuración
class SupportConfigEventEmitter {
  private listeners: Array<(config: SupportConfig) => void> = [];

  // Emitir evento cuando la configuración cambia
  emit(config: SupportConfig) {
    // Notificar a todos los listeners
    this.listeners.forEach(listener => {
      try {
        listener(config);
      } catch (error) {
        console.error('Error en listener de configuración de soporte:', error);
      }
    });

    // Emitir evento personalizado en window
    window.dispatchEvent(new CustomEvent('support-config-change', { detail: { config } }));
    
    // También disparar evento de storage para sincronización entre pestañas
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'banque_alimentaire_support_config',
      newValue: JSON.stringify(config),
      storageArea: localStorage
    }));
  }

  // Suscribirse a cambios de configuración
  subscribe(listener: (config: SupportConfig) => void): () => void {
    this.listeners.push(listener);
    
    // Retornar función para desuscribirse
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Limpiar todos los listeners
  clear() {
    this.listeners = [];
  }
}

// Instancia singleton
export const supportConfigEmitter = new SupportConfigEventEmitter();

// Hook de React para escuchar cambios de configuración
import { useEffect, useState } from 'react';
import { obtenerConfigSupport } from './supportConfig';

export function useSupportConfig() {
  const [config, setConfig] = useState<SupportConfig>(() => obtenerConfigSupport());

  useEffect(() => {
    // Actualizar configuración cuando cambie
    const handleConfigChange = (event: Event) => {
      if (event instanceof CustomEvent) {
        setConfig(event.detail.config);
      }
    };

    // Escuchar cambios en el evento personalizado
    window.addEventListener('support-config-change', handleConfigChange);

    // Escuchar cambios en localStorage (para sincronización entre pestañas)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'banque_alimentaire_support_config' && event.newValue) {
        try {
          const newConfig = JSON.parse(event.newValue);
          setConfig(newConfig);
        } catch (error) {
          console.error('Error al parsear configuración de soporte:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Suscribirse al emitter
    const unsubscribe = supportConfigEmitter.subscribe((newConfig) => {
      setConfig(newConfig);
    });

    // Limpiar listeners al desmontar
    return () => {
      window.removeEventListener('support-config-change', handleConfigChange);
      window.removeEventListener('storage', handleStorageChange);
      unsubscribe();
    };
  }, []);

  return config;
}

// Función helper para disparar actualización manual desde cualquier lugar
export function notifyConfigChange(config: SupportConfig) {
  supportConfigEmitter.emit(config);
}
