const { chromium } = require('playwright');

const JWT_SECRET = 'banque_alimentaire_secret_key_2026_ultra_secure_pro_v5';
const REFRESH_SECRET = 'banque_alimentaire_refresh_secret_key_2026_ultra_secure_pro_v5';

const baseUrl = process.env.ENTRADA_PRS_REPORTES_BASE_URL || 'http://127.0.0.1:4174/';
const DEFAULT_TIMEOUT = 30000;
const PROGRAM_ID = 'program-smoke-prs';
const CONTACT_ID = 'contact-smoke-prs';
const PRODUCT_ID = 'prod-smoke-prs-form';
const PRODUCT_NAME = 'Produit PRS Form Smoke';
const CATEGORY_ID = 'cat-smoke-fruits';
const SUBCATEGORY_ID = 'subcat-smoke-pommes';
const ENTRY_WEIGHT = 12;

function logStep(step) {
  console.log(`STEP ${step}`);
}

function createProgram() {
  return {
    id: PROGRAM_ID,
    nombre: 'Programme de Ramassage de Surplus',
    codigo: 'PRS',
    descripcion: 'Programme PRS pour smoke test',
    color: '#4CAF50',
    activo: true,
    icono: '🚚',
  };
}

function createContact() {
  return {
    id: CONTACT_ID,
    departamentoId: '1',
    tipo: 'partenaire',
    nombre: 'Marie',
    apellido: 'PRS',
    email: 'marie.prs@example.test',
    telefono: '555-0404',
    activo: true,
    fechaIngreso: new Date().toISOString(),
    participaPRS: true,
    isDonateur: false,
    isFournisseur: false,
    nombreEmpresa: 'Participant PRS Smoke',
  };
}

function createCategory() {
  return {
    id: CATEGORY_ID,
    nombre: 'Fruits',
    icono: '🍎',
    activa: true,
    valorPorKg: 2.5,
    valorMonetario: 2.5,
    subcategorias: [
      {
        id: SUBCATEGORY_ID,
        nombre: 'Pommes',
        icono: '🍎',
        activa: true,
        valorPorKg: 2.5,
        unidad: 'kg',
        pesoUnitario: 1,
        pesosUnidad: { kg: 1 },
        variantes: [],
      },
    ],
  };
}

function createUnit() {
  return { id: '6', nombre: 'Kilogramme', abreviatura: 'kg', icono: '⚖️' };
}

function createPrsProduct() {
  return {
    id: PRODUCT_ID,
    codigo: 'PRS-FORM-001',
    nombre: PRODUCT_NAME,
    categoria: 'Fruits',
    subcategoria: 'Pommes',
    unidad: 'kg',
    icono: '🍎',
    peso: 1,
    pesoUnitario: 1,
    pesoRegistrado: 0,
    stockActual: 0,
    stockMinimo: 0,
    lote: '',
    esPRS: true,
    activo: true,
    fechaCreacion: new Date().toISOString(),
    valorUnitario: 2.5,
    valorTotal: 0,
    temperatura: 'refrigerado',
    temperaturaAlmacenamiento: 'Refrigerado',
    temperaturaOriginalEntrada: 'refrigerado',
  };
}

async function launchBrowser() {
  try {
    const browser = await chromium.launch({ headless: true, timeout: DEFAULT_TIMEOUT });
    return { browser, channel: 'chromium' };
  } catch (error) {
    // fallback below
  }

  for (const channel of ['msedge', 'chrome']) {
    try {
      const browser = await chromium.launch({ channel, headless: true, timeout: DEFAULT_TIMEOUT });
      return { browser, channel };
    } catch (error) {
      // try next channel
    }
  }

  const browser = await chromium.launch({ headless: true, timeout: DEFAULT_TIMEOUT });
  return { browser, channel: 'chromium' };
}

async function createAuthState() {
  const jose = await import('jose');
  const now = Math.floor(Date.now() / 1000);
  const basePayload = {
    userId: '1',
    username: 'David',
    nombre: 'David',
    apellido: 'Développeur',
    email: 'david.developpeur@banquealimentaire.ca',
    role: 'desarrollador',
    permissions: ['desarrollador', 'acceso_total'],
  };

  const accessToken = await new jose.SignJWT({ ...basePayload, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + (15 * 60))
    .sign(new TextEncoder().encode(JWT_SECRET));

  const refreshToken = await new jose.SignJWT({ ...basePayload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + (7 * 24 * 60 * 60))
    .sign(new TextEncoder().encode(REFRESH_SECRET));

  return {
    sessionUser: {
      id: '1',
      username: 'David',
      nombre: 'David',
      apellido: 'Développeur',
      email: 'david.developpeur@banquealimentaire.ca',
      rol: 'desarrollador',
      permisos: ['desarrollador', 'acceso_total'],
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60,
    },
    refreshTokens: [{
      token: refreshToken,
      userId: '1',
      createdAt: new Date().toISOString(),
    }],
  };
}

async function seedStorage(page) {
  logStep('seed-storage');
  await page.evaluate(({ program, contact, category, unit, product }) => {
    localStorage.setItem('bancoAlimentos_programasEntrada', JSON.stringify([program]));
    localStorage.setItem('programaPredeterminado', 'PRS');
    localStorage.setItem('banqueAlimentaire_contactosDepartamento', JSON.stringify([contact]));
    localStorage.setItem('banco_alimentos_categorias', JSON.stringify([category]));
    localStorage.setItem('banco_alimentos_unidades', JSON.stringify([unit]));
    localStorage.setItem('banco_alimentos_productos', JSON.stringify([product]));
    localStorage.setItem('banco_alimentos_entradas_inventario', JSON.stringify([]));
    localStorage.setItem('banco_alimentos_movimientos', JSON.stringify([]));
    localStorage.setItem('organismos_banco_alimentos', JSON.stringify([]));
    localStorage.setItem('ofertas_sistema', JSON.stringify([]));
    localStorage.setItem('banco_alimentos_comandas', JSON.stringify([]));
    localStorage.setItem('transformaciones_cocina', JSON.stringify([]));
  }, {
    program: createProgram(),
    contact: createContact(),
    category: createCategory(),
    unit: createUnit(),
    product: createPrsProduct(),
  });
}

async function openEntryForm(page) {
  logStep('open-entry-form');
  await page.evaluate(() => {
    sessionStorage.setItem('dm_pending_entrepot_quick_action', 'open-new-entry');
  });
  await page.goto(`${baseUrl}?page=inventario`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByText('Inventaire', { exact: true }).first().waitFor({ timeout: 20000 });

  const dialog = page.getByRole('dialog').last();
  await dialog.waitFor({ state: 'visible', timeout: 20000 });
  await dialog.getByText(/Type d'Entrée|Type d'Entrada/i).first().waitFor({ timeout: 20000 });
  await dialog.getByText('Programme de Ramassage de Surplus', { exact: true }).waitFor({ timeout: 20000 });
  return dialog;
}

async function selectComboboxOption(page, dialog, comboboxIndex, optionLabel) {
  await dialog.getByRole('combobox').nth(comboboxIndex).click();
  await page.getByRole('option', { name: new RegExp(optionLabel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).click();
}

async function createPrsEntry(page) {
  logStep('create-prs-entry');
  const dialog = await openEntryForm(page);

  await selectComboboxOption(page, dialog, 0, 'Participant PRS Smoke');
  await selectComboboxOption(page, dialog, 1, PRODUCT_NAME);

  const quantityInput = dialog.locator('input[inputmode="numeric"], input[inputmode="decimal"], input[type="number"]').first();
  await quantityInput.fill(String(ENTRY_WEIGHT));
  await dialog.getByRole('button', { name: 'Réfrigéré', exact: true }).click();
  await dialog.getByPlaceholder('LOT-12345').fill('LOT-PRS-FORM');
  await dialog.locator('input[type="date"]').fill('2026-12-31');

  const printToggle = dialog.locator('#imprimirAuto');
  if (await printToggle.isChecked().catch(() => false)) {
    await dialog.locator('label[for="imprimirAuto"]').click();
  }

  await dialog.getByRole('button', { name: 'Ajouter Produit', exact: true }).click();
  await dialog.getByText(PRODUCT_NAME, { exact: true }).last().waitFor({ timeout: 20000 });
  await dialog.getByRole('button', { name: /Finaliser l'Entrée/i }).click();
  await dialog.waitFor({ state: 'hidden', timeout: 20000 });
}

async function assertStoredPrsEntry(page) {
  logStep('assert-stored-prs-entry');
  await page.waitForFunction(({ contactId, productId, expectedWeight }) => {
    const entries = JSON.parse(localStorage.getItem('banco_alimentos_entradas_inventario') || '[]');
    const entry = entries.find((item) => item.productoId === productId && String(item.programaCodigo || '').toUpperCase() === 'PRS');
    return Boolean(
      entry
      && entry.participantePRSId === contactId
      && entry.participantePRSNombre
      && entry.donadorId === contactId
      && Number(entry.pesoTotal) === expectedWeight
    );
  }, {
    contactId: CONTACT_ID,
    productId: PRODUCT_ID,
    expectedWeight: ENTRY_WEIGHT,
  }, { timeout: 20000 });
}

async function assertAdvancedReports(page) {
  logStep('assert-advanced-reports');
  await page.goto(`${baseUrl}?page=reportes-avanzado`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByRole('tab', { name: 'PRS', exact: true }).click();
  await page.getByText('Vue locale des entrées PRS', { exact: true }).waitFor({ timeout: 20000 });
  await page.getByText('Entrées locales PRS', { exact: true }).waitFor({ timeout: 20000 });
  await page.getByText('Poids total PRS local', { exact: true }).waitFor({ timeout: 20000 });
  if (await page.getByText('Aucune entrée PRS locale enregistrée sur la période.', { exact: true }).isVisible().catch(() => false)) {
    const diagnostic = await page.evaluate(() => {
      const entries = JSON.parse(localStorage.getItem('banco_alimentos_entradas_inventario') || '[]');
      return {
        totalEntries: entries.length,
        lastEntry: entries[entries.length - 1] || null,
      };
    });
    throw new Error(`La vue locale PRS sigue vacía después de registrar la entrada. Diagnostic=${JSON.stringify(diagnostic)}`);
  }
  await page.getByText('12 kg', { exact: true }).first().waitFor({ timeout: 20000 });
}

async function main() {
  const { browser, channel } = await launchBrowser();
  console.log(`BROWSER ${channel}`);

  const authState = await createAuthState();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  await context.addInitScript((state) => {
    localStorage.setItem('usuario_sesion_banco_alimentos', JSON.stringify(state.sessionUser));
    localStorage.setItem('banque_auth_tokens', JSON.stringify(state.tokens));
    localStorage.setItem('banque_refresh_tokens', JSON.stringify(state.refreshTokens));
    localStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('isAuthenticated', 'true');
  }, authState);

  const page = await context.newPage();
  page.setDefaultTimeout(DEFAULT_TIMEOUT);

  try {
    logStep('bootstrap-auth');
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await seedStorage(page);
    await createPrsEntry(page);
    await assertStoredPrsEntry(page);
    await assertAdvancedReports(page);
    console.log('ENTRADA_PRS_REPORTES_FUNCTIONAL_OK');
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error('ENTRADA_PRS_REPORTES_FUNCTIONAL_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});