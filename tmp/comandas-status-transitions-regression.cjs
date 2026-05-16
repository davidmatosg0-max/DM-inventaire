const path = require('path');
const vm = require('vm');
const { webcrypto } = require('crypto');
const esbuild = require('esbuild');

const repoRoot = path.resolve(__dirname, '..');
const comandaStoragePath = path.join(repoRoot, 'src', 'app', 'utils', 'comandaStorage.ts');
const inventoryReservationsPath = path.join(repoRoot, 'src', 'app', 'utils', 'inventoryReservations.ts');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message}. Esperado: ${expected}. Actual: ${actual}`);
  }
}

function createStorage() {
  const data = new Map();

  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    },
    clear() {
      data.clear();
    }
  };
}

function createWindow(storage) {
  const listeners = new Map();

  return {
    localStorage: storage,
    setTimeout,
    clearTimeout,
    dispatchEvent(event) {
      const handlers = listeners.get(event.type) || [];
      handlers.forEach(handler => handler(event));
      return true;
    },
    addEventListener(type, handler) {
      const handlers = listeners.get(type) || [];
      handlers.push(handler);
      listeners.set(type, handlers);
    },
    removeEventListener(type, handler) {
      const handlers = listeners.get(type) || [];
      listeners.set(type, handlers.filter(current => current !== handler));
    }
  };
}

function createContext(storage) {
  class Event {
    constructor(type) {
      this.type = type;
    }
  }

  class CustomEvent extends Event {
    constructor(type, init = {}) {
      super(type);
      this.detail = init.detail;
    }
  }

  const window = createWindow(storage);
  const context = {
    module: { exports: {} },
    exports: {},
    require,
    console,
    process,
    Buffer,
    setTimeout,
    clearTimeout,
    localStorage: storage,
    sessionStorage: createStorage(),
    window,
    Event,
    CustomEvent,
    crypto: webcrypto,
    navigator: { language: 'fr-CA' }
  };

  context.exports = context.module.exports;
  window.Event = Event;
  window.CustomEvent = CustomEvent;
  window.crypto = webcrypto;
  window.navigator = context.navigator;

  return context;
}

function stubbedModulePlugin() {
  return {
    name: 'stubbed-modules',
    setup(build) {
      build.onResolve({ filter: /^sonner$/ }, () => ({ path: 'sonner', namespace: 'stub' }));
      build.onResolve({ filter: /supabaseClient$/ }, () => ({ path: 'supabaseClient', namespace: 'stub' }));

      build.onLoad({ filter: /.*/, namespace: 'stub' }, (args) => {
        if (args.path === 'sonner') {
          return {
            contents: 'exports.toast = { error() {}, success() {}, info() {} };',
            loader: 'js'
          };
        }

        if (args.path === 'supabaseClient') {
          return {
            contents: 'exports.getSupabaseClient = () => null; exports.isSupabaseConfigured = () => false;',
            loader: 'js'
          };
        }

        return {
          contents: 'module.exports = {};',
          loader: 'js'
        };
      });
    }
  };
}

async function loadModule(entryPath, storage) {
  const buildResult = await esbuild.build({
    entryPoints: [entryPath],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    write: false,
    logLevel: 'silent',
    target: ['node18'],
    plugins: [stubbedModulePlugin()]
  });

  const bundledCode = buildResult.outputFiles[0].text;
  const context = createContext(storage);

  vm.runInNewContext(bundledCode, context, {
    filename: `${path.basename(entryPath)}.bundle.cjs`
  });

  return context.module.exports;
}

function seedUser(storage) {
  storage.setItem('usuario_sesion_banco_alimentos', JSON.stringify({
    id: 'user-test',
    nombre: 'Test',
    apellido: 'Runner'
  }));
}

function createProduct(overrides = {}) {
  return {
    id: overrides.id || 'prod-status-test',
    codigo: overrides.codigo || 'STATUS-001',
    nombre: overrides.nombre || 'Produit statut test',
    categoria: overrides.categoria || 'Légumes',
    subcategoria: overrides.subcategoria || 'Carottes',
    unidad: overrides.unidad || 'unidad',
    icono: overrides.icono || '🥕',
    peso: overrides.peso ?? 1,
    pesoUnitario: overrides.pesoUnitario ?? 1,
    pesoRegistrado: overrides.pesoRegistrado ?? 5,
    stockActual: overrides.stockActual ?? 5,
    stockMinimo: overrides.stockMinimo ?? 0,
    ubicacion: overrides.ubicacion || 'A1',
    lote: overrides.lote || 'LOT-STATUS',
    fechaVencimiento: overrides.fechaVencimiento || '2026-12-31',
    esPRS: false,
    activo: true,
    fechaCreacion: overrides.fechaCreacion || '2026-05-10T00:00:00.000Z',
    valorUnitario: overrides.valorUnitario ?? 3,
    valorTotal: overrides.valorTotal ?? 15,
    temperatura: overrides.temperatura || 'refrigerado',
    temperaturaAlmacenamiento: overrides.temperaturaAlmacenamiento || 'Refrigerado',
    temperaturaOriginalEntrada: overrides.temperaturaOriginalEntrada || 'refrigerado'
  };
}

function createComanda(overrides = {}) {
  return {
    id: overrides.id || 'cmd-status-test',
    numero: overrides.numero || 'CMD-STATUS-001',
    numeroComanda: overrides.numeroComanda || overrides.numero || 'CMD-STATUS-001',
    organismoId: overrides.organismoId || 'org-status-test',
    organismoNombre: overrides.organismoNombre || 'Organisme Status Test',
    nombreOrganismo: overrides.nombreOrganismo || overrides.organismoNombre || 'Organisme Status Test',
    fecha: overrides.fecha || '2026-05-10T00:00:00.000Z',
    fechaEntrega: overrides.fechaEntrega || '2026-05-11T00:00:00.000Z',
    observaciones: overrides.observaciones || 'Comanda de test de estados',
    items: overrides.items || [
      {
        productoId: 'prod-status-test',
        nombreProducto: 'Produit statut test',
        productoNombre: 'Produit statut test',
        cantidad: 2,
        cantidadEntregada: 0,
        unidad: 'unidad',
        icono: '🥕',
        valorUnitario: 3,
        peso: 2,
        temperatura: 'refrigerado',
        temperaturaOriginalEntrada: 'refrigerado'
      }
    ],
    valorTotal: overrides.valorTotal ?? 6,
    pesoTotal: overrides.pesoTotal ?? 2,
    estado: overrides.estado || 'pendiente',
    usuarioCreacion: overrides.usuarioCreacion || 'Test Runner',
    creadoPor: overrides.creadoPor || 'Test Runner'
  };
}

async function main() {
  const storage = createStorage();
  seedUser(storage);

  const comandaStorage = await loadModule(comandaStoragePath, storage);
  const inventoryReservations = await loadModule(inventoryReservationsPath, storage);

  storage.setItem('banco_alimentos_productos', JSON.stringify([createProduct()]));
  storage.setItem('banco_alimentos_comandas', JSON.stringify([createComanda()]));

  const reservaInicial = inventoryReservations.obtenerReservaInventarioProducto('prod-status-test');
  assertEqual(reservaInicial.reservadoEnComandas, 2, 'La comanda pendiente debe reservar inventario');
  assertEqual(reservaInicial.disponibleParaReservar, 3, 'La reserva inicial debe descontarse del disponible');

  const comandaPendiente = comandaStorage.obtenerComandaPorId('cmd-status-test');
  comandaStorage.actualizarComanda({ ...comandaPendiente, estado: 'anulada' });

  const comandaAnulada = comandaStorage.obtenerComandaPorId('cmd-status-test');
  assertEqual(comandaAnulada.estado, 'anulada', 'La comanda debe persistirse como anulada');

  const reservaLiberada = inventoryReservations.obtenerReservaInventarioProducto('prod-status-test');
  assertEqual(reservaLiberada.reservadoEnComandas, 0, 'Una comanda anulada debe liberar la reserva');
  assertEqual(reservaLiberada.disponibleParaReservar, 5, 'El stock reservable debe volver al total tras anular');

  let bloqueoReactivacion = false;
  try {
    comandaStorage.actualizarComanda({ ...comandaAnulada, estado: 'pendiente' });
  } catch (error) {
    bloqueoReactivacion = true;
    assert(String(error.message || error).includes('Transition de statut invalide'), 'La reactivación de una anulada debe fallar por transición inválida');
  }
  assert(bloqueoReactivacion, 'Una comanda anulada no debe reactivarse a un estado activo');

  storage.setItem('banco_alimentos_comandas', JSON.stringify([createComanda({ id: 'cmd-status-test-2', numero: 'CMD-STATUS-002', estado: 'pendiente' })]));
  let bloqueoEntregaDirecta = false;
  try {
    const comandaDirecta = comandaStorage.obtenerComandaPorId('cmd-status-test-2');
    comandaStorage.actualizarComanda({ ...comandaDirecta, estado: 'entregada' });
  } catch (error) {
    bloqueoEntregaDirecta = true;
    assert(String(error.message || error).includes('Transition de statut invalide'), 'La entrega directa debe fallar por transición inválida');
  }
  assert(bloqueoEntregaDirecta, 'No debe poder entregarse una comanda pendiente directamente');

  const estadosPendiente = comandaStorage.obtenerEstadosDisponiblesComanda('pendiente');
  assertEqual(estadosPendiente.join(','), 'pendiente,confirmada,anulada', 'Los estados disponibles desde pendiente deben quedar limitados');

  const estadosCompletada = comandaStorage.obtenerEstadosDisponiblesComanda('completada');
  assertEqual(estadosCompletada.join(','), 'completada,en_preparacion,entregada,anulada', 'Los estados disponibles desde completada deben seguir el flujo final');

  console.log(JSON.stringify({
    ok: true,
    checks: [
      'cancelled-order-releases-reservation',
      'cancelled-order-cannot-reactivate',
      'pending-order-cannot-deliver-directly',
      'available-statuses-follow-transition-map'
    ]
  }, null, 2));
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
