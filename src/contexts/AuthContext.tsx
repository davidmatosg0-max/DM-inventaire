/**
 * Contexto de Autenticación Híbrido JWT + API Keys
 * Banque Alimentaire PRO v5.0
 * Última actualización: 2026-03-17 - Soporte para nombre y apellido en JWT
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  generarTokens,
  validarToken,
  refrescarAccessToken,
  obtenerAccessToken,
  obtenerRefreshToken,
  cerrarSesion as cerrarSesionJWT,
  obtenerUsuarioDesdeToken,
  estaAutenticado as verificarAutenticacion,
  tienePermiso as verificarPermiso,
  generarTokenOrganismo,
  type JWTPayload,
  type AuthTokens,
} from '../app/utils/jwtManager';
import { validarCredenciales } from '../app/utils/usuarios';
import { guardarUsuarioSesion } from '../app/utils/sesionStorage';

interface AuthContextType {
  // Estado de autenticación
  isAuthenticated: boolean;
  isLoading: boolean;
  usuario: JWTPayload | null;
  
  // Métodos de autenticación
  login: (username: string, password: string, recordar?: boolean) => Promise<boolean>;
  loginOrganismo: (claveAcceso: string) => Promise<boolean>;
  logout: () => void;
  refrescarSesion: () => Promise<boolean>;
  
  // Verificación de permisos
  tienePermiso: (permiso: string) => boolean;
  esAdmin: () => boolean;
  esDeveloper: () => boolean;
  
  // Tokens
  accessToken: string | null;
  refreshToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [usuario, setUsuario] = useState<JWTPayload | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  // Verificar autenticación al cargar
  useEffect(() => {
    verificarSesion();
  }, []);

  // Auto-refresh del token antes de que expire
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(async () => {
      const token = obtenerAccessToken();
      if (token) {
        const validation = await validarToken(token);
        
        // Si el token expira en menos de 2 minutos, refrescar
        if (validation.payload?.exp) {
          const tiempoRestante = validation.payload.exp - Math.floor(Date.now() / 1000);
          if (tiempoRestante < 120) { // 2 minutos
            await refrescarSesion();
          }
        }
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  /**
   * Verifica la sesión actual
   */
  const verificarSesion = async () => {
    try {
      setIsLoading(true);
      
      const token = obtenerAccessToken();
      if (!token) {
        setIsAuthenticated(false);
        setUsuario(null);
        setAccessToken(null);
        setRefreshToken(null);
        setIsLoading(false);
        return;
      }

      const validation = await validarToken(token);
      
      if (validation.valid && validation.payload) {
        setIsAuthenticated(true);
        setUsuario(validation.payload);
        setAccessToken(token);
        setRefreshToken(obtenerRefreshToken());
      } else if (validation.expired) {
        // Intentar refrescar el token
        const refrescado = await refrescarSesion();
        if (!refrescado) {
          setIsAuthenticated(false);
          setUsuario(null);
          setAccessToken(null);
          setRefreshToken(null);
        }
      } else {
        setIsAuthenticated(false);
        setUsuario(null);
        setAccessToken(null);
        setRefreshToken(null);
      }
    } catch (error) {
      console.error('Error al verificar sesión:', error);
      setIsAuthenticated(false);
      setUsuario(null);
      setAccessToken(null);
      setRefreshToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login de usuario normal
   */
  const login = async (username: string, password: string, recordar: boolean = false): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Validar credenciales
      const usuarioValidado = validarCredenciales(username, password);
      
      if (!usuarioValidado) {
        return false;
      }

      // Generar tokens JWT
      const tokens = await generarTokens({
        id: usuarioValidado.id,
        nombre: usuarioValidado.nombre,
        apellido: usuarioValidado.apellido,
        email: usuarioValidado.email,
        rol: usuarioValidado.rol,
        permisos: usuarioValidado.permisos,
      });

      // Actualizar estado
      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
      setIsAuthenticated(true);

      // Decodificar el token para obtener el payload
      const validation = await validarToken(tokens.accessToken);
      if (validation.payload) {
        setUsuario(validation.payload);
        
        // Guardar usuario en sesión para el sistema de permisos
        guardarUsuarioSesion(validation.payload);
      }

      // Si "recordar", mantener en localStorage
      if (recordar) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('authTimestamp', Date.now().toString());
      } else {
        sessionStorage.setItem('isAuthenticated', 'true');
      }

      return true;
    } catch (error) {
      console.error('Error en login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login para organismos (portal público)
   */
  const loginOrganismo = async (claveAcceso: string): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Validar clave de acceso (simulado - en producción iría a API)
      // Por ahora, usar la clave de ejemplo
      if (claveAcceso !== 'CAC-456ABC') {
        return false;
      }

      // Generar token para organismo
      const tokens = await generarTokenOrganismo({
        id: 'org_ejemplo',
        nombre: 'Centre d\'Aide Communautaire Exemple',
        claveAcceso,
      });

      // Actualizar estado
      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
      setIsAuthenticated(true);

      const validation = await validarToken(tokens.accessToken);
      if (validation.payload) {
        setUsuario(validation.payload);
      }

      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('isOrganismoPortal', 'true');

      return true;
    } catch (error) {
      console.error('Error en login organismo:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = () => {
    cerrarSesionJWT();
    setIsAuthenticated(false);
    setUsuario(null);
    setAccessToken(null);
    setRefreshToken(null);
    sessionStorage.removeItem('isOrganismoPortal');
  };

  /**
   * Refrescar la sesión usando el refresh token
   */
  const refrescarSesion = async (): Promise<boolean> => {
    try {
      const currentRefreshToken = obtenerRefreshToken();
      if (!currentRefreshToken) {
        return false;
      }

      const nuevosTokens = await refrescarAccessToken(currentRefreshToken);
      if (!nuevosTokens) {
        return false;
      }

      setAccessToken(nuevosTokens.accessToken);
      setRefreshToken(nuevosTokens.refreshToken);

      const validation = await validarToken(nuevosTokens.accessToken);
      if (validation.payload) {
        setUsuario(validation.payload);
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error al refrescar sesión:', error);
      return false;
    }
  };

  /**
   * Verificar si tiene un permiso específico
   */
  const tienePermiso = (permiso: string): boolean => {
    if (!usuario) return false;
    return verificarPermiso(permiso);
  };

  /**
   * Verificar si es administrador
   */
  const esAdmin = (): boolean => {
    return usuario?.role === 'Administrador';
  };

  /**
   * Verificar si es desarrollador
   */
  const esDeveloper = (): boolean => {
    return usuario?.role === 'Desarrollador';
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    usuario,
    login,
    loginOrganismo,
    logout,
    refrescarSesion,
    tienePermiso,
    esAdmin,
    esDeveloper,
    accessToken,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para usar el contexto de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
}

/**
 * HOC para proteger rutas que requieren autenticación
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d7a]"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Accès refusé
            </h2>
            <p className="text-gray-600">
              Vous devez être connecté pour accéder à cette page
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

/**
 * HOC para proteger rutas que requieren permisos específicos
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: string
) {
  return function PermissionProtectedComponent(props: P) {
    const { isAuthenticated, isLoading, tienePermiso } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a4d7a]"></div>
        </div>
      );
    }

    if (!isAuthenticated || !tienePermiso(requiredPermission)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Accès refusé
            </h2>
            <p className="text-gray-600">
              Vous n'avez pas les permissions nécessaires
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}