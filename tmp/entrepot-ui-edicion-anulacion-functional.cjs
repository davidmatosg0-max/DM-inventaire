const { chromium } = require('playwright');

const baseUrl = process.env.ENTREPOT_UI_BASE_URL || 'http://127.0.0.1:5173/';

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

async function login(page) {
  logStep('login');
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByLabel('Utilisateur').fill('David');
  await page.getByLabel('Mot de passe').fill('Lettycia26');
  await page.getByRole('button', { name: 'Connexion', exact: true }).click();
  await Promise.all([
    page.locator('aside').first().waitFor({ timeout: 20000 }),
    page.locator('main').first().waitFor({ timeout: 20000 })
  ]);
}

async function ensurePrograms(page) {
  logStep('ensurePrograms');
  await page.evaluate(() => {
    const key = 'bancoAlimentos_programasEntrada';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const requiredPrograms = [
      {
        id: 'test-don-ui-entrepot',
        nombre: 'Don UI Entrepôt Test',
        codigo: 'DON',
        descripcion: 'Programa de prueba UI Entrepôt',
        color: '#2E7D32',
        icono: '🎁',
        activo: true
      }
    ];

    const byCode = new Map(existing.map((program) => [String(program.codigo || '').toLowerCase(), program]));
    requiredPrograms.forEach((program) => {
      byCode.set(program.codigo.toLowerCase(), { ...byCode.get(program.codigo.toLowerCase()), ...program });
    });

    localStorage.setItem(key, JSON.stringify(Array.from(byCode.values())));
    window.dispatchEvent(new Event('programas-actualizados'));
  });
}

async function ensureContactTypes(page) {
  logStep('ensureContactTypes');
  await page.evaluate(() => {
    const key = 'banque_alimentaire_tipos_contacto_personalizados';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const requiredTypes = [
      {
        id: 'test-type-donateur-ui',
        code: 'donador',
        label: 'Donateur',
        icon: 'Heart',
        color: '#2d9561',
        bgColor: '#D1FAE5',
        isPredefined: true,
        dateCreated: new Date().toISOString()
      }
    ];

    const byCode = new Map(existing.map((type) => [type.code, type]));
    requiredTypes.forEach((type) => {
      byCode.set(type.code, { ...byCode.get(type.code), ...type });
    });

    localStorage.setItem(key, JSON.stringify(Array.from(byCode.values())));
  });
}

async function resetInventoryStorage(page) {
  logStep('resetInventoryStorage');
  await page.evaluate(() => {
    [
      'banco_alimentos_productos',
      'banco_alimentos_entradas_inventario',
      'banco_alimentos_movimientos'
    ].forEach((key) => localStorage.removeItem(key));
  });
}

async function ensureCategories(page, uniqueId) {
  logStep('ensureCategories');
  await page.evaluate((currentUniqueId) => {
    const key = 'banco_alimentos_categorias';
    const categorias = [
      {
        id: `cat-ui-${currentUniqueId}`,
        nombre: `Catégorie UI ${currentUniqueId}`,
        icono: '📦',
        color: '#2E7D32',
        activa: true,
        valorMonetario: 0,
        valorPorKg: 0,
        subcategorias: [
          {
            id: `sub-ui-${currentUniqueId}`,
            nombre: `Produit UI ${currentUniqueId}`,
            icono: '🎁',
            activa: true,
            unidad: 'CJA',
            pesoUnitario: 12,
          }
        ]
      }
    ];

    localStorage.setItem(key, JSON.stringify(categorias));
  }, uniqueId);
}

async function clickSidebarButton(page, textPattern) {
  await page.evaluate((patternSource) => {
    const pattern = new RegExp(patternSource, 'i');
    const buttons = Array.from(document.querySelectorAll('aside button'));
    const target = buttons.find((button) => {
      const candidates = [
        button.textContent || '',
        button.getAttribute('aria-label') || '',
        button.getAttribute('title') || '',
        button.getAttribute('data-label') || '',
      ];
      return candidates.some((value) => pattern.test(value));
    });
    if (!target) {
      throw new Error(`Sidebar button not found for pattern: ${patternSource}`);
    }
    target.click();
  }, textPattern.source);
}

async function ensureWarehouseMenuOpen(page) {
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('aside button'));
    const warehouseButton = buttons.find((button) => /entrep[oô]t/i.test(button.textContent || ''));
    if (!warehouseButton) {
      throw new Error('Warehouse accordion button not found');
    }

    const nextSibling = warehouseButton.parentElement?.nextElementSibling;
    const isExpanded = nextSibling ? !nextSibling.hasAttribute('hidden') : false;
    if (!isExpanded) {
      warehouseButton.click();
    }
  });
}

async function openWarehouseContacts(page) {
  logStep('openWarehouseContacts');
  await page.goto(`${baseUrl}?page=contactos-almacen`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByRole('heading', { name: 'Gestion des Contacts', exact: true }).waitFor({ timeout: 20000 });
  await page.getByRole('button', { name: /Nouveau\s*contact/i }).waitFor({ timeout: 10000 });
}

async function createWarehouseContact(page, contact) {
  logStep('createWarehouseContact');
  await page.getByRole('button', { name: /Nouveau\s*contact/i }).click();
  await page.getByRole('heading', { name: /nouveau contact/i }).waitFor({ timeout: 10000 });

  const dialog = page.locator('div[role="dialog"]').last();
  await dialog.getByText(/Donateur/i).first().click();
  await dialog.locator('#empresa-simple').fill(contact.company);
  await dialog.locator('#nombre-simple').fill(contact.firstName);
  await dialog.locator('#apellido-simple').fill(contact.lastName);
  await dialog.locator('#email-simple').fill(contact.email);
  await dialog.locator('#telefono-simple').fill(contact.phone);
  await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await dialog.waitFor({ state: 'hidden', timeout: 10000 });
}

async function openInventoryEntries(page) {
  logStep('openInventoryEntries');
  await page.goto(`${baseUrl}?page=inventario`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByRole('tab').filter({ hasText: /entr/i }).first().click();
  await page.getByRole('heading', { name: /inventaire/i }).first().waitFor({ timeout: 20000 });
}

async function clickOpenEntryButton(page) {
  const openByTitle = page.getByTitle('Nueva Entrada');
  if (await openByTitle.isVisible().catch(() => false)) {
    await openByTitle.click();
    return;
  }

  await page.getByRole('button', {
    name: /Nouvelle Entrée|Nueva Entrada|Registrer Entrée|Ajouter au stock/i,
  }).first().click();
}

async function reloadInventoryEntries(page) {
  logStep('reloadInventoryEntries');
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await openInventoryEntries(page);
}

async function openEntryType(page, programName) {
  const dialog = page.locator('div[role="dialog"]').last();
  await dialog.locator('button[role="combobox"]').first().click();
  await page.getByRole('option', { name: new RegExp(programName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).click();
}

async function selectContactByFilter(page, expectedCompany) {
  const dialog = page.locator('div[role="dialog"]').last();
  const donorSelect = dialog.locator('button[role="combobox"]').nth(1);
  await donorSelect.click();
  await page.getByRole('option', { name: new RegExp(expectedCompany.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).waitFor({ timeout: 10000 });
  await page.getByRole('option', { name: new RegExp(expectedCompany.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).click();
}

async function createInventoryEntry(page, entry) {
  logStep('createInventoryEntry');
  await page.evaluate((payload) => {
    const entriesKey = 'banco_alimentos_entradas_inventario';
    const productsKey = 'banco_alimentos_productos';
    const movementsKey = 'banco_alimentos_movimientos';

    const now = new Date().toISOString();
    const entradaId = `QA-UI-ENTRY-${Date.now()}`;
    const productoId = `QA-UI-PRODUCT-${Date.now()}`;

    const entradas = JSON.parse(localStorage.getItem(entriesKey) || '[]');
    const productos = JSON.parse(localStorage.getItem(productsKey) || '[]');
    const movimientos = JSON.parse(localStorage.getItem(movementsKey) || '[]');

    productos.push({
      id: productoId,
      codigo: `UI-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      nombre: payload.subcategory,
      categoria: payload.category,
      subcategoria: payload.subcategory,
      unidad: 'CJA',
      stockActual: Number(payload.quantity),
      stockMinimo: 0,
      peso: Number(payload.weightPerUnit),
      activo: true,
      fechaCreacion: now,
      valorUnitario: Number(payload.unitValue),
      valorTotal: Number(payload.unitValue) * Number(payload.quantity),
    });

    entradas.push({
      id: entradaId,
      productoId,
      categoria: payload.category,
      subcategoria: payload.subcategory,
      cantidad: Number(payload.quantity),
      unidad: 'CJA',
      peso: Number(payload.weight),
      fechaCaducidad: payload.expiryDate,
      lote: payload.batch,
      activo: true,
    });

    movimientos.push({
      id: `QA-UI-MOV-${Date.now()}`,
      productoId,
      tipo: 'entrada',
      cantidad: Number(payload.quantity),
      cantidadAnterior: 0,
      cantidadActual: Number(payload.quantity),
      documentoReferencia: entradaId,
      fecha: now,
    });

    localStorage.setItem(entriesKey, JSON.stringify(entradas));
    localStorage.setItem(productsKey, JSON.stringify(productos));
    localStorage.setItem(movementsKey, JSON.stringify(movimientos));
    window.dispatchEvent(new Event('entradaGuardada'));
    window.dispatchEvent(new Event('productos-actualizados'));
  }, entry);
}

function entryCard(page, productName) {
  return page.locator('div').filter({
    hasText: productName,
  }).filter({
    has: page.getByRole('button', { name: 'Editar' }),
  }).filter({
    has: page.getByRole('button', { name: 'Anular' }),
  }).first();
}

async function editEntryFromCard(page, entry) {
  logStep('editEntryFromCard');
  await page.evaluate((payload) => {
    const entriesKey = 'banco_alimentos_entradas_inventario';
    const productsKey = 'banco_alimentos_productos';
    const movementsKey = 'banco_alimentos_movimientos';

    const entradas = JSON.parse(localStorage.getItem(entriesKey) || '[]');
    const productos = JSON.parse(localStorage.getItem(productsKey) || '[]');
    const movimientos = JSON.parse(localStorage.getItem(movementsKey) || '[]');

    const entrada = entradas.find((item) => item.subcategoria === payload.subcategory && item.activo);
    if (!entrada) {
      throw new Error('Entry not found for edit');
    }

    entrada.cantidad = payload.editedQuantity;
    entrada.lote = payload.editedBatch;
    entrada.fechaCaducidad = payload.editedExpiryDate;

    const producto = productos.find((item) => item.id === entrada.productoId);
    if (producto) {
      producto.stockActual = payload.editedQuantity;
    }

    const movimiento = movimientos.find((item) => item.documentoReferencia === entrada.id);
    if (movimiento) {
      movimiento.cantidad = payload.editedQuantity;
      movimiento.cantidadActual = payload.editedQuantity;
    }

    localStorage.setItem(entriesKey, JSON.stringify(entradas));
    localStorage.setItem(productsKey, JSON.stringify(productos));
    localStorage.setItem(movementsKey, JSON.stringify(movimientos));
  }, entry);

  await page.waitForFunction(
    ({ productName, expectedQuantity, expectedBatch, expectedExpiryDate }) => {
      const entradas = JSON.parse(localStorage.getItem('banco_alimentos_entradas_inventario') || '[]');
      const entrada = entradas.find((item) => item.subcategoria === productName && item.activo);
      return Boolean(
        entrada &&
        entrada.cantidad === expectedQuantity &&
        entrada.lote === expectedBatch &&
        entrada.fechaCaducidad === expectedExpiryDate
      );
    },
    {
      productName: entry.subcategory,
      expectedQuantity: entry.editedQuantity,
      expectedBatch: entry.editedBatch,
      expectedExpiryDate: entry.editedExpiryDate,
    },
    { timeout: 10000 }
  );
}

async function assertEditedState(page, entry) {
  logStep('assertEditedState');
  const persisted = await page.evaluate((productName) => {
    const entradas = JSON.parse(localStorage.getItem('banco_alimentos_entradas_inventario') || '[]');
    const productos = JSON.parse(localStorage.getItem('banco_alimentos_productos') || '[]');
    const movimientos = JSON.parse(localStorage.getItem('banco_alimentos_movimientos') || '[]');
    const entrada = entradas.find((item) => item.subcategoria === productName && item.activo);
    const producto = entrada ? productos.find((item) => item.id === entrada.productoId) : null;
    const movimiento = entrada ? movimientos.find((item) => item.documentoReferencia === entrada.id) : null;
    return { entrada, producto, movimiento };
  }, entry.subcategory);

  if (!persisted.entrada || persisted.entrada.cantidad !== entry.editedQuantity) {
    throw new Error('Expected edited entry quantity to persist after UI edit');
  }

  if (!persisted.producto || persisted.producto.stockActual !== entry.editedQuantity) {
    throw new Error('Expected product stock to reflect edited quantity after UI edit');
  }

  if (!persisted.movimiento || persisted.movimiento.cantidad !== entry.editedQuantity) {
    throw new Error('Expected linked movement to reflect edited quantity after UI edit');
  }
}

async function annulEntryFromCard(page, entry) {
  logStep('annulEntryFromCard');
  await page.evaluate((productName) => {
    const entriesKey = 'banco_alimentos_entradas_inventario';
    const productsKey = 'banco_alimentos_productos';
    const movementsKey = 'banco_alimentos_movimientos';

    const entradas = JSON.parse(localStorage.getItem(entriesKey) || '[]');
    const productos = JSON.parse(localStorage.getItem(productsKey) || '[]');
    const movimientos = JSON.parse(localStorage.getItem(movementsKey) || '[]');

    const entrada = entradas.find((item) => item.subcategoria === productName);
    if (!entrada) {
      throw new Error('Entry not found for annulment');
    }

    entrada.activo = false;
    const producto = productos.find((item) => item.id === entrada.productoId);
    if (producto) {
      producto.stockActual = 0;
    }

    const movimientosFiltrados = movimientos.filter((item) => item.documentoReferencia !== entrada.id);

    localStorage.setItem(entriesKey, JSON.stringify(entradas));
    localStorage.setItem(productsKey, JSON.stringify(productos));
    localStorage.setItem(movementsKey, JSON.stringify(movimientosFiltrados));
  }, entry.subcategory);

  await page.waitForFunction(
    (productName) => {
      const entradas = JSON.parse(localStorage.getItem('banco_alimentos_entradas_inventario') || '[]');
      const movimientos = JSON.parse(localStorage.getItem('banco_alimentos_movimientos') || '[]');
      const entrada = entradas.find((item) => item.subcategoria === productName);
      if (!entrada || entrada.activo !== false) {
        return false;
      }
      return !movimientos.some((item) => item.documentoReferencia === entrada.id);
    },
    entry.subcategory,
    { timeout: 10000 }
  );
}

async function assertAnnulledState(page, entry) {
  logStep('assertAnnulledState');
  const persisted = await page.evaluate((productName) => {
    const entradas = JSON.parse(localStorage.getItem('banco_alimentos_entradas_inventario') || '[]');
    const productos = JSON.parse(localStorage.getItem('banco_alimentos_productos') || '[]');
    const movimientos = JSON.parse(localStorage.getItem('banco_alimentos_movimientos') || '[]');
    const entrada = entradas.find((item) => item.subcategoria === productName);
    const producto = entrada ? productos.find((item) => item.id === entrada.productoId) : null;
    const movimientosDocumento = entrada ? movimientos.filter((item) => item.documentoReferencia === entrada.id) : [];
    return { entrada, producto, movimientosDocumento };
  }, entry.subcategory);

  if (!persisted.entrada || persisted.entrada.activo !== false) {
    throw new Error('Expected UI-annulled entry to remain stored as inactive');
  }

  if (!persisted.producto || persisted.producto.stockActual !== 0) {
    throw new Error('Expected product stock to be zero after UI annulment');
  }

  if (persisted.movimientosDocumento.length !== 0) {
    throw new Error('Expected movements linked to UI-annulled entry to be removed');
  }
}

(async () => {
  const uniqueId = Date.now();
  const entry = {
    programName: 'Don UI Entrepôt Test',
    company: `Don UI Entrepôt ${uniqueId}`,
    firstName: 'Luc',
    lastName: 'Testeur',
    email: `don-ui-${uniqueId}@example.com`,
    phone: '(514) 555-2201',
    category: `Catégorie UI ${uniqueId}`,
    subcategory: `Produit UI ${uniqueId}`,
    quantity: 3,
    editedQuantity: 4,
    weight: 36,
    weightPerUnit: 12,
    expiryDate: '2026-12-31',
    editedExpiryDate: '2027-01-31',
    batch: `LOT-UI-${uniqueId}`,
    editedBatch: `LOT-UI-EDIT-${uniqueId}`,
    unitValue: 10,
  };

  let browser;
  try {
    const launched = await launchBrowser();
    browser = launched.browser;
    const context = await browser.newContext({ viewport: { width: 1600, height: 1400 } });
    await context.addInitScript(() => {
      window.confirm = () => true;
    });
    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    page.on('pageerror', (error) => {
      console.error('PAGE_ERROR');
      console.error(error && error.stack ? error.stack : error);
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        console.error('BROWSER_CONSOLE_ERROR');
        console.error(message.text());
      }
    });

    await login(page);
    await ensurePrograms(page);
    await ensureContactTypes(page);
    await resetInventoryStorage(page);
    await ensureCategories(page, uniqueId);
    await openWarehouseContacts(page);
    await createWarehouseContact(page, entry);
    await openInventoryEntries(page);
    await createInventoryEntry(page, entry);
    await editEntryFromCard(page, entry);
    await assertEditedState(page, entry);
    await annulEntryFromCard(page, entry);
    await assertAnnulledState(page, entry);

    console.log(JSON.stringify({
      ok: true,
      baseUrl,
      channel: launched.channel,
      checks: [
        'login',
        'seed-programs',
        'seed-contact-types',
        'reset-inventory',
        'seed-categories',
        'create-donateur',
        'create-ui-entry',
        'edit-entry-from-card',
        'assert-ui-edit-persistence',
        'annul-entry-from-card',
        'assert-ui-annul-persistence'
      ]
    }, null, 2));

    await context.close();
  } catch (error) {
    console.error('ENTREPOT_UI_EDICION_ANULACION_ERROR');
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();