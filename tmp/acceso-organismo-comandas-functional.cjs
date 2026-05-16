const { chromium } = require('playwright');

const baseUrl = process.env.ACCESO_ORGANISMO_COMANDAS_BASE_URL || 'http://127.0.0.1:5173/';
const ACCESS_KEY = 'CMD-4P8Q2L';
const ORGANISM_ID = 'org-smoke-comanda-portal';
const ORGANISM_NAME = 'Organisme Smoke Commande';
const PRODUCT_ID = 'prod-smoke-comanda-portal';
const PRODUCT_NAME = 'Produit Smoke Commande';
const ORDER_NUMBER = 'CMD-PORTAIL-001';

function logStep(step) {
  console.log(`STEP ${step}`);
}

function createOrganism() {
  const now = '2026-05-16T10:00:00.000Z';

  return {
    id: ORGANISM_ID,
    nombre: ORGANISM_NAME,
    tipo: 'Banque alimentaire',
    email: 'commande.portal@example.org',
    telefono: '(514) 555-0303',
    direccion: '500 rue Commande',
    codigoPostal: 'H3H 3H3',
    quartier: 'Villeray',
    responsable: 'Responsable Commande',
    beneficiarios: 35,
    activo: true,
    regular: true,
    clasificacionOrganismo: 'regular',
    participantePRS: false,
    personasServidas: 35,
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

function createProduct() {
  return {
    id: PRODUCT_ID,
    codigo: 'CMD-SMOKE-001',
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
    lote: 'LOT-CMD-001',
    fechaVencimiento: '2026-12-31',
    esPRS: false,
    activo: true,
    fechaCreacion: '2026-05-16T10:00:00.000Z',
    valorUnitario: 3,
    valorTotal: 15,
    temperatura: 'refrigerado',
    temperaturaAlmacenamiento: 'Refrigerado',
    temperaturaOriginalEntrada: 'refrigerado'
  };
}

function createComanda() {
  return {
    id: 'cmd-smoke-portal-001',
    numero: ORDER_NUMBER,
    numeroComanda: ORDER_NUMBER,
    organismoId: ORGANISM_ID,
    organismoNombre: ORGANISM_NAME,
    nombreOrganismo: ORGANISM_NAME,
    fecha: '2026-05-16T10:30:00.000Z',
    fechaEntrega: '2026-05-18T10:30:00.000Z',
    observaciones: 'Commande smoke portail',
    items: [
      {
        productoId: PRODUCT_ID,
        nombreProducto: PRODUCT_NAME,
        productoNombre: PRODUCT_NAME,
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
    estado: 'pendiente',
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

async function seedStorage(page) {
  logStep('seedStorage');
  await page.goto(`${baseUrl}?page=acceso-organismo`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(({ organism, product, comanda }) => {
    localStorage.setItem('organismos_banco_alimentos', JSON.stringify([organism]));
    localStorage.setItem('banco_alimentos_productos', JSON.stringify([product]));
    localStorage.setItem('banco_alimentos_comandas', JSON.stringify([comanda]));
    localStorage.setItem('banco_alimentos_movimientos', JSON.stringify([]));
  }, {
    organism: createOrganism(),
    product: createProduct(),
    comanda: createComanda(),
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
}

async function loginToPortal(page) {
  logStep('loginToPortal');
  await page.getByLabel("Clé d'Accès").fill(ACCESS_KEY);
  await page.getByRole('button', { name: 'Accéder à Mon Profil', exact: true }).click();
  await page.getByRole('button', { name: 'Voir les Détails', exact: true }).waitFor({ timeout: 20000 });
}

async function acceptPortalComanda(page) {
  logStep('acceptPortalComanda');
  await page.getByRole('button', { name: 'Voir les Détails', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByText(`Commande - ${ORDER_NUMBER}`, { exact: true }).waitFor({ timeout: 20000 });
  await dialog.getByRole('button', { name: 'Accepter tout', exact: true }).click();
}

async function assertComandaUpdatedWithoutInventoryDelivery(page) {
  logStep('assertComandaUpdatedWithoutInventoryDelivery');
  await page.waitForFunction(({ orderNumber, productId }) => {
    const comandas = JSON.parse(localStorage.getItem('banco_alimentos_comandas') || '[]');
    const movimientos = JSON.parse(localStorage.getItem('banco_alimentos_movimientos') || '[]');
    const productos = JSON.parse(localStorage.getItem('banco_alimentos_productos') || '[]');

    const comanda = comandas.find((item) => item.numero === orderNumber);
    const producto = productos.find((item) => item.id === productId);

    return Boolean(
      comanda
      && comanda.estado === 'confirmada'
      && comanda.confirmadaPorOrganismo === true
      && typeof comanda.fechaConfirmacion === 'string'
      && producto
      && producto.stockActual === 5
      && !movimientos.some((item) => item.tipo === 'distribucion_completada' && item.numeroComanda === orderNumber)
    );
  }, {
    orderNumber: ORDER_NUMBER,
    productId: PRODUCT_ID,
  }, { timeout: 20000 });
}

async function main() {
  const { browser, channel } = await launchBrowser();
  console.log(`BROWSER ${channel}`);

  const page = await browser.newPage();

  try {
    await seedStorage(page);
    await loginToPortal(page);
    await acceptPortalComanda(page);
    await assertComandaUpdatedWithoutInventoryDelivery(page);
    console.log('ACCESO_ORGANISMO_COMANDAS_FUNCTIONAL_OK');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('ACCESO_ORGANISMO_COMANDAS_FUNCTIONAL_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
