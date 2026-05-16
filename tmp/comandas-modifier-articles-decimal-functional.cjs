const { chromium } = require('playwright');

const baseUrl = process.env.COMANDAS_MODIFIER_ARTICLES_DECIMAL_BASE_URL || 'http://127.0.0.1:5173/';
const ORDER_NUMBER = 'CMD-MODIFY-DECIMAL-001';

function createProduct() {
  return {
    id: 'prod-modify-decimal',
    codigo: 'PROD-MODIFY-DECIMAL-001',
    nombre: 'Produit Decimal',
    categoria: 'Légumes',
    subcategoria: 'Carottes',
    unidad: 'unidad',
    icono: '🥕',
    peso: 1,
    pesoUnitario: 1,
    pesoRegistrado: 30,
    stockActual: 30,
    stockMinimo: 1,
    ubicacion: 'A1',
    lote: 'LOT-DECIMAL',
    fechaVencimiento: '2026-12-31',
    esPRS: false,
    activo: true,
    fechaCreacion: '2026-05-16T10:00:00.000Z',
    valorUnitario: 3,
    valorTotal: 90,
    temperatura: 'refrigerado',
    temperaturaAlmacenamiento: 'Refrigerado',
    temperaturaOriginalEntrada: 'refrigerado'
  };
}

function createComanda(product) {
  return {
    id: 'cmd-modify-decimal',
    numero: ORDER_NUMBER,
    numeroComanda: ORDER_NUMBER,
    organismoId: 'org-modify-decimal-smoke',
    organismoNombre: 'Organisme Smoke Decimal',
    nombreOrganismo: 'Organisme Smoke Decimal',
    fecha: '2026-05-16T10:30:00.000Z',
    fechaEntrega: '2026-05-18T10:30:00.000Z',
    observaciones: 'Commande smoke decimal',
    items: [
      {
        productoId: product.id,
        nombreProducto: product.nombre,
        productoNombre: product.nombre,
        cantidad: 2,
        cantidadEntregada: 0,
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
    estado: 'completada',
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
  } catch (error) {}

  for (const channel of ['msedge', 'chrome']) {
    try {
      const browser = await chromium.launch({ channel, headless: true, timeout: 30000 });
      return { browser, channel };
    } catch (error) {}
  }

  const browser = await chromium.launch({ headless: true, timeout: 30000 });
  return { browser, channel: 'chromium' };
}

async function seedStorage(page) {
  const product = createProduct();
  const comanda = createComanda(product);

  await page.addInitScript(({ product, comanda }) => {
    localStorage.setItem('banco_alimentos_productos', JSON.stringify([product]));
    localStorage.setItem('banco_alimentos_comandas', JSON.stringify([comanda]));
  }, { product, comanda });
}

async function login(page) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByLabel('Utilisateur').fill('David');
  await page.getByLabel('Mot de passe').fill('Lettycia26');
  await page.getByRole('button', { name: 'Connexion', exact: true }).click();
  await page.locator('main').first().waitFor({ timeout: 20000 });
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

async function getStoredQuantity(page) {
  return page.evaluate(() => {
    const comandas = JSON.parse(localStorage.getItem('banco_alimentos_comandas') || '[]');
    return comandas[0]?.items?.[0]?.cantidad ?? null;
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

    await dialog.getByRole('button', { name: 'Modifier les articles', exact: true }).click();
    const quantityInput = dialog.locator('input[inputmode="decimal"]').last();
    await quantityInput.waitFor({ timeout: 20000 });
    await quantityInput.fill('10,1');
    await dialog.getByRole('button', { name: 'Enregistrer les articles', exact: true }).click();

    await page.waitForFunction(() => {
      const comandas = JSON.parse(localStorage.getItem('banco_alimentos_comandas') || '[]');
      return comandas[0]?.items?.[0]?.cantidad === 10.1;
    }, { timeout: 20000 });

    const storedQuantity = await getStoredQuantity(page);
    assert(storedQuantity === 10.1, `La cantidad guardada debe ser 10.1 y fue ${storedQuantity}.`);

    console.log('COMANDAS_MODIFIER_ARTICLES_DECIMAL_FUNCTIONAL_OK');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('COMANDAS_MODIFIER_ARTICLES_DECIMAL_FUNCTIONAL_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
