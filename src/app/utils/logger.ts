// src/app/utils/logger.ts
// Sistema de logging condicional para producción

const isDevelopment = import.meta.env.MODE === 'development';
const enableLogs = import.meta.env.VITE_ENABLE_CONSOLE_LOGS === 'true';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment || enableLogs) {
      console.log(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment || enableLogs) {
      console.info(...args);
    }
  },
  
  warn: (...args: any[]) => {
    // Los warnings siempre se muestran
    console.warn(...args);
  },
  
  error: (...args: any[]) => {
    // Los errores siempre se muestran
    console.error(...args);
  },
  
  table: (data: any) => {
    if (isDevelopment || enableLogs) {
      console.table(data);
    }
  },
  
  group: (label: string) => {
    if (isDevelopment || enableLogs) {
      console.group(label);
    }
  },
  
  groupEnd: () => {
    if (isDevelopment || enableLogs) {
      console.groupEnd();
    }
  }
};

// Función para mostrar banner de bienvenida solo en desarrollo
export const showWelcomeBanner = (message: string) => {
  if (isDevelopment || enableLogs) {
    console.log(message);
  }
};
