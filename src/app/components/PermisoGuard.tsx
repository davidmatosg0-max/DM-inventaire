// Componente para proteger acciones basadas en permisos
import React, { ReactNode } from 'react';
import { tienePermiso, soloLectura, esCoordinador } from '../utils/permisos';
import { toast } from 'sonner';
import { Shield, Lock } from 'lucide-react';
import { Badge } from './ui/badge';

interface PermisoGuardProps {
  children: ReactNode;
  permiso?: string;
  permisos?: string[];
  requireAll?: boolean; // Si es true, requiere TODOS los permisos; si es false, requiere AL MENOS UNO
  fallback?: ReactNode;
  showMessage?: boolean;
  disabled?: boolean;
  onUnauthorized?: () => void;
}

/**
 * Componente que protege contenido basándose en permisos
 * Si el usuario no tiene permisos, muestra un fallback o no muestra nada
 */
export function PermisoGuard({
  children,
  permiso,
  permisos = [],
  requireAll = false,
  fallback = null,
  showMessage = false,
  disabled = false,
  onUnauthorized
}: PermisoGuardProps) {
  const permisosAVerificar = permiso ? [permiso] : permisos;
  
  if (permisosAVerificar.length === 0) {
    // Si no se especifican permisos, mostrar el contenido
    return <>{children}</>;
  }
  
  let tieneAcceso = false;
  
  if (requireAll) {
    // Requiere TODOS los permisos
    tieneAcceso = permisosAVerificar.every(p => tienePermiso(p));
  } else {
    // Requiere AL MENOS UNO
    tieneAcceso = permisosAVerificar.some(p => tienePermiso(p));
  }
  
  if (!tieneAcceso) {
    if (onUnauthorized) {
      onUnauthorized();
    }
    
    if (showMessage) {
      return (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <Lock className="w-4 h-4" />
          <span>Vous n'avez pas les permissions nécessaires pour cette action.</span>
        </div>
      );
    }
    
    return <>{fallback}</>;
  }
  
  if (disabled) {
    return <>{fallback || children}</>;
  }
  
  return <>{children}</>;
}

interface ProtectedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permiso?: string;
  permisos?: string[];
  requireAll?: boolean;
  showToast?: boolean;
  toastMessage?: string;
  children: ReactNode;
}

/**
 * Botón que se deshabilita si el usuario no tiene permisos
 */
export function ProtectedButton({
  permiso,
  permisos = [],
  requireAll = false,
  showToast = true,
  toastMessage,
  children,
  onClick,
  disabled,
  className = '',
  ...props
}: ProtectedButtonProps) {
  const permisosAVerificar = permiso ? [permiso] : permisos;
  
  let tieneAcceso = true;
  
  if (permisosAVerificar.length > 0) {
    if (requireAll) {
      tieneAcceso = permisosAVerificar.every(p => tienePermiso(p));
    } else {
      tieneAcceso = permisosAVerificar.some(p => tienePermiso(p));
    }
  }
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!tieneAcceso) {
      e.preventDefault();
      e.stopPropagation();
      
      if (showToast) {
        toast.error(
          toastMessage || "Vous n'avez pas les permissions nécessaires pour cette action.",
          {
            icon: <Lock className="w-4 h-4" />,
            duration: 3000
          }
        );
      }
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };
  
  const isDisabled = disabled || !tieneAcceso;
  
  return (
    <button
      {...props}
      onClick={handleClick}
      disabled={isDisabled}
      className={`${className} ${!tieneAcceso ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={!tieneAcceso ? "Permission refusée" : props.title}
    >
      {children}
      {!tieneAcceso && (
        <Lock className="w-3 h-3 ml-1 inline-block" />
      )}
    </button>
  );
}

interface ReadOnlyBadgeProps {
  show?: boolean;
  className?: string;
}

/**
 * Badge que se muestra cuando el usuario está en modo solo lectura
 */
export function ReadOnlyBadge({ show, className = '' }: ReadOnlyBadgeProps) {
  const mostrar = show !== undefined ? show : soloLectura();
  
  if (!mostrar) return null;
  
  return (
    <Badge 
      variant="outline" 
      className={`bg-amber-50 text-amber-700 border-amber-300 ${className}`}
    >
      <Shield className="w-3 h-3 mr-1" />
      Lecture Seule
    </Badge>
  );
}

/**
 * Badge que muestra el nivel de acceso del usuario
 */
export function AccessLevelBadge({ className = '' }: { className?: string }) {
  if (soloLectura()) {
    return (
      <Badge variant="outline" className={`bg-blue-50 text-blue-700 border-blue-300 ${className}`}>
        <Shield className="w-3 h-3 mr-1" />
        Lecture Seule
      </Badge>
    );
  }
  
  if (esCoordinador()) {
    return (
      <Badge variant="outline" className={`bg-green-50 text-green-700 border-green-300 ${className}`}>
        <Shield className="w-3 h-3 mr-1" />
        Coordinateur
      </Badge>
    );
  }
  
  return null;
}

interface ProtectedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  permiso?: string;
  permisos?: string[];
  requireAll?: boolean;
}

/**
 * Input que se deshabilita si el usuario no tiene permisos de edición
 */
export function ProtectedInput({
  permiso,
  permisos = [],
  requireAll = false,
  disabled,
  ...props
}: ProtectedInputProps) {
  const permisosAVerificar = permiso ? [permiso] : permisos;
  
  let tieneAcceso = true;
  
  if (permisosAVerificar.length > 0) {
    if (requireAll) {
      tieneAcceso = permisosAVerificar.every(p => tienePermiso(p));
    } else {
      tieneAcceso = permisosAVerificar.some(p => tienePermiso(p));
    }
  }
  
  const isDisabled = disabled || !tieneAcceso || soloLectura();
  
  return (
    <input
      {...props}
      disabled={isDisabled}
      className={`${props.className || ''} ${!tieneAcceso ? 'opacity-60 cursor-not-allowed' : ''}`}
    />
  );
}
