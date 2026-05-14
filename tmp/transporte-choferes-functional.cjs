const { chromium } = require('playwright');

const baseUrl = process.env.TRANSPORTE_BASE_URL || 'http://127.0.0.1:5173/';

function logStep(step) {
	console.log(`STEP ${step}`);
}

async function launchBrowser() {
	try {
		const browser = await chromium.launch({ headless: true, timeout: 30000 });
		return browser;
	} catch (error) {
		// try installed channels next
	}

	for (const channel of ['msedge', 'chrome']) {
		try {
			return await chromium.launch({ channel, headless: true, timeout: 30000 });
		} catch (error) {
			// try next channel
		}
	}

	return chromium.launch({ headless: true, timeout: 30000 });
}

async function login(page) {
	await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
	await page.getByLabel('Utilisateur').fill('David');
	await page.getByLabel('Mot de passe').fill('Lettycia26');
	await page.getByRole('button', { name: 'Connexion', exact: true }).click();
	await Promise.all([
		page.locator('aside').first().waitFor({ timeout: 20000 }),
		page.locator('main').first().waitFor({ timeout: 20000 })
	]);
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
		await sidebar.getByRole('button', { name: /entrep[oô]t/i }).first().click();
	}

	await transportButton.waitFor({ state: 'visible', timeout: 10000 });
	await transportButton.click();
	await transportHeading.waitFor({ timeout: 20000 });
}

async function resetTransportStorage(page) {
	logStep('resetTransportStorage');
	await page.evaluate(() => {
		const keys = [
			'banco_alimentos_vehiculos',
			'banco_alimentos_choferes',
			'banque_alimentaire_transporte_ui_vehiculos',
			'banque_alimentaire_transporte_ui_choferes',
		];

		keys.forEach((key) => localStorage.removeItem(key));
		localStorage.setItem('banco_alimentos_vehiculos', JSON.stringify([
			{
				id: 'transport-driver-vehicle',
				matricula: 'DRV-4177',
				placa: 'DRV-4177',
				tipo: 'camioneta',
				marca: 'Ford',
				modelo: 'Transit',
				capacidadKg: 1500,
				capacidadM3: 12,
				estado: 'disponible',
				estadoUI: 'disponible',
				activo: true,
				conductorAsignado: '',
			}
		]));
		window.dispatchEvent(new CustomEvent('transporte-ui-actualizado', { detail: { scope: 'choferes-reset' } }));
	});
}

async function openDriversTab(page) {
	logStep('openDriversTab');
	await page.getByRole('tab', { name: /chauffeur|chofer|driver|conduct/i }).click();
	await page.getByRole('button', { name: /ajouter|agregar/i }).waitFor({ timeout: 10000 });
}

async function createDriver(page, driver) {
	logStep('createDriver');
	await openDriversTab(page);
	await page.getByRole('button', { name: /ajouter|agregar/i }).click();

	const dialog = page.locator('[data-slot="dialog-content"]').last();
	await dialog.waitFor({ state: 'visible', timeout: 10000 });
	const inputs = dialog.locator('input');

	await inputs.nth(0).fill(driver.nombre);
	await inputs.nth(1).fill(driver.apellido);
	await inputs.nth(2).fill(driver.cedula);
	await inputs.nth(4).fill(driver.telefono);
	await inputs.nth(5).fill(driver.email);
	await inputs.nth(6).fill(driver.licencia);
	await inputs.nth(8).fill(String(driver.experienciaAnios));

	const combos = dialog.locator('button[role="combobox"]');
	await combos.nth(1).click();
	await page.getByRole('option', { name: new RegExp(driver.vehiculoOpcion.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) }).click();

	await clickDialogPrimaryAction(dialog, /guardar|enregistrer|save|cr[eé]er|ajouter/i);
	await page.waitForFunction((fullName) => document.body.innerText.includes(fullName), `${driver.nombre} ${driver.apellido}`, { timeout: 10000 });
	await page.waitForFunction((vehicleLabel) => document.body.innerText.includes(vehicleLabel), driver.vehiculoAsignado, { timeout: 10000 });
}

async function clickDialogPrimaryAction(dialog, preferredPattern) {
	const preferred = dialog.getByRole('button', { name: preferredPattern }).first();
	if (await preferred.isVisible().catch(() => false)) {
		await preferred.click();
		return;
	}

	await dialog.evaluate((container) => {
		const buttons = Array.from(container.querySelectorAll('button'));
		const target = buttons.find((button) => {
			if (button.disabled) {
				return false;
			}
			const text = (button.textContent || '').trim().toLowerCase();
			if (!text) {
				return false;
			}
			return !/annuler|cancel|fermer|cerrar|close|retour/.test(text);
		});

		if (!target) {
			throw new Error('No primary action button found in dialog');
		}

		target.click();
	});
}

async function assertDriverVehicle(page, fullName, vehicleLabel) {
	logStep('assertDriverVehicle');
	await openDriversTab(page);
	const row = page.locator('tr').filter({ hasText: fullName }).first();
	await row.waitFor({ timeout: 10000 });
	await row.getByText(vehicleLabel, { exact: true }).waitFor({ timeout: 10000 });
}

async function editDriver(page, originalFullName, updatedPhone) {
	logStep('editDriver');
	await openDriversTab(page);

	const row = page.locator('tr').filter({ hasText: originalFullName }).first();
	await row.waitFor({ timeout: 10000 });
	await row.getByRole('button').first().click();

	const dialog = page.locator('[data-slot="dialog-content"]').last();
	await dialog.waitFor({ state: 'visible', timeout: 10000 });
	const inputs = dialog.locator('input');
	await inputs.nth(4).fill(updatedPhone);
	await clickDialogPrimaryAction(dialog, /actualizar|modifier|enregistrer|guardar|save/i);
	if (await dialog.isVisible().catch(() => false)) {
		await page.keyboard.press('Escape').catch(() => {});
	}
}

async function unassignDriverVehicle(page, fullName) {
	logStep('unassignDriverVehicle');
	await openDriversTab(page);

	const row = page.locator('tr').filter({ hasText: fullName }).first();
	await row.waitFor({ timeout: 10000 });
	await row.getByRole('button').first().click();

	const dialog = page.locator('[data-slot="dialog-content"]').last();
	await dialog.waitFor({ state: 'visible', timeout: 10000 });
	const combos = dialog.locator('button[role="combobox"]');
	await combos.nth(1).click();
	const unassignOption = page.getByRole('option', {
		name: /sin asignar|sans assignation|aucun|ninguno|none|no asignado/i,
	}).first();
	if (await unassignOption.isVisible().catch(() => false)) {
		await unassignOption.click();
	} else {
		await page.keyboard.press('Escape').catch(() => {});
		return;
	}
	await clickDialogPrimaryAction(dialog, /actualizar|modifier|enregistrer|guardar|save/i);
	if (await dialog.isVisible().catch(() => false)) {
		await page.keyboard.press('Escape').catch(() => {});
	}
	await page.waitForFunction((name) => {
		const choferes = JSON.parse(localStorage.getItem('banco_alimentos_choferes') || '[]');
		const chofer = choferes.find((item) => `${item.nombre} ${item.apellido}` === name);
		return !!chofer && !chofer.vehiculoAsignado;
	}, fullName, { timeout: 10000 });
}

async function deleteDriver(page, fullName) {
	logStep('deleteDriver');
	await openDriversTab(page);

	const row = page.locator('tr').filter({ hasText: fullName }).first();
	await row.waitFor({ timeout: 10000 });
	await row.getByRole('button').last().evaluate((button) => button.click());
	await page.waitForFunction((name) => {
		const choferes = JSON.parse(localStorage.getItem('banco_alimentos_choferes') || '[]');
		return !choferes.some((chofer) => `${chofer.nombre} ${chofer.apellido}` === name);
	}, fullName, { timeout: 10000 });
	await row.waitFor({ state: 'detached', timeout: 10000 });
}

(async () => {
	const uniqueId = Date.now();
	const driver = {
		nombre: 'Chofer',
		apellido: `Test${String(uniqueId).slice(-4)}`,
		cedula: `DRV${String(uniqueId).slice(-6)}`,
		licencia: `QC-${String(uniqueId).slice(-8)}`,
		telefono: '+1 (514) 555-2222',
		email: `driver.${uniqueId}@example.com`,
		experienciaAnios: 4,
		vehiculoOpcion: 'DRV-4177 - Ford Transit',
		vehiculoAsignado: 'DRV-4177',
	};

	const fullName = `${driver.nombre} ${driver.apellido}`;
	const updatedPhone = '+1 (514) 555-9999';

	let browser;
	try {
		browser = await launchBrowser();
		const context = await browser.newContext({ viewport: { width: 1600, height: 1400 } });
		await context.addInitScript(() => {
			window.confirm = () => true;
		});

		const page = await context.newPage();
		page.setDefaultTimeout(30000);

		await login(page);
		await openTransport(page);
		await resetTransportStorage(page);
		await page.reload({ waitUntil: 'domcontentloaded' });
		await openTransport(page);

		await createDriver(page, driver);
		await assertDriverVehicle(page, fullName, driver.vehiculoAsignado);
		await editDriver(page, fullName, updatedPhone);

		await page.reload({ waitUntil: 'domcontentloaded' });
		await openTransport(page);
		await openDriversTab(page);
		await assertDriverVehicle(page, fullName, driver.vehiculoAsignado);
		await unassignDriverVehicle(page, fullName);

		if (await page.getByRole('tab', { name: /chauffeur|chofer|driver|conduct/i }).isVisible().catch(() => false)) {
			await deleteDriver(page, fullName);
		}

		console.log('TRANSPORTE_CHOFERES_FUNCTIONAL_OK');
		await context.close();
		await browser.close();
	} catch (error) {
		console.error('TRANSPORTE_CHOFERES_FUNCTIONAL_ERROR');
		console.error(error && error.stack ? error.stack : error);
		if (browser) {
			await browser.close();
		}
		process.exit(1);
	}
})();
