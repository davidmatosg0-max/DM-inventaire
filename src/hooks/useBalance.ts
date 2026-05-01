import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY = 'banque_alimentaire_balance_config';
const STORAGE_LAST_PORT_KEY = 'banque_alimentaire_last_port';
const STORAGE_WORKING_CONFIG_KEY = 'banque_alimentaire_working_config';

export interface BalanceConfig {
  baudRate: number;
  dataBits: 7 | 8;
  stopBits: 1 | 2;
  parity: 'none' | 'even' | 'odd';
  flowControl: 'none' | 'hardware';
  protocol: 'auto' | 'pennsylvania' | 'toledo' | 'mettler' | 'avery' | 'cas' | 'ohaus' | 'digi' | 'bizerba' | 'sartorius' | 'ad' | 'generic';
  requestCommand?: string;
  continuousMode: boolean;
  autoConnect: boolean;
  reconnectInterval: number;
}

export interface BalanceData {
  weight: number;
  unit: 'kg' | 'g' | 'lb' | 'oz';
  stable: boolean;
  timestamp: number;
}

// Configuraciones predefinidas para Pennsylvania Scale 7500 & 7600
// Estas son las configuraciones más comunes según el manual
const PENNSYLVANIA_CONFIGS: BalanceConfig[] = [
  {
    // Configuración más común: 9600, 8-N-1
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    flowControl: 'none',
    protocol: 'pennsylvania',
    continuousMode: true,
    autoConnect: true,
    reconnectInterval: 5000
  },
  {
    // Configuración alternativa: 9600, 7-E-1
    baudRate: 9600,
    dataBits: 7,
    stopBits: 1,
    parity: 'even',
    flowControl: 'none',
    protocol: 'pennsylvania',
    continuousMode: true,
    autoConnect: true,
    reconnectInterval: 5000
  },
  {
    // Configuración: 2400, 8-N-1
    baudRate: 2400,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    flowControl: 'none',
    protocol: 'pennsylvania',
    continuousMode: true,
    autoConnect: true,
    reconnectInterval: 5000
  },
  {
    // Configuración: 4800, 8-N-1
    baudRate: 4800,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    flowControl: 'none',
    protocol: 'pennsylvania',
    continuousMode: true,
    autoConnect: true,
    reconnectInterval: 5000
  },
  {
    // Configuración: 19200, 8-N-1
    baudRate: 19200,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    flowControl: 'none',
    protocol: 'pennsylvania',
    continuousMode: true,
    autoConnect: true,
    reconnectInterval: 5000
  }
];

// Configuración optimizada para Pennsylvania Scale 7500 & 7600
const DEFAULT_CONFIG: BalanceConfig = PENNSYLVANIA_CONFIGS[0];

const GENERIC_FALLBACK_SERIAL_CONFIGS: Array<Pick<BalanceConfig, 'baudRate' | 'dataBits' | 'stopBits' | 'parity' | 'flowControl'>> = [
  { baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'none', flowControl: 'none' },
  { baudRate: 9600, dataBits: 7, stopBits: 1, parity: 'even', flowControl: 'none' },
  { baudRate: 4800, dataBits: 8, stopBits: 1, parity: 'none', flowControl: 'none' },
  { baudRate: 2400, dataBits: 8, stopBits: 1, parity: 'none', flowControl: 'none' },
  { baudRate: 19200, dataBits: 8, stopBits: 1, parity: 'none', flowControl: 'none' }
];

const getConnectionAttempts = (baseConfig: BalanceConfig): BalanceConfig[] => {
  const attempts: BalanceConfig[] = [{ ...baseConfig }];

  if (baseConfig.protocol === 'pennsylvania' || baseConfig.protocol === 'auto') {
    attempts.push(...PENNSYLVANIA_CONFIGS.map(cfg => ({ ...baseConfig, ...cfg })));
  }

  attempts.push(
    ...GENERIC_FALLBACK_SERIAL_CONFIGS.map(serialCfg => ({
      ...baseConfig,
      ...serialCfg
    }))
  );

  // Evitar intentos duplicados con la misma configuración serial.
  const seen = new Set<string>();
  return attempts.filter(cfg => {
    const key = `${cfg.baudRate}-${cfg.dataBits}-${cfg.stopBits}-${cfg.parity}-${cfg.flowControl}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// Guardar configuración que funcionó
const saveWorkingConfig = (config: BalanceConfig): void => {
  try {
    localStorage.setItem(STORAGE_WORKING_CONFIG_KEY, JSON.stringify(config));
    console.log('✅ Configuración guardada:', {
      baudRate: config.baudRate,
      dataBits: config.dataBits,
      parity: config.parity
    });
  } catch (error) {
    console.error('Error saving working config:', error);
  }
};

// Obtener configuración que funcionó anteriormente
const getWorkingConfig = (): BalanceConfig | null => {
  try {
    const saved = localStorage.getItem(STORAGE_WORKING_CONFIG_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading working config:', error);
  }
  return null;
};

// Cargar configuración guardada desde localStorage
const loadSavedConfig = (): BalanceConfig => {
  try {
    // Primero intentar cargar la configuración que funcionó
    const workingConfig = getWorkingConfig();
    if (workingConfig) {
      console.log('🔧 Usando configuración que funcionó anteriormente');
      return workingConfig;
    }
    
    // Si no, intentar la configuración guardada manualmente
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_CONFIG, ...parsed };
    }
  } catch (error) {
    console.error('Error loading saved balance config:', error);
  }
  return DEFAULT_CONFIG;
};

// Guardar configuración en localStorage
const saveConfig = (config: BalanceConfig): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Error saving balance config:', error);
  }
};

// Guardar información del último puerto conectado
const saveLastPort = (portInfo: any): void => {
  try {
    localStorage.setItem(STORAGE_LAST_PORT_KEY, JSON.stringify(portInfo));
  } catch (error) {
    console.error('Error saving last port:', error);
  }
};

// Obtener información del último puerto
const getLastPort = (): any => {
  try {
    const saved = localStorage.getItem(STORAGE_LAST_PORT_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading last port:', error);
  }
  return null;
};

// Protocolos optimizados - Pennsylvania Scale como prioridad
const SCALE_PROTOCOLS = {
  // Pennsylvania Scale 7500/7600: Formato muy flexible
  // Acepta múltiples formatos: "10.5 kg", "10.5kg", "  10.5 KG  ", etc.
  pennsylvania: /(?:[\x02])?[\s]*([+-]?[0-9]+\.?[0-9]*)[\s]*(kg|g|lb|oz|KG|G|LB|OZ)?(?:[\x03\r\n])?/i,
  
  // Toledo: STX + peso + unidad + estabilidad + ETX
  toledo: /\x02([0-9\s\.\-]+)\s?(kg|g|lb|oz)\s?([*\s])\x03/i,
  
  // Mettler Toledo: S/N + peso + unidad
  mettler: /([NS])\s+([0-9\s\.\-]+)\s?(kg|g|lb|oz)/i,
  
  // Avery Weigh-Tronix: W + peso + unidad
  avery: /W\s+([0-9\.\-]+)\s?(kg|g|lb|oz)/i,
  
  // CAS (Common format)
  cas: /(?:ST|US|OL)?,?\s*([0-9\.\-]+)\s?(kg|g|lb|oz)\s?([*\s]?)/i,
  
  // Ohaus: múltiples formatos
  ohaus: /(?:S|D)\s+([0-9\.\-]+)\s?(kg|g|lb|oz)/i,
  
  // Digi: formato estándar
  digi: /([0-9\.\-]+)\s?(kg|g|lb|oz)\s?([ST|US]?)/i,
  
  // Bizerba: formato con prefijo
  bizerba: /(?:N|G)\s+([0-9\.\-]+)\s?(kg|g|lb|oz)/i,
  
  // Sartorius: formato S + peso
  sartorius: /S\s+([0-9\.\-]+)\s?(kg|g|lb|oz)/i,
  
  // A&D (AND): múltiples formatos
  ad: /(?:ST|US)?,?\s*([0-9\.\-]+)\s?(kg|g|lb|oz)/i,
  
  // Generic format: número seguido de unidad (más flexible)
  generic: /(?:[\x02\x03])?([\s]*[+-]?[0-9]+\.?[0-9]*)[\s]*(kg|g|lb|oz|KG|G|LB|OZ)?(?:[\x02\x03])?/i
};

// Comandos de solicitud de peso por marca
const WEIGHT_REQUEST_COMMANDS = {
  pennsylvania: 'P\r\n', // Pennsylvania Scale
  toledo: 'W\r\n',
  mettler: 'S\r\n',
  avery: 'P\r\n',
  cas: 'Q\r\n',
  ohaus: 'P\r\n',
  digi: 'W\r\n',
  bizerba: 'w\r\n',
  sartorius: 'S\r\n',
  ad: 'Q\r\n',
  generic: 'P\r\n'
};

export function useBalance(customConfig?: Partial<BalanceConfig>) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentWeight, setCurrentWeight] = useState<BalanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedProtocol, setDetectedProtocol] = useState<string>('pennsylvania'); // Pennsylvania por defecto
  const [availablePorts, setAvailablePorts] = useState<SerialPort[]>([]);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');
  
  const portRef = useRef<SerialPort | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const configRef = useRef<BalanceConfig>({ ...loadSavedConfig(), ...customConfig });
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoConnectingRef = useRef(false);

  // Listar puertos disponibles
  const listPorts = useCallback(async () => {
    if (!('serial' in navigator)) return [];
    
    try {
      // 🔇 SILENCIAR ERROR - Verificar permisos primero
      if (!navigator.serial || !navigator.serial.getPorts) return [];
      
      const ports = await navigator.serial.getPorts();
      setAvailablePorts(ports);
      console.log(`📡 Pennsylvania Scale: ${ports.length} puerto(s) disponible(s)`);
      return ports;
    } catch (err: any) {
      // 🔇 SILENCIAR COMPLETAMENTE - No mostrar error en consola
      // Ignorar errores de permisos - es normal en algunos contextos
      return [];
    }
  }, []);

  // Verificar si tenemos permisos para acceder a puertos seriales
  const hasSerialAccess = useCallback(async (): Promise<boolean> => {
    if (!('serial' in navigator)) return false;
    
    try {
      // 🔇 SILENCIAR ERROR DE PERMISOS - NO INTENTAR ACCEDER SI NO HAY POLÍTICA
      // Verificar primero si la función existe antes de llamarla
      if (!navigator.serial.getPorts) return false;
      
      // Intentar acceder a getPorts - si falla, no tenemos permisos
      await navigator.serial.getPorts();
      return true;
    } catch (err: any) {
      // 🔇 SILENCIAR COMPLETAMENTE - No mostrar ningún error en consola
      // Es normal que no haya permisos hasta que el usuario conecte manualmente
      return false;
    }
  }, []);

  // Verificar soporte de Web Serial API
  useEffect(() => {
    const supported = 'serial' in navigator;
    setIsSupported(supported);
    
    if (supported) {
      console.log('✅ Web Serial API soportado - Pennsylvania Scale compatible');
    } else {
      console.warn('❌ Web Serial API no soportado - usar Chrome/Edge');
    }
  }, []);

  // Parsear datos según protocolo
  const parseScaleData = useCallback((data: string): BalanceData | null => {
    const config = configRef.current;
    
    // Limpiar datos
    const cleanData = data.trim();
    
    // Si el protocolo es Pennsylvania, intentarlo primero
    if (config.protocol === 'pennsylvania' || config.protocol === 'auto') {
      const pennsylvaniaRegex = SCALE_PROTOCOLS.pennsylvania;
      const match = cleanData.match(pennsylvaniaRegex);
      if (match) {
        if (config.protocol === 'auto') {
          setDetectedProtocol('pennsylvania');
        }
        return extractWeightData(match, 'pennsylvania');
      }
    }
    
    // Intentar detectar protocolo automáticamente
    if (config.protocol === 'auto') {
      for (const [protocolName, regex] of Object.entries(SCALE_PROTOCOLS)) {
        if (protocolName === 'pennsylvania') continue; // Ya lo intentamos
        const match = cleanData.match(regex);
        if (match) {
          setDetectedProtocol(protocolName);
          console.log(`🔍 Protocolo detectado: ${protocolName}`);
          return extractWeightData(match, protocolName);
        }
      }
    } else {
      // Usar protocolo específico
      const regex = SCALE_PROTOCOLS[config.protocol as keyof typeof SCALE_PROTOCOLS];
      if (regex) {
        const match = cleanData.match(regex);
        if (match) {
          return extractWeightData(match, config.protocol);
        }
      }
    }
    
    return null;
  }, []);

  // Extraer peso de la coincidencia regex
  const extractWeightData = (match: RegExpMatchArray, protocol: string): BalanceData | null => {
    try {
      let weight: number;
      let unit: 'kg' | 'g' | 'lb' | 'oz' = 'kg';
      let stable = true;

      switch (protocol) {
        case 'pennsylvania':
          weight = parseFloat(match[1].trim());
          // Pennsylvania Scale 7500/7600 puede o no enviar unidad
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          stable = true; // Pennsylvania siempre envía peso estable
          break;
          
        case 'toledo':
          weight = parseFloat(match[1].replace(/\s/g, ''));
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          stable = match[3] !== '*';
          break;
          
        case 'mettler':
          stable = match[1] === 'S';
          weight = parseFloat(match[2].replace(/\s/g, ''));
          unit = (match[3]?.toLowerCase() as any) || 'kg';
          break;
          
        case 'avery':
          weight = parseFloat(match[1]);
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          break;
          
        case 'cas':
          weight = parseFloat(match[1]);
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          stable = !match[3] || match[3].trim() !== '*';
          break;
          
        case 'ohaus':
          stable = match[0].startsWith('S');
          weight = parseFloat(match[1]);
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          break;
          
        case 'digi':
          weight = parseFloat(match[1]);
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          stable = match[3] === 'ST' || !match[3];
          break;
          
        case 'bizerba':
          stable = match[0].startsWith('N');
          weight = parseFloat(match[1]);
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          break;
          
        case 'sartorius':
          weight = parseFloat(match[1]);
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          stable = true;
          break;
          
        case 'ad':
          weight = parseFloat(match[1]);
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          stable = match[0].includes('ST') || !match[0].includes('US');
          break;
          
        default: // generic
          weight = parseFloat(match[1].trim());
          unit = (match[2]?.toLowerCase() as any) || 'kg';
          stable = true;
          break;
      }

      if (isNaN(weight)) return null;

      return {
        weight,
        unit,
        stable,
        timestamp: Date.now()
      };
    } catch (err) {
      console.error('Error parsing weight data:', err);
      return null;
    }
  };

  // Leer datos del puerto serial
  const readLoop = useCallback(async () => {
    if (!portRef.current || !portRef.current.readable) return;

    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = portRef.current.readable.pipeTo(textDecoder.writable);
    readerRef.current = textDecoder.readable.getReader();

    let buffer = '';

    try {
      console.log('🔄 Iniciando lectura de datos Pennsylvania Scale...');
      while (true) {
        const { value, done } = await readerRef.current.read();
        if (done) break;

        buffer += value;
        
        // Procesar líneas completas
        // Muchas balanzas usan ETX (\x03) como delimitador en lugar de CR/LF.
        const frames = buffer.split(/[\r\n\x03]+/);
        buffer = frames.pop() || '';

        for (const rawFrame of frames) {
          const frame = rawFrame.replace(/\x02/g, '').trim();
          if (frame) {
            const weightData = parseScaleData(frame);
            if (weightData) {
              setCurrentWeight(weightData);
              setError(null);
              setConnectionStatus('connected');
              console.log(`⚖️ Peso: ${weightData.weight} ${weightData.unit} ${weightData.stable ? '✓' : '~'}`);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'NetworkError') {
        console.error('❌ Error de lectura:', err.message);
        setError(`Error de lectura: ${err.message}`);
      }
      // Intentar reconectar automáticamente
      if (configRef.current.autoConnect) {
        scheduleReconnect();
      }
    } finally {
      readerRef.current?.releaseLock();
      await readableStreamClosed.catch(() => {});
    }
  }, [parseScaleData]);

  // Programar reconexión automática
  const scheduleReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const config = configRef.current;
    if (!config.autoConnect) return;

    setIsReconnecting(true);
    setConnectionStatus('reconnecting');
    console.log(`🔄 Intentando reconectar en ${config.reconnectInterval / 1000}s...`);

    reconnectTimeoutRef.current = setTimeout(async () => {
      console.log('🔌 Intentando reconexión automática...');
      await autoConnect();
    }, config.reconnectInterval);
  }, []);

  // Auto-conectar al último puerto conocido
  const autoConnect = useCallback(async () => {
    if (!isSupported || isAutoConnectingRef.current) return false;
    
    isAutoConnectingRef.current = true;
    setConnectionStatus('connecting');

    try {
      // Verificar primero si tenemos acceso antes de intentar getPorts
      const hasAccess = await hasSerialAccess();
      
      if (!hasAccess) {
        console.log('📡 No hay permisos para auto-conexión. Usuario debe conectar manualmente primero.');
        setConnectionStatus('disconnected');
        setError(null); // No mostrar error
        isAutoConnectingRef.current = false;
        return false;
      }
      
      // Intentar obtener puertos - ahora sabemos que tenemos permisos
      const ports = await navigator.serial.getPorts();
      
      if (ports.length === 0) {
        console.log('📡 No hay puertos autorizados. Usuario debe dar permiso manualmente.');
        setConnectionStatus('disconnected');
        isAutoConnectingRef.current = false;
        return false;
      }

      // Intentar conectar al primer puerto disponible (generalmente el Pennsylvania Scale)
      const port = ports[0];
      const config = configRef.current;
      
      console.log('🔌 Auto-conectando a Pennsylvania Scale...');
      
      await port.open({
        baudRate: config.baudRate,
        dataBits: config.dataBits,
        stopBits: config.stopBits,
        parity: config.parity,
        flowControl: config.flowControl
      });

      portRef.current = port;
      setIsConnected(true);
      setIsReconnecting(false);
      setConnectionStatus('connected');
      setError(null);

      // Guardar información del puerto
      const portInfo = port.getInfo();
      saveLastPort(portInfo);

      console.log('✅ Pennsylvania Scale auto-conectado exitosamente');
      console.log('📊 Configuración:', {
        baudRate: config.baudRate,
        protocol: config.protocol,
        dataBits: config.dataBits
      });

      // Iniciar lectura de datos
      readLoop();

      isAutoConnectingRef.current = false;
      return true;
    } catch (err: any) {
      console.log('ℹ️ Auto-conexión no disponible en este momento');
      setConnectionStatus('disconnected');
      setError(null); // No mostrar ningún error al usuario
      isAutoConnectingRef.current = false;
      return false;
    }
  }, [isSupported, readLoop, hasSerialAccess]);

  // Conectar manualmente (solicitar puerto al usuario)
  const connect = useCallback(async () => {
    if (!isSupported) {
      setError('Web Serial API no está soportado en este navegador');
      return false;
    }

    try {
      setConnectionStatus('connecting');
      console.log('🔌 Solicitando conexión Pennsylvania Scale...');

      // Cerrar cualquier conexión activa antes de solicitar un nuevo puerto
      if (portRef.current) {
        try {
          if (readerRef.current) {
            await readerRef.current.cancel();
            readerRef.current = null;
          }
          await portRef.current.close();
        } catch (e) {
          // Ignorar errores al cerrar la conexión anterior
        }
        portRef.current = null;
      }
      
      // Solicitar puerto serial al usuario
      const port = await navigator.serial.requestPort();
      
      const connectionAttempts = getConnectionAttempts(configRef.current);
      let lastError = null;
      
      for (let i = 0; i < connectionAttempts.length; i++) {
        const testConfig = connectionAttempts[i];
        
        console.log(`🔧 Probando configuración ${i + 1}/${connectionAttempts.length}:`, {
          protocol: testConfig.protocol,
          baudRate: testConfig.baudRate,
          dataBits: testConfig.dataBits,
          parity: testConfig.parity
        });
        
        try {
          // Intentar abrir con esta configuración
          await port.open({
            baudRate: testConfig.baudRate,
            dataBits: testConfig.dataBits,
            stopBits: testConfig.stopBits,
            parity: testConfig.parity,
            flowControl: testConfig.flowControl
          });

          portRef.current = port;
          configRef.current = testConfig;
          setIsConnected(true);
          setConnectionStatus('connected');
          setError(null);

          // Guardar esta configuración como la que funcionó
          saveWorkingConfig(testConfig);
          saveConfig(testConfig);

          // Guardar información del puerto
          const portInfo = port.getInfo();
          saveLastPort(portInfo);

          console.log('✅ Pennsylvania Scale conectado con configuración:', {
            baudRate: testConfig.baudRate,
            dataBits: testConfig.dataBits,
            parity: testConfig.parity
          });

          // Iniciar lectura de datos
          readLoop();

          return true;
        } catch (err: any) {
          lastError = err;
          console.log(`⚠️ Configuración ${i + 1} falló: ${err.message}`);

          // Cerrar el puerto para resetear su estado antes del siguiente intento
          try {
            await port.close();
          } catch (closeErr) {
            // Ignorar errores al cerrar entre intentos
          }

          // Si no es el último intento, continuar
          if (i < connectionAttempts.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Esperar 500ms
            continue;
          }
        }
      }
      
      // Si llegamos aquí, ninguna configuración funcionó
      const errorMsg = `No se pudo conectar con ninguna configuración serial. Último error: ${lastError?.message || 'desconocido'}`;
      console.error('❌', errorMsg);
      setError(errorMsg);
      setConnectionStatus('disconnected');
      
      // Mostrar ayuda al usuario
      console.log('💡 AYUDA DE CONFIGURACIÓN:');
      console.log('1. Verifica que el cable USB esté conectado correctamente');
      console.log('2. Verifica que no haya otra aplicación usando el puerto');
      console.log('3. Revisa los parámetros seriales de tu balanza en el manual');
      console.log('4. Configuraciones comunes:');
      console.log('   - 9600 baud, 8 data bits, No parity (más común)');
      console.log('   - 9600 baud, 7 data bits, Even parity');
      console.log('   - 2400 baud, 8 data bits, No parity');
      
      return false;
    } catch (err: any) {
      // El usuario cerró el diálogo sin seleccionar un puerto — no es un error real
      if (err.name === 'NotFoundError' || err.message?.includes('No port selected')) {
        console.log('ℹ️ Selección de puerto cancelada por el usuario.');
        setConnectionStatus('disconnected');
        setError(null);
        return false;
      }
      console.error('❌ Error de conexión:', err.message);
      setError(`Error de conexión: ${err.message}`);
      setConnectionStatus('disconnected');
      return false;
    }
  }, [isSupported, readLoop]);

  // Desconectar balanza
  const disconnect = useCallback(async () => {
    try {
      // Cancelar reconexión automática
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
      }

      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }

      setIsConnected(false);
      setIsReconnecting(false);
      setConnectionStatus('disconnected');
      setCurrentWeight(null);
      setError(null);
      
      console.log('🔌 Pennsylvania Scale desconectado');
    } catch (err: any) {
      console.error('❌ Error al desconectar:', err.message);
      setError(`Error al desconectar: ${err.message}`);
    }
  }, []);

  // Actualizar configuración
  const updateConfig = useCallback((newConfig: Partial<BalanceConfig>) => {
    const updatedConfig = { ...configRef.current, ...newConfig };
    configRef.current = updatedConfig;
    saveConfig(updatedConfig);
    console.log('⚙️ Configuración actualizada:', newConfig);
  }, []);

  // Auto-conectar al cargar si está habilitado
  useEffect(() => {
    const config = configRef.current;
    
    if (config.autoConnect && isSupported && !isConnected) {
      // Verificar primero si tenemos acceso antes de intentar auto-conectar
      const tryAutoConnect = async () => {
        const hasAccess = await hasSerialAccess();
        
        if (hasAccess) {
          console.log('🚀 Auto-conexión habilitada para Pennsylvania Scale');
          await autoConnect();
        } else {
          console.log('ℹ️ Auto-conexión deshabilitada - esperando conexión manual del usuario');
        }
      };
      
      // Esperar 1 segundo antes de verificar e intentar auto-conectar
      const timeoutId = setTimeout(() => {
        tryAutoConnect();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isSupported, isConnected, autoConnect, hasSerialAccess]);

  // Monitorear desconexiones y reconectar automáticamente
  useEffect(() => {
    if (!isSupported || !configRef.current.autoConnect) return;

    const handleDisconnect = async (event: Event) => {
      console.log('⚠️ Pennsylvania Scale desconectado, intentando reconectar...');
      setIsConnected(false);
      setConnectionStatus('reconnecting');
      scheduleReconnect();
    };

    // Esta característica no está disponible en todos los navegadores
    if ('serial' in navigator && (navigator.serial as any).addEventListener) {
      (navigator.serial as any).addEventListener('disconnect', handleDisconnect);
      
      return () => {
        (navigator.serial as any).removeEventListener('disconnect', handleDisconnect);
      };
    }
  }, [isSupported, scheduleReconnect]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (portRef.current) {
        disconnect();
      }
    };
  }, [disconnect]);

  return {
    isSupported,
    isConnected,
    currentWeight,
    error,
    detectedProtocol,
    connectionStatus,
    isReconnecting,
    connect,
    disconnect,
    updateConfig,
    listPorts,
    config: configRef.current,
    availablePorts
  };
}