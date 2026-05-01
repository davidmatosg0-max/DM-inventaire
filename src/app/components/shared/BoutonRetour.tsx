import React from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useBranding } from '../../../hooks/useBranding';

interface BoutonRetourProps {
  onClick: () => void;
  label?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'icon';
  className?: string;
  disabled?: boolean;
}

export function BoutonRetour({ 
  onClick, 
  label = 'Retour', 
  variant = 'outline',
  className = '',
  disabled = false 
}: BoutonRetourProps) {
  const branding = useBranding();

  if (variant === 'icon') {
    return (
      <Button
        onClick={onClick}
        variant="ghost"
        size="icon"
        className={`hover:bg-[#F4F4F4] ${className}`}
        disabled={disabled}
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 500
        }}
      >
        <X className="w-5 h-5" style={{ color: branding.primaryColor }} />
      </Button>
    );
  }

  return (
    <Button
      onClick={onClick}
      variant={variant}
      className={className}
      disabled={disabled}
      style={{
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 500,
        borderColor: variant === 'outline' ? branding.primaryColor : undefined,
        color: variant === 'outline' ? branding.primaryColor : undefined
      }}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      {label}
    </Button>
  );
}

// Variantes adicionales de botones de retorno
export function BoutonRetourFlottant({ onClick, label = 'Retour' }: { onClick: () => void; label?: string }) {
  const branding = useBranding();
  
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 z-50 px-6 py-3 rounded-xl shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2"
      style={{
        background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.primaryColor}dd 100%)`,
        color: 'white',
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 600
      }}
    >
      <ArrowLeft className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}

export function BoutonRetourHeader({ onClick, titre, label = 'Retour' }: { onClick: () => void; titre?: string; label?: string }) {
  const branding = useBranding();
  
  return (
    <div className="flex items-center justify-between mb-6">
      <Button
        onClick={onClick}
        variant="ghost"
        className="hover:bg-[#F4F4F4]"
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 500,
          color: branding.primaryColor
        }}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {label}
      </Button>
      {titre && (
        <h2 
          style={{ 
            fontFamily: 'Montserrat, sans-serif', 
            fontWeight: 700, 
            fontSize: '1.5rem',
            color: branding.primaryColor 
          }}
        >
          {titre}
        </h2>
      )}
    </div>
  );
}
