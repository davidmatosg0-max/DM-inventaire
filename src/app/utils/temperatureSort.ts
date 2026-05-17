type TemperatureValue = string | null | undefined;

const TEMPERATURE_ORDER = {
  ambiente: 0,
  refrigerado: 1,
  congelado: 2,
} as const;

export function normalizeTemperatureValue(value: TemperatureValue): keyof typeof TEMPERATURE_ORDER {
  const normalized = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

  if (normalized.includes('congel')) {
    return 'congelado';
  }

  if (normalized.includes('refrig')) {
    return 'refrigerado';
  }

  if (normalized.includes('seco') || normalized.includes('ambian')) {
    return 'ambiente';
  }

  return 'ambiente';
}

export function getTemperatureSortOrder(value: TemperatureValue): number {
  return TEMPERATURE_ORDER[normalizeTemperatureValue(value)];
}

export function sortByTemperature<T>(
  items: T[],
  getTemperature: (item: T) => TemperatureValue,
  secondaryComparator?: (a: T, b: T) => number,
): T[] {
  return [...items].sort((a, b) => {
    const temperatureDiff = getTemperatureSortOrder(getTemperature(a)) - getTemperatureSortOrder(getTemperature(b));

    if (temperatureDiff !== 0) {
      return temperatureDiff;
    }

    return secondaryComparator ? secondaryComparator(a, b) : 0;
  });
}