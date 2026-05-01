const { chromium } = require('playwright');

const baseUrl = process.env.RECRUTEMENT_BASE_URL || 'http://127.0.0.1:4173/';

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
  await page.locator('aside').getByRole('button', { name: 'Recrutement', exact: true }).waitFor({ timeout: 20000 });
  await page.getByRole('heading', { name: 'Tableau de Bord Principal - Entrepôt', exact: true }).waitFor({ timeout: 20000 });
}

async function openRecruitment(page) {
  logStep('openRecruitment');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('aside button'));
    const recrutementButton = buttons.find((button) => button.textContent?.includes('Recrutement'));
    if (!recrutementButton) {
      throw new Error('Recrutement sidebar button not found');
    }
    recrutementButton.click();
  });
  await page.getByRole('heading', { name: 'Recrutement', exact: true }).waitFor({ timeout: 20000 });
  await page.getByPlaceholder('Rechercher par nom, poste ou email...').waitFor({ timeout: 20000 });
  await page.getByRole('button', { name: /Nouvelle candidature/i }).waitFor({ timeout: 20000 });
}

async function createCandidate(page, candidate) {
  logStep('createCandidate');
  await page.getByRole('button', { name: /Nouvelle candidature/i }).click();
  await page.getByRole('heading', { name: 'Enregistrer un nouveau contact', exact: true }).waitFor({ timeout: 10000 });

  const [firstName, ...lastNameParts] = candidate.name.split(' ');
  const lastName = lastNameParts.join(' ');

  await page.locator('div[role="dialog"] #nombre').fill(firstName);
  await page.locator('div[role="dialog"] #apellido').fill(lastName);

  await page.getByRole('tab', { name: /Contact/i }).click();
  await page.locator('div[role="dialog"] #email').fill(candidate.email);
  await page.locator('div[role="dialog"] #telefono').fill(candidate.phone);

  await page.getByRole('tab', { name: /Professionnel/i }).click();
  await page.locator('div[role="dialog"] #cargo').click();
  await page.getByRole('option', { name: 'Bénévole', exact: true }).click();

  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await page.getByText(candidate.name, { exact: true }).waitFor({ timeout: 10000 });
}

async function locateCandidateCard(page, candidateName) {
  const card = page
    .locator('[data-slot="card"]')
    .filter({ has: page.locator('[data-slot="card-title"]', { hasText: candidateName }) })
    .first();
  await card.waitFor({ timeout: 10000 });
  return card;
}

async function acceptCandidate(page, candidateName) {
  logStep('acceptCandidate');
  const card = await locateCandidateCard(page, candidateName);
  const statusTrigger = card.locator('button[role="combobox"]').first();
  await statusTrigger.click();
  await page.getByRole('option', { name: 'Accepté', exact: true }).click();
  await card.getByTitle('Supprimer le contact du département').waitFor({ timeout: 10000 });
}

async function removeContact(page, candidateName) {
  logStep('removeContact');
  const card = await locateCandidateCard(page, candidateName);
  await card.getByTitle('Supprimer le contact du département').click({ force: true });
  await card.getByTitle('Assigner au département').waitFor({ timeout: 10000 });
}

async function assignDepartment(page, candidateName, departmentName) {
  logStep('assignDepartment');
  const card = await locateCandidateCard(page, candidateName);
  await card.getByTitle('Assigner au département').click();
  await page.getByRole('heading', { name: 'Assigner au Département', exact: true }).waitFor({ timeout: 10000 });
  await page.getByRole('button', { name: new RegExp(departmentName, 'i') }).click();
  await page.getByRole('button', { name: 'Assigner au Département', exact: true }).last().click();
  await card.getByTitle('Supprimer le contact du département').waitFor({ timeout: 10000 });
}

async function modifyDepartment(page, candidateName, departmentName) {
  logStep('modifyDepartment');
  const card = await locateCandidateCard(page, candidateName);
  await card.getByTitle("Modifier l'assignation de département").click();
  await page.getByRole('heading', { name: "Modifier l'assignation de Département", exact: true }).waitFor({ timeout: 10000 });
  await page.getByRole('button', { name: new RegExp(departmentName, 'i') }).click();
  await page.getByRole('button', { name: "Modifier l'assignation", exact: true }).last().click();
  await card.getByText(new RegExp(departmentName, 'i')).waitFor({ timeout: 10000 });
}

async function manageTimesheet(page, candidateName) {
  logStep('manageTimesheet');
  const note = `Heures validées ${Date.now()}`;

  await page.getByRole('tab', { name: 'Feuille de temps', exact: true }).click();
  await page.getByRole('heading', { name: 'Gestion des feuilles de temps', exact: true }).waitFor({ timeout: 10000 });

  await page.waitForFunction(() => {
    const availableButtons = document.querySelectorAll('button[aria-label^="Sélectionner "]').length;
    const emptyStateVisible = document.body.innerText.includes("Aucun bénévole assigné à un département n'est disponible");
    return availableButtons > 0 || emptyStateVisible;
  }, { timeout: 30000 });

  const availableCandidateButtons = page.locator('button[aria-label^="Sélectionner "]');
  const candidateButtonCount = await availableCandidateButtons.count();

  if (candidateButtonCount === 0) {
    throw new Error('La pestaña de feuille de temps no muestra bénévoles disponibles después de la asignación');
  }

  await page.getByRole('button', { name: `Sélectionner ${candidateName}`, exact: true }).click();

  await page.locator('#recruit-timesheet-date').fill('2026-04-26');
  await page.locator('#recruit-timesheet-notes').fill(note);
  await page.getByRole('button', { name: 'Entrée', exact: true }).click();

  await page.getByRole('button', { name: 'Enregistrer Sortie', exact: true }).waitFor({ timeout: 10000 });
  await page.getByRole('button', { name: 'Enregistrer Sortie', exact: true }).click();

  await page.waitForFunction((expectedNote) => document.body.innerText.includes(expectedNote), note, { timeout: 10000 });

  await page.locator('#recruit-timesheet-filter-department').click();
  await page.getByRole('option', { name: /Bénévoles/i }).click();
  await page.locator('#recruit-timesheet-filter-month').click();
  await page.getByRole('option', { name: '2026-04', exact: true }).click();

  await page.getByRole('button', { name: 'Exporter CSV', exact: true }).click();
  await page.waitForFunction(() => {
    const bodyText = document.body.innerText;
    return bodyText.includes('Exporter CSV') && !bodyText.includes('Aucune feuille de temps à exporter');
  }, { timeout: 10000 });

  await page.getByRole('button', { name: 'Réinitialiser', exact: true }).click();
  await page.getByRole('tab', { name: 'Candidatures', exact: true }).click();
  await page.getByPlaceholder('Rechercher par nom, poste ou email...').waitFor({ timeout: 10000 });
}

async function deleteCandidate(page, candidateName) {
  logStep('deleteCandidate');
  const card = await locateCandidateCard(page, candidateName);
  await card.getByTitle('Supprimer la candidature').click({ force: true });
  await page.waitForFunction(
    (name) => !Array.from(document.querySelectorAll('[data-slot="card-title"]'))
      .some((node) => node.textContent?.trim() === name),
    candidateName,
    { timeout: 10000 }
  );
}

(async () => {
  const candidate = {
    name: `Test Recrutement ${Date.now()}`,
    position: 'Bénévole général',
    email: `recrutement.${Date.now()}@example.com`,
    phone: '(514) 555-2026',
    experience: 'Validation fonctionnelle automatique du module recrutement',
    availability: 'Lundi, Mercredi'
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
    await openRecruitment(page);
    await createCandidate(page, candidate);
    await acceptCandidate(page, candidate.name);
    await removeContact(page, candidate.name);
    await assignDepartment(page, candidate.name, 'Transport');
    await modifyDepartment(page, candidate.name, 'Bénévoles');
    await manageTimesheet(page, candidate.name);
    await deleteCandidate(page, candidate.name);

    console.log(JSON.stringify({
      ok: true,
      candidate: candidate.name,
      baseUrl,
      channel: launched.channel,
      checks: ['create', 'accept', 'remove-contact', 'assign-transport', 'modify-benevoles', 'timesheet', 'delete']
    }, null, 2));

    await context.close();
  } catch (error) {
    console.error('RECRUTEMENT_FUNCTIONAL_ERROR');
    console.error(error && error.stack ? error.stack : error);
    process.exitCode = 1;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();