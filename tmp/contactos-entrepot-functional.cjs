const { chromium } = require('playwright');

const baseUrl = process.env.ENTREPOT_BASE_URL || 'http://127.0.0.1:4173/';

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
  await page.getByRole('heading', { name: 'Tableau de Bord Principal - Entrepôt', exact: true }).waitFor({ timeout: 20000 });
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
    const target = buttons.find((button) => pattern.test(button.textContent || ''));
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
  await ensureWarehouseMenuOpen(page);
  await clickSidebarButton(page, /Contacts\s+Entrep[oô]t/);
  await page.getByRole('heading', { name: 'Gestion des Contacts', exact: true }).waitFor({ timeout: 20000 });
  await page.locator('main').getByText('Entrepôt', { exact: true }).waitFor({ timeout: 10000 });
  await page.getByRole('button', { name: 'Nouveau Contact', exact: true }).waitFor({ timeout: 10000 });
}

async function createWarehouseContact(page, { typeLabel, company, firstName, lastName, email, phone }) {
  logStep(`create${typeLabel}`);
  await page.getByRole('button', { name: 'Nouveau Contact', exact: true }).click();
  await page.getByRole('heading', { name: 'Enregistrer un nouveau contact', exact: true }).waitFor({ timeout: 10000 });

  const dialog = page.locator('div[role="dialog"]').last();
  const typePattern = typeLabel === 'Donateur' ? /Donateur/i : /Fournisseur/i;
  await dialog.getByText(typePattern).first().click();
  await dialog.locator('#empresa-simple').fill(company);
  await dialog.locator('#nombre-simple').fill(firstName);
  await dialog.locator('#apellido-simple').fill(lastName);
  await dialog.locator('#email-simple').fill(email);
  await dialog.locator('#telefono-simple').fill(phone);
  await dialog.getByRole('button', { name: 'Enregistrer', exact: true }).click();

  await page.waitForFunction((expectedText) => document.body.innerText.includes(expectedText), company, { timeout: 10000 });
}

async function openInventoryEntries(page) {
  logStep('openInventoryEntries');
  await ensureWarehouseMenuOpen(page);
  await clickSidebarButton(page, /Invent/i);
  await page.getByRole('tab').filter({ hasText: /entr/i }).first().click();
  await page.getByText('Historial completo de entradas Don/Achat', { exact: true }).waitFor({ timeout: 20000 });
  await page.getByTitle('Nueva Entrada').click();
  await page.getByText('Información Básica', { exact: true }).waitFor({ timeout: 10000 });
}

async function openEntryType(page, programName) {
  await page.locator('div[role="dialog"]').last().locator('button[role="combobox"]').first().click();
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
  logStep(`createInventoryEntry:${entry.programName}`);
  await openEntryType(page, entry.programName);
  await assertContactFilter(page, entry.company, entry.unexpectedCompany, entry.placeholder);

  const dialog = page.locator('div[role="dialog"]').last();
  const comboBoxes = dialog.locator('button[role="combobox"]');

  await dialog.locator('#categoria').click();
  await page.getByRole('option', { name: new RegExp(entry.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).click();

  await comboBoxes.nth(3).click();
  await page.getByRole('option', { name: new RegExp(entry.subcategory.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).click();

  await dialog.locator('#cantidad').fill(String(entry.quantity));

  await comboBoxes.nth(4).click();
  await page.getByRole('option', { name: /Caja.*CJA/i }).click();

  await dialog.locator('#peso').fill(String(entry.weight));

  await comboBoxes.nth(5).click();
  await page.getByRole('option', { name: /Ambiente/i }).click();

  await dialog.locator('#fechaCaducidad').fill(entry.expiryDate);
  await dialog.locator('#lote').fill(entry.batch);
  await dialog.locator('#valorUnitario').fill(String(entry.unitValue));

  await dialog.getByRole('button', { name: 'Guardar y Cerrar', exact: true }).click();
  await dialog.waitFor({ state: 'hidden', timeout: 10000 });
  await page.getByTitle('Nueva Entrada').waitFor({ timeout: 10000 });
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
    await assertContactFilter(page, donor.company, supplier.company, 'Sélectionner un donateur...');
    await openEntryType(page, 'Achat Entrepôt Test');
    await assertContactFilter(page, supplier.company, donor.company, 'Sélectionner un fournisseur...');
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
    await page.getByTitle('Nueva Entrada').click();
    await page.getByText('Información Básica', { exact: true }).waitFor({ timeout: 10000 });
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