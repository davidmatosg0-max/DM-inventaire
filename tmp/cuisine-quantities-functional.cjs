const { chromium } = require('playwright');

const baseUrl = process.env.CUISINE_QUANTITIES_BASE_URL || 'http://127.0.0.1:5173/';
const RECIPE_NAME = 'Recette Smoke Quantites';
const PRODUCED_NAME = 'Produit Elabore Smoke';
const PRODUCT_ID = 'prod-cuisine-quantity';

function createProduct() {
  return {
    id: PRODUCT_ID,
    codigo: 'CUISINE-QTY-001',
    nombre: 'Produit Ingredient Smoke',
    categoria: 'Légumes',
    subcategoria: 'Carottes',
    unidad: 'kg',
    icono: '🥕',
    peso: 1,
    pesoUnitario: 1,
    pesoRegistrado: 20,
    stockActual: 20,
    stockMinimo: 1,
    ubicacion: 'CUIS-A1',
    lote: 'LOT-CUISINE-QTY',
    fechaVencimiento: '2026-12-31',
    esPRS: false,
    activo: true,
    fechaCreacion: '2026-05-16T10:00:00.000Z',
    valorUnitario: 2,
    valorTotal: 40,
    temperatura: 'ambiente',
    temperaturaAlmacenamiento: 'Ambiante',
    temperaturaOriginalEntrada: 'ambiente'
  };
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function parseDisplayedQuantity(value) {
  return Number(String(value).replace(',', '.'));
}

async function launchBrowser() {
  try {
    const browser = await chromium.launch({ headless: true, timeout: 30000 });
    return { browser, channel: 'chromium' };
  } catch (error) {}

  for (const channel of ['msedge', 'chrome']) {
    try {
      const browser = await chromium.launch({ channel, headless: true, timeout: 30000 });
      return { browser, channel };
    } catch (error) {}
  }

  const browser = await chromium.launch({ headless: true, timeout: 30000 });
  return { browser, channel: 'chromium' };
}

async function login(page) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByLabel('Utilisateur').fill('David');
  await page.getByLabel('Mot de passe').fill('Lettycia26');
  await page.getByRole('button', { name: 'Connexion', exact: true }).click();
  await page.locator('main').first().waitFor({ timeout: 20000 });
}

async function seedStorage(page) {
  const product = createProduct();

  await page.evaluate(({ productData }) => {
    localStorage.setItem('banco_alimentos_productos', JSON.stringify([productData]));
    localStorage.setItem('recetas_cocina', JSON.stringify([]));
    localStorage.setItem('transformaciones_cocina', JSON.stringify([]));
  }, { productData: product });
}

async function openRecipeModal(page) {
  await page.goto(`${baseUrl}?page=cuisine`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.getByText('Cuisine et Transformation', { exact: true }).waitFor({ timeout: 20000 });
  await page.getByText('Gestion des Recettes', { exact: true }).first().click();
  await page.getByRole('button', { name: 'Nouvelle Recette', exact: true }).click();

  const modal = page.locator('div.fixed.inset-0.z-50').last();
  await modal.getByText('Nouvelle Recette', { exact: true }).waitFor({ timeout: 20000 });
  return modal;
}

async function createRecipe(page) {
  const modal = await openRecipeModal(page);

  await modal.getByPlaceholder('Ex: Soupe aux légumes', { exact: true }).fill(RECIPE_NAME);
  await modal.getByPlaceholder('Ex: Soupe aux légumes (portions)', { exact: true }).fill(PRODUCED_NAME);

  const selects = modal.locator('select');
  await selects.nth(1).selectOption(PRODUCT_ID);

  const decimalInputs = modal.locator('input[inputmode="decimal"]');
  const ingredientQuantityInput = decimalInputs.first();
  await ingredientQuantityInput.fill('10,5');
  assert(parseDisplayedQuantity(await ingredientQuantityInput.inputValue()) === 10.5, 'La quantité de ingrediente debe aceptar coma decimal.');

  const producedQuantityInput = modal.locator('input[inputmode="numeric"]').first();
  await producedQuantityInput.waitFor({ timeout: 20000 });
  await producedQuantityInput.locator('xpath=following-sibling::button[1]').click();
  await producedQuantityInput.locator('xpath=following-sibling::button[1]').click();
  assert((await producedQuantityInput.inputValue()) === '3', 'La cantidad producida debe subir a 3 con el stepper.');

  const unitWeightInput = decimalInputs.nth(1);
  await unitWeightInput.fill('0,75');
  assert(parseDisplayedQuantity(await unitWeightInput.inputValue()) === 0.75, 'El peso unitario debe aceptar coma decimal.');

  await modal.getByRole('button', { name: 'Ajouter', exact: true }).click();
  await modal.locator('p.font-medium').filter({ hasText: 'Produit Ingredient Smoke' }).first().waitFor({ timeout: 20000 });

  await modal.getByRole('button', { name: 'Créer', exact: true }).click();

  await page.waitForFunction(({ recipeName }) => {
    const recetas = JSON.parse(localStorage.getItem('recetas_cocina') || '[]');
    return recetas.some((receta) => receta.nombre === recipeName);
  }, { recipeName: RECIPE_NAME }, { timeout: 20000 });
}

async function assertStoredRecipe(page) {
  const recipe = await page.evaluate(({ recipeName }) => {
    const recetas = JSON.parse(localStorage.getItem('recetas_cocina') || '[]');
    return recetas.find((receta) => receta.nombre === recipeName) || null;
  }, { recipeName: RECIPE_NAME });

  assert(Boolean(recipe), 'La receta no fue persistida en recetas_cocina.');
  assert(recipe.ingredientes.length === 1, `Se esperaba 1 ingrediente y se encontraron ${recipe.ingredientes.length}.`);
  assert(recipe.ingredientes[0].productoId === PRODUCT_ID, 'El ingrediente guardado no corresponde al producto sembrado.');
  assert(recipe.ingredientes[0].cantidad === 10.5, `La cantidad del ingrediente debía ser 10.5 y fue ${recipe.ingredientes[0].cantidad}.`);
  assert(recipe.productoElaborado.nombre === PRODUCED_NAME, 'El producto elaborado guardado no coincide.');
  assert(recipe.productoElaborado.cantidad === 3, `La cantidad producida debía ser 3 y fue ${recipe.productoElaborado.cantidad}.`);
  assert(recipe.productoElaborado.pesoUnitario === 0.75, `El peso unitario debía ser 0.75 y fue ${recipe.productoElaborado.pesoUnitario}.`);
}

async function main() {
  const { browser, channel } = await launchBrowser();
  console.log(`BROWSER ${channel}`);

  const page = await browser.newPage();

  try {
    await login(page);
    await seedStorage(page);
    await createRecipe(page);
    await assertStoredRecipe(page);
    console.log('CUISINE_QUANTITIES_FUNCTIONAL_OK');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('CUISINE_QUANTITIES_FUNCTIONAL_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});