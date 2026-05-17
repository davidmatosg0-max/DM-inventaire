const { chromium } = require('playwright');

const baseUrl = process.env.ENTRADA_PRODUCTO_SYNC_BASE_URL || 'http://127.0.0.1:5173/';

function createCategoria() {
  return [
    {
      nombre: 'Fruits',
      icono: '🍎',
      valorMonetario: 2.5,
      valorPorKg: 2.5,
      subcategorias: [
        {
          nombre: 'Pommes',
          icono: '🍎',
          valorPorKg: 3.2,
          variantes: [],
        },
      ],
    },
  ];
}

function createProduct() {
  return {
    id: 'prod-sync-001',
    codigo: 'SYNC-001',
    nombre: 'Produit Initial',
    categoria: 'Légumes',
    subcategoria: 'Carottes',
    unidad: 'kg',
    icono: '🥕',
    peso: 1,
    pesoUnitario: 1,
    pesoRegistrado: 2,
    stockActual: 2,
    stockMinimo: 1,
    ubicacion: 'A1',
    lote: 'LOT-INIT',
    fechaVencimiento: '2026-12-31',
    esPRS: false,
    activo: true,
    fechaCreacion: '2026-05-17T10:00:00.000Z',
    temperatura: 'refrigerado',
    temperaturaAlmacenamiento: 'Refrigerado',
    temperaturaOriginalEntrada: 'refrigerado',
    valorUnitario: 2,
    valorTotal: 4,
  };
}

function createEntrada() {
  return {
    id: 'ent-sync-001',
    fecha: '2026-05-17T10:00:00.000Z',
    tipoEntrada: 'don',
    programaNombre: 'Programme Smoke',
    programaCodigo: 'PRG-SYNC',
    programaColor: '#1E73BE',
    programaIcono: '📥',
    donadorId: 'don-sync-001',
    donadorNombre: 'Donateur Smoke',
    donadorEsCustom: true,
    productoId: 'prod-sync-001',
    nombreProducto: 'Produit Initial',
    productoCategoria: 'Légumes',
    productoSubcategoria: 'Carottes',
    productoIcono: '🥕',
    productoCodigo: 'SYNC-001',
    cantidad: 2,
    unidad: 'kg',
    pesoUnidad: 1,
    pesoTotal: 2,
    valorUnitario: 2,
    valorTotal: 4,
    temperatura: 'refrigerado',
    lote: 'LOT-INIT',
    fechaCaducidad: '2026-12-31',
    fechaCreacion: '2026-05-17T10:00:00.000Z',
    activo: true,
  };
}

function createComanda() {
  return {
    id: 'cmd-sync-001',
    numero: 'CMD-SYNC-001',
    numeroComanda: 'CMD-SYNC-001',
    organismoId: 'org-sync-001',
    organismoNombre: 'Organisme Sync',
    nombreOrganismo: 'Organisme Sync',
    fecha: '2026-05-17T10:30:00.000Z',
    items: [
      {
        productoId: 'prod-sync-001',
        nombreProducto: 'Produit Initial',
        productoNombre: 'Produit Initial',
        cantidad: 2,
        unidad: 'kg',
        icono: '🥕',
        peso: 1,
        valorUnitario: 2,
        temperatura: 'refrigerado',
        temperaturaOriginalEntrada: 'refrigerado',
      },
    ],
    pesoTotal: 2,
    valorTotal: 4,
    estado: 'pendiente',
    creadoPor: 'Smoke Runner',
  };
}

function createOferta() {
  return {
    id: 'of-sync-001',
    numeroOferta: 'OFE-SYNC-001',
    titulo: 'Offre Sync',
    descripcion: 'Offre de validation sync',
    fechaCreacion: '2026-05-17T11:00:00.000Z',
    fechaExpiracion: '2026-05-25T11:00:00.000Z',
    estado: 'pendiente',
    creadoPor: 'Smoke Runner',
    productos: [
      {
        productoId: 'prod-sync-001',
        productoNombre: 'Produit Initial',
        productoCodigo: 'SYNC-001',
        categoria: 'Légumes',
        subcategoria: 'Carottes',
        cantidadOfrecida: 2,
        cantidadDisponible: 2,
        unidad: 'kg',
        peso: 1,
        valorUnitario: 1.5,
        icono: '🥕',
      },
    ],
    organismosDestino: 'todos',
    aceptaciones: [],
    solicitudes: [],
    totalProductos: 1,
    totalKilos: 2,
    valorMonetarioTotal: 3,
    visible: true,
    activa: true,
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true, timeout: 30000 });
  const page = await browser.newPage();

  try {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.evaluate(({ categorias, producto, entrada, comanda, oferta }) => {
      localStorage.setItem('banco_alimentos_categorias', JSON.stringify(categorias));
      localStorage.setItem('banco_alimentos_productos', JSON.stringify([producto]));
      localStorage.setItem('banco_alimentos_entradas_inventario', JSON.stringify([entrada]));
      localStorage.setItem('banco_alimentos_comandas', JSON.stringify([comanda]));
      localStorage.setItem('ofertas_sistema', JSON.stringify([oferta]));
    }, {
      categorias: createCategoria(),
      producto: createProduct(),
      entrada: createEntrada(),
      comanda: createComanda(),
      oferta: createOferta(),
    });

    const actualizado = await page.evaluate(async () => {
      const { actualizarEntrada } = await import('/src/app/utils/entradaInventarioStorage.ts');

      return actualizarEntrada('ent-sync-001', {
        nombreProducto: 'Produit Modifie',
        productoCodigo: 'SYNC-999',
        productoCategoria: 'Fruits',
        productoSubcategoria: 'Pommes',
        productoIcono: '🍎',
        cantidad: 3,
        unidad: 'caisse',
        pesoUnidad: 2,
        pesoTotal: 6,
        valorUnitario: 4.5,
        valorTotal: 13.5,
        temperatura: 'congelado',
      });
    });

    if (!actualizado) {
      throw new Error('actualizarEntrada devolvió false');
    }

    const resultado = await page.evaluate(() => {
      const productos = JSON.parse(localStorage.getItem('banco_alimentos_productos') || '[]');
      const comandas = JSON.parse(localStorage.getItem('banco_alimentos_comandas') || '[]');
      const ofertas = JSON.parse(localStorage.getItem('ofertas_sistema') || '[]');

      return {
        producto: productos[0],
        comanda: comandas[0],
        oferta: ofertas[0],
      };
    });

    if (resultado.producto?.nombre !== 'Produit Modifie') {
      throw new Error(`Producto no actualizado: ${resultado.producto?.nombre}`);
    }

    if (resultado.producto?.codigo !== 'SYNC-999' || resultado.producto?.categoria !== 'Fruits' || resultado.producto?.subcategoria !== 'Pommes') {
      throw new Error('Metadatos del producto no actualizados desde la entrada');
    }

    if (resultado.producto?.unidad !== 'caisse' || resultado.producto?.pesoUnitario !== 2 || resultado.producto?.temperaturaOriginalEntrada !== 'congelado') {
      throw new Error('Campos físicos del producto no recalculados correctamente');
    }

    if (resultado.comanda?.items?.[0]?.nombreProducto !== 'Produit Modifie' || resultado.comanda?.items?.[0]?.unidad !== 'caisse') {
      throw new Error('La comanda no recibió la actualización del producto');
    }

    if (resultado.comanda?.items?.[0]?.temperaturaOriginalEntrada !== 'congelado') {
      throw new Error('La comanda no recibió la temperatura actualizada');
    }

    if (resultado.oferta?.productos?.[0]?.productoNombre !== 'Produit Modifie' || resultado.oferta?.productos?.[0]?.productoCodigo !== 'SYNC-999') {
      throw new Error('La oferta no recibió el nombre o código actualizados');
    }

    if (resultado.oferta?.productos?.[0]?.categoria !== 'Fruits' || resultado.oferta?.productos?.[0]?.subcategoria !== 'Pommes' || resultado.oferta?.productos?.[0]?.unidad !== 'caisse') {
      throw new Error('La oferta no recibió categoría, subcategoría o unidad actualizadas');
    }

    if (resultado.oferta?.productos?.[0]?.peso !== 2 || resultado.oferta?.totalKilos !== 4 || resultado.oferta?.valorMonetarioTotal !== 12.8) {
      throw new Error(`Totales de oferta incorrectos: ${JSON.stringify(resultado.oferta)}`);
    }

    const temperaturaActualizada = await page.evaluate(async () => {
      const { actualizarProducto } = await import('/src/app/utils/productStorage.ts');

      actualizarProducto('prod-sync-001', {
        temperatura: 'ambiente',
      });

      const productos = JSON.parse(localStorage.getItem('banco_alimentos_productos') || '[]');
      const comandas = JSON.parse(localStorage.getItem('banco_alimentos_comandas') || '[]');

      return {
        producto: productos[0],
        comanda: comandas[0],
      };
    });

    if (temperaturaActualizada.producto?.temperaturaOriginalEntrada !== 'ambiente') {
      throw new Error(`La temperatura del producto no se actualizó correctamente: ${JSON.stringify(temperaturaActualizada.producto)}`);
    }

    if (temperaturaActualizada.comanda?.items?.[0]?.temperaturaOriginalEntrada !== 'ambiente') {
      throw new Error(`La comanda no reflejó la nueva temperatura del producto: ${JSON.stringify(temperaturaActualizada.comanda)}`);
    }

    const formatoEtiquetas = await page.evaluate(async () => {
      const { formatComandaTemperatureGroup } = await import('/src/app/utils/comandaTemperature.ts');

      return {
        refrigerado: formatComandaTemperatureGroup('Réfrigéré'),
        congelado: formatComandaTemperatureGroup('Congelé'),
        ambiente: formatComandaTemperatureGroup('Température ambiante'),
      };
    });

    if (formatoEtiquetas.refrigerado !== 'Réfrigéré' || formatoEtiquetas.congelado !== 'Congelé' || formatoEtiquetas.ambiente !== 'Température ambiante') {
      throw new Error(`La normalización de etiquetas francesas falló: ${JSON.stringify(formatoEtiquetas)}`);
    }

    console.log('ENTRADA_PRODUCTO_SYNC_FUNCTIONAL_OK');
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error('ENTRADA_PRODUCTO_SYNC_FUNCTIONAL_ERROR');
  console.error(error && error.stack ? error.stack : error);
  process.exit(1);
});