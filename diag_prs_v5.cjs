const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const baseUrl = 'http://127.0.0.1:4174/';

  try {
    await page.goto(baseUrl + '?page=reportes-avanzado');
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
        localStorage.setItem('auth_user', JSON.stringify({id: 1, role: 'admin'}));
    });
    await page.reload();
    await page.waitForTimeout(2000);

    const btn = page.locator('button').filter({ hasText: /^PRS$/ });
    if (await btn.count() > 0) await btn.click();
    await page.waitForTimeout(1000);

    const cards = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('div'))
            .filter(d => d.innerText.includes('PRS') && /\d/.test(d.innerText))
            .map(d => d.innerText.replace(/\n/g, ' '));
    });
    console.log('Cards found:', cards);

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
