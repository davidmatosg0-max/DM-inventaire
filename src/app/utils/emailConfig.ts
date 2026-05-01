// Configuración del servicio de correo electrónico (Outlook/Microsoft 365)

export interface EmailConfig {
  provider: 'outlook' | 'gmail' | 'custom';
  email: string;
  password: string; // En producción, usar contraseña de aplicación
  smtpHost: string;
  smtpPort: number;
  useTLS: boolean;
  fromName: string;
  isConfigured: boolean;
  lastTested?: string;
}

const STORAGE_KEY = 'email_config_banco_alimentos';

// Configuración predeterminada para Outlook
export const OUTLOOK_CONFIG = {
  smtpHost: 'smtp-mail.outlook.com',
  smtpPort: 587,
  useTLS: true
};

// Configuración predeterminada para Gmail
export const GMAIL_CONFIG = {
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  useTLS: true
};

// Obtener la configuración de email
export function obtenerConfigEmail(): EmailConfig | null {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  return JSON.parse(data);
}

// Guardar la configuración de email
export function guardarConfigEmail(config: EmailConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

// Eliminar la configuración de email
export function eliminarConfigEmail(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Validar la configuración de email
export function validarConfigEmail(config: Partial<EmailConfig>): { valido: boolean; errores: string[] } {
  const errores: string[] = [];

  if (!config.email || !config.email.includes('@')) {
    errores.push('Email inválido');
  }

  if (!config.password || config.password.length < 6) {
    errores.push('Contraseña requerida (mínimo 6 caracteres)');
  }

  if (!config.smtpHost) {
    errores.push('Host SMTP requerido');
  }

  if (!config.smtpPort || config.smtpPort < 1 || config.smtpPort > 65535) {
    errores.push('Puerto SMTP inválido');
  }

  if (!config.fromName || config.fromName.trim().length === 0) {
    errores.push('Nombre del remitente requerido');
  }

  return {
    valido: errores.length === 0,
    errores
  };
}

// Simular prueba de conexión (en producción, esto se haría en el backend)
export async function probarConexionEmail(config: EmailConfig): Promise<{ exito: boolean; mensaje: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulación de prueba de conexión
      const resultado = validarConfigEmail(config);
      
      if (!resultado.valido) {
        resolve({
          exito: false,
          mensaje: `Errores de configuración: ${resultado.errores.join(', ')}`
        });
        return;
      }

      // En un entorno real, aquí se haría una llamada al backend para probar la conexión
      resolve({
        exito: true,
        mensaje: 'Conexión exitosa con el servidor SMTP'
      });
    }, 1500);
  });
}

// Simular envío de email (en producción, esto se haría en el backend)
export async function enviarEmail(
  destinatarios: string[],
  asunto: string,
  mensaje: string,
  config?: EmailConfig
): Promise<{ exito: boolean; mensaje: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const emailConfig = config || obtenerConfigEmail();
      
      if (!emailConfig || !emailConfig.isConfigured) {
        resolve({
          exito: false,
          mensaje: 'No hay configuración de email configurada'
        });
        return;
      }

      // Simulación de envío
      console.log('📧 Email enviado (simulación):', {
        de: `${emailConfig.fromName} <${emailConfig.email}>`,
        para: destinatarios,
        asunto: asunto,
        mensaje: mensaje,
        servidor: emailConfig.smtpHost,
        puerto: emailConfig.smtpPort,
        fecha: new Date().toISOString()
      });

      resolve({
        exito: true,
        mensaje: `Email enviado exitosamente a ${destinatarios.length} destinatario(s)`
      });
    }, 1000);
  });
}

// Obtener estadísticas de emails (mock)
export function obtenerEstadisticasEmail() {
  return {
    enviados: 0,
    fallidos: 0,
    ultimoEnvio: null
  };
}
