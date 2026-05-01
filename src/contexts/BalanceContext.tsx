import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useBalance, BalanceConfig, BalanceData } from '../hooks/useBalance';

interface BalanceContextType {
  isSupported: boolean;
  isConnected: boolean;
  currentWeight: BalanceData | null;
  error: string | null;
  detectedProtocol: string;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
  isReconnecting: boolean;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  updateConfig: (newConfig: Partial<BalanceConfig>) => void;
  listPorts: () => Promise<SerialPort[]>;
  config: BalanceConfig;
  availablePorts: SerialPort[];
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

export function BalanceProvider({ children }: { children: ReactNode }) {
  const balanceData = useBalance();
  
  // Suprimir errores de Serial API en la consola cuando no hay permisos de política
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args: any[]) => {
      // Filtrar errores de permissions policy para Serial API
      const errorMessage = args[0]?.toString() || '';
      if (
        errorMessage.includes('permissions policy') && 
        errorMessage.includes('serial')
      ) {
        // Silenciar este error específico - es esperado cuando no hay permisos
        return;
      }
      // Permitir otros errores
      originalError.apply(console, args);
    };
    
    return () => {
      console.error = originalError;
    };
  }, []);

  return (
    <BalanceContext.Provider value={balanceData}>
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalanceContext() {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error('useBalanceContext must be used within a BalanceProvider');
  }
  return context;
}