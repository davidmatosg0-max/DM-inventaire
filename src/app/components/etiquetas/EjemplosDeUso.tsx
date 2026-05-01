/**
 * EJEMPLO DE USO - Etiqueta Estandarizada de Producto
 * 
 * Este archivo muestra cómo usar la etiqueta estandarizada en cualquier módulo
 */

import { printStandardLabel, type ProductLabelData } from './etiquetas/StandardProductLabel';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

/**
 * EJEMPLO 1: Uso Básico (sin traducciones)
 */
export async function imprimirEtiquetaBasica() {
  const labelData: ProductLabelData = {
    id: 'ENT-1234567890',
    nombreProducto: 'Manzanas Rojas',
    productoIcono: '🍎',
    categoria: 'Fruits et Légumes',
    subcategoria: 'Pommes',
    cantidad: 150,
    unidad: 'kg',
    pesoTotal: 150.00,
    temperatura: 'refrigerado',
    lote: 'LOT-2026-02',
    fechaCaducidad: '2026-03-15',
    programa: 'Donation Carrefour',
    programaIcono: '🏪',
    donadorNombre: 'Carrefour Montréal'
  };

  try {
    await printStandardLabel(labelData);
  } catch (err) {
    console.error('Error:', err);
  }
}

/**
 * EJEMPLO 2: Con Traducciones i18n
 */
export function EjemploConTraduciones() {
  const { t } = useTranslation();

  const handleImprimir = async () => {
    const labelData: ProductLabelData = {
      id: 'ENT-' + Date.now(),
      nombreProducto: 'Oranges',
      productoIcono: '🍊',
      categoria: 'Fruits et Légumes',
      subcategoria: 'Oranges',
      cantidad: 300,
      unidad: 'CJA',
      pesoTotal: 6000.00,
      pesoUnidad: 20.00,
      temperatura: 'refrigerado',
      lote: '222222',
      fechaCaducidad: '2026-02-19',
      programa: 'Walmart Supercentre',
      programaIcono: '🏢',
      programaColor: '#1E73BE',
      donadorNombre: 'Walmart Supercentre',
      fechaEntrada: new Date().toISOString(),
      translations: {
        foodBank: t('common.foodBank'),
        productLabel: t('common.productLabel'),
        quantity: t('common.amount'),
        temperature: t('common.temperature'),
        lot: t('common.lot'),
        expiryDate: t('common.expiryDate'),
        weight: t('common.weight'),
        program: t('common.program'),
        entryDate: t('common.entryDate'),
        systemFooter: t('common.inventoryManagementSystem'),
        ambient: t('common.ambient'),
        refrigerated: t('common.refrigerated'),
        frozen: t('common.frozen'),
      }
    };

    try {
      await printStandardLabel(labelData);
      toast.success(t('common.printSuccess') || 'Étiquette imprimée avec succès');
    } catch (err) {
      console.error('Error al imprimir:', err);
      toast.error(t('common.printError') || 'Erreur lors de l\'impression');
    }
  };

  return (
    <button onClick={handleImprimir}>
      🖨️ Imprimer l'étiquette
    </button>
  );
}

/**
 * EJEMPLO 3: Desde un Formulario de Entrada
 */
export function EjemploFormularioEntrada() {
  const { t } = useTranslation();

  const handleSubmitWithPrint = async (formData: any) => {
    // 1. Guardar entrada en base de datos
    // ... código de guardado ...

    // 2. Si el usuario marcó "imprimir automáticamente"
    if (formData.imprimirAutomaticamente) {
      const labelData: ProductLabelData = {
        id: formData.entradaId,
        nombreProducto: formData.nombreProducto,
        productoIcono: formData.productoIcono,
        categoria: formData.categoria,
        subcategoria: formData.subcategoria,
        cantidad: formData.cantidad,
        unidad: formData.unidad,
        pesoTotal: formData.cantidad * formData.pesoUnidad,
        pesoUnidad: formData.pesoUnidad,
        temperatura: formData.temperatura,
        lote: formData.lote,
        fechaCaducidad: formData.fechaCaducidad,
        programa: formData.programaNombre,
        programaIcono: formData.programaIcono,
        donadorNombre: formData.donadorNombre,
        fechaEntrada: new Date().toISOString(),
        translations: {
          foodBank: t('common.foodBank'),
          productLabel: t('common.productLabel'),
          quantity: t('common.amount'),
          temperature: t('common.temperature'),
          lot: t('common.lot'),
          expiryDate: t('common.expiryDate'),
          weight: t('common.weight'),
          program: t('common.program'),
          entryDate: t('common.entryDate'),
          systemFooter: t('common.inventoryManagementSystem'),
          ambient: t('common.ambient'),
          refrigerated: t('common.refrigerated'),
          frozen: t('common.frozen'),
        }
      };

      try {
        await printStandardLabel(labelData);
      } catch (err) {
        toast.error('La entrada se guardó pero hubo un error al imprimir la etiqueta');
      }
    }
  };
}

/**
 * EJEMPLO 4: Reimpresión desde Historial
 */
export function EjemploReimpresion() {
  const { t } = useTranslation();

  const handleReimprimir = async (entrada: any) => {
    const labelData: ProductLabelData = {
      id: entrada.id,
      nombreProducto: entrada.nombreProducto,
      productoIcono: entrada.productoIcono,
      categoria: entrada.categoria,
      subcategoria: entrada.subcategoria,
      cantidad: entrada.cantidad,
      unidad: entrada.unidad,
      pesoTotal: entrada.pesoTotal,
      pesoUnidad: entrada.pesoUnidad,
      temperatura: entrada.temperatura as 'ambiente' | 'refrigerado' | 'congelado',
      lote: entrada.lote,
      fechaCaducidad: entrada.fechaCaducidad,
      programa: entrada.programaNombre,
      programaIcono: entrada.programaIcono,
      programaColor: entrada.programaColor,
      donadorNombre: entrada.donadorNombre,
      fechaEntrada: entrada.fechaEntrada,
      translations: {
        foodBank: 'BANQUE ALIMENTAIRE',
        productLabel: 'Étiquette du Produit',
        quantity: 'QUANTITÉ',
        temperature: 'TEMPÉRATURE',
        lot: 'LOT',
        expiryDate: "DATE D'EXPIRATION",
        weight: 'POIDS',
        program: 'PROGRAMME',
        entryDate: "DATE D'ENTRÉE",
        systemFooter: 'Système de Gestion des Stocks',
        ambient: 'Ambiant',
        refrigerated: 'Réfrigéré',
        frozen: 'Congelé',
      }
    };

    try {
      await printStandardLabel(labelData);
      toast.success('Étiquette réimprimée avec succès');
    } catch (err) {
      console.error('Error al reimprimir:', err);
      toast.error('Erreur lors de la réimpression');
    }
  };

  return (
    <button onClick={() => handleReimprimir(entrada)}>
      🔄 Réimprimer l'étiquette
    </button>
  );
}

/**
 * EJEMPLO 5: Impresión en Lote
 */
export async function imprimirEtiquetasLote(entradas: any[]) {
  const { t } = useTranslation();

  for (const entrada of entradas) {
    const labelData: ProductLabelData = {
      id: entrada.id,
      nombreProducto: entrada.nombreProducto,
      productoIcono: entrada.productoIcono,
      categoria: entrada.categoria,
      subcategoria: entrada.subcategoria,
      cantidad: entrada.cantidad,
      unidad: entrada.unidad,
      pesoTotal: entrada.pesoTotal,
      temperatura: entrada.temperatura,
      lote: entrada.lote,
      fechaCaducidad: entrada.fechaCaducidad,
      programa: entrada.programaNombre,
      donadorNombre: entrada.donadorNombre,
      translations: {
        foodBank: t('common.foodBank'),
        productLabel: t('common.productLabel'),
        quantity: t('common.amount'),
        temperature: t('common.temperature'),
        lot: t('common.lot'),
        expiryDate: t('common.expiryDate'),
        weight: t('common.weight'),
        program: t('common.program'),
        entryDate: t('common.entryDate'),
        systemFooter: t('common.inventoryManagementSystem'),
        ambient: t('common.ambient'),
        refrigerated: t('common.refrigerated'),
        frozen: t('common.frozen'),
      }
    };

    try {
      await printStandardLabel(labelData);
      // Esperar 1 segundo entre impresiones para no saturar
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`Error imprimiendo entrada ${entrada.id}:`, err);
    }
  }

  toast.success(`${entradas.length} étiquettes imprimées`);
}

/**
 * NOTAS IMPORTANTES:
 * 
 * 1. Siempre usar await con printStandardLabel()
 * 2. Envolver en try-catch para manejar errores
 * 3. Usar traducciones desde i18n para soporte multiidioma
 * 4. El QR Code se genera automáticamente
 * 5. Los campos opcionales (lote, fechaCaducidad) se pueden omitir
 * 6. temperatura debe ser exactamente: 'ambiente' | 'refrigerado' | 'congelado'
 * 7. pesoTotal debe estar en kilogramos (kg)
 * 8. Los iconos deben ser emojis Unicode o strings HTML
 */
