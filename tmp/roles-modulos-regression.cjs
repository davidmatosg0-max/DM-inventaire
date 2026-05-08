const { chromium } = require('playwright');

const baseUrl = process.env.ROLES_BASE_URL || 'http://127.0.0.1:4173/';

function logStep(step) {
  console.log(`STEP ${step}`);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

async function gotoLogin(page) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByLabel('Utilisateur').waitFor({ timeout: 20000 });
}

async function seedFixtures(page) {
  logStep('seedFixtures');
  await page.evaluate(() => {
    const usersKey = 'banque_alimentaire_usuarios';
    const rolesKey = 'banque_alimentaire_roles_personnalises';
    const fixtureUsernames = [
      'roles-transport',
      'roles-viewer',
      'roles-custom',
      'roles-coordinator',
      'roles-warehouse',
      'roles-liaison'
    ];
    const fixtureRoleId = 'qa_role_logistique';

    const users = JSON.parse(localStorage.getItem(usersKey) || '[]')
      .filter((user) => !fixtureUsernames.includes(user.username));
    users.push(
      {
        id: 'qa-transport',
        username: 'roles-transport',
        password: 'RoleTest123!',
        nombre: 'QA',
        apellido: 'Transport',
        email: 'qa.transport@example.test',
        rol: 'responsable_transport',
        permisos: [],
        activo: true,
        descripcion: 'Fixture QA transport'
      },
      {
        id: 'qa-viewer',
        username: 'roles-viewer',
        password: 'RoleTest123!',
        nombre: 'QA',
        apellido: 'Viewer',
        email: 'qa.viewer@example.test',
        rol: 'visualizador',
        permisos: [],
        activo: true,
        descripcion: 'Fixture QA visualizador'
      },
      {
        id: 'qa-custom',
        username: 'roles-custom',
        password: 'RoleTest123!',
        nombre: 'QA',
        apellido: 'Custom',
        email: 'qa.custom@example.test',
        rol: fixtureRoleId,
        permisos: ['dashboard.ver', 'organismos.ver', 'reportes.ver', 'achat.ver'],
        activo: true,
        descripcion: 'Fixture QA custom role'
      },
      {
        id: 'qa-coordinator',
        username: 'roles-coordinator',
        password: 'RoleTest123!',
        nombre: 'QA',
        apellido: 'Coordinator',
        email: 'qa.coordinator@example.test',
        rol: 'coordinador',
        permisos: [],
        activo: true,
        descripcion: 'Fixture QA coordinador'
      },
      {
        id: 'qa-warehouse',
        username: 'roles-warehouse',
        password: 'RoleTest123!',
        nombre: 'QA',
        apellido: 'Warehouse',
        email: 'qa.warehouse@example.test',
        rol: 'responsable_entrepot',
        permisos: [],
        activo: true,
        descripcion: 'Fixture QA responsable entrepot'
      },
      {
        id: 'qa-liaison',
        username: 'roles-liaison',
        password: 'RoleTest123!',
        nombre: 'QA',
        apellido: 'Liaison',
        email: 'qa.liaison@example.test',
        rol: 'liaison_organisme',
        permisos: [],
        activo: true,
        descripcion: 'Fixture QA liaison organisme'
      }
    );
    localStorage.setItem(usersKey, JSON.stringify(users));

    const roles = JSON.parse(localStorage.getItem(rolesKey) || '[]')
      .filter((role) => role.id !== fixtureRoleId);
    roles.push({
      id: fixtureRoleId,
      nombre: 'QA Logistique',
      descripcion: 'Role personnalise de regression',
      color: '#0F766E',
      icono: '🧪',
      permisos: ['dashboard.ver', 'organismos.ver', 'reportes.ver', 'achat.ver'],
      usuariosAsignados: 1,
      activo: true,
      predeterminado: false,
    });
    localStorage.setItem(rolesKey, JSON.stringify(roles));
  });
}

async function clearSession(page) {
  await page.evaluate(() => {
    localStorage.removeItem('usuario_sesion_banco_alimentos');
    localStorage.removeItem('banque_auth_tokens');
    sessionStorage.removeItem('isAuthenticated');
  });
}

async function login(page, username) {
  logStep(`login:${username}`);
  const logoutButton = page.getByRole('button', { name: /Se déconnecter/i });
  if (await logoutButton.isVisible().catch(() => false)) {
    await logoutButton.click();
    await page.getByLabel('Utilisateur').waitFor({ timeout: 20000 });
  }

  if (page.url().startsWith(baseUrl)) {
    await clearSession(page);
  }

  await gotoLogin(page);
  await page.getByLabel('Utilisateur').fill(username);
  await page.getByLabel('Mot de passe').fill('RoleTest123!');
  await page.getByRole('button', { name: 'Connexion', exact: true }).click();
  await page.getByRole('button', { name: /Se déconnecter/i }).waitFor({ timeout: 20000 });
}

async function expandNav(page, labels) {
  for (const label of labels) {
    await page.evaluate((targetLabel) => {
      const buttons = Array.from(document.querySelectorAll('nav button'));
      const button = buttons.find((element) => (element.textContent || '').replace(/\s+/g, ' ').trim() === targetLabel);
      if (button) {
        button.click();
      }
    }, label);
    await page.waitForTimeout(150);
  }
}

async function readNavText(page) {
  const navText = await page.locator('nav').innerText();
  return navText.replace(/\n{2,}/g, '\n').trim();
}

function assertIncludes(haystack, values, context) {
  for (const value of values) {
    if (!haystack.includes(value)) {
      throw new Error(`Missing expected nav item for ${context}: ${value}`);
    }
  }
}

function assertExcludes(haystack, values, context) {
  for (const value of values) {
    if (haystack.includes(value)) {
      throw new Error(`Unexpected nav item for ${context}: ${value}`);
    }
  }
}

async function assertViewerScope(page) {
  await login(page, 'roles-viewer');
  await expandNav(page, ['Tableau de bord', 'Entrepôt']);
  const navText = await readNavText(page);
  assertIncludes(navText, ['Tableau de bord', 'Rapports'], 'visualizador');
  assertExcludes(navText, ['Inventaire', 'Commandes', 'Organismes', 'Achats', 'Transport', 'Comptoir', 'Liaison'], 'visualizador');
}

async function assertTransportScope(page) {
  await login(page, 'roles-transport');
  await expandNav(page, ['Tableau de bord', 'Entrepôt']);
  const navText = await readNavText(page);
  assertIncludes(navText, ['Transport', 'Commandes', 'Rapports', 'Organismes'], 'responsable_transport');
  assertExcludes(navText, ['Inventaire', 'Étiquettes', 'Utilisateurs/Rôles', 'Configuration'], 'responsable_transport');
}

async function assertCustomRoleScope(page) {
  await login(page, 'roles-custom');
  await expandNav(page, ['Tableau de bord', 'Entrepôt']);
  const navText = await readNavText(page);
  const sessionUser = await page.evaluate(() => JSON.parse(localStorage.getItem('usuario_sesion_banco_alimentos') || 'null'));

  if (sessionUser?.rol !== 'qa_role_logistique') {
    throw new Error(`Unexpected custom role in session: ${sessionUser?.rol}`);
  }

  assertIncludes(navText, ['Rapports', 'Organismes', 'Achats'], 'custom-role');
  assertExcludes(navText, ['Inventaire', 'Commandes', 'Transport', 'Utilisateurs/Rôles', 'Configuration'], 'custom-role');
}

async function assertCoordinatorScope(page) {
  await login(page, 'roles-coordinator');
  await expandNav(page, ['Tableau de bord', 'Entrepôt']);
  const navText = await readNavText(page);
  assertIncludes(
    navText,
    ['Inventaire', 'Commandes', 'Étiquettes', 'Rapports', 'Organismes', 'Transport', 'Achats', 'Cuisine'],
    'coordinador'
  );
  assertExcludes(navText, ['Utilisateurs/Rôles', 'Configuration', 'Comptoir', 'Liaison'], 'coordinador');
}

async function assertWarehouseScope(page) {
  await login(page, 'roles-warehouse');
  await expandNav(page, ['Tableau de bord', 'Entrepôt']);
  const navText = await readNavText(page);
  assertIncludes(
    navText,
    ['Inventaire', 'Commandes', 'Étiquettes', 'Rapports', 'Organismes', 'Offres', 'Partenaires & fournisseurs', 'Annuaire Entrepôt', 'Achats'],
    'responsable_entrepot'
  );
  assertExcludes(navText, ['Transport', 'Utilisateurs/Rôles', 'Configuration', 'Liaison', 'Comptoir'], 'responsable_entrepot');
}

async function assertLiaisonScope(page) {
  await login(page, 'roles-liaison');
  await expandNav(page, ['Tableau de bord', 'Entrepôt', 'Liaison']);
  const navText = await readNavText(page);
  assertIncludes(
    navText,
    ['Commandes', 'Rapports', 'Organismes', 'Offres', 'Partenaires & fournisseurs', 'Annuaire Entrepôt', 'Achats', 'Liaison'],
    'liaison_organisme'
  );
  assertExcludes(navText, ['Inventaire', 'Étiquettes', 'Transport', 'Utilisateurs/Rôles', 'Configuration', 'Comptoir'], 'liaison_organisme');
}

async function cleanupFixtures(page) {
  logStep('cleanupFixtures');
  await clearSession(page);
  await page.evaluate(() => {
    const usersKey = 'banque_alimentaire_usuarios';
    const rolesKey = 'banque_alimentaire_roles_personnalises';
    const fixtureUsernames = [
      'roles-transport',
      'roles-viewer',
      'roles-custom',
      'roles-coordinator',
      'roles-warehouse',
      'roles-liaison'
    ];

    const users = JSON.parse(localStorage.getItem(usersKey) || '[]')
      .filter((user) => !fixtureUsernames.includes(user.username));
    localStorage.setItem(usersKey, JSON.stringify(users));

    const roles = JSON.parse(localStorage.getItem(rolesKey) || '[]')
      .filter((role) => role.id !== 'qa_role_logistique');
    localStorage.setItem(rolesKey, JSON.stringify(roles));
  });
}

async function main() {
  const { browser, channel } = await launchBrowser();
  console.log(`BROWSER ${channel}`);

  const page = await browser.newPage();

  try {
    await gotoLogin(page);
    await seedFixtures(page);
    await assertViewerScope(page);
    await assertTransportScope(page);
    await assertCustomRoleScope(page);
    await assertCoordinatorScope(page);
    await assertWarehouseScope(page);
    await assertLiaisonScope(page);
    await cleanupFixtures(page);
    console.log('ROLES_MODULOS_REGRESSION_OK');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('ROLES_MODULOS_REGRESSION_ERROR');
  console.error(error?.stack || error);
  process.exit(1);
});