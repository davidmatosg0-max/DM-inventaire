export interface LocationZone {
  zona: string;
  tipo: string;
  cantidad: number;
}

export interface LocationSection {
  codigoZona: string;
  tipoZona: string;
  ubicaciones: string[];
}

export interface LocationConflict {
  ubicacion: string;
  zonas: string[];
}

export const LOCATION_ZONES_STORAGE_KEY = 'zonasAlmacen';

export const DEFAULT_LOCATION_ZONES: LocationZone[] = [
  { zona: 'A', tipo: 'Estantería', cantidad: 10 },
  { zona: 'B', tipo: 'Estantería', cantidad: 10 },
  { zona: 'C', tipo: 'Cámara Fría', cantidad: 5 },
  { zona: 'D', tipo: 'Almacén Seco', cantidad: 8 },
  { zona: 'E', tipo: 'Congelador', cantidad: 4 },
];

function normalizeLocationZone(zone: Partial<LocationZone> | null | undefined): LocationZone | null {
  if (!zone || typeof zone.zona !== 'string') {
    return null;
  }

  const zona = zone.zona.trim().toUpperCase();
  const tipo = typeof zone.tipo === 'string' && zone.tipo.trim() ? zone.tipo.trim() : 'Estantería';
  const cantidad = typeof zone.cantidad === 'number' ? Math.max(1, Math.round(zone.cantidad)) : NaN;

  if (!zona || !Number.isFinite(cantidad)) {
    return null;
  }

  return { zona, tipo, cantidad };
}

function normalizeLocationValue(value?: string | null) {
  return typeof value === 'string' ? value.trim().toUpperCase() : '';
}

function normalizeLocationComparisonValue(value?: string | null) {
  const normalizedValue = normalizeLocationValue(value);
  if (!normalizedValue) {
    return '';
  }

  const compactValue = normalizedValue.replace(/[\s_-]+/g, '');
  const numericSuffixMatch = compactValue.match(/^(.*?)(\d+)$/);

  if (!numericSuffixMatch) {
    return compactValue;
  }

  const [, prefix, numericSuffix] = numericSuffixMatch;
  return `${prefix}${Number.parseInt(numericSuffix, 10)}`;
}

export function buildLocationCode(zoneCode: string, slotNumber: number) {
  const normalizedZoneCode = normalizeLocationValue(zoneCode);
  const normalizedSlotNumber = Math.max(1, Math.round(slotNumber));

  if (!normalizedZoneCode) {
    return '';
  }

  return `${normalizedZoneCode}${normalizedSlotNumber}`;
}

export function buildLocationCodesForZone(zone: LocationZone) {
  const normalizedZone = normalizeLocationZone(zone);
  if (!normalizedZone) {
    return [];
  }

  return Array.from({ length: normalizedZone.cantidad }, (_, index) =>
    buildLocationCode(normalizedZone.zona, index + 1)
  );
}

export function buildLocationRangeLabel(zone: LocationZone) {
  const locationCodes = buildLocationCodesForZone(zone);

  if (locationCodes.length === 0) {
    return '';
  }

  if (locationCodes.length === 1) {
    return locationCodes[0];
  }

  return `${locationCodes[0]} a ${locationCodes[locationCodes.length - 1]}`;
}

export function findLocationConflicts(zones: LocationZone[]): LocationConflict[] {
  const conflictMap = new Map<string, Set<string>>();

  zones.forEach((zone) => {
    const normalizedZone = normalizeLocationZone(zone);
    if (!normalizedZone) {
      return;
    }

    buildLocationCodesForZone(normalizedZone).forEach((locationCode) => {
      const zonesForLocation = conflictMap.get(locationCode) || new Set<string>();
      zonesForLocation.add(normalizedZone.zona);
      conflictMap.set(locationCode, zonesForLocation);
    });
  });

  return Array.from(conflictMap.entries())
    .filter(([, zonesForLocation]) => zonesForLocation.size > 1)
    .map(([ubicacion, zonesForLocation]) => ({
      ubicacion,
      zonas: Array.from(zonesForLocation).sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' })),
    }))
    .sort((left, right) => left.ubicacion.localeCompare(right.ubicacion, undefined, { numeric: true, sensitivity: 'base' }));
}

export function loadLocationZones(): LocationZone[] {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCATION_ZONES;
  }

  const storedZones = window.localStorage.getItem(LOCATION_ZONES_STORAGE_KEY);
  if (!storedZones) {
    return DEFAULT_LOCATION_ZONES;
  }

  try {
    const parsed = JSON.parse(storedZones);
    if (!Array.isArray(parsed)) {
      return DEFAULT_LOCATION_ZONES;
    }

    const normalizedZones = parsed
      .map((zone) => normalizeLocationZone(zone))
      .filter((zone): zone is LocationZone => Boolean(zone));

    return normalizedZones.length > 0 ? normalizedZones : DEFAULT_LOCATION_ZONES;
  } catch (error) {
    console.error('Error al cargar zonas:', error);
    return DEFAULT_LOCATION_ZONES;
  }
}

export function saveLocationZones(zones: LocationZone[]) {
  if (typeof window === 'undefined') {
    return;
  }

  const normalizedZones = zones
    .map((zone) => normalizeLocationZone(zone))
    .filter((zone): zone is LocationZone => Boolean(zone));

  window.localStorage.setItem(
    LOCATION_ZONES_STORAGE_KEY,
    JSON.stringify(normalizedZones.length > 0 ? normalizedZones : DEFAULT_LOCATION_ZONES)
  );
}

export function buildLocationOptions(zones: LocationZone[], extraLocations: string[] = []) {
  const generatedLocations = zones.flatMap((zone) => buildLocationCodesForZone(zone));

  const normalizedExtraLocations = extraLocations
    .filter((location): location is string => typeof location === 'string' && location.trim() !== '')
    .map((location) => normalizeLocationValue(location));

  return Array.from(new Set([...generatedLocations, ...normalizedExtraLocations])).sort((left, right) =>
    left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' })
  );
}

export function buildLocationSections(zones: LocationZone[], extraLocations: string[] = []): LocationSection[] {
  const secciones = zones.map((zona) => ({
    codigoZona: zona.zona,
    tipoZona: zona.tipo,
    ubicaciones: buildLocationCodesForZone(zona),
  }));

  const generatedLocations = new Set(
    secciones.flatMap((seccion) => seccion.ubicaciones.map((ubicacion) => normalizeLocationValue(ubicacion)))
  );

  const ubicacionesExtra = buildLocationOptions([], extraLocations).filter(
    (ubicacion) => !generatedLocations.has(normalizeLocationValue(ubicacion))
  );

  if (ubicacionesExtra.length > 0) {
    secciones.push({
      codigoZona: 'AUTRES',
      tipoZona: 'Emplacements déjà utilisés hors configuration Étiquettes',
      ubicaciones: ubicacionesExtra,
    });
  }

  return secciones;
}

export function resolveStandardLocation(input: string, allowedLocations: string[]) {
  const normalizedInput = normalizeLocationValue(input);
  if (!normalizedInput) {
    return null;
  }

  return allowedLocations.find((location) => normalizeLocationValue(location) === normalizedInput) || null;
}

export function resolveLegacyLocation(input: string, allowedLocations: string[]) {
  const exactMatch = resolveStandardLocation(input, allowedLocations);
  if (exactMatch) {
    return exactMatch;
  }

  const normalizedInput = normalizeLocationComparisonValue(input);
  if (!normalizedInput) {
    return null;
  }

  const matches = allowedLocations.filter(
    (location) => normalizeLocationComparisonValue(location) === normalizedInput
  );

  return matches.length === 1 ? matches[0] : null;
}