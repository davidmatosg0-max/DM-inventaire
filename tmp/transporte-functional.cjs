const { chromium } = require('playwright');

const baseUrl = process.env.TRANSPORTE_BASE_URL || 'http://127.0.0.1:4175/';

function logStep(step) {
  console.log(`STEP ${step}`);
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
  await page.getByRole('heading', { name: 'Tableau de Bord Principal - Entrepôt', exact: true }).waitFor({ timeout: 20000 });
}

async function openTransport(page) {
  logStep('openTransport');
  const transportHeading = page.getByRole('heading', { name: 'Gestion du Transport', exact: true });
  if (await transportHeading.isVisible().catch(() => false)) {
    return;
  }

  const sidebar = page.locator('aside').first();
  await sidebar.waitFor({ timeout: 20000 });

  const transportButton = sidebar.getByRole('button', { name: /transport/i }).last();
  if (!(await transportButton.isVisible().catch(() => false))) {
    const warehouseButton = sidebar.getByRole('button', { name: /entrep[oô]t/i }).first();
    await warehouseButton.click();
  }

  await transportButton.waitFor({ state: 'visible', timeout: 10000 });
  await transportButton.click();

  await transportHeading.waitFor({ timeout: 20000 });
  await page.getByRole('tab', { name: /gestion.*v[eé]hicules/i }).waitFor({ timeout: 10000 });
}

async function resetTransportStorage(page) {
  logStep('resetTransportStorage');
  await page.evaluate(() => {
    const keys = [
      'banco_alimentos_vehiculos',
      'banco_alimentos_choferes',
      'banco_alimentos_rutas',
      'banque_alimentaire_transporte_ui_vehiculos',
      'banque_alimentaire_transporte_ui_rutas',
      'banque_alimentaire_transporte_ui_choferes'
    ];

    keys.forEach((key) => localStorage.removeItem(key));

    const choferesKey = 'banco_alimentos_choferes';
    localStorage.setItem(choferesKey, JSON.stringify([
      {
        id: 'transport-test-driver',
        nombre: 'Conducteur Test',
        apellido: 'Transport',
        cedula: 'TST-123456',
        licencia: 'QC-TEST-001',
        tipoLicencia: 'Clase 5',
        telefono: '+1 (514) 555-1111',
        email: 'driver-transport-test@example.com',
        fechaNacimiento: '1990-01-01',
        fechaContratacion: '2025-01-01',
        estado: 'activo',
        vehiculoAsignado: '',
        experienciaAnios: 3,
        certificaciones: ['SAAQ'],
        foto: '👤',
        joursDisponibles: [{ jour: 'Lundi', horaire: 'AM/PM' }]
      }
    ]));

    const organismosKey = 'organismos_banco_alimentos';
    const organismosActuales = JSON.parse(localStorage.getItem(organismosKey) || '[]');
    const organismoPruebaId = 'transport-test-organism';
    const existeOrganismoPrueba = organismosActuales.some((organismo) => organismo.id === organismoPruebaId);

    if (!existeOrganismoPrueba) {
      organismosActuales.push({
        id: organismoPruebaId,
        nombre: 'Organisme Test Transport',
        tipo: 'Banco alimentario',
        email: 'transport-test@example.com',
        telefono: '514-000-0000',
        direccion: '123 Rue du Test',
        codigoPostal: 'H1H1H1',
        quartier: 'Centre',
        zona: 'Nord',
        responsable: 'David',
        beneficiarios: 25,
        activo: true,
        regular: true,
        participantePRS: false,
        personasServidas: 25,
        cantidadColaciones: 0,
        cantidadAlmuerzos: 0,
        porcentajeReparticion: 100,
        notificaciones: false,
        contactosNotificacion: [],
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString(),
      });
      localStorage.setItem(organismosKey, JSON.stringify(organismosActuales));
    }

    window.dispatchEvent(new CustomEvent('transporte-ui-actualizado', { detail: { scope: 'reset' } }));
  });
}

async function getKpiValue(page, label) {
  return page.evaluate((expectedLabel) => {
    const labelNode = Array.from(document.querySelectorAll('p')).find((node) => node.textContent?.trim() === expectedLabel);
    if (!labelNode || !labelNode.parentElement) {
      return null;
    }

    const values = Array.from(labelNode.parentElement.querySelectorAll('p'))
      .map((node) => node.textContent?.trim() || '')
      .filter((text) => /^\d+$/.test(text));

    return values[0] || null;
  }, label);
}

async function openVehiclesTab(page) {
  await page.getByRole('tab', { name: /gestion.*v[eé]hicules/i }).click();
  await page.getByRole('button', { name: /ajouter.*v[eé]hicule/i }).waitFor({ timeout: 10000 });
}

async function createVehicle(page, vehicle) {
  logStep('createVehicle');
  await openVehiclesTab(page);
  await page.getByRole('button', { name: /ajouter.*v[eé]hicule/i }).click();

  const dialog = page.locator('[data-slot="dialog-content"]').last();
  await dialog.waitFor({ state: 'visible', timeout: 10000 });
  await dialog.getByPlaceholder('ABC-123').fill(vehicle.plate);
  await dialog.getByPlaceholder('Mercedes-Benz').fill(vehicle.brand);
  await dialog.getByPlaceholder('Actros 2546').fill(vehicle.model);
  await dialog.getByPlaceholder('2024').fill(String(vehicle.year));
  await dialog.getByPlaceholder('10000').fill(String(vehicle.capacityKg));
  await dialog.getByPlaceholder(/^45$/).fill(String(vehicle.capacityM3));
  await dialog.getByPlaceholder(/^8\.5$/).fill(String(vehicle.fuel));
  await dialog.getByPlaceholder(/^45000$/).fill(String(vehicle.km));
  await dialog.getByRole('button', { name: /Ajouter.*Véhicule/i }).click();

  await page.waitForFunction((plate) => document.body.innerText.includes(plate), vehicle.plate, { timeout: 10000 });
}

async function assertVehicleAvailable(page, plate) {
  logStep('assertVehicleAvailable');
  await openVehiclesTab(page);

  const card = page.locator('[data-slot="card"]').filter({ hasText: plate }).first();
  await card.waitFor({ timeout: 10000 });
  await card.getByText('Disponible', { exact: true }).waitFor({ timeout: 10000 });
}

async function openRoutesTab(page) {
  await page.getByRole('tab', { name: /planification.*itin[eé]raires|planification.*routes/i }).click();
  await page.getByRole('button', { name: /nouvel.*itin[eé]raire|nouvelle.*route/i }).waitFor({ timeout: 10000 });
}

async function createRoute(page, route) {
  logStep('createRoute');
  await openRoutesTab(page);
  await page.getByRole('button', { name: /nouvel.*itin[eé]raire|nouvelle.*route/i }).click();

  const dialog = page.locator('[data-slot="dialog-content"]').last();
  await dialog.waitFor({ state: 'visible', timeout: 10000 });
  await dialog.getByPlaceholder('Itinéraire Centre - Zone Nord').fill(route.name);
  await dialog.locator('input[type="date"]').first().fill(route.date);

  await dialog.getByTestId('route-vehicle-select').click();
  await page.getByRole('option', { name: new RegExp(route.plate.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).click();

  await dialog.getByTestId('route-driver-select').click();
  await page.getByRole('option', { name: /conducteur test transport/i }).click();

  await dialog.getByTestId('route-add-stop-action').click();
  await dialog.getByTestId('route-stop-destination-select-0').waitFor({ state: 'visible', timeout: 10000 });

  await dialog.getByTestId('route-stop-destination-select-0').click();
  await page.getByRole('option', { name: /organisme test transport/i }).click();

  await dialog.getByTestId('route-stop-arrival-time-0').fill('08:30');
  await dialog.getByTestId('route-stop-unloading-time-0').fill('15');
  await dialog.getByTestId('route-submit-action').click();

  await page.waitForFunction((routeName) => document.body.innerText.includes(routeName), route.name, { timeout: 10000 });
}

async function assertRoutePersisted(page, routeName) {
  logStep('assertRoutePersisted');
  await openRoutesTab(page);
  await page.getByText(routeName, { exact: true }).waitFor({ timeout: 10000 });
}

async function readRouteAndVehicleState(page, routeName, plate) {
  return page.evaluate(({ currentRouteName, currentPlate }) => {
    const rutas = JSON.parse(localStorage.getItem('banco_alimentos_rutas') || '[]');
    const vehiculos = JSON.parse(localStorage.getItem('banco_alimentos_vehiculos') || '[]');

    const ruta = rutas.find((item) => item.nombre === currentRouteName);
    const vehiculo = vehiculos.find((item) => (item.placa || item.matricula) === currentPlate);

    return {
      routeState: ruta?.estado || null,
      vehicleState: vehiculo?.estado || null,
      routeExists: Boolean(ruta),
      vehicleExists: Boolean(vehiculo),
    };
  }, { currentRouteName: routeName, currentPlate: plate });
}

async function startRoute(page, routeName) {
  logStep('startRoute');
  await openRoutesTab(page);
  const routeCard = page.locator('[data-slot="card"]').filter({ hasText: routeName }).first();
  await routeCard.waitFor({ timeout: 10000 });
  await routeCard.locator('[data-testid="route-start-action"]').click();
  await page.waitForFunction((currentRouteName) => {
    const rutas = JSON.parse(localStorage.getItem('banco_alimentos_rutas') || '[]');
    const ruta = rutas.find((item) => item.nombre === currentRouteName);
    return ruta?.estado === 'en_curso';
  }, routeName, { timeout: 10000 });
}

async function completeRoute(page, routeName) {
  logStep('completeRoute');
  await openRoutesTab(page);
  const routeCard = page.locator('[data-slot="card"]').filter({ hasText: routeName }).first();
  await routeCard.waitFor({ timeout: 10000 });
  await routeCard.locator('[data-testid="route-complete-action"]').click();
  await page.waitForFunction((currentRouteName) => {
    const rutas = JSON.parse(localStorage.getItem('banco_alimentos_rutas') || '[]');
    const ruta = rutas.find((item) => item.nombre === currentRouteName);
    return ruta?.estado === 'completada';
  }, routeName, { timeout: 10000 });
}

(async () => {
  const uniqueId = Date.now();
  const vehicle = {
    plate: `TR-${String(uniqueId).slice(-4)}`,
    brand: 'Ford',
    model: 'Transit',
    year: 2024,
    capacityKg: 2500,
    capacityM3: 14,
    fuel: 11.5,
    km: 12345,
  };
  const route = {
    name: `Route Test ${uniqueId}`,
    date: '2026-04-27',
    plate: vehicle.plate,
  };

  let browser;
  try {
    const launched = await launchBrowser();
    browser = launched.browser;
    const context = await browser.newContext({ viewport: { width: 1600, height: 1400 } });
    await context.addInitScript(() => {
      window.confirm = () => true;
    });
    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    page.on('pageerror', (error) => {
      console.error('PAGE_ERROR');
      console.error(error && error.stack ? error.stack : error);
    });
    page.on('console', (message) => {
      if (message.type() === 'error') {
        console.error('BROWSER_CONSOLE_ERROR');
        console.error(message.text());
      }
    });

    await login(page);
    await openTransport(page);
    await resetTransportStorage(page);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await openTransport(page);

    const initialVehicles = await getKpiValue(page, 'Total Véhicules');
    if (initialVehicles !== '0') {
      throw new Error(`Expected 0 vehicles after reset, got ${initialVehicles}`);
    }

    await createVehicle(page, vehicle);

    const vehicleKpi = await getKpiValue(page, 'Total Véhicules');
    if (vehicleKpi !== '1') {
      throw new Error(`Expected Total Véhicules KPI to be 1, got ${vehicleKpi}`);
    }

    await createRoute(page, route);

    const pendingKpi = await getKpiValue(page, 'En Attente');
    if (pendingKpi !== '1') {
      throw new Error(`Expected En Attente KPI to be 1, got ${pendingKpi}`);
    }

    await assertVehicleAvailable(page, vehicle.plate);

    await startRoute(page, route.name);

    const startedStates = await readRouteAndVehicleState(page, route.name, vehicle.plate);
    if (!startedStates.routeExists || startedStates.routeState !== 'en_curso') {
      throw new Error(`Expected route to be en_curso after start, got ${startedStates.routeState}`);
    }
    if (!startedStates.vehicleExists || startedStates.vehicleState !== 'en_ruta') {
      throw new Error(`Expected vehicle to be en_ruta after start, got ${startedStates.vehicleState}`);
    }

    await completeRoute(page, route.name);

    const completedStates = await readRouteAndVehicleState(page, route.name, vehicle.plate);
    if (!completedStates.routeExists || completedStates.routeState !== 'completada') {
      throw new Error(`Expected route to be completada after completion, got ${completedStates.routeState}`);
    }
    if (!completedStates.vehicleExists || completedStates.vehicleState !== 'disponible') {
      throw new Error(`Expected vehicle to return to disponible after completion, got ${completedStates.vehicleState}`);
    }

    await page.reload({ waitUntil: 'domcontentloaded' });
    await openTransport(page);
    await assertRoutePersisted(page, route.name);
    const persistedStates = await readRouteAndVehicleState(page, route.name, vehicle.plate);
    if (persistedStates.routeState !== 'completada' || persistedStates.vehicleState !== 'disponible') {
      throw new Error(`Expected persisted states completada/disponible, got ${persistedStates.routeState}/${persistedStates.vehicleState}`);
    }
    await assertVehicleAvailable(page, vehicle.plate);

    console.log('TRANSPORTE_FUNCTIONAL_OK');
    await context.close();
    await browser.close();
  } catch (error) {
    console.error('TRANSPORTE_FUNCTIONAL_ERROR');
    console.error(error && error.stack ? error.stack : error);
    if (browser) {
      await browser.close();
    }
    process.exit(1);
  }
})();
