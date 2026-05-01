const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DEFAULT_BASE_URL = 'http://127.0.0.1:5173/';
const DEFAULT_TIMEOUT = 20000;
const SMOKE_FILES = {
  inventory: path.resolve('tmp/qr-inventario-smoke.png'),
  comandas: path.resolve('tmp/qr-comandas-smoke.png'),
};

const MODULES = {
  inventory: {
    key: 'inventory',
    moduleName: 'Inventario',
    navName: 'Entrepôt',
    childNames: ['Inventaire'],
    titleText: 'Scanner Code QR - Inventaire',
    qrPath: SMOKE_FILES.inventory,
    expectedText: 'Produit Smoke',
    fileInputTestId: 'inventory-qr-file-input',
  },
  comandas: {
    key: 'comandas',
    moduleName: 'Comandas',
    navName: 'Entrepôt',
    childNames: ['Commandes'],
    titleText: 'Scanner Code QR',
    qrPath: SMOKE_FILES.comandas,
    expectedText: 'SMOKE-001',
    fileInputTestId: 'orders-qr-file-input',
  },
};

function printHelp() {
  console.log([
    'Uso: node tmp/qr-smoke-playwright.cjs [opciones]',
    '',
    'Opciones:',
    '  --module=inventory|comandas|all   Módulo a probar. Default: all',
    '  --with-camera                     Añade una sonda no bloqueante del flujo de cámara',
    '  --browser=msedge|chrome|chromium Canal preferido del navegador',
    '  --headful                         Ejecuta con navegador visible',
    `  --base-url=${DEFAULT_BASE_URL}            URL base a probar`,
    '  --help                            Muestra esta ayuda',
    '',
    'Comportamiento por defecto:',
    '  - Abre cada escáner QR',
    '  - Verifica apertura/cierre de la guía de permisos',
    '  - Carga un PNG QR de prueba por archivo',
    '  - Cierra el modal y resume resultados',
    '',
    'Notas:',
    '  - Si faltan los PNG de prueba, se generan automáticamente con tmp/generate-qr-smoke.mjs.',
    '  - La sonda de cámara es informativa; no vuelve rojo el smoke test en headless.',
  ].join('\n'));
}

function parseArgs(argv) {
  const options = {
    module: 'all',
    withCamera: false,
    headless: true,
    browser: null,
    baseUrl: DEFAULT_BASE_URL,
  };

  for (const arg of argv) {
    if (arg === '--with-camera') {
      options.withCamera = true;
      continue;
    }

    if (arg === '--headful') {
      options.headless = false;
      continue;
    }

    if (arg === '--help') {
      options.help = true;
      continue;
    }

    if (arg.startsWith('--module=')) {
      options.module = arg.split('=')[1];
      continue;
    }

    if (arg.startsWith('--browser=')) {
      options.browser = arg.split('=')[1];
      continue;
    }

    if (arg.startsWith('--base-url=')) {
      options.baseUrl = arg.slice('--base-url='.length);
      continue;
    }

    throw new Error(`Argumento no reconocido: ${arg}`);
  }

  return options;
}

function resolveModules(selection) {
  if (selection === 'all') {
    return [MODULES.inventory, MODULES.comandas];
  }

  const moduleConfig = MODULES[selection];
  if (!moduleConfig) {
    throw new Error(`Módulo no soportado: ${selection}`);
  }

  return [moduleConfig];
}

function ensureFixtures() {
  const missing = Object.values(SMOKE_FILES).filter((filePath) => !fs.existsSync(filePath));
  if (missing.length === 0) {
    return;
  }

  console.log('Generating QR smoke fixtures...');
  execFileSync(process.execPath, ['tmp/generate-qr-smoke.mjs'], { stdio: 'inherit' });
}

async function launchBrowser(options) {
  const candidates = options.browser
    ? [options.browser]
    : ['msedge', 'chrome'];

  for (const channel of candidates) {
    try {
      console.log(`Launching browser channel: ${channel}`);
      const browser = await chromium.launch({
        channel: channel === 'chromium' ? undefined : channel,
        headless: options.headless,
        args: ['--use-fake-ui-for-media-stream'],
        timeout: 30000,
      });
      return { browser, channel };
    } catch (error) {
      console.log(`Channel unavailable: ${channel}`);
    }
  }

  console.log('Falling back to bundled chromium');
  const browser = await chromium.launch({ headless: options.headless, timeout: 30000 });
  return { browser, channel: 'chromium' };
}

async function login(page, baseUrl) {
  console.log('Login: opening app');
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);
  console.log('Login: page opened');

  const username = page.getByLabel('Utilisateur');
  if (await username.isVisible().catch(() => false)) {
    console.log('Login: filling credentials');
    await username.fill('David');
    await page.getByLabel('Mot de passe').fill('Lettycia26');
    await page.getByRole('button', { name: 'Connexion', exact: true }).click();
  }

  await page.getByRole('button', { name: 'Tableau de bord', exact: true }).waitFor({ timeout: DEFAULT_TIMEOUT });
  console.log('Login: dashboard visible');
}

async function openLoggedInPage(browser, baseUrl) {
  const context = await browser.newContext({ permissions: ['camera'], viewport: { width: 1440, height: 1100 } });
  const page = await context.newPage();
  page.setDefaultTimeout(DEFAULT_TIMEOUT);
  await login(page, baseUrl);
  return { context, page };
}

async function closeScanner(page, scannerTitle) {
  console.log('Close scanner: start');
  const header = page
    .getByText(scannerTitle, { exact: false })
    .locator('xpath=ancestor::div[contains(@class, "bg-")]')
    .first();
  await header.locator('button').last().click();
  await page.getByText(scannerTitle, { exact: false }).waitFor({ state: 'detached', timeout: 10000 });
  console.log('Close scanner: done');
}

async function findVisibleChildButton(page, childNames) {
  for (const childName of childNames) {
    const childButton = page.getByRole('button', { name: childName, exact: true });
    if (await childButton.isVisible().catch(() => false)) {
      return childButton;
    }
  }

  return null;
}

async function openScanner(page, moduleConfig) {
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    console.log(`Open scanner: navigating to ${moduleConfig.moduleName} (attempt ${attempt})`);

    let childButton = await findVisibleChildButton(page, moduleConfig.childNames);
    if (!childButton) {
      await page.getByRole('button', { name: moduleConfig.navName, exact: true }).click();
      childButton = await findVisibleChildButton(page, moduleConfig.childNames);
    }

    if (!childButton) {
      throw new Error(`Child menu not found for ${moduleConfig.moduleName}: ${moduleConfig.childNames.join(', ')}`);
    }

    await childButton.click();

    try {
      const scannerButton = page.locator('button[title="Scanner QR"]').first();
      await scannerButton.waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });
      await scannerButton.click();
      await page.getByText(moduleConfig.titleText, { exact: false }).waitFor({ state: 'visible', timeout: 10000 });
      console.log(`Open scanner: modal visible for ${moduleConfig.moduleName}`);
      return;
    } catch (error) {
      lastError = error;
      console.log(`Open scanner: retry needed for ${moduleConfig.moduleName}`);
      await page.waitForTimeout(1200);
    }
  }

  throw lastError;
}

async function testGuide(page) {
  console.log('Guide: open');
  await page.locator('button[title*="Aide:"]').first().click();
  await page.getByText("Comment autoriser l'accès à la caméra", { exact: false }).waitFor({ state: 'visible', timeout: 10000 });
  await page.getByRole('button', { name: "J'ai compris", exact: true }).click();
  await page.getByText("Comment autoriser l'accès à la caméra", { exact: false }).waitFor({ state: 'detached', timeout: 10000 });
  console.log('Guide: closed');
}

async function testCameraFlow(page) {
  console.log('Camera flow: trigger');
  await page.getByRole('button', { name: /Scanner avec Caméra/i }).click();
  await page.waitForTimeout(2500);

  const cameraSignals = [
    page.getByText('Accès à la caméra refusé', { exact: false }),
    page.getByText('Aucune caméra trouvée', { exact: false }),
    page.getByText('Caméra déjà utilisée', { exact: false }),
    page.getByText('Erreur inconnue', { exact: false }),
    page.locator('#qr-reader-camera'),
    page.locator('#qr-reader-camera-inventario'),
  ];

  for (const signal of cameraSignals) {
    if (await signal.isVisible().catch(() => false)) {
      console.log('Camera flow: signal detected');
      return true;
    }
  }

  console.log('Camera flow: no signal detected');
  return false;
}

async function testFileUpload(page, moduleConfig) {
  console.log(`File upload: ${moduleConfig.expectedText}`);
  await page.getByTestId(moduleConfig.fileInputTestId).setInputFiles(moduleConfig.qrPath);
  await page.getByText('Code QR scanné avec succès!', { exact: false }).waitFor({ state: 'visible', timeout: DEFAULT_TIMEOUT });
  await page.getByText(moduleConfig.expectedText, { exact: false }).waitFor({ state: 'visible', timeout: 10000 });
  console.log(`File upload: parsed ${moduleConfig.expectedText}`);
}

async function runGuideAndFileSmoke(browser, baseUrl, moduleConfig) {
  const result = {
    module: moduleConfig.moduleName,
    guideOpenedClosed: false,
    fileUploadWorked: false,
    fileModalClosed: false,
  };

  const { context, page } = await openLoggedInPage(browser, baseUrl);
  try {
    await openScanner(page, moduleConfig);
    await testGuide(page);
    await closeScanner(page, moduleConfig.titleText);
    result.guideOpenedClosed = true;

    await openScanner(page, moduleConfig);
    await testFileUpload(page, moduleConfig);
    result.fileUploadWorked = true;
    await closeScanner(page, moduleConfig.titleText);
    result.fileModalClosed = true;
  } finally {
    await context.close();
  }

  return result;
}

async function runCameraProbe(browser, baseUrl, moduleConfig) {
  const { context, page } = await openLoggedInPage(browser, baseUrl);
  try {
    await openScanner(page, moduleConfig);
    return await testCameraFlow(page);
  } catch (error) {
    return { error: error.message };
  } finally {
    await context.close();
  }
}

function summarize(results, includeCameraProbe) {
  const summary = {
    ok: results.every((result) => result.guideOpenedClosed && result.fileUploadWorked && result.fileModalClosed),
    modules: results,
  };

  if (!includeCameraProbe) {
    delete summary.modules.cameraProbe;
  }

  return summary;
}

(async () => {
  let browser;

  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      printHelp();
      return;
    }

    ensureFixtures();
    const modules = resolveModules(options.module);
    const launched = await launchBrowser(options);
    browser = launched.browser;

    const results = [];
    for (const moduleConfig of modules) {
      const result = await runGuideAndFileSmoke(browser, options.baseUrl, moduleConfig);
      if (options.withCamera) {
        result.cameraProbe = await runCameraProbe(browser, options.baseUrl, moduleConfig);
      }
      results.push(result);
    }

    const summary = summarize(results, options.withCamera);
    console.log(JSON.stringify({ channel: launched.channel, ...summary }, null, 2));

    if (!summary.ok) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('SMOKE_TEST_ERROR');
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
