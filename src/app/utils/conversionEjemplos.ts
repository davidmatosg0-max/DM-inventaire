import { 
  RegistroConversion, 
  PlantillaConversion,
  guardarConversion,
  guardarPlantillaConversion,
  obtenerConversiones,
  obtenerPlantillasConversion
} from './conversionStorage';
import { crearProductosEjemplo } from './productosEjemplo';
import { obtenerProductos, actualizarProducto } from './productStorage';

/**
 * Crear ejemplos de conversiones de productos
 * Conversiones específicas de un producto a otro
 */
export function crearConversionesEjemplo() {
  const conversionesExistentes = obtenerConversiones();
  
  // Si ya hay conversiones, no crear ejemplos
  if (conversionesExistentes.length > 0) {
    console.log('Ya existen conversiones en el sistema');
    return;
  }

  // Asegurar que existen productos de ejemplo
  const productos = obtenerProductos();
  if (productos.length === 0) {
    console.log('Creando productos de ejemplo primero...');
    crearProductosEjemplo();
  }

  const ahora = new Date();
  const hace2Dias = new Date(ahora);
  hace2Dias.setDate(hace2Dias.getDate() - 2);
  
  const hace5Dias = new Date(ahora);
  hace5Dias.setDate(hace5Dias.getDate() - 5);
  
  const hace7Dias = new Date(ahora);
  hace7Dias.setDate(hace7Dias.getDate() - 7);
  
  const hace10Dias = new Date(ahora);
  hace10Dias.setDate(hace10Dias.getDate() - 10);

  const hace15Dias = new Date(ahora);
  hace15Dias.setDate(hace15Dias.getDate() - 15);

  const ejemplosConversiones: RegistroConversion[] = [
    // Ejemplo 1: Cereal 2kg → Cereal 3kg
    {
      id: 'conv-' + Date.now() + '-1',
      fecha: hace2Dias.toISOString(),
      productoOrigen: {
        productoId: 'prod-cereal-2kg',
        productoNombre: 'Céréales (Boîte 2kg)',
        cantidad: 40,
        unidad: 'boîtes'
      },
      productosDestino: [
        {
          productoId: 'prod-cereal-3kg',
          productoNombre: 'Céréales (Boîte 3kg)',
          cantidad: 26,
          unidad: 'boîtes'
        }
      ],
      merma: 2,
      mermaMotivo: 'Céréales abîmées lors du reconditionnement',
      observaciones: 'Reconditionnement pour optimiser l\'espace de stockage',
      usuarioId: 'user-1',
      revertida: false
    },

    // Ejemplo 2: Frutas variadas → Manzanas específicas
    {
      id: 'conv-' + Date.now() + '-2',
      fecha: hace5Dias.toISOString(),
      productoOrigen: {
        productoId: 'prod-frutas-variadas',
        productoNombre: 'Fruits Variés (PRS)',
        cantidad: 100,
        unidad: 'kg'
      },
      productosDestino: [
        {
          productoId: 'prod-manzanas',
          productoNombre: 'Pommes',
          cantidad: 92,
          unidad: 'kg'
        }
      ],
      merma: 8,
      mermaMotivo: 'Fruits abîmés et non-pommes retirés',
      observaciones: 'Tri et classification des fruits PRS - majoritairement des pommes',
      usuarioId: 'user-1',
      revertida: false
    },

    // Ejemplo 3: Frutas variadas → Múltiples frutas específicas
    {
      id: 'conv-' + Date.now() + '-3',
      fecha: hace7Dias.toISOString(),
      productoOrigen: {
        productoId: 'prod-frutas-variadas',
        productoNombre: 'Fruits Variés (PRS)',
        cantidad: 50,
        unidad: 'kg'
      },
      productosDestino: [
        {
          productoId: 'prod-manzanas',
          productoNombre: 'Pommes',
          cantidad: 22,
          unidad: 'kg'
        },
        {
          productoId: 'prod-bananas',
          productoNombre: 'Bananes',
          cantidad: 15,
          unidad: 'kg'
        },
        {
          productoId: 'prod-naranjas',
          productoNombre: 'Oranges',
          cantidad: 8,
          unidad: 'kg'
        }
      ],
      merma: 5,
      mermaMotivo: 'Fruits trop mûrs et abîmés',
      observaciones: 'Classification complète des fruits variés par type',
      usuarioId: 'user-2',
      revertida: false
    },

    // Ejemplo 4: Verduras variadas → Verduras específicas
    {
      id: 'conv-' + Date.now() + '-4',
      fecha: hace10Dias.toISOString(),
      productoOrigen: {
        productoId: 'prod-verduras-variadas',
        productoNombre: 'Légumes Variés (PRS)',
        cantidad: 80,
        unidad: 'kg'
      },
      productosDestino: [
        {
          productoId: 'prod-zanahorias',
          productoNombre: 'Carottes',
          cantidad: 35,
          unidad: 'kg'
        },
        {
          productoId: 'prod-papas',
          productoNombre: 'Pommes de terre',
          cantidad: 30,
          unidad: 'kg'
        },
        {
          productoId: 'prod-brocoli',
          productoNombre: 'Brocoli',
          cantidad: 10,
          unidad: 'kg'
        }
      ],
      merma: 5,
      mermaMotivo: 'Légumes non utilisables',
      observaciones: 'Tri de légumes PRS pour distribution ciblée',
      usuarioId: 'user-1',
      revertida: false
    },

    // Ejemplo 5: Arroz 25kg → Paquetes 1kg
    {
      id: 'conv-' + Date.now() + '-5',
      fecha: hace2Dias.toISOString(),
      productoOrigen: {
        productoId: 'prod-arroz-25kg',
        productoNombre: 'Riz (Sac 25kg)',
        cantidad: 5,
        unidad: 'sacs'
      },
      productosDestino: [
        {
          productoId: 'prod-arroz-1kg',
          productoNombre: 'Riz (Paquet 1kg)',
          cantidad: 123,
          unidad: 'paquets'
        }
      ],
      merma: 2,
      mermaMotivo: 'Perte lors du reconditionnement',
      observaciones: 'Reconditionnement pour portions familiales (5 sacs × 25kg = 125kg → 123 paquets)',
      usuarioId: 'user-2',
      revertida: false
    },

    // Ejemplo 6: Pasta 5kg → Paquetes 500g
    {
      id: 'conv-' + Date.now() + '-6',
      fecha: hace5Dias.toISOString(),
      productoOrigen: {
        productoId: 'prod-pasta-5kg',
        productoNombre: 'Pâtes (Sac 5kg)',
        cantidad: 10,
        unidad: 'sacs'
      },
      productosDestino: [
        {
          productoId: 'prod-pasta-500g',
          productoNombre: 'Pâtes (Paquet 500g)',
          cantidad: 99,
          unidad: 'paquets'
        }
      ],
      merma: 0.5,
      mermaMotivo: 'Perte minime lors du conditionnement',
      observaciones: 'Reconditionnement pâtes pour distribution (10 sacs × 5kg = 50kg → 99 paquets)',
      usuarioId: 'user-1',
      revertida: false
    },

    // Ejemplo 7: Conservas variadas → Conservas específicas
    {
      id: 'conv-' + Date.now() + '-7',
      fecha: hace7Dias.toISOString(),
      productoOrigen: {
        productoId: 'prod-conservas-variadas',
        productoNombre: 'Conserves Variées',
        cantidad: 60,
        unidad: 'boîtes'
      },
      productosDestino: [
        {
          productoId: 'prod-conserva-tomate',
          productoNombre: 'Conserve de Tomate',
          cantidad: 25,
          unidad: 'boîtes'
        },
        {
          productoId: 'prod-conserva-mais',
          productoNombre: 'Conserve de Maïs',
          cantidad: 20,
          unidad: 'boîtes'
        },
        {
          productoId: 'prod-conserva-haricots',
          productoNombre: 'Conserve de Haricots',
          cantidad: 15,
          unidad: 'boîtes'
        }
      ],
      merma: 0,
      mermaMotivo: '',
      observaciones: 'Classification des conserves par type pour faciliter la distribution',
      usuarioId: 'user-2',
      revertida: false
    },

    // Ejemplo 8: Leche en polvo 25kg → Paquetes 1kg
    {
      id: 'conv-' + Date.now() + '-8',
      fecha: hace10Dias.toISOString(),
      productoOrigen: {
        productoId: 'prod-leche-25kg',
        productoNombre: 'Lait en poudre (Sac 25kg)',
        cantidad: 3,
        unidad: 'sacs'
      },
      productosDestino: [
        {
          productoId: 'prod-leche-1kg',
          productoNombre: 'Lait en poudre (Paquet 1kg)',
          cantidad: 72,
          unidad: 'paquets'
        }
      ],
      merma: 3,
      mermaMotivo: 'Perte lors du reconditionnement et humidité',
      observaciones: 'Reconditionnement lait en poudre (3 sacs × 25kg = 75kg → 72 paquets)',
      usuarioId: 'user-1',
      revertida: false
    },

    // Ejemplo 9: Cereal 2kg → Paquetes pequeños 500g
    {
      id: 'conv-' + Date.now() + '-9',
      fecha: hace15Dias.toISOString(),
      productoOrigen: {
        productoId: 'prod-cereal-2kg',
        productoNombre: 'Céréales (Boîte 2kg)',
        cantidad: 10,
        unidad: 'boîtes'
      },
      productosDestino: [
        {
          productoId: 'prod-cereal-500g',
          productoNombre: 'Céréales (Paquet 500g)',
          cantidad: 39,
          unidad: 'paquets'
        }
      ],
      merma: 0.5,
      mermaMotivo: 'Miettes lors du reconditionnement',
      observaciones: 'Reconditionnement en portions individuelles (10 × 2kg = 20kg → 39 paquets)',
      usuarioId: 'user-2',
      revertida: false
    },

    // Ejemplo 10: Conversión REVERTIDA - Verduras mal clasificadas
    {
      id: 'conv-' + Date.now() + '-10',
      fecha: hace15Dias.toISOString(),
      productoOrigen: {
        productoId: 'prod-verduras-variadas',
        productoNombre: 'Légumes Variés (PRS)',
        cantidad: 40,
        unidad: 'kg'
      },
      productosDestino: [
        {
          productoId: 'prod-zanahorias',
          productoNombre: 'Carottes',
          cantidad: 38,
          unidad: 'kg'
        }
      ],
      merma: 2,
      mermaMotivo: 'Légumes abîmés',
      observaciones: 'REVERTIDA - Erreur de classification, mélange détecté',
      usuarioId: 'user-1',
      revertida: true,
      fechaReversion: hace10Dias.toISOString()
    }
  ];

  // Guardar cada conversión y actualizar stock de productos
  ejemplosConversiones.forEach(conversion => {
    guardarConversion(conversion);
    
    // Actualizar stock de productos (solo para conversiones no revertidas)
    if (!conversion.revertida) {
      // Obtener productos actuales
      const productos = obtenerProductos();
      
      // Reducir stock del producto origen
      const productoOrigen = productos.find(p => p.id === conversion.productoOrigen.productoId);
      if (productoOrigen) {
        const nuevoStock = productoOrigen.stockActual - conversion.productoOrigen.cantidad;
        actualizarProducto(productoOrigen.id, {
          ...productoOrigen,
          stockActual: Math.max(0, nuevoStock)
        });
      }
      
      // Aumentar stock de productos destino
      conversion.productosDestino.forEach(destino => {
        const productoDestino = productos.find(p => p.id === destino.productoId);
        if (productoDestino) {
          actualizarProducto(productoDestino.id, {
            ...productoDestino,
            stockActual: productoDestino.stockActual + destino.cantidad
          });
        }
      });
    }
  });

  console.log(`✅ ${ejemplosConversiones.length} conversions d'exemple créées avec succès`);
}

/**
 * Crear plantillas de conversión reutilizables
 */
export function crearPlantillasConversionEjemplo() {
  const plantillasExistentes = obtenerPlantillasConversion();
  
  // Si ya hay plantillas, no crear ejemplos
  if (plantillasExistentes.length > 0) {
    console.log('Ya existen plantillas de conversión en el sistema');
    return;
  }

  const plantillasEjemplo: PlantillaConversion[] = [
    // Plantilla 1: Cereal 2kg → Cereal 3kg
    {
      id: 'plantilla-' + Date.now() + '-1',
      nombre: 'Céréales 2kg → 3kg',
      descripcion: 'Reconditionnement de céréales 2kg vers boîtes de 3kg',
      productoOrigenId: 'prod-cereal-2kg',
      configuracion: [
        {
          productoDestinoId: 'prod-cereal-3kg',
          productoDestinoNombre: 'Céréales (Boîte 3kg)',
          ratio: 0.65 // 40 boîtes de 2kg (80kg) → ~26 boîtes de 3kg (78kg)
        }
      ],
      mermaEsperada: 2.5,
      icono: '🥣',
      activa: true,
      fechaCreacion: new Date().toISOString(),
      vecesUsada: 0
    },

    // Plantilla 2: Frutas variadas → Manzanas
    {
      id: 'plantilla-' + Date.now() + '-2',
      nombre: 'Fruits variés → Pommes',
      descripcion: 'Tri et classification de fruits PRS en pommes',
      productoOrigenId: 'prod-frutas-variadas',
      configuracion: [
        {
          productoDestinoId: 'prod-manzanas',
          productoDestinoNombre: 'Pommes',
          ratio: 0.92 // 100kg fruits → ~92kg pommes
        }
      ],
      mermaEsperada: 8,
      icono: '🍎',
      activa: true,
      fechaCreacion: new Date().toISOString(),
      vecesUsada: 0
    },

    // Plantilla 3: Frutas variadas → Mix de frutas
    {
      id: 'plantilla-' + Date.now() + '-3',
      nombre: 'Fruits variés → Classification',
      descripcion: 'Classification complète des fruits variés',
      productoOrigenId: 'prod-frutas-variadas',
      configuracion: [
        {
          productoDestinoId: 'prod-manzanas',
          productoDestinoNombre: 'Pommes',
          ratio: 0.44 // 44% pommes
        },
        {
          productoDestinoId: 'prod-bananas',
          productoDestinoNombre: 'Bananes',
          ratio: 0.30 // 30% bananes
        },
        {
          productoDestinoId: 'prod-naranjas',
          productoDestinoNombre: 'Oranges',
          ratio: 0.16 // 16% oranges
        }
      ],
      mermaEsperada: 10,
      icono: '🍎',
      activa: true,
      fechaCreacion: new Date().toISOString(),
      vecesUsada: 0
    },

    // Plantilla 4: Verduras variadas → Mix de verduras
    {
      id: 'plantilla-' + Date.now() + '-4',
      nombre: 'Légumes variés → Classification',
      descripcion: 'Tri des légumes PRS par type',
      productoOrigenId: 'prod-verduras-variadas',
      configuracion: [
        {
          productoDestinoId: 'prod-zanahorias',
          productoDestinoNombre: 'Carottes',
          ratio: 0.44 // 44% carottes
        },
        {
          productoDestinoId: 'prod-papas',
          productoDestinoNombre: 'Pommes de terre',
          ratio: 0.38 // 38% pommes de terre
        },
        {
          productoDestinoId: 'prod-brocoli',
          productoDestinoNombre: 'Brocoli',
          ratio: 0.12 // 12% brocoli
        }
      ],
      mermaEsperada: 6,
      icono: '🥬',
      activa: true,
      fechaCreacion: new Date().toISOString(),
      vecesUsada: 0
    },

    // Plantilla 5: Arroz 25kg → Paquetes 1kg
    {
      id: 'plantilla-' + Date.now() + '-5',
      nombre: 'Riz 25kg → Paquets 1kg',
      descripcion: 'Reconditionnement riz en portions familiales',
      productoOrigenId: 'prod-arroz-25kg',
      configuracion: [
        {
          productoDestinoId: 'prod-arroz-1kg',
          productoDestinoNombre: 'Riz (Paquet 1kg)',
          ratio: 24.6 // 1 sac de 25kg → ~24.6 paquets de 1kg
        }
      ],
      mermaEsperada: 1.6,
      icono: '🍚',
      activa: true,
      fechaCreacion: new Date().toISOString(),
      vecesUsada: 0
    },

    // Plantilla 6: Pasta 5kg → Paquetes 500g
    {
      id: 'plantilla-' + Date.now() + '-6',
      nombre: 'Pâtes 5kg → Paquets 500g',
      descripcion: 'Reconditionnement pâtes pour distribution',
      productoOrigenId: 'prod-pasta-5kg',
      configuracion: [
        {
          productoDestinoId: 'prod-pasta-500g',
          productoDestinoNombre: 'Pâtes (Paquet 500g)',
          ratio: 9.9 // 1 sac de 5kg → ~9.9 paquets de 500g
        }
      ],
      mermaEsperada: 1,
      icono: '🍝',
      activa: true,
      fechaCreacion: new Date().toISOString(),
      vecesUsada: 0
    },

    // Plantilla 7: Conservas variadas → Classification
    {
      id: 'plantilla-' + Date.now() + '-7',
      nombre: 'Conserves → Classification',
      descripcion: 'Classification des conserves variées par type',
      productoOrigenId: 'prod-conservas-variadas',
      configuracion: [
        {
          productoDestinoId: 'prod-conserva-tomate',
          productoDestinoNombre: 'Conserve de Tomate',
          ratio: 0.42 // 42% tomates
        },
        {
          productoDestinoId: 'prod-conserva-mais',
          productoDestinoNombre: 'Conserve de Maïs',
          ratio: 0.33 // 33% maïs
        },
        {
          productoDestinoId: 'prod-conserva-haricots',
          productoDestinoNombre: 'Conserve de Haricots',
          ratio: 0.25 // 25% haricots
        }
      ],
      mermaEsperada: 0,
      icono: '🥫',
      activa: true,
      fechaCreacion: new Date().toISOString(),
      vecesUsada: 0
    },

    // Plantilla 8: Leche en polvo 25kg → Paquetes 1kg
    {
      id: 'plantilla-' + Date.now() + '-8',
      nombre: 'Lait poudre 25kg → Paquets 1kg',
      descripcion: 'Reconditionnement lait en poudre',
      productoOrigenId: 'prod-leche-25kg',
      configuracion: [
        {
          productoDestinoId: 'prod-leche-1kg',
          productoDestinoNombre: 'Lait en poudre (Paquet 1kg)',
          ratio: 24 // 1 sac de 25kg → 24 paquets de 1kg
        }
      ],
      mermaEsperada: 4,
      icono: '🥛',
      activa: true,
      fechaCreacion: new Date().toISOString(),
      vecesUsada: 0
    },

    // Plantilla 9: Cereal 2kg → Paquetes 500g
    {
      id: 'plantilla-' + Date.now() + '-9',
      nombre: 'Céréales 2kg → Paquets 500g',
      descripcion: 'Portions individuelles de céréales',
      productoOrigenId: 'prod-cereal-2kg',
      configuracion: [
        {
          productoDestinoId: 'prod-cereal-500g',
          productoDestinoNombre: 'Céréales (Paquet 500g)',
          ratio: 3.9 // 1 boîte de 2kg → ~3.9 paquets de 500g
        }
      ],
      mermaEsperada: 2.5,
      icono: '🥣',
      activa: true,
      fechaCreacion: new Date().toISOString(),
      vecesUsada: 0
    }
  ];

  // Guardar cada plantilla
  plantillasEjemplo.forEach(plantilla => {
    guardarPlantillaConversion(plantilla);
  });

  console.log(`✅ ${plantillasEjemplo.length} modèles de conversion créés avec succès`);
}

/**
 * Función principal para crear todos los ejemplos
 */
export function inicializarEjemplosConversion() {
  console.log('🔄 Initialisation des exemples de conversion...');
  
  // Primero crear productos si no existen
  const productos = obtenerProductos();
  if (productos.length === 0) {
    console.log('📦 Création des produits d\'exemple...');
    crearProductosEjemplo();
  }
  
  // Luego crear conversiones y plantillas
  crearConversionesEjemplo();
  crearPlantillasConversionEjemplo();
  
  console.log('✅ Exemples de conversion initialisés');
}
