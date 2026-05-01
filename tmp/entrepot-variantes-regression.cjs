const { chromium } = require('playwright');

const baseUrl = process.env.ENTREPOT_VARIANTES_BASE_URL || 'http://127.0.0.1:4178/';

function logStep(step) {
  console.log(`STEP ${step}`);
}

async function launchBrowser() {
  try {
    const browser = await chromium.launch({ headless: true, timeout: 30000 });
    return { browser, channel: 'chromium' };
  } catch (error) {
    // try installed channels next
  }

  for (const channel of ['msedge', 'chrome']) {
    try {
      const browser = await chromium.launch({ channel, headless: true, timeout: 30000 });
      return { browser, channel };
    } catch (error) {
      // try next channel
    }
  }

  const browser = await chromium.launch({ headless: true, timeout: 30000 });
  return { browser, channel: 'chromium' };
}

(async () => {
  const uniqueId = Date.now();
  let browser;

  try {
    const launched = await launchBrowser();
    browser = launched.browser;
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    page.setDefaultTimeout(30000);

    logStep('openBaseUrl');
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    logStep('runVariantRegression');
    const result = await page.evaluate(async (currentUniqueId) => {
      localStorage.removeItem('banco_alimentos_productos');
      localStorage.removeItem('banco_alimentos_entradas_inventario');
      localStorage.removeItem('banco_alimentos_movimientos');

      const { guardarEntrada } = await import('/src/app/utils/entradaInventarioStorage.ts');

      const baseEntry = {
        fecha: new Date().toISOString(),
        tipoEntrada: 'don',
        programaNombre: 'Don Test Variantes',
        programaCodigo: 'DON',
        programaColor: '#2E7D32',
        programaIcono: '🎁',
        donadorId: `donateur-${currentUniqueId}`,
        donadorNombre: `Donateur Variantes ${currentUniqueId}`,
        donadorEsCustom: false,
        nombreProducto: `Produit Variante ${currentUniqueId}`,
        categoria: 'Catégorie Variantes',
        subcategoria: 'Sous-catégorie Variantes',
        productoCategoria: 'Catégorie Variantes',
        productoSubcategoria: 'Sous-catégorie Variantes',
        productoIcono: '📦',
        productoCodigo: `VAR-${currentUniqueId}`,
        unidad: 'CJA',
        pesoUnidad: 10,
        pesoTotal: 0,
        temperatura: 'ambiente',
        lote: `LOT-${currentUniqueId}`,
        fechaCaducidad: '2026-12-31',
        observaciones: 'Regression variantes',
        creadoPor: 'Test Variantes',
      };

      const entradaVarianteA1 = guardarEntrada({
        ...baseEntry,
        productoId: `TEMP-A1-${currentUniqueId}`,
        varianteId: `variante-a-${currentUniqueId}`,
        variante: { id: `variante-a-${currentUniqueId}`, nombre: 'Variante A', icono: '🅰️' },
        cantidad: 2,
        pesoTotal: 20,
      });

      const entradaVarianteB = guardarEntrada({
        ...baseEntry,
        productoId: `TEMP-B-${currentUniqueId}`,
        varianteId: `variante-b-${currentUniqueId}`,
        variante: { id: `variante-b-${currentUniqueId}`, nombre: 'Variante B', icono: '🅱️' },
        cantidad: 3,
        pesoTotal: 30,
      });

      const entradaVarianteA2 = guardarEntrada({
        ...baseEntry,
        productoId: `TEMP-A2-${currentUniqueId}`,
        varianteId: `variante-a-${currentUniqueId}`,
        variante: { id: `variante-a-${currentUniqueId}`, nombre: 'Variante A', icono: '🅰️' },
        cantidad: 4,
        pesoTotal: 40,
      });

      const productos = JSON.parse(localStorage.getItem('banco_alimentos_productos') || '[]');
      const entradas = JSON.parse(localStorage.getItem('banco_alimentos_entradas_inventario') || '[]');
      const movimientos = JSON.parse(localStorage.getItem('banco_alimentos_movimientos') || '[]');

      const productosObjetivo = productos.filter((producto) => producto.nombre === baseEntry.nombreProducto);
      const productoVarianteA = productosObjetivo.find((producto) => producto.varianteId === `variante-a-${currentUniqueId}`);
      const productoVarianteB = productosObjetivo.find((producto) => producto.varianteId === `variante-b-${currentUniqueId}`);
      const entradasObjetivo = entradas.filter((entrada) => entrada.nombreProducto === baseEntry.nombreProducto);
      const movimientosObjetivo = movimientos.filter((movimiento) => movimiento.tipo === 'entrada' && productosObjetivo.some((producto) => producto.id === movimiento.productoId));

      return {
        channelReady: true,
        productosObjetivo,
        entradasObjetivo,
        movimientosObjetivo,
        productoVarianteA,
        productoVarianteB,
        entradaVarianteA1,
        entradaVarianteA2,
        entradaVarianteB,
      };
    }, uniqueId);

    if (result.productosObjetivo.length !== 2) {
      throw new Error(`Expected 2 products for variant regression, got ${result.productosObjetivo.length}`);
    }

    if (!result.productoVarianteA || result.productoVarianteA.stockActual !== 6) {
      throw new Error(`Expected Variante A stock to be 6, got ${result.productoVarianteA ? result.productoVarianteA.stockActual : 'missing'}`);
    }

    if (!result.productoVarianteB || result.productoVarianteB.stockActual !== 3) {
      throw new Error(`Expected Variante B stock to be 3, got ${result.productoVarianteB ? result.productoVarianteB.stockActual : 'missing'}`);
    }

    if (result.entradasObjetivo.length !== 3) {
      throw new Error(`Expected 3 inventory entries for variant regression, got ${result.entradasObjetivo.length}`);
    }

    if (result.movimientosObjetivo.length !== 3) {
      throw new Error(`Expected 3 inventory movements for variant regression, got ${result.movimientosObjetivo.length}`);
    }

    const expectedProductIds = new Set(result.productosObjetivo.map((producto) => producto.id));
    const allEntryProductIdsValid = result.entradasObjetivo.every((entrada) => expectedProductIds.has(entrada.productoId));
    if (!allEntryProductIdsValid) {
      throw new Error('Expected every inventory entry to reference a real productId after variant processing');
    }

    if (result.entradaVarianteA1.productoId !== result.entradaVarianteA2.productoId) {
      throw new Error('Expected repeated Variante A entries to resolve to the same productId');
    }

    if (result.entradaVarianteA1.productoId === result.entradaVarianteB.productoId) {
      throw new Error('Expected Variante A and Variante B to resolve to different productIds');
    }

    console.log(JSON.stringify({
      ok: true,
      baseUrl,
      channel: launched.channel,
      checks: [
        'open-base-url',
        'register-variante-a-1',
        'register-variante-b',
        'register-variante-a-2',
        'assert-two-products',
        'assert-same-variant-merges',
        'assert-different-variants-split',
        'assert-entry-product-links',
        'assert-movements'
      ]
    }, null, 2));

    await context.close();
    await browser.close();
  } catch (error) {
    console.error('ENTREPOT_VARIANTES_REGRESSION_ERROR');
    console.error(error && error.stack ? error.stack : error);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
})();