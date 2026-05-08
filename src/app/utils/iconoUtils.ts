/**
 * Sistema de generación automática de iconos/emojis basado en nombres de productos
 * Detecta palabras clave y sugiere el emoji más apropiado
 */

type IconoMap = {
  keywords: string[];
  icono: string;
};

const mapeoIconos: IconoMap[] = [
  // Frutas
  { keywords: ['manzana', 'apple'], icono: '🍎' },
  { keywords: ['naranja', 'orange'], icono: '🍊' },
  { keywords: ['plátano', 'platano', 'banana'], icono: '🍌' },
  { keywords: ['uva', 'grape'], icono: '🍇' },
  { keywords: ['fresa', 'frutilla', 'strawberry'], icono: '🍓' },
  { keywords: ['sandía', 'sandia', 'watermelon'], icono: '🍉' },
  { keywords: ['melón', 'melon'], icono: '🍈' },
  { keywords: ['piña', 'pineapple', 'ananas'], icono: '🍍' },
  { keywords: ['pera', 'pear'], icono: '🍐' },
  { keywords: ['durazno', 'melocotón', 'peach'], icono: '🍑' },
  { keywords: ['cereza', 'cherry'], icono: '🍒' },
  { keywords: ['limón', 'limon', 'lemon'], icono: '🍋' },
  { keywords: ['kiwi'], icono: '🥝' },
  { keywords: ['mango'], icono: '🥭' },
  { keywords: ['coco', 'coconut'], icono: '🥥' },
  { keywords: ['aguacate', 'avocado', 'palta'], icono: '🥑' },
  
  // Verduras
  { keywords: ['lechuga', 'lettuce'], icono: '🥬' },
  { keywords: ['tomate', 'tomato'], icono: '🍅' },
  { keywords: ['zanahoria', 'carrot'], icono: '🥕' },
  { keywords: ['brócoli', 'brocoli', 'broccoli'], icono: '🥦' },
  { keywords: ['berenjena', 'eggplant'], icono: '🍆' },
  { keywords: ['papa', 'patata', 'potato'], icono: '🥔' },
  { keywords: ['maíz', 'maiz', 'corn', 'choclo'], icono: '🌽' },
  { keywords: ['pimiento', 'pepper', 'chile'], icono: '🌶️' },
  { keywords: ['pepino', 'cucumber'], icono: '🥒' },
  { keywords: ['cebolla', 'onion'], icono: '🧅' },
  { keywords: ['ajo', 'garlic'], icono: '🧄' },
  { keywords: ['calabaza', 'pumpkin'], icono: '🎃' },
  { keywords: ['champiñón', 'champiñon', 'hongo', 'mushroom'], icono: '🍄' },
  
  // Proteínas y carnes
  { keywords: ['carne', 'beef', 'res'], icono: '🥩' },
  { keywords: ['pollo', 'chicken'], icono: '🍗' },
  { keywords: ['pescado', 'fish', 'pez'], icono: '🐟' },
  { keywords: ['salmón', 'salmon'], icono: '🐟' },
  { keywords: ['camarón', 'camaron', 'shrimp', 'gamba'], icono: '🦐' },
  { keywords: ['huevo', 'egg'], icono: '🥚' },
  { keywords: ['tocino', 'bacon'], icono: '🥓' },
  { keywords: ['jamón', 'jamon', 'ham'], icono: '🍖' },
  { keywords: ['salchicha', 'sausage', 'chorizo'], icono: '🌭' },
  { keywords: ['hamburguesa', 'burger'], icono: '🍔' },
  
  // Lácteos
  { keywords: ['leche', 'milk'], icono: '🥛' },
  { keywords: ['queso', 'cheese'], icono: '🧀' },
  { keywords: ['mantequilla', 'butter'], icono: '🧈' },
  { keywords: ['yogurt', 'yogur'], icono: '🥛' },
  { keywords: ['helado', 'ice cream'], icono: '🍨' },
  
  // Panadería
  { keywords: ['pan', 'bread'], icono: '🍞' },
  { keywords: ['baguette'], icono: '🥖' },
  { keywords: ['croissant'], icono: '🥐' },
  { keywords: ['viennoiserie', 'viennoiseries', 'pastry'], icono: '🥐' },
  { keywords: ['bagel'], icono: '🥯' },
  { keywords: ['pretzel'], icono: '🥨' },
  { keywords: ['tortilla'], icono: '🫓' },
  { keywords: ['wrap', 'wraps'], icono: '🌯' },
  { keywords: ['pastel', 'cake', 'torta'], icono: '🍰' },
  { keywords: ['galleta', 'cookie'], icono: '🍪' },
  { keywords: ['donut', 'dona'], icono: '🍩' },
  
  // Granos y cereales
  { keywords: ['arroz', 'rice'], icono: '🍚' },
  { keywords: ['pasta', 'spaghetti'], icono: '🍝' },
  { keywords: ['cereal'], icono: '🥣' },
  { keywords: ['céréales déjeuner', 'cereales desayuno', 'breakfast cereal'], icono: '🥣' },
  { keywords: ['granola', 'muesli', 'porridge', 'oatmeal'], icono: '🥣' },
  { keywords: ['avena', 'oat'], icono: '🥣' },
  { keywords: ['harina', 'flour'], icono: '🌾' },
  { keywords: ['trigo', 'wheat'], icono: '🌾' },
  
  // Conservas y enlatados
  { keywords: ['conserva', 'lata', 'enlatado', 'canned'], icono: '🥫' },
  { keywords: ['sopa', 'soup'], icono: '🥫' },
  
  // Aceites y condimentos
  { keywords: ['aceite', 'oil', 'oliva'], icono: '🫒' },
  { keywords: ['vinagre', 'vinegar'], icono: '🫗' },
  { keywords: ['sal', 'salt'], icono: '🧂' },
  { keywords: ['azúcar', 'azucar', 'sugar'], icono: '🍬' },
  { keywords: ['sucre', 'cassonade', 'sucre brun', 'sucre glace', 'icing sugar'], icono: '🍬' },
  { keywords: ['miel', 'honey'], icono: '🍯' },
  { keywords: ['sirop', 'syrup'], icono: '🍯' },
  { keywords: ['sirop d erable', 'sirop d’érable', 'maple syrup'], icono: '🍯' },
  { keywords: ['mermelada', 'jam'], icono: '🍓' },
  { keywords: ['confiture'], icono: '🍓' },
  { keywords: ['gelée', 'gelee', 'jelly'], icono: '🍇' },
  { keywords: ['marmelade'], icono: '🍊' },
  { keywords: ['mantequilla de maní', 'peanut butter'], icono: '🥜' },
  { keywords: ['beurre de cacahuète', 'beurre d arachide', 'beurre d’arachide'], icono: '🥜' },
  { keywords: ['beurre de noix', 'almond butter', 'cashew butter', 'nut butter'], icono: '🥜' },
  { keywords: ['fromage à tartiner', 'fromage a tartiner', 'cream cheese'], icono: '🧀' },
  { keywords: ['tartinade', 'tartinades', 'spread', 'pâte à tartiner', 'pate a tartiner'], icono: '🫙' },
  { keywords: ['nutella', 'sweet spread', 'tartinade sucrée', 'tartinade sucree'], icono: '🍫' },
  { keywords: ['houmous', 'hummus', 'falafel'], icono: '🧆' },
  { keywords: ['trempette', 'dip', 'tahini'], icono: '🫙' },
  { keywords: ['ketchup', 'salsa'], icono: '🍅' },
  { keywords: ['mostaza', 'mustard'], icono: '🌭' },
  { keywords: ['mayonesa', 'mayo'], icono: '🥚' },
  
  // Bebidas
  { keywords: ['agua', 'water'], icono: '💧' },
  { keywords: ['eau'], icono: '💧' },
  { keywords: ['jugo', 'juice', 'zumo'], icono: '🧃' },
  { keywords: ['jus', 'jus de fruits'], icono: '🧃' },
  { keywords: ['refresco', 'soda', 'gaseosa'], icono: '🥤' },
  { keywords: ['boisson', 'boissons', 'beverage', 'drink'], icono: '🧃' },
  { keywords: ['boisson chaude', 'boissons chaudes', 'hot drink'], icono: '☕' },
  { keywords: ['boisson froide', 'boissons froides', 'cold drink'], icono: '🧊' },
  { keywords: ['tisane', 'infusion', 'herbal tea'], icono: '🫖' },
  { keywords: ['chocolat chaud', 'hot chocolate', 'cacao'], icono: '☕' },
  { keywords: ['espresso', 'latte', 'cappuccino'], icono: '☕' },
  { keywords: ['limonade', 'lemonade'], icono: '🥤' },
  { keywords: ['smoothie', 'milkshake'], icono: '🧃' },
  { keywords: ['eau pétillante', 'eau petillante', 'sparkling water', 'seltzer'], icono: '🥤' },
  { keywords: ['kombucha', 'energy drink', 'boisson énergétique', 'boisson energisante'], icono: '🧃' },
  { keywords: ['café', 'cafe', 'coffee'], icono: '☕' },
  { keywords: ['té', 'te', 'tea'], icono: '🍵' },
  { keywords: ['vino', 'wine'], icono: '🍷' },
  { keywords: ['cerveza', 'beer'], icono: '🍺' },
  { keywords: ['leche', 'milk'], icono: '🥛' },
  
  // Snacks y dulces
  { keywords: ['chocolate'], icono: '🍫' },
  { keywords: ['barres tendres', 'granola bar', 'snack bar'], icono: '🍫' },
  { keywords: ['biscuit', 'biscuits'], icono: '🍪' },
  { keywords: ['craquelin', 'craquelins', 'cracker', 'crackers', 'galleta salada'], icono: '🍘' },
  { keywords: ['caramelo', 'candy', 'dulce'], icono: '🍬' },
  { keywords: ['paleta', 'lollipop'], icono: '🍭' },
  { keywords: ['chicle', 'gum'], icono: '🍬' },
  { keywords: ['chips', 'papas fritas', 'frites', 'crisps'], icono: '🍟' },
  { keywords: ['muffin', 'muffins'], icono: '🧁' },
  { keywords: ['pouding', 'pudding'], icono: '🍮' },
  { keywords: ['palomitas', 'popcorn'], icono: '🍿' },
  { keywords: ['pretzel'], icono: '🥨' },
  
  // Frutos secos y semillas
  { keywords: ['nuez', 'nut', 'walnut'], icono: '🥜' },
  { keywords: ['almendra', 'almond'], icono: '🥜' },
  { keywords: ['maní', 'mani', 'peanut', 'cacahuate'], icono: '🥜' },
  { keywords: ['pistacho'], icono: '🥜' },
  { keywords: ['castaña', 'chestnut'], icono: '🌰' },
  
  // Comidas preparadas
  { keywords: ['pizza'], icono: '🍕' },
  { keywords: ['taco'], icono: '🌮' },
  { keywords: ['burrito'], icono: '🌯' },
  { keywords: ['sándwich', 'sandwich', 'bocadillo'], icono: '🥪' },
  { keywords: ['ensalada', 'salad'], icono: '🥗' },
  { keywords: ['curry'], icono: '🍛' },
  { keywords: ['sushi'], icono: '🍱' },
  { keywords: ['ramen', 'fideos', 'nouilles', 'noodles'], icono: '🍜' },
  
  // Categorías generales
  { keywords: ['fruta', 'fruit'], icono: '🍎' },
  { keywords: ['verdura', 'vegetal', 'vegetable'], icono: '🥬' },
  { keywords: ['proteína', 'proteina', 'protein'], icono: '🥩' },
  { keywords: ['lácteo', 'lacteo', 'dairy'], icono: '🥛' },
  { keywords: ['bebida', 'drink', 'beverage', 'boisson', 'boissons'], icono: '🧃' },
  { keywords: ['grano', 'grain', 'cereal'], icono: '🌾' },
  { keywords: ['seco', 'dry'], icono: '🍚' },
  { keywords: ['congelado', 'frozen'], icono: '🧊' },
  { keywords: ['refrigerado', 'cold'], icono: '❄️' },
];

/**
 * Genera un icono automáticamente basándose en el nombre del producto/categoría
 * @param nombre - Nombre del producto o categoría
 * @returns Emoji apropiado o un emoji por defecto
 */
export function generarIconoAutomatico(nombre: string): string {
  if (!nombre || nombre.trim() === '') {
    return '📦';
  }

  const nombreLower = nombre.toLowerCase().trim();
  
  // Buscar coincidencias en el mapeo
  for (const mapeo of mapeoIconos) {
    for (const keyword of mapeo.keywords) {
      if (nombreLower.includes(keyword)) {
        return mapeo.icono;
      }
    }
  }
  
  // Si no hay coincidencia, retornar icono por defecto
  return '📦';
}

/**
 * Genera un icono basándose en nombre de producto y categoría
 * Prioriza el nombre del producto, pero si no encuentra, usa la categoría
 */
export function generarIconoProducto(nombreProducto: string, categoria?: string, subcategoria?: string): string {
  // Primero intentar con el nombre completo del producto
  let icono = generarIconoAutomatico(nombreProducto);
  
  // Si retorna el icono por defecto, intentar con la subcategoría
  if (icono === '📦' && subcategoria) {
    icono = generarIconoAutomatico(subcategoria);
  }
  
  // Si aún es el icono por defecto, intentar con la categoría
  if (icono === '📦' && categoria) {
    icono = generarIconoAutomatico(categoria);
  }
  
  return icono;
}

/**
 * Obtener sugerencias de iconos para un nombre
 * Retorna múltiples opciones posibles
 */
export function sugerirIconos(nombre: string): string[] {
  if (!nombre || nombre.trim() === '') {
    return ['📦', '📁', '🗂️', '🎁'];
  }

  const nombreLower = nombre.toLowerCase().trim();
  const sugerencias: string[] = [];
  
  // Recopilar todas las coincidencias
  for (const mapeo of mapeoIconos) {
    for (const keyword of mapeo.keywords) {
      if (nombreLower.includes(keyword) && !sugerencias.includes(mapeo.icono)) {
        sugerencias.push(mapeo.icono);
      }
    }
  }
  
  // Si no hay sugerencias, retornar algunas genéricas
  if (sugerencias.length === 0) {
    return ['📦', '🎁', '🗃️', '📁'];
  }
  
  return sugerencias.slice(0, 5); // Máximo 5 sugerencias
}
