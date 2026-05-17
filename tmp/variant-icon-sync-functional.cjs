const { chromium } = require('playwright');

const baseUrl = process.env.VARIANT_ICON_SYNC_BASE_URL || 'http://127.0.0.1:5173/';

function createCategorias() {
  return [
    {
      id: 'cat-1',
      nombre: 'Légumes',
      descripcion: '',
      valorMonetario: 2,
      color: '#1E73BE',
      icono: '🥬',
      activa: true,
      subcategorias: [
        {
          id: 'sub-1',
          nombre: 'Légumes verts',
          descripcion: '',
          icono: '🥦',
          pesoUnitario: 1,
          unidad: 'CJA',
          activa: true,
          stockMinimo: 0,
          variantes: [
            {
              id: 'var-legumes-1',
              nombre: 'Legumes',
              codigo: 'LEG-VAR-1',
              icono: '🥦',
              activa: true,
            },
          ],
        },
      ],
    },
  ];
}

function createProduct() {
  return {
    id: 'prod-var-icon-1',
    codigo: 'LEG-001',
    nombre: 'Legumes Produit',
    categoria: 'Légumes',
    subcategoria: 'Légumes verts',
    varianteId: 'var-legumes-1',
    varianteNombre: 'Legumes',
    unidad: 'CJA',
    icono: '🥦',
    peso: 15,
    pesoUnitario: 15,
    pesoRegistrado: 15,
    stockActual: 12,
    stockMinimo: 1,
    ubicacion: 'A1',
    lote: 'LOT-LEG-1',
    fechaVencimiento: '2026-12-31',
    esPRS: true,
    activo: true,
    fechaCreacion: '2026-05-17T10:00:00.000Z',
    temperatura: 'refrigerado',
    temperaturaAlmacenamiento: 'Refrigerado',
    temperaturaOriginalEntrada: 'refrigerado',
    valorUnitario: 2,
    valorTotal: 24,
  };
}

function createLegacyProduct() {
  return {
    id: 'prod-var-icon-legacy',
    codigo: 'AUTO-1778989921216',
    nombre: 'Légumes',
    categoria: 'Légumes',
    subcategoria: 'Légumes verts',
    unidad: 'CJA',
    icono: '🐓',
    peso: 15,
    pesoUnitario: 15,
    pesoRegistrado: 15,
    stockActual: 12,
    stockMinimo: 1,
    ubicacion: 'A2',
    lote: 'LOT-8867',
    fechaVencimiento: '2026-12-31',
    esPRS: true,
    activo: true,
    fechaCreacion: '2026-05-17T10:10:00.000Z',
    temperatura: 'refrigerado',
    temperaturaAlmacenamiento: 'Refrigerado',
    temperaturaOriginalEntrada: 'refrigerado',
    valorUnitario: 2,
    valorTotal: 24,
  };
}

function createComanda() {
  return {
    id: 'cmd-var-icon-1',
    numero: 'CMD-VAR-001',
    numeroComanda: 'CMD-VAR-001',
    organismoId: 'org-var-icon-1',
    organismoNombre: 'Organisme Variante',
    nombreOrganismo: 'Organisme Variante',
    fecha: '2026-05-17T10:30:00.000Z',
    items: [
      {
        productoId: 'prod-var-icon-1',
        nombreProducto: 'Legumes Produit',
        productoNombre: 'Legumes Produit',
        cantidad: 12,
        unidad: 'CJA',
        icono: '🥦',
        peso: 15,
        valorUnitario: 2,
        temperatura: 'refrigerado',
        temperaturaOriginalEntrada: 'refrigerado',
      },
      {
        productoId: 'prod-var-icon-legacy',
        nombreProducto: 'Légumes',
        productoNombre: 'Légumes',
        cantidad: 12,
        unidad: 'CJA',
        icono: '🐓',
        peso: 15,
        valorUnitario: 2,
        temperatura: 'refrigerado',
        temperaturaOriginalEntrada: 'refrigerado',
      },
    ],
    pesoTotal: 180,
    valorTotal: 24,
    estado: 'pendiente',
    creadoPor: 'Smoke Runner',
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true, timeout: 30000 });
  const page = await browser.newPage();

  try {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.evaluate(({ categorias, productos, comanda }) => {
      localStorage.setItem('banco_alimentos_categorias', JSON.stringify(categorias));
      localStorage.setItem('banco_alimentos_productos', JSON.stringify(productos));
      localStorage.setItem('banco_alimentos_comandas', JSON.stringify([comanda]));
    }, {
      categorias: createCategorias(),
      productos: [createProduct(), createLegacyProduct()],
      comanda: createComanda(),
    });

    const resultado = await page.evaluate(async () => {
      const { sincronizarProductosPorVariante } = await import('/src/app/utils/productStorage.ts');
      const { obtenerComandas } = await import('/src/app/utils/comandaStorage.ts');

      const actualizados = sincronizarProductosPorVariante({
        varianteId: 'var-legumes-1',
        varianteNombreAnterior: 'Legumes',
        varianteNombreNuevo: 'Legumes',
        categoria: 'Légumes',
        subcategoria: 'Légumes verts',
        icono: '🥬',
      });

      return {
        actualizados,
        productos: JSON.parse(localStorage.getItem('banco_alimentos_productos') || '[]'),
        comandaPersistida: JSON.parse(localStorage.getItem('banco_alimentos_comandas') || '[]')[0],
        comandaNormalizada: obtenerComandas()[0],
      };
    });

    if (resultado.actualizados !== 2) {
      throw new Error(`Se esperaban 2 productos actualizados, recibido: ${resultado.actualizados}`);
    }

    const iconosProductos = (resultado.productos || []).map((producto) => ({
      id: producto.id,
      icono: producto.icono,
      varianteNombre: producto.varianteNombre,
    }));

    if (!iconosProductos.every((producto) => producto.icono === '🥬')) {
      throw new Error(`El icono de los productos no se actualizó: ${JSON.stringify(iconosProductos)}`);
    }

    if (!(resultado.comandaPersistida?.items || []).every((item) => item.icono === '🥬')) {
      throw new Error(`El icono no se propagó a la comanda persistida: ${JSON.stringify(resultado.comandaPersistida)}`);
    }

    if (!(resultado.comandaNormalizada?.items || []).every((item) => item.icono === '🥬')) {
      throw new Error(`El icono no se reflejó en la comanda normalizada: ${JSON.stringify(resultado.comandaNormalizada)}`);
    }

    console.log('VARIANT_ICON_SYNC_FUNCTIONAL_OK');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('VARIANT_ICON_SYNC_FUNCTIONAL_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});