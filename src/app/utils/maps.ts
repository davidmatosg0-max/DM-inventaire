// Utilidades para integración con Google Maps

/**
 * Genera un enlace de Google Maps para una dirección
 */
export function getGoogleMapsLink(direccion: string): string {
  const encodedAddress = encodeURIComponent(direccion);
  return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
}

/**
 * Genera un enlace de Google Maps con coordenadas
 */
export function getGoogleMapsLinkWithCoords(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

/**
 * Genera un enlace de Google Maps Directions desde origen a destino
 */
export function getGoogleMapsDirections(origen: string, destino: string): string {
  const encodedOrigin = encodeURIComponent(origen);
  const encodedDestination = encodeURIComponent(destino);
  return `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDestination}`;
}

/**
 * Genera un enlace de Google Maps Directions con múltiples waypoints (paradas)
 */
export function getGoogleMapsMultipleStops(
  origen: string,
  paradas: string[],
  destino: string
): string {
  const encodedOrigin = encodeURIComponent(origen);
  const encodedDestination = encodeURIComponent(destino);
  const waypoints = paradas.map(p => encodeURIComponent(p)).join('|');
  
  if (paradas.length > 0) {
    return `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDestination}&waypoints=${waypoints}`;
  } else {
    return `https://www.google.com/maps/dir/?api=1&origin=${encodedOrigin}&destination=${encodedDestination}`;
  }
}

/**
 * Genera un enlace para vista de mapa embebido (iframe)
 */
export function getEmbeddedMapUrl(direccion: string): string {
  const encodedAddress = encodeURIComponent(direccion);
  return `https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodedAddress}`;
}

/**
 * Genera un enlace para vista de mapa embebido con coordenadas
 */
export function getEmbeddedMapUrlWithCoords(lat: number, lng: number, zoom: number = 15): string {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
}

/**
 * Abre Google Maps en una nueva pestaña
 */
export function openInGoogleMaps(direccion: string): void {
  const link = getGoogleMapsLink(direccion);
  window.open(link, '_blank', 'noopener,noreferrer');
}

/**
 * Abre Google Maps Directions en una nueva pestaña
 */
export function openDirectionsInGoogleMaps(origen: string, destino: string): void {
  const link = getGoogleMapsDirections(origen, destino);
  window.open(link, '_blank', 'noopener,noreferrer');
}

/**
 * Calcula distancia aproximada entre dos puntos (en km)
 * Fórmula de Haversine
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Redondear a 1 decimal
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
