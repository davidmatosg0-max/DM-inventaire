const { chromium } = require('playwright');

const baseUrl = process.env.COMANDAS_VARIANT_ICON_UI_BASE_URL || 'http://127.0.0.1:5173/';
const ORDER_NUMBER = 'CMD-VAR-ICON-UI-001';
const OLD_ICON = '🐓';
const NEW_ICON = '🥬';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function createLegacyProduct() {
  return {
    id: 'prod-var-icon-ui-legacy',
    codigo: 'AUTO-1778989921216',
    nombre: 'Légumes',
    categoria: 'Légumes',
    subcategoria: 'Légumes verts',
    unidad: 'CJA',
    icono: OLD_ICON,
    peso: 15,
    pesoUnitario: 15,
    pesoRegistrado: 180,
    stockActual: 12,
    stockMinimo: 1,
    ubicacion: 'A2',
    lote: 'LOT-8867',
    fechaVencimiento: '2026-12-31',
    esPRS: true,
    activo: true,
    fechaCreacion: '2026-05-17T10:10:00.000Z',
    temperatura: 'refrigerado',
    temperaturaAlmacenamiento: 'Refrigerado',
    temperaturaOriginalEntrada: 'refrigerado',
    valorUnitario: 2,
    valorTotal: 24,
  };
}

function createComanda() {
  return {
    id: 'cmd-var-icon-ui-001',
    numero: ORDER_NUMBER,
    numeroComanda: ORDER_NUMBER,
    organismoId: 'org-var-icon-ui',
    organismoNombre: 'Organisme Variante UI',
    nombreOrganismo: 'Organisme Variante UI',
    fecha: '2026-05-17T10:30:00.000Z',
    fechaEntrega: '2026-05-18T10:30:00.000Z',
    observaciones: 'Commande test pour icône variante legacy',
    items: [
      {
        productoId: 'prod-var-icon-ui-legacy',
        nombreProducto: 'Légumes',
        productoNombre: 'Légumes',
        cantidad: 12,
        cantidadEntregada: 0,
        unidad: 'CJA',
        icono: OLD_ICON,
        peso: 15,
        valorUnitario: 2,
        temperatura: 'refrigerado',
        temperaturaOriginalEntrada: 'refrigerado',
      },
    ],
    valorTotal: 24,
    pesoTotal: 180,
    estado: 'pendiente',
    usuarioCreacion: 'Smoke Runner',
    creadoPor: 'Smoke Runner',
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
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByLabel('Utilisateur').fill('David');
  await page.getByLabel('Mot de passe').fill('Lettycia26');
  await page.getByRole('button', { name: 'Connexion', exact: true }).click();
  await page.locator('main').first().waitFor({ timeout: 20000 });
}

async function seedAndSync(page) {
  const legacyProduct = createLegacyProduct();
  const comanda = createComanda();

  const resultado = await page.evaluate(async ({ product, order, newIcon }) => {
    localStorage.setItem('banco_alimentos_productos', JSON.stringify([product]));
    localStorage.setItem('banco_alimentos_comandas', JSON.stringify([order]));

    const { sincronizarProductosPorVariante } = await import('/src/app/utils/productStorage.ts');
    const { obtenerComandas } = await import('/src/app/utils/comandaStorage.ts');

    const actualizados = sincronizarProductosPorVariante({
      varianteNombreAnterior: 'Legumes',
      varianteNombreNuevo: 'Legumes',
      categoria: 'Légumes',
      subcategoria: 'Légumes verts',
      icono: newIcon,
    });

    return {
      actualizados,
      producto: JSON.parse(localStorage.getItem('banco_alimentos_productos') || '[]')[0],
      comandaPersistida: JSON.parse(localStorage.getItem('banco_alimentos_comandas') || '[]')[0],
      comandaNormalizada: obtenerComandas()[0],
    };
  }, {
    product: legacyProduct,
    order: comanda,
    newIcon: NEW_ICON,
  });

  assert(resultado.actualizados === 1, `Se esperaba 1 producto actualizado y se recibió ${resultado.actualizados}.`);
  assert(resultado.producto?.icono === NEW_ICON, `El producto no se actualizó en almacenamiento: ${JSON.stringify(resultado.producto)}`);
  assert(resultado.comandaPersistida?.items?.[0]?.icono === NEW_ICON, `La comanda persistida no recibió el icono nuevo: ${JSON.stringify(resultado.comandaPersistida)}`);
  assert(resultado.comandaNormalizada?.items?.[0]?.icono === NEW_ICON, `La comanda normalizada no recibió el icono nuevo: ${JSON.stringify(resultado.comandaNormalizada)}`);
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

async function assertDialogIcon(dialog) {
  const row = dialog.locator('tr', { hasText: 'Légumes' }).first();
  await row.waitFor({ timeout: 20000 });

  const rowText = (await row.textContent()) || '';
  assert(rowText.includes(NEW_ICON), `La fila de ModeloComanda no muestra el icono nuevo. Texto recibido: ${rowText}`);
  assert(!rowText.includes(OLD_ICON), `La fila de ModeloComanda todavía muestra el icono viejo. Texto recibido: ${rowText}`);
}

async function main() {
  const { browser, channel } = await launchBrowser();
  console.log(`BROWSER ${channel}`);

  const page = await browser.newPage();

  try {
    await login(page);
    await seedAndSync(page);
    const dialog = await openComanda(page);
    await assertDialogIcon(dialog);
    console.log('COMANDAS_VARIANT_ICON_UI_FUNCTIONAL_OK');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('COMANDAS_VARIANT_ICON_UI_FUNCTIONAL_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});