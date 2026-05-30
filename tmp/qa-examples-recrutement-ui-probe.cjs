const { chromium } = require('playwright');

const baseUrl = process.env.QA_EXAMPLES_BASE_URL || 'http://127.0.0.1:4174/';

function log(label, value) {
  console.log(`${label}: ${typeof value === 'string' ? value : JSON.stringify(value)}`);
}

async function launchBrowser() {
  try {
    const browser = await chromium.launch({ headless: true, timeout: 30000 });
    return { browser, channel: 'chromium' };
  } catch {}

  for (const channel of ['msedge', 'chrome']) {
    try {
      const browser = await chromium.launch({ channel, headless: true, timeout: 30000 });
      return { browser, channel };
    } catch {}
  }

  const browser = await chromium.launch({ headless: true, timeout: 30000 });
  return { browser, channel: 'chromium' };
}

async function login(page) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByLabel('Utilisateur').fill('David');
  await page.getByLabel('Mot de passe').fill('Lettycia26');
  await page.getByRole('button', { name: 'Connexion', exact: true }).click();
  await page.locator('aside').waitFor({ timeout: 20000 });
}

async function openQaExamples(page) {
  await page.goto(`${baseUrl}?page=configuracion`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('main').first().waitFor({ timeout: 20000 });
  await page.getByRole('tab').filter({ hasText: /QA|Exemples/i }).first().click();
  await page.locator('#cantidad-demo-organismos').waitFor({ timeout: 20000 });
}

async function readCounts(page) {
  return page.evaluate(() => {
    const configRaw = localStorage.getItem('configuracion_qa_examples_counts');
    const recruitmentRaw = localStorage.getItem('recrutement_organismes_banco_alimentos');

    let config = null;
    let recruitment = [];

    try {
      config = configRaw ? JSON.parse(configRaw) : null;
    } catch {}

    try {
      recruitment = recruitmentRaw ? JSON.parse(recruitmentRaw) : [];
    } catch {}

    return {
      config,
      recruitmentCount: Array.isArray(recruitment) ? recruitment.length : -1,
      recruitmentNames: Array.isArray(recruitment)
        ? recruitment.map((item) => item?.nombre).filter(Boolean).slice(0, 12)
        : [],
    };
  });
}

async function main() {
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
    await openQaExamples(page);

    const beforeInputs = {
      organismos: await page.locator('#cantidad-demo-organismos').inputValue(),
      organismosRecrutement: await page.locator('#cantidad-demo-organismosRecrutement').inputValue(),
    };
    log('beforeInputs', beforeInputs);
    log('beforeStorage', await readCounts(page));

    await page.locator('#cantidad-demo-organismos').fill('10');

    const afterEditInputs = {
      organismos: await page.locator('#cantidad-demo-organismos').inputValue(),
      organismosRecrutement: await page.locator('#cantidad-demo-organismosRecrutement').inputValue(),
    };
    log('afterEditInputs', afterEditInputs);

    await page.getByRole('button', { name: 'Charger les exemples', exact: true }).click();

    await page.waitForFunction(() => {
      const raw = localStorage.getItem('recrutement_organismes_banco_alimentos');
      if (!raw) {
        return false;
      }

      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) && parsed.length > 0;
      } catch {
        return false;
      }
    }, { timeout: 15000 });

    const afterSeed = await readCounts(page);
    log('afterSeedStorage', afterSeed);

    await page.goto(`${baseUrl}?page=recrutement`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.locator('main').first().waitFor({ timeout: 20000 });
    await page.getByRole('tab', { name: /Organismes/i }).click();
    await page.getByText('Organismes disponibles pour les assignations', { exact: true }).waitFor({ timeout: 20000 });

    const visibleRecruitmentTexts = await page.evaluate((expectedNames) => {
      const bodyText = document.body.innerText;
      return expectedNames.filter((name) => bodyText.includes(name));
    }, afterSeed.recruitmentNames);

    log('visibleRecruitmentTexts', visibleRecruitmentTexts);

    console.log(JSON.stringify({
      ok: true,
      baseUrl,
      channel: launched.channel,
      beforeInputs,
      afterEditInputs,
      afterSeed,
      visibleRecruitmentTexts,
    }, null, 2));

    await context.close();
  } catch (error) {
    console.error('QA_EXAMPLES_RECRUTEMENT_UI_PROBE_ERROR');
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

main();