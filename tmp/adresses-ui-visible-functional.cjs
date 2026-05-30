const { chromium } = require('playwright');

const baseUrl = process.env.ADRESSES_UI_VISIBLE_BASE_URL || 'http://127.0.0.1:5173/';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
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
  await page.locator('main').first().waitFor({ timeout: 20000 });
}

async function seedAddresses(page) {
  await page.evaluate(() => {
    localStorage.removeItem('villes_quartiers_adresses');
    localStorage.removeItem('villes_quartiers_initialized');
  });
}

async function main() {
  const { browser, channel } = await launchBrowser();
  console.log(`BROWSER ${channel}`);
  const page = await browser.newPage();

  try {
    await login(page);
    await seedAddresses(page);
    await page.goto(`${baseUrl}?page=configuracion`, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const adressesTab = page.getByRole('tab', { name: /adresses|addresses/i });
    await adressesTab.waitFor({ timeout: 20000 });
    await adressesTab.click();

    await page.getByText('Gestion des Adresses et Quartiers', { exact: true }).waitFor({ timeout: 20000 });

    await page.getByRole('button', { name: 'Afficher les quartiers de Laval', exact: true }).click();
    await page.getByText('Chomedey', { exact: true }).waitFor({ timeout: 20000 });

    await page.getByRole('button', { name: 'Afficher les rues de Chomedey', exact: true }).click();
    await page.getByText(/Rue de Bruxelles/i).waitFor({ timeout: 20000 });
    await page.getByText(/Place Chomedey/i).waitFor({ timeout: 20000 });

    await page.getByRole('button', { name: 'Afficher les rues de Laval-Ouest', exact: true }).click();
    await page.getByText(/Chemin du Bord-de-l'Eau/i).waitFor({ timeout: 20000 });

    const voieBadge = page.getByText(/voie|voies/i).first();
    assert(await voieBadge.count() > 0, 'La pestaña debe mostrar el conteo de vías por ville o quartier.');

    console.log('ADRESSES_UI_VISIBLE_FUNCTIONAL_OK');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('ADRESSES_UI_VISIBLE_FUNCTIONAL_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
