const { chromium } = require('playwright');

const baseUrl = process.env.COMANDAS_INVENTARIO_BASE_URL || 'http://127.0.0.1:5173/';
const ORDER_NUMBER = 'CMD-SMOKE-INVENTAIRE-001';
const ORGANISM_NAME = 'Organisme Smoke Inventaire';
const PRODUCT_ID = 'prod-smoke-inventaire';
const PRODUCT_NAME = 'Produit Smoke Inventaire';

function logStep(step) {
  console.log(`STEP ${step}`);
}

function createProduct() {
  return {
    id: PRODUCT_ID,
    codigo: 'SMOKE-INV-001',
    nombre: PRODUCT_NAME,
    categoria: 'Légumes',
    subcategoria: 'Carottes',
    unidad: 'unidad',
    icono: '🥕',
    peso: 1,
    pesoUnitario: 1,
    pesoRegistrado: 5,
    stockActual: 5,
    stockMinimo: 1,
    ubicacion: 'A1',
    lote: 'LOT-SMOKE-INV',
    fechaVencimiento: '2026-12-31',
    esPRS: false,
    activo: true,
    fechaCreacion: '2026-05-16T10:00:00.000Z',
    valorUnitario: 4.5,
    valorTotal: 22.5,
    temperatura: 'refrigerado',
    temperaturaAlmacenamiento: 'Réfrigéré',
    temperaturaOriginalEntrada: 'refrigerado'
  };
}

function createComanda() {
  return {
    id: 'cmd-smoke-inventaire',
    numero: ORDER_NUMBER,
    numeroComanda: ORDER_NUMBER,
    organismoId: 'org-smoke-inventaire',
    organismoNombre: ORGANISM_NAME,
    nombreOrganismo: ORGANISM_NAME,
    fecha: '2026-05-16T10:30:00.000Z',
    fechaEntrega: '2026-05-18T10:30:00.000Z',
    observaciones: 'Comanda smoke UI inventaire',
    items: [
      {
        productoId: PRODUCT_ID,
        nombreProducto: PRODUCT_NAME,
        productoNombre: PRODUCT_NAME,
        cantidad: 2,
        cantidadEntregada: 0,
        unidad: 'unidad',
        icono: '🥕',
        valorUnitario: 4.5,
        peso: 2,
        temperatura: 'refrigerado',
        temperaturaOriginalEntrada: 'refrigerado'
      }
    ],
    valorTotal: 9,
    pesoTotal: 2,
    estado: 'completada',
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
  await Promise.all([
    page.locator('aside').first().waitFor({ timeout: 20000 }),
    page.locator('main').first().waitFor({ timeout: 20000 }),
  ]);
}

async function seedStorage(page) {
  logStep('seedStorage');
  await page.evaluate(({ product, comanda }) => {
    localStorage.setItem('banco_alimentos_productos', JSON.stringify([product]));
    localStorage.setItem('banco_alimentos_comandas', JSON.stringify([comanda]));
    localStorage.setItem('banco_alimentos_movimientos', JSON.stringify([]));
    localStorage.setItem('ofertas_sistema', JSON.stringify([]));
    localStorage.removeItem('movimientos_inventario');
  }, {
    product: createProduct(),
    comanda: createComanda()
  });
}

async function openComandas(page) {
  logStep('openComandas');
  await page.goto(`${baseUrl}?page=comandas`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByText('Vue compacte par état des commandes', { exact: true }).waitFor({ timeout: 20000 });
  await page.getByText(ORDER_NUMBER, { exact: true }).first().waitFor({ timeout: 20000 });
}

async function deliverOrderFromUi(page) {
  logStep('deliverOrderFromUi');
  await page.getByTitle('Voir la commande').first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByText('État de préparation', { exact: true }).waitFor({ timeout: 20000 });
  await dialog.getByRole('button', { name: 'Livrée', exact: true }).click();

  await page.waitForFunction((orderNumber) => {
    const comandas = JSON.parse(localStorage.getItem('banco_alimentos_comandas') || '[]');
    const movimientos = JSON.parse(localStorage.getItem('banco_alimentos_movimientos') || '[]');
    const productos = JSON.parse(localStorage.getItem('banco_alimentos_productos') || '[]');

    return comandas.some((comanda) => comanda.numero === orderNumber && comanda.estado === 'entregada')
      && movimientos.some((movimiento) => movimiento.numeroComanda === orderNumber && movimiento.tipo === 'distribucion_completada')
      && productos.some((producto) => producto.id === 'prod-smoke-inventaire' && producto.stockActual === 3);
  }, ORDER_NUMBER, { timeout: 20000 });
}

async function openInventoryMovements(page) {
  logStep('openInventoryMovements');
  await page.goto(`${baseUrl}?page=inventario`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByText('Inventaire', { exact: true }).first().waitFor({ timeout: 20000 });
  await page.getByRole('tab', { name: /Mouvements/i }).click();
  await page.getByText('Historique des mouvements', { exact: true }).waitFor({ timeout: 20000 });
}

async function assertMovementVisible(page) {
  logStep('assertMovementVisible');
  await page.getByText('Distribution livrée', { exact: true }).first().waitFor({ timeout: 20000 });
  await page.getByText(PRODUCT_NAME, { exact: true }).first().waitFor({ timeout: 20000 });
  await page.getByText(ORGANISM_NAME, { exact: true }).first().waitFor({ timeout: 20000 });
  await page.getByText('3 unidad', { exact: true }).first().waitFor({ timeout: 20000 });
}

async function main() {
  const { browser, channel } = await launchBrowser();
  console.log(`BROWSER ${channel}`);

  const page = await browser.newPage();

  try {
    await login(page);
    await seedStorage(page);
    await openComandas(page);
    await deliverOrderFromUi(page);
    await openInventoryMovements(page);
    await assertMovementVisible(page);
    console.log('COMANDAS_INVENTARIO_FUNCTIONAL_OK');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('COMANDAS_INVENTARIO_FUNCTIONAL_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});