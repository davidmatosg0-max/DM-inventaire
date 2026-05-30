const { chromium } = require('playwright');

const baseUrl = process.env.ADRESSES_SYNC_BASE_URL || 'http://127.0.0.1:5173/';

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true, timeout: 30000 });
  const page = await browser.newPage();

  try {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

    const resultado = await page.evaluate(async () => {
      const storageKey = 'villes_quartiers_adresses';
      const raw = [
        {
          id: 'ville-custom-1',
          nom: 'Laval',
          province: 'Quebec',
          pays: 'Canada',
          quartiers: [
            {
              id: 'quartier-1',
              nom: 'Chomédey',
              codePostal: 'h7t',
              description: 'Quartier incomplet',
              rues: [
                {
                  id: 'rue-1',
                  nom: 'Rue de Bruxelles',
                  type: 'rue',
                  codePostal: 'h7t',
                  dateCreation: '2026-05-17T00:00:00.000Z',
                  dateModification: '2026-05-17T00:00:00.000Z',
                },
                {
                  id: 'rue-2',
                  nom: 'Rue De La Seigneurie',
                  type: 'rue',
                  codePostal: 'h7t',
                  dateCreation: '2026-05-17T00:00:00.000Z',
                  dateModification: '2026-05-17T00:00:00.000Z',
                },
              ],
              dateCreation: '2026-05-17T00:00:00.000Z',
              dateModification: '2026-05-17T00:00:00.000Z',
            },
            {
              id: 'quartier-2',
              nom: 'Laval-Les Îles',
              codePostal: 'h7w',
              description: 'Alias public officiel',
              rues: [
                {
                  id: 'rue-3',
                  nom: "Rue de l'Île-Paton",
                  type: 'rue',
                  codePostal: 'h7w',
                  dateCreation: '2026-05-17T00:00:00.000Z',
                  dateModification: '2026-05-17T00:00:00.000Z',
                },
              ],
              dateCreation: '2026-05-17T00:00:00.000Z',
              dateModification: '2026-05-17T00:00:00.000Z',
            },
            {
              id: 'quartier-3',
              nom: 'Renaud-Coursol',
              codePostal: 'h7e',
              description: 'Alias BML officiel',
              rues: [],
              dateCreation: '2026-05-17T00:00:00.000Z',
              dateModification: '2026-05-17T00:00:00.000Z',
            },
            {
              id: 'quartier-4',
              nom: "L'Abord-à-Plouffe",
              codePostal: 'h7v',
              description: 'Ancienne municipalité fusionnée',
              rues: [
                {
                  id: 'rue-4',
                  nom: 'Boulevard Le Corbusier',
                  type: 'boulevard',
                  codePostal: 'h7w',
                  dateCreation: '2026-05-17T00:00:00.000Z',
                  dateModification: '2026-05-17T00:00:00.000Z',
                },
              ],
              dateCreation: '2026-05-17T00:00:00.000Z',
              dateModification: '2026-05-17T00:00:00.000Z',
            },
            {
              id: 'quartier-5',
              nom: 'Auteuil',
              codePostal: 'h7h',
              description: 'Quartier avec libellés partiels',
              rues: [
                {
                  id: 'rue-5',
                  nom: 'Lévesque Est',
                  type: 'boulevard',
                  codePostal: 'h7h',
                  dateCreation: '2026-05-17T00:00:00.000Z',
                  dateModification: '2026-05-17T00:00:00.000Z',
                },
                {
                  id: 'rue-6',
                  nom: 'Place Chomedey',
                  type: 'place',
                  codePostal: 'h7h',
                  dateCreation: '2026-05-17T00:00:00.000Z',
                  dateModification: '2026-05-17T00:00:00.000Z',
                },
              ],
              dateCreation: '2026-05-17T00:00:00.000Z',
              dateModification: '2026-05-17T00:00:00.000Z',
            },
            {
              id: 'quartier-6',
              nom: 'Vimont',
              codePostal: 'h7m',
              description: 'Quartier con rue validada en web',
              rues: [
                {
                  id: 'rue-7',
                  nom: 'Rue de Bruxelles',
                  type: 'rue',
                  codePostal: 'h7m',
                  dateCreation: '2026-05-17T00:00:00.000Z',
                  dateModification: '2026-05-17T00:00:00.000Z',
                },
              ],
              dateCreation: '2026-05-17T00:00:00.000Z',
              dateModification: '2026-05-17T00:00:00.000Z',
            },
          ],
          dateCreation: '2026-05-17T00:00:00.000Z',
          dateModification: '2026-05-17T00:00:00.000Z',
        },
        {
          id: 'ville-custom-2',
          nom: ' Montréal ',
          province: 'Québec',
          pays: 'Canada',
          quartiers: [],
          dateCreation: '2026-05-17T00:00:00.000Z',
          dateModification: '2026-05-17T00:00:00.000Z',
        },
      ];

      localStorage.setItem(storageKey, JSON.stringify(raw));

      const { verifierEtReparerAdresses, obtenirVilles } = await import('/src/app/utils/adressesQuartiersStorage.ts');
      const audit = verifierEtReparerAdresses();
      const villes = obtenirVilles();
      const laval = villes.find((ville) => ville.nom === 'Laval');
      const chomedey = laval?.quartiers.find((quartier) => quartier.nom === 'Chomedey');
      const lavalOuest = laval?.quartiers.find((quartier) => quartier.nom === 'Laval-Ouest');
      const auteuil = laval?.quartiers.find((quartier) => quartier.nom === 'Auteuil');
      const ilesLaval = laval?.quartiers.find((quartier) => quartier.nom === 'Îles-Laval');
      const renaud = laval?.quartiers.find((quartier) => quartier.nom === 'Renaud');
      const vimont = laval?.quartiers.find((quartier) => quartier.nom === 'Vimont');
      const aliasRestants = (laval?.quartiers || [])
        .filter((quartier) => ['Laval-Les Îles', 'Renaud-Coursol', "L'Abord-à-Plouffe"].includes(quartier.nom))
        .map((quartier) => quartier.nom);
      const rueBruxelles = chomedey?.rues?.find((rue) => rue.nom === 'Rue de Bruxelles');
      const cheminBordDeLeau = lavalOuest?.rues?.find((rue) => rue.nom === "Chemin du Bord-de-l'Eau");
      const boulevardLevesqueEst = auteuil?.rues?.find((rue) => rue.nom === 'Boulevard Lévesque Est');
      const levesqueEstPartiel = auteuil?.rues?.some((rue) => rue.nom === 'Lévesque Est');
      const placeChomedeyDansAuteuil = auteuil?.rues?.some((rue) => rue.nom === 'Place Chomedey');
      const bruxellesDansVimont = vimont?.rues?.some((rue) => rue.nom === 'Rue de Bruxelles');
      const quartiersSansRues = (laval?.quartiers || [])
        .filter((quartier) => !quartier.rues || quartier.rues.length === 0)
        .map((quartier) => quartier.nom);
      const typesLaval = Array.from(
        new Set(
          (laval?.quartiers || []).flatMap((quartier) => (quartier.rues || []).map((rue) => rue.type))
        )
      );
      const montreal = villes.find((ville) => ville.nom === 'Montréal');

      return {
        audit,
        quartiersLaval: laval?.quartiers.length || 0,
        chomedeyCodePostal: chomedey?.codePostal,
        rueBruxellesCodePostal: rueBruxelles?.codePostal,
        rueSeigneurieCount: chomedey?.rues?.filter((rue) => rue.nom.toLowerCase().includes('seigneurie')).length || 0,
        cheminExiste: Boolean(cheminBordDeLeau),
        boulevardLevesqueExiste: Boolean(boulevardLevesqueEst),
        levesqueEstPartiel: Boolean(levesqueEstPartiel),
        placeChomedeyDansAuteuil: Boolean(placeChomedeyDansAuteuil),
        bruxellesDansVimont: Boolean(bruxellesDansVimont),
        ilesLavalExiste: Boolean(ilesLaval),
        renaudExiste: Boolean(renaud),
        aliasRestants,
        quartiersSansRues,
        typesLaval,
        montrealExiste: Boolean(montreal),
      };
    });

    assert(resultado.audit.success, `La auditoría falló: ${JSON.stringify(resultado.audit)}`);
    assert(resultado.montrealExiste, 'La ciudad personalizada Montréal no debe perderse.');
    assert(resultado.quartiersLaval >= 19, `Laval debe contener todos los quartiers canónicos. Recibido: ${resultado.quartiersLaval}`);
    assert(resultado.chomedeyCodePostal === 'H7V, H7W, H7X, H7Y', `El código postal de Chomedey no quedó sincronizado: ${resultado.chomedeyCodePostal}`);
    assert(resultado.rueBruxellesCodePostal === 'H7W', `Rue de Bruxelles debe quedar con H7W. Recibido: ${resultado.rueBruxellesCodePostal}`);
    assert(resultado.rueSeigneurieCount === 1, `No debe haber duplicados de Rue de la Seigneurie. Recibido: ${resultado.rueSeigneurieCount}`);
    assert(resultado.cheminExiste, 'Debe existir al menos un chemin canónico en Laval-Ouest.');
    assert(resultado.boulevardLevesqueExiste, 'Lévesque Est debe reconciliarse con Boulevard Lévesque Est en Auteuil.');
    assert(!resultado.levesqueEstPartiel, 'El alias parcial Lévesque Est no debe sobrevivir si ya existe Boulevard Lévesque Est.');
    assert(!resultado.placeChomedeyDansAuteuil, 'Place Chomedey no debe sobrevivir en Auteuil.');
    assert(resultado.bruxellesDansVimont, 'Rue de Bruxelles debe conservarse en Vimont cuando existe en la base canónica verificada.');
    assert(resultado.ilesLavalExiste, 'El alias Laval-Les Îles debe reconciliarse con Îles-Laval.');
    assert(resultado.renaudExiste, 'El alias Renaud-Coursol debe reconciliarse con Renaud.');
    assert(resultado.aliasRestants.length === 0, `No deben quedar aliases sin reconciliar: ${resultado.aliasRestants.join(', ')}`);
    assert(resultado.quartiersSansRues.length === 0, `Aucun quartier de Laval ne doit rester sans voies. Manquants: ${resultado.quartiersSansRues.join(', ')}`);
    assert(resultado.typesLaval.includes('place'), `La base reconciliada debe conservar les places. Types reçus: ${resultado.typesLaval.join(', ')}`);
    assert(resultado.typesLaval.includes('montée'), `La base reconciliada debe conserver les montées. Types reçus: ${resultado.typesLaval.join(', ')}`);

    console.log('ADRESSES_SYNC_FUNCTIONAL_OK');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('ADRESSES_SYNC_FUNCTIONAL_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});
