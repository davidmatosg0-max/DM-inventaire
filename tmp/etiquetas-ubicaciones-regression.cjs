const { chromium } = require('playwright');

const baseUrl = process.env.ETIQUETAS_UBICACIONES_BASE_URL || 'http://127.0.0.1:5173/';

function buildProduct(id, ubicacion) {
  return {
    id,
    codigo: `COD-${id}`,
    nombre: `Producto ${id}`,
    categoria: 'Categoría test',
    subcategoria: 'Subcategoría test',
    unidad: 'UND',
    icono: '📦',
    peso: 1,
    stockActual: 5,
    stockMinimo: 1,
    ubicacion,
    lote: '',
    fechaVencimiento: '',
    esPRS: false,
    activo: true,
    fechaCreacion: new Date().toISOString(),
  };
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
  let browser;

  try {
    const launched = await launchBrowser();
    browser = launched.browser;
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    page.setDefaultTimeout(30000);

    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const result = await page.evaluate(async () => {
      localStorage.removeItem('zonasAlmacen');
      localStorage.removeItem('banco_alimentos_productos');

      localStorage.setItem('zonasAlmacen', JSON.stringify([
        { zona: 'A', tipo: 'Estantería', cantidad: 12 },
        { zona: 'B', tipo: 'Congelador', cantidad: 3 },
      ]));

      localStorage.setItem('banco_alimentos_productos', JSON.stringify([
        {
          id: 'prod-legacy-a1',
          codigo: 'P-LEG-1',
          nombre: 'Producto legacy 1',
          categoria: 'Categoría test',
          subcategoria: 'Subcategoría test',
          unidad: 'UND',
          icono: '📦',
          peso: 1,
          stockActual: 5,
          stockMinimo: 1,
          ubicacion: ' a-01 ',
          lote: '',
          fechaVencimiento: '',
          esPRS: false,
          activo: true,
          fechaCreacion: new Date().toISOString(),
        },
        {
          id: 'prod-custom-z9',
          codigo: 'P-LEG-2',
          nombre: 'Producto legacy 2',
          categoria: 'Categoría test',
          subcategoria: 'Subcategoría test',
          unidad: 'UND',
          icono: '📦',
          peso: 1,
          stockActual: 5,
          stockMinimo: 1,
          ubicacion: ' custom-9 ',
          lote: '',
          fechaVencimiento: '',
          esPRS: false,
          activo: true,
          fechaCreacion: new Date().toISOString(),
        },
      ]));

      const {
        buildLocationOptions,
        findLocationConflicts,
        loadLocationZones,
        resolveLegacyLocation,
      } = await import('/src/app/utils/locationZones.ts');
      const { obtenerProductos } = await import('/src/app/utils/productStorage.ts');

      const allowedLocations = buildLocationOptions(loadLocationZones());
      const resolvedLegacyA1 = resolveLegacyLocation(' a-01 ', allowedLocations);
      const resolvedLegacyA12 = resolveLegacyLocation('A-012', allowedLocations);
      const conflicts = findLocationConflicts([
        { zona: 'A', tipo: 'Estantería', cantidad: 12 },
        { zona: 'A1', tipo: 'Estantería', cantidad: 2 },
      ]);
      const productos = obtenerProductos();
      const persistedProducts = JSON.parse(localStorage.getItem('banco_alimentos_productos') || '[]');

      return {
        allowedLocations,
        resolvedLegacyA1,
        resolvedLegacyA12,
        conflicts,
        productos: productos.map((producto) => ({ id: producto.id, ubicacion: producto.ubicacion })),
        persistedProducts: persistedProducts.map((producto) => ({ id: producto.id, ubicacion: producto.ubicacion })),
      };
    });

    if (result.resolvedLegacyA1 !== 'A1') {
      throw new Error(`Expected legacy location a-01 to resolve to A1, got ${result.resolvedLegacyA1}`);
    }

    if (result.resolvedLegacyA12 !== 'A12') {
      throw new Error(`Expected legacy location A-012 to resolve to A12, got ${result.resolvedLegacyA12}`);
    }

    const conflictCodes = result.conflicts.map((conflict) => conflict.ubicacion).join(',');
    if (conflictCodes !== 'A11,A12') {
      throw new Error(`Expected A/A1 conflict to produce A11,A12, got ${conflictCodes || 'none'}`);
    }

    const migratedA1 = result.productos.find((producto) => producto.id === 'prod-legacy-a1');
    if (!migratedA1 || migratedA1.ubicacion !== 'A1') {
      throw new Error(`Expected stored product prod-legacy-a1 to migrate to A1, got ${migratedA1 ? migratedA1.ubicacion : 'missing'}`);
    }

    const customLocation = result.productos.find((producto) => producto.id === 'prod-custom-z9');
    if (!customLocation || customLocation.ubicacion !== 'CUSTOM-9') {
      throw new Error(`Expected custom location to be preserved as CUSTOM-9, got ${customLocation ? customLocation.ubicacion : 'missing'}`);
    }

    const persistedA1 = result.persistedProducts.find((producto) => producto.id === 'prod-legacy-a1');
    if (!persistedA1 || persistedA1.ubicacion !== 'A1') {
      throw new Error(`Expected migrated location to be persisted as A1, got ${persistedA1 ? persistedA1.ubicacion : 'missing'}`);
    }

    console.log(JSON.stringify({
      ok: true,
      baseUrl,
      channel: launched.channel,
      checks: [
        'resolve-legacy-a1',
        'resolve-legacy-a12',
        'detect-a-a1-conflicts',
        'migrate-stored-product-location',
        'preserve-custom-location',
        'persist-migration'
      ]
    }, null, 2));

    await context.close();
    await browser.close();
  } catch (error) {
    console.error('ETIQUETAS_UBICACIONES_REGRESSION_ERROR');
    console.error(error && error.stack ? error.stack : error);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
})();