const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const baseUrl = process.env.ENTRADA_PRS_REPORTES_BASE_URL || 'http://127.0.0.1:4174/';

  try {
    console.log('--- Diagnosis Start ---');
    await page.goto(baseUrl);
    
    // --- STEP 1: Create PRS Entry ---
    // Mimicking the flow from the functional test (inferred)
    // We'll use evaluate to directly push to localStorage to ensure we have a controlled state for diagnosis
    // since the functional test failed, we want to see if the reporting page reads it correctly.
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
        return entry;
    });

    // 1) Cantidad de elementos en localStorage
    const lsCount = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('banco_alimentos_entradas_inventario') || '[]');
        return data.length;
    });
    console.log(`1) Elementos en localStorage: ${lsCount}`);

    // 2) Snapshot del primer entry
    const firstEntry = await page.evaluate(() => {
        const data = JSON.parse(localStorage.getItem('banco_alimentos_entradas_inventario') || '[]');
        if (data.length === 0) return null;
        const e = data[0];
        return {
            fecha: e.fecha,
            tipoEntrada: e.tipoEntrada,
            programaCodigo: e.programaCodigo,
            programaNombre: e.programaNombre,
            participantePRSId: e.participantePRSId,
            productoId: e.productoId,
            pesoTotal: e.pesoTotal,
            activo: e.activo
        };
    });
    console.log(`2) Snapshot: ${JSON.stringify(firstEntry, null, 2)}`);

    // --- STEP 2: Navigate to Reports ---
    await page.goto(`${baseUrl}?page=reportes-avanzado`);
    
    // Open PRS tab (assuming there's a button or it's a specific section)
    // In many of these apps, it might be a button with text "PRS"
    const prsTab = page.getByRole('button', { name: /PRS/i });
    if (await prsTab.isVisible()) {
        await prsTab.click();
        await page.waitForTimeout(1000); // Wait for potential animations/renders
    }

    // 3) Texto 'Aucune entrée PRS locale enregistrée sur la période.' visible?
    const noEntriesText = page.getByText('Aucune entrée PRS locale enregistrée sur la période.');
    const isNoEntriesVisible = await noEntriesText.isVisible();
    console.log(`3) 'Aucune entrée...' visible: ${isNoEntriesVisible}`);

    // 4) Valor de la tarjeta 'Entrées locales PRS'
    // 5) Valor de la tarjeta 'Poids total PRS local'
    // Usually these are in cards. We'll look for text nearby.
    const getCardValue = async (label) => {
        const labelElement = page.locator(`text=${label}`);
        if (await labelElement.isVisible()) {
            // Check following element or parent containing number
            return await page.evaluate((lbl) => {
                const elements = Array.from(document.querySelectorAll('*'));
                const target = elements.find(el => el.textContent.includes(lbl) && el.children.length === 0);
                if (target && target.parentElement) {
                    return target.parentElement.innerText.replace(lbl, '').trim();
                }
                return 'Not found';
            }, label);
        }
        return 'Card label not visible';
    };

    const countCard = await getCardValue('Entrées locales PRS');
    const weightCard = await getCardValue('Poids total PRS local');
    
    console.log(`4) Card 'Entrées locales PRS': ${countCard}`);
    console.log(`5) Card 'Poids total PRS local': ${weightCard}`);

  } catch (err) {
    console.error('Error during diagnosis:', err);
  } finally {
    await browser.close();
  }
})();
