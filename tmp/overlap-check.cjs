const { chromium } = require('playwright');

(async () => {
  const jose = await import('jose');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 980 } });

  try {
    const jwtSecret = new TextEncoder().encode('banque_alimentaire_secret_key_2026_ultra_secure_pro_v5');
    const refreshSecret = new TextEncoder().encode('banque_alimentaire_refresh_secret_key_2026_ultra_secure_pro_v5');
    const now = Math.floor(Date.now() / 1000);
    const permissions = [
      'desarrollador', 'acceso_total', 'debug_mode', 'administrador_general',
      'gestion_usuarios', 'gestion_roles', 'configuracion_sistema',
      'backup_restauracion', 'coordinador', 'administrador_liaison',
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

    // Wait for the view to appear
    await page.waitForSelector('.app-main-stage', { timeout: 15000 });

    const metrics = await page.evaluate(() => {
      const header = document.querySelector('.app-pro-topbar');
      const main = document.querySelector('.app-main-stage');
      const sidebar = document.querySelector('.app-pro-sidebar');

      const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
      const mainTop = main ? main.getBoundingClientRect().top : 0;
      const sidebarTop = sidebar ? sidebar.getBoundingClientRect().top : 0;
      const overlap = mainTop < headerBottom || sidebarTop < headerBottom;

      return {
        headerBottom,
        mainTop,
        sidebarTop,
        overlap
      };
    });

    console.log(JSON.stringify(metrics, null, 2));

    await page.screenshot({ path: 'tmp/messaging-header-overlap-check.png', fullPage: true });
    console.log('SCREENSHOT_OK tmp/messaging-header-overlap-check.png');
  } catch (error) {
    console.error('ERROR:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
