const PAGE_ACCESO_ORGANISMO = 'acceso-organismo';

export function construirRutaAccesoOrganismo(claveAcceso?: string): string {
  const params = new URLSearchParams();
  params.set('page', PAGE_ACCESO_ORGANISMO);

  if (claveAcceso?.trim()) {
    params.set('clave', claveAcceso.trim());
  }

  return `/?${params.toString()}`;
}

export function construirUrlAccesoOrganismo(claveAcceso?: string): string {
  const ruta = construirRutaAccesoOrganismo(claveAcceso);

  if (typeof window === 'undefined') {
    return ruta;
  }

  return `${window.location.origin}${ruta}`;
}