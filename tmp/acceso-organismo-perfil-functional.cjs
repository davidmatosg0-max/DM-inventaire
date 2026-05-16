const { chromium } = require('playwright');

const baseUrl = process.env.ACCESO_ORGANISMO_PERFIL_BASE_URL || 'http://127.0.0.1:5173/';
const ACCESS_KEY = 'ORG-9K2M4P';
const ORGANISM_ID = 'org-smoke-portal-profile';
const ORIGINAL_PHONE = '(514) 555-0101';
const UPDATED_PHONE = '(514) 555-7777';
const UPDATED_RESPONSIBLE = 'Responsable Smoke Mis a Jour';

function logStep(step) {
  console.log(`STEP ${step}`);
}

function createOrganism() {
  const now = '2026-05-16T10:00:00.000Z';

  return {
    id: ORGANISM_ID,
    nombre: 'Organisme Smoke Portail',
    tipo: 'Banque alimentaire',
    email: 'smoke.organisme@example.org',
    telefono: ORIGINAL_PHONE,
    direccion: '123 boulevard Smoke',
    codigoPostal: 'H1H 1H1',
    quartier: 'Montreal-Nord',
    responsable: 'Responsable Smoke Initial',
    beneficiarios: 42,
    activo: true,
    regular: true,
    clasificacionOrganismo: 'regular',
    participantePRS: false,
    personasServidas: 42,
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
  await page.evaluate(({ organism }) => {
    localStorage.setItem('organismos_banco_alimentos', JSON.stringify([organism]));
  }, { organism: createOrganism() });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
}

async function loginToPortal(page) {
  logStep('loginToPortal');
  await page.getByLabel("Clé d'Accès").fill(ACCESS_KEY);
  await page.getByRole('button', { name: 'Accéder à Mon Profil', exact: true }).click();
  await page.getByRole('button', { name: 'Modifier le Profil', exact: true }).waitFor({ timeout: 20000 });
}

async function updateProfile(page) {
  logStep('updateProfile');
  await page.getByRole('button', { name: 'Modifier le Profil', exact: true }).click();

  const dialog = page.getByRole('dialog');
  await dialog.getByText("Modifier le profil de l'organisme", { exact: true }).waitFor({ timeout: 20000 });
  await dialog.getByPlaceholder('Nom du responsable').fill(UPDATED_RESPONSIBLE);
  await dialog.getByPlaceholder('(514) 123-4567').fill(UPDATED_PHONE);
  await dialog.getByRole('button', { name: 'Enregistrer les modifications', exact: true }).click();

  await page.waitForFunction(({ organismId, updatedPhone, updatedResponsible }) => {
    const organismos = JSON.parse(localStorage.getItem('organismos_banco_alimentos') || '[]');
    return organismos.some((organismo) => (
      organismo.id === organismId
      && organismo.telefono === updatedPhone
      && organismo.responsable === updatedResponsible
    ));
  }, {
    organismId: ORGANISM_ID,
    updatedPhone: UPDATED_PHONE,
    updatedResponsible: UPDATED_RESPONSIBLE,
  }, { timeout: 20000 });

  await page.getByText(UPDATED_PHONE, { exact: true }).first().waitFor({ timeout: 20000 });
  await page.getByText(UPDATED_RESPONSIBLE, { exact: true }).first().waitFor({ timeout: 20000 });
}

async function logoutAndLoginAgain(page) {
  logStep('logoutAndLoginAgain');
  await page.getByRole('button', { name: 'Se déconnecter', exact: true }).click();
  await page.getByRole('button', { name: 'Accéder à Mon Profil', exact: true }).waitFor({ timeout: 20000 });
  await loginToPortal(page);
}

async function assertProfileStillUpdated(page) {
  logStep('assertProfileStillUpdated');
  await page.getByText(UPDATED_PHONE, { exact: true }).first().waitFor({ timeout: 20000 });
  await page.getByText(UPDATED_RESPONSIBLE, { exact: true }).first().waitFor({ timeout: 20000 });
}

async function main() {
  const { browser, channel } = await launchBrowser();
  console.log(`BROWSER ${channel}`);

  const page = await browser.newPage();

  try {
    await seedStorage(page);
    await loginToPortal(page);
    await updateProfile(page);
    await logoutAndLoginAgain(page);
    await assertProfileStillUpdated(page);
    console.log('ACCESO_ORGANISMO_PERFIL_FUNCTIONAL_OK');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('ACCESO_ORGANISMO_PERFIL_FUNCTIONAL_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
