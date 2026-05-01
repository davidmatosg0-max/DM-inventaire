const VEHICULOS_KEY = 'banque_alimentaire_transporte_ui_vehiculos';
const RUTAS_KEY = 'banque_alimentaire_transporte_ui_rutas';
const CHOFERES_KEY = 'banque_alimentaire_transporte_ui_choferes';

export const TRANSPORTE_MODULE_EVENT = 'transporte-ui-actualizado';

function puedeUsarStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function leerLista<T>(key: string, fallback: T[]): T[] {
  if (!puedeUsarStorage()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    console.error(`Error leyendo ${key}:`, error);
    return fallback;
  }
}

function guardarLista<T>(key: string, data: T[], scope: string): boolean {
  if (!puedeUsarStorage()) {
    return false;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent(TRANSPORTE_MODULE_EVENT, {
      detail: { scope }
    }));
    return true;
  } catch (error) {
    console.error(`Error guardando ${key}:`, error);
    return false;
  }
}

export function obtenerVehiculosTransporte<T>(fallback: T[] = []): T[] {
  return leerLista(VEHICULOS_KEY, fallback);
}

export function guardarVehiculosTransporte<T>(vehiculos: T[]): boolean {
  return guardarLista(VEHICULOS_KEY, vehiculos, 'vehiculos');
}

export function obtenerRutasTransporte<T>(fallback: T[] = []): T[] {
  return leerLista(RUTAS_KEY, fallback);
}

export function guardarRutasTransporte<T>(rutas: T[]): boolean {
  return guardarLista(RUTAS_KEY, rutas, 'rutas');
}

export function obtenerChoferesTransporte<T>(fallback: T[] = []): T[] {
  return leerLista(CHOFERES_KEY, fallback);
}

export function guardarChoferesTransporte<T>(choferes: T[]): boolean {
  return guardarLista(CHOFERES_KEY, choferes, 'choferes');
}

export function obtenerResumenModuloTransporte() {
  const vehiculos = obtenerVehiculosTransporte<{ activo?: boolean }>([]);
  const rutas = obtenerRutasTransporte<{ estado?: string }>([]);

  return {
    totalVehiculos: vehiculos.filter(vehiculo => vehiculo?.activo !== false).length,
    rutasPlanificadas: rutas.filter(ruta => ruta?.estado === 'planificada').length,
    rutasEnCurso: rutas.filter(ruta => ruta?.estado === 'en_curso').length,
    rutasCompletadas: rutas.filter(ruta => ruta?.estado === 'completada').length,
  };
}
