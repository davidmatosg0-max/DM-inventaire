const { chromium } = require('playwright');

const JWT_SECRET = 'banque_alimentaire_secret_key_2026_ultra_secure_pro_v5';
const REFRESH_SECRET = 'banque_alimentaire_refresh_secret_key_2026_ultra_secure_pro_v5';

const baseUrl = process.env.REPORTES_AVANZADO_BASE_URL || 'http://127.0.0.1:4174/';
const DEFAULT_TIMEOUT = 30000;
const PRODUCT_NAME = 'Produit Smoke Rapport Avance';
const ORGANISM_NAME = 'Organisme Smoke Rapport Avance';

function logStep(step) {
  console.log(`STEP ${step}`);
}

function isoForCurrentMonth(day, hour = 10) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), day, hour, 0, 0, 0).toISOString();
}

function createProduct() {
  return {
    id: 'prod-smoke-reportes-avanzado',
    codigo: 'SMK-RPT-001',
    nombre: PRODUCT_NAME,
    categoria: 'Fruits',
    stockActual: 48,
    stock: 48,
    stockMinimo: 5,
    unidad: 'kg',
    pesoRegistrado: 48,
    activo: true,
  };
}

function createOrganism() {
  return {
    id: 'org-smoke-reportes-avanzado',
    nombre: ORGANISM_NAME,
    beneficiarios: 120,
    activo: true,
    participantePRS: true,
    tipo: 'social',
    telefono: '555-0101',
    email: 'smoke-reportes@example.test',
    direccion: '10 rue Smoke',
    quartier: 'Centre',
    codigoPostal: 'H1H1H1',
  };
}

function createComanda() {
  return {
    id: 'cmd-smoke-reportes-avanzado',
    numero: 'CMD-RPT-001',
    numeroComanda: 'CMD-RPT-001',
    organismoId: 'org-smoke-reportes-avanzado',
    organismoNombre: ORGANISM_NAME,
    nombreOrganismo: ORGANISM_NAME,
    fecha: isoForCurrentMonth(8),
    fechaEntrega: isoForCurrentMonth(10),
    observaciones: 'Comanda smoke reportes avanzados',
    items: [
      {
        productoId: 'prod-smoke-reportes-avanzado',
        nombreProducto: PRODUCT_NAME,
        productoNombre: PRODUCT_NAME,
        cantidad: 12,
        cantidadEntregada: 12,
        unidad: 'kg',
        valorUnitario: 2.5,
        peso: 1,
      },
    ],
    valorTotal: 30,
    totalValorMonetario: 30,
    pesoTotal: 12,
    totalPeso: 12,
    estado: 'entregada',
    usuarioCreacion: 'Smoke Runner',
    creadoPor: 'Smoke Runner',
  };
}

function createMovimiento() {
  return {
    id: 'mov-smoke-reportes-avanzado',
    fecha: isoForCurrentMonth(10, 12),
    productoId: 'prod-smoke-reportes-avanzado',
    productoNombre: PRODUCT_NAME,
    cantidad: -12,
    tipo: 'distribucion_completada',
    unidad: 'kg',
    motivo: `Entrega a ${ORGANISM_NAME}`,
    organismoId: 'org-smoke-reportes-avanzado',
    organismoNombre: ORGANISM_NAME,
  };
}

function createPrsEntry() {
  return {
    id: 'ent-smoke-reportes-avanzado',
    fecha: isoForCurrentMonth(9, 11),
    tipoEntrada: 'don',
    programaNombre: 'Programme PRS',
    programaCodigo: 'PRS',
    programaColor: '#4CAF50',
    programaIcono: 'Package',
    donadorId: 'don-smoke-reportes-avanzado',
    donadorNombre: 'Donateur Smoke PRS',
    donadorEsCustom: true,
    participantePRSId: 'prs-smoke-001',
    participantePRSNombre: 'Participant Smoke PRS',
    productoId: 'prod-smoke-reportes-avanzado',
    nombreProducto: PRODUCT_NAME,
    categoria: 'Fruits',
    productoCategoria: 'Fruits',
    cantidad: 12,
    unidad: 'kg',
    pesoUnidad: 1,
    pesoTotal: 12,
    valorUnitario: 2.5,
    valorTotal: 30,
    temperatura: 'ambiente',
    creadoPor: 'Smoke Runner',
    registradoPor: 'Smoke Runner',
    organismoId: 'org-smoke-reportes-avanzado',
    fechaCreacion: isoForCurrentMonth(9, 11),
    activo: true,
  };
}

function createTransformacion() {
  return {
    id: 'trf-smoke-reportes-avanzado',
    numeroTransformacion: 'TRF-SMOKE-001',
    recetaId: 'rec-smoke-001',
    recetaNombre: 'Recette Smoke',
    fecha: isoForCurrentMonth(11, 9),
    estado: 'terminée',
    ingredientesUsados: [
      {
        productoId: 'prod-smoke-reportes-avanzado',
        productoNombre: PRODUCT_NAME,
        cantidadPlanificada: 12,
        cantidadReal: 12,
        unidad: 'kg',
      },
    ],
    productosGenerados: [
      {
        nombre: 'Produit cuisine smoke',
        cantidadPlanificada: 12,
        cantidadReal: 12,
        unidad: 'kg',
        pesoTotal: 12,
        fechaElaboracion: isoForCurrentMonth(11, 9),
        fechaCaducidad: isoForCurrentMonth(16, 9),
        lote: 'LOT-SMOKE-001',
      },
    ],
    responsable: 'Smoke Runner',
    ayudantes: [],
    observaciones: 'Transformation smoke pour rapports avancés',
  };
}

async function launchBrowser() {
  try {
    const browser = await chromium.launch({ headless: true, timeout: DEFAULT_TIMEOUT });
    return { browser, channel: 'chromium' };
  } catch (error) {
    // fallback below
  }

  for (const channel of ['msedge', 'chrome']) {
    try {
      const browser = await chromium.launch({ channel, headless: true, timeout: DEFAULT_TIMEOUT });
      return { browser, channel };
    } catch (error) {
      // try next channel
    }
  }

  const browser = await chromium.launch({ headless: true, timeout: DEFAULT_TIMEOUT });
  return { browser, channel: 'chromium' };
}

async function createAuthState() {
  const jose = await import('jose');
  const now = Math.floor(Date.now() / 1000);
  const basePayload = {
    userId: '1',
    username: 'David',
    nombre: 'David',
    apellido: 'Développeur',
    email: 'david.developpeur@banquealimentaire.ca',
    role: 'desarrollador',
    permissions: ['desarrollador', 'acceso_total'],
  };

  const accessToken = await new jose.SignJWT({ ...basePayload, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + (15 * 60))
    .sign(new TextEncoder().encode(JWT_SECRET));

  const refreshToken = await new jose.SignJWT({ ...basePayload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + (7 * 24 * 60 * 60))
    .sign(new TextEncoder().encode(REFRESH_SECRET));

  return {
    sessionUser: {
      id: '1',
      username: 'David',
      nombre: 'David',
      apellido: 'Développeur',
      email: 'david.developpeur@banquealimentaire.ca',
      rol: 'desarrollador',
      permisos: ['desarrollador', 'acceso_total'],
    },
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60,
    },
    refreshTokens: [{
      token: refreshToken,
      userId: '1',
      createdAt: new Date().toISOString(),
    }],
  };
}

async function seedStorage(page) {
  logStep('seed-storage');
  await page.evaluate(({ product, organism, comanda, movimiento, prsEntry }) => {
    localStorage.setItem('banco_alimentos_productos', JSON.stringify([product]));
    localStorage.setItem('organismos_banco_alimentos', JSON.stringify([organism]));
    localStorage.setItem('banco_alimentos_comandas', JSON.stringify([comanda]));
    localStorage.setItem('banco_alimentos_movimientos', JSON.stringify([movimiento]));
    localStorage.setItem('transformaciones_cocina', JSON.stringify([]));
    localStorage.setItem('ofertas_sistema', JSON.stringify([]));
    localStorage.setItem('banco_alimentos_entradas_inventario', JSON.stringify([prsEntry]));
  }, {
    product: createProduct(),
    organism: createOrganism(),
    comanda: createComanda(),
    movimiento: createMovimiento(),
    prsEntry: createPrsEntry(),
  });
}

async function openAdvancedReports(page) {
  logStep('open-reportes-avanzado');
  await page.goto(`${baseUrl}?page=reportes-avanzado`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByRole('tab', { name: 'Général', exact: true }).waitFor({ timeout: 20000 });
}

async function assertGeneralTab(page) {
  logStep('assert-general');
  const generalTab = page.getByRole('tab', { name: 'Général', exact: true });
  const selected = await generalTab.getAttribute('aria-selected');
  if (selected !== 'true') {
    throw new Error('La pestaña Général debe abrir activa por defecto.');
  }

  await page.getByText('Top 5 des produits les plus distribués', { exact: true }).waitFor({ timeout: 20000 });
  await page.getByText(PRODUCT_NAME, { exact: true }).first().waitFor({ timeout: 20000 });

  if (await page.getByText('Aucune distribution de produits détectée sur la période.', { exact: true }).isVisible().catch(() => false)) {
    throw new Error('La pestaña Général sigue mostrando estado vacío para distribuciones.');
  }
}

async function assertComandasTab(page) {
  logStep('assert-comandas');
  const comandasTab = page.getByRole('tab', { name: 'Commandes', exact: true });
  await comandasTab.click();
  await page.getByText('Évolution des commandes (6 derniers mois)', { exact: true }).waitFor({ timeout: 20000 });

  if (await page.getByText('Aucune commande disponible pour tracer une tendance.', { exact: true }).isVisible().catch(() => false)) {
    throw new Error('La pestaña Commandes sigue mostrando estado vacío.');
  }

  await page.getByText('Organismes desservis', { exact: true }).waitFor({ timeout: 20000 });
}

async function assertPrsTab(page) {
  logStep('assert-prs');
  const prsTab = page.getByRole('tab', { name: 'PRS', exact: true });
  await prsTab.click();
  await page.getByText('Vue locale des entrées PRS', { exact: true }).waitFor({ timeout: 20000 });

  if (await page.getByText('Aucune entrée PRS locale enregistrée sur la période.', { exact: true }).isVisible().catch(() => false)) {
    throw new Error('La pestaña PRS sigue mostrando estado vacío para las entradas PRS locales.');
  }

  await page.getByText('Entrées locales PRS', { exact: true }).waitFor({ timeout: 20000 });
  await page.getByText('Poids total PRS local', { exact: true }).waitFor({ timeout: 20000 });
  await page.getByText('Entrées PRS par mois', { exact: true }).waitFor({ timeout: 20000 });
  await page.getByText('12 kg', { exact: true }).first().waitFor({ timeout: 20000 });
  await page.getByText(PRODUCT_NAME, { exact: true }).first().waitFor({ timeout: 20000 });
}

async function main() {
  const { browser, channel } = await launchBrowser();
  console.log(`BROWSER ${channel}`);
  const authState = await createAuthState();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
  await context.addInitScript((state) => {
    localStorage.setItem('usuario_sesion_banco_alimentos', JSON.stringify(state.sessionUser));
    localStorage.setItem('banque_auth_tokens', JSON.stringify(state.tokens));
    localStorage.setItem('banque_refresh_tokens', JSON.stringify(state.refreshTokens));
    localStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('isAuthenticated', 'true');
  }, authState);
  const page = await context.newPage();
  page.setDefaultTimeout(DEFAULT_TIMEOUT);

  try {
    logStep('bootstrap-auth');
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await seedStorage(page);
    await openAdvancedReports(page);
    await assertGeneralTab(page);
    await assertComandasTab(page);
    await assertPrsTab(page);
    console.log('REPORTES_AVANZADO_VISIBLE_FUNCTIONAL_OK');
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch((error) => {
  console.error('REPORTES_AVANZADO_VISIBLE_FUNCTIONAL_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
