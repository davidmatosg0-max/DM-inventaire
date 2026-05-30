const { chromium } = require('playwright');

(async () => {
    let browser;
    try {
        const jose = await import('jose');
        browser = await chromium.launch({ headless: true });
        const page = await browser.newPage({ viewport: { width: 1600, height: 980 } });

        const jwtSecret = new TextEncoder().encode('banque_alimentaire_secret_key_2026_ultra_secure_pro_v5');
        const refreshSecret = new TextEncoder().encode('banque_alimentaire_refresh_secret_key_2026_ultra_secure_pro_v5');
        const now = Math.floor(Date.now() / 1000);
        const permissions = [
            'desarrollador', 'acceso_total', 'debug_mode', 'administrador_general',
            'gestion_usuarios', 'gestion_roles', 'configuracion_sistema',
            'backup_restauracion', 'coordinador', 'administrador_liaison'
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
        
        // Wait for content (Adjust selectors as needed based on the page)
        await page.waitForTimeout(3000);

        const metrics = await page.evaluate(() => {
            const body = document.body;
            const doc = document.documentElement;
            // The prompt mentions 'main' and 'shell', assuming they are IDs or common classes
            const main = document.querySelector('main') || { clientHeight: 0, scrollHeight: 0, style: {} };
            const shell = document.querySelector('.app-shell') || document.querySelector('#root') || { clientHeight: 0, scrollHeight: 0 };
            
            const getOverflow = (el) => {
                try { return window.getComputedStyle(el).overflowY; } catch(e) { return 'n/a'; }
            };

            return {
                documentScrollHeight: doc.scrollHeight,
                documentClientHeight: doc.clientHeight,
                bodyScrollHeight: body.scrollHeight,
                windowInnerHeight: window.innerHeight,
                hasDocumentScroll: doc.scrollHeight > doc.clientHeight,
                hasBodyScroll: body.scrollHeight > body.clientHeight,
                mainClientHeight: main.clientHeight || 0,
                mainScrollHeight: main.scrollHeight || 0,
                mainOverflowY: getOverflow(main),
                mainHasScroll: (main.scrollHeight || 0) > (main.clientHeight || 0),
                shellClientHeight: shell.clientHeight || 0,
                shellScrollHeight: shell.scrollHeight || 0,
                shellHasScroll: (shell.scrollHeight || 0) > (shell.clientHeight || 0)
            };
        });

        console.log('METRICS_JSON_START');
        console.log(JSON.stringify(metrics, null, 2));
        console.log('METRICS_JSON_END');

        await page.screenshot({ path: 'tmp/messaging-no-scroll-check.png', fullPage: true });
        console.log('SCREENSHOT_OK tmp/messaging-no-scroll-check.png');

    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        if (browser) await browser.close();
    }
})();
