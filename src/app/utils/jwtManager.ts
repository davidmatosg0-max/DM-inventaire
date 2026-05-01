/**
 * Sistema de gestión de JWT (JSON Web Tokens) para Banque Alimentaire PRO
 * Versión: 5.0-PRO HÍBRIDA
 * Última actualización: 2026-03-17 - Soporte para nombre y apellido
 * 
 * Este módulo maneja la autenticación de usuarios humanos mediante JWT.
 * Los API Keys se mantienen para integraciones máquina-a-máquina.
 */

import * as jose from 'jose';

// Secreto para firmar los tokens (en producción, esto vendría de variables de entorno)
const JWT_SECRET = new TextEncoder().encode('banque_alimentaire_secret_key_2026_ultra_secure_pro_v5');
const REFRESH_SECRET = new TextEncoder().encode('banque_alimentaire_refresh_secret_key_2026_ultra_secure_pro_v5');

// Duración de los tokens en segundos
const ACCESS_TOKEN_DURATION = 15 * 60; // 15 minutos
const REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60; // 7 días

export interface JWTPayload {
  userId: string;
  username: string;
  nombre?: string;
  apellido?: string;
  email: string;
  role: string;
  permissions: string[];
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface DecodedToken {
  valid: boolean;
  expired: boolean;
  payload?: JWTPayload;
  error?: string;
}

const TOKENS_STORAGE_KEY = 'banque_auth_tokens';
const REFRESH_TOKENS_KEY = 'banque_refresh_tokens';

/**
 * Genera un par de tokens (access + refresh) para un usuario
 */
export async function generarTokens(usuario: {
  id: string;
  nombre: string;
  apellido?: string;
  email: string;
  rol: string;
  permisos: string[];
}): Promise<AuthTokens> {
  const payload = {
    userId: usuario.id,
    username: usuario.nombre,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    role: usuario.rol,
    permissions: usuario.permisos,
  };

  // Access Token (corta duración)
  const accessToken = await new jose.SignJWT({ ...payload, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ACCESS_TOKEN_DURATION)
    .sign(JWT_SECRET);

  // Refresh Token (larga duración)
  const refreshToken = await new jose.SignJWT({ ...payload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + REFRESH_TOKEN_DURATION)
    .sign(REFRESH_SECRET);

  // Guardar tokens en localStorage
  const tokens = {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_TOKEN_DURATION,
  };
  
  guardarTokens(tokens);

  // Guardar refresh token en una lista separada para revocación
  guardarRefreshToken(refreshToken, usuario.id);

  return tokens;
}

/**
 * Valida y decodifica un token
 */
export async function validarToken(token: string, isRefreshToken: boolean = false): Promise<DecodedToken> {
  try {
    const secret = isRefreshToken ? REFRESH_SECRET : JWT_SECRET;
    const { payload } = await jose.jwtVerify(token, secret);

    return {
      valid: true,
      expired: false,
      payload: payload as unknown as JWTPayload,
    };
  } catch (error: any) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      return {
        valid: false,
        expired: true,
        error: 'Token expirado',
      };
    }

    return {
      valid: false,
      expired: false,
      error: error.message || 'Token inválido',
    };
  }
}

/**
 * Refresca un access token usando un refresh token válido
 */
export async function refrescarAccessToken(refreshToken: string): Promise<AuthTokens | null> {
  // Validar refresh token
  const validation = await validarToken(refreshToken, true);

  if (!validation.valid || !validation.payload) {
    return null;
  }

  // Verificar que el refresh token no esté revocado
  if (!verificarRefreshTokenActivo(refreshToken)) {
    return null;
  }

  // Verificar que sea tipo refresh
  if (validation.payload.type !== 'refresh') {
    return null;
  }

  // Generar nuevo access token
  const newAccessToken = await new jose.SignJWT({
    userId: validation.payload.userId,
    username: validation.payload.username,
    email: validation.payload.email,
    role: validation.payload.role,
    permissions: validation.payload.permissions,
    type: 'access',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ACCESS_TOKEN_DURATION)
    .sign(JWT_SECRET);

  // Guardar nuevos tokens
  const tokens = {
    accessToken: newAccessToken,
    refreshToken, // Mantener el mismo refresh token
    expiresIn: ACCESS_TOKEN_DURATION,
  };

  guardarTokens(tokens);

  return tokens;
}

/**
 * Obtiene el access token actual del almacenamiento
 */
export function obtenerAccessToken(): string | null {
  try {
    const stored = localStorage.getItem(TOKENS_STORAGE_KEY);
    if (!stored) return null;

    const tokens = JSON.parse(stored);
    return tokens.accessToken || null;
  } catch {
    return null;
  }
}

/**
 * Obtiene el refresh token actual del almacenamiento
 */
export function obtenerRefreshToken(): string | null {
  try {
    const stored = localStorage.getItem(TOKENS_STORAGE_KEY);
    if (!stored) return null;

    const tokens = JSON.parse(stored);
    return tokens.refreshToken || null;
  } catch {
    return null;
  }
}

/**
 * Guarda tokens en localStorage
 */
function guardarTokens(tokens: AuthTokens): void {
  try {
    localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error('Error al guardar tokens:', error);
  }
}

/**
 * Guarda un refresh token en la lista de tokens activos
 */
function guardarRefreshToken(token: string, userId: string): void {
  try {
    const stored = localStorage.getItem(REFRESH_TOKENS_KEY);
    const tokens = stored ? JSON.parse(stored) : [];
    
    tokens.push({
      token,
      userId,
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem(REFRESH_TOKENS_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error('Error al guardar refresh token:', error);
  }
}

/**
 * Verifica si un refresh token está activo (no revocado)
 */
function verificarRefreshTokenActivo(token: string): boolean {
  try {
    const stored = localStorage.getItem(REFRESH_TOKENS_KEY);
    if (!stored) return false;

    const tokens = JSON.parse(stored);
    return tokens.some((t: any) => t.token === token);
  } catch {
    return false;
  }
}

/**
 * Revoca un refresh token específico
 */
export function revocarRefreshToken(token: string): boolean {
  try {
    const stored = localStorage.getItem(REFRESH_TOKENS_KEY);
    if (!stored) return false;

    const tokens = JSON.parse(stored);
    const filtered = tokens.filter((t: any) => t.token !== token);

    localStorage.setItem(REFRESH_TOKENS_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

/**
 * Revoca todos los refresh tokens de un usuario
 */
export function revocarTodosTokensUsuario(userId: string): boolean {
  try {
    const stored = localStorage.getItem(REFRESH_TOKENS_KEY);
    if (!stored) return false;

    const tokens = JSON.parse(stored);
    const filtered = tokens.filter((t: any) => t.userId !== userId);

    localStorage.setItem(REFRESH_TOKENS_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

/**
 * Cierra sesión (elimina todos los tokens)
 */
export function cerrarSesion(): void {
  try {
    const refreshToken = obtenerRefreshToken();
    if (refreshToken) {
      revocarRefreshToken(refreshToken);
    }

    localStorage.removeItem(TOKENS_STORAGE_KEY);
    sessionStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('authTimestamp');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
}

/**
 * Obtiene información del usuario actual desde el token
 */
export async function obtenerUsuarioDesdeToken(): Promise<JWTPayload | null> {
  const token = obtenerAccessToken();
  if (!token) return null;

  const validation = await validarToken(token);
  return validation.valid && validation.payload ? validation.payload : null;
}

/**
 * Verifica si el usuario está autenticado (tiene token válido)
 */
export async function estaAutenticado(): Promise<boolean> {
  const token = obtenerAccessToken();
  if (!token) return false;

  const validation = await validarToken(token);
  
  // Si el token expiró, intentar refrescar
  if (validation.expired) {
    const refreshToken = obtenerRefreshToken();
    if (refreshToken) {
      const nuevosTokens = await refrescarAccessToken(refreshToken);
      return nuevosTokens !== null;
    }
    return false;
  }

  return validation.valid;
}

/**
 * Middleware para verificar permisos
 */
export async function tienePermiso(permiso: string): Promise<boolean> {
  const usuario = await obtenerUsuarioDesdeToken();
  if (!usuario) return false;

  // Admin tiene todos los permisos
  if (usuario.role === 'Administrador' || usuario.role === 'Desarrollador') {
    return true;
  }

  return usuario.permissions.includes(permiso);
}

/**
 * Obtiene estadísticas de sesiones JWT
 */
export async function obtenerEstadisticasJWT(): Promise<{
  tokenActivo: boolean;
  tiempoRestante: number;
  usuario: string | null;
  rol: string | null;
  ultimoAcceso: string | null;
}> {
  const usuario = await obtenerUsuarioDesdeToken();
  
  if (!usuario) {
    return {
      tokenActivo: false,
      tiempoRestante: 0,
      usuario: null,
      rol: null,
      ultimoAcceso: null,
    };
  }

  const tiempoRestante = usuario.exp ? usuario.exp - Math.floor(Date.now() / 1000) : 0;

  return {
    tokenActivo: true,
    tiempoRestante: Math.max(0, tiempoRestante),
    usuario: usuario.username,
    rol: usuario.role,
    ultimoAcceso: new Date().toISOString(),
  };
}

/**
 * Genera un token para portal de organismos (con permisos limitados)
 */
export async function generarTokenOrganismo(organismo: {
  id: string;
  nombre: string;
  claveAcceso: string;
}): Promise<AuthTokens> {
  const payload = {
    userId: `org_${organismo.id}`,
    username: organismo.nombre,
    email: `${organismo.claveAcceso}@organismos.banque.local`,
    role: 'Organismo',
    permissions: [
      'read:ofertas',
      'write:comandas',
      'read:comandas_propias',
    ],
  };

  return generarTokens(payload);
}