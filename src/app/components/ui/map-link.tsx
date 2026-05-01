import React from 'react';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';
import { Button } from './button';
import { getGoogleMapsLink, openInGoogleMaps, openDirectionsInGoogleMaps } from '../../utils/maps';

interface MapLinkProps {
  direccion: string;
  className?: string;
  showIcon?: boolean;
  variant?: 'link' | 'button' | 'inline';
  size?: 'sm' | 'default' | 'lg';
}

export function MapLink({ 
  direccion, 
  className = '', 
  showIcon = true, 
  variant = 'link',
  size = 'default'
}: MapLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openInGoogleMaps(direccion);
  };

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        size={size === 'default' ? 'default' : 'sm'}
        onClick={handleClick}
        className={className}
      >
        {showIcon && <MapPin className="w-4 h-4 mr-2" />}
        Ver en Mapa
        <ExternalLink className="w-3 h-3 ml-2" />
      </Button>
    );
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-1 text-[#1E73BE] hover:text-[#1557A0] hover:underline ${className}`}
      >
        {showIcon && <MapPin className="w-3 h-3" />}
        <span className="text-sm">{direccion}</span>
        <ExternalLink className="w-3 h-3" />
      </button>
    );
  }

  return (
    <a
      href={getGoogleMapsLink(direccion)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-1 text-[#1E73BE] hover:text-[#1557A0] hover:underline ${className}`}
    >
      {showIcon && <MapPin className="w-4 h-4" />}
      <span>{direccion}</span>
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

interface DirectionsButtonProps {
  origen: string;
  destino: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export function DirectionsButton({ 
  origen, 
  destino, 
  className = '',
  size = 'default'
}: DirectionsButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openDirectionsInGoogleMaps(origen, destino);
  };

  return (
    <Button
      variant="outline"
      size={size === 'default' ? 'default' : 'sm'}
      onClick={handleClick}
      className={className}
    >
      <Navigation className="w-4 h-4 mr-2" />
      Cómo Llegar
      <ExternalLink className="w-3 h-3 ml-2" />
    </Button>
  );
}

interface EmbeddedMapProps {
  direccion?: string;
  lat?: number;
  lng?: number;
  zoom?: number;
  height?: string;
  className?: string;
}

export function EmbeddedMap({ 
  direccion, 
  lat, 
  lng, 
  zoom = 15, 
  height = '400px',
  className = ''
}: EmbeddedMapProps) {
  let mapUrl = '';
  
  if (lat !== undefined && lng !== undefined) {
    mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
  } else if (direccion) {
    const encodedAddress = encodeURIComponent(direccion);
    mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&z=${zoom}&output=embed`;
  }

  if (!mapUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <p className="text-gray-500">No hay información de ubicación</p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ height }}>
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Mapa de ubicación"
      />
    </div>
  );
}
