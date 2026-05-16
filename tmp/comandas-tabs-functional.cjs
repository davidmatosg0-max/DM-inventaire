const { chromium } = require('playwright');

const baseUrl = process.env.COMANDAS_TABS_BASE_URL || 'http://127.0.0.1:5173/';
const ORDER_NUMBER = 'CMD-SMOKE-001';
const OFFER_NUMBER = 'OFE-2026-05-777';
const OFFER_TITLE = 'Offre Smoke Comandas';

function logStep(step) {
  console.log(`STEP ${step}`);
}

function createComanda() {
  return {
    id: 'cmd-smoke-tabs',
    numero: ORDER_NUMBER,
    numeroComanda: ORDER_NUMBER,
    organismoId: 'org-smoke-tabs',
    organismoNombre: 'Organisme Smoke Tabs',
    nombreOrganismo: 'Organisme Smoke Tabs',
    fecha: '2026-05-16T10:00:00.000Z',
    fechaEntrega: '2026-05-18T10:00:00.000Z',
    observaciones: 'Comanda smoke tabs',
    items: [
      {
        productoId: 'prod-smoke-tabs',
        nombreProducto: 'Produit Smoke Tabs',
        productoNombre: 'Produit Smoke Tabs',
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
    estado: 'pendiente',
    usuarioCreacion: 'Smoke Runner',
    creadoPor: 'Smoke Runner'
  };
}

function createOferta() {
  return {
    id: 'ofe-smoke-tabs',
    numeroOferta: OFFER_NUMBER,
    titulo: OFFER_TITLE,
    descripcion: 'Offre de smoke test pour les onglets Commandes',
    fechaCreacion: '2026-05-16T10:00:00.000Z',
    fechaExpiracion: '2026-12-31T10:00:00.000Z',
    estado: 'parcial',
    creadoPor: 'Smoke Runner',
    productos: [
      {
        productoId: 'prod-smoke-tabs',
        productoNombre: 'Produit Smoke Tabs',
        productoCodigo: 'SMOKE-TABS-001',
        categoria: 'Légumes',
        subcategoria: 'Carottes',
        cantidadOfrecida: 3,
        cantidadDisponible: 2,
        unidad: 'unidad',
        peso: 3,
        valorUnitario: 4.5,
        icono: '🥕'
      }
    ],
    organismosDestino: ['org-smoke-tabs'],
    aceptaciones: [
      {
        organismoId: 'org-smoke-tabs',
        organismoNombre: 'Organisme Smoke Tabs',
        fecha: '2026-05-16T11:00:00.000Z',
        productos: [{ productoId: 'prod-smoke-tabs', cantidadAceptada: 1 }]
      }
    ],
    solicitudes: [
      {
        id: 'sol-smoke-tabs',
        organismoId: 'org-smoke-tabs',
        organismoNombre: 'Organisme Smoke Tabs',
        fechaSolicitud: '2026-05-16T11:30:00.000Z',
        productosAceptados: [{ productoId: 'prod-smoke-tabs', cantidadAceptada: 1 }],
        estado: 'aceptada',
        fechaActualizacion: '2026-05-16T11:45:00.000Z'
      }
    ],
    totalProductos: 1,
    totalKilos: 3,
    valorMonetarioTotal: 13.5,
    visible: true,
    activa: true
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
  await page.evaluate(({ comanda, oferta }) => {
    localStorage.setItem('banco_alimentos_comandas', JSON.stringify([comanda]));
    localStorage.setItem('ofertas_sistema', JSON.stringify([oferta]));
    localStorage.setItem('comandas-tab-activo', '');
  }, {
    comanda: createComanda(),
    oferta: createOferta()
  });
}

async function openComandasPage(page) {
  logStep('openComandasPage');
  await page.goto(`${baseUrl}?page=comandas`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByText('Gestion des Commandes', { exact: true }).first().waitFor({ timeout: 20000 });
}

async function assertDefaultOrdersTab(page) {
  logStep('assertDefaultOrdersTab');
  const ordersTab = page.getByRole('tab', { name: 'Gestion des Commandes', exact: true });
  await page.getByText('Vue compacte par état des commandes', { exact: true }).waitFor({ timeout: 20000 });
  const selected = await ordersTab.getAttribute('aria-selected');
  if (selected !== 'true') {
    throw new Error('La page Comandas debería abrir por defecto en la pestaña Commandes');
  }
  await page.getByText(ORDER_NUMBER, { exact: true }).first().waitFor({ timeout: 20000 });
}

async function assertManualOffersTab(page) {
  logStep('assertManualOffersTab');
  const offersTab = page.getByRole('tab', { name: "Demandes d'offres", exact: true });
  await offersTab.click();
  await page.getByText('Vue compacte des offres et demandes', { exact: true }).waitFor({ timeout: 20000 });
  const selected = await offersTab.getAttribute('aria-selected');
  if (selected !== 'true') {
    throw new Error('La pestaña Demandes d\'offres no quedó activa tras el clic manual');
  }
  await page.getByText(OFFER_TITLE, { exact: true }).first().waitFor({ timeout: 20000 });
}

async function assertBackToOrdersTab(page) {
  logStep('assertBackToOrdersTab');
  const ordersTab = page.getByRole('tab', { name: 'Gestion des Commandes', exact: true });
  await ordersTab.click();
  await page.getByText('Vue compacte par état des commandes', { exact: true }).waitFor({ timeout: 20000 });
  const selected = await ordersTab.getAttribute('aria-selected');
  if (selected !== 'true') {
    throw new Error('La pestaña Commandes no volvió a activarse tras regresar desde Ofertas');
  }
}

async function assertStoredOffersRestore(page) {
  logStep('assertStoredOffersRestore');
  await page.evaluate(() => {
    localStorage.setItem('comandas-tab-activo', 'ofertas-cocina');
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  const offersTab = page.getByRole('tab', { name: "Demandes d'offres", exact: true });
  await page.getByText('Vue compacte des offres et demandes', { exact: true }).waitFor({ timeout: 20000 });
  const selected = await offersTab.getAttribute('aria-selected');
  if (selected !== 'true') {
    throw new Error('La pestaña Ofertas no se restauró desde comandas-tab-activo=ofertas-cocina');
  }
  const storedValue = await page.evaluate(() => localStorage.getItem('comandas-tab-activo'));
  if (storedValue !== null) {
    throw new Error(`La clave comandas-tab-activo debería limpiarse tras restaurar Ofertas y quedó en ${storedValue}`);
  }
}

async function main() {
  const { browser, channel } = await launchBrowser();
  console.log(`BROWSER ${channel}`);
  const page = await browser.newPage();

  try {
    await login(page);
    await seedStorage(page);
    await openComandasPage(page);
    await assertDefaultOrdersTab(page);
    await assertManualOffersTab(page);
    await assertBackToOrdersTab(page);
    await assertStoredOffersRestore(page);
    console.log('COMANDAS_TABS_FUNCTIONAL_OK');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('COMANDAS_TABS_FUNCTIONAL_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});