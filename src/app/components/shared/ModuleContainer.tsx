import React from 'react';
import { useBranding } from '../../../hooks/useBranding';

interface ModuleContainerProps {
  children: React.ReactNode;
  className?: string;
  withGradient?: boolean;
  withShapes?: boolean;
}

export function ModuleContainer({ 
  children, 
  className = '',
  withGradient = true,
  withShapes = true 
}: ModuleContainerProps) {
  const branding = useBranding();

  return (
    <div className="min-h-screen relative">
      {/* Fondo degradado */}
      {withGradient && (
        <div
          className="fixed inset-0 -z-10"
          style={{
            background: `linear-gradient(135deg, ${branding.primaryColor}15 0%, ${branding.secondaryColor}10 50%, ${branding.primaryColor}08 100%)`,
          }}
        />
      )}

      {/* Formas decorativas animadas */}
      {withShapes && (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
            style={{
              background: `radial-gradient(circle, ${branding.secondaryColor} 0%, transparent 70%)`,
            }}
          />
          <div
            className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
            style={{
              background: `radial-gradient(circle, ${branding.primaryColor} 0%, transparent 70%)`,
              animationDelay: '1s',
            }}
          />
        </div>
      )}

      {/* Contenedor principal */}
      <div className={`relative z-10 p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 ${className}`}>
        {children}
      </div>
    </div>
  );
}
