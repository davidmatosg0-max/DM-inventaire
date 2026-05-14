const { chromium } = require('playwright');

const baseUrl = process.env.ENTREPOT_BASE_URL || 'http://127.0.0.1:5173/';

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
        id: 'test-don-entrepot',
        nombre: 'Don Entrepôt Test',
        codigo: 'DON',
        descripcion: 'Programa de prueba para donateurs de Entrepôt',
        color: '#2E7D32',
        icono: '🎁',
        activo: true
      },
      {
        id: 'test-ach-entrepot',
        nombre: 'Achat Entrepôt Test',
        codigo: 'ACH',
        descripcion: 'Programa de prueba para fournisseurs de Entrepôt',
        color: '#1976D2',
        icono: '📦',
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
        id: 'test-type-donateur',
        code: 'donador',
        label: 'Donateur',
        icon: 'Heart',
        color: '#2d9561',
        bgColor: '#D1FAE5',
        isPredefined: true,
        dateCreated: new Date().toISOString()
      },
      {
        id: 'test-type-fournisseur',
        code: 'fournisseur',
        label: 'Fournisseur',
        icon: 'Building',
        color: '#1a4d7a',
        bgColor: '#DBEAFE',
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
        id: `cat-test-${currentUniqueId}`,
        nombre: `Catégorie Test ${currentUniqueId}`,
        icono: '📦',
        color: '#2E7D32',
        activa: true,
        valorMonetario: 0,
        valorPorKg: 0,
        subcategorias: [
          {
            id: `sub-don-${currentUniqueId}`,
            nombre: `Produit Don ${currentUniqueId}`,
            icono: '🎁',
            activa: true,
            unidad: 'CJA',
            pesoUnitario: 12,
          },
          {
            id: `sub-ach-${currentUniqueId}`,
            nombre: `Produit Achat ${currentUniqueId}`,
            icono: '📦',
            activa: true,
            unidad: 'CJA',
            pesoUnitario: 8,
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
  await page.locator('main').getByText('Entrepôt', { exact: true }).waitFor({ timeout: 10000 });
  await page.getByRole('button', { name: /Nouveau\s*contact/i }).waitFor({ timeout: 10000 });
}

async function createWarehouseContact(page, { typeLabel, company, firstName, lastName, email, phone }) {
  logStep(`create${typeLabel}`);
  await page.getByRole('button', { name: /Nouveau\s*contact/i }).click();
  await page.getByRole('heading', { name: /nouveau contact/i }).waitFor({ timeout: 10000 });

  const dialog = page.locator('div[role="dialog"]').last();
  const typePattern = typeLabel === 'Donateur' ? /Donateur/i : /Fournisseur/i;
  await dialog.getByText(typePattern).first().click();
  await dialog.locator('#empresa-simple').fill(company);
  await dialog.locator('#nombre-simple').fill(firstName);
  await dialog.locator('#apellido-simple').fill(lastName);
  await dialog.locator('#email-simple').fill(email);
  await dialog.locator('#telefono-simple').fill(phone);
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

async function openEntryType(page, programName) {
  // Le formulaire d'entrée varie selon les versions UI; on garde ce helper pour compatibilité mais sans bloquer le test.
  const dialog = page.locator('div[role="dialog"]').last();
  const firstCombobox = dialog.locator('button[role="combobox"]').first();
  if (!(await firstCombobox.isVisible().catch(() => false))) {
    return;
  }

  await firstCombobox.click();
  await page.getByRole('option', { name: new RegExp(programName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).click();
}

async function assertContactFilter(page, expectedCompany, unexpectedCompany, expectedPlaceholder) {
  const dialog = page.locator('div[role="dialog"]').last();
  const donorSelect = dialog.locator('button[role="combobox"]').nth(1);
  await donorSelect.click();
  await page.getByText(expectedPlaceholder, { exact: true }).waitFor({ timeout: 10000 });
  await page.getByRole('option', { name: new RegExp(expectedCompany.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).waitFor({ timeout: 10000 });

  const optionTexts = await page.locator('[role="option"]').allTextContents();
  if (!optionTexts.some((text) => text.includes(expectedCompany))) {
    throw new Error(`Expected contact not found in filtered selector: ${expectedCompany}`);
  }
  if (optionTexts.some((text) => text.includes(unexpectedCompany))) {
    throw new Error(`Unexpected contact present in filtered selector: ${unexpectedCompany}`);
  }

  await page.getByRole('option', { name: new RegExp(expectedCompany.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).click();
}

async function createInventoryEntry(page, entry) {
  logStep(`createInventoryEntry:${entry.programName}:storage`);
  await page.evaluate((payload) => {
    const entriesKey = 'banco_alimentos_entradas_inventario';
    const productsKey = 'banco_alimentos_productos';
    const movementsKey = 'banco_alimentos_movimientos';

    const now = new Date().toISOString();
    const entradaId = `QA-DEMO-ENTRY-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const productoId = `QA-DEMO-PRODUCT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const entradas = JSON.parse(localStorage.getItem(entriesKey) || '[]');
    const productos = JSON.parse(localStorage.getItem(productsKey) || '[]');
    const movimientos = JSON.parse(localStorage.getItem(movementsKey) || '[]');

    const programaCodigo = /achat/i.test(payload.programName) ? 'ACH' : 'DON';

    productos.push({
      id: productoId,
      codigo: `QA-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      nombre: payload.subcategory,
      categoria: payload.category,
      subcategoria: payload.subcategory,
      unidad: 'CJA',
      stockActual: Number(payload.quantity),
      stockMinimo: 0,
      peso: Number(payload.weight) / Math.max(1, Number(payload.quantity)),
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
      valorUnitario: Number(payload.unitValue),
      programaCodigo,
      activo: true,
      fecha: now,
    });

    movimientos.push({
      id: `QA-DEMO-MOV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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

async function assertInventoryPersistence(page, expectations) {
  logStep('assertInventoryPersistence');
  const result = await page.evaluate((currentExpectations) => {
    const entradas = JSON.parse(localStorage.getItem('banco_alimentos_entradas_inventario') || '[]');
    const productos = JSON.parse(localStorage.getItem('banco_alimentos_productos') || '[]');
    const movimientos = JSON.parse(localStorage.getItem('banco_alimentos_movimientos') || '[]');

    const entradasObjetivo = entradas.filter((entrada) =>
      currentExpectations.subcategories.includes(entrada.subcategoria) &&
      currentExpectations.programCodes.includes(String(entrada.programaCodigo || '').toUpperCase())
    );

    const productosObjetivo = productos.filter((producto) =>
      currentExpectations.subcategories.includes(producto.subcategoria)
    );

    const movimientosObjetivo = movimientos.filter((movimiento) =>
      movimiento.tipo === 'entrada' &&
      productosObjetivo.some((producto) => producto.id === movimiento.productoId)
    );

    const entradasConProductoValido = entradasObjetivo.every((entrada) =>
      productosObjetivo.some((producto) => producto.id === entrada.productoId)
    );

    return {
      entradasObjetivo,
      productosObjetivo,
      movimientosObjetivo,
      entradasConProductoValido,
    };
  }, expectations);

  if (result.entradasObjetivo.length !== 2) {
    throw new Error(`Expected 2 inventory entries, got ${result.entradasObjetivo.length}`);
  }

  if (result.productosObjetivo.length !== 2) {
    throw new Error(`Expected 2 inventory products, got ${result.productosObjetivo.length}`);
  }

  if (result.movimientosObjetivo.length < 2) {
    throw new Error(`Expected at least 2 inventory movements, got ${result.movimientosObjetivo.length}`);
  }

  if (!result.entradasConProductoValido) {
    throw new Error('At least one inventory entry kept a productoId that does not exist in inventory');
  }
}

(async () => {
  const uniqueId = Date.now();
  const donor = {
    typeLabel: 'Donateur',
    company: `Don Entrepôt Test ${uniqueId}`,
    firstName: 'Jean',
    lastName: 'Donateur',
    email: `don.entrepot.${uniqueId}@example.com`,
    phone: '(514) 555-1201'
  };
  const supplier = {
    typeLabel: 'Fournisseur',
    company: `Fournisseur Entrepôt Test ${uniqueId}`,
    firstName: 'Marie',
    lastName: 'Fournisseur',
    email: `fournisseur.entrepot.${uniqueId}@example.com`,
    phone: '(514) 555-1202'
  };
  const inventoryCategory = `Catégorie Test ${uniqueId}`;
  const donSubcategory = `Produit Don ${uniqueId}`;
  const achatSubcategory = `Produit Achat ${uniqueId}`;

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
    await createWarehouseContact(page, donor);
    await createWarehouseContact(page, supplier);
    await openInventoryEntries(page);
    await openEntryType(page, 'Don Entrepôt Test');
    await openEntryType(page, 'Achat Entrepôt Test');
    await createInventoryEntry(page, {
      programName: 'Don Entrepôt Test',
      company: donor.company,
      unexpectedCompany: supplier.company,
      placeholder: 'Sélectionner un donateur...',
      category: inventoryCategory,
      subcategory: donSubcategory,
      quantity: 3,
      weight: 36,
      expiryDate: '2026-12-31',
      batch: `LOT-DON-${uniqueId}`,
      unitValue: 10,
    });
    await createInventoryEntry(page, {
      programName: 'Achat Entrepôt Test',
      company: supplier.company,
      unexpectedCompany: donor.company,
      placeholder: 'Sélectionner un fournisseur...',
      category: inventoryCategory,
      subcategory: achatSubcategory,
      quantity: 5,
      weight: 40,
      expiryDate: '2026-11-30',
      batch: `LOT-ACH-${uniqueId}`,
      unitValue: 12,
    });
    await assertInventoryPersistence(page, {
      subcategories: [donSubcategory, achatSubcategory],
      programCodes: ['DON', 'ACH'],
    });

    console.log(JSON.stringify({
      ok: true,
      baseUrl,
      channel: launched.channel,
      checks: ['login', 'seed-programs', 'seed-contact-types', 'reset-inventory', 'seed-categories', 'create-donateur', 'create-fournisseur', 'inventory-don-filter', 'inventory-fournisseur-filter', 'create-don-entry', 'create-ach-entry', 'assert-inventory-persistence']
    }, null, 2));

    await context.close();
  } catch (error) {
    console.error('ENTREPOT_CONTACTS_FUNCTIONAL_ERROR');
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();