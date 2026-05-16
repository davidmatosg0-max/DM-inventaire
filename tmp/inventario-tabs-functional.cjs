const { chromium } = require('playwright');

const baseUrl = process.env.INVENTARIO_TABS_BASE_URL || 'http://127.0.0.1:5173/';

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
    page.locator('main').first().waitFor({ timeout: 20000 }),
  ]);
}

async function openInventory(page) {
  logStep('openInventory');
  await page.goto(`${baseUrl}?page=inventario`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByText('Inventaire', { exact: true }).first().waitFor({ timeout: 20000 });
}

async function openTab(page, tabName, markerText, step) {
  logStep(step);
  await page.getByRole('tab', { name: tabName }).click();
  await page.getByText(markerText, { exact: true }).first().waitFor({ timeout: 20000 });
}

async function assertProductsTab(page) {
  logStep('assertProductsTab');
  await page.getByRole('tab', { name: /Produits/i }).click();
  await page.getByRole('button', { name: /Ajouter au stock/i }).first().waitFor({ timeout: 20000 });
}

async function main() {
  const { browser, channel } = await launchBrowser();
  console.log(`BROWSER ${channel}`);

  const page = await browser.newPage();

  try {
    await login(page);
    await openInventory(page);
    await assertProductsTab(page);
    await openTab(page, /Mouvements/i, 'Historique des mouvements', 'assertMovementsTab');
    await openTab(page, /Conversions/i, 'Conversion de Produits', 'assertConversionsTab');
    await openTab(page, /Historique des Entrées/i, 'Historique des Entrées', 'assertEntriesTab');
    await openTab(page, /Validation/i, 'Validation des entrées', 'assertValidationTab');
    await openTab(page, /Prédiction/i, 'Análisis Predictivo de Stock', 'assertPredictionTab');
    console.log('INVENTARIO_TABS_FUNCTIONAL_OK');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('INVENTARIO_TABS_FUNCTIONAL_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});