import {
  resolverTemperaturaOriginalEntradaProducto,
} from './productTemperature';
import { normalizeTemperatureValue } from './temperatureSort';

type ComandaTemperatureSource = {
  categoria?: string;
  subcategoria?: string;
  nombre?: string;
  nombreProducto?: string;
  productoNombre?: string;
  temperatura?: string;
  temperaturaAlmacenamiento?: string;
  temperaturaOriginalEntrada?: string;
};

export type ComandaTemperatureKey = 'ambiente' | 'refrigerado' | 'congelado';

export const COMANDA_TEMPERATURE_GROUPS: Array<{ key: ComandaTemperatureKey; label: string }> = [
  { key: 'ambiente', label: 'Température ambiante' },
  { key: 'refrigerado', label: 'Réfrigéré' },
  { key: 'congelado', label: 'Congelé' },
];

export function resolveComandaTemperatureKey(value?: string): ComandaTemperatureKey {
  return normalizeTemperatureValue(value);
}

export function formatComandaTemperatureGroup(value?: string): string {
  switch (resolveComandaTemperatureKey(value)) {
    case 'congelado':
      return 'Congelé';
    case 'refrigerado':
      return 'Réfrigéré';
    default:
      return 'Température ambiante';
  }
}

export function resolveComandaStorageTemperature(
  item?: ComandaTemperatureSource | null,
  product?: ComandaTemperatureSource | null,
): string {
  return formatComandaTemperatureGroup(resolveComandaOriginalEntryTemperature(item, product));
}

export function resolveComandaStorageTemperatureKey(
  item?: ComandaTemperatureSource | null,
  product?: ComandaTemperatureSource | null,
): ComandaTemperatureKey {
  return resolveComandaTemperatureKey(resolveComandaStorageTemperature(item, product));
}

export function resolveComandaOriginalEntryTemperature(
  item?: ComandaTemperatureSource | null,
  product?: ComandaTemperatureSource | null,
) {
  return resolverTemperaturaOriginalEntradaProducto({
    ...(item || {}),
    categoria: item?.categoria,
    subcategoria: item?.subcategoria,
    nombre: item?.nombreProducto || item?.productoNombre || item?.nombre || product?.nombre,
    temperatura: product?.temperatura || item?.temperatura,
    temperaturaAlmacenamiento: product?.temperaturaAlmacenamiento || item?.temperaturaAlmacenamiento,
    temperaturaOriginalEntrada:
      product?.temperaturaOriginalEntrada ||
      item?.temperaturaOriginalEntrada,
  });
}
