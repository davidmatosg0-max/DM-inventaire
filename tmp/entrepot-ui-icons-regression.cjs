const { chromium } = require('playwright');

const baseUrl = (process.env.ENTREPOT_ICONS_BASE_URL || 'http://127.0.0.1:5173/').trim();

function logStep(step) {
  console.log(`STEP ${step}`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
        id: 'test-don-icons-entrepot',
        nombre: 'Don Icônes Entrepôt Test',
        codigo: 'DON',
        descripcion: 'Programme de régression pour les icônes de Nouvelle Entrée',
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

async function ensureCategories(page, uniqueId) {
  logStep('ensureCategories');
  await page.evaluate((currentUniqueId) => {
    const key = 'banco_alimentos_categorias';
    const categorias = [
      {
        id: `cat-icons-${currentUniqueId}`,
        nombre: `Catégorie Icônes ${currentUniqueId}`,
        icono: '📚',
        color: '#2E7D32',
        activa: true,
        valorMonetario: 0,
        valorPorKg: 0,
        subcategorias: [
          {
            id: `sub-icons-${currentUniqueId}`,
            nombre: `Sous-catégorie Icônes ${currentUniqueId}`,
            icono: '🥕',
            activa: true,
            unidad: 'CJA',
            pesoUnitario: 12,
            variantes: [
              {
                id: `var-icons-${currentUniqueId}`,
                nombre: `Variante Icônes ${currentUniqueId}`,
                icono: '🧃',
                activa: true,
                unidad: 'CJA',
                pesoUnitario: 12,
                descripcion: 'Variante de régression d\'icônes'
              }
            ]
          }
        ]
      }
    ];

    localStorage.setItem(key, JSON.stringify(categorias));
    window.dispatchEvent(new Event('categorias-actualizadas'));
  }, uniqueId);
}

async function openNewEntry(page) {
  logStep('openNewEntry');
  const dialog = page.locator('div[role="dialog"]').last();
  if (await dialog.isVisible().catch(() => false)) {
    return;
  }

  await page.getByRole('button', { name: /Nouvelle Entrée|Nueva Entrada|Registrer Entrée|Ajouter au stock/i }).first().click();
  await page.locator('div[role="dialog"]').last().waitFor({ state: 'visible', timeout: 10000 });
}

async function selectEntryType(page, programName) {
  logStep('selectEntryType');
  const dialog = page.locator('div[role="dialog"]').last();
  await dialog.getByRole('button', { name: new RegExp(escapeRegExp(programName)) }).click();
  await dialog.getByRole('combobox').nth(1).waitFor({ timeout: 10000 });
}

async function selectCategory(page, categoryName) {
  logStep('selectCategory');
  const dialog = page.locator('div[role="dialog"]').last();
  await dialog.getByRole('combobox').nth(1).click();
  await page.getByRole('option', { name: new RegExp(escapeRegExp(categoryName)) }).click();
}

async function selectSubcategory(page, subcategoryName) {
  logStep('selectSubcategory');
  const dialog = page.locator('div[role="dialog"]').last();
  await dialog.getByRole('combobox').nth(2).click();
  await page.getByRole('option', { name: new RegExp(escapeRegExp(subcategoryName)) }).click();
}

async function selectVariant(page, variantName) {
  logStep('selectVariant');
  const dialog = page.locator('div[role="dialog"]').last();
  await dialog.getByRole('combobox').nth(3).click();
  await page.getByRole('option', { name: new RegExp(escapeRegExp(variantName)) }).click();
}

async function getComboboxTextByIndex(page, comboboxIndex) {
  const dialog = page.locator('div[role="dialog"]').last();
  const combobox = dialog.locator('[role="combobox"]').nth(comboboxIndex);
  await combobox.waitFor({ timeout: 10000 });
  return combobox.textContent();
}

function assertIconResolution(text, expectedText, expectedIcon, forbiddenIcon) {
  if (!text) {
    throw new Error(`Expected combobox text for ${expectedText}, but no matching button was found`);
  }
  if (!text.includes(expectedText)) {
    throw new Error(`Expected combobox text to include ${expectedText}, got: ${text}`);
  }
  if (!text.includes(expectedIcon)) {
    throw new Error(`Expected combobox text for ${expectedText} to include icon ${expectedIcon}, got: ${text}`);
  }
  if (forbiddenIcon && text.includes(forbiddenIcon)) {
    throw new Error(`Expected combobox text for ${expectedText} not to include icon ${forbiddenIcon}, got: ${text}`);
  }
}

(async () => {
  const uniqueId = Date.now();
  const data = {
    programName: 'Don Icônes Entrepôt Test',
    category: `Catégorie Icônes ${uniqueId}`,
    categoryIcon: '📚',
    subcategory: `Sous-catégorie Icônes ${uniqueId}`,
    subcategoryIcon: '🥕',
    variant: `Variante Icônes ${uniqueId}`,
    variantIcon: '🧃'
  };

  let browser;
  try {
    const launched = await launchBrowser();
    browser = launched.browser;
    const context = await browser.newContext({ viewport: { width: 1600, height: 1400 } });
    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    page.on('pageerror', (error) => {
      console.error('PAGE_ERROR');
      console.error(error && error.stack ? error.stack : error);
    });

    await login(page);
    await ensurePrograms(page);
    await ensureCategories(page, uniqueId);
    await openNewEntry(page);
    await selectEntryType(page, data.programName);
    await selectCategory(page, data.category);
    const categoryText = await getComboboxTextByIndex(page, 1);
    await selectSubcategory(page, data.subcategory);
    const subcategoryText = await getComboboxTextByIndex(page, 2);
    await selectVariant(page, data.variant);
    const variantText = await getComboboxTextByIndex(page, 3);

    assertIconResolution(categoryText, data.category, data.categoryIcon);
    assertIconResolution(subcategoryText, data.subcategory, data.subcategoryIcon, data.categoryIcon);
    assertIconResolution(variantText, data.variant, data.variantIcon, data.subcategoryIcon);

    console.log(JSON.stringify({
      ok: true,
      baseUrl,
      channel: launched.channel,
      checks: [
        'login',
        'seed-programs',
        'seed-categories-with-variant-icons',
        'open-dashboard-new-entry',
        'select-entry-type',
        'select-category-icon',
        'select-subcategory-icon',
        'select-variant-icon',
        'assert-selected-subcategory-icon',
        'assert-selected-variant-icon'
      ]
    }, null, 2));

    await context.close();
  } catch (error) {
    console.error('ENTREPOT_UI_ICONS_REGRESSION_ERROR');
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();