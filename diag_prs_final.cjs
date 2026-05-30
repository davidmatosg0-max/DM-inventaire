const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const baseUrl = 'http://127.0.0.1:4174/';

    try {
        await page.goto(baseUrl);
        
        // Use evaluate to inject auth state into localStorage
        await page.evaluate(() => {
            const user = { id: 1, nombre: 'Admin', role: 'admin' };
            localStorage.setItem('auth_user', JSON.stringify(user));
            localStorage.setItem('auth_token', 'dummy-token');
            
            const entry = {
                id: Date.now(),
                fecha: new Date().toISOString().split('T')[0],
                tipoEntrada: 'PRS',
                programaCodigo: 'PROG01',
                programaNombre: 'Programa Test',
                participantePRSId: 'PART01',
                productoId: 'PROD01',
                pesoTotal: 51.5,
                activo: true
            };
            localStorage.setItem('banco_alimentos_entradas_inventario', JSON.stringify([entry]));
        });

        // Navigate now that we are "logged in"
        await page.goto(baseUrl + '?page=reportes-avanzado');
        await page.waitForTimeout(2000);

        const results = await page.evaluate(() => {
            const ls = JSON.parse(localStorage.getItem('banco_alimentos_entradas_inventario') || '[]');
            const entry = ls[0] || {};
            const noEntriesVisible = document.body.innerText.includes('Aucune entrée PRS locale enregistrée sur la période.');
            
            const cards = Array.from(document.querySelectorAll('div, p, span'))
                              .filter(el => /Entrées locales PRS|Poids total PRS local/.test(el.innerText));
            
            return {
                lsCount: ls.length,
                snapshot: entry,
                noEntriesVisible,
                pageText: document.body.innerText.substring(0, 1000)
            };
        });

        console.log('RESULTS:' + JSON.stringify(results));

    } catch (err) {
        console.error(err);
    } finally {
        await browser.close();
    }
})();
