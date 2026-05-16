const { chromium } = require('playwright');

const baseUrl = process.env.COMANDAS_MODIFIER_ARTICLES_BASE_URL || 'http://127.0.0.1:5173/';
const COMPLETED_ORDER = 'CMD-MODIFY-READY-001';
const DELIVERED_ORDER = 'CMD-MODIFY-LOCKED-001';

function logStep(step) {
  console.log(`STEP ${step}`);
}

function createProduct(id, name) {
  return {
    id,
    codigo: `${id.toUpperCase()}-001`,
    nombre: name,
    categoria: 'Légumes',
    subcategoria: 'Carottes',
    unidad: 'unidad',
    icono: '🥕',
    peso: 1,
    pesoUnitario: 1,
    pesoRegistrado: 20,
    stockActual: 20,
    stockMinimo: 1,
    ubicacion: 'A1',
    lote: `LOT-${id}`,
    fechaVencimiento: '2026-12-31',
    esPRS: false,
    activo: true,
    fechaCreacion: '2026-05-16T10:00:00.000Z',
    valorUnitario: 3,
    valorTotal: 60,
    temperatura: 'refrigerado',
    temperaturaAlmacenamiento: 'Refrigerado',
    temperaturaOriginalEntrada: 'refrigerado'
  };
}

function createComanda({ id, numero, estado, productoId, productoNombre }) {
  return {
    id,
    numero,
    numeroComanda: numero,
    organismoId: 'org-modifier-articles-smoke',
    organismoNombre: 'Organisme Smoke Modifier Articles',
    nombreOrganismo: 'Organisme Smoke Modifier Articles',
    fecha: '2026-05-16T10:30:00.000Z',
    fechaEntrega: '2026-05-18T10:30:00.000Z',
    observaciones: `Commande smoke ${numero}`,
    items: [
      {
        productoId,
        nombreProducto: productoNombre,
        productoNombre,
        cantidad: 2,
        cantidadEntregada: estado === 'entregada' ? 2 : 0,
        unidad: 'unidad',
        icono: '🥕',
        valorUnitario: 3,
        peso: 2,
        temperatura: 'refrigerado',
        temperaturaOriginalEntrada: 'refrigerado'
      }
    ],
    valorTotal: 6,
    pesoTotal: 2,
    estado,
    usuarioCreacion: 'Smoke Runner',
    creadoPor: 'Smoke Runner'
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

async function login(page) {
  logStep('login');
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByLabel('Utilisateur').fill('David');
  await page.getByLabel('Mot de passe').fill('Lettycia26');
  await page.getByRole('button', { name: 'Connexion', exact: true }).click();
  await page.locator('main').first().waitFor({ timeout: 20000 });
}

async function seedStorage(page) {
  logStep('seedStorage');
  const productReady = createProduct('prod-modify-ready', 'Produit Ready');
  const productLocked = createProduct('prod-modify-locked', 'Produit Locked');
  const completedComanda = createComanda({
    id: 'cmd-modify-ready',
    numero: COMPLETED_ORDER,
    estado: 'completada',
    productoId: productReady.id,
    productoNombre: productReady.nombre,
  });
  const deliveredComanda = createComanda({
    id: 'cmd-modify-locked',
    numero: DELIVERED_ORDER,
    estado: 'entregada',
    productoId: productLocked.id,
    productoNombre: productLocked.nombre,
  });

  await page.evaluate(({ products, comandas }) => {
    localStorage.setItem('banco_alimentos_productos', JSON.stringify(products));
    localStorage.setItem('banco_alimentos_comandas', JSON.stringify(comandas));
  }, {
    products: [productReady, productLocked],
    comandas: [completedComanda, deliveredComanda],
  });
}

async function openComandasPage(page) {
  logStep('openComandasPage');
  await page.goto(`${baseUrl}?page=comandas`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByText('Vue compacte par état des commandes', { exact: true }).waitFor({ timeout: 20000 });
  await page.getByText(COMPLETED_ORDER, { exact: true }).first().waitFor({ timeout: 20000 });
  await page.getByText(DELIVERED_ORDER, { exact: true }).first().waitFor({ timeout: 20000 });
}

function cardForOrder(page, orderNumber) {
  return page
    .getByText(orderNumber, { exact: true })
    .locator('xpath=ancestor::div[.//button[@title="Voir la commande"]][1]');
}

async function assertButtonVisibleForCompleted(page) {
  logStep('assertButtonVisibleForCompleted');
  await cardForOrder(page, COMPLETED_ORDER).getByTitle('Voir la commande').click();
  const dialog = page.getByRole('dialog');
  await dialog.getByText(`Commande - ${COMPLETED_ORDER}`, { exact: true }).waitFor({ timeout: 20000 });
  await dialog.getByRole('button', { name: 'Modifier les articles', exact: true }).waitFor({ timeout: 20000 });
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden', timeout: 20000 });
}

async function assertButtonHiddenForDelivered(page) {
  logStep('assertButtonHiddenForDelivered');
  await cardForOrder(page, DELIVERED_ORDER).getByTitle('Voir la commande').click();
  const dialog = page.getByRole('dialog');
  await dialog.getByText(`Commande - ${DELIVERED_ORDER}`, { exact: true }).waitFor({ timeout: 20000 });
  const editButton = dialog.getByRole('button', { name: 'Modifier les articles', exact: true });
  const count = await editButton.count();
  if (count !== 0) {
    throw new Error('Le bouton Modifier les articles ne devrait pas être visible pour une commande livrée.');
  }
  await page.keyboard.press('Escape');
  await dialog.waitFor({ state: 'hidden', timeout: 20000 });
}

async function main() {
  const { browser, channel } = await launchBrowser();
  console.log(`BROWSER ${channel}`);

  const page = await browser.newPage();

  try {
    await login(page);
    await seedStorage(page);
    await openComandasPage(page);
    await assertButtonVisibleForCompleted(page);
    await assertButtonHiddenForDelivered(page);
    console.log('COMANDAS_MODIFIER_ARTICLES_FUNCTIONAL_OK');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('COMANDAS_MODIFIER_ARTICLES_FUNCTIONAL_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
