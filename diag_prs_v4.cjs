const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const baseUrl = 'http://127.0.0.1:4174/';

  try {
    console.log('--- Diagnosis (Deep Scan) ---');
    await page.goto(baseUrl + '?page=reportes-avanzado');
    
    // Inject and Set Date
    await page.evaluate(() => {
        const today = new Date().toISOString().split('T')[0];
        const entry = {
            id: Date.now(),
            fecha: today,
            tipoEntrada: 'PRS',
            programaCodigo: 'PROG01',
            programaNombre: 'Programa Test',
            participantePRSId: 'PART01',
            productoId: 'PROD01',
            pesoTotal: 50.5,
            activo: true
        };
        localStorage.setItem('banco_alimentos_entradas_inventario', JSON.stringify([entry]));
        localStorage.setItem('token', 'fake-token-for-diagnosis'); // To bypass simple auth checks if any
    });

    await page.reload();
    await page.waitForTimeout(2000);

    // Click PRS
    const btn = page.locator('button').filter({ hasText: /^PRS$/ });
    if (await btn.count() > 0) {
        await btn.click();
        await page.waitForTimeout(1000);
    }

    const results = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('banco_alimentos_entradas_inventario') || '[]');
        const snapshot = data[0] ? {
            fecha: data[0].fecha,
            tipoEntrada: data[0].tipoEntrada,
            programaCodigo: data[0].programaCodigo,
            programaNombre: data[0].programaNombre,
            participantePRSId: data[0].participantePRSId,
            productoId: data[0].productoId,
            pesoTotal: data[0].pesoTotal,
            activo: data[0].activo
        } : null;

        const bodyText = document.body.innerText;
        const noEntries = bodyText.includes('Aucune entrée PRS locale enregistrée sur la période.');
        
        const getCardVal = (label) => {
            const divs = Array.from(document.querySelectorAll('div'));
            const card = divs.find(d => d.innerText.includes(label) && d.innerText.match(/\d/));
            return card ? card.innerText.split('\n').pop() : 'Not Found';
        };

        return {
            lsCount: data.length,
            snapshot,
            noEntries,
            cardCount: getCardVal('Entrées locales PRS'),
            cardWeight: getCardVal('Poids total PRS local')
        };
    });

    console.log('DIAG_RESULTS:' + JSON.stringify(results));

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
