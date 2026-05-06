/**
 * Utilidades de Exportación Avanzada
 * 
 * Funciones para exportar datos a PDF, Excel, CSV y JSON
 * con soporte para gráficos, imágenes y tablas complejas.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { formatDate, formatCurrency, formatNumber } from './formatUtils';
import { createWorkbookFromRowSheets, saveWorkbook } from './excelWorkbook';

// ==================== TIPOS ====================

export interface ExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
  includeDate?: boolean;
  includeCharts?: boolean;
  logo?: string;
  orientation?: 'portrait' | 'landscape';
  pageSize?: 'a4' | 'letter' | 'legal';
}

export interface TableColumn {
  header: string;
  key: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => string;
}

export interface ChartElement {
  id: string;
  title?: string;
}

// ==================== EXPORTACIÓN A CSV ====================

/**
 * Exportar datos a CSV
 */
export async function exportToCSV(
  data: any[],
  columns: TableColumn[],
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = 'export.csv',
    includeDate = true
  } = options;

  // Crear encabezados
  const headers = columns.map(col => col.header);
  
  // Crear filas
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col.key];
      if (col.format) {
        return col.format(value);
      }
      return value !== null && value !== undefined ? String(value) : '';
    });
  });

  // Combinar encabezados y filas
  const csvData = [headers, ...rows];
  
  // Agregar fecha si se solicita
  if (includeDate) {
    csvData.unshift([`Generado el ${formatDate(new Date())}`]);
    csvData.unshift([]);
  }

  // Convertir a string CSV
  const csvString = csvData
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  // Crear blob y descargar
  const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

// ==================== EXPORTACIÓN A JSON ====================

/**
 * Exportar datos a JSON
 */
export async function exportToJSON(
  data: any,
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = 'export.json',
    title = 'Exportación de Datos',
    includeDate = true
  } = options;

  // Crear objeto de exportación
  const exportData = {
    ...(includeDate && { generatedAt: new Date().toISOString() }),
    ...(title && { title }),
    data
  };

  // Convertir a JSON con formato
  const jsonString = JSON.stringify(exportData, null, 2);

  // Crear blob y descargar
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  saveAs(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
}

// ==================== EXPORTACIÓN A EXCEL ====================

/**
 * Exportar datos a Excel (XLSX)
 */
export async function exportToExcel(
  data: any[],
  columns: TableColumn[],
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = 'export.xlsx',
    title = 'Reporte',
    subtitle = '',
    includeDate = true
  } = options;

  // Preparar datos para Excel
  const worksheetData: any[][] = [];

  // Agregar título
  if (title) {
    worksheetData.push([title]);
    worksheetData.push([]);
  }

  // Agregar subtítulo
  if (subtitle) {
    worksheetData.push([subtitle]);
    worksheetData.push([]);
  }

  // Agregar fecha
  if (includeDate) {
    worksheetData.push([`Generado el ${formatDate(new Date())}`]);
    worksheetData.push([]);
  }

  // Agregar encabezados
  const headers = columns.map(col => col.header);
  worksheetData.push(headers);

  // Agregar datos
  data.forEach(row => {
    const rowData = columns.map(col => {
      const value = row[col.key];
      if (col.format) {
        return col.format(value);
      }
      return value !== null && value !== undefined ? value : '';
    });
    worksheetData.push(rowData);
  });

  const workbook = createWorkbookFromRowSheets([
    {
      name: 'Datos',
      rows: worksheetData,
    },
  ]);

  await saveWorkbook(workbook, filename);
}

// ==================== EXPORTACIÓN A PDF ====================

/**
 * Capturar gráfico como imagen
 */
type CapturedChart = {
  dataUrl: string;
  width: number;
  height: number;
};

async function captureChart(chartId: string): Promise<CapturedChart | null> {
  try {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
      console.warn(`Chart element with id "${chartId}" not found`);
      return null;
    }

    const canvas = await html2canvas(chartElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false
    });

    return {
      dataUrl: canvas.toDataURL('image/png'),
      width: canvas.width,
      height: canvas.height,
    };
  } catch (error) {
    console.error('Error capturing chart:', error);
    return null;
  }
}

/**
 * Exportar datos a PDF
 */
export async function exportToPDF(
  data: any[],
  columns: TableColumn[],
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = 'export.pdf',
    title = 'Reporte',
    subtitle = '',
    includeDate = true,
    includeCharts = false,
    logo = '',
    orientation = 'portrait',
    pageSize = 'a4'
  } = options;

  // Crear documento PDF
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Configurar fuentes
  doc.setFont('helvetica');

  // Agregar logo si existe
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', margin, yPosition, 30, 30);
      yPosition += 35;
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  // Agregar título
  if (title) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
  }

  // Agregar subtítulo
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
  }

  // Agregar fecha
  if (includeDate) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generado el ${formatDate(new Date())}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 12;
  }

  // Preparar datos de la tabla
  const headers = columns.map(col => col.header);
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col.key];
      if (col.format) {
        return col.format(value);
      }
      return value !== null && value !== undefined ? String(value) : '';
    });
  });

  // Agregar tabla
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: yPosition,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [26, 77, 122], // #1a4d7a
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: columns.reduce((acc, col, index) => {
      acc[index] = {
        halign: col.align || 'left',
        cellWidth: col.width ? (col.width / 10) : 'auto'
      };
      return acc;
    }, {} as any)
  });

  // Guardar PDF
  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

/**
 * Exportar con gráficos a PDF
 */
export async function exportToPDFWithCharts(
  data: any[],
  columns: TableColumn[],
  charts: ChartElement[],
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = 'export.pdf',
    title = 'Reporte',
    subtitle = '',
    includeDate = true,
    logo = '',
    orientation = 'portrait',
    pageSize = 'a4'
  } = options;

  // Crear documento PDF
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: pageSize
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Configurar fuentes
  doc.setFont('helvetica');

  // Agregar logo si existe
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', margin, yPosition, 30, 30);
      yPosition += 35;
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  // Agregar título
  if (title) {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
  }

  // Agregar subtítulo
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;
  }

  // Agregar fecha
  if (includeDate) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generado el ${formatDate(new Date())}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
  }

  // Capturar y agregar gráficos
  for (const chart of charts) {
    const chartImage = await captureChart(chart.id);
    
    if (chartImage) {
      const maxChartWidth = pageWidth - 2 * margin;
      const maxChartHeight = Math.min(pageHeight - (2 * margin) - 20, 110);
      const aspectRatio = chartImage.height > 0 ? chartImage.width / chartImage.height : 1;

      let chartWidth = maxChartWidth;
      let chartHeight = chartWidth / aspectRatio;

      if (chartHeight > maxChartHeight) {
        chartHeight = maxChartHeight;
        chartWidth = chartHeight * aspectRatio;
      }

      const requiredHeight = chartHeight + (chart.title ? 12 : 0) + 15;

      // Verificar si necesitamos una nueva página
      if (yPosition + requiredHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      // Agregar título del gráfico si existe
      if (chart.title) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(chart.title, margin, yPosition);
        yPosition += 8;
      }

      const chartX = margin + ((maxChartWidth - chartWidth) / 2);

      // Agregar gráfico conservando su proporción real
      doc.addImage(chartImage.dataUrl, 'PNG', chartX, yPosition, chartWidth, chartHeight);
      yPosition += chartHeight + 15;
    }
  }

  // Verificar si necesitamos una nueva página para la tabla
  if (yPosition + 40 > pageHeight - margin) {
    doc.addPage();
    yPosition = margin;
  }

  // Agregar separador
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Datos Detallados', margin, yPosition);
  yPosition += 10;

  // Preparar datos de la tabla
  const headers = columns.map(col => col.header);
  const rows = data.map(row => {
    return columns.map(col => {
      const value = row[col.key];
      if (col.format) {
        return col.format(value);
      }
      return value !== null && value !== undefined ? String(value) : '';
    });
  });

  // Agregar tabla
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: yPosition,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [26, 77, 122],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: columns.reduce((acc, col, index) => {
      acc[index] = {
        halign: col.align || 'left',
        cellWidth: col.width ? (col.width / 10) : 'auto'
      };
      return acc;
    }, {} as any)
  });

  // Guardar PDF
  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

// ==================== FUNCIONES HELPER ====================

/**
 * Detectar el mejor formato según los datos
 */
export function suggestExportFormat(dataSize: number): 'csv' | 'excel' | 'pdf' {
  if (dataSize < 100) {
    return 'pdf'; // Mejor para reportes pequeños
  } else if (dataSize < 1000) {
    return 'excel'; // Mejor para análisis
  } else {
    return 'csv'; // Mejor para grandes volúmenes
  }
}

/**
 * Validar datos antes de exportar
 */
export function validateExportData(data: any[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('Los datos deben ser un array');
    return { isValid: false, errors };
  }

  if (data.length === 0) {
    errors.push('No hay datos para exportar');
    return { isValid: false, errors };
  }

  return { isValid: true, errors: [] };
}

/**
 * Crear nombre de archivo con timestamp
 */
export function generateFilename(
  prefix: string,
  extension: string,
  includeTimestamp: boolean = true
): string {
  const timestamp = includeTimestamp
    ? new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    : '';
  
  const filename = includeTimestamp
    ? `${prefix}_${timestamp}.${extension}`
    : `${prefix}.${extension}`;

  return filename;
}

/**
 * Exportar datos automáticamente según formato
 */
export async function exportData(
  format: 'csv' | 'excel' | 'pdf' | 'json',
  data: any[],
  columns: TableColumn[],
  options: ExportOptions = {}
): Promise<void> {
  // Validar datos
  const validation = validateExportData(data);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  // Exportar según formato
  switch (format) {
    case 'csv':
      await exportToCSV(data, columns, options);
      break;
    case 'excel':
      await exportToExcel(data, columns, options);
      break;
    case 'pdf':
      await exportToPDF(data, columns, options);
      break;
    case 'json':
      await exportToJSON(data, options);
      break;
    default:
      throw new Error(`Formato no soportado: ${format}`);
  }
}

// ==================== PLANTILLAS PREDEFINIDAS ====================

/**
 * Columnas para reporte de inventario
 */
export const INVENTORY_COLUMNS: TableColumn[] = [
  { header: 'Código', key: 'code', width: 80, align: 'center' },
  { header: 'Producto', key: 'name', width: 150 },
  { header: 'Categoría', key: 'category', width: 100 },
  { header: 'Stock', key: 'stock', width: 60, align: 'right', format: (v) => formatNumber(v) },
  { header: 'Unidad', key: 'unit', width: 60, align: 'center' },
  { header: 'Peso (kg)', key: 'weight', width: 80, align: 'right', format: (v) => formatNumber(v, 2) },
  { header: 'Valor', key: 'value', width: 80, align: 'right', format: (v) => formatCurrency(v) }
];

/**
 * Columnas para reporte de pedidos
 */
export const ORDERS_COLUMNS: TableColumn[] = [
  { header: 'N° Pedido', key: 'orderNumber', width: 100, align: 'center' },
  { header: 'Organismo', key: 'organism', width: 150 },
  { header: 'Fecha', key: 'date', width: 90, format: (v) => formatDate(v) },
  { header: 'Estado', key: 'status', width: 90, align: 'center' },
  { header: 'Productos', key: 'productCount', width: 70, align: 'right' },
  { header: 'Peso Total', key: 'totalWeight', width: 90, align: 'right', format: (v) => `${formatNumber(v)} kg` },
  { header: 'Valor Total', key: 'totalValue', width: 90, align: 'right', format: (v) => formatCurrency(v) }
];

/**
 * Columnas para reporte de auditoría
 */
export const AUDIT_COLUMNS: TableColumn[] = [
  { header: 'Fecha/Hora', key: 'timestamp', width: 130, format: (v) => formatDate(v) },
  { header: 'Usuario', key: 'user', width: 100 },
  { header: 'Módulo', key: 'module', width: 100 },
  { header: 'Acción', key: 'action', width: 150 },
  { header: 'Estado', key: 'status', width: 70, align: 'center' },
  { header: 'Detalles', key: 'details', width: 200 }
];

/**
 * Columnas para reporte de organismos
 */
export const ORGANISMS_COLUMNS: TableColumn[] = [
  { header: 'Nombre', key: 'name', width: 150 },
  { header: 'Tipo', key: 'type', width: 100 },
  { header: 'Contacto', key: 'contact', width: 120 },
  { header: 'Teléfono', key: 'phone', width: 100 },
  { header: 'Email', key: 'email', width: 150 },
  { header: 'Estado', key: 'status', width: 80, align: 'center' }
];

// Exportar todo junto
export const ExportUtils = {
  toCSV: exportToCSV,
  toExcel: exportToExcel,
  toPDF: exportToPDF,
  toPDFWithCharts: exportToPDFWithCharts,
  toJSON: exportToJSON,
  auto: exportData,
  validate: validateExportData,
  suggestFormat: suggestExportFormat,
  generateFilename,
  templates: {
    inventory: INVENTORY_COLUMNS,
    orders: ORDERS_COLUMNS,
    audit: AUDIT_COLUMNS,
    organisms: ORGANISMS_COLUMNS
  }
};
