import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatBrandingContactLine, getStoredBrandingPrintConfig } from './brandingPrint';

// Configuración de colores del sistema
const COLORS = {
  primary: [30, 115, 190], // #1E73BE
  success: [76, 175, 80],  // #4CAF50
  warning: [255, 193, 7],  // #FFC107
  danger: [220, 53, 69],   // #DC3545
  gray: [51, 51, 51],      // #333333
  lightGray: [244, 244, 244], // #F4F4F4
};

const PDF_HEADER_BOTTOM_Y = 58;

// Función auxiliar para agregar encabezado
function agregarEncabezado(doc: jsPDF, titulo: string, subtitulo?: string) {
  const brandingPrint = getStoredBrandingPrintConfig();
  const brandingContactLine = formatBrandingContactLine(brandingPrint);
  const titleY = brandingContactLine ? 36 : 35;
  const subtitleY = brandingContactLine ? 45 : 45;
  const dividerY = brandingContactLine ? 52 : 50;

  // Logo/Marca
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.primary);
  doc.text(brandingPrint.systemName, 20, 20);

  if (brandingContactLine) {
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(brandingContactLine, 20, 27);
  }

  // Título del reporte
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.gray);
  doc.text(titulo, 20, titleY);

  // Subtítulo/Fecha
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const fecha = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(subtitulo || `Generado: ${fecha}`, 20, subtitleY);

  // Línea separadora
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(20, dividerY, doc.internal.pageSize.width - 20, dividerY);
}

// Función auxiliar para agregar pie de página
function agregarPieDePagina(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);

    // Número de página
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );

    // Texto adicional
    doc.text(
      'Documento generado automáticamente',
      20,
      doc.internal.pageSize.height - 10
    );

    doc.text(
      new Date().toLocaleDateString('es-ES'),
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
  }
}

function getInventarioPesoKg(producto: any): number {
  if (typeof producto?.pesoRegistrado === 'number' && Number.isFinite(producto.pesoRegistrado) && producto.pesoRegistrado > 0) {
    return producto.pesoRegistrado;
  }

  if (producto?.unidad === 'kg') {
    return Number(producto?.stockActual || 0);
  }

  const pesoUnitario = Number(producto?.pesoUnitario ?? producto?.peso ?? 0);
  const stockActual = Number(producto?.stockActual ?? 0);
  return pesoUnitario > 0 ? pesoUnitario * stockActual : stockActual;
}

function formatCurrencyCompact(value: number): string {
  return `CAD$ ${value.toFixed(0)}`;
}

// ===== EXPORTACIONES ESPECÍFICAS =====

/**
 * Exportar reporte de inventario a PDF
 */
export function exportarInventarioPDF(productos: any[], nombreArchivo?: string) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const totalStock = productos.reduce((sum, producto) => sum + Number(producto?.stockActual || 0), 0);
  const totalPeso = productos.reduce((sum, producto) => sum + getInventarioPesoKg(producto), 0);
  const totalValor = productos.reduce((sum, producto) => sum + Number(producto?.valorTotal || 0), 0);
  const lowStock = productos.filter((producto) => Number(producto?.stockActual || 0) <= Number(producto?.stockMinimo || 0)).length;
  const resumenCategorias = Array.from(
    productos.reduce((mapa, producto) => {
      const categoria = producto?.categoria || 'Sans catégorie';
      mapa.set(categoria, (mapa.get(categoria) || 0) + getInventarioPesoKg(producto));
      return mapa;
    }, new Map<string, number>())
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 6)
    .map(([categoria, peso]) => [categoria, `${peso.toFixed(1)} kg`]);

  agregarEncabezado(doc, 'Rapport d\'inventaire compact', `Total de produits: ${productos.length}`);

  doc.setFontSize(9);
  doc.setTextColor(...COLORS.gray);
  doc.text('Modèle 1: Synthèse compacte', 20, 58);

  autoTable(doc, {
    startY: 62,
    theme: 'grid',
    head: [['Produits', 'Stock total', 'Poids total', 'Valeur totale', 'Sous seuil']],
    body: [[
      String(productos.length),
      String(totalStock),
      `${totalPeso.toFixed(1)} kg`,
      formatCurrencyCompact(totalValor),
      String(lowStock),
    ]],
    styles: {
      fontSize: 9,
      cellPadding: 3,
      halign: 'center',
      font: 'helvetica',
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
      textColor: COLORS.gray,
    },
  });

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 6,
    theme: 'grid',
    head: [['Catégories dominantes', 'Volume']],
    body: resumenCategorias.length > 0 ? resumenCategorias : [['Aucune catégorie', '0 kg']],
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: COLORS.success,
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 35, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: COLORS.lightGray,
    },
  });

  doc.addPage('a4', 'landscape');
  agregarEncabezado(doc, 'Rapport d\'inventaire compact', 'Modèle 2: Détail complet condensé');

  const datos = productos.map((producto) => [
    producto?.codigo || 'N/A',
    producto?.nombre || 'Sans nom',
    producto?.categoria || 'N/A',
    producto?.subcategoria || 'N/A',
    `${Number(producto?.stockActual || 0)} ${producto?.unidad || ''}`.trim(),
    Number(producto?.stockMinimo || 0),
    `${getInventarioPesoKg(producto).toFixed(1)} kg`,
    producto?.ubicacion || 'N/A',
    producto?.lote || 'N/A',
    producto?.fechaVencimiento || 'N/A',
    producto?.temperaturaAlmacenamiento || producto?.temperatura || 'N/A',
    producto?.estado || 'Disponible',
    formatCurrencyCompact(Number(producto?.valorTotal || 0)),
  ]);

  autoTable(doc, {
    head: [['Code', 'Produit', 'Catégorie', 'Sous-catégorie', 'Stock', 'Min.', 'Poids', 'Emplacement', 'Lot', 'Venc.', 'Temp.', 'État', 'Valeur']],
    body: datos.length > 0 ? datos : [['N/A', 'Aucune donnée disponible.', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-']],
    startY: PDF_HEADER_BOTTOM_Y,
    theme: 'grid',
    margin: { top: PDF_HEADER_BOTTOM_Y, left: 10, right: 10 },
    styles: {
      fontSize: 6,
      cellPadding: 1.3,
      font: 'helvetica',
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
      fontSize: 7,
    },
    columnStyles: {
      0: { cellWidth: 14 },
      1: { cellWidth: 36 },
      2: { cellWidth: 20 },
      3: { cellWidth: 22 },
      4: { cellWidth: 17, halign: 'center' },
      5: { cellWidth: 10, halign: 'center' },
      6: { cellWidth: 16, halign: 'right' },
      7: { cellWidth: 22 },
      8: { cellWidth: 16 },
      9: { cellWidth: 17, halign: 'center' },
      10: { cellWidth: 17, halign: 'center' },
      11: { cellWidth: 14, halign: 'center' },
      12: { cellWidth: 16, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: COLORS.lightGray,
    },
    willDrawPage: (data) => {
      if (data.pageNumber > 1) {
        agregarEncabezado(doc, 'Rapport d\'inventaire compact', 'Modèle 2: Détail complet condensé');
      }
    },
  });

  agregarPieDePagina(doc);
  doc.save(nombreArchivo || `Inventario_compacto_${Date.now()}.pdf`);
}

/**
 * Exportar reporte de comandas a PDF
 */
export function exportarComandasPDF(comandas: any[]) {
  const doc = new jsPDF();

  agregarEncabezado(doc, 'Reporte de Comandas', `Total de comandas: ${comandas.length}`);

  const datos = comandas.map((c) => [
    c.numero,
    c.organismo?.nombre || 'N/A',
    c.modalidadDistribucionLabel || 'Standard',
    new Date(c.fecha).toLocaleDateString('es-ES'),
    `${c.productos?.length || 0} items`,
    c.valorTotal ? `$${c.valorTotal.toFixed(2)}` : 'N/A',
    c.estado,
  ]);

  autoTable(doc, {
    head: [['N° Comanda', 'Organismo', 'Modalité', 'Fecha', 'Productos', 'Valor', 'Estado']],
    body: datos,
    startY: 55,
    theme: 'grid',
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 40 },
      2: { cellWidth: 24, halign: 'center' },
      3: { cellWidth: 26 },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 24, halign: 'right' },
      6: { cellWidth: 28, halign: 'center' },
    },
  });

  agregarPieDePagina(doc);
  doc.save(`Comandas_${Date.now()}.pdf`);
}

/**
 * Exportar reporte de organismos a PDF
 */
export function exportarOrganismosPDF(organismos: any[]) {
  const doc = new jsPDF();

  agregarEncabezado(doc, 'Reporte de Organismos', `Total: ${organismos.length} organismos`);

  const datos = organismos.map((o) => [
    o.nombre,
    o.tipo || 'N/A',
    o.beneficiarios || 0,
    o.contacto?.telefono || 'N/A',
    o.contacto?.email || 'N/A',
    o.activo ? 'Activo' : 'Inactivo',
  ]);

  autoTable(doc, {
    head: [['Nombre', 'Tipo', 'Beneficiarios', 'Teléfono', 'Email', 'Estado']],
    body: datos,
    startY: 55,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 35 },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 30 },
      4: { cellWidth: 40 },
      5: { cellWidth: 20, halign: 'center' },
    },
  });

  agregarPieDePagina(doc);
  doc.save(`Organismos_${Date.now()}.pdf`);
}

/**
 * Exportar estadísticas generales a PDF
 */
export function exportarEstadisticasPDF(datos: {
  totalProductos: number;
  totalStock: number;
  totalComandas: number;
  totalOrganismos: number;
  valorTotal: number;
  periodo: string;
}) {
  const doc = new jsPDF();

  agregarEncabezado(doc, 'Estadísticas Generales', `Período: ${datos.periodo}`);

  // Sección de métricas principales
  let y = 60;
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.gray);

  const metricas = [
    { label: 'Total de Productos', valor: datos.totalProductos, color: COLORS.primary },
    { label: 'Stock Total', valor: `${datos.totalStock} unidades`, color: COLORS.success },
    { label: 'Comandas Generadas', valor: datos.totalComandas, color: COLORS.warning },
    { label: 'Organismos Activos', valor: datos.totalOrganismos, color: COLORS.primary },
    { label: 'Valor Total Distribuido', valor: `$${datos.valorTotal.toFixed(2)}`, color: COLORS.success },
  ];

  metricas.forEach((metrica, index) => {
    // Fondo de color
    doc.setFillColor(...metrica.color);
    doc.rect(20, y, 170, 15, 'F');

    // Texto blanco
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(metrica.label, 25, y + 6);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(String(metrica.valor), 25, y + 12);
    doc.setFont('helvetica', 'normal');

    y += 20;
  });

  agregarPieDePagina(doc);
  doc.save(`Estadisticas_${Date.now()}.pdf`);
}

/**
 * Exportar reporte personalizado con gráficos (preparado para futuras mejoras)
 */
export function exportarReportePersonalizado(
  titulo: string,
  subtitulo: string,
  tablas: Array<{
    titulo: string;
    columnas: string[];
    datos: any[][];
  }>,
  nombreArchivo?: string
) {
  const doc = new jsPDF();

  agregarEncabezado(doc, titulo, subtitulo);

  let startY = 55;

  tablas.forEach((tabla, index) => {
    // Título de la sección
    if (index > 0) {
      startY += 15;
    }

    doc.setFontSize(11);
    doc.setTextColor(...COLORS.gray);
    doc.text(tabla.titulo, 20, startY);

    startY += 5;

    // Crear tabla
    autoTable(doc, {
      head: [tabla.columnas],
      body: tabla.datos,
      startY,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: COLORS.primary,
        textColor: 255,
        fontStyle: 'bold',
      },
    });

    startY = (doc as any).lastAutoTable.finalY + 5;
  });

  agregarPieDePagina(doc);
  doc.save(`${nombreArchivo || 'Reporte'}_${Date.now()}.pdf`);
}
