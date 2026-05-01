import React from 'react';
import { Lock, AlertCircle } from 'lucide-react';
import { usePermisos } from '../stores/usePermisos';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { useTranslation } from 'react-i18next';

interface ProtectedComponentProps {
  permisoRequerido?: string;
  permisosRequeridos?: string[];
  requiereTodos?: boolean; // Si es true, requiere todos los permisos. Si es false, con uno es suficiente
  children: React.ReactNode;
  fallback?: React.ReactNode;
  mostrarAlerta?: boolean;
}

/**
 * Componente para proteger secciones que requieren permisos específicos
 */
export function ProtectedComponent({
  permisoRequerido,
  permisosRequeridos,
  requiereTodos = false,
  children,
  fallback,
  mostrarAlerta = true,
}: ProtectedComponentProps) {
  const { tienePermiso, tieneAlgunPermiso, tieneTodosPermisos } = usePermisos();
  const { t } = useTranslation();

  // Determinar si el usuario tiene acceso
  let tieneAcceso = true;

  if (permisoRequerido) {
    tieneAcceso = tienePermiso(permisoRequerido);
  } else if (permisosRequeridos && permisosRequeridos.length > 0) {
    tieneAcceso = requiereTodos
      ? tieneTodosPermisos(permisosRequeridos)
      : tieneAlgunPermiso(permisosRequeridos);
  }

  // Si tiene acceso, mostrar el contenido
  if (tieneAcceso) {
    return <>{children}</>;
  }

  // Si no tiene acceso y se proporcionó un fallback personalizado
  if (fallback) {
    return <>{fallback}</>;
  }

  // Si no tiene acceso y se debe mostrar una alerta
  if (mostrarAlerta) {
    return (
      <div className="p-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <Lock className="h-5 w-5" />
          <AlertTitle className="ml-2">Acceso Denegado</AlertTitle>
          <AlertDescription className="ml-2 mt-2">
            No tienes los permisos necesarios para acceder a esta función. Por favor, contacta con
            un administrador si necesitas acceso.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Si no se debe mostrar nada
  return null;
}

/**
 * Componente para mostrar un botón solo si el usuario tiene permisos
 */
interface ProtectedButtonProps {
  permisoRequerido: string;
  children: React.ReactNode;
  onClick?: () => void;
  [key: string]: any; // Otras props del botón
}

export function ProtectedButton({
  permisoRequerido,
  children,
  onClick,
  ...props
}: ProtectedButtonProps) {
  const { tienePermiso } = usePermisos();

  if (!tienePermiso(permisoRequerido)) {
    return null;
  }

  return (
    <Button onClick={onClick} {...props}>
      {children}
    </Button>
  );
}

/**
 * HOC para proteger páginas completas
 */
export function withPermission(
  Component: React.ComponentType<any>,
  permisoRequerido: string
) {
  return function ProtectedPage(props: any) {
    const { tienePermiso } = usePermisos();

    if (!tienePermiso(permisoRequerido)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4F4F4]">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
            <Lock className="w-16 h-16 mx-auto text-[#DC3545] mb-4" />
            <h2
              className="text-2xl text-[#333333] mb-2"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 600 }}
            >
              Acceso Restringido
            </h2>
            <p className="text-[#666666] mb-6">
              No tienes permisos para acceder a esta página.
            </p>
            <Button
              onClick={() => window.history.back()}
              className="bg-[#1E73BE] hover:bg-[#155a8a]"
            >
              Volver
            </Button>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

/**
 * Hook personalizado para verificar permisos de forma declarativa
 */
export function useRequirePermission(permisoRequerido: string) {
  const { tienePermiso } = usePermisos();
  return tienePermiso(permisoRequerido);
}
