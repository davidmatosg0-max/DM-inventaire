const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const baseUrl = 'http://127.0.0.1:4174/';

  try {
    console.log('--- Diagnosis Start (Auth + Reports) ---');
    await page.goto(baseUrl);
    
    // Login
    await page.fill('input[type="email"], input[placeholder*="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Connexion")');
    await page.waitForTimeout(2000);

    // Inject PRS Data
    await page.evaluate(() => {
        const entry = {
            id: Date.now(),
            fecha: new Date().toISOString().split('T')[0],
            tipoEntrada: 'PRS',
            programaCodigo: 'PROG01',
            programaNombre: 'Programa Test',
            participantePRSId: 'PART01',
            productoId: 'PROD01',
            pesoTotal: 50.5,
            activo: true
        };
        localStorage.setItem('banco_alimentos_entradas_inventario', JSON.stringify([entry]));
    });

    // Go to reports
    await page.goto(baseUrl + '?page=reportes-avanzado');
    await page.waitForTimeout(1000);

    // Look for Tabs or Buttons
    const buttons = await page.evaluate(() => Array.from(document.querySelectorAll('button')).map(b => b.innerText));
    console.log('Buttons found:', buttons);

    // Try to click PRS if exists
    const prsButton = page.locator('button:has-text("PRS")');
    if (await prsButton.count() > 0) {
        await prsButton.first().click();
        await page.waitForTimeout(1000);
    }

    // 1) Cantidad en localStorage
    const lsCount = await page.evaluate(() => JSON.parse(localStorage.getItem('banco_alimentos_entradas_inventario') || '[]').length);
    console.log(`1) Elementos en localStorage: ${lsCount}`);

    // 5) Text check
    const noEntriesVisible = await page.isVisible('text=Aucune entrée PRS locale enregistrée sur la période');
    console.log(`3) 'Aucune entrée...' visible: ${noEntriesVisible}`);

    // Scan for numbers near labels
    const reportData = await page.evaluate(() => {
        const labels = ['Entrées locales PRS', 'Poids total PRS local'];
        const res = {};
        labels.forEach(l => {
            const elements = Array.from(document.querySelectorAll('*'));
            const match = elements.find(el => el.innerText.includes(l) && el.children.length === 0);
            if (match) {
                res[l] = match.parentElement.innerText;
            } else {
                res[l] = "NOT_FOUND";
            }
        });
        return res;
    });
    console.log('Report Data:', JSON.stringify(reportData, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
