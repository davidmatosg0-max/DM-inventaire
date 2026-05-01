const { chromium } = require('playwright');

const baseUrl = process.env.ENTREPOT_EDICION_BASE_URL || 'http://127.0.0.1:4178/';

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

    logStep('runEditDeleteRegression');
    const result = await page.evaluate(async (currentUniqueId) => {
      localStorage.removeItem('banco_alimentos_productos');
      localStorage.removeItem('banco_alimentos_entradas_inventario');
      localStorage.removeItem('banco_alimentos_movimientos');

      const {
        guardarEntrada,
        actualizarEntrada,
        eliminarEntrada,
        obtenerEntradaPorId,
        obtenerEntradasActivas,
      } = await import('/src/app/utils/entradaInventarioStorage.ts');
      const { obtenerProductoPorId } = await import('/src/app/utils/productStorage.ts');
      const { obtenerMovimientos } = await import('/src/app/utils/movimientoStorage.ts');

      const fechaOriginal = '2026-03-10T00:00:00.000Z';
      const fechaEditada = '2026-03-15T00:00:00.000Z';

      const entrada = guardarEntrada({
        fecha: fechaOriginal,
        tipoEntrada: 'don',
        programaNombre: 'Don Test Edit',
        programaCodigo: 'DON',
        programaColor: '#2E7D32',
        programaIcono: '🎁',
        donadorId: `donateur-edit-${currentUniqueId}`,
        donadorNombre: `Donateur Edit ${currentUniqueId}`,
        donadorEsCustom: false,
        productoId: `TEMP-EDIT-${currentUniqueId}`,
        nombreProducto: `Produit Edit ${currentUniqueId}`,
        categoria: 'Catégorie Edit',
        subcategoria: 'Sous-catégorie Edit',
        productoCategoria: 'Catégorie Edit',
        productoSubcategoria: 'Sous-catégorie Edit',
        productoIcono: '📦',
        productoCodigo: `EDIT-${currentUniqueId}`,
        cantidad: 10,
        unidad: 'CJA',
        pesoUnidad: 2,
        pesoTotal: 20,
        valorUnitario: 5,
        valorTotal: 50,
        temperatura: 'ambiente',
        lote: `LOT-ORIG-${currentUniqueId}`,
        fechaCaducidad: '2026-12-31',
        observaciones: 'Regression edicion/anulacion',
        creadoPor: 'Test Edit',
      });

      const productoInicial = obtenerProductoPorId(entrada.productoId);
      const movimientosIniciales = obtenerMovimientos().filter(
        movimiento => movimiento.documentoReferencia === entrada.id
      );

      const edicionOk = actualizarEntrada(entrada.id, {
        fecha: fechaEditada,
        cantidad: 4,
        pesoTotal: 8,
        valorTotal: 20,
        lote: `LOT-EDIT-${currentUniqueId}`,
        fechaCaducidad: '2027-01-31',
      });

      const entradaEditada = obtenerEntradaPorId(entrada.id);
      const productoEditado = obtenerProductoPorId(entrada.productoId);
      const movimientosEditados = obtenerMovimientos().filter(
        movimiento => movimiento.documentoReferencia === entrada.id
      );

      const anulacionOk = eliminarEntrada(entrada.id);

      const entradaAnulada = obtenerEntradaPorId(entrada.id);
      const productoAnulado = obtenerProductoPorId(entrada.productoId);
      const movimientosFinales = obtenerMovimientos().filter(
        movimiento => movimiento.documentoReferencia === entrada.id
      );
      const entradasActivas = obtenerEntradasActivas().filter(item => item.id === entrada.id);

      return {
        productoInicial,
        movimientosIniciales,
        edicionOk,
        entradaEditada,
        productoEditado,
        movimientosEditados,
        anulacionOk,
        entradaAnulada,
        productoAnulado,
        movimientosFinales,
        entradasActivas,
      };
    }, uniqueId);

    if (!result.productoInicial || result.productoInicial.stockActual !== 10) {
      throw new Error(`Expected initial stock 10, got ${result.productoInicial ? result.productoInicial.stockActual : 'missing'}`);
    }

    if (result.movimientosIniciales.length !== 1 || result.movimientosIniciales[0].cantidad !== 10) {
      throw new Error('Expected a single initial movement with quantity 10');
    }

    if (!result.edicionOk) {
      throw new Error('Expected actualizarEntrada to return true');
    }

    if (!result.entradaEditada || result.entradaEditada.cantidad !== 4 || result.entradaEditada.valorTotal !== 20) {
      throw new Error('Expected edited entry to persist quantity 4 and valueTotal 20');
    }

    if (!result.productoEditado || result.productoEditado.stockActual !== 4 || result.productoEditado.pesoRegistrado !== 8) {
      throw new Error(`Expected edited product stock 4 and weight 8, got ${result.productoEditado ? `${result.productoEditado.stockActual}/${result.productoEditado.pesoRegistrado}` : 'missing'}`);
    }

    if (result.productoEditado.valorTotal !== 20 || result.productoEditado.valorUnitario !== 5) {
      throw new Error(`Expected edited product value to be 20 total and 5 unit, got ${result.productoEditado.valorTotal}/${result.productoEditado.valorUnitario}`);
    }

    if (result.movimientosEditados.length !== 1 || result.movimientosEditados[0].cantidad !== 4 || result.movimientosEditados[0].fechaEntrada !== '2026-03-15T00:00:00.000Z') {
      throw new Error('Expected movement to be updated in place after edit');
    }

    if (!result.anulacionOk) {
      throw new Error('Expected eliminarEntrada to return true');
    }

    if (!result.entradaAnulada || result.entradaAnulada.activo !== false) {
      throw new Error('Expected entry to remain stored as inactive after annulment');
    }

    if (result.entradasActivas.length !== 0) {
      throw new Error('Expected annulled entry to disappear from active entries');
    }

    if (!result.productoAnulado || result.productoAnulado.stockActual !== 0 || result.productoAnulado.pesoRegistrado !== 0 || result.productoAnulado.valorTotal !== 0) {
      throw new Error(`Expected product aggregates to be zero after annulment, got ${result.productoAnulado ? `${result.productoAnulado.stockActual}/${result.productoAnulado.pesoRegistrado}/${result.productoAnulado.valorTotal}` : 'missing'}`);
    }

    if (result.movimientosFinales.length !== 0) {
      throw new Error(`Expected annulled entry movements to be removed, got ${result.movimientosFinales.length}`);
    }

    console.log(JSON.stringify({
      ok: true,
      baseUrl,
      channel: launched.channel,
      checks: [
        'open-base-url',
        'create-entry',
        'edit-entry-reconciles-product',
        'edit-entry-updates-movement',
        'annul-entry-reconciles-product',
        'annul-entry-removes-movement'
      ]
    }, null, 2));

    await context.close();
    await browser.close();
  } catch (error) {
    console.error('ENTREPOT_EDICION_ANULACION_REGRESSION_ERROR');
    console.error(error && error.stack ? error.stack : error);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
})();