const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { webcrypto } = require('crypto');
const esbuild = require('esbuild');

const repoRoot = path.resolve(__dirname, '..');
const inventoryReservationsPath = path.join(repoRoot, 'src', 'app', 'utils', 'inventoryReservations.ts');
const comandaStoragePath = path.join(repoRoot, 'src', 'app', 'utils', 'comandaStorage.ts');
const ofertaStoragePath = path.join(repoRoot, 'src', 'app', 'utils', 'ofertaStorage.ts');
const productStoragePath = path.join(repoRoot, 'src', 'app', 'utils', 'productStorage.ts');
const movementStorageKey = 'banco_alimentos_movimientos';

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
    id: overrides.id || 'prod-test',
    codigo: overrides.codigo || 'TEST-001',
    nombre: overrides.nombre || 'Produit test',
    categoria: overrides.categoria || 'Légumes',
    subcategoria: overrides.subcategoria || 'Carottes',
    unidad: overrides.unidad || 'unidad',
    icono: overrides.icono || '🥕',
    peso: overrides.peso ?? 1.5,
    pesoUnitario: overrides.pesoUnitario ?? 1.5,
    pesoRegistrado: overrides.pesoRegistrado ?? 1.5,
    stockActual: overrides.stockActual ?? 1,
    stockMinimo: overrides.stockMinimo ?? 0,
    ubicacion: overrides.ubicacion || 'A1',
    lote: overrides.lote || 'LOT-TEST',
    fechaVencimiento: overrides.fechaVencimiento || '2026-12-31',
    esPRS: false,
    activo: true,
    fechaCreacion: overrides.fechaCreacion || '2026-05-10T00:00:00.000Z',
    valorUnitario: overrides.valorUnitario ?? 3.33,
    valorTotal: overrides.valorTotal ?? ((overrides.stockActual ?? 1) * (overrides.valorUnitario ?? 3.33)),
    temperatura: overrides.temperatura || 'refrigerado',
    temperaturaAlmacenamiento: overrides.temperaturaAlmacenamiento || 'Refrigerado',
    temperaturaOriginalEntrada: overrides.temperaturaOriginalEntrada || 'refrigerado'
  };
}

function createComanda(overrides = {}) {
  return {
    id: overrides.id || 'cmd-test',
    numero: overrides.numero || 'CMD-TEST-001',
    numeroComanda: overrides.numeroComanda || overrides.numero || 'CMD-TEST-001',
    organismoId: overrides.organismoId || 'org-test',
    organismoNombre: overrides.organismoNombre || 'Organisme Test',
    nombreOrganismo: overrides.nombreOrganismo || overrides.organismoNombre || 'Organisme Test',
    fecha: overrides.fecha || '2026-05-10T00:00:00.000Z',
    fechaEntrega: overrides.fechaEntrega || '2026-05-11T00:00:00.000Z',
    observaciones: overrides.observaciones || 'Comanda de test',
    items: overrides.items || [
      {
        productoId: 'prod-test',
        nombreProducto: 'Produit test',
        productoNombre: 'Produit test',
        cantidad: 2,
        cantidadEntregada: 2,
        unidad: 'unidad',
        icono: '🥕',
        valorUnitario: 3.33,
        peso: 3,
        temperatura: 'refrigerado',
        temperaturaOriginalEntrada: 'refrigerado'
      }
    ],
    valorTotal: overrides.valorTotal ?? 6.66,
    pesoTotal: overrides.pesoTotal ?? 3,
    estado: overrides.estado || 'completada',
    usuarioCreacion: overrides.usuarioCreacion || 'Test Runner',
    creadoPor: overrides.creadoPor || 'Test Runner'
  };
}

function createOferta(overrides = {}) {
  return {
    id: overrides.id || 'ofe-test',
    numeroOferta: overrides.numeroOferta || 'OFE-2026-05-001',
    titulo: overrides.titulo || 'Offre test',
    descripcion: overrides.descripcion || 'Offre de test',
    fechaCreacion: overrides.fechaCreacion || '2026-05-10T00:00:00.000Z',
    fechaExpiracion: overrides.fechaExpiracion || '2026-05-11T00:00:00.000Z',
    estado: overrides.estado || 'aceptada',
    creadoPor: overrides.creadoPor || 'Test Runner',
    productos: overrides.productos || [
      {
        productoId: 'prod-test',
        productoNombre: 'Produit test',
        productoCodigo: 'TEST-001',
        categoria: 'Légumes',
        subcategoria: 'Carottes',
        cantidadOfrecida: 1,
        cantidadDisponible: 0,
        unidad: 'unidad',
        peso: 1.5,
        valorUnitario: 3.33,
        icono: '🥕'
      }
    ],
    organismosDestino: ['org-test'],
    aceptaciones: overrides.aceptaciones || [
      {
        organismoId: 'org-test',
        organismoNombre: 'Organisme Test',
        fecha: '2026-05-10T00:00:00.000Z',
        productos: [{ productoId: 'prod-test', cantidadAceptada: 1 }]
      }
    ],
    solicitudes: overrides.solicitudes || [
      {
        id: 'sol-test',
        organismoId: 'org-test',
        organismoNombre: 'Organisme Test',
        fechaSolicitud: '2026-05-10T00:00:00.000Z',
        productosAceptados: [{ productoId: 'prod-test', cantidadAceptada: 1 }],
        estado: 'aceptada',
        fechaActualizacion: '2026-05-10T00:00:00.000Z'
      }
    ],
    totalProductos: 1,
    totalKilos: 1.5,
    valorMonetarioTotal: 3.33,
    visible: true,
    activa: true
  };
}

function readProducts(storage) {
  return JSON.parse(storage.getItem('banco_alimentos_productos') || '[]');
}

function readComandas(storage) {
  return JSON.parse(storage.getItem('banco_alimentos_comandas') || '[]');
}

function readOfertas(storage) {
  return JSON.parse(storage.getItem('ofertas_sistema') || '[]');
}

function readMovimientos(storage) {
  return JSON.parse(storage.getItem(movementStorageKey) || '[]');
}

async function validateAtomicDiscountGuard() {
  const storage = createStorage();
  seedUser(storage);
  storage.setItem('banco_alimentos_productos', JSON.stringify([
    createProduct({ id: 'prod-ok', nombre: 'Produit OK', stockActual: 4, valorTotal: 13.32 }),
    createProduct({ id: 'prod-short', nombre: 'Produit court', stockActual: 1, valorTotal: 3.33 })
  ]));

  const { descontarInventarioReservado } = await loadModule(inventoryReservationsPath, storage);
  const before = readProducts(storage).map(producto => ({ id: producto.id, stockActual: producto.stockActual }));

  const result = descontarInventarioReservado([
    { productoId: 'prod-ok', cantidad: 2 },
    { productoId: 'prod-short', cantidad: 2 }
  ]);

  assertEqual(result.ok, false, 'El descuento debe fallar si una línea no tiene stock suficiente');

  const after = readProducts(storage).map(producto => ({ id: producto.id, stockActual: producto.stockActual }));
  assertEqual(JSON.stringify(after), JSON.stringify(before), 'El descuento atómico no debe dejar cambios parciales en stock');
}

async function validateComandaDeliveryFlow() {
  const storage = createStorage();
  seedUser(storage);
  storage.setItem('banco_alimentos_productos', JSON.stringify([
    createProduct({ id: 'prod-test', stockActual: 5, valorTotal: 16.65 })
  ]));
  storage.setItem('banco_alimentos_comandas', JSON.stringify([
    createComanda({ estado: 'completada' })
  ]));

  const { actualizarComanda } = await loadModule(comandaStoragePath, storage);
  actualizarComanda(createComanda({ estado: 'entregada' }));

  const comandaActualizada = readComandas(storage).find(comanda => comanda.id === 'cmd-test');
  const productoActualizado = readProducts(storage).find(producto => producto.id === 'prod-test');
  const movimientoEntrega = readMovimientos(storage).find((movimiento) => movimiento.numeroComanda === 'CMD-TEST-001');

  assertEqual(comandaActualizada.estado, 'entregada', 'La comanda debe persistir el estado entregada');
  assertEqual(productoActualizado.stockActual, 3, 'Entregar una comanda debe descontar el stock reservado exactamente una vez');
  assert(Boolean(movimientoEntrega), 'Entregar una comanda debe registrar un movimiento de inventario');
  assertEqual(movimientoEntrega.tipo, 'distribucion_completada', 'La entrega debe registrar un movimiento de distribución completada');
  assertEqual(movimientoEntrega.cantidad, 2, 'El movimiento de entrega debe reflejar la cantidad entregada');
}

async function validateOfferDeliveryFlow() {
  const storage = createStorage();
  seedUser(storage);
  storage.setItem('banco_alimentos_productos', JSON.stringify([
    createProduct({ id: 'prod-test', stockActual: 3, valorTotal: 9.99 })
  ]));
  storage.setItem('ofertas_sistema', JSON.stringify([
    createOferta()
  ]));

  const { marcarSolicitudEntregada } = await loadModule(ofertaStoragePath, storage);
  const success = marcarSolicitudEntregada('ofe-test', 'sol-test');

  assertEqual(success, true, 'La solicitud aceptada debe poder marcarse como entregada');

  const solicitudActualizada = readOfertas(storage)[0].solicitudes.find(solicitud => solicitud.id === 'sol-test');
  const productoActualizado = readProducts(storage).find(producto => producto.id === 'prod-test');

  assertEqual(solicitudActualizada.estado, 'entregada', 'La solicitud debe persistir el estado entregada');
  assertEqual(productoActualizado.stockActual, 2, 'Entregar una oferta debe descontar el stock reservado exactamente una vez');
}

function validateWiring() {
  const inventoryReservationsContent = fs.readFileSync(inventoryReservationsPath, 'utf8');
  const productStorageContent = fs.readFileSync(productStoragePath, 'utf8');

  assert(
    inventoryReservationsContent.includes('return descontarStockProductosAtomico(sumarCantidades(items));'),
    'inventoryReservations debe delegar el descuento a la operación atómica compartida'
  );

  assert(
    productStorageContent.includes('export function descontarStockProductosAtomico'),
    'productStorage debe exponer la operación atómica de descuento'
  );
}

async function main() {
  await validateAtomicDiscountGuard();
  await validateComandaDeliveryFlow();
  await validateOfferDeliveryFlow();
  validateWiring();

  console.log(JSON.stringify({
    ok: true,
    checks: [
      'atomic-discount-prevents-partial-write',
      'comanda-delivery-updates-stock',
      'comanda-delivery-registers-movement',
      'offer-delivery-updates-stock',
      'inventory-reservations-uses-atomic-helper'
    ]
  }, null, 2));
}

main().catch((error) => {
  console.error('INVENTORY_RESERVATIONS_ATOMIC_REGRESSION_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});