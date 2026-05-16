const { chromium } = require('playwright');

const baseUrl = process.env.ACCESO_ORGANISMO_PRS_BASE_URL || 'http://127.0.0.1:5173/';
const ACCESS_KEY = 'PRS-7M2K9Q';
const ORGANISM_ID = 'org-smoke-prs-portal';
const ORGANISM_NAME = 'Organisme Smoke PRS';
const PRODUCT_ID = 'prod-smoke-prs-portal';
const PRODUCT_NAME = 'Produit PRS Smoke';
const DONOR_ID = 'donor-smoke-prs-portal';
const DONOR_CONTACT_NAME = 'Marie Test';
const QUANTITY = 2;

function logStep(step) {
  console.log(`STEP ${step}`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createOrganism() {
  const now = '2026-05-16T10:00:00.000Z';

  return {
    id: ORGANISM_ID,
    nombre: ORGANISM_NAME,
    tipo: 'Banque alimentaire',
    email: 'prs.portal@example.org',
    telefono: '(514) 555-0202',
    direccion: '245 boulevard PRS',
    codigoPostal: 'H2H 2H2',
    quartier: 'Ahuntsic',
    responsable: 'Responsable PRS',
    beneficiarios: 60,
    activo: true,
    regular: true,
    clasificacionOrganismo: 'regular',
    participantePRS: true,
    personasServidas: 60,
    cantidadColaciones: 0,
    cantidadAlmuerzos: 0,
    porcentajeReparticion: 0,
    notificaciones: true,
    claveAcceso: ACCESS_KEY,
    contactosNotificacion: [],
    fechaCreacion: now,
    fechaModificacion: now,
  };
}

function createPrsProduct() {
  return {
    id: PRODUCT_ID,
    codigo: 'PRS-SMOKE-001',
    nombre: PRODUCT_NAME,
    categoria: 'Fruits',
    subcategoria: 'Pommes',
    unidad: 'caisse',
    icono: '🍎',
    peso: 1.5,
    pesoUnitario: 1.5,
    pesoRegistrado: 7.5,
    stockActual: 5,
    stockMinimo: 1,
    ubicacion: 'PRS-A1',
    lote: 'LOT-PRS-001',
    fechaVencimiento: '2026-12-31',
    esPRS: true,
    activo: true,
    fechaCreacion: '2026-05-16T10:00:00.000Z',
    valorUnitario: 10,
    valorTotal: 50,
    temperatura: 'refrigerado',
    temperaturaAlmacenamiento: 'Refrigerado',
    temperaturaOriginalEntrada: 'refrigerado'
  };
}

function createPrsDonor() {
  return {
    id: DONOR_ID,
    nomEntreprise: 'Donateur PRS Smoke Inc.',
    actif: true,
    isDonateur: true,
    participantPRS: true,
    organismeAcreditadoId: ORGANISM_ID,
    organismeAcreditadoNombre: ORGANISM_NAME,
    personnesContact: [
      {
        nom: DONOR_CONTACT_NAME,
      }
    ]
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

async function seedStorage(page) {
  logStep('seedStorage');
  await page.goto(`${baseUrl}?page=acceso-organismo`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(({ organism, product, donor }) => {
    localStorage.setItem('organismos_banco_alimentos', JSON.stringify([organism]));
    localStorage.setItem('banco_alimentos_productos', JSON.stringify([product]));
    localStorage.setItem('banque_alimentaire_donateurs_fournisseurs', JSON.stringify([donor]));
    localStorage.setItem('banco_alimentos_entradas_inventario', JSON.stringify([]));
    localStorage.setItem('banco_alimentos_movimientos', JSON.stringify([]));
  }, {
    organism: createOrganism(),
    product: createPrsProduct(),
    donor: createPrsDonor(),
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
}

async function loginToPortal(page) {
  logStep('loginToPortal');
  await page.getByLabel("Clé d'Accès").fill(ACCESS_KEY);
  await page.getByRole('button', { name: 'Accéder à Mon Profil', exact: true }).click();
  await page.getByRole('button', { name: 'Nouvelle Entrée PRS', exact: true }).waitFor({ timeout: 20000 });
}

async function selectComboboxOption(page, dialog, comboboxIndex, optionLabel) {
  await dialog.getByRole('combobox').nth(comboboxIndex).click();
  await page.getByRole('option', { name: new RegExp(escapeRegExp(optionLabel), 'i') }).click();
}

async function createPrsEntry(page) {
  logStep('createPrsEntry');
  await page.getByRole('button', { name: 'Nouvelle Entrée PRS', exact: true }).click();

  const dialog = page.getByRole('dialog');
  await dialog.getByText('Nouvelle Entrée PRS', { exact: true }).waitFor({ timeout: 20000 });

  await selectComboboxOption(page, dialog, 0, DONOR_CONTACT_NAME);
  await selectComboboxOption(page, dialog, 1, PRODUCT_NAME);
  await dialog.getByLabel(/Quantité/i).fill(String(QUANTITY));
  await selectComboboxOption(page, dialog, 2, 'Réfrigéré');
  await dialog.getByLabel(/Observations/i).fill('Smoke PRS portal vers inventaire');
  await dialog.getByRole('button', { name: "Enregistrer l'entrée", exact: true }).click();
}

async function assertPersistedInventoryData(page) {
  logStep('assertPersistedInventoryData');
  await page.waitForFunction(({ organismId, organismName, productId, quantity }) => {
    const entradas = JSON.parse(localStorage.getItem('banco_alimentos_entradas_inventario') || '[]');
    const movimientos = JSON.parse(localStorage.getItem('banco_alimentos_movimientos') || '[]');
    const productos = JSON.parse(localStorage.getItem('banco_alimentos_productos') || '[]');

    const entrada = entradas.find((item) => item.organismoId === organismId && item.productoId === productId);
    const movimiento = movimientos.find((item) => item.productoId === productId && item.tipo === 'entrada');
    const producto = productos.find((item) => item.id === productId);

    return Boolean(
      entrada
      && entrada.tipoEntrada === 'prs'
      && entrada.creadoPor === organismName
      && entrada.registradoPor === organismName
      && entrada.participantePRSId === 'donor-smoke-prs-portal'
      && movimiento
      && movimiento.usuario === organismName
      && producto
      && producto.stockActual === 5 + quantity
    );
  }, {
    organismId: ORGANISM_ID,
    organismName: ORGANISM_NAME,
    productId: PRODUCT_ID,
    quantity: QUANTITY,
  }, { timeout: 20000 });
}

async function main() {
  const { browser, channel } = await launchBrowser();
  console.log(`BROWSER ${channel}`);

  const page = await browser.newPage();

  try {
    await seedStorage(page);
    await loginToPortal(page);
    await createPrsEntry(page);
    await assertPersistedInventoryData(page);
    console.log('ACCESO_ORGANISMO_PRS_INVENTARIO_FUNCTIONAL_OK');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('ACCESO_ORGANISMO_PRS_INVENTARIO_FUNCTIONAL_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
