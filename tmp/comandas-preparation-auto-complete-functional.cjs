const { chromium } = require('playwright');

const baseUrl = process.env.COMANDAS_PREPARATION_AUTO_COMPLETE_BASE_URL || 'http://127.0.0.1:5173/';
const ORDER_NUMBER = 'CMD-PREP-AUTO-001';

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

function createComanda(products) {
  return {
    id: 'cmd-prep-auto-001',
    numero: ORDER_NUMBER,
    numeroComanda: ORDER_NUMBER,
    organismoId: 'org-prep-auto',
    organismoNombre: 'Organisme Préparation Auto',
    nombreOrganismo: 'Organisme Préparation Auto',
    fecha: '2026-05-16T10:30:00.000Z',
    fechaEntrega: '2026-05-18T10:30:00.000Z',
    observaciones: 'Commande test de préparation automatique',
    items: products.map((product) => ({
      productoId: product.id,
      nombreProducto: product.nombre,
      productoNombre: product.nombre,
      cantidad: 2,
      cantidadEntregada: 0,
      unidad: 'unidad',
      icono: product.icono,
      valorUnitario: 3,
      peso: 2,
      temperatura: 'refrigerado',
      temperaturaOriginalEntrada: 'refrigerado'
    })),
    valorTotal: 12,
    pesoTotal: 4,
    estado: 'en_preparacion',
    usuarioCreacion: 'Smoke Runner',
    creadoPor: 'Smoke Runner'
  };
}

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

async function seedStorage(page) {
  const products = [
    createProduct('prod-prep-auto-1', 'Produit Prépa 1'),
    createProduct('prod-prep-auto-2', 'Produit Prépa 2')
  ];
  const comandas = [createComanda(products)];

  await page.addInitScript(({ products, comandas }) => {
    localStorage.setItem('banco_alimentos_productos', JSON.stringify(products));
    localStorage.setItem('banco_alimentos_comandas', JSON.stringify(comandas));
  }, { products, comandas });
}

async function openComanda(page) {
  await page.goto(`${baseUrl}?page=comandas`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByText('Vue compacte par état des commandes', { exact: true }).waitFor({ timeout: 20000 });

  const card = page
    .getByText(ORDER_NUMBER, { exact: true })
    .locator('xpath=ancestor::div[.//button[@title="Voir la commande"]][1]');

  await card.getByTitle('Voir la commande').click();
  const dialog = page.getByRole('dialog');
  await dialog.getByText(`Commande - ${ORDER_NUMBER}`, { exact: true }).waitFor({ timeout: 20000 });
  return dialog;
}

async function getStoredStatus(page) {
  return page.evaluate(() => {
    const comandas = JSON.parse(localStorage.getItem('banco_alimentos_comandas') || '[]');
    return comandas[0]?.estado || null;
  });
}

async function main() {
  const { browser, channel } = await launchBrowser();
  console.log(`BROWSER ${channel}`);

  const page = await browser.newPage();

  try {
    await seedStorage(page);
    await login(page);
    const dialog = await openComanda(page);

    const checkboxes = dialog.locator('input[title="Marquer comme complété"]');
    await checkboxes.first().waitFor({ timeout: 20000 });
    const totalCheckboxes = await checkboxes.count();
    assert(totalCheckboxes === 2, `Se esperaban 2 checkboxes de preparación y se encontraron ${totalCheckboxes}.`);

    const completionButtonBefore = await dialog.getByRole('button', { name: 'Complétée', exact: true }).count();
    assert(completionButtonBefore === 0, 'La acción manual "Complétée" no debe mostrarse antes de completar todos los artículos.');

    await checkboxes.nth(0).check();
    await dialog.getByText('1/2', { exact: true }).waitFor({ timeout: 20000 });
    const statusAfterFirstCheck = await getStoredStatus(page);
    assert(statusAfterFirstCheck === 'en_preparacion', 'La comanda no debe completarse automáticamente con un solo artículo marcado.');

    await checkboxes.nth(1).evaluate((input) => input.click());
    const statusImmediatelyAfterSecondCheck = await getStoredStatus(page);
    assert(statusImmediatelyAfterSecondCheck === 'completada', 'La comanda debe persistirse como completada inmediatamente tras marcar el último artículo.');

    await dialog.getByText('2/2', { exact: true }).waitFor({ timeout: 20000 });

    await page.waitForFunction(() => {
      const comandas = JSON.parse(localStorage.getItem('banco_alimentos_comandas') || '[]');
      return comandas[0]?.estado === 'completada';
    }, { timeout: 20000 });

    await page.waitForFunction(() => {
      const dialog = document.querySelector('[role="dialog"]');
      return Boolean(dialog) && dialog.querySelectorAll('input[title="Marquer comme complété"]').length === 0;
    }, { timeout: 20000 });

    const statusAfterSecondCheck = await getStoredStatus(page);
    assert(statusAfterSecondCheck === 'completada', 'La comanda debe pasar a completada al marcar el último artículo.');

    console.log('COMANDAS_PREPARATION_AUTO_COMPLETE_FUNCTIONAL_OK');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('COMANDAS_PREPARATION_AUTO_COMPLETE_FUNCTIONAL_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
