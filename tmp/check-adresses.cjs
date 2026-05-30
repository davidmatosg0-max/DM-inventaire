const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const jsonPath = 'C:\\Users\\david\\Downloads\\adresses-quartiers-2026-05-17 (1).json';
    const jsonData = fs.readFileSync(jsonPath, 'utf8');

    await page.goto('http://127.0.0.1:5173/');

    const stats = await page.evaluate(async (data) => {
        localStorage.setItem('villes_quartiers_adresses', data);
        try {
            const mod = await import('/src/app/utils/adressesQuartiersStorage.ts');
            const result = mod.verifierEtReparerAdresses();
            const state = JSON.parse(localStorage.getItem('villes_quartiers_adresses'));
            const laval = state.find(v => v.nom === 'Laval');
            
            const check = (qNames, s) => {
                let foundAll = [];
                qNames.forEach(qNom => {
                    const qList = laval.quartiers.filter(q => q.nom === qNom);
                    qList.forEach(q => {
                        const found = q.rues.filter(r => r.nom === s).map(r => `${q.nom}: ${r.nom}`);
                        foundAll = foundAll.concat(found);
                    });
                });
                return foundAll;
            };

            return {
                stats: result,
                residues: {
                    'Auteuil (Cléroux)': check(['Auteuil'], 'Cléroux'),
                    'Auteuil (Samson)': check(['Auteuil'], 'Samson'),
                    'Auteuil (des Laurentides)': check(['Auteuil'], 'des Laurentides'),
                    'Auteuil (Lévesque Est)': check(['Auteuil'], 'Lévesque Est'),
                    'Chomedey (Cléroux)': check(['Chomedey'], 'Cléroux'),
                    'Chomedey (Souvenir)': check(['Chomedey'], 'Souvenir'),
                    'Chomedey (de la Concorde Ouest)': check(['Chomedey'], 'de la Concorde Ouest'),
                    'Fabreville (Samson)': check(['Fabreville', 'Fabreville-Est', 'Fabreville-Ouest'], 'Samson'),
                    'Fabreville (des Laurentides)': check(['Fabreville', 'Fabreville-Est', 'Fabreville-Ouest'], 'des Laurentides'),
                    'Vimont (des Laurentides)': check(['Vimont'], 'des Laurentides'),
                    'Vimont (Rue de Bruxelles)': check(['Vimont'], 'Rue de Bruxelles')
                }
            };
        } catch (e) { return { error: e.message }; }
    }, jsonData);

    console.log(JSON.stringify(stats, null, 2));
    await browser.close();
})();
