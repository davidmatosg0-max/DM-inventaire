const { chromium } = require('playwright');

(async () => {
  const jose = await import('jose');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 980 } });
  const browserErrors = [];

  page.on('pageerror', (error) => {
    browserErrors.push(`PAGEERROR: ${error.message}`);
  });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      browserErrors.push(`CONSOLE: ${message.text()}`);
    }
  });

  try {
    const jwtSecret = new TextEncoder().encode('banque_alimentaire_secret_key_2026_ultra_secure_pro_v5');
    const refreshSecret = new TextEncoder().encode('banque_alimentaire_refresh_secret_key_2026_ultra_secure_pro_v5');
    const now = Math.floor(Date.now() / 1000);
    const permissions = [
      'desarrollador',
      'acceso_total',
      'debug_mode',
      'administrador_general',
      'gestion_usuarios',
      'gestion_roles',
      'configuracion_sistema',
      'backup_restauracion',
      'coordinador',
      'administrador_liaison',
    ];

    const payload = {
      userId: '1',
      username: 'David',
      nombre: 'David',
      apellido: 'Développeur',
      email: 'davidmatosg0@gmail.com',
      role: 'desarrollador',
      permissions,
    };

    const accessToken = await new jose.SignJWT({ ...payload, type: 'access' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setExpirationTime(now + (15 * 60))
      .sign(jwtSecret);

    const refreshToken = await new jose.SignJWT({ ...payload, type: 'refresh' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(now)
      .setExpirationTime(now + (7 * 24 * 60 * 60))
      .sign(refreshSecret);

    await page.addInitScript(({ accessToken, refreshToken, permissions }) => {
      localStorage.setItem('banque_auth_tokens', JSON.stringify({
        accessToken,
        refreshToken,
        expiresIn: 900,
      }));
      localStorage.setItem('banque_refresh_tokens', JSON.stringify([
        {
          token: refreshToken,
          userId: '1',
          createdAt: new Date().toISOString(),
        }
      ]));
      localStorage.setItem('usuario_sesion_banco_alimentos', JSON.stringify({
        id: '1',
        username: 'David',
        nombre: 'David',
        apellido: 'Développeur',
        email: 'davidmatosg0@gmail.com',
        rol: 'desarrollador',
        permisos: permissions,
      }));
      sessionStorage.setItem('isAuthenticated', 'true');
    }, { accessToken, refreshToken, permissions });

    await page.goto('http://127.0.0.1:4173/?page=communication', { waitUntil: 'networkidle' });

    await Promise.race([
      page.getByText('Messages', { exact: true }).waitFor({ state: 'visible', timeout: 15000 }),
      page.getByText('Centre de messagerie').waitFor({ state: 'visible', timeout: 15000 }),
      page.getByText('Aucune conversation disponible').waitFor({ state: 'visible', timeout: 15000 })
    ]);

    await page.screenshot({ path: 'tmp/messaging-visual-review.png', fullPage: true });
    console.log('SCREENSHOT_OK tmp/messaging-visual-review.png');
  } catch (error) {
    const bodyText = await page.locator('body').innerText().catch(() => 'BODY_UNAVAILABLE');
    await page.screenshot({ path: 'tmp/messaging-visual-review-failed.png', fullPage: true }).catch(() => {});
    console.error('PAGE_URL', page.url());
    console.error('BROWSER_ERRORS_START');
    for (const entry of browserErrors) {
      console.error(entry);
    }
    console.error('BROWSER_ERRORS_END');
    console.error('PAGE_TEXT_START');
    console.error(String(bodyText).slice(0, 2000));
    console.error('PAGE_TEXT_END');
    console.error('SCREENSHOT_ERROR', error);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
