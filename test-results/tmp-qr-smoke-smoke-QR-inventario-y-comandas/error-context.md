# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tmp\qr-smoke.spec.cjs >> smoke QR inventario y comandas
- Location: tmp\qr-smoke.spec.cjs:98:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('button[title="Scanner QR"]').first()
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 20000ms
  - waiting for locator('button[title="Scanner QR"]').first()

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e6]:
        - generic [ref=e7]:
          - button "Départements" [ref=e8]:
            - img [ref=e9]
          - generic [ref=e13]:
            - heading "Banque Alimentaire" [level=1] [ref=e14]
            - img [ref=e15]
        - generic [ref=e17]:
          - button "Rechercher... Ctrl+K" [ref=e18]:
            - img
            - generic [ref=e19]: Rechercher...
            - generic [ref=e20]: Ctrl+K
          - button [ref=e21]:
            - img
          - generic [ref=e22]:
            - img [ref=e23]
            - combobox [ref=e26]:
              - generic:
                - generic:
                  - generic: 🇫🇷
                  - generic: Français
              - img
          - generic [ref=e27]:
            - generic [ref=e28]:
              - paragraph [ref=e29]: Banque Alimentaire
              - paragraph [ref=e30]: desarrollador
            - generic [ref=e31]: DD
          - button "Se déconnecter" [ref=e32]:
            - img [ref=e33]
    - complementary [ref=e36]:
      - navigation [ref=e37]:
        - button "Tableau de bord" [ref=e40]:
          - img [ref=e42]
          - generic [ref=e47]: Tableau de bord
          - img [ref=e48]
        - generic [ref=e51]:
          - button "Entrepôt" [active] [ref=e52]:
            - img [ref=e54]
            - generic [ref=e57]: Entrepôt
            - img [ref=e58]
          - generic [ref=e60]:
            - button "Inventaire" [ref=e61]:
              - img [ref=e63]
              - generic [ref=e67]: Inventaire
            - button "Étiquettes" [ref=e68]:
              - img [ref=e70]
              - generic [ref=e73]: Étiquettes
            - button "Commandes" [ref=e74]:
              - img [ref=e76]
              - generic [ref=e79]: Commandes
            - button "Organismes" [ref=e80]:
              - img [ref=e82]
              - generic [ref=e85]: Organismes
            - button "Offres" [ref=e86]:
              - img [ref=e88]
              - generic [ref=e92]: Offres
            - button "Transport" [ref=e93]:
              - img [ref=e95]
              - generic [ref=e100]: Transport
            - button "Rapports" [ref=e101]:
              - img [ref=e103]
              - generic [ref=e106]: Rapports
            - button "Donateurs & Fournisseurs" [ref=e107]:
              - img [ref=e109]
              - generic [ref=e112]: Donateurs & Fournisseurs
            - button "Contacts Entrepôt" [ref=e113]:
              - img [ref=e115]
              - generic [ref=e120]: Contacts Entrepôt
        - button "Cuisine" [ref=e122]:
          - img [ref=e124]
          - generic [ref=e126]: Cuisine
        - button "Liaison" [ref=e128]:
          - img [ref=e130]
          - generic [ref=e135]: Liaison
        - button "Messagerie" [ref=e137]:
          - img [ref=e139]
          - generic [ref=e141]: Messagerie
        - button "Recrutement" [ref=e143]:
          - img [ref=e145]
          - generic [ref=e148]: Recrutement
        - button "Utilisateurs/Rôles" [ref=e150]:
          - img [ref=e152]
          - generic [ref=e157]: Utilisateurs/Rôles
        - button "Comptoir" [ref=e159]:
          - img [ref=e161]
          - generic [ref=e165]: Comptoir
        - button "🚀 API Keys PRO" [ref=e167]:
          - img [ref=e169]
          - generic [ref=e173]: 🚀 API Keys PRO
        - button "Panneau de Marque" [ref=e175]:
          - img [ref=e177]
          - generic [ref=e183]: Panneau de Marque
        - button "Configuration" [ref=e185]:
          - img [ref=e187]
          - generic [ref=e190]: Configuration
    - main [ref=e191]:
      - generic [ref=e195]:
        - generic [ref=e197]:
          - generic [ref=e198]:
            - heading "Tableau de Bord Principal - Entrepôt" [level=1] [ref=e199]:
              - img [ref=e200]
              - generic [ref=e205]: Tableau de Bord Principal - Entrepôt
            - paragraph [ref=e206]: Vue d'ensemble du système de la Banque Alimentaire
          - generic [ref=e207]:
            - button "Vérifications Récentes" [ref=e208]:
              - img
              - text: Vérifications Récentes
            - button "Nouvelle Entrée" [ref=e209]:
              - img
              - text: Nouvelle Entrée
        - generic [ref=e210]:
          - generic [ref=e211] [cursor=pointer]:
            - generic [ref=e212]:
              - img [ref=e214]
              - img [ref=e218]
            - paragraph [ref=e221]: Inventaire Total
            - generic [ref=e222]: "0"
            - generic [ref=e223]: 0 produits différents
          - generic [ref=e224] [cursor=pointer]:
            - generic [ref=e225]:
              - img [ref=e227]
              - img [ref=e230]
            - paragraph [ref=e235]: Organismes Actifs
            - generic [ref=e236]: "0"
            - generic [ref=e237]: "Total des bénéficiaires: 0"
          - generic [ref=e238] [cursor=pointer]:
            - generic [ref=e239]:
              - img [ref=e241]
              - img [ref=e244]
            - paragraph [ref=e247]: Commandes Actives
            - generic [ref=e248]: "0"
            - generic [ref=e249]: En préparation et en attente
          - generic [ref=e250] [cursor=pointer]:
            - generic [ref=e251]:
              - img [ref=e253]
              - img [ref=e255]
            - paragraph [ref=e258]: Alerte de Stock
            - generic [ref=e259]: "0"
            - generic [ref=e260]: Stock Faible
        - generic [ref=e261]:
          - generic [ref=e262]:
            - generic [ref=e265]:
              - img [ref=e266]
              - heading "Alertes intelligentes" [level=4] [ref=e269]
            - generic [ref=e271]:
              - img [ref=e272]
              - paragraph [ref=e275]: ✅ Aucune alerte en attente
              - paragraph [ref=e276]: Tous les produits sont sous contrôle
          - generic [ref=e277]:
            - heading "📊 Résumé Rapide" [level=4] [ref=e279]
            - generic [ref=e281]:
              - generic [ref=e282]:
                - generic [ref=e283]:
                  - img [ref=e284]
                  - generic [ref=e288]: Total Produits
                - generic [ref=e289]: "0"
              - generic [ref=e290]:
                - generic [ref=e291]:
                  - img [ref=e292]
                  - generic [ref=e295]: Organismes Actifs
                - generic [ref=e296]: "0"
              - generic [ref=e297]:
                - generic [ref=e298]:
                  - img [ref=e299]
                  - generic [ref=e302]: Commandes en Attente
                - generic [ref=e303]: "0"
              - generic [ref=e304]:
                - generic [ref=e305]:
                  - img [ref=e306]
                  - generic [ref=e308]: Stock Bas
                - generic [ref=e309]: "0"
        - generic [ref=e310]:
          - generic [ref=e311]:
            - heading "Mouvements d'Inventaire (Dernière Semaine)" [level=4] [ref=e313]
            - img [ref=e317]
          - generic [ref=e321]:
            - heading "Tendance du Stock" [level=4] [ref=e323]
            - img [ref=e327]
        - generic [ref=e331]:
          - generic [ref=e332]:
            - heading "Produits à Stock Faible" [level=4] [ref=e334]
            - paragraph [ref=e337]: Aucun produit à stock faible
          - heading "Commandes Récentes" [level=4] [ref=e340]
    - button "Configuration des Alertes" [ref=e342]:
      - img
    - button "Accès Organismes" [ref=e343]:
      - img [ref=e344]
      - generic [ref=e348]: Accès Organismes
    - button "📖 Guide Complet - Glissez pour déplacer" [ref=e349]:
      - img
    - button "Installer Nouveau!" [ref=e353]:
      - img [ref=e354]
      - generic [ref=e357]: Installer
      - generic [ref=e358]: Nouveau!
  - region "Notifications alt+T"
```

# Test source

```ts
  1   | const { test, expect } = require('@playwright/test');
  2   | const path = require('path');
  3   | 
  4   | const baseUrl = 'http://127.0.0.1:5173/';
  5   | const inventoryQr = path.resolve('tmp/qr-inventario-smoke.png');
  6   | const comandasQr = path.resolve('tmp/qr-comandas-smoke.png');
  7   | 
  8   | test.setTimeout(120000);
  9   | 
  10  | test.use({
  11  |   browserName: 'chromium',
  12  |   channel: 'msedge',
  13  |   permissions: ['camera'],
  14  |   viewport: { width: 1440, height: 1100 },
  15  | });
  16  | 
  17  | async function login(page) {
  18  |   await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  19  |   await page.waitForTimeout(1200);
  20  | 
  21  |   const username = page.getByLabel('Utilisateur');
  22  |   if (await username.isVisible().catch(() => false)) {
  23  |     await username.fill('David');
  24  |     await page.getByLabel('Mot de passe').fill('Lettycia26');
  25  |     await page.getByRole('button', { name: 'Connexion', exact: true }).click();
  26  |   }
  27  | 
  28  |   await expect(page.getByRole('button', { name: 'Tableau de bord', exact: true })).toBeVisible({ timeout: 20000 });
  29  | }
  30  | 
  31  | async function closeScanner(page) {
  32  |   const overlay = page.locator('div.fixed.inset-0.bg-black\/50').last();
  33  |   const header = overlay.locator('div.bg-\[#1E73BE\]').first();
  34  |   await header.locator('button').last().click();
  35  |   await expect(overlay).toBeHidden({ timeout: 10000 });
  36  | }
  37  | 
  38  | async function openScanner(page, navName, titleText) {
  39  |   await page.getByRole('button', { name: navName, exact: true }).click();
> 40  |   await expect(page.locator('button[title="Scanner QR"]').first()).toBeVisible({ timeout: 20000 });
      |                                                                    ^ Error: expect(locator).toBeVisible() failed
  41  |   await page.locator('button[title="Scanner QR"]').first().click();
  42  |   await expect(page.getByText(titleText, { exact: false })).toBeVisible({ timeout: 10000 });
  43  | }
  44  | 
  45  | async function testGuide(page) {
  46  |   await page.locator('button[title*="Aide:"]').first().click();
  47  |   await expect(page.getByText("Comment autoriser l'accès à la caméra", { exact: false })).toBeVisible({ timeout: 10000 });
  48  |   await page.getByRole('button', { name: "J'ai compris", exact: true }).click();
  49  |   await expect(page.getByText("Comment autoriser l'accès à la caméra", { exact: false })).toBeHidden({ timeout: 10000 });
  50  | }
  51  | 
  52  | async function testCameraFlow(page) {
  53  |   await page.getByRole('button', { name: /Scanner avec Caméra/i }).click();
  54  |   await page.waitForTimeout(3000);
  55  | 
  56  |   const possibleSignals = [
  57  |     page.getByText('Accès à la caméra refusé', { exact: false }),
  58  |     page.getByText('Aucune caméra trouvée', { exact: false }),
  59  |     page.getByText('Caméra déjà utilisée', { exact: false }),
  60  |     page.getByText('Erreur inconnue', { exact: false }),
  61  |     page.locator('#qr-reader-camera'),
  62  |     page.locator('#qr-reader-camera-inventario'),
  63  |   ];
  64  | 
  65  |   let matched = false;
  66  |   for (const signal of possibleSignals) {
  67  |     if (await signal.isVisible().catch(() => false)) {
  68  |       matched = true;
  69  |       break;
  70  |     }
  71  |   }
  72  | 
  73  |   expect(matched).toBeTruthy();
  74  | }
  75  | 
  76  | async function testFileUpload(page, qrPath, expectedText) {
  77  |   const upload = page.getByRole('button', { name: /Télécharger une image du QR/i }).first();
  78  |   const chooserPromise = page.waitForEvent('filechooser');
  79  |   await upload.click();
  80  |   const chooser = await chooserPromise;
  81  |   await chooser.setFiles(qrPath);
  82  | 
  83  |   await expect(page.getByText('Code QR scanné avec succès!', { exact: false })).toBeVisible({ timeout: 20000 });
  84  |   await expect(page.getByText(expectedText, { exact: false })).toBeVisible({ timeout: 10000 });
  85  | }
  86  | 
  87  | async function runModuleTest(page, options) {
  88  |   await openScanner(page, options.navName, options.titleText);
  89  |   await testGuide(page);
  90  |   await testCameraFlow(page);
  91  |   await closeScanner(page);
  92  | 
  93  |   await openScanner(page, options.navName, options.titleText);
  94  |   await testFileUpload(page, options.qrPath, options.expectedText);
  95  |   await closeScanner(page);
  96  | }
  97  | 
  98  | test('smoke QR inventario y comandas', async ({ page }) => {
  99  |   await login(page);
  100 | 
  101 |   await runModuleTest(page, {
  102 |     navName: 'Entrepôt',
  103 |     titleText: 'Scanner Code QR - Inventaire',
  104 |     qrPath: inventoryQr,
  105 |     expectedText: 'Produit Smoke',
  106 |   });
  107 | 
  108 |   await runModuleTest(page, {
  109 |     navName: 'Comptoir',
  110 |     titleText: 'Scanner Code QR',
  111 |     qrPath: comandasQr,
  112 |     expectedText: 'SMOKE-001',
  113 |   });
  114 | });
  115 | 
```