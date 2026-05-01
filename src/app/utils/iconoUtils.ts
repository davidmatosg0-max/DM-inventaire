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
  { keywords: ['bagel'], icono: '🥯' },
  { keywords: ['pretzel'], icono: '🥨' },
  { keywords: ['tortilla'], icono: '🫓' },
  { keywords: ['pastel', 'cake', 'torta'], icono: '🍰' },
  { keywords: ['galleta', 'cookie'], icono: '🍪' },
  { keywords: ['donut', 'dona'], icono: '🍩' },
  
  // Granos y cereales
  { keywords: ['arroz', 'rice'], icono: '🍚' },
  { keywords: ['pasta', 'spaghetti'], icono: '🍝' },
  { keywords: ['cereal'], icono: '🥣' },
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
  { keywords: ['miel', 'honey'], icono: '🍯' },
  { keywords: ['mermelada', 'jam'], icono: '🍯' },
  { keywords: ['mantequilla de maní', 'peanut butter'], icono: '🥜' },
  { keywords: ['ketchup', 'salsa'], icono: '🍅' },
  { keywords: ['mostaza', 'mustard'], icono: '🌭' },
  { keywords: ['mayonesa', 'mayo'], icono: '🥚' },
  
  // Bebidas
  { keywords: ['agua', 'water'], icono: '💧' },
  { keywords: ['jugo', 'juice', 'zumo'], icono: '🧃' },
  { keywords: ['refresco', 'soda', 'gaseosa'], icono: '🥤' },
  { keywords: ['café', 'cafe', 'coffee'], icono: '☕' },
  { keywords: ['té', 'te', 'tea'], icono: '🍵' },
  { keywords: ['vino', 'wine'], icono: '🍷' },
  { keywords: ['cerveza', 'beer'], icono: '🍺' },
  { keywords: ['leche', 'milk'], icono: '🥛' },
  
  // Snacks y dulces
  { keywords: ['chocolate'], icono: '🍫' },
  { keywords: ['caramelo', 'candy', 'dulce'], icono: '🍬' },
  { keywords: ['paleta', 'lollipop'], icono: '🍭' },
  { keywords: ['chicle', 'gum'], icono: '🍬' },
  { keywords: ['chips', 'papas fritas'], icono: '🍟' },
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
  { keywords: ['ramen', 'fideos'], icono: '🍜' },
  
  // Categorías generales
  { keywords: ['fruta', 'fruit'], icono: '🍎' },
  { keywords: ['verdura', 'vegetal', 'vegetable'], icono: '🥬' },
  { keywords: ['proteína', 'proteina', 'protein'], icono: '🥩' },
  { keywords: ['lácteo', 'lacteo', 'dairy'], icono: '🥛' },
  { keywords: ['bebida', 'drink', 'beverage'], icono: '🧃' },
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
