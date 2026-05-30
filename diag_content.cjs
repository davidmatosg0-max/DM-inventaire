const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const baseUrl = 'http://127.0.0.1:4174/';

    try {
        await page.goto(baseUrl + '?page=reportes-avanzado');
        const content = await page.evaluate(() => document.body.innerText);
        console.log('--- PAGE CONTENT START ---');
        console.log(content);
        console.log('--- PAGE CONTENT END ---');
    } catch (err) {
        console.error(err);
    } finally {
        await browser.close();
    }
})();
