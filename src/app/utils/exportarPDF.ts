import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Configuración de colores del sistema
const COLORS = {
  primary: [30, 115, 190], // #1E73BE
  success: [76, 175, 80],  // #4CAF50
  warning: [255, 193, 7],  // #FFC107
  danger: [220, 53, 69],   // #DC3545
  gray: [51, 51, 51],      // #333333
  lightGray: [244, 244, 244], // #F4F4F4
};

// Función auxiliar para agregar encabezado
function agregarEncabezado(doc: jsPDF, titulo: string, subtitulo?: string) {
  // Logo/Marca
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.primary);
  doc.text('Banque Alimentaire', 20, 20);

  // Título del reporte
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.gray);
  doc.text(titulo, 20, 35);

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
  doc.text(subtitulo || `Generado: ${fecha}`, 20, 45);

  // Línea separadora
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(20, 50, doc.internal.pageSize.width - 20, 50);
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

// ===== EXPORTACIONES ESPECÍFICAS =====

/**
 * Exportar reporte de inventario a PDF
 */
export function exportarInventarioPDF(productos: any[]) {
  const doc = new jsPDF();

  agregarEncabezado(doc, 'Reporte de Inventario', `Total de productos: ${productos.length}`);

  // Preparar datos
  const datos = productos.map((p) => [
    p.codigo || 'N/A',
    p.nombre,
    p.categoria,
    p.subcategoria || 'N/A',
    `${p.stockActual} ${p.unidad}`,
    p.stockMinimo,
    p.ubicacion || 'N/A',
    p.estado || 'Disponible',
  ]);

  // Crear tabla
  autoTable(doc, {
    head: [['Código', 'Producto', 'Categoría', 'Subcategoría', 'Stock', 'Mín.', 'Ubicación', 'Estado']],
    body: datos,
    startY: 55,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 3,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: COLORS.primary,
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 40 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 25 },
      7: { cellWidth: 20, halign: 'center' },
    },
    alternateRowStyles: {
      fillColor: COLORS.lightGray,
    },
  });

  agregarPieDePagina(doc);

  // Descargar
  doc.save(`Inventario_${Date.now()}.pdf`);
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
    new Date(c.fecha).toLocaleDateString('es-ES'),
    `${c.productos?.length || 0} items`,
    c.valorTotal ? `$${c.valorTotal.toFixed(2)}` : 'N/A',
    c.estado,
  ]);

  autoTable(doc, {
    head: [['N° Comanda', 'Organismo', 'Fecha', 'Productos', 'Valor', 'Estado']],
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
      1: { cellWidth: 50 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25, halign: 'center' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 30, halign: 'center' },
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
