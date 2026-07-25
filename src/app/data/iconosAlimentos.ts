/**
 * Iconos estandarizados para el sistema de Banco de Alimentos
 * Todos los iconos están organizados por categorías para facilitar su uso
 */

export type IconoAlimento = {
  emoji: string;
  nombre: string;
  categoria: string;
};

export type SeccionIconos = {
  id: string;
  labelKey: string;
  commonLabelKey: string;
  iconos: string[];
};

export type FamiliaOperativaIconos = {
  id: string;
  label: string;
  iconos: string[];
};

export const CATEGORIAS_NO_ALIMENTARIAS = [
  'Higiene Personal',
  'Limpieza del Hogar',
  'Bebé y Cuidado Infantil',
  'Ropa y Textiles',
  'Escolares y Educación',
  'Hogar y Cocina',
  'Mascotas',
  'Varios',
];

// Iconos principales de categorías
export const ICONOS_CATEGORIAS: IconoAlimento[] = [
  // Granos y Cereales
  { emoji: '🍚', nombre: 'Arroz', categoria: 'Granos y Cereales' },
  { emoji: '🍝', nombre: 'Pasta', categoria: 'Granos y Cereales' },
  { emoji: '🍞', nombre: 'Pan', categoria: 'Granos y Cereales' },
  { emoji: '🥖', nombre: 'Baguette', categoria: 'Granos y Cereales' },
  { emoji: '🥣', nombre: 'Cereales', categoria: 'Granos y Cereales' },
  { emoji: '🥣', nombre: 'Céréales déjeuner', categoria: 'Granos y Cereales' },
  { emoji: '🥣', nombre: 'Granola/Muesli', categoria: 'Granos y Cereales' },
  { emoji: '🥣', nombre: 'Porridge', categoria: 'Granos y Cereales' },
  { emoji: '🥐', nombre: 'Croissant', categoria: 'Granos y Cereales' },
  { emoji: '🥐', nombre: 'Viennoiseries', categoria: 'Granos y Cereales' },
  { emoji: '🥯', nombre: 'Bagel', categoria: 'Granos y Cereales' },
  { emoji: '🥨', nombre: 'Pretzel', categoria: 'Granos y Cereales' },
  { emoji: '🫓', nombre: 'Wraps et tortillas', categoria: 'Granos y Cereales' },
  { emoji: '🧇', nombre: 'Waffle', categoria: 'Granos y Cereales' },
  { emoji: '🥞', nombre: 'Pancakes', categoria: 'Granos y Cereales' },
  { emoji: '🌾', nombre: 'Granos/Trigo', categoria: 'Granos y Cereales' },
  
  // Legumbres
  { emoji: '🫘', nombre: 'Legumbres', categoria: 'Legumbres' },
  
  // Conservas
  { emoji: '🥫', nombre: 'Conservas', categoria: 'Conservas' },
  { emoji: '🥫', nombre: 'Latas de Conservación', categoria: 'Conservas' },
  
  // Lácteos
  { emoji: '🥛', nombre: 'Leche', categoria: 'Lácteos' },
  { emoji: '🥛', nombre: 'Yogourt', categoria: 'Lácteos' },
  { emoji: '🥛', nombre: 'Yogur', categoria: 'Lácteos' },
  { emoji: '🧀', nombre: 'Queso', categoria: 'Lácteos' },
  { emoji: '🧈', nombre: 'Mantequilla', categoria: 'Lácteos' },
  { emoji: '🥤', nombre: 'Yogurt/Bebida', categoria: 'Lácteos' },
  { emoji: '🍦', nombre: 'Helado', categoria: 'Lácteos' },
  { emoji: '🧁', nombre: 'Postre', categoria: 'Lácteos' },
  
  // Frutas
  { emoji: '🍎', nombre: 'Manzana', categoria: 'Frutas' },
  { emoji: '🍊', nombre: 'Naranja', categoria: 'Frutas' },
  { emoji: '🍌', nombre: 'Plátano', categoria: 'Frutas' },
  { emoji: '🍇', nombre: 'Uvas', categoria: 'Frutas' },
  { emoji: '🍓', nombre: 'Fresa', categoria: 'Frutas' },
  { emoji: '🍑', nombre: 'Durazno', categoria: 'Frutas' },
  { emoji: '🍒', nombre: 'Cerezas', categoria: 'Frutas' },
  { emoji: '🍉', nombre: 'Sandía', categoria: 'Frutas' },
  { emoji: '🍋', nombre: 'Limón', categoria: 'Frutas' },
  { emoji: '🍍', nombre: 'Piña', categoria: 'Frutas' },
  { emoji: '🥝', nombre: 'Kiwi', categoria: 'Frutas' },
  { emoji: '🥭', nombre: 'Mango', categoria: 'Frutas' },
  { emoji: '🫐', nombre: 'Arándanos', categoria: 'Frutas' },
  { emoji: '🍊', nombre: 'Mandarina', categoria: 'Frutas' },
  { emoji: '🍏', nombre: 'Manzana Verde', categoria: 'Frutas' },
  { emoji: '🍐', nombre: 'Pera', categoria: 'Frutas' },
  { emoji: '🥥', nombre: 'Coco', categoria: 'Frutas' },
  
  // Verduras
  { emoji: '🥬', nombre: 'Verduras de Hoja', categoria: 'Verduras' },
  { emoji: '🥕', nombre: 'Zanahoria', categoria: 'Verduras' },
  { emoji: '🥔', nombre: 'Papa', categoria: 'Verduras' },
  { emoji: '🌽', nombre: 'Maíz', categoria: 'Verduras' },
  { emoji: '🥦', nombre: 'Brócoli', categoria: 'Verduras' },
  { emoji: '🍅', nombre: 'Tomate', categoria: 'Verduras' },
  { emoji: '🫑', nombre: 'Pimiento', categoria: 'Verduras' },
  { emoji: '🥒', nombre: 'Pepino', categoria: 'Verduras' },
  { emoji: '🧅', nombre: 'Cebolla', categoria: 'Verduras' },
  { emoji: '🧄', nombre: 'Ajo', categoria: 'Verduras' },
  { emoji: '🥬', nombre: 'Espinaca', categoria: 'Verduras' },
  { emoji: '🥦', nombre: 'Coliflor', categoria: 'Verduras' },
  { emoji: '🧅', nombre: 'Puerro', categoria: 'Verduras' },
  { emoji: '🍆', nombre: 'Berenjena', categoria: 'Verduras' },
  { emoji: '🥑', nombre: 'Aguacate', categoria: 'Verduras' },
  { emoji: '🌶️', nombre: 'Chile/Pimiento picante', categoria: 'Verduras' },
  { emoji: '🫛', nombre: 'Guisantes', categoria: 'Verduras' },
  { emoji: '🍄', nombre: 'Hongos', categoria: 'Verduras' },
  
  // Proteínas
  { emoji: '🥩', nombre: 'Carne', categoria: 'Proteínas' },
  { emoji: '🍖', nombre: 'Cerdo', categoria: 'Proteínas' },
  { emoji: '🍗', nombre: 'Pollo', categoria: 'Proteínas' },
  { emoji: '🐟', nombre: 'Pescado', categoria: 'Proteínas' },
  { emoji: '🍤', nombre: 'Camarón', categoria: 'Proteínas' },
  { emoji: '🥚', nombre: 'Huevos', categoria: 'Proteínas' },
  { emoji: '🍖', nombre: 'Carne con hueso', categoria: 'Proteínas' },
  { emoji: '🥓', nombre: 'Tocino', categoria: 'Proteínas' },
  { emoji: '🌭', nombre: 'Salchicha', categoria: 'Proteínas' },
  { emoji: '🍔', nombre: 'Hamburguesa', categoria: 'Proteínas' },
  
  // Aceites y Grasas
  { emoji: '🫒', nombre: 'Aceitunas/Aceite', categoria: 'Aceites y Grasas' },
  { emoji: '🌻', nombre: 'Aceite de Girasol', categoria: 'Aceites y Grasas' },
  { emoji: '🧴', nombre: 'Botella de Aceite', categoria: 'Aceites y Grasas' },
  
  // Bebidas
  { emoji: '☕', nombre: 'Café', categoria: 'Bebidas' },
  { emoji: '🧴', nombre: 'Botella de Agua', categoria: 'Bebidas' },
  { emoji: '🧴', nombre: 'Botella de Refresco', categoria: 'Bebidas' },
  { emoji: '☕', nombre: 'Espresso/Latte', categoria: 'Bebidas' },
  { emoji: '🧃', nombre: 'Jugo en Caja', categoria: 'Bebidas' },
  { emoji: '🧃', nombre: 'Jus', categoria: 'Bebidas' },
  { emoji: '🧊', nombre: 'Agua/Bebidas frías', categoria: 'Bebidas' },
  { emoji: '💧', nombre: 'Agua', categoria: 'Bebidas' },
  { emoji: '🥤', nombre: 'Bebida con sorbete', categoria: 'Bebidas' },
  { emoji: '🥤', nombre: 'Boissons gazeuses', categoria: 'Bebidas' },
  { emoji: '🥤', nombre: 'Limonade', categoria: 'Bebidas' },
  { emoji: '☕', nombre: 'Boissons chaudes', categoria: 'Bebidas' },
  { emoji: '🧊', nombre: 'Boissons froides', categoria: 'Bebidas' },
  { emoji: '🫖', nombre: 'Tisane/Infusion', categoria: 'Bebidas' },
  { emoji: '☕', nombre: 'Chocolat chaud', categoria: 'Bebidas' },
  { emoji: '🧃', nombre: 'Smoothie', categoria: 'Bebidas' },
  { emoji: '🥤', nombre: 'Eau pétillante', categoria: 'Bebidas' },
  { emoji: '🧃', nombre: 'Kombucha/Boisson fonctionnelle', categoria: 'Bebidas' },
  { emoji: '🍵', nombre: 'Té', categoria: 'Bebidas' },
  { emoji: '🧋', nombre: 'Té de Burbujas', categoria: 'Bebidas' },
  { emoji: '🧉', nombre: 'Mate/Infusión', categoria: 'Bebidas' },
  { emoji: '🍶', nombre: 'Sake/Botella', categoria: 'Bebidas' },
  { emoji: '🍾', nombre: 'Champagne/Botella', categoria: 'Bebidas' },
  { emoji: '🍷', nombre: 'Copa de Vino', categoria: 'Bebidas' },
  { emoji: '🍺', nombre: 'Cerveza', categoria: 'Bebidas' },
  { emoji: '🍻', nombre: 'Cervezas', categoria: 'Bebidas' },
  { emoji: '🥂', nombre: 'Brindis', categoria: 'Bebidas' },
  { emoji: '🍹', nombre: 'Bebida Tropical', categoria: 'Bebidas' },
  { emoji: '🍸', nombre: 'Cóctel', categoria: 'Bebidas' },
  
  // Condimentos y Salsas
  { emoji: '🍯', nombre: 'Miel', categoria: 'Condimentos y Salsas' },
  { emoji: '🫙', nombre: 'Salsas', categoria: 'Condimentos y Salsas' },
  { emoji: '🫙', nombre: 'Aderezos', categoria: 'Condimentos y Salsas' },
  { emoji: '🍯', nombre: 'Sirop', categoria: 'Condimentos y Salsas' },
  { emoji: '🧂', nombre: 'Sal', categoria: 'Condimentos y Salsas' },
  { emoji: '🫙', nombre: 'Frasco/Condimento', categoria: 'Condimentos y Salsas' },
  { emoji: '🫙', nombre: 'Tartinades', categoria: 'Condimentos y Salsas' },
  { emoji: '🍓', nombre: 'Confiture', categoria: 'Condimentos y Salsas' },
  { emoji: '🍇', nombre: 'Gelée', categoria: 'Condimentos y Salsas' },
  { emoji: '🍫', nombre: 'Tartinade sucrée', categoria: 'Condimentos y Salsas' },
  { emoji: '🍯', nombre: 'Sirop d’érable', categoria: 'Condimentos y Salsas' },
  { emoji: '🧈', nombre: 'Mantequilla/Margarina', categoria: 'Condimentos y Salsas' },
  { emoji: '🧀', nombre: 'Fromage à tartiner', categoria: 'Condimentos y Salsas' },
  { emoji: '🥫', nombre: 'Salsa en Lata', categoria: 'Condimentos y Salsas' },
  { emoji: '🌶️', nombre: 'Salsa Picante', categoria: 'Condimentos y Salsas' },
  { emoji: '🧄', nombre: 'Ajo en Polvo', categoria: 'Condimentos y Salsas' },
  { emoji: '🥜', nombre: 'Beurre d’arachide', categoria: 'Condimentos y Salsas' },
  { emoji: '🥜', nombre: 'Beurre de noix', categoria: 'Condimentos y Salsas' },
  { emoji: '🧆', nombre: 'Houmous/Trempette', categoria: 'Condimentos y Salsas' },
  { emoji: '🫙', nombre: 'Tahini', categoria: 'Condimentos y Salsas' },
  { emoji: '🍫', nombre: 'Pâte à tartiner', categoria: 'Condimentos y Salsas' },
  
  // Dulces y Postres
  { emoji: '🍫', nombre: 'Chocolate', categoria: 'Dulces y Postres' },
  { emoji: '🍬', nombre: 'Sucre', categoria: 'Dulces y Postres' },
  { emoji: '🍬', nombre: 'Cassonade', categoria: 'Dulces y Postres' },
  { emoji: '🍬', nombre: 'Dulces', categoria: 'Dulces y Postres' },
  { emoji: '🍪', nombre: 'Galletas', categoria: 'Dulces y Postres' },
  { emoji: '🍪', nombre: 'Biscuits', categoria: 'Dulces y Postres' },
  { emoji: '🍩', nombre: 'Donas', categoria: 'Dulces y Postres' },
  { emoji: '🍰', nombre: 'Pastel', categoria: 'Dulces y Postres' },
  { emoji: '🎂', nombre: 'Torta', categoria: 'Dulces y Postres' },
  { emoji: '🧁', nombre: 'Cupcake', categoria: 'Dulces y Postres' },
  { emoji: '🧁', nombre: 'Muffin', categoria: 'Dulces y Postres' },
  { emoji: '🥧', nombre: 'Pie', categoria: 'Dulces y Postres' },
  { emoji: '🍮', nombre: 'Flan', categoria: 'Dulces y Postres' },
  { emoji: '🍮', nombre: 'Pouding', categoria: 'Dulces y Postres' },
  { emoji: '🍫', nombre: 'Barres tendres', categoria: 'Dulces y Postres' },
  { emoji: '🍭', nombre: 'Paleta', categoria: 'Dulces y Postres' },
  { emoji: '🍡', nombre: 'Dulces Japoneses', categoria: 'Dulces y Postres' },
  
  // Comidas Preparadas
  { emoji: '🥗', nombre: 'Ensalada', categoria: 'Comidas Preparadas' },
  { emoji: '🍲', nombre: 'Sopa/Guiso', categoria: 'Comidas Preparadas' },
  { emoji: '🌮', nombre: 'Tacos', categoria: 'Comidas Preparadas' },
  { emoji: '🌯', nombre: 'Wrap/Burrito', categoria: 'Comidas Preparadas' },
  { emoji: '🍕', nombre: 'Pizza', categoria: 'Comidas Preparadas' },
  { emoji: '🍱', nombre: 'Comida Preparada', categoria: 'Comidas Preparadas' },
  { emoji: '🍜', nombre: 'Nouilles/Ramen', categoria: 'Comidas Preparadas' },
  { emoji: '🍛', nombre: 'Curry/Plat en sauce', categoria: 'Comidas Preparadas' },
  
  // Snacks
  { emoji: '🥜', nombre: 'Nueces/Maní', categoria: 'Snacks' },
  { emoji: '🍿', nombre: 'Palomitas', categoria: 'Snacks' },
  { emoji: '🍟', nombre: 'Chips/Frites', categoria: 'Snacks' },
  { emoji: '🍘', nombre: 'Craquelins', categoria: 'Snacks' },
  
  // Genéricos Alimentarios
  { emoji: '📦', nombre: 'Paquete Genérico', categoria: 'Genérico Alimentario' },
  { emoji: '🛒', nombre: 'Despensa', categoria: 'Genérico Alimentario' },
  { emoji: '🍽️', nombre: 'Alimentos en General', categoria: 'Genérico Alimentario' },
  { emoji: '🥘', nombre: 'Comida Caliente', categoria: 'Genérico Alimentario' },
  { emoji: '🍴', nombre: 'Cubiertos/Comida', categoria: 'Genérico Alimentario' },
  
  // Higiene Personal
  { emoji: '🧴', nombre: 'Botella/Loción', categoria: 'Higiene Personal' },
  { emoji: '🧼', nombre: 'Jabón', categoria: 'Higiene Personal' },
  { emoji: '🪒', nombre: 'Afeitadora', categoria: 'Higiene Personal' },
  { emoji: '🪥', nombre: 'Cepillo de Dientes', categoria: 'Higiene Personal' },
  { emoji: '🧻', nombre: 'Papel Higiénico', categoria: 'Higiene Personal' },
  { emoji: '🧽', nombre: 'Esponja', categoria: 'Higiene Personal' },
  { emoji: '🪮', nombre: 'Peine', categoria: 'Higiene Personal' },
  { emoji: '💊', nombre: 'Medicamentos', categoria: 'Higiene Personal' },
  { emoji: '🩹', nombre: 'Vendas', categoria: 'Higiene Personal' },
  
  // Limpieza del Hogar
  { emoji: '🧹', nombre: 'Escoba', categoria: 'Limpieza del Hogar' },
  { emoji: '🧺', nombre: 'Canasta/Lavandería', categoria: 'Limpieza del Hogar' },
  { emoji: '🪣', nombre: 'Cubeta', categoria: 'Limpieza del Hogar' },
  { emoji: '🧴', nombre: 'Detergente', categoria: 'Limpieza del Hogar' },
  { emoji: '🧽', nombre: 'Limpieza General', categoria: 'Limpieza del Hogar' },
  
  // Bebé y Cuidado Infantil
  { emoji: '🍼', nombre: 'Biberón', categoria: 'Bebé y Cuidado Infantil' },
  { emoji: '👶', nombre: 'Bebé', categoria: 'Bebé y Cuidado Infantil' },
  { emoji: '🧸', nombre: 'Juguete', categoria: 'Bebé y Cuidado Infantil' },
  
  // Ropa y Textiles
  { emoji: '👕', nombre: 'Camiseta', categoria: 'Ropa y Textiles' },
  { emoji: '👖', nombre: 'Pantalones', categoria: 'Ropa y Textiles' },
  { emoji: '🧥', nombre: 'Abrigo', categoria: 'Ropa y Textiles' },
  { emoji: '👗', nombre: 'Vestido', categoria: 'Ropa y Textiles' },
  { emoji: '🧦', nombre: 'Calcetines', categoria: 'Ropa y Textiles' },
  { emoji: '👟', nombre: 'Zapatos', categoria: 'Ropa y Textiles' },
  { emoji: '🧤', nombre: 'Guantes', categoria: 'Ropa y Textiles' },
  { emoji: '🧣', nombre: 'Bufanda', categoria: 'Ropa y Textiles' },
  { emoji: '🎒', nombre: 'Mochila', categoria: 'Ropa y Textiles' },
  
  // Escolares y Educación
  { emoji: '📚', nombre: 'Libros', categoria: 'Escolares y Educación' },
  { emoji: '📓', nombre: 'Cuaderno', categoria: 'Escolares y Educación' },
  { emoji: '✏️', nombre: 'Lápiz', categoria: 'Escolares y Educación' },
  { emoji: '🖊️', nombre: 'Bolígrafo', categoria: 'Escolares y Educación' },
  { emoji: '📏', nombre: 'Regla', categoria: 'Escolares y Educación' },
  { emoji: '✂️', nombre: 'Tijeras', categoria: 'Escolares y Educación' },
  { emoji: '🖍️', nombre: 'Crayones', categoria: 'Escolares y Educación' },
  
  // Hogar y Cocina
  { emoji: '🍳', nombre: 'Sartén/Cocinar', categoria: 'Hogar y Cocina' },
  { emoji: '🔪', nombre: 'Cuchillo/Utensilios', categoria: 'Hogar y Cocina' },
  { emoji: '🥄', nombre: 'Cuchara', categoria: 'Hogar y Cocina' },
  { emoji: '🍴', nombre: 'Cubiertos', categoria: 'Hogar y Cocina' },
  { emoji: '🥢', nombre: 'Palillos', categoria: 'Hogar y Cocina' },
  { emoji: '🫙', nombre: 'Frasco/Contenedor', categoria: 'Hogar y Cocina' },
  
  // Mascotas
  { emoji: '🐕', nombre: 'Perro/Mascotas', categoria: 'Mascotas' },
  { emoji: '🐈', nombre: 'Gato', categoria: 'Mascotas' },
  { emoji: '🦴', nombre: 'Hueso/Comida Mascota', categoria: 'Mascotas' },
  
  // Varios/Otros
  { emoji: '🎁', nombre: 'Regalo/Donación', categoria: 'Varios' },
  { emoji: '💝', nombre: 'Donativo Especial', categoria: 'Varios' },
  { emoji: '🔋', nombre: 'Baterías', categoria: 'Varios' },
  { emoji: '💡', nombre: 'Bombillas', categoria: 'Varios' },
  { emoji: '🕯️', nombre: 'Velas', categoria: 'Varios' },
  { emoji: '🧰', nombre: 'Herramientas', categoria: 'Varios' },
  { emoji: '🏥', nombre: 'Salud/Primeros Auxilios', categoria: 'Varios' },
  { emoji: '🌡️', nombre: 'Termómetro', categoria: 'Varios' },
];

function uniqueIcons(iconos: string[]): string[] {
  return Array.from(new Set(iconos));
}

export const FAMILIAS_OPERATIVAS_ICONOS_ALIMENTARIOS: FamiliaOperativaIconos[] = [
  {
    id: 'op-frais',
    label: 'Frais',
    iconos: ['🥬', '🥕', '🥦', '🍅', '🥒', '🧅', '🧄', '🍆', '🥑', '🫑', '🍎', '🍊', '🍌', '🍇', '🍓', '🍉', '🍍'],
  },
  {
    id: 'op-sec',
    label: 'Sec',
    iconos: ['🍚', '🍝', '🌾', '🫘', '🥫', '🫙', '🥜', '🍯', '🧂', '🍪', '🍘', '🧃'],
  },
  {
    id: 'op-refrigere',
    label: 'Réfrigéré',
    iconos: ['🥛', '🧀', '🧈', '🥚', '🥩', '🍗', '🐟', '🍤', '🥓', '🧆'],
  },
  {
    id: 'op-congele',
    label: 'Congelé',
    iconos: ['🧊', '🍦', '🍕', '🍟', '🍤', '🐟', '🥦', '🍓'],
  },
  {
    id: 'op-pret-a-manger',
    label: 'Prêt à consommer',
    iconos: ['🥗', '🍲', '🌮', '🌯', '🍕', '🍱', '🥪', '🍜', '🍛', '🍔', '🍣', '🥙'],
  },
  {
    id: 'op-boissons',
    label: 'Boissons',
    iconos: ['💧', '🧊', '🧃', '🥤', '🧋', '☕', '🫖', '🍵', '🧉'],
  },
  {
    id: 'op-boulangerie',
    label: 'Boulangerie',
    iconos: ['🍞', '🥖', '🥐', '🥯', '🥨', '🫓', '🧇', '🥞', '🥣'],
  },
  {
    id: 'op-proteines',
    label: 'Protéines',
    iconos: ['🥩', '🍗', '🐟', '🍤', '🥚', '🍖', '🥓', '🌭', '🍔', '🍣', '🍢', '🧆'],
  },
].map((famille) => ({
  ...famille,
  iconos: uniqueIcons(famille.iconos),
}));

export const ICONOS_SECCIONES_ALIMENTARIAS: SeccionIconos[] = [
  {
    id: 'boissons-froides',
    labelKey: 'configuration.coldDrinksIcons',
    commonLabelKey: 'common.iconCategories.coldDrinks',
    iconos: ['🧃', '🥤', '🧋', '🧊', '💧', '🧴', '🍹', '🍸', '🍶', '🍾', '🍷', '🍺', '🍻', '🥂'],
  },
  {
    id: 'boissons-chaudes',
    labelKey: 'configuration.hotDrinksIcons',
    commonLabelKey: 'common.iconCategories.hotDrinks',
    iconos: ['☕', '🫖', '🍵', '🧉', '🍶'],
  },
  {
    id: 'boissons-fonctionnelles',
    labelKey: 'configuration.functionalDrinksIcons',
    commonLabelKey: 'common.iconCategories.functionalDrinks',
    iconos: ['🧉', '🫖', '🧃', '☕', '🧊', '💧'],
  },
  {
    id: 'tartinables-sucres',
    labelKey: 'configuration.sweetSpreadsIcons',
    commonLabelKey: 'common.iconCategories.sweetSpreads',
    iconos: ['🍯', '🍓', '🍇', '🍫', '🧀', '🥜', '🫙', '🧈'],
  },
  {
    id: 'condiments-trempettes',
    labelKey: 'configuration.condimentsDipsIcons',
    commonLabelKey: 'common.iconCategories.condimentsDips',
    iconos: ['🧂', '🫒', '🌻', '🧴', '🥜', '🍅', '🌶️', '🧄', '🫙', '🧆', '🧅', '🍋', '🥫'],
  },
  {
    id: 'sucre-desserts',
    labelKey: 'configuration.sweetsDessertsIcons',
    commonLabelKey: 'common.iconCategories.sweetsDesserts',
    iconos: ['🍫', '🍬', '🍪', '🍩', '🍰', '🎂', '🥧', '🍮', '🍭', '🍡', '🍦', '🧁', '🍯'],
  },
  {
    id: 'petit-dejeuner-boulangerie',
    labelKey: 'configuration.breakfastBakeryIcons',
    commonLabelKey: 'common.iconCategories.breakfastBakery',
    iconos: ['🍞', '🥖', '🥣', '🥐', '🥯', '🥨', '🫓', '🧇', '🥞', '🍪'],
  },
  {
    id: 'epicerie-seche',
    labelKey: 'configuration.dryGroceryIcons',
    commonLabelKey: 'common.iconCategories.dryGrocery',
    iconos: ['🍚', '🍝', '🍜', '🌾', '🫘', '🥫', '🫙', '🥜', '🫛'],
  },
  {
    id: 'fruits',
    labelKey: 'configuration.fruitsIcons',
    commonLabelKey: 'common.iconCategories.fruits',
    iconos: ['🍎', '🍊', '🍌', '🍇', '🍓', '🫐', '🍋', '🍉', '🍍', '🥝', '🥭', '🍏', '🍐', '🥥', '🍈', '🍒', '🍑'],
  },
  {
    id: 'legumes',
    labelKey: 'configuration.vegetablesIcons',
    commonLabelKey: 'common.iconCategories.vegetables',
    iconos: ['🥬', '🥕', '🥔', '🌽', '🥦', '🍅', '🫑', '🥒', '🧅', '🧄', '🍆', '🥑', '🌶️', '🫛', '🍄', '🫒'],
  },
  {
    id: 'proteines',
    labelKey: 'configuration.proteinsIcons',
    commonLabelKey: 'common.iconCategories.proteins',
    iconos: ['🥩', '🍖', '🍗', '🐟', '🍤', '🥚', '🥓', '🌭', '🍔', '🍣', '🍢', '🧆'],
  },
  {
    id: 'produits-laitiers',
    labelKey: 'configuration.dairyIcons',
    commonLabelKey: 'common.iconCategories.dairy',
    iconos: ['🥛', '🧀', '🧈', '🍦', '🧁', '🍮'],
  },
  {
    id: 'plats-prepares-collations',
    labelKey: 'configuration.preparedMealsSnacksIcons',
    commonLabelKey: 'common.iconCategories.preparedSnacks',
    iconos: ['🥗', '🍲', '🌮', '🌯', '🍕', '🍱', '🥪', '🍜', '🍛', '🍿', '🍟', '🍘', '🍝', '🍔', '🍣', '🥙'],
  },
  {
    id: 'generiques-alimentaires',
    labelKey: 'configuration.foodGenericIcons',
    commonLabelKey: 'common.iconCategories.foodGeneric',
    iconos: ['📦', '🛒', '🍽️', '🥘', '🍴', '🫙', '🥫', '🍱'],
  },
];

export const ICONOS_NO_ALIMENTARIOS = uniqueIcons([
  '🧴', '🧼', '🪥', '🧻', '🪒', '💊', '🩹', '🧹', '🧺', '🪣', '🧽', '🍼', '👶', '🧸',
  '👕', '👖', '🧥', '👟', '🧦', '🎒', '📚', '📓', '✏️', '🖊️', '📏', '✂️', '🖍️',
  '🐕', '🐈', '🦴', '🎁', '💝', '🔋', '💡', '🏥', '🕯️', '🧰', '🌡️',
]);

type ReglaIconosRecomendados = {
  keywords: string[];
  iconos: string[];
};

const REGLAS_ICONOS_RECOMENDADOS: ReglaIconosRecomendados[] = [
  {
    keywords: ['boisson', 'bebida', 'agua', 'jus', 'jugo', 'cafe', 'caf', 'te', 'té', 'soda', 'refresco'],
    iconos: ['🧴', '💧', '🥤', '🧃', '☕', '🍵', '🧋', '🫖'],
  },
  {
    keywords: ['fruit', 'fruta', 'frutas'],
    iconos: ['🍎', '🍊', '🍌', '🍓', '🫐', '🍇', '🍍', '🥝'],
  },
  {
    keywords: ['legume', 'légume', 'verdura', 'vegetal', 'vegetal'],
    iconos: ['🥬', '🥕', '🥦', '🍅', '🥒', '🧅', '🧄', '🍆'],
  },
  {
    keywords: ['protein', 'protéine', 'proteina', 'carne', 'pollo', 'poisson', 'pescado', 'porc', 'cerdo'],
    iconos: ['🥩', '🍗', '🐟', '🍤', '🍖', '🥚', '🥓', '🍔'],
  },
  {
    keywords: ['lait', 'laitier', 'lácteo', 'lacteo', 'yogourt', 'yaourt', 'queso', 'fromage'],
    iconos: ['🥛', '🧀', '🧈', '🍦', '🧁', '🍮'],
  },
  {
    keywords: ['pain', 'boulangerie', 'panaderia', 'panadería', 'bakery', 'pasta', 'cereal', 'grano', 'grain'],
    iconos: ['🍞', '🥖', '🥐', '🥯', '🍝', '🍚', '🥣', '🌾'],
  },
  {
    keywords: ['sauce', 'condiment', 'aderezo', 'conserva', 'enlatado', 'epicerie', 'épicerie', 'sec', 'dry'],
    iconos: ['🫙', '🥫', '🧂', '🍯', '🥜', '🫘', '🍘', '🫒'],
  },
  {
    keywords: ['higiene', 'hygiène', 'limpieza', 'nettoyage', 'ropa', 'textil', 'bebe', 'bébé', 'scolaire', 'mascota'],
    iconos: ['🧴', '🧼', '🧻', '🧹', '👕', '🍼', '📚', '🐕'],
  },
];

const ICONOS_RECOMENDADOS_POR_DEFECTO = ['📦', '🛒', '🍽️', '🫙', '🥫', '🥬', '🥛', '🧃'];

function normalizarTexto(valor: string): string {
  return valor
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function obtenerIconosRecomendadosPorFamilia(contexto: string): string[] {
  const texto = normalizarTexto(contexto || '');

  if (!texto.trim()) {
    return ICONOS_RECOMENDADOS_POR_DEFECTO;
  }

  const recomendados = REGLAS_ICONOS_RECOMENDADOS
    .filter((regla) => regla.keywords.some((keyword) => texto.includes(normalizarTexto(keyword))))
    .flatMap((regla) => regla.iconos);

  const resultado = uniqueIcons([
    ...recomendados,
    ...ICONOS_RECOMENDADOS_POR_DEFECTO,
  ]);

  return resultado.slice(0, 16);
}

export const ICONOS_ALIMENTARIOS = uniqueIcons(
  ICONOS_SECCIONES_ALIMENTARIAS.flatMap((seccion) => seccion.iconos)
);

// Exportar solo los emojis para uso rápido
export const TODOS_LOS_ICONOS = ICONOS_CATEGORIAS.map(icono => icono.emoji);

// Iconos organizados por categoría para selectores
export const ICONOS_POR_CATEGORIA = ICONOS_CATEGORIAS.reduce((acc, icono) => {
  if (!acc[icono.categoria]) {
    acc[icono.categoria] = [];
  }
  acc[icono.categoria].push(icono);
  return acc;
}, {} as Record<string, IconoAlimento[]>);

// Función helper para buscar un icono por nombre
export function buscarIconoPorNombre(nombre: string): string | undefined {
  const icono = ICONOS_CATEGORIAS.find(
    i => i.nombre.toLowerCase().includes(nombre.toLowerCase())
  );
  return icono?.emoji;
}

// Iconos más comunes para categorías principales
export const ICONOS_PRINCIPALES = [
  // Alimentarios
  '🍚', '🍝', '🥫', '🥛', '🥬', '🫒', '🍞', '🥩', '🐟', '🧀', 
  '🥚', '🍎', '🥕', '🥔', '🌽', '🥤', '☕', '🍯', '🧈', '🥗', 
  '🌮', '📦', '🛒', '🍽️', '🍲', '🥘',
  // No Alimentarios - Higiene
  '🧴', '🧼', '🪥', '🧻', '🪒', '💊', '🩹',
  // No Alimentarios - Limpieza
  '🧹', '🧺', '🪣', '🧽',
  // No Alimentarios - Bebé
  '🍼', '👶', '🧸',
  // No Alimentarios - Ropa
  '👕', '👖', '🧥', '👟', '🧦', '🎒',
  // No Alimentarios - Escolares
  '📚', '📓', '✏️', '🖊️',
  // No Alimentarios - Mascotas
  '🐕', '🐈', '🦴',
  // No Alimentarios - Varios
  '🎁', '💝', '🔋', '💡', '🏥'
];

// Iconos para subcategorías (más específicos)
export const ICONOS_SUBCATEGORIAS = TODOS_LOS_ICONOS;