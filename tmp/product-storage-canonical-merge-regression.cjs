const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { webcrypto } = require('crypto');
const esbuild = require('esbuild');

const repoRoot = path.resolve(__dirname, '..');
const productStoragePath = path.join(repoRoot, 'src', 'app', 'utils', 'productStorage.ts');

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

  const window = {
    localStorage: storage,
    setTimeout,
    clearTimeout,
    dispatchEvent() { return true; },
    addEventListener() {},
    removeEventListener() {},
    Event,
    CustomEvent,
    crypto: webcrypto,
    navigator: { language: 'fr-CA' }
  };

  return {
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
    navigator: window.navigator
  };
}

function stubbedModulePlugin() {
  return {
    name: 'stubbed-modules',
    setup(build) {
      build.onResolve({ filter: /supabaseClient$/ }, () => ({ path: 'supabaseClient', namespace: 'stub' }));
      build.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({
        contents: 'exports.getSupabaseClient = () => null; exports.isSupabaseConfigured = () => false;',
        loader: 'js'
      }));
    }
  };
}

async function loadProductStorage(storage) {
  const buildResult = await esbuild.build({
    entryPoints: [productStoragePath],
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
  context.exports = context.module.exports;

  vm.runInNewContext(bundledCode, context, {
    filename: 'productStorage.bundle.cjs'
  });

  return context.module.exports;
}

function createProduct(overrides = {}) {
  return {
    id: overrides.id || `prod-${Math.random().toString(36).slice(2, 8)}`,
    codigo: overrides.codigo || 'TEST-001',
    nombre: overrides.nombre || 'Produit fusion',
    categoria: overrides.categoria || 'Légumes',
    subcategoria: overrides.subcategoria || 'Carottes',
    unidad: overrides.unidad || 'unidad',
    icono: overrides.icono || '🥕',
    peso: overrides.peso ?? 1,
    pesoUnitario: overrides.pesoUnitario ?? 1,
    pesoRegistrado: overrides.pesoRegistrado,
    stockActual: overrides.stockActual ?? 1,
    stockMinimo: overrides.stockMinimo ?? 0,
    ubicacion: overrides.ubicacion || 'A1',
    lote: overrides.lote || 'LOT-TEST',
    fechaVencimiento: overrides.fechaVencimiento || '2026-12-31',
    esPRS: false,
    activo: true,
    fechaCreacion: overrides.fechaCreacion || '2026-05-10T00:00:00.000Z',
    valorUnitario: overrides.valorUnitario,
    valorTotal: overrides.valorTotal,
    temperatura: 'refrigerado',
    temperaturaAlmacenamiento: 'Refrigerado',
    temperaturaOriginalEntrada: 'refrigerado'
  };
}

async function validateWeightedMerge() {
  const storage = createStorage();
  const { guardarProducto, obtenerProductos } = await loadProductStorage(storage);

  guardarProducto(createProduct({
    id: 'prod-base',
    stockActual: 2,
    valorUnitario: 2,
    valorTotal: 4,
    pesoRegistrado: 2
  }));

  const fusionado = guardarProducto(createProduct({
    id: 'prod-entrant',
    stockActual: 3,
    valorUnitario: 4,
    valorTotal: 12,
    pesoRegistrado: 3
  }), {
    estrategiaDeduplicacion: 'inventario-canonico'
  });

  const productos = obtenerProductos();
  assertEqual(productos.length, 1, 'La deduplicación canónica debe dejar un solo producto');
  assertEqual(fusionado.stockActual, 5, 'La fusión debe sumar el stock');
  assertEqual(fusionado.valorUnitario, 3.2, 'La fusión debe calcular un valor unitario ponderado');
  assertEqual(fusionado.valorTotal, 16, 'La fusión debe recalcular el valor total con el stock combinado');
}

async function validateFallbackWhenTotalsMissing() {
  const storage = createStorage();
  const { guardarProducto, obtenerProductos } = await loadProductStorage(storage);

  guardarProducto(createProduct({
    id: 'prod-base',
    stockActual: 2,
    valorUnitario: 2,
    valorTotal: undefined
  }));

  guardarProducto(createProduct({
    id: 'prod-entrant',
    stockActual: 1,
    valorUnitario: 5,
    valorTotal: undefined
  }), {
    estrategiaDeduplicacion: 'inventario-canonico'
  });

  const producto = obtenerProductos()[0];
  assertEqual(producto.stockActual, 3, 'La fusión debe conservar el stock combinado aunque falte valorTotal');
  assertEqual(producto.valorUnitario, 3, 'La fusión debe reconstruir el valor unitario desde valorUnitario × stock');
  assertEqual(producto.valorTotal, 9, 'La fusión debe reconstruir el valor total cuando faltaba en ambos productos');
}

function validateWiring() {
  const content = fs.readFileSync(productStoragePath, 'utf8');
  assert(
    content.includes('const valorTotalFusionado = redondearValorMonetario(valorInventarioExistente + valorInventarioEntrante);'),
    'productStorage debe recalcular el valor total fusionado desde el valor de inventario agregado'
  );
  assert(
    content.includes('const valorUnitarioFusionado = stockFusionado > 0 && valorTotalFusionado > 0'),
    'productStorage debe derivar el valor unitario fusionado desde stock y valor total'
  );
}

async function main() {
  await validateWeightedMerge();
  await validateFallbackWhenTotalsMissing();
  validateWiring();

  console.log(JSON.stringify({
    ok: true,
    checks: [
      'canonical-merge-weighted-unit-value',
      'canonical-merge-recomputed-total-value',
      'canonical-merge-fallback-with-missing-totals',
      'product-storage-canonical-merge-wiring'
    ]
  }, null, 2));
}

main().catch((error) => {
  console.error('PRODUCT_STORAGE_CANONICAL_MERGE_REGRESSION_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});