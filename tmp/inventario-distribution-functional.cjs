const { chromium } = require('playwright');

const baseUrl = process.env.INVENTARIO_DISTRIBUTION_BASE_URL || 'http://127.0.0.1:5173/';
const PRODUCT_NAME = 'Produit Smoke Distribution';
const INDIVIDUAL_ORGANIZATION_NAME = 'Organisme Smoke Distribution';
const GROUP_ORGANIZATIONS = [
  { id: 'org-group-1', nombre: 'Organisme Groupe Alpha', porcentajeReparticion: 60, clasificacionOrganismo: 'regular' },
  { id: 'org-group-2', nombre: 'Organisme Groupe Beta', porcentajeReparticion: 40, clasificacionOrganismo: 'regular' }
];
const COLLATION_ORGANIZATIONS = [
  { id: 'org-collation-1', nombre: 'Organisme Collation Alpha', porcentajeReparticion: 70, clasificacionOrganismo: 'collation' },
  { id: 'org-collation-2', nombre: 'Organisme Collation Beta', porcentajeReparticion: 30, clasificacionOrganismo: 'collation' }
];
const GROUP_QUANTITY = 6;

function logStep(step) {
  console.log(`STEP ${step}`);
}

function createProduct() {
  return {
    id: 'prod-smoke-distribution',
    codigo: 'SMOKE-DIST-001',
    nombre: PRODUCT_NAME,
    categoria: 'Légumes',
    subcategoria: 'Carottes',
    unidad: 'unidad',
    icono: '🥕',
    peso: 1,
    pesoUnitario: 1,
    pesoRegistrado: 1,
    stockActual: 12,
    stockMinimo: 1,
    ubicacion: 'A1',
    lote: 'LOT-SMOKE',
    fechaVencimiento: '2026-12-31',
    esPRS: false,
    activo: true,
    fechaCreacion: '2026-05-16T00:00:00.000Z',
    valorUnitario: 4.5,
    valorTotal: 54,
    temperatura: 'refrigerado',
    temperaturaAlmacenamiento: 'Refrigerado',
    temperaturaOriginalEntrada: 'refrigerado'
  };
}

function createOrganism({ id, nombre, porcentajeReparticion, clasificacionOrganismo }) {
  return {
    id,
    nombre,
    tipo: 'Organisme communautaire',
    email: `${id}@example.test`,
    telefono: '555-0101',
    direccion: '123 Rue Test',
    responsable: 'Responsable Smoke',
    beneficiarios: 20,
    activo: true,
    regular: clasificacionOrganismo !== 'eventual',
    clasificacionOrganismo,
    participantePRS: false,
    personasServidas: 20,
    cantidadColaciones: 0,
    cantidadAlmuerzos: 0,
    porcentajeReparticion,
    notificaciones: true,
    claveAcceso: `${id.toUpperCase()}2026`,
    contactosNotificacion: [],
    fechaCreacion: '2026-05-16T00:00:00.000Z',
    fechaModificacion: '2026-05-16T00:00:00.000Z'
  };
}

function getScenarioData(mode) {
  if (mode === 'individual') {
    return {
      product: createProduct(),
      organisms: [
        createOrganism({
          id: 'org-smoke-distribution',
          nombre: INDIVIDUAL_ORGANIZATION_NAME,
          porcentajeReparticion: 25,
          clasificacionOrganismo: 'regular'
        })
      ]
    };
  }

  if (mode === 'grupo') {
    return {
      product: createProduct(),
      organisms: GROUP_ORGANIZATIONS.map((organism) => createOrganism(organism))
    };
  }

  return {
    product: createProduct(),
    organisms: COLLATION_ORGANIZATIONS.map((organism) => createOrganism(organism))
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

async function seedStorage(page, mode) {
  logStep(`seedStorage:${mode}`);
  const { product, organisms } = getScenarioData(mode);
  await page.evaluate(({ productData, organismsData }) => {
    localStorage.setItem('banco_alimentos_productos', JSON.stringify([productData]));
    localStorage.setItem('organismos_banco_alimentos', JSON.stringify(organismsData));
    localStorage.setItem('banco_alimentos_comandas', JSON.stringify([]));
    localStorage.setItem('notificaciones_sistema', JSON.stringify([]));
  }, {
    productData: product,
    organismsData: organisms
  });
}

async function openInventory(page, mode) {
  logStep(`openInventory:${mode}`);
  await page.goto(`${baseUrl}?page=inventario`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByText('Inventaire', { exact: true }).first().waitFor({ timeout: 20000 });
  await page.getByText(PRODUCT_NAME, { exact: true }).first().waitFor({ timeout: 20000 });
}

async function addProductToCart(page, mode) {
  logStep(`addProductToCart:${mode}`);
  const productRow = page.getByText(PRODUCT_NAME, { exact: true }).first().locator('xpath=ancestor::tr[1]');
  await productRow.getByTitle('Ajouter').click();
  await page.getByTitle('Panier de Produits').click();
  await page.locator('[data-slot="sheet-content"]').getByRole('button', { name: /Accès Organismes/i }).waitFor({ timeout: 20000 });
}

function getActiveDialog(page) {
  return page.locator('[role="dialog"]').last();
}

async function openDistributionWizard(page, mode) {
  logStep(`openDistributionWizard:${mode}`);
  await page.locator('[data-slot="sheet-content"]').getByRole('button', { name: /Accès Organismes/i }).click();
  const dialog = getActiveDialog(page);
  await dialog.getByText('Organisme individuel', { exact: true }).waitFor({ timeout: 20000 });
  return dialog;
}

async function setEditQuantity(page, quantity, mode) {
  logStep(`setEditQuantity:${mode}`);
  const dialog = getActiveDialog(page);
  const quantityInput = dialog.locator('input[inputmode="numeric"], input[inputmode="decimal"], input[type="number"]').first();
  await quantityInput.fill(String(quantity));
  await quantityInput.blur();
}

async function createIndividualDistribution(page) {
  logStep('createIndividualDistribution');
  await openDistributionWizard(page, 'individual');
  let dialog = getActiveDialog(page);
  await dialog.getByRole('button', { name: 'Suivant' }).click();
  await dialog.getByText(/Modifier les quantités/i).first().waitFor({ timeout: 20000 });
  await dialog.getByRole('button', { name: 'Suivant' }).click();
  dialog = getActiveDialog(page);
  await dialog.getByText(/Sélectionner un organisme/i).first().waitFor({ timeout: 20000 });
  await dialog.getByRole('combobox').click();
  await page.getByRole('option', { name: INDIVIDUAL_ORGANIZATION_NAME, exact: true }).click();
  await dialog.getByRole('button', { name: 'Créer la comanda' }).click();
}

async function createGroupedDistribution(page, mode) {
  logStep(`createGroupedDistribution:${mode}`);
  const cardTitle = mode === 'grupo' ? 'Distribution de groupe' : 'Distribution Collation';

  await openDistributionWizard(page, mode);
  let dialog = getActiveDialog(page);
  await dialog.getByText(cardTitle, { exact: true }).first().click();
  await dialog.getByRole('button', { name: 'Suivant' }).click();
  await dialog.getByText(/Modifier les quantités/i).first().waitFor({ timeout: 20000 });
  await setEditQuantity(page, GROUP_QUANTITY, mode);
  await dialog.getByRole('button', { name: 'Suivant' }).click();
  dialog = getActiveDialog(page);
  await dialog.getByText(cardTitle, { exact: false }).first().waitFor({ timeout: 20000 });
  await dialog.getByRole('button', { name: /Créer les comandas/i }).click();
}

async function readCommands(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('banco_alimentos_comandas') || '[]'));
}

async function assertIndividualStorage(page) {
  logStep('assertIndividualStorage');
  await page.waitForFunction(() => {
    const comandas = JSON.parse(localStorage.getItem('banco_alimentos_comandas') || '[]');
    return comandas.length === 1;
  }, { timeout: 20000 });

  const result = await page.evaluate(() => {
    const comandas = JSON.parse(localStorage.getItem('banco_alimentos_comandas') || '[]');
    return {
      comanda: comandas[0],
      commandCount: comandas.length
    };
  });

  if (result.commandCount !== 1) {
    throw new Error(`Se esperaba 1 comanda y se encontraron ${result.commandCount}`);
  }

  if (result.comanda?.nombreOrganismo !== INDIVIDUAL_ORGANIZATION_NAME) {
    throw new Error(`La comanda individual no quedó asociada al organismo esperado: ${result.comanda?.nombreOrganismo || 'sin organismo'}`);
  }

  if (result.comanda?.estado !== 'pendiente') {
    throw new Error(`La comanda individual debería crearse en estado pendiente y quedó en ${result.comanda?.estado}`);
  }

  const firstItem = result.comanda?.items?.[0];
  if (!firstItem || firstItem.productoNombre !== PRODUCT_NAME || firstItem.cantidad !== 1) {
    throw new Error('La comanda individual no persistió el item esperado del inventario');
  }

  await page.getByTitle('Panier de Produits').click();
  await page.getByText('Ton panier est vide', { exact: true }).waitFor({ timeout: 20000 });
}

async function assertGroupedStorage(page, mode) {
  logStep(`assertGroupedStorage:${mode}`);
  const expectedOrganizations = mode === 'grupo' ? GROUP_ORGANIZATIONS : COLLATION_ORGANIZATIONS;
  const expectedNames = expectedOrganizations.map((organism) => organism.nombre).sort();
  const expectedLabelPrefix = mode === 'grupo' ? 'Distribution de groupe' : 'Distribution Collation';
  const expectedModalidad = mode === 'grupo' ? 'grupo' : 'collation';

  await page.waitForFunction((expectedCount) => {
    const comandas = JSON.parse(localStorage.getItem('banco_alimentos_comandas') || '[]');
    return comandas.length === expectedCount;
  }, expectedOrganizations.length, { timeout: 20000 });

  const commands = await readCommands(page);
  if (commands.length !== expectedOrganizations.length) {
    throw new Error(`Se esperaban ${expectedOrganizations.length} comandas ${mode} y se encontraron ${commands.length}`);
  }

  const names = commands.map((command) => command.nombreOrganismo).sort();
  if (JSON.stringify(names) !== JSON.stringify(expectedNames)) {
    throw new Error(`Las comandas ${mode} no quedaron asociadas a los organismos esperados: ${names.join(', ')}`);
  }

  const groupIds = new Set(commands.map((command) => command.grupoDistribucionId).filter(Boolean));
  if (groupIds.size !== 1) {
    throw new Error(`Las comandas ${mode} deberían compartir un único grupoDistribucionId`);
  }

  for (const command of commands) {
    if (command.estado !== 'pendiente') {
      throw new Error(`La comanda ${mode} ${command.numero} debería quedar en pendiente y quedó en ${command.estado}`);
    }

    if (command.modalidadDistribucion !== expectedModalidad) {
      throw new Error(`La comanda ${mode} ${command.numero} debería usar modalidad ${expectedModalidad} y quedó en ${command.modalidadDistribucion}`);
    }

    if (!command.grupoDistribucionEtiqueta || !command.grupoDistribucionEtiqueta.startsWith(expectedLabelPrefix)) {
      throw new Error(`La comanda ${mode} ${command.numero} no conservó la etiqueta de grupo esperada`);
    }

    if (command.grupoDistribucionAnclada !== true) {
      throw new Error(`La comanda ${mode} ${command.numero} debería quedar anclada por defecto`);
    }

    const totalItems = Array.isArray(command.items)
      ? command.items.reduce((sum, item) => sum + Number(item.cantidad || 0), 0)
      : 0;

    if (totalItems <= 0) {
      throw new Error(`La comanda ${mode} ${command.numero} no recibió productos asignados`);
    }
  }
}

async function runScenario(page, mode) {
  logStep(`scenario:${mode}:start`);
  await seedStorage(page, mode);
  await openInventory(page, mode);
  await addProductToCart(page, mode);

  if (mode === 'individual') {
    await createIndividualDistribution(page);
    await assertIndividualStorage(page);
  } else {
    await createGroupedDistribution(page, mode);
    await assertGroupedStorage(page, mode);
  }

  logStep(`scenario:${mode}:ok`);
}

async function main() {
  const { browser, channel } = await launchBrowser();
  console.log(`BROWSER ${channel}`);
  const page = await browser.newPage();

  try {
    await login(page);
    await runScenario(page, 'individual');
    await runScenario(page, 'grupo');
    await runScenario(page, 'collation');
    console.log('INVENTARIO_DISTRIBUTION_FUNCTIONAL_OK');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('INVENTARIO_DISTRIBUTION_FUNCTIONAL_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});