const { chromium } = require('playwright');

const baseUrl = process.env.COMANDAS_STATUS_BUTTONS_BASE_URL || 'http://127.0.0.1:5173/';

const ORDERS = {
  pending: 'CMD-STATUS-BTN-001',
  completed: 'CMD-STATUS-BTN-002',
  delivered: 'CMD-STATUS-BTN-003',
  cancelled: 'CMD-STATUS-BTN-004',
};

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
    organismoId: 'org-status-buttons-smoke',
    organismoNombre: 'Organisme Smoke Status Buttons',
    nombreOrganismo: 'Organisme Smoke Status Buttons',
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
  const products = [
    createProduct('prod-status-btn-1', 'Produit Status 1'),
    createProduct('prod-status-btn-2', 'Produit Status 2'),
    createProduct('prod-status-btn-3', 'Produit Status 3'),
    createProduct('prod-status-btn-4', 'Produit Status 4'),
  ];

  const comandas = [
    createComanda({ id: 'cmd-status-btn-1', numero: ORDERS.pending, estado: 'pendiente', productoId: products[0].id, productoNombre: products[0].nombre }),
    createComanda({ id: 'cmd-status-btn-2', numero: ORDERS.completed, estado: 'completada', productoId: products[1].id, productoNombre: products[1].nombre }),
    createComanda({ id: 'cmd-status-btn-3', numero: ORDERS.delivered, estado: 'entregada', productoId: products[2].id, productoNombre: products[2].nombre }),
    createComanda({ id: 'cmd-status-btn-4', numero: ORDERS.cancelled, estado: 'anulada', productoId: products[3].id, productoNombre: products[3].nombre }),
  ];

  await page.evaluate(({ products, comandas }) => {
    localStorage.setItem('banco_alimentos_productos', JSON.stringify(products));
    localStorage.setItem('banco_alimentos_comandas', JSON.stringify(comandas));
  }, { products, comandas });
}

async function openComandasPage(page) {
  logStep('openComandasPage');
  await page.goto(`${baseUrl}?page=comandas`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByText('Vue compacte par état des commandes', { exact: true }).waitFor({ timeout: 20000 });
}

function cardForOrder(page, orderNumber) {
  return page
    .getByText(orderNumber, { exact: true })
    .locator('xpath=ancestor::div[.//button[@title="Voir la commande"]][1]');
}

async function openOrder(page, orderNumber) {
  await cardForOrder(page, orderNumber).getByTitle('Voir la commande').click();
  const dialog = page.getByRole('dialog');
  await dialog.getByText(`Commande - ${orderNumber}`, { exact: true }).waitFor({ timeout: 20000 });
  return dialog;
}

async function closeOrder(page, dialog) {
  await dialog.getByRole('button', { name: 'Fermer', exact: true }).first().click();
  await dialog.waitFor({ state: 'hidden', timeout: 20000 });
}

async function assertButtonsForOrder(page, orderNumber, visibleButtons, hiddenButtons) {
  logStep(`assertButtons:${orderNumber}`);
  const dialog = await openOrder(page, orderNumber);

  for (const label of visibleButtons) {
    await dialog.getByRole('button', { name: label, exact: true }).waitFor({ timeout: 20000 });
  }

  for (const label of hiddenButtons) {
    const count = await dialog.getByRole('button', { name: label, exact: true }).count();
    if (count !== 0) {
      throw new Error(`Le bouton ${label} ne devrait pas être visible pour ${orderNumber}.`);
    }
  }

  await closeOrder(page, dialog);
}

async function main() {
  const { browser, channel } = await launchBrowser();
  console.log(`BROWSER ${channel}`);

  const page = await browser.newPage();

  try {
    await login(page);
    await seedStorage(page);
    await openComandasPage(page);
    await assertButtonsForOrder(page, ORDERS.pending, ['En attente', 'Acceptée', 'Annulée'], ['En préparation', 'Complétée', 'Livrée']);
    await assertButtonsForOrder(page, ORDERS.completed, ['En préparation', 'Complétée', 'Livrée', 'Annulée'], ['En attente', 'Acceptée']);
    await assertButtonsForOrder(page, ORDERS.delivered, ['Livrée'], ['En attente', 'Acceptée', 'En préparation', 'Complétée', 'Annulée']);
    await assertButtonsForOrder(page, ORDERS.cancelled, ['Annulée'], ['En attente', 'Acceptée', 'En préparation', 'Complétée', 'Livrée']);
    console.log('COMANDAS_STATUS_BUTTONS_FUNCTIONAL_OK');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('COMANDAS_STATUS_BUTTONS_FUNCTIONAL_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
