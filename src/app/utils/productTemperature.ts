export type TemperaturaProductoCanonica = 'ambiente' | 'refrigerado' | 'congelado';
export type TemperaturaAlmacenamiento = 'Temperatura Ambiente' | 'Refrigerado' | 'Congelado';

type ProductoConTemperatura = {
  nombre?: string;
  nombreProducto?: string;
  productoNombre?: string;
  categoria?: string;
  subcategoria?: string;
  temperatura?: string;
  temperaturaAlmacenamiento?: string;
  temperaturaOriginalEntrada?: string;
};

const PALABRAS_CONGELADO = [
  'congel',
  'surgel',
  'viande',
  'viandes',
  'boeuf',
  'porc',
  'poulet',
  'dinde',
  'volaille',
  'poisson',
  'saumon',
  'fruits de mer',
  'proteines animales'
];

const PALABRAS_SECAS = [
  'poudre',
  'sec',
  'seche',
  'epicerie',
  'aliments secs',
  'conserve',
  'conserves',
  'riz',
  'grain',
  'grains',
  'pates',
  'farine',
  'cereale',
  'cereales',
  'legumineuse',
  'legumineuses'
];

const PALABRAS_REFRIGERADO = [
  'refrig',
  'frigo',
  'frais',
  'frais ',
  'fraiche',
  'fraiches',
  'fruit',
  'fruits',
  'legume',
  'legumes',
  'laitier',
  'laitiers',
  'produits laitiers',
  'lait',
  'fromage',
  'yaourt',
  'yogourt',
  'beurre',
  'oeuf',
  'oeufs'
];

function normalizarTexto(valor?: string): string {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function contieneAlgunaPalabra(texto: string, palabras: string[]): boolean {
  return palabras.some(palabra => texto.includes(palabra));
}

function normalizarTemperaturaExplicita(temperatura?: string): TemperaturaProductoCanonica | null {
  const valor = normalizarTexto(temperatura);
  if (!valor) {
    return null;
  }

  if (valor.includes('congel') || valor.includes('surgel')) {
    return 'congelado';
  }

  if (valor.includes('refrig') || valor.includes('frigo')) {
    return 'refrigerado';
  }

  if (valor.includes('ambien') || valor.includes('sec') || valor.includes('dry')) {
    return 'ambiente';
  }

  return null;
}

function inferirTemperaturaPorDescripcion(producto: ProductoConTemperatura): TemperaturaProductoCanonica {
  const texto = [
    producto.nombre,
    producto.nombreProducto,
    producto.productoNombre,
    producto.categoria,
    producto.subcategoria,
  ]
    .map(normalizarTexto)
    .filter(Boolean)
    .join(' ');

  if (!texto) {
    return 'ambiente';
  }

  if (contieneAlgunaPalabra(texto, PALABRAS_CONGELADO)) {
    return 'congelado';
  }

  if (contieneAlgunaPalabra(texto, PALABRAS_SECAS)) {
    return 'ambiente';
  }

  if (contieneAlgunaPalabra(texto, PALABRAS_REFRIGERADO)) {
    return 'refrigerado';
  }

  return 'ambiente';
}

export function resolverTemperaturaProductoCanonica(
  producto: ProductoConTemperatura | null | undefined,
): TemperaturaProductoCanonica {
  if (!producto) {
    return 'ambiente';
  }

  return (
    normalizarTemperaturaExplicita(producto.temperaturaAlmacenamiento) ||
    normalizarTemperaturaExplicita(producto.temperatura) ||
    inferirTemperaturaPorDescripcion(producto)
  );
}

export function convertirTemperaturaOriginalEntrada(
  temperatura: TemperaturaProductoCanonica,
): TemperaturaProductoCanonica {
  switch (temperatura) {
    case 'refrigerado':
      return 'refrigerado';
    case 'congelado':
      return 'congelado';
    default:
      return 'ambiente';
  }
}

export function resolverTemperaturaOriginalEntradaProducto(
  producto: ProductoConTemperatura | null | undefined,
): TemperaturaProductoCanonica {
  if (!producto) {
    return 'ambiente';
  }

  return (
    normalizarTemperaturaExplicita(producto.temperaturaOriginalEntrada) ||
    normalizarTemperaturaExplicita(producto.temperatura) ||
    normalizarTemperaturaExplicita(producto.temperaturaAlmacenamiento) ||
    inferirTemperaturaPorDescripcion(producto)
  );
}

export function convertirTemperaturaAlmacenamiento(
  temperatura: TemperaturaProductoCanonica,
): TemperaturaAlmacenamiento {
  switch (temperatura) {
    case 'refrigerado':
      return 'Refrigerado';
    case 'congelado':
      return 'Congelado';
    default:
      return 'Temperatura Ambiente';
  }
}

export function resolverTemperaturaAlmacenamientoProducto(
  producto: ProductoConTemperatura | null | undefined,
): TemperaturaAlmacenamiento {
  return convertirTemperaturaAlmacenamiento(resolverTemperaturaProductoCanonica(producto));
}

export function aplicarTemperaturaProducto<T extends ProductoConTemperatura>(
  producto: T,
): T & {
  temperatura: TemperaturaProductoCanonica;
  temperaturaAlmacenamiento: TemperaturaAlmacenamiento;
  temperaturaOriginalEntrada: TemperaturaProductoCanonica;
} {
  const temperatura = resolverTemperaturaProductoCanonica(producto);
  const temperaturaOriginalEntrada = resolverTemperaturaOriginalEntradaProducto(producto);

  return {
    ...producto,
    temperatura,
    temperaturaAlmacenamiento: convertirTemperaturaAlmacenamiento(temperatura),
    temperaturaOriginalEntrada: convertirTemperaturaOriginalEntrada(temperaturaOriginalEntrada),
  };
}