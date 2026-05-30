const { chromium } = require('playwright');
(async () => {
    let jose;
    try {
        jose = await import('jose');
    } catch (e) {
        console.error('Failed to import jose:', e);
        process.exit(1);
    }
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1600, height: 980 } });
    
    try {
        const jwtSecret = new TextEncoder().encode('banque_alimentaire_secret_key_2026_ultra_secure_pro_v5');
        const refreshSecret = new TextEncoder().encode('banque_alimentaire_refresh_secret_key_2026_ultra_secure_pro_v5');
        const now = Math.floor(Date.now() / 1000);
        const permissions = ['desarrollador', 'acceso_total'];
        const payload = { userId: '1', username: 'David', role: 'desarrollador', permissions };

        const accessToken = await new jose.SignJWT({ ...payload, type: 'access' })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt(now)
            .setExpirationTime(now + 900)
            .sign(jwtSecret);

        const refreshToken = await new jose.SignJWT({ ...payload, type: 'refresh' })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt(now)
            .setExpirationTime(now + 604800)
            .sign(refreshSecret);

        await page.addInitScript(({ accessToken, refreshToken, permissions }) => {
            localStorage.setItem('banque_auth_tokens', JSON.stringify({ accessToken, refreshToken, expiresIn: 900 }));
            localStorage.setItem('usuario_sesion_banco_alimentos', JSON.stringify({ id: '1', username: 'David', permisos: permissions }));
            sessionStorage.setItem('isAuthenticated', 'true');
        }, { accessToken, refreshToken, permissions });

        await page.goto('http://127.0.0.1:4173/?page=communication', { waitUntil: 'networkidle' });
        await Promise.race([
            page.getByText('Messages', { exact: true }).waitFor({ state: 'visible', timeout: 30000 }),
            page.getByText('Aucune conversation disponible').waitFor({ state: 'visible', timeout: 30000 })
        ]);

        const metrics = await page.evaluate(() => {
            const doc = document.scrollingElement;
            const main = document.querySelector('.app-main-stage');
            const shell = document.querySelector('[data-app-shell]');
            return {
                documentScrollHeight: doc?.scrollHeight,
                documentClientHeight: doc?.clientHeight,
                bodyScrollHeight: document.body.scrollHeight,
                windowInnerHeight: window.innerHeight,
                hasDocumentScroll: doc ? doc.scrollHeight > doc.clientHeight : false,
                hasBodyScroll: document.body.scrollHeight > window.innerHeight,
                mainClientHeight: main?.clientHeight,
                mainScrollHeight: main?.scrollHeight,
                mainOverflowY: main ? getComputedStyle(main).overflowY : null,
                mainHasScroll: main ? main.scrollHeight > main.clientHeight : false,
                shellClientHeight: shell?.clientHeight,
                shellScrollHeight: shell?.scrollHeight,
                shellHasScroll: shell ? shell.scrollHeight > shell.clientHeight : false
            };
        });

        console.log(JSON.stringify(metrics, null, 2));
        await page.screenshot({ path: 'tmp/messaging-no-scroll-check.png', fullPage: true });
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
