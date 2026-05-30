const { chromium } = require('playwright');

const pages = [
  'dashboard','dashboard-metricas','dashboard-predictivo','inventario','comandas','etiquetas','reportes','reportes-avanzado','organismos','ofertas-organismo','transporte','dechets-compostage','contactos-almacen','cuisine','achat','id-digital','email-organismos','communication','recrutement','usuarios','gestion-autenticacion','configuracion','api-keys'
];

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const results = [];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });

    for (const modulePage of pages) {
      const url = `http://127.0.0.1:5173/?page=${modulePage}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(500);

        const metrics = await page.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(doc.scrollWidth, body ? body.scrollWidth : 0);
          const clientWidth = doc.clientWidth;
          const overflowX = scrollWidth > clientWidth + 2;

          return {
            title: document.title,
            overflowX,
            scrollWidth,
            clientWidth,
          };
        });

        results.push({ viewport: vp.name, page: modulePage, ...metrics });
      } catch (error) {
        results.push({ viewport: vp.name, page: modulePage, error: String(error) });
      }
    }
  }

  await browser.close();

  const issues = results.filter(r => r.error || r.overflowX);
  console.log('Responsive smoke completed.');
  console.log(`Total checks: ${results.length}`);
  console.log(`Issues: ${issues.length}`);
  console.log(JSON.stringify(issues, null, 2));
})();
