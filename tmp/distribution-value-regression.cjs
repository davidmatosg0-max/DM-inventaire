const fs = require('fs');
const path = require('path');
const vm = require('vm');
const esbuild = require('esbuild');

const repoRoot = path.resolve(__dirname, '..');
const helperPath = path.join(repoRoot, 'src', 'app', 'utils', 'distributionValue.ts');

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

function loadDistributionHelper(storage) {
  const buildResult = esbuild.buildSync({
    entryPoints: [helperPath],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    write: false,
    logLevel: 'silent',
    target: ['node18']
  });

  const bundledCode = buildResult.outputFiles[0].text;
  const module = { exports: {} };
  const context = {
    module,
    exports: module.exports,
    require,
    console,
    process,
    localStorage: storage,
    window: {
      dispatchEvent() {},
      addEventListener() {},
      removeEventListener() {}
    },
    Event: class Event {
      constructor(type) {
        this.type = type;
      }
    }
  };

  vm.runInNewContext(bundledCode, context, {
    filename: 'distributionValue.bundle.cjs'
  });

  return module.exports;
}

function seedCategories(storage) {
  storage.setItem('banco_alimentos_categorias', JSON.stringify([
    {
      id: 'cat-distribution-value',
      nombre: 'Categoria Valor Test',
      icono: '📦',
      color: '#1E73BE',
      activa: true,
      valorMonetario: 2,
      valorPorKg: 2,
      subcategorias: [
        {
          id: 'sub-distribution-value',
          nombre: 'Subcategoria Valor Test',
          icono: '🥕',
          activa: true,
          unidad: 'CJA',
          pesoUnitario: 3,
          valorPorKg: 5,
          variantes: [
            {
              id: 'var-distribution-value',
              nombre: 'Variante Valor Test',
              icono: '🧃',
              activa: true,
              unidad: 'CJA',
              pesoUnitario: 3,
              valorPorKg: 7
            }
          ]
        }
      ]
    }
  ]));
}

function validateHelperLogic() {
  const storage = createStorage();
  seedCategories(storage);

  const {
    calcularPesoDistribucionProducto,
    calcularValorDistribucionProducto
  } = loadDistributionHelper(storage);

  const productoConVariante = {
    categoria: 'Categoria Valor Test',
    subcategoria: 'Subcategoria Valor Test',
    varianteId: 'var-distribution-value',
    unidad: 'CJA',
    pesoUnitario: 3
  };

  const valorVariante = calcularValorDistribucionProducto(productoConVariante, 2);
  assertEqual(valorVariante.pesoTotal, 6, 'La variante debe usar el peso total por cantidad');
  assertEqual(valorVariante.valorTotal, 4, 'La distribución debe usar el valor monetario fijo de la categoría');
  assertEqual(valorVariante.valorUnitario, 2, 'El valor unitario debe provenir de valorMonetario de la categoría');

  const productoPorKg = {
    categoria: 'Categoria Valor Test',
    subcategoria: 'Subcategoria Valor Test',
    unidad: 'kg'
  };

  const pesoPorKg = calcularPesoDistribucionProducto(productoPorKg, 4.25);
  const valorPorKg = calcularValorDistribucionProducto(productoPorKg, 4.25);
  assertEqual(pesoPorKg, 4.25, 'Los productos en kg deben usar la cantidad como peso');
  assertEqual(valorPorKg.valorTotal, 8.5, 'Los productos en kg deben seguir usando valorMonetario de categoría multiplicado por la cantidad');
  assertEqual(valorPorKg.valorUnitario, 2, 'El valor unitario en kg debe seguir viniendo de la categoría');

  const productoFallback = {
    categoria: 'Categoria Sin Configuracion',
    unidad: 'CJA',
    pesoUnitario: 2,
    valorUnitario: 4
  };

  const valorFallback = calcularValorDistribucionProducto(productoFallback, 3);
  assertEqual(valorFallback.pesoTotal, 6, 'El fallback debe seguir calculando el peso total');
  assertEqual(valorFallback.valorUnitario, 4, 'El fallback debe conservar el valor unitario explícito');
  assertEqual(valorFallback.valorTotal, 12, 'El fallback debe usar valorUnitario cuando no hay valorPorKg');
}

function validateModuleWiring() {
  const expectedUsage = [
    'src/app/components/inventario/CarritoMejorado.tsx',
    'src/app/components/inventario/DialogDistribuirProductos.tsx',
    'src/app/components/inventario/PanierProductos.tsx',
    'src/app/components/inventario/DialogCrearOferta.tsx'
  ];

  for (const relativePath of expectedUsage) {
    const absolutePath = path.join(repoRoot, relativePath);
    const content = fs.readFileSync(absolutePath, 'utf8');

    assert(
      content.includes("from '../../utils/distributionValue'"),
      `${relativePath} debe importar la utilidad compartida de distribución`
    );

    assert(
      content.includes('calcularValorDistribucionProducto'),
      `${relativePath} debe usar calcularValorDistribucionProducto`
    );
  }
}

try {
  validateHelperLogic();
  validateModuleWiring();

  console.log(JSON.stringify({
    ok: true,
    checks: [
      'helper-category-monetary-value',
      'helper-category-value-for-kg',
      'helper-fallback-unit-value',
      'module-wiring-carrito',
      'module-wiring-dialog-distribuir',
      'module-wiring-panier',
      'module-wiring-oferta'
    ]
  }, null, 2));
} catch (error) {
  console.error('DISTRIBUTION_VALUE_REGRESSION_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
}