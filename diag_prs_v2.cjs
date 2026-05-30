const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const baseUrl = 'http://127.0.0.1:4174/';

  try {
    console.log('--- Diagnosis Start (Search Cards) ---');
    await page.goto(baseUrl + '?page=reportes-avanzado');
    
    // Simulate current date matching test (2026-05-18 from my prev inject)
    // Actually the page might have a date range picker.
    
    const prsTab = page.getByRole('button', { name: /PRS/i });
    if (await prsTab.isVisible()) {
        await prsTab.click();
        await page.waitForTimeout(500);
    }

    // List all text content to find where the cards might be
    const allText = await page.evaluate(() => document.body.innerText);
    console.log('--- Page Text Preview (First 500 chars) ---');
    console.log(allText.substring(0, 500));
    
    const findCard = await page.evaluate(() => {
        const results = {};
        const labels = ['Entrées locales PRS', 'Poids total PRS local'];
        const divs = Array.from(document.querySelectorAll('div, p, span, h3, h4'));
        labels.forEach(label => {
            const el = divs.find(d => d.innerText.includes(label));
            if (el) {
                // Try to find a sibling or parent child that looks like a number
                results[label] = el.parentElement.innerText;
            } else {
                results[label] = "NOT_FOUND";
            }
        });
        return results;
    });
    
    console.log('Search Results:', JSON.stringify(findCard, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
